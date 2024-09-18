import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@mui/material';


function InspeksiQuality() {
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
    //         navigate(`/maintenance/inspection/pm_1_form/${id}`)
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

    const inspection = [
        {

            nama: 'INCOMING BAHAN',

        },
        {

            nama: 'PENGECEKAN PRA-PLATE',

        },
        {

            nama: 'PROSES POTONG',

        },
        {

            nama: 'PROSES CETAK',

        },
        {

            nama: 'PROSES COATING',

        },
        {

            nama: 'PROSES POND',

        },
        {

            nama: 'PROSES LEM',

        },
        {

            nama: 'SAMPLING HASIL RABUT',

        },
        {

            nama: 'SORTIR RS',

        },
        {

            nama: 'INCOMING OUTSOURCING',

        },
        {

            nama: 'PROSES LIPAT',

        },



    ];

    return (
        <>
            {!isMobile && (
                <main className='overflow-x-scroll'>
                    <div className='min-w-[700px] bg-white rounded-xl'>
                        <p className='text-[14px] font-semibold w-full  border-b-8 border-[#D8EAFF] py-4 px-9 md:ps-9 ps-12'>{tanggal}</p>
                        <div className=' w-full h-full flex-col border-b-8 border-[#D8EAFF]'>

                            <div className='w-2 h-full '>

                            </div>
                            {inspection.map((data: any, i: any) => (
                                <>
                                    <section className=' flex  justify-center  w-full h-[59px] border-b-8 border-[#D8EAFF] text-[14px]  text-black'>

                                        <div className={`w-2 h-full sticky left-0 z-20 
                                            ${data.nama == 'INCOMING BAHAN' ? 'bg-green-600' :
                                                data.nama == 'PROSES POTONG' ? 'bg-green-600' :
                                                    data.nama == 'PENGECEKAN PRA-PLATE' ? 'bg-green-600' :
                                                        data.nama == 'PROSES CETAK' ? 'bg-[#DE8500]' :
                                                            data.nama == 'PROSES COATING' ? 'bg-[#DE8500]' :
                                                                data.nama == 'PROSES POND' ? 'bg-[#DE8500]' :
                                                                    data.nama == 'PROSES COATING' ? 'bg-[#DE8500]' :
                                                                        data.nama == 'PROSES LEM' ? 'bg-[#DE8500]' :
                                                                            data.nama == 'SAMPLING HASIL RABUT' ? 'bg-[#DE8500]' :
                                                                                data.nama == 'FINAL INSPECTION' ? 'bg-[#DE8500]' :
                                                                                    data.nama == 'BARANG RUSAK SEBAGIAN' ? 'bg-[#DE8500]' :
                                                                                        data.nama == 'INCOMING OUTSOURCING' ? 'bg-[#DE8500]' :
                                                                                            data.nama == 'PROSES LIPAT' ? 'bg-[#DE8500]' :
                                                                                                'bg-[#DE8500]'}`}>

                                        </div>

                                        <div className=' w-full h-full flex flex-col justify-center relative'>
                                            <div className='ps-7 w-full flex'>
                                                <div className='flex flex-col justify-center text-stone-500 text-sm font-bold sticky left-2 ps-3 md:ps-0 bg-white'>
                                                    <p className=''>{data.nama}</p>
                                                </div>

                                            </div>
                                        </div>
                                        <div className='justify-end pr-4'>
                                            {data.nama == 'INCOMING BAHAN' ? (
                                                <>
                                                    <Link to={`/qc/qualityinspection/list`}>

                                                        <button
                                                            className={`uppercase px-14 inline-flex rounded-[3px] items-center text-white text-xs font-bold  py-2 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600  justify-center`} // Dynamic class assignment
                                                        >
                                                            PILIH

                                                        </button>
                                                    </Link>
                                                </>
                                            ) : data.nama == 'INCOMING OUTSOURCING' ? (
                                                <>
                                                    <Link to={`/qc/qualityinspection/incoming_outsourcing`}>
                                                        <button
                                                            className={`uppercase px-14 inline-flex rounded-[3px] items-center text-white text-xs font-bold  py-2 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600  justify-center`} // Dynamic class assignment
                                                        >
                                                            PILIH

                                                        </button>
                                                    </Link>
                                                </>
                                            ) : data.nama == 'PENGECEKAN PRA-PLATE' ? (
                                                <>
                                                    <Link to={`/qc/qualityinspection/praplate`}>
                                                        <button
                                                            className={`uppercase px-14 inline-flex rounded-[3px] items-center text-white text-xs font-bold  py-2 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600  justify-center`} // Dynamic class assignment
                                                        >
                                                            PILIH

                                                        </button>
                                                    </Link>
                                                </>

                                            ) : data.nama == 'PROSES POTONG' ? (
                                                <>
                                                    <Link to={`/qc/qualityinspection/prosespotong`}>
                                                        <button
                                                            className={`uppercase px-14 inline-flex rounded-[3px] items-center text-white text-xs font-bold  py-2 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600  justify-center`} // Dynamic class assignment
                                                        >
                                                            PILIH

                                                        </button>
                                                    </Link>
                                                </>
                                            ) : data.nama == 'PROSES CETAK' ? (
                                                <>
                                                    <Link to={`/qc/qualityinspection/cetak`}>
                                                        <button
                                                            className={`uppercase px-14 inline-flex rounded-[3px] items-center text-white text-xs font-bold  py-2 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600  justify-center`} // Dynamic class assignment
                                                        >
                                                            PILIH

                                                        </button>
                                                    </Link>
                                                </>
                                            ) : data.nama == 'PROSES COATING' ? (
                                                <>
                                                    <Link to={`/qc/qualityinspection/coating`}>
                                                        <button
                                                            className={`uppercase px-14 inline-flex rounded-[3px] items-center text-white text-xs font-bold  py-2 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600  justify-center`} // Dynamic class assignment
                                                        >
                                                            PILIH

                                                        </button>
                                                    </Link>
                                                </>
                                            ) : data.nama == 'PROSES POND' ? (
                                                <>
                                                    <Link to={`/qc/qualityinspection/pond`}>
                                                        <button
                                                            className={`uppercase px-14 inline-flex rounded-[3px] items-center text-white text-xs font-bold  py-2 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600  justify-center`} // Dynamic class assignment
                                                        >
                                                            PILIH

                                                        </button>
                                                    </Link>
                                                </>
                                            ) : data.nama == 'PROSES LEM' ?
                                                (
                                                    <>
                                                        <Link to={`/qc/qualityinspection/lem`}>
                                                            <button
                                                                className={`uppercase px-14 inline-flex rounded-[3px] items-center text-white text-xs font-bold  py-2 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600  justify-center`} // Dynamic class assignment
                                                            >
                                                                PILIH

                                                            </button>
                                                        </Link>
                                                    </>
                                                ) : data.nama == 'SAMPLING HASIL RABUT' ? (
                                                    <>
                                                        <Link to={`/qc/qualityinspection/sampling_hasil_rabut`}>
                                                            <button
                                                                className={`uppercase px-14 inline-flex rounded-[3px] items-center text-white text-xs font-bold  py-2 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600  justify-center`} // Dynamic class assignment
                                                            >
                                                                PILIH

                                                            </button>
                                                        </Link>
                                                    </>
                                                ) : data.nama == 'SORTIR RS' ? (
                                                    <>
                                                        <Link to={`/qc/qualityinspection/barangrs`}>
                                                            <button
                                                                className={`uppercase px-14 inline-flex rounded-[3px] items-center text-white text-xs font-bold  py-2 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600  justify-center`} // Dynamic class assignment
                                                            >
                                                                PILIH

                                                            </button>
                                                        </Link>
                                                    </>
                                                ) : data.nama == 'FINAL INSPECTION' ? (
                                                    <>
                                                        <Link to={`/qc/qualityinspection/final_inspection`}>
                                                            <button
                                                                className={`uppercase px-14 inline-flex rounded-[3px] items-center text-white text-xs font-bold  py-2 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600  justify-center`} // Dynamic class assignment
                                                            >
                                                                PILIH

                                                            </button>
                                                        </Link>
                                                    </>

                                                ) : data.nama == 'BARANG RUSAK SEBAGIAN' ? (
                                                    <>
                                                        <Link to={`/qc/qualityinspection/barang_rusak_sebagian`}>
                                                            <button
                                                                className={`uppercase px-14 inline-flex rounded-[3px] items-center text-white text-xs font-bold  py-2 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600  justify-center`} // Dynamic class assignment
                                                            >
                                                                PILIH

                                                            </button>
                                                        </Link>
                                                    </>
                                                ) : data.nama == 'PROSES LIPAT' ? (
                                                    <>
                                                        <Link to={`/qc/qualityinspection/lipat`}>
                                                            <button
                                                                className={`uppercase px-14 inline-flex rounded-[3px] items-center text-white text-xs font-bold  py-2 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600  justify-center`} // Dynamic class assignment
                                                            >
                                                                PILIH

                                                            </button>
                                                        </Link>
                                                    </>


                                                ) : ''
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

export default InspeksiQuality