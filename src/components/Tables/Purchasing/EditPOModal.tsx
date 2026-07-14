import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import {
  MasterVendorItem,
  MasterVendorListResponse,
  PurchaseOrder,
  PurchaseOrderDetailResponse,
  UpdatePurchaseOrderItemPayload,
  UpdatePurchaseOrderPayload,
} from './Types/Purchasing.types';
import { formatRupiah, getStatusColor, getStatusLabel } from './Types/poStatus';

// Local editable row shape. Mirrors UpdatePurchaseOrderItemPayload but keeps
// a `pajak_persen` used only to recompute `ppn` client-side as qty/harga
// change — the API itself only wants the resulting `ppn` amount, not a rate.
type EditableRow = UpdatePurchaseOrderItemPayload & {
  rowId: string;
  pajak_persen: number;
  // Mandatory-tax items (master item is_include_tax) can never have PPN
  // unchecked — same rule as CreatePOModal.
  is_tax_locked: boolean;
};

const DEFAULT_PPN_PERSEN = 11;

const toEditableRows = (
  items: UpdatePurchaseOrderItemPayload[] | undefined,
): EditableRow[] =>
  (items || []).map((item, i) => {
    // NOTE: assumes the detail endpoint returns each item's master-item tax
    // flag (e.g. under `detail_item.is_include_tax`, same shape as
    // PengajuanItem in CreatePOModal). If your API doesn't include this on
    // the PO detail response yet, is_tax_locked will just default to false
    // and behave like before — add the field to the response to enable it.
    const detail = (
      item as unknown as {
        detail_item?: { is_include_tax?: boolean; pajak?: number };
      }
    ).detail_item;
    const isTaxLocked = !!detail?.is_include_tax;

    return {
      ...item,
      rowId: item.id ? `existing-${item.id}` : `new-${i}-${Date.now()}`,
      pajak_persen:
        detail?.pajak ??
        (item.qty_beli && item.harga && item.ppn
          ? Math.round((item.ppn / (item.qty_beli * item.harga)) * 100)
          : DEFAULT_PPN_PERSEN),
      is_tax_locked: isTaxLocked,
      is_ppn: isTaxLocked ? true : item.is_ppn,
    };
  });

const toISODate = (value?: string): string => (value ? value.slice(0, 10) : '');

type EditPOModalProps = {
  idPo: number;
  onClose: () => void;
  onSaved: () => void;
};

