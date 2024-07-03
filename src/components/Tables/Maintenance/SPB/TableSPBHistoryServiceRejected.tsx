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

function TableSPBHistoryServiceRejected() {
  const [showModalSPBBaru, setShowModalSPBBaru] = useState(false);

  const openModalSPBBaru = () => setShowModalSPBBaru(true);
  const closeModalSPBBaru = () => setShowModalSPBBaru(false);

  const [isMobile, setIsMobile] = useState(false);
  const [openButton, setOpenButton] = useState(null);
  // const [showModal27, setShowModal27] = useState(false);
  // const openModal27 = () => setShowModal27(true);
  // const closeModal27 = () => setShowModal27(false);
  // const [showModal28, setShowModal28] = useState(false);
  // const openModal28 = () => setShowModal28(true);
  // const closeModal28 = () => setShowModal28(false);
  // const [showModal29, setShowModal29] = useState(false);
  // const openModal29 = () => setShowModal29(true);
  // const closeModal29 = () => setShowModal29(false);

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
  }, []);

  const [spbService, setSpbService] = useState<any>();

  async function getSpbService() {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/spbServiceSparepart/historyRejected`;
    try {
      const res = await axios.get(url, {
        // params: {

        //   page: page,
        //   limit: 10,
        // },
        withCredentials: true,
      });

      setSpbService(res.data);
      console.log(res.data);

      let data: any[] = [];
      for (let i = 0; i < res.data.data.length; i++) {
        data.push(false);
      }
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
            {spbService?.map((data: any, index: number) => {
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
                                data.status_pengajuan == 'section head approval'
                                  ? 'text-white bg-green-600  px-2 rounded-2xl text-sm font-light line-clamp-1'
                                  : 'text-neutral-500 text-sm font-light line-clamp-1'
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
                                children={undefined}
                              ></MonitoringSPB>
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
                          {/* {showModalCatatan == index && (
                            <>
                              <ModalNoteSPB
                                isOpen={showModalCatatan}
                                onClose={closeModalCatatan}
                                onFinish={getSpbService}
                                isApprove={true}
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
                                data={data}
                              ></ModalNoteSPB>
                            </>
                          )} */}
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
              {spbService?.map((data: any, index: number) => {
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
                                  'section head approval'
                                    ? 'text-white bg-green-600  px-2 py-1 rounded-md text-[9px] font-light text-center leading-[9px]'
                                    : 'text-neutral-500 text-xs font-light text-center'
                                }
                              >
                                {data.status_pengajuan}
                              </p>
                            </div>
                            <div className="flex gap-2 justify-center  items-center">
                              <div></div>

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
                                    <p></p>
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
                              {/* {showModalCatatan == index ? (
                                <>
                                  <ModalNoteSPB
                                    isOpen={showModalCatatan}
                                    onClose={closeModalCatatan}
                                    onFinish={getSpbService}
                                    isApprove={true}
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
                                    data={data}
                                  ></ModalNoteSPB>
                                </>
                              ) : (
                                ''
                              )} */}
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
    </main>
  );
}

export default TableSPBHistoryServiceRejected;
