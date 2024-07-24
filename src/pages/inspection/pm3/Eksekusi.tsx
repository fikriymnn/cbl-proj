import React, { useEffect, useState } from 'react';
import DefaultLayout from '../../../layout/DefaultLayout';

import { Link, useNavigate } from 'react-router-dom';
import ModalPM3Schedule from '../../../components/Modals/ModalPM3Schedule';
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

const monthName = [
  {
    name: 'January',
    value: 1,
  },
  {
    name: 'February',
    value: 2,
  },
  {
    name: 'Maret',
    value: 3,
  },
  {
    name: 'April',
    value: 4,
  },
  {
    name: 'Mei',
    value: 5,
  },
  {
    name: 'Juni',
    value: 6,
  },
  {
    name: 'Juli',
    value: 7,
  },
  {
    name: 'Agustus',
    value: 8,
  },
  {
    name: 'September',
    value: 9,
  },
  {
    name: 'Oktober',
    value: 10,
  },
  {
    name: 'November',
    value: 11,
  },
  {
    name: 'Desember',
    value: 12,
  },
];
function Eksekusi() {
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

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
  const [showModal22, setShowModal22] = useState(false);

  const openModal2 = () => setShowModal2(true);
  const closeModal2 = () => setShowModal2(false);
  const openModal22 = () => setShowModal22(true);
  const closeModal22 = () => setShowModal22(false);

  const [pm3, setPm3] = useState<any>();

  useEffect(() => {
    getPM3(null);
    getMe();
  }, []);

  async function getPM3(monthSelected: any) {
    const url = `${import.meta.env.VITE_API_LINK}/pm3`;
    const today = new Date();
    const currentMonth = today.getMonth();

    try {
      const res = await axios.get(url, {
        params: {
          month: monthSelected == null ? currentMonth + 1 : monthSelected,
        },
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

  async function inspectPM3(id: any) {
    const url = `${import.meta.env.VITE_API_LINK}/pm3/response/${id}`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });
      console.log(res.data);
      navigate(`/maintenance/inspection/pm_3_form/${id}`);
    } catch (error: any) {
      console.log(error);
    }
  }

  return (
    <>
      {!isMobile && (
        <main className="overflow-x-scroll">
          <div className="min-w-[700px] bg-white rounded-xl">
            <div className=" ps-7 w-full h-full flex border-b-8 border-[#D8EAFF]">
              <div className="w-2 h-full "></div>
              <section className="grid grid-cols-4  justify-between w-full py-4  font-semibold text-[14px]">
                <p className="">Nama Mesin</p>

                <p>Jadwal</p>
                <p>Inspector</p>

                <div className="mx-5 flex justify-end">
                  
              <div className='my-auto '>

              <select
              className='border rounded-sm py-1'
                onChange={(e) => {
                  getPM3(e.target.value);
                }}
              >
                <option className='text-xs' value={''}>Select Month</option>
                {monthName.map((month, key) => {
                  return <option value={month.value}>{month.name}</option>;
                })}
              </select>
              </div>
                </div>
              </section>
            </div>
            {pm3?.map((data: any, index: number) => {
              const tglFrom = convertTimeStampToDate(data.tgl_approve_from);
              const tglTo = convertTimeStampToDate(data.tgl_approve_to);
              return (
                <>
                  <section
                    key={index}
                    className=" flex  justify-center  w-full h-[59px]  border-b-8 border-[#D8EAFF] text-[14px]  text-black"
                  >
                    <div
                      className={`w-2 h-full sticky left-0 z-20 ${
                        data.mesin.bagian_mesin == 'printing'
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
                      <div className="ps-7 w-full grid grid-cols-4 justify-between">
                        <div className="flex flex-col justify-center font-bold sticky left-2 ps-3 md:ps-0 bg-white">
                          <p className="">{data.nama_mesin}</p>
                        </div>

                        <div className="flex flex-col justify-center">
                          <p className="text-[#00AF09] font-bold">{tglFrom}</p>
                          <p className="text-[#00AF09] font-bold">{tglTo}</p>
                        </div>
                        
                        <div className="flex flex-col justify-center font-bold sticky left-2 ps-3 md:ps-0 bg-white">
                        {data.inspector != null ? data.inspector.nama : '-'}
                        </div>

                        <div className="w-full flex justify-end px-3">
                          {data.id_inspector == me?.id ? (
                            <>
                              {data.status == 'done' ? (
                                <Link
                                  to={`/maintenance/inspection/pm_3_form/${data.id}`}
                                  className={`uppercase p-5 inline-flex rounded-[3px] items-center text-sm  py-1 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600 text-white font-bold text-[12px] justify-center`} // Dynamic class assignment
                                >
                                  Eksekusi
                                </Link>
                              ) : (
                                <button
                                  onClick={() => inspectPM3(data.id)}
                                  className={`uppercase p-5 inline-flex rounded-[3px] items-center text-sm  py-1 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600 text-white font-bold text-[12px] justify-center`} // Dynamic class assignment
                                >
                                  Eksekusi
                                </button>
                              )}
                            </>
                          ) : data.id_inspector == null ? (
                            <>
                              <button
                                onClick={() => inspectPM3(data.id)}
                                className={`uppercase p-5 inline-flex rounded-[3px] items-center text-sm  py-1 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600 text-white font-bold text-[12px] justify-center`} // Dynamic class assignment
                              >
                                Eksekusi
                              </button>
                            </>
                          ) : (
                            <></>
                          )}
                        </div>
                      </div>
                    </div>
                  </section>
                </>
              );
            })}
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
                    className={`w-2 h-full sticky left-0 z-20 ${
                      brand.partOf == 'printing'
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
                            onClick={openModal22}
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

export default Eksekusi;
