import React, { useEffect, useRef, useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import Loading from '../../Loading';
import { Pagination, Stack } from '@mui/material';

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtQty(val: number | null | undefined) {
  if (val == null) return '-';
  return val.toLocaleString('id-ID');
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

const TICKET_STATUS_META: Record<string, { label: string; cls: string }> = {
  draft: { label: 'Draft', cls: 'bg-gray-100 text-gray-600' },
  requested: {
    label: 'Menunggu Approval',
    cls: 'bg-amber-100 text-amber-700',
  },
  approved: { label: 'Disetujui', cls: 'bg-green-100 text-green-700' },
  rejected: { label: 'Ditolak', cls: 'bg-red-100 text-red-700' },
  history: { label: 'Riwayat', cls: 'bg-gray-100 text-gray-600' },
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
  saved: { label: 'Menunggu Review', cls: 'bg-blue-100 text-blue-700' },
  approved: { label: 'Disetujui', cls: 'bg-green-100 text-green-700' },
  rejected: { label: 'Ditolak', cls: 'bg-red-100 text-red-700' },
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

const TYPE_OPNAME_META: Record<string, { label: string; cls: string }> = {
  sesuai: { label: 'Sesuai', cls: 'bg-blue-100 text-blue-700' },
  lebih: { label: 'Lebih', cls: 'bg-green-100 text-green-700' },
  kurang: { label: 'Kurang', cls: 'bg-red-100 text-red-700' },
};

function TypeOpnameBadge({ type }: { type: string | null }) {
  if (!type) return <span className="text-[10px] text-gray-300">-</span>;
  const meta = TYPE_OPNAME_META[type] ?? {
    label: type,
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

function diffQty(real: number | null, sistem: number) {
  if (real == null) return null;
  return real - sistem;
}

function DiffCell({ real, sistem }: { real: number | null; sistem: number }) {
  const diff = diffQty(real, sistem);
  if (diff == null) return <span className="text-xs text-gray-300">-</span>;
  const cls =
    diff === 0 ? 'text-gray-500' : diff > 0 ? 'text-green-600' : 'text-red-600';
  const sign = diff > 0 ? '+' : '';
  return (
    <span className={`text-xs font-bold ${cls}`}>
      {sign}
      {fmtQty(diff)}
    </span>
  );
}

const RESOLVABLE_ITEM_STATUSES = ['saved'];

// A ticket is considered "finalized" (no more actions possible) either when
// its own status is directly approved/rejected, or when it has been moved
// into "history" — in which case the real outcome lives in status_tiket.
function isTicketFinalized(ticket: StockOpname | null): boolean {
  if (!ticket) return false;
  return (
    ticket.status === 'approved' ||
    ticket.status === 'rejected' ||
    ticket.status === 'history'
  );
}

// Resolves the status value that should actually be displayed to the user:
// when the ticket is in "history", the real outcome is in status_tiket.
function displayTicketStatus(ticket: StockOpname): string {
  return ticket.status === 'history' ? ticket.status_tiket : ticket.status;
}

// ─── Confirm Modal ──────────────────────────────────────────────────────────────

function ConfirmModal({
  title,
  message,
  confirmLabel,
  confirmColor,
  onConfirm,
  onClose,
  loading,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  confirmColor: 'green' | 'red';
  onConfirm: () => void;
  onClose: () => void;
  loading: boolean;
}) {
  const colorCls =
    confirmColor === 'green'
      ? 'bg-emerald-600 hover:bg-emerald-700'
      : 'bg-red-600 hover:bg-red-700';
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5">
        <h3 className="text-base font-bold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500 mt-2">{message}</p>
        <div className="flex gap-3 justify-end mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg text-sm transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-40 ${colorCls}`}
          >
            {loading ? 'Memproses...' : confirmLabel}
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
}: {
  onOpenTicket: (id: number) => void;
  refreshKey: number;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [tickets, setTickets] = useState<StockOpname[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState<string>('requested');
  const [periodFrom, setPeriodFrom] = useState('');
  const [periodTo, setPeriodTo] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line
  }, [page, limit, status, refreshKey]);

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
              status: status || undefined,
              period_from: periodFrom || undefined,
              period_to: periodTo || undefined,
            },
            withCredentials: true,
          },
        );
        console.log('fetchList res', res.data);
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
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-3 sm:p-4">
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Daftar Tiket Stock Opname
        </h3>
      </div>

      <div className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-end gap-3 border-b border-gray-100 flex-wrap">
        <div>
          <label className="text-[10px] font-semibold text-gray-500">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="mt-1 block rounded-lg bg-blue-50 border border-blue-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <option value="">Semua</option>
            <option value="requested">Menunggu Approval</option>
            <option value="approved">Disetujui</option>
            <option value="rejected">Ditolak</option>
          </select>
        </div>
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
            className="mt-1 block rounded-lg bg-blue-50 border border-blue-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400"
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
            className="mt-1 block rounded-lg bg-blue-50 border border-blue-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400"
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
                    <TicketStatusBadge
                      status={
                        t.status === 'history' ? t.status_tiket : t.status
                      }
                    />
                  </td>

                  <td className="p-2 sm:p-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenTicket(t.id);
                      }}
                      className="text-[10px] font-bold text-emerald-600 hover:text-emerald-800"
                    >
                      Review →
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
                    ? 'bg-emerald-600 text-white'
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

