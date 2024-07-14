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

const TableVerifikasi = () => {
  const [page, setPage] = useState(1);
  const [user, setUser] = useState<any>();
  const [ticketVerifikasi, setTicketVerifikasi] = useState<any>(null);

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
          note_qc: '',
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
          note_qc: '',
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
      <div className=" border border-stroke bg-white py-3 shadow-default dark:border-strokedark dark:bg-boxdark pb-3">
        <div className="flex flex-col">
          <div className="grid grid-cols-12 dark:border-strokedark  ">
            <div className="flex w-full justify-center col-span-2">
              <p className="text-slate-600  text-[14px] font-semibold  dark:text-white">
                Kode Tiket
              </p>
            </div>
            <div className="flex w-full text-[14px] justify-start col-span-2 ">
              <p className="text-slate-600 font-semibold  dark:text-white">
                Waktu Masuk
              </p>
            </div>

            <div className="flex w-full text-[14px] justify-start col-span-2">
              <p className="text-slate-600 font-semibold ">Nama Mesin</p>
            </div>
            <div className="flex w-full text-[14px] justify-start col-span-2">
              <p className="text-slate-600 font-semibold ">Kendala</p>
            </div>
            <div className="flex w-full text-[14px] justify-start col-span-2">
              <p className="text-slate-600 font-semibold ">Persentase</p>
            </div>
            <div className="flex w-full text-[14px] justify-start ">
              <p className="text-slate-600 font-semibold ">Eksekutor</p>
            </div>
          </div>
        </div>
      </div>
      {ticketVerifikasi?.data.map((data: any, index: number) => {
        const lengthProses = data.proses_mtcs.length - 1;
        const tglTicket = convertTimeStampToDate(data.waktu_selesai_mtc);
        return (
          <div
            key={index}
            className="rounded-xl border  border-stroke bg-white py-3 shadow-default dark:border-strokedark dark:bg-boxdark "
          >
            <div className="grid grid-cols-12 dark:border-strokedark items-center px-4">
              <div className="flex w-full justify-start col-span-2 gap-8">
                <p className="text-neutral-500 text-sm font-light  dark:text-white">
                  {index + 1}{' '}
                </p>
                <p className="text-neutral-500 text-sm font-light  dark:text-white">
                  {' '}
                  {data.kode_ticket}
                </p>
              </div>
              <div className="flex w-full text-[14px] justify-start col-span-2 ">
                <p className="text-neutral-500 text-sm font-light  dark:text-white">
                  {tglTicket}
                </p>
              </div>

              <div className="flex w-full text-[14px] justify-start col-span-2">
                <p className="text-neutral-500 text-sm font-light ">
                  {data.mesin}
                </p>
              </div>
              <div className="flex w-full text-[14px] justify-start col-span-2">
                <p className="text-neutral-500 text-sm font-light ">
                  {data.kode_lkh + ' - ' + data.nama_kendala}
                </p>
              </div>
              <div className="flex w-full text-[14px] justify-start col-span-2">
                <p className="text-neutral-500 text-sm font-light ">
                  {data.skor_mtc}
                </p>
              </div>
              <div className="flex w-full text-[14px] justify-start ">
                <p className="text-neutral-500 text-sm font-light ">
                  {data.proses_mtcs[lengthProses].user_eksekutor.nama}
                </p>
              </div>
              <div className="flex w-full text-[14px] justify-end ">
                <button
                  onClick={() =>
                    verifikasiTicket(data.id, data.proses_mtcs[lengthProses].id)
                  }
                  className="text-xs font-bold bg-blue-700 py-2 px-5 text-white rounded-sm"
                >
                  Verifikasi
                </button>
                <button
                  onClick={() =>
                    tolakTicket(data.id, data.proses_mtcs[lengthProses].id)
                  }
                  className="text-xs font-bold bg-red-700 py-2 px-5 text-white rounded-sm"
                >
                  Tolak
                </button>
              </div>
            </div>
          </div>
        );
      })}
      <div className="w-full flex justify-center mt-5 ">
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
