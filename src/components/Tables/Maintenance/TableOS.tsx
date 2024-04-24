import React from 'react'
import Filter from '../../../images/icon/filter.svg'

const tiket = [
  {
    KodeTiket: '1376',
    waktuMesin: "12/22/24 7:00UTC",
    namaMesin: "R700",
    kendala: "problem settingan mesin",

  },
  {
    KodeTiket: '1376',
    waktuMesin: "12/22/24 7:00UTC",
    namaMesin: "R700",
    kendala: "problem settingan mesin",

  },
  {
    KodeTiket: '1376',
    waktuMesin: "12/22/24 7:00UTC",
    namaMesin: "R700",
    kendala: "problem settingan mesin",

  }
]

function TableOS() {
  return (
    <main>
      <div className='flex justify-between bg-white p-3'>
        <img src={Filter} alt="" className='mx-3' />
        {/* <input className='w-96 py-1 mx-3 bg-[#E9F3FF]'>
          search
        </input> */}
        <input type="search" placeholder='search' name="" id="" className='w-96 py-1 mx-3 px-3 bg-[#E9F3FF]' />
      </div>
      <div className=' overflow-x-auto'>
        <div className='min-w-[1000px]'>

          {tiket.map((data, i) => (
            <>

              <section className='flex  bg-white my-3 rounded-lg'>
                <div className='flex'>

                  <div key={i} className='p-5 flex justify-center items-center'>
                    {i + 1}
                  </div>
                  <div className='grid md:grid-cols-7 grid-cols-6 w-full  '>
                    <div className='flex flex-col md:gap-5 gap-1 md:m-[14px] m-[7px]'>
                      <div className=''>

                        <h5 className='text-xs font-bold'>Kode Tiket</h5>
                        <p className='text-sm font-light'>{data.KodeTiket}</p>
                      </div>
                      <div >
                        <h5 className='text-xs font-bold'>Waktu Masuk</h5>
                        <p className='text-sm font-light'>12/22/24 07:00</p>
                      </div>
                    </div>
                    <div className='flex flex-col md:gap-5 gap-1 md:m-[14px] m-[7px]'>
                      <div>
                        <h5 className='text-xs font-bold'>Nama Mesin</h5>
                        <p className='text-sm font-light'>R700</p>
                      </div>
                      <div>
                        <h5 className='text-xs font-bold'>Eksekutor</h5>
                        <p className='text-sm font-light'>Oliver Kahn</p>
                      </div>
                    </div>
                    <div className='flex flex-col md:gap-5 gap-1 md:m-[14px] m-[7px]'>
                      <div>
                        <h5 className='text-xs font-bold'>Waktu Respon</h5>
                        <p className='text-sm font-light'>30 menit</p>
                      </div>
                      <div>
                        <h5 className='text-xs font-bold'>Rework Eksekutor</h5>
                        <p className='text-sm font-light'>-</p>
                      </div>
                    </div>
                    <div className='flex flex-col md:gap-5 gap-1 md:m-[14px] m-[7px]'>
                      <div >
                        <h5 className='text-xs font-bold'>Status</h5>
                        <div className='flex'>

                          <p className='text-sm font-light bg-[#FFE4B1] rounded-xl px-2 text-[#DE8500]'>verif pending </p>
                        </div>
                      </div>
                      <div>
                        <h5 className='text-xs font-bold'>Persentase</h5>
                        <div className='flex '>

                          <p className='text-sm px-2  font-light bg-red-200 rounded-xl flex justify-center text-red-600'>0%</p>
                        </div>
                      </div>
                    </div>
                    <div className='flex col-span-2 flex-col md:gap-5 gap-1 md:px-7 md:py-[14px] p-2 bg-[#E9F3FF]'>
                      <div>
                        <h5 className='text-xs font-bold'>Jenis Kendala</h5>
                        <p className='text-sm font-light'>3.1.7 - Feeder tidak bisa on</p>
                      </div>
                      <div>
                        <h5 className='text-xs font-bold'>Analisis Kendala</h5>
                        <p className='text-sm font-light'>V - Electrical part error/rusak</p>
                      </div>
                    </div>
                    <div className='flex md:flex-col md:gap-5 gap-1 md:px-7 md:py-[14px] pb-2 w-full md:bg-[#E9F3FF] bg-white md:ps-7 ps-3'>
                      <div>
                        <button className='text-xs font-bold bg-blue-700 w-25 py-2 text-white rounded-sm'>Proses</button>

                      </div>
                      <div>

                        <button className='text-xs font-bold text-blue-700 w-25 py-2 border-blue-700 border rounded-sm'>Request Jadwal</button>
                      </div>
                    </div>

                  </div>
                </div>
              </section>
            </>
          ))}
        </div>
      </div>
    </main>
  )
}

export default TableOS