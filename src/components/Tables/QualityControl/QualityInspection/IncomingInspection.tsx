import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';



function IncomingInspection() {
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



    class JO {
        tgl: string = '8 July 2024'
        nolot: string = ''
        no_surat_jalan: string = '074/BDK MAS/0624'
        supplier: string = 'PT. SUPARMA'
        jenis_kertas: string = 'DUPLEX 250 GR'
        ukuran: string = '109 x 79 CM'
        jam: string = '10:32:00'
        inspector: string = 'Cristian Bale'
        jumlah: string = '25 RIM'
        itu: string = ''
    }
    const jo = new JO();
    return (
        <>

            {!isMobile && (
                <main className='overflow-x-scroll'>
                    <div className='min-w-[700px] bg-white rounded-xl'>

                        <p className='text-[14px] font-semibold w-full flex border-b-8 border-[#D8EAFF] py-4 px-9 md:ps-9 ps-12'>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12ZM13 8C13 8.55228 12.5523 9 12 9C11.4477 9 11 8.55228 11 8C11 7.44772 11.4477 7 12 7C12.5523 7 13 7.44772 13 8ZM13 17V11H11V17H13Z" fill="#0065DE" />
                            </svg>
                            Incoming Inspection Checksheet
                        </p>

                        <div className='grid grid-cols-10 px-10 py-4 border-b-8 border-[#D8EAFF]'>
                            <div className='grid grid-rows-6 gap-1 col-span-2'>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    Tanggal
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    No. LOT
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    No. Surat Jalan
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    Supplier
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    Jenis Kertas
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    Ukuran
                                </label>
                            </div>
                            <div className='grid grid-rows-6 gap-1 col-span-3'>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    : {jo.tgl}
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    : <input type='text' className='rounded-[3px]  border border-zinc-300' />
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    : {jo.no_surat_jalan}
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    : {jo.supplier}
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    : {jo.jenis_kertas}
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    : {jo.ukuran}
                                </label>
                            </div>

                            <div className='grid grid-rows-6  gap-1 col-span-2 justify-between'>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    Jam
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    Inspector
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>

                                </label>
                                <label className='text-black text-lg font-bold'>
                                    STANDAR PEMERIKSAAN
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    Jumlah
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    √N + 1
                                </label>


                            </div>
                            <div className='grid grid-rows-6  gap-1 col-span-2 justify-between '>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    : {jo.jam}
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    : {jo.inspector}
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>

                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>

                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    : {jo.jumlah}
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    : <input type='text' className='rounded-[3px]  border border-zinc-300' />
                                </label>


                            </div>
                        </div>
                        <div className='grid grid-cols-12 px-3 py-4 border-b-8 border-[#D8EAFF]'>
                            <div className='flex gap-4 col-span-2'>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    No
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    Keterangan
                                </label>
                            </div>
                            <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                Alat Ukur
                            </label>
                            <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                Metode
                            </label>
                            <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                Target
                            </label>
                            <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                Hasil
                            </label>
                            <label className='text-neutral-500 text-sm font-semibold '>
                                Keterangan
                            </label>
                            <label className='text-neutral-500 text-sm font-semibold flex justify-end'>
                                Bobot (%)
                            </label>
                        </div>

                        <div className='grid grid-cols-12 px-3 py-4 '>
                            <div className='flex gap-4 col-span-2'>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    1
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    Jenis Kertas
                                </label>
                            </div>
                            <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                -
                            </label>
                            <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                Visual
                            </label>
                            <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                Sesuai Surat Jalan
                            </label>
                            <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                <select >
                                    <option> Select Result</option>

                                </select>
                            </label>
                            <div className='flex flex-col gap-1'>
                                <label className='text-neutral-500 text-sm font-semibold '>
                                    <input type='checkbox' />Sesuai
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold '>
                                    <input type='checkbox' />Tidak Sesuai
                                </label>
                            </div>
                            <label className='text-neutral-500 text-sm font-semibold flex justify-center'>
                                25
                            </label>
                        </div>
                        <div className='grid grid-cols-10 bg-[#F5F5F5] px-3 py-4 border-b-8 border-[#D8EAFF]'>
                            <div className='col-span-2'>
                                <p className="md:text-[14px] text-[9px] font-semibold">
                                    Time : -

                                </p>
                                <>
                                    <p className='font-bold text-[#DE0000]'>
                                        Task Belum Dimulai
                                    </p>
                                    <button

                                        className="flex w-full rounded-md bg-[#00B81D] justify-center items-center px-2 py-3 hover:cursor-pointer"
                                    >
                                        <svg
                                            width="14"
                                            height="14"
                                            viewBox="0 0 14 14"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M12.7645 4.95136L3.63887 0.27536C1.96704 -0.581285 0 0.664567 0 2.58008V11.4199C0 13.3354 1.96704 14.5813 3.63887 13.7246L12.7645 9.04864C14.4118 8.20456 14.4118 5.79544 12.7645 4.95136Z"
                                                fill="white"
                                            />
                                        </svg>
                                    </button>
                                </>


                            </div>
                        </div>
                    </div>
                    <div>

                    </div>
                </main>
            )}

        </>
    )
}

export default IncomingInspection