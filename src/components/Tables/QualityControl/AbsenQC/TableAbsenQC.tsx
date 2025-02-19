import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@mui/material';
import Loading from '../../../Loading';
import ModalKosongan from '../../../Modals/Qc/NCR/NCRResponQC';
import TabPengajuanLangsung from '../../HR/Personnel/Absensi/TabPengajuanLangsung';
import Polygon6 from '../../../../images/icon/Polygon6.svg';
import convertTimeStampToDate from '../../../../utils/convertDate';

function TableAbsensiQC() {
    const [isLoading, setIsLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const today = new Date();
    const [idPengaju, setIdPengaju] = useState<any>();
    const [tipeIzin, settipeIzin] = useState<any>();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(today.getDate()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;


    const [absen, setabsen] = useState<any>();
    const [idDepart, setIdDepart] = useState<any>(0);
    useEffect(() => {
        const today = new Date();
        getDepartment()
        getMe()
    }, []);

    async function getMe() {
        const url = `${import.meta.env.VITE_API_LINK}/me`;
        try {
            setIsLoading(true)
            const res = await axios.get(url, {
                withCredentials: true,
            });

            setIsLoading(false)
            getabsen(formattedDate, formattedDate, res.data.karyawan.biodata_karyawan[0].id_department)
            setIdDepart(res.data.karyawan.biodata_karyawan[0].id_department)
            setIdPengaju(res.data.id_karyawan)

            console.log('me', res.data)
        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }

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
            console.log(res.data)
        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }
    const [dateFrom, setDateFrom] = useState<any>();
    const [dateTo, setDateTo] = useState<any>();

    async function getabsen(dateFrom1: any, dateTo1: any, idDep: any) {
        const url = `${import.meta.env.VITE_API_LINK}/hr/absensi`;
        try {
            setIsLoading(true)
            const res = await axios.get(url, {
                params: {
                    is_active: true,
                    startDate: dateFrom1,
                    endDate: dateTo1,
                    idDepartment: idDep
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
    const filteredAbsen = absen?.filter((data: any) =>
        data.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
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
                getMe()
            } catch (error: any) {
                setIsLoading(false)
                console.log(error);
            }
        }
    }
    const [catatanHr, setcatatanHr] = useState<any>();
    async function postLemburKurang(catatan: any, type: any, lama: any, i: any, id: any, p: any) {
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
                        alasan_ketidaksesuaian: catatanHr,
                        penanganan: p
                    },
                    {

                        withCredentials: true,
                    });

                setIsLoading(false)
                alert("Berhasil Diaujukan")
                closeSPL(i)
                getMe()
            } catch (error: any) {
                setIsLoading(false)
                console.log(error);
            }
        }
    }
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
                                                getabsen(dateFrom, dateTo, idDepart)
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

                                        getabsen(formattedDate, formattedDate, idDepart)

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
                                <label className="text-neutral-500 text-sm font-semibold">
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
                                                {data.tgl_masuk}
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
                                            <label className="text-neutral-500 text-sm font-semibold ">
                                                {(data.status_lembur == null || data.status_lembur == 0) ? ' ~' : data.status_lembur} {(data.jam_lembur == null || data.jam_lembur == 0) ? '' : '~ ' + data.jam_lembur + 'Jam'}
                                            </label>
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
                                                                        <div className='flex flex-col w-full px-4 '>
                                                                            <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                ALASAN KETIDAKSESUAIAN <span className='text-red-600'>*</span>
                                                                            </label>
                                                                            <textarea
                                                                                onChange={(e) => setcatatanHr(e.target.value)}
                                                                                className="peer h-full min-h-[100px] w-full resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                                                                            ></textarea>
                                                                        </div>
                                                                        <div className='flex gap-2 w-full px-4 pt-1'>
                                                                            <button
                                                                                disabled={isLoading}
                                                                                onClick={() => postLemburKurang(catatan_ketidaksesuaian, tipe_lembur, data.jam_lembur, i, data.id_pengajuan_lembur, 0)}
                                                                                className='bg-green-500 w-[50%] rounded-md px-3 py-3 text-white font-semibold text-sm'>
                                                                                SESUAI SPL
                                                                            </button>
                                                                            {isLoading && <Loading />}
                                                                            <button
                                                                                disabled={isLoading}
                                                                                onClick={() => postLemburKurang(catatan_ketidaksesuaian, tipe_lembur, data.jam_lembur, i, data.id_pengajuan_lembur, 1)}
                                                                                className='bg-red-500 w-[50%] rounded-md px-3 py-3 text-white font-semibold text-sm'>
                                                                                SESUAI ABSEN
                                                                            </button>
                                                                            {isLoading && <Loading />}

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

export default TableAbsensiQC;
