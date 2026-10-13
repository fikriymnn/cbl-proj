import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import Pagination from '@mui/material/Pagination/Pagination';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import {
  PurchaseOrder,
  PurchaseOrderListResponse,
  StatusTiket,
} from './Types/Purchasing.types';
import {
  formatDate,
  formatRupiah,
  getStatusColor,
  getStatusLabel,
} from './Types/poStatus';
import { POKind, poBaseUrl, getApiErrorMessage } from './Types/poApi';
import POApprovalDetailModal from './POApprovalDetailModal';
import POBookingDetailModal from './POBookingDetailModal';
import POKindTabs from './POKindTabs';

type ApprovalRole = 'kabag' | 'finance';

// Which of this role's tickets are showing: not-yet-decided ("incoming",
// status_tiket = the role's own "request ..." value) or already decided
// ("history", status_tiket = "history").
type TicketTab = 'incoming' | 'history';

type ToastState = {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info';
};

const ROLE_ENDPOINT: Record<ApprovalRole, { approve: string; reject: string }> =
  {
    kabag: { approve: 'approveKabag', reject: 'rejectKabag' },
    finance: { approve: 'approveFinance', reject: 'rejectFinance' },
  };

const ROLE_STATUS_TIKET: Record<ApprovalRole, StatusTiket> = {
  kabag: 'request kabag',
  finance: 'request finance',
};

const TICKET_TAB_LABEL: Record<TicketTab, string> = {
  incoming: 'Menunggu Approval',
  history: 'Riwayat',
};

const ROLE_EMPTY_TEXT: Record<ApprovalRole, Record<TicketTab, string>> = {
  kabag: {
    incoming: 'Belum ada PO yang menunggu approval Kabag',
    history: 'Belum ada riwayat approval Kabag',
  },
  finance: {
    incoming: 'Belum ada PO yang menunggu approval Finance',
    history: 'Belum ada riwayat approval Finance',
  },
};

type POApprovalListPageProps = {
  role: ApprovalRole;
  // Kalau diisi, tab disembunyikan dan kind dikunci.
  kind?: POKind;
};

