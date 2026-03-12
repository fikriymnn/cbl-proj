import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { Pagination, Stack } from '@mui/material';

interface MesinTahapan {
  id?: number;
  kode_mesin?: string;
  nama_mesin: string;
}

interface Tahapan {
  id?: number;
  kode_tahapan: string;
  nama_tahapan: string;
}

interface Operator {
  id: number;
  nama: string;
  email: string;
  role: string;
}

interface ProduksiLKH {
  id: number;
  no_jo: string;
  no_io: string;
  no_so: string;
  customer: string;
  produk: string;
}

interface LKHData {
  id: number;
  id_produksi_lkh: number;
  id_produksi_lkh_tahapan: number;
  id_tahapan: number;
  id_mesin: number;
  id_operator: number;
  id_kode_produksi: number;
  kode: string;
  deskripsi: string;
  waktu_mulai: string;
  waktu_selesai: string;
  total_waktu: string;
  baik: number;
  rusak_sebagian: number;
  rusak_total: number;
  pallet: number;
  status: string;
  note: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  operator?: Operator;
  produksi_lkh?: ProduksiLKH;
}

interface LKHResponse {
  data: LKHData[];
  total_page: number;
}

const MonitoringLKH: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [lkhData, setLkhData] = useState<LKHData[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [page, setPage] = useState<number>(1);

  const [searchInput, setSearchInput] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchJO, setSearchJO] = useState<string>('');
  const [searchJOInput, setSearchJOInput] = useState<string>('');

  const [selectedMesin, setSelectedMesin] = useState<number | null>(null);
  const [selectedTahapan, setSelectedTahapan] = useState<number | null>(null);

  const [mesinList, setMesinList] = useState<MesinTahapan[]>([]);
  const [tahapanList, setTahapanList] = useState<Tahapan[]>([]);
  const [showMesinDropdown, setShowMesinDropdown] = useState<boolean>(false);
  const [showTahapanDropdown, setShowTahapanDropdown] =
    useState<boolean>(false);

  const [actionLoading, setActionLoading] = useState<{
    [key: number]: boolean;
  }>({});

  useEffect(() => {
    fetchMesinList();
    fetchTahapanList();
  }, []);

  useEffect(() => {
    fetchLKHData();
  }, [page, searchTerm, searchJO, selectedMesin, selectedTahapan]);

  const fetchMesinList = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/master/mesinTahapan`;
    try {
      const res: AxiosResponse = await axios.get(url, {
        withCredentials: true,
      });
      setMesinList(res.data.data || []);
    } catch (error) {
      console.error('Error fetching mesin list:', error);
    }
  };

  const fetchTahapanList = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/master/tahapan`;
    try {
      const res: AxiosResponse = await axios.get(url, {
        withCredentials: true,
      });
      setTahapanList(res.data.data || []);
    } catch (error) {
      console.error('Error fetching tahapan list:', error);
    }
  };

  const fetchLKHData = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/produksi/lkhProses`;
    try {
      setLoading(true);
      const res: AxiosResponse<LKHResponse> = await axios.get(url, {
        params: {
          page: page,
          limit: 10,
          search: searchTerm,
          no_jo: searchJO,
          ...(selectedMesin && { id_mesin: selectedMesin }),
          ...(selectedTahapan && { id_tahapan: selectedTahapan }),
        },
        withCredentials: true,
      });

      const responseData = Array.isArray(res.data.data)
        ? res.data.data
        : (res.data as any)?.rows || (res.data as any)?.result || [];

      setLkhData(responseData);
      setTotalPages(
        res.data.total_page ||
          (res.data as any).totalPage ||
          (res.data as any).totalPages ||
          0,
      );
    } catch (error) {
      console.error('Error fetching LKH data:', error);
      setLkhData([]);
    } finally {
      setLoading(false);
    }
  };

  // Commits BOTH search inputs at once, resets to page 1
  const handleSearch = () => {
    setPage(1);
    setSearchTerm(searchInput);
    setSearchJO(searchJOInput);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchTerm('');
    setSearchJOInput('');
    setSearchJO('');
    setPage(1);
  };

  const handleApprove = async (id: number): Promise<void> => {
    const confirmed = window.confirm(
      'Are you sure you want to approve this LKH?',
    );
    if (!confirmed) return;

    const url = `${
      import.meta.env.VITE_API_LINK
    }/produksi/lkhProses/approveSpv/${id}`;
    try {
      setActionLoading((prev) => ({ ...prev, [id]: true }));
      await axios.put(url, {}, { withCredentials: true });
      alert('LKH approved successfully!');
      fetchLKHData();
    } catch (error) {
      console.error('Error approving LKH:', error);
      alert('Failed to approve LKH. Please try again.');
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const formatDuration = (totalSeconds: number | string): string => {
    const seconds =
      typeof totalSeconds === 'string' ? parseInt(totalSeconds) : totalSeconds;
    if (isNaN(seconds) || seconds < 0) return '-';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours} Jam`);
    if (minutes > 0) parts.push(`${minutes} Menit`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs} Detik`);
    return parts.join(' ');
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '-';
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  const formatDateTime = (dateString: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day} ${month} ${year} ${hours}:${minutes}:${seconds}`;
  };

  const getStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'baru':
        return 'bg-blue-100 text-blue-800';
      case 'proses':
        return 'bg-yellow-100 text-yellow-800';
      case 'selesai':
        return 'bg-green-100 text-green-800';
      case 'request to spv':
        return 'bg-orange-100 text-orange-800';
      case 'done':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSelectedMesinName = () => {
    const mesin = mesinList.find((m) => m.id === selectedMesin);
    return mesin ? `${mesin.kode_mesin} - ${mesin.nama_mesin}` : 'Select Mesin';
  };

  const getSelectedTahapanName = () => {
    const tahapan = tahapanList.find((t) => t.id === selectedTahapan);
    return tahapan
      ? `${tahapan.kode_tahapan} - ${tahapan.nama_tahapan}`
      : 'Select Tahapan';
  };

  return (
    <div className="">
      {/* Header Section */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col gap-2 sm:gap-3 mb-3 sm:mb-4">
          {/* Unified Search Bar */}
          <div className="flex rounded-lg border border-gray-300 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white transition-shadow duration-150">
            {/* General Search */}
            <div className="relative flex-1 min-w-0">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
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
              <input
                type="text"
                placeholder="Search general..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="pl-9 pr-7 py-2.5 text-sm w-full focus:outline-none bg-transparent placeholder-gray-400"
              />
              {searchInput && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Divider */}
            <div className="w-px bg-gray-200 self-stretch my-2" />

            {/* JO Search */}
            <div className="relative flex-1 min-w-0">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
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
              <input
                type="text"
                placeholder="No JO..."
                value={searchJOInput}
                onChange={(e) => setSearchJOInput(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="pl-9 pr-3 py-2.5 text-sm w-full focus:outline-none bg-transparent placeholder-gray-400"
              />
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-colors duration-150 border-l border-blue-700"
            >
              <svg
                className="w-4 h-4"
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
              Search
            </button>
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {/* Mesin Select */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowMesinDropdown(!showMesinDropdown);
                  setShowTahapanDropdown(false);
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-left flex justify-between items-center bg-white"
              >
                <span
                  className={`truncate ${
                    selectedMesin ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {getSelectedMesinName()}
                </span>
                <svg
                  className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2"
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
              </button>
              {showMesinDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                  <div
                    onClick={() => {
                      setSelectedMesin(null);
                      setShowMesinDropdown(false);
                      setPage(1);
                    }}
                    className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer text-gray-500"
                  >
                    Clear Selection
                  </div>
                  {mesinList.map((mesin) => (
                    <div
                      key={mesin.id}
                      onClick={() => {
                        setSelectedMesin(mesin.id || null);
                        setShowMesinDropdown(false);
                        setPage(1);
                      }}
                      className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                    >
                      {mesin.kode_mesin} - {mesin.nama_mesin}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tahapan Select */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowTahapanDropdown(!showTahapanDropdown);
                  setShowMesinDropdown(false);
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-left flex justify-between items-center bg-white"
              >
                <span
                  className={`truncate ${
                    selectedTahapan ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {getSelectedTahapanName()}
                </span>
                <svg
                  className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2"
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
              </button>
              {showTahapanDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                  <div
                    onClick={() => {
                      setSelectedTahapan(null);
                      setShowTahapanDropdown(false);
                      setPage(1);
                    }}
                    className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer text-gray-500"
                  >
                    Clear Selection
                  </div>
                  {tahapanList.map((tahapan) => (
                    <div
                      key={tahapan.id}
                      onClick={() => {
                        setSelectedTahapan(tahapan.id || null);
                        setShowTahapanDropdown(false);
                        setPage(1);
                      }}
                      className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                    >
                      {tahapan.kode_tahapan} - {tahapan.nama_tahapan}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  No JO
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Operator
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Nama Produk
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Deskripsi
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Waktu
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Durasi
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Produksi
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-3 py-4 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : lkhData.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-3 py-4 text-center text-gray-500 text-sm"
                  >
                    No data available
                  </td>
                </tr>
              ) : (
                lkhData.map((lkh) => (
                  <tr key={lkh.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 font-medium">
                      {lkh.produksi_lkh?.no_jo || '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {lkh.operator?.nama || '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {lkh.produksi_lkh?.produk || '-'}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-900 max-w-xs">
                      <div className="truncate" title={lkh.deskripsi}>
                        {lkh.kode && (
                          <div className="text-gray-500 text-xs mt-0.5">
                            {lkh.kode}
                          </div>
                        )}
                        {truncateText(lkh.deskripsi, 25)}
                      </div>
                      {lkh.note && (
                        <div
                          className="text-gray-500 text-xs truncate mt-0.5"
                          title={lkh.note}
                        >
                          Note: {truncateText(lkh.note, 20)}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-900">
                      <div className="whitespace-nowrap">
                        {formatDateTime(lkh.waktu_mulai)}
                      </div>
                      <div className="whitespace-nowrap text-gray-500">
                        {formatDateTime(lkh.waktu_selesai)}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {formatDuration(lkh.total_waktu)}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-900">
                      <div className="flex gap-1 flex-wrap">
                        <span className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded">
                          ✓ OK : {lkh.baik}
                        </span>
                        <span className="bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded">
                          ⚠ RS : {lkh.rusak_sebagian}
                        </span>
                        <span className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded">
                          ✕ RT : {lkh.rusak_total}
                        </span>
                      </div>
                      <div className="text-gray-500 mt-1">
                        Pallet: {lkh.pallet}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 inline-flex text-xs font-semibold rounded-full ${getStatusColor(
                          lkh.status,
                        )}`}
                      >
                        {lkh.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="w-full flex justify-center py-4">
          <Stack spacing={2}>
            <Pagination
              count={totalPages}
              color="primary"
              page={page}
              onChange={(e, i) => setPage(i)}
              size="small"
            />
          </Stack>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : lkhData.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            No data available
          </div>
        ) : (
          lkhData.map((lkh) => (
            <div key={lkh.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-semibold text-sm text-gray-900">
                    {lkh.produksi_lkh?.no_jo || '-'}
                  </div>
                  <div className="text-xs text-gray-600 mt-0.5">
                    Kode: {lkh.kode || '-'}
                  </div>
                  <span
                    className={`mt-1 px-2 py-0.5 inline-flex text-xs font-semibold rounded-full ${getStatusColor(
                      lkh.status,
                    )}`}
                  >
                    {lkh.status}
                  </span>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500 text-xs">Operator:</span>
                  <div className="text-gray-900">
                    {lkh.operator?.nama || '-'}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Nama Produk:</span>
                  <div className="text-gray-900">
                    {lkh.produksi_lkh?.produk || '-'}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Deskripsi:</span>
                  <div className="text-gray-900">{lkh.deskripsi || '-'}</div>
                </div>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Mulai:</span>
                    <div className="text-gray-900">
                      {formatDateTime(lkh.waktu_mulai)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Selesai:</span>
                    <div className="text-gray-900">
                      {formatDateTime(lkh.waktu_selesai)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500">Durasi:</span>
                  <span className="text-gray-900 font-medium">
                    {formatDuration(lkh.total_waktu)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Produksi:</span>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    <span className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs">
                      ✓ Baik: {lkh.baik}
                    </span>
                    <span className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded text-xs">
                      ⚠ Rusak Sebagian: {lkh.rusak_sebagian}
                    </span>
                    <span className="bg-red-50 text-red-700 px-2 py-1 rounded text-xs">
                      ✕ Rusak Total: {lkh.rusak_total}
                    </span>
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                      📦 Pallet: {lkh.pallet}
                    </span>
                  </div>
                </div>
                {lkh.note && (
                  <div>
                    <span className="text-gray-500 text-xs">Note:</span>
                    <div className="text-gray-900 text-xs">{lkh.note}</div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div className="w-full flex justify-center py-4">
          <Stack spacing={2}>
            <Pagination
              count={totalPages}
              color="primary"
              page={page}
              onChange={(e, i) => setPage(i)}
              size="small"
            />
          </Stack>
        </div>
      </div>
    </div>
  );
};

export default MonitoringLKH;
