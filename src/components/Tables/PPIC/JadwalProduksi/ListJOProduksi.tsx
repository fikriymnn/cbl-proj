import React, { useEffect, useState, useCallback, useMemo } from 'react';
import ModalXL from './ModalXL';
import ModalKosonganSmall from '../../../Modals/ModalKosonganSmall';
import axios from 'axios';
import Loading from '../../../Loading';
import convertTimeStampToDate from '../../../../utils/convertDate';
import formatInteger from '../../../../utils/formaterInteger';
import PopUpTable from './DragAndDropPopUp';
import ModalFull from './ModalFull';

// Define proper TypeScript interfaces
interface JOData {
  id: string;
  no_jo: string;
  item: string;
  qty_pcs: number;
  qty_druk: number;
  qty_lp: number;
  qty_po: number;
  tgl_kirim: string;
  status: string;
  nama_bahan: string;
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

function ListJOProduksi() {
  // Consolidated state management with proper typing
  const [isLoading, setIsLoading] = useState(false);
  const [listJO, setListJO] = useState<{ data: JOData[] }>({ data: [] });
  const [selectedJO, setSelectedJO] = useState<DetailJOData | null>(null);
  const [mapData, setMapData] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
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
      setIsLoading(true);
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
        console.log('response', response);
        return response.data;
      } catch (error) {
        console.error(`Error in API call to ${url}:`, error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Memoized API base URL
  const API_BASE = useMemo(() => import.meta.env.VITE_API_LINK, []);
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
      setIsLoading(true);
      const res = await axios.get(url, {});
      setIsLoading(false);
      setmesinList(res.data.data);
      console.log('getmesin', res.data.data);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error.data.msg);
    }
  }

  const getInitialJOList = useCallback(async () => {
    const url = `${API_BASE}/ppic/jadwalProduksi`;
    // Only use the required status_tiket parameter
    const params = {
      status_tiket: 'incoming',
      type: 'jadwal',
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
    } = {
      status_tiket: 'incoming',
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

      const url = `${API_BASE}/ppic/calculateJadwalProduksi/${id}`;
      const data = await fetchAPI(url, { is_lembur: isLembur });

      if (data) {
        // Refresh data after calculation
        await getJOList();
        return true;
      }
      return false;
    },
    [API_BASE, fetchAPI, getJOList],
  );

  const submitToSchedule = useCallback(
    async (id: string) => {
      const url = `${API_BASE}/ppic/jadwalProduksi/submit/${id}`;
      const data = await fetchAPI(url, {}, 'put');

      if (data) {
        await getJOList();
        alert('Berhasil masuk jadwal');
        return true;
      }
      return false;
    },
    [API_BASE, fetchAPI, getJOList],
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

  // Handle search input change
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    [],
  );

  // Apply filters
  const handleApplyFilters = useCallback(() => {
    getJadwalView();
    getJOList();
  }, [getJadwalView, getJOList]);
  const [bookingData, setBookingData] = useState({
    tanggal: '',
    mesin: '',
    no_io: '',
    nama_customer: '',
    nama_item: '',
    qty_pcs: '',
    qty_druk: '',
  });
  return (
    <main className="overflow-x-scroll">
      {isLoading && <Loading />}
      <div className="min-w-[700px] bg-white rounded-xl flex gap-1">
        <div className="flex w-full flex-col bg-gradient-to-br from-[#D8EAFF] to-[#E8F4FF]">
          {/* Filter Section */}
          <div className="col-span-10 grid grid-cols-1 gap-4 md:grid-cols-2 bg-white rounded-t-xl shadow-lg p-6 border border-gray-100">
            {/* Filter Section */}
            <div className="flex flex-col gap-4">
              <p className="text-sm text-primary font-semibold">
                Pilih Tanggal
              </p>

              {/* Date Range Picker */}
              <div className="flex gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-primary font-semibold min-w-[50px]">
                    Dari:
                  </p>
                  <input
                    className="rounded-lg bg-[#D8EAFF] px-3 py-2 text-sm border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) =>
                      handleDateChange('startDate', e.target.value)
                    }
                  />
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-primary font-semibold min-w-[50px]">
                    Sampai:
                  </p>
                  <input
                    className="rounded-lg bg-[#D8EAFF] px-3 py-2 text-sm border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) =>
                      handleDateChange('endDate', e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Search Field */}
              <div className="flex items-center gap-2">
                <p className="text-sm text-primary font-semibold">Cari:</p>
                <input
                  className="rounded-lg bg-[#D8EAFF] px-3 py-2 text-sm flex-1 border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  type="text"
                  placeholder="Cari JO, item, dll..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>

              {/* Apply Button */}
              <div className="flex justify-start">
                <button
                  onClick={handleApplyFilters}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Terapkan
                </button>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white shadow-xl rounded-b-xl">
            <div className="h-full overflow-y-auto rounded-b-xl max-h-[500px]">
              <table className="w-full border-collapse">
                <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider border-r border-blue-500">
                      No
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider border-r border-blue-500">
                      Job Order
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
                    <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {listJO?.data?.length > 0 ? (
                    listJO.data.map((jo, index) => (
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
                          {jo.no_jo}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700 border-r border-gray-200">
                          {jo.item}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700 border-r border-gray-200">
                          {jo.nama_bahan}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-gray-700 border-r border-gray-200">
                          {formatInteger(jo.qty_pcs)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-gray-700 border-r border-gray-200">
                          {formatInteger(jo.qty_druk)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-gray-700 border-r border-gray-200">
                          {formatInteger(jo.qty_lp)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-gray-700 border-r border-gray-200">
                          {formatInteger(jo.qty_po)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-200">
                          {jo.tgl_kirim}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          {jo.status === 'calculated' ? (
                            <button
                              onClick={() =>
                                handleViewCalculation(jo.id, index)
                              }
                              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                              VIEW
                            </button>
                          ) : (
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() =>
                                  handleCalculateJO(jo.id, index, false)
                                }
                                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                              >
                                CALCULATE
                              </button>
                              {/* <button
                          onClick={() => handleCalculateJO(jo.id, index, true)}
                          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          LEMBUR
                        </button> */}
                            </div>
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
                              <div className="grid grid-cols-2 gap-2 px-4 py-4 border-b-8 border-[#D8EAFF] bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                                <div className="flex flex-col">
                                  <div className="grid grid-cols-2 gap-2">
                                    <label className="text-black text-sm font-bold">
                                      Nomor JO
                                    </label>
                                    <label className="text-[#016ae6] uppercase text-lg font-semibold">
                                      : {jo.no_jo}
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
                                      Tanggal Kirim
                                    </label>
                                    <label className="text-[#016ae6] uppercase text-lg font-semibold">
                                      : {convertTimeStampToDate(jo.tgl_kirim)}
                                    </label>
                                  </div>
                                </div>
                                <div className="flex flex-col">
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
                                      : {formatInteger(jo.qty_lp)}
                                    </label>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <label className="text-black text-sm font-bold">
                                      Qty PO
                                    </label>
                                    <label className="text-[#016ae6] uppercase text-lg font-semibold">
                                      : {formatInteger(jo.qty_po)}
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
                                                handleOpenModalFull(
                                                  `${index}-${tahapIndex}`,
                                                  tahap.tahapan,
                                                )
                                              }
                                              className="text-blue-500 text-xs border-2 px-3 py-2 rounded-lg border-blue-400 text-center cursor-pointer hover:bg-blue-50 transition"
                                            >
                                              {formatCustomDate(tahap.tgl_from)}
                                            </label>
                                          ) : (
                                            <button
                                              onClick={() =>
                                                handleOpenModalFull(
                                                  `${index}-${tahapIndex}`,
                                                  tahap.tahapan,
                                                  tahap.jadwal_per_jam[0],
                                                )
                                              }
                                              className="text-blue-500 text-xs border-2 px-3 py-2 rounded-lg border-blue-400 text-center hover:bg-blue-50 transition"
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
                                                  onFinish={() => {
                                                    handleCloseModalFull(
                                                      `${index}-${tahapIndex}`,
                                                    );
                                                    getSingleJO(jo.id);
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
                                    className="text-xs w-full flex font-bold text-white px-3 bg-gradient-to-r from-blue-600 to-blue-700 py-2 border-blue-700 border rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md"
                                  >
                                    DETAIL
                                  </button>
                                </div>
                              </div>

                              {/* Submit Button */}
                              <div className="flex justify-center items-center pt-4">
                                <button
                                  onClick={() => {
                                    submitToSchedule(jo.id).then((success) => {
                                      if (success) {
                                        setShowCalculateIndex(null);
                                      }
                                    });
                                  }}
                                  className="text-lg w-full flex justify-center font-bold text-white px-6 bg-gradient-to-r from-green-600 to-green-700 py-4 border-green-700 border rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg"
                                >
                                  MASUK JADWAL
                                </button>
                              </div>
                            </>
                          </ModalXL>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center">
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

export default ListJOProduksi;
