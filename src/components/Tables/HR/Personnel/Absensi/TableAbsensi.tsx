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
                                <label className="text-neutral-500 text-sm font-semibold col-span-4">
                                    Waktu
                                </label>
                                <label className="text-neutral-500 text-sm font-semibold">
                                    Shift
                                </label>
                                <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                    Lembur (Jam)
                                </label>
                                <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                    Terlambat (Menit)
                                </label>
                            </div>
                            <div className="w-2 h-full "></div>
                            {absen?.map((data: any, i: any) => {



                                return (
                                    <>
                                        <div className="grid grid-cols-12 border-b-8 border-[#D8EAFF] gap-2 items-center px-10 min-h-10">

                                            <label className="text-neutral-500 text-sm font-semibold ">
                                                {i + 1}
                                            </label>
                                            <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                                {data.name}
                                            </label>
                                            <div className='col-span-4 flex flex-col gap-1 py-2'>
                                                <label className="text-neutral-500 text-sm font-semibold  ">
                                                    Masuk : {data.tgl_masuk} Pukul {data.jam_masuk}
                                                </label>
                                                <label className="text-neutral-500 text-sm font-semibold  ">
                                                    Keluar : {data.tgl_keluar} Pukul {data.jam_keluar}
                                                </label>
                                            </div>

                                            <label className="text-neutral-500 text-sm font-semibold ">
                                                {data.shift}
                                            </label>
                                            <label className="text-neutral-500 text-sm font-semibold col-span-2 ">
                                                {data.status_lembur} {data.jam_lembur == 0 ? '' : '~ ' + data.jam_lembur + 'Jam'}
                                            </label>
                                            <label className="text-neutral-500 text-sm font-semibold col-span-2 ">
                                                {data.status_masuk}  {data.menit_terlambat == 0 ? '' : '~ ' + data.menit_terlambat + 'Menit'}
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
