import React, { useState } from 'react'
import DefaultLayout from '../../layout/DefaultLayout'
import Ceklis from '../../images/icon/ceklis.svg'
import Polygon from '../../images/icon/Polygon.svg'
import X from '../../images/icon/x.svg'
import Strip from '../../images/icon/strip.svg'
import SelectGroupTwo from '../../components/Forms/SelectGroup/SelectGroupTwo'



function Pm1Form() {


    return (
        <DefaultLayout>
            <div className='w-full bg-white'>
                <section className='flex justify-between p-4'>

                    <div>
                        <p className='text-[14px] font-semibold'>Machine Details</p>
                        <div className='flex flex-col w-52'>
                            <div className='grid grid-cols-2 justify-between gap-3 '>
                                <p className='text-[14px] font-semibold '> Nama Mesin </p>
                                <p className='text-[14px] font-semibold '>: sodolk</p>

                            </div>
                            <div className='grid grid-cols-2 justify-between gap-3'>
                                <p className='text-[14px] font-semibold'> Nomor Mesin </p>
                                <p className='text-[14px] font-semibold'>: 12344</p>

                            </div>
                            <div className='grid grid-cols-2 justify-between gap-3'>
                                <p className='text-[14px] font-semibold'> Lokasi Mesin </p>
                                <p className='text-[14px] font-semibold'>: location</p>

                            </div>
                            <div className='grid grid-cols-2 justify-between gap-3'>
                                <p className='text-[14px] font-semibold'> tanggal </p>
                                <p className='text-[14px] font-semibold'>: 01 April 2024</p>

                            </div>


                        </div>
                    </div>
                    <div>
                        <p className='text-[14px] font-semibold'>
                            Form filling Guide
                        </p>
                        <div>
                            <div className='flex justify-start gap-3'>

                                <div className='w-5 flex justify-center items-center'>

                                    <img className='' src={Ceklis} alt="" />
                                </div>
                                <p className='text-[14px] font-semibold'>: Kondisi Baik</p>
                            </div>
                            <div className='flex justify-start gap-3'>
                                <div className='w-5 flex justify-center items-center'>

                                    <img className='' src={Polygon} alt="" />
                                </div>
                                <p className='text-[14px] font-semibold'>: Dapat Digunakan Dengan Catatan</p>
                            </div>
                            <div className='flex justify-start gap-3'>
                                <div className='w-5 flex justify-center items-center'>

                                    <img className='' src={X} alt="" />
                                </div>
                                <p className='text-[14px] font-semibold'>: Jelek / Rusak</p>
                            </div>
                            <div className='flex justify-start gap-3'>
                                <div className='w-5 flex justify-center items-center'>

                                    <img className='' src={Strip} alt="" />
                                </div>
                                <p className='text-[14px] font-semibold'>: Tidak Ada / Tidak Terpasang</p>
                            </div>
                        </div>
                    </div>
                </section>
                <section className='flex p-4 border-y-8 border-[#D8EAFF]'>
                    <div className='w-1/12'>
                        <p className='text-[14px] font-semibold'>No</p>
                    </div>
                    <div className='w-11/12 grid grid-cols-5 gap-10'>

                        <p className='text-[14px] font-semibold'>Inspect Point </p>
                        <p className='text-[14px] font-semibold'>Task List </p>
                        <p className='text-[14px] font-semibold'>Acceptance Criteria </p>
                        <p className='text-[14px] font-semibold'>Inspection Method</p>
                        <p className='text-[14px] font-semibold'>Tools</p>
                    </div>
                </section>
                <section className=' border-b-8 border-[#D8EAFF]'>
                    <div className='flex p-4 border-b-2 border-[#6D6C6C] '>

                        <div className='w-1/12'>
                            <p className='text-[14px] font-semibold'>1</p>
                        </div>
                        <div className='w-11/12 grid grid-cols-5 gap-10'>

                            <p className='text-[14px] font-semibold'>Main Motor / Suction Motor(15KW) </p>
                            <div className='flex flex-col gap-y-5'>
                                <p className='text-[14px] font-semibold h-10'>Periksa kebersihan sirip motor dan cover fan</p>
                                <p className='text-[14px] font-semibold h-10'>Periksa suhu motor</p>
                                <p className='text-[14px] font-semibold h-10'>Periksa tegangan motor</p>
                                <p className='text-[14px] font-semibold h-10'>Periksa arus motor</p>
                            </div>
                            <div className='flex flex-col gap-y-5'>
                                <p className='text-[14px] font-semibold h-10'>Periksa kebersihan sirip motor dan cover fan</p>
                                <p className='text-[14px] font-semibold h-10'>Periksa suhu motor</p>
                                <p className='text-[14px] font-semibold h-10'>Periksa tegangan motor</p>
                                <p className='text-[14px] font-semibold h-10'>Periksa arus motor</p>
                            </div>
                            <div className='flex flex-col gap-y-5'>
                                <p className='text-[14px] font-semibold h-10'>Visual</p>
                                <p className='text-[14px] font-semibold h-10'>Dimensional</p>
                                <p className='text-[14px] font-semibold h-10'>Dimensional</p>
                                <p className='text-[14px] font-semibold h-10'>Dimensional</p>

                            </div>
                            <div className='flex flex-col gap-y-5'>
                                <p className='text-[14px] font-semibold h-10'>Air compressor / Vacum Cleaner</p>
                                <p className='text-[14px] font-semibold h-10'>Tremor Gun</p>
                                <p className='text-[14px] font-semibold h-10'>Periksa tegangan motor</p>
                                <p className='text-[14px] font-semibold h-10'>Periksa arus motor</p>
                            </div>


                        </div>
                    </div>
                    <div className='grid grid-cols-5'>

                        <div className='p-4 flex flex-col'>
                            <p className='text-[14px] font-semibold'>Date: 01 April 2024</p>
                            <p className='text-[14px] font-semibold'>Result:</p>
                            <div className=' flex mt-3'>


                                <SelectGroupTwo />
                            </div>
                        </div>
                        <div className='p-4 flex flex-col'>
                            <p className='text-[14px] font-semibold'>Date: 02 April 2024</p>
                            <p className='text-[14px] font-semibold'>Result:</p>
                            <div className=' flex mt-3'>

                                <SelectGroupTwo />
                            </div>
                        </div>
                        <div className='p-4 flex flex-col'>
                            <p className='text-[14px] font-semibold'>Date: 03 April 2024</p>
                            <p className='text-[14px] font-semibold'>Result:</p>
                            <div className=' flex mt-3'>

                                <SelectGroupTwo />
                            </div>
                        </div>
                        <div className='p-4 flex flex-col'>
                            <p className='text-[14px] font-semibold'>Date: 04 April 2024</p>
                            <p className='text-[14px] font-semibold'>Result:</p>
                            <div className=' flex mt-3'>

                                <SelectGroupTwo />
                            </div>
                        </div>
                        <div className='p-4 flex flex-col'>
                            <p className='text-[14px] font-semibold'>Date: 05 April 2024</p>
                            <p className='text-[14px] font-semibold'>Result:</p>
                            <div className=' flex mt-3'>

                                <SelectGroupTwo />
                            </div>
                        </div>

                    </div>
                </section>
                <section className=' border-b-8 border-[#D8EAFF]'>
                    <div className='flex p-4 border-b-2 border-[#6D6C6C] '>

                        <div className='w-1/12'>
                            <p className='text-[14px] font-semibold'>2</p>
                        </div>
                        <div className='w-11/12 grid grid-cols-5 gap-10'>

                            <p className='text-[14px] font-semibold'>Motor Cam Shaft(1,5 KW) </p>
                            <div className='flex flex-col gap-y-5'>
                                <p className='text-[14px] font-semibold h-10'>Periksa kebersihan sirip motor dan cover fan</p>
                                <p className='text-[14px] font-semibold h-10'>Periksa suhu motor</p>
                                <p className='text-[14px] font-semibold h-10'>Periksa tegangan motor</p>
                                <p className='text-[14px] font-semibold h-10'>Periksa arus motor</p>
                            </div>
                            <div className='flex flex-col gap-y-5'>
                                <p className='text-[14px] font-semibold h-10'>Periksa kebersihan sirip motor dan cover fan</p>
                                <p className='text-[14px] font-semibold h-10'>Periksa suhu motor</p>
                                <p className='text-[14px] font-semibold h-10'>Periksa tegangan motor</p>
                                <p className='text-[14px] font-semibold h-10'>Periksa arus motor</p>
                            </div>
                            <div className='flex flex-col gap-y-5'>
                                <p className='text-[14px] font-semibold h-10'>Visual</p>
                                <p className='text-[14px] font-semibold h-10'>Dimensional</p>
                                <p className='text-[14px] font-semibold h-10'>Dimensional</p>
                                <p className='text-[14px] font-semibold h-10'>Dimensional</p>

                            </div>
                            <div className='flex flex-col gap-y-5'>
                                <p className='text-[14px] font-semibold h-10'>Air compressor / Vacum Cleaner</p>
                                <p className='text-[14px] font-semibold h-10'>Tremor Gun</p>
                                <p className='text-[14px] font-semibold h-10'>Periksa tegangan motor</p>
                                <p className='text-[14px] font-semibold h-10'>Periksa arus motor</p>
                            </div>


                        </div>
                    </div>
                    <div className='grid grid-cols-5'>

                        <div className='p-4 flex flex-col'>
                            <p className='text-[14px] font-semibold'>Date: 01 April 2024</p>
                            <p className='text-[14px] font-semibold'>Result:</p>
                            <div className=' flex mt-3'>


                                <SelectGroupTwo />
                            </div>
                        </div>
                        <div className='p-4 flex flex-col'>
                            <p className='text-[14px] font-semibold'>Date: 02 April 2024</p>
                            <p className='text-[14px] font-semibold'>Result:</p>
                            <div className=' flex mt-3'>

                                <SelectGroupTwo />
                            </div>
                        </div>
                        <div className='p-4 flex flex-col'>
                            <p className='text-[14px] font-semibold'>Date: 03 April 2024</p>
                            <p className='text-[14px] font-semibold'>Result:</p>
                            <div className=' flex mt-3'>

                                <SelectGroupTwo />
                            </div>
                        </div>
                        <div className='p-4 flex flex-col'>
                            <p className='text-[14px] font-semibold'>Date: 04 April 2024</p>
                            <p className='text-[14px] font-semibold'>Result:</p>
                            <div className=' flex mt-3'>

                                <SelectGroupTwo />
                            </div>
                        </div>
                        <div className='p-4 flex flex-col'>
                            <p className='text-[14px] font-semibold'>Date: 05 April 2024</p>
                            <p className='text-[14px] font-semibold'>Result:</p>
                            <div className=' flex mt-3'>

                                <SelectGroupTwo />
                            </div>
                        </div>

                    </div>
                </section>
            </div >
        </DefaultLayout >
    )
}

export default Pm1Form