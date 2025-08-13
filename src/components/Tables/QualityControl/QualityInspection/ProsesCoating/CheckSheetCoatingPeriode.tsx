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
import ModalKosonganSmall from '../../../../Modals/ModalKosonganSmall';

function CheckSheetCoatingPeriode() {
  const { id } = useParams();
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [CoatingMesinPeriode, setCoatingMesinPeriode] = useState<any>();
  const [cttPeriode, setcttPeriode] = useState<any>();
  const [coatingMesinPeriodeDefect, setCoatingMesinPeriodeDefect] =
    useState<any>();
  const [catatan, setCatatan] = useState<any>();
  const [kode, setKode] = useState<any>();
  const [masalah, setMasalah] = useState<any>();
  const [kriteria, setKriteria] = useState<any>();
  const [persenKriteria, setPersenKriteria] = useState<any>();
  const [sumberMasalah, setSumberMasalah] = useState<any>();
  const [DataDepartment, setDataDepartment] = useState<any>();
  const [coatingdMesinPeriodeHistory, setcoatingdMesinPeriodeHistory] =
    useState<any>();

  const [Department, setDepartment] = useState([
    {
      id: 0,
      department: '',
    },
  ]);
  const [sample1Value, setSample1Value] = useState<any>();
  const [result1, setResult1] = useState<any>();

  const [sample2Value, setSample2Value] = useState<any>();
  const [result2, setResult2] = useState<any>();

  const [sample3Value, setSample3Value] = useState<any>();
  const [result3, setResult3] = useState<any>();

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
    fetchMasterWaste();
  }, []);

  const [isFailed, setIsFailed] = useState(false);
  const [masterWaste, setMasterWaste] = useState<any>();
  async function fetchMasterWaste() {
    const url2 = `${import.meta.env.VITE_API_LINK_P1}/api/master-waste`;

    try {
      setIsLoading(true);
      const res = await axios.get(url2);
      setIsLoading(false);
      setMasterWaste(res.data.waste); // Save raw data for filtering
      console.log('Master Waste Data:', res.data.waste);
    } catch (error: any) {
      setIsLoading(false);
      console.error('Error fetching master waste:', error);
    }
  }
  async function getMasterKode() {
    const url = `${
      import.meta.env.VITE_API_LINK_P1
    }/api/list-kendala?criteria=true&proses=5`;

    try {
      setIsLoading(true);
      const res = await axios.get(url);

      setMasterKode(res);
      setIsLoading(false);
      setIsFailed(false);
      console.log(res);
    } catch (error: any) {
      setIsLoading(false);
      setIsFailed(true);
      alert('Gagal Memanggil Defect, Coba Refresh Halaman!');
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
      alert('Gagal Memannggil Department, Coba Refresh Halaman!');
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
      alert('Gagal Memannggil Data, Coba Refresh Halaman!');
      console.log(error.data.msg);
    }
  }

  async function startTaskCekPeriode(id: number) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiCoatingResult/periode/start/${id}`;
    try {
      setIsLoading(true);
      const res = await axios.get(
        url,

        {
          withCredentials: true,
        },
      );

      getCoatingMesinPeriode();
      setIsLoading(false);
    } catch (error: any) {
      console.log(error.data.msg);
      alert(error.response.data.msg);
      setIsLoading(false);
    }
  }
  async function deletePeriode(id: number) {
    if (window.confirm('Hapus Periode?')) {
      const url = `${
        import.meta.env.VITE_API_LINK
      }/qc/cs/inspeksiCoatingResult/periode/delete/${id}`;
      try {
        setIsLoading(true);
        const res = await axios.delete(
          url,

          {
            withCredentials: true,
          },
        );
        getCoatingMesinPeriode();
        setIsLoading(false);
      } catch (error: any) {
        console.log(error);
        setIsLoading(false);
        alert(error);
      }
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
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiCoatingResult/periode/stop/${id}`;
    try {
      setIsLoading(true);
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
      setcttPeriode(null);
      getCoatingMesinPeriode();
      setIsLoading(false);
    } catch (error: any) {
      console.log(error);
      setIsLoading(false);
    }
  }

  async function tambahTaskCekPeriode(id: number) {
    const url = `${
      import.meta.env.VITE_API_LINK
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
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiCoatingResult/periode/point/${id}`;
    try {
      setIsLoading(true);
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
      setIsLoading(false);
    } catch (error: any) {
      console.log(error);
      setIsLoading(false);
    }
  }

  async function doneCekPeriode(id: number) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiCoating/periode/${id}`;
    try {
      setIsLoading(true);
      const res = await axios.put(
        url,
        {
          catatan: catatan,
          sample_1: sample1Value,
          sample_2: sample2Value,
          sample_3: sample3Value,
        },
        {
          withCredentials: true,
        },
      );

      getCoatingMesinPeriode();
      setIsLoading(false);
    } catch (error: any) {
      console.log(error);
      setIsLoading(false);
    }
  }
  const [alasanPending, setalasanPending] = useState<any>();
  async function pendingCekAwal(id: number) {
    if (alasanPending == null) {
      alert('Catatan Wajib Diisi');
      return;
    }
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiCoating/pending/${id}`;
    try {
      setIsLoading(true);
      const res = await axios.put(
        url,
        {
          alasan_pending: alasanPending,
        },
        {
          withCredentials: true,
        },
      );
      closeModalPending();
      getCoatingMesinPeriode();
      setIsLoading(false);
    } catch (error: any) {
      console.log(error.data.msg);
      setIsLoading(false);
    }
  }
  const [showPending, setShowPending] = useState(false);
  const openModalPending = () => setShowPending(true);
  const closeModalPending = () => setShowPending(false);
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
  const handleChangePointHasil = (
    e: any,
    i: number,
    ii: number,
    kodeData: string,
  ) => {
    const { name, value } = e.target;
    const onchangeVal: any = { ...CoatingMesinPeriode };

    // Handle dropdown selection for kendala
    if (name === 'kode_lkh') {
      // Find the selected kendala from masterWaste
      const matchedWaste = masterWaste?.find(
        (waste: any) => waste.kode_waste === kodeData,
      );
      const selectedKendala = matchedWaste?.waste?.find(
        (w: any) => w.kode_kendala === value,
      );

      if (selectedKendala) {
        onchangeVal.inspeksi_coating_result_periode[
          i
        ].inspeksi_coating_result_point_periode[ii]['kode_lkh'] = value;
        onchangeVal.inspeksi_coating_result_periode[
          i
        ].inspeksi_coating_result_point_periode[ii]['masalah_lkh'] =
          selectedKendala.kendala_desc;
      }
    } else {
      onchangeVal.inspeksi_coating_result_periode[
        i
      ].inspeksi_coating_result_point_periode[ii][name] = value;
    }

    setCoatingMesinPeriode(onchangeVal);
  };

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Base file upload function (from your original code)
  async function handleFileUpload(file: File): Promise<string> {
    setUploading(true);
    setUploadError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_LINK}/images`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      const fileName =
        response.data.fileName || response.data.filename || response.data.file;
      return fileName;
    } catch (error: any) {
      console.error('Error uploading file:', error);
      setUploadError('Failed to upload file');
      throw error;
    } finally {
      setUploading(false);
    }
  }

  // Base file delete function (from your original code)
  async function handleFileDelete(fileName: string): Promise<void> {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_LINK}/images/${fileName}`,
        { withCredentials: true },
      );
    } catch (error: any) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  // Image upload handler for specific defect - ADJUSTED FOR CORRECT MAPPING
  const handleImageUpload = async (file: File, i: number, ii: number) => {
    try {
      const fileName = await handleFileUpload(file);
      const onchangeVal: any = { ...CoatingMesinPeriode };

      // Correct path based on the mapping structure
      onchangeVal.inspeksi_coating_result_periode[
        i
      ].inspeksi_coating_result_point_periode[ii]['file'] = fileName;

      setCoatingMesinPeriode(onchangeVal);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  // Image delete handler for specific defect - ADJUSTED FOR CORRECT MAPPING
  const handleImageDelete = async (i: number, ii: number) => {
    try {
      const currentFile =
        CoatingMesinPeriode.inspeksi_coating_result_periode[i]
          ?.inspeksi_coating_result_point_periode[ii]?.file;

      if (currentFile) {
        await handleFileDelete(currentFile);
        const onchangeVal: any = { ...CoatingMesinPeriode };

        // Correct path based on the mapping structure
        onchangeVal.inspeksi_coating_result_periode[
          i
        ].inspeksi_coating_result_point_periode[ii]['file'] = '';

        setCoatingMesinPeriode(onchangeVal);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  // Get matching waste data for dropdown options
  const getWasteOptions = (kode: string) => {
    const matchedWaste = masterWaste?.find(
      (waste: any) => waste.kode_waste === kode,
    );
    return matchedWaste?.waste || [];
  };

  // Format integer helper (if not already defined)
  const formatInteger = (value: number) => {
    return new Intl.NumberFormat().format(value);
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState('');

  const openFullscreen = (imageSrc: string) => {
    setFullscreenImage(imageSrc);
    setIsFullscreen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
    setFullscreenImage('');
  };
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
                              :{' '}
                              {formatInteger(
                                parseInt(
                                  coatingdMesinPeriodeHistory?.jumlah_druk,
                                ),
                              )}{' '}
                              /{' '}
                              {formatInteger(
                                parseInt(coatingdMesinPeriodeHistory?.mata),
                              )}
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              :{' '}
                              {formatInteger(
                                parseInt(
                                  coatingdMesinPeriodeHistory?.jumlah_pcs,
                                ),
                              )}
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
                              Status Jo
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
                            const waktuSampling = convertDateToTime(
                              data.waktu_mulai,
                            );
                            const lamaPengerjaan = formatElapsedTime(
                              data.lama_pengerjaan,
                            );
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
                                          <img
                                            alt=""
                                            src={ok}
                                            className="w-5"
                                          ></img>
                                          OK
                                        </label>
                                        <label className="text-black text-sm font-semibold flex gap-2">
                                          <img
                                            alt=""
                                            src={oktole}
                                            className="w-5"
                                          ></img>
                                          OK (Toleransi)
                                        </label>
                                        <label className="text-black text-sm font-semibold flex gap-2">
                                          <img
                                            alt=""
                                            src={notok}
                                            className="w-5"
                                          ></img>
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
                                      NUMERATOR
                                      <span className="text-red-600">*</span>
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
                                      JUMLAH SAMPLING
                                      <span className="text-red-600">*</span>
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
                                  <></>
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
                                 ${
                                   data2.hasil == 'ok'
                                     ? 'bg-blue-300'
                                     : data2.hasil == 'ok (toleransi)'
                                     ? 'bg-yellow-300'
                                     : data2.hasil == 'not ok'
                                     ? 'bg-red-300'
                                     : 'bg-white'
                                 }`}
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
                                                <img
                                                  src={ok}
                                                  alt=""
                                                  className="w-4"
                                                />
                                              </>
                                            ) : data2.hasil ==
                                              'ok (toleransi)' ? (
                                              <>
                                                <img
                                                  src={oktole}
                                                  alt=""
                                                  className="w-4"
                                                />
                                              </>
                                            ) : data2.hasil == 'not ok' ? (
                                              <>
                                                <img
                                                  src={notok}
                                                  alt=""
                                                  className="w-4"
                                                />
                                              </>
                                            ) : (
                                              <>-</>
                                            )}

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
                                          ) : (
                                            <></>
                                          )}
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
                  Coating
                </label>
              </div>
              <div className="grid grid-rows-6 gap-2 col-span-2  py-4">
                <label className="text-neutral-500 text-sm font-semibold">
                  : {tanggal}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {formatInteger(parseInt(CoatingMesinPeriode?.jumlah_druk))}{' '}
                  / {formatInteger(parseInt(CoatingMesinPeriode?.mata))}
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
                  Status Jo
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
            {/* =============================checksheet========================= */}

            {CoatingMesinPeriode?.inspeksi_coating_result_periode?.map(
              (data: any, index: number) => {
                const waktuSampling = convertDateToTime(data.waktu_mulai);
                const lamaPengerjaan = formatElapsedTime(data.lama_pengerjaan);
                return (
                  <div
                    key={index}
                    className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200"
                  >
                    {/* Filling Guide Button */}
                    <div className="flex justify-end p-4 border-b border-gray-100">
                      <label
                        className="text-blue-500 text-sm font-semibold cursor-pointer hover:text-blue-600 transition-colors px-4 py-2 rounded-md hover:bg-blue-50"
                        onClick={() => handleClickGuide(index)}
                      >
                        FILLING GUIDE
                      </label>
                    </div>

                    {/* Guide Content */}
                    {openGuide == index && (
                      <div className="mx-4 mb-4 rounded-lg bg-gray-50 border border-gray-200">
                        <div className="p-6 flex flex-col lg:flex-row justify-between gap-6">
                          {/* Problem Codes Section */}
                          <div className="flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex flex-col">
                                <label className="text-blue-600 text-sm font-semibold mb-4">
                                  KODE-MASALAH
                                </label>
                                <div className="space-y-2">
                                  {data.inspeksi_coating_result_point_periode.map(
                                    (data3: any, iii: number) => (
                                      <label
                                        key={iii}
                                        className="text-neutral-600 text-sm font-medium block"
                                      >
                                        {data3.kode} - {data3.masalah}
                                      </label>
                                    ),
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Form Filling Guide */}
                          <div className="flex flex-col lg:flex-row items-start gap-6 lg:w-auto w-full">
                            <div className="flex flex-col gap-3 min-w-[200px]">
                              <label className="text-blue-600 text-sm font-semibold mb-2">
                                FORM FILLING GUIDE
                              </label>
                              <div className="space-y-3">
                                <label className="text-gray-800 text-sm font-medium flex items-center gap-2">
                                  <img src={ok} alt="OK" className="w-5 h-5" />
                                  OK
                                </label>
                                <label className="text-gray-800 text-sm font-medium flex items-center gap-2">
                                  <img
                                    src={oktole}
                                    alt="OK Toleransi"
                                    className="w-5 h-5"
                                  />
                                  OK (Toleransi)
                                </label>
                                <label className="text-gray-800 text-sm font-medium flex items-center gap-2">
                                  <img
                                    src={notok}
                                    alt="Not OK"
                                    className="w-5 h-5"
                                  />
                                  NOT OK
                                </label>
                              </div>
                            </div>

                            {/* Close Button */}
                            <button
                              onClick={() => handleClickGuide(index)}
                              className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors self-start lg:self-center"
                            >
                              <img
                                src={X}
                                alt="Close"
                                className="w-4 h-4 filter brightness-0 invert"
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Delete Button */}
                    {((data.status == 'incoming' &&
                      CoatingMesinPeriode?.status == 'incoming') ||
                      data.status == 'on progress') && (
                      <div className="px-4 pb-4 mt-3">
                        <button
                          onClick={() => deletePeriode(data.id)}
                          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-md transition-colors"
                        >
                          Hapus Periode
                        </button>
                      </div>
                    )}

                    {/* Main Info Section */}
                    <div className="p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-8 gap-4 mb-6">
                        {/* Period Number */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-600 mb-1">
                            PERIODE
                          </label>
                          <span className="text-lg font-bold text-gray-800">
                            {index + 1}
                          </span>
                        </div>

                        {/* Inspector */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-600 mb-1">
                            INSPEKTOR
                          </label>
                          <span className="text-sm font-semibold text-gray-800">
                            {data.inspektor?.nama}
                          </span>
                        </div>

                        {/* Sampling Time */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-600 mb-1">
                            WAKTU SAMPLING
                          </label>
                          <span className="text-sm font-semibold text-gray-800">
                            {waktuSampling}
                          </span>
                        </div>

                        {/* Numerator */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-600 mb-1">
                            NUMERATOR<span className="text-red-500">*</span>
                          </label>
                          {data.status == 'done' ? (
                            <input
                              type="text"
                              disabled
                              defaultValue={formatInteger(
                                parseInt(data.numerator),
                              )}
                              name="numerator"
                              className="text-sm font-semibold p-2 border border-gray-300 rounded-md bg-gray-100"
                            />
                          ) : data.status == 'on progress' ? (
                            <input
                              type="text"
                              name="numerator"
                              onChange={(e) => handleChangePoint(e, index)}
                              className="text-sm font-semibold p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                            />
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </div>

                        {/* Jumlah Sampling */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-600 mb-1">
                            JUMLAH SAMPLING
                            <span className="text-red-500">*</span>
                          </label>
                          {data.status == 'done' ? (
                            <input
                              type="text"
                              defaultValue={formatInteger(
                                parseInt(data.jumlah_sampling),
                              )}
                              disabled
                              name="jumlah_sampling"
                              className="text-sm font-semibold p-2 border border-gray-300 rounded-md bg-gray-100"
                            />
                          ) : data.status == 'on progress' ? (
                            <input
                              type="text"
                              name="jumlah_sampling"
                              onChange={(e) => handleChangePoint(e, index)}
                              className="text-sm font-semibold p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                            />
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </div>

                        {/* Glossy Kiri */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-600 mb-1">
                            GLOSSY KIRI
                            <span className="text-red-500">*</span>
                          </label>
                          {data.status == 'done' ? (
                            <input
                              type="text"
                              defaultValue={formatInteger(
                                parseInt(data.nilai_glossy_kiri),
                              )}
                              disabled
                              name="nilai_glossy_kiri"
                              className="text-sm font-semibold p-2 border border-gray-300 rounded-md bg-gray-100"
                            />
                          ) : data.status == 'on progress' ? (
                            <input
                              type="text"
                              name="nilai_glossy_kiri"
                              onChange={(e) => handleChangePoint(e, index)}
                              className="text-sm font-semibold p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                            />
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </div>

                        {/* Glossy Tengah */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-600 mb-1">
                            GLOSSY TENGAH
                            <span className="text-red-500">*</span>
                          </label>
                          {data.status == 'done' ? (
                            <input
                              type="text"
                              defaultValue={formatInteger(
                                parseInt(data.nilai_glossy_tengah),
                              )}
                              disabled
                              name="nilai_glossy_tengah"
                              className="text-sm font-semibold p-2 border border-gray-300 rounded-md bg-gray-100"
                            />
                          ) : data.status == 'on progress' ? (
                            <input
                              type="text"
                              name="nilai_glossy_tengah"
                              onChange={(e) => handleChangePoint(e, index)}
                              className="text-sm font-semibold p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                            />
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </div>

                        {/* Glossy Kanan and Task Status */}
                        <div className="flex flex-col justify-between">
                          {/* Glossy Kanan */}
                          <div className="flex flex-col mb-4">
                            <label className="text-sm font-semibold text-gray-600 mb-1">
                              GLOSSY KANAN
                              <span className="text-red-500">*</span>
                            </label>
                            {data.status == 'done' ? (
                              <input
                                type="text"
                                defaultValue={formatInteger(
                                  parseInt(data.nilai_glossy_kanan),
                                )}
                                disabled
                                name="nilai_glossy_kanan"
                                className="text-sm font-semibold p-2 border border-gray-300 rounded-md bg-gray-100"
                              />
                            ) : data.status == 'on progress' ? (
                              <input
                                type="text"
                                name="nilai_glossy_kanan"
                                onChange={(e) => handleChangePoint(e, index)}
                                className="text-sm font-semibold p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                              />
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </div>

                          {/* Task Status and Controls */}
                          <div className="flex flex-col gap-2">
                            <p className="text-xs text-gray-600">
                              Time: {lamaPengerjaan}
                            </p>

                            {data.status == 'incoming' &&
                            CoatingMesinPeriode?.status == 'incoming' ? (
                              <>
                                <p className="text-xs font-bold text-red-600 mb-1">
                                  Task Belum Dimulai
                                </p>
                                <button
                                  onClick={() => startTaskCekPeriode(data.id)}
                                  className="flex items-center justify-center w-full bg-green-600 hover:bg-green-700 text-white p-2 rounded-md transition-colors"
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
                                <p className="text-xs font-bold text-green-600 mb-1">
                                  Task Dimulai
                                </p>
                                <button
                                  onClick={() => {
                                    console.log(data);
                                    stopTaskCekPeriode(
                                      data.id,
                                      data.waktu_mulai,
                                      cttPeriode,
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
                                  className="flex items-center justify-center w-full bg-red-600 hover:bg-red-700 text-white p-2 rounded-md transition-colors"
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
                            ) : (
                              <p className="text-xs font-bold text-blue-600">
                                Task Selesai
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Defect Inspection Section */}
                    <div className="border-t border-gray-200">
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-800">
                            Inspection Points
                          </h3>
                          {data.status == 'on progress' && (
                            <button
                              onClick={() => handleClickAdd(index)}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-md transition-colors"
                            >
                              Add Problem Code
                            </button>
                          )}
                        </div>

                        {/* Horizontally scrollable inspection points */}
                        <div className="overflow-x-auto pb-4">
                          <div className="flex gap-4 min-w-max">
                            {data?.inspeksi_coating_result_point_periode?.map(
                              (data2: any, i: number) => (
                                <div
                                  key={i}
                                  className={`flex flex-col rounded-lg border-2 transition-all duration-200 w-[200px] h-[400px] ${
                                    data2.hasil == 'ok'
                                      ? 'bg-blue-50 border-blue-200'
                                      : data2.hasil == 'ok (toleransi)'
                                      ? 'bg-yellow-50 border-yellow-200'
                                      : data2.hasil == 'not ok'
                                      ? 'bg-red-50 border-red-200'
                                      : 'bg-gray-50 border-gray-200'
                                  }`}
                                >
                                  {/* Code Label */}
                                  <div className="text-center p-3 border-b border-gray-200 flex-shrink-0">
                                    <label className="text-gray-700 text-sm font-semibold bg-white px-2 py-1 rounded">
                                      {data2.kode}
                                    </label>
                                  </div>

                                  {/* Scrollable Content Area */}
                                  <div className="flex-1 overflow-y-auto p-3">
                                    {/* Status Display or Input */}
                                    {data.status == 'done' ? (
                                      <div className="flex items-center justify-center gap-2 mb-3">
                                        {data2.hasil == 'ok' ? (
                                          <img
                                            src={ok}
                                            alt="OK"
                                            className="w-5 h-5"
                                          />
                                        ) : data2.hasil == 'ok (toleransi)' ? (
                                          <img
                                            src={oktole}
                                            alt="OK Toleransi"
                                            className="w-5 h-5"
                                          />
                                        ) : data2.hasil == 'not ok' ? (
                                          <img
                                            src={notok}
                                            alt="Not OK"
                                            className="w-5 h-5"
                                          />
                                        ) : (
                                          <span>-</span>
                                        )}
                                        <span className="text-xs font-semibold capitalize">
                                          {data2.hasil}
                                        </span>
                                      </div>
                                    ) : data.status == 'on progress' ? (
                                      <div className="space-y-2 mb-3">
                                        {[
                                          'ok',
                                          'ok (toleransi)',
                                          'not ok',
                                          '-',
                                        ].map((option, optionIndex) => (
                                          <label
                                            key={optionIndex}
                                            className="flex items-center gap-2 cursor-pointer text-xs"
                                          >
                                            <input
                                              onChange={(e) => {
                                                handleChangePointDefect(
                                                  e,
                                                  index,
                                                  i,
                                                );
                                                if (
                                                  e.target.value == 'not ok'
                                                ) {
                                                  handleClickNotOke(i, true);
                                                } else {
                                                  handleClickNotOke(i, false);
                                                }
                                              }}
                                              type="radio"
                                              value={option}
                                              name={`hasil ${i}`}
                                              className="w-3 h-3"
                                            />
                                            {option !== '-' && (
                                              <img
                                                src={
                                                  option === 'ok'
                                                    ? ok
                                                    : option ===
                                                      'ok (toleransi)'
                                                    ? oktole
                                                    : notok
                                                }
                                                alt={option}
                                                className="w-3 h-3"
                                              />
                                            )}
                                            <span className="font-medium capitalize">
                                              {option}
                                            </span>
                                          </label>
                                        ))}
                                      </div>
                                    ) : null}

                                    {/* Additional fields for NOT OK status */}
                                    {showNotOk[i] == true &&
                                      data.status == 'on progress' && (
                                        <div className="space-y-2">
                                          <input
                                            type="text"
                                            name="jumlah_defect"
                                            placeholder="Jumlah Defect"
                                            onChange={(e) =>
                                              handleChangePointHasil(
                                                e,
                                                index,
                                                i,
                                                data2.kode,
                                              )
                                            }
                                            className="w-full text-xs p-2 border border-gray-300 rounded focus:border-red-500 focus:outline-none"
                                          />

                                          <select
                                            name="kode_lkh"
                                            onChange={(e) =>
                                              handleChangePointHasil(
                                                e,
                                                index,
                                                i,
                                                data2.kode,
                                              )
                                            }
                                            className="w-full text-xs p-2 border border-gray-300 rounded focus:border-red-500 focus:outline-none"
                                            defaultValue=""
                                          >
                                            <option value="">
                                              Pilih Kendala
                                            </option>
                                            {getWasteOptions &&
                                              getWasteOptions(data2.kode).map(
                                                (kendala: any) => (
                                                  <option
                                                    key={kendala.i_kendala}
                                                    value={kendala.kode_kendala}
                                                  >
                                                    {kendala.kode_kendala} -{' '}
                                                    {kendala.kendala_desc}
                                                  </option>
                                                ),
                                              )}
                                          </select>

                                          <input
                                            type="number"
                                            name="jumlah_up_defect"
                                            placeholder="Jumlah UP Defect"
                                            onChange={(e) =>
                                              handleChangePointHasil(
                                                e,
                                                index,
                                                i,
                                                data2.kode,
                                              )
                                            }
                                            className="w-full text-xs p-2 border border-gray-300 rounded focus:border-red-500 focus:outline-none"
                                          />

                                          {/* Image Upload Section */}
                                          <div className="space-y-2">
                                            <label className="text-xs font-semibold text-gray-700">
                                              Upload Gambar:
                                            </label>

                                            {data2?.file ? (
                                              <div className="space-y-2">
                                                <div className="relative">
                                                  <img
                                                    src={`${
                                                      import.meta.env
                                                        .VITE_API_LINK
                                                    }/images/${data2.file}`}
                                                    alt="Uploaded"
                                                    className="w-full h-16 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                                                    onClick={() =>
                                                      openFullscreen(
                                                        `${
                                                          import.meta.env
                                                            .VITE_API_LINK
                                                        }/images/${data2.file}`,
                                                      )
                                                    }
                                                  />
                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      handleImageDelete(
                                                        index,
                                                        i,
                                                      )
                                                    }
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs hover:bg-red-600"
                                                  >
                                                    ×
                                                  </button>
                                                </div>
                                                <label className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 rounded cursor-pointer block text-center">
                                                  Change Image
                                                  <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                      const file =
                                                        e.target.files?.[0];
                                                      if (file) {
                                                        if (
                                                          !file.type.startsWith(
                                                            'image/',
                                                          )
                                                        ) {
                                                          alert(
                                                            'Please select an image file',
                                                          );
                                                          return;
                                                        }
                                                        if (
                                                          file.size >
                                                          5 * 1024 * 1024
                                                        ) {
                                                          alert(
                                                            'File size must be less than 5MB',
                                                          );
                                                          return;
                                                        }
                                                        handleImageDelete(
                                                          index,
                                                          i,
                                                        ).then(() => {
                                                          handleImageUpload(
                                                            file,
                                                            index,
                                                            i,
                                                          );
                                                        });
                                                      }
                                                      e.target.value = '';
                                                    }}
                                                  />
                                                </label>
                                              </div>
                                            ) : (
                                              <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                  const file =
                                                    e.target.files?.[0];
                                                  if (file) {
                                                    if (
                                                      !file.type.startsWith(
                                                        'image/',
                                                      )
                                                    ) {
                                                      alert(
                                                        'Please select an image file',
                                                      );
                                                      return;
                                                    }
                                                    if (
                                                      file.size >
                                                      5 * 1024 * 1024
                                                    ) {
                                                      alert(
                                                        'File size must be less than 5MB',
                                                      );
                                                      return;
                                                    }
                                                    handleImageUpload(
                                                      file,
                                                      index,
                                                      i,
                                                    );
                                                  }
                                                  e.target.value = '';
                                                }}
                                                className="w-full text-xs border border-gray-300 rounded p-1"
                                              />
                                            )}

                                            {uploading && (
                                              <div className="text-xs text-blue-600">
                                                Uploading...
                                              </div>
                                            )}
                                            {uploadError && (
                                              <div className="text-xs text-red-600">
                                                {uploadError}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )}

                                    {/* Display fields for completed NOT OK status */}
                                    {data.status == 'done' &&
                                      data2.hasil == 'not ok' && (
                                        <div className="space-y-2">
                                          <input
                                            type="text"
                                            defaultValue={formatInteger(
                                              parseInt(data2.jumlah_defect),
                                            )}
                                            disabled
                                            className="w-full text-xs p-2 border border-gray-300 rounded bg-gray-100"
                                          />

                                          {data2.kode_lkh && (
                                            <input
                                              type="text"
                                              defaultValue={`${
                                                data2.kode_lkh
                                              } - ${data2.masalah_lkh || ''}`}
                                              disabled
                                              className="w-full text-xs p-2 border border-gray-300 rounded bg-gray-100"
                                            />
                                          )}

                                          {data2.jumlah_up_defect && (
                                            <input
                                              type="text"
                                              defaultValue={formatInteger(
                                                parseInt(
                                                  data2.jumlah_up_defect,
                                                ),
                                              )}
                                              disabled
                                              className="w-full text-xs p-2 border border-gray-300 rounded bg-gray-100"
                                            />
                                          )}

                                          {data2.file && (
                                            <>
                                              <div>
                                                <label className="text-xs font-semibold text-gray-700 block mb-1">
                                                  Gambar:
                                                </label>
                                                <img
                                                  src={`${
                                                    import.meta.env
                                                      .VITE_API_LINK
                                                  }/images/${data2.file}`}
                                                  alt="File"
                                                  className="w-full h-16 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                                                  onClick={() => openFullscreen}
                                                  onError={(e) => {
                                                    e.currentTarget.style.display =
                                                      'none';
                                                  }}
                                                />
                                              </div>

                                              {/* Full Screen Modal */}
                                              {isFullscreen && (
                                                <div
                                                  className="fixed inset-0 bg-black bg-opacity-90 z-50 overflow-auto"
                                                  onClick={closeFullscreen}
                                                >
                                                  <div className="relative w-full min-h-screen flex justify-center p-4">
                                                    <img
                                                      src={`${
                                                        import.meta.env
                                                          .VITE_API_LINK
                                                      }/images/${data2.file}`}
                                                      alt="File"
                                                      className="max-w-full h-auto block"
                                                      onClick={(e) =>
                                                        e.stopPropagation()
                                                      } // Prevent closing when clicking on image
                                                    />
                                                    <button
                                                      className="fixed top-4 right-4 text-white bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-70 transition-colors text-xl font-bold"
                                                      onClick={closeFullscreen}
                                                    >
                                                      ×
                                                    </button>
                                                  </div>
                                                </div>
                                              )}
                                            </>
                                          )}
                                        </div>
                                      )}
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Modal for Adding Problem Code */}
                    {showDetail[index] == true && (
                      <ModalAddPeriode
                        isOpen={showDetail[index]}
                        onClose={() => handleClickAdd(index)}
                        judul={'ADD PROBLEM CODE'}
                      >
                        <div className="flex flex-col gap-4 p-4">
                          <div>
                            <label className="text-gray-800 font-semibold text-sm block mb-1">
                              Kode <span className="text-red-500">*</span>
                            </label>
                            <input
                              onChange={(e) => setKode(e.target.value)}
                              type="text"
                              className="w-full text-sm p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-gray-800 font-semibold text-sm block mb-1">
                              Masalah <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              onChange={(e) => setMasalah(e.target.value)}
                              className="w-full text-sm p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-gray-800 text-sm font-semibold block mb-1">
                              Kriteria
                            </label>
                            <select
                              onChange={(e) => setKriteria(e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                            >
                              <option value="" disabled selected>
                                Pilih kriteria
                              </option>
                              <option value="critical">Critical</option>
                              <option value="major">Major</option>
                              <option value="minor">Minor</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-gray-800 text-sm font-semibold block mb-1">
                              % Kriteria
                            </label>
                            <input
                              onChange={(e) =>
                                setPersenKriteria(e.target.value)
                              }
                              type="text"
                              className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-gray-800 text-sm font-semibold block mb-1">
                              Sumber Masalah
                            </label>
                            <select
                              onChange={(e) => setSumberMasalah(e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                            >
                              <option value="" disabled selected>
                                Pilih Sumber Masalah
                              </option>
                              <option value="Mesin">Mesin</option>
                              <option value="Man">Man</option>
                              <option value="Material">Material</option>
                              <option value="Persiapan">Persiapan</option>
                              <option value="Design">Design</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-gray-800 text-sm font-semibold block mb-2">
                              Tujuan Department
                            </label>
                            {Department?.map((dt: any, indx: number) => (
                              <div key={indx} className="flex gap-2 mb-2">
                                <select
                                  onChange={(e) =>
                                    handleChangePointDepatment(e, indx)
                                  }
                                  defaultValue={dt.department}
                                  className="flex-1 p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                                >
                                  <option value="" disabled>
                                    Pilih Tujuan Department
                                  </option>
                                  {DataDepartment?.map(
                                    (dataDef: any, indexDepartment: number) => (
                                      <option
                                        key={indexDepartment}
                                        value={dataDef.id}
                                      >
                                        {dataDef.name}
                                      </option>
                                    ),
                                  )}
                                </select>
                                <button
                                  onClick={() =>
                                    handleDeletePointDepartment(indx)
                                  }
                                  className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-md"
                                >
                                  X
                                </button>
                              </div>
                            ))}

                            <button
                              onClick={() => handleAddPointDepartment()}
                              className="w-full mb-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm rounded-md"
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
                                );
                                console.log(data.id);
                              }}
                              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-md"
                            >
                              TAMBAH MASALAH
                            </button>
                          </div>
                        </div>
                      </ModalAddPeriode>
                    )}

                    {/* Notes Section */}
                    <div className="border-t-8 border-blue-100 bg-gray-50">
                      <div className="p-4">
                        <label className="text-gray-800 text-sm font-semibold block mb-2">
                          Catatan Periode {index + 1}
                        </label>
                        {data.status == 'done' ? (
                          <textarea
                            readOnly
                            value={data.catatan}
                            className="w-full min-h-[80px] p-3 border border-gray-300 rounded-md bg-white resize-none focus:border-blue-500 focus:outline-none"
                          />
                        ) : (
                          <textarea
                            onChange={(e) => setcttPeriode(e.target.value)}
                            className="w-full min-h-[80px] p-3 border border-gray-300 rounded-md bg-white resize-none focus:border-blue-500 focus:outline-none"
                            placeholder="Masukkan catatan untuk periode ini..."
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              },
            )}
            {/* Summary Section for All Periods - Not OK Defects */}
            <div className="border-8 border-red-300 bg-red-50 mt-4">
              <div className="px-4 py-4">
                {(() => {
                  // Calculate all not ok defects across all periods
                  const allNotOkDefects =
                    CoatingMesinPeriode?.inspeksi_coating_result_periode?.flatMap(
                      (period: any) =>
                        period.inspeksi_coating_result_point_periode.filter(
                          (defect: any) => defect.hasil === 'not ok',
                        ),
                    ) || [];

                  // Group by kode and sum jumlah_defect and jumlah_up_defect with improved logic
                  const groupedDefects = allNotOkDefects.reduce(
                    (acc: any, defect: any) => {
                      const key = defect.kode;
                      if (!acc[key]) {
                        acc[key] = {
                          kode: defect.kode,
                          masalah: defect.masalah,
                          totalDefect: 0,
                          totalUpDefect: 0,
                          periods: [],
                        };
                      }

                      // Improved defect counting logic
                      let defectValue = 0;
                      if (
                        defect.jumlah_defect !== null &&
                        defect.jumlah_defect !== undefined &&
                        defect.jumlah_defect !== ''
                      ) {
                        defectValue =
                          parseInt(
                            String(defect.jumlah_defect).replace(/[^0-9]/g, ''),
                          ) || 1;
                      } else if (defect.hasil === 'not ok') {
                        defectValue = 1;
                      }

                      // UP defect counting logic
                      let upDefectValue = 0;
                      if (
                        defect.jumlah_up_defect !== null &&
                        defect.jumlah_up_defect !== undefined &&
                        defect.jumlah_up_defect !== ''
                      ) {
                        upDefectValue =
                          parseInt(
                            String(defect.jumlah_up_defect).replace(
                              /[^0-9]/g,
                              '',
                            ),
                          ) || 0;
                      }

                      acc[key].totalDefect += defectValue;
                      acc[key].totalUpDefect += upDefectValue;
                      acc[key].periods.push(defect);
                      return acc;
                    },
                    {},
                  );

                  const groupedArray = Object.values(groupedDefects);

                  const grandTotal = allNotOkDefects.reduce(
                    (sum: number, defect: any) => {
                      let defectValue = 0;
                      if (
                        defect.jumlah_defect !== null &&
                        defect.jumlah_defect !== undefined &&
                        defect.jumlah_defect !== ''
                      ) {
                        defectValue =
                          parseInt(
                            String(defect.jumlah_defect).replace(/[^0-9]/g, ''),
                          ) || 1;
                      } else if (defect.hasil === 'not ok') {
                        defectValue = 1;
                      }
                      return sum + defectValue;
                    },
                    0,
                  );

                  const grandTotalUp = allNotOkDefects.reduce(
                    (sum: number, defect: any) => {
                      let upDefectValue = 0;
                      if (
                        defect.jumlah_up_defect !== null &&
                        defect.jumlah_up_defect !== undefined &&
                        defect.jumlah_up_defect !== ''
                      ) {
                        upDefectValue =
                          parseInt(
                            String(defect.jumlah_up_defect).replace(
                              /[^0-9]/g,
                              '',
                            ),
                          ) || 0;
                      }
                      return sum + upDefectValue;
                    },
                    0,
                  );

                  return (
                    <>
                      {groupedArray.length > 0 ? (
                        <>
                          {/* Individual defect codes summary */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            {groupedArray.map(
                              (defectGroup: any, index: number) => (
                                <div
                                  key={index}
                                  className="bg-white p-4 rounded-lg border border-red-200 shadow-sm"
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                      <div className="text-sm font-bold text-gray-800">
                                        {defectGroup.kode}
                                      </div>
                                      <div className="text-xs text-gray-600 mt-1">
                                        {defectGroup.masalah}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-lg font-bold text-red-600">
                                        {formatInteger(defectGroup.totalDefect)}
                                      </div>
                                      <div className="text-sm font-semibold text-orange-600">
                                        Jumlah UP:{' '}
                                        {formatInteger(
                                          defectGroup.totalUpDefect,
                                        )}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {defectGroup.periods.length} Temuan
                                        {defectGroup.periods.length > 1
                                          ? ''
                                          : ''}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ),
                            )}
                          </div>

                          {/* Grand Total */}
                          <div className="bg-red-600 text-white p-4 rounded-lg shadow-lg">
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="text-lg font-bold">
                                  🚨 TOTAL NOT OK DEFECT (COATING)
                                </div>
                                <div className="text-sm opacity-90">
                                  {' '}
                                  {CoatingMesinPeriode
                                    ?.inspeksi_coating_result_periode?.length ||
                                    0}{' '}
                                  Periode
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-3xl font-bold">
                                  {formatInteger(grandTotal)}
                                </div>
                                <div className="text-lg font-semibold text-orange-200">
                                  Jumlah UP: {formatInteger(grandTotalUp)}
                                </div>
                                <div className="text-sm opacity-90">
                                  Total Defects
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Detailed breakdown by period */}
                          <div className="mt-4">
                            <h3 className="text-red-600 text-md font-bold mb-2">
                              📋 Breakdown by Period:
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                              {CoatingMesinPeriode?.inspeksi_coating_result_periode?.map(
                                (period: any, periodIndex: number) => {
                                  const periodNotOk =
                                    period.inspeksi_coating_result_point_periode.filter(
                                      (defect: any) =>
                                        defect.hasil === 'not ok',
                                    );

                                  // Check if there are any "not ok" defects, regardless of jumlah_defect value
                                  const hasNotOkDefects =
                                    periodNotOk.length > 0;

                                  const periodTotal = periodNotOk.reduce(
                                    (sum: number, defect: any) => {
                                      // Handle various formats of jumlah_defect
                                      let defectValue = 0;
                                      if (
                                        defect.jumlah_defect !== null &&
                                        defect.jumlah_defect !== undefined &&
                                        defect.jumlah_defect !== ''
                                      ) {
                                        defectValue =
                                          parseInt(
                                            String(
                                              defect.jumlah_defect,
                                            ).replace(/[^0-9]/g, ''),
                                          ) || 1; // Default to 1 if parsing fails but field exists
                                      } else if (defect.hasil === 'not ok') {
                                        defectValue = 1; // If marked as "not ok" but no quantity, count as 1
                                      }
                                      return sum + defectValue;
                                    },
                                    0,
                                  );

                                  const periodUpTotal = periodNotOk.reduce(
                                    (sum: number, defect: any) => {
                                      // Handle various formats of jumlah_up_defect
                                      let upDefectValue = 0;
                                      if (
                                        defect.jumlah_up_defect !== null &&
                                        defect.jumlah_up_defect !== undefined &&
                                        defect.jumlah_up_defect !== ''
                                      ) {
                                        upDefectValue =
                                          parseInt(
                                            String(
                                              defect.jumlah_up_defect,
                                            ).replace(/[^0-9]/g, ''),
                                          ) || 0;
                                      }
                                      return sum + upDefectValue;
                                    },
                                    0,
                                  );

                                  return (
                                    <div
                                      key={periodIndex}
                                      className={`p-3 rounded border ${
                                        hasNotOkDefects
                                          ? 'bg-red-100 border-red-300'
                                          : 'bg-green-100 border-green-300'
                                      }`}
                                    >
                                      <div className="flex justify-between items-center">
                                        <span className="text-sm font-semibold">
                                          Period {periodIndex + 1}
                                        </span>
                                        <div className="text-right">
                                          <div
                                            className={`text-sm font-bold ${
                                              hasNotOkDefects
                                                ? 'text-red-600'
                                                : 'text-green-600'
                                            }`}
                                          >
                                            {hasNotOkDefects
                                              ? `${formatInteger(
                                                  periodTotal,
                                                )} (${
                                                  periodNotOk.length
                                                } issues)`
                                              : '✓ OK'}
                                          </div>
                                          {hasNotOkDefects &&
                                            periodUpTotal > 0 && (
                                              <div className="text-xs font-semibold text-orange-600">
                                                Jumlah UP:{' '}
                                                {formatInteger(periodUpTotal)}
                                              </div>
                                            )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                },
                              )}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="bg-green-100 p-6 rounded-lg border border-green-300 text-center">
                          <div className="text-2xl mb-2">✅</div>
                          <div className="text-green-700 font-bold text-lg">
                            Tidak Ada Defect Not OK ditemukan pada Coating
                            Periode
                          </div>
                          <div className="text-green-600 text-sm mt-2">
                            Semua hasil inspeksi coating dalam kondisi baik
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
          {!isOnprogres &&
          CoatingMesinPeriode?.inspeksi_coating_sub_periode[0].status !=
            'history' ? (
            <>
              {!isFailed ? (
                <>
                  <button
                    disabled={isLoading}
                    onClick={() =>
                      tambahTaskCekPeriode(CoatingMesinPeriode?.id)
                    }
                    className=" w-[16%] h-10 rounded-sm bg-blue-600 text-white text-sm font-bold justify-center items-center px-4 py-2 hover:cursor-pointer"
                  >
                    {isLoading ? 'Loading...' : '+ Periode Check'}
                  </button>
                </>
              ) : (
                <>
                  <button className=" w-[16%] h-10 rounded-sm bg-blue-600 text-white text-sm font-bold justify-center items-center px-4 py-2 hover:cursor-pointer">
                    Refresh Halaman
                  </button>
                </>
              )}
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
            <div className="grid col-span-6">
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
            {CoatingMesinPeriode?.inspeksi_coating_sub_periode[0].status !=
            'history' ? (
              <div className="text-neutral-500 gap-2 items-start justify-start flex flex-col text-sm font-semibold col-span-2">
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <label className="text-neutral-500 flex flex-col text-sm font-semibold">
                      Sample 1
                    </label>
                    <input
                      required
                      onChange={(e) => {
                        const newValue = parseFloat(e.target.value);
                        setSample1Value(newValue);
                        const result = (newValue / 100) * 10000;
                        setResult1(result);
                      }}
                      type="text"
                      className="border-2 border-stroke w-[40%] rounded-sm col-span-2"
                    />
                    <div>gr</div>
                  </div>
                  <div>
                    ={' '}
                    <input
                      name="hasilsample1"
                      disabled
                      value={result1}
                      type="text"
                      className="border-2 border-stroke w-[40%] rounded-sm col-span-2"
                    />{' '}
                    g/m<sup className="">2</sup>
                  </div>
                </div>
                <div className="flex gap-2 flex-col">
                  <div className="flex gap-2">
                    <label className="text-neutral-500 flex flex-col text-sm font-semibold">
                      Sample 2
                    </label>
                    <input
                      required
                      onChange={(e) => {
                        const newValue = parseFloat(e.target.value);
                        setSample2Value(newValue);
                        const result = (newValue / 100) * 10000;
                        setResult2(result);
                      }}
                      type="text"
                      className="border-2 border-stroke w-[40%] rounded-sm col-span-2"
                    />
                    <div>gr</div>
                  </div>
                  <div>
                    ={' '}
                    <input
                      name="hasilsample2"
                      disabled
                      value={result2}
                      type="text"
                      className="border-2 border-stroke w-[40%] rounded-sm col-span-2"
                    />{' '}
                    g/m<sup className="">2</sup>
                  </div>
                </div>
                <div className="flex gap-2 flex-col">
                  <div className="flex gap-2">
                    <label className="text-neutral-500 flex flex-col text-sm font-semibold">
                      Sample 3
                    </label>
                    <input
                      required
                      onChange={(e) => {
                        const newValue = parseFloat(e.target.value);
                        setSample3Value(newValue);

                        const result = (newValue / 100) * 10000;
                        setResult3(result);
                      }}
                      type="text"
                      className="border-2 border-stroke w-[40%] rounded-sm col-span-2"
                    />
                    <div>gr</div>
                  </div>
                  <div>
                    ={' '}
                    <input
                      name="hasilsample3"
                      disabled
                      value={result3}
                      type="text"
                      className="border-2 border-stroke w-[40%] rounded-sm col-span-2"
                    />{' '}
                    g/m<sup className="">2</sup>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-neutral-500 gap-2 items-start justify-start flex flex-col text-sm font-semibold col-span-2">
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <label className="text-neutral-500 flex flex-col text-sm font-semibold">
                      Sample 1
                    </label>
                    <input
                      readOnly
                      value={
                        CoatingMesinPeriode?.inspeksi_coating_sub_periode[0]
                          ?.sample_1
                      }
                      type="text"
                      className="border-2 border-stroke w-[40%] rounded-sm col-span-2"
                    />
                    <div>gr</div>
                  </div>
                  <div>
                    ={' '}
                    <input
                      name="hasilsample1"
                      disabled
                      value={
                        CoatingMesinPeriode?.inspeksi_coating_sub_periode[0]
                          ?.hasil_sample_1
                      }
                      type="text"
                      className="border-2 border-stroke w-[40%] rounded-sm col-span-2"
                    />{' '}
                    g/m<sup className="">2</sup>
                  </div>
                </div>
                <div className="flex gap-2 flex-col">
                  <div className="flex gap-2">
                    <label className="text-neutral-500 flex flex-col text-sm font-semibold">
                      Sample 2
                    </label>
                    <input
                      readOnly
                      value={
                        CoatingMesinPeriode?.inspeksi_coating_sub_periode[0]
                          ?.sample_2
                      }
                      type="text"
                      className="border-2 border-stroke w-[40%] rounded-sm col-span-2"
                    />
                    <div>gr</div>
                  </div>
                  <div>
                    ={' '}
                    <input
                      name="hasilsample2"
                      disabled
                      value={
                        CoatingMesinPeriode?.inspeksi_coating_sub_periode[0]
                          ?.hasil_sample_2
                      }
                      type="text"
                      className="border-2 border-stroke w-[40%] rounded-sm col-span-2"
                    />{' '}
                    g/m<sup className="">2</sup>
                  </div>
                </div>
                <div className="flex gap-2 flex-col">
                  <div className="flex gap-2">
                    <label className="text-neutral-500 flex flex-col text-sm font-semibold">
                      Sample 3
                    </label>
                    <input
                      readOnly
                      value={
                        CoatingMesinPeriode?.inspeksi_coating_sub_periode[0]
                          ?.sample_3
                      }
                      type="text"
                      className="border-2 border-stroke w-[40%] rounded-sm col-span-2"
                    />
                    <div>gr</div>
                  </div>
                  <div>
                    ={' '}
                    <input
                      name="hasilsample3"
                      disabled
                      value={
                        CoatingMesinPeriode?.inspeksi_coating_sub_periode[0]
                          ?.hasil_sample_3
                      }
                      type="text"
                      className="border-2 border-stroke w-[40%] rounded-sm col-span-2"
                    />{' '}
                    g/m<sup className="">2</sup>
                  </div>
                </div>
              </div>
            )}
            <div className="grid col-span-2 items-end justify-end gap-2">
              {!isOnprogres && CoatingMesinPeriode?.status == 'incoming' ? (
                <button
                  onClick={() => openModalPending()}
                  className=" w-full h-10 rounded-md bg-red-600 text-white text-xs font-bold justify-center items-center px-10 py-2 hover:cursor-pointer"
                >
                  PENDING
                </button>
              ) : null}
              {showPending == true && (
                <>
                  <ModalKosonganSmall
                    isOpen={showPending}
                    onClose={() => closeModalPending()}
                    judul={'Alasan Pending'}
                  >
                    <>
                      <div className="flex flex-col gap-2 px-4 py-4">
                        <div className="flex gap-2 flex-col w-full">
                          <input
                            onChange={(e) => setalasanPending(e.target.value)}
                            type="text"
                            className="border-2 border-stroke w-full rounded-sm col-span-2 h-10"
                          />
                        </div>
                        <button
                          onClick={() =>
                            pendingCekAwal(CoatingMesinPeriode?.id)
                          }
                          className=" w-full h-10 rounded-md bg-red-600 text-white text-xs font-bold justify-center items-center px-10 py-2 hover:cursor-pointer"
                        >
                          PENDING
                        </button>
                      </div>
                    </>
                  </ModalKosonganSmall>
                </>
              )}
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
