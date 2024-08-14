import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@mui/material';
import JenisCetak from '../../../../../pages/QualityControl/ProsesCetak/JenisCetak';
import convertTimeStampToDateOnly from '../../../../../utils/convertDateOnly';

function JenisPondMesin() {
    const { id } = useParams();
    const [isMobile, setIsMobile] = useState(false);
    const kosong: any = []
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const date = today.getDate();
    const currentDate = month + "/" + date + "/" + year;
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
        getpondMesin();
    }, []);

    async function getpondMesin() {
        const url = `${import.meta.env.VITE_API_LINK}/qc/cs/inspeksipond/${id}`;
        try {
            const res = await axios.get(url, {
                withCredentials: true,
            });

            setPondMesin(res.data);
            console.log(res.data);
        } catch (error: any) {
            console.log(error.data.msg);
        }
    }


    const tanggal = convertTimeStampToDateOnly(pondMesin?.data.tanggal);


    return (
        <>
            {!isMobile && (
                <main className="overflow-x-scroll">
                    <div className="min-w-[700px] bg-white rounded-xl">
                        <p className="text-[14px] font-semibold w-full  border-b-8 border-[#D8EAFF] py-4 px-9 md:ps-9 ps-12">
                            {tanggal}
                        </p>
                        <div className=" w-full h-full flex-col border-b-8 border-[#D8EAFF]">
                            <div className="grid grid-cols-10 px-10 py-4 border-b-8 border-[#D8EAFF] gap-2 ">
                                <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                    MESIN
                                </label>
                            </div>
                            <div className="w-2 h-full "></div>

                            {pondMesin?.data?.inspeksi_pond_awal.length > 0 ? (
                                <div className="flex  border-b-8 border-[#D8EAFF] gap-7 items-center">
                                    <div className="flex items-center gap-7 w-full">
                                        <div
                                            className={`w-2 h-full sticky left-0 z-20 ${pondMesin?.data?.inspeksi_pond_awal[0].status ==
                                                'incoming'
                                                ? 'bg-red-500'
                                                : 'bg-green-500'
                                                }  gap-8 py-7 `}
                                        ></div>

                                        <label className="text-neutral-500 text-sm font-semibold flex ">
                                            PENGECEKAN AWAL
                                        </label>
                                    </div>

                                    <div className="justify-end flex pr-2 w-full ">
                                        <Link
                                            to={`/qc/qualityinspection/pond/jenispond/checkawal/${id}`}
                                        >
                                            <button
                                                className={`uppercase px-14 inline-flex rounded-[3px] items-center text-white text-xs font-bold  py-2 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600  justify-center`} // Dynamic class assignment
                                            >
                                                PILIH
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            ) : null}

                            {pondMesin?.data?.inspeksi_pond_periode.length > 0 ? (
                                <div className="flex  border-b-8 border-[#D8EAFF] gap-7 items-center">
                                    <div className="flex items-center gap-7 w-full">
                                        <div
                                            className={`w-2 h-full sticky left-0 z-20 ${pondMesin?.data?.inspeksi_pond_periode[0].status ==
                                                'incoming'
                                                ? 'bg-red-500'
                                                : 'bg-green-500'
                                                }  gap-8 py-7 `}
                                        ></div>

                                        <label className="text-neutral-500 text-sm font-semibold flex ">
                                            CEK PERIODE
                                        </label>
                                    </div>

                                    <div className="justify-end flex pr-2 w-full ">
                                        <Link
                                            to={`/qc/qualityinspection/pond/jenispond/checkperiode/${id}`}
                                        >
                                            <button
                                                className={`uppercase px-14 inline-flex rounded-[3px] items-center text-white text-xs font-bold  py-2 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600  justify-center`} // Dynamic class assignment
                                            >
                                                PILIH
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </main>
            )}
        </>
    )
}

export default JenisPondMesin