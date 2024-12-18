import React, { useEffect, useState } from 'react'
import Loading from '../../../Loading';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ModalKosongan from '../../../Modals/Qc/NCR/NCRResponQC';
import convertTimeStampToDateTime from '../../../../utils/converDateTime';
import convertTimeStampToDate from '../../../../utils/convertDate';

function PayrollBulanan() {
    const [isLoading, setIsLoading] = useState(false);
    const [payWeek, setPayWeek] = useState<any>();

    const [dateFrom, setDateFrom] = useState<any>();
    const [dateTo, setDateTo] = useState<any>();
    const [idKaryawan, setIdKaryawan] = useState<any>();



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

                                                    <div className='flex flex-col gap-1 py-4'>
                                                        <div className='flex flex-col'>
                                                            <p className="my-auto text-sm text-neutral-400 font-semibold ">
                                                                {data.name} - {data.biodata_karyawan[0]?.nik}
                                                            </p>

                                                        </div>
                                                        <div className='flex flex-col'>
                                                            <p className="my-auto text-sm text-primary font-semibold ">
                                                                Payroll Bulanan
                                                            </p>
                                                            <div className='flex gap-3'>

                                                                <button
                                                                    disabled={isLoading}
                                                                    onClick={() => {
                                                                        getPayrollMingguan(dateFrom, dateTo, data.biodata_karyawan[0]?.id_karyawan)
                                                                    }}
                                                                    className="bg-primary text-white px-5 py-2 rounded-md my-auto "
                                                                >
                                                                    {isLoading ? 'Loading...' : 'BAYAR'}
                                                                </button>

                                                            </div>
                                                        </div>
                                                    </div>


                                                </>
                                            </ModalKosongan>
                                        )}

                                    </div>

                                </div >
                            </>
                        ))}
                </div >
            </div >
        </main >
    )
}

export default PayrollBulanan
