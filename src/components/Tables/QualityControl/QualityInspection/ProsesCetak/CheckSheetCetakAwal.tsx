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
import ModalKosonganSmall from '../../../../Modals/ModalKosonganSmall';

function CheckSheetCetakAwal() {
  const [selectedECs, setSelectedECs] = useState<string>();
  const { id } = useParams();
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cetakMesinPeriode, setCetakMesinPeriode] = useState<any>();
  const [cetakMesinAwal, setCetakMesinAwal] = useState<any>();
  const [cetakMesinAwalHistory, setCetakMesinAwalHistory] = useState<any>();
  const [masterKodeCetak, setMasterKodeCetak] = useState<any>();
  const [masterKodeCetak2, setMasterKodeCetak2] = useState<any>();
  const [currentPeriod, setCurrentPeriod] = useState(1);
  const [eyeC, setEyeC] = useState<any>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  useEffect(() => {
    getCetakMesinAwal();
    getMasterKode();
  }, []);

  const getAllECs = (): string[] => [
    'EC1',
    'EC2',
    'EC3',
    'EC4',
    'EC5',
    'EC6',
    'EC7',
    'EC8',
    'EC9',
    'EC10',
  ];
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

  const getAvailableECs = (
    cetakMesinAwal?: any,
    cetakMesinPeriode?: any,
  ): string[] => {
    const allECs = getAllECs();

    // Collect used ECs from both inspeksi_cetak_awal and inspeksi_cetak_periode
    const usedEyeCs: string[] = [];

    // Collect ECs from inspeksi_cetak_awal
    if (cetakMesinAwal?.inspeksi_cetak_awal?.length > 0) {
      cetakMesinAwal.inspeksi_cetak_awal.forEach((item: any) => {
        item.inspeksi_cetak_awal_point.forEach((point: any) => {
          if (point.eye_c) {
            usedEyeCs.push(point.eye_c);
          }
        });
      });
    }

    // Collect ECs from inspeksi_cetak_periode
    if (cetakMesinPeriode?.inspeksi_cetak_periode?.length > 0) {
      cetakMesinPeriode.inspeksi_cetak_periode.forEach((item: any) => {
        item.inspeksi_cetak_periode_point.forEach((point: any) => {
          if (point.eye_c) {
            usedEyeCs.push(point.eye_c);
          }
        });
      });
    }

    // Find the first available EC that hasn't been used
    for (const ec of allECs) {
      if (!usedEyeCs.includes(ec)) {
        return [ec];
      }
    }

    // If all ECs are used, return an empty array
    return [];
  };

  async function getMasterKode() {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/master/produksi/wasteAllKendalaFormating?proses=3`;
    const url2 = `${
      import.meta.env.VITE_API_LINK
    }/master/produksi/wasteAllKendalaFormating?proses=4`;
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
      setCetakMesinPeriode(res.data.data);
      setCetakMesinAwal(res.data.data);
      setCetakMesinAwalHistory(res.data.history);
      console.log(res.data);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  async function startTaskCekAwal(id: number) {
    const url = `${
      import.meta.env.VITE_API_LINK
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
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiCetakAwalPoint/stop/${id}`;

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
          eye_c: eyeC,
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
          file: uploadedFileName, // Use the uploaded file name
        },
        {
          withCredentials: true,
        },
      );

      setEyeC('');
      clearFileSelection(); // Clear the file selection after successful upload
      getCetakMesinAwal();
    } catch (error: any) {
      console.log(error.response.data.msg);
      alert(error.response.data.msg);
    }
  }
  async function tambahTaskCekAwal(id: number) {
    const url = `${
      import.meta.env.VITE_API_LINK
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
  const [sample1Value, setSample1Value] = useState<any>();
  const [result1, setResult1] = useState<any>();

  const [sample2Value, setSample2Value] = useState<any>();
  const [result2, setResult2] = useState<any>();

  const [sample3Value, setSample3Value] = useState<any>();
  const [result3, setResult3] = useState<any>();

  async function doneCekAwal(id: number) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiCetakAwal/done/${id}`;
    try {
      const res = await axios.put(
        url,
        {
          id_inspeksi_cetak_awal: id,
          masterKodeCetak: masterKodeCetak,
          masterKodeCetak2: masterKodeCetak2,
          sample_1: sample1Value,
          sample_2: sample2Value,
          sample_3: sample3Value,
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
  const [alasanPending, setalasanPending] = useState<any>();

  async function pendingCekAwal(id: number, alasan: any) {
    if (alasan == null) {
      alert('Catatan Wajib Diisi');
      return;
    }
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiCetakAwal/pending/${id}`;
    try {
      const res = await axios.put(
        url,
        {
          alasan_pending: alasan,
        },
        {
          withCredentials: true,
        },
      );
      closeModalPending();
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

  const [showPending, setShowPending] = useState(false);
  const openModalPending = () => setShowPending(true);
  const closeModalPending = () => setShowPending(false);
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
                              :{' '}
                              {formatInteger(
                                parseInt(cetakMesinAwalHistory?.jumlah_druk),
                              )}{' '}
                              /{' '}
                              {formatInteger(
                                parseInt(cetakMesinAwalHistory?.mata),
                              )}
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              :{' '}
                              {formatInteger(
                                parseInt(cetakMesinAwalHistory?.jumlah_pcs),
                              )}
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
                              : {cetakMesinAwalHistory?.no_jo} /{' '}
                              {cetakMesinAwalHistory?.no_io}
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

            <div className="border-b-8 border-[#D8EAFF] overflow-x-auto">
              <table className="w-full min-w-max">
                <tbody>
                  <tr className="">
                    <td className="text-neutral-500 text-sm font-semibold px-6 py-2 whitespace-nowrap">
                      Tanggal
                    </td>
                    <td className="text-neutral-700 text-sm font-medium px-4 py-2 break-words">
                      : {tanggal}
                    </td>
                    <td className="text-neutral-500 text-sm font-semibold px-10 py-2 whitespace-nowrap">
                      Jam
                    </td>
                    <td className="text-neutral-700 text-sm font-medium px-2 py-2 break-words">
                      : {jam}
                    </td>
                    <td className="text-neutral-500 text-sm font-semibold px-10 py-2 whitespace-nowrap">
                      Shift
                    </td>
                    <td className="text-neutral-700 text-sm font-medium px-2 py-2 break-words">
                      : {cetakMesinAwal?.shift}
                    </td>
                  </tr>

                  <tr className="">
                    <td className="text-neutral-500 text-sm font-semibold px-6 py-2 whitespace-nowrap">
                      Jumlah Druk
                    </td>
                    <td className="text-neutral-700 text-sm font-medium px-4 py-2 break-words">
                      : {formatInteger(parseInt(cetakMesinAwal?.jumlah_druk))} /{' '}
                      {formatInteger(parseInt(cetakMesinAwal?.mata))}
                    </td>
                    <td className="text-neutral-500 text-sm font-semibold px-10 py-2 whitespace-nowrap">
                      No. JO
                    </td>
                    <td className="text-neutral-700 text-sm font-medium px-2 py-2 break-words">
                      : {cetakMesinAwal?.no_jo}
                    </td>
                    <td className="text-neutral-500 text-sm font-semibold px-10 py-2 whitespace-nowrap">
                      Mesin
                    </td>
                    <td className="text-neutral-700 text-sm font-medium px-2 py-2 break-words">
                      : {cetakMesinAwal?.mesin}
                    </td>
                  </tr>

                  <tr className="">
                    <td className="text-neutral-500 text-sm font-semibold px-6 py-2 whitespace-nowrap">
                      Jumlah Pcs
                    </td>
                    <td className="text-neutral-700 text-sm font-medium px-4 py-2 break-words">
                      : {formatInteger(parseInt(cetakMesinAwal?.jumlah_pcs))}
                    </td>
                    <td className="text-neutral-500 text-sm font-semibold px-10 py-2 whitespace-nowrap">
                      No. IO
                    </td>
                    <td className="text-neutral-700 text-sm font-medium px-2 py-2 break-words">
                      : {cetakMesinAwal?.no_io}
                    </td>
                    <td className="text-neutral-500 text-sm font-semibold px-10 py-2 whitespace-nowrap">
                      Operator
                    </td>
                    <td className="text-neutral-700 text-sm font-medium px-2 py-2 break-words">
                      : {cetakMesinAwal?.operator}
                    </td>
                  </tr>

                  <tr className="">
                    <td className="text-neutral-500 text-sm font-semibold px-6 py-2 whitespace-nowrap">
                      Jenis Kertas
                    </td>
                    <td className="text-neutral-700 text-sm font-medium px-4 py-2 break-words">
                      : {cetakMesinAwal?.jenis_kertas}
                    </td>
                    <td className="text-neutral-500 text-sm font-semibold px-10 py-2 whitespace-nowrap">
                      Nama Produk
                    </td>
                    <td className="text-neutral-700 text-sm font-medium px-2 py-2 break-words">
                      : {cetakMesinAwal?.nama_produk}
                    </td>
                    <td className="text-neutral-500 text-sm font-semibold px-10 py-2 whitespace-nowrap">
                      Status Jo
                    </td>
                    <td className="text-neutral-700 text-sm font-medium px-2 py-2 break-words">
                      : {cetakMesinAwal?.status_jo}
                    </td>
                  </tr>

                  <tr className="">
                    <td className="text-neutral-500 text-sm font-semibold px-6 py-2 whitespace-nowrap">
                      Jenis Gramatur
                    </td>
                    <td className="text-neutral-700 text-sm font-medium px-4 py-2 break-words">
                      : {cetakMesinAwal?.jenis_gramatur}
                    </td>
                    <td className="text-neutral-500 text-sm font-semibold px-10 py-2 whitespace-nowrap">
                      Customer
                    </td>
                    <td
                      className="text-neutral-700 text-sm font-medium px-2 py-2 break-words"
                      colSpan={3}
                    >
                      : {cetakMesinAwal?.customer}
                    </td>
                  </tr>

                  <tr>
                    <td className="text-neutral-500 text-sm font-semibold px-6 py-2 whitespace-nowrap">
                      Warna
                    </td>
                    <td
                      className="text-neutral-700 text-sm font-medium px-4 py-2"
                      colSpan={5}
                    >
                      <div className="space-y-1">
                        <div className="flex items-start gap-2">
                          <span className="text-neutral-500 text-sm font-semibold min-w-[60px] whitespace-nowrap">
                            Depan
                          </span>
                          <span className="text-neutral-700 text-sm font-medium break-words">
                            : {cetakMesinAwal?.warna_depan}
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-neutral-500 text-sm font-semibold min-w-[60px] whitespace-nowrap">
                            Belakang
                          </span>
                          <span className="text-neutral-700 text-sm font-medium break-words">
                            : {cetakMesinAwal?.warna_belakang}
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* =============================chekcsheet========================= */}
            {cetakMesinAwal?.inspeksi_cetak_awal[0]?.inspeksi_cetak_awal_point?.map(
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

                        <div className="flex flex-col col-span-2 gap-2">
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
                                    cetakMesinAwal?.status !== 'incoming'
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
                                  cetakMesinAwal?.status === 'incoming' && (
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
                                    cetakMesinAwal?.status !== 'incoming') && (
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

                            {data.status == 'on progress' &&
                            cetakMesinAwal?.status == 'incoming' ? (
                              <>
                                <select
                                  value={eyeC} // Add this to control the selected value
                                  onChange={(event) => {
                                    setEyeC(event.target.value);
                                  }}
                                  name=""
                                  id=""
                                  className="relative z-20 inline-flex py-1 pl-3 pr-8 text-sm font-medium outline-none"
                                >
                                  <option
                                    value=""
                                    selected
                                    className="dark:bg-boxdark"
                                  >
                                    Add Eye C
                                  </option>
                                  {getAvailableECs(
                                    cetakMesinAwal,
                                    cetakMesinPeriode,
                                  ).map((ec) => (
                                    <option
                                      key={ec}
                                      value={ec}
                                      className="dark:bg-boxdark"
                                    >
                                      {ec}
                                    </option>
                                  ))}
                                </select>
                              </>
                            ) : (
                              <label className="pl-2">{data.eye_c}</label>
                            )}
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
                          <>
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
                          </>
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
            <label className=" text-[#6c6b6b] text-sm font-semibold col-span-3">
              Waktu Check : {jumlahWaktuCheck}
            </label>
            <div className="col-span-2">
              {(!isOnprogres &&
                cetakMesinAwal?.status == 'incoming' &&
                cetakMesinAwal?.inspeksi_cetak_awal[0]?.status == 'incoming') ||
              cetakMesinAwal?.inspeksi_cetak_awal[0]?.status == 'pending' ? (
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
                        value={cetakMesinAwal?.inspeksi_cetak_awal[0]?.sample_1}
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
                          cetakMesinAwal?.inspeksi_cetak_awal[0]?.hasil_sample_1
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
                        value={cetakMesinAwal?.inspeksi_cetak_awal[0]?.sample_2}
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
                          cetakMesinAwal?.inspeksi_cetak_awal[0]?.hasil_sample_2
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
                        value={cetakMesinAwal?.inspeksi_cetak_awal[0]?.sample_3}
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
                          cetakMesinAwal?.inspeksi_cetak_awal[0]?.hasil_sample_3
                        }
                        type="text"
                        className="border-2 border-stroke w-[40%] rounded-sm col-span-2"
                      />{' '}
                      g/m<sup className="">2</sup>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="grid col-span-3 items-end justify-end gap-2">
              {!isOnprogres &&
              cetakMesinAwal?.inspeksi_cetak_awal[0]?.status == 'incoming' &&
              cetakMesinAwal?.status == 'incoming' ? (
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
                              cetakMesinAwal?.inspeksi_cetak_awal[0]?.id,
                              alasanPending,
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
