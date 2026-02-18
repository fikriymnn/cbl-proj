import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { WasteData, Option } from './types';
import SearchableSelect from './SearchableSelect';

const API_BASE = import.meta.env.VITE_API_LINK;

interface LKHProsesItem {
  id: number;
  id_jo: number;
  id_tahapan: number;
  id_operator: number;
  id_kode_produksi: number;
  kode: string;
  deskripsi: string;
  proses: string;
  status: string;
  waktu_mulai: string;
  waktu_selesai: string;
  total_waktu: string | number;
  operator: {
    id: number;
    nama: string;
    bagian: string;
  };
  tahapan: {
    id: number;
    nama_tahapan: string;
    kode_tahapan: string;
  };
  mesin: {
    id: number;
    nama_mesin: string;
    kode_mesin: string;
  };
}

interface WasteEntry {
  id_waste: string;
  id_kendala: string;
  total_qty: number;
  operatorQtys: {
    operator_id: number;
    operator_name: string;
    proses: string;
    qty: number;
  }[];
}

interface WasteModalProps {
  show: boolean;
  loading: boolean;
  selectedJO: { id: number; no_jo: string } | null;
  selectedTahapan: number | null;
  selectedMesin: string;
  userId: number | null;
  wasteKendalaList: WasteData[];
  onClose: () => void;
}

