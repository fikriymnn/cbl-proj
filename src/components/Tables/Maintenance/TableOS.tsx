import { useEffect, useRef, useState } from 'react';
import Filter from '../../../images/icon/filter.svg';
import Burger from '../../../images/icon/burger.svg';
import Arrow from '../../../images/icon/arrowDown.svg';
import ModalStockCheckPengganti from '../../Modals/ModalStockCheckPilihPengganti';
import ModalPopupReq from '../../Modals/ModalDetailPopupReq';
import ModalMtcDate from '../../Modals/ModalMtcDate';
import ModalStockCheck1 from '../../Modals/ModalStockCheck1';
import Polygon6 from '../../../images/icon/Polygon6.svg';
import axios from 'axios';
import ModalDetail from '../../Modals/ModalDetail';
// import moment from 'moment';

function TableOS() {
  const [isMobile, setIsMobile] = useState(false);
  const [status, setStatus] = useState();
  const [openButton, setOpenButton] = useState(null);


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
  //const closeModal1 = () => setShowModal1(false);

  const closeModal2 = () => setShowModal2(false);
  // const handleClick = (index: number) => {
  //   setShowTwoButtons((prevState) => {
  //     const updatedShowTwoButtons = [...prevState]; // Create a copy
  //     updatedShowTwoButtons[index] = !updatedShowTwoButtons[index]; // Toggle value
  //     // Reset showTwoButtons for all other rows
  //     for (let i = 0; i < updatedShowTwoButtons.length; i++) {
  //       if (i !== index) {
  //         updatedShowTwoButtons[i] = false;
  //       }
  //     }
  //     return updatedShowTwoButtons;
  //   });
  // };
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
  }, []);

  async function getUser() {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_LINK}/me`, {
        withCredentials: true,
      });
      // if (res.data.success == false) {
      //   navigate("/auth/login");
      // }
      setUser(res.data);
      console.log(res.data);
    } catch (error: any) {
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

  async function getTiket() {
    const url = `${import.meta.env.VITE_API_LINK}/ticket?bagian_tiket=os2`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      setTiket(res.data);
      console.log(res.data);

      let data: any[] = [];
      for (let i = 0; i < res.data.length; i++) {
        data.push(false);
      }
      setShowModal1(data);
      setShowModalDetail(data)
      setShowTwoButtons(data);
      setShowTwoButtonsMobile(data);
    } catch (error: any) {
      console.log(error.response);
    }
  }

  async function reworkTiket(idTiket: number) {
    const url = `${import.meta.env.VITE_API_LINK}/ticket/rework/${idTiket}`;

    try {
      const res = await axios.put(
        url,
        {
          id_eksekutor: user.id,
        },
        {
          withCredentials: true,
        },
      );

      alert(res.data.msg);
      getTiket();
    } catch (error: any) {
      alert(error.data.msg);
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


  return (
    <main>
      <div className="flex justify-between bg-white p-2">
        <img src={Filter} alt="" className="mx-3" />
        {/* <input className='w-96 py-1 mx-3 bg-[#E9F3FF]'>
          search
        </input> */}
        <input
          type="search"
          placeholder="search"
          name=""
          id=""
          className="md:w-96 w-40 py-1 mx-3 px-3 bg-[#E9F3FF]"
        />
      </div>

      {!isMobile && (
        <>
          <div className="flex bg-white mt-2 py-2">
            <p className="px-5 text-xs font-bold ">No</p>
            <div className="grid md:grid-cols-8 grid-cols-7 w-full">
              <div className="flex gap-2">
                <p className="text-xs font-bold ">Kode Tiket</p>
                <img className="w-2" src={Polygon6} alt="" />
              </div>
              <div className="flex gap-2">
                <p className="text-xs font-bold ">Nama Mesin</p>
                <img className="w-2" src={Polygon6} alt="" />
              </div>
              <div className="flex gap-2 col-span-2">
                <p className="text-xs font-bold ">Jenis Kendala</p>
                <img className="w-2" src={Polygon6} alt="" />
              </div>
              <div className="flex gap-2">
                <p className="text-xs font-bold ">Status</p>
                <img className="w-2" src={Polygon6} alt="" />
              </div>
              <div className="flex gap-2">
                <p className="text-xs font-bold ">Persentase</p>
                <img className="w-2" src={Polygon6} alt="" />
              </div>
              <div className="flex gap-2">
                <p className="text-xs font-bold ">Jadwal</p>
                <img className="w-2" src={Polygon6} alt="" />
              </div>
              <div className="flex gap-2">
                <p className="text-xs font-bold ">Action</p>
              </div>
            </div>
          </div>
          <div className=" overflow-x-auto">
            <div className="min-w-[700px]">
              {tiket != null &&
                tiket.map((data: any, i: any) => {
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
                    data.createdAt,
                    data.waktu_respon,
                  );
                  return (
                    <>
                      <div className="my-2">
                        <section className="flex  bg-white  rounded-lg">
                          <div
                            key={i}
                            className=" py-3 px-6 flex justify-center items-center"
                          >
                            {i + 1}
                          </div>
                          <div className="grid md:grid-cols-8 grid-cols-7 w-full  ">
                            <div className="flex flex-col md:gap-5 gap-1 ">
                              <div className="my-auto ">
                                <p className="text-sm font-light"></p>
                              </div>
                            </div>
                            <div className="flex flex-col md:gap-5 gap-1 ">
                              <div className="my-auto">
                                <p className="text-sm font-light">
                                  {data.mesin}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col col-span-2 md:gap-5 gap-1 ">
                              <div className="my-auto w-11/12">
                                <p className="text-sm font-light">
                                  {data.kode_lkh} - {data.nama_kendala}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center md:gap-5 gap-1 ">
                              <div className="flex ">
                                <p
                                  className={
                                    data.status_tiket == 'pending' ? `text-sm px-2  font-light  rounded-xl flex justify-center text-[#DE0000] bg-[#FFB1B1] ` : data.status_tiket == 'open' ? `text-sm px-2  font-light  rounded-xl flex justify-center text-[#FCBF11] bg-[#FFF2B1] ` : data.status_tiket == 'monitoring' ? `text-sm px-2  font-light  rounded-xl flex justify-center text-[#004CDE] bg-[#B1ECFF] ` : data.status_tiket == 'temporary' ? `text-sm px-2  font-light  rounded-xl flex justify-center text-[#FC4911] bg-[#de85002a]  ` : ""
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
                                    data.status_tiket == 'pending' ? `text-sm px-2  font-light  rounded-xl flex justify-center text-[#DE0000] bg-[#FFB1B1] ` : data.status_tiket == 'open' ? `text-sm px-2  font-light  rounded-xl flex justify-center text-[#FCBF11] bg-[#FFF2B1] ` : data.status_tiket == 'monitoring' ? `text-sm px-2  font-light  rounded-xl flex justify-center text-[#004CDE] bg-[#B1ECFF] ` : data.status_tiket == 'temporary' ? `text-sm px-2  font-light  rounded-xl flex justify-center text-[#FC4911] bg-[#de85002a]  ` : ""
                                  }
                                >
                                  {data.skor_mtc}%
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col md:gap-5 gap-1 ">
                              <div>
                                <p className="text-sm font-light">
                                  {data.proses_mtcs[lengthProses].tgl_mtc}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2 items-center md:mb-0 mb-2">
                              <div>
                                <div>
                                  <button
                                    className="text-xs font-bold bg-blue-700 py-2 text-white rounded-md"
                                    onClick={() => handleClick(i)}
                                  >
                                    <img src={Burger} alt="" className="mx-3" />
                                  </button>
                                  {openButton == i ? (
                                    <div className="absolute bg-white p-3 shadow-5 rounded-md">
                                      {' '}
                                      {/* Wrap buttons for styling */}
                                      <div className="flex flex-col gap-1">
                                        <button
                                          onClick={() => {
                                            if (data.status_tiket == 'open') {
                                              openModal1(i);
                                            } else {
                                              reworkTiket(data.id);
                                              // ini untuk fungsi rework
                                            }
                                          }}
                                          className=" w-25 text-xs font-bold bg-blue-700 py-2 text-white rounded-md"
                                        >
                                          PROSES
                                        </button>
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
                                          namaPemeriksa={
                                            data.proses_mtcs[lengthProses]
                                              .user_eksekutor.nama
                                          }
                                          no={'109299'}
                                          idTiket={data.id}
                                          idProses={
                                            data.proses_mtcs[lengthProses].id
                                          }
                                          namaMesin={data.mesin}
                                        />
                                      )}
                                      {showModal2 && (
                                        <ModalMtcDate
                                          isOpen={showModal2}
                                          onClose={closeModal2}
                                          machineName={'GMC Printer 2'}
                                        >
                                          <p></p>
                                        </ModalMtcDate>
                                      )}
                                    </div>
                                  ) : (
                                    ''
                                  )}
                                </div>
                              </div>
                              <div>
                                <button
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
                                    Waktu Tiket Masuk
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
                                  <div>
                                    <p className="text-xs font-bold">
                                      Pelapor
                                    </p>
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
                                      return (
                                        <>
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
                                              {proses.user_eksekutor.nama}
                                            </p>
                                          </div>

                                          <div className="flex flex-col gap-2">
                                            <div className="flex">
                                              <p
                                                className={
                                                  proses.skor_mtc <= 100 && proses.skor_mtc > 20
                                                    ? `text-sm px-2  font-light  rounded-xl flex justify-center text-[#0057FF] bg-[#B1ECFF] ` : proses.skor_mtc == 20 ?
                                                      `text-sm px-2  font-light  rounded-xl flex justify-center  text-[#FC4911] bg-[#de85002a] ` : proses.skor_mtc == 0 ? `text-sm px-2  font-light  rounded-xl flex justify-center text-[#DE0000] bg-[#FFB1B1]`
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
                                              tgl={'12/12/24'}
                                              jam={'17.00'}
                                              namaPemeriksa={
                                                proses.user_eksekutor.nama
                                              }
                                              no={'1'}
                                              idTiket={data.id}
                                              kodeLkh={data.kode_lkh}
                                              analisisPenyebab={`${proses.kode_analisis_mtc}` + ' - ' + `${proses.nama_analisis_mtc}`}
                                              kebutuhanSparepart={'undefined'}
                                              tipeMaintenance={proses.cara_perbaikan}
                                              catatan={
                                                proses.note_mtc
                                              }
                                            ></ModalDetail>
                                          )}
                                        </>
                                      );
                                    },
                                  )}
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </>
                  );
                })}
            </div>
          </div>
        </>
      )}

      {/* =============================================================INI KOMPONEN UNTUK MOBILE========================================== */}
      {isMobile && (
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
              tiket.map((data: any, i: any) => {
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
                  data.createdAt,
                  data.waktu_respon,
                );
                return (
                  <>
                    <div className="bg-white mt-2 grid grid-cols-4 gap-3 p-2">
                      <div className="flex gap-1">

                        <div>
                          <button onClick={() => handleClick(i)} className="text-xs px-1 py-2 font-bold bg-blue-700  text-white rounded-sm">
                            <img src={Burger} alt="" className="mx-1" />
                          </button>
                          {openButton == i ? (
                            <div className="absolute bg-white p-3 shadow-5 rounded-md">
                              {' '}
                              {/* Wrap buttons for styling */}
                              <div className="flex flex-col gap-1">
                                <button
                                  onClick={() => {
                                    if (data.status_tiket == 'open' || data.status_tiket == 'pending') {
                                      openModal1(i);
                                    } else {
                                      reworkTiket(data.id);
                                      // ini untuk fungsi rework
                                    }
                                  }}
                                  className=" w-25 text-xs font-bold bg-blue-700 py-2 text-white rounded-md"
                                >
                                  PROSES
                                </button>
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
                                  namaPemeriksa={
                                    data.proses_mtcs[lengthProses]
                                      .user_eksekutor.nama
                                  }
                                  no={'109299'}
                                  idTiket={data.id}
                                  idProses={
                                    data.proses_mtcs[lengthProses].id
                                  }
                                  namaMesin={data.mesin}
                                />
                              )}
                              {showModal2 && (
                                <ModalMtcDate
                                  isOpen={showModal2}
                                  onClose={closeModal2}
                                  machineName={'GMC Printer 2'}
                                >
                                  <p></p>
                                </ModalMtcDate>
                              )}
                            </div>
                          ) : (
                            ''
                          )}
                        </div>

                        <button
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
                      <div className="flex gap-2 justify-center ">

                        <p
                          className={
                            data.status_tiket == 'pending' ? `text-sm px-2  font-light  rounded-xl flex justify-center text-[#DE0000] bg-[#FFB1B1] ` : data.status_tiket == 'open' ? `text-sm px-2  font-light  rounded-xl flex justify-center text-[#FCBF11] bg-[#FFF2B1] ` : data.status_tiket == 'monitoring' ? `text-sm px-2  font-light  rounded-xl flex justify-center text-[#004CDE] bg-[#B1ECFF] ` : data.status_tiket == 'temporary' ? `text-sm px-2  font-light  rounded-xl flex justify-center text-[#FC4911] bg-[#de85002a]  ` : ""
                          }
                        >
                          {data.skor_mtc}%
                        </p>

                      </div>
                    </div >
                    {
                      showDetailMobile[i] && (
                        <>
                          <div className="w-full grid grid-cols-3 bg-[#E9F3FF]  rounded-lg px-2 gap-x-3 gap-y-3 p-1">
                            <div>
                              <h5 className="text-xs font-bold">Waktu tiket masuk</h5>
                              <p className="text-xs font-medium">{dateMtc}</p>
                            </div>
                            <div>
                              <h5 className="text-xs font-bold">Kode Tiket</h5>
                              <p className="text-xs font-medium"></p>
                            </div>
                            <div>
                              <h5 className="text-xs font-bold">Status</h5>
                              <div className="flex items-center md:gap-5 gap-1 ">
                                <div className="flex ">

                                  <p
                                    className={
                                      data.status_tiket == 'pending' ? `text-sm px-2  font-light  rounded-xl flex justify-center text-[#DE0000] bg-[#FFB1B1] ` : data.status_tiket == 'open' ? `text-sm px-2  font-light  rounded-xl flex justify-center text-[#FCBF11] bg-[#FFF2B1] ` : data.status_tiket == 'monitoring' ? `text-sm px-2  font-light  rounded-xl flex justify-center text-[#004CDE] bg-[#B1ECFF] ` : data.status_tiket == 'temporary' ? `text-sm px-2  font-light  rounded-xl flex justify-center text-[#FC4911] bg-[#de85002a]  ` : ""
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
                              <p className="text-xs font-bold">
                                Pelapor
                              </p>
                              <p className="text-xs font-medium">
                                {data.operator}
                              </p>
                            </div>
                          </div>
                          <div className="w-full  bg-[#E9F3FF]  rounded-lg px-4 gap-y-3 mt-3 p-1">
                            {data.proses_mtcs.map(
                              (proses: any, ii: any) => {
                                const tglMulaiMtc = convertDatetimeToDate(
                                  proses.waktu_mulai_mtc,
                                );
                                return (
                                  <>
                                    <div className='py-3'>


                                      <div className='flex w-full gap-4 pb-4'>
                                        <div className='flex flex-col'>
                                          <h5 className="text-xs font-bold">Pengerjaan Ke</h5>
                                          <p className="text-xs font-medium pt-1">{ii + 1}</p>

                                        </div>
                                        <div>
                                          <h5 className="text-xs font-bold">Waktu</h5>
                                          <p className="text-xs font-medium pt-1">{tglMulaiMtc}</p>
                                        </div>
                                        <div className='pl-4'>
                                          <h5 className="text-xs font-bold">Eksekutor</h5>
                                          <p className="text-xs font-medium pt-1">{proses.user_eksekutor.nama}</p>
                                        </div>

                                      </div>
                                      <div className='flex w-full gap-5'>
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
                                              tgl={'12/12/24'}
                                              jam={'17.00'}
                                              namaPemeriksa={
                                                proses.user_eksekutor.nama
                                              }
                                              no={'1'}
                                              idTiket={data.id}
                                              kodeLkh={data.kode_lkh}
                                              analisisPenyebab={`${proses.kode_analisis_mtc}` + ' - ' + `${proses.nama_analisis_mtc}`}
                                              kebutuhanSparepart={'undefined'}
                                              tipeMaintenance={proses.cara_perbaikan}
                                              catatan={
                                                proses.note_mtc
                                              }
                                            ></ModalDetail>
                                          )}
                                        </div>
                                        <div className='flex flex-col'>
                                          <h5 className="text-xs font-bold">
                                            Progress Perbaikan
                                          </h5>
                                          <div className='flex w-full pt-1  items-center justify-start'>
                                            <p
                                              className={
                                                data.skor_mtc === 100
                                                  ? `text-sm px-2  font-light  rounded-xl flex justify-center text-[#0057FF] bg-[#B1ECFF] `
                                                  : data.skor_mtc >= 60 &&
                                                    data.skor_mtc < 100
                                                    ? `text-sm px-2  font-light  rounded-xl flex justify-center text-green-600 bg-[#00de3f2f] `
                                                    : data.skor_mtc >= 40 &&
                                                      data.skor_mtc < 60
                                                      ? `text-sm px-2  font-light  rounded-xl flex justify-center text-[#DE0000] bg-[#FFDBB1] `
                                                      : data.skor_mtc < 40 && data.skor_mtc >= 0
                                                        ? `text-sm px-2  font-light  rounded-xl flex justify-center text-[#DE0000] bg-[#FFB1B1] `
                                                        : ''
                                              }
                                            >
                                              {proses.skor_mtc}%
                                            </p>
                                          </div>

                                        </div>
                                        <div>
                                          <h5 className="text-xs font-bold">Jenis Perbaikan</h5>
                                          <p className="text-xs font-medium pt-1">{proses.cara_perbaikan}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </>
                                )
                              })
                            }
                          </div>

                        </>

                      )
                    }
                  </>
                );
              }
              )}
          </main >
        </>
      )
      }
    </main >
  );
}

export default TableOS;
