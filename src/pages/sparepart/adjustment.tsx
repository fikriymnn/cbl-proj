import React from 'react'
import DefaultLayout from '../../layout/DefaultLayout'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

function Adjustment() {
    return (
        <>
            <DefaultLayout>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Maintenance &gt; Adjustment</p>
                <div className='w-full py-2 rounded-md bg-white p-3 flex gap-5'>
                    <div className='flex gap-3' >

                        <p className='text-sm text-primary my-auto'>Pilih Bulan:</p>
                        <div className='w-44 bg-[#D8EAFF]'>

                            <LocalizationProvider dateAdapter={AdapterDayjs} >
                                <DatePicker slotProps={{ textField: { fullWidth: true, size: 'small' } }} />
                            </LocalizationProvider>
                        </div>
                    </div>
                    <input type="text" placeholder='Cari Barang' className='w-4/12 bg-[#D8EAFF] rounded-sm px-2' />
                    <button className='w-2/12 bg-green-600 text-white font-semibold text-xs rounded-md'>SAVE</button>
                    <button className='w-2/12 bg-blue-600 text-white font-semibold text-xs rounded-md'>SUBMIT</button>
                </div>
                <div className='flex w-full gap-2 bg-white p-1 my-2'>
                    <p className='text-xs font-semibold w-10 p-2'>No</p>
                    <div className='w-full grid grid-cols-12 gap-2'>
                        <p className='col-span-2 text-xs font-semibold p-2'>Kode Barang</p>
                        <p className='col-span-2 text-xs font-semibold p-2'>Nama Barang</p>
                        <p className='col-span-2 text-xs font-semibold p-2'>Lokasi/Area</p>
                        <p className='col-span-1 text-xs font-semibold p-2'>Unit</p>
                        <p className='col-span-2 text-xs font-semibold p-2'>Stok Terakhir</p>
                        <p className='col-span-1 text-xs font-semibold p-2'>Actual</p>
                        <p className='col-span-1 text-xs font-semibold p-2'>Selisih</p>
                        <p className='col-span-1 text-xs font-semibold p-2'>Keterangan</p>

                    </div>
                </div>

                <div className='flex w-full gap-2 bg-white  my-1 rounded-md p-1'>
                    <p className='text-xs font-medium w-10  p-2'>1</p>
                    <div className='w-full grid grid-cols-12 gap-2 '>
                        <p className='col-span-2 text-xs font-medium bg-[#EFEFEF] p-2 '>SPRT-BDR001</p>
                        <p className='col-span-2 text-xs font-medium bg-[#EFEFEF] p-2 '>PRE-FOLDING L</p>
                        <p className='col-span-2 text-xs font-medium bg-[#EFEFEF] p-2 '>gudang/R1</p>
                        <p className='col-span-1 text-xs font-medium bg-[#EFEFEF] p-2 '>Pcs</p>
                        <p className='col-span-2 text-xs font-medium bg-[#EFEFEF] p-2 '>25</p>
                        <input className='col-span-1 text-xs font-medium p-2 border rounded-md border-[#C6C6C6]' />
                        <p className='col-span-1 text-xs font-medium bg-[#EFEFEF] p-2 '>0</p>
                        <input className='col-span-1 text-xs font-medium p-2 border rounded-md border-[#C6C6C6]' />

                    </div>
                </div>
                <div className='flex w-full gap-2 bg-white  my-1 rounded-md p-1'>
                    <p className='text-xs font-medium w-10  p-2'>2</p>
                    <div className='w-full grid grid-cols-12 gap-2 '>
                        <p className='col-span-2 text-xs font-medium bg-[#EFEFEF] p-2 '>SPRT-BDR001</p>
                        <p className='col-span-2 text-xs font-medium bg-[#EFEFEF] p-2 '>PRE-FOLDING L</p>
                        <p className='col-span-2 text-xs font-medium bg-[#EFEFEF] p-2 '>gudang/R1</p>
                        <p className='col-span-1 text-xs font-medium bg-[#EFEFEF] p-2 '>Pcs</p>
                        <p className='col-span-2 text-xs font-medium bg-[#EFEFEF] p-2 '>25</p>
                        <input className='col-span-1 text-xs font-medium p-2 border rounded-md border-[#C6C6C6]' />
                        <p className='col-span-1 text-xs font-medium bg-[#EFEFEF] p-2 '>0</p>
                        <input className='col-span-1 text-xs font-medium p-2 border rounded-md border-[#C6C6C6]' />

                    </div>
                </div>
                <div className='flex w-full gap-2 bg-white  my-1 rounded-md p-1'>
                    <p className='text-xs font-medium w-10  p-2'>3</p>
                    <div className='w-full grid grid-cols-12 gap-2 '>
                        <p className='col-span-2 text-xs font-medium bg-[#EFEFEF] p-2 '>SPRT-BDR001</p>
                        <p className='col-span-2 text-xs font-medium bg-[#EFEFEF] p-2 '>PRE-FOLDING L</p>
                        <p className='col-span-2 text-xs font-medium bg-[#EFEFEF] p-2 '>gudang/R1</p>
                        <p className='col-span-1 text-xs font-medium bg-[#EFEFEF] p-2 '>Pcs</p>
                        <p className='col-span-2 text-xs font-medium bg-[#EFEFEF] p-2 '>25</p>
                        <input className='col-span-1 text-xs font-medium p-2 border rounded-md border-[#C6C6C6]' />
                        <p className='col-span-1 text-xs font-medium bg-[#EFEFEF] p-2 '>0</p>
                        <input className='col-span-1 text-xs font-medium p-2 border rounded-md border-[#C6C6C6]' />

                    </div>
                </div>
            </DefaultLayout>
        </>
    )
}

export default Adjustment