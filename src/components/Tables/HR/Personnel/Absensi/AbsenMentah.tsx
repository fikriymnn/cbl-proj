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

  const [dateFrom, setDateFrom] = useState<any>(null);
  const [dateTo, setDateTo] = useState<any>(null);

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
  const openEdit = (i: any, date: any, hour: any) => {
    const onchangeVal = [...showEdit];
    onchangeVal[i] = true; // Show popup for the selected index
    setTypeCheckEdit(filteredAbsen[i].checkType === 'Masuk' ? 0 : 1);
    setShowEdit(onchangeVal);
    console.log(hour, date);
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
      console.log('user list', res.data.data);
      setOptions(
        res.data.data.map((item: any) => ({
          value: item.userid,
          label:
            item.biodata_karyawan[0]?.nik +
            ' - ' +
            item.name +
            ' - ' +
            item.biodata_karyawan[0]?.nama_jabatan +
            ' - ' +
            (item.biodata_karyawan[0]?.bagian_mesin_karyawan == null
              ? ''
              : item.biodata_karyawan[0]?.bagian_mesin_karyawan[0]
                  ?.nama_bagian_mesin),
        })),
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
        <main className="overflow-x-scroll">
          {isLoading && <Loading />}
          <div className="bg-white rounded-md shadow-md md:w-12/12 mb-5 border-2 border-stroke">
            <div className="grid md:gap-4 gap-1 md:flex-row grid-cols-12 items-center px-4 py-4 md:mt-0 ">
              <div className="flex flex-col gap-1 col-span-3">
                <div className="flex flex-col">
                  <p className="my-auto text-sm text-primary font-semibold ">
                    Pilih Tanggal
                  </p>
                </div>

                <div className="flex gap-3 flex-col">
                  <div className="flex md:justify-center items-center gap-2">
                    <p className="text-sm text-primary font-semibold md:w-3/12 w-2/12">
                      Dari:
                    </p>

                    <input
                      className="rounded-full bg-[#D8EAFF] px-2"
                      type="date"
                      onChange={(e) => {
                        setDateFrom(e.target.value);
                        console.log(e.target.value);
                      }}
                    ></input>
                  </div>
                  <div className="flex md:justify-center items-center gap-2">
                    <p className=" my-auto text-sm text-primary font-semibold md:w-3/12 w-2/12">
                      Sampai:
                    </p>

                    <input
                      className="rounded-full bg-[#D8EAFF] px-2"
                      type="date"
                      onChange={(e) => setDateTo(e.target.value)}
                    ></input>
                  </div>
                </div>
              </div>
              <div className="flex justify-center my-5 col-span-2">
                {dateFrom == null || dateTo == null ? (
                  <>
                    <button className="bg-red-600 text-white px-5 py-2 rounded-md my-auto ">
                      Pilih Tanggal
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        getabsen(dateFrom, dateTo);
                      }}
                      className="bg-primary text-white px-5 py-2 rounded-md my-auto "
                    >
                      Tampilkan
                    </button>
                  </>
                )}
              </div>
              <div className="flex my-5 col-span-3">
                <button
                  onClick={() => {
                    getabsen(formattedDate, formattedDate);
                  }}
                  className="bg-primary text-white px-5 py-2 rounded-md my-auto "
                >
                  Hari Ini
                </button>
              </div>
              <div className="flex flex-col col-span-2">
                <p className=" my-auto text-sm text-primary font-semibold   ">
                  Cari Karyawan:
                </p>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari Nama Karyawan"
                  className="border p-2 rounded mb-4"
                />
              </div>
              <div className="flex justify-end my-5 col-span-2 items-end">
                <button
                  onClick={() => openModalHistory()}
                  className=" bg-blue-600 rounded-md text-white text-xs font-bold px-7 py-1"
                >
                  TAMBAH ABSEN MANUAL
                </button>
                {showHistory == true && (
                  <>
                    <ModalKosonganSmall
                      isOpen={showHistory}
                      onClose={() => closeModalHistory()}
                      judul={'Tambah Absen Manual'}
                    >
                      <>
                        <div className="flex flex-col gap-2 px-2 py-2">
                          <div className="flex flex-col">
                            <label className=" text-[#6c6b6b] text-sm font-semibold">
                              Karyawan :
                            </label>
                            <Select
                              placeholder="Cari..."
                              options={options}
                              onChange={(selectedId: any) => {
                                handleChangePointDepatment(selectedId);
                              }}
                              className={`relative z-50 w-full appearance-none rounded border border-stroke bg-transparent py-2 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input 'text-black dark:text-white' 
                  }`}
                            ></Select>
                          </div>
                          <div className="flex flex-col">
                            <label className="text-neutral-500 text-sm font-semibold ">
                              Tanggal
                            </label>
                            <input
                              type="date"
                              className="px-2 h-7 text text-neutral-500 text-sm border-2 rounded-md border-stroke"
                              onChange={(e) => settglNew(e.target.value)}
                            ></input>
                          </div>
                          <div className="flex flex-col">
                            <label className="text-neutral-500 text-sm font-semibold ">
                              Jam
                            </label>
                            <input
                              type="time"
                              className="px-2 h-7 text text-neutral-500 text-sm border-2 rounded-md border-stroke"
                              onChange={(e) => setHoursNew(e.target.value)}
                            ></input>
                          </div>
                          <div className="flex flex-col">
                            <label className="text-neutral-500 text-sm font-semibold ">
                              Tipe Check
                            </label>
                            <div className="flex gap-1">
                              <input
                                type="radio"
                                className=" text-neutral-500 text-sm border-2 rounded-md border-stroke"
                                value={0}
                                name={`tipecheck-1`}
                                onChange={(e) => setTypeCheck(e.target.value)}
                              />
                              Masuk
                              <input
                                type="radio"
                                className=" text-neutral-500 text-sm border-2 rounded-md border-stroke"
                                value={1}
                                name={`tipecheck-1`}
                                onChange={(e) => setTypeCheck(e.target.value)}
                              />
                              Keluar
                            </div>
                          </div>
                          <button
                            disabled={isLoading}
                            onClick={() => {
                              postAbsen();
                            }}
                            className="bg-blue-500 text-white text-md px-4 py-1 rounded-md font-semibold"
                          >
                            SIMPAN
                          </button>
                        </div>
                      </>
                    </ModalKosonganSmall>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="min-w-[700px] bg-white rounded-xl">
            <div className=" w-full h-full flex-col border-b-8 border-[#D8EAFF]">
              <div className="grid grid-cols-12 px-10 py-4 border-b-8 border-[#D8EAFF] gap-2 ">
                <div className="flex col-span-2 gap-2">
                  <label className="text-neutral-500 text-sm font-semibold ">
                    No.
                  </label>
                  <label className="text-neutral-500 text-sm font-semibold ">
                    Nama
                  </label>
                </div>

                <label className="text-neutral-500 text-sm font-semibold col-span-4">
                  Tanggal
                </label>
                <label className="text-neutral-500 text-sm font-semibold col-span-2">
                  Tipe Check
                </label>
              </div>
              <div className="w-2 h-full "></div>
              {filteredAbsen?.map((data: any, i: any) => {
                const [rawDate, rawTime] = data.tglCheck.split(' '); // Split the date and time
                const [day2, month2, year2] = rawDate.split('-'); // Split the day, month, and year
                const formattedDate2 = `${year2}-${month2.padStart(
                  2,
                  '0',
                )}-${day2.padStart(2, '0')}`; // Format as YYYY-MM-DD

                // Split time into hours and minutes, and handle optional seconds
                const [hours, minutes] = rawTime.split(':');
                const formattedTime = `${hours.padStart(
                  2,
                  '0',
                )}:${minutes.padStart(2, '0')}`;

                const date = formattedDate2;
                const time = formattedTime;

                return (
                  <>
                    <div
                      key={i}
                      className="grid grid-cols-12 px-10 py-4 border-b-8 border-[#D8EAFF] gap-2 "
                    >
                      <div className="flex col-span-2 gap-2">
                        <label className="text-neutral-500 text-sm font-semibold ">
                          {i + 1}
                        </label>
                        <label className="text-neutral-500 text-sm font-semibold ">
                          {data.nama}
                        </label>
                      </div>

                      <label className="text-neutral-500 text-sm font-semibold col-span-4">
                        {data.tglCheck}
                      </label>

                      <label className="text-neutral-500 text-sm font-semibold col-span-4">
                        {data.checkType}
                      </label>
                      <button
                        onClick={() => openEdit(i, date, time)}
                        className="w-full bg-blue-600 text-white text-sm py-1 rounded-md"
                      >
                        Edit
                      </button>
                      {showEdit[i] == true && (
                        <ModalKosonganSmall
                          isOpen={showEdit[i]}
                          onClose={() => closeEdit(i)}
                          judul={'Edit Absen Mentah'}
                        >
                          <>
                            <div
                              key={i}
                              className="flex flex-col px-4 py-4  gap-2"
                            >
                              <div className="flex flex-col">
                                <label className="text-neutral-500 text-sm font-semibold ">
                                  Nama
                                </label>
                                <input
                                  type="text"
                                  className="px-2 h-7 text text-neutral-500 text-sm border-2 rounded-md border-stroke"
                                  value={data.nama}
                                  readOnly
                                ></input>
                              </div>
                              <div className="flex flex-col">
                                <label className="text-neutral-500 text-sm font-semibold ">
                                  Check Time
                                </label>
                                <input
                                  type="text"
                                  className="px-2 h-7 text text-neutral-500 text-sm border-2 rounded-md border-stroke"
                                  value={data.checkTime}
                                  readOnly
                                ></input>
                              </div>
                              <div className="flex flex-col">
                                <label className="text-neutral-500 text-sm font-semibold ">
                                  Tanggal
                                </label>
                                <input
                                  type="date"
                                  className="px-2 h-7 text text-neutral-500 text-sm border-2 rounded-md border-stroke"
                                  defaultValue={tglNewEdit}
                                  onChange={(e) =>
                                    settglNewEdit(e.target.value)
                                  }
                                ></input>
                              </div>
                              <div className="flex flex-col">
                                <label className="text-neutral-500 text-sm font-semibold ">
                                  Jam
                                </label>
                                <input
                                  type="time"
                                  className="px-2 h-7 text text-neutral-500 text-sm border-2 rounded-md border-stroke"
                                  defaultValue={hoursNewEdit}
                                  onChange={(e) =>
                                    setHoursNewEdit(e.target.value)
                                  }
                                ></input>
                              </div>
                              <div className="flex flex-col">
                                <label className="text-neutral-500 text-sm font-semibold ">
                                  Tipe Check
                                </label>
                                <div className="flex gap-1">
                                  <input
                                    type="radio"
                                    className=" text-neutral-500 text-sm border-2 rounded-md border-stroke"
                                    value={0}
                                    checked={typeCheckEdit === 0}
                                    name={`tipecheck-${i}`}
                                    onChange={(e) =>
                                      setTypeCheckEdit(parseInt(e.target.value))
                                    }
                                  />
                                  Masuk
                                  <input
                                    type="radio"
                                    className=" text-neutral-500 text-sm border-2 rounded-md border-stroke"
                                    value={1}
                                    checked={typeCheckEdit === 1}
                                    name={`tipecheck-${i}`}
                                    onChange={(e) =>
                                      setTypeCheckEdit(parseInt(e.target.value))
                                    }
                                  />
                                  Keluar
                                </div>
                              </div>
                              <button
                                disabled={isLoading}
                                onClick={() => {
                                  putAbsen(data.userid, data.checkTime, i);
                                }}
                                className="bg-blue-500 text-white text-md px-4 py-1 rounded-md font-semibold"
                              >
                                SIMPAN
                              </button>
                            </div>
                          </>
                        </ModalKosonganSmall>
                      )}
                      <button
                        onClick={() => hapusAbsen(data.userid, data.checkTime)}
                        className="w-full bg-red-600 text-white text-sm py-1 rounded-md"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                );
              })}
            </div>
          </div>
        </main>
      )}
    </>
  );
}

export default TableAbsenMentah;
