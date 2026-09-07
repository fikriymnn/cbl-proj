import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import Pagination from '@mui/material/Pagination/Pagination';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

/* =============================================================================
 * PurchasingApprovalCancelPO — "Approval Cancel PO" tab on the Finance
 * approval page.
 *
 * Reviews PO cancellation requests raised from Purchasing Monitoring PO's
 * "Ajukan Cancel PO" action (POST /purchasing/requestCancelpurchaseOrder).
 * A cancel request is its own record (NOT the same as the PO's normal
 * kabag/finance ticket flow), with its own two-value ticket filter:
 *
 *   GET /purchasing/requestCancelpurchaseOrder
 *     params: { page, limit, search?, status_ticket: 'incoming' | 'history' }
 *     - 'incoming' -> not yet decided by finance
 *     - 'history'  -> already approved or rejected
 *
 *   PUT /purchasing/requestCancelpurchaseOrder/approve/:id
 *     -> confirms the cancellation (purchase_order.status_po becomes
 *        'cancel').
 *   PUT /purchasing/requestCancelpurchaseOrder/reject/:id
 *     -> declines the cancellation (purchase_order.status_po presumably
 *        reverts to 'progress' so the PO keeps being monitored/fulfilled).
 *
 * NOTE ON THE `status` FIELD: the sample payload shows both a top-level
 * `status` and `status_ticket` as "incoming" for an undecided request. This
 * component assumes `status` becomes something else once decided (e.g.
 * "approved"/"rejected") and uses it purely as a display badge — it does
 * NOT rely on it for filtering (status_ticket is the actual query param).
 * If the real decided values differ, only `decisionBadge`/`decisionLabel`
 * below need adjusting.
 * ========================================================================== */

type CancelTicketTab = 'incoming' | 'history';

const TICKET_TAB_LABEL: Record<CancelTicketTab, string> = {
  incoming: 'Menunggu Approval',
  history: 'Riwayat',
};

const EMPTY_TEXT: Record<CancelTicketTab, string> = {
  incoming: 'Tidak ada pengajuan cancel PO yang menunggu approval.',
  history: 'Belum ada riwayat approval cancel PO.',
};

interface CancelPoRequestUser {
  id: number;
  nama: string;
  email?: string;
}

// Mirrors the subset of purchase_order fields this screen actually needs —
// kept local rather than importing the shared PurchaseOrder type, since the
// nested object here only carries a fraction of its fields.
interface CancelPoRequestPO {
  id: number;
  status: string;
  status_tiket: string;
  status_po: 'progress' | 'done' | 'request cancel' | 'cancel';
}

interface CancelPoRequest {
  id: number;
  id_purchase_order: number;
  id_request: number;
  id_respon: number | null;
  no_purchase_order: string;
  nama_vendor: string;
  tgl_po: string;
  tgl_kirim: string;
  total: number;
  note: string;
  status: string;
  status_ticket: CancelTicketTab;
  createdAt: string;
  purchase_order?: CancelPoRequestPO;
  user_request?: CancelPoRequestUser;
  user_respon?: CancelPoRequestUser | null;
}

interface CancelPoRequestListResponse {
  data: CancelPoRequest[];
  total_page: number;
}

const formatRupiahLocal = (val: number | null | undefined): string =>
  (val ?? 0).toLocaleString('id-ID');

