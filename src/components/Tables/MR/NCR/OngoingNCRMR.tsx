import axios from 'axios';
import React, { useEffect, useState } from 'react'
import Arrow from '../../../../images/icon/arrowDown.svg';
import Burger from '../../../../images/icon/burger.svg';
import Filter from '../../../../images/icon/filter.svg';

function OngoingNCRMR() {


    return (

        <>
            <div className=' flex bg-white py-2 w-full  px-5 text-sm font-semibold jus  border-b-1 border-[#D8EAFF]'>
                <div className="flex justify-between w-full">
                    <img src={Filter} alt="" className="mx-3 my-auto" />
                    <input
                        type="search"
                        placeholder="Search"
                        name=""
                        id=""
                        className="md:w-96 w-40 py-1 mx-3 px-3 bg-[#E9F3FF]"
                    />
                </div>

            </div>
            <div className=' flex bg-white py-2 w-full mt-2 mb-2 px-5 text-sm font-semibold   border-b-1 border-[#D8EAFF]'>
                <p className='w-20'>No</p>
                <div className='grid grid-cols-12 w-full'>
                    <div className='col-span-3'>No. NCR</div>
                    <div className='col-span-2'>No. JO</div>
                    <div className='col-span-3'>Kategori Laporan</div>
                    <div className='col-span-2'>Status</div>
                    <div className='col-span-2 flex w-full justify-end'>Action</div>
                </div>

            </div>
            <div className=' flex bg-white py-2 w-full mt-2 mb-2 px-5 text-sm font-semibold rounded-md  items-center'>
                <p className='w-20'>1</p>
                <div className='grid grid-cols-12 w-full text-[#6c6b6b] text-sm font-light items-center'>
                    <div className='col-span-3'>001/NCR/08/2024</div>
                    <div className='col-span-2'>000/000/000A</div>
                    <div className='col-span-3'>GENERAL</div>
                    <div className='col-span-2 text-red-700 bg-yellow-300 rounded-full flex w-full items-center justify-center'>Menunggu Validasi MR</div>
                    <div className='col-span-2 w-full flex justify-end'>
                        <div className="flex gap-2 items-center justify-center">
                            <button
                                title="button"

                                className="text-xs w-7 h-7 font-bold text-blue-700 bg-blue-700  border-blue-700 border rounded-md"
                            >

                                <img src={Burger} alt="" className="mx-auto" />
                            </button>

                            <button
                                title="button"

                                className="text-xs w-7 h-7 font-bold text-blue-700 bg-blue-700  border-blue-700 border rounded-md"
                            >

                                <img src={Arrow} alt="" className="mx-auto" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </>

    )
}

export default OngoingNCRMR