import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@mui/material';
import convertTimeStampToDate from '../../../../../utils/converDateTime';

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

            setabsen(res.data);
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
                                    Tanggal
                                </label>
                                <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                    Shift
                                </label>
                            </div>
                            <div className="w-2 h-full "></div>
                            {absen?.map((data: any, i: any) => {
                                const tanggal = convertTimeStampToDate(data.CHECKTIME);


                                function convertUTCToGMT7(utcTimestamp: any, format: any) {
                                    // Parse the UTC timestamp into a JavaScript Date object
                                    const utcDate = new Date(utcTimestamp);

                                    // Get the UTC time in milliseconds
                                    const utcTime = utcDate.getTime();

                                    // Calculate the offset in milliseconds for GMT+7
                                    const gmt7Offset = 17 * 60 * 60 * 1000;

                                    // Add the offset to the UTC time to get the GMT+7 time in milliseconds
                                    const gmt7Time = utcTime + gmt7Offset;

                                    // Create a new Date object from the GMT+7 time in milliseconds
                                    const gmt7Date = new Date(gmt7Time);

                                    // Format the GMT+7 date and time according to the specified format
                                    const gmt7Timestamp = gmt7Date.toLocaleString('id-ID', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: 'numeric',
                                        minute: 'numeric',
                                        hour12: false,

                                    });

                                    // Replace the "/" with " / " to match the desired format
                                    const formattedTimestamp = gmt7Timestamp.replace('/', ' /');

                                    return {
                                        formattedTimestamp: gmt7Timestamp,
                                        shift: determineShift(gmt7Date)
                                    };
                                }
                                function determineShift(dateTime: any) {
                                    // Parse the DateTime string into a JavaScript Date object
                                    const dateObj = new Date(dateTime);

                                    // Extract the hour from the Date object
                                    const hour = dateObj.getHours();

                                    // Apply the condition to determine the shift
                                    if (hour >= 7 && hour <= 17) {
                                        return "Shift 1";
                                    } else if (hour >= 18 || hour <= 2) {
                                        return "Shift 2";
                                    } else {
                                        return "Invalid Shift"; // Handle invalid times (optional)
                                    }
                                }
                                // Example usage:

                                const utcTimestamp = data.CHECKTIME;
                                const result = convertUTCToGMT7(utcTimestamp, "dd / MMMM / yyyy HH:mm");


                                const shiftStatus = determineShift(utcTimestamp);
                                return (
                                    <>
                                        <div className="grid grid-cols-12 border-b-8 border-[#D8EAFF] gap-2 items-center px-10 min-h-10">

                                            <label className="text-neutral-500 text-sm font-semibold ">
                                                {i + 1}
                                            </label>
                                            <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                                {data.Name}
                                            </label>
                                            <label className="text-neutral-500 text-sm font-semibold col-span-4 ">
                                                {result.formattedTimestamp}
                                            </label>
                                            <label className="text-neutral-500 text-sm font-semibold col-span-4 ">
                                                {result.shift}
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
