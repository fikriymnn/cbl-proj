// SOPerubahanHargaHistory.tsx
import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import {
  SOPerubahanHargaData,
  SOPerubahanHargaAPIResponse,
} from '../types/SOPerubahanHargaTypes';
import Pagination from '@mui/material/Pagination/Pagination';
import Stack from '@mui/material/Stack';

const SOPerubahanHargaHistory: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<SOPerubahanHargaData[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof SOPerubahanHargaData | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });

  useEffect(() => {
    fetchData();
  }, [page, limit, searchTerm, statusFilter]);

  const fetchData = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/marketing/soPerubahanHarga`;
    try {
      setLoading(true);
      const res: AxiosResponse<
        SOPerubahanHargaAPIResponse<SOPerubahanHargaData[]>
      > = await axios.get(url, {
        params: {
          page: page,
          limit: limit,
          status: statusFilter,
          search: searchTerm,
        },
        withCredentials: true,
      });

      console.log('Fetched SO Perubahan Harga history:', res.data);
      if (res.data.succes) {
        setData(res.data.data);
        if (res.data.total_page) {
          setTotalPages(res.data.total_page);
        }
      }
    } catch (error) {
      console.error('Error fetching SO Perubahan Harga history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (): void => {
    setSearchTerm(searchInput);
    setPage(1);
  };

  const handleClearSearch = (): void => {
    setSearchInput('');
    setSearchTerm('');
    setStatusFilter('');
    setPage(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleLimitChange = (newLimit: number): void => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleSort = (key: keyof SOPerubahanHargaData) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnKey: keyof SOPerubahanHargaData) => {
    if (sortConfig.key !== columnKey) {
      return <span className="ml-1 text-gray-400">⇅</span>;
    }
    return sortConfig.direction === 'asc' ? (
      <span className="ml-1">↑</span>
    ) : (
      <span className="ml-1">↓</span>
    );
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getSortedData = () => {
    let sorted = [...data];

    if (sortConfig.key) {
      sorted.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc'
            ? aValue - bValue
            : bValue - aValue;
        }

        return 0;
      });
    }

    return sorted;
  };

  const sortedData = getSortedData();

  return (
    <div className="">
      {/* Search and Filter Bar */}
      <div className="mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <input
              type="text"
              placeholder="Search by No SO, Customer..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Filter Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={handleSearch}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors h-[42px]"
            >
              Search
            </button>
            {(searchTerm || statusFilter) && (
              <button
                onClick={handleClearSearch}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors h-[42px]"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        /* Table */
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    NO
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NO SO
                  </th>

                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('harga_awal')}
                      className="flex items-center hover:text-gray-700 focus:outline-none"
                    >
                      HARGA AWAL
                      {getSortIcon('harga_awal')}
                    </button>
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('harga_perubahan')}
                      className="flex items-center hover:text-gray-700 focus:outline-none"
                    >
                      HARGA PERUBAHAN
                      {getSortIcon('harga_perubahan')}
                    </button>
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SELISIH
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NOTE
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center hover:text-gray-700 focus:outline-none"
                    >
                      STATUS
                      {getSortIcon('status')}
                    </button>
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NOTE
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={13}
                      className="px-4 py-6 text-center text-gray-500 text-sm"
                    >
                      {searchTerm || statusFilter
                        ? 'No data found matching your filters'
                        : 'No history data available'}
                    </td>
                  </tr>
                ) : (
                  sortedData.map((item, index) => {
                    const selisih = item.harga_perubahan - item.harga_awal;
                    const persentaseValue = (selisih / item.harga_awal) * 100;
                    const persentase = persentaseValue.toFixed(2);

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                          {(page - 1) * limit + index + 1}
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap">
                          <span className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded font-medium">
                            {item.no_so || '-'}
                          </span>
                        </td>

                        <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                          {formatCurrency(item.harga_awal)}
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                          {formatCurrency(item.harga_perubahan)}
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-xs">
                          <div className="flex flex-col">
                            <span
                              className={`font-semibold ${
                                selisih > 0
                                  ? 'text-green-600'
                                  : selisih < 0
                                  ? 'text-red-600'
                                  : 'text-gray-600'
                              }`}
                            >
                              {selisih > 0 ? '+' : ''}
                              {formatCurrency(selisih)}
                            </span>
                            <span
                              className={`text-xs ${
                                selisih > 0
                                  ? 'text-green-600'
                                  : selisih < 0
                                  ? 'text-red-600'
                                  : 'text-gray-600'
                              }`}
                            >
                              ({persentaseValue > 0 ? '+' : ''}
                              {persentase}%)
                            </span>
                          </div>
                        </td>
                        <td className="px-2 py-2 text-xs text-gray-900 max-w-40">
                          <span title={item.note}>
                            {item.note.length > 50
                              ? item.note.substring(0, 50) + '...'
                              : item.note}
                          </span>
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap">
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded font-medium uppercase ${
                              item.status === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : item.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-xs text-gray-900 max-w-40">
                          {item.status === 'rejected' && item.note_reject ? (
                            <span
                              className="text-red-600"
                              title={item.note_reject}
                            >
                              {item.note_reject.length > 50
                                ? item.note_reject.substring(0, 50) + '...'
                                : item.note_reject}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
          <Stack spacing={2}>
            <Pagination
              count={totalPages}
              page={page}
              color="primary"
              onChange={(e, i) => {
                setPage(i);
              }}
            />
          </Stack>
        </div>
      </div>
    </div>
  );
};
export default SOPerubahanHargaHistory;
