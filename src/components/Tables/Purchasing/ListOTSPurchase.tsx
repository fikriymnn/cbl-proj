// ListOTSPurchase.tsx
//
// "List OTS" for Purchasing — shows BOM PPIC records that have NOT yet been
// turned into a purchase request (is_request_purchase = false). From here a
// user can submit one or many rows as a "Pengajuan" (purchase request).
//
// ASSUMPTION (please adjust if the real endpoint differs): this reuses the
// existing BOM PPIC list endpoint with a new filter flag, the same way
// `is_bom_ppic_done` is used in BOMPPICCreate.tsx:
//   GET {VITE_API_LINK}/ppic/bom  params: { is_request_purchase: false, page, limit, search }
//
// Create pengajuan:
//   POST {VITE_API_LINK}/purchasing/request  body: { id_bom_ppic: number }

import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import Pagination from '@mui/material/Pagination/Pagination';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { OTSItem, OTSListResponse } from './Types/Purchasing.types';

type ToastState = {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info';
};

const ListOTSPurchase: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [submittingIds, setSubmittingIds] = useState<Set<number>>(new Set());
  const [data, setData] = useState<OTSItem[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  // Pagination / search
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [searchInput, setSearchInput] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Date filters
  const [tglCetakFrom, setTglCetakFrom] = useState<string>('');
  const [tglCetakTo, setTglCetakTo] = useState<string>('');
  const [tglKirimFrom, setTglKirimFrom] = useState<string>('');
  const [tglKirimTo, setTglKirimTo] = useState<string>('');

  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [confirmTarget, setConfirmTarget] = useState<OTSItem | 'bulk' | null>(
    null,
  );

  const fetchData = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/ppic/bomppic`;
    try {
      setLoading(true);
      const res: AxiosResponse<OTSListResponse> = await axios.get(url, {
        params: {
          is_request_purchase: false,
          page,
          limit,
          search: searchTerm,
        },
        withCredentials: true,
      });
      console.log('Fetched OTS data:', res.data);
      setData(res.data.data || []);
      if (res.data.total_page) setTotalPages(res.data.total_page);
    } catch (error) {
      console.error('Error fetching OTS data:', error);
      setData([]);
      setToast({
        open: true,
        message: 'Gagal memuat data OTS.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    page,
    limit,
    searchTerm,
    tglCetakFrom,
    tglCetakTo,
    tglKirimFrom,
    tglKirimTo,
  ]);

  const handleSearch = () => {
    setSearchTerm(searchInput);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setSearchTerm('');
    setTglCetakFrom('');
    setTglCetakTo('');
    setTglKirimFrom('');
    setTglKirimTo('');
    setPage(1);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const toggleRow = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === data.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(data.map((d) => d.id)));
    }
  };

  const submitRequest = async (ids: number[]) => {
    setSubmittingIds((prev) => new Set([...prev, ...ids]));
    const url = `${import.meta.env.VITE_API_LINK}/purchasing/request`;
    const results = await Promise.allSettled(
      ids.map((id) =>
        axios.post(url, { id_bom_ppic: id }, { withCredentials: true }),
      ),
    );
    const failed = results.filter((r) => r.status === 'rejected').length;
    const succeeded = ids.length - failed;

    setSubmittingIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
    setSelected((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });

    if (failed === 0) {
      setToast({
        open: true,
        message:
          succeeded === 1
            ? 'Pengajuan berhasil dibuat.'
            : `${succeeded} pengajuan berhasil dibuat.`,
        severity: 'success',
      });
    } else if (succeeded === 0) {
      setToast({
        open: true,
        message: 'Gagal membuat pengajuan. Silakan coba lagi.',
        severity: 'error',
      });
    } else {
      setToast({
        open: true,
        message: `${succeeded} berhasil, ${failed} gagal dibuat. Silakan coba lagi untuk yang gagal.`,
        severity: 'info',
      });
    }
    fetchData();
  };

  const handleConfirmSubmit = () => {
    if (!confirmTarget) return;
    if (confirmTarget === 'bulk') {
      submitRequest(Array.from(selected));
    } else {
      submitRequest([confirmTarget.id]);
    }
    setConfirmTarget(null);
  };

  const activeFilterCount = useMemo(
    () =>
      [searchTerm, tglCetakFrom, tglCetakTo, tglKirimFrom, tglKirimTo].filter(
        Boolean,
      ).length,
    [searchTerm, tglCetakFrom, tglCetakTo, tglKirimFrom, tglKirimTo],
  );

  return (
    <div className="space-y-5">
      {/* Filter card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="xl:col-span-2">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Cari No BOM / SO / IO / JO / Customer / Produk
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ketik kata kunci..."
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

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
          <span className="text-sm text-indigo-800 font-medium">
            {selected.size} baris dipilih
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setSelected(new Set())}
              className="text-sm text-indigo-700 hover:text-indigo-900 px-3 py-1.5"
            >
              Batal pilih
            </button>
            <button
              onClick={() => setConfirmTarget('bulk')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
            >
              Ajukan Pembelian ({selected.size})
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={data.length > 0 && selected.size === data.length}
                    onChange={toggleAll}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  No
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  No BOM
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  No SO / IO / JO
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Customer
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Produk
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Jenis Kertas
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Tgl Cetak
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Tgl Kirim
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-14 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-7 w-7 border-2 border-indigo-500 border-t-transparent"></div>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-14 text-center">
                    <p className="text-slate-600 font-medium text-sm">
                      Tidak ada data OTS
                    </p>
                    <p className="text-slate-400 text-xs mt-1">
                      {activeFilterCount > 0
                        ? 'Coba ubah atau reset filter pencarian.'
                        : 'Semua order sudah memiliki pengajuan pembelian.'}
                    </p>
                  </td>
                </tr>
              ) : (
                data.map((item, index) => {
                  const isSubmitting = submittingIds.has(item.id);
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(item.id)}
                          onChange={() => toggleRow(item.id)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-3 py-3 text-slate-500">
                        {(page - 1) * limit + index + 1}
                      </td>
                      <td className="px-3 py-3">
                        <span className="inline-flex bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-md font-medium">
                          {item.no_bom || '-'}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs text-slate-600 space-y-0.5">
                        <div>SO: {item.no_so || '-'}</div>
                        <div>IO: {item.no_io || '-'}</div>
                        <div>JO: {item.no_jo || '-'}</div>
                      </td>
                      <td className="px-3 py-3 text-slate-700">
                        {item.customer || '-'}
                      </td>
                      <td className="px-3 py-3 text-slate-700 max-w-xs">
                        <span className="line-clamp-2">
                          {item.produk || '-'}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-slate-600">
                        {item.bom_ppic_kertas[0]?.nama_kertas || '-'}
                      </td>
                      <td className="px-3 py-3 text-slate-600 whitespace-nowrap">
                        {formatDate(item.tgl_rencana_cetak)}
                      </td>
                      <td className="px-3 py-3 text-slate-600 whitespace-nowrap">
                        {formatDate(item.tgl_kirim_customer)}
                      </td>
                      <td className="px-3 py-3">
                        <button
                          onClick={() => setConfirmTarget(item)}
                          disabled={isSubmitting}
                          className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                        >
                          {isSubmitting ? 'Mengirim...' : 'Ajukan Pembelian'}
                        </button>
                      </td>
                    </tr>
                  );
                })
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

      {/* Confirm dialog */}
      <Dialog open={!!confirmTarget} onClose={() => setConfirmTarget(null)}>
        <DialogTitle>Buat Pengajuan Pembelian?</DialogTitle>
        <DialogContent>
          <p className="text-sm text-slate-600">
            {confirmTarget === 'bulk'
              ? `Anda akan membuat pengajuan pembelian untuk ${selected.size} order terpilih.`
              : `Anda akan membuat pengajuan pembelian untuk BOM ${
                  confirmTarget && typeof confirmTarget !== 'string'
                    ? confirmTarget.no_bom
                    : ''
                }.`}
          </p>
        </DialogContent>
        <DialogActions>
          <button
            onClick={() => setConfirmTarget(null)}
            className="px-4 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleConfirmSubmit}
            className="px-4 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
          >
            Ya, Ajukan
          </button>
        </DialogActions>
      </Dialog>

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

export default ListOTSPurchase;
