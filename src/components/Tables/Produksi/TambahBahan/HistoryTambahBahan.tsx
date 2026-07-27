import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { APIResponse } from './types/Tambahbahan.types';
import {
  formatDateTime,
  getStatusColor,
  statusLabel,
  truncateText,
} from './Tambahbahanutils';
import TambahBahanDetailModal, {
  TambahBahanDetailType,
} from './TambahBahanDetailModal';
import { TambahBahanPemakaian } from '../LKH/InputLKH/Tambahbahan.types';
import { TambahBahanPersiapan } from './types/Tambahbahan.types';

const API_BASE = import.meta.env.VITE_API_LINK;

type SortDirection = 'asc' | 'desc';
type TicketType = 'persiapan' | 'pemakaian';

const HistoryTambahBahan: React.FC = () => {
  const [ticketType, setTicketType] = useState<TicketType>('pemakaian');

  // Table state
  const [listPersiapan, setListPersiapan] = useState<TambahBahanPersiapan[]>(
    [],
  );
  const [listPemakaian, setListPemakaian] = useState<TambahBahanPemakaian[]>(
    [],
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [searchInput, setSearchInput] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortKey, setSortKey] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  // Detail modal (get by id) — works for both types
  const [detailId, setDetailId] = useState<number | null>(null);
  const [detailType, setDetailType] =
    useState<TambahBahanDetailType>('pemakaian');
  const [showDetail, setShowDetail] = useState(false);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint =
        ticketType === 'persiapan'
          ? `${API_BASE}/gudangRM/tambahBahanPersiapan`
          : `${API_BASE}/gudangRM/tambahBahanPemakaian`;
      const res = await axios.get<APIResponse<any[]>>(endpoint, {
        params: { status_tiket: 'history' },
        withCredentials: true,
      });
      if (ticketType === 'persiapan') setListPersiapan(res.data.data || []);
      else setListPemakaian(res.data.data || []);
    } catch (error) {
      console.error('Error fetching tambah bahan history:', error);
      toast.error('Gagal mengambil data riwayat tambah bahan');
      if (ticketType === 'persiapan') setListPersiapan([]);
      else setListPemakaian([]);
    } finally {
      setLoading(false);
    }
  }, [ticketType]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  useEffect(() => {
    setPage(1);
    setSearchInput('');
    setSearchTerm('');
  }, [ticketType]);

  const openDetail = (id: number) => {
    setDetailType(ticketType);
    setDetailId(id);
    setShowDetail(true);
  };
  const closeDetail = () => {
    setShowDetail(false);
    setDetailId(null);
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

  const rawList = ticketType === 'persiapan' ? listPersiapan : listPemakaian;

  const filteredData = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let data = [...rawList] as any[];
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
      const aValue = a[sortKey];
      const bValue = b[sortKey];
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
  }, [rawList, searchTerm, sortKey, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / limit));
  const pagedData = filteredData.slice((page - 1) * limit, page * limit);

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  return (
    <div className="">
      {/* Header Section */}
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

        {/* Ticket type tabs */}
        <div className="flex gap-2 mb-2">
          {(
            [
              { key: 'pemakaian', label: 'Pemakaian' },
              { key: 'persiapan', label: 'Persiapan' },
            ] as { key: TicketType; label: string }[]
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setTicketType(tab.key)}
              className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
                ticketType === tab.key
                  ? 'bg-cyan-700 text-white'
                  : 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100'
              }`}
            >
              {tab.label}
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
                  NOTE
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('createdAt')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    TANGGAL {getSortIcon('createdAt')}
                  </button>
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  STATUS
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DETAIL
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center">
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
                  <td colSpan={8} className="px-3 py-8 text-center">
                    <p className="text-sm text-gray-500">
                      {searchTerm
                        ? 'Tidak ada data yang sesuai dengan pencarian'
                        : 'Belum ada riwayat tambah bahan'}
                    </p>
                  </td>
                </tr>
              ) : (
                pagedData.map((item: any, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-900">
                      {(page - 1) * limit + index + 1}
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
                      {item.qty_tambah_bahan_lp?.toLocaleString() || 0} LP
                      <br />
                      <span className="text-gray-400 text-[10px]">
                        {item.qty_tambah_bahan_druk?.toLocaleString() || 0} Druk
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-900">
                      <div className="max-w-xs" title={item.note}>
                        {truncateText(item.note, 500)}
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
                    <td className="px-3 py-3 whitespace-nowrap text-xs">
                      <button
                        onClick={() => openDetail(item.id)}
                        className="text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-xs transition-colors"
                      >
                        Detail
                      </button>
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

      {/* Get-by-id detail modal (works for both persiapan & pemakaian) */}
      <TambahBahanDetailModal
        show={showDetail}
        type={detailType}
        id={detailId}
        onClose={closeDetail}
      />
    </div>
  );
};

export default HistoryTambahBahan;
