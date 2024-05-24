import { useEffect, useState } from 'react';

import axios from 'axios';
import { useParams } from 'react-router-dom';

const PM2TambahInspection = () => {
    const { id } = useParams();
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

    const [mesin, setMesin] = useState<any>();
    useEffect(() => {
        getMesin();
    }, []);
    async function getMesin() {
        const url = `${import.meta.env.VITE_API_LINK}/master/mesin/${id}`;
        try {
            const res = await axios.get(url, {
                withCredentials: true,
            });

            setMesin(res.data);
            console.log(res.data);
        } catch (error: any) {
            console.log(error.data.msg);
        }
    }

    const [pointPm1, setPointPm1] = useState([
        {
            inspection_point: '',
            sub_inspection: [
                {
                    task: '',
                    acceptance_criteria: '',
                    method: '',
                    tools: '',
                },
            ],
        },
    ]);

    //add Point
    const handleAddPoint = () => {
        setPointPm1([
            ...pointPm1,
            {
                inspection_point: '',
                sub_inspection: [
                    {
                        task: '',
                        acceptance_criteria: '',
                        method: '',
                        tools: '',
                    },
                ],
            },
        ]);
    };

    //add Point Task
    const handleAddPointTask = (i: any) => {
        const onchangeVal = [...pointPm1];
        onchangeVal[i]['sub_inspection'].push({
            task: '',
            acceptance_criteria: '',
            method: '',
            tools: '',
        });
        setPointPm1(onchangeVal);
    };

    //change value point pm1
    const handleChangePoint = (e: any, i: number) => {
        const { name, value } = e.target;
        const onchangeVal: any = [...pointPm1];
        onchangeVal[i][name] = value;
        setPointPm1(onchangeVal);
    };

    //change value point Task pm1
    const handleChangePointTask = (e: any, i: number, ii: number) => {
        const { name, value } = e.target;
        const onchangeVal: any = [...pointPm1];
        onchangeVal[i]['sub_inspection'][ii][name] = value;
        setPointPm1(onchangeVal);
    };

    //delete Point pm1
    const handleDeletePoint = (i: number) => {
        const deleteVal: any = [...pointPm1];
        deleteVal.splice(i, 1);
        setPointPm1(deleteVal);
    };

    //delete Point task pm1
    const handleDeletePointTask = (i: number, ii: number) => {
        const deleteVal: any = [...pointPm1];
        deleteVal[i]['sub_inspection'].splice(ii, 1);
        setPointPm1(deleteVal);
    };

    async function submitPointPm1() {
        const url = `${import.meta.env.VITE_API_LINK}/master/pointPm2`;

        try {
            const res = await axios.post(
                url,
                {
                    id_mesin: mesin.id,
                    nama_mesin: mesin.nama_mesin,
                    inspection_point: pointPm1,
                },
                {
                    withCredentials: true,
                },
            );

            alert(res.data.msg);
        } catch (error: any) {
            console.log(error);
            //alert(error.data.msg);
        }
    }

    return (
        <div>
            {!isMobile && (
                <>
                    <div className="rounded-xl border border-stroke bg-white pt-4 shadow-default dark:border-strokedark dark:bg-boxdark  xl:pb-1">
                        <div className="flex w-full  gap-2 pr-8 border-b-6 border-[#D8EAFF] px-4 pb-5">
                            <div className="flex flex-col w-11/12">
                                <label className="text-neutral-500 text-sm font-semibold">
                                    Machine Details
                                </label>
                                <label className="text-neutral-500 text-sm font-semibold">
                                    Nama Mesin : {mesin != null && mesin.nama_mesin}
                                </label>
                            </div>
                        </div>

                        <div className="flex py-4 flex-col">
                            {pointPm1.map((data: any, i: number) => {
                                return (
                                    <>
                                        <div className="flex flex-row gap-4 px-4">
                                            <label className="text-black text-xs font-bold">
                                                POINT
                                            </label>
                                            <label className="text-black text-xs font-bold">
                                                INSPECTION POINT
                                            </label>
                                        </div>
                                        <div className="flex w-full flex-row gap-4 pt-3 px-4">
                                            <div className="flex w-[40px] justify-center">
                                                <label className="text-neutral-500 text-sm font-semibold">
                                                    {i + 1}
                                                </label>
                                            </div>
                                            <div className="flex w-10/12">
                                                <input
                                                    name="inspection_point"
                                                    value={data.inspection_point}
                                                    onChange={(e) => handleChangePoint(e, i)}
                                                    type="text"
                                                    className=" w-[387px] h-10 border-2 border-stroke rounded-md"
                                                />
                                            </div>
                                            <div className="flex w-3/12">
                                                <button
                                                    onClick={() => handleDeletePoint(i)}
                                                    className="bg-[#DE0000] text-center text-white text-xs font-bold px-8 py-2 rounded-md"
                                                >
                                                    HAPUS INSPECTION POINT
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex w-full  pt-6 border-b border-stroke ml-[70px]">
                                            <label className="text-black text-xs font-bold">
                                                TASK LIST
                                            </label>
                                        </div>

                                        {data.sub_inspection.map((task: any, ii: number) => {
                                            return (
                                                <>
                                                    <div className="flex w-full  pt-4 border-b border-stroke ml-[70px] pb-4">
                                                        <div className="flex w-[60px] justify-center">
                                                            <label className="text-black text-xs font-bold">
                                                                {ii + 1}
                                                            </label>
                                                        </div>
                                                        <div className="flex w-5/12 justify-start pl-6 flex-col gap-2">
                                                            <label className="text-black text-xs font-bold">
                                                                TASK
                                                            </label>
                                                            <input
                                                                name="task"
                                                                value={task.task}
                                                                onChange={(e) =>
                                                                    handleChangePointTask(e, i, ii)
                                                                }
                                                                type="text"
                                                                className=" w-full h-12 border-2 border-stroke rounded-md"
                                                            />
                                                            <label className="text-black text-xs font-bold pt-2">
                                                                INSPECTION METHOD
                                                            </label>
                                                            <input
                                                                name="method"
                                                                value={task.method}
                                                                onChange={(e) =>
                                                                    handleChangePointTask(e, i, ii)
                                                                }
                                                                type="text"
                                                                className=" w-full h-12 border-2 border-stroke rounded-md"
                                                            />
                                                        </div>
                                                        <div className="flex w-5/12 justify-start pl-6 flex-col gap-2">
                                                            <label className="text-black text-xs font-bold text-start">
                                                                ACCEPTANCE CRITERIA
                                                            </label>
                                                            <input
                                                                name="acceptance_criteria"
                                                                value={task.acceptance_criteria}
                                                                onChange={(e) =>
                                                                    handleChangePointTask(e, i, ii)
                                                                }
                                                                type="text"
                                                                className=" w-full h-12 border-2 border-stroke rounded-md"
                                                            />
                                                            <label className="text-black text-xs font-bold pt-2">
                                                                TOOLS
                                                            </label>
                                                            <input
                                                                name="tools"
                                                                value={task.tools}
                                                                onChange={(e) =>
                                                                    handleChangePointTask(e, i, ii)
                                                                }
                                                                type="text"
                                                                className=" w-full h-12 border-2 border-stroke rounded-md"
                                                            />
                                                        </div>
                                                        <div className="flex w-1/12 pl-3 h-10 pt-5">
                                                            <button
                                                                onClick={() => handleDeletePointTask(i, ii)}
                                                                className="bg-[#DE0000] w-8 h-[143px] rounded-md justify-center items-center"
                                                            >
                                                                <svg
                                                                    className="w-full"
                                                                    width="24"
                                                                    height="21"
                                                                    viewBox="0 0 24 21"
                                                                    fill="none"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                >
                                                                    <path
                                                                        d="M10 13.8213L10 10.8213"
                                                                        stroke="white"
                                                                        stroke-width="2"
                                                                        stroke-linecap="round"
                                                                    />
                                                                    <path
                                                                        d="M14 13.8213L14 10.8213"
                                                                        stroke="white"
                                                                        stroke-width="2"
                                                                        stroke-linecap="round"
                                                                    />
                                                                    <path
                                                                        d="M3 5.82129H21V5.82129C20.0681 5.82129 19.6022 5.82129 19.2346 5.97353C18.7446 6.17652 18.3552 6.56587 18.1522 7.05592C18 7.42346 18 7.88941 18 8.82129V14.8213C18 16.7069 18 17.6497 17.4142 18.2355C16.8284 18.8213 15.8856 18.8213 14 18.8213H10C8.11438 18.8213 7.17157 18.8213 6.58579 18.2355C6 17.6497 6 16.7069 6 14.8213V8.82129C6 7.88941 6 7.42346 5.84776 7.05592C5.64477 6.56587 5.25542 6.17652 4.76537 5.97353C4.39782 5.82129 3.93188 5.82129 3 5.82129V5.82129Z"
                                                                        stroke="white"
                                                                        stroke-width="2"
                                                                        stroke-linecap="round"
                                                                    />
                                                                    <path
                                                                        d="M10.0681 2.19188C10.1821 2.08556 10.4332 1.99162 10.7825 1.92461C11.1318 1.85761 11.5597 1.82129 12 1.82129C12.4403 1.82129 12.8682 1.85761 13.2175 1.92461C13.5668 1.99162 13.8179 2.08556 13.9319 2.19188"
                                                                        stroke="white"
                                                                        stroke-width="2"
                                                                        stroke-linecap="round"
                                                                    />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </>
                                            );
                                        })}

                                        <div className="flex w-full px-6 py-3 justify-end">
                                            <button
                                                onClick={() => handleAddPointTask(i)}
                                                className="bg-[#0065DE] text-center text-white text-xs font-bold px-6 py-3 rounded-md"
                                            >
                                                + TASK LIST
                                            </button>
                                        </div>
                                    </>
                                );
                            })}
                        </div>
                    </div>
                    <div className="flex w-full justify-between px-6 py-6">
                        <button
                            onClick={handleAddPoint}
                            className="bg-[#0065DE] text-center text-white text-xs font-bold px-6 py-3 rounded-md"
                        >
                            + INSPECTION POINT
                        </button>
                        <button
                            onClick={submitPointPm1}
                            className="bg-[#0065DE] text-center text-white text-xs font-bold px-6 py-3 rounded-md"
                        >
                            SUBMIT
                        </button>
                    </div>


                </>
            )}

            {/* {JSON.stringify(pointPm1)} */}
        </div>
    );
};

export default PM2TambahInspection;
