import React, { useEffect, useMemo, useRef, useState } from 'react';
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

// The item can be sourced either from a JO booking or from raw material
// stock. Only the object matching `sumber_gudang` is populated; the other
// is null. `getItemSourceInfo` below is the single place that reads out of
// whichever one is present.
interface GudangRawMaterialBooking {
  id: number;
  id_jo: number;
  id_item: number;
  no_jo: string;
  customer: string;
  produk: string;
  nama_item: string;
  qty: number;
  tipe_barang: string;
  satuan: string;
  rencana_cetak: string | null;
  tgl_masuk: string | null;
  tgl_approve: string | null;
  status: string;
}

interface GudangRawMaterialStock {
  id: number;
  id_item: number;
  kode_item: string;
  nama_item: string;
  qty: number;
  tipe_barang: string;
  satuan: string;
  tgl_masuk: string | null;
}

interface StockOpnameRMItem {
  id: number;
  id_stock_opname_raw_material: number;
  id_gudang_raw_material_booking: number | null;
  id_gudang_raw_material_stock: number | null;
  id_jo: number | null;
  id_item: number;
  id_user_save: number | null;
  id_user_approve: number | null;
  id_user_reject: number | null;
  no_jo: string | null;
  nama_item: string;
  jumlah_qty: number;
  jumlah_qty_real: number | null;
  sumber_gudang: 'booking' | 'stock';
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
  gudang_raw_material_booking?: GudangRawMaterialBooking | null;
  gudang_raw_material_stock?: GudangRawMaterialStock | null;
}

interface StockOpnameRM {
  id: number;
  id_user_create: number;
  id_user_approve: number | null;
  tgl_create: string;
  tgl_approve: string | null;
  tgl_mutasi?: string | null;
  period: string;
  status: string;
  status_tiket: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  stock_opname_raw_material_item?: StockOpnameRMItem[];
}

interface ListResponse {
  data: StockOpnameRM[];
  status: number;
  success: boolean;
  total_page?: number;
}

interface DetailResponse {
  data: StockOpnameRM;
  status: number;
  success: boolean;
}

// List filter on this page. 'requested' is the default "still needs my
// attention" view; 'all' lets MR browse history without leaving the page.
type ListStatus = 'requested' | 'all';

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

// Reads out the fields that live on whichever nested source object
// (booking vs stock) is actually populated for this item, so the rest of
// the component never has to branch on `sumber_gudang` itself.
function getItemSourceInfo(it: StockOpnameRMItem) {
  if (it.sumber_gudang === 'booking' && it.gudang_raw_material_booking) {
    const b = it.gudang_raw_material_booking;
    return {
      customer: b.customer || null,
      produk: b.produk || null,
      tglMasuk: b.tgl_masuk,
      satuan: b.satuan || null,
      kodeItem: null as string | null,
    };
  }
  if (it.sumber_gudang === 'stock' && it.gudang_raw_material_stock) {
    const s = it.gudang_raw_material_stock;
    return {
      customer: null as string | null,
      produk: null as string | null,
      tglMasuk: s.tgl_masuk,
      satuan: s.satuan || null,
      kodeItem: s.kode_item || null,
    };
  }
  return {
    customer: null as string | null,
    produk: null as string | null,
    tglMasuk: null as string | null,
    satuan: null as string | null,
    kodeItem: null as string | null,
  };
}

const SUMBER_META: Record<string, { label: string; cls: string }> = {
  booking: { label: 'Booking JO', cls: 'bg-indigo-100 text-indigo-700' },
  stock: { label: 'Stok Gudang', cls: 'bg-teal-100 text-teal-700' },
};

