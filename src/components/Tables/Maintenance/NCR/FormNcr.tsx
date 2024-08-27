import axios from 'axios';
import React, { useEffect, useState } from 'react'


function FormNcrMTC() {


    return (

        <>
            <div className=' flex flex-col bg-white py-4 w-full mt-2 mb-2 px-5 text-sm  rounded-md'>

                <div className='grid grid-cols-12 w-full'>
                    <div className='col-span-3 text-black text-xs font-bold'>ISI LAPORAN KETIDAK SESUAIAN</div>
                </div>

                <div className='grid grid-cols-12  w-full pt-4 '>
                    <div className='col-span-6 text-[#646464]   flex flex-col gap-1'>
                        <p className='font-bold'>
                            KATEGORI LAPORAN
                        </p>
                        <div className="relative z-20 h-10 bg-white dark:bg-form-input  w-full">
                            <span className="absolute top-1/2 left-4 z-30 -translate-y-1/2">
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >

                                </svg>
                            </span>

                            <select

                                className={`relative z-20 w-full bg-[#64646424] appearance-none rounded-md h-7 py-1 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input  
                                    }`}
                            >
                                <option value="pon" selected disabled className="text-[#646464] text-xs dark:text-bodydark">
                                    Pilih Kategori
                                </option>

                                <option value="pon" className="text-[#646464] text-xs dark:text-bodydark">
                                    MAN
                                </option>
                                <option value="pon" className="text-[#646464] text-xs dark:text-bodydark">
                                    PRODUCTION
                                </option>
                            </select>

                            <span className="absolute top-[15px] right-4 z-10 -translate-y-1/2">
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <g opacity="0.8">
                                        <path
                                            fillRule="evenodd"
                                            clipRule="evenodd"
                                            d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                                            fill="#637381"
                                        ></path>
                                    </g>
                                </svg>
                            </span>

                        </div>


                    </div>

                </div>
                <div className='grid grid-cols-12  pt-2 gap-2'>
                    <div className='w-full col-span-3 gap-3'>
                        <div className='flex flex-col gap-1'>
                            <p className='font-bold'>
                                WAKTU
                            </p>
                            <input type="text" placeholder='ISI' disabled className='bg-[#64646424] rounded-md h-7 pl-4' ></input>
                        </div>


                    </div>
                    <div className='w-full col-span-3 gap-3'>
                        <div className='flex flex-col gap-1'>
                            <p className='font-bold'>
                                PELAPOR
                            </p>
                            <input type="text" placeholder='ISI' disabled className='bg-[#64646424] rounded-md h-7 pl-4' ></input>
                        </div>

                    </div>
                    <div className='w-full col-span-6 gap-3'>
                        <p className='font-bold'>
                            DEPARTEMEN
                        </p>
                        <div className="relative z-20 h-7 bg-white dark:bg-form-input  w-full pt-1">
                            <span className="absolute top-1/2 left-4 z-30 -translate-y-1/2">
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >

                                </svg>
                            </span>

                            <select

                                className={`relative z-20 w-full bg-white border border-stroke appearance-none rounded-md h-7 py-1 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input  
                                    }`}
                            >
                                <option value="pon" selected disabled className="text-[#646464] text-xs dark:text-bodydark">
                                    Pilih Departemen
                                </option>

                                <option value="pon" className="text-[#646464] text-xs dark:text-bodydark">
                                    MAN
                                </option>
                                <option value="pon" className="text-[#646464] text-xs dark:text-bodydark">
                                    PRODUCTION
                                </option>
                            </select>

                            <span className="absolute top-[18px] right-4 z-30 -translate-y-1/2">
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <g opacity="0.8">
                                        <path
                                            fillRule="evenodd"
                                            clipRule="evenodd"
                                            d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                                            fill="#637381"
                                        ></path>
                                    </g>
                                </svg>
                            </span>

                        </div>
                    </div>

                </div>
                <div className='grid grid-cols-12  pt-2 gap-2'>
                    <div className='col-span-6 flex flex-col gap-1'>
                        <p className='font-bold'>
                            No. JO
                        </p>
                        <input type="text" className='bg-white border border-stroke rounded-md h-7 pl-4' ></input>
                        <p className='font-bold pt-2'>
                            PRODUK
                        </p>
                        <input type="text" placeholder='ISI' disabled className='bg-[#64646424] rounded-md h-7 pl-4' ></input>
                    </div>
                    <div className='col-span-6'>
                        <p className='font-bold'>
                            KETIDAKSESUAIAN
                        </p>
                        <textarea

                            className="peer h-full  w-full resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                        ></textarea>
                    </div>
                </div>
                <div className='grid grid-cols-12  pt-10 gap-2'>
                    <div className='col-span-6'></div>
                    <div className='col-span-6 gap-2 flex flex-col'>
                        <p className='font-bold'>
                            GAMBAR
                        </p>
                        <div className="flex  lg:w-[389px] rounded-md border border-stroke px-2 py-2">
                            <label
                                htmlFor="formFile"
                                className="flex items-center px-12 py-1 rounded-md bg-primary text-white font-medium cursor-pointer hover:bg-primary-dark"
                            >
                                Pilih File
                                <input
                                    type="file"
                                    id="formFile"
                                    accept="image/*"
                                    className="hidden"
                                />
                            </label>


                        </div>
                        <button

                            className=" w-[10%] h-10 rounded-md pt-2 bg-blue-600 text-white text-sm font-bold justify-center items-center px-4 py-2 hover:cursor-pointer"
                        >
                            +
                        </button>

                        <button

                            className=" w-full h-10 rounded-md pt-2 bg-blue-600 text-white text-sm font-bold justify-center items-center px-4 py-2 hover:cursor-pointer"
                        >
                            KIRIM LAPORAN
                        </button>
                    </div>
                </div>
            </div>

        </>

    )
}

export default FormNcrMTC