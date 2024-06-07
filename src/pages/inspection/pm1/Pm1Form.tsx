import React, { useEffect, useState } from 'react';
import DefaultLayout from '../../../layout/DefaultLayout';
import Ceklis from '../../../images/icon/ceklis.svg';
import Polygon from '../../../images/icon/Polygon.svg';
import X from '../../../images/icon/x.svg';
import Strip from '../../../images/icon/strip.svg';
import SelectGroupTwo from '../../../components/Forms/SelectGroup/SelectGroupTwo';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import ModalPM1TambahInspection from '../../../components/Modals/ModalPMTambahInspection';
import Logo from '../../../images/icon/ceklis.svg';
import None from '../../../images/icon/none.svg';
import moment from 'moment';

function Pm1Form() {
  const { id } = useParams();

  const [pm1, setPm1] = useState<any>();
  const [userKA, setUserKA] = useState<any>();
  const [userSuper, setUserSuper] = useState<any>();
  const [userLeader, setUserLeader] = useState<any>();

  const [selectionUserKA, setSelectionUserKA] = useState<any>();
  const [selectionUserSuper, setSelectionUserSuper] = useState<any>();
  const [selectionUserLeader, setSelectionUserLeader] = useState<any>();

  const [isMobile, setIsMobile] = useState(false);

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


  const [catatan, setCatatan] = useState<any>();
  useEffect(() => {
    getPM1();
    getUserKA();
    getUserLeader();
    getUserSuper();
  }, []);
  async function getPM1() {
    const url = `${import.meta.env.VITE_API_LINK}/pm1/${id}`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      setPm1(res.data);
      console.log(res.data);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  async function getUserKA() {
    const url = `${import.meta.env.VITE_API_LINK}/users`;
    try {
      const res = await axios.get(url, {
        params: {
          bagian: 'maintenance',
          role: 'section head',
        },
        withCredentials: true,
      });

      setUserKA(res.data);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  async function getUserLeader() {
    const url = `${import.meta.env.VITE_API_LINK}/users`;
    try {
      const res = await axios.get(url, {
        params: {
          bagian: 'maintenance',
          role: 'leader',
        },
        withCredentials: true,
      });

      setUserLeader(res.data);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  async function getUserSuper() {
    const url = `${import.meta.env.VITE_API_LINK}/users`;
    try {
      const res = await axios.get(url, {
        params: {
          bagian: 'maintenance',
          role: 'supervisor',
        },
        withCredentials: true,
      });

      setUserSuper(res.data);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  async function startTask(id: any) {
    const url = `${import.meta.env.VITE_API_LINK}/pm1/taskStart/${id}`;
    try {
      const res = await axios.put(url, {
        withCredentials: true,
      });

      alert('task dimulai');
      getPM1();
    } catch (error: any) {
      console.log(error);
    }
  }

  async function stopTask(id: any, hasil: any, catatan: any, start: any) {
    if (!start) {
      // Check if start time is available
      console.error('Task tidak bisa diberhentikan: Belum Start.');
      return; // Exit function if no start time
    }

    const stopTime = new Date();
    const timestamp = convertDatetimeToDate(new Date());
    const url = `${import.meta.env.VITE_API_LINK}/pm1/taskStop/${id}`;
    console.log(hasil);
    try {
      const elapsedTime = await calculateElapsedTime(start, stopTime);
      const formattedTime = formatElapsedTime(elapsedTime);
      console.log(formattedTime);
      const res = await axios.put(
        url,
        {
          hasil: hasil,
          lama_pengerjaan: formattedTime,
          waktu_selesai: timestamp,
          catatan: catatan,
          file: '',
        },
        {
          withCredentials: true,
        },
      );

      console.log('Succes', timestamp);
      alert('task stop');
      getPM1();
    } catch (error: any) {
      console.log(error);
      alert(error.response.data.msg);
    }
  }

  async function donePm1(id: any) {
    if (!catatan || !userKA || !userLeader || !userSuper) {
      alert('incomplite data');
    }
    const url = `${import.meta.env.VITE_API_LINK}/pm1/done/${id}`;
    try {
      const res = await axios.put(
        url,
        {
          catatan: catatan,
          id_leader: selectionUserLeader,
          id_supervisor: selectionUserSuper,
          id_ka_bag: selectionUserKA,
        },
        {
          withCredentials: true,
        },
      );

      alert('pm 1 done');
      getPM1();
    } catch (error: any) {
      console.log(error);
      alert(error.response.data.msg);
    }
  }

  function calculateElapsedTime(startTime: any, stopTime: Date) {
    const start = new Date(startTime);
    const diffInMs = stopTime.getTime() - start.getTime();
    // Convert milliseconds to your desired unit (minutes, hours)
    const elapsedTime = Math.round(diffInMs / (1000 * 60));
    console.log(elapsedTime); // Example: minutes
    return elapsedTime;
  }

  // Helper function to format elapsed time for 'menit' (replace with your format)
  function formatElapsedTime(minutes: number, seconds: number = 0) {
    const formattedMinutes = minutes.toString().padStart(2, '0'); // Pad minutes with leading 0
    // Customize the format as needed
    return `${formattedMinutes}`; // Example: 00:30 menit
  }

  // const start1 = moment(start)
  // const stop = moment(selesai)
  // const diffMilidetik = stop.diff(start1);
  // const menit = diffMilidetik / (1000 * 60);

  const [showModalADD, setShowModalADD] = useState(false);

  const openModalADD = () => setShowModalADD(true);
  const closeModalADD = () => setShowModalADD(false);

  function convertDatetimeToDate(datetime: any) {
    const dateObject = new Date(datetime);
    const day = dateObject.getDate().toString().padStart(2, '0'); // Ensure two-digit day
    const month = (dateObject.getMonth() + 1).toString().padStart(2, '0'); // Adjust for zero-based month
    const year = dateObject.getFullYear();
    const hours = dateObject.getHours().toString().padStart(2, '0');
    const minutes = dateObject.getMinutes().toString().padStart(2, '0');

    return `${year}/${month}/${day} ${hours}:${minutes}`; // Example format (YYYY-MM-DD)
  }

  const tiketMasuk = convertDatetimeToDate(pm1 != null && pm1.createdAt);

  const [selectedOption, setSelectedOption] = useState<string>('');
  const [isOptionSelected, setIsOptionSelected] = useState<boolean>(false);

  const changeTextColor = () => {
    setIsOptionSelected(true);
  };

  const handleChangePoint = (e: any, i: number) => {
    const { name, value } = e.target;
    const onchangeVal: any = pm1;
    onchangeVal.inspection_point_pm1s[i][name] = value;
    setPm1(onchangeVal);
  };

  const totalWaktuTask =
    pm1 != null &&
    pm1.inspection_point_pm1s.reduce(
      (total: any, item: any) => total + item.lama_pengerjaan,
      0,
    );

  const waktuMulaiPm1 = convertDatetimeToDate(pm1 != null && pm1.waktu_mulai);
  const waktuSelesaiPm1 =
    pm1 != null && pm1.waktu_selesai != null
      ? convertDatetimeToDate(pm1.waktu_selesai)
      : '-';

  return (
    <DefaultLayout>
      {!isMobile && (
        <div className="w-full bg-white">
          <section className="flex justify-between p-4">
            <div className="w-full">
              <p className="md:text-[14px] text-[9px] font-semibold">
                Machine Details
              </p>
              <div className="flex flex-col w-35 md:w-full">
                <div className="flex flex-cols-3  md:gap-3 gap-1 ">
                  <p className="md:text-[14px] text-[9px] font-semibold w-35">
                    {' '}
                    Nama Mesin{' '}
                  </p>
                  <p className="md:text-[14px] text-[9px] font-semibold ">:</p>
                  <p className="md:text-[14px] text-[9px] font-semibold ">
                    {pm1 != null && pm1.nama_mesin}
                  </p>
                </div>
                <div className="flex flex-cols-3 md:gap-3 gap-1">
                  <p className="md:text-[14px] text-[9px] font-semibold w-35">
                    {' '}
                    Nomor Mesin{' '}
                  </p>
                  <p className="md:text-[14px] text-[9px] font-semibold ">:</p>
                  <p className="md:text-[14px] text-[9px] font-semibold">
                    {pm1 != null && pm1.mesin.kode_mesin}
                  </p>
                </div>

                <div className="flex flex-cols-3  md:gap-3 gap-1">
                  <p className="md:text-[14px] text-[9px] font-semibold w-35">
                    Tanggal
                  </p>
                  <p className="md:text-[14px] text-[9px] font-semibold ">:</p>
                  <p className="md:text-[14px] text-[9px] text-start font-semibold">
                    {pm1 != null && tiketMasuk}
                  </p>
                </div>

                <div className="flex flex-cols-3  md:gap-3 gap-1 ">
                  <p className="md:text-[14px] text-[9px] font-semibold w-35">
                    Leader
                  </p>
                  <p className="md:text-[14px] text-[9px] font-semibold ">:</p>
                  <p className="md:text-[14px] text-[9px] text-start font-semibold">
                    {pm1 != null && pm1.id_leader != null ? (
                      <p className="text-body dark:text-bodydark uppercase">
                        {pm1.leader.nama}
                      </p>
                    ) : (
                      <select
                        className="uppercase"
                        onChange={(e) => {
                          setSelectionUserLeader(e.target.value);
                        }}
                      >
                        <option selected disabled>
                          Pilih Leader
                        </option>
                        {userLeader != null &&
                          userLeader.map((leader: any, i: number) => (
                            <option
                              key={i}
                              value={leader.id}
                              className="text-body dark:text-bodydark uppercase"
                            >
                              {leader.nama}
                            </option>
                          ))}
                      </select>
                    )}
                  </p>
                </div>
                <div className="flex flex-cols-3  md:gap-3 gap-1 ">
                  <p className="md:text-[14px] text-[9px] font-semibold w-35">
                    Supervisor
                  </p>
                  <p className="md:text-[14px] text-[9px] font-semibold ">:</p>
                  <p className="md:text-[14px] text-[9px] text-start font-semibold">
                    {pm1 != null && pm1.id_supervisor != null ? (
                      <p className="text-body dark:text-bodydark uppercase">
                        {pm1.supervisor.nama}
                      </p>
                    ) : (
                      <select
                        className="uppercase"
                        onChange={(e) => {
                          setSelectionUserSuper(e.target.value);
                        }}
                      >
                        <option selected disabled>
                          Pilih Supervisor
                        </option>
                        {userSuper != null &&
                          userSuper.map((Super: any, i: number) => (
                            <option
                              key={i}
                              value={Super.id}
                              className="text-body dark:text-bodydark uppercase"
                            >
                              {Super.nama}
                            </option>
                          ))}
                      </select>
                    )}
                  </p>
                </div>
                <div className="flex flex-cols-3  md:gap-3 gap-1 ">
                  <p className="md:text-[14px] text-[9px] font-semibold w-35">
                    KA BAG
                  </p>
                  <p className="md:text-[14px] text-[9px] font-semibold ">:</p>
                  <p className="md:text-[14px] text-[9px] text-start font-semibold">
                    {pm1 != null && pm1.id_ka_bag != null ? (
                      <p className="text-body dark:text-bodydark uppercase">
                        {pm1.ka_bag.nama}
                      </p>
                    ) : (
                      <select
                        className="uppercase"
                        onChange={(e) => {
                          setSelectionUserKA(e.target.value);
                        }}
                      >
                        <option selected disabled>
                          Pilih KA BAG
                        </option>
                        {userKA != null &&
                          userKA.map((ka: any, i: number) => (
                            <option
                              key={i}
                              value={ka.id}
                              className="text-body dark:text-bodydark uppercase"
                            >
                              {ka.nama}
                            </option>
                          ))}
                      </select>
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <p className="md:text-[14px] text-[9px] font-semibold">
                Form filling Guide
              </p>
              <div>
                <div className="flex justify-start md:gap-3 gap-1">
                  <div className="md:w-5 w-4 flex justify-center items-center">
                    <img className="" src={Ceklis} alt="" />
                  </div>
                  <p className="md:text-[14px] text-[9px] font-semibold">
                    : Kondisi Baik
                  </p>
                </div>
                <div className="flex justify-start md:gap-3 gap-1">
                  <div className="md:w-5 w-4 flex justify-center items-center">
                    <img className="" src={Polygon} alt="" />
                  </div>
                  <p className="md:text-[14px] text-[9px] font-semibold">
                    : Dapat Digunakan Dengan Catatan
                  </p>
                </div>
                <div className="flex justify-start md:gap-3 gap-1">
                  <div className="md:w-5 w-4 flex justify-center items-center">
                    <img className="" src={X} alt="" />
                  </div>
                  <p className="md:text-[14px] text-[9px] font-semibold">
                    : Jelek / Rusak
                  </p>
                </div>
                <div className="flex justify-start md:gap-3 gap-1">
                  <div className="md:w-5 w-4 flex justify-center items-center">
                    <img className="" src={Strip} alt="" />
                  </div>
                  <p className="md:text-[14px] text-[9px] font-semibold">
                    : Tidak Ada / Tidak Terpasang
                  </p>
                </div>
              </div>
            </div>
          </section>
          <div className="overflow-x-scroll ">
            <div className="min-w-[700px]">
              <section className="flex p-4 border-y-8 border-[#D8EAFF]">
                <div className="w-1/12">
                  <p className="md:text-[14px] text-[9px] font-semibold">No</p>
                </div>
                <div className="w-11/12 grid grid-cols-5 gap-10">
                  <p className="md:text-[14px] text-[9px] font-semibold">
                    Inspect Point{' '}
                  </p>
                  <p className="md:text-[14px] text-[9px] font-semibold">
                    Task List{' '}
                  </p>
                  <p className="md:text-[14px] text-[9px] font-semibold">
                    Acceptance Criteria{' '}
                  </p>
                  <p className="md:text-[14px] text-[9px] font-semibold">
                    Inspection Method
                  </p>
                  <p className="md:text-[14px] text-[9px] font-semibold">Tools</p>
                </div>
              </section>
              {pm1 != null &&
                pm1.inspection_point_pm1s.map((data: any, i: any) => {
                  function convertDatetimeToDate(datetime: any) {
                    const dateObject = new Date(datetime);
                    const day = dateObject.getDate().toString().padStart(2, '0'); // Ensure two-digit day
                    const month = (dateObject.getMonth() + 1)
                      .toString()
                      .padStart(2, '0'); // Adjust for zero-based month
                    const year = dateObject.getFullYear();
                    const hours = dateObject
                      .getHours()
                      .toString()
                      .padStart(2, '0');
                    const minutes = dateObject
                      .getMinutes()
                      .toString()
                      .padStart(2, '0');

                    return `${year}/${month}/${day}  ${hours}:${minutes}`; // Example format (YYYY-MM-DD)
                  }

                  const tiketMasuk = convertDatetimeToDate(data.tgl);
                  const waktuMulai = convertDatetimeToDate(data.waktu_mulai);

                  return (
                    <>
                      <section className=" border-b-8 border-[#D8EAFF]">
                        <div className="flex p-4 border-b-2 border-[#6D6C6C] ">
                          <div className="w-1/12">
                            <p className="md:text-[14px] text-[9px] font-semibold">
                              {i + 1}
                            </p>
                          </div>

                          <div className="flex w-full gap-10">
                            <div className="flex w-2/12">
                              <p className="md:text-[14px] text-[9px] font-semibold">
                                {data.inspection_point}{' '}
                              </p>
                            </div>
                            <div className="grid grid-cols-4 max-h-[400px] min-h-[200px] w-10/12 gap-3 pl-3 ">
                              {data.inspection_task_pm1s.map(
                                (task: any, ii: any) => {
                                  return (
                                    <>
                                      <div className="flex flex-col gap-y-10">
                                        <p className="md:text-[14px] text-[9px] font-semibold h-10">
                                          {task.task}
                                        </p>
                                      </div>
                                      <div className="flex flex-col gap-y-10 pl-2">
                                        <p className="md:text-[14px] text-[9px] font-semibold h-10">
                                          {task.acceptance_criteria}
                                        </p>
                                      </div>
                                      <div className="flex flex-col gap-y-10 pl-4">
                                        <p className="md:text-[14px] text-[9px] font-semibold h-10">
                                          {task.method}
                                        </p>
                                      </div>
                                      <div className="flex flex-col gap-y-10 pl-5">
                                        <p className="md:text-[14px] text-[9px] font-semibold h-10">
                                          {task.tools}
                                        </p>
                                      </div>
                                    </>
                                  );
                                },
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex w-full">
                          {data.waktu_selesai == null && (
                            <>
                              <div className="p-4 flex flex-col ">
                                <p className="md:text-[14px] text-[9px] font-semibold">
                                  Result:
                                </p>
                                <div className=" flex mt-3 w-full">
                                  <div className="relative z-20   md:w-[200px] w-[150px] dark:bg-form-input">
                                    <span className="absolute top-1/2 left-4 z-30 -translate-y-1/2">
                                      {/* <div className='md:w-6 w-4'>
                                                                    {hasil == 'Baik' ? <img src={Logo} alt="" /> : hasil == 'Catatan' ? <img src={Polygon} alt="" /> : hasil == 'Jelek' ? <img src={X} alt="" /> : hasil == 'Tidak terpasang' ? <img src={Strip} alt="" /> : ""}
                                                                </div> */}
                                    </span>

                                    <select
                                      name="hasil"
                                      defaultValue={data.hasil}
                                      onChange={(e) => {
                                        handleChangePoint(e, i);

                                        console.log(pm1);
                                        changeTextColor();
                                      }}
                                      className={`relative z-20 w-full appearance-none rounded-[10px]  border-2 border-[#D9D9D9] bg-transparent py-3 px-12 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input md:text-base text-sm ${isOptionSelected
                                        ? 'text-black dark:text-white'
                                        : ''
                                        }`}
                                    >
                                      <option
                                        value=""
                                        disabled
                                        selected
                                        className="text-body dark:text-bodydark "
                                      >
                                        Select Result
                                      </option>
                                      <option
                                        value="baik"
                                        className="text-body dark:text-bodydark"
                                      >
                                        Good
                                      </option>
                                      <option
                                        value="warning"
                                        className="text-body dark:text-bodydark"
                                      >
                                        Warning
                                      </option>
                                      <option
                                        value="jelek"
                                        className="text-body dark:text-bodydark"
                                      >
                                        Bad
                                      </option>
                                      <option
                                        value="tidak terpasang"
                                        className="text-body dark:text-bodydark"
                                      >
                                        Not Installed
                                      </option>
                                    </select>

                                    <span className="absolute top-1/2 right-4 z-10 -translate-y-1/2">
                                      <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <g opacity="0.8">
                                          <path
                                            fillRule="evenodd"
                                            clipRule="evenodd"
                                            d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                                            fill="#637381"
                                          ></path>
                                        </g>
                                      </svg>
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="p-4 flex flex-col ">
                                <p className="md:text-[14px] text-[9px] font-semibold">
                                  Upload Foto:
                                </p>

                                <br />
                                <div className="">
                                  <input
                                    type="file"
                                    name=""
                                    id=""
                                    className="w-60"
                                  />
                                </div>
                              </div>
                              <div className="p-4 flex flex-col w-5/12">
                                <p className="md:text-[14px] text-[9px] font-semibold">
                                  Catatan:
                                </p>

                                <>
                                  <div className=" flex mt-3">
                                    <textarea
                                      onChange={(e) => handleChangePoint(e, i)}
                                      name="catatan"
                                      defaultValue={data.catatan}
                                      id=""
                                      rows={3}
                                      cols={90}
                                      className=" border-2 border-[#D9D9D9] rounded-sm resize-none p-2 w-full"
                                    ></textarea>
                                  </div>
                                </>
                              </div>
                              <div className="p-4 flex flex-col justify-start items-start w-2/12 gap-3">
                                <p className="md:text-[14px] text-[9px] font-semibold">
                                  Time :
                                  {data.lama_pengerjaan != null
                                    ? data.lama_pengerjaan
                                    : ''}
                                </p>

                                <button
                                  onClick={() => {
                                    if (data.waktu_mulai != null) {
                                      alert('sudah di mulai');
                                    } else {
                                      startTask(data.id);
                                    }
                                  }}
                                  className="flex w-full rounded-md bg-[#00B81D] justify-center items-center px-2 py-3 hover:cursor-pointer"
                                >
                                  <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 14 14"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M12.7645 4.95136L3.63887 0.27536C1.96704 -0.581285 0 0.664567 0 2.58008V11.4199C0 13.3354 1.96704 14.5813 3.63887 13.7246L12.7645 9.04864C14.4118 8.20456 14.4118 5.79544 12.7645 4.95136Z"
                                      fill="white"
                                    />
                                  </svg>
                                </button>

                                <button
                                  onClick={() => {
                                    if (data.waktu_selesai != null) {
                                      alert('sudah di kerjakan');
                                    } else if (data.waktu_mulai == null) {
                                      alert('belum mulai');
                                    } else {
                                      stopTask(
                                        data.id,
                                        data.hasil,
                                        data.catatan,
                                        data.waktu_mulai,
                                      );
                                    }
                                  }}
                                  className="flex w-full rounded-md bg-[#DE0000] justify-center items-center px-2 py-3 hover:cursor-pointer"
                                >
                                  <svg
                                    width="14"
                                    height="12"
                                    viewBox="0 0 14 12"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <rect
                                      width="14"
                                      height="12"
                                      rx="3"
                                      fill="white"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </>
                          )}
                          {data.waktu_selesai != null && (
                            <>
                              <div className="p-4 flex flex-col ">
                                <p className="md:text-[14px] text-[9px] font-semibold">
                                  Result:
                                </p>
                                <div className=" flex mt-3 w-3/12">
                                  <div className="relative z-20 uppercase  md:w-[200px] w-[150px] dark:bg-form-input">
                                    {data.hasil}
                                  </div>
                                </div>
                              </div>
                              <div className="p-4 flex flex-col ">
                                <p className="md:text-[14px] text-[9px] font-semibold">
                                  Upload Foto:
                                </p>

                                <br />
                                <div className="">
                                  <input
                                    type="file"
                                    disabled
                                    name=""
                                    id=""
                                    className="w-60"
                                  />
                                </div>
                              </div>
                              <div className="p-4 flex flex-col w-5/12">
                                <p className="md:text-[14px] text-[9px] font-semibold">
                                  Catatan:
                                </p>

                                <>
                                  <div className=" flex mt-3">
                                    <textarea
                                      disabled
                                      onChange={(e) => handleChangePoint(e, i)}
                                      name="catatan"
                                      defaultValue={data.catatan}
                                      id=""
                                      rows={3}
                                      cols={90}
                                      className=" border-2 border-[#D9D9D9] rounded-sm resize-none p-2 w-full"
                                    ></textarea>
                                  </div>
                                </>
                              </div>
                              <div className="p-4 flex flex-col justify-start items-start w-2/12 gap-3">
                                <p className="md:text-[14px] text-[9px] font-semibold">
                                  Time : {''}
                                  {data.lama_pengerjaan != null
                                    ? data.lama_pengerjaan
                                    : ''}{' '}
                                  Menit
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </section>
                    </>
                  );
                })}

              <section className=" border-b-8 border-[#D8EAFF] flex flex-col">
                <div>
                  {pm1 != null && pm1.status != 'done' ? (
                    <button
                      onClick={openModalADD}
                      className="py-2 px-20 mx-5 mt-5 bg-primary text-white rounded-md"
                    >
                      +
                    </button>
                  ) : null}
                </div>
                {showModalADD && (
                  <ModalPM1TambahInspection
                    children={undefined}
                    onFinish={() => getPM1()}
                    isOpen={showModalADD}
                    onClose={closeModalADD}
                    idTicket={pm1.id}
                  />
                )}

                <p className="text-sm font-semibold p-5">Catatan Keseluruhan:</p>
                {waktuSelesaiPm1 != '-' && (
                  <>
                    <textarea
                      defaultValue={pm1 != null ? pm1.catatan : ''}
                      disabled
                      onChange={(e) => setCatatan(e.target.value)}
                      className="border-2 border-[#D9D9D9] rounded-sm resize-none mx-4 px-4"
                    ></textarea>

                  </>
                )}
                {waktuSelesaiPm1 == '-' && (
                  <>
                    <textarea
                      defaultValue={pm1 != null ? pm1.catatan : ''}
                      onChange={(e) => setCatatan(e.target.value)}
                      className="peer h-full min-h-[100px] w-[96%] mx-5 mb-5 resize-none rounded-[7px] border-2 border-stroke bg-transparent px-3 py-2.5  font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                    ></textarea>
                  </>
                )}

                <div className='flex flex-col px-4 py-4 md:text-[14px] text-[9px] font-semibold '>
                  <p>
                    {'Total Waktu Pengerjaan : ' +
                      ' ' +
                      totalWaktuTask +
                      ' ' +
                      'Menit'}
                  </p>
                  <p>{'Waktu Mulai PM1 : ' + waktuMulaiPm1}</p>
                  <p>{'Waktu Selesai PM1 : ' + waktuSelesaiPm1}</p>
                </div>

                <div className="flex w-full md:justify-end justify-start">
                  {pm1 != null && pm1.status != 'done' ? (
                    <button
                      onClick={() => donePm1(id)}
                      className="py-2 px-10 mx-5 mt-5 bg-primary text-white rounded-md mb-5"
                    >
                      SUBMIT INSPECTION
                    </button>
                  ) : null}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {/*==================================================================== Batas Mobile============================================*/}
      {isMobile && (
        <>
          <div className="w-full bg-white">
            <section className="flex justify-between p-2 w-full">
              <div className="flex w-full flex-col">
                <p className="md:text-[14px] text-[9px] font-semibold">
                  Machine Details
                </p>
                <div className="flex flex-col w-full pr-2">
                  <div className="flex flex-cols-3 gap-8">
                    <p className="md:text-[14px] text-[9px] font-semibold ">
                      {' '}
                      Nama Mesin{' '}
                    </p>
                    <p className="md:text-[14px] text-[9px] font-semibold ">:</p>
                    <p className="md:text-[14px] text-[9px] font-semibold pl-3.5">
                      {pm1 != null && pm1.nama_mesin}
                    </p>
                  </div>
                  <div className="flex flex-cols-3 gap-1 justify-between">
                    <p className="md:text-[14px] text-[9px] font-semibold ">
                      {' '}
                      Nomor Mesin{' '}
                    </p>
                    <p className="md:text-[14px] text-[9px] font-semibold ">:</p>
                    <p className="md:text-[14px] text-[9px] font-semibold">
                      {pm1 != null && pm1.mesin.kode_mesin}
                    </p>
                  </div>

                  <div className="flex flex-cols-3  gap-1 justify-between">
                    <p className="md:text-[14px] text-[9px] font-semibold ">
                      Tanggal
                    </p>
                    <p className="md:text-[14px] text-[9px] font-semibold ">:</p>
                    <p className="md:text-[14px] text-[9px] text-start font-semibold">
                      {pm1 != null && tiketMasuk}
                    </p>
                  </div>

                  <div className="flex flex-cols-3  gap-1 justify-between ">
                    <p className="md:text-[14px] text-[9px] font-semibold ">
                      Leader
                    </p>
                    <p className="md:text-[14px] text-[9px] font-semibold ">:</p>
                    <p className="md:text-[14px] text-[9px] text-start font-semibold">
                      {pm1 != null && pm1.id_leader != null ? (
                        <p className="text-body dark:text-bodydark uppercase">
                          {pm1.leader.nama}
                        </p>
                      ) : (
                        <select
                          className="uppercase"
                          onChange={(e) => {
                            setSelectionUserLeader(e.target.value);
                          }}
                        >
                          <option selected disabled>
                            Pilih Leader
                          </option>
                          {userLeader != null &&
                            userLeader.map((leader: any, i: number) => (
                              <option
                                key={i}
                                value={leader.id}
                                className="text-body dark:text-bodydark uppercase"
                              >
                                {leader.nama}
                              </option>
                            ))}
                        </select>
                      )}
                    </p>
                  </div>
                  <div className="flex flex-cols-3  gap-1 justify-between ">
                    <p className="md:text-[14px] text-[9px] font-semibold ">
                      Supervisor
                    </p>
                    <p className="md:text-[14px] text-[9px] font-semibold ">:</p>
                    <p className="md:text-[14px] text-[9px] text-start font-semibold">
                      {pm1 != null && pm1.id_supervisor != null ? (
                        <p className="text-body dark:text-bodydark uppercase">
                          {pm1.supervisor.nama}
                        </p>
                      ) : (
                        <select
                          className="uppercase"
                          onChange={(e) => {
                            setSelectionUserSuper(e.target.value);
                          }}
                        >
                          <option selected disabled>
                            Pilih Supervisor
                          </option>
                          {userSuper != null &&
                            userSuper.map((Super: any, i: number) => (
                              <option
                                key={i}
                                value={Super.id}
                                className="text-body dark:text-bodydark uppercase"
                              >
                                {Super.nama}
                              </option>
                            ))}
                        </select>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-1 justify-between ">
                    <p className="md:text-[14px] text-[9px] font-semibold">
                      KA BAG
                    </p>
                    <p className="md:text-[14px] text-[9px] font-semibold ">:</p>
                    <p className="md:text-[14px] text-[9px] text-start font-semibold">
                      {pm1 != null && pm1.id_ka_bag != null ? (
                        <p className="text-body dark:text-bodydark uppercase">
                          {pm1.ka_bag.nama}
                        </p>
                      ) : (
                        <select
                          className="uppercase"
                          onChange={(e) => {
                            setSelectionUserKA(e.target.value);
                          }}
                        >
                          <option selected disabled>
                            Pilih KA BAG
                          </option>
                          {userKA != null &&
                            userKA.map((ka: any, i: number) => (
                              <option
                                key={i}
                                value={ka.id}
                                className="text-body dark:text-bodydark uppercase"
                              >
                                {ka.nama}
                              </option>
                            ))}
                        </select>
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div className='flex flex-col w-full justify-start '>
                <p className="md:text-[14px] text-[9px] font-semibold">
                  Form filling Guide
                </p>
                <div>
                  <div className="flex justify-start md:gap-3 gap-1">
                    <div className="md:w-5 w-4 flex justify-center items-center">
                      <img className="" src={Ceklis} alt="" />
                    </div>
                    <p className="text-[9px] font-semibold">
                      : Kondisi Baik
                    </p>
                  </div>
                  <div className="flex justify-start gap-1">
                    <div className="md:w-5 w-4 flex justify-center items-center">
                      <img className="" src={Polygon} alt="" />
                    </div>
                    <p className="text-[9px] font-semibold text-start">
                      : Dapat Digunakan Dengan Catatan
                    </p>
                  </div>
                  <div className="flex justify-start md:gap-3 gap-1">
                    <div className="md:w-5 w-4 flex justify-center items-center">
                      <img className="" src={X} alt="" />
                    </div>
                    <p className=" text-[9px] font-semibold">
                      : Jelek / Rusak
                    </p>
                  </div>
                  <div className="flex justify-start md:gap-3 gap-1">
                    <div className="md:w-5 w-4 flex justify-center items-center">
                      <img className="" src={Strip} alt="" />
                    </div>
                    <p className=" text-[9px] font-semibold">
                      : Tidak Ada / Tidak Terpasang
                    </p>
                  </div>
                </div>
              </div>
            </section>
            <div className="overflow-x-scroll ">
              <div className="w-full">
                <section className="flex border-y-8 border-[#D8EAFF] px-2">
                  {/* <div className="w-full grid grid-cols-5 gap-3 text-center">
                    <p className="md:text-[14px] text-[9px] font-semibold">
                      Inspect Point{' '}
                    </p>
                    <p className="md:text-[14px] text-[9px] font-semibold">
                      Task List{' '}
                    </p>
                    <p className="md:text-[14px] text-[9px] font-semibold">
                      Acceptance Criteria{' '}
                    </p>
                    <p className="md:text-[14px] text-[9px] font-semibold">
                      Inspection Method
                    </p>
                    <p className="md:text-[14px] text-[9px] font-semibold">Tools</p>
                  </div> */}
                </section>
                {pm1 != null &&
                  pm1.inspection_point_pm1s.map((data: any, i: any) => {
                    function convertDatetimeToDate(datetime: any) {
                      const dateObject = new Date(datetime);
                      const day = dateObject.getDate().toString().padStart(2, '0'); // Ensure two-digit day
                      const month = (dateObject.getMonth() + 1)
                        .toString()
                        .padStart(2, '0'); // Adjust for zero-based month
                      const year = dateObject.getFullYear();
                      const hours = dateObject
                        .getHours()
                        .toString()
                        .padStart(2, '0');
                      const minutes = dateObject
                        .getMinutes()
                        .toString()
                        .padStart(2, '0');

                      return `${year}/${month}/${day}  ${hours}:${minutes}`; // Example format (YYYY-MM-DD)
                    }

                    const tiketMasuk = convertDatetimeToDate(data.tgl);
                    const waktuMulai = convertDatetimeToDate(data.waktu_mulai);

                    return (
                      <>

                        <section className=" border-b-8 border-[#D8EAFF]">
                          <div className="flex p-4 border-b-2 border-[#6D6C6C] ">
                            <div className="flex w-full ">
                              <div className="flex w-4/12 flex-col">
                                <p className="text-[11px] font-bold">
                                  Inspect Point{' '}
                                </p>
                                <p className="md:text-[14px] text-[9px] font-semibold">
                                  {data.inspection_point}{' '}
                                </p>

                                <div className="flex flex-col justify-start items-start w-full gap-1 pr-3">
                                  <p className="text-[11px] font-semibold">
                                    Time :
                                    {data.lama_pengerjaan != null
                                      ? data.lama_pengerjaan
                                      : ''}
                                  </p>
                                  {data.waktu_selesai == null && (
                                    <>
                                      <button
                                        onClick={() => {
                                          if (data.waktu_mulai != null) {
                                            alert('sudah di mulai');
                                          } else {
                                            startTask(data.id);
                                          }
                                        }}
                                        className="flex w-full rounded-md bg-[#00B81D] justify-center items-center py-2 hover:cursor-pointer"
                                      >
                                        <svg
                                          width="14"
                                          height="14"
                                          viewBox="0 0 14 14"
                                          fill="none"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <path
                                            d="M12.7645 4.95136L3.63887 0.27536C1.96704 -0.581285 0 0.664567 0 2.58008V11.4199C0 13.3354 1.96704 14.5813 3.63887 13.7246L12.7645 9.04864C14.4118 8.20456 14.4118 5.79544 12.7645 4.95136Z"
                                            fill="white"
                                          />
                                        </svg>
                                      </button>

                                      <button
                                        onClick={() => {
                                          if (data.waktu_selesai != null) {
                                            alert('sudah di kerjakan');
                                          } else if (data.waktu_mulai == null) {
                                            alert('belum mulai');
                                          } else {
                                            stopTask(
                                              data.id,
                                              data.hasil,
                                              data.catatan,
                                              data.waktu_mulai,
                                            );
                                          }
                                        }}
                                        className="flex w-full rounded-md bg-[#DE0000] justify-center items-center  py-2 hover:cursor-pointer"
                                      >
                                        <svg
                                          width="14"
                                          height="12"
                                          viewBox="0 0 14 12"
                                          fill="none"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <rect
                                            width="14"
                                            height="12"
                                            rx="3"
                                            fill="white"
                                          />
                                        </svg>
                                      </button>
                                    </>
                                  )}
                                  {data.waktu_selesai == null && (
                                    <>

                                    </>
                                  )}
                                </div>
                              </div>
                              <div className='flex flex-col gap-3 w-full'>
                                {data.inspection_task_pm1s.map(
                                  (task: any, ii: any) => {
                                    return (
                                      <>
                                        <div className='grid grid-cols-2 grid-rows-1 justify-start items-start border-stroke border-b-2'>

                                          <div className='flex flex-col w-32'>
                                            <p className="text-[11px] font-bold">
                                              Task List{' '}
                                            </p>
                                            <p className="md:text-[14px] text-[9px] font-semibold">
                                              {task.task}
                                            </p>
                                          </div>
                                          <div className='flex flex-col w-32 pl-2'>
                                            <p className="text-[11px] font-bold ">
                                              Inspection Method{' '}
                                            </p>
                                            <p className="md:text-[14px] text-[9px] font-semibold ">
                                              {task.method}
                                            </p>
                                          </div>
                                          <div className='flex flex-col w-32'>
                                            <p className="text-[11px] font-bold">
                                              Acceptance Criteria{' '}
                                            </p>
                                            <p className="md:text-[14px] text-[9px] font-semibold">
                                              {task.acceptance_criteria}
                                            </p>
                                          </div>
                                          <div className='flex flex-col w-32 pl-2'>
                                            <p className="text-[11px] font-bold">
                                              Tools{' '}
                                            </p>
                                            <p className="md:text-[14px] text-[9px] font-semibold ">
                                              {task.tools}
                                            </p>
                                          </div>
                                        </div>
                                      </>
                                    );
                                  },
                                )}
                              </div >
                            </div>
                          </div>
                          <div className="flex w-full">
                            {data.waktu_selesai == null && (
                              <>
                                <div className="flex flex-col px-2 w-full">
                                  <p className="md:text-[14px] text-[9px] font-semibold">
                                    Result:
                                  </p>
                                  <div className=" flex w-full">
                                    <div className="relative z-20 w-[130px] dark:bg-form-input">
                                      <span className="absolute top-1/2 left-4 z-30 -translate-y-1/2">
                                        <div className=' w-4'>
                                          {data.hasil == 'baik' ? <img src={Logo} alt="" /> : data.hasil == 'catatan' ? <img src={Polygon} alt="" /> : data.hasil == 'warning' ? <img src={X} alt="" /> : data.hasil == 'tidak terpasang' ? <img src={Strip} alt="" /> : ""}
                                        </div>
                                      </span>

                                      <select
                                        name="hasil"
                                        defaultValue={data.hasil}
                                        onChange={(e) => {
                                          handleChangePoint(e, i);

                                          console.log(pm1);
                                          changeTextColor();
                                        }}
                                        className={`relative z-20 w-full appearance-none rounded-[10px]  border-2 border-[#D9D9D9] bg-transparent px-8 py-2 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input md:text-base text-sm ${isOptionSelected
                                          ? 'text-black dark:text-white'
                                          : ''
                                          }`}
                                      >
                                        <option
                                          value=""
                                          disabled
                                          selected
                                          className="text-body dark:text-bodydark "
                                        >
                                          Select Result
                                        </option>
                                        <option
                                          value="baik"
                                          className="text-body dark:text-bodydark"
                                        >
                                          Good
                                        </option>
                                        <option
                                          value="warning"
                                          className="text-body dark:text-bodydark"
                                        >
                                          Warning
                                        </option>
                                        <option
                                          value="jelek"
                                          className="text-body dark:text-bodydark"
                                        >
                                          Bad
                                        </option>
                                        <option
                                          value="tidak terpasang"
                                          className="text-body dark:text-bodydark"
                                        >
                                          Not Installed
                                        </option>
                                      </select>

                                      <span className="absolute top-1/2 right-4 z-10 -translate-y-1/2">
                                        <svg
                                          width="24"
                                          height="24"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <g opacity="0.8">
                                            <path
                                              fillRule="evenodd"
                                              clipRule="evenodd"
                                              d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                                              fill="#637381"
                                            ></path>
                                          </g>
                                        </svg>
                                      </span>

                                    </div>

                                  </div>
                                </div>
                                <div className=" flex flex-col ">
                                  <p className="md:text-[14px] text-[9px] font-semibold">
                                    Upload Foto:
                                  </p>
                                  <div className="pt-2">
                                    <input
                                      type="file"
                                      name=""
                                      id=""
                                      className=""
                                    />
                                  </div>
                                </div>


                              </>
                            )}
                            {data.waktu_selesai != null && (
                              <>
                                <div className="flex flex-col px-2 w-full">
                                  <p className="md:text-[14px] text-[9px] font-semibold">
                                    Result:
                                  </p>
                                  <div className=" flex w-full">
                                    <div className="relative z-20 w-[130px] dark:bg-form-input">
                                      {data.hasil}
                                    </div>

                                  </div>
                                </div>
                                <div className=" flex flex-col ">
                                  <p className="md:text-[14px] text-[9px] font-semibold">
                                    Upload Foto:
                                  </p>
                                  <div className="pt-2">
                                    <input
                                      type="file"
                                      disabled
                                      name=""
                                      id=""
                                      className=""
                                    />
                                  </div>
                                </div>


                              </>
                            )}
                          </div>
                          {data.waktu_selesai == null && (
                            <>
                              <div className=" flex flex-col w-full px-2 py-2">
                                <p className="md:text-[14px] text-[9px] font-semibold">
                                  Catatan:
                                </p>

                                <>
                                  <div className=" flex">
                                    <textarea
                                      onChange={(e) => handleChangePoint(e, i)}
                                      name="catatan"
                                      defaultValue={data.catatan}
                                      id=""
                                      rows={3}
                                      cols={90}
                                      className=" border-2 border-[#D9D9D9] rounded-sm resize-none p-2 w-full"
                                    ></textarea>
                                  </div>
                                </>
                              </div>
                            </>
                          )}
                          {data.waktu_selesai != null && (
                            <>
                              <div className=" flex flex-col w-full px-2 py-2">
                                <p className="md:text-[14px] text-[9px] font-semibold">
                                  Catatan:
                                </p>

                                <>
                                  <div className=" flex">
                                    <textarea
                                      disabled
                                      onChange={(e) => handleChangePoint(e, i)}
                                      name="catatan"
                                      defaultValue={data.catatan}
                                      id=""
                                      rows={3}
                                      cols={90}
                                      className=" border-2 border-[#D9D9D9] rounded-sm resize-none p-2 w-full"
                                    ></textarea>
                                  </div>
                                </>
                              </div>
                            </>
                          )}
                        </section>
                      </>
                    );
                  })}

                <section className=" border-b-8 border-[#D8EAFF] flex flex-col">
                  <div>
                    {pm1 != null && pm1.status != 'done' ? (
                      <button
                        onClick={openModalADD}
                        className="py-2 px-20 mx-5 mt-5 bg-primary text-white rounded-md"
                      >
                        +
                      </button>
                    ) : null}
                  </div>
                  {showModalADD && (
                    <ModalPM1TambahInspection
                      children={undefined}
                      onFinish={() => getPM1()}
                      isOpen={showModalADD}
                      onClose={closeModalADD}
                      idTicket={pm1.id}
                    />
                  )}

                  <p className="text-[11px] font-semibold px-2 pt-4 pb-2">Catatan Keseluruhan:</p>
                  {waktuSelesaiPm1 != '-' && (
                    <>
                      <textarea
                        defaultValue={pm1 != null ? pm1.catatan : ''}
                        disabled
                        onChange={(e) => setCatatan(e.target.value)}
                        className="border-2 border-[#D9D9D9] rounded-sm resize-none mx-4 px-4 "
                      ></textarea>

                    </>
                  )}
                  {waktuSelesaiPm1 == '-' && (
                    <>
                      <div className='px-2'>
                        <textarea
                          defaultValue={pm1 != null ? pm1.catatan : ''}
                          onChange={(e) => setCatatan(e.target.value)}
                          className="border-2 border-[#D9D9D9] rounded-sm resize-none p-2 w-full"
                        ></textarea>
                      </div>

                    </>
                  )}


                  <div className='flex flex-col px-4 py-4 md:text-[14px] text-[9px] font-semibold '>
                    <p>
                      {'Total Waktu Pengerjaan : ' +
                        ' ' +
                        totalWaktuTask +
                        ' ' +
                        'Menit'}
                    </p>
                    <p>{'Waktu Mulai PM1 : ' + waktuMulaiPm1}</p>
                    <p>{'Waktu Selesai PM1 : ' + waktuSelesaiPm1}</p>
                  </div>

                  <div className="flex w-full md:justify-end justify-start">
                    {pm1 != null && pm1.status != 'done' ? (
                      <button
                        onClick={() => donePm1(id)}
                        className="py-2 px-10 mx-5 mt-5 bg-primary text-white rounded-md mb-5"
                      >
                        SUBMIT INSPECTION
                      </button>
                    ) : null}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </>
      )}
    </DefaultLayout>
  );
}

export default Pm1Form;
