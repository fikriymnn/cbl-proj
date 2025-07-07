import axios from 'axios';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Select from 'react-select';
import Loading from '../../../../../Loading';
import convertTimeStampToDate from '../../../../../../utils/convertDate';

// Types
interface Penilaian {
  nama_point: string;
  deskripsi: string;
  keterangan: string;
  hasil_penilaian: string;
  point_penilaian: string | number;
}

interface Employee {
  userid: string;
  name: string;
  biodata_karyawan: Array<{
    jabatan: any;
    nik: string;
    nama_jabatan: string;
    tgl_masuk: string;
    bagian_mesin_karyawan: Array<{ nama_bagian_mesin: string }>;
  }>;
  sp_karyawan?: Array<{
    nama_sp_teguran: string;
    alasan: string;
    dari: string;
    sampai: string;
    status: string;
    createdAt: string;
  }>;
}

// Constants
const EVALUATION_OPTIONS = [
  { hasil_penilaian: 'Sangat Baik', point_penilaian: 45 },
  { hasil_penilaian: 'Baik', point_penilaian: 35 },
  { hasil_penilaian: 'Cukup', point_penilaian: 25 },
  { hasil_penilaian: 'Kurang', point_penilaian: 18 },
];

const PRESTASI_THRESHOLDS = [
  { min: 36, label: 'Baik Sekali', point: 45 },
  { min: 26, label: 'Baik', point: 35 },
  { min: 19, label: 'Cukup', point: 25 },
  { min: 0, label: 'Kurang', point: 18 },
];

const INITIAL_PENILAIAN: Penilaian[] = [
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
];

