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
                            {" "} Incoming Inspection Checksheet
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
                        <div className='grid grid-cols-12 px-3 py-4 border-b-8 border-[#D8EAFF] gap-2'>
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
                            <div className='flex justify-between  col-span-3'>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    Hasil
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold pr-[20%]'>
                                    Keterangan
                                </label>
                            </div>

                            <label className='text-neutral-500 text-sm font-semibold flex justify-end'>
                                Bobot (%)
                            </label>
                        </div>

                        {/* =============================Point 1========================== */}
                        <>
                            <div className='grid grid-cols-12 px-3 py-4 gap-2'>
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
                                <div className='flex justify-between  col-span-3'>
                                    <label className='text-neutral-500 text-sm font-semibold'>
                                        <select >
                                            <option> Select Result</option>

                                        </select>
                                    </label>
                                    <div className='flex flex-col gap-1 pr-[10%]'>
                                        <label className='text-neutral-500 text-sm font-semibold '>
                                            <input type='checkbox' />Sesuai
                                        </label>
                                        <label className='text-neutral-500 text-sm font-semibold '>
                                            <input type='checkbox' />Tidak Sesuai
                                        </label>
                                    </div>
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

                                            className="flex w-[70%] rounded-md bg-[#00B81D] justify-center items-center px-2 py-3 hover:cursor-pointer"
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
                                <div className='col-span-4'>

                                </div>
                                <div className='col-span-4'>
                                    <div className="flex flex-col ">
                                        <p className="md:text-[14px] text-[9px] font-semibold">
                                            Upload Foto (Optional):
                                        </p>

                                        <br />
                                        <div className="">
                                            <input

                                                type="file"
                                                name=""
                                                id=""
                                                className="w-60"
                                            />
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </>
                        {/* =============================Point 2========================== */}
                        <>
                            <div className='grid grid-cols-12 px-3 py-4 gap-2 '>
                                <div className='flex gap-4 col-span-2'>
                                    <label className='text-neutral-500 text-sm font-semibold'>
                                        2
                                    </label>
                                    <label className='text-neutral-500 text-sm font-semibold'>
                                        Gramatur
                                    </label>
                                </div>
                                <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                    Timbangan Digital
                                </label>
                                <div className='flex flex-col gap-2 col-span-2'>
                                    <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                        Potong Kertas Ukuran 10x10cm di area KIRI, TENGAH, KANAN
                                    </label>
                                    <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                        Timbang Masing-Masing beratnya
                                    </label>
                                    <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                        Jumlahkan dan hitung nilai rata-ratanya (KIRI &lt; TENGAH &lt; KANAN : 3)
                                    </label>
                                </div>
                                <div className='flex flex-col gap-2 col-span-2'>
                                    <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                        Gramatur Sesuai Surat Jalan
                                    </label>
                                    <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                        Toleransi &#xb1; 4%
                                    </label>
                                </div>

                                <div className='flex justify-between  col-span-3'>
                                    <div className='flex flex-col  w-[60%]'>
                                        <label className='text-neutral-500 text-sm font-semibold '>
                                            Kiri
                                        </label>
                                        <input type='text' className='border-2 border-stroke w-[80%] rounded-sm' />
                                        <label className='text-neutral-500 text-sm font-semibold pt-1'>
                                            Tengah
                                        </label>
                                        <input type='text' className='border-2 border-stroke w-[80%] rounded-sm' />
                                        <label className='text-neutral-500 text-sm font-semibold pt-1'>
                                            Kanan
                                        </label>
                                        <input type='text' className='border-2 border-stroke w-[80%] rounded-sm' />
                                        <label className='text-neutral-500 text-sm font-semibold pt-1'>
                                            Rata-Rata
                                        </label>
                                        <input type='text' disabled className='border-2 border-stroke w-[80%] rounded-sm' />

                                    </div>
                                    <div className='flex flex-col gap-1  w-[50%]'>
                                        <label className='text-neutral-500 text-sm font-semibold '>
                                            <input type='checkbox' />Sesuai
                                        </label>
                                        <label className='text-neutral-500 text-sm font-semibold '>
                                            <input type='checkbox' className='' />Tidak Sesuai
                                        </label>
                                    </div>
                                </div>
                                <label className='text-neutral-500 text-sm font-semibold flex justify-center'>
                                    20
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

                                            className="flex w-[70%]  rounded-md bg-[#00B81D] justify-center items-center px-2 py-3 hover:cursor-pointer"
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
                                <div className='col-span-4'>

                                </div>
                                <div className='col-span-4'>
                                    <div className="flex flex-col ">
                                        <p className="md:text-[14px] text-[9px] font-semibold">
                                            Upload Foto (Optional):
                                        </p>

                                        <br />
                                        <div className="">
                                            <input

                                                type="file"
                                                name=""
                                                id=""
                                                className="w-60"
                                            />
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </>



                        {/* =============================Point 3========================== */}
                        <>
                            <div className='grid grid-cols-12 px-3 py-4 gap-2 '>
                                <div className='flex gap-4 col-span-2'>
                                    <label className='text-neutral-500 text-sm font-semibold'>
                                        3
                                    </label>
                                    <label className='text-neutral-500 text-sm font-semibold'>
                                        Thickness
                                    </label>
                                </div>
                                <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                    Thickness Gauge
                                </label>
                                <div className='flex flex-col gap-2 col-span-2'>
                                    <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                        Ukuran ketebalan Masing-Masing kertas yang sudah dipotong di point-2
                                    </label>

                                </div>
                                <div className='flex flex-col gap-2 col-span-2'>
                                    <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                        -
                                    </label>

                                </div>

                                <div className='flex justify-between  col-span-3'>
                                    <div className='flex flex-col  w-[60%]'>
                                        <label className='text-neutral-500 text-sm font-semibold '>
                                            Kiri
                                        </label>
                                        <input type='text' className='border-2 border-stroke w-[80%] rounded-sm' />
                                        <label className='text-neutral-500 text-sm font-semibold pt-1'>
                                            Tengah
                                        </label>
                                        <input type='text' className='border-2 border-stroke w-[80%] rounded-sm' />
                                        <label className='text-neutral-500 text-sm font-semibold pt-1'>
                                            Kanan
                                        </label>
                                        <input type='text' className='border-2 border-stroke w-[80%] rounded-sm' />


                                    </div>
                                    <div className='flex flex-col gap-1  w-[50%]'>
                                        <label className='text-neutral-500 text-sm font-semibold '>
                                            <input type='checkbox' />Sesuai
                                        </label>
                                        <label className='text-neutral-500 text-sm font-semibold '>
                                            <input type='checkbox' className='' />Tidak Sesuai
                                        </label>
                                    </div>
                                </div>
                                <label className='text-neutral-500 text-sm font-semibold flex justify-center'>
                                    15
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

                                            className="flex w-[70%]  rounded-md bg-[#00B81D] justify-center items-center px-2 py-3 hover:cursor-pointer"
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
                                <div className='col-span-4'>

                                </div>
                                <div className='col-span-4'>
                                    <div className="flex flex-col ">
                                        <p className="md:text-[14px] text-[9px] font-semibold">
                                            Upload Foto (Optional):
                                        </p>

                                        <br />
                                        <div className="">
                                            <input

                                                type="file"
                                                name=""
                                                id=""
                                                className="w-60"
                                            />
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </>
                        {/* =============================Point 4========================== */}
                        <>
                            <div className='grid grid-cols-12 px-3 py-4 gap-2 '>
                                <div className='flex gap-4 col-span-2'>
                                    <label className='text-neutral-500 text-sm font-semibold'>
                                        4
                                    </label>
                                    <label className='text-neutral-500 text-sm font-semibold'>
                                        Arah Serat
                                    </label>
                                </div>
                                <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                    Label Tercantum
                                </label>
                                <div className='flex flex-col gap-2 col-span-2'>
                                    <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                        Lihat Ukuran
                                    </label>

                                </div>
                                <div className='flex flex-col gap-2 col-span-2'>
                                    <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                        Sesuai arah serat di surat jalan
                                    </label>

                                </div>

                                <div className='flex justify-between  col-span-3'>
                                    <div className='flex flex-col  w-[60%]'>

                                        <label className='text-neutral-500 text-sm font-semibold '>
                                            <input type='checkbox' />Panjang
                                        </label>
                                        <label className='text-neutral-500 text-sm font-semibold '>
                                            <input type='checkbox' className='' />Pendek
                                        </label>
                                    </div>
                                    <div className='flex flex-col gap-1  w-[50%]'>
                                        <label className='text-neutral-500 text-sm font-semibold '>
                                            <input type='checkbox' />Sesuai
                                        </label>
                                        <label className='text-neutral-500 text-sm font-semibold '>
                                            <input type='checkbox' className='' />Tidak Sesuai
                                        </label>
                                    </div>
                                </div>
                                <label className='text-neutral-500 text-sm font-semibold flex justify-center'>
                                    10
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

                                            className="flex w-[70%]  rounded-md bg-[#00B81D] justify-center items-center px-2 py-3 hover:cursor-pointer"
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
                                <div className='col-span-4'>

                                </div>
                                <div className='col-span-4'>
                                    <div className="flex flex-col ">
                                        <p className="md:text-[14px] text-[9px] font-semibold">
                                            Upload Foto (Optional):
                                        </p>

                                        <br />
                                        <div className="">
                                            <input

                                                type="file"
                                                name=""
                                                id=""
                                                className="w-60"
                                            />
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </>
                        {/* =============================Point 5========================== */}
                        <>
                            <div className='grid grid-cols-12 px-3 py-4 gap-2 '>
                                <div className='flex gap-4 col-span-2'>
                                    <label className='text-neutral-500 text-sm font-semibold'>
                                        5
                                    </label>
                                    <label className='text-neutral-500 text-sm font-semibold'>
                                        Coating Depan
                                    </label>
                                </div>
                                <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                    Kaca Pembesar
                                </label>
                                <div className='flex flex-col gap-2 col-span-2'>
                                    <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                        Lihat Ukuran
                                    </label>

                                </div>
                                <div className='flex flex-col gap-2 col-span-2'>
                                    <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                        Visual
                                    </label>

                                </div>

                                <div className='flex justify-between  col-span-3'>
                                    <div className='flex flex-col  w-[60%]'>

                                        <label className='text-neutral-500 text-sm font-semibold '>
                                            <input type='checkbox' />Ok
                                        </label>
                                        <label className='text-neutral-500 text-sm font-semibold '>
                                            <input type='checkbox' className='' />Not Ok
                                        </label>
                                    </div>
                                    <div className='flex flex-col gap-1  w-[50%]'>
                                        <label className='text-neutral-500 text-sm font-semibold'>
                                            <select >
                                                <option> Select Coating</option>

                                            </select>
                                        </label>
                                        <label className='text-neutral-500 text-sm font-semibold '>
                                            <input type='checkbox' />Sesuai
                                        </label>
                                        <label className='text-neutral-500 text-sm font-semibold '>
                                            <input type='checkbox' className='' />Tidak Sesuai
                                        </label>
                                    </div>
                                </div>
                                <label className='text-neutral-500 text-sm font-semibold flex justify-center'>
                                    10
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

                                            className="flex w-[70%]  rounded-md bg-[#00B81D] justify-center items-center px-2 py-3 hover:cursor-pointer"
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
                                <div className='col-span-4'>

                                </div>
                                <div className='col-span-4'>
                                    <div className="flex flex-col ">
                                        <p className="md:text-[14px] text-[9px] font-semibold">
                                            Upload Foto (Optional):
                                        </p>

                                        <br />
                                        <div className="">
                                            <input

                                                type="file"
                                                name=""
                                                id=""
                                                className="w-60"
                                            />
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </>

                        {/* =============================Point 6========================== */}
                        <>
                            <div className='grid grid-cols-12 px-3 py-4 gap-2 '>
                                <div className='flex gap-4 col-span-2'>
                                    <label className='text-neutral-500 text-sm font-semibold'>
                                        6
                                    </label>
                                    <label className='text-neutral-500 text-sm font-semibold'>
                                        Ukuran
                                    </label>
                                </div>
                                <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                    Mistar/Penggaris
                                </label>
                                <div className='flex flex-col gap-2 col-span-2'>
                                    <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                        Diukur panjang dan lebar
                                    </label>

                                </div>
                                <div className='flex flex-col gap-2 col-span-2'>
                                    <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                        Sesuai size di surat jalan, toleransi tidak boleh &lt;= 2mm
                                    </label>

                                </div>

                                <div className='flex justify-between  col-span-3'>
                                    <div className='flex flex-col  w-[60%]'>

                                        <label className='text-neutral-500 text-sm font-semibold'>
                                            <select className='w-[80%]'>
                                                <option> Select </option>

                                            </select>
                                        </label>
                                    </div>
                                    <div className='flex flex-col gap-1  w-[50%]'>

                                        <label className='text-neutral-500 text-sm font-semibold '>
                                            <input type='checkbox' />Sesuai
                                        </label>
                                        <label className='text-neutral-500 text-sm font-semibold '>
                                            <input type='checkbox' className='' />Tidak Sesuai
                                        </label>
                                    </div>
                                </div>
                                <label className='text-neutral-500 text-sm font-semibold flex justify-center'>
                                    5
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

                                            className="flex w-[70%]  rounded-md bg-[#00B81D] justify-center items-center px-2 py-3 hover:cursor-pointer"
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
                                <div className='col-span-4'>

                                </div>
                                <div className='col-span-4'>
                                    <div className="flex flex-col ">
                                        <p className="md:text-[14px] text-[9px] font-semibold">
                                            Upload Foto (Optional):
                                        </p>

                                        <br />
                                        <div className="">
                                            <input

                                                type="file"
                                                name=""
                                                id=""
                                                className="w-60"
                                            />
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </>
                        {/* =============================Point 7========================== */}
                        <>
                            <div className='grid grid-cols-12 px-3 py-4 gap-2 '>
                                <div className='flex gap-4 col-span-2'>
                                    <label className='text-neutral-500 text-sm font-semibold'>
                                        7
                                    </label>
                                    <label className='text-neutral-500 text-sm font-semibold'>
                                        Gelombang
                                    </label>
                                </div>
                                <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                    Penggaris
                                </label>
                                <div className='flex flex-col gap-2 col-span-2'>
                                    <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                        Toleransi melengkung / gelombanng = &#xb1; 8mm
                                    </label>

                                </div>
                                <div className='flex flex-col gap-2 col-span-2'>
                                    <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                        -
                                    </label>

                                </div>

                                <div className='flex justify-between  col-span-3'>
                                    <div className='flex flex-col  w-[60%]'>

                                        <label className='text-neutral-500 text-sm font-semibold '>
                                            <input type='checkbox' />Toleransi
                                        </label>
                                        <label className='text-neutral-500 text-sm font-semibold '>
                                            <input type='checkbox' className='' />Not Toleransi
                                        </label>
                                    </div>
                                    <div className='flex flex-col gap-1  w-[50%]'>

                                        <label className='text-neutral-500 text-sm font-semibold '>
                                            <input type='checkbox' />Sesuai
                                        </label>
                                        <label className='text-neutral-500 text-sm font-semibold '>
                                            <input type='checkbox' className='' />Tidak Sesuai
                                        </label>
                                    </div>
                                </div>
                                <label className='text-neutral-500 text-sm font-semibold flex justify-center'>
                                    5
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

                                            className="flex w-[70%]  rounded-md bg-[#00B81D] justify-center items-center px-2 py-3 hover:cursor-pointer"
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
                                <div className='col-span-4'>

                                </div>
                                <div className='col-span-4'>
                                    <div className="flex flex-col ">
                                        <p className="md:text-[14px] text-[9px] font-semibold">
                                            Upload Foto (Optional):
                                        </p>

                                        <br />
                                        <div className="">
                                            <input

                                                type="file"
                                                name=""
                                                id=""
                                                className="w-60"
                                            />
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </>
                        {/* =============================Point 8========================== */}
                        <>
                            <div className='grid grid-cols-12 px-3 py-4 gap-2 '>
                                <div className='flex gap-4 col-span-2'>
                                    <label className='text-neutral-500 text-sm font-semibold'>
                                        8
                                    </label>
                                    <label className='text-neutral-500 text-sm font-semibold'>
                                        Warna
                                    </label>
                                </div>
                                <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                    Color Tolerance / Sample
                                </label>
                                <div className='flex flex-col gap-2 col-span-2'>
                                    <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                        Visual
                                    </label>

                                </div>
                                <div className='flex flex-col gap-2 col-span-2'>
                                    <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                        Warna Dasar Sesuai
                                    </label>

                                </div>

                                <div className='flex justify-between  col-span-3'>
                                    <div className='flex flex-col  w-[60%]'>

                                        <label className='text-neutral-500 text-sm font-semibold '>
                                            <input type='checkbox' />Ok
                                        </label>
                                        <label className='text-neutral-500 text-sm font-semibold '>
                                            <input type='checkbox' className='' />Not Ok
                                        </label>
                                    </div>
                                    <div className='flex flex-col gap-1  w-[50%]'>

                                        <label className='text-neutral-500 text-sm font-semibold '>
                                            <input type='checkbox' />Sesuai
                                        </label>
                                        <label className='text-neutral-500 text-sm font-semibold '>
                                            <input type='checkbox' className='' />Tidak Sesuai
                                        </label>
                                    </div>
                                </div>
                                <label className='text-neutral-500 text-sm font-semibold flex justify-center'>
                                    5
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

                                            className="flex w-[70%]  rounded-md bg-[#00B81D] justify-center items-center px-2 py-3 hover:cursor-pointer"
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
                                <div className='col-span-4'>

                                </div>
                                <div className='col-span-4'>
                                    <div className="flex flex-col ">
                                        <p className="md:text-[14px] text-[9px] font-semibold">
                                            Upload Foto (Optional):
                                        </p>

                                        <br />
                                        <div className="">
                                            <input

                                                type="file"
                                                name=""
                                                id=""
                                                className="w-60"
                                            />
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </>
                        {/* =============================Point 9========================== */}
                        <>
                            <div className='grid grid-cols-12 px-3 py-4 gap-2 '>
                                <div className='flex gap-4 col-span-2'>
                                    <label className='text-neutral-500 text-sm font-semibold'>
                                        9
                                    </label>
                                    <label className='text-neutral-500 text-sm font-semibold'>
                                        Quantity
                                    </label>
                                </div>
                                <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                    Hitung Manual
                                </label>
                                <div className='flex flex-col gap-2 col-span-2'>
                                    <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                        Sampling sesuai standard AQL
                                    </label>

                                </div>
                                <div className='flex flex-col gap-2 col-span-2'>
                                    <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                        Sesuai per pack
                                    </label>

                                </div>

                                <div className='flex justify-between  col-span-3'>
                                    <div className='flex flex-col  w-[60%]'>

                                        <label className='text-neutral-500 text-sm font-semibold '>
                                            <input type='checkbox' />Ok
                                        </label>
                                        <label className='text-neutral-500 text-sm font-semibold '>
                                            <input type='checkbox' className='' />Not Ok
                                        </label>
                                    </div>
                                    <div className='flex flex-col gap-1  w-[50%]'>

                                        <label className='text-neutral-500 text-sm font-semibold '>
                                            <input type='checkbox' />Sesuai
                                        </label>
                                        <label className='text-neutral-500 text-sm font-semibold '>
                                            <input type='checkbox' className='' />Tidak Sesuai
                                        </label>
                                    </div>
                                </div>
                                <label className='text-neutral-500 text-sm font-semibold flex justify-center'>
                                    5
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

                                            className="flex w-[70%]  rounded-md bg-[#00B81D] justify-center items-center px-2 py-3 hover:cursor-pointer"
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
                                <div className='col-span-4'>

                                </div>
                                <div className='col-span-4'>
                                    <div className="flex flex-col ">
                                        <p className="md:text-[14px] text-[9px] font-semibold">
                                            Upload Foto (Optional):
                                        </p>

                                        <br />
                                        <div className="">
                                            <input

                                                type="file"
                                                name=""
                                                id=""
                                                className="w-60"
                                            />
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </>

                    </div>
                    <div className='bg-white flex w-full justify-between px-4 py-4'>
                        <div className='flex flex-col'>
                            <label className='text-neutral-500 text-sm font-semibold '>
                                <input type='checkbox' className='rounded-full' /> {' '}DITERIMA
                            </label>
                            <label className='text-neutral-500 text-sm font-semibold '>
                                <input type='checkbox' className='' /> {' '}DITOLAK
                            </label>
                        </div>
                        <div>
                            <button className='bg-[#0065DE] px-4 py-2 rounded-sm text-center text-white text-xs font-bold'>
                                SUBMIT CHECKSHEET
                            </button>
                        </div>
                    </div>
                </main>
            )}

        </>
    )
}

export default IncomingInspection