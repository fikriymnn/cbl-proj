import React, { useEffect, useState } from 'react'
import Production from '../../../../images/icon/production.svg';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import BarChartVertical from '../../../../pages/UiElements/BarChartVertical';
import axios from 'axios';


function RekapOs2Mtc() {
    const [dateFrom, setDateFrom] = useState<any>();
    const [dateTo, setDateTo] = useState<any>();

    const [dateFrom1, setDateFrom1] = useState<any>();
    const [dateTo1, setDateTo1] = useState<any>();

    const [dateFrom2, setDateFrom2] = useState<any>();
    const [dateTo2, setDateTo2] = useState<any>();

    const [defectOs2, setDefectOs2] = useState<any>();

    const [produksiDefect, setproduksiDefect] = useState<any>();
    const [qualityDefect, setqualityDefect] = useState<any>();

    useEffect(() => {


        getMesinProblem(null, null);
        getQuality(null, null);
        getProduksi(null, null);
    }, []);

    async function getMesinProblem(dateFrom1: any, dateTo1: any) {
        const url = `${import.meta.env.VITE_API_LINK}/reportMtc/mesinProblem`;
        try {
            const res = await axios.get(url, {
                params: {

                    start_date: dateFrom1,
                    end_date: dateTo1,

                },
                withCredentials: true,
            });

            setDefectOs2(res.data.data_jenis_masalah);
            console.log(res.data.data_jenis_masalah)

        } catch (error: any) {
            console.log(error);
        }
    }

    async function getQuality(dateFrom1: any, dateTo1: any) {
        const url = `${import.meta.env.VITE_API_LINK}/reportMtc/qualityDefect`;
        try {
            const res = await axios.get(url, {
                params: {

                    start_date: dateFrom1,
                    end_date: dateTo1,

                },
                withCredentials: true,
            });



            setqualityDefect(res.data.data)
            console.log(res.data.data)
        } catch (error: any) {
            console.log(error);
        }
    }
    async function getProduksi(dateFrom1: any, dateTo1: any) {
        const url = `${import.meta.env.VITE_API_LINK}/reportMtc/produksiDefect`;
        try {
            const res = await axios.get(url, {
                params: {

                    start_date: dateFrom1,
                    end_date: dateTo1,

                },
                withCredentials: true,
            });


            setproduksiDefect(res.data.data)
            console.log(res.data.data)
        } catch (error: any) {
            console.log(error);
        }
    }
    return (
        <div>
            <div className="bg-white rounded-md shadow-md md:w-12/12 mb-5 border-2">
                <div className="flex md:gap-4 gap-1 md:flex-row flex-col px-4 py-4 md:mt-0 ">
                    <p className="my-auto text-sm text-primary font-semibold">
                        Pilih Tanggal
                    </p>
                    <div className="flex md:justify-center items-center gap-2">
                        <p className="text-sm text-primary font-semibold md:w-3/12 w-2/12">
                            Dari:
                        </p>

                        <input
                            className='rounded-full bg-[#D8EAFF] px-2'
                            type="date"
                            onChange={(e) => setDateFrom(e.target.value)}
                        ></input>

                    </div>
                    <div className="flex md:justify-center items-center gap-2">
                        <p className=" my-auto text-sm text-primary font-semibold md:w-3/12 w-2/12">
                            Sampai:
                        </p>

                        <input
                            className='rounded-full bg-[#D8EAFF] px-2'
                            type="date"
                            onChange={(e) => setDateTo(e.target.value)}
                        ></input>

                    </div>
                    <div className="flex justify-center my-5">
                        <button
                            onClick={() => {
                                getMesinProblem(dateFrom, dateTo)
                            }}
                            className="bg-primary text-white px-5 py-2 rounded-md my-auto "
                        >
                            Tampilkan
                        </button>
                    </div>
                    <div className="flex justify-center my-5">
                        <button
                            onClick={() => {
                                getMesinProblem(null, null)

                            }}
                            className="bg-primary text-white px-5 py-2 rounded-md my-auto "
                        >
                            Reset
                        </button>
                    </div>
                </div>

                <div className="md:grid grid-cols-1 gap-5 px-10 pb-10 pt-5">
                    <div className="">
                        <div className="flex gap-3 p-3">
                            <img src={Production} alt="Logo" />

                            <p className="text-xl font-semibold text-[#0065DE]">Defect Mesin</p>
                        </div>
                        <BarChartVertical value={defectOs2?.jenis_masalah} />
                    </div>
                    <div className='flex flex-col'>
                        <div className='grid grid-cols-11 border-2 border-black px-1 justify-center gap-4 bg-slate-300'>
                            <label className='text-sm font-semibold'>
                                No
                            </label>
                            <label className='text-sm font-semibold col-span-2'>
                                Mesin
                            </label>
                            <label className='text-sm font-semibold col-span-2'>
                                Total Case
                            </label>
                            <label className='text-sm font-semibold col-span-2'>
                                Production Case
                            </label>
                            <label className='text-sm font-semibold col-span-2'>
                                Quality Case
                            </label>
                            <label className='text-sm font-semibold col-span-2'>
                                Pending
                            </label>
                        </div>
                        {defectOs2?.jenis_masalah.map((data: any, i: any) => {
                            return (
                                <>
                                    <div className='grid grid-cols-11 border-x-2 py-1 px-2  border-b-2 border-black  justify-center gap-4'>
                                        <label className='text-sm '>
                                            {i + 1}
                                        </label>
                                        <label className='text-sm col-span-2'>
                                            {data.mesin}
                                        </label>
                                        <label className='text-sm col-span-2'>
                                            {data.count}
                                        </label>
                                        <label className='text-sm col-span-2'>
                                            {data.jenis_produksi}
                                        </label>
                                        <label className='text-sm col-span-2'>
                                            {data.jenis_quality}
                                        </label>
                                        <label className='text-sm col-span-2'>

                                        </label>
                                    </div>
                                </>
                            )
                        })}
                        <div className='grid grid-cols-11 border-2 border-black px-1 justify-center gap-4 bg-slate-300'>
                            <label className='text-sm font-bold col-span-3'>
                                TOTAL
                            </label>
                            <label className='text-sm font-semibold col-span-2'>
                                {defectOs2?.total_count}
                            </label>
                            <label className='text-sm font-semibold col-span-2'>
                                {defectOs2?.total_produksi}
                            </label>
                            <label className='text-sm font-semibold col-span-2'>
                                {defectOs2?.total_quality}
                            </label>

                        </div>

                    </div>

                </div>

            </div>
            <div className="bg-white rounded-md shadow-md md:w-12/12 mb-5 border-2">
                <div className="flex md:gap-4 gap-1 md:flex-row flex-col px-4 py-4 md:mt-0 ">
                    <p className="my-auto text-sm text-primary font-semibold">
                        Pilih Tanggal
                    </p>
                    <div className="flex md:justify-center items-center gap-2">
                        <p className="text-sm text-primary font-semibold md:w-3/12 w-2/12">
                            Dari:
                        </p>

                        <input
                            className='rounded-full bg-[#D8EAFF] px-2'
                            type="date"
                            onChange={(e) => setDateFrom1(e.target.value)}
                        ></input>

                    </div>
                    <div className="flex md:justify-center items-center gap-2">
                        <p className=" my-auto text-sm text-primary font-semibold md:w-3/12 w-2/12">
                            Sampai:
                        </p>

                        <input
                            className='rounded-full bg-[#D8EAFF] px-2'
                            type="date"
                            onChange={(e) => setDateTo1(e.target.value)}
                        ></input>

                    </div>
                    <div className="flex justify-center my-5">
                        <button
                            onClick={() => {


                                getQuality(dateFrom1, dateTo1)
                            }}
                            className="bg-primary text-white px-5 py-2 rounded-md my-auto "
                        >
                            Tampilkan
                        </button>
                    </div>
                    <div className="flex justify-center my-5">
                        <button
                            onClick={() => {
                                getQuality(null, null)

                            }}
                            className="bg-primary text-white px-5 py-2 rounded-md my-auto "
                        >
                            Reset
                        </button>
                    </div>
                </div>

                <div className="md:grid grid-cols-1 gap-5 px-10 pb-10 pt-5">
                    <div className="">
                        <div className="flex gap-3 p-3">
                            <img src={Production} alt="Logo" />

                            <p className="text-xl font-semibold text-[#0065DE]">Quality Defect</p>
                        </div>
                        <BarChartVertical value={qualityDefect?.quality_defect} />
                    </div>
                    <div className='flex flex-col'>
                        <div className='grid grid-cols-11 border-2 border-black px-1 justify-center gap-4 bg-slate-300'>
                            <label className='text-sm font-semibold'>
                                No
                            </label>
                            <label className='text-sm font-semibold col-span-2'>
                                Kode Analisis
                            </label>
                            <label className='text-sm font-semibold col-span-4'>
                                Nama Analisis
                            </label>
                            <label className='text-sm font-semibold col-span-2'>
                                Total Case
                            </label>

                        </div>
                        {qualityDefect?.quality_defect.map((data: any, i: any) => {
                            return (
                                <>
                                    <div className='grid grid-cols-11 border-x-2 py-1 px-2  border-b-2 border-black  justify-center gap-4'>
                                        <label className='text-sm '>
                                            {i + 1}
                                        </label>
                                        <label className='text-sm col-span-2'>
                                            {data.kode_analisis_mtc}
                                        </label>

                                        <label className='text-sm col-span-4'>
                                            {data.nama_analisis_mtc}
                                        </label>
                                        <label className='text-sm col-span-2'>
                                            {data.count}
                                        </label>

                                    </div>
                                </>
                            )
                        })}

                        <div className='grid grid-cols-11 border-2 border-black px-1 justify-center gap-4 bg-slate-300'>
                            <label className='text-sm font-bold col-span-7'>
                                TOTAL
                            </label>

                            <label className='text-sm font-semibold col-span-2'>
                                {qualityDefect?.total_count}
                            </label>

                        </div>
                    </div>

                </div>

            </div>
            <div className="bg-white rounded-md shadow-md md:w-12/12 mb-5 border-2">
                <div className="flex md:gap-4 gap-1 md:flex-row flex-col px-4 py-4 md:mt-0 ">
                    <p className="my-auto text-sm text-primary font-semibold">
                        Pilih Tanggal
                    </p>
                    <div className="flex md:justify-center items-center gap-2">
                        <p className="text-sm text-primary font-semibold md:w-3/12 w-2/12">
                            Dari:
                        </p>

                        <input
                            className='rounded-full bg-[#D8EAFF] px-2'
                            type="date"
                            onChange={(e) => setDateFrom2(e.target.value)}
                        ></input>

                    </div>
                    <div className="flex md:justify-center items-center gap-2">
                        <p className=" my-auto text-sm text-primary font-semibold md:w-3/12 w-2/12">
                            Sampai:
                        </p>

                        <input
                            className='rounded-full bg-[#D8EAFF] px-2'
                            type="date"
                            onChange={(e) => setDateTo2(e.target.value)}
                        ></input>

                    </div>
                    <div className="flex justify-center my-5">
                        <button
                            onClick={() => {

                                getProduksi(dateFrom2, dateTo2)
                            }}
                            className="bg-primary text-white px-5 py-2 rounded-md my-auto "
                        >
                            Tampilkan
                        </button>
                    </div>
                    <div className="flex justify-center my-5">
                        <button
                            onClick={() => {
                                getProduksi(null, null)

                            }}
                            className="bg-primary text-white px-5 py-2 rounded-md my-auto "
                        >
                            Reset
                        </button>
                    </div>
                </div>

                <div className="md:grid grid-cols-1 gap-5 px-10 pb-10 pt-5">
                    <div className="">
                        <div className="flex gap-3 p-3">
                            <img src={Production} alt="Logo" />

                            <p className="text-xl font-semibold text-[#0065DE]">Production Defect</p>
                        </div>
                        <BarChartVertical value={produksiDefect?.produksi_defect} />
                    </div>
                    <div className='flex flex-col'>
                        <div className='grid grid-cols-11 border-2 border-black px-1 justify-center gap-4 bg-slate-300'>
                            <label className='text-sm font-semibold'>
                                No
                            </label>
                            <label className='text-sm font-semibold col-span-2'>
                                Kode Analisis
                            </label>
                            <label className='text-sm font-semibold col-span-4'>
                                Nama Analisis
                            </label>
                            <label className='text-sm font-semibold col-span-2'>
                                Total Case
                            </label>

                        </div>
                        {produksiDefect?.produksi_defect?.map((data: any, i: any) => {
                            return (
                                <>
                                    <div className='grid grid-cols-11 border-x-2 py-1 px-2  border-b-2 border-black  justify-center gap-4'>
                                        <label className='text-sm '>
                                            {i + 1}
                                        </label>
                                        <label className='text-sm col-span-2'>
                                            {data.kode_analisis_mtc}
                                        </label>

                                        <label className='text-sm col-span-4'>
                                            {data.nama_analisis_mtc}
                                        </label>
                                        <label className='text-sm col-span-2'>
                                            {data.count}
                                        </label>

                                    </div>
                                </>
                            )
                        })}

                        <div className='grid grid-cols-11 border-2 border-black px-1 justify-center gap-4 bg-slate-300'>
                            <label className='text-sm font-bold col-span-7'>
                                TOTAL
                            </label>

                            <label className='text-sm font-semibold col-span-2'>
                                {produksiDefect?.total_count}
                            </label>

                        </div>
                    </div>

                </div>

            </div>
        </div>
    )
}

export default RekapOs2Mtc