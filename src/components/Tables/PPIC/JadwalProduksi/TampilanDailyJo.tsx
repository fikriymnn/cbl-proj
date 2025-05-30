import React, { useEffect, useRef, useState } from 'react';
import ModalXL from './ModalXL';
import ModalKosongan from '../../../Modals/Qc/NCR/NCRResponQC';
import axios from 'axios';
import Loading from '../../../Loading';
import convertTimeStampToDate from '../../../../utils/convertDate';
import formatInteger from '../../../../utils/formaterInteger';

import PopUpTable2 from './PopUpTable2';
import JobOrderTable from './JobOrderTable';

interface JobOrder {
  id: number;
  no_jo: string;
  item: string;
  qty_druk: number;
  qty_pcs: number;
  tgl_kirim: string;
  no_booking?: string;
  // Add other fields as needed
}
interface ListJOData {
  data: JobOrder[];
}

// Function to format date as "Hari, DD Bulan YYYY"
const formatIndonesianDate = (dateString: any) => {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

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

  const date = new Date(dateString);
  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${dayName}, ${day} ${month} ${year}`;
};

function TampilanDailyJO() {
  const [isLoading, setIsLoading] = useState(false);
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day = String(today.getDate()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;

  const [startDate, setStartDate] = useState(formattedDate);
  const [endDate, setEndDate] = useState(formattedDate);
  const [mapData, setMapData] = useState<any>([]);
  const [historyListJO, setHistoryListJO] = useState<ListJOData>({ data: [] });
  const [penjadwalanListJO, setPenjadwalanListJO] = useState<ListJOData>({
    data: [],
  });
  const [todayDate, setTodayDate] = useState(formattedDate);
  const [formattedDisplayDate, setFormattedDisplayDate] = useState('');
  const [conflictSelection, setConflictSelection] = useState<{
    [key: string]: number;
  }>({});

  useEffect(() => {
    // Set formatted display date whenever startDate changes
    setFormattedDisplayDate(formatIndonesianDate(startDate));
  }, [startDate]);

  useEffect(() => {
    getJadwalView(formattedDate, formattedDate);
    setTodayDate(formattedDate);
    getmasterKategori();
  }, []);

  // Function to get conflicts for a specific time and machine
  const getConflictingJobs = (hour: string, machine: string) => {
    const normalizeMesin = (mesin: string) => {
      const lowerMesin = mesin.toLowerCase().replace(/\s|-/g, '');
      if (lowerMesin.includes('manual1') || lowerMesin === 'manual')
        return 'M1';
      if (lowerMesin.includes('manual2')) return 'M2';
      if (lowerMesin.includes('manual3')) return 'M3';
      return lowerMesin.toUpperCase();
    };

    const sameTimeAndMachine = mapData.filter((item: any) => {
      const itemMesin = normalizeMesin(item.mesin);
      return item.jam === hour && itemMesin === machine;
    });

    // Always return the jobs for display
    return sameTimeAndMachine;
  };

  // Helper function to determine if jobs are actually conflicting
  // Helper function to determine if jobs are actually conflicting
  const hasRealConflicts = (jobs: any[]) => {
    if (jobs.length <= 1) return false;

    // Group by no_jo and no_booking to identify unique jobs
    const uniqueJobs = new Set();

    jobs.forEach((item: any) => {
      const key = `${item.no_jo || 'no_jo'}_${item.no_booking || 'no_booking'}`;
      uniqueJobs.add(key);
    });

    // Only consider it a conflict if there are multiple different jobs
    return uniqueJobs.size > 1;
  };

  // Helper function to get display jobs (remove duplicates for non-conflicts)
  const getDisplayJobs = (jobs: any[]) => {
    if (jobs.length <= 1) return jobs;

    const isRealConflict = hasRealConflicts(jobs);

    if (isRealConflict) {
      // Show all jobs if there are real conflicts
      return jobs;
    } else {
      // Show only one job if they're the same (same no_jo or no_booking)
      return [jobs[0]];
    }
  };

  const [listJO1, setJo1] = useState<any>();
  async function get1Tiket(id: any, i: any) {
    const url = `${import.meta.env.VITE_API_LINK}/ppic/jadwalProduksi/${id}`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        withCredentials: true,
      });
      setJo1(res.data);
      openCalculate(i);
      setIsLoading(false);
      console.log('listJO 1', res.data);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }
  const [showCalculate, setShowCalculate] = useState<any>([]);
  const openCalculate = (i: any) => {
    const onchangeVal: any = [...showCalculate];
    onchangeVal[i] = true;

    setShowCalculate(onchangeVal);
  };

  const getJadwalView = async (tglAwal: any, tglAkhir: any) => {
    const url = `${import.meta.env.VITE_API_LINK}/ppic/jadwalProduksiView`;
    try {
      setIsLoading(true);
      const response = await axios.get(url, {
        params: {
          start_date: tglAwal,
          end_date: tglAkhir,
        },
        withCredentials: true,
      });
      console.log('jadwal view', response.data.data);
      setMapData(response.data.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsLoading(false);
    }
  };
  // Modified getmasterKategori function to handle both statuses
  async function getmasterKategori(
    statusTiket: string = 'history',
    startDate: string = '',
    endDate: string = '',
    searchTerm: string = '',
  ) {
    const url = `${import.meta.env.VITE_API_LINK}/ppic/jadwalProduksi`;
    try {
      setIsLoading(true);

      // Prepare parameters with proper typing
      const params: {
        status_tiket: string;
        start_date?: string;
        end_date?: string;
        search?: string;
      } = {
        status_tiket: statusTiket,
      };

      // Add filter parameters if provided
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (searchTerm) params.search = searchTerm;

      const res = await axios.get(url, {
        params,
        withCredentials: true,
      });

      setIsLoading(false);

      // Set data to the appropriate state based on status_tiket
      if (statusTiket === 'history') {
        setHistoryListJO(res.data);
        console.log('historyListJO', res.data);
      } else if (statusTiket === 'penjadwalan') {
        setPenjadwalanListJO(res.data);
        console.log('penjadwalanListJO', res.data);
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  }

  // Load initial data when component mounts
  useEffect(() => {
    getmasterKategori('history');
    getmasterKategori('penjadwalan');
  }, []);
  const hours = Array.from(
    { length: 24 },
    (_, i) => `${i.toString().padStart(2, '0')}:00:00`,
  );

  const [showModal3, setShowModal3] = useState<any>([]);
  const openModal3 = (i: any) => {
    const onchangeVal: any = [...showModal3];

    onchangeVal[i] = true;

    setShowModal3(onchangeVal);
  };
  const closeModal3 = (i: any) => {
    const onchangeVal: any = [...showModal3];
    onchangeVal[i] = false;

    setShowModal3(onchangeVal);
  };
  const handleNextPrev = (direction: string) => {
    const currentDate = startDate ? new Date(startDate) : new Date(todayDate); // Use selected date or today
    currentDate.setDate(
      currentDate.getDate() + (direction === 'next' ? 1 : -1),
    ); // Increment or decrement by 1 day

    const newDate = currentDate.toISOString().split('T')[0]; // Format the new date to YYYY-MM-DD
    setStartDate(newDate);
    setEndDate(newDate);
    getJadwalView(newDate, newDate);
  };
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const machineList = [
    'R700',
    'SM',
    'GTO',
    'HOCK',
    'WB MANUAL',
    'BAODER',
    'KSB',
    'M1',
    'M2',
    'M3',
    'JK650',
    'JK1000',
    'POLAR',
    'ITOH',
    'LIPAT 1',
    'LIPAT 2',
    'OUTSORCE',
  ];
  const handleClickDetail = (index: number) => {
    setShowDetail((prevState) => {
      const updatedShowDetail = [...prevState]; // Create a copy
      updatedShowDetail[index] = !updatedShowDetail[index]; // Toggle value
      return updatedShowDetail;
    });
  };
  const [showDetail, setShowDetail] = useState<boolean[]>(
    new Array(listJO1 != null && listJO1.length).fill(false),
  );
  const formatCustomDate = (dateString: string) => {
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

    const [datePart, timePart] = dateString?.split(' ');
    const [year, month, day] = datePart?.split('-');

    return `${parseInt(day)} / ${
      months[parseInt(month) - 1]
    } / ${year} - ${timePart.replace(/\./g, ':')}`;
  };
  const [selectedJO, setSelectedJO] = useState<any>(null);
  const [selectedIndex, setSelectedIndex] = useState<any>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredJobOrder, setHoveredJobOrder] = useState<any>(null);

  const headerScrollRef = useRef<HTMLDivElement | null>(null);
  const dataScrollRef = useRef<HTMLDivElement | null>(null);

  // Add synchronized scrolling effect
  useEffect(() => {
    const headerScroll = headerScrollRef.current;
    const dataScroll = dataScrollRef.current;

    if (!headerScroll || !dataScroll) return;

    let isScrolling = false;

    const syncHeaderToData = () => {
      if (!isScrolling) {
        isScrolling = true;
        dataScroll.scrollLeft = headerScroll.scrollLeft;
        requestAnimationFrame(() => {
          isScrolling = false;
        });
      }
    };

    const syncDataToHeader = () => {
      if (!isScrolling) {
        isScrolling = true;
        headerScroll.scrollLeft = dataScroll.scrollLeft;
        requestAnimationFrame(() => {
          isScrolling = false;
        });
      }
    };

    // Add event listeners
    headerScroll.addEventListener('scroll', syncHeaderToData);
    dataScroll.addEventListener('scroll', syncDataToHeader);

    // Cleanup function
    return () => {
      headerScroll.removeEventListener('scroll', syncHeaderToData);
      dataScroll.removeEventListener('scroll', syncDataToHeader);
    };
  }, []);
  return (
    <main className="overflow-x-scroll ' ">
      {isLoading && <Loading />}
      <div className="min-w-[700px]  bg-white rounded-xl flex gap-1  px-4 py-4">
        <>
          <div className="flex w-full flex-col ">
            <div className="flex flex-col gap-3 w-full py-3 border-b-4 border-stroke">
              <div className="flex w-full justify-end">
                <button
                  onClick={() => setIsDetailVisible(!isDetailVisible)}
                  className=" bg-primary text-white font-semibold text-md flex justify-center w-[10%] rounded-md"
                >
                  {isDetailVisible ? 'Hide JO Terjadwal ' : 'Show JO Terjadwal'}
                </button>
              </div>
              <div className="flex flex-col gap-2  w-[30%]">
                <p className="text-sm text-primary font-semibold">Tanggal:</p>
                <input
                  className="rounded-md bg-[#D8EAFF] px-2 h-8"
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setEndDate(e.target.value);
                  }}
                ></input>
              </div>

              <div className="flex ">
                <button
                  onClick={() => {
                    getJadwalView(startDate, endDate);
                  }}
                  className="bg-primary text-white  rounded-md my-auto py-1 px-2"
                >
                  Tampilkan
                </button>
              </div>
              <div className="flex w-full justify-between">
                <button
                  onClick={() => handleNextPrev('prev')}
                  className="bg-primary text-white rounded-md my-auto py-1 px-2"
                >
                  Prev
                </button>

                <button
                  onClick={() => handleNextPrev('next')}
                  className="bg-primary text-white rounded-md my-auto py-1 px-2"
                >
                  Next
                </button>
              </div>
              <label className="text-xl text-blue-400 font-semibold w-full flex justify-center">
                {formattedDisplayDate}
              </label>
            </div>

            <div className="flex w-full flex-col">
              {/* Header Row (Ensures All Machines Are Always Visible) */}
              <div
                ref={headerScrollRef}
                className="flex bg-white border-b-8 border-[#D8EAFF] overflow-x-auto"
              >
                <div className="flex min-w-[80px] py-[1%] justify-center items-center min-h-[60px] flex-shrink-0">
                  <p className="text-center text-[#0065de] text-[9px] font-semibold">
                    TIME
                  </p>
                </div>
                {machineList.map((machine, i1) => (
                  <div
                    key={i1}
                    className={`flex min-w-[120px] max-w-[200px] flex-shrink-0 justify-center items-center min-h-[60px] ${
                      i1 % 2 === 1 ? 'bg-white' : 'bg-[#eaf4ff]'
                    }`}
                  >
                    <p className="text-center text-[#0065de] text-[9px] font-semibold">
                      {machine}
                    </p>
                  </div>
                ))}
              </div>

              {/* Rows for Hours and Data */}
              <div
                ref={dataScrollRef}
                className="flex w-full bg-white border-b-8 border-[#D8EAFF] flex-col overflow-x-auto"
              >
                {hours.map((hour, rowIndex) => (
                  <div
                    key={rowIndex}
                    className="flex border-b-8 border-[#D8EAFF] min-w-max"
                  >
                    {/* Hour Column - Fixed width for consistency */}
                    <div className="flex min-w-[80px] py-[1%] justify-center items-center min-h-[60px] flex-shrink-0">
                      <p className="text-center text-[#0065de] text-[9px] font-semibold">
                        {hour}
                      </p>
                    </div>

                    {machineList.map((machine, colIndex) => {
                      // Get all conflicting jobs for this time slot and machine
                      const allJobs = getConflictingJobs(hour, machine);
                      const isRealConflict = hasRealConflicts(allJobs);
                      const displayJobs = getDisplayJobs(allJobs);

                      // Determine cell background color
                      let cellBgColor =
                        colIndex % 2 === 1 ? 'bg-white' : 'bg-[#eaf4ff]';
                      if (isRealConflict) {
                        cellBgColor = 'bg-red-300'; // Red background for real conflicts
                      }

                      return (
                        <div
                          key={colIndex}
                          className={`flex justify-center items-center min-h-[80px] ${cellBgColor} p-2 min-w-[120px] max-w-[200px] flex-shrink-0`}
                        >
                          {displayJobs.length > 0 ? (
                            <div className="flex flex-col items-center w-full space-y-1">
                              {displayJobs.length === 1 ? (
                                // Single job - display both no_jo and no_booking
                                <div className="flex flex-col items-center w-full space-y-1">
                                  <button
                                    onClick={() =>
                                      openModal3(displayJobs[0]?.id)
                                    }
                                    onMouseEnter={() =>
                                      setHoveredJobOrder(displayJobs[0])
                                    }
                                    onMouseLeave={() =>
                                      setHoveredJobOrder(null)
                                    }
                                    className={`text-center text-[8px] font-semibold px-2 py-2 rounded w-full transition-all duration-200 hover:shadow-md ${
                                      displayJobs[0].no_booking
                                        ? 'text-[#FF6B00] bg-orange-100 hover:bg-orange-200'
                                        : 'text-[#0065de] bg-blue-100 hover:bg-blue-200'
                                    }`}
                                    title={`JO: ${
                                      displayJobs[0].no_jo
                                    }\nBooking: ${
                                      displayJobs[0].no_booking || ''
                                    }`}
                                  >
                                    <div className="text-[8px] font-bold mb-1 break-words">
                                      {displayJobs[0].no_jo}
                                    </div>
                                    {displayJobs[0].no_booking && (
                                      <div className="text-[7px] opacity-80 break-words">
                                        {displayJobs[0].no_booking}
                                      </div>
                                    )}
                                  </button>
                                </div>
                              ) : (
                                // Multiple jobs - show based on whether they're real conflicts
                                <div
                                  className={`flex flex-col items-center w-full space-y-2 ${
                                    isRealConflict ? 'bg-red-300' : ''
                                  }`}
                                >
                                  {isRealConflict && (
                                    <div className="text-[8px] text-white font-bold text-center">
                                      CONFLICT ({allJobs.length})
                                    </div>
                                  )}
                                  <div className="flex flex-col space-y-1 w-full max-h-[150px] overflow-y-auto">
                                    {displayJobs.map(
                                      (job: any, jobIndex: any) => (
                                        <button
                                          key={job.id}
                                          onClick={() => openModal3(job.id)}
                                          onMouseEnter={() =>
                                            setHoveredJobOrder(job)
                                          }
                                          onMouseLeave={() =>
                                            setHoveredJobOrder(null)
                                          }
                                          className={`text-[7px] font-semibold px-2 py-2 rounded w-full transition-all duration-200 hover:shadow-md border-2 ${
                                            job.no_booking
                                              ? 'text-[#FF6B00] bg-orange-100 hover:bg-orange-200 border-orange-300'
                                              : 'text-[#0065de] bg-blue-100 hover:bg-blue-200 border-blue-300'
                                          }`}
                                          title={`JO: ${job.no_jo}\nBooking: ${
                                            job.no_booking || ''
                                          }`}
                                        >
                                          <div className="text-[7px] font-bold mb-1 break-words">
                                            {job.no_jo}
                                          </div>
                                          {job.no_booking && (
                                            <div className="text-[6px] opacity-80 break-words">
                                              {job.no_booking}
                                            </div>
                                          )}
                                        </button>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Show modals for any clicked job - use allJobs here to maintain all modal functionality */}
                              {allJobs.map(
                                (job: any) =>
                                  showModal3[job.id] && (
                                    <ModalKosongan
                                      key={job.id}
                                      isOpen={showModal3[job.id]}
                                      onClose={() => closeModal3(job.id)}
                                      judul={'Drag And Drop Edit'}
                                    >
                                      <PopUpTable2
                                        dataMap={mapData.find(
                                          (data: any) => data.id === job.id,
                                        )}
                                        onClose={() => closeModal3(job.id)}
                                        onFinish={() =>
                                          getJadwalView(startDate, endDate)
                                        }
                                        tgl={startDate}
                                      />
                                    </ModalKosongan>
                                  ),
                              )}
                            </div>
                          ) : (
                            <p className="text-[#bbb] text-[9px]">-</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Render JobOrderTable with both lists */}
            {isDetailVisible && (
              <JobOrderTable
                historyListJO={historyListJO}
                penjadwalanListJO={penjadwalanListJO}
                get1Tiket={get1Tiket}
                setSelectedJO={setSelectedJO}
                setSelectedIndex={setSelectedIndex}
                setIsModalOpen={setIsModalOpen}
                isDetailVisible={isDetailVisible}
                setIsDetailVisible={setIsDetailVisible}
                loading={isLoading}
                title="Job Order List"
                getmasterKategori={getmasterKategori}
              />
            )}
            {hoveredJobOrder && (
              <div className="fixed bottom-4 right-4 bg-white s p-4 rounded-md border-2 border-black z-50">
                <h3 className="font-bold text-sm mb-2">Job Order Details</h3>
                <p>Job Order: {hoveredJobOrder.no_jo}</p>
                {hoveredJobOrder.no_booking && (
                  <p>Booking: {hoveredJobOrder.no_booking}</p>
                )}
                <p>Item: {hoveredJobOrder.item}</p>
                {/* Add more details as needed */}
              </div>
            )}
          </div>
          {isModalOpen && selectedJO && (
            <ModalXL
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              judul={'Rumus Kalkulasi'}
            >
              <>
                <div className="grid grid-cols-2 gap-2 px-4 py-4  border-b-8 border-[#D8EAFF]">
                  <div className="flex flex-col ">
                    <div className="grid grid-cols-2 gap-2">
                      <label
                        htmlFor=""
                        className="text-black text-xs font-bold"
                      >
                        Nomor JO
                      </label>
                      <label
                        htmlFor=""
                        className="text-[#016ae6] uppercase text-xl font-normal"
                      >
                        : {selectedJO?.no_jo}
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <label
                        htmlFor=""
                        className="text-black text-xs font-bold"
                      >
                        Item
                      </label>
                      <label
                        htmlFor=""
                        className="text-[#016ae6] uppercase text-xl font-normal"
                      >
                        : {selectedJO?.item}
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <label
                        htmlFor=""
                        className="text-black text-xs font-bold"
                      >
                        Tanggal Kirim
                      </label>
                      <label
                        htmlFor=""
                        className="text-[#016ae6] uppercase text-xl font-normal"
                      >
                        : {convertTimeStampToDate(selectedJO?.tgl_kirim)}
                      </label>
                    </div>
                  </div>
                  <div className="flex flex-col ">
                    <div className="grid grid-cols-2 gap-2">
                      <label
                        htmlFor=""
                        className="text-black text-xs font-bold"
                      >
                        Qty Druk
                      </label>
                      <label
                        htmlFor=""
                        className="text-[#016ae6] uppercase text-xl font-normal"
                      >
                        : {formatInteger(selectedJO?.qty_druk)}
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <label
                        htmlFor=""
                        className="text-black text-xs font-bold"
                      >
                        Qty Pcs
                      </label>
                      <label
                        htmlFor=""
                        className="text-[#016ae6] uppercase text-xl font-normal"
                      >
                        : {formatInteger(selectedJO?.qty_pcs)}
                      </label>
                    </div>
                  </div>
                </div>
                <div className="flex overflow-x-scroll max-w-screen border-b-8 border-[#D8EAFF] gap-2 px-4 py-4">
                  <div className="w-[150px] flex flex-col ">
                    <label
                      htmlFor=""
                      className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]"
                    >
                      TAHAPAN
                    </label>
                    <label
                      htmlFor=""
                      className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]"
                    >
                      TANGGAL
                    </label>
                    {showDetail[selectedIndex] && (
                      <>
                        <label
                          htmlFor=""
                          className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]"
                        >
                          KATEGORI
                        </label>
                        <label
                          htmlFor=""
                          className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]"
                        >
                          DRYING TIME
                        </label>
                        <label
                          htmlFor=""
                          className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]"
                        >
                          MESIN
                        </label>
                        <label
                          htmlFor=""
                          className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]"
                        >
                          KAPASITAS/JAM
                        </label>
                        <label
                          htmlFor=""
                          className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]"
                        >
                          DRYING TIME (JAM)
                        </label>
                        <label
                          htmlFor=""
                          className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]"
                        >
                          SETTING (JAM)
                        </label>
                        <label
                          htmlFor=""
                          className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]"
                        >
                          KAPASITAS (JAM)
                        </label>

                        <label
                          htmlFor=""
                          className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]"
                        >
                          TOTAL WAKTU
                        </label>
                      </>
                    )}
                  </div>

                  <div className="flex overflow-x-scroll max-w-screen">
                    {listJO1?.data?.tahap?.map((data2: any, ii: number) => (
                      <>
                        <div
                          key={ii}
                          className="min-w-[150px] flex flex-col justify-center"
                        >
                          <label
                            htmlFor=""
                            className="text-black text-xs justify-center  border-2 border-stroke flex items-center h-[50px]"
                          >
                            {data2.tahapan}
                          </label>
                          <div className=" justify-center border-2 border-stroke flex items-center h-[50px]">
                            {data2?.jadwal_per_jam?.length == 0 ? (
                              <>
                                <label
                                  htmlFor=""
                                  className="text-blue-400 text-xs border-2 px-2 py-1 rounded-md border-blue-400 text-center"
                                >
                                  {data2.tgl_from == null ||
                                  data2.tgl_from == ''
                                    ? '-'
                                    : formatCustomDate(data2.tgl_from)}
                                </label>
                              </>
                            ) : (
                              <>
                                <button className="text-blue-400 text-xs border-2 px-2 py-1 rounded-md border-blue-400 text-center">
                                  {data2.jadwal_per_jam?.length == 0
                                    ? '-'
                                    : convertTimeStampToDate(
                                        data2.jadwal_per_jam[0]?.tanggal,
                                      )}{' '}
                                  - {data2.jadwal_per_jam[0]?.jam}
                                </button>
                              </>
                            )}
                          </div>
                          {showDetail[selectedIndex] && (
                            <>
                              <label
                                htmlFor=""
                                className="text-black text-xs justify-center  border-2 border-stroke flex items-center h-[50px]"
                              >
                                {data2.kategory}
                              </label>
                              <label
                                htmlFor=""
                                className="text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]"
                              >
                                {data2.kategory_drying_time}
                              </label>
                              <label
                                htmlFor=""
                                className="text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]"
                              >
                                {data2.mesin}
                              </label>
                              <label
                                htmlFor=""
                                className="text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]"
                              >
                                {data2.kapasitas_per_jam}
                              </label>
                              <label
                                htmlFor=""
                                className="text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]"
                              >
                                {data2.drying_time}
                              </label>
                              <label
                                htmlFor=""
                                className="text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]"
                              >
                                {data2.setting}
                              </label>
                              <label
                                htmlFor=""
                                className="text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]"
                              >
                                {data2.kapasitas}
                              </label>

                              <label
                                htmlFor=""
                                className="text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]"
                              >
                                {data2.total_waktu}
                              </label>
                            </>
                          )}
                        </div>
                      </>
                    ))}
                  </div>
                  <div className="">
                    <button
                      title="button"
                      onClick={() => handleClickDetail(selectedIndex)}
                      className="text-xs w-full flex  font-bold text-white px-1 bg-blue-700 py-2 border-blue-700 border rounded-md"
                    >
                      DETAIL
                    </button>
                  </div>
                </div>
              </>
            </ModalXL>
          )}
        </>
      </div>
    </main>
  );
}

export default TampilanDailyJO;
