
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

    useEffect(() => {

        getTambahBahanQC();
    }, []);

    async function getTambahBahanQC() {
        const url = `${import.meta.env.VITE_API_LINK_P1}/api/list-tambah-bahan-qc`;
        try {
            const res = await axios.get(url);

            settambahBahan(res.data);
            console.log(res.data);
        } catch (error: any) {
            console.log(error.data.msg);
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


    async function submitEDitMesin(id: any) {
        const url = `${import.meta.env.VITE_API_LINK_P1}/api/approve-tambah-bahan-qc/${id}`;

        try {
            const res = await axios.put(
                url,
                {
                    status_approve: statusApprove,
                    qty: qty
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
                            <p className="text-slate-600 text-[14px] font-semibold text-center dark:text-white">No.JO</p>
                        </div>
                        <div className="flex  col-span-3">
                            <p className="text-slate-600 text-[14px] font-semibold text-center dark:text-white">Item</p>
                        </div>
                        <div className="flex  col-span-4">
                            <p className="text-slate-600 text-[14px] font-semibold text-center dark:text-white">Kertas</p>
                        </div>
                        <div className="flex ">
                            <p className="text-slate-600 text-[14px] font-semibold text-center dark:text-white">Qty</p>
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
                                            <p className="text-slate-600 text-[14px]  text-center dark:text-white">{data.nomor_jo}</p>
                                        </div>
                                        <div className="flex  col-span-3">
                                            <p className="text-slate-600 text-[14px]  text-center dark:text-white">{data.i_item_kertas}</p>
                                        </div>
                                        <div className="flex  col-span-4">
                                            <p className="text-slate-600 text-[14px]  text-center dark:text-white">{data.kertas}</p>
                                        </div>
                                        <div className="flex  ">
                                            <p className="text-slate-600 text-[14px]  text-center dark:text-white">{data.qty_tambah_bahan}</p>
                                        </div>

                                        <div className="flex  justify-end gap-2">
                                            <button onClick={() => openEdit(i)} className='bg-blue-600 rounded-sm text-white text-xs font-bold px-4 py-1'>
                                                Respon
                                            </button>
                                            {showEdit[i] == true && (

                                                <ModalKosonganSmall
                                                    isOpen={showEdit[i]}
                                                    onClose={() => closeEdit(i)}
                                                    judul={'Respon Tambah Bahan'}
                                                >
                                                    <>
                                                        <div className="grid   gap-3 w-full px-5 py-2">
                                                            <>

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

                                                                    <div className=''>
                                                                        <input
                                                                            onChange={(e) => {

                                                                                setstatusApprove(e.target.value)
                                                                            }}
                                                                            type="radio" id="sspoint1" name="sspoint1" value="1" />
                                                                        <label className='pl-2 text-xl text-black   '>Sesuai</label>
                                                                    </div>
                                                                    <div>
                                                                        <input
                                                                            onChange={(e) => {

                                                                                setstatusApprove(e.target.value)
                                                                            }}
                                                                            type="radio" id="ssspoint1" name="sspoint1" value="0" />
                                                                        <label className='pl-2 text-xl text-black'>Tidak Sesuai</label>
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

                                        </div>
                                    </div>
                                </>
                            );
                        })}

                </div>
            </>


        </div>
    );
};

export default TambahBahanQC;
