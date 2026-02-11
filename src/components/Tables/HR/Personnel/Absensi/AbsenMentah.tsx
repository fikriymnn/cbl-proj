import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loading from '../../../../Loading';
import ModalKosonganSmall from '../../../../Modals/ModalKosonganSmall';
import Select from 'react-select';

function TableAbsenMentah() {
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const kosong: any = [];
  const [options, setOptions] = useState([]);
  const [absen, setabsen] = useState<any>();

  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day = String(today.getDate()).padStart(2, '0');

  const formattedDate = `${year}-${month}-${day}`;
  const handleResize = () => {
    setIsMobile(window.innerWidth < 768); // Adjust the breakpoint as needed
  };
  useEffect(() => {
    handleResize();

    // Event listener for window resize
    window.addEventListener('resize', handleResize);

    // Cleanup on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const [typeCheck, setTypeCheck] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const filteredAbsen = absen?.filter((data: any) =>
    data.nama.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  useEffect(() => {
    getMasterUser();
    getabsen(formattedDate, formattedDate);
  }, []);

  // Initialize with today's date
  const [dateFrom, setDateFrom] = useState<any>(formattedDate);
  const [dateTo, setDateTo] = useState<any>(formattedDate);

  async function getabsen(dateFrom1: any, dateTo1: any) {
    const url = `${import.meta.env.VITE_API_LINK}/hr/absensiInOut`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        params: {
          startDate: dateFrom1,
          endDate: dateTo1,
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

  const [tglNew, settglNew] = useState<any>(null);
  const [hoursNew, setHoursNew] = useState<any>(null);

  async function putAbsen(id: any, checkTime: any, index: any) {
    const url = `${import.meta.env.VITE_API_LINK}/hr/absensiInOut`;
    try {
      setIsLoading(true);
      const res = await axios.put(
        url,
        {
          id_karyawan: id,
          checktime: checkTime,
          date: tglNewEdit,
          jam: hoursNewEdit,
          type_check: typeCheckEdit,
        },
        {
          withCredentials: true,
        },
      );
      closeEdit(index);
      setIsLoading(false);
      getabsen(dateFrom, dateTo);

      console.log(res.data);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }
  const [hoursNewEdit, setHoursNewEdit] = useState<any>(null);
  const [typeCheckEdit, setTypeCheckEdit] = useState<any>(null);

  const [showEdit, setShowEdit] = useState<any>([]);
  const openEdit = (i: any, date: any, hour: any, checkType: string) => {
    const onchangeVal = [...showEdit];
    onchangeVal[i] = true; // Show popup for the selected index
    // Set based on actual data from API
    setTypeCheckEdit(checkType === 'Masuk' ? 0 : 1);
    setShowEdit(onchangeVal);
    console.log(hour, date, checkType);
    setHoursNewEdit(hour);
    settglNewEdit(date);
  };

  const closeEdit = (i: any) => {
    const onchangeVal: any = [...showEdit];
    onchangeVal[i] = false;
    setTypeCheckEdit(null);
    setShowEdit(onchangeVal);
  };
  const handleTypeCheckChange = (value: any) => {
    setTypeCheckEdit(parseInt(value)); // Update typeCheck to the selected value
  };
  const [userList, setUserList] = useState<any>();
  const [idKaryawan, setIdKaryawan] = useState<any>();
  const [tglNewEdit, settglNewEdit] = useState<any>(null);

  async function postAbsen() {
    const url = `${import.meta.env.VITE_API_LINK}/hr/absensiInOut`;
    try {
      setIsLoading(true);
      const res = await axios.post(
        url,
        {
          id_karyawan: idKaryawan,
          date: tglNew,
          jam: hoursNew,
          type_check: typeCheck,
        },
        {
          withCredentials: true,
        },
      );
      closeModalHistory();
      setIsLoading(false);
      alert('Absen Manual Berhasil Ditambah');
      getabsen(dateFrom, dateTo);

      console.log(res.data);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }
  async function hapusAbsen(idk: any, checkTime: any) {
    if (window.confirm('Apakah Anda yakin ingin Menghapus Data Absen Ini?')) {
      const url = `${import.meta.env.VITE_API_LINK}/hr/absensiInOut`;
      try {
        setIsLoading(true);
        const res = await axios.delete(url, {
          data: {
            id_karyawan: idk,
            checktime: checkTime,
          },
          withCredentials: true,
        });
        setIsLoading(false);
        getabsen(dateFrom, dateTo);
      } catch (error: any) {
        setIsLoading(false);
        console.log(error);
      }
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
  }
  const handleChangePointDepatment = (selected: any) => {
    const { value } = selected;
    const filteredData = userList.find(
      (item: any) => item.userid == value,
      // item.id.includes(parseInt(value));
    );

    console.log(filteredData?.userid);

    setIdKaryawan(filteredData?.userid);
  };
  const [showHistory, setShowHistory] = useState(false);
  const openModalHistory = () => setShowHistory(true);
  const closeModalHistory = () => setShowHistory(false);

  return (
    <>
      {!isMobile && (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 ">
          {isLoading && <Loading />}

          {/* Filter Controls Card */}
          <div className="bg-white rounded-xl shadow-lg mb-6 border border-slate-200">
            <div className="p-6">
              <div className="grid grid-cols-12 gap-6 items-end">
                {/* Date Range Selection */}
                <div className="col-span-4">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">
                    Date Range
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-slate-600 w-20">
                        From:
                      </label>
                      <input
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        type="date"
                        value={dateFrom}
                        onChange={(e) => {
                          setDateFrom(e.target.value);
                          console.log(e.target.value);
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-slate-600 w-20">
                        To:
                      </label>
                      <input
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="col-span-3 flex flex-col gap-3">
                  {dateFrom == null || dateTo == null ? (
                    <button className="px-6 py-2.5 bg-red-500 text-white font-medium rounded-lg cursor-not-allowed opacity-60">
                      Select Date First
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        getabsen(dateFrom, dateTo);
                      }}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                    >
                      Show Results
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setDateFrom(formattedDate);
                      setDateTo(formattedDate);
                      getabsen(formattedDate, formattedDate);
                    }}
                    className="px-6 py-2.5 bg-slate-600 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                  >
                    Today's Data
                  </button>
                </div>

                {/* Search Input */}
                <div className="col-span-3">
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Search Employee
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Type employee name..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Add Manual Button */}
                <div className="col-span-2">
                  <button
                    onClick={() => openModalHistory()}
                    className="w-full px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors shadow-sm"
                  >
                    + Add Manual
                  </button>
                  {showHistory == true && (
                    <>
                      <ModalKosonganSmall
                        isOpen={showHistory}
                        onClose={() => closeModalHistory()}
                        judul={'Add Manual Attendance'}
                      >
                        <>
                          <div className="flex flex-col gap-4 px-6 py-4">
                            <div className="flex flex-col gap-2">
                              <label className="text-sm font-semibold text-slate-700">
                                Employee <span className="text-red-500">*</span>
                              </label>
                              <Select
                                placeholder="Search and select employee..."
                                options={options}
                                onChange={(selectedId: any) => {
                                  handleChangePointDepatment(selectedId);
                                }}
                                className="react-select-container"
                                classNamePrefix="react-select"
                              />
                            </div>

                            <div className="flex flex-col gap-2">
                              <label className="text-sm font-semibold text-slate-700">
                                Date <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="date"
                                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                onChange={(e) => settglNew(e.target.value)}
                              />
                            </div>

                            <div className="flex flex-col gap-2">
                              <label className="text-sm font-semibold text-slate-700">
                                Time <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="time"
                                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                onChange={(e) => setHoursNew(e.target.value)}
                              />
                            </div>

                            <div className="flex flex-col gap-2">
                              <label className="text-sm font-semibold text-slate-700">
                                Check Type{' '}
                                <span className="text-red-500">*</span>
                              </label>
                              <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                    value={0}
                                    name="tipecheck-add"
                                    checked={typeCheck === '0'}
                                    onChange={(e) =>
                                      setTypeCheck(e.target.value)
                                    }
                                  />
                                  <span className="text-sm font-medium text-slate-700">
                                    Check In
                                  </span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                    value={1}
                                    name="tipecheck-add"
                                    checked={typeCheck === '1'}
                                    onChange={(e) =>
                                      setTypeCheck(e.target.value)
                                    }
                                  />
                                  <span className="text-sm font-medium text-slate-700">
                                    Check Out
                                  </span>
                                </label>
                              </div>
                            </div>

                            <button
                              disabled={isLoading}
                              onClick={() => {
                                postAbsen();
                              }}
                              className="mt-4 w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold rounded-lg transition-colors shadow-sm"
                            >
                              {isLoading ? 'Saving...' : 'Save Attendance'}
                            </button>
                          </div>
                        </>
                      </ModalKosonganSmall>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Data Table Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
            {/* Table Header */}
            <div className="bg-gradient-to-r from-slate-700 to-slate-600 px-8 py-4">
              <div className="grid grid-cols-12 gap-4 text-white font-semibold text-sm">
                <div className="col-span-1">No.</div>
                <div className="col-span-3">Employee Name</div>
                <div className="col-span-3">Check Date & Time</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-3 text-center">Actions</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-slate-200">
              {filteredAbsen && filteredAbsen.length > 0 ? (
                filteredAbsen
                  ?.slice()
                  .sort((a: any, b: any) => {
                    const [rawDateA, rawTimeA] = a.tglCheck.split(' ');
                    const [dayA, monthA, yearA] = rawDateA.split('-');
                    const timePartsA = rawTimeA
                      .split(':')
                      .map((part: any) => parseInt(part, 10));

                    const dateA = new Date(
                      parseInt(yearA, 10),
                      parseInt(monthA, 10) - 1,
                      parseInt(dayA, 10),
                      timePartsA[0] || 0,
                      timePartsA[1] || 0,
                      timePartsA[2] || 0,
                    );

                    const [rawDateB, rawTimeB] = b.tglCheck.split(' ');
                    const [dayB, monthB, yearB] = rawDateB.split('-');
                    const timePartsB = rawTimeB
                      .split(':')
                      .map((part: any) => parseInt(part, 10));

                    const dateB = new Date(
                      parseInt(yearB, 10),
                      parseInt(monthB, 10) - 1,
                      parseInt(dayB, 10),
                      timePartsB[0] || 0,
                      timePartsB[1] || 0,
                      timePartsB[2] || 0,
                    );

                    return dateB.getTime() - dateA.getTime();
                  })
                  .map((data: any, i: any) => {
                    const [rawDate, rawTime] = data.tglCheck.split(' ');
                    const [day2, month2, year2] = rawDate.split('-');
                    const formattedDate2 = `${year2}-${month2.padStart(
                      2,
                      '0',
                    )}-${day2.padStart(2, '0')}`;

                    const [hours, minutes] = rawTime.split(':');
                    const formattedTime = `${hours.padStart(
                      2,
                      '0',
                    )}:${minutes.padStart(2, '0')}`;

                    const date = formattedDate2;
                    const time = formattedTime;

                    return (
                      <div
                        key={i}
                        className="grid grid-cols-12 gap-4 px-8 py-4 hover:bg-slate-50 transition-colors"
                      >
                        <div className="col-span-1 text-slate-600 font-medium">
                          {i + 1}
                        </div>
                        <div className="col-span-3 text-slate-800 font-semibold">
                          {data.nama}
                        </div>
                        <div className="col-span-3 text-slate-600">
                          {data.tglCheck}
                        </div>
                        <div className="col-span-2">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                              data.checkType === 'Masuk'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {data.checkType}
                          </span>
                        </div>
                        <div className="col-span-3 flex gap-2">
                          <button
                            onClick={() =>
                              openEdit(i, date, time, data.checkType)
                            }
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              hapusAbsen(data.userid, data.checkTime)
                            }
                            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                          >
                            Delete
                          </button>
                        </div>

                        {/* Edit Modal */}
                        {showEdit[i] == true && (
                          <ModalKosonganSmall
                            isOpen={showEdit[i]}
                            onClose={() => closeEdit(i)}
                            judul={'Edit Attendance Record'}
                          >
                            <>
                              <div className="flex flex-col gap-4 px-6 py-4">
                                <div className="flex flex-col gap-2">
                                  <label className="text-sm font-semibold text-slate-700">
                                    Employee Name
                                  </label>
                                  <input
                                    type="text"
                                    className="px-4 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-600 cursor-not-allowed"
                                    value={data.nama}
                                    readOnly
                                  />
                                </div>

                                <div className="flex flex-col gap-2">
                                  <label className="text-sm font-semibold text-slate-700">
                                    Original Check Time
                                  </label>
                                  <input
                                    type="text"
                                    className="px-4 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-600 cursor-not-allowed"
                                    value={data.checkTime}
                                    readOnly
                                  />
                                </div>

                                <div className="flex flex-col gap-2">
                                  <label className="text-sm font-semibold text-slate-700">
                                    New Date{' '}
                                    <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="date"
                                    className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    defaultValue={tglNewEdit}
                                    onChange={(e) =>
                                      settglNewEdit(e.target.value)
                                    }
                                  />
                                </div>

                                <div className="flex flex-col gap-2">
                                  <label className="text-sm font-semibold text-slate-700">
                                    New Time{' '}
                                    <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="time"
                                    className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    defaultValue={hoursNewEdit}
                                    onChange={(e) =>
                                      setHoursNewEdit(e.target.value)
                                    }
                                  />
                                </div>

                                <div className="flex flex-col gap-2">
                                  <label className="text-sm font-semibold text-slate-700">
                                    Check Type{' '}
                                    <span className="text-red-500">*</span>
                                  </label>
                                  <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input
                                        type="radio"
                                        className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                        value={0}
                                        checked={typeCheckEdit === 0}
                                        name={`tipecheck-${i}`}
                                        onChange={(e) =>
                                          setTypeCheckEdit(
                                            parseInt(e.target.value),
                                          )
                                        }
                                      />
                                      <span className="text-sm font-medium text-slate-700">
                                        Check In
                                      </span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input
                                        type="radio"
                                        className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                        value={1}
                                        checked={typeCheckEdit === 1}
                                        name={`tipecheck-${i}`}
                                        onChange={(e) =>
                                          setTypeCheckEdit(
                                            parseInt(e.target.value),
                                          )
                                        }
                                      />
                                      <span className="text-sm font-medium text-slate-700">
                                        Check Out
                                      </span>
                                    </label>
                                  </div>
                                </div>

                                <button
                                  disabled={isLoading}
                                  onClick={() => {
                                    putAbsen(data.userid, data.checkTime, i);
                                  }}
                                  className="mt-4 w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold rounded-lg transition-colors shadow-sm"
                                >
                                  {isLoading
                                    ? 'Updating...'
                                    : 'Update Attendance'}
                                </button>
                              </div>
                            </>
                          </ModalKosonganSmall>
                        )}
                      </div>
                    );
                  })
              ) : (
                <div className="px-8 py-12 text-center">
                  <div className="text-slate-400 text-lg font-medium">
                    No attendance records found
                  </div>
                  <p className="text-slate-500 text-sm mt-2">
                    Try adjusting your search or date range
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      )}
    </>
  );
}

export default TableAbsenMentah;
