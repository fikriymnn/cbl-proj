import Pagination from '@mui/material/Pagination/Pagination';
import Stack from '@mui/material/Stack';
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import Loading from '../../../Loading';
import convertTimeStampToDate from '../../../../utils/convertDate';

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
                                            //onClick={() => openEdit(i)}
                                            className='px-2 py-1  text-xs bg-blue-400 items-center justify-center text-white font-semibold rounded-md flex w-full '>
                                            Detail
                                        </button>
                                    </div>
                                </div>
                            )
                        })
                    }

                </div>
            </div>
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
        </main>
    )
}

export default HistoryPayroll
