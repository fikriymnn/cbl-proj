import React, { useEffect, useState } from 'react'
import ModalXL from './ModalXL';
import ModalKosongan from '../../../Modals/Qc/NCR/NCRResponQC';
import ModalKosonganSmall from '../../../Modals/ModalKosonganSmall';
import axios from 'axios';
import Loading from '../../../Loading';
import convertTimeStampToDate from '../../../../utils/convertDate';
import formatInteger from '../../../../utils/formaterInteger';
import PopUpTable from './DragAndDropPopUp';
import ModalFull from './ModalFull';
import PopUpTable2 from './PopUpTable2';

function ListJOProduksi() {

    const [isLoading, setIsLoading] = useState(false);
    const [listJO, setJo] = useState<any>();
    const [listJO1, setJo1] = useState<any>();
    const [hasilKalkulasi, setHasilKalkulasi] = useState<any>();
    const [startDate, setStartDate] = useState<any>(null);
    const [endDate, setEndDate] = useState<any>(null);
    const [mapData, setMapData] = useState<any>([]);

    const today = new Date();
    const [todayDate, setTodayDate] = useState<string>('');
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(today.getDate()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
    useEffect(() => {
        getJadwalView(formattedDate, formattedDate)
        getmasterKategori()
        const today = new Date();
        setTodayDate(today.toISOString().split('T')[0]);
    }, []);


    async function getKalkulasi(id: any, jo: any, i: any) {
        if (window.confirm(`Lakukan Kalkulasi pada ${jo}?`)) {
            const url = `${import.meta.env.VITE_API_LINK}/ppic/calculateJadwalProduksiDua/${id}`;
            try {
                setIsLoading(true)
                const res = await axios.get(url, {
                    withCredentials: true,
                });
                getmasterKategori()
                get1Tiket(id, i)
                console.log('Kalkulasi', res.data);
                setIsLoading(false)
            } catch (error: any) {
                setIsLoading(false)
                console.log(error);
            }
        }
    }
    async function get1Tiket(id: any, i: any) {

        const url = `${import.meta.env.VITE_API_LINK}/ppic/jadwalProduksi/${id}`;
        try {
            setIsLoading(true)
            const res = await axios.get(url, {
                withCredentials: true,
            });
            setJo1(res.data)
            setIsLoading(false)
            openCalculate(i)
            console.log('listJO 1', res.data);
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


    // Fetch data from the API
    const getJadwalView = async (tglAwal: any, tglAkhir: any) => {
        const url = `${import.meta.env.VITE_API_LINK}/ppic/jadwalProduksiView`;
        try {
            setIsLoading(true);
            const response = await axios.get(url, {
                params: {
                    start_date: tglAwal,
                    end_date: tglAkhir,
                },
                withCredentials: true,
            });
            console.log('jadwal view', response.data.data)
            setMapData(response.data.data);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setIsLoading(false);
        }
    };
    const putMasukJadwal = async (id: any) => {
        const url = `${import.meta.env.VITE_API_LINK}/ppic/jadwalProduksi/submit/${id}`;
        try {
            setIsLoading(true);
            const response = await axios.put(url, {

                withCredentials: true,
            });
            alert('berhasil')
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setIsLoading(false);
        }
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
    const handleClickDetail = (index: number) => {
        setShowDetail((prevState) => {
            const updatedShowDetail = [...prevState]; // Create a copy
            updatedShowDetail[index] = !updatedShowDetail[index]; // Toggle value
            return updatedShowDetail;
        });
    };
    const [showDetail, setShowDetail] = useState<boolean[]>(
        new Array(hasilKalkulasi != null && hasilKalkulasi.length).fill(false),
    );

    const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00:00`);

    const [showModal1, setShowModal1] = useState<any>([]);
    const openModal1 = (i: any) => {
        const onchangeVal: any = [...showModal1];

        onchangeVal[i] = true;

        setShowModal1(onchangeVal);
    };
    const closeModal1 = (i: any) => {
        const onchangeVal: any = [...showModal1];
        onchangeVal[i] = false;

        setShowModal1(onchangeVal);
    };


    const [selectedTahapan, setSelectedTahapan] = useState<string | null>(null);
    const [showModalFull, setShowModalFull] = useState<any>([]);
    const openModalFull = (i: any, tahapan: any) => {
        const onchangeVal: any = [...showModalFull];

        onchangeVal[i] = true;
        setSelectedTahapan(tahapan)
        setShowModalFull(onchangeVal);
    };
    const closeModalFull = (i: any) => {
        const onchangeVal: any = [...showModalFull];
        onchangeVal[i] = false;

        setShowModalFull(onchangeVal);
    };

    const [selectedData, setSelectedData] = useState<any>(null);
    const formatCustomDate = (dateString: string) => {
        const months = [
            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ];

        const [datePart, timePart] = dateString.split(" ");
        const [year, month, day] = datePart.split("-");

        return `${parseInt(day)} / ${months[parseInt(month) - 1]} / ${year} - ${timePart.replace(/\./g, ":")}`;
    };
    return (
        <main className="overflow-x-scroll ' ">
            {isLoading && <Loading />}
            <div className="min-w-[700px]  bg-white rounded-xl flex gap-1 ">

                <div className='flex w-full flex-col bg-[#D8EAFF]'>
                    <div className="grid grid-cols-10 w-full md:gap-4 gap-1  px-4 py-4 md:mt-0  rounded-md bg-white mb-2">
                        <div className='col-span-8 gap-2 flex flex-col'>
                            <p className="my-auto text-sm text-primary font-semibold">
                                Pilih Tanggal
                            </p>
                            <div className="flex md:max-w-[30%] max-w-[60%] gap-2 justify-between">
                                <p className="text-sm text-primary font-semibold ">
                                    Dari :
                                </p>

                                <input
                                    className='rounded-md bg-[#D8EAFF] px-2'
                                    type="date"

                                ></input>

                            </div>
                            <div className="flex  md:max-w-[30%] max-w-[60%] gap-2 justify-between">
                                <p className="text-sm text-primary font-semibold ">
                                    Sampai :
                                </p>

                                <input
                                    className='rounded-md bg-[#D8EAFF] px-2'
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
                        <p className='text-[#646464] text-xs font-bold col-span-4'>
                            Tanggal Kirim
                        </p>
                    </div>
                    <div className='max-h-[500px] overflow-y-scroll'>

                        {listJO?.data?.map((data: any, i: number) => (
                            <>
                                <div
                                    key={i}
                                    className='grid grid-cols-12  bg-white  border-b-8 border-[#D8EAFF] px-[1%] py-[1%] '>
                                    <p className='text-[#646464] text-sm  col-span-2'>
                                        {data.no_jo}
                                    </p>
                                    <p className='text-[#646464] text-sm  col-span-2'>
                                        {data.item}
                                    </p>
                                    <p className='text-[#646464] text-sm  '>
                                        {formatInteger(data.qty_pcs)}
                                    </p>
                                    <p className='text-[#646464] text-sm  '>
                                        {formatInteger(data.qty_druk)}
                                    </p>
                                    <p className='text-[#646464] text-sm  col-span-4'>
                                        {data.tgl_kirim}
                                    </p>
                                    <div className='col-span-2'>
                                        {data.status == 'calculated' ? <>
                                            <button
                                                onClick={() => {
                                                    get1Tiket(data.id, i)

                                                }}
                                                className='text-[#0065de] text-sm  font-bold'>
                                                VIEW
                                            </button>
                                        </> : <>
                                            <button
                                                onClick={() => {
                                                    getKalkulasi(data.id, data.no_jo, i)

                                                }}
                                                className='text-[#0065de] text-sm   font-bold'>
                                                CALCULATE
                                            </button>
                                        </>}
                                    </div>

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
                                                                Nomor JO
                                                            </label>
                                                            <label htmlFor="" className='text-[#016ae6] uppercase text-xl font-normal'>
                                                                : {data.no_jo}
                                                            </label>
                                                        </div>
                                                        <div className='grid grid-cols-2 gap-2'>
                                                            <label htmlFor="" className='text-black text-xs font-bold'>
                                                                Item
                                                            </label>
                                                            <label htmlFor="" className='text-[#016ae6] uppercase text-xl font-normal'>
                                                                : {data.item}
                                                            </label>
                                                        </div>
                                                        <div className='grid grid-cols-2 gap-2'>
                                                            <label htmlFor="" className='text-black text-xs font-bold'>
                                                                Tanggal Kirim
                                                            </label>
                                                            <label htmlFor="" className='text-[#016ae6] uppercase text-xl font-normal'>
                                                                : {convertTimeStampToDate(data.tgl_kirim)}
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className='flex flex-col '>
                                                        <div className='grid grid-cols-2 gap-2'>
                                                            <label htmlFor="" className='text-black text-xs font-bold'>
                                                                Qty Druk
                                                            </label>
                                                            <label htmlFor="" className='text-[#016ae6] uppercase text-xl font-normal'>
                                                                : {formatInteger(data.qty_druk)}
                                                            </label>
                                                        </div>
                                                        <div className='grid grid-cols-2 gap-2'>
                                                            <label htmlFor="" className='text-black text-xs font-bold'>
                                                                Qty Pcs
                                                            </label>
                                                            <label htmlFor="" className='text-[#016ae6] uppercase text-xl font-normal'>
                                                                : {formatInteger(data.qty_pcs)}
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
                                                            TANGGAL
                                                        </label>
                                                        {showDetail[i] && (
                                                            <>
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
                                                            </>
                                                        )}
                                                    </div>

                                                    <div className='flex overflow-x-scroll max-w-screen'>
                                                        {listJO1 == null ? <>
                                                            {hasilKalkulasi?.data?.tahap?.map((data2: any, ii: number) => (
                                                                <>
                                                                    <div
                                                                        key={ii}
                                                                        className='min-w-[150px] flex flex-col justify-center'>
                                                                        <label htmlFor="" className='text-black text-xs justify-center  border-2 border-stroke flex items-center h-[50px]'>
                                                                            {data2.tahapan}
                                                                        </label>
                                                                        <div className=' justify-center border-2 border-stroke flex items-center h-[50px]'>
                                                                            {data2?.jadwal_per_jam?.length == 0 ? (
                                                                                <>
                                                                                    <label
                                                                                        onClick={() => openModalFull(ii, data2.tahapan)}
                                                                                        htmlFor="" className='text-blue-400 text-xs border-2 px-2 py-1 rounded-md border-blue-400 text-center'>
                                                                                        {formatCustomDate(data2.tgl_from)}
                                                                                    </label>
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <button
                                                                                        onClick={() => openModalFull(ii, data2.tahapan)}
                                                                                        className='text-blue-400 text-xs border-2 px-2 py-1 rounded-md border-blue-400 text-center'>
                                                                                        {convertTimeStampToDate(data2.jadwal_per_jam[0]?.tanggal)} - {data2.jadwal_per_jam[0]?.jam}
                                                                                    </button>
                                                                                </>
                                                                            )}
                                                                            {showModalFull[ii] == true && (

                                                                                <ModalFull
                                                                                    isOpen={showModalFull[ii]}
                                                                                    onClose={() => {
                                                                                        setSelectedData(null)
                                                                                        closeModalFull(ii)
                                                                                    }}
                                                                                    judul={`Jadwal ${data2.tahapan} - ${data.jo}`}
                                                                                >
                                                                                    <>
                                                                                        <label htmlFor="" className='text-black text-xl px-4 mt-4 flex font-semibold'>
                                                                                            List Kepala
                                                                                        </label>
                                                                                        <div className='grid grid-cols-7 w-full bg-white border-b-8 border-[#D8EAFF] flex-col py-4 px-1'>
                                                                                            <div className='flex flex-wrap gap-1 col-span-2'>
                                                                                                {data2.jadwal_per_jam?.map((data3: any, iii: any) => (
                                                                                                    <>
                                                                                                        <div
                                                                                                            key={iii}
                                                                                                            className='border-2 border-stroke flex items-center h-[50px] px-4'>
                                                                                                            <button onClick={() => setSelectedData(data3)} className='text-black text-xs '>
                                                                                                                {convertTimeStampToDate(data3.tanggal)} - {data3.jam}
                                                                                                            </button>
                                                                                                        </div>


                                                                                                        {showModal1[data3?.id] === true && ( // Use matchingData.id to open the correct modal

                                                                                                            <PopUpTable dataMap={data3}
                                                                                                                onClose={() => closeModal1(data3?.id)}
                                                                                                                onFinish={() => get1Tiket(data.id, i)} />

                                                                                                        )}
                                                                                                    </>
                                                                                                ))}
                                                                                            </div>
                                                                                            <div className="col-span-5 flex flex-col gap-1 ">
                                                                                                {selectedData ? (
                                                                                                    <PopUpTable dataMap={selectedData} onClose={() => setSelectedData(null)} onFinish={() => get1Tiket(data.id, i)} />
                                                                                                ) : (
                                                                                                    <p className="text-gray-500">Pilih Data</p>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>

                                                                                    </>
                                                                                </ModalFull>
                                                                            )}
                                                                        </div>
                                                                        {showDetail[i] && (
                                                                            <>
                                                                                <label htmlFor="" className='text-black text-xs justify-center  border-2 border-stroke flex items-center h-[50px]'>
                                                                                    {data2.kategory}
                                                                                </label>
                                                                                <label htmlFor="" className='text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]'>
                                                                                    {data2.kategory_drying_time}
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
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </>
                                                            ))}
                                                        </> : <>
                                                            {listJO1?.data?.tahap?.map((data2: any, ii: number) => (
                                                                <>
                                                                    <div
                                                                        key={ii}
                                                                        className='min-w-[150px] flex flex-col justify-center'>
                                                                        <label htmlFor="" className='text-black text-xs justify-center  border-2 border-stroke flex items-center h-[50px]'>
                                                                            {data2.tahapan}
                                                                        </label>
                                                                        <div className=' justify-center border-2 border-stroke flex items-center h-[50px]'>
                                                                            {data2?.jadwal_per_jam?.length == 0 ? (
                                                                                <>
                                                                                    <label
                                                                                        onClick={() => openModalFull(ii, data2.tahapan)}
                                                                                        htmlFor="" className='text-blue-400 text-xs border-2 px-2 py-1 rounded-md border-blue-400 text-center'>
                                                                                        {formatCustomDate(data2.tgl_from)}
                                                                                    </label>
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <button
                                                                                        onClick={() => {

                                                                                            openModalFull(ii, data2.tahapan)
                                                                                        }}
                                                                                        className='text-blue-400 text-xs border-2 px-2 py-1 rounded-md border-blue-400 text-center'>
                                                                                        {data2.jadwal_per_jam?.length == 0 ? '-' : convertTimeStampToDate(data2.jadwal_per_jam[0]?.tanggal)} - {data2.jadwal_per_jam[0]?.jam}
                                                                                    </button>
                                                                                </>
                                                                            )}
                                                                            {showModalFull[ii] == true && (

                                                                                <ModalFull
                                                                                    isOpen={showModalFull[ii]}
                                                                                    onClose={() => {
                                                                                        setSelectedData(null)
                                                                                        closeModalFull(ii)
                                                                                    }}
                                                                                    judul={`Jadwal ${data2.tahapan} - ${data.no_jo}`}
                                                                                >
                                                                                    <>
                                                                                        <label htmlFor="" className='text-black text-xl px-4 mt-4 flex font-semibold'>
                                                                                            List Kepala
                                                                                        </label>
                                                                                        <div className='grid grid-cols-7 w-full bg-white border-b-8 border-[#D8EAFF] flex-col py-4 px-1'>
                                                                                            <div className='flex flex-wrap gap-1 col-span-2'>
                                                                                                {data2.jadwal_per_jam?.map((data3: any, iii: any) => (
                                                                                                    <>
                                                                                                        <div
                                                                                                            key={iii}
                                                                                                            className='border-2 border-stroke flex items-center h-[50px] px-4'>
                                                                                                            <button onClick={() => setSelectedData(data3)} className='text-black text-xs '>
                                                                                                                {convertTimeStampToDate(data3.tanggal)} - {data3.jam}
                                                                                                            </button>
                                                                                                        </div>


                                                                                                        {showModal1[data3?.id] === true && ( // Use matchingData.id to open the correct modal

                                                                                                            <PopUpTable dataMap={data3}
                                                                                                                onClose={() => closeModal1(data3?.id)}
                                                                                                                onFinish={() => get1Tiket(data.id, i)} />

                                                                                                        )}
                                                                                                    </>
                                                                                                ))}
                                                                                            </div>
                                                                                            <div className="col-span-5 flex flex-col gap-1 ">
                                                                                                {selectedData ? (
                                                                                                    <PopUpTable dataMap={selectedData} onClose={() => setSelectedData(null)} onFinish={() => get1Tiket(data.id, i)} />
                                                                                                ) : (
                                                                                                    <p className="text-gray-500">Pilih Data</p>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>

                                                                                    </>
                                                                                </ModalFull>
                                                                            )}
                                                                        </div>
                                                                        {showDetail[i] && (
                                                                            <>
                                                                                <label htmlFor="" className='text-black text-xs justify-center  border-2 border-stroke flex items-center h-[50px]'>
                                                                                    {data2.kategory}
                                                                                </label>
                                                                                <label htmlFor="" className='text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]'>
                                                                                    {data2.kategory_drying_time}
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
                                                                            </>
                                                                        )}
                                                                    </div >
                                                                </>
                                                            ))}
                                                        </>}



                                                    </div>
                                                    <div className=''>
                                                        <button
                                                            title="button"
                                                            onClick={() => handleClickDetail(i)}
                                                            className="text-xs w-full flex  font-bold text-white px-1 bg-blue-700 py-2 border-blue-700 border rounded-md"
                                                        >
                                                            DETAIL
                                                        </button>
                                                    </div>
                                                </div >
                                                {/* {hasilKalkulasi?.data?.jadwalPerJam?.length == 0 ? (
                                                            <> */}
                                                <div className='flex justify-center items-center pt-1'>
                                                    <button
                                                        title="button"
                                                        onClick={() => putMasukJadwal(data.id)}
                                                        className="text-base w-full flex justify-center  font-bold text-white px-1 bg-blue-700 py-2 border-blue-700 border rounded-md"
                                                    >
                                                        MASUK JADWAL
                                                    </button>
                                                </div>
                                                {/* </>
                                                        ) : (
                                                            <>

                                                            </>
                                                        )}*/}
                                            </>
                                        </ModalXL>
                                    )}
                                </div >
                            </>
                        ))}

                    </div>
                </div >




            </div>

        </main >
    )
}

export default ListJOProduksi
