import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@mui/material';

function ProsesFinalInspectionhistory() {
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

  const [FinalInspection, setFinalInspection] = useState<any>();

  useEffect(() => {
    getFinalInspection();
  }, []);

  async function getFinalInspection() {
    const url = `${import.meta.env.VITE_API_LINK}/qc/cs/inspeksiFinal`;
    try {
      const res = await axios.get(url, {
        params: {
          bagian_tiket: 'history',
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
              <div className="grid grid-cols-10 px-10 py-4 border-b-8 border-[#D8EAFF] gap-2 ">
                <label className="text-neutral-500 text-sm font-semibold col-span-3">
                  No. Job Order
                </label>
                <label className="text-neutral-500 text-sm font-semibold col-span-3">
                  Nama Job Order
                </label>
                <label className="text-neutral-500 text-sm font-semibold col-span-2">
                  Inspector
                </label>
              </div>
              <div className="w-2 h-full "></div>
              {FinalInspection?.data.map((data: any, i: any) => (
                <>
                  <div className="grid grid-cols-10 border-b-8 border-[#D8EAFF] gap-2 items-center">
                    <div
                      className={`w-2 h-full sticky left-0 z-20 bg-green-600  gap-8 py-4 col-span-3 `}
                    >
                      {' '}
                      <label className="text-neutral-500 text-sm font-semibold col-span-3 pl-6">
                        {data.no_jo}
                      </label>
                    </div>

                    <label className="text-neutral-500 text-sm font-semibold col-span-3 pl-3">
                      {data.nama_produk}
                    </label>
                    <label className="text-neutral-500 text-sm font-semibold col-span-2">
                      {data.data_inspector?.nama}
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
              ))}
            </div>
          </div>
        </main>
      )}
    </>
  );
}

export default ProsesFinalInspectionhistory;