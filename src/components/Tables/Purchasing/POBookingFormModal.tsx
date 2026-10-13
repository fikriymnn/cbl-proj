import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import {
  MasterVendorItem,
  MasterVendorListResponse,
  PurchaseOrderBookingItem,
  PurchaseOrderBookingDetailResponse,
  PurchaseOrderNoResponse,
} from './Types/Purchasing.types';
import { poBaseUrl, getApiErrorMessage } from './Types/poApi';
import { formatRupiah, getStatusColor, getStatusLabel } from './Types/poStatus';
import NumberInput from './NumberInput';

/* =============================================================================
 * POBookingFormModal — create + edit PO Booking (dibuka dari "+ PO Manual"
 * di PengajuanPurchase, dan dari tombol Edit di DraftPO kind="booking").
 *
 * PO Booking = beli UNTUK STOK, belum terikat JO:
 *   - payload hanya `items` (tanpa items_jo / request_purchase_data)
 *   - tiap item WAJIB dipilih dari master barang, karena id_item dipakai
 *     Incoming RM & endpoint `available` (makanya tidak ada input nama bebas)
 *   - hitungan harga/PPN dilakukan di FE dan dikirim apa adanya, memakai
 *     aturan yang sama dengan CreatePOModal (is_tax_locked -> PPN sudah
 *     termasuk harga, tidak menambah grand total)
 *
 * POST {base}/purchaseOrderBooking          (create -> status draft)
 * PUT  {base}/purchaseOrderBooking/:id      (edit)
 * PUT  {base}/purchaseOrderBooking/request/:id (Simpan & Ajukan)
 * GET  {base}/purchaseOrderBooking/getNo/new (preview nomor, final dibuat BE)
 * ========================================================================== */

const DEFAULT_PPN_PERSEN = 11;

interface MasterBarangItem {
  purchase_unit_name: string;
  brand_name: string;
  id: number;
  id_brand: number;
  kode_barang: string;
  nama_barang: string;
  kategori: string;
  sub_kategori: string | null;
  harga: number;
  is_include_tax: boolean;
  pajak: number;
}
interface MasterBarangListResponse {
  data: MasterBarangItem[];
  total_page: number;
}
interface MasterBrandItem {
  id: number;
  kode_brand: string;
  nama_brand: string;
}

interface Line {
  lineId: string;
  id?: number; // id item booking yang sudah tersimpan -> dikirim balik saat edit
  id_item: number;
  id_brand: number | null;
  nama_brand: string;
  kode_barang: string;
  nama_item: string;
  tipe_barang: string;
  satuan: string;
  qty_beli: number;
  harga: number;
  is_ppn: boolean;
  is_tax_locked: boolean;
  pajak_persen: number;
  ppn: number;
  // Info dari server (hanya terisi saat edit)
  qty_terkirim: number;
  qty_pakai: number;
}

const uid = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const todayISO = (): string => new Date().toISOString().slice(0, 10);
const toISODate = (v?: string): string => (v ? v.slice(0, 10) : '');

const recalcLine = (l: Line): Line => {
  const total = l.qty_beli * l.harga;
  let ppn = 0;
  if (l.is_tax_locked) {
    const base = total / (1 + l.pajak_persen / 100);
    ppn = Math.round(total - base);
  } else if (l.is_ppn) {
    ppn = Math.round(total * (l.pajak_persen / 100));
  }
  return { ...l, ppn };
};

const lineFromMaster = (
  m: MasterBarangItem,
  brandMap: Map<number, string>,
): Line => {
  const locked = !!m.is_include_tax;
  return recalcLine({
    lineId: uid(),
    id_item: m.id,
    id_brand: m.id_brand ?? null,
    nama_brand: (m.id_brand && brandMap.get(m.id_brand)) || m.brand_name || '',
    kode_barang: m.kode_barang || '',
    nama_item: m.nama_barang,
    tipe_barang: m.sub_kategori || m.kategori || '',
    satuan: m.purchase_unit_name || '',
    qty_beli: 0,
    harga: m.harga ?? 0,
    is_ppn: locked,
    is_tax_locked: locked,
    pajak_persen: m.pajak ?? DEFAULT_PPN_PERSEN,
    ppn: 0,
    qty_terkirim: 0,
    qty_pakai: 0,
  });
};

