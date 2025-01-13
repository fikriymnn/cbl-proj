import React, { useEffect, useState } from 'react'
import axios from 'axios';
import Loading from '../../../Loading';
import Select from 'react-select';
function AddMasterKaryawanIsi() {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        getDepartment();
        getBagian();
        getDivisi();
        getGradeMaster();
        getkaryawanStatus(); getjabatanMaster()
        getMasterMesin();
    }, []);

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

    async function getMasterMesin() {
        const url = `${import.meta.env.VITE_API_LINK_P1
            }/api/list-mesin`;
        try {
            const res = await axios.get(url, {

            });
            setMesinMaster(res.data.data)
            console.log('mesin list', res.data.data)
            setOptions(
                res.data.data.map((item: any) => ({
                    value: item.mesin,
                    label: item.mesin
                }))
            );


        } catch (error: any) {

            console.log(error);
        }
    }
    const [jabatanMaster, setjabatanMaster] = useState<any>();

    async function getjabatanMaster() {
        const url = `${import.meta.env.VITE_API_LINK
            }/master/hr/jabatan`;
        try {
            setIsLoading(true)
            const res = await axios.get(
                url,

                {
                    withCredentials: true,
                },
            );
            setIsLoading(false)
            setjabatanMaster(res.data)
            console.log('jabatan Master', res.data)
        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }
    const [karyawanStatus, setkaryawanStatus] = useState<any>();

    async function getkaryawanStatus() {
        const url = `${import.meta.env.VITE_API_LINK
            }/master/statusKaryawan`;
        try {
            setIsLoading(true)
            const res = await axios.get(
                url,

                {
                    withCredentials: true,
                },
            );
            setIsLoading(false)
            setkaryawanStatus(res.data)
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

    const [bagianMesin, setBagianMesin] = useState([
        {
            id_bagian_mesin: null,
            nama_bagian_mesin: ""
        },
    ]);

    const [mesinMaster, setMesinMaster] = useState<any[]>([]);
    const [options, setOptions] = useState<any[]>([]);
    const handleAddPoint = () => {
        setBagianMesin([
            ...bagianMesin,
            {
                id_bagian_mesin: null,
                nama_bagian_mesin: ""
            },
        ]);
    };
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

    const [namaKaryawan, setnamaKaryawan] = useState<any>();
    const [nik, setnik] = useState<any>();
    const [jenisKelamin, setjenisKelamin] = useState<any>();
    const [idDivisi, seidDivisi] = useState<any>();
    const [idDepartment, setidDepartment] = useState<any>();
    const [idStatusKaryawan, setIdStatusKaryawan] = useState<any>();
    const [idDagian, setidDagian] = useState<any>();
    const [grade, setgrade] = useState<any>();
    const [tglMasuk, setglMasuk] = useState<any>(null);
    const [tglKeluar, setglKeluar] = useState<any>(null);
    const [tipePenggajian, settipePenggajian] = useState<any>();
    const [jabatan, sejabatan] = useState<any>();
    const [statusPajak, sestatusPajak] = useState<any>();
    const [level, setlevel] = useState<any>();
    const [subLevel, setsubLevel] = useState<any>();
    const [gaji, setGaji] = useState<any>(0);
    const [tipeKaryawan, seTipeKaryawan] = useState<any>();

    async function tambahKaryawan() {
        const url = `${import.meta.env.VITE_API_LINK
            }/hr/karyawan`;
        try {
            setIsLoading(true)
            const res = await axios.post(
                url,
                {
                    id_status_karyawan: idStatusKaryawan,
                    nama_karyawan: namaKaryawan,
                    tipe_karyawan: tipeKaryawan,
                    nik: nik,
                    jenis_kelamin: jenisKelamin,
                    id_divisi: idDivisi,
                    id_department: idDepartment,
                    bagian_mesin: bagianMesin,
                    id_grade: grade,
                    tgl_masuk: tglMasuk,
                    tgl_keluar: tglKeluar,
                    tipe_penggajian: tipePenggajian,
                    id_jabatan: jabatan,
                    status_pajak: statusPajak,
                    level: level,
                    sub_level: subLevel,
                    gaji: gaji,
                    kontrak_dari: null,
                    kontrak_sampai: null

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
    const recalculateWaktuKeluar = (masukDate: any, waktuBulan: any) => {
        if (!masukDate || !waktuBulan) return null; // If no input date or waktuBulan, return empty
        const date = new Date(masukDate);
        date.setMonth(date.getMonth() + waktuBulan); // Add months
        return date.toISOString().split("T")[0]; // Format to YYYY-MM-DD
    };

    const handleStatusChange = (e: any) => {
        const selectedId = e.target.value;
        setIdStatusKaryawan(selectedId);

        const selectedStatus = karyawanStatus.data.find((data: any) => data.id === parseInt(selectedId));
        if (selectedStatus) {
            // Use current or default tglMasuk if not set
            const defaultTglMasuk = tglMasuk || new Date().toISOString().split("T")[0];
            const recalculatedKeluar = recalculateWaktuKeluar(defaultTglMasuk, selectedStatus.waktu_bulan);
            setglKeluar(recalculatedKeluar);
        }
    };
    const handleTglMasukChange = (e: any) => {
        const inputDate = e.target.value;
        setglMasuk(inputDate);

        const selectedStatus = karyawanStatus.data.find((data: any) => data.id === parseInt(idStatusKaryawan));
        if (selectedStatus) {
            const recalculatedKeluar = recalculateWaktuKeluar(inputDate, selectedStatus.waktu_bulan);
            setglKeluar(recalculatedKeluar);
        }
    };
    const handleChangePointDepartment = (selected: any, index: number) => {
        const updatedBagianMesin = [...bagianMesin];
        const { value } = selected;

        updatedBagianMesin[index] = {
            id_bagian_mesin: null,
            nama_bagian_mesin: value
        };

        setBagianMesin(updatedBagianMesin);
        console.log("Updated Bagian Mesin:", updatedBagianMesin);
    };
    return (
        <main className="overflow-x-scroll">
            {isLoading && <Loading />}
            <div className="min-w-[700px]  bg-white rounded-t-md border-b-8 border-[#D8EAFF] h-12">

            </div>
            <div className="min-w-[700px] h-screen bg-white  border-b-8 border-[#D8EAFF] ">
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
                                    onChange={(e) => setnik(e.target.value)}
                                    type='text' className='border-stroke border-2 rounded-md w-[40%]' />
                                <div className='flex gap-1'>
                                    <input
                                        onChange={(e) => setjenisKelamin(e.target.value)}
                                        type='radio' name='kelamin' id='kelamin1' value={'Laki-Laki'} />Laki-Laki
                                </div>

                                <div className='flex gap-1'>
                                    <input
                                        onChange={(e) => setjenisKelamin(e.target.value)}
                                        type='radio' name='kelamin' id='kelamin2' value={'Perempuan'} />Perempuan
                                </div>

                            </div>
                            <div className='flex flex-col gap-1'>
                                <label className=' text-sm font-semibold'>
                                    Nama Karyawan<span className='text-red-600'>*</span>
                                </label>
                                <input
                                    onChange={(e) => setnamaKaryawan(e.target.value)}
                                    type='text' className='border-stroke border-2 rounded-md w-[40%]' />
                            </div>
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
                                        name='nama_divisi'
                                        onChange={(e) => seidDivisi(e.target.value)}
                                        className={`relative z-20 w-full bg-[#64646424] appearance-none rounded-md h-7 py-1 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input  
                                    }`}
                                    >
                                        <option selected disabled className="text-[#646464] text-xs dark:text-bodydark">
                                            PILIH DIVISI
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
                                            name='nama_department'
                                            onChange={(e) => setidDepartment(e.target.value)}
                                            className={`relative z-20 w-full bg-[#64646424] appearance-none rounded-md h-7 py-1 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input  
                                    }`}
                                        >
                                            <option selected disabled className="text-[#646464] text-xs dark:text-bodydark">
                                                PILIH DEPARTMENT
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
                                            Grade<span className='text-red-600'>*</span>{grade}
                                        </label>
                                        <select
                                            name='grade'
                                            onChange={(e) => setgrade(e.target.value)}
                                            className={`relative z-20 w-full bg-[#64646424] appearance-none rounded-md h-7 py-1 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input  
                                    }`}
                                        >
                                            <option selected disabled className="text-[#646464] text-xs dark:text-bodydark">
                                                PILIH GRADE
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
                                    onChange={handleTglMasukChange}
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
                                        name='nama_department'
                                        onChange={
                                            handleStatusChange
                                        }
                                        className={`relative z-20 w-full bg-[#64646424] appearance-none rounded-md h-7 py-1 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input  
                                    }`}
                                    >
                                        <option selected disabled className="text-[#646464] text-xs dark:text-bodydark">
                                            PILIH STATUS KARYAWAN
                                        </option>
                                        {karyawanStatus?.data?.map((data: any, i: number) => {

                                            return (
                                                <option
                                                    value={data.id}
                                                    className="text-gray-800 text-xs font-light dark:text-bodydark"
                                                >
                                                    {data.nama_status} - {data.waktu_bulan} Bulan
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
                        </div>

                        <div className='flex w-full gap-3'>
                            <div className="flex flex-col gap-1 w-[50%]">
                                <label className="text-sm font-semibold">Tanggal Keluar:</label>
                                <p>{tglKeluar}</p>
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
                                        onChange={(e) => sestatusPajak(e.target.value)}
                                        className={`relative z-20 w-full bg-[#64646424] appearance-none rounded-md h-7 py-1 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input  
                                    }`}
                                    >
                                        <option selected disabled className="text-[#646464] text-xs dark:text-bodydark">
                                            Status Pajak
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

                        <div className='grid grid-cols-2 gap-1 w-full'>
                            <div className='flex flex-col gap-1'>
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
                                        onChange={(e) => settipePenggajian(e.target.value)}
                                        className={`relative z-20 w-full bg-[#64646424] appearance-none rounded-md h-7 py-1 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input  
                                    }`}
                                    >
                                        <option selected disabled className="text-[#646464] text-xs dark:text-bodydark">
                                            Tipe Penggajian
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
                            </div>

                            <div className='flex flex-col gap-1 w-full'>
                                <label className=' text-sm font-semibold'>
                                    Gaji<span className='text-red-600'>*</span>
                                </label>
                                <input
                                    onChange={(e) => setGaji(e.target.value)}
                                    type='text' className='border-stroke border-2 rounded-md w-full' />
                            </div>
                        </div>

                        <div className='flex flex-col  '>
                            <div className='flex gap-3'>
                                <div className='flex flex-col gap-1 w-[50%]'>
                                    <div className='z-50'>
                                        {bagianMesin?.map((item, index) => (
                                            <div key={index} style={{ marginBottom: "10px" }}>
                                                <Select
                                                    options={options}
                                                    onChange={(selected) => handleChangePointDepartment(selected, index)}
                                                    value={
                                                        item.nama_bagian_mesin
                                                            ? options.find(
                                                                (option) =>
                                                                    option.value === item.nama_bagian_mesin
                                                            )
                                                            : null
                                                    }
                                                    placeholder="Select Mesin"
                                                />
                                            </div>
                                        ))}

                                        <button onClick={handleAddPoint}>+ Tambah Bagian</button>
                                    </div>
                                </div>
                                <div className='flex flex-col gap-1 w-[50%]'>
                                    <label className=' text-sm font-semibold'>
                                        Level
                                    </label>
                                    <input
                                        onChange={(e) => setlevel(e.target.value)}
                                        type='text' className='border-stroke border-2 rounded-md w-[50%]' />
                                </div>
                            </div>
                            <div className='flex gap-3'>
                                <div className='flex flex-col gap-1 w-[50%]'>
                                    <label className=' text-sm font-semibold'>
                                        Jabatan<span className='text-red-600'>*</span>
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
                                            onChange={(e) => sejabatan(e.target.value)}
                                            className={`relative z-20 w-full bg-[#64646424] appearance-none rounded-md h-7 py-1 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input  
                                    }`}
                                        >
                                            <option selected disabled className="text-[#646464] text-xs dark:text-bodydark">
                                                PILIH JABATAN
                                            </option>
                                            {jabatanMaster?.data?.map((data: any, i: number) => {

                                                return (
                                                    <option
                                                        value={data.id}

                                                        className="text-gray-800 text-xs font-light dark:text-bodydark"
                                                    >
                                                        {data.nama_jabatan}
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
                                        Sub-Level
                                    </label>
                                    <input
                                        onChange={(e) => setsubLevel(e.target.value)}
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
                        onClick={() => {
                            tambahKaryawan()
                            console.log(tglKeluar)
                        }}
                        className='bg-blue-500 text-white text-md px-4 py-1 rounded-md font-semibold'>
                        SIMPAN
                    </button>
                </div>
            </div>
        </main>
    )
}

export default AddMasterKaryawanIsi
