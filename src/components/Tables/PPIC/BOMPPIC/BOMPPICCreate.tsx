// BOMPPICCreate.tsx
import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import BOMPPICManagementModal from './BOMPPICManagementModal';
import { BOMPPICItem } from './Types/bompiic.types';
import Pagination from '@mui/material/Pagination/Pagination';
import Stack from '@mui/material/Stack';

type SortDirection = 'asc' | 'desc';

interface APIResponse<T> {
  succes: boolean;
  data: T;
  total_page?: number;
}

const BOMPPICCreate: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [bomData, setBomData] = useState<BOMPPICItem[]>([]);
  const [sortKey, setSortKey] = useState<string>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showBOMModal, setShowBOMModal] = useState<boolean>(false);
  const [selectedBOM, setSelectedBOM] = useState<BOMPPICItem | null>(null);

  // Pagination and Search states
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');

  // BOM PPIC Status Filter
  const [statusBomPpicFilter, setStatusBomPpicFilter] = useState<string>('');

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
    setPage(1);
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
    setPage(1);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '-';
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  const fetchBOMData = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/ppic/bom`;
    try {
      setLoading(true);
      const res: AxiosResponse<APIResponse<BOMPPICItem[]>> = await axios.get(
        url,
        {
          params: {
            is_bom_ppic_done: false,
            page: page,
            limit: limit,
            search: searchTerm,
          },
          withCredentials: true,
        },
      );
      console.log('Fetched BOM data:', res.data);

      setBomData(res.data.data || []);
      if (res.data.total_page) {
        setTotalPages(res.data.total_page);
      }
    } catch (error) {
      console.error('Error fetching BOM data:', error);
      setBomData([]);
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

  // Helper function to check if BOM PPIC exists
  const hasBOMPPIC = (item: BOMPPICItem): boolean => {
    return (
      item.bom_ppic !== undefined &&
      item.bom_ppic !== null &&
      Array.isArray(item.bom_ppic) &&
      item.bom_ppic.length > 0
    );
  };

  // NEW: Helper function to check if BOM PPIC status is "kembali ke BOM"
  const isBOMPPICKembaliKeBOM = (item: BOMPPICItem): boolean => {
    if (!hasBOMPPIC(item)) return false;
    return (
      item.bom_ppic?.[0]?.status_proses?.toLowerCase() === 'kembali ke bom'
    );
  };

  // NEW: Helper function to check if actions are disabled
  const areActionsDisabled = (item: BOMPPICItem): boolean => {
    return isBOMPPICKembaliKeBOM(item);
  };

  // Helper function to get BOM PPIC status badge
  const getBOMPPICStatusBadge = (item: BOMPPICItem) => {
    if (hasBOMPPIC(item)) {
      const ppicStatus = item.bom_ppic?.[0]?.status_proses?.toLowerCase();

      // Check if status is "kembali ke BOM"
      if (ppicStatus === 'kembali ke bom') {
        return (
          <div className="flex flex-col gap-1">
            <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800 border border-red-200 font-medium">
              🔙 Kembali ke BOM
            </span>
            <span className="text-xs text-gray-600">
              {(item.bom_ppic ?? []).length} items
            </span>
          </div>
        );
      }

      return (
        <div className="flex flex-col gap-1">
          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 border border-green-200 font-medium">
            ✓ BOM PPIC Created
          </span>
          <span className="text-xs text-gray-600">
            {(item.bom_ppic ?? []).length} items
          </span>
        </div>
      );
    }
    return (
      <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-800 border border-orange-200 font-medium">
        ⚠ No BOM PPIC
      </span>
    );
  };

  const handleManageBOMPPIC = (item: BOMPPICItem) => {
    // Check if actions are disabled
    if (areActionsDisabled(item)) {
      alert(
        'Cannot edit BOM PPIC when status is "Kembali ke BOM". Please update the BOM first.',
      );
      return;
    }

    console.log('Opening BOM PPIC Modal for:', item);
    setSelectedBOM(item);
    setShowBOMModal(true);
  };

  // Request BOM PPIC function
  const handleRequestBOMPPIC = async (item: BOMPPICItem) => {
    if (areActionsDisabled(item)) {
      alert(
        'Cannot request BOM PPIC when status is "Kembali ke BOM". Please update the BOM first.',
      );
      return;
    }

    if (window.confirm('Apakah Anda yakin ingin Request BOM PPIC ini?')) {
      try {
        const bomPpicId = item.bom_ppic?.[0]?.id;
        if (!bomPpicId) {
          alert('BOM PPIC not found. Please create BOM PPIC first.');
          return;
        }

        const url = `${
          import.meta.env.VITE_API_LINK
        }/ppic/bomPpic/request/${bomPpicId}`;
        await axios.put(url, {}, { withCredentials: true });
        fetchBOMData();
        alert('BOM PPIC berhasil di-request!');
      } catch (error: any) {
        console.log(error);
        alert('Gagal request BOM PPIC. Silakan coba lagi.');
      }
    }
  };

  // Back to BOM function
  const handleBackToBOM = async (item: BOMPPICItem) => {
    if (areActionsDisabled(item)) {
      alert(
        'Cannot perform this action when status is "Kembali ke BOM". Please update the BOM first.',
      );
      return;
    }

    if (window.confirm('Apakah Anda yakin ingin mengembalikan ke BOM?')) {
      try {
        const bomPpicId = item.bom_ppic?.[0]?.id;
        if (!bomPpicId) {
          alert('BOM PPIC not found.');
          return;
        }

        const url = `${
          import.meta.env.VITE_API_LINK
        }/ppic/bomPpic/backToBom/${bomPpicId}`;
        await axios.put(url, {}, { withCredentials: true });
        fetchBOMData();
        alert('Berhasil dikembalikan ke BOM!');
      } catch (error: any) {
        console.log(error);
        alert('Gagal mengembalikan ke BOM. Silakan coba lagi.');
      }
    }
  };

  useEffect(() => {
    fetchBOMData();
  }, [page, limit, searchTerm, statusBomPpicFilter]);

  const sortedData = React.useMemo(() => {
    const sorted = [...bomData].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortKey === 'bom_ppic') {
        aValue = hasBOMPPIC(a) ? 1 : 0;
        bValue = hasBOMPPIC(b) ? 1 : 0;
      } else if (sortKey === 'no_bom') {
        aValue = a.no_bom || '';
        bValue = b.no_bom || '';
      } else {
        aValue = a[sortKey as keyof BOMPPICItem];
        bValue = b[sortKey as keyof BOMPPICItem];
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
  }, [bomData, sortKey, sortDirection]);

  return (
    <div className="">
      {/* Search Bar and Filters */}
      <div className="mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <input
              type="text"
              placeholder="Search by No BOM, No SO, No IO, Customer, Produk..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end gap-2 mt-4">
            <button
              onClick={handleSearch}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors h-[42px]"
            >
              Search
            </button>
            {(searchTerm || statusBomPpicFilter) && (
              <button
                onClick={() => {
                  handleClearSearch();
                  setStatusBomPpicFilter('');
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors h-[42px]"
              >
                Clear All Filters
              </button>
            )}
          </div>
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
                  NO
                </th>

                {/* ACTION */}
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  ACTION
                </th>

                {/* NO BOM */}
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('no_bom')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    NO BOM
                    {getSortIcon('no_bom')}
                  </button>
                </th>

                {/* BOM PPIC STATUS */}
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('bom_ppic')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    BOM PPIC STATUS
                    {getSortIcon('bom_ppic')}
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

                {/* STATUS */}
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('status_bom')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    STATUS
                    {getSortIcon('status_bom')}
                  </button>
                </th>

                {/* TGL BUAT */}
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('tgl_pembuatan_bom')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    TGL BUAT
                    {getSortIcon('tgl_pembuatan_bom')}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={11} className="px-4 py-6 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : sortedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="px-4 py-6 text-center text-gray-500 text-sm"
                  >
                    {searchTerm || statusBomPpicFilter
                      ? 'No BOM found matching your filters'
                      : 'No BOM data available'}
                  </td>
                </tr>
              ) : (
                sortedData.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      areActionsDisabled(item) ? 'bg-red-50' : ''
                    }`}
                  >
                    {/* NO */}
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                      {(page - 1) * limit + index + 1}
                    </td>

                    {/* ACTION */}
                    <td className="px-2 py-2 whitespace-nowrap text-xs font-medium">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleManageBOMPPIC(item)}
                          className={`${
                            hasBOMPPIC(item)
                              ? 'bg-blue-500 hover:bg-blue-600'
                              : 'bg-green-500 hover:bg-green-600'
                          } text-white px-3 py-1 rounded text-xs transition-colors ${
                            areActionsDisabled(item)
                              ? 'opacity-50 cursor-not-allowed'
                              : ''
                          }`}
                          title={
                            areActionsDisabled(item)
                              ? 'Actions disabled - BOM needs update'
                              : hasBOMPPIC(item)
                              ? 'Edit BOM PPIC'
                              : 'Create BOM PPIC'
                          }
                          disabled={areActionsDisabled(item)}
                        >
                          {hasBOMPPIC(item) ? 'EDIT' : 'CREATE'}
                        </button>

                        {/* Request BOM PPIC Button */}
                        {hasBOMPPIC(item) && (
                          <button
                            onClick={() => handleRequestBOMPPIC(item)}
                            className={`bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-xs transition-colors ${
                              areActionsDisabled(item)
                                ? 'opacity-50 cursor-not-allowed'
                                : ''
                            }`}
                            title={
                              areActionsDisabled(item)
                                ? 'Actions disabled - BOM needs update'
                                : 'Request BOM PPIC'
                            }
                            disabled={areActionsDisabled(item)}
                          >
                            REQUEST
                          </button>
                        )}

                        {/* Back to BOM Button */}
                        <button
                          onClick={() => handleBackToBOM(item)}
                          className={`bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-xs transition-colors ${
                            areActionsDisabled(item)
                              ? 'opacity-50 cursor-not-allowed'
                              : ''
                          }`}
                          title={
                            areActionsDisabled(item)
                              ? 'Actions disabled - BOM needs update'
                              : 'Back to BOM'
                          }
                          disabled={areActionsDisabled(item)}
                        >
                          BACK TO BOM
                        </button>
                      </div>
                    </td>

                    {/* NO BOM */}
                    <td className="px-2 py-2 whitespace-nowrap">
                      {item.no_bom ? (
                        <span
                          className="bg-indigo-100 text-indigo-800 text-xs px-1.5 py-0.5 rounded font-medium"
                          title={item.no_bom}
                        >
                          {truncateText(item.no_bom, 20)}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>

                    {/* BOM PPIC STATUS */}
                    <td className="px-2 py-2 whitespace-nowrap">
                      {getBOMPPICStatusBadge(item)}
                    </td>

                    {/* NO SO */}
                    <td className="px-2 py-2 whitespace-nowrap">
                      <span
                        className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded font-medium"
                        title={item.no_so}
                      >
                        {item.no_so ? truncateText(item.no_so, 20) : '-'}
                      </span>
                    </td>

                    {/* NO IO */}
                    <td className="px-2 py-2 whitespace-nowrap">
                      <span
                        className="bg-purple-100 text-purple-800 text-xs px-1.5 py-0.5 rounded font-medium"
                        title={item.no_io}
                      >
                        {item.no_io ? truncateText(item.no_io, 20) : '-'}
                      </span>
                    </td>

                    {/* CUSTOMER */}
                    <td className="px-2 py-2 text-xs text-gray-900 max-w-32">
                      <span title={item.customer}>
                        {truncateText(item.customer, 90)}
                      </span>
                    </td>

                    {/* PRODUK */}
                    <td className="px-2 py-2 text-xs text-gray-900 max-w-40">
                      <span title={item.produk}>
                        {truncateText(item.produk, 90)}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td className="px-2 py-2 whitespace-nowrap">
                      {item.status_bom ? (
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded font-medium ${getStatusColor(
                            item.status_bom,
                          )}`}
                          title={item.status_bom}
                        >
                          {truncateText(item.status_bom, 8)}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>

                    {/* TGL BUAT */}
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                      <span title={item.tgl_pembuatan_bom}>
                        {formatDate(item.tgl_pembuatan_bom)}
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

      {/* BOM PPIC Management Modal */}
      {showBOMModal && selectedBOM && (
        <BOMPPICManagementModal
          bomId={selectedBOM.id}
          onClose={() => {
            setShowBOMModal(false);
            setSelectedBOM(null);
          }}
          onSuccess={() => {
            fetchBOMData();
            setShowBOMModal(false);
            setSelectedBOM(null);
          }}
        />
      )}
    </div>
  );
};

export default BOMPPICCreate;
