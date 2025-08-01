import React, { useEffect, useState, useCallback, useMemo } from 'react';
import ModalXL from './ModalXL';
import axios from 'axios';
import Loading from '../../../Loading';
import convertTimeStampToDate from '../../../../utils/convertDate';
import formatInteger from '../../../../utils/formaterInteger';
import PopUpTable from './DragAndDropPopUp';
import ModalFull from './ModalFull';

// New Action Loading Component
const ActionLoading = () => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      <p className="text-gray-700 font-medium">Memproses permintaan...</p>
    </div>
  </div>
);

// Define proper TypeScript interfaces
interface JOData {
  id: string;
  no_jo: string;
  no_booking: string;
  item: string;
  qty_pcs: number;
  qty_druk: number;
  qty_lp: number;
  qty_po: number;
  tgl_kirim: string;
  status: string;
  nama_bahan?: string;
  no_io?: string;
  tanggal_perubahan?: any[];
}

interface JadwalPerJam {
  id: string;
  tanggal: string;
  jam: string;
}

interface TahapData {
  tahapan: string;
  kategory: string;
  kategory_drying_time: string;
  mesin: string;
  kapasitas_per_jam: number;
  drying_time: number;
  setting: number;
  kapasitas: number;
  toleransi: number;
  total_waktu: number;
  tgl_from: string;
  jadwal_per_jam: JadwalPerJam[];
}

interface DetailJOData {
  data: {
    id: string;
    no_jo: string;
    item: string;
    qty_pcs: number;
    qty_druk: number;
    tgl_kirim: string;
    status: string;
    tahap: TahapData[];
  };
}

