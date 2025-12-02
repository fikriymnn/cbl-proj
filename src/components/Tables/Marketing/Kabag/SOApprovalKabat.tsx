// SOApprovalKabag.tsx
import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import { APIResponse, KalkulasiData, SOData } from '../SO/types/SOTypes';
import SODetailPopup from '../SO/SODetailPopup';
import SearchableSelect from '../../../../pages/MasterData/Marketing/SearchableSelect';
import Pagination from '@mui/material/Pagination/Pagination';
import Stack from '@mui/material/Stack';

const SOApprovalKabag: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [soData, setsoData] = useState<SOData[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof SOData | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });

  // Pagination states
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  // Filter states
  const [kalkulasiOptions, setKalkulasiOptions] = useState<
    Array<{
      value: string;
      label: string;
      data: KalkulasiData;
    }>
  >([]);
  const [selectedIOFilter, setSelectedIOFilter] = useState<string>('');
  const [kalkulasiLoading, setKalkulasiLoading] = useState(false);

  // Action states
  const [isDetailPopupOpen, setIsDetailPopupOpen] = useState<boolean>(false);
  const [selectedSO, setSelectedSO] = useState<SOData | null>(null);
  const [approveLoading, setApproveLoading] = useState<number | null>(null);
  const [rejectLoading, setRejectLoading] = useState<number | null>(null);

  const handleSearch = (): void => {
    setSearchTerm(searchInput);
    setPage(1); // Reset to first page on new search
  };

  const handleClearSearch = (): void => {
    setSearchInput('');
    setSearchTerm('');
    setSelectedIOFilter('');
    setPage(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleLimitChange = (newLimit: number): void => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  };

  useEffect(() => {
    fetchKalkulasiData();
  }, []);

  // Fetch SO data when filters or pagination change
  useEffect(() => {
    fetchsoData();
  }, [page, limit, searchTerm, selectedIOFilter]);

  const fetchsoData = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/marketing/so`;
    try {
      setLoading(true);

      const res: AxiosResponse<APIResponse<SOData[]>> = await axios.get(url, {
        params: {
          page: page,
          limit: limit,
          search: searchTerm,
          id_io: selectedIOFilter,
          status: 'requested',
        },
        withCredentials: true,
      });

      console.log('Fetched so data:', res.data);
      if (res.data.succes) {
        setsoData(res.data.data);
        if (res.data.total_page) {
          setTotalPages(res.data.total_page);
        }
      }
    } catch (error) {
      console.error('Error fetching so data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Kalkulasi data for filter
  const fetchKalkulasiData = async () => {
    const url = `${import.meta.env.VITE_API_LINK}/marketing/kalkulasi`;
    setKalkulasiLoading(true);
    try {
      const response = await axios.get(url, {
        // params: {
        //   is_io_active: true,
        // },
        withCredentials: true,
      });
      if (response.data.succes && response.data.data) {
        // Group by id_io and filter based on status_kalkulasi
        const groupedByIdIO = response.data.data.reduce(
          (acc: Record<string, KalkulasiData[]>, item: KalkulasiData) => {
            const idIO = item.id_io?.toString() || '';
            if (!acc[idIO]) {
              acc[idIO] = [];
            }
            acc[idIO].push(item);
            return acc;
          },
          {} as Record<string, KalkulasiData[]>,
        );

        const filteredData: KalkulasiData[] = [];
        Object.keys(groupedByIdIO).forEach((idIO) => {
          const items = groupedByIdIO[idIO];
          if (items.length > 1) {
            const baruItem = items.find(
              (item: KalkulasiData) =>
                item.status_kalkulasi?.toLowerCase() === 'baru',
            );
            if (baruItem) {
              filteredData.push(baruItem);
            } else {
              filteredData.push(items[0]);
            }
          } else {
            filteredData.push(items[0]);
          }
        });

        const options = filteredData.map((item: KalkulasiData) => ({
          value: item.id.toString(),
          label: `${item.no_io} - ${item.nama_customer}, ${item.nama_produk}`,
          data: item,
        }));
        setKalkulasiOptions(options);
      }
    } catch (error) {
      console.error('Error fetching Kalkulasi data:', error);
    } finally {
      setKalkulasiLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin Approve SO Ini?')) {
      try {
        setApproveLoading(id);
        const url = `${
          import.meta.env.VITE_API_LINK
        }/marketing/so/approve/${id}`;
        const res = await axios.put(
          url,
          {},
          {
            withCredentials: true,
          },
        );

        if (res.data.succes) {
          alert('SO berhasil di-approve!');
          fetchsoData();
        }
      } catch (error: any) {
        console.log(error);
        alert('Gagal approve SO. Silakan coba lagi.');
      } finally {
        setApproveLoading(null);
      }
    }
  };

  const handleReject = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin Reject SO Ini?')) {
      try {
        setRejectLoading(id);
        const url = `${
          import.meta.env.VITE_API_LINK
        }/marketing/so/reject/${id}`;
        const res = await axios.put(
          url,
          {},
          {
            withCredentials: true,
          },
        );

        if (res.data.succes) {
          alert('SO berhasil di-reject!');
          fetchsoData();
        }
      } catch (error: any) {
        console.log(error);
        alert('Gagal reject SO. Silakan coba lagi.');
      } finally {
        setRejectLoading(null);
      }
    }
  };

  const handleViewDetail = (item: SOData) => {
    setSelectedSO(item);
    setIsDetailPopupOpen(true);
  };

  const handleSort = (key: keyof SOData) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnKey: keyof SOData) => {
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

  const formatDate = (dateString: string): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  // Apply sorting to data
  const getSortedData = () => {
    let sorted = [...soData];

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <input
              type="text"
              placeholder="Search by No SO, Customer, Produk..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Filter by Nomor IO
            </label>
            <SearchableSelect
              placeholder={kalkulasiLoading ? 'Loading...' : 'All IO'}
              value={selectedIOFilter}
              onChange={(value) => {
                setSelectedIOFilter(String(value));
                setPage(1); // Reset to first page when filter changes
              }}
              options={kalkulasiOptions}
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={handleSearch}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors h-[42px]"
            >
              Search
            </button>
            {(searchTerm || selectedIOFilter) && (
              <button
                onClick={handleClearSearch}
                className="bg-gray-500 hover:bg-gray-600 text-red-500 px-4 py-2 rounded-md text-sm font-medium transition-colors h-[42px]"
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
                    ACTIONS
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('no_so')}
                      className="flex items-center hover:text-gray-700 focus:outline-none"
                    >
                      NO SO
                      {getSortIcon('no_so')}
                    </button>
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('no_io')}
                      className="flex items-center hover:text-gray-700 focus:outline-none"
                    >
                      NO IO
                      {getSortIcon('no_io')}
                    </button>
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('customer')}
                      className="flex items-center hover:text-gray-700 focus:outline-none"
                    >
                      CUSTOMER
                      {getSortIcon('customer')}
                    </button>
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PRODUK
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
                    <button
                      onClick={() => handleSort('po_qty')}
                      className="flex items-center hover:text-gray-700 focus:outline-none"
                    >
                      PO QTY
                      {getSortIcon('po_qty')}
                    </button>
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('total_harga')}
                      className="flex items-center hover:text-gray-700 focus:outline-none"
                    >
                      TOTAL HARGA
                      {getSortIcon('total_harga')}
                    </button>
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('tgl_input_po')}
                      className="flex items-center hover:text-gray-700 focus:outline-none"
                    >
                      TGL INPUT
                      {getSortIcon('tgl_input_po')}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-4 py-6 text-center text-gray-500 text-sm"
                    >
                      {searchTerm || selectedIOFilter
                        ? 'No SO found matching your filters'
                        : 'No SO data available'}
                    </td>
                  </tr>
                ) : (
                  sortedData.map((item, index) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                        {(page - 1) * limit + index + 1}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs font-medium">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => handleViewDetail(item)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs transition-colors"
                            title="View Details"
                          >
                            DETAIL
                          </button>
                          {item.status === 'requested' && (
                            <>
                              <button
                                onClick={() => handleApprove(item.id)}
                                className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs disabled:opacity-50"
                                disabled={approveLoading === item.id}
                              >
                                {approveLoading === item.id
                                  ? 'Loading...'
                                  : 'APPROVE'}
                              </button>
                              <button
                                onClick={() => handleReject(item.id)}
                                className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs disabled:opacity-50"
                                disabled={rejectLoading === item.id}
                              >
                                {rejectLoading === item.id
                                  ? 'Loading...'
                                  : 'REJECT'}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap flex flex-col gap-1 justify-center">
                        <span
                          className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded font-medium"
                          title={item.no_so}
                        >
                          {item.no_so
                            ? item.no_so.substring(0, 12) +
                              (item.no_so.length > 12 ? '...' : '')
                            : '-'}
                        </span>
                        <span
                          className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded font-medium"
                          title={item.label}
                        >
                          {item.label
                            ? item.label.substring(0, 12) +
                              (item.label.length > 12 ? '...' : '')
                            : '-'}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <span
                          className="bg-purple-100 text-purple-800 text-xs px-1.5 py-0.5 rounded font-medium"
                          title={item.no_io}
                        >
                          {item.no_io
                            ? item.no_io.substring(0, 10) +
                              (item.no_io.length > 10 ? '...' : '')
                            : '-'}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-xs text-gray-900 max-w-32">
                        <span title={item.customer}>
                          {item.customer
                            ? item.customer.substring(0, 15) +
                              (item.customer.length > 15 ? '...' : '')
                            : '-'}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-xs text-gray-900 max-w-32">
                        <span title={item.produk}>
                          {item.produk
                            ? item.produk.substring(0, 15) +
                              (item.produk.length > 15 ? '...' : '')
                            : '-'}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded font-medium uppercase ${
                            item.status === 'draft'
                              ? 'bg-yellow-100 text-yellow-800'
                              : item.status === 'pending'
                              ? 'bg-orange-100 text-orange-800'
                              : item.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : item.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                          title={item.status}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                        {item.po_qty?.toLocaleString('id-ID') || '0'}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                        <span title={formatCurrency(item.total_harga)}>
                          {formatCurrency(item.total_harga)}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                        {formatDate(item.tgl_input_po)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination with Rows per page selector */}
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

      {/* Detail Popup */}
      <SODetailPopup
        isOpen={isDetailPopupOpen}
        onClose={() => {
          setIsDetailPopupOpen(false);
          setSelectedSO(null);
        }}
        data={selectedSO}
      />
    </div>
  );
};

export default SOApprovalKabag;
