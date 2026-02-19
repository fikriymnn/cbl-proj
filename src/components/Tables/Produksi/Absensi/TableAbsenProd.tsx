import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Loading from '../../../Loading';
import ModalKosongan from '../../../Modals/Qc/NCR/NCRResponQC';
import TabPengajuanLangsung from '../../HR/Personnel/Absensi/TabPengajuanLangsung';
import Polygon6 from '../../../../images/icon/Polygon6.svg';
import convertTimeStampToDate from '../../../../utils/convertDate';

function TableAbsenProd() {
  const [isLoading, setIsLoading] = useState(false);
  const [absen, setabsen] = useState<any>();
  const [idPengaju, setIdPengaju] = useState<any>();
  const [idDepart, setIdDepart] = useState<any>();
  const [divisiBawahan, setDivisiBawahan] = useState<any>(null);
  const [hasNoDivisiBawahan, setHasNoDivisiBawahan] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const [tipeIzin, settipeIzin] = useState<any>();
  const [tipePulang, settipePulang] = useState<any>();
  const today = new Date();
  const [alasanTerlambat, setAlasanTerlambat] = useState<any>();
  const [alasanPulang, setAlasanPulang] = useState<any>();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;

  useEffect(() => {
    getMe();
  }, []);

  async function getMe() {
    const url = `${import.meta.env.VITE_API_LINK}/me`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, { withCredentials: true });
      setIsLoading(false);

      const role = res.data.role;
      const userIdDep = res.data.karyawan?.biodata_karyawan?.[0]?.id_department;
      const userIdPengaju = res.data.id_karyawan;
      const userDivisiBawahan = res.data.divisi_bawahan;

      setIdPengaju(userIdPengaju);
      setUserRole(role);

      const isSuperAdminOrDev = role === 'super admin' || role === 'developer';

      if (isSuperAdminOrDev) {
        // Super admin / developer: show all data, no filter
        setHasNoDivisiBawahan(false);
        getabsen(formattedDate, formattedDate, null, null);
        return;
      }

      // All other roles: require divisi_bawahan
      if (!userDivisiBawahan || userDivisiBawahan === '') {
        setHasNoDivisiBawahan(true);
        setIsLoading(false);
        return;
      }

      setIdDepart(userIdDep);
      setDivisiBawahan(userDivisiBawahan);
      setHasNoDivisiBawahan(false);

      getabsen(formattedDate, formattedDate, userIdDep, userDivisiBawahan);

      console.log('me', res.data);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }

  const [dateFrom, setDateFrom] = useState<any>();
  const [dateTo, setDateTo] = useState<any>();

  async function getabsen(
    dateFrom1: any,
    dateTo1: any,
    idDep: any,
    divisiBawahanParam?: any,
  ) {
    const url = `${import.meta.env.VITE_API_LINK}/hr/absensi`;
    try {
      setIsLoading(true);
      const params: any = {
        is_active: true,
        startDate: dateFrom1,
        endDate: dateTo1,
      };

      if (idDep !== null && idDep !== undefined) {
        params.idDepartment = idDep;
      }

      if (
        divisiBawahanParam !== null &&
        divisiBawahanParam !== undefined &&
        divisiBawahanParam !== ''
      ) {
        params.divisi_bawahan = divisiBawahanParam;
      }

      const res = await axios.get(url, { params, withCredentials: true });
      setIsLoading(false);
      setabsen(res.data.data);
      console.log(res.data);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }

  async function postTerlambat(
    tglAbsen: any,
    id_KKaryawan: any,
    nama: any,
    index: any,
    jamMasuk: any,
  ) {
    if (
      window.confirm(
        `Apakah Anda yakin akan mengajukan Izin untuk karyawan ${nama}`,
      )
    ) {
      const url = `${import.meta.env.VITE_API_LINK}/hr/pengajuanTerlambat`;
      try {
        setIsLoading(true);
        await axios.post(
          url,
          {
            id_karyawan: id_KKaryawan,
            id_pengaju: idPengaju,
            type_izin: tipeIzin,
            tanggal: tglAbsen,
            jam_masuk: jamMasuk,
            alasan: alasanTerlambat,
          },
          { withCredentials: true },
        );
        setIsLoading(false);
        alert('Berhasil Diajukan');
        closeAksi2(index);
        getabsen(formattedDate, formattedDate, idDepart, divisiBawahan);
      } catch (error: any) {
        setIsLoading(false);
        console.log(error);
      }
    }
  }

  async function postLemburKurang(
    catatan: any,
    type: any,
    lama: any,
    i: any,
    id: any,
    p: any,
  ) {
    if (
      window.confirm(
        `Apakah Anda yakin akan mengajukan Lembur ${type} untuk karyawan `,
      )
    ) {
      const url = `${
        import.meta.env.VITE_API_LINK
      }/hr/pengajuanLembur/tidakSesuai/${id}`;
      try {
        setIsLoading(true);
        await axios.post(
          url,
          {
            catatan_ketidaksesuaian: catatan,
            type_ketidaksesuaian: type,
            lama_lembur_absen: lama,
            id_pengaju_ketidaksesuaian: idPengaju,
            alasan_ketidaksesuaian: '',
            penanganan: p,
          },
          { withCredentials: true },
        );
        setIsLoading(false);
        alert('Berhasil Diajukan');
        closeSPL(i);
        getabsen(formattedDate, formattedDate, idDepart, divisiBawahan);
      } catch (error: any) {
        setIsLoading(false);
        console.log(error);
      }
    }
  }

  const [showEdit, setShowEdit] = useState<any>([]);
  const openEdit = (i: any) => {
    const onchangeVal: any = [...showEdit];
    onchangeVal[i] = true;
    setShowEdit(onchangeVal);
  };
  const closeEdit = (i: any) => {
    const onchangeVal: any = [...showEdit];
    onchangeVal[i] = false;
    setShowEdit(onchangeVal);
  };

  const [showAksi2, setShowAksi2] = useState<any>([]);
  const openAksi2 = (i: any) => {
    const onchangeVal: any = [...showAksi2];
    onchangeVal[i] = true;
    setShowAksi2(onchangeVal);
  };
  const closeAksi2 = (i: any) => {
    const onchangeVal: any = [...showAksi2];
    onchangeVal[i] = false;
    setShowAksi2(onchangeVal);
  };

  const [showSPL, setShowSPL] = useState<any>([]);
  const openSPL = (i: any) => {
    const onchangeVal: any = [...showSPL];
    onchangeVal[i] = true;
    setShowSPL(onchangeVal);
  };
  const closeSPL = (i: any) => {
    const onchangeVal: any = [...showSPL];
    onchangeVal[i] = false;
    setShowSPL(onchangeVal);
  };

  const [sortOrder, setSortOrder] = useState('asc');
  const handleSort = () => {
    const sortedAbsen = [...absen].sort((a, b) => {
      const waktuAMinus = new Date(a.waktu_masuk);
      const waktuBMinus = new Date(b.waktu_masuk);
      if (sortOrder === 'asc') {
        if (waktuAMinus < waktuBMinus) return -1;
        if (waktuAMinus > waktuBMinus) return 1;
      } else {
        if (waktuAMinus > waktuBMinus) return -1;
        if (waktuAMinus < waktuBMinus) return 1;
      }
      return 0;
    });
    setabsen(sortedAbsen);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTipeKaryawan, setSelectedTipeKaryawan] = useState('');
  const [selectedTipePenggajian, setSelectedTipePenggajian] = useState('');
  const [selectedDivisi, setSelectedDivisi] = useState('');

  const filteredAbsen = absen?.filter((data: any) => {
    return (
      data.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedTipeKaryawan === '' ||
        data.tipe_karyawan === selectedTipeKaryawan) &&
      (selectedTipePenggajian === '' ||
        data.tipe_penggajian === selectedTipePenggajian) &&
      (selectedDivisi === '' || data.nama_divisi === selectedDivisi)
    );
  });

  const uniqueDivisi = Array.from(
    new Set(absen?.map((data: any) => data.nama_divisi).filter(Boolean)),
  );

  async function postPulangCepat(
    tglAbsen: any,
    id_KKaryawan: any,
    name: any,
    jamKeluar: any,
  ) {
    if (
      window.confirm(
        `Apakah Anda yakin akan mengajukan Pulang Cepat untuk karyawan ${name}`,
      )
    ) {
      const url = `${import.meta.env.VITE_API_LINK}/hr/pengajuanPulangCepat`;
      try {
        setIsLoading(true);
        await axios.post(
          url,
          {
            id_karyawan: id_KKaryawan,
            id_pengaju: idPengaju,
            tanggal: tglAbsen,
            jam_pulang: jamKeluar,
            type_izin: tipePulang,
            alasan: alasanPulang,
          },
          { withCredentials: true },
        );
        setIsLoading(false);
        window.location.reload();
      } catch (error: any) {
        setIsLoading(false);
        console.log(error);
      }
    }
  }

  // ─── No Divisi Bawahan State ───────────────────────────────────────────────
  if (hasNoDivisiBawahan) {
    return (
      <main className="">
        {isLoading && <Loading />}
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
              Data Absensi Produksi
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
      </main>
    );
  }

  return (
    <>
      <main className="">
        {isLoading && <Loading />}

        {/* ─── Filter Section ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden mb-4">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 sm:p-4">
            <h2 className="text-white text-base sm:text-lg md:text-xl font-bold flex items-center">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 mr-2 flex-shrink-0"
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
              <span>Filter Data Absensi</span>
            </h2>
          </div>

          <div className="p-3 sm:p-4 md:p-6">
            {/* Date Selection */}
            <div className="mb-4 sm:mb-6">
              <h3 className="text-sm sm:text-base font-semibold text-blue-600 mb-3 sm:mb-4">
                Pilih Tanggal
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs sm:text-sm text-gray-600 font-medium">
                    Dari:
                  </label>
                  <input
                    className="w-full rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 sm:py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                    type="date"
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs sm:text-sm text-gray-600 font-medium">
                    Sampai:
                  </label>
                  <input
                    className="w-full rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 sm:py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                    type="date"
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Search & Filter */}
            <div className="mb-4 sm:mb-6">
              <h3 className="text-sm sm:text-base font-semibold text-blue-600 mb-3 sm:mb-4">
                Cari & Filter Karyawan
              </h3>

              <div className="mb-4">
                <label className="block text-xs sm:text-sm text-gray-600 font-medium mb-2">
                  Nama Karyawan
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama karyawan..."
                    className="w-full rounded-lg bg-blue-50 border border-blue-200 py-2 sm:py-2.5 pl-10 pr-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm text-gray-600 font-medium mb-2">
                    Tipe Karyawan
                  </label>
                  <select
                    className="w-full rounded-lg bg-blue-50 border border-blue-200 py-2 sm:py-2.5 px-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all cursor-pointer"
                    value={selectedTipeKaryawan}
                    onChange={(e) => setSelectedTipeKaryawan(e.target.value)}
                  >
                    <option value="">Semua Tipe</option>
                    <option value="staff">Staff</option>
                    <option value="produksi">Produksi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm text-gray-600 font-medium mb-2">
                    Tipe Penggajian
                  </label>
                  <select
                    className="w-full rounded-lg bg-blue-50 border border-blue-200 py-2 sm:py-2.5 px-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all cursor-pointer"
                    value={selectedTipePenggajian}
                    onChange={(e) => setSelectedTipePenggajian(e.target.value)}
                  >
                    <option value="">Semua Tipe</option>
                    <option value="mingguan">Mingguan</option>
                    <option value="bulanan">Bulanan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm text-gray-600 font-medium mb-2">
                    Divisi
                  </label>
                  <select
                    className="w-full rounded-lg bg-blue-50 border border-blue-200 py-2 sm:py-2.5 px-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all cursor-pointer"
                    value={selectedDivisi}
                    onChange={(e) => setSelectedDivisi(e.target.value)}
                  >
                    <option value="">Semua Divisi</option>
                    {uniqueDivisi.map((divisi: any, index: number) => (
                      <option key={index} value={divisi}>
                        {divisi}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              <button
                onClick={() =>
                  getabsen(dateFrom, dateTo, idDepart, divisiBawahan)
                }
                disabled={!dateFrom || !dateTo}
                className={`flex-1 sm:flex-none rounded-lg px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white transition-all ${
                  !dateFrom || !dateTo
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md'
                }`}
              >
                Tampilkan Data
              </button>

              <button
                onClick={() =>
                  getabsen(
                    formattedDate,
                    formattedDate,
                    idDepart,
                    divisiBawahan,
                  )
                }
                className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 hover:shadow-md transition-all rounded-lg px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white"
              >
                Data Hari Ini
              </button>

              <button
                className="flex-1 sm:flex-none sm:ml-auto bg-red-500 hover:bg-red-600 hover:shadow-md transition-all rounded-lg px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTipeKaryawan('');
                  setSelectedTipePenggajian('');
                  setSelectedDivisi('');
                }}
              >
                Reset Filter
              </button>
            </div>
          </div>
        </div>

        {/* ─── Table Section (Desktop) ─────────────────────────────────────────── */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-teal-600 p-3 sm:p-4">
            <h3 className="text-white text-base sm:text-lg md:text-xl font-bold flex items-center">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 mr-2 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
              Data Absensi Produksi
            </h3>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto max-h-[600px] sm:max-h-[700px] overflow-y-auto">
            <table className="w-full text-xs sm:text-sm min-w-[900px]">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="p-2 sm:p-3 text-left text-xs font-semibold text-gray-600">
                    No.
                  </th>
                  <th className="p-2 sm:p-3 text-left text-xs font-semibold text-gray-600">
                    Nama
                  </th>
                  <th className="p-2 sm:p-3 text-left text-xs font-semibold text-gray-600">
                    Bagian Mesin
                  </th>
                  <th className="p-2 sm:p-3 text-left text-xs font-semibold text-gray-600">
                    Dept/Divisi
                  </th>
                  <th className="p-2 sm:p-3 text-center text-xs font-semibold text-gray-600">
                    Tanggal
                  </th>
                  <th className="p-2 sm:p-3 text-left text-xs font-semibold text-gray-600">
                    <div className="flex gap-2 items-center">
                      <p>Waktu</p>
                      <img
                        className="w-2 hover:cursor-pointer"
                        onClick={handleSort}
                        src={Polygon6}
                        alt="Sort"
                      />
                    </div>
                  </th>
                  <th className="p-2 sm:p-3 text-left text-xs font-semibold text-gray-600">
                    Shift
                  </th>
                  <th className="p-2 sm:p-3 text-left text-xs font-semibold text-gray-600">
                    Lembur (Jam)
                  </th>
                  <th className="p-2 sm:p-3 text-left text-xs font-semibold text-gray-600">
                    Terlambat
                  </th>
                  <th className="p-2 sm:p-3 text-left text-xs font-semibold text-gray-600">
                    Status Absen
                  </th>
                  <th className="p-2 sm:p-3 text-left text-xs font-semibold text-gray-600">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAbsen?.map((data: any, i: any) => {
                  let tipe_lembur = null;
                  let catatan_ketidaksesuaian = null;

                  if ((data.jam_lembur ?? 0) < (data.jam_lembur_spl ?? 0)) {
                    tipe_lembur = 'kurang';
                    catatan_ketidaksesuaian = 'Jam Lembur Kurang Dari SPL ';
                  } else if (
                    (data.jam_lembur ?? 0) > (data.jam_lembur_spl ?? 0)
                  ) {
                    tipe_lembur = 'lebih';
                    catatan_ketidaksesuaian = 'Jam Lembur Lebih Dari SPL ';
                  }

                  const getRowBackground = () => {
                    switch (data.status_absen) {
                      case 'cuti khusus':
                        return 'bg-orange-50';
                      case 'sakit':
                        return 'bg-green-50';
                      case 'izin':
                        return 'bg-blue-50';
                      case 'Belum Masuk':
                        return 'bg-red-200';
                      case 'cuti tahunan':
                        return 'bg-yellow-50';
                      default:
                        return '';
                    }
                  };
                  const bagianMesin =
                    data.bagian_mesin?.[0]?.nama_bagian_mesin || '-';
                  return (
                    <tr key={i} className={`border-b ${getRowBackground()}`}>
                      <td className="p-2 sm:p-3 text-xs text-neutral-600 font-semibold">
                        {i + 1}
                      </td>
                      <td className="p-2 sm:p-3 text-xs font-semibold text-neutral-800">
                        {data.name}
                      </td>
                      <td className="p-2 sm:p-3 text-xs text-green-600">
                        {bagianMesin}
                      </td>
                      <td className="p-2 sm:p-3 text-xs">
                        <div className="flex flex-col">
                          <span className="max-w-[120px]">
                            {data.nama_department}
                          </span>
                          <span className="text-blue-500 max-w-[120px]">
                            {data.nama_divisi}
                          </span>
                        </div>
                      </td>
                      <td className="p-2 sm:p-3 text-xs text-neutral-600 text-center">
                        {data.hari}, {data.tgl_masuk}
                        {data.jenis_hari_masuk == 'Biasa' ||
                        data.jenis_hari_masuk == null
                          ? ''
                          : '- L'}
                      </td>
                      <td className="p-2 sm:p-3 text-xs">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-neutral-600 font-semibold">
                            Masuk:{' '}
                            {data.jam_masuk == null || data.jam_masuk == 0
                              ? ' ~'
                              : data.jam_masuk}
                          </span>
                          <span className="text-neutral-600 font-semibold">
                            Keluar:{' '}
                            {data.jam_keluar == null || data.jam_keluar == 0
                              ? ' ~'
                              : data.jam_keluar}
                          </span>
                        </div>
                      </td>
                      <td className="p-2 sm:p-3 text-xs text-neutral-600 font-semibold">
                        {data.shift == null || data.shift == 0
                          ? ' ~'
                          : data.shift}
                      </td>
                      <td className="p-2 sm:p-3 text-xs">
                        <div className="flex flex-col gap-0.5">
                          <span
                            className={`uppercase text-xs font-semibold ${
                              data.status_ketidaksesuaian == 'incoming'
                                ? 'text-blue-500'
                                : 'text-black'
                            }`}
                          >
                            {data.status_ketidaksesuaian == 'incoming'
                              ? 'Sudah Diajukan'
                              : data.status_ketidaksesuaian == null ||
                                data.status_ketidaksesuaian == 0 ||
                                (data.status_ketidaksesuaian == 'none' &&
                                  data.status_lembur_spl == 'dengan SPL' &&
                                  data.jam_lembur == data.jam_lembur_spl)
                              ? ''
                              : data.status_ketidaksesuaian == 'none' &&
                                data.status_lembur_spl == 'dengan SPL' &&
                                data.jam_lembur != data.jam_lembur_spl
                              ? 'Belum Diajukan'
                              : ''}
                          </span>
                          {(data.status_ketidaksesuaian == 'Sesuai spl' ||
                            data.status_ketidaksesuaian == 'Sesuai absen') && (
                            <span className="uppercase text-xs font-semibold text-green-500">
                              {data.status_ketidaksesuaian}
                            </span>
                          )}
                          <span className="font-medium text-purple-600">
                            {data.jam_lembur > 0
                              ? `${data.jam_lembur} Jam`
                              : '~'}
                          </span>
                          {data.jam_lembur_spl > 0 && (
                            <span className="text-[10px] text-blue-500">
                              SPL: {data.jam_lembur_spl} Jam
                            </span>
                          )}
                          {data.status_lembur && (
                            <span className="text-[10px] text-gray-500">
                              {data.status_lembur}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-2 sm:p-3 text-xs">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-neutral-600 font-semibold">
                            {data.status_masuk}
                          </span>
                          <span className="text-neutral-600 font-semibold">
                            {data.menit_terlambat == null ||
                            data.menit_terlambat == 0
                              ? '~'
                              : '~ ' + data.menit_terlambat + ' JAM'}
                          </span>
                        </div>
                      </td>
                      <td className="p-2 sm:p-3 text-xs text-neutral-600 font-semibold">
                        {data.status_absen}
                      </td>
                      <td className="p-2 sm:p-3">
                        <div className="flex flex-col gap-1.5">
                          {data.status_lembur_spl == 'dengan SPL' &&
                          (data.status_ketidaksesuaian == 'none' ||
                            data.status_ketidaksesuaian == 'rejected') &&
                          data.jam_lembur != data.jam_lembur_spl ? (
                            <>
                              <button
                                onClick={() => openSPL(i)}
                                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white text-xs py-1.5 px-2 rounded-md transition-colors"
                              >
                                SPL
                              </button>
                              {showSPL[i] == true && (
                                <ModalKosongan
                                  isOpen={showSPL[i]}
                                  onClose={() => closeSPL(i)}
                                  judul={'Lapor Ketidaksesuaian SPL'}
                                >
                                  <>
                                    <div className="bg-white">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-7 py-4">
                                        <div className="flex flex-col gap-1">
                                          <label className="text-[#6c6b6b] text-sm font-semibold">
                                            Nama
                                          </label>
                                          <label className="text-[#6c6b6b] text-sm">
                                            {data.name}
                                          </label>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                          <label className="text-[#6c6b6b] text-sm font-semibold">
                                            Tipe Ketidaksesuaian
                                          </label>
                                          <label className="text-[#6c6b6b] text-sm uppercase">
                                            {tipe_lembur}
                                          </label>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                          <label className="text-[#6c6b6b] text-sm font-semibold">
                                            Selisih Jam
                                          </label>
                                          <div className="flex gap-1 justify-between w-full md:w-[50%]">
                                            <div className="flex flex-col">
                                              <label className="text-[#6c6b6b] text-sm">
                                                Jam Lembur SPL
                                              </label>
                                              <label className="text-[#6c6b6b] text-sm">
                                                Jam Lembur
                                              </label>
                                            </div>
                                            <div className="flex flex-col">
                                              <label className="text-[#6c6b6b] text-sm">
                                                : {data.jam_lembur_spl} Jam
                                              </label>
                                              <label className="text-[#6c6b6b] text-sm">
                                                : {data.jam_lembur} Jam
                                              </label>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                          <label className="text-[#6c6b6b] text-sm font-semibold">
                                            Alasan Lembur
                                          </label>
                                          <label className="text-[#6c6b6b] text-sm">
                                            {catatan_ketidaksesuaian}
                                          </label>
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-7 py-4">
                                        <div className="flex flex-col gap-3">
                                          <label className="text-[#6c6b6b] text-sm font-semibold">
                                            Tanggal
                                          </label>
                                          <label className="text-[#6c6b6b] text-sm">
                                            {convertTimeStampToDate(
                                              data.waktu_masuk,
                                            )}
                                          </label>
                                        </div>
                                      </div>
                                      <div className="flex w-full justify-end items-end px-7 py-4">
                                        <div className="flex flex-col sm:flex-row gap-2 w-full px-4 pt-1">
                                          <button
                                            disabled={isLoading}
                                            onClick={() =>
                                              postLemburKurang(
                                                catatan_ketidaksesuaian,
                                                tipe_lembur,
                                                data.jam_lembur,
                                                i,
                                                data.id_pengajuan_lembur,
                                                1,
                                              )
                                            }
                                            className="bg-green-500 hover:bg-green-600 w-full sm:w-[50%] rounded-md px-3 py-3 text-white font-semibold text-sm transition-colors disabled:opacity-50"
                                          >
                                            SESUAI ABSEN
                                          </button>
                                          <button
                                            disabled={isLoading}
                                            onClick={() =>
                                              postLemburKurang(
                                                catatan_ketidaksesuaian,
                                                tipe_lembur,
                                                data.jam_lembur,
                                                i,
                                                data.id_pengajuan_lembur,
                                                0,
                                              )
                                            }
                                            className="bg-red-500 hover:bg-red-600 w-full sm:w-[50%] rounded-md px-3 py-3 text-white font-semibold text-sm transition-colors disabled:opacity-50"
                                          >
                                            SESUAI SPL
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </>
                                </ModalKosongan>
                              )}
                            </>
                          ) : (
                            <></>
                          )}

                          {data.status_masuk == 'Terlambat ' ? (
                            <>
                              <button
                                onClick={() => openAksi2(i)}
                                className="w-full bg-green-600 hover:bg-green-700 text-white text-xs py-1.5 px-2 rounded-md transition-colors"
                              >
                                Izin
                              </button>
                              {showAksi2[i] == true && (
                                <ModalKosongan
                                  isOpen={showAksi2[i]}
                                  onClose={() => closeAksi2(i)}
                                  judul={'Lapor Izin'}
                                >
                                  <>
                                    <div className="bg-white">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-7 py-4">
                                        <div className="flex flex-col gap-1">
                                          <label className="text-[#6c6b6b] text-sm font-semibold">
                                            Nama
                                          </label>
                                          <label className="text-[#6c6b6b] text-sm">
                                            {data.name}
                                          </label>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                          <label className="text-[#6c6b6b] text-sm font-semibold">
                                            Jam Masuk
                                          </label>
                                          <label className="text-[#6c6b6b] text-sm">
                                            {data.jam_masuk}
                                          </label>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                          <label className="text-[#6c6b6b] text-sm font-semibold">
                                            Tipe Izin
                                          </label>
                                          <select
                                            onChange={(e) =>
                                              settipeIzin(e.target.value)
                                            }
                                            className="text-[#6c6b6b] h-8 text-sm border-2 border-stroke rounded-md"
                                          >
                                            <option selected disabled>
                                              Pilih Tipe Izin
                                            </option>
                                            <option value={'dinas'}>
                                              Dinas
                                            </option>
                                            <option value={'pribadi'}>
                                              Pribadi
                                            </option>
                                          </select>
                                        </div>
                                      </div>
                                      <div className="flex flex-col gap-1 px-7 py-4">
                                        <label className="text-[#6c6b6b] text-sm font-semibold">
                                          Alasan
                                        </label>
                                        <textarea
                                          onChange={(e) =>
                                            setAlasanTerlambat(e.target.value)
                                          }
                                          className="text-[#6c6b6b] h-16 text-sm border-2 border-stroke rounded-md p-2"
                                          placeholder="Masukkan alasan ..."
                                        />
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-7 py-4">
                                        <div className="flex flex-col gap-3">
                                          <label className="text-[#6c6b6b] text-sm font-semibold">
                                            Tanggal
                                          </label>
                                          <label className="text-[#6c6b6b] text-sm">
                                            {convertTimeStampToDate(
                                              data.tgl_masuk,
                                            )}
                                          </label>
                                        </div>
                                      </div>
                                      <div className="flex w-full justify-end items-end px-7 py-4">
                                        {tipeIzin == null ||
                                        alasanTerlambat == null ||
                                        alasanTerlambat.trim() === '' ? (
                                          <></>
                                        ) : (
                                          <button
                                            onClick={() => {
                                              postTerlambat(
                                                data.tgl_absen,
                                                data.userid,
                                                data.name,
                                                i,
                                                data.jam_masuk,
                                              );
                                            }}
                                            disabled={isLoading}
                                            className="flex px-4 py-2 justify-center items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors disabled:opacity-50"
                                          >
                                            AJUKAN
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </>
                                </ModalKosongan>
                              )}
                            </>
                          ) : (
                            <></>
                          )}

                          {data.status_absen == 'Belum Masuk' ? (
                            <>
                              <button
                                onClick={() => openEdit(i)}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-1.5 px-2 rounded-md transition-colors"
                              >
                                Aksi
                              </button>
                              {showEdit[i] == true && (
                                <ModalKosongan
                                  isOpen={showEdit[i]}
                                  onClose={() => closeEdit(i)}
                                  judul={'Lapor'}
                                >
                                  <>
                                    <TabPengajuanLangsung data={data} />
                                  </>
                                </ModalKosongan>
                              )}
                            </>
                          ) : (
                            <></>
                          )}

                          {data.status_keluar == 'Pulang Cepat' ? (
                            <>
                              <button
                                onClick={() => openEdit(i)}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-1.5 px-2 rounded-md transition-colors"
                              >
                                Pulang Cepat
                              </button>
                              {showEdit[i] == true && (
                                <ModalKosongan
                                  isOpen={showEdit[i]}
                                  onClose={() => closeEdit(i)}
                                  judul={'Lapor Pulang Cepat'}
                                >
                                  <>
                                    <div className="bg-white">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-7 py-4">
                                        <div className="flex flex-col gap-1">
                                          <label className="text-[#6c6b6b] text-sm font-semibold">
                                            Nama
                                          </label>
                                          <label className="text-[#6c6b6b] text-sm">
                                            {data.name}
                                          </label>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                          <label className="text-[#6c6b6b] text-sm font-semibold">
                                            Department
                                          </label>
                                          <label className="text-[#6c6b6b] text-sm">
                                            {data.nama_department}
                                          </label>
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-7 py-4">
                                        <div className="flex flex-col gap-1">
                                          <label className="text-[#6c6b6b] text-sm font-semibold">
                                            Tanggal
                                          </label>
                                          <label className="text-[#6c6b6b] text-sm">
                                            {data.tgl_masuk}
                                          </label>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                          <label className="text-[#6c6b6b] text-sm font-semibold">
                                            Jam Keluar
                                          </label>
                                          <label className="text-[#6c6b6b] text-sm">
                                            {data.jam_keluar == null ||
                                            data.jam_keluar == 0
                                              ? '~'
                                              : data.jam_keluar}
                                          </label>
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-7 py-4">
                                        <div className="flex flex-col gap-1">
                                          <label className="text-[#6c6b6b] text-sm font-semibold">
                                            Status Keluar
                                          </label>
                                          <label className="text-[#6c6b6b] text-sm text-orange-600 font-semibold">
                                            {data.status_keluar}
                                          </label>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                          <label className="text-[#6c6b6b] text-sm font-semibold">
                                            Shift
                                          </label>
                                          <label className="text-[#6c6b6b] text-sm">
                                            {data.shift == null ||
                                            data.shift == 0
                                              ? '~'
                                              : data.shift}
                                          </label>
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-7 py-4">
                                        <div className="flex flex-col gap-1">
                                          <label className="text-[#6c6b6b] text-sm font-semibold">
                                            Tipe Izin
                                          </label>
                                          <select
                                            onChange={(e) =>
                                              settipePulang(e.target.value)
                                            }
                                            className="text-[#6c6b6b] h-8 text-sm border-2 border-stroke rounded-md"
                                          >
                                            <option selected disabled>
                                              Pilih Tipe Izin
                                            </option>
                                            <option value={'dinas'}>
                                              Dinas
                                            </option>
                                            <option value={'pribadi'}>
                                              Pribadi
                                            </option>
                                          </select>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                          <label className="text-[#6c6b6b] text-sm font-semibold">
                                            Alasan Pulang Cepat
                                          </label>
                                          <textarea
                                            onChange={(e) =>
                                              setAlasanPulang(e.target.value)
                                            }
                                            className="text-[#6c6b6b] h-8 text-sm border-2 border-stroke rounded-md p-2"
                                          />
                                        </div>
                                      </div>
                                      <div className="px-7 py-4">
                                        <div className="flex flex-col gap-1">
                                          <label className="text-[#6c6b6b] text-sm font-semibold">
                                            Keterangan
                                          </label>
                                          <p className="text-[#6c6b6b] text-sm">
                                            Karyawan pulang lebih cepat dari
                                            jadwal yang ditentukan. Apakah Anda
                                            ingin mengajukan laporan pulang
                                            cepat untuk karyawan ini?
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex w-full justify-end items-end gap-3 px-7 py-4">
                                        <button
                                          onClick={() => closeEdit(i)}
                                          className="flex px-4 py-2 justify-center items-center bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-md transition-colors"
                                        >
                                          BATAL
                                        </button>
                                        <button
                                          onClick={() => {
                                            postPulangCepat(
                                              data.tgl_absen,
                                              data.userid,
                                              data.name,
                                              data.jam_keluar,
                                            );
                                          }}
                                          disabled={isLoading}
                                          className="flex px-4 py-2 justify-center items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md disabled:opacity-50 transition-colors"
                                        >
                                          {isLoading
                                            ? 'MEMPROSES...'
                                            : 'AJUKAN'}
                                        </button>
                                      </div>
                                    </div>
                                  </>
                                </ModalKosongan>
                              )}
                            </>
                          ) : (
                            <></>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {(!filteredAbsen || filteredAbsen.length === 0) && (
              <div className="p-8 text-center text-gray-500">
                <svg
                  className="w-16 h-16 mx-auto text-gray-400 mb-4"
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
                <p className="text-gray-500 text-lg font-medium">
                  Tidak ada data absensi yang ditemukan
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Silakan pilih tanggal atau ubah filter pencarian
                </p>
              </div>
            )}
          </div>

          {/* ─── Mobile Card View ─────────────────────────────────────────────── */}
          <div className="lg:hidden">
            <div className="space-y-4 p-3 sm:p-4">
              {filteredAbsen?.map((data: any, i: any) => {
                let tipe_lembur = null;
                let catatan_ketidaksesuaian = null;

                if ((data.jam_lembur ?? 0) < (data.jam_lembur_spl ?? 0)) {
                  tipe_lembur = 'kurang';
                  catatan_ketidaksesuaian = 'Jam Lembur Kurang Dari SPL ';
                } else if (
                  (data.jam_lembur ?? 0) > (data.jam_lembur_spl ?? 0)
                ) {
                  tipe_lembur = 'lebih';
                  catatan_ketidaksesuaian = 'Jam Lembur Lebih Dari SPL ';
                }

                const getCardBackground = () => {
                  switch (data.status_absen) {
                    case 'cuti khusus':
                      return 'bg-orange-50 border-orange-300';
                    case 'sakit':
                      return 'bg-green-50 border-green-300';
                    case 'izin':
                      return 'bg-blue-50 border-blue-300';
                    case 'Belum Masuk':
                      return 'bg-red-50 border-red-300';
                    case 'cuti tahunan':
                      return 'bg-yellow-50 border-yellow-300';
                    default:
                      return 'bg-white border-gray-200';
                  }
                };

                return (
                  <div
                    key={i}
                    className={`rounded-lg border-2 shadow-sm overflow-hidden ${getCardBackground()}`}
                  >
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-white font-semibold text-base">
                            {i + 1}. {data.name}
                          </p>
                          <p className="text-blue-100 text-xs mt-1">
                            {data.nama_department} - {data.nama_divisi}
                          </p>
                        </div>
                        <span className="bg-white text-blue-600 text-xs font-semibold px-2 py-1 rounded-full">
                          {data.shift || '~'}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 space-y-3">
                      <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Tanggal</p>
                          <p className="text-sm font-semibold text-gray-700">
                            {data.hari}, {data.tgl_masuk}
                            {data.jenis_hari_masuk == 'Biasa' ||
                            data.jenis_hari_masuk == null
                              ? ''
                              : ' - L'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 mb-1">Status</p>
                          <span className="inline-block text-xs font-semibold px-2 py-1 rounded bg-gray-200 text-gray-700">
                            {data.status_absen}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Jam Masuk
                          </p>
                          <p className="text-sm font-semibold text-gray-700">
                            {data.jam_masuk == null || data.jam_masuk == 0
                              ? '~'
                              : data.jam_masuk}
                          </p>
                          {data.status_masuk && (
                            <p className="text-xs text-orange-600 font-medium mt-1">
                              {data.status_masuk}
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Jam Keluar
                          </p>
                          <p className="text-sm font-semibold text-gray-700">
                            {data.jam_keluar == null || data.jam_keluar == 0
                              ? '~'
                              : data.jam_keluar}
                          </p>
                          {data.status_keluar && (
                            <p className="text-xs text-orange-600 font-medium mt-1">
                              {data.status_keluar}
                            </p>
                          )}
                        </div>
                      </div>

                      {(data.status_lembur || data.jam_lembur) && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">
                            Informasi Lembur
                          </p>
                          <div className="space-y-1">
                            {data.status_ketidaksesuaian == 'incoming' && (
                              <span className="text-xs font-semibold text-blue-500 block">
                                SUDAH DIAJUKAN
                              </span>
                            )}
                            {(data.status_ketidaksesuaian == 'Sesuai spl' ||
                              data.status_ketidaksesuaian ==
                                'Sesuai absen') && (
                              <span className="text-xs font-semibold text-green-500 uppercase block">
                                {data.status_ketidaksesuaian}
                              </span>
                            )}
                            {data.status_ketidaksesuaian == 'none' &&
                              data.status_lembur_spl == 'dengan SPL' &&
                              data.jam_lembur != data.jam_lembur_spl && (
                                <span className="text-xs font-semibold text-red-500 block">
                                  BELUM DIAJUKAN
                                </span>
                              )}
                            <p className="text-sm font-medium text-purple-600">
                              {data.jam_lembur > 0
                                ? `${data.jam_lembur} Jam`
                                : '~'}
                            </p>
                          </div>
                        </div>
                      )}

                      {data.menit_terlambat != null &&
                        data.menit_terlambat != 0 && (
                          <div className="bg-red-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">
                              Terlambat
                            </p>
                            <p className="text-sm font-semibold text-red-600">
                              {data.menit_terlambat} Jam
                            </p>
                          </div>
                        )}

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {data.status_lembur_spl == 'dengan SPL' &&
                        (data.status_ketidaksesuaian == 'none' ||
                          data.status_ketidaksesuaian == 'rejected') &&
                        data.jam_lembur != data.jam_lembur_spl ? (
                          <>
                            <button
                              onClick={() => openSPL(i)}
                              className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm py-2 px-3 rounded-lg transition-colors font-medium"
                            >
                              SPL
                            </button>
                            {showSPL[i] == true && (
                              <ModalKosongan
                                isOpen={showSPL[i]}
                                onClose={() => closeSPL(i)}
                                judul={'Lapor Ketidaksesuaian SPL'}
                              >
                                <>
                                  <div className="bg-white">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-4 md:px-7 py-4">
                                      <div className="flex flex-col gap-1">
                                        <label className="text-[#6c6b6b] text-sm font-semibold">
                                          Nama
                                        </label>
                                        <label className="text-[#6c6b6b] text-sm">
                                          {data.name}
                                        </label>
                                      </div>
                                      <div className="flex flex-col gap-1">
                                        <label className="text-[#6c6b6b] text-sm font-semibold">
                                          Tipe Ketidaksesuaian
                                        </label>
                                        <label className="text-[#6c6b6b] text-sm uppercase">
                                          {tipe_lembur}
                                        </label>
                                      </div>
                                      <div className="flex flex-col gap-1">
                                        <label className="text-[#6c6b6b] text-sm font-semibold">
                                          Selisih Jam
                                        </label>
                                        <div className="flex gap-1 justify-between w-full">
                                          <div className="flex flex-col">
                                            <label className="text-[#6c6b6b] text-sm">
                                              Jam Lembur SPL
                                            </label>
                                            <label className="text-[#6c6b6b] text-sm">
                                              Jam Lembur
                                            </label>
                                          </div>
                                          <div className="flex flex-col">
                                            <label className="text-[#6c6b6b] text-sm">
                                              : {data.jam_lembur_spl} Jam
                                            </label>
                                            <label className="text-[#6c6b6b] text-sm">
                                              : {data.jam_lembur} Jam
                                            </label>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex flex-col gap-1">
                                        <label className="text-[#6c6b6b] text-sm font-semibold">
                                          Alasan Lembur
                                        </label>
                                        <label className="text-[#6c6b6b] text-sm">
                                          {catatan_ketidaksesuaian}
                                        </label>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-4 md:px-7 py-4">
                                      <div className="flex flex-col gap-3">
                                        <label className="text-[#6c6b6b] text-sm font-semibold">
                                          Tanggal
                                        </label>
                                        <label className="text-[#6c6b6b] text-sm">
                                          {convertTimeStampToDate(
                                            data.waktu_masuk,
                                          )}
                                        </label>
                                      </div>
                                    </div>
                                    <div className="flex w-full justify-end items-end px-4 md:px-7 py-4">
                                      <div className="flex flex-col sm:flex-row gap-2 w-full">
                                        <button
                                          disabled={isLoading}
                                          onClick={() =>
                                            postLemburKurang(
                                              catatan_ketidaksesuaian,
                                              tipe_lembur,
                                              data.jam_lembur,
                                              i,
                                              data.id_pengajuan_lembur,
                                              1,
                                            )
                                          }
                                          className="bg-green-500 hover:bg-green-600 w-full sm:w-[50%] rounded-md px-3 py-3 text-white font-semibold text-sm transition-colors disabled:opacity-50"
                                        >
                                          SESUAI ABSEN
                                        </button>
                                        <button
                                          disabled={isLoading}
                                          onClick={() =>
                                            postLemburKurang(
                                              catatan_ketidaksesuaian,
                                              tipe_lembur,
                                              data.jam_lembur,
                                              i,
                                              data.id_pengajuan_lembur,
                                              0,
                                            )
                                          }
                                          className="bg-red-500 hover:bg-red-600 w-full sm:w-[50%] rounded-md px-3 py-3 text-white font-semibold text-sm transition-colors disabled:opacity-50"
                                        >
                                          SESUAI SPL
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </>
                              </ModalKosongan>
                            )}
                          </>
                        ) : null}

                        {data.status_masuk == 'Terlambat ' ? (
                          <>
                            <button
                              onClick={() => openAksi2(i)}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2 px-3 rounded-lg transition-colors font-medium"
                            >
                              Izin
                            </button>
                            {showAksi2[i] == true && (
                              <ModalKosongan
                                isOpen={showAksi2[i]}
                                onClose={() => closeAksi2(i)}
                                judul={'Lapor Izin'}
                              >
                                <>
                                  <div className="bg-white">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-4 md:px-7 py-4">
                                      <div className="flex flex-col gap-1">
                                        <label className="text-[#6c6b6b] text-sm font-semibold">
                                          Nama
                                        </label>
                                        <label className="text-[#6c6b6b] text-sm">
                                          {data.name}
                                        </label>
                                      </div>
                                      <div className="flex flex-col gap-1">
                                        <label className="text-[#6c6b6b] text-sm font-semibold">
                                          Jam Masuk
                                        </label>
                                        <label className="text-[#6c6b6b] text-sm">
                                          {data.jam_masuk}
                                        </label>
                                      </div>
                                      <div className="flex flex-col gap-1">
                                        <label className="text-[#6c6b6b] text-sm font-semibold">
                                          Tipe Izin
                                        </label>
                                        <select
                                          onChange={(e) =>
                                            settipeIzin(e.target.value)
                                          }
                                          className="text-[#6c6b6b] h-10 text-sm border-2 border-stroke rounded-md px-2"
                                        >
                                          <option selected disabled>
                                            Pilih Tipe Izin
                                          </option>
                                          <option value={'dinas'}>Dinas</option>
                                          <option value={'pribadi'}>
                                            Pribadi
                                          </option>
                                        </select>
                                      </div>
                                    </div>
                                    <div className="flex flex-col gap-1 px-4 md:px-7 py-4">
                                      <label className="text-[#6c6b6b] text-sm font-semibold">
                                        Alasan
                                      </label>
                                      <textarea
                                        onChange={(e) =>
                                          setAlasanTerlambat(e.target.value)
                                        }
                                        className="text-[#6c6b6b] h-20 text-sm border-2 border-stroke rounded-md p-2"
                                        placeholder="Masukkan alasan ..."
                                      />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-4 md:px-7 py-4">
                                      <div className="flex flex-col gap-3">
                                        <label className="text-[#6c6b6b] text-sm font-semibold">
                                          Tanggal
                                        </label>
                                        <label className="text-[#6c6b6b] text-sm">
                                          {convertTimeStampToDate(
                                            data.tgl_masuk,
                                          )}
                                        </label>
                                      </div>
                                    </div>
                                    <div className="flex w-full justify-end items-end px-4 md:px-7 py-4">
                                      {tipeIzin == null ||
                                      alasanTerlambat == null ||
                                      alasanTerlambat.trim() === '' ? null : (
                                        <button
                                          onClick={() => {
                                            postTerlambat(
                                              data.tgl_absen,
                                              data.userid,
                                              data.name,
                                              i,
                                              data.jam_masuk,
                                            );
                                          }}
                                          disabled={isLoading}
                                          className="flex px-6 py-2 justify-center items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors disabled:opacity-50"
                                        >
                                          AJUKAN
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </>
                              </ModalKosongan>
                            )}
                          </>
                        ) : null}

                        {data.status_absen == 'Belum Masuk' ? (
                          <>
                            <button
                              onClick={() => openEdit(i)}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded-lg transition-colors font-medium"
                            >
                              Aksi
                            </button>
                            {showEdit[i] == true && (
                              <ModalKosongan
                                isOpen={showEdit[i]}
                                onClose={() => closeEdit(i)}
                                judul={'Lapor'}
                              >
                                <>
                                  <TabPengajuanLangsung data={data} />
                                </>
                              </ModalKosongan>
                            )}
                          </>
                        ) : null}

                        {data.status_keluar == 'Pulang Cepat' ? (
                          <>
                            <button
                              onClick={() => openEdit(i)}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded-lg transition-colors font-medium"
                            >
                              Pulang Cepat
                            </button>
                            {showEdit[i] == true && (
                              <ModalKosongan
                                isOpen={showEdit[i]}
                                onClose={() => closeEdit(i)}
                                judul={'Lapor Pulang Cepat'}
                              >
                                <>
                                  <div className="bg-white">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-4 md:px-7 py-4">
                                      <div className="flex flex-col gap-1">
                                        <label className="text-[#6c6b6b] text-sm font-semibold">
                                          Nama
                                        </label>
                                        <label className="text-[#6c6b6b] text-sm">
                                          {data.name}
                                        </label>
                                      </div>
                                      <div className="flex flex-col gap-1">
                                        <label className="text-[#6c6b6b] text-sm font-semibold">
                                          Department
                                        </label>
                                        <label className="text-[#6c6b6b] text-sm">
                                          {data.nama_department}
                                        </label>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-4 md:px-7 py-4">
                                      <div className="flex flex-col gap-1">
                                        <label className="text-[#6c6b6b] text-sm font-semibold">
                                          Tanggal
                                        </label>
                                        <label className="text-[#6c6b6b] text-sm">
                                          {data.tgl_masuk}
                                        </label>
                                      </div>
                                      <div className="flex flex-col gap-1">
                                        <label className="text-[#6c6b6b] text-sm font-semibold">
                                          Jam Keluar
                                        </label>
                                        <label className="text-[#6c6b6b] text-sm">
                                          {data.jam_keluar == null ||
                                          data.jam_keluar == 0
                                            ? '~'
                                            : data.jam_keluar}
                                        </label>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-4 md:px-7 py-4">
                                      <div className="flex flex-col gap-1">
                                        <label className="text-[#6c6b6b] text-sm font-semibold">
                                          Status Keluar
                                        </label>
                                        <label className="text-[#6c6b6b] text-sm text-orange-600 font-semibold">
                                          {data.status_keluar}
                                        </label>
                                      </div>
                                      <div className="flex flex-col gap-1">
                                        <label className="text-[#6c6b6b] text-sm font-semibold">
                                          Shift
                                        </label>
                                        <label className="text-[#6c6b6b] text-sm">
                                          {data.shift == null || data.shift == 0
                                            ? '~'
                                            : data.shift}
                                        </label>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-4 md:px-7 py-4">
                                      <div className="flex flex-col gap-1">
                                        <label className="text-[#6c6b6b] text-sm font-semibold">
                                          Tipe Izin
                                        </label>
                                        <select
                                          onChange={(e) =>
                                            settipePulang(e.target.value)
                                          }
                                          className="text-[#6c6b6b] h-10 text-sm border-2 border-stroke rounded-md px-2"
                                        >
                                          <option selected disabled>
                                            Pilih Tipe Izin
                                          </option>
                                          <option value={'dinas'}>Dinas</option>
                                          <option value={'pribadi'}>
                                            Pribadi
                                          </option>
                                        </select>
                                      </div>
                                      <div className="flex flex-col gap-1">
                                        <label className="text-[#6c6b6b] text-sm font-semibold">
                                          Alasan Pulang Cepat
                                        </label>
                                        <textarea
                                          onChange={(e) =>
                                            setAlasanPulang(e.target.value)
                                          }
                                          className="text-[#6c6b6b] h-10 text-sm border-2 border-stroke rounded-md p-2"
                                          placeholder="Masukkan alasan..."
                                        />
                                      </div>
                                    </div>
                                    <div className="px-4 md:px-7 py-4">
                                      <p className="text-[#6c6b6b] text-sm">
                                        Karyawan pulang lebih cepat dari jadwal
                                        yang ditentukan. Apakah Anda ingin
                                        mengajukan laporan pulang cepat untuk
                                        karyawan ini?
                                      </p>
                                    </div>
                                    <div className="flex w-full justify-end items-end gap-3 px-4 md:px-7 py-4">
                                      <button
                                        onClick={() => closeEdit(i)}
                                        className="flex px-4 py-2 justify-center items-center bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-md transition-colors"
                                      >
                                        BATAL
                                      </button>
                                      <button
                                        onClick={() => {
                                          postPulangCepat(
                                            data.tgl_absen,
                                            data.userid,
                                            data.name,
                                            data.jam_keluar,
                                          );
                                        }}
                                        disabled={isLoading}
                                        className="flex px-4 py-2 justify-center items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md disabled:opacity-50 transition-colors"
                                      >
                                        {isLoading ? 'MEMPROSES...' : 'AJUKAN'}
                                      </button>
                                    </div>
                                  </div>
                                </>
                              </ModalKosongan>
                            )}
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}

              {(!filteredAbsen || filteredAbsen.length === 0) && (
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
                  <div className="flex flex-col items-center justify-center">
                    <svg
                      className="w-16 h-16 text-gray-400 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                    <p className="text-gray-500 text-center">
                      Tidak ada data absensi yang ditemukan
                    </p>
                    <p className="text-gray-400 text-sm text-center mt-2">
                      Silakan pilih tanggal atau ubah filter pencarian
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default TableAbsenProd;
