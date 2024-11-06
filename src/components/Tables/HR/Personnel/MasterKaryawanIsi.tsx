import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function MasterKaryawanIsi() {

    useEffect(() => {
        getKaryawan();

    }, []);

    const [karyawan, setKaryawan] = useState<any>();

    async function getKaryawan() {
        const url = `${import.meta.env.VITE_API_LINK
            }/hr/karyawan`;
        try {

            const res = await axios.get(
                url,

                {
                    withCredentials: true,
                },
            );
            setKaryawan(res.data)
            console.log(res.data)
        } catch (error: any) {

            console.log(error);
        }
    }

    const masterKaryawan = [
        {
            nik: 123,
            nama: 'asep kurma',
            jenis_kelamin: 'L',
            posisi: 'Tetap',
            divisi: 'quality',
            tipe_penggajian: 'Bulanan',
            tanggal_masuk: '10/11/2024',
            tanggal_keluar: '',
            status_data: 'Contact'
        },
        {
            nik: 124,
            nama: 'kurma aspe',
            jenis_kelamin: 'L',
            posisi: 'Tetap',
            divisi: 'quality',
            tipe_penggajian: 'Bulanan',
            tanggal_masuk: '11/11/2024',
            tanggal_keluar: '',
            status_data: 'Pendidikan'
        },
        {
            nik: 125,
            nama: 'kurma aspear',
            jenis_kelamin: 'L',
            posisi: 'Tetap',
            divisi: 'quality',
            tipe_penggajian: 'Bulanan',
            tanggal_masuk: '11/11/2024',
            tanggal_keluar: '11/11/2024',
            status_data: 'Complete'
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
                            <div className="grid grid-cols-12 gap-4 px-3 py-4 border-b-8 border-[#D8EAFF] ">
                                <div className='flex gap-3'>
                                    <label className="text-black text-xs font-bold">
                                        No
                                    </label>
                                    <label className="text-neutral-500 text-xs font-semibold ">
                                        NIK
                                    </label>
                                </div>


                                <label className="text-neutral-500 text-xs font-semibold ] ">
                                    Nama
                                </label>
                                <label className="text-neutral-500 text-xs font-semibold  ">
                                    Jenis Kelamin
                                </label>

                                <label className="text-neutral-500 text-xs font-semibold  ">
                                    Divisi
                                </label>
                                <label className="text-neutral-500 text-xs font-semibold  ">
                                    Department
                                </label>
                                <label className="text-neutral-500 text-xs font-semibold  ">
                                    Bagian
                                </label>
                                <label className="text-neutral-500 text-xs font-semibold  ">
                                    Jabatan
                                </label>
                                <label className="text-neutral-500 text-xs font-semibold ">
                                    Tipe Penggajian
                                </label>
                                <label className="text-neutral-500 text-xs font-semibold  ">
                                    Tanggal Masuk
                                </label>
                                <label className="text-neutral-500 text-xs font-semibold  ">
                                    Tanggal Berhenti
                                </label>
                                <label className="text-neutral-500 text-xs font-semibold  ">
                                    Incomplete Data
                                </label>
                                <div className='flex justify-center '>

                                </div>
                            </div>
                            <div className="w-2 h-full "></div>
                            {karyawan != null &&
                                karyawan?.data?.map((data: any, i: any) => (
                                    <>
                                        <div className="grid grid-cols-12 gap-4 px-3 py-4 border-b-8 border-[#D8EAFF] ">
                                            <div className='flex gap-3'>
                                                <label className="text-black text-xs font-bold ">
                                                    {i + 1}
                                                </label>
                                                <label className="text-neutral-500 text-xs font-semibold ">
                                                    {data.biodata_karyawan[0]?.nik}
                                                </label>
                                            </div>

                                            <label className="text-neutral-500 text-xs font-semibold ">
                                                {data.name}
                                            </label>
                                            <label className="text-neutral-500 text-xs font-semibold">
                                                {data.biodata_karyawan[0]?.jenis_kelamin}
                                            </label>
                                            <label className="text-neutral-500 text-xs font-semibold  ">
                                                {data.biodata_karyawan[0]?.divisi?.nama_divisi}
                                            </label>
                                            <label className="text-neutral-500 text-xs font-semibold  ">
                                                {data.biodata_karyawan[0]?.department?.nama_department}
                                            </label>
                                            <label className="text-neutral-500 text-xs font-semibold  ">
                                                {data.biodata_karyawan[0]?.bagian?.nama_bagian}
                                            </label>
                                            <label className="text-neutral-500 text-xs font-semibold  ">
                                                {data.biodata_karyawan[0]?.jabatan}
                                            </label>
                                            <label className="text-neutral-500 text-xs font-semibold  ">
                                                {data.biodata_karyawan[0]?.type_penggajian}
                                            </label>
                                            <label className="text-neutral-500 text-xs font-semibold  ">
                                                {data.biodata_karyawan[0]?.tgl_masuk == '' ? '-' : data.biodata_karyawan[0]?.tgl_masuk}
                                            </label>
                                            <label className="text-neutral-500 text-xs font-semibold  ">
                                                {data.biodata_karyawan[0]?.tgl_keluar == '' ? '-' : data.biodata_karyawan[0]?.tgl_keluar}
                                            </label>
                                            <label className="text-neutral-500 text-xs font-semibold  ">
                                                {data.status_data == '' ? '-' : data.status_data}
                                            </label>
                                            <div className='lg:flex-col md:flex-col sm:flex  gap-1'>
                                                <Link
                                                    className='px-2 py-1  text-xs bg-yellow-400 items-center justify-center text-white font-semibold rounded-md flex w-full'
                                                    to={`/hr/pm/masterkaryawan/lengkapi`} >
                                                    <button
                                                        className=' '>
                                                        LENGKAPI
                                                    </button>
                                                </Link>
                                                <button
                                                    className='px-2 py-1  text-xs bg-green-600 items-center justify-center text-white font-semibold rounded-md  '>
                                                    DETAIL
                                                </button>
                                                <button
                                                    className='px-2 py-1 text-xs bg-blue-600 items-center justify-center text-white font-semibold rounded-md  '>
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
