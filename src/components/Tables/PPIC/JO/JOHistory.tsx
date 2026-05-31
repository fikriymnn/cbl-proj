import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import { JOTipeOption } from './types/jo.types';
import JOPPICCreateModal from './utils/JOPPICCreateModal';
import Pagination from '@mui/material/Pagination/Pagination';
import Stack from '@mui/material/Stack';
import JOPrintModal from './utils/JOPrintModal';

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface TiketJadwalProduksi {
  id: number;
  id_jo: number;
  item: string;
  no_jo: string;
  no_io: string;
  no_po: string;
  no_booking: string | null;
  customer: string;
  nama_bahan: string;
  qty_pcs: number;
  qty_po: number;
  qty_druk: number;
  qty_lp: number;
  status: string;
  status_tiket: string;
  type: string;
  tgl_kirim: string;
  tgl_kirim_date: string;
  tgl_kirim_update: string;
  tgl_kirim_update_date: string;
  tgl_mulai_produksi: string;
  tgl_masuk_jadwal: string;
  tgl_so: string;
  tgl_so_date: string;
  tgl_cetak: string | null;
  createdAt: string;
  updatedAt: string;
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
  is_open_label: boolean;
  createdAt: string;
  jo_mounting: JOMounting[];
  tiket_jadwal_produksi: TiketJadwalProduksi[];
}

interface APIResponse<T> {
  succes: boolean;
  data: T;
  total_page?: number;
  message?: string;
}

// ─── Helper: Tiket Status Badge ───────────────────────────────────────────────

