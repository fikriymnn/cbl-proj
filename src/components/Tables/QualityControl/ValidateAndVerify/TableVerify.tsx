import { BRAND } from '../../../../types/brand';
// import BrandOne from '../../images/brand/brand-01.svg';
// import BrandTwo from '../../images/brand/brand-02.svg';
// import BrandThree from '../../images/brand/brand-03.svg';
// import BrandFour from '../../images/brand/brand-04.svg';
// import BrandFive from '../../images/brand/brand-05.svg';
import { useEffect, useState } from 'react';
import Modal from '../../../Modals/ModalDetailPopup';
// import Gambar from '../../images/BACKGROUND.png';
import Logo from '../../images/logo/logo-cbl 1.svg';
import axios from 'axios';
import Stack from '@mui/material/Stack';
import Pagination from '@mui/material/Pagination';
import convertTimeStampToDate from '../../../../utils/convertDate';
import ModalStockCheck1 from '../../../Modals/ModalStockCheck1';
import zIndex from '@mui/material/styles/zIndex';
import ModalVerifikasi from '../../../Modals/Qc/ModalVerifikasi';
import calculateTime from '../../../../utils/calculateTime';

const TableVerifikasi = () => {
  const [page, setPage] = useState(1);
  const [user, setUser] = useState<any>();
  const [aksiOn, setAksiOn] = useState(null);
  const [showModal1, setShowModal1] = useState<any>([]);
  const [ticketVerifikasi, setTicketVerifikasi] = useState<any>(null);
  const [note, setNote] = useState<any>('');
  const handleClick = (index: any) => {
    setAksiOn((prevState: any) => {
      return prevState === index ? null : index;
    });
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
    getMTC();
    getUser();
  }, [page]);

  async function getUser() {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_LINK}/me`, {
        withCredentials: true,
        // headers: {
        //   Authorization: `Bearer ${cookies.access_token}`,
        // },
      });

      setUser(res.data);
      console.log(res.data);
    } catch (error: any) {
      console.log(error.response);
    }
  }

  async function getMTC() {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/ticket?status_tiket=request to qc`;
    try {
      const res = await axios.get(url, {
        params: {
          page: page,
          limit: 10,
        },
        withCredentials: true,
      });

      setTicketVerifikasi(res.data);

      console.log(res.data);
    } catch (error: any) {
      console.log(error.response);
    }
  }

  async function verifikasiTicket(id: number, id_proses: number) {
    const url = `${import.meta.env.VITE_API_LINK}/ticket/verifikasiQc/${id}`;
    try {
      const res = await axios.put(
        url,
        {
          id_proses: id_proses,
          id_qc: user.id,
          note_qc: note,
        },
        {
          withCredentials: true,
        },
      );

      alert('success');

      getMTC();
    } catch (error: any) {
      console.log(error.response);
    }
  }

  async function tolakTicket(id: number, id_proses: number) {
    const url = `${import.meta.env.VITE_API_LINK}/ticket/rejectQc/${id}`;
    try {
      const res = await axios.put(
        url,
        {
          id_proses: id_proses,
          id_qc: user.id,
          note_qc: note,
        },
        {
          withCredentials: true,
        },
      );

      alert('success');

      getMTC();
    } catch (error: any) {
      console.log(error.response);
    }
  }
  return (
    <div className="flex flex-col gap-2">
      <div className="flex w-full border border-stroke bg-white py-3 shadow-default dark:border-strokedark dark:bg-boxdark pb-3">
        <div className="flex w-5 ml-2 mr-5 ">
          <p className="text-slate-600  text-[14px] font-semibold  dark:text-white">
            No
          </p>
        </div>
        <div className="flex flex-col w-full">
          <div className="grid grid-cols-12 gap-5 dark:border-strokedark  w-full">
            <div className="flex w-full justify-start col-span-2 ">
              <p className="text-slate-600  text-[14px] font-semibold  dark:text-white">
                Kode Tiket
              </p>
            </div>
            <div className="flex w-full text-[14px] justify-start col-span-2 ">
              <p className="text-slate-600 font-semibold  dark:text-white">
                Waktu Masuk
              </p>
            </div>

            <div className="flex w-full text-[14px] justify-start ">
              <p className="text-slate-600 font-semibold ">Mesin</p>
            </div>
            <div className="flex w-full text-[14px] justify-start col-span-2">
              <p className="text-slate-600 font-semibold ">Kendala</p>
            </div>
            <div className="flex w-full text-[14px] justify-start col-span-2 ">
              <p className="text-slate-600 font-semibold ">Persentase</p>
            </div>
            <div className="flex w-full text-[14px] justify-start  ">
              <p className="text-slate-600 font-semibold ">Eksekutor</p>
            </div>
            <div className="flex w-full text-[14px] justify-center  col-span-2 ">
              <p className="text-slate-600 font-semibold ">Aksi</p>
            </div>
          </div>
        </div>
      </div>
      {ticketVerifikasi?.data.map((data: any, index: number) => {
        const lengthProses = data.proses_mtcs.length - 1;
        const lengthProsesSebelum = lengthProses - 1;
        const skorAwal =
          lengthProses == 0
            ? 0
            : data.proses_mtcs[lengthProsesSebelum].skor_mtc;
        const skorBaru = data.proses_mtcs[lengthProses].skor_mtc;
        const tglTicket = convertTimeStampToDate(data.waktu_selesai_mtc);
        const waktuPengerjaan = calculateTime(
          data.proses_mtcs[lengthProses].waktu_mulai_mtc,
          data.proses_mtcs[lengthProses].waktu_selesai_mtc,
        );
        console.log(lengthProses);
        return (
          <div
            key={index}
            className="flex rounded-xl border  border-stroke bg-white py-3 shadow-default dark:border-strokedark dark:bg-boxdark "
          >
            <div className="flex items-center w-5 ml-2 mr-5 ">
              <p className="text-slate-600  text-[14px]   dark:text-white">
                {index + 1}
              </p>
            </div>
            <div className="grid grid-cols-12 gap-5 w-full dark:border-strokedark items-center">
              <div className="flex w-full justify-start col-span-2 gap-8 ">
                <p className="text-neutral-500 text-sm font-light  dark:text-white break-all">
                  {' '}
                  {data.kode_ticket}
                </p>
              </div>
              <div className="flex w-full text-[14px] justify-start col-span-2 ">
                <p className="text-neutral-500 text-sm font-light  dark:text-white">
                  {tglTicket}
                </p>
              </div>

              <div className="flex w-full text-[14px] justify-start ">
                <p className="text-neutral-500 text-sm font-light ">
                  {data.mesin}
                </p>
              </div>
              <div className="flex w-full text-[14px] justify-start col-span-2">
                <p className="text-neutral-500 text-sm font-light ">
                  {data.kode_lkh + ' - ' + data.nama_kendala}
                </p>
              </div>
              <div className="flex w-full text-[14px] justify-start col-span-2 items-center gap-2">
                <p className="px-2 rounded-full text-sm font-light text-orange-600 bg-orange-200 ">
                  {skorAwal}
                </p>

                <svg
                  width="23"
                  height="8"
                  viewBox="0 0 23 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0 3.82353H22M22 3.82353L19.25 1M22 3.82353L19.25 7"
                    stroke="#0065DE"
                  />
                </svg>

                <p className="px-2 rounded-full text-sm font-light text-[#FCBF11] bg-[#FFF2B1] ">
                  {skorBaru}
                </p>
              </div>
              <div className="flex w-full text-[14px] justify-start ">
                <p className="text-neutral-500 text-sm font-light ">
                  {data.proses_mtcs[lengthProses].user_eksekutor.nama}
                </p>
              </div>
              <div className="flex flex-col items-center w-full text-[14px] justify-end col-span-2">
                <button
                  onClick={() => openModal1(index)}
                  className="text-xs font-bold bg-blue-700 py-2 px-2 w-20 text-white rounded-sm"
                >
                  Aksi
                </button>

                {showModal1[index] == true && (
                  <ModalVerifikasi
                    kodeTiket={data.kode_ticket}
                    isOpen={showModal1[index]}
                    waktuMasuk={data.createdAt}
                    persentaseAwal={skorAwal}
                    onClose={() => closeModal1(index)}
                    onFinish={undefined}
                    kendala={data.kode_lkh + ' - ' + data.nama_kendala}
                    kodeLkh={data.kode_lkh}
                    machineName={data.kode_ticket}
                    tgl={data.waktu_respon}
                    jam={'19.09'}
                    namaPemeriksa={
                      data.proses_mtcs[lengthProses].user_eksekutor.nama
                    }
                    no={'109299'}
                    idTiket={data.id}
                    idProses={data.proses_mtcs[lengthProses].id}
                    namaMesin={data.mesin}
                    skor_mtc={skorAwal}
                    jenis_perbaikan={
                      data.proses_mtcs[lengthProses].cara_perbaikan
                    }
                    persentaseBelumVerif={skorBaru}
                    kode_analisis={
                      data.proses_mtcs[lengthProses].kode_analisis_mtc +
                      ' - ' +
                      data.proses_mtcs[lengthProses].nama_analisis_mtc
                    }
                    durasiPerbaikan={waktuPengerjaan}
                    eksekutor={data.operator}
                     unit={data.proses_mtcs[lengthProses].unit} bagian={data.proses_mtcs[lengthProses].bagian_mesin}
                  >
                    <div>
                      <label
                        htmlFor="namaPemeriksa"
                        className="form-label block  text-black text-xs font-extrabold my-2 "
                      >
                        CATATAN
                      </label>
                      <textarea
                        onChange={(e) => setNote(e.target.value)}
                        className="w-full border border-neutral-600 h-56 p-2 rounded-sm"
                        name=""
                        id=""
                      ></textarea>
                    </div>
                    <div className=" z-50 my-5 rounded-md">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() =>
                            verifikasiTicket(
                              data.id,
                              data.proses_mtcs[lengthProses].id,
                            )
                          }
                          className="text-xs font-bold bg-blue-700 py-4 px-5 text-white rounded-md"
                        >
                          Verifikasi
                        </button>
                        <button
                          onClick={() =>
                            tolakTicket(
                              data.id,
                              data.proses_mtcs[lengthProses].id,
                            )
                          }
                          className="text-xs font-bold bg-red-700 py-4 px-5 text-white rounded-md"
                        >
                          Tolak
                        </button>
                      </div>
                    </div>
                  </ModalVerifikasi>
                )}
              </div>
            </div>
          </div>
        );
      })}
      <div className="w-full flex justify-end mt-5 ">
        <Stack spacing={2}>
          <Pagination
            count={ticketVerifikasi?.total_page}
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

export default TableVerifikasi;
