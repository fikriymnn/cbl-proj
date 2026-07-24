import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  KendalaHistoryItem,
  TambahBahanPersiapanRecord,
  TambahBahanPemakaianSubmitPayload,
  TambahBahanPemakaianCreatePayload,
  TambahBahanDefectItem,
  JOData,
} from './Tambahbahan.types';
import {
  getSelectedMounting,
  getBagianFromMounting,
  lpToDruk,
  drukToLp,
} from '../../TambahBahan/Tambahbahanutils';

const API_BASE = import.meta.env.VITE_API_LINK;

interface KendalaOption {
  id: number;
  kode: string;
  deskripsi: string;
}

interface DefectLine {
  uid: string;
  id_kode_produksi: number;
  kode: string;
  deskripsi: string;
  qty_tambah_bahan_lp: number | '';
  qty_tambah_bahan_druk: number | '';
}

type ModalTab = 'pemakaian' | 'persiapan';

interface TambahBahanModalProps {
  show: boolean;
  onClose: () => void;
  idJo: number | null;
  noJo?: string;
  kendalaKodeOptions: KendalaOption[];
  onSuccess?: () => void;
}

const USABLE_STATUSES = ['approve gudang'];

const TambahBahanModal: React.FC<TambahBahanModalProps> = ({
  show,
  onClose,
  idJo,
  noJo,
  kendalaKodeOptions,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('pemakaian');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ---- shared kendala history (both tabs) ----
  const [kendalaHistory, setKendalaHistory] = useState<KendalaHistoryItem[]>(
    [],
  );

  const fetchKendalaHistory = useCallback(async () => {
    if (!idJo) return;
    try {
      const res = await axios.get(`${API_BASE}/produksi/listAllData`, {
        params: { id_jo: idJo, limit: 100 },
        withCredentials: true,
      });
      const rows = res.data.data || [];
      const freq = new Map<number, KendalaHistoryItem>();
      rows.forEach((row: any) => {
        (row.produksi_lkh_proses || []).forEach((p: any) => {
          if (p.proses?.toLowerCase() === 'kendala' && p.id_kode_produksi) {
            const existing = freq.get(p.id_kode_produksi);
            if (existing) {
              existing.frequency += 1;
            } else {
              freq.set(p.id_kode_produksi, {
                id_kode_produksi: p.id_kode_produksi,
                kode: p.kode,
                deskripsi: p.deskripsi,
                frequency: 1,
              });
            }
          }
        });
      });
      setKendalaHistory(
        Array.from(freq.values()).sort((a, b) => b.frequency - a.frequency),
      );
    } catch (error) {
      console.error('Error fetching kendala history:', error);
      setKendalaHistory([]);
    }
  }, [idJo]);

  // ---- PERSIAPAN tab state (qty split LP/Druk, Druk is the source of
  // truth against the approved qty_tambah_bahan_druk) ----
  const [persiapanList, setPersiapanList] = useState<
    TambahBahanPersiapanRecord[]
  >([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selections, setSelections] = useState<
    Record<number, { lines: DefectLine[] }>
  >({});

  const getSisa = (item: TambahBahanPersiapanRecord) =>
    Math.max(
      0,
      item.qty_tambah_bahan_druk - (item.qty_pakai_tambah_bahan_druk || 0),
    );

  const fetchPersiapanList = useCallback(async () => {
    if (!idJo) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/gudangRM/tambahBahanPersiapan`, {
        params: { id_jo: idJo },
        withCredentials: true,
      });
      const data: TambahBahanPersiapanRecord[] = res.data.data || [];
      const usable = data.filter(
        (d) =>
          d.is_active &&
          USABLE_STATUSES.includes((d.status || '').toLowerCase()) &&
          getSisa(d) > 0,
      );
      setPersiapanList(usable);
    } catch (error) {
      console.error('Error fetching tambah bahan persiapan:', error);
      toast.error('Gagal mengambil data tambah bahan persiapan');
      setPersiapanList([]);
    } finally {
      setLoading(false);
    }
  }, [idJo]);

  const remainingFor = (
    item: TambahBahanPersiapanRecord,
    excludeUid?: string,
  ) => {
    const sisa = getSisa(item);
    const lines = selections[item.id]?.lines || [];
    const used = lines.reduce(
      (s, l) =>
        l.uid === excludeUid ? s : s + (Number(l.qty_tambah_bahan_druk) || 0),
      0,
    );
    return Math.max(0, sisa - used);
  };

  // ---- PEMAKAIAN tab state (JO detail also drives the shared "bagian"
  // LP<->Druk conversion factor used on both tabs) ----
  const [joDetail, setJoDetail] = useState<JOData | null>(null);
  const [loadingJoDetail, setLoadingJoDetail] = useState(false);
  const [pemakaianNote, setPemakaianNote] = useState('');
  const [pemakaianQtyLp, setPemakaianQtyLp] = useState<number | ''>('');
  const [pemakaianQtyDruk, setPemakaianQtyDruk] = useState<number | ''>('');
  const [pemakaianLines, setPemakaianLines] = useState<DefectLine[]>([]);

  const selectedMounting = getSelectedMounting(joDetail);
  const bagianA = selectedMounting?.ukuran_cetak_bagian_1 || 0;
  const bagianB = selectedMounting?.ukuran_cetak_bagian_2 || 0;
  const defaultBagian = bagianA + bagianB;

  // Editable LP<->Druk conversion factor. Defaults to Bagian A + Bagian B
  // from the JO's selected mounting, but the user can change it.
  const [bagianValue, setBagianValue] = useState<number | ''>('');
  const bagian = bagianValue === '' ? 0 : Number(bagianValue);

  // Re-seed the default whenever the JO's mounting (and therefore its
  // bagian_1 / bagian_2) changes.
  useEffect(() => {
    setBagianValue(defaultBagian > 0 ? defaultBagian : '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bagianA, bagianB]);

  const handleBagianChange = (value: number | '') => {
    setBagianValue(value);
    const factor = value === '' ? 0 : Number(value);
    if (pemakaianQtyLp !== '' && factor > 0) {
      setPemakaianQtyDruk(lpToDruk(Number(pemakaianQtyLp), factor));
    }
  };

  const addLine = (itemId: number, prefill?: KendalaHistoryItem) => {
    setSelections((prev) => {
      const current = prev[itemId]?.lines || [];
      return {
        ...prev,
        [itemId]: {
          lines: [
            ...current,
            {
              uid: `${Date.now()}-${Math.random()}`,
              id_kode_produksi: prefill?.id_kode_produksi || 0,
              kode: prefill?.kode || '',
              deskripsi: prefill?.deskripsi || '',
              qty_tambah_bahan_lp: '',
              qty_tambah_bahan_druk: '',
            },
          ],
        },
      };
    });
    setExpandedId(itemId);
  };

  // Druk is the field the user edits directly (capped against sisa, which
  // is tracked in Druk units); LP is derived automatically from `bagian`,
  // mirroring the top-level pemakaian LP/Druk conversion below.
  const updateLine = (
    item: TambahBahanPersiapanRecord,
    uid: string,
    patch: Partial<
      Pick<
        DefectLine,
        'id_kode_produksi' | 'kode' | 'deskripsi' | 'qty_tambah_bahan_druk'
      >
    >,
  ) => {
    setSelections((prev) => ({
      ...prev,
      [item.id]: {
        lines: (prev[item.id]?.lines || []).map((l) => {
          if (l.uid !== uid) return l;
          const next: DefectLine = { ...l, ...patch };
          if (patch.qty_tambah_bahan_druk !== undefined) {
            const cap = remainingFor(item, uid);
            const raw = patch.qty_tambah_bahan_druk;
            const drukVal = raw !== '' && Number(raw) > cap ? cap : raw;
            next.qty_tambah_bahan_druk = drukVal;
            next.qty_tambah_bahan_lp =
              drukVal !== '' && bagian > 0
                ? drukToLp(Number(drukVal), bagian)
                : '';
          }
          return next;
        }),
      },
    }));
  };

  const removeLine = (itemId: number, uid: string) => {
    setSelections((prev) => {
      const remaining = (prev[itemId]?.lines || []).filter(
        (l) => l.uid !== uid,
      );
      if (remaining.length === 0) {
        const { [itemId]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [itemId]: { lines: remaining } };
    });
  };

  const handlePemakaianLpChange = (value: number | '') => {
    setPemakaianQtyLp(value);
    if (value !== '' && bagian > 0) {
      setPemakaianQtyDruk(lpToDruk(Number(value), bagian));
    } else if (value === '') {
      setPemakaianQtyDruk('');
    }
  };

  const handlePemakaianDrukChange = (value: number | '') => {
    setPemakaianQtyDruk(value);
    if (value !== '' && bagian > 0) {
      setPemakaianQtyLp(drukToLp(Number(value), bagian));
    } else if (value === '') {
      setPemakaianQtyLp('');
    }
  };

  const fetchJoDetail = useCallback(async () => {
    if (!idJo) return;
    setLoadingJoDetail(true);
    try {
      const res = await axios.get(`${API_BASE}/ppic/jo/${idJo}`, {
        withCredentials: true,
      });
      setJoDetail(res.data.data || res.data);
    } catch (error) {
      console.error('Error fetching JO detail:', error);
      toast.error('Gagal mengambil detail JO');
    } finally {
      setLoadingJoDetail(false);
    }
  }, [idJo]);

  const addPemakaianLine = (prefill?: KendalaHistoryItem) => {
    setPemakaianLines((prev) => [
      ...prev,
      {
        uid: `${Date.now()}-${Math.random()}`,
        id_kode_produksi: prefill?.id_kode_produksi || 0,
        kode: prefill?.kode || '',
        deskripsi: prefill?.deskripsi || '',
        qty_tambah_bahan_lp: '',
        qty_tambah_bahan_druk: '',
      },
    ]);
  };

  const updatePemakaianLine = (uid: string, patch: Partial<DefectLine>) => {
    setPemakaianLines((prev) =>
      prev.map((l) => (l.uid === uid ? { ...l, ...patch } : l)),
    );
  };

  const removePemakaianLine = (uid: string) => {
    setPemakaianLines((prev) => prev.filter((l) => l.uid !== uid));
  };

  const resetPemakaianForm = () => {
    setPemakaianNote('');
    setPemakaianQtyLp('');
    setPemakaianQtyDruk('');
    setPemakaianLines([]);
  };

  // ---- lifecycle ----
  useEffect(() => {
    if (show && idJo) {
      setActiveTab('pemakaian');
      setSelections({});
      setExpandedId(null);
      setBagianValue('');
      resetPemakaianForm();
      fetchPersiapanList();
      fetchKendalaHistory();
      fetchJoDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, idJo]);

  const handleClose = () => {
    setSelections({});
    setExpandedId(null);
    setBagianValue('');
    resetPemakaianForm();
    onClose();
  };

  // ---- submit: persiapan (LP/Druk split defect lines) ----
  const handleSubmitPersiapan = async () => {
    const entries = Object.entries(selections).filter(([, v]) =>
      v.lines.some(
        (l) => Number(l.qty_tambah_bahan_druk) > 0 && l.id_kode_produksi,
      ),
    );

    if (entries.length === 0) {
      toast.error(
        'Pilih minimal satu item persiapan, lalu isi kendala dan qty',
      );
      return;
    }

    if (!idJo) {
      toast.error('JO tidak ditemukan');
      return;
    }

    for (const [id, v] of entries) {
      const item = persiapanList.find((p) => p.id === Number(id));
      if (!item) continue;
      const sisa = getSisa(item);
      const total = v.lines.reduce(
        (s, l) => s + (Number(l.qty_tambah_bahan_druk) || 0),
        0,
      );
      if (total > sisa) {
        toast.error(`Qty untuk ${item.nama_kertas} melebihi sisa (${sisa})`);
        return;
      }
    }

    try {
      setSubmitting(true);

      const results = await Promise.all(
        entries.map(([id, v]) => {
          const item = persiapanList.find((p) => p.id === Number(id));
          const lines = v.lines.filter(
            (l) => Number(l.qty_tambah_bahan_druk) > 0 && l.id_kode_produksi,
          );

          const payload: TambahBahanPemakaianSubmitPayload = {
            tambah_bahan_defect: lines.map((l) => ({
              id_kode_produksi: l.id_kode_produksi,
              kode: l.kode,
              deskripsi: l.deskripsi,
              qty_tambah_bahan_lp: Number(l.qty_tambah_bahan_lp) || 0,
              qty_tambah_bahan_druk: Number(l.qty_tambah_bahan_druk),
            })),
          };
          return axios.put(
            `${API_BASE}/gudangRM/tambahBahanPersiapan/pakaiTambahBahan/${item?.id}`,
            payload,
            { withCredentials: true },
          );
        }),
      );

      const firstMessage = results[0]?.data?.message;
      toast.success(firstMessage || 'Pemakaian tambah bahan berhasil dicatat');

      setSelections({});
      setExpandedId(null);
      await fetchPersiapanList();
      onSuccess?.();
    } catch (error: any) {
      console.error('Error submitting tambah bahan pemakaian:', error);
      toast.error(error?.response?.data?.message || 'Gagal mencatat pemakaian');
    } finally {
      setSubmitting(false);
    }
  };

  // ---- submit: pemakaian (LP/Druk split) ----
  const handleSubmitPemakaian = async () => {
    if (!idJo) {
      toast.error('JO tidak ditemukan');
      return;
    }
    if (!selectedMounting) {
      toast.error('JO ini tidak memiliki data kertas (mounting)');
      return;
    }
    const lpNum = Number(pemakaianQtyLp);
    const drukNum = Number(pemakaianQtyDruk);
    if (!pemakaianQtyLp || lpNum <= 0 || !pemakaianQtyDruk || drukNum <= 0) {
      toast.error('Qty LP dan Druk harus lebih dari 0');
      return;
    }
    if (!pemakaianNote.trim()) {
      toast.error('Mohon isi catatan / note');
      return;
    }

    const validLines = pemakaianLines.filter(
      (l) => l.id_kode_produksi && Number(l.qty_tambah_bahan_druk) > 0,
    );

    const defects: TambahBahanDefectItem[] = validLines.map((l) => ({
      id_kode_produksi: l.id_kode_produksi,
      kode: l.kode,
      deskripsi: l.deskripsi,
      qty_tambah_bahan_lp: Number(l.qty_tambah_bahan_lp) || 0,
      qty_tambah_bahan_druk: Number(l.qty_tambah_bahan_druk),
    }));

    const payload: TambahBahanPemakaianCreatePayload = {
      id_jo: idJo,
      id_kertas: selectedMounting.id_kertas,
      qty_tambah_bahan_lp: lpNum,
      qty_tambah_bahan_druk: drukNum,
      note: pemakaianNote.trim(),
      tambah_bahan_defect: defects,
    };

    try {
      setSubmitting(true);
      const res = await axios.post(
        `${API_BASE}/gudangRM/tambahBahanPemakaian`,
        payload,
        { withCredentials: true },
      );
      toast.success(
        res.data?.message || 'Request tambah bahan pemakaian berhasil dikirim',
      );
      resetPemakaianForm();
      onSuccess?.();
      handleClose();
    } catch (error: any) {
      console.error('Error submitting tambah bahan pemakaian request:', error);
      toast.error(
        error?.response?.data?.message || 'Gagal mengirim request pemakaian',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = () => {
    if (activeTab === 'pemakaian') {
      handleSubmitPemakaian();
    } else {
      handleSubmitPersiapan();
    }
  };

  if (!show) return null;

  const totalSelectedItems = Object.keys(selections).length;
  const canSubmitPemakaian =
    !!selectedMounting &&
    Number(pemakaianQtyLp) > 0 &&
    Number(pemakaianQtyDruk) > 0 &&
    pemakaianNote.trim() !== '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Request Tambah Bahan
            </h3>
            {noJo && <p className="text-xs text-gray-500 mt-0.5">JO: {noJo}</p>}
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-3">
          <button
            onClick={() => setActiveTab('pemakaian')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-colors ${
              activeTab === 'pemakaian'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Request Pemakaian
          </button>
          <button
            onClick={() => setActiveTab('persiapan')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-colors ${
              activeTab === 'persiapan'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Request Tambah Bahan Dari Persiapan
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {activeTab === 'pemakaian' && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-black text-xs font-bold">
                  Kertas (otomatis dari JO)
                </label>
                <input
                  readOnly
                  value={selectedMounting?.nama_kertas || ''}
                  placeholder={
                    loadingJoDetail
                      ? 'Memuat data kertas...'
                      : 'JO ini tidak memiliki data kertas'
                  }
                  className="w-full h-9 px-3 border-2 border-stroke rounded-md text-xs bg-gray-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-black text-xs font-bold">
                    Bagian A
                  </label>
                  <input
                    readOnly
                    value={bagianA}
                    className="w-full h-9 px-3 border-2 border-stroke rounded-md text-xs bg-gray-50"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-black text-xs font-bold">
                    Bagian B
                  </label>
                  <input
                    readOnly
                    value={bagianB}
                    className="w-full h-9 px-3 border-2 border-stroke rounded-md text-xs bg-gray-50"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-black text-xs font-bold">
                  Bagian (dipakai untuk konversi LP ↔ Druk)
                </label>
                <input
                  type="number"
                  min={0}
                  value={bagianValue}
                  onChange={(e) =>
                    handleBagianChange(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  placeholder="0"
                  className="w-full h-9 px-3 border-2 border-stroke rounded-md text-xs"
                />
                <p className="text-[11px] text-gray-400">
                  Default = Bagian A + Bagian B ({defaultBagian}). Bisa diubah
                  manual bila perlu.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-black text-xs font-bold">Qty LP</label>
                  <input
                    type="number"
                    min={1}
                    value={pemakaianQtyLp}
                    onChange={(e) =>
                      handlePemakaianLpChange(
                        e.target.value === '' ? '' : Number(e.target.value),
                      )
                    }
                    placeholder="0"
                    className="w-full h-9 px-3 border-2 border-stroke rounded-md text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-black text-xs font-bold">
                    Qty Druk
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={pemakaianQtyDruk}
                    onChange={(e) =>
                      handlePemakaianDrukChange(
                        e.target.value === '' ? '' : Number(e.target.value),
                      )
                    }
                    placeholder="0"
                    className="w-full h-9 px-3 border-2 border-stroke rounded-md text-xs"
                  />
                </div>
              </div>
              {selectedMounting && bagian === 0 && (
                <p className="text-xs text-amber-600">
                  JO ini tidak memiliki data bagian cetak — konversi LP/Druk
                  otomatis tidak tersedia, isi manual keduanya.
                </p>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-black text-xs font-bold">Note</label>
                <textarea
                  value={pemakaianNote}
                  onChange={(e) => setPemakaianNote(e.target.value)}
                  rows={2}
                  placeholder="Catatan tambah bahan pemakaian"
                  className="w-full px-3 py-2 border-2 border-stroke rounded-md text-xs"
                />
              </div>

              {kendalaHistory.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold text-gray-500 mb-1.5">
                    Kendala Sering Dipakai
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {kendalaHistory.slice(0, 6).map((k) => (
                      <button
                        key={k.id_kode_produksi}
                        onClick={() => addPemakaianLine(k)}
                        className="text-[11px] px-2.5 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                      >
                        {k.kode} — {k.deskripsi}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-black text-xs font-bold">
                    Rincian Kendala (opsional)
                  </label>
                  <button
                    onClick={() => addPemakaianLine()}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    + Tambah Kendala
                  </button>
                </div>

                {pemakaianLines.length === 0 && (
                  <p className="text-xs text-gray-400">
                    Belum ada kendala ditambahkan.
                  </p>
                )}

                {pemakaianLines.map((line) => (
                  <div
                    key={line.uid}
                    className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center bg-gray-50 border border-gray-200 rounded-lg p-2.5"
                  >
                    <select
                      value={line.id_kode_produksi || ''}
                      onChange={(e) => {
                        const opt = kendalaKodeOptions.find(
                          (k) => k.id === Number(e.target.value),
                        );
                        updatePemakaianLine(line.uid, {
                          id_kode_produksi: opt?.id || 0,
                          kode: opt?.kode || '',
                          deskripsi: opt?.deskripsi || '',
                        });
                      }}
                      className="flex-1 h-9 px-2 border border-gray-300 rounded-md text-xs bg-white"
                    >
                      <option value="">Pilih kendala...</option>
                      {kendalaKodeOptions.map((k) => (
                        <option key={k.id} value={k.id}>
                          {k.kode} — {k.deskripsi}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={1}
                      placeholder="Qty Druk"
                      value={line.qty_tambah_bahan_druk}
                      onChange={(e) => {
                        const val =
                          e.target.value === '' ? '' : Number(e.target.value);
                        updatePemakaianLine(line.uid, {
                          qty_tambah_bahan_druk: val,
                          qty_tambah_bahan_lp:
                            val !== '' && bagian > 0
                              ? drukToLp(Number(val), bagian)
                              : '',
                        });
                      }}
                      className="w-full sm:w-24 h-9 px-2 border border-gray-300 rounded-md text-xs bg-white"
                    />
                    <input
                      type="number"
                      readOnly
                      placeholder="Qty LP"
                      value={line.qty_tambah_bahan_lp}
                      title="Dihitung otomatis dari Qty Druk"
                      className="w-full sm:w-24 h-9 px-2 border border-gray-200 rounded-md text-xs bg-gray-50"
                    />
                    <button
                      onClick={() => removePemakaianLine(line.uid)}
                      className="text-red-500 hover:text-red-700 text-sm font-bold px-2 self-center"
                      title="Hapus"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'persiapan' && (
            <>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                  <p className="mt-2 text-sm text-gray-500">
                    Memuat data persiapan...
                  </p>
                </div>
              ) : persiapanList.length === 0 ? (
                <div className="text-center py-12 text-sm text-gray-500">
                  Tidak ada data persiapan dengan sisa qty untuk JO ini.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {persiapanList.map((item) => {
                    const sisa = getSisa(item);
                    const lines = selections[item.id]?.lines || [];
                    const used = lines.reduce(
                      (s, l) => s + (Number(l.qty_tambah_bahan_druk) || 0),
                      0,
                    );
                    const remaining = sisa - used;
                    const isExpanded = expandedId === item.id;
                    const progressPct =
                      item.qty_tambah_bahan_druk > 0
                        ? Math.min(
                            100,
                            ((item.qty_pakai_tambah_bahan_druk || 0) /
                              item.qty_tambah_bahan_druk) *
                              100,
                          )
                        : 0;

                    return (
                      <div
                        key={item.id}
                        className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-gray-500">
                                {item.no_jo || noJo}
                              </span>
                              {lines.length > 0 && (
                                <span className="text-[10px] font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                  {lines.length} kendala dipilih
                                </span>
                              )}
                            </div>
                            <div className="text-sm font-semibold text-gray-900 mt-0.5">
                              {item.nama_kertas}
                            </div>
                            {item.note_qc && (
                              <div className="text-xs text-gray-500 mt-0.5 italic">
                                Catatan QC: {item.note_qc}
                              </div>
                            )}
                            <div className="mt-2 flex items-center gap-3 text-xs text-gray-600 flex-wrap">
                              <span>
                                Request:{' '}
                                <b className="text-gray-900">
                                  {item.qty_tambah_bahan_lp?.toLocaleString()}{' '}
                                  LP /{' '}
                                  {item.qty_tambah_bahan_druk.toLocaleString()}{' '}
                                  Druk
                                </b>
                              </span>
                              <span>
                                Terpakai:{' '}
                                <b className="text-gray-900">
                                  {item.qty_pakai_tambah_bahan_lp?.toLocaleString() ||
                                    0}{' '}
                                  LP /{' '}
                                  {item.qty_pakai_tambah_bahan_druk?.toLocaleString() ||
                                    0}{' '}
                                  Druk
                                </b>
                              </span>
                              <span>
                                Sisa (Druk):{' '}
                                <b className="text-green-600">
                                  {sisa.toLocaleString()}
                                </b>
                              </span>
                            </div>
                            <div className="mt-2 h-1.5 w-full max-w-xs bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500"
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              setExpandedId(isExpanded ? null : item.id)
                            }
                            className={`h-9 px-4 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                              lines.length > 0
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            {isExpanded
                              ? 'Tutup'
                              : lines.length > 0
                              ? 'Ubah Pilihan'
                              : '+ Pilih'}
                          </button>
                        </div>

                        {isExpanded && (
                          <div className="border-t border-gray-100 bg-gray-50 p-4 flex flex-col gap-3">
                            {kendalaHistory.length > 0 && (
                              <div>
                                <div className="text-[11px] font-bold text-gray-500 mb-1.5">
                                  Kendala Sering Dipakai
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {kendalaHistory.slice(0, 6).map((k) => (
                                    <button
                                      key={k.id_kode_produksi}
                                      onClick={() => addLine(item.id, k)}
                                      disabled={remainingFor(item) <= 0}
                                      className="text-[11px] px-2.5 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                      {k.kode} — {k.deskripsi}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {lines.length === 0 && (
                              <p className="text-xs text-gray-400">
                                Belum ada kendala dipilih. Klik chip di atas
                                atau tambah manual di bawah.
                              </p>
                            )}

                            {lines.map((line) => {
                              const cap = remainingFor(item, line.uid);
                              return (
                                <div
                                  key={line.uid}
                                  className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center bg-white border border-gray-200 rounded-lg p-2.5"
                                >
                                  <select
                                    value={line.id_kode_produksi || ''}
                                    onChange={(e) => {
                                      const opt = kendalaKodeOptions.find(
                                        (k) => k.id === Number(e.target.value),
                                      );
                                      updateLine(item, line.uid, {
                                        id_kode_produksi: opt?.id || 0,
                                        kode: opt?.kode || '',
                                        deskripsi: opt?.deskripsi || '',
                                      });
                                    }}
                                    className="flex-1 h-9 px-2 border border-gray-300 rounded-md text-xs"
                                  >
                                    <option value="">Pilih kendala...</option>
                                    {kendalaKodeOptions.map((k) => (
                                      <option key={k.id} value={k.id}>
                                        {k.kode} — {k.deskripsi}
                                      </option>
                                    ))}
                                  </select>
                                  <input
                                    type="number"
                                    min={1}
                                    max={cap}
                                    placeholder="Qty Druk"
                                    value={line.qty_tambah_bahan_druk}
                                    onChange={(e) => {
                                      const val =
                                        e.target.value === ''
                                          ? ''
                                          : Number(e.target.value);
                                      updateLine(item, line.uid, {
                                        qty_tambah_bahan_druk: val,
                                      });
                                    }}
                                    className="w-full sm:w-24 h-9 px-2 border border-gray-300 rounded-md text-xs"
                                  />
                                  <input
                                    type="number"
                                    readOnly
                                    placeholder="Qty LP"
                                    value={line.qty_tambah_bahan_lp}
                                    title="Dihitung otomatis dari Qty Druk"
                                    className="w-full sm:w-24 h-9 px-2 border border-gray-200 rounded-md text-xs bg-gray-50"
                                  />
                                  <button
                                    onClick={() =>
                                      removeLine(item.id, line.uid)
                                    }
                                    className="text-red-500 hover:text-red-700 text-sm font-bold px-2 self-center"
                                    title="Hapus"
                                  >
                                    &times;
                                  </button>
                                </div>
                              );
                            })}

                            <div className="flex items-center justify-between">
                              <button
                                onClick={() => addLine(item.id)}
                                disabled={remainingFor(item) <= 0}
                                className="text-xs font-bold text-blue-600 hover:text-blue-800 disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                + Tambah Kendala
                              </button>
                              <span
                                className={`text-xs font-semibold ${
                                  remaining <= 0
                                    ? 'text-red-600'
                                    : 'text-gray-500'
                                }`}
                              >
                                Sisa setelah dipakai (Druk):{' '}
                                {remaining.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 px-6 py-4 border-t border-gray-100">
          <span className="text-xs text-gray-500">
            {activeTab === 'persiapan'
              ? totalSelectedItems > 0
                ? `${totalSelectedItems} item persiapan dipilih`
                : 'Belum ada item dipilih'
              : canSubmitPemakaian
              ? 'Siap dikirim'
              : 'Lengkapi qty & note'}
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleClose}
              className="h-9 px-5 text-xs font-bold rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Tutup
            </button>
            <button
              onClick={handleSubmit}
              disabled={
                submitting ||
                (activeTab === 'persiapan'
                  ? totalSelectedItems === 0
                  : !canSubmitPemakaian)
              }
              className="h-9 px-5 text-xs font-bold rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? 'Mengirim...' : 'Request'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TambahBahanModal;
