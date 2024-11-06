import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function IsiDepartment() {

    useEffect(() => {
        getKaryawan();

    }, []);

    const [karyawan, setKaryawan] = useState<any>();

    async function getKaryawan() {
        const url = `${import.meta.env.VITE_API_LINK
            }/master/hr/department`;
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
                        <div className='flex w-full  pr-8 border-b-8 border-[#D8EAFF] pb-2'>
                            <div className='px-2 py-1 flex w-full justify-end items-center'>
                                <button
                                    className=' bg-blue-600 rounded-sm text-white text-xs font-bold px-4 py-2'>
                                    TAMBAH DEPARTMENT
                                </button>
                            </div>
                        </div>

                        <div className=" w-full h-full flex-col border-b-8 border-[#D8EAFF]">
                            <div className="grid grid-cols-10 gap-4 px-3 py-4 border-b-8 border-[#D8EAFF] ">

                                <label className="text-neutral-500 text-xs font-semibold  ">
                                    No
                                </label>
                                <label className="text-neutral-500 text-xs font-semibold  col-span-8">
                                    Nama Department
                                </label>

                            </div>
                            <div className="w-2 h-full "></div>
                            {karyawan != null &&
                                karyawan?.data?.map((data: any, i: any) => (
                                    <>
                                        <div className="grid grid-cols-10 gap-4 px-3 items-center py-2 border-b-8 border-[#D8EAFF] ">

                                            <label className="text-neutral-500 text-xs font-semibold  ">
                                                {i + 1}
                                            </label>
                                            <label className="text-neutral-500 text-xs font-semibold  col-span-8">
                                                {data.nama_department}
                                            </label>
                                            <button className='bg-blue-600 rounded-sm text-white text-xs font-bold px-4 py-1'>
                                                EDIT
                                            </button>
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

export default IsiDepartment
