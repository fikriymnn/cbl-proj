
import { useEffect, useState } from 'react';
// import Gambar from '../../images/BACKGROUND.png';
import Logo from '../../images/logo/logo-cbl 1.svg';

import axios from 'axios';
import ModalKosonganSmall from '../../../Modals/ModalKosonganSmall';



const TambahBahanQC = () => {
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
    const [statusTiket, setStatusTiket] = useState<any>('persiapan');

    useEffect(() => {

        getTambahBahanQC();
    }, []);

    async function getTambahBahanQC() {
        const url = `${import.meta.env.VITE_API_LINK_P1}/api/list-tambah-bahan-qc`;
        try {

            const res = await axios.get(url, {
                params: {
                    status: statusTiket,
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

    const [statusApprove, setstatusApprove] = useState<any>();
    const [qty, setqty] = useState<any>();
    const [noteQC, setnoteQC] = useState<any>();

    async function submitEDitMesin(id: any) {
        const url = `${import.meta.env.VITE_API_LINK_P1}/api/approve-tambah-bahan-qc/${id}`;

        try {
            const res = await axios.put(
                url,
                {
                    status_approve: statusApprove,
                    qty: qty,
                    notes_qc: noteQC

                },
            );

            getTambahBahanQC()
            alert("Succes");
            closeEdit(id)
            setstatusApprove(null)
            setqty(null)
        } catch (error: any) {
            console.log(error);
            //alert(error.data.msg);
        }
    }

    return (
        <main>
            <div className="rounded-xl border-b-8 bg-white border-[#D8EAFF] px-[1%] py-[1%] gap-2 flex">
                <select
                    name='status tiket'
                    onChange={(e) => setStatusTiket(e.target.value)}
                    className={`relative z-20  bg-[#D8EAFF]  appearance-none rounded-md h-7 py-1 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input  
                                    }`}
                >
                    <option selected disabled className="text-[#646464] text-xs dark:text-bodydark">
                        PILIH STATUS TIKET
                    </option>

                    <option value={'persiapan'} className="text-[#646464] text-xs dark:text-bodydark">
                        Incoming
                    </option>
                    <option value={'history_persiapan'} className="text-[#646464] text-xs dark:text-bodydark">
                        History
                    </option>
                </select>
                <button
                    onClick={() => {
                        getTambahBahanQC()
                    }}
                    className="bg-primary text-white py-1 rounded-md my-auto px-1"
                >
                    Tampilkan
                </button>
            </div>

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
                                <p className="text-slate-600 text-[14px] font-semibold  dark:text-white">No.JO</p>
                            </div>
                            <div className="flex  col-span-3">
                                <p className="text-slate-600 text-[14px] font-semibold  dark:text-white">Item</p>
                            </div>
                            <div className="flex ">
                                <p className="text-slate-600 text-[14px] font-semibold  dark:text-white">Operator</p>
                            </div>
                            <div className="flex  col-span-3">
                                <p className="text-slate-600 text-[14px] font-semibold  dark:text-white">Kertas</p>
                            </div>
                            <div className="flex ">
                                <p className="text-slate-600 text-[14px] font-semibold  dark:text-white">Qty</p>
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
                                                {data.approve_qc == null ?
                                                    <>
                                                        <button onClick={() => openEdit(i)} className='bg-blue-600 rounded-sm text-white text-xs font-bold px-4 py-1'>
                                                            Respon
                                                        </button>
                                                        {showEdit[i] == true && (

                                                            <ModalKosonganSmall
                                                                isOpen={showEdit[i]}
                                                                onClose={() => closeEdit(i)}
                                                                judul={'Respon Tambah Bahan Persiapan'}
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

                                                                                </div>
                                                                            </div>
                                                                            <div className="flex w-full flex-col">
                                                                                <label className="text-black text-xs font-bold">
                                                                                    Quantity
                                                                                </label>
                                                                                <div className="flex w-full">
                                                                                    <input
                                                                                        name="qty"
                                                                                        onChange={(e) => { setqty(e.target.value) }}
                                                                                        type="text"
                                                                                        className=" w-full h-8 border-2 border-stroke rounded-md"
                                                                                    />
                                                                                </div>

                                                                            </div>
                                                                            <div className="flex w-full flex-col">
                                                                                <label className="text-black text-xs font-bold">
                                                                                    Note
                                                                                </label>
                                                                                <div className="flex w-full">
                                                                                    <input
                                                                                        name="note"
                                                                                        onChange={(e) => { setnoteQC(e.target.value) }}
                                                                                        type="text"
                                                                                        className=" w-full h-8 border-2 border-stroke rounded-md"
                                                                                    />
                                                                                </div>

                                                                            </div>
                                                                            <div className="flex w-full flex-col">

                                                                                <div className=''>
                                                                                    <input
                                                                                        onChange={(e) => {

                                                                                            setstatusApprove(e.target.value)
                                                                                        }}
                                                                                        type="radio" id="sspoint1" name="sspoint1" value="1" />
                                                                                    <label className='pl-2 text-xl text-black   '>Approve</label>
                                                                                </div>
                                                                                <div>
                                                                                    <input
                                                                                        onChange={(e) => {

                                                                                            setstatusApprove(e.target.value)
                                                                                        }}
                                                                                        type="radio" id="ssspoint1" name="sspoint1" value="0" />
                                                                                    <label className='pl-2 text-xl text-black'>Reject</label>
                                                                                </div>

                                                                            </div>

                                                                        </>
                                                                    </div>
                                                                    <div className=" flex w-full px-2 py-2">
                                                                        <button
                                                                            onClick={() => submitEDitMesin(data.i_id)}
                                                                            className="bg-[#0065DE] w-full h-8 text-center text-white text-xs font-bold  rounded-md"
                                                                        >
                                                                            Respon
                                                                        </button>
                                                                    </div>
                                                                </>
                                                            </ModalKosonganSmall>
                                                        )}
                                                    </>
                                                    :
                                                    <>
                                                        <button onClick={() => openEdit(i)} className='bg-blue-600 rounded-sm text-white text-xs font-bold px-4 py-1'>
                                                            Detail
                                                        </button>
                                                        {showEdit[i] == true && (

                                                            <ModalKosonganSmall
                                                                isOpen={showEdit[i]}
                                                                onClose={() => closeEdit(i)}
                                                                judul={'Detail History Tambah Bahan Persiapan'}
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

                                                                                </div>
                                                                            </div>
                                                                            <div className="flex w-full flex-col">
                                                                                <label className="text-black text-xs font-bold">
                                                                                    Quantity
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
                                                                                    Note
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
                                                                            <div className="flex w-full flex-col">

                                                                                {data.approve_qc == 1 ? <>
                                                                                    <label className="text-green-500 text-xs font-bold">
                                                                                        APPROVE
                                                                                    </label>
                                                                                </> : <>
                                                                                    <label className="text-red-500 text-xs font-bold">
                                                                                        REJECT
                                                                                    </label>
                                                                                </>}

                                                                            </div>

                                                                        </>
                                                                    </div>

                                                                </>
                                                            </ModalKosonganSmall>
                                                        )}
                                                    </>}


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

export default TambahBahanQC;
