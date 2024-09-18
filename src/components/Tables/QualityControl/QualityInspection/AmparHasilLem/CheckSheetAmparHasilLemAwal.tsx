import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import convertTimeStampToDateOnly from '../../../../../utils/convertDateOnly';
import convertDateToTime from '../../../../../utils/converDateToTime';
import calculateElapsedTime from '../../../../../utils/calculateElapsedTime';
import formatElapsedTime from '../../../../../utils/formatElapsedTime';
import Loading from '../../../../Loading';
import ModalAddPeriode from '../../../../Modals/Qc/ModalAddPeriode';

function CheckSheetHasilRabut() {
  const { id } = useParams();
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [RabutMesin, setRabutMesin] = useState<any>();
  const [defectMaster, setDefectMaster] = useState<any>();
  const [Catatan, setCatatan] = useState<any>();
  const [idDefect, setIdDefect] = useState<any>();

  const [showModal2, setShowModal2] = useState(false);
  const [add, setAdd] = useState<any>();
  const [showDetail, setShowDetail] = useState<boolean[]>(
    new Array(add != null && add.length).fill(false),
  );

  useEffect(() => {
    getRabutMesin();
    getMasterDefect();
  }, []);

  async function getRabutMesin() {
    const url = `${import.meta.env.VITE_API_LINK}/qc/cs/inspeksiAmparLem/${id}`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      setRabutMesin(res.data);
      console.log(res.data);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }
  async function getMasterDefect() {
    const url = `${
      import.meta.env.VITE_API_LINK_P1
    }/api/list-kendala?criteria=true&proses=7`;
    try {
      const res = await axios.get(url);
      setDefectMaster(res.data);
      console.log(res.data);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  async function startTaskRabut(id: number) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiAmparLemPoint/start/${id}`;
    try {
      const res = await axios.put(
        url,
        {},
        {
          withCredentials: true,
        },
      );

      getRabutMesin();
    } catch (error: any) {
      console.log(error);
      alert(error.response.data.msg);
    }
  }

  async function stopTaskRabut(
    id: number,
    startTime: any,
    catatan: any,
    qty_pallet: any,
    data_defect: any,
  ) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiAmparLemPoint/stop/${id}`;
    try {
      const elapsedSeconds = calculateElapsedTime(startTime, new Date());
      console.log(elapsedSeconds);
      const res = await axios.put(
        url,
        {
          catatan: catatan,
          lama_pengerjaan: elapsedSeconds,
          qty_pallet,
          data_defect,
        },
        {
          withCredentials: true,
        },
      );

      getRabutMesin();
    } catch (error: any) {
      console.log(error.response.data.msg);
      alert(error.response.data.msg);
    }
  }

  async function tambahTaskRabut(id: number) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiAmparLemPoint/create`;
    try {
      setIsLoading(true);
      const res = await axios.post(
        url,
        {
          id_inspeksi_ampar_lem: id,
        },
        {
          withCredentials: true,
        },
      );
      setIsLoading(false);
      getRabutMesin();
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  async function doneRabut(id: number) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiAmparLem/done/${id}`;
    try {
      const res = await axios.put(
        url,
        {
          catatan: Catatan,
        },
        {
          withCredentials: true,
        },
      );

      getRabutMesin();
    } catch (error: any) {
      console.log(error);
    }
  }

  // async function pendingRabut(id: number) {
  //   const url = `${
  //     import.meta.env.VITE_API_LINK
  //   }/qc/cs/inspeksiAmparLem/pending/${id}`;
  //   try {
  //     const res = await axios.put(
  //       url,
  //       {},
  //       {
  //         withCredentials: true,
  //       },
  //     );

  //     getRabutMesin();
  //   } catch (error: any) {
  //     console.log(error.data.msg);
  //   }
  // }

  async function tambahDefectPeriode(
    id: number,
    idDefect: number,
    idPoint: number,
    index: number,
  ) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiAmparLemPoint/createDefect`;
    try {
      const res = await axios.post(
        url,

        {
          id_inspeksi_ampar_lem: id,
          id_inspeksi_ampar_lem_point: idPoint,
          MasterDefect: idDefect,
        },

        {
          withCredentials: true,
        },
      );

      setShowModal2(false);
      handleClickAdd(index);
      setIdDefect(null);
      getRabutMesin();
    } catch (error: any) {
      console.log(error);
    }
  }

  const handleClickAdd = (index: number) => {
    setShowDetail((prevState) => {
      const updatedShowDetail = [...prevState]; // Create a copy
      updatedShowDetail[index] = !updatedShowDetail[index]; // Toggle value
      return updatedShowDetail;
    });
  };

  const handleChangePoint = (e: any, i: number, ii: number) => {
    const { name, value } = e.target;
    const onchangeVal: any = RabutMesin;
    onchangeVal.data.inspeksi_ampar_lem_point[i].inspeksi_ampar_lem_defect[ii][
      name
    ] = value;
    setRabutMesin(onchangeVal);
  };

  const handleChangeRabutPoint = (e: any, i: number) => {
    const { name, value } = e.target;
    const onchangeVal: any = RabutMesin;
    onchangeVal.data.inspeksi_ampar_lem_point[i][name] = value;
    setRabutMesin(onchangeVal);
    console.log(onchangeVal);
  };

  const tanggal = convertTimeStampToDateOnly(RabutMesin?.data?.tanggal);
  const jam = convertDateToTime(RabutMesin?.data?.tanggal);

  const jumlahWaktuCheck = formatElapsedTime(RabutMesin?.data?.waktu_check);

  return (
    <>
      {!isMobile && (
        <main className="overflow-x-hidden">
          <div className="min-w-[700px] bg-white rounded-xl">
            <p className="text-[14px] font-semibold w-full flex border-b-8 border-[#D8EAFF] py-4 px-9 md:ps-9 ps-12">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12ZM13 8C13 8.55228 12.5523 9 12 9C11.4477 9 11 8.55228 11 8C11 7.44772 11.4477 7 12 7C12.5523 7 13 7.44772 13 8ZM13 17V11H11V17H13Z"
                  fill="#0065DE"
                />
              </svg>{' '}
              Sampling Hasil Rabut Checksheet
            </p>

            <div className="grid grid-cols-12  border-b-8 border-[#D8EAFF]">
              <div className="grid grid-rows-6 gap-2 col-span-2 pl-6 py-4 ">
                <label className="text-neutral-500 text-sm font-semibold">
                  Tanggal
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  No. JO
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  No. IO
                </label>

                <label className="text-neutral-500 text-sm font-semibold">
                  Nama Produk
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Customer
                </label>
              </div>
              <div className="grid grid-rows-6 gap-2 col-span-2  py-4">
                <label className="text-neutral-500 text-sm font-semibold">
                  : {tanggal}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {RabutMesin?.data?.no_jo}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {RabutMesin?.data?.no_io}
                </label>

                <label className="text-neutral-500 text-sm font-semibold">
                  : {RabutMesin?.data?.nama_produk}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {RabutMesin?.data?.customer}
                </label>
              </div>

              <div className="grid grid-rows-6  gap-2 col-span-2 justify-between px-10 py-4">
                <label className="text-neutral-500 text-sm font-semibold">
                  Jam
                </label>
                <label className="text-neutral-500 text-sm font-semibold"></label>
              </div>
              <div className="grid grid-rows-6  gap-2 col-span-2 justify-between px-2 py-4">
                <label className="text-neutral-500 text-sm font-semibold">
                  : {jam}
                </label>
                <label className="text-neutral-500 text-sm font-semibold"></label>
              </div>
              <div className="grid grid-rows-6  gap-2 col-span-2 justify-between px-10 py-4">
                <label className="text-neutral-500 text-sm font-semibold">
                  Shift
                </label>

                <label className="text-neutral-500 text-sm font-semibold">
                  Mesin
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Operator
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Status
                </label>
              </div>
              <div className="grid grid-rows-6  gap-2 col-span-2 justify-between px-2 py-4">
                <label className="text-neutral-500 text-sm font-semibold">
                  : {RabutMesin?.data?.shift}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {RabutMesin?.data?.mesin}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {RabutMesin?.data?.operator}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {RabutMesin?.data?.status}
                </label>
              </div>
            </div>

            {/* =============================chekcsheet========================= */}
            {RabutMesin?.data?.inspeksi_ampar_lem_point?.map(
              (data: any, index: number) => {
                const lamaPengerjaan = formatElapsedTime(data.lama_pengerjaan);
                return (
                  <>
                    <div className="flex flex-col py-6 px-10 ">
                      <div className=" grid grid-cols-6 w-full  gap-2">
                        <div className="w-11/12">
                          <label className="text-neutral-500 text-sm font-semibold w-10/12">
                            QTY PALET KE {index + 1}
                          </label>
                        </div>
                        <div>
                          <label className="text-neutral-500 text-sm font-semibold ">
                            PARAMETER
                          </label>
                          {data.status == 'done' ? (
                            <input
                              name="qty_pallet"
                              defaultValue={data.qty_pallet}
                              disabled
                              onChange={(e) => handleChangeRabutPoint(e, index)}
                              type="text"
                              className="px-1 border rounded border-strokedark w-10/12"
                            />
                          ) : data.status == 'on progress' ? (
                            <input
                              name="qty_pallet"
                              onChange={(e) => handleChangeRabutPoint(e, index)}
                              type="text"
                              className="px-1 border rounded border-strokedark w-10/12"
                            />
                          ) : null}
                        </div>
                        <div className="flex flex-col">
                          <label className="text-neutral-500 text-sm font-semibold ">
                            INSPEKTOR
                          </label>
                          <label className="text-neutral-500 text-sm font-semibold ">
                            {data.inspektor?.nama}
                          </label>
                        </div>
                        <div className="flex flex-col">
                          <label className="text-neutral-500 text-sm font-semibold ">
                            WAKTU
                          </label>
                          <label className="text-neutral-500 text-sm font-semibold ">
                            {lamaPengerjaan}
                          </label>
                        </div>
                        <div className="flex flex-col ">
                          <>
                            <div className="flex flex-col ">
                              <p className="md:text-[14px] text-[9px] font-semibold">
                                Upload Foto (Optional):
                              </p>

                              <div className="">
                                <input
                                  disabled
                                  type="file"
                                  name=""
                                  id=""
                                  className="w-40"
                                />
                              </div>
                            </div>
                          </>
                        </div>
                        <div className="flex flex-col ">
                          <>
                            {data.status == 'incoming' ? (
                              <>
                                <p className="font-bold text-[#DE0000]">
                                  Task Belum Dimulai
                                </p>
                                <button
                                  onClick={() => {
                                    startTaskRabut(data.id);
                                  }}
                                  className="flex w-full  rounded-md bg-[#00B81D] justify-center items-center px-2 py-2 hover:cursor-pointer"
                                >
                                  <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 14 14"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M12.7645 4.95136L3.63887 0.27536C1.96704 -0.581285 0 0.664567 0 2.58008V11.4199C0 13.3354 1.96704 14.5813 3.63887 13.7246L12.7645 9.04864C14.4118 8.20456 14.4118 5.79544 12.7645 4.95136Z"
                                      fill="white"
                                    />
                                  </svg>
                                </button>
                              </>
                            ) : data.status == 'on progress' ? (
                              <>
                                <p className="font-bold text-green-600">
                                  Task Dimulai
                                </p>
                                <button
                                  onClick={() => {
                                    console.log(RabutMesin.data);
                                    stopTaskRabut(
                                      data.id,
                                      data.waktu_mulai,
                                      data.catatan,
                                      data.qty_pallet,
                                      data.inspeksi_ampar_lem_defect,
                                    );
                                  }}
                                  className="flex w-full  rounded-md bg-red-600 justify-center items-center px-2 py-2 hover:cursor-pointer"
                                >
                                  <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 14 14"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M12.7645 4.95136L3.63887 0.27536C1.96704 -0.581285 0 0.664567 0 2.58008V11.4199C0 13.3354 1.96704 14.5813 3.63887 13.7246L12.7645 9.04864C14.4118 8.20456 14.4118 5.79544 12.7645 4.95136Z"
                                      fill="white"
                                    />
                                  </svg>
                                </button>
                              </>
                            ) : null}
                          </>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-8">
                      {data?.inspeksi_ampar_lem_defect?.map(
                        (data2: any, i: number) => {
                          return (
                            <div className="grid py-4 px-4 items-center">
                              <label className=" text-[#6c6b6b] text-sm font-semibold">
                                {data2.kode} - {data2.masalah}
                              </label>
                              {data.status == 'done' ? (
                                <input
                                  type="text"
                                  name="hasil"
                                  defaultValue={data2.hasil}
                                  disabled
                                  onChange={(e) =>
                                    handleChangePoint(e, index, i)
                                  }
                                  className="px-1 border rounded border-strokedark w-full"
                                />
                              ) : data.status == 'on progress' ? (
                                <input
                                  type="text"
                                  name="hasil"
                                  onChange={(e) =>
                                    handleChangePoint(e, index, i)
                                  }
                                  className="px-1 border rounded border-strokedark w-full"
                                />
                              ) : null}
                            </div>
                          );
                        },
                      )}
                      {data.status == 'on progress' ? (
                        <>
                          <button
                            onClick={() => handleClickAdd(index)}
                            className=" h-10 rounded-sm bg-blue-600 text-white text-sm font-bold justify-center items-center px-2 py-1 hover:cursor-pointer"
                          >
                            Add
                          </button>
                        </>
                      ) : null}
                    </div>

                    {showDetail[index] == true && (
                      <>
                        <ModalAddPeriode
                          isOpen={showDetail[index]}
                          onClose={() => handleClickAdd(index)}
                          judul={'ADD PROBLEM CODE'}
                        >
                          <div className="flex flex-col gap-2">
                            <label>{data.id}</label>
                            <label className="text-black text-sm font-bold pt-4">
                              Master Defect
                            </label>
                            <select
                              onChange={(e) => {
                                const selectedDefect = defectMaster?.find(
                                  (defect: any) =>
                                    //console.log(defect.id)
                                    defect.i_id == e.target.value,
                                );
                                setIdDefect(selectedDefect);
                              }}
                              className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-2 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input 'text-black dark:text-white' 
                  }`}
                            >
                              <option
                                value=""
                                disabled
                                selected
                                className="text-body dark:text-bodydark"
                              >
                                Pilih Sumber Masalah
                              </option>
                              {defectMaster?.map(
                                (dataMaster: any, indexMaster: number) => {
                                  return (
                                    <option
                                      value={dataMaster.i_id}
                                      className="text-body dark:text-bodydark"
                                    >
                                      {dataMaster.e_kode_produksi} -{' '}
                                      {dataMaster.nama_kendala}
                                    </option>
                                  );
                                },
                              )}
                            </select>
                            <button
                              onClick={() => {
                                tambahDefectPeriode(
                                  RabutMesin?.data?.id,
                                  idDefect,
                                  data.id,
                                  index,
                                ),
                                  console.log(data.id);
                              }}
                              className="bg-blue-600 rounded-md w-full h-10 text-white font-semibold text-sm"
                            >
                              TAMBAH MASALAH
                            </button>
                          </div>
                        </ModalAddPeriode>
                      </>
                    )}

                    <div className="grid grid-cols-10 border-b-8 border-[#D8EAFF] px-4 py-4 gap-3">
                      <div className="grid col-span-8">
                        <label className=" text-[#6c6b6b] text-sm font-semibold">
                          Catatan<span className="text-red-500">*</span> :
                        </label>
                        {data.status == 'on progress' ? (
                          <textarea
                            name="catatan"
                            defaultValue={data.catatan}
                            onChange={(e) => handleChangeRabutPoint(e, index)}
                            className="peer h-full min-h-[100px] w-full resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                          ></textarea>
                        ) : data.status == 'done' ? (
                          <textarea
                            name="catatan"
                            disabled
                            defaultValue={data.catatan}
                            onChange={(e) => handleChangeRabutPoint(e, index)}
                            className="peer h-full min-h-[100px] w-full resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                          ></textarea>
                        ) : null}
                      </div>
                      <div className="grid col-span-2 items-end justify-center"></div>
                    </div>
                  </>
                );
              },
            )}
          </div>
          {RabutMesin?.data?.status == 'incoming' ||
          RabutMesin?.data?.status == 'pending' ? (
            <button
              onClick={() => tambahTaskRabut(RabutMesin?.data.id)}
              className=" w-[16%] h-10 rounded-sm bg-blue-600 text-white text-sm font-bold justify-center items-center px-4 py-2 mb-2 hover:cursor-pointer"
            >
              + QTY PALET
            </button>
          ) : null}
          <div className="bg-white ">
            <p className="text-sm font-semibold px-5 pt-5">SUB TOTAL</p>
            <div>
              <div className="px-5">
                <p className="font-semibold text-sm mt-5 ">
                  Parameter Qty Palet
                </p>
                <input
                  type="text"
                  disabled
                  defaultValue={RabutMesin?.sumQtyPallet}
                  className="bg-[#e8e6e6] border rounded border-strokedark"
                />
              </div>
              <div>
                <div className="grid grid-cols-8 gap-4 py-4 p-5">
                  {RabutMesin?.totalPointDefect?.map(
                    (data: any, index: number) => {
                      return (
                        <div className="grid  items-center">
                          <label className=" text-[#6c6b6b]  text-sm font-semibold">
                            {data.kode}
                          </label>
                          <input
                            type="text"
                            defaultValue={data.total_defect}
                            className="bg-[#e8e6e6] px-1 border rounded border-strokedark w-full"
                          />
                        </div>
                      );
                    },
                  )}
                </div>
                <div className=" gap-10 p-5">
                  <div className="w-4/12">
                    <label className=" text-[#6c6b6b] text-sm font-semibold">
                      JUMLAH DEFECT YANG DITEMUKAN
                    </label>
                    <input
                      type="text"
                      disabled
                      defaultValue={RabutMesin?.totalDefect}
                      className="bg-[#e8e6e6]  px-1 border rounded border-strokedark w-full"
                    />
                  </div>

                  <div className="w-full mt-10">
                    {RabutMesin?.data?.status != 'history' ? (
                      <>
                        <div className="grid grid-cols-1">
                          <label className=" text-[#6c6b6b] text-sm font-semibold">
                            KETERANGAN
                          </label>
                          <textarea
                            onChange={(e) => setCatatan(e.target.value)}
                            className="border rounded h-44 w-12/12 resize-none"
                          ></textarea>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="grid grid-cols-1">
                          <label className=" text-[#6c6b6b] text-sm font-semibold">
                            KETERANGAN
                          </label>
                          <textarea
                            defaultValue={RabutMesin?.data.catatan}
                            disabled
                            className="border rounded h-44 w-12/12 resize-none"
                          ></textarea>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex justify-end p-5">
                  <div className="grid grid-cols-3 gap-2 items-end justify-end">
                    {/* {RabutMesin?.data?.status == 'incoming' ? (
                      <button
                        onClick={() => pendingRabut(RabutMesin?.data.id)}
                        className=" w-full h-10 rounded-sm bg-red-600 text-white text-xs font-bold justify-center items-center px-10 py-2 hover:cursor-pointer"
                      >
                        PENDING
                      </button>
                    ) : null} */}
                    {RabutMesin?.data?.status == 'incoming' ||
                    RabutMesin?.data?.status == 'pending' ? (
                      <button
                        onClick={() => doneRabut(RabutMesin?.data.id)}
                        className=" col-span-2 w-full h-10 rounded-sm bg-[#00B81D] text-white text-xs font-bold justify-center items-center px-10 py-2 hover:cursor-pointer"
                      >
                        SIMPAN PERIODE
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}
    </>
  );
}

export default CheckSheetHasilRabut;
