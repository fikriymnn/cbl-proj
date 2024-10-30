import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@mui/material';
import convertTimeStampToDate from '../../../../utils/converDateTime';
import ModalKosongan from '../../../Modals/Qc/NCR/NCRResponQC';
import ModalKosonganSmall from '../../../Modals/ModalKosonganSmall';

function MasterShiftHRD() {
    const [isMobile, setIsMobile] = useState(false);
    const kosong: any = [];
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const date = today.getDate();
    const currentDate = month + '/' + date + '/' + year;
    const navigate = useNavigate();
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

    const [cetakMesin, setCetakMesin] = useState<any>();

    useEffect(() => {
        getCetakMesin();
    }, []);

    async function getCetakMesin() {
        const url = `${import.meta.env.VITE_API_LINK}/master/shift`;
        try {
            const res = await axios.get(url, {

                withCredentials: true,
            });

            setCetakMesin(res.data);
            console.log(res.data);
        } catch (error: any) {
            console.log(error);
        }
    }

    const [showModal, setShowModal] = useState<any>([]);
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
    const [shift1MasukEdit, setShift1MasukEdit] = useState<any>();
    const [shift1KeluarEdit, setShift1KeluarEdit] = useState<any>();
    const [shift2MasukEdit, setShift2MasukEdit] = useState<any>();
    const [shift2KeluarEdit, setShift2KeluarEdit] = useState<any>();


    async function submitEDitMesin(hari: any) {
        const url = `${import.meta.env.VITE_API_LINK}/master/shift/${hari}`;

        try {
            const res = await axios.put(
                url,
                {
                    shift_1_masuk: shift1MasukEdit,
                    shift_1_keluar: shift1KeluarEdit,
                    shift_2_masuk: shift2MasukEdit,
                    shift_2_keluar: shift2KeluarEdit,

                },
                {
                    withCredentials: true,
                },
            );

            getCetakMesin()
            alert('Shift Berhasil Diperbaharui')
        } catch (error: any) {
            console.log(error);
            //alert(error.data.msg);
        }
    }
    return (
        <>

            <main className="overflow-x-scroll">
                <div className="min-w-[700px] bg-white rounded-xl">
                    <div className=" w-full h-full flex-col border-b-8 border-[#D8EAFF]">
                        <div className="grid grid-cols-12 px-10 py-4 border-b-8 border-[#D8EAFF] gap-2 ">
                            <label className="text-neutral-500 text-sm font-semibold ">
                                No
                            </label>

                            <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                Hari
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                Shift 1 Masuk
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                Shift 1 Keluar
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                Shift 2 Masuk
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                Shift 2 Keluar
                            </label>
                        </div>
                        <div className="w-2 h-full "></div>
                        {cetakMesin?.data.map((data: any, i: any) => {

                            return (
                                <>
                                    <div className="grid grid-cols-12 px-10 items-center border-b-8 border-[#D8EAFF] gap-2 ">
                                        <label className="text-neutral-500 text-sm font-semibold ">
                                            {i + 1}
                                        </label>

                                        <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                            {data.hari}
                                        </label>
                                        <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                            {data.shift_1_masuk}
                                        </label>
                                        <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                            {data.shift_1_keluar}
                                        </label>
                                        <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                            {data.shift_2_masuk}
                                        </label>
                                        <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                            {data.shift_2_keluar}
                                        </label>

                                        <div className=" flex ">
                                            <>

                                                <button
                                                    onClick={() => openModalModal(i)}
                                                    className={`uppercase px-3 inline-flex rounded-[3px] items-center text-white text-xs font-bold  py-2 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600  justify-center`} // Dynamic class assignment
                                                >
                                                    Edit
                                                </button>
                                                {showModal[i] == true && (
                                                    <>
                                                        <ModalKosonganSmall
                                                            isOpen={showModal[i]}
                                                            onClose={() => closeModalModal(i)}
                                                            judul={'Edit Shift'}>
                                                            <>
                                                                <div className="grid gap-3 w-full px-5 py-2">
                                                                    <label className="text-black text-sm font-bold">
                                                                        Hari : {data.hari}
                                                                    </label>

                                                                    <div className="flex w-full flex-col">
                                                                        <label className="text-black text-xs font-bold">
                                                                            Shift 1 Masuk
                                                                        </label>
                                                                        <div className="flex w-full">
                                                                            <input
                                                                                name="shift_1_masuk"
                                                                                defaultValue={data.shift_1_masuk}
                                                                                onChange={(e) => { setShift1MasukEdit(e.target.value) }}
                                                                                type="time"
                                                                                className=" w-[387px] h-10 border-2 border-stroke rounded-md"
                                                                            />
                                                                        </div>

                                                                    </div>
                                                                    <div className="flex w-full flex-col">
                                                                        <label className="text-black text-xs font-bold">
                                                                            Shift 1 Keluar
                                                                        </label>
                                                                        <div className="flex w-full">
                                                                            <input
                                                                                name="shift_1_keluar"
                                                                                defaultValue={data.shift_1_keluar}
                                                                                onChange={(e) => { setShift1KeluarEdit(e.target.value) }}
                                                                                type="time"
                                                                                className=" w-[387px] h-10 border-2 border-stroke rounded-md"
                                                                            />
                                                                        </div>

                                                                    </div>
                                                                    <div className="flex w-full flex-col">
                                                                        <label className="text-black text-xs font-bold">
                                                                            Shift 2 Masuk
                                                                        </label>
                                                                        <div className="flex w-full">
                                                                            <input
                                                                                name="shift_2_masuk"
                                                                                defaultValue={data.shift_2_masuk}
                                                                                onChange={(e) => { setShift2MasukEdit(e.target.value) }}
                                                                                type="time"
                                                                                className=" w-[387px] h-10 border-2 border-stroke rounded-md"
                                                                            />
                                                                        </div>

                                                                    </div>
                                                                    <div className="flex w-full flex-col">
                                                                        <label className="text-black text-xs font-bold">
                                                                            Shift 2 Keluar
                                                                        </label>
                                                                        <div className="flex w-full">
                                                                            <input
                                                                                name="shift_2_keluar"
                                                                                defaultValue={data.shift_2_keluar}
                                                                                onChange={(e) => { setShift2KeluarEdit(e.target.value) }}
                                                                                type="time"
                                                                                className=" w-[387px] h-10 border-2 border-stroke rounded-md"
                                                                            />
                                                                        </div>

                                                                    </div>
                                                                    <div className=" pt-3">
                                                                        <button
                                                                            onClick={() => submitEDitMesin(data.hari)}
                                                                            className="bg-[#0065DE] text-center text-white text-xs font-bold px-6 py-3 rounded-md"
                                                                        >
                                                                            SIMPAN
                                                                        </button>
                                                                    </div>


                                                                </div>
                                                            </>
                                                        </ModalKosonganSmall>
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

export default MasterShiftHRD;
