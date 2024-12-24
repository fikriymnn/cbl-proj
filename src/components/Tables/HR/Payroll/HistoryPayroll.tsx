import Pagination from '@mui/material/Pagination/Pagination';
import Stack from '@mui/material/Stack';
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import Loading from '../../../Loading';
import convertTimeStampToDate from '../../../../utils/convertDate';
import ModalKosongan from '../../../Modals/Qc/NCR/NCRResponQC';
import formatInteger from '../../../../utils/formaterInteger';

function HistoryPayroll() {
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [payWeek, setPayWeek] = useState<any>();

    useEffect(() => {

        getPayroll()
    }, [page]);

    async function getPayroll() {
        const url = `${import.meta.env.VITE_API_LINK
            }/hr/payroll/bayarMingguan`;
        try {

            const res = await axios.get(
                url,

                {
                    params: {
                        page: page,
                        limit: 10,
                    },
                    withCredentials: true,
                },
            );
            setPayWeek(res.data)
            console.log(res.data)
        } catch (error: any) {

            console.log(error);
        }
    }
    const [showEdit, setShowEdit] = useState<any>([]);
    const openEdit = (i: any) => {
        const onchangeVal: any = [...showEdit];
        onchangeVal[i] = true;

        setShowEdit(onchangeVal);
    };
    const closeEdit = (i: any) => {
        const onchangeVal: any = [...showEdit];
        onchangeVal[i] = false;

        setShowEdit(onchangeVal);
    };
    return (
        <main className="overflow-x-scroll">
            {isLoading && <Loading />}
            <div className='min-w-[700px] bg-white rounded-xl'>
                <div className=" w-full h-full flex-col border-b-8 border-[#D8EAFF]">
                    <div className='grid grid-cols-7 gap-4 px-3 py-4 border-b-8 border-[#D8EAFF] '>
                        <div className='flex gap-3'>
                            <label className="text-black text-xs font-bold">
                                No
                            </label>
                            <label className="text-neutral-500 text-xs font-semibold ">
                                NIK
                            </label>
                        </div>
                        <label className="text-neutral-500 text-xs font-semibold ] ">
                            Nama
                        </label>

                        <label className="text-neutral-500 text-xs font-semibold  ">
                            Department
                        </label>
                        <label className="text-neutral-500 text-xs font-semibold  ">
                            Periode Dari
                        </label>
                        <label className="text-neutral-500 text-xs font-semibold  ">
                            Periode Sampai
                        </label>
                        <label className="text-neutral-500 text-xs font-semibold ">
                            Total Upah
                        </label>
                        <div className='flex justify-center '>

                        </div>
                    </div>

                    {
                        payWeek?.data.map((data: any, i: number) => {
                            return (
                                <div className='grid grid-cols-7 gap-4 px-3 py-4 border-b-8 border-[#D8EAFF] '>
                                    <div className='flex gap-3'>
                                        <label className="text-black text-xs font-bold">
                                            {i + 1}
                                        </label>
                                        <label className="text-neutral-500 text-xs font-semibold ">
                                            {data.karyawan.biodata_karyawan[0]?.nik}
                                        </label>
                                    </div>
                                    <label className="text-neutral-500 text-xs font-semibold ] ">
                                        {data.karyawan.name}
                                    </label>

                                    <label className="text-neutral-500 text-xs font-semibold  ">
                                        {data.karyawan.biodata_karyawan[0]?.department?.nama_department}
                                    </label>
                                    <label className="text-neutral-500 text-xs font-semibold  ">
                                        {convertTimeStampToDate(data.periode_dari)}
                                    </label>
                                    <label className="text-neutral-500 text-xs font-semibold  ">
                                        {convertTimeStampToDate(data.periode_sampai)}
                                    </label>
                                    <label className="text-neutral-500 text-xs font-semibold ">
                                        {data.total_upah}
                                    </label>
                                    <div className='flex justify-center '>
                                        <button
                                            onClick={() => openEdit(i)}
                                            className='px-2 py-1  text-xs bg-blue-400 items-center justify-center text-white font-semibold rounded-md flex w-full '>
                                            Detail
                                        </button>
                                        {showEdit[i] == true && (

                                            <ModalKosongan
                                                isOpen={showEdit[i]}
                                                onClose={() => closeEdit(i)}
                                                judul={'Rincihan Payroll'}
                                            >
                                                <>
                                                    <div className='grid grid-cols-2 gap-2 px-4 py-4'>
                                                        <div className='flex flex-col  '>
                                                            <label htmlFor="" className='text-black text-xs font-bold'>
                                                                Tipe Penggajian
                                                            </label>
                                                            <label htmlFor="" className='text-[#016ae6] uppercase text-xl font-normal'>
                                                                {data.tipe_penggajian}
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
                                                                    NIK
                                                                </label>
                                                                <label htmlFor="" className='text-[#7a7a7a] text-xl font-normal'>
                                                                    {data.karyawan.biodata_karyawan[0]?.nik}
                                                                </label>
                                                            </div>
                                                            <div className='flex flex-col '>
                                                                <label htmlFor="" className='text-black text-xs font-bold'>
                                                                    DEPARTEMEN
                                                                </label>
                                                                <label htmlFor="" className='text-[#7a7a7a] text-xl font-normal'>
                                                                    {data.karyawan?.biodata_karyawan[0]?.department?.nama_department}
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

                                                        </div>
                                                        <div className='flex flex-col gap-2'>
                                                            <div className='flex flex-col'>
                                                                <label htmlFor="" className='text-black text-xs font-bold'>
                                                                    PERIODE
                                                                </label>
                                                                <label htmlFor="" className='text-[#7a7a7a] text-xl font-normal'>
                                                                    {convertTimeStampToDate(data.periode_dari)}
                                                                </label>
                                                                <label htmlFor="" className='text-[#7a7a7a] text-xl font-normal'>
                                                                    ~ {convertTimeStampToDate(data.periode_sampai)}
                                                                </label>
                                                            </div>
                                                            <div className='flex flex-col'>

                                                                <label htmlFor="" className='text-black text-xs font-bold'>
                                                                    TOTAL POTONGAN
                                                                </label>
                                                                <label htmlFor="" className='text-[#7a7a7a] text-xl font-normal'>
                                                                    Rp. {formatInteger(data.total_potongan)}
                                                                </label>
                                                            </div>
                                                            <div className='flex flex-col'>
                                                                <label htmlFor="" className='text-black text-xs font-bold'>
                                                                    INSENTIF
                                                                </label>
                                                                <label htmlFor="" className='text-[#7a7a7a] text-xl font-normal'>
                                                                    Rp. {formatInteger(data.insentif)}
                                                                </label>
                                                            </div>
                                                            <div className='flex flex-col'>

                                                                <label htmlFor="" className='text-black text-xs font-bold'>
                                                                    TOTAL UPAH
                                                                </label>
                                                                <label htmlFor="" className='text-[#7a7a7a] text-xl font-normal'>
                                                                    Rp. {formatInteger(data.total_upah)}
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>




                                                </>

                                            </ModalKosongan>

                                        )
                                        }
                                    </div>
                                </div>
                            )
                        })
                    }

                </div>
            </div >
            <div className="w-full flex justify-center mt-5 ">
                <Stack spacing={2}>
                    <Pagination
                        count={payWeek?.total_page}
                        color="primary"
                        onChange={(e, i) => {
                            setPage(i);
                            console.log(i);
                        }}
                    />
                </Stack>
            </div>
        </main >
    )
}

export default HistoryPayroll
