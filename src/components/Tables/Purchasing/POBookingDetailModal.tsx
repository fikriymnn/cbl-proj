import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  PurchaseOrderBooking,
  PurchaseOrderBookingDetailResponse,
} from './Types/Purchasing.types';
import { poBaseUrl, getApiErrorMessage } from './Types/poApi';
import {
  formatDate,
  formatRupiah,
  getStatusColor,
  getStatusLabel,
} from './Types/poStatus';

/* =============================================================================
 * POBookingDetailModal — detail read-only PO Booking.
 *
 * - Tanpa prop `role`  -> hanya melihat (dipakai di halaman riwayat).
 * - Dengan `role`      -> tombol Tolak / Setujui muncul dan memanggil
 *     PUT {base}/purchaseOrderBooking/{approveKabag|rejectKabag|
 *                                       approveFinance|rejectFinance}/:id
 *   Backend tidak memvalidasi status, jadi pemanggil HANYA boleh memberi
 *   `role` ketika tiket memang sedang menunggu role tsb (POApprovalListPage
 *   melakukannya lewat tab "Menunggu Approval").
 * ========================================================================== */

type ApprovalRole = 'kabag' | 'finance';

const ROLE_ENDPOINT: Record<ApprovalRole, { approve: string; reject: string }> =
  {
    kabag: { approve: 'approveKabag', reject: 'rejectKabag' },
    finance: { approve: 'approveFinance', reject: 'rejectFinance' },
  };

type Props = {
  idPo: number;
  role?: ApprovalRole;
  onClose: () => void;
  onDecided?: () => void;
};

const fmtQty = (n: number): string =>
  (n || 0).toLocaleString('id-ID', { maximumFractionDigits: 2 });

