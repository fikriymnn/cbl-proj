import { useEffect, useState } from 'react';
import React from 'react';
import Arrow from '../../../images/icon/arrowDown.svg';
import Polygon6 from '../../../images/icon/polygon6.svg';
import X from '../../../images/icon/x.svg';
import Burger from '../../../images/icon/burger.svg';
import axios from 'axios';

import Loading from '../../Loading';
import Stack from '@mui/material/Stack';
import Pagination from '@mui/material/Pagination';
import ModalMtcDate from '../../../components/Modals/ModalMtcDate';
import ModalDetailOS3 from '../../../components/Modals/ModalDetailOS3';
import ModalStockCheckOs3 from '../../../components/Modals/ModalStockCheckOs3';

const OS3MaintenanceTables = () => {
  // Common states
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Incoming tickets states
  const [incomingPage, setIncomingPage] = useState(1);
  const [incomingTickets, setIncomingTickets] = useState<any>(null);
  const [showIncomingDetail, setShowIncomingDetail] = useState<boolean[]>([]);

  // Processing tickets states
  const [processingPage, setProcessingPage] = useState(1);
  const [processingTickets, setProcessingTickets] = useState<any[]>([]);
  const [showProcessingDetail, setShowProcessingDetail] = useState<boolean[]>(
    [],
  );
  const [showModal1, setShowModal1] = useState<boolean[]>([]);
  const [showModal2, setShowModal2] = useState(false);
  const [showModalDetail, setShowModalDetail] = useState<boolean[]>([]);
  const [showTwoButtons, setShowTwoButtons] = useState<boolean[]>([]);

  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
  };

  const handleClickIncomingDetail = (index: number) => {
    setShowIncomingDetail((prevState) => {
      const updatedShowDetail = [...prevState];
      updatedShowDetail[index] = !updatedShowDetail[index];
      return updatedShowDetail;
    });
  };

  const handleClickProcessingDetail = (index: number) => {
    setShowProcessingDetail((prevState) => {
      const updatedShowDetail = [...prevState];
      updatedShowDetail[index] = !updatedShowDetail[index];
      return updatedShowDetail;
    });
  };

  const handleClick = (index: number) => {
    setShowTwoButtons((prevState) => {
      const updatedState = [...prevState];
      updatedState[index] = !updatedState[index];
      return updatedState;
    });
  };

  const openModal1 = (index: number) => {
    setShowModal1((prevState) => {
      const updatedState = [...prevState];
      updatedState[index] = true;
      return updatedState;
    });
  };

  const closeModal1 = (index: number) => {
    setShowModal1((prevState) => {
      const updatedState = [...prevState];
      updatedState[index] = false;
      return updatedState;
    });
  };

  const openModal2 = () => {
    setShowModal2(true);
  };

  const closeModal2 = () => {
    setShowModal2(false);
  };

  const openModalDetail = (index: number) => {
    setShowModalDetail((prevState) => {
      const updatedState = [...prevState];
      updatedState[index] = true;
      return updatedState;
    });
  };

  const closeModalDetail = (index: number) => {
    setShowModalDetail((prevState) => {
      const updatedState = [...prevState];
      updatedState[index] = false;
      return updatedState;
    });
  };

  const convertDatetimeToDate = (datetime: any) => {
    const dateObject = new Date(datetime);
    const day = dateObject.getDate().toString().padStart(2, '0');
    const month = (dateObject.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObject.getFullYear();
    const hours = dateObject.getHours().toString().padStart(2, '0');
    const minutes = dateObject.getMinutes().toString().padStart(2, '0');

    return `${year}/${month}/${day}  ${hours}:${minutes}`;
  };

  const calculateResponTime = (createdAt: string, waktuRespon: string) => {
    // Implementation for calculating response time
    const created = new Date(createdAt);
    const respon = new Date(waktuRespon);
    const diff = respon.getTime() - created.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'open':
        return 'text-xs font-medium px-2 py-1 bg-red-100 text-red-800 rounded';
      case 'pending':
        return 'text-xs font-medium px-2 py-1 bg-yellow-100 text-yellow-800 rounded';
      case 'closed':
        return 'text-xs font-medium px-2 py-1 bg-green-100 text-green-800 rounded';
      case 'monitoring':
        return 'text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded';
      default:
        return 'text-xs font-light';
    }
  };

  const getProgressStyle = (skor: number) => {
    const baseClasses =
      'text-xs px-2 font-light rounded-xl flex justify-center';

    if (skor === 100) {
      return `${baseClasses} text-[#0057FF] bg-[#B1ECFF]`;
    } else if (skor >= 60) {
      return `${baseClasses} text-green-600 bg-[#00de3f2f]`;
    } else if (skor >= 40) {
      return `${baseClasses} text-[#DE0000] bg-[#FFDBB1]`;
    } else if (skor >= 0) {
      return `${baseClasses} text-[#DE0000] bg-[#FFB1B1]`;
    }
    return baseClasses;
  };

  const getSourceData = (data: any, field: string) => {
    const sourceMap = {
      pm1: data.point_pm1,
      pm2: data.point_pm2,
      pm3: data.point_pm3,
    };

    const source = sourceMap[data.sumber as keyof typeof sourceMap];
    if (!source) return '';

    switch (field) {
      case 'hasil':
        return source.hasil;
      case 'catatan':
        return source.catatan;
      case 'inspection_point':
        return source.inspection_point;
      case 'acceptance_criteria':
        return (
          source[`inspection_task_${data.sumber}s`]?.[0]?.acceptance_criteria ||
          ''
        );
      case 'method':
        return source[`inspection_task_${data.sumber}s`]?.[0]?.method || '';
      case 'tools':
        return source[`inspection_task_${data.sumber}s`]?.[0]?.tools || '';
      case 'task':
        return source[`inspection_task_${data.sumber}s`]?.[0]?.task || '';
      default:
        return '';
    }
  };

  // Get incoming tickets
  const getIncomingTickets = async () => {
    const url = `${import.meta.env.VITE_API_LINK}/ticket?bagian_tiket=incoming`;
    try {
      const res = await axios.get(url, {
        params: {
          page: incomingPage,
          limit: 10,
        },
        withCredentials: true,
      });

      setIncomingTickets(res.data);
      const data = new Array(res.data.data.length).fill(false);
      setShowIncomingDetail(data);
    } catch (error: any) {
      console.log(error.response);
    }
  };

  // Get processing tickets (OS3)
  const getProcessingTickets = async () => {
    const url = `${import.meta.env.VITE_API_LINK}/ticketOs3?bagian_tiket=os3`;
    try {
      const res = await axios.get(url, {
        params: {
          page: 1,
          limit: 5,
        },
        withCredentials: true,
      });

      setProcessingTickets(res.data.data);

      const initialState = new Array(res.data.data.length).fill(false);
      setShowModal1(initialState);
      setShowModalDetail(initialState);
      setShowTwoButtons(initialState);
      setShowProcessingDetail(initialState);
    } catch (error: any) {
      console.log(error.response);
    }
  };

  // Get user data
  const getUser = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_LINK}/user/profile`,
        {
          withCredentials: true,
        },
      );
      setUser(res.data);
    } catch (error: any) {
      console.log(error.response);
    }
  };

  // Response to incoming ticket
  const responIncomingMTC = async (id: number) => {
    const url = `${import.meta.env.VITE_API_LINK}/ticket/respon/${id}`;
    try {
      setIsLoading(true);
      await axios.get(url, {
        withCredentials: true,
      });
      setIsLoading(false);
      getIncomingTickets();
      alert('Response successful');
    } catch (error: any) {
      console.log(error.response.data.msg);
      alert(error.response.data.msg);
      setIsLoading(false);
    }
  };

  // Response to processing ticket
  const responProcessingMTC = async (id: number) => {
    const url = `${import.meta.env.VITE_API_LINK}/ticketOs3/respon/${id}`;
    try {
      await axios.get(url, {
        withCredentials: true,
      });
      alert('proses berhasil');
      getProcessingTickets();
    } catch (error: any) {
      console.log(error.response);
      alert('error');
    }
  };

  const reworkTiket = async (idTiket: number) => {
    const url = `${import.meta.env.VITE_API_LINK}/ticketOs3/rework/${idTiket}`;
    try {
      const res = await axios.put(
        url,
        { id_eksekutor: user.id },
        { withCredentials: true },
      );
      alert(res.data.msg);
      getProcessingTickets();
    } catch (error: any) {
      alert(error.response?.data?.msg || 'Error occurred');
    }
  };

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    getIncomingTickets();
    getProcessingTickets();
    getUser();
  }, []);

  const renderIncomingTable = () => {
    if (isMobile) {
      return (
        <div className="rounded-b-xl border border-stroke bg-white pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:pb-1">
          <div className="flex flex-col">
            {/* Header Row */}
            <div className="flex border-b-8 border-[#D8EAFF] dark:border-strokedark">
              <div className="flex w-5/12"></div>
              <div className="flex items-center w-5/12 justify-center p-2.5 md:px-7.5 px-5">
                <p className="text-slate-600 md:text-[12px] text-[10px] font-semibold text-center dark:text-white">
                  Kode Tiket
                </p>
              </div>
              <div className="flex items-center md:text-[12px] text-[10px] w-7/12 justify-start p-2.5 md:px-7.5 px-5">
                <p className="text-slate-600 font-semibold text-center dark:text-white">
                  Waktu Masuk
                </p>
              </div>
            </div>

            {/* Data Rows */}
            {incomingTickets?.data?.map((ticket: any, key: any) => {
              const tiketMasuk = convertDatetimeToDate(ticket.createdAt);

              return (
                <div className="" key={key}>
                  <div className="w-full">
                    <div className="flex">
                      <div className="flex justify-center items-center pl-2 py-2">
                        <button
                          title="button"
                          onClick={() => handleClickIncomingDetail(key)}
                          className="h-14 w-8 text-xs font-bold text-blue-700 bg-blue-700 border-blue-700 border rounded-[4px]"
                        >
                          <img src={Arrow} alt="" className="mx-2 py-1" />
                        </button>
                      </div>
                      <div className="flex flex-wrap w-4/12 border-b-[#D8EAFF] px-2 gap-1 py-2">
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => responIncomingMTC(ticket.id)}
                          className="inline-flex py-[6px] rounded-[3px] my-auto md:px-5 px-1 md:text-[12px] text-[10px] sm:font-semibold bg-[#0065DE] text-white hover:bg-[#234a79] justify-center"
                        >
                          {isLoading ? 'Loading...' : 'RESPON'}
                        </button>
                        {isLoading && <Loading />}
                      </div>
                      <div className="flex items-center w-6/12 justify-center border-b-[#D8EAFF]">
                        <p className="text-black text-center md:text-[12px] text-[10px] dark:text-white">
                          {ticket.kode_ticket}
                        </p>
                      </div>
                      <div className="flex items-center w-5/12 justify-center p-2.5 md:px-7.5 px-5 border-b-[#D8EAFF]">
                        <p className="text-black text-center md:text-[12px] text-[10px] dark:text-white">
                          {tiketMasuk}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Detail Section */}
                  <div className="flex w-full border-b-6 border-[#D8EAFF] dark:border-strokedark">
                    {showIncomingDetail[key] && (
                      <div className="w-full bg-[#E9F3FF] rounded-b-md py-2 px-4">
                        <div className="flex w-full">
                          <div className="flex w-full">
                            <div className="flex w-6/12 flex-col">
                              <p className="text-xs font-bold">Nama Mesin</p>
                              <p className="text-sm font-light">
                                {ticket.mesin}
                              </p>
                            </div>
                            <div className="flex w-6/12 flex-col">
                              <p className="text-xs font-bold">Kendala</p>
                              <p className="text-sm font-light">
                                {ticket.nama_kendala}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-b-xl lg:min-w-[700px] border border-stroke bg-white pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:pb-1">
        <div className="flex flex-col">
          {/* Header Row */}
          <div className="flex border-[#D8EAFF] dark:border-strokedark">
            <div className="flex items-center w-1/12 gap-3 p-2.5 md:px-7.5 px-5">
              <p className="md:text-[12px] text-[10px] text-slate-600 font-semibold dark:text-white sm:block">
                No
              </p>
            </div>
            <div className="flex items-center w-2/12 justify-center">
              <p className="text-slate-600 md:text-[12px] text-[10px] font-semibold text-center dark:text-white">
                Kode Tiket
              </p>
            </div>
            <div className="flex items-center md:text-[12px] text-[10px] w-3/12 ml-4 justify-center p-2.5 md:px-7.5 px-5">
              <p className="text-slate-600 font-semibold text-center dark:text-white">
                Waktu Masuk
              </p>
            </div>
            <div className="flex items-center md:text-[12px] text-[10px] w-4/12 ml-4 justify-center p-2.5 md:px-7.5 px-5">
              <p className="text-slate-600 font-semibold text-center">
                Nama Mesin
              </p>
            </div>
            <div className="flex items-center md:text-[12px] text-[10px] w-4/12 mr-2 justify-center p-2.5 md:px-7.5 px-5">
              <p className="text-slate-600 font-semibold text-center">
                Kendala
              </p>
            </div>
            <div className="items-center justify-center md:w-5/12 w-2/12 p-2.5 md:px-7.5 px-5 flex">
              <p className="text-slate-600 md:text-[12px] text-[10px] font-semibold text-center">
                Action
              </p>
            </div>
          </div>

          {/* Data Rows */}
          {incomingTickets?.data?.map((ticket: any, key: any) => {
            const tiketMasuk = convertDatetimeToDate(ticket.createdAt);

            return (
              <div
                className="flex border-t-8 border-[#D8EAFF] dark:border-strokedark"
                key={key}
              >
                <div className="flex items-center w-1/12 gap-3 p-2.5 md:px-7.5 px-5 border-b-[#D8EAFF]">
                  <p className="md:text-[12px] text-[10px] text-black dark:text-white block">
                    {key + 1}
                  </p>
                </div>
                <div className="flex items-center w-2/12 justify-center border-b-[#D8EAFF]">
                  <p className="text-black text-center md:text-[12px] text-[10px] dark:text-white break-all">
                    {ticket.kode_ticket}
                  </p>
                </div>
                <div className="flex items-center w-3/12 justify-center p-2.5 md:px-7.5 px-5 border-b-[#D8EAFF]">
                  <p className="text-black text-center md:text-[12px] text-[10px] dark:text-white">
                    {tiketMasuk}
                  </p>
                </div>
                <div className="flex items-center w-4/12 justify-center p-2.5 md:px-7.5 px-5 border-b-[#D8EAFF]">
                  <p className="text-black text-center md:text-[12px] text-[10px]">
                    {ticket.mesin}
                  </p>
                </div>
                <div className="flex items-center w-3/12 justify-center p-2.5 md:px-7.5 px-5 border-b-[#D8EAFF]">
                  <p className="text-black text-center md:text-[12px] text-[10px] dark:text-white">
                    {ticket.nama_kendala}
                  </p>
                </div>
                <div className="items-center justify-center md:w-5/12 w-2/12 p-2.5 md:px-7.5 px-5 border-b-[#D8EAFF] flex">
                  <div className="mx-auto flex gap-3">
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => responIncomingMTC(ticket.id)}
                      className="inline-flex py-2 rounded-[3px] my-auto md:px-5 px-1 md:text-[12px] text-[10px] sm:font-semibold bg-[#0065DE] text-white hover:bg-[#234a79] justify-center"
                    >
                      {isLoading ? 'Loading...' : 'RESPON'}
                    </button>
                    {isLoading && <Loading />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderProcessingTable = () => (
    <main>
      <div className="bg-white mt-2">
        <table className="w-full border-collapse">
          <thead>
            <tr className="py-2">
              <th className="px-5 text-xs font-bold text-left py-2">No</th>
              <th className="px-2 text-xs font-bold text-left py-2">
                <div className="flex gap-2 items-center">
                  <span>Kode Tiket</span>
                  <img className="w-2" src={Polygon6} alt="" />
                </div>
              </th>
              <th className="px-2 text-xs font-bold text-left py-2">
                <div className="flex gap-2 items-center">
                  <span>Sumber</span>
                  <img className="w-2" src={Polygon6} alt="" />
                </div>
              </th>
              <th className="px-2 text-xs font-bold text-left py-2">
                <div className="flex gap-2 items-center">
                  <span>Mesin</span>
                  <img className="w-2" src={Polygon6} alt="" />
                </div>
              </th>
              <th className="px-2 text-xs font-bold text-left py-2">
                <div className="flex gap-2 items-center">
                  <span>Kendala</span>
                  <img className="w-2" src={Polygon6} alt="" />
                </div>
              </th>
              <th className="px-2 text-xs font-bold text-left py-2">
                <div className="flex gap-2 items-center">
                  <span>Indikator</span>
                  <img className="w-2" src={Polygon6} alt="" />
                </div>
              </th>
              <th className="px-2 text-xs font-bold text-left py-2">Status</th>
              <th className="px-2 text-xs font-bold text-left py-2">
                Persentase
              </th>
              <th className="px-2 text-xs font-bold text-left py-2">
                Inspektor PM
              </th>
              <th className="px-2 text-xs font-bold text-left py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {processingTickets.map((data: any, i: number) => {
              const lengthProses = data.proses_mtc_os3s.length - 1;
              const dateMtc = convertDatetimeToDate(data.createdAt);
              const waktuRespon = calculateResponTime(
                data.createdAt,
                data.waktu_respon,
              );

              // Function to get inspector name based on PM type in sumber
              const getInspectorName = (data: any) => {
                const sumber = data.sumber?.toLowerCase() || '';

                if (sumber.includes('pm1') || sumber.includes('pm 1')) {
                  return data.point_pm1?.ticket_pm1?.inspector?.nama || '-';
                } else if (sumber.includes('pm2') || sumber.includes('pm 2')) {
                  return data.point_pm2?.ticket_pm2?.inspector?.nama || '-';
                } else if (sumber.includes('pm3') || sumber.includes('pm 3')) {
                  return data.point_pm3?.ticket_pm3?.inspector?.nama || '-';
                } else {
                  // Fallback: check which PM data exists
                  if (data.point_pm1?.ticket_pm1?.inspector?.nama) {
                    return data.point_pm1.ticket_pm1.inspector.nama;
                  } else if (data.point_pm2?.ticket_pm2?.inspector?.nama) {
                    return data.point_pm2.ticket_pm2.inspector.nama;
                  } else if (data.point_pm3?.ticket_pm3?.inspector?.nama) {
                    return data.point_pm3.ticket_pm3.inspector.nama;
                  }
                  return '-';
                }
              };

              return (
                <React.Fragment key={i}>
                  <tr className="bg-white border-b-5 border-blue">
                    <td className="py-3 px-6 text-center">{i + 1}</td>

                    <td className="px-2 py-3">
                      <p className="text-xs font-light">{data.kode_tiket}</p>
                    </td>

                    <td className="px-2 py-3">
                      <p className="text-xs font-light">{data.sumber}</p>
                    </td>

                    <td className="px-2 py-3">
                      <p className="text-xs font-light">{data.nama_mesin}</p>
                    </td>

                    <td className="px-2 py-3">
                      <p className="text-xs font-light"></p>
                    </td>

                    <td className="px-2 py-3">
                      <div className="flex items-center">
                        <div className="w-4 flex justify-center items-center">
                          <img src={X} alt="" />
                        </div>
                        <p className="text-xs px-1 font-light rounded-xl flex justify-center items-center">
                          {getSourceData(data, 'hasil')}
                        </p>
                      </div>
                    </td>

                    <td className="px-2 py-3">
                      <p className={getStatusStyle(data.status_tiket)}>
                        {data.status_tiket}
                      </p>
                    </td>

                    <td className="px-2 py-3">
                      <p className={getStatusStyle(data.status_tiket)}>
                        {data.skor_mtc}%
                      </p>
                    </td>

                    <td className="px-2 py-3">
                      <p className="text-xs font-light">
                        {getInspectorName(data)}
                      </p>
                    </td>

                    <td className="px-2 py-3">
                      <div className="flex gap-2 items-center relative">
                        <div>
                          <button
                            title="button"
                            className="text-xs font-bold bg-blue-700 py-2 text-white rounded-md"
                            onClick={() => handleClick(i)}
                          >
                            <img src={Burger} alt="" className="mx-3" />
                          </button>

                          {showTwoButtons[i] && (
                            <div className="absolute bg-white p-3 shadow-5 rounded-md z-10 top-full left-0 mt-1">
                              <div className="flex flex-col gap-1">
                                {data.status_tiket !== 'monitoring' && (
                                  <button
                                    onClick={() => {
                                      if (!data.waktu_mulai_mtc) {
                                        responProcessingMTC(data.id);
                                      } else if (
                                        data.status_tiket === 'open' ||
                                        data.status_tiket === 'pending'
                                      ) {
                                        openModal1(i);
                                      } else {
                                        reworkTiket(data.id);
                                      }
                                    }}
                                    className="w-25 text-xs font-bold bg-blue-700 py-2 text-white rounded-md"
                                  >
                                    PROSES
                                  </button>
                                )}

                                <button
                                  onClick={openModal2}
                                  className="w-25 text-xs font-bold bg-blue-700 py-2 text-white rounded-md"
                                >
                                  JADWALKAN
                                </button>
                              </div>

                              {showModal1[i] && (
                                <ModalStockCheckOs3
                                  children={undefined}
                                  isOpen={showModal1[i]}
                                  onClose={() => closeModal1(i)}
                                  onFinish={getProcessingTickets}
                                  kendala="data.nama_kendala"
                                  kodeLkh="data.kode_lkh"
                                  machineName={data.nama_mesin}
                                  tgl={data.waktu_respon}
                                  jam="19.09"
                                  namaPemeriksa={
                                    data.proses_mtc_os3s?.[lengthProses]
                                      ?.user_eksekutor.nama
                                  }
                                  no="109299"
                                  idTiket={data.id}
                                  idProses={
                                    data.proses_mtc_os3s?.[lengthProses]?.id
                                  }
                                  namaMesin={data.nama_mesin}
                                />
                              )}

                              {showModal2 && (
                                <ModalMtcDate
                                  isOpen={showModal2}
                                  onClose={closeModal2}
                                  machineName="GMC Printer 2"
                                >
                                  <p></p>
                                </ModalMtcDate>
                              )}
                            </div>
                          )}
                        </div>

                        <div>
                          <button
                            title="button"
                            onClick={() => handleClickProcessingDetail(i)}
                            className="text-xs font-bold text-blue-700 bg-blue-700 py-2 border-blue-700 border rounded-md"
                          >
                            <img src={Arrow} alt="" className="mx-3" />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>

                  {data.proses_mtc_os3s?.length > 0 &&
                    showProcessingDetail[i] && (
                      <tr>
                        <td colSpan={10} className="px-0 py-0">
                          <div className="w-full flex flex-col bg-[#E9F3FF] rounded-lg">
                            <div className="flex px-5 py-2">
                              <div className="flex flex-col gap-2 w-2/12">
                                <p className="text-xs font-bold">
                                  Waktu Temuan
                                </p>
                              </div>
                              <div className="grid grid-cols-6 gap-3 w-10/12">
                                {[
                                  'Pengerjaan Ke',
                                  'Waktu',
                                  'Eksekutor',
                                  'Progress Perbaikan',
                                  'Jenis Perbaikan',
                                  '',
                                ].map((header) => (
                                  <div
                                    key={header}
                                    className="flex flex-col gap-2"
                                  >
                                    <p className="text-xs font-bold">
                                      {header}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="flex px-5 pb-4">
                              <div className="flex flex-col gap-2 w-2/12">
                                <div>
                                  <p className="text-xs font-medium">
                                    {dateMtc}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs font-bold">
                                    Waktu Respon
                                  </p>
                                  <p className="text-xs font-medium">
                                    {waktuRespon}
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-6 gap-3 w-10/12">
                                {data.proses_mtc_os3s?.map(
                                  (proses: any, ii: number) => {
                                    const tglMulaiMtc = convertDatetimeToDate(
                                      proses.waktu_mulai_mtc,
                                    );

                                    return (
                                      <div key={ii} className="contents">
                                        <div className="flex flex-col gap-2">
                                          <h5 className="text-xs font-medium">
                                            {ii + 1}
                                          </h5>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                          <p className="text-xs font-medium">
                                            {tglMulaiMtc}
                                          </p>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                          <p className="text-xs font-medium">
                                            {proses.user_eksekutor?.nama || '-'}
                                          </p>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                          <div className="flex">
                                            <p
                                              className={getProgressStyle(
                                                proses.skor_mtc,
                                              )}
                                            >
                                              {proses.skor_mtc}%
                                            </p>
                                          </div>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                          <p className="text-xs font-medium">
                                            {proses.cara_perbaikan}
                                          </p>
                                        </div>

                                        <div>
                                          <button
                                            onClick={() => openModalDetail(ii)}
                                            className="text-xs font-bold bg-blue-700 py-1 px-5 text-white rounded-md"
                                          >
                                            Detail
                                          </button>
                                        </div>

                                        {showModalDetail[ii] && (
                                          <ModalDetailOS3
                                            children={undefined}
                                            isOpen={showModalDetail[ii]}
                                            onClose={() => closeModalDetail(ii)}
                                            kendala={getSourceData(
                                              data,
                                              'inspection_point',
                                            )}
                                            machineName={data.nama_mesin}
                                            tgl={dateMtc}
                                            namaPemeriksa={
                                              proses.user_eksekutor?.nama || '-'
                                            }
                                            no="1"
                                            idTiket={data.id}
                                            kodeLkh={data.kode_lkh}
                                            analisisPenyebab={`${proses.kode_analisis_mtc} - ${proses.nama_analisis_mtc}`}
                                            kebutuhanSparepart="undefined"
                                            tipeMaintenance={
                                              proses.cara_perbaikan
                                            }
                                            catatan={getSourceData(
                                              data,
                                              'catatan',
                                            )}
                                            inspection_point={getSourceData(
                                              data,
                                              'inspection_point',
                                            )}
                                            acceptance_criteria={getSourceData(
                                              data,
                                              'acceptance_criteria',
                                            )}
                                            inspection_method={getSourceData(
                                              data,
                                              'method',
                                            )}
                                            tools={getSourceData(data, 'tools')}
                                            sumber={data.sumber}
                                            indikator={getSourceData(
                                              data,
                                              'hasil',
                                            )}
                                            task_list={getSourceData(
                                              data,
                                              'task',
                                            )}
                                          />
                                        )}
                                      </div>
                                    );
                                  },
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );

  useEffect(() => {
    getIncomingTickets();
  }, [incomingPage]);

  useEffect(() => {
    getProcessingTickets();
  }, [processingPage]);

  return (
    <div className="container mx-auto px-4">
      {/* Incoming Tickets Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Incoming Tickets (OS2)</h2>
        {renderIncomingTable()}

        {incomingTickets && (
          <div className="flex justify-center mt-4">
            <Stack spacing={2}>
              <Pagination
                count={Math.ceil(incomingTickets.totalData / 10)}
                page={incomingPage}
                onChange={(event, value) => setIncomingPage(value)}
                color="primary"
              />
            </Stack>
          </div>
        )}
      </div>

      {/* Processing Tickets Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Incoming Tickets (OS3)</h2>
        {renderProcessingTable()}
      </div>
    </div>
  );
};

export default OS3MaintenanceTables;
