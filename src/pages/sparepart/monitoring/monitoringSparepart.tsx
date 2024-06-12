import React from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'
import { Link } from 'react-router-dom'

function MonitoringSparepart() {
    return (
        <DefaultLayout>
            <>

                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Maintenance &gt; Sparepart  &gt; Lifespan</p>
                <div className='w-full py-2 rounded-md bg-white p-3 flex gap-5'>
                    <div className='flex justify-between w-full'>


                        <input type="text" placeholder='Cari Barang' className='w-4/12 bg-[#D8EAFF] rounded-sm px-2' />
                        <div className='flex gap-5'>

                            <Link to={'addStockLifetime'} className='px-3 py-2 bg-green-600 text-white  font-semibold text-xs rounded-md'>ADD STOCK</Link>
                            <button className='px-3 py-2 bg-red-600 text-white font-semibold text-xs rounded-md'>EXPORT DATA</button>
                        </div>
                    </div>
                </div>
                <div className='overflow-x-scroll '>

                    <div className='flex bg-white py-2 mt-2 mb-2 px-1 min-w-[1000px]'>

                        <p className='text-[10px] font-semibold w-[2%] text-center'>No</p>
                        <div className='flex justify-between w-[98%] text-center gap-1'>
                            <p className='text-[10px] font-semibold w-[8%]'>Kode</p>
                            <p className='text-[10px] font-semibold w-[13%] col-span-2'>Nama Barang </p>
                            <p className='text-[10px] font-semibold w-[7%] '>Mesin</p>
                            <p className='text-[10px] font-semibold w-[7%]'>Posisi</p>
                            <p className='text-[10px] font-semibold w-[8%]'>Tgl Datang</p>
                            <p className='text-[10px] font-semibold w-[8%]'>Tgl Pasang</p>
                            <p className='text-[10px] font-semibold w-[8%]'>Tgl Rusak</p>
                            <p className='text-[10px] font-semibold w-[7%]'>Umur A</p>
                            <p className='text-[10px] font-semibold w-[7%]'>Umur Grade</p>
                            <p className='text-[10px] font-semibold w-[6%]'>Grade </p>
                            <p className='text-[10px] font-semibold w-[7%]'>Umur Aktual</p>
                            <p className='text-[10px] font-semibold w-[7%]'>Sisa Umur</p>
                            <p className='text-[10px] font-semibold w-[7%]'>Ket. </p>

                        </div>
                    </div>
                    <div className='flex bg-white py-2 mb-1 px-1  min-w-[1000px]'>

                        <p className='text-[10px]  w-[2%] text-center'>1</p>
                        <div className='flex justify-between w-[98%] text-center gap-1'>
                            <p className='text-[10px]  w-[8%]'>SPRT-0106</p>
                            <p className='text-[10px]  w-[13%] col-span-2'>Carbon Vane BG21 WN 124-120</p>
                            <p className='text-[10px]  w-[7%] '>CPN</p>
                            <p className='text-[10px]  w-[7%]'>Unit 1</p>
                            <p className='text-[10px]  w-[8%]'>12 March 2024</p>
                            <p className='text-[10px]  w-[8%]'>12 March 2024</p>
                            <p className='text-[10px]  w-[8%]'>12 March 2024</p>
                            <p className='text-[10px]  w-[7%]'>100.000</p>
                            <p className='text-[10px]  w-[7%]'>100%</p>
                            <p className='text-[10px]  w-[6%]'>A </p>
                            <p className='text-[10px]  w-[7%]'>Umur Aktual</p>
                            <p className='text-[10px]  w-[7%]'>100.000</p>
                            <p className='text-[10px]  w-[7%]'>Lorem ipsum dolor sit amet.</p>

                        </div>
                    </div>
                    <div className='flex bg-white py-2 mb-1 px-1  min-w-[1000px]'>

                        <p className='text-[10px]  w-[2%] text-center'>1</p>
                        <div className='flex justify-between w-[98%] text-center gap-1'>
                            <p className='text-[10px]  w-[8%]'>SPRT-0106</p>
                            <p className='text-[10px]  w-[13%] col-span-2'>Carbon Vane BG21 WN 124-120</p>
                            <p className='text-[10px]  w-[7%] '>CPN</p>
                            <p className='text-[10px]  w-[7%]'>Unit 1</p>
                            <p className='text-[10px]  w-[8%]'>12 March 2024</p>
                            <p className='text-[10px]  w-[8%]'>12 March 2024</p>
                            <p className='text-[10px]  w-[8%]'>12 March 2024</p>
                            <p className='text-[10px]  w-[7%]'>100.000</p>
                            <p className='text-[10px]  w-[7%]'>100%</p>
                            <p className='text-[10px]  w-[6%]'>A </p>
                            <p className='text-[10px]  w-[7%]'>Umur Aktual</p>
                            <p className='text-[10px]  w-[7%]'>100.000</p>
                            <p className='text-[10px]  w-[7%]'>Lorem ipsum dolor sit amet.</p>

                        </div>
                    </div>
                </div>



            </>
        </DefaultLayout>
    )
}

export default MonitoringSparepart