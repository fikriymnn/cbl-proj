// BAPMarketing.tsx
// Stage-1 (marketing) approval of BAP items.
// - Approve ONLY (no reject) — a bad BAP still needs a note explaining why.
// - Per-item quick approve, or multi-select + bulk approve (still hits the API
//   once per item — the endpoint has no bulk variant).
// - Marketing filter (Marketing-only): on open, ALL items in the BAP are shown.
//   A dropdown narrows the list to a single marketing person. Options are the
//   unique bap_item.so.kalkulasi.id_marketing values present on this BAP.
//   Each id is resolved to a real name by (in order):
//     1. a name already embedded in the item (so.kalkulasi.marketing.nama, ...)
//     2. GET /hr/karyawan, matched by MARKETING_ID_SOURCE (see below)
//     3. fallback label "Marketing #<id>"
// - Search + status filter (shared, see bapItemFilter.tsx) applied on top.
//
// If names still show as "Marketing #<id>", open the browser console: the
// modal logs the raw id_marketing values and the karyawan ids it fetched, so
// you can see which id space id_marketing belongs to.

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import Loading from '../../Loading';
import { Pagination, Stack } from '@mui/material';

import {
  BapDetail,
  BapDetailResponse,
  BapItem,
  BapListItem,
  BapListResponse,
} from './types/BapTypes';
import {
  bapStatusBadgeClass,
  fmtDateTime,
  fmtQty,
  isMarketingApproved,
} from './bapHelpers';
import {
  BapItemFilterBar,
  StatusFilterOption,
  useBapItemFilter,
} from './bapItemFilter';
import SearchableSelect from '../../../pages/MasterData/Marketing/SearchableSelect';

// ─── Marketing name resolution ─────────────────────────────────────────────

// Which id on the /hr/karyawan record does kalkulasi.id_marketing point to?
//   'karyawan' -> karyawan.id (primary key of the karyawan table)
//   'user'     -> karyawan.id_user / karyawan.user.id (the login account id)
// Flip this if the names come out wrong / missing.
// /hr/karyawan returns { userid, name, badgenumber, ... }, and id_marketing
// matches `userid`, so the default is 'user'.
const MARKETING_ID_SOURCE: 'karyawan' | 'user' = 'user';

interface KaryawanRef {
  userid?: number; // /hr/karyawan exposes the account id as `userid`
  badgenumber?: string;
  id?: number;
  id_karyawan?: number;
  id_user?: number;
  user?: { id?: number; nama?: string; name?: string; username?: string };
  name?: string;
  nama?: string;
  nama_karyawan?: string;
  nama_lengkap?: string;
  full_name?: string;
  username?: string;
}

function karyawanName(k: KaryawanRef): string | undefined {
  return (
    k.nama ||
    k.name ||
    k.nama_karyawan ||
    k.nama_lengkap ||
    k.full_name ||
    k.user?.nama ||
    k.user?.name ||
    k.username ||
    k.user?.username ||
    undefined
  );
}

// Some backends already join the marketing person onto the kalkulasi.
function embeddedMarketingName(item: BapItem): string | undefined {
  const kalk = item.so?.kalkulasi as unknown as
    | Record<string, unknown>
    | undefined;
  if (!kalk) return undefined;

  const candidates = [
    kalk.marketing,
    kalk.user_marketing,
    kalk.karyawan_marketing,
    kalk.karyawan,
  ];
  for (const c of candidates) {
    if (c && typeof c === 'object') {
      const o = c as Record<string, unknown>;
      const n = o.nama ?? o.name ?? o.nama_karyawan ?? o.username;
      if (typeof n === 'string' && n) return n;
    }
  }
  if (typeof kalk.nama_marketing === 'string' && kalk.nama_marketing) {
    return kalk.nama_marketing;
  }
  return undefined;
}

const MARKETING_STATUS_OPTIONS: StatusFilterOption[] = [
  { value: '', label: 'Semua Status', match: () => true },
  {
    value: 'pending',
    label: 'Menunggu approve marketing',
    match: (it) =>
      !isMarketingApproved(it) &&
      (it.status ?? '').toLowerCase() === 'incoming',
  },
  {
    value: 'done',
    label: 'Sudah disetujui marketing',
    match: (it) => isMarketingApproved(it),
  },
];

