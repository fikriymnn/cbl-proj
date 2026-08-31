import axios from 'axios';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Pagination from '@mui/material/Pagination/Pagination';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import { usePermissions } from '../../../constant/usePermissions';

/* =============================================================================
 * GudangRM — raw material warehouse. Two tabs:
 *
 *  - Booking: JO bookings against RM stock, split by status_ticket
 *    (incoming / history) same shape as IncomingRawMaterialQC. Rows are
 *    multi-selectable; "Approve Terpilih" fires the approve endpoint once
 *    per selected id (no bulk endpoint exists), sequentially, and reports
 *    how many succeeded/failed. Also carries its own "Adjust Stock" flow
 *    against /rm/adjustStockGudangBooking (search an item, then post the
 *    before/after qty + note).
 *
 *  - Stock: read-only current RM stock levels. The list only carries the
 *    summary fields; clicking "Detail" fetches the full record from
 *    GET /rm/gudangStock/:id (full master_barang + mutasi trail with the
 *    user who made each mutation) and shows it in a modal. Also carries its
 *    own "Adjust Stock" flow against /rm/adjustStockGudangStock.
 *
 * Both Adjust Stock actions are gated behind the same edit permission for
 * route /gudang-rm/gudang-rm.
 * ========================================================================== */

type TabKey = 'booking' | 'stock';
type StatusTicket = 'incoming' | 'history';
type BookingStatus = 'incoming' | 'approve' | 'reject' | 'history';
type ToastSeverity = 'success' | 'error' | 'info';

// --- Booking types (GET /rm/gudangBooking) ---
interface RawJobOrderRef {
  id: number;
  id_io: number;
  no_jo: string;
  no_io: string;
  no_so: string;
  customer: string;
  produk: string;
  tgl_kirim: string;
  status: string;
}
interface RawMasterBarangRef {
  id: number;
  kode_barang: string;
  nama_barang: string;
  kategori: string;
  sub_kategori: string | null;
}
interface RawUserRef {
  id: number;
  nama: string;
  role: string;
}
interface GudangBookingItem {
  id: number;
  id_jo: number;
  id_item: number;
  id_user_approve: number | null;
  no_jo: string;
  customer: string;
  produk: string;
  nama_item: string;
  qty: number;
  tipe_barang: string | null;
  satuan: string | null;
  rencana_cetak: string;
  tgl_masuk: string;
  tgl_approve: string | null;
  status: BookingStatus;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  job_order?: RawJobOrderRef;
  master_barang?: RawMasterBarangRef;
  user_approve?: RawUserRef | null;
}
interface GudangBookingListResponse {
  status: number;
  success: boolean;
  data: GudangBookingItem[];
  total_page?: number;
}

// --- Stock list types (GET /rm/gudangStock) ---
interface GudangStockItem {
  id: number;
  id_item: number;
  kode_item: string;
  nama_item: string;
  qty: number;
  tipe_barang: string | null;
  satuan: string | null;
  tgl_masuk: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}
interface GudangStockListResponse {
  status: number;
  success: boolean;
  data: GudangStockItem[];
  total_page?: number;
}

// --- Stock detail types (GET /rm/gudangStock/:id) ---
interface MasterBarangFull {
  id: number;
  id_brand: number | null;
  id_purchase_unit: number | null;
  id_inventory_unit: number | null;
  kode_barang: string;
  nama_barang: string;
  kategori: string;
  sub_kategori: string | null;
  gramatur: number | null;
  panjang: number | null;
  lebar: number | null;
  harga: number;
  persentase: number;
  batas_harga: number;
  pajak: number;
  harga_per_satuan: number;
  inventory_convert: number;
  warehouse: string;
  keterangan: string | null;
  is_include_tax: boolean;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}
interface StockMutasiUser {
  id: number;
  id_role: number;
  nama: string;
  email: string;
  bagian: string;
  role: string;
  status: string;
}
interface StockMutasiDetail {
  id: number;
  id_gudang_raw_material_stock: number;
  id_item: number;
  id_user: number;
  id_jo_booking: number | null;
  kode_barang: string;
  nama_barang: string;
  no_jo_booking: string | null;
  jumlah_qty: number;
  type_mutasi: 'masuk' | 'keluar';
  sumber_mutasi: string;
  note: string | null;
  tgl_mutasi: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  user?: StockMutasiUser;
}
interface GudangStockDetail {
  id: number;
  id_item: number;
  kode_item: string;
  nama_item: string;
  qty: number;
  tipe_barang: string | null;
  satuan: string | null;
  tgl_masuk: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  master_barang?: MasterBarangFull;
  gudang_raw_material_stock_mutasi?: StockMutasiDetail[];
}
interface GudangStockDetailResponse {
  status: number;
  success: boolean;
  data: GudangStockDetail;
}

