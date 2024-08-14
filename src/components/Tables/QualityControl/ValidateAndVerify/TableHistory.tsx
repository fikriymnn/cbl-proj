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
import Stack from '@mui/material/Stack';
import Pagination from '@mui/material/Pagination/Pagination';
import calculateTime from '../../../../utils/calculateTime';
import ModalDetailValidasi from '../../../Modals/ModalDetailValidasi';

const TableHistory = () => {
  const [page, setPage] = useState(1);
  const [ticketProsesHistory, setTicketProsesHistory] = useState<any>(null);
  const [showModalDetail,setShowModalDetail] = useState(null);
  const handleClickDetail = (index: any) => {
    setShowModalDetail((prevState: any) => {
      return prevState === index ? null : index;
    });
  };
  const closeModalDetail= () => setShowModalDetail(null);
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
        <p className="w-5 text-[14px] font-semibold mr-3">No</p>
        <div className="flex flex-col w-full">
          <div className="grid grid-cols-12 gap-5 w-full dark:border-strokedark  ">
            <div className="flex w-full justify-start col-span-2">
              <p className="text-slate-600  text-[14px] font-semibold  dark:text-white">
                Kode Tiket
              </p>
            </div>
            <div className=" text-[14px] justify-start ">
              <p className="text-slate-600 font-semibold  dark:text-white">
                Waktu Masuk
              </p>
            </div>
            <div className=" text-[14px] justify-start ">
              <p className="text-slate-600 font-semibold  dark:text-white">
                Waktu Selesai
              </p>
            </div>
            <div className=" text-[14px] justify-start ">
              <p className="text-slate-600 font-semibold ">Nama Mesin</p>
            </div>
            <div className=" text-[14px] justify-start col-span-2 ">
              <p className="text-slate-600 font-semibold ">Kendala</p>
            </div>
            <div className=" text-[14px] justify-start ">
              <p className="text-slate-600 font-semibold ">status</p>
            </div>
            <div className=" text-[14px] justify-start mx-auto">
              <p className="text-slate-600 font-semibold ">Skor</p>
            </div>
            <div className=" text-[14px] justify-start col-span-2">
              <p className="text-slate-600 font-semibold ">Waktu Respon</p>
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
        const waktuRespon = calculateTime(
          data.waktu_selesai_mtc,
          data.waktu_selesai,
        );
        return (
          <div
            key={index}
            className=" flex w-full rounded-xl border px-2  border-stroke bg-white py-3 shadow-default dark:border-strokedark dark:bg-boxdark "
          >
            <div className="flex items-center">
              <p className="text-neutral-500 text-sm font-light  dark:text-white w-5 mr-3">
                {index + 1}{' '}
              </p>
            </div>
            <div className="grid grid-cols-12 gap-5 w-full items-center dark:border-strokedark">
              <div className="flex w-full justify-start col-span-2 gap-14">
                <p className="text-neutral-500 text-sm font-light  dark:text-white break-all">
                  {' '}
                  {data.tiket.kode_ticket}
                </p>
              </div>
              <div className="flex w-full  justify-start ">
                <p className="text-neutral-500 text-sm font-light  dark:text-white break-all">
                  {tglTicket}
                </p>
              </div>
              <div className="flex w-full  justify-start ">
                <p className="text-neutral-500 text-sm font-light  dark:text-white break-all">
                  {tglSelesaiTicket}
                </p>
              </div>
              <div className="flex w-full  justify-start  ">
                <p className="text-neutral-500 text-sm font-light ">
                  {data.tiket.mesin}
                </p>
              </div>
              <div className="flex w-full  justify-start col-span-2 ">
                <p className="text-neutral-500 text-sm font-light ">
                  {data.tiket.kode_lkh + ' - ' + data.tiket.nama_kendala}
                </p>
              </div>
              <div className="flex w-full  justify-start  ">
                <p
                  className={
                    data.status_qc == 'approved'
                      ? 'text-white text-sm font-light   bg-green-600 rounded-lg px-2'
                      : 'text-white text-sm font-light  dark:text-white bg-red-600 rounded-lg px-2'
                  }
                >
                  {data.status_qc}
                </p>
              </div>
              <div className="flex w-full  justify-start ">
                <p className="text-neutral-500 text-sm font-light mx-auto">
                  {data.skor_mtc}
                </p>
              </div>
              <div className="flex w-full  justify-start col-span-2">
                <p className="text-neutral-500 text-sm font-light ">
                  {waktuRespon}
                </p>
              </div>
              {/* <div className="flex w-full  justify-start col-span-3">
                <p className="text-neutral-500 text-sm font-light ">
                  {data.skor_mtc}
                </p>
              </div> */}
               <div className="flex w-full justify-end">
                <button onClick={()=>handleClickDetail(index)} className="text-xs font-bold bg-blue-700 py-2 px-10 text-white rounded-sm">
                  Detail
                </button>
              </div>
            </div>
            {showModalDetail === index && (
              <>
              <ModalDetailValidasi status={data.status_qc} note={data.note_qc} nama_kendala={data.tiket.nama_kendala} nama_mesin=  {data.tiket.mesin} operator={data.tiket.operator}  isOpen={showModalDetail} onClose={closeModalDetail} key={index}>
                <></>
              </ModalDetailValidasi>
              </>
            )}
          </div>
        );
      })}
      <div className="w-full flex  mt-5 ">
        <Stack spacing={2}>
          <Pagination
            count={ticketProsesHistory?.total_page}
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

export default TableHistory;
