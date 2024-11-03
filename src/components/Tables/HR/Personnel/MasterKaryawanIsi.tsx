import React from 'react'
import { Link, useNavigate } from 'react-router-dom';

function MasterKaryawanIsi() {

    const masterKaryawan = [
        {
            nik: 123,
            nama: 'asep kurma',
            jenis_kelamin: 'L',
            posisi: 'Tetap',
            divisi: 'quality',
            tipe_penggajian: 'Bulanan',
            tanggal_masuk: '10/11/2024',
            tanggal_keluar: ''
        },
        {
            nik: 124,
            nama: 'kurma aspe',
            jenis_kelamin: 'L',
            posisi: 'Tetap',
            divisi: 'quality',
            tipe_penggajian: 'Bulanan',
            tanggal_masuk: '11/11/2024',
            tanggal_keluar: ''
        }
    ]

    return (
        <div>
            <>
                <main className="overflow-x-scroll">
                    <div className="min-w-[700px] bg-white rounded-xl">
                        <div className=" w-full h-full flex border-b-8 border-[#D8EAFF] px-2 py-3 justify-between">
                            <input type="text" className='border-1 w-[40%] border-stroke px-2 py-1 rounded-md bg-blue-100' placeholder='Cari Karyawan' />
                            <Link to={'/hr/pm/masterkaryawan/add'} >
                                <button
                                    className='px-8 py-1 text-sm bg-blue-600 items-center justify-center text-white font-semibold rounded-md'>
                                    TAMBAH PERSONNEL
                                </button>
                            </Link>

                        </div>
                        <div className=" w-full h-full flex-col border-b-8 border-[#D8EAFF]">
                            <div className="flex gap-4 px-3 py-4 border-b-8 border-[#D8EAFF] ">
                                <label className="text-neutral-500 text-xs font-semibold w-[2%]">
                                    No
                                </label>
                                <label className="text-neutral-500 text-xs font-semibold w-[7%]">
                                    NIK
                                </label>
                                <label className="text-neutral-500 text-xs font-semibold w-[16%]">
                                    Nama
                                </label>
                                <label className="text-neutral-500 text-xs font-semibold w-[7%] ">
                                    Jenis Kelamin
                                </label>
                                <label className="text-neutral-500 text-xs font-semibold  w-[7%]">
                                    Posisi
                                </label>
                                <label className="text-neutral-500 text-xs font-semibold  w-[7%]">
                                    Divisi
                                </label>
                                <label className="text-neutral-500 text-xs font-semibold  w-[8%]">
                                    Tipe Penggajian
                                </label>
                                <label className="text-neutral-500 text-xs font-semibold  w-[10%]">
                                    Tanggal Masuk
                                </label>
                                <label className="text-neutral-500 text-xs font-semibold  w-[10%]">
                                    Tanggal Berhenti
                                </label>
                                <div className='flex justify-center w-32'>

                                </div>
                            </div>
                            <div className="w-2 h-full "></div>
                            {masterKaryawan != null &&
                                masterKaryawan.map((data: any, i: any) => (
                                    <>
                                        <div className="flex gap-4 px-3 py-4 border-b-8 border-[#D8EAFF] ">
                                            <label className="text-neutral-500 text-xs font-semibold w-[2%]">
                                                {i + 1}
                                            </label>
                                            <label className="text-neutral-500 text-xs font-semibold w-[7%]">
                                                {data.nik}
                                            </label>
                                            <label className="text-neutral-500 text-xs font-semibold w-[16%] line-clamp-1">
                                                {data.nama}
                                            </label>
                                            <label className="text-neutral-500 text-xs font-semibold w-[7%] ">
                                                {data.jenis_kelamin}
                                            </label>
                                            <label className="text-neutral-500 text-xs font-semibold  w-[7%]">
                                                {data.posisi}
                                            </label>
                                            <label className="text-neutral-500 text-xs font-semibold  w-[7%]">
                                                {data.divisi}
                                            </label>
                                            <label className="text-neutral-500 text-xs font-semibold  w-[8%]">
                                                {data.tipe_penggajian}
                                            </label>
                                            <label className="text-neutral-500 text-xs font-semibold  w-[10%]">
                                                {data.tanggal_masuk}
                                            </label>
                                            <label className="text-neutral-500 text-xs font-semibold  w-[10%]">
                                                {data.tanggal_keluar == '' ? '-' : data.tanggal_keluar}
                                            </label>
                                            <div className='flex justify-end w-32 gap-2'>
                                                <button
                                                    className='px-2 py-1 text-xs bg-green-600 items-center justify-center text-white font-semibold rounded-md'>
                                                    DETAIL
                                                </button>
                                                <button
                                                    className='px-2 py-1 text-xs bg-blue-600 items-center justify-center text-white font-semibold rounded-md'>
                                                    EDIT
                                                </button>
                                            </div>

                                        </div>
                                    </>
                                ))}
                        </div>
                    </div>
                </main>

            </>

        </div>
    )
}

export default MasterKaryawanIsi
