import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import {
  CreatePurchaseOrderPayload,
  MasterVendorItem,
  MasterVendorListResponse,
  PengajuanItem,
  POBuilderRow,
  PurchaseOrderNoResponse,
} from './Types/Purchasing.types';

// Fallback PPN rate only used for brand-new manual rows that have no
// detail_item to source a real tax rate from (Indonesian standard PPN).
const DEFAULT_PPN_PERSEN = 11;

interface CreatePOModalProps {
  mode: 'from_selection' | 'manual';
  selectedItems: PengajuanItem[];
  onClose: () => void;
  onSuccess: () => void;
}

const todayISO = (): string => new Date().toISOString().slice(0, 10);

// One row per distinct id_item, aggregated across every source pengajuan
// line that shares it. Price, brand, tax-lock and tax rate are all seeded
// from that item's detail_item, since that's the only place they exist.
const buildRowsFromSelection = (items: PengajuanItem[]): POBuilderRow[] => {
  const groups = new Map<string, POBuilderRow>();

  items.forEach((item) => {
    const key = String(item.id_item);
    const detail = item.detail_item;
    const isTaxLocked = !!detail?.is_include_tax;
    const pajakPersen = detail?.pajak ?? DEFAULT_PPN_PERSEN;

    const existing = groups.get(key);
    if (existing) {
      existing.qty_bom += item.qty;
      existing.qty_beli += item.qty;
      existing.sources.push({
        id: item.id,
        no_jo: item.no_jo,
        qty: item.qty,
        tgl_kirim: item.tgl_kirim,
      });
    } else {
      groups.set(key, {
        rowId: key,
        id_item: item.id_item ?? 0,
        id_brand: item.id_brand ?? detail?.id_brand ?? null,
        nama_brand: item.nama_brand || '',
        kode_barang: detail?.kode_barang || '',
        nama_barang: item.nama_item,
        tipe_barang: item.tipe_barang || '',
        satuan: item.satuan || '',
        qty_bom: item.qty,
        qty_beli: item.qty,
        // Prefill from the master item price, still fully editable below.
        harga: detail?.harga ?? 0,
        // Mandatory-tax items (is_include_tax) start checked; optional-tax
        // items start unchecked and the user opts in.
        is_ppn: isTaxLocked,
        is_tax_locked: isTaxLocked,
        pajak_persen: pajakPersen,
        ppn: 0,
        sources: [
          {
            id: item.id,
            no_jo: item.no_jo,
            qty: item.qty,
            tgl_kirim: item.tgl_kirim,
          },
        ],
      });
    }
  });

  const rows = Array.from(groups.values());
  // Compute the initial ppn now that harga/qty/pajak_persen are all set.
  rows.forEach((r) => {
    r.ppn = r.is_ppn
      ? Math.round(r.qty_beli * r.harga * (r.pajak_persen / 100))
      : 0;
  });
  return rows;
};

const buildInternalNote = (rows: POBuilderRow[]): string =>
  rows
    .filter((r) => r.sources.length > 0)
    .map((r) => {
      const lines = r.sources
        .map((s, i) => `${i + 1}. ${s.no_jo} - Qty: ${s.qty}`)
        .join('\n');
      return `-${r.nama_barang}\n${lines}`;
    })
    .join('\n');

const emptyManualRow = (): POBuilderRow => ({
  rowId: `manual-${Date.now()}-${Math.random()}`,
  id_item: 0,
  id_brand: null,
  nama_brand: '',
  kode_barang: '',
  nama_barang: '',
  tipe_barang: '',
  satuan: '',
  qty_bom: 0,
  qty_beli: 0,
  harga: 0,
  is_ppn: false,
  is_tax_locked: false,
  pajak_persen: DEFAULT_PPN_PERSEN,
  ppn: 0,
  sources: [],
});

