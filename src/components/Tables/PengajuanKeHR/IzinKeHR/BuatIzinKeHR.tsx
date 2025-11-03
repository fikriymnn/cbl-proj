import axios from 'axios';
import React, { useEffect, useState, useCallback } from 'react';
import Select from 'react-select';
import Loading from '../../../Loading';

function BuatIzinKeHR() {
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userList, setUserList] = useState<any>();
  const [karyawanJadwal, setKaryawanJadwal] = useState<any[]>([]);
  const [produksiJadwal, setProduksiJadwal] = useState<any[]>([]);
  const [holidaysLoaded, setHolidaysLoaded] = useState(false);

  useEffect(() => {
    getMe();
  }, []);

  const [me, setMe] = useState<any>();
  const [idPengaju, setIdPengaju] = useState<any>();
  const [selectedEmployee, setSelectedEmployee] = useState<any>();

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

  // Memoized function to prevent recreation on every render
  const getKaryawanJadwal = useCallback(
    async (startDate?: string, endDate?: string) => {
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
        setHolidaysLoaded(true);
        console.log('Staff Jadwal:', staffRes.data);
        console.log('Produksi Jadwal:', produksiRes.data);
      } catch (error: any) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const handleChangePointDepatment = (selected: any) => {
    const { value, tipe_karyawan } = selected;
    const filteredData = userList.find((item: any) => item.userid == value);

    console.log('Selected Employee:', filteredData);
    console.log('Tipe Karyawan:', tipe_karyawan);

    setIdKaryawan(filteredData?.userid);
    setSelectedEmployee(filteredData);

    // Reset dates when employee changes
    setTglDari(null);
    setTglSampai(null);
    setDaysDifference(null);
    setHolidaysLoaded(false);
  };

  const [idKaryawan, setIdKaryawan] = useState<any>();
  const [tglDari, setTglDari] = useState<any>();
  const [tglSampai, setTglSampai] = useState<any>();
  const [alasanIzin, setAlasanIzin] = useState<any>();

  // Function to clear the form
  const clearForm = () => {
    setIdKaryawan(null);
    setSelectedEmployee(null);
    setTglDari(null);
    setTglSampai(null);
    setAlasanIzin('');
    setDaysDifference(null);
    setHolidaysLoaded(false);
    setKaryawanJadwal([]);
    setProduksiJadwal([]);
    setShowError(false);

    // Clear date inputs
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach((input: any) => {
      input.value = '';
    });
  };

  async function postIzin() {
    if (!idKaryawan) {
      alert('Karyawan Belum Dipilih');
      return;
    }
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

    const url = `${import.meta.env.VITE_API_LINK}/hr/pengajuanIzin`;
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
          alasan_izin: alasanIzin,
        },
        {
          withCredentials: true,
        },
      );
      setIsLoading(false);
      alert('Pengajuan Izin Berhasil');
      clearForm(); // Clear the form instead of reloading
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
      alert('Terjadi kesalahan saat mengajukan izin');
    }
  }

  const [daysDifference, setDaysDifference] = useState<any>();
  const [showError, setShowError] = useState(false);

  // Function to check if a date is a holiday
  const isHoliday = (date: Date, employeeType: string) => {
    const dateString = date.toISOString().split('T')[0];
    const holidays = employeeType === 'staff' ? karyawanJadwal : produksiJadwal;

    return holidays.some((holiday) => {
      const holidayDate = new Date(holiday.tanggal).toISOString().split('T')[0];
      return holidayDate === dateString;
    });
  };

  // Function to count working days excluding holidays
  const countWorkingDays = (
    startDate: Date,
    endDate: Date,
    employeeType: string,
  ) => {
    let count = 0;
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      // Skip weekends (Saturday = 6, Sunday = 0)
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        // Check if it's not a holiday
        if (!isHoliday(currentDate, employeeType)) {
          count++;
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return count;
  };

  // Function to get holidays within the selected date range
  const getHolidaysInRange = (
    startDate: Date,
    endDate: Date,
    employeeType: string,
  ) => {
    const holidays = employeeType === 'staff' ? karyawanJadwal : produksiJadwal;

    return holidays.filter((holiday) => {
      const holidayDate = new Date(holiday.tanggal);
      return holidayDate >= startDate && holidayDate <= endDate;
    });
  };

  // Separate effect to load holidays when dates are selected
  useEffect(() => {
    if (tglDari && tglSampai && selectedEmployee && !holidaysLoaded) {
      const startDateStr = tglDari.toISOString().split('T')[0];
      const endDateStr = tglSampai.toISOString().split('T')[0];
      getKaryawanJadwal(startDateStr, endDateStr);
    }
  }, [tglDari, tglSampai, selectedEmployee, holidaysLoaded, getKaryawanJadwal]);

  // Separate effect to calculate working days after holidays are loaded
  useEffect(() => {
    if (tglDari && tglSampai && selectedEmployee && holidaysLoaded) {
      const employeeType = selectedEmployee.biodata_karyawan[0]?.tipe_karyawan;

      if (tglDari <= tglSampai) {
        // Calculate working days excluding holidays
        const workingDays = countWorkingDays(tglDari, tglSampai, employeeType);
        setDaysDifference(workingDays);
        setShowError(false);
      } else {
        setDaysDifference(null);
        setShowError(true);
      }
    } else if (tglDari && tglSampai && !selectedEmployee) {
      // Handle case when no employee is selected
      if (tglDari <= tglSampai) {
        setShowError(false);
      } else {
        setShowError(true);
      }
      setDaysDifference(null);
    } else {
      setDaysDifference(null);
      setShowError(false);
    }
  }, [
    tglDari,
    tglSampai,
    selectedEmployee,
    holidaysLoaded,
    karyawanJadwal,
    produksiJadwal,
  ]);

  const handleStartDateChange = (event: any) => {
    setTglDari(new Date(event.target.value));
    setHolidaysLoaded(false); // Reset holidays loaded flag
  };

  const handleEndDateChange = (event: any) => {
    setTglSampai(new Date(event.target.value));
    setHolidaysLoaded(false); // Reset holidays loaded flag
  };

  const convertTimeStampToDateOnly = (timestamp: any) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('id-ID');
  };

  return (
    <main className="overflow-x-scroll min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {isLoading && <Loading />}
      <div className="min-w-[700px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Employee Selection Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600  px-8 py-6 text-white">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            Pengajuan Izin Karyawan
          </h2>
          <div className="flex flex-col gap-3 relative z-[60]">
            <label className="text-orange-100 text-sm font-semibold uppercase tracking-wide">
              👤 Nama Karyawan
            </label>
            <div className="relative">
              <Select
                placeholder="Pilih Karyawan..."
                options={options}
                value={
                  selectedEmployee
                    ? options.find(
                        (option: any) =>
                          option.value === selectedEmployee.userid,
                      )
                    : null
                }
                onChange={handleChangePointDepatment}
                className="relative z-[60] w-full appearance-none rounded-lg border-2 border-white/20 bg-white/10 backdrop-blur-sm py-3 px-4 outline-none transition-all duration-200 focus:border-white focus:bg-white/20 active:border-white text-white placeholder-orange-200"
                menuPortalTarget={document.body}
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  menu: (base) => ({ ...base, zIndex: 9999 }),
                }}
              />
            </div>
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

        {/* Date Selection Section */}
        <div className="px-8 py-8 bg-white">
          <div className="grid grid-cols-2 gap-8">
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
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Periode Izin
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-3">
                    <label className="text-sm text-orange-700 font-semibold">
                      📅 Tanggal Mulai
                    </label>
                    <input
                      className="rounded-lg bg-white border-2 border-orange-300 px-4 py-3 text-gray-800 font-medium focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
                      type="date"
                      onChange={handleStartDateChange}
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <label className="text-sm text-orange-700 font-semibold">
                      📅 Tanggal Selesai
                    </label>
                    <input
                      className="rounded-lg bg-white border-2 border-orange-300 px-4 py-3 text-gray-800 font-medium focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
                      type="date"
                      onChange={handleEndDateChange}
                    />
                  </div>
                </div>
              </div>

              {daysDifference !== null && !showError && (
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
                        {daysDifference} hari kerja
                      </span>
                      <span className="text-sm block text-blue-600">
                        (tidak termasuk hari libur dan weekend)
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {/* Holiday List */}
              {tglDari &&
                tglSampai &&
                selectedEmployee &&
                holidaysLoaded &&
                !showError && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
                    <div className="flex items-start gap-2">
                      <svg
                        className="w-5 h-5 text-yellow-600 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div className="flex-1">
                        <p className="text-yellow-700 font-medium mb-2">
                          Hari Libur dalam Periode:
                        </p>
                        {(() => {
                          const employeeType =
                            selectedEmployee.biodata_karyawan[0]?.tipe_karyawan;
                          const holidaysInRange = getHolidaysInRange(
                            tglDari,
                            tglSampai,
                            employeeType,
                          );

                          if (holidaysInRange.length === 0) {
                            return (
                              <p className="text-yellow-600 text-sm italic">
                                Tidak ada hari libur dalam periode yang dipilih
                              </p>
                            );
                          }

                          return (
                            <ul className="space-y-1">
                              {holidaysInRange.map((holiday, index) => (
                                <li
                                  key={index}
                                  className="text-yellow-600 text-sm flex items-center gap-2"
                                >
                                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                                  <span className="font-medium">
                                    {convertTimeStampToDateOnly(
                                      holiday.tanggal,
                                    )}{' '}
                                    - {holiday.nama_jadwal}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          );
                        })()}
                      </div>
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
                      Tanggal mulai tidak boleh lebih besar dari tanggal selesai
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex w-full flex-col gap-3">
              <label className="text-gray-700 text-sm font-semibold uppercase tracking-wide">
                📝 Alasan Izin
              </label>
              <div className="relative flex-1">
                <textarea
                  name="alasan_izin"
                  value={alasanIzin || ''}
                  onChange={(e) => setAlasanIzin(e.target.value)}
                  className="peer h-full min-h-[280px] w-full resize-none border-2 border-gray-300 rounded-lg px-4 py-4 text-gray-800 font-medium focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
                  placeholder="Jelaskan alasan pengajuan izin Anda..."
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
        </div>

        {/* Submit Button */}
        <div className="flex w-full justify-end items-end px-8 py-6 bg-gray-50 border-t border-gray-200">
          {!showError && idKaryawan && (
            <button
              onClick={postIzin}
              disabled={isLoading}
              className="flex px-8 py-3 justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-orange-700 hover:to-red-700 shadow-lg hover:shadow-xl text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              AJUKAN IZIN
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

export default BuatIzinKeHR;
