import { useEffect, useRef, useState } from 'react';
import Arrow from '../../../images/icon/arrowDown.svg';
import axios from 'axios';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Loading from '../../Loading';
import ModalKosongan from '../../Modals/Qc/NCR/NCRResponQC';
import convertTimeStampToDate from '../../../utils/convertDate';
import ModalFull from '../PPIC/JadwalProduksi/ModalFull';

function ProjectMtc() {
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [task, setTask] = useState<any>();
  const [start, setStart] = useState<any>();
  const [end, setEnd] = useState<any>();
  const [days, setDays] = useState<any>();
  const [done, setDone] = useState<any>();
  const [work_days, setWork_days] = useState<any>();
  const [Lead, setLead] = useState<any>();
  const [Qty, setQty] = useState<any>();
  const [Problem, setProblem] = useState<any>();

  const [taskEdit, setTaskEdit] = useState<any>();
  const [startEdit, setStartEdit] = useState<any>();
  const [endEdit, setEndEdit] = useState<any>();
  const [daysEdit, setDaysEdit] = useState<any>();
  const [doneEdit, setDoneEdit] = useState<any>();
  const [work_daysEdit, setWork_daysEdit] = useState<any>();
  const [LeadEdit, setLeadEdit] = useState<any>();
  const [QtyEdit, setQtyEdit] = useState<any>();
  const [ProblemEdit, setProblemEdit] = useState<any>();
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
        },
      );
      setTask('');
      setStart('');
      setEnd('');
      setDays('');
      setDone('');
      setWork_days('');
      setLead('');
      setQty('');
      setProblem('');
      CloseTambah();
      getTiket();
    } catch (error) {
      console.log(error);
    }
  }

  async function putTask(id: any, i: any) {
    try {
      const url = `${import.meta.env.VITE_API_LINK}/mtc/ProjectMtc/${id}`;
      const res = await axios.put(
        url,
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
        },
      );
      setTaskEdit('');
      setStartEdit('');
      setEndEdit('');
      setDaysEdit('');
      setDoneEdit('');
      setWork_daysEdit('');
      closeModalEditPJ(i);
      alert('Data Berhasil Di-Update');
      getTiket();
    } catch (error: any) {
      console.log(error);
    }
  }
  async function TambahSubTask(id: any, i: any) {
    try {
      const url = `${import.meta.env.VITE_API_LINK}/mtc/subProjectMtc`;
      const res = await axios.post(
        url,
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
        },
      );
      setTask('');
      setStart('');
      setEnd('');
      setDays('');
      setDone('');
      setWork_days('');
      setLead('');
      setQty('');
      setProblem('');
      getTiket();
      closeModal1(i);
    } catch (error: any) {
      console.log(error);
    }
  }
  async function PutSubTask(id: any) {
    try {
      const url = `${import.meta.env.VITE_API_LINK}/mtc/subProjectMtc/${id}`;
      const res = await axios.put(
        url,
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
        },
      );
      setTaskEdit('');
      setStartEdit('');
      setEndEdit('');
      setDaysEdit('');
      setDoneEdit('');
      setWork_daysEdit('');
      setLeadEdit('');
      setQtyEdit('');
      setProblemEdit('');
      alert('Data Berhasil Di-Update');
      getTiket();
    } catch (error: any) {
      console.log(error);
    }
  }
  async function DeleteTask(id: any) {
    if (window.confirm('Apakah Anda yakin ingin Menghapus Task Ini?')) {
      try {
        const url = `${import.meta.env.VITE_API_LINK}/mtc/projectMtc/${id}`;
        const res = await axios.delete(url, {
          withCredentials: true,
        });
        alert('Data Berhasil Di-Hapus');
        getTiket();
      } catch (error: any) {
        console.log(error);
      }
    }
  }
  async function DeleteSubTask(id: any) {
    if (window.confirm('Apakah Anda yakin ingin Menghapus Sub Task Ini?')) {
      try {
        const url = `${import.meta.env.VITE_API_LINK}/mtc/subProjectMtc/${id}`;
        const res = await axios.delete(url, {
          withCredentials: true,
        });
        alert('Data Berhasil Di-Hapus');
        getTiket();
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
  const [showTambah, setShowTambah] = useState<any>(false);
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
    getTiket();
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
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }
  async function getTiket() {
    const url = `${import.meta.env.VITE_API_LINK}/mtc/projectMtc`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        params: {
          // page: page,
          // limit: 10,
        },
        withCredentials: true,
      });
      setIsLoading(false);
      setTiket(res.data);
      console.log(res.data);

      let data: any[] = [];
      for (let i = 0; i < res.data.data.length; i++) {
        data.push({ i: false, ii: [] });
        for (let ii = 0; ii < res.data.data[i].sub_project.length; ii++) {
          data[i].ii.push(false);
        }
      }
      setShowModal1(data);
      setShowModalEdit(data);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }

  const [showDetail, setShowDetail] = useState<boolean[]>(
    new Array(tiket != null && tiket.length).fill(false),
  );
  const [showView, setShowView] = useState<any>(false);
  const OpenView = () => {
    setShowView(true);
  };
  const CloseView = () => {
    setShowView(false);
  };
  const calculateTimeProgress = (start: any, end: any, done: number) => {
    if (!start || !end) {
      console.error('Invalid timestamps:', { start, end });
      return { progress: 0, overdue: false };
    }

    // Convert to JavaScript Date objects directly (since they are already in ISO format)
    const startDate = new Date(start);
    const endDate = new Date(end);
    const today = new Date();

    // Ensure startDate and endDate are valid
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.error('Invalid Date conversion:', { startDate, endDate });
      return { progress: 0, overdue: false };
    }

    // Reset time (hours, minutes, seconds) for accurate date-based calculations
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    today.setHours(0, 0, 0, 0);

    // Calculate if task is overdue - end date has passed and task is not 100% complete
    const overdue = today > endDate && done < 100;

    // If today is before the start date, progress is 0%
    if (today < startDate) return { progress: 0, overdue };

    // If today is after the end date, progress is 100% (for timeline calculation only)
    if (today > endDate) return { progress: 100, overdue };

    // Calculate progress based on elapsed days
    const totalDays = Math.max(
      1,
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    const elapsedDays =
      (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

    // Ensure percentage stays within range
    const progress = Math.min(
      100,
      Math.max(0, Math.round((elapsedDays / totalDays) * 100)),
    );

    return { progress, overdue };
  };

  return (
    <main>
      <div className="flex  gap-1 items-center bg-white ">
        {isLoading && <Loading />}
        <div className="w-full flex  p-3">
          <div className="flex ">
            <button
              onClick={() => OpenView()}
              className="bg-primary text-white px-5 py-2 rounded-md my-auto font-semibold"
            >
              Open Overview Progress
            </button>
          </div>
          {showView == true && (
            <>
              <ModalFull
                isOpen={showView}
                onClose={() => CloseView()}
                judul={'View Task'}
              >
                <>
                  <div className="w-full px-4 py-6 bg-white rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-6 text-gray-800">
                      Task Progress Overview
                    </h2>

                    {tiket != null &&
                      tiket.data.map((data: any, i: any) => {
                        const mainTimelineStatus = calculateTimeProgress(
                          data.start,
                          data.end,
                          data.done,
                        );

                        return (
                          <div key={i} className="mb-8">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-semibold text-black">
                                {data.task}
                              </span>
                              <span className="text-sm font-bold">
                                {data.done}%
                              </span>
                            </div>

                            {/* Date range display for main task */}
                            <div className="flex justify-between mb-1">
                              <span className="text-xs text-gray-600">
                                Done Progress :
                              </span>
                              <span className="text-xs text-gray-600">
                                {data.days} days | {data.work_days} work days
                              </span>
                            </div>

                            {/* Main Task Progress Bar (Completion %) */}
                            <div className="w-full bg-gray-200 rounded-full h-4 mb-1">
                              <div
                                className="bg-blue-600 h-4 rounded-full"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    Math.max(0, data.done),
                                  )}%`,
                                }}
                              ></div>
                            </div>

                            {/* Timeline Progress Bar for Main Task */}
                            <div className="flex justify-between mb-1">
                              <div className="flex items-center">
                                <span className="text-xs text-gray-600">
                                  Timeline progress :{' '}
                                  {convertTimeStampToDate(data.start)} -{' '}
                                  {convertTimeStampToDate(data.end)}
                                </span>
                                {mainTimelineStatus.overdue && (
                                  <span className="ml-2 px-2 py-0.5 text-xs font-medium text-white bg-red-600 rounded">
                                    Overdue
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-gray-600">
                                {mainTimelineStatus.progress}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                              <div
                                className={`h-2 rounded-full ${
                                  mainTimelineStatus.overdue
                                    ? 'bg-red-600'
                                    : 'bg-orange-400'
                                }`}
                                style={{
                                  width: `${Math.min(
                                    100,
                                    Math.max(0, mainTimelineStatus.progress),
                                  )}%`,
                                }}
                              ></div>
                            </div>

                            {/* Subtasks Section */}
                            <div className="pl-4 border-l-2 border-gray-300">
                              {data.sub_project &&
                                data.sub_project.map((data2: any, ii: any) => {
                                  const subTimelineStatus =
                                    calculateTimeProgress(
                                      data2.start,
                                      data2.end,
                                      data2.done,
                                    );

                                  return (
                                    <div key={ii} className="mb-4">
                                      <div className="flex justify-between mb-1">
                                        <span className="text-sm font-semibold text-black">
                                          {data2.task}
                                        </span>
                                        <span className="text-sm font-medium">
                                          {data2.done}%
                                        </span>
                                      </div>

                                      {/* Date range display for subtask */}
                                      <div className="flex justify-between mb-1">
                                        <span className="text-xs text-gray-600">
                                          Done Progress :
                                        </span>
                                        <span className="text-xs text-gray-600">
                                          Lead: {data2.lead || 'N/A'} | Qty:{' '}
                                          {data2.qty || 'N/A'}
                                        </span>
                                      </div>

                                      {/* Subtask Progress Bar (Completion %) */}
                                      <div className="w-full bg-gray-200 rounded-full h-3 mb-1">
                                        <div
                                          className="bg-green-500 h-3 rounded-full"
                                          style={{
                                            width: `${Math.min(
                                              100,
                                              Math.max(0, data2.done),
                                            )}%`,
                                          }}
                                        ></div>
                                      </div>

                                      {/* Timeline Progress Bar for Subtask */}
                                      <div className="flex justify-between mb-1">
                                        <div className="flex items-center">
                                          <span className="text-xs text-gray-600">
                                            Timeline progress :{' '}
                                            {convertTimeStampToDate(
                                              data2.start,
                                            )}{' '}
                                            -{' '}
                                            {convertTimeStampToDate(data2.end)}
                                          </span>
                                          {subTimelineStatus.overdue && (
                                            <span className="ml-2 px-2 py-0.5 text-xs font-medium text-white bg-red-600 rounded">
                                              Overdue
                                            </span>
                                          )}
                                        </div>
                                        <span className="text-xs text-gray-600">
                                          {subTimelineStatus.progress}%
                                        </span>
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                                        <div
                                          className={`h-1.5 rounded-full ${
                                            subTimelineStatus.overdue
                                              ? 'bg-red-600'
                                              : 'bg-yellow-400'
                                          }`}
                                          style={{
                                            width: `${Math.min(
                                              100,
                                              Math.max(
                                                0,
                                                subTimelineStatus.progress,
                                              ),
                                            )}%`,
                                          }}
                                        ></div>
                                      </div>

                                      {/* Problem display if present */}
                                      {data2.problem && (
                                        <div className="mt-1">
                                          <span className="text-xs text-red-600">
                                            Problem: {data2.problem}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </>
              </ModalFull>
            </>
          )}
        </div>
        <div className="w-full flex justify-end p-3">
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
                <form
                  onSubmit={TambahTask}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Add New Task
                  </h2>

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
                      <p className="text-xs text-gray-500">
                        Automatically calculated
                      </p>
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
                      <p className="text-xs text-gray-500">
                        Automatically calculated
                      </p>
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
        {/* Header Row */}
        <div className="flex bg-gray-100 mt-2 py-3 rounded-t-lg shadow-sm">
          <p className="w-10 px-3 text-xs font-bold text-gray-700 my-auto">
            No
          </p>
          <div className="grid grid-cols-12 w-full gap-2">
            <div className="flex gap-2 col-span-2">
              <p className="text-xs font-bold text-gray-700">TASK</p>
            </div>
            <div className="flex gap-2 col-span-4">{/* Empty column */}</div>
            <div className="flex gap-2">
              <p className="text-xs font-bold text-gray-700">START</p>
            </div>
            <div className="flex gap-2">
              <p className="text-xs font-bold text-gray-700">END</p>
            </div>
            <div className="flex gap-2">
              <p className="text-xs font-bold text-gray-700">DAYS</p>
            </div>
            <div className="flex gap-2">
              <p className="text-xs font-bold text-gray-700">% DONE</p>
            </div>
            <div className="flex gap-2">
              <p className="text-xs font-bold text-gray-700">WORK DAYS</p>
            </div>
            <div className="flex gap-2">
              <p className="text-xs font-bold text-gray-700">ACTION</p>
            </div>
          </div>
        </div>

        {/* Task Items Container */}
        <div className="bg-white rounded-b-lg shadow-sm mb-6">
          <div className="min-w-screen">
            {tiket != null &&
              tiket.data.map((data: any, i: any) => {
                return (
                  <>
                    <div className="my-1">
                      <section className="flex bg-white hover:bg-gray-50 transition-colors duration-150 py-2 border-2 border-blue-400 rounded-md">
                        <div
                          key={i}
                          className="py-3 w-10 px-3 flex justify-center items-center"
                        >
                          <span className="text-xs font-medium text-gray-700">
                            {i + 1 + (page - 1) * 10}
                          </span>
                        </div>
                        <div className="grid grid-cols-12 w-full gap-2">
                          {/* Task Name */}
                          <div className="flex flex-col md:gap-5 gap-1 w-full col-span-2">
                            <div className="my-auto">
                              <p className="text-xs font-bold text-gray-800 break-all">
                                {data.task}
                              </p>
                            </div>
                          </div>

                          {/* Empty columns */}
                          <div className="flex flex-col md:gap-5 gap-1">
                            <div className="my-auto">
                              <p className="text-xs font-bold"></p>
                            </div>
                          </div>
                          <div className="flex flex-col md:gap-5 gap-1">
                            <div className="my-auto">
                              <p className="text-xs font-bold"></p>
                            </div>
                          </div>
                          <div className="flex flex-col md:gap-5 gap-1 col-span-2">
                            <div className="my-auto w-full">
                              <p className="text-xs font-bold"></p>
                            </div>
                          </div>

                          {/* Start Date */}
                          <div className="flex flex-col md:gap-5 gap-1">
                            <div className="my-auto">
                              <p className="text-xs font-medium text-gray-700">
                                {data.start == null || data.start == 0
                                  ? '-'
                                  : convertTimeStampToDate(data.start)}
                              </p>
                            </div>
                          </div>

                          {/* End Date */}
                          <div className="flex items-center md:gap-5 gap-1">
                            <div className="flex text-xs font-medium text-gray-700">
                              {data.end == null || data.end == 0
                                ? '-'
                                : convertTimeStampToDate(data.end)}
                            </div>
                          </div>

                          {/* Days */}
                          <div className="flex flex-col md:gap-5 gap-1">
                            <div className="my-auto">
                              <p className="text-xs font-medium text-gray-700">
                                {data.days} Hari
                              </p>
                            </div>
                          </div>

                          {/* Completion Percentage */}
                          <div className="flex items-center md:gap-5 gap-1 p-2">
                            <div className="my-auto">
                              <div className="flex flex-col items-center gap-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      data.done >= 100
                                        ? 'bg-green-500'
                                        : data.done >= 70
                                        ? 'bg-blue-500'
                                        : data.done >= 30
                                        ? 'bg-yellow-500'
                                        : 'bg-red-500'
                                    }`}
                                    style={{
                                      width: `${Math.min(
                                        100,
                                        Math.max(0, data.done),
                                      )}%`,
                                    }}
                                  ></div>
                                </div>
                                <p className="text-xs font-bold text-gray-700">
                                  {data.done}%
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Work Days */}
                          <div className="flex flex-col md:gap-5 gap-1">
                            <div className="my-auto">
                              <p className="text-xs font-medium text-gray-700">
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
                                    <div className="grid grid-cols-2 gap-4 px-4 py-3">
                                      <div className="flex flex-col w-full">
                                        <label className="text-black text-xs font-bold mb-1">
                                          Task
                                        </label>
                                        <input
                                          defaultValue={data.task}
                                          name="serial_number"
                                          onChange={(e) =>
                                            setTaskEdit(e.target.value)
                                          }
                                          type="text"
                                          className="w-full h-10 px-3 py-2 border-2 border-stroke rounded-md"
                                        />
                                      </div>

                                      <div className="flex flex-col w-full">
                                        <span className="text-black text-xs font-bold mb-1">
                                          Start :{' '}
                                          {data.start == null || data.start == 0
                                            ? '-'
                                            : convertTimeStampToDate(
                                                data.start,
                                              )}
                                        </span>
                                        <input
                                          name="nama_mesin"
                                          onChange={(e) =>
                                            setStartEdit(e.target.value)
                                          }
                                          type="date"
                                          className="w-full h-10 px-3 py-2 border-2 border-stroke rounded-md"
                                        />
                                      </div>

                                      <div className="flex flex-col w-full">
                                        <span className="text-black text-xs font-bold mb-1">
                                          End :{' '}
                                          {data.end == null || data.end == 0
                                            ? '-'
                                            : convertTimeStampToDate(data.end)}
                                        </span>
                                        <input
                                          name="kode_mesin"
                                          onChange={(e) =>
                                            setEndEdit(e.target.value)
                                          }
                                          type="date"
                                          className="w-full h-10 px-3 py-2 border-2 border-stroke rounded-md"
                                        />
                                      </div>

                                      <div className="flex flex-col w-full">
                                        <label className="text-black text-xs font-bold mb-1">
                                          Days
                                        </label>
                                        <input
                                          defaultValue={data.days}
                                          name="lokasi_mesin"
                                          onChange={(e) =>
                                            setDaysEdit(e.target.value)
                                          }
                                          type="text"
                                          className="w-full h-10 px-3 py-2 border-2 border-stroke rounded-md"
                                        />
                                      </div>

                                      <div className="flex flex-col w-full">
                                        <label className="text-black text-xs font-bold mb-1">
                                          Done
                                        </label>
                                        <input
                                          defaultValue={data.done}
                                          name="bagian_mesin"
                                          onChange={(e) =>
                                            setDoneEdit(e.target.value)
                                          }
                                          type="text"
                                          className="w-full h-10 px-3 py-2 border-2 border-stroke rounded-md"
                                        />
                                      </div>

                                      <div className="flex flex-col w-full">
                                        <label className="text-black text-xs font-bold mb-1">
                                          Work Days
                                        </label>
                                        <input
                                          defaultValue={data.work_days}
                                          name="bagian_mesin"
                                          onChange={(e) =>
                                            setWork_daysEdit(e.target.value)
                                          }
                                          type="text"
                                          className="w-full h-10 px-3 py-2 border-2 border-stroke rounded-md"
                                        />
                                      </div>
                                    </div>

                                    <div className="flex w-full justify-end pt-4">
                                      <button
                                        onClick={() => putTask(data.id, i)}
                                        className="bg-[#0065DE] text-white text-xs font-bold px-6 py-3 rounded-md shadow-md hover:bg-[#0055C4] transition"
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
                            <div className="">
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
                          <div className="w-full flex flex-col bg-white border-2 border-blue-500  rounded-lg">
                            {data.sub_project.map((data2: any, ii: any) => {
                              return (
                                <>
                                  <div className="flex py-2 rounded-lg hover:bg-gray-50 transition-colors duration-150 border-b border-gray">
                                    <div
                                      key={ii}
                                      className="py-3 w-10 px-3 flex justify-center items-center font-medium text-gray-700"
                                    >
                                      {i + 1}.{ii + 1}
                                    </div>
                                    <div className="grid grid-cols-12 w-full gap-2">
                                      {/* Task Name */}
                                      <div className="flex flex-col md:gap-5 gap-1 w-full col-span-2">
                                        <div className="my-auto">
                                          <p className="text-xs font-semibold text-gray-800 break-all">
                                            {data2.task}
                                          </p>
                                        </div>
                                      </div>

                                      {/* Lead */}
                                      <div className="flex flex-col md:gap-5 gap-1">
                                        <div className="my-auto">
                                          <p className="text-xs font-medium text-gray-700">
                                            {data2.lead || '-'}
                                          </p>
                                        </div>
                                      </div>

                                      {/* Quantity */}
                                      <div className="flex flex-col md:gap-5 gap-1">
                                        <div className="my-auto">
                                          <p className="text-xs font-medium text-gray-700">
                                            {data2.qty || '-'}
                                          </p>
                                        </div>
                                      </div>

                                      {/* Problem */}
                                      <div className="flex flex-col md:gap-5 gap-1 col-span-2">
                                        <div className="my-auto w-full">
                                          <p
                                            className={`text-xs font-medium ${
                                              data2.problem
                                                ? 'text-red-600'
                                                : 'text-gray-400'
                                            }`}
                                          >
                                            {data2.problem || 'No issues'}
                                          </p>
                                        </div>
                                      </div>

                                      {/* Start Date */}
                                      <div className="flex flex-col md:gap-5 gap-1">
                                        <div className="my-auto">
                                          <p className="text-xs font-medium text-gray-700">
                                            {data2.start == null ||
                                            data2.start == 0
                                              ? '-'
                                              : convertTimeStampToDate(
                                                  data2.start,
                                                )}
                                          </p>
                                        </div>
                                      </div>

                                      {/* End Date */}
                                      <div className="flex items-center md:gap-5 gap-1">
                                        <div className="flex text-xs font-medium text-gray-700">
                                          {data2.end == null || data2.end == 0
                                            ? '-'
                                            : convertTimeStampToDate(data2.end)}
                                        </div>
                                      </div>

                                      {/* Days */}
                                      <div className="flex flex-col md:gap-5 gap-1">
                                        <div className="my-auto">
                                          <p className="text-xs font-medium text-gray-700">
                                            {data2.days} Hari
                                          </p>
                                        </div>
                                      </div>

                                      {/* Completion Percentage */}
                                      <div className="flex items-center md:gap-5 gap-1 p-2">
                                        <div className="my-auto ">
                                          <div className="flex flex-col items-center gap-2">
                                            <div className="w-16 bg-gray-200 rounded-full h-2">
                                              <div
                                                className={`h-2 rounded-full ${
                                                  data2.done >= 100
                                                    ? 'bg-green-500'
                                                    : data2.done >= 70
                                                    ? 'bg-blue-500'
                                                    : data2.done >= 30
                                                    ? 'bg-yellow-500'
                                                    : 'bg-red-500'
                                                }`}
                                                style={{
                                                  width: `${Math.min(
                                                    100,
                                                    Math.max(0, data2.done),
                                                  )}%`,
                                                }}
                                              ></div>
                                            </div>
                                            <p className="text-xs font-bold text-gray-700">
                                              {data2.done}%
                                            </p>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Work Days */}
                                      <div className="flex flex-col md:gap-5 gap-1">
                                        <div className="my-auto">
                                          <p className="text-xs font-medium text-gray-700">
                                            {data2.work_days} Hari
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex gap-2 items-center md:mb-0 mb-2 ">
                                        <div>
                                          <div className="flex gap-2">
                                            <button
                                              title="button"
                                              className="text-xs w-full font-bold px-1 bg-blue-700 py-2 text-white rounded-md"
                                              onClick={() =>
                                                openModalEdit(i, ii)
                                              }
                                            >
                                              Edit
                                            </button>
                                            {showModalEdit[i].ii[ii] ==
                                              true && (
                                              <>
                                                <ModalKosongan
                                                  isOpen={
                                                    showModalEdit[i].ii[ii]
                                                  }
                                                  onClose={() =>
                                                    closeModalEdit(i, ii)
                                                  }
                                                  judul={'Edit Sub-Task'}
                                                >
                                                  <>
                                                    <div className="grid grid-cols-3 gap-4 px-4 py-4">
                                                      <div className="space-y-4">
                                                        <div className="flex flex-col">
                                                          <label className="text-black text-xs font-bold">
                                                            NAMA TASK
                                                          </label>
                                                          <input
                                                            name="task"
                                                            defaultValue={
                                                              data2.task
                                                            }
                                                            onChange={(e) =>
                                                              setTaskEdit(
                                                                e.target.value,
                                                              )
                                                            }
                                                            type="text"
                                                            className="w-full border-2 border-stroke rounded-md p-2"
                                                          />
                                                        </div>
                                                        <div className="flex flex-col">
                                                          <label className="text-black text-xs font-bold">
                                                            TANGGAL MULAI
                                                          </label>
                                                          <label className="text-[#7a7a7a] text-sm">
                                                            {data2.start ==
                                                              null ||
                                                            data2.start == 0
                                                              ? '-'
                                                              : convertTimeStampToDate(
                                                                  data2.start,
                                                                )}
                                                          </label>
                                                          <input
                                                            name="start"
                                                            onChange={(e) =>
                                                              setStartEdit(
                                                                e.target.value,
                                                              )
                                                            }
                                                            type="date"
                                                            className="w-full border-2 border-stroke rounded-md p-2"
                                                          />
                                                        </div>

                                                        <div className="flex flex-col">
                                                          <label className="text-black text-xs font-bold">
                                                            TANGGAL SELESAI
                                                          </label>
                                                          <label className="text-[#7a7a7a] text-sm">
                                                            {data2.end ==
                                                              null ||
                                                            data2.end == 0
                                                              ? '-'
                                                              : convertTimeStampToDate(
                                                                  data2.end,
                                                                )}
                                                          </label>
                                                          <input
                                                            name="end"
                                                            onChange={(e) =>
                                                              setEndEdit(
                                                                e.target.value,
                                                              )
                                                            }
                                                            type="date"
                                                            className="w-full border-2 border-stroke rounded-md p-2"
                                                          />
                                                        </div>
                                                      </div>

                                                      <div className="space-y-4">
                                                        <div className="flex flex-col">
                                                          <label className="text-black text-xs font-bold">
                                                            LEAD
                                                          </label>
                                                          <input
                                                            name="lead"
                                                            defaultValue={
                                                              data2.lead
                                                            }
                                                            onChange={(e) =>
                                                              setLeadEdit(
                                                                e.target.value,
                                                              )
                                                            }
                                                            type="text"
                                                            className="w-full border-2 border-stroke rounded-md p-2"
                                                          />
                                                        </div>
                                                        <div className="flex flex-col">
                                                          <label className="text-black text-xs font-bold">
                                                            QTY
                                                          </label>
                                                          <input
                                                            name="qty"
                                                            defaultValue={
                                                              data2.qty
                                                            }
                                                            onChange={(e) =>
                                                              setQtyEdit(
                                                                e.target.value,
                                                              )
                                                            }
                                                            type="text"
                                                            className="w-full border-2 border-stroke rounded-md p-2"
                                                          />
                                                        </div>
                                                        <div className="flex flex-col">
                                                          <label className="text-black text-xs font-bold">
                                                            PROBLEM
                                                          </label>
                                                          <input
                                                            name="problem"
                                                            defaultValue={
                                                              data2.problem
                                                            }
                                                            onChange={(e) =>
                                                              setProblemEdit(
                                                                e.target.value,
                                                              )
                                                            }
                                                            type="text"
                                                            className="w-full border-2 border-stroke rounded-md p-2"
                                                          />
                                                        </div>
                                                      </div>

                                                      <div className="space-y-4">
                                                        <div className="flex flex-col">
                                                          <label className="text-black text-xs font-bold">
                                                            DAYS
                                                          </label>
                                                          <input
                                                            name="days"
                                                            defaultValue={
                                                              data2.days
                                                            }
                                                            onChange={(e) =>
                                                              setDaysEdit(
                                                                e.target.value,
                                                              )
                                                            }
                                                            type="text"
                                                            className="w-full border-2 border-stroke rounded-md p-2"
                                                          />
                                                        </div>
                                                        <div className="flex flex-col">
                                                          <label className="text-black text-xs font-bold">
                                                            %DONE
                                                          </label>
                                                          <input
                                                            name="done"
                                                            defaultValue={
                                                              data2.done
                                                            }
                                                            onChange={(e) =>
                                                              setDoneEdit(
                                                                e.target.value,
                                                              )
                                                            }
                                                            type="text"
                                                            className="w-full border-2 border-stroke rounded-md p-2"
                                                          />
                                                        </div>
                                                        <div className="flex flex-col">
                                                          <label className="text-black text-xs font-bold">
                                                            WORK DAYS
                                                          </label>
                                                          <input
                                                            name="work_days"
                                                            defaultValue={
                                                              data2.work_days
                                                            }
                                                            onChange={(e) =>
                                                              setWork_daysEdit(
                                                                e.target.value,
                                                              )
                                                            }
                                                            type="text"
                                                            className="w-full border-2 border-stroke rounded-md p-2"
                                                          />
                                                        </div>
                                                      </div>
                                                    </div>

                                                    <div className="flex w-full justify-end mt-4">
                                                      <button
                                                        onClick={() =>
                                                          PutSubTask(data2.id)
                                                        }
                                                        className="bg-[#0065DE] text-white text-xs font-bold px-6 py-3 rounded-md transition duration-200 hover:bg-[#0051b3]"
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
                                              onClick={() =>
                                                DeleteSubTask(data2.id)
                                              }
                                            >
                                              Hapus
                                            </button>
                                          </div>
                                        </div>
                                        <div className="mx-2"></div>
                                      </div>
                                    </div>
                                  </div>
                                </>
                              );
                            })}
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
                              <form
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  TambahSubTask(data.id, i);
                                }}
                                className="bg-white rounded-lg shadow-md p-4"
                              >
                                {/* Parent Task Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-md">
                                  <div className="space-y-3">
                                    <div className="flex flex-col">
                                      <label className="text-gray-700 text-xs font-bold uppercase">
                                        Main Task
                                      </label>
                                      <span className="text-gray-600 text-lg font-medium">
                                        {data.task}
                                      </span>
                                    </div>
                                    <div className="flex flex-col">
                                      <label className="text-gray-700 text-xs font-bold uppercase">
                                        Start Date
                                      </label>
                                      <span className="text-gray-600 text-lg font-medium">
                                        {data.start == null || data.start == 0
                                          ? '-'
                                          : convertTimeStampToDate(data.start)}
                                      </span>
                                    </div>
                                    <div className="flex flex-col">
                                      <label className="text-gray-700 text-xs font-bold uppercase">
                                        End Date
                                      </label>
                                      <span className="text-gray-600 text-lg font-medium">
                                        {data.end == null || data.end == 0
                                          ? '-'
                                          : convertTimeStampToDate(data.end)}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="space-y-3">
                                    <div className="flex flex-col">
                                      <label className="text-gray-700 text-xs font-bold uppercase">
                                        Total Days
                                      </label>
                                      <span className="text-gray-600 text-lg font-medium">
                                        {data.days}
                                      </span>
                                    </div>
                                    <div className="flex flex-col">
                                      <label className="text-gray-700 text-xs font-bold uppercase">
                                        Completion
                                      </label>
                                      <span className="text-gray-600 text-lg font-medium">
                                        {data.done} %
                                      </span>
                                    </div>
                                    <div className="flex flex-col">
                                      <label className="text-gray-700 text-xs font-bold uppercase">
                                        Work Days
                                      </label>
                                      <span className="text-gray-600 text-lg font-medium">
                                        {data.work_days}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Subtask Form Fields */}
                                <h3 className="text-lg font-bold text-gray-800 mb-4">
                                  Add Subtask
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                  {/* Task Name */}
                                  <div className="space-y-1">
                                    <label className="block text-sm font-semibold text-gray-700">
                                      Task Name
                                    </label>
                                    <input
                                      type="text"
                                      onChange={(e) => setTask(e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                      required
                                    />
                                  </div>

                                  {/* Start Date */}
                                  <div className="space-y-1">
                                    <label className="block text-sm font-semibold text-gray-700">
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
                                  <div className="space-y-1">
                                    <label className="block text-sm font-semibold text-gray-700">
                                      End Date
                                    </label>
                                    <input
                                      type="date"
                                      onChange={(e) => setEnd(e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                      required
                                    />
                                  </div>

                                  {/* Days (Auto-calculated) */}
                                  <div className="space-y-1">
                                    <label className="block text-sm font-semibold text-gray-700">
                                      Total Days
                                    </label>
                                    <input
                                      type="text"
                                      value={days}
                                      className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm focus:outline-none transition-all"
                                      readOnly
                                    />
                                    <p className="text-xs text-gray-500">
                                      Auto-calculated
                                    </p>
                                  </div>

                                  {/* Done Percentage */}
                                  <div className="space-y-1">
                                    <label className="block text-sm font-semibold text-gray-700">
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

                                  {/* Work Days (Auto-calculated) */}
                                  <div className="space-y-1">
                                    <label className="block text-sm font-semibold text-gray-700">
                                      Work Days (Mon-Fri)
                                    </label>
                                    <input
                                      type="text"
                                      value={work_days}
                                      className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm focus:outline-none transition-all"
                                      readOnly
                                    />
                                    <p className="text-xs text-gray-500">
                                      Auto-calculated
                                    </p>
                                  </div>

                                  {/* Lead */}
                                  <div className="space-y-1">
                                    <label className="block text-sm font-semibold text-gray-700">
                                      Lead
                                    </label>
                                    <input
                                      type="text"
                                      onChange={(e) => setLead(e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    />
                                  </div>

                                  {/* QTY */}
                                  <div className="space-y-1">
                                    <label className="block text-sm font-semibold text-gray-700">
                                      Quantity
                                    </label>
                                    <input
                                      type="number"
                                      onChange={(e) => setQty(e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    />
                                  </div>

                                  {/* Problem */}
                                  <div className="space-y-1 md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                      Problem Description
                                    </label>
                                    <input
                                      type="text"
                                      onChange={(e) =>
                                        setProblem(e.target.value)
                                      }
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    />
                                  </div>
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end mt-4">
                                  <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                  >
                                    Save Subtask
                                  </button>
                                </div>
                              </form>
                            </>
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
              }}
            />
          </Stack>
        </div>
      </>
    </main>
  );
}

export default ProjectMtc;
