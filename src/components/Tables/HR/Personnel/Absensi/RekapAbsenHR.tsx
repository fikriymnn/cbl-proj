import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Loading from '../../../../Loading';
import ModalKosongan from '../../../../Modals/Qc/NCR/NCRResponQC';
import convertTimeStampToDate from '../../../../../utils/convertDate';
import ExcelExportRekapAbsen from './ExcelExportRekapAbsen';

function RekapAbsenHR() {
  const [isLoading, setIsLoading] = useState(false);
  const [absen, setabsen] = useState<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState<any>(null);
  const [dateTo, setDateTo] = useState<any>(null);
  const [idDepartment, setidDepartment] = useState<any>();
  const [department, setDepartment] = useState<any>();
  const [tipePenggajian, setTipePenggajian] = useState<any>('');
  const [idDivisi, setIdDivisi] = useState<any>('');
  const [divisi, setDivisi] = useState<any>();

  const filteredAbsen = absen?.filter((data: any) =>
    data.nama_karyawan.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  useEffect(() => {
    getDepartment();
    getDivisi();
  }, []);

  async function getDepartment() {
    const url = `${import.meta.env.VITE_API_LINK}/master/hr/department`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        params: {
          is_active: true,
        },
        withCredentials: true,
      });
      setIsLoading(false);
      setDepartment(res.data);
      console.log(res.data);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }

  async function getDivisi() {
    const url = `${import.meta.env.VITE_API_LINK}/master/hr/divisi`;
    try {
      const res = await axios.get(url, {
        params: {
          is_active: true,
        },
        withCredentials: true,
      });
      setDivisi(res.data);
      console.log(res.data);
    } catch (error: any) {
      console.log(error);
    }
  }

  async function getabsen(dateFrom1: any, dateTo1: any) {
    const url = `${import.meta.env.VITE_API_LINK}/hr/absensiRekap`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        params: {
          startDate: dateFrom1,
          endDate: dateTo1,
          idDepartment: idDepartment || undefined,
          tipe_penggajian: tipePenggajian || undefined,
          id_divisi: idDivisi || undefined,
          is_active: true,
          page: 1,
          limit: 10,
        },
        withCredentials: true,
      });
      setIsLoading(false);
      setabsen(res.data.data);
      console.log(res.data);
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

      // Check if tardiness type is Dinas or Pribadi — these are exempt from denda
      const isDinasPribadi = [
        'terlambat : dinas',
        'terlambat : pribadi',
      ].includes(record.status_masuk?.toLowerCase());

      totalPulangCepat += menitPulangCepat;
      totalIstirahatLembur += jamIstirahatLembur;

      // Only count tardiness metrics for denda if NOT Dinas or Pribadi
      if (!isDinasPribadi) {
        totalTerlambat += menitTerlambat;

        if (menitTerlambat > 0) {
          jumlahHariTerlambat++;

          if (menitTerlambat <= 0.5) {
            terlambatKurangDari30Menit++;
          } else {
            terlambatLebihDari30Menit++;
          }
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

  const [showModal, setShowModal] = useState<boolean[]>([]);
  const openModalModal = (i: any) => {
    const onchangeVal: any = [...showModal];
    onchangeVal[i] = true;
    setShowModal(onchangeVal);
  };

  const closeModalModal = (i: any) => {
    const onchangeVal: any = [...showModal];
    onchangeVal[i] = false;
    setShowModal(onchangeVal);
  };

  const [showDetail, setShowDetail] = useState<boolean[]>(
    new Array(absen != null && absen.length).fill(false),
  );

  const handleClickDetail = (index: number) => {
    setShowDetail((prevState) => {
      const updatedShowDetail = [...prevState];
      updatedShowDetail[index] = !updatedShowDetail[index];
      return updatedShowDetail;
    });
  };

  return (
    <>
      <main className="overflow-x-scroll">
        {isLoading && <Loading />}

        {/* Filter Section */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg mb-6 border border-gray-200">
          <div className="p-8">
            {/* Header with Icon */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="bg-primary/10 p-3 rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  Filter Rekap Absensi
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Pilih kriteria filter untuk menampilkan data absensi karyawan
                </p>
              </div>
            </div>

            {/* Filter Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Date Range Section - Takes 3 columns */}
              <div className="lg:col-span-3">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <h4 className="text-sm font-semibold text-gray-700">
                      Periode Tanggal
                    </h4>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">
                        Tanggal Mulai
                      </label>
                      <input
                        className="w-full rounded-lg bg-gray-50 border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all"
                        type="date"
                        value={dateFrom || ''}
                        onChange={(e) => {
                          setDateFrom(e.target.value);
                          console.log(e.target.value);
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">
                        Tanggal Selesai
                      </label>
                      <input
                        className="w-full rounded-lg bg-gray-50 border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all"
                        type="date"
                        value={dateTo || ''}
                        onChange={(e) => setDateTo(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Department Section - Takes 2 columns */}
              <div className="lg:col-span-2">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-purple-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    <h4 className="text-sm font-semibold text-gray-700">
                      Department
                    </h4>
                  </div>
                  <select
                    name="nama_department"
                    value={idDepartment || ''}
                    onChange={(e) => setidDepartment(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem',
                    }}
                  >
                    <option value="" className="text-gray-500">
                      Semua Department
                    </option>
                    {department?.data?.map((data: any, i: number) => (
                      <option key={i} value={data.id} className="text-gray-800">
                        {data.nama_department}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Divisi Section - Takes 2 columns */}
              <div className="lg:col-span-2">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-indigo-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <h4 className="text-sm font-semibold text-gray-700">
                      Divisi
                    </h4>
                  </div>
                  <select
                    name="id_divisi"
                    value={idDivisi || ''}
                    onChange={(e) => setIdDivisi(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem',
                    }}
                  >
                    <option value="" className="text-gray-500">
                      Semua Divisi
                    </option>
                    {divisi?.data?.map((data: any, i: number) => (
                      <option key={i} value={data.id} className="text-gray-800">
                        {data.nama_divisi}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tipe Penggajian Section - Takes 2 columns */}
              <div className="lg:col-span-2">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <h4 className="text-sm font-semibold text-gray-700">
                      Tipe Penggajian
                    </h4>
                  </div>
                  <select
                    name="tipe_penggajian"
                    value={tipePenggajian || ''}
                    onChange={(e) => setTipePenggajian(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem',
                    }}
                  >
                    <option value="" className="text-gray-500">
                      Semua Tipe
                    </option>
                    <option value="mingguan" className="text-gray-800">
                      Mingguan
                    </option>
                    <option value="bulanan" className="text-gray-800">
                      Bulanan
                    </option>
                  </select>
                </div>
              </div>

              {/* Search and Action Section - Takes 3 columns */}
              <div className="lg:col-span-3">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-orange-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <h4 className="text-sm font-semibold text-gray-700">
                      Pencarian
                    </h4>
                  </div>
                  <div className="space-y-3">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari nama karyawan..."
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all"
                      />
                    </div>

                    {dateFrom == null || dateTo == null ? (
                      <button
                        disabled
                        className="w-full bg-gray-300 text-gray-500 px-4 py-2.5 rounded-lg text-sm font-medium cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                        Pilih Tanggal Terlebih Dahulu
                      </button>
                    ) : (
                      <button
                        onClick={() => getabsen(dateFrom, dateTo)}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        Tampilkan Data
                      </button>
                    )}

                    {filteredAbsen && filteredAbsen.length > 0 && (
                      <ExcelExportRekapAbsen
                        filteredAbsen={filteredAbsen}
                        dateFrom={dateFrom}
                        dateTo={dateTo}
                        idDepartment={idDepartment}
                        tipePenggajian={tipePenggajian}
                        idDivisi={idDivisi}
                        calculateOvertimeHours={calculateOvertimeHours}
                        calculateTimeMetrics={calculateTimeMetrics}
                        convertTimeStampToDate={convertTimeStampToDate}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="min-w-[700px] bg-white rounded-xl shadow-md">
          <div className="w-full h-full flex-col">
            {/* Table Header */}
            <div className="grid grid-cols-12 px-6 py-4 bg-gray-50 rounded-t-xl border-b gap-4">
              <div className="flex col-span-2 gap-2">
                <label className="text-gray-700 text-sm font-semibold">
                  No.
                </label>
                <label className="text-gray-700 text-sm font-semibold">
                  NIK
                </label>
              </div>
              <label className="text-gray-700 text-sm font-semibold col-span-3">
                Nama Karyawan
              </label>
              <label className="text-gray-700 text-sm font-semibold col-span-2">
                Department
              </label>
              <label className="text-gray-700 text-sm font-semibold col-span-2">
                Divisi
              </label>
              <label className="text-gray-700 text-sm font-semibold col-span-3 flex justify-end">
                Aksi
              </label>
            </div>

            {/* Table Body */}
            {filteredAbsen?.map((data: any, i: any) => {
              const overtimeCalc = calculateOvertimeHours(data.absensi);
              const timeMetrics = calculateTimeMetrics(data.absensi);

              return (
                <div
                  key={i}
                  className="grid grid-cols-12 px-6 py-4 border-b hover:bg-gray-50 gap-4"
                >
                  <div className="flex col-span-2 gap-2">
                    <label className="text-gray-600 text-sm">{i + 1}.</label>
                    <label className="text-gray-600 text-sm">{data.nik}</label>
                  </div>
                  <label className="text-gray-600 text-sm col-span-3">
                    {data.nama_karyawan}
                  </label>
                  <label className="text-gray-600 text-sm col-span-2">
                    {data.department}
                  </label>
                  <label className="text-gray-600 text-sm col-span-2">
                    {data.divisi}
                  </label>
                  <div className="col-span-3 flex justify-end">
                    <button
                      onClick={() => openModalModal(i)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                    >
                      Lihat Detail
                    </button>
                  </div>

                  {/* Modal */}
                  {showModal[i] === true && (
                    <ModalKosongan
                      isOpen={showModal[i]}
                      onClose={() => closeModalModal(i)}
                      judul={'Detail Rekap Absensi'}
                    >
                      <div className="p-6">
                        <div className="mb-6">
                          <h4 className="text-lg font-bold text-gray-800 mb-4">
                            DETAIL REKAP ABSENSI Periode :{' '}
                            {convertTimeStampToDate(dateFrom)} ~{' '}
                            {convertTimeStampToDate(dateTo)}
                          </h4>

                          {/* Employee Info - Compact Grid */}
                          <div className="bg-gray-50 p-4 rounded-lg mb-4">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 text-sm">
                              <div className="flex">
                                <span className="w-20 text-gray-600">Nama</span>
                                <span className="text-gray-800">
                                  : {data.nama_karyawan}
                                </span>
                              </div>
                              <div className="flex">
                                <span className="w-20 text-gray-600">NIK</span>
                                <span className="text-gray-800">
                                  : {data.nik}
                                </span>
                              </div>
                              <div className="flex">
                                <span className="w-20 text-gray-600">
                                  Jabatan
                                </span>
                                <span className="text-gray-800">
                                  : {data.jabatan || '-'}
                                </span>
                              </div>
                              <div className="flex">
                                <span className="w-20 text-gray-600">Dept</span>
                                <span className="text-gray-800">
                                  : {data.department}
                                </span>
                              </div>
                              <div className="flex">
                                <span className="w-20 text-gray-600">
                                  Divisi
                                </span>
                                <span className="text-gray-800">
                                  : {data.divisi}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Summary Cards - Compact */}
                          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
                            <div className="bg-blue-50 p-2 rounded text-center">
                              <div className="text-lg font-bold text-blue-600">
                                {data.jumlah_hari_cuti_tahunan || 0}
                              </div>
                              <div className="text-xs text-gray-600">
                                Cuti Tahunan
                              </div>
                            </div>
                            <div className="bg-purple-50 p-2 rounded text-center">
                              <div className="text-lg font-bold text-purple-600">
                                {data.jumlah_hari_cuti_khusus || 0}
                              </div>
                              <div className="text-xs text-gray-600">
                                Cuti Khusus
                              </div>
                            </div>
                            <div className="bg-yellow-50 p-2 rounded text-center">
                              <div className="text-lg font-bold text-yellow-600">
                                {data.jumlah_hari_izin || 0}
                              </div>
                              <div className="text-xs text-gray-600">Izin</div>
                            </div>
                            <div className="bg-orange-50 p-2 rounded text-center">
                              <div className="text-lg font-bold text-orange-600">
                                {data.jumlah_hari_sakit || 0}
                              </div>
                              <div className="text-xs text-gray-600">Sakit</div>
                            </div>
                            <div className="bg-red-50 p-2 rounded text-center">
                              <div className="text-lg font-bold text-red-600">
                                {data.jumlah_hari_mangkir || 0}
                              </div>
                              <div className="text-xs text-gray-600">
                                Mangkir
                              </div>
                            </div>
                          </div>

                          {/* Lembur & Lembur Libur & Keterlambatan - Split into 3 sections */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            {/* Lembur */}
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <h5 className="text-sm font-semibold text-blue-800 mb-2">
                                LEMBUR DENGAN SPL
                              </h5>
                              <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                  <span>Lembur:</span>
                                  <span className="font-medium">
                                    {overtimeCalc.lemburDenganSPL} Jam
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Lembur Libur:</span>
                                  <span className="font-medium">
                                    {overtimeCalc.lemburLiburDenganSPL} Jam
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Lembur Libur */}
                            <div className="bg-purple-50 p-3 rounded-lg">
                              <h5 className="text-sm font-semibold text-purple-800 mb-2">
                                LEMBUR TANPA SPL
                              </h5>
                              <div className="space-y-1 text-xs">
                                <div className="flex flex-col">
                                  <div className="flex justify-between">
                                    <span>Lembur:</span>
                                    <span className="font-medium">
                                      {overtimeCalc.lemburTanpaSPL} Hari
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Lembur Libur:</span>
                                    <span className="font-medium">
                                      {overtimeCalc.lemburLiburTanpaSPL} Hari
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Keterlambatan */}
                            <div className="bg-yellow-50 p-3 rounded-lg">
                              <h5 className="text-sm font-semibold text-yellow-800 mb-2">
                                KETERLAMBATAN
                              </h5>
                              <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                  <span>Total Jam:</span>
                                  <span className="font-medium">
                                    {timeMetrics.totalTerlambat} Jam
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Terlambat ≤ 30 menit:</span>
                                  <span className="font-medium">
                                    {timeMetrics.terlambatKurangDari30Menit}{' '}
                                    hari
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Terlambat {'>'} 30 menit:</span>
                                  <span className="font-medium">
                                    {timeMetrics.terlambatLebihDari30Menit} hari
                                  </span>
                                </div>
                                <div className="flex justify-between border-t pt-1 mt-2">
                                  <span>Total Hari Terlambat:</span>
                                  <span className="font-medium">
                                    {timeMetrics.jumlahHariTerlambat} hari
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Cuti Details */}
                          {(data.cuti_tahunan?.length > 0 ||
                            data.cuti_khusus?.length > 0) && (
                            <div className="bg-indigo-50 p-3 rounded-lg mb-4">
                              <h5 className="text-sm font-semibold text-indigo-800 mb-2">
                                RIWAYAT CUTI
                              </h5>

                              {/* Cuti Tahunan */}
                              {data.cuti_tahunan?.length > 0 && (
                                <div className="mb-3">
                                  <h6 className="text-xs font-semibold text-gray-700 mb-1">
                                    Cuti Tahunan ({data.cuti_tahunan.length}{' '}
                                    periode):
                                  </h6>
                                  <div className="space-y-1">
                                    {data.cuti_tahunan.map(
                                      (cuti: any, idx: number) => (
                                        <div
                                          key={idx}
                                          className="bg-white p-2 rounded text-xs"
                                        >
                                          <div className="grid grid-cols-2 gap-2">
                                            <div>
                                              <strong>Periode:</strong>{' '}
                                              {new Date(
                                                cuti.dari,
                                              ).toLocaleDateString(
                                                'id-ID',
                                              )}{' '}
                                              -{' '}
                                              {new Date(
                                                cuti.sampai,
                                              ).toLocaleDateString('id-ID')}
                                            </div>
                                            <div>
                                              <strong>Jumlah:</strong>{' '}
                                              {cuti.jumlah_hari} hari
                                            </div>
                                            <div className="col-span-2">
                                              <strong>Alasan:</strong>{' '}
                                              {cuti.alasan_cuti}
                                            </div>
                                            {cuti.catatan_hr && (
                                              <div className="col-span-2">
                                                <strong>Catatan HR:</strong>{' '}
                                                {cuti.catatan_hr}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Cuti Khusus */}
                              {data.cuti_khusus?.length > 0 && (
                                <div className="mb-3">
                                  <h6 className="text-xs font-semibold text-gray-700 mb-1">
                                    Cuti Khusus ({data.cuti_khusus.length}{' '}
                                    periode):
                                  </h6>
                                  <div className="space-y-1">
                                    {data.cuti_khusus.map(
                                      (cuti: any, idx: number) => (
                                        <div
                                          key={idx}
                                          className="bg-white p-2 rounded text-xs"
                                        >
                                          <div className="grid grid-cols-2 gap-2">
                                            <div>
                                              <strong>Periode:</strong>{' '}
                                              {new Date(
                                                cuti.dari,
                                              ).toLocaleDateString(
                                                'id-ID',
                                              )}{' '}
                                              -{' '}
                                              {new Date(
                                                cuti.sampai,
                                              ).toLocaleDateString('id-ID')}
                                            </div>
                                            <div>
                                              <strong>Jumlah:</strong>{' '}
                                              {cuti.jumlah_hari} hari
                                            </div>
                                            <div className="col-span-2">
                                              <strong>Alasan:</strong>{' '}
                                              {cuti.alasan_cuti}
                                            </div>
                                            {cuti.catatan_hr && (
                                              <div className="col-span-2">
                                                <strong>Catatan HR:</strong>{' '}
                                                {cuti.catatan_hr}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Sakit/Izin/Mangkir Details - Compact */}
                          {(data.sakit?.length > 0 ||
                            data.izin?.length > 0 ||
                            data.mangkir?.length > 0) && (
                            <div className="bg-red-50 p-3 rounded-lg mb-4">
                              <h5 className="text-sm font-semibold text-red-800 mb-2">
                                SAKIT/IZIN/MANGKIR
                              </h5>

                              {/* Sakit Details */}
                              {data.sakit?.length > 0 && (
                                <div className="mb-2">
                                  <h6 className="text-xs font-semibold text-gray-700 mb-1">
                                    Sakit ({data.sakit.length} periode):
                                  </h6>
                                  <div className="space-y-1">
                                    {data.sakit.map(
                                      (sakit: any, idx: number) => (
                                        <div
                                          key={idx}
                                          className="bg-white p-2 rounded text-xs"
                                        >
                                          <div className="grid grid-cols-2 gap-2">
                                            <div>
                                              <strong>Tanggal:</strong>{' '}
                                              {new Date(
                                                sakit.dari,
                                              ).toLocaleDateString(
                                                'id-ID',
                                              )}{' '}
                                              -{' '}
                                              {new Date(
                                                sakit.sampai,
                                              ).toLocaleDateString('id-ID')}
                                            </div>
                                            <div>
                                              <strong>Jumlah:</strong>{' '}
                                              {sakit.jumlah_hari} hari
                                            </div>
                                            {sakit.catatan_hr && (
                                              <div className="col-span-2">
                                                <strong>Catatan HR:</strong>{' '}
                                                {sakit.catatan_hr}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Izin Details */}
                              {data.izin?.length > 0 && (
                                <div className="mb-2">
                                  <h6 className="text-xs font-semibold text-gray-700 mb-1">
                                    Izin ({data.izin.length} periode):
                                  </h6>
                                  <div className="space-y-1">
                                    {data.izin.map((izin: any, idx: number) => (
                                      <div
                                        key={idx}
                                        className="bg-white p-2 rounded text-xs"
                                      >
                                        <div className="grid grid-cols-2 gap-2">
                                          <div>
                                            <strong>Tanggal:</strong>{' '}
                                            {new Date(
                                              izin.dari,
                                            ).toLocaleDateString('id-ID')}{' '}
                                            -{' '}
                                            {new Date(
                                              izin.sampai,
                                            ).toLocaleDateString('id-ID')}
                                          </div>
                                          <div>
                                            <strong>Jumlah:</strong>{' '}
                                            {izin.jumlah_hari} hari
                                          </div>
                                          <div className="col-span-2">
                                            <strong>Alasan:</strong>{' '}
                                            {izin.alasan_izin}
                                          </div>
                                          {izin.catatan_hr && (
                                            <div className="col-span-2">
                                              <strong>Catatan HR:</strong>{' '}
                                              {izin.catatan_hr}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Mangkir Details */}
                              {data.mangkir?.length > 0 && (
                                <div className="mb-2">
                                  <h6 className="text-xs font-semibold text-gray-700 mb-1">
                                    Mangkir ({data.mangkir.length} hari):
                                  </h6>
                                  <div className="space-y-1">
                                    {data.mangkir.map(
                                      (mangkir: any, idx: number) => (
                                        <div
                                          key={idx}
                                          className="bg-white p-2 rounded text-xs"
                                        >
                                          <div className="grid grid-cols-2 gap-2">
                                            <div>
                                              <strong>Tanggal:</strong>{' '}
                                              {new Date(
                                                mangkir.tanggal,
                                              ).toLocaleDateString('id-ID')}
                                            </div>
                                            {mangkir.catatan_hr && (
                                              <div>
                                                <strong>Catatan HR:</strong>{' '}
                                                {mangkir.catatan_hr}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Detail Button */}
                          <div className="flex justify-end mt-4">
                            <button
                              onClick={() => handleClickDetail(i)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                              {showDetail[i]
                                ? 'Sembunyikan Detail'
                                : 'Tampilkan Detail Absensi'}
                            </button>
                          </div>

                          {/* Detailed Attendance Records */}
                          {showDetail[i] && (
                            <div className="mt-4 border-t pt-4">
                              <h5 className="text-sm font-semibold text-gray-800 mb-3">
                                Riwayat Absensi Detail
                              </h5>

                              {/* Detail Table Header */}
                              <div className="grid grid-cols-12 gap-2 bg-gray-100 p-2 rounded text-xs font-semibold text-gray-700 mb-2">
                                <div className="col-span-1">No.</div>
                                <div className="col-span-2">Tanggal</div>
                                <div className="col-span-1">Masuk</div>
                                <div className="col-span-1">Keluar</div>
                                <div className="col-span-1">Shift</div>
                                <div className="col-span-1">Status</div>
                                <div className="col-span-1">Lembur</div>
                                <div className="col-span-1">Istirahat</div>
                                <div className="col-span-3">Keterangan</div>
                              </div>

                              {/* Detail Table Body */}
                              <div className="max-h-96 overflow-y-auto">
                                {data.absensi?.map((record: any, ii: any) => {
                                  // Check if this record is exempt from denda
                                  const isDinasPribadi = [
                                    'terlambat : dinas',
                                    'terlambat : pribadi',
                                  ].includes(
                                    record.status_masuk?.toLowerCase(),
                                  );

                                  return (
                                    <div
                                      key={ii}
                                      className="grid grid-cols-12 gap-2 p-3 border-b text-sm hover:bg-gray-50"
                                    >
                                      <div className="col-span-1">{ii + 1}</div>
                                      <div className="col-span-2">
                                        {record.tgl_masuk || '-'}
                                      </div>
                                      <div className="col-span-1">
                                        {record.jam_masuk &&
                                        record.jam_masuk !== '0'
                                          ? record.jam_masuk
                                          : '-'}
                                      </div>
                                      <div className="col-span-1">
                                        {record.jam_keluar &&
                                        record.jam_keluar !== '0'
                                          ? record.jam_keluar
                                          : '-'}
                                      </div>
                                      <div className="col-span-1">
                                        {record.shift && record.shift !== '0'
                                          ? record.shift
                                          : '-'}
                                      </div>
                                      <div className="col-span-1">
                                        <span
                                          className={`px-1 py-1 rounded text-xs ${
                                            record.status_absen === 'masuk'
                                              ? 'bg-green-100 text-green-800'
                                              : record.status_absen === 'izin'
                                              ? 'bg-yellow-100 text-yellow-800'
                                              : record.status_absen === 'sakit'
                                              ? 'bg-red-100 text-red-800'
                                              : 'bg-gray-100 text-gray-800'
                                          }`}
                                        >
                                          {record.status_absen || '-'}
                                        </span>
                                      </div>
                                      <div className="col-span-1">
                                        {record.jam_lembur &&
                                        record.jam_lembur !== '0'
                                          ? `${record.jam_lembur} jam`
                                          : '-'}
                                      </div>
                                      <div className="col-span-1">
                                        {record.jam_istirahat_lembur &&
                                        record.jam_istirahat_lembur !== '0'
                                          ? `${record.jam_istirahat_lembur} jam`
                                          : '-'}
                                      </div>
                                      <div className="col-span-3">
                                        <div className="text-xs space-y-1">
                                          {record.status_masuk && (
                                            <div className="text-gray-600">
                                              Status: {record.status_masuk}
                                            </div>
                                          )}
                                          {record.menit_terlambat > 0 && (
                                            <div
                                              className={
                                                isDinasPribadi
                                                  ? 'text-gray-400'
                                                  : 'text-red-600'
                                              }
                                            >
                                              Terlambat:{' '}
                                              {record.menit_terlambat} Jam
                                              {isDinasPribadi && (
                                                <span className="ml-1 italic">
                                                  (tidak kena denda)
                                                </span>
                                              )}
                                            </div>
                                          )}
                                          {record.menit_pulang_cepat > 0 && (
                                            <div className="text-orange-600">
                                              Pulang Cepat:{' '}
                                              {record.menit_pulang_cepat} Jam
                                            </div>
                                          )}
                                          {record.status_lembur &&
                                            record.status_lembur !== '-' && (
                                              <div className="text-blue-600">
                                                {record.status_lembur}
                                              </div>
                                            )}
                                          {record.status_lembur_spl &&
                                            record.status_lembur_spl !==
                                              '-' && (
                                              <div className="text-purple-600 text-xs">
                                                SPL: {record.status_lembur_spl}
                                              </div>
                                            )}
                                          {record.keterangan &&
                                            record.keterangan !== '-' && (
                                              <div className="text-gray-500">
                                                {record.keterangan}
                                              </div>
                                            )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </ModalKosongan>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}

export default RekapAbsenHR;
