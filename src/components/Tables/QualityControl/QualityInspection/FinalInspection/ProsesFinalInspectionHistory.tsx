import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@mui/material';
import convertTimeStampToDateOnly from '../../../../../utils/convertDateOnly';
import convertDateToTime from '../../../../../utils/converDateToTime';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

function ProsesFinalInspectionhistory() {
  const [isMobile, setIsMobile] = useState(false);
  const kosong: any = [];
  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  const date = today.getDate();
  const currentDate = month + '/' + date + '/' + year;
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
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
  }, [page]);

  const [FinalInspection, setFinalInspection] = useState<any>();

  useEffect(() => {
    getFinalInspection();
  }, [page]);

  async function getFinalInspection() {
    const url = `${import.meta.env.VITE_API_LINK}/qc/cs/inspeksiFinal`;
    try {
      const res = await axios.get(url, {
        params: {
          bagian_tiket: 'history',
          page: page,
          limit: 15,
        },

        withCredentials: true,
      });

      setFinalInspection(res.data);
      console.log(res.data);
    } catch (error: any) {
      console.log(error);
    }
  }

  return (
    <>
      {!isMobile && (
        <main className="overflow-x-scroll">
          <div className="min-w-[700px] bg-white rounded-xl">
            <div className=" w-full h-full flex-col border-b-8 border-[#D8EAFF]">
              <div className="grid grid-cols-12 border-b-8 border-[#D8EAFF] py-4 gap-2 items-center">
                <div
                  className={`w-full h-full sticky left-0 z-20  gap-8 col-span-1 flex items-center`}
                >
                  <div
                    className={`w-2 h-full sticky left-0 z-20   `}
                  ></div>
                  <label className="text-neutral-500 text-sm font-semibold ">
                    NO
                  </label>
                </div>
                <label className="text-neutral-500 text-sm font-semibold line-clamp-1">
                  No. JO
                </label>
                <label className="text-neutral-500 text-sm font-semibold col-span-3 line-clamp-1">
                  Customer
                </label>
                <label className="text-neutral-500 text-sm font-semibold col-span-3 pl-3 line-clamp-1 w-full">
                  Nama Produk
                </label>
                <label className="text-neutral-500 text-sm font-semibold col-span-1">
                  Inspector
                </label>
                <label className="text-neutral-500 text-sm font-semibold col-span-1">
                  Tanggal
                </label>
                <div className="justify-end flex pr-2 col-span-2">
                  <>

                  </>
                </div>
              </div>
              <div className="w-2 h-full "></div>
              {FinalInspection?.data.map((data: any, i: any) => {
                const tglTicket = convertTimeStampToDateOnly(data.createdAt);
                return (
                  <>
                    <div className="grid grid-cols-12 border-b-8 border-[#D8EAFF] gap-2 items-center">
                      <div
                        className={`w-full h-full sticky left-0 z-20  gap-8 col-span-1 flex items-center`}
                      >
                        <div
                          className={`w-2 h-full sticky left-0 z-20 bg-green-600  `}
                        ></div>
                        <label className="text-neutral-500 text-sm font-semibold ">
                          {i + 1}
                        </label>
                      </div>
                      <label className="text-neutral-500 text-sm font-semibold line-clamp-1">
                        {data.no_jo}
                      </label>
                      <label className="text-neutral-500 text-sm font-semibold col-span-3 line-clamp-1">
                        {data.customer}
                      </label>
                      <label className="text-neutral-500 text-sm font-semibold col-span-3 pl-3 line-clamp-1 w-full">
                        {data.nama_produk}
                      </label>
                      <label className="text-neutral-500 text-sm font-semibold col-span-1">
                        {data.data_inspector?.nama}
                      </label>
                      <label className="text-neutral-500 text-sm font-semibold col-span-1">
                        {tglTicket}
                      </label>
                      <div className="justify-end flex pr-2 col-span-2">
                        <>
                          <Link
                            to={`/qc/qualityinspection/final_inspection/checkAwal/${data.id}`}
                          >
                            <button
                              className={`uppercase px-14 inline-flex rounded-[3px] items-center text-white text-xs font-bold  py-2 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600  justify-center`} // Dynamic class assignment
                            >
                              PILIH
                            </button>
                          </Link>
                        </>
                      </div>
                    </div>
                  </>
                );
              })}
            </div>
          </div>
          <div className="w-full flex justify-center mt-5 ">
            <Stack spacing={2}>
              <Pagination
                count={FinalInspection?.total_page}
                color="primary"
                onChange={(e, i) => {
                  setPage(i);
                  console.log(i);
                }}
              />
            </Stack>
          </div>
        </main>
      )}
    </>
  );
}

export default ProsesFinalInspectionhistory;