const formatDateLocal = (val: string | null | undefined): string => {
  if (!val) return '-';
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

// Badge for the PO's status_po at the time the cancel request is shown —
// same color language used elsewhere for this field (teal = progress,
// orange = request cancel, red = cancel, emerald = done).
const statusPoBadge = (status: string | undefined): string => {
  if (status === 'done') return 'bg-emerald-50 text-emerald-700';
  if (status === 'cancel') return 'bg-red-50 text-red-700';
  if (status === 'request cancel') return 'bg-orange-50 text-orange-700';
  return 'bg-teal-50 text-teal-700'; // progress
};

const statusPoLabel = (status: string | undefined): string => {
  if (status === 'done') return 'Selesai';
  if (status === 'cancel') return 'Dibatalkan';
  if (status === 'request cancel') return 'Menunggu Cancel';
  return 'Progress';
};

// Decision badge for the cancel request itself — see the NOTE above about
// unverified decided-state values. Falls back to a neutral badge with the
// raw string so nothing silently disappears if the backend uses different
// wording than assumed here.
const decisionBadge = (status: string): string => {
  const s = status.toLowerCase();
  if (s.includes('approve')) return 'bg-emerald-50 text-emerald-700';
  if (s.includes('reject')) return 'bg-red-50 text-red-700';
  return 'bg-amber-50 text-amber-700'; // incoming / unknown
};

const decisionLabel = (status: string): string => {
  const s = status.toLowerCase();
  if (s.includes('approve')) return 'Disetujui';
  if (s.includes('reject')) return 'Ditolak';
  return 'Menunggu Keputusan';
};

type ToastState = {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info';
};

const PurchasingApprovalCancelPO: React.FC = () => {
  const [ticketTab, setTicketTab] = useState<CancelTicketTab>('incoming');

  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<CancelPoRequest[]>([]);

  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [searchInput, setSearchInput] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [decidingId, setDecidingId] = useState<number | null>(null);

  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: '',
    severity: 'success',
  });

  const fetchData = async (): Promise<void> => {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/purchasing/requestCancelpurchaseOrder`;
    try {
      setLoading(true);
      const res = await axios.get<CancelPoRequestListResponse>(url, {
        params: {
          page,
          limit,
          search: searchTerm || undefined,
          status_ticket: ticketTab,
        },
        withCredentials: true,
      });
      setData(res.data.data || []);
      if (res.data.total_page) setTotalPages(res.data.total_page);
    } catch (error) {
      console.error('Error fetching cancel PO approval data:', error);
      setData([]);
      setToast({
        open: true,
        message: 'Gagal memuat data pengajuan cancel PO.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, searchTerm, ticketTab]);

  const handleSearch = () => {
    setSearchTerm(searchInput);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setSearchTerm('');
    setPage(1);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleTicketTabChange = (nextTab: CancelTicketTab) => {
    setTicketTab(nextTab);
    setPage(1);
  };

  const activeFilterCount = useMemo(
    () => [searchTerm].filter(Boolean).length,
    [searchTerm],
  );

  const runDecision = async (
    id: number,
    action: 'approve' | 'reject',
  ): Promise<void> => {
    const label = action === 'approve' ? 'menyetujui' : 'menolak';
    if (!window.confirm(`Yakin ingin ${label} pengajuan cancel PO ini?`)) {
      return;
    }

    setDecidingId(id);
    try {
      const url = `${
        import.meta.env.VITE_API_LINK
      }/purchasing/requestCancelpurchaseOrder/${action}/${id}`;
      await axios.put(url, undefined, { withCredentials: true });
      setToast({
        open: true,
        message:
          action === 'approve'
            ? 'Pengajuan cancel PO berhasil disetujui.'
            : 'Pengajuan cancel PO berhasil ditolak.',
        severity: 'success',
      });
      fetchData();
    } catch (error) {
      console.error(`Error on ${action} cancel PO request:`, error);
      setToast({
        open: true,
        message:
          action === 'approve'
            ? 'Gagal menyetujui pengajuan cancel PO. Silakan coba lagi.'
            : 'Gagal menolak pengajuan cancel PO. Silakan coba lagi.',
        severity: 'error',
      });
    } finally {
      setDecidingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Incoming / History sub-tabs */}
      <div className="flex gap-2">
        {(Object.keys(TICKET_TAB_LABEL) as CancelTicketTab[]).map((t) => (
          <button
            key={t}
            onClick={() => handleTicketTabChange(t)}
            className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
              ticketTab === t
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {TICKET_TAB_LABEL[t]}
          </button>
        ))}
      </div>

      {/* Filter card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <div className="max-w-md">
          <label className="block text-xs font-medium text-slate-500 mb-1.5">
            Cari No PO / Nama Vendor
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ketik no PO atau nama vendor..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              onClick={handleSearch}
              className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Cari
            </button>
          </div>
        </div>

        {activeFilterCount > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-slate-500">
              {activeFilterCount} filter aktif
            </span>
            <button
              onClick={handleResetFilters}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Reset semua filter
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  No PO
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Vendor
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Tanggal PO
                </th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Total
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Catatan Cancel
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Diajukan Oleh
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Status PO
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  {ticketTab === 'incoming' ? 'Aksi' : 'Keputusan'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-14 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-7 w-7 border-2 border-indigo-500 border-t-transparent"></div>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-14 text-center">
                    <p className="text-slate-600 font-medium text-sm">
                      {EMPTY_TEXT[ticketTab]}
                    </p>
                    {activeFilterCount > 0 && (
                      <p className="text-slate-400 text-xs mt-1">
                        Coba ubah atau reset filter pencarian.
                      </p>
                    )}
                  </td>
                </tr>
              ) : (
                data.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="px-3 py-3 font-medium text-indigo-700">
                      {req.no_purchase_order}
                    </td>
                    <td className="px-3 py-3 text-slate-700">
                      {req.nama_vendor || '-'}
                    </td>
                    <td className="px-3 py-3 text-slate-600 whitespace-nowrap">
                      {formatDateLocal(req.tgl_po)}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-slate-800 font-medium">
                      Rp {formatRupiahLocal(req.total)}
                    </td>
                    <td className="px-3 py-3 text-slate-600 max-w-[220px]">
                      <span className="line-clamp-2">{req.note || '-'}</span>
                    </td>
                    <td className="px-3 py-3 text-slate-600">
                      {req.user_request?.nama || '-'}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${statusPoBadge(
                          req.purchase_order?.status_po,
                        )}`}
                      >
                        {statusPoLabel(req.purchase_order?.status_po)}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      {ticketTab === 'incoming' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => runDecision(req.id, 'reject')}
                            disabled={decidingId === req.id}
                            className="text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Tolak
                          </button>
                          <button
                            onClick={() => runDecision(req.id, 'approve')}
                            disabled={decidingId === req.id}
                            className="text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg transition-colors"
                          >
                            {decidingId === req.id ? '...' : 'Setujui'}
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <span
                            className={`inline-block text-[11px] px-2 py-0.5 rounded-full font-medium ${decisionBadge(
                              req.status,
                            )}`}
                          >
                            {decisionLabel(req.status)}
                          </span>
                          {req.user_respon?.nama && (
                            <span className="block text-[11px] text-slate-400">
                              oleh {req.user_respon.nama}
                            </span>
                          )}
                        </div>
                      )}
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
                    ? 'bg-indigo-600 text-white'
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

export default PurchasingApprovalCancelPO;
