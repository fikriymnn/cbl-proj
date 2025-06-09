import React, { useEffect, useState } from 'react';
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

// Configure axios defaults
axios.defaults.withCredentials = true;

function AttendanceRecapChart() {
  const [isLoading, setIsLoading] = useState(false);
  const [absen, setAbsen] = useState<Employee[]>([]);
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [filteredData, setFilteredData] = useState<Employee[]>([]);
  const [selectedBar, setSelectedBar] = useState<ChartDataItem | null>(null);
  interface Department {
    id: string;
    nama_department: string;
  }
  const [department, setDepartment] = useState<Department[]>([]);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [idDepartment, setIdDepartment] = useState('');

  // Get filtered data based on search query
  const filteredAbsen = absen?.filter((data: any) =>
    data.nama_karyawan.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  useEffect(() => {
    getDepartment();
  }, []);

  useEffect(() => {
    if (absen && absen.length > 0) {
      generateChartData(absen);
      setFilteredData(absen);
    }
  }, [absen]);

  async function getDepartment() {
    const url = `${import.meta.env.VITE_API_LINK}/master/hr/department`;
    try {
      setIsLoading(true);
      const response = await axios.get(url, {
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
    const url = `${import.meta.env.VITE_API_LINK}/hr/absensiRekap`;
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
      setAbsen(response.data.data);
      console.log(response.data.data);
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

      // Calculate overtime hours using the new method
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
    });

    setChartData(Object.values(chartDataMap));
  };

  const handleBarClick = (data: any) => {
    setSelectedBar(data);
    // Filter employees by department
    const deptEmployees = absen.filter(
      (emp) => emp.department === data.department,
    );
    setFilteredData(deptEmployees);
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
    setAbsen([]);
    setFilteredData([]);
    setChartData([]);
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
          <p className="font-semibold text-gray-800">{`Department: ${label}`}</p>
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

  // Use filtered data based on search query
  const displayData = searchQuery ? filteredAbsen : filteredData;

  // Calculate summary statistics
  const summaryStats = {
    totalKaryawan: displayData.length,
    totalJamLembur: displayData.reduce((sum: any, emp: any) => {
      const empLembur =
        emp.absensi?.reduce((empSum: any, record: any) => {
          return empSum + (parseFloat(record.jam_lembur) || 0);
        }, 0) || 0;
      return sum + empLembur;
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
          Analisis kehadiran karyawan berdasarkan department
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

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cari Karyawan
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nama atau NIK..."
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
          </div>
        </div>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
          <h3 className="text-sm font-medium text-gray-600">
            Total Hari Masuk
          </h3>
          <p className="text-2xl font-bold text-green-600">
            {summaryStats.totalHariMasuk}
          </p>
        </div>

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
          <h3 className="text-sm font-medium text-gray-600">Total Hari Izin</h3>
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

      {/* Bar Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Rekap Absensi per Department
            </h3>
            {selectedBar && (
              <div className="text-sm text-gray-600">
                Menampilkan detail untuk:{' '}
                <span className="font-semibold">{selectedBar.department}</span>
              </div>
            )}
          </div>

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
        </div>
      )}

      {/* Detail Table */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800">
            Detail Karyawan {selectedBar ? `- ${selectedBar.department}` : ''}
          </h3>
          <p className="text-sm text-gray-600">
            Menampilkan {displayData.length} karyawan
          </p>
        </div>

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
                  Hari Masuk
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
                  employee.absensi?.reduce((sum: any, record: any) => {
                    return sum + (parseFloat(record.jam_lembur) || 0);
                  }, 0) || 0;

                const overtimeData = calculateOvertimeHours(employee.absensi);
                const timeMetrics = calculateTimeMetrics(employee.absensi);

                return (
                  <tr key={employee.nik} className="hover:bg-gray-50">
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
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                        {employee.absensi?.length || 0} hari
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                        {totalLembur.toFixed(1)} jam
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex flex-wrap gap-1">
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
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex flex-wrap gap-1">
                        {employee.jumlah_hari_cuti_tahunan > 0 && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                            Tahunan: {employee.jumlah_hari_cuti_tahunan} hari
                          </span>
                        )}
                        {employee.jumlah_hari_cuti_khusus > 0 && (
                          <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs">
                            Khusus: {employee.jumlah_hari_cuti_khusus} hari
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex space-x-1">
                        {employee.jumlah_hari_izin > 0 && (
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                            Izin: {employee.jumlah_hari_izin} hari
                          </span>
                        )}
                        {employee.jumlah_hari_sakit > 0 && (
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                            Sakit: {employee.jumlah_hari_sakit} hari
                          </span>
                        )}
                        {employee.jumlah_hari_mangkir > 0 && (
                          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                            Mangkir: {employee.jumlah_hari_mangkir} hari
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex flex-col space-y-1">
                        {timeMetrics.jumlahHariTerlambat > 0 && (
                          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                            {timeMetrics.jumlahHariTerlambat} hari
                          </span>
                        )}
                        {timeMetrics.totalTerlambat > 0 && (
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                            {timeMetrics.totalTerlambat} jam
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
              {absen.length === 0
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
