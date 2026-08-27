import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import Pagination from '@mui/material/Pagination/Pagination';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

/* =============================================================================
 * IncomingRawMaterialQC — QC review queue for raw material that has arrived
 * from a vendor (created via OutstandingPO's "Proses Incoming" flow).
 *
 * Two tabs drive `status_ticket`: "incoming" (awaiting QC decision) and
 * "history" (already approved/rejected). Within "incoming", `status` is
 * always 'incoming'; within "history" it's 'approve' or 'reject'.
 * ========================================================================== */

type TicketStatus = 'incoming' | 'approve' | 'reject';
type StatusTicket = 'incoming' | 'history';

interface RawPurchaseOrderRef {
  id: number;
  no_purchase_order: string;
  nama_vendor: string;
  tgl_po: string;
  tgl_kirim: string;
  status: string;
  status_tiket: string;
}
interface RawPurchaseOrderItemJoRef {
  id: number;
  id_jo: number;
  id_item: number;
  no_jo: string;
  nama_item: string;
  nama_brand: string;
  qty_bom: number;
  qty_po: number;
  qty_terkirim: number;
  qty_sisa: number;
  qty_idle: number;
  tipe_barang: string;
  satuan: string;
  status_qc: string;
  status_po: string;
}
interface IncomingRawMaterial {
  id: number;
  id_purchase_order: number;
  id_purchase_order_item_jo: number;
  id_request: number;
  id_approve: number | null;
  id_reject: number | null;
  no_surat_jalan: string;
  qty_incoming: number;
  qty_idle: number;
  qty_pallet: number;
  tgl_request: string;
  tgl_action: string | null;
  status: TicketStatus;
  status_ticket: StatusTicket;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  purchase_order: RawPurchaseOrderRef;
  purchase_order_item_jo: RawPurchaseOrderItemJoRef;
}
interface IncomingRawMaterialListResponse {
  status: number;
  success: boolean;
  data: IncomingRawMaterial[];
  total_page?: number;
}

const EMPTY_TEXT = 'Belum ada data incoming raw material.';

const formatQty = (val: number | null | undefined): string =>
  (val ?? 0).toLocaleString('id-ID');

