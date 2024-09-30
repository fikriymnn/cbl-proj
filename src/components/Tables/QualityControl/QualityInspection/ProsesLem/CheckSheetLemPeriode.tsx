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
import Loading from '../../../../Loading';
import ModalKosongan from '../../../../Modals/Qc/NCR/NCRResponQC';
import formatInteger from '../../../../../utils/formaterInteger';

function CheckSheetLemPeriode() {
  const { id } = useParams();
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [LemMesinPeriode, setLemMesinPeriode] = useState<any>();
  const [lemMesinPeriodeDefect, setLemMesinPeriodeDefect] = useState<any>();
  const [catatan, setCatatan] = useState<any>();
  const [kode, setKode] = useState<any>();
  const [masalah, setMasalah] = useState<any>();
  const [kriteria, setKriteria] = useState<any>();
  const [persenKriteria, setPersenKriteria] = useState<any>();
  const [sumberMasalah, setSumberMasalah] = useState<any>();
  const [jenisLem, setJenisLem] = useState<any>();
  const [openGuide, setOpenGuide] = useState(null);
  const [LemMesinPeriodeHistory, setLemMesinPeriodeHistory] = useState<any>();
  const [DataDepartment, setDataDepartment] = useState<any>();

  const [Department, setDepartment] = useState([
    {
      id: 0,
      department: '',
    },
  ]);
  const [masterKode, setMasterKode] = useState<any>();
  const handleClickGuide = (index: any) => {
    setOpenGuide((prevState: any) => {
      return prevState === index ? null : index;
    });
  };
  const [add, setAdd] = useState<any>();
  const [showDetail, setShowDetail] = useState<boolean[]>(
    new Array(add != null && add.length).fill(false),
  );
  const [showNotOk, setShowNotOk] = useState<boolean[]>(
    new Array(add != null && add.length).fill(false),
  );
  const handleClickAdd = (index: number) => {
    setShowDetail((prevState) => {
      const updatedShowDetail = [...prevState]; // Create a copy
      updatedShowDetail[index] = !updatedShowDetail[index]; // Toggle value
      return updatedShowDetail;
    });
  };

  const handleClickNotOke = (index: number, isi: boolean) => {
    setShowNotOk((prevState) => {
      const updatedShowDetail = [...prevState]; // Create a copy
      updatedShowDetail[index] = isi; // Toggle value
      return updatedShowDetail;
    });
  };
  useEffect(() => {
    getLemMesinPeriode();
    getDepartment();
    getMasterKode();
  }, []);

  async function getMasterKode() {
    const url = `${import.meta.env.VITE_API_LINK_P1
      }/api/list-kendala?criteria=true&proses=11`;

    try {
      setIsLoading(true);
      const res = await axios.get(url);
      setIsLoading(false);
      setMasterKode(res);

      console.log(res);
    } catch (error: any) {
      setIsLoading(false);
      alert('Gagal Memannggil Defect, Coba Refresh Halaman!')
      console.log(error.data.msg);
    }
  }

  async function getDepartment() {
    const url = `${import.meta.env.VITE_API_LINK_P1}/api/list-departmen`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {});
      setIsLoading(false);
      console.log(res.data);
      setDataDepartment(res.data);
    } catch (error: any) {
      setIsLoading(false);
      alert('Gagal Memannggil Department, Coba Refresh Halaman!')
      console.log(error);
    }
  }

  async function getLemMesinPeriode() {
    const url = `${import.meta.env.VITE_API_LINK}/qc/cs/inspeksiLem/${id}`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        withCredentials: true,
      });
      setIsLoading(false);
      setLemMesinPeriode(res.data.data);
      setLemMesinPeriodeDefect(res.data.defect);
      setLemMesinPeriodeHistory(res.data.history);
      console.log(res.data);
    } catch (error: any) {
      setIsLoading(false);
      alert('Gagal Memannggil Data, Coba Refresh Halaman!')
      console.log(error.data.msg);
    }
  }
  async function pendingCekPeriode(id: number) {
    const url = `${import.meta.env.VITE_API_LINK
      }/qc/cs/inspeksiLemPeriode/pending/${id}`;
    try {
      const res = await axios.put(
        url,
        {},
        {
          withCredentials: true,
        },
      );

      getLemMesinPeriode();
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }
  async function startTaskCekPeriode(id: number) {
    const url = `${import.meta.env.VITE_API_LINK
      }/qc/cs/inspeksiLemPeriodePoint/start/${id}`;
    try {
      const res = await axios.put(
        url,
        {},
        {
          withCredentials: true,
        },
      );

      getLemMesinPeriode();
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
    const url = `${import.meta.env.VITE_API_LINK
      }/qc/cs/inspeksiLemPeriodePoint/stop/${id}`;
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

      getLemMesinPeriode();
    } catch (error: any) {
      console.log(error);
    }
  }

  async function tambahTaskCekPeriode(id: number) {
    const url = `${import.meta.env.VITE_API_LINK
      }/qc/cs/inspeksiLemPeriodePoint/create`;
    try {
      setIsLoading(true);
      const res = await axios.post(
        url,
        {
          id_inspeksi_lem_periode: id,
          masterKodeLem: masterKode,
        },
        {
          withCredentials: true,
        },
      );
      setIsLoading(false);
      getLemMesinPeriode();
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  async function tambahDefectPeriode(
    id: number,
    idLem: any,
    kode: any,
    masalah: any,
    kriteria: any,
    persenKriteria: any,
    sumberMasalah: any,
    index: number,
  ) {
    const url = `${import.meta.env.VITE_API_LINK
      }/qc/cs/inspeksiLemPeriodePoint/createDefect`;
    try {
      const res = await axios.post(
        url,

        {
          id_inspeksi_lem_periode_point: id,
          id_inspeksi_lem: idLem,
          kode: kode,
          masalah: masalah,
          kriteria: kriteria,
          persen_kriteria: persenKriteria,
          sumber_masalah: sumberMasalah,
          department: Department,
        },

        {
          withCredentials: true,
        },
      );

      setShowModal2(false);
      handleClickAdd(index);
      setKode(null);
      setMasalah(null);
      setKriteria(null);
      setPersenKriteria(null);
      setSumberMasalah(null);
      setDepartment([
        {
          id: 0,
          department: '',
        },
      ]);
      getLemMesinPeriode();
    } catch (error: any) {
      console.log(error);
    }
  }

  async function doneCekPeriode(id: number) {
    const url = `${import.meta.env.VITE_API_LINK
      }/qc/cs/inspeksiLemPeriode/done/${id}`;
    try {
      const res = await axios.put(
        url,
        { catatan: catatan },
        {
          withCredentials: true,
        },
      );

      getLemMesinPeriode();
    } catch (error: any) {
      console.log(error);
    }
  }
  //add Point
  const handleAddPointDepartment = () => {
    setDepartment([
      ...Department,
      {
        id: 0,
        department: '',
      },
    ]);
  };

  //change value point
  const handleChangePointDepatment = (e: any, i: number) => {
    const { name, value } = e.target;
    const filteredData = DataDepartment.find(
      (item: any) => item.id == value,
      // item.id.includes(parseInt(value));
    );

    const onchangeVal: any = [...Department];
    onchangeVal[i]['id'] = filteredData.id;
    onchangeVal[i]['department'] = filteredData.name;
    setDepartment(onchangeVal);
  };

  const handleDeletePointDepartment = (i: number) => {
    const deleteVal: any = [...Department];
    deleteVal.splice(i, 1);
    setDepartment(deleteVal);
  };

  const handleChangePoint = (e: any, i: number) => {
    const { name, value } = e.target;
    const onchangeVal: any = LemMesinPeriode;
    onchangeVal.inspeksi_lem_periode[0].inspeksi_lem_periode_point[i][name] =
      value;
    setLemMesinPeriode(onchangeVal);
  };

  const handleChangePointDefect = (e: any, i: number, ii: number) => {
    const { name, value } = e.target;
    const onchangeVal: any = LemMesinPeriode;
    onchangeVal.inspeksi_lem_periode[0].inspeksi_lem_periode_point[
      i
    ].inspeksi_lem_periode_defect[ii]['hasil'] = value;
    setLemMesinPeriode(onchangeVal);
  };
  const handleChangePointHasil = (e: any, i: number, ii: number) => {
    const { name, value } = e.target;
    const onchangeVal: any = LemMesinPeriode;
    onchangeVal.inspeksi_lem_periode[0].inspeksi_lem_periode_point[
      i
    ].inspeksi_lem_periode_defect[ii][name] = value;
    setLemMesinPeriode(onchangeVal);
  };
  const tanggal = convertTimeStampToDateOnly(LemMesinPeriode?.tanggal);
  const jam = convertDateToTime(LemMesinPeriode?.tanggal);

  const tanggalHistory = convertTimeStampToDateOnly(
    LemMesinPeriodeHistory?.tanggal,
  );
  const jamHistory = convertDateToTime(LemMesinPeriodeHistory?.tanggal);

  const jumlahWaktuCheck = formatElapsedTime(
    LemMesinPeriode?.inspeksi_lem_awal[0].waktu_check,
  );

  const [filling, setFilling] = useState(false);

  const [showModal2, setShowModal2] = useState(false);
  const openModal2 = () => setShowModal2(true);
  const closeModal2 = () => setShowModal2(false);

  const isOnprogres =
    LemMesinPeriode?.inspeksi_lem_periode[0].inspeksi_lem_periode_point.some(
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
                Lem Checksheet
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
                          <div className="grid grid-rows-6 gap-2 col-span-2 pl-6 py-4 ">
                            <label className="text-neutral-500 text-sm font-semibold">
                              Tanggal
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              Jumlah
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              Jumlah Pcs
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              Jenis Lem
                            </label>
                          </div>
                          <div className="grid grid-rows-6 gap-2 col-span-2  py-4">
                            <label className="text-neutral-500 text-sm font-semibold">
                              : {tanggalHistory}
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              : {LemMesinPeriodeHistory?.jumlah}
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              : {formatInteger(parseInt(LemMesinPeriodeHistory?.jumlah_pcs))}
                            </label>

                            <div className="flex gap-1 font-semibold">
                              :{' '}
                              <input
                                type="text"
                                disabled
                                defaultValue={LemMesinPeriodeHistory?.jenis_lem}
                                onChange={(e) => setJenisLem(e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="grid grid-rows-6  gap-2 col-span-2 justify-between px-10 py-4">
                            <label className="text-neutral-500 text-sm font-semibold">
                              Jam
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
                          <div className="grid grid-rows-6  gap-2 col-span-2 justify-between px-2 py-4">
                            <label className="text-neutral-500 text-sm font-semibold">
                              : {jamHistory}
                            </label>

                            <label className="text-neutral-500 text-sm font-semibold">
                              : {LemMesinPeriodeHistory?.no_jo}
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              : {LemMesinPeriodeHistory?.no_io}
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              : {LemMesinPeriodeHistory?.nama_produk}
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              : {LemMesinPeriodeHistory?.customer}
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
                              : {LemMesinPeriodeHistory?.shift}
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              : {LemMesinPeriodeHistory?.mesin}
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              : {LemMesinPeriodeHistory?.operator}
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              : {LemMesinPeriodeHistory?.status}
                            </label>
                          </div>
                        </div>

                        {LemMesinPeriodeHistory?.inspeksi_lem_periode[0]?.inspeksi_lem_periode_point?.map(
                          (data: any, index: number) => {
                            const waktuSampling = convertDateToTime(
                              data.waktu_mulai,
                            );
                            const lamaPengerjaan = formatElapsedTime(
                              data.lama_pengerjaan,
                            );
                            return (
                              <>
                                <div className="border-b-8 border-[#D8EAFF]">
                                  <div className="flex px-5 py-5 gap-7">
                                    <label className="text-sm font-semibold">
                                      {index + 1}
                                    </label>
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
                                        NUMERATOR
                                        <span className="text-red-600">*</span>
                                      </label>

                                      <input
                                        type="text"
                                        disabled
                                        defaultValue={data.numerator}
                                        name="numerator"
                                        className="text-sm font-semibold w-[90%] border-stroke border"
                                      ></input>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                      <label className="text-sm font-semibold">
                                        JUMLAH SAMPLING
                                        <span className="text-red-600">*</span>
                                      </label>

                                      <input
                                        type="text"
                                        defaultValue={data.jumlah_sampling}
                                        disabled
                                        name="jumlah_sampling"
                                        className="text-sm font-semibold w-[90%] border-stroke border"
                                      ></input>
                                    </div>

                                    <>
                                      <div>
                                        <p className="md:text-[14px] text-[9px] font-semibold">
                                          Lama Pengerjaan :
                                        </p>
                                        {lamaPengerjaan}
                                      </div>
                                    </>
                                  </div>
                                  <div className="flex overflow-x-scroll max-w-screen border-b-8 border-[#D8EAFF]">
                                    {data.inspeksi_lem_periode_defect?.map(
                                      (data2: any, i: number) => {
                                        return (
                                          <div
                                            className={`flex flex-col min-w-[120px] justify-center py-4 ${(i + 1) % 2 === 0
                                              ? ' bg-[#F3F3F3]'
                                              : 'bg-white'
                                              } items-center gap-2`}
                                          >
                                            <label className="text-center text-[#6c6b6b] text-sm font-semibold">
                                              {data2.kode}
                                            </label>

                                            <label className="text-center text-[#6c6b6b] text-sm font-semibold">
                                              {data2.hasil}
                                            </label>

                                            <label className="text-center text-[#6c6b6b] text-sm font-semibold">
                                              {data2.jumlah_defect}
                                            </label>
                                          </div>
                                        );
                                      },
                                    )}
                                  </div>

                                  <div></div>
                                </div>
                              </>
                            );
                          },
                        )}
                        <div className="flex w-full min-w-[700px]  items-center  px-4 py-4 gap-5 bg-white  mt-2">
                          {lemMesinPeriodeDefect?.map(
                            (data: any, index: number) => {
                              return (
                                <div className="flex flex-col max-w-45 overflow-x-scroll">
                                  <label>Kode: </label>
                                  <label>{data.kode}</label>
                                  <label>Total Defect: </label>
                                  <label>{data.total_defect}</label>
                                </div>
                              );
                            },
                          )}
                        </div>
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
                  Jumlah
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Jumlah Pcs
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Jenis Lem
                </label>
              </div>
              <div className="grid grid-rows-6 gap-2 col-span-2  py-4">
                <label className="text-neutral-500 text-sm font-semibold">
                  : {tanggal}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {LemMesinPeriode?.jumlah}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {formatInteger(parseInt(LemMesinPeriode?.jumlah_pcs))}
                </label>

                {LemMesinPeriode?.jenis_lem == null ? (
                  <div className="flex md:gap-1 font-semibold">
                    :{' '}
                    <input
                      className="border rounded p-1"
                      type="text"
                      onChange={(e) => setJenisLem(e.target.value)}
                    />
                  </div>
                ) : (
                  <div className="flex gap-1 font-semibold">
                    :{' '}
                    <input
                      type="text"
                      disabled
                      defaultValue={LemMesinPeriode?.jenis_lem}
                      onChange={(e) => setJenisLem(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-rows-6  gap-2 col-span-2 justify-between px-10 py-4">
                <label className="text-neutral-500 text-sm font-semibold">
                  Jam
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
              <div className="grid grid-rows-6  gap-2 col-span-2 justify-between px-2 py-4">
                <label className="text-neutral-500 text-sm font-semibold">
                  : {jam}
                </label>

                <label className="text-neutral-500 text-sm font-semibold">
                  : {LemMesinPeriode?.no_jo}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {LemMesinPeriode?.no_io}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {LemMesinPeriode?.nama_produk}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {LemMesinPeriode?.customer}
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
                  : {LemMesinPeriode?.shift}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {LemMesinPeriode?.mesin}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {LemMesinPeriode?.operator}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {LemMesinPeriode?.status}
                </label>
              </div>
            </div>

            {/* =============================chekcsheet========================= */}

            <>
              <div className="flex flex-col py-6 px-10 border-b-8 border-[#D8EAFF]">
                <div className=" px-3   gap-2 flex w-full justify-between">
                  <label className="text-neutral-500 text-sm font-semibold ">
                    CEK PERIODE
                  </label>
                </div>
              </div>
            </>
            <div className="">
              {LemMesinPeriode?.inspeksi_lem_periode[0]?.inspeksi_lem_periode_point?.map(
                (data: any, index: number) => {
                  const waktuSampling = convertDateToTime(data.waktu_mulai);
                  const lamaPengerjaan = formatElapsedTime(
                    data.lama_pengerjaan,
                  );
                  return (
                    <>
                      <label
                        className="text-blue-400 text-sm font-semibold mx-5 pt-4 flex justify-end"
                        onClick={() => handleClickGuide(index)}
                      >
                        FILLING GUIDE
                      </label>
                      {openGuide == index ? (
                        <div className="  rounded-md bg-[#F3F3F3] border-gray flex px-5 mx-5 py-6 justify-between">
                          <div className="grid grid-cols-2">
                            <div className="flex flex-col">
                              <label className="text-blue-600 text-sm font-semibold pb-6">
                                KODE-MASALAH
                              </label>
                              {data.inspeksi_lem_periode_defect.map(
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
                                <img src={ok} alt="" className="w-5"></img>OK
                              </label>
                              <label className="text-black text-sm font-semibold flex gap-2">
                                <img src={oktole} alt="" className="w-5"></img>
                                OK (Toleransi)
                              </label>
                              <label className="text-black text-sm font-semibold flex gap-2">
                                <img src={notok} alt="" className="w-5"></img>
                                NOT OK
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
                      <div className="flex min-w-screen justify-between px-2 py-4">
                        <label className="text-sm font-semibold">
                          {index + 1}
                        </label>
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
                              defaultValue={formatInteger(parseInt(data.numerator))}
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
                            JUMLAH SAMPLING
                            <span className="text-red-600">*</span>
                          </label>
                          {data.status == 'done' ? (
                            <input
                              type="text"
                              defaultValue={formatInteger(parseInt(data.jumlah_sampling))}
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
                              <input
                                type="file"
                                name=""
                                id=""
                                className="w-60"
                              />
                            </div>
                          </div>
                        </>
                        <>
                          <div>
                            <p className="md:text-[14px] text-[9px] font-semibold">
                              Time : {lamaPengerjaan}
                            </p>
                            {data.status == 'incoming' &&
                              LemMesinPeriode?.status == 'incoming' ? (
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
                                      data.inspeksi_lem_periode_defect,
                                    );
                                    setShowNotOk(
                                      new Array(add != null && add.length).fill(
                                        false,
                                      ),
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

                      <div className="flex overflow-x-scroll max-w-screen border-b-8 border-[#D8EAFF] gap-1 rounded-sm">
                        {data.inspeksi_lem_periode_defect?.map(
                          (data2: any, i: number) => {
                            return (
                              <div
                                className={`flex flex-col min-w-[200px] justify-center py-4 
                                  } items-center gap-2 
                                 ${data2.hasil == 'ok' ? 'bg-blue-300' :
                                    data2.hasil == 'ok (toleransi)' ? 'bg-yellow-300' :
                                      data2.hasil == 'not ok' ? 'bg-red-300' :

                                        'bg-white'}`}
                              >
                                <label className="text-center text-[#6c6b6b] text-sm font-semibold">
                                  {data2.kode}
                                </label>
                                {data.status == 'done' ? (
                                  <div

                                    className={`w-[80%] text-center uppercase font-semibold flex gap-4  
                                 } `}
                                  >
                                    {data2.hasil == 'ok' ? (
                                      <>
                                        <img src={ok} alt="" className="w-4" />
                                      </>
                                    ) : data2.hasil == 'ok (toleransi)' ? (
                                      <>
                                        <img src={oktole} alt="" className="w-4" />
                                      </>
                                    ) : data2.hasil == 'not ok' ? (
                                      <>
                                        <img src={notok} alt="" className="w-4" />
                                      </>
                                    ) :
                                      <>
                                        -
                                      </>
                                    }

                                    {data2.hasil}
                                  </div>
                                ) : data.status == 'on progress' ? (
                                  <div className="flex flex-col  w-full px-2 py-2">
                                    <div className={`flex flex-col w-full`}>
                                      <div className="flex gap-1 w-full">
                                        <input
                                          onChange={(e) => {
                                            handleChangePointDefect(e, index, i);

                                            if (e.target.value == 'not ok') {
                                              handleClickNotOke(i, true);

                                            } else {
                                              handleClickNotOke(i, false);
                                            }

                                          }}
                                          className={`  ${(i + 1) % 2 === 0
                                            ? ' bg-[#F3F3F3]'
                                            : 'bg-white'
                                            } `}
                                          type="radio"
                                          id="ok11"
                                          value="ok"
                                          name={`hasil ${i}`}
                                        />
                                        <img src={ok} alt="" className="w-4" />
                                        <label className="">OK</label>
                                      </div>
                                      <div className="flex gap-1 w-full">
                                        <input
                                          onChange={(e) => {
                                            handleChangePointDefect(e, index, i);
                                            if (e.target.value == 'not ok') {
                                              handleClickNotOke(i, true);
                                            } else {
                                              handleClickNotOke(i, false);
                                            }
                                          }}
                                          className={`  ${(i + 1) % 2 === 0
                                            ? ' bg-[#F3F3F3]'
                                            : 'bg-white'
                                            } `}
                                          type="radio"
                                          id="ok12"
                                          value="ok (toleransi)"
                                          name={`hasil ${i}`}
                                        />
                                        <img src={oktole} alt="" className="w-4" />
                                        <label className="">OK (Toleransi)</label>
                                      </div>
                                      <div className="flex gap-1 w-full">
                                        <input
                                          onChange={(e) => {
                                            handleChangePointDefect(e, index, i);
                                            if (e.target.value == 'not ok') {
                                              handleClickNotOke(i, true);
                                            } else {
                                              handleClickNotOke(i, false);
                                            }
                                          }}
                                          className={`  ${(i + 1) % 2 === 0
                                            ? ' bg-[#F3F3F3]'
                                            : 'bg-white'
                                            } `}
                                          type="radio"
                                          id="ok12"
                                          value="not ok"
                                          name={`hasil ${i}`}
                                        />
                                        <img src={notok} alt="" className="w-4" />
                                        <label className="">Not OK</label>
                                      </div>
                                      <div className="flex gap-1 w-full">
                                        <input
                                          onChange={(e) => {
                                            handleChangePointDefect(e, index, i);
                                            if (e.target.value == 'not ok') {
                                              handleClickNotOke(i, true);
                                            } else {
                                              handleClickNotOke(i, false);
                                            }
                                          }}
                                          className={`  ${(i + 1) % 2 === 0
                                            ? ' bg-[#F3F3F3]'
                                            : 'bg-white'
                                            } `}
                                          type="radio"
                                          id="ok12"
                                          value="-"
                                          name={`hasil ${i}`}
                                        />
                                        <label className="">-</label>
                                      </div>
                                    </div>
                                  </div>
                                ) : null}
                                {showNotOk[i] == true &&
                                  data.status == 'on progress' ? (
                                  <input
                                    type="text"
                                    name="jumlah_defect"
                                    onChange={(e) =>
                                      handleChangePointHasil(e, index, i)
                                    }
                                    className="text-sm font-semibold w-[90%] border-stroke border"
                                  ></input>
                                ) : data.status == 'done' &&
                                  data2.hasil == 'not ok' ? (
                                  <input
                                    type="text"
                                    name="jumlah_defect"
                                    defaultValue={formatInteger(parseInt(data2.jumlah_defect))}
                                    disabled
                                    onChange={(e) =>
                                      handleChangePointHasil(e, index, i)
                                    }
                                    className="text-sm font-semibold w-[90%] border-stroke border"
                                  ></input>
                                ) : null}
                              </div>
                            );
                          },
                        )}

                        {/* <div className="flex flex-col w-[120px] justify-center py-4 bg-[#f3f3f3] items-center gap-2">
                        <label className="text-center text-[#6c6b6b] text-sm font-semibold">
                          C1.2
                        </label>
                        <select className="w-[80%] bg-[#f3f3f3]">
                          <option></option>
                        </select>
                      </div> */}
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
                                  Masalah{' '}
                                  <span className="text-red-600">*</span>
                                </label>
                                <input
                                  type="text"
                                  onChange={(e) => setMasalah(e.target.value)}
                                  className="text-sm font-semibold w-full h-10 border-stroke border mb-2"
                                ></input>
                                <label className="text-black text-sm font-bold pt-4">
                                  Kriteria
                                </label>
                                <select
                                  onChange={(e) => {
                                    setKriteria(e.target.value);
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
                                    Pilih kriteria
                                  </option>

                                  <option
                                    value="critical"
                                    className="text-body dark:text-bodydark"
                                  >
                                    Critical
                                  </option>
                                  <option
                                    value="major"
                                    className="text-body dark:text-bodydark"
                                  >
                                    Major
                                  </option>
                                  <option
                                    value="minor"
                                    className="text-body dark:text-bodydark"
                                  >
                                    Minor
                                  </option>
                                </select>
                                <label className="text-black text-sm font-bold pt-4">
                                  % Kriteria
                                </label>
                                <input
                                  onChange={(e) =>
                                    setPersenKriteria(e.target.value)
                                  }
                                  type="text"
                                  className="w-full h-7 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                                />
                                <label className="text-black text-sm font-bold pt-4">
                                  Sumber Masalah
                                </label>
                                <select
                                  onChange={(e) => {
                                    setSumberMasalah(e.target.value);
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

                                  <option
                                    value="Mesin"
                                    className="text-body dark:text-bodydark"
                                  >
                                    Mesin
                                  </option>
                                  <option
                                    value="Man"
                                    className="text-body dark:text-bodydark"
                                  >
                                    Man
                                  </option>
                                  <option
                                    value="Material"
                                    className="text-body dark:text-bodydark"
                                  >
                                    Material
                                  </option>
                                  <option
                                    value="Persiapan"
                                    className="text-body dark:text-bodydark"
                                  >
                                    Persiapan
                                  </option>
                                  <option
                                    value="Design"
                                    className="text-body dark:text-bodydark"
                                  >
                                    Design
                                  </option>
                                </select>

                                <label className="text-black text-sm font-bold pt-4">
                                  Tujuan Department
                                </label>
                                {Department?.map((dt: any, indx: number) => {
                                  return (
                                    <>
                                      <select
                                        onChange={(e) => {
                                          handleChangePointDepatment(e, indx);
                                        }}
                                        defaultValue={dt.department}
                                        className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-2 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input 'text-black dark:text-white' 
                  }`}
                                      >
                                        <option
                                          value=""
                                          disabled
                                          selected
                                          className="text-body dark:text-bodydark"
                                        >
                                          Pilih Tujuan Department
                                        </option>

                                        {DataDepartment?.map(
                                          (
                                            dataDef: any,
                                            indexDepartment: number,
                                          ) => {
                                            return (
                                              <option
                                                value={dataDef.id}
                                                className="text-body dark:text-bodydark"
                                              >
                                                {dataDef.name}
                                              </option>
                                            );
                                          },
                                        )}
                                      </select>
                                      <button
                                        onClick={() => {
                                          handleDeletePointDepartment(indx);
                                        }}
                                        className="bg-red-600 rounded-md w-22 h-10 text-white font-semibold text-sm"
                                      >
                                        X
                                      </button>
                                    </>
                                  );
                                })}

                                <button
                                  onClick={() => {
                                    handleAddPointDepartment();
                                  }}
                                  className="bg-green-600 rounded-md w-22 h-10 text-white font-semibold text-sm"
                                >
                                  TAMBAH DEPARTMENT
                                </button>
                                <button
                                  onClick={() => {
                                    tambahDefectPeriode(
                                      data.id,
                                      LemMesinPeriode?.id,
                                      kode,
                                      masalah,
                                      kriteria,
                                      persenKriteria,
                                      sumberMasalah,
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
                    </>
                  );
                },
              )}
            </div>
          </div>
          {(!isOnprogres &&
            LemMesinPeriode?.status == 'incoming' &&
            LemMesinPeriode?.inspeksi_lem_periode[0]?.status == 'incoming') ||
            (LemMesinPeriode?.inspeksi_lem_periode[0]?.status == 'pending' &&
              LemMesinPeriode?.status == 'incoming') ? (
            <>
              <button
                disabled={isLoading}
                onClick={() =>
                  tambahTaskCekPeriode(
                    LemMesinPeriode?.inspeksi_lem_periode[0].id,
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
            {/* <label className=" text-[#6c6b6b] text-sm font-semibold col-span-2">
                            Jumlah Periode Check :{' '}
                            {LemMesinPeriode?.inspeksi_lem_awal[0].jumlah_periode}
                        </label>
                        <label className=" text-[#6c6b6b] text-sm font-semibold col-span-2">
                            Waktu Check : {jumlahWaktuCheck}
                        </label> */}
            <div className="grid col-span-8">
              <label className=" text-[#6c6b6b] text-sm font-semibold">
                Catatan<span className="text-red-500">*</span> :
              </label>
              {(!isOnprogres &&
                LemMesinPeriode?.status == 'incoming' &&
                LemMesinPeriode?.inspeksi_lem_periode[0]?.status ==
                'incoming') ||
                LemMesinPeriode?.inspeksi_lem_periode[0]?.status == 'pending' ? (
                <textarea
                  onChange={(e) => setCatatan(e.target.value)}
                  className="peer  resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                ></textarea>
              ) : (
                <textarea
                  defaultValue={
                    LemMesinPeriode?.inspeksi_lem_periode[0].catatan
                  }
                  disabled
                  className="peer  resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                ></textarea>
              )}
            </div>
            <div className="grid col-span-2 items-end justify-end gap-2">
              {!isOnprogres && LemMesinPeriode?.status == 'incoming' ? (
                <button
                  onClick={() =>
                    pendingCekPeriode(
                      LemMesinPeriode?.inspeksi_lem_periode[0].id,
                    )
                  }
                  className=" w-full h-10 rounded-md bg-red-600 text-white text-xs font-bold justify-center items-center px-10 py-2 hover:cursor-pointer"
                >
                  PENDING
                </button>
              ) : null}
              {(!isOnprogres &&
                LemMesinPeriode?.status == 'incoming' &&
                LemMesinPeriode?.inspeksi_lem_periode[0]?.status ==
                'incoming') ||
                LemMesinPeriode?.inspeksi_lem_periode[0]?.status == 'pending' ? (
                <button
                  onClick={() => {
                    doneCekPeriode(LemMesinPeriode?.inspeksi_lem_periode[0].id);
                    console.log(LemMesinPeriode?.inspeksi_lem_periode[0]);
                  }}
                  className=" w-full h-10 rounded-md bg-[#00B81D] text-white text-xs font-bold justify-center items-center px-10 py-2 hover:cursor-pointer"
                >
                  CHECKSHEET SELESAI
                </button>
              ) : null}
              {/* ) : null} */}
            </div>

            {lemMesinPeriodeDefect?.map((data: any, index: number) => {
              return (
                <div className="">
                  <label>kode: </label>
                  <label>{data.kode}</label>
                  <label>Total Defect: </label>
                  <label>{formatInteger(parseInt(data.total_defect))}</label>
                </div>
              );
            })}
          </div>
        </main>
      )}
    </>
  );
}

export default CheckSheetLemPeriode;
