import React from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'
import Ceklis from '../../../images/icon/ceklis.svg'
import Polygon from '../../../images/icon/Polygon.svg'
import X from '../../../images/icon/x.svg'
import Strip from '../../../images/icon/strip.svg'
function KPIInput() {
    return (
        <>
            <DefaultLayout>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Key Performance Indicator &gt; Input</p>
                <section className='flex justify-between p-4 bg-white'>

                    <div>

                        <div className='flex flex-col md:w-52 w-35'>
                            <div className='grid grid-cols-2 justify-between md:gap-3 gap-1 '>
                                <p className='md:text-[14px] text-[9px] font-semibold '> Nama </p>
                                <p className='md:text-[14px] text-[9px] font-semibold '>: Sofyan H</p>

                            </div>
                            <div className='grid grid-cols-2 justify-between md:gap-3 gap-1'>
                                <p className='md:text-[14px] text-[9px] font-semibold'> Role </p>
                                <p className='md:text-[14px] text-[9px] font-semibold'>: Section Head</p>

                            </div>

                            <div className='grid grid-cols-2 justify-between md:gap-3 gap-1'>
                                <p className='md:text-[14px] text-[9px] font-semibold'> tanggal </p>
                                <p className='md:text-[14px] text-[9px] font-semibold'>: 01 April 2024</p>

                            </div>


                        </div>
                    </div>

                </section>
                <section className='overflow-x-scroll '>
                    <div className="flex bg-white mt-2 py-2  min-w-[500px]">
                        <div className='flex items-center justify-center w-15 '>

                            <p className=" text-xs font-bold ">No</p>
                        </div>
                        <div className="grid grid-cols-6  w-full gap-2">
                            <div className="flex gap-1 items-center  ">
                                <p className="text-xs font-bold ">Cascade</p>

                            </div>
                            <div className="flex gap-1 items-center col-span-2 ">
                                <p className="text-xs font-bold ">Job Function</p>

                            </div>
                            <div className="flex gap-1 items-center  ">
                                <p className="text-xs font-bold ">Target</p>

                            </div>
                            <div className="flex gap-1 items-center  ">
                                <p className="text-xs font-bold ">Bobot</p>

                            </div>
                            <div className="flex gap-1 items-center  ">
                                <p className="text-xs font-bold ">Actual</p>

                            </div>

                        </div>
                    </div>
                    <div className=" min-w-[500px]">
                        <div className='flex bg-white mt-1 py-2'>

                            <div className='flex items-center justify-center w-15 '>

                                <p className=" text-xs font-medium ">1</p>
                            </div>
                            <div className="grid grid-cols-6  w-full gap-2">
                                <div className="flex gap-1 items-center  ">
                                    <p className="text-xs font-medium ">Pelaksanaan PM</p>

                                </div>
                                <div className="flex gap-1 items-center col-span-2 ">
                                    <p className="text-xs font-medium ">Submit Pelaksanaan PM 1 Sesuai Checklist</p>

                                </div>
                                <div className="flex gap-1 items-center  ">
                                    <p className="text-xs font-medium ">{`>=75%`}</p>

                                </div>
                                <div className="flex gap-1 items-center  ">
                                    <p className="text-xs font-medium ">6</p>

                                </div>
                                <div className="flex gap-1 items-center  ">
                                    <input
                                        type=""
                                        placeholder=""
                                        name=""
                                        id=""
                                        className="w-10/12 px-2 rounded-sm py-1 bg-white border-[#D9D9D9] border"
                                    />
                                </div>

                            </div>
                        </div>

                    </div>
                    <div className=" min-w-[500px]">
                        <div className='flex bg-white mt-1 py-2'>

                            <div className='flex items-center justify-center w-15 '>

                                <p className=" text-xs font-medium ">1</p>
                            </div>
                            <div className="grid grid-cols-6  w-full gap-2">
                                <div className="flex gap-1 items-center  ">
                                    <p className="text-xs font-medium ">Pelaksanaan PM</p>

                                </div>
                                <div className="flex gap-1 items-center col-span-2 ">
                                    <p className="text-xs font-medium ">Submit Pelaksanaan PM 1 Sesuai Checklist</p>

                                </div>
                                <div className="flex gap-1 items-center  ">
                                    <p className="text-xs font-medium ">{`>=75%`}</p>

                                </div>
                                <div className="flex gap-1 items-center  ">
                                    <p className="text-xs font-medium ">6</p>

                                </div>
                                <div className="flex gap-1 items-center  ">
                                    <input
                                        type=""
                                        placeholder=""
                                        name=""
                                        id=""
                                        className="w-10/12 px-2 rounded-sm py-1 bg-white border-[#D9D9D9] border"
                                    />
                                </div>

                            </div>
                        </div>

                    </div>
                    <div className=" min-w-[500px]">
                        <div className='flex bg-white mt-1 py-2'>

                            <div className='flex items-center justify-center w-15 '>

                                <p className=" text-xs font-medium ">1</p>
                            </div>
                            <div className="grid grid-cols-6  w-full gap-2">
                                <div className="flex gap-1 items-center  ">
                                    <p className="text-xs font-medium ">Pelaksanaan PM</p>

                                </div>
                                <div className="flex gap-1 items-center col-span-2 ">
                                    <p className="text-xs font-medium ">Submit Pelaksanaan PM 1 Sesuai Checklist</p>

                                </div>
                                <div className="flex gap-1 items-center  ">
                                    <p className="text-xs font-medium ">{`>=75%`}</p>

                                </div>
                                <div className="flex gap-1 items-center  ">
                                    <p className="text-xs font-medium ">6</p>

                                </div>
                                <div className="flex gap-1 items-center  ">
                                    <input
                                        type=""
                                        placeholder=""
                                        name=""
                                        id=""
                                        className="w-10/12 px-2 rounded-sm py-1 bg-white border-[#D9D9D9] border"
                                    />
                                </div>

                            </div>
                        </div>

                    </div>
                    <div className='flex justify-between items-center bg-white px-5 py-2 mt-2 min-w-[500px]'>
                        <p className='text-sm font-bold'>Total Point :</p>
                        <button className='w-40 py-2 rounded-sm text-white text-sm bg-primary font-bold'>SUBMIT</button>
                    </div>
                </section>
            </DefaultLayout>
        </>
    )
}

export default KPIInput