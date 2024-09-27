import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import convertTimeStampToDateOnly from '../../../../../utils/convertDateOnly';
import convertDateToTime from '../../../../../utils/converDateToTime';
import calculateElapsedTime from '../../../../../utils/calculateElapsedTime';
import formatElapsedTime from '../../../../../utils/formatElapsedTime';
import Loading from '../../../../Loading';
import convertTimeStampToDateTime from '../../../../../utils/converDateTime';

function ChecksheetRusakSebagian() {
  const { id } = useParams();
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [FinalInspection, setFinalInspection] = useState<any>();
  const [Catatan, setCatatan] = useState<any>();
  const [Hasil, setHasil] = useState<any>();
  const [Outsourcing, setOutsourcing] = useState<any>();
  const [Jenis, setJenis] = useState<any>();
  const [JenisHasil, setJenisHasil] = useState<any>();
  const [StatusJo, setStatusJo] = useState<any>();
  const [WaktuSortir, setWaktuSortir] = useState<any>();

  useEffect(() => {
    getFinalInspection();
  }, []);

  async function getFinalInspection() {
    const url = `${import.meta.env.VITE_API_LINK
      }/qc/cs/incomingOutsourcing/${id}`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      setFinalInspection(res.data);
      console.log(res.data);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  async function startTaskFinal(id: number) {
    const url = `${import.meta.env.VITE_API_LINK
      }/qc/cs/incomingOutsourcing/start/${id}`;
    try {
      const res = await axios.get(
        url,

        {
          withCredentials: true,
        },
      );

      getFinalInspection();
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
    const url = `${import.meta.env.VITE_API_LINK
      }/qc/cs/inspeksiFinalPoint/stop/${id}`;
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

      getFinalInspection();
    } catch (error: any) {
      console.log(error.response.data.msg);
      alert(error.response.data.msg);
    }
  }

  async function tambahTaskRabut(id: number) {
    const url = `${import.meta.env.VITE_API_LINK
      }/qc/cs/inspeksiFinalPoint/create`;
    try {
      setIsLoading(true);
      const res = await axios.post(
        url,
        {
          id_inspeksi_rabut: id,
        },
        {
          withCredentials: true,
        },
      );
      setIsLoading(false);
      getFinalInspection();
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  async function doneRabut(id: number, startTime: any) {
    if (Jenis == null) {
      // Check if start time is available
      alert('Status JO Belum Terisi');
      return; // Exit function if no start time
    }

    if (StatusJo == null) {
      // Check if start time is available
      alert('Status JO Belum Terisi');
      return; // Exit function if no start time
    }

    const url = `${import.meta.env.VITE_API_LINK
      }/qc/cs/incomingOutsourcing/done/${id}`;
    try {
      const elapsedSeconds = calculateElapsedTime(startTime, new Date());
      const res = await axios.put(
        url,
        {
          hasil_check: FinalInspection.data.incoming_outsourcing_result,
          lama_pengerjaan: elapsedSeconds,
          catatan: Catatan,
          hasil: Hasil,
          outsourcing: Outsourcing,
          jenis: Jenis,
          jenis_hasil: JenisHasil,
          status_jo: StatusJo,
          waktu_sortir: WaktuSortir,
        },
        {
          withCredentials: true,
        },
      );

      getFinalInspection();
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  async function pendingRabut(id: number) {
    const url = `${import.meta.env.VITE_API_LINK
      }/qc/cs/inspeksiFinal/pending/${id}`;
    try {
      const res = await axios.put(
        url,
        {},
        {
          withCredentials: true,
        },
      );

      getFinalInspection();
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  const handleChangePoint = (e: any, i: number) => {
    const { name, value } = e.target;
    const onchangeVal: any = FinalInspection;
    onchangeVal.data.incoming_outsourcing_result[i][name] = value;
    setFinalInspection(onchangeVal);
  };

  const handleChangePointRadio = (e: any, i: number) => {
    const { name, value } = e.target;
    const onchangeVal: any = FinalInspection;
    onchangeVal.data.incoming_outsourcing_result[i]['hasil_check'] = value;
    setFinalInspection(onchangeVal);
  };

  const tanggal = convertTimeStampToDateOnly(FinalInspection?.data?.tanggal);
  const jam = convertDateToTime(FinalInspection?.data?.tanggal);

  const jumlahWaktuCheck = formatElapsedTime(
    FinalInspection?.data?.waktu_check,
  );

  const waktuMulaiincoming = convertTimeStampToDateTime(
    FinalInspection != null && FinalInspection.data?.waktu_mulai,
  );

  const waktuSelesaiFinalIncoming =
    FinalInspection != null && FinalInspection.data?.waktu_selesai != null
      ? convertTimeStampToDateTime(FinalInspection.data?.waktu_selesai)
      : '-';

  return (
    <>
      {!isMobile && (
        <main className="overflow-x-hidden">
          <form action="" onSubmit={(e) => {
            e.preventDefault();
            doneRabut(
              FinalInspection?.data.id,
              FinalInspection?.data.waktu_mulai,
            );
            //console.log(FinalInspection.data.incoming_outsourcing_result);
          }}>
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
                Incoming Outsourcing Checksheet
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
                    Nama Produk
                  </label>

                  <label className="text-neutral-500 text-sm font-semibold">
                    Jumlah Druk / Mata
                  </label>
                  <label className="text-neutral-500 text-sm font-semibold">
                    Jumlah Pcs
                  </label>
                  <label className="text-neutral-500 text-sm font-semibold">
                    Outsourcing
                  </label>
                </div>
                <div className="grid grid-rows-6 gap-2 col-span-2  py-4">
                  <label className="text-neutral-500 text-sm font-semibold">
                    : {tanggal}
                  </label>

                  <label className="text-neutral-500 text-sm font-semibold">
                    : {FinalInspection?.data?.no_jo}
                  </label>

                  <label className="text-neutral-500 text-sm font-semibold">
                    : {FinalInspection?.data?.nama_produk}
                  </label>
                  <label className="text-neutral-500 text-sm font-semibold">
                    : {FinalInspection?.data?.jumlah_druk} / {FinalInspection?.data?.isi_mata}
                  </label>
                  <label className="text-neutral-500 text-sm font-semibold">
                    : {FinalInspection?.data?.jumlah_pcs}
                  </label>
                  {FinalInspection?.data?.status == 'incoming' ? (
                    <>
                      <input
                        required
                        type="text"
                        name=""
                        className="border px-1"
                        id=""
                        onChange={(e) => setOutsourcing(e.target.value)}
                      />
                    </>
                  ) :
                    (
                      <>
                        <input
                          readOnly
                          defaultValue={FinalInspection?.data?.outsourcing}
                          type="text"
                          name=""
                          className="border px-1"
                          id=""

                        />
                      </>
                    )
                  }


                </div>
                <div className="grid grid-rows-6  gap-2 col-span-2   py-4">
                  <label className="text-neutral-500 text-sm font-semibold">
                    Jenis
                  </label>
                  <label htmlFor=""></label>
                  <label className="text-neutral-500 text-sm font-semibold">
                    Status
                  </label>
                  {/* <label className="text-neutral-500 text-sm font-semibold">
                  Waktu Sortir
                </label> */}
                  <label className="text-neutral-500 text-sm font-semibold"></label>
                </div>
                {FinalInspection?.data?.status == 'incoming' ? (
                  <>
                    <div className="grid grid-rows-6  gap-2 col-span-3  px-2 py-4">

                      <div className=' text-[#646464]   flex flex-col gap-1'>

                        <div className="relative z-20 h-10 bg-white dark:bg-form-input  w-full">
                          <span className="absolute top-1/2 left-4 z-30 -translate-y-1/2">
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 20 20"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >

                            </svg>
                          </span>

                          <select

                            onChange={(e) => setJenis(e.target.value)}
                            className={`relative z-20 w-full bg-[#64646424] appearance-none rounded-md h-7 py-1 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input  
                  }`}
                          >
                            <option selected disabled className="text-[#646464] text-xs dark:text-bodydark">
                              Pilih Jenis
                            </option>

                            <option value="UV" className="text-[#646464] text-xs dark:text-bodydark">
                              UV
                            </option>
                            <option value="FOIL" className="text-[#646464] text-xs dark:text-bodydark">
                              FOIL
                            </option>
                            <option value="EMBOSS" className="text-[#646464] text-xs dark:text-bodydark">
                              EMBOSS
                            </option>
                            <option value="LAMINASI KILAP" className="text-[#646464] text-xs dark:text-bodydark">
                              LAMINASI KILAP
                            </option>
                            <option value="LAMINASI DOFF" className="text-[#646464] text-xs dark:text-bodydark">
                              LAMINASI DOFF
                            </option>

                          </select>

                          <span className="absolute top-[15px] right-4 z-10 -translate-y-1/2">
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
                      <div className="flex flex-col">
                        <div className="flex gap-2">
                          <input
                            required
                            type="radio"
                            name="ss"
                            id="ss"
                            value={'Sesuai'}
                            onChange={(e) => setJenisHasil(e.target.value)}
                          />
                          <label className="mr-2" htmlFor="ss">
                            Sesuai
                          </label>
                        </div>
                        <div className="flex gap-2">
                          <input
                            required
                            type="radio"
                            name="ss"
                            id="ss1"
                            value={'Tidak Sesuai'}
                            onChange={(e) => setJenisHasil(e.target.value)}
                          />
                          <label className="mr-2" htmlFor="ss1">
                            Tidak Sesuai
                          </label>
                        </div>
                      </div>
                      <div className=' text-[#646464]   flex flex-col gap-1'>

                        <div className="relative z-20 h-10 bg-white dark:bg-form-input  w-full">
                          <span className="absolute top-1/2 left-4 z-30 -translate-y-1/2">
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 20 20"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >

                            </svg>
                          </span>

                          <select
                            onChange={(e) => setStatusJo(e.target.value)}
                            className={`relative z-20 w-full bg-[#64646424] appearance-none rounded-md h-7 py-1 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input  
}`}
                          >
                            <option selected disabled className="text-[#646464] text-xs dark:text-bodydark">
                              Pilih Status JO
                            </option>

                            <option value="BARU" className="text-[#646464] text-xs dark:text-bodydark">
                              BARU
                            </option>
                            <option value="REPEAT" className="text-[#646464] text-xs dark:text-bodydark">
                              REPEAT
                            </option>
                            <option value="PROOF" className="text-[#646464] text-xs dark:text-bodydark">
                              PROOF
                            </option>
                            <option value="CUPK" className="text-[#646464] text-xs dark:text-bodydark">
                              CUPK
                            </option>
                            <option value="PERUBAHAN" className="text-[#646464] text-xs dark:text-bodydark">
                              REPEAT PERUBAHAN
                            </option>

                          </select>

                          <span className="absolute top-[15px] right-4 z-10 -translate-y-1/2">
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


                      {/* <input
type="date"
onChange={(e) => setWaktuSortir(e.target.value)}
/> */}

                      <label className="text-neutral-500 text-sm font-semibold"></label>
                    </div>
                  </>
                ) :
                  (
                    <>
                      <div className="grid grid-rows-6  gap-2 col-span-3  px-2 py-4">

                        <div className=' text-[#646464]   flex flex-col gap-1'>
                          : {FinalInspection?.data?.jenis}
                        </div>
                        <div className="flex flex-col text-[#646464] ">
                          : {FinalInspection?.data?.jenis_hasil}
                        </div>

                        <div className=' text-[#646464]   flex flex-col gap-1'>
                          : {FinalInspection?.data?.status_jo}
                        </div>



                        <label className="text-neutral-500 text-sm font-semibold"></label>
                      </div>
                    </>
                  )
                }



                <div className="flex flex-col w-full gap-4 px-2 py-4 col-span-3 bg-[#F6FAFF]">
                  <div className="  gap-2 col-span-2 justify-between px-2 py-4">
                    <label className="text-neutral-500 text-sm font-semibold">
                      Inspector  : {FinalInspection?.data?.inspektor?.nama}
                    </label>
                  </div>

                  <div>
                    {FinalInspection?.data.waktu_mulai == null &&
                      FinalInspection?.data.waktu_selesai == null && (
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
                                  startTaskFinal(FinalInspection?.data.id);
                                }}
                                className="flex w-[45%]  rounded-md bg-[#00B81D] justify-center items-center px-2 py-2 hover:cursor-pointer"
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
                    {FinalInspection?.data.waktu_mulai != null &&
                      FinalInspection?.data.waktu_selesai == null && (
                        <>
                          <div>
                            <p className="md:text-[14px] text-[9px] font-semibold">
                              Waktu Mulai : {waktuMulaiincoming}
                            </p>
                            <p className="md:text-[14px] text-[9px] font-semibold">
                              Waktu Selesai : {waktuSelesaiFinalIncoming}
                            </p>
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
                    {FinalInspection?.data.waktu_mulai != null &&
                      FinalInspection?.data.waktu_selesai != null && (
                        <>
                          <div className="gap-1 flex flex-col">
                            <p className="md:text-[14px] text-[9px] font-semibold">
                              Waktu Mulai :
                            </p>
                            <p className="md:text-[14px] text-[9px] font-semibold text-stone-400">
                              {waktuMulaiincoming}
                            </p>
                            <p className="md:text-[14px] text-[9px] font-semibold">
                              Waktu Selesai :
                            </p>
                            <p className="md:text-[14px] text-[9px] font-semibold text-stone-400">
                              {waktuSelesaiFinalIncoming}
                            </p>
                            <p className="md:text-[14px] text-[9px] font-semibold">
                              Time :
                            </p>
                            <p className="md:text-[14px] text-[9px] font-semibold text-stone-400">
                              {FinalInspection?.data.lama_pengerjaan != null
                                ? formatElapsedTime(
                                  FinalInspection?.data.lama_pengerjaan,
                                )
                                : ''}{' '}
                              Detik
                            </p>
                          </div>
                        </>
                      )}
                  </div>
                </div>
              </div>

              {/* =============================chekcsheet========================= */}
            </div>
            {FinalInspection?.data.waktu_mulai != null &&
              FinalInspection?.data.waktu_selesai == null && (
                <>
                  <div className="bg-white mb-2text-sm flex font-semibold px-5 py-2 mb-2">
                    <p className="w-20">No</p>
                    <div className="grid grid-cols-5 w-full">
                      <p>Point Check</p>
                      <p>Standar</p>
                      <p>Hasil Point</p>
                    </div>
                  </div>
                  {FinalInspection?.data.incoming_outsourcing_result.map(
                    (data: any, index: number) => {
                      return (
                        <div className="bg-white mb-2text-sm flex font-semibold px-5 py-2 mb-2">
                          <p className="w-20 my-auto">{index + 1}</p>
                          <div className="grid grid-cols-5 items-center w-full">
                            <p>{data.point_check}</p>
                            <p className="">{data.standard}</p>
                            <div className="flex flex-col">
                              <div className="flex gap-2">
                                <input
                                  required
                                  type="radio"
                                  name={`ss ${index}`}
                                  id="ss"
                                  value="Sesuai"
                                  onChange={(e) => handleChangePointRadio(e, index)}
                                />
                                <label className="mr-2" htmlFor="ss">
                                  Sesuai
                                </label>
                              </div>
                              <div className="flex gap-2">
                                <input
                                  required
                                  type="radio"
                                  name={`ss ${index}`}
                                  id="ss1"
                                  value="Tidak Sesuai"
                                  onChange={(e) => handleChangePointRadio(e, index)}
                                />
                                <label className="mr-2" htmlFor="ss1">
                                  Tidak Sesuai
                                </label>
                              </div>
                            </div>
                            <div>
                              <input type="file" name="" id="" />
                            </div>
                          </div>
                        </div>
                      );
                    },
                  )}
                </>
              )
            }
            {FinalInspection?.data?.status == 'history' &&
              (
                <>
                  <div className="bg-white mb-2text-sm flex font-semibold px-5 py-2 mb-2">
                    <p className="w-20">No</p>
                    <div className="grid grid-cols-5 w-full">
                      <p>Point Check</p>
                      <p>Standar</p>
                      <p>Hasil Point</p>
                    </div>
                  </div>
                  {FinalInspection?.data.incoming_outsourcing_result.map(
                    (data: any, index: number) => {
                      return (
                        <div className="bg-white mb-2text-sm flex font-semibold px-5 py-2 mb-2">
                          <p className="w-20 my-auto">{index + 1}</p>
                          <div className="grid grid-cols-5 items-center w-full">
                            <p>{data.point_check}</p>
                            <p className="">{data.standard}</p>
                            <div className="flex flex-col">
                              <div className="flex gap-2">
                                {data.hasil_check}
                              </div>
                            </div>
                            <div>

                            </div>
                          </div>
                        </div>
                      );
                    },
                  )}
                </>
              )}

            {FinalInspection?.data?.status == 'incoming' ? (
              <>
                <div className="bg-white text-sm flex font-semibold px-5 py-2 mb-2">
                  <div className="grid grid-cols-5 gap-5 items-center w-full">
                    <div className="col-span-3">
                      <p>catatan*:</p>
                      <textarea
                        required
                        name=""
                        id=""
                        className="w-full border"
                        onChange={(e) => setCatatan(e.target.value)}
                      ></textarea>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex gap-2">
                        <input
                          required
                          type="radio"
                          name="ss"
                          id="ss"
                          value={'Diterima'}
                          onChange={(e) => setHasil(e.target.value)}
                        />
                        <label className="mr-2" htmlFor="ss">
                          DITERIMA
                        </label>
                      </div>
                      <div className="flex gap-2">
                        <input
                          required
                          type="radio"
                          name="ss"
                          id="ss1"
                          value={'Ditolak'}
                          onChange={(e) => setHasil(e.target.value)}
                        />
                        <label className="mr-2" htmlFor="ss1">
                          DITOLAK
                        </label>
                      </div>
                    </div>
                    <button
                      type='submit'
                      value='submit'
                      className="text-sm text-white bg-green-600 py-2"
                    >
                      SUBMIT CHECKSHEET
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>

                <div className="flex gap-8 bg-white px-4 py-7 w-full text-lg font-semibold uppercase justify-between">
                  <p>
                    Catatan :
                    {FinalInspection?.data.catatan}
                  </p>
                  <p>
                    {FinalInspection?.data.hasil_check}
                  </p>




                </div>
              </>
            )
            }

          </form>
        </main>
      )}
    </>
  );
}

export default ChecksheetRusakSebagian;
