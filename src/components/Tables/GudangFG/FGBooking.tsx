import React, { useEffect, useRef, useState, useCallback } from 'react';
import axios, { AxiosResponse } from 'axios';

// ─── Constants ────────────────────────────────────────────────────────────────

const API = import.meta.env.VITE_API_LINK;
const PAGE_SIZES = [10, 25, 50];

// ─── Types ────────────────────────────────────────────────────────────────────

interface DataBarang {
  id: number;
  id_jo: number;
  id_jo_booking: number | null;
  id_io: number;
  id_so: number;
  id_customer: number;
  id_produk: number;
  no_io: string;
  no_jo: string;
  no_so: string;
  no_po_customer: string;
  produk: string;
  customer: string;
  jumlah_qty: number;
  jumlah_qty_keluar: number;
  jumlah_qty_sisa: number;
  po_qty: number;
  status: string | null; // e.g. "booking" | null
  tgl_masuk: string;
  toleransi_pengiriman: string;
  note: string | null;
  is_active: number;
  createdAt: string;
  updatedAt: string;
}

interface GudangGroup {
  id_io: number;
  no_io: string;
  id_customer: number;
  customer: string;
  id_produk: number;
  produk: string;
  jumlah_qty: number;
  jumlah_qty_keluar: number;
  jumlah_qty_sisa: number;
  data_barang: DataBarang[];
}

interface GudangResponse {
  data: GudangGroup[];
  status: number;
  success: boolean;
  total_page?: number;
}

interface JoNormal {
  id: number;
  id_io: number;
  id_so: number;
  id_customer: number;
  id_produk: number;
  no_io: string;
  no_jo: string;
  no_so: string;
  produk: string;
  customer: string;
  qty: number;
  qty_druk: number;
  qty_lp: number;
  po_qty: number;
  stok_fg: number;
  tipe_jo: string;
  status: string;
  status_jo: string;
  status_proses: string;
  is_booking_done: boolean;
  is_done_fg: boolean;
  tgl_kirim: string;
  tgl_pembuatan_jo: string;
  keterangan_pengerjaan: string | null;
  label: string;
  toleransi: string;
  spesifikasi: string;
}

interface JoResponse {
  data: JoNormal[];
  status: number;
  success: boolean;
  total_page?: number;
}

