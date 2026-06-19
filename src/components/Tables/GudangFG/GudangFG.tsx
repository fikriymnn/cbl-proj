import React, { useEffect, useRef, useState, useCallback } from 'react';
import axios, { AxiosResponse } from 'axios';
import Loading from '../../Loading';
import { Pagination, Stack } from '@mui/material';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DataBarang {
  id: number;
  id_customer: number;
  id_io: number;
  id_jo: number;
  id_produk: number;
  id_so: number;
  is_active: number;
  jumlah_qty: number;
  jumlah_qty_keluar: number;
  jumlah_qty_sisa: number;
  no_io: string;
  no_jo: string;
  no_po_customer: string;
  no_so: string;
  note: string | null;
  po_qty: number;
  produk: string;
  customer: string;
  toleransi_pengiriman: string;
  tgl_masuk: string | null;
  status: string | null;
  createdAt: string;
  updatedAt: string;
}

interface GudangItem {
  id_customer: number;
  id_io: number;
  id_produk: number;
  jumlah_qty: number;
  jumlah_qty_keluar: number;
  jumlah_qty_sisa: number;
  no_io: string;
  produk: string;
  customer: string;
  data_barang: DataBarang[];
}

interface GudangResponse {
  data: GudangItem[];
  status: number;
  success: boolean;
  total_page?: number;
}

