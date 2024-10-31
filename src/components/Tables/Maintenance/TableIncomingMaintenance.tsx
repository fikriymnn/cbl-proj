
import { useEffect, useState } from 'react';
import Arrow from '../../../images/icon/arrowDown.svg';
import axios from 'axios';

import Loading from '../../Loading';
import Stack from '@mui/material/Stack';
import Pagination from '@mui/material/Pagination';

const tiket = [
  {
    name: 'EX000003',
    date: '12/22/24 07:00UTC',
    machine: 'R700',
    problem: 'Problem settingan mesin',
    status: 'pending',
    schedule: 'unscheduled',
    action: 'request mtc',
  },
  {
    name: 'EX000003',
    date: '12/22/24 07:00UTC',
    machine: 'R700',
    problem: 'Problem settingan mesin',
    status: 'pending',
    schedule: 'schedule requested',
    action: 'detail',
  },
  {
    name: 'EX000003',
    date: '12/22/24 07:00UTC',
    machine: 'R700',
    problem: 'Problem settingan mesin',
    status: 'pending',
    schedule: ['schedule declined', '12/04/24 to 24/04/24'],
    action: 3.7,
    idResponser: '1313jn',
  },
  {
    name: 'EX000003',
    date: '12/22/24 07:00UTC',
    machine: 'R700',
    problem: 'Problem settingan mesin',
    status: 'pending',
    schedule: ['schedule declined', '12/04/24 to 24/04/24'],
    action: 3.7,
    idResponser: '1313jn',
  },
  {
    name: 'EX000003',
    date: '12/22/24 07:00UTC',
    machine: 'R700',
    problem: 'Problem settingan mesin',
    status: 'pending',
    schedule: ['schedule declined', '12/04/24 to 24/04/24'],
    action: 3.7,
    idResponser: '1313jn',
  },
  {
    name: 'EX000003',
    date: '12/22/24 07:00UTC',
    machine: 'R700',
    problem: 'Problem settingan mesin',
    status: 'pending',
    schedule: ['schedule declined', '12/04/24 to 24/04/24'],
    action: 3.7,
    idResponser: '1313jn',
  },
];