const EditPOModal: React.FC<EditPOModalProps> = ({
  idPo,
  onClose,
  onSaved,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [po, setPo] = useState<PurchaseOrder | null>(null);
  const [loadError, setLoadError] = useState<string>('');

  const [noPurchaseOrder, setNoPurchaseOrder] = useState<string>('');
  const [tglPO, setTglPO] = useState<string>('');
  const [tglKirim, setTglKirim] = useState<string>('');
  const [noteSupplier, setNoteSupplier] = useState<string>('');
  const [noteInternal, setNoteInternal] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);
  const [rows, setRows] = useState<EditableRow[]>([]);

  // --- Vendor (sourced from Master Vendor, filtered by tipe_vendor — same
  // pattern as CreatePOModal, instead of a free-text vendor name field) ---
  const [vendors, setVendors] = useState<MasterVendorItem[]>([]);
  const [vendorsLoading, setVendorsLoading] = useState<boolean>(true);
  const [vendorId, setVendorId] = useState<number | ''>('');

  const [submitting, setSubmitting] = useState<false | 'save' | 'submit'>(
    false,
  );
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchDetail = async () => {
      const url = `${
        import.meta.env.VITE_API_LINK
      }/purchasing/purchaseOrder/${idPo}`;
      try {
        setLoading(true);
        const res = await axios.get<PurchaseOrderDetailResponse>(url, {
          withCredentials: true,
        });
        const detail = res.data.data;
        setPo(detail);
        setNoPurchaseOrder(detail.no_purchase_order || '');
        // NOTE: assumes PurchaseOrder carries id_vendor (same as the payload
        // CreatePOModal sends). If your detail response only has
        // nama_vendor today, add id_vendor to it so the dropdown can
        // preselect the right vendor.
        setVendorId(
          (detail as unknown as { id_vendor?: number | null }).id_vendor ?? '',
        );
        setTglPO(toISODate(detail.tgl_po));
        setTglKirim(toISODate(detail.tgl_kirim));
        setNoteSupplier(detail.note_supplier || '');
        setNoteInternal(detail.note_internal || '');
        setDiscount(detail.discount || 0);
        setRows(toEditableRows(detail.items));
      } catch (err) {
        console.error('Error fetching PO detail:', err);
        setLoadError('Gagal memuat detail PO. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [idPo]);

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

  // If the currently selected vendor drops out of the filtered list (e.g.
  // the user removed the only row of the category it services), clear it —
  // same guard as CreatePOModal. Skipped while vendors are still loading so
  // the initial vendor from the PO isn't cleared before the first fetch.
  useEffect(() => {
    if (vendorsLoading) return;
    if (vendorId !== '' && !vendors.some((v) => v.id === vendorId)) {
      setVendorId('');
    }
  }, [vendors, vendorId, vendorsLoading]);

  const selectedVendor = useMemo(
    () => vendors.find((v) => v.id === vendorId) || null,
    [vendors, vendorId],
  );

  const updateRow = (rowId: string, patch: Partial<EditableRow>) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.rowId !== rowId) return r;
        const updated = { ...r, ...patch };
        // Mandatory-tax items can never be unchecked, regardless of what
        // patch tried to set — same rule as CreatePOModal.
        if (updated.is_tax_locked) updated.is_ppn = true;
        updated.total = updated.qty_beli * updated.harga;
        updated.ppn = updated.is_ppn
          ? Math.round(updated.total * (updated.pajak_persen / 100))
          : 0;
        return updated;
      }),
    );
  };

  // Item deletion intentionally does not exist on the Edit form — once a PO
  // has line items, rows can be edited but not removed here.

  const subTotal = useMemo(
    () => rows.reduce((sum, r) => sum + r.qty_beli * r.harga, 0),
    [rows],
  );
  const totalPPN = useMemo(
    () => rows.reduce((sum, r) => sum + r.ppn, 0),
    [rows],
  );
  const grandTotal = subTotal - (discount || 0) + totalPPN;

  const isRejected =
    po?.status === 'reject kabag' || po?.status === 'reject finance';

  const buildPayload = (): UpdatePurchaseOrderPayload =>
    ({
      sub_total: subTotal,
      discount: discount || 0,
      ppn: totalPPN,
      total: grandTotal,
      no_purchase_order: noPurchaseOrder,
      // NOTE: assumes UpdatePurchaseOrderPayload accepts id_vendor, mirroring
      // CreatePurchaseOrderPayload. If your update endpoint still only takes
      // nama_vendor, keep only the nama_vendor line below.
      id_vendor: vendorId === '' ? null : vendorId,
      nama_vendor: selectedVendor?.nama_vendor || '',
      tgl_po: tglPO,
      tgl_kirim: tglKirim,
      note_internal: noteInternal,
      note_supplier: noteSupplier,
      items: rows.map((r) => ({
        ...(r.id ? { id: r.id, id_purchase_order: idPo } : {}),
        id_item: r.id_item,
        nama_item: r.nama_item,
        qty: r.qty || r.qty_beli,
        qty_beli: r.qty_beli,
        tipe_barang: r.tipe_barang,
        satuan: r.satuan,
        harga: r.harga,
        total: r.qty_beli * r.harga,
        ppn: r.ppn,
        is_ppn: r.is_ppn,
      })),
    }) as UpdatePurchaseOrderPayload;

  const validate = (): string => {
    if (!vendorId) return 'Vendor wajib dipilih.';
    if (rows.length === 0) return 'Minimal 1 item diperlukan.';
    for (const r of rows) {
      if (!r.nama_item.trim()) return 'Nama barang tidak boleh kosong.';
      if (r.qty_beli <= 0)
        return `Qty beli untuk "${r.nama_item}" harus lebih dari 0.`;
      if (r.harga < 0)
        return `Harga untuk "${r.nama_item}" tidak boleh negatif.`;
    }
    return '';
  };

  const handleSaveDraft = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setSubmitting('save');
    try {
      const url = `${
        import.meta.env.VITE_API_LINK
      }/purchasing/purchaseOrder/${idPo}`;
      await axios.put(url, buildPayload(), { withCredentials: true });
      onSaved();
    } catch (err) {
      console.error('Error updating PO:', err);
      setError('Gagal menyimpan perubahan. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveAndSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setSubmitting('submit');
    try {
      const baseUrl = `${
        import.meta.env.VITE_API_LINK
      }/purchasing/purchaseOrder`;
      // Persist edits first, then move the ticket to "request kabag".
      await axios.put(`${baseUrl}/${idPo}`, buildPayload(), {
        withCredentials: true,
      });
      await axios.put(`${baseUrl}/request/${idPo}`, undefined, {
        withCredentials: true,
      });
      onSaved();
    } catch (err) {
      console.error('Error submitting PO:', err);
      setError('Gagal mengajukan PO ke Kabag. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-full max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              Edit Purchase Order
              {po && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ring-1 font-medium ${getStatusColor(
                    po.status,
                  )}`}
                >
                  {getStatusLabel(po.status)}
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {po ? po.no_purchase_order : 'Memuat...'}
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
                PO ini ditolak ({getStatusLabel(po?.status)}). Perbaiki data di
                bawah lalu ajukan kembali ke Kabag.
              </div>
            )}

            {/* PO meta */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Nomor PO
                </label>
                <input
                  type="text"
                  value={noPurchaseOrder}
                  onChange={(e) => setNoPurchaseOrder(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
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
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Nama Barang
                      </th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide w-28">
                        Tipe Barang
                      </th>
                      <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide w-28">
                        Qty Beli
                      </th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide w-20">
                        Unit
                      </th>
                      <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide w-32">
                        Harga
                      </th>
                      <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide w-32">
                        Total
                      </th>
                      <th className="px-3 py-2.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide w-20">
                        Pajak
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.map((row) => (
                      <tr key={row.rowId} className="hover:bg-slate-50/60">
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={row.nama_item}
                            onChange={(e) =>
                              updateRow(row.rowId, {
                                nama_item: e.target.value,
                              })
                            }
                            placeholder="Nama barang"
                            className="w-56 px-2 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={row.tipe_barang}
                            onChange={(e) =>
                              updateRow(row.rowId, {
                                tipe_barang: e.target.value,
                              })
                            }
                            className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </td>
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
                          {formatRupiah(row.qty_beli * row.harga)}
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
                    onChange={(e) =>
                      setDiscount(parseFloat(e.target.value) || 0)
                    }
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
              onClick={handleSaveDraft}
              disabled={!!submitting}
              className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 rounded-lg font-medium transition-colors"
            >
              {submitting === 'save' ? 'Menyimpan...' : 'Simpan Draft'}
            </button>
            <button
              onClick={handleSaveAndSubmit}
              disabled={!!submitting}
              className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {submitting === 'submit'
                ? 'Mengajukan...'
                : 'Simpan & Ajukan ke Kabag'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditPOModal;
