import React, { useEffect, useState, useMemo, useCallback } from 'react';
import ModalXL from './ModalXL';
import axios from 'axios';
import Loading from '../../../Loading';
import convertTimeStampToDate from '../../../../utils/convertDate';
import formatInteger from '../../../../utils/formaterInteger';
import JobOrderTable from './JobOrderTable';

import * as XLSX from 'xlsx';

interface JobOrder {
  id: number;
  no_jo: string;
  no_io: string;
  item: string;
  qty_druk: number;
  qty_pcs: number;
  tgl_kirim: string;
  no_booking?: string;
}

interface ListJOData {
  data: JobOrder[];
}

interface LoadingState {
  main: boolean;
  schedule: boolean;
  overtime: boolean;
  detail: boolean;
}

// Memoized color mappings to prevent recalculation
const jobOrderColors = [
  'bg-blue-500 text-white',
  'bg-green-500 text-white',
  'bg-purple-500 text-white',
  'bg-orange-500 text-white',
  'bg-teal-500 text-white',
];

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

// Memoized utility functions
const createBetterHash = (str: string): number => {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  hash = hash ^ (hash >>> 16);
  hash = hash * 0x85ebca6b;
  hash = hash ^ (hash >>> 13);
  hash = hash * 0xc2b2ae35;
  hash = hash ^ (hash >>> 16);
  return hash;
};

