import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import convertTimeStampToDateOnly from '../../../../../../utils/convertDate';
import dateOnly from '../../../../../../utils/convertDateOnly';
import Loading from '../../../../../Loading';
import ModalXL from '../../../../PPIC/JadwalProduksi/ModalXL';

function IncomingPromosi() {
    const [isLoading, setIsLoading] = useState(false);
    const [izin, setIzin] = useState<any>();
    const [tglMasuk, setglMasuk] = useState<any>(null);
    const [tglKeluar, setglKeluar] = useState<any>(null);
    const [idStatusKaryawan, setIdStatusKaryawan] = useState<any>();

    useEffect(() => {
        getIzin();
    }, []);

    async function getIzin() {
        const url = `${import.meta.env.VITE_API_LINK}/hr/pengajuanPromosi`;
        try {
            setIsLoading(true);
            const res = await axios.get(url, {
                params: {
                    status_tiket: 'incoming',
                },
                withCredentials: true,
            });
            setIsLoading(false);
            setIzin(res.data);
            console.log(res.data)

        } catch (error: any) {
            setIsLoading(false);
            console.error("Error fetching izin data:", error);
        } finally {
            setIsLoading(false);
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
    const [catatanHr, setcatatanHr] = useState<any>();

    async function approveIzin(id: any, index: any) {
        if (catatanHr == null) {
            alert('Catatan Wajib Diisi');
            return;
        }
        const url = `${import.meta.env.VITE_API_LINK}/hr/pengajuanPromosi/approve/${id}`;
        try {
            setIsLoading(true)
            const res = await axios.put(url,
                {
                    catatan_hr: catatanHr
                },
                {

                    withCredentials: true,
                });
            setIsLoading(false)
            getIzin();
            console.log(res.data);
            const updatedModalStates = [...showModal];
            updatedModalStates[index] = false;
            setShowModal(updatedModalStates);
        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }

    async function rejectIzin(id: any, index: number) {
        if (catatanHr == null) {
            alert('Catatan Wajib Diisi');
            return;
        }
        if (window.confirm('Apakah Anda yakin ingin menolak pengajuan Promosi ini?')) {
            const url = `${import.meta.env.VITE_API_LINK}/hr/pengajuanPromosi/reject/${id}`;
            try {
                setIsLoading(true)
                const res = await axios.put(url,
                    {
                        catatan_hr: catatanHr
                    },
                    {

                        withCredentials: true,
                    });
                setIsLoading(false)
                getIzin();
                console.log(res.data);
                const updatedModalStates = [...showModal];
                updatedModalStates[index] = false;
                setShowModal(updatedModalStates);
            } catch (error: any) {
                setIsLoading(false)
                console.log(error);
            }
        }
    }

    return (
        <>

            <main className="overflow-x-scroll">
                {isLoading && <Loading />}
                <div className="min-w-[700px] bg-white rounded-xl">
                    <div className="w-full h-full flex-col border-b-8 border-[#D8EAFF]">
                        {/* Header Table */}
                        <div className="grid grid-cols-12 px-3 py-4 border-b-8 border-[#D8EAFF] gap-2">
                            <label className="text-neutral-500 text-sm font-semibold col-span-2">No</label>

                            <label className="text-neutral-500 text-sm font-semibold col-span-2">Nama</label>
                            <label className="text-neutral-500 text-sm font-semibold col-span-3">Department</label>
                            <label className="text-neutral-500 text-sm font-semibold col-span-3">Divisi</label>


                            <label className="text-neutral-500 text-sm font-semibold ">Tipe</label>
                        </div>

                        {/* Table Content */}
                        {izin?.data?.map((data: any, i: number) => (
                            <div key={i} className="grid grid-cols-12 border-b-8 border-[#D8EAFF] gap-2 items-center px-3">
                                {/* No */}
                                <div className='flex gap-1 col-span-2'>
                                    <label className="text-neutral-500 text-sm font-semibold">{i + 1}. </label>

                                    {/* NIK */}
                                    <label className="text-neutral-500 text-sm font-semibold">{data.karyawan?.biodata_karyawan[0]?.nik}</label>
                                </div>
                                {/* Nama */}
                                <label className="text-neutral-500 text-sm font-semibold col-span-2">{data.karyawan?.name}</label>

                                {/* Department (Awal & Tujuan) */}
                                <label className="text-neutral-500 text-sm font-semibold col-span-3">
                                    Dept Awal: {data.department_awal} <br />
                                    Dept Tujuan: {data.department_promosi?.nama_department}
                                </label>

                                {/* Divisi (Awal & Tujuan) */}
                                <label className="text-neutral-500 text-sm font-semibold col-span-3">
                                    Divisi Awal: {data.divisi_awal} <br />
                                    Divisi Tujuan: {data.divisi_promosi?.nama_divisi}
                                </label>
                                <label className={`text-sm font-semibold col-span-1 uppercase ${data.type === 'promosi'
                                    ? 'text-green-500'
                                    : data.type === 'demosi'
                                        ? 'text-red-500'
                                        : data.type === 'mutasi'
                                            ? 'text-yellow-500'
                                            : 'text-neutral-500'
                                    }`}>
                                    {data.type}
                                </label>

                                {/* Action Button */}
                                <div className="justify-end flex pr-2 ">
                                    <button
                                        onClick={() => openModalModal(i)}
                                        className="uppercase px-3 inline-flex rounded-[3px] items-center text-white text-xs font-bold py-2 my-2 hover:bg-blue-400 border bg-blue-600 border-blue-600 justify-center"
                                    >
                                        ACTION
                                    </button>

                                    {/* Modal for Details */}
                                    {showModal[i] && (
                                        <ModalXL isOpen={showModal[i]} onClose={() => closeModalModal(i)} judul={`Permohonan ${data.type}`}>
                                            <>
                                                {/* Detail Information */}
                                                <div className='grid grid-cols-2 gap-2 px-4 py-4'>

                                                    <label className={`text-xl font-semibold col-span-1 uppercase 0 ${data.type === 'promosi'
                                                        ? 'text-green-500'
                                                        : data.type === 'demosi'
                                                            ? 'text-red-500'
                                                            : data.type === 'mutasi'
                                                                ? 'text-yellow-500'
                                                                : 'text-neutral-500'
                                                        }`}>
                                                        {data.type}
                                                    </label>
                                                </div>
                                                <div className='grid grid-cols-2 gap-2 px-4 py-4'>
                                                    {/* Left Column */}
                                                    <div className='flex flex-col gap-2'>
                                                        {/* Tanggal */}
                                                        <div className='flex flex-col'>
                                                            <label className='text-black text-xs font-bold'>TANGGAL</label>
                                                            <label className='text-[#7a7a7a] text-xl font-normal'>
                                                                {dateOnly(data.createdAt)}
                                                            </label>
                                                        </div>

                                                        {/* Supervisor */}
                                                        <div className='flex flex-col'>
                                                            <label className='text-black text-xs font-bold'>SUPERVISOR</label>
                                                            <label className='text-[#7a7a7a] text-xl font-normal'>
                                                                {data.karyawan_pengaju?.name}
                                                            </label>
                                                        </div>

                                                        {/* Masa Kerja */}
                                                        <div className='flex flex-col'>
                                                            <label className='text-black text-xs font-bold'>MASA KERJA</label>
                                                            <label className='text-[#7a7a7a] text-xl font-normal'>
                                                                {data.masa_kerja}
                                                            </label>
                                                        </div>

                                                        {/* Gaji Awal */}
                                                        <div className='flex flex-col'>
                                                            <label className='text-black text-xs font-bold'>GAJI AWAL</label>
                                                            <label className='text-[#7a7a7a] text-xl font-normal'>
                                                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(data.gaji_awal)}
                                                            </label>
                                                        </div>

                                                        {/* Gaji Promosi */}
                                                        <div className='flex flex-col'>
                                                            <label className='text-black text-xs font-bold'>GAJI PROMOSI</label>
                                                            <label className='text-[#7a7a7a] text-xl font-normal'>
                                                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(data.gaji_promosi)}
                                                            </label>
                                                        </div>
                                                    </div>

                                                    {/* Right Column */}
                                                    <div className='flex flex-col gap-2'>
                                                        <div className='flex flex-col'>
                                                            <label className='text-black text-xs font-bold'>MASA PROBATION</label>
                                                            <label className='text-[#7a7a7a] text-xl font-normal'>
                                                                Dari: {convertTimeStampToDateOnly(data.tanggal_from)} <br />
                                                                Sampai: {convertTimeStampToDateOnly(data.tanggal_to)}
                                                            </label>
                                                        </div>
                                                        {/* Department */}
                                                        <div className='flex flex-col'>
                                                            <label className='text-black text-xs font-bold'>DEPARTEMEN</label>
                                                            <label className='text-[#7a7a7a] text-xl font-normal'>
                                                                Awal: {data.department_awal} <br />
                                                                Tujuan: {data.department_promosi?.nama_department}
                                                            </label>
                                                        </div>

                                                        {/* Divisi */}
                                                        <div className='flex flex-col'>
                                                            <label className='text-black text-xs font-bold'>DIVISI</label>
                                                            <label className='text-[#7a7a7a] text-xl font-normal'>
                                                                Awal: {data.divisi_awal} <br />
                                                                Tujuan: {data.divisi_promosi?.nama_divisi}
                                                            </label>
                                                        </div>

                                                        {/* Jabatan */}
                                                        <div className='flex flex-col'>
                                                            <label className='text-black text-xs font-bold'>JABATAN</label>
                                                            <label className='text-[#7a7a7a] text-xl font-normal'>
                                                                Awal: {data.jabatan_awal} <br />
                                                                Tujuan: {data.jabatan_promosi?.nama_jabatan}
                                                            </label>
                                                        </div>

                                                        {/* Grade */}
                                                        <div className='flex flex-col'>
                                                            <label className='text-black text-xs font-bold'>GRADE</label>
                                                            <label className='text-[#7a7a7a] text-xl font-normal'>
                                                                Awal: {data.grade_awal} <br />
                                                                Tujuan: {data.grade_promosi?.kategori}
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className='flex flex-col w-full px-4'>
                                                    <label className='text-black text-xs font-bold'>
                                                        ALASAN<span className='text-red-600'>*</span>
                                                    </label>
                                                    <textarea
                                                        readOnly
                                                        value={data.alasan_promosi}
                                                        className="peer h-full min-h-[100px] w-full resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                                                    ></textarea>
                                                </div>
                                                {/* HR Response */}
                                                <div className='flex flex-col w-full px-4'>
                                                    <label className='text-black text-xs font-bold'>
                                                        RESPON HR<span className='text-red-600'>*</span>
                                                    </label>
                                                    <textarea
                                                        onChange={(e) => setcatatanHr(e.target.value)}
                                                        className="peer h-full min-h-[100px] w-full resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                                                    ></textarea>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className='flex gap-2 w-full px-4 pt-4'>
                                                    <button
                                                        disabled={isLoading}
                                                        onClick={() => approveIzin(data.id, i)}
                                                        className='bg-green-500 w-[50%]  rounded-md px-3 py-3 text-white font-semibold text-sm'
                                                    >
                                                        APPROVE
                                                    </button>
                                                    <button
                                                        disabled={isLoading}
                                                        onClick={() => rejectIzin(data.id, i)}
                                                        className='bg-red-500 w-[50%]  rounded-md px-3 py-3 text-white font-semibold text-sm'
                                                    >
                                                        REJECT
                                                    </button>
                                                </div>
                                            </>
                                        </ModalXL>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </main>

        </>
    );
}

export default IncomingPromosi;
