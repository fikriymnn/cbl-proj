import React, { useEffect, useState } from 'react'
import Loading from '../../../Loading';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ModalKosongan from '../../../Modals/Qc/NCR/NCRResponQC';
import convertTimeStampToDateTime from '../../../../utils/converDateTime';
import convertTimeStampToDate from '../../../../utils/convertDate';

function ListPayroll() {
    const [isLoading, setIsLoading] = useState(false);
    const [payWeek, setPayWeek] = useState<any>();

    const [dateFrom, setDateFrom] = useState<any>();
    const [dateTo, setDateTo] = useState<any>();
    const [idKaryawan, setIdKaryawan] = useState<any>();
    const [insentif, setInsentif] = useState<any>(0);



    const [karyawan, setKaryawan] = useState<any>();

    useEffect(() => {

        getKaryawan()
    }, []);

    async function getKaryawan() {
        const url = `${import.meta.env.VITE_API_LINK
            }/hr/karyawan`;
        try {

            const res = await axios.get(
                url,

                {
                    withCredentials: true,
                },
            );
            setKaryawan(res.data)
            console.log(res.data)
        } catch (error: any) {

            console.log(error);
        }
    }



    async function getPayrollMingguan(dateFrom1: any, dateTo1: any, id_karyawan: any) {
        const url = `${import.meta.env.VITE_API_LINK}/hr/payroll`;
        try {
            setIsLoading(true)
            const res = await axios.get(url,
                {
                    params: {
                        startDate: dateFrom1,
                        endDate: dateTo1,
                        id_karyawan: id_karyawan,
                    },
                    withCredentials: true,
                });
            setIsLoading(false)
            setPayWeek(res.data);
            console.log(res.data);
        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }

    async function bayarPayrollMingguan(dateFrom1: any, dateTo1: any, id_karyawan: any, data_payroll: any) {
        const url = `${import.meta.env.VITE_API_LINK}/hr/payroll/bayarMingguan`;
        try {
            setIsLoading(true)
            const res = await axios.post(url, {
                periode_dari: dateFrom1,
                periode_sampai: dateTo1,
                id_karyawan: id_karyawan,
                insentif: insentif,
                data_payroll: data_payroll
            },
                {
                    withCredentials: true,
                });
            setIsLoading(false)

            console.log(res.data);
            alert("success")
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
        setPayWeek(null)
        setDateFrom(null)
        setDateTo(null)
    };

    const [showEdit2, setShowEdit2] = useState<any>([]);
    const openEdit2 = (i: any) => {
        const onchangeVal: any = [...showEdit2];
        onchangeVal[i] = true;

        setShowEdit2(onchangeVal);
    };
    const closeEdit2 = (i: any) => {
        const onchangeVal: any = [...showEdit2];
        onchangeVal[i] = false;

        setShowEdit2(onchangeVal);
    };
    const formatCurrency = (amount: number): string => {
        return `Rp. ${amount.toLocaleString('id-ID')}`;
    };
    return (
        <main className="overflow-x-scroll">
            {isLoading && <Loading />}
            <div className="min-w-[700px] bg-white rounded-xl">
                <div className=" w-full h-full flex-col border-b-8 border-[#D8EAFF]">
                    <div className="grid grid-cols-8 gap-4 px-3 py-4 border-b-8 border-[#D8EAFF] ">
                        <div className='flex gap-3'>
                            <label className="text-black text-xs font-bold">
                                No
                            </label>
                            <label className="text-neutral-500 text-xs font-semibold ">
                                NIK
                            </label>
                        </div>
                        <label className="text-neutral-500 text-xs font-semibold ] ">
                            Nama
                        </label>
                        <label className="text-neutral-500 text-xs font-semibold  ">
                            Divisi
                        </label>
                        <label className="text-neutral-500 text-xs font-semibold  ">
                            Department
                        </label>
                        <label className="text-neutral-500 text-xs font-semibold  ">
                            Bagian
                        </label>
                        <label className="text-neutral-500 text-xs font-semibold  ">
                            Jabatan
                        </label>
                        <label className="text-neutral-500 text-xs font-semibold ">
                            Tipe Penggajian
                        </label>
                        <div className='flex justify-center '>

                        </div>
                    </div>
                    <div className="w-2 h-full "></div>
                    {karyawan != null &&
                        karyawan?.data?.map((data: any, i: any) => (
                            <>
                                <div className="grid grid-cols-8 gap-4 px-3 py-4 border-b-8 border-[#D8EAFF] ">
                                    <div className='flex gap-3'>
                                        <label className="text-black text-xs font-bold ">
                                            {i + 1}
                                        </label>
                                        <label className="text-neutral-500 text-xs font-semibold ">
                                            {data.biodata_karyawan[0]?.nik}
                                        </label>
                                    </div>
                                    <label className="text-neutral-500 text-xs font-semibold ">
                                        {data.name}
                                    </label>

                                    <label className="text-neutral-500 text-xs font-semibold  ">
                                        {data.biodata_karyawan[0]?.divisi?.nama_divisi}
                                    </label>
                                    <label className="text-neutral-500 text-xs font-semibold  ">
                                        {data.biodata_karyawan[0]?.department?.nama_department}
                                    </label>
                                    <label className="text-neutral-500 text-xs font-semibold  ">
                                        {data.biodata_karyawan[0]?.bagian?.nama_bagian}
                                    </label>
                                    <label className="text-neutral-500 text-xs font-semibold  ">
                                        {data.biodata_karyawan[0]?.jabatan}
                                    </label>
                                    <label className="text-neutral-500 text-xs font-semibold  ">
                                        {data.biodata_karyawan[0]?.tipe_penggajian}
                                    </label>
                                    <div className='lg:flex-col md:flex-col sm:flex  gap-1'>

                                        <button
                                            onClick={() => openEdit(i)}
                                            className='px-2 py-1  text-xs bg-blue-400 items-center justify-center text-white font-semibold rounded-md flex w-full '>
                                            Pay
                                        </button>
                                        {showEdit[i] == true && (

                                            <ModalKosongan
                                                isOpen={showEdit[i]}
                                                onClose={() => closeEdit(i)}
                                                judul={'Rincihan Payroll'}
                                            >
                                                <>
                                                    <>
                                                        <div className='flex flex-col gap-1 py-4'>
                                                            <div className='flex flex-col'>
                                                                <p className="my-auto text-sm text-neutral-400 font-semibold ">
                                                                    {data.name} - {data.biodata_karyawan[0]?.nik}
                                                                </p>

                                                            </div>
                                                            <div className='flex flex-col'>
                                                                <p className="my-auto text-sm text-primary font-semibold ">
                                                                    Pilih Periode Pembayaran
                                                                </p>

                                                            </div>

                                                            <div className='flex gap-3'>
                                                                <div className="flex md:justify-center items-center gap-2">
                                                                    <p className="text-sm text-primary font-semibold md:w-3/12 w-2/12">
                                                                        Dari:
                                                                    </p>
                                                                    <input
                                                                        className='rounded-full bg-[#D8EAFF] px-2 text-black'
                                                                        type="date"
                                                                        onChange={(e) => setDateFrom(e.target.value)}
                                                                    ></input>

                                                                </div>
                                                                <div className="flex md:justify-center items-center gap-2">
                                                                    <p className=" my-auto text-sm text-primary font-semibold md:w-3/12 w-2/12">
                                                                        Sampai:
                                                                    </p>

                                                                    <input
                                                                        className='rounded-full bg-[#D8EAFF] px-2 text-black'
                                                                        type="date"
                                                                        onChange={(e) => setDateTo(e.target.value)}
                                                                    ></input>

                                                                </div>
                                                                <button
                                                                    disabled={isLoading}
                                                                    onClick={() => {
                                                                        getPayrollMingguan(dateFrom, dateTo, data.biodata_karyawan[0]?.id_karyawan)
                                                                    }}
                                                                    className="bg-primary text-white px-5 py-2 rounded-md my-auto "
                                                                >
                                                                    {isLoading ? 'Loading...' : 'TAMPILKAN'}
                                                                </button>

                                                            </div>
                                                        </div>

                                                        <div className='grid grid-cols-12 px-4 py-1 border-b-8 border-[#D8EAFF]'>
                                                            <div className='flex gap-1 col-span-3 text-sm text-black font-semibold'>
                                                                No. Tanggal
                                                            </div>
                                                            <p className='text-sm text-black font-semibold col-span-2'>
                                                                Status Absen
                                                            </p>
                                                            <p className='text-sm text-black font-semibold col-span-5'>
                                                                Rincian
                                                            </p>
                                                            <p className='text-sm text-black font-semibold col-span-2'>
                                                                Total
                                                            </p>
                                                        </div>
                                                        <div className='flex flex-col gap-1 py-4 max-h-[500px] overflow-y-scroll '>
                                                            {payWeek != null &&
                                                                payWeek?.data?.detailAbsensi?.map((data2: any, ii: any) => (
                                                                    <>
                                                                        <div
                                                                            key={ii}
                                                                            className='grid grid-cols-12 px-4 py-1 border-b-8 border-[#D8EAFF]'>
                                                                            <div className='flex gap-1 col-span-3 text-sm text-neutral-500'>
                                                                                {ii + 1}. {data2.tgl_masuk}
                                                                            </div>
                                                                            <p className='text-sm text-neutral-500 col-span-2'>
                                                                                {data2.status_absen}
                                                                            </p>
                                                                            <div className='col-span-4 text-neutral-500  gap-1'>
                                                                                {payWeek != null &&
                                                                                    data2?.payroll?.rincian?.map((data3: any, iii: any) => (
                                                                                        <>
                                                                                            <p className='text-sm flex flex-col'>
                                                                                                {`${iii + 1}. ${data3.label} : ${data3.jumlah} x ${data3.nilai} = ${data3.total}`}
                                                                                            </p>

                                                                                        </>
                                                                                    ))}

                                                                            </div>
                                                                            <div className='px-2'>
                                                                                {data2?.payroll?.data_pengajuan_lembur != null ?
                                                                                    <>
                                                                                        <button
                                                                                            onClick={() => openEdit2(ii)}
                                                                                            className='px-2 py-1  text-xs bg-blue-400 items-center justify-center text-white font-semibold rounded-md flex w-full '>
                                                                                            Detail Lembur
                                                                                        </button>
                                                                                        {showEdit2[ii] == true && (

                                                                                            <ModalKosongan
                                                                                                isOpen={showEdit2[ii]}
                                                                                                onClose={() => closeEdit2(ii)}
                                                                                                judul={'Lapor'}
                                                                                            >
                                                                                                <>
                                                                                                    <div className='grid grid-cols-2 gap-2 px-4 py-4'>
                                                                                                        <div className='flex flex-col  '>
                                                                                                            <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                                                Status
                                                                                                            </label>
                                                                                                            <label htmlFor="" className='text-[#016ae6] uppercase text-xl font-normal'>
                                                                                                                {data2.payroll?.data_pengajuan_lembur.status}
                                                                                                            </label>
                                                                                                        </div>
                                                                                                        <div className='flex flex-col  '>
                                                                                                            <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                                                Yang Menyetujui
                                                                                                            </label>
                                                                                                            <label htmlFor="" className='text-[#016ae6] uppercase text-xl font-normal'>
                                                                                                                {data2.payroll?.data_pengajuan_lembur.karyawan_hr?.name}
                                                                                                            </label>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div className='grid grid-cols-2 gap-2 px-4 py-4'>
                                                                                                        <div className='flex flex-col gap-2 '>
                                                                                                            <div className='flex flex-col '>
                                                                                                                <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                                                    NAMA PERSONNEL
                                                                                                                </label>
                                                                                                                <label htmlFor="" className='text-[#7a7a7a] text-xl font-normal'>
                                                                                                                    {data2.payroll?.data_pengajuan_lembur.karyawan?.name}
                                                                                                                </label>
                                                                                                            </div>
                                                                                                            <div className='flex flex-col '>
                                                                                                                <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                                                    DEPARTEMEN
                                                                                                                </label>
                                                                                                                <label htmlFor="" className='text-[#7a7a7a] text-xl font-normal'>
                                                                                                                    {data2.payroll?.data_pengajuan_lembur.karyawan_pengaju?.biodata_karyawan[0]?.department?.nama_department}
                                                                                                                </label>
                                                                                                            </div>
                                                                                                            <div className='flex flex-col '>
                                                                                                                <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                                                    TANGGAL
                                                                                                                </label>
                                                                                                                <label htmlFor="" className='text-[#7a7a7a] text-xl font-normal'>
                                                                                                                    {convertTimeStampToDate(data2.payroll?.data_pengajuan_lembur.createdAt)}
                                                                                                                </label>
                                                                                                            </div>
                                                                                                            <div className='flex flex-col '>
                                                                                                                <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                                                    SUPERVISOR
                                                                                                                </label>
                                                                                                                <label htmlFor="" className='text-[#7a7a7a] text-xl font-normal'>
                                                                                                                    {data2.payroll?.data_pengajuan_lembur.karyawan_pengaju?.name}
                                                                                                                </label>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                        <div className='flex flex-col gap-2 '>

                                                                                                            <div className='flex flex-col '>
                                                                                                                <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                                                    LAMA LEMBUR
                                                                                                                </label>
                                                                                                                <label htmlFor="" className='text-[#016ae6] text-xl font-normal'>
                                                                                                                    {data2.payroll?.data_pengajuan_lembur.lama_lembur} JAM
                                                                                                                </label>
                                                                                                            </div>
                                                                                                            <div className='flex flex-col '>
                                                                                                                <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                                                    DARI
                                                                                                                </label>
                                                                                                                <label htmlFor="" className='text-[#016ae6] text-xl font-normal'>
                                                                                                                    {convertTimeStampToDateTime(data2.payroll?.data_pengajuan_lembur.dari)}
                                                                                                                </label>
                                                                                                            </div>
                                                                                                            <div className='flex flex-col '>
                                                                                                                <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                                                    SAMPAI
                                                                                                                </label>
                                                                                                                <label htmlFor="" className='text-[#016ae6] text-xl font-normal'>
                                                                                                                    {convertTimeStampToDateTime(data2.payroll?.data_pengajuan_lembur.sampai)}
                                                                                                                </label>
                                                                                                            </div>
                                                                                                            <div className='flex flex-col '>
                                                                                                                <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                                                    NO. JO
                                                                                                                </label>
                                                                                                                <label htmlFor="" className='text-[#016ae6] text-xl font-normal'>
                                                                                                                    {data2.payroll?.data_pengajuan_lembur.jo_lembur}
                                                                                                                </label>
                                                                                                            </div>
                                                                                                            <div className='flex flex-col '>
                                                                                                                <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                                                    DENGAN ISTIRAHAT
                                                                                                                </label>
                                                                                                                <label htmlFor="" className='text-[#016ae6] text-xl font-normal'>
                                                                                                                    {data2.payroll?.data_pengajuan_lembur.isIstirahat == true ? 'YA' : 'TIDAK'}
                                                                                                                </label>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div className='flex flex-col w-full px-4'>
                                                                                                        <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                                            TARGET LEMBUR
                                                                                                        </label>
                                                                                                        <label htmlFor="" className='text-[#7a7a7a] text-xl font-normal'>
                                                                                                            {data2.payroll?.data_pengajuan_lembur.target_lembur}
                                                                                                        </label>
                                                                                                    </div>
                                                                                                    <div className='flex flex-col w-full px-4'>
                                                                                                        <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                                            ALASAN LEMBUR
                                                                                                        </label>
                                                                                                        <label htmlFor="" className='text-[#7a7a7a] text-xl font-normal'>
                                                                                                            {data2.payroll?.data_pengajuan_lembur.alasan_lembur}
                                                                                                        </label>
                                                                                                    </div>

                                                                                                    <div className='flex flex-col w-full px-4 '>
                                                                                                        <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                                            RESPON HR<span className='text-red-600'>*</span>
                                                                                                        </label>
                                                                                                        <textarea
                                                                                                            readOnly
                                                                                                            value={data2.payroll?.data_pengajuan_lembur.catatan_hr}
                                                                                                            className="peer h-full min-h-[100px] w-full resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                                                                                                        ></textarea>
                                                                                                    </div>


                                                                                                </>
                                                                                            </ModalKosongan>
                                                                                        )}
                                                                                    </>
                                                                                    :
                                                                                    <>
                                                                                    </>
                                                                                }
                                                                            </div>
                                                                            <p className='text-sm text-neutral-500 col-span-2'>
                                                                                {(data2.payroll?.total == null || data2.payroll?.total == 0) ? '-' : formatCurrency(data2.payroll?.total)}
                                                                            </p>

                                                                        </div >

                                                                    </>
                                                                ))}
                                                            <div className='grid grid-cols-2 items-center py-2  border-b-8 border-[#D8EAFF]'>


                                                                <div className='flex flex-col '>
                                                                    <div className='flex'>
                                                                        <p>
                                                                            Rincian :
                                                                        </p>
                                                                        <div>
                                                                            {
                                                                                payWeek?.data?.summaryPayroll?.rincian?.map((dataRincian: any, iRincian: number) => {
                                                                                    return (
                                                                                        <p className='text-sm flex flex-col'>
                                                                                            {`${iRincian + 1}. ${dataRincian.label} : ${dataRincian.jumlah} x ${dataRincian.nilai} = ${dataRincian.total}`}
                                                                                        </p>
                                                                                    )

                                                                                })
                                                                            }
                                                                        </div>

                                                                    </div>
                                                                    {
                                                                        payWeek?.data?.summaryPayroll?.upahHarianSakit.length != 0 ?
                                                                            <div className='flex'>
                                                                                <p>
                                                                                    Upah Harian Sakit :
                                                                                </p>
                                                                                <div>
                                                                                    {
                                                                                        payWeek?.data?.summaryPayroll?.upahHarianSakit?.map((dataSakit: any, iSAkit: number) => {
                                                                                            return (
                                                                                                <p className='text-sm flex flex-col'>
                                                                                                    {`${iSAkit + 1}. ${dataSakit.label} : ${dataSakit.jumlah} x ${dataSakit.nilai} = ${dataSakit.total}`}
                                                                                                </p>
                                                                                            )

                                                                                        })
                                                                                    }
                                                                                </div>

                                                                            </div> : null
                                                                    }
                                                                    {
                                                                        payWeek?.data?.summaryPayroll?.potonganPinjaman != null ?
                                                                            <div className='flex'>
                                                                                <p>
                                                                                    {` Potongan Pinjaman : ${payWeek?.data?.summaryPayroll?.potonganPinjaman?.jumlah_cicilan}`}
                                                                                </p>


                                                                            </div> : null
                                                                    }


                                                                </div>
                                                                <div className='flex flex-col justify-end w-full'>


                                                                    <div className="flex w-full flex-col">
                                                                        <label className="text-black text-xs font-bold">
                                                                            Insentif
                                                                        </label>
                                                                        <div className="flex w-full">
                                                                            <input

                                                                                name="nama_grade"

                                                                                onChange={(e) => {
                                                                                    setInsentif(e.target.value)

                                                                                }}
                                                                                type="number"
                                                                                className=" w-[40%] h-6 border-2 border-stroke rounded-md"
                                                                            />

                                                                        </div>
                                                                    </div>


                                                                    <div>
                                                                        {
                                                                            `Total Upah : Rp.  ${payWeek?.data?.summaryPayroll?.total + parseInt(insentif)}`
                                                                        }
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {payWeek?.data == null ? <></> :

                                                                <>
                                                                    <button
                                                                        onClick={() => bayarPayrollMingguan(dateFrom, dateTo, data.biodata_karyawan[0]?.id_karyawan, payWeek?.data?.summaryPayroll)}
                                                                        className='px-2 py-1  text-xs bg-blue-400 items-center justify-center text-white font-semibold rounded-md flex w-full '>
                                                                        Bayar
                                                                    </button>
                                                                </>}
                                                        </div>

                                                    </>
                                                </>
                                            </ModalKosongan>
                                        )}

                                    </div>

                                </div >
                            </>
                        ))}
                </div>
            </div >
        </main >
    )
}

export default ListPayroll
