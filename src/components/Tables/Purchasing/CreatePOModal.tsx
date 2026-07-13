import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import {
  CreatePurchaseOrderPayload,
  PengajuanItem,
  POBuilderRow,
  PurchaseOrderNoResponse,
} from './Types/Purchasing.types';

const PPN_RATE = 0.11;

interface CreatePOModalProps {
  mode: 'from_selection' | 'manual';
  selectedItems: PengajuanItem[];
  onClose: () => void;
  onSuccess: () => void;
}

const todayISO = (): string => new Date().toISOString().slice(0, 10);

const buildRowsFromSelection = (items: PengajuanItem[]): POBuilderRow[] => {
  const groups = new Map<string, POBuilderRow>();
  items.forEach((item) => {
    const key = String(item.id_item);
    const existing = groups.get(key);
    if (existing) {
      existing.qty_bom += item.qty;
      existing.qty_beli += item.qty;
      existing.sources.push({ id: item.id, no_jo: item.no_jo, qty: item.qty });
    } else {
      groups.set(key, {
        rowId: key,
        id_item: item.id_item ?? 0,
        kode_barang: undefined,
        nama_barang: item.nama_item,
        tipe_barang: item.tipe_barang || '',
        satuan: item.satuan || '',
        qty_bom: item.qty,
        qty_beli: item.qty,
        harga: 0,
        is_ppn: false,
        ppn: 0,
        sources: [{ id: item.id, no_jo: item.no_jo, qty: item.qty }],
      });
    }
  });
  return Array.from(groups.values());
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
  kode_barang: '',
  nama_barang: '',
  tipe_barang: '',
  satuan: '',
  qty_bom: 0,
  qty_beli: 0,
  harga: 0,
  is_ppn: false,
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
  const [vendor, setVendor] = useState<string>('');
  const [tglPO, setTglPO] = useState<string>(todayISO());
  const [tglKirim, setTglKirim] = useState<string>(todayISO());
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

  const updateRow = (rowId: string, patch: Partial<POBuilderRow>) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.rowId !== rowId) return r;
        const updated = { ...r, ...patch };
        if (updated.is_ppn) {
          updated.ppn = Math.round(updated.qty_beli * updated.harga * PPN_RATE);
        } else {
          updated.ppn = 0;
        }
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
    if (!vendor.trim()) return 'Vendor wajib diisi.';
    if (rows.length === 0) return 'Minimal 1 item diperlukan.';
    for (const r of rows) {
      if (!r.nama_barang.trim()) return 'Nama barang tidak boleh kosong.';
      if (r.qty_beli <= 0)
        return `Qty beli untuk "${r.nama_barang}" harus lebih dari 0.`;
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
      nama_vendor: vendor.trim(),
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
        nama_item: r.nama_barang,
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[92vh] overflow-y-auto">
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
              <input
                type="text"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                placeholder="Nama vendor"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
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
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Kode Barang
                    </th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Nama Barang
                    </th>
                    {mode === 'from_selection' && (
                      <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Qty BOM
                      </th>
                    )}
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
                    <th className="px-3 py-2.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide w-16">
                      Pajak
                    </th>
                    <th className="px-3 py-2.5 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((row) => (
                    <tr key={row.rowId} className="hover:bg-slate-50/60">
                      <td className="px-3 py-2">
                        {mode === 'manual' ? (
                          <input
                            type="text"
                            value={row.kode_barang}
                            onChange={(e) =>
                              updateRow(row.rowId, {
                                kode_barang: e.target.value,
                              })
                            }
                            className="w-28 px-2 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        ) : (
                          <span className="text-xs text-slate-500">
                            {row.kode_barang || '-'}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {mode === 'manual' ? (
                          <input
                            type="text"
                            value={row.nama_barang}
                            onChange={(e) =>
                              updateRow(row.rowId, {
                                nama_barang: e.target.value,
                              })
                            }
                            placeholder="Nama barang"
                            className="w-52 px-2 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        ) : (
                          <span className="text-slate-800 font-medium">
                            {row.nama_barang}
                          </span>
                        )}
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
                        <input
                          type="checkbox"
                          checked={row.is_ppn}
                          onChange={(e) =>
                            updateRow(row.rowId, { is_ppn: e.target.checked })
                          }
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
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
