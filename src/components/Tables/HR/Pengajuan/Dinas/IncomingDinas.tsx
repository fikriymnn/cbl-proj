import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@mui/material';
import convertTimeStampToDate from '../../../../../utils/convertDate';
import Loading from '../../../../Loading';
import convertTimeStampToDateTime from '../../../../../utils/converDateTime';
import ModalKosongan from '../../../../Modals/Qc/NCR/NCRResponQC';

function IncomingDinas() {
    const [isLoading, setIsLoading] = useState(false);
    const [lembur, seLembur] = useState<any>();

    useEffect(() => {
        getIzin();

    }, []);

    async function getIzin() {
        const url = `${import.meta.env.VITE_API_LINK}/hr/pengajuanDinas`;
        try {
            setIsLoading(true)
            const res = await axios.get(url,
                {
                    params: {
                        status_tiket: 'incoming'
                    },
                    withCredentials: true,
                });
            setIsLoading(false)
            seLembur(res.data);
            console.log(res.data);
        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }
    const [catatanHr, setcatatanHr] = useState<any>();

    async function approveIzin(id: any, index: any) {
        if (catatanHr == null) {
            alert('Catatan Wajib Diisi');
            return;
        }
        const url = `${import.meta.env.VITE_API_LINK}/hr/pengajuanDinas/approve/${id}`;
        try {
            setIsLoading(true)
            const res = await axios.put(url,
                {
                    catatan_hr: catatanHr
                },
                {

                    withCredentials: true,
                });
            setIsLoading(false)
            getIzin();
            console.log(res.data);
            const updatedModalStates = [...showModal];
            updatedModalStates[index] = false;
            setShowModal(updatedModalStates);
        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }
    async function rejectIzin(id: any, index: number) {
        if (catatanHr == null) {
            alert('Catatan Wajib Diisi');
            return;
        }
        if (window.confirm('Apakah Anda yakin ingin menolak pengajuan Dinas ini?')) {
            const url = `${import.meta.env.VITE_API_LINK}/hr/pengajuanDinas/reject/${id}`;
            try {
                setIsLoading(true)
                const res = await axios.put(url,
                    {
                        catatan_hr: catatanHr
                    },
                    {

                        withCredentials: true,
                    });
                setIsLoading(false)
                getIzin();
                console.log(res.data);
                const updatedModalStates = [...showModal];
                updatedModalStates[index] = false;
                setShowModal(updatedModalStates);
            } catch (error: any) {
                setIsLoading(false)
                console.log(error);
            }
        }
    }
    const [showModal, setShowModal] = useState<boolean[]>([]);
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

            <main className="overflow-x-scroll">
                {isLoading && <Loading />}
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
                                Lama Dinas
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                Department
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                Personnel
                            </label>
                        </div>
                        <div className="w-2 h-full "></div>
                        {lembur?.data?.map((data: any, i: any) => {
                            const tanggal = convertTimeStampToDate(data.createdAt);
                            return (
                                <>
                                    <div className="grid grid-cols-12 border-b-8 border-[#D8EAFF] gap-2 items-center px-10">

                                        <label className="text-neutral-500 text-sm font-semibold ">
                                            {i + 1}
                                        </label>

                                        <div className='flex flex-col gap-1 col-span-3'>
                                            <label className="text-neutral-500 text-sm font-semibold ">
                                                Dari : {convertTimeStampToDateTime(data.dari)}
                                            </label>
                                            <label className="text-neutral-500 text-sm font-semibold ">
                                                Sampai :{convertTimeStampToDateTime(data.sampai)}
                                            </label>
                                        </div>
                                        <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                            {data.lama_lembur} Jam
                                        </label>
                                        <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                            {data.karyawan_pengaju?.biodata_karyawan[0]?.department?.nama_department}
                                        </label>
                                        <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                            {data.karyawan?.name}
                                        </label>

                                        <div className="justify-end flex pr-2 col-span-2">
                                            <>

                                                <button
                                                    onClick={() => openModalModal(i)}
                                                    className={`uppercase px-3 inline-flex rounded-[3px] items-center text-white text-xs font-bold  py-2 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600  justify-center`} // Dynamic class assignment
                                                >
                                                    ACTION
                                                </button>
                                                {showModal[i] == true && (
                                                    <>
                                                        <ModalKosongan
                                                            isOpen={showModal[i]}
                                                            onClose={() => closeModalModal(i)}
                                                            judul={'Permohonan Dinas'}>
                                                            <>
                                                                <div className='grid grid-cols-2 gap-2 px-4 py-4'>
                                                                    <div className='flex flex-col gap-2 '>
                                                                        <div className='flex flex-col '>
                                                                            <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                NAMA PERSONNEL
                                                                            </label>
                                                                            <label htmlFor="" className='text-[#7a7a7a] text-xl font-normal'>
                                                                                {data.karyawan?.name}
                                                                            </label>
                                                                        </div>
                                                                        <div className='flex flex-col '>
                                                                            <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                DEPARTEMEN
                                                                            </label>
                                                                            <label htmlFor="" className='text-[#7a7a7a] text-xl font-normal'>
                                                                                {data.karyawan_pengaju?.biodata_karyawan[0]?.department?.nama_department}
                                                                            </label>
                                                                        </div>
                                                                        <div className='flex flex-col '>
                                                                            <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                TANGGAL
                                                                            </label>
                                                                            <label htmlFor="" className='text-[#7a7a7a] text-xl font-normal'>
                                                                                {convertTimeStampToDateTime(data.createdAt)}
                                                                            </label>
                                                                        </div>
                                                                        <div className='flex flex-col '>
                                                                            <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                SUPERVISOR
                                                                            </label>
                                                                            <label htmlFor="" className='text-[#7a7a7a] text-xl font-normal'>
                                                                                {data.karyawan_pengaju?.name}
                                                                            </label>
                                                                        </div>
                                                                    </div>
                                                                    <div className='flex flex-col gap-2 '>


                                                                        <div className='flex flex-col '>
                                                                            <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                DARI
                                                                            </label>
                                                                            <label htmlFor="" className='text-[#016ae6] text-xl font-normal'>
                                                                                {convertTimeStampToDate(data.dari)}
                                                                            </label>
                                                                        </div>
                                                                        <div className='flex flex-col '>
                                                                            <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                SAMPAI
                                                                            </label>
                                                                            <label htmlFor="" className='text-[#016ae6] text-xl font-normal'>
                                                                                {convertTimeStampToDate(data.sampai)}
                                                                            </label>
                                                                        </div>


                                                                    </div>
                                                                </div>

                                                                <div className='flex flex-col w-full px-4'>
                                                                    <label htmlFor="" className='text-black text-xs font-bold'>
                                                                        ALASAN DINAS
                                                                    </label>
                                                                    <label htmlFor="" className='text-[#7a7a7a] text-xl font-normal'>
                                                                        {data.alasan_dinas}
                                                                    </label>
                                                                </div>
                                                                {/* <div className='px-4 py-2'>
                                                                    <button className='bg-blue-600 rounded-md px-3 py-2 text-white font-semibold text-sm'>
                                                                        CETAK SURAT
                                                                    </button>
                                                                </div> */}
                                                                <div className='grid grid-cols-2 gap-2 px-4 py-2'>
                                                                    {/* <div className='flex flex-col gap-1'>
                                                                        <label htmlFor="" className='text-black text-xs font-bold'>
                                                                            TANGGAL MASUK KEMBALI
                                                                        </label>
                                                                        <label htmlFor="" className='text-[#7a7a7a] text-xl font-normal'>
                                                                            {dateOnly(formattedDate)}
                                                                        </label>
                                                                    </div> */}

                                                                </div>
                                                                <div className='flex flex-col w-full px-4 '>
                                                                    <label htmlFor="" className='text-black text-xs font-bold'>
                                                                        RESPON HR<span className='text-red-600'>*</span>
                                                                    </label>
                                                                    <textarea
                                                                        onChange={(e) => setcatatanHr(e.target.value)}
                                                                        className="peer h-full min-h-[100px] w-full resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                                                                    ></textarea>
                                                                </div>
                                                                <div className='flex gap-2 w-full px-4 pt-1'>
                                                                    <button
                                                                        disabled={isLoading}
                                                                        onClick={() => approveIzin(data.id, i)}
                                                                        className='bg-green-500 w-[50%] rounded-md px-3 py-3 text-white font-semibold text-sm'>
                                                                        TERIMA
                                                                    </button>
                                                                    {isLoading && <Loading />}
                                                                    <button
                                                                        disabled={isLoading}
                                                                        onClick={() => rejectIzin(data.id, i)}
                                                                        className='bg-red-500 w-[50%] rounded-md px-3 py-3 text-white font-semibold text-sm'>
                                                                        TOLAK
                                                                    </button>
                                                                    {isLoading && <Loading />}
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

        </>
    );
}

export default IncomingDinas;
