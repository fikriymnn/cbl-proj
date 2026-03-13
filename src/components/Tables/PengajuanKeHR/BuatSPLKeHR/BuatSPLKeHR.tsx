import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import axios from 'axios';
import convertTimeStampToDate from '../../../../utils/converDateTime';
import convertTimeStampToDateTime from '../../../../utils/converDateTime';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

function BuatSPLKeHR() {
  const [options, setOptions] = useState([]);
  const [options3, setOptions3] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  interface UserData {
    userid: string;
    name: string;
    sisa_cuti: number;
    biodata_karyawan: Array<{
      nik: string;
      nama_jabatan: string;
      bagian_mesin_karyawan?: Array<{
        nama_bagian_mesin: string;
      }>;
    }>;
  }

  const [userList, setUserList] = useState<UserData[]>([]);
  const [joList, setJoList] = useState<Array<{ e_no_jo: string }>>([]);
  const [idKaryawan, setIdKaryawan] = useState<string[]>([]);
  const [me, setMe] = useState(null);
  const [idPengaju, setIdPengaju] = useState(null);

  // First period
  const [tglDari, setTglDari] = useState('');
  const [tglSampai, setTglSampai] = useState('');

  // Second period (optional)
  const [tglDari2, setTglDari2] = useState('');
  const [tglSampai2, setTglSampai2] = useState('');
  const [hasSecondPeriod, setHasSecondPeriod] = useState(false);

  const [sisaCuti, setSisaCuti] = useState(0);
  const [joReal, setjoReal] = useState('');
  const [hourDifference, setHourDifference] = useState(0);
  const [alasanLembur, setAlasanLembur] = useState('');
  const [targetLembur, setTargetLembur] = useState('');
  const [tipeLembur, setTipeLembur] = useState('');
  const [jumlahMakan, setJumlahMakan] = useState('');
  const [timeError, setTimeError] = useState('');
  const [timeError2, setTimeError2] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedJobOrder, setSelectedJobOrder] = useState(null);

  // Draft table states
  const [draftLembur, setDraftLembur] = useState<any>();
  const [draftPage, setDraftPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'draft' | 'request user'>(
    'draft',
  );

  // Edit mode states
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    getMe();
    getjoReal();
  }, []);

  useEffect(() => {
    if (idPengaju) {
      getDraftLembur();
    }
  }, [draftPage, idPengaju, statusFilter]);

  // Function to clear all form fields
  const clearForm = () => {
    setIdKaryawan([]);
    setTglDari('');
    setTglSampai('');
    setTglDari2('');
    setTglSampai2('');
    setHasSecondPeriod(false);
    setSisaCuti(0);
    setjoReal('');
    setHourDifference(0);
    setAlasanLembur('');
    setTargetLembur('');
    setTipeLembur('');
    setJumlahMakan('');
    setTimeError('');
    setTimeError2('');
    setSelectedEmployees([]);
    setSelectedJobOrder(null);
    setIsEditMode(false);
    setEditingId(null);
  };

  async function getMe() {
    const url = `${import.meta.env.VITE_API_LINK}/me`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      setMe(res.data);
      setIdPengaju(res.data.id_karyawan);

      const divisiBawahan = res.data.divisi_bawahan;

      // Pass both department and divisi_bawahan to getMasterUser
      getMasterUser(
        res?.data.karyawan.biodata_karyawan[0]?.id_department,

        divisiBawahan,
      );

      console.log('getme', res.data);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  async function getMasterUser(id: any, divisiBawahan: any) {
    const url = `${import.meta.env.VITE_API_LINK}/hr/karyawan`;

    // Build params object
    const params: any = {
      is_active: true,
      id_department: id,
    };

    // if (
    //   divisiBawahan !== null &&
    //   divisiBawahan !== undefined &&
    //   divisiBawahan !== ''
    // ) {
    //   params.divisi_bawahan = divisiBawahan;
    // }

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
            label: `${item.biodata_karyawan[0]?.nik} - ${item.name} - ${item.biodata_karyawan[0]?.jabatan?.nama_jabatan} - ${latestBagianMesin} - ${item.biodata_karyawan[0]?.divisi?.nama_divisi}`,
          };
        }),
      );
    } catch (error: any) {
      console.log(error);
    }
  }

  async function getjoReal() {
    const url = `${import.meta.env.VITE_API_LINK_P1}/api/list-jo-realtime`;
    try {
      const res = await axios.get(url, {});

      setJoList(res.data.data);
      setOptions3(
        res.data.data.map((item: any) => ({
          value: item.e_no_jo,
          label: item.e_no_jo,
        })),
      );
    } catch (error) {
      console.log(error);
    }
  }

  async function getDraftLembur() {
    const url = `${import.meta.env.VITE_API_LINK}/hr/pengajuanLembur`;
    try {
      const params: any = {
        status: statusFilter,
        page: draftPage,
        limit: 10,
      };

      const res = await axios.get(url, {
        params,
        withCredentials: true,
      });
      setDraftLembur(res.data);
      console.log('Draft data:', res.data);
    } catch (error: any) {
      console.log(error);
    }
  }

  // Helper function to convert ISO 8601 UTC timestamp to datetime-local format
  const formatDateTimeLocal = (timestamp: string | null) => {
    if (!timestamp || timestamp === null) return '';

    try {
      // Parse the ISO 8601 UTC timestamp (e.g., "2026-02-09T10:00:00.000Z")
      const date = new Date(timestamp);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', timestamp);
        return '';
      }

      // Format: YYYY-MM-DDTHH:mm (local time)
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
      console.error('Error formatting date:', timestamp, error);
      return '';
    }
  };

  const handleEdit = (data: any) => {
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Set edit mode
    setIsEditMode(true);
    setEditingId(data.id);

    // Populate form with existing data - convert to datetime-local format
    setTglDari(formatDateTimeLocal(data.dari));
    setTglSampai(formatDateTimeLocal(data.sampai));

    // Check if there's a second period
    if (data.dari_2 && data.dari_2 !== '') {
      setHasSecondPeriod(true);
      setTglDari2(formatDateTimeLocal(data.dari_2));
      setTglSampai2(formatDateTimeLocal(data.sampai_2));
    } else {
      setHasSecondPeriod(false);
      setTglDari2('');
      setTglSampai2('');
    }

    // Set job order if exists
    if (data.jo_lembur && data.jo_lembur !== '') {
      const selectedJO = options3.find(
        (option: any) => option.value === data.jo_lembur,
      );
      setSelectedJobOrder(selectedJO || null);
      setjoReal(data.jo_lembur);
    }

    // Set other fields
    setAlasanLembur(data.alasan_lembur || '');
    setTargetLembur(data.target_lembur || '');
    setTipeLembur(data.tipe_lembur || '');
    setJumlahMakan(data.jumlah_makan || '');

    // Set employee data (read-only in edit mode)
    if (data.karyawan) {
      const employeeOption = options.find(
        (option: any) => option.value === data.karyawan.userid,
      );
      if (employeeOption) {
        setSelectedEmployees([employeeOption]);
        setIdKaryawan([data.karyawan.userid]);
      }
    }
  };

  const handleCancelEdit = () => {
    if (
      window.confirm(
        'Apakah Anda yakin ingin membatalkan perubahan? Data yang telah diisi akan hilang.',
      )
    ) {
      clearForm();
    }
  };

  const handleSendToUser = async (id: string) => {
    if (
      !window.confirm(
        'Apakah Anda yakin ingin mengirim data lembur ini ke user?',
      )
    ) {
      return;
    }

    setIsLoading(true);
    const url = `${
      import.meta.env.VITE_API_LINK
    }/hr/pengajuanLembur/send/${id}`;
    try {
      const res = await axios.put(
        url,
        {},
        {
          withCredentials: true,
        },
      );

      setIsLoading(false);
      alert('Data lembur berhasil dikirim ke user!');

      // Refresh draft table
      getDraftLembur();
    } catch (error) {
      setIsLoading(false);
      console.log(error);
      alert('Terjadi kesalahan saat mengirim data');
    }
  };

  const handleChangePointDepatment = (selectedOptions: any) => {
    // In edit mode, prevent changing employees
    if (isEditMode) {
      return;
    }

    setSelectedEmployees(selectedOptions || []);

    if (!selectedOptions || selectedOptions.length === 0) {
      setSisaCuti(0);
      setIdKaryawan([]);
      return;
    }

    const selectedIds = selectedOptions.map((option: any) => option.value);
    const filteredData = userList.filter((item: any) =>
      selectedIds.includes(item.userid),
    );

    setSisaCuti(filteredData.length > 0 ? filteredData[0].sisa_cuti : 0);
    setIdKaryawan(filteredData?.map((user: any) => user.userid));
  };

  const handleChangePointDepatmentNoJO = (selected: any) => {
    setSelectedJobOrder(selected);

    if (!selected) {
      setjoReal('');
      return;
    }

    const { value } = selected;
    const filteredData = joList.find((item: any) => item.e_no_jo === value);
    setjoReal(filteredData?.e_no_jo || '');
  };

  const validateTimeIncrement = (dari: any, sampai: any) => {
    if (!dari || !sampai) {
      return { isValid: false, error: 'Please fill in both date fields.' };
    }

    const dariDate = new Date(dari);
    const sampaiDate = new Date(sampai);

    if (sampaiDate <= dariDate) {
      return { isValid: false, error: 'End time must be after start time.' };
    }

    const timeDiffMs = sampaiDate.getTime() - dariDate.getTime();
    let hourDiff = timeDiffMs / (1000 * 60 * 60);

    // Check if the time difference is in 30-minute increments
    const remainder = (hourDiff * 60) % 30;
    if (remainder !== 0) {
      return {
        isValid: false,
        error:
          'Durasi lembur harus dalam kelipatan 30 menit (misalnya: 0.5j, 1j, 1.5j, 2j)',
      };
    }

    if (hourDiff < 0.5) {
      return {
        isValid: false,
        error: 'Minimal durasi lembur adalah 30 menit.',
      };
    }

    return { isValid: true, error: '', hours: hourDiff };
  };

  // Add useEffect to recalculate total hours whenever time values change
  useEffect(() => {
    let totalHours = 0;

    // Calculate first period
    if (tglDari && tglSampai) {
      const validation1 = validateTimeIncrement(tglDari, tglSampai);
      if (validation1.isValid) {
        totalHours += validation1.hours || 0;
      }
    }

    // Calculate second period if exists
    if (hasSecondPeriod && tglDari2 && tglSampai2) {
      const validation2 = validateTimeIncrement(tglDari2, tglSampai2);
      if (validation2.isValid) {
        totalHours += validation2.hours || 0;
      }
    }

    setHourDifference(totalHours);
  }, [tglDari, tglSampai, tglDari2, tglSampai2, hasSecondPeriod]);

  const calculateTotalHours = () => {
    let totalHours = 0;

    // Calculate first period
    if (tglDari && tglSampai) {
      const validation1 = validateTimeIncrement(tglDari, tglSampai);
      if (validation1.isValid) {
        totalHours += validation1.hours || 0;
      }
    }

    // Calculate second period if exists
    if (hasSecondPeriod && tglDari2 && tglSampai2) {
      const validation2 = validateTimeIncrement(tglDari2, tglSampai2);
      if (validation2.isValid) {
        totalHours += validation2.hours || 0;
      }
    }

    return totalHours;
  };

  const removeSecondPeriod = () => {
    setHasSecondPeriod(false);
    setTglDari2('');
    setTglSampai2('');
    setTimeError2('');
  };

  const handleDariChange = (value: any) => {
    setTglDari(value);
    if (tglSampai) {
      const validation = validateTimeIncrement(value, tglSampai);
      setTimeError(validation.error);
    }
    calculateTotalHours();
  };

  const handleSampaiChange = (value: any) => {
    setTglSampai(value);
    if (tglDari) {
      const validation = validateTimeIncrement(tglDari, value);
      setTimeError(validation.error);
    }
    calculateTotalHours();
  };

  const handleDari2Change = (value: any) => {
    setTglDari2(value);
    if (tglSampai2) {
      const validation = validateTimeIncrement(value, tglSampai2);
      setTimeError2(validation.error);
    }
    calculateTotalHours();
  };

  const handleSampai2Change = (value: any) => {
    setTglSampai2(value);
    if (tglDari2) {
      const validation = validateTimeIncrement(tglDari2, value);
      setTimeError2(validation.error);
    }
    calculateTotalHours();
  };

  const addSecondPeriod = () => {
    setHasSecondPeriod(true);
  };

  const formatDuration = (hours: any) => {
    if (hours === 0) return '0 jam';
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);

    if (minutes === 0) {
      return `${wholeHours} jam`;
    } else if (wholeHours === 0) {
      return `${minutes} menit`;
    } else {
      return `${wholeHours} jam ${minutes} menit`;
    }
  };

  const postSPL = async () => {
    if (!idKaryawan.length) {
      alert('Karyawan belum dipilih');
      return;
    }
    if (!tglDari || !tglSampai) {
      alert('Tanggal dan waktu periode pertama belum lengkap');
      return;
    }
    if (hasSecondPeriod && (!tglDari2 || !tglSampai2)) {
      alert('Tanggal dan waktu periode kedua belum lengkap');
      return;
    }
    if (timeError || timeError2) {
      alert('Perbaiki error waktu terlebih dahulu');
      return;
    }
    if (!alasanLembur) {
      alert('Alasan lembur belum diisi');
      return;
    }

    setIsLoading(true);
    const url = `${import.meta.env.VITE_API_LINK}/hr/pengajuanLembur`;
    try {
      const totalHours = calculateTotalHours();

      const requestData = {
        karyawan: idKaryawan,
        id_pengaju: idPengaju,
        dari: tglDari,
        sampai: tglSampai,
        dari_2: hasSecondPeriod ? tglDari2 : '',
        sampai_2: hasSecondPeriod ? tglSampai2 : '',
        jo_lembur: joReal,
        lama_lembur: totalHours,
        alasan_lembur: alasanLembur,
        target_lembur: targetLembur,
        isIstirahat: '',
        tipe_lembur: tipeLembur,
        jumlah_makan: jumlahMakan,
      };

      console.log('Request data:', requestData);

      const res = await axios.post(url, requestData, {
        withCredentials: true,
      });

      setIsLoading(false);
      console.log(res);
      alert('Pengajuan lembur berhasil disubmit!');

      // Clear form and refresh draft table
      clearForm();
      getDraftLembur();
    } catch (error) {
      setIsLoading(false);
      console.log(error);
      alert('Terjadi kesalahan saat mengirim pengajuan');
    }
  };

  const updateSPL = async () => {
    if (!editingId) {
      alert('ID pengajuan tidak ditemukan');
      return;
    }
    if (!tglDari || !tglSampai) {
      alert('Tanggal dan waktu periode pertama belum lengkap');
      return;
    }
    if (hasSecondPeriod && (!tglDari2 || !tglSampai2)) {
      alert('Tanggal dan waktu periode kedua belum lengkap');
      return;
    }
    if (timeError || timeError2) {
      alert('Perbaiki error waktu terlebih dahulu');
      return;
    }
    if (!alasanLembur) {
      alert('Alasan lembur belum diisi');
      return;
    }

    setIsLoading(true);
    const url = `${
      import.meta.env.VITE_API_LINK
    }/hr/pengajuanLembur/${editingId}`;
    try {
      const totalHours = calculateTotalHours();

      const requestData = {
        dari: tglDari,
        sampai: tglSampai,
        dari_2: hasSecondPeriod ? tglDari2 : '',
        sampai_2: hasSecondPeriod ? tglSampai2 : '',
        jo_lembur: joReal,
        lama_lembur: totalHours,
        alasan_lembur: alasanLembur,
        target_lembur: targetLembur,
        isIstirahat: '',
        tipe_lembur: tipeLembur,
        jumlah_makan: jumlahMakan,
      };

      console.log('Update request data:', requestData);

      const res = await axios.put(url, requestData, {
        withCredentials: true,
      });

      setIsLoading(false);
      console.log(res);
      alert('Pengajuan lembur berhasil diupdate!');

      // Clear form and refresh draft table
      clearForm();
      getDraftLembur();
    } catch (error) {
      setIsLoading(false);
      console.log(error);
      alert('Terjadi kesalahan saat mengupdate pengajuan');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 ">
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-gray-700 font-medium">Processing...</span>
          </div>
        </div>
      )}

      <div className="w-full mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden mb-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-white">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            {isEditMode
              ? 'Edit Pengajuan Lembur'
              : 'Pengajuan Surat Perintah Lembur (SPL)'}
          </h2>
          {isEditMode && (
            <p className="text-blue-100 text-sm mt-2">
              Mode Edit - Karyawan tidak dapat diubah
            </p>
          )}
        </div>

        {/* Employee and Job Selection */}
        <div className="px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 border-b border-gray-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="flex flex-col gap-3">
              <label className="text-white text-sm font-semibold uppercase tracking-wide flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
                Nama Karyawan {isEditMode && '(Tidak dapat diubah)'}
              </label>
              <Select
                isMulti
                placeholder="Search and select employees..."
                options={options}
                value={selectedEmployees}
                onChange={handleChangePointDepatment}
                isDisabled={isEditMode}
                className="relative z-[60] w-full appearance-none rounded-lg border-2 border-white/20 bg-white/10 backdrop-blur-sm py-3 px-4 outline-none transition-all duration-200 focus:border-white focus:bg-white/20 active:border-white text-white placeholder-orange-200"
                menuPortalTarget={document.body}
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  menu: (base) => ({ ...base, zIndex: 9999 }),
                }}
              />
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-white text-sm font-semibold uppercase tracking-wide flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2v8h12V6H4z"
                    clipRule="evenodd"
                  />
                </svg>
                Job Order (JO)
              </label>
              <Select
                placeholder="Select Job Order..."
                options={options3}
                value={selectedJobOrder}
                onChange={handleChangePointDepatmentNoJO}
                className="relative z-[60] w-full appearance-none rounded-lg border-2 border-white/20 bg-white/10 backdrop-blur-sm py-3 px-4 outline-none transition-all duration-200 focus:border-white focus:bg-white/20 active:border-white text-white placeholder-orange-200"
                menuPortalTarget={document.body}
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  menu: (base) => ({ ...base, zIndex: 9999 }),
                }}
              />
            </div>
          </div>
        </div>

        {/* Time and Details Section */}
        <div className="px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Time Selection */}
            <div className="flex flex-col gap-6">
              {/* First Period */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
                <h3 className="text-lg font-semibold text-orange-800 mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Periode Lembur 1
                </h3>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-orange-700 font-semibold">
                      Start Time
                    </label>
                    <input
                      className="rounded-lg bg-white border-2 border-orange-300 px-4 py-3 text-gray-800 font-medium focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
                      type="datetime-local"
                      value={tglDari}
                      onChange={(e) => handleDariChange(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-orange-700 font-semibold">
                      End Time
                    </label>
                    <input
                      className="rounded-lg bg-white border-2 border-orange-300 px-4 py-3 text-gray-800 font-medium focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
                      type="datetime-local"
                      value={tglSampai}
                      onChange={(e) => handleSampaiChange(e.target.value)}
                    />
                  </div>
                </div>

                {timeError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p className="text-red-700 text-sm font-medium flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {timeError}
                    </p>
                  </div>
                )}
              </div>

              {/* Second Period */}
              {hasSecondPeriod && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-green-800 flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Periode Lembur 2
                    </h3>
                    <button
                      onClick={removeSecondPeriod}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg p-2 transition-all duration-200"
                      title="Hapus periode kedua"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm text-green-700 font-semibold">
                        Start Time
                      </label>
                      <input
                        className="rounded-lg bg-white border-2 border-green-300 px-4 py-3 text-gray-800 font-medium focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                        type="datetime-local"
                        value={tglDari2}
                        onChange={(e) => handleDari2Change(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm text-green-700 font-semibold">
                        End Time
                      </label>
                      <input
                        className="rounded-lg bg-white border-2 border-green-300 px-4 py-3 text-gray-800 font-medium focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                        type="datetime-local"
                        value={tglSampai2}
                        onChange={(e) => handleSampai2Change(e.target.value)}
                      />
                    </div>
                  </div>

                  {timeError2 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                      <p className="text-red-700 text-sm font-medium flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {timeError2}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Add Second Period Button */}
              {!hasSecondPeriod && (
                <button
                  onClick={addSecondPeriod}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Tambah Periode Kedua
                </button>
              )}

              {/* Total Duration Display */}
              {hourDifference > 0 && !timeError && !timeError2 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <p className="text-blue-700 font-medium">
                        Total Durasi Lembur:{' '}
                        <span className="font-bold text-lg">
                          {formatDuration(hourDifference)}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Reason and Target */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <label className="text-gray-700 text-sm font-semibold uppercase tracking-wide flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Alasan Lembur
                </label>
                <textarea
                  value={alasanLembur}
                  onChange={(e) => setAlasanLembur(e.target.value)}
                  className="min-h-[120px] w-full resize-none border-2 border-gray-300 rounded-lg px-4 py-4 text-gray-800 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  placeholder="Explain the reason for overtime work..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex w-full justify-end items-center gap-4 px-8 py-6 bg-gray-50 border-t border-gray-200">
          {isEditMode && (
            <button
              onClick={handleCancelEdit}
              disabled={isLoading}
              className="flex px-8 py-3 justify-center items-center gap-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-gray-600 hover:to-gray-700 disabled:from-gray-400 disabled:to-gray-500 shadow-lg hover:shadow-xl text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              BATAL
            </button>
          )}
          <button
            onClick={isEditMode ? updateSPL : postSPL}
            disabled={
              isLoading || !!timeError || !!timeError2 || !idKaryawan.length
            }
            className="flex px-8 py-3 justify-center items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 shadow-lg hover:shadow-xl text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            {isLoading
              ? 'PROCESSING...'
              : isEditMode
              ? 'UPDATE LEMBUR'
              : 'AJUKAN LEMBUR'}
          </button>
        </div>
      </div>

      {/* Draft Table Section */}
      <div className="w-full mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Draft Header */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 px-8 py-6 text-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
                  clipRule="evenodd"
                />
              </svg>
              {statusFilter === 'draft' ? 'Draft' : 'Request User'} Pengajuan
              Lembur
            </h2>

            {/* Status Filter Toggle */}
            <div className="flex items-center gap-1 bg-white/20 rounded-xl p-1">
              <button
                onClick={() => {
                  setStatusFilter('draft');
                  setDraftPage(1);
                }}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                  statusFilter === 'draft'
                    ? 'bg-white text-orange-600 shadow-md'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                Draft
              </button>
              <button
                onClick={() => {
                  setStatusFilter('request user');
                  setDraftPage(1);
                }}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                  statusFilter === 'request user'
                    ? 'bg-white text-orange-600 shadow-md'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                Request User
              </button>
            </div>
          </div>
        </div>

        {/* Draft Table */}
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            <div className="grid grid-cols-12 px-8 py-4 border-b-4 border-gray-200 gap-2 bg-gray-50">
              <label className="text-neutral-700 text-sm font-bold">No</label>
              <label className="text-neutral-700 text-sm font-bold col-span-3">
                Tanggal
              </label>
              <label className="text-neutral-700 text-sm font-bold">Lama</label>
              <label className="text-neutral-700 text-sm font-bold col-span-2">
                Department
              </label>
              <label className="text-neutral-700 text-sm font-bold col-span-2">
                Personnel
              </label>
              <label className="text-neutral-700 text-sm font-bold ">
                Status
              </label>
              <label className="text-neutral-700 text-sm font-bold col-span-2 justify-start">
                Action
              </label>
            </div>

            {draftLembur?.data && draftLembur.data.length > 0 ? (
              draftLembur.data.map((data: any, i: number) => (
                <div
                  key={data.id || i}
                  className="grid grid-cols-12 border-b-4 border-gray-200 gap-2 items-center px-8 py-4 hover:bg-gray-50 transition-colors"
                >
                  <label className="text-neutral-600 text-sm font-semibold">
                    {(draftPage - 1) * 10 + i + 1}
                  </label>

                  <div className="flex flex-col gap-1 col-span-3">
                    <label className="text-neutral-600 text-xs">
                      Dari: {convertTimeStampToDateTime(data.dari)}
                    </label>
                    <label className="text-neutral-600 text-xs">
                      Sampai: {convertTimeStampToDateTime(data.sampai)}
                    </label>
                    {data.dari_2 && data.dari_2 !== '' && (
                      <label className="text-neutral-600 text-xs">
                        Dari (2): {convertTimeStampToDateTime(data.dari_2)}
                      </label>
                    )}
                    {data.sampai_2 && data.sampai_2 !== '' && (
                      <label className="text-neutral-600 text-xs">
                        Sampai (2): {convertTimeStampToDateTime(data.sampai_2)}
                      </label>
                    )}
                  </div>

                  <label className="text-neutral-600 text-sm font-semibold">
                    {data.lama_lembur} Jam
                  </label>

                  <label className="text-neutral-600 text-sm col-span-2">
                    {data.karyawan_pengaju?.biodata_karyawan[0]?.department
                      ?.nama_department || '-'}
                  </label>

                  <label className="text-neutral-600 text-sm col-span-2">
                    {data.karyawan?.name || '-'}
                  </label>

                  <label
                    className={`text-sm font-bold uppercase ${
                      data.status === 'draft'
                        ? 'text-orange-600'
                        : 'text-blue-600'
                    }`}
                  >
                    {data.status}
                  </label>

                  <div className="flex justify-start items-center gap-2 col-span-2">
                    {/* Edit button: only shown for draft status */}
                    {data.status === 'draft' && (
                      <button
                        onClick={() => handleEdit(data)}
                        disabled={isLoading}
                        className="px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:from-gray-400 disabled:to-gray-500 text-white text-xs font-bold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed flex items-center gap-2"
                        title="Edit data"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Edit
                      </button>
                    )}
                    {/* Send button: only shown for draft status */}
                    {data.status === 'draft' && (
                      <button
                        onClick={() => handleSendToUser(data.id)}
                        disabled={isLoading}
                        className="px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-500 text-white text-xs font-bold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed flex items-center gap-2"
                        title="Send to user"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                        Send
                      </button>
                    )}
                    {/* Read-only badge for request user status */}
                    {data.status !== 'draft' && (
                      <span className="px-3 py-2 bg-gray-100 text-gray-500 text-xs font-semibold rounded-lg flex items-center gap-1 border border-gray-200">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Read Only
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-8 py-12 text-center">
                <p className="text-gray-500 text-lg">
                  Tidak ada data{' '}
                  {statusFilter === 'draft' ? 'draft' : 'request user'} saat ini
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {draftLembur?.total_page > 1 && (
          <div className="flex items-center justify-center gap-2 px-8 py-6 bg-gray-50 border-t border-gray-200">
            <Stack spacing={2}>
              <Pagination
                count={draftLembur?.total_page}
                color="primary"
                page={draftPage}
                onChange={(e, page) => setDraftPage(page)}
              />
            </Stack>
          </div>
        )}
      </div>
    </main>
  );
}

export default BuatSPLKeHR;
