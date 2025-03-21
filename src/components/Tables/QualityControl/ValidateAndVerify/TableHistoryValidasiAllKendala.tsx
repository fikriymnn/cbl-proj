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
import ModalKosongan from '../../../Modals/Qc/NCR/NCRResponQC';
import convertTimeStampToDateTime from '../../../../utils/converDateTime';
import Loading from '../../../Loading';

const TableHistoryValidateAllKendala = () => {
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [ticket, setTicket] = useState<any>(null);
  const [showModalDetail, setShowModalDetail] = useState(null);
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
  const [masterMesin, setmasterMesin] = useState<any>();
  async function getMasterMesin() {
    const url = `${import.meta.env.VITE_API_LINK}/master/mesin`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        withCredentials: true,
      });
      setIsLoading(false);
      setmasterMesin(res.data);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error.data.msg);
    }
  }
  const [startDate, setStartDate] = useState<any>();
  const [endDate, setEndDate] = useState<any>();
  const [mesinNama, setMesinNama] = useState<any>();

  const [noJo, setNoJo] = useState<any>();
  async function getMTC() {
    const url = `${import.meta.env.VITE_API_LINK}/kendalaLkh`;
    try {
      const res = await axios.get(url, {
        params: {
          page: page,
          limit: 10,
          bagian_tiket: 'history',
          no_jo: noJo,
          start_date: startDate,
          end_date: endDate,
          mesin: mesinNama,
        },
        withCredentials: true,
      });

      setTicket(res.data);

      console.log(res.data);
    } catch (error: any) {
      console.log(error);
    }
  }

  const [showEdit, setShowEdit] = useState<any>([]);
  const openEdit = (i: any) => {
    const onchangeVal: any = [...showEdit];
    onchangeVal[i] = true;

    setShowEdit(onchangeVal);
  };
  const closeEdit = (i: any) => {
    const onchangeVal: any = [...showEdit];
    onchangeVal[i] = false;

    setShowEdit(onchangeVal);
  };
  return (
    <div className="flex flex-col gap-2">
      <div className="flex  gap-1 items-center bg-white ">
        {isLoading && <Loading />}

        <div className="grid md:grid-cols-12 grid-cols-6 px-4 py-1 gap-3">
          <div className="flex flex-col gap-2 col-span-2">
            <p className="text-sm text-primary font-semibold">Dari:</p>
            <input
              className="rounded-full bg-[#D8EAFF] px-2 h-8"
              type="date"
              onChange={(e) => setStartDate(e.target.value)}
            ></input>
          </div>
          <div className="flex flex-col gap-2 col-span-2">
            <p className=" my-auto text-sm text-primary font-semibold ">
              Sampai:
            </p>

            <input
              className="rounded-full bg-[#D8EAFF] px-2 h-8"
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
                setMesinNama(e.target.value);
              }}
              className={` z-20 w-full rounded-md bg-blue-200 items-center h-8`}
            >
              <option selected disabled>
                Pilih Mesin
              </option>
              {masterMesin?.map((data: any, i: number) => {
                return (
                  <option
                    value={data.nama_mesin}
                    className="text-gray-800 text-sm font-light dark:text-bodydark"
                  >
                    {data.nama_mesin}
                  </option>
                );
              })}
            </select>
          </div>

          <div className=" gap-2 flex flex-col col-span-2">
            <p className=" my-auto text-sm text-primary font-semibold ">
              No.Jo
            </p>
            <input
              className="rounded-md h-8 bg-[#D8EAFF] px-2 w-full"
              placeholder="Nomor JO"
              type="text"
              onChange={(e) => setNoJo(e.target.value)}
            ></input>
          </div>
          <div className="flex ">
            <button
              onClick={() => {
                getMTC();
              }}
              className="bg-primary text-white px-5 py-2 rounded-md my-auto "
            >
              Tampilkan
            </button>
          </div>
        </div>
      </div>

      <div className="flex px-2 border border-stroke bg-white py-3 shadow-default dark:border-strokedark dark:bg-boxdark pb-3">
        <p className="w-5 text-[14px] font-semibold mr-3">No</p>
        <div className="flex flex-col w-full">
          <div className="grid grid-cols-8 gap-5 w-full dark:border-strokedark  ">
            <div className="flex w-full justify-start ">
              <p className="text-slate-600  text-[14px] font-semibold  dark:text-white">
                Kode Tiket
              </p>
            </div>
            <div className=" text-[14px] justify-start  ">
              <p className="text-slate-600 font-semibold  dark:text-white">
                Waktu Masuk
              </p>
            </div>
            <div className=" text-[14px] justify-start  ">
              <p className="text-slate-600 font-semibold  dark:text-white">
                Status
              </p>
            </div>
            <div className=" text-[14px] justify-start  ">
              <p className="text-slate-600 font-semibold ">Nama Mesin</p>
            </div>
            <div className=" text-[14px] justify-start ">
              <p className="text-slate-600 font-semibold ">Kendala</p>
            </div>

            <div className=" text-[14px] justify-start ">
              <p className="text-slate-600 font-semibold ">Operator</p>
            </div>
            <div className=" text-[14px] justify-start ">
              <p className="text-slate-600 font-semibold ">No.Jo,Io,So</p>
            </div>
            {/* <div className=" text-[14px] justify-center ">
              <p className="text-slate-600 font-semibold ">Skor</p>
            </div> */}
          </div>
        </div>
      </div>
      {ticket?.data.map((data: any, index: number) => {
        const tglTicket = convertTimeStampToDate(data.createdAt);
        const waktuRespon = calculateTime(data.createdAt, data.waktu_respon_qc);

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
            <div className="grid grid-cols-8 gap-5 w-full items-center dark:border-strokedark">
              <div className="flex w-full justify-start  gap-14">
                <p className="text-neutral-500 break-all text-sm font-light  dark:text-white">
                  {' '}
                  {data.kode_ticket}
                </p>
              </div>
              <div className="flex w-full  justify-start ">
                <p className="text-neutral-500 text-sm font-light  dark:text-white">
                  {tglTicket}
                </p>
              </div>
              <div className="flex w-full  justify-start ">
                <p
                  className={
                    data.status_tiket == 'di validasi'
                      ? 'text-white text-sm font-light   bg-green-600 rounded-lg px-2'
                      : 'text-white text-sm font-light  dark:text-white bg-red-600 rounded-lg px-2'
                  }
                >
                  {data.status_tiket}
                </p>
              </div>
              <div className="flex w-full  justify-start  ">
                <p className="text-neutral-500 text-sm font-light ">
                  {data.mesin}
                </p>
              </div>
              <div className="flex w-full  justify-start ">
                <p className="text-neutral-500 text-sm font-light ">
                  {data.kode_lkh + ' - ' + data.nama_kendala}
                </p>
              </div>

              <div className="flex w-full  justify-start ">
                <p className="text-neutral-500 text-sm font-light ">
                  {data.operator}
                </p>
              </div>
              <div className="flex flex-col gap-1 w-full  justify-start ">
                <p className="text-neutral-500 text-sm font-light ">
                  {data.no_jo}
                </p>
                <p className="text-neutral-500 text-sm font-light ">
                  {data.no_io}
                </p>
                <p className="text-neutral-500 text-sm font-light ">
                  {data.no_so}
                </p>
              </div>
              {/* <div className="flex w-full  justify-start col-span-3">
                <p className="text-neutral-500 text-sm font-light ">
                  {data.skor_mtc}
                </p>
              </div> */}
              <div className="flex w-full justify-end">
                <button
                  onClick={() => openEdit(index)}
                  className="text-xs font-bold bg-blue-700 py-2 px-3 text-white rounded-sm"
                >
                  Detail
                </button>
              </div>
            </div>
            {showEdit[index] == true && (
              <ModalKosongan
                isOpen={showEdit[index]}
                onClose={() => closeEdit(index)}
                judul={'Detail Tiket'}
              >
                <>
                  <div className="grid grid-cols-2 gap-2 px-4 py-4">
                    <div className="flex flex-col  ">
                      <label
                        htmlFor=""
                        className="text-black text-xs font-bold"
                      >
                        Status
                      </label>
                      <label
                        htmlFor=""
                        className="text-[#016ae6] uppercase text-xl font-normal"
                      >
                        {data.status_tiket}
                      </label>
                    </div>
                    <div className="flex flex-col  ">
                      <label
                        htmlFor=""
                        className="text-black text-xs font-bold"
                      >
                        Yang Menyetujui
                      </label>
                      <label
                        htmlFor=""
                        className="text-[#016ae6] uppercase text-xl font-normal"
                      >
                        {data.user_qc?.nama}
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 px-4 py-4">
                    <div className="flex flex-col gap-2 ">
                      <div className="flex flex-col ">
                        <label
                          htmlFor=""
                          className="text-black text-xs font-bold"
                        >
                          Kode Tiket
                        </label>
                        <label
                          htmlFor=""
                          className="text-[#7a7a7a] text-xl font-normal"
                        >
                          {data.kode_ticket}
                        </label>
                      </div>
                      <div className="flex flex-col ">
                        <label
                          htmlFor=""
                          className="text-black text-xs font-bold"
                        >
                          No. JO
                        </label>
                        <label
                          htmlFor=""
                          className="text-[#7a7a7a] text-xl font-normal"
                        >
                          {data.no_jo}
                        </label>
                      </div>
                      <div className="flex flex-col ">
                        <label
                          htmlFor=""
                          className="text-black text-xs font-bold"
                        >
                          No. IO
                        </label>
                        <label
                          htmlFor=""
                          className="text-[#7a7a7a] text-xl font-normal"
                        >
                          {data.no_io}
                        </label>
                      </div>
                      <div className="flex flex-col ">
                        <label
                          htmlFor=""
                          className="text-black text-xs font-bold"
                        >
                          No. SO
                        </label>
                        <label
                          htmlFor=""
                          className="text-[#7a7a7a] text-xl font-normal"
                        >
                          {data.no_so}
                        </label>
                      </div>
                      <div className="flex flex-col ">
                        <label
                          htmlFor=""
                          className="text-black text-xs font-bold"
                        >
                          Nama Customer
                        </label>
                        <label
                          htmlFor=""
                          className="text-[#7a7a7a] text-xl font-normal"
                        >
                          {data.nama_customer}
                        </label>
                      </div>
                      <div className="flex flex-col ">
                        <label
                          htmlFor=""
                          className="text-black text-xs font-bold"
                        >
                          Nama Item
                        </label>
                        <label
                          htmlFor=""
                          className="text-[#7a7a7a] text-xl font-normal"
                        >
                          {data.nama_produk}
                        </label>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 ">
                      <div className="flex flex-col ">
                        <label
                          htmlFor=""
                          className="text-black text-xs font-bold"
                        >
                          Kendala
                        </label>
                        <label
                          htmlFor=""
                          className="text-[#016ae6] text-xl font-normal"
                        >
                          {data.kode_kendala} - {data.nama_kendala}
                        </label>
                      </div>
                      <div className="flex flex-col ">
                        <label
                          htmlFor=""
                          className="text-black text-xs font-bold"
                        >
                          Jenis Kendala
                        </label>
                        <label
                          htmlFor=""
                          className="text-[#016ae6] text-xl font-normal"
                        >
                          {data.jenis_kendala}
                        </label>
                      </div>
                      <div className="flex flex-col ">
                        <label
                          htmlFor=""
                          className="text-black text-xs font-bold"
                        >
                          Mesin
                        </label>
                        <label
                          htmlFor=""
                          className="text-[#016ae6] text-xl font-normal"
                        >
                          {data.mesin}
                        </label>
                      </div>
                      <div className="flex flex-col ">
                        <label
                          htmlFor=""
                          className="text-black text-xs font-bold"
                        >
                          Operator
                        </label>
                        <label
                          htmlFor=""
                          className="text-[#016ae6] text-xl font-normal"
                        >
                          {data.operator}
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col w-full px-4 ">
                    <label htmlFor="" className="text-black text-xs font-bold">
                      Note QC
                    </label>
                    <textarea
                      readOnly
                      value={data.note_qc}
                      className="peer h-full min-h-[100px] w-full resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                    ></textarea>
                  </div>
                </>
              </ModalKosongan>
            )}
          </div>
        );
      })}
      <div className="w-full flex  mt-5 ">
        <Stack spacing={2}>
          <Pagination
            count={ticket?.total_page}
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

export default TableHistoryValidateAllKendala;
