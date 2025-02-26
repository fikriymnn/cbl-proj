import React, { useEffect, useState } from 'react';

import axios from 'axios';
import StaffCalendar from './StaffCalendar';
import ModalKosonganSmall from '../../../../Modals/ModalKosonganSmall';
import Loading from '../../../../Loading';
import ModalXL from '../../../PPIC/JadwalProduksi/ModalXL';
import convertTimeStampToDate from '../../../../../utils/convertDate';


function StaffKalenderKerja() {
    const [dateFrom, setDateFrom] = useState<any>();
    const [dateTo, setDateTo] = useState<any>();
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
        getBiasaJadwal(null, null)
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
    const [biasaJadwal, setBiasaJadwal] = useState<any>([]);

    async function getBiasaJadwal(start: any, end: any) {
        const url = `${import.meta.env.VITE_API_LINK
            }/hr/jadwalKaryawan`;

        try {
            setIsLoading(true)
            const res = await axios.get(url, {
                params: {
                    start_date: start,
                    end_date: end,
                    libur_1_tahun: false
                },
                withCredentials: true,
            });
            setIsLoading(false)
            setBiasaJadwal(res.data)
            console.log('libur 1', res.data);
        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }
    const [thn, setThn] = useState<any>(null);
    const [jadwalName, setjadwalName] = useState<any>(null);
    const [jeka, setJeka] = useState<any>(null);

    async function deleteMingguJadwal(thn: any, namaJadwal: any, jenisKaryawan: any) {
        if (window.confirm(`Apakah Anda yakin akan menghapus hari Minggu di Tahun ${thn} dengan keterangan ${namaJadwal} dengan tipe karyawan ${jenisKaryawan}`)) {
            const url = `${import.meta.env.VITE_API_LINK
                }/hr/jadwalKaryawanSatuTahun`;

            try {
                setIsLoading(true)

                const res = await axios.delete(url, {
                    data: {
                        tahun: thn,
                        nama_jadwal: namaJadwal,
                        jenis_karyawan: jenisKaryawan,
                    },
                    withCredentials: true,
                });
                setThn(null)
                setjadwalName(null)
                setJeka(null)
                setIsLoading(false)
                getKaryawanJadwal()
                closeModalDeleteMinggu()
                console.log(res.data)
            } catch (error: any) {
                setIsLoading(false)
                console.log(error);
            }
        }
    }
    async function deleteBiasaJadwal(id: any, tgl: any, ket: any) {
        if (window.confirm(`Apakah Anda yakin akan menghapus hari libur di tanggal ${tgl} ini dengan keterangan ${ket}`)) {
            const url = `${import.meta.env.VITE_API_LINK
                }/hr/jadwalKaryawan/${id}`;

            try {
                setIsLoading(true)
                const res = await axios.delete(
                    url,
                    {
                        withCredentials: true,
                    },

                );
                setIsLoading(false)
                getBiasaJadwal(null, null)
            } catch (error: any) {
                setIsLoading(false)
                console.log(error);
            }
        }
    }
    const [tahun, setTahun] = useState<any>();
    const [hari, setHari] = useState<any>([]);
    const [jenisKaryawan, setJenisKaryawan] = useState<any>();

    async function postSabtuMinggu() {

        if (window.confirm(`Apakah Anda yakin akan menambah hari libur 1 tahun di ${tahun} dengan hari ${hari} dengan jenis karyawan ${jenisKaryawan}`)) {
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
    }

    const [tgl, setTgl] = useState<any>();
    const [namaJadwal, setNamaJadwal] = useState<any>();
    const [produksi, setProduksi] = useState<any>(false);
    const [staff, setStaff] = useState<any>(false);
    const [potongCuti, setpotongCuti] = useState<any>(false);

    async function postSatuHari() {

        if (window.confirm(`Apakah Anda yakin akan menambah hari libur Pada tanggal ${tgl} dengan nama ${namaJadwal}`)) {
            const url = `${import.meta.env.VITE_API_LINK
                }/hr/jadwalKaryawan`;
            try {
                setIsLoading(true)
                const res = await axios.post(
                    url,
                    {
                        tanggal: tgl,
                        nama_jadwal: namaJadwal,
                        produksi: produksi,
                        staff: staff,
                        potong_cuti_tahunan: potongCuti
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
    }
    const handleCheckboxChangeP = (event: any) => {
        const { name, checked } = event.target;
        if (name === 'produksi') {
            setProduksi(checked);
        } else if (name === 'staff') {
            setStaff(checked);
        }

    };

    const [showHistory, setShowHistory] = useState(false);
    const openModalHistory = () => setShowHistory(true);
    const closeModalHistory = () => setShowHistory(false);

    const [showHistory2, setShowHistory2] = useState(false);
    const openModalHistory2 = () => setShowHistory2(true);
    const closeModalHistory2 = () => setShowHistory2(false);

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
        console.log(hari)
    };
    const [showHistory3, setShowHistory3] = useState(false);
    const openModalHistory3 = () => setShowHistory3(true);
    const closeModalHistory3 = () => setShowHistory3(false);

    const [showDeleteMinggu, setShowDeleteMinggu] = useState(false);
    const openModalDeleteMinggu = () => setShowDeleteMinggu(true);
    const closeModalDeleteMinggu = () => setShowDeleteMinggu(false);
    return (
        <>
            <main>
                {isLoading && <Loading />}
                <div className="bg-white w-full mb-5 rounded-md p-3 flex flex-col justify-center items-center gap-3">
                    <div className='flex  gap-1 w-full justify-end items-end'>
                        <button
                            onClick={() => openModalDeleteMinggu()}
                            className='bg-primary w-[20%] text-white font-semibold text-md px-4 py-1 rounded-md'>
                            Hapus Sabtu/Minggu
                        </button>
                        {showDeleteMinggu == true && (
                            <>
                                <ModalKosonganSmall
                                    isOpen={showDeleteMinggu}
                                    onClose={() => closeModalDeleteMinggu()}
                                    judul={'Hapus Sabtu Minggu'}
                                >
                                    <>
                                        <div className='flex flex-col gap-2 py-2 px-4'>
                                            <div className="flex w-full flex-col py-1">
                                                <label className="text-black text-xs font-bold">
                                                    TAHUN
                                                </label>
                                                <div className="flex w-full">
                                                    <input
                                                        name="grade"
                                                        onChange={(e) => { setThn(e.target.value) }}
                                                        type="number"
                                                        className=" w-full h-7 border-2 border-stroke rounded-md"
                                                    />
                                                </div>

                                            </div>
                                            <div className='flex gap-2'>
                                                <div className='flex gap-1'>
                                                    <input
                                                        onChange={(e) => setjadwalName(e.target.value)}
                                                        type='radio' name='jadwalName' id='jadwalName1' value={'Sabtu'} />Sabtu
                                                </div>

                                                <div className='flex gap-1'>
                                                    <input
                                                        onChange={(e) => setjadwalName(e.target.value)}
                                                        type='radio' name='jadwalName' id='jadwalName2' value={'Minggu'} />Minggu
                                                </div>
                                            </div>
                                            <div className='flex gap-2'>
                                                <div className='flex gap-1'>
                                                    <input
                                                        onChange={(e) => setJeka(e.target.value)}
                                                        type='radio' name='jeka' id='jeka1' value={'produksi'} />Produksi
                                                </div>

                                                <div className='flex gap-1'>
                                                    <input
                                                        onChange={(e) => setJeka(e.target.value)}
                                                        type='radio' name='jeka' id='jeka2' value={'staff'} />Staff
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => deleteMingguJadwal(thn, jadwalName, jeka)}
                                                className='bg-red-500 w-full text-white font-semibold text-md px-4 py-1 rounded-md'>
                                                Hapus
                                            </button>
                                        </div>
                                    </>
                                </ModalKosonganSmall>
                            </>
                        )}
                        <button
                            onClick={() => openModalHistory3()}
                            className='bg-primary w-[20%] text-white font-semibold text-md px-4 py-1 rounded-md'>
                            Daftar Libur
                        </button>
                        {showHistory3 == true && (
                            <>
                                <ModalXL
                                    isOpen={showHistory3}
                                    onClose={() => closeModalHistory3()}
                                    judul={'Daftar Libur'}
                                >
                                    <>
                                        <div className="grid grid-cols-12 w-full md:gap-4 gap-1  px-4 py-4 md:mt-0   bg-white mb-2 border-b-8 border-[#D8EAFF]">
                                            <div className='col-span-8 gap-2 flex flex-col'>
                                                <p className="my-auto text-sm text-primary font-semibold">
                                                    Pilih Tanggal
                                                </p>
                                                <div className="flex md:max-w-[40%] max-w-[70%]  gap-2 justify-between">
                                                    <p className="text-sm text-primary font-semibold ">
                                                        Dari :
                                                    </p>

                                                    <input
                                                        className='rounded-md bg-blue-200 px-2'
                                                        type="date"
                                                        onChange={(e) => setDateFrom(e.target.value)}
                                                    ></input>

                                                </div>
                                                <div className="flex   md:max-w-[40%] max-w-[70%] gap-2 justify-between">
                                                    <p className="text-sm text-primary font-semibold ">
                                                        Sampai :
                                                    </p>

                                                    <input
                                                        className='rounded-md bg-blue-200 px-2'
                                                        type="date"
                                                        onChange={(e) => setDateTo(e.target.value)}
                                                    ></input>

                                                </div>
                                            </div>

                                            <div className="flex w-full  items-end gap-1">
                                                <button
                                                    onClick={() => {
                                                        console.log(dateTo, dateFrom)
                                                        getBiasaJadwal(dateFrom, dateTo)
                                                    }}
                                                    className="bg-primary text-white px-5 py-2 rounded-md my-auto "
                                                >
                                                    Filter
                                                </button>
                                                <button
                                                    onClick={() => {

                                                        getBiasaJadwal(null, null)
                                                    }}
                                                    className="bg-primary text-white px-5 py-2 rounded-md my-auto "
                                                >
                                                    Reset
                                                </button>
                                            </div>
                                        </div>


                                        <div className='grid grid-cols-12  bg-white  border-b-8 border-[#D8EAFF] px-[1%] py-[1%]'>
                                            <p className='text-[#646464] text-xs font-bold '>
                                                No
                                            </p>
                                            <p className='text-[#646464] text-xs font-bold col-span-2'>
                                                Jenis Karyawan
                                            </p>
                                            <p className='text-[#646464] text-xs font-bold col-span-3'>
                                                Nama Jadwal
                                            </p>
                                            <p className='text-[#646464] text-xs font-bold col-span-2'>
                                                Tanggal
                                            </p>
                                            <p className='text-[#646464] text-xs font-bold col-span-2'>
                                                Potong Cuti
                                            </p>
                                        </div>

                                        <div className='max-h-[500px] overflow-y-scroll'>
                                            {biasaJadwal?.data?.map((data: any, i: number) => (
                                                <>
                                                    <div
                                                        key={i}
                                                        className='grid grid-cols-12  bg-white  border-b-8 border-[#D8EAFF] px-[1%] py-[1%] '>
                                                        <p className='text-[#646464] text-sm  '>
                                                            {i + 1}
                                                        </p>
                                                        <p className='text-[#646464] text-sm  col-span-2'>
                                                            {data.jenis_karyawan}
                                                        </p>
                                                        <p className='text-[#646464] text-sm  col-span-3'>
                                                            {data.nama_jadwal}
                                                        </p>
                                                        <p className='text-[#646464] text-sm  col-span-2'>
                                                            {convertTimeStampToDate(data.tanggal)}
                                                        </p>
                                                        <p className='text-[#646464] text-sm  col-span-2'>
                                                            {data.potong_cuti_tahunan == true ? 'YA' : 'TIDAK'}
                                                        </p>
                                                        <button
                                                            onClick={() => deleteBiasaJadwal(data.id, convertTimeStampToDate(data.tanggal), data.nama_jadwal)}
                                                            className='text-red-400 text-sm  font-bold'>
                                                            HAPUS
                                                        </button>
                                                    </div>
                                                </>
                                            ))}
                                        </div>

                                    </>
                                </ModalXL>
                            </>
                        )}

                        <button
                            onClick={() => openModalHistory()}
                            className='bg-primary w-[20%] text-white font-semibold text-md px-4 py-1 rounded-md'>
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
                        <button
                            onClick={() => openModalHistory2()}
                            className='bg-primary w-[20%] text-white font-semibold text-md px-4 py-1 rounded-md'>
                            Tambah Libur 1 Hari
                        </button>
                        {showHistory2 == true && (
                            <>
                                <ModalKosonganSmall
                                    isOpen={showHistory2}
                                    onClose={() => closeModalHistory2()}
                                    judul={'Tambah Libur 1 Hari'}
                                >
                                    <>
                                        <div className='flex flex-col px-4 py-2'>
                                            <label className="text-black text-sm font-bold">
                                                Tanggal
                                            </label>
                                            <input
                                                type="date"
                                                id="tgl"
                                                name="tgl"
                                                onChange={(e) => setTgl(e.target.value)}
                                                className=" w-full h-7 border-2 border-stroke rounded-md"
                                            />


                                            <label className="text-black text-sm font-bold  pt-2">
                                                Nama Jadwal
                                            </label>
                                            <input
                                                type="text"
                                                id="namaJadwal"
                                                name="namaJadwal"
                                                onChange={(e) => setNamaJadwal(e.target.value)}
                                                className=" w-full h-7 border-2 border-stroke rounded-md"
                                            />
                                            <label className="text-black text-sm font-bold pt-2">
                                                Produksi:
                                                <input
                                                    type="checkbox"
                                                    id="produksi"
                                                    name="produksi"
                                                    checked={produksi}
                                                    onChange={handleCheckboxChangeP}
                                                />
                                            </label>
                                            <label className="text-black text-sm font-bold">
                                                Staff:
                                                <input
                                                    type="checkbox"
                                                    id="staff"
                                                    name="staff"
                                                    checked={staff}
                                                    onChange={handleCheckboxChangeP}
                                                />
                                            </label>
                                            <label className="text-black text-xs font-bold pt-3">
                                                POTONG CUTI TAHUNAN:
                                            </label>
                                            <div className="flex gap-4 py-2">
                                                <label className="flex items-center gap-2 text-neutral-500 text-sm font-semibold">
                                                    <input
                                                        type="radio"
                                                        name="potongCuti"
                                                        value="true"
                                                        onChange={() => setpotongCuti(true)}
                                                        className="accent-primary"
                                                    />
                                                    YA
                                                </label>
                                                <label className="flex items-center gap-2 text-neutral-500 text-sm font-semibold">
                                                    <input
                                                        type="radio"
                                                        name="potongCuti"
                                                        value="false"
                                                        onChange={() => setpotongCuti(false)}
                                                        className="accent-primary"
                                                    />
                                                    TIDAK
                                                </label>
                                            </div>

                                            <button
                                                disabled={isLoading}
                                                onClick={() => postSatuHari()}
                                                className="bg-[#0065DE] text-center text-white text-xs font-bold px-6 py-3 rounded-md"
                                            >
                                                SIMPAN
                                            </button>
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
