import React, { useEffect, useState } from 'react'
import axios from 'axios';
import Loading from '../../../Loading';
import { useParams } from 'react-router-dom';

function EditMasterKaryawanIsi() {

    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        getDepartment();
        getBagian();
        getDivisi();
        getKaryawan();
        getGradeMaster();
    }, []);

    const [karyawan, setKaryawan] = useState<any>([]);

    async function getKaryawan() {
        const url = `${import.meta.env.VITE_API_LINK
            }/hr/karyawan/${id}`;
        try {
            setIsLoading(true)
            const res = await axios.get(
                url,
                {
                    withCredentials: true,
                },
            );
            console.log(res.data)
            setKaryawan(res.data)
            setIsLoading(false)

        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }
    const [gradeMaster, setGradeMaster] = useState<any>();
    async function getGradeMaster() {
        const url = `${import.meta.env.VITE_API_LINK
            }/master/hr/grade`;
        try {
            setIsLoading(true)
            const res = await axios.get(
                url,

                {
                    withCredentials: true,
                },
            );
            setIsLoading(false)
            setGradeMaster(res.data)
            console.log(res.data)
        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }
    const [department, setDepartment] = useState<any>();

    async function getDepartment() {
        const url = `${import.meta.env.VITE_API_LINK
            }/master/hr/department`;
        try {
            setIsLoading(true)
            const res = await axios.get(
                url,

                {
                    withCredentials: true,
                },
            );
            setIsLoading(false)
            setDepartment(res.data)
            console.log(res.data)
        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }

    const [divisi, setDivisi] = useState<any>();

    async function getDivisi() {
        const url = `${import.meta.env.VITE_API_LINK
            }/master/hr/divisi`;
        try {
            setIsLoading(true)
            const res = await axios.get(
                url,

                {
                    withCredentials: true,
                },
            );
            setIsLoading(false)
            setDivisi(res.data)
            console.log(res.data)
        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }

    const [bagian, setBagian] = useState<any>();

    async function getBagian() {
        const url = `${import.meta.env.VITE_API_LINK
            }/master/hr/bagian`;
        try {
            setIsLoading(true)
            const res = await axios.get(
                url,

                {
                    withCredentials: true,
                },
            );
            setIsLoading(false)
            setBagian(res.data)
            console.log(res.data)
        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }
    const [namaKaryawanEdit, setnamaKaryawanEdit] = useState<any>();
    const [nikEdit, setnikEdit] = useState<any>();
    const [jenisKelaminEdit, setjenisKelaminEdit] = useState<any>();
    const [idDivisiEdit, seidDivisiEdit] = useState<any>();
    const [idDepartmentEdit, setidDepartmentEdit] = useState<any>();
    const [idDagianEdit, setidDagianEdit] = useState<any>();
    const [gradeEdit, setgradeEdit] = useState<any>();
    const [tglMasukEdit, setglMasukEdit] = useState<any>();
    const [tglKeluarEdit, setglKeluarEdit] = useState<any>();
    const [tipePenggajianEdit, settipePenggajianEdit] = useState<any>();
    const [jabatanEdit, sejabatanEdit] = useState<any>();
    const [statusKaryawanEdit, setstatusKaryawanEdit] = useState<any>();
    const [statusPajakEdit, sestatusPajakEdit] = useState<any>();
    const [levelEdit, setlevelEdit] = useState<any>();
    const [subLevelEdit, setsubLevelEdit] = useState<any>();
    const [gaji, setGaji] = useState<any>(0);
    const [kontrakDari, setKOntrakDari] = useState<any>(null);
    const [kontrakSampai, setKontrakSampai] = useState<any>(null);
    const [tipeKaryawan, seTipeKaryawan] = useState<any>();

    async function tambahKaryawan() {
        const url = `${import.meta.env.VITE_API_LINK
            }/hr/karyawan/${id}`;
        try {
            setIsLoading(true)
            const res = await axios.put(
                url,
                {
                    nama_karyawan: namaKaryawanEdit,
                    tipe_karyawan: tipeKaryawan,
                    nik: nikEdit,
                    jenis_kelamin: jenisKelaminEdit,
                    id_divisi: idDivisiEdit,
                    id_department: idDepartmentEdit,
                    id_bagian: idDagianEdit,
                    id_grade: gradeEdit,
                    tgl_masuk: tglMasukEdit,
                    tgl_keluar: tglKeluarEdit,
                    tipe_penggajian: tipePenggajianEdit,
                    jabatan: jabatanEdit,
                    status_karyawan: statusKaryawanEdit,
                    status_pajak: statusPajakEdit,
                    level: levelEdit,
                    sub_level: subLevelEdit,
                    gaji: gaji,
                    kontrak_dari: kontrakDari,
                    kontrak_sampai: kontrakSampai
                },
                {
                    withCredentials: true,
                },
            );
            console.log(res.data)
            setIsLoading(false)
            alert('Data Berhasil Diubah')
        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }

    return (
        <main className="overflow-x-scroll">
            {isLoading && <Loading />}
            <div className="min-w-[700px] bg-white rounded-t-md border-b-8 border-[#D8EAFF] h-12">

            </div>
            <div className="min-w-[700px] bg-white  border-b-8 border-[#D8EAFF] ">
                <div className='flex w-full bg-[#eeeeee] px-6 py-3'>
                    <label className='text-[#0065de] text-sm font-semibold'>
                        BIODATA
                    </label>

                </div>
                <div className=' w-full bg-white px-6 py-4 grid grid-cols-2 gap-3'>
                    <div className='flex flex-col gap-2 justify-between'>
                        <div>
                            <label className=' text-sm font-semibold'>
                                NIK<span className='text-red-600'>*</span>
                            </label>
                            <div className='flex w-full gap-7'>
                                <input
                                    defaultValue={karyawan?.data?.biodata_karyawan[0]?.nik}
                                    onChange={(e) => setnikEdit(e.target.value)}
                                    type='text' className='border-stroke border-2 rounded-md w-[40%]' />

                            </div>
                            <div className='flex flex-col gap-1'>
                                <label className=' text-sm font-semibold'>
                                    Nama Karyawan<span className='text-red-600'>*</span>
                                </label>
                                <input
                                    defaultValue={karyawan?.data?.name}
                                    onChange={(e) => setnamaKaryawanEdit(e.target.value)}
                                    type='text' className='border-stroke border-2 rounded-md w-[40%]' />
                                <div className='flex flex-col gap-1 pt-2'>
                                    <label className=' text-sm font-semibold'>
                                        Tipe Karyawan<span className='text-red-600'>*</span>
                                    </label>
                                    <div className='flex w-full gap-7'>

                                        <div className='flex gap-1'>
                                            <input
                                                onChange={(e) => seTipeKaryawan(e.target.value)}
                                                type='radio' name='tipeKryawan' id='tipeKryawan1' value={'produksi'} />Produksi
                                        </div>

                                        <div className='flex gap-1'>
                                            <input
                                                onChange={(e) => seTipeKaryawan(e.target.value)}
                                                type='radio' name='tipeKryawan' id='tipeKryawan2' value={'staff'} />Staff
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className='flex flex-col gap-1'>
                                <label className=' text-sm font-semibold'>
                                    Divisi<span className='text-red-600'>*</span>
                                </label>
                                <div className="relative z-20 h-10 bg-white dark:bg-form-input  w-full">
                                    <span className="absolute top-1/2 left-4 z-30 -translate-y-1/2">
                                        <svg
                                            width="20"
                                            height="20"
                                            viewBox="0 0 20 20"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >

                                        </svg>
                                    </span>

                                    <select
                                        defaultValue={karyawan?.data?.biodata_karyawan[0]?.divisi?.nama_divisi}
                                        name='nama_divisi'
                                        onChange={(e) => seidDivisiEdit(e.target.value)}
                                        className={`relative z-20 w-full bg-[#64646424] appearance-none rounded-md h-7 py-1 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input  
                                    }`}
                                    >
                                        <option value={''} disabled className="text-[#646464] text-xs dark:text-bodydark">
                                            Pilih
                                        </option>
                                        {divisi?.data?.map((data: any, i: number) => {

                                            return (
                                                <option
                                                    value={data.id}
                                                    className="text-gray-800 text-xs font-light dark:text-bodydark"
                                                >
                                                    {data.nama_divisi}
                                                </option>
                                            )
                                        }
                                        )}

                                    </select>

                                    <span className="absolute top-[15px] right-4 z-10 -translate-y-1/2">
                                        <svg
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <g opacity="0.8">
                                                <path
                                                    fillRule="evenodd"
                                                    clipRule="evenodd"
                                                    d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                                                    fill="#637381"
                                                ></path>
                                            </g>
                                        </svg>
                                    </span>

                                </div>
                            </div>
                            <div className='flex gap-4'>
                                <div className='flex flex-col gap-1 w-[60%]'>
                                    <label className=' text-sm font-semibold'>
                                        Department<span className='text-red-600'>*</span>
                                    </label>
                                    <div className="relative z-20 h-10 bg-white dark:bg-form-input  w-full">
                                        <span className="absolute top-1/2 left-4 z-30 -translate-y-1/2">
                                            <svg
                                                width="20"
                                                height="20"
                                                viewBox="0 0 20 20"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >

                                            </svg>
                                        </span>

                                        <select
                                            defaultValue={karyawan?.data?.biodata_karyawan[0]?.department?.nama_department}
                                            name='nama_department'
                                            onChange={(e) => setidDepartmentEdit(e.target.value)}
                                            className={`relative z-20 w-full bg-[#64646424] appearance-none rounded-md h-7 py-1 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input  
                                    }`}
                                        >
                                            <option value={''} disabled className="text-[#646464] text-xs dark:text-bodydark">
                                                Pilih
                                            </option>
                                            {department?.data?.map((data: any, i: number) => {

                                                return (
                                                    <option
                                                        value={data.id}
                                                        className="text-gray-800 text-xs font-light dark:text-bodydark"
                                                    >
                                                        {data.nama_department}
                                                    </option>
                                                )
                                            }
                                            )}

                                        </select>

                                        <span className="absolute top-[15px] right-4 z-10 -translate-y-1/2">
                                            <svg
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <g opacity="0.8">
                                                    <path
                                                        fillRule="evenodd"
                                                        clipRule="evenodd"
                                                        d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                                                        fill="#637381"
                                                    ></path>
                                                </g>
                                            </svg>
                                        </span>

                                    </div>
                                </div>
                                <div className='flex flex-col gap-1 w-[40%]'>
                                    <div className="relative z-20 h-10 bg-white dark:bg-form-input  w-full">
                                        <span className="absolute top-1/2 left-4 z-30 -translate-y-1/2">
                                            <svg
                                                width="20"
                                                height="20"
                                                viewBox="0 0 20 20"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >

                                            </svg>
                                        </span>

                                        <label className=' text-sm font-semibold'>
                                            Grade<span className='text-red-600'>*</span>
                                        </label>
                                        <select
                                            defaultValue={karyawan?.data?.biodata_karyawan[0]?.grade?.kategori}

                                            name='grade'
                                            onChange={(e) => setgradeEdit(e.target.value)}
                                            className={`relative z-20 w-full bg-[#64646424] appearance-none rounded-md h-7 py-1 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input  
                                    }`}
                                        >
                                            <option disabled className="text-[#646464] text-xs dark:text-bodydark">
                                                Pilib Grade
                                            </option>
                                            {gradeMaster?.data?.map((data: any, i: number) => {

                                                return (
                                                    <option
                                                        value={data.id}
                                                        className="text-gray-800 text-xs font-light dark:text-bodydark"
                                                    >
                                                        {data.kategori}
                                                    </option>
                                                )
                                            }
                                            )}

                                        </select>
                                        <span className="absolute top-10 right-4 z-10 -translate-y-1/2">
                                            <svg
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <g opacity="0.8">
                                                    <path
                                                        fillRule="evenodd"
                                                        clipRule="evenodd"
                                                        d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                                                        fill="#637381"
                                                    ></path>
                                                </g>
                                            </svg>
                                        </span>

                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    <div className=''>
                        <div className='flex w-full gap-3'>
                            <div className='flex flex-col gap-1 w-[50%]'>
                                <label className=' text-sm font-semibold'>
                                    Tanggal Masuk<span className='text-red-600'>*</span>
                                </label>
                                <input
                                    onChange={(e) => setglMasukEdit(e.target.value)}
                                    type="date"
                                    className='border-2 border-stroke rounded-md'
                                ></input>
                            </div>
                            <div className='flex flex-col gap-1 w-[50%]'>
                                <label className=' text-sm font-semibold'>
                                    Status Karyawan<span className='text-red-600'>*</span>
                                </label>
                                <div className="relative z-20 h-10 bg-white dark:bg-form-input  w-full">
                                    <span className="absolute top-1/2 left-4 z-30 -translate-y-1/2">
                                        <svg
                                            width="20"
                                            height="20"
                                            viewBox="0 0 20 20"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >

                                        </svg>
                                    </span>

                                    <select
                                        defaultValue={karyawan?.data?.biodata_karyawan[0]?.status_karyawan}
                                        onChange={(e) => setstatusKaryawanEdit(e.target.value)}
                                        className={`relative z-20 w-full bg-[#64646424] appearance-none rounded-md h-7 py-1 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input  
                                    }`}
                                    >
                                        <option value={''} disabled className="text-[#646464] text-xs dark:text-bodydark">
                                            Pilih
                                        </option>
                                        <option value={'Tetap'} className="text-[#646464] text-xs dark:text-bodydark">
                                            Tetap
                                        </option>

                                        <option value={'Probation'} className="text-[#646464] text-xs dark:text-bodydark">
                                            Probation
                                        </option>
                                    </select>

                                    <span className="absolute top-[15px] right-4 z-10 -translate-y-1/2">
                                        <svg
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <g opacity="0.8">
                                                <path
                                                    fillRule="evenodd"
                                                    clipRule="evenodd"
                                                    d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                                                    fill="#637381"
                                                ></path>
                                            </g>
                                        </svg>
                                    </span>

                                </div>
                            </div>
                        </div>
                        {(karyawan?.data?.biodata_karyawan[0]?.status_karyawan == 'tetap' || karyawan?.data?.biodata_karyawan[0]?.status_karyawan == null) ? (
                            <>
                            </>
                        ) :
                            (
                                <>
                                    <div className='flex w-full gap-3'>
                                        <div className='flex flex-col gap-1 w-[50%]'>
                                            <label className=' text-sm font-semibold'>
                                                Tanggal Mulai Kontrak
                                            </label>
                                            <input

                                                onChange={(e) => setKOntrakDari(e.target.value)}
                                                type="date"
                                                className='border-2 border-stroke rounded-md'
                                            ></input>
                                        </div>
                                        <div className='flex flex-col gap-1 w-[50%]'>
                                            <label className=' text-sm font-semibold'>
                                                Tanggal Akhir Kontrak
                                            </label>
                                            <input
                                                onChange={(e) => setKontrakSampai(e.target.value)}
                                                type="date"
                                                className='border-2 border-stroke rounded-md'
                                            ></input>
                                        </div>
                                    </div>
                                </>
                            )}

                        <div className='flex w-full gap-3'>
                            <div className='flex flex-col gap-1 w-[50%]'>
                                <label className=' text-sm font-semibold'>
                                    Tanggal Keluar
                                </label>
                                <input
                                    onChange={(e) => setglKeluarEdit(e.target.value)}
                                    type="date"
                                    className='border-2 border-stroke rounded-md'
                                ></input>
                            </div>
                            <div className='flex flex-col gap-1 w-[50%]'>
                                <label className=' text-sm font-semibold'>
                                    Status Pajak<span className='text-red-600'>*</span>
                                </label>
                                <div className="relative z-20 h-10 bg-white dark:bg-form-input  w-full">
                                    <span className="absolute top-1/2 left-4 z-30 -translate-y-1/2">
                                        <svg
                                            width="20"
                                            height="20"
                                            viewBox="0 0 20 20"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >

                                        </svg>
                                    </span>

                                    <select
                                        defaultValue={karyawan?.data?.biodata_karyawan[0]?.status_pajak}
                                        onChange={(e) => sestatusPajakEdit(e.target.value)}
                                        className={`relative z-20 w-full bg-[#64646424] appearance-none rounded-md h-7 py-1 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input  
                                    }`}
                                    >
                                        <option value={''} disabled className="text-[#646464] text-xs dark:text-bodydark">
                                            Pilih
                                        </option>
                                        <option value={'TK0'} className="text-[#646464] text-xs dark:text-bodydark">
                                            TK0
                                        </option>
                                        <option value={'TK1'} className="text-[#646464] text-xs dark:text-bodydark">
                                            TK1
                                        </option>
                                        <option value={'TK2'} className="text-[#646464] text-xs dark:text-bodydark">
                                            TK2
                                        </option>
                                        <option value={'TK3'} className="text-[#646464] text-xs dark:text-bodydark">
                                            TK3
                                        </option>
                                        <option value={'K0'} className="text-[#646464] text-xs dark:text-bodydark">
                                            K0
                                        </option>
                                        <option value={'K1'} className="text-[#646464] text-xs dark:text-bodydark">
                                            K1
                                        </option>
                                        <option value={'K2'} className="text-[#646464] text-xs dark:text-bodydark">
                                            K2
                                        </option>
                                        <option value={'K3'} className="text-[#646464] text-xs dark:text-bodydark">
                                            K3
                                        </option>
                                        <option value={'KI0'} className="text-[#646464] text-xs dark:text-bodydark">
                                            KI0
                                        </option>
                                        <option value={'KI1'} className="text-[#646464] text-xs dark:text-bodydark">
                                            KI1
                                        </option>
                                        <option value={'KI2'} className="text-[#646464] text-xs dark:text-bodydark">
                                            KI2
                                        </option>
                                        <option value={'KI3'} className="text-[#646464] text-xs dark:text-bodydark">
                                            KI3
                                        </option>

                                    </select>

                                    <span className="absolute top-[15px] right-4 z-10 -translate-y-1/2">
                                        <svg
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <g opacity="0.8">
                                                <path
                                                    fillRule="evenodd"
                                                    clipRule="evenodd"
                                                    d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                                                    fill="#637381"
                                                ></path>
                                            </g>
                                        </svg>
                                    </span>

                                </div>
                            </div>
                        </div>

                        <div className='flex flex-col gap-1 w-[50%]'>
                            <label className=' text-sm font-semibold'>
                                Tipe Penggajian<span className='text-red-600'>*</span>
                            </label>
                            <div className="relative z-20 h-10 bg-white dark:bg-form-input  w-full">
                                <span className="absolute top-1/2 left-4 z-30 -translate-y-1/2">
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 20 20"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >

                                    </svg>
                                </span>

                                <select
                                    defaultValue={karyawan?.data?.biodata_karyawan[0]?.tipe_penggajian}
                                    onChange={(e) => settipePenggajianEdit(e.target.value)}
                                    className={`relative z-20 w-full bg-[#64646424] appearance-none rounded-md h-7 py-1 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input  
                                    }`}
                                >
                                    <option value={''} disabled className="text-[#646464] text-xs dark:text-bodydark">
                                        Pilih
                                    </option>
                                    <option value={'mingguan'} className="text-[#646464] text-xs dark:text-bodydark">
                                        MINGGUAN
                                    </option>
                                    <option value={'bulanan'} className="text-[#646464] text-xs dark:text-bodydark">
                                        BULANAN
                                    </option>

                                </select>

                                <span className="absolute top-[15px] right-4 z-10 -translate-y-1/2">
                                    <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <g opacity="0.8">
                                            <path
                                                fillRule="evenodd"
                                                clipRule="evenodd"
                                                d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                                                fill="#637381"
                                            ></path>
                                        </g>
                                    </svg>
                                </span>

                            </div>
                            <div className='flex flex-col gap-1 w-full'>
                                <label className=' text-sm font-semibold'>
                                    Gaji<span className='text-red-600'>*</span>
                                </label>
                                <input
                                    defaultValue={karyawan?.data?.biodata_karyawan[0]?.gaji}
                                    onChange={(e) => setGaji(e.target.value)}
                                    type='text' className='border-stroke border-2 rounded-md w-full' />
                            </div>
                        </div>

                        <div className='flex flex-col  '>
                            <div className='flex gap-3'>
                                <div className='flex flex-col gap-1 w-[50%]'>
                                    <label className=' text-sm font-semibold'>
                                        Bagian<span className='text-red-600'>*</span>
                                    </label>
                                    <div className="relative z-20 h-10 bg-white dark:bg-form-input  w-full">
                                        <span className="absolute top-1/2 left-4 z-30 -translate-y-1/2">
                                            <svg
                                                width="20"
                                                height="20"
                                                viewBox="0 0 20 20"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >

                                            </svg>
                                        </span>

                                        <select
                                            defaultValue={karyawan?.data?.biodata_karyawan[0]?.bagian?.nama_bagian}
                                            onChange={(e) => setidDagianEdit(e.target.value)}
                                            className={`relative z-20 w-full bg-[#64646424] appearance-none rounded-md h-7 py-1 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input  
                                    }`}
                                        >
                                            <option value={''} disabled className="text-[#646464] text-xs dark:text-bodydark">
                                                Pilih
                                            </option>
                                            {bagian?.data?.map((data: any, i: number) => {

                                                return (
                                                    <option
                                                        value={data.id}
                                                        className="text-gray-800 text-xs font-light dark:text-bodydark"
                                                    >
                                                        {data.nama_bagian}
                                                    </option>
                                                )
                                            }
                                            )}



                                        </select>

                                        <span className="absolute top-[15px] right-4 z-10 -translate-y-1/2">
                                            <svg
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <g opacity="0.8">
                                                    <path
                                                        fillRule="evenodd"
                                                        clipRule="evenodd"
                                                        d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                                                        fill="#637381"
                                                    ></path>
                                                </g>
                                            </svg>
                                        </span>

                                    </div>
                                </div>
                                <div className='flex flex-col gap-1 w-[50%]'>
                                    <label className=' text-sm font-semibold'>
                                        Level
                                    </label>
                                    <input
                                        defaultValue={karyawan?.data?.biodata_karyawan[0]?.level}
                                        onChange={(e) => setlevelEdit(e.target.value)}
                                        type='text' className='border-stroke border-2 rounded-md w-[50%]' />
                                </div>
                            </div>
                            <div className='flex gap-3'>
                                <div className='flex flex-col gap-1 w-[50%]'>
                                    <label className=' text-sm font-semibold'>
                                        Jabatan<span className='text-red-600'>*</span>
                                    </label>
                                    <input
                                        defaultValue={karyawan?.data?.biodata_karyawan[0]?.jabatan}
                                        onChange={(e) => sejabatanEdit(e.target.value)}
                                        type='text' className='border-stroke border-2 rounded-md w-[50%]' />
                                </div>
                                <div className='flex flex-col gap-1 w-[50%]'>
                                    <label className=' text-sm font-semibold'>
                                        Sub-Level
                                    </label>
                                    <input
                                        defaultValue={karyawan?.data?.biodata_karyawan[0]?.sub_level}
                                        onChange={(e) => setsubLevelEdit(e.target.value)}
                                        type='text' className='border-stroke border-2 rounded-md w-[50%]' />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
                {/* <div className='flex w-full bg-[#eeeeee] px-6 py-3'>
                    <label className='text-[#0065de] text-sm font-semibold'>
                        DETAIL INFORMASI
                    </label>

                </div>
                <div className=' w-full bg-white px-6 py-4 grid grid-cols-2 gap-3'>
                    <div className='flex gap-4 '>
                        <div className='flex flex-col gap-2  w-full'>
                            <label className=' text-sm font-semibold'>
                                Tempat / Tanggal Lahir<span className='text-red-600'>*</span>
                            </label>
                            <div className='flex gap-3 '>
                                <input type='text' className='border-stroke border-2 rounded-md w-[65%]' /> /
                                <input
                                    type="date"
                                    className='border-2 border-stroke rounded-md w-[35%]'
                                ></input>
                            </div>
                            <label className=' text-sm font-semibold'>
                                Agama
                            </label>
                            <input type='text' className='border-stroke border-2 rounded-md w-full' />
                            <label className=' text-sm font-semibold'>
                                Kewarganegaraan<span className='text-red-600'>*</span>
                            </label>
                            <input type='text' className='border-stroke border-2 rounded-md w-full' />
                            <label className=' text-sm font-semibold'>
                                Golongan Darah<span className='text-red-600'>*</span>
                            </label>
                            <input type='text' className='border-stroke border-2 rounded-md w-full' />
                            <label className=' text-sm font-semibold'>
                                Alamat<span className='text-red-600'>*</span>
                            </label>
                            <textarea

                                name=""
                                rows={3}
                                cols={6}
                                id=""
                                className="w-full p-2 bg-white border border-zinc-400 rounded-sm  resize-none"
                            ></textarea>
                            <label className=' text-sm font-semibold'>
                                Telepon
                            </label>
                            <input type='text' className='border-stroke border-2 rounded-md w-full' />
                            <label className=' text-sm font-semibold'>
                                Handphone
                            </label>
                            <input type='text' className='border-stroke border-2 rounded-md w-full' />
                            <label className=' text-sm font-semibold'>
                                Email
                            </label>
                            <input type='text' className='border-stroke border-2 rounded-md w-full' />
                        </div>
                    </div>

                    <div className='flex gap-4'>
                        <div className='flex flex-col gap-2 w-full pt-9'>
                            <label className='text-[#0065de] text-sm font-semibold'>
                                NPWP
                            </label>
                            <label className=' text-sm font-semibold'>
                                Nomor<span className='text-red-600'>*</span>
                            </label>
                            <input type='text' className='border-stroke border-2 rounded-md w-full' />

                            <label className=' text-sm font-semibold'>
                                Nama<span className='text-red-600'>*</span>
                            </label>
                            <input type='text' className='border-stroke border-2 rounded-md w-full' />

                            <label className=' text-sm font-semibold'>
                                Alamat<span className='text-red-600'>*</span>
                            </label>
                            <textarea

                                name=""
                                rows={3}
                                cols={6}
                                id=""
                                className="w-full p-2 bg-white border border-zinc-400 rounded-sm  resize-none"
                            ></textarea>

                            <label className=' text-sm font-semibold'>
                                Tanggal Pendaftaran<span className='text-red-600'>*</span>
                            </label>
                            <input type='date' className='border-stroke border-2 rounded-md w-[50%]' />

                            <div className='flex  w-full gap-4'>
                                <div className='flex flex-col w-[50%]'>
                                    <label className=' text-sm font-semibold'>
                                        No. KTP<span className='text-red-600'>*</span>
                                    </label>
                                    <input type='text' className='border-stroke border-2 rounded-md w-full' />
                                </div>
                                <div className='flex flex-col w-[50%]'>
                                    <label className=' text-sm font-semibold'>
                                        Berlaku s/d<span className='text-red-600'>*</span>
                                    </label>
                                    <input type='date' className='border-stroke border-2 rounded-md w-full' />
                                </div>
                            </div>
                            <label className=' text-sm font-semibold'>
                                No. BPJS<span className='text-red-600'>*</span>
                            </label>

                            <input type='text' className='border-stroke border-2 rounded-md w-full' />
                            <label className=' text-sm font-semibold'>
                                SIM 1
                            </label>
                            <div className='flex w-full gap-3'>
                                <div className='flex flex-col w-[20%]'>

                                    <div className="relative z-20 h-10 bg-white dark:bg-form-input  w-full">
                                        <span className="absolute top-1/2 left-4 z-30 -translate-y-1/2">
                                            <svg
                                                width="20"
                                                height="20"
                                                viewBox="0 0 20 20"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >

                                            </svg>
                                        </span>

                                        <select

                                            className={`relative z-20 w-full bg-[#64646424] appearance-none rounded-md h-7 py-1 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input  
                                    }`}
                                        >
                                            <option selected disabled className="text-[#646464] text-xs dark:text-bodydark">
                                                A
                                            </option>



                                        </select>

                                        <span className="absolute top-[15px] right-4 z-10 -translate-y-1/2">
                                            <svg
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <g opacity="0.8">
                                                    <path
                                                        fillRule="evenodd"
                                                        clipRule="evenodd"
                                                        d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                                                        fill="#637381"
                                                    ></path>
                                                </g>
                                            </svg>
                                        </span>

                                    </div>
                                </div>
                                <div className='w-full'>
                                    <input type='text' className='border-stroke border-2 rounded-md w-full' />
                                </div>

                            </div>
                            <label className=' text-sm font-semibold'>
                                SIM 2
                            </label>
                            <div className='flex w-full gap-3'>
                                <div className='flex flex-col w-[20%]'>

                                    <div className="relative z-20 h-10 bg-white dark:bg-form-input  w-full">
                                        <span className="absolute top-1/2 left-4 z-30 -translate-y-1/2">
                                            <svg
                                                width="20"
                                                height="20"
                                                viewBox="0 0 20 20"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >

                                            </svg>
                                        </span>

                                        <select

                                            className={`relative z-20 w-full bg-[#64646424] appearance-none rounded-md h-7 py-1 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input  
                                    }`}
                                        >
                                            <option selected disabled className="text-[#646464] text-xs dark:text-bodydark">
                                                B
                                            </option>



                                        </select>

                                        <span className="absolute top-[15px] right-4 z-10 -translate-y-1/2">
                                            <svg
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <g opacity="0.8">
                                                    <path
                                                        fillRule="evenodd"
                                                        clipRule="evenodd"
                                                        d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                                                        fill="#637381"
                                                    ></path>
                                                </g>
                                            </svg>
                                        </span>

                                    </div>
                                </div>
                                <div className='w-full'>
                                    <input type='text' className='border-stroke border-2 rounded-md w-full' />
                                </div>

                            </div>
                        </div>

                    </div>

                </div> */}
                <div className='flex w-full justify-end items-end px-8 py-5'>
                    <button
                        onClick={() => tambahKaryawan()}
                        className='bg-blue-500 text-white text-md px-4 py-1 rounded-md font-semibold'>
                        SIMPAN
                    </button>
                </div>
            </div>
        </main >
    )
}

export default EditMasterKaryawanIsi
