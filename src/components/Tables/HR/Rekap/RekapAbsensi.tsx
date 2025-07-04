import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import MonthlyCharts from './MonthlyCharts';

// Configure axios defaults
axios.defaults.withCredentials = true;

function AttendanceRecapChart() {
  const [isLoading, setIsLoading] = useState(false);
  const [absen, setAbsen] = useState<Employee[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyDataItem[]>([]);
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [monthlyChartData, setMonthlyChartData] = useState<MonthlyChartData[]>(
    [],
  );
  const [selectedDivisi, setSelectedDivisi] = useState('');
  const [filteredData, setFilteredData] = useState<Employee[]>([]);
  const [selectedBar, setSelectedBar] = useState<ChartDataItem | null>(null);

  const [isMonthlyView, setIsMonthlyView] = useState(false);

  interface Department {
    id: string;
    nama_department: string;
  }
  const [department, setDepartment] = useState<Department[]>([]);
  const [selectedDetail, setSelectedDetail] = useState<{
    monthYear: string;
    field: keyof MonthlyChartData;
  } | null>(null);

  const [selectedMonthBar, setSelectedMonthBar] = useState<{
    monthYear: string;
  } | null>(null);
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [idDepartment, setIdDepartment] = useState('');

  // Get filtered data based on search query
  const filteredAbsen = useMemo(() => {
    const source = isMonthlyView ? [] : absen;
    return selectedDivisi
      ? source.filter((emp) => emp.divisi === selectedDivisi)
      : source;
  }, [absen, selectedDivisi, isMonthlyView]);

  const filteredMonthly = useMemo(() => {
    if (!isMonthlyView) return [];
    return monthlyData.map((month) => ({
      ...month,
      employees: selectedDivisi
        ? month.employees.filter((emp) => emp.divisi === selectedDivisi)
        : month.employees,
    }));
  }, [monthlyData, selectedDivisi, isMonthlyView]);

  useEffect(() => {
    getDepartment();
  }, []);

  useEffect(() => {
    if (isMonthlyView && monthlyData.length > 0) {
      const filteredMonthly = searchQuery
        ? monthlyData.map((month) => ({
            ...month,
            employees: month.employees.filter((emp) =>
              emp.nama_karyawan
                .toLowerCase()
                .includes(searchQuery.toLowerCase()),
            ),
          }))
        : monthlyData;

      generateMonthlyChartData(filteredMonthly);
    } else if (absen && absen.length > 0) {
      const dataForChart = searchQuery ? filteredAbsen : absen;
      generateChartData(dataForChart);
      setFilteredData(dataForChart);
      setSelectedBar(null);
    }
  }, [searchQuery, absen, monthlyData, isMonthlyView]);

  const resetDepartmentFilter = () => {
    setSelectedBar(null);
    setSelectedMonthBar(null);
  };

  useEffect(() => {
    if (isMonthlyView && filteredMonthly.length > 0) {
      generateMonthlyChartData(filteredMonthly);
    } else if (!isMonthlyView && filteredAbsen.length > 0) {
      generateChartData(filteredAbsen);
      setFilteredData(filteredAbsen);
    }
  }, [filteredAbsen, filteredMonthly, isMonthlyView]);

  // Helper function to calculate months difference
  const getMonthsDifference = (dateFrom: string, dateTo: string) => {
    const startDate = new Date(dateFrom);
    const endDate = new Date(dateTo);
    return (
      (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      (endDate.getMonth() - startDate.getMonth()) +
      1
    );
  };

  const uniqueDivisiOptions = useMemo(() => {
    const source = isMonthlyView
      ? monthlyData.flatMap((m) => m.employees)
      : absen;

    const divisiSet = new Set(source.map((emp) => emp.divisi).filter(Boolean));
    return Array.from(divisiSet);
  }, [absen, monthlyData, isMonthlyView]);

  async function getDepartment() {
    const url = `${import.meta.env.VITE_API_LINK}/master/hr/department`;
    try {
      setIsLoading(true);
      const response = await axios.get(url, {
        params: { is_active: true },
        withCredentials: true,
      });
      setIsLoading(false);
      setDepartment(response.data.data);
      console.log(response.data.data);
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  }

  async function getAbsen(dateFrom1: any, dateTo1: any) {
    const monthsDiff = getMonthsDifference(dateFrom1, dateTo1);
    const useMonthlyAPI = monthsDiff > 1 && idDepartment;

    const url = useMonthlyAPI
      ? `${import.meta.env.VITE_API_LINK}/hr/absensiRekapPeriode`
      : `${import.meta.env.VITE_API_LINK}/hr/absensiRekap`;

    const params = {
      startDate: dateFrom1,
      endDate: dateTo1,
      ...(idDepartment && { idDepartment: idDepartment }),
    };

    try {
      setIsLoading(true);
      const response = await axios.get(url, {
        params,
        withCredentials: true,
      });
      setIsLoading(false);

      if (useMonthlyAPI) {
        // Transform the new API response to match expected structure
        const transformedData = response.data.data.map((monthItem: any) => ({
          month: monthItem.bulan.split(' ')[0], // Extract month name
          year: parseInt(monthItem.bulan.split(' ')[1]), // Extract year
          monthYear: monthItem.bulan, // Keep full month year string
          startPeriode: monthItem.startPeriode,
          endPeriode: monthItem.endPeriode,
          employees: monthItem.rekapAbsen || [], // Map rekapAbsen to employees
        }));

        setMonthlyData(transformedData);
        setAbsen([]);
        setIsMonthlyView(true);
        console.log('Monthly data:', transformedData);
      } else {
        setAbsen(response.data.data);
        setMonthlyData([]);
        setIsMonthlyView(false);
        console.log('Regular data:', response.data.data);
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  }

  // Calculate overtime hours based on status_lembur
  const calculateOvertimeHours = (absensiData: any) => {
    let lemburBiasa = 0;
    let lemburLibur = 0;
    let lemburDenganSPL = 0;
    let lemburTanpaSPL = 0;

    absensiData?.forEach((record: any) => {
      const jamLembur = parseFloat(record.jam_lembur || 0);

      if (
        record.status_lembur === 'Lembur' ||
        record.status_lembur === 'lembur'
      ) {
        lemburBiasa += jamLembur;
      } else if (record.status_lembur === 'Lembur Libur') {
        lemburLibur += jamLembur;
      }

      if (record.status_lembur_spl === 'dengan SPL') {
        lemburDenganSPL += jamLembur;
      } else if (record.status_lembur_spl === 'tidak dengan SPL') {
        lemburTanpaSPL += jamLembur;
      }
    });

    return {
      lemburBiasa: lemburBiasa.toFixed(1),
      lemburLibur: lemburLibur.toFixed(1),
      lemburDenganSPL: lemburDenganSPL.toFixed(1),
      lemburTanpaSPL: lemburTanpaSPL.toFixed(1),
    };
  };

  // Calculate late minutes and early leave minutes
  const calculateTimeMetrics = (absensiData: any) => {
    let totalTerlambat = 0;
    let totalPulangCepat = 0;
    let totalIstirahatLembur = 0;
    let jumlahHariTerlambat = 0;

    absensiData?.forEach((record: any) => {
      const menitTerlambat = parseInt(record.menit_terlambat || 0);
      const menitPulangCepat = parseInt(record.menit_pulang_cepat || 0);
      const jamIstirahatLembur = parseFloat(record.jam_istirahat_lembur || 0);

      totalTerlambat += menitTerlambat;
      totalPulangCepat += menitPulangCepat;
      totalIstirahatLembur += jamIstirahatLembur;

      if (menitTerlambat > 0) {
        jumlahHariTerlambat++;
      }
    });

    return {
      totalTerlambat,
      totalPulangCepat,
      totalIstirahatLembur: totalIstirahatLembur.toFixed(1),
      jumlahHariTerlambat,
    };
  };

  interface Employee {
    department: string;
    nama_karyawan: string;
    nik: string;
    divisi: string;
    absensi?: {
      jam_lembur?: string;
      status_lembur?: string;
      status_lembur_spl?: string;
    }[];
    jumlah_hari_cuti_tahunan?: number;
    jumlah_hari_cuti_khusus?: number;
    jumlah_hari_izin?: number;
    jumlah_hari_sakit?: number;
    jumlah_hari_mangkir?: number;
    jumlah_hari_terlambat?: number;
    // New fields from the monthly API
    jam_lembur_biasa?: number;
    jam_lembur_libur?: number;
    cuti_tahunan?: any[];
    cuti_khusus?: any[];
    izin?: any[];
    sakit?: any[];
    mangkir?: any[];
  }

  interface MonthlyDataItem {
    month: string;
    year: number;
    monthYear: string;
    startPeriode: string;
    endPeriode: string;
    employees: Employee[];
  }

  interface ChartDataItem {
    department: string;
    totalEmployees: number;
    totalHariMasuk: number;
    totalCutiTahunan: number;
    totalCutiKhusus: number;
    totalIzin: number;
    totalSakit: number;
    totalMangkir: number;
    totalTerlambat: number;
    totalJamLembur: number;
    lemburBiasa: number;
    lemburLibur: number;
    lemburDenganSPL: number;
    lemburTanpaSPL: number;
  }

  interface MonthlyChartData {
    monthYear: string;
    totalEmployees: number;

    totalCutiTahunan: number;
    totalCutiKhusus: number;
    totalIzin: number;
    totalSakit: number;
    totalMangkir: number;
    totalTerlambat: number;
    totalJamLembur: number;
  }

  const generateChartData = (data: Employee[]) => {
    const chartDataMap: { [key: string]: ChartDataItem } = {};

    data.forEach((employee: Employee) => {
      const dept = employee.department;
      if (!chartDataMap[dept]) {
        chartDataMap[dept] = {
          department: dept,
          totalEmployees: 0,
          totalHariMasuk: 0,
          totalCutiTahunan: 0,
          totalCutiKhusus: 0,
          totalIzin: 0,
          totalSakit: 0,
          totalMangkir: 0,
          totalTerlambat: 0,
          totalJamLembur: 0,
          lemburBiasa: 0,
          lemburLibur: 0,
          lemburDenganSPL: 0,
          lemburTanpaSPL: 0,
        };
      }

      chartDataMap[dept].totalEmployees += 1;
      chartDataMap[dept].totalHariMasuk += employee.absensi?.length || 0;
      chartDataMap[dept].totalCutiTahunan +=
        employee.jumlah_hari_cuti_tahunan || 0;
      chartDataMap[dept].totalCutiKhusus +=
        employee.jumlah_hari_cuti_khusus || 0;
      chartDataMap[dept].totalIzin += employee.jumlah_hari_izin || 0;
      chartDataMap[dept].totalSakit += employee.jumlah_hari_sakit || 0;
      chartDataMap[dept].totalMangkir += employee.jumlah_hari_mangkir || 0;
      chartDataMap[dept].totalTerlambat += employee.jumlah_hari_terlambat || 0;

      // Handle both old and new overtime data structure
      if (
        employee.jam_lembur_biasa !== undefined &&
        employee.jam_lembur_libur !== undefined
      ) {
        // New monthly API structure
        chartDataMap[dept].lemburBiasa += employee.jam_lembur_biasa || 0;
        chartDataMap[dept].lemburLibur += employee.jam_lembur_libur || 0;
        chartDataMap[dept].totalJamLembur +=
          (employee.jam_lembur_biasa || 0) + (employee.jam_lembur_libur || 0);
      } else {
        // Old structure - Calculate overtime hours using the existing method
        const overtimeData = calculateOvertimeHours(employee.absensi);
        chartDataMap[dept].lemburBiasa += parseFloat(overtimeData.lemburBiasa);
        chartDataMap[dept].lemburLibur += parseFloat(overtimeData.lemburLibur);
        chartDataMap[dept].lemburDenganSPL += parseFloat(
          overtimeData.lemburDenganSPL,
        );
        chartDataMap[dept].lemburTanpaSPL += parseFloat(
          overtimeData.lemburTanpaSPL,
        );

        // Calculate total overtime hours
        const totalLembur =
          employee.absensi?.reduce((sum: any, record: any) => {
            return sum + (parseFloat(record.jam_lembur) || 0);
          }, 0) || 0;
        chartDataMap[dept].totalJamLembur += totalLembur;
      }
    });

    setChartData(Object.values(chartDataMap));
  };

  const generateMonthlyChartData = (data: MonthlyDataItem[]) => {
    const monthlyChartData: MonthlyChartData[] = data.map((monthData) => {
      const employees = monthData.employees;

      return {
        monthYear: monthData.monthYear,
        totalEmployees: employees.length,
        totalHariMasuk: employees.reduce(
          (sum, emp) => sum + (emp.absensi?.length || 0),
          0,
        ),
        totalCutiTahunan: employees.reduce(
          (sum, emp) => sum + (emp.jumlah_hari_cuti_tahunan || 0),
          0,
        ),
        totalCutiKhusus: employees.reduce(
          (sum, emp) => sum + (emp.jumlah_hari_cuti_khusus || 0),
          0,
        ),
        totalIzin: employees.reduce(
          (sum, emp) => sum + (emp.jumlah_hari_izin || 0),
          0,
        ),
        totalSakit: employees.reduce(
          (sum, emp) => sum + (emp.jumlah_hari_sakit || 0),
          0,
        ),
        totalMangkir: employees.reduce(
          (sum, emp) => sum + (emp.jumlah_hari_mangkir || 0),
          0,
        ),
        totalTerlambat: employees.reduce(
          (sum, emp) => sum + (emp.jumlah_hari_terlambat || 0),
          0,
        ),
        totalJamLembur: employees.reduce((sum, emp) => {
          // Use the new structure fields directly
          const jamLemburBiasa = emp.jam_lembur_biasa || 0;
          const jamLemburLibur = emp.jam_lembur_libur || 0;
          return sum + jamLemburBiasa + jamLemburLibur;
        }, 0),
      };
    });

    setMonthlyChartData(monthlyChartData);
  };

  const handleBarClick = (data: any) => {
    if (isMonthlyView) {
      setSelectedMonthBar(data);
      setSelectedBar(null);
    } else {
      setSelectedBar(data);
      setSelectedMonthBar(null);
    }
  };

  const handleFilter = () => {
    if (dateFrom && dateTo) {
      getAbsen(dateFrom, dateTo);
    } else {
      alert('Please select both start and end dates');
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setDateFrom('');
    setDateTo('');
    setIdDepartment('');
    setSelectedBar(null);
    setSelectedMonthBar(null);
    setAbsen([]);
    setMonthlyData([]);
    setFilteredData([]);
    setChartData([]);
    setMonthlyChartData([]);
    setIsMonthlyView(false);
  };

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: any[];
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">
            {isMonthlyView ? `Month: ${label}` : `Department: ${label}`}
          </p>
          {payload.map((entry: any, index: any) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const displayData = useMemo(() => {
    let data: Employee[] = [];

    // First, get the base data based on view mode
    if (isMonthlyView && monthlyData.length > 0) {
      if (selectedDetail) {
        // If detail is selected, get employees from specific month that match the criteria
        const monthData = monthlyData.find(
          (m) => m.monthYear === selectedDetail.monthYear,
        );
        if (monthData) {
          data = monthData.employees.filter((emp) => {
            const { field } = selectedDetail;

            switch (field) {
              case 'totalEmployees':
                return true; // All employees
              case 'totalCutiTahunan':
                return (emp.jumlah_hari_cuti_tahunan || 0) > 0;
              case 'totalCutiKhusus':
                return (emp.jumlah_hari_cuti_khusus || 0) > 0;
              case 'totalIzin':
                return (emp.jumlah_hari_izin || 0) > 0;
              case 'totalSakit':
                return (emp.jumlah_hari_sakit || 0) > 0;
              case 'totalMangkir':
                return (emp.jumlah_hari_mangkir || 0) > 0;
              case 'totalTerlambat':
                return (emp.jumlah_hari_terlambat || 0) > 0;
              case 'totalJamLembur':
                return (
                  (emp.jam_lembur_biasa || 0) > 0 ||
                  (emp.jam_lembur_libur || 0) > 0
                );
              default:
                return false;
            }
          });
        }
      } else if (selectedMonthBar) {
        // If month bar is selected, get all employees from that month
        const monthData = monthlyData.find(
          (m) => m.monthYear === selectedMonthBar.monthYear,
        );
        data = monthData ? monthData.employees : [];
      } else {
        // Default: get all employees from all months and aggregate their data
        const employeeMap = new Map<string, Employee>();

        monthlyData.forEach((monthData) => {
          monthData.employees.forEach((emp) => {
            if (employeeMap.has(emp.nik)) {
              // Employee already exists, aggregate the data
              const existingEmp = employeeMap.get(emp.nik)!;
              employeeMap.set(emp.nik, {
                ...existingEmp,
                // Sum up all the numeric fields
                jam_lembur_biasa:
                  (existingEmp.jam_lembur_biasa || 0) +
                  (emp.jam_lembur_biasa || 0),
                jam_lembur_libur:
                  (existingEmp.jam_lembur_libur || 0) +
                  (emp.jam_lembur_libur || 0),
                jumlah_hari_cuti_tahunan:
                  (existingEmp.jumlah_hari_cuti_tahunan || 0) +
                  (emp.jumlah_hari_cuti_tahunan || 0),
                jumlah_hari_cuti_khusus:
                  (existingEmp.jumlah_hari_cuti_khusus || 0) +
                  (emp.jumlah_hari_cuti_khusus || 0),
                jumlah_hari_izin:
                  (existingEmp.jumlah_hari_izin || 0) +
                  (emp.jumlah_hari_izin || 0),
                jumlah_hari_sakit:
                  (existingEmp.jumlah_hari_sakit || 0) +
                  (emp.jumlah_hari_sakit || 0),
                jumlah_hari_mangkir:
                  (existingEmp.jumlah_hari_mangkir || 0) +
                  (emp.jumlah_hari_mangkir || 0),
                jumlah_hari_terlambat:
                  (existingEmp.jumlah_hari_terlambat || 0) +
                  (emp.jumlah_hari_terlambat || 0),
                // Combine absensi arrays if they exist
                absensi: [
                  ...(existingEmp.absensi || []),
                  ...(emp.absensi || []),
                ],
              });
            } else {
              // First time seeing this employee, add them to the map
              employeeMap.set(emp.nik, { ...emp });
            }
          });
        });

        // Convert map back to array
        data = Array.from(employeeMap.values());
      }
    } else {
      // Non-monthly view: use regular absen data
      data = absen;
    }

    // Apply department bar click (only for non-monthly view)
    if (!isMonthlyView && selectedBar) {
      data = data.filter((emp) => emp.department === selectedBar.department);
    }

    // Apply search query filter
    if (searchQuery) {
      data = data.filter(
        (emp) =>
          emp.nama_karyawan?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Apply divisi filter
    if (selectedDivisi) {
      data = data.filter((emp) => emp.divisi === selectedDivisi);
    }

    // Apply department filter (from dropdown)
    if (idDepartment) {
      const selectedDepartment = department.find((d) => d.id === idDepartment);
      if (selectedDepartment) {
        data = data.filter(
          (emp) => emp.department === selectedDepartment.nama_department,
        );
      }
    }

    // Note: Removed the duplicate removal by NIK since we're already handling
    // aggregation in the monthly view logic above

    return data;
  }, [
    absen,
    monthlyData,
    selectedBar,
    selectedMonthBar,
    selectedDetail,
    isMonthlyView,
    searchQuery,
    selectedDivisi,
    idDepartment,
    department,
  ]);
  // Calculate summary statistics based on display data
  const summaryStats = {
    totalKaryawan: displayData.length,
    totalJamLembur: displayData.reduce((sum: any, emp: any) => {
      // For monthly data, use the direct fields (handle null values)
      if (isMonthlyView) {
        const lemburBiasa = emp.jam_lembur_biasa || 0;
        const lemburLibur = emp.jam_lembur_libur || 0;
        return sum + lemburBiasa + lemburLibur;
      } else {
        // For regular data, calculate from absensi records
        const empLembur =
          emp.absensi?.reduce((empSum: any, record: any) => {
            return empSum + (parseFloat(record.jam_lembur) || 0);
          }, 0) || 0;
        return sum + empLembur;
      }
    }, 0),
    totalCutiTahunan: displayData.reduce(
      (sum, emp) => sum + (emp.jumlah_hari_cuti_tahunan || 0),
      0,
    ),
    totalCutiKhusus: displayData.reduce(
      (sum, emp) => sum + (emp.jumlah_hari_cuti_khusus || 0),
      0,
    ),
    totalIzin: displayData.reduce(
      (sum, emp) => sum + (emp.jumlah_hari_izin || 0),
      0,
    ),
    totalSakit: displayData.reduce(
      (sum, emp) => sum + (emp.jumlah_hari_sakit || 0),
      0,
    ),
    totalMangkir: displayData.reduce(
      (sum, emp) => sum + (emp.jumlah_hari_mangkir || 0),
      0,
    ),
    totalTerlambat: displayData.reduce(
      (sum, emp) => sum + (emp.jumlah_hari_terlambat || 0),
      0,
    ),
    totalHariMasuk: displayData.reduce(
      (sum, emp) => sum + (emp.absensi?.length || 0),
      0,
    ),
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Loading Indicator */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-center mt-2">Loading...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Rekap Absensi Dashboard
        </h1>
        <p className="text-gray-600">
          {isMonthlyView
            ? 'Analisis kehadiran karyawan per bulan'
            : 'Analisis kehadiran karyawan berdasarkan department'}
          {searchQuery && !isMonthlyView && (
            <span className="ml-2 text-blue-600 font-medium">
              (Filtered by: "{searchQuery}")
            </span>
          )}
          {isMonthlyView && (
            <span className="ml-2 text-green-600 font-medium">
              (Monthly View - {getMonthsDifference(dateFrom, dateTo)} months)
            </span>
          )}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Filter Data
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Mulai <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Selesai <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
              {dateFrom &&
                dateTo &&
                getMonthsDifference(dateFrom, dateTo) > 1 && (
                  <span className="text-orange-500 text-xs ml-1">
                    (Required for monthly view)
                  </span>
                )}
            </label>
            <select
              value={idDepartment}
              onChange={(e) => setIdDepartment(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Semua Department</option>
              {department?.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.nama_department}
                </option>
              ))}
            </select>
          </div>
          {/* Divisi Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Divisi
            </label>
            <select
              value={selectedDivisi}
              onChange={(e) => setSelectedDivisi(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Semua Divisi</option>
              {uniqueDivisiOptions.map((div) => (
                <option key={div} value={div}>
                  {div}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cari Karyawan
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nama"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col justify-end space-y-2">
            <button
              onClick={handleFilter}
              disabled={isLoading || !dateFrom || !dateTo}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              {isLoading ? 'Loading...' : 'Filter Data'}
            </button>
            <button
              onClick={resetFilters}
              disabled={isLoading}
              className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Reset
            </button>
            {(selectedBar || selectedMonthBar) && (
              <button
                onClick={resetDepartmentFilter}
                className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-lg transition-colors"
              >
                {isMonthlyView ? 'Show All Months' : 'Show All Departments'}
              </button>
            )}
          </div>
        </div>

        {/* Info about monthly view */}
        {dateFrom && dateTo && getMonthsDifference(dateFrom, dateTo) > 1 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Multi-month range detected:</span>
              {idDepartment
                ? ' Using monthly API to show data grouped by month'
                : ' Select a department to view monthly breakdown, or use regular view for all departments'}
            </p>
          </div>
        )}
      </div>

      {/* Enhanced Summary Cards */}
      {/* Additional Info Panel for Monthly View */}
      {isMonthlyView && monthlyChartData.length > 0 ? (
        <MonthlyCharts
          data={monthlyChartData}
          isVisible={true}
          onSelectMonth={(monthYear) => {
            // Handle month selection (for clicking the month name)
            setSelectedMonthBar({ monthYear });
            setSelectedDetail(null); // Clear detail selection
          }}
          onSelectDetail={(monthYear, field) => {
            // Handle detail selection (for clicking specific numbers)
            setSelectedDetail({ monthYear, field });
            setSelectedMonthBar(null); // Clear month bar selection
          }}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-500">
              <h3 className="text-sm font-medium text-gray-600">
                Total Jam Lembur
              </h3>
              <p className="text-2xl font-bold text-purple-600">
                {summaryStats.totalJamLembur.toFixed(1)}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-indigo-500">
              <h3 className="text-sm font-medium text-gray-600">
                Total Hari Cuti Tahunan
              </h3>
              <p className="text-2xl font-bold text-indigo-600">
                {summaryStats.totalCutiTahunan}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-pink-500">
              <h3 className="text-sm font-medium text-gray-600">
                Total Hari Cuti Khusus
              </h3>
              <p className="text-2xl font-bold text-pink-600">
                {summaryStats.totalCutiKhusus}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-yellow-500">
              <h3 className="text-sm font-medium text-gray-600">
                Total Hari Izin
              </h3>
              <p className="text-2xl font-bold text-yellow-600">
                {summaryStats.totalIzin}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-500">
              <h3 className="text-sm font-medium text-gray-600">
                Total Hari Sakit
              </h3>
              <p className="text-2xl font-bold text-red-600">
                {summaryStats.totalSakit}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-gray-500">
              <h3 className="text-sm font-medium text-gray-600">
                Total Hari Mangkir
              </h3>
              <p className="text-2xl font-bold text-gray-600">
                {summaryStats.totalMangkir}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-orange-500">
              <h3 className="text-sm font-medium text-gray-600">
                Total Hari Terlambat
              </h3>
              <p className="text-2xl font-bold text-orange-600">
                {summaryStats.totalTerlambat}
              </p>
            </div>
          </div>
        </>
      )}

      {/* Chart Section */}
      {(chartData.length > 0 || monthlyChartData.length > 0) && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {isMonthlyView ? '' : 'Rekap Absensi per Department'}
              {searchQuery && !isMonthlyView && (
                <span className="text-sm font-normal text-blue-600 ml-2">
                  (Filtered by search)
                </span>
              )}
            </h3>
            {(selectedBar || selectedMonthBar) && (
              <div className="text-sm text-gray-600">
                Menampilkan detail untuk:{' '}
                <span className="font-semibold">
                  {isMonthlyView
                    ? selectedMonthBar?.monthYear
                    : selectedBar?.department}
                </span>
              </div>
            )}
          </div>

          {!isMonthlyView && (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="totalCutiTahunan"
                  fill="#10B981"
                  name="Cuti Tahunan"
                  cursor="pointer"
                  onClick={handleBarClick}
                />
                <Bar
                  dataKey="totalCutiKhusus"
                  fill="#8B5CF6"
                  name="Cuti Khusus"
                  cursor="pointer"
                  onClick={handleBarClick}
                />
                <Bar
                  dataKey="totalIzin"
                  fill="#F59E0B"
                  name="Izin"
                  cursor="pointer"
                  onClick={handleBarClick}
                />
                <Bar
                  dataKey="totalSakit"
                  fill="#EF4444"
                  name="Sakit"
                  cursor="pointer"
                  onClick={handleBarClick}
                />
                <Bar
                  dataKey="totalTerlambat"
                  fill="#F97316"
                  name="Terlambat"
                  cursor="pointer"
                  onClick={handleBarClick}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      {/* Detail Table */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800">
            Detail Karyawan
            {(() => {
              // Function to get field label in Indonesian
              type MonthlyChartDataField =
                | 'totalEmployees'
                | 'totalCutiTahunan'
                | 'totalCutiKhusus'
                | 'totalIzin'
                | 'totalSakit'
                | 'totalMangkir'
                | 'totalTerlambat'
                | 'totalJamLembur';

              const getFieldLabel = (field: MonthlyChartDataField) => {
                const fieldLabels: Record<MonthlyChartDataField, string> = {
                  totalEmployees: 'Semua Karyawan',

                  totalCutiTahunan: 'Cuti Tahunan',
                  totalCutiKhusus: 'Cuti Khusus',
                  totalIzin: 'Izin',
                  totalSakit: 'Sakit',
                  totalMangkir: 'Mangkir',
                  totalTerlambat: 'Terlambat',
                  totalJamLembur: 'Jam Lembur',
                };
                return fieldLabels[field] || field;
              };

              if (isMonthlyView && selectedDetail) {
                return ` - ${getFieldLabel(
                  selectedDetail.field as MonthlyChartDataField,
                )} (${selectedDetail.monthYear})`;
              } else if (isMonthlyView && selectedMonthBar) {
                return ` - ${selectedMonthBar.monthYear}`;
              } else if (selectedBar) {
                return ` - ${selectedBar.department}`;
              }
              return '';
            })()}
          </h3>
          <p className="text-sm text-gray-600">
            Menampilkan {displayData.length} karyawan
            {(() => {
              // Function to get description based on selection
              type MonthlyChartDataField =
                | 'totalEmployees'
                | 'totalCutiTahunan'
                | 'totalCutiKhusus'
                | 'totalIzin'
                | 'totalSakit'
                | 'totalMangkir'
                | 'totalTerlambat'
                | 'totalJamLembur';

              const getFieldDescription = (field: MonthlyChartDataField) => {
                const descriptions: Record<MonthlyChartDataField, string> = {
                  totalEmployees: 'semua karyawan',

                  totalCutiTahunan: 'yang mengambil cuti tahunan',
                  totalCutiKhusus: 'yang mengambil cuti khusus',
                  totalIzin: 'yang mengambil izin',
                  totalSakit: 'yang sakit',
                  totalMangkir: 'yang mangkir',
                  totalTerlambat: 'yang terlambat',
                  totalJamLembur: 'yang lembur',
                };
                return descriptions[field] || '';
              };

              if (searchQuery && !isMonthlyView) {
                return (
                  <span className="ml-1 text-blue-600">
                    (filtered by "{searchQuery}")
                  </span>
                );
              }

              if (isMonthlyView && selectedDetail) {
                return (
                  <span className="ml-1 text-green-600">
                    (
                    {(() => {
                      // Only call getFieldDescription if the field is a valid MonthlyChartDataField
                      const validFields: MonthlyChartDataField[] = [
                        'totalEmployees',

                        'totalCutiTahunan',
                        'totalCutiKhusus',
                        'totalIzin',
                        'totalSakit',
                        'totalMangkir',
                        'totalTerlambat',
                        'totalJamLembur',
                      ];
                      return validFields.includes(
                        selectedDetail.field as MonthlyChartDataField,
                      )
                        ? getFieldDescription(
                            selectedDetail.field as MonthlyChartDataField,
                          )
                        : '';
                    })()}{' '}
                    di {selectedDetail.monthYear})
                  </span>
                );
              }

              if (isMonthlyView) {
                return (
                  <span className="ml-1 text-green-600">
                    {selectedMonthBar
                      ? `(dari ${selectedMonthBar.monthYear})`
                      : '(dari semua bulan)'}
                  </span>
                );
              }

              return null;
            })()}
          </p>
        </div>

        {/* Add additional info if detail is selected */}
        {isMonthlyView && selectedDetail && (
          <div className="px-6 py-2 bg-blue-50 border-b">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">
                📊 Detail:{' '}
                {(() => {
                  const fieldLabels: Record<
                    Exclude<keyof MonthlyChartData, 'monthYear'>,
                    string
                  > = {
                    totalEmployees: 'Semua Karyawan',

                    totalCutiTahunan: 'Karyawan yang Cuti Tahunan',
                    totalCutiKhusus: 'Karyawan yang Cuti Khusus',
                    totalIzin: 'Karyawan yang Izin',
                    totalSakit: 'Karyawan yang Sakit',
                    totalMangkir: 'Karyawan yang Mangkir',
                    totalTerlambat: 'Karyawan yang Terlambat',
                    totalJamLembur: 'Karyawan yang Lembur',
                  };
                  return (
                    fieldLabels[
                      selectedDetail.field as Exclude<
                        keyof MonthlyChartData,
                        'monthYear'
                      >
                    ] || selectedDetail.field
                  );
                })()}
              </span>
              <button
                onClick={() => setSelectedDetail(null)}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Lihat Semua Karyawan
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NIK
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Karyawan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Divisi
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jam Lembur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Detail Lembur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cuti
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Izin/Sakit/Mangkir
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Keterlambatan
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayData.map((employee: any, index: any) => {
                const totalLembur = isMonthlyView
                  ? (employee.jam_lembur_biasa || 0) +
                    (employee.jam_lembur_libur || 0)
                  : employee.absensi?.reduce((sum: any, record: any) => {
                      return sum + (parseFloat(record.jam_lembur) || 0);
                    }, 0) || 0;

                const overtimeData = calculateOvertimeHours(employee.absensi);

                // For monthly view, find which month this employee belongs to
                let employeeMonth = '';
                if (isMonthlyView && monthlyData.length > 0) {
                  const monthData = monthlyData.find((m) =>
                    m.employees.some((emp) => emp.nik === employee.nik),
                  );
                  employeeMonth = monthData
                    ? `${monthData.month} ${monthData.year}`
                    : '';
                }

                return (
                  <tr
                    key={`${employee.nik}-${employeeMonth || index}`}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.nik}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {employee.nama_karyawan}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.divisi}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                        {totalLembur.toFixed(1)} jam
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex flex-wrap gap-1">
                        {isMonthlyView ? (
                          <>
                            {(employee.jam_lembur_biasa || 0) > 0 && (
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                Biasa: {employee.jam_lembur_biasa || 0} jam
                              </span>
                            )}
                            {(employee.jam_lembur_libur || 0) > 0 && (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                                Libur: {employee.jam_lembur_libur || 0} jam
                              </span>
                            )}
                          </>
                        ) : (
                          <>
                            {parseFloat(overtimeData.lemburBiasa) > 0 && (
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                Biasa: {overtimeData.lemburBiasa} jam
                              </span>
                            )}
                            {parseFloat(overtimeData.lemburLibur) > 0 && (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                                Libur: {overtimeData.lemburLibur} jam
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex flex-wrap gap-1">
                        {(employee.jumlah_hari_cuti_tahunan || 0) > 0 && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                            Tahunan: {employee.jumlah_hari_cuti_tahunan} hari
                          </span>
                        )}
                        {(employee.jumlah_hari_cuti_khusus || 0) > 0 && (
                          <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs">
                            Khusus: {employee.jumlah_hari_cuti_khusus} hari
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex flex-wrap gap-1">
                        {(employee.jumlah_hari_izin || 0) > 0 && (
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                            Izin: {employee.jumlah_hari_izin} hari
                          </span>
                        )}
                        {(employee.jumlah_hari_sakit || 0) > 0 && (
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                            Sakit: {employee.jumlah_hari_sakit} hari
                          </span>
                        )}
                        {(employee.jumlah_hari_mangkir || 0) > 0 && (
                          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                            Mangkir: {employee.jumlah_hari_mangkir} hari
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex flex-col space-y-1">
                        {(employee.jumlah_hari_terlambat || 0) > 0 && (
                          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                            Terlambat: {employee.jumlah_hari_terlambat} hari
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {displayData.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {absen.length === 0 && monthlyData.length === 0
                ? 'Silakan pilih tanggal dan klik "Filter Data" untuk menampilkan data absensi'
                : 'Tidak ada data yang ditemukan'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AttendanceRecapChart;
