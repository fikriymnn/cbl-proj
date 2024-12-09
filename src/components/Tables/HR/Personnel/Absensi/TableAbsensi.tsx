import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@mui/material';
import convertTimeStampToDate from '../../../../../utils/converDateTime';
import convertTimeStampnoConvert from '../../../../../utils/convertdateNoConvert';
import convertTimeStampToDateOnly from '../../../../../utils/convertDateOnly';
import Loading from '../../../../Loading';
import ModalKosongan from '../../../../Modals/Qc/NCR/NCRResponQC';
import TabPengajuanKeHR from '../../PengajuanKeHR/TabPengajuanKeHR';
import TabPengajuanLangsung from './TabPengajuanLangsung';

function TableAbsensi() {
    const [isLoading, setIsLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const kosong: any = [];
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const date = today.getDate();
    const currentDate = month + '/' + date + '/' + year;

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

    const [absen, setabsen] = useState<any>();

    useEffect(() => {
        const today = new Date();
        getabsen(today, today);
        getDepartment()
    }, []);


    const [department, setDepartment] = useState<any>();
    const [idDepartment, setidDepartment] = useState<any>();
    async function getDepartment() {
        const url = `${import.meta.env.VITE_API_LINK
            }/master/hr/department`;
        try {
            setIsLoading(true)
            const res = await axios.get(
                url,

                {
                    withCredentials: true,
                },
            );
            setIsLoading(false)
            setDepartment(res.data)
            console.log(res.data)
        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }
    const [dateFrom, setDateFrom] = useState<any>();
    const [dateTo, setDateTo] = useState<any>();

    async function getabsen(dateFrom1: any, dateTo1: any) {
        const url = `${import.meta.env.VITE_API_LINK}/hr/absensi`;
        try {
            setIsLoading(true)
            const res = await axios.get(url, {
                params: {

                    startDate: dateFrom1,
                    endDate: dateTo1,
                    idDepartment: idDepartment
                },
                withCredentials: true,
            });
            setIsLoading(false)
            setabsen(res.data.data);
            console.log(res.data);
        } catch (error: any) {
            setIsLoading(false)
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
        <>
            {!isMobile && (
                <main className="overflow-x-scroll">
                    {isLoading && <Loading />}
                    <div className="bg-white rounded-md shadow-md md:w-12/12 mb-5 border-2 border-stroke">
                        <div className="flex md:gap-4 gap-1 md:flex-row flex-col px-4 py-4 md:mt-0 ">
                            <div className='flex flex-col gap-1'>
                                <div className='flex flex-col'>
                                    <p className="my-auto text-sm text-primary font-semibold ">
                                        Pilih Tanggal
                                    </p>

                                </div>

                                <div className='flex gap-3'>
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
                                </div>

                            </div>

                            <div className='flex flex-col gap-1 '>
                                <label className='text-sm text-primary font-semibold'>
                                    Department
                                </label>
                                <div className="relative z-20 h-10 bg-white dark:bg-form-input  w-full">
                                    <span className="absolute top-1/2 left-4 z-30 -translate-y-1/2">
                                        <svg
                                            width="20"
                                            height="20"
                                            viewBox="0 0 20 20"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >

                                        </svg>
                                    </span>

                                    <select
                                        name='nama_department'
                                        onChange={(e) => setidDepartment(e.target.value)}
                                        className={`relative z-20  bg-[#D8EAFF]  appearance-none rounded-md h-7 py-1 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input  
                                    }`}
                                    >
                                        <option selected disabled className="text-[#646464] text-xs dark:text-bodydark">
                                            PILIH DEPARTMENT
                                        </option>
                                        {department?.data?.map((data: any, i: number) => {

                                            return (
                                                <option
                                                    value={data.id}
                                                    className="text-gray-800 text-xs font-light dark:text-bodydark"
                                                >
                                                    {data.nama_department}
                                                </option>
                                            )
                                        }
                                        )}

                                    </select>

                                    <span className="absolute top-[15px] right-4 z-10 -translate-y-1/2">
                                        <svg
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
                                                    fill="#637381"
                                                ></path>
                                            </g>
                                        </svg>
                                    </span>

                                </div>
                            </div>
                            <div className="flex justify-center my-5">
                                <button
                                    onClick={() => {
                                        getabsen(dateFrom, dateTo)
                                    }}
                                    className="bg-primary text-white px-5 py-2 rounded-md my-auto "
                                >
                                    Tampilkan
                                </button>
                            </div>
                            <div className="flex justify-center my-5">
                                <button
                                    onClick={() => {

                                        getabsen(today, today)

                                    }}
                                    className="bg-primary text-white px-5 py-2 rounded-md my-auto "
                                >
                                    Hari Ini
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="min-w-[700px] bg-white rounded-xl">
                        <div className=" w-full h-full flex-col border-b-8 border-[#D8EAFF]">
                            <div className="grid grid-cols-12 px-10 py-4 border-b-8 border-[#D8EAFF] gap-2 ">
                                <div className='flex col-span-2 gap-2'>
                                    <label className="text-neutral-500 text-sm font-semibold ">
                                        No.
                                    </label>
                                    <label className="text-neutral-500 text-sm font-semibold ">
                                        Nama
                                    </label>
                                </div>
                                <label className="text-neutral-500 text-sm font-semibold ">
                                    Department
                                </label>
                                <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                    Tanggal
                                </label>
                                <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                    Waktu
                                </label>
                                <label className="text-neutral-500 text-sm font-semibold">
                                    Shift
                                </label>
                                <label className="text-neutral-500 text-sm font-semibold">
                                    Lembur (Jam)
                                </label>
                                <label className="text-neutral-500 text-sm font-semibold ">
                                    Terlambat (Menit)
                                </label>
                                <label className="text-neutral-500 text-sm font-semibold ">
                                    Status Absen
                                </label>
                            </div>
                            <div className="w-2 h-full "></div>
                            {absen?.map((data: any, i: any) => {

                                return (
                                    <>
                                        <div className={`grid grid-cols-12 border-b-8 border-[#D8EAFF] gap-2 items-center px-10 min-h-10  
                                            ${data.status_absen == 'cuti khusus' ? 'bg-orange-200' : ''} 
                                               ${data.status_absen == 'sakit' ? 'bg-green-200' : ''}
                                               ${data.status_absen == 'izin' ? 'bg-blue-200' : ''}
                                               ${data.status_absen == 'Belum Masuk' ? 'bg-red-300' : ''}
                                                  ${data.status_absen == 'cuti tahunan' ? 'bg-yellow-200' : ''}
                                            `}>
                                            <div className='flex gap-1 col-span-2 '>
                                                <label className="text-neutral-500 text-sm font-semibold ">
                                                    {i + 1}.
                                                </label>
                                                <label className="text-neutral-500 text-sm font-semibold ">
                                                    {data.name}
                                                </label>
                                            </div>
                                            <label className="text-neutral-500 text-sm font-semibold">
                                                {data.nama_department}
                                            </label>
                                            <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                                {data.tgl_masuk}
                                            </label>
                                            <div className='col-span-2 flex flex-col gap-1 py-2'>
                                                <label className="text-neutral-500 text-sm font-semibold  ">
                                                    Masuk :  {(data.jam_masuk == null || data.jam_masuk == 0) ? ' ~' : data.jam_masuk}
                                                </label>
                                                <label className="text-neutral-500 text-sm font-semibold  ">
                                                    Keluar : {(data.jam_keluar == null || data.jam_keluar == 0) ? ' ~' : data.jam_keluar}
                                                </label>
                                            </div>

                                            <label className="text-neutral-500 text-sm font-semibold ">
                                                {(data.shift == null || data.shift == 0) ? ' ~' : data.shift}
                                            </label>
                                            <label className="text-neutral-500 text-sm font-semibold ">
                                                {(data.status_lembur == null || data.status_lembur == 0) ? ' ~' : data.status_lembur} {(data.jam_lembur == null || data.jam_lembur == 0) ? '' : '~ ' + data.jam_lembur + 'Jam'}
                                            </label>
                                            <div className='flex flex-col gap-1'>
                                                <label className="text-neutral-500 text-sm font-semibold ">
                                                    {data.status_masuk}
                                                </label>
                                                <label className="text-neutral-500 text-sm font-semibold ">
                                                    {(data.menit_terlambat == null || data.menit_terlambat == 0) ? '~' : '~ ' + data.menit_terlambat + ' Menit'}
                                                </label>
                                            </div>
                                            <label className="text-neutral-500 text-sm font-semibold ">
                                                {data.status_absen}
                                            </label>
                                            {data.status_absen == 'Belum Masuk' ?
                                                <>
                                                    <button
                                                        onClick={() => openEdit(i)}
                                                        className="w-full bg-blue-600 text-white text-sm py-1 rounded-md"
                                                    >
                                                        Aksi
                                                    </button>
                                                    {showEdit[i] == true && (

                                                        <ModalKosongan
                                                            isOpen={showEdit[i]}
                                                            onClose={() => closeEdit(i)}
                                                            judul={'Lapor'}
                                                        >
                                                            <>
                                                                <TabPengajuanLangsung data={data} />
                                                            </>
                                                        </ModalKosongan>
                                                    )}
                                                </> :
                                                <>

                                                </>}

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

export default TableAbsensi;
