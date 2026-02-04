import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Loading from '../../../../Loading';
import ModalKosongan from '../../../../Modals/Qc/NCR/NCRResponQC';
import TabPengajuanLangsung from './TabPengajuanLangsung';
import Polygon6 from '../../../../../images/icon/Polygon6.svg';
import convertTimeStampToDate from '../../../../../utils/convertDate';
import * as XLSX from 'xlsx';
import Select from 'react-select';

function TableAbsensi() {
  const [isLoading, setIsLoading] = useState(false);
  const [absen, setabsen] = useState<any>();
  const [idPengaju, setIdPengaju] = useState<any>();
  const [tipeIzin, settipeIzin] = useState<any>();
  const [tipePulang, settipePulang] = useState<any>();
  const [alasanPulang, setAlasanPulang] = useState<any>();
  const today = new Date();
  const [alasanTerlambat, setAlasanTerlambat] = useState<any>();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
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
        const res = await axios.post(
          url,
          {
            id_karyawan: id_KKaryawan,
            id_pengaju: idPengaju,
            type_izin: tipeIzin,
            tanggal: tglAbsen,
            jam_masuk: jamMasuk,
            alasan: alasanTerlambat,
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
        const res = await axios.post(
          url,
          {
            catatan_ketidaksesuaian: catatan,
            type_ketidaksesuaian: type,
            lama_lembur_absen: lama,
            id_pengaju_ketidaksesuaian: idPengaju,
            alasan_ketidaksesuaian: '',
            penanganan: p,
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
  const [selectedBagianMesin, setSelectedBagianMesin] = useState<any>(null);

  const filteredAbsen = absen?.filter((data: any) => {
    const bagianMesin = data.bagian_mesin?.[0]?.nama_bagian_mesin || '';
    return (
      data.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedTipeKaryawan === '' ||
        data.tipe_karyawan === selectedTipeKaryawan) &&
      (selectedTipePenggajian === '' ||
        data.tipe_penggajian === selectedTipePenggajian) &&
      (selectedDivisi === '' || data.nama_divisi === selectedDivisi) &&
      (!selectedBagianMesin || bagianMesin === selectedBagianMesin.value)
    );
  });

  // Get unique divisi values for filter
  const uniqueDivisi = Array.from(
    new Set(absen?.map((data: any) => data.nama_divisi).filter(Boolean)),
  );

  // Get unique bagian mesin values for filter
  const uniqueBagianMesin = Array.from(
    new Set(
      absen
        ?.map((data: any) => data.bagian_mesin?.[0]?.nama_bagian_mesin)
        .filter(Boolean),
    ),
  );

  // Create options for react-select
  const bagianMesinOptions = uniqueBagianMesin.map((mesin: any) => ({
    value: mesin,
    label: mesin,
  }));

  const divisiOptions = uniqueDivisi.map((divisi: any) => ({
    value: divisi,
    label: divisi,
  }));

  const departmentOptions = department?.data?.map((data: any) => ({
    value: data.id,
    label: data.nama_department,
  }));

  const tipeKaryawanOptions = [
    { value: 'staff', label: 'Staff' },
    { value: 'produksi', label: 'Produksi' },
  ];

  const tipePenggajianOptions = [
    { value: 'mingguan', label: 'Mingguan' },
    { value: 'bulanan', label: 'Bulanan' },
  ];

  // Custom styles for react-select
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

  // Function to export data to Excel
  const exportToExcel = () => {
    if (!filteredAbsen || filteredAbsen.length === 0) {
      alert('Tidak ada data untuk diekspor');
      return;
    }

    const exportData = filteredAbsen.map((item: any, index: number) => ({
      empNo: ' ',
      'AC-No': '',
      'No.': index + 1,
      Name: item.name,
      Hari: item.hari,
      Date: item.tgl_absen
        ? new Date(item.tgl_absen).toLocaleDateString('en-GB')
        : '',
      'Clock In': item.jam_masuk || '',
      'Clock Out': item.jam_keluar || '',
      Timetable: item.shift || '',
      'Tanggal Masuk': item.tgl_masuk
        ? item.tgl_masuk.replace(
            /(\d+)-(\w+)-(\d+)/,
            (match: any, day: any, month: any, year: any) => {
              const months: any = {
                Jan: '01',
                Feb: '02',
                Mar: '03',
                Apr: '04',
                Mei: '05',
                Jun: '06',
                Jul: '07',
                Agu: '08',
                Sep: '09',
                Okt: '10',
                Nov: '11',
                Des: '12',
              };
              return `${day.padStart(2, '0')}/${months[month]}/${year}`;
            },
          )
        : '',
      'Tanggal Keluar': item.tgl_keluar
        ? item.tgl_keluar.replace(
            /(\d+)-(\w+)-(\d+)/,
            (match: any, day: any, month: any, year: any) => {
              const months: any = {
                Jan: '01',
                Feb: '02',
                Mar: '03',
                Apr: '04',
                Mei: '05',
                Jun: '06',
                Jul: '07',
                Agu: '08',
                Sep: '09',
                Okt: '10',
                Nov: '11',
                Des: '12',
              };
              return `${day.padStart(2, '0')}/${months[month]}/${year}`;
            },
          )
        : '',
      'Jenis Hari Masuk': item.jenis_hari_masuk,
      Department: item.nama_department,
      Divisi: item.nama_divisi,
      'Bagian Mesin': item.bagian_mesin?.[0]?.nama_bagian_mesin || '',
      'Tipe Karyawan': item.tipe_karyawan,
      'Tipe Penggajian': item.tipe_penggajian,
      'Status Absen': item.status_absen,
      'Status Masuk': item.status_masuk,
      'Status Keluar': item.status_keluar,
      'Status Lembur': item.status_lembur,
      'Status Lembur SPL': item.status_lembur_spl,
      'Status Ketidaksesuaian': item.status_ketidaksesuaian || '',
      'Jam Lembur': item.jam_lembur || 0,
      'Jam Lembur SPL': item.jam_lembur_spl || 0,
      'Jam Terlambat': item.menit_terlambat || 0,
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    const columnWidths = [
      { wch: 5 },
      { wch: 20 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
      { wch: 20 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 15 },
      { wch: 25 },
      { wch: 20 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 18 },
      { wch: 20 },
      { wch: 12 },
      { wch: 15 },
      { wch: 15 },
    ];

    worksheet['!cols'] = columnWidths;
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Absensi');

    const currentDate = new Date().toISOString().split('T')[0];
    let filename = 'Data_Absensi';

    if (dateFrom && dateTo) {
      if (dateFrom === dateTo) {
        filename += `_${dateFrom}`;
      } else {
        filename += `_${dateFrom}_to_${dateTo}`;
      }
    } else if (dateFrom || dateTo) {
      filename += `_${dateFrom || dateTo}`;
    }

    filename += `_exported_${currentDate}.xlsx`;

    XLSX.writeFile(workbook, filename);
  };

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
        const res = await axios.post(
          url,
          {
            id_karyawan: id_KKaryawan,
            id_pengaju: idPengaju,
            tanggal: tglAbsen,
            jam_pulang: jamKeluar,
            type_izin: tipePulang,
            alasan: alasanPulang,
          },
          {
            withCredentials: true,
          },
        );
        setIsLoading(false);
        window.location.reload();
      } catch (error: any) {
        setIsLoading(false);
        console.log(error);
      }
    }
  }

  return (
    <>
      <main className="">
        {isLoading && <Loading />}

        {/* Filter Section */}
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
              <span className="">Filter Data Absensi</span>
            </h2>
          </div>

          <div className="p-3 sm:p-4 md:p-6">
            {/* Date Range Filter */}
            <div className="mb-4 sm:mb-6">
              <h3 className="text-sm sm:text-base font-semibold text-blue-600 mb-3 sm:mb-4">
                Filter Tanggal
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs sm:text-sm text-gray-600 font-medium">
                    Dari:
                  </label>
                  <input
                    className="w-full rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 sm:py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                    type="date"
                    value={dateFrom || ''}
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
                    value={dateTo || ''}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs sm:text-sm text-gray-600 font-medium">
                    Department:
                  </label>
                  <Select
                    options={departmentOptions}
                    value={departmentOptions?.find(
                      (opt: any) => opt.value === idDepartment,
                    )}
                    onChange={(selected: any) =>
                      setidDepartment(selected?.value || '')
                    }
                    isClearable
                    placeholder="Semua Department"
                    styles={customSelectStyles}
                    className="text-xs sm:text-sm"
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                  />
                </div>

                <div className="flex flex-col gap-2 justify-end">
                  <button
                    onClick={() => getabsen(dateFrom, dateTo)}
                    disabled={!dateFrom || !dateTo}
                    className={`w-full rounded-lg px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white transition-all ${
                      !dateFrom || !dateTo
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md active:bg-blue-800'
                    }`}
                  >
                    Terapkan Filter
                  </button>
                </div>
              </div>
            </div>

            {/* Additional Absensi Filters */}
            <div className="mb-4 sm:mb-6">
              <h3 className="text-sm sm:text-base font-semibold text-blue-600 mb-3 sm:mb-4">
                Filter Tambahan
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm text-gray-600 font-medium mb-2">
                    Nama Karyawan
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama..."
                    className="w-full rounded-lg bg-blue-50 border border-blue-200 py-2 sm:py-2.5 px-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm text-gray-600 font-medium mb-2">
                    Tipe Karyawan
                  </label>
                  <Select
                    options={tipeKaryawanOptions}
                    value={tipeKaryawanOptions.find(
                      (opt: any) => opt.value === selectedTipeKaryawan,
                    )}
                    onChange={(selected: any) =>
                      setSelectedTipeKaryawan(selected?.value || '')
                    }
                    isClearable
                    placeholder="Semua Tipe"
                    styles={customSelectStyles}
                    className="text-xs sm:text-sm"
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm text-gray-600 font-medium mb-2">
                    Tipe Penggajian
                  </label>
                  <Select
                    options={tipePenggajianOptions}
                    value={tipePenggajianOptions.find(
                      (opt: any) => opt.value === selectedTipePenggajian,
                    )}
                    onChange={(selected: any) =>
                      setSelectedTipePenggajian(selected?.value || '')
                    }
                    isClearable
                    placeholder="Semua Tipe"
                    styles={customSelectStyles}
                    className="text-xs sm:text-sm"
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm text-gray-600 font-medium mb-2">
                    Divisi
                  </label>
                  <Select
                    options={divisiOptions}
                    value={divisiOptions.find(
                      (opt: any) => opt.value === selectedDivisi,
                    )}
                    onChange={(selected: any) =>
                      setSelectedDivisi(selected?.value || '')
                    }
                    isClearable
                    placeholder="Semua Divisi"
                    styles={customSelectStyles}
                    className="text-xs sm:text-sm"
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm text-gray-600 font-medium mb-2">
                    Bagian Mesin
                  </label>
                  <Select
                    options={bagianMesinOptions}
                    value={selectedBagianMesin}
                    onChange={(selected: any) =>
                      setSelectedBagianMesin(selected)
                    }
                    isClearable
                    placeholder="Semua Bagian Mesin"
                    styles={customSelectStyles}
                    className="text-xs sm:text-sm"
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-between">
              <button
                onClick={() => getabsen(formattedDate, formattedDate)}
                className="bg-green-600 hover:bg-green-700 hover:shadow-md active:bg-green-800 transition-all rounded-lg px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white"
              >
                Data Hari Ini
              </button>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={exportToExcel}
                  disabled={!filteredAbsen || filteredAbsen.length === 0}
                  className={`rounded-lg px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white transition-all ${
                    !filteredAbsen || filteredAbsen.length === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-orange-600 hover:bg-orange-700 hover:shadow-md active:bg-orange-800'
                  }`}
                >
                  Export Excel
                </button>

                <button
                  className="bg-red-500 hover:bg-red-600 hover:shadow-md active:bg-red-700 transition-all rounded-lg px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedTipeKaryawan('');
                    setSelectedTipePenggajian('');
                    setSelectedDivisi('');
                    setSelectedBagianMesin(null);
                  }}
                >
                  Reset Filter
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Absensi Table - Flat List */}
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
              Data Absensi
            </h3>
          </div>

          <div className="overflow-x-auto max-h-[600px] sm:max-h-[700px] overflow-y-auto">
            <table className="w-full text-xs sm:text-sm min-w-[800px]">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="p-2 sm:p-3 text-left text-xs font-semibold text-gray-600">
                    No
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
                  <th className="p-2 sm:p-3 text-left text-xs font-semibold text-gray-600">
                    Tanggal
                  </th>
                  <th className="p-2 sm:p-3 text-left text-xs font-semibold text-gray-600">
                    <div className="flex gap-2 items-center">
                      <p>Waktu Masuk/Keluar</p>
                      <img
                        className="w-2 hover:cursor-pointer"
                        onClick={handleSort}
                        src={Polygon6}
                        alt="Sort"
                      />
                    </div>
                  </th>
                  <th className="p-2 sm:p-3 text-left text-xs font-semibold text-gray-600">
                    Jam Lembur
                  </th>
                  <th className="p-2 sm:p-3 text-left text-xs font-semibold text-gray-600">
                    Terlambat
                  </th>
                  <th className="p-2 sm:p-3 text-left text-xs font-semibold text-gray-600">
                    Status
                  </th>
                  <th className="p-2 sm:p-3 text-left text-xs font-semibold text-gray-600">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAbsen?.map((data: any, i: number) => {
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
                      <td className="p-2 sm:p-3 text-xs">{i + 1}</td>
                      <td className="p-2 sm:p-3 text-xs font-medium">
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
                      <td className="p-2 sm:p-3 text-xs">
                        <div className="flex flex-col">
                          <span>{data.hari}</span>
                          <span>
                            {data.tgl_masuk} -{' '}
                            <span className="text-blue-400">{data.shift}</span>
                          </span>
                          {data.jenis_hari_masuk !== 'Biasa' &&
                            data.jenis_hari_masuk != null && (
                              <span className="text-blue-600 font-medium">
                                Libur
                              </span>
                            )}
                        </div>
                      </td>
                      <td className="p-2 sm:p-3 text-xs">
                        <div className="flex flex-col gap-0.5">
                          <span>In: {data.jam_masuk || '~'}</span>
                          <span>Out: {data.jam_keluar || '~'}</span>
                        </div>
                      </td>
                      <td className="p-2 sm:p-3 text-xs">
                        <div className="flex flex-col gap-0.5">
                          <span
                            className={`uppercase text-[10px] sm:text-xs font-semibold ${
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
                            <span className="uppercase text-[10px] sm:text-xs font-semibold text-green-500">
                              {data.status_ketidaksesuaian}
                            </span>
                          )}
                          <span className="font-medium text-purple-600">
                            {data.jam_lembur > 0
                              ? `${data.jam_lembur} Jam`
                              : '-'}
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
                          <span>{data.status_masuk}</span>
                          <span>
                            {data.menit_terlambat == null ||
                            data.menit_terlambat == 0
                              ? '~'
                              : `${data.menit_terlambat} JAM`}
                          </span>
                        </div>
                      </td>
                      <td className="p-2 sm:p-3 text-xs">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">
                            {data.status_absen}
                          </span>
                          {data.status_keluar &&
                            data.status_keluar !== 'Belum Pulang' &&
                            data.status_keluar !== 'Keluar' && (
                              <span className="text-[10px] text-blue-500">
                                {data.status_keluar}
                              </span>
                            )}
                        </div>
                      </td>
                      <td className="p-2 sm:p-3">
                        <div className="flex flex-col gap-2">
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
                                          <>
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
                <p className="text-sm">Tidak ada data absensi</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
export default TableAbsensi;
