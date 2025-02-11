import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@mui/material';
import convertTimeStampToDate from '../../../../../utils/converDateTime';
import dateOnly from '../../../../../utils/convertDateOnly';
import ModalKosongan from '../../../../Modals/Qc/NCR/NCRResponQC';
import Loading from '../../../../Loading';

function HistoryTerlambat() {
    const [isLoading, setIsLoading] = useState(false);
    const [izin, setIzin] = useState<any>();

    useEffect(() => {
        getIzin();

    }, []);

    async function getIzin() {
        const url = `${import.meta.env.VITE_API_LINK}/hr/pengajuanTerlambat`;
        try {
            setIsLoading(true)
            const res = await axios.get(url,
                {
                    params: {
                        status_tiket: 'history'
                    },
                    withCredentials: true,
                });
            setIsLoading(false)
            setIzin(res.data);
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
        const url = `${import.meta.env.VITE_API_LINK}/hr/pengajuanTerlambat/approve/${id}`;
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
        if (window.confirm('Apakah Anda yakin ingin menolak pengajuan Terlambat ini?')) {
            const url = `${import.meta.env.VITE_API_LINK}/hr/pengajuanTerlambat/reject/${id}`;
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
                                Sumber
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                Personnel
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                Status
                            </label>
                        </div>
                        <div className="w-2 h-full "></div>
                        {izin?.data?.map((data: any, i: any) => {
                            const tanggal = dateOnly(data.createdAt);

                            // const endDate = new Date(data.sampai);
                            // const Onedaylater = new Date();
                            // Onedaylater.setDate(endDate.getDate() + 1);
                            // const formattedDate = Onedaylater.toLocaleDateString();
                            return (
                                <>
                                    <div className="grid grid-cols-12 border-b-8 border-[#D8EAFF] gap-2 items-center px-10">

                                        <label className="text-neutral-500 text-sm font-semibold ">
                                            {i + 1}
                                        </label>
                                        <div className='flex flex-col gap-1 col-span-3'>
                                            {convertTimeStampToDate(data.tanggal)}
                                        </div>

                                        <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                            {data.karyawan_pengaju?.biodata_karyawan[0]?.department?.nama_department}
                                        </label>
                                        <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                            {data.karyawan?.name}
                                        </label>
                                        <label className="text-neutral-500 text-sm font-semibold uppercase">
                                            {data.status}
                                        </label>
                                        <div className="justify-end flex pr-2 col-span-3">
                                            <>

                                                <button
                                                    onClick={() => openModalModal(i)}
                                                    className={`uppercase px-14 inline-flex rounded-[3px] items-center text-white text-xs font-bold  py-2 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600  justify-center`} // Dynamic class assignment
                                                >
                                                    Detail
                                                </button>
                                                {showModal[i] == true && (
                                                    <>
                                                        <ModalKosongan
                                                            isOpen={showModal[i]}
                                                            onClose={() => closeModalModal(i)}
                                                            judul={'Permohonan Terlambat'}>
                                                            <>
                                                                <div className='grid grid-cols-2 gap-2 px-4 py-4'>
                                                                    <div className='flex flex-col  '>
                                                                        <label htmlFor="" className='text-black text-xs font-bold'>
                                                                            Status
                                                                        </label>
                                                                        <label htmlFor="" className='text-[#016ae6] uppercase text-xl font-normal'>
                                                                            {data.status}
                                                                        </label>
                                                                    </div>
                                                                    <div className='flex flex-col  '>
                                                                        <label htmlFor="" className='text-black text-xs font-bold'>
                                                                            Yang Menyetujui
                                                                        </label>
                                                                        <label htmlFor="" className='text-[#016ae6] uppercase text-xl font-normal'>
                                                                            {data.karyawan_hr?.name}
                                                                        </label>
                                                                    </div>
                                                                </div>
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
                                                                                {dateOnly(data.createdAt)}
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
                                                                                Tanggal
                                                                            </label>
                                                                            <label htmlFor="" className='text-[#016ae6] text-xl font-normal'>
                                                                                {dateOnly(data.tanggal)}
                                                                            </label>
                                                                        </div>

                                                                    </div>
                                                                </div>
                                                                <div className='flex flex-col w-full px-4'>
                                                                    <label htmlFor="" className='text-black text-xs font-bold'>
                                                                        ALASAN TERLAMBAT
                                                                    </label>
                                                                    <label htmlFor="" className='text-[#7a7a7a] text-xl font-normal'>
                                                                        {data.type_izin}
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
                                                                        readOnly
                                                                        defaultValue={data.catatan_hr}
                                                                        className="peer h-full min-h-[100px] w-full resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                                                                    ></textarea>
                                                                </div>
                                                                <div className='flex gap-2 w-full px-4 pt-1'>

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

export default HistoryTerlambat;
