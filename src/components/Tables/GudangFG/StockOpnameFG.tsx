import React, { useEffect, useRef, useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import Loading from '../../Loading';
import { Pagination, Stack } from '@mui/material';

import { usePermissions } from '../../../constant/usePermissions';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserRef {
  id: number;
  nama: string;
  email?: string;
  role?: string;
  bagian?: string;
}

interface StockOpnameItem {
  id: number;
  id_stock_opname: number;
  id_gudang_finish_good: number;
  id_jo: number;
  id_io: number;
  id_so: number;
  id_customer: number;
  id_produk: number;
  id_user_save: number | null;
  id_user_approve: number | null;
  id_user_reject: number | null;
  no_jo: string;
  no_io: string;
  no_so: string;
  no_po_customer: string;
  customer: string;
  produk: string;
  po_qty: number;
  jumlah_qty: number;
  jumlah_qty_real: number | null;
  tgl_masuk: string | null;
  type_opname: 'sesuai' | 'lebih' | 'kurang' | null;
  tgl_create: string;
  tgl_respon: string | null;
  status: string;
  note: string | null;
  note_approve: string | null;
  note_reject: string | null;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  user_save?: UserRef | null;
  user_approve?: UserRef | null;
  user_reject?: UserRef | null;
}

interface StockOpname {
  id: number;
  id_user_create: number;
  id_user_approve: number | null;
  tgl_create: string;
  tgl_approve: string | null;
  period_from: string;
  period_to: string;
  status: string;
  status_tiket: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  stock_opname_item?: StockOpnameItem[];
}

interface ListResponse {
  data: StockOpname[];
  status: number;
  success: boolean;
  total_page?: number;
}

interface DetailResponse {
  data: StockOpname;
  status: number;
  success: boolean;
}

type TabKey = 'create' | 'monitor';

// Monitor tab's own status filter. 'requested' is the default "still with
// MR" view; the others let gudang look back at resolved tickets without
// leaving the Monitoring tab.
type MonitorStatus = 'requested' | 'approved' | 'rejected' | 'all';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtQty(val: number | null | undefined) {
  if (val == null) return '-';
  return val.toLocaleString('id-ID');
}

// Turn a raw digit string ("1000000") into a display string ("1.000.000").
// Anything that isn't a digit is stripped first, so it's safe to call on
// partially-typed input.
function formatThousands(raw: string): string {
  const clean = raw.replace(/\D/g, '');
  if (!clean) return '';
  return clean.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Reverse of formatThousands: turn "1.000.000" (or anything typed into the
// field) back into a plain digit string ("1000000") for state/backend use.
function unformatThousands(formatted: string): string {
  return formatted.replace(/\D/g, '');
}

const BULAN_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

function fmtDate(val: string | null | undefined): string {
  if (!val) return '-';
  const d = new Date(val);
  if (isNaN(d.getTime())) return String(val);
  const day = String(d.getDate()).padStart(2, '0');
  const month = BULAN_ID[d.getMonth()];
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

function toDateInputVal(val: string | null | undefined): string {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

const TICKET_STATUS_META: Record<string, { label: string; cls: string }> = {
  draft: { label: 'Draft', cls: 'bg-gray-100 text-gray-600' },
  requested: {
    label: 'Menunggu Approval MR',
    cls: 'bg-amber-100 text-amber-700',
  },
  approved: { label: 'Disetujui', cls: 'bg-green-100 text-green-700' },
  rejected: { label: 'Ditolak', cls: 'bg-red-100 text-red-700' },
};

function TicketStatusBadge({ status }: { status: string }) {
  const meta = TICKET_STATUS_META[status] ?? {
    label: status || '-',
    cls: 'bg-gray-100 text-gray-600',
  };
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${meta.cls}`}
    >
      {meta.label}
    </span>
  );
}

const ITEM_STATUS_META: Record<string, { label: string; cls: string }> = {
  incoming: { label: 'Belum Diisi', cls: 'bg-gray-100 text-gray-500' },
  saved: { label: 'Tersimpan', cls: 'bg-blue-100 text-blue-700' },
  approved: { label: 'Disetujui MR', cls: 'bg-green-100 text-green-700' },
  rejected: { label: 'Ditolak MR', cls: 'bg-red-100 text-red-700' },
};

function ItemStatusBadge({ status }: { status: string }) {
  const meta = ITEM_STATUS_META[status] ?? {
    label: status || '-',
    cls: 'bg-gray-100 text-gray-500',
  };
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${meta.cls}`}
    >
      {meta.label}
    </span>
  );
}

const DONE_ITEM_STATUSES = ['approved', 'rejected'];

// Central rule for whether a single item's qty/note can be edited by gudang.
//   - Nothing is editable once the ticket itself is finalized (approved/rejected).
//   - On the "Buat & Input Opname" tab (ticket still draft), anything that
//     hasn't been individually approved/rejected yet is editable — the normal
//     fill-in-the-numbers flow.
//   - On the "Monitoring Approval MR" tab (ticket out for review), gudang can
//     no longer touch items that are still pending ('saved') or already
//     approved — only items MR sent back ('rejected') can be corrected and
//     resaved for MR to re-review.
function isItemEditable(
  mode: TabKey,
  ticketStatus: string | undefined,
  itemStatus: string,
): boolean {
  if (ticketStatus === 'approved' || ticketStatus === 'rejected') return false;
  if (mode === 'monitor') {
    return itemStatus === 'rejected';
  }
  return !DONE_ITEM_STATUSES.includes(itemStatus);
}

// ─── Create Opname Modal ───────────────────────────────────────────────────────

function CreateOpnameModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (ticket: StockOpname) => void;
}) {
  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [periodFrom, setPeriodFrom] = useState(
    toDateInputVal(firstOfMonth.toISOString()),
  );
  const [periodTo, setPeriodTo] = useState(
    toDateInputVal(lastOfMonth.toISOString()),
  );
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit() {
    if (!periodFrom || !periodTo) {
      setErrorMsg('Periode awal dan akhir wajib diisi');
      return;
    }
    if (new Date(periodFrom) > new Date(periodTo)) {
      setErrorMsg('Periode awal tidak boleh melebihi periode akhir');
      return;
    }
    try {
      setSubmitting(true);
      setErrorMsg(null);
      const res: AxiosResponse<DetailResponse> = await axios.post(
        `${import.meta.env.VITE_API_LINK}/fg/stockOpname`,
        { period_from: periodFrom, period_to: periodTo },
        { withCredentials: true },
      );
      onCreated(res.data.data);
    } catch (err) {
      console.error(err);
      setErrorMsg('Gagal membuat opname. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-4 text-white flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold">Buat Stock Opname</h3>
            <p className="text-violet-200 text-xs mt-0.5">
              Tentukan periode opname
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-violet-200 text-2xl font-bold leading-none"
          >
            ×
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-600">
              Periode Dari
            </label>
            <input
              type="date"
              value={periodFrom}
              onChange={(e) => setPeriodFrom(e.target.value)}
              className="mt-1 w-full rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">
              Periode Sampai
            </label>
            <input
              type="date"
              value={periodTo}
              onChange={(e) => setPeriodTo(e.target.value)}
              className="mt-1 w-full rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>
          {errorMsg && (
            <p className="text-xs text-red-500 font-medium">{errorMsg}</p>
          )}
        </div>
        <div className="px-5 pb-5 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg text-sm transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white font-semibold rounded-lg text-sm transition-colors"
          >
            {submitting ? 'Menyimpan...' : 'Buat Opname'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Ticket List ────────────────────────────────────────────────────────────────

function TicketListTable({
  onOpenTicket,
  refreshKey,
  onCreateNew,
  canCreate,
  mode,
}: {
  onOpenTicket: (id: number) => void;
  refreshKey: number;
  onCreateNew?: () => void;
  canCreate?: boolean;
  // Which tab this table is rendered under. Drives the status filter sent
  // to the backend:
  //   - 'create'  -> always draft,approved,rejected (never shows tickets
  //                  that are currently out for MR review).
  //   - 'monitor' -> driven by the monitorStatus dropdown below, so gudang
  //                  can switch between "still with MR" and history.
  // This assumes the backend's GET /fg/stockOpname endpoint can filter by a
  // `status` param that accepts either a single value ("requested") or a
  // comma-separated list ("draft,approved,rejected"). If your API only
  // accepts a single status, split this into per-status calls or add an
  // `exclude_status` param instead.
  mode: TabKey;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [tickets, setTickets] = useState<StockOpname[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [periodFrom, setPeriodFrom] = useState('');
  const [periodTo, setPeriodTo] = useState('');
  // Only relevant when mode === 'monitor'. Defaults to the "still needs my
  // attention" view; gudang can switch to approved/rejected/all to browse
  // history without leaving the Monitoring tab.
  const [monitorStatus, setMonitorStatus] =
    useState<MonitorStatus>('requested');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const statusFilter =
    mode === 'create' ? 'draft' : monitorStatus === 'all' ? '' : monitorStatus;

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line
  }, [page, limit, refreshKey, statusFilter]);

  function fetchList() {
    (async () => {
      try {
        setIsLoading(true);
        const res: AxiosResponse<ListResponse> = await axios.get(
          `${import.meta.env.VITE_API_LINK}/fg/stockOpname`,
          {
            params: {
              page,
              limit,
              status: statusFilter || undefined,
              period_from: periodFrom || undefined,
              period_to: periodTo || undefined,
            },
            withCredentials: true,
          },
        );
        setTickets(Array.isArray(res.data?.data) ? res.data.data : []);
        setTotalPages(res.data?.total_page || 1);
      } catch (err) {
        console.error(err);
        setTickets([]);
      } finally {
        setIsLoading(false);
      }
    })();
  }

  function handleFilterChange() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchList();
    }, 400);
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {isLoading && <Loading />}
      <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-3 sm:p-4 flex items-center justify-between gap-3 flex-wrap">
        <h3 className="text-white text-base sm:text-lg font-bold flex items-center gap-2">
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
          Daftar Tiket Stock Opname
        </h3>
        {canCreate && onCreateNew && (
          <button
            onClick={onCreateNew}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-violet-700 text-sm font-semibold rounded-lg shadow hover:bg-violet-50 transition-all"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Buat Opname Baru
          </button>
        )}
      </div>

      <div className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-end gap-3 border-b border-gray-100 flex-wrap">
        {mode === 'monitor' && (
          <div>
            <label className="text-[10px] font-semibold text-gray-500">
              Status
            </label>
            <select
              value={monitorStatus}
              onChange={(e) => {
                setMonitorStatus(e.target.value as MonitorStatus);
                setPage(1);
              }}
              className="mt-1 block rounded-lg bg-blue-50 border border-blue-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-violet-400"
            >
              <option value="requested">Menunggu Approval MR</option>

              <option value="all">Semua (Riwayat)</option>
            </select>
          </div>
        )}
        <div>
          <label className="text-[10px] font-semibold text-gray-500">
            Periode Dari
          </label>
          <input
            type="date"
            value={periodFrom}
            onChange={(e) => {
              setPeriodFrom(e.target.value);
              handleFilterChange();
            }}
            className="mt-1 block rounded-lg bg-blue-50 border border-blue-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
        </div>
        <div>
          <label className="text-[10px] font-semibold text-gray-500">
            Periode Sampai
          </label>
          <input
            type="date"
            value={periodTo}
            onChange={(e) => {
              setPeriodTo(e.target.value);
              handleFilterChange();
            }}
            className="mt-1 block rounded-lg bg-blue-50 border border-blue-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm min-w-[720px]">
          <thead className="bg-gray-100">
            <tr>
              {['No', 'Periode', 'Tgl Dibuat', 'Status', 'Aksi'].map((h) => (
                <th
                  key={h}
                  className="p-2 sm:p-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-8 text-center text-gray-500 text-sm"
                >
                  Tidak ada tiket stock opname
                </td>
              </tr>
            ) : (
              tickets.map((t, idx) => (
                <tr
                  key={t.id}
                  className="border-b hover:bg-blue-50 transition-colors cursor-pointer"
                  onClick={() => onOpenTicket(t.id)}
                >
                  <td className="p-2 sm:p-3 text-xs text-gray-400">
                    {(page - 1) * limit + idx + 1}
                  </td>
                  <td className="p-2 sm:p-3 text-xs font-semibold text-gray-700 whitespace-nowrap">
                    {fmtDate(t.period_from)} s/d {fmtDate(t.period_to)}
                  </td>
                  <td className="p-2 sm:p-3 text-xs text-gray-600 whitespace-nowrap">
                    {fmtDate(t.tgl_create)}
                  </td>
                  <td className="p-2 sm:p-3">
                    <TicketStatusBadge status={t.status} />
                  </td>

                  <td className="p-2 sm:p-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenTicket(t.id);
                      }}
                      className="text-[10px] font-bold text-violet-600 hover:text-violet-800"
                    >
                      Buka →
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Rows per page:</span>
          <div className="flex gap-2">
            {[10, 25, 50].map((pageSize) => (
              <button
                key={pageSize}
                onClick={() => {
                  setLimit(pageSize);
                  setPage(1);
                }}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  limit === pageSize
                    ? 'bg-violet-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
            color="primary"
            page={page}
            onChange={(_e, i) => setPage(i)}
            size="small"
          />
        </Stack>
      </div>
    </div>
  );
}

// ─── Opname Detail (create / input mode) ───────────────────────────────────────

function OpnameDetail({
  ticketId,
  mode,
  onBack,
  onRequested,
}: {
  ticketId: number;
  mode: TabKey;
  onBack: () => void;
  onRequested: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [ticket, setTicket] = useState<StockOpname | null>(null);
  const [drafts, setDrafts] = useState<
    Record<number, { qty: string; note: string }>
  >({});
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [savingProgress, setSavingProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line
  }, [ticketId]);

  async function fetchDetail() {
    try {
      setIsLoading(true);
      const res: AxiosResponse<DetailResponse> = await axios.get(
        `${import.meta.env.VITE_API_LINK}/fg/stockOpname/${ticketId}`,
        { withCredentials: true },
      );
      const t = res.data.data;
      setTicket(t);
      const nextDrafts: Record<number, { qty: string; note: string }> = {};
      (t.stock_opname_item ?? []).forEach((it) => {
        // Keep this as a plain digit string internally (e.g. "1000000").
        // Formatting with thousand separators only happens at render time.
        nextDrafts[it.id] = {
          qty: it.jumlah_qty_real != null ? String(it.jumlah_qty_real) : '',
          note: it.note ?? '',
        };
      });
      setDrafts(nextDrafts);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  const items = ticket?.stock_opname_item ?? [];
  const editableItems = items.filter((it) =>
    isItemEditable(mode, ticket?.status, it.status),
  );
  const allFilled =
    items.length > 0 && items.every((it) => it.status !== 'incoming');
  const canRequest =
    mode === 'create' &&
    ticket != null &&
    ticket.status !== 'approved' &&
    ticket.status !== 'rejected' &&
    allFilled;

  async function saveItem(id: number) {
    const draft = drafts[id];
    if (!draft) return;
    try {
      setSavingId(id);
      await axios.put(
        `${import.meta.env.VITE_API_LINK}/fg/stockOpnameItem/save/${id}`,
        {
          jumlah_qty_real: Number(draft.qty) || 0,
          note: draft.note || null,
        },
        { withCredentials: true },
      );
      await fetchDetail();
      setChecked((p) => ({ ...p, [id]: false }));
    } catch (err) {
      console.error(err);
    } finally {
      setSavingId(null);
    }
  }

  // Bulk save = a real queue: requests are sent strictly one at a time,
  // in order, and each one is awaited before the next is fired. A failure
  // on one item is caught and recorded but does NOT stop the rest of the
  // queue, and the failed item is left checked so it's easy to retry.
  async function saveSelected() {
    const ids = editableItems.map((it) => it.id).filter((id) => checked[id]);
    if (ids.length === 0) return;

    setBulkSaving(true);
    setSavingProgress({ done: 0, total: ids.length });
    const failedIds: number[] = [];

    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      const draft = drafts[id];
      if (!draft) {
        setSavingProgress({ done: i + 1, total: ids.length });
        continue;
      }
      try {
        // eslint-disable-next-line no-await-in-loop
        await axios.put(
          `${import.meta.env.VITE_API_LINK}/fg/stockOpnameItem/save/${id}`,
          {
            // draft.qty is always a plain digit string (see onChange below
            // and fetchDetail above), so Number() here is safe and will
            // never silently collapse to 0 because of "1.000.000"-style
            // formatting leaking into the payload.
            jumlah_qty_real: Number(draft.qty) || 0,
            note: draft.note || null,
          },
          { withCredentials: true },
        );
      } catch (err) {
        console.error(`Gagal menyimpan item ${id}:`, err);
        failedIds.push(id);
      }
      setSavingProgress({ done: i + 1, total: ids.length });
    }

    await fetchDetail();

    // Leave failed items checked so the user can just hit "Simpan Terpilih"
    // again to retry only those; clear the rest.
    setChecked(
      failedIds.length > 0
        ? Object.fromEntries(failedIds.map((id) => [id, true]))
        : {},
    );

    setBulkSaving(false);
    setSavingProgress(null);
  }

  function toggleCheckAll(val: boolean) {
    const next: Record<number, boolean> = {};
    editableItems.forEach((it) => {
      next[it.id] = val;
    });
    setChecked(next);
  }

  async function handleRequest() {
    if (!ticket) return;
    try {
      setRequesting(true);
      await axios.put(
        `${import.meta.env.VITE_API_LINK}/fg/stockOpname/request/${ticket.id}`,
        {},
        { withCredentials: true },
      );
      await fetchDetail();
      onRequested();
    } catch (err) {
      console.error(err);
    } finally {
      setRequesting(false);
    }
  }

  const checkedCount = Object.values(checked).filter(Boolean).length;
  const allChecked =
    editableItems.length > 0 && editableItems.every((it) => checked[it.id]);
  const showCheckboxColumn = editableItems.length > 0;

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {(isLoading || bulkSaving || requesting) && <Loading />}
      <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-3 sm:p-4 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <button
            onClick={onBack}
            className="text-violet-100 hover:text-white text-xs font-semibold mb-1 flex items-center gap-1"
          >
            ← Kembali ke daftar
          </button>
          <h3 className="text-white text-base sm:text-lg font-bold">
            {ticket
              ? `Periode ${fmtDate(ticket.period_from)} s/d ${fmtDate(
                  ticket.period_to,
                )}`
              : 'Memuat...'}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {ticket && <TicketStatusBadge status={ticket.status} />}
          {canRequest && (
            <button
              onClick={handleRequest}
              disabled={requesting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-violet-700 text-sm font-semibold rounded-lg shadow hover:bg-violet-50 disabled:opacity-50 transition-all"
            >
              Request ke MR
            </button>
          )}
        </div>
      </div>

      {mode === 'create' &&
        !allFilled &&
        ticket &&
        ticket.status !== 'approved' &&
        ticket.status !== 'rejected' && (
          <div className="mx-4 mt-4 flex items-center gap-2 text-xs bg-amber-50 border border-amber-200 text-amber-700 rounded-lg px-3 py-2">
            <svg
              className="w-3.5 h-3.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Isi jumlah aktual untuk semua item sebelum request ke MR.
          </div>
        )}

      {mode === 'monitor' && ticket?.status === 'requested' && (
        <div className="mx-4 mt-4 flex items-center gap-2 text-xs bg-blue-50 border border-blue-200 text-blue-700 rounded-lg px-3 py-2">
          <svg
            className="w-3.5 h-3.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Tiket ini sedang direview oleh MR. Item yang ditolak dapat Anda
          perbaiki dan simpan ulang di bawah ini.
        </div>
      )}

      {showCheckboxColumn && (
        <div className="mx-4 mt-4 flex items-center justify-between gap-2 bg-violet-50 border border-violet-200 rounded-lg px-3 py-2">
          <label className="flex items-center gap-2 text-xs font-semibold text-violet-700">
            <input
              type="checkbox"
              checked={allChecked}
              onChange={(e) => toggleCheckAll(e.target.checked)}
            />
            Pilih Semua ({editableItems.length})
          </label>
          <button
            onClick={saveSelected}
            disabled={checkedCount === 0 || bulkSaving}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white transition-colors"
          >
            {bulkSaving && savingProgress
              ? `Menyimpan ${savingProgress.done}/${savingProgress.total}...`
              : `Simpan Terpilih (${checkedCount})`}
          </button>
        </div>
      )}

      <div className="overflow-x-auto mt-4">
        <table className="w-full text-xs sm:text-sm min-w-[1080px]">
          <thead className="bg-gray-100">
            <tr>
              {showCheckboxColumn && <th className="p-2 sm:p-3 w-8" />}
              {[
                'No JO',
                'No IO',
                'Produk',
                'Customer',
                'Tgl Masuk',
                'Jumlah Aktual',
                'Catatan',
                'Status',
              ].map((h) => (
                <th
                  key={h}
                  className="p-2 sm:p-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={showCheckboxColumn ? 9 : 8}
                  className="p-8 text-center text-gray-500 text-sm"
                >
                  Tidak ada data barang pada tiket ini
                </td>
              </tr>
            ) : (
              items.map((it) => {
                const isEditable = isItemEditable(
                  mode,
                  ticket?.status,
                  it.status,
                );
                const draft = drafts[it.id] ?? { qty: '', note: '' };
                return (
                  <tr
                    key={it.id}
                    className="border-b hover:bg-blue-50 transition-colors"
                  >
                    {showCheckboxColumn && (
                      <td className="p-2 sm:p-3">
                        {isEditable && (
                          <input
                            type="checkbox"
                            checked={!!checked[it.id]}
                            onChange={(e) =>
                              setChecked((p) => ({
                                ...p,
                                [it.id]: e.target.checked,
                              }))
                            }
                          />
                        )}
                      </td>
                    )}
                    <td className="p-2 sm:p-3 text-xs font-bold text-violet-600 whitespace-nowrap">
                      {it.no_jo || '-'}
                    </td>
                    <td className="p-2 sm:p-3 text-xs text-gray-600 whitespace-nowrap">
                      {it.no_io || '-'}
                    </td>
                    <td className="p-2 sm:p-3 text-xs max-w-[200px]">
                      <span className="block " title={it.produk}>
                        {it.produk || '-'}
                      </span>
                    </td>
                    <td className="p-2 sm:p-3 text-xs text-gray-700">
                      {it.customer || '-'}
                    </td>
                    <td className="p-2 sm:p-3 text-xs whitespace-nowrap">
                      {fmtDate(it.tgl_masuk)}
                    </td>

                    <td className="p-2 sm:p-3">
                      {isEditable ? (
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9.]*"
                          value={formatThousands(draft.qty)}
                          onChange={(e) =>
                            setDrafts((p) => ({
                              ...p,
                              [it.id]: {
                                ...draft,
                                qty: unformatThousands(e.target.value),
                              },
                            }))
                          }
                          placeholder="0"
                          className="w-28 rounded-lg bg-blue-50 border border-blue-200 px-2 py-1.5 text-xs text-right focus:outline-none focus:ring-2 focus:ring-violet-400"
                        />
                      ) : (
                        <span className="text-xs font-bold text-gray-800">
                          {fmtQty(it.jumlah_qty_real)}
                        </span>
                      )}
                    </td>
                    <td className="p-2 sm:p-3">
                      {isEditable ? (
                        <input
                          type="text"
                          value={draft.note}
                          onChange={(e) =>
                            setDrafts((p) => ({
                              ...p,
                              [it.id]: { ...draft, note: e.target.value },
                            }))
                          }
                          placeholder="Catatan (opsional)"
                          className="w-36 rounded-lg bg-blue-50 border border-blue-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-violet-400"
                        />
                      ) : (
                        <span className="text-xs text-gray-500">
                          {it.note || '-'}
                        </span>
                      )}
                    </td>

                    <td className="p-2 sm:p-3 space-y-1">
                      <ItemStatusBadge status={it.status} />
                      {it.status === 'rejected' && it.note_reject && (
                        <p className="text-[10px] text-red-500 max-w-[160px]">
                          <span className="font-semibold">Alasan ditolak:</span>{' '}
                          {it.note_reject}
                        </p>
                      )}
                      {it.status === 'approved' && it.note_approve && (
                        <p className="text-[10px] text-green-600 max-w-[160px]">
                          <span className="font-semibold">Catatan:</span>{' '}
                          {it.note_approve}
                        </p>
                      )}
                      {/* {isEditable && (
                        <button
                          onClick={() => saveItem(it.id)}
                          disabled={savingId === it.id}
                          className="text-[10px] font-bold text-violet-600 hover:text-violet-800 disabled:opacity-40"
                        >
                          {savingId === it.id ? 'Menyimpan...' : 'Simpan'}
                        </button>
                      )} */}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {ticket &&
        (ticket.status === 'approved' || ticket.status === 'rejected') && (
          <div className="m-4 flex items-center gap-2 text-xs bg-gray-50 border border-gray-200 text-gray-600 rounded-lg px-3 py-2">
            Tiket ini telah{' '}
            {ticket.status === 'approved' ? 'disetujui' : 'ditolak'} oleh MR
            pada {fmtDate(ticket.tgl_approve)}.
          </div>
        )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

const StockOpnameFG: React.FC = () => {
  const role = localStorage.getItem('userRole') ?? '';
  const bagian = localStorage.getItem('userBagian') ?? '';
  const { checkEdit } = usePermissions(role, bagian);
  const canEdit = checkEdit('/gudang-fg/stock-opname');

  const [tab, setTab] = useState<TabKey>('create');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  function openTab(next: TabKey) {
    setTab(next);
    setSelectedTicketId(null);
  }

  return (
    <main>
      {showCreateModal && (
        <CreateOpnameModal
          onClose={() => setShowCreateModal(false)}
          onCreated={(ticket) => {
            setShowCreateModal(false);
            setRefreshKey((k) => k + 1);
            setSelectedTicketId(ticket.id);
          }}
        />
      )}

      {/* Header */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden mb-4">
        <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-3 sm:p-4">
          <h2 className="text-white text-base sm:text-lg md:text-xl font-bold flex items-center">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 mr-2 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
            Stock Opname Finish Good
          </h2>
        </div>
        <div className="p-3 sm:p-4 flex gap-2">
          <button
            onClick={() => openTab('create')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
              tab === 'create'
                ? 'bg-violet-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Buat &amp; Input Opname
          </button>
          <button
            onClick={() => openTab('monitor')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
              tab === 'monitor'
                ? 'bg-violet-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Monitoring Approval MR
          </button>
        </div>
      </div>

      {selectedTicketId != null ? (
        <OpnameDetail
          ticketId={selectedTicketId}
          mode={tab}
          onBack={() => setSelectedTicketId(null)}
          onRequested={() => setRefreshKey((k) => k + 1)}
        />
      ) : (
        <TicketListTable
          key={tab}
          refreshKey={refreshKey}
          onOpenTicket={(id) => setSelectedTicketId(id)}
          onCreateNew={() => setShowCreateModal(true)}
          canCreate={tab === 'create' && canEdit}
          mode={tab}
        />
      )}
    </main>
  );
};

export default StockOpnameFG;