function SumberBadge({ sumber }: { sumber: string }) {
  const meta = SUMBER_META[sumber] ?? {
    label: sumber || '-',
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

// Ticket status shown in the badge. `status` only ever holds
// draft / requested / history — once a ticket is finalized the real
// outcome (approved/rejected) lives in `status_tiket`, so callers should
// pass displayTicketStatus(ticket) rather than ticket.status directly.
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

// Resolves the status value that should actually be displayed to the
// user: when the ticket is finalized ("history"), the real outcome is in
// status_tiket rather than status.
function displayTicketStatus(ticket: StockOpnameRM): string {
  return ticket.status === 'history' ? ticket.status_tiket : ticket.status;
}

// A ticket is "finalized" (no more actions possible) once it has been
// moved into "history" — the real outcome then lives in status_tiket.
function isTicketFinalized(ticket: StockOpnameRM | null): boolean {
  if (!ticket) return false;
  return ticket.status === 'history';
}

// Item-status filter options for the detail table dropdown.
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

// ─── Sorting & Searching (item table) ──────────────────────────────────────────

type SortDirection = 'asc' | 'desc';

type ItemSortKey =
  | 'sumber_gudang'
  | 'no_jo'
  | 'nama_item'
  | 'customer'
  | 'tgl_masuk'
  | 'jumlah_qty'
  | 'jumlah_qty_real'
  | 'selisih'
  | 'type_opname'
  | 'note'
  | 'status';

interface ItemSortConfig {
  key: ItemSortKey | null;
  direction: SortDirection;
}

// Null-safe, locale-aware comparator. Nulls/empties always sort last,
// regardless of direction (the caller flips the result for desc).
function compareValues(
  a: string | number | null,
  b: string | number | null,
): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), 'id-ID', {
    numeric: true,
    sensitivity: 'base',
  });
}

function getItemSortValue(
  it: StockOpnameRMItem,
  key: ItemSortKey,
): string | number | null {
  switch (key) {
    case 'sumber_gudang':
      return it.sumber_gudang || null;
    case 'no_jo':
      return it.no_jo || getItemSourceInfo(it).kodeItem || null;
    case 'nama_item':
      return it.nama_item || null;
    case 'customer':
      return getItemSourceInfo(it).customer;
    case 'tgl_masuk': {
      const t = getItemSourceInfo(it).tglMasuk;
      if (!t) return null;
      const ts = new Date(t).getTime();
      return isNaN(ts) ? null : ts;
    }
    case 'jumlah_qty':
      return it.jumlah_qty ?? null;
    case 'jumlah_qty_real':
      return it.jumlah_qty_real ?? null;
    case 'selisih':
      return diffQty(it.jumlah_qty_real, it.jumlah_qty);
    case 'type_opname':
      return it.type_opname || null;
    case 'note':
      return it.note || null;
    case 'status':
      return it.status || null;
    default:
      return null;
  }
}

// Search across the fields actually shown in the table, so the query
// behaves the way a user expects ("typing what I can see finds it").
function itemMatchesSearch(it: StockOpnameRMItem, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const src = getItemSourceInfo(it);
  return [
    it.no_jo,
    it.nama_item,
    src.customer,
    src.produk,
    src.kodeItem,
    it.note,
  ]
    .filter((v): v is string => !!v)
    .some((v) => v.toLowerCase().includes(q));
}