// ─── Approval Detail ────────────────────────────────────────────────────────────

function ApprovalDetail({
  ticketId,
  onBack,
  onResolved,
}: {
  ticketId: number;
  onBack: () => void;
  onResolved: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [ticket, setTicket] = useState<StockOpname | null>(null);
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [note, setNote] = useState('');
  const [processing, setProcessing] = useState(false);
  const [confirmTicketAction, setConfirmTicketAction] = useState<
    'approve' | 'reject' | null
  >(null);
  const [ticketActionLoading, setTicketActionLoading] = useState(false);

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
      console.log('fetchDetail res', res.data);
      setTicket(res.data.data);
      setChecked({});
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  const items = ticket?.stock_opname_item ?? [];
  const resolvableItems = items.filter((it) =>
    RESOLVABLE_ITEM_STATUSES.includes(it.status),
  );
  const checkedCount = Object.values(checked).filter(Boolean).length;
  const allChecked =
    resolvableItems.length > 0 && resolvableItems.every((it) => checked[it.id]);
  const allItemsResolved =
    items.length > 0 &&
    items.every((it) => it.status === 'approved' || it.status === 'rejected');

  const approvedCount = items.filter((it) => it.status === 'approved').length;
  const rejectedCount = items.filter((it) => it.status === 'rejected').length;

  // Once a ticket is finalized — either directly approved/rejected, or moved
  // into "history" (with the real outcome living in status_tiket) — no more
  // ticket-level actions are allowed.
  const finalized = isTicketFinalized(ticket);

  // Ticket-level "Setujui" is only allowed once review is complete, the
  // ticket is not yet finalized, AND every single item ended up approved —
  // a ticket with any rejected item cannot be approved as a whole.
  const canApproveTicket =
    ticket != null && !finalized && allItemsResolved && rejectedCount === 0;

  // Ticket-level "Tolak" just needs review to be complete and the ticket to
  // not already be finalized — if review is done and at least one item was
  // rejected (or even if all happen to be approved but MR still wants to
  // reject the ticket), rejecting is allowed.
  const canRejectTicket = ticket != null && !finalized && allItemsResolved;

  function toggleCheckAll(val: boolean) {
    const next: Record<number, boolean> = {};
    resolvableItems.forEach((it) => {
      next[it.id] = val;
    });
    setChecked(next);
  }

  async function handleItemAction(action: 'approve' | 'reject') {
    const idList = resolvableItems
      .map((it) => it.id)
      .filter((id) => checked[id]);
    if (idList.length === 0) return;
    const endpoint =
      action === 'approve'
        ? '/fg/stockOpnameItem/approve'
        : '/fg/stockOpnameItem/reject';
    try {
      setProcessing(true);
      await axios.put(
        `${import.meta.env.VITE_API_LINK}${endpoint}`,
        action === 'approve'
          ? { id_list: idList, note_approve: note || null }
          : { id_list: idList, note_reject: note || null },
        { withCredentials: true },
      );
      setNote('');
      await fetchDetail();
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  }

  async function handleTicketAction() {
    if (!ticket || !confirmTicketAction) return;
    const endpoint =
      confirmTicketAction === 'approve'
        ? `/fg/stockOpname/approve/${ticket.id}`
        : `/fg/stockOpname/reject/${ticket.id}`;
    try {
      setTicketActionLoading(true);
      await axios.put(
        `${import.meta.env.VITE_API_LINK}${endpoint}`,
        {},
        { withCredentials: true },
      );
      setConfirmTicketAction(null);
      await fetchDetail();
      onResolved();
    } catch (err) {
      console.error(err);
    } finally {
      setTicketActionLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {(isLoading || processing) && <Loading />}

      {confirmTicketAction && (
        <ConfirmModal
          title={
            confirmTicketAction === 'approve'
              ? 'Setujui Tiket Opname'
              : 'Tolak Tiket Opname'
          }
          message={
            confirmTicketAction === 'approve'
              ? 'Seluruh item pada tiket ini akan ditandai sebagai disetujui. Lanjutkan?'
              : 'Tiket opname ini akan ditandai sebagai ditolak. Lanjutkan?'
          }
          confirmLabel={confirmTicketAction === 'approve' ? 'Setujui' : 'Tolak'}
          confirmColor={confirmTicketAction === 'approve' ? 'green' : 'red'}
          onConfirm={handleTicketAction}
          onClose={() => setConfirmTicketAction(null)}
          loading={ticketActionLoading}
        />
      )}

      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-3 sm:p-4 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <button
            onClick={onBack}
            className="text-emerald-100 hover:text-white text-xs font-semibold mb-1 flex items-center gap-1"
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
          {ticket && <TicketStatusBadge status={displayTicketStatus(ticket)} />}
        </div>
      </div>

      {ticket && (
        <div className="mx-4 mt-4 flex flex-wrap items-center gap-3 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 font-semibold">
            Total: {items.length}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-semibold">
            Disetujui: {approvedCount}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 font-semibold">
            Ditolak: {rejectedCount}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold">
            Menunggu: {resolvableItems.length}
          </span>
        </div>
      )}

      {resolvableItems.length > 0 && (
        <div className="mx-4 mt-4 flex flex-col gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <label className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={(e) => toggleCheckAll(e.target.checked)}
              />
              Pilih Semua ({resolvableItems.length})
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleItemAction('approve')}
                disabled={checkedCount === 0 || processing}
                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white transition-colors"
              >
                Setujui Terpilih ({checkedCount})
              </button>
              <button
                onClick={() => handleItemAction('reject')}
                disabled={checkedCount === 0 || processing}
                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white transition-colors"
              >
                Tolak Terpilih ({checkedCount})
              </button>
            </div>
          </div>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Catatan untuk item terpilih (opsional)"
            className="w-full rounded-lg bg-white border border-emerald-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>
      )}

      <div className="overflow-x-auto mt-4">
        <table className="w-full text-xs sm:text-sm min-w-[1180px]">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 sm:p-3 w-8" />
              {[
                'No JO',
                'No IO',
                'Produk',
                'Customer',
                'Tgl Masuk',
                'Stok Sistem',
                'Hasil Opname',
                'Selisih',
                'Tipe',
                'Catatan Gudang',
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
                  colSpan={12}
                  className="p-8 text-center text-gray-500 text-sm"
                >
                  Tidak ada data barang pada tiket ini
                </td>
              </tr>
            ) : (
              items.map((it) => {
                const resolvable = RESOLVABLE_ITEM_STATUSES.includes(it.status);
                return (
                  <tr
                    key={it.id}
                    className="border-b hover:bg-blue-50 transition-colors"
                  >
                    <td className="p-2 sm:p-3">
                      {resolvable && (
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
                    <td className="p-2 sm:p-3 text-xs font-bold text-violet-600 whitespace-nowrap">
                      {it.no_jo || '-'}
                    </td>
                    <td className="p-2 sm:p-3 text-xs text-gray-600 whitespace-nowrap">
                      {it.no_io || '-'}
                    </td>
                    <td className="p-2 sm:p-3 text-xs max-w-[180px]">
                      <span className="block truncate" title={it.produk}>
                        {it.produk || '-'}
                      </span>
                    </td>
                    <td className="p-2 sm:p-3 text-xs text-gray-700">
                      {it.customer || '-'}
                    </td>
                    <td className="p-2 sm:p-3 text-xs whitespace-nowrap">
                      {fmtDate(it.tgl_masuk)}
                    </td>
                    <td className="p-2 sm:p-3 text-xs text-right font-bold text-indigo-700">
                      {fmtQty(it.jumlah_qty)}
                    </td>
                    <td className="p-2 sm:p-3 text-xs text-right font-bold text-gray-800">
                      {fmtQty(it.jumlah_qty_real)}
                    </td>
                    <td className="p-2 sm:p-3 text-right">
                      <DiffCell
                        real={it.jumlah_qty_real}
                        sistem={it.jumlah_qty}
                      />
                    </td>
                    <td className="p-2 sm:p-3">
                      <TypeOpnameBadge type={it.type_opname} />
                    </td>
                    <td className="p-2 sm:p-3 text-xs text-gray-500 max-w-[160px]">
                      <span className="block truncate" title={it.note ?? ''}>
                        {it.note || '-'}
                      </span>
                    </td>
                    <td className="p-2 sm:p-3 space-y-1">
                      <ItemStatusBadge status={it.status} />
                      {it.status === 'rejected' && it.note_reject && (
                        <p
                          className="text-[10px] text-red-500 max-w-[140px] truncate"
                          title={it.note_reject}
                        >
                          {it.note_reject}
                        </p>
                      )}
                      {it.status === 'approved' && it.note_approve && (
                        <p
                          className="text-[10px] text-green-600 max-w-[140px] truncate"
                          title={it.note_approve}
                        >
                          {it.note_approve}
                        </p>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Action bar: only shown while the ticket is still actionable
          (i.e. not approved/rejected directly, and not moved to "history"). */}
      {ticket && !finalized && (
        <div className="m-4 flex items-center justify-between gap-3 flex-wrap bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
          <p className="text-xs text-gray-600">
            {!allItemsResolved
              ? 'Selesaikan review seluruh item sebelum menyetujui/menolak tiket.'
              : rejectedCount > 0
              ? 'Terdapat item yang ditolak, tiket ini hanya dapat ditolak.'
              : 'Semua item disetujui. Anda dapat menyetujui tiket ini.'}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setConfirmTicketAction('reject')}
              disabled={!canRejectTicket}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-sm transition-colors"
            >
              Tolak Tiket
            </button>
            <button
              onClick={() => setConfirmTicketAction('approve')}
              disabled={!canApproveTicket}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-sm transition-colors"
            >
              Setujui Tiket
            </button>
          </div>
        </div>
      )}

      {/* Finalized banner: shown for direct approved/rejected tickets, and
          for "history" tickets (using status_tiket for the real outcome). */}
      {ticket && finalized && (
        <div className="m-4 flex items-center gap-2 text-xs bg-gray-50 border border-gray-200 text-gray-600 rounded-lg px-3 py-2">
          Tiket ini telah{' '}
          {displayTicketStatus(ticket) === 'approved' ? 'disetujui' : 'ditolak'}{' '}
          pada {fmtDate(ticket.tgl_approve)}.
        </div>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

const ApprovalOpnameMR: React.FC = () => {
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <main>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden mb-4">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-3 sm:p-4">
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Approval Stock Opname (MR)
          </h2>
        </div>
      </div>

      {selectedTicketId != null ? (
        <ApprovalDetail
          ticketId={selectedTicketId}
          onBack={() => setSelectedTicketId(null)}
          onResolved={() => setRefreshKey((k) => k + 1)}
        />
      ) : (
        <TicketListTable
          refreshKey={refreshKey}
          onOpenTicket={(id) => setSelectedTicketId(id)}
        />
      )}
    </main>
  );
};

export default ApprovalOpnameMR;
