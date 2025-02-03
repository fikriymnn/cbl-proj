import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Loading from '../../../../Loading';
import ModalKosongan from '../../../../Modals/Qc/NCR/NCRResponQC';

function RekapAbsenHR() {
    const [isLoading, setIsLoading] = useState(false);
    const [absen, setabsen] = useState<any>();

    const [searchQuery, setSearchQuery] = useState('');

    const filteredAbsen = absen?.filter((data: any) =>
        data.nama_karyawan.toLowerCase().includes(searchQuery.toLowerCase())
    );
    useEffect(() => {

        getDepartment()

    }, []);

    const [dateFrom, setDateFrom] = useState<any>(null);
    const [dateTo, setDateTo] = useState<any>(null);
    const [idDepartment, setidDepartment] = useState<any>();
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
    async function getabsen(dateFrom1: any, dateTo1: any) {
        const url = `${import.meta.env.VITE_API_LINK}/hr/absensiRekap`;
        try {
            setIsLoading(true)
            const res = await axios.get(url, {
                params: {

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
    const [showModal, setShowModal] = useState<boolean[]>([]);
    const openModalModal = (i: any) => {
        const onchangeVal: any = [...showModal];
        onchangeVal[i] = true;

        setShowModal(onchangeVal);
    };
    const closeModalModal = (i: any) => {
        const onchangeVal: any = [...showModal];
        onchangeVal[i] = false;

        setShowModal(onchangeVal);
    };
    return (
        <>
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
                        <div className='flex flex-col gap-1 col-span-4'>
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



                            </div>
                        </div>
                        <div className="flex  my-5 col-span-2">
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

                        <div className="flex flex-col col-span-2 justify-end">
                            <p className=" my-auto text-sm text-primary font-semibold   ">
                                Cari Karyawan:
                            </p>
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
                                <label className="text-neutral-500 text-sm font-semibold">
                                    NIK
                                </label>
                            </div>
                            <label className="text-neutral-500 text-sm font-semibold col-span-4">
                                Nama
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                Department
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                Divisi
                            </label>
                        </div>
                        <div className="w-2 h-full "></div>
                        {filteredAbsen?.map((data: any, i: any) => {

                            return (
                                <>
                                    <div className="grid grid-cols-12 px-10 py-4 border-b-8 border-[#D8EAFF] gap-2 ">
                                        <div className='flex col-span-2 gap-2'>
                                            <label className="text-neutral-500 text-sm  ">
                                                {i + 1}.
                                            </label>
                                            <label className="text-neutral-500 text-sm  ">
                                                {data.nik}
                                            </label>
                                        </div>
                                        <label className="text-neutral-500 text-sm  col-span-4">
                                            {data.nama_karyawan}
                                        </label>
                                        <label className="text-neutral-500 text-sm  col-span-2">
                                            {data.department}
                                        </label>
                                        <label className="text-neutral-500 text-sm  col-span-3">
                                            {data.divisi}
                                        </label>
                                        <button
                                            onClick={() => openModalModal(i)}
                                            className="w-full bg-blue-600 text-white text-sm py-1 rounded-md"
                                        >
                                            Detail
                                        </button>
                                        {showModal[i] == true && (
                                            <>
                                                <ModalKosongan
                                                    isOpen={showModal[i]}
                                                    onClose={() => closeModalModal(i)}
                                                    judul={'Detail Rekap Absensi'}>
                                                    <>
                                                        <div className='grid gap-2 px-4 py-4'>
                                                            <div className='flex flex-col '>
                                                                <label htmlFor="" className='text-black text-xs font-bold'>
                                                                    DETAIL ABSENSI
                                                                </label>
                                                                <div className='grid grid-cols-3'>
                                                                    <div className='flex flex-col'>
                                                                        <label className="text-neutral-500 text-sm  ">
                                                                            Nama
                                                                        </label>
                                                                        <label className="text-neutral-500 text-sm  col-span-2">
                                                                            Department
                                                                        </label>
                                                                        <label className="text-neutral-500 text-sm  col-span-5">
                                                                            Divisi
                                                                        </label>
                                                                    </div>
                                                                    <div className='flex flex-col'>
                                                                        <label className="text-neutral-500 text-sm  ">
                                                                            : {data.nama_karyawan} - {data.nik}
                                                                        </label>
                                                                        <label className="text-neutral-500 text-sm  col-span-2">
                                                                            : {data.department}
                                                                        </label>
                                                                        <label className="text-neutral-500 text-sm  col-span-5">
                                                                            : {data.divisi}
                                                                        </label>
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-10  py-4 border-b-8 border-[#D8EAFF] gap-2 ">
                                                                    <div className='flex col-span-2 gap-2'>
                                                                        <label className="text-neutral-500 text-sm font-semibold ">
                                                                            No.
                                                                        </label>
                                                                        <label className="text-neutral-500 text-sm font-semibold ">
                                                                            Nama
                                                                        </label>
                                                                    </div>

                                                                    <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                                                        Tanggal
                                                                    </label>
                                                                    <div className="flex gap-2  col-span-2">
                                                                        <p className="text-neutral-500 text-sm font-semibold ">Waktu </p>

                                                                    </div>
                                                                    <label className="text-neutral-500 text-sm font-semibold flex gap-1">
                                                                        Shift
                                                                    </label>
                                                                    <label className="text-neutral-500 text-sm font-semibold">
                                                                        Lembur
                                                                    </label>
                                                                    <label className="text-neutral-500 text-sm font-semibold ">
                                                                        Terlambat
                                                                    </label>
                                                                    <label className="text-neutral-500 text-sm font-semibold ">
                                                                        Status
                                                                    </label>
                                                                </div>
                                                                <div className="w-2 h-full "></div>
                                                                {data.absensi?.map((data2: any, ii: any) => (
                                                                    <>

                                                                        <div className="grid grid-cols-10  py-4 border-b-8 border-[#D8EAFF] gap-2 ">
                                                                            <div className='flex col-span-2 gap-2'>
                                                                                <label className="text-neutral-500 text-sm font-semibold ">
                                                                                    {ii + 1}.
                                                                                </label>
                                                                                <label className="text-neutral-500 text-sm font-semibold ">
                                                                                    {data2.name}
                                                                                </label>
                                                                            </div>

                                                                            <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                                                                {data2.tgl_masuk}
                                                                            </label>
                                                                            <div className="flex gap-2 flex-col col-span-2">
                                                                                <label className="text-neutral-500 text-sm font-semibold  ">
                                                                                    Masuk :  {(data2.jam_masuk == null || data2.jam_masuk == 0) ? ' ~' : data2.jam_masuk}
                                                                                </label>
                                                                                <label className="text-neutral-500 text-sm font-semibold  ">
                                                                                    Keluar : {(data2.jam_keluar == null || data2.jam_keluar == 0) ? ' ~' : data2.jam_keluar}
                                                                                </label>

                                                                            </div>
                                                                            <label className="text-neutral-500 text-sm font-semibold flex gap-1">
                                                                                {(data.shift == null || data.shift == 0) ? ' ~' : data.shift}
                                                                            </label>
                                                                            <label className="text-neutral-500 text-sm font-semibold">
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
                                                                                {data2.status_absen}
                                                                            </label>
                                                                        </div>
                                                                    </>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </>
                                                </ModalKosongan>
                                            </>
                                        )}
                                    </div>
                                </>
                            )
                        }
                        )
                        }
                    </div>
                </div>
            </main >
        </>
    );
}

export default RekapAbsenHR;
