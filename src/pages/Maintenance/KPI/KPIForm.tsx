import React from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'
import Filter from '../../../images/icon/filter.svg';
import Polygon6 from '../../../images/icon/Polygon6.svg';
import { Link } from 'react-router-dom';

function KPIForm() {
    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Key Performance Indicator &gt; Input </p>
            <section>

                <div className="flex  bg-white p-2">

                    <input
                        type="search"
                        placeholder="search"
                        name=""
                        id=""
                        className="md:w-96 w-40 py-1 mx-3 px-3 bg-[#E9F3FF]"
                    />
                    <div className='flex'>

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
                                    <option value="N" className="text-body dark:text-bodydark">
                                        Production
                                    </option>
                                    <option value="O" className="text-body dark:text-bodydark">
                                        Quality
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
                </div>
            </section>
            <section>
                <div className="flex bg-white mt-2 py-2">
                    <div className='flex items-center justify-center w-15 '>

                        <p className=" text-xs font-bold ">No</p>
                    </div>
                    <div className="grid grid-cols-8  w-full gap-2">
                        <div className="flex gap-1 items-center col-span-3  ">
                            <p className="text-xs font-bold ">Nama</p>

                        </div>
                        <div className="flex gap-1 items-center col-span-3 ">
                            <p className="text-xs font-bold ">Role</p>

                        </div>
                        <div className="flex gap-1 items-center col-span-2  ">
                            <p className="text-xs font-bold "></p>

                        </div>

                    </div>
                </div>
                <div className="flex bg-white mt-2 py-2 rounded-md">
                    <div className='flex items-center justify-center w-15 '>

                        <p className=" text-xs font-medium   ">1</p>
                    </div>
                    <div className="grid grid-cols-8  w-full gap-2">
                        <div className="flex gap-1 items-center col-span-3 ">
                            <p className="text-xs font-medium  ">Sergio Busquets</p>

                        </div>
                        <div className="flex gap-1 items-center col-span-3  ">
                            <p className="text-xs font-medium  ">Supervisor</p>

                        </div>
                        <div className="flex gap-1 items-center justify-end px-5  col-span-2  ">
                            <Link to='/maintenance/KPI/Form/Input' className='bg-primary md:px-10 px-5 font-semibold text-white text-xs py-1 rounded-sm'>INPUT</Link>
                        </div>

                    </div>
                </div>
                <div className="flex bg-white mt-2 py-2 rounded-md">
                    <div className='flex items-center justify-center w-15 '>

                        <p className=" text-xs font-medium   ">1</p>
                    </div>
                    <div className="grid grid-cols-8  w-full gap-2">
                        <div className="flex gap-1 items-center col-span-3 ">
                            <p className="text-xs font-medium  ">Sergio Busquets</p>

                        </div>
                        <div className="flex gap-1 items-center col-span-3  ">
                            <p className="text-xs font-medium  ">Supervisor</p>

                        </div>
                        <div className="flex gap-1 items-center justify-end px-5  col-span-2  ">
                            <Link to='/maintenance/KPI/Form/Input' className='bg-primary md:px-10 px-5 font-semibold text-white text-xs py-1 rounded-sm'>INPUT</Link>
                        </div>

                    </div>
                </div>
                <div className="flex bg-white mt-2 py-2 rounded-md">
                    <div className='flex items-center justify-center w-15 '>

                        <p className=" text-xs font-medium   ">1</p>
                    </div>
                    <div className="grid grid-cols-8  w-full gap-2">
                        <div className="flex gap-1 items-center col-span-3 ">
                            <p className="text-xs font-medium  ">Sergio Busquets</p>

                        </div>
                        <div className="flex gap-1 items-center col-span-3  ">
                            <p className="text-xs font-medium  ">Supervisor</p>

                        </div>
                        <div className="flex gap-1 items-center justify-end px-5  col-span-2  ">
                            <Link to='/maintenance/KPI/Form/Input' className='bg-primary md:px-10 px-5 font-semibold text-white text-xs py-1 rounded-sm'>INPUT</Link>
                        </div>

                    </div>
                </div>
            </section>
        </DefaultLayout>
    )
}

export default KPIForm