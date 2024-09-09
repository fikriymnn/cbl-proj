import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import convertTimeStampToDateOnly from '../../../../../utils/convertDateOnly';
import convertDateToTime from '../../../../../utils/converDateToTime';
import calculateElapsedTime from '../../../../../utils/calculateElapsedTime';
import formatElapsedTime from '../../../../../utils/formatElapsedTime';
import Loading from '../../../../Loading';

function CheckSheetBarangRS() {
    const { id } = useParams();
    const [isMobile, setIsMobile] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
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
            console.log(error);
            alert(error.response.data.msg);
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
            console.log(error.response.data.msg);
            alert(error.response.data.msg);
        }
    }

    async function tambahTaskCekAwal(id: number) {
        const url = `${import.meta.env.VITE_API_LINK
            }/qc/cs/inspeksiCetakAwalPoint/create`;
        try {
            setIsLoading(true);
            const res = await axios.post(
                url,
                {
                    id_inspeksi_cetak_awal: id,
                },
                {
                    withCredentials: true,
                },
            );
            setIsLoading(false);
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

    async function pendingCekAwal(id: number) {
        const url = `${import.meta.env.VITE_API_LINK
            }/qc/cs/inspeksiCetakAwal/pending/${id}`;
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
    const isOnprogres = cetakMesinAwal?.inspeksi_cetak_awal[0].inspeksi_cetak_awal_point.some((data: { status: any; }) => data?.status === 'on progress')

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
                            BARANG RUSAK SEBAGIAN
                        </p>

                        <div className="flex w-full border-b-8 border-[#D8EAFF] px-8 py-8">
                            <div className='flex w-[30%] '>
                                <div className="flex flex-col gap-2 ">
                                    <label className="text-neutral-500 text-sm font-semibold">
                                        Tanggal
                                    </label>
                                    <label className="text-neutral-500 text-sm font-semibold">
                                        No. JO
                                    </label>
                                    <label className="text-neutral-500 text-sm font-semibold">
                                        No. IO
                                    </label>
                                    <label className="text-neutral-500 text-sm font-semibold">
                                        Nama Produk
                                    </label>
                                    <label className="text-neutral-500 text-sm font-semibold">
                                        Customer
                                    </label>

                                </div>
                                <div className="flex flex-col gap-2 ">
                                    <label className="text-neutral-500 text-sm font-semibold">
                                        : {tanggal}
                                    </label>
                                    <label className="text-neutral-500 text-sm font-semibold">
                                        : {cetakMesinAwal?.jumlah_druk}
                                    </label>
                                    <label className="text-neutral-500 text-sm font-semibold">
                                        : {cetakMesinAwal?.jumlah_pcs}
                                    </label>
                                    <label className="text-neutral-500 text-sm font-semibold">
                                        : {cetakMesinAwal?.jenis_kertas}
                                    </label>
                                    <label className="text-neutral-500 text-sm font-semibold">
                                        : {cetakMesinAwal?.jenis_gramatur}
                                    </label>


                                </div>
                            </div>

                            <div className='flex w-[30%]'>
                                <div className="flex flex-col gap-2">
                                    <label className="text-neutral-500 text-sm font-semibold">
                                        Jam
                                    </label>
                                    <label className="text-neutral-500 text-sm font-semibold">
                                        QTY Rusak Sebagian
                                    </label>
                                    <label className="text-neutral-500 text-sm font-semibold">
                                        Waktu Sortir
                                    </label>

                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-neutral-500 text-sm font-semibold">
                                        : {jam}
                                    </label>

                                    <label className="text-neutral-500 text-sm font-semibold">
                                        : {cetakMesinAwal?.no_jo}
                                    </label>
                                    <label className="text-neutral-500 text-sm font-semibold">
                                        : {cetakMesinAwal?.nama_produk}
                                    </label>

                                </div>
                            </div>
                            <div className='flex w-[20%]'>
                                <div className="flex flex-col">
                                    <label className="text-neutral-500 text-sm font-semibold">
                                        Inspector
                                    </label>

                                </div>
                                <div className="flex flex-col">
                                    <label className="text-neutral-500 text-sm font-semibold">
                                        : {cetakMesinAwal?.shift}
                                    </label>

                                </div>
                            </div>
                            <div className='flex w-[20%] flex-col'>
                                <p className="md:text-[14px] text-[9px] font-semibold">
                                    Time :
                                </p>
                                <>
                                    {/* {data.status == 'incoming' ? ( */}
                                    <button
                                        // onClick={() => startTaskCekAwal(data.id)}
                                        className="flex w-[60%]  rounded-md bg-[#00B81D] justify-center items-center px-2 py-2 hover:cursor-pointer"
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
                                    {/* ) : null} */}
                                </>
                            </div>

                        </div>
                        <div className=' border-b-8 border-[#D8EAFF] px-6 py-6'>
                            <div className="grid grid-cols-12  ">
                                <div className='flex flex-col col-span-5'>
                                    <p className='text-blue-500 text-sm font-semibold'>
                                        KODE MASALAH
                                    </p>
                                    <p className='text-neutral-500 text-sm font-semibold'>
                                        C1.1
                                    </p>
                                </div>
                                <div className='flex flex-col col-span-4'>
                                    <p className='text-blue-500 text-sm font-semibold'>
                                        JENIS DEFECT YANG DITEMUKAN
                                    </p>
                                    <p className='text-neutral-500 text-sm font-semibold'>
                                        Warna (Mesin Cetak)
                                    </p>
                                </div>
                                <div className='flex flex-col col-span-3'>
                                    <>
                                        <label className="form-label block  text-black text-xs font-extrabold ">
                                            UPLOAD FOTO
                                        </label>

                                        <div className="flex  w-full mt-2 rounded-md border border-stroke px-2 py-2">
                                            <label
                                                htmlFor="formFile"
                                                className="flex items-center px-8 py-1 rounded-md bg-primary text-white font-medium cursor-pointer hover:bg-primary-dark"
                                            >
                                                Pilih File
                                                <input
                                                    type="file"
                                                    id="formFile"
                                                    accept="image/*"
                                                    className="hidden"
                                                />
                                            </label>

                                            <span id="formFile" className="ml-2 text-sm"></span>
                                        </div>
                                    </>

                                </div>
                            </div>
                            <p className='text-blue-500 text-sm font-semibold'>
                                QUANTITY TEMUAN
                            </p>
                            <div className="grid grid-cols-12  pt-2 gap-6">
                                <div className='flex flex-col col-span-2 gap-1'>
                                    <p className='text-neutral-500 text-sm font-semibold'>
                                        SETTING AWAL
                                    </p>
                                    <input type="text" className="w-full h-6 bg-white  rounded-sm  border-2 border-stroke">
                                    </input>
                                </div>
                                <div className='flex flex-col col-span-2 gap-1'>
                                    <p className='text-neutral-500 text-sm font-semibold'>
                                        DRUK AWAL
                                    </p>
                                    <input type="text" className="w-full h-6 bg-white  rounded-sm  border-2 border-stroke">
                                    </input>
                                </div>
                                <div className='flex flex-col col-span-2 gap-1'>
                                    <p className='text-neutral-500 text-sm font-semibold'>
                                        SUB TOTAL
                                    </p>
                                    <input type="text" disabled className="w-full h-6 bg-neutral-300  rounded-sm  border-2 border-stroke">
                                    </input>
                                </div>
                                <div className='flex flex-col col-span-6 gap-1'>
                                    <p className='text-neutral-500 text-sm font-semibold'>
                                        CATATAN <span className='text-red-500'>*</span> :
                                    </p>
                                    <input type="text" className="w-full h-6 bg-white  rounded-sm  border-2 border-stroke">
                                    </input>
                                </div>
                            </div>
                        </div>


                    </div>


                    {!isOnprogres &&
                        cetakMesinAwal?.inspeksi_cetak_awal[0].status == 'incoming' ||
                        cetakMesinAwal?.inspeksi_cetak_awal[0].status == 'pending' ? (
                        <>
                            <button
                                disabled={isLoading}
                                onClick={() =>
                                    tambahTaskCekAwal(cetakMesinAwal?.inspeksi_cetak_awal[0].id)
                                }
                                className=" w-[13%] h-10 rounded-sm bg-blue-600 text-white text-sm font-bold justify-center items-center px-4 py-2 hover:cursor-pointer"
                            >
                                {isLoading ? 'Loading...' : '+ Jenis Defect'}
                            </button>
                            {isLoading && <Loading />}
                        </>
                    ) : null}
                    <div className=' border-b-8 items-center border-[#D8EAFF] px-4 py-4 gap-3 bg-white rounded-b-xl mt-2'>
                        <div className='flex w-[80%] gap-4'>
                            <div className='flex flex-col'>
                                <p className='text-neutral-500 text-sm font-semibold'>
                                    SETTING AWAL
                                </p>
                                <input type="text" disabled className="w-full h-6 bg-neutral-300  rounded-sm  border-2 border-stroke">
                                </input>
                            </div>
                            <div className='flex flex-col'>
                                <p className='text-neutral-500 text-sm font-semibold'>
                                    DRUK AWAL
                                </p>
                                <input type="text" disabled className="w-full h-6 bg-neutral-300  rounded-sm  border-2 border-stroke">
                                </input>
                            </div>
                            <div className='flex flex-col'>
                                <p className='text-neutral-500 text-sm font-semibold'>
                                    SUB TOTAL
                                </p>
                                <input type="text" disabled className="w-full h-6 bg-neutral-300  rounded-sm  border-2 border-stroke">
                                </input>
                            </div>
                            <div className='flex flex-col'>
                                <p className='text-neutral-500 text-sm font-semibold'>
                                    BARANG BAIK
                                </p>
                                <input type="text" disabled className="w-full h-6 bg-neutral-300  rounded-sm  border-2 border-stroke">
                                </input>
                            </div>
                        </div>

                        <div className="flex w-full justify-between gap-8">
                            <div className='flex flex-col w-full'>
                                <label className="form-label block  text-black text-xs font-extrabold mt-3">
                                    CATATAN <span className='text-red-500'>*</span> :
                                </label>
                                <textarea

                                    className="peer w-full min-h-[80px]  resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                                ></textarea>
                            </div>
                            <div className="grid col-span-6 items-end justify-end gap-2">

                                {/* {!isOnprogres &&
                                    cetakMesinAwal?.inspeksi_cetak_awal[0].status == 'incoming' ||
                                    cetakMesinAwal?.inspeksi_cetak_awal[0].status == 'pending' ? ( */}
                                <button
                                    // onClick={() =>
                                    //     doneCekAwal(cetakMesinAwal?.inspeksi_cetak_awal[0].id)
                                    // }
                                    className=" w-full h-10 rounded-md bg-[#00B81D] text-white text-xs font-bold justify-center items-center px-10 py-2 hover:cursor-pointer"
                                >
                                    SIMPAN CHECKSHEET
                                </button>
                                {/* ) : null} */}
                            </div>
                        </div>
                    </div>
                </main>
            )}
        </>
    );
}

export default CheckSheetBarangRS;
