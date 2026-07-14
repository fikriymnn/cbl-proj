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
import POApprovalDetailModal from './POApprovalDetailModal';

type ApprovalRole = 'kabag' | 'finance';

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

const ROLE_EMPTY_TEXT: Record<ApprovalRole, string> = {
  kabag: 'Belum ada PO yang menunggu approval Kabag',
  finance: 'Belum ada PO yang menunggu approval Finance',
};

type POApprovalListPageProps = {
  role: ApprovalRole;
};

// Shared table + approve/reject logic for the Kabag and Finance approval
// pages. Both pages only differ in which status_tiket they query and which
// approve/reject endpoints they call, so that's the only thing parameterized.
const POApprovalListPage: React.FC<POApprovalListPageProps> = ({ role }) => {
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

  const statusTiket = ROLE_STATUS_TIKET[role];

  const fetchData = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/purchasing/purchaseOrder`;
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
        message: 'Gagal memuat data PO.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, searchTerm, statusTiket]);

  useEffect(() => {
    // Role changed (shouldn't happen mid-mount, but keep filters sane).
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

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

  const activeFilterCount = useMemo(
    () => [searchTerm].filter(Boolean).length,
    [searchTerm],
  );

  const runQuickAction = async (idPo: number, action: 'approve' | 'reject') => {
    const label = action === 'approve' ? 'menyetujui' : 'menolak';
    if (!window.confirm(`Yakin ingin ${label} PO ini?`)) return;

    setDecidingId(idPo);
    try {
      const endpoint =
        action === 'approve'
          ? ROLE_ENDPOINT[role].approve
          : ROLE_ENDPOINT[role].reject;
      const url = `${
        import.meta.env.VITE_API_LINK
      }/purchasing/purchaseOrder/${endpoint}/${idPo}`;
      await axios.put(url, undefined, { withCredentials: true });
      setToast({
        open: true,
        message:
          action === 'approve'
            ? 'PO berhasil disetujui.'
            : 'PO berhasil ditolak.',
        severity: 'success',
      });
      fetchData();
    } catch (error) {
      console.error(`Error on ${action} PO:`, error);
      setToast({
        open: true,
        message:
          action === 'approve'
            ? 'Gagal menyetujui PO. Silakan coba lagi.'
            : 'Gagal menolak PO. Silakan coba lagi.',
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
                      {ROLE_EMPTY_TEXT[role]}
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
      {detailId !== null && (
        <POApprovalDetailModal
          idPo={detailId}
          role={role}
          onClose={() => setDetailId(null)}
          onDecided={handleDecided}
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

export default POApprovalListPage;
