import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  PurchaseOrder,
  PurchaseOrderDetailResponse,
} from './Types/Purchasing.types';
import {
  formatDate,
  formatRupiah,
  getStatusColor,
  getStatusLabel,
} from './Types/poStatus';

type ApprovalRole = 'kabag' | 'finance';

type POApprovalDetailModalProps = {
  idPo: number;
  role: ApprovalRole;
  onClose: () => void;
  onDecided: () => void;
};

const ROLE_ENDPOINT: Record<ApprovalRole, { approve: string; reject: string }> =
  {
    kabag: { approve: 'approveKabag', reject: 'rejectKabag' },
    finance: { approve: 'approveFinance', reject: 'rejectFinance' },
  };

const ROLE_LABEL: Record<ApprovalRole, string> = {
  kabag: 'Kabag',
  finance: 'Finance',
};

const POApprovalDetailModal: React.FC<POApprovalDetailModalProps> = ({
  idPo,
  role,
  onClose,
  onDecided,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [po, setPo] = useState<PurchaseOrder | null>(null);
  const [loadError, setLoadError] = useState<string>('');
  const [deciding, setDeciding] = useState<false | 'approve' | 'reject'>(false);
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
        setPo(res.data.data);
      } catch (err) {
        console.error('Error fetching PO detail:', err);
        setLoadError('Gagal memuat detail PO. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [idPo]);

  const runAction = async (action: 'approve' | 'reject') => {
    const label = action === 'approve' ? 'menyetujui' : 'menolak';
    if (!window.confirm(`Yakin ingin ${label} PO ini?`)) return;

    setError('');
    setDeciding(action);
    try {
      const endpoint =
        action === 'approve'
          ? ROLE_ENDPOINT[role].approve
          : ROLE_ENDPOINT[role].reject;
      const url = `${
        import.meta.env.VITE_API_LINK
      }/purchasing/purchaseOrder/${endpoint}/${idPo}`;
      await axios.put(url, undefined, { withCredentials: true });
      onDecided();
    } catch (err) {
      console.error(`Error on ${action} PO:`, err);
      setError(
        action === 'approve'
          ? 'Gagal menyetujui PO. Silakan coba lagi.'
          : 'Gagal menolak PO. Silakan coba lagi.',
      );
    } finally {
      setDeciding(false);
    }
  };

  const items = po?.items || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-full max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              Detail Purchase Order
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
              {po ? po.no_purchase_order : 'Memuat...'} · Approval{' '}
              {ROLE_LABEL[role]}
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
              {loadError || 'PO tidak ditemukan.'}
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* PO meta */}
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
                <div className="text-xs text-slate-400 mb-1">Dibuat</div>
                <div className="text-sm text-slate-700">
                  {formatDate(po.createdAt)}
                </div>
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
                      <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Tipe
                      </th>
                      <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Qty Beli
                      </th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Satuan
                      </th>
                      <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Harga
                      </th>
                      <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        PPN
                      </th>
                      <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-10 text-center text-slate-400 text-sm"
                        >
                          Tidak ada item.
                        </td>
                      </tr>
                    ) : (
                      items.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/60">
                          <td className="px-3 py-2.5 text-slate-800 font-medium">
                            {item.nama_item}
                          </td>
                          <td className="px-3 py-2.5 text-slate-600">
                            {item.tipe_barang || '-'}
                          </td>
                          <td className="px-3 py-2.5 text-right tabular-nums text-slate-700">
                            {item.qty_beli}
                          </td>
                          <td className="px-3 py-2.5 text-slate-500">
                            {item.satuan || '-'}
                          </td>
                          <td className="px-3 py-2.5 text-right tabular-nums text-slate-700">
                            {formatRupiah(item.harga)}
                          </td>
                          <td className="px-3 py-2.5 text-right tabular-nums text-slate-500">
                            {item.is_ppn ? formatRupiah(item.ppn) : '-'}
                          </td>
                          <td className="px-3 py-2.5 text-right tabular-nums text-slate-800 font-medium">
                            {formatRupiah(item.total)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Notes + summary */}
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
                  <p className="text-sm text-slate-700 bg-slate-50 rounded-lg px-3 py-2.5 whitespace-pre-line font-mono text-xs min-h-[2.5rem]">
                    {po.note_internal || '-'}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 h-fit space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="text-slate-800 font-medium tabular-nums">
                    Rp {formatRupiah(po.sub_total)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Discount</span>
                  <span className="text-slate-800 font-medium tabular-nums">
                    Rp {formatRupiah(po.discount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">PPN</span>
                  <span className="text-slate-800 font-medium tabular-nums">
                    Rp {formatRupiah(po.ppn)}
                  </span>
                </div>
                <div className="border-t border-slate-200 pt-2.5 flex justify-between">
                  <span className="text-slate-700 font-semibold">Total</span>
                  <span className="text-indigo-700 font-semibold tabular-nums">
                    Rp {formatRupiah(po.total)}
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
        {!loading && !loadError && po && (
          <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-2 rounded-b-2xl">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Kembali
            </button>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default POApprovalDetailModal;
