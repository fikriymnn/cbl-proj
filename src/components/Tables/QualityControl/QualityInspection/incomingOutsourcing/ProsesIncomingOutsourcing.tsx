import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@mui/material';
import convertTimeStampToDate from '../../../../../utils/convertDate';

function ProsesIncomingOutsourcing() {
  const [isMobile, setIsMobile] = useState(false);
  const kosong: any = [];
  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  const date = today.getDate();
  const currentDate = month + '/' + date + '/' + year;
  const navigate = useNavigate();
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
  }, []);

  async function getRabutMesin() {
    const url = `${import.meta.env.VITE_API_LINK}/qc/cs/incomingOutsourcing`;
    try {
      const res = await axios.get(url, {
        params: {
          status: 'incoming',
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
      {!isMobile && (
        <main className="overflow-x-scroll">
          <div className="min-w-[700px] bg-white rounded-xl">
            <div className=" w-full h-full flex-col border-b-8 border-[#D8EAFF]">
              <div className="grid grid-cols-10 px-10 py-4 border-b-8 border-[#D8EAFF] gap-2 ">

                <label className="text-neutral-500 text-sm font-semibold col-span-2">
                  No. Job Order
                </label>
                <label className="text-neutral-500 text-sm font-semibold col-span-2">
                  Nama Job Order
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
                        {data.inspektor?.nama}
                      </label>
                      <label className="text-neutral-500 text-sm font-semibold col-span-2 ">
                        {tanggal}
                      </label>
                      <div className="justify-end flex pr-2 col-span-2">
                        <>
                          <Link
                            to={`/qc/qualityinspection/incoming_outsourcing/checkAwal/${data.id}`}
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
                )
              })}
            </div>
          </div>
        </main>
      )}
    </>
  );
}

export default ProsesIncomingOutsourcing;
