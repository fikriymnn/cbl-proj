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

const brandData: BRAND[] = [
  {
    name: 'EX000003',
    date: '12/22/24 07:00UTC',
    machine: 'R700',
    status: 'AA -  Problem setting tinta',
    schedule: 'unscheduled',
    action: 'review maintenance',
  },
  {
    name: 'EX000003',
    date: '12/22/24 07:00UTC',
    machine: 'R700',
    status: 'AA -  Problem setting tinta',
    schedule: 'schedule requested',
    action: 'detail',
  },
  {
    name: 'EX000003',
    date: '12/22/24 07:00UTC',
    machine: 'R700',
    status: 'AA -  Problem setting tinta',
    schedule: ['schedule declined', '12/04/24 to 24/04/24'],
    action: 'review maintenance',
  },
];

const TableValidasi = () => {
  const [page, setPage] = useState(1);
  const [ticketValidasi, setTicketValidasi] = useState<any>(null);

  useEffect(() => {
    getMTC();
  }, [page]);

  async function getMTC() {
    const url = `${import.meta.env.VITE_API_LINK}/ticket?bagian_tiket=qc`;
    try {
      const res = await axios.get(url, {
        params: {
          page: page,
          limit: 10,
        },
        withCredentials: true,
      });

      setTicketValidasi(res.data);

      console.log(res.data);
    } catch (error: any) {
      console.log(error.response);
    }
  }

  async function validasiTicket(id: number) {
    const url = `${import.meta.env.VITE_API_LINK}/ticket/validate/${id}`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      alert('success');

      getMTC();
    } catch (error: any) {
      console.log(error.response);
    }
  }

  async function tolakTicket(id: number) {
    const url = `${import.meta.env.VITE_API_LINK}/ticket/tolak/${id}`;
    try {
      const res = await axios.get(
        url,
        // {
        //   note_qc: '',
        // },
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
    <>
      <div className="flex flex-col gap-2">
        <div className=" border border-stroke bg-white py-3 shadow-default dark:border-strokedark dark:bg-boxdark pb-3">
          <div className="flex flex-col">
            <div className="grid grid-cols-10 dark:border-strokedark  ">
              <div className="flex w-full justify-center col-span-2">
                <p className="text-slate-600  text-[14px] font-semibold  dark:text-white">
                  Kode Tiket
                </p>
              </div>
              <div className=" text-[14px] justify-center col-span-2 ">
                <p className="text-slate-600 font-semibold  dark:text-white">
                  Waktu Masuk
                </p>
              </div>

              <div className=" text-[14px] justify-center col-span-2 ">
                <p className="text-slate-600 font-semibold ">Nama Mesin</p>
              </div>
              <div className=" text-[14px] justify-center ">
                <p className="text-slate-600 font-semibold ">Kendala</p>
              </div>
            </div>
          </div>
        </div>
        {ticketValidasi?.data.map((data: any, index: number) => {
          const tglTicket = convertTimeStampToDate(data.createdAt);
          return (
            <div
              key={index}
              className="rounded-xl border  border-stroke bg-white py-3 shadow-default dark:border-strokedark dark:bg-boxdark "
            >
              <div className="grid grid-cols-10 items-center dark:border-strokedark px-4">
                <div className="flex w-full justify-start col-span-2 gap-14">
                  <p className="text-neutral-500 text-sm font-light  dark:text-white">
                    {index + 1}{' '}
                  </p>
                  <p className="text-neutral-500 text-sm font-light  dark:text-white">
                    {' '}
                    {data.kode_ticket}
                  </p>
                </div>
                <div className="flex w-full  justify-start col-span-2">
                  <p className="text-neutral-500 text-sm font-light  dark:text-white">
                    {tglTicket}
                  </p>
                </div>

                <div className="flex w-full  justify-start col-span-2 ">
                  <p className="text-neutral-500 text-sm font-light ">
                    {data.mesin}
                  </p>
                </div>
                <div className="flex w-full  justify-start col-span-3">
                  <p className="text-neutral-500 text-sm font-light ">
                    {data.kode_lkh + ' - ' + data.nama_kendala}
                  </p>
                </div>
                <button
                  onClick={() => validasiTicket(data.id)}
                  className="text-xs font-bold bg-blue-700 py-2 px-5 text-white rounded-sm"
                >
                  Validasi
                </button>
                <button
                  onClick={() => tolakTicket(data.id)}
                  className="text-xs font-bold bg-red-700 py-2 px-5 text-white rounded-sm"
                >
                  Tolak
                </button>
              </div>
            </div>
          );
        })}
        <div className="w-full flex justify-center mt-5 ">
          <Stack spacing={2}>
            <Pagination
              count={ticketValidasi?.total_page}
              color="primary"
              onChange={(e, i) => {
                setPage(i);
                console.log(i);
              }}
            />
          </Stack>
        </div>
      </div>
    </>
  );
};

export default TableValidasi;
