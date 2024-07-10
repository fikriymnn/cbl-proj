import React, { useEffect, useState } from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@mui/material';


function Pm2() {

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

    const [pm2, setPm2] = useState<any>();

    useEffect(() => {
        getPM2();
        getMe();
    }, []);

    async function getPM2() {
        const url = `${import.meta.env.VITE_API_LINK}/pm2`;
        try {
            const res = await axios.get(url, {
                params: {
                    tgl: currentDate
                },
                withCredentials: true,
            });

            setPm2(res.data);
            console.log(res.data);
        } catch (error: any) {
            console.log(error.data.msg);
        }
    }

    const [me, setMe] = useState<any>();

    async function getMe() {
        const url = `${import.meta.env.VITE_API_LINK}/me`;
        try {
            const res = await axios.get(url, {
                withCredentials: true,
            });

            setMe(res.data);
        } catch (error: any) {
            console.log(error.data.msg);
        }
    }

    async function inspectPM2(id: any) {
        const url = `${import.meta.env.VITE_API_LINK}/pm2/response/${id}`;
        try {
            const res = await axios.get(url,
                {

                    withCredentials: true,
                }
            );
            console.log(res.data);
            navigate(`/maintenance/inspection/pm_2_form/${id}`)
        } catch (error: any) {
            console.log(error);
        }
    }



    async function createPM2() {
        const url = `${import.meta.env.VITE_API_LINK}/pm2/create`;
        try {
            const res = await axios.post(url, {
                withCredentials: true,
            });


            getPM2()
        } catch (error: any) {
            console.log(error);
        }
    }

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
    return (
        <DefaultLayout>
            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Maintenance &gt; Inspection &gt; PM 2</p>
            {!isMobile && (
                <main className='overflow-x-scroll'>
                    <div className='min-w-[700px] bg-white rounded-xl'>

                        <p className='text-[14px] font-semibold w-full  border-b-8 border-[#D8EAFF] py-4 px-9 md:ps-9 ps-12'>{tanggal}</p>
                        {
                            pm2?.length <= 0 ?
                                <button onClick={createPM2}
                                    className={`uppercase p-5 inline-flex rounded-[3px] items-center text-sm  py-1 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600 text-white font-bold text-[12px] justify-center }`} // Dynamic class assignment
                                >
                                    TAMBAH PM2

                                </button> : null
                        }

                        <div className=' ps-7 w-full h-full flex border-b-8 border-[#D8EAFF]'>

                            <div className='w-2 h-full '>

                            </div>
                            <section className='grid grid-cols-6 w-full py-4  font-semibold text-[14px]'>

                                <p className=''>Nama Mesin</p>

                                <p>Inspector</p>

                                {/* <p>Leader</p>

                                <p>Supervisor</p>

                                <p>KA BAG MTC</p> */}

                                <div className='w-[125px]'>{""}</div>

                            </section>
                        </div>
                        {pm2 != null &&
                            pm2.map((data: any, i: any) => (
                                <>
                                    <section key={i} className=' flex  justify-center  w-full h-[59px]  border-b-8 border-[#D8EAFF] text-[14px]  text-black'>
                                        <div className={`w-2 h-full sticky left-0 z-20 ${data.mesin.bagian_mesin == 'printing' ? 'bg-green-600' : data.mesin.bagian_mesin == 'water base' ? 'bg-yellow-600' : data.mesin.bagian_mesin == 'pond' ? 'bg-violet-900' : data.mesin.bagian_mesin == 'finishing' ? 'bg-red-900' : ''}`}>

                                        </div>

                                        <div className=' w-full h-full flex flex-col justify-center relative'>

                                            <div className='ps-7 w-full grid grid-cols-6'>


                                                <div className='flex flex-col justify-center font-bold sticky left-2 ps-3 md:ps-0 bg-white'>
                                                    <p className=''>{data.mesin.nama_mesin}</p>
                                                </div>

                                                <div className='flex flex-col justify-center '>

                                                    <p className=''>{data.inspector != null ? data.inspector.nama : "-"}</p>

                                                </div>
                                                <div className='flex flex-col justify-center'>

                                                    {/* <p className=''>{data.leader != null ? data.leader.nama : '-'}</p> */}
                                                </div>
                                                <div className='flex flex-col justify-center'>

                                                    {/* <p className=''>{data.supervisor != null ? data.supervisor.nama : '-'}</p> */}
                                                </div>
                                                <div className='flex flex-col justify-center'>

                                                    {/* <p className=''>{data.ka_bag != null ? data.ka_bag.nama : '-'}</p> */}
                                                </div>

                                                <div>
                                                    {
                                                        data.id_inspector == me?.id ? (
                                                            <>
                                                                {
                                                                    data.status == "done" ?
                                                                        <Link to={`/maintenance/inspection/pm_2_form/${data.id}`}
                                                                            className={`uppercase p-5 inline-flex rounded-[3px] items-center text-sm  py-1 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600 text-white font-bold text-[12px] justify-center`} // Dynamic class assignment
                                                                        >
                                                                            INSPECT

                                                                        </Link> :
                                                                        <button onClick={() => inspectPM2(data.id)}
                                                                            className={`uppercase p-5 inline-flex rounded-[3px] items-center text-sm  py-1 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600 text-white font-bold text-[12px] justify-center`} // Dynamic class assignment
                                                                        >
                                                                            INSPECT

                                                                        </button>
                                                                }
                                                            </>
                                                        ) :
                                                            data.id_inspector == null ? (
                                                                <>
                                                                    <button onClick={() => inspectPM2(data.id)}
                                                                        className={`uppercase p-5 inline-flex rounded-[3px] items-center text-sm  py-1 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600 text-white font-bold text-[12px] justify-center`} // Dynamic class assignment
                                                                    >
                                                                        INSPECT

                                                                    </button>
                                                                </>
                                                            ) :
                                                                (
                                                                    <>

                                                                    </>
                                                                )}


                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                </>
                            ))}
                    </div>
                </main>
            )}
            {isMobile && (
                <main className='overflow-x-scroll'>
                    <div className='w-full bg-white rounded-xl'>

                        <p className='text-[14px] font-semibold w-full  border-b-8 border-[#D8EAFF] py-4 px-9 md:ps-9 ps-12'>{tanggal}</p>
                        {
                            pm2?.length <= 0 ?
                                <button onClick={createPM2}
                                    className={`uppercase p-5 inline-flex rounded-[3px] items-center text-sm  py-1 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600 text-white font-bold text-[12px] justify-center }`} // Dynamic class assignment
                                >
                                    TAMBAH PM2

                                </button> : null
                        }
                        <div className=' ps-7 w-full h-full flex border-b-8 border-[#D8EAFF]'>

                            <div className='w-2 h-full '>

                            </div>
                            <section className='grid grid-cols-1 w-full py-4  font-semibold text-[14px]'>


                                <p className=''>Nama Mesin</p>

                                <div className='w-[125px]'>{""}</div>

                            </section>
                        </div>
                        {pm2 != null &&
                            pm2.map((data: any, i: any) => (
                                <>
                                    <section key={i} className=' flex  justify-center  w-full h-[59px]  border-b-8 border-[#D8EAFF] text-[14px]  text-black'>
                                        <div className={`w-2 h-full sticky left-0 z-20 ${data.mesin.bagian_mesin == 'printing' ? 'bg-green-600' : data.mesin.bagian_mesin == 'water base' ? 'bg-yellow-600' : data.mesin.bagian_mesin == 'pond' ? 'bg-violet-900' : data.mesin.bagian_mesin == 'finishing' ? 'bg-red-900' : ''}`}>
                                        </div>
                                        <div className=' w-full h-full flex flex-col justify-center relative'>
                                            <div className='ps-7 w-full grid grid-cols-2'>

                                                <div className='flex flex-col justify-center font-bold sticky left-2 ps-3 md:ps-0 bg-white'>
                                                    <p className=''>{data.nama_mesin}</p>
                                                </div>

                                                <div className='flex justify-center'>
                                                    <>
                                                        <div>
                                                            {
                                                                data.id_inspector == me?.id ? (
                                                                    <>
                                                                        {
                                                                            data.status == "done" ?
                                                                                <Link to={`/maintenance/inspection/pm_2_form/${data.id}`}
                                                                                    className={`uppercase p-5 inline-flex rounded-[3px] items-center text-sm  py-1 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600 text-white font-bold text-[12px] justify-center`} // Dynamic class assignment
                                                                                >
                                                                                    INSPECT

                                                                                </Link> :
                                                                                <button onClick={() => inspectPM2(data.id)}
                                                                                    className={`uppercase p-5 inline-flex rounded-[3px] items-center text-sm  py-1 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600 text-white font-bold text-[12px] justify-center`} // Dynamic class assignment
                                                                                >
                                                                                    INSPECT

                                                                                </button>
                                                                        }
                                                                    </>
                                                                ) :
                                                                    data.id_inspector == null ? (
                                                                        <>
                                                                            <button onClick={() => inspectPM2(data.id)}
                                                                                className={`uppercase p-5 inline-flex rounded-[3px] items-center text-sm  py-1 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600 text-white font-bold text-[12px] justify-center`} // Dynamic class assignment
                                                                            >
                                                                                INSPECT

                                                                            </button>
                                                                        </>
                                                                    ) :
                                                                        (
                                                                            <>

                                                                            </>
                                                                        )}


                                                        </div>
                                                    </>



                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                </>
                            ))}
                    </div>
                </main>
            )}
        </DefaultLayout>
    )
}

export default Pm2