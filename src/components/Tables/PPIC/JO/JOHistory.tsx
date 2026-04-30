import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import { JOTipeOption } from './types/jo.types';
import JOPPICCreateModal from './utils/JOPPICCreateModal';
import Pagination from '@mui/material/Pagination/Pagination';
import Stack from '@mui/material/Stack';
import JOPrintModal from './utils/JOPrintModal';

type SortDirection = 'asc' | 'desc';

interface TahapanItem {
  id: number;
  id_drying_time: number | null;
  id_setting_kapasitas: number | null;
  nama_mesin: string;
  nama_proses: string;
}

interface IOMounting {
  tahapan: TahapanItem[];
}

interface JOMounting {
  is_selected: unknown;
  id: number;
  io_mounting: IOMounting;
}

interface JOData {
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
  jo_mounting: JOMounting[];
}

interface APIResponse<T> {
  succes: boolean;
  data: T;
  total_page?: number;
  message?: string;
}

const JOHistory: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [joData, setJOData] = useState<JOData[]>([]);
  const [sortKey, setSortKey] = useState<string>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showModal, setShowModal] = useState<boolean>(false);
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
          status: 'history',
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
    setPage(1);
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

  // AFTER: only checks the selected mounting's tahapan
  const getJadwalBlockReasons = (item: JOData): string[] => {
    const reasons: string[] = [];

    const selectedJoMounting = item.jo_mounting?.find((jm) => jm.is_selected);

    if (!selectedJoMounting) {
      reasons.push('Mounting belum dipilih');
      return reasons;
    }

    const tahapan = selectedJoMounting.io_mounting?.tahapan ?? [];

    if (tahapan.length === 0) {
      reasons.push('Tahapan belum diset');
    } else {
      if (tahapan.some((t) => t.id_drying_time === null))
        reasons.push('Drying time belum diset');
      if (tahapan.some((t) => t.id_setting_kapasitas === null))
        reasons.push('Kapasitas belum diset');
    }

    return reasons;
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditMode(false);
    setEditJOId(null);
  };

  const handleModalSuccess = () => {
    fetchJOData();
  };

  const handleViewJO = (item: JOData) => {
    setEditMode(true);
    setEditJOId(item.id);
    setSelectedTipeJO(item.tipe_jo as JOTipeOption);
    setShowModal(true);
  };

  const SendJoToJadwal = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin kirim ke jadwal?')) {
      try {
        const url = `${import.meta.env.VITE_API_LINK}/ppic/jo/sendJadwal/${id}`;
        await axios.put(url, {}, { withCredentials: true });
        fetchJOData();
        alert('JO berhasil di kirim ke jadwal!');
      } catch (error: any) {
        console.log(error);
        alert(
          'Gagal kirim JO ke jadwal. Silakan coba lagi.' +
            ' ' +
            'Error:' +
            error.response.data.msg,
        );
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

  return (
    <div className="">
      {/* Header Section */}
      <div className="mb-6">
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
                sortedData.map((item, index) => {
                  const jadwalBlockReasons = getJadwalBlockReasons(item);
                  const isJadwalBlocked = jadwalBlockReasons.length > 0;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-900">
                        {(page - 1) * limit + index + 1}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs font-medium">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => handleViewJO(item)}
                            className="text-white bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-xs transition-colors"
                            title="View JO Details"
                          >
                            DETAIL
                          </button>

                          {/* SEND JADWAL with conditional disable + tooltip */}
                          <div className="relative group">
                            <button
                              onClick={() =>
                                !isJadwalBlocked && SendJoToJadwal(item.id)
                              }
                              disabled={isJadwalBlocked}
                              className={`w-full px-3 py-1 rounded text-xs transition-colors text-white ${
                                isJadwalBlocked
                                  ? 'bg-yellow-300 cursor-not-allowed opacity-60'
                                  : 'bg-yellow-500 hover:bg-yellow-600 cursor-pointer'
                              }`}
                              title={
                                isJadwalBlocked
                                  ? jadwalBlockReasons.join(' | ')
                                  : 'Kirim ke Jadwal'
                              }
                            >
                              SEND JADWAL
                            </button>

                            {/* Hover tooltip showing block reasons */}
                            {isJadwalBlocked && (
                              <div className="absolute z-20 left-0 mt-1 w-52 bg-white text-black text-xs border border-gray-600 rounded-lg shadow-lg p-2 hidden group-hover:block pointer-events-none">
                                <p className="font-semibold mb-1 text-red-600">
                                  Tidak bisa kirim:
                                </p>
                                <ul className="list-disc list-inside space-y-0.5">
                                  {jadwalBlockReasons.map((reason, i) => (
                                    <li key={i}>{reason}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => handlePrintJO(item)}
                            className="text-white bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-xs transition-colors"
                            title="Print JO"
                          >
                            PRINT
                          </button>
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
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusProsesColor(
                            item.status_proses,
                          )}`}
                        >
                          {item.status_proses || '-'}
                        </span>
                      </td>
                    </tr>
                  );
                })
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

      {/* JO View Modal */}
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

export default JOHistory;