const WasteModal: React.FC<WasteModalProps> = ({
  show,
  loading: externalLoading,
  selectedJO,
  selectedTahapan,
  selectedMesin,
  userId,
  wasteKendalaList,
  onClose,
}) => {
  const [internalLoading, setInternalLoading] = useState(false);
  const [allLkhProses, setAllLkhProses] = useState<LKHProsesItem[]>([]);
  const [kendalaProses, setKendalaProses] = useState<LKHProsesItem[]>([]);

  // Grouped by tahapan
  const [groupedByTahapan, setGroupedByTahapan] = useState<{
    [tahapanId: number]: {
      tahapanName: string;
      items: LKHProsesItem[];
    };
  }>({});

  // Active waste form per tahapan
  const [activeWasteForm, setActiveWasteForm] = useState<{
    [tahapanId: number]: {
      showSelect: boolean;
      id_waste: string;
      id_kendala: string;
      operatorQtys: {
        operator_id: number;
        operator_name: string;
        proses: string;
        qty: number;
      }[];
      savedEntries: WasteEntry[];
    };
  }>({});

  const loading = externalLoading || internalLoading;

  const fetchLkhProses = useCallback(async () => {
    if (!selectedJO) return;
    setInternalLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/produksi/lkhProses`, {
        params: { id_jo: selectedJO.id },
        withCredentials: true,
      });
      const data: LKHProsesItem[] = response.data.data || [];
      setAllLkhProses(data);

      const kendala = data.filter((item) => item.proses === 'Kendala');
      setKendalaProses(kendala);

      // Group all by tahapan
      const grouped: typeof groupedByTahapan = {};
      data.forEach((item) => {
        const tid = item.id_tahapan;
        if (!grouped[tid]) {
          grouped[tid] = {
            tahapanName: item.tahapan?.nama_tahapan || `Tahapan ${tid}`,
            items: [],
          };
        }
        // Unique by operator_id only — one badge per person per tahapan
        const exists = grouped[tid].items.some(
          (i) => i.id_operator === item.id_operator,
        );
        if (!exists) grouped[tid].items.push(item);
      });
      setGroupedByTahapan(grouped);
    } catch (error) {
      console.error('Error fetching lkhProses:', error);
      toast.error('Gagal mengambil data proses LKH');
    } finally {
      setInternalLoading(false);
    }
  }, [selectedJO]);

  useEffect(() => {
    if (show && selectedJO) {
      fetchLkhProses();
    }
  }, [show, selectedJO, fetchLkhProses]);

  const formatDuration = (totalSeconds: number | string): string => {
    const seconds =
      typeof totalSeconds === 'string' ? parseInt(totalSeconds) : totalSeconds;
    if (isNaN(seconds) || seconds < 0) return '-';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h > 0 ? `${h}j` : '', m > 0 ? `${m}m` : '', `${s}s`]
      .filter(Boolean)
      .join(' ');
  };

  const getWasteOptions = (): Option[] =>
    wasteKendalaList.map((w) => ({
      value: String(w.id),
      label: `${w.kode} - ${w.deskripsi}`,
    }));

  const getKendalaOptions = (id_waste: string): Option[] => {
    if (!id_waste) return [];
    const waste = wasteKendalaList.find((w) => w.id === parseInt(id_waste));
    if (!waste) return [];
    return waste.kendala.map((k) => ({
      value: String(k.id),
      label: `${k.kode} - ${k.deskripsi}`,
    }));
  };

  // Determine responsible operators based on selected waste/kendala kode and tahapan
  // Priority: match kendala kode → match waste kode → all operators in tahapan
  const getResponsibleOperators = (
    tahapanId: number,
    wasteId: string,
    kendalaId: string,
  ): { operator_id: number; operator_name: string; proses: string }[] => {
    if (!kendalaId) return [];

    const kendalaIdNum = parseInt(kendalaId);
    const wasteIdNum = parseInt(wasteId);

    // Find kendala kode and waste kode
    let kendalaKode = '';
    let wasteKode = '';
    for (const waste of wasteKendalaList) {
      if (waste.id === wasteIdNum) wasteKode = waste.kode;
      const k = waste.kendala.find((kk) => kk.id === kendalaIdNum);
      if (k) kendalaKode = k.kode;
    }

    const tahapanProses = allLkhProses.filter(
      (item) => item.id_tahapan === tahapanId,
    );

    const dedupeByOperator = (items: LKHProsesItem[]) => {
      const unique: {
        [key: number]: {
          operator_id: number;
          operator_name: string;
          proses: string;
        };
      } = {};
      items.forEach((item) => {
        if (!unique[item.id_operator]) {
          unique[item.id_operator] = {
            operator_id: item.id_operator,
            operator_name:
              item.operator?.nama || `Operator ${item.id_operator}`,
            proses: item.proses,
          };
        }
      });
      return Object.values(unique);
    };

    // 1. Try matching by kendala kode against proses:'Kendala' entries
    const byKendalaKode = tahapanProses.filter(
      (item) =>
        item.proses === 'Kendala' && kendalaKode && item.kode === kendalaKode,
    );
    if (byKendalaKode.length > 0) return dedupeByOperator(byKendalaKode);

    // 2. Try matching by waste kode against proses:'Kendala' entries
    const byWasteKode = tahapanProses.filter(
      (item) =>
        item.proses === 'Kendala' && wasteKode && item.kode === wasteKode,
    );
    if (byWasteKode.length > 0) return dedupeByOperator(byWasteKode);

    // 3. No match — return all unique operators in this tahapan
    return dedupeByOperator(tahapanProses);
  };

  const handleSetWasteClick = (tahapanId: number) => {
    setActiveWasteForm((prev) => ({
      ...prev,
      [tahapanId]: {
        showSelect: true,
        id_waste: '',
        id_kendala: '',
        operatorQtys: [],
        savedEntries: prev[tahapanId]?.savedEntries || [],
      },
    }));
  };

  const handleWasteChange = (tahapanId: number, id_waste: string) => {
    setActiveWasteForm((prev) => ({
      ...prev,
      [tahapanId]: {
        ...prev[tahapanId],
        id_waste,
        id_kendala: '',
        operatorQtys: [],
      },
    }));
  };

  const handleKendalaChange = (tahapanId: number, id_kendala: string) => {
    const currentWasteId = activeWasteForm[tahapanId]?.id_waste || '';
    const operators = getResponsibleOperators(
      tahapanId,
      currentWasteId,
      id_kendala,
    );
    setActiveWasteForm((prev) => ({
      ...prev,
      [tahapanId]: {
        ...prev[tahapanId],
        id_kendala,
        operatorQtys: operators.map((op) => ({ ...op, qty: 0 })),
      },
    }));
  };

  const handleOperatorQtyChange = (
    tahapanId: number,
    operatorId: number,
    qty: number,
  ) => {
    setActiveWasteForm((prev) => ({
      ...prev,
      [tahapanId]: {
        ...prev[tahapanId],
        operatorQtys: prev[tahapanId].operatorQtys.map((op) =>
          op.operator_id === operatorId ? { ...op, qty } : op,
        ),
      },
    }));
  };

  const handleSaveWasteEntry = async (tahapanId: number) => {
    const form = activeWasteForm[tahapanId];
    if (!form || !form.id_waste || !form.id_kendala) {
      toast.error('Pilih waste dan kendala terlebih dahulu');
      return;
    }

    const totalQty = form.operatorQtys.reduce(
      (sum, op) => sum + (op.qty || 0),
      0,
    );
    if (totalQty <= 0) {
      toast.error('Total qty harus lebih dari 0');
      return;
    }

    if (!selectedJO || !selectedMesin || !userId) {
      toast.error('Data JO/Mesin/Operator tidak lengkap');
      return;
    }

    setInternalLoading(true);
    try {
      // Save each operator's waste entry
      await Promise.all(
        form.operatorQtys
          .filter((op) => op.qty > 0)
          .map((op) =>
            axios.post(
              `${API_BASE}/produksi/lkhWaste`,
              {
                id_jo: selectedJO.id,
                id_tahapan: tahapanId,
                id_mesin: parseInt(selectedMesin),
                id_operator: op.operator_id,
                id_kendala: parseInt(form.id_kendala),
                id_waste: parseInt(form.id_waste),
                total_qty: op.qty,
              },
              { withCredentials: true },
            ),
          ),
      );

      toast.success('Data waste berhasil disimpan');

      // Add to saved entries and reset form
      const newEntry: WasteEntry = {
        id_waste: form.id_waste,
        id_kendala: form.id_kendala,
        total_qty: totalQty,
        operatorQtys: form.operatorQtys,
      };

      setActiveWasteForm((prev) => ({
        ...prev,
        [tahapanId]: {
          showSelect: false,
          id_waste: '',
          id_kendala: '',
          operatorQtys: [],
          savedEntries: [...(prev[tahapanId]?.savedEntries || []), newEntry],
        },
      }));
    } catch (error: any) {
      console.error('Error saving waste:', error);
      toast.error(error.response?.data?.message || 'Gagal menyimpan waste');
    } finally {
      setInternalLoading(false);
    }
  };

  const handleDeleteSavedEntry = (tahapanId: number, entryIdx: number) => {
    setActiveWasteForm((prev) => ({
      ...prev,
      [tahapanId]: {
        ...prev[tahapanId],
        savedEntries: (prev[tahapanId]?.savedEntries || []).filter(
          (_, i) => i !== entryIdx,
        ),
      },
    }));
  };

  const getWasteLabel = (id_waste: string) => {
    const w = wasteKendalaList.find((ww) => String(ww.id) === id_waste);
    return w ? `${w.kode} - ${w.deskripsi}` : id_waste;
  };

  const getKendalaLabel = (id_waste: string, id_kendala: string) => {
    const w = wasteKendalaList.find((ww) => String(ww.id) === id_waste);
    const k = w?.kendala.find((kk) => String(kk.id) === id_kendala);
    return k ? `${k.kode} - ${k.deskripsi}` : id_kendala;
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[92vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Form Waste</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {selectedJO?.no_jo} — Input data waste per tahapan
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Kendala Table */}
          {kendalaProses.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                Riwayat Kendala
              </h4>
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs">
                    <thead className="bg-amber-50">
                      <tr>
                        {[
                          'Mesin',
                          'Kode',
                          'Kendala',
                          'Proses',
                          'Tahapan',
                          'Operator',
                          'Durasi',
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-3 py-2.5 text-left font-semibold text-amber-800 uppercase tracking-wide"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {kendalaProses.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-amber-50/30 transition-colors"
                        >
                          <td className="px-3 py-2">
                            <div className="font-medium text-gray-800">
                              {item.mesin?.nama_mesin || '-'}
                            </div>
                            <div className="text-gray-400 text-[10px] font-mono">
                              {item.mesin?.kode_mesin || ''}
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono bg-gray-100 text-gray-700">
                              {item.kode}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-gray-700">
                            {item.deskripsi}
                          </td>
                          <td className="px-3 py-2">
                            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 font-medium">
                              {item.proses}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-gray-600">
                            {item.tahapan?.nama_tahapan}
                          </td>
                          <td className="px-3 py-2">
                            <div className="text-gray-800 font-medium">
                              {item.operator?.nama}
                            </div>
                            <div className="text-gray-400 text-[10px]">
                              {item.operator?.bagian}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-gray-600 font-mono">
                            {formatDuration(item.total_waktu || 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Grouped Tahapan Waste Input */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
              Input Waste per Tahapan
            </h4>
            {Object.keys(groupedByTahapan).length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                {internalLoading ? 'Memuat data...' : 'Tidak ada data proses'}
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(groupedByTahapan).map(
                  ([tahapanIdStr, group]) => {
                    const tahapanId = parseInt(tahapanIdStr);
                    const form = activeWasteForm[tahapanId];
                    const wasteOptions = getWasteOptions();
                    const kendalaOptions = form
                      ? getKendalaOptions(form.id_waste)
                      : [];

                    return (
                      <div
                        key={tahapanId}
                        className="border border-gray-200 rounded-lg overflow-hidden"
                      >
                        {/* Tahapan Header */}
                        <div className="bg-gray-50 px-4 py-2.5 flex items-center justify-between border-b border-gray-200">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-sm text-gray-800">
                              {group.tahapanName}
                            </span>
                            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                              {group.items.length} operator
                            </span>
                          </div>
                          <button
                            onClick={() => handleSetWasteClick(tahapanId)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
                            disabled={loading}
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                            Set Waste
                          </button>
                        </div>

                        {/* Operators in Tahapan */}
                        <div className="px-4 py-2 bg-white">
                          <div className="flex flex-wrap gap-2">
                            {group.items.map((item) => (
                              <div
                                key={`${item.id_operator}-${item.proses}`}
                                className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full text-xs"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                <span className="font-medium text-gray-700">
                                  {item.operator?.nama}
                                </span>
                                <span className="text-gray-400">·</span>
                                <span className="text-gray-500">
                                  {item.proses}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Saved Waste Entries */}
                        {form?.savedEntries && form.savedEntries.length > 0 && (
                          <div className="px-4 pb-2 bg-white border-t border-dashed border-gray-200">
                            <div className="mt-2 space-y-1.5">
                              {form.savedEntries.map((entry, idx) => (
                                <div
                                  key={idx}
                                  className="bg-green-50 border border-green-200 rounded-lg px-3 py-2"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                      <span className="text-xs font-semibold text-green-800">
                                        {getWasteLabel(entry.id_waste)}
                                      </span>
                                      <span className="text-gray-400 mx-1">
                                        ·
                                      </span>
                                      <span className="text-xs text-green-700">
                                        {getKendalaLabel(
                                          entry.id_waste,
                                          entry.id_kendala,
                                        )}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                      <span className="text-xs font-bold text-green-700 whitespace-nowrap">
                                        Total: {entry.total_qty}
                                      </span>
                                      <button
                                        onClick={() =>
                                          handleDeleteSavedEntry(tahapanId, idx)
                                        }
                                        className="p-1 rounded hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors"
                                        title="Hapus entri ini"
                                      >
                                        <svg
                                          className="w-3.5 h-3.5"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                          />
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                                  <div className="flex flex-wrap gap-2 mt-1.5">
                                    {entry.operatorQtys
                                      .filter((op) => op.qty > 0)
                                      .map((op) => (
                                        <span
                                          key={op.operator_id}
                                          className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full"
                                        >
                                          {op.operator_name}: {op.qty}
                                        </span>
                                      ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Waste Form */}
                        {form?.showSelect && (
                          <div className="px-4 pb-4 pt-2 bg-blue-50/30 border-t border-blue-100">
                            <div className="space-y-3">
                              {/* Waste & Kendala Selects */}
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                                    Jenis Waste{' '}
                                    <span className="text-red-500">*</span>
                                  </label>
                                  <SearchableSelect
                                    options={wasteOptions}
                                    value={form.id_waste || null}
                                    onChange={(val) =>
                                      handleWasteChange(tahapanId, val)
                                    }
                                    onClear={() =>
                                      handleWasteChange(tahapanId, '')
                                    }
                                    placeholder="Pilih Waste"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                                    Penyebab / Kendala{' '}
                                    <span className="text-red-500">*</span>
                                  </label>
                                  <SearchableSelect
                                    options={kendalaOptions}
                                    value={form.id_kendala || null}
                                    onChange={(val) =>
                                      handleKendalaChange(tahapanId, val)
                                    }
                                    onClear={() =>
                                      handleKendalaChange(tahapanId, '')
                                    }
                                    placeholder="Pilih Kendala"
                                    disabled={!form.id_waste}
                                  />
                                </div>
                              </div>

                              {/* Operator Qty Inputs */}
                              {form.operatorQtys.length > 0 && (
                                <div>
                                  <label className="block text-xs font-semibold text-gray-600 mb-2">
                                    Jumlah Waste per Operator
                                  </label>
                                  <div className="grid grid-cols-2 gap-2">
                                    {form.operatorQtys.map((op) => (
                                      <div
                                        key={op.operator_id}
                                        className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2"
                                      >
                                        <div className="flex-1 min-w-0">
                                          <div className="text-xs font-semibold text-gray-800 truncate">
                                            {op.operator_name}
                                          </div>
                                          <div className="text-[10px] text-gray-500">
                                            {op.proses}
                                          </div>
                                        </div>
                                        <input
                                          type="number"
                                          value={op.qty || ''}
                                          onChange={(e) =>
                                            handleOperatorQtyChange(
                                              tahapanId,
                                              op.operator_id,
                                              e.target.value
                                                ? Number(e.target.value)
                                                : 0,
                                            )
                                          }
                                          className="w-20 px-2 py-1 text-xs text-right border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                          placeholder="0"
                                          min="0"
                                        />
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setActiveWasteForm((prev) => ({
                                              ...prev,
                                              [tahapanId]: {
                                                ...prev[tahapanId],
                                                operatorQtys: prev[
                                                  tahapanId
                                                ].operatorQtys.filter(
                                                  (o) =>
                                                    o.operator_id !==
                                                    op.operator_id,
                                                ),
                                              },
                                            }))
                                          }
                                          className="p-1 rounded hover:bg-red-100 text-red-300 hover:text-red-500 transition-colors shrink-0"
                                          title={`Hapus ${op.operator_name}`}
                                        >
                                          <svg
                                            className="w-3.5 h-3.5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M6 18L18 6M6 6l12 12"
                                            />
                                          </svg>
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="mt-2 text-right text-xs text-gray-500">
                                    Total:{' '}
                                    <span className="font-bold text-gray-800">
                                      {form.operatorQtys.reduce(
                                        (s, op) => s + (op.qty || 0),
                                        0,
                                      )}
                                    </span>
                                  </div>
                                </div>
                              )}

                              {/* Action Buttons */}
                              <div className="flex justify-end gap-2 pt-1">
                                <button
                                  onClick={() =>
                                    setActiveWasteForm((prev) => ({
                                      ...prev,
                                      [tahapanId]: {
                                        ...prev[tahapanId],
                                        showSelect: false,
                                        id_waste: '',
                                        id_kendala: '',
                                        operatorQtys: [],
                                      },
                                    }))
                                  }
                                  className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                  disabled={loading}
                                >
                                  Batal
                                </button>
                                <button
                                  onClick={() =>
                                    handleSaveWasteEntry(tahapanId)
                                  }
                                  disabled={
                                    loading ||
                                    !form.id_waste ||
                                    !form.id_kendala ||
                                    form.operatorQtys.reduce(
                                      (s, op) => s + (op.qty || 0),
                                      0,
                                    ) <= 0
                                  }
                                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors shadow-sm"
                                >
                                  {loading ? 'Menyimpan...' : 'Simpan'}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-800 hover:bg-gray-900 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default WasteModal;
