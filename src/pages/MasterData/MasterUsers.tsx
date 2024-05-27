import React from 'react'
import DefaultLayout from '../../layout/DefaultLayout'

function MasterUsers() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Master Data &gt; Users</p>
                <div className="flex w-full bg-white p-2">
                    <div className='flex justify-between w-full'>

                        <div className='flex'>
                            <input
                                type="search"
                                placeholder="search"
                                name=""
                                id=""
                                className="md:w-80 sm:w-32 w-40 py-1 mx-3 px-3 bg-[#E9F3FF]"
                            />

                            <div className='flex justify-center items-center py-1 pl-3'>

                                <p className='text-sm text-primary'>Role:</p>
                            </div>

                            <div className='flex justify-center items-center'>
                                <div className="relative z-20 bg-[#D8EAFF] rounded-md dark:bg-form-input  md:w-40 w-20 mx-3">
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
                                        className={`relative text-primary font-medium z-20 w-full appearance-none rounded border border-stroke bg-transparent py-1   px-1 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-inputtext-black dark:text-white' 
}`}
                                    >
                                        <option value="d" className="text-body dark:text-bodydark">
                                            All
                                        </option>
                                        <option value="d" className="text-body dark:text-bodydark">
                                            Admin
                                        </option>
                                        <option value="N" className="text-body dark:text-bodydark">
                                            Pelaksana non shift
                                        </option>
                                        <option value="O" className="text-body dark:text-bodydark">
                                            Supervisor
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
                            <div className='my-auto'>
                                <button className='w-20 text-xs font-semibold rounded-sm py-1 text-white bg-primary'>CARI</button>
                            </div>
                        </div>
                        <div className='my-auto w-full flex justify-end items-end'>
                            <button className='w-40 text-xs font-semibold rounded-sm py-1 text-white bg-primary '>ADD USER</button>
                        </div>
                    </div>
                </div>
                <div className=' flex bg-white py-2 w-full mt-2 mb-2 px-5 text-sm font-semibold'>
                    <p className='w-20'>No</p>
                    <div className='grid grid-cols-12 w-full'>
                        <div className='col-span-4'>Nama</div>
                        <div className='col-span-2'>NIK</div>
                        <div className='col-span-4'>Role</div>
                        <div className='col-span-2'></div>

                    </div>
                </div>
                <div className=' flex bg-white py-2 w-full mb-1 px-5 text-sm font-medium rounded-md'>
                    <p className='w-20'>1</p>
                    <div className='grid grid-cols-12 w-full'>
                        <div className='col-span-4'>Veratti </div>
                        <div className='col-span-2'>32101102399277</div>
                        <div className='col-span-4'>Pelaksana Non shift</div>
                        <div className='flex gap-3 col-span-2'>
                            <button className='py-1 w-20 bg-primary text-white text-xs rounded-sm font-semibold'>EDIT</button>
                            <button className='py-1 w-20 bg-red-500 text-white text-xs rounded-sm font-semibold'>DELETE</button>
                        </div>

                    </div>
                </div>
                <div className=' flex bg-white py-2 w-full mb-1 px-5 text-sm font-medium rounded-md'>
                    <p className='w-20'>1</p>
                    <div className='grid grid-cols-12 w-full'>
                        <div className='col-span-4'>Veratti </div>
                        <div className='col-span-2'>32101102399277</div>
                        <div className='col-span-4'>Pelaksana Non shift</div>
                        <div className='flex gap-3 col-span-2'>
                            <button className='py-1 w-20 bg-primary text-white text-xs rounded-sm font-semibold'>EDIT</button>
                            <button className='py-1 w-20 bg-red-500 text-white text-xs rounded-sm font-semibold'>DELETE</button>
                        </div>

                    </div>
                </div>

            </>
        </DefaultLayout>
    )
}

export default MasterUsers