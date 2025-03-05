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

function TampilanWeeklyJO() {

    const [isLoading, setIsLoading] = useState(false);
    const [startDate, setStartDate] = useState<string>(() => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    });

    const [endDate, setEndDate] = useState<string>(() => {
        const today = new Date();
        today.setDate(today.getDate() + 6);
        return today.toISOString().split('T')[0];
    });
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
        getmasterKategori()
    }, []);
    const [listJO1, setJo1] = useState<any>();
    async function get1Tiket(id: any, i: any) {

        const url = `${import.meta.env.VITE_API_LINK}/ppic/jadwalProduksi/${id}`;
        try {
            setIsLoading(true)
            const res = await axios.get(url, {
                withCredentials: true,
            });
            setJo1(res.data)

            setIsLoading(false)
            console.log('listJO 1', res.data);
        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }

    }

    const getJadwalView = async (tglAwal: string, tglAkhir: string) => {
        const url = `${import.meta.env.VITE_API_LINK}/ppic/jadwalProduksiWeekView`;
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

    const [listJO, setJo] = useState<any>();
    async function getmasterKategori() {
        const url = `${import.meta.env.VITE_API_LINK}/ppic/jadwalProduksi`;
        try {
            setIsLoading(true)
            const res = await axios.get(url, {
                params: {
                    status_tiket: 'history'
                },
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


    const [isDetailVisible, setIsDetailVisible] = useState(false);
    const machineList = [
        "R700", "SM", "GTO", "HOCK", "WB MANUAL", "BAODER", "KSB", "M1", "M2", "M3",
        "JK650", "JK1000", "POLAR", "ITOH", "LIPAT 1", "LIPAT 2", "OUTSORCE"
    ];
    const handleClickDetail = (index: number) => {
        setShowDetail((prevState) => {
            const updatedShowDetail = [...prevState]; // Create a copy
            updatedShowDetail[index] = !updatedShowDetail[index]; // Toggle value
            return updatedShowDetail;
        });
    };
    const [showDetail, setShowDetail] = useState<boolean[]>(
        new Array(listJO1 != null && listJO1.length).fill(false),
    );
    const formatCustomDate = (dateString: string) => {
        const months = [
            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ];

        const [datePart, timePart] = dateString.split(" ");
        const [year, month, day] = datePart.split("-");

        return `${parseInt(day)} / ${months[parseInt(month) - 1]} / ${year} - ${timePart.replace(/\./g, ":")}`;
    };
    const [selectedJO, setSelectedJO] = useState<any>(null);
    const [selectedIndex, setSelectedIndex] = useState<any>();
    const [isModalOpen, setIsModalOpen] = useState(false);


    const handleNextPrev = (direction: any) => {
        const currentDate = startDate ? new Date(startDate) : new Date(todayDate);
        currentDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));

        const startDateValue = currentDate.toISOString().split('T')[0];
        const endDate = new Date(currentDate);
        endDate.setDate(endDate.getDate() + 6); // Add 6 days to get a 7-day range
        const endDateValue = endDate.toISOString().split('T')[0];

        setStartDate(startDateValue);
        setEndDate(endDateValue);
        getJadwalView(startDateValue, endDateValue);
    };

    const getFormattedDate = (date: any) => {
        return date.toISOString().split("T")[0]; // Format YYYY-MM-DD
    };
    const normalizeMesin = (mesin: string) => {
        const lowerMesin = mesin.toLowerCase().replace(/\s|-/g, ""); // Remove spaces & dashes

        if (lowerMesin.includes("manual1") || lowerMesin === "manual") return "M1";
        if (lowerMesin.includes("manual2")) return "M2";
        if (lowerMesin.includes("manual3")) return "M3";

        return lowerMesin.toUpperCase(); // Ensure it's in uppercase for consistency
    };
    const [hoveredJobOrder, setHoveredJobOrder] = useState<any>(null);
    return (
        <main className="overflow-x-scroll ' ">
            {isLoading && <Loading />}
            <div className="min-w-[700px]  bg-white rounded-xl flex gap-1  px-4 py-4">
                <>
                    <div className='flex w-full flex-col '>

                        <div className='flex flex-col gap-3 w-full py-3 border-b-4 border-stroke'>
                            <div className='flex w-full justify-end'>
                                <button
                                    onClick={() => setIsDetailVisible(!isDetailVisible)}
                                    className=" bg-primary text-white font-semibold text-md flex justify-center w-[10%] rounded-md"
                                >
                                    {isDetailVisible ? "Hide JO Terjadwal " : "Show JO Terjadwal"}
                                </button>
                            </div>
                            <div className="flex flex-col gap-2  w-[30%]">
                                <p className="text-sm text-primary font-semibold">
                                    Tanggal:
                                </p>
                                <input
                                    className='rounded-md bg-[#D8EAFF] px-2 h-8'
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => {
                                        const selectedStartDate = e.target.value;
                                        const selectedEndDate = new Date(selectedStartDate);
                                        selectedEndDate.setDate(selectedEndDate.getDate() + 6);

                                        setStartDate(selectedStartDate);
                                        setEndDate(selectedEndDate.toISOString().split('T')[0]);
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
                                <label className='text-xl text-blue-400 font-semibold w-full flex justify-center'>
                                    {convertTimeStampToDate(startDate)}
                                </label>
                                <button
                                    onClick={() => handleNextPrev('next')}
                                    className="bg-primary text-white rounded-md my-auto py-1 px-2"
                                >
                                    Next
                                </button>
                            </div>

                        </div>

                        <div className="flex w-full flex-col">
                            {/* Header Row (Machines) */}
                            <div className="flex bg-white border-b-8 border-[#D8EAFF]">
                                <p className="text-center text-[#0065de] text-[11px] w-[12%] font-semibold py-[1%]">
                                    DATE
                                </p>
                                {machineList.map((machine: any, i: any) => (
                                    <div key={i} className="flex w-[12%] justify-center items-center bg-[#eaf4ff]">
                                        <p className="text-center text-[#0065de] text-[11px] font-semibold">
                                            {machine}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Rows for Dates and Data */}
                            {[...Array(7)].map((_, rowIndex) => {
                                const currentRowDate = new Date(startDate);
                                currentRowDate.setDate(currentRowDate.getDate() + rowIndex);
                                const formattedDate = getFormattedDate(currentRowDate);

                                const rowBackgroundColor = rowIndex % 2 === 0
                                    ? 'bg-[#F0F7FF]'   // Light blue for even rows
                                    : 'bg-white';       // White for odd rows

                                return (
                                    <div
                                        key={rowIndex}
                                        className={`flex border-b-4 border-[#D8EAFF] ${rowBackgroundColor}`}
                                    >
                                        {/* Date Column */}
                                        <div className={`flex w-[12%] py-[1%] justify-center items-center border-r border-[#D8EAFF]`}>
                                            <p className="text-center text-[#0065de] text-[11px] font-semibold">
                                                {convertTimeStampToDate(currentRowDate)}
                                            </p>
                                        </div>

                                        {machineList.map((machine: any, colIndex: any) => {
                                            const normalizedMachine = normalizeMesin(machine);

                                            // Color palette for different job orders
                                            const jobOrderColors = [
                                                'bg-blue-500 text-white',      // Primary blue
                                                'bg-green-500 text-white',     // Green
                                                'bg-purple-500 text-white',    // Purple
                                                'bg-orange-500 text-white',    // Orange
                                                'bg-teal-500 text-white',      // Teal
                                            ];

                                            // Track unique job orders to assign consistent colors
                                            const uniqueJobOrders: string[] = [];

                                            const groupedMatchingData = mapData.reduce((acc: any, d: any) => {
                                                const dateTanggal = new Date(d.tanggal);

                                                const normalizedDataDate = new Date(
                                                    dateTanggal.getFullYear(),
                                                    dateTanggal.getMonth(),
                                                    dateTanggal.getDate()
                                                );
                                                const normalizedCurrentDate = new Date(
                                                    currentRowDate.getFullYear(),
                                                    currentRowDate.getMonth(),
                                                    currentRowDate.getDate()
                                                );

                                                if (
                                                    normalizedDataDate.getTime() === normalizedCurrentDate.getTime() &&
                                                    normalizeMesin(d.mesin) === normalizedMachine
                                                ) {
                                                    const key = `${d.no_jo}`;

                                                    if (!acc[key]) {
                                                        acc[key] = d;
                                                    }
                                                }
                                                return acc;
                                            }, {});

                                            const matchingDataArray = Object.values(groupedMatchingData);

                                            const colBackgroundColor = colIndex % 2 === 0
                                                ? 'bg-[#F0F7FF]'   // Light blue for even columns
                                                : 'bg-white';       // White for odd columns

                                            return (
                                                <div
                                                    key={colIndex}
                                                    className={`flex w-[12%] justify-center items-center border-r border-[#D8EAFF] ${colBackgroundColor}`}
                                                >
                                                    {matchingDataArray.length > 0 ? (
                                                        <div className="flex flex-col items-center">
                                                            {matchingDataArray.map((data: any, index: any) => {
                                                                // Find or assign a color for this job order
                                                                let jobOrderColorClass = '';
                                                                const existingIndex = uniqueJobOrders.indexOf(data.no_jo);

                                                                if (existingIndex !== -1) {
                                                                    // Use existing color for repeated job order
                                                                    jobOrderColorClass = jobOrderColors[existingIndex % jobOrderColors.length];
                                                                } else {
                                                                    // Assign a new color for a new job order
                                                                    uniqueJobOrders.push(data.no_jo);
                                                                    jobOrderColorClass = jobOrderColors[uniqueJobOrders.length - 1 % jobOrderColors.length];
                                                                }

                                                                return (
                                                                    <button
                                                                        key={index}
                                                                        onMouseEnter={() => setHoveredJobOrder(data)}
                                                                        onMouseLeave={() => setHoveredJobOrder(null)}
                                                                        className={`text-center text-[11px] font-semibold border border-opacity-50 p-1 m-1 rounded-md ${jobOrderColorClass}`}
                                                                    >
                                                                        {data.no_jo}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : null}
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                            {hoveredJobOrder && (
                                <div className="fixed bottom-4 right-4 bg-white shadow-lg p-4 rounded-lg border">
                                    <h3 className="font-bold text-sm mb-2">Job Order Details</h3>
                                    <p>Job Order: {hoveredJobOrder.no_jo}</p>
                                    <p>Item: {hoveredJobOrder.item}</p>
                                    {/* Add more details as needed */}
                                </div>
                            )}
                        </div>
                        {isDetailVisible && (
                            <div className="fixed right-0 top-7 h-full w-[70%] bg-white shadow-lg p-4 overflow-y-auto rounded-xl ">
                                <h2 className="text-lg font-bold mb-4">Job Order List</h2>

                                <button
                                    onClick={() => setIsDetailVisible(false)}
                                    className="text-white font-semibold px-4 py-2 text-sm mt-3 rounded-md bg-red-600"
                                >
                                    Close
                                </button>

                                <div className="overflow-x-auto py-2">
                                    <table className="w-full border-collapse shadow-lg rounded-md overflow-hidden ">
                                        {/* Table Header */}
                                        <thead className="bg-blue-500 text-white font-semibold">
                                            <tr>
                                                <th className="border border-blue-600 px-4 py-2">No</th>
                                                <th className="border border-blue-600 px-4 py-2">No JO</th>
                                                <th className="border border-blue-600 px-4 py-2">Item</th>
                                                <th className="border border-blue-600 px-4 py-2">Qty Druk</th>
                                                <th className="border border-blue-600 px-4 py-2">Qty PCS</th>
                                                <th className="border border-blue-600 px-4 py-2">Tanggal Kirim</th>
                                                <th className="border border-blue-600 px-4 py-2">Action</th>
                                            </tr>
                                        </thead>

                                        {/* Table Body */}
                                        <tbody>
                                            {listJO?.data?.length > 0 ? (
                                                listJO.data.map((jo: any, index: number) => (
                                                    <tr
                                                        key={index}
                                                        className={`${index % 2 === 0 ? "bg-blue-50" : "bg-white"
                                                            } hover:bg-blue-100 transition duration-200`}
                                                    >
                                                        <td className="border border-blue-200 px-4 py-2 text-center">{index + 1}</td>
                                                        <td className="border border-blue-200 px-4 py-2 text-center">{jo.no_jo}</td>
                                                        <td className="border border-blue-200 px-4 py-2 text-center">{jo.item}</td>
                                                        <td className="border border-blue-200 px-4 py-2 text-center">{jo.qty_druk}</td>
                                                        <td className="border border-blue-200 px-4 py-2 text-center">{jo.qty_pcs}</td>
                                                        <td className="border border-blue-200 px-4 py-2 text-center">{jo.tgl_kirim}</td>
                                                        <td className="border border-blue-200 px-4 py-2 text-center">
                                                            <button
                                                                onClick={() => {
                                                                    get1Tiket(jo.id, index); // Call function
                                                                    setSelectedJO(jo); // Store selected JO
                                                                    setSelectedIndex(index); // Store index
                                                                    setIsModalOpen(true); // Open modal
                                                                }}
                                                                className='text-[#0065de] text-sm  font-bold'>
                                                                DETAIL
                                                            </button>

                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (

                                                <tr>
                                                    <td colSpan={6} className="text-center py-4 text-gray-600">
                                                        No data available
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>


                                </div>

                            </div>
                        )}

                    </div>
                    {isModalOpen && selectedJO && (
                        <ModalXL
                            isOpen={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
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
                                                : {selectedJO?.no_jo}
                                            </label>
                                        </div>
                                        <div className='grid grid-cols-2 gap-2'>
                                            <label htmlFor="" className='text-black text-xs font-bold'>
                                                Item
                                            </label>
                                            <label htmlFor="" className='text-[#016ae6] uppercase text-xl font-normal'>
                                                : {selectedJO?.item}
                                            </label>
                                        </div>
                                        <div className='grid grid-cols-2 gap-2'>
                                            <label htmlFor="" className='text-black text-xs font-bold'>
                                                Tanggal Kirim
                                            </label>
                                            <label htmlFor="" className='text-[#016ae6] uppercase text-xl font-normal'>
                                                : {convertTimeStampToDate(selectedJO?.tgl_kirim)}
                                            </label>
                                        </div>
                                    </div>
                                    <div className='flex flex-col '>
                                        <div className='grid grid-cols-2 gap-2'>
                                            <label htmlFor="" className='text-black text-xs font-bold'>
                                                Qty Druk
                                            </label>
                                            <label htmlFor="" className='text-[#016ae6] uppercase text-xl font-normal'>
                                                : {formatInteger(selectedJO?.qty_druk)}
                                            </label>
                                        </div>
                                        <div className='grid grid-cols-2 gap-2'>
                                            <label htmlFor="" className='text-black text-xs font-bold'>
                                                Qty Pcs
                                            </label>
                                            <label htmlFor="" className='text-[#016ae6] uppercase text-xl font-normal'>
                                                : {formatInteger(selectedJO?.qty_pcs)}
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
                                        {showDetail[selectedIndex] && (
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

                                                                    htmlFor="" className='text-blue-400 text-xs border-2 px-2 py-1 rounded-md border-blue-400 text-center'>
                                                                    {formatCustomDate(data2.tgl_from)}
                                                                </label>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button

                                                                    className='text-blue-400 text-xs border-2 px-2 py-1 rounded-md border-blue-400 text-center'>
                                                                    {data2.jadwal_per_jam?.length == 0 ? '-' : convertTimeStampToDate(data2.jadwal_per_jam[0]?.tanggal)} - {data2.jadwal_per_jam[0]?.jam}
                                                                </button>
                                                            </>
                                                        )}

                                                    </div>
                                                    {showDetail[selectedIndex] && (
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




                                    </div>
                                    <div className=''>
                                        <button
                                            title="button"
                                            onClick={() => handleClickDetail(selectedIndex)}
                                            className="text-xs w-full flex  font-bold text-white px-1 bg-blue-700 py-2 border-blue-700 border rounded-md"
                                        >
                                            DETAIL
                                        </button>
                                    </div>
                                </div >

                            </>
                        </ModalXL>
                    )}
                </>


            </div>

        </main >
    )
}

export default TampilanWeeklyJO
