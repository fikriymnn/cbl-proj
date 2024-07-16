import React, { useEffect, useState } from 'react';
import Filter from '../../../../images/icon/filter.svg';
import Burger from '../../../../images/icon/burger.svg';
import Arrow from '../../../../images/icon/arrowDown.svg';
import Polygon6 from '../../../../images/icon/Polygon6.svg';
import ModalSPBService from '../../../Modals/ModalNewSPBService';
import axios from 'axios';
import convertTimeStampToDate from '../../../../utils/convertDate';
import MonitoringSPB from '../../../Modals/MonitoringSPB';
import ModalPM2Eksekutor from '../../../Modals/ModalPM2Eksekutor';
import ModalEditSPB from '../../../Modals/ModalEditSPB';
import ModalNoteSPB from '../../../Modals/ModalNoteSPB';
import Stack from '@mui/material/Stack';
import Pagination from '@mui/material/Pagination';

function TableSPBRequested() {
  const [page, setPage] = useState(1);
  const [showModalSPBBaru, setShowModalSPBBaru] = useState(false);

  const openModalSPBBaru = () => setShowModalSPBBaru(true);
  const closeModalSPBBaru = () => setShowModalSPBBaru(false);

  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  const date = today.getDate();
  const currentDate = date + '/' + month + '/' + year;

  const [isMobile, setIsMobile] = useState(false);
  const [openButton, setOpenButton] = useState(null);
  const [showModalMonitoring, setShowModalMonitoring] = useState(null);
  const [showModalEdit, setShowModalEdit] = useState(null);
  const [showModalCatatan, setShowModalCatatan] = useState(null);
  const [showModalTolak, setShowModalTolak] = useState(null);

  const handleClick = (index: any) => {
    setOpenButton((prevState: any) => {
      return prevState === index ? null : index;
    });
  };
  const handleClickMonitoring = (index: any) => {
    setShowModalMonitoring((prevState: any) => {
      return prevState === index ? null : index;
    });
  };
  const handleClickCatatan = (index: any) => {
    setShowModalCatatan((prevState: any) => {
      return prevState === index ? null : index;
    });
  };
  const handleClickTolak = (index: any) => {
    setShowModalTolak((prevState: any) => {
      return prevState === index ? null : index;
    });
  };
  const handleClickEdit = (index: any) => {
    setShowModalEdit((prevState: any) => {
      return prevState === index ? null : index;
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

  const [showDetailMobile, setShowDetailMobile] = useState<boolean>();

  useEffect(() => {
    getSpbService();
    getSpbServicePurchase();
  }, [page]);

  const [spbService, setSpbService] = useState<any>();

  async function getSpbService() {
    const url = `${import.meta.env.VITE_API_LINK}/spbServiceSparepart`;
    try {
      const res = await axios.get(url, {
        params: {
          page: page,
          limit: 10,
        },
        withCredentials: true,
      });

      setSpbService(res.data);
      console.log(res.data);

      // let data: any[] = [];
      // for (let i = 0; i < res.data.data.length; i++) {
      //   data.push(false);
      // }
      //   setShowModal1(data);
      //   setShowModalDetail(data);
      //   setShowTwoButtons(data);
      //   setShowTwoButtonsMobile(data);
    } catch (error: any) {
      console.log(error.response);
    }
  }

  const closeModalMonitoring = () => setShowModalMonitoring(null);
  const closeModalEdit = () => setShowModalEdit(null);
  const closeModalCatatan = () => setShowModalCatatan(null);
  const closeModalTolak = () => setShowModalTolak(null);

  //ini untuk purchase sementara
  const [page2, setPage2] = useState(1);
  const [spbServicePurchase, setSpbServicePurchase] = useState<any>();
  const [statusPengajuan, setStatusPengajuan] = useState<any>();
  const [openButtonPurchase, setOpenButtonPurchase] = useState(null);
  const [showModalMonitoringPurchase, setShowModalMonitoringPurchase] =
    useState(null);
  const [showModalEditPurchase, setShowModalEditPurchase] = useState(null);

  const handleClickPurchase = (index: any) => {
    setOpenButtonPurchase((prevState: any) => {
      return prevState === index ? null : index;
    });
  };

  const handleClickMonitoringPurchase = (index: any) => {
    setShowModalMonitoringPurchase((prevState: any) => {
      return prevState === index ? null : index;
    });
  };

  const handleClickEditPurchase = (index: any) => {
    setShowModalEditPurchase((prevState: any) => {
      return prevState === index ? null : index;
    });
  };

  const closeModalMonitoringPurchase = () =>
    setShowModalMonitoringPurchase(null);
  const closeModalEditPurchase = () => setShowModalEditPurchase(null);

  async function getSpbServicePurchase() {
    const url = `${import.meta.env.VITE_API_LINK}/spbServiceSparepartPurchase`;
    try {
      const res = await axios.get(url, {
        params: {
          page: page2,
          limit: 10,
        },
        withCredentials: true,
      });

      setSpbServicePurchase(res.data);
      console.log(res.data);
    } catch (error: any) {
      console.log(error.response);
    }
  }

  async function updatePurchase(id: number) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/spbServiceSparepartMonitoring/${id}`;
    try {
      const res = await axios.put(
        url,
        {
          status_pengajuan: statusPengajuan,
        },
        {
          withCredentials: true,
        },
      );

      alert('success');
      getSpbService();
      getSpbServicePurchase();
    } catch (error: any) {
      console.log(error.response);
    }
  }

  async function donePurchase(id: number) {
    const url = `${import.meta.env.VITE_API_LINK}/doneSpbServicePurchase/${id}`;
    try {
      const res = await axios.put(
        url,
        {},
        {
          withCredentials: true,
        },
      );

      alert('success');
      getSpbService();
      getSpbServicePurchase();
    } catch (error: any) {
      console.log(error.response);
    }
  }

  return (
    <main>
      {!isMobile && (
        <>
          <div>
            <div className="flex flex-row items-center bg-white p-2">
              <div className="flex w-6/12">
                <img src={Filter} alt="" className="mx-3 my-auto" />
              </div>
              <div className="flex flex-row w-6/12 justify-end">
                <input
                  type="search"
                  placeholder="search"
                  name=""
                  id=""
                  className="md:w-[330px] w-40 mx-3 px-3 bg-[#E9F3FF] rounded-md"
                />
                <button
                  onClick={openModalSPBBaru}
                  className="bg-green-600 rounded-md text-white text-xs font-semibold px-10"
                >
                  SPB BARU
                </button>
                {showModalSPBBaru && (
                  <>
                    <ModalSPBService
                      isOpen={showModalSPBBaru}
                      onClose={closeModalSPBBaru}
                      noSPB={'MT-0201'}
                      tglSpb={currentDate}
                      sumber={'kebutuhan'}
                      data={undefined}
                      onFinish={getSpbService}
                      idProses={undefined}
                    >
                      <p></p>
                    </ModalSPBService>
                  </>
                )}
              </div>
            </div>
            <div className="flex bg-white mt-2 py-2">
              <p className="w-10 px-3 text-stone-500 text-xs font-bold ">No</p>
              <div className="grid  grid-cols-8 w-full">
                <div className="flex gap-2">
                  <p className="text-stone-500 text-xs font-bold ">No. SPB</p>
                  <img className="w-2" src={Polygon6} alt="" />
                </div>
                <div className="flex gap-2">
                  <p className="text-stone-500 text-xs font-bold ">
                    Tanggal SPB
                  </p>
                  <img className="w-2" src={Polygon6} alt="" />
                </div>
                <div className="flex gap-2">
                  <p className="text-stone-500 text-xs font-bold ">
                    Nama Barang
                  </p>
                  <img className="w-2" src={Polygon6} alt="" />
                </div>
                <div className="flex gap-2">
                  <p className="text-stone-500 text-xs font-bold ">Kode Part</p>
                  <img className="w-2" src={Polygon6} alt="" />
                </div>
                <div className="flex gap-2 col-span-2">
                  <p className="text-stone-500 text-xs font-bold ">Status</p>
                  <img className="w-2" src={Polygon6} alt="" />
                </div>
                <div className="flex gap-2">
                  <p className="text-stone-500 text-xs font-bold ">Tanggal</p>
                  <img className="w-2" src={Polygon6} alt="" />
                </div>
                <div className="flex gap-2 justify-end pr-8">
                  <p className="text-stone-500 text-xs font-bold ">Action</p>
                </div>
              </div>
            </div>
            {spbService?.data.map((data: any, index: number) => {
              const tglSpb = convertTimeStampToDate(data.tgl_spb);
              const tglPermintaanKedatangan = convertTimeStampToDate(
                data.tgl_permintaan_kedatangan,
              );
              return (
                <div key={index} className=" overflow-x-auto">
                  <div className="min-w-[700px] ">
                    <div className="my-2 ">
                      <section className="flex  bg-white  rounded-md px-1 py-2">
                        <p className="w-10 px-3 text-stone-500 pt-2 text-xs font-bold  items-center">
                          {index + 1}
                        </p>
                        <div className="grid  grid-cols-8 w-full  items-center">
                          <div className="flex gap-2">
                            <p className="text-neutral-500 text-sm font-light line-clamp-1 ">
                              {data.no_spb}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <p className="text-neutral-500 text-sm font-light line-clamp-1">
                              {tglSpb}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <p className="text-neutral-500 text-sm font-light line-clamp-1">
                              {data.master_part.nama_sparepart}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <p className="text-neutral-500 text-sm font-light line-clamp-1">
                              {data.master_part.kode}
                            </p>
                          </div>
                          <div className="flex gap-2 col-span-2">
                            <p
                              className={
                                data.status_pengajuan ==
                                  'section head approval' ||
                                data.status_pengajuan ==
                                  'section head verifikasi'
                                  ? 'text-white bg-green-600  px-2 rounded-2xl text-sm font-light line-clamp-1'
                                  : 'text-white bg-yellow-600  px-2 rounded-2xl text-sm font-light line-clamp-1'
                              }
                            >
                              {data.status_pengajuan}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <p className="text-neutral-500 text-sm font-light line-clamp-1">
                              {tglPermintaanKedatangan}
                            </p>
                          </div>
                          <div className="flex gap-2 justify-end pr-8">
                            <button
                              onClick={() => handleClick(index)}
                              className="px-4 py-2 bg-[#0065DE] rounded-md"
                            >
                              <svg
                                width="4"
                                height="11"
                                viewBox="0 0 4 11"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <rect width="4" height="1.90909" fill="white" />
                                <rect
                                  y="4.45312"
                                  width="4"
                                  height="1.90909"
                                  fill="white"
                                />
                                <rect
                                  y="8.9082"
                                  width="4"
                                  height="1.90909"
                                  fill="white"
                                />
                              </svg>
                            </button>
                            {openButton == index ? (
                              <>
                                <div className="absolute bg-white mt-10 p-1 shadow-5 rounded-md">
                                  <div className="flex flex-col gap-1">
                                    <button
                                      onClick={() => handleClickCatatan(index)}
                                      className="w-25 text-xs font-bold bg-blue-700 py-2 text-white rounded-md"
                                    >
                                      Setujui{' '}
                                    </button>
                                    <button
                                      onClick={() => handleClickTolak(index)}
                                      className="w-25 text-xs font-bold bg-red-600 py-2 text-white rounded-md"
                                    >
                                      Tolak{' '}
                                    </button>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <></>
                            )}
                            <button
                              onClick={() => handleClickMonitoring(index)}
                              className="px-3 py-3 bg-[#0065DE] rounded-md"
                            >
                              <svg
                                width="15"
                                height="10"
                                viewBox="0 0 15 10"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M14 9L7.64444 2L1 9"
                                  stroke="white"
                                  stroke-width="2.5"
                                />
                              </svg>
                            </button>
                            {showModalMonitoring == index ? (
                              <MonitoringSPB
                                isOpen={showModalMonitoring}
                                onClose={closeModalMonitoring}
                                status={data.status_pengajuan}
                                waktu_tiket_masuk={tglSpb}
                                pelapor={data.pelapor.nama}
                                kode_part={data.master_part.kode}
                                nama_barang={data.master_part.nama_sparepart}
                                mesin={data.master_part.mesin.nama_mesin}
                                qty={data.qty}
                                tanggal_estimasi={tglPermintaanKedatangan}
                                catatan={data.note}
                              >
                                <button
                                  onClick={() => handleClickEdit(index)}
                                  className="w-full justify-center text-center rounded md bg-blue-600 text-white font-semibold py-2"
                                >
                                  Edit SPB
                                </button>
                              </MonitoringSPB>
                            ) : (
                              <></>
                            )}
                          </div>
                          {showModalEdit == index ? (
                            <ModalEditSPB
                              isOpen={showModalEdit}
                              onClose={closeModalEdit}
                              onFinish={getSpbService}
                              data={data}
                            >
                              <p></p>
                            </ModalEditSPB>
                          ) : (
                            ''
                          )}
                          {showModalCatatan == index && (
                            <>
                              <ModalNoteSPB
                                isOpen={showModalCatatan}
                                onClose={closeModalCatatan}
                                onFinish={getSpbService}
                                isApprove={true}
                                isValidate={
                                  data.status_pengajuan ==
                                  'section head approval'
                                    ? true
                                    : false
                                }
                                data={data}
                              ></ModalNoteSPB>
                            </>
                          )}
                          {showModalTolak == index && (
                            <>
                              <ModalNoteSPB
                                isOpen={showModalTolak}
                                onClose={closeModalTolak}
                                onFinish={getSpbService}
                                isApprove={false}
                                isValidate={
                                  data.status_pengajuan ==
                                  'section head approval'
                                    ? true
                                    : false
                                }
                                data={data}
                              ></ModalNoteSPB>
                            </>
                          )}
                        </div>
                      </section>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
      {isMobile && (
        <>
          <div>
            <div className="flex flex-col gap-2 items-center bg-white p-2">
              <div className="flex flex-row w-full justify-end">
                <input
                  type="search"
                  placeholder="search"
                  name=""
                  id=""
                  className=" mx-3 px-3 bg-[#E9F3FF] rounded-md"
                />
                <button
                  onClick={openModalSPBBaru}
                  className="bg-green-600 rounded-md text-white text-xs font-semibold px-10"
                >
                  SPB BARU
                </button>
                {showModalSPBBaru && (
                  <ModalSPBService
                    isOpen={showModalSPBBaru}
                    onClose={closeModalSPBBaru}
                    noSPB={'MT-0001'}
                    tglSpb={'20 MEI 2024'}
                    sumber={'kebutuhan'}
                    data={undefined}
                    onFinish={getSpbService}
                    idProses={undefined}
                  >
                    <p></p>
                  </ModalSPBService>
                )}
              </div>
              <div className="flex w-full">
                <img src={Filter} alt="" className="mx-3 my-auto" />
              </div>
            </div>
            <div className="flex bg-white mt-2 py-2 px-2">
              <div className="flex gap-2 w-full">
                <div className="flex  w-2/12 ">
                  <p className="text-xs font-bold "> Mesin</p>
                  <img className="w-2" src={Polygon6} alt="" />
                </div>
                <div className="flex  w-5/12 ">
                  <p className="text-xs font-bold "> Nama Barang</p>
                  <img className="w-2" src={Polygon6} alt="" />
                </div>
                <div className="flex  w-2/12 ">
                  <p className="text-xs font-bold ">Status</p>
                  <img className="w-2" src={Polygon6} alt="" />
                </div>
                <div className="flex  w-2/12 ">
                  <p className="text-xs font-bold ">Action</p>
                  <img className="w-2" src={Polygon6} alt="" />
                </div>
              </div>
            </div>
            <div className=" overflow-x-auto">
              {spbService?.data.map((data: any, index: number) => {
                const tglSpb = convertTimeStampToDate(data.tgl_spb);
                const tglPermintaanKedatangan = convertTimeStampToDate(
                  data.tgl_permintaan_kedatangan,
                );
                return (
                  <>
                    <div className="">
                      <div className="my-2 ">
                        <section className="flex flex-col bg-white  justify-center items-center  rounded-lg px-2">
                          <div className="flex w-full py-3 gap-1  justify-center items-center">
                            <div className="flex  w-2/12   justify-center items-center">
                              <p className="text-neutral-500 text-xs font-light">
                                {data.master_part.nama_mesin}
                              </p>
                            </div>
                            <div className="flex  w-5/12 ">
                              <p className="text-neutral-500 text-xs font-light w-10/12">
                                {data.master_part.nama_sparepart}
                              </p>
                            </div>
                            <div className="flex  w-3/12 justify-center items-center ">
                              <p
                                className={
                                  data.status_pengajuan ==
                                    'section head approval' ||
                                  data.status_pengajuan ==
                                    'section head verifikasi'
                                    ? 'text-white bg-green-600  px-2 py-1 rounded-md text-[9px] font-light text-center leading-[9px]'
                                    : 'text-white bg-yellow-600  px-2 py-1 rounded-md text-[9px] font-light text-center leading-[9px]'
                                }
                              >
                                {data.status_pengajuan}
                              </p>
                            </div>
                            <div className="flex gap-2 justify-center  items-center">
                              <div>
                                <button
                                  title="button"
                                  onClick={() => handleClick(index)}
                                  className="text-xs px-1  py-2 font-bold bg-blue-700  text-white rounded-sm"
                                >
                                  <img src={Burger} alt="" className="mx-1" />
                                </button>
                              </div>

                              <div className="flex flex-col items-center justify-center">
                                <button
                                  title="button"
                                  onClick={() => handleClickMonitoring(index)}
                                  className="text-xs  h-6 font-bold text-blue-700 bg-blue-700  border-blue-700 border rounded-sm"
                                >
                                  <img src={Arrow} alt="" className="mx-1" />
                                </button>
                              </div>
                              {openButton == index ? (
                                <>
                                  <div className="absolute bg-white mt-20 -translate-x-10 p-1 shadow-5 rounded-md">
                                    <div className="flex flex-col gap-1">
                                      <button
                                        onClick={() =>
                                          handleClickCatatan(index)
                                        }
                                        className="w-25 text-xs font-bold bg-blue-700 py-2 text-white rounded-md"
                                      >
                                        Setujui{' '}
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleClickCatatan(index)
                                        }
                                        className="w-25 text-xs font-bold bg-red-600 py-2 text-white rounded-md"
                                      >
                                        Tolak{' '}
                                      </button>
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <></>
                              )}
                              {showModalMonitoring == index ? (
                                <div className="">
                                  <MonitoringSPB
                                    isOpen={showModalMonitoring}
                                    onClose={closeModalMonitoring}
                                    status={data.status_pengajuan}
                                    waktu_tiket_masuk={tglSpb}
                                    pelapor={data.pelapor.nama}
                                    kode_part={data.master_part.kode}
                                    nama_barang={
                                      data.master_part.nama_sparepart
                                    }
                                    mesin={data.master_part.mesin.nama_mesin}
                                    qty={data.qty}
                                    tanggal_estimasi={tglPermintaanKedatangan}
                                    catatan={data.note}
                                  >
                                    <button
                                      onClick={() => handleClickEdit(index)}
                                      className="w-full justify-center text-center rounded md bg-blue-600 text-white font-semibold py-2"
                                    >
                                      Edit SPB
                                    </button>
                                  </MonitoringSPB>
                                </div>
                              ) : (
                                <></>
                              )}
                              {showModalEdit == index && (
                                <ModalEditSPB
                                  isOpen={showModalEdit}
                                  onClose={closeModalEdit}
                                  onFinish={getSpbService}
                                  data={data}
                                >
                                  <p></p>
                                </ModalEditSPB>
                              )}
                              {showModalCatatan == index ? (
                                <>
                                  <ModalNoteSPB
                                    isOpen={showModalCatatan}
                                    onClose={closeModalCatatan}
                                    onFinish={getSpbService}
                                    isApprove={true}
                                    isValidate={
                                      data.status_pengajuan ==
                                      'section head approval'
                                        ? true
                                        : false
                                    }
                                    data={data}
                                  ></ModalNoteSPB>
                                </>
                              ) : (
                                ''
                              )}
                              {showModalTolak == index ? (
                                <>
                                  <ModalNoteSPB
                                    isOpen={showModalTolak}
                                    onClose={closeModalTolak}
                                    onFinish={getSpbService}
                                    isApprove={false}
                                    isValidate={
                                      data.status_pengajuan ==
                                      'section head approval'
                                        ? true
                                        : false
                                    }
                                    data={data}
                                  ></ModalNoteSPB>
                                </>
                              ) : (
                                ''
                              )}
                            </div>
                          </div>
                        </section>
                      </div>
                    </div>
                  </>
                );
              })}
            </div>
          </div>
        </>
      )}
      <div className="w-full flex justify-center mt-5 ">
        <Stack spacing={2}>
          <Pagination
            count={spbService?.total_page}
            color="primary"
            onChange={(e, i) => {
              setPage(i);
              console.log(i);
            }}
          />
        </Stack>
      </div>

      <div>CONTOH DI PURCHASE</div>
      {spbServicePurchase?.data.map((data: any, index: number) => {
        const tglSpb = convertTimeStampToDate(data.tgl_spb);
        const tglPermintaanKedatangan = convertTimeStampToDate(
          data.tgl_permintaan_kedatangan,
        );
        return (
          <div key={index} className=" overflow-x-auto">
            <div className="min-w-[700px] ">
              <div className="my-2 ">
                <section className="flex  bg-white  rounded-md px-1 py-2">
                  <p className="w-10 px-3 text-stone-500 pt-2 text-xs font-bold  items-center">
                    {index + 1}
                  </p>
                  <div className="grid  grid-cols-8 w-full  items-center">
                    <div className="flex gap-2">
                      <p className="text-neutral-500 text-sm font-light line-clamp-1 ">
                        {data.no_spb}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <p className="text-neutral-500 text-sm font-light line-clamp-1">
                        {tglSpb}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <p className="text-neutral-500 text-sm font-light line-clamp-1">
                        {data.master_part.nama_sparepart}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <p className="text-neutral-500 text-sm font-light line-clamp-1">
                        {data.master_part.kode}
                      </p>
                    </div>
                    <div className="flex gap-2 col-span-2">
                      <p
                        className={
                          data.status_pengajuan == 'section head approval' ||
                          data.status_pengajuan == 'section head verifikasi'
                            ? 'text-white bg-green-600  px-2 rounded-2xl text-sm font-light line-clamp-1'
                            : 'text-white bg-yellow-600  px-2 rounded-2xl text-sm font-light line-clamp-1'
                        }
                      >
                        {data.status_pengajuan}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <p className="text-neutral-500 text-sm font-light line-clamp-1">
                        {tglPermintaanKedatangan}
                      </p>
                    </div>
                    <div className="flex gap-2 justify-end pr-8">
                      <button
                        onClick={() => handleClickPurchase(index)}
                        className="px-4 py-2 bg-[#0065DE] rounded-md"
                      >
                        <svg
                          width="4"
                          height="11"
                          viewBox="0 0 4 11"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect width="4" height="1.90909" fill="white" />
                          <rect
                            y="4.45312"
                            width="4"
                            height="1.90909"
                            fill="white"
                          />
                          <rect
                            y="8.9082"
                            width="4"
                            height="1.90909"
                            fill="white"
                          />
                        </svg>
                      </button>
                      {openButtonPurchase == index ? (
                        <>
                          <div className="absolute bg-white mt-10 p-1 shadow-5 rounded-md">
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => handleClickEditPurchase(index)}
                                className="w-25 text-xs font-bold bg-blue-700 py-2 text-white rounded-md"
                              >
                                UPDATE
                              </button>
                              <button
                                onClick={() => donePurchase(data.id)}
                                className="w-25 text-xs font-bold bg-red-600 py-2 text-white rounded-md"
                              >
                                DONE
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <></>
                      )}
                      <button
                        onClick={() => handleClickMonitoringPurchase(index)}
                        className="px-3 py-3 bg-[#0065DE] rounded-md"
                      >
                        <svg
                          width="15"
                          height="10"
                          viewBox="0 0 15 10"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M14 9L7.64444 2L1 9"
                            stroke="white"
                            stroke-width="2.5"
                          />
                        </svg>
                      </button>
                      {showModalMonitoringPurchase == index ? (
                        <MonitoringSPB
                          isOpen={showModalMonitoringPurchase}
                          onClose={closeModalMonitoringPurchase}
                          status={data.status_pengajuan}
                          waktu_tiket_masuk={tglSpb}
                          pelapor={data.pelapor.nama}
                          kode_part={data.master_part.kode}
                          nama_barang={data.master_part.nama_sparepart}
                          mesin={data.master_part.mesin.nama_mesin}
                          qty={data.qty}
                          tanggal_estimasi={tglPermintaanKedatangan}
                          catatan={data.note}
                        >
                          <div></div>
                        </MonitoringSPB>
                      ) : (
                        <></>
                      )}
                    </div>

                    {showModalEditPurchase == index && (
                      <>
                        <div className="fixed z-50 inset-0 overflow-y-auto backdrop-blur-sm bg-white/10 p-4 md:p-8 flex justify-center items-center">
                          <div className="w-full max-w-md bg-white rounded-xl shadow-md">
                            <div className="flex w-full items-center pt-4 px-3">
                              <label className="flex w-10/12 text-blue-700 text-sm font-bold ">
                                SPB UPDATE
                              </label>
                              <button
                                type="button"
                                onClick={closeModalEditPurchase}
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
                              <div className="pt-2">
                                <label
                                  htmlFor="ticketCode"
                                  className="form-label block  text-black text-xs font-extrabold"
                                >
                                  STATUS PENGAJUAN
                                </label>

                                <textarea
                                  onChange={(e) =>
                                    setStatusPengajuan(e.target.value)
                                  }
                                  name=""
                                  rows={3}
                                  cols={6}
                                  id=""
                                  className="w-full p-2 bg-zinc-100 border border-zinc-400 rounded-sm  "
                                ></textarea>
                              </div>

                              <div className="pt-4"></div>

                              <button
                                onClick={() => {
                                  updatePurchase(data.id),
                                    closeModalEditPurchase();
                                }}
                                className="w-full h-12 text-center text-white text-xs font-bold bg-blue-700 rounded-md"
                              >
                                Update
                              </button>
                            </div>

                            <button
                              title="button"
                              type="button"
                              onClick={closeModalEditPurchase}
                              className="absolute top-auto right-auto bottom-3 left-auto transform translate-x-1/2 translate-y-1/2 text-gray-400 focus:outline-none"
                            ></button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </section>
              </div>
            </div>
          </div>
        );
      })}
      <div className="w-full flex justify-center mt-5 ">
        <Stack spacing={2}>
          <Pagination
            count={spbServicePurchase?.total_page}
            color="primary"
            onChange={(e, i) => {
              setPage2(i);
              console.log(i);
            }}
          />
        </Stack>
      </div>
    </main>
  );
}

export default TableSPBRequested;
