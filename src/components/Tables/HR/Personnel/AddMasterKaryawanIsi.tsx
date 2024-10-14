import React from 'react'

function AddMasterKaryawanIsi() {
    return (
        <main className="overflow-x-scroll">
            <div className="min-w-[700px] bg-white rounded-t-md border-b-8 border-[#D8EAFF] h-12">

            </div>
            <div className="min-w-[700px] bg-white  border-b-8 border-[#D8EAFF] ">
                <div className='flex w-full bg-[#eeeeee] px-6 py-3'>
                    <label className='text-[#0065de] text-sm font-semibold'>
                        BIODATA
                    </label>

                </div>
                <div className=' w-full bg-white px-6 py-4 grid grid-cols-2 gap-3'>
                    <div className='flex flex-col gap-2 justify-between'>
                        <div>
                            <label className=' text-sm font-semibold'>
                                NIK<span className='text-red-600'>*</span>
                            </label>
                            <div className='flex w-full gap-7'>
                                <input type='text' className='border-stroke border-2 rounded-md w-[40%]' />
                                <div className='flex gap-1'>
                                    <input type='radio' name='kelamin' id='kelamin1' value={'Laki-Laki'} />Laki-Laki
                                </div>

                                <div className='flex gap-1'>
                                    <input type='radio' name='kelamin' id='kelamin2' value={'Perempuan'} />Perempuan
                                </div>

                            </div>
                            <div className='flex flex-col gap-1'>
                                <label className=' text-sm font-semibold'>
                                    Nama Karyawan<span className='text-red-600'>*</span>
                                </label>
                                <input type='text' className='border-stroke border-2 rounded-md w-[40%]' />
                            </div>
                        </div>
                        <div>
                            <div className='flex flex-col gap-1'>
                                <label className=' text-sm font-semibold'>
                                    Divisi<span className='text-red-600'>*</span>
                                </label>
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
                                        <option selected disabled className="text-[#646464] text-xs dark:text-bodydark">
                                            Divisi
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
                            <div className='flex gap-4'>
                                <div className='flex flex-col gap-1 w-[60%]'>
                                    <label className=' text-sm font-semibold'>
                                        Departemen<span className='text-red-600'>*</span>
                                    </label>
                                    <input type='text' className='border-stroke border-2 rounded-md w-full' />
                                </div>
                                <div className='flex flex-col gap-1 w-[40%]'>
                                    <label className=' text-sm font-semibold'>
                                        Grade<span className='text-red-600'>*</span>
                                    </label>
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
                                            <option selected disabled className="text-[#646464] text-xs dark:text-bodydark">
                                                Grade
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

                        </div>
                    </div>
                    <div className=''>
                        <div className='flex w-full gap-3'>
                            <div className='flex flex-col gap-1 w-[50%]'>
                                <label className=' text-sm font-semibold'>
                                    Tanggal Masuk<span className='text-red-600'>*</span>
                                </label>
                                <input
                                    type="date"
                                    className='border-2 border-stroke rounded-md'
                                ></input>
                            </div>
                            <div className='flex flex-col gap-1 w-[50%]'>
                                <label className=' text-sm font-semibold'>
                                    Status Karyawan<span className='text-red-600'>*</span>
                                </label>
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
                                        <option selected disabled className="text-[#646464] text-xs dark:text-bodydark">
                                            Status
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
                        <div className='flex w-full gap-3'>
                            <div className='flex flex-col gap-1 w-[50%]'>
                                <label className=' text-sm font-semibold'>
                                    Tanggal Keluar
                                </label>
                                <input
                                    type="date"
                                    className='border-2 border-stroke rounded-md'
                                ></input>
                            </div>
                            <div className='flex flex-col gap-1 w-[50%]'>
                                <label className=' text-sm font-semibold'>
                                    Status Pajak<span className='text-red-600'>*</span>
                                </label>
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
                                        <option selected disabled className="text-[#646464] text-xs dark:text-bodydark">
                                            Status Pajak
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
                        <div className='flex gap-2'>
                            <input type="checkbox" />
                            Aktif
                        </div>
                        <div className='flex flex-col gap-1 w-[50%]'>
                            <label className=' text-sm font-semibold'>
                                Tipe Penggajian<span className='text-red-600'>*</span>
                            </label>
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
                                    <option selected disabled className="text-[#646464] text-xs dark:text-bodydark">
                                        Tipe Penggajian
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

                        <div className='flex flex-col  '>
                            <div className='flex gap-3'>
                                <div className='flex flex-col gap-1 w-[50%]'>
                                    <label className=' text-sm font-semibold'>
                                        Bagian<span className='text-red-600'>*</span>
                                    </label>
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
                                            <option selected disabled className="text-[#646464] text-xs dark:text-bodydark">
                                                Bagian
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
                                <div className='flex flex-col gap-1 w-[50%]'>
                                    <label className=' text-sm font-semibold'>
                                        Level
                                    </label>
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
                                            <option selected disabled className="text-[#646464] text-xs dark:text-bodydark">
                                                Level
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
                            <div className='flex gap-3'>
                                <div className='flex flex-col gap-1 w-[50%]'>
                                    <label className=' text-sm font-semibold'>
                                        Jabatan<span className='text-red-600'>*</span>
                                    </label>
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
                                            <option selected disabled className="text-[#646464] text-xs dark:text-bodydark">
                                                Jabatan
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
                                <div className='flex flex-col gap-1 w-[50%]'>
                                    <label className=' text-sm font-semibold'>
                                        Sub-Level
                                    </label>
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
                                            <option selected disabled className="text-[#646464] text-xs dark:text-bodydark">
                                                Sub-Level
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
                        </div>

                    </div>
                </div>
                <div className='flex w-full bg-[#eeeeee] px-6 py-3'>
                    <label className='text-[#0065de] text-sm font-semibold'>
                        DETAIL INFORMASI
                    </label>

                </div>
                <div className=' w-full bg-white px-6 py-4 grid grid-cols-2 gap-3'>
                    <div className='flex gap-4 '>
                        <div className='flex flex-col gap-2  w-full'>
                            <label className=' text-sm font-semibold'>
                                Tempat / Tanggal Lahir<span className='text-red-600'>*</span>
                            </label>
                            <div className='flex gap-3 '>
                                <input type='text' className='border-stroke border-2 rounded-md w-[65%]' /> /
                                <input
                                    type="date"
                                    className='border-2 border-stroke rounded-md w-[35%]'
                                ></input>
                            </div>
                            <label className=' text-sm font-semibold'>
                                Agama
                            </label>
                            <input type='text' className='border-stroke border-2 rounded-md w-full' />
                            <label className=' text-sm font-semibold'>
                                Kewarganegaraan<span className='text-red-600'>*</span>
                            </label>
                            <input type='text' className='border-stroke border-2 rounded-md w-full' />
                            <label className=' text-sm font-semibold'>
                                Golongan Darah<span className='text-red-600'>*</span>
                            </label>
                            <input type='text' className='border-stroke border-2 rounded-md w-full' />
                            <label className=' text-sm font-semibold'>
                                Alamat<span className='text-red-600'>*</span>
                            </label>
                            <textarea

                                name=""
                                rows={3}
                                cols={6}
                                id=""
                                className="w-full p-2 bg-white border border-zinc-400 rounded-sm  resize-none"
                            ></textarea>
                            <label className=' text-sm font-semibold'>
                                Telepon
                            </label>
                            <input type='text' className='border-stroke border-2 rounded-md w-full' />
                            <label className=' text-sm font-semibold'>
                                Handphone
                            </label>
                            <input type='text' className='border-stroke border-2 rounded-md w-full' />
                            <label className=' text-sm font-semibold'>
                                Email
                            </label>
                            <input type='text' className='border-stroke border-2 rounded-md w-full' />
                        </div>
                    </div>

                    <div className='flex gap-4'>
                        <div className='flex flex-col gap-2 w-full pt-9'>
                            <label className='text-[#0065de] text-sm font-semibold'>
                                NPWP
                            </label>
                            <label className=' text-sm font-semibold'>
                                Nomor<span className='text-red-600'>*</span>
                            </label>
                            <input type='text' className='border-stroke border-2 rounded-md w-full' />

                            <label className=' text-sm font-semibold'>
                                Nama<span className='text-red-600'>*</span>
                            </label>
                            <input type='text' className='border-stroke border-2 rounded-md w-full' />

                            <label className=' text-sm font-semibold'>
                                Alamat<span className='text-red-600'>*</span>
                            </label>
                            <textarea

                                name=""
                                rows={3}
                                cols={6}
                                id=""
                                className="w-full p-2 bg-white border border-zinc-400 rounded-sm  resize-none"
                            ></textarea>

                            <label className=' text-sm font-semibold'>
                                Tanggal Pendaftaran<span className='text-red-600'>*</span>
                            </label>
                            <input type='date' className='border-stroke border-2 rounded-md w-[50%]' />

                            <div className='flex  w-full gap-4'>
                                <div className='flex flex-col w-[50%]'>
                                    <label className=' text-sm font-semibold'>
                                        No. KTP<span className='text-red-600'>*</span>
                                    </label>
                                    <input type='text' className='border-stroke border-2 rounded-md w-full' />
                                </div>
                                <div className='flex flex-col w-[50%]'>
                                    <label className=' text-sm font-semibold'>
                                        Berlaku s/d<span className='text-red-600'>*</span>
                                    </label>
                                    <input type='date' className='border-stroke border-2 rounded-md w-full' />
                                </div>
                            </div>
                            <label className=' text-sm font-semibold'>
                                No. BPJS<span className='text-red-600'>*</span>
                            </label>

                            <input type='text' className='border-stroke border-2 rounded-md w-full' />
                            <label className=' text-sm font-semibold'>
                                SIM 1
                            </label>
                            <div className='flex w-full gap-3'>
                                <div className='flex flex-col w-[20%]'>

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
                                            <option selected disabled className="text-[#646464] text-xs dark:text-bodydark">
                                                A
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
                                <div className='w-full'>
                                    <input type='text' className='border-stroke border-2 rounded-md w-full' />
                                </div>

                            </div>
                            <label className=' text-sm font-semibold'>
                                SIM 2
                            </label>
                            <div className='flex w-full gap-3'>
                                <div className='flex flex-col w-[20%]'>

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
                                            <option selected disabled className="text-[#646464] text-xs dark:text-bodydark">
                                                B
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
                                <div className='w-full'>
                                    <input type='text' className='border-stroke border-2 rounded-md w-full' />
                                </div>

                            </div>
                        </div>

                    </div>

                </div>
                <div className='flex w-full justify-end items-end px-8 py-5'>
                    <button className='bg-blue-500 text-white text-md px-4 py-1 rounded-md font-semibold'>
                        SIMPAN
                    </button>
                </div>
            </div>
        </main>
    )
}

export default AddMasterKaryawanIsi
