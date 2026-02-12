import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import Loading from '../../Loading';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

function PersonalAbsensi() {
  const [isLoading, setIsLoading] = useState(false);
  const [me, setMe] = useState<any>(null);
  const [rekapData, setRekapData] = useState<any>(null);
  const [dateFrom, setDateFrom] = useState<any>(null);
  const [dateTo, setDateTo] = useState<any>(null);

  // Get today's date
  const today = new Date();

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    getMe();
  }, []);

  useEffect(() => {
    if (me) {
      // Set default to today only
      const todayFormatted = formatDate(today);
      setDateFrom(todayFormatted);
      setDateTo(todayFormatted);
      // Only fetch rekap for today
      getRekapAbsen(todayFormatted, todayFormatted);
    }
  }, [me]);

  async function getMe() {
    const url = `${import.meta.env.VITE_API_LINK}/me`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });
      setMe(res.data);
      console.log('getme', res.data);
    } catch (error: any) {
      console.log(error.data?.msg);
    }
  }

  async function getRekapAbsen(dateFrom1: any, dateTo1: any) {
    const url = `${import.meta.env.VITE_API_LINK}/hr/absensiRekap`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        params: {
          startDate: dateFrom1,
          endDate: dateTo1,
          id_karyawan: me?.id_karyawan,
          is_active: true,
          page: 1,
          limit: 1,
        },
        withCredentials: true,
      });
      setIsLoading(false);
      if (res.data.data && res.data.data.length > 0) {
        setRekapData(res.data.data[0]);
        console.log('Rekap data:', res.data.data[0]);
      } else {
        setRekapData(null);
      }
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }

  const calculateOvertimeHours = (absensiData: any[]) => {
    let lemburDenganSPL = 0;
    let lemburTanpaSPL = 0;
    let lemburLiburDenganSPL = 0;
    let lemburLiburTanpaSPL = 0;

    absensiData?.forEach((record: any) => {
      const jamLembur = parseFloat(record.jam_lembur || 0);

      if (
        record.status_lembur === 'Lembur' ||
        record.status_lembur === 'lembur'
      ) {
        if (record.status_lembur_spl === 'dengan SPL') {
          lemburDenganSPL += jamLembur;
        } else {
          lemburTanpaSPL += 1;
        }
      } else if (record.status_lembur === 'Lembur Libur') {
        if (record.status_lembur_spl === 'dengan SPL') {
          lemburLiburDenganSPL += jamLembur;
        } else {
          lemburLiburTanpaSPL += 1;
        }
      }
    });

    return {
      lemburDenganSPL: lemburDenganSPL.toFixed(1),
      lemburTanpaSPL: lemburTanpaSPL.toFixed(0),
      lemburLiburDenganSPL: lemburLiburDenganSPL.toFixed(1),
      lemburLiburTanpaSPL: lemburLiburTanpaSPL.toFixed(0),
    };
  };

  const calculateTimeMetrics = (absensiData: any[]) => {
    let totalTerlambat = 0;
    let totalPulangCepat = 0;
    let totalIstirahatLembur = 0;
    let jumlahHariTerlambat = 0;
    let terlambatKurangDari30Menit = 0;
    let terlambatLebihDari30Menit = 0;

    absensiData?.forEach((record: any) => {
      const menitTerlambat = parseFloat(record.menit_terlambat || 0);
      const menitPulangCepat = parseFloat(record.menit_pulang_cepat || 0);
      const jamIstirahatLembur = parseFloat(record.jam_istirahat_lembur || 0);

      totalTerlambat += menitTerlambat;
      totalPulangCepat += menitPulangCepat;
      totalIstirahatLembur += jamIstirahatLembur;

      if (menitTerlambat > 0) {
        jumlahHariTerlambat++;

        if (menitTerlambat <= 0.5) {
          terlambatKurangDari30Menit++;
        } else {
          terlambatLebihDari30Menit++;
        }
      }
    });

    const totalJamTerlambat = totalTerlambat.toFixed(1);
    const totalJamPulangCepat = totalPulangCepat.toFixed(1);

    return {
      totalTerlambat: totalJamTerlambat,
      totalPulangCepat: totalJamPulangCepat,
      totalIstirahatLembur: totalIstirahatLembur.toFixed(1),
      jumlahHariTerlambat,
      terlambatKurangDari30Menit,
      terlambatLebihDari30Menit,
    };
  };

  const overtimeCalc = rekapData
    ? calculateOvertimeHours(rekapData.absensi)
    : null;
  const timeMetrics = rekapData
    ? calculateTimeMetrics(rekapData.absensi)
    : null;

  // Chart Data
  const attendanceChartData = {
    labels: [
      'Hadir',
      'Cuti Tahunan',
      'Cuti Khusus',
      'Izin',
      'Sakit',
      'Mangkir',
    ],
    datasets: [
      {
        label: 'Hari',
        data: [
          rekapData?.jumlah_hari_hadir || 0,
          rekapData?.jumlah_hari_cuti_tahunan || 0,
          rekapData?.jumlah_hari_cuti_khusus || 0,
          rekapData?.jumlah_hari_izin || 0,
          rekapData?.jumlah_hari_sakit || 0,
          rekapData?.jumlah_hari_mangkir || 0,
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(234, 179, 8, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
          'rgb(168, 85, 247)',
          'rgb(234, 179, 8)',
          'rgb(249, 115, 22)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const lateChartData = {
    labels: ['≤ 30 Min', '> 30 Min'],
    datasets: [
      {
        label: 'Hari',
        data: [
          timeMetrics?.terlambatKurangDari30Menit || 0,
          timeMetrics?.terlambatLebihDari30Menit || 0,
        ],
        backgroundColor: ['rgba(234, 179, 8, 0.8)', 'rgba(239, 68, 68, 0.8)'],
        borderColor: ['rgb(234, 179, 8)', 'rgb(239, 68, 68)'],
        borderWidth: 1,
      },
    ],
  };

  const overtimeChartData = {
    labels: ['SPL', 'Tanpa SPL', 'Libur SPL', 'Libur Tanpa SPL'],
    datasets: [
      {
        label: 'Jam/Hari',
        data: [
          parseFloat(overtimeCalc?.lemburDenganSPL || '0'),
          parseFloat(overtimeCalc?.lemburTanpaSPL || '0'),
          parseFloat(overtimeCalc?.lemburLiburDenganSPL || '0'),
          parseFloat(overtimeCalc?.lemburLiburTanpaSPL || '0'),
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(234, 179, 8, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(168, 85, 247)',
          'rgb(34, 197, 94)',
          'rgb(234, 179, 8)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const summaryChartData = {
    labels: ['Hadir', 'Lembur', 'Terlambat', 'Tidak Hadir'],
    datasets: [
      {
        label: 'Hari',
        data: [
          rekapData?.jumlah_hari_hadir || 0,
          parseFloat(overtimeCalc?.lemburDenganSPL || '0') +
            parseFloat(overtimeCalc?.lemburLiburDenganSPL || '0'),
          timeMetrics?.jumlahHariTerlambat || 0,
          (rekapData?.jumlah_hari_cuti_tahunan || 0) +
            (rekapData?.jumlah_hari_cuti_khusus || 0) +
            (rekapData?.jumlah_hari_izin || 0) +
            (rekapData?.jumlah_hari_sakit || 0) +
            (rekapData?.jumlah_hari_mangkir || 0),
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(234, 179, 8, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
          'rgb(234, 179, 8)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 9,
          },
          boxWidth: 8,
          padding: 4,
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: 8,
          },
        },
      },
      x: {
        ticks: {
          font: {
            size: 8,
          },
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          font: {
            size: 8,
          },
          boxWidth: 8,
          padding: 4,
        },
      },
    },
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 ">
      {isLoading && <Loading />}

      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-xl mb-6 overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 sm:px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                Absensi Saya
              </h1>
              <p className="text-blue-100 text-sm sm:text-base">
                {me?.name} - {me?.biodata_karyawan?.[0]?.nik || '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Employee Info Cards */}
        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
              <div className="text-sm text-blue-600 font-medium mb-1">
                Department
              </div>
              <div className="text-lg font-bold text-blue-900">
                {me?.biodata_karyawan?.[0]?.department?.nama_department || '-'}
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
              <div className="text-sm text-purple-600 font-medium mb-1">
                Divisi
              </div>
              <div className="text-lg font-bold text-purple-900">
                {me?.biodata_karyawan?.[0]?.divisi?.nama_divisi || '-'}
              </div>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-xl border border-indigo-200">
              <div className="text-sm text-indigo-600 font-medium mb-1">
                Jabatan
              </div>
              <div className="text-lg font-bold text-indigo-900">
                {me?.biodata_karyawan?.[0]?.nama_jabatan || '-'}
              </div>
            </div>
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-xl border border-teal-200">
              <div className="text-sm text-teal-600 font-medium mb-1">
                Tipe Penggajian
              </div>
              <div className="text-lg font-bold text-teal-900 capitalize">
                {me?.biodata_karyawan?.[0]?.tipe_penggajian || '-'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 sm:px-8 py-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <svg
              className="w-6 h-6"
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
            Periode Data
          </h2>
        </div>

        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Dari Tanggal
              </label>
              <input
                type="date"
                value={dateFrom || ''}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full rounded-lg bg-gray-50 border-2 border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sampai Tanggal
              </label>
              <input
                type="date"
                value={dateTo || ''}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full rounded-lg bg-gray-50 border-2 border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  if (dateFrom && dateTo) {
                    getRekapAbsen(dateFrom, dateTo);
                  }
                }}
                disabled={!dateFrom || !dateTo}
                className={`w-full rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-all ${
                  !dateFrom || !dateTo
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg'
                }`}
              >
                Tampilkan Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Section - Compact */}
      {rekapData && (
        <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 sm:px-8 py-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <svg
                className="w-5 h-5"
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
              Ringkasan Kehadiran
            </h2>
          </div>

          <div className="p-4 sm:p-6">
            {/* Attendance Summary Cards - Smaller */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-xl border border-green-200 shadow-sm">
                <div className="text-2xl font-bold text-green-600 mb-0.5">
                  {rekapData.jumlah_hari_hadir || 0}
                </div>
                <div className="text-xs font-semibold text-green-700 uppercase">
                  Hadir
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-xl border border-blue-200 shadow-sm">
                <div className="text-2xl font-bold text-blue-600 mb-0.5">
                  {rekapData.jumlah_hari_cuti_tahunan || 0}
                </div>
                <div className="text-xs font-semibold text-blue-700 uppercase">
                  Cuti Tahunan
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-xl border border-purple-200 shadow-sm">
                <div className="text-2xl font-bold text-purple-600 mb-0.5">
                  {rekapData.jumlah_hari_cuti_khusus || 0}
                </div>
                <div className="text-xs font-semibold text-purple-700 uppercase">
                  Cuti Khusus
                </div>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-3 rounded-xl border border-yellow-200 shadow-sm">
                <div className="text-2xl font-bold text-yellow-600 mb-0.5">
                  {rekapData.jumlah_hari_izin || 0}
                </div>
                <div className="text-xs font-semibold text-yellow-700 uppercase">
                  Izin
                </div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 rounded-xl border border-orange-200 shadow-sm">
                <div className="text-2xl font-bold text-orange-600 mb-0.5">
                  {rekapData.jumlah_hari_sakit || 0}
                </div>
                <div className="text-xs font-semibold text-orange-700 uppercase">
                  Sakit
                </div>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-3 rounded-xl border border-red-200 shadow-sm">
                <div className="text-2xl font-bold text-red-600 mb-0.5">
                  {rekapData.jumlah_hari_mangkir || 0}
                </div>
                <div className="text-xs font-semibold text-red-700 uppercase">
                  Mangkir
                </div>
              </div>
            </div>

            {/* Overtime & Late Summary - Compact */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Lembur */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                <h3 className="text-xs font-bold text-blue-800 mb-3 flex items-center gap-2">
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Lembur dengan SPL
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-700">Lembur:</span>
                    <span className="text-base font-bold text-blue-600">
                      {overtimeCalc?.lemburDenganSPL} Jam
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-700">Lembur Libur:</span>
                    <span className="text-base font-bold text-blue-600">
                      {overtimeCalc?.lemburLiburDenganSPL} Jam
                    </span>
                  </div>
                </div>
              </div>

              {/* Lembur Tanpa SPL */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                <h3 className="text-xs font-bold text-purple-800 mb-3 flex items-center gap-2">
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Lembur tanpa SPL
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-700">Lembur:</span>
                    <span className="text-base font-bold text-purple-600">
                      {overtimeCalc?.lemburTanpaSPL} Hari
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-700">Lembur Libur:</span>
                    <span className="text-base font-bold text-purple-600">
                      {overtimeCalc?.lemburLiburTanpaSPL} Hari
                    </span>
                  </div>
                </div>
              </div>

              {/* Keterlambatan */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200">
                <h3 className="text-xs font-bold text-yellow-800 mb-3 flex items-center gap-2">
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
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  Keterlambatan
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-700">Total Jam:</span>
                    <span className="text-base font-bold text-yellow-600">
                      {timeMetrics?.totalTerlambat} Jam
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-700">≤ 30 menit:</span>
                    <span className="text-sm font-bold text-yellow-600">
                      {timeMetrics?.terlambatKurangDari30Menit} hari
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-700">
                      {'>'} 30 menit:
                    </span>
                    <span className="text-sm font-bold text-orange-600">
                      {timeMetrics?.terlambatLebihDari30Menit} hari
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Section - All 4 in one row, mobile responsive */}
      {rekapData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {/* Attendance Chart */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-green-500 to-teal-600 px-4 py-2">
              <h3 className="text-sm font-bold text-white">Kehadiran</h3>
            </div>
            <div className="p-3">
              <div className="h-48">
                <Bar data={attendanceChartData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* Overtime Chart */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2">
              <h3 className="text-sm font-bold text-white">Lembur</h3>
            </div>
            <div className="p-3">
              <div className="h-48">
                <Bar data={overtimeChartData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* Late Chart */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-600 px-4 py-2">
              <h3 className="text-sm font-bold text-white">Terlambat</h3>
            </div>
            <div className="p-3">
              <div className="h-48 flex items-center justify-center">
                <div className="w-full">
                  <Doughnut data={lateChartData} options={doughnutOptions} />
                </div>
              </div>
            </div>
          </div>

          {/* Summary Chart */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-4 py-2">
              <h3 className="text-sm font-bold text-white">Ringkasan</h3>
            </div>
            <div className="p-3">
              <div className="h-48 flex items-center justify-center">
                <div className="w-full">
                  <Doughnut data={summaryChartData} options={doughnutOptions} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Table */}
      {rekapData && rekapData.absensi && rekapData.absensi.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 sm:px-8 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              Riwayat Absensi Detail
            </h2>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Table Header */}
              <div className="grid grid-cols-12 px-6 py-4 bg-gray-50 border-b-2 border-gray-200 gap-2">
                <label className="text-gray-700 text-sm font-bold">No</label>
                <label className="text-gray-700 text-sm font-bold col-span-2">
                  Tanggal
                </label>
                <label className="text-gray-700 text-sm font-bold col-span-2">
                  <div className="flex gap-2 items-center">
                    <span>Waktu Masuk/Keluar</span>
                  </div>
                </label>
                <label className="text-gray-700 text-sm font-bold">Shift</label>
                <label className="text-gray-700 text-sm font-bold col-span-2">
                  Jam Lembur
                </label>
                <label className="text-gray-700 text-sm font-bold">
                  Terlambat
                </label>
                <label className="text-gray-700 text-sm font-bold col-span-2">
                  Status
                </label>
              </div>

              {/* Table Body */}
              {rekapData.absensi.map((data: any, i: number) => {
                const getRowBackground = () => {
                  switch (data.status_absen) {
                    case 'cuti khusus':
                      return 'bg-orange-50';
                    case 'sakit':
                      return 'bg-green-50';
                    case 'izin':
                      return 'bg-blue-50';
                    case 'Belum Masuk':
                      return 'bg-red-100';
                    case 'cuti tahunan':
                      return 'bg-yellow-50';
                    default:
                      return '';
                  }
                };

                return (
                  <div
                    key={i}
                    className={`grid grid-cols-12 border-b border-gray-200 gap-2 items-center px-6 py-4 hover:bg-gray-50 transition-colors ${getRowBackground()}`}
                  >
                    <label className="text-gray-600 text-sm font-semibold">
                      {i + 1}
                    </label>

                    <div className="flex flex-col col-span-2">
                      <label className="text-gray-800 text-sm font-medium">
                        {data.hari}
                      </label>
                      <label className="text-gray-600 text-xs">
                        {data.tgl_masuk}
                      </label>
                      {data.jenis_hari_masuk !== 'Biasa' &&
                        data.jenis_hari_masuk != null && (
                          <span className="text-blue-600 text-xs font-medium mt-1">
                            Libur
                          </span>
                        )}
                    </div>

                    <div className="flex flex-col gap-0.5 col-span-2">
                      <span className="text-sm">
                        <span className="text-gray-600">In:</span>{' '}
                        {data.jam_masuk || '~'}
                      </span>
                      <span className="text-sm">
                        <span className="text-gray-600">Out:</span>{' '}
                        {data.jam_keluar || '~'}
                      </span>
                    </div>

                    <label className="text-gray-800 text-sm">
                      {data.shift || '~'}
                    </label>

                    <div className="flex flex-col gap-0.5 col-span-2">
                      {data.status_ketidaksesuaian && (
                        <span className="uppercase text-xs font-semibold text-blue-500">
                          {data.status_ketidaksesuaian}
                        </span>
                      )}
                      <span className="font-medium text-purple-600 text-sm">
                        {data.jam_lembur > 0 ? `${data.jam_lembur} Jam` : '-'}
                      </span>
                      {data.jam_lembur_spl > 0 && (
                        <span className="text-xs text-blue-500">
                          SPL: {data.jam_lembur_spl} Jam
                        </span>
                      )}
                      {data.status_lembur && (
                        <span className="text-xs text-gray-500">
                          {data.status_lembur}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">
                        {data.status_masuk}
                      </span>
                      <span className="text-sm text-orange-600">
                        {data.menit_terlambat == null ||
                        data.menit_terlambat == 0
                          ? '~'
                          : `${data.menit_terlambat} JAM`}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 col-span-2">
                      <span className="font-medium text-sm">
                        {data.status_absen}
                      </span>
                      {data.status_keluar &&
                        data.status_keluar !== 'Belum Pulang' &&
                        data.status_keluar !== 'Keluar' && (
                          <span className="text-xs text-blue-500">
                            {data.status_keluar}
                          </span>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* No Data State */}
      {!rekapData && !isLoading && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
          <svg
            className="w-20 h-20 mx-auto text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-gray-500 text-xl font-medium">
            Tidak ada data absensi
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Pilih periode tanggal untuk melihat data
          </p>
        </div>
      )}
    </main>
  );
}

export default PersonalAbsensi;