// ─── Detail / Approval Modal ───────────────────────────────────────────────

function MarketingBapDetailModal({
  bapId,
  onClose,
  onChanged,
}: {
  bapId: number;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [detail, setDetail] = useState<BapDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [acting, setActing] = useState<Record<number, boolean>>({});
  const [selected, setSelected] = useState<number[]>([]);
  const [bulkNote, setBulkNote] = useState('');
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  const [karyawan, setKaryawan] = useState<KaryawanRef[]>([]);
  const [marketingFilter, setMarketingFilter] = useState<string>(''); // '' = show all

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

  const fetchKaryawan = useCallback(async () => {
    try {
      // Large limit so a paginated endpoint doesn't hide the marketing person
      const res = await axios.get(
        `${import.meta.env.VITE_API_LINK}/hr/karyawan`,
        { params: { page: 1, limit: 1000 }, withCredentials: true },
      );
      const raw = res.data?.data;
      const list: KaryawanRef[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.data)
        ? raw.data
        : [];
      console.log(
        '[BAPMarketing] karyawan ids',
        list.map((k) => ({
          id: k.id,
          userid: k.userid,
          id_user: k.id_user,
          user_id: k.user?.id,
          name: karyawanName(k),
        })),
      );
      setKaryawan(list);
    } catch (err) {
      console.error(err);
      setKaryawan([]);
    }
  }, []);

  useEffect(() => {
    fetchDetail();
    fetchKaryawan();
    setMarketingFilter('');
    setSelected([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bapId]);

  const allItems = useMemo(() => detail?.bap_item ?? [], [detail]);

  // id -> name lookups, one per id space
  const nameLookup = useMemo(() => {
    const byKaryawanId = new Map<number, string>();
    const byUserId = new Map<number, string>();
    karyawan.forEach((k) => {
      const name = karyawanName(k);
      if (!name) return;
      [k.id, k.id_karyawan].forEach((id) => {
        if (id != null) byKaryawanId.set(Number(id), name);
      });
      [k.userid, k.id_user, k.user?.id].forEach((id) => {
        if (id != null) byUserId.set(Number(id), name);
      });
    });
    return (id: number): string | undefined => {
      const primary =
        MARKETING_ID_SOURCE === 'karyawan' ? byKaryawanId : byUserId;
      const secondary =
        MARKETING_ID_SOURCE === 'karyawan' ? byUserId : byKaryawanId;
      return primary.get(id) ?? secondary.get(id);
    };
  }, [karyawan]);

  // Unique id_marketing values actually present on this BAP
  const marketingIdsOnBap = useMemo(() => {
    const ids = allItems
      .map((it) => it.so?.kalkulasi?.id_marketing)
      .filter((id): id is number => id != null);
    const unique = Array.from(new Set(ids));
    console.log('[BAPMarketing] id_marketing on this BAP', unique);
    return unique;
  }, [allItems]);

  const marketingFilterOptions = useMemo(() => {
    const opts = marketingIdsOnBap.map((id) => {
      const embedded = allItems
        .filter((it) => it.so?.kalkulasi?.id_marketing === id)
        .map(embeddedMarketingName)
        .find(Boolean);
      return {
        value: String(id),
        label: embedded ?? nameLookup(id) ?? `Marketing #${id}`,
      };
    });
    return [{ value: '', label: 'Semua Marketing' }, ...opts];
  }, [marketingIdsOnBap, allItems, nameLookup]);

  // Step 1: marketing dropdown (default: everything)
  const marketingFiltered = useMemo(
    () =>
      marketingFilter
        ? allItems.filter(
            (it) =>
              String(it.so?.kalkulasi?.id_marketing ?? '') === marketingFilter,
          )
        : allItems,
    [allItems, marketingFilter],
  );

  // Step 2: search + status filter on top of the marketing filter
  const filter = useBapItemFilter(marketingFiltered, MARKETING_STATUS_OPTIONS);
  const visibleItems = filter.filtered;

  const actionableItems = visibleItems.filter(
    (it) =>
      !isMarketingApproved(it) &&
      (it.status ?? '').toLowerCase() === 'incoming',
  );

  // Only act on selected items that are still visible under the current filters
  const selectedVisible = selected.filter((id) =>
    actionableItems.some((it) => it.id === id),
  );

  function updateNote(id: number, val: string) {
    setNotes((p) => ({ ...p, [id]: val }));
  }

  function toggleSelect(id: number) {
    setSelected((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id],
    );
  }

  function toggleSelectAll() {
    if (selectedVisible.length === actionableItems.length) {
      setSelected([]);
    } else {
      setSelected(actionableItems.map((it) => it.id));
    }
  }

  async function approveOne(itemId: number, note: string) {
    await axios.put(
      `${import.meta.env.VITE_API_LINK}/fg/bapItemMarketing/approve/${itemId}`,
      { note: note.trim() },
      { withCredentials: true },
    );
  }

  async function handleApproveSingle(item: BapItem) {
    const note = notes[item.id] ?? '';
    if (!note.trim()) {
      alert('Note wajib diisi');
      return;
    }
    const confirmed = window.confirm(
      `Setujui (marketing) item ${item.no_jo} - ${item.produk}?`,
    );
    if (!confirmed) return;
    try {
      setActing((p) => ({ ...p, [item.id]: true }));
      await approveOne(item.id, note);
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

  async function handleBulkApprove() {
    if (!bulkNote.trim()) {
      alert('Note wajib diisi untuk approve terpilih');
      return;
    }
    if (selectedVisible.length === 0) return;
    const confirmed = window.confirm(
      `Setujui (marketing) ${selectedVisible.length} item terpilih dengan note yang sama?`,
    );
    if (!confirmed) return;
    try {
      setBulkSubmitting(true);
      for (const id of selectedVisible) {
        // hit one by one — no bulk endpoint
        // eslint-disable-next-line no-await-in-loop
        await approveOne(id, bulkNote);
      }
      setSelected([]);
      setBulkNote('');
      await fetchDetail();
      onChanged();
    } catch (err: unknown) {
      console.error(err);
      const error = err as { response?: { data?: { msg?: string } } };
      alert(error?.response?.data?.msg ?? 'Gagal menyetujui sebagian item');
      await fetchDetail();
      onChanged();
    } finally {
      setBulkSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full min-w-7xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-4 text-white rounded-t-2xl flex justify-between items-start flex-shrink-0">
          <div>
            <h3 className="text-base font-bold">
              {detail?.no_bap ?? 'Detail BAP'}
            </h3>
            <p className="text-cyan-100 text-xs mt-0.5">
              {detail
                ? `Dibuat ${fmtDateTime(detail.tgl_create)} — ${
                    allItems.length
                  } item`
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

        {/* Marketing filter */}
        {marketingIdsOnBap.length > 0 && (
          <div className="px-5 pt-3 pb-3 flex-shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-gray-50 border-b border-gray-100">
            <label className="text-xs font-semibold text-gray-600 flex-shrink-0">
              Filter Marketing:
            </label>
            <div className="w-full sm:w-72">
              <SearchableSelect
                placeholder="Semua Marketing"
                value={marketingFilter}
                onChange={(value) => setMarketingFilter(String(value))}
                options={marketingFilterOptions}
              />
            </div>
          </div>
        )}

        {/* Search + status filter */}
        {allItems.length > 0 && (
          <BapItemFilterBar
            search={filter.search}
            onSearchChange={filter.setSearch}
            status={filter.status}
            onStatusChange={filter.setStatus}
            statusOptions={filter.statusOptions}
            shown={visibleItems.length}
            total={allItems.length}
            isFiltering={filter.isFiltering}
            onReset={filter.reset}
          />
        )}

        {/* Bulk approve bar */}
        {actionableItems.length > 0 && (
          <div className="px-5 pt-3 flex-shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-cyan-50 border-b border-cyan-100 py-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 flex-shrink-0">
              <input
                type="checkbox"
                checked={
                  selectedVisible.length > 0 &&
                  selectedVisible.length === actionableItems.length
                }
                onChange={toggleSelectAll}
              />
              Pilih Semua ({selectedVisible.length}/{actionableItems.length})
            </label>
            <input
              type="text"
              value={bulkNote}
              onChange={(e) => setBulkNote(e.target.value)}
              placeholder="Note untuk item terpilih..."
              className="flex-1 rounded-lg border border-blue-200 bg-white px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
            <button
              onClick={handleBulkApprove}
              disabled={selectedVisible.length === 0 || bulkSubmitting}
              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
            >
              {bulkSubmitting
                ? 'Menyimpan...'
                : `Setujui Terpilih (${selectedVisible.length})`}
            </button>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 relative min-h-[200px]">
          {loading && <Loading />}
          {!loading && visibleItems.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">
              {allItems.length === 0
                ? 'Tidak ada item pada BAP ini'
                : 'Tidak ada item yang cocok dengan pencarian / filter'}
            </div>
          ) : (
            <div className="space-y-3">
              {visibleItems.map((item) => {
                const s = (item.status ?? '').toLowerCase();
                const marketingDone = isMarketingApproved(item);
                const canAct = !marketingDone && s === 'incoming';
                const isActing = !!acting[item.id];
                return (
                  <div
                    key={item.id}
                    className="rounded-xl border-2 border-gray-200 p-3 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      {canAct && (
                        <input
                          type="checkbox"
                          className="mt-1"
                          checked={selected.includes(item.id)}
                          onChange={() => toggleSelect(item.id)}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold text-violet-600 bg-violet-100 px-1.5 py-0.5 rounded">
                            {item.no_io}
                          </span>
                          <span className="text-[10px] font-semibold text-indigo-600">
                            {item.no_jo}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              marketingDone
                                ? 'bg-green-100 text-green-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {marketingDone
                              ? 'Sudah disetujui marketing'
                              : 'Menunggu approve marketing'}
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
                      </div>
                    </div>

                    {canAct && (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1 border-t border-gray-100">
                        <input
                          type="text"
                          value={notes[item.id] ?? ''}
                          onChange={(e) => updateNote(item.id, e.target.value)}
                          placeholder="Catatan approve..."
                          className="flex-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        />
                        <button
                          onClick={() => handleApproveSingle(item)}
                          disabled={isActing}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
                        >
                          {isActing ? 'Menyimpan...' : 'Setujui'}
                        </button>
                      </div>
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
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────

const BAPMarketing: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<BapListItem[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [detailId, setDetailId] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res: AxiosResponse<BapListResponse> = await axios.get(
        `${import.meta.env.VITE_API_LINK}/fg/bap`,
        { params: { page, limit }, withCredentials: true },
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

  return (
    <main>
      {isLoading && <Loading />}

      {detailId != null && (
        <MarketingBapDetailModal
          bapId={detailId}
          onClose={() => setDetailId(null)}
          onChanged={fetchData}
        />
      )}

      {/* Header */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden mb-4">
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-3 sm:p-4">
          <h2 className="text-white text-base sm:text-lg md:text-xl font-bold">
            BAP — Approval Marketing
          </h2>
          <p className="text-cyan-100 text-xs mt-1">
            Semua item ditampilkan secara default. Gunakan filter marketing,
            pencarian, dan filter status di dalam detail untuk mempersempit
            daftar item.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-3 sm:p-4 flex items-center justify-between gap-3 flex-wrap">
          <h3 className="text-white text-base sm:text-lg font-bold">
            Daftar BAP
          </h3>
          <span className="text-sm text-white bg-white bg-opacity-20 px-3 py-0.5 rounded-full font-semibold">
            {data.length} Record
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm min-w-[600px]">
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
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center text-gray-500 text-sm"
                  >
                    Tidak ada data BAP
                  </td>
                </tr>
              ) : (
                data.map((bap, idx) => (
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
                        Review
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
  );
};

export default BAPMarketing;
