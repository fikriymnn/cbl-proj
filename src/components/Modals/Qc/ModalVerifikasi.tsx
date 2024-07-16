// import React, { useState } from 'react';

import { useEffect, useRef, useState } from 'react';
import CheckStockPengganti from '../../Tables/Modals/SparepartPengganti';
import axios from 'axios';
import Info from '../../../images/icon/Info.svg';

import Loading from '../../Loading';

const ModalVerifikasi = ({
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
  jenis_perbaikan,
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
  jenis_perbaikan: any;
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

  const [stokSparepart, setStokSparepart] = useState<any>([]);
  const [masterSparepart, setMasterSparepart] = useState<any>(null);
  const [kebutuhanSparepart, setKebutuhanSparepart] = useState<any>([]);

  useEffect(() => {
    getKodeAnalisis();
    getSkorPerbaikan();
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
  const [isLoading, setIsLoading] = useState(false);

  async function postAnalisis() {
    const urlNormal = `${
      import.meta.env.VITE_API_LINK
    }/ticket/analisis/${idTiket}`;
    const urlPending = `${
      import.meta.env.VITE_API_LINK
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
            jenis_analisis_mtc: selectedKodeAnalisis.bagian_analisis,
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
              if (skor_mtc != 0 && jenis_perbaikan == null) {
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
          <div>
          <label
                htmlFor="namaPemeriksa"
                className="form-label block  text-black text-xs font-extrabold my-2 "
              >
                CATATAN
              </label>
            <textarea className='w-full border border-neutral-600 h-56 p-2 rounded-sm'  name="" id=""></textarea>
          </div>
         

        
        {children}
      </div>
    </div>
    </div>
  );
};

export default ModalVerifikasi;
