import axios from 'axios';
import React, { useEffect, useState } from 'react'
import Loading from '../../../Loading';
import ModalKosongan from '../../../Modals/Qc/NCR/NCRResponQC';
import convertTimeStampToDateTime from '../../../../utils/converDateTime';
import convertTimeStampToDate from '../../../../utils/convertDate';

function OsKetidaksesuaianSPL() {

    const [isLoading, setIsLoading] = useState(false);
    const [openButton, setOpenButton] = useState(null);
    const [lkh, setLkh] = useState<any>();
    const [idInspektor, setIdInspektor] = useState<any>();
    const [namInspektor, setNamaInspektor] = useState<any>();


    useEffect(() => {
        getMe()
        getLKH()
    }, []);

    async function getMe() {
        const url = `${import.meta.env.VITE_API_LINK}/me`;
        try {
            const res = await axios.get(url, {
                withCredentials: true,
            });

            setIdInspektor(res?.data.id_karyawan)

            console.log('getme', res.data)
        } catch (error: any) {
            console.log(error.data.msg);
        }
    }

    async function getLKH() {
        const url = `${import.meta.env.VITE_API_LINK}/hr/pengajuanLembur`;
        try {
            const res = await axios.get(url,
                {
                    params: {
                        status_ketidaksesuaian: 'incoming',
                    },
                    withCredentials: true,
                });

            setLkh(res.data.data);
            console.log('KetidakSesuaian', res.data.data);
        } catch (error: any) {
            console.log(error);
        }
    }

    const [catatanHr, setcatatanHr] = useState<any>();

    async function approveTidakSesuai(id: any, index: any, p: number) {
        if (catatanHr == null) {
            alert('Catatan Wajib Diisi');
            return;
        }
        const url = `${import.meta.env.VITE_API_LINK}/hr/pengajuanLembur/tidakSesuai/respon/${id}`;
        try {
            setIsLoading(true)
            const res = await axios.put(url,
                {
                    alasan_ketidaksesuaian: catatanHr,
                    penanganan: p,
                    id_respon_ketidaksesuaian: idInspektor
                },
                {

                    withCredentials: true,
                });
            setIsLoading(false)
            getLKH();
            console.log(res.data);
            const updatedModalStates = [...showModal];
            updatedModalStates[index] = false;
            setShowModal(updatedModalStates);
        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
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
                            <label className="text-neutral-500 text-sm font-semibold col-span-3">
                                Lama Ketidaksesuaian
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                Department
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                Personnel
                            </label>
                        </div>

                    </div>
                    {lkh?.map(
                        (data: any, i: number) => {

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
                                        <div className='flex flex-col gap-1 col-span-3'>
                                            <label className="text-neutral-500 text-sm font-semibold ">
                                                Lama Lembur SPL  :{data.lama_lembur} Jam
                                            </label>
                                            <label className="text-neutral-500 text-sm font-semibold ">
                                                Lama Lembur Absen  :{data.lama_lembur_absen} Jam
                                            </label>
                                        </div>
                                        <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                            {data.karyawan_pengaju?.biodata_karyawan[0]?.department?.nama_department}
                                        </label>
                                        <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                            {data.karyawan?.name}
                                        </label>
                                        <div className="justify-end flex pr-2 ">
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
                                                            judul={' Permohonan Ketidaksesuaian SPL'}>
                                                            <>
                                                                <div className='grid grid-cols-2 gap-2 px-4 py-4'>
                                                                    <div className='flex flex-col gap-2 '>
                                                                        <div className='flex flex-col '>
                                                                            <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                PENGAJU
                                                                            </label>
                                                                            <label htmlFor="" className='text-[#7a7a7a] text-xl font-normal'>
                                                                                {data.karyawan_pengaju_ketidaksesuaian?.biodata_karyawan[0]?.nik} - {data.karyawan_pengaju_ketidaksesuaian?.name} - {data.karyawan_pengaju_ketidaksesuaian?.biodata_karyawan[0]?.department?.nama_department}
                                                                            </label>
                                                                        </div>
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
                                                                                {convertTimeStampToDate(data.createdAt)}
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
                                                                                LAMA LEMBUR SPL
                                                                            </label>
                                                                            <label htmlFor="" className='text-[#016ae6] text-xl font-normal'>
                                                                                {data.lama_lembur} JAM
                                                                            </label>
                                                                        </div>
                                                                        <div className='flex flex-col '>
                                                                            <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                LAMA LEMBUR ABSEN
                                                                            </label>
                                                                            <label htmlFor="" className='text-[#016ae6] text-xl font-normal'>
                                                                                {data.lama_lembur_absen} JAM
                                                                            </label>
                                                                        </div>
                                                                        <div className='flex flex-col '>
                                                                            <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                DARI
                                                                            </label>
                                                                            <label htmlFor="" className='text-[#016ae6] text-xl font-normal'>
                                                                                {convertTimeStampToDateTime(data.dari)}
                                                                            </label>
                                                                        </div>
                                                                        <div className='flex flex-col '>
                                                                            <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                SAMPAI
                                                                            </label>
                                                                            <label htmlFor="" className='text-[#016ae6] text-xl font-normal'>
                                                                                {convertTimeStampToDateTime(data.sampai)}
                                                                            </label>
                                                                        </div>
                                                                        <div className='flex flex-col '>
                                                                            <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                NO. JO
                                                                            </label>
                                                                            <label htmlFor="" className='text-[#016ae6] text-xl font-normal'>
                                                                                {data.jo_lembur}
                                                                            </label>
                                                                        </div>
                                                                        <div className='flex flex-col '>
                                                                            <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                CATATAN KETIDAKSESUAIAN
                                                                            </label>
                                                                            <label htmlFor="" className='text-[#016ae6] text-xl font-normal'>
                                                                                {data.catatan_ketidaksesuaian}
                                                                            </label>
                                                                        </div>
                                                                        <div className='flex flex-col '>
                                                                            <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                TIPE KETIDAKSESUAIAN
                                                                            </label>
                                                                            <label htmlFor="" className='text-[#016ae6] text-xl font-normal uppercase'>
                                                                                {data.type_ketidaksesuaian}
                                                                            </label>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className='flex flex-col w-full px-4'>
                                                                    <label htmlFor="" className='text-black text-xs font-bold'>
                                                                        ALASAN LEMBUR
                                                                    </label>
                                                                    <label htmlFor="" className='text-[#7a7a7a] text-xl font-normal'>
                                                                        {data.alasan_lembur}
                                                                    </label>
                                                                </div>
                                                                <div className='flex flex-col w-full px-4 '>
                                                                    <label htmlFor="" className='text-black text-xs font-bold'>
                                                                        ALASAN KETIDAKSESUAIAN <span className='text-red-600'>*</span>
                                                                    </label>
                                                                    <textarea
                                                                        onChange={(e) => setcatatanHr(e.target.value)}
                                                                        className="peer h-full min-h-[100px] w-full resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                                                                    ></textarea>
                                                                </div>
                                                                <div className='flex gap-2 w-full px-4 pt-1'>
                                                                    <button
                                                                        disabled={isLoading}
                                                                        onClick={() => approveTidakSesuai(data.id, i, 1)}
                                                                        className='bg-green-500 w-[50%] rounded-md px-3 py-3 text-white font-semibold text-sm'>
                                                                        APPROVE
                                                                    </button>
                                                                    {isLoading && <Loading />}
                                                                    <button
                                                                        disabled={isLoading}
                                                                        onClick={() => approveTidakSesuai(data.id, i, 0)}
                                                                        className='bg-red-500 w-[50%] rounded-md px-3 py-3 text-white font-semibold text-sm'>
                                                                        REJECT
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
                            );
                        },
                    )}
                </div>
            </main>
        </>

    )
}

export default OsKetidaksesuaianSPL