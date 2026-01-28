// BOMCreate.tsx (Main Entry Point)
import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import BOMManagementModal from './BOMManagementModal';
import { SOData } from './Types/bom.types';
import Pagination from '@mui/material/Pagination/Pagination';
import Stack from '@mui/material/Stack';

type SortDirection = 'asc' | 'desc';

interface APIResponse<T> {
  succes: boolean;
  data: T;
  total_page?: number;
}

const BOMCreate: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [soData, setSOData] = useState<SOData[]>([]);
  const [sortKey, setSortKey] = useState<string>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedSOId, setSelectedSOId] = useState<number | null>(null);
  const [selectedIOId, setSelectedIOId] = useState<number | null>(null);
  const [showBOMModal, setShowBOMModal] = useState<boolean>(false);

  // Pagination and Search states
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');

  // NEW: BOM Status Filter
  const [statusBomFilter, setStatusBomFilter] = useState<string>('');

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

  const handleSearch = (): void => {
    setSearchTerm(searchInput);
    setPage(1); // Reset to first page on new search
  };

  const handleClearSearch = (): void => {
    setSearchInput('');
    setSearchTerm('');
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

  // NEW: Handle BOM Status Filter Change
  const handleStatusBomChange = (status: string): void => {
    setStatusBomFilter(status);
    setPage(1); // Reset to first page when changing filter
  };

  const fetchSOData = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/marketing/so`;
    try {
      setLoading(true);
      const res: AxiosResponse<APIResponse<SOData[]>> = await axios.get(url, {
        params: {
          status: 'history',
          page: page,
          limit: limit,
          search: searchTerm,
          status_bom: statusBomFilter,
        },
        withCredentials: true,
      });
      console.log('Fetched SO data:', res.data);
      if (res.data.succes) {
        setSOData(res.data.data || []);
        if (res.data.total_page) {
          setTotalPages(res.data.total_page);
        }
      }
    } catch (error) {
      console.error('Error fetching SO data:', error);
      setSOData([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'baru':
        return 'bg-blue-100 text-blue-800';
      case 'repeat perubahan':
        return 'bg-green-100 text-green-800';
      case 'repeat':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor2 = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'requested':
        return 'bg-orange-100 text-orange-800 border border-orange-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'history':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'pending':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  // Helper function to check if BOM exists
  const hasBOM = (item: SOData): boolean => {
    return item.bom !== null && item.bom !== undefined && item.bom.id !== null;
  };

  // Helper function to get BOM status badge
  const getBOMStatusBadge = (item: SOData) => {
    if (hasBOM(item)) {
      return (
        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 border border-green-200 font-medium">
          ✓ BOM Created
        </span>
      );
    }
    return (
      <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-800 border border-orange-200 font-medium">
        ⚠ No BOM
      </span>
    );
  };

  // Helper function to check if EDIT button should be shown
  const canEditBOM = (item: SOData): boolean => {
    if (!hasBOM(item)) return true;
    const status = item.bom?.status_proses?.toLowerCase();
    return (
      status === 'draft' ||
      status === 'reject kabag ' ||
      status === 'kembali dari bom ppic' ||
      status === 'done'
    );
  };

  const NextProcessKabag = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin Next Process BOM Ini?')) {
      try {
        const url = `${import.meta.env.VITE_API_LINK}/ppic/bom/request/${id}`;
        const res = await axios.put(
          url,
          {},
          {
            withCredentials: true,
          },
        );
        fetchSOData();
        alert('BOM berhasil di-request!');
      } catch (error: any) {
        console.log(error);
        alert('Gagal request BOM. Silakan coba lagi.');
      }
    }
  };

  useEffect(() => {
    fetchSOData();
  }, [page, limit, searchTerm, statusBomFilter]);

  const sortedData = React.useMemo(() => {
    const sorted = [...soData].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      // Special handling for bom-related sorting
      if (sortKey === 'bom') {
        aValue = hasBOM(a) ? 1 : 0;
        bValue = hasBOM(b) ? 1 : 0;
      } else if (sortKey === 'status_proses') {
        aValue = a.bom?.status_proses || '';
        bValue = b.bom?.status_proses || '';
      } else if (sortKey === 'no_bom') {
        // ✅ Add sorting for no_bom
        aValue = a.bom?.no_bom || '';
        bValue = b.bom?.no_bom || '';
      } else {
        aValue = a[sortKey as keyof SOData];
        bValue = b[sortKey as keyof SOData];
      }

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
    return sorted;
  }, [soData, sortKey, sortDirection]);

  const handleManageBOM = (so: SOData) => {
    setSelectedIOId(so.id_io);
    setSelectedSOId(so.id);
    setShowBOMModal(true);
  };

  return (
    <div className="">
      {/* Search Bar and Filters */}
      <div className="mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <input
              type="text"
              placeholder="Search by No SO, No IO, Customer, Produk..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* BOM Status Filter */}
          <div>
            <label className="block text-sm font-medium mb-1">BOM Status</label>
            <select
              value={statusBomFilter}
              onChange={(e) => handleStatusBomChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="draft">Draft</option>
              <option value="history">History</option>
            </select>
          </div>
        </div>

        <div className="flex items-end gap-2 mt-4">
          <button
            onClick={handleSearch}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors h-[42px]"
          >
            Search
          </button>
          {(searchTerm || statusBomFilter) && (
            <button
              onClick={() => {
                handleClearSearch();
                setStatusBomFilter('');
              }}
              className="bg-gray-500 hover:bg-gray-600 text-red-600 px-4 py-2 rounded-md text-sm font-medium transition-colors h-[42px]"
            >
              Clear All Filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                {/* NO */}
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                  <button className="flex items-center hover:text-gray-700 focus:outline-none">
                    NO
                  </button>
                </th>

                {/* ACTION */}
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  ACTION
                </th>

                {/* ✅ NO BOM - NEW COLUMN */}
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('no_bom')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    NO BOM
                    {getSortIcon('no_bom')}
                  </button>
                </th>

                {/* ✅ BOM INFO - MOVED HERE */}
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('bom')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    BOM INFO
                    {getSortIcon('bom')}
                  </button>
                </th>

                {/* NO SO */}
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('no_so')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    NO SO
                    {getSortIcon('no_so')}
                  </button>
                </th>

                {/* NO IO */}
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('no_io')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    NO IO
                    {getSortIcon('no_io')}
                  </button>
                </th>

                {/* CUSTOMER */}
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('customer')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    CUSTOMER
                    {getSortIcon('customer')}
                  </button>
                </th>

                {/* PRODUK */}
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('produk')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    PRODUK
                    {getSortIcon('produk')}
                  </button>
                </th>

                {/* STATUS JO */}
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('status_jo')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    STATUS JO
                    {getSortIcon('status_jo')}
                  </button>
                </th>

                {/* TGL BUAT */}
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('tgl_pembuatan_so')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    TGL BUAT
                    {getSortIcon('tgl_pembuatan_so')}
                  </button>
                </th>

                {/* STATUS */}
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('status_proses')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    STATUS
                    {getSortIcon('status_proses')}
                  </button>
                </th>

                {/* ACTIVE */}
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('is_active')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    ACTIVE
                    {getSortIcon('is_active')}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={12} className="px-4 py-6 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : sortedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={12}
                    className="px-4 py-6 text-center text-gray-500 text-sm"
                  >
                    {searchTerm || statusBomFilter
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
                    {/* NO */}
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                      {(page - 1) * limit + index + 1}
                    </td>

                    {/* ACTION */}
                    <td className="px-2 py-2 whitespace-nowrap text-xs font-medium">
                      <div className="flex flex-col gap-1">
                        {canEditBOM(item) && (
                          <button
                            onClick={() => handleManageBOM(item)}
                            className={`${
                              hasBOM(item)
                                ? 'bg-blue-500 hover:bg-blue-600'
                                : 'bg-green-500 hover:bg-green-600'
                            } text-white px-3 py-1 rounded text-xs transition-colors`}
                            title={hasBOM(item) ? 'Edit BOM' : 'Create BOM'}
                          >
                            {hasBOM(item) ? 'EDIT BOM' : 'CREATE BOM'}
                          </button>
                        )}

                        {hasBOM(item) &&
                          (item.bom?.status_proses === 'draft' ||
                            item.bom?.status_proses === 'reject kabag' ||
                            item.bom?.status_proses ===
                              'kembali dari BOM PPIC') && (
                            <button
                              onClick={() => NextProcessKabag(item.bom!.id)}
                              className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-xs transition-colors"
                              title="Next Process"
                            >
                              NEXT PROCESS
                            </button>
                          )}
                      </div>
                    </td>

                    {/* ✅ NO BOM - NEW COLUMN */}
                    <td className="px-2 py-2 whitespace-nowrap">
                      {item.bom?.no_bom ? (
                        <span
                          className="bg-indigo-100 text-indigo-800 text-xs px-1.5 py-0.5 rounded font-medium"
                          title={item.bom.no_bom}
                        >
                          {item.bom.no_bom.substring(0, 20) +
                            (item.bom.no_bom.length > 20 ? '...' : '')}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>

                    {/* ✅ BOM INFO - MOVED HERE */}
                    <td className="px-2 py-2 whitespace-nowrap">
                      {getBOMStatusBadge(item)}
                    </td>

                    {/* NO SO */}
                    <td className="px-2 py-2 whitespace-nowrap">
                      <span
                        className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded font-medium"
                        title={item.no_so}
                      >
                        {item.no_so
                          ? item.no_so.substring(0, 20) +
                            (item.no_so.length > 20 ? '...' : '')
                          : '-'}
                      </span>
                    </td>

                    {/* NO IO */}
                    <td className="px-2 py-2 whitespace-nowrap">
                      <span
                        className="bg-purple-100 text-purple-800 text-xs px-1.5 py-0.5 rounded font-medium"
                        title={item.no_io}
                      >
                        {item.no_io
                          ? item.no_io.substring(0, 20) +
                            (item.no_io.length > 20 ? '...' : '')
                          : '-'}
                      </span>
                    </td>

                    {/* CUSTOMER */}
                    <td className="px-2 py-2 text-xs text-gray-900 max-w-32">
                      <span title={item.customer}>
                        {item.customer
                          ? item.customer.substring(0, 50) +
                            (item.customer.length > 50 ? '...' : '')
                          : '-'}
                      </span>
                    </td>

                    {/* PRODUK */}
                    <td className="px-2 py-2 text-xs text-gray-900 max-w-32">
                      <span title={item.produk}>
                        {item.produk
                          ? item.produk.substring(0, 90) +
                            (item.produk.length > 90 ? '...' : '')
                          : '-'}
                      </span>
                    </td>

                    {/* STATUS JO */}
                    <td className="px-2 py-2 whitespace-nowrap">
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded font-medium ${getStatusColor(
                          item.status_jo,
                        )}`}
                        title={item.status_jo}
                      >
                        {item.status_jo
                          ? item.status_jo.substring(0, 8) +
                            (item.status_jo.length > 8 ? '...' : '')
                          : '-'}
                      </span>
                    </td>

                    {/* TGL BUAT */}
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                      <span title={item.tgl_pembuatan_so}>
                        {formatDate(item.tgl_pembuatan_so)}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td className="px-2 py-2 whitespace-nowrap">
                      {hasBOM(item) && item.bom?.status_proses ? (
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded font-medium ${getStatusColor2(
                            item.bom.status_proses,
                          )}`}
                          title={item.bom.status_proses}
                        >
                          {item.bom.status_proses.substring(0, 8) +
                            (item.bom.status_proses.length > 8 ? '...' : '')}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>

                    {/* ACTIVE */}
                    <td className="px-2 py-2 whitespace-nowrap">
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                          item.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.is_active ? 'YA' : 'TIDAK'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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

      {/* BOM Management Modal */}
      {showBOMModal && selectedSOId && selectedIOId && (
        <BOMManagementModal
          soId={selectedSOId}
          ioId={selectedIOId}
          dataSource="SO" // Specify SO as source
          onClose={() => {
            setShowBOMModal(false);
            setSelectedSOId(null);
          }}
          onSuccess={() => {
            fetchSOData();
            setShowBOMModal(false);
            setSelectedSOId(null);
          }}
        />
      )}
    </div>
  );
};

export default BOMCreate;
