// import React, { useState } from 'react';

import { useEffect, useRef, useState } from 'react';
import CheckStockPengganti from '../Tables/Modals/SparepartPengganti';
import axios from 'axios';
import Info from '../../images/icon/Info.svg';
import convertDateToTime from '../../utils/converDateToTime';

const ModalStockCheckOs3 = ({
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
  const [isOptionSelected, setIsOptionSelected] = useState<boolean>(false);
  const [unitMaintenance, setUnitMaintenance] = useState<any>();
  const [bagianMaintenance, setBagianMaintenance] = useState<any>();

  const changeTextColor = () => {
    setIsOptionSelected(true);
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

  const [sumber, setSumber] = useState(kodeLkh);

  function convertDatetimeToDate(datetime: any) {
    const dateObject = new Date(datetime);
    const day = dateObject.getDate().toString().padStart(2, '0'); // Ensure two-digit day
    const month = (dateObject.getMonth() + 1).toString().padStart(2, '0'); // Adjust for zero-based month
    const year = dateObject.getFullYear();

    return `${year}/${month}/${day}`; // Example format (YYYY-MM-DD)
  }

  const tanggalPeriksa = convertDatetimeToDate(tgl);
  const waktuPeriksa = convertDateToTime(jam);

  const [typePost, setTypePost] = useState<any>('normal');

  const [mesin, setMesin] = useState<any>(namaMesin);
  const [masterMesin, setmasterMesin] = useState<any>();

  const [selectedKodeAnalisis, setSelectedKodeAnalisis] = useState<any>();
  const [selectedSkorPerbaikan, setSelectedSkorPerbaikan] = useState<any>();
  const [noteMaintenance, setNoteMaintenance] = useState<any>();
  const [alasanPending, setAlasanPending] = useState<any>();

  const [kodeAnalisis, setKodeAnalisis] = useState<any>(null);
  const [skorPerbaikan, setSkorPerbaikan] = useState<any>(null);
  const [kebutuhanSparepart, setKebutuhanSparepart] = useState<any>([]);

  useEffect(() => {
    getKodeAnalisis();
    getSkorPerbaikan();
    getStokSparepart(mesin);
    getMasterMesin();
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

  async function postAnalisis() {
    const urlNormal = `${
      import.meta.env.VITE_API_LINK
    }/ticketOs3/analisis/${idTiket}`;
    const urlPending = `${
      import.meta.env.VITE_API_LINK
    }/ticketOs3/pending/${idTiket}`;
    try {
      if (typePost === 'normal') {
        const res = await axios.put(
          urlNormal,
          {
            id_proses: idProses,
            kode_analisis_mtc: selectedKodeAnalisis.kode_analisis,
            nama_analisis_mtc: selectedKodeAnalisis.nama_analisis,
            jenis_analisis_mtc: selectedKodeAnalisis.bagian_analisis,
            note_analisis: '',
            masalah_sparepart: kebutuhanSparepart,
            skor_mtc: selectedSkorPerbaikan.skor,
            cara_perbaikan: selectedSkorPerbaikan.nama_skor,
            note_mtc: noteMaintenance,
            unit: unitMaintenance,
            bagian_mesin: bagianMaintenance,
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
            alasan_pending: alasanPending,
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
          grade: '',
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
  const [infoPengganti, setInfoPengganti] = useState<{
    [key: number]: boolean;
  }>({});
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

  // First, fix the state initialization to be consistent
  const [stokSparepart, setStokSparepart] = useState<any[]>([]);
  const [displayedStokSparepart, setDisplayedStokSparepart] = useState<any[]>(
    [],
  );
  const [masterSparepart, setMasterSparepart] = useState<any[]>([]);
  const [displayedMasterSparepart, setDisplayedMasterSparepart] = useState<
    any[]
  >([]);

  // Modified API functions to update both the main data and displayed data
  async function getStokSparepart(idMesin: any) {
    const url = `${import.meta.env.VITE_API_LINK}/stokSparepart`;
    try {
      const res = await axios.get(url, {
        params: {
          id_mesin: idMesin,
        },
        withCredentials: true,
      });

      setStokSparepart(res.data);
      setDisplayedStokSparepart(res.data); // Also update the displayed data
      console.log(res.data);
    } catch (error: any) {
      console.log(error?.data?.msg || error);
    }
  }

  async function getMasterSparepart(id_mesin: any) {
    const url = `${import.meta.env.VITE_API_LINK}/master/sparepart`;
    try {
      const res = await axios.get(url, {
        params: {
          id_mesin: id_mesin,
        },
        withCredentials: true,
      });

      setMasterSparepart(res.data);
      setDisplayedMasterSparepart(res.data); // Also update the displayed data
      console.log(res.data);
    } catch (error: any) {
      console.log(error);
    }
  }

  // Improved search handler with null checks
  const handleSearch = (
    searchTerm: string,
    type: 'masterSparepart' | 'stokSparepart',
  ) => {
    if (type === 'masterSparepart') {
      // Check if masterSparepart is available to search
      if (!masterSparepart || masterSparepart.length === 0) {
        return;
      }

      if (!searchTerm) {
        // Reset to original data
        setDisplayedMasterSparepart(masterSparepart);
        return;
      }

      const filteredData = masterSparepart.filter(
        (item: any) =>
          (item.nama_sparepart &&
            item.nama_sparepart
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (item.kode &&
            item.kode.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.posisi_part &&
            item.posisi_part.toLowerCase().includes(searchTerm.toLowerCase())),
      );

      setDisplayedMasterSparepart(filteredData);
    } else {
      // Check if stokSparepart is available to search
      if (!stokSparepart || stokSparepart.length === 0) {
        return;
      }

      if (!searchTerm) {
        // Reset to original data
        setDisplayedStokSparepart(stokSparepart);
        return;
      }

      const filteredData = stokSparepart.filter(
        (item: any) =>
          (item.nama_sparepart &&
            item.nama_sparepart
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (item.kode &&
            item.kode.toLowerCase().includes(searchTerm.toLowerCase())),
      );

      setDisplayedStokSparepart(filteredData);
    }
  };
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
                  className="form-label block  text-black text-sm font-extrabold"
                >
                  Point PM
                </label>
              </div>
              <div>
                <span
                  id="kendala"
                  className="text-neutral-500 text-xl font-normal"
                >
                  <div className="">{sumber}</div>
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
                    className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input ${
                      isOptionSelected ? 'text-black dark:text-white' : ''
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
          <div className="flex  w-6/12">
            <label className="form-label block  text-black text-xs font-extrabold mt-3">
              UNIT
            </label>
          </div>
          <input
            type="text"
            onChange={(e) => setUnitMaintenance(e.target.value)}
            className="lg:w-[400px] rounded-md border border-stroke px-2 py-2"
          />
          <div className="flex  w-6/12">
            <label className="form-label block  text-black text-xs font-extrabold mt-3">
              BAGIAN
            </label>
          </div>
          <input
            type="text"
            onChange={(e) => setBagianMaintenance(e.target.value)}
            className="lg:w-[400px] rounded-md border border-stroke px-2 py-2"
          />
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

          <div className="flex w-full pt-2"></div>
          <div className="flex w-full pt-2">
            <label className="form-label block  text-black text-xs font-extrabold mt-3">
              KEBUTUHAN SPAREPART
            </label>
          </div>

          <div className="mx-auto">
            <div className="pb-2">
              <>
                {kebutuhanSparepart.map((data: any, i: number) => {
                  return (
                    <>
                      <div className="md:flex mb-2 px-3 py-2 bg-[#D8EAFF] rounded-md shadow-sm">
                        <>
                          <span className="hidden sm:flex text-blue-700 text-xs font-bold items-center px-2">
                            {i + 1}
                          </span>
                          <div className="flex md:w-[35%] w-full">
                            {data.id_ms_sparepart == null ? (
                              <button
                                onClick={openModalMsStok}
                                name="rusak"
                                className="flex-grow bg-blue-700 hover:bg-blue-800 transition-colors h-9 rounded text-white text-xs font-semibold"
                              >
                                PILIH SPAREPART RUSAK
                              </button>
                            ) : (
                              <button
                                name="rusak"
                                onClick={openModalMsStok}
                                className="flex-grow bg-white border border-blue-200 h-9 rounded text-[#0065DE] text-xs font-semibold"
                              >
                                {data.detail_ms_sparepart.nama_sparepart}
                              </button>
                            )}

                            <button
                              onClick={() => toggleInfo(i)}
                              className="bg-primary hover:bg-blue-800 transition-colors px-2 rounded-md mx-2 h-9 flex items-center justify-center"
                              title="Info Sparepart Rusak"
                            >
                              <img src={Info} alt="Info" />
                            </button>
                          </div>

                          <div className="flex items-center justify-center mx-2 md:mx-4">
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 39 39"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M14.625 25.1875H30.875V4.0625"
                                stroke="#777777"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M24.375 17.0625H8.125V34.9375"
                                stroke="#777777"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M35.75 8.9375L30.875 4.0625L26 8.9375"
                                stroke="#777777"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M13 30.0625L8.125 34.9375L3.25 30.0625"
                                stroke="#777777"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>

                          <div className="flex md:w-[35%] w-full">
                            {data.id_stok == null ? (
                              <button
                                name="pengganti"
                                onClick={openModalStok}
                                className="flex-grow bg-blue-700 hover:bg-blue-800 transition-colors h-9 rounded text-white text-xs font-semibold"
                              >
                                PILIH PENGGANTI
                              </button>
                            ) : (
                              <button
                                name="pengganti"
                                onClick={openModalStok}
                                className="flex-grow bg-white border border-blue-200 h-9 rounded text-[#0065DE] text-xs font-semibold"
                              >
                                {data.detail_stok.nama_sparepart}
                              </button>
                            )}

                            <button
                              title="Info Sparepart Pengganti"
                              onClick={() => toggleInfoPengganti(i)}
                              className="bg-primary hover:bg-blue-800 transition-colors px-2 rounded-md mx-2 h-9 flex items-center justify-center"
                            >
                              <img src={Info} alt="Info" />
                            </button>
                          </div>

                          <div className="flex md:w-2/12 w-full md:mt-0 mt-2">
                            <div className="flex-grow h-9 bg-[#EDF5FF] rounded flex items-center justify-center text-[#0065DE] text-xs font-semibold">
                              {data.detail_stok.grade || '-'}
                            </div>
                            <button
                              name="delete"
                              onClick={() => handleDeletePoint(i)}
                              className="ml-2 w-9 h-9 bg-[#DE0000] hover:bg-red-700 transition-colors rounded flex items-center justify-center"
                              title="Delete"
                            >
                              <svg
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

                      {/* Info tooltips */}
                      <div className="grid grid-cols-2 gap-10">
                        {info[i] && (
                          <div className="w-80 mt-1 mb-3 rounded-md border border-blue-200 bg-white shadow-md">
                            <div className="bg-blue-100">
                              <p className="text-xs font-bold text-primary p-2">
                                Info Sparepart Rusak
                              </p>
                              <div className="p-2">
                                <p className="text-xs font-semibold">Umur</p>
                                <p className="text-xs">
                                  {data.detail_ms_sparepart.sisa_umur}
                                </p>
                                <div className="mt-2">
                                  <p className="font-semibold text-xs">Grade</p>
                                  <p className="text-xs">
                                    {data.detail_ms_sparepart.grade}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {infoPengganti[i] && (
                          <div className="w-80 mt-1 mb-3 rounded-md border border-blue-200 bg-white shadow-md">
                            <div className="bg-blue-100">
                              <p className="text-xs font-bold text-primary p-2">
                                Info Sparepart Pengganti
                              </p>
                              <div className="p-2">
                                <p className="text-xs font-semibold">Umur</p>
                                <p className="text-xs">
                                  {data.detail_stok.umur}
                                </p>
                                <div className="mt-2">
                                  <p className="font-semibold text-xs">Grade</p>
                                  <p className="text-xs">
                                    {data.detail_stok.grade}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Modal for Sparepart Rusak */}
                      {showModalMsStok && (
                        <div className="fixed z-50 inset-0 backdrop-blur-sm bg-black/30 p-4 md:p-8 flex justify-center items-center">
                          <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg h-full overflow-y-auto">
                            <div className="flex items-center justify-between p-4 border-b">
                              <h3 className="text-blue-700 text-sm font-bold">
                                Sparepart Master Check
                              </h3>
                              <button
                                type="button"
                                onClick={closeModalMsStok}
                                className="text-gray-400 hover:text-gray-600 focus:outline-none"
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

                            <div className="p-4">
                              <div className="flex gap-4 mb-4">
                                <select
                                  onChange={(e) => {
                                    getMasterSparepart(e.target.value);
                                    changeTextColor();
                                  }}
                                  className={`flex-grow appearance-none rounded-md text-xs bg-blue-100 py-2 px-3 outline-none focus:ring-2 focus:ring-blue-500 ${
                                    isOptionSelected ? 'text-gray-800' : ''
                                  }`}
                                >
                                  <option
                                    value=""
                                    selected
                                    disabled
                                    className="text-gray-500"
                                  >
                                    SELECT MESIN
                                  </option>
                                  {masterMesin != null &&
                                    masterMesin?.map((data: any, i: number) => (
                                      <option value={data.id} key={i}>
                                        {data.nama_mesin}
                                      </option>
                                    ))}
                                </select>

                                <div className="relative flex-grow">
                                  <input
                                    type="text"
                                    className="w-full py-2 px-3 text-sm bg-blue-100 rounded-md pl-10"
                                    placeholder="Search Sparepart..."
                                    id="searchInput"
                                    onChange={(e) =>
                                      handleSearch(
                                        e.target.value,
                                        'masterSparepart',
                                      )
                                    }
                                  />
                                  <div className="absolute inset-y-0 left-3 flex items-center">
                                    <svg
                                      width="16"
                                      height="16"
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
                              </div>

                              <div className="border rounded-md overflow-hidden">
                                <table className="w-full">
                                  <thead className="bg-gray-50 border-b">
                                    <tr>
                                      <th className="text-left text-xs font-semibold text-gray-600 p-3 w-12">
                                        No
                                      </th>
                                      <th className="text-left text-xs font-semibold text-gray-600 p-3">
                                        Kode
                                      </th>
                                      <th className="text-left text-xs font-semibold text-gray-600 p-3">
                                        Sparepart Name
                                      </th>
                                      <th className="text-left text-xs font-semibold text-gray-600 p-3">
                                        Posisi Part
                                      </th>
                                      <th className="w-24"></th>
                                    </tr>
                                  </thead>
                                  <tbody
                                    className="divide-y divide-gray-200 overflow-y-auto"
                                    style={{ maxHeight: '400px' }}
                                  >
                                    {displayedMasterSparepart.map(
                                      (SparepartMaster: any, ii: number) => (
                                        <tr
                                          key={ii}
                                          className="hover:bg-gray-50"
                                        >
                                          <td className="p-3 text-xs">
                                            {ii + 1}
                                          </td>
                                          <td className="p-3 text-xs">
                                            {SparepartMaster.kode}
                                          </td>
                                          <td className="p-3 text-xs">
                                            {SparepartMaster.nama_sparepart}
                                          </td>
                                          <td className="p-3 text-xs">
                                            {SparepartMaster.posisi_part}
                                          </td>
                                          <td className="p-3">
                                            <button
                                              className="bg-primary hover:bg-blue-700 transition-colors text-white text-xs py-1 px-3 rounded w-full"
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
                                                  grade:
                                                    SparepartMaster.grade_2,
                                                };
                                                setKebutuhanSparepart(
                                                  onchangeVal,
                                                );
                                                closeModalMsStok();
                                              }}
                                            >
                                              Select
                                            </button>
                                          </td>
                                        </tr>
                                      ),
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Modal for Sparepart Pengganti */}
                      {showModalStok && (
                        <div className="fixed z-50 inset-0 backdrop-blur-sm bg-black/30 p-4 md:p-8 flex justify-center items-center">
                          <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg h-full overflow-y-auto">
                            <div className="flex items-center justify-between p-4 border-b">
                              <h3 className="text-blue-700 text-sm font-bold">
                                Sparepart Stok Check
                              </h3>
                              <button
                                type="button"
                                onClick={closeModalStok}
                                className="text-gray-400 hover:text-gray-600 focus:outline-none"
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

                            <div className="p-4">
                              <div className="flex gap-4 mb-4">
                                <select
                                  onChange={(e) => {
                                    getStokSparepart(e.target.value);
                                    changeTextColor();
                                  }}
                                  className={`flex-grow appearance-none rounded-md text-xs bg-blue-100 py-2 px-3 outline-none focus:ring-2 focus:ring-blue-500 ${
                                    isOptionSelected ? 'text-gray-800' : ''
                                  }`}
                                >
                                  <option
                                    value=""
                                    selected
                                    disabled
                                    className="text-gray-500"
                                  >
                                    SELECT MESIN
                                  </option>
                                  {masterMesin != null &&
                                    masterMesin?.map((data: any, i: number) => (
                                      <option value={data.id} key={i}>
                                        {data.nama_mesin}
                                      </option>
                                    ))}
                                </select>

                                <div className="relative flex-grow">
                                  <input
                                    type="text"
                                    className="w-full py-2 px-3 text-sm bg-blue-100 rounded-md pl-10"
                                    placeholder="Search Sparepart..."
                                    onChange={(e) =>
                                      handleSearch(
                                        e.target.value,
                                        'stokSparepart',
                                      )
                                    }
                                  />
                                  <div className="absolute inset-y-0 left-3 flex items-center">
                                    <svg
                                      width="16"
                                      height="16"
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
                              </div>

                              <div className="border rounded-md overflow-hidden">
                                <table className="w-full">
                                  <thead className="bg-gray-50 border-b">
                                    <tr>
                                      <th className="text-left text-xs font-semibold text-gray-600 p-3 w-12">
                                        No
                                      </th>
                                      <th className="text-left text-xs font-semibold text-gray-600 p-3">
                                        Kode
                                      </th>
                                      <th className="text-left text-xs font-semibold text-gray-600 p-3">
                                        Sparepart Name
                                      </th>
                                      <th className="text-center text-xs font-semibold text-gray-600 p-3 w-16">
                                        Qty
                                      </th>
                                      <th className="text-center text-xs font-semibold text-gray-600 p-3 w-16">
                                        Umur
                                      </th>
                                      <th className="text-center text-xs font-semibold text-gray-600 p-3 w-16">
                                        Grade
                                      </th>
                                      <th className="w-24"></th>
                                    </tr>
                                  </thead>
                                  <tbody
                                    className="divide-y divide-gray-200 overflow-y-auto"
                                    style={{ maxHeight: '400px' }}
                                  >
                                    {displayedStokSparepart?.map(
                                      (SparepartStok: any, ii: number) => (
                                        <tr
                                          key={ii}
                                          className="hover:bg-gray-50"
                                        >
                                          <td className="p-3 text-xs">
                                            {ii + 1}
                                          </td>
                                          <td className="p-3 text-xs">
                                            {SparepartStok.kode}
                                          </td>
                                          <td className="p-3 text-xs">
                                            {SparepartStok.nama_sparepart}
                                          </td>
                                          <td className="p-3 text-xs text-center">
                                            {SparepartStok.stok}
                                          </td>
                                          <td className="p-3 text-xs text-center">
                                            {SparepartStok.umur_sparepart}
                                          </td>
                                          <td className="p-3 text-xs text-center">
                                            {SparepartStok.grade}
                                          </td>
                                          <td className="p-3">
                                            {SparepartStok.stok > 0 ? (
                                              <button
                                                className="bg-primary hover:bg-blue-700 transition-colors text-white text-xs py-1 px-3 rounded w-full"
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
                                                Select
                                              </button>
                                            ) : (
                                              <span className="text-xs text-gray-400">
                                                Out of Stock
                                              </span>
                                            )}
                                          </td>
                                        </tr>
                                      ),
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
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
                    className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input ${
                      isOptionSelected ? 'text-black dark:text-white' : ''
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
                ANALISIS PENYEBAB DAN DETAIL TINDAKAN
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
          title="title"
          type="button"
          onClick={onClose}
          className="absolute top-auto right-auto bottom-3 left-auto transform translate-x-1/2 translate-y-1/2 text-gray-400 focus:outline-none"
        ></button>
        {children}
      </div>
    </div>
  );
};

export default ModalStockCheckOs3;
