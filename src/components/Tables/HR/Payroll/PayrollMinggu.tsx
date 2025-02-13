import React, { useEffect, useState } from 'react'
import Loading from '../../../Loading';
import axios from 'axios';
import convertTimeStampToDate from '../../../../utils/convertDate';
import formatInteger from '../../../../utils/formaterInteger';
import ModalKosongan from '../../../Modals/Qc/NCR/NCRResponQC';

function PayrollMinggu() {
    const [isLoading, setIsLoading] = useState(false);
    const [payWeek, setPayWeek] = useState<any>();
    const [dateFrom, setDateFrom] = useState<any>();
    const [dateTo, setDateTo] = useState<any>();
    const [editedPayWeek, setEditedPayWeek] = useState(() =>
        payWeek
            ? {
                ...payWeek,
                detail: payWeek.detail.map((item: any) => ({
                    ...item,
                    originalSubTotal: item.summaryPayroll.sub_total, // Store initial sub_total
                })),
            }
            : null
    );
    useEffect(() => {
        if (payWeek) {
            setEditedPayWeek({
                ...payWeek,
                detail: payWeek.detail.map((item: any) => ({
                    ...item,
                    originalSubTotal: item.summaryPayroll.sub_total, // Store initial sub_total
                })),
            });
        }
    }, [payWeek]);

    async function getPayrollMingguan(dateFrom1: any, dateTo1: any) {
        const url = `${import.meta.env.VITE_API_LINK}/hr/payrollAll`;
        try {
            setIsLoading(true)
            const res = await axios.get(url,
                {
                    params: {
                        startDate: dateFrom1,
                        endDate: dateTo1,

                    },
                    withCredentials: true,
                });
            setIsLoading(false)
            setPayWeek(res.data.data);
            console.log(res.data.data);
        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }

    async function postPayrollMingguan() {
        const url = `${import.meta.env.VITE_API_LINK}/hr/payroll/bayarMingguanPeriode`;
        try {
            setIsLoading(true)
            const res = await axios.post(url, {
                data_payroll: editedPayWeek
            },
                {

                    withCredentials: true,
                });
            setIsLoading(false)
            setPayWeek(res.data.data);
            console.log(res.data.data);
        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }


    const handleInputChange = (index: number, value: number) => {
        const newDetail = [...editedPayWeek.detail];
        newDetail[index].summaryPayroll.pengurangan_penambahan = value;
        newDetail[index].summaryPayroll.sub_total = newDetail[index].originalSubTotal + value; // Update sub_total

        // Recalculate total based on new sub_totals
        const newTotal = newDetail.reduce((sum, item) => sum + item.summaryPayroll.sub_total, 0);

        setEditedPayWeek({
            ...editedPayWeek,
            detail: newDetail,
            total: newTotal, // Update total in payWeek
        });
    };

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
    const handleClickDetail = (index: number) => {
        setShowDetail((prevState) => {
            const updatedShowDetail = [...prevState]; // Create a copy
            updatedShowDetail[index] = !updatedShowDetail[index]; // Toggle value
            return updatedShowDetail;
        });
    };
    const [showDetail, setShowDetail] = useState<boolean[]>(
        new Array(payWeek != null && payWeek.length).fill(false),
    );

    const handleClickDetail2 = (index: number) => {
        setShowDetail2((prevState) => {
            const updatedShowDetail = [...prevState]; // Create a copy
            updatedShowDetail[index] = !updatedShowDetail[index]; // Toggle value
            return updatedShowDetail;
        });
    };
    const [showDetail2, setShowDetail2] = useState<boolean[]>(
        new Array(payWeek != null && payWeek.length).fill(false),
    );
    console.log(editedPayWeek)
    return (
        <main>
            {isLoading && <Loading />}
            <div className="min-w-[700px] bg-white rounded-xl">
                <div className="bg-white w-full mb-5 rounded-md p-3 flex flex-col justify-center items-center gap-3 border-b-8 border-[#D8EAFF]">

                    <div className="grid md:grid-cols-12 grid-cols-6  py-1 gap-3 ">

                        <div className="flex flex-col gap-2 col-span-3">
                            <div>
                                <p className="text-sm text-primary font-semibold">
                                    Dari:
                                </p>
                                <input
                                    className=' bg-[#D8EAFF] px-2 h-8'
                                    type="date"
                                    onChange={(e) => setDateFrom(e.target.value)}
                                ></input>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 col-span-7">
                            <div>
                                <p className=" my-auto text-sm text-primary font-semibold ">
                                    Sampai:
                                </p>

                                <input
                                    className=' bg-[#D8EAFF] px-2 h-8'
                                    type="date"
                                    onChange={(e) => setDateTo(e.target.value)}
                                ></input>
                            </div>
                        </div>

                        <div className="flex w-full  items-end gap-1 col-span-2">
                            <button
                                onClick={() => {

                                    getPayrollMingguan(dateFrom, dateTo)
                                }}
                                className="bg-primary text-white px-5 py-2 rounded-md my-auto "
                            >
                                Filter
                            </button>

                        </div>
                    </div>
                </div>
                <div className=" w-full h-full  border-b-8 border-[#D8EAFF] bg-white px-4 py-4 items-center justify-between flex">
                    <div>
                        <label className='text-xl text-blue-400 font-semibold  justify-center text-center'>
                            {payWeek == null ? 'Periode Dari' : convertTimeStampToDate(payWeek?.periode_dari)} ~  {payWeek == null ? 'Periode Sampai' : convertTimeStampToDate(payWeek?.periode_sampai)}
                        </label>
                        <label className='text-xl text-blue-400 font-semibold  justify-center text-center'>
                            {editedPayWeek == null ? '' : 'Total Gaji Rp.' + editedPayWeek?.total}
                        </label>
                    </div>
                    {payWeek && (
                        <button
                            title="button"
                            onClick={() => postPayrollMingguan()}
                            className="text-xs w-[20%] flex items-center justify-center font-bold text-white px-1 bg-blue-700 py-2 border-blue-700 border rounded-md"
                        >
                            AJUKAN
                        </button>
                    )}

                </div>
                <div className=" w-full h-full flex-col  bg-white">
                    <div className="grid grid-cols-8 gap-4 px-3 py-4 border-b-8 border-[#D8EAFF] ">
                        <div className='flex gap-3'>
                            <label className="text-black text-xs font-bold">
                                No
                            </label>
                            <label className="text-neutral-500 text-xs font-semibold ">
                                NIK
                            </label>
                        </div>
                        <label className="text-neutral-500 text-xs font-semibold  ">
                            Nama
                        </label>
                        <label className="text-neutral-500 text-xs font-semibold  ">
                            Department
                        </label>
                        <label className="text-neutral-500 text-xs font-semibold  ">
                            Divisi
                        </label>
                        <label className="text-neutral-500 text-xs font-semibold  ">
                            Total
                        </label>
                        <div className='flex justify-center '>

                        </div>
                    </div>
                </div>
                {
                    editedPayWeek?.detail?.map((data: any, i: any) => (
                        <>
                            <div key={i} className="grid grid-cols-8 gap-4 px-3 py-4 border-b-8 border-[#D8EAFF] ">
                                <div className='flex gap-3'>
                                    <label className="text-black text-xs font-bold">
                                        {i + 1}
                                    </label>
                                    <label className="text-neutral-500 text-xs font-semibold ">
                                        {data.summaryPayroll?.nik}
                                    </label>
                                </div>
                                <label className="text-neutral-500 text-xs font-semibold  ">
                                    {data.summaryPayroll?.nama_karyawan}
                                </label>
                                <label className="text-neutral-500 text-xs font-semibold  ">
                                    {data.summaryPayroll?.department}
                                </label>
                                <label className="text-neutral-500 text-xs font-semibold  ">
                                    {data.summaryPayroll?.divisi}
                                </label>
                                <label className="text-neutral-500 text-xs font-semibold col-span-2 ">
                                    Rp.{formatInteger(data.summaryPayroll?.sub_total)}
                                </label>
                                <div className='flex justify-center '>
                                    <button
                                        onClick={() => openEdit(i)}
                                        className='px-2 py-1  text-xs bg-blue-400 items-center justify-center text-white font-semibold rounded-md flex w-full '>
                                        Detail
                                    </button>
                                    {showEdit[i] == true && (

                                        <ModalKosongan
                                            isOpen={showEdit[i]}
                                            onClose={() => closeEdit(i)}
                                            judul={'Detail Payroll'}
                                        >
                                            <>
                                                <div className='grid grid-cols-2 gap-2 px-4 py-4'>
                                                    <div className='flex flex-col gap-2 '>
                                                        <div className='flex flex-col '>
                                                            <label htmlFor="" className='text-black text-xs font-bold'>
                                                                NAMA PERSONNEL
                                                            </label>
                                                            <label htmlFor="" className='text-[#7a7a7a] text-xl font-normal'>
                                                                {data.summaryPayroll?.nama_karyawan}
                                                            </label>
                                                        </div>
                                                        <div className='flex flex-col '>
                                                            <label htmlFor="" className='text-black text-xs font-bold'>
                                                                NIK
                                                            </label>
                                                            <label htmlFor="" className='text-[#7a7a7a] text-xl font-normal'>
                                                                {data.summaryPayroll?.nik}
                                                            </label>
                                                        </div>
                                                        <div className='flex flex-col '>
                                                            <label htmlFor="" className='text-black text-xs font-bold'>
                                                                Deparment
                                                            </label>
                                                            <label htmlFor="" className='text-[#7a7a7a] text-xl font-normal'>
                                                                {data.summaryPayroll?.department}
                                                            </label>
                                                        </div>
                                                        <div className='flex flex-col '>
                                                            <label htmlFor="" className='text-black text-xs font-bold'>
                                                                Divisi
                                                            </label>
                                                            <label htmlFor="" className='text-[#7a7a7a] text-xl font-normal'>
                                                                {data.summaryPayroll?.divisi}
                                                            </label>
                                                        </div>

                                                    </div>
                                                    <div className='flex flex-col gap-2'>
                                                        <div className='flex flex-col'>
                                                            <label htmlFor="" className='text-black text-xs font-bold'>
                                                                PERIODE
                                                            </label>
                                                            <label htmlFor="" className='text-[#7a7a7a] text-xl font-normal'>
                                                                {convertTimeStampToDate(payWeek?.periode_dari)}
                                                            </label>
                                                            <label htmlFor="" className='text-[#7a7a7a] text-xl font-normal'>
                                                                ~   {convertTimeStampToDate(payWeek?.periode_sampai)}
                                                            </label>
                                                        </div>
                                                        <div className='flex flex-col'>

                                                            <label htmlFor="" className='text-black text-xs font-bold'>
                                                                TOTAL POTONGAN
                                                            </label>
                                                            <label htmlFor="" className='text-[#7a7a7a] text-xl font-normal'>
                                                                Rp. {formatInteger(data.summaryPayroll?.total_potongan)}
                                                            </label>
                                                        </div>
                                                        <div className='flex flex-col'>

                                                            <label htmlFor="" className='text-black text-xs font-bold'>
                                                                TOTAL UPAH
                                                            </label>
                                                            <label htmlFor="" className='text-[#7a7a7a] text-xl font-normal'>
                                                                Rp. {formatInteger(data.summaryPayroll?.total)}
                                                            </label>
                                                        </div>
                                                        <input
                                                            className='border-2 border-stroke rounded-md'
                                                            type="number"
                                                            value={data.summaryPayroll.penggurangan_penambahan}
                                                            onChange={(e) => handleInputChange(i, Number(e.target.value))}
                                                            placeholder='Masukkan Pengurangan atau Penambahan'
                                                        />
                                                        <div className='flex flex-col'>

                                                            <label htmlFor="" className='text-black text-xs font-bold'>
                                                                TOTAL UPAH TERBARU
                                                            </label>
                                                            <label htmlFor="" className='text-[#7a7a7a] text-xl font-normal'>
                                                                Rp.  {formatInteger(data.summaryPayroll.sub_total)}
                                                            </label>
                                                        </div>

                                                    </div>
                                                </div>
                                                <button
                                                    title="button"
                                                    onClick={() => handleClickDetail(i)}
                                                    className="text-xs w-[20%] flex items-center justify-center font-bold text-white px-1 bg-blue-700 py-2 border-blue-700 border rounded-md"
                                                >
                                                    RINCIAN
                                                </button>
                                                {showDetail[i] && (
                                                    <>
                                                        <div className='grid grid-cols-2 gap-2 px-4 py-4'>
                                                            <div className='flex flex-col gap-2 '>
                                                                <div className='flex flex-col '>
                                                                    <label htmlFor="" className='text-black text-xs font-bold'>
                                                                        DETAIL POTONGAN
                                                                    </label>

                                                                    {data.summaryPayroll?.potongan?.map((data2: any, ii: any) => (
                                                                        <>
                                                                            <label
                                                                                key={ii} htmlFor="" className='text-[#7a7a7a] text-xl font-normal'>
                                                                                - {data2.label} : Rp. {formatInteger(data2.total)}
                                                                            </label>
                                                                        </>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div className='flex flex-col gap-2 '>
                                                                <div className='flex flex-col '>
                                                                    <label htmlFor="" className='text-black text-xs font-bold'>
                                                                        RINCIAN PAYROLL
                                                                    </label>

                                                                    {data.summaryPayroll?.rincian?.map((data2: any, ii: any) => (
                                                                        <>
                                                                            <label
                                                                                key={ii} htmlFor="" className='text-[#7a7a7a] text-xl font-normal'>
                                                                                - {data2.label} x {data2.jumlah}: Rp. {formatInteger(data2.total)}
                                                                            </label>
                                                                        </>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                                <button
                                                    title="button"
                                                    onClick={() => handleClickDetail2(i)}
                                                    className="text-xs w-[20%] mt-2 flex items-center justify-center font-bold text-white px-1 bg-blue-700 py-2 border-blue-700 border rounded-md"
                                                >
                                                    RINCIAN ABSENSI
                                                </button>
                                                {showDetail2[i] && (
                                                    <>
                                                        <div className='flex flex-col gap-2  py-4'>
                                                            <div className='flex flex-col '>
                                                                <label htmlFor="" className='text-black text-xs font-bold'>
                                                                    DETAIL ABSENSI
                                                                </label>
                                                                <div className="grid grid-cols-12  py-4 border-b-8 border-[#D8EAFF] gap-2 ">
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
                                                                        <p className="text-xs font-bold ">Waktu </p>

                                                                    </div>
                                                                    <label className="text-neutral-500 text-sm font-semibold flex gap-1">
                                                                        Shift
                                                                    </label>
                                                                    <label className="text-neutral-500 text-sm font-semibold">
                                                                        Lembur
                                                                    </label>
                                                                    <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                                                        Terlambat
                                                                    </label>
                                                                    <label className="text-neutral-500 text-sm font-semibold ">
                                                                        Status
                                                                    </label>
                                                                </div>
                                                                <div className="w-2 h-full "></div>
                                                                {data.detailAbsensi?.map((data2: any, ii: any) => (
                                                                    <>

                                                                        <div className="grid grid-cols-12  py-4 border-b-8 border-[#D8EAFF] gap-2 ">
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
                                                                                {(data2.shift == null || data2.shift == 0) ? ' ~' : data2.shift}
                                                                            </label>
                                                                            <label className="text-neutral-500 text-sm font-semibold">
                                                                                {(data2.status_lembur == null || data2.status_lembur == 0) ? ' ~' : data2.status_lembur} {(data2.jam_lembur == null || data2.jam_lembur == 0) ? '' : '~ ' + data2.jam_lembur + 'Jam'}
                                                                            </label>
                                                                            <div className='flex flex-col gap-1 col-span-2'>
                                                                                <label className="text-neutral-500 text-sm font-semibold ">
                                                                                    {data2.status_masuk}
                                                                                </label>
                                                                                <label className="text-neutral-500 text-sm font-semibold ">
                                                                                    {(data2.menit_terlambat == null || data2.menit_terlambat == 0) ? '~' : '~ ' + data2.menit_terlambat + ' Jam'}
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
                                                )}
                                            </>
                                        </ModalKosongan>
                                    )}
                                </div>
                            </div>
                        </>
                    ))}
            </div>
        </main>
    )
}

export default PayrollMinggu
