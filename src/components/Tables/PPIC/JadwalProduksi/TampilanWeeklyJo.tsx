import React, { useEffect, useState } from 'react';
import ModalXL from './ModalXL';
import axios from 'axios';
import Loading from '../../../Loading';
import convertTimeStampToDate from '../../../../utils/convertDate';
import formatInteger from '../../../../utils/formaterInteger';
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
function TampilanWeeklyJO() {
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [historyListJO, setHistoryListJO] = useState<ListJOData>({ data: [] });
  const [penjadwalanListJO, setPenjadwalanListJO] = useState<ListJOData>({
    data: [],
  });
  const [endDate, setEndDate] = useState<string>(() => {
    const today = new Date();
    today.setDate(today.getDate() + 6);
    return today.toISOString().split('T')[0];
  });
  const [mapData, setMapData] = useState<any>([]);

  const today = new Date();
  const [todayDate, setTodayDate] = useState<string>('');
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day = String(today.getDate()).padStart(2, '0');

  const formattedDate = `${year}-${month}-${day}`;
  useEffect(() => {
    getJadwalView(formattedDate, formattedDate);
    const today = new Date();
    setTodayDate(today.toISOString().split('T')[0]);
    getmasterKategori();
  }, []);
  const [listJO1, setJo1] = useState<any>();
  async function get1Tiket(id: any, i: any) {
    const url = `${import.meta.env.VITE_API_LINK}/ppic/jadwalProduksi/${id}`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        withCredentials: true,
      });
      setJo1(res.data);

      setIsLoading(false);
      console.log('listJO 1', res.data);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }
  const formatIndonesianDate = (dateString: any) => {
    const days = [
      'Minggu',
      'Senin',
      'Selasa',
      'Rabu',
      'Kamis',
      'Jumat',
      'Sabtu',
    ];

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
  const [formattedDisplayDate, setFormattedDisplayDate] = useState('');

  useEffect(() => {
    // Set formatted display date whenever startDate changes
    setFormattedDisplayDate(formatIndonesianDate(startDate));
  }, [startDate]);
  const getJadwalView = async (tglAwal: string, tglAkhir: string) => {
    const url = `${import.meta.env.VITE_API_LINK}/ppic/jadwalProduksiWeekView`;
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

  const [listJO, setJo] = useState<any>();
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

    const [datePart, timePart] = dateString.split(' ');
    const [year, month, day] = datePart.split('-');

    return `${parseInt(day)} / ${
      months[parseInt(month) - 1]
    } / ${year} - ${timePart.replace(/\./g, ':')}`;
  };
  const [selectedJO, setSelectedJO] = useState<any>(null);
  const [selectedIndex, setSelectedIndex] = useState<any>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleNextPrev = (direction: any) => {
    const currentDate = startDate ? new Date(startDate) : new Date(todayDate);
    currentDate.setDate(
      currentDate.getDate() + (direction === 'next' ? 7 : -7),
    );

    const startDateValue = currentDate.toISOString().split('T')[0];
    const endDate = new Date(currentDate);
    endDate.setDate(endDate.getDate() + 6); // Add 6 days to get a 7-day range
    const endDateValue = endDate.toISOString().split('T')[0];

    setStartDate(startDateValue);
    setEndDate(endDateValue);
    getJadwalView(startDateValue, endDateValue);
  };

  const getFormattedDate = (date: any) => {
    return date.toISOString().split('T')[0]; // Format YYYY-MM-DD
  };
  const normalizeMesin = (mesin: string) => {
    const lowerMesin = mesin.toLowerCase().replace(/\s|-/g, ''); // Remove spaces & dashes

    if (lowerMesin.includes('manual1') || lowerMesin === 'manual') return 'M1';
    if (lowerMesin.includes('manual2')) return 'M2';
    if (lowerMesin.includes('manual3')) return 'M3';

    return lowerMesin.toUpperCase(); // Ensure it's in uppercase for consistency
  };
  const [hoveredJobOrder, setHoveredJobOrder] = useState<any>(null);

  // Create global mappings for job orders and bookings
  const jobOrderColorMap = new Map();
  const bookingColorMap = new Map();
  const usedJobOrderColors = new Set();
  const usedBookingColors = new Set();

  // Define booking text colors (for orange background)
  const bookingTextColors = [
    'text-red-700',
    'text-blue-700',
    'text-green-700',
    'text-purple-700',
    'text-pink-700',
    'text-indigo-700',
    'text-yellow-700',
    'text-gray-700',
    'text-cyan-700',
    'text-emerald-700',
    'text-violet-700',
    'text-amber-700',
  ];

  // Function to get consistent color for a job order
  const getJobOrderColor = (jobOrderNumber: any) => {
    // If this job order already has a color assigned, return it
    if (jobOrderColorMap.has(jobOrderNumber)) {
      return jobOrderColorMap.get(jobOrderNumber);
    }

    // Color palette for different job orders
    const jobOrderColors = [
      'bg-blue-500 text-white', // Primary blue
      'bg-green-500 text-white', // Green
      'bg-purple-500 text-white', // Purple
      'bg-orange-500 text-white', // Orange
      'bg-teal-500 text-white', // Teal
      'bg-red-500 text-white', // Red
      'bg-indigo-500 text-white', // Indigo
      'bg-pink-500 text-white', // Pink
      'bg-cyan-500 text-white', // Cyan
      'bg-amber-500 text-white', // Amber
    ];

    // Find an unused color or assign based on improved hash
    let assignedColor;

    if (usedJobOrderColors.size < jobOrderColors.length) {
      // Try hash-based assignment first
      const hash = createBetterHash(jobOrderNumber);
      const colorIndex = Math.abs(hash) % jobOrderColors.length;
      const potentialColor = jobOrderColors[colorIndex];

      if (!usedJobOrderColors.has(potentialColor)) {
        assignedColor = potentialColor;
      } else {
        // Find first unused color
        assignedColor =
          jobOrderColors.find((color) => !usedJobOrderColors.has(color)) ||
          jobOrderColors[0];
      }
    } else {
      // All colors used, cycle through them
      const hash = createBetterHash(jobOrderNumber);
      const colorIndex = Math.abs(hash) % jobOrderColors.length;
      assignedColor = jobOrderColors[colorIndex];
    }

    // Store the mapping and mark color as used
    jobOrderColorMap.set(jobOrderNumber, assignedColor);
    usedJobOrderColors.add(assignedColor);

    return assignedColor;
  };

  // Function to get consistent text color for booking numbers
  const getBookingTextColor = (bookingNumber: any) => {
    // If this booking already has a color assigned, return it
    if (bookingColorMap.has(bookingNumber)) {
      return bookingColorMap.get(bookingNumber);
    }

    // Find an unused color or assign based on hash
    let assignedColor;

    if (usedBookingColors.size < bookingTextColors.length) {
      // Try hash-based assignment first
      const hash = createBetterHash(bookingNumber);
      const colorIndex = Math.abs(hash) % bookingTextColors.length;
      const potentialColor = bookingTextColors[colorIndex];

      if (!usedBookingColors.has(potentialColor)) {
        assignedColor = potentialColor;
      } else {
        // Find first unused color
        assignedColor =
          bookingTextColors.find((color) => !usedBookingColors.has(color)) ||
          bookingTextColors[0];
      }
    } else {
      // All colors used, cycle through them
      const hash = createBetterHash(bookingNumber);
      const colorIndex = Math.abs(hash) % bookingTextColors.length;
      assignedColor = bookingTextColors[colorIndex];
    }

    // Store the mapping and mark color as used
    bookingColorMap.set(bookingNumber, assignedColor);
    usedBookingColors.add(assignedColor);

    return assignedColor;
  };

  // Better hash function to reduce collisions
  const createBetterHash = (str: any) => {
    let hash = 0;
    if (str.length === 0) return hash;

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    // Additional mixing to reduce collisions
    hash = hash ^ (hash >>> 16);
    hash = hash * 0x85ebca6b;
    hash = hash ^ (hash >>> 13);
    hash = hash * 0xc2b2ae35;
    hash = hash ^ (hash >>> 16);

    return hash;
  };
  return (
    <main className="overflow-x-scroll ' ">
      {isLoading && <Loading />}
      <div className="min-w-[700px]  bg-white rounded-xl flex gap-1  px-4 py-4">
        <>
          <div className="flex w-full flex-col ">
            <div className="flex flex-col gap-3 w-full py-3 border-b-4 border-stroke">
              {/* <div className="flex w-full justify-end">
                <button
                  onClick={() => setIsDetailVisible(!isDetailVisible)}
                  className=" bg-primary text-white font-semibold text-md flex justify-center w-[10%] rounded-md"
                >
                  {isDetailVisible ? 'Hide JO Terjadwal ' : 'Show JO Terjadwal'}
                </button>
              </div> */}
              <div className="flex flex-col gap-2  w-[30%]">
                <p className="text-sm text-primary font-semibold">Tanggal:</p>
                <input
                  className="rounded-md bg-[#D8EAFF] px-2 h-8"
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    const selectedStartDate = e.target.value;
                    const selectedEndDate = new Date(selectedStartDate);
                    selectedEndDate.setDate(selectedEndDate.getDate() + 6);

                    setStartDate(selectedStartDate);
                    setEndDate(selectedEndDate.toISOString().split('T')[0]);
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
                <label className="text-xl text-blue-400 font-semibold w-full flex justify-center">
                  {formattedDisplayDate}
                </label>
                <button
                  onClick={() => handleNextPrev('next')}
                  className="bg-primary text-white rounded-md my-auto py-1 px-2"
                >
                  Next
                </button>
              </div>
            </div>

            <div className="flex w-full flex-col overflow-x-auto">
              {/* Header Row (Machines) */}
              <div
                className="flex bg-white border-b-8 border-[#D8EAFF]"
                style={{ minWidth: `${(machineList.length + 1) * 120}px` }}
              >
                <div
                  className="text-center text-[#0065de] text-[11px] font-semibold py-[1%] flex items-center justify-center"
                  style={{ width: '120px' }}
                >
                  DATE
                </div>
                {machineList.map((machine: any, i: any) => (
                  <div
                    key={i}
                    className="flex justify-center items-center bg-[#eaf4ff]"
                    style={{ width: '120px' }}
                  >
                    <p className="text-center text-[#0065de] text-[11px] font-semibold">
                      {machine}
                    </p>
                  </div>
                ))}
              </div>

              {/* Rows for Dates and Data */}
              {[...Array(7)].map((_, rowIndex) => {
                const currentRowDate = new Date(startDate);
                currentRowDate.setDate(currentRowDate.getDate() + rowIndex);
                const formattedDate = getFormattedDate(currentRowDate);

                const rowBackgroundColor =
                  rowIndex % 2 === 0
                    ? 'bg-[#F0F7FF]' // Light blue for even rows
                    : 'bg-white'; // White for odd rows

                return (
                  <div
                    key={rowIndex}
                    className={`flex border-b-4 border-[#D8EAFF] ${rowBackgroundColor}`}
                    style={{ minWidth: `${(machineList.length + 1) * 120}px` }}
                  >
                    {/* Date Column */}
                    <div
                      className="flex py-[1%] justify-center items-center border-r border-[#D8EAFF]"
                      style={{ width: '120px' }}
                    >
                      <p className="text-center text-[#0065de] text-[11px] font-semibold">
                        {convertTimeStampToDate(currentRowDate)}
                      </p>
                    </div>

                    {machineList.map((machine: any, colIndex: any) => {
                      const normalizedMachine = normalizeMesin(machine);

                      const groupedMatchingData = mapData.reduce(
                        (acc: any, d: any) => {
                          const dateTanggal = new Date(d.tanggal);

                          const normalizedDataDate = new Date(
                            dateTanggal.getFullYear(),
                            dateTanggal.getMonth(),
                            dateTanggal.getDate(),
                          );
                          const normalizedCurrentDate = new Date(
                            currentRowDate.getFullYear(),
                            currentRowDate.getMonth(),
                            currentRowDate.getDate(),
                          );

                          if (
                            normalizedDataDate.getTime() ===
                              normalizedCurrentDate.getTime() &&
                            normalizeMesin(d.mesin) === normalizedMachine
                          ) {
                            const key = `${d.no_jo}`;

                            if (!acc[key]) {
                              acc[key] = d;
                            }
                          }
                          return acc;
                        },
                        {},
                      );

                      const matchingDataArray =
                        Object.values(groupedMatchingData);

                      const colBackgroundColor =
                        colIndex % 2 === 0
                          ? 'bg-[#F0F7FF]' // Light blue for even columns
                          : 'bg-white'; // White for odd columns

                      return (
                        <div
                          key={colIndex}
                          className={`flex justify-center items-center border-r border-[#D8EAFF] ${colBackgroundColor}`}
                          style={{ width: '120px' }}
                        >
                          {matchingDataArray.length > 0 ? (
                            <div className="flex flex-col items-center w-full">
                              {matchingDataArray.map(
                                (data: any, index: any) => {
                                  // Get consistent color for this job order
                                  const jobOrderColorClass = getJobOrderColor(
                                    data.no_jo,
                                  );

                                  return (
                                    <div
                                      key={index}
                                      className="flex flex-col items-center w-full p-1"
                                    >
                                      <button
                                        onMouseEnter={() =>
                                          setHoveredJobOrder(data)
                                        }
                                        onMouseLeave={() =>
                                          setHoveredJobOrder(null)
                                        }
                                        className={`text-center text-[11px] font-semibold border border-opacity-50 p-1 rounded-md w-full ${jobOrderColorClass}`}
                                      >
                                        {data.no_jo}
                                        {data.no_booking && (
                                          <div
                                            className={`bg-white p-0.5 rounded-md line-clamp-2 mt-0.5 w-full overflow-hidden text-center ${getBookingTextColor(
                                              data.no_booking,
                                            )}`}
                                          >
                                            {data.no_booking}
                                          </div>
                                        )}
                                      </button>
                                    </div>
                                  );
                                },
                              )}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
              {hoveredJobOrder && (
                <div className="fixed bottom-4 right-4 bg-white shadow-lg p-4 rounded-lg border">
                  <h3 className="font-bold text-sm mb-2">Job Order Details</h3>
                  <p>Job Order: {hoveredJobOrder.no_jo}</p>
                  <p>No Booking: {hoveredJobOrder.no_booking}</p>
                  <p>Item: {hoveredJobOrder.item}</p>
                  {/* Add more details as needed */}
                </div>
              )}
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
                canceledListJO={{ data: [] }}
              />
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
                          TOLERANSI
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
                                  {formatCustomDate(data2.tgl_from)}
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
                                {data2.toleransi}
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

export default TampilanWeeklyJO;
