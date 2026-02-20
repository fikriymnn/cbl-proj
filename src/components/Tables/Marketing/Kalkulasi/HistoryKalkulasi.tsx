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
import KalkulasiPrintModal from './KalkulasiPrintPreview';

type SortKey = keyof KalkulasiItem | 'index';
type SortDirection = 'asc' | 'desc';

const HistoryKalkulasi: React.FC = () => {
  const [data, setData] = useState<KalkulasiItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [selectedDetailData, setSelectedDetailData] =
    useState<KalkulasiDetailItem | null>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [printKalkulasiId, setPrintKalkulasiId] = useState<number | null>(null);
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

  const [showRenameModal, setShowRenameModal] = useState<boolean>(false);
  const [renameProductId, setRenameProductId] = useState<number | null>(null);
  const [renameProductName, setRenameProductName] = useState<string>('');
  const [renameLoading, setRenameLoading] = useState<boolean>(false);

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

  const fetchKalkulasiDetailForCopy = async (
    id: number,
    hasIo: boolean,
  ): Promise<void> => {
    if (!hasIo) {
      alert('Tidak dapat menyalin kalkulasi karena IO kosong');
      return;
    }

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

  const handleCopyClick = (id: number, hasIo: boolean): void => {
    fetchKalkulasiDetailForCopy(id, hasIo);
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
  const handleClosePrintModal = (): void => {
    setShowPrintModal(false);
    setPrintKalkulasiId(null);
  };
  const handlePrint = (id: number): void => {
    setPrintKalkulasiId(id);
    setShowPrintModal(true);
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
  const handleRenameClick = (id: number, currentName: string): void => {
    setRenameProductId(id);
    setRenameProductName(currentName);
    setShowRenameModal(true);
  };

  const handleCloseRenameModal = (): void => {
    setShowRenameModal(false);
    setRenameProductId(null);
    setRenameProductName('');
  };

  const handleRenameSubmit = async (): Promise<void> => {
    if (!renameProductId || !renameProductName.trim()) {
      alert('Nama produk tidak boleh kosong');
      return;
    }

    try {
      setRenameLoading(true);
      const url = `${
        import.meta.env.VITE_API_LINK
      }/marketing/kalkulasi/updateProduk/${renameProductId}`;
      await axios.put(
        url,
        { nama_produk: renameProductName.trim() },
        { withCredentials: true },
      );
      alert('Nama produk berhasil diubah!');
      handleCloseRenameModal();
      fetchKalkulasiData();
    } catch (error: any) {
      console.error('Error updating product name:', error);
      alert(
        `Gagal mengubah nama produk: ${
          error?.response?.data?.message || error.message
        }`,
      );
    } finally {
      setRenameLoading(false);
    }
  };
  const sortedData = sortData(data);

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
          <table className="min-w-full table-fixed text-[10px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase w-12">
                  <button className="flex items-center hover:text-gray-700 focus:outline-none">
                    No
                  </button>
                </th>
                <th className="px-2 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase w-24">
                  Actions
                </th>
                <th className="px-2 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase w-32">
                  <button
                    onClick={() => handleSort('kode_kalkulasi')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    Kode
                    {getSortIcon('kode_kalkulasi')}
                  </button>
                </th>
                <th className="px-2 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase w-28">
                  <button
                    onClick={() => handleSort('no_io')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    No IO
                    {getSortIcon('no_io')}
                  </button>
                </th>
                <th className="px-2 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase w-20">
                  <button
                    onClick={() => handleSort('tipe_kalkulasi')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    Tipe
                    {getSortIcon('tipe_kalkulasi')}
                  </button>
                </th>
                <th className="px-2 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase w-24">
                  <button
                    onClick={() => handleSort('tgl_kalkulasi')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    Tanggal
                    {getSortIcon('tgl_kalkulasi')}
                  </button>
                </th>
                <th className="px-2 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase w-40">
                  <button
                    onClick={() => handleSort('nama_customer')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    Customer
                    {getSortIcon('nama_customer')}
                  </button>
                </th>
                <th className="px-2 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase w-48">
                  <button
                    onClick={() => handleSort('nama_produk')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    Produk
                    {getSortIcon('nama_produk')}
                  </button>
                </th>
                <th className="px-2 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase w-20">
                  <button
                    onClick={() => handleSort('qty_kalkulasi')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    Qty
                    {getSortIcon('qty_kalkulasi')}
                  </button>
                </th>
                <th className="px-2 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase w-32">
                  <button
                    onClick={() => handleSort('total_harga_satuan_customer')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    Harga Customer
                    {getSortIcon('total_harga_satuan_customer')}
                  </button>
                </th>
                <th className="px-2 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase w-20">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    Status
                    {getSortIcon('status')}
                  </button>
                </th>
                <th className="px-2 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase w-32">
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
                    <td className="px-2 py-1.5 text-[10px] text-left">
                      {(page - 1) * limit + index + 1}
                    </td>
                    <td className="px-2 py-1.5 text-[10px]">
                      <div className="flex flex-col gap-0.5">
                        <button
                          onClick={() => handleViewDetail(item.id)}
                          disabled={detailLoading}
                          className="bg-green-500 hover:bg-green-600 text-white px-2 py-0.5 rounded text-[9px] disabled:opacity-50"
                        >
                          {detailLoading ? 'Loading...' : 'Detail'}
                        </button>

                        {item.status === 'draft' && (
                          <button
                            onClick={() => RequestKabag(item.id)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-0.5 rounded text-[9px] disabled:opacity-50"
                          >
                            Submit
                          </button>
                        )}

                        {item.status === 'history' && (
                          <button
                            onClick={() =>
                              handleCopyClick(item.id, !!item.id_io)
                            }
                            disabled={detailLoading || !item.id_io}
                            className={`px-2 py-0.5 rounded text-[9px] transition-colors ${
                              item.id_io
                                ? 'bg-pink-500 hover:bg-pink-600 text-white'
                                : 'bg-gray-400 text-white cursor-not-allowed'
                            } disabled:opacity-50`}
                            title={
                              item.id_io
                                ? 'Copy Kalkulasi'
                                : 'IO Kosong - Tidak bisa copy'
                            }
                          >
                            {detailLoading
                              ? 'Loading...'
                              : item.id_io
                              ? 'Copy'
                              : 'IO Kosong'}
                          </button>
                        )}
                        <button
                          onClick={() => handlePrint(item.id)}
                          disabled={detailLoading}
                          className="bg-purple-500 hover:bg-purple-600 text-white px-2 py-0.5 rounded text-[9px] disabled:opacity-50 transition-colors"
                          title="Print"
                        >
                          Print
                        </button>
                        <button
                          onClick={() =>
                            handleRenameClick(item.id, item.nama_produk)
                          }
                          disabled={detailLoading}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-2 py-0.5 rounded text-[9px] disabled:opacity-50 transition-colors"
                          title="Ganti Nama Produk"
                        >
                          Ganti Nama
                        </button>
                      </div>
                    </td>
                    <td className="px-2 py-1.5 text-left">
                      <div className="flex flex-col gap-0.5">
                        <span className="bg-blue-100 text-blue-800 text-[9px] px-1 py-0.5 rounded font-medium break-words">
                          {item.kode_kalkulasi || '-'}
                        </span>
                        <span className="bg-blue-100 text-blue-800 text-[9px] px-1 py-0.5 rounded font-medium">
                          {item.status_kalkulasi}
                        </span>
                        <span className="bg-blue-100 text-blue-800 text-[9px] px-1 py-0.5 rounded font-medium">
                          {item.label || 'No Label'}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-1.5 text-left">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded ${
                          item.no_io
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.no_io || 'Kosong'}
                      </span>
                    </td>
                    <td className="px-2 py-1.5 text-left">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] uppercase ${
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
                    <td className="px-2 py-1.5 text-[10px] text-left">
                      {new Date(item.tgl_kalkulasi).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-2 py-1.5 text-left">
                      <span className="text-[10px] break-words leading-tight">
                        {item.nama_customer}
                      </span>
                    </td>
                    <td className="px-2 py-1.5 text-[10px] text-left">
                      <span className="break-words leading-tight">
                        {item.nama_produk}
                      </span>
                    </td>
                    <td className="px-2 py-1.5 text-[10px] text-left">
                      {item.tipe_kalkulasi === 'multi' && item.qty_list ? (
                        <div className="flex flex-col gap-0.5">
                          {item.qty_list.map((qtyItem, idx) => (
                            <span
                              key={idx}
                              className={`text-[10px] ${
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
                    <td className="px-2 py-1.5 text-[10px] text-left">
                      Rp{' '}
                      {Number(
                        item.total_harga_satuan_customer || 0,
                      ).toLocaleString()}
                    </td>
                    <td className="px-2 py-1.5 text-[10px] text-left">
                      <span className="bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded text-[9px] uppercase">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-2 py-1.5 text-[10px] text-left">
                      <span className="bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded text-[9px] uppercase block mb-1">
                        {item.status_proses}
                      </span>
                      {item.status_proses === 'reject kabag' && (
                        <span className="text-red-500 text-[9px] break-words">
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
      {showRenameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Ganti Nama Produk
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Produk Baru
              </label>
              <input
                type="text"
                value={renameProductName}
                onChange={(e) => setRenameProductName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleRenameSubmit()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Masukkan nama produk baru..."
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCloseRenameModal}
                disabled={renameLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleRenameSubmit}
                disabled={renameLoading || !renameProductName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-md transition-colors disabled:opacity-50"
              >
                {renameLoading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
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
      {showPrintModal && printKalkulasiId && (
        <KalkulasiPrintModal
          kalkulasiId={printKalkulasiId}
          onClose={handleClosePrintModal}
        />
      )}
    </div>
  );
};

export default HistoryKalkulasi;
