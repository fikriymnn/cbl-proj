import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@mui/material';
import convertTimeStampToDate from '../../../../../utils/converDateTime';

function IncomingIzinHR() {
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

    // const [cetakMesin, setCetakMesin] = useState<any>();

    // useEffect(() => {
    //     getCetakMesin();
    // }, []);

    // async function getCetakMesin() {
    //     const url = `${import.meta.env.VITE_API_LINK}/qc/cs/inspeksiBarangrusak`;
    //     try {
    //         const res = await axios.get(url, {
    //             params: {
    //                 status: 'incoming',
    //             },
    //             withCredentials: true,
    //         });

    //         setCetakMesin(res.data);
    //         console.log(res.data);
    //     } catch (error: any) {
    //         console.log(error.data.msg);
    //     }
    // }


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

                                <label className="text-neutral-500 text-sm font-semibold col-span-3">
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
                            {mesin?.map((data: any, i: any) => {
                                const tanggal = convertTimeStampToDate(data.createdAt);
                                return (
                                    <>
                                        <div className="grid grid-cols-12 border-b-8 border-[#D8EAFF] gap-2 items-center px-10">

                                            <label className="text-neutral-500 text-sm font-semibold ">
                                                {i + 1}
                                            </label>

                                            <label className="text-neutral-500 text-sm font-semibold col-span-3 ">
                                                1 Agustus 2024
                                            </label>
                                            <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                                Maintenance
                                            </label>
                                            <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                                {data.inspector}
                                            </label>
                                            <div className="justify-end flex pr-2 col-span-4">
                                                <>

                                                    <button
                                                        className={`uppercase px-14 inline-flex rounded-[3px] items-center text-white text-xs font-bold  py-2 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600  justify-center`} // Dynamic class assignment
                                                    >
                                                        ACTION
                                                    </button>

                                                </>
                                            </div>
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

export default IncomingIzinHR;
