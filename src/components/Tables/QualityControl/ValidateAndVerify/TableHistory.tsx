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
import convertTimeStampToDate from '../../../../utils/convertDate';

const brandData = [
  {
    name: 'EX000003',
    date: '12/22/24 07:00UTC',
    date2: '12/22/24 07:00UTC',
    machine: 'iCutter GT40',
    status: 'AA -  Problem setting tinta',
    percent: '0%',
    eksekutor: 'taylor swift',
  },
  {
    name: 'EX000003',
    date: '12/22/24 07:00UTC',
    date2: '12/22/24 07:00UTC',
    machine: 'iCutter GT40',
    status: 'AA -  Problem setting tinta',
    percent: '0%',
    eksekutor: 'emma watson',
  },
  {
    name: 'EX000003',
    date: '12/22/24 07:00UTC',
    date2: '12/22/24 07:00UTC',
    machine: 'iCutter GT40',
    status: 'AA -  Problem setting tinta',
    percent: '0%',
    eksekutor: 'taylor swift',
  },
];

const TableHistory = () => {
  const [page, setPage] = useState(1);
  const [ticketProsesHistory, setTicketProsesHistory] = useState<any>(null);

  useEffect(() => {
    getMTC();
  }, [page]);

  async function getMTC() {
    const url = `${import.meta.env.VITE_API_LINK}/prosessMtcHistoryQc`;
    try {
      const res = await axios.get(url, {
        params: {
          page: page,
          limit: 10,
        },
        withCredentials: true,
      });

      setTicketProsesHistory(res.data);

      console.log(res.data);
    } catch (error: any) {
      console.log(error.response);
    }
  }
  return (
    <div className="flex flex-col gap-2">
      <div className="flex px-2 border border-stroke bg-white py-3 shadow-default dark:border-strokedark dark:bg-boxdark pb-3">
        <p className='w-5 text-[14px] font-semibold mr-3'>No</p>
        <div className="flex flex-col w-full">
          <div className="grid grid-cols-12 w-full dark:border-strokedark  ">
            <div className="flex w-full justify-start col-span-2">
              <p className="text-slate-600  text-[14px] font-semibold  dark:text-white">
                Kode Tiket
              </p>
            </div>
            <div className=" text-[14px] justify-start col-span-2 ">
              <p className="text-slate-600 font-semibold  dark:text-white">
                Waktu Masuk
              </p>
            </div>
            <div className=" text-[14px] justify-start col-span-2 ">
              <p className="text-slate-600 font-semibold  dark:text-white">
                Waktu Selesai
              </p>
            </div>
            <div className=" text-[14px] justify-start col-span-2 ">
              <p className="text-slate-600 font-semibold ">Nama Mesin</p>
            </div>
            <div className=" text-[14px] justify-start ">
              <p className="text-slate-600 font-semibold ">Kendala</p>
            </div>
            {/* <div className=" text-[14px] justify-center ">
              <p className="text-slate-600 font-semibold ">Skor</p>
            </div> */}
          </div>
        </div>
      </div>
      {ticketProsesHistory?.data.map((data: any, index: number) => {
        const tglTicket = convertTimeStampToDate(data.createdAt);
        const tglSelesaiTicket = convertTimeStampToDate(data.waktu_selesai_mtc);
        return (
          <div
            key={index}
            className=" flex w-full rounded-xl border px-2  border-stroke bg-white py-3 shadow-default dark:border-strokedark dark:bg-boxdark "
          >
            <div className='flex items-center'>

            <p className="text-neutral-500 text-sm font-light  dark:text-white w-5 mr-3">
                  {index + 1}{' '}
                </p>
            </div>
            <div className="grid grid-cols-12 w-full items-center dark:border-strokedark">
              <div className="flex w-full justify-start col-span-2 gap-14">
                
                <p className="text-neutral-500 text-sm font-light  dark:text-white">
                  {' '}
                  {data.tiket.kode_ticket}
                </p>
              </div>
              <div className="flex w-full  justify-start col-span-2">
                <p className="text-neutral-500 text-sm font-light  dark:text-white">
                  {tglTicket}
                </p>
              </div>
              <div className="flex w-full  justify-start col-span-2">
                <p className="text-neutral-500 text-sm font-light  dark:text-white">
                  {tglSelesaiTicket}
                </p>
              </div>
              <div className="flex w-full  justify-start col-span-2 ">
                <p className="text-neutral-500 text-sm font-light ">
                  {data.tiket.mesin}
                </p>
              </div>
              <div className="flex w-full  justify-start col-span-3">
                <p className="text-neutral-500 text-sm font-light ">
                  {data.tiket.kode_lkh + ' - ' + data.tiket.nama_kendala}
                </p>
              </div>
              {/* <div className="flex w-full  justify-start col-span-3">
                <p className="text-neutral-500 text-sm font-light ">
                  {data.skor_mtc}
                </p>
              </div> */}
              <button className="text-xs font-bold bg-blue-700 py-2 px-5 text-white rounded-sm">
                Detail
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TableHistory;
