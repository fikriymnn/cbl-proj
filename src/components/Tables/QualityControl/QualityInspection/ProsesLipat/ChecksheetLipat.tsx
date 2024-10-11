import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import convertTimeStampToDateTime from '../../../../../utils/converDateTime';
import Loading from '../../../../Loading';

function ChecksheetLipat() {

  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const kosong: any = [];
  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  const date = today.getDate();
  const currentDate = month + '/' + date + '/' + year;
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

  const { id } = useParams();

  const [incoming, setIncoming] = useState<any>();

  useEffect(() => {
    getInspection();
  }, []);

  async function getInspection() {
    const url = `${import.meta.env.VITE_API_LINK}/qc/cs/inspeksiLipat/${id}`;

    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      console.log(res.data.data);
      setIncoming(res.data.data);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }
  async function startTask(id: any) {
    const url = `${import.meta.env.VITE_API_LINK
      }/qc/cs/inspeksiLipat/start/${id}`;

    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        withCredentials: true,
      });
      setIsLoading(false);
      getInspection();
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }

  const waktuMulaiincoming = convertTimeStampToDateTime(
    incoming != null && incoming?.waktu_mulai,
  );

  const waktuSelesaiincoming =
    incoming != null && incoming?.waktu_selesai != null
      ? convertTimeStampToDateTime(incoming?.waktu_selesai)
      : '-';

  async function tambahChecksheetPoint(id: number) {
    const url = `${import.meta.env.VITE_API_LINK
      }/qc/cs/inspeksiLipat/addPoint/${id}`;
    try {
      setIsLoading(true);
      const res = await axios.put(
        url,
        {},
        {
          withCredentials: true,
        },
      );
      setIsLoading(false);
      getInspection();
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }

  async function saveChecksheetResult(id: number, hasilCheck: any, start: any, index: number) {
    const tes = hasilCheck?.some(
      (data: { hasil_check: any }) => data?.hasil_check === null,
    )
    const tesCtt = hasilCheck?.some(
      (data: { keterangan: any }) => data?.keterangan === null,
    )

    if (tesCtt == true) {
      alert('Keterangan Belum Terisi Semua')
      return;
    }
    if (tes == true) {
      alert('Point Belum Terisi Semua')
      return;
    }

    if (!start) {
      // Check if start time is available
      alert('Task tidak bisa diberhentikan: Belum Start.');
      return; // Exit function if no start time
    }


    const stopTime = new Date();
    const timestamp = convertTimeStampToDateTime(new Date());


    const url = `${import.meta.env.VITE_API_LINK
      }/qc/cs/inspeksiLipat/stop/${id}`;
    try {
      setIsLoading(true);
      const elapsedSeconds = await calculateElapsedTime(start, stopTime);

      // **Save total seconds elsewhere**
      const totalSecondsToSave = elapsedSeconds;
      // Use totalSecondsToSave for your saving logic (e.g., local storage, separate API)

      // Formatted time can be used for logging if needed
      const formattedTime = formatElapsedTime(elapsedSeconds);
      const res = await axios.put(
        url,
        {
          qty: incoming.inspeksi_lipat_point[index].qty,
          hasil_check: hasilCheck,
          lama_pengerjaan: totalSecondsToSave,
        },
        {
          withCredentials: true,
        },
      );
      setIsLoading(false);
      getInspection();
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }

  async function sumbitChecksheet(id: number) {


    const url = `${import.meta.env.VITE_API_LINK
      }/qc/cs/inspeksiLipat/done/${id}`;
    try {
      setIsLoading(true);
      const res = await axios.put(
        url,
        {
          catatan: ctt,


        },
        {
          withCredentials: true,
        },
      );
      setIsLoading(false);
      alert('Data Berhasil Di-Update');
      getInspection();
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }

  const handleChangeQty = (e: any, i: number) => {
    const { name, value } = e.target;
    const onchangeVal: any = incoming;
    onchangeVal.inspeksi_lipat_point[i][name] = value;
    setIncoming(onchangeVal);
  };

  const handleChangePoint = (e: any, i: number, ii: number) => {
    const { name, value } = e.target;
    const onchangeVal: any = incoming;
    onchangeVal.inspeksi_lipat_point[i].inspeksi_lipat_result[ii][name] = value;
    setIncoming(onchangeVal);
  };

  const handleChangePointRadio = (e: any, i: number, ii: number) => {
    const { name, value } = e.target;
    const onchangeVal: any = incoming;
    onchangeVal.inspeksi_lipat_point[i].inspeksi_lipat_result[ii][
      'hasil_check'
    ] = value;
    setIncoming(onchangeVal);
  };

  const [ctt, setCtt] = useState<any>();

  function formatElapsedTime(seconds: number): string {
    // Ensure seconds is non-negative
    seconds = Math.max(0, seconds);

    const hours = Math.floor(seconds / 3600);
    const remainingSeconds = seconds % 3600;

    const minutes = Math.floor(remainingSeconds / 60);
    const remainingSecondsAfterMinutes = remainingSeconds % 60;

    // Use template literals and conditional operators for formatting
    let formattedTime = '';
    if (hours > 0) {
      formattedTime += `${hours} Jam :`; // Add hours if present
    }
    if (hours > 0 || minutes > 0) {
      // Only add minutes if hours are present or minutes are non-zero
      formattedTime += `${minutes.toString().padStart(2, '0')} Menit : `;
    }
    formattedTime += remainingSecondsAfterMinutes.toString().padStart(2, '0');

    return formattedTime;
  }

  function calculateElapsedTime(startTime: any, stopTime: Date) {
    const start = new Date(startTime);
    const diffInMs = stopTime.getTime() - start.getTime();
    // Convert milliseconds to your desired unit (minutes, hours)
    const elapsedTime = Math.round(diffInMs / 1000);
    console.log(elapsedTime); // Example: minutes
    return elapsedTime;
  }

  const isOnprogres =
    incoming?.inspeksi_lipat_point.some(
      (data: { status: any }) => data?.status === 'on progress',
    );
  const isIncoming =
    incoming?.inspeksi_lipat_point.some(
      (data: { status: any }) => data?.status === 'incoming',
    );

  return (
    <>
      {!isMobile && (
        <main className="overflow-x-hidden">
          <form
            action=""
            onSubmit={(e) => {
              e.preventDefault();
              sumbitChecksheet(incoming?.id);
            }}
          >
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
                Checksheet Lipat
              </p>

              <div className="grid grid-cols-10 border-b-8 border-[#D8EAFF]">
                <div className="grid grid-rows-6 gap-1 col-span-2 px-10 py-4 ">
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
                    Status JO
                  </label>
                  <label className="text-neutral-500 text-sm font-semibold">
                    Item
                  </label>
                </div>
                <div className="grid grid-rows-6 gap-1 col-span-2 px-10 py-4">
                  <label className="text-neutral-500 text-sm font-semibold">
                    : {incoming?.tanggal}
                  </label>
                  <label className="text-neutral-500 text-sm font-semibold">
                    : {incoming?.no_jo}
                  </label>
                  <label className="text-neutral-500 text-sm font-semibold">
                    : {incoming?.no_io}
                  </label>
                  <label className="text-neutral-500 text-sm font-semibold">
                    : {incoming?.status_jo}
                  </label>
                  <label className="text-neutral-500 text-sm font-semibold">
                    : {incoming?.item}
                  </label>
                </div>

                <div className="grid grid-rows-6  gap-1 col-span-2 justify-between px-10 py-4">
                  <label className="text-neutral-500 text-sm font-semibold">
                    Jam
                  </label>
                  <label className="text-neutral-500 text-sm font-semibold">
                    Shift
                  </label>
                  <label className="text-neutral-500 text-sm font-semibold">
                    Operator
                  </label>
                  <label className="text-neutral-500 text-sm font-semibold">
                    Mesin
                  </label>

                </div>
                <div className="grid grid-rows-6  gap-1 col-span-2 justify-between px-2 py-4">
                  <label className="text-neutral-500 text-sm font-semibold">
                    : {incoming?.jam}
                  </label>
                  <label className="text-neutral-500 text-sm font-semibold">
                    : {incoming?.shift}
                  </label>
                  <label className="text-neutral-500 text-sm font-semibold">
                    : {incoming?.operator}
                  </label>
                  <label className="text-neutral-500 text-sm font-semibold">
                    : {incoming?.mesin}
                  </label>

                </div>

              </div>

              <div className="grid grid-cols-12 px-3 py-4 border-b-8 border-[#D8EAFF] gap-2">
                <div className="flex gap-4 col-span-2">
                  <label className="text-neutral-500 text-sm font-semibold">
                    No
                  </label>
                  <label className="text-neutral-500 text-sm font-semibold">
                    Point Check
                  </label>
                </div>
                <label className="text-neutral-500 text-sm font-semibold col-span-2">
                  Acuan
                </label>
                <label className="text-neutral-500 text-sm font-semibold col-span-2">
                  Hasil Check
                </label>
                <label className="text-neutral-500 text-sm font-semibold col-span-2">
                  Keterangan
                </label>
              </div>

              {/* =============================Point 1========================== */}

              <>
                {incoming?.inspeksi_lipat_point.map(
                  (dataPoint: any, iPoint: number) => {


                    return (
                      <>
                        <div className='flex flex-col gap-4'>
                          <div className='px-4 py-4'>
                            {dataPoint?.waktu_mulai == null &&
                              dataPoint?.waktu_selesai == null && (
                                <>
                                  <div>
                                    <p className="md:text-[14px] text-[9px] font-semibold">
                                      Time : -
                                    </p>
                                    <>
                                      <p className="font-bold text-[#DE0000]">
                                        Task Belum Dimulai
                                      </p>
                                      <button
                                        type='button'
                                        onClick={() => {
                                          startTask(dataPoint?.id);
                                        }}
                                        className="flex w-[20%]  rounded-md bg-[#00B81D] justify-center items-center px-2 py-2 hover:cursor-pointer"
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
                                  </div>
                                </>
                              )}
                            {dataPoint?.status == 'on progress' && (
                              <>
                                <div>
                                  <label className="text-neutral-500 text-sm font-semibold">
                                    Inspector : {dataPoint?.inspektor?.nama}
                                  </label>
                                  <p className="md:text-[14px] text-[9px] font-semibold">
                                    Time : -
                                  </p>
                                  <>
                                    <p className="font-bold text-[#00B81D]">
                                      Task Sudah Dimulai
                                    </p>
                                  </>
                                </div>
                              </>
                            )}
                            {dataPoint?.status == 'done' && (
                              <>
                                <div className="gap-1 flex flex-col">
                                  <label className="text-neutral-500 text-sm font-semibold">
                                    Inspector : {dataPoint?.inspektor?.nama}
                                  </label>
                                  <p className="md:text-[14px] text-[9px] font-semibold">
                                    Time :
                                  </p>
                                  <p className="md:text-[14px] text-[9px] font-semibold text-stone-400">
                                    {dataPoint?.lama_pengerjaan != null
                                      ? formatElapsedTime(dataPoint?.lama_pengerjaan)
                                      : ''}{' '}
                                    Detik
                                  </p>
                                </div>
                              </>
                            )}
                          </div>

                          <div className='flex px-2 gap-4'>
                            <label className="text-neutral-500 text-sm font-semibold">
                              Quantity
                            </label>
                            {dataPoint.status == 'on progress' ? (
                              <>
                                <input type='text'
                                  required
                                  name="qty"
                                  onChange={(e) => {
                                    handleChangeQty(
                                      e,
                                      iPoint,
                                    );
                                  }}
                                  className='border-2 border-stroke w-[10%] rounded-md'
                                >
                                </input>
                              </>
                            ) :
                              (
                                <>
                                  <label className="text-neutral-500 text-sm font-semibold">
                                    {dataPoint.qty}
                                  </label>
                                </>
                              )
                            }



                          </div>
                        </div>




                        <div className="grid grid-cols-12 px-3 py-4 border-b-8 border-[#D8EAFF] gap-2">
                          {
                            dataPoint.inspeksi_lipat_result.map(
                              (dataResult: any, iResult: number) => {
                                return (
                                  <>
                                    {dataPoint.status == 'on progress' ? (
                                      <>
                                        <div className="flex gap-4 col-span-2">
                                          <label className="text-neutral-500 text-sm font-semibold">
                                            {iResult + 1}
                                          </label>
                                          <label className="text-neutral-500 text-sm font-semibold">
                                            {dataResult.point_check}
                                          </label>
                                        </div>
                                        <label className="text-neutral-400 text-sm font-semibold col-span-2">
                                          {dataResult.acuan}
                                        </label>
                                        <div className="flex flex-col gap-1 col-span-2">
                                          <div>
                                            <input
                                              required
                                              type="radio"
                                              id="sesuai1"
                                              name={`sesuai1 ${iResult}`}
                                              value="sesuai"
                                              onChange={(e) => {
                                                // hasvalue(iPoint)
                                                // console.log(isOnprogres2)
                                                handleChangePointRadio(
                                                  e,
                                                  iPoint,
                                                  iResult,
                                                );
                                              }}
                                            />
                                            <label className="pl-2">
                                              Sesuai
                                            </label>
                                          </div>
                                          <div>
                                            <input
                                              required
                                              type="radio"
                                              id="sesuai12"
                                              name={`sesuai1 ${iResult}`}
                                              value="tidak sesuai"
                                              onChange={(e) => {

                                                // hasvalue(iPoint)
                                                handleChangePointRadio(
                                                  e,
                                                  iPoint,
                                                  iResult,
                                                );
                                              }}
                                            />
                                            <label className="pl-2">
                                              Tidak Sesuai
                                            </label>
                                          </div>
                                        </div>
                                        <textarea
                                          required
                                          name="keterangan"
                                          onChange={(e) => {
                                            handleChangePoint(
                                              e,
                                              iPoint,
                                              iResult,
                                            );
                                          }}
                                          className=" col-span-3 peer h-full min-h-[50px] w-full resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                                        ></textarea>
                                        <div className="flex flex-col w-full col-span-3">
                                          <label className="text-neutral-500 text-sm font-semibold">
                                            Upload Foto
                                          </label>
                                          <div className="flex w-full rounded-md border border-stroke px-2 py-2">
                                            <label
                                              htmlFor="formFile"
                                              className="flex items-center px-4 py-1 rounded-md bg-primary text-white font-medium cursor-pointer hover:bg-primary-dark"
                                            >
                                              Pilih File
                                              <input
                                                type="file"
                                                id="formFile"
                                                accept="image/*"
                                                className="hidden"
                                              />
                                            </label>

                                            <span
                                              id="formFile"
                                              className="ml-2 text-sm"
                                            ></span>
                                          </div>
                                        </div>

                                      </>
                                    ) :
                                      (
                                        <>
                                          <div className="flex gap-4 col-span-2">
                                            <label className="text-neutral-500 text-sm font-semibold">
                                              {iResult + 1}
                                            </label>
                                            <label className="text-neutral-500 text-sm font-semibold">
                                              {dataResult.point_check}
                                            </label>
                                          </div>
                                          <label className="text-neutral-400 text-sm font-semibold col-span-2">
                                            {dataResult.acuan}
                                          </label>
                                          <div className="flex flex-col gap-1 col-span-2">
                                            {dataPoint.inspeksi_lipat_result[iResult]?.hasil_check}
                                          </div>
                                          <textarea
                                            defaultValue={dataPoint.inspeksi_lipat_result[iResult]?.keterangan}
                                            name="keterangan"
                                            readOnly
                                            className=" col-span-3 peer h-full min-h-[50px] w-full resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                                          ></textarea>
                                          <div className="flex flex-col w-full col-span-3">

                                          </div>

                                        </>
                                      )}

                                  </>
                                );
                              },
                            )
                          }
                          {
                            dataPoint.status == 'on progress' ? (
                              <>
                                <button

                                  type="button"
                                  onClick={() =>

                                    saveChecksheetResult(
                                      dataPoint.id,
                                      dataPoint.inspeksi_lipat_result,
                                      dataPoint.waktu_mulai,
                                      iPoint
                                    )
                                  }
                                  className="bg-green-500 h-10  rounded-md  text-white text-xs font-bold"
                                >
                                  {isLoading ? 'Loading...' : 'SIMPAN'}
                                </button>
                                {isLoading && <Loading />}

                              </>

                            ) : null
                          }


                        </div >
                      </>
                    );
                  },
                )}
                {!isOnprogres && !isIncoming && incoming?.status != 'history' && (
                  <>
                    <div className='px-2 py-3'>
                      <button
                        disabled={isLoading}
                        type="button"
                        onClick={() => {
                          tambahChecksheetPoint(incoming.id);
                        }}
                        className="bg-blue-500 h-10 w-20  rounded-md  text-white text-xs font-bold"
                      >
                        {isLoading ? 'Loading...' : 'TAMBAH'}
                      </button>
                      {isLoading && <Loading />}
                    </div>


                  </>
                )}

              </>


              {/* =============================================Checksheet STOP==========================================================*/}
              {incoming?.waktu_mulai != null &&
                incoming?.waktu_selesai != null && (
                  <>
                    {/* =============================Point 1========================== */}

                    <>
                      {incoming?.inspeksi_lipat_point.map(
                        (dataPoint: any, iPoint: number) => {

                          return (
                            <div className="grid grid-cols-12 px-3 py-4 border-b-8 border-[#D8EAFF] gap-2">
                              {dataPoint.inspeksi_lipat_result.map(
                                (dataResult: any, iResult: number) => {

                                  return (
                                    <>
                                      <div className="flex gap-4 col-span-2">
                                        <label className="text-neutral-500 text-sm font-semibold">
                                          {iResult + 1}
                                        </label>
                                        <label className="text-neutral-500 text-sm font-semibold">
                                          {dataResult.point_check}
                                        </label>
                                      </div>
                                      <label className="text-neutral-400 text-sm font-semibold col-span-2">
                                        {dataResult.acuan}
                                      </label>
                                      <div className="flex flex-col gap-1 col-span-2">
                                        <label className="text-neutral-400 text-sm font-semibold col-span-2">
                                          {dataResult.hasil_check}
                                        </label>
                                      </div>
                                      <textarea
                                        name="keterangan"
                                        disabled
                                        defaultValue={dataResult.keterangan}
                                        className=" col-span-3 peer h-full min-h-[50px] w-full resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                                      ></textarea>
                                      <div className="flex flex-col w-full col-span-3"></div>
                                    </>
                                  );
                                },
                              )}
                            </div>
                          );
                        },
                      )}
                    </>
                  </>
                )}

              <div className="bg-white grid grid-cols-10 px-4 py-4 items-center gap-4">


                <label className="text-neutral-500 text-sm font-semibold col-span-8">
                  Catatan
                  {
                    incoming?.status == 'incoming' ? (
                      <>
                        <textarea
                          required
                          onChange={(e) => {
                            setCtt(e.target.value);
                          }}
                          className="peer h-full min-h-[50px] w-full resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                        ></textarea>
                      </>
                    ) : (
                      <>:{incoming?.catatan}</>
                    )}
                </label>

                <div className="flex h-full col-span-2 items-end justify-end w-full">
                  {!isIncoming && !isOnprogres &&

                    incoming?.status == 'incoming' ? (
                    <>
                      <button
                        disabled={isLoading}
                        type="submit"
                        value="submit"
                        className="bg-green-500 h-10 px-6 py-3 rounded-md  text-white text-xs font-bold"
                      >
                        {isLoading ? 'Loading...' : 'SUBMIT CHECKSHEET'}
                      </button>
                      {isLoading && <Loading />}
                    </>
                  ) : (
                    <></>
                  )}
                </div>
              </div>
            </div>
          </form>
        </main >
      )
      }
    </>
  );
}

export default ChecksheetLipat;
