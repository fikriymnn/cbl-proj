import React, { useEffect, useState } from 'react'
import Production from '../../../../images/icon/production.svg';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import BarChartVertical from '../../../../pages/UiElements/BarChartVertical';
import axios from 'axios';
import BarChartResponTime from '../../../../pages/UiElements/BarchartResponTime';
import BarChartResponMonth from '../../../../pages/UiElements/BarchartResponMonth';
import convertTimeStampToDate from '../../../../utils/convertDate';
import BarChartProductionQuality from '../../../../pages/UiElements/BarchartProductionQuality';
import BarChartMesinOnly from '../../../../pages/UiElements/BarchartMesinOnly';
import ModalKosonganSmall from '../../../Modals/ModalKosonganSmall';
import ModalKosongan from '../../../Modals/Qc/NCR/NCRResponQC';
import ModalXL from '../../PPIC/JadwalProduksi/ModalXL';

function RekapOs2Mtc() {
    const [bulan, setBulan] = useState(0);
    const [tahun, setTahun] = useState(0);

    const [bulan1, setBulan1] = useState<any>();
    const [tahun1, setTahun1] = useState<any>();

    const [bulan2, setBulan2] = useState<any>();
    const [tahun2, setTahun2] = useState<any>();

    const [dateFrom, setDateFrom] = useState<any>();
    const [dateTo, setDateTo] = useState<any>();

    const [dateFrom1, setDateFrom1] = useState<any>();
    const [dateTo1, setDateTo1] = useState<any>();

    const [dateFrom2, setDateFrom2] = useState<any>();
    const [dateTo2, setDateTo2] = useState<any>();

    const [dateFrom3, setDateFrom3] = useState<any>();
    const [dateTo3, setDateTo3] = useState<any>();

    const [dateFrom4, setDateFrom4] = useState<any>();
    const [dateTo4, setDateTo4] = useState<any>();

    const [dateFrom5, setDateFrom5] = useState<any>();
    const [dateTo5, setDateTo5] = useState<any>();

    const [defectOs2, setDefectOs2] = useState<any>();

    const [produksiDefect, setproduksiDefect] = useState<any>();
    const [qualityDefect, setqualityDefect] = useState<any>();

    useEffect(() => {

        const today = new Date();
        setBulan(today.getMonth() + 1); // Ditambah 1 karena index bulan dimulai dari 0
        setTahun(today.getFullYear());

        getResponTime(tahun, bulan)
        getMesinProblem(null, null);
        getQuality(null, null);
        getProduksi(null, null);
        getResponTimeBulan(null, null)
        getMesin()
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
            console.log('Jenis Masalah', res.data.data_jenis_masalah)

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
            console.log('Quality', res.data.data)
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
            console.log('Production', res.data.data)
        } catch (error: any) {
            console.log(error);
        }
    }

    const [responTime, setresponTime] = useState<any>();

    async function getResponTime(tahun: any, bulan: any) {
        const url = `${import.meta.env.VITE_API_LINK}/reportMtc/responTimeMinggu`;
        try {
            const res = await axios.get(url, {
                params: {

                    tahun: tahun,
                    bulan: bulan,

                },
                withCredentials: true,
            });


            setresponTime(res.data.data)
            console.log('Respon Time', res.data.data)
        } catch (error: any) {
            console.log(error);
        }
    }

    const [responTimeBulan, setresponTimeBulan] = useState<any>();

    async function getResponTimeBulan(fromdate: any, todate: any) {
        const url = `${import.meta.env.VITE_API_LINK}/reportMtc/responTime`;
        try {
            const res = await axios.get(url, {
                params: {

                    fromDate: fromdate,
                    toDate: todate,

                },
                withCredentials: true,
            });


            setresponTimeBulan(res.data)
            console.log('Respon Time Bulan', res.data)
        } catch (error: any) {
            console.log(error);
        }
    }

    const [oneMesin, setoneMesin] = useState<any>();
    const [mesinSelect, setmesinSelect] = useState<any>();

    async function getOneMesin(fromdate: any, todate: any, namaMesin: any) {
        const url = `${import.meta.env.VITE_API_LINK}/reportMtc/oneMesinProblem`;
        try {
            const res = await axios.get(url, {
                params: {

                    start_date: fromdate,
                    end_date: todate,
                    mesin_name: namaMesin

                },
                withCredentials: true,
            });


            setoneMesin(res.data)
            console.log('Mesin Filter', res.data)
        } catch (error: any) {
            console.log(error);
        }
    }
    const [allMesin, setallMesin] = useState<any>();

    async function getMesin() {
        const url = `${import.meta.env.VITE_API_LINK}/reportMtc/mesinTicket`;
        try {
            const res = await axios.get(url, {

                withCredentials: true,
            });


            setallMesin(res.data)
            console.log('All Mesin', res.data)
        } catch (error: any) {
            console.log(error);
        }
    }

    const [breakDown, setbreakDown] = useState<any>();

    async function getbreakDown(tahun: any, bulan: any) {
        const url = `${import.meta.env.VITE_API_LINK}/reportMtc/breakdownTimeMinggu`;
        try {
            const res = await axios.get(url, {
                params: {

                    tahun: tahun,
                    bulan: bulan,

                },
                withCredentials: true,
            });


            setbreakDown(res.data.data)
            console.log('BreakDown Time', res.data.data)
        } catch (error: any) {
            console.log(error);
        }
    }
    const [breakDownMonth, setbreakDownMonth] = useState<any>();

    async function getBreakDownMont(fromdate: any, todate: any) {
        const url = `${import.meta.env.VITE_API_LINK}/reportMtc/breakdownTime`;
        try {
            const res = await axios.get(url, {
                params: {

                    fromDate: fromdate,
                    toDate: todate,

                },
                withCredentials: true,
            });


            setbreakDownMonth(res.data)
            console.log('Respon Time Bulan', res.data)
        } catch (error: any) {
            console.log(error);
        }
    }
    // Initialize as a 2D array
    const initializeModalState = () => {
        const initialState: any = [];
        if (breakDownMonth?.data) {
            for (let i = 0; i < breakDownMonth.data.length; i++) {
                initialState[i] = [];
                if (breakDownMonth.data[i]?.data) {
                    for (let k = 0; k < breakDownMonth.data[i].data.length; k++) {
                        initialState[i][k] = false;
                    }
                }
            }
        }
        return initialState;
    };

    const [showModal1, setShowModal1] = useState<any>(initializeModalState());

    const openModal1 = (i: any, k: any) => {


        const newModalState = JSON.parse(JSON.stringify(showModal1)); // Deep clone to avoid reference issues

        // Make sure the arrays are initialized
        if (!newModalState[i]) {
            newModalState[i] = [];
        }

        newModalState[i][k] = true;

        setShowModal1(newModalState);
    };

    const closeModal1 = (i: any, k: any) => {


        const newModalState = JSON.parse(JSON.stringify(showModal1)); // Deep clone

        if (newModalState[i]) {
            newModalState[i][k] = false;
            setShowModal1(newModalState);
        }
    };
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
                            onChange={(e) => setDateFrom4(e.target.value)}
                        ></input>

                    </div>
                    <div className="flex md:justify-center items-center gap-2">
                        <p className=" my-auto text-sm text-primary font-semibold md:w-3/12 w-2/12">
                            Sampai:
                        </p>

                        <input
                            className='rounded-full bg-[#D8EAFF] px-2'
                            type="date"
                            onChange={(e) => setDateTo4(e.target.value)}
                        ></input>

                    </div>
                    <div className="relative flex w-full items-center">
                        <select
                            onChange={(e) => {
                                setmesinSelect(
                                    e.target.value,
                                );

                            }}
                            className={` z-20 w-[40%]  rounded-md bg-blue-200 items-center h-8`}
                        >
                            <option
                                selected
                                disabled>
                                Pilih Mesin
                            </option>
                            {allMesin?.map(
                                (data: any, i: number) => {
                                    return (
                                        <option
                                            value={data.mesin}
                                            className="text-gray-800 text-sm font-light dark:text-bodydark"
                                        >
                                            {data.mesin}
                                        </option>
                                    );
                                },
                            )}
                        </select>

                    </div>
                    <div className="flex justify-center my-5">
                        <button
                            onClick={() => {
                                console.log(dateFrom4, dateTo4, mesinSelect)
                                getOneMesin(dateFrom4, dateTo4, mesinSelect)
                            }}
                            className="bg-primary text-white px-5 py-2 rounded-md my-auto "
                        >
                            Tampilkan
                        </button>
                    </div>

                </div>

                <div className="md:grid grid-cols-1 gap-5 px-10 pb-10 ">
                    <div className="">
                        <div className="flex gap-3 p-3">
                            <img src={Production} alt="Logo" />

                            <p className="text-xl font-semibold text-[#0065DE]"> Mesin : {oneMesin?.data_jenis_masalah?.jenis_masalah[0]?.mesin}</p>
                        </div>
                        <BarChartMesinOnly value={oneMesin?.data_jenis_masalah} />
                    </div>
                    <div className='flex flex-col '>
                        <p className="text-xl font-semibold text-black"> Mesin : {oneMesin?.data_jenis_masalah?.jenis_masalah[0]?.mesin}</p>
                        <div className='grid grid-cols-2 gap-3'>
                            <div>

                                <div className='grid grid-cols-12 border-x-2 bg-slate-300 border-2 border-black px-1 justify-center gap-4 '>

                                    <label className='text-sm col-span-2 font-semibold'>
                                        Kode
                                    </label>
                                    <label className='text-sm col-span-8 font-semibold'>
                                        Nama Analisis
                                    </label>
                                    <label className='text-sm col-span-2 font-semibold'>
                                        Jumlah
                                    </label>
                                </div>

                            </div>
                            <div>

                                <div className='grid grid-cols-12 border-x-2  border-2 border-black px-1 justify-center gap-4 bg-slate-300'>

                                    <label className='text-sm col-span-2 font-semibold'>
                                        Kode
                                    </label>
                                    <label className='text-sm col-span-8 font-semibold'>
                                        Nama Analisis
                                    </label>
                                    <label className='text-sm col-span-2 font-semibold'>
                                        Jumlah
                                    </label>
                                </div>

                            </div>
                        </div>
                        <div className='grid grid-cols-2 gap-3'>
                            <div>
                                {oneMesin?.data_jenis_masalah?.kode_produksi?.map((data: any, i: any) => {
                                    return (
                                        <>
                                            <div className='grid grid-cols-12 border-x-2 border-b-2 border-black px-1 justify-center gap-4 bg-white'>

                                                <label className='text-sm col-span-2 font-semibold'>
                                                    {data.kode_analisis_mtc}
                                                </label>
                                                <label className='text-sm col-span-8 font-semibold'>
                                                    {data.nama_analisis_mtc}
                                                </label>
                                                <label className='text-sm col-span-2 font-semibold'>
                                                    {data.count}
                                                </label>
                                            </div>
                                        </>
                                    )
                                })}
                                <div className='grid grid-cols-12 border-2 border-black px-1 justify-center items-center gap-4 bg-slate-300'>

                                    <label className='text-sm col-span-10 font-semibold'>
                                        Total Produksi
                                    </label>

                                    <label className='text-sm col-span-2 font-semibold'>
                                        {oneMesin?.data_jenis_masalah?.total_produksi}
                                    </label>

                                </div>
                            </div>
                            <div>
                                {oneMesin?.data_jenis_masalah?.kode_quality?.map((data: any, i: any) => {
                                    return (
                                        <>
                                            <div className='grid grid-cols-12 border-x-2 border-b-2 border-black px-1 justify-center gap-4 bg-white'>

                                                <label className='text-sm col-span-2 font-semibold'>
                                                    {data.kode_analisis_mtc}
                                                </label>
                                                <label className='text-sm col-span-8 font-semibold'>
                                                    {data.nama_analisis_mtc}
                                                </label>
                                                <label className='text-sm col-span-2 font-semibold'>
                                                    {data.count}
                                                </label>
                                            </div>
                                        </>
                                    )
                                })}
                                <div className='grid grid-cols-12 border-2 border-black px-1 justify-center items-center gap-4 bg-slate-300'>

                                    <label className='text-sm col-span-10 font-semibold'>
                                        Total Quality
                                    </label>

                                    <label className='text-sm col-span-2 font-semibold'>
                                        {oneMesin?.data_jenis_masalah?.total_quality}
                                    </label>

                                </div>
                            </div>
                        </div>



                    </div >

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
                        <BarChartProductionQuality value={qualityDefect?.quality_defect} />
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
                        <BarChartProductionQuality value={produksiDefect?.produksi_defect} />
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
            <div className="bg-white rounded-md shadow-md md:w-12/12 mb-5 border-2">
                <div className="grid md:gap-4 gap-4 md:flex-row grid-cols-10 px-4 py-4 md:mt-0 ">
                    <p className="my-auto text-sm text-primary font-semibold col-span-2">
                        Pilih Bulan Dan Tahun
                    </p>
                    <div className="flex  items-center gap-2 col-span-2">
                        <p className="text-sm text-primary font-semibold ">
                            Bulan:
                        </p>

                        <select
                            className='rounded-full w-full bg-[#D8EAFF] px-2'

                            onChange={(e) => setBulan1(e.target.value)}
                        >
                            <option selected disabled> Pilih Bulan</option>
                            <option value={1} >Januari</option>
                            <option value={2} >Februari</option>
                            <option value={3} >Maret</option>
                            <option value={4} >April</option>
                            <option value={5} >Mei</option>
                            <option value={6} >Juni</option>
                            <option value={7} >Juli</option>
                            <option value={8} >Agustus</option>
                            <option value={9} >September</option>
                            <option value={10} >Oktober</option>
                            <option value={11} >November</option>
                            <option value={12} >Desember</option>

                        </select>

                    </div>
                    <div className="flex  items-center gap-2 col-span-2">
                        <p className=" my-auto text-sm text-primary font-semibold ">
                            Tahun:
                        </p>

                        <input
                            className='rounded-full bg-[#D8EAFF] px-2'
                            placeholder='Isi Dengan Angka Tahun'
                            type="number"
                            onChange={(e) => setTahun1(e.target.value)}
                        ></input>

                    </div>
                    <div className='flex col-span-4 gap-3 justify-end'>
                        <div className="flex justify-center col-span-2">
                            <button
                                onClick={() => {

                                    getResponTime(tahun1, bulan1)
                                }}
                                className="bg-primary text-white px-5 py-2 rounded-md my-auto "
                            >
                                Tampilkan
                            </button>
                        </div>
                        <div className="flex justify-center  col-span-2">
                            <button
                                onClick={() => {
                                    getResponTime(tahun, bulan)

                                }}
                                className="bg-primary text-white px-5 py-2 rounded-md my-auto "
                            >
                                Bulan Ini
                            </button>
                        </div>

                    </div>

                </div>

                <div className="md:grid grid-cols-1 gap-5 px-10 pb-10 pt-5">

                    <div className="">
                        <div className="flex gap-3 p-3">
                            <img src={Production} alt="Logo" />

                            <p className="text-xl font-semibold text-[#0065DE]">Respon Time Weekly</p>
                        </div>
                        <BarChartResponTime value={responTime} />
                    </div>
                    <div className='flex flex-col'>
                        <div className='grid grid-cols-12 border-2 border-black px-1 justify-center gap-4 bg-slate-300'>
                            <label className='text-sm font-semibold'>
                                No
                            </label>
                            <label className='text-sm font-semibold col-span-2'>
                                Mesin
                            </label>
                            <label className='text-sm font-semibold'>
                                Minggu 1
                            </label>
                            <label className='text-sm font-semibold'>
                                Minggu 2
                            </label>
                            <label className='text-sm font-semibold'>
                                Minggu 3
                            </label>
                            <label className='text-sm font-semibold'>
                                Minggu 4
                            </label>
                            <label className='text-sm font-semibold'>
                                Minggu 5
                            </label>
                            <label className='text-sm font-semibold col-span-2'>
                                Total Waktu
                            </label>
                            <label className='text-sm font-semibold col-span-2'>
                                Rata-Rata Waktu
                            </label>

                        </div>
                        {responTime?.map((data: any, i: any) => {
                            return (
                                <>
                                    <div className='grid grid-cols-12 border-x-2 py-1 px-2  border-b-2 border-black  justify-center gap-4'>
                                        <label className='text-sm '>
                                            {i + 1}
                                        </label>
                                        <label className='text-sm col-span-2'>
                                            {data.mesin}
                                        </label>

                                        {data.minggu?.map((data2: any, i: any) => {
                                            return (
                                                <>
                                                    <label className='text-sm '>
                                                        {parseFloat(data2.jumlah_waktu_jam).toFixed(2)}
                                                    </label>
                                                </>
                                            )
                                        })}
                                        <label className='text-sm col-span-2 line-clamp-1'>
                                            {parseFloat(data.jumlah_waktu_jam).toFixed(2)}
                                        </label>
                                        <label className='text-sm col-span-2 line-clamp-1'>
                                            {parseFloat(data.rata_rata_waktu_jam).toFixed(2)}
                                        </label>

                                    </div >
                                </>
                            )
                        })}


                    </div >

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
                            onChange={(e) => setDateFrom3(e.target.value)}
                        ></input>

                    </div>
                    <div className="flex md:justify-center items-center gap-2">
                        <p className=" my-auto text-sm text-primary font-semibold md:w-3/12 w-2/12">
                            Sampai:
                        </p>

                        <input
                            className='rounded-full bg-[#D8EAFF] px-2'
                            type="date"
                            onChange={(e) => setDateTo3(e.target.value)}
                        ></input>

                    </div>
                    <div className="flex justify-center my-5">
                        <button
                            onClick={() => {
                                getResponTimeBulan(dateFrom3, dateTo3)
                            }}
                            className="bg-primary text-white px-5 py-2 rounded-md my-auto "
                        >
                            Tampilkan
                        </button>
                    </div>
                    <div className="flex justify-center my-5">
                        <button
                            onClick={() => {
                                getResponTimeBulan(null, null)

                            }}
                            className="bg-primary text-white px-5 py-2 rounded-md my-auto "
                        >
                            Reset
                        </button>
                    </div>
                </div>
                <div className='flex gap-10 w-full justify-center'>
                    <label className='text-xl text-blue-400 font-semibold'>
                        {convertTimeStampToDate(responTimeBulan?.queryDari)} ~  {convertTimeStampToDate(responTimeBulan?.querySampai)}
                    </label>
                </div>
                <div className="md:grid grid-cols-1 gap-5 px-10 pb-10 pt-5">

                    <div className="">
                        <div className="flex gap-3 p-3">
                            <img src={Production} alt="Logo" />

                            <p className="text-xl font-semibold text-[#0065DE]">Respon Time</p>
                        </div>
                        <BarChartResponMonth value={responTimeBulan} />
                    </div>
                    <div className='flex flex-col '>

                        {responTimeBulan?.data.map((data: any, i: any) => {
                            return (
                                <>
                                    <div className='flex  py-1 px-2   border-black  gap-4 pt-4'>
                                        <label className='text-sm font-semibold'>
                                            {i + 1}.
                                        </label>
                                        <label className='text-sm col-span-2 font-semibold'>
                                            {data.mesin}
                                        </label>
                                    </div>
                                    <div className='grid grid-cols-12 border-2 border-black px-1 justify-center gap-4 bg-slate-300'>

                                        {responTimeBulan?.listBulan?.map((data: any, i: any) => {
                                            return (
                                                <>
                                                    <label className='text-xs font-semibold '>
                                                        {data.nama_bulan}
                                                    </label>
                                                </>
                                            )
                                        })}
                                    </div>
                                    <div className='grid grid-cols-12 border-x-2 py-1 px-2  border-b-2 border-black  justify-center gap-4'>


                                        {data.data?.map((data2: any, i: any) => {
                                            return (
                                                <>
                                                    <label className='text-xs '>
                                                        {parseFloat(data2.jumlah_waktu_jam).toFixed(2)}
                                                    </label>
                                                </>
                                            )
                                        })}

                                    </div >
                                </>
                            )
                        })}


                    </div >

                </div>

            </div>
            <div className="bg-white rounded-md shadow-md md:w-12/12 mb-5 border-2">
                <div className="grid md:gap-4 gap-4 md:flex-row grid-cols-10 px-4 py-4 md:mt-0 ">
                    <p className="my-auto text-sm text-primary font-semibold col-span-2">
                        Pilih Bulan Dan Tahun
                    </p>
                    <div className="flex  items-center gap-2 col-span-2">
                        <p className="text-sm text-primary font-semibold ">
                            Bulan:
                        </p>

                        <select
                            className='rounded-full w-full bg-[#D8EAFF] px-2'

                            onChange={(e) => setBulan2(e.target.value)}
                        >
                            <option selected disabled> Pilih Bulan</option>
                            <option value={1} >Januari</option>
                            <option value={2} >Februari</option>
                            <option value={3} >Maret</option>
                            <option value={4} >April</option>
                            <option value={5} >Mei</option>
                            <option value={6} >Juni</option>
                            <option value={7} >Juli</option>
                            <option value={8} >Agustus</option>
                            <option value={9} >September</option>
                            <option value={10} >Oktober</option>
                            <option value={11} >November</option>
                            <option value={12} >Desember</option>

                        </select>

                    </div>
                    <div className="flex  items-center gap-2 col-span-2">
                        <p className=" my-auto text-sm text-primary font-semibold ">
                            Tahun:
                        </p>

                        <input
                            className='rounded-full bg-[#D8EAFF] px-2'
                            placeholder='Isi Dengan Angka Tahun'
                            type="number"
                            onChange={(e) => setTahun2(e.target.value)}
                        ></input>

                    </div>
                    <div className='flex col-span-4 gap-3 justify-end'>
                        <div className="flex justify-center col-span-2">
                            <button
                                onClick={() => {

                                    getbreakDown(tahun2, bulan2)
                                }}
                                className="bg-primary text-white px-5 py-2 rounded-md my-auto "
                            >
                                Tampilkan
                            </button>
                        </div>
                        <div className="flex justify-center  col-span-2">
                            <button
                                onClick={() => {
                                    getbreakDown(tahun, bulan)

                                }}
                                className="bg-primary text-white px-5 py-2 rounded-md my-auto "
                            >
                                Bulan Ini
                            </button>
                        </div>

                    </div>

                </div>

                <div className="md:grid grid-cols-1 gap-5 px-10 pb-10 pt-5">

                    <div className="">
                        <div className="flex gap-3 p-3">
                            <img src={Production} alt="Logo" />

                            <p className="text-xl font-semibold text-[#0065DE]">Breakdown Time Weekly</p>
                        </div>
                        <BarChartResponTime value={breakDown} />
                    </div>
                    <div className='flex flex-col'>
                        <div className='grid grid-cols-12 border-2 border-black px-1 justify-center gap-4 bg-slate-300'>
                            <label className='text-sm font-semibold'>
                                No
                            </label>
                            <label className='text-sm font-semibold col-span-2'>
                                Mesin
                            </label>
                            <label className='text-sm font-semibold'>
                                Minggu 1
                            </label>
                            <label className='text-sm font-semibold'>
                                Minggu 2
                            </label>
                            <label className='text-sm font-semibold'>
                                Minggu 3
                            </label>
                            <label className='text-sm font-semibold'>
                                Minggu 4
                            </label>
                            <label className='text-sm font-semibold'>
                                Minggu 5
                            </label>
                            <label className='text-sm font-semibold col-span-2'>
                                Total Waktu
                            </label>
                            <label className='text-sm font-semibold col-span-2'>
                                Rata-Rata Waktu
                            </label>

                        </div>
                        {breakDown?.map((data: any, i: any) => {
                            return (
                                <>
                                    <div className='grid grid-cols-12 border-x-2 py-1 px-2  border-b-2 border-black  justify-center gap-4'>
                                        <label className='text-sm '>
                                            {i + 1}
                                        </label>
                                        <label className='text-sm col-span-2'>
                                            {data.mesin}
                                        </label>

                                        {data.minggu?.map((data2: any, i: any) => {
                                            return (
                                                <>
                                                    <label className='text-sm '>
                                                        {parseFloat(data2.jumlah_waktu_jam).toFixed(2)}
                                                    </label>
                                                </>
                                            )
                                        })}
                                        <label className='text-sm col-span-2 line-clamp-1'>
                                            {parseFloat(data.jumlah_waktu_jam).toFixed(2)}
                                        </label>
                                        <label className='text-sm col-span-2 line-clamp-1'>
                                            {parseFloat(data.rata_rata_waktu_jam).toFixed(2)}
                                        </label>

                                    </div >
                                </>
                            )
                        })}


                    </div >

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
                            onChange={(e) => setDateFrom5(e.target.value)}
                        ></input>

                    </div>
                    <div className="flex md:justify-center items-center gap-2">
                        <p className=" my-auto text-sm text-primary font-semibold md:w-3/12 w-2/12">
                            Sampai:
                        </p>

                        <input
                            className='rounded-full bg-[#D8EAFF] px-2'
                            type="date"
                            onChange={(e) => setDateTo5(e.target.value)}
                        ></input>

                    </div>
                    <div className="flex justify-center my-5">
                        <button
                            onClick={() => {
                                getBreakDownMont(dateFrom5, dateTo5)
                            }}
                            className="bg-primary text-white px-5 py-2 rounded-md my-auto "
                        >
                            Tampilkan
                        </button>
                    </div>
                    <div className="flex justify-center my-5">
                        <button
                            onClick={() => {
                                getBreakDownMont(null, null)

                            }}
                            className="bg-primary text-white px-5 py-2 rounded-md my-auto "
                        >
                            Reset
                        </button>
                    </div>
                </div>
                <div className='flex gap-10 w-full justify-center'>
                    <label className='text-xl text-blue-400 font-semibold'>
                        {convertTimeStampToDate(breakDownMonth?.queryDari)} ~  {convertTimeStampToDate(breakDownMonth?.querySampai)}
                    </label>
                </div>
                <div className="md:grid grid-cols-1 gap-5 px-10 pb-10 pt-5">

                    <div className="">
                        <div className="flex gap-3 p-3">
                            <img src={Production} alt="Logo" />

                            <p className="text-xl font-semibold text-[#0065DE]">Breakdown Time</p>
                        </div>
                        <BarChartResponMonth value={breakDownMonth} />
                    </div>
                    <div className='flex flex-col '>

                        {breakDownMonth?.data.map((data: any, i: any) => {
                            return (
                                <>
                                    <div className='flex  py-1 px-2   border-black  gap-4 pt-4'>
                                        <label className='text-sm font-semibold'>
                                            {i + 1}.
                                        </label>
                                        <label className='text-sm col-span-2 font-semibold'>
                                            {data.mesin}
                                        </label>
                                    </div>
                                    <div className='grid grid-cols-12 border-2 border-black px-1 justify-center gap-4 bg-slate-300'>

                                        {breakDownMonth?.listBulan?.map((data: any, i: any) => {
                                            return (
                                                <>
                                                    <label className='text-xs font-semibold '>
                                                        {data.nama_bulan}
                                                    </label>
                                                </>
                                            )
                                        })}
                                    </div>
                                    <div className='grid grid-cols-12 border-x-2 py-1 px-2  border-b-2 border-black  justify-center gap-4'>


                                        {data.data?.map((data2: any, k: any) => {
                                            // Debug log to check this specific iteration

                                            return (
                                                <div key={`value-${i}-${k}`}>
                                                    <button
                                                        className="text-xs text-blue-500 hover:underline"
                                                        onClick={() => openModal1(i, k)}
                                                    >
                                                        {parseFloat(data2.jumlah_waktu_jam).toFixed(2)}
                                                    </button>

                                                    {/* More explicit check for modal visibility */}
                                                    {showModal1[i] && showModal1[i][k] === true && (
                                                        <ModalXL
                                                            isOpen={true}
                                                            onClose={() => closeModal1(i, k)}
                                                            judul={'Detail Data'}
                                                        >
                                                            <div className="overflow-x-auto pt-4">
                                                                <label className='text-sm  font-semibold'>
                                                                    {data.mesin} - {data2.nama_bulan}
                                                                </label>
                                                                <table className="min-w-full divide-y divide-gray-200 border border-blue-200 rounded-lg overflow-hidden">
                                                                    <thead className="bg-blue-600 text-white font-semibold ">
                                                                        <tr>
                                                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">No JO</th>
                                                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Operator</th>
                                                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Verifikator</th>
                                                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Eksekutor</th>
                                                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Kode</th>
                                                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Nama Kendala</th>
                                                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Breakdown Time</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="bg-white divide-y divide-gray-200">

                                                                        {data2.details?.slice()
                                                                            .map((data3: any) => {
                                                                                // Calculate breakdown time for sorting
                                                                                let breakdownTimeMs = 0;
                                                                                if (data3.createdAt && data3.waktu_selesai) {
                                                                                    const startTime = new Date(data3.createdAt);
                                                                                    const endTime = new Date(data3.waktu_selesai);
                                                                                    // Calculate difference in milliseconds
                                                                                    const timeDiff = endTime.getTime() - startTime.getTime();
                                                                                    if (!isNaN(timeDiff) && timeDiff > 0) {
                                                                                        breakdownTimeMs = timeDiff;
                                                                                    }
                                                                                }
                                                                                // Add the calculated milliseconds to each item for sorting
                                                                                return { ...data3, breakdownTimeMs };
                                                                            })
                                                                            // Sort by breakdown time (descending)
                                                                            .sort((a: any, b: any) => b.breakdownTimeMs - a.breakdownTimeMs)
                                                                            .map((data3: any, index: any) => {
                                                                                // Format the breakdown time for display
                                                                                let breakdownTime = "-";
                                                                                if (data3.breakdownTimeMs > 0) {
                                                                                    const hours = Math.floor(data3.breakdownTimeMs / (1000 * 60 * 60));
                                                                                    const minutes = Math.floor((data3.breakdownTimeMs % (1000 * 60 * 60)) / (1000 * 60));
                                                                                    const seconds = Math.floor((data3.breakdownTimeMs % (1000 * 60)) / 1000);
                                                                                    breakdownTime = `${hours}h ${minutes}m ${seconds}s`;
                                                                                }

                                                                                return (
                                                                                    <tr key={index} className={index % 2 === 0 ? "bg-blue-50" : "bg-white"}>
                                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{data3.no_jo}</td>
                                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{data3.operator}</td>
                                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{data3.verifikator}</td>
                                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{data3.eksekutor}</td>
                                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{data3.kode_lkh}</td>
                                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{data3.nama_kendala}</td>
                                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{breakdownTime}</td>
                                                                                    </tr>
                                                                                );
                                                                            })}

                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </ModalXL>
                                                    )}
                                                </div>
                                            );
                                        })}

                                    </div >
                                </>
                            )
                        })}


                    </div >

                </div>

            </div>
        </div >
    )
}

export default RekapOs2Mtc
