import axios from 'axios';
import React, { useEffect, useState } from 'react'
import Arrow from '../../../../images/icon/arrowDown.svg';

function NcrDibuatMTC() {


    return (

        <>
            <div className=' flex bg-white py-2 w-full mt-2 mb-2 px-5 text-sm font-semibold rounded-md  border-b-1 border-[#D8EAFF]'>
                <p className='w-20'>No</p>
                <div className='grid grid-cols-12 w-full'>
                    <div className='col-span-3'>No. NCR</div>
                    <div className='col-span-2'>No. JO</div>
                    <div className='col-span-3'>Kategori Laporan</div>
                    <div className='col-span-2'>Status</div>
                </div>

            </div>
            <div className=' flex bg-white py-2 w-full mt-2 mb-2 px-5 text-sm font-semibold rounded-md  items-center'>
                <p className='w-20'>1</p>
                <div className='grid grid-cols-12 w-full text-[#6c6b6b] text-sm font-light items-center'>
                    <div className='col-span-3'>001/NCR/08/2024</div>
                    <div className='col-span-2'>000/000/000A</div>
                    <div className='col-span-3'>GENERAL</div>
                    <div className='col-span-2 text-red-700 bg-yellow-300 rounded-full flex w-full items-center justify-center'>Menunggu Validasi QA</div>
                    <div className='col-span-2 w-full flex justify-end'>
                        <div className="flex flex-col items-center justify-center">
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

export default NcrDibuatMTC