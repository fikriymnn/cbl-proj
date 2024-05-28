import { useEffect, useRef, useState } from 'react';
import Filter from '../../../images/icon/filter.svg';
import Burger from '../../../images/icon/burger.svg';
import Arrow from '../../../images/icon/arrowDown.svg';

import Polygon6 from '../../../images/icon/Polygon6.svg';
import axios from 'axios';
import ModalMtcDate from '../../../components/Modals/ModalMtcDate';
import ModalStockCheck1 from '../../../components/Modals/ModalStockCheck1';
import ModalDetail from '../../../components/Modals/ModalDetail';
import DefaultLayout from '../../../layout/DefaultLayout';
import X from '../../../images/icon/x.svg';
import ModalDetailOS3 from '../../../components/Modals/ModalDetailOS3';

// import moment from 'moment';

function TableOS3() {
  const [isMobile, setIsMobile] = useState(false);
  const [status, setStatus] = useState();
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

  //const openModal1 = () => setShowModal1(true);

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

  const handleClick = (i: any) => {
    const onchangeVal: any = [...showTwoButtons];
    setShowTwoButtons(showTwoButtons.map((item: any) => (item = false)));
    onchangeVal[i] = !onchangeVal[i];

    setShowTwoButtons(onchangeVal);
  };

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
    const url = `${import.meta.env.VITE_API_LINK}/ticketOs3?bagian_tiket=os3`;
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
      setShowModalDetail(data);
      setShowTwoButtons(data);
      console.log(data);
    } catch (error: any) {
      console.log(error.response);
    }
  }

  async function responMTC(id: number, indexModal: any) {
    const url = `${import.meta.env.VITE_API_LINK}/ticketOs3/respon/${id}`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      alert('proses berhasil');
      getTiket();
    } catch (error: any) {
      console.log(error.response);
      alert('error');
    }
  }

  async function reworkTiket(idTiket: number) {
    const url = `${import.meta.env.VITE_API_LINK}/ticketOs3/rework/${idTiket}`;

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

  // function calculateResponTime(startDate: any, endDate: any) {
  //     const createdAtDate = new Date(startDate);
  //     const waktuResponDate = new Date(endDate);
  //     const millisecondsDiff =
  //         waktuResponDate.getTime() - createdAtDate.getTime();

  //     const secondsDiff = millisecondsDiff / 1000;
  //     const minutesDiff = Math.floor(secondsDiff / 60);
  //     const hoursDiff = Math.floor(minutesDiff / 60);

  //     const formattedDifference = `${hoursDiff ? hoursDiff + ' hours ' : ''}${hoursDiff >= 1 ? '' : minutesDiff + ' minutes '
  //         } `;

  //     return formattedDifference; // Example format (YYYY-MM-DD)
  // }

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
            <div className="grid grid-cols-8 w-full">
              <div className="flex gap-2">
                <p className="text-xs font-bold ">Kode Tiket</p>
                <img className="w-2" src={Polygon6} alt="" />
              </div>
              <div className="flex gap-2">
                <p className="text-xs font-bold ">Sumber</p>
                <img className="w-2" src={Polygon6} alt="" />
              </div>
              <div className="flex gap-2 ">
                <p className="text-xs font-bold "> Mesin</p>
                <img className="w-2" src={Polygon6} alt="" />
              </div>
              <div className="flex gap-2">
                <p className="text-xs font-bold ">Kendala</p>
                <img className="w-2" src={Polygon6} alt="" />
              </div>
              <div className="flex gap-2">
                <p className="text-xs font-bold ">Indikator</p>
                <img className="w-2" src={Polygon6} alt="" />
              </div>

              <div className="flex gap-2">
                <p className="text-xs font-bold ">Status</p>
              </div>
              <div className="flex gap-2">
                <p className="text-xs font-bold ">Persentase</p>
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
                  const lengthProses = data.proses_mtc_os3s.length - 1;

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
                  //   const waktuRespon = calculateResponTime(
                  //     data.createdAt,
                  //     data.waktu_respon,
                  //   );
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
                          <div className="grid md:grid-cols-8 grid-cols-6 w-full  ">
                            <div className="flex flex-col md:gap-5 gap-1 ">
                              <div className="my-auto ">
                                <p className="text-xs font-light">JUN24-0001</p>
                              </div>
                            </div>
                            <div className="flex flex-col md:gap-5 gap-1 ">
                              <div className="my-auto ">
                                <p className="text-xs font-light">
                                  {data.sumber}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col md:gap-5 gap-1 ">
                              <div className="my-auto">
                                <p className="text-xs font-light">
                                  {data.nama_mesin}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col  md:gap-5 gap-1 ">
                              <div className="my-auto w-11/12">
                                <p className="text-xs font-light">
                                  {/* {data.nama_kendala} */}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center md:gap-5 gap-1 ">
                              <div className="flex ">
                                <div className="md:w-5 w-4 flex justify-center items-center">
                                  <img className="" src={X} alt="" />
                                </div>
                                <p className="text-xs  px-1 font-light  rounded-xl flex justify-center items-center">
                                  {data.point_pm1.hasil}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center md:gap-5 gap-1">
                              <div className="flex ">
                                <p
                                  className={
                                    data.status_tiket == 'pending'
                                      ? `text-xs px-2  font-light  rounded-xl flex justify-center text-[#DE0000] bg-[#FFB1B1] `
                                      : data.status_tiket == 'open'
                                      ? `text-xs px-2  font-light  rounded-xl flex justify-center text-[#FCBF11] bg-[#FFF2B1] `
                                      : data.status_tiket == 'monitoring'
                                      ? `text-xs px-2  font-light  rounded-xl flex justify-center text-[#004CDE] bg-[#B1ECFF] `
                                      : data.status_tiket == 'temporary'
                                      ? `text-xs px-2  font-light  rounded-xl flex justify-center text-[#FC4911] bg-[#de85002a]  `
                                      : ''
                                  }
                                >
                                  {data.status_tiket}{' '}
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
                                      ? `text-xs px-2  font-light  rounded-xl flex justify-center text-[#FCBF11] bg-[#FFF2B1] `
                                      : data.status_tiket == 'monitoring'
                                      ? `text-xs px-2  font-light  rounded-xl flex justify-center text-[#004CDE] bg-[#B1ECFF] `
                                      : data.status_tiket == 'temporary'
                                      ? `text-xs px-2  font-light  rounded-xl flex justify-center text-[#FC4911] bg-[#de85002a]  `
                                      : ''
                                  }
                                >
                                  {data.skor_mtc}%
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
                                  {showTwoButtons[i] ? (
                                    <div className="absolute bg-white p-3 shadow-5 rounded-md">
                                      {' '}
                                      {/* Wrap buttons for styling */}
                                      <div className="flex flex-col gap-1">
                                        <button
                                          onClick={() => {
                                            if (!data.waktu_mulai_mtc) {
                                              console.log(data.waktu_mulai_mtc);
                                              responMTC(data.id, i);
                                            } else if (
                                              data.status_tiket == 'open' ||
                                              data.status_tiket == 'pending'
                                            ) {
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
                                          kendala={'data.nama_kendala'}
                                          kodeLkh={'data.kode_lkh'}
                                          machineName={data.nama_mesin}
                                          tgl={data.waktu_respon}
                                          jam={'19.09'}
                                          namaPemeriksa={
                                            data.proses_mtc_os3s[lengthProses]
                                              .user_eksekutor.nama
                                          }
                                          no={'109299'}
                                          idTiket={data.id}
                                          idProses={
                                            data.proses_mtc_os3s[lengthProses]
                                              .id
                                          }
                                          namaMesin={data.nama_mesin}
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

                        {data.proses_mtc_os3s.length > 0 && showDetail[i] && (
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
                                      {/* {waktuRespon} */}
                                    </p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-6 gap-3 w-10/12">
                                  {data.proses_mtc_os3s.length > 0
                                    ? data.proses_mtc_os3s.map(
                                        (proses: any, ii: any) => {
                                          const tglMulaiMtc =
                                            convertDatetimeToDate(
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
                                                      proses.skor_mtc === 100
                                                        ? `text-xs px-2  font-light  rounded-xl flex justify-center text-[#0057FF] bg-[#B1ECFF] `
                                                        : proses.skor_mtc >=
                                                            60 &&
                                                          proses.skor_mtc < 100
                                                        ? `text-xs px-2  font-light  rounded-xl flex justify-center text-green-600 bg-[#00de3f2f] `
                                                        : proses.skor_mtc >=
                                                            40 &&
                                                          proses.skor_mtc < 60
                                                        ? `text-xs px-2  font-light  rounded-xl flex justify-center text-[#DE0000] bg-[#FFDBB1] `
                                                        : proses.skor_mtc <
                                                            40 &&
                                                          proses.skor_mtc >= 0
                                                        ? `text-xs px-2  font-light  rounded-xl flex justify-center text-[#DE0000] bg-[#FFB1B1] `
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
                                                <ModalDetailOS3
                                                  children={undefined}
                                                  isOpen={showModalDetail[ii]}
                                                  onClose={() =>
                                                    closeModalDetail(ii)
                                                  }
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
                                                  analisisPenyebab={
                                                    `${proses.kode_analisis_mtc}` +
                                                    ' - ' +
                                                    `${proses.nama_analisis_mtc}`
                                                  }
                                                  kebutuhanSparepart={
                                                    'undefined'
                                                  }
                                                  tipeMaintenance={
                                                    proses.cara_perbaikan
                                                  }
                                                  catatan={proses.note_mtc}
                                                ></ModalDetailOS3>
                                                // <ModalDetail
                                                //     children={undefined}
                                                //     isOpen={showModalDetail[ii]}
                                                //     onClose={() => closeModalDetail(ii)}
                                                //     kendala={data.nama_kendala}
                                                //     machineName={data.mesin}
                                                //     tgl={'12/12/24'}
                                                //     jam={'17.00'}
                                                //     namaPemeriksa={
                                                //         proses.user_eksekutor.nama
                                                //     }
                                                //     no={'1'}
                                                //     idTiket={data.id}
                                                //     kodeLkh={data.kode_lkh}
                                                //     analisisPenyebab={`${proses.kode_analisis_mtc}` + ' - ' + `${proses.nama_analisis_mtc}`}
                                                //     kebutuhanSparepart={'undefined'}
                                                //     tipeMaintenance={proses.cara_perbaikan}
                                                //     catatan={
                                                //         proses.note_mtc
                                                //     }
                                                // ></ModalDetail>
                                              )}
                                            </>
                                          );
                                        },
                                      )
                                    : null}
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
          <div className="flex bg-white mt-2 py-2">
            <div className="flex  w-full px-3">
              <div className="flex w-3/12 gap-2">
                <p className="text-xs font-bold ">Sumber</p>
                <img className="w-2" src={Polygon6} alt="" />
              </div>
              <div className="flex w-3/12 gap-2">
                <p className="text-xs font-bold ">Mesin</p>
                <img className="w-2" src={Polygon6} alt="" />
              </div>
              <div className="flex w-3/12 gap-2">
                <p className="text-xs font-bold ">Indikator</p>
                <img className="w-2" src={Polygon6} alt="" />
              </div>
              <div className="flex w-3/12 gap-2">
                <p className="text-xs font-bold ">Poin Kendala</p>
                <img className="w-2" src={Polygon6} alt="" />
              </div>
            </div>
          </div>
          <div className=" overflow-x-auto">
            <div className="w-full flex flex-col bg-[#E9F3FF] ">
              {tiket != null &&
                tiket.map((data: any, i: any) => {
                  const lengthProses = data.proses_mtc_os3s.length - 1;

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
                  //   const waktuRespon = calculateResponTime(
                  //     data.createdAt,
                  //     data.waktu_respon,
                  //   );
                  return (
                    <>
                      <div className="my-2">
                        <section className="flex  bg-white  rounded-lg px-3 py-3">
                          <div className="flex flex-row w-full  ">
                            <div className="flex w-3/12 justify-start items-start">
                              <p className="text-xs font-light">PM2</p>
                            </div>

                            <div className="flex w-2/12 justify-start items-start">
                              <p className="text-xs font-light">{data.mesin}</p>
                            </div>
                            <div className="flex w-4/12  justify-start items-start">
                              <img className="w-4 h-4" src={X} alt="" />

                              <p className="text-xs  flex justify-center pl-1">
                                Jelek/rusak
                              </p>
                            </div>
                            <div className="flex w-3/12 justify-start items-start">
                              <p className="text-xs px-2  font-light  rounded-xl flex justify-center">
                                Panel Listrik
                              </p>
                            </div>
                          </div>
                        </section>

                        {/* {showDetail[i] && (
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
                                                                </div>
                                                                <div className="grid grid-cols-6 gap-3 w-10/12">
                                                                    {data.proses_mtc_os3s.map(
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
                                                                                                    proses.skor_mtc === 100
                                                                                                        ? `text-xs px-2  font-light  rounded-xl flex justify-center text-[#0057FF] bg-[#B1ECFF] `
                                                                                                        : proses.skor_mtc >= 60 &&
                                                                                                            proses.skor_mtc < 100
                                                                                                            ? `text-xs px-2  font-light  rounded-xl flex justify-center text-green-600 bg-[#00de3f2f] `
                                                                                                            : proses.skor_mtc >= 40 &&
                                                                                                                proses.skor_mtc < 60
                                                                                                                ? `text-xs px-2  font-light  rounded-xl flex justify-center text-[#DE0000] bg-[#FFDBB1] `
                                                                                                                : proses.skor_mtc < 40 &&
                                                                                                                    proses.skor_mtc >= 0
                                                                                                                    ? `text-xs px-2  font-light  rounded-xl flex justify-center text-[#DE0000] bg-[#FFB1B1] `
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
                                                )} */}
                      </div>
                    </>
                  );
                })}
            </div>
          </div>
        </>
      )}
    </main>
  );
}

export default TableOS3;
