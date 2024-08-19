import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import convertTimeStampToDateOnly from '../../../../../utils/convertDateOnly';
import convertDateToTime from '../../../../../utils/converDateToTime';
import calculateElapsedTime from '../../../../../utils/calculateElapsedTime';
import formatElapsedTime from '../../../../../utils/formatElapsedTime';
import X from '../../../../../images/icon/X2.svg';
import ok from '../../../../../images/icon/OKQC.svg';
import oktole from '../../../../../images/icon/okToleransiQC.svg';
import notok from '../../../../../images/icon/notOKQC.svg';
import ModalAddPeriode from '../../../../Modals/Qc/ModalAddPeriode';

function CheckSheetPondPeriode() {
  const { id } = useParams();
  const [isMobile, setIsMobile] = useState(false);

  const [pondMesinPeriode, setPondMesinPeriode] = useState<any>();
  const [catatan, setCatatan] = useState<any>();
  const [kode, setKode] = useState<any>();
  const [masalah, setMasalah] = useState<any>();

  const [openGuide, setOpenGuide] = useState(null);
  const handleClickGuide = (index: any) => {
    setOpenGuide((prevState: any) => {
      return prevState === index ? null : index;
    });
  };
  const [add, setAdd] = useState<any>();
  const [showDetail, setShowDetail] = useState<boolean[]>(
    new Array(add != null && add.length).fill(false),
  );
  const handleClickAdd = (index: number) => {
    setShowDetail((prevState) => {
      const updatedShowDetail = [...prevState]; // Create a copy
      updatedShowDetail[index] = !updatedShowDetail[index]; // Toggle value
      return updatedShowDetail;
    });
  };
  useEffect(() => {
    getPondMesinPeriode();
  }, []);

  async function getPondMesinPeriode() {
    const url = `${import.meta.env.VITE_API_LINK}/qc/cs/inspeksiPond/${id}`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      setPondMesinPeriode(res.data.data);
      console.log(res.data.data);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  async function startTaskCekPeriode(id: number) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiPondPeriodePoint/start/${id}`;
    try {
      const res = await axios.put(
        url,
        {},
        {
          withCredentials: true,
        },
      );

      getPondMesinPeriode();
    } catch (error: any) {
      console.log(error.data.msg);
      alert(error.response.data.msg);
    }
  }

  async function stopTaskCekPeriode(
    id: number,
    startTime: any,
    catatan: any,
    numerator: any,
    jumlah_sampling: any,
    data_defect: any,
  ) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiPondPeriodePoint/stop/${id}`;
    try {
      const elapsedSeconds = calculateElapsedTime(startTime, new Date());
      console.log(elapsedSeconds);
      const res = await axios.put(
        url,
        {
          catatan: catatan,
          lama_pengerjaan: elapsedSeconds,
          numerator: numerator,
          jumlah_sampling: jumlah_sampling,
          data_defect: data_defect,
        },
        {
          withCredentials: true,
        },
      );

      getPondMesinPeriode();
    } catch (error: any) {
      console.log(error);
    }
  }

  async function tambahTaskCekPeriode(id: number) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiPondPeriodePoint/create`;
    try {
      const res = await axios.post(
        url,
        {
          id_inspeksi_pond_periode: id,
        },
        {
          withCredentials: true,
        },
      );

      getPondMesinPeriode();
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  async function tambahDefectPeriode(
    id: number,
    kode: any,
    masalah: any,
    index: number,
  ) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiPondPeriodePoint/createDefect`;
    try {
      const res = await axios.post(
        url,

        {
          id_inspeksi_pond_periode_point: id,
          kode: kode,
          masalah: masalah,
        },

        {
          withCredentials: true,
        },
      );
      handleClickAdd(index);
      setShowModal2(false);
      setKode(null);
      setMasalah(null);
      getPondMesinPeriode();
    } catch (error: any) {
      console.log(error);
    }
  }

  async function doneCekPeriode(id: number) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiPondPeriode/done/${id}`;
    try {
      const res = await axios.put(
        url,
        { catatan: catatan },
        {
          withCredentials: true,
        },
      );

      getPondMesinPeriode();
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  const handleChangePoint = (e: any, i: number) => {
    const { name, value } = e.target;
    const onchangeVal: any = pondMesinPeriode;
    onchangeVal.inspeksi_pond_periode[0].inspeksi_pond_periode_point[i][name] =
      value;
    setPondMesinPeriode(onchangeVal);
  };

  const handleChangePointDefect = (e: any, i: number, ii: number) => {
    const { name, value } = e.target;
    const onchangeVal: any = pondMesinPeriode;
    onchangeVal.inspeksi_pond_periode[0].inspeksi_pond_periode_point[
      i
    ].inspeksi_pond_periode_defect[ii][name] = value;
    setPondMesinPeriode(onchangeVal);
  };

  const tanggal = convertTimeStampToDateOnly(pondMesinPeriode?.tanggal);
  const jam = convertDateToTime(pondMesinPeriode?.tanggal);

  const jumlahWaktuCheck = formatElapsedTime(
    pondMesinPeriode?.inspeksi_pond_awal[0].waktu_check,
  );

  const [filling, setFilling] = useState(false);

  const [showModal2, setShowModal2] = useState(false);
  const openModal2 = () => setShowModal2(true);
  const closeModal2 = () => setShowModal2(false);

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
              Printing Checksheet
            </p>

            <div className="grid grid-cols-12  border-b-8 border-[#D8EAFF]">
              <div className="grid grid-rows-6 gap-2 col-span-2 pl-6 py-4 ">
                <label className="text-neutral-500 text-sm font-semibold">
                  Tanggal
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Jumlah Druk / Mata
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Ukuran Jadi
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Jenis Kertas
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Jenis Gramatur
                </label>
              </div>
              <div className="grid grid-rows-6 gap-2 col-span-2  py-4">
                <label className="text-neutral-500 text-sm font-semibold">
                  : {tanggal}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {pondMesinPeriode?.jumlah_druk} / Isi :{' '}
                  {pondMesinPeriode?.mata}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {pondMesinPeriode?.ukuran_jadi}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {pondMesinPeriode?.jenis_kertas}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {pondMesinPeriode?.jenis_gramatur}
                </label>
              </div>

              <div className="grid grid-rows-6  gap-2 col-span-2 justify-between px-10 py-4">
                <label className="text-neutral-500 text-sm font-semibold">
                  Jam
                </label>
                <label className="text-neutral-500 text-sm font-semibold"></label>
                <label className="text-neutral-500 text-sm font-semibold">
                  No. JO / IO
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Nama Produk
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Customer
                </label>
              </div>
              <div className="grid grid-rows-6  gap-2 col-span-2 justify-between px-2 py-4">
                <label className="text-neutral-500 text-sm font-semibold">
                  : {jam}
                </label>
                <label className="text-neutral-500 text-sm font-semibold"></label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {pondMesinPeriode?.no_jo} / {pondMesinPeriode?.no_io}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {pondMesinPeriode?.nama_produk}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {pondMesinPeriode?.customer}
                </label>
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
                  : {pondMesinPeriode?.shift}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  :{pondMesinPeriode?.mesin}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {pondMesinPeriode?.operator}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {pondMesinPeriode?.status}
                </label>
              </div>
            </div>

            {/* =============================chekcsheet========================= */}

            {pondMesinPeriode?.inspeksi_pond_periode[0].inspeksi_pond_periode_point?.map(
              (data: any, index: number) => {
                const waktuSampling = convertDateToTime(data.waktu_mulai);
                const lamaPengerjaan = formatElapsedTime(data.lama_pengerjaan);
                return (
                  <>
                    <label
                      className="text-blue-400 text-sm font-semibold w-full flex justify-end px-4 py-2"
                      onClick={() => handleClickGuide(index)}
                    >
                      FILLING GUIDE
                    </label>
                    {openGuide == index ? (
                      <div className="z-50 absolute right-6 rounded-md bg-[#F3F3F3] border-gray flex w-[96%] px-10 py-6 justify-between">
                        <div className="grid grid-cols-2">
                          <div className="flex flex-col">
                            <label className="text-blue-600 text-sm font-semibold pb-6">
                              KODE-MASALAH
                            </label>
                            {data.inspeksi_pond_periode_defect.map(
                              (data3: any, iii: number) => {
                                return (
                                  <label className="text-neutral-500 text-sm font-semibold">
                                    {data3.kode} -{data3.masalah}
                                  </label>
                                );
                              },
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between items-start w-[30%]">
                          <div className="flex flex-col gap-3">
                            <label className="text-blue-600 text-sm font-semibold pb-6">
                              FORM FILLING GUIDE
                            </label>
                            <label className="text-black text-sm font-semibold flex gap-2">
                              <img alt="" src={ok} className="w-5"></img>OK
                            </label>
                            <label className="text-black text-sm font-semibold flex gap-2">
                              <img alt="" src={oktole} className="w-5"></img>OK
                              (Toleransi)
                            </label>
                            <label className="text-black text-sm font-semibold flex gap-2">
                              <img alt="" src={notok} className="w-5"></img>NOT
                              OK
                            </label>
                          </div>

                          <img
                            onClick={() => handleClickGuide(index)}
                            src={X}
                            alt=""
                            className="mx-3 w-7  text-blue-600 bg-blue-600 px-1 py-1 rounded-full"
                          />
                        </div>
                      </div>
                    ) : (
                      <></>
                    )}
                    <div className="flex px-5 py-5 gap-7">
                      <label className="text-sm font-semibold">1</label>
                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold">
                          INSPEKTOR
                        </label>
                        <label className="text-sm font-semibold">
                          {data.inspektor?.nama}
                        </label>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold">
                          WAKTU SAMPLING
                        </label>
                        <label className="text-sm font-semibold">
                          {waktuSampling}
                        </label>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold">
                          NUMERATOR<span className="text-red-600">*</span>
                        </label>
                        {data.status == 'done' ? (
                          <input
                            type="text"
                            disabled
                            defaultValue={data.numerator}
                            name="numerator"
                            onChange={(e) => handleChangePoint(e, index)}
                            className="text-sm font-semibold w-[90%] border-stroke border"
                          ></input>
                        ) : data.status == 'on progress' ? (
                          <input
                            type="text"
                            name="numerator"
                            onChange={(e) => handleChangePoint(e, index)}
                            className="text-sm font-semibold w-[90%] border-stroke border"
                          ></input>
                        ) : null}
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold">
                          JUMLAH SAMPLING<span className="text-red-600">*</span>
                        </label>
                        {data.status == 'done' ? (
                          <input
                            type="text"
                            defaultValue={data.jumlah_sampling}
                            disabled
                            name="jumlah_sampling"
                            onChange={(e) => handleChangePoint(e, index)}
                            className="text-sm font-semibold w-[90%] border-stroke border"
                          ></input>
                        ) : data.status == 'on progress' ? (
                          <input
                            type="text"
                            name="jumlah_sampling"
                            onChange={(e) => handleChangePoint(e, index)}
                            className="text-sm font-semibold w-[90%] border-stroke border"
                          ></input>
                        ) : null}
                      </div>
                      <>
                        <div className="flex flex-col ">
                          <p className="md:text-[14px] text-[9px] font-semibold">
                            Upload Foto (Optional):
                          </p>
                          <div className="">
                            <input type="file" name="" id="" className="w-60" />
                          </div>
                        </div>
                      </>
                      <>
                        <div>
                          <p className="md:text-[14px] text-[9px] font-semibold">
                            Time : {lamaPengerjaan}
                          </p>
                          {data.status == 'incoming' ? (
                            <>
                              <p className="font-bold text-[#DE0000]">
                                Task Belum Dimulai
                              </p>
                              <button
                                onClick={() => {
                                  startTaskCekPeriode(data.id);
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
                                  console.log(data);
                                  stopTaskCekPeriode(
                                    data.id,
                                    data.waktu_mulai,
                                    data.catatan,
                                    data.numerator,
                                    data.jumlah_sampling,
                                    data.inspeksi_pond_periode_defect,
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
                        </div>
                      </>
                    </div>

                    <div className="flex overflow-x-scroll max-w-full ">
                      {data?.inspeksi_pond_periode_defect?.map(
                        (data2: any, i: number) => {
                          return (
                            <div
                              className={`flex flex-col w-[120px] justify-center py-4  ${
                                (i + 1) % 2 === 0 ? ' bg-[#F3F3F3]' : 'bg-white'
                              } items-center gap-2`}
                            >
                              <label className="text-center text-[#6c6b6b] text-sm font-semibold">
                                {data2.kode}
                              </label>
                              {data.status == 'done' ? (
                                <select
                                  name="hasil"
                                  disabled
                                  defaultValue={data2.hasil}
                                  onChange={(e) =>
                                    handleChangePointDefect(e, index, i)
                                  }
                                  className={`w-[80%]  ${
                                    (i + 1) % 2 === 1
                                      ? ' bg-[#F3F3F3]'
                                      : 'bg-white'
                                  } `}
                                >
                                  <option value={''} disabled>
                                    SELECT VALUE
                                  </option>
                                  <option value={'ok'}>OK</option>
                                  <option value={'ok (toleransi)'}>
                                    OK (Toleransi)
                                  </option>
                                  <option value={'not ok'}>NOT OK</option>
                                </select>
                              ) : data.status == 'on progress' ? (
                                <select
                                  name="hasil"
                                  onChange={(e) =>
                                    handleChangePointDefect(e, index, i)
                                  }
                                  className={`w-[80%]  ${
                                    i % 2 === 1 ? ' bg-[#F3F3F3]' : 'bg-white'
                                  } `}
                                >
                                  <option value={''} disabled selected>
                                    SELECT VALUE
                                  </option>
                                  <option value={'ok'}>OK</option>
                                  <option value={'ok (toleransi)'}>
                                    OK (Toleransi)
                                  </option>
                                  <option value={'not ok'}>NOT OK</option>
                                </select>
                              ) : null}
                            </div>
                          );
                        },
                      )}

                      {data.status == 'on progress' ? (
                        <div className="flex gap-2 pl-2 items-center">
                          <button
                            onClick={() => handleClickAdd(index)}
                            className=" h-10 rounded-sm bg-blue-600 text-white text-sm font-bold justify-center items-center px-2 py-1 hover:cursor-pointer"
                          >
                            Add
                          </button>
                        </div>
                      ) : null}

                      {showDetail[index] == true && (
                        <>
                          <ModalAddPeriode
                            isOpen={showDetail[index]}
                            onClose={() => handleClickAdd(index)}
                            judul={'ADD PROBLEM CODE'}
                          >
                            <div className="flex flex-col gap-2">
                              <label className="text-black font-semibold text-sm pt-4 ">
                                Kode <span className="text-red-600">*</span>
                              </label>
                              <input
                                onChange={(e) => setKode(e.target.value)}
                                type="text"
                                className="text-sm font-semibold w-full h-10 border-stroke border"
                              ></input>
                              <label className="text-black font-semibold text-sm pt-2 ">
                                Masalah <span className="text-red-600">*</span>
                              </label>
                              <input
                                type="text"
                                onChange={(e) => setMasalah(e.target.value)}
                                className="text-sm font-semibold w-full h-10 border-stroke border mb-2"
                              ></input>
                              <button
                                onClick={() => {
                                  tambahDefectPeriode(
                                    data.id,
                                    kode,
                                    masalah,
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
                    </div>
                    <div className="flex flex-col w-full px-3 py-2">
                      {data.status == 'done' ? (
                        <>
                          <label className="text-black font-semibold text-sm ">
                            Catatan <span className="text-red-600">*</span>
                          </label>
                          <textarea
                            disabled
                            defaultValue={data.catatan}
                            name="catatan"
                            onChange={(e) => handleChangePoint(e, index)}
                            className="text-sm font-semibold w-full border-stroke border h-12"
                          ></textarea>
                        </>
                      ) : data.status == 'on progress' ? (
                        <>
                          <label className="text-black font-semibold text-sm ">
                            Catatan <span className="text-red-600">*</span>
                          </label>
                          <textarea
                            name="catatan"
                            onChange={(e) => handleChangePoint(e, index)}
                            className="text-sm font-semibold w-full border-stroke border  h-12"
                          ></textarea>
                        </>
                      ) : null}
                    </div>
                  </>
                );
              },
            )}
          </div>
          {pondMesinPeriode?.inspeksi_pond_periode[0].status != 'done' ? (
            <button
              onClick={() =>
                tambahTaskCekPeriode(
                  pondMesinPeriode?.inspeksi_pond_periode[0].id,
                )
              }
              className=" w-[16%] h-10 rounded-sm bg-blue-600 text-white text-sm font-bold justify-center items-center px-4 py-2 hover:cursor-pointer"
            >
              + Periode Check
            </button>
          ) : null}

          <div className="grid grid-cols-10 border-b-8 items-center border-[#D8EAFF] px-4 py-4 gap-3 bg-white rounded-b-xl mt-2">
            {/* <label className=" text-[#6c6b6b] text-sm font-semibold col-span-2">
                            Jumlah Periode Check :{' '}
                            {cetakMesinPeriode?.inspeksi_cetak_awal[0].jumlah_periode}
                        </label>
                        <label className=" text-[#6c6b6b] text-sm font-semibold col-span-2">
                            Waktu Check : {jumlahWaktuCheck}
                        </label> */}
            <div className="grid col-span-8">
              <label className=" text-[#6c6b6b] text-sm font-semibold">
                Catatan<span className="text-red-500">*</span> :
              </label>
              {pondMesinPeriode?.inspeksi_pond_periode[0].status != 'done' ? (
                <textarea
                  onChange={(e) => setCatatan(e.target.value)}
                  className="peer  resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                ></textarea>
              ) : (
                <textarea
                  defaultValue={
                    pondMesinPeriode?.inspeksi_pond_periode[0].catatan
                  }
                  disabled
                  className="peer  resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                ></textarea>
              )}
            </div>
            <div className="grid col-span-2 items-end justify-end">
              {pondMesinPeriode?.inspeksi_pond_periode[0].status != 'done' ? (
                <button
                  onClick={() => {
                    doneCekPeriode(
                      pondMesinPeriode?.inspeksi_pond_periode[0].id,
                    );
                    console.log(pondMesinPeriode?.inspeksi_pond_periode[0]);
                  }}
                  className=" w-full h-10 rounded-sm bg-[#00B81D] text-white text-xs font-bold justify-center items-center px-10 py-2 hover:cursor-pointer"
                >
                  SIMPAN PERIODE
                </button>
              ) : null}
              {/* ) : null} */}
            </div>
          </div>
        </main>
      )}
    </>
  );
}

export default CheckSheetPondPeriode;
