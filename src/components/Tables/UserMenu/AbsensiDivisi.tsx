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
} from 'recharts';
import MonthlyCharts from '../HR/Rekap/MonthlyCharts';

// Configure axios defaults
axios.defaults.withCredentials = true;

interface Employee {
  department: string;
  nama_karyawan: string;
  nik: string;
  divisi: string;
  absensi?: any[];
  jumlah_hari_cuti_tahunan?: number;
  jumlah_hari_cuti_khusus?: number;
  jumlah_hari_izin?: number;
  jumlah_hari_sakit?: number;
  jumlah_hari_mangkir?: number;
  jumlah_hari_terlambat?: number;
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

type MonthlyChartDataField =
  | 'totalEmployees'
  | 'totalCutiTahunan'
  | 'totalCutiKhusus'
  | 'totalIzin'
  | 'totalSakit'
  | 'totalMangkir'
  | 'totalTerlambat'
  | 'totalJamLembur';

function AbsensiDivisi() {
  const [isLoading, setIsLoading] = useState(false);

  // ─── Access Control (divisi_bawahan) ───────────────────────────────────────
  const [userRole, setUserRole] = useState<string>('');
  const [idDepart, setIdDepart] = useState<any>(null);
  const [divisiBawahan, setDivisiBawahan] = useState<any>(null);
  const [hasNoDivisiBawahan, setHasNoDivisiBawahan] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  const [absen, setAbsen] = useState<Employee[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyDataItem[]>([]);
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [monthlyChartData, setMonthlyChartData] = useState<MonthlyChartData[]>(
    [],
  );
  const [filteredData, setFilteredData] = useState<Employee[]>([]);
  const [selectedBar, setSelectedBar] = useState<ChartDataItem | null>(null);

  const [isMonthlyView, setIsMonthlyView] = useState(false);

  const [selectedDetail, setSelectedDetail] = useState<{
    monthYear: string;
    field: keyof MonthlyChartData;
  } | null>(null);

  const [selectedMonthBar, setSelectedMonthBar] = useState<{
    monthYear: string;
  } | null>(null);

  // Filter states (date range + name search only — scoping is by login user's divisi_bawahan)
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // ─── Resolve current user / divisi_bawahan on mount ────────────────────────
  useEffect(() => {
    getMe();
  }, []);

  async function getMe() {
    const url = `${import.meta.env.VITE_API_LINK}/me`;
    try {
      setIsCheckingAccess(true);
      const res = await axios.get(url, { withCredentials: true });

      const role = res.data.role;
      const userIdDep = res.data.karyawan?.biodata_karyawan?.[0]?.id_department;
      const userDivisiBawahan = res.data.divisi_bawahan;

      setUserRole(role);

      const isSuperAdminOrDev = role === 'super admin' || role === 'developer';

      if (isSuperAdminOrDev) {
        // Super admin / developer: see all divisions, no filter required
        setHasNoDivisiBawahan(false);
        setIdDepart(null);
        setDivisiBawahan(null);
        setIsCheckingAccess(false);
        return;
      }

      // All other roles: require divisi_bawahan
      if (!userDivisiBawahan || userDivisiBawahan === '') {
        setHasNoDivisiBawahan(true);
        setIsCheckingAccess(false);
        return;
      }

      setIdDepart(userIdDep);
      setDivisiBawahan(userDivisiBawahan);
      setHasNoDivisiBawahan(false);
      setIsCheckingAccess(false);

      console.log('me', res.data);
    } catch (error) {
      setIsCheckingAccess(false);
      console.log(error);
    }
  }

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
      const dataForChart = searchQuery
        ? absen.filter(
            (emp) =>
              emp.nama_karyawan
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()),
          )
        : absen;
      generateChartData(dataForChart);
      setFilteredData(dataForChart);
      setSelectedBar(null);
    }
  }, [searchQuery, absen, monthlyData, isMonthlyView]);

  const resetDepartmentFilter = () => {
    setSelectedBar(null);
    setSelectedMonthBar(null);
  };

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

  // ─── Fetch recap data, scoped only by login user's divisi_bawahan ─────────
  async function getAbsen(dateFrom1: any, dateTo1: any) {
    const monthsDiff = getMonthsDifference(dateFrom1, dateTo1);
    const useMonthlyAPI = monthsDiff > 1;

    const url = useMonthlyAPI
      ? `${import.meta.env.VITE_API_LINK}/hr/absensiRekapPeriode`
      : `${import.meta.env.VITE_API_LINK}/hr/absensiRekap`;

    const params: any = {
      startDate: dateFrom1,
      endDate: dateTo1,
      ...(idDepart !== null &&
        idDepart !== undefined && { idDepartment: idDepart }),
    };

    // Scope the recap to the logged-in user's divisi_bawahan
    // (super admin/developer have divisiBawahan = null -> sees all data)
    if (
      divisiBawahan !== null &&
      divisiBawahan !== undefined &&
      divisiBawahan !== ''
    ) {
      params.divisi_bawahan = divisiBawahan;
    }

    try {
      setIsLoading(true);
      const response = await axios.get(url, {
        params,
        withCredentials: true,
      });
      setIsLoading(false);

      if (useMonthlyAPI) {
        const transformedData = response.data.data.map((monthItem: any) => ({
          month: monthItem.bulan.split(' ')[0],
          year: parseInt(monthItem.bulan.split(' ')[1]),
          monthYear: monthItem.bulan,
          startPeriode: monthItem.startPeriode,
          endPeriode: monthItem.endPeriode,
          employees: monthItem.rekapAbsen || [],
        }));

        setMonthlyData(transformedData);
        setAbsen([]);
        setIsMonthlyView(true);
      } else {
        setAbsen(response.data.data);
        setMonthlyData([]);
        setIsMonthlyView(false);
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
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

      const lemburBiasa = employee.jam_lembur_biasa || 0;
      const lemburLibur = employee.jam_lembur_libur || 0;

      chartDataMap[dept].lemburBiasa += lemburBiasa;
      chartDataMap[dept].lemburLibur += lemburLibur;
      chartDataMap[dept].totalJamLembur += lemburBiasa + lemburLibur;
    });

    setChartData(Object.values(chartDataMap));
  };

  const generateMonthlyChartData = (data: MonthlyDataItem[]) => {
    const monthlyChartData: MonthlyChartData[] = data.map((monthData) => {
      const employees = monthData.employees;

      return {
        monthYear: monthData.monthYear,
        totalEmployees: employees.length,
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

    if (isMonthlyView && monthlyData.length > 0) {
      if (selectedDetail) {
        const monthData = monthlyData.find(
          (m) => m.monthYear === selectedDetail.monthYear,
        );
        if (monthData) {
          data = monthData.employees.filter((emp) => {
            const { field } = selectedDetail;

            switch (field) {
              case 'totalEmployees':
                return true;
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
        const monthData = monthlyData.find(
          (m) => m.monthYear === selectedMonthBar.monthYear,
        );
        data = monthData ? monthData.employees : [];
      } else {
        const employeeMap = new Map<string, Employee>();

        monthlyData.forEach((monthData) => {
          monthData.employees.forEach((emp) => {
            if (employeeMap.has(emp.nik)) {
              const existingEmp = employeeMap.get(emp.nik)!;
              employeeMap.set(emp.nik, {
                ...existingEmp,
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
                absensi: [
                  ...(existingEmp.absensi || []),
                  ...(emp.absensi || []),
                ],
              });
            } else {
              employeeMap.set(emp.nik, { ...emp });
            }
          });
        });

        data = Array.from(employeeMap.values());
      }
    } else {
      data = absen;
    }

    if (!isMonthlyView && selectedBar) {
      data = data.filter((emp) => emp.department === selectedBar.department);
    }

    if (searchQuery) {
      data = data.filter(
        (emp) =>
          emp.nama_karyawan?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    return data;
  }, [
    absen,
    monthlyData,
    selectedBar,
    selectedMonthBar,
    selectedDetail,
    isMonthlyView,
    searchQuery,
  ]);

  const summaryStats = {
    totalKaryawan: displayData.length,
    totalJamLembur: displayData.reduce((sum: any, emp: any) => {
      const lemburBiasa = emp.jam_lembur_biasa || 0;
      const lemburLibur = emp.jam_lembur_libur || 0;
      return sum + lemburBiasa + lemburLibur;
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

  // ─── Checking Access State ──────────────────────────────────────────────────
  if (isCheckingAccess) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-center mt-2">Memeriksa akses...</p>
        </div>
      </div>
    );
  }

  // ─── No Divisi Bawahan State ────────────────────────────────────────────────
  if (hasNoDivisiBawahan) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
            <h2 className="text-white text-lg md:text-xl font-bold flex items-center">
              <svg
                className="w-6 h-6 mr-2 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Rekap Absensi Divisi
            </h2>
          </div>
          <div className="p-6 md:p-8">
            <div className="flex flex-col items-center justify-center py-8 md:py-12">
              <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6 md:p-8 max-w-md w-full mx-4 text-center">
                <div className="flex items-center justify-center mb-4">
                  <svg
                    className="w-12 h-12 md:w-16 md:h-16 text-yellow-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2">
                  Akses Terbatas
                </h3>
                <p className="text-sm md:text-base text-gray-600 mb-2">
                  Divisi Bawahan belum di-set
                </p>
                <p className="text-xs md:text-sm text-gray-500 mt-4">
                  Silakan hubungi administrator untuk mengatur divisi bawahan
                  pada akun Anda agar dapat mengakses halaman ini.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          Rekap Absensi Divisi
        </h1>
        <p className="text-gray-600">
          {isMonthlyView
            ? 'Analisis kehadiran karyawan per bulan'
            : 'Analisis kehadiran karyawan berdasarkan department'}
          {divisiBawahan && (
            <span className="ml-2 text-indigo-600 font-medium">
              (Divisi: {divisiBawahan})
            </span>
          )}
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

      {/* Filters: date range + name search only */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Filter Data
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <span className="font-medium">Multi-month range detected:</span>{' '}
              Data akan ditampilkan dalam tampilan bulanan.
            </p>
          </div>
        )}
      </div>

      {/* Enhanced Summary Cards / Monthly Charts */}
      {isMonthlyView && monthlyChartData.length > 0 ? (
        <MonthlyCharts
          data={monthlyChartData}
          isVisible={true}
          onSelectMonth={(monthYear) => {
            setSelectedMonthBar({ monthYear });
            setSelectedDetail(null);
          }}
          onSelectDetail={(monthYear, field) => {
            setSelectedDetail({ monthYear, field });
            setSelectedMonthBar(null);
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
              if (searchQuery && !isMonthlyView) {
                return (
                  <span className="ml-1 text-blue-600">
                    (filtered by "{searchQuery}")
                  </span>
                );
              }

              if (isMonthlyView && selectedDetail) {
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
                return (
                  <span className="ml-1 text-green-600">
                    (
                    {validFields.includes(
                      selectedDetail.field as MonthlyChartDataField,
                    )
                      ? getFieldDescription(
                          selectedDetail.field as MonthlyChartDataField,
                        )
                      : ''}{' '}
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

        {/* Detail selection info bar */}
        {isMonthlyView && selectedDetail && (
          <div className="px-6 py-2 bg-blue-50 border-b">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">
                📊 Detail:{' '}
                {getFieldLabel(selectedDetail.field as MonthlyChartDataField)}
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
                const totalLembur =
                  (employee.jam_lembur_biasa || 0) +
                  (employee.jam_lembur_libur || 0);

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

export default AbsensiDivisi;
