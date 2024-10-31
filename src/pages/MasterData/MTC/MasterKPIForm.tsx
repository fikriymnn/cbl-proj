import React from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'
import Shortup from '../../../images/icon/sort-up.svg'
import Shortdown from '../../../images/icon/sort-down.svg'

function MasterKPIForm() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Master Data &gt; KPI Form</p>
                <div className='bg-white w-full py-6 rounded-md'></div>
                <div className='bg-white w-full py-4 md:grid grid-cols-12  rounded-md mt-1'>
                    <div className='col-span-6 flex flex-col gap-3'>
                        <div className='px-3 '>
                            <p className='text-sm font-bold'>Casecade</p>
                            <input
                                type=""
                                placeholder=""
                                name=""
                                id=""
                                className="w-full border-[#E9F3FF] border-2 shadow-1 p-1 rounded-md"
                            />
                        </div>
                        <div className='px-3'>
                            <p className='text-sm font-bold'>Job Function</p>
                            <input
                                type=""
                                placeholder=""
                                name=""
                                id=""
                                className="w-full border-[#E9F3FF] border-2 shadow-1 p-1 rounded-md"
                            />
                        </div>
                    </div>
                    <div className='col-span-2 flex flex-col gap-3'>
                        <div className='px-3 '>
                            <p className='text-sm font-bold'>Target</p>
                            <input
                                type=""
                                placeholder=""
                                name=""
                                id=""
                                className="w-full border-[#E9F3FF] border-2 shadow-1 p-1 rounded-md"
                            />
                        </div>
                        <div className='px-3'>
                            <p className='text-sm font-bold'>Bobot</p>
                            <input
                                type=""
                                placeholder=""
                                name=""
                                id=""
                                className="w-full border-[#E9F3FF] border-2 shadow-1 p-1 rounded-md"
                            />
                        </div>
                    </div>
                    <div className='col-span-2 flex flex-col gap-3'>
                        <div className='px-3 '>
                            <p className='text-sm font-bold'>End of 0% Point</p>
                            <input
                                type=""
                                placeholder=""
                                name=""
                                id=""
                                className="w-full border-[#E9F3FF] border-2 shadow-1 p-1 rounded-md"
                            />
                        </div>
                        <div className='px-3'>
                            <p className='text-sm font-bold'>Start of 100% Point</p>
                            <input
                                type=""
                                placeholder=""
                                name=""
                                id=""
                                className="w-full border-[#E9F3FF] border-2 shadow-1 p-1 rounded-md"
                            />
                        </div>
                    </div>

                    <div className='col-span-2 flex flex-col gap-3 items-center justify-center my-auto'>

                        <div className='flex  gap-2 md:mt-0 mt-2'>

                            <input type="checkbox" id="item1" name="checklist" />
                            <label htmlFor="item1" className='text-xs font-semibold'>Lebih kecil lebih baik</label>
                        </div>
                        <button className='bg-primary text-white font-semibold text-sm py-2 rounded-sm w-11/12'>TAMBAH</button>
                    </div>
                </div>
                <div className='overflow-x-scroll'>

                    <div className='min-w-[700px] '>

                        <div className='flex gap-2 w-full bg-white mt-5 mb-2 p-2 '>
                            <p className='text-xs font-semibold w-5 '>No</p>
                            <div className='grid grid-cols-12 gap-1 w-full'>
                                <div className='text-xs font-semibold  col-span-3'> Casecade
                                </div>
                                <div className='text-xs font-semibold  col-span-4'> Job Function
                                </div>
                                <div className='text-xs font-semibold  col-span-1'> Target
                                </div>
                                <div className='text-xs font-semibold  col-span-1'> Bobot
                                </div>
                                <div className='text-xs font-semibold  col-span-1'> End of 0%
                                </div>
                                <div className='text-xs font-semibold  col-span-1'> Start of 100%
                                </div>
                                <div className='text-xs font-semibold  col-span-1'>
                                </div>



                            </div>

                        </div>
                        <div className='flex gap-2 w-full bg-white my-1 p-2'>
                            <p className='text-xs    font-medium w-5 '>1</p>
                            <div className='grid grid-cols-12 gap-1 w-full'>
                                <div className='text-xs  font-medium  col-span-3'> Pelaksanaan PM
                                </div>
                                <div className='text-xs  font-medium  col-span-4'> Submit Pelaksanaan PM 2 Sesuai Checklist
                                </div>
                                <div className='text-xs  font-medium  col-span-1'> &gt;= 80%
                                </div>
                                <div className='text-xs  font-medium  col-span-1'> 6
                                </div>
                                <div className='text-xs  font-medium  col-span-1'> 30%
                                </div>
                                <div className='text-xs  font-medium  col-span-1'> 75%
                                </div>
                                <div className='text-xs  font-medium  col-span-1 flex justify-end'> <img src={Shortup} className='w-5' alt="" />
                                </div>



                            </div>

                        </div>
                        <div className='flex gap-2 w-full bg-white my-1 p-2'>
                            <p className='text-xs    font-medium w-5 '>2</p>
                            <div className='grid grid-cols-12 gap-1 w-full'>
                                <div className='text-xs  font-medium  col-span-3'> Casecade
                                </div>
                                <div className='text-xs  font-medium  col-span-4'> Job Function
                                </div>
                                <div className='text-xs  font-medium  col-span-1'> Target
                                </div>
                                <div className='text-xs  font-medium  col-span-1'> Bobot
                                </div>
                                <div className='text-xs  font-medium  col-span-1'> End of 0%
                                </div>
                                <div className='text-xs  font-medium  col-span-1'> Start of 100%
                                </div>
                                <div className='text-xs  font-medium  col-span-1 flex justify-end'>  <img src={Shortdown} className='w-5' alt="" />
                                </div>



                            </div>
                        </div>


                        <div className='bg-white w-full p-3 rounded-sm'> <button className='bg-primary text-white font-semibold text-xs px-15 py-2 rounded-sm'>Simpan</button></div>
                    </div>
                </div>

            </>
        </DefaultLayout>
    )
}

export default MasterKPIForm