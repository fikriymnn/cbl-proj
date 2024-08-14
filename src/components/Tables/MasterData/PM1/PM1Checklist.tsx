import { useEffect, useState } from 'react';
import Logo from '../../images/logo/logo-cbl 1.svg';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import ModalEditPM1Master from '../../../Modals/Master/PM1/ModalEditPM1Master';
import ModalKonfirmasi from '../../../Modals/Master/PM1/ModalKonfirmasi';

const PM1Checklist = () => {
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
      getPointPm1(res.data.id);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  const [point, setPoint] = useState<any>();

  async function getPointPm1(id_mesin: any) {
    const url = `${import.meta.env.VITE_API_LINK}/master/pointPm1`;
    try {
      const res = await axios.get(url, {
        params: {
          id_mesin: id,
        },
        withCredentials: true,
      });
      setPoint(res.data);

      let data: any[] = [];
      for (let i = 0; i < res.data.length; i++) {
        data.push(false);
      }

      setShowEdit(data);
      setShowDelete(data);
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

  const [showDelete, setShowDelete] = useState<any>([]);
  const openDelete = (i: any) => {
    const onchangeVal: any = [...showDelete];
    onchangeVal[i] = true;

    setShowDelete(onchangeVal);
  };
  const closeDelete = (i: any) => {
    const onchangeVal: any = [...showDelete];
    onchangeVal[i] = false;

    setShowDelete(onchangeVal);
  };

  return (
    <div className="rounded-xl border border-stroke bg-white pt-4 shadow-default dark:border-strokedark dark:bg-boxdark  xl:pb-1">
      {!isMobile && (
        <>
          <div className="flex w-full  gap-2 pr-8 border-b-6 border-[#D8EAFF] px-4 pb-5">
            <div className="flex flex-col w-11/12">
              <label className="text-neutral-500 text-sm font-semibold">
                Machine Details
              </label>
              <label className="text-neutral-500 text-sm font-semibold">
                Nama Mesin : {mesin != null && mesin.nama_mesin}
              </label>
            </div>
            <div className="flex w-3/12 justify-end">
              <a
                href={`/masterdata/masterpm1/pm1checklist/addinspection/${
                  mesin != null && mesin.id
                }`}
              >
                <button className="bg-[#0065DE] text-center text-white text-xs font-bold px-6 py-3 rounded-md">
                  + INSPECTION POINT
                </button>
              </a>
            </div>
          </div>

          {point != null &&
            point.map((data: any, i: number) => {
              return (
                <>
                  <div className="flex py-4 flex-col">
                    <div className="flex flex-row gap-4 px-4">
                      <label className="text-black text-xs font-bold w-20">
                        POINT
                      </label>
                      <label className="text-black text-xs font-bold w-56">
                        INSPECTION POINT
                      </label>
                      <label className="text-black text-xs font-bold w-56">
                        CATEGORY
                      </label>
                    </div>
                    <div className="flex flex-row gap-4 px-4 mt-4">
                      <label className="text-neutral-500 text-sm font-semibold w-20">
                        {i + 1}
                      </label>
                      <label className="text-neutral-500 text-sm font-semibold w-56">
                        {data.inspection_point}
                      </label>
                      <label className="text-neutral-500 text-sm font-semibold w-56">
                        {data.category}
                      </label>
                    </div>
                    <div className="flex w-full flex-row gap-4 pt-3 px-4">
                      <div className="flex w-[40px] justify-center">
                        <label className="text-neutral-500 text-sm font-semibold"></label>
                      </div>
                      <div className="flex w-10/12">
                        <label className="text-neutral-500 text-sm font-semibold"></label>
                      </div>
                      <div className="flex w-10/12">
                        <label className="text-neutral-500 text-sm font-semibold"></label>
                      </div>
                      <div className="flex flex-row gap-3">
                        <button
                          onClick={() => openEdit(i)}
                          className="bg-[#0065DE] text-center text-white text-xs font-bold px-6 py-2 rounded-md"
                        >
                          EDIT
                        </button>
                        {showEdit[i] == true && (
                          <ModalEditPM1Master
                            children={undefined}
                            isOpen={showEdit[i]}
                            onClose={() => closeEdit(i)}
                            idPoint={data.id}
                            data={data}
                          />
                        )}
                        <button
                          onClick={() => openDelete(i)}
                          className="bg-[#DE0000] text-center text-white text-xs font-bold px-6 py-2 rounded-md"
                        >
                          DELETE
                        </button>
                        {showDelete[i] == true && (
                          <ModalKonfirmasi
                            children={undefined}
                            isOpen={showDelete[i]}
                            onClose={() => closeDelete(i)}
                            idPoint={data.id}
                            onFinish={getPointPm1}
                          />
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex w-full  pt-6 border-b border-stroke ml-[70px]">
                        <label className="text-black text-xs font-bold">
                          TASK LIST
                        </label>
                      </div>
                      {data.ms_inspection_task_pm1s.map(
                        (task: any, ii: number) => {
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
                                  <label className="text-neutral-500 text-sm font-semibold">
                                    {task.task}
                                  </label>
                                  <label className="text-black text-xs font-bold pt-2">
                                    INSPECTION METHOD
                                  </label>
                                  <label className="text-neutral-500 text-sm font-semibold">
                                    {task.method}
                                  </label>
                                </div>
                                <div className="flex w-5/12 justify-start pl-6 flex-col gap-2">
                                  <label className="text-black text-xs font-bold text-start">
                                    ACCEPTANCE CRITERIA
                                  </label>
                                  <label className="text-neutral-500 text-sm font-semibold text-start">
                                    {task.acceptance_criteria}
                                  </label>
                                  <label className="text-black text-xs font-bold pt-2">
                                    TOOLS
                                  </label>
                                  <label className="text-neutral-500 text-sm font-semibold">
                                    {task.tools}
                                  </label>
                                </div>
                              </div>
                            </>
                          );
                        },
                      )}
                    </div>
                  </div>
                </>
              );
            })}
        </>
      )}
      {isMobile && (
        <>
          <div className="flex w-full  gap-2 pr-8 border-b-6 border-[#D8EAFF] px-4 pb-5">
            <div className="flex flex-col w-11/12">
              <label className="text-neutral-500 text-sm font-semibold">
                Machine Details
              </label>
              <label className="text-neutral-500 text-sm font-semibold">
                Nama Mesin : {mesin != null && mesin.nama_mesin}
              </label>
            </div>
            <div className="flex w-3/12 justify-end">
              <a
                href={`/masterdata/masterpm1/pm1checklist/addinspection/${
                  mesin != null && mesin.id
                }`}
              >
                <button className="bg-[#0065DE] text-center text-white text-xs font-bold px-2 py-1 rounded-md">
                  + INSPECTION POINT
                </button>
              </a>
            </div>
          </div>

          {point != null &&
            point.map((data: any, i: number) => {
              return (
                <>
                  <div className="flex py-4 flex-col">
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
                        <label className="text-neutral-500 text-sm font-semibold">
                          {data.inspection_point}
                        </label>
                      </div>
                      <div className="flex flex-row gap-3">
                        <button
                          onClick={() => openEdit(i)}
                          className="bg-[#0065DE] text-center text-white text-xs font-bold px-4 py-2 rounded-md"
                        >
                          EDIT
                        </button>
                        {showEdit[i] == true && (
                          <ModalEditPM1Master
                            children={undefined}
                            isOpen={showEdit[i]}
                            onClose={() => closeEdit(i)}
                            idPoint={data.id}
                            data={data}
                          />
                        )}
                        <button
                          onClick={() => openDelete(i)}
                          className="bg-[#DE0000] text-center text-white text-xs font-bold px-2 py-2 rounded-md"
                        >
                          DELETE
                        </button>
                        {showDelete[i] == true && (
                          <ModalKonfirmasi
                            children={undefined}
                            isOpen={showDelete[i]}
                            onClose={() => closeDelete(i)}
                            idPoint={data.id}
                            onFinish={getPointPm1}
                          />
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col px-2">
                      <div className="flex w-full  pt-6 border-b border-stroke">
                        <label className="text-black text-xs font-bold pl-2">
                          TASK LIST
                        </label>
                      </div>
                      {data.ms_inspection_task_pm1s.map(
                        (task: any, ii: number) => {
                          return (
                            <>
                              <div className="flex w-full  pt-4 border-b border-stroke  pb-4">
                                <div className="flex w-[60px] justify-center">
                                  <label className="text-black text-xs font-bold">
                                    {ii + 1}
                                  </label>
                                </div>
                                <div className="flex w-5/12 justify-start pl-6 flex-col gap-2">
                                  <label className="text-black text-xs font-bold">
                                    TASK
                                  </label>
                                  <label className="text-neutral-500 text-sm font-semibold">
                                    {task.task}
                                  </label>
                                  <label className="text-black text-xs font-bold pt-2">
                                    INSPECTION METHOD
                                  </label>
                                  <label className="text-neutral-500 text-sm font-semibold">
                                    {task.method}
                                  </label>
                                </div>
                                <div className="flex w-5/12 justify-start pl-6 flex-col gap-2">
                                  <label className="text-black text-xs font-bold text-start">
                                    ACCEPTANCE CRITERIA
                                  </label>
                                  <label className="text-neutral-500 text-sm font-semibold text-start">
                                    {task.acceptance_criteria}
                                  </label>
                                  <label className="text-black text-xs font-bold pt-2">
                                    TOOLS
                                  </label>
                                  <label className="text-neutral-500 text-sm font-semibold">
                                    {task.tools}
                                  </label>
                                </div>
                              </div>
                            </>
                          );
                        },
                      )}
                    </div>
                  </div>
                </>
              );
            })}
        </>
      )}
    </div>
  );
};

export default PM1Checklist;
