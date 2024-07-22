import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';



function IncomingInspection() {
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

            setIncoming(res.data.data);
            console.log(res.data.data);
        } catch (error: any) {
            console.log(error.data.msg);
        }
    }

    async function startTask(id: any) {
        const url = `${import.meta.env.VITE_API_LINK}/qc/cs/inspeksiBahan/start/${id}`;


        try {
            const res = await axios.get(url, {
                withCredentials: true,
            });

            getInspection();
        } catch (error: any) {
            console.log(error);
        }
    }

    async function stopTask(id: any) {
        const url = `${import.meta.env.VITE_API_LINK}/qc/cs/inspeksiBahan/stop/${id}`;
        try {
            const res = await axios.get(url, {
                withCredentials: true,
            });

            getInspection();
        } catch (error: any) {
            console.log(error);
        }
    }

    async function sumbitPoint1(objek: any) {
        alert(objek.keterangan_hasil)
        const url = `${import.meta.env.VITE_API_LINK}/qc/cs/inspeksiBahanResult/${objek.id}`;
        try {
            const res = await axios.put(url,
                {
                    ...objek
                }

                ,
                {

                    withCredentials: true,
                });
            console.log(objek.id)
            getInspection();
        } catch (error: any) {
            console.log(error);
        }
    }

    function convertDatetimeToDate(datetime: any) {
        const dateObject = new Date(datetime);
        const day = dateObject
            .getDate()
            .toString()
            .padStart(2, '0'); // Ensure two-digit day
        const month = (dateObject.getMonth() + 1)
            .toString()
            .padStart(2, '0'); // Adjust for zero-based month
        const year = dateObject.getFullYear();
        const hours = dateObject
            .getHours()
            .toString()
            .padStart(2, '0');
        const minutes = dateObject
            .getMinutes()
            .toString()
            .padStart(2, '0');

        return `${year}/${month}/${day} `; // Example format (YYYY-MM-DD)
    }

    // const tanggal = convertDatetimeToDate(new Date());

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
                                    : <input type='text' className='rounded-[3px]  border border-zinc-300' />
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
                                    : <input type='text' className='rounded-[3px] w-[50%] border border-zinc-300' />
                                </label>


                            </div>
                            <div className='flex flex-col h-full w-full items-center justify-end gap-2  py-4 col-span-2  bg-[#F6FAFF]'>
                                {incoming?.waktu_mulai == null &&
                                    incoming?.waktu_selesai == null && (
                                        <>
                                            <div>
                                                <p className="md:text-[14px] text-[9px] font-semibold">
                                                    Time : -

                                                </p>
                                                <>
                                                    <p className='font-bold text-[#DE0000]'>
                                                        Task Belum Dimulai
                                                    </p>
                                                    <button
                                                        onClick={() => {
                                                            startTask(incoming?.id);
                                                        }}
                                                        className="flex w-full  rounded-md bg-[#00B81D] justify-center items-center px-2 py-2 hover:cursor-pointer"
                                                    >
                                                        <svg
                                                            width="14"
                                                            height="14"
                                                            viewBox="0 0 14 14"
                                                            fill="none"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                        >
                                                            <path
                                                                d="M12.7645 4.95136L3.63887 0.27536C1.96704 -0.581285 0 0.664567 0 2.58008V11.4199C0 13.3354 1.96704 14.5813 3.63887 13.7246L12.7645 9.04864C14.4118 8.20456 14.4118 5.79544 12.7645 4.95136Z"
                                                                fill="white"
                                                            />
                                                        </svg>
                                                    </button>
                                                </>

                                            </div>
                                        </>
                                    )
                                }
                                {incoming?.waktu_mulai != null &&
                                    incoming?.waktu_selesai == null && (
                                        <>
                                            <div>
                                                <p className="md:text-[14px] text-[9px] font-semibold">
                                                    Time : -

                                                </p>
                                                <>
                                                    <p className='font-bold text-[#00B81D]'>
                                                        Task Sudah Dimulai
                                                    </p>
                                                    <button
                                                        onClick={() => {
                                                            stopTask(incoming?.id);
                                                        }}
                                                        className="flex w-full  rounded-md bg-[#DE0000] justify-center items-center px-2 py-2 hover:cursor-pointer"
                                                    >
                                                        <svg
                                                            width="14"
                                                            height="14"
                                                            viewBox="0 0 14 14"
                                                            fill="none"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                        >
                                                            <path
                                                                d="M12.7645 4.95136L3.63887 0.27536C1.96704 -0.581285 0 0.664567 0 2.58008V11.4199C0 13.3354 1.96704 14.5813 3.63887 13.7246L12.7645 9.04864C14.4118 8.20456 14.4118 5.79544 12.7645 4.95136Z"
                                                                fill="white"
                                                            />
                                                        </svg>
                                                    </button>
                                                </>

                                            </div>
                                        </>
                                    )
                                }
                                {incoming?.waktu_mulai != null &&
                                    incoming?.waktu_selesai != null && (
                                        <>
                                            <div>
                                                <p className="md:text-[14px] text-[9px] font-semibold">
                                                    Time :

                                                </p>
                                            </div>
                                        </>
                                    )
                                }

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



                        <>
                            {/* =============================================Checksheet Not Start==========================================================*/}
                            {incoming?.waktu_mulai == null &&
                                incoming?.waktu_selesai == null && (
                                    <>
                                        <div className='flex px-4 py-5'>
                                            <p className='font-bold text-[#00B81D]'>
                                                Mulai Task Untuk Memunculkan Checksheet
                                            </p>
                                        </div>

                                    </>
                                )}

                            {/* =============================================Checksheet Start==========================================================*/}
                            {incoming?.waktu_mulai != null &&
                                incoming?.waktu_selesai == null && (
                                    <>
                                        <>
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

                                                            {!incoming?.inspeksi_bahan_result[0]?.send ? (
                                                                <>
                                                                    <select onChange={(e) => {
                                                                        let array = [...incoming?.inspeksi_bahan_result]
                                                                        array[0].hasil = e.target.value
                                                                        setIncoming({ ...incoming, inspeksi_bahan_result: array })
                                                                    }}>
                                                                        <option disabled selected> Select Result</option>
                                                                        <option value={'DUPLEX'}>
                                                                            DUPLEX
                                                                        </option>
                                                                        <option value={'IVORY'}>
                                                                            IVORY
                                                                        </option>
                                                                        <option value={'ART PAPER'}>
                                                                            ART PAPER
                                                                        </option>
                                                                        <option value={'HVS'}>
                                                                            HVS
                                                                        </option>
                                                                    </select>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    {incoming?.inspeksi_bahan_result[0]?.hasil}
                                                                </>
                                                            )
                                                            }

                                                        </label>
                                                        <div className='flex flex-col gap-1 pr-[10%]'>
                                                            {!incoming?.inspeksi_bahan_result[0]?.send ? (
                                                                <>
                                                                    <div>
                                                                        <input
                                                                            onChange={(e) => {
                                                                                let array = [...incoming?.inspeksi_bahan_result]
                                                                                array[0].keterangan_hasil = e.target.value
                                                                                setIncoming({ ...incoming, inspeksi_bahan_result: array })
                                                                            }}
                                                                            type="radio" id="sesuai1" name="sesuai1" value="sesuai" />
                                                                        <label>Sesuai</label>
                                                                    </div>
                                                                    <div>
                                                                        <input
                                                                            onChange={(e) => {
                                                                                let array = [...incoming?.inspeksi_bahan_result]
                                                                                array[0].keterangan_hasil = e.target.value
                                                                                setIncoming({ ...incoming, inspeksi_bahan_result: array })
                                                                            }}
                                                                            type="radio" id="sesuai2" name="sesuai1" value="tidak sesuai" />
                                                                        <label>Tidak Sesuai</label>
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    {incoming?.inspeksi_bahan_result[0].keterangan_hasil}
                                                                </>
                                                            )}



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

                                                                    type="file"
                                                                    name=""
                                                                    id=""
                                                                    className="w-60"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className='col-span-6 justify-end  w-full h-full flex items-center'>
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault()
                                                                sumbitPoint1(incoming?.inspeksi_bahan_result[0]);
                                                            }}
                                                            className="flex w-[30%] h-[50%] text-white font-semibold rounded-md bg-blue-600 justify-center items-center px-2 py-2 hover:cursor-pointer"
                                                        >
                                                            Simpan
                                                        </button>
                                                    </div>

                                                </div>
                                            </form>
                                        </>
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
                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            Kiri
                                                        </label>
                                                        <input type='text' className='border-2 border-stroke w-[80%] rounded-sm' />
                                                        <label className='text-neutral-500 text-sm font-semibold pt-1'>
                                                            Tengah
                                                        </label>
                                                        <input type='text' className='border-2 border-stroke w-[80%] rounded-sm' />
                                                        <label className='text-neutral-500 text-sm font-semibold pt-1'>
                                                            Kanan
                                                        </label>
                                                        <input type='text' className='border-2 border-stroke w-[80%] rounded-sm' />
                                                        <label className='text-neutral-500 text-sm font-semibold pt-1'>
                                                            Rata-Rata
                                                        </label>
                                                        <input type='text' disabled className='border-2 border-stroke w-[80%] rounded-sm' />

                                                    </div>
                                                    <div className='flex flex-col gap-1  w-[50%]'>
                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            <input type='checkbox' />Sesuai
                                                        </label>
                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            <input type='checkbox' className='' />Tidak Sesuai
                                                        </label>
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
                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            Kiri
                                                        </label>
                                                        <input type='text' className='border-2 border-stroke w-[80%] rounded-sm' />
                                                        <label className='text-neutral-500 text-sm font-semibold pt-1'>
                                                            Tengah
                                                        </label>
                                                        <input type='text' className='border-2 border-stroke w-[80%] rounded-sm' />
                                                        <label className='text-neutral-500 text-sm font-semibold pt-1'>
                                                            Kanan
                                                        </label>
                                                        <input type='text' className='border-2 border-stroke w-[80%] rounded-sm' />


                                                    </div>
                                                    <div className='flex flex-col gap-1  w-[50%]'>
                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            <input type='checkbox' />Sesuai
                                                        </label>
                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            <input type='checkbox' className='' />Tidak Sesuai
                                                        </label>
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

                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            <input type='checkbox' />Panjang
                                                        </label>
                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            <input type='checkbox' className='' />Pendek
                                                        </label>
                                                    </div>
                                                    <div className='flex flex-col gap-1  w-[50%]'>
                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            <input type='checkbox' />Sesuai
                                                        </label>
                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            <input type='checkbox' className='' />Tidak Sesuai
                                                        </label>
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

                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            <input type='checkbox' />Ok
                                                        </label>
                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            <input type='checkbox' className='' />Not Ok
                                                        </label>
                                                    </div>
                                                    <div className='flex flex-col gap-1  w-[50%]'>
                                                        <label className='text-neutral-500 text-sm font-semibold'>
                                                            <select >
                                                                <option> Select Coating</option>

                                                            </select>
                                                        </label>
                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            <input type='checkbox' />Sesuai
                                                        </label>
                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            <input type='checkbox' className='' />Tidak Sesuai
                                                        </label>
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

                                                        <label className='text-neutral-500 text-sm font-semibold'>
                                                            <select className='w-[80%]'>
                                                                <option> Select </option>

                                                            </select>
                                                        </label>
                                                    </div>
                                                    <div className='flex flex-col gap-1  w-[50%]'>

                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            <input type='checkbox' />Sesuai
                                                        </label>
                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            <input type='checkbox' className='' />Tidak Sesuai
                                                        </label>
                                                    </div>
                                                </div>
                                                <label className='text-neutral-500 text-sm font-semibold flex justify-center'>
                                                    5
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

                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            <input type='checkbox' />Toleransi
                                                        </label>
                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            <input type='checkbox' className='' />Not Toleransi
                                                        </label>
                                                    </div>
                                                    <div className='flex flex-col gap-1  w-[50%]'>

                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            <input type='checkbox' />Sesuai
                                                        </label>
                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            <input type='checkbox' className='' />Tidak Sesuai
                                                        </label>
                                                    </div>
                                                </div>
                                                <label className='text-neutral-500 text-sm font-semibold flex justify-center'>
                                                    5
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

                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            <input type='checkbox' />Ok
                                                        </label>
                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            <input type='checkbox' className='' />Not Ok
                                                        </label>
                                                    </div>
                                                    <div className='flex flex-col gap-1  w-[50%]'>

                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            <input type='checkbox' />Sesuai
                                                        </label>
                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            <input type='checkbox' className='' />Tidak Sesuai
                                                        </label>
                                                    </div>
                                                </div>
                                                <label className='text-neutral-500 text-sm font-semibold flex justify-center'>
                                                    5
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

                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            <input type='checkbox' />Ok
                                                        </label>
                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            <input type='checkbox' className='' />Not Ok
                                                        </label>
                                                    </div>
                                                    <div className='flex flex-col gap-1  w-[50%]'>

                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            <input type='checkbox' />Sesuai
                                                        </label>
                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            <input type='checkbox' className='' />Tidak Sesuai
                                                        </label>
                                                    </div>
                                                </div>
                                                <label className='text-neutral-500 text-sm font-semibold flex justify-center'>
                                                    5
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
                                    </>
                                )}
                            {/* =============================================Checksheet Stop==========================================================*/}
                            {incoming?.waktu_mulai != null &&
                                incoming?.waktu_selesai != null && (
                                    <>
                                        <>
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
                                                        <select >
                                                            <option> Select Result</option>

                                                        </select>
                                                    </label>
                                                    <div className='flex flex-col gap-1 pr-[10%]'>
                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            <input type='checkbox' />Sesuai
                                                        </label>
                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            <input type='checkbox' />Tidak Sesuai
                                                        </label>
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
                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            Kiri
                                                        </label>
                                                        <input type='text' className='border-2 border-stroke w-[80%] rounded-sm' />
                                                        <label className='text-neutral-500 text-sm font-semibold pt-1'>
                                                            Tengah
                                                        </label>
                                                        <input type='text' className='border-2 border-stroke w-[80%] rounded-sm' />
                                                        <label className='text-neutral-500 text-sm font-semibold pt-1'>
                                                            Kanan
                                                        </label>
                                                        <input type='text' className='border-2 border-stroke w-[80%] rounded-sm' />
                                                        <label className='text-neutral-500 text-sm font-semibold pt-1'>
                                                            Rata-Rata
                                                        </label>
                                                        <input type='text' disabled className='border-2 border-stroke w-[80%] rounded-sm' />

                                                    </div>
                                                    <div className='flex flex-col gap-1  w-[50%]'>
                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            <input type='checkbox' />Sesuai
                                                        </label>
                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            <input type='checkbox' className='' />Tidak Sesuai
                                                        </label>
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
                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            Kiri
                                                        </label>
                                                        <input type='text' className='border-2 border-stroke w-[80%] rounded-sm' />
                                                        <label className='text-neutral-500 text-sm font-semibold pt-1'>
                                                            Tengah
                                                        </label>
                                                        <input type='text' className='border-2 border-stroke w-[80%] rounded-sm' />
                                                        <label className='text-neutral-500 text-sm font-semibold pt-1'>
                                                            Kanan
                                                        </label>
                                                        <input type='text' className='border-2 border-stroke w-[80%] rounded-sm' />


                                                    </div>
                                                    <div className='flex flex-col gap-1  w-[50%]'>
                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            <input type='checkbox' />Sesuai
                                                        </label>
                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            <input type='checkbox' className='' />Tidak Sesuai
                                                        </label>
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

                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            <input type='checkbox' />Panjang
                                                        </label>
                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            <input type='checkbox' className='' />Pendek
                                                        </label>
                                                    </div>
                                                    <div className='flex flex-col gap-1  w-[50%]'>
                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            <input type='checkbox' />Sesuai
                                                        </label>
                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            <input type='checkbox' className='' />Tidak Sesuai
                                                        </label>
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

                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            <input type='checkbox' />Ok
                                                        </label>
                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            <input type='checkbox' className='' />Not Ok
                                                        </label>
                                                    </div>
                                                    <div className='flex flex-col gap-1  w-[50%]'>
                                                        <label className='text-neutral-500 text-sm font-semibold'>
                                                            <select >
                                                                <option> Select Coating</option>

                                                            </select>
                                                        </label>
                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            <input type='checkbox' />Sesuai
                                                        </label>
                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            <input type='checkbox' className='' />Tidak Sesuai
                                                        </label>
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

                                                        <label className='text-neutral-500 text-sm font-semibold'>
                                                            <select className='w-[80%]'>
                                                                <option> Select </option>

                                                            </select>
                                                        </label>
                                                    </div>
                                                    <div className='flex flex-col gap-1  w-[50%]'>

                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            <input type='checkbox' />Sesuai
                                                        </label>
                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            <input type='checkbox' className='' />Tidak Sesuai
                                                        </label>
                                                    </div>
                                                </div>
                                                <label className='text-neutral-500 text-sm font-semibold flex justify-center'>
                                                    5
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

                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            <input type='checkbox' />Toleransi
                                                        </label>
                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            <input type='checkbox' className='' />Not Toleransi
                                                        </label>
                                                    </div>
                                                    <div className='flex flex-col gap-1  w-[50%]'>

                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            <input type='checkbox' />Sesuai
                                                        </label>
                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            <input type='checkbox' className='' />Tidak Sesuai
                                                        </label>
                                                    </div>
                                                </div>
                                                <label className='text-neutral-500 text-sm font-semibold flex justify-center'>
                                                    5
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

                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            <input type='checkbox' />Ok
                                                        </label>
                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            <input type='checkbox' className='' />Not Ok
                                                        </label>
                                                    </div>
                                                    <div className='flex flex-col gap-1  w-[50%]'>

                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            <input type='checkbox' />Sesuai
                                                        </label>
                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            <input type='checkbox' className='' />Tidak Sesuai
                                                        </label>
                                                    </div>
                                                </div>
                                                <label className='text-neutral-500 text-sm font-semibold flex justify-center'>
                                                    5
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

                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            <input type='checkbox' />Ok
                                                        </label>
                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            <input type='checkbox' className='' />Not Ok
                                                        </label>
                                                    </div>
                                                    <div className='flex flex-col gap-1  w-[50%]'>

                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            <input type='checkbox' />Sesuai
                                                        </label>
                                                        <label className='text-neutral-500 text-sm font-semibold '>
                                                            <input type='checkbox' className='' />Tidak Sesuai
                                                        </label>
                                                    </div>
                                                </div>
                                                <label className='text-neutral-500 text-sm font-semibold flex justify-center'>
                                                    5
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
                                    </>
                                )}

                        </>
                    </div>
                    {incoming?.waktu_mulai != null &&
                        incoming?.waktu_selesai != null && (
                            <>
                                <div className='bg-white flex w-full justify-between px-4 py-4'>

                                    <div className='flex flex-col'>
                                        <label className='text-neutral-500 text-sm font-semibold '>
                                            <input type='checkbox' className='rounded-full' /> {' '}DITERIMA
                                        </label>
                                        <label className='text-neutral-500 text-sm font-semibold '>
                                            <input type='checkbox' className='' /> {' '}DITOLAK
                                        </label>
                                    </div>
                                    <div>
                                        <button className='bg-[#0065DE] px-4 py-2 rounded-sm text-center text-white text-xs font-bold'>
                                            SUBMIT CHECKSHEET
                                        </button>
                                    </div>


                                </div>
                            </>
                        )}

                </main >
            )
            }

        </>
    )
}

export default IncomingInspection