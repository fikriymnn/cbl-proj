import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import convertTimeStampToDateOnly from '../../../../../utils/convertDateOnly';
import convertDateToTime from '../../../../../utils/converDateToTime';
import calculateElapsedTime from '../../../../../utils/calculateElapsedTime';
import formatElapsedTime from '../../../../../utils/formatElapsedTime';
import X from '../../../../../images/icon/X2.svg';
import ok from '../../../../../images/icon/OKQC.svg';
import oktole from '../../../../../images/icon/okToleransiQC.svg';
import notok from '../../../../../images/icon/notOKQC.svg';

function CheckSheetCetakPeriode() {
    const { id } = useParams();
    const [isMobile, setIsMobile] = useState(false);

    const [cetakMesinAwal, setCetakMesinAwal] = useState<any>();

    useEffect(() => {
        getCetakMesinAwal();
    }, []);

    async function getCetakMesinAwal() {
        const url = `${import.meta.env.VITE_API_LINK}/qc/cs/inspeksiCetak/${id}`;
        try {
            const res = await axios.get(url, {
                withCredentials: true,
            });

            setCetakMesinAwal(res.data.data);
            console.log(res.data.data);
        } catch (error: any) {
            console.log(error.data.msg);
        }
    }

    async function startTaskCekAwal(id: number) {
        const url = `${import.meta.env.VITE_API_LINK
            }/qc/cs/inspeksiCetakAwalPoint/start/${id}`;
        try {
            const res = await axios.put(
                url,
                {},
                {
                    withCredentials: true,
                },
            );

            getCetakMesinAwal();
        } catch (error: any) {
            console.log(error.data.msg);
        }
    }

    async function stopTaskCekAwal(
        id: number,
        startTime: any,
        catatan: any,
        line_clearance: any,
        design: any,
        redaksi: any,
        barcode: any,
        jenis_bahan: any,
        gramatur: any,
        layout_pisau: any,
        acc_warna_awal_jalan: any,
    ) {
        const url = `${import.meta.env.VITE_API_LINK
            }/qc/cs/inspeksiCetakAwalPoint/stop/${id}`;
        try {
            const elapsedSeconds = calculateElapsedTime(startTime, new Date());
            console.log(elapsedSeconds);
            const res = await axios.put(
                url,
                {
                    catatan: catatan,
                    lama_pengerjaan: elapsedSeconds,
                    line_clearance: line_clearance,
                    design: design,
                    redaksi: redaksi,
                    barcode: barcode,
                    jenis_bahan: jenis_bahan,
                    gramatur: gramatur,
                    layout_pisau: layout_pisau,
                    acc_warna_awal_jalan: acc_warna_awal_jalan,
                },
                {
                    withCredentials: true,
                },
            );

            getCetakMesinAwal();
        } catch (error: any) {
            console.log(error.data.msg);
        }
    }

    async function tambahTaskCekAwal(id: number) {
        const url = `${import.meta.env.VITE_API_LINK
            }/qc/cs/inspeksiCetakAwalPoint/create`;
        try {
            const res = await axios.post(
                url,
                {
                    id_inspeksi_cetak_awal: id,
                },
                {
                    withCredentials: true,
                },
            );

            getCetakMesinAwal();
        } catch (error: any) {
            console.log(error.data.msg);
        }
    }

    async function doneCekAwal(id: number) {
        const url = `${import.meta.env.VITE_API_LINK
            }/qc/cs/inspeksiCetakAwal/done/${id}`;
        try {
            const res = await axios.put(
                url,
                {
                    id_inspeksi_cetak_awal: id,
                },
                {
                    withCredentials: true,
                },
            );

            getCetakMesinAwal();
        } catch (error: any) {
            console.log(error.data.msg);
        }
    }

    const handleChangePoint = (e: any, i: number) => {
        const { name, value } = e.target;
        const onchangeVal: any = cetakMesinAwal;
        onchangeVal.inspeksi_cetak_awal[0].inspeksi_cetak_awal_point[i][name] =
            value;
        setCetakMesinAwal(onchangeVal);
    };

    const tanggal = convertTimeStampToDateOnly(cetakMesinAwal?.tanggal);
    const jam = convertDateToTime(cetakMesinAwal?.tanggal);

    const jumlahWaktuCheck = formatElapsedTime(
        cetakMesinAwal?.inspeksi_cetak_awal[0].waktu_check,
    );

    const [filling, setFilling] = useState(false);

    return (
        <>
            {!isMobile && (
                <main className="overflow-x-hidden">
                    <div className="min-w-[700px] bg-white rounded-xl">
                        <p className="text-[14px] font-semibold w-full flex border-b-8 border-[#D8EAFF] py-4 px-9 md:ps-9 ps-12">
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                    d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12ZM13 8C13 8.55228 12.5523 9 12 9C11.4477 9 11 8.55228 11 8C11 7.44772 11.4477 7 12 7C12.5523 7 13 7.44772 13 8ZM13 17V11H11V17H13Z"
                                    fill="#0065DE"
                                />
                            </svg>{' '}
                            Printing Checksheet
                        </p>

                        <div className="grid grid-cols-12  border-b-8 border-[#D8EAFF]">
                            <div className="grid grid-rows-6 gap-2 col-span-2 pl-6 py-4 ">
                                <label className="text-neutral-500 text-sm font-semibold">
                                    Tanggal
                                </label>
                                <label className="text-neutral-500 text-sm font-semibold">
                                    Jumlah Druk
                                </label>
                                <label className="text-neutral-500 text-sm font-semibold">
                                    Jenis Kertas
                                </label>
                                <label className="text-neutral-500 text-sm font-semibold">
                                    Jenis Gramatur
                                </label>
                                <label className="text-neutral-500 text-sm font-semibold">
                                    Warna
                                </label>
                            </div>
                            <div className="grid grid-rows-6 gap-2 col-span-2  py-4">
                                <label className="text-neutral-500 text-sm font-semibold">
                                    : {tanggal}
                                </label>
                                <label className="text-neutral-500 text-sm font-semibold">
                                    : {cetakMesinAwal?.jumlah_druk}
                                </label>
                                <label className="text-neutral-500 text-sm font-semibold">
                                    : {cetakMesinAwal?.jenis_kertas}
                                </label>
                                <label className="text-neutral-500 text-sm font-semibold">
                                    : {cetakMesinAwal?.jenis_gramatur}
                                </label>

                                <div className="grid grid-cols-2">
                                    <label className="text-neutral-500 text-sm font-semibold flex">
                                        Depan
                                    </label>
                                    <label className="text-neutral-500 text-sm font-semibold">
                                        : {cetakMesinAwal?.warna_depan}
                                    </label>
                                </div>
                                <div className="grid grid-cols-2">
                                    <label className="text-neutral-500 text-sm font-semibold flex">
                                        Belakang
                                    </label>
                                    <label className="text-neutral-500 text-sm font-semibold">
                                        : {cetakMesinAwal?.warna_belakang}
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-rows-6  gap-2 col-span-2 justify-between px-10 py-4">
                                <label className="text-neutral-500 text-sm font-semibold">
                                    Jam
                                </label>
                                <label className="text-neutral-500 text-sm font-semibold"></label>
                                <label className="text-neutral-500 text-sm font-semibold">
                                    No. JO / IO
                                </label>
                                <label className="text-neutral-500 text-sm font-semibold">
                                    Nama Produk
                                </label>
                                <label className="text-neutral-500 text-sm font-semibold">
                                    Customer
                                </label>
                            </div>
                            <div className="grid grid-rows-6  gap-2 col-span-2 justify-between px-2 py-4">
                                <label className="text-neutral-500 text-sm font-semibold">
                                    : {jam}
                                </label>
                                <label className="text-neutral-500 text-sm font-semibold"></label>
                                <label className="text-neutral-500 text-sm font-semibold">
                                    : {cetakMesinAwal?.no_jo}
                                </label>
                                <label className="text-neutral-500 text-sm font-semibold">
                                    : {cetakMesinAwal?.nama_produk}
                                </label>
                                <label className="text-neutral-500 text-sm font-semibold">
                                    : {cetakMesinAwal?.customer}
                                </label>
                            </div>
                            <div className="grid grid-rows-6  gap-2 col-span-2 justify-between px-10 py-4">
                                <label className="text-neutral-500 text-sm font-semibold">
                                    Shift
                                </label>

                                <label className="text-neutral-500 text-sm font-semibold">
                                    Mesin
                                </label>
                                <label className="text-neutral-500 text-sm font-semibold">
                                    Operator
                                </label>
                                <label className="text-neutral-500 text-sm font-semibold">
                                    Status
                                </label>
                            </div>
                            <div className="grid grid-rows-6  gap-2 col-span-2 justify-between px-2 py-4">
                                <label className="text-neutral-500 text-sm font-semibold">
                                    : {cetakMesinAwal?.shift}
                                </label>
                                <label className="text-neutral-500 text-sm font-semibold">
                                    : {cetakMesinAwal?.mesin}
                                </label>
                                <label className="text-neutral-500 text-sm font-semibold">
                                    : {cetakMesinAwal?.opeator}
                                </label>
                                <label className="text-neutral-500 text-sm font-semibold">
                                    : {cetakMesinAwal?.status}
                                </label>
                            </div>
                        </div>

                        {/* =============================chekcsheet========================= */}

                        <>
                            <div className="flex flex-col py-6 px-10 border-b-8 border-[#D8EAFF]">
                                <div className=" px-3   gap-2 flex w-full justify-between">
                                    <label className="text-neutral-500 text-sm font-semibold ">
                                        CEK PERIODE
                                    </label>

                                    <label className='text-blue-400 text-sm font-semibold' onClick={() => setFilling(!filling)}>
                                        FILLING  GUIDE
                                    </label>
                                    {filling == true ? (
                                        <div className=" absolute right-6 rounded-md bg-[#F3F3F3] border-gray flex w-[96%] px-10 py-6 justify-between">
                                            <div className='grid grid-cols-2'>
                                                <div className='flex flex-col'>
                                                    <label className='text-blue-600 text-sm font-semibold pb-6'>
                                                        KODE-MASALAH
                                                    </label>
                                                    <label className='text-neutral-500 text-sm font-semibold'>
                                                        C1.1 - Warna (Dari Cetak)
                                                    </label>
                                                    <label className='text-neutral-500 text-sm font-semibold'>
                                                        C1.2 - Warna (Dari Cetak)
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-start w-[30%]">
                                                <div className='flex flex-col gap-3'>
                                                    <label className='text-blue-600 text-sm font-semibold pb-6'>
                                                        FORM FILLING GUIDE
                                                    </label>
                                                    <label className='text-black text-sm font-semibold flex gap-2'>
                                                        <img src={ok} className='w-5'></img>OK
                                                    </label>
                                                    <label className='text-black text-sm font-semibold flex gap-2'>
                                                        <img src={oktole} className='w-5'></img>OK (Toleransi)
                                                    </label>
                                                    <label className='text-black text-sm font-semibold flex gap-2'>
                                                        <img src={notok} className='w-5'></img>NOT OK
                                                    </label>
                                                </div>


                                                <img
                                                    onClick={() => setFilling(!filling)}
                                                    src={X}
                                                    alt=""
                                                    className="mx-3 w-7  text-blue-600 bg-blue-600 px-1 py-1 rounded-full"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                        </>
                                    )}


                                </div>

                            </div>
                        </>
                        <div className="flex px-5 py-5 gap-7">
                            <label className='text-sm font-semibold'>
                                1
                            </label>
                            <div className='flex flex-col gap-1'>
                                <label className='text-sm font-semibold'>
                                    INSPEKTOR
                                </label>
                                <label className='text-sm font-semibold'>
                                    John Carney
                                </label>
                            </div>
                            <div className='flex flex-col gap-1'>
                                <label className='text-sm font-semibold'>
                                    WAKTU SAMPLING
                                </label>
                                <label className='text-sm font-semibold'>
                                    10:30
                                </label>
                            </div>
                            <div className='flex flex-col gap-1'>
                                <label className='text-sm font-semibold'>
                                    NUMERATOR<span className='text-red-600'>*</span>
                                </label>
                                <input type="text" className='text-sm font-semibold w-[90%] border-stroke border'>

                                </input>
                            </div>

                            <div className='flex flex-col gap-1'>
                                <label className='text-sm font-semibold'>
                                    WAKTU SAMPLING<span className='text-red-600'>*</span>
                                </label>
                                <input type="text" className='text-sm font-semibold w-[90%] border-stroke border'>

                                </input>
                            </div>
                            <>
                                <div className="flex flex-col ">
                                    <p className="md:text-[14px] text-[9px] font-semibold">
                                        Upload Foto (Optional):
                                    </p>
                                    <div className="">
                                        <input

                                            type="file"
                                            name=""
                                            id=""
                                            className="w-60"
                                        />
                                    </div>
                                </div>
                            </>
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
                                            // onClick={() => {
                                            //     startTask(incoming?.id);
                                            // }}
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
                        </div>

                        <div className="flex overflow-x-scroll border-b-8 border-[#D8EAFF]">
                            <div className="flex flex-col w-[120px] justify-center py-4 bg-white items-center gap-2">
                                <label className="text-center text-[#6c6b6b] text-sm font-semibold">
                                    C1.1
                                </label>
                                <select className='w-[80%] bg-white '>
                                    <option></option>
                                </select>
                            </div>
                            <div className="flex flex-col w-[120px] justify-center py-4 bg-[#f3f3f3] items-center gap-2">
                                <label className="text-center text-[#6c6b6b] text-sm font-semibold">
                                    C1.2
                                </label>
                                <select className='w-[80%] bg-[#f3f3f3]'>
                                    <option></option>
                                </select>
                            </div>
                        </div>


                    </div>

                    <button

                        className=" w-[16%] h-10 rounded-sm bg-blue-600 text-white text-sm font-bold justify-center items-center px-4 py-2 hover:cursor-pointer"
                    >
                        + Periode Check
                    </button>

                    <div className="grid grid-cols-10 border-b-8 items-center border-[#D8EAFF] px-4 py-4 gap-3 bg-white rounded-b-xl mt-2">
                        {/* <label className=" text-[#6c6b6b] text-sm font-semibold col-span-2">
                            Jumlah Periode Check :{' '}
                            {cetakMesinAwal?.inspeksi_cetak_awal[0].jumlah_periode}
                        </label>
                        <label className=" text-[#6c6b6b] text-sm font-semibold col-span-2">
                            Waktu Check : {jumlahWaktuCheck}
                        </label> */}
                        <div className="grid col-span-8">
                            <label className=" text-[#6c6b6b] text-sm font-semibold">
                                Catatan<span className="text-red-500">*</span> :
                            </label>
                            <textarea

                                className="peer  resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                            ></textarea>
                        </div>
                        <div className="grid col-span-2 items-end justify-end">
                            {/* {cetakMesinAwal?.inspeksi_cetak_awal[0].status == 'incoming' ? (*/}
                            <button
                                // onClick={() =>
                                //     doneCekAwal(cetakMesinAwal?.inspeksi_cetak_awal[0].id)
                                // } 
                                className=" w-full h-10 rounded-sm bg-[#00B81D] text-white text-xs font-bold justify-center items-center px-10 py-2 hover:cursor-pointer"
                            >
                                SIMPAN PERIODE
                            </button>
                            {/* ) : null} */}
                        </div>
                    </div>
                </main >
            )
            }
        </>
    );
}

export default CheckSheetCetakPeriode;
