import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import Loading from '../../../Loading';
import convertTimeStampToDateOnly from '../../../../utils/convertDateOnly';

interface Employee {
  userid: string;
  name: string;
  biodata_karyawan: Array<{
    nik: string;
    nama_jabatan: string;
    sisa_cuti: number;
    tipe_karyawan: string;
    bagian_mesin_karyawan: Array<{ nama_bagian_mesin: string }>;
  }>;
}

interface CutiKhusus {
  id: number;
  nama_cuti: string;
  jumlah_hari: number;
}

interface JadwalItem {
  id: number;
  tanggal: string;
  nama_jadwal: string;
  potong_cuti_tahunan: boolean;
  jenis_karyawan: string;
}

function BuatCutiKeHR() {
  // State declarations
  const [options, setOptions] = useState([]);
  const [options2, setOptions2] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userList, setUserList] = useState<Employee[]>([]);
  const [masterSettings, setMasterSettings] = useState<any>(null);
  const [me, setMe] = useState<any>();
  const [idPengaju, setIdPengaju] = useState<any>();
  const [idKaryawan, setIdKaryawan] = useState<any>();
  const [tipeCuti, setTipeCuti] = useState<'tahunan' | 'khusus' | ''>('');
  const [tglDari, setTglDari] = useState<Date | null>(null);
  const [tglSampai, setTglSampai] = useState<Date | null>(null);
  const [alasanCuti, setAlasanCuti] = useState<string>('');
  const [sisaCuti, setSisaCuti] = useState<number>(0);
  const [daysDifference, setDaysDifference] = useState<number | null>(null);
  const [showError, setShowError] = useState(false);
  const [showErrorEarlyDate, setShowErrorEarlyDate] = useState(false);
  const [cutiKhusus, setCutiKhusus] = useState<CutiKhusus[]>([]);
  const [karyawanJadwal, setKaryawanJadwal] = useState<JadwalItem[]>([]);
  const [produksiJadwal, setProduksiJadwal] = useState<JadwalItem[]>([]);
  const [selectedEmployeeType, setSelectedEmployeeType] = useState<string>('');
  const [selectedEmployee, setSelectedEmployee] = useState<any>();

  // State untuk success message
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Initialize data on component mount
  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    await Promise.all([getMe(), getCutiKhusus(), getMasterSettings()]);
  };

  // Function to reset/clear form
  const resetForm = () => {
    setSelectedEmployee(null);
    setIdKaryawan(null);
    setTipeCuti('');
    setTglDari(null);
    setTglSampai(null);
    setAlasanCuti('');
    setSisaCuti(0);
    setDaysDifference(null);
    setShowError(false);
    setShowErrorEarlyDate(false);
    setSelectedEmployeeType('');
    setKaryawanJadwal([]);
    setProduksiJadwal([]);

    // Clear date inputs
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach((input: any) => {
      input.value = '';
    });
  };

  // Function to show success message
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
      setSuccessMessage('');
    }, 5000); // Hide after 5 seconds
  };

  // API calls
  const getMasterSettings = async () => {
    const url = `${import.meta.env.VITE_API_LINK}/master/hr/absensi`;
    try {
      const res = await axios.get(url, { withCredentials: true });
      setMasterSettings(res.data);

      console.log('Master settings:', res.data);
    } catch (error: any) {
      console.log('Error fetching master settings:', error);
    }
  };

  async function getMe() {
    const url = `${import.meta.env.VITE_API_LINK}/me`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      setMe(res.data);
      setIdPengaju(res.data.id_karyawan);

      // Get role and divisi_bawahan from response
      const role =
        res.data.karyawan?.biodata_karyawan[0]?.jabatan?.nama_jabatan;
      const divisiBawahan = res.data.karyawan?.divisi_bawahan;

      // Pass both department and divisi_bawahan to getMasterUser
      getMasterUser(
        res?.data.karyawan.biodata_karyawan[0]?.id_department,
        role,
        divisiBawahan,
      );

      console.log('getme', res.data);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  async function getMasterUser(id: any, role: string, divisiBawahan: any) {
    const url = `${import.meta.env.VITE_API_LINK}/hr/karyawan`;

    // Build params object
    const params: any = {
      is_active: true,
      id_department: id,
    };

    // Check if role is supervisor or section head AND divisi_bawahan is not null/empty
    const isSupervisorOrSectionHead =
      role?.toLowerCase().includes('supervisor') ||
      role?.toLowerCase().includes('section head');

    if (isSupervisorOrSectionHead && divisiBawahan && divisiBawahan !== '') {
      // Add divisi_bawahan to params if conditions are met
      params.divisi_bawahan = Array.isArray(divisiBawahan)
        ? JSON.stringify(divisiBawahan)
        : divisiBawahan;
    }

    try {
      const res = await axios.get(url, {
        params: params,
        withCredentials: true,
      });

      setUserList(res.data.data);
      setOptions(
        res.data.data.map((item: any) => {
          const latestBagianMesin =
            item.biodata_karyawan[0]?.bagian_mesin_karyawan?.slice(-1)[0]
              ?.nama_bagian_mesin || '';

          return {
            value: item.userid,
            label: `${item.biodata_karyawan[0]?.nik} - ${item.name} - ${item.biodata_karyawan[0]?.jabatan?.nama_jabatan} - ${latestBagianMesin}`,
          };
        }),
      );
    } catch (error: any) {
      console.log(error);
    }
  }

  const getCutiKhusus = async () => {
    const url = `${import.meta.env.VITE_API_LINK}/master/hr/cutiKhusus`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, { withCredentials: true });
      setCutiKhusus(res.data.data);

      const cutiOptions = res.data.data.map((item: CutiKhusus) => ({
        value: item.id,
        label: `${item.nama_cuti} - ${item.jumlah_hari} Hari`,
      }));

      setOptions2(cutiOptions);
      console.log(res.data);
    } catch (error: any) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Updated getKaryawanJadwal with date range parameters
  const getKaryawanJadwal = async (startDate?: string, endDate?: string) => {
    const staffUrl = `${import.meta.env.VITE_API_LINK}/hr/jadwalKaryawan`;
    const produksiUrl = `${import.meta.env.VITE_API_LINK}/hr/jadwalKaryawan`;

    const staffParams: any = { jenis_karyawan: 'staff' };
    const produksiParams: any = { jenis_karyawan: 'produksi' };

    // Add date range parameters if provided
    if (startDate) {
      staffParams.start_date = startDate;
      produksiParams.start_date = startDate;
    }
    if (endDate) {
      staffParams.end_date = endDate;
      produksiParams.end_date = endDate;
    }

    try {
      setIsLoading(true);
      const [staffRes, produksiRes] = await Promise.all([
        axios.get(staffUrl, {
          params: staffParams,
          withCredentials: true,
        }),
        axios.get(produksiUrl, {
          params: produksiParams,
          withCredentials: true,
        }),
      ]);

      setKaryawanJadwal(staffRes.data.data || []);
      setProduksiJadwal(produksiRes.data.data || []);
      console.log('Staff Jadwal:', staffRes.data);
      console.log('Produksi Jadwal:', produksiRes.data);
    } catch (error: any) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Holiday calculation functions
  const getHolidaysForEmployee = (employeeType: string): Date[] => {
    const scheduleData =
      employeeType === 'staff' ? karyawanJadwal : produksiJadwal;
    return scheduleData.map((item) => new Date(item.tanggal));
  };

  // NEW: Get holiday details for display
  const getHolidayDetailsForEmployee = (employeeType: string): JadwalItem[] => {
    return employeeType === 'staff' ? karyawanJadwal : produksiJadwal;
  };

  // NEW: Get holidays within date range for display
  const getHolidaysInRange = (
    startDate: Date,
    endDate: Date,
    employeeType: string,
  ): JadwalItem[] => {
    if (!startDate || !endDate || !employeeType) return [];

    const holidayDetails = getHolidayDetailsForEmployee(employeeType);
    return holidayDetails.filter((holiday) => {
      const holidayDate = new Date(holiday.tanggal);
      return holidayDate >= startDate && holidayDate <= endDate;
    });
  };

  const isHoliday = (date: Date, employeeType: string): boolean => {
    const holidays = getHolidaysForEmployee(employeeType);
    return holidays.some(
      (holiday) => holiday.toDateString() === date.toDateString(),
    );
  };

  const calculateWorkingDays = (
    startDate: Date,
    endDate: Date,
    employeeType: string,
  ): number => {
    if (!startDate || !endDate || startDate > endDate) return 0;

    let workingDays = 0;
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      if (!isHoliday(currentDate, employeeType)) {
        workingDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return workingDays;
  };

  // Updated utility function for calculating end date for cuti khusus
  const calculateEndDate = (): string => {
    if (tglDari && daysDifference && daysDifference > 0) {
      let addedWorkingDays = 0;
      const currentDate = new Date(tglDari);

      while (addedWorkingDays < daysDifference) {
        if (!isHoliday(currentDate, selectedEmployeeType)) {
          addedWorkingDays++;
        }

        // If we haven't reached the required working days, move to next day
        if (addedWorkingDays < daysDifference) {
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }

      return currentDate.toISOString().substring(0, 10);
    }
    return '';
  };

  // Event handlers
  const handleChangePointDepatment = (selected: any) => {
    const { value } = selected;
    const filteredData = userList.find(
      (item: Employee) => item.userid === value,
    );
    setSelectedEmployee(filteredData);
    if (filteredData) {
      console.log(filteredData.userid);
      console.log(filteredData.biodata_karyawan[0]?.sisa_cuti);
      setSisaCuti(filteredData.biodata_karyawan[0]?.sisa_cuti || 0);
      setIdKaryawan(filteredData.userid);
      setSelectedEmployeeType(
        filteredData.biodata_karyawan[0]?.tipe_karyawan || '',
      );
    }
  };

  const handleChangePointCuti = (selected: any) => {
    const { value } = selected;
    const filteredData = cutiKhusus.find(
      (item: CutiKhusus) => item.id === value,
    );

    if (filteredData) {
      console.log(filteredData.id);
      setDaysDifference(filteredData.jumlah_hari);
      setAlasanCuti(filteredData.nama_cuti);
    }
  };

  const handleStartDateChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newStartDate = new Date(event.target.value);
    setTglDari(newStartDate);

    // For cuti khusus, fetch schedule data when start date changes
    if (tipeCuti === 'khusus' && selectedEmployeeType) {
      const startDateStr = newStartDate.toISOString().substring(0, 10);
      // Calculate approximate end date for API call (add some buffer days)
      const approximateEndDate = new Date(newStartDate);
      approximateEndDate.setDate(approximateEndDate.getDate() + 30); // Add 30 days buffer
      const endDateStr = approximateEndDate.toISOString().substring(0, 10);

      await getKaryawanJadwal(startDateStr, endDateStr);
    }
  };

  const handleEndDateChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newEndDate = new Date(event.target.value);
    setTglSampai(newEndDate);

    // For cuti tahunan, fetch schedule data for the selected date range
    if (tipeCuti === 'tahunan' && tglDari && selectedEmployeeType) {
      const startDateStr = tglDari.toISOString().substring(0, 10);
      const endDateStr = newEndDate.toISOString().substring(0, 10);

      await getKaryawanJadwal(startDateStr, endDateStr);
    }
  };

  // Calculate days difference with holiday exclusion
  useEffect(() => {
    if (!masterSettings || !tglDari || !selectedEmployeeType) {
      setDaysDifference(null);
      setShowError(false);
      setShowErrorEarlyDate(false);
      return;
    }

    const today = new Date();
    const minimalPengajuanHari =
      masterSettings.minimal_pengajuan_cuti_hari || 3;
    const minDate = new Date();
    minDate.setDate(today.getDate() + parseInt(minimalPengajuanHari) - 1);

    // Check early date error
    if (tglDari < minDate) {
      setShowErrorEarlyDate(true);
    } else {
      setShowErrorEarlyDate(false);
    }

    if (tipeCuti === 'tahunan' && tglSampai) {
      if (tglDari <= tglSampai) {
        const workingDays = calculateWorkingDays(
          tglDari,
          tglSampai,
          selectedEmployeeType,
        );
        setDaysDifference(workingDays);
        setShowError(false);
      } else {
        setDaysDifference(null);
        setShowError(true);
        setShowErrorEarlyDate(false);
      }
    }
  }, [
    tglDari,
    tglSampai,
    masterSettings,
    selectedEmployeeType,
    tipeCuti,
    karyawanJadwal,
    produksiJadwal,
  ]);

  // Fetch schedule data when employee type changes
  useEffect(() => {
    const fetchScheduleForDateRange = async () => {
      if (selectedEmployeeType) {
        if (tipeCuti === 'tahunan' && tglDari && tglSampai) {
          const startDateStr = tglDari.toISOString().substring(0, 10);
          const endDateStr = tglSampai.toISOString().substring(0, 10);
          await getKaryawanJadwal(startDateStr, endDateStr);
        } else if (tipeCuti === 'khusus' && tglDari) {
          const startDateStr = tglDari.toISOString().substring(0, 10);
          const approximateEndDate = new Date(tglDari);
          approximateEndDate.setDate(approximateEndDate.getDate() + 30);
          const endDateStr = approximateEndDate.toISOString().substring(0, 10);
          await getKaryawanJadwal(startDateStr, endDateStr);
        }
      }
    };

    fetchScheduleForDateRange();
  }, [selectedEmployeeType, tipeCuti]);

  // Form submission
  const validateForm = (): boolean => {
    if (!tipeCuti) {
      alert('Tipe Cuti Belum Diisi');
      return false;
    }
    if (!tglDari) {
      alert('Tanggal Dari Belum Diisi');
      return false;
    }
    if (tipeCuti === 'tahunan' && !tglSampai) {
      alert('Tanggal Sampai Belum Diisi');
      return false;
    }
    if (!alasanCuti) {
      alert('Alasan Cuti Belum Diisi');
      return false;
    }
    return true;
  };

  const submitCuti = async (endpoint: string, data: any) => {
    const url = `${import.meta.env.VITE_API_LINK}/hr/pengajuanCuti`;
    try {
      setIsLoading(true);
      await axios.post(url, data, { withCredentials: true });

      // Show success message instead of reload
      alert('✅ Pengajuan cuti berhasil disubmit!');

      // Reset form after success
      resetForm();
    } catch (error: any) {
      console.log(error);
      alert('Terjadi kesalahan saat mengajukan cuti. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const postCuti = async () => {
    if (!validateForm()) return;

    const data = {
      id_karyawan: idKaryawan,
      id_pengaju: idPengaju,
      tipe_cuti: tipeCuti,
      dari: tglDari,
      sampai: tglSampai,
      jumlah_hari: daysDifference,
      alasan_cuti: alasanCuti,
      sisa_cuti: sisaCuti,
    };

    await submitCuti('pengajuanCuti', data);
  };

  const postCutiKhusus = async () => {
    if (!validateForm()) return;

    const calculatedEndDate = calculateEndDate();
    const data = {
      id_karyawan: idKaryawan,
      id_pengaju: idPengaju,
      tipe_cuti: tipeCuti,
      dari: tglDari,
      sampai: calculatedEndDate,
      jumlah_hari: daysDifference,
      alasan_cuti: alasanCuti,
      sisa_cuti: sisaCuti,
    };

    await submitCuti('pengajuanCuti', data);
  };

  const minimalPengajuanHari = masterSettings?.minimal_pengajuan_cuti_hari || 3;
  const endDate = calculateEndDate();

  // NEW: Get holidays for current date range
  const holidaysInRange =
    tipeCuti === 'tahunan' && tglDari && tglSampai
      ? getHolidaysInRange(tglDari, tglSampai, selectedEmployeeType)
      : tipeCuti === 'khusus' && tglDari && endDate
      ? getHolidaysInRange(tglDari, new Date(endDate), selectedEmployeeType)
      : [];

  return (
    <main className="overflow-x-scroll min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {isLoading && <Loading />}

      <div className="min-w-[700px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Employee Selection Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-white">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                clipRule="evenodd"
              />
            </svg>
            Pengajuan Cuti Karyawan
          </h2>
          <div className="grid grid-cols-2 gap-8">
            <div className="flex flex-col gap-3 relative z-[60]">
              <label className="text-blue-100 text-sm font-semibold uppercase tracking-wide">
                👤 Nama Karyawan
              </label>
              <div className="relative">
                <Select
                  placeholder="Pilih Karyawan..."
                  options={options}
                  value={
                    selectedEmployee
                      ? options.find(
                          (opt: any) => opt.value === selectedEmployee.userid,
                        )
                      : null
                  }
                  onChange={handleChangePointDepatment}
                  className="relative z-[60] w-full appearance-none rounded-lg border-2 border-white/20 bg-white/10 backdrop-blur-sm py-3 px-4 outline-none transition-all duration-200 focus:border-white focus:bg-white/20 active:border-white text-white placeholder-blue-200"
                  menuPortalTarget={document.body}
                  styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    menu: (base) => ({ ...base, zIndex: 9999 }),
                  }}
                />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <label className="text-blue-100 text-sm font-semibold uppercase tracking-wide">
                Hak Cuti Tersedia
              </label>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <span className="text-3xl font-bold text-white">
                  {sisaCuti}
                </span>
                <span className="text-blue-100 ml-2">hari</span>
              </div>
            </div>
          </div>
          <div className="pt-4">
            {selectedEmployee && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="text-sm text-orange-100 font-medium">
                  Tipe Karyawan:
                  <span className="font-bold text-white ml-2">
                    {selectedEmployee.biodata_karyawan[0]?.tipe_karyawan?.toUpperCase()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Leave Type Selection */}
        <div className="px-8 py-6 bg-gray-50 border-b border-gray-200">
          <div className="max-w-md">
            <label className="text-gray-700 text-sm font-semibold uppercase tracking-wide mb-3 block">
              Tipe Cuti
            </label>
            <div className="relative">
              <select
                value={tipeCuti}
                onChange={(e) =>
                  setTipeCuti(e.target.value as 'tahunan' | 'khusus' | '')
                }
                className="relative z-20 w-full appearance-none rounded-lg border-2 border-gray-300 bg-white px-4 py-3 pr-12 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 hover:border-gray-400 text-gray-800 font-medium"
              >
                <option value="" disabled className="text-gray-500">
                  Pilih Tipe Cuti
                </option>
                <option value="tahunan" className="text-gray-800 font-medium">
                  🏖️ TAHUNAN
                </option>
                <option value="khusus" className="text-gray-800 font-medium">
                  ⭐ KHUSUS
                </option>
              </select>
              <div className="absolute top-1/2 right-4 z-30 -translate-y-1/2 pointer-events-none">
                <svg
                  className="fill-current text-gray-400 transition-colors duration-200"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g opacity="0.8">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                      fill=""
                    />
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Conditional Form Content */}
        {tipeCuti === 'khusus' && (
          <div className="animate-fadeIn">
            <div className="grid grid-cols-2 px-8 py-8 gap-8 bg-white">
              <div className="flex flex-col gap-6 z-[50] relative">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                  <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Detail Waktu Cuti
                  </h3>
                  <div className="grid grid-cols-2 gap-4 items-start">
                    <div className="flex flex-col gap-3">
                      <label className="text-sm text-purple-700 font-semibold">
                        📅 Tanggal Cuti
                      </label>
                      <input
                        className="rounded-lg bg-white border-2 border-purple-300 px-4 py-3 text-gray-800 font-medium focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                        type="date"
                        onChange={handleStartDateChange}
                      />
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
                        <div className="text-sm text-purple-700 font-semibold mb-1">
                          ⏰ Durasi
                        </div>
                        <div className="text-2xl font-bold text-purple-800">
                          {daysDifference} hari
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-purple-200">
                        <div className="text-xs text-purple-600 font-medium">
                          Berakhir:{' '}
                          {endDate ? convertTimeStampToDateOnly(endDate) : '-'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* NEW: Holiday List for Cuti Khusus */}
                {holidaysInRange.length > 0 && (
                  <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                    <h4 className="text-sm font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                      🏖️ Hari Libur dalam Periode Cuti
                    </h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {holidaysInRange.map((holiday) => (
                        <div
                          key={holiday.id}
                          className="flex justify-between items-center text-xs bg-white rounded p-2 border border-yellow-100"
                        >
                          <span className="text-yellow-700 font-medium">
                            {convertTimeStampToDateOnly(holiday.tanggal)}
                          </span>
                          <span className="text-yellow-600">
                            {holiday.nama_jadwal}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-3 relative z-[50]">
                  <label className="text-gray-700 text-sm font-semibold uppercase tracking-wide">
                    🏷️ Kategori Cuti Khusus
                  </label>
                  <Select
                    placeholder="Pilih kategori..."
                    options={options2}
                    onChange={handleChangePointCuti}
                    className="relative z-[50] w-full appearance-none rounded-lg border-2 border-gray-300 bg-white py-3 px-4 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-800"
                    menuPortalTarget={document.body}
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                      menu: (base) => ({ ...base, zIndex: 9999 }),
                    }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-gray-700 text-sm font-semibold uppercase tracking-wide">
                  📝 Alasan Cuti
                </label>
                <div className="relative">
                  <textarea
                    name="alasan_cuti"
                    readOnly
                    value={alasanCuti}
                    className="peer h-full min-h-[200px] w-full resize-none border-2 border-gray-300 rounded-lg px-4 py-4 text-gray-800 bg-gray-50 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    placeholder="Alasan akan terisi otomatis berdasarkan kategori yang dipilih..."
                  />
                  <div className="absolute top-3 right-3 text-gray-400">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex w-full justify-end items-end px-8 py-6 bg-gray-50 border-t border-gray-200">
              {(tipeCuti === 'khusus' || sisaCuti >= 1) && (
                <button
                  onClick={postCutiKhusus}
                  disabled={isLoading}
                  className={`flex px-8 py-3 justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:hover:shadow-lg`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  AJUKAN CUTI
                </button>
              )}
            </div>
          </div>
        )}

        {tipeCuti === 'tahunan' && (
          <div className="animate-fadeIn">
            <div className="grid grid-cols-2 gap-8 px-8 py-8 bg-white">
              <div className="flex flex-col gap-6">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                  <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Periode Cuti Tahunan
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-3">
                      <label className="text-sm text-green-700 font-semibold">
                        📅 Mulai Tanggal
                      </label>
                      <input
                        className="rounded-lg bg-white border-2 border-green-300 px-4 py-3 text-gray-800 font-medium focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                        type="date"
                        onChange={handleStartDateChange}
                      />
                    </div>
                    <div className="flex flex-col gap-3">
                      <label className="text-sm text-green-700 font-semibold">
                        📅 Sampai Tanggal
                      </label>
                      <input
                        className="rounded-lg bg-white border-2 border-green-300 px-4 py-3 text-gray-800 font-medium focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                        type="date"
                        onChange={handleEndDateChange}
                      />
                    </div>
                  </div>
                </div>

                {daysDifference !== null &&
                  !showError &&
                  !showErrorEarlyDate && (
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-blue-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <p className="text-blue-700 font-medium">
                          Durasi:{' '}
                          <span className="font-bold text-lg">
                            {daysDifference} hari
                          </span>
                          <span className="text-sm block text-blue-600">
                            (hari kerja, tidak termasuk hari libur)
                          </span>
                        </p>
                      </div>
                    </div>
                  )}
                {/* NEW: Holiday List for Cuti Khusus */}
                {holidaysInRange.length > 0 && (
                  <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                    <h4 className="text-sm font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                      🏖️ Hari Libur dalam Periode Cuti
                    </h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {holidaysInRange.map((holiday) => (
                        <div
                          key={holiday.id}
                          className="flex justify-between items-center text-xs bg-white rounded p-2 border border-yellow-100"
                        >
                          <span className="text-yellow-700 font-medium">
                            {convertTimeStampToDateOnly(holiday.tanggal)}
                          </span>
                          <span className="text-yellow-600">
                            {holiday.nama_jadwal}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {showError && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-red-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-red-700 font-medium">
                        Tanggal mulai tidak boleh lebih besar dari tanggal
                        selesai
                      </p>
                    </div>
                  </div>
                )}

                {showErrorEarlyDate && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-red-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-red-700 font-medium">
                        Pengajuan Cuti harus diajukan minimal{' '}
                        {minimalPengajuanHari} hari sebelumnya
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex w-full flex-col gap-3">
                <label className="text-gray-700 text-sm font-semibold uppercase tracking-wide">
                  📝 Alasan Cuti
                </label>
                <div className="relative flex-1">
                  <textarea
                    name="alasan_cuti"
                    value={alasanCuti}
                    onChange={(e) => setAlasanCuti(e.target.value)}
                    className="peer h-full min-h-[280px] w-full resize-none border-2 border-gray-300 rounded-lg px-4 py-4 text-gray-800 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    placeholder="Jelaskan alasan pengajuan cuti tahunan Anda..."
                  />
                  <div className="absolute top-3 right-3 text-gray-400">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex w-full justify-end items-end px-8 py-6 bg-gray-50 border-t border-gray-200">
              {!(showError || showErrorEarlyDate) &&
                (tipeCuti === 'tahunan' || sisaCuti >= 1) && (
                  <button
                    onClick={postCuti}
                    disabled={isLoading || showErrorEarlyDate}
                    className={`flex px-8 py-3 justify-center items-center gap-2 ${
                      showErrorEarlyDate
                        ? 'bg-gray-400'
                        : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl'
                    } text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:hover:shadow-lg`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    AJUKAN CUTI
                  </button>
                )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default BuatCutiKeHR;
