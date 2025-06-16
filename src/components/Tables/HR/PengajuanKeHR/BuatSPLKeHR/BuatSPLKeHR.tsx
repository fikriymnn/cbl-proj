import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import axios from 'axios';

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
  const [error, setError] = useState('');
  const [isCheck, setIsCheck] = useState(false);
  const [me, setMe] = useState(null);
  const [idPengaju, setIdPengaju] = useState(null);
  const [tglDari, setTglDari] = useState('');
  const [tglSampai, setTglSampai] = useState('');
  const [sisaCuti, setSisaCuti] = useState(0);
  const [joReal, setjoReal] = useState('');
  const [hourDifference, setHourDifference] = useState(0);
  const [alasanLembur, setAlasanLembur] = useState('');
  const [targetLembur, setTargetLembur] = useState('');
  const [tipeLembur, setTipeLembur] = useState('');
  const [jumlahMakan, setJumlahMakan] = useState('');
  const [timeError, setTimeError] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedJobOrder, setSelectedJobOrder] = useState(null);

  useEffect(() => {
    getMe();
    getMasterUser();
    getjoReal();
  }, []);

  // Function to clear all form fields
  const clearForm = () => {
    setIdKaryawan([]);
    setTglDari('');
    setTglSampai('');
    setSisaCuti(0);
    setjoReal('');
    setHourDifference(0);
    setAlasanLembur('');
    setTargetLembur('');
    setTipeLembur('');
    setJumlahMakan('');
    setTimeError('');
    setSelectedEmployees([]);
    setSelectedJobOrder(null);
    setIsCheck(false);
  };

  async function getMe() {
    const url = `${import.meta.env.VITE_API_LINK}/me`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      setMe(res.data);
      setIdPengaju(res.data.id_karyawan);
      console.log('getme', res.data);
    } catch (error) {
      console.log(error || 'Error getting user data');
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
    } catch (error) {
      console.log(error);
    }
  }

  async function getjoReal() {
    const url = `${import.meta.env.VITE_API_LINK_P1}/api/list-jo-realtime`;
    try {
      const res = await axios.get(url, {});

      console.log(res.data);
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

  const handleChangePointDepatment = (selectedOptions: any) => {
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
      setTimeError('Please fill in both date fields.');
      return false;
    }

    const dariDate = new Date(dari);
    const sampaiDate = new Date(sampai);

    if (sampaiDate <= dariDate) {
      setTimeError('End time must be after start time.');
      return false;
    }

    const timeDiffMs = sampaiDate.getTime() - dariDate.getTime();
    let hourDiff = timeDiffMs / (1000 * 60 * 60);

    if (isCheck) {
      hourDiff -= 0.5; // Subtract 30 minutes (0.5 hours) for break
    }

    // Check if the time difference is in 30-minute increments
    const remainder = (hourDiff * 60) % 30;
    if (remainder !== 0) {
      setTimeError(
        'Durasi lembur harus dalam kelipatan 30 menit (misalnya: 0.5j, 1j, 1.5j, 2j)',
      );
      return false;
    }

    if (hourDiff < 0.5) {
      setTimeError('Minimal durasi lembur adalah 30 menit.');
      return false;
    }

    setTimeError('');
    return true;
  };

  const calculateHourDifference = (dari: any, sampai: any) => {
    if (!validateTimeIncrement(dari, sampai)) {
      setHourDifference(0);
      return 0;
    }

    const dariDate = new Date(dari);
    const sampaiDate = new Date(sampai);

    const timeDiffMs = sampaiDate.getTime() - dariDate.getTime();
    let hourDiff = timeDiffMs / (1000 * 60 * 60);

    if (isCheck) {
      hourDiff -= 0.5;
    }

    const finalHours = Math.max(0, hourDiff);
    setHourDifference(finalHours);
    return finalHours;
  };

  const handleDariChange = (value: any) => {
    setTglDari(value);
    if (tglSampai) {
      calculateHourDifference(value, tglSampai);
    }
  };

  const handleSampaiChange = (value: any) => {
    setTglSampai(value);
    if (tglDari) {
      calculateHourDifference(tglDari, value);
    }
  };

  const handleCheckChange = (checked: any) => {
    setIsCheck(checked);
    if (tglDari && tglSampai) {
      calculateHourDifference(tglDari, tglSampai);
    }
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
      alert('Tanggal dan waktu belum lengkap');
      return;
    }
    if (timeError) {
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
      const hitung = calculateHourDifference(tglDari, tglSampai);
      console.log(hitung);
      console.log(tglDari, tglSampai);
      const res = await axios.post(
        url,
        {
          karyawan: idKaryawan,
          id_pengaju: idPengaju,
          dari: tglDari,
          sampai: tglSampai,
          jo_lembur: joReal,
          lama_lembur: hitung,
          alasan_lembur: alasanLembur,
          target_lembur: targetLembur,
          isIstirahat: isCheck,
          tipe_lembur: tipeLembur,
          jumlah_makan: jumlahMakan,
        },
        {
          withCredentials: true,
        },
      );
      setIsLoading(false);
      console.log(res);
      alert('Pengajuan lembur berhasil disubmit!');

      // Clear form instead of reloading the page
      clearForm();
    } catch (error) {
      setIsLoading(false);
      console.log(error);
      alert('Terjadi kesalahan saat mengirim pengajuan');
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

      <div className="w-full mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
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
            Pengajuan Surat Perintah Lembur (SPL)
          </h2>
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
                Nama Karyawan
              </label>
              <Select
                isMulti
                placeholder="Search and select employees..."
                options={options}
                value={selectedEmployees}
                onChange={handleChangePointDepatment}
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
                  Periode Lembur
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

                {hourDifference > 0 && !timeError && (
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
                          Durasi Lembur:{' '}
                          <span className="font-bold text-lg">
                            {formatDuration(hourDifference)}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
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
        <div className="flex w-full justify-end items-center px-8 py-6 bg-gray-50 border-t border-gray-200">
          <button
            onClick={postSPL}
            disabled={isLoading || !!timeError || !idKaryawan.length}
            className="flex px-8 py-3 justify-center items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 shadow-lg hover:shadow-xl text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            {isLoading ? 'PROCESSING...' : 'AJUKAN LEMBUR'}
          </button>
        </div>
      </div>
    </main>
  );
}

export default BuatSPLKeHR;
