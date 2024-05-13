// import React, { useState } from 'react';

import { useEffect, useRef, useState } from 'react';
import CheckStockPengganti from '../Tables/Modals/SparepartPengganti';
import axios from 'axios';

const ModalStockCheck1 = ({
  children,
  isOpen,
  onClose,
  onFinish,
  kendala,
  machineName,
  tgl,
  jam,
  namaPemeriksa,
  no,
  idTiket,
  idProses,
  kodeLkh,
  namaMesin,
}: {
  children: any;
  isOpen: any;
  onClose: any;
  onFinish: any;
  kendala: any;
  machineName: any;
  tgl: any;
  jam: any;
  namaPemeriksa: any;
  no: any;
  idTiket: any;
  idProses: any;
  kodeLkh: any;
  namaMesin: any;
}) => {
  if (!isOpen) return null;

  const [sparepart, setSparepart] = useState([
    {
      rusak: '',
      pengganti: '',
    },
  ]);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [isOptionSelected, setIsOptionSelected] = useState<boolean>(false);

  const [selectedNamaAnalisis, setSelectedNamaAnalisis] = useState<any>();

  const changeTextColor = () => {
    setIsOptionSelected(true);
  };
  const [isHidden, setIsHidden] = useState(true);
  const [buttonHidden, setButtonHidden] = useState(true);
  const handleClick = () => {
    setIsHidden(false);
    setButtonHidden(false);
    setSparepart([]);
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

  const [rusak, setRusak] = useState(false);

  function convertDatetimeToDate(datetime: any) {
    const dateObject = new Date(datetime);
    const day = dateObject.getDate().toString().padStart(2, '0'); // Ensure two-digit day
    const month = (dateObject.getMonth() + 1).toString().padStart(2, '0'); // Adjust for zero-based month
    const year = dateObject.getFullYear();

    return `${year}/${month}/${day}`; // Example format (YYYY-MM-DD)
  }

  function convertDatetimeToTime(datetime: any) {
    const dateObject = new Date(datetime);
    const hours = dateObject.getHours().toString().padStart(2, '0');
    const minutes = dateObject.getMinutes().toString().padStart(2, '0');
    const seconds = dateObject.getSeconds().toString().padStart(2, '0');
    // Optional milliseconds

    return `${hours}:${minutes}:${seconds}`; // Example format (HH:mm:ss.SSS)
  }

  const tanggalPeriksa = convertDatetimeToDate(tgl);
  const waktuPeriksa = convertDatetimeToTime(tgl);

  const [typePost, setTypePost] = useState<any>('normal');

  const [selectedKodeAnalisis, setSelectedKodeAnalisis] = useState<any>();
  const [selectedSkorPerbaikan, setSelectedSkorPerbaikan] = useState<any>();
  const [noteMaintenance, setNoteMaintenance] = useState<any>();

  const [kodeAnalisis, setKodeAnalisis] = useState<any>(null);
  const [skorPerbaikan, setSkorPerbaikan] = useState<any>(null);

  useEffect(() => {
    getKodeAnalisis();
    getSkorPerbaikan();
  }, []);
  async function getKodeAnalisis() {
    const url = `${import.meta.env.VITE_API_LINK}/master/kodeAnalisis`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      setKodeAnalisis(res.data);
      console.log(res.data);
    } catch (error: any) {
      console.log(error.response);
    }
  }

  async function getSkorPerbaikan() {
    const url = `${import.meta.env.VITE_API_LINK}/master/skorMtc`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      setSkorPerbaikan(res.data);
      console.log(res.data);
    } catch (error: any) {
      console.log(error.response);
    }
  }

  async function postAnalisis() {
    const urlNormal = `${import.meta.env.VITE_API_LINK
      }/ticket/analisis/${idTiket}`;
    const urlPending = `${import.meta.env.VITE_API_LINK
      }/ticket/pending/${idTiket}`;
    try {
      if (typePost === 'normal') {
        const res = await axios.put(
          urlNormal,
          {
            id_proses: idProses,
            kode_analisis_mtc: selectedKodeAnalisis.kode_analisis,
            nama_analisis_mtc: selectedKodeAnalisis.nama_analisis,
            note_analisis: "",
            masalah_sparepart: [],
            skor_mtc: selectedSkorPerbaikan.skor,
            cara_perbaikan: selectedSkorPerbaikan.nama_skor,
            note_mtc: noteMaintenance,
            nama_mesin: namaMesin,
          },
          {
            withCredentials: true,
          },
        );

        alert(res.data.msg);
      } else {
        const res = await axios.put(
          urlPending,
          {
            id_proses: idProses,
            note_mtc: noteMaintenance,
          },
          {
            withCredentials: true,
          },
        );

        alert(res.data.msg);
      }

      onClose();
      onFinish();
    } catch (error: any) {
      console.log(error);
      //alert(error.data.msg);
    }
  }

  return (
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
            Form Respon Maintenance
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
          <div className=" flex w-full pt-4 gap-5">
            <div className=" w-6/12">
              <label
                htmlFor="namamesin"
                className="form-label block  text-black text-xs font-extrabold"
              >
                NAMA MESIN
              </label>

              <span
                id="namamesin"
                className="text-neutral-500 text-xl font-normal"
              >
                {machineName}
              </span>
              <div className="pt-2">
                <label
                  htmlFor="kendala"
                  className="form-label block  text-black text-xs font-extrabold"
                >
                  KENDALA
                </label>
              </div>
              <div>
                <span
                  id="kendala"
                  className="text-neutral-500 text-xl font-normal"
                >
                  {kodeLkh} - {kendala}
                </span>
              </div>
            </div>
            <div className="w-6/12 justify-end justify-items-end">
              <label
                htmlFor="tgl"
                className="form-label block  text-black text-xs font-extrabold"
              >
                TANGGAL PEMERIKSAAN
              </label>
              <span id="tgl" className="text-neutral-500 text-xl font-normal">
                {tanggalPeriksa}
              </span>
              <label
                htmlFor="jam"
                className="form-label block  text-black text-xs font-extrabold mt-2"
              >
                JAM PEMERIKSAAN
              </label>
              <span id="jam" className="text-neutral-500 text-xl font-normal">
                {waktuPeriksa}
              </span>
              <label
                htmlFor="namaPemeriksa"
                className="form-label block  text-black text-xs font-extrabold mt-2"
              >
                NAMA PEMERIKSAAN
              </label>
              <span
                id="namaPemeriksa"
                className="text-neutral-500 text-xl font-normal"
              >
                {namaPemeriksa}
              </span>
            </div>
          </div>
          <div className="flex w-full pt-1">
            <div className="flex w-6/12">
              <label className="form-label block  text-black text-xs font-extrabold mt-2">
                ANALISIS PENYEBAB
              </label>
            </div>
            {!isMobile && (
              <div className="flex pl-2 w-6/12">
                <label className="form-label block  text-black text-xs font-extrabold mt-3">
                  UPLOAD FOTO
                </label>
              </div>
            )}
          </div>
          <div className="flex w-full pt-1">
            <div className="flex lg:w-6/12 w-full">
              <div>
                <div className="relative z-20 bg-white dark:bg-form-input lg:w-[400px] w-full">
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
                    onChange={(e) => {
                      const selectedOption = kodeAnalisis.find(
                        (kode: any) => kode.kode_analisis === e.target.value,
                      );

                      setSelectedKodeAnalisis(selectedOption);

                      changeTextColor();
                    }}
                    className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input ${isOptionSelected ? 'text-black dark:text-white' : ''
                      }`}
                  >
                    <option
                      value=""
                      disabled
                      className="text-body dark:text-bodydark"
                    >
                      KODE - NAMA PENYEBAB
                    </option>
                    {kodeAnalisis != null &&
                      kodeAnalisis.map((data: any, i: number) => (
                        <option
                          key={i}
                          value={data.kode_analisis}
                          className="text-body dark:text-bodydark"
                        >
                          {data.kode_analisis} - {data.nama_analisis}
                        </option>
                      ))}
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
            {!isMobile && (
              <div className="flex ml-2 lg:w-[389px] rounded-md border border-stroke px-2 py-2">
                <label
                  htmlFor="formFile"
                  className="flex items-center px-12 py-1 rounded-md bg-primary text-white font-medium cursor-pointer hover:bg-primary-dark"
                >
                  Pilih File
                  <input
                    type="file"
                    id="formFile"
                    accept="image/*"
                    className="hidden"
                  />
                </label>

                <span id="formFile" className="ml-2 text-sm"></span>
              </div>
            )}
          </div>
          {isMobile && (
            <>
              <div className="flex pl-2 w-6/12">
                <label className="form-label block  text-black text-xs font-extrabold mt-3">
                  UPLOAD FOTO
                </label>
              </div>

              <div className="flex  w-full mt-2 rounded-md border border-stroke px-2 py-2">
                <label
                  htmlFor="formFile"
                  className="flex items-center px-12 py-1 rounded-md bg-primary text-white font-medium cursor-pointer hover:bg-primary-dark"
                >
                  Pilih File
                  <input
                    type="file"
                    id="formFile"
                    accept="image/*"
                    className="hidden"
                  />
                </label>

                <span id="formFile" className="ml-2 text-sm"></span>
              </div>
            </>
          )}

          <div className="flex w-full pt-2">
            <label className="form-label block  text-black text-xs font-extrabold mt-3">
              KEBUTUHAN SPAREPART
            </label>
          </div>
          {isHidden == false ? (
            <>
              <div className="pt-3 mt-5 border bg-blue-100 rounded border-stroke pb-4 overflow-y-auto scroll-auto max-h-[450px]">
                {!isMobile && (
                  <div className="flex flex-wrap w-full px-1 py-1 ">
                    <div className="flex w-full gap-1 border-b px-3 py-1 border-neutral-300 pb-2">
                      <div className="flex w-3/12">
                        <label
                          htmlFor=""
                          className="text-neutral-500  text-xs font-semibold pt-1"
                        >
                          Sparepart Untuk :
                        </label>
                      </div>

                      <div className="relative z-20 h-[23px] bg-white dark:bg-form-input rounded-md w-5/12">
                        <select
                          value={selectedOption}
                          onChange={(e) => {
                            setSelectedOption(e.target.value);
                            changeTextColor();
                          }}
                          className={`relative z-20 w-full appearance-none rounded-md  text-xs bg-transparent py-1 px-2 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input ${isOptionSelected
                            ? 'text-gray-800 dark:text-white'
                            : ''
                            }`}
                        >
                          <option
                            value="pon"
                            className="text-gray-800 text-xs font-light dark:text-bodydark"
                          >
                            R700
                          </option>
                        </select>

                        <span className="absolute top-[13px] right-2 z-10 -translate-y-1/2">
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
                      <input
                        type="text"
                        className="w-full h-[23px] rounded-md px-3 text-xs"
                        placeholder="Cari Sparepart"
                      />
                    </div>
                    <div className="flex w-full px-3 pt-2">
                      <div className="flex items-center w-1/12  justify-start">
                        <p className="hidden  text-neutral-500 text-sm font-semibold dark:text-white sm:block">
                          No
                        </p>
                      </div>

                      <div className="flex items-center w-3/12 justify-center ">
                        <p className="text-neutral-500 text-sm font-semibold text-center dark:text-white line-clamp-1">
                          Sperepart Name
                        </p>
                      </div>
                      <div className="flex items-center w-3/12 justify-center ">
                        <p className="text-neutral-500 text-sm font-semibold text-center dark:text-white line-clamp-1">
                          Sperepart Status
                        </p>
                      </div>
                      <div className="flex items-center w-3/12 justify-center ">
                        <p className="text-neutral-500 text-sm font-semibold text-center dark:text-white line-clamp-1">
                          Sperepart Stock
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {isMobile && (
                  <div className="flex w-full px-1 py-1">
                    <div className="flex w-full flex-wrap gap-1 border-b  border-neutral-300 pb-2">
                      <div className="flex w-full">
                        <div className="flex w-full">
                          <label
                            htmlFor=""
                            className="text-neutral-500  text-xs font-semibold pt-1"
                          >
                            Sparepart Untuk :
                          </label>
                        </div>
                      </div>

                      <div className="flex w-full">
                        <div className="relative z-20 h-[30px] bg-white dark:bg-form-input rounded-md w-9/12">
                          <select
                            value={selectedOption}
                            onChange={(e) => {
                              setSelectedOption(e.target.value);
                              changeTextColor();
                            }}
                            className={`relative z-20 w-full pt-2 appearance-none rounded-md  text-xs bg-transparent py-1 px-2 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input ${isOptionSelected
                              ? 'text-gray-800 dark:text-white'
                              : ''
                              }`}
                          >
                            <option
                              value="pon"
                              className="text-gray-800 text-xs font-light dark:text-bodydark"
                            >
                              R700
                            </option>
                          </select>

                          <span className="absolute top-[16px] right-2 z-10 -translate-y-1/2">
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
                        <input
                          type="text"
                          className="w-full h-[30px] rounded-md px-3 text-xs ml-2"
                          placeholder="Cari Sparepart"
                        />
                      </div>
                      <div className="flex w-full pt-3">
                        <div className="flex items-center w-4/12 justify-start pl-1 ">
                          <p className="text-neutral-500 text-sm font-semibold text-center dark:text-white line-clamp-1">
                            {' '}
                            Name
                          </p>
                        </div>
                        <div className="flex items-center w-3/12 justify-start ">
                          <p className="text-neutral-500 text-sm font-semibold text-center dark:text-white line-clamp-1">
                            {' '}
                            Status
                          </p>
                        </div>
                        <div className="flex items-center w-3/12 justify-start">
                          <p className="text-neutral-500 text-sm font-semibold text-center dark:text-white line-clamp-1">
                            {' '}
                            Stock
                          </p>
                        </div>
                        <div className="flex w-2/12"></div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pb-2 ">
                  <CheckStockPengganti
                    no={1}
                    spareName={'Cable'}
                    spareStatus={'Original'}
                    spareStock={'5'}
                  />
                  <CheckStockPengganti
                    no={2}
                    spareName={'Adapter 3.5'}
                    spareStatus={'Original'}
                    spareStock={'0'}
                  />
                  <CheckStockPengganti
                    no={3}
                    spareName={'INK Injector'}
                    spareStatus={'Original'}
                    spareStock={'1'}
                  />
                  <CheckStockPengganti
                    no={4}
                    spareName={'Adapter 3.5'}
                    spareStatus={'Original'}
                    spareStock={'0'}
                  />
                  <CheckStockPengganti
                    no={5}
                    spareName={'Adapter 3.5'}
                    spareStatus={'Original'}
                    spareStock={'0'}
                  />
                  <CheckStockPengganti
                    no={6}
                    spareName={'Adapter 3.5'}
                    spareStatus={'Original'}
                    spareStock={'0'}
                  />
                  <CheckStockPengganti
                    no={7}
                    spareName={'Adapter 3.5'}
                    spareStatus={'Original'}
                    spareStock={'0'}
                  />
                  <CheckStockPengganti
                    no={8}
                    spareName={'Adapter 3.5'}
                    spareStatus={'Original'}
                    spareStock={'0'}
                  />
                  <CheckStockPengganti
                    no={9}
                    spareName={'Adapter 3.5'}
                    spareStatus={'Original'}
                    spareStock={'0'}
                  />
                </div>
              </div>
              {/* <div className="flex w-full h-12 rounded-md bg-blue-600 mt-4 justify-center items-center">
                                <label className="text-center text-white text-xs font-bold">
                                    REQUEST STOCK
                                </label>
                            </div> */}
            </>
          ) : (
            <></>
          )}
          {buttonHidden == true ? (
            <>
              <div className="flex w-full pt-1">
                <button
                  onClick={handleClick}
                  className="lg:w-[400px] w-30 lg:h-12 h-10 bg-blue-700 rounded text-center text-white text-xs font-bold"
                >
                  +
                </button>
              </div>
            </>
          ) : (
            <></>
          )}

          <div className="flex w-full pt-1">
            <div className="flex w-full">
              <label className="form-label block  text-black text-xs font-extrabold mt-3">
                TIPE MAINTENANCE
              </label>
            </div>
          </div>


          <div className="flex w-full pt-1">
            <div className="flex lg:w-6/12 w-full">
              <div>
                <div className="relative z-20 bg-white dark:bg-form-input lg:w-[400px] w-[325px]">
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
                    onChange={async (e) => {
                      if (e.target.value != 'pending') {
                        const selectedOptionSkor = skorPerbaikan.find(
                          (perbaikan: any) =>
                            perbaikan.nama_skor === e.target.value,
                        );
                        setSelectedSkorPerbaikan(selectedOptionSkor);
                        setTypePost('normal');
                        console.log('normal')
                      } else {
                        setTypePost('pending');
                        console.log('pending')
                      }

                      changeTextColor();
                    }}
                    className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input ${isOptionSelected ? 'text-black dark:text-white' : ''
                      }`}
                  >

                    <option
                      value=""
                      selected
                      className="text-body dark:text-bodydark"
                    >
                      pilih
                    </option>

                    {skorPerbaikan != null &&
                      skorPerbaikan.map((data: any, i: number) => {
                        return (
                          <option
                            value={data.nama_skor}
                            key={i}
                            className="text-body dark:text-bodydark"
                          >
                            {data.skor}% - {data.nama_skor}
                          </option>
                        );
                      })}

                    <option
                      value="pending"
                      className="text-body dark:text-bodydark"
                    >
                      0% - Pending
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
          <div className="flex w-full pt-1">
            <div className="flex w-full">
              <label className="form-label block  text-black text-xs font-extrabold mt-3">
                {typePost == 'pending' ?
                  <>
                    <h2>TIPE PENDING</h2>
                    <div className='flex gap-5 mt-5'>
                      <div className='flex gap-2'>
                        <input type="radio" id="man" name="option" value="man" />
                        <label htmlFor="man">Man</label><br />
                      </div>
                      <div className='flex gap-2'>
                        <input type="radio" id="sparepart" name="option" value="sparepart" />
                        <label htmlFor="sparepart">Sparepart</label><br />
                      </div>
                      <div className='flex gap-2'>
                        <input type="radio" id="time" name="option" value="time" />
                        <label htmlFor="time">Time</label><br />
                      </div>
                    </div>
                  </> : ""}
              </label>
            </div>
          </div>
          <div className="flex w-full pt-1">
            <div className="flex w-full">
              <label className="form-label block  text-black text-xs font-extrabold mt-3">
                CATATAN
              </label>
            </div>
          </div>
          <div className="relative w-full min-w-[200px] pt-1">
            <textarea
              value={noteMaintenance}
              onChange={(e) => setNoteMaintenance(e.target.value)}
              className="peer h-full min-h-[100px] w-full resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
            ></textarea>
          </div>

          <div className="pt-5">
            <button
              onClick={() => {
                postAnalisis();
                //onClose;
                // onFinish();
              }}
              className="w-full h-12 text-center text-white text-xs font-bold bg-blue-700 rounded-md"
            >
              SIMPAN
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="absolute top-auto right-auto bottom-3 left-auto transform translate-x-1/2 translate-y-1/2 text-gray-400 focus:outline-none"
        ></button>
        {children}
      </div>
    </div>
  );
};

export default ModalStockCheck1;
