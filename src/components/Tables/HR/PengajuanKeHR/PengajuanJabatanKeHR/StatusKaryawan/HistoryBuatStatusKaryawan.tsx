import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import convertTimeStampToDate from '../../../../../../utils/converDateTime';
import dateOnly from '../../../../../../utils/convertDateOnly';
import Loading from '../../../../../Loading';
import ModalXL from '../../../../PPIC/JadwalProduksi/ModalXL';

function HistoryBuatStatusKaryawan() {
    const [isLoading, setIsLoading] = useState(false);
    const [izin, setIzin] = useState<any>();
    const [tglMasuk, setglMasuk] = useState<any>(null);
    const [tglKeluar, setglKeluar] = useState<any>(null);
    const [idStatusKaryawan, setIdStatusKaryawan] = useState<any>();

    useEffect(() => {
        getIzin();

    }, []);

    async function getIzin() {
        const url = `${import.meta.env.VITE_API_LINK}/hr/pengajuanPromosiStatusKaryawan`;
        try {
            setIsLoading(true);
            const res = await axios.get(url, {
                params: {
                    status_tiket: 'history',
                },
                withCredentials: true,
            });
            setIsLoading(false);
            setIzin(res.data);
            console.log(res.data)
            // Update state for tglMasuk


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


    return (
        <>

            <main className="overflow-x-scroll">
                {isLoading && <Loading />}
                <div className="min-w-[700px] bg-white rounded-xl">
                    <div className=" w-full h-full flex-col border-b-8 border-[#D8EAFF]">
                        <div className="grid grid-cols-12 px-10 py-4 border-b-8 border-[#D8EAFF] gap-2 ">
                            <label className="text-neutral-500 text-sm font-semibold ">
                                No
                            </label>

                            <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                Department
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold col-span-3">
                                Personnel
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                Status
                            </label>
                        </div>
                        <div className="w-2 h-full "></div>
                        {izin?.data?.map((data: any, i: any) => {
                            const tanggal = dateOnly(data.createdAt);
                            // const endDate = new Date(data.sampai);
                            // const Onedaylater = new Date();
                            // Onedaylater.setDate(endDate.getDate() + 1);
                            // const formattedDate = Onedaylater.toLocaleDateString();
                            return (
                                <>
                                    <div className="grid grid-cols-12 border-b-8 border-[#D8EAFF] gap-2 items-center px-10">

                                        <label className="text-neutral-500 text-sm font-semibold ">
                                            {i + 1}
                                        </label>

                                        <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                            {data.karyawan_pengaju?.biodata_karyawan[0]?.department?.nama_department}
                                        </label>
                                        <label className="text-neutral-500 text-sm font-semibold col-span-3">
                                            {data.karyawan?.name} - {data.karyawan_pengaju?.biodata_karyawan[0]?.nik}
                                        </label>
                                        <label className="text-neutral-500 text-sm font-semibold col-span-3">
                                            {data.status}
                                        </label>
                                        <div className="justify-end flex pr-2 col-span-3">
                                            <>

                                                <button
                                                    onClick={() => openModalModal(i)}
                                                    className={`uppercase px-3 inline-flex rounded-[3px] items-center text-white text-xs font-bold  py-2 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600  justify-center`} // Dynamic class assignment
                                                >
                                                    DETAIL
                                                </button>
                                                {showModal[i] == true && (
                                                    <>
                                                        <ModalXL
                                                            isOpen={showModal[i]}
                                                            onClose={() => closeModalModal(i)}
                                                            judul={'Permohonan Promosi Status Karyawan'}>
                                                            <>
                                                                <div className='grid grid-cols-2 gap-2 px-4 py-4'>
                                                                    <div className='flex flex-col gap-2 '>
                                                                        <div className='flex flex-col '>
                                                                            <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                TANGGAL
                                                                            </label>
                                                                            <label htmlFor="" className='text-[#7a7a7a] text-xl font-normal'>
                                                                                {dateOnly(data.createdAt)}
                                                                            </label>
                                                                        </div>
                                                                        <div className='flex flex-col '>
                                                                            <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                SUPERVISOR
                                                                            </label>
                                                                            <label htmlFor="" className='text-[#7a7a7a] text-xl font-normal'>
                                                                                {data.karyawan_pengaju?.name}
                                                                            </label>
                                                                        </div>
                                                                    </div>
                                                                    <div className='flex flex-col gap-2 '>
                                                                        <div className='flex flex-col '>
                                                                            <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                Yang Menyetujui
                                                                            </label>
                                                                            <label htmlFor="" className='text-[#7a7a7a] text-xl font-normal'>
                                                                                {data.karyawan_hr?.name}
                                                                            </label>
                                                                        </div>
                                                                        <div className='flex flex-col '>
                                                                            <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                SUPERVISOR
                                                                            </label>
                                                                            <label htmlFor="" className='text-[#7a7a7a] text-xl font-normal'>
                                                                                {data.karyawan_pengaju?.name}
                                                                            </label>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="min-w-[700px] bg-white rounded-xl ">

                                                                    <div className='grid grid-cols-1 gap-1 px-4 py-4'>
                                                                        <div className='flex gap-1'>
                                                                            <p className='text-black font-bold'>
                                                                                Nama
                                                                            </p>
                                                                            <p className='text-black text-medium'>
                                                                                : {data.karyawan?.name} - {data.karyawan?.biodata_karyawan[0]?.nik}
                                                                            </p>
                                                                        </div>
                                                                        <div className='flex gap-1'>
                                                                            <p className='text-black font-bold'>
                                                                                Department
                                                                            </p>
                                                                            <p className='text-black text-medium'>
                                                                                : {data.department}
                                                                            </p>
                                                                        </div>
                                                                        <div className='flex gap-1'>
                                                                            <p className='text-black font-bold'>
                                                                                Divisi
                                                                            </p>
                                                                            <p className='text-black text-medium'>
                                                                                : {data.divisi}
                                                                            </p>
                                                                        </div>
                                                                        <div className='flex gap-1'>
                                                                            <p className='text-black font-bold'>
                                                                                Bagian
                                                                            </p>
                                                                            <p className='text-black text-medium'>
                                                                                : {data.bagian}
                                                                            </p>
                                                                        </div>
                                                                        <div className='flex gap-1'>
                                                                            <p className='text-black font-bold'>
                                                                                Jabatan
                                                                            </p>
                                                                            <p className='text-black text-medium'>
                                                                                : {data.jabatan}
                                                                            </p>
                                                                        </div>
                                                                        <div className='flex gap-1'>
                                                                            <p className='text-black font-bold'>
                                                                                Status Karyawan
                                                                            </p>
                                                                            <p className='text-black text-medium'>
                                                                                : {data.karyawan?.biodata_karyawan[0]?.status_karyawan}
                                                                            </p>
                                                                        </div>
                                                                        <div className='flex gap-1'>
                                                                            <p className='text-black font-bold'>
                                                                                Tgl masuk kerja
                                                                            </p>
                                                                            <p className='text-black text-medium'>
                                                                                : {convertTimeStampToDate(data.tgl_masuk_kerja)}
                                                                            </p>
                                                                        </div>
                                                                        <div className='flex gap-1'>
                                                                            <p className='text-black font-bold'>
                                                                                Tgl Keluar kerja
                                                                            </p>
                                                                            <p className='text-black text-medium'>
                                                                                : {convertTimeStampToDate(data.karyawan?.biodata_karyawan[0]?.tgl_keluar)}
                                                                            </p>
                                                                        </div>
                                                                        <div className='flex gap-1'>
                                                                            <p className='text-black font-bold'>
                                                                                Periode
                                                                            </p>
                                                                            :<input
                                                                                readOnly
                                                                                value={data.periode_awal}
                                                                                type='month' className='text-black  border-2 border-stroke text-medium'>

                                                                            </input> s/d
                                                                            <input
                                                                                readOnly
                                                                                value={data.periode_akhir}
                                                                                type='month' className='text-black  border-2 border-stroke text-medium'>

                                                                            </input>
                                                                        </div>

                                                                        <p className='text-black font-bold'>
                                                                            BAGIAN 1
                                                                        </p>

                                                                        {data.penilaian?.map((item: any, index: any) => (
                                                                            <div key={index} className='grid grid-cols-12'>
                                                                                <div className='font-bold text-black'>
                                                                                    {index + 1}
                                                                                </div>
                                                                                <div className='col-span-11'>
                                                                                    <h3 className='font-bold text-black'>{item.nama_point}</h3><span>{item.deskripsi} </span>
                                                                                </div>
                                                                                <div></div>
                                                                                <div className='flex flex-col col-span-4'>

                                                                                    <div className='grid grid-cols-3 w-full'>
                                                                                        <label>
                                                                                            Keterangan:
                                                                                        </label>
                                                                                        <input
                                                                                            className='border-2 border-stroke px-2 col-span-2'
                                                                                            type="text"
                                                                                            value={item.keterangan}

                                                                                            placeholder="Masukkan keterangan"
                                                                                        />

                                                                                    </div>
                                                                                    <div className="col-span-2">
                                                                                        <label>
                                                                                            Keterangan: {item.hasil_penilaian} - ({item.point_penilaian})
                                                                                        </label>


                                                                                    </div>
                                                                                </div>

                                                                            </div>
                                                                        ))}
                                                                        <p className='text-black font-bold pt-4'>
                                                                            BAGIAN 2
                                                                        </p>

                                                                        <div className='grid grid-cols-10 w-full'>
                                                                            <label>
                                                                                Alpa
                                                                            </label>
                                                                            <div className='col-span-4 flex gap-2'>
                                                                                :<input
                                                                                    readOnly
                                                                                    value={data.jumlah_alpa}
                                                                                    className='border-2 border-stroke px-2 '
                                                                                    type="text"
                                                                                    placeholder="Masukkan Hari"
                                                                                />
                                                                                <label>
                                                                                    Hari
                                                                                </label>
                                                                            </div>
                                                                        </div>
                                                                        <div className='grid grid-cols-10 w-full'>
                                                                            <label>
                                                                                Ijin (SKD)
                                                                            </label>
                                                                            <div className='col-span-4 flex gap-2'>
                                                                                :<input
                                                                                    readOnly
                                                                                    value={data.jumlah_izin}
                                                                                    className='border-2 border-stroke px-2 '
                                                                                    type="text"
                                                                                    placeholder="Masukkan Hari"
                                                                                />
                                                                                <label>
                                                                                    Hari
                                                                                </label>
                                                                            </div>
                                                                        </div>
                                                                        <div className='grid grid-cols-10 w-full'>
                                                                            <label>
                                                                                Tanpa (SKD)
                                                                            </label>
                                                                            <div className='col-span-4 flex gap-2'>
                                                                                :<input
                                                                                    readOnly
                                                                                    value={data.jumlah_tanpa_keterangan}
                                                                                    className='border-2 border-stroke px-2 '
                                                                                    type="text"
                                                                                    placeholder="Masukkan Hari"
                                                                                />
                                                                                <label>
                                                                                    Hari
                                                                                </label>
                                                                            </div>
                                                                        </div>
                                                                        <div className='grid grid-cols-10 w-full'>
                                                                            <label>
                                                                                Keterlambatan
                                                                            </label>
                                                                            <div className='col-span-4 flex gap-2'>
                                                                                :<input
                                                                                    readOnly
                                                                                    value={data.jumlah_keterlambatan}
                                                                                    className='border-2 border-stroke px-2 '
                                                                                    type="text"
                                                                                    placeholder="Masukkan Hari"
                                                                                />
                                                                                <label>
                                                                                    Hari
                                                                                </label>
                                                                            </div>
                                                                        </div>
                                                                        <p className='text-black font-bold pt-4'>
                                                                            Teguran Peringatan
                                                                        </p>
                                                                        <div className='grid grid-cols-8 w-full'>
                                                                            <label>
                                                                                Peringatan Ke 1
                                                                            </label>
                                                                            <div className='col-span-4 flex gap-2'>
                                                                                :<input
                                                                                    readOnly
                                                                                    value={data.peringatan_ke_1}
                                                                                    className='border-2 border-stroke px-2 '
                                                                                    type="text"
                                                                                    placeholder="Masukkan Peringatan Ke-1"
                                                                                />
                                                                                <label>

                                                                                </label>
                                                                            </div>
                                                                        </div>
                                                                        <div className='grid grid-cols-8 w-full'>
                                                                            <label>
                                                                                Peringatan Ke 2
                                                                            </label>
                                                                            <div className='col-span-4 flex gap-2'>
                                                                                :<input
                                                                                    readOnly
                                                                                    value={data.peringatan_ke_2}
                                                                                    className='border-2 border-stroke px-2 '
                                                                                    type="text"
                                                                                    placeholder="Masukkan Peringatan Ke-2"
                                                                                />
                                                                                <label>

                                                                                </label>
                                                                            </div>
                                                                        </div>
                                                                        <div className='grid grid-cols-8 w-full'>
                                                                            <label>
                                                                                Peringatan Ke 3
                                                                            </label>
                                                                            <div className='col-span-4 flex gap-2'>
                                                                                :<input
                                                                                    readOnly
                                                                                    value={data.peringatan_ke_3}
                                                                                    className='border-2 border-stroke px-2 '
                                                                                    type="text"
                                                                                    placeholder="Masukkan Peringatan Ke-3"
                                                                                />
                                                                                <label>

                                                                                </label>
                                                                            </div>
                                                                        </div>
                                                                        <p className='text-black font-bold pt-4'>
                                                                            Prestasi Kerja
                                                                        </p>
                                                                        <div className='flex flex-col gap-1 pt-2'>
                                                                            <label>
                                                                                {data.prestasi_kerja} - ({data.prestasi_kerja_point})
                                                                            </label>
                                                                        </div>
                                                                        <p className='text-black font-bold pt-4'>
                                                                            Kesan Penilai
                                                                        </p>
                                                                        <textarea
                                                                            readOnly
                                                                            value={data.kesan_penilai}
                                                                            className="peer h-full min-h-[100px] w-full resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                                                                        ></textarea>
                                                                    </div>

                                                                    <div className='flex flex-col w-full px-4 '>
                                                                        <label htmlFor="" className='text-black text-xs font-bold'>
                                                                            RESPON HR<span className='text-red-600'>*</span>
                                                                        </label>
                                                                        <textarea

                                                                            readOnly
                                                                            value={data.catatan_hr}
                                                                            className="peer h-full min-h-[100px] w-full resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                                                                        ></textarea>
                                                                    </div>


                                                                </div>

                                                            </>
                                                        </ModalXL>
                                                    </>
                                                )
                                                }
                                            </>
                                        </div>
                                    </div>
                                </>
                            )
                        })}
                    </div>
                </div>
            </main>

        </>
    );
}

export default HistoryBuatStatusKaryawan;
