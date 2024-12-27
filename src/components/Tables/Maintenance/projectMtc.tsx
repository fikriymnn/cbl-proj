import { useEffect, useRef, useState } from 'react';
import Filter from '../../../images/icon/filter.svg';
import Burger from '../../../images/icon/burger.svg';
import Arrow from '../../../images/icon/arrowDown.svg';

import ModalStockCheck1 from '../../Modals/ModalStockCheck1';
import Polygon6 from '../../../images/icon/Polygon6.svg';
import X from '../../../images/icon/x.svg';
import axios from 'axios';
import ModalDetail from '../../Modals/ModalDetail';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import ModalMtcLightHeavy from '../../Modals/ModalMtcLightHeavy';
import ModalSPBService from '../../Modals/ModalNewSPBService';
import Loading from '../../Loading';
import DefaultLayout from '../../../layout/DefaultLayout';
import ModalProject from '../../Modals/ModalProject';
import ModalKosongan from '../../Modals/Qc/NCR/NCRResponQC';
import convertTimeStampToDate from '../../../utils/convertDate';

// import moment from 'moment';

function ProjectMtc() {
    const [isMobile, setIsMobile] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState();
    const [openButton, setOpenButton] = useState(null);
    const [page, setPage] = useState(1);

    const handleClick = (i: any) => {
        setOpenButton((prevState: any) => {
            return prevState === i ? null : i;
        });
    };

    const url = `${import.meta.env.VITE_API_LINK}/mtc/ProjectMtc`;
    const [task, setTask] = useState<any>()
    const [start, setStart] = useState<any>()
    const [end, setEnd] = useState<any>()
    const [days, setDays] = useState<any>()
    const [done, setDone] = useState<any>()
    const [work_days, setWork_days] = useState<any>()
    const [Lead, setLead] = useState<any>()
    const [Qty, setQty] = useState<any>()
    const [Problem, setProblem] = useState<any>()
    async function TambahTask() {

        try {
            const url = `${import.meta.env.VITE_API_LINK}/mtc/ProjectMtc`;
            const res = await axios.post(url,
                {

                    task: task,
                    start: start,
                    end: end,
                    days: days,
                    done: done,
                    work_days: work_days,


                },
                {

                    withCredentials: true,
                });
            window.location.reload();
            getMasterMesin()
            console.log(res.data);
        } catch (error: any) {
            console.log(error);
        }
    }

    async function TambahSubTask(id: any) {

        try {
            const url = `${import.meta.env.VITE_API_LINK}/mtc/subProjectMtc`;
            const res = await axios.post(url,
                {
                    id_project: id,
                    task: task,
                    start: start,
                    end: end,
                    days: days,
                    done: done,
                    work_days: work_days,
                    lead: Lead,
                    qty: Qty,
                    problem: Problem,


                },
                {

                    withCredentials: true,
                });
            window.location.reload();
            getMasterMesin()
            console.log(res.data);
        } catch (error: any) {
            console.log(error);
        }
    }


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

    const openModal2 = () => setShowModal2(true);
    const closeModal2 = () => setShowModal2(false);

    const openModal4 = () => setShowModal4(true);
    const closeModal4 = () => setShowModal4(false);
    const openModal5 = () => setShowModal5(true);
    const closeModal5 = () => setShowModal5(false);

    const handleClickDetail = (index: number) => {
        setShowDetail((prevState) => {
            const updatedShowDetail = [...prevState]; // Create a copy
            updatedShowDetail[index] = !updatedShowDetail[index]; // Toggle value
            return updatedShowDetail;
        });
    };
    const handleClickDetailMobile = (index: number) => {
        setShowDetailMobile((prevState) => {
            const updatedShowDetailMobile = [...prevState]; // Create a copy
            updatedShowDetailMobile[index] = !updatedShowDetailMobile[index]; // Toggle value
            return updatedShowDetailMobile;
        });
    };
    const [tiket, setTiket] = useState<any>(null);

    const [showTwoButtons, setShowTwoButtons] = useState<any>([]);
    const [showModal1, setShowModal1] = useState<any>([]);
    const [user, setUser] = useState<any>(null);
    const [filter, setFilter] = useState(false);
    const [showTambah, setShowTambah] = useState<any>(false)
    // const onchangeVal: any = [...showTwoButtons];
    // setShowTwoButtons(showTwoButtons.map((item: any) => item = false))
    //onchangeVal[i] = !onchangeVal[i];

    // setShowTwoButtons(onchangeVal);

    const openModal1 = (i: any) => {
        const onchangeVal: any = [...showModal1];
        onchangeVal[i] = true;

        setShowModal1(onchangeVal);
    };
    const closeModal1 = (i: any) => {
        const onchangeVal: any = [...showModal1];
        onchangeVal[i] = false;

        setShowModal1(onchangeVal);
    };

    useEffect(() => {
        getTiket();
        getUser();
    }, [page]);

    const OpenTambah = () => {

        setShowTambah(true);
    };
    const CloseTambah = () => {

        setShowTambah(false);
    };

    async function getUser() {
        try {
            setIsLoading(true)
            const res = await axios.get(`${import.meta.env.VITE_API_LINK}/me`, {
                withCredentials: true,
            });
            // if (res.data.success == false) {
            //   navigate("/auth/login");
            // }
            setIsLoading(false)
            setUser(res.data);
            console.log(res.data);
        } catch (error: any) {
            setIsLoading(false)
            console.log(error.response);
        }
    }
    const [showModalDetail, setShowModalDetail] = useState<any>([]);

    const openModalDetail = (i: any) => {
        const onchangeVal: any = [...showModalDetail];
        onchangeVal[i] = true;
        console.log(onchangeVal);
        setShowModalDetail(onchangeVal);
    };
    const closeModalDetail = (i: any) => {
        const onchangeVal: any = [...showModalDetail];
        onchangeVal[i] = false;

        setShowModalDetail(onchangeVal);
    };
    const [masterMesin, setmasterMesin] = useState<any>();
    useEffect(() => {

        getMasterMesin();
    }, []);

    async function getMasterMesin() {
        const url = `${import.meta.env.VITE_API_LINK}/master/mesin`;
        try {
            setIsLoading(true)
            const res = await axios.get(url, {
                withCredentials: true,
            });
            setIsLoading(false)
            setmasterMesin(res.data);

        } catch (error: any) {
            setIsLoading(false)
            console.log(error.data.msg);
        }
    }
    async function getTiket() {
        const url = `${import.meta.env.VITE_API_LINK}/mtc/projectMtc`;
        try {
            setIsLoading(true)
            const res = await axios.get(url, {
                params: {

                    page: page,
                    limit: 10,

                },
                withCredentials: true,
            });
            setIsLoading(false)
            setTiket(res.data);
            console.log(res.data);

            let data: any[] = [];
            for (let i = 0; i < res.data.data.length; i++) {
                data.push(false);
            }
            setShowModal1(data);
            setShowModalDetail(data);
            setShowTwoButtons(data);

        } catch (error: any) {
            setIsLoading(false)
            console.log(error.response);
        }
    }
    const [showDetail, setShowDetail] = useState<boolean[]>(
        new Array(tiket != null && tiket.length).fill(false),
    );
    return (
        <main>

            <div className="flex  gap-1 items-center bg-white ">
                {isLoading && <Loading />}
                <div className='w-full flex justify-end p-3'>

                    <div className="flex ">
                        <button
                            onClick={() => OpenTambah()}
                            className="bg-primary text-white px-5 py-2 rounded-md my-auto "
                        >
                            Tambah
                        </button>

                    </div>

                </div>
                {showTambah == true && (
                    <>

                        <ModalKosongan
                            isOpen={showTambah}
                            onClose={() => CloseTambah()}
                            judul={'Tambah Task'}
                        >
                            <div className="flex w-full flex-col pt-7 ">
                                <>
                                    <form onSubmit={(e) => {
                                        e.preventDefault()
                                        TambahTask()
                                    }}>


                                        <div className="flex w-full gap-2 flex-row  pt-3 px-4">
                                            <label className="text-black text-xs font-bold">
                                                Task
                                            </label>
                                            <div className="flex w-full">
                                                <input
                                                    name="serial_number"
                                                    onChange={(e) => { setTask(e.target.value) }}
                                                    type="text"
                                                    className=" w-[387px] h-10 border-2 border-stroke rounded-md"
                                                />
                                            </div>

                                        </div>
                                        <div className="flex w-full flex-row gap-2  pt-3 px-4">
                                            <label className="text-black text-xs font-bold">
                                                Start
                                            </label>
                                            <div className="flex w-full">
                                                <input
                                                    name="nama_mesin"
                                                    onChange={(e) => { setStart(e.target.value) }}
                                                    type="date"
                                                    className=" w-[387px] h-10 border-2 border-stroke rounded-md"
                                                />
                                            </div>

                                        </div>
                                        <div className="flex w-full flex-row gap-2  pt-3 px-4">
                                            <label className="text-black text-xs font-bold">
                                                End
                                            </label>
                                            <div className="flex w-full">
                                                <input
                                                    name="kode_mesin"
                                                    onChange={(e) => { setEnd(e.target.value) }}
                                                    type="date"
                                                    className=" w-[387px] h-10 border-2 border-stroke rounded-md"
                                                />
                                            </div>

                                        </div>
                                        <div className="flex w-full flex-row gap-2  pt-3 px-4">
                                            <label className="text-black text-xs font-bold">
                                                Days
                                            </label>
                                            <div className="flex w-full">
                                                <input
                                                    name="lokasi_mesin"
                                                    onChange={(e) => { setDays(e.target.value) }}
                                                    type="text"
                                                    className=" w-[387px] h-10 border-2 border-stroke rounded-md"
                                                />
                                            </div>

                                        </div>
                                        <div className="flex w-full flex-row gap-2  pt-3 px-4">
                                            <label className="text-black text-xs font-bold">
                                                Done
                                            </label>
                                            <div className="flex w-full">
                                                <input
                                                    name="bagian_mesin"
                                                    onChange={(e) => { setDone(e.target.value) }}
                                                    type="text"
                                                    className=" w-[387px] h-10 border-2 border-stroke rounded-md"
                                                />
                                            </div>

                                        </div>
                                        <div className="flex w-full flex-row gap-2  pt-3 px-4">
                                            <label className="text-black text-xs font-bold">
                                                Work Days
                                            </label>
                                            <div className="flex w-full">
                                                <input
                                                    name="bagian_mesin"
                                                    onChange={(e) => { setWork_days(e.target.value) }}
                                                    type="text"
                                                    className=" w-[387px] h-10 border-2 border-stroke rounded-md"
                                                />
                                            </div>

                                        </div>
                                        <div className="flex w-full justify-end">
                                            <button
                                                type='submit'
                                                value='submit'
                                                className="bg-[#0065DE] text-center text-white text-xs font-bold px-6 py-3 rounded-md"
                                            >
                                                SIMPAN
                                            </button>
                                        </div>
                                    </form>
                                </>
                            </div>
                        </ModalKosongan>
                    </>
                )}
                {/* <input
          type="search"
          placeholder="search"
          name=""
          id=""
          className="md:w-96 w-40 py-1 mx-3 px-3 bg-[#E9F3FF]"
        /> */}
            </div>

            {!isMobile && (
                <>
                    <div className="flex bg-white mt-2 py-2">
                        <p className="w-10 px-3 text-xs font-bold ">No</p>
                        <div className="grid grid-cols-12 w-full gap-2">
                            <div className="flex gap-2 col-span-2">
                                <p className="text-xs font-bold ">TASK</p>

                            </div>
                            <div className="flex gap-2 ">
                                <p className="text-xs font-bold ">LEAD</p>

                            </div>
                            <div className="flex gap-2 ">
                                <p className="text-xs font-bold ">QTY</p>

                            </div>
                            <div className="flex gap-2 col-span-2">
                                <p className="text-xs font-bold ">PROBLEM</p>

                            </div>
                            <div className="flex gap-2">
                                <p className="text-xs font-bold ">START</p>

                            </div>
                            <div className="flex gap-2">
                                <p className="text-xs font-bold ">END</p>

                            </div>
                            <div className="flex gap-2 ">
                                <p className="text-xs font-bold ">DAYS</p>

                            </div>
                            <div className="flex gap-2 ">
                                <p className="text-xs font-bold ">% DONE</p>

                            </div>
                            <div className="flex gap-2  ">
                                <p className="text-xs font-bold ">WORK DAYS</p>

                            </div>
                            <div className="flex gap-2 ">
                                <p className="text-xs font-bold ">ACTION</p>
                            </div>
                        </div>
                    </div>
                    <div className=" overflow-x-auto">
                        <div className="min-w-[700px]">
                            {tiket != null &&
                                tiket.data.map((data: any, i: any) => {
                                    return (
                                        <>
                                            <div className="my-2">
                                                <section className="flex  bg-white  rounded-lg">
                                                    <div
                                                        key={i}
                                                        className=" py-3 w-10 px-3 flex justify-center items-center"
                                                    >
                                                        {i + 1 + (page - 1) * 10}
                                                    </div>
                                                    <div className="grid grid-cols-12 w-full gap-2 ">
                                                        <div className="flex flex-col md:gap-5 gap-1 w-full col-span-2">
                                                            <div className="my-auto  ">
                                                                <p className="text-xs font-bold break-all">
                                                                    {data.task}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col md:gap-5 gap-1 ">
                                                            <div className="my-auto">
                                                                <p className="text-xs font-bold">

                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col md:gap-5 gap-1 ">
                                                            <div className="my-auto">
                                                                <p className="text-xs font-bold">

                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col md:gap-5 gap-1 col-span-2">
                                                            <div className="my-auto w-full">
                                                                <p className="text-xs font-bold">

                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col md:gap-5 gap-1 ">
                                                            <div className="my-auto">
                                                                <p className="text-xs font-bold">
                                                                    {start}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center md:gap-5 gap-1 ">
                                                            <div className="flex text-xs font-bold">

                                                                {end}

                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col md:gap-5 gap-1 ">
                                                            <div className="my-auto">
                                                                <p className="text-xs font-bold">
                                                                    {data.days}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center md:gap-5 gap-1  p-2">
                                                            <div className="my-auto ">
                                                                <p className="text-xs font-bold ">
                                                                    {data.done}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col md:gap-5 gap-1">
                                                            <div className='my-auto'>
                                                                <p className="text-xs font-bold">
                                                                    {data.work_days}

                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2 items-center md:mb-0 mb-2 ">
                                                            <div>
                                                                <div>

                                                                    <button
                                                                        title="button"
                                                                        className="text-xs font-bold px-1 bg-blue-700 py-2 text-white rounded-md"
                                                                        onClick={() => openModal1(i)}
                                                                    >
                                                                        Tambah
                                                                    </button>


                                                                </div>
                                                            </div>
                                                            <div className='mx-2'>
                                                                <button
                                                                    title="button"
                                                                    onClick={() => handleClickDetail(i)}
                                                                    className="text-xs font-bold text-blue-700 bg-blue-700 py-2 border-blue-700 border rounded-md"
                                                                >
                                                                    <img src={Arrow} alt="" className="mx-3" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </section>

                                                {showDetail[i] && (
                                                    <>
                                                        <div className="w-full flex flex-col bg-[#E9F3FF]  rounded-lg">
                                                            {data.sub_project.map((data: any, i: any) => {

                                                                return (

                                                                    <>

                                                                        <div className="flex py-2">
                                                                            <div
                                                                                key={i}
                                                                                className=" py-3 w-10 px-3 flex justify-center items-center"
                                                                            >
                                                                                {data.id}
                                                                            </div>
                                                                            <div className="grid grid-cols-12 w-full gap-2 ">
                                                                                <div className="flex flex-col md:gap-5 gap-1 w-full col-span-2">
                                                                                    <div className="my-auto  ">
                                                                                        <p className="text-xs font-light break-all">
                                                                                            {data.task}

                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex flex-col md:gap-5 gap-1 ">
                                                                                    <div className="my-auto">
                                                                                        <p className="text-xs font-light">
                                                                                            {data.lead}
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex flex-col md:gap-5 gap-1 ">
                                                                                    <div className="my-auto">
                                                                                        <p className="text-xs font-light">
                                                                                            {data.qty}
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex flex-col md:gap-5 gap-1 col-span-2">
                                                                                    <div className="my-auto w-full">
                                                                                        <p className="text-xs font-light">
                                                                                            {data.problem}
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex flex-col md:gap-5 gap-1 ">
                                                                                    <div className="my-auto">
                                                                                        <p className="text-xs font-light">
                                                                                            {(data.start == null || data.start == 0) ? '-' : convertTimeStampToDate(data.start)}
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex items-center md:gap-5 gap-1 ">
                                                                                    <div className="flex text-xs font-light">

                                                                                        {(data.end == null || data.end == 0) ? '-' : convertTimeStampToDate(data.end)}

                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex flex-col md:gap-5 gap-1 ">
                                                                                    <div className="my-auto">
                                                                                        <p className="text-xs font-light">
                                                                                            {data.days}
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex items-center md:gap-5 gap-1  p-2">
                                                                                    <div className="my-auto">
                                                                                        <p className="text-xs font-light">
                                                                                            {data.done}
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex flex-col md:gap-5 gap-1">
                                                                                    <div className="my-auto">
                                                                                        <p className="text-xs font-light">
                                                                                            {data.work_days}
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex gap-2 items-center md:mb-0 mb-2 ">
                                                                                    <div>
                                                                                        <div>
                                                                                            <button
                                                                                                title="button"
                                                                                                className="text-xs font-bold px-1 bg-blue-700 py-2 text-white rounded-md"
                                                                                                onClick={() => openModal1(i)}
                                                                                            >
                                                                                                Edit
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className='mx-2'>

                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </>
                                                                )
                                                            }
                                                            )}
                                                        </div>
                                                    </>
                                                )}

                                                {showModal1[i] == true && (
                                                    <>

                                                        <ModalKosongan
                                                            isOpen={showModal1[i]}
                                                            onClose={() => closeModal1(i)}
                                                            judul={' Task'}
                                                        >
                                                            <div className="flex w-full flex-col pt-7 ">
                                                                <>
                                                                    <form onSubmit={(e) => {
                                                                        e.preventDefault()
                                                                        TambahSubTask(data.id)
                                                                    }}>


                                                                        <div className="flex w-full gap-2 flex-row  pt-3 px-4">
                                                                            <label className="text-black text-xs font-bold">
                                                                                Task {data.id}
                                                                            </label>
                                                                            <div className="flex w-full">
                                                                                <input
                                                                                    name="serial_number"
                                                                                    onChange={(e) => { setTask(e.target.value) }}
                                                                                    type="text"
                                                                                    className=" w-[387px] h-10 border-2 border-stroke rounded-md"
                                                                                />
                                                                            </div>

                                                                        </div>
                                                                        <div className="flex w-full flex-row gap-2  pt-3 px-4">
                                                                            <label className="text-black text-xs font-bold">
                                                                                Start
                                                                            </label>
                                                                            <div className="flex w-full">
                                                                                <input
                                                                                    name="nama_mesin"
                                                                                    onChange={(e) => { setStart(e.target.value) }}
                                                                                    type="date"
                                                                                    className=" w-[387px] h-10 border-2 border-stroke rounded-md"
                                                                                />
                                                                            </div>

                                                                        </div>
                                                                        <div className="flex w-full flex-row gap-2  pt-3 px-4">
                                                                            <label className="text-black text-xs font-bold">
                                                                                End
                                                                            </label>
                                                                            <div className="flex w-full">
                                                                                <input
                                                                                    name="kode_mesin"
                                                                                    onChange={(e) => { setEnd(e.target.value) }}
                                                                                    type="date"
                                                                                    className=" w-[387px] h-10 border-2 border-stroke rounded-md"
                                                                                />
                                                                            </div>

                                                                        </div>
                                                                        <div className="flex w-full flex-row gap-2  pt-3 px-4">
                                                                            <label className="text-black text-xs font-bold">
                                                                                Days
                                                                            </label>
                                                                            <div className="flex w-full">
                                                                                <input
                                                                                    name="lokasi_mesin"
                                                                                    onChange={(e) => { setDays(e.target.value) }}
                                                                                    type="text"
                                                                                    className=" w-[387px] h-10 border-2 border-stroke rounded-md"
                                                                                />
                                                                            </div>

                                                                        </div>
                                                                        <div className="flex w-full flex-row gap-2  pt-3 px-4">
                                                                            <label className="text-black text-xs font-bold">
                                                                                Done
                                                                            </label>
                                                                            <div className="flex w-full">
                                                                                <input
                                                                                    name="bagian_mesin"
                                                                                    onChange={(e) => { setDone(e.target.value) }}
                                                                                    type="text"
                                                                                    className=" w-[387px] h-10 border-2 border-stroke rounded-md"
                                                                                />
                                                                            </div>

                                                                        </div>
                                                                        <div className="flex w-full flex-row gap-2  pt-3 px-4">
                                                                            <label className="text-black text-xs font-bold">
                                                                                Work Days
                                                                            </label>
                                                                            <div className="flex w-full">
                                                                                <input
                                                                                    name="bagian_mesin"
                                                                                    onChange={(e) => { setWork_days(e.target.value) }}
                                                                                    type="text"
                                                                                    className=" w-[387px] h-10 border-2 border-stroke rounded-md"
                                                                                />
                                                                            </div>

                                                                        </div>
                                                                        <div className="flex w-full flex-row gap-2  pt-3 px-4">
                                                                            <label className="text-black text-xs font-bold">
                                                                                Lead
                                                                            </label>
                                                                            <div className="flex w-full">
                                                                                <input
                                                                                    name="bagian_mesin"
                                                                                    onChange={(e) => { setLead(e.target.value) }}
                                                                                    type="text"
                                                                                    className=" w-[387px] h-10 border-2 border-stroke rounded-md"
                                                                                />
                                                                            </div>

                                                                        </div>
                                                                        <div className="flex w-full flex-row gap-2  pt-3 px-4">
                                                                            <label className="text-black text-xs font-bold">
                                                                                QTY
                                                                            </label>
                                                                            <div className="flex w-full">
                                                                                <input
                                                                                    name="bagian_mesin"
                                                                                    onChange={(e) => { setQty(e.target.value) }}
                                                                                    type="text"
                                                                                    className=" w-[387px] h-10 border-2 border-stroke rounded-md"
                                                                                />
                                                                            </div>

                                                                        </div>
                                                                        <div className="flex w-full flex-row gap-2  pt-3 px-4">
                                                                            <label className="text-black text-xs font-bold">
                                                                                Problem
                                                                            </label>
                                                                            <div className="flex w-full">
                                                                                <input
                                                                                    name="bagian_mesin"
                                                                                    onChange={(e) => { setProblem(e.target.value) }}
                                                                                    type="text"
                                                                                    className=" w-[387px] h-10 border-2 border-stroke rounded-md"
                                                                                />
                                                                            </div>

                                                                        </div>
                                                                        <div className="flex w-full justify-end">
                                                                            <button
                                                                                type='submit'
                                                                                value='submit'
                                                                                className="bg-[#0065DE] text-center text-white text-xs font-bold px-6 py-3 rounded-md"
                                                                            >
                                                                                SIMPAN
                                                                            </button>
                                                                        </div>
                                                                    </form>
                                                                </>
                                                            </div>
                                                        </ModalKosongan>
                                                    </>
                                                )}
                                            </div>
                                        </>
                                    );
                                })}
                        </div>
                    </div>
                    <div className="w-full flex justify-end">
                        <Stack spacing={2}>
                            <Pagination
                                count={tiket?.total_page}
                                color="primary"
                                onChange={(e, i) => {
                                    setPage(i);
                                    console.log(i);
                                }}
                            />
                        </Stack>
                    </div>
                </>
            )}

        </main>
    );
}

export default ProjectMtc;
