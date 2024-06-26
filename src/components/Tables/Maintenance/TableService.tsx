import { useEffect, useRef, useState } from 'react';
import Filter from '../../../images/icon/filter.svg';
import Burger from '../../../images/icon/burger.svg';
import Arrow from '../../../images/icon/arrowDown.svg';
import ModalStockCheckPengganti from '../../Modals/ModalStockCheckPilihPengganti';
import ModalPopupReq from '../../Modals/ModalDetailPopupReq';
import ModalMtcDate from '../../Modals/ModalMtcDate';
import ModalStockCheck1 from '../../Modals/ModalStockCheck1';
import Polygon6 from '../../../images/icon/Polygon6.svg';
import X from '../../../images/icon/x.svg';
import axios from 'axios';
import ModalDetail from '../../Modals/ModalDetail';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import ModalMtcLightHeavy from '../../Modals/ModalMtcLightHeavy';
// import moment from 'moment';

function TableService() {
  const [isMobile, setIsMobile] = useState(false);
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

  async function getTiket(isRework?: boolean, idModal?: number) {
    const url = `${import.meta.env.VITE_API_LINK}/ticket`;
    try {
      const res = await axios.get(url, {
        params: {
          bagian_tiket: 'service',
          page: page,
          limit: 10,
        },
        withCredentials: true,
      });

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
      console.log(error.response);
    }
  }

  async function reworkTiket(idTiket: number, iModal: number) {
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
      getTiket(true, iModal);
      openModal1(iModal);
    } catch (error: any) {
      console.log(error);
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

    const formattedDifference = `${hoursDiff ? hoursDiff + ' hours ' : ''}${
      hoursDiff >= 1 ? '' : minutesDiff + ' minutes '
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
  const [showModal4, setShowModal4] = useState(false);

  return (
    <main>
      <div className="flex justify-between items-center bg-white p-2">
        <div>
          <img
            onClick={() => setFilter(!filter)}
            src={Filter}
            alt=""
            className="mx-3 my-auto"
          />
          {filter == true ? (
            <div className="absolute rounded-md bg-white shadow-2xl md:w-96 w-11/12 p-2 -translate-x-2 md:-translate-y-6 -translate-y-32 border border-gray">
              <div className="flex justify-between">
                <img src={Filter} alt="" className="mx-3 my-auto" />
                <img
                  onClick={() => setFilter(!filter)}
                  src={X}
                  alt=""
                  className="mx-3 w-5 my-auto"
                />
              </div>
              <div className="mt-5 flex flex-col justify-center px-2">
                <p className="text-xs font-semibold">Nama Mesin</p>
                <div className="flex justify-center items-center">
                  <div className="relative z-20 border-2 border-[#EDEDED] shadow-md rounded-md dark:bg-form-input  w-full mt-2">
                    <span className="absolute top-1/2 left-4 z-30 -translate-y-1/2">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      ></svg>
                    </span>

                    <select
                      className={`relative font-medium z-20 w-full appearance-none rounded border border-stroke bg-transparent py-1   px-1 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-inputtext-black dark:text-white' 
                                            }`}
                    >
                      <option
                        value="d"
                        className="text-body dark:text-bodydark"
                      >
                        All
                      </option>
                      <option
                        value="N"
                        className="text-body dark:text-bodydark"
                      >
                        PON MANUAL 2
                      </option>
                      <option
                        value="O"
                        className="text-body dark:text-bodydark"
                      >
                        R700
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
              <div className="mt-5 flex flex-col justify-center px-2">
                <p className="text-xs font-semibold">Eksekutor</p>
                <div className="flex justify-center items-center">
                  <div className="relative z-20 border-2 border-[#EDEDED] shadow-md rounded-md dark:bg-form-input  w-full mt-2">
                    <span className="absolute top-1/2 left-4 z-30 -translate-y-1/2">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      ></svg>
                    </span>

                    <select
                      className={`relative font-medium z-20 w-full appearance-none rounded border border-stroke bg-transparent py-1   px-1 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-inputtext-black dark:text-white' 
                                            }`}
                    >
                      <option
                        value="d"
                        className="text-body dark:text-bodydark"
                      >
                        All
                      </option>
                      <option
                        value="N"
                        className="text-body dark:text-bodydark"
                      >
                        PON MANUAL 2
                      </option>
                      <option
                        value="O"
                        className="text-body dark:text-bodydark"
                      >
                        R700
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
              <div className="mt-5 flex flex-col justify-center px-2">
                <p className="text-xs font-semibold">Status</p>
                <div className="flex justify-center items-center">
                  <div className="relative z-20 border-2 border-[#EDEDED] shadow-md rounded-md dark:bg-form-input  w-full mt-2">
                    <span className="absolute top-1/2 left-4 z-30 -translate-y-1/2">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      ></svg>
                    </span>

                    <select
                      className={`relative font-medium z-20 w-full appearance-none rounded border border-stroke bg-transparent py-1   px-1 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-inputtext-black dark:text-white' 
                                            }`}
                    >
                      <option
                        value="d"
                        className="text-body dark:text-bodydark"
                      >
                        All
                      </option>
                      <option
                        value="N"
                        className="text-body dark:text-bodydark"
                      >
                        PON MANUAL 2
                      </option>
                      <option
                        value="O"
                        className="text-body dark:text-bodydark"
                      >
                        R700
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
              <div className="mt-5 flex flex-col justify-center px-2">
                <p className="text-xs font-semibold">Persentase</p>
                <div className="flex justify-center items-center">
                  <div className="relative z-20 border-2 border-[#EDEDED] shadow-md rounded-md dark:bg-form-input  w-full mt-2">
                    <span className="absolute top-1/2 left-4 z-30 -translate-y-1/2">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      ></svg>
                    </span>

                    <select
                      className={`relative font-medium z-20 w-full appearance-none rounded border border-stroke bg-transparent py-1   px-1 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-inputtext-black dark:text-white' 
                                            }`}
                    >
                      <option
                        value="d"
                        className="text-body dark:text-bodydark"
                      >
                        All
                      </option>
                      <option
                        value="N"
                        className="text-body dark:text-bodydark"
                      >
                        PON MANUAL 2
                      </option>
                      <option
                        value="O"
                        className="text-body dark:text-bodydark"
                      >
                        R700
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
              <div className="mt-5 flex flex-col justify-center px-2">
                <p className="text-xs font-semibold">Waktu Masuk</p>
                <div className="grid grid-cols-2 gap-5">
                  <div className="flex flex-col">
                    <p className="text-xs font-medium text-[#444444]">Dari:</p>
                    <div className="flex justify-center items-center">
                      <div className="relative z-20 border-2 border-[#EDEDED] shadow-md rounded-md dark:bg-form-input  w-full ">
                        <span className="absolute top-1/2 left-4 z-30 -translate-y-1/2">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          ></svg>
                        </span>

                        <select
                          className={`relative font-medium z-20 w-full appearance-none rounded border border-stroke bg-transparent py-1   px-1 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-inputtext-black dark:text-white' 
                                            }`}
                        >
                          <option
                            value="d"
                            className="text-body dark:text-bodydark"
                          >
                            All
                          </option>
                          <option
                            value="N"
                            className="text-body dark:text-bodydark"
                          >
                            PON MANUAL 2
                          </option>
                          <option
                            value="O"
                            className="text-body dark:text-bodydark"
                          >
                            R700
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
                  <div className="flex flex-col">
                    <p className="text-xs font-medium text-[#444444]">
                      Sampai:
                    </p>
                    <div className="flex justify-center items-center">
                      <div className="relative z-20 border-2 border-[#EDEDED] shadow-md rounded-md dark:bg-form-input  w-full ">
                        <span className="absolute top-1/2 left-4 z-30 -translate-y-1/2">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          ></svg>
                        </span>

                        <select
                          className={`relative font-medium z-20 w-full appearance-none rounded border border-stroke bg-transparent py-1   px-1 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-inputtext-black dark:text-white' 
                                            }`}
                        >
                          <option
                            value="d"
                            className="text-body dark:text-bodydark"
                          >
                            All
                          </option>
                          <option
                            value="N"
                            className="text-body dark:text-bodydark"
                          >
                            PON MANUAL 2
                          </option>
                          <option
                            value="O"
                            className="text-body dark:text-bodydark"
                          >
                            R700
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
                </div>
              </div>
              <div className="mt-5 flex flex-col justify-center px-2">
                <p className="text-xs font-semibold">Jenis Kendala</p>
                <div className="flex justify-center items-center">
                  <div className="relative z-20 border-2 border-[#EDEDED] shadow-md rounded-md dark:bg-form-input  w-full mt-2">
                    <span className="absolute top-1/2 left-4 z-30 -translate-y-1/2">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      ></svg>
                    </span>

                    <select
                      className={`relative font-medium z-20 w-full appearance-none rounded border border-stroke bg-transparent py-1   px-1 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-inputtext-black dark:text-white' 
                                            }`}
                    >
                      <option
                        value="d"
                        className="text-body dark:text-bodydark"
                      >
                        All
                      </option>
                      <option
                        value="N"
                        className="text-body dark:text-bodydark"
                      >
                        PON MANUAL 2
                      </option>
                      <option
                        value="O"
                        className="text-body dark:text-bodydark"
                      >
                        R700
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
              <div className="mt-5 flex flex-col justify-center px-2">
                <p className="text-xs font-semibold">Analisis Kendala</p>
                <div className="flex justify-center items-center">
                  <div className="relative z-20 border-2 border-[#EDEDED] shadow-md rounded-md dark:bg-form-input  w-full mt-2">
                    <span className="absolute top-1/2 left-4 z-30 -translate-y-1/2">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      ></svg>
                    </span>

                    <select
                      className={`relative font-medium z-20 w-full appearance-none rounded border border-stroke bg-transparent py-1   px-1 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-inputtext-black dark:text-white' 
                                            }`}
                    >
                      <option
                        value="d"
                        className="text-body dark:text-bodydark"
                      >
                        All
                      </option>
                      <option
                        value="N"
                        className="text-body dark:text-bodydark"
                      >
                        PON MANUAL 2
                      </option>
                      <option
                        value="O"
                        className="text-body dark:text-bodydark"
                      >
                        R700
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
              <div className="w-full flex justify-center mx-auto text-center">
                <button className="mt-5 text-white text-xs font-semibold rounded-md w-full bg-primary flex flex-col justify-center items-center px-2 py-2">
                  TERAPKAN
                </button>
              </div>
            </div>
          ) : (
            ''
          )}
        </div>
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
            <p className="w-10 px-3 text-xs font-bold ">No</p>
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
                <p className="text-xs font-bold ">Jadwal</p>
                <img className="w-2" src={Polygon6} alt="" />
              </div>
              <div className="flex gap-2  col-span-2">
                <p className="text-xs font-bold ">Action</p>
              </div>
            </div>
          </div>
          <div className=" overflow-x-auto z-10">
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

                  const waktumulaiJam = convertDateonly(data.waktu_mulai_mtc);
                  const waktumulaimtcDate = convertTimeOnly(
                    data.waktu_mulai_mtc,
                  );

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
                            className=" py-3 w-10 px-3 flex justify-center items-center"
                          >
                            {i + 1 + (page - 1) * 10}
                          </div>
                          <div className="grid md:grid-cols-8 grid-cols-7 w-full gap-5">
                            <div className="flex flex-col md:gap-5 gap-1 ">
                              <div className="my-auto ">
                                <p className="text-xs font-light">
                                  {data.kode_ticket}
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
                            <div className="flex flex-col col-span-2 md:gap-5 gap-1 ">
                              <div className="my-auto w-11/12">
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
                                      : data.status_tiket == 'requested'
                                      ? `text-xs px-2  font-light  rounded-xl flex justify-center text-[#DE0000] bg-[#FFB1B1] `
                                      : data.status_tiket == 'open'
                                      ? `text-xs px-2  font-light  rounded-xl flex justify-center text-[#DE0000] bg-[#FFB1B1] `
                                      : data.status_tiket == 'active'
                                      ? `text-xs px-2  font-light  rounded-xl flex justify-center text-[#004CDE] bg-[#B1ECFF] `
                                      : data.status_tiket == 'monitoring'
                                      ? `text-xs px-2  font-light  rounded-xl flex justify-center text-[#004CDE] bg-[#B1ECFF] `
                                      : data.status_tiket == 'temporary'
                                      ? `text-xs px-2  font-light  rounded-xl flex justify-center text-[#FCBF11] bg-[#FFF2B1]  `
                                      : ''
                                  }
                                >
                                  {data.status_tiket}{' '}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-col md:gap-5 gap-1 ">
                              <div>
                                <p className="text-xs font-light">
                                  {data.proses_mtcs[lengthProses].tgl_mtc}
                                </p>
                              </div>
                            </div>
                            <div className="flex col-span-2 gap-2 items-center md:mb-0 mb-2">
                              <div>
                                <div>
                                  {data.status_tiket == 'monitoring' ? (
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
                                              } else {
                                                reworkTiket(data.id, i);
                                                // ini untuk fungsi rework
                                              }
                                            }}
                                            className=" w-25 text-xs font-bold bg-blue-700 py-2 text-white rounded-md"
                                          >
                                            PROSES
                                          </button>
                                        )}
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
                                          skor_mtc={
                                            data.proses_mtcs[lengthProses]
                                              .skor_mtc
                                          }
                                        />
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
                                            <button className="w-full h-12 text-center text-white text-xs font-bold bg-blue-700 rounded-md">
                                              SERVICE
                                            </button>
                                          </div>
                                        </ModalMtcLightHeavy>
                                      )}
                                      {showModal4 && (
                                        <ModalMtcDate
                                          isOpen={showModal4}
                                          onClose={closeModal4}
                                          children={undefined}
                                          machineName={undefined}
                                        ></ModalMtcDate>
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
                              {/* <div>
                                <button className="text-xs font-bold text-white bg-blue-700 py-2 border-blue-700 border rounded-md w-20">
                                  Verify
                                </button>
                              </div> */}
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
                                            <div className="flex ">
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
                                              tgl={waktumulaimtcDate}
                                              jam={waktumulaiJam}
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
                                              catatan={proses.note_mtc}
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
          <div className="w-full flex justify-end z-0">
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
                <p className="text-xs font-bold ">Status</p>
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
                  data.createdAt,
                  data.waktu_respon,
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
                                  <>
                                    <button
                                      onClick={() => {
                                        if (data.status_tiket == 'open') {
                                          openModal1(i);
                                        } else {
                                          reworkTiket(data.id, i);
                                          // ini untuk fungsi rework
                                        }
                                      }}
                                      className=" w-25 text-xs font-bold bg-blue-700 py-2 text-white rounded-md"
                                    >
                                      PROSES
                                    </button>
                                    <button className=" w-25 text-xs font-bold bg-blue-700 py-2 text-white rounded-md">
                                      Verify
                                    </button>
                                  </>
                                )}
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
                                  idProses={data.proses_mtcs[lengthProses].id}
                                  namaMesin={data.mesin}
                                  skor_mtc={
                                    data.proses_mtcs[lengthProses].skor_mtc
                                  }
                                />
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
                                    <button className="w-full h-12 text-center text-white text-xs font-bold bg-blue-700 rounded-md">
                                      SERVICE
                                    </button>
                                  </div>
                                </ModalMtcLightHeavy>
                              )}
                              {showModal4 && (
                                <ModalMtcDate
                                  isOpen={showModal4}
                                  onClose={closeModal4}
                                  children={undefined}
                                  machineName={undefined}
                                ></ModalMtcDate>
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
                              : data.status_tiket == 'requested'
                              ? `text-xs px-2  font-light  rounded-xl flex justify-center text-[#DE0000] bg-[#FFB1B1] `
                              : data.status_tiket == 'open'
                              ? `text-xs px-2  font-light  rounded-xl flex justify-center text-[#DE0000] bg-[#FFB1B1] `
                              : data.status_tiket == 'active'
                              ? `text-xs px-2  font-light  rounded-xl flex justify-center text-[#004CDE] bg-[#B1ECFF] `
                              : data.status_tiket == 'monitoring'
                              ? `text-xs px-2  font-light  rounded-xl flex justify-center text-[#004CDE] bg-[#B1ECFF] `
                              : data.status_tiket == 'temporary'
                              ? `text-xs px-2  font-light  rounded-xl flex justify-center text-[#FCBF11] bg-[#FFF2B1]  `
                              : ''
                          }
                        >
                          {data.status_tiket}
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
                            <p className="text-xs font-medium"></p>
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
                                      : ''
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
                        </div>
                        <div className="w-full  bg-[#E9F3FF]  rounded-lg px-4 gap-y-3 mt-3 p-1">
                          {data.proses_mtcs.map((proses: any, ii: any) => {
                            const tglMulaiMtc = convertDatetimeToDate(
                              proses.waktu_mulai_mtc,
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
                                          kebutuhanSparepart={'undefined'}
                                          tipeMaintenance={
                                            proses.cara_perbaikan
                                          }
                                          catatan={proses.note_mtc}
                                        ></ModalDetail>
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
      )}
    </main>
  );
}

export default TableService;
