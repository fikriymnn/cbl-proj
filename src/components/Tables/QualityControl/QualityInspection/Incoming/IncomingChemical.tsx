import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import convertDateToTime from '../../../../../utils/converDateToTime';
import Loading from '../../../../Loading';
import ptcbl from '../../../../../images/ptcbl.png';
function IncomingChemical() {
  const [isMobile, setIsMobile] = useState(false);
  const kosong: any = [];
  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  const date = today.getDate();
  const currentDate = month + '/' + date + '/' + year;
  const navigate = useNavigate();
  const [no_lot, setNo_lot] = useState<any>();
  const [verifikasi, setVerifikasi] = useState<any>();
  const handleResize = () => {
    setIsMobile(window.innerWidth < 768); // Adjust the breakpoint as needed
  };
  useEffect(() => {
    handleResize();

    // Event listener for window resize
    window.addEventListener('resize', handleResize);

    // Cleanup on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const { id } = useParams();

  const [incoming, setIncoming] = useState<any>();
  const [editedData, setEditedData] = useState<any[]>([]);
  useEffect(() => {
    if (incoming?.inspeksi_chemical_point) {
      setEditedData(incoming.inspeksi_chemical_point);
    } else {
      getInspection(); // Hanya panggil API jika data belum ada
    }
  }, [incoming]); // Bergantung hanya pada `incoming`, tidak loop terus-menerus

  async function getInspection() {
    const url = `${import.meta.env.VITE_API_LINK}/qc/cs/inspeksiChemical/${id}`;

    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      setIncoming(res.data.data);
      console.log(res.data.data);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  const [isLoading, setIsLoading] = useState(false);

  async function startTask(id: any) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiChemical/start/${id}`;
    try {
      const res = await axios.put(
        url,
        {},
        {
          withCredentials: true,
        },
      );

      getInspection();
    } catch (error: any) {
      console.log(error);
    }
  }

  const handleInputChange = (index: number, field: string, value: string) => {
    setEditedData((prevData: any) =>
      prevData.map((item: any, i: number) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  async function stopTask(id: any, start: any) {
    if (!start) {
      alert('Task tidak bisa diberhentikan: Belum Start.');
      return;
    }

    const stopTime = new Date();
    const timestamp = convertDatetimeToDate(new Date());
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiChemical/stop/${id}`;

    try {
      const elapsedSeconds = await calculateElapsedTime(start, stopTime);
      const totalSecondsToSave = elapsedSeconds;

      // Kirim data yang telah diedit ke API
      const updatedData = editedData.map((item: any) => ({
        id: item.id,
        deskripsi: item.deskripsi,
        standar: item.standar,
        metode: item.metode,
        hasil: item.hasil || 'OK',
        keterangan: item.keterangan || '',
        file: null, // File selalu null
      }));
      console.log(updatedData);
      await axios.put(
        url,
        {
          lama_pengerjaan: totalSecondsToSave,
          hasil: updatedData, // Gunakan editedData yang sudah tersimpan di state
        },
        {
          withCredentials: true,
        },
      );

      console.log('Success', timestamp);
      getInspection(); // Refresh data setelah update
    } catch (error: any) {
      console.log(error);
      alert(error.response.data.msg);
    }
  }

  function formatElapsedTime(seconds: number): string {
    // Ensure seconds is non-negative
    seconds = Math.max(0, seconds);

    const hours = Math.floor(seconds / 3600);
    const remainingSeconds = seconds % 3600;

    const minutes = Math.floor(remainingSeconds / 60);
    const remainingSecondsAfterMinutes = remainingSeconds % 60;

    // Use template literals and conditional operators for formatting
    let formattedTime = '';
    if (hours > 0) {
      formattedTime += `${hours} Jam :`; // Add hours if present
    }
    if (hours > 0 || minutes > 0) {
      // Only add minutes if hours are present or minutes are non-zero
      formattedTime += `${minutes.toString().padStart(2, '0')} Menit : `;
    }
    formattedTime += remainingSecondsAfterMinutes.toString().padStart(2, '0');

    return formattedTime;
  }

  function convertDatetimeToDate(datetime: any) {
    const dateObject = new Date(datetime);
    const day = dateObject.getDate().toString().padStart(2, '0'); // Ensure two-digit day
    const month = (dateObject.getMonth() + 1).toString().padStart(2, '0'); // Adjust for zero-based month
    const year = dateObject.getFullYear();
    const hours = dateObject.getHours().toString().padStart(2, '0');
    const minutes = dateObject.getMinutes().toString().padStart(2, '0');

    return `${year}/${month}/${day} ${hours}:${minutes}`; // Example format (YYYY-MM-DD)
  }
  function calculateElapsedTime(startTime: any, stopTime: Date) {
    const start = new Date(startTime);
    const diffInMs = stopTime.getTime() - start.getTime();
    // Convert milliseconds to your desired unit (minutes, hours)
    const elapsedTime = Math.round(diffInMs / 1000);
    console.log(elapsedTime); // Example: minutes
    return elapsedTime;
  }

  const waktuMulaiincoming = convertDatetimeToDate(
    incoming != null && incoming?.waktu_mulai,
  );

  const waktuSelesaiincoming =
    incoming != null && incoming?.waktu_selesai != null
      ? convertDatetimeToDate(incoming?.waktu_selesai)
      : '-';

  async function sumbitChecksheet(id: number) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiChemical/done/${id}`;
    try {
      const res = await axios.put(
        url,
        {
          no_lot: no_lot,
          catatan: ctt,
          verifikasi: verifikasi,
        },
        {
          withCredentials: true,
        },
      );

      alert('Data Berhasil Di-Update');
      console.log('succes');
      getInspection();
    } catch (error: any) {
      console.log(error);
    }
  }
  const [ctt, setCtt] = useState<any>();
  const [isOpen, setIsOpen] = useState(false);

  const openPreview = () => {
    setIsOpen(true);
  };

  const closePreview = () => {
    setIsOpen(false);
  };

  const printChecksheet = () => {
    const printArea = document.getElementById('print-area');

    if (!printArea) return;

    // Store the current page
    const currentPage = window.location.href;

    // Create a new window for printing with your domain still in URL
    const printWindow = window.open(
      currentPage,
      '_blank',
      'toolbar=0,location=1,menubar=0',
    );

    if (!printWindow) {
      alert('Please allow pop-ups for printing functionality');
      return;
    }

    // Get all styles from the current document
    const styles = Array.from(document.styleSheets)
      .map((styleSheet) => {
        try {
          return Array.from(styleSheet.cssRules)
            .map((rule) => rule.cssText)
            .join('');
        } catch (e) {
          // Likely a CORS issue with external stylesheet
          if (styleSheet.href) {
            return `<link rel="stylesheet" href="${styleSheet.href}">`;
          }
          return '';
        }
      })
      .filter(Boolean);

    // Clear the new window and insert content with styles
    printWindow.document.open();
    printWindow.document.write(`
            <html>
              <head>
                <style>
                  ${styles.join('')}
                  
                  /* Additional styles to fit on one page */
                  @page {
                    size: A4;
                    margin: 10mm;
                  }
                  
                  body {
                    margin: 0;
                    padding: 0;
                  }
                  
                  .print-container {
                    width: 100%;
                    max-width: 100%;
                    box-sizing: border-box;
                    transform: scale(0.95);
                    transform-origin: top left;
                  }
                  
                  /* Adjust font sizes for print */
                  .print-container * {
                    font-size: 10px !important;
                  }
                  
                  .print-container h3, 
                  .print-container .text-lg, 
                  .print-container .font-semibold {
                    font-size: 12px !important;
                  }
                  
                  /* Adjust row heights */
                  .print-container table td {
                    padding: 2px !important;
                  }
                  
                  /* Ensure table fits */
                  .print-container table {
                    width: 100% !important;
                    table-layout: fixed;
                  }
                  
                  /* Force to fit on one page */
                  @media print {
                    html, body {
                      width: 210mm;
                      height: 297mm;
                      overflow: hidden;
                    }
                    
                    .print-container {
                      page-break-inside: avoid;
                      page-break-after: avoid;
                      page-break-before: avoid;
                    }
                  }
                </style>
              </head>
              <body>
                <div class="print-container">
                  ${printArea.innerHTML}
                </div>
                <script>
                  window.onload = function() {
                    // Small delay to ensure styles are applied
                    setTimeout(function() {
                      window.print();
                      window.onafterprint = function() {
                        window.close();
                      }
                    }, 500);
                  }
                </script>
              </body>
            </html>
          `);

    printWindow.document.close();
  };
  return (
    <>
      {isLoading && <Loading />}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start overflow-y-auto pt-10">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-7xl">
            {/* Modal header */}
            <div className="border-b px-4 py-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Print Preview
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={printChecksheet}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                    />
                  </svg>
                  Print Checksheet
                </button>
                <button
                  onClick={closePreview}
                  className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
            <div id="chemical-print-area" className="p-6 bg-white">
              <div className="min-w-full bg-white">
                {/* Header */}
                <div className="text-center mb-4">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr>
                        <td colSpan={4} className="border border-black p-2">
                          <div className="flex items-center">
                            <div className="w-24 flex justify-center">
                              <img src={ptcbl} alt="logo" />
                            </div>
                            <div className="flex-grow text-center font-bold text-lg">
                              QUALITY ASSURANCE DEPARTMENT
                            </div>
                            <div className="w-24 flex justify-center">
                              {'  '}
                            </div>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td
                          colSpan={4}
                          className="border border-black p-2 text-center font-bold"
                        >
                          INCOMING CHEMICAL CHECKSHEET
                        </td>
                      </tr>
                    </thead>
                  </table>
                </div>

                {/* Content */}
                <div className="border border-black p-4">
                  {/* Basic Information */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <table className="w-full">
                        <tbody>
                          <tr>
                            <td className="w-1/2 py-1">Tanggal</td>
                            <td className="w-1/2 py-1">
                              : {incoming?.tanggal}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-1">No. LOT</td>
                            <td className="py-1">: {incoming?.no_lot}</td>
                          </tr>
                          <tr>
                            <td className="py-1">No. SURAT JALAN</td>
                            <td className="py-1">
                              : {incoming?.no_surat_jalan}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-1">SUPPLIER</td>
                            <td className="py-1">: {incoming?.supplier}</td>
                          </tr>
                          <tr>
                            <td className="py-1">JENIS CHEMICAL/TINTA</td>
                            <td className="py-1">
                              : {incoming?.jenis_chemical}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div>
                      <table className="w-full">
                        <tbody>
                          <tr>
                            <td className="w-1/2 py-1">Jam</td>
                            <td className="w-1/2 py-1">
                              : {convertDateToTime(incoming?.createdAt)}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-1">Waktu Mulai</td>
                            <td className="py-1">
                              : {waktuMulaiincoming || '-'}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-1">Waktu Selesai</td>
                            <td className="py-1">
                              : {waktuSelesaiincoming || '-'}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-1">Total Waktu</td>
                            <td className="py-1">
                              :{' '}
                              {incoming?.lama_pengerjaan
                                ? formatElapsedTime(incoming?.lama_pengerjaan)
                                : '-'}{' '}
                              Detik
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Checksheet Table */}
                  <table className="w-full border-collapse border border-black mb-6">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-black p-2 w-8 text-center">
                          No
                        </th>
                        <th className="border border-black p-2 text-left">
                          Description
                        </th>
                        <th className="border border-black p-2 text-center">
                          STANDAR
                        </th>
                        <th className="border border-black p-2 text-center">
                          METHODE
                        </th>
                        <th className="border border-black p-2 text-center">
                          HASIL
                        </th>
                        <th className="border border-black p-2 text-center">
                          KETERANGAN
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {incoming?.inspeksi_chemical_point?.map(
                        (data: any, i: any) => (
                          <tr key={i}>
                            <td className="border border-black p-2 text-center">
                              {i + 1}
                            </td>
                            <td className="border border-black p-2">
                              {data.deskripsi}
                            </td>
                            <td className="border border-black p-2">
                              {data.standar}
                            </td>
                            <td className="border border-black p-2">
                              {data.metode}
                            </td>
                            <td className="border border-black p-2 text-center">
                              {data.hasil}
                            </td>
                            <td className="border border-black p-2">
                              {data.keterangan || '-'}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>

                  {/* Results and Notes */}
                  <div className="border border-black p-4 mb-6">
                    <div className="grid grid-cols-4 gap-4">
                      <div className="col-span-3">
                        <p className="font-bold mb-2">Catatan:</p>
                        <p>{incoming?.catatan || '-'}</p>
                      </div>
                      <div className="col-span-1 text-center">
                        <p className="font-bold mb-2">Verifikasi:</p>
                        <p
                          className={`font-bold text-xl ${
                            incoming?.verifikasi?.includes('Diterima')
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {incoming?.verifikasi || '-'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Signatures */}
                  <div className="flex justify-between mt-10">
                    <div className="w-1/3 text-center">
                      <p>Diperiksa oleh,</p>
                      <div className="h-16"></div>
                      <p>
                        (
                        {incoming?.inspektor?.nama ||
                          '............................'}
                        )
                      </p>
                      <p>QC Inspector</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <main className="overflow-x-hidden">
        <form
          action=""
          onSubmit={(e) => {
            e.preventDefault();
            console.log(incoming);
            sumbitChecksheet(incoming?.id);
          }}
        >
          <div className="min-w-[700px] bg-white rounded-xl">
            <p className="text-[14px] font-semibold w-full justify-between flex border-b-8 border-[#D8EAFF] py-4 px-9 md:ps-9 ps-12">
              <div className="flex gap-1">
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
                Incoming Chemical Checksheet
              </div>
              <button
                type="button"
                value={'button'}
                onClick={openPreview}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                Preview Checksheet
              </button>
            </p>

            <div className="grid grid-cols-10 border-b-8 border-[#D8EAFF]">
              <div className="grid grid-rows-6 gap-1 col-span-2 px-10 py-4 ">
                <label className="text-neutral-500 text-sm font-semibold">
                  Tanggal
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  No. LOT
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  No. SURAT JALAN
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  SUPPLIER
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  JENIS CHEMICAL/TINTA
                </label>
              </div>
              <div className="grid grid-rows-6 gap-1 col-span-2 px-10 py-4">
                <label className="text-neutral-500 text-sm font-semibold">
                  : {incoming?.tanggal}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  {incoming?.status == 'incoming' ? (
                    <>
                      :{' '}
                      <input
                        type="text"
                        onChange={(e) => {
                          setNo_lot(e.target.value);
                        }}
                        className="rounded-[3px]  border border-zinc-300"
                      />
                    </>
                  ) : (
                    <>: {incoming?.no_lot}</>
                  )}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {incoming?.no_surat_jalan}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {incoming?.supplier}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {incoming?.jenis_chemical}
                </label>
              </div>

              <div className="grid grid-rows-6  gap-1 col-span-2 justify-between px-10 py-4">
                <label className="text-neutral-500 text-sm font-semibold">
                  Jam
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Inspektor
                </label>
              </div>
              <div className="grid grid-rows-6  gap-1 col-span-2 justify-between px-10 py-4">
                <label className="text-neutral-500 text-sm font-semibold">
                  : {convertDateToTime(incoming?.createdAt)}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {incoming?.inspektor?.nama}
                </label>
              </div>
              <div className="flex flex-col h-full w-full items-center justify-end gap-2  py-4 col-span-2  bg-[#F6FAFF]">
                {incoming?.waktu_mulai == null &&
                  incoming?.waktu_selesai == null && (
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
                              startTask(incoming?.id);
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
                {incoming?.waktu_mulai != null &&
                  incoming?.waktu_selesai == null && (
                    <>
                      <div>
                        <p className="md:text-[14px] text-[9px] font-semibold">
                          Waktu Mulai : {waktuMulaiincoming}
                        </p>
                        <p className="md:text-[14px] text-[9px] font-semibold">
                          Waktu Selesai : {waktuSelesaiincoming}
                        </p>
                        <p className="md:text-[14px] text-[9px] font-semibold">
                          Time : -
                        </p>
                        <>
                          <p className="font-bold text-[#00B81D]">
                            Task Sudah Dimulai
                          </p>
                          <button
                            onClick={() => {
                              if (incoming?.waktu_selesai != null) {
                                alert('sudah di kerjakan');
                              } else if (incoming?.waktu_mulai == null) {
                                alert('belum mulai');
                              } else {
                                stopTask(incoming?.id, incoming?.waktu_mulai);
                              }
                            }}
                            className="flex w-full  rounded-md bg-[#DE0000] justify-center items-center px-2 py-2 hover:cursor-pointer"
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
                {incoming?.waktu_mulai != null &&
                  incoming?.waktu_selesai != null && (
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
                          {waktuSelesaiincoming}
                        </p>
                        <p className="md:text-[14px] text-[9px] font-semibold">
                          Time :
                        </p>
                        <p className="md:text-[14px] text-[9px] font-semibold text-stone-400">
                          {incoming?.lama_pengerjaan != null
                            ? formatElapsedTime(incoming?.lama_pengerjaan)
                            : ''}{' '}
                          Detik
                        </p>
                      </div>
                    </>
                  )}
              </div>
            </div>

            <div className="grid grid-cols-10 px-3 py-4 border-b-8 border-[#D8EAFF] gap-2">
              <div className="flex gap-4 col-span-2">
                <label className="text-neutral-500 text-sm font-semibold">
                  No
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Description
                </label>
              </div>
              <label className="text-neutral-500 text-sm font-semibold col-span-2">
                STANDAR
              </label>
              <label className="text-neutral-500 text-sm font-semibold col-span-2">
                METHODE
              </label>
              <label className="text-neutral-500 text-sm font-semibold col-span-2">
                HASIL
              </label>
              <label className="text-neutral-500 text-sm font-semibold col-span-2">
                KETERANGAN
              </label>
            </div>
            {/* =============================================Checksheet Not Start==========================================================*/}
            {incoming?.waktu_mulai == null &&
              incoming?.waktu_selesai == null && (
                <>
                  <div className="flex px-4 py-5">
                    <p className="font-bold text-[#00B81D]">
                      Mulai Task Untuk Memunculkan Checksheet
                    </p>
                  </div>
                </>
              )}
            {/* =============================================Checksheet Start==========================================================*/}
            {incoming?.waktu_mulai != null &&
              incoming?.waktu_selesai == null && (
                <>
                  <>
                    {editedData?.map((data: any, i: number) => (
                      <div
                        key={i}
                        className="grid grid-cols-10 px-3 py-4 gap-2 border-b-8 border-[#D8EAFF]"
                      >
                        {/* Deskripsi (Label) */}
                        <div className="flex gap-4 col-span-2">
                          <label className="text-neutral-500 text-sm">
                            {i + 1}
                          </label>
                          <label className="text-neutral-500 text-sm">
                            {data.deskripsi}
                          </label>
                        </div>

                        {/* Standar (Label) */}
                        <label className="text-neutral-500 text-sm col-span-2">
                          {data.standar}
                        </label>

                        {/* Metode (Label) */}
                        <label className="text-neutral-500 text-sm col-span-2">
                          {data.metode}
                        </label>

                        {/* Radio Button untuk Hasil */}
                        <div className="col-span-2 flex flex-col gap-2">
                          <label className="flex items-center gap-1">
                            <input
                              type="radio"
                              name={`hasil-${i}`}
                              value="OK"
                              checked={data.hasil === 'OK'}
                              onChange={(e) =>
                                handleInputChange(i, 'hasil', e.target.value)
                              }
                            />
                            OK
                          </label>
                          <label className="flex items-center gap-1">
                            <input
                              type="radio"
                              name={`hasil-${i}`}
                              value="Not OK"
                              checked={data.hasil === 'Not OK'}
                              onChange={(e) =>
                                handleInputChange(i, 'hasil', e.target.value)
                              }
                            />
                            Not OK
                          </label>
                        </div>

                        {/* Input untuk Keterangan */}
                        <input
                          type="text"
                          className="text-neutral-500 text-sm col-span-2 border p-1"
                          value={data.keterangan || ''}
                          onChange={(e) =>
                            handleInputChange(i, 'keterangan', e.target.value)
                          }
                        />
                      </div>
                    ))}
                  </>
                </>
              )}
            {/* =============================================Checksheet STOP==========================================================*/}
            {incoming?.waktu_mulai != null &&
              incoming?.waktu_selesai != null && (
                <>
                  <>
                    {incoming?.inspeksi_chemical_point?.map(
                      (data: any, i: number) => (
                        <div
                          key={i}
                          className="grid grid-cols-10 px-3 py-4 gap-2 border-b-8 border-[#D8EAFF]"
                        >
                          {/* Deskripsi (Label) */}
                          <div className="flex gap-4 col-span-2">
                            <label className="text-neutral-500 text-sm">
                              {i + 1}
                            </label>
                            <label className="text-neutral-500 text-sm">
                              {data.deskripsi}
                            </label>
                          </div>

                          {/* Standar (Label) */}
                          <label className="text-neutral-500 text-sm col-span-2">
                            {data.standar}
                          </label>

                          {/* Metode (Label) */}
                          <label className="text-neutral-500 text-sm col-span-2">
                            {data.metode}
                          </label>

                          {/* Radio Button untuk Hasil */}
                          <div className="col-span-2 flex flex-col gap-2">
                            {data.hasil}
                          </div>

                          {/* Input untuk Keterangan */}
                          <input
                            type="text"
                            className="text-neutral-500 text-sm col-span-2 border p-1"
                            value={data.keterangan || ''}
                          />
                        </div>
                      ),
                    )}
                  </>
                </>
              )}
            <div className="bg-white flex w-full justify-between px-4 py-4 items-center gap-8">
              <label className="text-neutral-500 text-sm font-semibold w-[60%]">
                Catatan
                {incoming?.status == 'incoming' &&
                incoming?.waktu_mulai != null &&
                incoming?.waktu_selesai != null ? (
                  <>
                    <textarea
                      required
                      onChange={(e) => {
                        setCtt(e.target.value);
                      }}
                      className="peer  min-h-[50px] w-full resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                    ></textarea>
                  </>
                ) : (
                  <>:{incoming?.catatan}</>
                )}
              </label>
              <div className="flex flex-col">
                {incoming?.verifikasi == null ? (
                  <>
                    <div>
                      <input
                        onChange={(e) => {
                          setVerifikasi(e.target.value);
                        }}
                        type="radio"
                        id="ssVerifikasi"
                        name="ssVerifikasi"
                        value="Diterima"
                      />
                      <label className="pl-2">Diterima</label>
                    </div>
                    <div>
                      <input
                        onChange={(e) => {
                          setVerifikasi(e.target.value);
                        }}
                        type="radio"
                        id="sssVerifikasi"
                        name="ssVerifikasi"
                        value=" Ditolak"
                      />
                      <label className="pl-2">Ditolak</label>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-neutral-500 text-sm font-semibold">
                      {incoming?.verifikasi}
                    </p>
                  </>
                )}
              </div>
              {incoming?.status == 'incoming' &&
              incoming?.waktu_mulai != null &&
              incoming?.waktu_selesai != null ? (
                <>
                  <button
                    type="submit"
                    value={'submit'}
                    className="bg-[#0065DE] px-4 py-2 rounded-sm text-center text-white text-xs font-bold"
                  >
                    SUBMIT CHECKSHEET
                  </button>
                </>
              ) : (
                <></>
              )}
            </div>
          </div>
        </form>
      </main>
    </>
  );
}

export default IncomingChemical;
