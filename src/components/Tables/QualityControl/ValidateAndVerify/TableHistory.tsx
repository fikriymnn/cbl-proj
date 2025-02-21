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
import convertTimeStampToDate from '../../../../utils/converDateTime';
import Stack from '@mui/material/Stack';
import Pagination from '@mui/material/Pagination/Pagination';
import calculateTime from '../../../../utils/calculateTime';
import ModalDetailValidasi from '../../../Modals/ModalDetailValidasi';
import Loading from '../../../Loading';
import convertTimeStampToDateOnly from '../../../../utils/convertDate';

const TableHistory = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [ticketProsesHistory, setTicketProsesHistory] = useState<any>(null);
  const [showModalDetail, setShowModalDetail] = useState(null);
  const [masterMesin, setmasterMesin] = useState<any>();

  const handleClickDetail = (index: any) => {
    setShowModalDetail((prevState: any) => {
      return prevState === index ? null : index;
    });
  };
  const closeModalDetail = () => setShowModalDetail(null);
  useEffect(() => {
    getMTC();
    getMasterMesin();
  }, [page]);

  async function getMasterMesin() {
    const url = `${import.meta.env.VITE_API_LINK}/master/mesin`;
    try {
      setIsLoading(true)
      const res = await axios.get(url, {
        withCredentials: true,
      });
      setIsLoading(false)
      setmasterMesin(res.data);

    } catch (error: any) {
      setIsLoading(false)
      console.log(error.data.msg);
    }
  }
  const [startDate, setStartDate] = useState<any>();
  const [endDate, setEndDate] = useState<any>();
  const [mesinNama, setMesinNama] = useState<any>();
  const [statusTiket, setStatusTiket] = useState<any>();
  const [noJo, setNoJo] = useState<any>();
  async function getMTC() {
    const url = `${import.meta.env.VITE_API_LINK}/prosessMtcHistoryQc`;
    try {
      const res = await axios.get(url, {
        params: {
          page: page,
          limit: 10,
          start_date: startDate,
          end_date: endDate,
          mesin: mesinNama,
          status_qc: statusTiket,
          no_jo: noJo,
        },
        withCredentials: true,
      });

      setTicketProsesHistory(res.data);

      console.log(res.data);
    } catch (error: any) {
      console.log(error.response);
    }
  }
  function calculateResponTime2(startDate: any, endDate: any) {
    if (!startDate || !endDate) {
      return -1; // Return -1 if any of the values are null or empty
    }

    const createdAtDate = new Date(startDate);
    const waktuResponDate = new Date(endDate);

    if (isNaN(createdAtDate.getTime()) || isNaN(waktuResponDate.getTime())) {
      return -1; // Return -1 if the date conversion fails
    }

    const millisecondsDiff = waktuResponDate.getTime() - createdAtDate.getTime();
    const secondsDiff = Math.floor(millisecondsDiff / 1000); // Total seconds difference

    return secondsDiff;
  }

  function formatMinutesToHoursMinutesSeconds(totalSeconds: number) {
    if (totalSeconds === -1) {
      return '-'; // Return '-' if the input is -1
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours ? hours + ' hours ' : ''}${minutes ? minutes + ' minutes ' : ''}${seconds ? seconds + ' seconds' : ''}`.trim();
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex  gap-1 items-center bg-white ">
        {isLoading && <Loading />}

        <div className="grid md:grid-cols-12 grid-cols-6 px-4 py-1 gap-3">

          <div className="flex flex-col gap-2 col-span-2">
            <p className="text-sm text-primary font-semibold">
              Dari:
            </p>
            <input
              className='rounded-full bg-[#D8EAFF] px-2 h-8'
              type="date"
              onChange={(e) => setStartDate(e.target.value)}
            ></input>

          </div>
          <div className="flex flex-col gap-2 col-span-2">
            <p className=" my-auto text-sm text-primary font-semibold ">
              Sampai:
            </p>

            <input
              className='rounded-full bg-[#D8EAFF] px-2 h-8'
              type="date"
              onChange={(e) => setEndDate(e.target.value)}
            ></input>

          </div>
          <div className="flex flex-col  gap-2 col-span-2">
            <p className=" my-auto text-sm text-primary font-semibold ">
              Pilih Mesin:
            </p>

            <select
              onChange={(e) => {
                setMesinNama(
                  e.target.value,
                );

              }}
              className={` z-20 w-full rounded-md bg-blue-200 items-center h-8`}
            >
              <option
                selected
                disabled>
                Pilih Mesin
              </option>
              {masterMesin?.map(
                (data: any, i: number) => {
                  return (
                    <option
                      value={data.nama_mesin}
                      className="text-gray-800 text-sm font-light dark:text-bodydark"
                    >
                      {data.nama_mesin}
                    </option>
                  );
                },
              )}
            </select>
          </div>
          <div className="flex flex-col  gap-2 col-span-2">
            <p className=" my-auto text-sm text-primary font-semibold ">
              Pilih Status Tiket:
            </p>
            <select
              onChange={(e) => {
                setStatusTiket(
                  e.target.value,
                );

              }}
              className={` z-20 w-full rounded-md bg-blue-200 items-center h-8`}
            >
              <option
                selected
                disabled>
                Pilih Status Tiket
              </option>

              <option
                value={'approved'}
                className="text-gray-800 text-sm font-light dark:text-bodydark"
              >
                approved
              </option>
              <option
                value={'rejected'}
                className="text-gray-800 text-sm font-light dark:text-bodydark"
              >
                rejected
              </option>
            </select>
          </div>
          <div className=" gap-2 flex flex-col col-span-2">
            <p className=" my-auto text-sm text-primary font-semibold ">
              No.Jo
            </p>
            <input
              className='rounded-md h-8 bg-[#D8EAFF] px-2 w-full'
              placeholder='Nomor JO'
              type="text"
              onChange={(e) => setNoJo(e.target.value)}
            ></input>

          </div>
          <div className="flex ">
            <button
              onClick={() => {
                getMTC()
              }}
              className="bg-primary text-white px-5 py-2 rounded-md my-auto "
            >
              Tampilkan
            </button>

          </div>

        </div>

        {/* <input
          type="search"
          placeholder="search"
          name=""
          id=""
          className="md:w-96 w-40 py-1 mx-3 px-3 bg-[#E9F3FF]"
        /> */}
      </div>
      <div className="flex px-2 border border-stroke bg-white py-3 shadow-default dark:border-strokedark dark:bg-boxdark pb-3">
        <p className="w-5 text-[14px] font-semibold mr-3">No</p>
        <div className="flex flex-col w-full">
          <div className="grid grid-cols-12 gap-2 w-full dark:border-strokedark  ">
            <div className="flex w-full justify-start ">
              <p className="text-slate-600  text-[14px] font-semibold  dark:text-white">
                Kode Tiket
              </p>
            </div>
            <div className=" text-[14px] justify-start ">
              <p className="text-slate-600 font-semibold  dark:text-white">
                Tanggal Tiket
              </p>
            </div>
            <div className=" text-[14px] justify-start ">
              <p className="text-slate-600 font-semibold  dark:text-white">
                No Jo
              </p>
            </div>
            <div className=" text-[14px] justify-start col-span-2">
              <p className="text-slate-600 font-semibold  dark:text-white">
                Item
              </p>
            </div>
            <div className=" text-[14px] justify-start ">
              <p className="text-slate-600 font-semibold "> Mesin</p>
            </div>
            <div className=" text-[14px] justify-start  ">
              <p className="text-slate-600 font-semibold ">Kendala</p>
            </div>
            <div className=" text-[14px] justify-start ">
              <p className="text-slate-600 font-semibold  dark:text-white">
                Jam Tiket
              </p>
            </div>
            <div className=" text-[14px] justify-start ">
              <p className="text-slate-600 font-semibold ">status</p>
            </div>
            <div className=" text-[14px] justify-start mx-auto">
              <p className="text-slate-600 font-semibold ">Skor</p>
            </div>
            <div className=" text-[14px] justify-start ">
              <p className="text-slate-600 font-semibold ">Waktu Respon</p>
            </div>
            {/* <div className=" text-[14px] justify-center ">
              <p className="text-slate-600 font-semibold ">Skor</p>
            </div> */}
          </div>
        </div>
      </div>
      {ticketProsesHistory?.data.map((data: any, index: number) => {
        const tglTicket = convertTimeStampToDateOnly(data.createdAt);
        const tglSelesaiTicket = (data.waktu_selesai_mtc == null ? '-' : convertTimeStampToDate(data.waktu_selesai_mtc));
        const waktuRespon = calculateResponTime2(
          data.tiket?.waktu_selesai_mtc,
          data.tiket?.waktu_selesai,
        );
        const waktuBreakdownMinutes = calculateResponTime2(
          data.tiket?.createdAt,
          data.tiket?.waktu_selesai,
        );
        const waktuBreakdownMTCMinutes = calculateResponTime2(
          data.tiket?.waktu_respon_qc,
          data.tiket?.waktu_selesai_mtc,
        );
        const waktuValidasiQCMinutes = calculateResponTime2(
          data.tiket?.createdAt,
          data.tiket?.waktu_respon_qc,
        );
        const waktuRespon2 = formatMinutesToHoursMinutesSeconds(waktuRespon);
        const waktuBreakdown = formatMinutesToHoursMinutesSeconds(waktuBreakdownMinutes);
        const waktuBreakdownMTC = formatMinutesToHoursMinutesSeconds(waktuBreakdownMTCMinutes);

        const qcRespon = calculateResponTime2(
          data.tiket?.createdAt,
          data.tiket?.waktu_respon_qc,
        );
        const qcVerif = calculateResponTime2(
          data.tiket?.waktu_selesai_mtc,
          data.tiket?.waktu_selesai,
        );
        const waktuVerifikasiQCMinutes = calculateResponTime2(
          data.tiket?.waktu_selesai_mtc,
          data.tiket?.waktu_selesai,
        );
        const waktuVerifikasiQC = formatMinutesToHoursMinutesSeconds(waktuVerifikasiQCMinutes);
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
            <div className="grid grid-cols-12 gap-2 w-full items-center dark:border-strokedark">
              <div className="flex w-full justify-start ">
                <p className="text-neutral-500 text-sm font-light  dark:text-white break-all">
                  {' '}
                  {data.tiket.kode_ticket}
                </p>
              </div>
              <div className="flex w-full  justify-start ">
                <p className="text-neutral-500 text-sm font-light  dark:text-white">
                  {tglTicket}
                </p>
              </div>
              <div className="flex w-full  justify-start ">
                <p className="text-neutral-500 text-sm font-light  dark:text-white">
                  {data.tiket.no_jo}
                </p>
              </div>
              <div className="flex w-full  justify-start col-span-2">
                <p className="text-neutral-500 text-sm font-light  dark:text-white">
                  {data.tiket.nama_produk}
                </p>
              </div>
              <div className="flex w-full  justify-start  ">
                <p className="text-neutral-500 text-sm font-light ">
                  {data.tiket.mesin}
                </p>
              </div>
              <div className="flex w-full  justify-start ">
                <p className="text-neutral-500 text-sm font-light ">
                  {data.tiket.kode_lkh + ' - ' + data.tiket.nama_kendala}
                </p>
              </div>
              <div className="flex w-full  justify-start ">
                <p className="text-neutral-500 text-sm font-light  dark:text-white">
                  {tglTicket}
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
              <div className="flex w-full  justify-start ">
                <p className="text-neutral-500 text-sm font-light ">
                  {waktuRespon2}
                </p>
              </div>
              {/* <div className="flex w-full  justify-start col-span-3">
                <p className="text-neutral-500 text-sm font-light ">
                  {data.skor_mtc}
                </p>
              </div> */}
              <div className="flex w-full justify-end">
                <button onClick={() => handleClickDetail(index)} className="text-xs font-bold bg-blue-700 py-2 px-3 text-white rounded-sm">
                  Detail
                </button>
              </div>
            </div>
            {showModalDetail === index && (
              <>
                <ModalDetailValidasi
                  bagian={data.bagian_mesin}
                  unit={data.unit}
                  status={data.tiket.status_qc}
                  note={data.note_qc}
                  nama_kendala={data.tiket.nama_kendala}
                  nama_mesin={data.tiket.mesin}
                  operator={data.tiket.operator}
                  isOpen={showModalDetail}
                  onClose={closeModalDetail}
                  key={index}
                  validator={data.user_qc?.nama}
                  nojo={data.tiket.no_jo}
                  customer={data.tiket.nama_customer}
                  masalah={data.tiket.nama_analisis_mtc}
                  waktuMasuk={tglTicket}
                  waktuSelesai={tglSelesaiTicket}
                  WaktuBreakdown={waktuBreakdown}
                  waktuBreakdownMTC={waktuBreakdownMTC}
                  waktuVerifikasiQC={waktuVerifikasiQC}
                  data={data}
                >
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
