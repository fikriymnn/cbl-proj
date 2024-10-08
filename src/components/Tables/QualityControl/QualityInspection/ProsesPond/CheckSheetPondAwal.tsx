import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';



function CheckSheetPondAwal() {
    const [isMobile, setIsMobile] = useState(false);


    return (
        <>

            {!isMobile && (
                <main className='overflow-x-hidden'>
                    <div className='min-w-[700px] bg-white rounded-xl'>

                        <p className='text-[14px] font-semibold w-full flex border-b-8 border-[#D8EAFF] py-4 px-9 md:ps-9 ps-12'>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12ZM13 8C13 8.55228 12.5523 9 12 9C11.4477 9 11 8.55228 11 8C11 7.44772 11.4477 7 12 7C12.5523 7 13 7.44772 13 8ZM13 17V11H11V17H13Z" fill="#0065DE" />
                            </svg>
                            {" "} Printing Checksheet
                        </p>

                        <div className='grid grid-cols-12  border-b-8 border-[#D8EAFF]'>
                            <div className='grid grid-rows-6 gap-2 col-span-2 pl-6 py-4 '>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    Tanggal
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    Jumlah Druk
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    Ukuran Jadi
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    Jenis Kertas
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    Jenis Gramatur
                                </label>


                            </div>
                            <div className='grid grid-rows-6 gap-2 col-span-2  py-4'>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    : Tanggal
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    : Jumlah Druk / Mata
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    : 0 x 0 x 0
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    : Jenis Kertas
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    : Jenis Gramatur
                                </label>


                            </div>

                            <div className='grid grid-rows-6  gap-2 col-span-2 justify-between px-10 py-4'>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    Jam
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>

                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    No. JO / IO
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    Nama Produk
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    Customer
                                </label>

                            </div>
                            <div className='grid grid-rows-6  gap-2 col-span-2 justify-between px-2 py-4'>


                                <label className='text-neutral-500 text-sm font-semibold'>
                                    : Jam
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>

                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    : No. JO / IO
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    : Nama Produk
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    : Customer
                                </label>

                            </div>
                            <div className='grid grid-rows-6  gap-2 col-span-2 justify-between px-10 py-4'>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    Shift
                                </label>

                                <label className='text-neutral-500 text-sm font-semibold'>
                                    Mesin
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    Operator
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    Status
                                </label>

                            </div>
                            <div className='grid grid-rows-6  gap-2 col-span-2 justify-between px-2 py-4'>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    : Jam
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    :
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    : No. JO / IO
                                </label>
                                <label className='text-neutral-500 text-sm font-semibold'>
                                    : Nama Produk
                                </label>


                            </div>

                        </div>

                        {/* =============================chekcsheet========================= */}
                        <>
                            <div className='flex flex-col py-6 px-10 border-b-8 border-[#D8EAFF]'>
                                <div className=' px-3   gap-2'>

                                    <label className='text-neutral-500 text-sm font-semibold '>
                                        PENGECEKAN AWAL 1
                                    </label>

                                </div>
                                <div className='grid grid-cols-8 px-3 pt-4  gap-2'>
                                    <div className='flex flex-col col-span-2'>
                                        <label className='text-neutral-500 text-sm font-semibold '>
                                            Inspektor
                                        </label>
                                        <label className='text-neutral-500 text-sm font-semibold '>
                                            Christian Bale
                                        </label>
                                    </div>

                                    <div className='flex flex-col col-span-2'>

                                        <div>

                                            <p className="md:text-[14px] text-[9px] font-semibold">
                                                Time : -

                                            </p>
                                            <>

                                                <button

                                                    className="flex w-[50%]  rounded-md bg-[#00B81D] justify-center items-center px-2 py-2 hover:cursor-pointer"
                                                >
                                                    <svg
                                                        width="14"
                                                        height="14"
                                                        viewBox="0 0 14 14"
                                                        fill="none"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path
                                                            d="M12.7645 4.95136L3.63887 0.27536C1.96704 -0.581285 0 0.664567 0 2.58008V11.4199C0 13.3354 1.96704 14.5813 3.63887 13.7246L12.7645 9.04864C14.4118 8.20456 14.4118 5.79544 12.7645 4.95136Z"
                                                            fill="white"
                                                        />
                                                    </svg>
                                                </button>
                                            </>

                                        </div>

                                    </div>

                                    <div className='flex flex-col col-span-2'>

                                        <>
                                            <div className="flex flex-col ">
                                                <p className="md:text-[14px] text-[9px] font-semibold">
                                                    Upload Foto (Optional):
                                                </p>


                                                <div className="">
                                                    <input
                                                        disabled
                                                        type="file"
                                                        name=""
                                                        id=""
                                                        className="w-60"
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    </div>

                                </div>
                            </div>
                            <div className='grid grid-cols-7 border-b-8 border-[#D8EAFF]'>
                                <div className='grid py-4 bg-[#f3f3f3] items-center'>
                                    <label className='text-center text-[#6c6b6b] text-sm font-semibold'>
                                        LINE CLEARANCE
                                    </label>
                                </div>
                                <div className='grid py-4 bg-white items-center'>
                                    <label className='text-center text-[#6c6b6b] text-sm font-semibold'>
                                        REGISTER
                                    </label>
                                </div>
                                <div className='grid py-4 bg-[#f3f3f3] items-center'>
                                    <label className='text-center text-[#6c6b6b] text-sm font-semibold'>
                                        KETAJAMAN
                                    </label>
                                </div>
                                <div className='grid py-4 bg-white items-center'>
                                    <label className='text-center text-[#6c6b6b] text-sm font-semibold'>
                                        UKURAN
                                    </label>
                                </div>
                                <div className='grid py-4 bg-[#f3f3f3] items-center'>
                                    <label className='text-center text-[#6c6b6b] text-sm font-semibold'>
                                        BENTUK JADI
                                    </label>
                                </div>
                                <div className='grid py-4 bg-white items-center'>
                                    <label className='text-center text-[#6c6b6b] text-sm font-semibold'>
                                        RIIL
                                    </label>
                                </div>
                                <div className='grid py-4 bg-[#f3f3f3] items-center'>
                                    <label className='text-center text-[#6c6b6b] text-sm font-semibold'>
                                        REFORMASI
                                    </label>
                                </div>

                            </div>
                            <div className='grid grid-cols-7 border-b-8 border-[#D8EAFF]'>
                                <div className='grid py-4 bg-[#f3f3f3] items-center justify-center'>
                                    <>
                                        <div>
                                            <input

                                                type="radio" id="ok11" name="ok11" value="OK" />
                                            <label className='pl-2'>OK</label>
                                        </div>
                                        <div>
                                            <input

                                                type="radio" id="ok12" name="ok11" value="Not OK" />
                                            <label className='pl-2'>Not OK</label>
                                        </div>
                                    </>
                                </div>
                                <div className='grid py-4 bg-white items-center justify-center'>
                                    <>
                                        <div>
                                            <input

                                                type="radio" id="ok11" name="ok11" value="OK" />
                                            <label className='pl-2'>OK</label>
                                        </div>
                                        <div>
                                            <input

                                                type="radio" id="ok12" name="ok11" value="Not OK" />
                                            <label className='pl-2'>Not OK</label>
                                        </div>
                                    </>
                                </div>
                                <div className='grid py-4 bg-[#f3f3f3] items-center justify-center'>
                                    <>
                                        <div>
                                            <input

                                                type="radio" id="ok11" name="ok11" value="OK" />
                                            <label className='pl-2'>OK</label>
                                        </div>
                                        <div>
                                            <input

                                                type="radio" id="ok12" name="ok11" value="Not OK" />
                                            <label className='pl-2'>Not OK</label>
                                        </div>
                                    </>
                                </div>
                                <div className='grid py-4 bg-white items-center justify-center'>
                                    <>
                                        <div>
                                            <input

                                                type="radio" id="ok11" name="ok11" value="OK" />
                                            <label className='pl-2'>OK</label>
                                        </div>
                                        <div>
                                            <input

                                                type="radio" id="ok12" name="ok11" value="Not OK" />
                                            <label className='pl-2'>Not OK</label>
                                        </div>
                                    </>
                                </div>
                                <div className='grid py-4 bg-[#f3f3f3] items-center justify-center'>
                                    <>
                                        <div>
                                            <input

                                                type="radio" id="ok11" name="ok11" value="OK" />
                                            <label className='pl-2'>OK</label>
                                        </div>
                                        <div>
                                            <input

                                                type="radio" id="ok12" name="ok11" value="Not OK" />
                                            <label className='pl-2'>Not OK</label>
                                        </div>
                                    </>
                                </div>
                                <div className='grid py-4 bg-white items-center justify-center'>
                                    <>
                                        <div>
                                            <input

                                                type="radio" id="ok11" name="ok11" value="OK" />
                                            <label className='pl-2'>OK</label>
                                        </div>
                                        <div>
                                            <input

                                                type="radio" id="ok12" name="ok11" value="Not OK" />
                                            <label className='pl-2'>Not OK</label>
                                        </div>
                                    </>
                                </div>
                                <div className='grid py-4 bg-[#f3f3f3] items-center justify-center'>
                                    <>
                                        <div>
                                            <input

                                                type="radio" id="ok11" name="ok11" value="OK" />
                                            <label className='pl-2'>OK</label>
                                        </div>
                                        <div>
                                            <input

                                                type="radio" id="ok12" name="ok11" value="Not OK" />
                                            <label className='pl-2'>Not OK</label>
                                        </div>
                                    </>
                                </div>

                            </div>
                            <div className='grid grid-cols-10 border-b-8 border-[#D8EAFF] px-4 py-4 gap-3'>
                                <div className='grid col-span-8'>
                                    <label className=' text-[#6c6b6b] text-sm font-semibold'>
                                        Catatan<span className='text-red-500'>*</span> :
                                    </label>
                                    <textarea

                                        className="peer h-full min-h-[100px] w-full resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                                    ></textarea>
                                </div>
                                <div className='grid col-span-2 items-end justify-center'>
                                    <button

                                        className=" w-full h-10 rounded-sm bg-[#00B81D] text-white text-xs font-bold justify-center items-center px-10 py-2 hover:cursor-pointer"
                                    >
                                        SIMPAN PERIODE
                                    </button>
                                </div>
                            </div>
                        </>
                    </div>
                    <button

                        className=" w-[16%] h-10 rounded-sm bg-blue-600 text-white text-sm font-bold justify-center items-center px-4 py-2 hover:cursor-pointer"
                    >
                        + Periode Check
                    </button>

                    <div className='grid grid-cols-10 border-b-8 items-center border-[#D8EAFF] px-4 py-4 gap-3 bg-white rounded-b-xl mt-2'>

                        <label className=' text-[#6c6b6b] text-sm font-semibold col-span-2'>
                            Jumlah Periode Check : 1
                        </label>
                        <label className=' text-[#6c6b6b] text-sm font-semibold col-span-2'>
                            Waktu Check : 5 Menit
                        </label>
                        <div className='grid col-span-6 items-end justify-end'>
                            <button

                                className=" w-full h-10 rounded-sm bg-[#00B81D] text-white text-xs font-bold justify-center items-center px-10 py-2 hover:cursor-pointer"
                            >
                                SIMPAN PERIODE
                            </button>
                        </div>
                    </div>

                </main>
            )}

        </>
    )
}

export default CheckSheetPondAwal