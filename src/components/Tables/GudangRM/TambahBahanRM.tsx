import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  APIResponse,
  StatusTiket,
  TambahBahanPersiapan,
} from '../Produksi/TambahBahan/types/Tambahbahan.types';
import {
  formatDateTime,
  getStatusColor,
  statusLabel,
  truncateText,
} from '../Produksi/TambahBahan/Tambahbahanutils';

const API_BASE = import.meta.env.VITE_API_LINK;

type SortDirection = 'asc' | 'desc';

// Gudang RM only acts on requests that have already passed QC
// (status === 'approve qc'); everything else is view-only here.
const TambahBahanRM: React.FC = () => {
  const [list, setList] = useState<TambahBahanPersiapan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusTiket, setStatusTiket] = useState<StatusTiket>('incoming');
  const [searchInput, setSearchInput] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortKey, setSortKey] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  const [activeItem, setActiveItem] = useState<TambahBahanPersiapan | null>(
    null,
  );
  const [noteGudang, setNoteGudang] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get<APIResponse<TambahBahanPersiapan[]>>(
        `${API_BASE}/gudangRM/tambahBahanPersiapan`,
        {
          params: { status_tiket: statusTiket },
          withCredentials: true,
        },
      );
      setList(res.data.data || []);
    } catch (error) {
      console.error('Error fetching tambah bahan list:', error);
      toast.error('Gagal mengambil data tambah bahan');
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [statusTiket]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const openRespond = (item: TambahBahanPersiapan) => {
    setActiveItem(item);
    setNoteGudang(item.note_gudang || '');
  };

  const closeRespond = () => {
    setActiveItem(null);
    setNoteGudang('');
  };

  const isActionable = (item: TambahBahanPersiapan) =>
    item.status?.toLowerCase() === 'approve qc';

  const handleApprove = async () => {
    if (!activeItem) return;
    try {
      setActionLoading(true);
      await axios.put(
        `${API_BASE}/gudangRM/tambahBahanPersiapan/approveGudang/${activeItem.id}`,
        { note_gudang: noteGudang },
        { withCredentials: true },
      );
      toast.success('Permintaan berhasil disetujui Gudang');
      closeRespond();
      fetchList();
    } catch (error: any) {
      console.error('Error approving gudang:', error);
      toast.error(
        error.response?.data?.message || 'Gagal menyetujui permintaan',
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!activeItem) return;
    if (!noteGudang.trim()) {
      toast.error('Mohon isi catatan alasan penolakan');
      return;
    }
    try {
      setActionLoading(true);
      await axios.put(
        `${API_BASE}/gudangRM/tambahBahanPersiapan/rejectGudang/${activeItem.id}`,
        { note_gudang: noteGudang },
        { withCredentials: true },
      );
      toast.success('Permintaan ditolak');
      closeRespond();
      fetchList();
    } catch (error: any) {
      console.error('Error rejecting gudang:', error);
      toast.error(error.response?.data?.message || 'Gagal menolak permintaan');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSearch = () => {
    setSearchTerm(searchInput);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchTerm('');
    setPage(1);
  };

  const handleSort = (field: string) => {
    if (sortKey === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (key: string) => {
    if (sortKey !== key) {
      return (
        <svg
          className="w-3 h-3 ml-1 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 9l4-4 4 4m0 6l-4 4-4-4"
          />
        </svg>
      );
    }
    return sortDirection === 'asc' ? (
      <svg
        className="w-3 h-3 ml-1 text-blue-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 15l7-7 7 7"
        />
      </svg>
    ) : (
      <svg
        className="w-3 h-3 ml-1 text-blue-600"
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
    );
  };

  const filteredData = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let data = [...list];
    if (term) {
      data = data.filter(
        (item) =>
          item.no_jo?.toLowerCase().includes(term) ||
          item.customer?.toLowerCase().includes(term) ||
          item.produk?.toLowerCase().includes(term) ||
          item.nama_kertas?.toLowerCase().includes(term),
      );
    }
    data.sort((a, b) => {
      const aValue = (a as any)[sortKey];
      const bValue = (b as any)[sortKey];
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return data;
  }, [list, searchTerm, sortKey, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / limit));
  const pagedData = filteredData.slice((page - 1) * limit, page * limit);

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  return (
    <div className="">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-2 flex-1">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search NO JO, Customer, Produk, Kertas..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              />
              <svg
                className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
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
            <div className="flex gap-2">
              <button
                onClick={handleSearch}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Search
              </button>
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Status Tiket Tabs */}
        <div className="flex gap-2">
          {(['incoming', 'history'] as StatusTiket[]).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setStatusTiket(tab);
                setPage(1);
              }}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors capitalize ${
                statusTiket === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                  NO
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ACTION
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('no_jo')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    NO JO {getSortIcon('no_jo')}
                  </button>
                </th>

                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  KERTAS
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  QTY
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NOTE QC
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TANGGAL
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  STATUS
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-3 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <p className="mt-2 text-sm text-gray-600">
                        Loading data...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : pagedData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-3 py-8 text-center">
                    <p className="text-sm text-gray-500">
                      {searchTerm
                        ? 'Tidak ada data yang sesuai dengan pencarian'
                        : 'Belum ada permintaan tambah bahan'}
                    </p>
                  </td>
                </tr>
              ) : (
                pagedData.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-900">
                      {(page - 1) * limit + index + 1}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs font-medium">
                      {isActionable(item) ? (
                        <button
                          onClick={() => openRespond(item)}
                          className="text-white bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-xs transition-colors"
                        >
                          Respon
                        </button>
                      ) : (
                        <button
                          onClick={() => openRespond(item)}
                          className="text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-xs transition-colors"
                        >
                          Detail
                        </button>
                      )}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs font-medium text-gray-900">
                      {item.no_jo || '-'}
                    </td>

                    <td className="px-3 py-3 text-xs text-gray-900">
                      <div className="max-w-xs" title={item.nama_kertas}>
                        {truncateText(item.nama_kertas, 500)}
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-900">
                      {item.qty_tambah_bahan?.toLocaleString() || 0}
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-900">
                      <div className="max-w-xs" title={item.note_qc || ''}>
                        {truncateText(item.note_qc, 500)}
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-900">
                      {formatDateTime(item.createdAt)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          item.status,
                        )}`}
                      >
                        {statusLabel(item.status)}
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
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 mt-6 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Rows per page:</span>
          <div className="flex gap-2">
            {[10, 25, 50, 100].map((pageSize) => (
              <button
                key={pageSize}
                onClick={() => handleLimitChange(pageSize)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  limit === pageSize
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {pageSize}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1 text-sm rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Prev
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1 text-sm rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      {/* Respond / Detail Modal */}
      {activeItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-stroke">
              <h3 className="text-base font-bold text-gray-800">
                Respon Gudang - Tambah Bahan Persiapan
              </h3>
              <button
                onClick={closeRespond}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                &times;
              </button>
            </div>

            <div className="flex flex-col gap-3 px-5 py-4">
              <div className="grid grid-cols-3 py-1">
                <div>
                  <p className="text-slate-600 text-[14px] dark:text-white">
                    Nomor JO
                  </p>

                  <p className="text-slate-600 text-[14px] dark:text-white">
                    Kertas
                  </p>
                  <p className="text-slate-600 text-[14px] dark:text-white">
                    Qty
                  </p>
                  <p className="text-slate-600 text-[14px] dark:text-white">
                    Note
                  </p>
                  <p className="text-slate-600 text-[14px] dark:text-white">
                    Note QC
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-slate-600 text-[14px] dark:text-white">
                    : {activeItem.no_jo}
                  </p>

                  <p className="text-slate-600 text-[14px] dark:text-white">
                    : {activeItem.nama_kertas}
                  </p>
                  <p className="text-slate-600 text-[14px] dark:text-white">
                    : {activeItem.qty_tambah_bahan}
                  </p>
                  <p className="text-slate-600 text-[14px] dark:text-white">
                    : {activeItem.note}
                  </p>
                  <p className="text-slate-600 text-[14px] dark:text-white">
                    : {activeItem.note_qc || '-'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-black text-xs font-bold">
                  Note Gudang
                </label>
                <textarea
                  value={noteGudang}
                  onChange={(e) => setNoteGudang(e.target.value)}
                  rows={3}
                  readOnly={!isActionable(activeItem)}
                  placeholder="Catatan Gudang"
                  className={`w-full px-3 py-2 border-2 border-stroke rounded-md text-xs ${
                    !isActionable(activeItem) ? 'bg-gray-50' : ''
                  }`}
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-600">Status:</span>
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                    activeItem.status,
                  )}`}
                >
                  {statusLabel(activeItem.status)}
                </span>
              </div>

              {!isActionable(activeItem) && (
                <p className="text-xs text-gray-500">
                  {activeItem.status?.toLowerCase() === 'request qc'
                    ? 'Menunggu approval QC terlebih dahulu.'
                    : 'Permintaan ini sudah tidak dapat diproses lagi.'}
                </p>
              )}
            </div>

            {isActionable(activeItem) && (
              <div className="flex gap-2 px-5 py-4 border-t border-stroke">
                <button
                  onClick={handleReject}
                  disabled={actionLoading}
                  className="flex-1 h-9 text-center text-white text-xs font-bold rounded-md bg-red-500 hover:bg-red-600 disabled:opacity-50"
                >
                  {actionLoading ? 'Memproses...' : 'Reject'}
                </button>
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="flex-1 h-9 text-center text-white text-xs font-bold rounded-md bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Memproses...' : 'Approve'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TambahBahanRM;
