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
import formatInteger from '../../../../../utils/formaterInteger';
import ModalKosongan from '../../../../Modals/Qc/NCR/NCRResponQC';

function CheckSheetCoatingPeriode() {
  const { id } = useParams();
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [CoatingMesinPeriode, setCoatingMesinPeriode] = useState<any>();

  const [coatingMesinPeriodeDefect, setCoatingMesinPeriodeDefect] =
    useState<any>();
  const [catatan, setCatatan] = useState<any>();
  const [kode, setKode] = useState<any>();
  const [masalah, setMasalah] = useState<any>();
  const [kriteria, setKriteria] = useState<any>();
  const [persenKriteria, setPersenKriteria] = useState<any>();
  const [sumberMasalah, setSumberMasalah] = useState<any>();
  const [DataDepartment, setDataDepartment] = useState<any>();
  const [coatingdMesinPeriodeHistory, setcoatingdMesinPeriodeHistory] = useState<any>();

  const [Department, setDepartment] = useState([
    {
      id: 0,
      department: '',
    },
  ]);
  const [masterKode, setMasterKode] = useState<any>();

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
    getCoatingMesinPeriode();
    getDepartment();
    getMasterKode();
  }, []);

  async function getMasterKode() {
    const url = `${import.meta.env.VITE_API_LINK_P1
      }/api/list-kendala?criteria=true&proses=5`;

    try {
      setIsLoading(true);
      const res = await axios.get(url);

      setMasterKode(res);
      setIsLoading(false);
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
  async function getCoatingMesinPeriode() {
    const url = `${import.meta.env.VITE_API_LINK}/qc/cs/inspeksiCoating/${id}`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        params: { jenis_pengecekan: 'periode' },
        withCredentials: true,
      });
      setIsLoading(false);
      setCoatingMesinPeriode(res.data.data);
      setCoatingMesinPeriodeDefect(res.data.defect);
      setcoatingdMesinPeriodeHistory(res.data.history);
      console.log(res);
    } catch (error: any) {
      setIsLoading(false);
      alert('Gagal Memannggil Data, Coba Refresh Halaman!')
      console.log(error.data.msg);
    }
  }

  async function startTaskCekPeriode(id: number) {
    const url = `${import.meta.env.VITE_API_LINK
      }/qc/cs/inspeksiCoatingResult/periode/start/${id}`;
    try {
      const res = await axios.get(
        url,

        {
          withCredentials: true,
        },
      );

      getCoatingMesinPeriode();
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
    nilai_glossy_kiri: any,
    nilai_glossy_tengah: any,
    nilai_glossy_kanan: any,
    data_defect: any,
  ) {
    const url = `${import.meta.env.VITE_API_LINK
      }/qc/cs/inspeksiCoatingResult/periode/stop/${id}`;
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
          nilai_glossy_kiri: nilai_glossy_kiri,
          nilai_glossy_tengah: nilai_glossy_tengah,
          nilai_glossy_kanan: nilai_glossy_kanan,
          kode_masalah: data_defect,
        },
        {
          withCredentials: true,
        },
      );

      getCoatingMesinPeriode();
    } catch (error: any) {
      console.log(error);
    }
  }

  async function tambahTaskCekPeriode(id: number) {
    const url = `${import.meta.env.VITE_API_LINK
      }/qc/cs/inspeksiCoatingResult/periode/${id}`;
    try {
      setIsLoading(true);
      const res = await axios.post(
        url,
        {
          masterMasalah: masterKode,
        },
        {
          withCredentials: true,
        },
      );
      setIsLoading(false);
      getCoatingMesinPeriode();
    } catch (error: any) {
      console.log(error);
    }
  }

  async function tambahDefectPeriode(
    id: number,
    kode: any,
    masalah: any,
    kriteria: any,
    persenKriteria: any,
    sumberMasalah: any,
    index: number,
  ) {
    const url = `${import.meta.env.VITE_API_LINK
      }/qc/cs/inspeksiCoatingResult/periode/point/${id}`;
    try {
      const res = await axios.post(
        url,

        {
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
      handleClickAdd(index);
      setShowModal2(false);
      setKode(null);
      setMasalah(null);
      setDepartment([
        {
          id: 0,
          department: '',
        },
      ]);
      getCoatingMesinPeriode();
    } catch (error: any) {
      console.log(error);
    }
  }

  async function doneCekPeriode(id: number) {
    const url = `${import.meta.env.VITE_API_LINK
      }/qc/cs/inspeksiCoating/periode/${id}`;
    try {
      const res = await axios.put(
        url,
        { catatan: catatan },
        {
          withCredentials: true,
        },
      );

      getCoatingMesinPeriode();
    } catch (error: any) {
      console.log(error);
    }
  }

  async function pendingCekAwal(id: number) {
    const url = `${import.meta.env.VITE_API_LINK
      }/qc/cs/inspeksiCoating/pending/${id}`;
    try {
      const res = await axios.get(
        url,

        {
          withCredentials: true,
        },
      );

      getCoatingMesinPeriode();
    } catch (error: any) {
      console.log(error.data.msg);
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
    const onchangeVal: any = CoatingMesinPeriode;
    onchangeVal.inspeksi_coating_result_periode[i][name] = value;
    setCoatingMesinPeriode(onchangeVal);
  };

  const handleChangePointDefect = (e: any, i: number, ii: number) => {
    const { name, value } = e.target;
    const onchangeVal: any = CoatingMesinPeriode;
    onchangeVal.inspeksi_coating_result_periode[
      i
    ].inspeksi_coating_result_point_periode[ii]['hasil'] = value;
    setCoatingMesinPeriode(onchangeVal);
  };
  const handleChangePointHasil = (e: any, i: number, ii: number) => {
    const { name, value } = e.target;
    const onchangeVal: any = CoatingMesinPeriode;
    onchangeVal.inspeksi_coating_result_periode[
      i
    ].inspeksi_coating_result_point_periode[ii][name] = value;
    setCoatingMesinPeriode(onchangeVal);
  };
  const tanggal = convertTimeStampToDateOnly(CoatingMesinPeriode?.createdAt);
  const jam = convertDateToTime(CoatingMesinPeriode?.createdAt);

  const tanggalHistory = convertTimeStampToDateOnly(
    coatingdMesinPeriodeHistory?.createdAt,
  );
  const jamHistory = convertDateToTime(coatingdMesinPeriodeHistory?.createdAt);
  //   const jumlahWaktuCheck = formatElapsedTime(
  //     CoatingMesinPeriode?.inspeksi_coating_sub_awal[0].waktu_check,
  //   );

  const [filling, setFilling] = useState(false);

  const [showModal2, setShowModal2] = useState(false);
  const openModal2 = () => setShowModal2(true);
  const closeModal2 = () => setShowModal2(false);
  const [showHistory, setShowHistory] = useState(false);
  const openModalHistory = () => setShowHistory(true);
  const closeModalHistory = () => setShowHistory(false);


  const isOnprogres =
    CoatingMesinPeriode?.inspeksi_coating_result_periode?.some(
      (data: { status: any }) => data?.status === 'on progress',
    );

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
                Coating Checksheet
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
                              Coating
                            </label>
                          </div>
                          <div className="grid grid-rows-6 gap-2 col-span-2  py-4">
                            <label className="text-neutral-500 text-sm font-semibold">
                              : {tanggalHistory}
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              : {formatInteger(parseInt(coatingdMesinPeriodeHistory?.jumlah_druk))} / {formatInteger(parseInt(coatingdMesinPeriodeHistory?.mata))}
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              : {formatInteger(parseInt(coatingdMesinPeriodeHistory?.jumlah_pcs))}
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              : {coatingdMesinPeriodeHistory?.jenis_kertas}
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              : {coatingdMesinPeriodeHistory?.jenis_gramatur}
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              : {coatingdMesinPeriodeHistory?.coating}
                            </label>
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
                              : {coatingdMesinPeriodeHistory?.no_jo}
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              : {coatingdMesinPeriodeHistory?.no_io}
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              : {coatingdMesinPeriodeHistory?.nama_produk}
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              : {coatingdMesinPeriodeHistory?.customer}
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
                              : {coatingdMesinPeriodeHistory?.shift}
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              : {coatingdMesinPeriodeHistory?.mesin}
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              : {coatingdMesinPeriodeHistory?.operator}
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              : {coatingdMesinPeriodeHistory?.status_jo}
                            </label>
                          </div>
                        </div>
                        {coatingdMesinPeriodeHistory?.inspeksi_coating_result_periode?.map(
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
                                  <div className="  rounded-md bg-[#F3F3F3] border-gray flex px-5 mx-5 py-6 justify-between">
                                    <div className="grid grid-cols-2">
                                      <div className="flex flex-col">
                                        <label className="text-blue-600 text-sm font-semibold pb-6">
                                          KODE-MASALAH
                                        </label>
                                        {data.inspeksi_coating_result_point_periode.map(
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
                                <div className="flex min-w-screen justify-between px-2 py-4">
                                  <label className="text-sm font-semibold">
                                    {index + 1}
                                  </label>
                                  <div className="flex flex-col justify-between">
                                    <label className="text-sm font-semibold">
                                      INSPEKTOR
                                    </label>
                                    <label className="text-sm font-semibold">
                                      {data.inspektor?.nama}
                                    </label>
                                  </div>
                                  <div className="flex flex-col justify-between">
                                    <label className="text-sm font-semibold">
                                      WAKTU SAMPLING
                                    </label>
                                    <label className="text-sm font-semibold">
                                      {waktuSampling}
                                    </label>
                                  </div>
                                  <div className="flex flex-col justify-between">
                                    <label className="text-sm font-semibold">
                                      NUMERATOR<span className="text-red-600">*</span>
                                    </label>

                                    <input
                                      type="text"
                                      readOnly
                                      defaultValue={data.numerator}
                                      name="numerator"

                                      className="text-sm font-semibold w-full border-stroke border"
                                    ></input>

                                  </div>

                                  <div className="flex flex-col justify-between">
                                    <label className="text-sm font-semibold">
                                      JUMLAH SAMPLING<span className="text-red-600">*</span>
                                    </label>

                                    <input
                                      type="text"
                                      readOnly
                                      defaultValue={data.jumlah_sampling}
                                      name="jumlah_sampling"

                                      className="text-sm font-semibold w-full border-stroke border"
                                    ></input>

                                  </div>
                                  <div className="flex flex-col justify-between">
                                    <label className="text-sm font-semibold">
                                      JUMLAH GLOSSY KIRI
                                      <span className="text-red-600">*</span>
                                    </label>

                                    <input
                                      type="text"
                                      readOnly
                                      defaultValue={data.nilai_glossy_kiri}
                                      name="nilai_glossy_kiri"

                                      className="text-sm font-semibold w-[90%] border-stroke border"
                                    ></input>

                                  </div>
                                  <div className="flex flex-col justify-between">
                                    <label className="text-sm font-semibold">
                                      JUMLAH GLOSSY TENGAH
                                      <span className="text-red-600">*</span>
                                    </label>

                                    <input
                                      type="text"
                                      readOnly
                                      defaultValue={data.nilai_glossy_tengah}
                                      name="nilai_glossy_tengah"

                                      className="text-sm font-semibold w-[90%] border-stroke border"
                                    ></input>

                                  </div>
                                  <div className="flex flex-col justify-between">
                                    <label className="text-sm font-semibold">
                                      JUMLAH GLOSSY KANAN
                                      <span className="text-red-600">*</span>
                                    </label>

                                    <input
                                      type="text"
                                      readOnly
                                      defaultValue={data.nilai_glossy_kanan}
                                      name="nilai_glossy_kanan"

                                      className="text-sm font-semibold w-[90%] border-stroke border"
                                    ></input>

                                  </div>
                                  <>

                                  </>
                                  <>
                                    <div className="w-[30%]">
                                      <p className="md:text-[14px] text-[9px] font-semibold">
                                        Time : {lamaPengerjaan}
                                      </p>


                                    </div>
                                  </>
                                </div>

                                <div className="flex overflow-x-scroll max-w-screen border-b-8 border-[#D8EAFF]  gap-1 rounded-sm">
                                  {data?.inspeksi_coating_result_point_periode?.map(
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



                                          {data2.hasil == 'not ok' ? (
                                            <input
                                              type="text"
                                              name="jumlah_defect"
                                              defaultValue={data2.jumlah_defect}
                                              readOnly
                                              className="text-sm font-semibold w-[90%] border-stroke border"
                                            ></input>
                                          ) : (<></>)}
                                        </div>
                                      );
                                    },
                                  )}



                                </div>

                              </>
                            );
                          },
                        )}
                      </>
                    </ModalKosongan>
                  </>
                )
                }
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
                  Coating
                </label>
              </div>
              <div className="grid grid-rows-6 gap-2 col-span-2  py-4">
                <label className="text-neutral-500 text-sm font-semibold">
                  : {tanggal}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {formatInteger(parseInt(CoatingMesinPeriode?.jumlah_druk))} / {formatInteger(parseInt(CoatingMesinPeriode?.mata))}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {formatInteger(parseInt(CoatingMesinPeriode?.jumlah_pcs))}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {CoatingMesinPeriode?.jenis_kertas}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {CoatingMesinPeriode?.jenis_gramatur}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {CoatingMesinPeriode?.coating}
                </label>
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
                  : {CoatingMesinPeriode?.no_jo}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {CoatingMesinPeriode?.no_io}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {CoatingMesinPeriode?.nama_produk}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {CoatingMesinPeriode?.customer}
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
                  : {CoatingMesinPeriode?.shift}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {CoatingMesinPeriode?.mesin}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {CoatingMesinPeriode?.operator}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {CoatingMesinPeriode?.status_jo}
                </label>
              </div>
            </div>

            {/* =============================chekcsheet========================= */}

            {CoatingMesinPeriode?.inspeksi_coating_result_periode?.map(
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
                      <div className="  rounded-md bg-[#F3F3F3] border-gray flex px-5 mx-5 py-6 justify-between">
                        <div className="grid grid-cols-2">
                          <div className="flex flex-col">
                            <label className="text-blue-600 text-sm font-semibold pb-6">
                              KODE-MASALAH
                            </label>
                            {data.inspeksi_coating_result_point_periode.map(
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
                    <div className="flex min-w-screen justify-between px-2 py-4">
                      <label className="text-sm font-semibold">
                        {index + 1}
                      </label>
                      <div className="flex flex-col justify-between">
                        <label className="text-sm font-semibold">
                          INSPEKTOR
                        </label>
                        <label className="text-sm font-semibold">
                          {data.inspektor?.nama}
                        </label>
                      </div>
                      <div className="flex flex-col justify-between">
                        <label className="text-sm font-semibold">
                          WAKTU SAMPLING
                        </label>
                        <label className="text-sm font-semibold">
                          {waktuSampling}
                        </label>
                      </div>
                      <div className="flex flex-col justify-between">
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
                            className="text-sm font-semibold w-full border-stroke border"
                          ></input>
                        ) : data.status == 'on progress' ? (
                          <input
                            type="text"
                            name="numerator"
                            onChange={(e) => handleChangePoint(e, index)}
                            className="text-sm font-semibold w-full border-stroke border"
                          ></input>
                        ) : null}
                      </div>

                      <div className="flex flex-col justify-between">
                        <label className="text-sm font-semibold">
                          JUMLAH SAMPLING<span className="text-red-600">*</span>
                        </label>
                        {data.status == 'done' ? (
                          <input
                            type="text"
                            disabled
                            defaultValue={data.jumlah_sampling}
                            name="jumlah_sampling"
                            onChange={(e) => handleChangePoint(e, index)}
                            className="text-sm font-semibold w-full border-stroke border"
                          ></input>
                        ) : data.status == 'on progress' ? (
                          <input
                            type="text"
                            name="jumlah_sampling"
                            onChange={(e) => handleChangePoint(e, index)}
                            className="text-sm font-semibold w-full border-stroke border"
                          ></input>
                        ) : null}
                      </div>
                      <div className="flex flex-col justify-between">
                        <label className="text-sm font-semibold">
                          JUMLAH GLOSSY KIRI
                          <span className="text-red-600">*</span>
                        </label>
                        {data.status == 'done' ? (
                          <input
                            type="text"
                            disabled
                            defaultValue={data.nilai_glossy_kiri}
                            name="nilai_glossy_kiri"
                            onChange={(e) => handleChangePoint(e, index)}
                            className="text-sm font-semibold w-[90%] border-stroke border"
                          ></input>
                        ) : data.status == 'on progress' ? (
                          <input
                            type="text"
                            name="nilai_glossy_kiri"
                            onChange={(e) => handleChangePoint(e, index)}
                            className="text-sm font-semibold w-[90%] border-stroke border"
                          ></input>
                        ) : null}
                      </div>
                      <div className="flex flex-col justify-between">
                        <label className="text-sm font-semibold">
                          JUMLAH GLOSSY TENGAH
                          <span className="text-red-600">*</span>
                        </label>
                        {data.status == 'done' ? (
                          <input
                            type="text"
                            disabled
                            defaultValue={data.nilai_glossy_tengah}
                            name="nilai_glossy_tengah"
                            onChange={(e) => handleChangePoint(e, index)}
                            className="text-sm font-semibold w-[90%] border-stroke border"
                          ></input>
                        ) : data.status == 'on progress' ? (
                          <input
                            type="text"
                            name="nilai_glossy_tengah"
                            onChange={(e) => handleChangePoint(e, index)}
                            className="text-sm font-semibold w-[90%] border-stroke border"
                          ></input>
                        ) : null}
                      </div>
                      <div className="flex flex-col justify-between">
                        <label className="text-sm font-semibold">
                          JUMLAH GLOSSY KANAN
                          <span className="text-red-600">*</span>
                        </label>
                        {data.status == 'done' ? (
                          <input
                            type="text"
                            disabled
                            defaultValue={data.nilai_glossy_kanan}
                            name="nilai_glossy_kanan"
                            onChange={(e) => handleChangePoint(e, index)}
                            className="text-sm font-semibold w-[90%] border-stroke border"
                          ></input>
                        ) : data.status == 'on progress' ? (
                          <input
                            type="text"
                            name="nilai_glossy_kanan"
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
                              className="w-full"
                            />
                          </div>
                        </div>
                      </>
                      <>
                        <div className="w-[30%]">
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
                                    data.nilai_glossy_kiri,
                                    data.nilai_glossy_tengah,
                                    data.nilai_glossy_kanan,
                                    data.inspeksi_coating_result_point_periode,
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

                    <div className="flex overflow-x-scroll max-w-screen border-b-8 border-[#D8EAFF]  gap-1 rounded-sm">
                      {data?.inspeksi_coating_result_point_periode?.map(
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
                                  defaultValue={data2.jumlah_defect}
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
                                TAMBAH DEFECT
                              </button>
                            </div>
                          </ModalAddPeriode>
                        </>
                      )}
                    </div>
                    {/* <div className="flex flex-col w-full px-3 py-2">
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
                    </div> */}
                  </>
                );
              },
            )}
          </div>
          {!isOnprogres &&
            CoatingMesinPeriode?.inspeksi_coating_sub_periode[0].status !=
            'history' ? (
            <>
              <button
                disabled={isLoading}
                onClick={() => tambahTaskCekPeriode(CoatingMesinPeriode?.id)}
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
                            {cetakMesinPeriode?.inspeksi_cetak_awal[0].jumlah_periode}
                        </label>
                        <label className=" text-[#6c6b6b] text-sm font-semibold col-span-2">
                            Waktu Check : {jumlahWaktuCheck}
                        </label> */}
            <div className="grid col-span-8">
              <label className=" text-[#6c6b6b] text-sm font-semibold">
                Catatan<span className="text-red-500">*</span> :
              </label>
              {CoatingMesinPeriode?.inspeksi_coating_sub_periode[0].status !=
                'history' ? (
                <textarea
                  onChange={(e) => setCatatan(e.target.value)}
                  className="peer  resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                ></textarea>
              ) : (
                <textarea
                  defaultValue={
                    CoatingMesinPeriode?.inspeksi_coating_sub_periode[0].catatan
                  }
                  disabled
                  className="peer  resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                ></textarea>
              )}
            </div>
            <div className="grid col-span-2 items-end justify-end gap-2">
              {!isOnprogres &&
                CoatingMesinPeriode?.status == 'incoming' ? (
                <button
                  onClick={() => pendingCekAwal(CoatingMesinPeriode?.id)}
                  className=" w-full h-10 rounded-md bg-red-600 text-white text-xs font-bold justify-center items-center px-10 py-2 hover:cursor-pointer"
                >
                  PENDING
                </button>
              ) : null}
              {!isOnprogres &&
                CoatingMesinPeriode?.inspeksi_coating_sub_periode[0].status !=
                'history' ? (
                <button
                  onClick={() => {
                    doneCekPeriode(CoatingMesinPeriode?.id);
                    console.log(CoatingMesinPeriode);
                  }}
                  className=" w-full h-10 rounded-md bg-[#00B81D] text-white text-xs font-bold justify-center items-center px-10 py-2 hover:cursor-pointer"
                >
                  CHECKSHEET SELESAI
                </button>
              ) : null}

              {/* ) : null} */}
            </div>
          </div>
          <div className="flex w-full min-w-[700px] border-b-8 items-center border-[#D8EAFF] px-4 py-4 gap-5 bg-white rounded-b-xl mt-2">
            {coatingMesinPeriodeDefect?.map((data: any, index: number) => {
              return (
                <div className="flex flex-col max-w-45 overflow-x-scroll">
                  <label>Kode: </label>
                  <label>{data.kode}</label>
                  <label>Total Defect: </label>
                  <label>{data.total_defect}</label>
                </div>
              );
            })}
          </div>
        </main>
      )}
    </>
  );
}

export default CheckSheetCoatingPeriode;
