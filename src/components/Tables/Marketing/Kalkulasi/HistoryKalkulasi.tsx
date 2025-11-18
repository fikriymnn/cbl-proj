import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import KalkulasiDetailModal from './KalkulasiDetailModal';
import CopyOptionsModal from './CopyOptionModal';
import CopyKalkulasiModal from './CopyKalkulasiModal';
import Pagination from '@mui/material/Pagination/Pagination';
import Stack from '@mui/material/Stack';
import {
  KalkulasiItem,
  KalkulasiDetailItem,
  ApiResponse,
  ApiError,
} from '../Kalkulasi/types/kalkulasi';

type SortKey = keyof KalkulasiItem | 'index';
type SortDirection = 'asc' | 'desc';

const HistoryKalkulasi: React.FC = () => {
  const [data, setData] = useState<KalkulasiItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [selectedDetailData, setSelectedDetailData] =
    useState<KalkulasiDetailItem | null>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);

  // Copy functionality states
  const [showCopyOptionsModal, setShowCopyOptionsModal] =
    useState<boolean>(false);
  const [showCopyModal, setShowCopyModal] = useState<boolean>(false);
  const [copyType, setCopyType] = useState<'repeat' | 'repeat_perubahan'>(
    'repeat',
  );
  const [selectedCopyData, setSelectedCopyData] =
    useState<KalkulasiDetailItem | null>(null);

  // Pagination states
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  // Sort states
  const [sortKey, setSortKey] = useState<SortKey>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Search state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');

  useEffect(() => {
    fetchKalkulasiData();
  }, [page, limit, searchTerm]);

  const fetchKalkulasiData = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/marketing/kalkulasi`;
    try {
      setLoading(true);
      const res: AxiosResponse<ApiResponse<KalkulasiItem[]>> = await axios.get(
        url,
        {
          params: {
            status: 'history',
            page: page,
            limit: limit,
            search: searchTerm,
          },
          withCredentials: true,
        },
      );
      console.log('Fetched kalkulasi data:', res.data);
      if (res.data && res.data.data) {
        setData(res.data.data);
        if ((res.data as any).total_page) {
          setTotalPages((res.data as any).total_page);
        }
      } else {
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching kalkulasi data:', error);
      const apiError = error as ApiError;
      alert(`Error: ${apiError.message || 'Failed to fetch data'}`);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (): void => {
    setSearchTerm(searchInput);
    setPage(1); // Reset to first page when searching
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

  const fetchKalkulasiDetail = async (id: number): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/marketing/kalkulasi/${id}`;
    try {
      setDetailLoading(true);
      const res: AxiosResponse<ApiResponse<KalkulasiDetailItem>> =
        await axios.get(url, { withCredentials: true });
      console.log('Fetched kalkulasi detail:', res.data);
      if (res.data && res.data.data) {
        setSelectedDetailData(res.data.data);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error('Error fetching kalkulasi detail:', error);
      const apiError = error as ApiError;
      alert(`Error: ${apiError.message || 'Failed to fetch detail data'}`);
    } finally {
      setDetailLoading(false);
    }
  };

  const fetchKalkulasiDetailForCopy = async (id: number): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/marketing/kalkulasi/${id}`;
    try {
      setDetailLoading(true);
      const res: AxiosResponse<ApiResponse<KalkulasiDetailItem>> =
        await axios.get(url, { withCredentials: true });
      console.log('Fetched kalkulasi detail for copy:', res.data);
      if (res.data && res.data.data) {
        setSelectedCopyData(res.data.data);
        setShowCopyOptionsModal(true);
      }
    } catch (error) {
      console.error('Error fetching kalkulasi detail for copy:', error);
      const apiError = error as ApiError;
      alert(`Error: ${apiError.message || 'Failed to fetch detail data'}`);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleViewDetail = (id: number): void => {
    fetchKalkulasiDetail(id);
  };

  const handleCloseDetailModal = (): void => {
    setShowDetailModal(false);
    setSelectedDetailData(null);
  };

  const handleCopyClick = (id: number): void => {
    fetchKalkulasiDetailForCopy(id);
  };

  const handleCloseCopyOptionsModal = (): void => {
    setShowCopyOptionsModal(false);
    setSelectedCopyData(null);
  };

  const handleSelectRepeat = (): void => {
    setCopyType('repeat');
    setShowCopyOptionsModal(false);
    setShowCopyModal(true);
  };

  const handleSelectRepeatPerubahan = (): void => {
    setCopyType('repeat_perubahan');
    setShowCopyOptionsModal(false);
    setShowCopyModal(true);
  };

  const handleCloseCopyModal = (): void => {
    setShowCopyModal(false);
    setSelectedCopyData(null);
  };

  const handleCopySuccess = (): void => {
    setShowCopyModal(false);
    setSelectedCopyData(null);
    fetchKalkulasiData();
  };

  async function RequestKabag(id: any) {
    if (window.confirm('Apakah Anda yakin ingin Submit Kalkulasi Ini?')) {
      try {
        const url = `${
          import.meta.env.VITE_API_LINK
        }/marketing/kalkulasi/submit/${id}`;
        const res = await axios.put(
          url,
          {},
          {
            withCredentials: true,
          },
        );
        fetchKalkulasiData();
        alert('Kalkulasi berhasil disubmit!');
      } catch (error: any) {
        console.log(error);
        alert('Gagal submit kalkulasi');
      }
    }
  }

  // Sort functionality
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (key: SortKey) => {
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

  const sortData = (data: KalkulasiItem[]) => {
    return [...data].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortKey === 'tgl_kalkulasi') {
        aValue = new Date(a.tgl_kalkulasi || 0).getTime();
        bValue = new Date(b.tgl_kalkulasi || 0).getTime();
      } else if (
        sortKey === 'qty_kalkulasi' ||
        sortKey === 'harga_satuan' ||
        sortKey === 'total_harga_satuan_customer'
      ) {
        aValue = Number(a[sortKey]) || 0;
        bValue = Number(b[sortKey]) || 0;
      } else {
        aValue = a[sortKey as keyof KalkulasiItem] || '';
        bValue = b[sortKey as keyof KalkulasiItem] || '';
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const sortedData = sortData(data);

  const truncateText = (text: string, maxLength: number) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <input
            type="text"
            className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 w-48 text-sm"
            placeholder="Search..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button
            onClick={handleSearch}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
          >
            Search
          </button>
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="bg-gray-500 hover:bg-gray-600 text-red-500 px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-16">
                  <button className="flex items-center hover:text-gray-700 focus:outline-none">
                    No
                  </button>
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-24">
                  Actions
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  <button
                    onClick={() => handleSort('kode_kalkulasi')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    Kode
                    {getSortIcon('kode_kalkulasi')}
                  </button>
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  <button
                    onClick={() => handleSort('tipe_kalkulasi')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    Tipe
                    {getSortIcon('tipe_kalkulasi')}
                  </button>
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  <button
                    onClick={() => handleSort('tgl_kalkulasi')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    Tanggal
                    {getSortIcon('tgl_kalkulasi')}
                  </button>
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  <button
                    onClick={() => handleSort('nama_customer')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    Customer
                    {getSortIcon('nama_customer')}
                  </button>
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  <button
                    onClick={() => handleSort('nama_produk')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    Produk
                    {getSortIcon('nama_produk')}
                  </button>
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  <button
                    onClick={() => handleSort('qty_kalkulasi')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    Qty
                    {getSortIcon('qty_kalkulasi')}
                  </button>
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  <button
                    onClick={() => handleSort('total_harga_satuan_customer')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    Harga Customer
                    {getSortIcon('total_harga_satuan_customer')}
                  </button>
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    Status
                    {getSortIcon('status')}
                  </button>
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  <button
                    onClick={() => handleSort('status_proses')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    Approval
                    {getSortIcon('status_proses')}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedData.length > 0 ? (
                sortedData.map((item: KalkulasiItem, index: number) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-xs text-left">
                      {(page - 1) * limit + index + 1}
                    </td>
                    <td className="px-4 py-2 text-xs">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleViewDetail(item.id)}
                          disabled={detailLoading}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
                        >
                          {detailLoading ? 'Loading...' : 'Detail'}
                        </button>

                        {item.status === 'draft' && (
                          <button
                            onClick={() => RequestKabag(item.id)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
                          >
                            Submit
                          </button>
                        )}

                        {item.status === 'history' && (
                          <button
                            onClick={() => handleCopyClick(item.id)}
                            disabled={detailLoading}
                            className="bg-pink-500 hover:bg-pink-600 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
                          >
                            {detailLoading ? 'Loading...' : 'Copy'}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-left flex flex-col gap-2">
                      <span
                        className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded font-medium"
                        title={item.kode_kalkulasi || ''}
                      >
                        {item.kode_kalkulasi
                          ? truncateText(item.kode_kalkulasi, 20)
                          : '-'}
                      </span>
                      <span className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded font-medium">
                        {item.status_kalkulasi}
                      </span>
                      <span className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded font-medium">
                        {item.label || 'No Label'}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-left">
                      <span
                        className={`px-2 py-1 rounded text-xs uppercase ${
                          item.tipe_kalkulasi === 'multi'
                            ? 'bg-green-100 text-green-800'
                            : item.tipe_kalkulasi === 'manual'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {item.tipe_kalkulasi || 'normal'}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-xs text-left">
                      {new Date(item.tgl_kalkulasi).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-left">
                      <span className="text-xs" title={item.nama_customer}>
                        {truncateText(item.nama_customer, 15)}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-xs max-w-xs text-left">
                      <span title={item.nama_produk}>
                        {truncateText(item.nama_produk, 20)}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-xs text-left">
                      {item.tipe_kalkulasi === 'multi' && item.qty_list ? (
                        <div className="flex flex-col gap-1">
                          {item.qty_list.map((qtyItem, idx) => (
                            <span
                              key={idx}
                              className={`text-xs ${
                                qtyItem.is_selected ? 'font-bold' : ''
                              }`}
                            >
                              {qtyItem.qty.toLocaleString()}
                              {qtyItem.is_selected && ' ✓'}
                            </span>
                          ))}
                        </div>
                      ) : (
                        item.qty_kalkulasi?.toLocaleString()
                      )}
                    </td>
                    <td className="px-4 py-2 text-xs whitespace-nowrap text-left">
                      Rp{' '}
                      {Number(
                        item.total_harga_satuan_customer || 0,
                      ).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-xs whitespace-nowrap text-left">
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs uppercase">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-xs text-left">
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs uppercase">
                        {item.status_proses}
                      </span>
                      <br />
                      {item.status_proses === 'reject kabag' && (
                        <span className="text-red-500 text-xs">
                          {item?.note_kabag}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={11}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    {searchTerm
                      ? 'Tidak ada data yang sesuai dengan pencarian'
                      : 'Tidak ada data kalkulasi'}
                  </td>
                </tr>
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
                console.log(i);
              }}
            />
          </Stack>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedDetailData && (
        <KalkulasiDetailModal
          data={selectedDetailData}
          onClose={handleCloseDetailModal}
        />
      )}

      {/* Copy Options Modal */}
      {showCopyOptionsModal && (
        <CopyOptionsModal
          onClose={handleCloseCopyOptionsModal}
          onSelectRepeat={handleSelectRepeat}
          onSelectRepeatPerubahan={handleSelectRepeatPerubahan}
        />
      )}

      {/* Copy Kalkulasi Modal */}
      {showCopyModal && selectedCopyData && (
        <CopyKalkulasiModal
          originalData={selectedCopyData}
          copyType={copyType}
          onClose={handleCloseCopyModal}
          onSuccess={handleCopySuccess}
        />
      )}
    </div>
  );
};

export default HistoryKalkulasi;