const CreatePOModal: React.FC<CreatePOModalProps> = ({
  mode,
  selectedItems,
  onClose,
  onSuccess,
}) => {
  const [rows, setRows] = useState<POBuilderRow[]>(() =>
    mode === 'from_selection'
      ? buildRowsFromSelection(selectedItems)
      : [emptyManualRow()],
  );
  const [noPO, setNoPO] = useState<string>('');
  const [loadingNo, setLoadingNo] = useState<boolean>(true);

  // --- Vendor (now sourced from Master Vendor, filtered by tipe_vendor) ---
  const [vendors, setVendors] = useState<MasterVendorItem[]>([]);
  const [vendorsLoading, setVendorsLoading] = useState<boolean>(true);
  const [vendorId, setVendorId] = useState<number | ''>('');

  const [tglPO, setTglPO] = useState<string>(todayISO());
  const [noteSupplier, setNoteSupplier] = useState<string>('');
  const [noteInternal, setNoteInternal] = useState<string>(() =>
    mode === 'from_selection'
      ? buildInternalNote(buildRowsFromSelection(selectedItems))
      : '',
  );
  const [discount, setDiscount] = useState<number>(0);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchNo = async () => {
      const url = `${
        import.meta.env.VITE_API_LINK
      }/purchasing/purchaseOrder/getNo/new`;
      try {
        setLoadingNo(true);
        const res = await axios.get<PurchaseOrderNoResponse>(url, {
          withCredentials: true,
        });
        setNoPO(
          res.data.no_purchase_order_new || res.data.no_purchase_order || '',
        );
      } catch (err) {
        console.error('Error fetching PO number:', err);
      } finally {
        setLoadingNo(false);
      }
    };
    fetchNo();
  }, []);

  // Raw tipe_barang values currently on the item rows, e.g. ["kertas", "coating"].
  // Used to filter the vendor list to only vendors that carry those categories.
  const uniqueTipeBarang = useMemo(
    () => Array.from(new Set(rows.map((r) => r.tipe_barang).filter(Boolean))),
    [rows],
  );
  const tipeBarangKey = uniqueTipeBarang.join(',');

  useEffect(() => {
    const fetchVendors = async () => {
      const url = `${
        import.meta.env.VITE_API_LINK
      }/master/marketing/vendor/list`;
      try {
        setVendorsLoading(true);
        const res = await axios.get<MasterVendorListResponse>(url, {
          params: {
            limit: 100,
            is_active: true,
            // Same pattern as the pengajuan list's tipe_barang filter: pass
            // the raw array through, the API folds it into one multi-value
            // tipe_vendor filter (e.g. tipe_vendor=kertas&tipe_vendor=lem).
            tipe_vendor:
              uniqueTipeBarang.length > 0 ? uniqueTipeBarang : undefined,
          },
          withCredentials: true,
        });
        setVendors(res.data.data || []);
      } catch (err) {
        console.error('Error fetching vendor list:', err);
        setVendors([]);
      } finally {
        setVendorsLoading(false);
      }
    };
    fetchVendors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipeBarangKey]);

  // If the previously selected vendor drops out of the filtered list (e.g.
  // the user removed the only row of the category it services), clear it.
  useEffect(() => {
    if (vendorId !== '' && !vendors.some((v) => v.id === vendorId)) {
      setVendorId('');
    }
  }, [vendors, vendorId]);

  const selectedVendor = useMemo(
    () => vendors.find((v) => v.id === vendorId) || null,
    [vendors, vendorId],
  );

  // --- Tanggal kirim: defaults from the pengajuan data, but always editable ---
  const derivedTglKirim = useMemo(() => {
    if (mode !== 'from_selection' || selectedItems.length === 0) {
      return todayISO();
    }
    const times = selectedItems
      .map((i) => i.tgl_kirim)
      .filter(Boolean)
      .map((d) => new Date(d as string).getTime())
      .filter((t) => !Number.isNaN(t));
    if (times.length === 0) return todayISO();
    // Earliest requested delivery date among the grouped sources.
    return new Date(Math.min(...times)).toISOString().slice(0, 10);
  }, [mode, selectedItems]);

  const [tglKirim, setTglKirim] = useState<string>(derivedTglKirim);
  useEffect(() => {
    setTglKirim(derivedTglKirim);
  }, [derivedTglKirim]);

  const updateRow = (rowId: string, patch: Partial<POBuilderRow>) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.rowId !== rowId) return r;
        const updated = { ...r, ...patch };
        // Mandatory-tax items (is_include_tax on the master item) can never
        // be unchecked, regardless of what patch tried to set.
        if (updated.is_tax_locked) updated.is_ppn = true;
        updated.ppn = updated.is_ppn
          ? Math.round(
              updated.qty_beli * updated.harga * (updated.pajak_persen / 100),
            )
          : 0;
        return updated;
      }),
    );
  };

  const removeRow = (rowId: string) => {
    setRows((prev) => prev.filter((r) => r.rowId !== rowId));
  };

  const addManualRow = () => {
    setRows((prev) => [...prev, emptyManualRow()]);
  };

  const rowTotal = (row: POBuilderRow) => row.qty_beli * row.harga;

  const subTotal = useMemo(
    () => rows.reduce((sum, r) => sum + rowTotal(r), 0),
    [rows],
  );
  const totalPPN = useMemo(
    () => rows.reduce((sum, r) => sum + r.ppn, 0),
    [rows],
  );
  const grandTotal = subTotal - (discount || 0) + totalPPN;

  const formatRupiah = (value: number): string =>
    value.toLocaleString('id-ID', { maximumFractionDigits: 0 });

  const validate = (): string => {
    if (!vendorId) return 'Vendor wajib dipilih.';
    if (rows.length === 0) return 'Minimal 1 item diperlukan.';
    for (const r of rows) {
      if (!r.nama_barang.trim()) return 'Nama barang tidak boleh kosong.';
      if (r.qty_beli <= 0)
        return `Qty beli untuk "${r.nama_barang}" harus lebih dari 0.`;
      if (r.harga < 0)
        return `Harga untuk "${r.nama_barang}" tidak boleh negatif.`;
    }
    return '';
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setSubmitting(true);

    const payload: CreatePurchaseOrderPayload = {
      id_vendor: vendorId === '' ? null : vendorId,
      nama_vendor: selectedVendor?.nama_vendor || '',
      tgl_po: tglPO,
      tgl_kirim: tglKirim,
      sub_total: subTotal,
      ppn: totalPPN,
      discount: discount || 0,
      total: grandTotal,
      note_internal: noteInternal,
      note_supplier: noteSupplier,
      items: rows.map((r) => ({
        id_item: r.id_item,
        id_brand: r.id_brand,
        nama_item: r.nama_barang,
        nama_brand: r.nama_brand,
        kode_barang: r.kode_barang,
        qty: r.qty_bom || r.qty_beli,
        qty_beli: r.qty_beli,
        tipe_barang: r.tipe_barang,
        satuan: r.satuan,
        harga: r.harga,
        total: rowTotal(r),
        ppn: r.ppn,
        is_ppn: r.is_ppn,
      })),
      request_purchase_data: Array.from(
        new Set(rows.flatMap((r) => r.sources.map((s) => s.id))),
      ).map((id) => ({ id })),
    };

    try {
      console.log('Submitting PO payload:', payload);
      const url = `${import.meta.env.VITE_API_LINK}/purchasing/purchaseOrder`;
      await axios.post(url, payload, { withCredentials: true });
      onSuccess();
    } catch (err) {
      console.error('Error creating PO:', err);
      setError('Gagal menyimpan draft PO. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrintDraft = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-full max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Buat Purchase Order
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {mode === 'from_selection'
                ? `Digabung dari ${selectedItems.length} baris pengajuan`
                : 'Entri manual'}
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

        <div className="p-6 space-y-6">
          {/* PO meta */}
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
                  {vendorsLoading
                    ? 'Memuat vendor...'
                    : vendors.length === 0
                    ? 'Tidak ada vendor untuk kategori ini'
                    : 'Pilih vendor'}
                </option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.nama_vendor}
                  </option>
                ))}
              </select>
              {!vendorsLoading && uniqueTipeBarang.length > 0 && (
                <p className="text-[11px] text-slate-400 mt-1">
                  Difilter berdasarkan kategori: {uniqueTipeBarang.join(', ')}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Nomor PO
              </label>
              <input
                type="text"
                value={loadingNo ? 'Memuat...' : noPO}
                onChange={(e) => setNoPO(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

          {/* Items table */}
          <div className="border border-slate-100 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm table-fixed">
                <colgroup>
                  <col className="w-[14%]" />
                  <col className="w-[26%]" />
                  <col className="w-[16%]" />
                  {mode === 'from_selection' && <col className="w-20" />}
                  <col className="w-24" />
                  <col className="w-20" />
                  <col className="w-28" />
                  <col className="w-28" />
                  <col className="w-16" />
                  <col className="w-10" />
                </colgroup>
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Kode Barang
                    </th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Nama Barang
                    </th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Brand
                    </th>
                    {mode === 'from_selection' && (
                      <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Qty BOM
                      </th>
                    )}
                    <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Qty Beli
                    </th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Unit
                    </th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Harga
                    </th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Total
                    </th>
                    <th className="px-3 py-2.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Pajak
                    </th>
                    <th className="px-3 py-2.5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((row) => (
                    <tr key={row.rowId} className="hover:bg-slate-50/60">
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={row.kode_barang}
                          onChange={(e) =>
                            updateRow(row.rowId, {
                              kode_barang: e.target.value,
                            })
                          }
                          className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={row.nama_barang}
                          onChange={(e) =>
                            updateRow(row.rowId, {
                              nama_barang: e.target.value,
                            })
                          }
                          placeholder="Nama barang"
                          className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={row.nama_brand}
                          onChange={(e) =>
                            updateRow(row.rowId, {
                              nama_brand: e.target.value,
                            })
                          }
                          placeholder="Brand"
                          className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </td>
                      {mode === 'from_selection' && (
                        <td className="px-3 py-2 text-right tabular-nums text-slate-600">
                          {row.qty_bom}
                        </td>
                      )}
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min={0}
                          value={row.qty_beli}
                          onChange={(e) =>
                            updateRow(row.rowId, {
                              qty_beli: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full px-2 py-1.5 text-sm text-right border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={row.satuan}
                          onChange={(e) =>
                            updateRow(row.rowId, { satuan: e.target.value })
                          }
                          className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min={0}
                          value={row.harga}
                          onChange={(e) =>
                            updateRow(row.rowId, {
                              harga: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full px-2 py-1.5 text-sm text-right border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-slate-800 font-medium">
                        {formatRupiah(rowTotal(row))}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <input
                            type="checkbox"
                            checked={row.is_ppn}
                            disabled={row.is_tax_locked}
                            onChange={(e) =>
                              updateRow(row.rowId, {
                                is_ppn: e.target.checked,
                              })
                            }
                            title={
                              row.is_tax_locked
                                ? 'Pajak wajib untuk barang ini dan tidak dapat dilepas'
                                : `PPN ${row.pajak_persen}% jika dicentang`
                            }
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-70"
                          />
                          <span className="text-[10px] text-slate-400">
                            {row.pajak_persen}%
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={() => removeRow(row.rowId)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                          aria-label="Hapus baris"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {mode === 'manual' && (
              <div className="border-t border-slate-100 px-3 py-2">
                <button
                  onClick={addManualRow}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  + Tambah baris
                </button>
              </div>
            )}
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
                  rows={5}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono text-xs"
                />
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 h-fit space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="text-slate-800 font-medium tabular-nums">
                  Rp {formatRupiah(subTotal)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Discount</span>
                <input
                  type="number"
                  min={0}
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-32 px-2 py-1 text-sm text-right border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">PPN</span>
                <span className="text-slate-800 font-medium tabular-nums">
                  Rp {formatRupiah(totalPPN)}
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

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-2 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Kembali
          </button>
          <button
            onClick={handlePrintDraft}
            className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
          >
            Print Draft
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            {submitting ? 'Menyimpan...' : 'Simpan Draft'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePOModal;
