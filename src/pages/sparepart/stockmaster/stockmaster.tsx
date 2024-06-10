import React from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'
import { Link } from 'react-router-dom'

function Stockmaster() {
    return (
        <DefaultLayout>
            <>

                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Maintenance &gt; Sparepart  &gt; Stock Master</p>
                <div className='w-full py-2 rounded-md bg-white p-3 flex gap-5'>
                    <div className='flex justify-between w-full'>


                        <input type="text" placeholder='Cari Barang' className='w-4/12 bg-[#D8EAFF] rounded-sm px-2' />
                        <div className='flex gap-5'>

                            <Link to={'addStock'} className='px-3 py-2 bg-green-600 text-white  font-semibold text-xs rounded-md'>ADD ITEM</Link>
                            <button className='px-3 py-2 bg-red-600 text-white font-semibold text-xs rounded-md'>EXPORT DATA</button>
                        </div>
                    </div>
                </div>
                <div className='flex bg-white py-2 mt-2 px-1'>

                    <p className='text-xs font-semibold w-[2%] text-center'>No</p>
                    <div className='grid grid-cols-12 w-[98%] text-center'>
                        <p className='text-xs font-semibold'>Kode</p>
                        <p className='text-xs font-semibold'>Part Number</p>
                        <p className='text-xs font-semibold col-span-2'>Nama Barang </p>
                        <p className='text-xs font-semibold'>Mesin</p>
                        <p className='text-xs font-semibold'>Lokasi</p>
                        <p className='text-xs font-semibold'>Umur Original</p>
                        <p className='text-xs font-semibold'>Grade</p>
                        <p className='text-xs font-semibold'>QTY</p>
                        <p className='text-xs font-semibold'>Type Part </p>
                        <p className='text-xs font-semibold'>Buffer Stock</p>
                        <p className='text-xs font-semibold'>Document</p>
                    </div>
                </div>
                <div className='flex bg-white py-2 px-1 text-center'>

                    <p className='text-xs w-[2%]'>1</p>
                    <div className='grid grid-cols-12 w-[98%] text-center'>
                        <p className='text-xs'>SPRT-0106</p>
                        <p className='text-xs'>293049</p>
                        <p className='text-xs col-span-2'>Carbon Vane BG21 WN 124-120 </p>
                        <p className='text-xs'>CPR 2</p>
                        <p className='text-xs'>Gudang</p>
                        <p className='text-xs'>100.000</p>
                        <p className='text-xs'>A</p>
                        <p className='text-xs'>20</p>
                        <p className='text-xs'>Consumable</p>
                        <p className='text-xs'>20%</p>
                        <p className='text-xs'>-</p>
                    </div>
                </div>
                <div className='flex bg-white py-2 px-1 text-center'>

                    <p className='text-xs w-[2%]'>2</p>
                    <div className='grid grid-cols-12 w-[98%] text-center'>
                        <p className='text-xs'>SPRT-0106</p>
                        <p className='text-xs'>293049</p>
                        <p className='text-xs col-span-2'>Carbon Vane BG21 WN 124-120 </p>
                        <p className='text-xs'>CPR 2</p>
                        <p className='text-xs'>Gudang</p>
                        <p className='text-xs'>100.000</p>
                        <p className='text-xs'>A</p>
                        <p className='text-xs'>20</p>
                        <p className='text-xs'>Consumable</p>
                        <p className='text-xs'>20%</p>
                        <p className='text-xs'>-</p>
                    </div>
                </div>
                <div className='flex bg-white py-2 px-1 text-center'>

                    <p className='text-xs w-[2%]'>2</p>
                    <div className='grid grid-cols-12 w-[98%] text-center'>
                        <p className='text-xs'>SPRT-0106</p>
                        <p className='text-xs'>293049</p>
                        <p className='text-xs col-span-2'>Carbon Vane BG21 WN 124-120 </p>
                        <p className='text-xs'>CPR 2</p>
                        <p className='text-xs'>Gudang</p>
                        <p className='text-xs'>100.000</p>
                        <p className='text-xs'>A</p>
                        <p className='text-xs'>20</p>
                        <p className='text-xs'>Consumable</p>
                        <p className='text-xs'>20%</p>
                        <p className='text-xs'>-</p>
                    </div>
                </div>
            </>
        </DefaultLayout>
    )
}

export default Stockmaster