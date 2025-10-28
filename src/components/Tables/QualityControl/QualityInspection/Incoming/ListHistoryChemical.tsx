import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@mui/material';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import convertTimeStampToDate from '../../../../../utils/converDateTime';

function ListHistoryChemical() {
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

  const [incoming, setIncoming] = useState<any>();

  useEffect(() => {
    getInspection();
  }, [page]);
  const [noJo, setNoJo] = useState<any>();
  async function getInspection() {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiChemical?status=history`;
    try {
      const res = await axios.get(url, {
        params: {
          search: noJo,
          page: page,
          limit: 15,
        },
        withCredentials: true,
      });

      setIncoming(res.data);
      console.log(res.data);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  function convertDatetimeToDate(datetime: any) {
    const dateObject = new Date(datetime);
    const day = dateObject.getDate().toString().padStart(2, '0'); // Ensure two-digit day
    const month = (dateObject.getMonth() + 1).toString().padStart(2, '0'); // Adjust for zero-based month
    const year = dateObject.getFullYear();
    const hours = dateObject.getHours().toString().padStart(2, '0');
    const minutes = dateObject.getMinutes().toString().padStart(2, '0');

    return `${year}/${month}/${day} `; // Example format (YYYY-MM-DD)
  }

  const tanggal = convertDatetimeToDate(new Date());

  return (
    <>
      {!isMobile && (
        <main className="overflow-x-scroll">
          <div className="min-w-[700px] bg-white rounded-xl">
            <div className="flex w-full justify-end h-full items-center border-b-8 border-[#D8EAFF]">
              <div className="flex flex-col gap-1 w-[40%] px-4 py-2 ">
                <p className=" my-auto text-xs text-primary font-semibold ">
                  Cari
                </p>
                <input
                  className="rounded-md h-8 bg-[#D8EAFF] px-2 w-full"
                  placeholder="Nomor Jo, Io, Produk, Customer"
                  type="text"
                  onChange={(e) => setNoJo(e.target.value)}
                ></input>
              </div>
              <div className="flex flex-col  w-[15%] px-4 py-2   gap-4">
                <p className=" my-auto text-xs text-primary font-semibold "></p>
                <button
                  onClick={() => {
                    getInspection();
                  }}
                  className="bg-primary text-white  rounded-md px-1 py-1 "
                >
                  Cari
                </button>
              </div>
            </div>
            <p className="text-[14px] font-semibold w-full  border-b-8 border-[#D8EAFF] py-4 px-9 md:ps-9 ps-12">
              {tanggal}
            </p>
            <div className=" w-full h-full flex-col border-b-8 border-[#D8EAFF]">
              <div className="w-2 h-full "></div>
              <section className=" grid grid-cols-12 px-4 py-4 items-center  border-b-8 border-[#D8EAFF] text-[14px]  text-black">
                <div className="flex gap-4 col-span-2 text-stone-500 text-[16px] font-bold md:ps-0 bg-white">
                  <p className="">No</p>
                  <p className="">Supplier</p>
                </div>

                <div className="flex flex-col  col-span-2 text-stone-500 text-[16px] font-bold md:ps-0 bg-white">
                  <p className="">No. Surat Jalan</p>
                </div>
                <div className="flex flex-col  col-span-2 text-stone-500 text-[16px] font-bold md:ps-0 bg-white">
                  <p className="">Nama Barang</p>
                </div>
                <div className="flex flex-col   text-stone-500 text-[16px] font-bold md:ps-0 bg-white">
                  <p className="">Gramatur</p>
                </div>
                <div className="flex flex-col   text-stone-500 text-[16px] font-bold md:ps-0 bg-white">
                  <p className="">No. JO</p>
                </div>
                <div className="flex flex-col   text-stone-500 text-[16px] font-bold md:ps-0 bg-white">
                  <p className="">Inspektor</p>
                </div>
                <div className="flex flex-col  col-span-2 text-stone-500 text-[16px] font-bold md:ps-0 bg-white">
                  <p className="">Tanggal</p>
                </div>
                <div className="flex flex-col  justify-end  items-end"></div>
              </section>
              {incoming?.data?.map((data: any, i: any) => {
                const tglTicket = convertTimeStampToDate(data.createdAt);
                return (
                  <>
                    <section className=" grid grid-cols-12 px-4 items-center  gap-2 border-b-8 border-[#D8EAFF] ">
                      <div className="flex  gap-4  col-span-2   bg-white">
                        <p className="text-stone-500 text-sm font-medium">
                          {i + 1}
                        </p>
                        <p className="text-stone-500 text-sm font-medium ">
                          {data.supplier}
                        </p>
                      </div>
                      <div className="flex flex-col   col-span-2 bg-white">
                        <p className="text-stone-500 text-sm font-medium ">
                          {data.no_surat_jalan}
                        </p>
                      </div>
                      <div className="flex flex-col  col-span-2   bg-white">
                        <p className="text-stone-500 text-sm font-medium ">
                          {data.jenis_kertas}
                        </p>
                      </div>
                      <div className="flex flex-col     bg-white">
                        <p className="text-stone-500 text-sm font-medium ">
                          {data.gramatur}
                        </p>
                      </div>
                      <div className="flex flex-col   bg-white">
                        <p className="text-stone-500 text-sm font-medium ">
                          {data.no_jo}
                        </p>
                      </div>
                      <div className="flex flex-col   bg-white">
                        <p className="text-stone-500 text-sm font-medium ">
                          {data.inspector}
                        </p>
                      </div>
                      <div className="flex flex-col col-span-2   bg-white">
                        <p className="text-stone-500 text-sm font-medium ">
                          {tglTicket}
                        </p>
                      </div>
                      <div className="flex flex-col  justify-end  items-end">
                        <Link to={`/qc/inspection/chemical/list/${data.id}`}>
                          <button
                            className={`uppercase px-3 inline-flex rounded-[3px] items-center text-white text-xs font-bold  py-2 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600  justify-center`} // Dynamic class assignment
                          >
                            PILIH
                          </button>
                        </Link>
                      </div>
                    </section>
                  </>
                );
              })}
            </div>
          </div>
          <div className="w-full flex justify-center mt-5 ">
            <Stack spacing={2}>
              <Pagination
                count={incoming?.total_page}
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

export default ListHistoryChemical;
