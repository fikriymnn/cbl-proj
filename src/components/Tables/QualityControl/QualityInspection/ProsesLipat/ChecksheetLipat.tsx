import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import convertTimeStampToDateTime from '../../../../../utils/converDateTime';
import Loading from '../../../../Loading';
import { useReactToPrint } from 'react-to-print';
import printIcon from '../../../../../images/icon/print.svg';
import convertDateToTime from '../../../../../utils/converDateToTime';
import convertTimeStampToDate from '../../../../../utils/convertDate';
import formatInteger from '../../../../../utils/formaterInteger';
import ptcbl from '../../../../../images/ptcbl.png';

function ChecksheetLipat() {
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const kosong: any = [];
  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  const date = today.getDate();
  const currentDate = month + '/' + date + '/' + year;
  const navigate = useNavigate();
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

  useEffect(() => {
    getInspection();
  }, []);

  async function getInspection() {
    const url = `${import.meta.env.VITE_API_LINK}/qc/cs/inspeksiLipat/${id}`;

    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      console.log(res.data.data);
      setIncoming(res.data.data);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }
  async function startTask(id: any) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiLipat/start/${id}`;

    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        withCredentials: true,
      });
      setIsLoading(false);
      getInspection();
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }

  const waktuMulaiincoming = convertTimeStampToDateTime(
    incoming != null && incoming?.waktu_mulai,
  );

  const waktuSelesaiincoming =
    incoming != null && incoming?.waktu_selesai != null
      ? convertTimeStampToDateTime(incoming?.waktu_selesai)
      : '-';

  async function tambahChecksheetPoint(id: number) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiLipat/addPoint/${id}`;
    try {
      setIsLoading(true);
      const res = await axios.put(
        url,
        {},
        {
          withCredentials: true,
        },
      );
      setIsLoading(false);
      getInspection();
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }

  async function saveChecksheetResult(
    id: number,
    hasilCheck: any,
    start: any,
    index: number,
  ) {
    const tes = hasilCheck?.some(
      (data: { hasil_check: any }) => data?.hasil_check === null,
    );
    const tesCtt = hasilCheck?.some(
      (data: { keterangan: any }) => data?.keterangan === null,
    );

    if (tesCtt == true) {
      alert('Keterangan Belum Terisi Semua');
      return;
    }
    if (tes == true) {
      alert('Point Belum Terisi Semua');
      return;
    }

    if (!start) {
      // Check if start time is available
      alert('Task tidak bisa diberhentikan: Belum Start.');
      return; // Exit function if no start time
    }

    const stopTime = new Date();
    const timestamp = convertTimeStampToDateTime(new Date());

    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiLipat/stop/${id}`;
    try {
      setIsLoading(true);
      const elapsedSeconds = await calculateElapsedTime(start, stopTime);

      // **Save total seconds elsewhere**
      const totalSecondsToSave = elapsedSeconds;
      // Use totalSecondsToSave for your saving logic (e.g., local storage, separate API)

      // Formatted time can be used for logging if needed
      const formattedTime = formatElapsedTime(elapsedSeconds);
      const res = await axios.put(
        url,
        {
          qty: incoming?.inspeksi_lipat_point[index]?.qty,
          hasil_check: hasilCheck,
          lama_pengerjaan: totalSecondsToSave,
        },
        {
          withCredentials: true,
        },
      );
      setIsLoading(false);
      getInspection();
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }

  async function sumbitChecksheet(id: number) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiLipat/done/${id}`;
    try {
      setIsLoading(true);
      const res = await axios.put(
        url,
        {
          catatan: ctt,
          qty: qty,
        },
        {
          withCredentials: true,
        },
      );
      setIsLoading(false);
      alert('Data Berhasil Di-Update');
      getInspection();
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }

  const handleChangeQty = (e: any, i: number) => {
    const { name, value } = e.target;
    const onchangeVal: any = incoming;
    onchangeVal.inspeksi_lipat_point[i][name] = value;
    setIncoming(onchangeVal);
  };

  const handleChangePoint = (e: any, i: number, ii: number) => {
    const { name, value } = e.target;
    const onchangeVal: any = incoming;
    onchangeVal.inspeksi_lipat_point[i].inspeksi_lipat_result[ii][name] = value;
    setIncoming(onchangeVal);
  };

  const handleChangePointRadio = (e: any, i: number, ii: number) => {
    const { name, value } = e.target;
    const onchangeVal: any = incoming;
    onchangeVal.inspeksi_lipat_point[i].inspeksi_lipat_result[ii][
      'hasil_check'
    ] = value;
    setIncoming(onchangeVal);
  };

  const [ctt, setCtt] = useState<any>();
  const [qty, setQTY] = useState<any>(0);

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

  function calculateElapsedTime(startTime: any, stopTime: Date) {
    const start = new Date(startTime);
    const diffInMs = stopTime.getTime() - start.getTime();
    // Convert milliseconds to your desired unit (minutes, hours)
    const elapsedTime = Math.round(diffInMs / 1000);
    console.log(elapsedTime); // Example: minutes
    return elapsedTime;
  }

  const isOnprogres = incoming?.inspeksi_lipat_point.some(
    (data: { status: any }) => data?.status === 'on progress',
  );
  const isIncoming = incoming?.inspeksi_lipat_point.some(
    (data: { status: any }) => data?.status === 'incoming',
  );

  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });
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
            
            /* A4 page setup with consistent scale */
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
            
            /* Ensure table fits width */
            .print-container table {
              width: 100% !important;
              table-layout: fixed;
            }
            
            /* Print settings - allow multiple pages */
            @media print {
              html, body {
                width: 210mm;
              }
              
              .print-container {
                page-break-inside: auto; /* Allow page breaks within container */
              }
              
              /* Keep table rows together where possible */
              tr {
                page-break-inside: avoid;
              }
              
              /* Keep table headers with their tables */
              thead {
                display: table-header-group;
              }
              
              /* Better page break handling */
              h1, h2, h3, h4, h5 {
                page-break-after: avoid;
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
            <div id="print-area" className="p-6 bg-white">
              <div className="min-w-full bg-white">
                {/* Header */}
                <div className="text-center mb-4">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr>
                        <td colSpan={3} className="border border-black p-2">
                          <div className="flex items-center">
                            <div className="w-24 flex justify-center">
                              <img src={ptcbl} alt="logo" />
                            </div>
                            <div className="flex-grow text-center font-bold text-lg">
                              QUALITY ASSURANCE DEPARTMENT
                            </div>
                            <div className="w-24 flex justify-center"> </div>
                          </div>
                        </td>
                        <td
                          rowSpan={2}
                          className="border border-black p-2 text-left font-bold"
                        >
                          No. Dok : {incoming?.no_doc}
                        </td>
                      </tr>
                      <tr>
                        <td
                          colSpan={3}
                          className="border border-black p-2 text-center font-bold"
                        >
                          CHECKSHEET LIPAT
                        </td>
                      </tr>
                    </thead>
                  </table>
                </div>

                {/* Information Section */}
                <div className="grid grid-cols-2 gap-4 mb-6 border border-black p-4">
                  <div>
                    <div className="grid grid-rows-6 gap-1">
                      <div className="flex">
                        <span className="font-semibold w-24">Tanggal</span>
                        <span>
                          : {convertTimeStampToDate(incoming?.createdAt)}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="font-semibold w-24">No. JO</span>
                        <span>: {incoming?.no_jo}</span>
                      </div>
                      <div className="flex">
                        <span className="font-semibold w-24">No. IO</span>
                        <span>: {incoming?.no_io}</span>
                      </div>
                      <div className="flex">
                        <span className="font-semibold w-24">Status JO</span>
                        <span>: {incoming?.status_jo}</span>
                      </div>
                      <div className="flex">
                        <span className="font-semibold w-24">Item</span>
                        <span>: {incoming?.item}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="grid grid-rows-6 gap-1">
                      <div className="flex">
                        <span className="font-semibold w-24">Jam</span>
                        <span>: {convertDateToTime(incoming?.createdAt)}</span>
                      </div>
                      <div className="flex">
                        <span className="font-semibold w-24">Shift</span>
                        <span>: {incoming?.shift}</span>
                      </div>
                      <div className="flex">
                        <span className="font-semibold w-24">Operator</span>
                        <span>: {incoming?.operator}</span>
                      </div>
                      <div className="flex">
                        <span className="font-semibold w-24">Mesin</span>
                        <span>: {incoming?.mesin}</span>
                      </div>
                      <div className="flex">
                        <span className="font-semibold w-24">QTY</span>
                        <span>
                          :{' '}
                          {incoming?.qty_jo == null || incoming?.qty_jo == 0
                            ? '-'
                            : formatInteger(incoming?.qty_jo)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Time Tracking */}
                <div className="border border-black p-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex">
                        <span className="font-semibold w-32">Waktu Mulai</span>
                        <span>
                          : {convertTimeStampToDateTime(incoming?.waktu_mulai)}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="font-semibold w-32">
                          Waktu Selesai
                        </span>
                        <span>
                          :{' '}
                          {convertTimeStampToDateTime(incoming?.waktu_selesai)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="flex">
                        <span className="font-semibold w-32">
                          Lama Pengerjaan
                        </span>
                        <span>
                          :{' '}
                          {incoming?.lama_pengerjaan != null
                            ? formatElapsedTime(incoming?.lama_pengerjaan)
                            : ''}{' '}
                          Detik
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Checksheet Table */}

                {incoming?.inspeksi_lipat_point.map(
                  (dataPoint: any, pointIndex: any) => (
                    <div key={`point-${pointIndex}`} className="mb-6">
                      {/* Inspector Info */}
                      <div className="border border-black p-4 mb-4 bg-gray-50">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="flex">
                              <span className="font-semibold w-32">
                                Inspector
                              </span>
                              <span>: {dataPoint?.inspektor?.nama}</span>
                            </div>
                            <div className="flex">
                              <span className="font-semibold w-32">
                                Quantity
                              </span>
                              <span>
                                :{' '}
                                {dataPoint?.qty == null || dataPoint?.qty == 0
                                  ? '-'
                                  : formatInteger(dataPoint?.qty)}
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="flex">
                              <span className="font-semibold w-32">Waktu</span>
                              <span>
                                :{' '}
                                {convertTimeStampToDateTime(
                                  dataPoint.waktu_mulai,
                                )}
                              </span>
                            </div>
                            <div className="flex">
                              <span className="font-semibold w-32">Durasi</span>
                              <span>
                                :{' '}
                                {dataPoint?.lama_pengerjaan != null
                                  ? formatElapsedTime(
                                      dataPoint?.lama_pengerjaan,
                                    )
                                  : ''}{' '}
                                Detik
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Results Table */}
                      <table className="w-full text-left border-collapse border border-black">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-black p-2 w-10">No</th>
                            <th className="border border-black p-2">
                              Point Check
                            </th>
                            <th className="border border-black p-2">Acuan</th>
                            <th className="border border-black p-2">
                              Hasil Check
                            </th>
                            <th className="border border-black p-2">
                              Keterangan
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {dataPoint.inspeksi_lipat_result.map(
                            (dataResult: any, resultIndex: any) => (
                              <tr key={`result-${pointIndex}-${resultIndex}`}>
                                <td className="border border-black p-2">
                                  {resultIndex + 1}
                                </td>
                                <td className="border border-black p-2">
                                  {dataResult.point_check}
                                </td>
                                <td className="border border-black p-2">
                                  {dataResult.acuan}
                                </td>
                                <td className="border border-black p-2">
                                  {dataResult.hasil_check}
                                </td>
                                <td className="border border-black p-2">
                                  {dataResult.keterangan}
                                </td>
                              </tr>
                            ),
                          )}
                        </tbody>
                      </table>
                    </div>
                  ),
                )}

                {/* Catatan */}
                <div className="border border-black p-4 mb-6">
                  <div className="font-semibold mb-2">Catatan:</div>
                  <div>{incoming?.catatan}</div>
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
            sumbitChecksheet(incoming?.id);
          }}
        >
          <div className="min-w-[700px] bg-white rounded-xl">
            <div className="text-[14px] items-center justify-between font-semibold w-full flex border-b-8  border-[#D8EAFF] py-4 px-9 md:ps-9 ps-12">
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
                Checksheet Lipat
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
            </div>

            <div className="grid grid-cols-10 border-b-8 border-[#D8EAFF]">
              <div className="grid grid-rows-6 gap-1 col-span-2 px-10 py-4 ">
                <label className="text-neutral-500 text-sm font-semibold">
                  Tanggal
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  No. JO
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  No. IO
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Status JO
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Item
                </label>
              </div>
              <div className="grid grid-rows-6 gap-1 col-span-2 px-10 py-4">
                <label className="text-neutral-500 text-sm font-semibold">
                  : {convertTimeStampToDate(incoming?.createdAt)}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {incoming?.no_jo}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {incoming?.no_io}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {incoming?.status_jo}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {incoming?.item}
                </label>
              </div>

              <div className="grid grid-rows-6  gap-1 col-span-2 justify-between px-10 py-4">
                <label className="text-neutral-500 text-sm font-semibold">
                  Jam
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Shift
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Operator
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Mesin
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  QTY
                </label>
              </div>
              <div className="grid grid-rows-6  gap-1 col-span-2 justify-between px-2 py-4">
                <label className="text-neutral-500 text-sm font-semibold">
                  : {convertDateToTime(incoming?.createdAt)}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {incoming?.shift}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {incoming?.operator}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {incoming?.mesin}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  :{' '}
                  {incoming?.qty_jo == null || incoming?.qty_jo == 0
                    ? '-'
                    : formatInteger(incoming?.qty_jo)}
                </label>
                {/* {
                  incoming?.status == 'incoming' ? (
                    <>
                      <input
                        type='number'
                        required
                        onChange={(e) => {
                          setQTY(e.target.value);
                        }}
                        className="peer h-full min-h-[50px] w-full resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                      ></input>
                    </>
                  ) : (
                    <>:{incoming?.qty}</>
                  )} */}
              </div>
            </div>

            <div className="grid grid-cols-12 px-3 py-4 border-b-8 border-[#D8EAFF] gap-2">
              <div className="flex gap-4 col-span-2">
                <label className="text-neutral-500 text-sm font-semibold">
                  No
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Point Check
                </label>
              </div>
              <label className="text-neutral-500 text-sm font-semibold col-span-2">
                Acuan
              </label>
              <label className="text-neutral-500 text-sm font-semibold col-span-2">
                Hasil Check
              </label>
              <label className="text-neutral-500 text-sm font-semibold col-span-2">
                Keterangan
              </label>
            </div>

            {/* =============================Point 1========================== */}

            <>
              {incoming?.inspeksi_lipat_point.map(
                (dataPoint: any, iPoint: number) => {
                  return (
                    <>
                      <div className="flex flex-col gap-4">
                        <div className="px-4 py-4">
                          {dataPoint?.waktu_mulai == null &&
                            dataPoint?.waktu_selesai == null && (
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
                                      type="button"
                                      onClick={() => {
                                        startTask(dataPoint?.id);
                                      }}
                                      className="flex w-[20%]  rounded-md bg-[#00B81D] justify-center items-center px-2 py-2 hover:cursor-pointer"
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
                          {dataPoint?.status == 'on progress' && (
                            <>
                              <div>
                                <label className="text-neutral-500 text-sm font-semibold">
                                  Inspector : {dataPoint?.inspektor?.nama}
                                </label>
                                <p className="md:text-[14px] text-[9px] font-semibold">
                                  Time :{' '}
                                  {convertTimeStampToDateTime(
                                    dataPoint.waktu_mulai,
                                  )}
                                </p>
                                <>
                                  <p className="font-bold text-[#00B81D]">
                                    Task Sudah Dimulai
                                  </p>
                                </>
                              </div>
                            </>
                          )}
                          {dataPoint?.status == 'done' && (
                            <>
                              <div className="gap-1 flex flex-col">
                                <label className="text-neutral-500 text-sm font-semibold">
                                  Inspector : {dataPoint?.inspektor?.nama}
                                </label>
                                <p className="md:text-[14px] text-[9px] font-semibold">
                                  Time :{' '}
                                  {convertTimeStampToDateTime(
                                    dataPoint.waktu_mulai,
                                  )}
                                </p>
                                <p className="md:text-[14px] text-[9px] font-semibold text-stone-400">
                                  {dataPoint?.lama_pengerjaan != null
                                    ? formatElapsedTime(
                                        dataPoint?.lama_pengerjaan,
                                      )
                                    : ''}{' '}
                                  Detik
                                </p>
                              </div>
                            </>
                          )}
                        </div>

                        <div className="flex px-2 gap-4">
                          <label className="text-neutral-500 text-sm font-semibold">
                            Quantity
                          </label>
                          {dataPoint.status == 'on progress' ? (
                            <>
                              <input
                                type="text"
                                required
                                name="qty"
                                onChange={(e) => {
                                  handleChangeQty(e, iPoint);
                                }}
                                className="border-2 border-stroke w-[10%] rounded-md"
                              ></input>
                            </>
                          ) : (
                            <>
                              <label className="text-neutral-500 text-sm font-semibold">
                                {dataPoint?.qty == null || dataPoint?.qty == 0
                                  ? '-'
                                  : formatInteger(dataPoint?.qty)}
                              </label>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-12 px-3 py-4 border-b-8 border-[#D8EAFF] gap-2">
                        {dataPoint?.inspeksi_lipat_result?.map(
                          (dataResult: any, iResult: number) => {
                            return (
                              <>
                                {dataPoint.status == 'on progress' ? (
                                  <>
                                    <div className="flex gap-4 col-span-2">
                                      <label className="text-neutral-500 text-sm font-semibold">
                                        {iResult + 1}
                                      </label>
                                      <label className="text-neutral-500 text-sm font-semibold">
                                        {dataResult.point_check}
                                      </label>
                                    </div>
                                    <label className="text-neutral-400 text-sm font-semibold col-span-2">
                                      {dataResult.acuan}
                                    </label>
                                    <div className="flex flex-col gap-1 col-span-2">
                                      <div>
                                        <input
                                          required
                                          type="radio"
                                          id="sesuai1"
                                          name={`sesuai1 ${iResult}`}
                                          value="sesuai"
                                          onChange={(e) => {
                                            // hasvalue(iPoint)
                                            // console.log(isOnprogres2)
                                            handleChangePointRadio(
                                              e,
                                              iPoint,
                                              iResult,
                                            );
                                          }}
                                        />
                                        <label className="pl-2">Sesuai</label>
                                      </div>
                                      <div>
                                        <input
                                          required
                                          type="radio"
                                          id="sesuai12"
                                          name={`sesuai1 ${iResult}`}
                                          value="tidak sesuai"
                                          onChange={(e) => {
                                            // hasvalue(iPoint)
                                            handleChangePointRadio(
                                              e,
                                              iPoint,
                                              iResult,
                                            );
                                          }}
                                        />
                                        <label className="pl-2">
                                          Tidak Sesuai
                                        </label>
                                      </div>
                                    </div>
                                    <textarea
                                      required
                                      name="keterangan"
                                      onChange={(e) => {
                                        handleChangePoint(e, iPoint, iResult);
                                      }}
                                      className=" col-span-3 peer h-full min-h-[50px] w-full resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                                    ></textarea>
                                    <div className="flex flex-col w-full col-span-3">
                                      <label className="text-neutral-500 text-sm font-semibold">
                                        Upload Foto
                                      </label>
                                      <div className="flex w-full rounded-md border border-stroke px-2 py-2">
                                        <label
                                          htmlFor="formFile"
                                          className="flex items-center px-4 py-1 rounded-md bg-primary text-white font-medium cursor-pointer hover:bg-primary-dark"
                                        >
                                          Pilih File
                                          <input
                                            type="file"
                                            id="formFile"
                                            accept="image/*"
                                            className="hidden"
                                          />
                                        </label>

                                        <span
                                          id="formFile"
                                          className="ml-2 text-sm"
                                        ></span>
                                      </div>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div className="flex gap-4 col-span-2">
                                      <label className="text-neutral-500 text-sm font-semibold">
                                        {iResult + 1}
                                      </label>
                                      <label className="text-neutral-500 text-sm font-semibold">
                                        {dataResult.point_check}
                                      </label>
                                    </div>
                                    <label className="text-neutral-400 text-sm font-semibold col-span-2">
                                      {dataResult.acuan}
                                    </label>
                                    <div className="flex flex-col gap-1 col-span-2">
                                      {
                                        dataPoint.inspeksi_lipat_result[iResult]
                                          ?.hasil_check
                                      }
                                    </div>
                                    <textarea
                                      defaultValue={
                                        dataPoint.inspeksi_lipat_result[iResult]
                                          ?.keterangan
                                      }
                                      name="keterangan"
                                      readOnly
                                      className=" col-span-3 peer h-full min-h-[50px] w-full resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                                    ></textarea>
                                    <div className="flex flex-col w-full col-span-3"></div>
                                  </>
                                )}
                              </>
                            );
                          },
                        )}
                        {dataPoint.status == 'on progress' ? (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                saveChecksheetResult(
                                  dataPoint.id,
                                  dataPoint.inspeksi_lipat_result,
                                  dataPoint.waktu_mulai,
                                  iPoint,
                                )
                              }
                              className="bg-green-500 h-10  rounded-md  text-white text-xs font-bold"
                            >
                              {isLoading ? 'Loading...' : 'SIMPAN'}
                            </button>
                            {isLoading && <Loading />}
                          </>
                        ) : null}
                      </div>
                    </>
                  );
                },
              )}
              {!isOnprogres && !isIncoming && incoming?.status != 'history' && (
                <>
                  <div className="px-2 py-3">
                    <button
                      disabled={isLoading}
                      type="button"
                      onClick={() => {
                        tambahChecksheetPoint(incoming.id);
                      }}
                      className="bg-blue-500 h-10 w-20  rounded-md  text-white text-xs font-bold"
                    >
                      {isLoading ? 'Loading...' : 'TAMBAH'}
                    </button>
                    {isLoading && <Loading />}
                  </div>
                </>
              )}
            </>

            {/* =============================================Checksheet STOP==========================================================*/}
            {incoming?.waktu_mulai != null &&
              incoming?.waktu_selesai != null && (
                <>
                  {/* =============================Point 1========================== */}

                  <>
                    {incoming?.inspeksi_lipat_point.map(
                      (dataPoint: any, iPoint: number) => {
                        return (
                          <div className="grid grid-cols-12 px-3 py-4 border-b-8 border-[#D8EAFF] gap-2">
                            {dataPoint.inspeksi_lipat_result.map(
                              (dataResult: any, iResult: number) => {
                                return (
                                  <>
                                    <div className="flex gap-4 col-span-2">
                                      <label className="text-neutral-500 text-sm font-semibold">
                                        {iResult + 1}
                                      </label>
                                      <label className="text-neutral-500 text-sm font-semibold">
                                        {dataResult.point_check}
                                      </label>
                                    </div>
                                    <label className="text-neutral-400 text-sm font-semibold col-span-2">
                                      {dataResult.acuan}
                                    </label>
                                    <div className="flex flex-col gap-1 col-span-2">
                                      <label className="text-neutral-400 text-sm font-semibold col-span-2">
                                        {dataResult.hasil_check}
                                      </label>
                                    </div>
                                    <textarea
                                      name="keterangan"
                                      disabled
                                      defaultValue={dataResult.keterangan}
                                      className=" col-span-3 peer h-full min-h-[50px] w-full resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                                    ></textarea>
                                    <div className="flex flex-col w-full col-span-3"></div>
                                  </>
                                );
                              },
                            )}
                          </div>
                        );
                      },
                    )}
                  </>
                </>
              )}

            <div className="bg-white grid grid-cols-10 px-4 py-4 items-center gap-4">
              <label className="text-neutral-500 text-sm font-semibold col-span-8">
                Catatan
                {incoming?.status == 'incoming' ? (
                  <>
                    <textarea
                      required
                      onChange={(e) => {
                        setCtt(e.target.value);
                      }}
                      className="peer h-full min-h-[50px] w-full resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                    ></textarea>
                  </>
                ) : (
                  <>:{incoming?.catatan}</>
                )}
              </label>

              <div className="flex h-full col-span-2 items-end justify-end w-full">
                {!isIncoming &&
                !isOnprogres &&
                incoming?.status == 'incoming' ? (
                  <>
                    <button
                      disabled={isLoading}
                      type="submit"
                      value="submit"
                      className="bg-green-500 h-10 px-6 py-3 rounded-md  text-white text-xs font-bold"
                    >
                      {isLoading ? 'Loading...' : 'SUBMIT CHECKSHEET'}
                    </button>
                    {isLoading && <Loading />}
                  </>
                ) : (
                  <></>
                )}
              </div>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}

export default ChecksheetLipat;