// --- Adjust stock types (GET/POST /rm/adjustStockGudangBooking, /rm/adjustStockGudangStock) ---
type AdjustStockVariant = 'booking' | 'stock';

// Item to adjust — populated from the MAIN table data (GET /rm/gudangBooking
// or GET /rm/gudangStock), never from the adjustStockGudang* endpoints.
interface AdjustStockCandidate {
  id: number;
  qty: number;
  satuan: string | null;
  nama_item: string;
  // booking-variant fields
  no_jo?: string;
  customer?: string;
  produk?: string;
  // stock-variant fields
  kode_item?: string;
  tgl_masuk?: string;
}

// Log entry from GET /rm/adjustStockGudangBooking or
// GET /rm/adjustStockGudangStock — this endpoint is history/log data only,
// it is never used to look up items to adjust.
interface AdjustStockLogItem {
  id: number;
  jumlah_qty_awal: number;
  jumlah_qty_adjust: number;
  note: string | null;
  createdAt: string;
  nama_item?: string | null;
  no_jo?: string | null;
  customer?: string | null;
  kode_item?: string | null;
  satuan?: string | null;
  user?: { id: number; nama: string } | null;
}
interface AdjustStockLogListResponse {
  status: number;
  success: boolean;
  data: AdjustStockLogItem[];
  total_page?: number;
}

const formatQty = (val: number | null | undefined): string =>
  (val ?? 0).toLocaleString('id-ID');

const formatCurrency = (val: number | null | undefined): string =>
  (val ?? 0).toLocaleString('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 2,
  });

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

const bookingStatusBadge = (status: BookingStatus): string => {
  if (status === 'approve' || status === 'history')
    return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
  if (status === 'reject') return 'bg-red-50 text-red-700 ring-red-200';
  return 'bg-amber-50 text-amber-700 ring-amber-200';
};

const bookingStatusLabel = (status: BookingStatus): string => {
  if (status === 'approve') return 'Disetujui';
  if (status === 'reject') return 'Ditolak';
  if (status === 'history') return 'Selesai';
  return 'Menunggu Approve';
};

const typeBadge = (type: 'masuk' | 'keluar'): string =>
  type === 'masuk'
    ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
    : 'bg-orange-50 text-orange-700 ring-orange-200';

// =============================================================================
// Adjust Stock modal — shared shape for both the Booking and Stock variants.
//
// Two modes, switchable via tabs:
//  - "Adjust": pick an item and submit a new qty. The item list always comes
//    from the MAIN table data source (GET /rm/gudangBooking or
//    GET /rm/gudangStock) — the same endpoints the page tables already use —
//    never from the adjustStockGudang* endpoints.
//  - "Riwayat" (History): a read-only log of past adjustments, fetched from
//    GET /rm/adjustStockGudangBooking or GET /rm/adjustStockGudangStock.
//    That endpoint is log/history data only and is never used to look up
//    items to adjust.
//
// POST always goes to the adjustStockGudang* endpoint for the variant.
// =============================================================================
const ADJUST_LIMIT = 8;

type AdjustModalMode = 'adjust' | 'history';

