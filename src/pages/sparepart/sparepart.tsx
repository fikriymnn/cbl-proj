import React from 'react'
import DefaultLayout from '../../layout/DefaultLayout'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

function Sparepart() {
    return (
        <>
            <DefaultLayout>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Maintenance &gt; Sparepart</p>
                <div className='w-full py-2 rounded-md bg-white flex p-3 gap-3'>
                    <p className='text-sm text-primary my-auto'>Pilih Tanggal:</p>
                    <div className='w-44 bg-[#D8EAFF]'>

                        <LocalizationProvider dateAdapter={AdapterDayjs} >
                            <DatePicker slotProps={{ textField: { fullWidth: true, size: 'small' } }} />
                        </LocalizationProvider>
                    </div>
                </div>
                <div className='flex w-full gap-2 bg-white p-2 my-2'>
                    <p className='text-xs font-semibold w-10'>No</p>
                    <div className='w-full grid grid-cols-12 gap-2'>
                        <p className='col-span-2 text-xs font-semibold'>Kode Barang</p>
                        <p className='col-span-2 text-xs font-semibold'>Nama Barang</p>
                        <p className='col-span-2 text-xs font-semibold'>Lokasi/Area</p>
                        <p className='col-span-1 text-xs font-semibold'>Unit</p>
                        <p className='col-span-2 text-xs font-semibold'>Stok Terakhir</p>
                        <p className='col-span-1 text-xs font-semibold'>Actual</p>
                        <p className='col-span-1 text-xs font-semibold'>Selisih</p>
                        <p className='col-span-1 text-xs font-semibold'>Keterangan</p>

                    </div>
                </div>
                <div className='flex w-full gap-2 bg-white p-2 my-1 rounded-md'>
                    <p className='text-xs font-medium w-10'>1</p>
                    <div className='w-full grid grid-cols-12 gap-2'>
                        <p className='col-span-2 text-xs font-medium'>SPRT-BDR001</p>
                        <p className='col-span-2 text-xs font-medium'>PRE-FOLDING L</p>
                        <p className='col-span-2 text-xs font-medium'>gudang/R1</p>
                        <p className='col-span-1 text-xs font-medium'>Pcs</p>
                        <p className='col-span-2 text-xs font-medium'>25</p>
                        <p className='col-span-1 text-xs font-medium'>25</p>
                        <p className='col-span-1 text-xs font-medium'>0</p>
                        <p className='col-span-1 text-xs font-medium'>Pas</p>

                    </div>
                </div>
                <div className='flex w-full gap-2 bg-white p-2 my-1 rounded-md'>
                    <p className='text-xs font-medium w-10'>1</p>
                    <div className='w-full grid grid-cols-12 gap-2'>
                        <p className='col-span-2 text-xs font-medium'>SPRT-BDR001</p>
                        <p className='col-span-2 text-xs font-medium'>PRE-FOLDING L</p>
                        <p className='col-span-2 text-xs font-medium'>gudang/R1</p>
                        <p className='col-span-1 text-xs font-medium'>Pcs</p>
                        <p className='col-span-2 text-xs font-medium'>25</p>
                        <p className='col-span-1 text-xs font-medium'>25</p>
                        <p className='col-span-1 text-xs font-medium'>0</p>
                        <p className='col-span-1 text-xs font-medium'>Pas</p>

                    </div>
                </div>
            </DefaultLayout>
        </>
    )
}

export default Sparepart