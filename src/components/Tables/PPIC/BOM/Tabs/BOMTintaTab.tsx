// components/BOM/tabs/BOMTintaTab.tsx
import React, { useState, useEffect } from 'react';
import { BOMTinta, TintaDetail } from '../Types/bom.types';
import TambahKomponenTintaModal from '../Modals/TambahKomponenTintaModal';
import TambahDetailTintaModal from '../Modals/TambahDetailTintaModal';
import axios from 'axios';

interface BOMTintaTabProps {
  data: BOMTinta[];
  onChange: (data: BOMTinta[]) => void;
  poQty?: number;
  selectedMounting?: any;
}

// ✅ Add interfaces for master data
interface JenisKertasOption {
  id: number;
  jenis: string;
  bobot: string;
  is_active: boolean;
}

interface JenisTintaOption {
  id: number;
  jenis: string;
  bobot: string;
  is_active: boolean;
}

interface JenisWarnaTintaOption {
  id: number;
  jenis: string;
  is_active: boolean;
}

const BOMTintaTab: React.FC<BOMTintaTabProps> = ({
  data,
  onChange,
  poQty = 10000,
  selectedMounting,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingTintaIndex, setEditingTintaIndex] = useState<number | null>(
    null,
  );
  const [editingTintaForDetail, setEditingTintaForDetail] = useState<
    number | null
  >(null);

  // ✅ Add state for master data
  const [jenisKertasOptions, setJenisKertasOptions] = useState<
    JenisKertasOption[]
  >([]);
  const [jenisTintaOptions, setJenisTintaOptions] = useState<
    JenisTintaOption[]
  >([]);
  const [jenisWarnaTintaOptions, setJenisWarnaTintaOptions] = useState<
    JenisWarnaTintaOption[]
  >([]);

  const safeData = Array.isArray(data) ? data : [];

  // ✅ Fetch master data
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [kertasRes, tintaRes, warnaTintaRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_LINK}/master/jenisKertas`, {
            withCredentials: true,
          }),
          axios.get(`${import.meta.env.VITE_API_LINK}/master/jenisTinta`, {
            withCredentials: true,
          }),
          axios.get(`${import.meta.env.VITE_API_LINK}/master/jenisWarnaTinta`, {
            withCredentials: true,
          }),
        ]);

        setJenisKertasOptions(kertasRes.data.data || []);
        setJenisTintaOptions(tintaRes.data.data || []);
        setJenisWarnaTintaOptions(warnaTintaRes.data.data || []);
      } catch (error) {
        console.error('Error fetching master data:', error);
      }
    };

    fetchMasterData();
  }, []);

  // ✅ Get bobot values from master data
  const getBobotKertas = (id_jenis_kertas: number): number => {
    const kertas = jenisKertasOptions.find((k) => k.id === id_jenis_kertas);
    return kertas ? parseFloat(kertas.bobot) : 1.0;
  };

  const getBobotTinta = (id_jenis_tinta: number): number => {
    const tinta = jenisTintaOptions.find((t) => t.id === id_jenis_tinta);
    return tinta ? parseFloat(tinta.bobot) : 1.0;
  };

  // ✅ Get name helpers
  const getJenisKertasName = (id: number): string => {
    const kertas = jenisKertasOptions.find((k) => k.id === id);
    return kertas ? kertas.jenis : '-';
  };

  const getJenisTintaName = (id: number): string => {
    const tinta = jenisTintaOptions.find((t) => t.id === id);
    return tinta ? tinta.jenis : '-';
  };

  const getJenisWarnaTintaName = (id: number): string => {
    const warnaTinta = jenisWarnaTintaOptions.find((w) => w.id === id);
    return warnaTinta ? warnaTinta.jenis : '-';
  };

  // ✅ Updated formula with dynamic B and C
  const calculateQtyTinta = (tintaItem: BOMTinta): number => {
    if (!selectedMounting) return 0;

    const ukuranCetakIsi = selectedMounting.ukuran_cetak_isi_1 || 1;
    const panjangM = (selectedMounting.ukuran_cetak_panjang_1 || 0) / 1000;
    const lebarM = (selectedMounting.ukuran_cetak_lebar_1 || 0) / 1000;
    console.log({ ukuranCetakIsi, panjangM, lebarM });
    const A =
      (poQty / ukuranCetakIsi) *
      (tintaItem.area_cetak / 100) *
      panjangM *
      lebarM;

    let T = 1.05;

    const B = getBobotKertas(tintaItem.id_jenis_kertas);
    const C = getBobotTinta(tintaItem.id_jenis_tinta);
    const M = tintaItem.jenis_mesin_cetak === 'offset' ? 1.0 : 1.5;
    const qty_before = A * B * C * M;
    if (qty_before < 10) T = 1.2;
    else if (qty_before >= 10 && qty_before <= 50) T = 1.1;
    else T = 1.05;
    const qty = A * B * C * M * T;
    console.log({ A, B, C, M, T, qty_before, qty });
    return Math.round(qty) / 1000; // Convert to Kg and round to 2 decimals
  };

  const calculateDetailQty = (tintaQty: number, persentase: number): number => {
    return (tintaQty * persentase) / 100;
  };

  // Update qty otomatis setiap data berubah
  useEffect(() => {
    const updatedData = safeData.map((item) => {
      const newQtyTinta = calculateQtyTinta(item);

      const updatedDetails = (item.tinta_detail || []).map((detail) => ({
        ...detail,
        qty_tinta_detail: calculateDetailQty(
          newQtyTinta,
          detail.persentase_tinta,
        ),
      }));

      return {
        ...item,
        qty_tinta: newQtyTinta,
        tinta_detail: updatedDetails,
      };
    });

    const hasChanges = updatedData.some(
      (item, idx) =>
        item.qty_tinta !== safeData[idx]?.qty_tinta ||
        JSON.stringify(item.tinta_detail) !==
          JSON.stringify(safeData[idx]?.tinta_detail),
    );

    if (hasChanges) {
      onChange(updatedData);
    }
  }, [
    poQty,
    safeData.length,
    selectedMounting,
    jenisKertasOptions.length,
    jenisTintaOptions.length,
  ]);

  const handleAdd = () => {
    setEditingTintaIndex(null);
    setIsModalOpen(true);
  };

  const handleEdit = (index: number) => {
    setEditingTintaIndex(index);
    setIsModalOpen(true);
  };

  const handleDelete = (index: number) => {
    onChange(safeData.filter((_, i) => i !== index));
  };

  const getTotalAreaCetak = (excludeIndex?: number): number => {
    return safeData.reduce((sum, item, idx) => {
      if (idx === excludeIndex) return sum;
      return sum + item.area_cetak;
    }, 0);
  };

  const handleSaveFromModal = (newData: BOMTinta) => {
    // ✅ REMOVED: No validation for total area cetak exceeding 100%

    if (editingTintaIndex !== null) {
      const updated = safeData.map((item, i) =>
        i === editingTintaIndex
          ? {
              ...newData,
              id: item.id,
              tinta_detail: item.tinta_detail,
              qty_tinta: calculateQtyTinta(newData),
            }
          : item,
      );
      onChange(updated);
    } else {
      onChange([
        ...safeData,
        {
          ...newData,
          id: null,
          qty_tinta: calculateQtyTinta(newData),
        },
      ]);
    }
    setEditingTintaIndex(null);
  };

  const handleAddDetail = (tintaIndex: number) => {
    setEditingTintaForDetail(tintaIndex);
    setIsDetailModalOpen(true);
  };

  const handleSaveDetail = (newDetail: TintaDetail) => {
    if (editingTintaForDetail === null) return;

    const tintaItem = safeData[editingTintaForDetail];
    const currentDetails = tintaItem.tinta_detail || [];

    const totalPersentase =
      currentDetails.reduce((sum, d) => sum + d.persentase_tinta, 0) +
      newDetail.persentase_tinta;

    // ✅ KEEP: Detail tinta still locked at 100%
    if (totalPersentase > 100) {
      alert(
        `Total persentase tidak boleh melebihi 100%! Saat ini: ${totalPersentase}%`,
      );
      return;
    }

    const qtyDetail = calculateDetailQty(
      tintaItem.qty_tinta,
      newDetail.persentase_tinta,
    );

    const updated = safeData.map((item, i) =>
      i === editingTintaForDetail
        ? {
            ...item,
            tinta_detail: [
              ...currentDetails,
              {
                ...newDetail,
                id: null,
                qty_tinta_detail: qtyDetail,
              },
            ],
          }
        : item,
    );
    onChange(updated);
    setEditingTintaForDetail(null);
  };

  const handleDeleteDetail = (tintaIndex: number, detailIndex: number) => {
    const updated = safeData.map((item, i) =>
      i === tintaIndex
        ? {
            ...item,
            tinta_detail: (item.tinta_detail || []).filter(
              (_, j) => j !== detailIndex,
            ),
          }
        : item,
    );
    onChange(updated);
  };

  // ✅ Calculate SUMMED detail tinta across all items
  const getSummedDetailTinta = () => {
    const summedMap = new Map<
      string,
      { nama_item_tinta: string; total_qty: number }
    >();

    safeData.forEach((item) => {
      (item.tinta_detail || []).forEach((detail) => {
        const key = detail.nama_item_tinta;
        if (summedMap.has(key)) {
          const existing = summedMap.get(key)!;
          summedMap.set(key, {
            ...existing,
            total_qty: existing.total_qty + (detail.qty_tinta_detail ?? 0),
          });
        } else {
          summedMap.set(key, {
            nama_item_tinta: detail.nama_item_tinta,
            total_qty: detail.qty_tinta_detail ?? 0,
          });
        }
      });
    });

    return Array.from(summedMap.values());
  };

  const summedDetailTinta = getSummedDetailTinta();
  const currentTotalAreaCetak = getTotalAreaCetak();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          // ✅ REMOVED: disabled={currentTotalAreaCetak >= 100}
        >
          <span>+</span>
          Tambah Data Tinta
        </button>

        {/* ✅ UPDATED: Show warning instead of error when > 100% */}
        <div
          className={`text-sm font-medium ${
            currentTotalAreaCetak > 100
              ? 'text-orange-600'
              : currentTotalAreaCetak === 100
              ? 'text-green-600'
              : 'text-blue-600'
          }`}
        >
          Total Area Cetak: {currentTotalAreaCetak}%
          {currentTotalAreaCetak > 100 && (
            <span className="ml-2 text-xs">(⚠️ Melebihi 100%)</span>
          )}
        </div>
      </div>

      {/* ✅ SUMMED Detail Komponen Tinta Table (at top) */}
      {summedDetailTinta.length > 0 && (
        <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-blue-50 p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-800">
              Total Komponen Tinta (Gabungan Semua Data)
            </h3>
          </div>
          <div className="p-4 bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">
                    No
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">
                    Nama Tinta
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">
                    Total Qty (Kg)
                  </th>
                </tr>
              </thead>
              <tbody>
                {summedDetailTinta.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{index + 1}</td>
                    <td className="px-4 py-3 font-medium">
                      {item.nama_item_tinta}
                    </td>
                    <td className="px-4 py-3">
                      {item.total_qty.toFixed(3)} Kg
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-semibold">
                  <td colSpan={2} className="px-4 py-3 text-right">
                    Grand Total:
                  </td>
                  <td className="px-4 py-3">
                    {summedDetailTinta
                      .reduce((sum, item) => sum + item.total_qty, 0)
                      .toFixed(3)}{' '}
                    Kg
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {safeData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Belum ada data tinta
          </div>
        ) : (
          safeData.map((item, index) => {
            const totalPersentase = (item.tinta_detail || []).reduce(
              (sum, d) => sum + d.persentase_tinta,
              0,
            );

            return (
              <div
                key={index}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                {/* ✅ Main Tinta Row - UPDATED with all info */}
                <div className="bg-gray-50 p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        Data Tinta #{index + 1}
                      </h3>

                      {/* ✅ Grid layout for all information */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Jenis Tinta */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Jenis Tinta
                          </label>
                          <div className="text-sm font-semibold text-gray-800">
                            {getJenisWarnaTintaName(item.id_jenis_warna_tinta)}
                          </div>
                        </div>

                        {/* Warna Tinta */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Warna Tinta
                          </label>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-8 h-8 rounded border-2 border-gray-300"
                              style={{ backgroundColor: item.warna_tinta }}
                            />
                            <span className="text-xs text-gray-700 font-mono">
                              {item.warna_tinta}
                            </span>
                          </div>
                        </div>

                        {/* Area Cetak */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Area Cetak
                          </label>
                          <div className="text-sm font-semibold text-gray-800">
                            {item.area_cetak}%
                          </div>
                        </div>

                        {/* Jenis Kertas */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Jenis Kertas
                          </label>
                          <div className="text-sm font-semibold text-gray-800">
                            {getJenisKertasName(item.id_jenis_kertas)}
                            <span className="text-xs text-gray-500 ml-1">
                              (B: {getBobotKertas(item.id_jenis_kertas)})
                            </span>
                          </div>
                        </div>

                        {/* Warna (from jenis tinta) */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Warna
                          </label>
                          <div className="text-sm font-semibold text-gray-800">
                            {getJenisTintaName(item.id_jenis_tinta)}
                            <span className="text-xs text-gray-500 ml-1">
                              (C: {getBobotTinta(item.id_jenis_tinta)})
                            </span>
                          </div>
                        </div>

                        {/* Jenis Mesin Cetak */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Jenis Mesin Cetak
                          </label>
                          <div className="text-sm font-semibold text-gray-800 capitalize">
                            {item.jenis_mesin_cetak}
                            <span className="text-xs text-gray-500 ml-1">
                              (M:{' '}
                              {item.jenis_mesin_cetak === 'offset'
                                ? '1.0'
                                : '1.5'}
                              )
                            </span>
                          </div>
                        </div>

                        {/* Qty Tinta */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Qty Tinta
                          </label>
                          <div className="text-sm font-semibold text-blue-600">
                            {item.qty_tinta.toFixed(3)} Kg
                          </div>
                        </div>

                        {/* Detail Tinta Status */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Status Detail
                          </label>
                          <div className="text-sm">
                            <span
                              className={`font-semibold ${
                                totalPersentase === 100
                                  ? 'text-green-600'
                                  : totalPersentase > 100
                                  ? 'text-red-600'
                                  : 'text-orange-600'
                              }`}
                            >
                              {totalPersentase}% / 100%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => handleAddDetail(index)}
                        className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-xs whitespace-nowrap"
                        disabled={totalPersentase >= 100}
                      >
                        + Detail
                      </button>
                      <button
                        onClick={() => handleEdit(index)}
                        className="px-3 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors text-xs"
                      >
                        ✎ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs"
                      >
                        🗑 Hapus
                      </button>
                    </div>
                  </div>
                </div>

                {/* Detail Table */}
                {item.tinta_detail && item.tinta_detail.length > 0 && (
                  <div className="p-4 bg-white border-t">
                    <h3 className="text-sm font-semibold mb-3">
                      Detail Komponen Tinta
                    </h3>
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">
                            No
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">
                            Nama Tinta
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">
                            Persentase (%)
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">
                            Qty (Kg)
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {item.tinta_detail.map((detail, detailIndex) => (
                          <tr
                            key={detailIndex}
                            className="border-b hover:bg-gray-50"
                          >
                            <td className="px-3 py-2">{detailIndex + 1}</td>
                            <td className="px-3 py-2">
                              {detail.nama_item_tinta}
                            </td>
                            <td className="px-3 py-2">
                              {detail.persentase_tinta}%
                            </td>
                            <td className="px-3 py-2">
                              {(detail.qty_tinta_detail ?? 0).toFixed(3)} Kg
                            </td>
                            <td className="px-3 py-2">
                              <button
                                onClick={() =>
                                  handleDeleteDetail(index, detailIndex)
                                }
                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs"
                              >
                                Hapus
                              </button>
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-gray-50 font-semibold">
                          <td colSpan={2} className="px-3 py-2 text-right">
                            Total:
                          </td>
                          <td className="px-3 py-2">{totalPersentase}%</td>
                          <td className="px-3 py-2">
                            {item.qty_tinta.toFixed(3)} Kg
                          </td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <TambahKomponenTintaModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTintaIndex(null);
        }}
        onSave={handleSaveFromModal}
        editData={
          editingTintaIndex !== null ? safeData[editingTintaIndex] : undefined
        }
        currentTotalAreaCetak={getTotalAreaCetak(
          editingTintaIndex ?? undefined,
        )}
        // ✅ REMOVED: maxAreaCetak prop - no longer needed
      />

      <TambahDetailTintaModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setEditingTintaForDetail(null);
        }}
        onSave={handleSaveDetail}
        currentPersentase={
          editingTintaForDetail !== null
            ? (safeData[editingTintaForDetail]?.tinta_detail || []).reduce(
                (sum, d) => sum + d.persentase_tinta,
                0,
              )
            : 0
        }
      />
    </div>
  );
};

export default BOMTintaTab;
