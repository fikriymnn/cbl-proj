import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';



function HistoryIncoming() {
    const [isMobile, setIsMobile] = useState(false);
    const kosong: any = []
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const date = today.getDate();
    const currentDate = month + "/" + date + "/" + year;
    const navigate = useNavigate();

    const { id } = useParams();
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


    const [incoming, setIncoming] = useState<any>();

    useEffect(() => {

        getInspection();
    }, []);

    async function getInspection() {
        const url = `${import.meta.env.VITE_API_LINK}/qc/cs/inspeksiBahan/${id}`;

        try {
            const res = await axios.get(url, {

                withCredentials: true,
            });
            console.log(res.data.data)
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
    const waktuMulai = convertDatetimeToDate(incoming != null && incoming?.waktu_mulai);
    const waktuSelesai = convertDatetimeToDate(incoming != null && incoming?.waktu_selesai);

    return (
        <>

            {!isMobile && (
                <main className='overflow-x-scroll'>
                    <div className='min-w-[700px] bg-white rounded-xl'>

                        <p className='text-[14px] font-semibold w-full flex border-b-8 border-[#D8EAFF] py-4 px-9 md:ps-9 ps-12'>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12ZM13 8C13 8.55228 12.5523 9 12 9C11.4477 9 11 8.55228 11 8C11 7.44772 11.4477 7 12 7C12.5523 7 13 7.44772 13 8ZM13 17V11H11V17H13Z" fill="#0065DE" />
                            </svg>
                            {" "} Incoming Inspection Checksheet
                        </p>

                        <div className='grid grid-cols-12  border-b-8 border-[#D8EAFF]'>
                            <div className='flex flex-col gap-4 col-span-2 px-10 py-4'>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    Tanggal
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    No. LOT
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    No. Surat Jalan
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    Supplier
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    Jenis Kertas
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    Ukuran
                                </label>
                            </div>
                            <div className='flex flex-col gap-4 col-span-3 px-10 py-4'>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    : {incoming?.tanggal}
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    : {incoming?.no_lot}
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    : {incoming?.no_surat_jalan}
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    : {incoming?.supplier}
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    : {incoming?.jenis_kertas}
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    : {incoming?.ukuran}
                                </label>
                            </div>

                            <div className='flex flex-col  gap-4 col-span-3 justify-between pl-10 py-4'>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    Jam
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    Inspector
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>

                                </label>

                                <label className='text-black text-lg font-bold'>
                                    STANDAR PEMERIKSAAN
                                </label>

                                <label className='text-neutral-500 text-sm font-semibold'>
                                    Jumlah
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    √N + 1
                                </label>


                            </div>
                            <div className='flex flex-col  gap-4 col-span-2 justify-between py-4'>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    : {incoming?.jam}
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    : {incoming?.inspector}
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>

                                </label>


                                <label className='text-black text-lg font-bold mt-12'>
                                    {' '}
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    : {incoming?.jumlah}
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>

                                    :{incoming?.hasil_rumus}

                                </label>


                            </div>
                            <div className={`flex flex-col h-full w-full  gap-2  py-4 col-span-2  font-semibold  bg-[#F6FAFF]`}>
                                <p className={` uppercase font-semibold text-lg bg-[#F6FAFF] ${incoming?.verifikasi == 'Diterima' ? 'text-green-500' : 'text-red-500'}`}>
                                    {incoming?.verifikasi}
                                </p>
                                <div className='text-sm gap-1 flex flex-col'>
                                    <p>
                                        Waktu Mulai :
                                    </p>
                                    <p>
                                        {waktuMulai}
                                    </p>
                                    <p>
                                        Waktu Selesai :
                                    </p>
                                    <p>
                                        {waktuSelesai}
                                    </p>
                                    <p>
                                        Time :
                                    </p>
                                    <p>
                                        {formatElapsedTime(incoming?.lama_pengerjaan)} Detik
                                    </p>
                                </div>

                            </div>
                        </div>
                        <div className='grid grid-cols-12 px-3 py-4 border-b-8 border-[#D8EAFF] gap-2'>
                            <div className='flex gap-4 col-span-2'>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    No
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    Keterangan
                                </label>
                            </div>
                            <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                Alat Ukur
                            </label>
                            <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                Metode
                            </label>
                            <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                Target
                            </label>
                            <div className='flex justify-between  col-span-3'>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    Hasil
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold pr-[20%]'>
                                    Keterangan
                                </label>
                            </div>

                            <label className='text-neutral-500 text-sm font-semibold flex justify-end'>
                                Bobot (%)
                            </label>
                        </div>


                        <form>
                            <div className='grid grid-cols-12 px-3 py-4 gap-2'>
                                <div className='flex gap-4 col-span-2'>
                                    <label className='text-neutral-500 text-sm font-semibold'>
                                        1
                                    </label>
                                    <label className='text-neutral-500 text-sm font-semibold'>
                                        Jenis Kertas
                                    </label>
                                </div>
                                <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                    -
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                    Visual
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                    Sesuai Surat Jalan
                                </label>
                                <div className='flex justify-between  col-span-3'>
                                    <label className='text-neutral-500 text-sm font-semibold'>

                                        {incoming?.inspeksi_bahan_result[0]?.hasil}


                                    </label>
                                    <div className='flex flex-col gap-1  w-[50%]'>

                                        <div className='text-neutral-500 text-sm font-semibold'>
                                            {incoming?.inspeksi_bahan_result[0].keterangan_hasil}
                                        </div>


                                    </div>
                                </div>
                                <label className='text-neutral-500 text-sm font-semibold flex justify-center'>
                                    25
                                </label>
                            </div>
                            <div className='grid grid-cols-10 bg-[#F5F5F5] px-10 py-4 border-b-8 border-[#D8EAFF]'>

                                <div className='col-span-4'>

                                    <div className="flex flex-col ">
                                        <p className="md:text-[14px] text-[9px] font-semibold">
                                            Upload Foto (Optional):
                                        </p>

                                        <br />
                                        <div className="">
                                            <input
                                                disabled
                                                type="file"
                                                name=""
                                                id=""
                                                className="w-60"
                                            />
                                        </div>
                                    </div>

                                </div>


                            </div>
                        </form>

                        {/* =============================Point 2========================== */}
                        <>
                            <div className='grid grid-cols-12 px-3 py-4 gap-2 '>
                                <div className='flex gap-4 col-span-2'>
                                    <label className='text-neutral-500 text-sm font-semibold'>
                                        2
                                    </label>
                                    <label className='text-neutral-500 text-sm font-semibold'>
                                        Gramatur
                                    </label>
                                </div>
                                <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                    Timbangan Digital
                                </label>
                                <div className='flex flex-col gap-2 col-span-2'>
                                    <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                        Potong Kertas Ukuran 10x10cm di area KIRI, TENGAH, KANAN
                                    </label>
                                    <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                        Timbang Masing-Masing beratnya
                                    </label>
                                    <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                        Jumlahkan dan hitung nilai rata-ratanya (KIRI &lt; TENGAH &lt; KANAN : 3)
                                    </label>
                                </div>
                                <div className='flex flex-col gap-2 col-span-2'>
                                    <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                        Gramatur Sesuai Surat Jalan
                                    </label>
                                    <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                        Toleransi &#xb1; 4%
                                    </label>
                                </div>

                                <div className='flex justify-between  col-span-3'>

                                    <div className='flex flex-col  w-[60%]'>

                                        <div className='flex flex-col gap-1'>
                                            <label className='text-neutral-500 text-sm font-semibold '>
                                                Kiri
                                            </label>
                                            <label className='text-neutral-500 text-sm font-semibold '>
                                                {incoming?.inspeksi_bahan_result[1].hasil_kiri}
                                            </label>
                                            <label className='text-neutral-500 text-sm font-semibold pt-1'>
                                                Tengah
                                            </label>
                                            <label className='text-neutral-500 text-sm font-semibold '>
                                                {incoming?.inspeksi_bahan_result[1].hasil_tengah}
                                            </label>
                                            <label className='text-neutral-500 text-sm font-semibold pt-1'>
                                                Kanan
                                            </label>
                                            <label className='text-neutral-500 text-sm font-semibold '>
                                                {incoming?.inspeksi_bahan_result[1].hasil_kanan}
                                            </label>
                                            <label className='text-neutral-500 text-sm font-semibold pt-1'>
                                                Rata-Rata
                                            </label>
                                            <label className='text-neutral-500 text-sm font-semibold '>
                                                {incoming?.inspeksi_bahan_result[1].hasil_rata_rata}
                                            </label>
                                        </div>

                                    </div>

                                    <div className='flex flex-col gap-1  w-[50%]'>

                                        <p className='text-neutral-500 text-sm font-semibold'>
                                            {incoming?.inspeksi_bahan_result[1].keterangan_hasil}
                                        </p>
                                    </div>
                                </div>
                                <label className='text-neutral-500 text-sm font-semibold flex justify-center'>
                                    20
                                </label>
                            </div>
                            <div className='grid grid-cols-10 bg-[#F5F5F5] px-10 py-4 border-b-8 border-[#D8EAFF]'>

                                <div className='col-span-4'>
                                    <div className="flex flex-col ">
                                        <p className="md:text-[14px] text-[9px] font-semibold">
                                            Upload Foto (Optional):
                                        </p>

                                        <br />
                                        <div className="">
                                            <input
                                                disabled
                                                type="file"
                                                name=""
                                                id=""
                                                className="w-60"
                                            />
                                        </div>
                                    </div>

                                </div>

                            </div>
                        </>



                        {/* =============================Point 3========================== */}
                        <>
                            <div className='grid grid-cols-12 px-3 py-4 gap-2 '>
                                <div className='flex gap-4 col-span-2'>
                                    <label className='text-neutral-500 text-sm font-semibold'>
                                        3
                                    </label>
                                    <label className='text-neutral-500 text-sm font-semibold'>
                                        Thickness
                                    </label>
                                </div>
                                <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                    Thickness Gauge
                                </label>
                                <div className='flex flex-col gap-2 col-span-2'>
                                    <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                        Ukuran ketebalan Masing-Masing kertas yang sudah dipotong di point-2
                                    </label>

                                </div>
                                <div className='flex flex-col gap-2 col-span-2'>
                                    <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                        -
                                    </label>

                                </div>

                                <div className='flex justify-between  col-span-3'>
                                    <div className='flex flex-col  w-[60%]'>

                                        <div className='flex flex-col gap-1'>
                                            <label className='text-neutral-500 text-sm font-semibold '>
                                                Kiri
                                            </label>
                                            <label className='text-neutral-500 text-sm font-semibold '>
                                                {incoming?.inspeksi_bahan_result[2].hasil_kiri}
                                            </label>
                                            <label className='text-neutral-500 text-sm font-semibold pt-1'>
                                                Tengah
                                            </label>
                                            <label className='text-neutral-500 text-sm font-semibold '>
                                                {incoming?.inspeksi_bahan_result[2].hasil_tengah}
                                            </label>
                                            <label className='text-neutral-500 text-sm font-semibold pt-1'>
                                                Kanan
                                            </label>
                                            <label className='text-neutral-500 text-sm font-semibold '>
                                                {incoming?.inspeksi_bahan_result[2].hasil_kanan}
                                            </label>

                                        </div>

                                    </div>

                                    <div className='flex flex-col gap-1  w-[50%]'>

                                        <p className='text-neutral-500 text-sm font-semibold'>
                                            {incoming?.inspeksi_bahan_result[2].keterangan_hasil}
                                        </p>

                                    </div>

                                </div>
                                <label className='text-neutral-500 text-sm font-semibold flex justify-center'>
                                    15
                                </label>
                            </div>
                            <div className='grid grid-cols-10 bg-[#F5F5F5] px-10 py-4 border-b-8 border-[#D8EAFF]'>

                                <div className='col-span-4'>

                                    <div className="flex flex-col ">
                                        <p className="md:text-[14px] text-[9px] font-semibold">
                                            Upload Foto (Optional):
                                        </p>

                                        <br />
                                        <div className="">
                                            <input
                                                disabled
                                                type="file"
                                                name=""
                                                id=""
                                                className="w-60"
                                            />
                                        </div>
                                    </div>

                                </div>

                            </div>
                        </>
                        {/* =============================Point 4========================== */}
                        <>
                            <div className='grid grid-cols-12 px-3 py-4 gap-2 '>
                                <div className='flex gap-4 col-span-2'>
                                    <label className='text-neutral-500 text-sm font-semibold'>
                                        4
                                    </label>
                                    <label className='text-neutral-500 text-sm font-semibold'>
                                        Arah Serat
                                    </label>
                                </div>
                                <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                    Label Tercantum
                                </label>
                                <div className='flex flex-col gap-2 col-span-2'>
                                    <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                        Lihat Ukuran
                                    </label>

                                </div>
                                <div className='flex flex-col gap-2 col-span-2'>
                                    <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                        Sesuai arah serat di surat jalan
                                    </label>

                                </div>

                                <div className='flex justify-between  col-span-3'>
                                    <div className='flex flex-col  w-[60%]'>

                                        <p className='text-neutral-500 text-sm font-semibold'>
                                            {incoming?.inspeksi_bahan_result[3].hasil}
                                        </p>
                                    </div>
                                    <div className='flex flex-col gap-1  w-[50%]'>

                                        <p className='text-neutral-500 text-sm font-semibold'>
                                            {incoming?.inspeksi_bahan_result[3].keterangan_hasil}
                                        </p>
                                    </div>
                                </div>
                                <label className='text-neutral-500 text-sm font-semibold flex justify-center'>
                                    10
                                </label>
                            </div>
                            <div className='grid grid-cols-10 bg-[#F5F5F5] px-10 py-4 border-b-8 border-[#D8EAFF]'>

                                <div className='col-span-4'>

                                    <div className="flex flex-col ">
                                        <p className="md:text-[14px] text-[9px] font-semibold">
                                            Upload Foto (Optional):
                                        </p>

                                        <br />
                                        <div className="">
                                            <input
                                                disabled
                                                type="file"
                                                name=""
                                                id=""
                                                className="w-60"
                                            />
                                        </div>
                                    </div>

                                </div>

                            </div>
                        </>
                        {/* =============================Point 5========================== */}
                        <>
                            <div className='grid grid-cols-12 px-3 py-4 gap-2 '>
                                <div className='flex gap-4 col-span-2'>
                                    <label className='text-neutral-500 text-sm font-semibold'>
                                        5
                                    </label>
                                    <label className='text-neutral-500 text-sm font-semibold'>
                                        Coating Depan
                                    </label>
                                </div>
                                <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                    Kaca Pembesar
                                </label>
                                <div className='flex flex-col gap-2 col-span-2'>
                                    <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                        Lihat Ukuran
                                    </label>

                                </div>
                                <div className='flex flex-col gap-2 col-span-2'>
                                    <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                        Visual
                                    </label>

                                </div>

                                <div className='flex justify-between  col-span-3'>
                                    <div className='flex flex-col  w-[60%]'>


                                        <p className='text-neutral-500 text-sm font-semibold'>
                                            {incoming?.inspeksi_bahan_result[4].hasil}
                                        </p>

                                    </div>
                                    <div className='flex flex-col gap-1  w-[50%]'>
                                        <label className='text-neutral-500 text-sm font-semibold'>

                                            <div className='flex flex-col gap-1'>
                                                <p>
                                                    {incoming?.inspeksi_bahan_result[4]?.coating}
                                                </p>

                                            </div>
                                        </label>

                                        <p className='text-neutral-500 text-sm font-semibold'>
                                            {incoming?.inspeksi_bahan_result[4].keterangan_hasil}
                                        </p>


                                    </div>
                                </div>
                                <label className='text-neutral-500 text-sm font-semibold flex justify-center'>
                                    10
                                </label>
                            </div>
                            <div className='grid grid-cols-10 bg-[#F5F5F5] px-10 py-4 border-b-8 border-[#D8EAFF]'>

                                <div className='col-span-4'>
                                    <div className="flex flex-col ">

                                        <div className="flex flex-col ">
                                            <p className="md:text-[14px] text-[9px] font-semibold">
                                                Upload Foto (Optional):
                                            </p>

                                            <br />
                                            <div className="">
                                                <input
                                                    disabled
                                                    type="file"
                                                    name=""
                                                    id=""
                                                    className="w-60"
                                                />
                                            </div>
                                        </div>

                                    </div>
                                </div>

                            </div>
                        </>

                        {/* =============================Point 6========================== */}
                        <>
                            <div className='grid grid-cols-12 px-3 py-4 gap-2 '>
                                <div className='flex gap-4 col-span-2'>
                                    <label className='text-neutral-500 text-sm font-semibold'>
                                        6
                                    </label>
                                    <label className='text-neutral-500 text-sm font-semibold'>
                                        Ukuran
                                    </label>
                                </div>
                                <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                    Mistar/Penggaris
                                </label>
                                <div className='flex flex-col gap-2 col-span-2'>
                                    <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                        Diukur panjang dan lebar
                                    </label>

                                </div>
                                <div className='flex flex-col gap-2 col-span-2'>
                                    <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                        Sesuai size di surat jalan, toleransi tidak boleh &lt;= 2mm
                                    </label>

                                </div>

                                <div className='flex justify-between  col-span-3'>
                                    <div className='flex flex-col  w-[60%]'>

                                        <div className='flex flex-col gap-1 font-semibold text-sm'>
                                            <p>
                                                {incoming?.inspeksi_bahan_result[5]?.hasil}
                                            </p>

                                        </div>
                                    </div>
                                    <div className='flex flex-col gap-1  w-[50%]'>


                                        <p className='text-neutral-500 text-sm font-semibold'>
                                            {incoming?.inspeksi_bahan_result[5].keterangan_hasil}
                                        </p>

                                    </div>
                                </div>
                                <label className='text-neutral-500 text-sm font-semibold flex justify-center'>
                                    5
                                </label>
                            </div>
                            <div className='grid grid-cols-10 bg-[#F5F5F5] px-10 py-4 border-b-8 border-[#D8EAFF]'>

                                <div className='col-span-4'>
                                    <div className="flex flex-col ">

                                        <div className="flex flex-col ">
                                            <p className="md:text-[14px] text-[9px] font-semibold">
                                                Upload Foto (Optional):
                                            </p>

                                            <br />
                                            <div className="">
                                                <input
                                                    disabled
                                                    type="file"
                                                    name=""
                                                    id=""
                                                    className="w-60"
                                                />
                                            </div>
                                        </div>

                                    </div>
                                </div>

                            </div>
                        </>
                        {/* =============================Point 7========================== */}
                        <>
                            <div className='grid grid-cols-12 px-3 py-4 gap-2 '>
                                <div className='flex gap-4 col-span-2'>
                                    <label className='text-neutral-500 text-sm font-semibold'>
                                        7
                                    </label>
                                    <label className='text-neutral-500 text-sm font-semibold'>
                                        Gelombang
                                    </label>
                                </div>
                                <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                    Penggaris
                                </label>
                                <div className='flex flex-col gap-2 col-span-2'>
                                    <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                        Toleransi melengkung / gelombanng = &#xb1; 8mm
                                    </label>

                                </div>
                                <div className='flex flex-col gap-2 col-span-2'>
                                    <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                        -
                                    </label>

                                </div>

                                <div className='flex justify-between  col-span-3'>
                                    <div className='flex flex-col  w-[60%]'>
                                        <p className='text-neutral-500 text-sm font-semibold'>
                                            {incoming?.inspeksi_bahan_result[6].hasil}
                                        </p>

                                    </div>
                                    <div className='flex flex-col gap-1  w-[50%]'>


                                        <p className='text-neutral-500 text-sm font-semibold'>
                                            {incoming?.inspeksi_bahan_result[6].keterangan_hasil}
                                        </p>

                                    </div>
                                </div>
                                <label className='text-neutral-500 text-sm font-semibold flex justify-center'>
                                    5
                                </label>
                            </div>
                            <div className='grid grid-cols-10 bg-[#F5F5F5] px-10 py-4 border-b-8 border-[#D8EAFF]'>

                                <div className='col-span-4'>
                                    <div className="flex flex-col ">

                                        <div className="flex flex-col ">
                                            <p className="md:text-[14px] text-[9px] font-semibold">
                                                Upload Foto (Optional):
                                            </p>

                                            <br />
                                            <div className="">
                                                <input
                                                    disabled
                                                    type="file"
                                                    name=""
                                                    id=""
                                                    className="w-60"
                                                />
                                            </div>
                                        </div>

                                    </div>
                                </div>

                            </div>
                        </>
                        {/* =============================Point 8========================== */}
                        <>
                            <div className='grid grid-cols-12 px-3 py-4 gap-2 '>
                                <div className='flex gap-4 col-span-2'>
                                    <label className='text-neutral-500 text-sm font-semibold'>
                                        8
                                    </label>
                                    <label className='text-neutral-500 text-sm font-semibold'>
                                        Warna
                                    </label>
                                </div>
                                <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                    Color Tolerance / Sample
                                </label>
                                <div className='flex flex-col gap-2 col-span-2'>
                                    <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                        Visual
                                    </label>

                                </div>
                                <div className='flex flex-col gap-2 col-span-2'>
                                    <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                        Warna Dasar Sesuai
                                    </label>

                                </div>

                                <div className='flex justify-between  col-span-3'>
                                    <div className='flex flex-col  w-[60%]'>


                                        <p className='text-neutral-500 text-sm font-semibold'>
                                            {incoming?.inspeksi_bahan_result[7].hasil}
                                        </p>


                                    </div>
                                    <div className='flex flex-col gap-1  w-[50%]'>


                                        <p className='text-neutral-500 text-sm font-semibold'>
                                            {incoming?.inspeksi_bahan_result[7].keterangan_hasil}
                                        </p>

                                    </div>
                                </div>
                                <label className='text-neutral-500 text-sm font-semibold flex justify-center'>
                                    5
                                </label>
                            </div>
                            <div className='grid grid-cols-10 bg-[#F5F5F5] px-10 py-4 border-b-8 border-[#D8EAFF]'>

                                <div className='col-span-4'>
                                    <div className="flex flex-col ">

                                        <div className="flex flex-col ">
                                            <p className="md:text-[14px] text-[9px] font-semibold">
                                                Upload Foto (Optional):
                                            </p>

                                            <br />
                                            <div className="">
                                                <input
                                                    disabled
                                                    type="file"
                                                    name=""
                                                    id=""
                                                    className="w-60"
                                                />
                                            </div>
                                        </div>

                                    </div>
                                </div>

                            </div>
                        </>
                        {/* =============================Point 9========================== */}
                        <>
                            <div className='grid grid-cols-12 px-3 py-4 gap-2 '>
                                <div className='flex gap-4 col-span-2'>
                                    <label className='text-neutral-500 text-sm font-semibold'>
                                        9
                                    </label>
                                    <label className='text-neutral-500 text-sm font-semibold'>
                                        Quantity
                                    </label>
                                </div>
                                <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                    Hitung Manual
                                </label>
                                <div className='flex flex-col gap-2 col-span-2'>
                                    <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                        Sampling sesuai standard AQL
                                    </label>

                                </div>
                                <div className='flex flex-col gap-2 col-span-2'>
                                    <label className='text-neutral-500 text-sm font-semibold col-span-2'>
                                        Sesuai per pack
                                    </label>

                                </div>

                                <div className='flex justify-between  col-span-3'>
                                    <div className='flex flex-col  w-[60%]'>

                                        <p className='text-neutral-500 text-sm font-semibold'>
                                            {incoming?.inspeksi_bahan_result[8].hasil}
                                        </p>
                                    </div>
                                    <div className='flex flex-col gap-1  w-[50%]'>

                                        <p className='text-neutral-500 text-sm font-semibold'>
                                            {incoming?.inspeksi_bahan_result[8].keterangan_hasil}
                                        </p>

                                    </div>
                                </div>
                                <label className='text-neutral-500 text-sm font-semibold flex justify-center'>
                                    5
                                </label>
                            </div>
                            <div className='grid grid-cols-10 bg-[#F5F5F5] px-10 py-4 border-b-8 border-[#D8EAFF]'>

                                <div className='col-span-4'>
                                    <div className="flex flex-col ">

                                        <div className="flex flex-col ">
                                            <p className="md:text-[14px] text-[9px] font-semibold">
                                                Upload Foto (Optional):
                                            </p>

                                            <br />
                                            <div className="">
                                                <input
                                                    disabled
                                                    type="file"
                                                    name=""
                                                    id=""
                                                    className="w-60"
                                                />
                                            </div>
                                        </div>

                                    </div>
                                </div>

                            </div>
                        </>
                    </div >

                </main >
            )
            }
        </>
    )
}

export default HistoryIncoming