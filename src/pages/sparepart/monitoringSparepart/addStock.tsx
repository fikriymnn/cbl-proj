import React, { useEffect, useState } from 'react';
import DefaultLayout from '../../../layout/DefaultLayout';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import axios from 'axios';
import SelectSearch from 'react-select-search';

function AddStockLifetimes() {

  const [mesin, setMesin] = useState<any>();
  const [stokSparepart, setStokSparepart] = useState<any>();
  const [isOptionSelected, setIsOptionSelected] = useState<boolean>(false);

  const changeTextColor = () => {
    setIsOptionSelected(true);
  };

  useEffect(() => {
    getMesin();

  }, []);

  async function getMesin() {
    const url = `${import.meta.env.VITE_API_LINK}/master/mesin`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      setMesin(res.data);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }
  const [idSparepart, setidSparepart] = useState<any>();

  const [namaSparepartSelect, setnamaSparepartSelect] = useState<any>();

  const [addMasterSparepart, setAddMasterSparepart] = useState({

    id_stok: '',
    posisi_part: '',
    tgl_pasang: '',
    tgl_rusak: '',

    sisa_umur: 0,
    keterangan: '',
  });
  async function addItem(id: any) {
    const url = `${import.meta.env.VITE_API_LINK}/master/sparepart`;
    try {
      const res = await axios.post(
        url,
        {
          jenis_part: 'ganti',
          id_stok: id,
          posisi_part: addMasterSparepart.posisi_part,
          tgl_pasang: addMasterSparepart.tgl_pasang,
          tgl_rusak: addMasterSparepart.tgl_rusak,

          sisa_umur: addMasterSparepart.sisa_umur,
          keterangan: addMasterSparepart.keterangan,
        },
        {
          withCredentials: true,
        },
      );
      alert('Add Success');
      window.location.reload();
      console.log(res.data);
    } catch (error: any) {
      alert(error.response.data.msg);
      console.log(error.response);
    }
  }

  //change value data
  const handleChangeData = (e: any) => {
    const { name, value } = e.target;
    const onchangeVal: any = addMasterSparepart;
    onchangeVal[name] = value;
    setAddMasterSparepart(onchangeVal);
  };

  //change value data
  const handleChangeUmurGrade = (e: any) => {
    const value = e;
    const onchangeVal: any = addMasterSparepart;
    onchangeVal['umur_grade'] = value;
    setAddMasterSparepart(onchangeVal);
  };

  //change value data
  const handleChangeActualUmur = (e: any) => {
    const value = e;
    const onchangeVal: any = addMasterSparepart;
    onchangeVal['actual_umur'] = value;
    setAddMasterSparepart(onchangeVal);
  };

  const [showModalMsStok, setShowModalMsStok] = useState(false);
  const openModalMsStok = () => setShowModalMsStok(true);
  const closeModalMsStok = () => setShowModalMsStok(false);

  const [masterSparepart, setMasterSparepart] = useState<any>(null);
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

  async function getStokSparepart(idMesin: any) {
    const url = `${import.meta.env.VITE_API_LINK}/stokSparepart`;
    try {
      const res = await axios.get(url, {
        params: {
          id_mesin: idMesin,
        },
        withCredentials: true,
      });

      setStokSparepart(res.data);
      console.log(res.data);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }
  async function getMasterSparepart(id_mesin: any) {
    const url = `${import.meta.env.VITE_API_LINK}/master/sparepart`;
    try {
      const res = await axios.get(url, {
        params: {
          id_mesin: id_mesin,
        },
        withCredentials: true,
      });

      setMasterSparepart(res.data);
      console.log(res.data);
    } catch (error: any) {
      console.log(error);
    }
  }
  return (
    <DefaultLayout>
      <>
        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          Maintenance &gt; Sparepart &gt; Lifespan &gt; Add Item
        </p>
        <div className="grid md:grid-cols-3 gap-5 p-3 bg-white text-black">
          <div className="mt-5 flex flex-col justify-center px-2">
            <p className="text-xs font-extrabold text-black">Pilih Sparepart<span className='text-red-500'>*</span></p>
            <div className="flex justify-center items-center">
              <div className="relative border-2 border-[#EDEDED] shadow-md rounded-md dark:bg-form-input  w-full mt-2">
                <button
                  onClick={openModalMsStok}
                  name="rusak"
                  className="w-full h-9 bg-blue-700 rounded text-center text-white md:text-xs text-[9px] md:font-bold font-semibold"
                >
                  {namaSparepartSelect == null ? 'PILIH SPAREPART' : namaSparepartSelect}
                </button>

                {showModalMsStok && (
                  <>
                    <div className="fixed z-50 inset-0 backdrop-blur-sm bg-white/10 p-4 md:p-8 flex justify-center items-center  ">
                      <div className="w-full max-w-4xl  bg-white rounded-xl shadow-md h-[620px]">
                        <div className="flex w-full items-center pt-4">
                          <label className="flex lg:w-11/12 w-10/12 px-5 text-blue-700 text-sm font-bold ">
                            Sparepart Master Check
                          </label>
                          <button
                            type="button"
                            onClick={closeModalMsStok}
                            className="text-gray-400 focus:outline-none mr-5"
                          >
                            <svg
                              width="22"
                              height="22"
                              viewBox="0 0 22 22"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <circle
                                cx="11"
                                cy="11"
                                r="11"
                                fill="#0065DE"
                              />
                              <rect
                                x="6.03955"
                                y="4.23242"
                                width="17"
                                height="3"
                                rx="1.5"
                                transform="rotate(42.8321 6.03955 4.23242)"
                                fill="white"
                              />
                              <rect
                                x="4.18213"
                                y="16.0609"
                                width="17"
                                height="3"
                                rx="1.5"
                                transform="rotate(-45 4.18213 16.0609)"
                                fill="white"
                              />
                            </svg>
                          </button>
                        </div>
                        <div className="px-5 pb-4">
                          <div className="relative flex w-full gap-10 justify-start pb-2 pt-3">
                            <select
                              onChange={(e) => {
                                getMasterSparepart(e.target.value);
                                changeTextColor();
                              }}
                              className={`relative z-20 w-8/12  appearance-none rounded-md  text-xs bg-blue-100 py-1 px-2 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input ${isOptionSelected
                                ? 'text-gray-800 dark:text-white'
                                : ''
                                }`}
                            >
                              <option
                                value=""
                                selected
                                disabled
                                className="text-gray-800 text-xs font-light dark:text-bodydark"
                              >
                                SELECT MESIN
                              </option>
                              {mesin != null &&
                                mesin?.map(
                                  (data: any, i: number) => {
                                    return (
                                      <option
                                        value={data.id}
                                        className="text-gray-800 text-xs font-light dark:text-bodydark"
                                      >
                                        {data.nama_mesin}
                                      </option>
                                    );
                                  },
                                )}
                            </select>
                            <input
                              type="text"
                              className="flex py-2 lg:w-6/12 w-full text-black text-sm font-normal bg-blue-100 rounded h-full pl-2"
                              placeholder="Search Sparepart..."
                              id="searchInput"
                            />
                            <div className="-translate-x-8 my-auto">
                              <svg
                                width="16"
                                height="18"
                                viewBox="0 0 16 18"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M15.7231 14.5835L11.2285 9.98926L8.90283 12.3648L13.4007 16.959C13.7698 17.3361 14.3774 17.3361 14.7465 16.959L15.7231 15.9614C16.0923 15.5811 16.0923 14.9572 15.7231 14.5835Z"
                                  fill="#0065DE"
                                />
                                <path
                                  d="M9.00432 11.3404L10.2227 10.0959L8.83447 8.67793C10.1476 6.74614 9.96465 4.07033 8.27917 2.34874C6.38791 0.416956 3.3142 0.416956 1.41967 2.34874C-0.474857 4.28053 -0.47159 7.4201 1.41967 9.35522C3.10515 11.0768 5.72482 11.2637 7.61609 9.92241L9.00432 11.3404ZM2.3604 8.38099C0.988503 6.97969 0.988503 4.70759 2.3604 3.30963C3.7323 1.90833 5.95674 1.90833 7.32537 3.30963C8.69727 4.71093 8.69727 6.98303 7.32537 8.38099C5.95674 9.78228 3.7323 9.78228 2.3604 8.38099Z"
                                  fill="#0065DE"
                                />
                              </svg>
                            </div>
                          </div>
                          <div className=" border border-black rounded-md overflow-y-scroll h-80">
                            <div className="grid grid-cols-12 border-b border-stroke dark:border-strokedark">
                              <div className="flex items-center justify-start  gap-3 p-2.5 ">
                                <p className="hidden text-xs text-slate-600 font-semibold dark:text-white sm:block pl-5">
                                  No
                                </p>
                              </div>

                              <div className="flex items-center   justify-center lg:p-2.5 lg:ml-2 col-span-2">
                                <p className="text-slate-600 text-xs font-semibold text-center dark:text-white ">
                                  Kode
                                </p>
                              </div>
                              <div className="flex items-center   justify-center lg:p-2.5 lg:ml-2 col-span-3">
                                <p className="text-slate-600 text-xs font-semibold text-center dark:text-white ">
                                  Sparepart Name
                                </p>
                              </div>
                              <div className="flex items-center   justify-center lg:p-2.5 lg:ml-2 ">
                                <p className="text-slate-600 text-xs font-semibold text-center dark:text-white ">
                                  Grade
                                </p>
                              </div>
                              <div className="flex items-center   justify-center lg:p-2.5 lg:ml-2 col-span-2">
                                <p className="text-slate-600 text-xs font-semibold text-center dark:text-white ">
                                  Umur Ori
                                </p>
                              </div>
                              <div className="flex items-center text-xs  justify-center p-2.5 ml-2 col-span-2">
                                <p className="text-slate-600 font-semibold text-center dark:text-white">
                                  Posisi Part
                                </p>
                              </div>
                              <div className="flex items-center text-xs  justify-center p-2.5 ml-2">
                                <p className="text-slate-600 font-semibold text-center dark:text-white"></p>
                              </div>
                            </div>

                            {masterSparepart?.map(
                              (
                                SparepartMaster: any,
                                ii: number,
                              ) => {
                                return (

                                  <div className="grid grid-cols-12 border-b border-stroke dark:border-strokedark">
                                    <div className="flex items-center justify-start  gap-3 p-2.5 ">
                                      <p className="hidden text-xs text-slate-600 font-semibold dark:text-white sm:block pl-5">
                                        {ii + 1}
                                      </p>
                                    </div>

                                    <div className="flex items-center   justify-center lg:p-2.5 lg:ml-2 col-span-2">
                                      <p className="text-slate-600 text-xs font-semibold text-center dark:text-white ">
                                        {SparepartMaster.kode}
                                      </p>
                                    </div>
                                    <div className="flex items-center   justify-center lg:p-2.5 lg:ml-2 col-span-3">
                                      <p className="text-slate-600 text-xs font-semibold text-center dark:text-white ">
                                        {SparepartMaster.nama_sparepart}
                                      </p>
                                    </div>
                                    <div className="flex items-center   justify-center lg:p-2.5 lg:ml-2 ">
                                      <p className="text-slate-600 text-xs font-semibold text-center dark:text-white ">
                                        {SparepartMaster.grade_2}
                                      </p>
                                    </div>
                                    <div className="flex items-center   justify-center lg:p-2.5 lg:ml-2 col-span-2">
                                      <p className="text-slate-600 text-xs font-semibold text-center dark:text-white ">
                                        {SparepartMaster.umur_a}
                                      </p>
                                    </div>
                                    <div className="flex items-center text-xs  justify-center p-2.5 ml-2 col-span-2">
                                      <p className="text-slate-600 font-semibold text-center dark:text-white">
                                        {SparepartMaster.posisi_part}
                                      </p>
                                    </div>
                                    <div className="flex items-center text-xs  justify-center p-2.5 ml-2">
                                      <button
                                        className="bg-primary w-20 text-white"
                                        onClick={() => {
                                          setidSparepart(SparepartMaster.id)
                                          setnamaSparepartSelect(SparepartMaster.nama_sparepart)
                                          setShowModalMsStok(false)
                                        }}
                                      >
                                        select
                                      </button>
                                    </div>
                                  </div>
                                );
                              },
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="mt-5 flex flex-col justify-center px-2">
            <p className="text-xs font-extrabold text-black">Posisi<span className='text-red-500'>*</span></p>
            <div className="flex justify-center items-center">
              <div className="relative z-20 border-2 border-[#EDEDED] shadow-md rounded-md dark:bg-form-input  w-full mt-2">
                <input
                  name="posisi_part"
                  onChange={(e) => handleChangeData(e)}
                  className={`relative font-medium z-20 w-full appearance-none rounded border border-stroke bg-transparent py-1   px-1 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-inputtext-black dark:text-white' 
                                            }`}
                />
              </div>
            </div>
          </div>
          <div className="mt-5 flex flex-col justify-center px-2">
            <p className="text-xs font-extrabold text-black">Tanggal Pasang<span className='text-red-500'>*</span></p>
            <div className="flex justify-center items-center">
              <div className="relative z-20 border-2 border-[#EDEDED] shadow-md rounded-md dark:bg-form-input  w-full mt-2">
                <input
                  name="tgl_pasang"
                  onChange={(e) => handleChangeData(e)}
                  type="date"
                />
              </div>
            </div>
          </div>
          <div className="mt-5 flex flex-col justify-center px-2">
            <p className="text-xs font-extrabold text-black">Tanggal Rusak</p>
            <div className="flex justify-center items-center">
              <div className="relative z-20 border-2 border-[#EDEDED] shadow-md rounded-md dark:bg-form-input  w-full mt-2">
                <input
                  name="tgl_rusak"
                  onChange={(e) => handleChangeData(e)}
                  type="date"
                />
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col justify-center px-2">
            <p className="text-xs font-extrabold text-black">Sisa Umur<span className='text-red-500'>*</span></p>
            <div className="flex justify-center items-center">
              <div className="relative z-20 border-2 border-[#EDEDED] shadow-md rounded-md dark:bg-form-input  w-full mt-2">
                <input
                  name="sisa_umur"
                  onChange={(e) => handleChangeData(e)}
                  className={`relative font-medium z-20 w-full appearance-none rounded border border-stroke bg-transparent py-1   px-1 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-inputtext-black dark:text-white' 
                                                }`}
                />
              </div>
            </div>
          </div>
          <div className="mt-5 flex flex-col justify-center px-2">
            <p className="text-xs font-extrabold text-black">Keterangan<span className='text-red-500'>*</span></p>
            <div className="flex justify-center items-center">
              <div className="relative z-20 border-2 border-[#EDEDED] shadow-md rounded-md dark:bg-form-input  w-full mt-2">
                <input
                  name="keterangan"
                  onChange={(e) => handleChangeData(e)}
                  className={`relative font-medium z-20 w-full appearance-none rounded border border-stroke bg-transparent py-1   px-1 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-inputtext-black dark:text-white' 
                                                }`}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-center items-end col-span-3">
            <button
              onClick={() => {

                addItem(idSparepart);
              }}
              className="bg-green-500 h-9 px-10 text-white font-extrabold rounded-md text-xs"
            >
              SAVE
            </button>
          </div>
        </div>
      </>
    </DefaultLayout>
  );
}

export default AddStockLifetimes;
