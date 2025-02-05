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

function TampilanDailyJO() {

    const [isLoading, setIsLoading] = useState(false);
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
        const today = new Date();
        setTodayDate(today.toISOString().split('T')[0]);
    }, []);



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

    const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00:00`);



    const [showModal3, setShowModal3] = useState<any>([]);
    const openModal3 = (i: any) => {
        const onchangeVal: any = [...showModal3];

        onchangeVal[i] = true;

        setShowModal3(onchangeVal);
    };
    const closeModal3 = (i: any) => {
        const onchangeVal: any = [...showModal3];
        onchangeVal[i] = false;

        setShowModal3(onchangeVal);
    };
    const handleNextPrev = (direction: string) => {
        const currentDate = startDate ? new Date(startDate) : new Date(todayDate); // Use selected date or today
        currentDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1)); // Increment or decrement by 1 day

        const newDate = currentDate.toISOString().split('T')[0]; // Format the new date to YYYY-MM-DD
        setStartDate(newDate);
        setEndDate(newDate);
        getJadwalView(newDate, newDate)
    };
    return (
        <main className="overflow-x-scroll ' ">
            {isLoading && <Loading />}
            <div className="min-w-[700px]  bg-white rounded-xl flex gap-1  px-4 py-4">
                <>
                    <div className='flex w-full flex-col '>

                        <div className='flex flex-col gap-3 w-full py-3 border-b-4 border-stroke'>
                            <div className="flex flex-col gap-2  w-[30%]">
                                <p className="text-sm text-primary font-semibold">
                                    Tanggal:
                                </p>
                                <input
                                    className='rounded-md bg-[#D8EAFF] px-2 h-8'
                                    type="date"
                                    onChange={(e) => {
                                        setStartDate(e.target.value)
                                        setEndDate(e.target.value)
                                    }}
                                ></input>

                            </div>

                            <div className="flex ">
                                <button
                                    onClick={() => {
                                        getJadwalView(startDate, endDate)
                                    }}
                                    className="bg-primary text-white  rounded-md my-auto py-1 px-2"
                                >
                                    Tampilkan
                                </button>

                            </div>
                            <div className="flex w-full justify-between">
                                <button
                                    onClick={() => handleNextPrev('prev')}
                                    className="bg-primary text-white rounded-md my-auto py-1 px-2"
                                >
                                    Prev
                                </button>

                                <button
                                    onClick={() => handleNextPrev('next')}
                                    className="bg-primary text-white rounded-md my-auto py-1 px-2"
                                >
                                    Next
                                </button>

                            </div>
                            <label className='text-xl text-blue-400 font-semibold w-full flex justify-center'>
                                {convertTimeStampToDate(startDate)}
                            </label>
                        </div>

                        <div className='flex bg-white border-b-8 border-[#D8EAFF]'>
                            {/* Header Row for Time */}
                            <p className='text-center text-[#0065de] text-[11px] w-[6%] font-semibold py-[1%]'>
                                TIME
                            </p>
                            {mapData?.
                                filter((data: any, index: number, self: any[]) =>
                                    self.findIndex(item => item.mesin === data.mesin) === index
                                )
                                .map((data: any, i1: number) => (
                                    <div
                                        key={i1}
                                        className={`flex w-[6%] justify-center items-center ${i1 % 2 === 1 ? 'bg-white' : 'bg-[#eaf4ff]'}`}>
                                        <p className='text-center text-[#0065de] text-[11px] font-semibold'>
                                            {data.mesin}
                                        </p>
                                    </div>
                                ))}
                        </div>

                        <div className='flex w-full bg-white border-b-8 border-[#D8EAFF] flex-col'>
                            {/* Rows for Hours and Data */}
                            {hours.map((hour, rowIndex) => (
                                <div key={rowIndex} className='flex border-b-8 border-[#D8EAFF]'>
                                    {/* Hour Column */}
                                    <div className={`flex w-[6%] py-[1%] justify-center items-center`}>
                                        <p className='text-center text-[#0065de] text-[11px] font-semibold'>
                                            {hour}
                                        </p>
                                    </div>

                                    {/* Data Columns */}
                                    {mapData?.filter((data: any, index: number, self: any[]) =>
                                        self.findIndex(item => item.mesin === data.mesin) === index
                                    )
                                        .map((machineData: any, colIndex: number) => {
                                            // Find matching data for this hour and machine
                                            const matchingData = mapData.find(
                                                (d: any) => d.jam === hour && d.mesin === machineData.mesin
                                            );

                                            return (
                                                <div
                                                    key={colIndex}
                                                    className={`flex w-[6%] justify-center items-center ${colIndex % 2 === 1 ? 'bg-white' : 'bg-[#eaf4ff]'}`}>
                                                    <button
                                                        onClick={() => openModal3(matchingData?.id)}
                                                        className='text-center text-[#0065de] text-[11px] font-semibold'>
                                                        {matchingData ? matchingData.no_jo : ''}
                                                    </button>

                                                    {showModal3[matchingData?.id] === true && ( // Use matchingData.id to open the correct modal
                                                        <ModalKosongan
                                                            isOpen={showModal3[matchingData?.id]}
                                                            onClose={() => closeModal3(matchingData?.id)}
                                                            judul={'Drag And Drop Edit'}
                                                        >
                                                            <PopUpTable2 dataMap={mapData.find((data: any) => data.id === matchingData?.id)}
                                                                onClose={() => closeModal3(matchingData?.id)}
                                                                onFinish={() => getJadwalView(startDate, endDate)} />
                                                        </ModalKosongan>
                                                    )}
                                                </div>
                                            );
                                        })}
                                </div>
                            ))}
                        </div>
                    </div>

                </>


            </div>

        </main >
    )
}

export default TampilanDailyJO
