import React, { useEffect, useState } from 'react';
import DefaultLayout from '../../../layout/DefaultLayout';

import { Link } from 'react-router-dom';
import ModalPM3Schedule from '../../../components/Modals/ModalPM3Schedule';
import MyCalendar from '../../../components/Modals/Master/PM3/calender';
import axios from 'axios';
import convertTimeStampToDate from '../../../utils/convertDate';
const brandData = [
  {
    name: 'R700',
    tgl_permintaan: '25 Jun 2024',
    tgl_diajukan: '4 Jul 2024',
    tgl_terverifikasi: '6 Jul 2024',
    partOf: 'printing',
  },
  {
    name: 'SM 74',
    tgl_permintaan: '25 Jun 2024',
    tgl_diajukan: '4 Jul 2024',
    tgl_terverifikasi: '6 Jul 2024',
  },
  {
    name: 'GTO',
    tgl_permintaan: '25 Jun 2024',
    tgl_diajukan: '4 Jul 2024',
    tgl_terverifikasi: '6 Jul 2024',
  },
  {
    name: 'ITOH',
    tgl_permintaan: '25 Jun 2024',
    tgl_diajukan: '4 Jul 2024',
    tgl_terverifikasi: '6 Jul 2024',
  },
];
function Pm3() {
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

  const [showModal2, setShowModal2] = useState(false);
  const [showModal22, setShowModal22] = useState(null);

  const handleClickRequest = (index: any) => {
    setShowModal22((prevState: any) => {
      return prevState === index ? null : index;
    });
  };

  const closeModalRequest = () => setShowModal22(null);

  const [pm3, setPm3] = useState<any>();

  useEffect(() => {
    getPM3();
    getMe();
  }, []);

  async function getPM3() {
    const url = `${import.meta.env.VITE_API_LINK}/pm3/requestDate`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      setPm3(res.data);
      console.log(res.data);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  const [me, setMe] = useState<any>();

  async function getMe() {
    const url = `${import.meta.env.VITE_API_LINK}/me`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      setMe(res.data);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  async function createPM3() {
    const url = `${import.meta.env.VITE_API_LINK}/pm3/create`;
    try {
      const res = await axios.post(url, {
        withCredentials: true,
      });

      getPM3();
    } catch (error: any) {
      console.log(error);
    }
  }

  async function submitRequestPM3() {
    const url = `${import.meta.env.VITE_API_LINK}/pm3/submitDate`;
    try {
      const res = await axios.post(
        url,
        {
          data: pm3,
        },
        {
          withCredentials: true,
        },
      );
      alert('success');
      getPM3();
    } catch (error: any) {
      console.log(error);
    }
  }

  //change value point pm1
  const handleChangeDate = (e: any, i: number) => {
    const { name, value } = e.target;
    const onchangeVal: any = [...pm3];
    onchangeVal[i][name] = value;
    setPm3(onchangeVal);
  };

  return (
    <>


      {!isMobile && (
        <main className='overflow-x-scroll'>
          <div className='bg-white w-full pb-5'>
            <MyCalendar />
          </div>
          <div className='w-2 h-full '>

          </div>
          <div className='min-w-[700px] bg-white rounded-xl'>


            <div className=' ps-7 w-full h-full flex border-b-8 border-[#D8EAFF]'>
              <div className='w-2 h-full '>

              </div>
              <section className='grid grid-cols-5 w-full py-4  font-semibold text-[14px]'>


                <p className=''>Nama Mesin</p>


                <p>Tanggal Permintaan</p>

                <p>Jadwal Diajukan</p>

                <p>Jadwal Terverifikasi</p>

                <div className="w-[125px]">{''}</div>
              </section>
            </div>
            {pm3?.map((data: any, index: number) => {
              const tglPermintaan = convertTimeStampToDate(data.createdAt);
              return (
                <>
                  <section
                    key={index}
                    className=" flex  justify-center  w-full h-[59px]  border-b-8 border-[#D8EAFF] text-[14px]  text-black"
                  >
                    <div
                      className={`w-2 h-full sticky left-0 z-20 ${data.mesin.bagian_mesin == 'printing'
                        ? 'bg-green-600'
                        : data.mesin.bagian_mesin == 'water base'
                          ? 'bg-yellow-600'
                          : data.mesin.bagian_mesin == 'pond'
                            ? 'bg-violet-900'
                            : data.mesin.bagian_mesin == 'finishing'
                              ? 'bg-red-900'
                              : ''
                        }`}
                    ></div>

                    <div className=" w-full h-full flex flex-col justify-center relative">
                      <div className="ps-7 w-full grid grid-cols-5">
                        <div className="flex flex-col justify-center font-bold sticky left-2 ps-3 md:ps-0 bg-white">
                          <p className="">{data.nama_mesin}</p>
                        </div>

                        <div className="flex flex-col justify-center">
                          <p className="">{tglPermintaan}</p>
                        </div>
                        <div className="flex flex-col justify-center">
                          <p className="">
                            {data.tgl_request_from != null
                              ? data.tgl_request_from
                              : '-'}
                          </p>
                          <p className="">
                            {data.tgl_request_to != null
                              ? data.tgl_request_to
                              : '-'}
                          </p>
                        </div>
                        <div className="flex flex-col justify-center">
                          <p className="text-[#00AF09] font-bold">
                            {data.tgl_approve_from != null
                              ? data.tgl_approve_from
                              : '-'}
                          </p>
                          <p className="text-[#00AF09] font-bold">
                            {data.tgl_approve_to != null
                              ? data.tgl_approve_to
                              : '-'}
                          </p>
                        </div>

                        <div>
                          <>
                            <div
                              className={`cursor-pointer uppercase p-5 inline-flex rounded-[3px] items-center text-sm  py-1 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600 text-white font-bold text-[12px] justify-center `} // Dynamic class assignment
                              onClick={() => handleClickRequest(index)}
                            >
                              REQUEST
                            </div>
                            {showModal22 == index && (
                              <div className="fixed z-50 inset-0 overflow-y-auto backdrop-blur-sm bg-white/10 p-4 md:p-8 flex justify-center items-center">
                                <div className="w-full max-w-md bg-white rounded-xl shadow-md">
                                  <div className="flex w-full items-center pt-4 px-3">
                                    <svg
                                      className="flex w-1/12"
                                      width="20"
                                      height="19"
                                      viewBox="0 0 20 19"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M4.55799 4.51474L8.56073 8.46883M4.55799 4.51474H1.8895L1 1.87869L1.8895 1L4.55799 1.87869V4.51474ZM16.3518 1.65111L14.0146 3.95997C13.6623 4.30794 13.4861 4.48192 13.4202 4.68255C13.3621 4.85904 13.3621 5.04913 13.4202 5.22562C13.4861 5.42625 13.6623 5.60023 14.0146 5.94821L14.2256 6.15668C14.5778 6.50466 14.754 6.67864 14.9571 6.74383C15.1357 6.80117 15.3282 6.80117 15.5068 6.74383C15.7099 6.67864 15.8861 6.50466 16.2383 6.15668L18.4246 3.99695C18.6601 4.56297 18.7899 5.18289 18.7899 5.83277C18.7899 8.50187 16.5996 10.6655 13.8977 10.6655C13.572 10.6655 13.2536 10.6341 12.9458 10.5741C12.5133 10.4899 12.2971 10.4477 12.166 10.4606C12.0267 10.4743 11.958 10.495 11.8345 10.5603C11.7184 10.6217 11.6019 10.7367 11.3689 10.9669L5.00274 17.2557C4.26585 17.9836 3.07113 17.9836 2.33425 17.2557C1.59736 16.5278 1.59736 15.3475 2.33425 14.6196L8.70038 8.33088C8.93343 8.10066 9.04986 7.9856 9.11204 7.87088C9.17813 7.7489 9.19903 7.68106 9.21291 7.54341C9.22598 7.41392 9.18329 7.20034 9.09807 6.77318C9.03732 6.46899 9.00548 6.15456 9.00548 5.83277C9.00548 3.1637 11.1958 1 13.8977 1C14.7921 1 15.6305 1.23709 16.3518 1.65111ZM9.89506 12.4228L14.7872 17.2556C15.5241 17.9835 16.7188 17.9835 17.4557 17.2556C18.1926 16.5277 18.1926 15.3474 17.4557 14.6195L13.431 10.6438C13.1461 10.6172 12.8683 10.5664 12.5998 10.4936C12.2537 10.3997 11.874 10.4679 11.6203 10.7185L9.89506 12.4228Z"
                                        stroke="#0065DE"
                                        stroke-width="1.5"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                      />
                                    </svg>

                                    <label className="flex w-10/12 text-blue-700 text-sm font-bold ">
                                      Request PM 2 Inspection Schedule
                                    </label>
                                    <button
                                      type="button"
                                      onClick={() => closeModalRequest()}
                                      className="text-gray-400 focus:outline-none"
                                    >
                                      <svg
                                        width="22"
                                        height="22"
                                        viewBox="0 0 22 22"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <circle
                                          cx="11"
                                          cy="11"
                                          r="11"
                                          fill="#0065DE"
                                        />
                                        <rect
                                          x="6.03955"
                                          y="4.23242"
                                          width="17"
                                          height="3"
                                          rx="1.5"
                                          transform="rotate(42.8321 6.03955 4.23242)"
                                          fill="white"
                                        />
                                        <rect
                                          x="4.18213"
                                          y="16.0609"
                                          width="17"
                                          height="3"
                                          rx="1.5"
                                          transform="rotate(-45 4.18213 16.0609)"
                                          fill="white"
                                        />
                                      </svg>
                                    </button>
                                  </div>

                                  <div className="px-4 pb-4">
                                    <div className="pt-4">
                                      <label
                                        htmlFor="ticketCode"
                                        className="form-label block  text-black text-xs font-extrabold"
                                      >
                                        NAMA MESIN
                                      </label>
                                      <span
                                        id="ticketCode"
                                        className="text-neutral-500 text-xl font-normal "
                                      >
                                        {data.nama_mesin}
                                      </span>
                                    </div>
                                    <div className="pt-4">
                                      <label
                                        htmlFor="ticketCode"
                                        className="form-label block  text-black text-xs font-extrabold"
                                      >
                                        Dari
                                      </label>
                                    </div>
                                    <div className="pt-1 w-full">
                                      <input
                                        type="date"
                                        name="tgl_request_from"
                                        onChange={(e) => {
                                          handleChangeDate(e, index);
                                        }}
                                        className="p-2 border border-slate-600 rounded-md w-full"
                                      />
                                    </div>
                                    <div className="pt-4">
                                      <label
                                        htmlFor="ticketCode"
                                        className="form-label block  text-black text-xs font-extrabold"
                                      >
                                        Sampai
                                      </label>
                                    </div>
                                    <div className="pt-1 w-full">
                                      <input
                                        type="date"
                                        name="tgl_request_to"
                                        onChange={(e) => {
                                          handleChangeDate(e, index);
                                        }}
                                        className="p-2 border border-slate-600 rounded-md w-full"
                                      />
                                    </div>
                                    <div className="pt-5">
                                      <button className="w-full h-12 text-center text-white text-xs font-bold bg-blue-700 rounded-md">
                                        KIRIM PERMINTAAN
                                      </button>
                                    </div>
                                  </div>
                                  <button
                                    title="button"
                                    type="button"
                                    onClick={closeModalRequest}
                                    className="absolute top-auto right-auto bottom-3 left-auto transform translate-x-1/2 translate-y-1/2 text-gray-400 focus:outline-none"
                                  ></button>
                                </div>
                              </div>
                            )}
                          </>
                        </div>
                      </div>
                    </div>
                  </section>
                </>
              );
            })}

            <section className=" grid grid-cols-5 w-full  justify-end  h-[59px]  border-b-8 border-[#D8EAFF] text-[14px]  text-black">
              <div className="col-span-4"></div>
              <div className="w-full flex  ">
                <button
                  onClick={submitRequestPM3}
                  className="my-2 w-27 mx-2 px-2 bg-blue-700 text-sm text-white font-semibold uppercase"
                >
                  Submit{' '}
                </button>
              </div>
            </section>
          </div>
        </main>
      )}
      {isMobile && (
        <main className="overflow-x-scroll">
          <div className="w-full bg-white rounded-xl">
            <p className="text-[14px] font-semibold w-full  border-b-8 border-[#D8EAFF] py-4 px-9 md:ps-9 ps-12">
              01 April 2024
            </p>
            <div className=" ps-7 w-full h-full flex border-b-8 border-[#D8EAFF]">
              <div className="w-2 h-full "></div>
              <section className="grid grid-cols-1 w-full py-4  font-semibold text-[14px]">
                <p className="">Nama Mesin</p>

                <div className="w-[125px]">{''}</div>
              </section>
            </div>
            {brandData.map((brand, key) => (
              <>
                <section
                  key={key}
                  className=" flex  justify-center  w-full h-[59px]  border-b-8 border-[#D8EAFF] text-[14px]  text-black"
                >
                  <div
                    className={`w-2 h-full sticky left-0 z-20 ${brand.partOf == 'printing'
                      ? 'bg-green-600'
                      : brand.partOf == 'water base'
                        ? 'bg-yellow-600'
                        : brand.partOf == 'pond'
                          ? 'bg-violet-900'
                          : brand.partOf == 'finishing'
                            ? 'bg-red-900'
                            : ''
                      }`}
                  ></div>

                  <div className=" w-full h-full flex flex-col justify-center relative">
                    <div className="ps-7 w-full grid grid-cols-2">
                      <div className="flex flex-col justify-center font-bold sticky left-2 ps-3 md:ps-0 bg-white">
                        <p className="">{brand.name}</p>
                      </div>

                      <div className="flex w-full justify-center">
                        <>
                          <div
                            className={`uppercase p-5 inline-flex rounded-[3px] items-center text-sm  py-1 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600 text-white font-bold text-[12px] justify-center `} // Dynamic class assignment
                          //onClick={}
                          >
                            REQUEST
                          </div>
                        </>
                      </div>
                    </div>
                  </div>
                </section>
              </>
            ))}
          </div>
        </main>
      )}
    </>
  );
}

export default Pm3;
