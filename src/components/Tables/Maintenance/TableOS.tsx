import React from 'react'
import Filter from '../../../images/icon/filter.svg'

function TableOS() {
  return (
    <main>
      <div className='flex justify-between bg-white p-2'>
        <img src={Filter} alt="" />
        <div className='w-96 py-1 bg-[#E9F3FF]'>
          search
        </div>
      </div>
      <section className='flex w-full bg-white my-3 rounded-lg overflow-x-auto'>
        <div className='p-5 flex justify-center items-center'>
          1
        </div>
        <div className='grid grid-cols-7 w-full  '>
          <div className='flex flex-col gap-5 m-5'>
            <div className=''>
              <h5 className='text-xs font-bold'>Kode Tiket</h5>
              <p className='text-sm font-light'>EX078078E</p>
            </div>
            <div >
              <h5 className='text-xs font-bold'>Waktu Masuk</h5>
              <p className='text-sm font-light'>12/22/24 07:00</p>
            </div>
          </div>
          <div className='flex flex-col gap-5 m-5'>
            <div>
              <h5 className='text-xs font-bold'>Nama Mesin</h5>
              <p className='text-sm font-light'>R700</p>
            </div>
            <div>
              <h5 className='text-xs font-bold'>Eksekutor</h5>
              <p className='text-sm font-light'>Oliver Kahn</p>
            </div>
          </div>
          <div className='flex flex-col gap-5 m-5'>
            <div>
              <h5 className='text-xs font-bold'>Waktu Respon</h5>
              <p className='text-sm font-light'>30 menit</p>
            </div>
            <div>
              <h5 className='text-xs font-bold'>Rework Eksekutor</h5>
              <p className='text-sm font-light'>-</p>
            </div>
          </div>
          <div className='flex flex-col gap-5 m-5'>
            <div>
              <h5 className='text-xs font-bold'>Status</h5>
              <p className='text-sm font-light bg-[#FFE4B1] rounded-xl flex justify-center text-[#DE8500]'>Pending</p>
            </div>
            <div>
              <h5 className='text-xs font-bold'>Persentase</h5>
              <p className='text-sm font-light bg-red-200 rounded-xl flex justify-center text-red-600'>0%</p>
            </div>
          </div>
          <div className='flex col-span-2 flex-col gap-5 p-5 bg-[#E9F3FF]'>
            <div>
              <h5 className='text-xs font-bold'>Jenis Kendala</h5>
              <p className='text-sm font-light'>3.1.7 - Feeder tidak bisa on</p>
            </div>
            <div>
              <h5 className='text-xs font-bold'>Analisis Kendala</h5>
              <p className='text-sm font-light'>V - Electrical part error/rusak</p>
            </div>
          </div>
          <div className='flex flex-col gap-5 p-5 w-full bg-[#E9F3FF]'>
            <div>
              <button className='text-xs font-bold bg-blue-700 w-25 py-2 text-white rounded-sm'>Proses</button>

            </div>
            <div>

              <button className='text-xs font-bold text-blue-700 w-25 py-2 border-blue-700 border rounded-sm'>Request Jadwal</button>
            </div>
          </div>

        </div>
      </section>
    </main>
  )
}

export default TableOS