const POApprovalListPage: React.FC<POApprovalListPageProps> = ({
  role,
  kind: kindProp,
}) => {
  const [kindState, setKindState] = useState<POKind>('po');
  const showKindTabs = kindProp === undefined;
  const kind: POKind = kindProp ?? kindState;
  const isBooking = kind === 'booking';
  const label = isBooking ? 'PO Booking' : 'PO';

  const [ticketTab, setTicketTab] = useState<TicketTab>('incoming');

  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<PurchaseOrder[]>([]);

  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [searchInput, setSearchInput] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [detailId, setDetailId] = useState<number | null>(null);
  const [decidingId, setDecidingId] = useState<number | null>(null);

  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: '',
    severity: 'success',
  });

  const statusTiket: StatusTiket =
    ticketTab === 'incoming' ? ROLE_STATUS_TIKET[role] : 'history';

  const fetchData = async (): Promise<void> => {
    const url = poBaseUrl(kind);
    try {
      setLoading(true);
      const res = await axios.get<PurchaseOrderListResponse>(url, {
        params: {
          page,
          limit,
          search: searchTerm || undefined,
          status_tiket: statusTiket,
        },
        withCredentials: true,
      });
      setData(res.data.data || []);
      if (res.data.total_page) setTotalPages(res.data.total_page);
    } catch (error) {
      console.error('Error fetching PO approval data:', error);
      setData([]);
      setToast({
        open: true,
        message: `Gagal memuat data ${label}.`,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };
  const handleKindChange = (next: POKind) => {
    if (next === kind) return;
    setKindState(next);
    setTicketTab('incoming');
    setPage(1);
    setSearchInput('');
    setSearchTerm('');
    setDetailId(null);
  };
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, searchTerm, statusTiket, kind]);

  useEffect(() => {
    // Role changed (shouldn't happen mid-mount, but keep filters sane).
    setPage(1);
    setTicketTab('incoming');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, kind]);

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

  const handleTicketTabChange = (nextTab: TicketTab) => {
    setTicketTab(nextTab);
    setPage(1);
  };

  const activeFilterCount = useMemo(
    () => [searchTerm].filter(Boolean).length,
    [searchTerm],
  );

  const runQuickAction = async (idPo: number, action: 'approve' | 'reject') => {
    const verb = action === 'approve' ? 'menyetujui' : 'menolak';
    if (!window.confirm(`Yakin ingin ${verb} ${label} ini?`)) return;

    setDecidingId(idPo);
    try {
      const endpoint =
        action === 'approve'
          ? ROLE_ENDPOINT[role].approve
          : ROLE_ENDPOINT[role].reject;
      const url = `${poBaseUrl(kind)}/${endpoint}/${idPo}`;
      await axios.put(url, undefined, { withCredentials: true });
      setToast({
        open: true,
        message:
          action === 'approve'
            ? `${label} berhasil disetujui.`
            : `${label} berhasil ditolak.`,
        severity: 'success',
      });
      fetchData();
    } catch (error) {
      console.error(`Error on ${action} PO:`, error);
      setToast({
        open: true,
        message: getApiErrorMessage(
          error,
          action === 'approve'
            ? `Gagal menyetujui ${label}. Silakan coba lagi.`
            : `Gagal menolak ${label}. Silakan coba lagi.`,
        ),
        severity: 'error',
      });
    } finally {
      setDecidingId(null);
    }
  };

  const handleDecided = () => {
    setDetailId(null);
    setToast({
      open: true,
      message: 'Keputusan berhasil disimpan.',
      severity: 'success',
    });
    fetchData();
  };

  return (
    <div className="space-y-5">
      {showKindTabs && <POKindTabs value={kind} onChange={handleKindChange} />}
      {/* Menunggu Approval / Riwayat sub-tabs */}
      <div className="flex gap-2">
        {(Object.keys(TICKET_TAB_LABEL) as TicketTab[]).map((t) => (
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
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Tanggal Kirim
                </th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Total
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
                  <td colSpan={7} className="px-4 py-14 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-7 w-7 border-2 border-indigo-500 border-t-transparent"></div>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-14 text-center">
                    <p className="text-slate-600 font-medium text-sm">
                      {isBooking
                        ? ROLE_EMPTY_TEXT[role][ticketTab].replace(
                            'PO',
                            'PO Booking',
                          )
                        : ROLE_EMPTY_TEXT[role][ticketTab]}
                    </p>
                    {activeFilterCount > 0 && (
                      <p className="text-slate-400 text-xs mt-1">
                        Coba ubah atau reset filter pencarian.
                      </p>
                    )}
                  </td>
                </tr>
              ) : (
                data.map((po) => (
                  <tr
                    key={po.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="px-3 py-3">
                      <button
                        onClick={() => setDetailId(po.id)}
                        className="text-indigo-700 font-medium hover:text-indigo-900 hover:underline"
                      >
                        {po.no_purchase_order}
                      </button>
                    </td>
                    <td className="px-3 py-3 text-slate-700">
                      {po.nama_vendor || '-'}
                    </td>
                    <td className="px-3 py-3 text-slate-600 whitespace-nowrap">
                      {formatDate(po.tgl_po)}
                    </td>
                    <td className="px-3 py-3 text-slate-600 whitespace-nowrap">
                      {formatDate(po.tgl_kirim)}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-slate-800 font-medium">
                      Rp {formatRupiah(po.total)}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ring-1 font-medium ${getStatusColor(
                          po.status,
                        )}`}
                      >
                        {getStatusLabel(po.status)}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setDetailId(po.id)}
                          className="text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Detail
                        </button>
                        {ticketTab === 'incoming' && (
                          <>
                            <button
                              onClick={() => runQuickAction(po.id, 'reject')}
                              disabled={decidingId === po.id}
                              className="text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Tolak
                            </button>
                            <button
                              onClick={() => runQuickAction(po.id, 'approve')}
                              disabled={decidingId === po.id}
                              className="text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg transition-colors"
                            >
                              {decidingId === po.id ? '...' : 'Setujui'}
                            </button>
                          </>
                        )}
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

      {/* Detail / decision modal */}
      {detailId !== null &&
        (isBooking ? (
          <POBookingDetailModal
            idPo={detailId}
            // hanya tab "Menunggu Approval" yang boleh memutuskan
            role={ticketTab === 'incoming' ? role : undefined}
            onClose={() => setDetailId(null)}
            onDecided={handleDecided}
          />
        ) : (
          <POApprovalDetailModal
            idPo={detailId}
            role={role}
            onClose={() => setDetailId(null)}
            onDecided={handleDecided}
          />
        ))}

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

export default POApprovalListPage;
