import React, { useState } from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'
import Ceklis from '../../../images/icon/ceklis.svg'
import Polygon from '../../../images/icon/Polygon.svg'
import X from '../../../images/icon/x.svg'
import Strip from '../../../images/icon/strip.svg'
import SelectGroupTwo from '../../../components/Forms/SelectGroup/SelectGroupTwo'



function Pm1Form() {


    return (
        <DefaultLayout>
            <div className='w-full bg-white'>
                <section className='flex justify-between p-4'>

                    <div>
                        <p className='md:text-[14px] text-[9px] font-semibold'>Machine Details</p>
                        <div className='flex flex-col md:w-52 w-35'>
                            <div className='grid grid-cols-2 justify-between md:gap-3 gap-1 '>
                                <p className='md:text-[14px] text-[9px] font-semibold '> Nama Mesin </p>
                                <p className='md:text-[14px] text-[9px] font-semibold '>: sodolk</p>

                            </div>
                            <div className='grid grid-cols-2 justify-between md:gap-3 gap-1'>
                                <p className='md:text-[14px] text-[9px] font-semibold'> Nomor Mesin </p>
                                <p className='md:text-[14px] text-[9px] font-semibold'>: 12344</p>

                            </div>

                            <div className='grid grid-cols-2 justify-between md:gap-3 gap-1'>
                                <p className='md:text-[14px] text-[9px] font-semibold'> tanggal </p>
                                <p className='md:text-[14px] text-[9px] font-semibold'>: 01 April 2024</p>

                            </div>


                        </div>
                    </div>
                    <div>
                        <p className='md:text-[14px] text-[9px] font-semibold'>
                            Form filling Guide
                        </p>
                        <div>
                            <div className='flex justify-start md:gap-3 gap-1'>

                                <div className='md:w-5 w-4 flex justify-center items-center'>

                                    <img className='' src={Ceklis} alt="" />
                                </div>
                                <p className='md:text-[14px] text-[9px] font-semibold'>: Kondisi Baik</p>
                            </div>
                            <div className='flex justify-start md:gap-3 gap-1'>
                                <div className='md:w-5 w-4 flex justify-center items-center'>

                                    <img className='' src={Polygon} alt="" />
                                </div>
                                <p className='md:text-[14px] text-[9px] font-semibold'>: Dapat Digunakan Dengan Catatan</p>
                            </div>
                            <div className='flex justify-start md:gap-3 gap-1'>
                                <div className='md:w-5 w-4 flex justify-center items-center'>

                                    <img className='' src={X} alt="" />
                                </div>
                                <p className='md:text-[14px] text-[9px] font-semibold'>: Jelek / Rusak</p>
                            </div>
                            <div className='flex justify-start md:gap-3 gap-1'>
                                <div className='md:w-5 w-4 flex justify-center items-center'>

                                    <img className='' src={Strip} alt="" />
                                </div>
                                <p className='md:text-[14px] text-[9px] font-semibold'>: Tidak Ada / Tidak Terpasang</p>
                            </div>
                        </div>
                    </div>
                </section>
                <div className='overflow-x-scroll '>
                    <div className='min-w-[700px]'>

                        <section className='flex p-4 border-y-8 border-[#D8EAFF]'>
                            <div className='w-1/12'>
                                <p className='md:text-[14px] text-[9px] font-semibold'>No</p>
                            </div>
                            <div className='w-11/12 grid grid-cols-5 gap-10'>

                                <p className='md:text-[14px] text-[9px] font-semibold'>Inspect Point </p>
                                <p className='md:text-[14px] text-[9px] font-semibold'>Task List </p>
                                <p className='md:text-[14px] text-[9px] font-semibold'>Acceptance Criteria </p>
                                <p className='md:text-[14px] text-[9px] font-semibold'>Inspection Method</p>
                                <p className='md:text-[14px] text-[9px] font-semibold'>Tools</p>
                            </div>
                        </section>
                        <section className=' border-b-8 border-[#D8EAFF]'>
                            <div className='flex p-4 border-b-2 border-[#6D6C6C] '>

                                <div className='w-1/12'>
                                    <p className='md:text-[14px] text-[9px] font-semibold'>1</p>
                                </div>
                                <div className='w-11/12 grid grid-cols-5 gap-10'>

                                    <p className='md:text-[14px] text-[9px] font-semibold'>Main Motor / Suction Motor(15KW) </p>
                                    <div className='flex flex-col gap-y-10'>
                                        <p className='md:text-[14px] text-[9px] font-semibold h-10'>Periksa kebersihan sirip motor dan cover fan</p>
                                        <p className='md:text-[14px] text-[9px] font-semibold h-10'>Periksa suhu motor</p>
                                        <p className='md:text-[14px] text-[9px] font-semibold h-10'>Periksa tegangan motor</p>
                                        <p className='md:text-[14px] text-[9px] font-semibold h-10'>Periksa arus motor</p>
                                    </div>
                                    <div className='flex flex-col gap-y-10'>
                                        <p className='md:text-[14px] text-[9px] font-semibold h-10'>Periksa kebersihan sirip motor dan cover fan</p>
                                        <p className='md:text-[14px] text-[9px] font-semibold h-10'>Periksa suhu motor</p>
                                        <p className='md:text-[14px] text-[9px] font-semibold h-10'>Periksa tegangan motor</p>
                                        <p className='md:text-[14px] text-[9px] font-semibold h-10'>Periksa arus motor</p>
                                    </div>
                                    <div className='flex flex-col gap-y-10'>
                                        <p className='md:text-[14px] text-[9px] font-semibold h-10'>Visual</p>
                                        <p className='md:text-[14px] text-[9px] font-semibold h-10'>Dimensional</p>
                                        <p className='md:text-[14px] text-[9px] font-semibold h-10'>Dimensional</p>
                                        <p className='md:text-[14px] text-[9px] font-semibold h-10'>Dimensional</p>

                                    </div>
                                    <div className='flex flex-col gap-y-10'>
                                        <p className='md:text-[14px] text-[9px] font-semibold h-10'>Air compressor / Vacum Cleaner</p>
                                        <p className='md:text-[14px] text-[9px] font-semibold h-10'>Tremor Gun</p>
                                        <p className='md:text-[14px] text-[9px] font-semibold h-10'>Periksa tegangan motor</p>
                                        <p className='md:text-[14px] text-[9px] font-semibold h-10'>Periksa arus motor</p>
                                    </div>


                                </div>
                            </div>
                            <div className='flex'>

                                <div className='p-4 flex flex-col'>
                                    <p className='md:text-[14px] text-[9px] font-semibold'>Date: 01 April 2024</p>
                                    <p className='md:text-[14px] text-[9px] font-semibold'>Result:</p>
                                    <div className=' flex mt-3'>


                                        <SelectGroupTwo />
                                    </div>
                                </div>
                                <div className='p-4 flex flex-col '>
                                    <p className='md:text-[14px] text-[9px] font-semibold'>Upload Foto:</p>
                                    <br />
                                    <div className=' flex mt-3 '>


                                        <input type="file" name="" id="" className='w-60' />
                                    </div>
                                </div>
                                <div className='p-4 flex flex-col'>
                                    <p className='md:text-[14px] text-[9px] font-semibold'>Catatan:</p>
                                    <br />

                                    <div className=' flex mt-3'>


                                        <textarea name="" id="" rows={3} cols={90} className=' border-2 border-[#D9D9D9] rounded-sm resize-none p-2 w-full'></textarea>
                                    </div>
                                </div>


                            </div>
                        </section>
                    </div>
                </div>

            </div >
        </DefaultLayout >
    )
}

export default Pm1Form