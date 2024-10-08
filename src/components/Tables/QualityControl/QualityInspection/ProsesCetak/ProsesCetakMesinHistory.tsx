import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@mui/material';

function ProsesCetakMesinHistory() {
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

  const [cetakMesin, setCetakMesin] = useState<any>();

  useEffect(() => {
    getCetakMesin();
  }, []);

  async function getCetakMesin() {
    const url = `${import.meta.env.VITE_API_LINK}/qc/cs/inspeksiCetak`;
    try {
      const res = await axios.get(url, {
        params: {
          status: 'history',
        },
        withCredentials: true,
      });

      setCetakMesin(res.data);
      console.log(res.data);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  // const [me, setMe] = useState<any>();

  // async function getMe() {
  //     const url = `${import.meta.env.VITE_API_LINK}/me`;
  //     try {
  //         const res = await axios.get(url, {
  //             withCredentials: true,
  //         });

  //         setMe(res.data);
  //     } catch (error: any) {
  //         console.log(error.data.msg);
  //     }
  // }

  const mesin = [
    {
      nama: 'R700',
      no_job_order: '00-000A',
      inspector: 'Iko Uwais',
      nama_jo: 'Kemasan',
    },
    {
      nama: 'SM74',
      no_job_order: '00-000A',
      inspector: 'Cris Pratt',
      nama_jo: 'Kemasan',
    },
    {
      nama: 'GTO',
      no_job_order: '00-000A',
      inspector: 'Zoe Saldana',
      nama_jo: 'Kemasan',
    },
  ];

  return (
    <>
      {!isMobile && (
        <main className="overflow-x-scroll">
          <div className="min-w-[700px] bg-white rounded-xl">
            <div className=" w-full h-full flex-col border-b-8 border-[#D8EAFF]">
              <div className="grid grid-cols-10 px-10 py-4 border-b-8 border-[#D8EAFF] gap-2 ">
                <label className="text-neutral-500 text-sm font-semibold col-span-2">
                  MESIN
                </label>

                <label className="text-neutral-500 text-sm font-semibold col-span-2">
                  No. Job Order
                </label>
                <label className="text-neutral-500 text-sm font-semibold col-span-2">
                  Nama Job Order
                </label>
                <label className="text-neutral-500 text-sm font-semibold col-span-2">
                  Inspector
                </label>
              </div>
              <div className="w-2 h-full "></div>
              {cetakMesin?.data.map((data: any, i: any) => (
                <>
                  <div className="grid grid-cols-10 border-b-8 border-[#D8EAFF] gap-2 items-center">
                    <div
                      className={`w-2 h-full sticky left-0 z-20 bg-green-600  gap-8 py-4 col-span-2 `}
                    >
                      <label className="text-neutral-500 text-sm font-semibold pl-10">
                        {data.mesin}
                      </label>
                    </div>

                    <label className="text-neutral-500 text-sm font-semibold col-span-2 pl-6">
                      {data.no_jo}
                    </label>
                    <label className="text-neutral-500 text-sm font-semibold col-span-2 pl-3">
                      {data.nama_produk}
                    </label>
                    <label className="text-neutral-500 text-sm font-semibold col-span-2">
                      {data.operator}
                    </label>
                    <div className="justify-end flex pr-2 col-span-2">
                      <>
                        <Link
                          to={`/qc/qualityinspection/cetak/jeniscetak/${data.id}`}
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

export default ProsesCetakMesinHistory;
