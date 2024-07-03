// import React, { useState } from 'react';

import axios from 'axios';
import { useEffect, useState } from 'react';
import convertTimeStampToDateOnly from '../../utils/convertDateOnly';

const ModalEditSparepartSPB = ({
  children,
  isOpen,
  onClose,
  onFinish,
  data,
}: {
  children: any;
  isOpen: any;
  onClose: any;
  onFinish: any;
  data: any;
}) => {
  if (isOpen == null) return null;
  const [showModalService, setShowModalService] = useState(false);
  const [showModalStokSparepart, setShowModalStokSparepart] = useState(false);
  const openModalService = () => setShowModalService(true);
  const closeModalService = () => setShowModalService(false);

  const [service, setService] = useState<any>({
    id_master_sparepart: data.master_part.id_master_sparepart,
    nama_sparepart: data.master_part.nama_sparepart,
  });
  const [qty, setQty] = useState<any>(data.qty);
  const tglPermintaan = convertTimeStampToDateOnly(
    data.tgl_permintaan_kedatangan,
  );
  const [tglPermintaanKedatangan, setTglPermintaanKedatangan] =
    useState<any>(tglPermintaan);
  const [masterMesin, setmasterMesin] = useState<any>();
  const [masterSparepart, setMasterSparepart] = useState<any>([]);

  useEffect(() => {
    getMasterMesin();
  }, []);

  async function getMasterMesin() {
    const url = `${import.meta.env.VITE_API_LINK}/master/mesin`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      setmasterMesin(res.data);
      console.log(res.data);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  async function getMasterSparepart(idMesin: any) {
    const url = `${import.meta.env.VITE_API_LINK}/master/sparepart`;
    try {
      const res = await axios.get(url, {
        params: {
          id_mesin: idMesin,
        },
        withCredentials: true,
      });

      setMasterSparepart(res.data);
      console.log(res.data);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  async function submitSpbEdit(id: any) {
    const url = `${import.meta.env.VITE_API_LINK}/spbServiceSparepart/${id}`;
    try {
      //setIsLoading(true);
      const res = await axios.put(
        url,
        {
          id_master_sparepart: service.id_master_sparepart,
          tgl_permintaan_kedatangan: tglPermintaanKedatangan,
          qty: qty,
        },
        {
          withCredentials: true,
        },
      );

      //setIsLoading(false);
      alert('success');
      onClose();
      onFinish();
    } catch (error: any) {
      console.log(error);
      //setIsLoading(false);
      //alert(error.data.msg);
    }
  }

  const handleChangeServiceId = (value: any) => {
    const onchangeVal: any = service;
    onchangeVal.id_master_sparepart = value;
    setService(onchangeVal);
  };
  const handleChangeServiceName = (value: any) => {
    const onchangeVal: any = service;
    onchangeVal.nama_sparepart = value;
    setService(onchangeVal);
  };

  return (
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
            EDIT SPB
          </label>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 focus:outline-none"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="11" cy="11" r="11" fill="#0065DE" />
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
            <button
              id="ticketCode"
              className="text-neutral-500 text-xl font-normal "
            >
              {data.master_part.mesin.nama_mesin}
            </button>
          </div>
          <div className="pt-2">
            <label
              htmlFor="ticketCode"
              className="form-label block  text-black text-xs font-extrabold"
            >
              NAMA BARANG
            </label>
            <button
              type="button"
              onClick={openModalService}
              className="w-full h-8 bg-zinc-100 border border-zinc-400 rounded-sm "
            >
              {service.nama_sparepart == ''
                ? data.master_part.nama_sparepart
                : service.nama_sparepart}
            </button>
            {showModalService && (
              <div className="fixed z-50 inset-0 h-full backdrop-blur-sm bg-white/10 p-4 md:p-8 flex justify-center items-center">
                <div className="w-full max-w-4xl bg-white rounded-xl shadow-md max-h-screen overflow-y-auto">
                  <div className="flex w-full items-center pt-4 px-3">
                    <svg
                      className="flex w-12"
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

                    <label className="flex w-11/12 text-blue-700 text-sm font-bold ">
                      PILIH BARANG
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        closeModalService();
                      }}
                      className="text-gray-400 focus:outline-none"
                    >
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 22 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle cx="11" cy="11" r="11" fill="#0065DE" />
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
                  <div className="px-5 pb-4">
                    <div className="relative flex w-full gap-10 justify-start pb-2 pt-3">
                      <select
                        onChange={(e) => {
                          getMasterSparepart(e.target.value);
                          // changeTextColor();
                        }}
                        className={`relative z-20 w-8/12  appearance-none rounded-md  text-xs bg-blue-100 py-1 px-2 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input ${'text-gray-800 dark:text-white'}`}
                      >
                        <option
                          value={''}
                          selected
                          disabled
                          className="text-gray-800 text-xs font-light dark:text-bodydark"
                        >
                          Select Mesin
                        </option>
                        {masterMesin?.map((data: any, i: number) => {
                          return (
                            <option
                              value={data.id}
                              className="text-gray-800 text-xs font-light dark:text-bodydark"
                            >
                              {data.nama_mesin}
                            </option>
                          );
                        })}
                      </select>
                      <input
                        type="text"
                        className="flex py-2 lg:w-6/12 w-full text-black text-sm font-normal bg-blue-100 rounded h-full pl-2"
                        placeholder="Search Sparepart..."
                        id="searchInput"
                      />
                      <div className="-translate-x-8 my-auto">
                        <svg
                          width="16"
                          height="18"
                          viewBox="0 0 16 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M15.7231 14.5835L11.2285 9.98926L8.90283 12.3648L13.4007 16.959C13.7698 17.3361 14.3774 17.3361 14.7465 16.959L15.7231 15.9614C16.0923 15.5811 16.0923 14.9572 15.7231 14.5835Z"
                            fill="#0065DE"
                          />
                          <path
                            d="M9.00432 11.3404L10.2227 10.0959L8.83447 8.67793C10.1476 6.74614 9.96465 4.07033 8.27917 2.34874C6.38791 0.416956 3.3142 0.416956 1.41967 2.34874C-0.474857 4.28053 -0.47159 7.4201 1.41967 9.35522C3.10515 11.0768 5.72482 11.2637 7.61609 9.92241L9.00432 11.3404ZM2.3604 8.38099C0.988503 6.97969 0.988503 4.70759 2.3604 3.30963C3.7323 1.90833 5.95674 1.90833 7.32537 3.30963C8.69727 4.71093 8.69727 6.98303 7.32537 8.38099C5.95674 9.78228 3.7323 9.78228 2.3604 8.38099Z"
                            fill="#0065DE"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className=" border border-black rounded-md overflow-y-scroll h-80">
                      <div className="flex border-b border-stroke dark:border-strokedark">
                        <div className="flex items-center justify-start  w-1/12 gap-3 p-2.5 ">
                          <p className="hidden text-xs text-slate-600 font-semibold mb-1 md:mt-0 mt-3 text-sm dark:text-white sm:block pl-5">
                            No
                          </p>
                        </div>

                        <div className="flex items-center lg:w-5/12 w-4/12 justify-center lg:p-2.5 lg:ml-2 ">
                          <p className="text-slate-600 text-xs font-semibold mb-1 md:mt-0 mt-3 text-sm text-center dark:text-white ">
                            Kode
                          </p>
                        </div>
                        <div className="flex items-center lg:w-5/12 w-4/12 justify-center lg:p-2.5 lg:ml-2 ">
                          <p className="text-slate-600 text-xs font-semibold mb-1 md:mt-0 mt-3 text-sm text-center dark:text-white ">
                            Sparepart Name
                          </p>
                        </div>
                        <div className="flex items-center text-xs lg:w-4/12 w-3/12 justify-center p-2.5 ml-2">
                          <p className="text-slate-600 font-semibold mb-1 md:mt-0 mt-3 text-sm text-center dark:text-white">
                            Posisi Part
                          </p>
                        </div>
                        <div className="flex items-center text-xs lg:w-4/12 w-3/12 justify-center p-2.5 ml-2">
                          <p className="text-slate-600 font-semibold mb-1 md:mt-0 mt-3 text-sm text-center dark:text-white"></p>
                        </div>
                      </div>

                      {masterSparepart?.map((data: any, index: number) => {
                        return (
                          <div className="flex border-b border-stroke dark:border-strokedark ">
                            <div className="flex items-center justify-start  w-1/12 gap-3 p-2.5 ">
                              <p className="hidden text-xs text-slate-600 font-semibold mb-1 md:mt-0 mt-3 text-sm dark:text-white sm:block pl-5">
                                {index + 1}
                              </p>
                            </div>

                            <div className="flex items-center lg:w-5/12 w-4/12 justify-center lg:p-2.5 lg:ml-2 ">
                              <p className="text-slate-600 text-xs font-semibold mb-1 md:mt-0 mt-3 text-sm text-center dark:text-white ">
                                {data.kode}
                              </p>
                            </div>
                            <div className="flex items-center lg:w-5/12 w-4/12 justify-center lg:p-2.5 lg:ml-2 ">
                              <p className="text-slate-600 text-xs font-semibold mb-1 md:mt-0 mt-3 text-sm text-center dark:text-white ">
                                {data.nama_sparepart}
                              </p>
                            </div>
                            <div className="flex items-center text-xs lg:w-4/12 w-3/12 justify-center p-2.5 ml-2">
                              <p className="text-slate-600 font-semibold mb-1 md:mt-0 mt-3 text-sm text-center dark:text-white">
                                {data.posisi_part}
                              </p>
                            </div>
                            <div className="flex items-center text-xs lg:w-4/12 w-3/12 justify-center p-2.5 ml-2">
                              <button
                                onClick={() => {
                                  handleChangeServiceId(data.id);
                                  handleChangeServiceName(data.nama_sparepart);

                                  closeModalService();
                                }}
                                className="bg-primary w-20 text-white"
                              >
                                select
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="pt-2">
            <label
              htmlFor="ticketCode"
              className="form-label block  text-black text-xs font-extrabold"
            >
              QTY
            </label>
            <input
              defaultValue={qty}
              onChange={(e) => setQty(e.target.value)}
              type="text"
              className="w-full h-8 bg-zinc-100 border border-zinc-400 rounded-sm"
            ></input>
          </div>
          <div className="pt-2">
            <label
              htmlFor="ticketCode"
              className="form-label block  text-black text-xs font-extrabold"
            >
              Tanggal
            </label>
            <input
              defaultValue={tglPermintaanKedatangan}
              onChange={(e) => setTglPermintaanKedatangan(e.target.value)}
              type="date"
              className="w-full h-8 bg-zinc-100 border border-zinc-400 rounded-sm"
            ></input>
          </div>
          <div className="pt-4">
            <button
              onClick={() => submitSpbEdit(data.id)}
              className="w-full h-12 text-center text-white text-xs font-bold bg-blue-700 rounded-md"
            >
              SUBMIT
            </button>
          </div>
          {children}
        </div>

        <button
          title="button"
          type="button"
          onClick={onClose}
          className="absolute top-auto right-auto bottom-3 left-auto transform translate-x-1/2 translate-y-1/2 text-gray-400 focus:outline-none"
        ></button>
      </div>
    </div>
  );
};

export default ModalEditSparepartSPB;
