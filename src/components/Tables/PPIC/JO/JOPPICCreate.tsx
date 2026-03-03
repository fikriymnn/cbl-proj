import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import { JOTipeOption } from './types/jo.types';
import JOPPICCreateModal from './utils/JOPPICCreateModal';
import Pagination from '@mui/material/Pagination/Pagination';
import Stack from '@mui/material/Stack';
import JOPrintModal from './utils/JOPrintModal';
type SortDirection = 'asc' | 'desc';

interface JOData {
  so: any;
  status_produk: string;
  status_proses: string;
  status: any;
  id: number;
  no_jo: string;
  no_so: string;
  no_io: string;
  customer: string;
  produk: string;
  qty: number;
  tgl_kirim: string;
  status_jo: string;
  tipe_jo: string;
  is_active: boolean;
  createdAt: string;
}

interface APIResponse<T> {
  succes: boolean;
  data: T;
  total_page?: number;
  message?: string;
}

const JOPPICCreate: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [joData, setJOData] = useState<JOData[]>([]);
  const [sortKey, setSortKey] = useState<string>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showTipeJOSelection, setShowTipeJOSelection] =
    useState<boolean>(false);
  const [selectedTipeJO, setSelectedTipeJO] =
    useState<JOTipeOption>('JO PRODUKSI');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editJOId, setEditJOId] = useState<number | null>(null);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [printJOId, setPrintJOId] = useState<number | null>(null);
  // Pagination states
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  useEffect(() => {
    fetchJOData();
  }, [page, limit, searchTerm]);

  const fetchJOData = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/ppic/jo`;
    try {
      setLoading(true);
      const res: AxiosResponse<APIResponse<JOData[]>> = await axios.get(url, {
        params: {
          page: page,
          limit: limit,
          search: searchTerm,
          status: 'draft',
        },
        withCredentials: true,
      });
      console.log('Fetched JO data:', res.data);
      if (res.data.succes) {
        setJOData(res.data.data || []);
        if (res.data.total_page) {
          setTotalPages(res.data.total_page);
        }
      }
    } catch (error) {
      console.error('Error fetching JO data:', error);
      setJOData([]);
    } finally {
      setLoading(false);
    }
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
  const handlePrintJO = (item: JOData) => {
    setPrintJOId(item.id);
    setShowPrintModal(true);
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

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '-';
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
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
      case 'proses':
        return 'bg-yellow-100 text-yellow-800';
      case 'selesai':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusProsesColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'draft':
        return 'bg-blue-100 text-blue-800';
      case 'request to kabag':
        return 'bg-yellow-100 text-yellow-800';
      case 'reject kabag':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'approved':
      case 'done':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipeJOColor = (tipe: string): string => {
    return tipe === 'JO PRODUKSI'
      ? 'bg-purple-100 text-purple-800'
      : 'bg-orange-100 text-orange-800';
  };

  const handleTambahJO = () => {
    setEditMode(false);
    setEditJOId(null);
    setShowTipeJOSelection(true);
  };

  const handleSelectTipeJO = (tipe: JOTipeOption) => {
    setSelectedTipeJO(tipe);
    setShowTipeJOSelection(false);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditMode(false);
    setEditJOId(null);
  };

  const handleModalSuccess = () => {
    fetchJOData();
  };

  const handleEditJO = (item: JOData) => {
    setEditMode(true);
    setEditJOId(item.id);
    setSelectedTipeJO(item.tipe_jo as JOTipeOption);
    setShowModal(true);
  };

  const NextProcessKabag = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin Next Process JO Ini?')) {
      try {
        const url = `${import.meta.env.VITE_API_LINK}/ppic/jo/request/${id}`;
        const res = await axios.put(
          url,
          {},
          {
            withCredentials: true,
          },
        );
        fetchJOData();
        alert('JO berhasil di-request!');
      } catch (error: any) {
        console.log(error);
        alert('Gagal request JO. Silakan coba lagi.');
      }
    }
  };

  // Apply sorting to data (client-side sorting)
  const sortedData = [...joData].sort((a, b) => {
    const aValue = a[sortKey as keyof JOData];
    const bValue = b[sortKey as keyof JOData];

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
  const isProductAccepted = (statusProduk: string): boolean => {
    return (
      statusProduk?.toLowerCase() === 'acc' ||
      statusProduk?.toLowerCase() === 'ppos'
    );
  };

  const getRowClassName = (item: JOData): string => {
    const baseClass = 'hover:bg-gray-50 transition-colors';
    if (!isProductAccepted(item.so?.status_produk)) {
      return `${baseClass} bg-yellow-50`; // Light yellow background for non-ACC
    }
    return baseClass;
  };

  const getStatusProdukColor = (status: string): string => {
    if (status?.toLowerCase() === 'acc') {
      return 'bg-green-100 text-green-800';
    }
    return 'bg-yellow-100 text-yellow-800';
  };
  return (
    <div className="">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handleTambahJO}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Tambah JO
            </button>
          </div>
        </div>

        {/* Search Section */}
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search NO JO, SO, IO, Customer, Produk..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleKeyPress}
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
                  className="bg-gray-500 hover:bg-gray-600 text-red-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
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
                    NO JO
                    {getSortIcon('no_jo')}
                  </button>
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('no_so')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    NO SO
                    {getSortIcon('no_so')}
                  </button>
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('no_io')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    NO IO
                    {getSortIcon('no_io')}
                  </button>
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('customer')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    CUSTOMER
                    {getSortIcon('customer')}
                  </button>
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('produk')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    PRODUK
                    {getSortIcon('produk')}
                  </button>
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('qty')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    QTY
                    {getSortIcon('qty')}
                  </button>
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('tgl_kirim')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    TGL KIRIM
                    {getSortIcon('tgl_kirim')}
                  </button>
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('tipe_jo')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    TIPE JO
                    {getSortIcon('tipe_jo')}
                  </button>
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('status_jo')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    STATUS JO
                    {getSortIcon('status_jo')}
                  </button>
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('status_produk')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    STATUS PRODUK
                    {getSortIcon('status_produk')}
                  </button>
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('status_proses')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    STATUS PROSES
                    {getSortIcon('status_proses')}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={12} className="px-3 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <p className="mt-2 text-sm text-gray-600">
                        Loading data...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : sortedData.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-3 py-8 text-center">
                    <p className="text-sm text-gray-500">
                      {searchTerm
                        ? 'Tidak ada data yang sesuai dengan pencarian'
                        : 'Belum ada data Job Order'}
                    </p>
                  </td>
                </tr>
              ) : (
                sortedData.map((item, index) => (
                  <tr
                    key={item.id}
                    className={getRowClassName(item)} // MODIFIED THIS LINE
                  >
                    <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-900">
                      {(page - 1) * limit + index + 1}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs font-medium">
                      <div className="flex flex-col gap-1">
                        {item.status_proses == 'request to kabag' ||
                        item.status_proses == 'done' ? (
                          <div className="text-gray-500 text-center py-1">
                            -
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => handleEditJO(item)}
                              className="text-white bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-xs transition-colors"
                              title="EDIT JO"
                            >
                              EDIT JO
                            </button>

                            <button
                              onClick={() => NextProcessKabag(item.id)}
                              disabled={
                                !isProductAccepted(item.so?.status_produk)
                              }
                              className={`px-3 py-1 rounded text-xs transition-colors ${
                                isProductAccepted(item.so?.status_produk)
                                  ? 'bg-orange-500 hover:bg-orange-600 text-white'
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                              title={
                                isProductAccepted(item.so?.status_produk)
                                  ? 'Next Process'
                                  : 'Product must be ACC to proceed'
                              }
                            >
                              NEXT PROCESS
                            </button>
                            <button
                              onClick={() => handlePrintJO(item)}
                              className="text-white bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-xs transition-colors"
                              title="Print JO"
                            >
                              PRINT
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs font-medium text-gray-900">
                      <div className="max-w-xs" title={item.no_jo}>
                        {truncateText(item.no_jo, 30)}
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-900">
                      <div className="max-w-xs" title={item.no_so}>
                        {truncateText(item.no_so, 30)}
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-900">
                      <div className="max-w-xs" title={item.no_io}>
                        {truncateText(item.no_io, 30)}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-900">
                      <div className="max-w-xs" title={item.customer}>
                        {truncateText(item.customer, 30)}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-900">
                      <div className="max-w-xs" title={item.produk}>
                        {truncateText(item.produk, 40)}
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-900">
                      {item.qty?.toLocaleString() || 0}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-900">
                      {formatDate(item.tgl_kirim)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTipeJOColor(
                          item.tipe_jo,
                        )}`}
                      >
                        {item.tipe_jo || '-'}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          item.status_jo,
                        )}`}
                      >
                        {item.status_jo || '-'}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusProdukColor(
                          item.status_produk,
                        )}`}
                      >
                        {item.so?.status_produk || '-'}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusProsesColor(
                          item.status_proses,
                        )}`}
                      >
                        {item.status_proses || '-'}
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

      {/* Tipe JO Selection Modal */}
      {showTipeJOSelection && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setShowTipeJOSelection(false)}
            />
            <div className="inline-block align-middle bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full">
              <div className="bg-white px-6 pt-6 pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Pilih Tipe Job Order
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleSelectTipeJO('JO PRODUKSI')}
                    className="flex flex-col items-center justify-center p-6 border-2 border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all group"
                  >
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-purple-200">
                      <svg
                        className="w-8 h-8 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <span className="text-lg font-semibold text-gray-900">
                      JO PRODUKSI
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      Job Order untuk produksi sesungguhnya
                    </span>
                  </button>
                  <button
                    onClick={() => handleSelectTipeJO('JO PROOF')}
                    className="flex flex-col items-center justify-center p-6 border-2 border-orange-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all group"
                  >
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-orange-200">
                      <svg
                        className="w-8 h-8 text-orange-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                        />
                      </svg>
                    </div>
                    <span className="text-lg font-semibold text-gray-900">
                      JO PROOF
                    </span>
                    <span className="text-sm text-gray-500 mt-1">
                      Job Order untuk sample/contoh
                    </span>
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4">
                <button
                  onClick={() => setShowTipeJOSelection(false)}
                  className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* JO Create/Edit Modal */}
      <JOPPICCreateModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        tipeJO={selectedTipeJO}
        editMode={editMode}
        editJOId={editJOId}
      />
      <JOPrintModal
        isOpen={showPrintModal}
        joId={printJOId}
        onClose={() => {
          setShowPrintModal(false);
          setPrintJOId(null);
        }}
      />
    </div>
  );
};

export default JOPPICCreate;
