import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import Pagination from '@mui/material/Pagination/Pagination';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import {
  PurchaseOrder,
  PurchaseOrderListResponse,
} from './Types/Purchasing.types';
import {
  formatDate,
  formatRupiah,
  getStatusColor,
  getStatusLabel,
} from './Types/poStatus';
import EditPOModal from './EditPOModal';

type ToastState = {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info';
};

// This page always shows tickets sitting in the "draft" status_tiket bucket
// — that includes brand-new drafts as well as POs that were sent back after
// a Kabag/Finance rejection (their `status` explains which).
const STATUS_TIKET = 'draft';

const STATUS_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Semua Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'reject kabag', label: 'Ditolak Kabag' },
  { value: 'reject finance', label: 'Ditolak Finance' },
];

const DraftPO: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<PurchaseOrder[]>([]);

  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [searchInput, setSearchInput] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [submittingId, setSubmittingId] = useState<number | null>(null);

  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: '',
    severity: 'success',
  });

  const fetchData = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/purchasing/purchaseOrder`;
    try {
      setLoading(true);
      const res = await axios.get<PurchaseOrderListResponse>(url, {
        params: {
          page,
          limit,
          search: searchTerm || undefined,
          status: statusFilter || undefined,
          status_tiket: STATUS_TIKET,
        },
        withCredentials: true,
      });
      console.log('Fetched draft PO data:', res.data);
      setData(res.data.data || []);
      if (res.data.total_page) setTotalPages(res.data.total_page);
    } catch (error) {
      console.error('Error fetching draft PO data:', error);
      setData([]);
      setToast({
        open: true,
        message: 'Gagal memuat data draft PO.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, searchTerm, statusFilter]);

  const handleSearch = () => {
    setSearchTerm(searchInput);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setSearchTerm('');
    setStatusFilter('');
    setPage(1);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const activeFilterCount = useMemo(
    () => [searchTerm, statusFilter].filter(Boolean).length,
    [searchTerm, statusFilter],
  );

  const handleQuickSubmit = async (idPo: number) => {
    if (!window.confirm('Ajukan PO ini ke Kabag untuk approval?')) return;
    setSubmittingId(idPo);
    try {
      const url = `${
        import.meta.env.VITE_API_LINK
      }/purchasing/purchaseOrder/request/${idPo}`;
      await axios.put(url, undefined, { withCredentials: true });
      setToast({
        open: true,
        message: 'PO berhasil diajukan ke Kabag.',
        severity: 'success',
      });
      fetchData();
    } catch (error) {
      console.error('Error requesting PO:', error);
      setToast({
        open: true,
        message: 'Gagal mengajukan PO. Silakan coba lagi.',
        severity: 'error',
      });
    } finally {
      setSubmittingId(null);
    }
  };

  const handleEditSaved = () => {
    setEditingId(null);
    setToast({
      open: true,
      message: 'Perubahan PO berhasil disimpan.',
      severity: 'success',
    });
    fetchData();
  };

  return (
    <div className="space-y-5">
      {/* Filter card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2">
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

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {STATUS_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
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
                      Belum ada draft PO
                    </p>
                    <p className="text-slate-400 text-xs mt-1">
                      {activeFilterCount > 0
                        ? 'Coba ubah atau reset filter pencarian.'
                        : 'Buat PO dari halaman Pengajuan Pembelian terlebih dahulu.'}
                    </p>
                  </td>
                </tr>
              ) : (
                data.map((po) => (
                  <tr
                    key={po.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="px-3 py-3">
                      <span className="text-indigo-700 font-medium">
                        {po.no_purchase_order}
                      </span>
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
                          onClick={() => setEditingId(po.id)}
                          className="text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleQuickSubmit(po.id)}
                          disabled={submittingId === po.id}
                          className="text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg transition-colors"
                        >
                          {submittingId === po.id ? 'Mengajukan...' : 'Ajukan'}
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

      {/* Edit modal */}
      {editingId !== null && (
        <EditPOModal
          idPo={editingId}
          onClose={() => setEditingId(null)}
          onSaved={handleEditSaved}
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

export default DraftPO;