const formatDate = (val?: string | null): string => {
  if (!val) return '-';
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatDateTime = (val?: string | null): string => {
  if (!val) return '-';
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const statusBadge = (status: TicketStatus): string => {
  if (status === 'approve')
    return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
  if (status === 'reject') return 'bg-red-50 text-red-700 ring-red-200';
  return 'bg-amber-50 text-amber-700 ring-amber-200';
};

const statusLabel = (status: TicketStatus): string => {
  if (status === 'approve') return 'Disetujui';
  if (status === 'reject') return 'Ditolak';
  return 'Menunggu QC';
};

// =============================================================================
// Detail / decision modal
// =============================================================================
const IncomingDetailModal: React.FC<{
  item: IncomingRawMaterial;
  onClose: () => void;
  onDecided: () => void;
}> = ({ item, onClose, onDecided }) => {
  const [note, setNote] = useState<string>('');
  const [submitting, setSubmitting] = useState<false | 'approve' | 'reject'>(
    false,
  );
  const [error, setError] = useState<string>('');

  const canDecide =
    item.status_ticket === 'incoming' && item.status === 'incoming';

  const handleApprove = async () => {
    setError('');
    setSubmitting('approve');
    try {
      const url = `${
        import.meta.env.VITE_API_LINK
      }/qc/incomingRawMaterial/approve/${item.id}`;
      await axios.put(url, { note }, { withCredentials: true });
      onDecided();
    } catch (err) {
      console.error('Error approving incoming raw material:', err);
      setError('Gagal menyetujui data. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    setError('');
    setSubmitting('reject');
    try {
      const url = `${
        import.meta.env.VITE_API_LINK
      }/qc/incomingRawMaterial/reject/${item.id}`;
      await axios.put(url, undefined, { withCredentials: true });
      onDecided();
    } catch (err) {
      console.error('Error rejecting incoming raw material:', err);
      setError('Gagal menolak data. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Detail Incoming Raw Material
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Surat Jalan {item.no_surat_jalan}
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

        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <span
              className={`text-xs px-2.5 py-1 rounded-full ring-1 font-medium ${statusBadge(
                item.status,
              )}`}
            >
              {statusLabel(item.status)}
            </span>
            <span className="text-xs text-slate-400">
              Diajukan {formatDateTime(item.tgl_request)}
            </span>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">No PO</span>
              <span className="font-medium text-slate-700">
                {item.purchase_order?.no_purchase_order || '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Vendor</span>
              <span className="font-medium text-slate-700">
                {item.purchase_order?.nama_vendor || '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">No JO</span>
              <span className="font-medium text-slate-700">
                {item.purchase_order_item_jo?.no_jo || '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Nama Barang</span>
              <span className="font-medium text-slate-700">
                {item.purchase_order_item_jo?.nama_item || '-'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-white border border-slate-200 rounded-xl py-3">
              <p className="text-[11px] text-slate-400">Jumlah Datang</p>
              <p className="text-base font-semibold text-slate-800">
                {formatQty(item.qty_incoming)}{' '}
                {item.purchase_order_item_jo?.satuan}
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl py-3">
              <p className="text-[11px] text-slate-400">Jumlah Idle</p>
              <p className="text-base font-semibold text-slate-800">
                {formatQty(item.qty_idle)} {item.purchase_order_item_jo?.satuan}
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl py-3">
              <p className="text-[11px] text-slate-400">Qty Pallet</p>
              <p className="text-base font-semibold text-slate-800">
                {formatQty(item.qty_pallet)}
              </p>
            </div>
          </div>

          {item.status !== 'incoming' && (
            <div className="text-xs text-slate-400">
              Diputuskan {formatDateTime(item.tgl_action)}
            </div>
          )}

          {canDecide && (
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Catatan QC (untuk approve)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Opsional, mis. kondisi barang saat diterima..."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg px-4 py-2.5">
              {error}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-2 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Tutup
          </button>
          {canDecide && (
            <>
              <button
                onClick={handleReject}
                disabled={!!submitting}
                className="px-4 py-2 text-sm bg-red-50 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed text-red-600 rounded-lg font-medium transition-colors"
              >
                {submitting === 'reject' ? 'Menolak...' : 'Tolak'}
              </button>
              <button
                onClick={handleApprove}
                disabled={!!submitting}
                className="px-5 py-2 text-sm bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                {submitting === 'approve' ? 'Menyetujui...' : 'Setujui'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// Main page
// =============================================================================
const IncomingRawMaterialQC: React.FC = () => {
  const [statusTicket, setStatusTicket] = useState<StatusTicket>('incoming');
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<IncomingRawMaterial[]>([]);

  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  const [detailItem, setDetailItem] = useState<IncomingRawMaterial | null>(
    null,
  );

  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'success' });

  const fetchData = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/qc/incomingRawMaterial`;
    try {
      setLoading(true);
      const res = await axios.get<IncomingRawMaterialListResponse>(url, {
        params: { page, limit, status_ticket: statusTicket },
        withCredentials: true,
      });
      setData(res.data.data || []);
      if (res.data.total_page) setTotalPages(res.data.total_page);
    } catch (error) {
      console.error('Error fetching incoming raw material data:', error);
      setData([]);
      setToast({
        open: true,
        message: 'Gagal memuat data incoming raw material.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, statusTicket]);

  const handleTabChange = (tab: StatusTicket) => {
    setStatusTicket(tab);
    setPage(1);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2 inline-flex gap-1">
        {(
          [
            { key: 'incoming', label: 'Menunggu QC' },
            { key: 'history', label: 'Riwayat' },
          ] as { key: StatusTicket; label: string }[]
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
              statusTicket === tab.key
                ? 'bg-amber-600 text-white'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  No Surat Jalan
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  No PO / Vendor
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  JO / Barang
                </th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Qty Datang
                </th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Qty Idle
                </th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Pallet
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Tgl Request
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-14 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-7 w-7 border-2 border-amber-500 border-t-transparent"></div>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-14 text-center">
                    <p className="text-slate-600 font-medium text-sm">
                      {EMPTY_TEXT}
                    </p>
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="px-3 py-3">
                      <button
                        onClick={() => setDetailItem(item)}
                        className="text-amber-700 font-medium hover:text-amber-900 hover:underline"
                      >
                        {item.no_surat_jalan}
                      </button>
                    </td>
                    <td className="px-3 py-3">
                      <div className="text-slate-700 font-medium">
                        {item.purchase_order?.no_purchase_order || '-'}
                      </div>
                      <div className="text-xs text-slate-400">
                        {item.purchase_order?.nama_vendor || '-'}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="text-xs font-semibold text-slate-500">
                        {item.purchase_order_item_jo?.no_jo || '-'}
                      </div>
                      <div className="text-slate-700">
                        {item.purchase_order_item_jo?.nama_item || '-'}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      {formatQty(item.qty_incoming)}{' '}
                      {item.purchase_order_item_jo?.satuan}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      {formatQty(item.qty_idle)}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      {formatQty(item.qty_pallet)}
                    </td>
                    <td className="px-3 py-3 text-slate-600 whitespace-nowrap">
                      {formatDate(item.tgl_request)}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ring-1 font-medium ${statusBadge(
                          item.status,
                        )}`}
                      >
                        {statusLabel(item.status)}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setDetailItem(item)}
                          className="text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Detail
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Baris per halaman:</span>
          <div className="flex gap-1.5">
            {[10, 25, 50, 100].map((pageSize) => (
              <button
                key={pageSize}
                onClick={() => handleLimitChange(pageSize)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  limit === pageSize
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {pageSize}
              </button>
            ))}
          </div>
        </div>
        <Stack spacing={2}>
          <Pagination
            count={totalPages}
            page={page}
            color="primary"
            onChange={(_, i) => setPage(i)}
          />
        </Stack>
      </div>

      {/* Detail / decision modal */}
      {detailItem && (
        <IncomingDetailModal
          item={detailItem}
          onClose={() => setDetailItem(null)}
          onDecided={() => {
            setDetailItem(null);
            setToast({
              open: true,
              message: 'Keputusan QC berhasil disimpan.',
              severity: 'success',
            });
            fetchData();
          }}
        />
      )}

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          severity={toast.severity}
          variant="filled"
          onClose={() => setToast((t) => ({ ...t, open: false }))}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default IncomingRawMaterialQC;
