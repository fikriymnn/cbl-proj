import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@mui/material';

function ProsesLipat() {
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

  const [pondMesin, setPondMesin] = useState<any>();

  useEffect(() => {
    getPondMesin();
  }, []);

  async function getPondMesin() {
    const url = `${import.meta.env.VITE_API_LINK}/qc/cs/inspeksiLipat`;
    try {
      const res = await axios.get(url, {
        params: {
          status: 'incoming',
        },
        withCredentials: true,
      });

      setPondMesin(res.data);
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
            <div className=" w-full h-full flex-col border-b-8 border-[#D8EAFF]">
              <div className="grid grid-cols-10 px-10 py-4 border-b-8 border-[#D8EAFF]">
                <label className="text-neutral-500 text-sm font-semibold col-span-2 ">
                  No. JO
                </label>

                <label className="text-neutral-500 text-sm font-semibold col-span-2 ">
                  Nama Produk
                </label>
                <label className="text-neutral-500 text-sm font-semibold col-span-2">
                  Customer
                </label>
                <label className="text-neutral-500 text-sm font-semibold ">
                  Shift
                </label>
                <label className="text-neutral-500 text-sm font-semibold pl-4">
                  Mesin
                </label>
                <label className="text-neutral-500 text-sm font-semibold pl-5">
                  Operator
                </label>
              </div>
              <div className="w-2 h-full "></div>
              {pondMesin != null &&
                pondMesin.data?.map((data: any, i: any) => (
                  <>
                    <div className="grid grid-cols-10 border-b-8 border-[#D8EAFF]  items-center ">
                      <div className="flex w-full col-span-2 bg-red items-center gap-3">
                        <div
                          className={`w-2 h-full sticky left-0 z-20  gap-8 py-6 ${data.jenis_potong == 'potong bahan'
                            ? 'bg-green-600'
                            : 'bg-blue-600'
                            }`}
                        ></div>

                        <label className="text-neutral-500 text-sm font-semibold col-span-2">
                          {data.no_jo}
                        </label>

                      </div>
                      <label className="text-neutral-500 text-sm font-semibold col-span-2 line-clamp-2">
                        {data.item}
                      </label>
                      <label className="text-neutral-500 text-sm font-semibold col-span-2 line-clamp-2">
                        {data.customer}
                      </label>
                      <label className="text-neutral-500 text-sm font-semibold ">
                        {data.shift}
                      </label>
                      <label className="text-neutral-500 text-sm font-semibold ">
                        {data.mesin}
                      </label>
                      <label className="text-neutral-500 text-sm font-semibold ">
                        {data.operator}
                      </label>

                      <div className="justify-end flex pr-1">
                        <>
                          <Link to={`/qc/qualityinspection/lipat/${data.id}`}>
                            <button
                              className={`uppercase px-8 inline-flex rounded-[3px] items-center text-white text-xs font-bold  py-2 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600  justify-center`} // Dynamic class assignment
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

export default ProsesLipat;
