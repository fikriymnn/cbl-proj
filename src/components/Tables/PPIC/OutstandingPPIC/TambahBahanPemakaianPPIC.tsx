
import { useEffect, useState } from 'react';
// import Gambar from '../../images/BACKGROUND.png';
import Logo from '../../images/logo/logo-cbl 1.svg';

import axios from 'axios';
import ModalKosonganSmall from '../../../Modals/ModalKosonganSmall';



const TambahBahanPemakaianPPIC = () => {
    const [isMobile, setIsMobile] = useState(false);
    const handleResize = () => {
        setIsMobile(window.innerWidth < 768); // Adjust the breakpoint as needed
    };
    useEffect(() => {
        handleResize();

        // Event listener for window resize
        window.addEventListener('resize', handleResize);

        // Cleanup on component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const [tambahBahan, settambahBahan] = useState<any>();

    useEffect(() => {

        getTambahBahanQC();
    }, []);

    async function getTambahBahanQC() {
        const url = `${import.meta.env.VITE_API_LINK_P1}/api/list-tambah-bahan-ppic`;
        try {
            const res = await axios.get(url, {
                params: {
                    status: 'pemakaian',
                },
            });

            settambahBahan(res.data);
            console.log(res.data);
        } catch (error: any) {
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

    return (
        <main>
            <div className="rounded-xl border border-stroke bg-white pt-4 shadow-default dark:border-strokedark dark:bg-boxdark  xl:pb-1">
                <>
                    <div className="flex flex-col">

                        <div
                            className='grid grid-cols-12 border-b border-stroke dark:border-strokedark px-[2%]'


                        >
                            <div className="flex w-[80px]  gap-4  ">

                                <p className="  hidden text-[14px] text-slate-600 font-semibold dark:text-white sm:block">
                                    No
                                </p>
                            </div>

                            <div className="flex  col-span-2">
                                <p className="text-slate-600 text-[14px] font-semibold dark:text-white">No.JO</p>
                            </div>
                            <div className="flex  col-span-3">
                                <p className="text-slate-600 text-[14px] font-semibold dark:text-white">Item</p>
                            </div>
                            <div className="flex ">
                                <p className="text-slate-600 text-[14px] font-semibold dark:text-white">Operator</p>
                            </div>
                            <div className="flex  col-span-3">
                                <p className="text-slate-600 text-[14px] font-semibold dark:text-white">Kertas</p>
                            </div>
                            <div className="flex ">
                                <p className="text-slate-600 text-[14px] font-semibold dark:text-white">Qty</p>
                            </div>
                        </div>
                        {tambahBahan != null &&
                            tambahBahan?.data?.map((data: any, i: number) => {
                                return (
                                    <>
                                        <div
                                            className='grid grid-cols-12 border-b border-stroke dark:border-strokedark px-[2%] py-1'

                                            key={i}
                                        >
                                            <div className="flex w-[80px]  gap-4  ">

                                                <p className="  hidden text-[14px] text-slate-600  dark:text-white sm:block">
                                                    {i + 1}
                                                </p>
                                            </div>

                                            <div className="flex  col-span-2">
                                                <p className="text-slate-600 text-[14px]   dark:text-white">{data.nomor_jo}</p>
                                            </div>
                                            <div className="flex  col-span-3">
                                                <p className="text-slate-600 text-[14px]   dark:text-white">{data.i_item_kertas}</p>
                                            </div>
                                            <div className="flex  ">
                                                <p className="text-slate-600 text-[14px]   dark:text-white">{data.operator}</p>
                                            </div>
                                            <div className="flex  col-span-3">
                                                <p className="text-slate-600 text-[14px]   dark:text-white">{data.kertas}</p>
                                            </div>
                                            <div className="flex  ">
                                                <p className="text-slate-600 text-[14px]   dark:text-white">{data.qty_tambah_bahan}</p>
                                            </div>
                                            <div className="flex  justify-end gap-2">

                                                <button onClick={() => openEdit(i)} className='bg-blue-600 rounded-sm text-white text-xs font-bold px-4 py-1'>
                                                    Detail
                                                </button>
                                                {showEdit[i] == true && (

                                                    <ModalKosonganSmall
                                                        isOpen={showEdit[i]}
                                                        onClose={() => closeEdit(i)}
                                                        judul={'Detail History Tambah Bahan Pemakaian'}
                                                    >
                                                        <>
                                                            <div className="flex flex-col   gap-3 w-full px-5 py-2">
                                                                <>
                                                                    <div
                                                                        className='grid grid-cols-3   py-1'

                                                                        key={i}
                                                                    >
                                                                        <div>
                                                                            <div className="flex  ">
                                                                                <p className="text-slate-600 text-[14px]  text-center dark:text-white">Nomor JO</p>
                                                                            </div>
                                                                            <div className="flex ">
                                                                                <p className="text-slate-600 text-[14px]  text-center dark:text-white">Item</p>
                                                                            </div>
                                                                            <div className="flex  ">
                                                                                <p className="text-slate-600 text-[14px]  text-center dark:text-white">Operator</p>
                                                                            </div>
                                                                            <div className="flex ">
                                                                                <p className="text-slate-600 text-[14px]  text-center dark:text-white">Kertas</p>
                                                                            </div>
                                                                            <div className="flex  ">
                                                                                <p className="text-slate-600 text-[14px]  text-center dark:text-white">Qty</p>
                                                                            </div>
                                                                            <div className="flex  ">
                                                                                <p className="text-slate-600 text-[14px]  text-center dark:text-white">Notes</p>
                                                                            </div>
                                                                            <div className="flex  ">
                                                                                <p className="text-slate-600 text-[14px]  text-center dark:text-white">Kendala</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className='col-span-2'>
                                                                            <div className="flex  ">
                                                                                <p className="text-slate-600 text-[14px]  text-center dark:text-white">: {data.nomor_jo}</p>
                                                                            </div>
                                                                            <div className="flex ">
                                                                                <p className="text-slate-600 text-[14px]  text-center dark:text-white">: {data.i_item_kertas}</p>
                                                                            </div>
                                                                            <div className="flex  ">
                                                                                <p className="text-slate-600 text-[14px]  text-center dark:text-white">: {data.operator}</p>
                                                                            </div>
                                                                            <div className="flex ">
                                                                                <p className="text-slate-600 text-[14px]  text-center dark:text-white">: {data.kertas}</p>
                                                                            </div>
                                                                            <div className="flex  ">
                                                                                <p className="text-slate-600 text-[14px]  text-center dark:text-white">: {data.qty_tambah_bahan}</p>
                                                                            </div>
                                                                            <div className="flex  ">
                                                                                <p className="text-slate-600 text-[14px]  text-center dark:text-white">: {data.notes}</p>
                                                                            </div>
                                                                            <div className="flex flex-col ">
                                                                                {data.kendala?.map((data2: any, ii: any) => (
                                                                                    <div key={ii} className='flex flex-col gap-1'>
                                                                                        <p className="text-slate-600 text-[14px]   dark:text-white">- {data2.kode_kendala} ~ {data2.nama_kendala} ~ Dengan QTY {data2.qty_kendala}</p>

                                                                                    </div>
                                                                                ))}


                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex w-full flex-col">
                                                                        <label className="text-black text-xs font-bold">
                                                                            Quantity Approve QC
                                                                        </label>
                                                                        <div className="flex w-full">
                                                                            <input
                                                                                readOnly
                                                                                value={data.qty_tambah_bahan_approve_qc}
                                                                                name="qty"

                                                                                type="text"
                                                                                className=" w-full h-8 border-2 border-stroke rounded-md"
                                                                            />
                                                                        </div>

                                                                    </div>
                                                                    <div className="flex w-full flex-col">
                                                                        <label className="text-black text-xs font-bold">
                                                                            Quantity Approve RM
                                                                        </label>
                                                                        <div className="flex w-full">
                                                                            <input
                                                                                readOnly
                                                                                value={data.qty_tambah_bahan_approve_rm}
                                                                                name="qty"

                                                                                type="text"
                                                                                className=" w-full h-8 border-2 border-stroke rounded-md"
                                                                            />
                                                                        </div>

                                                                    </div>
                                                                    <div className="flex w-full flex-col">
                                                                        <label className="text-black text-xs font-bold">
                                                                            Note QC
                                                                        </label>
                                                                        <div className="flex w-full">
                                                                            <input
                                                                                name="note"
                                                                                readOnly
                                                                                value={data.notes_qc}
                                                                                type="text"
                                                                                className=" w-full h-8 border-2 border-stroke rounded-md"
                                                                            />
                                                                        </div>

                                                                    </div>
                                                                    <div className="flex w-full gap-2">

                                                                        {data.approve_qc == 1 ? <>
                                                                            <label className="text-green-500 text-xs font-bold">
                                                                                APPROVE QC
                                                                            </label>
                                                                        </> : <>
                                                                            <label className="text-red-500 text-xs font-bold">
                                                                                REJECT QC
                                                                            </label>
                                                                        </>}
                                                                        {data.approve_rm == 1 ? <>
                                                                            <label className="text-green-500 text-xs font-bold">
                                                                                APPROVE RM
                                                                            </label>
                                                                        </> : <>
                                                                            <label className="text-red-500 text-xs font-bold">
                                                                                REJECT RM
                                                                            </label>
                                                                        </>}
                                                                    </div>

                                                                </>
                                                            </div>

                                                        </>
                                                    </ModalKosonganSmall>
                                                )}

                                            </div>
                                        </div>
                                    </>
                                );
                            })}

                    </div>
                </>


            </div>
        </main>
    );
};

export default TambahBahanPemakaianPPIC;
