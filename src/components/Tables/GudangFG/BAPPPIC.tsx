// BAPPPIC.tsx
// PPIC view: items are read-only here (marketing/management own the
// approve/reject actions). PPIC's only job is to close out the ticket via
// /fg/bap/done/:id, and only once every item has been actioned
// (i.e. nothing left with status "incoming").

import React, { useCallback, useEffect, useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import Loading from '../../Loading';
import { Pagination, Stack } from '@mui/material';
import {
  BapDetail,
  BapDetailResponse,
  BapListItem,
  BapListResponse,
} from './types/BapTypes';
import {
  bapStatusBadgeClass,
  fmtDateTime,
  fmtQty,
  itemStatusBadgeClass,
  itemStatusLabel,
} from './bapHelpers';

// ─── Detail / Finish Modal ──────────────────────────────────────────────────

function PPICBapDetailModal({
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

  const items = detail?.bap_item ?? [];
  const hasIncoming = items.some(
    (it) => (it.status ?? '').toLowerCase() === 'incoming',
  );
  const alreadyDone = (detail?.status ?? '').toLowerCase() === 'done';
  const canFinish = !alreadyDone && items.length > 0 && !hasIncoming;

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
            <h3 className="text-base font-bold">
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

        {!loading && hasIncoming && (
          <div className="px-5 py-2.5 text-xs text-amber-700 bg-amber-50 border-b border-amber-100 flex-shrink-0">
            Masih ada item berstatus "Menunggu". BAP baru bisa diselesaikan
            setelah semua item diaksi oleh marketing/management.
          </div>
        )}

        {/* Body — read only */}
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
                return (
                  <div
                    key={item.id}
                    className="rounded-xl border-2 border-gray-200 p-3"
                  >
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
                      <span className="font-bold">{fmtQty(item.po_qty)}</span> —
                      Jumlah:{' '}
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

// ─── Main Component ───────────────────────────────────────────────────────

const BAPPPIC: React.FC = () => {
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
        <PPICBapDetailModal
          bapId={detailId}
          onClose={() => setDetailId(null)}
          onChanged={fetchData}
        />
      )}

      {/* Header */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden mb-4">
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-3 sm:p-4">
          <h2 className="text-white text-base sm:text-lg md:text-xl font-bold">
            BAP — PPIC
          </h2>
          <p className="text-cyan-100 text-xs mt-1">
            Selesaikan tiket BAP setelah semua item selesai diaksi (tidak ada
            lagi yang menunggu).
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
                        Lihat Detail
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

export default BAPPPIC;
