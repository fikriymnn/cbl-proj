import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Loading from '../../../../Loading';
import ModalKosongan from '../../../../Modals/Qc/NCR/NCRResponQC';
import convertTimeStampToDate from '../../../../../utils/convertDate';
import ExcelExportRekapAbsen from './ExcelExportRekapAbsen';
import Select from 'react-select';

// ===== Helper di luar komponen =====
const normalize = (val: any) => (val ?? '').toString().trim().toLowerCase();

// "17:00" / "17:00:00" -> menit
const timeToMinutes = (t: any): number | null => {
  if (!t || t === '0' || t === '-') return null;
  const m = t.toString().match(/(\d{1,2}):(\d{2})/);
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
};

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
  const [tipeKaryawan, setTipeKaryawan] = useState<any>('');
  const [masterShift, setMasterShift] = useState<any[]>([]);

  const filteredAbsen = absen?.filter((data: any) =>
    data.nama_karyawan.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  useEffect(() => {
    getDepartment();
    getDivisi();
    getMasterShift();
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

  async function getMasterShift() {
    const url = `${import.meta.env.VITE_API_LINK}/master/shift`;
    try {
      const res = await axios.get(url, { withCredentials: true });
      setMasterShift(res.data?.data || []);
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
          tipe_karyawan: tipeKaryawan || undefined,
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

  // Jam lembur tanpa SPL = jam_keluar pegawai - shift keluar terdekat (master shift)
  const hitungJamLemburTanpaSPL = (record: any): number => {
    const keluar = timeToMinutes(record.jam_keluar);
    if (keluar === null) return 0;

    const hari = normalize(record.hari);
    const jenisHari = normalize(record.jenis_hari_masuk);
    const findRow = (nama: string) =>
      masterShift.find((s: any) => normalize(s.hari) === nama);

    // Libur (termasuk Minggu & tanggal merah) -> baris "Libur"
    // Hari biasa -> baris sesuai hari, fallback ke "Libur" kalau tidak ketemu (mis. Minggu)
    const row =
      jenisHari === 'libur'
        ? findRow('libur') || findRow(hari)
        : findRow(hari) || findRow('libur');
    if (!row) return 0;

    const shiftKeluar = [row.shift_1_keluar, row.shift_2_keluar]
      .map(timeToMinutes)
      .filter((v): v is number => v !== null);
    if (shiftKeluar.length === 0) return 0;

    // shift keluar terdekat dari jam keluar pegawai (aman untuk lewat tengah malam)
    let bestDiff: number | null = null;
    shiftKeluar.forEach((sk) => {
      let diff = keluar - sk;
      if (diff < -720) diff += 1440;
      if (diff > 720) diff -= 1440;
      if (bestDiff === null || Math.abs(diff) < Math.abs(bestDiff)) {
        bestDiff = diff;
      }
    });

    if (bestDiff === null || bestDiff <= 0) return 0;

    // Bulatkan per record ke kelipatan 30 menit (0.5 jam), dibulatkan ke atas
    // contoh: 1 mnt -> 0.5, 30 mnt -> 0.5, 31 mnt -> 1.0, 61 mnt -> 1.5
    return Math.ceil(bestDiff / 30) * 0.5;
  };

  const calculateOvertimeHours = (absensiData: any[]) => {
    let lemburDenganSPL = 0;
    let lemburLiburDenganSPL = 0;
    let lemburTanpaSPL = 0; // jumlah hari
    let lemburLiburTanpaSPL = 0; // jumlah hari
    let lemburTanpaSPLJam = 0; // jumlah jam
    let lemburLiburTanpaSPLJam = 0; // jumlah jam

    absensiData?.forEach((record: any) => {
      const jamLembur = parseFloat(record.jam_lembur || 0);
      const statusLembur = normalize(record.status_lembur);
      const statusSPL = normalize(record.status_lembur_spl);
      const jenisHari = normalize(record.jenis_hari_masuk);

      // ===== TANPA SPL (hari + jam dari master shift) =====
      if (statusSPL === 'tidak dengan spl') {
        const jam = hitungJamLemburTanpaSPL(record);
        if (jenisHari === 'biasa') {
          lemburTanpaSPL += 1;
          lemburTanpaSPLJam += jam;
        } else if (jenisHari === 'libur') {
          lemburLiburTanpaSPL += 1;
          lemburLiburTanpaSPLJam += jam;
        }
      }

      // ===== DENGAN SPL (hitung jam berdasarkan status_lembur) =====
      if (statusSPL === 'dengan spl') {
        if (statusLembur === 'lembur') {
          lemburDenganSPL += jamLembur;
        } else if (statusLembur === 'lembur libur') {
          lemburLiburDenganSPL += jamLembur;
        }
      }
    });

    return {
      lemburDenganSPL: lemburDenganSPL.toFixed(1),
      lemburTanpaSPL: lemburTanpaSPL.toFixed(0),
      lemburLiburDenganSPL: lemburLiburDenganSPL.toFixed(1),
      lemburLiburTanpaSPL: lemburLiburTanpaSPL.toFixed(0),
      lemburTanpaSPLJam: lemburTanpaSPLJam.toFixed(1),
      lemburLiburTanpaSPLJam: lemburLiburTanpaSPLJam.toFixed(1),
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

  // ===== Opsi & style untuk react-select =====
  const departmentOptions =
    department?.data?.map((d: any) => ({
      value: d.id,
      label: d.nama_department,
    })) || [];

  const divisiOptions =
    divisi?.data?.map((d: any) => ({
      value: d.id,
      label: d.nama_divisi,
    })) || [];

  const tipeKaryawanOptions = [
    { value: 'staff', label: 'Staff' },
    { value: 'produksi', label: 'Produksi' },
  ];

  const tipePenggajianOptions = [
    { value: 'mingguan', label: 'Mingguan' },
    { value: 'bulanan', label: 'Bulanan' },
  ];

  const findOption = (options: any[], value: any) =>
    options.find((opt: any) => String(opt.value) === String(value)) || null;

  const customSelectStyles = {
    control: (base: any) => ({
      ...base,
      minHeight: '38px',
      backgroundColor: '#eff6ff',
      borderColor: '#bfdbfe',
      fontSize: '0.875rem',
      '&:hover': {
        borderColor: '#60a5fa',
      },
    }),
    menu: (base: any) => ({
      ...base,
      zIndex: 9999,
      fontSize: '0.875rem',
    }),
    menuPortal: (base: any) => ({
      ...base,
      zIndex: 9999,
    }),
  };

  const inputClass =
    'w-full rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all';
  const labelClass = 'block text-xs sm:text-sm text-gray-600 font-medium mb-2';

  const resetFilter = () => {
    setSearchQuery('');
    setidDepartment('');
    setIdDivisi('');
    setTipeKaryawan('');
    setTipePenggajian('');
  };

  return (
    <>
      <main className="overflow-x-scroll">
        {isLoading && <Loading />}

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 sm:p-4 rounded-t-lg">
            <h2 className="text-white text-base sm:text-lg md:text-xl font-bold">
              Filter Rekap Absensi
            </h2>
            <p className="text-blue-100 text-xs sm:text-sm mt-0.5">
              Pilih kriteria filter untuk menampilkan data absensi karyawan
            </p>
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            {/* Periode & Organisasi */}
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-blue-600 mb-3">
                Periode & Organisasi
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className={labelClass}>Tanggal Mulai</label>
                  <input
                    className={inputClass}
                    type="date"
                    value={dateFrom || ''}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Tanggal Selesai</label>
                  <input
                    className={inputClass}
                    type="date"
                    value={dateTo || ''}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Department</label>
                  <Select
                    options={departmentOptions}
                    value={findOption(departmentOptions, idDepartment)}
                    onChange={(selected: any) =>
                      setidDepartment(selected?.value || '')
                    }
                    isClearable
                    placeholder="Semua Department"
                    styles={customSelectStyles}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                  />
                </div>
                <div>
                  <label className={labelClass}>Divisi</label>
                  <Select
                    options={divisiOptions}
                    value={findOption(divisiOptions, idDivisi)}
                    onChange={(selected: any) =>
                      setIdDivisi(selected?.value || '')
                    }
                    isClearable
                    placeholder="Semua Divisi"
                    styles={customSelectStyles}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                  />
                </div>
              </div>
            </div>

            {/* Filter Tambahan */}
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-blue-600 mb-3">
                Filter Tambahan
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Nama Karyawan</label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama karyawan..."
                    className={inputClass}
                  />
                </div>
                {/* <div>
                  <label className={labelClass}>Tipe Karyawan</label>
                  <Select
                    options={tipeKaryawanOptions}
                    value={findOption(tipeKaryawanOptions, tipeKaryawan)}
                    onChange={(selected: any) =>
                      setTipeKaryawan(selected?.value || '')
                    }
                    isClearable
                    placeholder="Semua Tipe"
                    styles={customSelectStyles}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                  />
                </div> */}
                <div>
                  <label className={labelClass}>Tipe Penggajian</label>
                  <Select
                    options={tipePenggajianOptions}
                    value={findOption(tipePenggajianOptions, tipePenggajian)}
                    onChange={(selected: any) =>
                      setTipePenggajian(selected?.value || '')
                    }
                    isClearable
                    placeholder="Semua Tipe"
                    styles={customSelectStyles}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={resetFilter}
                className="bg-red-500 hover:bg-red-600 active:bg-red-700 transition-all rounded-lg px-4 py-2.5 text-sm font-medium text-white"
              >
                Reset Filter
              </button>

              <div className="flex flex-wrap items-center gap-3">
                {filteredAbsen && filteredAbsen.length > 0 && (
                  <div className="min-w-[160px]">
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
                  </div>
                )}
                <button
                  onClick={() => getabsen(dateFrom, dateTo)}
                  disabled={!dateFrom || !dateTo}
                  className={`rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-all ${
                    !dateFrom || !dateTo
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md active:bg-blue-800'
                  }`}
                >
                  {!dateFrom || !dateTo
                    ? 'Pilih Tanggal Terlebih Dahulu'
                    : 'Tampilkan Data'}
                </button>
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
              <label className="text-gray-700 text-sm font-semibold col-span-1 flex justify-center">
                Status
              </label>
              <label className="text-gray-700 text-sm font-semibold col-span-2 flex justify-end">
                Aksi
              </label>
            </div>

            {/* Table Body */}
            {filteredAbsen?.map((data: any, i: any) => {
              const overtimeCalc = calculateOvertimeHours(data.absensi);
              const timeMetrics = calculateTimeMetrics(data.absensi);

              // Indikator: merah jika ada sakit/izin/mangkir, hijau jika tidak ada
              const jmlSakit = Number(data.jumlah_hari_sakit || 0);
              const jmlIzin = Number(data.jumlah_hari_izin || 0);
              const jmlMangkir = Number(data.jumlah_hari_mangkir || 0);
              const adaSakitIzinMangkir =
                jmlSakit > 0 ||
                jmlIzin > 0 ||
                jmlMangkir > 0 ||
                data.sakit?.length > 0 ||
                data.izin?.length > 0 ||
                data.mangkir?.length > 0;

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
                  <div className="col-span-1 flex items-center justify-center">
                    <span
                      title={
                        adaSakitIzinMangkir
                          ? `Sakit: ${jmlSakit} hari, Izin: ${jmlIzin} hari, Mangkir: ${jmlMangkir} hari`
                          : 'Tidak ada sakit/izin/mangkir'
                      }
                      className={`inline-block h-3.5 w-3.5 rounded-full ${
                        adaSakitIzinMangkir ? 'bg-red-500' : 'bg-green-500'
                      }`}
                    />
                  </div>
                  <div className="col-span-2 flex justify-end">
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
                            {/* Lembur Dengan SPL */}
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

                            {/* Lembur Tanpa SPL */}
                            <div className="bg-purple-50 p-3 rounded-lg">
                              <h5 className="text-sm font-semibold text-purple-800 mb-2">
                                LEMBUR TANPA SPL
                              </h5>
                              <div className="space-y-1 text-xs">
                                <div className="flex flex-col">
                                  <div className="flex justify-between">
                                    <span>Lembur:</span>
                                    <span className="font-medium">
                                      {overtimeCalc.lemburTanpaSPLJam} Jam,{' '}
                                      {overtimeCalc.lemburTanpaSPL} Kali
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Lembur Libur:</span>
                                    <span className="font-medium">
                                      {overtimeCalc.lemburLiburTanpaSPLJam} Jam,{' '}
                                      {overtimeCalc.lemburLiburTanpaSPL} Kali
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
                                          {normalize(
                                            record.status_lembur_spl,
                                          ) === 'tidak dengan spl' && (
                                            <div className="text-purple-600">
                                              Lembur tanpa SPL:{' '}
                                              {hitungJamLemburTanpaSPL(
                                                record,
                                              ).toFixed(1)}{' '}
                                              jam
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
