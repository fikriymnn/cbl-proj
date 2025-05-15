import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import Loading from '../../../../../Loading';
import convertTimeStampToDate from '../../../../../../utils/convertDate';

function BuatStatusKaryawan() {
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userList, setUserList] = useState<any>();
  const [periodeAwal, setPeriodeAwal] = useState<any>(null);
  const [periodeAkhir, setPeriodeAkhir] = useState<any>(null);
  const [jumlahAlpa, setjumlahAlpa] = useState<any>(0);
  const [jumlahIzin, setjumlahIzin] = useState<any>(0);
  const [jumlahTanpaKeterangan, setjumlahTanpaKeterangan] = useState<any>(0);
  const [jumlahKeterlambatan, setjumlahKeterlambatan] = useState<any>(0);
  const [absenData, setAbsenData] = useState<any>(null);
  const [rekapAbsen, setRekapAbsen] = useState<any>(null);
  const [peringatanKe1, setperingatanKe1] = useState<any>(null);
  const [peringatanKe2, setperingatanKe2] = useState<any>(null);
  const [peringatanKe3, setperingatanKe3] = useState<any>(null);
  const [prestasiKerja, setprestasiKerja] = useState<any>(null);
  const [prestasiKerjaPoint, setprestasiKerjaPoint] = useState<any>(null);
  const [kesanPenilai, setkesanPenilai] = useState<any>(null);

  // New state for SP data
  const [spKaryawan, setSpKaryawan] = useState<any[]>([]);

  const [penilaian, setPenilaian] = useState([
    {
      nama_point: 'Inisiatif',
      deskripsi:
        '(Menunjukkan kemampuan, Percaya diri, Bekerja berupaya untuk maju)',
      keterangan: '',
      hasil_penilaian: '',
      point_penilaian: '',
    },
    {
      nama_point: 'Kualitas Kerja',
      deskripsi:
        '(Ketetapan, Efektivitas dalam bekerja bebas dari kesalahan-kesalahan)',
      keterangan: '',
      hasil_penilaian: '',
      point_penilaian: '',
    },
    {
      nama_point: 'Kuantitas Pekerja',
      deskripsi: '(Kecepatan Kerja)',
      keterangan: '',
      hasil_penilaian: '',
      point_penilaian: '',
    },
    {
      nama_point: 'Pengetahuan akan Tugas',
      deskripsi: '(Pengetahuan Teknik dan Penerapan)',
      keterangan: '',
      hasil_penilaian: '',
      point_penilaian: '',
    },
    {
      nama_point: 'Sikap Kerjasama',
      deskripsi: '(Antusias, Semangat, Kemampuan Bekerja)',
      keterangan: '',
      hasil_penilaian: '',
      point_penilaian: '',
    },
    {
      nama_point: 'Kemampuan untuk dapat dipercaya',
      deskripsi: '(Kejujuran, Loyalitas, mampu menerima tanggung jawab)',
      keterangan: '',
      hasil_penilaian: '',
      point_penilaian: '',
    },
    {
      nama_point: 'Kehadiran',
      deskripsi: '(Dapat diandalkan untuk siap dalam tugas)',
      keterangan: '',
      hasil_penilaian: '',
      point_penilaian: '',
    },
    {
      nama_point: 'Sopan Santun dan Kebijakan',
      deskripsi: '(Terhadap customer dan karyawan lainnya)',
      keterangan: '',
      hasil_penilaian: '',
      point_penilaian: '',
    },
    {
      nama_point: 'Penampilan Pribadi',
      deskripsi: '(Perawatan diri, Cara berpakaian, Rambut, Sepatu)',
      keterangan: '',
      hasil_penilaian: '',
      point_penilaian: '',
    },
  ]);

  const [idKaryawan, setIdKaryawan] = useState<any>(null);
  const [namaKaryawan, setnamaKaryawan] = useState<any>(null);
  const [bagianKaryawan, setbagianKaryawan] = useState<any>(null);
  const [jabatanKaryawan, setjabatanKaryawan] = useState<any>(null);
  const [nikKaryawan, setnikKaryawan] = useState<any>(null);
  const [tglMasukKerja, settglMasukKerja] = useState<any>(null);

  useEffect(() => {
    getMe();
    getMasterUser();
  }, []);

  // Get the current date in YYYY-MM-DD format for absen API
  const today = new Date().toISOString().split('T')[0];

  // Effect to calculate average points from BAGIAN 1
  useEffect(() => {
    calculatePrestasiKerja();
  }, [penilaian]);

  const [idPengaju, setIdPengaju] = useState<any>();

  async function getMe() {
    const url = `${import.meta.env.VITE_API_LINK}/me`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        withCredentials: true,
      });
      setIsLoading(false);
      setIdPengaju(res.data.id_karyawan);

      console.log('getme', res.data);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error.data.msg);
    }
  }

  async function getMasterUser() {
    const url = `${import.meta.env.VITE_API_LINK}/hr/karyawan`;
    try {
      const res = await axios.get(url, {
        params: {
          is_active: true,
        },
        withCredentials: true,
      });

      setUserList(res.data.data);
      console.log('user list', res.data.data);
      setOptions(
        res.data.data.map((item: any) => {
          const latestBagianMesin =
            item.biodata_karyawan[0]?.bagian_mesin_karyawan?.slice(-1)[0]
              ?.nama_bagian_mesin || '';

          return {
            value: item.userid,
            label: `${item.biodata_karyawan[0]?.nik} - ${item.name} - ${item.biodata_karyawan[0]?.nama_jabatan} - ${latestBagianMesin}`,
          };
        }),
      );
    } catch (error: any) {
      console.log(error);
    }
  }

  const handleChangePointDepatment = (selected: any) => {
    const { value } = selected;
    const filteredData = userList.find((item: any) => item.userid == value);

    console.log(filteredData?.userid);

    if (filteredData) {
      setIdKaryawan(filteredData?.userid);
      setnamaKaryawan(filteredData?.name);
      setbagianKaryawan(
        filteredData?.biodata_karyawan[0]?.bagian_mesin_karyawan?.slice(-1)[0]
          ?.nama_bagian_mesin || '',
      );
      setjabatanKaryawan(filteredData?.biodata_karyawan[0]?.nama_jabatan);
      setnikKaryawan(filteredData?.biodata_karyawan[0]?.nik);
      settglMasukKerja(filteredData?.biodata_karyawan[0]?.tgl_masuk);

      // Get the SP data and sort it by the most recent
      if (filteredData.sp_karyawan && filteredData.sp_karyawan.length > 0) {
        const sortedSP = [...filteredData.sp_karyawan].sort((a, b) => {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });

        // Get only the 3 most recent SP entries
        const latestSP = sortedSP.slice(0, 3);
        setSpKaryawan(latestSP);

        // Set the values for the form fields
        if (latestSP.length > 0)
          setperingatanKe1(latestSP[0].nama_sp_teguran || latestSP[0].alasan);
        if (latestSP.length > 1)
          setperingatanKe2(latestSP[1].nama_sp_teguran || latestSP[1].alasan);
        if (latestSP.length > 2)
          setperingatanKe3(latestSP[2].nama_sp_teguran || latestSP[2].alasan);
      } else {
        setSpKaryawan([]);
        setperingatanKe1(null);
        setperingatanKe2(null);
        setperingatanKe3(null);
      }

      // If periode awal is already set, fetch attendance data
      if (periodeAwal) {
        const startDate = `${periodeAwal}-01`; // Set to first day of month
        getAbsen(startDate);
        getRekapAbsen(startDate);
      }
    }
  };

  async function postPengajuanStatus() {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/hr/pengajuanPromosiStatusKaryawan`;
    try {
      setIsLoading(true);
      const res = await axios.post(
        url,
        {
          id_karyawan: idKaryawan,
          id_pengaju: idPengaju,
          periode_awal: periodeAwal,
          periode_akhir: periodeAkhir,
          jumlah_alpa: jumlahAlpa,
          jumlah_izin: jumlahIzin,
          jumlah_tanpa_keterangan: jumlahTanpaKeterangan,
          jumlah_keterlambatan: jumlahKeterlambatan,
          peringatan_ke_1: peringatanKe1,
          peringatan_ke_2: peringatanKe2,
          peringatan_ke_3: peringatanKe3,
          prestasi_kerja: prestasiKerja,
          prestasi_kerja_point: prestasiKerjaPoint,
          kesan_penilai: kesanPenilai,
          penilaian: penilaian,
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

  const options2 = [
    { hasil_penilaian: 'Sangat Baik', point_penilaian: 45 },
    { hasil_penilaian: 'Baik', point_penilaian: 35 },
    { hasil_penilaian: 'Cukup', point_penilaian: 25 },
    { hasil_penilaian: 'Kurang', point_penilaian: 18 },
  ];

  interface Penilaian {
    nama_point: string;
    deskripsi: string;
    keterangan: string;
    hasil_penilaian: string;
    point_penilaian: string | number;
  }

  const handleInputChange = (
    index: number,
    field: keyof Penilaian,
    value: string | number,
  ) => {
    const updatedPenilaian = penilaian.map((item, i) =>
      i === index ? { ...item, [field]: value } : item,
    );
    setPenilaian(updatedPenilaian);
    console.log(updatedPenilaian);
  };

  // Calculate average points and set Prestasi Kerja automatically
  const calculatePrestasiKerja = () => {
    // Only calculate if there are point_penilaian values
    const pointValues = penilaian
      .map((item) => parseInt(item.point_penilaian as string))
      .filter((point) => !isNaN(point));

    if (pointValues.length === 0) return;

    const sum = pointValues.reduce((total, point) => total + point, 0);
    const average = Math.round(sum / pointValues.length);

    console.log(`Average points: ${average}`);

    // Set prestasi based on average
    if (average >= 36) {
      setprestasiKerja('Baik Sekali');
      setprestasiKerjaPoint(45);
    } else if (average >= 26) {
      setprestasiKerja('Baik');
      setprestasiKerjaPoint(35);
    } else if (average >= 19) {
      setprestasiKerja('Cukup');
      setprestasiKerjaPoint(25);
    } else {
      setprestasiKerja('Kurang');
      setprestasiKerjaPoint(18);
    }
  };

  // Get attendance data for the selected employee
  async function getAbsen(startDate: string) {
    if (!idKaryawan || !startDate) return;

    const url = `${import.meta.env.VITE_API_LINK}/hr/karyawanPresensi`;
    try {
      const res = await axios.get(url, {
        params: {
          id_karyawan: idKaryawan,
          start_date: startDate,
          end_date: today,
        },
        withCredentials: true,
      });
      console.log('absen', res.data);
      setAbsenData(res.data);

      // Update absence fields
      if (res.data) {
        setjumlahAlpa(res.data.mangkir_hari || 0);
        setjumlahIzin(res.data.izin_hari || 0);
        setjumlahTanpaKeterangan(res.data.sakit_hari || 0);
      }
    } catch (error: any) {
      console.error('Error fetching absen data:', error);
    }
  }
  // Add this useEffect to recalculate keterlambatan when employee or data changes
  useEffect(() => {
    if (rekapAbsen && idKaryawan) {
      calculateKeterlambatan(rekapAbsen, idKaryawan);
    }
  }, [rekapAbsen, idKaryawan]);
  const calculateKeterlambatan = (data: any, employeeId: string) => {
    if (!data || !data.data) {
      setjumlahKeterlambatan(0);
      return;
    }

    // Flatten all absensi arrays
    const allAbsensi = data.data.flatMap((item: any) => item.absensi || []);

    // Filter for the selected employee and count terlambat instances
    const employeeAbsensi = allAbsensi.filter(
      (absen: any) =>
        absen.userid === employeeId && absen.status_masuk === 'Terlambat ',
    );

    // Set keterlambatan count
    console.log(
      `Found ${employeeAbsensi.length} keterlambatan for employee ID ${employeeId}`,
    );
    setjumlahKeterlambatan(employeeAbsensi.length);
  };
  async function getRekapAbsen(startDate: string) {
    if (!idKaryawan || !startDate) return;

    const url = `${import.meta.env.VITE_API_LINK}/hr/absensiRekap`;
    try {
      const res = await axios.get(url, {
        params: {
          startDate: startDate,
          endDate: today,
        },
        withCredentials: true,
      });
      console.log('rekap absen', res.data);
      setRekapAbsen(res.data);

      // Calculate keterlambatan using the current employee ID
      calculateKeterlambatan(res.data, idKaryawan);
    } catch (error: any) {
      console.error('Error fetching rekap absen data:', error);
    }
  }
  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  const [showAbsenModal, setShowAbsenModal] = useState(false);

  // Add this function to render the modal for both absences and keterlambatan details
  const renderAbsenModal = () => {
    if (!showAbsenModal) return null;

    // Extract keterlambatan data if rekapAbsen exists
    const keterlambatanData = rekapAbsen?.data
      ? rekapAbsen.data
          .flatMap((item: any) => item.absensi || [])
          .filter(
            (absen: any) =>
              absen.userid === idKaryawan &&
              absen.status_masuk === 'Terlambat ',
          )
      : [];

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-xl p-6 w-11/12 max-w-4xl max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">
              Detail Absensi & Keterlambatan
            </h3>
            <button
              onClick={() => setShowAbsenModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Absensi Data */}
          <div className="mb-6">
            <h4 className="font-bold text-lg mb-3">Data Absensi</h4>
            {absenData ? (
              <div className="border-2 border-stroke p-4 rounded-md">
                <p className="text-gray-500 text-sm mb-2">
                  Data absensi diambil dari sistem:
                </p>
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2">
                      <th className="text-left p-2">Jenis Ketidakhadiran</th>
                      <th className="text-left p-2">Jumlah Hari</th>
                      <th className="text-left p-2">Jumlah Tiket</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2">Mangkir (Alpa)</td>
                      <td className="p-2">{absenData.mangkir_hari || 0}</td>
                      <td className="p-2">{absenData.mangkir_tiket || 0}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Izin</td>
                      <td className="p-2">{absenData.izin_hari || 0}</td>
                      <td className="p-2">{absenData.izin_tiket || 0}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Sakit</td>
                      <td className="p-2">{absenData.sakit_hari || 0}</td>
                      <td className="p-2">{absenData.sakit_tiket || 0}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 italic">
                Pilih periode untuk mengambil data absensi
              </p>
            )}
          </div>

          {/* Keterlambatan Data */}
          <div>
            <h4 className="font-bold text-lg mb-3">Detail Keterlambatan</h4>
            {keterlambatanData.length > 0 ? (
              <div className="border-2 border-stroke p-4 rounded-md">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2">
                      <th className="text-left p-2">Tanggal</th>
                      <th className="text-left p-2">Hari</th>
                      <th className="text-left p-2">Jam Masuk</th>
                      <th className="text-left p-2">Terlambat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {keterlambatanData.map((absen: any, index: any) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{absen.tgl_masuk}</td>
                        <td className="p-2">{absen.hari}</td>
                        <td className="p-2">{absen.jam_masuk}</td>
                        <td className="p-2">{absen.menit_terlambat} Jam</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 italic">
                Tidak ada keterlambatan dalam periode ini
              </p>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setShowAbsenModal(false)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-md transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="overflow-x-scroll">
      {isLoading && <Loading />}
      <div className="min-w-[700px] bg-white rounded-xl">
        {/* Employee selection section */}
        <div className="border-b-8 border-[#D8EAFF] px-7 py-4">
          <div className="flex flex-col gap-1 max-w-md">
            <label className="text-[#6c6b6b] text-sm font-semibold">Nama</label>
            <Select
              placeholder="Cari..."
              options={options}
              onChange={(selectedId) => {
                handleChangePointDepatment(selectedId);
              }}
              className="relative z-50 w-full appearance-none rounded border border-stroke bg-transparent outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
            />
          </div>
        </div>

        {/* Employee info section */}
        <div className="grid grid-cols-1 gap-1 px-7 py-4">
          <div className="grid grid-cols-12 gap-2 mb-3">
            <p className="text-black font-bold col-span-2">Nama</p>
            <p className="text-black text-medium col-span-10">
              : {namaKaryawan ? `${namaKaryawan} - ${nikKaryawan}` : '-'}
            </p>
          </div>
          <div className="grid grid-cols-12 gap-2 mb-3">
            <p className="text-black font-bold col-span-2">Bagian</p>
            <p className="text-black text-medium col-span-10">
              : {bagianKaryawan || '-'}
            </p>
          </div>
          <div className="grid grid-cols-12 gap-2 mb-3">
            <p className="text-black font-bold col-span-2">Jabatan</p>
            <p className="text-black text-medium col-span-10">
              : {jabatanKaryawan || '-'}
            </p>
          </div>
          <div className="grid grid-cols-12 gap-2 mb-3">
            <p className="text-black font-bold col-span-2">Tgl masuk kerja</p>
            <p className="text-black text-medium col-span-10">
              : {tglMasukKerja ? convertTimeStampToDate(tglMasukKerja) : '-'}
            </p>
          </div>

          {/* Period selection */}
          <div className="grid grid-cols-12 gap-2 mb-5">
            <p className="text-black font-bold col-span-2">Periode</p>
            <div className="col-span-10 flex items-center gap-2">
              :
              <input
                onChange={(e) => {
                  setPeriodeAwal(e.target.value);
                  if (e.target.value && idKaryawan) {
                    const startDate = `${e.target.value}-01`;
                    getAbsen(startDate);
                    getRekapAbsen(startDate);
                  }
                }}
                type="month"
                className="text-black border-2 border-stroke rounded px-2 py-1"
              />
              <span>s/d</span>
              <input
                onChange={(e) => setPeriodeAkhir(e.target.value)}
                type="month"
                className="text-black border-2 border-stroke rounded px-2 py-1"
              />
            </div>
          </div>

          <p className="text-black text-medium mb-4">
            Lakukan analisa untuk kerja karyawan dengan hati-hati, pelajari
            faktor dan masing masing tingkat penilaian.
          </p>

          {/* BAGIAN 1 section - Fixed radio button selection */}
          <div className="mb-6">
            <p className="text-black font-bold text-lg mb-3">BAGIAN 1</p>

            {penilaian.map((item, index) => (
              <div key={index} className="grid grid-cols-12 mb-5 border-b pb-4">
                <div className="font-bold text-black col-span-1">
                  {index + 1}
                </div>
                <div className="col-span-11 mb-3">
                  <h3 className="font-bold text-black">{item.nama_point}</h3>
                  <span className="text-gray-600 text-sm">
                    {item.deskripsi}
                  </span>
                </div>
                <div className="col-span-1"></div>
                <div className="flex flex-col col-span-11 gap-2">
                  <div className="grid grid-cols-12 w-full items-center">
                    <label className="col-span-2">Keterangan:</label>
                    <input
                      className="border-2 border-stroke px-2 py-1 col-span-10 rounded"
                      type="text"
                      value={item.keterangan}
                      onChange={(e) =>
                        handleInputChange(index, 'keterangan', e.target.value)
                      }
                      placeholder="Masukkan keterangan"
                    />
                  </div>
                  <div className="mt-2 grid grid-cols-2">
                    {options2.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center mb-2">
                        <input
                          type="radio"
                          id={`penilaian-${index}-${optionIndex}`}
                          name={`penilaian-${index}`}
                          checked={
                            String(item.point_penilaian) ===
                            String(option.point_penilaian)
                          }
                          onChange={() => {
                            handleInputChange(
                              index,
                              'hasil_penilaian',
                              option.hasil_penilaian,
                            );
                            handleInputChange(
                              index,
                              'point_penilaian',
                              option.point_penilaian,
                            );
                          }}
                          className="mr-2"
                        />
                        <label
                          htmlFor={`penilaian-${index}-${optionIndex}`}
                          className="text-sm"
                        >
                          {option.hasil_penilaian} (Point:{' '}
                          {option.point_penilaian})
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* BAGIAN 2 section */}
          <div className="mb-6">
            <p className="text-black font-bold text-lg mb-3">BAGIAN 2</p>

            {/* {absenData ? (
              <div className="border-2 border-stroke p-4 rounded-md mb-4">
                <p className="text-gray-500 text-sm mb-2">
                  Data absensi diambil dari sistem:
                </p>
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2">
                      <th className="text-left p-2">Jenis Ketidakhadiran</th>
                      <th className="text-left p-2">Jumlah Hari</th>
                      <th className="text-left p-2">Jumlah Tiket</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2">Mangkir (Alpa)</td>
                      <td className="p-2">{absenData.mangkir_hari || 0}</td>
                      <td className="p-2">{absenData.mangkir_tiket || 0}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Izin</td>
                      <td className="p-2">{absenData.izin_hari || 0}</td>
                      <td className="p-2">{absenData.izin_tiket || 0}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Sakit</td>
                      <td className="p-2">{absenData.sakit_hari || 0}</td>
                      <td className="p-2">{absenData.sakit_tiket || 0}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 italic mb-4">
                Pilih periode untuk mengambil data absensi
              </p>
            )} */}

            {/* Absence inputs */}
            <div className="grid grid-cols-12 mb-3 items-center">
              <label className="col-span-2">Alpa</label>
              <div className="col-span-10 flex items-center gap-2">
                :
                <input
                  value={jumlahAlpa}
                  onChange={(e) => setjumlahAlpa(e.target.value)}
                  className="border-2 border-stroke px-2 py-1 rounded w-20"
                  type="text"
                  placeholder="0"
                  readOnly={absenData !== null}
                />
                <label>Hari</label>
              </div>
            </div>

            <div className="grid grid-cols-12 mb-3 items-center">
              <label className="col-span-2">Ijin (SKD)</label>
              <div className="col-span-10 flex items-center gap-2">
                :
                <input
                  value={jumlahIzin}
                  onChange={(e) => setjumlahIzin(e.target.value)}
                  className="border-2 border-stroke px-2 py-1 rounded w-20"
                  type="text"
                  placeholder="0"
                  readOnly={absenData !== null}
                />
                <label>Hari</label>
              </div>
            </div>

            <div className="grid grid-cols-12 mb-3 items-center">
              <label className="col-span-2">Sakit</label>
              <div className="col-span-10 flex items-center gap-2">
                :
                <input
                  value={jumlahTanpaKeterangan}
                  onChange={(e) => setjumlahTanpaKeterangan(e.target.value)}
                  className="border-2 border-stroke px-2 py-1 rounded w-20"
                  type="text"
                  placeholder="0"
                  readOnly={absenData !== null}
                />
                <label>Hari</label>
              </div>
            </div>

            <div className="grid grid-cols-12 mb-3 items-center">
              <label className="col-span-2">Keterlambatan</label>
              <div className="col-span-10 flex items-center gap-2">
                :
                <input
                  value={jumlahKeterlambatan}
                  onChange={(e) => setjumlahKeterlambatan(e.target.value)}
                  className="border-2 border-stroke px-2 py-1 rounded w-20"
                  type="text"
                  placeholder="0"
                  readOnly={rekapAbsen !== null}
                />
                <label>Hari</label>
              </div>
            </div>
            <div className="mb-4">
              <button
                onClick={() => setShowAbsenModal(true)}
                disabled={!absenData && !rekapAbsen}
                className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                  absenData || rekapAbsen
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                    clipRule="evenodd"
                  />
                </svg>
                Lihat Detail Absensi & Keterlambatan
              </button>
            </div>
          </div>

          {/* Teguran Peringatan section */}
          <div className="mb-6">
            <p className="text-black font-bold text-lg mb-3">
              Teguran Peringatan
            </p>

            {spKaryawan.length > 0 ? (
              <div className="border-2 border-stroke p-4 rounded-md mb-4">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2">
                      <th className="text-left p-2">Jenis Teguran</th>
                      <th className="text-left p-2">Alasan</th>
                      <th className="text-left p-2">Periode</th>
                      <th className="text-left p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {spKaryawan.map((sp, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">
                          {sp.nama_sp_teguran || 'Teguran'}
                        </td>
                        <td className="p-2">{sp.alasan || '-'}</td>
                        <td className="p-2">
                          {formatDate(sp.dari)} s/d {formatDate(sp.sampai)}
                        </td>
                        <td className="p-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              sp.status === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {sp.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 italic mb-4">
                Tidak ada riwayat teguran
              </p>
            )}

            {/* Warning inputs */}
            <div className="grid grid-cols-12 mb-3 items-center">
              <label className="col-span-2">Peringatan Ke 1</label>
              <div className="col-span-10 flex items-center gap-2">
                :
                <input
                  value={peringatanKe1 || ''}
                  onChange={(e) => setperingatanKe1(e.target.value)}
                  className="border-2 border-stroke px-2 py-1 rounded w-full"
                  type="text"
                  placeholder="Dari data SP Karyawan"
                  readOnly={spKaryawan.length > 0}
                />
              </div>
            </div>

            <div className="grid grid-cols-12 mb-3 items-center">
              <label className="col-span-2">Peringatan Ke 2</label>
              <div className="col-span-10 flex items-center gap-2">
                :
                <input
                  value={peringatanKe2 || ''}
                  onChange={(e) => setperingatanKe2(e.target.value)}
                  className="border-2 border-stroke px-2 py-1 rounded w-full"
                  type="text"
                  placeholder="Dari data SP Karyawan"
                  readOnly={spKaryawan.length > 1}
                />
              </div>
            </div>

            <div className="grid grid-cols-12 mb-3 items-center">
              <label className="col-span-2">Peringatan Ke 3</label>
              <div className="col-span-10 flex items-center gap-2">
                :
                <input
                  value={peringatanKe3 || ''}
                  onChange={(e) => setperingatanKe3(e.target.value)}
                  className="border-2 border-stroke px-2 py-1 rounded w-full"
                  type="text"
                  placeholder="Dari data SP Karyawan"
                  readOnly={spKaryawan.length > 2}
                />
              </div>
            </div>
          </div>

          {/* Prestasi Kerja section */}
          <div className="mb-6">
            <p className="text-black font-bold text-lg mb-3">Prestasi Kerja</p>

            <div className="flex flex-col gap-3 pt-2">
              {/* Calculate average points */}
              {penilaian.filter((item) => item.point_penilaian).length > 0 && (
                <div className="bg-blue-50 p-3 rounded-md mb-3">
                  <p className="text-sm text-blue-800">
                    Nilai prestasi kerja dihitung otomatis berdasarkan rata-rata
                    penilaian pada BAGIAN 1
                  </p>
                  <p className="text-sm text-blue-600 font-semibold mt-1">
                    Hasil: {prestasiKerja || '-'}
                    {prestasiKerjaPoint
                      ? ` (${prestasiKerjaPoint} points)`
                      : ''}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <input
                    checked={prestasiKerja === 'Baik Sekali'}
                    onChange={(e) => {
                      setprestasiKerjaPoint(45);
                      setprestasiKerja(e.target.value);
                    }}
                    type="radio"
                    name="tipeKryawan"
                    id="tipeKryawan1"
                    value={'Baik Sekali'}
                    className="h-4 w-4"
                  />
                  <label htmlFor="tipeKryawan1">Baik Sekali (36-45)</label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    checked={prestasiKerja === 'Baik'}
                    onChange={(e) => {
                      setprestasiKerjaPoint(35);
                      setprestasiKerja(e.target.value);
                    }}
                    type="radio"
                    name="tipeKryawan"
                    id="tipeKryawan2"
                    value={'Baik'}
                    className="h-4 w-4"
                  />
                  <label htmlFor="tipeKryawan2">Baik (26-35)</label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    checked={prestasiKerja === 'Cukup'}
                    onChange={(e) => {
                      setprestasiKerjaPoint(25);
                      setprestasiKerja(e.target.value);
                    }}
                    type="radio"
                    name="tipeKryawan"
                    id="tipeKryawan3"
                    value={'Cukup'}
                    className="h-4 w-4"
                  />
                  <label htmlFor="tipeKryawan3">Cukup (19-25)</label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    checked={prestasiKerja === 'Kurang'}
                    onChange={(e) => {
                      setprestasiKerjaPoint(18);
                      setprestasiKerja(e.target.value);
                    }}
                    type="radio"
                    name="tipeKryawan"
                    id="tipeKryawan4"
                    value={'Kurang'}
                    className="h-4 w-4"
                  />
                  <label htmlFor="tipeKryawan4">Kurang (0-18)</label>
                </div>
              </div>
            </div>
          </div>

          {/* Kesan Penilai section */}
          <div className="mb-6">
            <p className="text-black font-bold text-lg mb-3">Kesan Penilai</p>
            <textarea
              onChange={(e) => setkesanPenilai(e.target.value)}
              value={kesanPenilai || ''}
              placeholder="Masukkan kesan penilai tentang karyawan ini..."
              className="w-full min-h-[100px] resize-none rounded border border-stroke bg-transparent px-3 py-2.5 text-sm outline-0 transition-all focus:border-2 focus:border-gray-900"
            ></textarea>
          </div>
        </div>

        {/* Submit button */}
        <div className="px-7 py-5 border-t border-gray-200">
          <button
            onClick={() => {
              postPengajuanStatus();
            }}
            disabled={isLoading}
            className="px-6 py-2 flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors"
          >
            AJUKAN
          </button>
        </div>
      </div>
      {renderAbsenModal()}
    </main>
  );
}

export default BuatStatusKaryawan;
