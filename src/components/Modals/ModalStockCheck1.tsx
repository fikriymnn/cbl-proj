// import React, { useState } from 'react';

import { useEffect, useRef, useState } from 'react';
import CheckStockPengganti from '../Tables/Modals/SparepartPengganti';
import axios from 'axios';
import Info from '../../images/icon/Info.svg';
import ModalMtcStockCheck from './ModalMtcStockCheck';
import ModalMtcStockCheck2 from './ModalMtcStockCheck2';
import CheckStock2 from '../Tables/Modals/CheckStock2';
import Loading from '../Loading';

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
  skor_mtc,
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
  skor_mtc: any;
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

  const [mesin, setMesin] = useState<any>(namaMesin);
  const [mesinMsSparepart, setMesinMsSparepart] = useState<any>(namaMesin);
  const [masterMesin, setmasterMesin] = useState<any>();

  const [selectedKodeAnalisis, setSelectedKodeAnalisis] = useState<any>();
  const [selectedSkorPerbaikan, setSelectedSkorPerbaikan] = useState<any>();
  const [noteMaintenance, setNoteMaintenance] = useState<any>();
  const [alasanPending, setAlasanPending] = useState<any>();

  const [kodeAnalisis, setKodeAnalisis] = useState<any>(null);
  const [skorPerbaikan, setSkorPerbaikan] = useState<any>(null);

  const [stokSparepart, setStokSparepart] = useState<any>(null);
  const [masterSparepart, setMasterSparepart] = useState<any>(null);
  const [kebutuhanSparepart, setKebutuhanSparepart] = useState<any>([]);

  useEffect(() => {
    getKodeAnalisis();
    getSkorPerbaikan();
    getStokSparepart(mesin);
    getMasterMesin();
    getMasterSparepart(mesinMsSparepart);
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
      console.log(error.data.msg);
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
      console.log(error.data.msg);
    }
  }

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

  async function getStokSparepart(mesinName: any) {
    const url = `${import.meta.env.VITE_API_LINK}/stokSparepart`;
    try {
      const res = await axios.get(url, {
        params: {
          nama_mesin: mesinName,
        },
        withCredentials: true,
      });

      setStokSparepart(res.data);
      console.log(res.data);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  async function getMasterSparepart(mesinName: any) {
    const url = `${import.meta.env.VITE_API_LINK}/master/sparepart`;
    try {
      const res = await axios.get(url, {
        params: {
          nama_mesin: mesinName,
        },
        withCredentials: true,
      });

      setMasterSparepart(res.data);
      console.log(res.data);
    } catch (error: any) {
      console.log(error);
    }
  }
  const [isLoading, setIsLoading] = useState(false)

  async function postAnalisis() {
    const urlNormal = `${import.meta.env.VITE_API_LINK
      }/ticket/analisis/${idTiket}`;
    const urlPending = `${import.meta.env.VITE_API_LINK
      }/ticket/pending/${idTiket}`;
    try {
      if (typePost === 'normal') {
        setIsLoading(true);
        const res = await axios.put(
          urlNormal,
          {
            id_proses: idProses,
            kode_analisis_mtc: selectedKodeAnalisis.kode_analisis,
            nama_analisis_mtc: selectedKodeAnalisis.nama_analisis,
            note_analisis: '',
            masalah_sparepart: kebutuhanSparepart,
            skor_mtc: selectedSkorPerbaikan.skor,
            cara_perbaikan: selectedSkorPerbaikan.nama_skor,
            note_mtc: noteMaintenance,

            nama_mesin: namaMesin,
          },
          {
            withCredentials: true,
          },
        );

        // alert(res.data.msg);
      } else {
        const res = await axios.put(
          urlPending,
          {
            id_proses: idProses,
            note_mtc: noteMaintenance,
            alasan_pending: alasanPending,
          },
          {
            withCredentials: true,
          },
        );

        // alert(res.data.msg);
      }
      setIsLoading(false);
      onClose();
      onFinish();
    } catch (error: any) {
      console.log(error);
      //alert(error.data.msg);
      setIsLoading(false);
    }
  }
  async function deleteExit(id_ticket: any, id_proses: any) {
    const url = `${import.meta.env.VITE_API_LINK}/ticket/delete/${id_ticket}`;
    try {
      const res = await axios.put(
        url,
        {
          id_proses: id_proses,
        },
        {
          withCredentials: true,
        },
      );
      onFinish();
      console.log(res.data);
    } catch (error: any) {
      console.log(error);
    }
  }

  //add Point
  const handleAddPoint = () => {
    setKebutuhanSparepart([
      ...kebutuhanSparepart,
      {
        id_stok: null,
        detail_stok: {
          kode: '',
          part_number: '',
          nama_sparepart: '',
          nama_mesin: '',
          lokasi: '',
          umur: null,
          grade: '',
        },

        id_ms_sparepart: null,
        detail_ms_sparepart: {
          kode: '',
          nama_sparepart: '',
          nama_mesin: '',
          posisi_part: '',
          sisa_umur: null,
          grade: ""
        },
      },
    ]);
  };

  const handleDeletePoint = (i: number) => {
    const deleteVal: any = [...kebutuhanSparepart];
    deleteVal.splice(i, 1);
    setKebutuhanSparepart(deleteVal);
  };

  const [info, setInfo] = useState<{ [key: number]: boolean }>({});

  const toggleInfo = (index: number) => {
    setInfo((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };
  const [infoPengganti, setInfoPengganti] = useState<{ [key: number]: boolean }>({});
  const toggleInfoPengganti = (index: number) => {
    setInfoPengganti((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };
  const [showModalStok, setShowModalStok] = useState(false);
  const openModalStok = () => setShowModalStok(true);
  const closeModalStok = () => setShowModalStok(false);

  const [showModalMsStok, setShowModalMsStok] = useState(false);
  const openModalMsStok = () => setShowModalMsStok(true);
  const closeModalMsStok = () => setShowModalMsStok(false);


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
            onClick={() => {
              if (skor_mtc != 0) {
                deleteExit(idTiket, idProses);
              }
              onClose();
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
                      console.log(selectedOption);
                      changeTextColor();
                    }}
                    className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input ${isOptionSelected ? 'text-black dark:text-white' : ''
                      }`}
                  >
                    <option
                      value=""
                      disabled
                      selected
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
          </div>
          <div className="flex w-full pt-2">
            <label className="form-label block  text-black text-xs font-extrabold mt-3">
              KEBUTUHAN SPAREPART
            </label>
          </div>
          <div className="">
            <div className="pb-2 ">
              <>
                {kebutuhanSparepart.map((data: any, i: number) => {
                  return (
                    <>
                      <div className="md:flex  mb-2 px-2 lg:py-3 py-1 bg-[#D8EAFF] rounded-md">

                        <>
                          <label className="hidden sm:block text-blue-700 text-xs font-bold pt-2 pl-4">
                            {i + 1}
                          </label>
                          <div className='flex md:w-[35%] w-full'>

                            {data.id_ms_sparepart == null ? (
                              <button
                                onClick={openModalMsStok}
                                name="rusak"
                                className="lg:ml-4 ml-[2px] lg:w-[415px] w-[320px] h-9 bg-blue-700 rounded text-center text-white md:text-xs text-[9px] md:font-bold font-semibold"
                              >
                                PILIH SPAREPART RUSAK
                              </button>
                            ) : (
                              <button
                                name="rusak"
                                onClick={openModalMsStok}
                                className="lg:ml-4 ml-[2px]  lg:w-[415px] w-[320px] h-9 bg-white rounded text-center text-[#0065DE] text-xs font-bold"
                              >
                                {data.detail_ms_sparepart.nama_sparepart}
                              </button>
                            )}

                            {showModalMsStok && (
                              <>
                                <div className="fixed z-50 inset-0 backdrop-blur-sm bg-white/10 p-4 md:p-8 flex justify-center items-center  ">
                                  <div className="w-full max-w-4xl  bg-white rounded-xl shadow-md h-[620px]">
                                    <div className="flex w-full items-center pt-4">
                                      <label className="flex lg:w-11/12 w-10/12 px-5 text-blue-700 text-sm font-bold ">
                                        Sparepart Master Check
                                      </label>
                                      <button
                                        type="button"
                                        onClick={closeModalMsStok}
                                        className="text-gray-400 focus:outline-none mr-5"
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
                                    <div className="px-5 pb-4">
                                      <div className="relative flex w-full gap-10 justify-start pb-2 pt-3">
                                        <select
                                          value={mesinMsSparepart}
                                          onChange={(e) => {
                                            setMesin(e.target.value);
                                            getMasterSparepart(e.target.value);
                                            changeTextColor();
                                          }}
                                          className={`relative z-20 w-8/12  appearance-none rounded-md  text-xs bg-blue-100 py-1 px-2 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input ${isOptionSelected
                                            ? 'text-gray-800 dark:text-white'
                                            : ''
                                            }`}
                                        >
                                          <option
                                            value={mesinMsSparepart}
                                            selected
                                            disabled
                                            className="text-gray-800 text-xs font-light dark:text-bodydark"
                                          >
                                            {mesinMsSparepart}
                                          </option>
                                          {masterMesin != null &&
                                            masterMesin.map(
                                              (data: any, i: number) => {
                                                return (
                                                  <option
                                                    value={data.nama_mesin}
                                                    className="text-gray-800 text-xs font-light dark:text-bodydark"
                                                  >
                                                    {data.nama_mesin}
                                                  </option>
                                                );
                                              },
                                            )}
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
                                            <p className="hidden text-xs text-slate-600 font-semibold dark:text-white sm:block pl-5">
                                              No
                                            </p>
                                          </div>

                                          <div className="flex items-center lg:w-5/12 w-4/12 justify-center lg:p-2.5 lg:ml-2 ">
                                            <p className="text-slate-600 text-xs font-semibold text-center dark:text-white ">
                                              Kode
                                            </p>
                                          </div>
                                          <div className="flex items-center lg:w-5/12 w-4/12 justify-center lg:p-2.5 lg:ml-2 ">
                                            <p className="text-slate-600 text-xs font-semibold text-center dark:text-white ">
                                              Sparepart Name
                                            </p>
                                          </div>
                                          <div className="flex items-center text-xs lg:w-4/12 w-3/12 justify-center p-2.5 ml-2">
                                            <p className="text-slate-600 font-semibold text-center dark:text-white">
                                              Posisi Part
                                            </p>
                                          </div>
                                          <div className="flex items-center text-xs lg:w-4/12 w-3/12 justify-center p-2.5 ml-2">
                                            <p className="text-slate-600 font-semibold text-center dark:text-white">

                                            </p>
                                          </div>

                                        </div>

                                        {masterSparepart.map(
                                          (
                                            SparepartMaster: any,
                                            ii: number,
                                          ) => {
                                            return (
                                              <div className="flex border-b border-stroke dark:border-strokedark ">
                                                <div className="flex items-center justify-start  w-1/12 gap-3 p-2.5 ">
                                                  <p className="hidden text-xs text-slate-600 font-semibold dark:text-white sm:block pl-5">
                                                    {ii + 1}
                                                  </p>
                                                </div>

                                                <div className="flex items-center lg:w-5/12 w-4/12 justify-center lg:p-2.5 lg:ml-2 ">
                                                  <p className="text-slate-600 text-xs font-semibold text-center dark:text-white ">
                                                    {SparepartMaster.kode}
                                                  </p>
                                                </div>
                                                <div className="flex items-center lg:w-5/12 w-4/12 justify-center lg:p-2.5 lg:ml-2 ">
                                                  <p className="text-slate-600 text-xs font-semibold text-center dark:text-white ">
                                                    {
                                                      SparepartMaster.nama_sparepart
                                                    }
                                                  </p>
                                                </div>
                                                <div className="flex items-center text-xs lg:w-4/12 w-3/12 justify-center p-2.5 ml-2">
                                                  <p className="text-slate-600 font-semibold text-center dark:text-white">
                                                    {
                                                      SparepartMaster.posisi_part
                                                    }
                                                  </p>
                                                </div>
                                                <div className="flex items-center text-xs lg:w-4/12 w-3/12 justify-center p-2.5 ml-2">

                                                  <button className='bg-primary w-20 text-white'
                                                    onClick={() => {
                                                      const onchangeVal: any = [
                                                        ...kebutuhanSparepart,
                                                      ];
                                                      onchangeVal[i][
                                                        'id_ms_sparepart'
                                                      ] = SparepartMaster.id;
                                                      onchangeVal[i][
                                                        'detail_ms_sparepart'
                                                      ] = {
                                                        kode: SparepartMaster.kode,
                                                        nama_sparepart:
                                                          SparepartMaster.nama_sparepart,
                                                        nama_mesin:
                                                          SparepartMaster.nama_mesin,
                                                        posisi_part:
                                                          SparepartMaster.posisi_part,
                                                        sisa_umur:
                                                          SparepartMaster.sisa_umur,
                                                        grade: SparepartMaster.grade_2
                                                      };
                                                      setKebutuhanSparepart(
                                                        onchangeVal,
                                                      );
                                                      closeModalMsStok();
                                                    }}
                                                  >
                                                    select
                                                  </button>
                                                </div>
                                              </div>
                                            );
                                          },
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}

                            <button
                              // onClick={() => {
                              //   setInfo(!info)
                              // }}
                              onClick={() => toggleInfo(i)}
                              className="bg-primary px-2 my-auto rounded-md mx-2 h-9 "
                            >
                              <img src={Info} alt="" />
                            </button>
                          </div>

                          <svg
                            className="lg:ml-4 ml-[2px]"
                            width="39"
                            height="39"
                            viewBox="0 0 39 39"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g clip-path="url(#clip0_708_3509)">
                              <path
                                d="M39 0H0V39H39V0Z"
                                fill="white"
                                fill-opacity="0.01"
                              />
                              <path
                                d="M14.625 25.1875H30.875V4.0625"
                                stroke="#777777"
                                stroke-width="3"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                              <path
                                d="M24.375 17.0625H8.125V34.9375"
                                stroke="#777777"
                                stroke-width="3"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                              <path
                                d="M35.75 8.9375L30.875 4.0625L26 8.9375"
                                stroke="#777777"
                                stroke-width="3"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                              <path
                                d="M13 30.0625L8.125 34.9375L3.25 30.0625"
                                stroke="#777777"
                                stroke-width="3"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                            </g>
                            <defs>
                              <clipPath id="clip0_708_3509">
                                <rect width="39" height="39" fill="white" />
                              </clipPath>
                            </defs>
                          </svg>
                          <div className='flex md:w-[35%] w-full'>

                            {data.id_stok == null ? (
                              <button
                                name="pengganti"
                                onClick={openModalStok}
                                className="lg:ml-4 ml-[2px] lg:w-[415px] w-[320px] h-9 bg-blue-700 rounded text-center text-white md:text-xs text-[9px] md:font-bold font-semibold"
                              >
                                PILIH PENGGANTI
                              </button>
                            ) : (
                              <button
                                name="pengganti"
                                onClick={openModalStok}
                                className="lg:ml-4 ml-[2px] w-[282px] h-9 bg-white rounded text-center text-[#0065DE] text-xs font-bold"
                              >
                                {data.detail_stok.nama_sparepart}
                              </button>


                            )}

                            {showModalStok && (
                              <div className="fixed shadow-md z-50 inset-0 backdrop-blur-sm bg-white/10 p-4 md:p-8 flex justify-center items-center  ">
                                <div className="w-full max-w-4xl  bg-white rounded-xl shadow-md h-[620px]">
                                  <div className="flex w-full items-center pt-4">
                                    <label className="flex lg:w-11/12 w-10/12 text-blue-700 text-sm font-bold mx-5">
                                      Sparepart Stok Check
                                    </label>
                                    <button
                                      type="button"
                                      onClick={closeModalStok}
                                      className="text-gray-400 focus:outline-none mr-5"
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
                                  <div className="px-5 pb-4">
                                    <div className="relative flex w-full gap-10 justify-start pb-2 pt-3">
                                      <select
                                        value={mesin}
                                        onChange={(e) => {
                                          setMesin(e.target.value);
                                          getStokSparepart(e.target.value);
                                          changeTextColor();
                                        }}
                                        className={`relative z-20 w-10/12 appearance-none rounded-md  text-xs bg-blue-100 py-1 px-2 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input ${isOptionSelected
                                          ? 'text-gray-800 dark:text-white '
                                          : ''
                                          }`}
                                      >
                                        <option
                                          value={mesin}
                                          selected
                                          disabled
                                          className="text-gray-800 text-xs font-light dark:text-bodydark"
                                        >
                                          {mesin}
                                        </option>
                                        {masterMesin != null &&
                                          masterMesin.map(
                                            (data: any, i: number) => {
                                              return (
                                                <option
                                                  value={data.nama_mesin}
                                                  className="text-gray-800 text-xs font-light dark:text-bodydark"
                                                >
                                                  {data.nama_mesin}
                                                </option>
                                              );
                                            },
                                          )}
                                      </select>
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
                                      <input
                                        type="text"
                                        className="flex py-2 lg:w-6/12 w-full text-black text-sm font-normal bg-blue-100 rounded h-full pl-2"
                                        placeholder="Search Sparepart..."
                                        id="searchInput"
                                      />

                                    </div>
                                    <div className=" border border-black rounded-md overflow-y-scroll h-80">
                                      <div className="flex border-b border-stroke dark:border-strokedark">
                                        <div className="flex items-center justify-start  w-1/12 gap-3 p-2.5 ">
                                          <p className="hidden text-[14px] text-slate-600 font-semibold dark:text-white sm:block pl-5">
                                            No
                                          </p>
                                        </div>

                                        <div className="flex items-center lg:w-5/12 w-4/12 justify-center lg:p-2.5 lg:ml-2 ">
                                          <p className="text-slate-600 text-[14px] font-semibold text-center dark:text-white ">
                                            Kode
                                          </p>
                                        </div>
                                        <div className="flex items-center lg:w-5/12 w-4/12 justify-center lg:p-2.5 lg:ml-2 ">
                                          <p className="text-slate-600 text-[14px] font-semibold text-center dark:text-white ">
                                            Sparepart Name
                                          </p>
                                        </div>
                                        <div className="flex items-center text-[14px] lg:w-4/12 w-3/12 justify-center p-2.5 ml-2">
                                          <p className="text-slate-600 font-semibold text-center dark:text-white">
                                            Qty
                                          </p>
                                        </div>
                                        <div className="flex items-center text-[14px] lg:w-4/12 w-3/12 justify-center p-2.5 ml-2">
                                          <p className="text-slate-600 font-semibold text-center dark:text-white">
                                            Umur
                                          </p>
                                        </div>
                                        <div className="flex items-center text-[14px] lg:w-4/12 w-3/12 justify-center p-2.5 ml-2">
                                          <p className="text-slate-600 font-semibold text-center dark:text-white">
                                            Grade
                                          </p>
                                        </div>
                                        <div className="flex items-center text-[14px] lg:w-4/12 w-3/12 justify-center p-2.5 ml-2">
                                          <p className="text-slate-600 font-semibold text-center dark:text-white">

                                          </p>
                                        </div>

                                      </div>

                                      {stokSparepart.map(
                                        (SparepartStok: any, ii: number) => {
                                          return (
                                            <div className="flex border-b border-stroke dark:border-strokedark">
                                              <div className="flex items-center justify-start  w-1/12 gap-3 p-2.5 ">
                                                <p className="hidden text-[14px] text-slate-600 font-semibold dark:text-white sm:block pl-5">
                                                  {ii + 1}
                                                </p>
                                              </div>

                                              <div className="flex items-center lg:w-5/12 w-4/12 justify-center lg:p-2.5 lg:ml-2 ">
                                                <p className="text-slate-600 text-[14px] font-semibold text-center dark:text-white ">
                                                  {SparepartStok.kode}
                                                </p>
                                              </div>
                                              <div className="flex items-center lg:w-5/12 w-4/12 justify-center lg:p-2.5 lg:ml-2 ">
                                                <p className="text-slate-600 text-[14px] font-semibold text-center dark:text-white ">
                                                  {SparepartStok.nama_sparepart}
                                                </p>
                                              </div>
                                              <div className="flex items-center text-[14px] lg:w-4/12 w-3/12 justify-center p-2.5 ml-2">
                                                <p className="text-slate-600 font-semibold text-center dark:text-white">
                                                  {SparepartStok.stok}
                                                </p>
                                              </div>
                                              <div className="flex items-center text-[14px] lg:w-4/12 w-3/12 justify-center p-2.5 ml-2">
                                                <p className="text-slate-600 font-semibold text-center dark:text-white">
                                                  {SparepartStok.umur_sparepart}
                                                </p>
                                              </div>
                                              <div className="flex items-center text-[14px] lg:w-4/12 w-3/12 justify-center p-2.5 ml-2">
                                                <p className="text-slate-600 font-semibold text-center dark:text-white">
                                                  {SparepartStok.grade}
                                                </p>
                                              </div>
                                              <div className='my-auto lg:w-4/12 w-3/12 justify-center p-2.5 ml-2'>

                                                <button className='bg-primary w-20 text-white'
                                                  onClick={() => {
                                                    const onchangeVal: any = [
                                                      ...kebutuhanSparepart,
                                                    ];
                                                    onchangeVal[i]['id_stok'] =
                                                      SparepartStok.id;
                                                    onchangeVal[i][
                                                      'detail_stok'
                                                    ] = {
                                                      kode: SparepartStok.kode,
                                                      part_number:
                                                        SparepartStok.part_number,
                                                      nama_sparepart:
                                                        SparepartStok.nama_sparepart,
                                                      nama_mesin:
                                                        SparepartStok.nama_mesin,
                                                      lokasi:
                                                        SparepartStok.lokasi,
                                                      umur: SparepartStok.umur_sparepart,
                                                      grade: SparepartStok.grade,
                                                    };
                                                    setKebutuhanSparepart(
                                                      onchangeVal,
                                                    );

                                                    closeModalStok();
                                                  }}
                                                >
                                                  select
                                                </button>
                                              </div>
                                            </div>
                                          );
                                        },
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            <button
                              onClick={() => toggleInfoPengganti(i)}
                              className="bg-primary px-2 my-auto rounded-md mx-2 h-9 "
                            >
                              <img src={Info} alt="" />
                            </button>
                          </div>
                          <div className='flex md:w-2/12 w-full md:mt-0 mt-2'>

                            <div className="w-[130px] h-9 lg:ml-2 ml-[2px] bg-[#EDF5FF] rounded text-center text-[#0065DE] text-xs font-bold lg:pt-[9px] pt-[10px] px-1">
                              {data.detail_stok.grade == ''
                                ? ''
                                : data.detail_stok.grade}
                            </div>
                            <button
                              name="pengganti"
                              onClick={() => handleDeletePoint(i)}
                              className="lg:ml-2 ml-[2px] w-[39px] h-9 bg-[#DE0000] rounded justify-items-center mx-auto"
                            >
                              <svg
                                className=" mx-auto"
                                width="14"
                                height="14"
                                viewBox="0 0 14 14"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <rect
                                  x="1.61621"
                                  width="16.5722"
                                  height="2.28582"
                                  rx="1.14291"
                                  transform="rotate(45 1.61621 0)"
                                  fill="white"
                                />
                                <rect
                                  y="11.7183"
                                  width="16.5722"
                                  height="2.28582"
                                  rx="1.14291"
                                  transform="rotate(-45 0 11.7183)"
                                  fill="white"
                                />
                              </svg>
                            </button>
                          </div>
                        </>


                      </div>
                      <div className="grid grid-cols-2 gap-10">
                        <div className="w-80">
                          {info[i] && (
                            <>
                              <div
                                onFocus={() => setInfo({ ...info, [i]: true })}
                                onBlur={() => setInfo({ ...info, [i]: false })}
                                className={` mt-1 mb-5 flex w-80 flex-col rounded-md border border-stroke bg-white shadow-md dark:border-strokedark dark:bg-boxdark ${info[i] ? 'block' : 'hidden'
                                  }`}
                              >
                                <div className="flex flex-col bg-blue-100 shadow-md">
                                  <p className="text-xs font-bold text-primary p-2">
                                    Info Starepart Rusak
                                  </p>
                                  <div className=" p-2">
                                    <p className="text-xs font-semibold">Umur</p>
                                    <p className="text-xs">{data.detail_ms_sparepart.sisa_umur}</p>
                                    <div className=" text-[9px] mt-2">
                                      <p className="font-semibold text-xs">Grade</p>
                                      <p className="text-xs">{data.detail_ms_sparepart.grade}</p>
                                    </div>

                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                        {infoPengganti[i] && (
                          <>
                            <div
                              onFocus={() => setInfoPengganti({ ...infoPengganti, [i]: true })}
                              onBlur={() => setInfoPengganti({ ...infoPengganti, [i]: false })}
                              className={`  mt-1 mb-5 flex w-80 flex-col rounded-md border border-stroke bg-white shadow-md dark:border-strokedark dark:bg-boxdark ${infoPengganti[i] ? 'block' : 'hidden'
                                }`}
                            >
                              <div className="flex flex-col bg-blue-100 shadow-md">
                                <p className="text-xs font-bold text-primary p-2">
                                  Info Starepart Pengganti
                                </p>
                                <div className=" p-2">
                                  <p className="text-xs font-semibold">Umur</p>
                                  <p className="text-xs">{data.detail_stok.umur}</p>
                                  <div className=" text-[9px] mt-2">
                                    <p className="font-semibold text-xs">Grade</p>
                                    <p className="text-xs">{data.detail_stok.grade}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </>
                  );
                })}
              </>


            </div>
          </div>

          <div className="flex gap-10 pt-1">
            <button
              onClick={handleAddPoint}
              className="lg:w-60 w-30 h-12 bg-blue-700 rounded text-center text-white text-xs font-bold"
            >
              +
            </button>
          </div>



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
                        console.log('normal');
                      } else {
                        setTypePost('pending');
                        console.log('pending');
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
                {typePost == 'pending' ? (
                  <>
                    <h2>TIPE PENDING</h2>
                    <div className="flex gap-5 mt-5">
                      <div className="flex gap-2">
                        <input
                          onChange={(e) => setAlasanPending(e.target.value)}
                          type="radio"
                          id="man"
                          name="option"
                          value="man"
                        />
                        <label htmlFor="man">Man</label>
                        <br />
                      </div>
                      <div className="flex gap-2">
                        <input
                          onChange={(e) => setAlasanPending(e.target.value)}
                          type="radio"
                          id="sparepart"
                          name="option"
                          value="sparepart"
                        />
                        <label htmlFor="sparepart">Sparepart</label>
                        <br />
                      </div>
                      <div className="flex gap-2">
                        <input
                          onChange={(e) => setAlasanPending(e.target.value)}
                          type="radio"
                          id="time"
                          name="option"
                          value="time"
                        />
                        <label htmlFor="time">Time</label>
                        <br />
                      </div>
                    </div>
                  </>
                ) : (
                  ''
                )}
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

              disabled={isLoading}
              onClick={() => {
                postAnalisis();
                //onClose;
                // onFinish();
              }}
              className="w-full h-12 text-center text-white text-xs font-bold bg-blue-700 rounded-md"
            >
              {isLoading ? 'Loading...' : 'SIMPAN'}
            </button>
            {isLoading && <Loading />}
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (skor_mtc != 0) {
              deleteExit(idTiket, idProses);
            }
            onClose();
          }}
          className="absolute top-auto right-auto bottom-3 left-auto transform translate-x-1/2 translate-y-1/2 text-gray-400 focus:outline-none"
        ></button>
        {children}
      </div>
    </div>
  );
};

export default ModalStockCheck1;