const lineFromSaved = (it: PurchaseOrderBookingItem): Line => {
  const locked = !!it.master_barang?.is_include_tax;
  return recalcLine({
    lineId: `saved-${it.id}`,
    id: it.id,
    id_item: it.id_item,
    id_brand: it.id_brand ?? null,
    nama_brand: it.nama_brand || '',
    kode_barang: it.master_barang?.kode_barang || it.kode_barang || '',
    nama_item: it.nama_item,
    tipe_barang: it.tipe_barang,
    satuan: it.satuan,
    qty_beli: it.qty_beli,
    harga: it.harga,
    is_ppn: locked || !!it.is_ppn,
    is_tax_locked: locked,
    pajak_persen: it.master_barang?.pajak ?? DEFAULT_PPN_PERSEN,
    ppn: it.ppn,
    qty_terkirim: it.qty_terkirim || 0,
    qty_pakai: it.qty_pakai || 0,
  });
};

type Props = {
  idPo?: number | null; // kosong = buat baru, terisi = edit
  onClose: () => void;
  onSaved: () => void;
};

const POBookingFormModal: React.FC<Props> = ({
  idPo = null,
  onClose,
  onSaved,
}) => {
  const isEdit = idPo !== null;

  const [loading, setLoading] = useState<boolean>(isEdit);
  const [loadError, setLoadError] = useState<string>('');
  const [poStatus, setPoStatus] = useState<string>('');
  const [noPO, setNoPO] = useState<string>('');
  const [purchaseName, setPurchaseName] = useState<string>(''); // dipertahankan saat edit

  const [vendors, setVendors] = useState<MasterVendorItem[]>([]);
  const [vendorsLoading, setVendorsLoading] = useState<boolean>(true);
  const [vendorId, setVendorId] = useState<number | ''>('');

  const [tglPO, setTglPO] = useState<string>(todayISO());
  const [tglKirim, setTglKirim] = useState<string>(todayISO());
  const [noteSupplier, setNoteSupplier] = useState<string>('');
  const [noteInternal, setNoteInternal] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);
  const [lines, setLines] = useState<Line[]>([]);

  const [brandMap, setBrandMap] = useState<Map<number, string>>(new Map());
  const [submitting, setSubmitting] = useState<false | 'save' | 'submit'>(
    false,
  );
  const [error, setError] = useState<string>('');

  // Picker master barang
  const [pickerOpen, setPickerOpen] = useState<boolean>(false);
  const [pickerSearch, setPickerSearch] = useState<string>('');
  const [pickerResults, setPickerResults] = useState<MasterBarangItem[]>([]);
  const [pickerLoading, setPickerLoading] = useState<boolean>(false);

  // --- Load: detail (edit) atau preview nomor (create) ---
  useEffect(() => {
    const load = async () => {
      const base = poBaseUrl('booking');
      try {
        if (isEdit) {
          setLoading(true);
          const res = await axios.get<PurchaseOrderBookingDetailResponse>(
            `${base}/${idPo}`,
            { withCredentials: true },
          );
          const d = res.data.data;
          setPoStatus(d.status);
          setNoPO(d.no_purchase_order);
          setPurchaseName(d.purchase_name || '');
          setVendorId(d.id_vendor ?? '');
          setTglPO(toISODate(d.tgl_po) || todayISO());
          setTglKirim(toISODate(d.tgl_kirim) || todayISO());
          setNoteSupplier(d.note_supplier || '');
          setNoteInternal(d.note_internal || '');
          setDiscount(d.discount || 0);
          setLines((d.items || []).map(lineFromSaved));
        } else {
          const res = await axios.get<PurchaseOrderNoResponse>(
            `${base}/getNo/new`,
            { withCredentials: true },
          );
          setNoPO(
            res.data.no_purchase_order_new || res.data.no_purchase_order || '',
          );
        }
      } catch (err) {
        console.error('Error loading PO booking form:', err);
        if (isEdit) setLoadError('Gagal memuat detail PO Booking.');
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idPo]);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await axios.get<{ data: MasterBrandItem[] }>(
          `${import.meta.env.VITE_API_LINK}/master/brand`,
          { params: { limit: 1000 }, withCredentials: true },
        );
        const map = new Map<number, string>();
        (res.data.data || []).forEach((b) => map.set(b.id, b.nama_brand));
        setBrandMap(map);
      } catch (err) {
        console.error('Error fetching master brand list:', err);
      }
    };
    fetchBrands();
  }, []);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setVendorsLoading(true);
        const res = await axios.get<MasterVendorListResponse>(
          `${import.meta.env.VITE_API_LINK}/master/marketing/vendor/list`,
          { params: { limit: 100, is_active: true }, withCredentials: true },
        );
        setVendors(res.data.data || []);
      } catch (err) {
        console.error('Error fetching vendor list:', err);
        setVendors([]);
      } finally {
        setVendorsLoading(false);
      }
    };
    fetchVendors();
  }, []);

  const selectedVendor = useMemo(
    () => vendors.find((v) => v.id === vendorId) || null,
    [vendors, vendorId],
  );

  // --- Line helpers ---
  const updateLine = (lineId: string, patch: Partial<Line>) =>
    setLines((prev) =>
      prev.map((l) => {
        if (l.lineId !== lineId) return l;
        const next = { ...l, ...patch };
        if (next.is_tax_locked) next.is_ppn = true;
        return recalcLine(next);
      }),
    );

  const removeLine = (lineId: string) =>
    setLines((prev) => prev.filter((l) => l.lineId !== lineId));

  // --- Picker master barang ---
  const fetchPicker = async (search?: string) => {
    try {
      setPickerLoading(true);
      const res = await axios.get<MasterBarangListResponse>(
        `${import.meta.env.VITE_API_LINK}/master/barang`,
        {
          params: { page: 1, limit: 20, search: search || undefined },
          withCredentials: true,
        },
      );
      setPickerResults(res.data.data || []);
    } catch (err) {
      console.error('Error fetching master barang list:', err);
      setPickerResults([]);
    } finally {
      setPickerLoading(false);
    }
  };

  const openPicker = () => {
    setPickerOpen(true);
    setPickerSearch('');
    fetchPicker();
  };

  const pickItem = (m: MasterBarangItem) => {
    setLines((prev) => [...prev, lineFromMaster(m, brandMap)]);
    setPickerOpen(false);
  };

  const usedIds = useMemo(() => new Set(lines.map((l) => l.id_item)), [lines]);

  // --- Totals (aturan sama dengan CreatePOModal) ---
  const subTotal = lines.reduce((s, l) => s + l.qty_beli * l.harga, 0);
  const ppnIncluded = lines
    .filter((l) => l.is_tax_locked)
    .reduce((s, l) => s + l.ppn, 0);
  const ppnAddedToTotal = lines
    .filter((l) => !l.is_tax_locked)
    .reduce((s, l) => s + l.ppn, 0);
  const totalPPN = ppnIncluded + ppnAddedToTotal;
  const subTotalExTax = subTotal - ppnIncluded;
  const grandTotal = subTotal - (discount || 0) + ppnAddedToTotal;

  const validate = (): string => {
    if (!vendorId) return 'Vendor wajib dipilih.';
    if (lines.length === 0) return 'Minimal 1 item diperlukan.';
    for (const l of lines) {
      if (l.qty_beli <= 0)
        return `Qty beli untuk "${l.nama_item}" harus lebih dari 0.`;
      if (l.harga < 0)
        return `Harga untuk "${l.nama_item}" tidak boleh negatif.`;
      if (l.qty_beli < l.qty_terkirim)
        return `Qty beli "${l.nama_item}" tidak boleh lebih kecil dari qty yang sudah terkirim (${l.qty_terkirim}).`;
    }
    return '';
  };

  const save = async (alsoRequest: boolean) => {
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setError('');
    setSubmitting(alsoRequest ? 'submit' : 'save');

    const payload = {
      id_vendor: vendorId === '' ? null : vendorId,
      nama_vendor: selectedVendor?.nama_vendor || '',
      tgl_po: tglPO,
      tgl_kirim: tglKirim,
      discount: discount || 0,
      sub_total: subTotalExTax,
      ppn: totalPPN,
      total: grandTotal,
      note_internal: noteInternal,
      note_supplier: noteSupplier,
      purchase_name: purchaseName,
      items: lines.map((l) => ({
        ...(l.id ? { id: l.id } : {}),
        id_item: l.id_item,
        id_brand: l.id_brand,
        nama_item: l.nama_item,
        nama_brand: l.nama_brand,
        qty: l.qty_beli,
        qty_beli: l.qty_beli,
        tipe_barang: l.tipe_barang,
        satuan: l.satuan,
        harga: l.harga,
        total: l.qty_beli * l.harga,
        ppn: l.ppn,
        is_ppn: l.is_ppn,
      })),
    };

    try {
      const base = poBaseUrl('booking');
      const cfg = { withCredentials: true };
      if (isEdit) {
        await axios.put(`${base}/${idPo}`, payload, cfg);
        if (alsoRequest) {
          await axios.put(`${base}/request/${idPo}`, undefined, cfg);
        }
      } else {
        await axios.post(base, payload, cfg);
      }
      console.log('PO booking saved successfully:', payload);
      onSaved();
    } catch (err) {
      console.error('Error saving PO booking:', err);
      setError(getApiErrorMessage(err, 'Gagal menyimpan PO Booking.'));
    } finally {
      setSubmitting(false);
    }
  };

  const isRejected =
    poStatus === 'reject kabag' || poStatus === 'reject finance';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-full max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              {isEdit ? 'Edit PO Booking' : 'Buat PO Booking'}
              {isEdit && poStatus && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ring-1 font-medium ${getStatusColor(
                    poStatus,
                  )}`}
                >
                  {getStatusLabel(poStatus)}
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Pembelian untuk stok — belum terikat JO
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Tutup"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent" />
          </div>
        ) : loadError ? (
          <div className="px-6 py-14 text-center">
            <p className="text-red-600 text-sm font-medium">{loadError}</p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {isRejected && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg px-4 py-2.5">
                PO Booking ini ditolak ({getStatusLabel(poStatus)}). Perbaiki
                data lalu ajukan kembali.
              </div>
            )}

            {/* Meta */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Vendor
                </label>
                <select
                  value={vendorId}
                  onChange={(e) =>
                    setVendorId(e.target.value ? Number(e.target.value) : '')
                  }
                  disabled={vendorsLoading}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="">
                    {vendorsLoading ? 'Memuat vendor...' : 'Pilih vendor'}
                  </option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.nama_vendor}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Nomor PO Booking
                  {!isEdit && (
                    <span className="text-slate-400 font-normal">
                      {' '}
                      (preview)
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={noPO || 'Memuat...'}
                  readOnly
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-600 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Tanggal PO
                </label>
                <input
                  type="date"
                  value={tglPO}
                  onChange={(e) => setTglPO(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Tanggal Kirim
                </label>
                <input
                  type="date"
                  value={tglKirim}
                  onChange={(e) => setTglKirim(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3">
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm table-fixed">
                    <colgroup>
                      <col className="w-[12%]" />
                      <col className="w-[28%]" />
                      <col className="w-[14%]" />
                      <col className="w-24" />
                      <col className="w-20" />
                      <col className="w-28" />
                      <col className="w-28" />
                      <col className="w-16" />
                      <col className="w-10" />
                    </colgroup>
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        {[
                          ['Kode', 'left'],
                          ['Nama Barang', 'left'],
                          ['Brand', 'left'],
                          ['Qty Beli', 'right'],
                          ['Unit', 'left'],
                          ['Harga', 'right'],
                          ['Total', 'right'],
                          ['Pajak', 'center'],
                          ['', 'left'],
                        ].map(([label, align], i) => (
                          <th
                            key={i}
                            className={`px-3 py-2 text-${align} text-[11px] font-semibold text-slate-400 uppercase tracking-wide`}
                          >
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {lines.length === 0 ? (
                        <tr>
                          <td
                            colSpan={9}
                            className="px-4 py-10 text-center text-slate-400 text-sm"
                          >
                            Belum ada item. Klik “+ Tambah item” untuk memilih
                            dari master barang.
                          </td>
                        </tr>
                      ) : (
                        lines.map((l) => (
                          <tr key={l.lineId} className="hover:bg-slate-50/60">
                            <td className="px-3 py-2 text-slate-600">
                              {l.kode_barang || '-'}
                            </td>
                            <td className="px-3 py-2">
                              <div className="text-slate-800 font-medium">
                                {l.nama_item}
                              </div>
                              {isEdit && l.id && (
                                <div className="text-[11px] text-slate-400 mt-0.5">
                                  Terkirim {l.qty_terkirim} · Dipakai{' '}
                                  {l.qty_pakai}
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-2 text-slate-600">
                              {l.nama_brand || '-'}
                            </td>
                            <td className="px-3 py-2">
                              <NumberInput
                                value={l.qty_beli}
                                onChange={(v) =>
                                  updateLine(l.lineId, { qty_beli: v })
                                }
                                className="w-full px-2 py-1.5 text-sm text-right border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={l.satuan}
                                onChange={(e) =>
                                  updateLine(l.lineId, {
                                    satuan: e.target.value,
                                  })
                                }
                                className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <NumberInput
                                value={l.harga}
                                onChange={(v) =>
                                  updateLine(l.lineId, { harga: v })
                                }
                                className="w-full px-2 py-1.5 text-sm text-right border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </td>
                            <td className="px-3 py-2 text-right tabular-nums text-slate-800 font-medium">
                              {formatRupiah(l.qty_beli * l.harga)}
                            </td>
                            <td className="px-3 py-2 text-center">
                              <div className="flex flex-col items-center gap-0.5">
                                <input
                                  type="checkbox"
                                  checked={l.is_ppn}
                                  disabled={l.is_tax_locked}
                                  onChange={(e) =>
                                    updateLine(l.lineId, {
                                      is_ppn: e.target.checked,
                                    })
                                  }
                                  title={
                                    l.is_tax_locked
                                      ? 'Harga sudah termasuk PPN — dihitung otomatis, tidak menambah grand total'
                                      : `PPN ${l.pajak_persen}% jika dicentang`
                                  }
                                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-70"
                                />
                                <span className="text-[10px] text-slate-400">
                                  {l.pajak_persen}%
                                </span>
                              </div>
                            </td>
                            <td className="px-3 py-2 text-center">
                              {l.qty_pakai > 0 ? (
                                <span
                                  title="Sudah dipakai PO biasa, tidak bisa dihapus"
                                  className="text-slate-300 cursor-not-allowed"
                                >
                                  ✕
                                </span>
                              ) : (
                                <button
                                  onClick={() => removeLine(l.lineId)}
                                  className="text-red-400 hover:text-red-600 transition-colors"
                                  aria-label="Hapus item"
                                >
                                  ✕
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <button
                onClick={openPicker}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                + Tambah item
              </button>
            </div>

            {/* Notes + summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">
                    Catatan Ke Supplier
                  </label>
                  <textarea
                    value={noteSupplier}
                    onChange={(e) => setNoteSupplier(e.target.value)}
                    rows={3}
                    placeholder="Contoh: Mohon dikirim tepat waktu"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">
                    Catatan Internal
                  </label>
                  <textarea
                    value={noteInternal}
                    onChange={(e) => setNoteInternal(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 h-fit space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="text-slate-800 font-medium tabular-nums">
                    Rp {formatRupiah(subTotalExTax)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Discount</span>
                  <div className="w-32">
                    <NumberInput
                      value={discount}
                      onChange={setDiscount}
                      className="w-full px-2 py-1 text-sm text-right border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                {ppnIncluded > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">
                      PPN termasuk harga
                      <span className="block text-[10px]">
                        (info, tidak masuk total)
                      </span>
                    </span>
                    <span className="text-slate-400 font-medium tabular-nums">
                      Rp {formatRupiah(ppnIncluded)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">PPN</span>
                  <span className="text-slate-800 font-medium tabular-nums">
                    Rp {formatRupiah(ppnAddedToTotal)}
                  </span>
                </div>
                <div className="border-t border-slate-200 pt-2.5 flex justify-between">
                  <span className="text-slate-700 font-semibold">Total</span>
                  <span className="text-indigo-700 font-semibold tabular-nums">
                    Rp {formatRupiah(grandTotal)}
                  </span>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg px-4 py-2.5">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        {!loading && !loadError && (
          <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-2 rounded-b-2xl">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Kembali
            </button>
            <button
              onClick={() => save(false)}
              disabled={!!submitting}
              className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 rounded-lg font-medium transition-colors"
            >
              {submitting === 'save' ? 'Menyimpan...' : 'Simpan Draft'}
            </button>
            {isEdit && (
              <button
                onClick={() => save(true)}
                disabled={!!submitting}
                className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                {submitting === 'submit'
                  ? 'Mengajukan...'
                  : 'Simpan & Ajukan ke Kabag'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Master barang picker */}
      <Dialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Pilih Barang</DialogTitle>
        <DialogContent>
          <div className="flex gap-2 mb-3 mt-1">
            <input
              type="text"
              value={pickerSearch}
              onChange={(e) => setPickerSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchPicker(pickerSearch)}
              placeholder="Cari nama atau kode barang..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={() => fetchPicker(pickerSearch)}
              className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Cari
            </button>
          </div>
          {pickerLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-7 w-7 border-2 border-indigo-500 border-t-transparent" />
            </div>
          ) : (
            (() => {
              const results = pickerResults.filter((m) => !usedIds.has(m.id));
              return results.length === 0 ? (
                <p className="text-center text-sm text-slate-400 py-10">
                  Tidak ada barang ditemukan.
                </p>
              ) : (
                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto -mx-1">
                  {results.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => pickItem(m)}
                      className="w-full text-left px-3 py-2.5 hover:bg-slate-50 rounded-lg flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-800 truncate">
                          {m.nama_barang}
                        </div>
                        <div className="text-xs text-slate-400 truncate">
                          {m.kode_barang || '-'} ·{' '}
                          {brandMap.get(m.id_brand) || m.brand_name || '-'} ·{' '}
                          {m.sub_kategori || m.kategori || '-'}
                        </div>
                      </div>
                      <div className="shrink-0 text-xs text-slate-500 tabular-nums">
                        Rp {formatRupiah(m.harga || 0)}
                      </div>
                    </button>
                  ))}
                </div>
              );
            })()
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default POBookingFormModal;
