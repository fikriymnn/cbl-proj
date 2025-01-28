import axios from 'axios';
import React, { useEffect, useState } from 'react'
import Arrow from '../../../../images/icon/arrowDown.svg';
import Loading from '../../../Loading';

function RekapWasteQC() {
    const [isLoading, setIsLoading] = useState(false);
    const [waste, setWaste] = useState<any>();
    const [dateFrom, setDateFrom] = useState<any>();
    const [dateTo, setDateTo] = useState<any>();

    const [wasteMaster, setWasteMaster] = useState<any>();


    useEffect(() => {
        getWaste(null, null)
        getWasteMaster()
    }, []);

    async function getWaste(dateFrom1: any, dateTo1: any) {
        const url2 = `${import.meta.env.VITE_API_LINK_P1}/api/waste-lkh`;
        const url = `${import.meta.env.VITE_API_LINK}/reportWaste`;
        try {
            setIsLoading(true)
            const res2 = await axios.get(url2, {
                params: {
                    first_date: dateFrom1,
                    last_date: dateFrom1,
                }
            })
            const res = await axios.post(url,
                {
                    data_waste_master: wasteMaster,
                    data_waste_p1: res2.data,
                    start_date: dateFrom1,
                    end_date: dateTo1,
                },
                {
                    withCredentials: true,
                });


            setIsLoading(false)
            setWaste(res.data);
            console.log('waste', res.data);
        } catch (error: any) {
            setIsLoading(false)
            console.log('getwaste', error);
        }
    }
    async function getWasteMaster() {
        const url = `${import.meta.env.VITE_API_LINK_P1}/api/master-waste`;
        try {
            setIsLoading(true)
            const res = await axios.get(url,
                {

                });
            setIsLoading(false)
            setWasteMaster(res.data.waste)
            console.log('waste master', res.data);
        } catch (error: any) {
            setIsLoading(false)
            console.log('getmaster', error);
        }
    }

    const [showDetail, setShowDetail] = useState<boolean[]>(
        new Array(waste != null && waste.length).fill(false),
    );

    const handleClickDetail = (index: number) => {
        setShowDetail((prevState) => {
            const updatedShowDetail = [...prevState]; // Create a copy
            updatedShowDetail[index] = !updatedShowDetail[index]; // Toggle value
            return updatedShowDetail;
        });
    };

    const [activeComponent, setActiveComponent] = useState('component1');

    const showComponent1 = () => {
        setActiveComponent('component1');
    };

    const showComponent2 = () => {
        setActiveComponent('component2');
    };
    const showComponent3 = () => {
        setActiveComponent('component3');
    };

    const showComponent4 = () => {
        setActiveComponent('component4');
    };

    return (
        <div className='rounded-md'>
            {isLoading && <Loading />}
            <div className=" rounded-md shadow-md md:w-12/12 mb-5">
                <div className="flex md:gap-4 gap-1 md:flex-row flex-col px-4 py-4 md:mt-0  rounded-md bg-white mb-2">
                    <p className="my-auto text-sm text-primary font-semibold">
                        Pilih Tanggal
                    </p>
                    <div className="flex md:justify-center items-center gap-2">
                        <p className="text-sm text-primary font-semibold md:w-3/12 w-2/12">
                            Dari:
                        </p>

                        <input
                            className='rounded-full bg-[#D8EAFF] px-2'
                            type="date"
                            onChange={(e) => setDateFrom(e.target.value)}
                        ></input>

                    </div>
                    <div className="flex md:justify-center items-center gap-2">
                        <p className=" my-auto text-sm text-primary font-semibold md:w-3/12 w-2/12">
                            Sampai:
                        </p>

                        <input
                            className='rounded-full bg-[#D8EAFF] px-2'
                            type="date"
                            onChange={(e) => setDateTo(e.target.value)}
                        ></input>

                    </div>
                    <div className="flex justify-center my-5">
                        <button
                            disabled={isLoading}
                            onClick={() => {
                                getWaste(dateFrom, dateTo)
                            }}
                            className="bg-primary text-white px-5 py-2 rounded-md my-auto "
                        >
                            Tampilkan
                        </button>
                    </div>
                    <div className="flex justify-center my-5">
                        <button
                            disabled={isLoading}
                            onClick={() => {
                                getWaste(null, null)

                            }}
                            className="bg-primary text-white px-5 py-2 rounded-md my-auto "
                        >
                            Reset
                        </button>
                    </div>
                </div>
                <div className='flex gap-3 w-full justify-center'>
                    <div className='flex flex-col gap-2 border-2 w-[35%] justify-center border-white rounded-md'>
                        <label className='text-center justify-center  flex text-xl font-bold text-black px-[1%] '>
                            Waste Ke Kendala.
                        </label>
                        <div className='flex gap-2 justify-center'>
                            <button onClick={showComponent1} className='bg-blue-400 w-[50%] text-md font-semibold text-white border-2 rounded-md px-2 py-1'>
                                Waste By JO
                            </button>
                            <button onClick={showComponent2} className='bg-blue-400 w-[50%]  text-md font-semibold text-white border-2 rounded-md px-2 py-1'>
                                Waste All
                            </button>
                        </div>
                    </div>
                    <div className='flex flex-col gap-2 border-2 w-[35%] justify-center border-white rounded-md'>
                        <label className='text-center justify-center  flex text-xl font-bold text-black px-[1%] '>
                            Kendala Ke Waste.
                        </label>
                        <div className='flex gap-2 justify-center'>
                            <button onClick={showComponent3} className='bg-blue-400 w-[50%] text-md font-semibold text-white border-2 rounded-md px-2 py-1'>
                                Waste By JO
                            </button>
                            <button onClick={showComponent4} className='bg-blue-400 w-[50%]  text-md font-semibold text-white border-2 rounded-md px-2 py-1'>
                                Waste All
                            </button>
                        </div>
                    </div>
                </div>
                {activeComponent === 'component1' ? (
                    <>
                        <div className="border-8 border-[#D8EAFF] flex flex-col gap-2 ">

                            {waste?.dataWasteByJo?.map((data: any, i: any) => {
                                return (
                                    <>
                                        <div
                                            key={i} className='gap-1 '>
                                            <div className=' rounded-md  max-w-screen gap-2 flex flex-col  overflow-x-scroll text-stone-400 bg-white  border-2 border-black'>

                                                <div className='grid grid-cols-10 min-h-20 items-center justify-center gap-8 px-[4%]'>

                                                    <label className='col-span-2 justify-end flex text-xl font-bold text-black px-[1%] '>
                                                        {i + 1}.
                                                    </label>
                                                    <label className=' col-span-2 text-xl font-semibold text-black'>
                                                        {data.no_jo}
                                                    </label>
                                                    <label className='col-span-4 text-xl font-semibold text-black'>
                                                        Total Defect : {data.total_defect}
                                                    </label>

                                                    <div className='flex col-span-2 justify-end'>
                                                        <button
                                                            title='button'

                                                            className="text-xs text-white font-bold px-2 bg-blue-700 py-2 border-blue-700 border rounded-md flex justify-center"
                                                        >
                                                            Detail
                                                        </button>
                                                    </div>
                                                </div>

                                                <button
                                                    title='button'
                                                    onClick={() => handleClickDetail(i)}
                                                    className="text-xs font-bold text-blue-700 bg-blue-700 py-2 border-blue-700 border rounded-md flex justify-center"
                                                >
                                                    <img src={Arrow} alt="" className="mx-2" />
                                                </button>

                                                {showDetail[i] && (
                                                    <>
                                                        <div className=' flex flex-col gap-1 '>
                                                            {data.defects?.map((data2: any, ii: any) => {
                                                                return (
                                                                    <>
                                                                        <div
                                                                            key={ii}
                                                                            className='flex w-full flex-col border-b-8 border-[#D8EAFF] px-[1%] py-[1%] gap-2'>
                                                                            <div
                                                                                className='flex flex-col justify-between gap-2 border-2 border-black  w-30 items-center rounded-md'
                                                                            >

                                                                                <label className='text-xs font-semibold border-b-2 h-full w-full text-center text-black border-black bg-slate-200'>
                                                                                    {data2.kode_waste} - {data2.waste_desc}
                                                                                </label>
                                                                                <label className='text-xs text-red-500 font-semibold '>
                                                                                    {data2.total_defect}
                                                                                </label>

                                                                            </div>
                                                                            <div className='flex w-full gap-1 '>
                                                                                {data2.kendala?.map((data3: any, iii: any) => {
                                                                                    return (
                                                                                        <>
                                                                                            <div
                                                                                                key={iii}
                                                                                                className='flex flex-col justify-between gap-2 border-2 border-black   w-30 items-center rounded-md'
                                                                                            >
                                                                                                <label className='text-xs font-bold border-b-2 h-full w-full text-center text-black border-black uppercase bg-slate-200'>
                                                                                                    {data3.kategori_kendala}
                                                                                                </label>
                                                                                                <label className='text-xs font-semibold border-b-2 h-full w-full text-center text-black border-black'>
                                                                                                    {data3.kode_kendala} - {data3.kendala_desc}
                                                                                                </label>
                                                                                                <label className='text-xs text-red-500 font-semibold '>
                                                                                                    {data3.calculated_defect}
                                                                                                </label>

                                                                                            </div>
                                                                                        </>
                                                                                    )
                                                                                })}
                                                                            </div>
                                                                        </div>

                                                                    </>
                                                                )
                                                            })}
                                                        </div>
                                                    </>
                                                )}

                                            </div>
                                        </div >



                                    </>
                                )
                            }
                            )
                            }

                        </div>
                    </>
                ) : activeComponent === 'component2' ? (
                    <>

                        <div className="border-8 border-[#D8EAFF] flex flex-col gap-2 ">
                            {waste?.dataWasteAll?.map((data: any, i: any) => {
                                return (
                                    <>
                                        <div
                                            key={i} className=''>
                                            <div className=' rounded-md  max-w-screen gap-2 flex overflow-x-scroll items-center  text-stone-400 bg-white  border-2 border-black px-[4%]'>

                                                <div
                                                    className='flex flex-col justify-between gap-2 border-2 border-black  w-30 items-center rounded-md'
                                                >

                                                    <label className='text-xs font-semibold border-b-2 h-full w-full text-center text-black border-black bg-slate-200'>
                                                        {data.kode_waste} - {data.waste_desc}
                                                    </label>
                                                    <label className='text-xs text-red-500 font-semibold '>
                                                        {data.total_defect}
                                                    </label>

                                                </div>
                                                <div className=' flex pt-3 gap-3'>
                                                    {data.kendala?.map((data2: any, ii: any) => {
                                                        return (
                                                            <>
                                                                <div
                                                                    key={ii}
                                                                    className='flex flex-col justify-between gap-2 border-2 border-black   w-30 items-center rounded-md'
                                                                >
                                                                    <label className='text-xs font-bold border-b-2 h-full w-full text-center text-black border-black uppercase bg-slate-200'>
                                                                        {data2.kategori_kendala}
                                                                    </label>
                                                                    <label className='text-xs font-semibold border-b-2 h-full w-full text-center text-black border-black'>
                                                                        {data2.kode_kendala} - {data2.kendala_desc}
                                                                    </label>
                                                                    <label className='text-xs text-red-500 font-semibold '>
                                                                        {data2.calculated_defect}
                                                                    </label>

                                                                </div>
                                                            </>
                                                        )
                                                    })}
                                                </div>
                                            </div>

                                        </div>


                                    </>
                                )
                            }
                            )
                            }

                        </div>
                    </>

                ) : activeComponent === 'component3' ? (
                    <>
                        <div className="border-8 border-[#D8EAFF] flex flex-col gap-2 ">

                            {waste?.dataWasteByJoReplace?.map((data: any, i: any) => {
                                return (
                                    <>
                                        <div
                                            key={i} className='gap-1 '>
                                            <div className=' rounded-md  max-w-screen gap-2 flex flex-col  overflow-x-scroll text-stone-400 bg-white  border-2 border-black'>

                                                <div className='grid grid-cols-10 min-h-20 items-center justify-center gap-8 px-[4%]'>

                                                    <label className='col-span-2 justify-end flex text-xl font-bold text-black px-[1%] '>
                                                        {i + 1}.
                                                    </label>
                                                    <label className=' col-span-2 text-xl font-semibold text-black'>
                                                        {data.no_jo}
                                                    </label>
                                                    <label className='col-span-4 text-xl font-semibold text-black'>
                                                        Total Defect : {data.total_defect}
                                                    </label>

                                                    <div className='flex col-span-2 justify-end'>
                                                        <button
                                                            title='button'

                                                            className="text-xs text-white font-bold px-2 bg-blue-700 py-2 border-blue-700 border rounded-md flex justify-center"
                                                        >
                                                            Detail
                                                        </button>
                                                    </div>
                                                </div>

                                                <button
                                                    title='button'
                                                    onClick={() => handleClickDetail(i)}
                                                    className="text-xs font-bold text-blue-700 bg-blue-700 py-2 border-blue-700 border rounded-md flex justify-center"
                                                >
                                                    <img src={Arrow} alt="" className="mx-2" />
                                                </button>

                                                {showDetail[i] && (
                                                    <>
                                                        <div className=' flex flex-col gap-1 '>
                                                            {data.defects?.map((data2: any, ii: any) => {
                                                                return (
                                                                    <>
                                                                        <div
                                                                            key={ii}
                                                                            className='flex w-full flex-col border-b-8 border-[#D8EAFF] px-[1%] py-[1%] gap-2'>
                                                                            <div
                                                                                className='flex flex-col justify-between gap-2 border-2 border-black  w-30 items-center rounded-md'
                                                                            >

                                                                                <label className='text-xs font-semibold border-b-2 h-full w-full text-center text-black border-black bg-slate-200'>
                                                                                    {data2.kode_kendala} - {data2.kendala_desc}
                                                                                </label>
                                                                                <label className='text-xs text-red-500 font-semibold '>
                                                                                    {data2.total_defect}
                                                                                </label>

                                                                            </div>
                                                                            <div className='flex w-full gap-1 '>
                                                                                {data2.kendala?.map((data3: any, iii: any) => {
                                                                                    return (
                                                                                        <>
                                                                                            <div
                                                                                                key={iii}
                                                                                                className='flex flex-col justify-between gap-2 border-2 border-black   w-30 items-center rounded-md'
                                                                                            >

                                                                                                <label className='text-xs font-semibold border-b-2 h-full w-full text-center text-black border-black bg-slate-200'>
                                                                                                    {data3.kode_waste} - {data3.waste_desc}
                                                                                                </label>
                                                                                                <label className='text-xs text-red-500 font-semibold '>
                                                                                                    {data3.calculated_defect}
                                                                                                </label>

                                                                                            </div>
                                                                                        </>
                                                                                    )
                                                                                })}
                                                                            </div>
                                                                        </div>

                                                                    </>
                                                                )
                                                            })}
                                                        </div>
                                                    </>
                                                )}

                                            </div>
                                        </div >



                                    </>
                                )
                            }
                            )
                            }

                        </div>
                    </>
                ) : activeComponent === 'component4' ? (
                    <>
                        <div className="border-8 border-[#D8EAFF] flex flex-col gap-2 ">
                            {waste?.dataWasteAllReplace?.map((data: any, i: any) => {
                                return (
                                    <>
                                        <div
                                            key={i} className=''>
                                            <div className=' rounded-md  max-w-screen pt-4 gap-2 flex overflow-x-scroll items-center  text-stone-400 bg-white  border-2 border-black px-[4%]'>

                                                <div
                                                    className='flex flex-col justify-between gap-2 border-2 border-black  w-30 items-center rounded-md'
                                                >

                                                    <label className='text-xs font-semibold border-b-2 h-full w-full text-center text-black border-black bg-slate-200'>
                                                        {data.kode_kendala} - {data.kendala_desc}
                                                    </label>
                                                    <label className='text-xs text-red-500 font-semibold '>
                                                        {data.total_defect}
                                                    </label>

                                                </div>
                                                <div className=' flex  gap-3'>
                                                    {data.kode_waste?.map((data2: any, ii: any) => {
                                                        return (
                                                            <>
                                                                <div
                                                                    key={ii}
                                                                    className='flex flex-col justify-between gap-2 border-2 border-black   w-30 items-center rounded-md'
                                                                >

                                                                    <label className='text-xs font-semibold border-b-2 h-full w-full text-center text-black border-black bg-slate-200'>
                                                                        {data2.kode_waste} - {data2.waste_desc}
                                                                    </label>
                                                                    <label className='text-xs text-red-500 font-semibold '>
                                                                        {data2.total_defect}
                                                                    </label>

                                                                </div>
                                                            </>
                                                        )
                                                    })}
                                                </div>
                                            </div>

                                        </div>


                                    </>
                                )
                            }
                            )
                            }

                        </div>
                    </>
                ) : null}

            </div >
        </div >
    )
}

export default RekapWasteQC
