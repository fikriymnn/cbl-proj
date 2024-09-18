import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import convertTimeStampToDateOnly from '../../../../../utils/convertDateOnly';
import convertDateToTime from '../../../../../utils/converDateToTime';
import formatElapsedTime from '../../../../../utils/formatElapsedTime';
import calculateElapsedTime from '../../../../../utils/calculateElapsedTime';
import Loading from '../../../../Loading';

function CheckSheetCoatingAwal() {
  const { id } = useParams();
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [coatingMesinAwal, setCoatingMesinAwal] = useState<any>();
  const [jenisLem, setJenisLem] = useState<any>();
  const [masterKode, setMasterKode] = useState<any>();

  useEffect(() => {
    getCoatingMesinAwal();
    getMasterKode();
  }, []);

  async function getMasterKode() {
    const url = `${
      import.meta.env.VITE_API_LINK_P1
    }/api/list-kendala?criteria=true&proses=5`;

    try {
      const res = await axios.get(url);

      setMasterKode(res);

      console.log(res);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  async function getCoatingMesinAwal() {
    const url = `${import.meta.env.VITE_API_LINK}/qc/cs/inspeksiCoating/${id}`;
    try {
      const res = await axios.get(url, {
        params: {
          jenis_pengecekan: 'awal',
        },
        withCredentials: true,
      });

      setCoatingMesinAwal(res.data.data);
      console.log(res.data.data);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  async function startTaskCekAwal(id: number) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiCoatingResult/awal/start/${id}`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      getCoatingMesinAwal();
    } catch (error: any) {
      console.log(error);
      alert(error.response.data.msg);
    }
  }

  async function stopTaskCekAwal(
    id: number,
    startTime: any,
    catatan: any,
    line_clearance: any,
    permukaan: any,
    nilai_glossy: any,
    gramatur: any,
    hasil_coating: any,
    spot_uv: any,
    tes_cracking: any,
  ) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiCoatingResult/awal/stop/${id}`;
    try {
      const elapsedSeconds = calculateElapsedTime(startTime, new Date());
      console.log(elapsedSeconds);
      const res = await axios.put(
        url,
        {
          lama_pengerjaan: 360,
          catatan: catatan,
          foto: '',
          line_clearance: line_clearance,
          permukaan: permukaan,
          nilai_glossy: nilai_glossy,
          gramatur: gramatur,
          hasil_coating: hasil_coating,
          spot_uv: spot_uv,
          tes_cracking: tes_cracking,
        },
        {
          withCredentials: true,
        },
      );

      getCoatingMesinAwal();
    } catch (error: any) {
      console.log(error.response.data.msg);
      alert(error.response.data.msg);
    }
  }

  async function tambahTaskCekAwal(id: number) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiCoatingResult/awal/${id}`;
    try {
      setIsLoading(true);
      const res = await axios.post(
        url,
        {},
        {
          withCredentials: true,
        },
      );
      setIsLoading(false);
      getCoatingMesinAwal();
    } catch (error: any) {
      console.log(error.data.msg);
      alert(error.response.data.msg);
    }
  }

  async function doneCekAwal(id: number) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiCoating/awal/${id}`;
    try {
      const res = await axios.put(
        url,
        {
          masterMasalah: masterKode,
        },
        {
          withCredentials: true,
        },
      );

      getCoatingMesinAwal();
    } catch (error: any) {
      console.log(error.response.data.msg);
      alert(error.response.data.msg);
    }
  }

  async function pendingCekAwal(id: number) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiCoating/pending/${id}`;
    try {
      const res = await axios.get(
        url,

        {
          withCredentials: true,
        },
      );

      getCoatingMesinAwal();
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  const handleChangePoint = (e: any, i: number) => {
    const { name, value } = e.target;
    const onchangeVal: any = coatingMesinAwal;
    onchangeVal.inspeksi_coating_result_awal[i][name] = value;
    setCoatingMesinAwal(onchangeVal);
  };

  const tanggal = convertTimeStampToDateOnly(coatingMesinAwal?.tanggal);
  const jam = convertDateToTime(coatingMesinAwal?.tanggal);

  const jumlahWaktuCheck = formatElapsedTime(
    coatingMesinAwal?.inspeksi_coating_sub_awal[0].waktu_check,
  );

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
                  Jumlah Druk
                </label>

                <label className="text-neutral-500 text-sm font-semibold">
                  Jenis Kertas
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Jenis Gramatur
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Coating
                </label>
              </div>
              <div className="grid grid-rows-6 gap-2 col-span-2  py-4">
                <label className="text-neutral-500 text-sm font-semibold">
                  : {tanggal}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {coatingMesinAwal?.jumlah} / Mata
                </label>

                <label className="text-neutral-500 text-sm font-semibold">
                  : {coatingMesinAwal?.jenis_kertas}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {coatingMesinAwal?.jenis_gramatur}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {coatingMesinAwal?.coating}
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
                  : {coatingMesinAwal?.no_jo}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {coatingMesinAwal?.nama_produk}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {coatingMesinAwal?.customer}
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
                  : {coatingMesinAwal?.shift}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {coatingMesinAwal?.mesin}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {coatingMesinAwal?.operator}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {coatingMesinAwal?.status_jo}
                </label>
              </div>
            </div>

            {/* =============================chekcsheet========================= */}
            {coatingMesinAwal?.inspeksi_coating_result_awal.map(
              (data: any, index: number) => {
                const lamaPengerjaan = formatElapsedTime(data.lama_pengerjaan);
                return (
                  <>
                    <div className="flex flex-col py-6 px-10 border-b-8 border-[#D8EAFF]">
                      <div className=" px-3   gap-2">
                        <label className="text-neutral-500 text-sm font-semibold ">
                          PENGECEKAN AWAL {index + 1}
                        </label>
                      </div>
                      <div className="grid grid-cols-8 px-3 pt-4  gap-2">
                        <div className="flex flex-col col-span-2">
                          <label className="text-neutral-500 text-sm font-semibold ">
                            Inspektor
                          </label>
                          <label className="text-neutral-500 text-sm font-semibold ">
                            {data.inspektor?.nama}
                          </label>
                        </div>

                        <div className="flex flex-col col-span-2">
                          <div>
                            <p className="md:text-[14px] text-[9px] font-semibold">
                              Time : {lamaPengerjaan}
                            </p>
                            <>
                              {data.status == 'incoming' ? (
                                <button
                                  onClick={() => startTaskCekAwal(data.id)}
                                  className="flex w-[50%]  rounded-md bg-[#00B81D] justify-center items-center px-2 py-2 hover:cursor-pointer"
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
                              ) : null}
                            </>
                          </div>
                        </div>

                        <div className="flex flex-col col-span-2">
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
                                  className="w-60"
                                />
                              </div>
                            </div>
                          </>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-7 border-b-8 border-[#D8EAFF]">
                      <div className="grid py-4 bg-[#f3f3f3] items-center">
                        <label className="text-center text-[#6c6b6b] text-sm font-semibold">
                          LINE CLEARANCE
                        </label>
                      </div>
                      <div className="grid py-4 bg-white items-center">
                        <label className="text-center text-[#6c6b6b] text-sm font-semibold">
                          PERMUKAAN
                        </label>
                      </div>
                      <div className="grid py-4 bg-[#f3f3f3] items-center">
                        <label className="text-center text-[#6c6b6b] text-sm font-semibold">
                          NILAI GLOSSY
                        </label>
                      </div>
                      <div className="grid py-4 bg-white items-center">
                        <label className="text-center text-[#6c6b6b] text-sm font-semibold">
                          GRAMATUR
                        </label>
                      </div>
                      <div className="grid py-4 bg-[#f3f3f3] items-center">
                        <label className="text-center text-[#6c6b6b] text-sm font-semibold">
                          HASIL COATING
                        </label>
                      </div>
                      <div className="grid py-4 bg-white items-center">
                        <label className="text-center text-[#6c6b6b] text-sm font-semibold">
                          SPOT UV
                        </label>
                      </div>

                      <div className="grid py-4 bg-[#f3f3f3] items-center">
                        <label className="text-center text-[#6c6b6b] text-sm font-semibold">
                          TES CRACKING
                        </label>
                      </div>
                    </div>
                    {data.status == 'done' ? (
                      <div className="grid grid-cols-7 border-b-8 border-[#D8EAFF]">
                        <div className="grid py-4 bg-[#f3f3f3] items-center justify-center">
                          <>
                            <label className="pl-2">
                              {data.line_clearance}
                            </label>
                          </>
                        </div>

                        <div className="grid py-4 bg-white items-center justify-center">
                          <>
                            <label className="pl-2">{data.permukaan}</label>
                          </>
                        </div>
                        <div className="grid py-4 bg-[#f3f3f3] items-center justify-center">
                          <>
                            <label className="pl-2">{data.nilai_glossy}</label>
                          </>
                        </div>
                        <div className="grid py-4 bg-white items-center justify-center">
                          <>
                            <label className="pl-2">{data.gramatur}</label>
                          </>
                        </div>
                        <div className="grid py-4 bg-[#f3f3f3] items-center justify-center">
                          <>
                            <label className="pl-2">{data.hasil_coating}</label>
                          </>
                        </div>
                        <div className="grid py-4 bg-white items-center justify-center">
                          <>
                            <label className="pl-2">{data.spot_uv}</label>
                          </>
                        </div>
                        <div className="grid py-4 bg-[#f3f3f3] items-center justify-center">
                          <>
                            <label className="pl-2">{data.tes_cracking}</label>
                          </>
                        </div>
                      </div>
                    ) : data.status == 'on progress' ? (
                      <div className="grid grid-cols-7 border-b-8 border-[#D8EAFF]">
                        <div className="grid py-4 bg-[#f3f3f3] items-center justify-center">
                          <>
                            <div>
                              <input
                                type="radio"
                                id="ok11"
                                value="OK"
                                name="line_clearance"
                                onChange={(e) => handleChangePoint(e, index)}
                              />
                              <label className="pl-2">OK</label>
                            </div>
                            <div>
                              <input
                                type="radio"
                                id="ok12"
                                value="NOT OK"
                                name="line_clearance"
                                onChange={(e) => handleChangePoint(e, index)}
                              />
                              <label className="pl-2">Not OK</label>
                            </div>
                          </>
                        </div>

                        <div className="grid py-4 bg-white items-center justify-center">
                          <>
                            <div>
                              <input
                                type="radio"
                                id="ok11"
                                value="OK"
                                name="permukaan"
                                onChange={(e) => handleChangePoint(e, index)}
                              />
                              <label className="pl-2">OK</label>
                            </div>
                            <div>
                              <input
                                type="radio"
                                id="ok12"
                                value="NOT OK"
                                name="permukaan"
                                onChange={(e) => handleChangePoint(e, index)}
                              />
                              <label className="pl-2">Not OK</label>
                            </div>
                          </>
                        </div>
                        <div className="grid py-4 bg-[#f3f3f3] items-center justify-center">
                          <>
                            <div>
                              <input
                                type="radio"
                                id="ok11"
                                value="OK"
                                name="nilai_glossy"
                                onChange={(e) => handleChangePoint(e, index)}
                              />
                              <label className="pl-2">OK</label>
                            </div>
                            <div>
                              <input
                                type="radio"
                                id="ok12"
                                value="NOT OK"
                                name="nilai_glossy"
                                onChange={(e) => handleChangePoint(e, index)}
                              />
                              <label className="pl-2">Not OK</label>
                            </div>
                          </>
                        </div>
                        <div className="grid py-4 bg-white items-center justify-center">
                          <>
                            <div>
                              <input
                                type="radio"
                                id="ok11"
                                value="OK"
                                name="gramatur"
                                onChange={(e) => handleChangePoint(e, index)}
                              />
                              <label className="pl-2">OK</label>
                            </div>
                            <div>
                              <input
                                type="radio"
                                id="ok12"
                                value="NOT OK"
                                name="gramatur"
                                onChange={(e) => handleChangePoint(e, index)}
                              />
                              <label className="pl-2">Not OK</label>
                            </div>
                          </>
                        </div>
                        <div className="grid py-4 bg-[#f3f3f3] items-center justify-center">
                          <>
                            <div>
                              <input
                                type="radio"
                                id="ok11"
                                value="OK"
                                name="hasil_coating"
                                onChange={(e) => handleChangePoint(e, index)}
                              />
                              <label className="pl-2">OK</label>
                            </div>
                            <div>
                              <input
                                type="radio"
                                id="ok12"
                                value="NOT OK"
                                name="hasil_coating"
                                onChange={(e) => handleChangePoint(e, index)}
                              />
                              <label className="pl-2">Not OK</label>
                            </div>
                          </>
                        </div>
                        <div className="grid py-4 bg-white items-center justify-center">
                          <>
                            <div>
                              <input
                                type="radio"
                                id="ok11"
                                value="OK"
                                name="spot_uv"
                                onChange={(e) => handleChangePoint(e, index)}
                              />
                              <label className="pl-2">OK</label>
                            </div>
                            <div>
                              <input
                                type="radio"
                                id="ok12"
                                value="NOT OK"
                                name="spot_uv"
                                onChange={(e) => handleChangePoint(e, index)}
                              />
                              <label className="pl-2">Not OK</label>
                            </div>
                          </>
                        </div>
                        <div className="grid py-4 bg-[#f3f3f3] items-center justify-center">
                          <>
                            <div>
                              <input
                                type="radio"
                                id="ok11"
                                value="OK"
                                name="tes_cracking"
                                onChange={(e) => handleChangePoint(e, index)}
                              />
                              <label className="pl-2">OK</label>
                            </div>
                            <div>
                              <input
                                type="radio"
                                id="ok12"
                                value="NOT OK"
                                name="tes_cracking"
                                onChange={(e) => handleChangePoint(e, index)}
                              />
                              <label className="pl-2">Not OK</label>
                            </div>
                          </>
                        </div>
                      </div>
                    ) : null}
                    <div className="grid grid-cols-10 border-b-8 border-[#D8EAFF] px-4 py-4 gap-3">
                      <div className="grid col-span-8">
                        <label className=" text-[#6c6b6b] text-sm font-semibold">
                          Catatan<span className="text-red-500">*</span> :
                        </label>
                        {data.status == 'on progress' ? (
                          <textarea
                            name="catatan"
                            defaultValue={data.catatan}
                            onChange={(e) => handleChangePoint(e, index)}
                            className="peer h-full min-h-[100px] w-full resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                          ></textarea>
                        ) : data.status == 'done' ? (
                          <textarea
                            name="catatan"
                            disabled
                            defaultValue={data.catatan}
                            onChange={(e) => handleChangePoint(e, index)}
                            className="peer h-full min-h-[100px] w-full resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                          ></textarea>
                        ) : null}
                      </div>
                      <div className="grid col-span-2 items-end justify-center">
                        {data.status == 'on progress' ? (
                          <button
                            onClick={
                              () =>
                                stopTaskCekAwal(
                                  data.id,
                                  data.waktu_mulai,
                                  data.catatan,
                                  data.line_clearance,
                                  data.permukaan,
                                  data.nilai_glossy,
                                  data.gramatur,
                                  data.hasil_coating,
                                  data.spot_uv,
                                  data.tes_cracking,
                                )
                              // console.log(data)
                            }
                            className=" w-full h-10 rounded-sm bg-[#00B81D] text-white text-xs font-bold justify-center items-center px-10 py-2 hover:cursor-pointer"
                          >
                            SIMPAN PERIODE
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </>
                );
              },
            )}
          </div>
          {coatingMesinAwal?.inspeksi_coating_sub_awal[0].status ==
          'incoming' ? (
            <>
              <button
                disabled={isLoading}
                onClick={() =>
                  tambahTaskCekAwal(
                    coatingMesinAwal?.inspeksi_coating_sub_awal[0].id,
                  )
                }
                className=" w-[16%] h-10 rounded-sm bg-blue-600 text-white text-sm font-bold justify-center items-center px-4 py-2 hover:cursor-pointer"
              >
                {isLoading ? 'Loading...' : '+ Periode Check'}
              </button>
              {isLoading && <Loading />}
            </>
          ) : null}

          <div className="grid grid-cols-10 border-b-8 items-center border-[#D8EAFF] px-4 py-4 gap-3 bg-white rounded-b-xl mt-2">
            <label className=" text-[#6c6b6b] text-sm font-semibold col-span-2">
              Jumlah Periode Check :{' '}
              {
                coatingMesinAwal?.inspeksi_coating_sub_awal[0]
                  .jumlah_periode_check
              }
            </label>
            <label className=" text-[#6c6b6b] text-sm font-semibold col-span-2">
              Waktu Check : {jumlahWaktuCheck}
            </label>
            <div className="grid col-span-6 items-end justify-end">
              {coatingMesinAwal?.status == 'incoming' ? (
                <button
                  onClick={() => pendingCekAwal(coatingMesinAwal?.id)}
                  className=" w-full h-10 rounded-md bg-red-600 text-white text-xs font-bold justify-center items-center px-10 py-2 hover:cursor-pointer"
                >
                  PENDING
                </button>
              ) : null}
              {coatingMesinAwal?.inspeksi_coating_sub_awal[0].status ==
              'incoming' ? (
                <button
                  onClick={() =>
                    doneCekAwal(
                      coatingMesinAwal?.inspeksi_coating_sub_awal[0]
                        .id_inspeksi_coating,
                    )
                  }
                  className=" w-full h-10 rounded-sm bg-[#00B81D] text-white text-xs font-bold justify-center items-center px-10 py-2 hover:cursor-pointer"
                >
                  SIMPAN PERIODE
                </button>
              ) : null}
            </div>
          </div>
        </main>
      )}
    </>
  );
}

export default CheckSheetCoatingAwal;
