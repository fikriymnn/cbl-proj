import React, { useEffect, useState } from 'react';
import DefaultLayout from '../../../layout/DefaultLayout';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import axios from 'axios';

function AddStockLifetimes() {
  const [addMasterSparepart, setAddMasterSparepart] = useState({
    id_mesin: 0,
    nama_mesin: '',
    kode: '',
    nama_sparepart: '',
    posisi_part: '',
    tgl_pasang: '',
    tgl_rusak: '',
    umur_a: 0,
    umur_grade: 0,
    grade_2: '',
    actual_umur: 0,
    sisa_umur: 0,
    keterangan: '',
  });
  const [mesin, setMesin] = useState<any>();

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

  async function addItem() {
    const url = `${import.meta.env.VITE_API_LINK}/master/sparepart`;
    try {
      const res = await axios.post(
        url,
        {
          jenis_part: 'ganti',
          id_mesin: addMasterSparepart.id_mesin,
          nama_mesin: addMasterSparepart.nama_mesin,
          kode: addMasterSparepart.kode,
          nama_sparepart: addMasterSparepart.nama_sparepart,
          posisi_part: addMasterSparepart.posisi_part,
          tgl_pasang: addMasterSparepart.tgl_pasang,
          tgl_rusak: addMasterSparepart.tgl_rusak,
          umur_a: addMasterSparepart.umur_a,
          umur_grade: addMasterSparepart.umur_grade,
          grade_2: addMasterSparepart.grade_2,
          actual_umur: addMasterSparepart.actual_umur,
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

  return (
    <DefaultLayout>
      <>
        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          Maintenance &gt; Sparepart &gt; Lifespan &gt; Add Item
        </p>
        <div className="grid md:grid-cols-3 gap-5 p-3 bg-white text-black">
          <div className="mt-5 flex flex-col justify-center px-2">
            <p className="text-xs font-extrabold text-black">Kode barang</p>
            <div className="flex justify-center items-center">
              <div className="relative z-20 border-2 border-[#EDEDED] shadow-md rounded-md dark:bg-form-input  w-full mt-2">
                <input
                  name="kode"
                  onChange={(e) => handleChangeData(e)}
                  className={`relative font-medium z-20 w-full appearance-none rounded border border-stroke bg-transparent py-1   px-1 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-inputtext-black dark:text-white' 
                                            }`}
                />
              </div>
            </div>
          </div>
          <div className="mt-5 flex flex-col justify-center px-2">
            <p className="text-xs font-extrabold text-black">Nama Barang</p>
            <div className="flex justify-center items-center">
              <div className="relative z-20 border-2 border-[#EDEDED] shadow-md rounded-md dark:bg-form-input  w-full mt-2">
                <input
                  name="nama_sparepart"
                  onChange={(e) => handleChangeData(e)}
                  className={`relative font-medium z-20 w-full appearance-none rounded border border-stroke bg-transparent py-1   px-1 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-inputtext-black dark:text-white' 
                                            }`}
                />
              </div>
            </div>
          </div>
          <div className="mt-5 flex flex-col justify-center px-2">
            <p className="text-xs font-extrabold text-black">Mesin</p>

            <div className="flex justify-center items-center">
              <div className="relative z-20 border-2 border-[#EDEDED] shadow-md rounded-md dark:bg-form-input  w-full mt-2">
                <span className="absolute top-1/2 left-4 z-30 -translate-y-1/2">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  ></svg>
                </span>

                <select
                  name="id_mesin"
                  onChange={(e) => handleChangeData(e)}
                  className={`relative font-medium z-20 w-full appearance-none rounded border border-stroke bg-transparent py-1   px-1 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-inputtext-black dark:text-white' 
                                            }`}
                >
                  <option value="" className="text-body dark:text-bodydark">
                    Select Mesin
                  </option>
                  {mesin?.map((data: any, index: number) => {
                    return (
                      <option
                        key={index}
                        value={data.id}
                        className="text-body dark:text-bodydark"
                      >
                        {data.nama_mesin}
                      </option>
                    );
                  })}
                </select>

                <span className="absolute top-1/2 right-4 z-10 -translate-y-1/2">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g opacity="0.8">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                        fill="#637381"
                      ></path>
                    </g>
                  </svg>
                </span>
              </div>
            </div>
          </div>
          <div className="mt-5 flex flex-col justify-center px-2">
            <p className="text-xs font-extrabold text-black">Posisi</p>
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
            <p className="text-xs font-extrabold text-black">Tanggal Pasang</p>
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
            <p className="text-xs font-extrabold text-black">Umur A</p>
            <div className="flex justify-center items-center">
              <div className="relative z-20 border-2 border-[#EDEDED] shadow-md rounded-md dark:bg-form-input  w-full mt-2">
                <input
                  name="umur_a"
                  onChange={(e) => handleChangeData(e)}
                  className={`relative font-medium z-20 w-full appearance-none rounded border border-stroke bg-transparent py-1   px-1 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-inputtext-black dark:text-white' 
                                                }`}
                />
              </div>
            </div>
          </div>
          <div className="mt-5 flex flex-col justify-center px-2">
            <p className="text-xs font-extrabold text-black">Grade</p>

            <div className="flex justify-center items-center">
              <div className="relative z-20 border-2 border-[#EDEDED] shadow-md rounded-md dark:bg-form-input  w-full mt-2">
                <span className="absolute top-1/2 left-4 z-30 -translate-y-1/2">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  ></svg>
                </span>

                <select
                  name="grade_2"
                  onChange={(e) => {
                    handleChangeData(e);
                    let umurGrade = 0;

                    if (e.target.value == 'A') {
                      umurGrade = 100;
                    } else if (e.target.value == 'B') {
                      umurGrade = 80;
                    } else if (e.target.value == 'C') {
                      umurGrade = 60;
                    } else if (e.target.value == 'D') {
                      umurGrade = 40;
                    } else if (e.target.value == 'E') {
                      umurGrade = 20;
                    } else {
                      umurGrade = 0;
                    }

                    handleChangeUmurGrade(umurGrade);

                    const percent = umurGrade / 100;
                    console.log(percent);
                    const actualUmur = addMasterSparepart.umur_a * percent;
                    handleChangeActualUmur(actualUmur);
                  }}
                  className={`relative font-medium z-20 w-full appearance-none rounded border border-stroke bg-transparent py-1   px-1 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-inputtext-black dark:text-white' 
                                            }`}
                >
                  <option
                    selected
                    disabled
                    value=""
                    className="text-body dark:text-bodydark"
                  >
                    Select Grade
                  </option>
                  <option value="A" className="text-body dark:text-bodydark">
                    A
                  </option>
                  <option value="B" className="text-body dark:text-bodydark">
                    B
                  </option>
                  <option value="C" className="text-body dark:text-bodydark">
                    C
                  </option>
                  <option value="D" className="text-body dark:text-bodydark">
                    D
                  </option>
                  <option value="E" className="text-body dark:text-bodydark">
                    E
                  </option>
                </select>

                <span className="absolute top-1/2 right-4 z-10 -translate-y-1/2">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g opacity="0.8">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                        fill="#637381"
                      ></path>
                    </g>
                  </svg>
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col justify-center px-2">
            <p className="text-xs font-extrabold text-black">Sisa Umur</p>
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
            <p className="text-xs font-extrabold text-black">Keterangan</p>
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
                addItem();
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
