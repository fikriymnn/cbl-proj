import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ModalKosonganSmall from '../../../Modals/ModalKosonganSmall';



function HistoryPrepress() {
    const [isMobile, setIsMobile] = useState(false);
    const kosong: any = [];
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const date = today.getDate();
    const [Catatan, setCatatan] = useState<any>(null);
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

    const [pondMesin, setPondMesin] = useState<any>();

    useEffect(() => {
        getPondMesin();
    }, []);

    async function getPondMesin() {
        const url = `${import.meta.env.VITE_API_LINK
            }/qc/cs/inspeksiPrePress`;
        try {
            const res = await axios.get(url, {
                params: {
                    status: 'history',
                },
                withCredentials: true,
            });

            setPondMesin(res.data);
            console.log(res.data);
        } catch (error: any) {
            console.log(error.data.msg);
        }
    }

    async function checkKebutuhanPlate(
        id: number,
        catatan: any,
        hasil_check: any,
        index: number,
    ) {
        const url = `${import.meta.env.VITE_API_LINK
            }/qc/cs/inspeksiPrePress/check/${id}`;
        try {
            const res = await axios.put(
                url,
                {
                    hasil_check: hasil_check,
                    catatan: catatan,
                },
                {
                    withCredentials: true,
                },
            );

            setCatatan(null);
            getPondMesin();
            closeModalModal(index);
        } catch (error: any) {
            console.log(error.data.msg);
        }
    }

    function convertDatetimeToDate(datetime: any) {
        const dateObject = new Date(datetime);
        const day = dateObject.getDate().toString().padStart(2, '0'); // Ensure two-digit day
        const month = (dateObject.getMonth() + 1).toString().padStart(2, '0'); // Adjust for zero-based month
        const year = dateObject.getFullYear();
        const hours = dateObject.getHours().toString().padStart(2, '0');
        const minutes = dateObject.getMinutes().toString().padStart(2, '0');

        return `${year}/${month}/${day} `; // Example format (YYYY-MM-DD)
    }

    const tanggal = convertDatetimeToDate(new Date());

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
    return (
        <>
            {!isMobile && (
                <main className="overflow-x-scroll">
                    <div className="min-w-[700px] bg-white rounded-xl">
                        <div className=" w-full h-full flex-col border-b-8 border-[#D8EAFF]">
                            <div className="grid grid-cols-12 px-4 py-4 border-b-8 border-[#D8EAFF]  ">
                                <label className="text-neutral-500 text-sm font-semibold col-span-2 ">
                                    No. JO
                                </label>

                                <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                    No. IO
                                </label>
                                <label className="text-neutral-500 text-sm font-semibold ">
                                    Status JO
                                </label>
                                <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                    Produk
                                </label>
                                <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                    Customer
                                </label>
                                <label className="text-neutral-500 text-sm font-semibold">
                                    Mesin
                                </label>
                                <label className="text-neutral-500 text-sm font-semibold">
                                    Total Warna
                                </label>
                                <label className="text-neutral-500 text-sm font-semibold">
                                    Inspector
                                </label>
                            </div>
                            <div className="w-2 h-full "></div>
                            {pondMesin != null &&
                                pondMesin.data?.map((data: any, i: any) => (
                                    <>
                                        <div className="grid grid-cols-12 border-b-8 border-[#D8EAFF] gap-2 items-center">
                                            <div
                                                className={`w-full h-full sticky left-0 z-20   col-span-2 gap-4 flex items-center my-3`}
                                            >
                                                <div
                                                    className={`w-2 h-full sticky left-0 z-20 bg-green-600  `}
                                                ></div>
                                                <label className="text-neutral-500 text-sm font-semibold ">
                                                    {data.no_jo}
                                                </label>
                                            </div>

                                            <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                                {data.no_io}
                                            </label>
                                            <label className="text-neutral-500 text-sm font-semibold ">
                                                {data.status_jo}
                                            </label>
                                            <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                                {data.nama_produk}
                                            </label>
                                            <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                                {data.customer}
                                            </label>
                                            <label className="text-neutral-500 text-sm font-semibold ">
                                                {data.mesin}
                                            </label>
                                            <label className="text-neutral-500 text-sm font-semibold ">
                                                {data.total_warna}
                                            </label>
                                            <label className="text-neutral-500 text-sm font-semibold ">
                                                {data.inspektor?.nama}
                                            </label>
                                        </div>
                                    </>
                                ))}
                        </div>
                    </div>
                </main>
            )}
        </>
    );
}

export default HistoryPrepress;