const TableIncomingMaintenance = () => {
  const [showModal2, setShowModal2] = useState(false);
  const [page, setPage] = useState(1);

  //const openModal2 = () => setShowModal2(true);
  //const closeModal2 = () => setShowModal2(false);

  const [showTwoButtons, setShowTwoButtons] = useState<boolean[]>(
    new Array(tiket.length).fill(false),
  );
  const [showDetail, setShowDetail] = useState<boolean[]>(
    new Array(tiket.length).fill(false),
  );
  const handleClick = (index: number) => {
    setShowTwoButtons((prevState) => {
      const updatedShowTwoButtons = [...prevState]; // Create a copy
      updatedShowTwoButtons[index] = !updatedShowTwoButtons[index]; // Toggle value
      // Reset showTwoButtons for all other rows
      for (let i = 0; i < updatedShowTwoButtons.length; i++) {
        if (i !== index) {
          updatedShowTwoButtons[i] = false;
        }
      }
      return updatedShowTwoButtons;
    });
  };
  const handleClickDetail = (index: number) => {
    setShowDetail((prevState) => {
      const updatedShowDetail = [...prevState]; // Create a copy
      updatedShowDetail[index] = !updatedShowDetail[index]; // Toggle value
      return updatedShowDetail;
    });
  };

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

  const [mtc, setMtc] = useState<any>(null);

  const [showModal3, setShowModal3] = useState<any>([]);

  const openModal2 = (i: any) => {
    const onchangeVal: any = [...showModal3];
    onchangeVal[i] = true;
    console.log(onchangeVal);
    setShowModal3(onchangeVal);
  };
  const closeModal2 = (i: any) => {
    const onchangeVal: any = [...showModal3];
    onchangeVal[i] = false;

    setShowModal3(onchangeVal);
  };

  const [showModal1, setShowModal1] = useState<any>([]);

  const openModal1 = (i: any) => {
    const onchangeVal: any = [...showModal1];
    onchangeVal[i] = true;
    console.log(onchangeVal);
    setShowModal1(onchangeVal);
  };
  const closeModal1 = (i: any) => {
    const onchangeVal: any = [...showModal1];
    onchangeVal[i] = false;

    setShowModal1(onchangeVal);
  };

  useEffect(() => {
    getMTC();
  }, []);

  async function getMTC() {
    const url = `${import.meta.env.VITE_API_LINK}/ticket?bagian_tiket=incoming`;
    try {
      const res = await axios.get(url, {
        params: {
          page: 1,
          limit: 10,
        },
        withCredentials: true,
      });

      setMtc(res.data);

      console.log(res.data);
      let data: any[] = [];
      for (let i = 0; i < res.data.data.length; i++) {
        data.push(false);
      }
      setShowModal3(data);
      setShowModal1(data);
    } catch (error: any) {
      console.log(error.response);
    }
  }

  const [isLoading, setIsLoading] = useState(false);

  async function responMTC(id: number, indexModal: any) {
    const url = `${import.meta.env.VITE_API_LINK}/ticket/respon/${id}`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        withCredentials: true,
      });
      setIsLoading(false);
      // alert('respon berhasil');
      getMTC();
    } catch (error: any) {
      console.log(error.response);
      alert('error');
      setIsLoading(false);
    }
  }
  return (
    <div className="overflow-x-scroll">
      {!isMobile && (
        <>
          <div className="rounded-b-xl lg:min-w-[700px]  border border-stroke bg-white  pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark  xl:pb-1">
            <div className="flex flex-col">
              <div className="flex   border-[#D8EAFF] dark:border-strokedark ">
                <div className=" flex items-center  w-1/12 gap-3 p-2.5 md:px-7.5 px-5 ">
                  <p className=" md:text-[12px] text-[10px] text-slate-600 font-semibold dark:text-white sm:block">
                    No
                  </p>
                </div>

                <div className=" flex items-center w-2/12 justify-center">
                  <p className="text-slate-600 md:text-[12px] text-[10px] font-semibold text-center dark:text-white">
                    Kode Tiket
                  </p>
                </div>
                <div className=" flex items-center md:text-[12px] text-[10px] w-3/12 ml-4 justify-center p-2.5 md:px-7.5 px-5 ">
                  <p className="text-slate-600 font-semibold text-center dark:text-white">
                    Waktu Masuk
                  </p>
                </div>

                <div className=" flex items-center md:text-[12px] text-[10px] w-4/12 ml-4 justify-center p-2.5 md:px-7.5 px-5 ">
                  <p className="text-slate-600 font-semibold text-center">
                    Nama Mesin
                  </p>
                </div>
                <div className=" flex items-center md:text-[12px] text-[10px] w-4/12 mr-2 justify-center p-2.5 md:px-7.5 px-5 ">
                  <p className="text-slate-600 font-semibold text-center">
                    Kendala
                  </p>
                </div>

                <div className=" items-center justify-center  md:w-5/12 w-2/12 p-2.5 md:px-7.5 px-5 flex ">
                  <p className="text-slate-600 md:text-[12px] text-[10px] font-semibold text-center"></p>
                </div>
              </div>
              <>
                {mtc != null &&
                  mtc.data.map((brand: any, key: any) => {
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

                    const tiketMasuk = convertDatetimeToDate(brand.createdAt);

                    return (
                      <div
                        className={`flex ${'border-t-8  border-[#D8EAFF] dark:border-strokedark '}`}
                        key={key}
                      >
                        <div className=" flex items-center w-1/12   gap-3 p-2.5 md:px-7.5 px-5 border-b-[#D8EAFF]  ">
                          <p className=" md:text-[12px] text-[10px] text-black dark:text-white block">
                            {key + 1}
                          </p>
                        </div>

                        <div className=" flex items-center w-2/12 justify-center border-b-[#D8EAFF] ">
                          <p className="text-black text-center md:text-[12px] text-[10px] dark:text-white break-all">
                            {brand.kode_ticket}
                          </p>
                        </div>
                        <div className=" flex items-center w-3/12 justify-center p-2.5 md:px-7.5 px-5 border-b-[#D8EAFF] ">
                          <p className="text-black text-center md:text-[12px] text-[10px] dark:text-white">
                            {tiketMasuk}
                          </p>
                        </div>

                        <div className=" flex items-center w-4/12 justify-center p-2.5 md:px-7.5 px-5 border-b-[#D8EAFF] ">
                          <p className="text-black text-center md:text-[12px] text-[10px]">
                            {brand.mesin}
                          </p>
                        </div>
                        <div className=" flex items-center w-3/12 justify-center p-2.5 md:px-7.5 px-5 border-b-[#D8EAFF] ">
                          <p className="text-black text-center md:text-[12px] text-[10px] dark:text-white">
                            {brand.nama_kendala}
                          </p>
                        </div>

                        <div className=" items-center justify-center md:w-5/12 w-2/12 p-2.5 md:px-7.5 px-5 border-b-[#D8EAFF] flex ">
                          <td className=" border-[#eee]   dark:border-strokedark">
                            <div className=" mx-auto flex gap-3">
                              <button
                                type="button"
                                disabled={isLoading}
                                onClick={() => responMTC(brand.id, key)}
                                className={`inline-flex py-2 rounded-[3px] my-auto  md:px-5 px-1 md:text-[12px] text-[10px] sm:font-semibold bg-[#0065DE] text-white hover:bg-[#234a79] justify-center`}
                              >
                                {isLoading ? 'Loading...' : 'RESPON'}
                              </button>
                              {isLoading && <Loading />}
                              {/* <button
                                type="button"
                                // onClick={() => openModal1(key)}
                                className={`inline-flex py-2 rounded-[3px] my-auto  md:px-5 px-1 md:text-[12px] text-[10px] sm:font-semibold bg-white border-[#0065DE] border text-primary justify-center`}
                              >
                                DETAIL
                              </button> */}

                              {/* <button type="button" onClick={openModal1}
                        className={`inline-flex rounded-[3px] my-auto py-2 md:px-2 px-1 md:text-[12px] text-[10px] font-semibold bg-white border-[#0065DE] border text-primary justify-center items-center  `}
                      >
                        DETAIL
                      </button> */}
                              {/* {showModal1[key] == true && (
                                <Modal
                                  isOpen={showModal1[key]}
                                  onClose={() => closeModal1(key)}
                                  ticketCode={''}
                                  incDate={brand.createdAt}
                                  namaMesin={brand.mesin}
                                  jenisKendala={brand.jenis_kendala}
                                  kendala={brand.nama_kendala}
                                >
                                  <p></p>
                                </Modal>
                              )} */}

                              {/* {showModal3[key] == true && (
                                <ModalKonfirmasi
                                  isOpen={showModal3[key]}
                                  onClose={() => closeModal2(key)}
                                >
                                  <>
                                    <div className="flex w-full justify-center items-center pt-3">
                                      <label className="text-neutral-500 text-xl font-normal ">
                                        Apa anda yakin untuk merespon tiket ini?
                                      </label>
                                    </div>
                                    <div className="flex w-full gap-3 pt-3">
                                      <button
                                        onClick={() => responMTC(brand.id, key)}
                                        className="w-full h-9 text-center text-white text-xs font-bold bg-blue-700 rounded-md"
                                      >
                                        RESPON
                                      </button>
                                    </div>
                                  </>
                                </ModalKonfirmasi>
                              )} */}
                            </div>
                          </td>
                        </div>
                      </div>
                    );
                  })}
              </>
            </div>
          </div>
        </>
      )}

      {isMobile && (
        <>
          <div className="rounded-b-xl   border border-stroke bg-white  pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark  xl:pb-1">
            <div className="flex flex-col">
              <div className="flex border-b-8  border-[#D8EAFF] dark:border-strokedark ">
                <div className="flex w-5/12"></div>

                <div className=" flex items-center w-5/12 justify-center p-2.5 md:px-7.5 px-5 ">
                  <p className="text-slate-600 md:text-[12px] text-[10px] font-semibold text-center dark:text-white">
                    Kode Tiket
                  </p>
                </div>
                <div className=" flex items-center md:text-[12px] text-[10px] w-7/12 justify-start p-2.5 md:px-7.5 px-5 ">
                  <p className="text-slate-600 font-semibold text-center dark:text-white">
                    Waktu Masuk
                  </p>
                </div>
              </div>
              <>
                {mtc != null &&
                  mtc.data.map((brand: any, key: any) => {
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

                    const tiketMasuk = convertDatetimeToDate(brand.createdAt);

                    return (
                      <div className="">
                        <div className="w-full">
                          <div
                            className={`flex ${key === tiket.length - 1 ? '' : ' '
                              }`}
                            key={key}
                          >
                            <div className="flex justify-center items-center pl-2 py-2">
                              <button
                                title="button"
                                onClick={() => handleClickDetail(key)}
                                className="h-14 w-8 text-xs font-bold text-blue-700 bg-blue-700  border-blue-700 border rounded-[4px]"
                              >
                                <img src={Arrow} alt="" className="mx-2 py-1" />
                              </button>
                            </div>

                            <div className=" flex flex-wrap  w-4/12  border-b-[#D8EAFF] px-2 gap-1  py-2">
                              <button
                                type="button"
                                disabled={isLoading}
                                onClick={() => responMTC(brand.id, key)}
                                className={`inline-flex py-[6px] rounded-[3px] my-auto  md:px-5 px-1 md:text-[12px] text-[10px] sm:font-semibold bg-[#0065DE] text-white hover:bg-[#234a79] justify-center`}
                              >
                                {isLoading ? 'Loading...' : 'RESPON'}
                              </button>
                              {isLoading && <Loading />}
                              {/* <button
                              type="button"
                              // onClick={() => openModal1(key)}
                              className={`inline-flex py-1 rounded-[3px] my-auto  md:px-5 px-2 md:text-[12px] text-[10px] sm:font-semibold bg-white border-[#0065DE] border text-primary justify-center`}
                            >
                              DETAIL
                            </button> */}
                            </div>

                            <div className=" flex items-center w-6/12 justify-center  border-b-[#D8EAFF] ">
                              <p className="text-black text-center md:text-[12px] text-[10px] dark:text-white">
                                {brand.kode_ticket}
                              </p>
                            </div>
                            <div className=" flex items-center w-5/12 justify-center p-2.5 md:px-7.5 px-5 border-b-[#D8EAFF] ">
                              <p className="text-black text-center md:text-[12px] text-[10px] dark:text-white">
                                {tiketMasuk}
                              </p>
                            </div>

                            <div className=" items-center justify-center md:w-5/12 w-2/12 p-2.5 md:px-7.5 px-5 border-b-[#D8EAFF] flex ">
                              <td className=" border-[#eee]   dark:border-strokedark">
                                {/* {showModal1[key] == true && (
                                <Modal
                                  isOpen={showModal1[key]}
                                  onClose={() => closeModal1(key)}
                                  ticketCode={''}
                                  incDate={brand.createdAt}
                                  namaMesin={brand.mesin}
                                  jenisKendala={brand.jenis_kendala}
                                  kendala={brand.nama_kendala}
                                >
                                  <p></p>
                                </Modal>
                              )} */}

                                {showModal2 && <></>}
                              </td>
                            </div>
                          </div>
                        </div>
                        <div className="flex w-full border-b-6  border-[#D8EAFF] dark:border-strokedark">
                          {showDetail[key] && (
                            <div className="w-full  bg-[#E9F3FF]  rounded-b-md py-2 px-4">
                              <div className="flex w-full">
                                <div className="flex w-full">
                                  <div className="flex w-6/12 flex-col">
                                    <p className="text-xs font-bold">
                                      Nama Mesin
                                    </p>
                                    <p className="text-sm font-light">
                                      {brand.mesin}
                                    </p>
                                  </div>
                                  <div className="flex w-6/12 flex-col">
                                    <p className="text-xs font-bold">Kendala</p>
                                    <p className="text-sm font-light">
                                      {brand.nama_kendala}
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
              </>
            </div>
          </div>
        </>
      )}
      <div className="w-full flex justify-end mt-5 ">
              <Stack spacing={2}>
                <Pagination
                  count={mtc?.total_page}
                  color="primary"
                  onChange={(e, i) => {
                    setPage(i);
                    console.log(i);
                  }}
                />
              </Stack>
            </div>
    </div>
  );
};

export default TableIncomingMaintenance;