// Memoized JobOrderCard component
const JobOrderCard = React.memo(
  ({
    data,
    jobOrderColor,
    bookingColor,
    isHighlighted,
    onClick,
  }: {
    data: any;
    jobOrderColor: string;
    bookingColor: string;
    isHighlighted: boolean;
    onClick: () => void;
  }) => (
    <div
      className="flex flex-col w-full items-center flex-shrink-0"
      style={{ minHeight: '30px' }}
    >
      <button
        onClick={onClick}
        className={`text-[8px] font-semibold border border-opacity-50 p-1 rounded-sm w-full min-h-[28px] flex flex-col items-center justify-center ${jobOrderColor} ${
          isHighlighted
            ? 'ring-4 ring-yellow-400 ring-opacity-75 shadow-lg animate-pulse'
            : ''
        }`}
      >
        <span className="leading-tight">{data.no_jo}</span>
        {data.no_booking && (
          <span
            className={`text-[7px] font-semibold bg-white rounded-sm px-1 py-0.5 mt-0.5 w-full overflow-hidden text-center leading-tight ${bookingColor}`}
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
  ),
);

// Memoized MachineColumn component
const MachineColumn = React.memo(
  ({
    machine,
    index,
    height,
    onClick,
  }: {
    machine: string;
    index: number;
    height: number;
    onClick: () => void;
  }) => (
    <div
      className={`flex items-center justify-center cursor-pointer hover:bg-[#DEF0FF] ${
        index % 2 === 0 ? 'bg-[#F0F7FF]' : 'bg-white'
      }`}
      style={{ height: `${height}px` }}
      onClick={onClick}
    >
      <p className="text-[#0065de] text-[11px] font-semibold">{machine}</p>
    </div>
  ),
);

function TampilanMonthlyJO() {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    main: true,
    schedule: false,
    overtime: false,
    detail: false,
  });

  // Data states
  const [historyListJO, setHistoryListJO] = useState<ListJOData>({ data: [] });
  const [penjadwalanListJO, setPenjadwalanListJO] = useState<ListJOData>({
    data: [],
  });
  const [mapData, setMapData] = useState<any[]>([]);
  const [lemburViewData, setLemburViewData] = useState<any[]>([]);
  const [listJO1, setJo1] = useState<any>();
  const [machineList, setMachineList] = useState<string[]>([]);

  // UI states
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().slice(0, 7);
  });
  const [selectedJO, setSelectedJO] = useState<any>(null);
  const [selectedIndex, setSelectedIndex] = useState<any>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [activeView, setActiveView] = useState('default');
  const [clickedJobOrder, setClickedJobOrder] = useState<any>(null);

  // Search states
  const [searchJO, setSearchJO] = useState<string>('');
  const [highlightedJO, setHighlightedJO] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Modal and detail states
  const [showDetail, setShowDetail] = useState<boolean[]>([]);
  const [showEdit, setShowEdit] = useState(Array(17).fill(false));
  const [selectedMachine, setSelectedMachine] = useState(null);

  // Overtime states
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  const [lemburData, setLemburData] = useState<any[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Memoized calculations
  const monthDates = useMemo(() => {
    const year = parseInt(selectedMonth.split('-')[0]);
    const month = parseInt(selectedMonth.split('-')[1]) - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from(
      { length: daysInMonth },
      (_, i) => new Date(year, month, i + 1),
    );
  }, [selectedMonth]);

  const dateRangeForMonth = useMemo(() => {
    const today = new Date(selectedMonth + '-01');
    const lastDayOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
    );
    return {
      start: today.toISOString().slice(0, 10),
      end: lastDayOfMonth.toISOString().slice(0, 10),
    };
  }, [selectedMonth]);

  // Optimized color mapping with stable references
  const colorMaps = useMemo(() => {
    const jobMap = new Map<string, string>();
    const bookingMap = new Map<string, string>();
    const usedJobColors = new Set<string>();
    const usedBookingColors = new Set<string>();

    const getJobOrderColor = (jobOrderNumber: string): string => {
      if (jobMap.has(jobOrderNumber)) return jobMap.get(jobOrderNumber)!;
      let assignedColor: string;
      if (usedJobColors.size < jobOrderColors.length) {
        const hash = createBetterHash(jobOrderNumber);
        const colorIndex = Math.abs(hash) % jobOrderColors.length;
        const potentialColor = jobOrderColors[colorIndex];
        assignedColor = !usedJobColors.has(potentialColor)
          ? potentialColor
          : jobOrderColors.find((color) => !usedJobColors.has(color)) ||
            jobOrderColors[0];
      } else {
        const hash = createBetterHash(jobOrderNumber);
        assignedColor = jobOrderColors[Math.abs(hash) % jobOrderColors.length];
      }
      jobMap.set(jobOrderNumber, assignedColor);
      usedJobColors.add(assignedColor);
      return assignedColor;
    };

    const getBookingTextColor = (bookingNumber: string): string => {
      if (bookingMap.has(bookingNumber)) return bookingMap.get(bookingNumber)!;
      let assignedColor: string;
      if (usedBookingColors.size < bookingTextColors.length) {
        const hash = createBetterHash(bookingNumber);
        const colorIndex = Math.abs(hash) % bookingTextColors.length;
        const potentialColor = bookingTextColors[colorIndex];
        assignedColor = !usedBookingColors.has(potentialColor)
          ? potentialColor
          : bookingTextColors.find((color) => !usedBookingColors.has(color)) ||
            bookingTextColors[0];
      } else {
        const hash = createBetterHash(bookingNumber);
        assignedColor =
          bookingTextColors[Math.abs(hash) % bookingTextColors.length];
      }
      bookingMap.set(bookingNumber, assignedColor);
      usedBookingColors.add(assignedColor);
      return assignedColor;
    };

    return { getJobOrderColor, getBookingTextColor };
  }, [mapData]);

  // Memoized machine heights — depends on machineList from API
  const machineHeights = useMemo(() => {
    const heights = new Map<string, number>();
    machineList.forEach((machine) => {
      const maxHeight = Math.max(
        ...monthDates.map((date) => {
          const matchingData = mapData.filter((d: any) => {
            const dateTanggal = new Date(d.tanggal);
            return (
              dateTanggal.getFullYear() === date.getFullYear() &&
              dateTanggal.getMonth() === date.getMonth() &&
              dateTanggal.getDate() === date.getDate() &&
              d.mesin === machine
            );
          });
          return Math.max(60, 40 + matchingData.length * 32 + 8);
        }),
        60,
      );
      heights.set(machine, maxHeight);
    });
    return heights;
  }, [mapData, monthDates, machineList]);

  // Memoized grouped data by machine and date
  const groupedData = useMemo(() => {
    const grouped = new Map<string, Map<string, any[]>>();
    mapData.forEach((item) => {
      const dateKey = new Date(item.tanggal).toDateString();
      if (!grouped.has(item.mesin)) grouped.set(item.mesin, new Map());
      const machineData = grouped.get(item.mesin)!;
      if (!machineData.has(dateKey)) machineData.set(dateKey, []);
      machineData.get(dateKey)!.push(item);
    });
    return grouped;
  }, [mapData]);

  const formatCustomDate = useCallback((dateString: string) => {
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
  }, []);

  const setLoading = useCallback((key: keyof LoadingState, value: boolean) => {
    setLoadingState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const getMachineList = useCallback(async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_LINK}/master/mesinTahapan`,
        { withCredentials: true },
      );
      const machines: string[] = res.data.data.map((m: any) => m.nama_mesin);
      setMachineList(machines);
      // Expand showEdit array to match machine count
      setShowEdit(new Array(machines.length).fill(false));
    } catch (error) {
      console.error('Error fetching machine list:', error);
    }
  }, []);

  const get1Tiket = useCallback(
    async (id: any, i: any) => {
      const url = `${import.meta.env.VITE_API_LINK}/ppic/jadwalProduksi/${id}`;
      try {
        setLoading('detail', true);
        const res = await axios.get(url, { withCredentials: true });
        setJo1(res.data);
        setShowDetail(
          new Array(res.data?.data?.tahap?.length || 0).fill(false),
        );
      } catch (error: any) {
        console.error('Error fetching ticket:', error);
      } finally {
        setLoading('detail', false);
      }
    },
    [setLoading],
  );

  const getJadwalView = useCallback(
    async (tglAwal: string, tglAkhir: string) => {
      const url = `${
        import.meta.env.VITE_API_LINK
      }/ppic/jadwalProduksiWeekView`;
      try {
        setLoading('schedule', true);
        const response = await axios.get(url, {
          params: { start_date: tglAwal, end_date: tglAkhir },
          withCredentials: true,
        });
        setMapData(response.data.data || []);
      } catch (error) {
        console.error('Error fetching schedule data:', error);
        setMapData([]);
      } finally {
        setLoading('schedule', false);
      }
    },
    [setLoading],
  );

  const getJadwalLembur = useCallback(
    async (tglAwal: string, tglAkhir: string) => {
      const url = `${
        import.meta.env.VITE_API_LINK
      }/ppic/jadwalProduksiViewLembur`;
      try {
        setLoading('overtime', true);
        const response = await axios.get(url, {
          params: { start_date: tglAwal, end_date: tglAkhir },
          withCredentials: true,
        });
        setLemburViewData(response.data.data || []);
      } catch (error) {
        console.error('Error fetching overtime data:', error);
        setLemburViewData([]);
      } finally {
        setLoading('overtime', false);
      }
    },
    [setLoading],
  );

  const getmasterKategori = useCallback(
    async (
      statusTiket: string = 'history',
      startDate: string = '',
      endDate: string = '',
      searchTerm: string = '',
    ) => {
      const url = `${import.meta.env.VITE_API_LINK}/ppic/jadwalProduksi`;
      try {
        setLoading('main', true);
        const params: any = { status_tiket: statusTiket };
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;
        if (searchTerm) params.search = searchTerm;
        const res = await axios.get(url, { params, withCredentials: true });
        if (statusTiket === 'history') {
          setHistoryListJO(res.data || { data: [] });
        } else if (statusTiket === 'penjadwalan') {
          setPenjadwalanListJO(res.data || { data: [] });
        }
      } catch (error) {
        console.error('Error fetching master kategori:', error);
        if (statusTiket === 'history') setHistoryListJO({ data: [] });
        else if (statusTiket === 'penjadwalan')
          setPenjadwalanListJO({ data: [] });
      } finally {
        setLoading('main', false);
      }
    },
    [setLoading],
  );

  const postLembur = useCallback(
    async (lembur_data: any, mesin: any, i: any) => {
      const url = `${
        import.meta.env.VITE_API_LINK
      }/ppic/jadwalProduksiViewLembur`;
      try {
        setLoading('main', true);
        await axios.post(
          url,
          { data_lembur: lembur_data, mesin },
          { withCredentials: true },
        );
        alert('Berhasil menambah data lembur!');
        closeEdit(i);
        await getJadwalLembur(dateRangeForMonth.start, dateRangeForMonth.end);
      } catch (error: any) {
        alert(error.response?.data?.message || 'Error saving overtime data');
      } finally {
        setLoading('main', false);
      }
    },
    [setLoading, getJadwalLembur, dateRangeForMonth],
  );

  const handleMonthChange = useCallback(
    (direction: 'next' | 'prev') => {
      const currentDate = new Date(selectedMonth + '-01');
      currentDate.setMonth(
        currentDate.getMonth() + (direction === 'next' ? 1 : -1),
      );
      setSelectedMonth(currentDate.toISOString().slice(0, 7));
    },
    [selectedMonth],
  );

  const handleClickDetail = useCallback((index: number) => {
    setShowDetail((prevState) => {
      const updatedShowDetail = [...prevState];
      updatedShowDetail[index] = !updatedShowDetail[index];
      return updatedShowDetail;
    });
  }, []);

  const openEdit = useCallback(
    (index: any, machine: any) => {
      const updatedShowEdit = [...showEdit];
      updatedShowEdit[index] = true;
      setShowEdit(updatedShowEdit);

      const matchingEntries = mapData.filter((d: any) => d.mesin === machine);
      if (matchingEntries.length > 0) {
        setSelectedMachine(matchingEntries[0].mesin);
      } else {
        alert(
          `Tidak ada Jadwal Untuk Mesin ${machine}, pada bulan ${selectedMonth}`,
        );
        closeEdit(index);
      }
    },
    [showEdit, mapData, selectedMonth],
  );

  const closeEdit = useCallback(
    (index: any) => {
      const updatedShowEdit = [...showEdit];
      updatedShowEdit[index] = false;
      setShowEdit(updatedShowEdit);
    },
    [showEdit],
  );

  const generateDateRange = useCallback(
    (startDate: string, endDate: string) => {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const dateList = [];
      let currentDate = new Date(start);
      while (currentDate <= end) {
        dateList.push({
          tanggal_lembur: currentDate.toISOString().split('T')[0],
          shift_1: false,
          shift_2: false,
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      return dateList;
    },
    [],
  );

  const handleDateRangeChange = useCallback(
    (field: 'startDate' | 'endDate', value: string) => {
      const newDateRange = { ...dateRange, [field]: value };
      setDateRange(newDateRange);
      if (newDateRange.startDate && newDateRange.endDate) {
        setLemburData(
          generateDateRange(newDateRange.startDate, newDateRange.endDate),
        );
      }
    },
    [dateRange, generateDateRange],
  );

  const handleShiftChange = useCallback(
    (index: number, shift: 'shift_1' | 'shift_2', checked: boolean) => {
      const newData = [...lemburData];
      newData[index][shift] = checked;
      setLemburData(newData);
    },
    [lemburData],
  );

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);

    setLemburData((prev) =>
      prev.map((item) => ({
        ...item,
        shift_1: checked,
        shift_2: checked,
      })),
    );
  };

  const handleSearch = useCallback(() => {
    if (searchJO.trim() === '') {
      setHighlightedJO('');
      setSearchResults([]);
      return;
    }
    const results = mapData.filter((item: any) =>
      item.no_jo.toLowerCase().includes(searchJO.toLowerCase()),
    );
    if (results.length > 0) {
      setHighlightedJO(searchJO.toLowerCase());
      setSearchResults(results);
      const uniqueJOs = [...new Set(results.map((r: any) => r.no_jo))];
      alert(
        `Found ${results.length} matching entries for JO(s): ${uniqueJOs.join(
          ', ',
        )}`,
      );
    } else {
      setHighlightedJO('');
      setSearchResults([]);
      alert('No matching JO found');
    }
  }, [searchJO, mapData]);

  const clearSearch = useCallback(() => {
    setSearchJO('');
    setHighlightedJO('');
    setSearchResults([]);
  }, []);

  const handleJobOrderClick = useCallback((data: any) => {
    setClickedJobOrder(data);
  }, []);

  const closeJobOrderDetails = useCallback(() => {
    setClickedJobOrder(null);
  }, []);

  useEffect(() => {
    const initializeData = async () => {
      setLoading('main', true);
      try {
        await Promise.all([
          getMachineList(),
          getmasterKategori('history'),
          getmasterKategori('penjadwalan'),
          getJadwalView(dateRangeForMonth.start, dateRangeForMonth.end),
          getJadwalLembur(dateRangeForMonth.start, dateRangeForMonth.end),
        ]);
      } catch (error) {
        console.error('Error initializing data:', error);
      } finally {
        setLoading('main', false);
      }
    };
    initializeData();
  }, [
    selectedMonth,
    dateRangeForMonth,
    getmasterKategori,
    getJadwalView,
    getJadwalLembur,
    setLoading,
  ]);

  useEffect(() => {
    setLemburData(generateDateRange(dateRange.startDate, dateRange.endDate));
  }, [dateRange.startDate, dateRange.endDate, generateDateRange]);

  const isDataLoaded = useMemo(() => {
    return (
      !loadingState.main && !loadingState.schedule && !loadingState.overtime
    );
  }, [loadingState]);

  const isLoading = useMemo(() => {
    return Object.values(loadingState).some((loading) => loading);
  }, [loadingState]);

  if (!isDataLoaded) {
    return (
      <main className="overflow-x-scroll">
        <Loading />
        <div className="min-w-[700px] bg-white rounded-xl flex gap-1 px-4 py-4">
          <div className="flex w-full justify-center items-center h-96">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-600 mb-2">
                Loading Schedule Data...
              </div>
              <div className="text-sm text-gray-500">
                Please wait while we fetch the latest information
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const exportToExcel = (data: any, filename = 'production_schedule') => {
    const groupedData = data.reduce((acc: any, item: any) => {
      const jobNumber = item.no_jo || item.no_booking || 'No Job Number';
      if (!acc[jobNumber]) {
        acc[jobNumber] = {
          no_jo: item.no_jo,
          no_booking: item.no_booking,
          item: item.item,
          tahapan_list: {},
        };
      }
      if (!acc[jobNumber].tahapan_list[item.tahapan]) {
        acc[jobNumber].tahapan_list[item.tahapan] = {
          tahapan: item.tahapan,
          tahapan_ke: item.tahapan_ke,
          kategori: item.kategori,
          nama_kategori: item.nama_kategori,
          dates: {},
        };
      }
      const date = new Date(item.tanggal).toLocaleDateString('id-ID');
      if (!acc[jobNumber].tahapan_list[item.tahapan].dates[date]) {
        acc[jobNumber].tahapan_list[item.tahapan].dates[date] = {
          tanggal: date,
          machines: [],
        };
      }
      acc[jobNumber].tahapan_list[item.tahapan].dates[date].machines.push({
        mesin: item.mesin,
        qty_pcs: item.qty_pcs,
        qty_druk: item.qty_druk,
        jam: item.jam,
        total_waktu: item.total_waktu,
        kapasitas_per_jam: item.kapasitas_per_jam,
        drying_time: item.drying_time,
        setting: item.setting,
      });
      return acc;
    }, {});

    const excelData: any = [];
    Object.entries(groupedData).forEach(([jobNumber, jobInfo]: [any, any]) => {
      excelData.push({
        'No JO': jobInfo.no_jo || '',
        'No Booking': jobInfo.no_booking || '',
        Item: jobInfo.item,
        Kategori: '',
        'Nama Kategori': '',
        Tahapan: '',
        'Tahapan Ke': '',
        Tanggal: '',
        Mesin: '',
        'Qty Pieces': '',
        'Qty Druk': '',
        Jam: '',
        'Total Waktu ': '',
        'Kapasitas/Jam': '',
        'Drying Time': '',
        Setting: '',
      });
      const sortedTahapan = Object.entries(jobInfo.tahapan_list).sort(
        ([, a], [, b]) => {
          return ((a as any).tahapan_ke || 0) - ((b as any).tahapan_ke || 0);
        },
      );
      sortedTahapan.forEach(([tahapanName, tahapanInfo]: [any, any]) => {
        excelData.push({
          'No JO': '',
          'No Booking': '',
          Item: '',
          Kategori: tahapanInfo.kategori,
          'Nama Kategori': tahapanInfo.nama_kategori,
          Tahapan: `${tahapanInfo.tahapan} (Stage ${tahapanInfo.tahapan_ke})`,
          'Tahapan Ke': tahapanInfo.tahapan_ke,
          Tanggal: '',
          Mesin: '',
          'Qty Pieces': '',
          'Qty Druk': '',
          Jam: '',
          'Total Waktu ': '',
          'Kapasitas/Jam': '',
          'Drying Time': '',
          Setting: '',
        });
        const sortedDates = Object.keys(tahapanInfo.dates).sort(
          (a: any, b: any) => {
            return (
              new Date(a.split('/').reverse().join('-')).getTime() -
              new Date(b.split('/').reverse().join('-')).getTime()
            );
          },
        );
        sortedDates.forEach((date) => {
          tahapanInfo.dates[date].machines.forEach(
            (machine: any, index: any) => {
              excelData.push({
                'No JO': '',
                'No Booking': '',
                Item: '',
                Kategori: '',
                'Nama Kategori': '',
                Tahapan: '',
                'Tahapan Ke': '',
                Tanggal: index === 0 ? date : '',
                Mesin: machine.mesin,
                'Qty Pieces': machine.qty_pcs,
                'Qty Druk': machine.qty_druk,
                Jam: machine.jam,
                'Total Waktu ': machine.total_waktu,
                'Kapasitas/Jam': machine.kapasitas_per_jam,
                'Drying Time': machine.drying_time,
                Setting: machine.setting,
              });
            },
          );
        });
      });
      excelData.push({
        'No JO': '',
        'No Booking': '',
        Item: '',
        Kategori: '',
        'Nama Kategori': '',
        Tahapan: '',
        'Tahapan Ke': '',
        Tanggal: '---',
        Mesin: '---',
        'Qty Pieces': '',
        'Qty Druk': '',
        Jam: '',
        'Total Waktu': '',
        'Kapasitas/Jam': '',
        'Drying Time': '',
        Setting: '',
      });
    });

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    worksheet['!cols'] = [
      { wch: 15 },
      { wch: 15 },
      { wch: 40 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
      { wch: 10 },
      { wch: 12 },
      { wch: 10 },
      { wch: 12 },
      { wch: 12 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
      { wch: 12 },
      { wch: 10 },
    ];
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Production Schedule');

    const allDates = data
      .map((item: any) => new Date(item.tanggal))
      .filter((date: any) => !isNaN(date));
    const minDate = new Date(Math.min(...allDates));
    const maxDate = new Date(Math.max(...allDates));
    const formatDate = (date: any) =>
      date.toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit' });
    const exportDate = new Date()
      .toLocaleDateString('id-ID', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
      .replace(/\//g, '-');
    const dataRange =
      minDate.getMonth() === maxDate.getMonth() &&
      minDate.getFullYear() === maxDate.getFullYear()
        ? formatDate(minDate).replace('/', '-')
        : `${formatDate(minDate).replace('/', '-')}_to_${formatDate(
            maxDate,
          ).replace('/', '-')}`;
    XLSX.writeFile(
      workbook,
      `${filename}_${dataRange}_exported_${exportDate}.xlsx`,
    );
  };

  const handleExportExcel = () => {
    if (mapData && mapData.length > 0) {
      exportToExcel(mapData, 'jadwal_produksi');
    } else {
      alert('No data to export');
    }
  };

  return (
    <main className="overflow-x-scroll">
      {isLoading && <Loading />}
      <div className="min-w-[700px] bg-white rounded-xl flex gap-1 px-4 py-4">
        <div className="flex w-full flex-col">
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
                onChange={(e) => setSelectedMonth(e.target.value)}
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
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search JO Number..."
                  value={searchJO}
                  onChange={(e) => setSearchJO(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Search
                </button>
                <button
                  onClick={clearSearch}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Clear
                </button>
              </div>
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

            <button
              onClick={handleExportExcel}
              className="bg-green-600 text-white py-1 px-4 mb-2 rounded hover:bg-green-700 font-medium"
            >
              Export to Excel
            </button>

            {/* Schedule Grid */}
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
                    <MachineColumn
                      key={machine}
                      machine={machine}
                      index={index}
                      height={machineHeights.get(machine) || 60}
                      onClick={() => openEdit(index, machine)}
                    />
                  ))}
                </div>

                {/* Date Columns */}
                <div className="flex flex-grow overflow-x-auto">
                  <div className="flex">
                    {monthDates.map((date, dateIndex) => (
                      <div
                        key={dateIndex}
                        className="flex flex-col w-[50px] border-r border-[#D8EAFF]"
                      >
                        <div className="h-10 border-b border-[#D8EAFF] bg-[#eaf4ff] flex items-center justify-center">
                          <p className="text-[#0065de] text-[11px] font-semibold">
                            {date.getDate()}
                          </p>
                        </div>

                        {machineList.map((machine, machineIndex) => {
                          const dateKey = date.toDateString();
                          const machineData = groupedData.get(machine);
                          const matchingData = machineData?.get(dateKey) || [];
                          const height = machineHeights.get(machine) || 60;

                          if (activeView === 'default') {
                            return (
                              <div
                                key={machineIndex}
                                className={`flex flex-col items-center justify-start p-1 ${
                                  machineIndex % 2 === 0
                                    ? 'bg-[#F0F7FF]'
                                    : 'bg-white'
                                }`}
                                style={{
                                  height: `${height}px`,
                                  minHeight: '60px',
                                }}
                              >
                                {matchingData.length > 0 && (
                                  <div className="flex flex-col items-center gap-1 w-full h-full overflow-y-auto">
                                    {matchingData.map(
                                      (data: any, index: any) => {
                                        const jobOrderColorClass =
                                          colorMaps.getJobOrderColor(
                                            data.no_jo,
                                          );
                                        const bookingColorClass =
                                          data.no_booking
                                            ? colorMaps.getBookingTextColor(
                                                data.no_booking,
                                              )
                                            : '';
                                        const isHighlighted =
                                          highlightedJO &&
                                          data.no_jo
                                            .toLowerCase()
                                            .includes(highlightedJO);
                                        return (
                                          <JobOrderCard
                                            key={index}
                                            data={data}
                                            jobOrderColor={jobOrderColorClass}
                                            bookingColor={bookingColorClass}
                                            isHighlighted={isHighlighted}
                                            onClick={() =>
                                              handleJobOrderClick(data)
                                            }
                                          />
                                        );
                                      },
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          } else {
                            // LEMBUR view
                            const lemburForDateAndMachine =
                              lemburViewData.filter((l: any) => {
                                const lemburDateParts = l.tanggal_lembur
                                  .split('T')[0]
                                  .split('-');
                                return (
                                  parseInt(lemburDateParts[0]) ===
                                    date.getFullYear() &&
                                  parseInt(lemburDateParts[1]) ===
                                    date.getMonth() + 1 &&
                                  parseInt(lemburDateParts[2]) ===
                                    date.getDate() &&
                                  l.mesin === machine
                                );
                              });

                            let bgColorClass = '';
                            let shiftText = '';
                            if (lemburForDateAndMachine.length > 0) {
                              const shift1Active = lemburForDateAndMachine.some(
                                (l) => l.shift_1,
                              );
                              const shift2Active = lemburForDateAndMachine.some(
                                (l) => l.shift_2,
                              );
                              if (shift1Active && shift2Active) {
                                bgColorClass = 'bg-green-500';
                                shiftText = 'Shift 1 & 2';
                              } else if (shift1Active) {
                                bgColorClass = 'bg-yellow-500';
                                shiftText = 'Shift 1';
                              } else if (shift2Active) {
                                bgColorClass = 'bg-blue-500';
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
                                style={{ height: `${height}px` }}
                              >
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
                          }
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Job Order Details Card */}
          {clickedJobOrder && (
            <div className="fixed bottom-4 right-4 bg-white shadow-lg p-4 rounded-md border-2 border-black z-50 max-w-sm">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-sm">Job Order Details</h3>
                <button
                  onClick={closeJobOrderDetails}
                  className="text-gray-500 hover:text-gray-700 text-xl font-bold leading-none"
                  title="Close"
                >
                  ×
                </button>
              </div>
              <div className="text-xs space-y-1">
                <p>
                  <span className="font-semibold">Job Order:</span>{' '}
                  {clickedJobOrder.no_jo}
                </p>
                <p>
                  <span className="font-semibold">No Booking:</span>{' '}
                  {clickedJobOrder.no_booking || 'N/A'}
                </p>
                <p>
                  <span className="font-semibold">Item:</span>{' '}
                  {clickedJobOrder.item}
                </p>
                <p>
                  <span className="font-semibold">Machine:</span>{' '}
                  {clickedJobOrder.mesin}
                </p>
                <p>
                  <span className="font-semibold">Date:</span>{' '}
                  {convertTimeStampToDate(clickedJobOrder.tanggal)}
                </p>
              </div>
            </div>
          )}

          {/* Overtime Edit Modal */}
          {showEdit.some((edit) => edit) && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
                <h3 className="text-lg font-bold mb-4">
                  Add Overtime Schedule
                </h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Machine: {selectedMachine}
                  </label>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Start Date:
                  </label>
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) =>
                      handleDateRangeChange('startDate', e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    End Date:
                  </label>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) =>
                      handleDateRangeChange('endDate', e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div className="mb-4 max-h-60 overflow-y-auto">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Select Shifts:</h4>

                    <label className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="mr-1"
                      />
                      Select All
                    </label>
                  </div>
                  {lemburData.map((data, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between mb-2 p-2 bg-gray-50 rounded"
                    >
                      <span className="text-sm">{data.tanggal_lembur}</span>
                      <div className="flex gap-2">
                        <label className="flex items-center text-sm">
                          <input
                            type="checkbox"
                            checked={data.shift_1}
                            onChange={(e) =>
                              handleShiftChange(
                                index,
                                'shift_1',
                                e.target.checked,
                              )
                            }
                            className="mr-1"
                          />
                          Shift 1
                        </label>
                        <label className="flex items-center text-sm">
                          <input
                            type="checkbox"
                            checked={data.shift_2}
                            onChange={(e) =>
                              handleShiftChange(
                                index,
                                'shift_2',
                                e.target.checked,
                              )
                            }
                            className="mr-1"
                          />
                          Shift 2
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() =>
                      closeEdit(showEdit.findIndex((edit) => edit))
                    }
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() =>
                      postLembur(
                        lemburData,
                        selectedMachine,
                        showEdit.findIndex((edit) => edit),
                      )
                    }
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    disabled={loadingState.main}
                  >
                    {loadingState.main ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          )}

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

        {/* Modal for Job Order Details */}
        {isModalOpen && selectedJO && (
          <ModalXL
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            judul={'Rumus Kalkulasi'}
          >
            <>
              <div className="grid grid-cols-2 gap-2 px-4 py-4 border-b-8 border-[#D8EAFF]">
                <div className="flex flex-col">
                  <div className="grid grid-cols-2 gap-2">
                    <label className="text-black text-xs font-bold">
                      Nomor JO
                    </label>
                    <label className="text-[#016ae6] uppercase text-xl font-normal">
                      : {selectedJO?.no_jo}
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="text-black text-xs font-bold">Item</label>
                    <label className="text-[#016ae6] uppercase text-xl font-normal">
                      : {selectedJO?.item}
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="text-black text-xs font-bold">
                      Tanggal Kirim
                    </label>
                    <label className="text-[#016ae6] uppercase text-xl font-normal">
                      : {convertTimeStampToDate(selectedJO?.tgl_kirim)}
                    </label>
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="grid grid-cols-2 gap-2">
                    <label className="text-black text-xs font-bold">
                      Qty Druk
                    </label>
                    <label className="text-[#016ae6] uppercase text-xl font-normal">
                      : {formatInteger(selectedJO?.qty_druk)}
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="text-black text-xs font-bold">
                      Qty Pcs
                    </label>
                    <label className="text-[#016ae6] uppercase text-xl font-normal">
                      : {formatInteger(selectedJO?.qty_pcs)}
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex overflow-x-scroll max-w-screen border-b-8 border-[#D8EAFF] gap-2 px-4 py-4">
                <div className="w-[150px] flex flex-col">
                  <label className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]">
                    TAHAPAN
                  </label>
                  <label className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]">
                    TANGGAL
                  </label>
                  {showDetail[selectedIndex] && (
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
                  {listJO1?.data?.tahap?.map((data2: any, ii: number) => (
                    <div
                      key={ii}
                      className="min-w-[150px] flex flex-col justify-center"
                    >
                      <label className="text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]">
                        {data2.tahapan}
                      </label>
                      <div className="justify-center border-2 border-stroke flex items-center h-[50px]">
                        {data2?.jadwal_per_jam?.length === 0 ? (
                          <label className="text-blue-400 text-xs border-2 px-2 py-1 rounded-md border-blue-400 text-center">
                            {formatCustomDate(data2.tgl_from)}
                          </label>
                        ) : (
                          <button className="text-blue-400 text-xs border-2 px-2 py-1 rounded-md border-blue-400 text-center">
                            {data2.jadwal_per_jam?.length === 0
                              ? '-'
                              : convertTimeStampToDate(
                                  data2.jadwal_per_jam[0]?.tanggal,
                                )}{' '}
                            - {data2.jadwal_per_jam[0]?.jam}
                          </button>
                        )}
                      </div>
                      {showDetail[selectedIndex] && (
                        <>
                          <label className="text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]">
                            {data2.kategory}
                          </label>
                          <label className="text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]">
                            {data2.kategory_drying_time}
                          </label>
                          <label className="text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]">
                            {data2.mesin}
                          </label>
                          <label className="text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]">
                            {data2.kapasitas_per_jam}
                          </label>
                          <label className="text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]">
                            {data2.drying_time}
                          </label>
                          <label className="text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]">
                            {data2.setting}
                          </label>
                          <label className="text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]">
                            {data2.kapasitas}
                          </label>
                          <label className="text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]">
                            {data2.toleransi}
                          </label>
                          <label className="text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]">
                            {data2.total_waktu}
                          </label>
                        </>
                      )}
                    </div>
                  ))}
                </div>
                <div>
                  <button
                    title="button"
                    onClick={() => handleClickDetail(selectedIndex)}
                    className="text-xs w-full flex font-bold text-white px-1 bg-blue-700 py-2 border-blue-700 border rounded-md"
                  >
                    DETAIL
                  </button>
                </div>
              </div>
            </>
          </ModalXL>
        )}
      </div>
    </main>
  );
}

export default TampilanMonthlyJO;
