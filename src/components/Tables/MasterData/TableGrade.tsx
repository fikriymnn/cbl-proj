import { MasterMachine } from '../../../types/master';
// import BrandOne from '../../images/brand/brand-01.svg';
// import BrandTwo from '../../images/brand/brand-02.svg';
// import BrandThree from '../../images/brand/brand-03.svg';
// import BrandFour from '../../images/brand/brand-04.svg';
// import BrandFive from '../../images/brand/brand-05.svg';
import { useEffect, useState } from 'react';
import Modal from '../../../components/Modals/ModalDetailPopup';
// import Gambar from '../../images/BACKGROUND.png';
import Logo from '../../images/logo/logo-cbl 1.svg';

import axios from 'axios';
import ModalEditMesinMaster from '../../Modals/ModalEditMesinMaster';
import ModalKosongan from '../../Modals/Qc/NCR/NCRResponQC';
import ModalKosonganSmall from '../../Modals/ModalKosonganSmall';

const TableGrade = () => {
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

  const [masterMesin, setmasterMesin] = useState<any>();

  useEffect(() => {
    getMasterMesin();
  }, []);

  async function getMasterMesin() {
    const url = `${import.meta.env.VITE_API_LINK}/master/grade`;
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

  async function deleteMasterMesin(id: any, i: any) {
    const url = `${import.meta.env.VITE_API_LINK}/master/grade/${id}`;
    try {
      const res = await axios.delete(url, {
        withCredentials: true,
      });

      closeDelete(i);
      getMasterMesin();
      console.log(res.data);
    } catch (error: any) {
      console.log(error);
    }
  }

  const [grade, setGrade] = useState<any>();
  const [percent, setpercent] = useState<any>();

  async function postMasterMesin() {
    const url = `${import.meta.env.VITE_API_LINK}/master/grade`;
    try {
      const res = await axios.post(
        url,
        {
          grade: grade,
          percent: percent,
        },
        {
          withCredentials: true,
        },
      );
      closeModalHistory();
      getMasterMesin();
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

  const [gradeEdit, setGradeEdit] = useState<any>();
  const [percentEdit, setpercentEdit] = useState<any>();

  async function submitEDitMesin(id: number, i: any) {
    const url = `${import.meta.env.VITE_API_LINK}/master/grade/${id}`;

    try {
      const res = await axios.put(
        url,
        {
          grade: gradeEdit,
          percent: percentEdit,
        },
        {
          withCredentials: true,
        },
      );

      getMasterMesin();

      closeEdit(i);
    } catch (error: any) {
      console.log(error);
      //alert(error.data.msg);
    }
  }
  const [showHistory, setShowHistory] = useState(false);
  const openModalHistory = () => setShowHistory(true);
  const closeModalHistory = () => setShowHistory(false);

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
      <>
        <div className="flex w-full justify-between pr-8 border-b border-stroke pb-2">
          <input
            type="search"
            placeholder="search"
            name=""
            id=""
            className="md:w-96 w-40 py-1 mx-3 px-3 bg-[#E9F3FF]"
          />
          <button
            onClick={() => openModalHistory()}
            className=" bg-blue-600 rounded-sm text-white text-xs font-bold px-7 py-1"
          >
            TAMBAH GRADE
          </button>
          {showHistory == true && (
            <>
              <ModalKosonganSmall
                isOpen={showHistory}
                onClose={() => closeModalHistory()}
                judul={'Tambah Grade'}
              >
                <>
                  <div className="grid   gap-3 w-full px-5 py-2">
                    <>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          postMasterMesin();
                        }}
                      >
                        <div className="flex w-full flex-col">
                          <label className="text-black text-xs font-bold">
                            Grade
                          </label>
                          <div className="flex w-full">
                            <input
                              name="grade"
                              onChange={(e) => {
                                setGrade(e.target.value);
                              }}
                              type="text"
                              className=" w-[387px] h-10 border-2 border-stroke rounded-md"
                            />
                          </div>
                        </div>
                        <div className="flex w-full flex-col">
                          <label className="text-black text-xs font-bold">
                            Percent
                          </label>
                          <div className="flex w-full">
                            <input
                              name="percent"
                              onChange={(e) => {
                                setpercent(e.target.value);
                              }}
                              type="number"
                              className=" w-[387px] h-10 border-2 border-stroke rounded-md"
                            />
                          </div>
                        </div>

                        <div className=" pt-3">
                          <button
                            type="submit"
                            value="submit"
                            className="bg-[#0065DE] text-center text-white text-xs font-bold px-6 py-3 rounded-md"
                          >
                            SIMPAN
                          </button>
                        </div>
                      </form>
                    </>
                  </div>
                </>
              </ModalKosonganSmall>
            </>
          )}
        </div>

        <div className="flex flex-col">
          <div className="flex border-b border-stroke dark:border-strokedark">
            <div className="flex w-[80px] justify-center items-center gap-4 p-2.5 ">
              <p className="  hidden text-[14px] text-slate-600 font-semibold dark:text-white sm:block">
                No
              </p>
            </div>

            <div className="flex items-center w-4/12 justify-center p-2.5 ">
              <p className="text-slate-600 text-[14px] font-semibold text-center dark:text-white">
                Grade
              </p>
            </div>
            <div className="flex items-center text-[14px] w-4/12 justify-center p-2.5 ">
              <p className="text-slate-600 font-semibold text-center dark:text-white">
                Percent
              </p>
            </div>
          </div>
          {masterMesin != null &&
            masterMesin.map((data: any, i: number) => {
              return (
                <>
                  <div
                    className={`flex ${
                      i === masterMesin.length - 1
                        ? ''
                        : 'border-b border-stroke dark:border-strokedark '
                    }`}
                    key={i}
                  >
                    <div className="flex justify-center items-center w-1/12   gap-3 p-2.5">
                      <p className="hidden text-[14px] text-black dark:text-white sm:block">
                        {i + 1}
                      </p>
                    </div>

                    <div className="flex items-center w-5/12 justify-center p-2.5 pr-9">
                      <p className="text-slate-600 text-[14px] font-semibold text-center dark:text-white">
                        {data.grade}
                      </p>
                    </div>
                    <div className="flex items-center text-[14px] w-5/12 justify-center p-2.5 pr-9">
                      <p className="text-slate-600 font-semibold text-center dark:text-white">
                        {data.percent}
                      </p>
                    </div>

                    <div className="flex items-center w-3/12 justify-center p-2.5 gap-2">
                      <button
                        onClick={() => openEdit(i)}
                        className="bg-blue-600 rounded-sm text-white text-xs font-bold px-4 py-1"
                      >
                        EDIT
                      </button>
                      {showEdit[i] == true && (
                        <ModalKosonganSmall
                          isOpen={showEdit[i]}
                          onClose={() => closeEdit(i)}
                          judul={'Edit Grade'}
                        >
                          <>
                            <div className="grid   gap-3 w-full px-5 py-2">
                              <>
                                <div className="flex w-full flex-col">
                                  <label className="text-black text-xs font-bold">
                                    Grade
                                  </label>
                                  <div className="flex w-full">
                                    <input
                                      name="grade"
                                      defaultValue={data.grade}
                                      onChange={(e) => {
                                        setGradeEdit(e.target.value);
                                      }}
                                      type="text"
                                      className=" w-[387px] h-10 border-2 border-stroke rounded-md"
                                    />
                                  </div>
                                </div>
                                <div className="flex w-full flex-col">
                                  <label className="text-black text-xs font-bold">
                                    Percent
                                  </label>
                                  <div className="flex w-full">
                                    <input
                                      name="percent"
                                      defaultValue={data.percent}
                                      onChange={(e) => {
                                        setpercentEdit(e.target.value);
                                      }}
                                      type="number"
                                      className=" w-[387px] h-10 border-2 border-stroke rounded-md"
                                    />
                                  </div>
                                </div>

                                <div className=" pt-3">
                                  <button
                                    onClick={() => submitEDitMesin(data.id, i)}
                                    className="bg-[#0065DE] text-center text-white text-xs font-bold px-6 py-3 rounded-md"
                                  >
                                    SIMPAN
                                  </button>
                                </div>
                              </>
                            </div>
                          </>
                        </ModalKosonganSmall>
                      )}
                      <button
                        onClick={() => openDelete(i)}
                        className="bg-red-600 rounded-sm text-white text-xs font-bold px-4 py-1"
                      >
                        DELETE
                      </button>
                      {showDelete[i] == true && (
                        <>
                          <ModalKosonganSmall
                            isOpen={showDelete[i]}
                            onClose={() => closeDelete(i)}
                            judul={'Hapus Grade'}
                          >
                            <>
                              <div className="flex w-full flex-col pt-7 px-2 py-3">
                                <>
                                  <button
                                    onClick={() =>
                                      deleteMasterMesin(data.id, i)
                                    }
                                    className="bg-red-600 h-7 rounded-md text-white text-xs font-bold px-4 py-1"
                                  >
                                    HAPUS GRADE
                                  </button>
                                </>
                              </div>
                            </>
                          </ModalKosonganSmall>
                        </>
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

export default TableGrade;
