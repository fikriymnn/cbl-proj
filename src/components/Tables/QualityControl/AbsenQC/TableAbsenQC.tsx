import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@mui/material';
import Loading from '../../../Loading';
import ModalKosongan from '../../../Modals/Qc/NCR/NCRResponQC';
import TabPengajuanLangsung from '../../HR/Personnel/Absensi/TabPengajuanLangsung';
import Polygon6 from '../../../../images/icon/Polygon6.svg';

function TableAbsensiQC() {
    const [isLoading, setIsLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const today = new Date();

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
        getabsen(formattedDate, formattedDate, idDepart);
    }, []);

    async function getMe() {
        const url = `${import.meta.env.VITE_API_LINK}/me`;
        try {
            setIsLoading(true)
            const res = await axios.get(url, {
                withCredentials: true,
            });

            setIsLoading(false)
            setIdDepart(res.data.karyawan.biodata_karyawan[0].id_department)
            getabsen(today, today, res.data.karyawan.biodata_karyawan[0].id_department);
            console.log('me', res.data.karyawan.biodata_karyawan[0].id_department)
        } catch (error: any) {
            setIsLoading(false)
            console.log(error.data.msg);
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
                                <label className="text-neutral-500 text-sm font-semibold col-span-2">
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
                                            <label className="text-neutral-500 text-sm font-semibold col-span-2">
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
                                                    {(data.menit_terlambat == null || data.menit_terlambat == 0) ? '~' : '~ ' + data.menit_terlambat + ' Menit'}
                                                </label>
                                            </div>
                                            <label className="text-neutral-500 text-sm font-semibold ">
                                                {data.status_absen}
                                            </label>
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
