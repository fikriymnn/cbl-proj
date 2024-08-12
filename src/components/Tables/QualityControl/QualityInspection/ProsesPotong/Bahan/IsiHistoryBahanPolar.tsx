import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';



function IsiHistoryBahanPolar() {
    const [isMobile, setIsMobile] = useState(false);
    const kosong: any = []
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const date = today.getDate();
    const currentDate = month + "/" + date + "/" + year;
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

    const { id } = useParams();

    const [incoming, setIncoming] = useState<any>();

    useEffect(() => {

        getInspection();
    }, []);

    async function getInspection() {
        const url = `${import.meta.env.VITE_API_LINK}/qc/cs/inspeksiPotong/${id}`;

        try {
            const res = await axios.get(url, {

                withCredentials: true,
            });

            setIncoming(res.data.data);
        } catch (error: any) {
            console.log(error.data.msg);
        }
    }

    function formatElapsedTime(seconds: number): string {
        // Ensure seconds is non-negative
        seconds = Math.max(0, seconds);

        const hours = Math.floor(seconds / 3600);
        const remainingSeconds = seconds % 3600;

        const minutes = Math.floor(remainingSeconds / 60);
        const remainingSecondsAfterMinutes = remainingSeconds % 60;

        // Use template literals and conditional operators for formatting
        let formattedTime = '';
        if (hours > 0) {
            formattedTime += `${hours} Jam :`; // Add hours if present
        }
        if (hours > 0 || minutes > 0) { // Only add minutes if hours are present or minutes are non-zero
            formattedTime += `${minutes.toString().padStart(2, '0')} Menit : `;
        }
        formattedTime += remainingSecondsAfterMinutes.toString().padStart(2, '0');

        return formattedTime;
    }

    function convertDatetimeToDate(datetime: any) {
        const dateObject = new Date(datetime);
        const day = dateObject.getDate().toString().padStart(2, '0'); // Ensure two-digit day
        const month = (dateObject.getMonth() + 1).toString().padStart(2, '0'); // Adjust for zero-based month
        const year = dateObject.getFullYear();
        const hours = dateObject.getHours().toString().padStart(2, '0');
        const minutes = dateObject.getMinutes().toString().padStart(2, '0');

        return `${year}/${month}/${day} ${hours}:${minutes}`; // Example format (YYYY-MM-DD)
    }
    function calculateElapsedTime(startTime: any, stopTime: Date) {

        const start = new Date(startTime);
        const diffInMs = stopTime.getTime() - start.getTime();
        // Convert milliseconds to your desired unit (minutes, hours)
        const elapsedTime = Math.round(diffInMs / (1000));
        // Example: minutes
        return elapsedTime;

    }

    const waktuMulaiincoming = convertDatetimeToDate(incoming != null && incoming?.waktu_mulai);

    const waktuSelesaiincoming =
        incoming != null && incoming?.waktu_selesai != null
            ? convertDatetimeToDate(incoming?.waktu_selesai)
            : '-';

    return (
        <>

            {!isMobile && (
                <main className='overflow-x-hidden'>
                    <div className='min-w-[700px] bg-white rounded-xl'>

                        <p className='text-[14px] font-semibold w-full flex border-b-8 border-[#D8EAFF] py-4 px-9 md:ps-9 ps-12'>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12ZM13 8C13 8.55228 12.5523 9 12 9C11.4477 9 11 8.55228 11 8C11 7.44772 11.4477 7 12 7C12.5523 7 13 7.44772 13 8ZM13 17V11H11V17H13Z" fill="#0065DE" />
                            </svg>
                            {" "} Potong Bahan Checksheet
                        </p>

                        <div className='grid grid-cols-10 border-b-8 border-[#D8EAFF]'>
                            <div className='grid grid-rows-6 gap-1 col-span-2 px-10 py-4 '>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    Tanggal
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    No. JO
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    No. IO
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    Mesin
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    Operator
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    Shift
                                </label>
                            </div>
                            <div className='grid grid-rows-6 gap-1 col-span-2 px-10 py-4'>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    : {incoming?.tanggal}
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    : {incoming?.no_io}
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    : {incoming?.no_jo}
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    : {incoming?.mesin}
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    : {incoming?.operator}
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    : {incoming?.shift}
                                </label>
                            </div>

                            <div className='grid grid-rows-6  gap-1 col-span-2 justify-between px-10 py-4'>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    Jam
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    Item
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    Inspector
                                </label>

                            </div>
                            <div className='grid grid-rows-6  gap-1 col-span-2 justify-between px-10 py-4'>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    : {incoming?.jam}
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    : {incoming?.item}
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    : {incoming?.inspector}
                                </label>
                            </div>
                            <div className='flex flex-col w-full items-center gap-4 px-10 py-4 col-span-2  bg-[#F6FAFF]'>
                                <div >

                                    {incoming?.waktu_mulai != null &&
                                        incoming?.waktu_selesai != null && (
                                            <>
                                                <div className='gap-1 flex flex-col'>
                                                    <p className='md:text-[14px] text-[9px] font-semibold'>
                                                        Waktu Mulai :
                                                    </p>
                                                    <p className='md:text-[14px] text-[9px] font-semibold text-stone-400'>
                                                        {waktuMulaiincoming}
                                                    </p>
                                                    <p className='md:text-[14px] text-[9px] font-semibold'>
                                                        Waktu Selesai :
                                                    </p>
                                                    <p className='md:text-[14px] text-[9px] font-semibold text-stone-400'>
                                                        {waktuSelesaiincoming}
                                                    </p>
                                                    <p className="md:text-[14px] text-[9px] font-semibold">
                                                        Time :
                                                    </p>
                                                    <p className='md:text-[14px] text-[9px] font-semibold text-stone-400'>
                                                        {
                                                            incoming?.lama_pengerjaan != null
                                                                ? formatElapsedTime(incoming?.lama_pengerjaan)
                                                                : ''}
                                                        {" "} Detik
                                                    </p>
                                                </div>
                                            </>
                                        )
                                    }


                                </div>

                            </div>

                        </div>

                        <div className='grid grid-cols-8 px-3 py-4 border-b-8 border-[#D8EAFF] gap-2'>
                            <div className='flex gap-4 col-span-2'>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    No
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    Point Check
                                </label>
                            </div>
                            <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                Standar
                            </label>
                            <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                Hasil Check
                            </label>
                            <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                Keterangan
                            </label>

                        </div>
                        <>




                            {/* =============================Point 1========================== */}

                            <>
                                <div className='border-b-8 border-[#D8EAFF]'>
                                    <div className='grid grid-cols-8 px-3 py-4 gap-2 items-center'>
                                        <div className='flex gap-4 col-span-2'>
                                            <label className='text-neutral-500 text-sm font-semibold'>
                                                1
                                            </label>
                                            <label className='text-neutral-500 text-sm font-semibold'>
                                                Jenis Kertas
                                            </label>
                                        </div>
                                        <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                            Job Order
                                        </label>
                                        <label className='text-neutral-500 text-sm font-semibold col-span-2'>


                                            {incoming?.inspeksi_potong_result[0].hasil_check}


                                        </label>
                                        <div className='flex flex-col gap-1  w-[50%] col-span-2'>

                                            {incoming?.inspeksi_potong_result[0].keterangan}
                                        </div>
                                    </div>

                                </div>

                            </>
                            {/* =============================Point 2========================== */}
                            <>
                                <div className='border-b-8 border-[#D8EAFF]'>
                                    <div className='grid grid-cols-8 px-3 py-4 gap-2 items-center'>
                                        <div className='flex gap-4 col-span-2'>
                                            <label className='text-neutral-500 text-sm font-semibold'>
                                                2
                                            </label>
                                            <label className='text-neutral-500 text-sm font-semibold'>
                                                Gramatur
                                            </label>
                                        </div>
                                        <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                            Job Order
                                        </label>
                                        <label className='text-neutral-500 text-sm font-semibold col-span-2'>


                                            {incoming?.inspeksi_potong_result[1].hasil_check}



                                        </label>
                                        <div className='flex flex-col gap-1  w-[50%] col-span-2'>

                                            {incoming?.inspeksi_potong_result[1].keterangan}

                                        </div>
                                    </div>

                                </div>

                            </>
                            {/* =============================Point 3========================== */}
                            <>
                                <div className='border-b-8 border-[#D8EAFF]'>
                                    <div className='grid grid-cols-8 px-3 py-4 gap-2 items-center'>
                                        <div className='flex gap-4 col-span-2'>
                                            <label className='text-neutral-500 text-sm font-semibold'>
                                                3
                                            </label>
                                            <label className='text-neutral-500 text-sm font-semibold'>
                                                Ukuran Potong
                                            </label>
                                        </div>
                                        <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                            Job Order
                                        </label>
                                        <div className='flex flex-col col-span-2 gap-1'>
                                            <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                                {incoming?.inspeksi_potong_result[2].hasil_panjang} MM
                                            </label>
                                            <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                                {incoming?.inspeksi_potong_result[2].hasil_lebar} MM
                                            </label>
                                        </div>
                                        <div className='flex flex-col gap-1  w-[50%] col-span-2'>

                                            {incoming?.inspeksi_potong_result[2].keterangan}

                                        </div>
                                    </div>

                                </div>

                            </>
                            {/* =============================Point 4========================== */}
                            <>
                                <div className='border-b-8 border-[#D8EAFF]'>
                                    <div className='grid grid-cols-8 px-3 py-4 gap-2 items-center'>
                                        <div className='flex gap-4 col-span-2'>
                                            <label className='text-neutral-500 text-sm font-semibold'>
                                                4
                                            </label>
                                            <label className='text-neutral-500 text-sm font-semibold'>
                                                Arah Serat
                                            </label>
                                        </div>
                                        <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                            Mounting di BOM
                                        </label>
                                        <label className='text-neutral-500 text-sm font-semibold col-span-2'>

                                            {incoming?.inspeksi_potong_result[3].hasil_check}

                                        </label>
                                        <div className='flex flex-col gap-1  w-[50%] col-span-2'>

                                            {incoming?.inspeksi_potong_result[3].keterangan}


                                        </div>
                                    </div>

                                </div>
                            </>
                        </>
                    </div>

                </main>
            )}

        </>
    )
}

export default IsiHistoryBahanPolar