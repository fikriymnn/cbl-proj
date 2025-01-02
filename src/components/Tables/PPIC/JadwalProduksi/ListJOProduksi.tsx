import React, { useEffect, useState } from 'react'
import ModalXL from './ModalXL';
import ModalKosongan from '../../../Modals/Qc/NCR/NCRResponQC';
import ModalKosonganSmall from '../../../Modals/ModalKosonganSmall';
import axios from 'axios';
import Loading from '../../../Loading';
import convertTimeStampToDate from '../../../../utils/convertDate';

function ListJOProduksi() {

    const [isLoading, setIsLoading] = useState(false);
    const [listJO, setJo] = useState<any>();
    const [hasilKalkulasi, setHasilKalkulasi] = useState<any>();
    useEffect(() => {
        getmasterKategori()
    }, []);


    async function getKalkulasi(id: any) {
        const url = `${import.meta.env.VITE_API_LINK}/ppic/calculateJadwalProduksi/${id}`;
        try {
            setIsLoading(true)
            const res = await axios.get(url, {
                withCredentials: true,
            });
            setIsLoading(false)
            setHasilKalkulasi(res.data)
            console.log('Kalkulasi', res.data);
        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }

    async function getmasterKategori() {
        const url = `${import.meta.env.VITE_API_LINK}/ppic/jadwalProduksi`;
        try {
            setIsLoading(true)
            const res = await axios.get(url, {
                withCredentials: true,
            });
            setIsLoading(false)
            setJo(res.data)
            console.log('listJO', res.data);
        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }
    const [activeComponent, setActiveComponent] = useState('component1');

    const showComponent1 = () => {
        setActiveComponent('component1');
    };

    const showComponent2 = () => {
        setActiveComponent('component2');
    };

    const [showListJo, setShowListJo] = useState(false);
    const openModalListJo = () => setShowListJo(true);
    const closeModalListJo = () => setShowListJo(false);


    const [showCalculate, setShowCalculate] = useState<any>([]);
    const openCalculate = (i: any) => {
        const onchangeVal: any = [...showCalculate];
        onchangeVal[i] = true;

        setShowCalculate(onchangeVal);
    };
    const closeCalculate = (i: any) => {
        const onchangeVal: any = [...showCalculate];
        onchangeVal[i] = false;

        setShowCalculate(onchangeVal);
    };
    return (
        <main className="overflow-x-scroll ' ">
            {isLoading && <Loading />}
            <div className="min-w-[700px]  bg-[#D8EAFF] rounded-xl flex gap-1 ">
                {activeComponent === 'component1' ? (
                    <>
                        <div className='flex w-[97%] flex-col bg-[#D8EAFF]'>
                            <div className="grid grid-cols-10 w-full md:gap-4 gap-1  px-4 py-4 md:mt-0  rounded-md bg-[#D8EAFF] mb-2">
                                <div className='col-span-8 gap-2 flex flex-col'>
                                    <p className="my-auto text-sm text-primary font-semibold">
                                        Pilih Tanggal
                                    </p>
                                    <div className="flex md:max-w-[30%] max-w-[60%] gap-2 justify-between">
                                        <p className="text-sm text-primary font-semibold ">
                                            Dari :
                                        </p>

                                        <input
                                            className='rounded-md bg-white px-2'
                                            type="date"

                                        ></input>

                                    </div>
                                    <div className="flex  md:max-w-[30%] max-w-[60%] gap-2 justify-between">
                                        <p className="text-sm text-primary font-semibold ">
                                            Sampai :
                                        </p>

                                        <input
                                            className='rounded-md bg-white px-2'
                                            type="date"

                                        ></input>

                                    </div>
                                </div>
                                <div className="flex justify-end col-span-2">
                                    <button
                                        onClick={() => openModalListJo()}
                                        className="bg-primary text-white px-5 py-2 rounded-md my-auto "
                                    >
                                        Booking
                                    </button>
                                    {showListJo == true && (
                                        <>
                                            <ModalKosonganSmall
                                                isOpen={showListJo}
                                                onClose={() => closeModalListJo()}
                                                judul={'Booking'}
                                            >
                                                <>
                                                    <div className="grid grid-cols-12 w-full md:gap-4 gap-1  px-4 py-4 md:mt-0   bg-white mb-2 ">
                                                        <div className='gap-2 col-span-8 flex flex-col'>
                                                            <p className="my-auto text-sm text-primary font-semibold">
                                                                Pilih Tanggal
                                                            </p>
                                                            <div className="flex w-full gap-2 justify-between">
                                                                <p className="text-sm text-primary font-semibold ">
                                                                    Dari :
                                                                </p>

                                                                <input
                                                                    className='rounded-md bg-blue-200 px-2'
                                                                    type="date"

                                                                ></input>

                                                            </div>
                                                            <div className="flex w-full   gap-2 justify-between">
                                                                <p className="text-sm text-primary font-semibold ">
                                                                    Sampai :
                                                                </p>

                                                                <input
                                                                    className='rounded-md bg-blue-200 px-2'
                                                                    type="date"

                                                                ></input>

                                                            </div>
                                                        </div>

                                                    </div>
                                                </>
                                            </ModalKosonganSmall>
                                        </>
                                    )
                                    }
                                </div>
                            </div>


                            <div className='grid grid-cols-12  bg-white  border-b-8 border-[#D8EAFF] px-[1%] py-[1%]'>
                                <p className='text-[#646464] text-xs font-bold col-span-2'>
                                    Job Order
                                </p>
                                <p className='text-[#646464] text-xs font-bold col-span-2'>
                                    Nama Item
                                </p>
                                <p className='text-[#646464] text-xs font-bold '>
                                    Qty Pcs
                                </p>
                                <p className='text-[#646464] text-xs font-bold '>
                                    Qty Druk
                                </p>
                                <p className='text-[#646464] text-xs font-bold col-span-2'>
                                    Tanggal Kirim
                                </p>
                                <p className='text-[#646464] text-xs font-bold col-span-3'>
                                    Tanggal Cetak
                                </p>
                            </div>
                            <div className='max-h-[500px] overflow-y-scroll'>
                                {listJO?.data?.map((data: any, i: number) => (
                                    <>
                                        <div
                                            key={i}
                                            className='grid grid-cols-12  bg-white  border-b-8 border-[#D8EAFF] px-[1%] py-[1%] '>
                                            <p className='text-[#646464] text-sm  col-span-2'>
                                                JO-24-00001
                                            </p>
                                            <p className='text-[#646464] text-sm  col-span-2'>
                                                ITEM 1
                                            </p>
                                            <p className='text-[#646464] text-sm  '>
                                                {data.qty_pcs}
                                            </p>
                                            <p className='text-[#646464] text-sm  '>
                                                {data.qty_druk}
                                            </p>
                                            <p className='text-[#646464] text-sm  col-span-2'>
                                                {data.tgl_kirim}
                                            </p>
                                            <p className='text-[#646464] text-sm  col-span-2'>
                                                {data.tgl_cetak}
                                            </p>
                                            <button
                                                onClick={() => {
                                                    getKalkulasi(data.id)
                                                    openCalculate(i)
                                                }}
                                                className='text-[#0065de] text-sm  font-bold'>
                                                CALCULATE
                                            </button>
                                            {showCalculate[i] == true && (

                                                <ModalXL
                                                    isOpen={showCalculate[i]}
                                                    onClose={() => closeCalculate(i)}
                                                    judul={'Rumus Kalkulasi'}
                                                >
                                                    <>
                                                        <div className='grid grid-cols-2 gap-2 px-4 py-4  border-b-8 border-[#D8EAFF]'>
                                                            <div className='flex flex-col '>
                                                                <div className='grid grid-cols-2 gap-2'>
                                                                    <label htmlFor="" className='text-black text-xs font-bold'>
                                                                        Tanggal Kirim
                                                                    </label>
                                                                    <label htmlFor="" className='text-[#016ae6] uppercase text-xl font-normal'>
                                                                        {convertTimeStampToDate(data.tgl_kirim)}
                                                                    </label>
                                                                </div>
                                                                <div className='grid grid-cols-2 gap-2'>
                                                                    <label htmlFor="" className='text-black text-xs font-bold'>
                                                                        Tanggal Cetak
                                                                    </label>
                                                                    <label htmlFor="" className='text-[#016ae6] uppercase text-xl font-normal'>
                                                                        {convertTimeStampToDate(data.tgl_cetak)}
                                                                    </label>
                                                                </div>
                                                            </div>

                                                        </div>
                                                        <div className='flex overflow-x-scroll max-w-screen border-b-8 border-[#D8EAFF] gap-2 px-4 py-4'>
                                                            <div className='w-[150px] flex flex-col '>
                                                                <label htmlFor="" className='text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]'>
                                                                    TAHAPAN
                                                                </label>
                                                                <label htmlFor="" className='text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]'>
                                                                    KATEGORI
                                                                </label>
                                                                <label htmlFor="" className='text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]'>
                                                                    DRYING TIME
                                                                </label>
                                                                <label htmlFor="" className='text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]'>
                                                                    MESIN
                                                                </label>
                                                                <label htmlFor="" className='text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]'>
                                                                    KAPASITAS/JAM
                                                                </label>
                                                                <label htmlFor="" className='text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]'>
                                                                    DRYING TIME (JAM)
                                                                </label>
                                                                <label htmlFor="" className='text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]'>
                                                                    SETTING (JAM)
                                                                </label>
                                                                <label htmlFor="" className='text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]'>
                                                                    KAPASITAS (JAM)
                                                                </label>
                                                                <label htmlFor="" className='text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]'>
                                                                    TOLERANSI
                                                                </label>
                                                                <label htmlFor="" className='text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]'>
                                                                    TOTAL WAKTU
                                                                </label>
                                                                <label htmlFor="" className='text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]'>
                                                                    TANGGAL
                                                                </label>
                                                            </div>
                                                            <div className='flex overflow-x-scroll max-w-screen'>
                                                                {hasilKalkulasi?.data?.tahap?.map((data2: any, ii: number) => (
                                                                    <>
                                                                        <div
                                                                            key={ii}
                                                                            className='min-w-[150px] flex flex-col justify-center'>
                                                                            <label htmlFor="" className='text-black text-xs justify-center  border-2 border-stroke flex items-center h-[50px]'>
                                                                                {data2.tahapan}
                                                                            </label>
                                                                            <label htmlFor="" className='text-black text-xs justify-center  border-2 border-stroke flex items-center h-[50px]'>
                                                                                {data2.kategory}
                                                                            </label>
                                                                            <label htmlFor="" className='text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]'>
                                                                                B
                                                                            </label>
                                                                            <label htmlFor="" className='text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]'>
                                                                                {data2.mesin}
                                                                            </label>
                                                                            <label htmlFor="" className='text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]'>
                                                                                {data2.kapasitas_per_jam}
                                                                            </label>
                                                                            <label htmlFor="" className='text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]'>
                                                                                {data2.drying_time}
                                                                            </label>
                                                                            <label htmlFor="" className='text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]'>
                                                                                {data2.setting}
                                                                            </label>
                                                                            <label htmlFor="" className='text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]'>
                                                                                {data2.kapasitas}
                                                                            </label>
                                                                            <label htmlFor="" className='text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]'>
                                                                                {data2.toleransi}
                                                                            </label>
                                                                            <label htmlFor="" className='text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]'>
                                                                                {data2.total_waktu}
                                                                            </label>
                                                                            <label htmlFor="" className='text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]'>
                                                                                {convertTimeStampToDate(data2.tgl_from)} ~  {convertTimeStampToDate(data2.tgl_to)}
                                                                            </label>
                                                                        </div>
                                                                    </>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </>
                                                </ModalXL>
                                            )}
                                        </div>
                                    </>
                                ))}
                            </div>
                        </div>
                        <div
                            onClick={showComponent2}
                            className='flex w-[3%] hover:cursor-pointer bg-blue-600 rounded-l-lg max-h-[20%] flex-col text-xl font-extrabold text-white items-center justify-center'>
                            {'<'}
                        </div>

                    </>
                ) :
                    (
                        <>
                            <div
                                onClick={showComponent1}
                                className='flex w-[3%] hover:cursor-pointer bg-blue-600 rounded-l-lg max-h-[20%] flex-col text-xl font-extrabold text-white items-center justify-center'>
                                {'>'}
                            </div>
                            <div className='flex w-[97%] flex-col bg-[#D8EAFF]'>
                                <div className='flex gap-2 w-full border-b-8 border-[#D8EAFF] bg-[#D8EAFF]'>

                                </div>
                                <div className='flex  bg-white  border-b-8 border-[#D8EAFF]'>
                                    <p className='text-center text-[#0065de] text-[11px] w-[6%] font-semibold py-[1%] '>
                                        TIME
                                    </p>

                                </div>
                                <div className='flex w-full bg-white  border-b-8 border-[#D8EAFF] flex-col '>

                                </div>
                            </div>

                        </>
                    )
                }
            </div>

        </main >
    )
}

export default ListJOProduksi
