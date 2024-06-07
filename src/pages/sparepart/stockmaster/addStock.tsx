import React from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'

function AddStock() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Maintenance &gt; Sparepart  &gt; Stock Master  &gt; Add Stock</p>
                <div className='grid md:grid-cols-3 gap-5 p-3 bg-white text-black'>
                    <div className="mt-5 flex flex-col justify-center px-2">
                        <p className="text-xs font-semibold">Kode barang</p>
                        <div className="flex justify-center items-center">
                            <div className="relative z-20 border-2 border-[#EDEDED] shadow-md rounded-md dark:bg-form-input  w-full mt-2">
                                <span className="absolute top-1/2 left-4 z-30 -translate-y-1/2">
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 20 20"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    ></svg>
                                </span>

                                <select
                                    className={`relative font-medium z-20 w-full appearance-none rounded border border-stroke bg-transparent py-1   px-1 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-inputtext-black dark:text-white' 
                                            }`}
                                >
                                    <option
                                        value="d"
                                        className="text-body dark:text-bodydark"
                                    >
                                        All
                                    </option>
                                    <option
                                        value="N"
                                        className="text-body dark:text-bodydark"
                                    >
                                        PON MANUAL 2
                                    </option>
                                    <option
                                        value="O"
                                        className="text-body dark:text-bodydark"
                                    >
                                        R700
                                    </option>
                                </select>

                                <span className="absolute top-1/2 right-4 z-10 -translate-y-1/2">
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
                    <div className="mt-5 flex flex-col justify-center px-2">
                        <p className="text-xs font-semibold">Part Number</p>
                        <div className="flex justify-center items-center">
                            <div className="relative z-20 border-2 border-[#EDEDED] shadow-md rounded-md dark:bg-form-input  w-full mt-2">
                                <span className="absolute top-1/2 left-4 z-30 -translate-y-1/2">
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 20 20"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    ></svg>
                                </span>

                                <select
                                    className={`relative font-medium z-20 w-full appearance-none rounded border border-stroke bg-transparent py-1   px-1 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-inputtext-black dark:text-white' 
                                            }`}
                                >
                                    <option
                                        value="d"
                                        className="text-body dark:text-bodydark"
                                    >
                                        All
                                    </option>
                                    <option
                                        value="N"
                                        className="text-body dark:text-bodydark"
                                    >
                                        PON MANUAL 2
                                    </option>
                                    <option
                                        value="O"
                                        className="text-body dark:text-bodydark"
                                    >
                                        R700
                                    </option>
                                </select>

                                <span className="absolute top-1/2 right-4 z-10 -translate-y-1/2">
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
                    <div className="mt-5 flex flex-col justify-center px-2">
                        <p className="text-xs font-semibold">Nama Barang</p>
                        <div className="flex justify-center items-center">
                            <div className="relative z-20 border-2 border-[#EDEDED] shadow-md rounded-md dark:bg-form-input  w-full mt-2">
                                <span className="absolute top-1/2 left-4 z-30 -translate-y-1/2">
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 20 20"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    ></svg>
                                </span>

                                <select
                                    className={`relative font-medium z-20 w-full appearance-none rounded border border-stroke bg-transparent py-1   px-1 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-inputtext-black dark:text-white' 
                                            }`}
                                >
                                    <option
                                        value="d"
                                        className="text-body dark:text-bodydark"
                                    >
                                        All
                                    </option>
                                    <option
                                        value="N"
                                        className="text-body dark:text-bodydark"
                                    >
                                        PON MANUAL 2
                                    </option>
                                    <option
                                        value="O"
                                        className="text-body dark:text-bodydark"
                                    >
                                        R700
                                    </option>
                                </select>

                                <span className="absolute top-1/2 right-4 z-10 -translate-y-1/2">
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
                    <div className="mt-5 flex flex-col justify-center px-2">
                        <p className="text-xs font-semibold">Nama Mesin</p>
                        <div className="flex justify-center items-center">
                            <div className="relative z-20 border-2 border-[#EDEDED] shadow-md rounded-md dark:bg-form-input  w-full mt-2">
                                <span className="absolute top-1/2 left-4 z-30 -translate-y-1/2">
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 20 20"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    ></svg>
                                </span>

                                <select
                                    className={`relative font-medium z-20 w-full appearance-none rounded border border-stroke bg-transparent py-1   px-1 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-inputtext-black dark:text-white' 
                                            }`}
                                >
                                    <option
                                        value="d"
                                        className="text-body dark:text-bodydark"
                                    >
                                        All
                                    </option>
                                    <option
                                        value="N"
                                        className="text-body dark:text-bodydark"
                                    >
                                        PON MANUAL 2
                                    </option>
                                    <option
                                        value="O"
                                        className="text-body dark:text-bodydark"
                                    >
                                        R700
                                    </option>
                                </select>

                                <span className="absolute top-1/2 right-4 z-10 -translate-y-1/2">
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
                    <div className="mt-5 flex flex-col justify-center px-2">
                        <p className="text-xs font-semibold">Lokasi</p>
                        <div className="flex justify-center items-center">
                            <div className="relative z-20 border-2 border-[#EDEDED] shadow-md rounded-md dark:bg-form-input  w-full mt-2">

                                <input
                                    className={`relative font-medium z-20 w-full appearance-none rounded border border-stroke bg-transparent py-1   px-1 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-inputtext-black dark:text-white' 
                                            }`}
                                />



                            </div>
                        </div>
                    </div>
                    <div className="mt-5 flex flex-col justify-center px-2">
                        <p className="text-xs font-semibold">Umur Original</p>
                        <div className="flex justify-center items-center">
                            <div className="relative z-20 border-2 border-[#EDEDED] shadow-md rounded-md dark:bg-form-input  w-full mt-2">

                                <input
                                    className={`relative font-medium z-20 w-full appearance-none rounded border border-stroke bg-transparent py-1   px-1 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-inputtext-black dark:text-white' 
                                                }`}
                                />



                            </div>
                        </div>
                    </div>
                    <div className="mt-5 flex flex-col justify-center px-2">
                        <p className="text-xs font-semibold">Grade (keperluan awal)</p>
                        <div className="flex justify-center items-center">
                            <div className="relative z-20 border-2 border-[#EDEDED] shadow-md rounded-md dark:bg-form-input  w-full mt-2">

                                <input
                                    className={`relative font-medium z-20 w-full appearance-none rounded border border-stroke bg-transparent py-1   px-1 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-inputtext-black dark:text-white' 
                                                }`}
                                />



                            </div>
                        </div>
                    </div>
                    <div className="mt-5 flex flex-col justify-center px-2">
                        <p className="text-xs font-semibold">Quantity</p>
                        <div className="flex justify-center items-center">
                            <div className="relative z-20 border-2 border-[#EDEDED] shadow-md rounded-md dark:bg-form-input  w-full mt-2">

                                <input
                                    className={`relative font-medium z-20 w-full appearance-none rounded border border-stroke bg-transparent py-1   px-1 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-inputtext-black dark:text-white' 
                                                }`}
                                />



                            </div>
                        </div>
                    </div>
                    <div className="mt-5 flex flex-col justify-center px-2">
                        <p className="text-xs font-semibold">Type Part </p>
                        <div className="flex justify-center items-center">
                            <div className="relative z-20 border-2 border-[#EDEDED] shadow-md rounded-md dark:bg-form-input  w-full mt-2">
                                <span className="absolute top-1/2 left-4 z-30 -translate-y-1/2">
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 20 20"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    ></svg>
                                </span>

                                <select
                                    className={`relative font-medium z-20 w-full appearance-none rounded border border-stroke bg-transparent py-1   px-1 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-inputtext-black dark:text-white' 
                                            }`}
                                >
                                    <option
                                        value="d"
                                        className="text-body dark:text-bodydark"
                                    >
                                        All
                                    </option>
                                    <option
                                        value="N"
                                        className="text-body dark:text-bodydark"
                                    >
                                        PON MANUAL 2
                                    </option>
                                    <option
                                        value="O"
                                        className="text-body dark:text-bodydark"
                                    >
                                        R700
                                    </option>
                                </select>

                                <span className="absolute top-1/2 right-4 z-10 -translate-y-1/2">
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
                    <div className="mt-5 flex flex-col justify-center px-2">
                        <p className="text-xs font-semibold">Set Buffer Stock (Khusus Consumable)</p>
                        <div className="flex justify-center items-center">
                            <div className="relative z-20 border-2 border-[#EDEDED] shadow-md rounded-md dark:bg-form-input  w-full mt-2">

                                <input
                                    className={`relative font-medium z-20 w-full appearance-none rounded border border-stroke bg-transparent py-1   px-1 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-inputtext-black dark:text-white' 
                                                }`}
                                />



                            </div>
                        </div>
                    </div>
                    <div className="mt-5 flex flex-col justify-center px-2">
                        <p className="text-xs font-semibold">Foto</p>
                        <div className="flex justify-center items-center">
                            <div className="relative z-20 border-2 border-[#EDEDED] shadow-md rounded-md dark:bg-form-input  w-full mt-2">

                                <input
                                    className={`relative font-medium z-20 w-full appearance-none rounded border border-stroke bg-transparent py-1   px-1 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-inputtext-black dark:text-white' 
                                                }`}
                                />



                            </div>
                        </div>
                    </div>
                    <div className='flex justify-end items-center'>

                        <button className='bg-green-500 h-9 px-10 text-white font-semibold rounded-md text-xs'>SAVE</button>
                    </div>
                </div>
            </>
        </DefaultLayout>
    )
}

export default AddStock