import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@mui/material';


function ProsesCetakMesin() {
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

    const [showModal4, setShowModal4] = useState(false);

    const openModal4 = () => setShowModal4(true);

    const [pm1, setPm1] = useState<any>();

    // useEffect(() => {
    //     getPM1();
    //     getMe();
    // }, []);

    // async function getPM1() {
    //     const url = `${import.meta.env.VITE_API_LINK}/pm1`;
    //     try {
    //         const res = await axios.get(url, {
    //             params: {
    //                 tgl: currentDate
    //             },
    //             withCredentials: true,
    //         });

    //         setPm1(res.data);
    //         console.log(res.data);
    //     } catch (error: any) {
    //         console.log(error.data.msg);
    //     }
    // }

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

    // async function inspectPM1(id: any) {
    //     const url = `${import.meta.env.VITE_API_LINK}/pm1/response/${id}`;
    //     try {
    //         const res = await axios.get(url,
    //             {

    //                 withCredentials: true,
    //             }
    //         );
    //         console.log(res.data);
    //         navigate(`/maintenance/mesin/pm_1_form/${id}`)
    //     } catch (error: any) {
    //         console.log(error);
    //     }
    // }



    // async function createPM1() {
    //     const url = `${import.meta.env.VITE_API_LINK}/pm1/create`;
    //     try {
    //         const res = await axios.post(url, {
    //             withCredentials: true,
    //         });


    //         getPM1()
    //     } catch (error: any) {
    //         console.log(error);
    //     }
    // }

    const [showConfirm, setShowConfirm] = useState<any>([]);

    const openConfirm = (i: any) => {
        const onchangeVal: any = [...showConfirm];
        onchangeVal[i] = true
        setShowConfirm(onchangeVal);
    };

    const closeConfirm = (i: any) => {
        const onchangeVal: any = [...showConfirm];
        onchangeVal[i] = false;
        setShowConfirm(onchangeVal);
    };

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

    const mesin = [
        {

            nama: 'R700',
            no_job_order: '00-000A',
            inspector: 'Iko Uwais'
        },
        {

            nama: 'SM74',
            no_job_order: '00-000A',
            inspector: 'Cris Pratt'
        },
        {

            nama: 'GTO',
            no_job_order: '00-000A',
            inspector: 'Zoe Saldana'
        },
    ];

    return (
        <>
            {!isMobile && (
                <main className='overflow-x-scroll'>
                    <div className='min-w-[700px] bg-white rounded-xl'>
                        <p className='text-[14px] font-semibold w-full  border-b-8 border-[#D8EAFF] py-4 px-9 md:ps-9 ps-12'>{tanggal}</p>
                        <div className=' w-full h-full flex-col border-b-8 border-[#D8EAFF]'>
                            <div className='grid grid-cols-8 px-10 py-4 border-b-8 border-[#D8EAFF] gap-2 '>

                                <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                    MESIN
                                </label>

                                <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                    No. Job Order
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                    Inspector
                                </label>


                            </div>
                            <div className='w-2 h-full '>

                            </div>
                            {mesin.map((data: any, i: any) => (
                                <>
                                    <section className=' flex  justify-center  w-full h-[59px] border-b-8 border-[#D8EAFF] text-[14px]  text-black'>

                                        <div className={`w-2 h-full sticky left-0 z-20 bg-green-600  `}>

                                        </div>

                                        <div className=' w-full h-full flex flex-col justify-center relative'>
                                            <div className='ps-7 w-full flex gap-2'>
                                                <div className='flex flex-col justify-center text-stone-500 text-sm font-bold sticky left-2 ps-3 md:ps-0 bg-white'>
                                                    <p className=''>{data.nama}</p>

                                                </div>
                                                <p className=''>{data.no_job_order}</p>
                                                <p className=''>{data.inspector}</p>
                                            </div>
                                        </div>
                                        <div className='justify-end pr-4'>
                                            {data.nama == 'R700' ? (
                                                <>
                                                    <Link to={``}>

                                                        <button
                                                            className={`uppercase px-14 inline-flex rounded-[3px] items-center text-white text-xs font-bold  py-2 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600  justify-center`} // Dynamic class assignment
                                                        >
                                                            PILIH
                                                        </button>
                                                    </Link>
                                                </>
                                            ) : data.nama == 'SM74' ? (
                                                <>
                                                    <Link to={``}>
                                                        <button
                                                            className={`uppercase px-14 inline-flex rounded-[3px] items-center text-white text-xs font-bold  py-2 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600  justify-center`} // Dynamic class assignment
                                                        >
                                                            PILIH

                                                        </button>
                                                    </Link>
                                                </>
                                            ) : data.nama == 'GTO' ? (
                                                <>
                                                    <Link to={``}>
                                                        <button
                                                            className={`uppercase px-14 inline-flex rounded-[3px] items-center text-white text-xs font-bold  py-2 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600  justify-center`} // Dynamic class assignment
                                                        >
                                                            PILIH

                                                        </button>
                                                    </Link>
                                                </>
                                            ) :
                                                <>
                                                </>
                                            }

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

export default ProsesCetakMesin