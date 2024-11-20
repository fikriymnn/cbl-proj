import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@mui/material';
import convertTimeStampToDate from '../../../../../utils/converDateTime';
import dateOnly from '../../../../../utils/convertDateOnly';
import ModalKosongan from '../../../../Modals/Qc/NCR/NCRResponQC';
import Loading from '../../../../Loading';

function IncomingPinjamanHR() {
    const [isLoading, setIsLoading] = useState(false);
    const [pinjaman, setPinjaman] = useState<any>();

    useEffect(() => {
        getPinjaman();

    }, []);

    async function getPinjaman() {
        const url = `${import.meta.env.VITE_API_LINK}/hr/pengajuanPinjaman`;
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
            setPinjaman(res.data);
            console.log(res.data);
        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }
    const [catatanHr, setcatatanHr] = useState<any>();
    const [sumberPinjaman, setSumberPinjaman] = useState<any>();


    async function approvePinjaman(id: any, index: any) {
        if (sumberPinjaman == null) {
            alert('Sumber Pinjaman Wajib Diisi');
            return;
        }
        if (catatanHr == null) {
            alert('Catatan Wajib Diisi');
            return;
        }
        const url = `${import.meta.env.VITE_API_LINK}/hr/pengajuanPinjaman/approve/${id}`;
        try {
            setIsLoading(true)
            const res = await axios.put(url,
                {
                    sumber_pinjaman: sumberPinjaman,
                    catatan_hr: catatanHr
                },
                {

                    withCredentials: true,
                });
            setIsLoading(false)
            getPinjaman();
            console.log(res.data);
            const updatedModalStates = [...showModal];
            updatedModalStates[index] = false;
            setShowModal(updatedModalStates);
        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }

    async function rejectPinjaman(id: any, index: number) {
        if (catatanHr == null) {
            alert('Catatan Wajib Diisi');
            return;
        }
        if (window.confirm('Apakah Anda yakin ingin menolak pengajuan pinjaman ini?')) {
            const url = `${import.meta.env.VITE_API_LINK}/hr/pengajuanPinjaman/reject/${id}`;
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
                getPinjaman();
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
    const formatCurrency = (amount: number): string => {
        return `Rp. ${amount.toLocaleString('id-ID')}`;
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
                            <label className="text-neutral-500 text-sm font-semibold col-span-2">
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
                        {pinjaman?.data?.map((data: any, i: any) => {
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

                                        <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                            {dateOnly(data.createdAt)}
                                        </label>



                                        <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                            {data.karyawan_pengaju?.biodata_karyawan[0]?.department?.nama_department}
                                        </label>
                                        <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                            {data.karyawan?.name}
                                        </label>
                                        <div className="justify-end flex pr-2 col-span-5">
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
                                                            judul={'Permohonan Pinjaman'}>
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
                                                                                JUMLAH PINJAMAN
                                                                            </label>
                                                                            <label htmlFor="" className='text-[#016ae6] text-xl font-normal'>
                                                                                {formatCurrency(data.jumlah_pinjaman)}
                                                                            </label>
                                                                        </div>
                                                                        <div className='flex flex-col '>
                                                                            <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                TEMPO CICILAN
                                                                            </label>
                                                                            <label htmlFor="" className='text-[#016ae6] text-xl font-normal'>
                                                                                {data.tempo_cicilan}
                                                                            </label>
                                                                        </div>
                                                                        <div className='flex flex-col '>
                                                                            <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                TIPE CICILAN
                                                                            </label>
                                                                            <label htmlFor="" className='text-[#016ae6] uppercase text-xl font-normal'>
                                                                                {data.tipe_cicilan}
                                                                            </label>
                                                                        </div>
                                                                        <div className='flex flex-col '>
                                                                            <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                JUMLAH CICILAN
                                                                            </label>
                                                                            <label htmlFor="" className='text-[#016ae6] uppercase text-xl font-normal'>
                                                                                {formatCurrency(data.jumlah_cicilan)}
                                                                            </label>
                                                                        </div>
                                                                        <div className='flex flex-col '>
                                                                            <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                JAMINAN PINJAMAN
                                                                            </label>
                                                                            <label htmlFor="" className='text-[#016ae6] uppercase text-xl font-normal'>
                                                                                {data.jaminan_pinjaman}
                                                                            </label>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className='flex flex-col w-full px-4'>
                                                                    <label htmlFor="" className='text-black text-xs font-bold'>
                                                                        KEPERLUAN PINJAMAN
                                                                    </label>
                                                                    <label htmlFor="" className='text-[#7a7a7a] text-xl font-normal'>
                                                                        {data.keperluan_pinjaman}
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
                                                                <div className='flex flex-col w-[50%] px-4 '>

                                                                    <div className="relative z-20 bg-transparent dark:bg-form-input py-2">
                                                                        <label htmlFor="" className='text-black text-xs font-bold'>
                                                                            SUMBER PINJAMAN<span className='text-red-600'>*</span>
                                                                        </label>
                                                                        <select
                                                                            onChange={(e) => setSumberPinjaman(e.target.value)}
                                                                            className={`relative z-20 w-full h-8 appearance-none rounded border border-stroke bg-transparent  px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary 
                                }`}
                                                                        >
                                                                            <option value="" selected disabled className="text-body dark:text-bodydark">
                                                                                Pilih Sumber Pinjaman
                                                                            </option>
                                                                            <option value="management" className="text-body dark:text-bodydark">
                                                                                MANAGEMENT
                                                                            </option>
                                                                            <option value="koprasi" className="text-body dark:text-bodydark">
                                                                                KOPRASI
                                                                            </option>

                                                                        </select>
                                                                        <span className="absolute top-[70%] right-4 z-30 -translate-y-1/2">
                                                                            <svg
                                                                                className="fill-current"
                                                                                width="24"
                                                                                height="24"
                                                                                viewBox="0 0 24 24"
                                                                                fill="none"
                                                                                xmlns="http://www.w3.org/2000/svg"
                                                                            >
                                                                                <g opacity="0.8">
                                                                                    <path
                                                                                        fillRule="evenodd"
                                                                                        clipRule="evenodd"
                                                                                        d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                                                                                        fill=""
                                                                                    ></path>
                                                                                </g>
                                                                            </svg>
                                                                        </span>
                                                                    </div>
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
                                                                        onClick={() => approvePinjaman(data.id, i)}
                                                                        className='bg-green-500 w-[50%] rounded-md px-3 py-3 text-white font-semibold text-sm'>
                                                                        TERIMA
                                                                    </button>
                                                                    {isLoading && <Loading />}
                                                                    <button
                                                                        disabled={isLoading}
                                                                        onClick={() => rejectPinjaman(data.id, i)}
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
                                    </div >
                                </>
                            )
                        })}
                    </div>
                </div>
            </main >

        </>
    );
}

export default IncomingPinjamanHR;
