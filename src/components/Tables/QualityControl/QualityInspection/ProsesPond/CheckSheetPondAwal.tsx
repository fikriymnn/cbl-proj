import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import convertTimeStampToDateOnly from '../../../../../utils/convertDateOnly';
import convertDateToTime from '../../../../../utils/converDateToTime';
import calculateElapsedTime from '../../../../../utils/calculateElapsedTime';
import formatElapsedTime from '../../../../../utils/formatElapsedTime';
import Loading from '../../../../Loading';
import ModalKosongan from '../../../../Modals/Qc/NCR/NCRResponQC';
import formatInteger from '../../../../../utils/formaterInteger';
import ModalKosonganSmall from '../../../../Modals/ModalKosonganSmall';

function CheckSheetPondAwal() {
  const { id } = useParams();

  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [pondMesinAwal, setPondMesinAwal] = useState<any>();
  const [pondMesinAwalHistory, setpondMesinAwalHistory] = useState<any>();
  const [masterKode, setMasterKode] = useState<any>();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  useEffect(() => {
    getPondMesinAwal();
    getMasterKode();
  }, []);

  async function getMasterKode() {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/master/produksi/wasteAllKendalaFormating?proses=6`;

    try {
      const res = await axios.get(url);

      setMasterKode(res);

      console.log(res);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }
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

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setUploadError('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setUploadError('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      setUploadError('');

      const previewUrl = URL.createObjectURL(file);
      setFilePreview(previewUrl);
    }
  }

  function clearFileSelection(): void {
    setSelectedFile(null);
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview(null);
    }
    setUploadError('');
  }
  async function getPondMesinAwal() {
    const url = `${import.meta.env.VITE_API_LINK}/qc/cs/inspeksiPond/${id}`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      setPondMesinAwal(res.data.data);
      setpondMesinAwalHistory(res.data.history);
      console.log(res.data.data);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }
  const handleChangePoint = (e: any, i: number) => {
    const { name, value } = e.target;
    const onchangeVal: any = pondMesinAwal;
    onchangeVal.inspeksi_pond_awal[0].inspeksi_pond_awal_point[i][name] = value;
    setPondMesinAwal(onchangeVal);
  };
  async function startTaskCekAwal(id: number) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiPondAwalPoint/start/${id}`;
    try {
      const res = await axios.put(
        url,
        {},
        {
          withCredentials: true,
        },
      );

      getPondMesinAwal();
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
    register: any,
    ketajaman: any,
    ukuran: any,
    bentuk_jadi: any,
    riil: any,
    reforasi: any,
  ) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiPondAwalPoint/stop/${id}`;
    try {
      const elapsedSeconds = calculateElapsedTime(startTime, new Date());
      console.log(elapsedSeconds);
      // Handle file upload if a file is selected
      let uploadedFileName = '';
      if (selectedFile) {
        try {
          uploadedFileName = await handleFileUpload(selectedFile);
        } catch (error) {
          alert('Failed to upload image. Please try again.');
          return;
        }
      }
      const res = await axios.put(
        url,
        {
          catatan: catatan,
          lama_pengerjaan: elapsedSeconds,
          line_clearance: line_clearance,
          register: register,
          ketajaman: ketajaman,
          ukuran: ukuran,
          bentuk_jadi: bentuk_jadi,
          riil: riil,
          reforasi: reforasi,
          file: uploadedFileName,
        },
        {
          withCredentials: true,
        },
      );

      getPondMesinAwal();
    } catch (error: any) {
      console.log(error.response.data.msg);
    }
  }

  async function tambahTaskCekAwal(id: number) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiPondAwalPoint/create`;
    try {
      setIsLoading(true);
      const res = await axios.post(
        url,
        {
          id_inspeksi_pond_awal: id,
        },
        {
          withCredentials: true,
        },
      );
      setIsLoading(false);
      getPondMesinAwal();
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  async function doneCekAwal(id: number) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiPondAwal/done/${id}`;
    try {
      const res = await axios.put(
        url,
        {
          id_inspeksi_pond_awal: id,
          masterKodePond: masterKode,
        },
        {
          withCredentials: true,
        },
      );

      getPondMesinAwal();
    } catch (error: any) {
      console.log(error.data.msg);
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
    }/qc/cs/inspeksiPondAwal/pending/${id}`;
    try {
      const res = await axios.put(
        url,
        { alasan_pending: alasanPending },
        {
          withCredentials: true,
        },
      );
      closeModalPending();
      getPondMesinAwal();
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }
  const [showPending, setShowPending] = useState(false);
  const openModalPending = () => setShowPending(true);
  const closeModalPending = () => setShowPending(false);
  const tanggal = convertTimeStampToDateOnly(pondMesinAwal?.createdAt);
  const jam = convertDateToTime(pondMesinAwal?.createdAt);

  const tanggalHistory = convertTimeStampToDateOnly(
    pondMesinAwalHistory?.createdAt,
  );
  const jamHistory = convertDateToTime(pondMesinAwalHistory?.createdAt);

  const jumlahWaktuCheck = formatElapsedTime(
    pondMesinAwal?.inspeksi_pond_awal[0].waktu_check,
  );

  const isOnprogres =
    pondMesinAwal?.inspeksi_pond_awal[0].inspeksi_pond_awal_point.some(
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
                          <div className="flex flex-col gap-2 col-span-2 pl-6 py-4 ">
                            <label className="text-neutral-500 text-sm font-semibold">
                              Tanggal
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              Bagian
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
                              : {pondMesinAwalHistory?.bagian}
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              :{' '}
                              {formatInteger(
                                parseInt(pondMesinAwalHistory?.jumlah_druk),
                              )}
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              :{' '}
                              {formatInteger(
                                parseInt(pondMesinAwalHistory?.jumlah_pcs),
                              )}
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              : {pondMesinAwalHistory?.jenis_kertas}
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              : {pondMesinAwalHistory?.jenis_gramatur}
                            </label>

                            <div className="grid grid-cols-2">
                              <label className="text-neutral-500 text-sm font-semibold flex">
                                Depan
                              </label>
                              <label className="text-neutral-500 text-sm font-semibold">
                                : {pondMesinAwalHistory?.warna_depan}
                              </label>
                            </div>
                            <div className="grid grid-cols-2">
                              <label className="text-neutral-500 text-sm font-semibold flex">
                                Belakang
                              </label>
                              <label className="text-neutral-500 text-sm font-semibold">
                                : {pondMesinAwalHistory?.warna_belakang}
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
                              : {pondMesinAwalHistory?.no_jo} /{' '}
                              {pondMesinAwalHistory?.no_io}
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              : {pondMesinAwalHistory?.nama_produk}
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              : {pondMesinAwalHistory?.customer}
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
                              : {pondMesinAwalHistory?.shift}
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              : {pondMesinAwalHistory?.mesin}
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              : {pondMesinAwalHistory?.operator}
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              : {pondMesinAwalHistory?.status_jo}
                            </label>
                          </div>
                        </div>
                        {pondMesinAwalHistory?.inspeksi_pond_awal[0]?.inspeksi_pond_awal_point?.map(
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
                                <div className="grid grid-cols-7 border-b-8 border-[#D8EAFF]">
                                  <div className="grid py-4 bg-[#f3f3f3] items-center">
                                    <label className="text-center text-[#6c6b6b] text-sm font-semibold">
                                      LINE CLEARANCE
                                    </label>
                                  </div>
                                  <div className="grid py-4 bg-white items-center">
                                    <label className="text-center text-[#6c6b6b] text-sm font-semibold">
                                      REGISTER
                                    </label>
                                  </div>
                                  <div className="grid py-4 bg-[#f3f3f3] items-center">
                                    <label className="text-center text-[#6c6b6b] text-sm font-semibold">
                                      KETAJAMAN
                                    </label>
                                  </div>
                                  <div className="grid py-4 bg-white items-center">
                                    <label className="text-center text-[#6c6b6b] text-sm font-semibold">
                                      UKURAN
                                    </label>
                                  </div>
                                  <div className="grid py-4 bg-[#f3f3f3] items-center">
                                    <label className="text-center text-[#6c6b6b] text-sm font-semibold">
                                      BENTUK JADI
                                    </label>
                                  </div>
                                  <div className="grid py-4 bg-white items-center">
                                    <label className="text-center text-[#6c6b6b] text-sm font-semibold">
                                      RIIL
                                    </label>
                                  </div>
                                  <div className="grid py-4 bg-[#f3f3f3] items-center">
                                    <label className="text-center text-[#6c6b6b] text-sm font-semibold">
                                      PERFORASI
                                    </label>
                                  </div>
                                </div>

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
                                      <label className="pl-2">
                                        {data.register}
                                      </label>
                                    </>
                                  </div>
                                  <div className="grid py-4 bg-[#f3f3f3] items-center justify-center">
                                    <>
                                      <label className="pl-2">
                                        {data.ketajaman}
                                      </label>
                                    </>
                                  </div>
                                  <div className="grid py-4 bg-white items-center justify-center">
                                    <>
                                      <label className="pl-2">
                                        {data.ukuran}
                                      </label>
                                    </>
                                  </div>
                                  <div className="grid py-4 bg-[#f3f3f3] items-center justify-center">
                                    <>
                                      <label className="pl-2">
                                        {data.bentuk_jadi}
                                      </label>
                                    </>
                                  </div>
                                  <div className="grid py-4 bg-white items-center justify-center">
                                    <>
                                      <label className="pl-2">
                                        {data.riil}
                                      </label>
                                    </>
                                  </div>
                                  <div className="grid py-4 bg-[#f3f3f3] items-center justify-center">
                                    <>
                                      <label className="pl-2">
                                        {data.reforasi}
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
                  Bagian
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
                  : {pondMesinAwal?.bagian}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {formatInteger(parseInt(pondMesinAwal?.jumlah_druk))} /{' '}
                  {formatInteger(parseInt(pondMesinAwal?.mata))}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {formatInteger(parseInt(pondMesinAwal?.jumlah_pcs))}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {pondMesinAwal?.ukuran_jadi}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {pondMesinAwal?.jenis_kertas}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {pondMesinAwal?.jenis_gramatur}
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
                  : {pondMesinAwal?.no_jo} / {pondMesinAwal?.no_io}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {pondMesinAwal?.nama_produk}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {pondMesinAwal?.customer}
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
                  : {pondMesinAwal?.shift}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  :{pondMesinAwal?.mesin}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {pondMesinAwal?.operator}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {pondMesinAwal?.status_jo}
                </label>
              </div>
            </div>

            {/* =============================chekcsheet========================= */}
            {pondMesinAwal?.inspeksi_pond_awal[0].inspeksi_pond_awal_point.map(
              (data: any, index: number) => {
                const lamaPengerjaan = formatElapsedTime(data.lama_pengerjaan);
                const waktuMulai = convertDateToTime(data.waktu_mulai);
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
                              pondMesinAwal?.status == 'incoming' ? (
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

                              <div className="space-y-2">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleFileSelect}
                                  disabled={
                                    data.status !== 'on progress' ||
                                    pondMesinAwal?.status !== 'incoming'
                                  }
                                  className="w-60"
                                />

                                {uploadError && (
                                  <p className="text-red-500 text-xs">
                                    {uploadError}
                                  </p>
                                )}

                                {uploading && (
                                  <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                                    <span className="text-xs text-gray-600">
                                      Uploading...
                                    </span>
                                  </div>
                                )}

                                {/* Preview for new file selection (when input is enabled) */}
                                {filePreview &&
                                  data.status === 'on progress' &&
                                  pondMesinAwal?.status === 'incoming' && (
                                    <div className="border border-gray-200 rounded p-2">
                                      <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-medium">
                                          Preview:
                                        </span>
                                        <button
                                          type="button"
                                          onClick={clearFileSelection}
                                          className="text-red-500 hover:text-red-700 text-xs"
                                        >
                                          Remove
                                        </button>
                                      </div>
                                      <img
                                        src={filePreview}
                                        alt="Preview"
                                        className="max-w-full h-24 object-contain border rounded"
                                      />
                                      {selectedFile && (
                                        <p className="text-xs text-gray-500 mt-1">
                                          {selectedFile.name} (
                                          {(
                                            selectedFile.size /
                                            1024 /
                                            1024
                                          ).toFixed(2)}{' '}
                                          MB)
                                        </p>
                                      )}
                                    </div>
                                  )}

                                {/* Preview for existing uploaded file (when input is disabled) */}
                                {data.file &&
                                  (data.status !== 'on progress' ||
                                    pondMesinAwal?.status !== 'incoming') && (
                                    <div className="border border-gray-200 rounded p-2">
                                      <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-medium">
                                          Uploaded Image:
                                        </span>
                                      </div>
                                      <img
                                        src={`${
                                          import.meta.env.VITE_API_LINK
                                        }/images/${data.file}`}
                                        alt="Uploaded file"
                                        className="min-w-full h-24 object-contain border rounded"
                                        onError={(e) => {
                                          e.currentTarget.style.display =
                                            'none';
                                        }}
                                      />
                                      <p className="text-xs text-gray-500 mt-1">
                                        {data.file}
                                      </p>
                                    </div>
                                  )}
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
                          REGISTER
                        </label>
                      </div>
                      <div className="grid py-4 bg-[#f3f3f3] items-center">
                        <label className="text-center text-[#6c6b6b] text-sm font-semibold">
                          KETAJAMAN
                        </label>
                      </div>
                      <div className="grid py-4 bg-white items-center">
                        <label className="text-center text-[#6c6b6b] text-sm font-semibold">
                          UKURAN
                        </label>
                      </div>
                      <div className="grid py-4 bg-[#f3f3f3] items-center">
                        <label className="text-center text-[#6c6b6b] text-sm font-semibold">
                          BENTUK JADI
                        </label>
                      </div>
                      <div className="grid py-4 bg-white items-center">
                        <label className="text-center text-[#6c6b6b] text-sm font-semibold">
                          RIIL
                        </label>
                      </div>
                      <div className="grid py-4 bg-[#f3f3f3] items-center">
                        <label className="text-center text-[#6c6b6b] text-sm font-semibold">
                          PERFORASI
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
                            <label className="pl-2">{data.register}</label>
                          </>
                        </div>
                        <div className="grid py-4 bg-[#f3f3f3] items-center justify-center">
                          <>
                            <label className="pl-2">{data.ketajaman}</label>
                          </>
                        </div>
                        <div className="grid py-4 bg-white items-center justify-center">
                          <>
                            <label className="pl-2">{data.ukuran}</label>
                          </>
                        </div>
                        <div className="grid py-4 bg-[#f3f3f3] items-center justify-center">
                          <>
                            <label className="pl-2">{data.bentuk_jadi}</label>
                          </>
                        </div>
                        <div className="grid py-4 bg-white items-center justify-center">
                          <>
                            <label className="pl-2">{data.riil}</label>
                          </>
                        </div>
                        <div className="grid py-4 bg-[#f3f3f3] items-center justify-center">
                          <>
                            <label className="pl-2">{data.reforasi}</label>
                          </>
                        </div>
                      </div>
                    ) : data.status == 'on progress' &&
                      pondMesinAwal?.status == 'incoming' ? (
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
                                name="register"
                                onChange={(e) => handleChangePoint(e, index)}
                              />
                              <label className="pl-2">OK</label>
                            </div>
                            <div>
                              <input
                                type="radio"
                                id="ok12"
                                value="NOT OK"
                                name="register"
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
                                name="ketajaman"
                                onChange={(e) => handleChangePoint(e, index)}
                              />
                              <label className="pl-2">OK</label>
                            </div>
                            <div>
                              <input
                                type="radio"
                                id="ok12"
                                value="NOT OK"
                                name="ketajaman"
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
                                name="ukuran"
                                onChange={(e) => handleChangePoint(e, index)}
                              />
                              <label className="pl-2">OK</label>
                            </div>
                            <div>
                              <input
                                type="radio"
                                id="ok12"
                                value="NOT OK"
                                name="ukuran"
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
                                name="bentuk_jadi"
                                onChange={(e) => handleChangePoint(e, index)}
                              />
                              <label className="pl-2">OK</label>
                            </div>
                            <div>
                              <input
                                type="radio"
                                id="ok12"
                                value="NOT OK"
                                name="bentuk_jadi"
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
                                name="riil"
                                onChange={(e) => handleChangePoint(e, index)}
                              />
                              <label className="pl-2">OK</label>
                            </div>
                            <div>
                              <input
                                type="radio"
                                id="ok12"
                                value="NOT OK"
                                name="riil"
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
                                name="reforasi"
                                onChange={(e) => handleChangePoint(e, index)}
                              />
                              <label className="pl-2">OK</label>
                            </div>
                            <div>
                              <input
                                type="radio"
                                id="ok12"
                                value="NOT OK"
                                name="reforasi"
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
                        pondMesinAwal?.status == 'incoming' ? (
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
                        pondMesinAwal?.status == 'incoming' ? (
                          <button
                            onClick={() => {
                              stopTaskCekAwal(
                                data.id,
                                data.waktu_mulai,
                                data.catatan,
                                data.line_clearance,
                                data.register,
                                data.ketajaman,
                                data.ukuran,
                                data.bentuk_jadi,
                                data.riil,
                                data.reforasi,
                              );
                            }}
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
            pondMesinAwal?.status == 'incoming' &&
            pondMesinAwal?.inspeksi_pond_awal[0].status == 'incoming') ||
          (pondMesinAwal?.inspeksi_pond_awal[0].status == 'pending' &&
            pondMesinAwal?.status == 'incoming') ? (
            <>
              <button
                disabled={isLoading}
                onClick={() =>
                  tambahTaskCekAwal(pondMesinAwal?.inspeksi_pond_awal[0].id)
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
              {pondMesinAwal?.inspeksi_pond_awal[0].jumlah_periode}
            </label>
            <label className=" text-[#6c6b6b] text-sm font-semibold col-span-2">
              Waktu Check : {jumlahWaktuCheck}
            </label>
            <div className="grid col-span-6 items-end justify-end gap-2">
              {!isOnprogres &&
              pondMesinAwal?.status == 'incoming' &&
              pondMesinAwal?.inspeksi_pond_awal[0].status == 'incoming' ? (
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
                            pendingCekAwal(
                              pondMesinAwal?.inspeksi_pond_awal[0].id,
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
                pondMesinAwal?.status == 'incoming' &&
                pondMesinAwal?.inspeksi_pond_awal[0].status == 'incoming') ||
              pondMesinAwal?.inspeksi_pond_awal[0].status == 'pending' ? (
                <button
                  onClick={() =>
                    doneCekAwal(pondMesinAwal?.inspeksi_pond_awal[0].id)
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

export default CheckSheetPondAwal;
