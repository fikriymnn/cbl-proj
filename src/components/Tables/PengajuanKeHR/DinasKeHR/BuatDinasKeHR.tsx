import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { Calendar, User, FileText, Clock, AlertCircle } from 'lucide-react';

function BuatDinasKeHR() {
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userList, setUserList] = useState<any>();

  useEffect(() => {
    getMe();
  }, []);

  const [me, setMe] = useState<any>();
  const [idPengaju, setIdPengaju] = useState<any>();

  async function getMe() {
    const url = `${import.meta.env.VITE_API_LINK}/me`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      setMe(res.data);
      setIdPengaju(res.data.id_karyawan);
      getMasterUser(res?.data.karyawan.biodata_karyawan[0]?.id_department);
      console.log('getme', res.data);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  const getMasterUser = async (id: any) => {
    const url = `${import.meta.env.VITE_API_LINK}/hr/karyawan`;
    try {
      const res = await axios.get(url, {
        params: { is_active: true, id_department: id },
        withCredentials: true,
      });

      setUserList(res.data.data);
      //console
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
  };

  const handleChangePointDepatment = (selected: any) => {
    const { value } = selected;
    const filteredData = userList.find((item: any) => item.userid == value);

    console.log(filteredData?.userid);
    setIdKaryawan(filteredData?.userid);
  };

  const [idKaryawan, setIdKaryawan] = useState<any>();
  const [tglDari, setTglDari] = useState<any>();
  const [tglSampai, setTglSampai] = useState<any>();
  const [alasanIzin, setAlasanIzin] = useState<any>();
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  // Function to clear form
  const clearForm = () => {
    setIdKaryawan(null);
    setTglDari(null);
    setTglSampai(null);
    setAlasanIzin('');
    setSelectedEmployee(null);
    setDaysDifference(null);
    setShowError(false);

    // Clear date inputs
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach((input: any) => {
      input.value = '';
    });

    // Clear textarea
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.value = '';
    }
  };

  async function postIzin() {
    if (tglDari == null) {
      alert('Tanggal Dari Belum Diisi');
      return;
    }
    if (tglSampai == null) {
      alert('Tanggal Sampai Belum Diisi');
      return;
    }
    if (alasanIzin == null) {
      alert('Alasan Izin Belum Diisi');
      return;
    }
    const url = `${import.meta.env.VITE_API_LINK}/hr/pengajuanDinas`;
    try {
      setIsLoading(true);
      const res = await axios.post(
        url,
        {
          id_karyawan: idKaryawan,
          id_pengaju: idPengaju,
          dari: tglDari,
          sampai: tglSampai,
          jumlah_hari: daysDifference,
          alasan_dinas: alasanIzin,
        },
        {
          withCredentials: true,
        },
      );
      setIsLoading(false);
      alert('Pengajuan Dinas Berhasil');
      clearForm();
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }

  const [daysDifference, setDaysDifference] = useState<any>();
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (tglDari && tglSampai) {
      if (tglDari <= tglSampai) {
        const diffInMs = Math.abs(tglSampai - tglDari);
        const days = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
        setDaysDifference(days + 1);
        setShowError(false);
      } else {
        setDaysDifference(null);
        setShowError(true);
      }
    } else {
      setDaysDifference(null);
      setShowError(false);
    }
  }, [tglDari, tglSampai]);

  const handleStartDateChange = (event: any) => {
    setTglDari(new Date(event.target.value));
  };

  const handleEndDateChange = (event: any) => {
    setTglSampai(new Date(event.target.value));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 ">
      <div className="min-w-[700px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl flex items-center gap-3">
              <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-lg font-semibold text-gray-700">
                Loading...
              </span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600  px-8 py-6 text-white">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            Pengajuan Dinas Karyawan
          </h2>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-b-2xl shadow-xl overflow-hidden">
          {/* Employee Selection Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 border-b border-blue-100">
            <div className="flex items-center gap-2 mb-4">
              <label className="text-orange-100 text-sm font-semibold uppercase tracking-wide">
                👤 Nama Karyawan
              </label>
            </div>
            <div className="relative">
              <Select
                placeholder="Cari..."
                options={options}
                value={selectedEmployee}
                onChange={(selectedId) => {
                  handleChangePointDepatment(selectedId);
                  setSelectedEmployee(selectedId);
                }}
                className="relative z-[60] w-full appearance-none rounded-lg border-2 border-white/20 bg-white/10 backdrop-blur-sm py-3 px-4 outline-none transition-all duration-200 focus:border-white focus:bg-white/20 active:border-white text-white placeholder-orange-200"
                menuPortalTarget={document.body}
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  menu: (base) => ({ ...base, zIndex: 9999 }),
                }}
              />
            </div>
          </div>

          {/* Main Form Content */}
          <div className="p-6">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column - Date Selection */}
              <div className="space-y-6">
                <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                  <div className="flex items-center gap-2 mb-6">
                    <Calendar className="w-5 h-5 text-orange-600" />
                    <h3 className="text-lg font-semibold text-gray-700">
                      Periode Dinas
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <label className="text-sm font-semibold text-gray-600">
                          Dari
                        </label>
                      </div>
                      <input
                        type="date"
                        onChange={handleStartDateChange}
                        className="w-full p-3 border-2 border-orange-200 rounded-lg focus:border-orange-400 focus:outline-none transition-all duration-200"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <label className="text-sm font-semibold text-gray-600">
                          Sampai
                        </label>
                      </div>
                      <input
                        type="date"
                        onChange={handleEndDateChange}
                        className="w-full p-3 border-2 border-orange-200 rounded-lg focus:border-orange-400 focus:outline-none transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Duration Display */}
                  {daysDifference !== null && !showError && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-semibold text-green-700">
                          Jumlah Hari: {daysDifference}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Error Messages */}
                  {showError && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span className="text-sm text-red-700">
                          Tanggal dari tidak boleh kurang dari Tanggal Sampai
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Reason */}
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <label className="text-lg font-semibold text-gray-700">
                      ALASAN DINAS
                    </label>
                  </div>
                  <textarea
                    onChange={(e) => {
                      setAlasanIzin(e.target.value);
                    }}
                    placeholder="Jelaskan alasan pengajuan dinas Anda..."
                    className="w-full h-48 p-4 border-2 border-gray-200 rounded-lg resize-none focus:border-blue-400 focus:outline-none transition-all duration-200 text-gray-700"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={() => postIzin()}
                disabled={isLoading}
                className={`px-8 py-3 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                }`}
              >
                AJUKAN
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BuatDinasKeHR;
