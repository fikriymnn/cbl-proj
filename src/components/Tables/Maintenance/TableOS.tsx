import { useEffect, useRef, useState } from 'react';
import Filter from '../../../images/icon/filter.svg';
import Burger from '../../../images/icon/burger.svg';
import Arrow from '../../../images/icon/arrowDown.svg';

import ModalStockCheck1 from '../../Modals/ModalStockCheck1';
import Polygon6 from '../../../images/icon/Polygon6.svg';
import X from '../../../images/icon/x.svg';
import axios from 'axios';
import ModalDetail from '../../Modals/ModalDetail';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import ModalMtcLightHeavy from '../../Modals/ModalMtcLightHeavy';
import ModalSPBService from '../../Modals/ModalNewSPBService';
import Loading from '../../Loading';
import convertTimeStampToDateTime from '../../../utils/converDateTime';

// import moment from 'moment';

function TableOS() {
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState();
  const [openButton, setOpenButton] = useState(null);
  const [page, setPage] = useState(1);

  const handleClick = (i: any) => {
    setOpenButton((prevState: any) => {
      return prevState === i ? null : i;
    });
  };

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

  const openModal2 = () => setShowModal2(true);
  const closeModal2 = () => setShowModal2(false);

  const openModal4 = () => setShowModal4(true);
  const closeModal4 = () => setShowModal4(false);
  const openModal5 = () => setShowModal5(true);
  const closeModal5 = () => setShowModal5(false);

  const handleClickDetail = (index: number) => {
    setShowDetail((prevState) => {
      const updatedShowDetail = [...prevState]; // Create a copy
      updatedShowDetail[index] = !updatedShowDetail[index]; // Toggle value
      return updatedShowDetail;
    });
  };
  const handleClickDetailMobile = (index: number) => {
    setShowDetailMobile((prevState) => {
      const updatedShowDetailMobile = [...prevState]; // Create a copy
      updatedShowDetailMobile[index] = !updatedShowDetailMobile[index]; // Toggle value
      return updatedShowDetailMobile;
    });
  };
  const [tiket, setTiket] = useState<any>(null);

  const [showTwoButtons, setShowTwoButtons] = useState<any>([]);
  const [showModal1, setShowModal1] = useState<any>([]);
  const [user, setUser] = useState<any>(null);
  const [filter, setFilter] = useState(false);
  // const onchangeVal: any = [...showTwoButtons];
  // setShowTwoButtons(showTwoButtons.map((item: any) => item = false))
  //onchangeVal[i] = !onchangeVal[i];

  // setShowTwoButtons(onchangeVal);

  const openModal1 = (i: any) => {
    const onchangeVal: any = [...showModal1];
    onchangeVal[i] = true;

    setShowModal1(onchangeVal);
  };
  const closeModal1 = (i: any) => {
    const onchangeVal: any = [...showModal1];
    onchangeVal[i] = false;

    setShowModal1(onchangeVal);
  };

  useEffect(() => {
    getTiket();
    getUser();
  }, [page]);

  async function getUser() {
    try {
      setIsLoading(true)
      const res = await axios.get(`${import.meta.env.VITE_API_LINK}/me`, {
        withCredentials: true,
      });
      // if (res.data.success == false) {
      //   navigate("/auth/login");
      // }
      setIsLoading(false)
      setUser(res.data);
      console.log(res.data);
    } catch (error: any) {
      setIsLoading(false)
      console.log(error.response);
    }
  }
  const [showModalDetail, setShowModalDetail] = useState<any>([]);

  const openModalDetail = (i: any) => {
    const onchangeVal: any = [...showModalDetail];
    onchangeVal[i] = true;
    console.log(onchangeVal);
    setShowModalDetail(onchangeVal);
  };
  const closeModalDetail = (i: any) => {
    const onchangeVal: any = [...showModalDetail];
    onchangeVal[i] = false;

    setShowModalDetail(onchangeVal);
  };
  const [masterMesin, setmasterMesin] = useState<any>();
  useEffect(() => {

    getMasterMesin();
  }, []);

  async function getMasterMesin() {
    const url = `${import.meta.env.VITE_API_LINK}/master/mesin`;
    try {
      setIsLoading(true)
      const res = await axios.get(url, {
        withCredentials: true,
      });
      setIsLoading(false)
      setmasterMesin(res.data);

    } catch (error: any) {
      setIsLoading(false)
      console.log(error.data.msg);
    }
  }
  const [startDate, setStartDate] = useState<any>();
  const [endDate, setEndDate] = useState<any>();
  const [mesinNama, setMesinNama] = useState<any>();
  const [statusTiket, setStatusTiket] = useState<any>();
  const [noJo, setNoJo] = useState<any>();

  async function getTiket(isRework?: boolean, idModal?: number) {
    const url = `${import.meta.env.VITE_API_LINK}/ticket`;
    try {
      setIsLoading(true)
      const res = await axios.get(url, {
        params: {
          no_jo: noJo,
          bagian_tiket: 'os2',
          page: page,
          limit: 10,
          start_date: startDate,
          end_date: endDate,
          mesin: mesinNama,
          status_tiket: statusTiket
        },
        withCredentials: true,
      });
      setIsLoading(false)
      setTiket(res.data);
      console.log(res.data);

      let data: any[] = [];
      for (let i = 0; i < res.data.data.length; i++) {
        data.push(false);
      }
      setShowModal1(data);
      setShowModalDetail(data);
      setShowTwoButtons(data);
      setShowTwoButtonsMobile(data);

      if (isRework == true) {
        openModal1(idModal);
      }
    } catch (error: any) {
      setIsLoading(false)
      console.log(error.response);
    }
  }

  async function reworkTiket(idTiket: number, iModal: number) {
    const url = `${import.meta.env.VITE_API_LINK}/ticket/rework/${idTiket}`;

    try {
      setIsLoading(true)
      const res = await axios.put(
        url,
        {
          id_eksekutor: user.id,
        },
        {
          withCredentials: true,
        },
      );
      setIsLoading(false)
      alert(res.data.msg);
      getTiket(true, iModal);
      openModal1(iModal);
    } catch (error: any) {
      console.log(error);
      setIsLoading(false)
      alert(error.respone.data.msg);
    }
  }

  function calculateResponTime(startDate: any, endDate: any) {
    const createdAtDate = new Date(startDate);
    const waktuResponDate = new Date(endDate);
    const millisecondsDiff =
      waktuResponDate.getTime() - createdAtDate.getTime();

    const secondsDiff = millisecondsDiff / 1000;
    const minutesDiff = Math.floor(secondsDiff / 60);
    const hoursDiff = Math.floor(minutesDiff / 60);

    const formattedDifference = `${hoursDiff ? hoursDiff + ' hours ' : ''}${hoursDiff >= 1 ? '' : minutesDiff + ' minutes '
      } `;

    return formattedDifference; // Example format (YYYY-MM-DD)
  }
  function calculateResponTime2(startDate: any, endDate: any) {
    const createdAtDate = new Date(startDate);
    const waktuResponDate = new Date(endDate);
    const millisecondsDiff = waktuResponDate.getTime() - createdAtDate.getTime();

    const secondsDiff = Math.floor(millisecondsDiff / 1000); // Total seconds difference
    return secondsDiff;
  }

  function formatMinutesToHoursMinutesSeconds(totalSeconds: number) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours ? hours + ' hours ' : ''}${minutes ? minutes + ' minutes ' : ''}${seconds ? seconds + ' seconds' : ''}`.trim();
  }

  const [showTwoButtonsMobile, setShowTwoButtonsMobile] = useState<boolean[]>(
    new Array(tiket != null && tiket.length).fill(false),
  );
  const [showDetail, setShowDetail] = useState<boolean[]>(
    new Array(tiket != null && tiket.length).fill(false),
  );
  const [showDetailMobile, setShowDetailMobile] = useState<boolean[]>(
    new Array(tiket != null && tiket.length).fill(false),
  );

  const [showModal2, setShowModal2] = useState(false);
  const [showModal4, setShowModal4] = useState(false);
  const [showModal5, setShowModal5] = useState(false);

  return (
    <main>
      <div className="flex  gap-1 items-center bg-white ">
        {isLoading && <Loading />}
        <div>

          {filter == true ? (
            <div className="absolute rounded-md bg-white shadow-2xl md:w-96 w-11/12 p-2 -translate-x-2 md:-translate-y-6 -translate-y-32 border border-gray">

            </div>
          ) : (
            ''
          )}
        </div>
        <div className="grid md:grid-cols-12 grid-cols-6 px-4 py-1 gap-3">

          <div className="flex flex-col gap-2 col-span-2">
            <p className="text-sm text-primary font-semibold">
              Dari:
            </p>
            <input
              className='rounded-full bg-[#D8EAFF] px-2 h-8'
              type="date"
              onChange={(e) => setStartDate(e.target.value)}
            ></input>

          </div>
          <div className="flex flex-col gap-2 col-span-2">
            <p className=" my-auto text-sm text-primary font-semibold ">
              Sampai:
            </p>

            <input
              className='rounded-full bg-[#D8EAFF] px-2 h-8'
              type="date"
              onChange={(e) => setEndDate(e.target.value)}
            ></input>

          </div>
          <div className="flex flex-col  gap-2 col-span-2">
            <p className=" my-auto text-sm text-primary font-semibold ">
              Pilih Mesin:
            </p>

            <select
              onChange={(e) => {
                setMesinNama(
                  e.target.value,
                );

              }}
              className={` z-20 w-full rounded-md bg-blue-200 items-center h-8`}
            >
              <option
                selected
                disabled>
                Pilih Mesin
              </option>
              {masterMesin?.map(
                (data: any, i: number) => {
                  return (
                    <option
                      value={data.nama_mesin}
                      className="text-gray-800 text-sm font-light dark:text-bodydark"
                    >
                      {data.nama_mesin}
                    </option>
                  );
                },
              )}
            </select>
          </div>
          <div className="flex flex-col  gap-2 col-span-2">
            <p className=" my-auto text-sm text-primary font-semibold ">
              Pilih Status Tiket:
            </p>
            <select
              onChange={(e) => {
                setStatusTiket(
                  e.target.value,
                );

              }}
              className={` z-20 w-full rounded-md bg-blue-200 items-center h-8`}
            >
              <option
                selected
                disabled>
                Pilih Status Tiket
              </option>

              <option
                value={'open'}
                className="text-gray-800 text-sm font-light dark:text-bodydark"
              >
                open
              </option>
              <option
                value={'request to qc'}
                className="text-gray-800 text-sm font-light dark:text-bodydark"
              >
                request to qc
              </option>
              <option
                value={'temporary'}
                className="text-gray-800 text-sm font-light dark:text-bodydark"
              >
                temporary
              </option>
              <option
                value={'monitoring'}
                className="text-gray-800 text-sm font-light dark:text-bodydark"
              >
                monitoring
              </option>
            </select>
          </div>
          <div className=" gap-2 flex flex-col col-span-2">
            <p className=" my-auto text-sm text-primary font-semibold ">
              No.Jo
            </p>
            <input
              className='rounded-md h-8 bg-[#D8EAFF] px-2 w-full'
              placeholder='Nomor JO'
              type="text"
              onChange={(e) => setNoJo(e.target.value)}
            ></input>

          </div>
          <div className="flex ">
            <button
              onClick={() => {
                getTiket()
              }}
              className="bg-primary text-white px-5 py-2 rounded-md my-auto "
            >
              Tampilkan
            </button>

          </div>

        </div>

        {/* <input
          type="search"
          placeholder="search"
          name=""
          id=""
          className="md:w-96 w-40 py-1 mx-3 px-3 bg-[#E9F3FF]"
        /> */}
      </div>

      {!isMobile && (
        <>
          <div className="flex bg-white mt-2 py-2">
            <p className="w-10 px-3 text-xs font-bold ">No</p>
            <div className="grid grid-cols-12 w-full gap-2">
              <div className="flex gap-2  col-span-2">
                <p className="text-xs font-bold ">Waktu Tiket</p>
                <img className="w-2" src={Polygon6} alt="" />
              </div>
              <div className="flex gap-2 ">
                <p className="text-xs font-bold ">No.Jo</p>
                <img className="w-2" src={Polygon6} alt="" />
              </div>
              <div className="flex gap-2 ">
                <p className="text-xs font-bold ">Mesin</p>
                <img className="w-2" src={Polygon6} alt="" />
              </div>
              <div className="flex gap-2 col-span-3">
                <p className="text-xs font-bold ">Jenis Kendala</p>
                <img className="w-2" src={Polygon6} alt="" />
              </div>
              <div className="flex gap-2">
                <p className="text-xs font-bold ">Status</p>
                <img className="w-2" src={Polygon6} alt="" />
              </div>
              <div className="flex gap-2">
                <p className="text-xs font-bold ">Percent</p>
                <img className="w-2" src={Polygon6} alt="" />
              </div>
              <div className="flex gap-2  col-span-2">
                <p className="text-xs font-bold ">Breakdown Time</p>
                <img className="w-2" src={Polygon6} alt="" />
              </div>
              <div className="flex gap-2 ">
                <p className="text-xs font-bold ">Action</p>
              </div>
            </div>
          </div>
          <div className=" overflow-x-auto">
            <div className="min-w-[700px]">
              {tiket != null &&
                tiket.data.map((data: any, i: any) => {
                  const lengthProses = data.proses_mtcs.length - 1;

                  function convertDatetimeToDate(datetime: any) {
                    const dateObject = new Date(datetime);
                    const day = dateObject
                      .getDate()
                      .toString()
                      .padStart(2, '0'); // Ensure two-digit day
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

                  const dateMtc = convertDatetimeToDate(data.createdAt);
                  const waktuRespon = calculateResponTime(
                    data.waktu_respon_qc == null
                      ? data.createdAt
                      : data.waktu_respon_qc,
                    data.waktu_respon,
                  );
                  // const waktuBreakdown = calculateResponTime(
                  //   data.createdAt,
                  //   data.waktu_selesai,
                  // );
                  // const waktuBreakdownMTC = calculateResponTime(
                  //   data.waktu_respon_qc,
                  //   data.waktu_selesai_mtc,
                  // );
                  // const qcRespon = calculateResponTime(
                  //   data.createdAt,
                  //   data.waktu_respon_qc,
                  // )
                  // const qcVerif = calculateResponTime(
                  //   data.waktu_selesai_mtc,
                  //   data.waktu_selesai,
                  // )
                  // const waktuBreakdownQC =
                  //   parseInt(qcRespon) + parseInt(qcVerif)
                  //   ;
                  const waktuBreakdownMinutes = calculateResponTime2(
                    data.createdAt,
                    data.waktu_selesai,
                  );
                  const waktuBreakdownMTCMinutes = calculateResponTime2(
                    data.waktu_respon_qc,
                    data.waktu_selesai_mtc,
                  );
                  const waktuValidasiQCMinutes = calculateResponTime2(
                    data.createdAt,
                    data.waktu_respon_qc,
                  );
                  const waktuValidasiQC = formatMinutesToHoursMinutesSeconds(waktuValidasiQCMinutes);
                  const waktuBreakdown = formatMinutesToHoursMinutesSeconds(waktuBreakdownMinutes);
                  const waktuBreakdownMTC = formatMinutesToHoursMinutesSeconds(waktuBreakdownMTCMinutes);

                  const qcRespon = calculateResponTime2(
                    data.createdAt,
                    data.waktu_respon_qc,
                  );
                  const qcVerif = calculateResponTime2(
                    data.waktu_selesai_mtc,
                    data.waktu_selesai,
                  );
                  const waktuVerifikasiQCMinutes = calculateResponTime2(
                    data.waktu_selesai_mtc,
                    data.waktu_selesai,
                  );
                  const waktuVerifikasiQC = formatMinutesToHoursMinutesSeconds(waktuVerifikasiQCMinutes);
                  // Combine qcRespon and qcVerif and format them
                  const waktuBreakdownQCMinutes: any = qcRespon + qcVerif;
                  const waktuBreakdownQC = formatMinutesToHoursMinutesSeconds(waktuBreakdownQCMinutes);

                  let indexNama = data.proces_mtcs?.length - 1;
                  return (
                    <>
                      <div className="my-2">
                        <section className="flex  bg-white  rounded-lg">
                          <div
                            key={i}
                            className=" py-3 w-10 px-3 flex justify-center items-center"
                          >
                            {i + 1 + (page - 1) * 10}
                          </div>
                          <div className="grid grid-cols-12 w-full gap-2 px-3">
                            <div className="flex flex-col md:gap-5 gap-1 w-full col-span-2">
                              <div className="my-auto  ">
                                <p className="text-xs font-light break-all">
                                  {dateMtc}

                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col md:gap-5 gap-1 ">
                              <div className="my-auto">
                                <p className="text-xs font-light">
                                  {data.no_jo}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col md:gap-5 gap-1 ">
                              <div className="my-auto">
                                <p className="text-xs font-light">
                                  {data.mesin}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col md:gap-5 gap-1 col-span-3">
                              <div className="my-auto w-full">
                                <p className="text-xs font-light">
                                  {data.kode_lkh} - {data.nama_kendala}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center md:gap-5 gap-1 ">
                              <div className="flex ">
                                <p
                                  className={
                                    data.status_tiket == 'pending'
                                      ? `text-xs px-2  font-light  rounded-xl flex justify-center text-[#DE0000] bg-[#FFB1B1] `
                                      : data.status_tiket == 'open'
                                        ? `text-xs px-2  font-light  rounded-xl flex justify-center text-[#DE0000] bg-[#FFB1B1] `
                                        : data.status_tiket == 'monitoring'
                                          ? `text-xs px-2  font-light  rounded-xl flex justify-center text-[#004CDE] bg-[#B1ECFF] `
                                          : data.status_tiket == 'temporary'
                                            ? `text-xs px-2  font-light  rounded-xl flex justify-center text-[#FCBF11] bg-[#FFF2B1]  `
                                            : data.status_tiket == 'request to qc'
                                              ? `text-xs px-2  font-light  rounded-xl flex justify-center text-[#FCBF11] bg-[#FFF2B1]  `
                                              : data.status_tiket == 'qc rejected'
                                                ? `text-xs px-2  font-light  rounded-xl flex justify-center text-[#DE0000] bg-[#FFB1B1] ` : ''
                                  }
                                >
                                  {data.status_tiket}{' '}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center md:gap-5 gap-1  p-2">
                              <div className="flex ">
                                <p
                                  className={
                                    data.skor_mtc == 0
                                      ? `text-xs px-2  font-light  rounded-xl flex justify-center text-[#DE0000] bg-[#FFB1B1] `
                                      : data.skor_mtc == 20
                                        ? `text-xs px-2  font-light  rounded-xl flex justify-center text-[#DE0000] bg-[#FFB1B1] `
                                        : data.skor_mtc == 40
                                          ? `text-xs px-2  font-light  rounded-xl flex justify-center text-[#DE0000] bg-[#FFB1B1] `
                                          : data.skor_mtc == 50
                                            ? `text-xs px-2  font-light  rounded-xl flex justify-center text-[#FCBF11] bg-[#fff2b1bd] `
                                            : data.skor_mtc >= 60
                                              ? `text-xs px-2  font-light  rounded-xl flex justify-center text-[#004CDE] bg-[#B1ECFF] `
                                              : ''
                                  }
                                >
                                  {data.skor_mtc}%
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col md:gap-5 gap-1 col-span-2">
                              <div>
                                <p className="text-xs font-light">
                                  {data.waktu_selesai == null ? '-' : waktuBreakdown}
                                  {/* {data.proses_mtcs[lengthProses].tgl_mtc}  */}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2 items-center md:mb-0 mb-2 ">
                              <div>
                                <div>
                                  {data.status_tiket == 'monitoring' ||
                                    data.status_tiket == 'request to qc' ? (
                                    <button
                                      title="button"
                                      className="text-xs font-bold bg-blue-200 py-2 text-white rounded-md opacity-0"
                                    >
                                      <img
                                        src={Burger}
                                        alt=""
                                        className="mx-3"
                                      />
                                    </button>
                                  ) : (
                                    <button
                                      title="button"
                                      className="text-xs font-bold bg-blue-700 py-2 text-white rounded-md"
                                      onClick={() => handleClick(i)}
                                    >
                                      <img
                                        src={Burger}
                                        alt=""
                                        className="mx-3"
                                      />
                                    </button>
                                  )}
                                  {openButton == i ? (
                                    <div className="absolute bg-white p-3 shadow-5 rounded-md">
                                      {' '}
                                      {/* Wrap buttons for styling */}
                                      <div className="flex flex-col gap-1">
                                        {data.status_tiket == 'monitoring' ? (
                                          <></>
                                        ) : (
                                          <button
                                            onClick={() => {
                                              if (data.status_tiket == 'open') {
                                                openModal1(i);
                                              } else if (
                                                data.status_tiket ==
                                                'temporary' &&
                                                data.proses_mtcs[lengthProses]
                                                  .cara_perbaikan == null
                                              ) {
                                                openModal1(i);

                                                // ini untuk fungsi rework
                                              } else {
                                                reworkTiket(data.id, i);
                                              }
                                            }}
                                            className=" w-25 text-xs font-bold bg-blue-700 py-2 text-white rounded-md"
                                          >
                                            PROSES
                                          </button>
                                        )}
                                        <button
                                          onClick={openModal2}
                                          className="w-25 text-xs font-bold bg-blue-700 py-2 text-white rounded-md"
                                        >
                                          JADWALKAN{' '}
                                        </button>
                                      </div>
                                      {showModal1[i] == true && (
                                        <ModalStockCheck1
                                          children={undefined}
                                          isOpen={showModal1[i]}
                                          onClose={() => closeModal1(i)}
                                          onFinish={() => getTiket()}
                                          kendala={data.nama_kendala}
                                          kodeLkh={data.kode_lkh}
                                          machineName={data.mesin}
                                          tgl={data.waktu_respon}
                                          jam={'19.09'}
                                          namaPemeriksa={data.proses_mtcs[lengthProses]
                                            .user_eksekutor.nama}
                                          no={'109299'}
                                          idTiket={data.id}
                                          idProses={data.proses_mtcs[lengthProses].id}
                                          namaMesin={data.mesin}
                                          skor_mtc={data.proses_mtcs[lengthProses]
                                            .skor_mtc}
                                          jenis_perbaikan={data.proses_mtcs[lengthProses]
                                            .cara_perbaikan} unit={data.proses_mtcs[lengthProses].unit} bagian={data.proses_mtcs[lengthProses].bagian_mesin} />
                                        // <ModalStockCheckPengganti children={undefined} isOpen={showModal1[i]} onClose={() => closeModal1(i)} kendala={"nu"} onFinish={"nu"} machineName={"nu"} tgl={"nu"} jam={"nu"} namaPemeriksa={"nu"} no={"nu"}>

                                        // </ModalStockCheckPengganti>
                                      )}
                                      {showModal2 && (
                                        <ModalMtcLightHeavy
                                          isOpen={showModal2}
                                          onClose={closeModal2}
                                          title={undefined}
                                        >
                                          <div className="pt-5">
                                            <button
                                              onClick={openModal4}
                                              className="w-full h-12 text-center text-white text-xs font-bold bg-blue-700 rounded-md"
                                            >
                                              PERBAIKAN INTERNAL
                                            </button>
                                          </div>
                                          <div className="pt-2">
                                            <button
                                              onClick={openModal5}
                                              className="w-full h-12 text-center text-white text-xs font-bold bg-blue-700 rounded-md"
                                            >
                                              SERVICE
                                            </button>
                                          </div>
                                        </ModalMtcLightHeavy>
                                      )}
                                      {showModal5 && (
                                        <ModalSPBService
                                          isOpen={showModal5}
                                          onClose={closeModal5}
                                          onFinish={getTiket}
                                          idProses={
                                            data.proses_mtcs[lengthProses].id
                                          }
                                          sumber={'Os2'}
                                          noSPB={'MT-0001'}
                                          tglSpb={'20 MEI 2024'}
                                          data={undefined}
                                        >
                                          <p></p>
                                        </ModalSPBService>
                                      )}
                                    </div>
                                  ) : (
                                    ''
                                  )}
                                </div>
                              </div>
                              <div>
                                <button
                                  title="button"
                                  onClick={() => handleClickDetail(i)}
                                  className="text-xs font-bold text-blue-700 bg-blue-700 py-2 border-blue-700 border rounded-md"
                                >
                                  <img src={Arrow} alt="" className="mx-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </section>

                        {showDetail[i] && (
                          <>
                            <div className="w-full flex flex-col bg-[#E9F3FF]  rounded-lg">
                              <div className="flex px-5 py-2">
                                <div className="flex flex-col gap-2 w-2/12">
                                  <p className="text-xs font-bold">
                                    Kode Tiket
                                  </p>
                                </div>
                                <div className="grid grid-cols-6 gap-3 w-10/12">
                                  <div className="flex flex-col gap-2">
                                    <h5 className="text-xs font-bold">
                                      Pengerjaan Ke
                                    </h5>
                                  </div>
                                  <div className="flex flex-col gap-2">
                                    <p className="text-xs font-bold">Waktu</p>
                                  </div>
                                  <div className="flex flex-col gap-2">
                                    <p className="text-xs font-bold">
                                      Eksekutor
                                    </p>
                                  </div>

                                  <div className="flex flex-col gap-2">
                                    <p className="text-xs font-bold">
                                      Progress Perbaikan
                                    </p>
                                  </div>
                                  <div className="flex flex-col gap-2">
                                    <p className="text-xs font-bold">
                                      Jenis Perbaikan
                                    </p>
                                  </div>
                                  <div className=""></div>
                                </div>
                              </div>
                              <div className="flex px-5 ">
                                <div className="flex flex-col gap-2 w-2/12">
                                  <div>
                                    <p className="text-xs font-medium">
                                      {data.kode_ticket}
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
                                  <div>
                                    <p className="text-xs font-bold">Pelapor</p>
                                    <p className="text-xs font-medium">
                                      {data.operator}
                                    </p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-6 gap-3 w-10/12">
                                  {data.proses_mtcs.map(
                                    (proses: any, ii: any) => {
                                      const tglMulaiMtc = convertDatetimeToDate(
                                        proses.waktu_mulai_mtc,
                                      );
                                      function convertJam(datetime: any) {
                                        const dateObject = new Date(datetime);
                                        const hours = dateObject
                                          .getHours()
                                          .toString()
                                          .padStart(2, '0');
                                        const minutes = dateObject
                                          .getMinutes()
                                          .toString()
                                          .padStart(2, '0');
                                        return `${hours}:${minutes}`; // Example format (YYYY-MM-DD)
                                      }
                                      function convertTgl(datetime: any) {
                                        const dateObject = new Date(datetime);
                                        const day = dateObject
                                          .getDate()
                                          .toString()
                                          .padStart(2, '0'); // Ensure two-digit day
                                        const month = (
                                          dateObject.getMonth() + 1
                                        )
                                          .toString()
                                          .padStart(2, '0'); // Adjust for zero-based month
                                        const year = dateObject.getFullYear();

                                        return `${year}/${month}/${day}`; // Example format (YYYY-MM-DD)
                                      }

                                      const waktuMtc = convertTgl(
                                        proses.waktu_mulai_mtc,
                                      );
                                      const jamMtc = convertJam(
                                        proses.waktu_mulai_mtc,
                                      );
                                      return (
                                        <>
                                          <div className="flex flex-col gap-2">
                                            <h5 className="text-xs font-medium pl-5">
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
                                              {proses.user_eksekutor.nama}
                                            </p>
                                          </div>

                                          <div className="flex flex-col gap-2">
                                            <div className="flex ">
                                              <p
                                                className={
                                                  proses.skor_mtc <= 100 &&
                                                    proses.skor_mtc >= 60
                                                    ? `text-xs px-2  font-light  rounded-xl flex justify-center text-[#0057FF] bg-[#B1ECFF] `
                                                    : proses.skor_mtc > 20 &&
                                                      proses.skor_mtc <= 59
                                                      ? `text-xs px-2  font-light  rounded-xl flex justify-center  text-[#FCBF11] bg-[#FFF2B1] `
                                                      : proses.skor_mtc <= 20
                                                        ? `text-xs px-2  font-light  rounded-xl flex justify-center text-[#DE0000] bg-[#FFB1B1]`
                                                        : ''
                                                }
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
                                          <div className="">
                                            <button
                                              onClick={() =>
                                                openModalDetail(ii)
                                              }
                                              className="text-xs font-bold bg-blue-700 py-1 px-5 text-white rounded-md"
                                            >
                                              Detail
                                            </button>
                                          </div>
                                          {showModalDetail[ii] && (
                                            <ModalDetail
                                              children={undefined}
                                              isOpen={showModalDetail[ii]}
                                              onClose={() =>
                                                closeModalDetail(ii)
                                              }
                                              kendala={data.nama_kendala}
                                              machineName={data.mesin}
                                              tgl={waktuMtc}
                                              jam={jamMtc}
                                              namaPemeriksa={
                                                proses.user_eksekutor.nama
                                              }
                                              no={'1'}
                                              idTiket={data.id}
                                              kodeLkh={data.kode_lkh}
                                              analisisPenyebab={
                                                `${proses.kode_analisis_mtc}` +
                                                ' - ' +
                                                `${proses.nama_analisis_mtc}`
                                              }
                                              kebutuhanSparepart={'-'}
                                              tipeMaintenance={
                                                proses.cara_perbaikan
                                              }

                                              catatan={proses.note_mtc} unit={proses.unit} bagian={proses.bagian_mesin}
                                            ></ModalDetail>
                                          )}
                                        </>
                                      );
                                    },
                                  )}
                                </div>
                              </div>
                              {data.waktu_selesai == null ? '' :
                                <>

                                  < div className='px-5 pt-1'>
                                    <p className="text-xs font-bold">Waktu Breakdown</p>
                                    <p className="text-xs font-medium">
                                      {waktuBreakdown}
                                    </p>
                                  </div>
                                  < div className='px-5 pt-1'>
                                    <p className="text-xs font-bold">Waktu Validasi QC</p>
                                    <p className="text-xs font-medium">
                                      {data.user_respon_qc?.nama} ~ {convertTimeStampToDateTime(data.waktu_respon_qc)} ~ {waktuValidasiQC}
                                    </p>
                                  </div>
                                  <div className='px-5 pt-1'>
                                    <p className="text-xs font-bold">Waktu Breakdown MTC</p>
                                    <p className="text-xs font-medium">
                                      {waktuBreakdownMTC}
                                    </p>
                                  </div>
                                  <div className='px-5 pt-1'>
                                    <p className="text-xs font-bold">Waktu Verifikasi QC</p>
                                    <p className="text-xs font-medium">
                                      {data.proses_mtcs?.at(-1)?.user_qc?.nama} ~ {convertTimeStampToDateTime(data.proses_mtcs?.at(-1)?.waktu_selesai)} ~ {waktuVerifikasiQC}
                                    </p>
                                  </div>
                                </>
                              }
                            </div>
                          </>
                        )}
                      </div >
                    </>
                  );
                })}
            </div>
          </div>
          <div className="w-full flex justify-end">
            <Stack spacing={2}>
              <Pagination
                count={tiket?.total_page}
                color="primary"
                onChange={(e, i) => {
                  setPage(i);
                  console.log(i);
                }}
              />
            </Stack>
          </div>
        </>
      )
      }

      {/* =============================================================INI KOMPONEN UNTUK MOBILE========================================== */}
      {
        isMobile && (
          <>
            <main className="overflow-x-scroll">
              <div className="bg-white mt-2 px-1 grid grid-cols-4 gap-3 py-2">
                <div className="flex gap-[1px] justify-center items-center">
                  <p className="text-xs font-bold ">Action</p>
                  <img src={Polygon6} alt="" />
                </div>
                <div className="flex gap-[1px] justify-center items-center">
                  <p className="text-xs font-bold ">Nama Mesin</p>
                  <img src={Polygon6} alt="" />
                </div>
                <div className="flex gap-[1px] justify-center items-center">
                  <p className="text-xs font-bold ">Jenis Kendala</p>
                  <img src={Polygon6} alt="" />
                </div>
                <div className="flex gap-[1px] justify-center items-center">
                  <p className="text-xs font-bold ">Persentase</p>
                  <img src={Polygon6} alt="" />
                </div>
              </div>
              {tiket != null &&
                tiket.data.map((data: any, i: any) => {
                  const lengthProses = data.proses_mtcs.length - 1;

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

                  const dateMtc = convertDatetimeToDate(data.createdAt);
                  const waktuRespon = calculateResponTime(
                    data.waktu_respon_qc == null
                      ? data.createdAt
                      : data.waktu_respon_qc,
                    data.waktu_respon,
                  );
                  const waktuBreakdown = calculateResponTime(
                    data.waktu_mulai_mtc,
                    data.waktu_selesai_mtc,
                  );
                  return (
                    <>
                      <div className="bg-white mt-2 grid grid-cols-4 gap-3 p-2">
                        <div className="flex gap-1">
                          <div>
                            <button
                              title="button"
                              onClick={() => handleClick(i)}
                              className="text-xs px-1 py-2 font-bold bg-blue-700  text-white rounded-sm"
                            >
                              <img src={Burger} alt="" className="mx-1" />
                            </button>
                            {openButton == i ? (
                              <div className="absolute bg-white p-3 shadow-5 rounded-md">
                                {' '}
                                {/* Wrap buttons for styling */}
                                <div className="flex flex-col gap-1">
                                  {data.status_tiket == 'monitoring' ? (
                                    <></>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        if (data.status_tiket == 'open') {
                                          openModal1(i);
                                        } else if (
                                          data.status_tiket == 'temporary' &&
                                          data.proses_mtcs[lengthProses]
                                            .cara_perbaikan == null
                                        ) {
                                          openModal1(i);

                                          // ini untuk fungsi rework
                                        } else {
                                          reworkTiket(data.id, i);
                                        }
                                      }}
                                      className=" w-25 text-xs font-bold bg-blue-700 py-2 text-white rounded-md"
                                    >
                                      PROSES
                                    </button>
                                  )}
                                  <button
                                    onClick={openModal2}
                                    className="w-25 text-xs font-bold bg-blue-700 py-2 text-white rounded-md"
                                  >
                                    JADWALKAN{' '}
                                  </button>
                                </div>
                                {showModal1[i] == true && (
                                  <ModalStockCheck1
                                    children={undefined}
                                    isOpen={showModal1[i]}
                                    onClose={() => closeModal1(i)}
                                    onFinish={() => getTiket()}
                                    kendala={data.nama_kendala}
                                    kodeLkh={data.kode_lkh}
                                    machineName={data.mesin}
                                    tgl={data.waktu_respon}
                                    jam={'19.09'}
                                    namaPemeriksa={data.proses_mtcs[lengthProses]
                                      .user_eksekutor.nama}
                                    no={'109299'}
                                    idTiket={data.id}
                                    idProses={data.proses_mtcs[lengthProses].id}
                                    namaMesin={data.mesin}
                                    skor_mtc={data.proses_mtcs[lengthProses].skor_mtc}
                                    jenis_perbaikan={data.proses_mtcs[lengthProses]
                                      .cara_perbaikan} unit={data.proses_mtcs[lengthProses].unit} bagian={data.proses_mtcs[lengthProses].bagian_mesin} />
                                )}
                                {showModal2 && (
                                  <ModalMtcLightHeavy
                                    isOpen={showModal2}
                                    onClose={closeModal2}
                                    title={undefined}
                                  >
                                    <div className="pt-5">
                                      <button
                                        onClick={openModal4}
                                        className="w-full h-12 text-center text-white text-xs font-bold bg-blue-700 rounded-md"
                                      >
                                        PERBAIKAN INTERNAL
                                      </button>
                                    </div>
                                    <div className="pt-2">
                                      <button
                                        onClick={openModal5}
                                        className="w-full h-12 text-center text-white text-xs font-bold bg-blue-700 rounded-md"
                                      >
                                        SERVICE
                                      </button>
                                    </div>
                                  </ModalMtcLightHeavy>
                                )}
                                {showModal5 && (
                                  <ModalSPBService
                                    isOpen={showModal5}
                                    onClose={closeModal5}
                                    noSPB={'MT-0001'}
                                    tglSpb={'20 MEI 2024'}
                                    sumber={'Os2'}
                                    data={undefined}
                                    onFinish={getTiket}
                                    idProses={undefined}
                                  >
                                    <p></p>
                                  </ModalSPBService>
                                )}
                              </div>
                            ) : (
                              ''
                            )}
                          </div>

                          <button
                            title="button"
                            onClick={() => handleClickDetailMobile(i)}
                            className="text-xs h-6 font-bold text-blue-700 bg-blue-700  border-blue-700 border rounded-sm"
                          >
                            <img src={Arrow} alt="" className="mx-1" />
                          </button>
                        </div>

                        <div className="flex gap-2">
                          <p className="text-xs font-medium "> {data.mesin}</p>
                        </div>
                        <div className="flex gap-2">
                          <p className={`text-xs font-medium line-clamp-2 `}>
                            {data.kode_lkh} - {data.nama_kendala}{' '}
                          </p>
                        </div>
                        <div className="flex gap-2 justify-center items-center">
                          <p
                            className={
                              data.status_tiket == 'pending'
                                ? `text-xs px-2  font-light  rounded-xl flex justify-center text-[#DE0000] bg-[#FFB1B1] `
                                : data.status_tiket == 'open'
                                  ? `text-xs px-2  font-light  rounded-xl flex justify-center text-[#DE0000] bg-[#FFB1B1] `
                                  : data.status_tiket == 'monitoring'
                                    ? `text-xs px-2  font-light  rounded-xl flex justify-center text-[#004CDE] bg-[#B1ECFF] `
                                    : data.status_tiket == 'temporary'
                                      ? `text-xs px-2  font-light  rounded-xl flex justify-center text-[#FCBF11] bg-[#FFF2B1]  `
                                      : data.status_tiket == 'request to qc'
                                        ? `text-xs px-2  font-light  rounded-xl flex justify-center text-[#fcb911] bg-[#FFF2B1] `
                                        : data.status_tiket == 'qc rejected'
                                          ? `text-xs px-2  font-light  rounded-xl flex justify-center text-[#DE0000] bg-[#FFB1B1] ` : ''
                            }
                          >
                            {data.skor_mtc}%
                          </p>
                        </div>
                      </div>

                      {showDetailMobile[i] && (
                        <>
                          <div className="w-full grid grid-cols-3 bg-[#E9F3FF]  rounded-lg px-2 gap-x-3 gap-y-3 p-1">
                            <div>
                              <h5 className="text-xs font-bold">
                                Waktu tiket masuk
                              </h5>
                              <p className="text-xs font-medium">{dateMtc}</p>
                            </div>
                            <div>
                              <h5 className="text-xs font-bold">Kode Tiket</h5>
                              <p className="text-xs font-medium">{data.kode_ticket}</p>
                            </div>
                            <div>
                              <h5 className="text-xs font-bold">Status</h5>
                              <div className="flex items-center md:gap-5 gap-1 ">
                                <div className="flex ">
                                  <p
                                    className={
                                      data.status_tiket == 'pending'
                                        ? `text-xs px-2  font-light  rounded-xl flex justify-center text-[#DE0000] bg-[#FFB1B1] `
                                        : data.status_tiket == 'open'
                                          ? `text-xs px-2  font-light  rounded-xl flex justify-center text-[#DE0000] bg-[#FFB1B1] `
                                          : data.status_tiket == 'monitoring'
                                            ? `text-xs px-2  font-light  rounded-xl flex justify-center text-[#004CDE] bg-[#B1ECFF] `
                                            : data.status_tiket == 'temporary'
                                              ? `text-xs px-2  font-light  rounded-xl flex justify-center text-[#FCBF11] bg-[#FFF2B1]  `
                                              : data.status_tiket == 'request to qc'
                                                ? `text-xs px-2  font-light  rounded-xl flex justify-center text-[#fcb911] bg-[#FFF2B1] `
                                                : data.status_tiket == 'qc rejected'
                                                  ? `text-xs px-2  font-light  rounded-xl flex justify-center text-[#DE0000] bg-[#FFB1B1] ` : ''
                                    }
                                  >
                                    {data.status_tiket}{' '}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h5 className="text-xs font-bold">Waktu Respon</h5>
                              <p className="text-xs font-medium">{waktuRespon}</p>
                            </div>
                            <div>
                              <h5 className="text-xs font-bold">Jenis Kendala</h5>
                              <p className="text-xs font-medium">
                                {data.kode_lkh} - {data.nama_kendala}{' '}
                              </p>
                            </div>
                            <div>
                              <h5 className="text-xs font-bold">Jadwal</h5>
                              <p className="text-xs font-medium"></p>
                            </div>
                            <div>
                              <p className="text-xs font-bold">Pelapor</p>
                              <p className="text-xs font-medium">
                                {data.operator}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-bold">No.Jo</p>
                              <p className="text-xs font-medium">
                                {data.no_jo}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-bold">Breakdown Time</p>
                              <div>
                                <p className="text-xs font-light">
                                  {data.waktu_selesai_mtc == null ? '-' : waktuBreakdown}
                                  {/* {data.proses_mtcs[lengthProses].tgl_mtc}  */}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="w-full  bg-[#E9F3FF]  rounded-lg px-4 gap-y-3 mt-3 p-1">
                            {data.proses_mtcs.map((proses: any, ii: any) => {
                              const tglMulaiMtc = convertDatetimeToDate(
                                proses.waktu_mulai_mtc,
                              );
                              function convertDateonly(datetime: any) {
                                const dateObject = new Date(datetime);
                                const hours = dateObject
                                  .getHours()
                                  .toString()
                                  .padStart(2, '0');
                                const minutes = dateObject
                                  .getMinutes()
                                  .toString()
                                  .padStart(2, '0');
                                return `${hours}:${minutes}`; // Example format (YYYY-MM-DD)
                              }
                              function convertTimeOnly(datetime: any) {
                                const dateObject = new Date(datetime);
                                const day = dateObject
                                  .getDate()
                                  .toString()
                                  .padStart(2, '0'); // Ensure two-digit day
                                const month = (dateObject.getMonth() + 1)
                                  .toString()
                                  .padStart(2, '0'); // Adjust for zero-based month
                                const year = dateObject.getFullYear();

                                return `${year}/${month}/${day}`; // Example format (YYYY-MM-DD)
                              }

                              const waktumulaiJam = convertDateonly(
                                data.waktu_mulai_mtc,
                              );
                              const waktumulaimtcDate = convertTimeOnly(
                                data.waktu_mulai_mtc,
                              );
                              return (
                                <>
                                  <div className="py-3">
                                    <div className="flex w-full gap-4 pb-4">
                                      <div className="flex flex-col">
                                        <h5 className="text-xs font-bold">
                                          Pengerjaan Ke
                                        </h5>
                                        <p className="text-xs font-medium pt-1">
                                          {ii + 1}
                                        </p>
                                      </div>
                                      <div>
                                        <h5 className="text-xs font-bold">
                                          Waktu
                                        </h5>
                                        <p className="text-xs font-medium pt-1">
                                          {tglMulaiMtc}
                                        </p>
                                      </div>
                                      <div className="pl-4">
                                        <h5 className="text-xs font-bold">
                                          Eksekutor
                                        </h5>
                                        <p className="text-xs font-medium pt-1">
                                          {proses.user_eksekutor.nama}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex w-full gap-5">
                                      <div className="">
                                        <div className="">
                                          <button
                                            onClick={() => openModalDetail(ii)}
                                            className="text-xs font-bold bg-blue-700 py-1 px-5 text-white rounded-md"
                                          >
                                            Detail
                                          </button>
                                        </div>
                                        {showModalDetail[ii] && (
                                          <ModalDetail
                                            children={undefined}
                                            isOpen={showModalDetail[ii]}
                                            onClose={() => closeModalDetail(ii)}
                                            kendala={data.nama_kendala}
                                            machineName={data.mesin}
                                            tgl={waktumulaimtcDate}
                                            jam={waktumulaiJam}
                                            namaPemeriksa={proses.user_eksekutor.nama}
                                            no={'1'}
                                            idTiket={data.id}
                                            kodeLkh={data.kode_lkh}
                                            analisisPenyebab={`${proses.kode_analisis_mtc}` +
                                              ' - ' +
                                              `${proses.nama_analisis_mtc}`}
                                            kebutuhanSparepart={'undefined'}
                                            tipeMaintenance={proses.cara_perbaikan}
                                            catatan={proses.note_mtc} unit={proses.unit} bagian={proses.bagian_mesin}                                        ></ModalDetail>
                                        )}
                                      </div>
                                      <div className="flex flex-col">
                                        <h5 className="text-xs font-bold">
                                          Progress Perbaikan
                                        </h5>
                                        <div className="flex w-full pt-1  items-center justify-start">
                                          <p
                                            className={
                                              proses.skor_mtc <= 100 &&
                                                proses.skor_mtc >= 60
                                                ? `text-xs px-2  font-light  rounded-xl flex justify-center text-[#0057FF] bg-[#B1ECFF] `
                                                : proses.skor_mtc >= 20 &&
                                                  proses.skor_mtc <= 59
                                                  ? `text-xs px-2  font-light  rounded-xl flex justify-center  text-[#FCBF11] bg-[#FFF2B1] `
                                                  : proses.skor_mtc < 20
                                                    ? `text-xs px-2  font-light  rounded-xl flex justify-center text-[#DE0000] bg-[#FFB1B1]`
                                                    : ''
                                            }
                                          >
                                            {proses.skor_mtc}%
                                          </p>
                                        </div>
                                      </div>
                                      <div>
                                        <h5 className="text-xs font-bold">
                                          Jenis Perbaikan
                                        </h5>
                                        <p className="text-xs font-medium pt-1">
                                          {proses.cara_perbaikan}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </>
                  );
                })}
              <div className="w-full flex justify-center mt-5 ">
                <Stack spacing={2}>
                  <Pagination
                    count={tiket?.total_page}
                    color="primary"
                    onChange={(e, i) => {
                      setPage(i);
                      console.log(i);
                    }}
                  />
                </Stack>
              </div>
            </main>
          </>
        )
      }
    </main >
  );
}

export default TableOS;
