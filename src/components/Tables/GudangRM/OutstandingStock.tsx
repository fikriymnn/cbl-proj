import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import Pagination from '@mui/material/Pagination/Pagination';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { formatDate } from '../Purchasing/Types/poStatus';

/* =============================================================================
 * OutstandingStock — flat list of RM stock items awaiting approval
 * (GET /rm/outstandingStock). Unlike OutstandingPO, there is no PO-level
 * grouping/expand — every row returned by the API is already an individual
 * item, so the table lists them directly.
 *
 * Checkboxes have no restriction — any row can be checked regardless of
 * status. Approval is NOT bulk: each selected row is submitted one at a
 * time to POST /rm/outstandingStock/approve/:id, and the modal shows
 * per-row progress while the sequential calls go out.
 * ========================================================================== */

const EMPTY_TEXT = 'Tidak ada stock outstanding.';

export interface OutstandingStockItem {
  id: number;
  id_jo: number;
  id_so: number;
  id_io: number;
  id_bom_ppic: number;
  id_item: number;
  id_user_approve: number | null;
  no_jo: string;
  no_bom_ppic: string;
  no_so: string;
  no_io: string;
  customer: string;
  produk: string;
  nama_item: string;
  qty: number;
  tipe_barang: string;
  satuan: string;
  rencana_cetak: string;
  tgl_masuk: string;
  tgl_approve: string | null;
  status: string;
  status_ticket: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface OutstandingStockListResponse {
  status: number;
  success: boolean;
  data: OutstandingStockItem[];
  total_page: number;
}

type ApproveRowState = 'idle' | 'loading' | 'success' | 'error';

const formatQty = (val: number | null | undefined): string =>
  (val ?? 0).toLocaleString('id-ID');

const statusBadge = (status: string): string => {
  if (status === 'approve') return 'bg-emerald-50 text-emerald-700';
  if (status === 'reject') return 'bg-red-50 text-red-700';
  return 'bg-amber-50 text-amber-700'; // incoming
};

const statusLabel = (status: string): string => {
  if (status === 'approve') return 'Disetujui';
  if (status === 'reject') return 'Ditolak';
  return 'Incoming';
};

// =============================================================================
// Approval modal — hits /rm/outstandingStock/approve/:id ONE BY ONE, in
// sequence, and reflects per-row progress while it runs.
// =============================================================================
const ApproveStockModal: React.FC<{
  rows: OutstandingStockItem[];
  onClose: () => void;
  onFinished: (approvedIds: number[]) => void;
}> = ({ rows, onClose, onFinished }) => {
  const [rowState, setRowState] = useState<Record<number, ApproveRowState>>(
    () => Object.fromEntries(rows.map((r) => [r.id, 'idle'])),
  );
  const [running, setRunning] = useState<boolean>(false);
  const [done, setDone] = useState<boolean>(false);

  const handleApproveAll = async () => {
    setRunning(true);
    const approvedIds: number[] = [];
    // Sequential on purpose — approval is one-by-one against the API,
    // not a bulk endpoint, so we await each call before moving on.
    for (const row of rows) {
      setRowState((prev) => ({ ...prev, [row.id]: 'loading' }));
      try {
        const url = `${
          import.meta.env.VITE_API_LINK
        }/rm/outstandingStock/approve/${row.id}`;
        await axios.put(url, {}, { withCredentials: true });
        setRowState((prev) => ({ ...prev, [row.id]: 'success' }));
        approvedIds.push(row.id);
      } catch (err: any) {
        alert(err.response.data.msg);
        console.error(`Error approving outstanding stock id=${row.id}:`, err);
        setRowState((prev) => ({ ...prev, [row.id]: 'error' }));
      }
    }
    setRunning(false);
    setDone(true);
    onFinished(approvedIds);
  };

  const successCount = Object.values(rowState).filter(
    (s) => s === 'success',
  ).length;
  const errorCount = Object.values(rowState).filter(
    (s) => s === 'error',
  ).length;

  return (
    <Dialog
      open
      onClose={running ? undefined : onClose}
      fullWidth
      maxWidth="lg"
    >
      <DialogTitle className="!pb-1">
        Approve Stock Datang
        <span className="block text-xs font-normal text-slate-400 mt-0.5">
          {rows.length} item terpilih — dikirim satu per satu
        </span>
      </DialogTitle>
      <DialogContent>
        <div className="overflow-x-auto border border-slate-200 rounded-xl mt-1">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                  No JO
                </th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                  Barang
                </th>
                <th className="px-3 py-2.5 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                  Qty
                </th>
                <th className="px-3 py-2.5 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-3 py-2.5 align-top text-xs font-semibold text-teal-700">
                    {r.no_jo}
                  </td>
                  <td className="px-3 py-2.5 align-top">
                    <div className="text-sm text-slate-700">{r.nama_item}</div>
                    <div className="text-[11px] text-slate-400">{r.produk}</div>
                  </td>
                  <td className="px-3 py-2.5 align-top text-right tabular-nums">
                    {formatQty(r.qty)} {r.satuan}
                  </td>
                  <td className="px-3 py-2.5 align-top text-center">
                    {rowState[r.id] === 'idle' && (
                      <span className="text-xs text-slate-400">Menunggu</span>
                    )}
                    {rowState[r.id] === 'loading' && (
                      <span className="inline-block w-4 h-4 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
                    )}
                    {rowState[r.id] === 'success' && (
                      <span className="text-xs font-medium text-emerald-600">
                        Berhasil
                      </span>
                    )}
                    {rowState[r.id] === 'error' && (
                      <span className="text-xs font-medium text-red-600">
                        Gagal
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {done && (
          <div
            className={`text-sm rounded-lg px-4 py-2.5 mt-4 ${
              errorCount > 0
                ? 'bg-amber-50 border border-amber-100 text-amber-700'
                : 'bg-emerald-50 border border-emerald-100 text-emerald-700'
            }`}
          >
            {successCount} item berhasil disetujui
            {errorCount > 0 ? `, ${errorCount} item gagal.` : '.'}
          </div>
        )}

        <div className="flex justify-end gap-2 mt-5 pb-1">
          <button
            onClick={onClose}
            disabled={running}
            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          >
            {done ? 'Tutup' : 'Batal'}
          </button>
          {!done && (
            <button
              onClick={handleApproveAll}
              disabled={running}
              className="px-5 py-2 text-sm bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {running ? 'Memproses...' : 'Approve Semua'}
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// =============================================================================
// Main list
// =============================================================================
const OutstandingStock: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<OutstandingStockItem[]>([]);

  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [searchInput, setSearchInput] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [selected, setSelected] = useState<Map<number, OutstandingStockItem>>(
    new Map(),
  );
  const [showApprove, setShowApprove] = useState<boolean>(false);

  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'success' });

  const fetchData = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/rm/outstandingStock`;
    try {
      setLoading(true);
      const res = await axios.get<OutstandingStockListResponse>(url, {
        params: {
          page,
          limit,
          search: searchTerm || undefined,
        },
        withCredentials: true,
      });
      setData(res.data.data || []);
      if (res.data.total_page) setTotalPages(res.data.total_page);
    } catch (error) {
      console.error('Error fetching outstanding stock data:', error);
      setData([]);
      setToast({
        open: true,
        message: 'Gagal memuat data stock outstanding.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, searchTerm]);

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

  const toggleItemSelected = (item: OutstandingStockItem) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(item.id)) {
        next.delete(item.id);
      } else {
        next.set(item.id, item);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    const allSelected =
      data.length > 0 && data.every((it) => selected.has(it.id));
    setSelected((prev) => {
      const next = new Map(prev);
      if (allSelected) {
        data.forEach((it) => next.delete(it.id));
      } else {
        data.forEach((it) => next.set(it.id, it));
      }
      return next;
    });
  };

  // Called by the modal once its sequential approve loop finishes — drops
  // the successfully-approved ids from the selection and refreshes the
  // list so approved items fall out (or update status) on screen. Rows
  // that failed stay selected so the user can retry them.
  const handleFinished = (approvedIds: number[]) => {
    setSelected((prev) => {
      const next = new Map(prev);
      approvedIds.forEach((id) => next.delete(id));
      return next;
    });
    if (approvedIds.length > 0) {
      setToast({
        open: true,
        message: `${approvedIds.length} item stock berhasil disetujui.`,
        severity: 'success',
      });
      fetchData();
    }
  };

  return (
    <div className="space-y-5 pb-20">
      {/* Filter card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <div className="max-w-md">
          <label className="block text-xs font-medium text-slate-500 mb-1.5">
            Cari No JO / Produk / Nama Barang
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ketik no JO, produk, atau nama barang..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <button
              onClick={handleSearch}
              className="shrink-0 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
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
              className="text-xs font-medium text-teal-600 hover:text-teal-800 transition-colors"
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
                <th className="px-3 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={
                      data.length > 0 && data.every((it) => selected.has(it.id))
                    }
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  No JO
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Produk
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Nama Barang
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Tipe
                </th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Qty
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Tgl Masuk
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-14 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-7 w-7 border-2 border-teal-500 border-t-transparent"></div>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-14 text-center">
                    <p className="text-slate-600 font-medium text-sm">
                      {EMPTY_TEXT}
                    </p>
                    {activeFilterCount > 0 && (
                      <p className="text-slate-400 text-xs mt-1">
                        Coba ubah atau reset filter pencarian.
                      </p>
                    )}
                  </td>
                </tr>
              ) : (
                data.map((it) => (
                  <tr key={it.id} className="hover:bg-slate-50/70">
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(it.id)}
                        onChange={() => toggleItemSelected(it)}
                        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                      />
                    </td>
                    <td className="px-3 py-3 font-medium text-teal-700">
                      {it.no_jo}
                    </td>
                    <td className="px-3 py-3 text-slate-700">{it.produk}</td>
                    <td className="px-3 py-3 text-slate-700">{it.nama_item}</td>
                    <td className="px-3 py-3 text-slate-500">
                      {it.tipe_barang || '-'}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      {formatQty(it.qty)} {it.satuan}
                    </td>
                    <td className="px-3 py-3 text-slate-600 whitespace-nowrap">
                      {formatDate(it.tgl_masuk)}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(
                          it.status,
                        )}`}
                      >
                        {statusLabel(it.status)}
                      </span>
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
                    ? 'bg-teal-600 text-white'
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

      {/* Floating selection bar */}
      {selected.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 flex justify-center px-4 pb-4">
          <div className="bg-slate-900 text-white rounded-2xl shadow-xl px-5 py-3 flex items-center gap-4">
            <p className="text-sm">
              <span className="font-semibold">{selected.size}</span> item
              dipilih
            </p>
            <button
              onClick={() => setSelected(new Map())}
              className="text-xs text-slate-300 hover:text-white transition-colors"
            >
              Batal pilih
            </button>
            <button
              onClick={() => setShowApprove(true)}
              className="px-4 py-1.5 text-sm bg-teal-500 hover:bg-teal-400 text-slate-900 font-semibold rounded-lg transition-colors"
            >
              Approve Stock
            </button>
          </div>
        </div>
      )}

      {showApprove && (
        <ApproveStockModal
          rows={Array.from(selected.values())}
          onClose={() => setShowApprove(false)}
          onFinished={handleFinished}
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

export default OutstandingStock;
