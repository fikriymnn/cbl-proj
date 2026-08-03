import React, { useEffect, useRef, useState, useCallback } from 'react';
import axios, { AxiosResponse } from 'axios';
import Loading from '../../Loading';
import { Pagination, Stack } from '@mui/material';

import { usePermissions } from '../../../constant/usePermissions';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BapListItem {
  id: number;
  id_user: number;
  no_bap: string;
  tgl_create: string;
  status: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BapListResponse {
  status: number;
  success: boolean;
  data: BapListItem[];
  total_page?: number;
}

interface UserRef {
  id: number;
  nama: string;
  email?: string;
  role?: string;
}

interface BapItem {
  id: number;
  id_bap: number;
  id_gudang_finish_good: number;
  id_jo: number;
  id_io: number;
  id_so: number;
  id_customer: number;
  id_produk: number;
  id_user_create: number;
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
  tgl_masuk: string | null;
  tgl_create: string;
  tgl_respon: string | null;
  status: string; // incoming | approve | reject
  note: string | null;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  user_create?: UserRef | null;
  user_approve?: UserRef | null;
  user_reject?: UserRef | null;
}

interface BapDetail extends BapListItem {
  bap_item: BapItem[];
}

interface BapDetailResponse {
  status: number;
  success: boolean;
  data: BapDetail;
}

// ─── Types reused from Gudang FG search ────────────────────────────────────────

interface DataBarang {
  id: number;
  id_customer: number;
  id_io: number;
  id_produk: number;
  jumlah_qty: number;
  jumlah_qty_keluar: number;
  jumlah_qty_sisa: number;
  no_io: string;
  no_jo: string;
  no_po_customer: string;
  produk: string;
  customer: string;
  tgl_masuk: string | null;
  status: string | null;
}

interface GudangItem {
  id_customer: number;
  id_io: number;
  id_produk: number;
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtQty(val: number | null | undefined) {
  if (val == null) return '-';
  return val.toLocaleString('id-ID');
}

function fmtDateTime(val: string | null | undefined) {
  if (!val) return '-';
  const d = new Date(val);
  if (isNaN(d.getTime())) return String(val);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

/** Badge classes for the BAP ticket-level status */
function bapStatusBadgeClass(status: string | null | undefined): string {
  const s = (status ?? '').toLowerCase();
  if (s === 'done' || s === 'selesai') return 'bg-blue-100 text-blue-700';
  if (s === 'incoming') return 'bg-amber-100 text-amber-700';
  return 'bg-gray-100 text-gray-600';
}

/** Badge classes for a bap_item status */
function itemStatusBadgeClass(status: string | null | undefined): string {
  const s = (status ?? '').toLowerCase();
  if (s === 'approve') return 'bg-green-100 text-green-700';
  if (s === 'reject') return 'bg-red-100 text-red-600';
  if (s === 'incoming') return 'bg-amber-100 text-amber-700';
  return 'bg-gray-100 text-gray-600';
}

function itemStatusLabel(status: string | null | undefined): string {
  const s = (status ?? '').toLowerCase();
  if (s === 'approve') return 'Disetujui';
  if (s === 'reject') return 'Ditolak';
  if (s === 'incoming') return 'Menunggu';
  return status || '-';
}

// ─── Async Searchable Select (finish good items for creating a BAP) ───────────

const SELECT_LIMIT = 8;

interface AsyncFgSelectProps {
  selectedIds: number[];
  onAdd: (barang: DataBarang) => void;
}

function AsyncFgSelect({ selectedIds, onAdd }: AsyncFgSelectProps) {
  const [search, setSearch] = useState('');
  const [candidates, setCandidates] = useState<DataBarang[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
            },
            withCredentials: true,
          },
        );
        console.log('Fetched candidates:', res.data);
        const allBarang: DataBarang[] = (res.data?.data ?? []).flatMap(
          (g) => g.data_barang ?? [],
        );
        setCandidates(allBarang);
        setTotalPages(res.data?.total_page ?? 1);
      } catch (err) {
        console.error(err);
        setCandidates([]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchCandidates('', 1);
    // eslint-disable-next-line
  }, []);

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

  const visibleCandidates = candidates.filter(
    (b) => !selectedIds.includes(b.id),
  );

  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="relative flex-shrink-0">
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearchInput(e.target.value)}
          placeholder="Cari No JO, IO, produk, customer..."
          className="w-full pl-8 pr-8 py-2 text-xs border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-blue-50"
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
        ) : visibleCandidates.length === 0 ? (
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
            {visibleCandidates.map((b) => {
              const outOfStock = (b.jumlah_qty ?? 0) <= 0;
              return (
                <div
                  key={b.id}
                  className={`flex items-center justify-between gap-3 px-3 py-2.5 transition-colors ${
                    outOfStock
                      ? 'bg-gray-50 opacity-50 cursor-not-allowed'
                      : 'hover:bg-cyan-50 cursor-pointer'
                  }`}
                  onClick={() => !outOfStock && onAdd(b)}
                  title={outOfStock ? 'Stok habis' : 'Klik untuk menambahkan'}
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
                    </div>
                    <p className="text-xs font-medium text-gray-800 mt-0.5 truncate">
                      {b.produk || '-'}
                    </p>
                    <p className="text-[10px] text-gray-400">{b.customer}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-xs font-bold text-indigo-700">
                      {fmtQty(b.jumlah_qty)}
                    </p>
                    <p className="text-[10px] text-gray-400">sisa</p>
                  </div>
                  {!outOfStock && (
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-100 hover:bg-cyan-200 flex items-center justify-center transition-colors">
                      <svg
                        className="w-3.5 h-3.5 text-cyan-700"
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

        {!loading && (visibleCandidates.length > 0 || totalPages > 1) && (
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
              <span className="text-[10px] text-gray-500 px-1">{page}</span>
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

// ─── Create BAP Modal ──────────────────────────────────────────────────────────

function CreateBapModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [noBap, setNoBap] = useState('');
  const [selected, setSelected] = useState<DataBarang[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const selectedIds = selected.map((b) => b.id);

  function addItem(barang: DataBarang) {
    setSelected((p) => [...p, barang]);
  }

  function removeItem(id: number) {
    setSelected((p) => p.filter((b) => b.id !== id));
  }

  async function handleSubmit() {
    if (!noBap.trim()) {
      alert('No BAP wajib diisi');
      return;
    }
    if (selected.length === 0) {
      alert('Pilih minimal satu data barang');
      return;
    }
    try {
      setSubmitting(true);
      await axios.post(
        `${import.meta.env.VITE_API_LINK}/fg/bap`,
        {
          no_bap: noBap.trim(),
          id_gudang_finish_good: selected.map((b) => b.id),
        },
        { withCredentials: true },
      );
      onCreated();
    } catch (err: unknown) {
      console.error(err);
      const error = err as { response?: { data?: { msg?: string } } };
      alert(error?.response?.data?.msg ?? 'Gagal membuat BAP');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full min-w-7xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-4 text-white rounded-t-2xl flex justify-between items-start flex-shrink-0">
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
              Buat BAP
            </h3>
            <p className="text-cyan-100 text-xs mt-0.5">
              Pilih data barang yang akan dimasukkan ke BAP
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-cyan-100 text-2xl font-bold leading-none"
          >
            ×
          </button>
        </div>

        {/* No BAP input */}
        <div className="px-5 pt-4 flex-shrink-0">
          <label className="text-xs font-semibold text-gray-600">
            No BAP : {''}
          </label>
          <input
            type="text"
            value={noBap}
            onChange={(e) => setNoBap(e.target.value)}
            placeholder="Contoh: BAP-0001"
            className="mt-1 w-full sm:w-72 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>

        {/* Two-column body */}
        <div className="flex-1 overflow-hidden flex min-h-0 mt-3">
          <div className="w-1/3 border-r border-gray-100 flex flex-col p-4 gap-3 min-h-0">
            <p className="text-xs font-semibold text-gray-600 flex-shrink-0">
              Tambah Data Barang
            </p>
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
              <AsyncFgSelect selectedIds={selectedIds} onAdd={addItem} />
            </div>
          </div>

          <div className="w-2/3 flex flex-col p-4 gap-3 min-h-0">
            <p className="text-xs font-semibold text-gray-600 flex-shrink-0">
              Data Dipilih{' '}
              <span className="text-cyan-600 font-bold">
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
                  <div
                    key={b.id}
                    className="rounded-xl border-2 border-gray-200 bg-white p-3 flex items-start justify-between gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-violet-600 bg-violet-100 px-1.5 py-0.5 rounded">
                          {b.no_io}
                        </span>
                        <span className="text-[10px] font-semibold text-indigo-600">
                          {b.no_jo}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-gray-800 mt-1 truncate">
                        {b.produk || '-'}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {b.customer} — Sisa:{' '}
                        <span className="font-bold text-indigo-700">
                          {fmtQty(b.jumlah_qty_sisa)}
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(b.id)}
                      className="w-6 h-6 rounded-full bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 flex items-center justify-center transition-colors flex-shrink-0"
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
            onClick={handleSubmit}
            disabled={submitting || selected.length === 0}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-sm transition-colors"
          >
            {submitting ? 'Menyimpan...' : `Buat BAP (${selected.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── BAP Detail / Approval Modal ───────────────────────────────────────────────

function BapDetailModal({
  bapId,
  canApprove,
  onClose,
  onChanged,
}: {
  bapId: number;
  canApprove: boolean;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [detail, setDetail] = useState<BapDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [acting, setActing] = useState<Record<number, boolean>>({});
  const [finishing, setFinishing] = useState(false);

  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true);
      const res: AxiosResponse<BapDetailResponse> = await axios.get(
        `${import.meta.env.VITE_API_LINK}/fg/bap/${bapId}`,
        { withCredentials: true },
      );
      setDetail(res.data?.data ?? null);
    } catch (err) {
      console.error(err);
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [bapId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  function updateNote(id: number, val: string) {
    setNotes((p) => ({ ...p, [id]: val }));
  }

  async function handleApprove(item: BapItem) {
    const note = notes[item.id] ?? '';
    if (!note.trim()) {
      alert('Note wajib diisi');
      return;
    }
    const confirmed = window.confirm(
      `Setujui item ${item.no_jo} - ${item.produk}?`,
    );
    if (!confirmed) return;
    try {
      setActing((p) => ({ ...p, [item.id]: true }));
      await axios.put(
        `${import.meta.env.VITE_API_LINK}/fg/bapItem/approve/${item.id}`,
        { note: note.trim() },
        { withCredentials: true },
      );
      await fetchDetail();
      onChanged();
    } catch (err: unknown) {
      console.error(err);
      const error = err as { response?: { data?: { msg?: string } } };
      alert(error?.response?.data?.msg ?? 'Gagal menyetujui item');
    } finally {
      setActing((p) => ({ ...p, [item.id]: false }));
    }
  }

  async function handleReject(item: BapItem) {
    const note = notes[item.id] ?? '';
    if (!note.trim()) {
      alert('Note wajib diisi');
      return;
    }
    const confirmed = window.confirm(
      `Tolak item ${item.no_jo} - ${item.produk}?`,
    );
    if (!confirmed) return;
    try {
      setActing((p) => ({ ...p, [item.id]: true }));
      await axios.put(
        `${import.meta.env.VITE_API_LINK}/fg/bapItem/reject/${item.id}`,
        { note: note.trim() },
        { withCredentials: true },
      );
      await fetchDetail();
      onChanged();
    } catch (err: unknown) {
      console.error(err);
      const error = err as { response?: { data?: { msg?: string } } };
      alert(error?.response?.data?.msg ?? 'Gagal menolak item');
    } finally {
      setActing((p) => ({ ...p, [item.id]: false }));
    }
  }

  const items = detail?.bap_item ?? [];
  const hasIncoming = items.some(
    (it) => (it.status ?? '').toLowerCase() === 'incoming',
  );
  const canFinish = canApprove && items.length > 0 && !hasIncoming;

  async function handleFinish() {
    if (!detail) return;
    const confirmed = window.confirm(
      `Selesaikan BAP ${detail.no_bap}? Tindakan ini tidak dapat dibatalkan.`,
    );
    if (!confirmed) return;
    try {
      setFinishing(true);
      await axios.put(
        `${import.meta.env.VITE_API_LINK}/fg/bap/done/${detail.id}`,
        {},
        { withCredentials: true },
      );
      onChanged();
      onClose();
    } catch (err: unknown) {
      console.error(err);
      const error = err as { response?: { data?: { msg?: string } } };
      alert(error?.response?.data?.msg ?? 'Gagal menyelesaikan BAP');
    } finally {
      setFinishing(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full min-w-7xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-4 text-white rounded-t-2xl flex justify-between items-start flex-shrink-0">
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
              {detail?.no_bap ?? 'Detail BAP'}
            </h3>
            <p className="text-cyan-100 text-xs mt-0.5">
              {detail
                ? `Dibuat ${fmtDateTime(detail.tgl_create)}`
                : 'Memuat detail...'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-cyan-100 text-2xl font-bold leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 relative min-h-[200px]">
          {loading && <Loading />}
          {!loading && items.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">
              Tidak ada item pada BAP ini
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => {
                const s = (item.status ?? '').toLowerCase();
                const isIncoming = s === 'incoming';
                const isActing = !!acting[item.id];
                return (
                  <div
                    key={item.id}
                    className="rounded-xl border-2 border-gray-200 p-3 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold text-violet-600 bg-violet-100 px-1.5 py-0.5 rounded">
                            {item.no_io}
                          </span>
                          <span className="text-[10px] font-semibold text-indigo-600">
                            {item.no_jo}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${itemStatusBadgeClass(
                              item.status,
                            )}`}
                          >
                            {itemStatusLabel(item.status)}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-gray-800 mt-1 truncate">
                          {item.produk || '-'}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {item.customer} — PO Qty:{' '}
                          <span className="font-bold">
                            {fmtQty(item.po_qty)}
                          </span>{' '}
                          — Jumlah:{' '}
                          <span className="font-bold text-indigo-700">
                            {fmtQty(item.jumlah_qty)}
                          </span>
                        </p>
                        {!isIncoming && (
                          <p className="text-[10px] text-gray-400 mt-1">
                            {s === 'approve' ? 'Disetujui' : 'Ditolak'} oleh{' '}
                            <span className="font-semibold text-gray-600">
                              {(s === 'approve'
                                ? item.user_approve?.nama
                                : item.user_reject?.nama) ?? '-'}
                            </span>{' '}
                            pada {fmtDateTime(item.tgl_respon)}
                            {item.note ? ` — Catatan: ${item.note}` : ''}
                          </p>
                        )}
                      </div>
                    </div>

                    {isIncoming && canApprove && (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1 border-t border-gray-100">
                        <input
                          type="text"
                          value={notes[item.id] ?? ''}
                          onChange={(e) => updateNote(item.id, e.target.value)}
                          placeholder="Catatan approve / reject..."
                          className="flex-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        />
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleApprove(item)}
                            disabled={isActing}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
                          >
                            Setujui
                          </button>
                          <button
                            onClick={() => handleReject(item)}
                            disabled={isActing}
                            className="px-3 py-1.5 bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
                          >
                            Tolak
                          </button>
                        </div>
                      </div>
                    )}
                    {isIncoming && !canApprove && (
                      <p className="text-[10px] text-amber-600 pt-1 border-t border-gray-100">
                        Menunggu persetujuan
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-3 border-t border-gray-100 flex gap-3 justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg text-sm transition-colors"
          >
            Tutup
          </button>
          {canFinish && (
            <button
              onClick={handleFinish}
              disabled={finishing}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-sm transition-colors"
            >
              {finishing ? 'Menyimpan...' : 'Selesaikan BAP'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type TabKey = 'list' | 'approval';

const BAPFg: React.FC = () => {
  // ── Permissions ──
  const role = localStorage.getItem('userRole') ?? '';
  const bagian = localStorage.getItem('userBagian') ?? '';
  const { checkCreate, checkEdit } = usePermissions(role, bagian);
  const canCreate = checkCreate('/gudang-fg/bap');
  const canEdit = checkEdit('/gudang-fg/bap');

  const [activeTab, setActiveTab] = useState<TabKey>('list');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<BapListItem[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [showCreate, setShowCreate] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res: AxiosResponse<BapListResponse> = await axios.get(
        `${import.meta.env.VITE_API_LINK}/fg/bap`,
        {
          params: { page, limit },
          withCredentials: true,
        },
      );
      setData(Array.isArray(res.data?.data) ? res.data.data : []);
      setTotalPages(res.data?.total_page ?? 1);
    } catch (err) {
      console.error(err);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function handleLimitChange(newLimit: number) {
    setLimit(newLimit);
    setPage(1);
  }

  function handleTabChange(tab: TabKey) {
    setActiveTab(tab);
    setPage(1);
  }

  // Approval tab: surface tickets that still have something to review first
  const displayedData =
    activeTab === 'approval'
      ? [...data].sort((a, b) => {
          const aPending =
            (a.status ?? '').toLowerCase() === 'incoming' ? 0 : 1;
          const bPending =
            (b.status ?? '').toLowerCase() === 'incoming' ? 0 : 1;
          return aPending - bPending;
        })
      : data;

  return (
    <>
      <main>
        {isLoading && <Loading />}

        {showCreate && (
          <CreateBapModal
            onClose={() => setShowCreate(false)}
            onCreated={() => {
              setShowCreate(false);
              setPage(1);
              fetchData();
            }}
          />
        )}

        {detailId != null && (
          <BapDetailModal
            bapId={detailId}
            canApprove={activeTab === 'approval' && canEdit}
            onClose={() => setDetailId(null)}
            onChanged={fetchData}
          />
        )}

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden mb-4">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-3 sm:p-4">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Berita Acara Pemeriksaan (BAP)
            </h2>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 px-3 sm:px-4 pt-3 gap-2">
            <button
              onClick={() => handleTabChange('list')}
              className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
                activeTab === 'list'
                  ? 'bg-cyan-50 text-cyan-700 border-b-2 border-cyan-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Daftar BAP
            </button>
            <button
              onClick={() => handleTabChange('approval')}
              className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
                activeTab === 'approval'
                  ? 'bg-cyan-50 text-cyan-700 border-b-2 border-cyan-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Approval
            </button>
          </div>

          {activeTab === 'list' && (
            <div className="p-3 sm:p-4 flex items-center justify-end">
              {canCreate && (
                <button
                  onClick={() => setShowCreate(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-semibold rounded-lg shadow transition-all"
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
                  Buat BAP
                </button>
              )}
            </div>
          )}
          {activeTab === 'approval' && !canEdit && (
            <div className="px-3 sm:px-4 py-3 text-xs text-amber-600 bg-amber-50 border-t border-amber-100">
              Anda tidak memiliki akses untuk menyetujui atau menolak item BAP.
              Anda tetap dapat melihat detailnya.
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-3 sm:p-4 flex items-center justify-between gap-3 flex-wrap">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              {activeTab === 'list' ? 'Daftar BAP' : 'BAP Menunggu Persetujuan'}
            </h3>
            <span className="text-sm text-white bg-white bg-opacity-20 px-3 py-0.5 rounded-full font-semibold">
              {data.length} Record
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm min-w-[720px]">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  {['No', 'No BAP', 'Tanggal Dibuat', 'Status', 'Aksi'].map(
                    (h) => (
                      <th
                        key={h}
                        className="p-2 sm:p-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {displayedData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-8 text-center text-gray-500 text-sm"
                    >
                      Tidak ada data BAP
                    </td>
                  </tr>
                ) : (
                  displayedData.map((bap, idx) => (
                    <tr
                      key={bap.id}
                      className="border-b hover:bg-blue-50 transition-colors"
                    >
                      <td className="p-2 sm:p-3 text-xs text-gray-400">
                        {(page - 1) * limit + idx + 1}
                      </td>
                      <td className="p-2 sm:p-3 text-xs font-bold text-cyan-700 whitespace-nowrap">
                        {bap.no_bap}
                      </td>
                      <td className="p-2 sm:p-3 text-xs whitespace-nowrap">
                        {fmtDateTime(bap.tgl_create)}
                      </td>
                      <td className="p-2 sm:p-3 text-xs">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full font-semibold whitespace-nowrap ${bapStatusBadgeClass(
                            bap.status,
                          )}`}
                        >
                          {bap.status || '-'}
                        </span>
                      </td>
                      <td className="p-2 sm:p-3 text-xs">
                        <button
                          onClick={() => setDetailId(bap.id)}
                          className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
                        >
                          {activeTab === 'approval' && canEdit
                            ? 'Review'
                            : 'Lihat Detail'}
                        </button>
                      </td>
                    </tr>
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
                        ? 'bg-cyan-600 text-white'
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

export default BAPFg;
