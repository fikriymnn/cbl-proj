import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@mui/material';
import convertTimeStampToDate from '../../../../../utils/converDateTime';
import convertTimeStampnoConvert from '../../../../../utils/convertdateNoConvert';
import convertTimeStampToDateOnly from '../../../../../utils/convertDateOnly';

function TableAbsensi() {
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

    const [absen, setabsen] = useState<any>();

    useEffect(() => {
        getabsen();
    }, []);

    async function getabsen() {
        const url = `${import.meta.env.VITE_API_LINK}/hr/absensi`;
        try {
            const res = await axios.get(url, {

                withCredentials: true,
            });

            setabsen(res.data.data);
            console.log(res.data);
        } catch (error: any) {
            console.log(error);
        }
    }


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
                                <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                    Nama
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
                                <label className="text-neutral-500 text-sm font-semibold col-span-2">
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
                                              ${data.status_absen == 'sakit' ? 'bg-red-200' : ''}
                                               ${data.status_absen == 'izin' ? 'bg-blue-200' : ''}
                                            `}>

                                            <label className="text-neutral-500 text-sm font-semibold ">
                                                {i + 1}
                                            </label>
                                            <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                                {data.name}
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
                                            <label className="text-neutral-500 text-sm font-semibold col-span-2 ">
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
