import { useEffect, useState } from 'react';
import Logo from '../../images/logo/logo-cbl 1.svg';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const PM1Checklist = () => {
  const { id } = useParams();
  const [isMobile, setIsMobile] = useState(false);

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

  const [mesin, setMesin] = useState<any>();
  useEffect(() => {
    getMesin();
  }, []);
  async function getMesin() {
    const url = `${import.meta.env.VITE_API_LINK}/master/mesin/${id}`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      setMesin(res.data);
      getPointPm1(res.data.id);
      console.log(res.data);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  async function getPointPm1(id_mesin: any) {
    const url = `${import.meta.env.VITE_API_LINK}/master/pointPm1`;
    try {
      const res = await axios.get(url, {
        params: {
          id_mesin: id_mesin,
        },
        withCredentials: true,
      });

      console.log(res.data);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  return (
    <div className="rounded-xl border border-stroke bg-white pt-4 shadow-default dark:border-strokedark dark:bg-boxdark  xl:pb-1">
      {!isMobile && (
        <>
          <div className="flex w-full  gap-2 pr-8 border-b-6 border-[#D8EAFF] px-4 pb-5">
            <div className="flex flex-col w-11/12">
              <label className="text-neutral-500 text-sm font-semibold">
                Machine Details
              </label>
              <label className="text-neutral-500 text-sm font-semibold">
                Nama Mesin : {mesin != null && mesin.nama_mesin}
              </label>
            </div>
            <div className="flex w-3/12 justify-end">
              <a
                href={`/masterdata/masterpm1/pm1checklist/addinspection/${
                  mesin != null && mesin.id
                }`}
              >
                <button className="bg-[#0065DE] text-center text-white text-xs font-bold px-6 py-3 rounded-md">
                  + INSPECTION POINT
                </button>
              </a>
            </div>
          </div>
          <div className="flex py-4 flex-col">
            <div className="flex flex-row gap-4 px-4">
              <label className="text-black text-xs font-bold">POINT</label>
              <label className="text-black text-xs font-bold">
                INSPECTION POINT
              </label>
            </div>
            <div className="flex w-full flex-row gap-4 pt-3 px-4">
              <div className="flex w-[40px] justify-center">
                <label className="text-neutral-500 text-sm font-semibold">
                  1
                </label>
              </div>
              <div className="flex w-10/12">
                <label className="text-neutral-500 text-sm font-semibold">
                  Panel Listrik
                </label>
              </div>
              <div className="flex flex-row gap-3">
                <button className="bg-[#0065DE] text-center text-white text-xs font-bold px-6 py-2 rounded-md">
                  EDIT
                </button>
                <button className="bg-[#DE0000] text-center text-white text-xs font-bold px-6 py-2 rounded-md">
                  DELETE
                </button>
              </div>
            </div>
            <div className="flex w-full  pt-6 border-b border-stroke ml-[70px]">
              <label className="text-black text-xs font-bold">TASK LIST</label>
            </div>
            <div className="flex w-full  pt-4 border-b border-stroke ml-[70px] pb-4">
              <div className="flex w-[60px] justify-center">
                <label className="text-black text-xs font-bold">1</label>
              </div>
              <div className="flex w-5/12 justify-start pl-6 flex-col gap-2">
                <label className="text-black text-xs font-bold">TASK</label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Periksa Kondisi Kebersihan Panel
                </label>
                <label className="text-black text-xs font-bold pt-2">
                  INSPECTION METHOD
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Visual
                </label>
              </div>
              <div className="flex w-5/12 justify-start pl-6 flex-col gap-2">
                <label className="text-black text-xs font-bold text-start">
                  ACCEPTANCE CRITERIA
                </label>
                <label className="text-neutral-500 text-sm font-semibold text-start">
                  Pastikan tidak ada debu, waste, dan oil yang menempel pada
                  panel
                </label>
                <label className="text-black text-xs font-bold pt-2">
                  TOOLS
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Air Compressor / Vacum Cleaner / Kuas /Tongkat Kayu
                </label>
              </div>
            </div>
          </div>
        </>
      )}
      {isMobile && (
        <>
          <div className="flex w-full justify-between pr-8 border-b border-stroke pb-2">
            <input
              type="search"
              placeholder="search"
              name=""
              id=""
              className="md:w-96 w-40 py-1 mx-3 px-3 bg-[#E9F3FF]"
            />
            <button className=" bg-blue-600 rounded-sm text-white text-xs font-bold px-7 py-1">
              TAMBAH MESIN
            </button>
          </div>

          <div className="flex flex-col w-full ">
            <div className="flex border-b border-stroke dark:border-strokedark">
              <div className="flex items-center w-4/12 justify-center p-2.5 ">
                <p className="text-slate-600 text-[14px] font-semibold text-center dark:text-white">
                  Kode
                </p>
              </div>
              <div className="flex items-center text-[14px] w-4/12 justify-start p-2.5 pl-4">
                <p className="text-slate-600 font-semibold text-center dark:text-white">
                  Nama
                </p>
              </div>

              <div className="flex items-center text-[14px] w-4/12 justify-start  p-2.5 ">
                <p className="text-slate-600 font-semibold text-center">
                  {' '}
                  Tipe
                </p>
              </div>
            </div>
            {/* {masterMesin != null &&
                            masterMesin.map((data: any, i: number) => {
                                return (
                                    <>
                                        <div
                                            className={`flex ${i === masterMesin.length - 1
                                                ? 'w-full'
                                                : ' px-2 w-full'
                                                }`}
                                            key={i}
                                        >
                                            <div className="flex items-center w-2/12 justify-start p-2.5">
                                                <p className="text-slate-600 text-[14px] font-semibold text-center dark:text-white">{data.kode_mesin}</p>
                                            </div>
                                            <div className="flex items-end text-[14px] w-4/12 justify-end p-2.5 ">
                                                <p className="text-slate-600 font-semibold text-center dark:text-white">{data.nama_mesin}</p>
                                            </div>
                                            <div className="flex items-end text-[14px] w-1/12 justify-end p-2.5 ">

                                            </div>
                                            <div className="flex items-center text-[14px] w-4/12 justify-center p-2.5 ">
                                                <p
                                                    className={`text-[14px] font-semibold text-center uppercase ${data.bagian_mesin === 'printing'
                                                        ? 'text-green-500' : data.bagian_mesin === 'water base / coating' ? 'text-yellow-500'
                                                            : data.bagian_mesin === 'pond' ? 'text-purple-500' : data.bagian_mesin === 'finishing' ? 'text-red-500' : 'bg-white text-white'}`}>
                                                    {data.bagian_mesin}
                                                </p>
                                            </div>


                                        </div>
                                        <div className="flex items-start w-full justify-start p-2.5 gap-2 border-b border-stroke dark:border-strokedark">
                                            <button className='bg-blue-600 rounded-sm text-white text-xs font-bold px-4 py-1'>
                                                EDIT
                                            </button>
                                            <button className='bg-red-600 rounded-sm text-white text-xs font-bold px-4 py-1'>
                                                DELETE
                                            </button>
                                        </div>

                                    </>
                                );
                            })} */}
          </div>
        </>
      )}
    </div>
  );
};

export default PM1Checklist;
