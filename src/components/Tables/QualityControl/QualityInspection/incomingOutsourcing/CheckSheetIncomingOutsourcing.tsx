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
    const url = `${
      import.meta.env.VITE_API_LINK
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
    const url = `${
      import.meta.env.VITE_API_LINK
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
    const url = `${
      import.meta.env.VITE_API_LINK
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
    const url = `${
      import.meta.env.VITE_API_LINK
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
    const url = `${
      import.meta.env.VITE_API_LINK
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
    const url = `${
      import.meta.env.VITE_API_LINK
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
              Barang Rusak Sebagian Checksheet
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
                  Jumlah Druk
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
                  : {FinalInspection?.data?.jumlah_druk}
                </label>
                <input
                  type="text"
                  name=""
                  className="border"
                  id=""
                  onChange={(e) => setOutsourcing(e.target.value)}
                />
              </div>

              <div className="grid grid-rows-6  gap-2 col-span-2 justify-between px-10 py-4">
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
              <div className="grid grid-rows-6  gap-2 col-span-2 justify-between px-2 py-4">
                <select onChange={(e) => setJenis(e.target.value)}>
                  <option value={''}>Jenis</option>
                  <option value={'isi pertama'}>isi pertama</option>
                  <option value={'isi kedua'}>isi kedua</option>
                </select>
                <div className="flex flex-col">
                  <div className="flex gap-2">
                    <input
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

                <select onChange={(e) => setStatusJo(e.target.value)}>
                  <option value={''}>Status</option>
                  <option value={'status pertama'}>status pertama</option>
                  <option value={'status kedua'}>status kedua</option>
                </select>

                {/* <input
                  type="date"
                  onChange={(e) => setWaktuSortir(e.target.value)}
                /> */}

                <label className="text-neutral-500 text-sm font-semibold"></label>
              </div>
              <div className="grid grid-rows-6  gap-2 col-span-2 justify-between px-10 py-4">
                <label className="text-neutral-500 text-sm font-semibold">
                  Inspector
                </label>
              </div>
              <div className="grid grid-rows-6  gap-2 col-span-2 justify-between px-2 py-4">
                <label className="text-neutral-500 text-sm font-semibold">
                  : {FinalInspection?.data?.inspektor.nama}
                </label>
              </div>
              <div className="flex flex-col w-full items-center gap-4 px-10 py-4 col-span-2  bg-[#F6FAFF]">
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
                              onClick={() => {
                                startTaskFinal(FinalInspection?.data.id);
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

          <div className="bg-white mb-2text-sm flex font-semibold px-5 py-2 mb-2">
            <div className="grid grid-cols-5 gap-5 items-center w-full">
              <div className="col-span-3">
                <p>catatan*:</p>
                <textarea
                  name=""
                  id=""
                  className="w-full border"
                  onChange={(e) => setCatatan(e.target.value)}
                ></textarea>
              </div>
              <div className="flex flex-col">
                <div className="flex gap-2">
                  <input
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
                onClick={() => {
                  doneRabut(
                    FinalInspection?.data.id,
                    FinalInspection?.data.waktu_mulai,
                  );
                  //console.log(FinalInspection.data.incoming_outsourcing_result);
                }}
                className="text-sm text-white bg-green-600 py-2"
              >
                SUBMIT CHECKSHEET
              </button>
            </div>
          </div>
        </main>
      )}
    </>
  );
}

export default ChecksheetRusakSebagian;
