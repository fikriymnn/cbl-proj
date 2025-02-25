import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loading from '../../../../Loading';
import ModalKosongan from '../../../../Modals/Qc/NCR/NCRResponQC';
import TabPengajuanLangsung from './TabPengajuanLangsung';
import Polygon6 from '../../../../../images/icon/Polygon6.svg';
import convertTimeStampToDate from '../../../../../utils/convertDate';

function TableAbsensi() {
    const [isLoading, setIsLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const kosong: any = [];

    const [absen, setabsen] = useState<any>();
    const [idPengaju, setIdPengaju] = useState<any>();
    const [tipeIzin, settipeIzin] = useState<any>();
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(today.getDate()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;

    useEffect(() => {
        getMe()
        getabsen(formattedDate, formattedDate);
        getDepartment()
    }, []);

    async function getMe() {
        const url = `${import.meta.env.VITE_API_LINK}/me`;
        try {
            const res = await axios.get(url, {
                withCredentials: true,
            });
            setIdPengaju(res.data.id_karyawan)
        } catch (error: any) {
            console.log(error.data.msg);
        }
    }


    const [department, setDepartment] = useState<any>();
    const [idDepartment, setidDepartment] = useState<any>();
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
    const [dateFrom, setDateFrom] = useState<any>(null);
    const [dateTo, setDateTo] = useState<any>(null);

    async function getabsen(dateFrom1: any, dateTo1: any) {
        const url = `${import.meta.env.VITE_API_LINK}/hr/absensi`;
        try {
            setIsLoading(true)
            const res = await axios.get(url, {
                params: {
                    // is_active: true,
                    startDate: dateFrom1,
                    endDate: dateTo1,
                    idDepartment: idDepartment
                },
                withCredentials: true,
            });
            setIsLoading(false)
            setabsen(res.data.data);
            console.log(res.data);
        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }

    async function postTerlambat(tglAbsen: any, id_KKaryawan: any, nama: any, index: any) {
        if (window.confirm(`Apakah Anda yakin akan mengajukan Izin untuk karyawan ${nama}`)) {
            const url = `${import.meta.env.VITE_API_LINK}/hr/pengajuanTerlambat`;
            try {
                setIsLoading(true)
                const res = await axios.post(url,
                    {
                        id_karyawan: id_KKaryawan,
                        id_pengaju: idPengaju,
                        type_izin: tipeIzin,
                        tanggal: tglAbsen
                    },
                    {

                        withCredentials: true,
                    });

                setIsLoading(false)
                alert("Berhasil Diaujukan")
                closeAksi2(index)
                getabsen(formattedDate, formattedDate)
            } catch (error: any) {
                setIsLoading(false)
                console.log(error);
            }
        }
    }

    async function postLemburKurang(catatan: any, type: any, lama: any, i: any, id: any) {
        if (window.confirm(`Apakah Anda yakin akan mengajukan Lembur ${type} untuk karyawan `)) {
            const url = `${import.meta.env.VITE_API_LINK}/hr/pengajuanLembur/tidakSesuai/${id}`;
            try {
                setIsLoading(true)
                const res = await axios.post(url,
                    {
                        catatan_ketidaksesuaian: catatan,
                        type_ketidaksesuaian: type,
                        lama_lembur_absen: lama,
                        id_pengaju_ketidaksesuaian: idPengaju,
                        alasan_ketidaksesuaian: '',
                        penanganan: ''
                    },
                    {

                        withCredentials: true,
                    });

                setIsLoading(false)
                alert("Berhasil Diaujukan")
                closeSPL(i)
                getabsen(formattedDate, formattedDate)
            } catch (error: any) {
                setIsLoading(false)
                console.log(error);
            }
        }
    }
    const [showEdit, setShowEdit] = useState<any>([]);
    const openEdit = (i: any) => {
        const onchangeVal: any = [...showEdit];
        onchangeVal[i] = true;

        setShowEdit(onchangeVal);
    };
    const closeEdit = (i: any) => {
        const onchangeVal: any = [...showEdit];
        onchangeVal[i] = false;

        setShowEdit(onchangeVal);
    };

    const [showAksi2, setShowAksi2] = useState<any>([]);
    const openAksi2 = (i: any) => {
        const onchangeVal: any = [...showAksi2];
        onchangeVal[i] = true;

        setShowAksi2(onchangeVal);
    };
    const closeAksi2 = (i: any) => {
        const onchangeVal: any = [...showAksi2];
        onchangeVal[i] = false;

        setShowAksi2(onchangeVal);
    };
    const [showSPL, setShowSPL] = useState<any>([]);
    const openSPL = (i: any) => {
        const onchangeVal: any = [...showSPL];
        onchangeVal[i] = true;

        setShowSPL(onchangeVal);
    };
    const closeSPL = (i: any) => {
        const onchangeVal: any = [...showSPL];
        onchangeVal[i] = false;

        setShowSPL(onchangeVal);
    };
    const [sortOrder, setSortOrder] = useState('asc'); // State to track sort order

    const handleSort = () => {
        const sortedAbsen = [...absen].sort((a, b) => {
            const waktuAMinus = new Date(a.waktu_masuk);
            const waktuBMinus = new Date(b.waktu_masuk);

            if (sortOrder === 'asc') {
                // Sort in ascending order
                if (waktuAMinus < waktuBMinus) return -1;
                if (waktuAMinus > waktuBMinus) return 1;
            } else {
                // Sort in descending order
                if (waktuAMinus > waktuBMinus) return -1;
                if (waktuAMinus < waktuBMinus) return 1;
            }
            return 0;
        });

        setabsen(sortedAbsen);
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); // Toggle sort order
    };
    const [searchQuery, setSearchQuery] = useState('');

    const [selectedTipeKaryawan, setSelectedTipeKaryawan] = useState('');
    const [selectedTipePenggajian, setSelectedTipePenggajian] = useState('');

    const filteredAbsen = absen?.filter((data: any) => {
        return (
            data.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            (selectedTipeKaryawan === '' || data.tipe_karyawan === selectedTipeKaryawan) &&
            (selectedTipePenggajian === '' || data.tipe_penggajian === selectedTipePenggajian)
        );
    });

    return (
        <>
            {!isMobile && (
                <main className="overflow-x-scroll">
                    {isLoading && <Loading />}
                    <div className="bg-white rounded-md shadow-md md:w-12/12 mb-5 border-2 border-stroke">
                        <div className="grid md:gap-4 gap-1 md:flex-row grid-cols-12 items-center px-4 py-4 md:mt-0 ">
                            <div className='flex flex-col gap-1 col-span-3'>
                                <div className='flex flex-col'>
                                    <p className="my-auto text-sm text-primary font-semibold ">
                                        Pilih Tanggal
                                    </p>

                                </div>

                                <div className='flex gap-3 flex-col'>
                                    <div className="flex md:justify-center items-center gap-2">
                                        <p className="text-sm text-primary font-semibold md:w-3/12 w-2/12">
                                            Dari:
                                        </p>

                                        <input
                                            className='rounded-full bg-[#D8EAFF] px-2'
                                            type="date"
                                            onChange={(e) => {
                                                setDateFrom(e.target.value)
                                                console.log(e.target.value)
                                            }}
                                        ></input>

                                    </div>
                                    <div className="flex md:justify-center items-center gap-2">
                                        <p className=" my-auto text-sm text-primary font-semibold md:w-3/12 w-2/12">
                                            Sampai:
                                        </p>

                                        <input
                                            className='rounded-full bg-[#D8EAFF] px-2'
                                            type="date"
                                            onChange={(e) => setDateTo(e.target.value)}
                                        ></input>

                                    </div>
                                </div>

                            </div>

                            <div className='flex flex-col gap-1 col-span-2'>
                                <label className='text-sm text-primary font-semibold'>
                                    Department
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
                                        className={`relative z-20  bg-[#D8EAFF]  appearance-none rounded-md h-7 py-1 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input  
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
                            <div className="flex justify-center my-5 col-span-2">
                                {(dateFrom == null || dateTo == null) ?
                                    <>
                                        <button

                                            className="bg-red-600 text-white px-5 py-2 rounded-md my-auto "
                                        >
                                            Pilih Tanggal
                                        </button>
                                    </> :
                                    <>
                                        <button
                                            onClick={() => {
                                                getabsen(dateFrom, dateTo)
                                            }}
                                            className="bg-primary text-white px-5 py-2 rounded-md my-auto "
                                        >
                                            Tampilkan
                                        </button>
                                    </>
                                }
                            </div>
                            <div className="flex my-5 col-span-3">
                                <button
                                    onClick={() => {

                                        getabsen(formattedDate, formattedDate)

                                    }}
                                    className="bg-primary text-white px-5 py-2 rounded-md my-auto "
                                >
                                    Hari Ini
                                </button>
                            </div>
                            <div className="flex justify-end my-5 col-span-2 items-end">

                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Cari Nama Karyawan"
                                    className="border p-2 rounded mb-4"
                                />
                            </div>
                            <div className="flex gap-4 ">
                                {/* Dropdown untuk Tipe Karyawan */}
                                <select
                                    className="border  rounded-md py-2"
                                    value={selectedTipeKaryawan}
                                    onChange={(e) => setSelectedTipeKaryawan(e.target.value)}
                                >
                                    <option value="">Pilih Tipe Karyawan</option>
                                    <option value="staff">Staff</option>
                                    <option value="produksi">Produksi</option>
                                </select>

                                {/* Dropdown untuk Tipe Penggajian */}
                                <select
                                    className="border  rounded-md"
                                    value={selectedTipePenggajian}
                                    onChange={(e) => setSelectedTipePenggajian(e.target.value)}
                                >
                                    <option value="">Pilih Tipe Penggajian</option>
                                    <option value="mingguan">Mingguan</option>
                                    <option value="bulanan">Bulanan</option>
                                </select>

                                {/* Tombol Reset */}
                                <button
                                    className="bg-red-500 text-white px-10 rounded-md hover:bg-red-700"
                                    onClick={() => {
                                        setSearchQuery('');
                                        setSelectedTipeKaryawan('');
                                        setSelectedTipePenggajian('');
                                    }}
                                >
                                    RESET
                                </button>
                            </div>

                        </div>
                    </div>
                    <div className="min-w-[700px] bg-white rounded-xl">

                        <div className=" w-full h-full flex-col border-b-8 border-[#D8EAFF]">
                            <div className="grid grid-cols-12 px-10 py-4 border-b-8 border-[#D8EAFF] gap-2 ">
                                <div className='flex col-span-2 gap-2'>
                                    <label className="text-neutral-500 text-sm font-semibold ">
                                        No.
                                    </label>
                                    <label className="text-neutral-500 text-sm font-semibold ">
                                        Nama
                                    </label>
                                </div>
                                <label className="text-neutral-500 text-sm font-semibold ">
                                    Department
                                </label>
                                <label className="text-neutral-500 text-sm font-semibold col-span-2 flex pl-3">
                                    Tanggal
                                </label>
                                <div className="flex gap-2  col-span-2">
                                    <p className="text-xs font-bold ">Waktu </p>
                                    <img className="w-2 hover:cursor-pointer" onClick={handleSort} src={Polygon6} alt="" />
                                </div>
                                <label className="text-neutral-500 text-sm font-semibold flex gap-1">
                                    Shift
                                </label>
                                <label className="text-neutral-500 text-sm font-semibold">
                                    Lembur (Jam)
                                </label>
                                <label className="text-neutral-500 text-sm font-semibold ">
                                    Terlambat (Menit)
                                </label>
                                <label className="text-neutral-500 text-sm font-semibold ">
                                    Status Absen
                                </label>
                            </div>
                            <div className="w-2 h-full "></div>
                            {filteredAbsen?.map((data: any, i: any) => {
                                // Calculate lama_lembur_absen and prevent negative values

                                let tipe_lembur = null;
                                let catatan_ketidaksesuaian = null;
                                if ((data.jam_lembur ?? 0) < (data.jam_lembur_spl ?? 0)) {
                                    tipe_lembur = 'kurang';
                                    catatan_ketidaksesuaian = 'Jam Lembur Kurang Dari SPL '
                                } else if ((data.jam_lembur ?? 0) > (data.jam_lembur_spl ?? 0)) {
                                    tipe_lembur = 'lebih';
                                    catatan_ketidaksesuaian = 'Jam Lembur Lebih Dari SPL '
                                }
                                return (
                                    <>
                                        <div className={`grid grid-cols-12 border-b-8 border-[#D8EAFF] gap-2 items-center px-10 min-h-10  
                                            ${data.status_absen == 'cuti khusus' ? 'bg-orange-200' : ''} 
                                               ${data.status_absen == 'sakit' ? 'bg-green-200' : ''}
                                               ${data.status_absen == 'izin' ? 'bg-blue-200' : ''}
                                               ${data.status_absen == 'Belum Masuk' ? 'bg-red-300' : ''}
                                                  ${data.status_absen == 'cuti tahunan' ? 'bg-yellow-200' : ''}
                                            `}>
                                            <div className='flex gap-1 col-span-2 '>
                                                <label className="text-neutral-500 text-sm font-semibold ">
                                                    {i + 1}.
                                                </label>
                                                <label className="text-neutral-500 text-sm font-semibold ">
                                                    {data.name}
                                                </label>
                                            </div>
                                            <label className="text-neutral-500 text-sm font-semibold">
                                                {data.nama_department}
                                            </label>
                                            <label className="text-neutral-500 text-sm font-semibold col-span-2 flex justify-center">
                                                {data.hari}, {data.tgl_masuk}{(data.jenis_hari_masuk == 'Biasa' || data.jenis_hari_masuk == null) ? '' : '- L'}
                                            </label>
                                            <div className='col-span-2 flex flex-col gap-1 py-2'>
                                                <label className="text-neutral-500 text-sm font-semibold  ">
                                                    Masuk :  {(data.jam_masuk == null || data.jam_masuk == 0) ? ' ~' : data.jam_masuk}
                                                </label>
                                                <label className="text-neutral-500 text-sm font-semibold  ">
                                                    Keluar : {(data.jam_keluar == null || data.jam_keluar == 0) ? ' ~' : data.jam_keluar}
                                                </label>
                                            </div>

                                            <label className="text-neutral-500 text-sm font-semibold ">
                                                {(data.shift == null || data.shift == 0) ? ' ~' : data.shift}
                                            </label>
                                            <div className='flex flex-col gap-1'>
                                                <label
                                                    className={`uppercase text-sm font-semibold 
                                                            ${data.status_ketidaksesuaian == 'history' ? 'text-green-500' :
                                                            data.status_ketidaksesuaian == 'rejected' ? 'text-red-500' :
                                                                'text-black'}`}
                                                >
                                                    {(data.status_ketidaksesuaian == null || data.status_ketidaksesuaian == 0) ? '' : data.status_ketidaksesuaian}
                                                </label>
                                                <label className="text-neutral-500 text-sm font-semibold ">
                                                    {(data.status_lembur == null || data.status_lembur == 0) ? ' ~' : data.status_lembur} {(data.status_lembur == 'Belum Pulang' || data.status_lembur == 'Tidak Lembur') ? '' : data.status_lembur_spl} {(data.jam_lembur == null || data.jam_lembur == 0) ? '' : '~ ' + data.jam_lembur + 'Jam'}
                                                </label>
                                            </div>
                                            <div className='flex flex-col gap-1'>
                                                <label className="text-neutral-500 text-sm font-semibold ">
                                                    {data.status_masuk}
                                                </label>
                                                <label className="text-neutral-500 text-sm font-semibold ">
                                                    {(data.menit_terlambat == null || data.menit_terlambat == 0) ? '~' : '~ ' + data.menit_terlambat + ' Jam'}
                                                </label>
                                            </div>
                                            <label className="text-neutral-500 text-sm font-semibold ">
                                                {data.status_absen}
                                            </label>
                                            <div className='flex flex-col gap-1'>
                                                {(data.status_lembur_spl == 'dengan SPL' && data.status_ketidaksesuaian == 'none' && tipe_lembur != null) ?
                                                    <>
                                                        <button
                                                            onClick={() => openSPL(i)}
                                                            className="w-full bg-yellow-600 text-white text-sm py-1 rounded-md"
                                                        >
                                                            SPL
                                                        </button>
                                                        {showSPL[i] == true && (

                                                            <ModalKosongan
                                                                isOpen={showSPL[i]}
                                                                onClose={() => closeSPL(i)}
                                                                judul={'Lapor Ketidaksesuaian SPL'}
                                                            >
                                                                <>
                                                                    <div className=" bg-white">
                                                                        <div className='grid grid-cols-2 gap-5  px-7 py-4 '>
                                                                            <div className='flex flex-col gap-1'>
                                                                                <label className=' text-[#6c6b6b] text-sm font-semibold'>
                                                                                    Nama
                                                                                </label>
                                                                                <label className=' text-[#6c6b6b] text-sm'>
                                                                                    {data.name}
                                                                                </label>
                                                                            </div>

                                                                            <div className='flex flex-col gap-1'>
                                                                                <label className=' text-[#6c6b6b] text-sm font-semibold'>
                                                                                    Tipe Ketidaksesuaian
                                                                                </label>
                                                                                <label className=' text-[#6c6b6b] text-sm uppercase'>
                                                                                    {tipe_lembur}
                                                                                </label>
                                                                            </div>
                                                                            <div className='flex flex-col gap-1'>
                                                                                <label className=' text-[#6c6b6b] text-sm font-semibold'>
                                                                                    Selisih Jam
                                                                                </label>
                                                                                <div className='flex gap-1 justify-between w-[50%]'>
                                                                                    <div className='flex flex-col'>
                                                                                        <label className=' text-[#6c6b6b] text-sm'>
                                                                                            Jam Lembur SPL
                                                                                        </label>
                                                                                        <label className=' text-[#6c6b6b] text-sm'>
                                                                                            Jam Lembur
                                                                                        </label>
                                                                                    </div>
                                                                                    <div className='flex flex-col'>
                                                                                        <label className=' text-[#6c6b6b] text-sm'>
                                                                                            : {data.jam_lembur_spl} Jam
                                                                                        </label>
                                                                                        <label className=' text-[#6c6b6b] text-sm'>
                                                                                            : {data.jam_lembur} Jam
                                                                                        </label>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className='flex flex-col gap-1'>
                                                                                <label className=' text-[#6c6b6b] text-sm font-semibold'>
                                                                                    Alasan Lembur
                                                                                </label>
                                                                                <label className=' text-[#6c6b6b] text-sm'>
                                                                                    {catatan_ketidaksesuaian}
                                                                                </label>
                                                                            </div>
                                                                        </div>

                                                                        <div className='grid grid-cols-2 gap-5 px-7 py-4'>
                                                                            <div className='flex flex-col gap-3'>
                                                                                <label className=' text-[#6c6b6b] text-sm font-semibold'>
                                                                                    Tanggal
                                                                                </label>
                                                                                <label className=' text-[#6c6b6b] text-sm '>
                                                                                    {convertTimeStampToDate(data.tgl_masuk)}
                                                                                </label>
                                                                            </div>
                                                                        </div>

                                                                        <div className='flex w-full justify-end items-end px-7 py-4'>

                                                                            <button
                                                                                onClick={() => {
                                                                                    console.log(catatan_ketidaksesuaian, tipe_lembur, data.jam_lembur, i, data.id_pengajuan_lembur)
                                                                                    postLemburKurang(catatan_ketidaksesuaian, tipe_lembur, data.jam_lembur, i, data.id_pengajuan_lembur)
                                                                                }
                                                                                }
                                                                                disabled={isLoading}
                                                                                className='flex px-4 py-1 justify-center items-center bg-blue-600 text-white font-semibold rounded-md'
                                                                            >
                                                                                AJUKAN
                                                                            </button>

                                                                        </div>
                                                                    </div>
                                                                </>
                                                            </ModalKosongan>
                                                        )}
                                                    </>
                                                    : <></>}
                                                {data.status_masuk == 'Terlambat ' ?
                                                    <>
                                                        <button
                                                            onClick={() => openAksi2(i)}
                                                            className="w-full bg-green-600 text-white text-sm py-1 rounded-md"
                                                        >
                                                            Izin
                                                        </button>
                                                        {showAksi2[i] == true && (

                                                            <ModalKosongan
                                                                isOpen={showAksi2[i]}
                                                                onClose={() => closeAksi2(i)}
                                                                judul={'Lapor Izin'}
                                                            >
                                                                <>
                                                                    <div className=" bg-white">
                                                                        <div className='grid grid-cols-2 gap-5  px-7 py-4 '>
                                                                            <div className='flex flex-col gap-1'>
                                                                                <label className=' text-[#6c6b6b] text-sm font-semibold'>
                                                                                    Nama
                                                                                </label>
                                                                                <label className=' text-[#6c6b6b] text-sm'>
                                                                                    {data.name}
                                                                                </label>
                                                                            </div>
                                                                            <div className='flex flex-col gap-1'>
                                                                                <label className=' text-[#6c6b6b] text-sm font-semibold'>
                                                                                    Tipe Izin
                                                                                </label>
                                                                                <select
                                                                                    onChange={(e) => settipeIzin(e.target.value)}
                                                                                    className=' text-[#6c6b6b] h-8 text-sm border-2 border-stroke rounded-md'>
                                                                                    <option selected disabled>Pilih Tipe Izin</option>
                                                                                    <option value={'dinas'} >Dinas</option>
                                                                                    <option value={'pribadi'} >Pribadi</option>
                                                                                </select>
                                                                            </div>
                                                                        </div>
                                                                        <div className='grid grid-cols-2 gap-5 px-7 py-4'>
                                                                            <div className='flex flex-col gap-3'>
                                                                                <label className=' text-[#6c6b6b] text-sm font-semibold'>
                                                                                    Tanggal
                                                                                </label>
                                                                                <label className=' text-[#6c6b6b] text-sm '>
                                                                                    {convertTimeStampToDate(data.tgl_masuk)}
                                                                                </label>
                                                                            </div>
                                                                        </div>

                                                                        <div className='flex w-full justify-end items-end px-7 py-4'>
                                                                            {tipeIzin == null ? <>
                                                                            </> :
                                                                                <>

                                                                                    <button
                                                                                        onClick={() => {
                                                                                            console.log(data.tgl_absen, data.userid, data.name, i, tipeIzin)
                                                                                            postTerlambat(data.tgl_absen, data.userid, data.name, i)
                                                                                        }
                                                                                        }
                                                                                        disabled={isLoading}
                                                                                        className='flex px-4 py-1 justify-center items-center bg-blue-600 text-white font-semibold rounded-md'
                                                                                    >
                                                                                        AJUKAN
                                                                                    </button>
                                                                                </>
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            </ModalKosongan>
                                                        )}
                                                    </>
                                                    : <>
                                                    </>}
                                                {data.status_absen == 'Belum Masuk' ?
                                                    <>
                                                        <button
                                                            onClick={() => openEdit(i)}
                                                            className="w-full bg-blue-600 text-white text-sm py-1 rounded-md"
                                                        >
                                                            Aksi
                                                        </button>
                                                        {showEdit[i] == true && (

                                                            <ModalKosongan
                                                                isOpen={showEdit[i]}
                                                                onClose={() => closeEdit(i)}
                                                                judul={'Lapor'}
                                                            >
                                                                <>
                                                                    <TabPengajuanLangsung data={data} />
                                                                </>
                                                            </ModalKosongan>
                                                        )}
                                                    </> :
                                                    <>

                                                    </>}
                                            </div>
                                        </div>
                                    </>
                                )
                            })}
                        </div>
                    </div>
                </main>
            )}
        </>
    );
}

export default TableAbsensi;
