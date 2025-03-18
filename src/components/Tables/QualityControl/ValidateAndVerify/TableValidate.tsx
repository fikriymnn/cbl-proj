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
import convertTimeStampToDate from '../../../../utils/converDateTime';

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

  const [showDetail, setShowDetail] = useState<boolean[]>(
    new Array(ticketValidasi != null && ticketValidasi.length).fill(false),
  );

  const handleClickDetail = (index: number) => {
    setShowDetail((prevState) => {
      const updatedShowDetail = [...prevState];
      updatedShowDetail[index] = !updatedShowDetail[index]; // Toggle value
      return updatedShowDetail;
    });
  };

  useEffect(() => {
    getMTC();
  }, []);

  async function getMTC() {
    const url = `${import.meta.env.VITE_API_LINK}/validasiQc`;
    try {
      const res = await axios.get(url, {
        // params: {
        //   page: page,
        //   limit: 10,
        // },
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
      setShowDetail((prevDetail) =>
        prevDetail.map((isOpen, idx) => (idx === id ? false : isOpen)),
      );
      setNote('');
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
      setShowDetail((prevDetail) =>
        prevDetail.map((isOpen, idx) => (idx === id ? false : isOpen)),
      );
      setNote('');
      getMTC();
    } catch (error: any) {
      console.log(error.response);
    }
  }

  async function validasiTicketAll(id: number) {
    const url = `${import.meta.env.VITE_API_LINK}/kendalaLkh/validate/${id}`;
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
      setShowDetail((prevDetail) =>
        prevDetail.map((isOpen, idx) => (idx === id ? false : isOpen)),
      );
      setNote('');
      getMTC();
    } catch (error: any) {
      console.log(error.response);
    }
  }

  async function tolakTicketAll(id: number) {
    const url = `${import.meta.env.VITE_API_LINK}/kendalaLkh/reject/${id}`;
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
      setShowDetail((prevDetail) =>
        prevDetail.map((isOpen, idx) => (idx === id ? false : isOpen)),
      );
      setNote('');
      getMTC();
    } catch (error: any) {
      console.log(error.response);
    }
  }
  return (
    <>
      <div className="flex flex-col gap-2">
        <table className="min-w-full bg-white dark:bg-boxdark shadow-default">
          <thead className="border border-stroke dark:border-strokedark">
            <tr>
              <th className="py-3 px-2 text-xs font-semibold text-slate-600 dark:text-white text-left w-10">
                No
              </th>
              <th className="py-3 px-2 text-xs font-semibold text-slate-600 dark:text-white text-left">
                Kode Tiket
              </th>
              <th className="py-3 px-2 text-xs font-semibold text-slate-600 dark:text-white text-left">
                Waktu Masuk
              </th>
              <th className="py-3 px-2 text-xs font-semibold text-slate-600 dark:text-white text-left">
                Nama Mesin
              </th>
              <th className="py-3 px-2 text-xs font-semibold text-slate-600 dark:text-white text-left">
                No JO
              </th>
              <th className="py-3 px-2 text-xs font-semibold text-slate-600 dark:text-white text-left">
                Nama Produk
              </th>
              <th className="py-3 px-2 text-xs font-semibold text-slate-600 dark:text-white text-left">
                Kendala
              </th>
              <th className="py-3 px-2 text-xs font-semibold text-slate-600 dark:text-white text-left">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {ticketValidasi?.data.map((data: any, index: number) => {
              const tglTicket = convertTimeStampToDate(data.createdAt);
              return (
                <tr
                  key={index}
                  className="border border-stroke dark:border-strokedark hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="py-3 px-2 text-xs font-light text-neutral-500 dark:text-white">
                    {index + 1}
                  </td>
                  <td className="py-3 px-2 text-xs font-light text-neutral-500 dark:text-white whitespace-nowrap overflow-hidden text-ellipsis max-w-xs">
                    {data.kode_ticket}
                  </td>
                  <td className="py-3 px-2 text-xs font-light text-neutral-500 dark:text-white whitespace-nowrap">
                    {tglTicket}
                  </td>
                  <td className="py-3 px-2 text-xs font-light text-neutral-500 dark:text-white whitespace-nowrap">
                    {data.mesin}
                  </td>
                  <td className="py-3 px-2 text-xs font-light text-neutral-500 dark:text-white whitespace-nowrap">
                    {data.no_jo}
                  </td>
                  <td className="py-3 px-2 text-xs font-light text-neutral-500 dark:text-white overflow-hidden text-ellipsis max-w-xs">
                    {data.nama_produk}
                  </td>
                  <td className="py-3 px-2 text-xs font-light text-neutral-500 dark:text-white overflow-hidden text-ellipsis max-w-xs">
                    {data.jenis_kendala == 'Mesin' ||
                    data.jenis_kendala == 'mesin' ? (
                      <>
                        {data.kode_lkh +
                          ' - ' +
                          data.nama_kendala +
                          ' - ' +
                          data.jenis_kendala}
                      </>
                    ) : (
                      <>
                        {data.kode_kendala +
                          ' - ' +
                          data.nama_kendala +
                          ' - ' +
                          data.jenis_kendala}
                      </>
                    )}
                  </td>
                  <td className="py-3 px-2">
                    <button
                      onClick={() => handleClickDetail(index)}
                      className="bg-blue-600 text-white text-xs py-1 px-3 rounded"
                    >
                      Aksi
                    </button>
                    {showDetail[index] && (
                      <>
                        <div className="fixed z-50 inset-0 overflow-y-auto w-full backdrop-blur-sm bg-white/10 p-4 md:p-8 flex justify-center items-center">
                          <div className="flex flex-col gap-1 justify-center w-4/12 bg-white p-3 rounded-xl">
                            <label
                              htmlFor="namaPemeriksa"
                              className="form-label block  text-black text-xs font-bold my-2 uppercase"
                            >
                              KENDALA {data.jenis_kendala}
                            </label>
                            <div className="w-full flex justify-between">
                              <label
                                htmlFor="namaPemeriksa"
                                className="form-label block  text-black text-xs font-bold my-2 "
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
                            {data.jenis_kendala == 'Mesin' ||
                            data.jenis_kendala == 'mesin' ? (
                              <>
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
                              </>
                            ) : (
                              <>
                                <textarea
                                  onChange={(e) => setNote(e.target.value)}
                                  className="w-full border border-neutral-600 h-56 p-2 rounded-sm"
                                  name=""
                                  id=""
                                ></textarea>

                                <button
                                  onClick={() => validasiTicketAll(data.id)}
                                  className="text-xs font-bold bg-blue-600 py-2 px-5 text-white  w-full rounded-md"
                                >
                                  Validasi
                                </button>
                                <button
                                  onClick={() => tolakTicketAll(data.id)}
                                  className="text-xs font-bold bg-red-600 py-2 px-5 text-white  w-full rounded-md"
                                >
                                  Tolak
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* <div className="w-full flex  mt-5 ">
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
        </div> */}
      </div>
    </>
  );
};

export default TableValidasi;