interface SendDoItem {
  id: number;
  jumlah_kirim: number;
  is_main_jo?: boolean;
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

/** Format a date string/value as "20-Desember-2026" */
function fmtTglMasuk(val: string | null | undefined): string {
  if (!val) return '-';
  const d = new Date(val);
  if (isNaN(d.getTime())) return String(val);
  const day = String(d.getDate()).padStart(2, '0');
  const month = BULAN_ID[d.getMonth()];
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

/** Number of days between tgl_masuk and today */
function lifetimeDays(val: string | null | undefined): string {
  if (!val) return '-';
  const start = new Date(val);
  if (isNaN(start.getTime())) return '-';
  const now = new Date();
  const startUtc = Date.UTC(
    start.getFullYear(),
    start.getMonth(),
    start.getDate(),
  );
  const nowUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.floor((nowUtc - startUtc) / (1000 * 60 * 60 * 24));
  return `${days} hari`;
}

/** Color classes for status badge: Keep = green, Booking = amber, else = gray */
function statusBadgeClass(status: string | null | undefined): string {
  const s = (status ?? '').toLowerCase();
  if (s === 'keep') return 'bg-green-100 text-green-700';
  if (s === 'booking') return 'bg-amber-100 text-amber-700';
  return 'bg-gray-100 text-gray-600';
}

// ─── Async Searchable Select ──────────────────────────────────────────────────

const SELECT_LIMIT = 8;

interface AsyncSearchSelectProps {
  selectedIds: number[];
  lockedIoId?: number | null;
  /** If provided, items whose id_io !== lockedIoId will be shown but disabled */
  showAllButLockIo?: boolean;
  onAdd: (barang: DataBarang) => void;
  placeholder?: string;
}

function AsyncSearchSelect({
  selectedIds,
  lockedIoId,
  showAllButLockIo = false,
  onAdd,
  placeholder,
}: AsyncSearchSelectProps) {
  const [search, setSearch] = useState('');
  const [candidates, setCandidates] = useState<DataBarang[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchCandidates = useCallback(
    async (searchVal: string, pageVal: number) => {
      try {
        setLoading(true);
        const res: AxiosResponse<GudangResponse> = await axios.get(
          `${import.meta.env.VITE_API_LINK}/fg/gudangFinishGoodByIo`,
          {
            params: {
              page: pageVal,
              limit: SELECT_LIMIT,
              search: searchVal || undefined,
              // Only pass id_io filter when NOT in showAllButLockIo mode
              id_io:
                !showAllButLockIo && lockedIoId != null
                  ? lockedIoId
                  : undefined,
            },
            withCredentials: true,
          },
        );

        const allBarang: DataBarang[] = (res.data?.data ?? []).flatMap(
          (g) => g.data_barang ?? [],
        );

        // Filter already-selected IDs client-side
        setCandidates(allBarang.filter((b) => !selectedIds.includes(b.id)));
        setTotalPages(res.data?.total_page ?? 1);
      } catch (err) {
        console.error(err);
        setCandidates([]);
      } finally {
        setLoading(false);
      }
    },
    [lockedIoId, selectedIds, showAllButLockIo],
  );

  useEffect(() => {
    fetchCandidates(search, page);
    // eslint-disable-next-line
  }, [lockedIoId, showAllButLockIo]);

  useEffect(() => {
    setCandidates((prev) => prev.filter((b) => !selectedIds.includes(b.id)));
  }, [selectedIds]);

  function handleSearchInput(val: string) {
    setSearch(val);
    setPage(1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchCandidates(val, 1);
    }, 400);
  }

  function handlePageChange(newPage: number) {
    setPage(newPage);
    fetchCandidates(search, newPage);
  }

  function handleAdd(b: DataBarang) {
    onAdd(b);
    setCandidates((prev) => prev.filter((x) => x.id !== b.id));
  }

  return (
    <div className="flex flex-col gap-2 h-full">
      {/* Search input */}
      <div className="relative flex-shrink-0">
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => handleSearchInput(e.target.value)}
          placeholder={placeholder ?? 'Cari No JO, IO, produk, customer...'}
          className="w-full pl-8 pr-8 py-2 text-xs border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 bg-blue-50"
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
        {search && (
          <button
            onClick={() => handleSearchInput('')}
            className="absolute right-2.5 top-2 w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600"
          >
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              className="w-3.5 h-3.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Results list */}
      <div className="rounded-xl border border-gray-200 overflow-hidden flex flex-col flex-1">
        {loading ? (
          <div className="divide-y divide-gray-100">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-2.5 animate-pulse"
              >
                <div className="flex-1 space-y-1.5">
                  <div className="flex gap-2">
                    <div className="h-4 w-16 bg-gray-200 rounded" />
                    <div className="h-4 w-20 bg-gray-200 rounded" />
                  </div>
                  <div className="h-3 w-36 bg-gray-200 rounded" />
                  <div className="h-3 w-24 bg-gray-100 rounded" />
                </div>
                <div className="h-8 w-12 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : candidates.length === 0 ? (
          <div className="py-6 text-center text-xs text-gray-400 flex-1 flex items-center justify-center">
            {search
              ? 'Tidak ada hasil untuk pencarian ini'
              : 'Tidak ada data tersedia'}
          </div>
        ) : (
          <div
            className="divide-y divide-gray-100 overflow-y-auto flex-1"
            style={{ maxHeight: '340px' }}
          >
            {candidates.map((b) => {
              const outOfStock = (b.jumlah_qty_sisa ?? 0) <= 0;
              // In showAllButLockIo mode, items with different IO are shown but disabled
              const wrongIo =
                showAllButLockIo &&
                lockedIoId != null &&
                b.id_io !== lockedIoId;
              const isDisabled = outOfStock || wrongIo;

              return (
                <div
                  key={b.id}
                  className={`flex items-center justify-between gap-3 px-3 py-2.5 transition-colors ${
                    isDisabled
                      ? 'bg-gray-50 opacity-50 cursor-not-allowed'
                      : 'hover:bg-violet-50 cursor-pointer'
                  }`}
                  onClick={() => !isDisabled && handleAdd(b)}
                  title={
                    outOfStock
                      ? 'Stok habis'
                      : wrongIo
                      ? `Hanya IO ${
                          candidates.find((x) => x.id_io === lockedIoId)
                            ?.no_io ?? ''
                        } yang dapat dipilih dalam grup ini`
                      : 'Klik untuk menambahkan'
                  }
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold text-violet-600 bg-violet-100 px-1.5 py-0.5 rounded">
                        {b.no_io}
                      </span>
                      <span className="text-[10px] font-semibold text-indigo-600">
                        {b.no_jo}
                      </span>
                      {outOfStock && (
                        <span className="text-[10px] font-bold text-red-500 bg-red-100 px-1.5 py-0.5 rounded">
                          Stok Habis
                        </span>
                      )}
                      {wrongIo && (
                        <span className="text-[10px] font-bold text-orange-500 bg-orange-100 px-1.5 py-0.5 rounded">
                          IO Berbeda
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-gray-800 mt-0.5 truncate">
                      {b.produk || '-'}
                    </p>
                    <p className="text-[10px] text-gray-400">{b.customer}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-xs font-bold text-indigo-700">
                      {fmtQty(b.jumlah_qty_sisa)}
                    </p>
                    <p className="text-[10px] text-gray-400">sisa</p>
                  </div>
                  {!isDisabled && (
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-100 hover:bg-violet-200 flex items-center justify-center transition-colors">
                      <svg
                        className="w-3.5 h-3.5 text-violet-600"
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
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination footer */}
        {!loading && (candidates.length > 0 || totalPages > 1) && (
          <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-t border-gray-100 flex-shrink-0">
            <span className="text-[10px] text-gray-400">
              Hal {page}/{totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1 || loading}
                onClick={() => handlePageChange(page - 1)}
                className="w-6 h-6 flex items-center justify-center rounded text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
                )
                .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                  if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1)
                    acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === '...' ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="text-[10px] text-gray-400 px-0.5"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p as number)}
                      className={`w-6 h-6 flex items-center justify-center rounded text-[10px] font-semibold transition-colors ${
                        page === p
                          ? 'bg-violet-600 text-white'
                          : 'text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}
              <button
                disabled={page >= totalPages || loading}
                onClick={() => handlePageChange(page + 1)}
                className="w-6 h-6 flex items-center justify-center rounded text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Type Selector Modal ──────────────────────────────────────────────────────

function DoTypeSelectorModal({
  onSelect,
  onClose,
}: {
  onSelect: (type: 'single' | 'group') => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-4 text-white flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold">Send Delivery Order</h3>
            <p className="text-violet-200 text-xs mt-0.5">
              Pilih tipe pengiriman
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-violet-200 text-2xl font-bold leading-none"
          >
            ×
          </button>
        </div>
        <div className="p-5 space-y-3">
          <button
            onClick={() => onSelect('single')}
            className="w-full flex items-start gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-violet-400 hover:bg-violet-50 transition-all group text-left"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-violet-100 group-hover:bg-violet-200 flex items-center justify-center transition-colors">
              <svg
                className="w-5 h-5 text-violet-600"
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
            </div>
            <div>
              <p className="font-bold text-gray-800 text-sm">Single DO</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Kirim satu atau beberapa DO secara independen, bebas memilih
                dari semua data
              </p>
            </div>
          </button>
          <button
            onClick={() => onSelect('group')}
            className="w-full flex items-start gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all group text-left"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 group-hover:bg-indigo-200 flex items-center justify-center transition-colors">
              <svg
                className="w-5 h-5 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <p className="font-bold text-gray-800 text-sm">Group DO</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Gabungkan beberapa JO dalam satu IO yang sama, tentukan satu
                indukan
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Selected Item Card ───────────────────────────────────────────────────────

function SelectedItemCard({
  barang,
  quantity,
  isMain,
  showMainToggle,
  onRemove,
  onQtyChange,
  onSetMain,
}: {
  barang: DataBarang;
  quantity: string;
  isMain?: boolean;
  showMainToggle?: boolean;
  onRemove: () => void;
  onQtyChange: (v: string) => void;
  onSetMain?: () => void;
}) {
  return (
    <div
      className={`rounded-xl border-2 p-3 space-y-2 transition-all ${
        isMain ? 'border-violet-400 bg-violet-50' : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-violet-600 bg-violet-100 px-1.5 py-0.5 rounded">
              {barang.no_io}
            </span>
            <span className="text-[10px] font-semibold text-indigo-600">
              {barang.no_jo}
            </span>
            {isMain && (
              <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">
                ★ Indukan
              </span>
            )}
          </div>
          <p className="text-xs font-semibold text-gray-800 mt-1 truncate">
            {barang.produk || '-'}
          </p>
          <p className="text-[10px] text-gray-500">
            {barang.customer} — Sisa:{' '}
            <span className="font-bold text-indigo-700">
              {fmtQty(barang.jumlah_qty_sisa)}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {showMainToggle && !isMain && (
            <button
              onClick={onSetMain}
              className="text-[10px] px-2 py-1 rounded-full border border-gray-300 text-gray-500 hover:border-violet-400 hover:text-violet-600 transition-colors"
            >
              Set Indukan
            </button>
          )}
          <button
            onClick={onRemove}
            className="w-6 h-6 rounded-full bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 flex items-center justify-center transition-colors"
          >
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-[10px] font-medium text-gray-500 whitespace-nowrap">
          Jumlah Kirim:
        </label>
        <input
          type="number"
          min={1}
          max={barang.jumlah_qty_sisa ?? undefined}
          value={quantity}
          onChange={(e) => onQtyChange(e.target.value)}
          className="flex-1 rounded-lg bg-blue-50 border border-blue-200 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-violet-400"
        />
      </div>
    </div>
  );
}

// ─── Single DO Modal ──────────────────────────────────────────────────────────

function SingleDoModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: (payload: SendDoItem[]) => void;
}) {
  const [selected, setSelected] = useState<DataBarang[]>([]);
  const [quantities, setQuantities] = useState<Record<number, string>>({});

  const selectedIds = selected.map((b) => b.id);

  function addItem(barang: DataBarang) {
    setSelected((p) => [...p, barang]);
    setQuantities((p) => ({
      ...p,
      [barang.id]: String(barang.jumlah_qty_sisa ?? 0),
    }));
  }

  function removeItem(id: number) {
    setSelected((p) => p.filter((b) => b.id !== id));
    setQuantities((p) => {
      const n = { ...p };
      delete n[id];
      return n;
    });
  }

  function handleConfirm() {
    const payload: SendDoItem[] = selected.map((r) => ({
      id: r.id,
      jumlah_kirim: Number(quantities[r.id]) || 0,
    }));
    onConfirm(payload);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full min-w-7xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-4 text-white rounded-t-2xl flex justify-between items-start flex-shrink-0">
          <div>
            <h3 className="text-base font-bold flex items-center gap-2">
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
              Single DO
            </h3>
            <p className="text-violet-200 text-xs mt-0.5">
              Pilih data bebas dari semua IO
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-violet-200 text-2xl font-bold leading-none"
          >
            ×
          </button>
        </div>

        {/* Two-column body */}
        <div className="flex-1 overflow-hidden flex min-h-0">
          {/* LEFT — search & list */}
          <div className="w-1/3 border-r border-gray-100 flex flex-col p-4 gap-3 min-h-0">
            <p className="text-xs font-semibold text-gray-600 flex-shrink-0">
              Tambah Data
            </p>
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
              <AsyncSearchSelect selectedIds={selectedIds} onAdd={addItem} />
            </div>
          </div>

          {/* RIGHT — selected items */}
          <div className="w-2/3 flex flex-col p-4 gap-3 min-h-0">
            <p className="text-xs font-semibold text-gray-600 flex-shrink-0">
              Data Dipilih{' '}
              <span className="text-violet-600 font-bold">
                ({selected.length})
              </span>
            </p>

            {selected.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-200 rounded-xl py-8">
                <svg
                  className="w-10 h-10 text-gray-300 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-xs text-gray-400">
                  Belum ada data dipilih.
                  <br />
                  Cari dan pilih data di sebelah kiri.
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {selected.map((b) => (
                  <SelectedItemCard
                    key={b.id}
                    barang={b}
                    quantity={quantities[b.id] ?? ''}
                    onRemove={() => removeItem(b.id)}
                    onQtyChange={(v) =>
                      setQuantities((p) => ({ ...p, [b.id]: v }))
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-3 border-t border-gray-100 flex gap-3 justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg text-sm transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            disabled={selected.length === 0}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-sm transition-colors"
          >
            Kirim DO ({selected.length})
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Group DO Modal ───────────────────────────────────────────────────────────

function GroupDoModal({
  allData,
  onClose,
  onConfirm,
}: {
  allData: GudangItem[];
  onClose: () => void;
  onConfirm: (payload: SendDoItem[]) => void;
}) {
  const [selected, setSelected] = useState<DataBarang[]>([]);
  const [quantities, setQuantities] = useState<Record<number, string>>({});
  const [mainJoId, setMainJoId] = useState<number | null>(null);

  // Derive locked IO from first selected item
  const lockedIoId = selected.length > 0 ? selected[0].id_io : null;
  const selectedIds = selected.map((b) => b.id);

  const lockedGroup =
    lockedIoId != null ? allData.find((g) => g.id_io === lockedIoId) : null;

  function addItem(barang: DataBarang) {
    setSelected((p) => [...p, barang]);
    setQuantities((p) => ({
      ...p,
      [barang.id]: String(barang.jumlah_qty_sisa ?? 0),
    }));
    if (selected.length === 0) {
      setMainJoId(barang.id);
    }
  }

  function removeItem(id: number) {
    setSelected((p) => {
      const next = p.filter((b) => b.id !== id);
      if (mainJoId === id) setMainJoId(next[0]?.id ?? null);
      return next;
    });
    setQuantities((p) => {
      const n = { ...p };
      delete n[id];
      return n;
    });
  }

  function handleConfirm() {
    const payload: SendDoItem[] = selected.map((r) => ({
      id: r.id,
      jumlah_kirim: Number(quantities[r.id]) || 0,
      is_main_jo: r.id === mainJoId,
    }));
    onConfirm(payload);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full min-w-7xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-4 text-white rounded-t-2xl flex justify-between items-start flex-shrink-0">
          <div>
            <h3 className="text-base font-bold flex items-center gap-2">
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Group DO
            </h3>
            <p className="text-indigo-200 text-xs mt-0.5">
              {lockedGroup ? (
                <>
                  IO terkunci:{' '}
                  <span className="font-bold text-white">
                    {lockedGroup.no_io}
                  </span>{' '}
                  — {lockedGroup.produk}
                </>
              ) : (
                'Pilih item pertama untuk menentukan IO grup'
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-indigo-200 text-2xl font-bold leading-none"
          >
            ×
          </button>
        </div>

        {/* Two-column body */}
        <div className="flex-1 overflow-hidden flex min-h-0">
          {/* LEFT — search & list */}
          <div className="w-1/3 border-r border-gray-100 flex flex-col p-4 gap-3 min-h-0">
            <div className="flex-shrink-0 space-y-2">
              <p className="text-xs font-semibold text-gray-600">Tambah Data</p>
              {/* Lock notice */}
              {lockedIoId != null && (
                <div className="flex items-center gap-2 text-xs bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg px-3 py-2">
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
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <span>
                    IO <strong>{lockedGroup?.no_io}</strong> terkunci.{' '}
                    <span className="text-orange-600">
                      IO berbeda tidak bisa dipilih.
                    </span>
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
              {/* Always search all data; showAllButLockIo disables wrong-IO items */}
              <AsyncSearchSelect
                selectedIds={selectedIds}
                lockedIoId={lockedIoId}
                showAllButLockIo={lockedIoId != null}
                onAdd={addItem}
                placeholder="Cari No JO, IO, produk, customer..."
              />
            </div>
          </div>

          {/* RIGHT — selected items */}
          <div className="w-2/3 flex flex-col p-4 gap-3 min-h-0">
            <p className="text-xs font-semibold text-gray-600 flex-shrink-0">
              Data Dipilih{' '}
              <span className="text-indigo-600 font-bold">
                ({selected.length})
              </span>
              {selected.length > 0 && (
                <span className="text-[10px] text-gray-400 ml-2">
                  — Pilih satu sebagai indukan
                </span>
              )}
            </p>

            {selected.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center border-2 border-dashed border-indigo-200 rounded-xl py-8">
                <svg
                  className="w-10 h-10 text-indigo-200 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <p className="text-xs text-gray-400">
                  Pilih item pertama.
                  <br />
                  IO dari item pertama akan mengunci pilihan grup.
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {selected.map((b) => (
                  <SelectedItemCard
                    key={b.id}
                    barang={b}
                    quantity={quantities[b.id] ?? ''}
                    isMain={b.id === mainJoId}
                    showMainToggle={true}
                    onRemove={() => removeItem(b.id)}
                    onQtyChange={(v) =>
                      setQuantities((p) => ({ ...p, [b.id]: v }))
                    }
                    onSetMain={() => setMainJoId(b.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-3 border-t border-gray-100 flex gap-3 justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg text-sm transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            disabled={selected.length === 0}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-sm transition-colors"
          >
            Kirim Group DO ({selected.length})
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type DoModalState = 'none' | 'type-select' | 'single' | 'group';

const GudangFG: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<GudangItem[]>([]);
  const [doModal, setDoModal] = useState<DoModalState>('none');

  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [page, limit, searchTerm]);

  const fetchData = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const res: AxiosResponse<GudangResponse> = await axios.get(
        `${import.meta.env.VITE_API_LINK}/fg/gudangFinishGoodByIo`,
        {
          params: { page, limit, search: searchTerm || undefined },
          withCredentials: true,
        },
      );
      console.log('Fetched data:', res.data);
      setData(Array.isArray(res.data?.data) ? res.data.data : []);
      setTotalPages(res.data?.total_page || 1);
    } catch (err) {
      console.error(err);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLimitChange = (newLimit: number): void => {
    setLimit(newLimit);
    setPage(1);
  };

  function handleSearchChange(val: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchTerm(val);
      setPage(1);
    }, 400);
  }

  const handleSendDo = async (
    type: 'single' | 'group',
    payload: SendDoItem[],
  ): Promise<void> => {
    const endpoint =
      type === 'single'
        ? '/fg/gudangFinishGood/sendDo/single'
        : '/fg/gudangFinishGood/sendDo/group';
    try {
      setIsLoading(true);
      await axios.post(
        `${import.meta.env.VITE_API_LINK}${endpoint}`,
        { data_barang: payload },
        { withCredentials: true },
      );
      setDoModal('none');
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <main>
        {isLoading && <Loading />}

        {doModal === 'type-select' && (
          <DoTypeSelectorModal
            onSelect={(type) => setDoModal(type)}
            onClose={() => setDoModal('none')}
          />
        )}
        {doModal === 'single' && (
          <SingleDoModal
            onClose={() => setDoModal('none')}
            onConfirm={(payload) => handleSendDo('single', payload)}
          />
        )}
        {doModal === 'group' && (
          <GroupDoModal
            allData={data}
            onClose={() => setDoModal('none')}
            onConfirm={(payload) => handleSendDo('group', payload)}
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
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
              Gudang Finish Good
            </h2>
          </div>
          <div className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative w-full sm:w-96">
              <input
                type="text"
                placeholder="Search No JO, IO, produk, customer..."
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9 pr-3 py-2 text-sm border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 w-full bg-blue-50"
              />
              <svg
                className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
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
            <button
              onClick={() => setDoModal('type-select')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg shadow transition-all"
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
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
              Send DO
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
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
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
              Data Gudang FG
            </h3>
            <span className="text-sm text-white bg-white bg-opacity-20 px-3 py-0.5 rounded-full font-semibold">
              {data.length} Record
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm min-w-[960px]">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  {[
                    'No',
                    'No JO',
                    'No IO',
                    'Produk',
                    'Customer',
                    'PO Qty',
                    'Tgl Masuk',
                    'Status',
                    'Lifetime',
                    'Sisa Stok',
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
                {data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="p-8 text-center text-gray-500 text-sm"
                    >
                      Tidak ada data gudang FG
                    </td>
                  </tr>
                ) : (
                  data.map((group, gi) => (
                    <React.Fragment key={`${group.id_io}-${group.id_produk}`}>
                      <tr className="bg-violet-50 border-b border-violet-100">
                        <td colSpan={10} className="p-2 px-4">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-violet-700">
                              {group.no_io}
                            </span>
                            <span className="text-xs text-gray-600 font-medium max-w-xs">
                              {group.produk}
                            </span>
                            <span className="text-[10px] text-gray-500">
                              {group.customer}
                            </span>
                          </div>
                        </td>
                      </tr>
                      {(group.data_barang ?? []).map((barang, bi) => {
                        const rowIdx =
                          data
                            .slice(0, gi)
                            .reduce(
                              (s, g) => s + (g.data_barang?.length ?? 0),
                              0,
                            ) +
                          bi +
                          1;

                        return (
                          <tr
                            key={barang.id}
                            className="border-b hover:bg-blue-50 transition-colors"
                          >
                            <td className="p-2 sm:p-3 text-xs text-gray-400 pl-8">
                              {rowIdx}
                            </td>
                            <td className="p-2 sm:p-3 text-xs font-bold text-violet-600 whitespace-nowrap">
                              {barang.no_jo || '-'}
                            </td>
                            <td className="p-2 sm:p-3 text-xs text-gray-600 whitespace-nowrap">
                              {barang.no_io || '-'}
                            </td>
                            <td className="p-2 sm:p-3 text-xs max-w-[180px]">
                              <span className="block" title={barang.produk}>
                                {barang.produk || '-'}
                              </span>
                            </td>
                            <td className="p-2 sm:p-3 text-xs text-gray-700">
                              {barang.customer || '-'}
                            </td>
                            <td className="p-2 sm:p-3 text-xs text-right font-medium">
                              {fmtQty(barang.po_qty)}
                            </td>
                            <td className="p-2 sm:p-3 text-xs whitespace-nowrap">
                              {fmtTglMasuk(barang.tgl_masuk)}
                            </td>
                            <td className="p-2 sm:p-3 text-xs">
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full font-semibold whitespace-nowrap ${statusBadgeClass(
                                  barang.status,
                                )}`}
                              >
                                {barang.status || '-'}
                              </span>
                            </td>
                            <td className="p-2 sm:p-3 text-xs text-gray-700 whitespace-nowrap">
                              {lifetimeDays(barang.tgl_masuk)}
                            </td>
                            <td className="p-2 sm:p-3 text-xs text-right font-bold text-indigo-700">
                              {fmtQty(barang.jumlah_qty)}
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 mt-4 pb-4 px-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Rows per page:</span>
              <div className="flex gap-2">
                {[10, 25, 50, 100].map((pageSize) => (
                  <button
                    key={pageSize}
                    onClick={() => handleLimitChange(pageSize)}
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
      </main>
    </>
  );
};

export default GudangFG;
