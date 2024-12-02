import React, { useEffect, useState } from 'react';

import axios from 'axios';
import StaffCalendar from './StaffCalendar';
import ModalKosonganSmall from '../../../../Modals/ModalKosonganSmall';
import Loading from '../../../../Loading';


function StaffKalenderKerja() {

    const [isLoading, setIsLoading] = useState(false);
    const tukarHari = [
        {
            nik: 123,
            jadwal: '1 Agustus 2024',
            permintaan: '2 Agustus 2024',
            mark: 'Produksi 1',

        },
        {
            nik: 124,
            jadwal: '3 Agustus 2024',
            permintaan: '4 Agustus 2024',
            mark: 'Produksi 2',

        },
        {
            nik: 125,
            jadwal: '6 Agustus 2024',
            permintaan: '7 Agustus 2024',
            mark: 'Produksi 2',

        }
    ]


    useEffect(() => {

        getKaryawanJadwal()
    }, []);



    const [karyawanJadwal, setKaryawanJadwal] = useState<any>([]);
    const [produksiJadwal, setProduksiJadwal] = useState<any>([]);

    async function getKaryawanJadwal() {
        const url = `${import.meta.env.VITE_API_LINK
            }/hr/jadwalKaryawan?jenis_karyawan=staff`;
        const url2 = `${import.meta.env.VITE_API_LINK
            }/hr/jadwalKaryawan?jenis_karyawan=produksi`;
        try {
            setIsLoading(true)
            const res = await axios.get(
                url,
                {
                    withCredentials: true,
                },

            );
            const res2 = await axios.get(
                url2,
                {
                    withCredentials: true,
                },

            );
            setIsLoading(false)
            setKaryawanJadwal(res.data)
            setProduksiJadwal(res2.data)
            console.log(res2.data);
        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }

    const [tahun, setTahun] = useState<any>();
    const [hari, setHari] = useState<any>([]);
    const [jenisKaryawan, setJenisKaryawan] = useState<any>();

    async function postSabtuMinggu() {
        const url = `${import.meta.env.VITE_API_LINK
            }/hr/jadwalKaryawanSatuTahun`;
        try {
            setIsLoading(true)
            const res = await axios.post(
                url,
                {
                    tahun: tahun,
                    hari: hari,
                    jenis_karyawan: jenisKaryawan
                },
                {
                    withCredentials: true,
                },

            );
            setIsLoading(false)
            window.location.reload();
        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }
    const [showHistory, setShowHistory] = useState(false);
    const openModalHistory = () => setShowHistory(true);
    const closeModalHistory = () => setShowHistory(false);

    const handleCheckboxChange = (e: any) => {
        if (!e) return;
        const { value, checked } = e.target;

        setHari((prevHari: any) => {
            if (checked) {
                return [...prevHari, value]; // Add value if checked
            } else {
                return prevHari.filter((item: any) => item !== value); // Remove value if unchecked
            }
        });
    };
    return (
        <>
            <main>
                {isLoading && <Loading />}
                <div className="bg-white w-full mb-5 rounded-md p-3 flex flex-col justify-center items-center gap-3">
                    <div className='flex w-full justify-end'>
                        <button
                            onClick={() => openModalHistory()}
                            className='bg-primary text-white font-semibold text-md px-4 py-1 rounded-md'>
                            Tambah Libur 1 Tahun
                        </button>
                        {showHistory == true && (
                            <>
                                <ModalKosonganSmall
                                    isOpen={showHistory}
                                    onClose={() => closeModalHistory()}
                                    judul={'Tambah Libur 1 Tahun'}
                                >
                                    <>
                                        <div className='flex flex-col py-2'>
                                            <div className="flex w-full flex-col px-4 py-1">
                                                <label className="text-black text-xs font-bold">
                                                    TAHUN
                                                </label>
                                                <div className="flex w-full">
                                                    <input
                                                        name="grade"
                                                        onChange={(e) => { setTahun(e.target.value) }}
                                                        type="number"
                                                        className=" w-full h-7 border-2 border-stroke rounded-md"
                                                    />
                                                </div>

                                            </div>
                                            <div className="flex w-full flex-col px-4 py-1">
                                                <label className="text-black text-xs font-bold">
                                                    HARI
                                                </label>
                                                <div className="flex w-full flex-wrap">
                                                    <div className='flex px-2 py-1'>
                                                        <input
                                                            id='senin'
                                                            name="hari"
                                                            value='Senin'
                                                            onChange={(e) => { handleCheckboxChange(e) }}
                                                            type="checkbox"
                                                            className=" h-6 w-6 border-2 border-stroke rounded-md"
                                                        />
                                                        <label className="text-black text-sm font-bold pl-1">
                                                            Senin
                                                        </label>
                                                    </div>
                                                    <div className='flex px-2 py-1'>
                                                        <input
                                                            id='selasa'
                                                            name="hari"
                                                            value='Selasa'
                                                            onChange={(e) => {

                                                                handleCheckboxChange(e)
                                                            }}
                                                            type="checkbox"
                                                            className=" h-6 w-6 border-2 border-stroke rounded-md"
                                                        />
                                                        <label className="text-black text-sm font-bold pl-1">
                                                            Selasa
                                                        </label>
                                                    </div>
                                                    <div className='flex px-2 py-1'>
                                                        <input
                                                            id='rabu'
                                                            name="hari"
                                                            value='Rabu'
                                                            onChange={(e) => { handleCheckboxChange(e) }}
                                                            type="checkbox"
                                                            className=" h-6 w-6 border-2 border-stroke rounded-md"
                                                        />
                                                        <label className="text-black text-sm font-bold pl-1">
                                                            Rabu
                                                        </label>
                                                    </div>
                                                    <div className='flex px-2 py-1'>
                                                        <input
                                                            id='kamis'
                                                            name="hari"
                                                            value='Kamis'
                                                            onChange={(e) => { handleCheckboxChange(e) }}
                                                            type="checkbox"
                                                            className=" h-6 w-6 border-2 border-stroke rounded-md"
                                                        />
                                                        <label className="text-black text-sm font-bold pl-1">
                                                            Kamis
                                                        </label>
                                                    </div>
                                                    <div className='flex px-2 py-1'>
                                                        <input
                                                            id='jumat'
                                                            name="hari"
                                                            value='Jumat'
                                                            onChange={(e) => { handleCheckboxChange(e) }}
                                                            type="checkbox"
                                                            className=" h-6 w-6 border-2 border-stroke rounded-md"
                                                        />
                                                        <label className="text-black text-sm font-bold pl-1">
                                                            Jumat
                                                        </label>
                                                    </div>
                                                    <div className='flex px-2 py-1'>
                                                        <input
                                                            id='sabtu'
                                                            name="hari"
                                                            value='Sabtu'
                                                            onChange={(e) => { handleCheckboxChange(e) }}
                                                            type="checkbox"
                                                            className=" h-6 w-6 border-2 border-stroke rounded-md"
                                                        />
                                                        <label className="text-black text-sm font-bold pl-1">
                                                            Sabtu
                                                        </label>
                                                    </div>
                                                    <div className='flex px-2 py-1'>
                                                        <input
                                                            id='minggu'
                                                            name="hari"
                                                            value='Minggu'
                                                            onChange={(e) => { handleCheckboxChange(e) }}
                                                            type="checkbox"
                                                            className=" h-6 w-6 border-2 border-stroke rounded-md"
                                                        />
                                                        <label className="text-black text-sm font-bold pl-1">
                                                            Minggu
                                                        </label>
                                                    </div>
                                                </div>
                                                <label className="text-black text-xs font-bold pt-3">
                                                    JENIS KARYAWAN
                                                </label>
                                                <select
                                                    className='`text-neutral-500  text-sm font-semibold relative z-20 w-full h-8  appearance-none rounded-md border-2 border-stroke  bg-transparent py-1 px-2 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input'

                                                    onChange={(e) => setJenisKaryawan(e.target.value)}>
                                                    <option value="" disabled selected className='text-neutral-500  text-sm font-semibold'>Pilih Jenis</option>
                                                    <option value="staff" className='text-neutral-500  text-sm font-semibold'>STAFF</option>
                                                    <option value="produksi" className='text-neutral-500  text-sm font-semibold'>PRODUKSI</option>

                                                </select>
                                                <div className=" pt-3">
                                                    <button
                                                        disabled={isLoading}
                                                        onClick={() => postSabtuMinggu()}
                                                        className="bg-[#0065DE] text-center text-white text-xs font-bold px-6 py-3 rounded-md"
                                                    >
                                                        SIMPAN
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                </ModalKosonganSmall>
                            </>
                        )}
                    </div>
                    <label className="text-blue-500 text-xl font-semibold">
                        KALENDER HR
                    </label>
                    <StaffCalendar data={karyawanJadwal} data2={produksiJadwal} />

                </div>
                <div className=' w-full bg-white rounded-md flex flex-col border-b-8 border-[#D8EAFF]   '>
                    <div className="grid grid-cols-12 items-center px-3 py-4  gap-2 w-full border-b-8 border-[#D8EAFF]">
                        <label className="text-neutral-500 text-sm font-semibold">
                            No
                        </label>
                        <label className="text-neutral-500 text-sm font-semibold col-span-3">
                            Jadwal Awal
                        </label>
                        <label className="text-neutral-500 text-sm font-semibold col-span-3">
                            Permintaan
                        </label>
                        <label className="text-neutral-500 text-sm font-semibold col-span-2">
                            Mark
                        </label>
                    </div>

                    {tukarHari != null &&
                        tukarHari.map((data: any, i: any) => (
                            <>
                                <div className="grid grid-cols-12 items-center px-3 py-2  gap-2 w-full border-b-8 border-[#D8EAFF]">
                                    <label className="text-neutral-500 text-sm font-semibold">
                                        {i + 1}
                                    </label>
                                    <label className="text-neutral-500 text-sm font-semibold col-span-3">
                                        {data.jadwal}
                                    </label>
                                    <label className="text-neutral-500 text-sm font-semibold col-span-3">
                                        {data.permintaan}
                                    </label>
                                    <label className="text-neutral-500 text-sm font-semibold col-span-3">
                                        {data.mark}
                                    </label>
                                    <button className='px-6 py-2 bg-blue-600 text-white text-md rounded-md font-semibold col-span-2'>
                                        Action
                                    </button>
                                </div>
                            </>
                        )
                        )}

                </div>
            </main >
        </>
    );
}

export default StaffKalenderKerja;