function ListBookingJo() {
  // Consolidated state management with proper typing
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [listJO, setListJO] = useState<{ data: JOData[] }>({ data: [] });
  const [selectedJO, setSelectedJO] = useState<DetailJOData | null>(null);
  const [mapData, setMapData] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  // Add search state
  const [searchTerm, setSearchTerm] = useState<string>('');

  // UI state
  const [showListJo, setShowListJo] = useState(false);
  const [showCalculateIndex, setShowCalculateIndex] = useState<number | null>(
    null,
  );
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});
  const [showModalFull, setShowModalFull] = useState<Record<string, boolean>>(
    {},
  );
  const [selectedTahapan, setSelectedTahapan] = useState<string | null>(null);
  const [selectedData, setSelectedData] = useState<JadwalPerJam | null>(null);

  // Format date for display
  const formatCustomDate = useCallback((dateString: string) => {
    if (!dateString) return '';

    const months = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ];

    const [datePart, timePart] = dateString.split(' ');
    const [year, month, day] = datePart.split('-');

    return `${parseInt(day)} / ${months[parseInt(month) - 1]} / ${year} ${
      timePart ? '- ' + timePart.replace(/\./g, ':') : ''
    }`;
  }, []);

  // API calls with error handling
  const fetchAPI = useCallback(
    async (url: string, params = {}, method = 'get', data = {}) => {
      setIsActionLoading(true);
      try {
        const config = {
          params,
          withCredentials: true,
          ...(method !== 'get' && { data }),
        };

        const response =
          method === 'get'
            ? await axios.get(url, config)
            : method === 'put'
            ? await axios.put(url, config.data, config)
            : await axios.post(url, config.data, config);
        console.log('API Response:', response.data);
        return response.data;
      } catch (error) {
        console.error(`Error in API call to ${url}:`, error);
        return null;
      } finally {
        setIsActionLoading(false);
      }
    },
    [],
  );

  // Memoized API base URL
  const API_BASE = useMemo(() => import.meta.env.VITE_API_LINK, []);

  // Refresh data functions without date filters
  const refreshJadwalView = useCallback(async () => {
    const url = `${API_BASE}/ppic/jadwalProduksiView`;
    // Call without date parameters to get all data
    const data = await fetchAPI(url, {});

    if (data) {
      setMapData(data.data || []);
    }
  }, [API_BASE, fetchAPI]);

  const refreshJOList = useCallback(async () => {
    const url = `${API_BASE}/ppic/jadwalProduksi`;
    // Only use the required status_tiket parameter, no date filters
    const params = {
      status_tiket: 'incoming',
      type: 'booking',
    };

    const data = await fetchAPI(url, params);

    if (data) {
      setListJO(data);
    }
  }, [API_BASE, fetchAPI]);

  // 1. Create separate functions for initial data loading without filters
  const getInitialJadwalView = useCallback(async () => {
    const url = `${API_BASE}/ppic/jadwalProduksiView`;
    // Call without date parameters to get all data
    const data = await fetchAPI(url, {});

    if (data) {
      setMapData(data.data || []);
    }
  }, [API_BASE, fetchAPI]);

  const [mesinList, setmesinList] = useState<any>([]);
  async function getMasterMesin() {
    const url = `${import.meta.env.VITE_API_LINK_P1}/api/list-mesin`;
    try {
      setIsActionLoading(true);
      const res = await axios.get(url, {});
      setIsActionLoading(false);
      setmesinList(res.data.data);
    } catch (error: any) {
      setIsActionLoading(false);
      console.log(error.data.msg);
    }
  }

  const getInitialJOList = useCallback(async () => {
    const url = `${API_BASE}/ppic/jadwalProduksi`;
    // Only use the required status_tiket parameter
    const params = {
      status_tiket: 'incoming',
      type: 'booking',
    };

    const data = await fetchAPI(url, params);

    if (data) {
      setListJO(data);
    }
  }, [API_BASE, fetchAPI]);

  const getJadwalView = useCallback(async () => {
    const url = `${API_BASE}/ppic/jadwalProduksiView`;
    const data = await fetchAPI(url, {
      start_date: dateRange.startDate,
      end_date: dateRange.endDate,
    });

    if (data) {
      setMapData(data.data || []);
    }
  }, [API_BASE, fetchAPI, dateRange]);

  const getJOList = useCallback(async () => {
    const url = `${API_BASE}/ppic/jadwalProduksi`;
    // Add date range and search filters to the API call
    const params: {
      status_tiket: string;
      start_date?: string;
      end_date?: string;
      search?: string;
      type?: string;
    } = {
      status_tiket: 'incoming',
      type: 'booking',
    };

    // Only add filters if they have values
    if (dateRange.startDate) {
      params.start_date = dateRange.startDate;
    }

    if (dateRange.endDate) {
      params.end_date = dateRange.endDate;
    }

    if (searchTerm.trim()) {
      params.search = searchTerm.trim();
    }

    const data = await fetchAPI(url, params);

    if (data) {
      setListJO(data);
    }
  }, [API_BASE, fetchAPI, dateRange, searchTerm]);

  const getSingleJO = useCallback(
    async (id: string) => {
      const url = `${API_BASE}/ppic/jadwalProduksi/${id}`;
      const data = await fetchAPI(url);

      if (data) {
        setSelectedJO(data);
        return data;
      }
      return null;
    },
    [API_BASE, fetchAPI],
  );

  const calculateJO = useCallback(
    async (id: string, isLembur: boolean) => {
      if (!window.confirm(`Lakukan Kalkulasi pada JO ini?`)) {
        return false;
      }

      setIsActionLoading(true);
      try {
        const url = `${API_BASE}/ppic/calculateJadwalProduksi/${id}`;
        const response = await axios.get(url, {
          params: { is_lembur: isLembur },
          withCredentials: true,
        });

        if (response.data) {
          // Refresh data without date filters
          await refreshJOList();
          await refreshJadwalView();
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error calculating JO:', error);
        return false;
      } finally {
        setIsActionLoading(false);
      }
    },
    [API_BASE, refreshJOList, refreshJadwalView],
  );

  const submitToSchedule = useCallback(
    async (id: string) => {
      setIsActionLoading(true);
      try {
        const url = `${API_BASE}/ppic/jadwalProduksi/submit/${id}`;
        const response = await axios.put(url, {}, { withCredentials: true });

        if (response.data) {
          // Refresh data without date filters
          await refreshJOList();
          await refreshJadwalView();
          alert('Berhasil masuk jadwal');
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error submitting to schedule:', error);
        return false;
      } finally {
        setIsActionLoading(false);
      }
    },
    [API_BASE, refreshJOList, refreshJadwalView],
  );

  // Handle UI actions
  const handleViewCalculation = useCallback(
    async (id: string, index: number) => {
      const data = await getSingleJO(id);
      if (data) {
        setShowCalculateIndex(index);
      }
    },
    [getSingleJO],
  );

  const handleCalculateJO = useCallback(
    async (id: string, index: number, isLembur: boolean) => {
      const success = await calculateJO(id, isLembur);
      if (success) {
        handleViewCalculation(id, index);
      }
    },
    [calculateJO, handleViewCalculation],
  );

  const toggleDetailsView = useCallback((id: string) => {
    setShowDetails((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleOpenModalFull = useCallback(
    (index: string, tahapan: string, data: JadwalPerJam | null = null) => {
      setShowModalFull((prev) => ({ ...prev, [index]: true }));
      setSelectedTahapan(tahapan);
      setSelectedData(data);
    },
    [],
  );

  const handleCloseModalFull = useCallback((index: string) => {
    setShowModalFull((prev) => ({ ...prev, [index]: false }));
    setSelectedData(null);
  }, []);

  useEffect(() => {
    getMasterMesin();
    // Load ALL data initially without filters
    getInitialJadwalView();
    getInitialJOList();
  }, [getInitialJadwalView, getInitialJOList]);

  // Handle date range changes
  const handleDateChange = useCallback(
    (field: 'startDate' | 'endDate', value: string) => {
      setDateRange((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleSearchChange = useCallback((e: any) => {
    setSearchTerm(e.target.value);
  }, []);

  // Apply filters
  const handleApplyFilters = useCallback(() => {
    getJadwalView();
    getJOList();
  }, [getJadwalView, getJOList]);

  const [editTanggal, setEditTanggal] = useState<any>(null);

  async function updateTanggalKirim(id: any, tanggal: any) {
    if (!tanggal) {
      alert('Pilih tanggal terlebih dahulu');
      return;
    }

    setIsActionLoading(true);
    try {
      const url = `${import.meta.env.VITE_API_LINK}/ppic/perubahanTglKirim`;

      const res = await axios.post(
        url,
        { id_tiket: id, tgl_kirim: tanggal },
        { withCredentials: true },
      );

      if (res.data.status_code == 200) {
        await refreshJOList();
        await refreshJadwalView();
      }
    } catch (error: any) {
      console.log(error);
    } finally {
      setIsActionLoading(false);
    }
  }
  async function getTanggalPerubahan() {
    setIsActionLoading(true);
    try {
      const url = `${import.meta.env.VITE_API_LINK}/ppic/perubahanTglKirim`;

      const res = await axios.get(
        url,

        { withCredentials: true },
      );

      console.log(res.data);
    } catch (error: any) {
      console.log(error);
    } finally {
      setIsActionLoading(false);
    }
  }
  useEffect(() => {
    getTanggalPerubahan();
  }, []);
  // Add new state for detail modal and filter
  const [showDetailModal, setShowDetailModal] = useState<
    Record<string, boolean>
  >({});

  const [statusPerubahanFilter, setStatusPerubahanFilter] =
    useState<string>('all'); // 'all', 'has_changes', 'no_changes'

  // Add helper function to count approved changes
  const getApprovedChangesCount = useCallback((tanggalPerubahan: any[]) => {
    if (!tanggalPerubahan || !Array.isArray(tanggalPerubahan)) return 0;
    return tanggalPerubahan.filter((item) => item.status === 'approved').length;
  }, []);

  // Add function to handle detail modal
  const handleOpenDetailModal = useCallback((joId: string) => {
    setShowDetailModal((prev) => ({ ...prev, [joId]: true }));
  }, []);

  const handleCloseDetailModal = useCallback((joId: string) => {
    setShowDetailModal((prev) => ({ ...prev, [joId]: false }));
  }, []);
  const filteredJOData = useMemo(() => {
    if (!listJO?.data) return [];

    let filtered = listJO.data;

    // Apply status filter first
    if (statusPerubahanFilter !== 'all') {
      filtered = filtered.filter((jo) => {
        const approvedCount = getApprovedChangesCount(
          jo.tanggal_perubahan || [],
        );

        if (statusPerubahanFilter === 'has_changes') {
          return approvedCount > 0;
        } else if (statusPerubahanFilter === 'no_changes') {
          return approvedCount === 0;
        }

        return true;
      });
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((jo) => {
        // Search in multiple fields - adjust these based on your data structure
        const searchableFields = [
          jo.no_booking,
          jo.item,
          jo.nama_bahan,
          jo.no_io,

          // Add other fields you want to search in
        ];

        return searchableFields.some(
          (field) =>
            field && field.toString().toLowerCase().includes(searchLower),
        );
      });
    }

    return filtered;
  }, [
    listJO?.data,
    statusPerubahanFilter,
    searchTerm,
    getApprovedChangesCount,
  ]);
  return (
    <main className="overflow-x-scroll">
      {isLoading && <Loading />}
      {isActionLoading && <ActionLoading />}
      <div className="min-w-[700px] bg-white rounded-xl flex gap-1">
        <div className="flex w-full flex-col bg-gradient-to-br from-[#D8EAFF] to-[#E8F4FF]">
          <div className="col-span-10 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z"
                  />
                </svg>
                Filter & Pencarian Data
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Gunakan filter di bawah untuk menyaring data sesuai kebutuhan
              </p>
            </div>

            {/* Filter Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Date Range Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <label className="text-sm font-semibold text-gray-700">
                      Rentang Tanggal
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">
                        Tanggal Mulai
                      </label>
                      <input
                        className="w-full rounded-lg bg-gray-50 border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        type="date"
                        onChange={(e) =>
                          handleDateChange('startDate', e.target.value)
                        }
                        disabled={isActionLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">
                        Tanggal Akhir
                      </label>
                      <input
                        className="w-full rounded-lg bg-gray-50 border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        type="date"
                        onChange={(e) =>
                          handleDateChange('endDate', e.target.value)
                        }
                        disabled={isActionLoading}
                      />
                    </div>
                  </div>
                </div>

                {/* Search and Status Section */}
                <div className="space-y-4">
                  {/* Search Field */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-blue-600"
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
                      <label className="text-sm font-semibold text-gray-700">
                        Pencarian
                      </label>
                    </div>
                    <input
                      className="w-full rounded-lg bg-gray-50 border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      type="text"
                      placeholder="Cari berdasarkan No Booking, item, atau data lainnya..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      disabled={isActionLoading}
                    />
                  </div>

                  {/* Status Filter */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <label className="text-sm font-semibold text-gray-700">
                        Status Perubahan
                      </label>
                    </div>
                    <select
                      className="w-full rounded-lg bg-gray-50 border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      value={statusPerubahanFilter}
                      onChange={(e) => setStatusPerubahanFilter(e.target.value)}
                      disabled={isActionLoading}
                    >
                      <option value="all">Tampilkan Semua Data</option>
                      <option value="has_changes">
                        Hanya Data dengan Perubahan Tanggal
                      </option>
                      <option value="no_changes">
                        Hanya Data Tanpa Perubahan
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-end pt-6 mt-6 border-t border-gray-200">
                <button
                  onClick={handleApplyFilters}
                  disabled={isActionLoading}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isActionLoading ? (
                    <>
                      <svg
                        className="animate-spin w-4 h-4"
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
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Memproses...
                    </>
                  ) : (
                    <>
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Terapkan Filter
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white shadow-xl rounded-b-xl">
            <div className="h-full overflow-y-auto rounded-b-xl">
              <table className="w-full border-collapse">
                <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider border-r border-blue-500">
                      No
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider border-r border-blue-500">
                      No Booking
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider border-r border-blue-500">
                      No IO
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider border-r border-blue-500">
                      Nama Item
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider border-r border-blue-500">
                      Nama Bahan
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider border-r border-blue-500">
                      Qty Pcs
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider border-r border-blue-500">
                      Qty Druk
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider border-r border-blue-500">
                      Qty LP
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider border-r border-blue-500">
                      Qty PO
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider border-r border-blue-500">
                      Tanggal Kirim
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider border-r border-blue-500">
                      Status Perubahan
                    </th>
                    <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredJOData?.length > 0 ? (
                    filteredJOData.map((jo, index) => {
                      const approvedChangesCount = getApprovedChangesCount(
                        jo.tanggal_perubahan || [],
                      );

                      return (
                        <tr
                          key={jo.id}
                          className={`hover:bg-blue-50 transition-colors duration-150 ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }`}
                        >
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">
                            {index + 1}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">
                            {jo.no_booking}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-200">
                            {jo.no_io || '-'}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-700 border-r border-gray-200">
                            {jo.item}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-700 border-r border-gray-200">
                            {jo.nama_bahan || '-'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-gray-700 border-r border-gray-200">
                            {formatInteger(jo.qty_pcs)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-gray-700 border-r border-gray-200">
                            {formatInteger(jo.qty_druk)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-gray-700 border-r border-gray-200">
                            {formatInteger(jo.qty_lp) || 0}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-gray-700 border-r border-gray-200">
                            {formatInteger(jo.qty_po) || 0}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-200">
                            {jo.tgl_kirim}
                          </td>
                          {/* Status Perubahan Column */}
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-200">
                            {approvedChangesCount > 0 ? (
                              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold">
                                Perubahan Tanggal {approvedChangesCount} Kali
                              </span>
                            ) : (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                                Tidak Ada Perubahan
                              </span>
                            )}
                          </td>
                          {/* Modified Action Column */}
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <div className="flex flex-col gap-2">
                              {/* Detail Button */}
                              <button
                                onClick={() => handleOpenDetailModal(jo.id)}
                                disabled={isActionLoading}
                                className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                DETAIL
                              </button>

                              {/* Existing Calculate/View buttons */}
                              {jo.status === 'calculated' ? (
                                <button
                                  onClick={() =>
                                    handleViewCalculation(jo.id, index)
                                  }
                                  disabled={isActionLoading}
                                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  VIEW
                                </button>
                              ) : (
                                <button
                                  onClick={() =>
                                    handleCalculateJO(jo.id, index, false)
                                  }
                                  disabled={isActionLoading}
                                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  CALCULATE
                                </button>
                              )}
                            </div>

                            {/* Detail Modal */}
                            {showDetailModal[jo.id] && (
                              <ModalXL
                                isOpen={showDetailModal[jo.id]}
                                onClose={() => handleCloseDetailModal(jo.id)}
                                judul={`Detail Perubahan Tanggal - ${jo.no_booking}`}
                              >
                                <div className="p-6">
                                  {/* JO Information */}
                                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 mb-6">
                                    <h3 className="text-lg font-bold text-blue-800 mb-4">
                                      Informasi Job Order
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-sm font-semibold text-gray-700">
                                          No Booking:
                                        </p>
                                        <p className="text-blue-600 font-bold">
                                          {jo.no_booking}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-semibold text-gray-700">
                                          No IO:
                                        </p>
                                        <p className="text-blue-600 font-bold">
                                          {jo.no_io || '-'}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-semibold text-gray-700">
                                          Item:
                                        </p>
                                        <p className="text-blue-600 font-bold">
                                          {jo.item}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-semibold text-gray-700">
                                          Tanggal Kirim:
                                        </p>
                                        <p className="text-blue-600 font-bold">
                                          {jo.tgl_kirim}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* History Perubahan Tanggal */}
                                  <div className="bg-white rounded-lg border border-gray-200">
                                    <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-3 rounded-t-lg">
                                      <h3 className="text-lg font-bold">
                                        History Perubahan Tanggal
                                      </h3>
                                      <p className="text-sm opacity-90">
                                        Total Perubahan Disetujui:{' '}
                                        {getApprovedChangesCount(
                                          jo.tanggal_perubahan || [],
                                        )}{' '}
                                        kali
                                      </p>
                                    </div>

                                    <div className="p-4">
                                      {jo.tanggal_perubahan &&
                                      jo.tanggal_perubahan.length > 0 ? (
                                        <div className="space-y-4">
                                          {jo.tanggal_perubahan.map(
                                            (perubahan: any, idx: number) => (
                                              <div
                                                key={perubahan.id}
                                                className={`border rounded-lg p-4 ${
                                                  perubahan.status ===
                                                  'approved'
                                                    ? 'border-green-200 bg-green-50'
                                                    : perubahan.status ===
                                                      'rejected'
                                                    ? 'border-red-200 bg-red-50'
                                                    : 'border-yellow-200 bg-yellow-50'
                                                }`}
                                              >
                                                <div className="flex justify-between items-start mb-3">
                                                  <h4 className="font-semibold text-gray-800">
                                                    Perubahan #{idx + 1}
                                                  </h4>
                                                  <span
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                      perubahan.status ===
                                                      'approved'
                                                        ? 'bg-green-100 text-green-800'
                                                        : perubahan.status ===
                                                          'rejected'
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                    }`}
                                                  >
                                                    {perubahan.status}
                                                  </span>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                  <div>
                                                    <p className="text-gray-600">
                                                      Tanggal Dari:
                                                    </p>
                                                    <p className="font-semibold text-gray-800">
                                                      {new Date(
                                                        perubahan.from_tgl,
                                                      ).toLocaleDateString(
                                                        'id-ID',
                                                      )}
                                                    </p>
                                                  </div>
                                                  <div>
                                                    <p className="text-gray-600">
                                                      Tanggal Ke:
                                                    </p>
                                                    <p className="font-semibold text-gray-800">
                                                      {new Date(
                                                        perubahan.to_tgl,
                                                      ).toLocaleDateString(
                                                        'id-ID',
                                                      )}
                                                    </p>
                                                  </div>
                                                  <div>
                                                    <p className="text-gray-600">
                                                      Nama Approval:
                                                    </p>
                                                    <p className="font-semibold text-gray-800">
                                                      {perubahan.nama_approval}
                                                    </p>
                                                  </div>
                                                  <div>
                                                    <p className="text-gray-600">
                                                      Tanggal Dibuat:
                                                    </p>
                                                    <p className="font-semibold text-gray-800">
                                                      {new Date(
                                                        perubahan.createdAt,
                                                      ).toLocaleDateString(
                                                        'id-ID',
                                                      )}
                                                    </p>
                                                  </div>
                                                </div>
                                              </div>
                                            ),
                                          )}
                                        </div>
                                      ) : (
                                        <div className="text-center py-8">
                                          <div className="text-gray-400 text-4xl mb-4">
                                            📅
                                          </div>
                                          <p className="text-gray-500">
                                            Tidak ada history perubahan tanggal
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </ModalXL>
                            )}
                          </td>

                          {/* Calculation Modal */}
                          {showCalculateIndex === index && selectedJO && (
                            <ModalXL
                              isOpen={showCalculateIndex === index}
                              onClose={() => setShowCalculateIndex(null)}
                              judul="Rumus Kalkulasi"
                            >
                              <>
                                {/* JO Details */}
                                <div className="pt-4"></div>
                                <div className="grid grid-cols-2 gap-6 px-6 py-6 border-b-4 border-[#D8EAFF] bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                                  <div className="flex flex-col space-y-4">
                                    <div className="grid grid-cols-2 gap-2">
                                      <label className="text-black text-sm font-bold">
                                        Nomor Booking
                                      </label>
                                      <label className="text-[#016ae6] uppercase text-lg font-semibold">
                                        : {jo.no_booking}
                                      </label>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <label className="text-black text-sm font-bold">
                                        No IO
                                      </label>
                                      <label className="text-[#016ae6] uppercase text-lg font-semibold">
                                        : {jo.no_io || '-'}
                                      </label>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <label className="text-black text-sm font-bold">
                                        Item
                                      </label>
                                      <label className="text-[#016ae6] uppercase text-lg font-semibold">
                                        : {jo.item}
                                      </label>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <label className="text-black text-sm font-bold">
                                        Nama Bahan
                                      </label>
                                      <label className="text-[#016ae6] uppercase text-lg font-semibold">
                                        : {jo.nama_bahan || '-'}
                                      </label>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <label className="text-black text-sm font-bold">
                                        Tanggal Kirim
                                      </label>
                                      <label className="text-[#016ae6] uppercase text-lg font-semibold">
                                        : {convertTimeStampToDate(jo.tgl_kirim)}
                                      </label>
                                      <label className="text-black text-sm font-bold">
                                        Edit Tanggal Kirim
                                      </label>
                                      <div className="flex gap-2">
                                        <label className="text-[#016ae6] uppercase text-lg font-semibold">
                                          :{' '}
                                        </label>
                                        <input
                                          type="date"
                                          onChange={(e) =>
                                            setEditTanggal(e.target.value)
                                          }
                                          disabled={isActionLoading}
                                          className="disabled:opacity-50 border-2 border-[#016ae6] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        />
                                      </div>
                                      {editTanggal == null ? (
                                        <></>
                                      ) : (
                                        <>
                                          <button
                                            onClick={() => {
                                              updateTanggalKirim(
                                                jo.id,
                                                editTanggal,
                                              );
                                              console.log(jo.id, editTanggal);
                                            }}
                                            disabled={isActionLoading}
                                            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                          >
                                            REQUEST PERUBAHAN TANGGAL
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex flex-col space-y-4">
                                    <div className="grid grid-cols-2 gap-2">
                                      <label className="text-black text-sm font-bold">
                                        Qty Druk
                                      </label>
                                      <label className="text-[#016ae6] uppercase text-lg font-semibold">
                                        : {formatInteger(jo.qty_druk)}
                                      </label>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <label className="text-black text-sm font-bold">
                                        Qty Pcs
                                      </label>
                                      <label className="text-[#016ae6] uppercase text-lg font-semibold">
                                        : {formatInteger(jo.qty_pcs)}
                                      </label>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <label className="text-black text-sm font-bold">
                                        Qty LP
                                      </label>
                                      <label className="text-[#016ae6] uppercase text-lg font-semibold">
                                        : {formatInteger(jo.qty_lp) || 0}
                                      </label>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <label className="text-black text-sm font-bold">
                                        Qty PO
                                      </label>
                                      <label className="text-[#016ae6] uppercase text-lg font-semibold">
                                        : {formatInteger(jo.qty_po) || 0}
                                      </label>
                                    </div>
                                  </div>
                                </div>

                                {/* Tahapan Data */}
                                <div className="flex overflow-x-scroll max-w-screen border-b-8 border-[#D8EAFF] gap-2 px-4 py-4 bg-gray-50">
                                  <div className="w-[150px] flex flex-col">
                                    <label className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px] bg-blue-100 px-2">
                                      TAHAPAN
                                    </label>
                                    <label className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px] bg-blue-100 px-2">
                                      TANGGAL
                                    </label>
                                    {showDetails[jo.id] && (
                                      <>
                                        <label className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px] bg-blue-100 px-2">
                                          KATEGORI
                                        </label>
                                        <label className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px] bg-blue-100 px-2">
                                          DRYING TIME
                                        </label>
                                        <label className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px] bg-blue-100 px-2">
                                          MESIN
                                        </label>
                                        <label className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px] bg-blue-100 px-2">
                                          KAPASITAS/JAM
                                        </label>
                                        <label className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px] bg-blue-100 px-2">
                                          DRYING TIME (JAM)
                                        </label>
                                        <label className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px] bg-blue-100 px-2">
                                          SETTING (JAM)
                                        </label>
                                        <label className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px] bg-blue-100 px-2">
                                          KAPASITAS (JAM)
                                        </label>
                                        <label className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px] bg-blue-100 px-2">
                                          TOLERANSI
                                        </label>
                                        <label className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px] bg-blue-100 px-2">
                                          TOTAL WAKTU
                                        </label>
                                      </>
                                    )}
                                  </div>

                                  <div className="flex overflow-x-scroll max-w-screen">
                                    {selectedJO.data?.tahap?.map(
                                      (tahap, tahapIndex) => (
                                        <div
                                          key={tahapIndex}
                                          className="min-w-[150px] flex flex-col justify-center"
                                        >
                                          <label className="text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px] bg-white">
                                            {tahap.tahapan}
                                          </label>
                                          <div className="justify-center border-2 border-stroke flex items-center h-[50px] bg-white">
                                            {tahap?.jadwal_per_jam?.length ===
                                            0 ? (
                                              <label
                                                onClick={() =>
                                                  !isActionLoading &&
                                                  handleOpenModalFull(
                                                    `${index}-${tahapIndex}`,
                                                    tahap.tahapan,
                                                  )
                                                }
                                                className={`text-blue-500 text-xs border-2 px-3 py-2 rounded-lg border-blue-400 text-center cursor-pointer hover:bg-blue-50 transition ${
                                                  isActionLoading
                                                    ? 'opacity-50 cursor-not-allowed'
                                                    : ''
                                                }`}
                                              >
                                                {formatCustomDate(
                                                  tahap.tgl_from,
                                                )}
                                              </label>
                                            ) : (
                                              <button
                                                onClick={() =>
                                                  !isActionLoading &&
                                                  handleOpenModalFull(
                                                    `${index}-${tahapIndex}`,
                                                    tahap.tahapan,
                                                    tahap.jadwal_per_jam[0],
                                                  )
                                                }
                                                disabled={isActionLoading}
                                                className="text-blue-500 text-xs border-2 px-3 py-2 rounded-lg border-blue-400 text-center hover:bg-blue-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                              >
                                                {convertTimeStampToDate(
                                                  tahap.jadwal_per_jam[0]
                                                    ?.tanggal,
                                                )}{' '}
                                                - {tahap.jadwal_per_jam[0]?.jam}
                                              </button>
                                            )}

                                            {/* Modal Full Component */}
                                            {showModalFull[
                                              `${index}-${tahapIndex}`
                                            ] && (
                                              <ModalFull
                                                isOpen={
                                                  showModalFull[
                                                    `${index}-${tahapIndex}`
                                                  ]
                                                }
                                                onClose={() =>
                                                  handleCloseModalFull(
                                                    `${index}-${tahapIndex}`,
                                                  )
                                                }
                                                judul={`Jadwal ${tahap.tahapan} - ${jo.no_jo}`}
                                              >
                                                <div className="col-span-5 flex flex-col gap-1">
                                                  <PopUpTable
                                                    dataMap={selectedData}
                                                    onClose={() => {
                                                      setSelectedData(null);
                                                      handleCloseModalFull(
                                                        `${index}-${tahapIndex}`,
                                                      );
                                                    }}
                                                    onFinish={async () => {
                                                      handleCloseModalFull(
                                                        `${index}-${tahapIndex}`,
                                                      );
                                                      await getSingleJO(jo.id);
                                                      // Refresh data without date filters
                                                      await refreshJOList();
                                                      await refreshJadwalView();
                                                    }}
                                                  />
                                                </div>
                                              </ModalFull>
                                            )}
                                          </div>

                                          {/* Details info */}
                                          {showDetails[jo.id] && (
                                            <>
                                              <label className="text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px] bg-white">
                                                {tahap.kategory}
                                              </label>
                                              <label className="text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px] bg-white">
                                                {tahap.kategory_drying_time}
                                              </label>
                                              <label className="text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px] bg-white">
                                                {tahap.mesin}
                                              </label>
                                              <label className="text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px] bg-white">
                                                {tahap.kapasitas_per_jam}
                                              </label>
                                              <label className="text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px] bg-white">
                                                {tahap.drying_time}
                                              </label>
                                              <label className="text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px] bg-white">
                                                {tahap.setting}
                                              </label>
                                              <label className="text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px] bg-white">
                                                {tahap.kapasitas}
                                              </label>
                                              <label className="text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px] bg-white">
                                                {tahap.toleransi}
                                              </label>
                                              <label className="text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px] bg-white">
                                                {tahap.total_waktu}
                                              </label>
                                            </>
                                          )}
                                        </div>
                                      ),
                                    )}
                                  </div>

                                  {/* Detail toggle button */}
                                  <div>
                                    <button
                                      onClick={() => toggleDetailsView(jo.id)}
                                      disabled={isActionLoading}
                                      className="text-xs w-full flex font-bold text-white px-3 bg-gradient-to-r from-blue-600 to-blue-700 py-2 border-blue-700 border rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      DETAIL
                                    </button>
                                  </div>
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-center items-center pt-4">
                                  <button
                                    onClick={() => {
                                      submitToSchedule(jo.id).then(
                                        (success) => {
                                          if (success) {
                                            setShowCalculateIndex(null);
                                          }
                                        },
                                      );
                                    }}
                                    disabled={isActionLoading}
                                    className="text-lg w-full flex justify-center font-bold text-white px-6 bg-gradient-to-r from-green-600 to-green-700 py-4 border-green-700 border rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    MASUK JADWAL
                                  </button>
                                </div>
                              </>
                            </ModalXL>
                          )}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={12} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="text-gray-400 text-6xl mb-4">📋</div>
                          <p className="text-gray-500 text-lg">
                            Tidak ada data yang ditemukan
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default ListBookingJo;