function SortableTh({
  label,
  sortKey,
  currentSort,
  onSort,
  align = 'left',
  className = '',
}: {
  label: string;
  sortKey: ItemSortKey;
  currentSort: ItemSortConfig;
  onSort: (key: ItemSortKey) => void;
  align?: 'left' | 'right';
  className?: string;
}) {
  const active = currentSort.key === sortKey;
  return (
    <th
      onClick={() => onSort(sortKey)}
      className={`p-2 sm:p-3 text-xs font-semibold text-gray-600 whitespace-nowrap cursor-pointer select-none hover:text-emerald-600 transition-colors ${
        align === 'right' ? 'text-right' : 'text-left'
      } ${className}`}
    >
      <span
        className={`inline-flex items-center gap-1 ${
          align === 'right' ? 'flex-row-reverse' : ''
        }`}
      >
        {label}
        <span className="text-[9px] leading-none">
          {active ? (currentSort.direction === 'asc' ? '▲' : '▼') : '⇅'}
        </span>
      </span>
    </th>
  );
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
  canConfirm = true,
  children,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  confirmColor: 'green' | 'red';
  onConfirm: () => void;
  onClose: () => void;
  loading: boolean;
  // Extra gate on top of `loading` — lets callers (e.g. the approve flow,
  // which needs tgl_mutasi filled in first) block submission without
  // duplicating the modal.
  canConfirm?: boolean;
  // Optional extra form content rendered between the message and the
  // action buttons (e.g. the tgl_mutasi input for the approve action).
  children?: React.ReactNode;
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
        {children && <div className="mt-3">{children}</div>}
        <div className="flex gap-3 justify-end mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg text-sm transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={loading || !canConfirm}
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
  const [tickets, setTickets] = useState<StockOpnameRM[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [listStatus, setListStatus] = useState<ListStatus>('requested');
  const [periodFrom, setPeriodFrom] = useState('');
  const [periodTo, setPeriodTo] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const statusFilter = listStatus === 'all' ? '' : listStatus;

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line
  }, [page, limit, statusFilter, refreshKey]);

  function fetchList() {
    (async () => {
      try {
        setIsLoading(true);
        const res: AxiosResponse<ListResponse> = await axios.get(
          `${import.meta.env.VITE_API_LINK}/rm/stockOpname`,
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
          Daftar Tiket Stock Opname RM
        </h3>
      </div>

      <div className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-end gap-3 border-b border-gray-100 flex-wrap">
        <div>
          <label className="text-[10px] font-semibold text-gray-500">
            Status
          </label>
          <select
            value={listStatus}
            onChange={(e) => {
              setListStatus(e.target.value as ListStatus);
              setPage(1);
            }}
            className="mt-1 block rounded-lg bg-blue-50 border border-blue-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <option value="requested">Menunggu Approval</option>
            <option value="all">Semua (Riwayat)</option>
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
                  colSpan={5}
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
                    {fmtDate(t.period)}
                  </td>
                  <td className="p-2 sm:p-3 text-xs text-gray-600 whitespace-nowrap">
                    {fmtDate(t.tgl_create)}
                  </td>
                  <td className="p-2 sm:p-3">
                    <TicketStatusBadge status={displayTicketStatus(t)} />
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
  const [ticket, setTicket] = useState<StockOpnameRM | null>(null);
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [note, setNote] = useState('');
  const [processing, setProcessing] = useState(false);
  const [confirmTicketAction, setConfirmTicketAction] = useState<
    'approve' | 'reject' | null
  >(null);
  const [ticketActionLoading, setTicketActionLoading] = useState(false);
  // Required only for the approve flow — the date stock actually moved.
  // Reset whenever the confirm modal is opened/closed so a stale value
  // from a previous attempt never silently carries over.
  const [tglMutasi, setTglMutasi] = useState('');
  // Item-status filter for the detail table. Display-only: it must NOT
  // affect resolvableItems/allItemsResolved/approve-reject eligibility,
  // which always need to see the full, unfiltered item list.
  const [itemStatusFilter, setItemStatusFilter] = useState<string>('all');
  // Search box + column sort for the item table below. Also display-only —
  // same rule applies: they never affect resolvableItems/allItemsResolved.
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<ItemSortConfig>({
    key: null,
    direction: 'asc',
  });

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line
  }, [ticketId]);

  async function fetchDetail() {
    try {
      setIsLoading(true);
      const res: AxiosResponse<DetailResponse> = await axios.get(
        `${import.meta.env.VITE_API_LINK}/rm/stockOpname/${ticketId}`,
        { withCredentials: true },
      );
      setTicket(res.data.data);
      setChecked({});
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  const items = ticket?.stock_opname_raw_material_item ?? [];
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

  // Rows filtered by status — display only.
  const visibleItems =
    itemStatusFilter === 'all'
      ? items
      : items.filter((it) => it.status === itemStatusFilter);

  // Search narrows the status-filtered set further.
  const searchedItems = useMemo(
    () => visibleItems.filter((it) => itemMatchesSearch(it, searchQuery)),
    [visibleItems, searchQuery],
  );

  // Sort only reorders what search left behind — the rows actually
  // rendered in the table.
  const sortedItems = useMemo(() => {
    if (!sortConfig.key) return searchedItems;
    const key = sortConfig.key;
    const dir = sortConfig.direction === 'asc' ? 1 : -1;
    return [...searchedItems].sort(
      (a, b) =>
        dir * compareValues(getItemSortValue(a, key), getItemSortValue(b, key)),
    );
  }, [searchedItems, sortConfig]);

  function handleSort(key: ItemSortKey) {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' },
    );
  }

  // Once a ticket is finalized (moved into "history", real outcome living
  // in status_tiket) no more ticket-level actions are allowed.
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
        ? '/rm/stockOpnameItem/approve'
        : '/rm/stockOpnameItem/reject';
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

  function openTicketAction(action: 'approve' | 'reject') {
    setTglMutasi('');
    setConfirmTicketAction(action);
  }

  function closeTicketAction() {
    setConfirmTicketAction(null);
    setTglMutasi('');
  }

  async function handleTicketAction() {
    if (!ticket || !confirmTicketAction) return;
    // Extra guard on top of the disabled button: never let an approve
    // request go out without tgl_mutasi, even if state gets out of sync.
    if (confirmTicketAction === 'approve' && !tglMutasi) return;

    const endpoint =
      confirmTicketAction === 'approve'
        ? `/rm/stockOpname/approve/${ticket.id}`
        : `/rm/stockOpname/reject/${ticket.id}`;
    try {
      setTicketActionLoading(true);
      await axios.put(
        `${import.meta.env.VITE_API_LINK}${endpoint}`,
        confirmTicketAction === 'approve' ? { tgl_mutasi: tglMutasi } : {},
        { withCredentials: true },
      );
      closeTicketAction();
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
          onClose={closeTicketAction}
          loading={ticketActionLoading}
          canConfirm={confirmTicketAction === 'approve' ? !!tglMutasi : true}
        >
          {confirmTicketAction === 'approve' && (
            <div>
              <label className="text-xs font-semibold text-gray-600">
                Tanggal Mutasi <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={tglMutasi}
                onChange={(e) => setTglMutasi(e.target.value)}
                required
                className="mt-1 w-full rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              {!tglMutasi && (
                <p className="text-[10px] text-red-500 mt-1">
                  Tanggal mutasi wajib diisi sebelum menyetujui tiket.
                </p>
              )}
            </div>
          )}
        </ConfirmModal>
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
            {ticket ? `Periode ${fmtDate(ticket.period)}` : 'Memuat...'}
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
          {ticket.tgl_mutasi && (
            <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 font-semibold">
              Tgl Mutasi: {fmtDate(ticket.tgl_mutasi)}
            </span>
          )}
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

      <div className="mx-4 mt-4 flex items-center gap-2 flex-wrap">
        <label className="text-[10px] font-semibold text-gray-500">
          Filter Status
        </label>
        <select
          value={itemStatusFilter}
          onChange={(e) => setItemStatusFilter(e.target.value)}
          className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          <option value="all">Semua Status</option>
          <option value="incoming">Belum Diisi</option>
          <option value="saved">Menunggu Review</option>
          <option value="approved">Disetujui</option>
          <option value="rejected">Ditolak</option>
        </select>
        <div className="relative sm:ml-auto w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari No JO, nama item, customer..."
            className="w-full rounded-lg bg-blue-50 border border-blue-200 pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <svg
            className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
            />
          </svg>
        </div>
      </div>

      <div className="overflow-x-auto mt-4">
        <table className="w-full text-xs sm:text-sm min-w-[1280px]">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 sm:p-3 w-8" />
              <SortableTh
                label="Sumber"
                sortKey="sumber_gudang"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableTh
                label="No JO"
                sortKey="no_jo"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableTh
                label="Nama Item"
                sortKey="nama_item"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableTh
                label="Customer"
                sortKey="customer"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableTh
                label="Tgl Masuk"
                sortKey="tgl_masuk"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableTh
                label="Stok Sistem"
                sortKey="jumlah_qty"
                currentSort={sortConfig}
                onSort={handleSort}
                align="right"
              />
              <SortableTh
                label="Hasil Opname"
                sortKey="jumlah_qty_real"
                currentSort={sortConfig}
                onSort={handleSort}
                align="right"
              />
              <SortableTh
                label="Selisih"
                sortKey="selisih"
                currentSort={sortConfig}
                onSort={handleSort}
                align="right"
              />
              <SortableTh
                label="Tipe"
                sortKey="type_opname"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableTh
                label="Catatan Gudang"
                sortKey="note"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableTh
                label="Status"
                sortKey="status"
                currentSort={sortConfig}
                onSort={handleSort}
              />
            </tr>
          </thead>
          <tbody>
            {sortedItems.length === 0 ? (
              <tr>
                <td
                  colSpan={12}
                  className="p-8 text-center text-gray-500 text-sm"
                >
                  {items.length === 0
                    ? 'Tidak ada data barang pada tiket ini'
                    : visibleItems.length === 0
                    ? 'Tidak ada item dengan status ini'
                    : 'Tidak ditemukan item yang cocok dengan pencarian'}
                </td>
              </tr>
            ) : (
              sortedItems.map((it) => {
                const resolvable = RESOLVABLE_ITEM_STATUSES.includes(it.status);
                const src = getItemSourceInfo(it);
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
                    <td className="p-2 sm:p-3">
                      <SumberBadge sumber={it.sumber_gudang} />
                    </td>
                    <td className="p-2 sm:p-3 text-xs font-bold text-violet-600 whitespace-nowrap">
                      {it.no_jo || src.kodeItem || '-'}
                    </td>
                    <td className="p-2 sm:p-3 text-xs max-w-[180px]">
                      <span className="block truncate" title={it.nama_item}>
                        {it.nama_item || '-'}
                      </span>
                    </td>
                    <td className="p-2 sm:p-3 text-xs text-gray-700">
                      {src.customer || '-'}
                    </td>
                    <td className="p-2 sm:p-3 text-xs whitespace-nowrap">
                      {fmtDate(src.tglMasuk)}
                    </td>
                    <td className="p-2 sm:p-3 text-xs text-right font-bold text-indigo-700">
                      {fmtQty(it.jumlah_qty)}
                      {src.satuan ? ` ${src.satuan}` : ''}
                    </td>
                    <td className="p-2 sm:p-3 text-xs text-right font-bold text-gray-800">
                      {fmtQty(it.jumlah_qty_real)}
                      {src.satuan ? ` ${src.satuan}` : ''}
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
          (i.e. not yet moved into "history"). */}
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
              onClick={() => openTicketAction('reject')}
              disabled={!canRejectTicket}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-sm transition-colors"
            >
              Tolak Tiket
            </button>
            <button
              onClick={() => openTicketAction('approve')}
              disabled={!canApproveTicket}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-sm transition-colors"
            >
              Setujui Tiket
            </button>
          </div>
        </div>
      )}

      {/* Finalized banner: shown once the ticket has moved into "history"
          (using status_tiket for the real outcome). */}
      {ticket && finalized && (
        <div className="m-4 flex items-center gap-2 text-xs bg-gray-50 border border-gray-200 text-gray-600 rounded-lg px-3 py-2">
          Tiket ini telah{' '}
          {displayTicketStatus(ticket) === 'approved' ? 'disetujui' : 'ditolak'}{' '}
          pada {fmtDate(ticket.tgl_approve)}
          {ticket.tgl_mutasi &&
            displayTicketStatus(ticket) === 'approved' &&
            ` (Tgl Mutasi: ${fmtDate(ticket.tgl_mutasi)})`}
          .
        </div>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

const ApprovalOpnameRMMR: React.FC = () => {
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
            Approval Stock Opname Raw Material (MR)
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

export default ApprovalOpnameRMMR;
