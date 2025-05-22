import React, { useEffect, useState, useCallback, useMemo } from 'react';
import ModalXL from './ModalXL';
import ModalKosonganSmall from '../../../Modals/ModalKosonganSmall';
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
  tgl_kirim: string;
  status: string;
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
      setIsLoading(true);
      const res = await axios.get(url, {});
      setIsLoading(false);
      setmesinList(res.data.data);
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

  const [editTanggal, setEditTanggal] = useState<any>(null);

  async function updateTanggalKirim(id: any, tanggal: any) {
    if (!tanggal) {
      alert('Pilih tanggal terlebih dahulu');
      return;
    }

    setIsActionLoading(true);
    try {
      const url = `${
        import.meta.env.VITE_API_LINK
      }/ppic/jadwalProduksi/editTglKirim/${id}`;

      const res = await axios.put(
        url,
        { tgl_kirim: tanggal },
        { withCredentials: true },
      );

      console.log(res);

      if (res.data.status_code == 200) {
        await calculateJO(id, false);
        // Refresh data without date filters
        await refreshJOList();
        await refreshJadwalView();
      }
    } catch (error: any) {
      console.log(error);
    } finally {
      setIsActionLoading(false);
    }
  }

  return (
    <main className="overflow-x-scroll">
      {isLoading && <Loading />}
      {isActionLoading && <ActionLoading />}
      <div className="min-w-[700px] bg-white rounded-xl flex gap-1">
        <div className="flex w-full flex-col bg-[#D8EAFF]">
          {/* Filter Section */}
          <div className="col-span-10 grid grid-cols-1 gap-4 md:grid-cols-2 bg-white rounded-t-md p-4">
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
                    className="rounded-md bg-[#D8EAFF] px-3 py-1 text-sm"
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) =>
                      handleDateChange('startDate', e.target.value)
                    }
                    disabled={isActionLoading}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-primary font-semibold min-w-[50px]">
                    Sampai:
                  </p>
                  <input
                    className="rounded-md bg-[#D8EAFF] px-3 py-1 text-sm"
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) =>
                      handleDateChange('endDate', e.target.value)
                    }
                    disabled={isActionLoading}
                  />
                </div>
              </div>

              {/* Search Field */}
              <div className="flex items-center gap-2">
                <p className="text-sm text-primary font-semibold">Cari:</p>
                <input
                  className="rounded-md bg-[#D8EAFF] px-3 py-1 text-sm flex-1"
                  type="text"
                  placeholder="Cari JO, item, dll..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  disabled={isActionLoading}
                />
              </div>

              {/* Apply Button */}
              <div className="flex justify-start">
                <button
                  onClick={handleApplyFilters}
                  disabled={isActionLoading}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Terapkan
                </button>
              </div>
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 bg-white border-b-8 border-[#D8EAFF] px-[1%] py-[1%]">
            <p className="text-[#646464] text-xs font-bold col-span-2">
              No Booking
            </p>
            <p className="text-[#646464] text-xs font-bold col-span-2">
              Nama Item
            </p>
            <p className="text-[#646464] text-xs font-bold">Qty Pcs</p>
            <p className="text-[#646464] text-xs font-bold">Qty Druk</p>
            <p className="text-[#646464] text-xs font-bold col-span-4">
              Tanggal Kirim
            </p>
          </div>

          {/* JO List */}
          <div className="max-h-[500px] overflow-y-scroll">
            {listJO?.data?.length > 0 ? (
              listJO.data.map((jo, index) => (
                <div
                  key={jo.id}
                  className="grid grid-cols-12 bg-white border-b-8 border-[#D8EAFF] px-[1%] py-[1%]"
                >
                  <p className="text-[#646464] text-sm col-span-2">
                    {jo.no_booking}
                  </p>
                  <p className="text-[#646464] text-sm col-span-2">{jo.item}</p>
                  <p className="text-[#646464] text-sm">
                    {formatInteger(jo.qty_pcs)}
                  </p>
                  <p className="text-[#646464] text-sm">
                    {formatInteger(jo.qty_druk)}
                  </p>
                  <p className="text-[#646464] text-sm col-span-4">
                    {jo.tgl_kirim}
                  </p>
                  <div className="col-span-2">
                    {jo.status === 'calculated' ? (
                      <button
                        onClick={() => handleViewCalculation(jo.id, index)}
                        disabled={isActionLoading}
                        className="text-[#0065de] text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        VIEW
                      </button>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleCalculateJO(jo.id, index, false)}
                          disabled={isActionLoading}
                          className="text-[#0065de] text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          CALCULATE
                        </button>
                        {/* <button
                          onClick={() => handleCalculateJO(jo.id, index, true)}
                          disabled={isActionLoading}
                          className="text-[#0065de] text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          LEMBUR
                        </button> */}
                      </div>
                    )}
                  </div>

                  {/* Calculation Modal */}
                  {showCalculateIndex === index && selectedJO && (
                    <ModalXL
                      isOpen={showCalculateIndex === index}
                      onClose={() => setShowCalculateIndex(null)}
                      judul="Rumus Kalkulasi"
                    >
                      <>
                        {/* JO Details */}
                        <div className="grid grid-cols-2 gap-2 px-4 py-4 border-b-8 border-[#D8EAFF]">
                          <div className="flex flex-col">
                            <div className="grid grid-cols-2 gap-2">
                              <label className="text-black text-xs font-bold">
                                Nomor Booking
                              </label>
                              <label className="text-[#016ae6] uppercase text-xl font-normal">
                                : {jo.no_booking}
                              </label>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <label className="text-black text-xs font-bold">
                                Item
                              </label>
                              <label className="text-[#016ae6] uppercase text-xl font-normal">
                                : {jo.item}
                              </label>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <label className="text-black text-xs font-bold">
                                Tanggal Kirim
                              </label>
                              <label className="text-[#016ae6] uppercase text-xl font-normal">
                                : {convertTimeStampToDate(jo.tgl_kirim)}
                              </label>
                              <label className="text-black text-xs font-bold">
                                Edit Tanggal Kirim
                              </label>
                              <div className="flex gap-1">
                                <label className="text-[#016ae6] uppercase text-xl font-normal">
                                  :{' '}
                                </label>

                                <input
                                  type="date"
                                  onChange={(e) =>
                                    setEditTanggal(e.target.value)
                                  }
                                  disabled={isActionLoading}
                                  className="disabled:opacity-50 border-2 border-[#016ae6] rounded-md px-2 py-1 text-xs"
                                />
                              </div>
                              {editTanggal == null ? (
                                <></>
                              ) : (
                                <>
                                  <button
                                    onClick={() => {
                                      updateTanggalKirim(jo.id, editTanggal);
                                      console.log(jo.id, editTanggal);
                                    }}
                                    disabled={isActionLoading}
                                    className="bg-blue-500 text-white px-2 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Simpan Tanggal Baru
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <div className="grid grid-cols-2 gap-2">
                              <label className="text-black text-xs font-bold">
                                Qty Druk
                              </label>
                              <label className="text-[#016ae6] uppercase text-xl font-normal">
                                : {formatInteger(jo.qty_druk)}
                              </label>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <label className="text-black text-xs font-bold">
                                Qty Pcs
                              </label>
                              <label className="text-[#016ae6] uppercase text-xl font-normal">
                                : {formatInteger(jo.qty_pcs)}
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Tahapan Data */}
                        <div className="flex overflow-x-scroll max-w-screen border-b-8 border-[#D8EAFF] gap-2 px-4 py-4">
                          <div className="w-[150px] flex flex-col">
                            <label className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]">
                              TAHAPAN
                            </label>
                            <label className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]">
                              TANGGAL
                            </label>
                            {showDetails[jo.id] && (
                              <>
                                <label className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]">
                                  KATEGORI
                                </label>
                                <label className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]">
                                  DRYING TIME
                                </label>
                                <label className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]">
                                  MESIN
                                </label>
                                <label className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]">
                                  KAPASITAS/JAM
                                </label>
                                <label className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]">
                                  DRYING TIME (JAM)
                                </label>
                                <label className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]">
                                  SETTING (JAM)
                                </label>
                                <label className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]">
                                  KAPASITAS (JAM)
                                </label>
                                <label className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]">
                                  TOLERANSI
                                </label>
                                <label className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]">
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
                                  <label className="text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]">
                                    {tahap.tahapan}
                                  </label>
                                  <div className="justify-center border-2 border-stroke flex items-center h-[50px]">
                                    {tahap?.jadwal_per_jam?.length === 0 ? (
                                      <label
                                        onClick={() =>
                                          !isActionLoading &&
                                          handleOpenModalFull(
                                            `${index}-${tahapIndex}`,
                                            tahap.tahapan,
                                          )
                                        }
                                        className={`text-blue-400 text-xs border-2 px-2 py-1 rounded-md border-blue-400 text-center cursor-pointer ${
                                          isActionLoading
                                            ? 'opacity-50 cursor-not-allowed'
                                            : ''
                                        }`}
                                      >
                                        {formatCustomDate(tahap.tgl_from)}
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
                                        className="text-blue-400 text-xs border-2 px-2 py-1 rounded-md border-blue-400 text-center disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        {convertTimeStampToDate(
                                          tahap.jadwal_per_jam[0]?.tanggal,
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
                                      <label className="text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]">
                                        {tahap.kategory}
                                      </label>
                                      <label className="text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]">
                                        {tahap.kategory_drying_time}
                                      </label>
                                      <label className="text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]">
                                        {tahap.mesin}
                                      </label>
                                      <label className="text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]">
                                        {tahap.kapasitas_per_jam}
                                      </label>
                                      <label className="text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]">
                                        {tahap.drying_time}
                                      </label>
                                      <label className="text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]">
                                        {tahap.setting}
                                      </label>
                                      <label className="text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]">
                                        {tahap.kapasitas}
                                      </label>
                                      <label className="text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]">
                                        {tahap.toleransi}
                                      </label>
                                      <label className="text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]">
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
                              className="text-xs w-full flex font-bold text-white px-1 bg-blue-700 py-2 border-blue-700 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              DETAIL
                            </button>
                          </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-center items-center pt-1">
                          <button
                            onClick={() => {
                              submitToSchedule(jo.id).then((success) => {
                                if (success) {
                                  setShowCalculateIndex(null);
                                }
                              });
                            }}
                            disabled={isActionLoading}
                            className="text-base w-full flex justify-center font-bold text-white px-1 bg-blue-700 py-2 border-blue-700 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            MASUK JADWAL
                          </button>
                        </div>
                      </>
                    </ModalXL>
                  )}
                </div>
              ))
            ) : (
              <div className="flex justify-center items-center py-6 bg-white">
                <p className="text-gray-500">Tidak ada data yang ditemukan</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default ListBookingJo;
