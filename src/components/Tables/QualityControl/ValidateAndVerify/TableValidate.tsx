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
  const [note, setNote] = useState<any>('');
  const [action, setAction] = useState(false);

  const handleClickDetail = (index: number) => {
    setShowDetail((prevState) => {
      const updatedShowDetail = [...prevState]; // Create a copy
      updatedShowDetail[index] = !updatedShowDetail[index]; // Toggle value
      return updatedShowDetail;
    });
  };
  const [showDetail, setShowDetail] = useState<boolean[]>(
    new Array(ticketValidasi != null && ticketValidasi.length).fill(false),
  );

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
      const res = await axios.put(
        url,
        {
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

  async function tolakTicket(id: number) {
    const url = `${import.meta.env.VITE_API_LINK}/ticket/tolak/${id}`;
    try {
      const res = await axios.put(
        url,
        {
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
    <>
      <div className="flex flex-col gap-2">
        <div className=" border border-stroke bg-white py-3 shadow-default dark:border-strokedark dark:bg-boxdark pb-3">
          <div className="flex w-full  ">
            <p className="text-slate-600  text-[14px] font-semibold  dark:text-white w-5 mx-3 ">
              No
            </p>
            <div className="grid grid-cols-10  w-full dark:border-strokedark  ">
              <div className="flex w-full col-span-2 ">
                <p className="text-slate-600  text-[14px] font-semibold  dark:text-white  ">
                  Kode Tiket
                </p>
              </div>
              <div className=" text-[14px]  col-span-2 ">
                <p className="text-slate-600 font-semibold  dark:text-white">
                  Waktu Masuk
                </p>
              </div>

              <div className=" text-[14px]  col-span-2 ">
                <p className="text-slate-600 font-semibold ">Nama Mesin</p>
              </div>
              <div className=" text-[14px]  ">
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
              className="flex w-full  rounded-xl border  border-stroke bg-white py-3 shadow-default dark:border-strokedark dark:bg-boxdark "
            >
              <p className="text-neutral-500 text-sm font-light  dark:text-white mx-3 w-5 flex items-center">
                {index + 1}{' '}
              </p>
              <div className="grid grid-cols-10 w-full items-center dark:border-strokedark ">
                <div className="flex w-full justify-start col-span-2 gap-14 ">
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

                <div>
                  <button
                    onClick={() => handleClickDetail(index)}
                    className="w-20 bg-blue-600 text-white text-sm py-1"
                  >
                    Aksi
                  </button>
                </div>
                {showDetail[index] && (
                  <>
                    <div className="fixed z-50 inset-0 overflow-y-auto w-full backdrop-blur-sm bg-white/10 p-4 md:p-8 flex justify-center items-center">
                      <div className="flex flex-col gap-1 justify-center w-4/12 bg-white p-3 rounded-xl">
                        <div className="w-full flex justify-between">
                          <label
                            htmlFor="namaPemeriksa"
                            className="form-label block  text-black text-xs font-extrabold my-2 "
                          >
                            CATATAN
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              handleClickDetail(index);
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
                        <textarea
                          onChange={(e) => setNote(e.target.value)}
                          className="w-full border border-neutral-600 h-56 p-2 rounded-sm"
                          name=""
                          id=""
                        ></textarea>

                        <button
                          onClick={() => validasiTicket(data.id)}
                          className="text-xs font-bold bg-blue-600 py-2 px-5 text-white  w-full rounded-md"
                        >
                          Validasi
                        </button>
                        <button
                          onClick={() => tolakTicket(data.id)}
                          className="text-xs font-bold bg-red-600 py-2 px-5 text-white  w-full rounded-md"
                        >
                          Tolak
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
        <div className="w-full flex  mt-5 ">
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
