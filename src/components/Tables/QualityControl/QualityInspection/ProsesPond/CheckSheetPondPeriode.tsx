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
import ModalKosonganSmall from '../../../../Modals/ModalKosonganSmall';

function CheckSheetPondPeriode() {
  const { id } = useParams();
  const [cttPeriode, setcttPeriode] = useState<any>();
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pondMesinPeriode, setPondMesinPeriode] = useState<any>();
  const [pondMesinPeriodeDefect, setPondMesinPeriodeDefect] = useState<any>();
  const [catatan, setCatatan] = useState<any>();
  const [kode, setKode] = useState<any>();
  const [masalah, setMasalah] = useState<any>();
  const [kriteria, setKriteria] = useState<any>();
  const [persenKriteria, setPersenKriteria] = useState<any>();
  const [sumberMasalah, setSumberMasalah] = useState<any>();

  const [pondMesinPeriodeHistory, setpondMesinPeriodeHistory] = useState<any>();
  const [DataDepartment, setDataDepartment] = useState<any>();

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
    getPondMesinPeriode();
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
    }/api/list-kendala?criteria=true&proses=7`;

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

  async function getPondMesinPeriode() {
    const url = `${import.meta.env.VITE_API_LINK}/qc/cs/inspeksiPond/${id}`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        withCredentials: true,
      });
      setIsLoading(false);
      setPondMesinPeriode(res.data.data);
      setPondMesinPeriodeDefect(res.data.defect);
      setpondMesinPeriodeHistory(res.data.history);
      console.log(res.data.data);
    } catch (error: any) {
      alert('Gagal Memannggil Data, Coba Refresh Halaman!');
      console.log(error.data.msg);
    }
  }

  async function startTaskCekPeriode(id: number) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiPondPeriodePoint/start/${id}`;
    try {
      setIsLoading(true);
      const res = await axios.put(
        url,
        {},
        {
          withCredentials: true,
        },
      );
      getPondMesinPeriode();
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
      }/qc/cs/inspeksiPondPeriodePoint/delete/${id}`;
      try {
        setIsLoading(true);
        const res = await axios.delete(
          url,

          {
            withCredentials: true,
          },
        );
        getPondMesinPeriode();
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
    data_defect: any,
  ) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiPondPeriodePoint/stop/${id}`;
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
          data_defect: data_defect,
        },
        {
          withCredentials: true,
        },
      );
      setcttPeriode(null);
      getPondMesinPeriode();
      setIsLoading(false);
    } catch (error: any) {
      console.log(error);
      setIsLoading(false);
    }
  }

  async function tambahTaskCekPeriode(id: number) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiPondPeriodePoint/create`;
    try {
      setIsLoading(true);
      const res = await axios.post(
        url,
        {
          id_inspeksi_pond_periode: id,
          masterKodePond: masterKode,
        },
        {
          withCredentials: true,
        },
      );
      getPondMesinPeriode();
      setIsLoading(false);
    } catch (error: any) {
      console.log(error.data.msg);
      setIsLoading(false);
    }
  }

  async function tambahDefectPeriode(
    id: number,
    idPond: any,
    kode: any,
    masalah: any,
    kriteria: any,
    persenKriteria: any,
    sumberMasalah: any,
    index: number,
  ) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiPondPeriodePoint/createDefect`;
    try {
      setIsLoading(true);
      const res = await axios.post(
        url,

        {
          id_inspeksi_pond_periode_point: id,
          id_inspeksi_pond: idPond,
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
      setKriteria(null);
      setPersenKriteria(null);
      setSumberMasalah(null);
      setDepartment([
        {
          id: 0,
          department: '',
        },
      ]);
      getPondMesinPeriode();
      setIsLoading(false);
    } catch (error: any) {
      console.log(error);
      setIsLoading(false);
    }
  }
  const [alasanPending, setalasanPending] = useState<any>();

  async function pendingCekPeriode(id: number) {
    if (alasanPending == null) {
      alert('Catatan Wajib Diisi');
      return;
    }
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiPondPeriode/pending/${id}`;
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
      getPondMesinPeriode();
      setIsLoading(false);
    } catch (error: any) {
      console.log(error.data.msg);
      setIsLoading(false);
    }
  }
  const [showPending, setShowPending] = useState(false);
  const openModalPending = () => setShowPending(true);
  const closeModalPending = () => setShowPending(false);
  async function doneCekPeriode(id: number) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiPondPeriode/done/${id}`;
    try {
      setIsLoading(true);
      const res = await axios.put(
        url,
        { catatan: catatan },
        {
          withCredentials: true,
        },
      );

      getPondMesinPeriode();
      setIsLoading(false);
    } catch (error: any) {
      console.log(error);
      setIsLoading(false);
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
    ].inspeksi_pond_periode_defect[ii]['hasil'] = value;
    setPondMesinPeriode(onchangeVal);
  };

  const handleChangePointHasil = (
    e: any,
    i: number,
    ii: number,
    kodeData: string,
  ) => {
    const { name, value } = e.target;
    const onchangeVal: any = pondMesinPeriode;

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
        onchangeVal.inspeksi_pond_periode[0].inspeksi_pond_periode_point[
          i
        ].inspeksi_pond_periode_defect[ii]['kode_lkh'] = value;
        onchangeVal.inspeksi_pond_periode[0].inspeksi_pond_periode_point[
          i
        ].inspeksi_pond_periode_defect[ii]['masalah_lkh'] =
          selectedKendala.kendala_desc;
      }
    } else {
      onchangeVal.inspeksi_pond_periode[0].inspeksi_pond_periode_point[
        i
      ].inspeksi_pond_periode_defect[ii][name] = value;
    }

    setPondMesinPeriode(onchangeVal);
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

  // Image upload handler for specific defect
  const handleImageUpload = async (file: File, i: number, ii: number) => {
    try {
      const fileName = await handleFileUpload(file);
      const onchangeVal: any = pondMesinPeriode;
      onchangeVal.inspeksi_pond_periode[0].inspeksi_pond_periode_point[
        i
      ].inspeksi_pond_periode_defect[ii]['file'] = fileName;
      setPondMesinPeriode(onchangeVal);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  // Image delete handler for specific defect
  const handleImageDelete = async (i: number, ii: number) => {
    try {
      const currentFile =
        pondMesinPeriode.inspeksi_pond_periode[0].inspeksi_pond_periode_point[i]
          .inspeksi_pond_periode_defect[ii]?.file;

      if (currentFile) {
        await handleFileDelete(currentFile);
        const onchangeVal: any = pondMesinPeriode;
        onchangeVal.inspeksi_pond_periode[0].inspeksi_pond_periode_point[
          i
        ].inspeksi_pond_periode_defect[ii]['file'] = '';
        setPondMesinPeriode(onchangeVal);
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
  const tanggal = convertTimeStampToDateOnly(pondMesinPeriode?.createdAt);
  const jam = convertDateToTime(pondMesinPeriode?.createdAt);

  const tanggalHistory = convertTimeStampToDateOnly(
    pondMesinPeriodeHistory?.createdAt,
  );
  const jamHistory = convertDateToTime(pondMesinPeriodeHistory?.createdAt);

  const jumlahWaktuCheck = formatElapsedTime(
    pondMesinPeriode?.inspeksi_pond_awal[0].waktu_check,
  );

  const [filling, setFilling] = useState(false);

  const [showModal2, setShowModal2] = useState(false);
  const openModal2 = () => setShowModal2(true);
  const closeModal2 = () => setShowModal2(false);
  const isOnprogres =
    pondMesinPeriode?.inspeksi_pond_periode[0].inspeksi_pond_periode_point.some(
      (data: { status: any }) => data?.status === 'on progress',
    );

  const [showHistory, setShowHistory] = useState(false);
  const openModalHistory = () => setShowHistory(true);
  const closeModalHistory = () => setShowHistory(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState('');

  const openFullscreen = (imageUrl: string) => {
    setFullscreenImage(imageUrl);
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
                Ponding Checksheet
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
                              Jumlah Druk / Mata
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              Jumlah Pcs
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
                              : {tanggalHistory}
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              :{' '}
                              {formatInteger(
                                parseInt(pondMesinPeriodeHistory?.jumlah_druk),
                              )}{' '}
                              /{' '}
                              {formatInteger(
                                parseInt(pondMesinPeriodeHistory?.mata),
                              )}
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              :{' '}
                              {formatInteger(
                                parseInt(pondMesinPeriodeHistory?.jumlah_pcs),
                              )}
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              : {pondMesinPeriodeHistory?.ukuran_jadi}
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              : {pondMesinPeriodeHistory?.jenis_kertas}
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              : {pondMesinPeriodeHistory?.jenis_gramatur}
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
                              : {pondMesinPeriodeHistory?.no_jo}
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              : {pondMesinPeriodeHistory?.no_io}
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              : {pondMesinPeriodeHistory?.nama_produk}
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              : {pondMesinPeriodeHistory?.customer}
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
                              : {pondMesinPeriodeHistory?.shift}
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              :{pondMesinPeriodeHistory?.mesin}
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              : {pondMesinPeriodeHistory?.operator}
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              : {pondMesinPeriodeHistory?.status_jo}
                            </label>
                          </div>
                        </div>
                        {pondMesinPeriodeHistory?.inspeksi_pond_periode[0]?.inspeksi_pond_periode_point?.map(
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
                                  <div className="flex overflow-x-scroll max-w-screen border-b-8 border-[#D8EAFF] gap-1">
                                    {data.inspeksi_pond_periode_defect.map(
                                      (data2: any, i: number) => {
                                        return (
                                          <div
                                            className={`flex flex-col min-w-[200px] justify-center py-4 
                                            } items-center gap-2 
                                             ${
                                               data2.hasil == 'ok'
                                                 ? 'bg-blue-300'
                                                 : data2.hasil ==
                                                   'ok (toleransi)'
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
                                            <label className="text-center text-[#6c6b6b] text-sm font-semibold">
                                              {data2.jumlah_defect}
                                            </label>
                                          </div>
                                        );
                                      },
                                    )}
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
                  Jumlah Druk / Mata
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Jumlah Pcs
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
                  : {formatInteger(parseInt(pondMesinPeriode?.jumlah_druk))} /{' '}
                  {formatInteger(parseInt(pondMesinPeriode?.mata))}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {formatInteger(parseInt(pondMesinPeriode?.jumlah_pcs))}
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
                  : {pondMesinPeriode?.no_jo}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {pondMesinPeriode?.no_io}
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
                  : {pondMesinPeriode?.status_jo}
                </label>
              </div>
            </div>

            {pondMesinPeriode?.inspeksi_pond_periode[0].inspeksi_pond_periode_point?.map(
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
                                  {data.inspeksi_pond_periode_defect.map(
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
                      pondMesinPeriode?.status == 'incoming') ||
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
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

                        {/* Eye C and Task Status */}
                        <div className="flex flex-col justify-between">
                          {/* Task Status and Controls */}
                          <div className="flex flex-col gap-2">
                            <p className="text-xs text-gray-600">
                              Time: {lamaPengerjaan}
                            </p>

                            {data.status == 'incoming' &&
                            pondMesinPeriode?.status == 'incoming' ? (
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
                                      data.inspeksi_pond_periode_defect,
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
                            {data.inspeksi_pond_periode_defect.map(
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
                                            {getWasteOptions(data2.kode).map(
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

                                            {pondMesinPeriode
                                              .inspeksi_pond_periode[0]
                                              ?.inspeksi_pond_periode_point[
                                              index
                                            ]?.inspeksi_pond_periode_defect[i]
                                              ?.file ? (
                                              <div className="space-y-2">
                                                <div className="relative">
                                                  <img
                                                    src={`${
                                                      import.meta.env
                                                        .VITE_API_LINK
                                                    }/images/${
                                                      pondMesinPeriode
                                                        .inspeksi_pond_periode[0]
                                                        .inspeksi_pond_periode_point[
                                                        index
                                                      ]
                                                        .inspeksi_pond_periode_defect[
                                                        i
                                                      ].file
                                                    }`}
                                                    alt="Uploaded"
                                                    className="w-full h-16 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                                                    onClick={() =>
                                                      openFullscreen
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
                                                          }/images/${
                                                            data2.file
                                                          }`}
                                                          alt="File"
                                                          className="max-w-full h-auto block"
                                                          onClick={(e) =>
                                                            e.stopPropagation()
                                                          } // Prevent closing when clicking on image
                                                        />
                                                        <button
                                                          className="fixed top-4 right-4 text-white bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-70 transition-colors text-xl font-bold"
                                                          onClick={
                                                            closeFullscreen
                                                          }
                                                        >
                                                          ×
                                                        </button>
                                                      </div>
                                                    </div>
                                                  )}
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
                                  pondMesinPeriode?.id,
                                  kode,
                                  masalah,
                                  kriteria,
                                  persenKriteria,
                                  sumberMasalah,
                                  index,
                                );
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
                    pondMesinPeriode?.inspeksi_pond_periode[0]?.inspeksi_pond_periode_point?.flatMap(
                      (period: any) =>
                        period.inspeksi_pond_periode_defect.filter(
                          (defect: any) => defect.hasil === 'not ok',
                        ),
                    ) || [];

                  //// Group by kode and calculate defect * UP for each
                  const groupedDefects = allNotOkDefects.reduce(
                    (acc: any, defect: any) => {
                      const key = defect.kode;
                      if (!acc[key]) {
                        acc[key] = {
                          kode: defect.kode,
                          masalah: defect.masalah,
                          totalCalculatedDefect: 0, // This will store sum of (defect * UP)
                          totalDefect: 0, // Raw defect count
                          totalUpDefect: 0, // Raw UP count
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
                          ) || 0;
                      } else if (defect.hasil === 'not ok') {
                        defectValue = 0;
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

                      // Calculate defect * UP
                      const calculatedDefect = defectValue * upDefectValue;

                      acc[key].totalCalculatedDefect += calculatedDefect;
                      acc[key].totalDefect += defectValue;
                      acc[key].totalUpDefect += upDefectValue;
                      acc[key].periods.push({
                        ...defect,
                        calculatedDefect: calculatedDefect,
                      });
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
                          ) || 0;
                      } else if (defect.hasil === 'not ok') {
                        defectValue = 0;
                      }

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

                      return sum + defectValue * upDefectValue;
                    },
                    0,
                  );

                  // Keep separate totals for display purposes
                  const grandTotalRawDefects = allNotOkDefects.reduce(
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
                          ) || 0;
                      } else if (defect.hasil === 'not ok') {
                        defectValue = 0;
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
                                        (Temuan QC × Jumlah Up)
                                      </div>
                                      <div className="text-xs text-gray-600 mt-1">
                                        {defectGroup.masalah}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-lg font-bold text-red-600">
                                        {formatInteger(
                                          defectGroup.totalCalculatedDefect,
                                        )}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        (
                                        {formatInteger(defectGroup.totalDefect)}{' '}
                                        ×{' '}
                                        {formatInteger(
                                          defectGroup.totalUpDefect,
                                        )}
                                        )
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {defectGroup.periods.length} Temuan
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
                                  🚨 TOTAL TEMUAN DEFECT
                                </div>
                                <div className="text-sm opacity-90">
                                  {' '}
                                  {pondMesinPeriode?.inspeksi_pond_periode[0]
                                    ?.inspeksi_pond_periode_point?.length ||
                                    0}{' '}
                                  Periode (Temuan QC × Jumlah Up)
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-3xl font-bold">
                                  {formatInteger(grandTotal)}
                                </div>
                                <div className="text-sm opacity-90">
                                  ({formatInteger(grandTotalRawDefects)} ×{' '}
                                  {formatInteger(grandTotalUp)})
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
                              {pondMesinPeriode?.inspeksi_pond_periode[0]?.inspeksi_pond_periode_point?.map(
                                (period: any, periodIndex: number) => {
                                  const periodNotOk =
                                    period.inspeksi_pond_periode_defect.filter(
                                      (defect: any) =>
                                        defect.hasil === 'not ok',
                                    );

                                  // Check if there are any "not ok" defects, regardless of jumlah_defect value
                                  const hasNotOkDefects =
                                    periodNotOk.length > 0;

                                  // Calculate period total using defect * UP formula
                                  const periodCalculatedTotal =
                                    periodNotOk.reduce(
                                      (sum: number, defect: any) => {
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
                                            ) || 0;
                                        } else if (defect.hasil === 'not ok') {
                                          defectValue = 0;
                                        }

                                        let upDefectValue = 0;
                                        if (
                                          defect.jumlah_up_defect !== null &&
                                          defect.jumlah_up_defect !==
                                            undefined &&
                                          defect.jumlah_up_defect !== ''
                                        ) {
                                          upDefectValue =
                                            parseInt(
                                              String(
                                                defect.jumlah_up_defect,
                                              ).replace(/[^0-9]/g, ''),
                                            ) || 0;
                                        }

                                        return (
                                          sum + defectValue * upDefectValue
                                        );
                                      },
                                      0,
                                    );

                                  // Get raw totals for display
                                  const periodRawTotal = periodNotOk.reduce(
                                    (sum: number, defect: any) => {
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
                                          ) || 0;
                                      } else if (defect.hasil === 'not ok') {
                                        defectValue = 0;
                                      }
                                      return sum + defectValue;
                                    },
                                    0,
                                  );
                                  const periodUpTotal = periodNotOk.reduce(
                                    (sum: number, defect: any) => {
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
                                          Periode {periodIndex + 1}
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
                                                  periodCalculatedTotal,
                                                )}`
                                              : '✓ OK'}
                                          </div>
                                          {hasNotOkDefects && (
                                            <div className="text-xs text-gray-600">
                                              ({formatInteger(periodRawTotal)} ×{' '}
                                              {formatInteger(periodUpTotal)})
                                            </div>
                                          )}
                                          {hasNotOkDefects && (
                                            <div className="text-xs text-gray-500">
                                              {periodNotOk.length} Temuan
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
                            Tidak Ada Defect Not OK ditemukan
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
          {(!isOnprogres &&
            pondMesinPeriode?.inspeksi_pond_periode[0].status == 'incoming') ||
          pondMesinPeriode?.inspeksi_pond_periode[0].status == 'pending' ? (
            <>
              {!isFailed ? (
                <>
                  <button
                    disabled={isLoading}
                    onClick={() =>
                      tambahTaskCekPeriode(
                        pondMesinPeriode?.inspeksi_pond_periode[0].id,
                      )
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
            <div className="grid col-span-2 items-end justify-end gap-2">
              {!isOnprogres && pondMesinPeriode?.status == 'incoming' ? (
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
                            pendingCekPeriode(
                              pondMesinPeriode?.inspeksi_pond_periode[0].id,
                            )
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
              {(!isOnprogres &&
                pondMesinPeriode?.inspeksi_pond_periode[0].status ==
                  'incoming') ||
              pondMesinPeriode?.inspeksi_pond_periode[0].status == 'pending' ? (
                <button
                  onClick={() => {
                    doneCekPeriode(
                      pondMesinPeriode?.inspeksi_pond_periode[0].id,
                    );
                    console.log(pondMesinPeriode?.inspeksi_pond_periode[0]);
                  }}
                  className=" w-full h-10 rounded-sm bg-[#00B81D] text-white text-xs font-bold justify-center items-center px-10 py-2 hover:cursor-pointer"
                >
                  CHECKSHEET SELESAI
                </button>
              ) : null}

              {/* ) : null} */}
            </div>
            {/* {pondMesinPeriodeDefect?.map((data: any, index: number) => {
              return (
                <div className="">
                  <label>kode: </label>
                  <label>{data.kode}</label>
                  <label>Persen kriteria: </label>
                  <label>{data.persen_kriteria}</label>
                  <label>Total Defect: </label>
                  <label>{formatInteger(parseInt(data.total_defect))}</label>
                </div>
              );
            })} */}
          </div>
        </main>
      )}
    </>
  );
}

export default CheckSheetPondPeriode;
