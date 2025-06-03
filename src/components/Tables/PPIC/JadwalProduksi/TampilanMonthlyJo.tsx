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
function TampilanMonthlyJO() {
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
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().slice(0, 7); // YYYY-MM format
  });
  const formattedDate = `${year}-${month}-${day}`;
  useEffect(() => {
    getmasterKategori();
    const today = new Date(selectedMonth + '-01');
    setTodayDate(today.toISOString().split('T')[0]);
    const lastDayOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
    );

    getJadwalView(
      today.toISOString().slice(0, 10),
      lastDayOfMonth.toISOString().slice(0, 10),
    );
    getJadwalLembur(
      today.toISOString().slice(0, 10),
      lastDayOfMonth.toISOString().slice(0, 10),
    );
  }, [selectedMonth]);
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
  const generateMonthDates = () => {
    const year = parseInt(selectedMonth.split('-')[0]);
    const month = parseInt(selectedMonth.split('-')[1]) - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return Array.from(
      { length: daysInMonth },
      (_, i) => new Date(year, month, i + 1),
    );
  };

  // Color palette for job orders
  const jobOrderColors = [
    'bg-blue-500 text-white',
    'bg-green-500 text-white',
    'bg-purple-500 text-white',
    'bg-orange-500 text-white',
    'bg-teal-500 text-white',
  ];

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

  // State for month and year selection

  // Function to handle month navigation
  const handleMonthChange = (direction: 'next' | 'prev') => {
    const currentDate = new Date(selectedMonth + '-01');
    currentDate.setMonth(
      currentDate.getMonth() + (direction === 'next' ? 1 : -1),
    );

    setSelectedMonth(currentDate.toISOString().slice(0, 7));
    getJadwalView(
      currentDate.toISOString().slice(0, 7) + '-01',
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
        .toISOString()
        .slice(0, 10),
    );
    getJadwalLembur(
      currentDate.toISOString().slice(0, 7) + '-01',
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
        .toISOString()
        .slice(0, 10),
    );
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
  function calculateRowHeight(machine: string) {
    const machineData = mapData.filter(
      (d: any) => normalizeMesin(d.mesin) === normalizeMesin(machine),
    );
    const baseHeight = 30; // Default row height
    const additionalHeightPerJob = 4; // Height for each additional job
    return (
      baseHeight + Math.max(machineData.length - 1, 0) * additionalHeightPerJob
    );
  }
  // First, add the necessary state
  const [showEdit, setShowEdit] = useState(
    Array(machineList.length).fill(false),
  );
  const [selectedMachine, setSelectedMachine] = useState(null);

  const openEdit = (index: any, machine: any) => {
    const updatedShowEdit = [...showEdit];
    updatedShowEdit[index] = true;
    setShowEdit(updatedShowEdit);

    // Find matching machine entries in the mapData
    const matchingEntries = mapData.filter(
      (d: any) => normalizeMesin(d.mesin) === normalizeMesin(machine),
    );

    if (matchingEntries.length > 0) {
      // Use the original machine name from the API data
      setSelectedMachine(matchingEntries[0].mesin);
    } else {
      // No matching entries found
      alert(
        `Tidak ada Jadwal Untuk Mesin ${machine}, pada bulan ${selectedMonth}`,
      );
      // Close the modal immediately since there's no data
      closeEdit(index);
      return;
    }
  };

  const closeEdit = (index: any) => {
    const updatedShowEdit = [...showEdit];
    updatedShowEdit[index] = false;
    setShowEdit(updatedShowEdit);
  };
  const [activeView, setActiveView] = useState('default');

  // Update the state to include dateRange
  const [dateRange, setDateRange] = useState({
    startDate: '2025-04-22',
    endDate: '2025-04-23',
  });

  // Initialize lembur data as an empty array instead of with preset values
  const [lemburData, setLemburData] = useState<any[]>([]);

  // Function to generate dates between two dates
  const generateDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dateList = [];

    // Clone the start date
    let currentDate = new Date(start);

    // Loop from start date to end date (inclusive)
    while (currentDate <= end) {
      // Format date as YYYY-MM-DD
      const formattedDate = currentDate.toISOString().split('T')[0];

      // Add to date list with default shift values
      dateList.push({
        tanggal_lembur: formattedDate,
        shift_1: false,
        shift_2: false,
      });

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dateList;
  };

  // Function to update dateRange and generate lemburData
  const handleDateRangeChange = (
    field: 'startDate' | 'endDate',
    value: string,
  ) => {
    const newDateRange = { ...dateRange, [field]: value };
    setDateRange(newDateRange);

    // Only generate dates if both dates are valid
    if (newDateRange.startDate && newDateRange.endDate) {
      const newLemburData = generateDateRange(
        newDateRange.startDate,
        newDateRange.endDate,
      );
      setLemburData(newLemburData);
    }
  };

  // Function to handle checkbox changes
  const handleShiftChange = (
    index: number,
    shift: 'shift_1' | 'shift_2',
    checked: boolean,
  ) => {
    const newData = [...lemburData];
    newData[index][shift] = checked;
    setLemburData(newData);
  };

  async function postLembur(lembur_data: any, mesin: any, i: any) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/ppic/jadwalProduksiViewLembur`;
    try {
      setIsLoading(true);
      const res = await axios.post(
        url,
        { data_lembur: lembur_data, mesin: mesin },
        {
          withCredentials: true,
        },
      );
      console.log('respon lembur', res);
      setIsLoading(false);
      alert('Berhasil menambah data lembur!');
      closeEdit(i); // Close the modal after saving
      // Consider adding a success message or refreshing the data
    } catch (error: any) {
      alert(error.response.data.message);
      setIsLoading(false);
      // Consider adding an error message
    }
  }

  // useEffect to initialize the date range data
  useEffect(() => {
    // Generate initial date list when component mounts
    const initialLemburData = generateDateRange(
      dateRange.startDate,
      dateRange.endDate,
    );
    setLemburData(initialLemburData);
  }, []);

  const [lemburViewData, setLemburViewData] = useState<any[]>([]);

  const getJadwalLembur = async (tglAwal: string, tglAkhir: string) => {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/ppic/jadwalProduksiViewLembur`;
    try {
      setIsLoading(true);
      const response = await axios.get(url, {
        params: {
          start_date: tglAwal,
          end_date: tglAkhir,
        },
        withCredentials: true,
      });
      console.log('jadwal lembur 2', response.data.data);
      setLemburViewData(response.data.data); // Store the data in state
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsLoading(false);
    }
  };

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
            <div className="flex w-full justify-end">
              <button
                onClick={() => setIsDetailVisible(!isDetailVisible)}
                className=" bg-primary text-white font-semibold text-md flex justify-center w-[10%] rounded-md"
              >
                {isDetailVisible ? 'Hide JO Terjadwal ' : 'Show JO Terjadwal'}
              </button>
            </div>
            <div className="flex flex-col gap-3 w-full py-3 border-b-4 border-stroke">
              <div className="flex w-full justify-between items-center">
                <button
                  onClick={() => handleMonthChange('prev')}
                  className="bg-primary text-white rounded-md py-1 px-2"
                >
                  Prev
                </button>

                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => {
                    setSelectedMonth(e.target.value);
                    const lastDay = new Date(
                      parseInt(e.target.value.split('-')[0]),
                      parseInt(e.target.value.split('-')[1]),
                      0,
                    );
                    getJadwalView(
                      e.target.value + '-01',
                      lastDay.toISOString().slice(0, 10),
                    );
                    getJadwalLembur(
                      e.target.value + '-01',
                      lastDay.toISOString().slice(0, 10),
                    );
                  }}
                  className="rounded-md bg-[#D8EAFF] px-2 h-8"
                />

                <button
                  onClick={() => handleMonthChange('next')}
                  className="bg-primary text-white rounded-md py-1 px-2"
                >
                  Next
                </button>
              </div>
            </div>

            <div className="p-4">
              {/* Toggle buttons */}
              <div className="flex justify-center mb-4">
                <div className="inline-flex rounded-md shadow-sm" role="group">
                  <button
                    type="button"
                    className={`px-4 py-2 text-sm font-medium border ${
                      activeView === 'default'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    } rounded-l-lg border-gray-200`}
                    onClick={() => setActiveView('default')}
                  >
                    JADWAL REGULER
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 text-sm font-medium border-t border-b border-r ${
                      activeView === 'lembur'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    } rounded-r-lg border-gray-200`}
                    onClick={() => setActiveView('lembur')}
                  >
                    LEMBUR
                  </button>
                </div>
              </div>

              {/* Conditional rendering based on active view */}
              {activeView === 'default' ? (
                // Your existing component code
                <div className="overflow-x-auto">
                  <div className="flex">
                    {/* Machine Columns */}
                    <div className="flex flex-col w-[12%] border-r border-[#D8EAFF]">
                      <div className="h-10 border-b border-[#D8EAFF] bg-[#eaf4ff] flex items-center justify-center">
                        <p className="text-[#0065de] text-[11px] font-semibold">
                          Machines
                        </p>
                      </div>
                      {machineList.map((machine, index) => {
                        // Calculate the maximum height needed for this machine row across all dates
                        const maxHeightForMachine = Math.max(
                          ...generateMonthDates().map((date) => {
                            const normalizedMachine = normalizeMesin(machine);
                            const matchingData = mapData.filter((d: any) => {
                              const dateTanggal = new Date(d.tanggal);
                              return (
                                dateTanggal.getFullYear() ===
                                  date.getFullYear() &&
                                dateTanggal.getMonth() === date.getMonth() &&
                                dateTanggal.getDate() === date.getDate() &&
                                normalizeMesin(d.mesin) === normalizedMachine
                              );
                            });
                            // Calculate height: base height + (number of items * item height) + padding
                            return Math.max(
                              60,
                              40 + matchingData.length * 32 + 8,
                            );
                          }),
                          60, // Minimum height
                        );

                        return (
                          <div
                            key={index}
                            className={`flex items-center justify-center cursor-pointer hover:bg-[#DEF0FF] ${
                              index % 2 === 0 ? 'bg-[#F0F7FF]' : 'bg-white'
                            }`}
                            style={{
                              height: `${maxHeightForMachine}px`,
                            }}
                            onClick={() => openEdit(index, machine)}
                          >
                            <p className="text-[#0065de] text-[11px] font-semibold">
                              {machine}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {machineList.map(
                      (machine, index) =>
                        showEdit[index] && (
                          <ModalXL
                            key={index}
                            isOpen={showEdit[index]}
                            onClose={() => closeEdit(index)}
                            judul={'Jadwal Mesin ' + machine}
                          >
                            <div className="p-6">
                              <h2 className="text-xl font-bold mb-4">
                                Jadwal Lembur Untuk Mesin : {machine}
                              </h2>
                              <p className="mb-4">{selectedMonth}</p>

                              <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Start Date
                                  </label>
                                  <input
                                    value={dateRange.startDate}
                                    onChange={(e) =>
                                      handleDateRangeChange(
                                        'startDate',
                                        e.target.value,
                                      )
                                    }
                                    type="date"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    End Date
                                  </label>
                                  <input
                                    value={dateRange.endDate}
                                    onChange={(e) =>
                                      handleDateRangeChange(
                                        'endDate',
                                        e.target.value,
                                      )
                                    }
                                    type="date"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                  />
                                </div>
                              </div>

                              {/* Date range list with checkboxes */}
                              <div className="mb-6 max-h-96 overflow-y-auto border border-gray-200 rounded-md">
                                <table className="w-full table-fixed">
                                  <thead className="bg-gray-100">
                                    <tr className="text-left">
                                      <th className="p-3 w-1/3">Date</th>
                                      <th className="p-3 w-1/3">
                                        <div className="flex items-center">
                                          <span className="mr-2">Shift 1</span>
                                          <button
                                            className="ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 w-24"
                                            onClick={() => {
                                              const newLemburData = [
                                                ...lemburData,
                                              ];
                                              const allChecked =
                                                newLemburData.every(
                                                  (item) => item.shift_1,
                                                );
                                              newLemburData.forEach((item) => {
                                                item.shift_1 = !allChecked;
                                              });
                                              setLemburData(newLemburData);
                                            }}
                                          >
                                            {lemburData.every(
                                              (item) => item.shift_1,
                                            )
                                              ? 'Unselect All'
                                              : 'Select All'}
                                          </button>
                                        </div>
                                      </th>
                                      <th className="p-3 w-1/3">
                                        <div className="flex items-center">
                                          <span className="mr-2">Shift 2</span>
                                          <button
                                            className="ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 w-24"
                                            onClick={() => {
                                              const newLemburData = [
                                                ...lemburData,
                                              ];
                                              const allChecked =
                                                newLemburData.every(
                                                  (item) => item.shift_2,
                                                );
                                              newLemburData.forEach((item) => {
                                                item.shift_2 = !allChecked;
                                              });
                                              setLemburData(newLemburData);
                                            }}
                                          >
                                            {lemburData.every(
                                              (item) => item.shift_2,
                                            )
                                              ? 'Unselect All'
                                              : 'Select All'}
                                          </button>
                                        </div>
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {lemburData.map((item, idx) => (
                                      <tr
                                        key={idx}
                                        className={
                                          idx % 2 === 0
                                            ? 'bg-white'
                                            : 'bg-gray-50'
                                        }
                                      >
                                        <td className="p-3">
                                          {convertTimeStampToDate(
                                            item.tanggal_lembur,
                                          )}
                                        </td>
                                        <td className="p-3 text-center">
                                          <input
                                            type="checkbox"
                                            checked={item.shift_1}
                                            onChange={(e) =>
                                              handleShiftChange(
                                                idx,
                                                'shift_1',
                                                e.target.checked,
                                              )
                                            }
                                            className="h-4 w-4"
                                          />
                                        </td>
                                        <td className="p-3 text-center">
                                          <input
                                            type="checkbox"
                                            checked={item.shift_2}
                                            onChange={(e) =>
                                              handleShiftChange(
                                                idx,
                                                'shift_2',
                                                e.target.checked,
                                              )
                                            }
                                            className="h-4 w-4"
                                          />
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>

                              <div className="flex justify-end gap-2">
                                <button
                                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
                                  onClick={() => closeEdit(index)}
                                >
                                  Cancel
                                </button>
                                <button
                                  className="px-4 py-2 bg-blue-600 text-white rounded-md"
                                  onClick={() =>
                                    postLembur(
                                      lemburData,
                                      selectedMachine,
                                      index,
                                    )
                                  }
                                >
                                  Save Schedule
                                </button>
                              </div>
                            </div>
                          </ModalXL>
                        ),
                    )}

                    {/* Date Columns */}
                    <div className="flex flex-grow overflow-x-auto">
                      <div className="flex">
                        {generateMonthDates().map((date, dateIndex) => (
                          <div
                            key={dateIndex}
                            className="flex flex-col w-[50px] border-r border-[#D8EAFF]"
                          >
                            {/* Date Header */}
                            <div className="h-10 border-b border-[#D8EAFF] bg-[#eaf4ff] flex items-center justify-center">
                              <p className="text-[#0065de] text-[11px] font-semibold">
                                {date.getDate()}
                              </p>
                            </div>

                            {/* Machine Cells */}
                            {machineList.map((machine, machineIndex) => {
                              const normalizedMachine = normalizeMesin(machine);

                              // Filter data for this specific date and machine
                              const matchingData = mapData.filter((d: any) => {
                                const dateTanggal = new Date(d.tanggal);
                                return (
                                  dateTanggal.getFullYear() ===
                                    date.getFullYear() &&
                                  dateTanggal.getMonth() === date.getMonth() &&
                                  dateTanggal.getDate() === date.getDate() &&
                                  normalizeMesin(d.mesin) === normalizedMachine
                                );
                              });

                              // Calculate the maximum height needed for this machine row across all dates
                              const maxHeightForMachine = Math.max(
                                ...generateMonthDates().map((dateItem) => {
                                  const matchingDataForHeight = mapData.filter(
                                    (d: any) => {
                                      const dateTanggal = new Date(d.tanggal);
                                      return (
                                        dateTanggal.getFullYear() ===
                                          dateItem.getFullYear() &&
                                        dateTanggal.getMonth() ===
                                          dateItem.getMonth() &&
                                        dateTanggal.getDate() ===
                                          dateItem.getDate() &&
                                        normalizeMesin(d.mesin) ===
                                          normalizedMachine
                                      );
                                    },
                                  );
                                  return Math.max(
                                    60,
                                    40 + matchingDataForHeight.length * 32 + 8,
                                  );
                                }),
                                60, // Minimum height
                              );

                              return (
                                <div
                                  key={machineIndex}
                                  className={`flex flex-col items-center justify-start p-1 ${
                                    machineIndex % 2 === 0
                                      ? 'bg-[#F0F7FF]'
                                      : 'bg-white'
                                  }`}
                                  style={{
                                    height: `${maxHeightForMachine}px`,
                                    minHeight: '60px',
                                  }}
                                >
                                  {matchingData.length > 0 && (
                                    <div className="flex flex-col items-center gap-1 w-full h-full overflow-y-auto">
                                      {matchingData.map(
                                        (data: any, index: any) => {
                                          // Get consistent color for this job order
                                          const jobOrderColorClass =
                                            getJobOrderColor(data.no_jo);

                                          return (
                                            <div
                                              key={index}
                                              className="flex flex-col w-full items-center flex-shrink-0"
                                              style={{ minHeight: '30px' }}
                                            >
                                              <button
                                                onMouseEnter={() =>
                                                  setHoveredJobOrder(data)
                                                }
                                                onMouseLeave={() =>
                                                  setHoveredJobOrder(null)
                                                }
                                                className={`text-[8px] font-semibold border border-opacity-50 p-1 rounded-sm w-full min-h-[28px] flex flex-col items-center justify-center ${jobOrderColorClass}`}
                                              >
                                                <span className="leading-tight">
                                                  {data.no_jo}
                                                </span>
                                                {data.no_booking && (
                                                  <span
                                                    className={`text-[7px] font-semibold bg-white rounded-sm px-1 py-0.5 mt-0.5 w-full overflow-hidden text-center leading-tight ${getBookingTextColor(
                                                      data.no_booking,
                                                    )}`}
                                                    style={{
                                                      wordBreak: 'break-all',
                                                      fontSize: '7px',
                                                      lineHeight: '1.1',
                                                    }}
                                                  >
                                                    {data.no_booking}
                                                  </span>
                                                )}
                                              </button>
                                            </div>
                                          );
                                        },
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // LEMBUR component
                <div className="overflow-x-auto">
                  <div className="flex">
                    {/* Machine Columns */}
                    <div className="flex flex-col w-[12%] border-r border-[#D8EAFF]">
                      <div className="h-10 border-b border-[#D8EAFF] bg-[#eaf4ff] flex items-center justify-center">
                        <p className="text-[#0065de] text-[11px] font-semibold">
                          Machines
                        </p>
                      </div>
                      {machineList.map((machine, index) => (
                        <div
                          key={index}
                          className={`flex items-center justify-center cursor-pointer hover:bg-[#DEF0FF] ${
                            index % 2 === 0 ? 'bg-[#F0F7FF]' : 'bg-white'
                          }`}
                          style={{
                            height: `${calculateRowHeight(machine)}px`,
                          }}
                          onClick={() => openEdit(index, machine)}
                        >
                          <p className="text-[#0065de] text-[11px] font-semibold">
                            {machine}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Date Columns - LEMBUR view can be customized differently */}
                    <div className="flex flex-grow overflow-x-auto">
                      <div className="flex">
                        {generateMonthDates().map((date, dateIndex) => (
                          <div
                            key={dateIndex}
                            className="flex flex-col w-[50px] border-r border-[#D8EAFF]"
                          >
                            {/* Date Header */}
                            <div className="h-10 border-b border-[#D8EAFF] bg-[#eaf4ff] flex items-center justify-center">
                              <p className="text-[#0065de] text-[11px] font-semibold">
                                {date.getDate()}
                              </p>
                            </div>
                            {/* Machine Cells - For LEMBUR view */}
                            {machineList.map((machine, machineIndex) => {
                              const normalizedMachine = normalizeMesin(machine);

                              // Get the date string in YYYY-MM-DD format for comparison
                              const dateString = date
                                .toISOString()
                                .split('T')[0];

                              const lemburForDateAndMachine =
                                lemburViewData.filter((l: any) => {
                                  // Manually parse the date parts from tanggal_lembur
                                  const lemburDateParts = l.tanggal_lembur
                                    .split('T')[0]
                                    .split('-');

                                  // Create date parts from the current date in the loop
                                  const currentYear = date.getFullYear();
                                  const currentMonth = date.getMonth() + 1; // Add 1 because months are 0-indexed
                                  const currentDay = date.getDate();

                                  // Compare year, month, and day separately
                                  return (
                                    parseInt(lemburDateParts[0]) ===
                                      currentYear &&
                                    parseInt(lemburDateParts[1]) ===
                                      currentMonth &&
                                    parseInt(lemburDateParts[2]) ===
                                      currentDay &&
                                    normalizeMesin(l.mesin) ===
                                      normalizedMachine
                                  );
                                });

                              // Determine color based on shift status
                              let bgColorClass = '';
                              let shiftText = '';

                              if (lemburForDateAndMachine.length > 0) {
                                const shift1Active =
                                  lemburForDateAndMachine.some(
                                    (l) => l.shift_1,
                                  );
                                const shift2Active =
                                  lemburForDateAndMachine.some(
                                    (l) => l.shift_2,
                                  );

                                if (shift1Active && shift2Active) {
                                  bgColorClass = 'bg-green-500'; // Both shifts - green
                                  shiftText = 'Shift 1 & 2';
                                } else if (shift1Active) {
                                  bgColorClass = 'bg-yellow-500'; // Shift 1 only - yellow
                                  shiftText = 'Shift 1';
                                } else if (shift2Active) {
                                  bgColorClass = 'bg-blue-500'; // Shift 2 only - blue
                                  shiftText = 'Shift 2';
                                }
                              }

                              return (
                                <div
                                  key={machineIndex}
                                  className={`flex items-center justify-center ${
                                    machineIndex % 2 === 0
                                      ? 'bg-[#F0F7FF]'
                                      : 'bg-white'
                                  }`}
                                  style={{
                                    height: `${calculateRowHeight(machine)}px`,
                                  }}
                                >
                                  {/* Display colored indicator with shift text if lembur exists */}
                                  {lemburForDateAndMachine.length > 0 && (
                                    <div
                                      className={`px-1 py-0.5 rounded ${bgColorClass} flex items-center justify-center text-white text-[10px] font-semibold`}
                                      title={`Overtime scheduled for ${shiftText}`}
                                    >
                                      {shiftText}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Optional: Detailed Hover Card */}
              {hoveredJobOrder && (
                <div className="fixed bottom-4 right-4 bg-white s p-4 rounded-md border-2 border-black">
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

export default TampilanMonthlyJO;