const AdjustStockRMModal: React.FC<{
  variant: AdjustStockVariant;
  /**
   * When provided, the modal skips the search step entirely and opens
   * straight into the adjust form for this item. Its `qty` is taken as-is
   * from the row already loaded in the outer page table (not re-fetched),
   * so "Jumlah Qty Awal" always matches what's currently shown outside the
   * modal.
   */
  initialItem?: AdjustStockCandidate;
  /** Which booking status_ticket to search within (booking variant only). */
  statusTicket?: StatusTicket;
  onClose: () => void;
  onAdjusted: () => void;
  onToast: (message: string, severity: ToastSeverity) => void;
}> = ({
  variant,
  initialItem,
  statusTicket = 'incoming',
  onClose,
  onAdjusted,
  onToast,
}) => {
  // Main data source used to find items to adjust — same endpoints the
  // page tables already fetch from.
  const mainListUrl =
    variant === 'booking'
      ? `${import.meta.env.VITE_API_LINK}/rm/gudangBooking`
      : `${import.meta.env.VITE_API_LINK}/rm/gudangStock`;
  // Log/history + create endpoint for this variant.
  const adjustUrl =
    variant === 'booking'
      ? `${import.meta.env.VITE_API_LINK}/rm/adjustStockGudangBooking`
      : `${import.meta.env.VITE_API_LINK}/rm/adjustStockGudangStock`;
  const idField =
    variant === 'booking'
      ? 'id_gudang_raw_material_booking'
      : 'id_gudang_raw_material_stock';
  const title =
    variant === 'booking' ? 'Adjust Stock Booking RM' : 'Adjust Stock RM';

  const [mode, setMode] = useState<AdjustModalMode>('adjust');

  // ── Adjust mode: search + form ──
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState<AdjustStockCandidate[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [selected, setSelected] = useState<AdjustStockCandidate | null>(
    initialItem ?? null,
  );
  const [qtyAdjust, setQtyAdjust] = useState(
    initialItem ? String(initialItem.qty ?? 0) : '',
  );
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCandidates = async (searchVal: string, pageVal: number) => {
    try {
      setLoading(true);
      const res = await axios.get<
        GudangBookingListResponse | GudangStockListResponse
      >(mainListUrl, {
        params:
          variant === 'booking'
            ? {
                page: pageVal,
                limit: ADJUST_LIMIT,
                search: searchVal || undefined,
                status_ticket: statusTicket,
              }
            : {
                page: pageVal,
                limit: ADJUST_LIMIT,
                search: searchVal || undefined,
              },
        withCredentials: true,
      });
      const rawList = res.data?.data ?? [];
      const mapped: AdjustStockCandidate[] =
        variant === 'booking'
          ? (rawList as GudangBookingItem[]).map((b) => ({
              id: b.id,
              qty: b.qty,
              satuan: b.satuan,
              nama_item: b.nama_item,
              no_jo: b.no_jo,
              customer: b.customer,
              produk: b.produk,
            }))
          : (rawList as GudangStockItem[]).map((s) => ({
              id: s.id,
              qty: s.qty,
              satuan: s.satuan,
              nama_item: s.nama_item,
              kode_item: s.kode_item,
              tgl_masuk: s.tgl_masuk,
            }));
      setCandidates(mapped);
      setTotalPages(res.data?.total_page ?? 1);
    } catch (err) {
      console.error(err);
      setCandidates([]);
      onToast('Gagal memuat data untuk adjust stock.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialItem && mode === 'adjust') {
      fetchCandidates(search, page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  function handleSearchInput(val: string) {
    setSearch(val);
    setPage(1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchCandidates(val, 1), 400);
  }

  function handlePageChange(newPage: number) {
    setPage(newPage);
    fetchCandidates(search, newPage);
  }

  function handleSelect(item: AdjustStockCandidate) {
    setSelected(item);
    setQtyAdjust(String(item.qty ?? 0));
    setNote('');
  }

  function handleBack() {
    if (initialItem) {
      onClose();
      return;
    }
    setSelected(null);
    setQtyAdjust('');
    setNote('');
  }

  async function handleSubmit() {
    if (!selected) return;
    const adjustVal = Number(qtyAdjust);
    if (qtyAdjust === '' || Number.isNaN(adjustVal)) {
      onToast('Jumlah adjust tidak valid.', 'error');
      return;
    }
    try {
      setSubmitting(true);
      await axios.post(
        adjustUrl,
        {
          [idField]: selected.id,
          jumlah_qty_awal: selected.qty ?? 0,
          jumlah_qty_adjust: adjustVal,
          note: note || undefined,
        },
        { withCredentials: true },
      );
      onToast('Stok berhasil disesuaikan.', 'success');
      onAdjusted();
      onClose();
    } catch (err) {
      console.error(err);
      onToast('Gagal menyesuaikan stok.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  // ── History mode: read-only log ──
  const [logSearch, setLogSearch] = useState('');
  const [logPage, setLogPage] = useState(1);
  const [logTotalPages, setLogTotalPages] = useState(1);
  const [logLoading, setLogLoading] = useState(false);
  const [logs, setLogs] = useState<AdjustStockLogItem[]>([]);
  const logDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchLogs = async (searchVal: string, pageVal: number) => {
    try {
      setLogLoading(true);
      const res = await axios.get<AdjustStockLogListResponse>(adjustUrl, {
        params: {
          page: pageVal,
          limit: ADJUST_LIMIT,
          search: searchVal || undefined,
        },
        withCredentials: true,
      });
      setLogs(res.data?.data ?? []);
      setLogTotalPages(res.data?.total_page ?? 1);
    } catch (err) {
      console.error(err);
      setLogs([]);
      onToast('Gagal memuat riwayat adjust stock.', 'error');
    } finally {
      setLogLoading(false);
    }
  };

  useEffect(() => {
    if (mode === 'history' && logs.length === 0 && !logLoading) {
      fetchLogs(logSearch, logPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  function handleLogSearchInput(val: string) {
    setLogSearch(val);
    setLogPage(1);
    if (logDebounceRef.current) clearTimeout(logDebounceRef.current);
    logDebounceRef.current = setTimeout(() => fetchLogs(val, 1), 400);
  }

  function handleLogPageChange(newPage: number) {
    setLogPage(newPage);
    fetchLogs(logSearch, newPage);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-4 text-white flex justify-between items-start flex-shrink-0">
          <div>
            <h3 className="text-base font-bold">{title}</h3>
            <p className="text-emerald-100 text-xs mt-0.5">
              {mode === 'history'
                ? 'Riwayat penyesuaian stok'
                : selected
                ? 'Masukkan jumlah penyesuaian'
                : 'Cari item yang akan disesuaikan'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-emerald-100 text-2xl font-bold leading-none"
          >
            ×
          </button>
        </div>

        {/* Mode tabs */}
        <div className="px-5 pt-3 flex-shrink-0">
          <div className="bg-gray-100 rounded-xl p-1 inline-flex gap-1">
            <button
              onClick={() => setMode('adjust')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                mode === 'adjust'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Adjust
            </button>
            <button
              onClick={() => setMode('history')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                mode === 'history'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Riwayat
            </button>
          </div>
        </div>

        {mode === 'history' ? (
          // ── History: log list from adjustStockGudang* GET ──
          <div className="flex flex-col p-4 gap-3 min-h-0 flex-1 overflow-hidden">
            <div className="relative flex-shrink-0">
              <input
                type="text"
                value={logSearch}
                onChange={(e) => handleLogSearchInput(e.target.value)}
                placeholder="Cari riwayat..."
                className="w-full pl-8 pr-3 py-2 text-xs border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-emerald-50"
              />
              <svg
                className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <div className="rounded-xl border border-gray-200 overflow-hidden flex flex-col flex-1 min-h-0">
              {logLoading ? (
                <div className="divide-y divide-gray-100">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="px-3 py-2.5 animate-pulse space-y-1.5"
                    >
                      <div className="h-3.5 w-32 bg-gray-200 rounded" />
                      <div className="h-3 w-24 bg-gray-100 rounded" />
                    </div>
                  ))}
                </div>
              ) : logs.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400 flex-1 flex items-center justify-center">
                  {logSearch
                    ? 'Tidak ada riwayat untuk pencarian ini'
                    : 'Belum ada riwayat adjust stock'}
                </div>
              ) : (
                <div className="divide-y divide-gray-100 overflow-y-auto flex-1">
                  {logs.map((l) => {
                    const diff =
                      (l.jumlah_qty_adjust ?? 0) - (l.jumlah_qty_awal ?? 0);
                    return (
                      <div key={l.id} className="px-3 py-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap min-w-0">
                            {l.no_jo && (
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">
                                {l.no_jo}
                              </span>
                            )}
                            {l.kode_item && (
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">
                                {l.kode_item}
                              </span>
                            )}
                            <span className="text-xs font-medium text-gray-800 truncate">
                              {l.nama_item || '-'}
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-400 whitespace-nowrap">
                            {formatDateTime(l.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs">
                          <span className="text-gray-500">
                            {formatQty(l.jumlah_qty_awal)} {l.satuan || ''}
                          </span>
                          <span className="text-gray-300">→</span>
                          <span className="font-semibold text-gray-800">
                            {formatQty(l.jumlah_qty_adjust)} {l.satuan || ''}
                          </span>
                          <span
                            className={`font-semibold ${
                              diff > 0
                                ? 'text-emerald-600'
                                : diff < 0
                                ? 'text-red-500'
                                : 'text-gray-400'
                            }`}
                          >
                            ({diff > 0 ? '+' : ''}
                            {formatQty(diff)})
                          </span>
                        </div>
                        {l.note && (
                          <p className="text-[10px] text-gray-400 mt-1 truncate">
                            {l.note}
                          </p>
                        )}
                        {l.user?.nama && (
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            Oleh: {l.user.nama}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {!logLoading && (logs.length > 0 || logTotalPages > 1) && (
                <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-t border-gray-100 flex-shrink-0">
                  <span className="text-[10px] text-gray-400">
                    Hal {logPage}/{logTotalPages}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      disabled={logPage <= 1 || logLoading}
                      onClick={() => handleLogPageChange(logPage - 1)}
                      className="px-2 py-1 text-[10px] rounded text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      Prev
                    </button>
                    <button
                      disabled={logPage >= logTotalPages || logLoading}
                      onClick={() => handleLogPageChange(logPage + 1)}
                      className="px-2 py-1 text-[10px] rounded text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : !selected ? (
          // ── Adjust, step 1: search & pick (from the main table GET api) ──
          <div className="flex flex-col p-4 gap-3 min-h-0 flex-1 overflow-hidden">
            <div className="relative flex-shrink-0">
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearchInput(e.target.value)}
                placeholder={
                  variant === 'booking'
                    ? 'Cari No JO, customer, produk, item...'
                    : 'Cari kode item, nama item...'
                }
                className="w-full pl-8 pr-3 py-2 text-xs border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-emerald-50"
              />
              <svg
                className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <div className="rounded-xl border border-gray-200 overflow-hidden flex flex-col flex-1 min-h-0">
              {loading ? (
                <div className="divide-y divide-gray-100">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="px-3 py-2.5 animate-pulse space-y-1.5"
                    >
                      <div className="h-3.5 w-32 bg-gray-200 rounded" />
                      <div className="h-3 w-24 bg-gray-100 rounded" />
                    </div>
                  ))}
                </div>
              ) : candidates.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400 flex-1 flex items-center justify-center">
                  {search
                    ? 'Tidak ada hasil untuk pencarian ini'
                    : 'Tidak ada data tersedia'}
                </div>
              ) : (
                <div className="divide-y divide-gray-100 overflow-y-auto flex-1">
                  {candidates.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => handleSelect(c)}
                      className="flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-emerald-50 cursor-pointer transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        {variant === 'booking' ? (
                          <>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">
                                {c.no_jo}
                              </span>
                              <span className="text-[10px] text-gray-400 truncate">
                                {c.customer}
                              </span>
                            </div>
                            <p className="text-xs font-medium text-gray-800 mt-0.5 truncate">
                              {c.nama_item}
                            </p>
                            <p className="text-[10px] text-gray-400 truncate">
                              {c.produk}
                            </p>
                          </>
                        ) : (
                          <>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">
                              {c.kode_item}
                            </span>
                            <p className="text-xs font-medium text-gray-800 mt-0.5 truncate">
                              {c.nama_item}
                            </p>
                          </>
                        )}
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-xs font-bold text-emerald-700">
                          {formatQty(c.qty)} {c.satuan || ''}
                        </p>
                        <p className="text-[10px] text-gray-400">stok</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && (candidates.length > 0 || totalPages > 1) && (
                <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-t border-gray-100 flex-shrink-0">
                  <span className="text-[10px] text-gray-400">
                    Hal {page}/{totalPages}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      disabled={page <= 1 || loading}
                      onClick={() => handlePageChange(page - 1)}
                      className="px-2 py-1 text-[10px] rounded text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      Prev
                    </button>
                    <button
                      disabled={page >= totalPages || loading}
                      onClick={() => handlePageChange(page + 1)}
                      className="px-2 py-1 text-[10px] rounded text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // ── Adjust, step 2: form ──
          <div className="p-5 space-y-4 overflow-y-auto flex-1">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              {variant === 'booking' ? (
                <>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold text-emerald-600 bg-white px-1.5 py-0.5 rounded">
                      {selected.no_jo}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {selected.customer}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 mt-1">
                    {selected.nama_item}
                  </p>
                  <p className="text-xs text-gray-500">{selected.produk}</p>
                </>
              ) : (
                <>
                  <span className="text-[10px] font-bold text-emerald-600 bg-white px-1.5 py-0.5 rounded">
                    {selected.kode_item}
                  </span>
                  <p className="text-sm font-semibold text-gray-800 mt-1">
                    {selected.nama_item}
                  </p>
                </>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Stok saat ini:{' '}
                <span className="font-bold text-emerald-700">
                  {formatQty(selected.qty)} {selected.satuan || ''}
                </span>
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">
                Jumlah Qty Awal
              </label>
              <input
                type="number"
                value={selected.qty ?? 0}
                disabled
                className="w-full rounded-lg bg-gray-100 border border-gray-200 px-3 py-2 text-sm text-gray-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">
                Jumlah Qty Adjust
              </label>
              <input
                type="number"
                value={qtyAdjust}
                onChange={(e) => setQtyAdjust(e.target.value)}
                className="w-full rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">
                Catatan
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Alasan penyesuaian stok..."
                className="w-full rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 pb-5 pt-3 border-t border-gray-100 flex gap-3 justify-end flex-shrink-0">
          {mode === 'history' ? (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg text-sm transition-colors"
            >
              Tutup
            </button>
          ) : selected ? (
            <>
              <button
                onClick={handleBack}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg text-sm transition-colors"
              >
                {initialItem ? 'Batal' : 'Kembali'}
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || qtyAdjust === ''}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-sm transition-colors"
              >
                {submitting ? 'Menyimpan...' : 'Simpan Adjust'}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg text-sm transition-colors"
            >
              Batal
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// Booking tab
// =============================================================================
const BookingTab: React.FC<{
  canEdit: boolean;
  onToast: (message: string, severity: ToastSeverity) => void;
}> = ({ canEdit, onToast }) => {
  const [statusTicket, setStatusTicket] = useState<StatusTicket>('incoming');
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<GudangBookingItem[]>([]);

  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [approving, setApproving] = useState<boolean>(false);

  const [showAdjustSearch, setShowAdjustSearch] = useState<boolean>(false);
  const [adjustRow, setAdjustRow] = useState<GudangBookingItem | null>(null);

  const totalCols =
    7 + (statusTicket === 'incoming' ? 1 : 0) + (canEdit ? 1 : 0);

  const fetchData = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/rm/gudangBooking`;
    try {
      setLoading(true);
      const res = await axios.get<GudangBookingListResponse>(url, {
        params: { page, limit, status_ticket: statusTicket },
        withCredentials: true,
      });
      setData(res.data.data || []);
      if (res.data.total_page) setTotalPages(res.data.total_page);
      setSelected(new Set());
    } catch (error) {
      console.error('Error fetching gudang booking data:', error);
      setData([]);
      onToast('Gagal memuat data booking gudang RM.', 'error');
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

  const selectableRows = useMemo(
    () => data.filter((d) => d.status === 'incoming'),
    [data],
  );

  const toggleSelected = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === selectableRows.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(selectableRows.map((d) => d.id)));
    }
  };

  const handleBulkApprove = async () => {
    if (selected.size === 0) return;
    setApproving(true);
    let successCount = 0;
    let failCount = 0;
    // No bulk endpoint — approve one id at a time, sequentially.
    for (const id of Array.from(selected)) {
      try {
        const url = `${
          import.meta.env.VITE_API_LINK
        }/rm/gudangBooking/approve/${id}`;
        await axios.put(url, undefined, { withCredentials: true });
        successCount += 1;
      } catch (err) {
        console.error(`Error approving gudang booking ${id}:`, err);
        failCount += 1;
      }
    }
    setApproving(false);
    if (failCount === 0) {
      onToast(`${successCount} booking berhasil disetujui.`, 'success');
    } else {
      onToast(
        `${successCount} berhasil, ${failCount} gagal disetujui.`,
        failCount === selected.size ? 'error' : 'info',
      );
    }
    fetchData();
  };

  return (
    <div className="space-y-4">
      {(showAdjustSearch || adjustRow) && (
        <AdjustStockRMModal
          variant="booking"
          statusTicket={statusTicket}
          initialItem={
            adjustRow
              ? {
                  id: adjustRow.id,
                  qty: adjustRow.qty,
                  satuan: adjustRow.satuan,
                  nama_item: adjustRow.nama_item,
                  no_jo: adjustRow.no_jo,
                  customer: adjustRow.customer,
                  produk: adjustRow.produk,
                }
              : undefined
          }
          onClose={() => {
            setShowAdjustSearch(false);
            setAdjustRow(null);
          }}
          onAdjusted={fetchData}
          onToast={onToast}
        />
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2 inline-flex gap-1">
          {(
            [
              { key: 'incoming', label: 'Menunggu Approve' },
              { key: 'history', label: 'Riwayat' },
            ] as { key: StatusTicket; label: string }[]
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                statusTicket === tab.key
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {canEdit && (
            <button
              onClick={() => setShowAdjustSearch(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg shadow transition-colors"
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
                  d="M9 3v2m6-2v2M4 7h16M4 7v13a1 1 0 001 1h14a1 1 0 001-1V7M4 7l1-3h14l1 3M9 11h6"
                />
              </svg>
              Adjust Stock
            </button>
          )}
          {statusTicket === 'incoming' && (
            <button
              onClick={handleBulkApprove}
              disabled={selected.size === 0 || approving}
              className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {approving
                ? 'Memproses...'
                : `Approve Terpilih (${selected.size})`}
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {statusTicket === 'incoming' && (
                  <th className="px-3 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={
                        selectableRows.length > 0 &&
                        selected.size === selectableRows.length
                      }
                      onChange={toggleSelectAll}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                  </th>
                )}
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  No JO
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Customer / Produk
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Nama Item
                </th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Qty
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Rencana Cetak
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Tgl Masuk
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Status
                </th>
                {canEdit && (
                  <th className="px-3 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Aksi
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={totalCols} className="px-4 py-14 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-7 w-7 border-2 border-emerald-500 border-t-transparent"></div>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={totalCols} className="px-4 py-14 text-center">
                    <p className="text-slate-600 font-medium text-sm">
                      Tidak ada data booking gudang RM.
                    </p>
                  </td>
                </tr>
              ) : (
                data.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    {statusTicket === 'incoming' && (
                      <td className="px-3 py-3">
                        <input
                          type="checkbox"
                          disabled={b.status !== 'incoming'}
                          checked={selected.has(b.id)}
                          onChange={() => toggleSelected(b.id)}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 disabled:opacity-40"
                        />
                      </td>
                    )}
                    <td className="px-3 py-3 font-medium text-emerald-700">
                      {b.no_jo}
                    </td>
                    <td className="px-3 py-3">
                      <div className="text-slate-700">{b.customer}</div>
                      <div className="text-xs text-slate-400 max-w-[220px] truncate">
                        {b.produk}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-slate-700">
                      {b.nama_item}
                      {b.tipe_barang && (
                        <div className="text-xs text-slate-400">
                          {b.tipe_barang}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums font-medium">
                      {formatQty(b.qty)} {b.satuan || ''}
                    </td>
                    <td className="px-3 py-3 text-slate-600 whitespace-nowrap">
                      {formatDate(b.rencana_cetak)}
                    </td>
                    <td className="px-3 py-3 text-slate-600 whitespace-nowrap">
                      {formatDateTime(b.tgl_masuk)}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full ring-1 font-medium ${bookingStatusBadge(
                          b.status,
                        )}`}
                      >
                        {bookingStatusLabel(b.status)}
                      </span>
                    </td>
                    {canEdit && (
                      <td className="px-3 py-3">
                        <div className="flex justify-end">
                          <button
                            onClick={() => setAdjustRow(b)}
                            className="text-xs font-medium text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Adjust
                          </button>
                        </div>
                      </td>
                    )}
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
                    ? 'bg-emerald-600 text-white'
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
    </div>
  );
};

// =============================================================================
// Stock detail modal — fetches the full record by id (GET /rm/gudangStock/:id)
// =============================================================================
const StockDetailModal: React.FC<{
  id: number;
  onClose: () => void;
}> = ({ id, onClose }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string>('');
  const [detail, setDetail] = useState<GudangStockDetail | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      const url = `${import.meta.env.VITE_API_LINK}/rm/gudangStock/${id}`;
      try {
        setLoading(true);
        setLoadError('');
        const res = await axios.get<GudangStockDetailResponse>(url, {
          withCredentials: true,
        });
        setDetail(res.data.data || null);
      } catch (err) {
        console.error('Error fetching gudang stock detail:', err);
        setLoadError('Gagal memuat detail stok.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const mutasi = detail?.gudang_raw_material_stock_mutasi || [];
  const master = detail?.master_barang;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Detail Stok RM
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {detail ? `${detail.kode_item} · ${detail.nama_item}` : '...'}
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

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent" />
          </div>
        ) : loadError ? (
          <div className="px-6 py-14 text-center">
            <p className="text-red-600 text-sm font-medium">{loadError}</p>
          </div>
        ) : !detail ? (
          <div className="px-6 py-14 text-center">
            <p className="text-slate-500 text-sm">Data stok tidak ditemukan.</p>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl py-3">
                <p className="text-[11px] text-emerald-600">Qty Saat Ini</p>
                <p className="text-lg font-semibold text-emerald-800">
                  {formatQty(detail.qty)} {detail.satuan || ''}
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl py-3">
                <p className="text-[11px] text-slate-400">Tipe Barang</p>
                <p className="text-sm font-medium text-slate-700 mt-1">
                  {detail.tipe_barang || '-'}
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl py-3">
                <p className="text-[11px] text-slate-400">Tgl Masuk Terakhir</p>
                <p className="text-sm font-medium text-slate-700 mt-1">
                  {formatDateTime(detail.tgl_masuk)}
                </p>
              </div>
            </div>

            {master && (
              <div className="border border-slate-200 rounded-xl p-4 grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                <div>
                  <p className="text-[11px] text-slate-400">Kategori</p>
                  <p className="text-slate-700">
                    {master.kategori}
                    {master.sub_kategori ? ` · ${master.sub_kategori}` : ''}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400">Gudang</p>
                  <p className="text-slate-700">{master.warehouse || '-'}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400">Harga</p>
                  <p className="text-slate-700">
                    {formatCurrency(master.harga)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400">Harga per Satuan</p>
                  <p className="text-slate-700">
                    {formatCurrency(master.harga_per_satuan)}
                  </p>
                </div>
                {master.keterangan && (
                  <div className="col-span-2">
                    <p className="text-[11px] text-slate-400">Keterangan</p>
                    <p className="text-slate-700">{master.keterangan}</p>
                  </div>
                )}
              </div>
            )}

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                        Tanggal
                      </th>
                      <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                        Tipe
                      </th>
                      <th className="px-3 py-2.5 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                        Qty
                      </th>
                      <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                        Sumber
                      </th>
                      <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                        Oleh
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {mutasi.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-8 text-center text-slate-400 text-sm"
                        >
                          Belum ada mutasi.
                        </td>
                      </tr>
                    ) : (
                      mutasi.map((m) => (
                        <tr key={m.id}>
                          <td className="px-3 py-2.5 whitespace-nowrap text-slate-600">
                            {formatDateTime(m.tgl_mutasi)}
                          </td>
                          <td className="px-3 py-2.5">
                            <span
                              className={`text-[11px] px-2 py-0.5 rounded-full ring-1 font-medium ${typeBadge(
                                m.type_mutasi,
                              )}`}
                            >
                              {m.type_mutasi === 'masuk' ? 'Masuk' : 'Keluar'}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-right tabular-nums font-medium text-slate-800">
                            {formatQty(m.jumlah_qty)}
                          </td>
                          <td className="px-3 py-2.5 text-slate-500 capitalize">
                            {m.sumber_mutasi}
                            {m.no_jo_booking ? ` · ${m.no_jo_booking}` : ''}
                            {m.note ? ` · ${m.note}` : ''}
                          </td>
                          <td className="px-3 py-2.5 text-slate-600">
                            {m.user?.nama || '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// Stock tab
// =============================================================================
const StockTab: React.FC<{
  canEdit: boolean;
  onToast: (message: string, severity: ToastSeverity) => void;
}> = ({ canEdit, onToast }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<GudangStockItem[]>([]);

  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  const [detailId, setDetailId] = useState<number | null>(null);
  const [showAdjustSearch, setShowAdjustSearch] = useState<boolean>(false);
  const [adjustRow, setAdjustRow] = useState<GudangStockItem | null>(null);

  const fetchData = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/rm/gudangStock`;
    try {
      setLoading(true);
      const res = await axios.get<GudangStockListResponse>(url, {
        params: { page, limit },
        withCredentials: true,
      });
      setData(res.data.data || []);
      if (res.data.total_page) setTotalPages(res.data.total_page);
    } catch (error) {
      console.error('Error fetching gudang stock data:', error);
      setData([]);
      onToast('Gagal memuat data stok gudang RM.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {(showAdjustSearch || adjustRow) && (
        <AdjustStockRMModal
          variant="stock"
          initialItem={
            adjustRow
              ? {
                  id: adjustRow.id,
                  qty: adjustRow.qty,
                  satuan: adjustRow.satuan,
                  nama_item: adjustRow.nama_item,
                  kode_item: adjustRow.kode_item,
                  tgl_masuk: adjustRow.tgl_masuk,
                }
              : undefined
          }
          onClose={() => {
            setShowAdjustSearch(false);
            setAdjustRow(null);
          }}
          onAdjusted={fetchData}
          onToast={onToast}
        />
      )}

      {canEdit && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowAdjustSearch(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg shadow transition-colors"
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
                d="M9 3v2m6-2v2M4 7h16M4 7v13a1 1 0 001 1h14a1 1 0 001-1V7M4 7l1-3h14l1 3M9 11h6"
              />
            </svg>
            Adjust Stock
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Kode Item
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Nama Item
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Tipe Barang
                </th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Qty
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Tgl Masuk Terakhir
                </th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-14 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-7 w-7 border-2 border-emerald-500 border-t-transparent"></div>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-14 text-center">
                    <p className="text-slate-600 font-medium text-sm">
                      Belum ada stok gudang RM.
                    </p>
                  </td>
                </tr>
              ) : (
                data.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="px-3 py-3 font-medium text-slate-700">
                      {s.kode_item}
                    </td>
                    <td className="px-3 py-3 text-slate-700">{s.nama_item}</td>
                    <td className="px-3 py-3 text-slate-500">
                      {s.tipe_barang || '-'}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums font-medium text-slate-800">
                      {formatQty(s.qty)} {s.satuan || ''}
                    </td>
                    <td className="px-3 py-3 text-slate-600 whitespace-nowrap">
                      {formatDateTime(s.tgl_masuk)}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex justify-end gap-2">
                        {canEdit && (
                          <button
                            onClick={() => setAdjustRow(s)}
                            className="text-xs font-medium text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Adjust
                          </button>
                        )}
                        <button
                          onClick={() => setDetailId(s.id)}
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
                    ? 'bg-emerald-600 text-white'
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

      {detailId !== null && (
        <StockDetailModal id={detailId} onClose={() => setDetailId(null)} />
      )}
    </div>
  );
};

// =============================================================================
// Main page
// =============================================================================
const GudangRM: React.FC = () => {
  const [tab, setTab] = useState<TabKey>('booking');

  // ── Permissions ──
  const role = localStorage.getItem('userRole') ?? '';
  const bagian = localStorage.getItem('userBagian') ?? '';
  const { checkEdit } = usePermissions(role, bagian);
  const canEdit = checkEdit('/gudang-rm/gudang-rm');

  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: ToastSeverity;
  }>({ open: false, message: '', severity: 'success' });

  const showToast = (message: string, severity: ToastSeverity) =>
    setToast({ open: true, message, severity });

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2 inline-flex gap-1">
        {(
          [
            { key: 'booking', label: 'Booking' },
            { key: 'stock', label: 'Stock' },
          ] as { key: TabKey; label: string }[]
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-2 text-sm font-medium rounded-xl transition-colors ${
              tab === t.key
                ? 'bg-emerald-600 text-white'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'booking' ? (
        <BookingTab canEdit={canEdit} onToast={showToast} />
      ) : (
        <StockTab canEdit={canEdit} onToast={showToast} />
      )}

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

export default GudangRM;
