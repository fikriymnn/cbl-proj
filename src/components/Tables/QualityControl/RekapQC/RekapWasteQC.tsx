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
                <button onClick={showComponent1} className='bg-blue-400 text-md font-semibold text-white border-2 rounded-md px-2 py-1'>
                    Waste By JO
                </button>
                <button onClick={showComponent2} className='bg-blue-400 text-md font-semibold text-white border-2 rounded-md px-2 py-1'>
                    Waste All
                </button>

                {activeComponent === 'component1' ? (
                    <>

                        <div className=' border-8 border-[#D8EAFF] '>
                            <div className='grid grid-cols-10 border-2 border-black px-3 justify-center gap-4 bg-white rounded-md py-1'>
                                <label className='text-sm font-semibold'>
                                    No
                                </label>
                                <label className='text-sm font-semibold col-span-4'>
                                    No. Jo
                                </label>
                                <label className='text-sm font-semibold col-span-2'>
                                    Total
                                </label>

                            </div>
                        </div>
                        <div className="border-8 border-[#D8EAFF] ">
                            {waste?.dataWasteByJo?.map((data: any, i: any) => {
                                return (
                                    <>
                                        <div
                                            key={i} className='border-8 border-[#D8EAFF]'>


                                            <div className=' rounded-md grid grid-cols-10 items-center  px-3 justify-center gap-4 text-stone-400 bg-white py-3 border-2 border-black'>
                                                <label className='text-sm font-semibold '>
                                                    {i + 1}
                                                </label>
                                                <label className='text-sm font-semibold col-span-4'>
                                                    {data.no_jo}
                                                </label>
                                                <label className='text-sm font-semibold col-span-2'>
                                                    {data.total_defect}
                                                </label>
                                                <div className='col-span-3 flex justify-end'>
                                                    <button
                                                        title="button"
                                                        onClick={() => handleClickDetail(i)}
                                                        className="text-xs font-bold text-blue-700 bg-blue-700 py-2 px-1 flex justify-center border-blue-700 border rounded-md"
                                                    >
                                                        <img src={Arrow} alt="" className="mx-3" />
                                                    </button>
                                                </div>

                                            </div>
                                        </div>
                                        {showDetail[i] && (
                                            <>
                                                <div

                                                    className='flex flex-col  bg-white mx-[5%]'>

                                                    <div className='grid grid-cols-12 gap-1 px-3  border-2 border-black rounded-md'>

                                                        <label className='text-sm font-semibold'>
                                                            No
                                                        </label>
                                                        <label className='text-sm font-semibold col-span-5'>
                                                            Kode Waste
                                                        </label>
                                                        <label className='text-sm font-semibold col-span-2'>
                                                            Total Defect
                                                        </label>
                                                    </div>

                                                    {data.defects?.map((data2: any, ii: any) => {
                                                        return (
                                                            <>
                                                                <div

                                                                    key={ii}
                                                                    className=' border-8  border-[#D8EAFF] gap-1 bg-white '>

                                                                    <div className='grid grid-cols-12 gap-1 rounded-md text-stone-400 border-2 border-black'>

                                                                        <label className='text-sm font-semibold text-black'>
                                                                            {ii + 1}
                                                                        </label>
                                                                        <label className='text-sm font-semibold col-span-5 text-black'>
                                                                            {data2.kode_waste} - {data2.waste_desc}
                                                                        </label>
                                                                        <label className='text-sm font-semibold col-span-2'>
                                                                            {data2.total_defect}
                                                                        </label>
                                                                    </div>
                                                                    <div className='flex flex-col  bg-white border-2 border-black '>
                                                                        <div className='grid grid-cols-12   border-b-2 border-black'>

                                                                            <label className='text-sm font-semibold'>
                                                                                No
                                                                            </label>
                                                                            <label className='text-sm font-semibold col-span-2 border-x-2 border-black'>
                                                                                Bobot
                                                                            </label>
                                                                            <label className='text-sm font-semibold col-span-4'>
                                                                                Kode
                                                                            </label>
                                                                            <label className='text-sm font-semibold col-span-2 border-x-2 border-black'>
                                                                                Calculated Defect
                                                                            </label>
                                                                        </div>
                                                                        {data2.kendala?.map((data3: any, iii: any) => {
                                                                            return (
                                                                                <>
                                                                                    <div
                                                                                        key={iii}
                                                                                        className='grid grid-cols-12 text-stone-400 border-b-2 border-black'>

                                                                                        <label className='text-sm font-semibold'>
                                                                                            {iii + 1}
                                                                                        </label>
                                                                                        <label className='text-sm font-semibold col-span-2 border-x-2 border-black'>
                                                                                            {data3.bobot}
                                                                                        </label>
                                                                                        <label className='text-sm font-semibold col-span-4'>
                                                                                            {data3.kode_kendala} - {data3.kendala_desc}
                                                                                        </label>
                                                                                        <label className='text-sm font-semibold col-span-2 border-x-2 border-black'>
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
                                                    }
                                                    )
                                                    }
                                                </div >
                                            </>
                                        )}
                                    </>
                                )
                            }
                            )
                            }

                        </div>
                    </>
                ) : (
                    <>
                        {/* <div className=' border-8 border-[#D8EAFF] '>
                            <div className='grid grid-cols-10 border-2 border-black px-3 justify-center gap-4 bg-white rounded-md py-1'>
                                <label className='text-sm font-semibold'>
                                    No
                                </label>
                                <label className='text-sm font-semibold col-span-2'>
                                    Kode Waste
                                </label>
                                <label className='text-sm font-semibold col-span-2'>
                                    Total
                                </label>
                                <label className='text-sm font-semibold col-span-2'>
                                    Deskripsi
                                </label>

                            </div>
                        </div> */}
                        <div className="border-8 border-[#D8EAFF] ">
                            {waste?.dataWasteAll?.map((data: any, i: any) => {
                                return (
                                    <>
                                        <div
                                            key={i} className=''>
                                            <div className=' rounded-md  max-w-screen gap-2 flex overflow-x-scroll items-center  text-stone-400 bg-white  border-2 border-black'>
                                                <label className='text-[10px] font-semibold w-[2%] pl-1'>
                                                    {i + 1}.
                                                </label>
                                                <label className='text-[10px] font-semibold min-w-[300px]'>
                                                    {data.kode_waste} - {data.waste_desc} - <span className='text-md text-red-500 font-semibold '>{data.total_defect}</span>
                                                </label>
                                                <div className=' flex '>
                                                    {data.kendala?.map((data2: any, ii: any) => {
                                                        return (
                                                            <>
                                                                <div key={ii}
                                                                    className='flex flex-col justify-between gap-2 border-x-2 border-b-2 border-black  py-4 w-30 items-center'
                                                                >
                                                                    <label className='text-[10px] font-semibold border-b-2 h-full w-full text-center border-black'>
                                                                        {data2.kode_kendala} - {data2.kendala_desc}
                                                                    </label>
                                                                    <label className='text-md text-red-500 font-semibold '>
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

                )}

            </div >
        </div>
    )
}

export default RekapWasteQC