const getTiketStatusColor = (status: string): string => {
  switch (status?.toLowerCase()) {
    case 'calculated':
      return 'bg-blue-100 text-blue-800';
    case 'history':
      return 'bg-gray-100 text-gray-700';
    case 'done':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

// ─── Expanded Row Component ───────────────────────────────────────────────────

const ExpandedTiketRow: React.FC<{
  tikets: TiketJadwalProduksi[];
  colSpan: number;
}> = ({ tikets, colSpan }) => {
  if (!tikets || tikets.length === 0) {
    return (
      <tr>
        <td colSpan={colSpan} className="bg-slate-50 px-6 py-4">
          <p className="text-xs text-gray-400 italic text-center">
            Tidak ada tiket jadwal produksi
          </p>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td colSpan={colSpan} className="bg-slate-50 px-4 py-3">
        <div className="rounded-lg border border-slate-200 overflow-hidden">
          {/* Sub-table header */}
          <div className="bg-slate-200 px-3 py-1.5 flex items-center gap-2">
            <svg
              className="w-3.5 h-3.5 text-slate-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
              Tiket Jadwal Produksi
            </span>
            <span className="ml-auto text-xs text-slate-500">
              {tikets.length} tiket
            </span>
          </div>

          {/* Sub-table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="bg-slate-100">
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    No
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    No Booking
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    Tgl Mulai Produksi
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    Tgl Kirim
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    Tgl Masuk Jadwal
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    Status Tiket
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {tikets.map((tiket, idx) => (
                  <tr
                    key={tiket.id}
                    className="hover:bg-blue-50 transition-colors"
                  >
                    <td className="px-3 py-2 whitespace-nowrap text-slate-500">
                      {idx + 1}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-slate-700">
                      {tiket.no_booking || (
                        <span className="text-slate-400 italic">-</span>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-slate-700">
                      {tiket.tgl_mulai_produksi
                        ? new Date(tiket.tgl_mulai_produksi).toLocaleDateString(
                            'id-ID',
                            {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            },
                          )
                        : '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-slate-700">
                      {tiket.tgl_kirim_update || tiket.tgl_kirim || '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-slate-700">
                      {tiket.tgl_masuk_jadwal
                        ? new Date(tiket.tgl_masuk_jadwal).toLocaleDateString(
                            'id-ID',
                            {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            },
                          )
                        : '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full font-medium capitalize ${getTiketStatusColor(
                          tiket.status,
                        )}`}
                      >
                        {tiket.status || '-'}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full font-medium capitalize ${getTiketStatusColor(
                          tiket.status_tiket,
                        )}`}
                      >
                        {tiket.status_tiket || '-'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </td>
    </tr>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const JOHistory: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [joData, setJOData] = useState<JOData[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedTipeJO, setSelectedTipeJO] =
    useState<JOTipeOption>('JO PRODUKSI');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editJOId, setEditJOId] = useState<number | null>(null);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [printJOId, setPrintJOId] = useState<number | null>(null);

  // Loading state per-row for open label action
  const [openLabelLoadingId, setOpenLabelLoadingId] = useState<number | null>(
    null,
  );

  // Expanded rows set
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // Date filter states
  const [startDateInput, setStartDateInput] = useState<string>('');
  const [endDateInput, setEndDateInput] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Sort order state
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Pagination states
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  useEffect(() => {
    fetchJOData();
  }, [page, limit, searchTerm, startDate, endDate, sortOrder]);

  const fetchJOData = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/ppic/jo`;
    try {
      setLoading(true);
      const res: AxiosResponse<APIResponse<JOData[]>> = await axios.get(url, {
        params: {
          page,
          limit,
          search: searchTerm,
          status: 'history',
          start_date: startDate || undefined,
          end_date: endDate || undefined,
          sort: sortOrder,
        },
        withCredentials: true,
      });
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

  // ── Open Label ──────────────────────────────────────────────────────────────
  const handleOpenLabel = async (item: JOData) => {
    const action = item.is_open_label ? 'menutup' : 'membuka';
    const endpoint = item.is_open_label ? 'closeLabel' : 'openLabel';

    if (
      !window.confirm(`Apakah Anda yakin ingin ${action} label untuk JO ini?`)
    )
      return;

    setOpenLabelLoadingId(item.id);
    try {
      const url = `${import.meta.env.VITE_API_LINK}/ppic/jo/${endpoint}/${
        item.id
      }`;
      await axios.put(url, {}, { withCredentials: true });
      // Optimistically update local state so user sees immediate feedback
      setJOData((prev) =>
        prev.map((jo) =>
          jo.id === item.id ? { ...jo, is_open_label: !jo.is_open_label } : jo,
        ),
      );
    } catch (error: any) {
      alert(
        `Gagal ${action} label. Silakan coba lagi. Error: ` +
          (error?.response?.data?.msg ?? error?.message ?? 'Unknown error'),
      );
    } finally {
      setOpenLabelLoadingId(null);
    }
  };

  // ── Expand/collapse toggle ──────────────────────────────────────────────────
  const toggleExpandRow = (id: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSearch = (): void => {
    setSearchTerm(searchInput);
    setPage(1);
  };
  const handleClearSearch = (): void => {
    setSearchInput('');
    setSearchTerm('');
    setPage(1);
  };
  const handleApplyDateFilter = (): void => {
    setStartDate(startDateInput);
    setEndDate(endDateInput);
    setPage(1);
  };
  const handleClearDateFilter = (): void => {
    setStartDateInput('');
    setEndDateInput('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };
  const handleSortOrderChange = (order: 'newest' | 'oldest'): void => {
    setSortOrder(order);
    setPage(1);
  };
  const handlePrintJO = (item: JOData) => {
    setPrintJOId(item.id);
    setShowPrintModal(true);
  };
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') handleSearch();
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

  const getTipeJOColor = (tipe: string): string =>
    tipe === 'JO PRODUKSI'
      ? 'bg-purple-100 text-purple-800'
      : 'bg-orange-100 text-orange-800';

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
        alert(
          'Gagal kirim JO ke jadwal. Silakan coba lagi. Error:' +
            error.response.data.msg,
        );
      }
    }
  };

  const isDateFilterActive = startDate || endDate;

  // Total columns (used for colSpan in expanded row)
  const TOTAL_COLUMNS = 13;

  return (
    <div className="">
      {/* Header Section */}
      <div className="mb-6">
        {/* Search Section */}
        <div className="mb-3">
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

        {/* Date Filter & Sort Section */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end flex-wrap">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">
              Start Date
            </label>
            <input
              type="date"
              value={startDateInput}
              onChange={(e) => setStartDateInput(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">
              End Date
            </label>
            <input
              type="date"
              value={endDateInput}
              min={startDateInput || undefined}
              onChange={(e) => setEndDateInput(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 self-end">
            <button
              onClick={handleApplyDateFilter}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Apply
            </button>
            {isDateFilterActive && (
              <button
                onClick={handleClearDateFilter}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-300"
              >
                Clear Date
              </button>
            )}
          </div>
          <div className="flex flex-col gap-1 sm:ml-auto">
            <label className="text-xs font-medium text-gray-600">Sort</label>
            <div className="flex rounded-lg overflow-hidden border border-gray-300">
              <button
                onClick={() => handleSortOrderChange('newest')}
                className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1 ${
                  sortOrder === 'newest'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
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
                    d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                  />
                </svg>
                Newest
              </button>
              <button
                onClick={() => handleSortOrderChange('oldest')}
                className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1 border-l border-gray-300 ${
                  sortOrder === 'oldest'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
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
                    d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"
                  />
                </svg>
                Oldest
              </button>
            </div>
          </div>
        </div>

        {/* Active filter badges */}
        {isDateFilterActive && (
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500">Active filters:</span>
            {startDate && (
              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full border border-blue-200">
                From: {formatDate(startDate)}
              </span>
            )}
            {endDate && (
              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full border border-blue-200">
                To: {formatDate(endDate)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
          <table className="min-w-full text-xs">
            <thead className="bg-white sticky top-0 z-10">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                  NO
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ACTION
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NOMOR
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CUSTOMER
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PRODUK
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  QTY
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TGL KIRIM
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TIPE JO
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  STATUS JO
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  STATUS PROSES
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  LABEL
                </th>
                {/* Expand column */}
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  TIKET
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={TOTAL_COLUMNS} className="px-3 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <p className="mt-2 text-sm text-gray-600">
                        Loading data...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : joData.length === 0 ? (
                <tr>
                  <td colSpan={TOTAL_COLUMNS} className="px-3 py-8 text-center">
                    <p className="text-sm text-gray-500">
                      {searchTerm
                        ? 'Tidak ada data yang sesuai dengan pencarian'
                        : 'Belum ada data Job Order'}
                    </p>
                  </td>
                </tr>
              ) : (
                joData.map((item, index) => {
                  const jadwalBlockReasons = getJadwalBlockReasons(item);
                  const isJadwalBlocked = jadwalBlockReasons.length > 0;
                  const isExpanded = expandedRows.has(item.id);
                  const tiketCount = item.tiket_jadwal_produksi?.length ?? 0;
                  const isOpenLabelLoading = openLabelLoadingId === item.id;

                  return (
                    <React.Fragment key={item.id}>
                      {/* Main row */}
                      <tr
                        className={`hover:bg-gray-50 transition-colors ${
                          isExpanded ? 'bg-blue-50' : ''
                        }`}
                      >
                        <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-900">
                          {(page - 1) * limit + index + 1}
                        </td>

                        {/* ── Action buttons ── */}
                        <td className="px-2 py-2 whitespace-nowrap text-xs font-medium">
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => handleViewJO(item)}
                              className="text-white bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-xs transition-colors"
                              title="View JO Details"
                            >
                              DETAIL
                            </button>
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

                            {/* ── Open / Close Label button ── */}
                            <button
                              onClick={() => handleOpenLabel(item)}
                              disabled={isOpenLabelLoading}
                              className={`px-3 py-1 rounded text-xs font-medium transition-colors text-white ${
                                isOpenLabelLoading
                                  ? 'bg-gray-300 cursor-not-allowed'
                                  : item.is_open_label
                                  ? 'bg-red-500 hover:bg-red-600'
                                  : 'bg-teal-500 hover:bg-teal-600'
                              }`}
                              title={
                                item.is_open_label
                                  ? 'Tutup Label'
                                  : 'Buka Label'
                              }
                            >
                              {isOpenLabelLoading ? (
                                <span className="flex items-center justify-center gap-1">
                                  <svg
                                    className="animate-spin w-3 h-3"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    />
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8v8H4z"
                                    />
                                  </svg>
                                  ...
                                </span>
                              ) : item.is_open_label ? (
                                'CLOSE LABEL'
                              ) : (
                                'OPEN LABEL'
                              )}
                            </button>
                          </div>
                        </td>

                        <td className="px-3 py-3 whitespace-nowrap text-xs font-medium text-gray-900 justify-between flex flex-col gap-1">
                          <div className="max-w-xs" title={item.no_jo}>
                            {truncateText(item.no_jo, 30)}
                          </div>
                          <div className="max-w-xs" title={item.no_so}>
                            {truncateText(item.no_so, 30)}
                          </div>
                          <div className="max-w-xs" title={item.no_io}>
                            {truncateText(item.no_io, 30)}
                          </div>
                        </td>

                        <td className="px-3 py-3 text-xs text-gray-900">
                          <div className="max-w-xs" title={item.customer}>
                            {truncateText(item.customer, 200)}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-xs text-gray-900">
                          <div className="max-w-xs" title={item.produk}>
                            {truncateText(item.produk, 200)}
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

                        {/* ── is_open_label status badge ── */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full ${
                              item.is_open_label
                                ? 'bg-teal-100 text-teal-800'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {/* Dot indicator */}
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                item.is_open_label
                                  ? 'bg-teal-500'
                                  : 'bg-gray-400'
                              }`}
                            />
                            {item.is_open_label ? 'Open' : 'Closed'}
                          </span>
                        </td>

                        {/* ── Expand / Collapse button ── */}
                        <td className="px-3 py-3 whitespace-nowrap text-center">
                          <button
                            onClick={() => toggleExpandRow(item.id)}
                            title={
                              isExpanded
                                ? 'Sembunyikan tiket'
                                : 'Lihat tiket jadwal produksi'
                            }
                            className={`inline-flex items-center justify-center w-7 h-7 rounded-full border transition-all duration-200 ${
                              isExpanded
                                ? 'bg-blue-500 border-blue-500 text-white shadow-sm'
                                : 'bg-white border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-500'
                            }`}
                          >
                            <svg
                              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                isExpanded ? 'rotate-180' : ''
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </button>
                          {tiketCount > 0 && (
                            <div
                              className={`mt-1 text-xs font-semibold ${
                                isExpanded ? 'text-blue-600' : 'text-gray-400'
                              }`}
                            >
                              {tiketCount}
                            </div>
                          )}
                        </td>
                      </tr>

                      {/* ── Expanded tiket row ── */}
                      {isExpanded && (
                        <ExpandedTiketRow
                          tikets={item.tiket_jadwal_produksi ?? []}
                          colSpan={TOTAL_COLUMNS}
                        />
                      )}
                    </React.Fragment>
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
              onChange={(e, i) => setPage(i)}
            />
          </Stack>
        </div>
      </div>

      {/* Modals */}
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
