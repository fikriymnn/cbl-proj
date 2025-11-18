import React, { useEffect, useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import KalkulasiModal from './KalkulasiModal';
import KalkulasiDetailModal from './KalkulasiDetailModal';
import KalkulasiTypeModal from './KalkulasiTypeModal';
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

const KalkulasiNormal: React.FC = () => {
  const [data, setData] = useState<KalkulasiItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showTypeModal, setShowTypeModal] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);

  const [selectedKalkulasiType, setSelectedKalkulasiType] = useState<
    'normal' | 'multi' | 'manual' | null
  >(null);
  const [selectedDetailData, setSelectedDetailData] =
    useState<KalkulasiDetailItem | null>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);

  // State for edit mode
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editData, setEditData] = useState<KalkulasiDetailItem | null>(null);

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
            status: 'draft',
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
        // Assuming API returns total_page like in the second code
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
    setPage(1); // Reset to first page when changing limit
  };

  const handleOpenModal = (): void => {
    setShowTypeModal(true);
  };

  const handleSelectType = (type: 'normal' | 'multi' | 'manual'): void => {
    setSelectedKalkulasiType(type);
    setShowTypeModal(false);
    setIsEditMode(false);
    setEditData(null);
    setShowModal(true);
  };

  const handleCloseModal = (): void => {
    setShowModal(false);
    setSelectedKalkulasiType(null);
    setIsEditMode(false);
    setEditData(null);
  };

  const handleModalSuccess = (): void => {
    fetchKalkulasiData();
    setShowModal(false);
    setSelectedKalkulasiType(null);
    setIsEditMode(false);
    setEditData(null);
  };

  const handleCloseDetailModal = (): void => {
    setShowDetailModal(false);
    setSelectedDetailData(null);
  };

  const fetchKalkulasiDetail = async (
    id: number,
  ): Promise<KalkulasiDetailItem | undefined> => {
    const url = `${import.meta.env.VITE_API_LINK}/marketing/kalkulasi/${id}`;
    try {
      setDetailLoading(true);
      const res: AxiosResponse<ApiResponse<KalkulasiDetailItem>> =
        await axios.get(url, { withCredentials: true });
      console.log('Fetched kalkulasi detail:', res.data);
      if (res.data && res.data.data) {
        return res.data.data;
      }
      return undefined;
    } catch (error) {
      console.error('Error fetching kalkulasi detail:', error);
      const apiError = error as ApiError;
      alert(`Error: ${apiError.message || 'Failed to fetch detail data'}`);
      return undefined;
    } finally {
      setDetailLoading(false);
    }
  };

  const handleViewDetail = async (id: number): Promise<void> => {
    const detail = await fetchKalkulasiDetail(id);
    if (detail) {
      setSelectedDetailData(detail);
      setShowDetailModal(true);
    }
  };

  const handleEdit = async (id: number): Promise<void> => {
    try {
      setDetailLoading(true);
      const detail = await fetchKalkulasiDetail(id);
      if (detail) {
        setEditData(detail);
        setSelectedKalkulasiType(
          (detail.tipe_kalkulasi as 'normal' | 'multi' | 'manual') || 'normal',
        );
        setIsEditMode(true);
        setShowModal(true);
      }
    } catch (error) {
      // Error already handled in fetchKalkulasiDetail
    } finally {
      setDetailLoading(false);
    }
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
        <div className="">
          <button
            onClick={handleOpenModal}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
            type="button"
          >
            + KALKULASI
          </button>
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
                          <>
                            <button
                              onClick={() => handleEdit(item.id)}
                              disabled={detailLoading}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
                            >
                              {detailLoading ? 'Loading...' : 'Edit'}
                            </button>
                            <button
                              onClick={() => RequestKabag(item.id)}
                              className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
                            >
                              Submit
                            </button>
                          </>
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
                    colSpan={12}
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

      {/* Type Selection Modal */}
      {showTypeModal && (
        <KalkulasiTypeModal
          onClose={() => setShowTypeModal(false)}
          onSelectType={handleSelectType}
        />
      )}

      {/* Kalkulasi Modal */}
      {showModal && selectedKalkulasiType && (
        <KalkulasiModal
          onClose={handleCloseModal}
          onSuccess={handleModalSuccess}
          kalkulasiType={selectedKalkulasiType}
          isEditMode={isEditMode}
          editData={editData || undefined}
        />
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedDetailData && (
        <KalkulasiDetailModal
          data={selectedDetailData}
          onClose={handleCloseDetailModal}
        />
      )}
    </div>
  );
};

export default KalkulasiNormal;