const POBookingDetailModal: React.FC<Props> = ({
  idPo,
  role,
  onClose,
  onDecided,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [po, setPo] = useState<PurchaseOrderBooking | null>(null);
  const [loadError, setLoadError] = useState<string>('');
  const [deciding, setDeciding] = useState<false | 'approve' | 'reject'>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await axios.get<PurchaseOrderBookingDetailResponse>(
          `${poBaseUrl('booking')}/${idPo}`,
          { withCredentials: true },
        );
        setPo(res.data.data);
      } catch (err) {
        console.error('Error fetching PO booking detail:', err);
        setLoadError('Gagal memuat detail PO Booking.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [idPo]);

  const items = po?.items || [];
  const subTotal = items.reduce((s, it) => s + it.qty_beli * it.harga, 0);
  const ppnIncluded = items
    .filter((it) => it.master_barang?.is_include_tax)
    .reduce((s, it) => s + (it.ppn || 0), 0);
  const ppnAdded = items
    .filter((it) => !it.master_barang?.is_include_tax && it.is_ppn)
    .reduce((s, it) => s + (it.ppn || 0), 0);
  const discount = po?.discount || 0;
  const grandTotal = subTotal - discount + ppnAdded;

  const runAction = async (action: 'approve' | 'reject') => {
    if (!role) return;
    const label = action === 'approve' ? 'menyetujui' : 'menolak';
    if (!window.confirm(`Yakin ingin ${label} PO Booking ini?`)) return;
    setError('');
    setDeciding(action);
    try {
      const endpoint = ROLE_ENDPOINT[role][action];
      await axios.put(
        `${poBaseUrl('booking')}/${endpoint}/${idPo}`,
        undefined,
        {
          withCredentials: true,
        },
      );
      onDecided?.();
    } catch (err) {
      console.error(`Error on ${action} PO booking:`, err);
      setError(
        getApiErrorMessage(
          err,
          action === 'approve'
            ? 'Gagal menyetujui PO Booking.'
            : 'Gagal menolak PO Booking.',
        ),
      );
    } finally {
      setDeciding(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-full max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              Detail PO Booking
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
        ) : loadError || !po ? (
          <div className="px-6 py-14 text-center">
            <p className="text-red-600 text-sm font-medium">
              {loadError || 'PO Booking tidak ditemukan.'}
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-slate-400 mb-1">Vendor</div>
                <div className="text-sm font-medium text-slate-800">
                  {po.nama_vendor || '-'}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1">Tanggal PO</div>
                <div className="text-sm text-slate-700">
                  {formatDate(po.tgl_po)}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1">Tanggal Kirim</div>
                <div className="text-sm text-slate-700">
                  {formatDate(po.tgl_kirim)}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1">Status PO</div>
                <div className="text-sm text-slate-700">
                  {po.status_po === 'done' ? 'Selesai' : 'Progress'}
                </div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      {[
                        ['Nama Barang', 'left'],
                        ['Brand', 'left'],
                        ['Qty Beli', 'right'],
                        ['Terkirim', 'right'],
                        ['Sisa', 'right'],
                        ['Dipakai', 'right'],
                        ['Unit', 'left'],
                        ['Harga', 'right'],
                        ['Total', 'right'],
                      ].map(([label, align]) => (
                        <th
                          key={label}
                          className={`px-3 py-2 text-${align} text-[11px] font-semibold text-slate-400 uppercase tracking-wide`}
                        >
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {items.length === 0 ? (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-4 py-10 text-center text-slate-400 text-sm"
                        >
                          Tidak ada item.
                        </td>
                      </tr>
                    ) : (
                      items.map((it) => (
                        <tr key={it.id} className="hover:bg-slate-50/60">
                          <td className="px-3 py-2.5 text-slate-800 font-medium">
                            {it.nama_item}
                          </td>
                          <td className="px-3 py-2.5 text-slate-600">
                            {it.nama_brand || '-'}
                          </td>
                          <td className="px-3 py-2.5 text-right tabular-nums text-slate-700">
                            {fmtQty(it.qty_beli)}
                          </td>
                          <td className="px-3 py-2.5 text-right tabular-nums text-slate-700">
                            {fmtQty(it.qty_terkirim)}
                          </td>
                          <td className="px-3 py-2.5 text-right tabular-nums text-slate-700">
                            {fmtQty(it.qty_sisa)}
                          </td>
                          <td className="px-3 py-2.5 text-right tabular-nums text-slate-700">
                            {fmtQty(it.qty_pakai)}
                          </td>
                          <td className="px-3 py-2.5 text-slate-500">
                            {it.satuan || '-'}
                          </td>
                          <td className="px-3 py-2.5 text-right tabular-nums text-slate-700">
                            {formatRupiah(it.harga)}
                          </td>
                          <td className="px-3 py-2.5 text-right tabular-nums text-slate-800 font-medium">
                            {formatRupiah(it.qty_beli * it.harga)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <div className="text-xs font-medium text-slate-500 mb-1.5">
                    Catatan Ke Supplier
                  </div>
                  <p className="text-sm text-slate-700 bg-slate-50 rounded-lg px-3 py-2.5 min-h-[2.5rem]">
                    {po.note_supplier || '-'}
                  </p>
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500 mb-1.5">
                    Catatan Internal
                  </div>
                  <p className="text-sm text-slate-700 bg-slate-50 rounded-lg px-3 py-2.5 whitespace-pre-line min-h-[2.5rem]">
                    {po.note_internal || '-'}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 h-fit space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="text-slate-800 font-medium tabular-nums">
                    Rp {formatRupiah(subTotal - ppnIncluded)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Discount</span>
                  <span className="text-slate-800 font-medium tabular-nums">
                    Rp {formatRupiah(discount)}
                  </span>
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
                    Rp {formatRupiah(ppnAdded)}
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

        {!loading && !loadError && po && (
          <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-2 rounded-b-2xl">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Kembali
            </button>
            {role && (
              <>
                <button
                  onClick={() => runAction('reject')}
                  disabled={!!deciding}
                  className="px-4 py-2 text-sm bg-red-50 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed text-red-700 rounded-lg font-medium transition-colors"
                >
                  {deciding === 'reject' ? 'Menolak...' : 'Tolak'}
                </button>
                <button
                  onClick={() => runAction('approve')}
                  disabled={!!deciding}
                  className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  {deciding === 'approve' ? 'Menyetujui...' : 'Setujui'}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default POBookingDetailModal;
