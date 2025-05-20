import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Loading from '../../../../Loading';
import ModalKosongan from '../../../../Modals/Qc/NCR/NCRResponQC';
import TabPengajuanLangsung from './TabPengajuanLangsung';
import Polygon6 from '../../../../../images/icon/Polygon6.svg';
import convertTimeStampToDate from '../../../../../utils/convertDate';

function TableAbsensi() {
  const [isLoading, setIsLoading] = useState(false);
  const [absen, setabsen] = useState<any>();
  const [idPengaju, setIdPengaju] = useState<any>();
  const [tipeIzin, settipeIzin] = useState<any>();
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day = String(today.getDate()).padStart(2, '0');

  const formattedDate = `${year}-${month}-${day}`;

  useEffect(() => {
    getMe();
    getabsen(formattedDate, formattedDate);
    getDepartment();
  }, []);

  async function getMe() {
    const url = `${import.meta.env.VITE_API_LINK}/me`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });
      setIdPengaju(res.data.id_karyawan);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  const [department, setDepartment] = useState<any>();
  const [idDepartment, setidDepartment] = useState<any>();
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
  const [dateFrom, setDateFrom] = useState<any>(null);
  const [dateTo, setDateTo] = useState<any>(null);

  async function getabsen(dateFrom1: any, dateTo1: any) {
    const url = `${import.meta.env.VITE_API_LINK}/hr/absensi`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        params: {
          // is_active: true,
          startDate: dateFrom1,
          endDate: dateTo1,
          idDepartment: idDepartment,
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

  async function postTerlambat(
    tglAbsen: any,
    id_KKaryawan: any,
    nama: any,
    index: any,
  ) {
    if (
      window.confirm(
        `Apakah Anda yakin akan mengajukan Izin untuk karyawan ${nama}`,
      )
    ) {
      const url = `${import.meta.env.VITE_API_LINK}/hr/pengajuanTerlambat`;
      try {
        setIsLoading(true);
        const res = await axios.post(
          url,
          {
            id_karyawan: id_KKaryawan,
            id_pengaju: idPengaju,
            type_izin: tipeIzin,
            tanggal: tglAbsen,
          },
          {
            withCredentials: true,
          },
        );

        setIsLoading(false);
        alert('Berhasil Diaujukan');
        closeAksi2(index);
        getabsen(formattedDate, formattedDate);
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
        const res = await axios.post(
          url,
          {
            catatan_ketidaksesuaian: catatan,
            type_ketidaksesuaian: type,
            lama_lembur_absen: lama,
            id_pengaju_ketidaksesuaian: idPengaju,
            alasan_ketidaksesuaian: '',
            penanganan: '',
          },
          {
            withCredentials: true,
          },
        );

        setIsLoading(false);
        alert('Berhasil Diaujukan');
        closeSPL(i);
        getabsen(formattedDate, formattedDate);
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
  const [sortOrder, setSortOrder] = useState('asc'); // State to track sort order

  const handleSort = () => {
    const sortedAbsen = [...absen].sort((a, b) => {
      const waktuAMinus = new Date(a.waktu_masuk);
      const waktuBMinus = new Date(b.waktu_masuk);

      if (sortOrder === 'asc') {
        // Sort in ascending order
        if (waktuAMinus < waktuBMinus) return -1;
        if (waktuAMinus > waktuBMinus) return 1;
      } else {
        // Sort in descending order
        if (waktuAMinus > waktuBMinus) return -1;
        if (waktuAMinus < waktuBMinus) return 1;
      }
      return 0;
    });

    setabsen(sortedAbsen);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); // Toggle sort order
  };
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedTipeKaryawan, setSelectedTipeKaryawan] = useState('');
  const [selectedTipePenggajian, setSelectedTipePenggajian] = useState('');

  const filteredAbsen = absen?.filter((data: any) => {
    return (
      data.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedTipeKaryawan === '' ||
        data.tipe_karyawan === selectedTipeKaryawan) &&
      (selectedTipePenggajian === '' ||
        data.tipe_penggajian === selectedTipePenggajian)
    );
  });

  return (
    <>
      <main className="overflow-x-scroll">
        {isLoading && <Loading />}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Date Selection Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-blue-600">
                  Pilih Tanggal
                </h3>

                <div className="flex items-center space-x-3">
                  <label className="w-16 text-sm text-gray-600 font-medium">
                    Dari:
                  </label>
                  <input
                    className="flex-1 rounded-full bg-blue-50 border border-blue-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    type="date"
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <label className="w-16 text-sm text-gray-600 font-medium">
                    Sampai:
                  </label>
                  <input
                    className="flex-1 rounded-full bg-blue-50 border border-blue-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    type="date"
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              </div>

              {/* Department & Search Section */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-blue-600 mb-2">
                    Department
                  </label>
                  <div className="relative">
                    <select
                      name="nama_department"
                      onChange={(e) => setidDepartment(e.target.value)}
                      className="w-full rounded-md bg-blue-50 border border-blue-100 py-2 px-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                      <option value="" disabled selected>
                        PILIH DEPARTMENT
                      </option>
                      {department?.data?.map((data: any, i: any) => (
                        <option key={i} value={data.id}>
                          {data.nama_department}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                      <svg
                        className="h-4 w-4 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-600 mb-2">
                    Cari Karyawan
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Nama Karyawan"
                      className="w-full rounded-md bg-blue-50 border border-blue-100 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg
                        className="h-4 w-4 text-gray-500"
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
              </div>

              {/* Employee Type Filters */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-blue-600">
                  Tipe Karyawan
                </h3>

                <div className="grid grid-cols-1 gap-3">
                  <select
                    className="rounded-md bg-blue-50 border border-blue-100 py-2 px-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-300"
                    value={selectedTipeKaryawan}
                    onChange={(e) => setSelectedTipeKaryawan(e.target.value)}
                  >
                    <option value="">Pilih Tipe Karyawan</option>
                    <option value="staff">Staff</option>
                    <option value="produksi">Produksi</option>
                  </select>

                  <select
                    className="rounded-md bg-blue-50 border border-blue-100 py-2 px-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-300"
                    value={selectedTipePenggajian}
                    onChange={(e) => setSelectedTipePenggajian(e.target.value)}
                  >
                    <option value="">Pilih Tipe Penggajian</option>
                    <option value="mingguan">Mingguan</option>
                    <option value="bulanan">Bulanan</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-6 justify-between items-center">
              <div className="flex gap-3">
                <button
                  onClick={() => getabsen(dateFrom, dateTo)}
                  disabled={!dateFrom || !dateTo}
                  className={`rounded-md px-5 py-2.5 text-sm font-medium text-white ${
                    !dateFrom || !dateTo
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 transition-colors'
                  }`}
                >
                  Tampilkan Data
                </button>

                <button
                  onClick={() => getabsen(formattedDate, formattedDate)}
                  className="bg-green-600 hover:bg-green-700 transition-colors rounded-md px-5 py-2.5 text-sm font-medium text-white"
                >
                  Data Hari Ini
                </button>
              </div>

              <button
                className="bg-red-500 hover:bg-red-600 transition-colors rounded-md px-5 py-2.5 text-sm font-medium text-white"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTipeKaryawan('');
                  setSelectedTipePenggajian('');
                }}
              >
                Reset Filter
              </button>
            </div>
          </div>
        </div>
        <div className="min-w-[700px] bg-white rounded-xl">
          <div className=" w-full h-full flex-col border-b-8 border-[#D8EAFF]">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">
                    <div className="flex col-span-2 gap-2">
                      <label className="text-neutral-500 text-sm font-semibold ">
                        No.
                      </label>
                      <label className="text-neutral-500 text-sm font-semibold ">
                        Nama
                      </label>
                    </div>
                  </th>
                  <th className="p-2 text-left">Department</th>
                  <th className="p-2 text-left">Divisi</th>
                  <th className="p-2 text-center">Tanggal</th>
                  <th className="p-2 text-left">
                    <div className="flex gap-2 col-span-2">
                      <p className="text-xs font-bold ">Waktu </p>
                      <img
                        className="w-2 hover:cursor-pointer"
                        onClick={handleSort}
                        src={Polygon6}
                        alt=""
                      />
                    </div>
                  </th>
                  <th className="p-2 text-left">Shift</th>
                  <th className="p-2 text-left"> Lembur (Jam)</th>
                  <th className="p-2 text-left">Terlambat (Menit)</th>
                  <th className="p-2 text-left">Status Absen</th>
                  <th className="p-2 text-left">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredAbsen?.map((data: any, i: any) => {
                  // Calculate lema_lembur_absen and prevent negative values
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

                  // Determine row background color based on status_absen
                  const getRowBackground = () => {
                    switch (data.status_absen) {
                      case 'cuti khusus':
                        return 'bg-orange-200';
                      case 'sakit':
                        return 'bg-green-200';
                      case 'izin':
                        return 'bg-blue-200';
                      case 'Belum Masuk':
                        return 'bg-red-300';
                      case 'cuti tahunan':
                        return 'bg-yellow-200';
                      default:
                        return '';
                    }
                  };

                  return (
                    <tr
                      key={i}
                      className={`border-b-8 border-[#D8EAFF] ${getRowBackground()}`}
                    >
                      <td className="p-2">
                        <div className="flex gap-1">
                          <span className="text-neutral-500 text-sm font-semibold">
                            {i + 1}.
                          </span>
                          <span className="text-neutral-500 text-sm font-semibold">
                            {data.name}
                          </span>
                        </div>
                      </td>
                      <td className="p-2 text-neutral-500 text-sm font-semibold">
                        {data.nama_department}
                      </td>
                      <td className="p-2 text-neutral-500 text-sm font-semibold">
                        {data.nama_divisi}
                      </td>
                      <td className="p-2 text-neutral-500 text-sm font-semibold text-center">
                        {data.hari}, {data.tgl_masuk}
                        {data.jenis_hari_masuk == 'Biasa' ||
                        data.jenis_hari_masuk == null
                          ? ''
                          : '- L'}
                      </td>
                      <td className="p-2">
                        <div className="flex flex-col gap-1">
                          <span className="text-neutral-500 text-sm font-semibold">
                            Masuk:{' '}
                            {data.jam_masuk == null || data.jam_masuk == 0
                              ? ' ~'
                              : data.jam_masuk}
                          </span>
                          <span className="text-neutral-500 text-sm font-semibold">
                            Keluar:{' '}
                            {data.jam_keluar == null || data.jam_keluar == 0
                              ? ' ~'
                              : data.jam_keluar}
                          </span>
                        </div>
                      </td>
                      <td className="p-2 text-neutral-500 text-sm font-semibold">
                        {data.shift == null || data.shift == 0
                          ? ' ~'
                          : data.shift}
                      </td>
                      <td className="p-2">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`uppercase text-sm font-semibold 
            ${
              data.status_ketidaksesuaian == 'history'
                ? 'text-green-500'
                : data.status_ketidaksesuaian == 'rejected'
                ? 'text-red-500'
                : 'text-black'
            }`}
                          >
                            {data.status_ketidaksesuaian == null ||
                            data.status_ketidaksesuaian == 0
                              ? ''
                              : data.status_ketidaksesuaian}
                          </span>
                          <span className="text-neutral-500 text-sm font-semibold">
                            {data.status_lembur == null ||
                            data.status_lembur == 0
                              ? ' ~'
                              : data.status_lembur}{' '}
                            {data.status_lembur == 'Belum Pulang' ||
                            data.status_lembur == 'Tidak Lembur'
                              ? ''
                              : data.status_lembur_spl}{' '}
                            {data.jam_lembur == null || data.jam_lembur == 0
                              ? ''
                              : '~ ' + data.jam_lembur + 'Jam'}
                          </span>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex flex-col gap-1">
                          <span className="text-neutral-500 text-sm font-semibold">
                            {data.status_masuk}
                          </span>
                          <span className="text-neutral-500 text-sm font-semibold">
                            {data.menit_terlambat == null ||
                            data.menit_terlambat == 0
                              ? '~'
                              : '~ ' + data.menit_terlambat + ' Jam'}
                          </span>
                        </div>
                      </td>
                      <td className="p-2 text-neutral-500 text-sm font-semibold">
                        {data.status_absen}
                      </td>
                      <td className="p-2">
                        <div className="flex flex-col gap-1">
                          {data.status_lembur_spl == 'dengan SPL' &&
                          (data.status_ketidaksesuaian == 'none' ||
                            data.status_ketidaksesuaian == 'rejected') &&
                          data.jam_lembur != data.jam_lembur_spl ? (
                            <>
                              <button
                                onClick={() => openSPL(i)}
                                className="w-full bg-yellow-600 text-white text-sm py-1 rounded-md"
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
                                      <div className="grid grid-cols-2 gap-5 px-7 py-4">
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
                                          <div className="flex gap-1 justify-between w-[50%]">
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

                                      <div className="grid grid-cols-2 gap-5 px-7 py-4">
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
                                        <button
                                          onClick={() => {
                                            console.log(
                                              catatan_ketidaksesuaian,
                                              tipe_lembur,
                                              data.jam_lembur,
                                              i,
                                              data.id_pengajuan_lembur,
                                            );
                                            postLemburKurang(
                                              catatan_ketidaksesuaian,
                                              tipe_lembur,
                                              data.jam_lembur,
                                              i,
                                              data.id_pengajuan_lembur,
                                            );
                                          }}
                                          disabled={isLoading}
                                          className="flex px-4 py-1 justify-center items-center bg-blue-600 text-white font-semibold rounded-md"
                                        >
                                          AJUKAN
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

                          {data.status_masuk == 'Terlambat ' ? (
                            <>
                              <button
                                onClick={() => openAksi2(i)}
                                className="w-full bg-green-600 text-white text-sm py-1 rounded-md"
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
                                      <div className="grid grid-cols-2 gap-5 px-7 py-4">
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
                                      <div className="grid grid-cols-2 gap-5 px-7 py-4">
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
                                        {tipeIzin == null ? (
                                          <></>
                                        ) : (
                                          <>
                                            <button
                                              onClick={() => {
                                                console.log(
                                                  data.tgl_absen,
                                                  data.userid,
                                                  data.name,
                                                  i,
                                                  tipeIzin,
                                                );
                                                postTerlambat(
                                                  data.tgl_absen,
                                                  data.userid,
                                                  data.name,
                                                  i,
                                                );
                                              }}
                                              disabled={isLoading}
                                              className="flex px-4 py-1 justify-center items-center bg-blue-600 text-white font-semibold rounded-md"
                                            >
                                              AJUKAN
                                            </button>
                                          </>
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
                                className="w-full bg-blue-600 text-white text-sm py-1 rounded-md"
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
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}

export default TableAbsensi;
