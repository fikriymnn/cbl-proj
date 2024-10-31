import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@mui/material';
import convertTimeStampToDate from '../../../../../utils/converDateTime';
import ModalKosongan from '../../../../Modals/Qc/NCR/NCRResponQC';

function IncomingCutiHR() {
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

    // const [cetakMesin, setCetakMesin] = useState<any>();

    // useEffect(() => {
    //     getCetakMesin();
    // }, []);

    // async function getCetakMesin() {
    //     const url = `${import.meta.env.VITE_API_LINK}/qc/cs/inspeksiBarangrusak`;
    //     try {
    //         const res = await axios.get(url, {
    //             params: {
    //                 status: 'incoming',
    //             },
    //             withCredentials: true,
    //         });

    //         setCetakMesin(res.data);
    //         console.log(res.data);
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
    const [showModal, setShowModal] = useState<any>([]);
    const openModalModal = (i: any) => {
        const onchangeVal: any = [...showModal];
        onchangeVal[i] = true;

        setShowModal(onchangeVal);
    };
    const closeModalModal = (i: any) => {
        const onchangeVal: any = [...showModal];
        onchangeVal[i] = false;

        setShowModal(onchangeVal);
    };
    return (
        <>
            {!isMobile && (
                <main className="overflow-x-scroll">
                    <div className="min-w-[700px] bg-white rounded-xl">
                        <div className=" w-full h-full flex-col border-b-8 border-[#D8EAFF]">
                            <div className="grid grid-cols-12 px-10 py-4 border-b-8 border-[#D8EAFF] gap-2 ">
                                <label className="text-neutral-500 text-sm font-semibold ">
                                    No
                                </label>

                                <label className="text-neutral-500 text-sm font-semibold col-span-3">
                                    Tanggal
                                </label>
                                <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                    Sumber
                                </label>
                                <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                    Personnel
                                </label>
                            </div>
                            <div className="w-2 h-full "></div>
                            {mesin?.map((data: any, i: any) => {
                                const tanggal = convertTimeStampToDate(data.createdAt);
                                return (
                                    <>
                                        <div className="grid grid-cols-12 border-b-8 border-[#D8EAFF] gap-2 items-center px-10">

                                            <label className="text-neutral-500 text-sm font-semibold ">
                                                {i + 1}
                                            </label>

                                            <label className="text-neutral-500 text-sm font-semibold col-span-3 ">
                                                1 Agustus 2024
                                            </label>
                                            <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                                Maintenance
                                            </label>
                                            <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                                {data.inspector}
                                            </label>
                                            <div className="justify-end flex pr-2 col-span-4">
                                                <>

                                                    <button
                                                        onClick={() => openModalModal(i)}
                                                        className={`uppercase px-14 inline-flex rounded-[3px] items-center text-white text-xs font-bold  py-2 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600  justify-center`} // Dynamic class assignment
                                                    >
                                                        ACTION
                                                    </button>
                                                    {showModal[i] == true && (
                                                        <>
                                                            <ModalKosongan
                                                                isOpen={showModal[i]}
                                                                onClose={() => closeModalModal(i)}
                                                                judul={'Permohonan Cuti'}>
                                                                <>
                                                                    <div className='grid grid-cols-2 gap-2 px-4 py-4'>
                                                                        <div className='flex flex-col gap-2 '>
                                                                            <div className='flex flex-col '>
                                                                                <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                    NAMA PERSONNEL
                                                                                </label>
                                                                                <label htmlFor="" className='text-[#7a7a7a] text-xl font-normal'>
                                                                                    Steve Roger
                                                                                </label>
                                                                            </div>
                                                                            <div className='flex flex-col '>
                                                                                <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                    DEPARTEMEN
                                                                                </label>
                                                                                <label htmlFor="" className='text-[#7a7a7a] text-xl font-normal'>
                                                                                    Maintenance
                                                                                </label>
                                                                            </div>
                                                                            <div className='flex flex-col '>
                                                                                <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                    TANGGAL
                                                                                </label>
                                                                                <label htmlFor="" className='text-[#7a7a7a] text-xl font-normal'>
                                                                                    10 MEI 2024
                                                                                </label>
                                                                            </div>
                                                                            <div className='flex flex-col '>
                                                                                <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                    DEPARTEMEN SUPERVISOR
                                                                                </label>
                                                                                <label htmlFor="" className='text-[#7a7a7a] text-xl font-normal'>
                                                                                    Not Steve
                                                                                </label>
                                                                            </div>
                                                                        </div>
                                                                        <div className='flex flex-col gap-2 '>
                                                                            <div className='flex flex-col '>
                                                                                <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                    TIPE CUTI
                                                                                </label>
                                                                                <label htmlFor="" className='text-[#016ae6] text-xl font-normal'>
                                                                                    TAHUNAN
                                                                                </label>
                                                                            </div>
                                                                            <div className='flex flex-col '>
                                                                                <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                    LAMA CUTI
                                                                                </label>
                                                                                <label htmlFor="" className='text-[#016ae6] text-xl font-normal'>
                                                                                    138 HARI
                                                                                </label>
                                                                            </div>
                                                                            <div className='flex flex-col '>
                                                                                <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                    AWAL
                                                                                </label>
                                                                                <label htmlFor="" className='text-[#016ae6] text-xl font-normal'>
                                                                                    10 MEI 2024
                                                                                </label>
                                                                            </div>
                                                                            <div className='flex flex-col '>
                                                                                <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                    AKHIR
                                                                                </label>
                                                                                <label htmlFor="" className='text-[#016ae6] text-xl font-normal'>
                                                                                    10 OKTOBER 2024
                                                                                </label>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className='flex flex-col w-full px-4'>
                                                                        <label htmlFor="" className='text-black text-xs font-bold'>
                                                                            ALASAN CUTI
                                                                        </label>
                                                                        <label htmlFor="" className='text-[#7a7a7a] text-xl font-normal'>
                                                                            Contoh tulisan untuk mendeskripsikan alasan cuti agar terlihat di bagian ini
                                                                        </label>
                                                                    </div>
                                                                    <div className='px-4 py-2'>
                                                                        <button className='bg-blue-600 rounded-md px-3 py-2 text-white font-semibold text-sm'>
                                                                            CETAK SURAT
                                                                        </button>
                                                                    </div>
                                                                    <div className='grid grid-cols-2 gap-2 px-4 py-2'>
                                                                        <div className='flex flex-col gap-1'>
                                                                            <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                TANGGAL MASUK KEMBALI
                                                                            </label>
                                                                            <label htmlFor="" className='text-[#7a7a7a] text-xl font-normal'>
                                                                                11 OKTOBER 2024
                                                                            </label>
                                                                        </div>
                                                                        <div className='flex flex-col gap-2'>
                                                                            <div className='flex flex-col gap-1'>
                                                                                <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                    JUMLAH HAK CUTI PERIODE
                                                                                </label>
                                                                                <label htmlFor="" className='text-[#7a7a7a] text-xl font-normal'>
                                                                                    5
                                                                                </label>
                                                                            </div>
                                                                            <div className='flex flex-col gap-1'>
                                                                                <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                    PENGGUNAAN HAK CUTI LALU
                                                                                </label>
                                                                                <label htmlFor="" className='text-[#7a7a7a] text-xl font-normal'>
                                                                                    1
                                                                                </label>
                                                                            </div>
                                                                            <div className='flex flex-col gap-1'>
                                                                                <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                    HAK CUTI YANG MASIH ADA
                                                                                </label>
                                                                                <label htmlFor="" className='text-[#7a7a7a] text-xl font-normal'>
                                                                                    2
                                                                                </label>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className='flex flex-col w-full px-4 '>
                                                                        <label htmlFor="" className='text-black text-xs font-bold'>
                                                                            RESPON HR<span className='text-red-600'>*</span>
                                                                        </label>
                                                                        <textarea

                                                                            className="peer h-full min-h-[100px] w-full resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                                                                        ></textarea>
                                                                    </div>
                                                                    <div className='flex gap-2 w-full px-4 pt-1'>
                                                                        <button className='bg-green-500 w-[50%] rounded-md px-3 py-3 text-white font-semibold text-sm'>
                                                                            TERIMA
                                                                        </button>
                                                                        <button className='bg-red-500 w-[50%] rounded-md px-3 py-3 text-white font-semibold text-sm'>
                                                                            TOLAK
                                                                        </button>
                                                                    </div>
                                                                </>
                                                            </ModalKosongan>
                                                        </>
                                                    )
                                                    }
                                                </>
                                            </div>
                                        </div>
                                    </>
                                )
                            })}
                        </div>
                    </div>
                </main>
            )}
        </>
    );
}

export default IncomingCutiHR;
