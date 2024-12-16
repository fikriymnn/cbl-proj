import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@mui/material';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import convertTimeStampToDate from '../../../../../utils/converDateTime';

function ProsesSamplingRabutHistory() {
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
  }, []);

  const [RabutMesin, setRabutMesin] = useState<any>();

  useEffect(() => {
    getRabutMesin();
  }, [page]);
  const [noJo, setNoJo] = useState<any>();

  async function getRabutMesin() {
    const url = `${import.meta.env.VITE_API_LINK}/qc/cs/inspeksiAmparLem`;
    try {
      const res = await axios.get(url, {
        params: {
          search: noJo,
          status: 'history',
          page: page,
          limit: 15,
        },
        withCredentials: true,
      });

      setRabutMesin(res.data);
      console.log(res.data);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  return (
    <>

      <main className="overflow-x-scroll">
        <div className="min-w-[700px] bg-white rounded-xl">
          <div className="flex w-full justify-end h-full items-center border-b-8 border-[#D8EAFF]">
            <div className='flex flex-col gap-1 w-[20%] px-4 py-2 '>
              <p className=" my-auto text-xs text-primary font-semibold ">
                Cari
              </p>
              <input
                className='rounded-md h-8 bg-[#D8EAFF] px-2 w-full'
                placeholder='Nomor Jo'
                type="text"
                onChange={(e) => setNoJo(e.target.value)}
              ></input>
            </div>
            <div className="flex flex-col  w-[15%] px-4 py-2   gap-4">
              <p className=" my-auto text-xs text-primary font-semibold ">

              </p>
              <button
                onClick={() => {
                  getRabutMesin()
                }}
                className="bg-primary text-white  rounded-md px-1 py-1 "
              >
                Cari
              </button>

            </div>
          </div>
          <div className=" w-full h-full flex-col border-b-8 border-[#D8EAFF]">
            <div className="grid grid-cols-10 px-10 py-4 border-b-8 border-[#D8EAFF] gap-2 ">
              <label className="text-neutral-500 text-sm font-semibold col-span-2">
                No. JO
              </label>
              <label className="text-neutral-500 text-sm font-semibold col-span-2">
                Nama JO
              </label>
              <label className="text-neutral-500 text-sm font-semibold col-span-2">
                Inspector
              </label>
              <label className="text-neutral-500 text-sm font-semibold col-span-2">
                Tanggal
              </label>
            </div>
            <div className="w-2 h-full "></div>
            {RabutMesin?.data.map((data: any, i: any) => {
              const tanggal = convertTimeStampToDate(data.createdAt);
              return (
                <>
                  <div className="grid grid-cols-10 border-b-8 border-[#D8EAFF] gap-2 items-center">
                    <div
                      className={`w-full h-full sticky left-0 z-20  gap-8 col-span-2 flex items-center`}
                    >
                      <div
                        className={`w-2 h-full sticky left-0 z-20 bg-green-600  `}
                      ></div>
                      <label className="text-neutral-500 text-sm font-semibold ">
                        {data.no_jo}
                      </label>
                    </div>

                    <label className="text-neutral-500 text-sm font-semibold col-span-2 pl-3">
                      {data.nama_produk}
                    </label>
                    <label className="text-neutral-500 text-sm font-semibold col-span-2">
                      {data.operator}
                    </label>
                    <label className="text-neutral-500 text-sm font-semibold col-span-2">
                      {tanggal}
                    </label>
                    <div className="justify-end flex pr-2 col-span-2">
                      <>
                        <Link
                          to={`/qc/qualityinspection/ampar/checkAwal/${data.id}`}
                        >
                          <button
                            className={`uppercase px-3 inline-flex rounded-[3px] items-center text-white text-xs font-bold  py-2 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600  justify-center`} // Dynamic class assignment
                          >
                            PILIH
                          </button>
                        </Link>
                      </>
                    </div>
                  </div>
                </>
              )
            }

            )}
          </div>
        </div>
        <div className="w-full flex justify-center mt-5 ">
          <Stack spacing={2}>
            <Pagination
              count={RabutMesin?.total_page}
              color="primary"
              onChange={(e, i) => {
                setPage(i);
                console.log(i);
              }}
            />
          </Stack>
        </div>
      </main>

    </>
  );
}

export default ProsesSamplingRabutHistory;
