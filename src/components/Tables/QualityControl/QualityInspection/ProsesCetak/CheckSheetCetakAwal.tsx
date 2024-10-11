import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import convertTimeStampToDateOnly from '../../../../../utils/convertDateOnly';
import convertDateToTime from '../../../../../utils/converDateToTime';
import calculateElapsedTime from '../../../../../utils/calculateElapsedTime';
import formatElapsedTime from '../../../../../utils/formatElapsedTime';
import Loading from '../../../../Loading';
import ModalAddPeriode from '../../../../Modals/Qc/ModalAddPeriode';
import ModalKosongan from '../../../../Modals/Qc/NCR/NCRResponQC';
import formatInteger from '../../../../../utils/formaterInteger';


function CheckSheetCetakAwal() {
  const { id } = useParams();
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cetakMesinAwal, setCetakMesinAwal] = useState<any>();
  const [cetakMesinAwalHistory, setCetakMesinAwalHistory] = useState<any>();
  const [masterKodeCetak, setMasterKodeCetak] = useState<any>();
  const [masterKodeCetak2, setMasterKodeCetak2] = useState<any>();

  useEffect(() => {
    getCetakMesinAwal();
    getMasterKode();
  }, []);

  async function getMasterKode() {
    const url = `${import.meta.env.VITE_API_LINK_P1
      }/api/list-kendala?criteria=true&proses=3`;
    const url2 = `${import.meta.env.VITE_API_LINK_P1
      }/api/list-kendala?criteria=true&proses=4`;
    try {
      const res = await axios.get(url);
      const res2 = await axios.get(url);

      setMasterKodeCetak(res);
      setMasterKodeCetak2(res2);
      console.log(res);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  async function getCetakMesinAwal() {
    const url = `${import.meta.env.VITE_API_LINK}/qc/cs/inspeksiCetak/${id}`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      setCetakMesinAwal(res.data.data);
      setCetakMesinAwalHistory(res.data.history);
      console.log(res.data);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  async function startTaskCekAwal(id: number) {
    const url = `${import.meta.env.VITE_API_LINK
      }/qc/cs/inspeksiCetakAwalPoint/start/${id}`;
    try {
      const res = await axios.put(
        url,
        {},
        {
          withCredentials: true,
        },
      );

      getCetakMesinAwal();
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
    design: any,
    redaksi: any,
    barcode: any,
    jenis_bahan: any,
    gramatur: any,
    layout_pisau: any,
    acc_warna_awal_jalan: any,
  ) {
    const url = `${import.meta.env.VITE_API_LINK
      }/qc/cs/inspeksiCetakAwalPoint/stop/${id}`;
    try {
      const elapsedSeconds = calculateElapsedTime(startTime, new Date());
      console.log(elapsedSeconds);
      const res = await axios.put(
        url,
        {
          catatan: catatan,
          lama_pengerjaan: elapsedSeconds,
          line_clearance: line_clearance,
          design: design,
          redaksi: redaksi,
          barcode: barcode,
          jenis_bahan: jenis_bahan,
          gramatur: gramatur,
          layout_pisau: layout_pisau,
          acc_warna_awal_jalan: acc_warna_awal_jalan,
        },
        {
          withCredentials: true,
        },
      );

      getCetakMesinAwal();
    } catch (error: any) {
      console.log(error.response.data.msg);
      alert(error.response.data.msg);
    }
  }

  async function tambahTaskCekAwal(id: number) {
    const url = `${import.meta.env.VITE_API_LINK
      }/qc/cs/inspeksiCetakAwalPoint/create`;
    try {
      setIsLoading(true);
      const res = await axios.post(
        url,
        {
          id_inspeksi_cetak_awal: id,
        },
        {
          withCredentials: true,
        },
      );
      setIsLoading(false);
      getCetakMesinAwal();
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  async function doneCekAwal(id: number) {
    const url = `${import.meta.env.VITE_API_LINK
      }/qc/cs/inspeksiCetakAwal/done/${id}`;
    try {
      const res = await axios.put(
        url,
        {
          id_inspeksi_cetak_awal: id,
          masterKodeCetak: masterKodeCetak,
          masterKodeCetak2: masterKodeCetak2,
        },
        {
          withCredentials: true,
        },
      );

      getCetakMesinAwal();
    } catch (error: any) {
      console.log(error);
    }
  }

  async function pendingCekAwal(id: number) {
    const url = `${import.meta.env.VITE_API_LINK
      }/qc/cs/inspeksiCetakAwal/pending/${id}`;
    try {
      const res = await axios.put(
        url,
        {},
        {
          withCredentials: true,
        },
      );

      getCetakMesinAwal();
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  const handleChangePoint = (e: any, i: number) => {
    const { name, value } = e.target;
    const onchangeVal: any = cetakMesinAwal;
    onchangeVal.inspeksi_cetak_awal[0].inspeksi_cetak_awal_point[i][name] =
      value;
    setCetakMesinAwal(onchangeVal);
  };

  const tanggal = convertTimeStampToDateOnly(cetakMesinAwal?.createdAt);
  const jam = convertDateToTime(cetakMesinAwal?.createdAt);

  const tanggalHistory = convertTimeStampToDateOnly(
    cetakMesinAwalHistory?.createdAt,
  );
  const jamHistory = convertDateToTime(cetakMesinAwalHistory?.createdAt);

  const jumlahWaktuCheck = formatElapsedTime(
    cetakMesinAwal?.inspeksi_cetak_awal[0]?.waktu_check,
  );
  const isOnprogres =
    cetakMesinAwal?.inspeksi_cetak_awal[0]?.inspeksi_cetak_awal_point?.some(
      (data: { status: any }) => data?.status === 'on progress',
    );

  const [showHistory, setShowHistory] = useState(false);
  const openModalHistory = () => setShowHistory(true);
  const closeModalHistory = () => setShowHistory(false);
  return (
    <>
      {!isMobile && (
        <main className="overflow-x-hidden">
          <div className="min-w-[700px] bg-white rounded-xl">
            <div className="text-[14px] font-semibold w-full flex border-b-8 border-[#D8EAFF] py-4 px-9 md:ps-9 ps-12 justify-between">
              <div className="flex">
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
              </div>
              <div className="text-[14px] font-semibold ">
                <button
                  onClick={() => openModalHistory()}
                  className="  rounded-sm  text-sm text-blue-500 font-bold justify-center items-center px-4  hover:cursor-pointer"
                >
                  HISTORY PENGISIAN
                </button>
                {showHistory == true && (
                  <>
                    <ModalKosongan
                      isOpen={showHistory}
                      onClose={() => closeModalHistory()}
                      judul={'History Pengisian'}
                    >
                      <>
                        <div className="grid grid-cols-12  border-b-8 border-[#D8EAFF]">
                          <div className="flex flex-col gap-2 col-span-2 pl-6 py-4 ">
                            <label className="text-neutral-500 text-sm font-semibold">
                              Tanggal
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              Jumlah Druk
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              Jumlah Pcs
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              Jenis Kertas
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              Jenis Gramatur
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              Warna
                            </label>
                          </div>
                          <div className="flex flex-col gap-2 col-span-2  py-4">
                            <label className="text-neutral-500 text-sm font-semibold">
                              : {tanggalHistory}
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              :  {formatInteger(parseInt(cetakMesinAwalHistory?.jumlah_druk))}
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              : {formatInteger(parseInt(cetakMesinAwalHistory?.jumlah_pcs))}
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              : {cetakMesinAwalHistory?.jenis_kertas}
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              : {cetakMesinAwalHistory?.jenis_gramatur}
                            </label>

                            <div className="grid grid-cols-2">
                              <label className="text-neutral-500 text-sm font-semibold flex">
                                Depan
                              </label>
                              <label className="text-neutral-500 text-sm font-semibold">
                                : {cetakMesinAwalHistory?.warna_depan}
                              </label>
                            </div>
                            <div className="grid grid-cols-2">
                              <label className="text-neutral-500 text-sm font-semibold flex">
                                Belakang
                              </label>
                              <label className="text-neutral-500 text-sm font-semibold">
                                : {cetakMesinAwalHistory?.warna_belakang}
                              </label>
                            </div>
                          </div>

                          <div className="flex flex-col  gap-2 col-span-2 justify-between px-10 py-4">
                            <label className="text-neutral-500 text-sm font-semibold">
                              Jam
                            </label>

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
                          <div className="flex flex-col  gap-2 col-span-2 justify-between px-2 py-4">
                            <label className="text-neutral-500 text-sm font-semibold">
                              : {jamHistory}
                            </label>

                            <label className="text-neutral-500 text-sm font-semibold">
                              : {cetakMesinAwalHistory?.no_jo}
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              : {cetakMesinAwalHistory?.nama_produk}
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              : {cetakMesinAwalHistory?.customer}
                            </label>
                          </div>
                          <div className="flex flex-col  gap-2 col-span-2 justify-between px-10 py-4">
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
                              Status Jo
                            </label>
                          </div>
                          <div className="flex flex-col  gap-2 col-span-2 justify-between px-2 py-4">
                            <label className="text-neutral-500 text-sm font-semibold">
                              : {cetakMesinAwalHistory?.shift}
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              : {cetakMesinAwalHistory?.mesin}
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              : {cetakMesinAwalHistory?.operator}
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              : {cetakMesinAwalHistory?.status_jo}
                            </label>
                          </div>
                        </div>
                        {cetakMesinAwalHistory?.inspeksi_cetak_awal[0]?.inspeksi_cetak_awal_point?.map(
                          (data: any, index: number) => {
                            const lamaPengerjaan = formatElapsedTime(
                              data.lama_pengerjaan,
                            );
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
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="grid grid-cols-8 border-b-8 border-[#D8EAFF]">
                                  <div className="grid py-4 bg-[#f3f3f3] items-center">
                                    <label className="text-center text-[#6c6b6b] text-sm font-semibold">
                                      LINE CLEARANCE
                                    </label>
                                  </div>
                                  <div className="grid py-4 bg-white items-center">
                                    <label className="text-center text-[#6c6b6b] text-sm font-semibold">
                                      DESIGN
                                    </label>
                                  </div>
                                  <div className="grid py-4 bg-[#f3f3f3] items-center">
                                    <label className="text-center text-[#6c6b6b] text-sm font-semibold">
                                      REDAKSI
                                    </label>
                                  </div>
                                  <div className="grid py-4 bg-white items-center">
                                    <label className="text-center text-[#6c6b6b] text-sm font-semibold">
                                      BARCODE
                                    </label>
                                  </div>
                                  <div className="grid py-4 bg-[#f3f3f3] items-center">
                                    <label className="text-center text-[#6c6b6b] text-sm font-semibold">
                                      JENIS BAHAN
                                    </label>
                                  </div>
                                  <div className="grid py-4 bg-white items-center">
                                    <label className="text-center text-[#6c6b6b] text-sm font-semibold">
                                      GRAMATUR
                                    </label>
                                  </div>
                                  <div className="grid py-4 bg-[#f3f3f3] items-center">
                                    <label className="text-center text-[#6c6b6b] text-sm font-semibold">
                                      LAYOUT PISAU
                                    </label>
                                  </div>
                                  <div className="grid py-4 bg-white items-center">
                                    <label className="text-center text-[#6c6b6b] text-sm font-semibold">
                                      ACC WARNA AWAL JALAN
                                    </label>
                                  </div>
                                </div>

                                <div className="grid grid-cols-8 border-b-8 border-[#D8EAFF]">
                                  <div className="grid py-4 bg-[#f3f3f3] items-center justify-center">
                                    <>
                                      <label className="pl-2">
                                        {data.line_clearance}
                                      </label>
                                    </>
                                  </div>
                                  <div className="grid py-4 bg-white items-center justify-center">
                                    <>
                                      <label className="pl-2">
                                        {data.design}
                                      </label>
                                    </>
                                  </div>
                                  <div className="grid py-4 bg-[#f3f3f3] items-center justify-center">
                                    <>
                                      <label className="pl-2">
                                        {data.redaksi}
                                      </label>
                                    </>
                                  </div>
                                  <div className="grid py-4 bg-white items-center justify-center">
                                    <>
                                      <label className="pl-2">
                                        {data.barcode}
                                      </label>
                                    </>
                                  </div>
                                  <div className="grid py-4 bg-[#f3f3f3] items-center justify-center">
                                    <>
                                      <label className="pl-2">
                                        {data.jenis_bahan}
                                      </label>
                                    </>
                                  </div>
                                  <div className="grid py-4 bg-white items-center justify-center">
                                    <>
                                      <label className="pl-2">
                                        {data.gramatur}
                                      </label>
                                    </>
                                  </div>
                                  <div className="grid py-4 bg-[#f3f3f3] items-center justify-center">
                                    <>
                                      <label className="pl-2">
                                        {data.layout_pisau}
                                      </label>
                                    </>
                                  </div>
                                  <div className="grid py-4 bg-white items-center justify-center">
                                    <>
                                      <label className="pl-2">
                                        {data.acc_warna_awal_jalan}
                                      </label>
                                    </>
                                  </div>
                                </div>
                              </>
                            );
                          },
                        )}
                      </>
                    </ModalKosongan>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-12  border-b-8 border-[#D8EAFF]">
              <div className="grid grid-rows-6 gap-2 col-span-2 pl-6 py-4 ">
                <label className="text-neutral-500 text-sm font-semibold">
                  Tanggal
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Jumlah Druk
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Jumlah Pcs
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Jenis Kertas
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Jenis Gramatur
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Warna
                </label>
              </div>
              <div className="grid grid-rows-6 gap-2 col-span-2  py-4">
                <label className="text-neutral-500 text-sm font-semibold">
                  : {tanggal}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {formatInteger(parseInt(cetakMesinAwal?.jumlah_druk))}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {formatInteger(parseInt(cetakMesinAwal?.jumlah_pcs))}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {cetakMesinAwal?.jenis_kertas}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {cetakMesinAwal?.jenis_gramatur}
                </label>

                <div className="grid grid-cols-2">
                  <label className="text-neutral-500 text-sm font-semibold flex">
                    Depan
                  </label>
                  <label className="text-neutral-500 text-sm font-semibold">
                    : {cetakMesinAwal?.warna_depan}
                  </label>
                </div>
                <div className="grid grid-cols-2">
                  <label className="text-neutral-500 text-sm font-semibold flex">
                    Belakang
                  </label>
                  <label className="text-neutral-500 text-sm font-semibold">
                    : {cetakMesinAwal?.warna_belakang}
                  </label>
                </div>
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
                  : {cetakMesinAwal?.no_jo}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {cetakMesinAwal?.nama_produk}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {cetakMesinAwal?.customer}
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
                  : {cetakMesinAwal?.shift}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {cetakMesinAwal?.mesin}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {cetakMesinAwal?.operator}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {cetakMesinAwal?.status}
                </label>
              </div>
            </div>

            {/* =============================chekcsheet========================= */}
            {cetakMesinAwal?.inspeksi_cetak_awal[0]?.inspeksi_cetak_awal_point?.map(
              (data: any, index: number) => {
                const lamaPengerjaan = formatElapsedTime(data.lama_pengerjaan);
                const waktuMulai = convertDateToTime(data.waktu_mulai)
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
                          <label className="text-neutral-500 text-sm font-semibold ">
                            Waktu Check
                          </label>
                          <label className="text-neutral-500 text-sm font-semibold ">
                            {waktuMulai}
                          </label>
                        </div>
                        <div className="flex flex-col col-span-2">
                          <div>
                            <p className="md:text-[14px] text-[9px] font-semibold">
                              Time : {lamaPengerjaan}
                            </p>
                            <>
                              {data.status == 'incoming' &&
                                cetakMesinAwal?.status == 'incoming' ? (
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
                    <div className="grid grid-cols-8 border-b-8 border-[#D8EAFF]">
                      <div className="grid py-4 bg-[#f3f3f3] items-center">
                        <label className="text-center text-[#6c6b6b] text-sm font-semibold">
                          LINE CLEARANCE
                        </label>
                      </div>
                      <div className="grid py-4 bg-white items-center">
                        <label className="text-center text-[#6c6b6b] text-sm font-semibold">
                          DESIGN
                        </label>
                      </div>
                      <div className="grid py-4 bg-[#f3f3f3] items-center">
                        <label className="text-center text-[#6c6b6b] text-sm font-semibold">
                          REDAKSI
                        </label>
                      </div>
                      <div className="grid py-4 bg-white items-center">
                        <label className="text-center text-[#6c6b6b] text-sm font-semibold">
                          BARCODE
                        </label>
                      </div>
                      <div className="grid py-4 bg-[#f3f3f3] items-center">
                        <label className="text-center text-[#6c6b6b] text-sm font-semibold">
                          JENIS BAHAN
                        </label>
                      </div>
                      <div className="grid py-4 bg-white items-center">
                        <label className="text-center text-[#6c6b6b] text-sm font-semibold">
                          GRAMATUR
                        </label>
                      </div>
                      <div className="grid py-4 bg-[#f3f3f3] items-center">
                        <label className="text-center text-[#6c6b6b] text-sm font-semibold">
                          LAYOUT PISAU
                        </label>
                      </div>
                      <div className="grid py-4 bg-white items-center">
                        <label className="text-center text-[#6c6b6b] text-sm font-semibold">
                          ACC WARNA AWAL JALAN
                        </label>
                      </div>
                    </div>
                    {data.status == 'done' ? (
                      <div className="grid grid-cols-8 border-b-8 border-[#D8EAFF]">
                        <div className="grid py-4 bg-[#f3f3f3] items-center justify-center">
                          <>
                            <label className="pl-2">
                              {data.line_clearance}
                            </label>
                          </>
                        </div>
                        <div className="grid py-4 bg-white items-center justify-center">
                          <>
                            <label className="pl-2">{data.design}</label>
                          </>
                        </div>
                        <div className="grid py-4 bg-[#f3f3f3] items-center justify-center">
                          <>
                            <label className="pl-2">{data.redaksi}</label>
                          </>
                        </div>
                        <div className="grid py-4 bg-white items-center justify-center">
                          <>
                            <label className="pl-2">{data.barcode}</label>
                          </>
                        </div>
                        <div className="grid py-4 bg-[#f3f3f3] items-center justify-center">
                          <>
                            <label className="pl-2">{data.jenis_bahan}</label>
                          </>
                        </div>
                        <div className="grid py-4 bg-white items-center justify-center">
                          <>
                            <label className="pl-2">{data.gramatur}</label>
                          </>
                        </div>
                        <div className="grid py-4 bg-[#f3f3f3] items-center justify-center">
                          <>
                            <label className="pl-2">{data.layout_pisau}</label>
                          </>
                        </div>
                        <div className="grid py-4 bg-white items-center justify-center">
                          <>
                            <label className="pl-2">
                              {data.acc_warna_awal_jalan}
                            </label>
                          </>
                        </div>
                      </div>
                    ) : data.status == 'on progress' &&
                      cetakMesinAwal?.status == 'incoming' ? (
                      <div className="grid grid-cols-8 border-b-8 border-[#D8EAFF]">
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
                                name="design"
                                onChange={(e) => handleChangePoint(e, index)}
                              />
                              <label className="pl-2">OK</label>
                            </div>
                            <div>
                              <input
                                type="radio"
                                id="ok12"
                                value="NOT OK"
                                name="design"
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
                                name="redaksi"
                                onChange={(e) => handleChangePoint(e, index)}
                              />
                              <label className="pl-2">OK</label>
                            </div>
                            <div>
                              <input
                                type="radio"
                                id="ok12"
                                value="NOT OK"
                                name="redaksi"
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
                                name="barcode"
                                onChange={(e) => handleChangePoint(e, index)}
                              />
                              <label className="pl-2">OK</label>
                            </div>
                            <div>
                              <input
                                type="radio"
                                id="ok12"
                                value="NOT OK"
                                name="barcode"
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
                                name="jenis_bahan"
                                onChange={(e) => handleChangePoint(e, index)}
                              />
                              <label className="pl-2">OK</label>
                            </div>
                            <div>
                              <input
                                type="radio"
                                id="ok12"
                                value="NOT OK"
                                name="jenis_bahan"
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
                                name="layout_pisau"
                                onChange={(e) => handleChangePoint(e, index)}
                              />
                              <label className="pl-2">OK</label>
                            </div>
                            <div>
                              <input
                                type="radio"
                                id="ok12"
                                value="NOT OK"
                                name="layout_pisau"
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
                                name="acc_warna_awal_jalan"
                                onChange={(e) => handleChangePoint(e, index)}
                              />
                              <label className="pl-2">OK</label>
                            </div>
                            <div>
                              <input
                                type="radio"
                                id="ok12"
                                value="NOT OK"
                                name="acc_warna_awal_jalan"
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
                        {data.status == 'on progress' &&
                          cetakMesinAwal?.status == 'incoming' ? (
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
                        {data.status == 'on progress' &&
                          cetakMesinAwal?.status == 'incoming' ? (
                          <button
                            onClick={() =>
                              stopTaskCekAwal(
                                data.id,
                                data.waktu_mulai,
                                data.catatan,
                                data.line_clearance,
                                data.design,
                                data.redaksi,
                                data.barcode,
                                data.jenis_bahan,
                                data.gramatur,
                                data.layout_pisau,
                                data.acc_warna_awal_jalan,
                              )
                            }
                            className=" w-full h-10 rounded-sm bg-[#00B81D] text-white text-xs font-bold justify-center items-center px-10 py-2 hover:cursor-pointer"
                          >
                            SIMPAN AWAL JALAN
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </>
                );
              },
            )}
          </div>
          {(!isOnprogres &&
            cetakMesinAwal?.status == 'incoming' &&
            cetakMesinAwal?.inspeksi_cetak_awal[0]?.status == 'incoming') ||
            (cetakMesinAwal?.inspeksi_cetak_awal[0]?.status == 'pending' &&
              cetakMesinAwal?.status == 'incoming') ? (
            <>
              <button
                disabled={isLoading}
                onClick={() =>
                  tambahTaskCekAwal(cetakMesinAwal?.inspeksi_cetak_awal[0]?.id)
                }
                className=" w-[16%] h-10 rounded-sm bg-blue-600 text-white text-sm font-bold justify-center items-center px-4 py-2 hover:cursor-pointer"
              >
                {isLoading ? 'Loading...' : '+ Awal Jalan'}
              </button>
              {isLoading && <Loading />}
            </>
          ) : null}

          <div className="grid grid-cols-10 border-b-8 items-center border-[#D8EAFF] px-4 py-4 gap-3 bg-white rounded-b-xl mt-2">
            <label className=" text-[#6c6b6b] text-sm font-semibold col-span-2">
              Jumlah Periode Check :{' '}
              {cetakMesinAwal?.inspeksi_cetak_awal[0]?.jumlah_periode}
            </label>
            <label className=" text-[#6c6b6b] text-sm font-semibold col-span-2">
              Waktu Check : {jumlahWaktuCheck}
            </label>
            <div className="grid col-span-6 items-end justify-end gap-2">
              {!isOnprogres &&
                cetakMesinAwal?.inspeksi_cetak_awal[0]?.status == 'incoming' &&
                cetakMesinAwal?.status == 'incoming' ? (
                <button
                  onClick={() =>
                    pendingCekAwal(cetakMesinAwal?.inspeksi_cetak_awal[0]?.id)
                  }
                  className=" w-full h-10 rounded-md bg-red-600 text-white text-xs font-bold justify-center items-center px-10 py-2 hover:cursor-pointer"
                >
                  PENDING
                </button>
              ) : null}
              {(!isOnprogres &&
                cetakMesinAwal?.status == 'incoming' &&
                cetakMesinAwal?.inspeksi_cetak_awal[0]?.status == 'incoming') ||
                cetakMesinAwal?.inspeksi_cetak_awal[0]?.status == 'pending' ? (
                <button
                  onClick={() =>
                    doneCekAwal(cetakMesinAwal?.inspeksi_cetak_awal[0]?.id)
                  }
                  className=" w-full h-10 rounded-md bg-[#00B81D] text-white text-xs font-bold justify-center items-center px-10 py-2 hover:cursor-pointer"
                >
                  CHECKSHEET SELESAI
                </button>
              ) : null}
            </div>
          </div>
        </main>
      )}
    </>
  );
}

export default CheckSheetCetakAwal;
