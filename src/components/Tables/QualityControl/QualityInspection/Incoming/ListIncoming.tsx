import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@mui/material';


function ListIncoming2() {
    const [isMobile, setIsMobile] = useState(false);
    const kosong: any = []
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const date = today.getDate();
    const currentDate = month + "/" + date + "/" + year;
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


    const [incoming, setIncoming] = useState<any>();

    useEffect(() => {

        getInspection();
    }, []);

    async function getInspection() {
        const url = `${import.meta.env.VITE_API_LINK}/qc/cs/inspeksiBahan?status=incoming`;
        try {
            const res = await axios.get(url, {

                withCredentials: true,
            });

            setIncoming(res.data.data);
            console.log(res.data.data);
        } catch (error: any) {
            console.log(error);
        }
    }

    function convertDatetimeToDate(datetime: any) {
        const dateObject = new Date(datetime);
        const day = dateObject
            .getDate()
            .toString()
            .padStart(2, '0'); // Ensure two-digit day
        const month = (dateObject.getMonth() + 1)
            .toString()
            .padStart(2, '0'); // Adjust for zero-based month
        const year = dateObject.getFullYear();
        const hours = dateObject
            .getHours()
            .toString()
            .padStart(2, '0');
        const minutes = dateObject
            .getMinutes()
            .toString()
            .padStart(2, '0');

        return `${year}/${month}/${day} `; // Example format (YYYY-MM-DD)
    }

    const tanggal = convertDatetimeToDate(new Date());


    return (
        <>
            {!isMobile && (
                <main className='overflow-x-scroll'>
                    <div className='min-w-[700px] bg-white rounded-xl'>
                        <p className='text-[14px] font-semibold w-full  border-b-8 border-[#D8EAFF] py-4 px-9 md:ps-9 ps-12'>{tanggal}</p>
                        <div className=' w-full h-full flex-col border-b-8 border-[#D8EAFF]'>

                            <div className='w-2 h-full '>

                            </div>
                            <section className=' grid grid-cols-10 px-4 py-4 items-center  border-b-8 border-[#D8EAFF] text-[14px]  text-black'>
                                <div className='flex flex-col col-span-1  text-stone-500 text-[16px] font-bold sticky left-2 ps-3 md:ps-0 bg-white'>
                                    <p className=''>No</p>
                                </div>
                                <div className='flex flex-col  col-span-2 text-stone-500 text-[16px] font-bold sticky left-2 ps-3 md:ps-0 bg-white'>
                                    <p className=''>Supplier</p>
                                </div>

                                <div className='flex flex-col   text-stone-500 text-[16px] font-bold sticky left-2 ps-3 md:ps-0 bg-white'>
                                    <p className=''>No. Surat Jalan</p>
                                </div>
                                <div className='flex flex-col  col-span-2 text-stone-500 text-[16px] font-bold sticky left-2 ps-3 md:ps-0 bg-white'>
                                    <p className=''>Nama Barang</p>
                                </div>
                                <div className='flex flex-col   text-stone-500 text-[16px] font-bold sticky left-2 ps-3 md:ps-0 bg-white'>
                                    <p className=''>Gramatur</p>
                                </div>
                                <div className='flex flex-col  col-span-2 text-stone-500 text-[16px] font-bold sticky left-2 ps-3 md:ps-0 bg-white'>
                                    <p className=''>No. JO</p>
                                </div>
                                <div className='flex flex-col  justify-end  items-end'>
                                </div>
                            </section>
                            {incoming?.map((data: any, i: any) => (
                                <>
                                    <section className=' grid grid-cols-10 px-4 items-center  border-b-8 border-[#D8EAFF] '>
                                        <div className='flex flex-col    sticky left-2 ps-3 md:ps-0 bg-white'>
                                            <p className='text-stone-500 text-sm font-medium'>{i + 1}</p>
                                        </div>
                                        <div className='flex flex-col   col-span-2  sticky left-2 ps-3 md:ps-0 bg-white'>
                                            <p className='text-stone-500 text-sm font-medium line-clamp-1'>{data.supplier}</p>
                                        </div>
                                        <div className='flex flex-col   sticky left-2 ps-3 md:ps-0 bg-white'>
                                            <p className='text-stone-500 text-sm font-medium line-clamp-1'>{data.no_surat_jalan}</p>
                                        </div>
                                        <div className='flex flex-col  col-span-2  sticky left-2 ps-3 md:ps-0 bg-white'>
                                            <p className='text-stone-500 text-sm font-medium line-clamp-1'>{data.jenis_kertas}</p>
                                        </div>
                                        <div className='flex flex-col    sticky left-2 ps-3 md:ps-0 bg-white'>
                                            <p className='text-stone-500 text-sm font-medium line-clamp-1'>{data.gramatur}</p>
                                        </div>
                                        <div className='flex flex-col   sticky left-2 ps-3 md:ps-0 bg-white'>
                                            <p className='text-stone-500 text-sm font-medium line-clamp-1'>{data.no_jo}</p>
                                        </div>
                                        <div className='flex flex-col  justify-end col-span-2 items-end'>

                                            <Link to={`/qc/qualityinspection/list/${data.id}`}>

                                                <button
                                                    className={`uppercase px-14 inline-flex rounded-[3px] items-center text-white text-xs font-bold  py-2 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600  justify-center`} // Dynamic class assignment
                                                >
                                                    PILIH

                                                </button>
                                            </Link>

                                        </div>
                                    </section>
                                </>
                            ))}
                        </div>
                    </div>
                </main>
            )}

        </>
    )
}

export default ListIncoming2