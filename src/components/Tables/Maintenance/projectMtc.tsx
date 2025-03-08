import { useEffect, useRef, useState } from 'react';
import Arrow from '../../../images/icon/arrowDown.svg';
import axios from 'axios';

import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

import Loading from '../../Loading';

import ModalKosongan from '../../Modals/Qc/NCR/NCRResponQC';
import convertTimeStampToDate from '../../../utils/convertDate';

// import moment from 'moment';

function ProjectMtc() {
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [task, setTask] = useState<any>()
    const [start, setStart] = useState<any>()
    const [end, setEnd] = useState<any>()
    const [days, setDays] = useState<any>()
    const [done, setDone] = useState<any>()
    const [work_days, setWork_days] = useState<any>()
    const [Lead, setLead] = useState<any>()
    const [Qty, setQty] = useState<any>()
    const [Problem, setProblem] = useState<any>()

    const [taskEdit, setTaskEdit] = useState<any>()
    const [startEdit, setStartEdit] = useState<any>()
    const [endEdit, setEndEdit] = useState<any>()
    const [daysEdit, setDaysEdit] = useState<any>()
    const [doneEdit, setDoneEdit] = useState<any>()
    const [work_daysEdit, setWork_daysEdit] = useState<any>()
    const [LeadEdit, setLeadEdit] = useState<any>()
    const [QtyEdit, setQtyEdit] = useState<any>()
    const [ProblemEdit, setProblemEdit] = useState<any>()
    useEffect(() => {
        if (start && end) {
            // Calculate total days between dates
            const startDate = new Date(start);
            const endDate = new Date(end);

            // Calculate total days (including start and end days)
            const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
            const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            setDays(totalDays.toString());

            // Calculate work days (Monday to Friday)
            let workDaysCount = 0;
            const currentDate = new Date(startDate);

            while (currentDate <= endDate) {
                // 0 = Sunday, 1-5 = Monday-Friday, 6 = Saturday
                const dayOfWeek = currentDate.getDay();
                if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                    workDaysCount++;
                }
                // Move to next day
                currentDate.setDate(currentDate.getDate() + 1);
            }

            setWork_days(workDaysCount.toString());
        } else {
            setDays('');
            setWork_days('');
        }
    }, [start, end]);

    async function TambahTask(e: any) {
        e.preventDefault();
        try {
            const url = `${import.meta.env.VITE_API_LINK}/mtc/ProjectMtc`;
            const res = await axios.post(
                url,
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
                }
            );
            CloseTambah();
            getTiket();
            console.log(res.data);
        } catch (error) {
            console.log(error);
        }
    }

    async function putTask(id: any) {

        try {
            const url = `${import.meta.env.VITE_API_LINK}/mtc/ProjectMtc/${id}`;
            const res = await axios.put(url,
                {

                    task: taskEdit,
                    start: startEdit,
                    end: endEdit,
                    days: daysEdit,
                    done: doneEdit,
                    work_days: work_daysEdit,

                },
                {

                    withCredentials: true,
                });
            setTaskEdit('')
            setStartEdit('')
            setEndEdit('')
            setDaysEdit('')
            setDoneEdit('')
            setWork_daysEdit('')
            alert('Data Berhasil Di-Update')
            getTiket()

            console.log(res.data);
        } catch (error: any) {
            console.log(error);
        }
    }
    async function TambahSubTask(id: any, i: any) {

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
            getTiket()
            closeModal1(i)
            console.log(res.data);
        } catch (error: any) {
            console.log(error);
        }
    }
    async function PutSubTask(id: any) {
        try {
            const url = `${import.meta.env.VITE_API_LINK}/mtc/subProjectMtc/${id}`;
            const res = await axios.put(url,
                {
                    task: taskEdit,
                    start: startEdit,
                    end: endEdit,
                    days: daysEdit,
                    done: doneEdit,
                    work_days: work_daysEdit,
                    lead: LeadEdit,
                    qty: QtyEdit,
                    problem: ProblemEdit,
                },
                {

                    withCredentials: true,
                });
            setTaskEdit('')
            setStartEdit('')
            setEndEdit('')
            setDaysEdit('')
            setDoneEdit('')
            setWork_daysEdit('')
            setLeadEdit('')
            setQtyEdit('')
            setProblemEdit('')
            alert('Data Berhasil Di-Update')
            getTiket()

        } catch (error: any) {
            console.log(error);
        }
    }
    async function DeleteTask(id: any) {
        if (window.confirm('Apakah Anda yakin ingin Menghapus Task Ini?')) {
            try {
                const url = `${import.meta.env.VITE_API_LINK}/mtc/projectMtc/${id}`;
                const res = await axios.delete(url,
                    {

                        withCredentials: true,
                    });
                alert('Data Berhasil Di-Hapus')
                getTiket()

            } catch (error: any) {
                console.log(error);
            }
        }
    }
    async function DeleteSubTask(id: any) {
        if (window.confirm('Apakah Anda yakin ingin Menghapus Sub Task Ini?')) {
            try {
                const url = `${import.meta.env.VITE_API_LINK}/mtc/subProjectMtc/${id}`;
                const res = await axios.delete(url,
                    {

                        withCredentials: true,
                    });
                alert('Data Berhasil Di-Hapus')
                getTiket()

            } catch (error: any) {
                console.log(error);
            }
        }
    }

    const handleClickDetail = (index: number) => {
        setShowDetail((prevState) => {
            const updatedShowDetail = [...prevState]; // Create a copy
            updatedShowDetail[index] = !updatedShowDetail[index]; // Toggle value
            return updatedShowDetail;
        });
    };

    const [tiket, setTiket] = useState<any>(null);
    const [showModal1, setShowModal1] = useState<any>([]);
    const [showTambah, setShowTambah] = useState<any>(false)
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

    const [showEditPJ, setshowEditPJ] = useState<any>([]);
    const openModalEditPJ = (i: any) => {
        const onchangeVal: any = [...showEditPJ];
        onchangeVal[i] = true;

        setshowEditPJ(onchangeVal);
    };
    const closeModalEditPJ = (i: any) => {
        const onchangeVal: any = [...showEditPJ];
        onchangeVal[i] = false;

        setshowEditPJ(onchangeVal);
    };

    const [showModalEdit, setShowModalEdit] = useState<any>([]);


    const openModalEdit = (i: any, ii: any) => {
        const onchangeVal: any = [...showModalEdit];
        onchangeVal[i].ii[ii] = true;

        setShowModalEdit(onchangeVal);
    };
    const closeModalEdit = (i: any, ii: any) => {
        const onchangeVal: any = [...showModalEdit];
        onchangeVal[i].ii[ii] = false;

        setShowModalEdit(onchangeVal);
    };


    const OpenTambah = () => {

        setShowTambah(true);
    };
    const CloseTambah = () => {

        setShowTambah(false);
    };
    useEffect(() => {
        getTiket()
        getMasterMesin();
    }, [page]);

    const [masterMesin, setmasterMesin] = useState<any>();

    async function getMasterMesin() {
        const url = `${import.meta.env.VITE_API_LINK}/master/mesin`;
        try {
            const res = await axios.get(url, {
                withCredentials: true,
            });

            setmasterMesin(res.data);
            console.log(res.data);
        } catch (error: any) {
            console.log(error.data.msg);
        }
    }
    async function getTiket() {
        const url = `${import.meta.env.VITE_API_LINK}/mtc/projectMtc`;
        try {
            setIsLoading(true)
            const res = await axios.get(url, {
                params: {

                    // page: page,
                    // limit: 10,

                },
                withCredentials: true,
            });
            setIsLoading(false)
            setTiket(res.data);
            console.log(res.data);

            let data: any[] = [];
            for (let i = 0; i < res.data.data.length; i++) {
                data.push({ i: false, ii: [] });
                for (let ii = 0; ii < res.data.data[i].sub_project.length; ii++) {
                    data[i].ii.push(false)

                }
            }
            setShowModal1(data);
            setShowModalEdit(data)
            console.log(data)


        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
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
                            className="bg-primary text-white px-5 py-2 rounded-md my-auto font-semibold"
                        >
                            Tambah Project
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
                            <>
                                <form onSubmit={TambahTask} className="bg-white rounded-lg shadow-md p-6">
                                    <h2 className="text-xl font-bold text-gray-800 mb-4">Add New Task</h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        {/* Task Selection */}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Machine
                                            </label>
                                            <select
                                                onChange={(e) => setTask(e.target.value)}
                                                className="w-full px-3 py-2 bg-blue-50 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                                required
                                            >
                                                <option value="" disabled selected>
                                                    Select Machine
                                                </option>
                                                {masterMesin?.map((data: any, i: any) => (
                                                    <option key={i} value={data.nama_mesin}>
                                                        {data.nama_mesin}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Start Date */}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Start Date
                                            </label>
                                            <input
                                                type="date"
                                                onChange={(e) => setStart(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                                required
                                            />
                                        </div>

                                        {/* End Date */}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                End Date
                                            </label>
                                            <input
                                                type="date"
                                                onChange={(e) => setEnd(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                                required
                                            />
                                        </div>

                                        {/* Done Percentage */}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Completion (%)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                onChange={(e) => setDone(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                                placeholder="0-100"
                                                required
                                            />
                                        </div>

                                        {/* Total Days (Calculated) */}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Total Days
                                            </label>
                                            <input
                                                type="text"
                                                value={days}
                                                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm focus:outline-none transition-all"
                                                readOnly
                                            />
                                            <p className="text-xs text-gray-500">Automatically calculated</p>
                                        </div>

                                        {/* Work Days (Calculated) */}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Work Days (Mon-Fri)
                                            </label>
                                            <input
                                                type="text"
                                                value={work_days}
                                                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm focus:outline-none transition-all"
                                                readOnly
                                            />
                                            <p className="text-xs text-gray-500">Automatically calculated</p>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex justify-end mt-6">
                                        <button
                                            type="submit"
                                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                        >
                                            Add Project
                                        </button>
                                    </div>
                                </form>
                            </>

                        </ModalKosongan>
                    </>
                )}
            </div>
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
                <div className="">
                    <div className="min-w-screen">
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
                                                                {(data.start == null || data.start == 0) ? '-' : convertTimeStampToDate(data.start)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center md:gap-5 gap-1 ">
                                                        <div className="flex text-xs font-bold">

                                                            {(data.end == null || data.end == 0) ? '-' : convertTimeStampToDate(data.end)}

                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col md:gap-5 gap-1 ">
                                                        <div className="my-auto">
                                                            <p className="text-xs font-bold">
                                                                {data.days} Hari
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center md:gap-5 gap-1  p-2">
                                                        <div className="my-auto ">
                                                            <p className="text-xs font-bold ">
                                                                {data.done} %
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col md:gap-5 gap-1">
                                                        <div className="my-auto ">
                                                            <p className="text-xs font-bold">
                                                                {data.work_days} Hari

                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col gap-2 py-2 px-2">
                                                        <button
                                                            title="button"
                                                            className="text-xs font-bold px-1 bg-blue-700 py-2 text-white rounded-md"
                                                            onClick={() => openModal1(i)}
                                                        >
                                                            Tambah
                                                        </button>
                                                        <button
                                                            title="button"
                                                            className="text-xs font-bold px-1 bg-blue-700 py-2 text-white rounded-md"
                                                            onClick={() => openModalEditPJ(i)}
                                                        >
                                                            Edit
                                                        </button>
                                                        {showEditPJ[i] == true && (
                                                            <>

                                                                <ModalKosongan
                                                                    isOpen={showEditPJ[i]}
                                                                    onClose={() => closeModalEditPJ(i)}
                                                                    judul={'Edit Task'}
                                                                >
                                                                    <>


                                                                        <div className="grid grid-cols-2 px-[1%] py-[1%] gap-2">
                                                                            <div className="flex w-full gap-2 flex-row">
                                                                                <label className="text-black text-xs font-bold w-10">
                                                                                    Task
                                                                                </label>
                                                                                <div className="flex w-full">
                                                                                    <input
                                                                                        defaultValue={data.task}
                                                                                        name="serial_number"
                                                                                        onChange={(e) => { setTaskEdit(e.target.value) }}
                                                                                        type="text"
                                                                                        className=" w-full h-10 border-2 border-stroke rounded-md"
                                                                                    />
                                                                                </div>

                                                                            </div>

                                                                            <div className="flex w-full flex-row gap-2">

                                                                                <label className="text-black text-xs font-bold w-10">
                                                                                    Start
                                                                                </label>

                                                                                <div className="flex w-full flex-col">
                                                                                    <label className="text-black text-xs font-bold ">
                                                                                        {(data.start == null || data.start == 0) ? '-' : convertTimeStampToDate(data.start)}
                                                                                    </label>
                                                                                    <input
                                                                                        name="nama_mesin"
                                                                                        onChange={(e) => { setStartEdit(e.target.value) }}
                                                                                        type="date"
                                                                                        className=" w-full h-10 border-2 border-stroke rounded-md"
                                                                                    />
                                                                                </div>

                                                                            </div>
                                                                            <div className="flex w-full flex-row gap-2">
                                                                                <label className="text-black text-xs font-bold w-10">
                                                                                    End
                                                                                </label>
                                                                                <div className="flex w-full flex-col">
                                                                                    <label className="text-black text-xs font-bold">
                                                                                        {(data.end == null || data.end == 0) ? '-' : convertTimeStampToDate(data.end)}
                                                                                    </label>
                                                                                    <input
                                                                                        name="kode_mesin"
                                                                                        onChange={(e) => { setEndEdit(e.target.value) }}
                                                                                        type="date"
                                                                                        className=" w-full h-10 border-2 border-stroke rounded-md"
                                                                                    />
                                                                                </div>

                                                                            </div>
                                                                            <div className="flex w-full flex-row gap-2">
                                                                                <label className="text-black text-xs font-bold w-10">
                                                                                    Days
                                                                                </label>
                                                                                <div className="flex w-full">
                                                                                    <input
                                                                                        defaultValue={data.days}
                                                                                        name="lokasi_mesin"
                                                                                        onChange={(e) => { setDaysEdit(e.target.value) }}
                                                                                        type="text"
                                                                                        className=" w-full h-10 border-2 border-stroke rounded-md"
                                                                                    />
                                                                                </div>

                                                                            </div>
                                                                            <div className="flex w-full flex-row gap-2">
                                                                                <label className="text-black text-xs font-bold w-10">
                                                                                    Done
                                                                                </label>
                                                                                <div className="flex w-full">
                                                                                    <input
                                                                                        defaultValue={data.done}
                                                                                        name="bagian_mesin"
                                                                                        onChange={(e) => { setDoneEdit(e.target.value) }}
                                                                                        type="text"
                                                                                        className=" w-full h-10 border-2 border-stroke rounded-md"
                                                                                    />
                                                                                </div>

                                                                            </div>
                                                                            <div className="flex w-full flex-row gap-2">
                                                                                <label className="text-black text-xs font-bold w-10">
                                                                                    Work Days
                                                                                </label>
                                                                                <div className="flex w-full">
                                                                                    <input
                                                                                        defaultValue={data.work_days}
                                                                                        name="bagian_mesin"
                                                                                        onChange={(e) => { setWork_daysEdit(e.target.value) }}
                                                                                        type="text"
                                                                                        className=" w-full h-10 border-2 border-stroke rounded-md"
                                                                                    />
                                                                                </div>

                                                                            </div>
                                                                        </div>
                                                                        <div className="flex w-full justify-end">
                                                                            <button
                                                                                onClick={() => putTask(data.id)}
                                                                                className="bg-[#0065DE] text-center text-white text-xs font-bold px-6 py-3 rounded-md"
                                                                            >
                                                                                EDIT PROJECT
                                                                            </button>
                                                                        </div>

                                                                    </>

                                                                </ModalKosongan>
                                                            </>
                                                        )}
                                                        <button
                                                            title="button"
                                                            className="text-xs w-full font-bold px-1 bg-red-700 py-2 text-white rounded-md"
                                                            onClick={() => DeleteTask(data.id)}
                                                        >
                                                            Hapus
                                                        </button>
                                                        <div className=''>
                                                            <button
                                                                title="button"
                                                                onClick={() => handleClickDetail(i)}
                                                                className="text-xs w-full items-center flex justify-center font-bold text-blue-700 bg-blue-700 py-2 border-blue-700 border rounded-md"
                                                            >
                                                                <img src={Arrow} alt="" className="mx-2" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </section>

                                            {showDetail[i] && (
                                                <>
                                                    <div className="w-full flex flex-col bg-[#accdf7]  rounded-lg">
                                                        {data.sub_project.map((data2: any, ii: any) => {

                                                            return (

                                                                <>

                                                                    <div className="flex py-2">
                                                                        <div
                                                                            key={ii}
                                                                            className=" py-3 w-10 px-3 flex justify-center items-center"
                                                                        >
                                                                            {data2.id_project}.{ii + 1}
                                                                        </div>
                                                                        <div className="grid grid-cols-12 w-full gap-2 ">
                                                                            <div className="flex flex-col md:gap-5 gap-1 w-full col-span-2">
                                                                                <div className="my-auto  ">
                                                                                    <p className="text-xs font-medium break-all">
                                                                                        {data2.task}

                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex flex-col md:gap-5 gap-1 ">
                                                                                <div className="my-auto">
                                                                                    <p className="text-xs font-medium">
                                                                                        {data2.lead}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex flex-col md:gap-5 gap-1 ">
                                                                                <div className="my-auto">
                                                                                    <p className="text-xs font-medium">
                                                                                        {data2.qty}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex flex-col md:gap-5 gap-1 col-span-2">
                                                                                <div className="my-auto w-full">
                                                                                    <p className="text-xs font-medium">
                                                                                        {data2.problem}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex flex-col md:gap-5 gap-1 ">
                                                                                <div className="my-auto">
                                                                                    <p className="text-xs font-medium">
                                                                                        {(data2.start == null || data2.start == 0) ? '-' : convertTimeStampToDate(data2.start)}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center md:gap-5 gap-1 ">
                                                                                <div className="flex text-xs font-medium">

                                                                                    {(data2.end == null || data2.end == 0) ? '-' : convertTimeStampToDate(data2.end)}

                                                                                </div>
                                                                            </div>
                                                                            <div className="flex flex-col md:gap-5 gap-1 ">
                                                                                <div className="my-auto">
                                                                                    <p className="text-xs font-medium">
                                                                                        {data2.days}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center md:gap-5 gap-1  p-2">
                                                                                <div className="my-auto">
                                                                                    <p className="text-xs font-medium">
                                                                                        {data2.done}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex flex-col md:gap-5 gap-1">
                                                                                <div className="my-auto">
                                                                                    <p className="text-xs font-medium">
                                                                                        {data2.work_days}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex gap-2 items-center md:mb-0 mb-2 ">
                                                                                <div>
                                                                                    <div className='flex gap-2'>
                                                                                        <button
                                                                                            title="button"
                                                                                            className="text-xs w-full font-bold px-1 bg-blue-700 py-2 text-white rounded-md"
                                                                                            onClick={() => openModalEdit(i, ii)}
                                                                                        >
                                                                                            Edit
                                                                                        </button>
                                                                                        {showModalEdit[i].ii[ii] == true && (
                                                                                            <>

                                                                                                <ModalKosongan
                                                                                                    isOpen={showModalEdit[i].ii[ii]}
                                                                                                    onClose={() => closeModalEdit(i, ii)}
                                                                                                    judul={'Edit Sub-Task'}
                                                                                                >
                                                                                                    <>
                                                                                                        <div className="grid grid-cols-3 gap-2 px-[1%] py-[1%]">

                                                                                                            <div>
                                                                                                                <div className='flex flex-col '>
                                                                                                                    <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                                                        NAMA TASK
                                                                                                                    </label>
                                                                                                                    <input
                                                                                                                        name="task"
                                                                                                                        defaultValue={data2.task}
                                                                                                                        onChange={(e) => { setTaskEdit(e.target.value) }}
                                                                                                                        type="text"
                                                                                                                        className=" w-full  border-2 border-stroke rounded-md"
                                                                                                                    />
                                                                                                                </div>
                                                                                                                <div className='flex flex-col '>
                                                                                                                    <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                                                        TANGGAL MULAI
                                                                                                                    </label>
                                                                                                                    <label htmlFor="" className='text-[#7a7a7a] text-xl font-normal'>
                                                                                                                        {(data2.start == null || data2.start == 0) ? '-' : convertTimeStampToDate(data2.start)}
                                                                                                                    </label>
                                                                                                                    <input
                                                                                                                        name="start"
                                                                                                                        onChange={(e) => { setStartEdit(e.target.value) }}
                                                                                                                        type="date"
                                                                                                                        className=" w-full  border-2 border-stroke rounded-md"
                                                                                                                    />
                                                                                                                </div>
                                                                                                                <div className='flex flex-col '>
                                                                                                                    <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                                                        TANGGAL SELESAI
                                                                                                                    </label>
                                                                                                                    <label htmlFor="" className='text-[#7a7a7a] text-xl font-normal'>
                                                                                                                        {(data2.end == null || data2.end == 0) ? '-' : convertTimeStampToDate(data2.end)}
                                                                                                                    </label>
                                                                                                                    <input
                                                                                                                        name="end"
                                                                                                                        onChange={(e) => { setEndEdit(e.target.value) }}
                                                                                                                        type="date"
                                                                                                                        className=" w-full  border-2 border-stroke rounded-md"
                                                                                                                    />
                                                                                                                </div>
                                                                                                            </div>
                                                                                                            <div>
                                                                                                                <div className='flex flex-col '>
                                                                                                                    <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                                                        LEAD
                                                                                                                    </label>
                                                                                                                    <input
                                                                                                                        name="lead"
                                                                                                                        defaultValue={data2.lead}
                                                                                                                        onChange={(e) => { setLeadEdit(e.target.value) }}
                                                                                                                        type="text"
                                                                                                                        className=" w-full  border-2 border-stroke rounded-md"
                                                                                                                    />
                                                                                                                </div>
                                                                                                                <div className='flex flex-col '>
                                                                                                                    <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                                                        QTY
                                                                                                                    </label>
                                                                                                                    <input
                                                                                                                        name="qty"
                                                                                                                        defaultValue={data2.qty}
                                                                                                                        onChange={(e) => { setQtyEdit(e.target.value) }}
                                                                                                                        type="text"
                                                                                                                        className=" w-full  border-2 border-stroke rounded-md"
                                                                                                                    />
                                                                                                                </div>
                                                                                                                <div className='flex flex-col '>
                                                                                                                    <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                                                        PROBLEM
                                                                                                                    </label>
                                                                                                                    <input
                                                                                                                        name="problem"
                                                                                                                        defaultValue={data2.problem}
                                                                                                                        onChange={(e) => { setProblemEdit(e.target.value) }}
                                                                                                                        type="text"
                                                                                                                        className=" w-full  border-2 border-stroke rounded-md"
                                                                                                                    />
                                                                                                                </div>
                                                                                                            </div>
                                                                                                            <div>
                                                                                                                <div className='flex flex-col '>
                                                                                                                    <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                                                        DAYS
                                                                                                                    </label>
                                                                                                                    <input
                                                                                                                        name="days"
                                                                                                                        defaultValue={data2.days}
                                                                                                                        onChange={(e) => { setDaysEdit(e.target.value) }}
                                                                                                                        type="text"
                                                                                                                        className=" w-full  border-2 border-stroke rounded-md"
                                                                                                                    />
                                                                                                                </div>
                                                                                                                <div className='flex flex-col '>
                                                                                                                    <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                                                        %DONE
                                                                                                                    </label>
                                                                                                                    <input
                                                                                                                        name="done"
                                                                                                                        defaultValue={data2.done}
                                                                                                                        onChange={(e) => { setDoneEdit(e.target.value) }}
                                                                                                                        type="text"
                                                                                                                        className=" w-full  border-2 border-stroke rounded-md"
                                                                                                                    />
                                                                                                                </div>
                                                                                                                <div className='flex flex-col '>
                                                                                                                    <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                                                        WORK DAYS
                                                                                                                    </label>
                                                                                                                    <input
                                                                                                                        name="work_days"
                                                                                                                        defaultValue={data2.work_days}
                                                                                                                        onChange={(e) => { setWork_daysEdit(e.target.value) }}
                                                                                                                        type="text"
                                                                                                                        className=" w-full  border-2 border-stroke rounded-md"
                                                                                                                    />
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>

                                                                                                        <div className="flex w-full justify-end">
                                                                                                            <button
                                                                                                                onClick={() => PutSubTask(data2.id)}
                                                                                                                className="bg-[#0065DE] text-center text-white text-xs font-bold px-6 py-3 rounded-md"
                                                                                                            >
                                                                                                                SIMPAN
                                                                                                            </button>
                                                                                                        </div>

                                                                                                    </>
                                                                                                </ModalKosongan>
                                                                                            </>
                                                                                        )}
                                                                                        <button
                                                                                            title="button"
                                                                                            className="text-xs w-full font-bold px-1 bg-red-700 py-2 text-white rounded-md"
                                                                                            onClick={() => DeleteSubTask(data2.id)}
                                                                                        >
                                                                                            Hapus
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
                                                        judul={'Tambah Sub-Task'}
                                                    >
                                                        <>
                                                            <form onSubmit={(e) => {
                                                                e.preventDefault()
                                                                TambahSubTask(data.id, i)
                                                            }}>
                                                                <div className="grid grid-cols-2 gap-2 px-[1%] py-[1%]">
                                                                    <div>
                                                                        <div className='flex flex-col '>
                                                                            <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                NAMA TASK
                                                                            </label>
                                                                            <label htmlFor="" className='text-[#7a7a7a] text-xl font-normal'>
                                                                                {data.task}
                                                                            </label>
                                                                        </div>
                                                                        <div className='flex flex-col '>
                                                                            <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                TANGGAL MULAI
                                                                            </label>
                                                                            <label htmlFor="" className='text-[#7a7a7a] text-xl font-normal'>
                                                                                {(data.start == null || data.start == 0) ? '-' : convertTimeStampToDate(data.start)}
                                                                            </label>
                                                                        </div>
                                                                        <div className='flex flex-col '>
                                                                            <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                TANGGAL SELESAI
                                                                            </label>
                                                                            <label htmlFor="" className='text-[#7a7a7a] text-xl font-normal'>
                                                                                {(data.end == null || data.end == 0) ? '-' : convertTimeStampToDate(data.end)}
                                                                            </label>
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <div className='flex flex-col '>
                                                                            <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                DAYS
                                                                            </label>
                                                                            <label htmlFor="" className='text-[#7a7a7a] text-xl font-normal'>
                                                                                {data.days}
                                                                            </label>
                                                                        </div>
                                                                        <div className='flex flex-col '>
                                                                            <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                %DONE
                                                                            </label>
                                                                            <label htmlFor="" className='text-[#7a7a7a] text-xl font-normal'>
                                                                                {data.done} %
                                                                            </label>
                                                                        </div>
                                                                        <div className='flex flex-col '>
                                                                            <label htmlFor="" className='text-black text-xs font-bold'>
                                                                                WORK DAYS
                                                                            </label>
                                                                            <label htmlFor="" className='text-[#7a7a7a] text-xl font-normal'>
                                                                                {data.work_days}
                                                                            </label>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-2 px-[1%] py-[1%]">
                                                                    <div className="flex w-full gap-2 flex-row  ">
                                                                        <label className="text-black text-xs font-bold w-13">
                                                                            Task
                                                                        </label>
                                                                        <div className="flex w-full">
                                                                            <input
                                                                                name="serial_number"
                                                                                onChange={(e) => { setTask(e.target.value) }}
                                                                                type="text"
                                                                                className=" w-full h-10 border-2 border-stroke rounded-md"
                                                                            />
                                                                        </div>

                                                                    </div>
                                                                    <div className="flex w-full flex-row gap-2  ">
                                                                        <label className="text-black text-xs font-bold w-13">
                                                                            Start
                                                                        </label>
                                                                        <div className="flex w-full">
                                                                            <input
                                                                                name="nama_mesin"
                                                                                onChange={(e) => { setStart(e.target.value) }}
                                                                                type="date"
                                                                                className=" w-full h-10 border-2 border-stroke rounded-md"
                                                                            />
                                                                        </div>

                                                                    </div>
                                                                    <div className="flex w-full flex-row gap-2  ">
                                                                        <label className="text-black text-xs font-bold w-13">
                                                                            End
                                                                        </label>
                                                                        <div className="flex w-full">
                                                                            <input
                                                                                name="kode_mesin"
                                                                                onChange={(e) => { setEnd(e.target.value) }}
                                                                                type="date"
                                                                                className=" w-full h-10 border-2 border-stroke rounded-md"
                                                                            />
                                                                        </div>

                                                                    </div>
                                                                    <div className="flex w-full flex-row gap-2  ">
                                                                        <label className="text-black text-xs font-bold w-13">
                                                                            Days
                                                                        </label>
                                                                        <div className="flex w-full">
                                                                            <input
                                                                                name="lokasi_mesin"
                                                                                onChange={(e) => { setDays(e.target.value) }}
                                                                                type="text"
                                                                                className=" w-full h-10 border-2 border-stroke rounded-md"
                                                                            />
                                                                        </div>

                                                                    </div>
                                                                    <div className="flex w-full flex-row gap-2  ">
                                                                        <label className="text-black text-xs font-bold w-13">
                                                                            Done
                                                                        </label>
                                                                        <div className="flex w-full">
                                                                            <input
                                                                                name="bagian_mesin"
                                                                                onChange={(e) => { setDone(e.target.value) }}
                                                                                type="text"
                                                                                className=" w-full h-10 border-2 border-stroke rounded-md"
                                                                            />
                                                                        </div>

                                                                    </div>
                                                                    <div className="flex w-full flex-row gap-2  ">
                                                                        <label className="text-black text-xs font-bold w-13">
                                                                            Work Days
                                                                        </label>
                                                                        <div className="flex w-full">
                                                                            <input
                                                                                name="bagian_mesin"
                                                                                onChange={(e) => { setWork_days(e.target.value) }}
                                                                                type="text"
                                                                                className=" w-full h-10 border-2 border-stroke rounded-md"
                                                                            />
                                                                        </div>

                                                                    </div>
                                                                    <div className="flex w-full flex-row gap-2  ">
                                                                        <label className="text-black text-xs font-bold w-13">
                                                                            Lead
                                                                        </label>
                                                                        <div className="flex w-full">
                                                                            <input
                                                                                name="bagian_mesin"
                                                                                onChange={(e) => { setLead(e.target.value) }}
                                                                                type="text"
                                                                                className=" w-full h-10 border-2 border-stroke rounded-md"
                                                                            />
                                                                        </div>

                                                                    </div>
                                                                    <div className="flex w-full flex-row gap-2  ">
                                                                        <label className="text-black text-xs font-bold w-13">
                                                                            QTY
                                                                        </label>
                                                                        <div className="flex w-full">
                                                                            <input
                                                                                name="bagian_mesin"
                                                                                onChange={(e) => { setQty(e.target.value) }}
                                                                                type="text"
                                                                                className=" w-full h-10 border-2 border-stroke rounded-md"
                                                                            />
                                                                        </div>

                                                                    </div>
                                                                    <div className="flex w-full flex-row gap-2  ">
                                                                        <label className="text-black text-xs font-bold w-13 ">
                                                                            Problem
                                                                        </label>
                                                                        <div className="flex w-full">
                                                                            <input
                                                                                name="bagian_mesin"
                                                                                onChange={(e) => { setProblem(e.target.value) }}
                                                                                type="text"
                                                                                className=" w-full h-10 border-2 border-stroke rounded-md"
                                                                            />
                                                                        </div>

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
                                                    </ModalKosongan>
                                                </>
                                            )}
                                        </div >
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


        </main >
    );
}

export default ProjectMtc;
