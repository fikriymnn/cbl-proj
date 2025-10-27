import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import Loading from '../../../Loading';

function BuatSakitKeHR() {
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
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  // Function to clear the form
  const clearForm = () => {
    setIdKaryawan(null);
    setTglDari(null);
    setTglSampai(null);
    setSelectedEmployee(null);
    setDaysDifference(null);
    setShowError(false);

    // Clear date input values
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach((input: any) => {
      input.value = '';
    });
  };

  async function postSakit() {
    if (tglDari == null) {
      alert('Tanggal Dari Belum Diisi');
      return;
    }
    if (tglSampai == null) {
      alert('Tanggal Sampai Belum Diisi');
      return;
    }

    const url = `${import.meta.env.VITE_API_LINK}/hr/pengajuanSakit`;
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
        },
        {
          withCredentials: true,
        },
      );
      setIsLoading(false);

      // Show success alert and clear form instead of reloading
      alert('Pengajuan Sakit Berhasil');
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
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600  px-8 pt-6 text-white">
          <h2 className="text-2xl font-bold  flex items-center gap-3">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            Pengajuan Sakit Karyawan
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

          {/* Main Content */}
          <div className="bg-gray-50 rounded-b-xl p-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Left Panel - Date Period */}
              <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-orange-600 text-lg">📅</span>
                  <h2 className="text-gray-800 font-semibold text-lg">
                    Periode Sakit
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-blue-600 text-sm">📅</span>
                      <label className="text-gray-700 text-sm font-medium">
                        Dari
                      </label>
                    </div>
                    <input
                      type="date"
                      onChange={handleStartDateChange}
                      className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                      placeholder="dd/mm/yyyy"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-blue-600 text-sm">📅</span>
                      <label className="text-gray-700 text-sm font-medium">
                        Sampai
                      </label>
                    </div>
                    <input
                      type="date"
                      onChange={handleEndDateChange}
                      className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                      placeholder="dd/mm/yyyy"
                    />
                  </div>
                </div>

                {daysDifference !== null && !showError && (
                  <div className="mt-4 p-3 bg-green-100 rounded-lg border border-green-300">
                    <span className="text-green-700 text-sm font-medium">
                      Jumlah Hari: {daysDifference}
                    </span>
                  </div>
                )}

                {showError && (
                  <div className="mt-4 p-3 bg-red-100 rounded-lg border border-red-300">
                    <span className="text-red-700 text-sm">
                      Tanggal dari tidak boleh kurang dari Tanggal Sampai
                    </span>
                  </div>
                )}
              </div>

              {/* Right Panel - File Upload */}
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-blue-600 text-lg">📄</span>
                  <h2 className="text-gray-800 font-semibold text-lg">
                    Surat Sakit
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-blue-300 border-dashed rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg
                          className="w-10 h-10 mb-3 text-blue-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <p className="mb-2 text-sm text-blue-600">
                          <span className="font-semibold">
                            Jelaskan alasan pengajuan sakit Anda...
                          </span>
                        </p>
                        <p className="text-xs text-blue-500">
                          Lampirkan surat dokter jika ada
                        </p>
                      </div>
                      <input name="lampiran" type="file" className="hidden" />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end mt-6">
              {!showError ? (
                <button
                  onClick={() => postSakit()}
                  disabled={isLoading || !idKaryawan || !tglDari || !tglSampai}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg transition-all duration-200"
                >
                  AJUKAN
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BuatSakitKeHR;