function BuatStatusKaryawan() {
  // Loading and data states
  const [isLoading, setIsLoading] = useState(false);
  const [userList, setUserList] = useState<Employee[]>([]);
  const [absenData, setAbsenData] = useState<any>(null);

  const [idPengaju, setIdPengaju] = useState<string>('');

  // Employee states
  const [selectedEmployee, setSelectedEmployee] = useState({
    id: '',
    name: '',
    bagian: '',
    jabatan: '',
    nik: '',
    tglMasuk: '',
  });

  // Form states
  const [periods, setPeriods] = useState({
    awal: '',
    akhir: '',
  });

  const [absenceData, setAbsenceData] = useState({
    alpa: 0,
    izin: 0,
    tanpaKeterangan: 0,
    keterlambatan: 0,
  });

  const [warnings, setWarnings] = useState({
    ke1: '',
    ke2: '',
    ke3: '',
  });

  const [performance, setPerformance] = useState({
    prestasi: '',
    point: 0,
    kesan: '',
  });

  const [penilaian, setPenilaian] = useState<Penilaian[]>(INITIAL_PENILAIAN);
  const [spKaryawan, setSpKaryawan] = useState<any[]>([]);
  const [showAbsenModal, setShowAbsenModal] = useState(false);

  // Memoized values
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const employeeOptions = useMemo(
    () =>
      userList.map((item) => {
        const latestBagianMesin =
          item.biodata_karyawan[0]?.bagian_mesin_karyawan?.slice(-1)[0]
            ?.nama_bagian_mesin || '';
        return {
          value: item.userid,
          label: `${item.biodata_karyawan[0]?.nik} - ${item.name} - ${item.biodata_karyawan[0]?.jabatan?.nama_jabatan} - ${latestBagianMesin}`,
        };
      }),
    [userList],
  );

  const keterlambatanData = useMemo(() => {
    if (!absenData?.absen_terlambat || !selectedEmployee.id) return [];

    return absenData.absen_terlambat.filter(
      (absen: any) => absen.status_masuk?.includes('Terlambat'),
    );
  }, [absenData, selectedEmployee.id]);

  // API calls
  const getMe = useCallback(async () => {
    const url = `${import.meta.env.VITE_API_LINK}/me`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, { withCredentials: true });
      setIdPengaju(res.data.id_karyawan);
    } catch (error: any) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getMasterUser = useCallback(async () => {
    const url = `${import.meta.env.VITE_API_LINK}/hr/karyawan`;
    try {
      const res = await axios.get(url, {
        params: { is_active: true },
        withCredentials: true,
      });
      setUserList(res.data.data);
    } catch (error: any) {
      console.error('Error fetching user list:', error);
    }
  }, []);

  const getAbsen = useCallback(
    async (startDate: string) => {
      if (!selectedEmployee.id || !startDate) return;

      const url = `${import.meta.env.VITE_API_LINK}/hr/karyawanPresensi`;
      try {
        const res = await axios.get(url, {
          params: {
            id_karyawan: selectedEmployee.id,
            start_date: startDate,
            end_date: today,
          },
          withCredentials: true,
        });
        console.log(res.data);
        setAbsenData(res.data);

        if (res.data) {
          setAbsenceData((prev) => ({
            ...prev,
            alpa: res.data.mangkir_hari || 0,
            izin: res.data.izin_hari || 0,
            tanpaKeterangan: res.data.sakit_hari || 0,
          }));
        }
      } catch (error: any) {
        console.error('Error fetching absen data:', error);
      }
    },
    [selectedEmployee.id, today],
  );

  // Event handlers
  const handleEmployeeChange = useCallback(
    (selected: any) => {
      const { value } = selected;
      const employee = userList.find((item) => item.userid === value);

      if (!employee) return;

      const biodata = employee.biodata_karyawan[0];
      const latestBagian =
        biodata?.bagian_mesin_karyawan?.slice(-1)[0]?.nama_bagian_mesin || '';

      setSelectedEmployee({
        id: employee.userid,
        name: employee.name,
        bagian: latestBagian,
        jabatan: biodata?.nama_jabatan || '',
        nik: biodata?.nik || '',
        tglMasuk: biodata?.tgl_masuk || '',
      });

      // Handle SP data
      if (employee.sp_karyawan?.length) {
        const sortedSP = [...employee.sp_karyawan].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

        const latestSP = sortedSP.slice(0, 3);
        setSpKaryawan(latestSP);

        setWarnings({
          ke1: latestSP[0]?.nama_sp_teguran || latestSP[0]?.alasan || '',
          ke2: latestSP[1]?.nama_sp_teguran || latestSP[1]?.alasan || '',
          ke3: latestSP[2]?.nama_sp_teguran || latestSP[2]?.alasan || '',
        });
      } else {
        setSpKaryawan([]);
        setWarnings({ ke1: '', ke2: '', ke3: '' });
      }

      if (periods.awal) {
        const startDate = `${periods.awal}-01`;
        getAbsen(startDate);
      }
    },
    [userList, periods.awal, getAbsen],
  );

  const handlePeriodChange = useCallback(
    (type: 'awal' | 'akhir', value: string) => {
      setPeriods((prev) => ({ ...prev, [type]: value }));

      if (type === 'awal' && value && selectedEmployee.id) {
        const startDate = `${value}-01`;
        getAbsen(startDate);
      }
    },
    [selectedEmployee.id, getAbsen],
  );

  const handlePenilaianChange = useCallback(
    (index: number, field: keyof Penilaian, value: string | number) => {
      setPenilaian((prev) =>
        prev.map((item, i) =>
          i === index ? { ...item, [field]: value } : item,
        ),
      );
    },
    [],
  );

  const handlePerformanceChange = useCallback(
    (field: keyof typeof performance, value: any) => {
      setPerformance((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const submitPengajuanStatus = useCallback(async () => {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/hr/pengajuanPromosiStatusKaryawan`;
    try {
      setIsLoading(true);
      await axios.post(
        url,
        {
          id_karyawan: selectedEmployee.id,
          id_pengaju: idPengaju,
          periode_awal: periods.awal,
          periode_akhir: periods.akhir,
          jumlah_alpa: absenceData.alpa,
          jumlah_izin: absenceData.izin,
          jumlah_tanpa_keterangan: absenceData.tanpaKeterangan,
          jumlah_keterlambatan: absenceData.keterlambatan,
          peringatan_ke_1: warnings.ke1,
          peringatan_ke_2: warnings.ke2,
          peringatan_ke_3: warnings.ke3,
          prestasi_kerja: performance.prestasi,
          prestasi_kerja_point: performance.point,
          kesan_penilai: performance.kesan,
          penilaian: penilaian,
        },
        { withCredentials: true },
      );

      window.location.reload();
    } catch (error: any) {
      console.error('Error submitting data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [
    selectedEmployee.id,
    idPengaju,
    periods,
    absenceData,
    warnings,
    performance,
    penilaian,
  ]);

  // Effects
  useEffect(() => {
    getMe();
    getMasterUser();
  }, [getMe, getMasterUser]);

  // Calculate prestasi kerja automatically
  useEffect(() => {
    const pointValues = penilaian
      .map((item) => parseInt(item.point_penilaian as string))
      .filter((point) => !isNaN(point));

    if (pointValues.length === 0) return;

    const average = Math.round(
      pointValues.reduce((sum, point) => sum + point, 0) / pointValues.length,
    );

    const threshold = PRESTASI_THRESHOLDS.find((t) => average >= t.min);
    if (threshold) {
      setPerformance((prev) => ({
        ...prev,
        prestasi: threshold.label,
        point: threshold.point,
      }));
    }
  }, [penilaian]);

  // Update keterlambatan when rekap data changes
  useEffect(() => {
    if (keterlambatanData.length >= 0) {
      setAbsenceData((prev) => ({
        ...prev,
        keterlambatan: keterlambatanData.length,
      }));
    }
  }, [keterlambatanData]);

  // Utility functions
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Render functions
  const renderEmployeeInfo = () => (
    <div className="grid grid-cols-1 gap-1 px-7 py-4">
      {[
        {
          label: 'Nama',
          value: selectedEmployee.name
            ? `${selectedEmployee.name} - ${selectedEmployee.nik}`
            : '-',
        },
        { label: 'Bagian', value: selectedEmployee.bagian || '-' },
        { label: 'Jabatan', value: selectedEmployee.jabatan || '-' },
        {
          label: 'Tgl masuk kerja',
          value: selectedEmployee.tglMasuk
            ? convertTimeStampToDate(selectedEmployee.tglMasuk)
            : '-',
        },
      ].map(({ label, value }) => (
        <div key={label} className="grid grid-cols-12 gap-2 mb-3">
          <p className="text-black font-bold col-span-2">{label}</p>
          <p className="text-black text-medium col-span-10">: {value}</p>
        </div>
      ))}

      <div className="grid grid-cols-12 gap-2 mb-5">
        <p className="text-black font-bold col-span-2">Periode</p>
        <div className="col-span-10 flex items-center gap-2">
          :
          <input
            onChange={(e) => handlePeriodChange('awal', e.target.value)}
            type="month"
            className="text-black border-2 border-stroke rounded px-2 py-1"
          />
          <span>s/d</span>
          <input
            onChange={(e) => handlePeriodChange('akhir', e.target.value)}
            type="month"
            className="text-black border-2 border-stroke rounded px-2 py-1"
          />
        </div>
      </div>
    </div>
  );

  const renderPenilaianSection = () => (
    <div className="mb-6">
      <p className="text-black font-bold text-lg mb-3">BAGIAN 1</p>
      {penilaian.map((item, index) => (
        <div key={index} className="grid grid-cols-12 mb-5 border-b pb-4">
          <div className="font-bold text-black col-span-1">{index + 1}</div>
          <div className="col-span-11 mb-3">
            <h3 className="font-bold text-black">{item.nama_point}</h3>
            <span className="text-gray-600 text-sm">{item.deskripsi}</span>
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
                  handlePenilaianChange(index, 'keterangan', e.target.value)
                }
                placeholder="Masukkan keterangan"
              />
            </div>
            <div className="mt-2 grid grid-cols-2">
              {EVALUATION_OPTIONS.map((option, optionIndex) => (
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
                      handlePenilaianChange(
                        index,
                        'hasil_penilaian',
                        option.hasil_penilaian,
                      );
                      handlePenilaianChange(
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
                    {option.hasil_penilaian} (Point: {option.point_penilaian})
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderAbsenceSection = () => (
    <div className="mb-6">
      <p className="text-black font-bold text-lg mb-3">BAGIAN 2</p>

      {[
        {
          label: 'Alpa',
          value: absenceData.alpa,
          field: 'alpa' as keyof typeof absenceData,
          readonly: absenData !== null,
        },
        {
          label: 'Ijin (SKD)',
          value: absenceData.izin,
          field: 'izin' as keyof typeof absenceData,
          readonly: absenData !== null,
        },
        {
          label: 'Sakit',
          value: absenceData.tanpaKeterangan,
          field: 'tanpaKeterangan' as keyof typeof absenceData,
          readonly: absenData !== null,
        },
        {
          label: 'Keterlambatan',
          value: absenceData.keterlambatan,
          field: 'keterlambatan' as keyof typeof absenceData,
          readonly: absenData?.absen_terlambat !== undefined,
        },
      ].map(({ label, value, field, readonly }) => (
        <div key={label} className="grid grid-cols-12 mb-3 items-center">
          <label className="col-span-2">{label}</label>
          <div className="col-span-10 flex items-center gap-2">
            :
            <input
              value={value}
              onChange={(e) =>
                setAbsenceData((prev) => ({
                  ...prev,
                  [field]: parseInt(e.target.value) || 0,
                }))
              }
              className="border-2 border-stroke px-2 py-1 rounded w-20"
              type="text"
              placeholder="0"
              readOnly={readonly}
            />
            <label>Hari</label>
          </div>
        </div>
      ))}

      <div className="mb-4">
        <button
          onClick={() => setShowAbsenModal(true)}
          disabled={!absenData}
          className={`px-4 py-2 rounded-md flex items-center gap-2 ${
            absenData
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
  );

  const renderWarningsSection = () => (
    <div className="mb-6">
      <p className="text-black font-bold text-lg mb-3">Teguran Peringatan</p>

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
                  <td className="p-2">{sp.nama_sp_teguran || 'Teguran'}</td>
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
        <p className="text-gray-500 italic mb-4">Tidak ada riwayat teguran</p>
      )}

      {[
        {
          label: 'Peringatan Ke 1',
          value: warnings.ke1,
          field: 'ke1' as keyof typeof warnings,
          readonly: spKaryawan.length > 0,
        },
        {
          label: 'Peringatan Ke 2',
          value: warnings.ke2,
          field: 'ke2' as keyof typeof warnings,
          readonly: spKaryawan.length > 1,
        },
        {
          label: 'Peringatan Ke 3',
          value: warnings.ke3,
          field: 'ke3' as keyof typeof warnings,
          readonly: spKaryawan.length > 2,
        },
      ].map(({ label, value, field, readonly }) => (
        <div key={label} className="grid grid-cols-12 mb-3 items-center">
          <label className="col-span-2">{label}</label>
          <div className="col-span-10 flex items-center gap-2">
            :
            <input
              value={value}
              onChange={(e) =>
                setWarnings((prev) => ({ ...prev, [field]: e.target.value }))
              }
              className="border-2 border-stroke px-2 py-1 rounded w-full"
              type="text"
              placeholder="Dari data SP Karyawan"
              readOnly={readonly}
            />
          </div>
        </div>
      ))}
    </div>
  );

  const renderPerformanceSection = () => (
    <div className="mb-6">
      <p className="text-black font-bold text-lg mb-3">Prestasi Kerja</p>

      {penilaian.filter((item) => item.point_penilaian).length > 0 && (
        <div className="bg-blue-50 p-3 rounded-md mb-3">
          <p className="text-sm text-blue-800">
            Nilai prestasi kerja dihitung otomatis berdasarkan rata-rata
            penilaian pada BAGIAN 1
          </p>
          <p className="text-sm text-blue-600 font-semibold mt-1">
            Hasil: {performance.prestasi || '-'}
            {performance.point ? ` (${performance.point} points)` : ''}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
        {PRESTASI_THRESHOLDS.map((threshold, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              checked={performance.prestasi === threshold.label}
              onChange={() => {
                handlePerformanceChange('prestasi', threshold.label);
                handlePerformanceChange('point', threshold.point);
              }}
              type="radio"
              name="tipeKryawan"
              id={`tipeKryawan${index + 1}`}
              value={threshold.label}
              className="h-4 w-4"
            />
            <label htmlFor={`tipeKryawan${index + 1}`}>
              {threshold.label} ({threshold.min}-
              {index === 0 ? 45 : PRESTASI_THRESHOLDS[index - 1].min - 1})
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAbsenModal = () => {
    if (!showAbsenModal) return null;

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
                    {[
                      {
                        label: 'Mangkir',
                        value: absenData.mangkir_hari || 0,
                        tickets: absenData.mangkir_tiket || 0,
                      },
                      {
                        label: 'Izin',
                        value: absenData.izin_hari || 0,
                        tickets: absenData.izin_tiket || 0,
                      },
                      {
                        label: 'Sakit',
                        value: absenData.sakit_hari || 0,
                        tickets: absenData.sakit_tiket || 0,
                      },
                    ].map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{item.label}</td>
                        <td className="p-2">{item.value}</td>
                        <td className="p-2">{item.tickets}</td>
                      </tr>
                    ))}
                  </tbody>

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
                      <th className="text-left p-2">Tipe Terlambat</th>
                      <th className="text-left p-2">Tanggal</th>
                      <th className="text-left p-2">Hari</th>
                      <th className="text-left p-2">Jam Masuk</th>
                      <th className="text-left p-2">Terlambat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {keterlambatanData.map((absen: any, index: number) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{absen.status_masuk}</td>
                        <td className="p-2">{absen.tgl_absen}</td>{' '}
                        {/* Changed from tgl_masuk */}
                        <td className="p-2">{absen.hari}</td>
                        <td className="p-2">{absen.jam_masuk}</td>
                        <td className="p-2">{absen.menit_terlambat} Jam</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 bg-gray-50 font-semibold">
                      <td className="p-2">Total</td>
                      <td className="p-2">-</td>
                      <td className="p-2">{keterlambatanData.length} Hari</td>
                      <td className="p-2">-</td>
                      <td className="p-2">
                        {keterlambatanData.reduce(
                          (total: number, absen: any) => {
                            return (
                              total + parseFloat(absen.menit_terlambat || 0)
                            );
                          },
                          0,
                        )}{' '}
                        Jam
                      </td>
                    </tr>
                  </tfoot>
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

  const renderKesanPenilaiSection = () => (
    <div className="mb-6">
      <p className="text-black font-bold text-lg mb-3">Kesan Penilai</p>
      <textarea
        onChange={(e) => handlePerformanceChange('kesan', e.target.value)}
        value={performance.kesan}
        placeholder="Masukkan kesan penilai tentang karyawan ini..."
        className="w-full min-h-[100px] resize-none rounded border border-stroke bg-transparent px-3 py-2.5 text-sm outline-0 transition-all focus:border-2 focus:border-gray-900"
      />
    </div>
  );

  // Main render
  if (isLoading) return <Loading />;

  return (
    <main className="overflow-x-scroll">
      <div className="min-w-[700px] bg-white rounded-xl">
        {/* Employee selection section */}
        <div className="border-b-8 border-[#D8EAFF] px-7 py-4">
          <div className="flex flex-col gap-1 max-w-md">
            <label className="text-[#6c6b6b] text-sm font-semibold">Nama</label>
            <Select
              placeholder="Cari..."
              options={employeeOptions}
              onChange={handleEmployeeChange}
              className="relative z-50 w-full appearance-none rounded border border-stroke bg-transparent outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
            />
          </div>
        </div>

        {/* Employee info section */}
        {renderEmployeeInfo()}

        <div className="px-7 py-4">
          <p className="text-black text-medium mb-4">
            Lakukan analisa untuk kerja karyawan dengan hati-hati, pelajari
            faktor dan masing masing tingkat penilaian.
          </p>

          {/* BAGIAN 1 - Penilaian */}
          {renderPenilaianSection()}

          {/* BAGIAN 2 - Absensi */}
          {renderAbsenceSection()}

          {/* Teguran Peringatan */}
          {renderWarningsSection()}

          {/* Prestasi Kerja */}
          {renderPerformanceSection()}

          {/* Kesan Penilai */}
          {renderKesanPenilaiSection()}
        </div>

        {/* Submit button */}
        <div className="px-7 py-5 border-t border-gray-200">
          <button
            onClick={submitPengajuanStatus}
            disabled={isLoading}
            className="px-6 py-2 flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'MENGAJUKAN...' : 'AJUKAN'}
          </button>
        </div>
      </div>

      {/* Modal */}
      {renderAbsenModal()}
    </main>
  );
}

export default BuatStatusKaryawan;