interface BookingItem {
  id: number;
  qty: string;
  data: DataBarang;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(val: number | null | undefined) {
  if (val == null) return '-';
  return val.toLocaleString('id-ID');
}

function fmtDate(iso: string | null | undefined) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function useDebounce(fn: (...args: any[]) => void, delay = 400) {
  const ref = useRef<ReturnType<typeof setTimeout> | null>(null);
  return useCallback(
    (...args: any[]) => {
      if (ref.current) clearTimeout(ref.current);
      ref.current = setTimeout(() => fn(...args), delay);
    },
    [fn, delay],
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-slate-100 animate-pulse">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-4 py-3">
              <div className="h-3 rounded bg-slate-200 w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ─── Mini Pagination ──────────────────────────────────────────────────────────

function MiniPagination({
  page,
  total,
  onChange,
  loading,
}: {
  page: number;
  total: number;
  onChange: (p: number) => void;
  loading?: boolean;
}) {
  const pages = Array.from({ length: total }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === total || Math.abs(p - page) <= 1)
    .reduce<(number | '...')[]>((acc, p, idx, arr) => {
      if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1)
        acc.push('...');
      acc.push(p);
      return acc;
    }, []);

  return (
    <div className="flex items-center gap-1">
      <button
        disabled={page <= 1 || loading}
        onClick={() => onChange(page - 1)}
        className="w-7 h-7 flex items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
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
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      {pages.map((p, idx) =>
        p === '...' ? (
          <span key={`e-${idx}`} className="text-xs text-slate-400 px-1">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            className={`w-7 h-7 flex items-center justify-center rounded-md text-xs font-semibold transition-colors ${
              page === p
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {p}
          </button>
        ),
      )}
      <button
        disabled={page >= total || loading}
        onClick={() => onChange(page + 1)}
        className="w-7 h-7 flex items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
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
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({
  message,
  type,
  onDismiss,
}: {
  message: string;
  type: 'success' | 'error';
  onDismiss: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${
        type === 'success' ? 'bg-emerald-600' : 'bg-red-500'
      }`}
    >
      {type === 'success' ? (
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
            d="M5 13l4 4L19 7"
          />
        </svg>
      ) : (
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
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      )}
      {message}
      <button onClick={onDismiss} className="ml-2 opacity-70 hover:opacity-100">
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
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}

// ─── FG Item Picker (right panel) ────────────────────────────────────────────

function FgItemPicker({
  joId,
  joType,
  joLabel,
  onBook,
  booking,
}: {
  joId: number;
  joType: JoType;
  joLabel: string;
  onBook: (items: { id: number; jumlah_qty: number }[]) => Promise<void>;
  booking: boolean;
}) {
  const [fgData, setFgData] = useState<DataBarang[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<BookingItem[]>([]);
  const [summaryOpen, setSummaryOpen] = useState(true);

  const endpoint =
    joType === 'normal'
      ? `/fg/getJoNormalBookingFG/${joId}`
      : `/fg/getJoKanbanBookingFG/${joId}`;

  const fetchFg = useCallback(async () => {
    try {
      setLoading(true);
      const res: AxiosResponse<any> = await axios.get(`${API}${endpoint}`, {
        withCredentials: true,
      });
      console.log('[FG Items by JO ID]', res.data);
      // Normalize: accept array at res.data.data, or res.data.data_barang, or res.data itself
      const raw = res.data?.data_barang ?? res.data?.data ?? res.data ?? [];
      setFgData(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.error('[FG Items error]', err);
      setFgData([]);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    setSelected([]);
    fetchFg();
  }, [joId, fetchFg]);

  function toggleItem(item: DataBarang) {
    setSelected((prev) => {
      const exists = prev.find((s) => s.id === item.id);
      if (exists) return prev.filter((s) => s.id !== item.id);
      return [
        ...prev,
        { id: item.id, qty: String(item.jumlah_qty_sisa ?? 0), data: item },
      ];
    });
  }

  function updateQty(id: number, val: string) {
    setSelected((prev) =>
      prev.map((s) => (s.id === id ? { ...s, qty: val } : s)),
    );
  }

  function removeSelected(id: number) {
    setSelected((prev) => prev.filter((s) => s.id !== id));
  }

  async function handleBook() {
    if (selected.length === 0) return;
    await onBook(
      selected.map((s) => ({ id: s.id, jumlah_qty: Number(s.qty) || 0 })),
    );
    setSelected([]);
  }

  const selectedIds = new Set(selected.map((s) => s.id));

  return (
    <div className="flex flex-col h-full">
      {/* ── STICKY TOP ACTION BAR ── */}
      <div className="flex-shrink-0 border-b border-slate-100 bg-white">
        {/* JO label + Book button */}
        <div className="px-4 pt-4 pb-3 flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-indigo-400 mb-0.5">
              Memilih FG untuk
            </p>
            <p className="text-sm font-bold text-slate-800">{joLabel}</p>
          </div>
          <button
            onClick={handleBook}
            disabled={selected.length === 0 || booking}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-colors"
          >
            {booking ? (
              <>
                <svg
                  className="w-3.5 h-3.5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Memproses...
              </>
            ) : (
              <>
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Booking {selected.length > 0 ? `(${selected.length})` : 'FG'}
              </>
            )}
          </button>
        </div>

        {/* Selected summary — collapsible */}
        {selected.length > 0 && (
          <div className="px-4 pb-3">
            <button
              onClick={() => setSummaryOpen((v) => !v)}
              className="w-full flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2 text-xs text-indigo-700 font-semibold"
            >
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {selected.length}
                </span>
                Item dipilih
              </span>
              <svg
                className={`w-3.5 h-3.5 transition-transform ${
                  summaryOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {summaryOpen && (
              <div className="mt-2 space-y-1.5 max-h-40 overflow-y-auto pr-0.5">
                {selected.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold text-slate-700">
                        {s.data.produk || s.data.no_jo}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {s.data.no_io} · {s.data.no_jo}
                      </p>
                    </div>
                    <div
                      className="flex items-center gap-1.5 flex-shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="number"
                        min={1}
                        max={s.data.jumlah_qty_sisa ?? undefined}
                        value={s.qty}
                        onChange={(e) => updateQty(s.id, e.target.value)}
                        className="w-20 rounded-md bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-xs font-bold text-indigo-700 text-right focus:outline-none focus:ring-1 focus:ring-indigo-400"
                      />
                      <button
                        onClick={() => removeSelected(s.id)}
                        className="w-5 h-5 rounded-full bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 flex items-center justify-center transition-colors"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── FG LIST (scrollable) ── */}
      <div className="flex-1 overflow-y-auto min-h-0 px-4 py-3 space-y-2">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse h-16 bg-slate-100 rounded-xl"
              />
            ))}
          </div>
        ) : fgData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <svg
                className="w-6 h-6 text-slate-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <p className="text-xs text-slate-400">Tidak ada data FG tersedia</p>
          </div>
        ) : (
          fgData.map((item) => {
            const isSelected = selectedIds.has(item.id);
            const outOfStock = (item.jumlah_qty ?? 0) <= 0;
            const isBooked = item.status === 'booking';

            return (
              <div
                key={item.id}
                onClick={() => !outOfStock && toggleItem(item)}
                className={`rounded-xl border-2 p-3 transition-all ${
                  outOfStock
                    ? 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed'
                    : isSelected
                    ? 'border-indigo-400 bg-indigo-50 cursor-pointer'
                    : 'border-slate-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/30 cursor-pointer'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {/* Checkbox */}
                  <div
                    className={`flex-shrink-0 w-4 h-4 rounded border-2 mt-0.5 flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && (
                      <svg
                        className="w-2.5 h-2.5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded">
                        {item.no_io}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500">
                        {item.no_jo}
                      </span>
                      {outOfStock && (
                        <span className="text-[10px] font-bold text-red-500 bg-red-100 px-1.5 py-0.5 rounded">
                          Stok Habis
                        </span>
                      )}
                      {isBooked && !outOfStock && (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">
                          Sudah Booking
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-800">
                      {item.produk || '-'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {item.customer}
                    </p>
                  </div>

                  {/* Qty stats */}
                  <div className="flex-shrink-0 text-right space-y-0.5">
                    <p className="text-sm font-bold text-emerald-600">
                      {fmt(item.jumlah_qty)}
                    </p>
                    <p className="text-[10px] text-slate-400">sisa</p>
                    <p className="text-[10px] text-slate-300">
                      masuk {fmt(item.jumlah_qty)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── JO List Panel (left) ─────────────────────────────────────────────────────

type JoType = 'normal' | 'kanban';

function JoListPanel({
  type,
  selectedJoId,
  onSelect,
}: {
  type: JoType;
  selectedJoId: number | null;
  onSelect: (jo: JoNormal) => void;
}) {
  const [data, setData] = useState<JoNormal[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const endpoint =
    type === 'normal' ? '/fg/getJoNormalBookingFG' : '/fg/getJoKanbanBookingFG';

  const fetchData = useCallback(
    async (s: string, p: number, l: number) => {
      try {
        setLoading(true);
        const res: AxiosResponse<JoResponse> = await axios.get(
          `${API}${endpoint}`,
          {
            params: { page: p, limit: l, search: s || undefined },
            withCredentials: true,
          },
        );
        console.log(`[JO ${type}]`, res.data);
        setData(Array.isArray(res.data?.data) ? res.data.data : []);
        setTotalPages(res.data?.total_page ?? 1);
      } catch (err) {
        console.error(`[JO ${type} error]`, err);
        setData([]);
      } finally {
        setLoading(false);
      }
    },
    [endpoint, type],
  );

  const debouncedSearch = useDebounce((val: string) => {
    setPage(1);
    fetchData(val, 1, limit);
  });

  useEffect(() => {
    setPage(1);
    setSearch('');
    fetchData('', 1, limit);
  }, [type]);

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-slate-100 space-y-2">
        <div className="relative">
          <svg
            className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none"
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
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              debouncedSearch(e.target.value);
            }}
            placeholder={
              type === 'normal'
                ? 'Cari IO, produk, customer...'
                : 'Cari No JO, produk...'
            }
            className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-400">Tampil:</span>
          {PAGE_SIZES.map((s) => (
            <button
              key={s}
              onClick={() => {
                setLimit(s);
                setPage(1);
                fetchData(search, 1, s);
              }}
              className={`text-[10px] px-2 py-0.5 rounded font-semibold transition-colors ${
                limit === s
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
          <span className="text-[10px] text-slate-400 ml-auto">
            {data.length} record
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto min-h-0">
        <table className="w-full text-xs min-w-[500px]">
          <thead className="bg-slate-50 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                Nomor
              </th>

              <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Produk
              </th>
              <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Customer
              </th>
              <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Qty
              </th>
              <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Stok FG
              </th>
              <th className="px-4 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Tgl Kirim
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <Skeleton rows={8} cols={7} />
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-slate-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <p className="text-xs text-slate-400">Tidak ada data JO</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((jo) => {
                const isActive = selectedJoId === jo.id;
                return (
                  <tr
                    key={jo.id}
                    onClick={() => onSelect(jo)}
                    className={`border-b border-slate-100 cursor-pointer transition-colors ${
                      isActive ? 'bg-indigo-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="px-4 py-3 whitespace-nowrap flex flex-col gap-0.5">
                      <span
                        className={`text-xs font-bold ${
                          isActive ? 'text-indigo-700' : 'text-indigo-600'
                        }`}
                      >
                        {jo.no_jo || '-'}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {jo.no_io || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-[160px]">
                      <p
                        className="text-xs font-medium text-slate-800"
                        title={jo.produk}
                      >
                        {jo.produk || '-'}
                      </p>
                      {jo.keterangan_pengerjaan && (
                        <p
                          className="text-[10px] text-amber-600 mt-0.5"
                          title={jo.keterangan_pengerjaan}
                        >
                          {jo.keterangan_pengerjaan}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 max-w-[120px]">
                      <p className="text-xs text-slate-500">
                        {jo.customer || '-'}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs font-semibold text-slate-700">
                        {fmt(jo.qty)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`text-xs font-bold ${
                          (jo.stok_fg ?? 0) > 0
                            ? 'text-emerald-600'
                            : 'text-slate-400'
                        }`}
                      >
                        {fmt(jo.stok_fg)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <span className="text-[10px] text-slate-500">
                        {fmtDate(jo.tgl_kirim)}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination footer */}
      <div className="flex-shrink-0 px-4 py-2.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
        <span className="text-[10px] text-slate-400">
          Hal {page} / {totalPages}
        </span>
        <MiniPagination
          page={page}
          total={totalPages}
          loading={loading}
          onChange={(p) => {
            setPage(p);
            fetchData(search, p, limit);
          }}
        />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const FGBooking: React.FC = () => {
  const [activeTab, setActiveTab] = useState<JoType>('normal');
  const [selectedJo, setSelectedJo] = useState<JoNormal | null>(null);
  const [booking, setBooking] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  function handleSelectJo(jo: JoNormal) {
    if (selectedJo?.id === jo.id) {
      setSelectedJo(null);
    } else {
      setSelectedJo(jo);
    }
  }

  async function handleBook(items: { id: number; jumlah_qty: number }[]) {
    if (!selectedJo) return;
    try {
      setBooking(true);
      const payload = { id_jo_booking: selectedJo.id, data_barang: items };
      console.log('[POST Booking payload]', payload);
      await axios.post(`${API}/fg/gudangFinishGood/bookingJo`, payload, {
        withCredentials: true,
      });
      setToast({ message: 'Booking berhasil disimpan!', type: 'success' });
      setSelectedJo(null);
    } catch (err) {
      console.error('[Booking error]', err);
      setToast({
        message: 'Gagal melakukan booking. Coba lagi.',
        type: 'error',
      });
    } finally {
      setBooking(false);
    }
  }

  const joLabel = selectedJo
    ? [selectedJo.no_io, selectedJo.no_jo, selectedJo.produk]
        .filter(Boolean)
        .join(' — ')
    : '';

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}

      <main
        className="flex flex-col"
        style={{ height: '100vh', maxHeight: '100vh', overflow: 'hidden' }}
      >
        {/* ── PAGE HEADER ── */}
        <div className="flex-shrink-0 px-4 pt-4 pb-3">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 to-indigo-900 px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-indigo-300 mb-0.5">
                  Finish Good
                </p>
                <h1 className="text-base font-bold text-white">Booking FG</h1>
              </div>
              <div className="flex items-center gap-2"></div>
            </div>
            {/* Tabs */}
            <div className="flex">
              {(['normal', 'kanban'] as JoType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setActiveTab(t);
                    setSelectedJo(null);
                  }}
                  className={`flex-1 py-2.5 text-sm font-semibold transition-colors relative ${
                    activeTab === t
                      ? 'text-indigo-700 bg-indigo-50/60'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {activeTab === t && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
                  )}
                  <span className="flex items-center justify-center gap-2">
                    {t === 'normal' ? (
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
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    ) : (
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
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    )}
                    JO {t === 'normal' ? 'Normal' : 'Kanban'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── SPLIT PANELS ── */}
        <div className="flex-1 min-h-0 flex gap-4 px-4 pb-4">
          {/* Left — JO list */}
          <div className="w-[55%] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-0">
            <div className="flex-shrink-0 px-4 py-2.5 border-b border-slate-100 bg-slate-50/60">
              <p className="text-xs font-bold text-slate-700">
                Pilih JO
                <span className="text-[10px] font-normal text-slate-400 ml-1">
                  — klik baris untuk memilih
                </span>
              </p>
            </div>
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <JoListPanel
                type={activeTab}
                selectedJoId={selectedJo?.id ?? null}
                onSelect={handleSelectJo}
              />
            </div>
          </div>

          {/* Right — FG picker */}
          <div className="w-[45%] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-0">
            {selectedJo ? (
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                <FgItemPicker
                  key={selectedJo.id}
                  joId={selectedJo.id}
                  joType={activeTab}
                  joLabel={joLabel}
                  onBook={handleBook}
                  booking={booking}
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-indigo-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-slate-700 mb-1">
                  Pilih JO terlebih dahulu
                </p>
                <p className="text-xs text-slate-400 max-w-[200px]">
                  Klik salah satu baris JO di sebelah kiri untuk mulai memilih
                  item FG.
                </p>
                <div className="mt-5 flex items-center gap-2 text-[10px] text-slate-400">
                  <svg
                    className="w-3.5 h-3.5"
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
                  Gunakan tab di atas untuk beralih JO Normal / Kanban
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default FGBooking;
