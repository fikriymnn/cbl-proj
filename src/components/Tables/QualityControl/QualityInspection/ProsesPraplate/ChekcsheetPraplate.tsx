import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import ptcbl from '../../../../../images/ptcbl.png';
import convertTimeStampToDateOnly from '../../../../../utils/convertDateOnly';
function ChecksheetPraplate() {
  const [isMobile, setIsMobile] = useState(false);
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
  const [HasilCheck, setHasilCheck] = useState<any>();

  useEffect(() => {
    getInspection();
  }, []);

  async function getInspection() {
    const url = `${import.meta.env.VITE_API_LINK}/qc/cs/inspeksiPraPlate/${id}`;

    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      console.log('tiket', res.data.data || res.data);
      setIncoming(res.data.data);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }
  async function startTask(id: any) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiPraPlate/start/${id}`;

    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      getInspection();
    } catch (error: any) {
      console.log(error);
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

  async function sumbitChecksheet(id: number, start: any) {
    if (!start) {
      // Check if start time is available
      alert('Task tidak bisa diberhentikan: Belum Start.');
      return; // Exit function if no start time
    }
    if (ctt == null) {
      // Check if start time is available
      alert('Data Tidak Lengkap');
      return; // Exit function if no start time
    }
    // if (
    //   incoming?.inspeksi_potong_result[0].hasil_check == null ||
    //   incoming?.inspeksi_potong_result[0].keterangan == null ||
    //   incoming?.inspeksi_potong_result[1].hasil_check == null ||
    //   incoming?.inspeksi_potong_result[1].keterangan == null ||
    //   incoming?.inspeksi_potong_result[2].hasil_panjang == null ||
    //   incoming?.inspeksi_potong_result[2].hasil_lebar == null ||
    //   incoming?.inspeksi_potong_result[2].keterangan == null ||
    //   incoming?.inspeksi_potong_result[3].hasil_check == null ||
    //   incoming?.inspeksi_potong_result[3].keterangan == null
    // ) {
    //   alert('Checksheet belum terisi semua');
    //   return;
    // }

    const stopTime = new Date();
    const timestamp = convertDatetimeToDate(new Date());

    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiPraPlate/done/${id}`;
    try {
      const elapsedSeconds = await calculateElapsedTime(start, stopTime);

      // **Save total seconds elsewhere**
      const totalSecondsToSave = elapsedSeconds;
      // Use totalSecondsToSave for your saving logic (e.g., local storage, separate API)

      // Formatted time can be used for logging if needed
      const formattedTime = formatElapsedTime(elapsedSeconds);

      console.log(formattedTime);
      const res = await axios.put(
        url,
        {
          catatan: ctt,
          lama_pengerjaan: totalSecondsToSave,
          hasil_check: incoming.inspeksi_pra_plate_result,
          hasil: HasilCheck,
        },
        {
          withCredentials: true,
        },
      );

      console.log('Succes', timestamp);
      alert('Data Berhasil Di-Update');
      console.log('succes');
      getInspection();
    } catch (error: any) {
      console.log(error);
    }
  }

  const [merk, setMerk] = useState<any>();
  const [ctt, setCtt] = useState<any>();
  const [isOpen, setIsOpen] = useState(false);
  const tanggal = convertTimeStampToDateOnly(incoming?.createdAt);
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
                          PRA-PLATE CHECKSHEET
                        </td>
                      </tr>
                    </thead>
                  </table>
                </div>

                {/* Information Section */}
                <div className="mb-6 p-4">
                  <table className="w-full border-collapse">
                    <tbody>
                      <tr>
                        <td className="font-semibold p-2 w-1/4">Tanggal</td>
                        <td className="p-2">: {tanggal}</td>
                        <td className="font-semibold p-2 w-1/4">Jam</td>
                        <td className="p-2">: {incoming?.jam}</td>
                      </tr>
                      <tr>
                        <td className="font-semibold p-2">No. JO</td>
                        <td className="p-2">: {incoming?.no_jo}</td>
                        <td className="font-semibold p-2">Nama Produk</td>
                        <td className="p-2">: {incoming?.nama_produk}</td>
                      </tr>
                      <tr>
                        <td className="font-semibold p-2">No. IO</td>
                        <td className="p-2">: {incoming?.no_io}</td>
                        <td className="font-semibold p-2">Customer</td>
                        <td className="p-2">: {incoming?.customer}</td>
                      </tr>
                      <tr>
                        <td className="font-semibold p-2">Status JO</td>
                        <td className="p-2">: {incoming?.status_jo}</td>
                        <td className="font-semibold p-2">Keterangan</td>
                        <td className="p-2">: {incoming?.keterangan}</td>
                      </tr>
                      <tr>
                        <td className="font-semibold p-2">Mesin Cetak</td>
                        <td className="p-2">: {incoming?.mesin}</td>
                        <td className="font-semibold p-2">Inspector</td>
                        <td className="p-2">: {incoming?.inspektor?.nama}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Time Tracking */}
                <div className="border border-black p-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex">
                        <span className="font-semibold w-32">Waktu Mulai</span>
                        <span>: {waktuMulaiincoming}</span>
                      </div>
                      <div className="flex">
                        <span className="font-semibold w-32">
                          Waktu Selesai
                        </span>
                        <span>: {waktuSelesaiincoming}</span>
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
                <table className="w-full text-left border-collapse border border-black mb-6">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-black p-2 w-10">No</th>
                      <th className="border border-black p-2">Point Check</th>
                      <th className="border border-black p-2">Acuan</th>
                      <th className="border border-black p-2">Hasil Check</th>
                      <th className="border border-black p-2">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Point 1 */}
                    <tr>
                      <td className="border border-black p-2">1</td>
                      <td className="border border-black p-2">Redaksi</td>
                      <td className="border border-black p-2">Acc Artwork</td>
                      <td className="border border-black p-2">
                        {incoming?.inspeksi_pra_plate_result[0].hasil_check}
                      </td>
                      <td className="border border-black p-2">
                        {incoming?.inspeksi_pra_plate_result[0].keterangan}
                      </td>
                    </tr>

                    {/* Point 2 */}
                    <tr>
                      <td className="border border-black p-2">2</td>
                      <td className="border border-black p-2">Design</td>
                      <td className="border border-black p-2">Acc Artwork</td>
                      <td className="border border-black p-2">
                        {incoming?.inspeksi_pra_plate_result[1].hasil_check}
                      </td>
                      <td className="border border-black p-2">
                        {incoming?.inspeksi_pra_plate_result[1].keterangan}
                      </td>
                    </tr>

                    {/* Point 3 */}
                    <tr>
                      <td className="border border-black p-2">3</td>
                      <td className="border border-black p-2">Bleed</td>
                      <td className="border border-black p-2">Film Pisau</td>
                      <td className="border border-black p-2">
                        {incoming?.inspeksi_pra_plate_result[2].hasil_check}
                      </td>
                      <td className="border border-black p-2">
                        {incoming?.inspeksi_pra_plate_result[2].keterangan}
                      </td>
                    </tr>

                    {/* Point 4 */}
                    <tr>
                      <td className="border border-black p-2">4</td>
                      <td className="border border-black p-2">Mounting</td>
                      <td className="border border-black p-2">Job Order</td>
                      <td className="border border-black p-2">
                        {incoming?.inspeksi_pra_plate_result[3].hasil_check}
                      </td>
                      <td className="border border-black p-2">
                        {incoming?.inspeksi_pra_plate_result[3].keterangan}
                      </td>
                    </tr>

                    {/* Point 5 */}
                    <tr>
                      <td className="border border-black p-2">5</td>
                      <td className="border border-black p-2">Kross Potong</td>
                      <td className="border border-black p-2">
                        Berdasarkan Potong Bahan
                      </td>
                      <td className="border border-black p-2">
                        {incoming?.inspeksi_pra_plate_result[4].hasil_check}
                      </td>
                      <td className="border border-black p-2">
                        {incoming?.inspeksi_pra_plate_result[4].keterangan}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Catatan */}
                <div className="border border-black p-4 mb-6">
                  <div className="font-semibold mb-2">Catatan:</div>
                  <div>{incoming?.catatan}</div>
                </div>

                {/* Hasil Check */}
                <div className="border border-black p-4 mb-6">
                  <div className="font-semibold mb-2">Hasil Check:</div>
                  <div>{incoming?.hasil_check}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <main className="overflow-x-hidden">
        <div className="min-w-[700px] bg-white rounded-xl">
          <p className="text-[14px] font-semibold w-full flex justify-between border-b-8 border-[#D8EAFF] py-4 px-9 md:ps-9 ps-12">
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
              Checksheet Pre-Plate
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
                No. JO
              </label>
              <label className="text-neutral-500 text-sm font-semibold">
                No. IO
              </label>
              <label className="text-neutral-500 text-sm font-semibold">
                Status JO
              </label>
              <label className="text-neutral-500 text-sm font-semibold">
                Mesin Cetak
              </label>
            </div>
            <div className="grid grid-rows-6 gap-1 col-span-2 px-10 py-4">
              <label className="text-neutral-500 text-sm font-semibold">
                : {tanggal}
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
                : {incoming?.mesin}
              </label>
            </div>

            <div className="grid grid-rows-6  gap-1 col-span-2 justify-between px-10 py-4">
              <label className="text-neutral-500 text-sm font-semibold">
                Jam
              </label>
              <label className="text-neutral-500 text-sm font-semibold">
                Nama Produk
              </label>
              <label className="text-neutral-500 text-sm font-semibold">
                Customer
              </label>
              <label className="text-neutral-500 text-sm font-semibold">
                Keterangan
              </label>
              <label className="text-neutral-500 text-sm font-semibold">
                Inspector
              </label>
            </div>
            <div className="grid grid-rows-6  gap-1 col-span-2 justify-between px-2 py-4">
              <label className="text-neutral-500 text-sm font-semibold">
                : {incoming?.jam}
              </label>
              <label className="text-neutral-500 text-sm font-semibold">
                : {incoming?.nama_produk}
              </label>
              <label className="text-neutral-500 text-sm font-semibold">
                : {incoming?.customer}
              </label>
              <label className="text-neutral-500 text-sm font-semibold">
                : {incoming?.keterangan}
              </label>
              <label className="text-neutral-500 text-sm font-semibold">
                : {incoming?.inspektor?.nama}
              </label>
            </div>
            <div className="flex flex-col w-full items-center gap-4 px-10 py-4 col-span-2  bg-[#F6FAFF]">
              <div>
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
          <>
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
                  {/* =============================Point 1========================== */}

                  <>
                    <div className="grid grid-cols-12 px-3 py-4 border-b-8 border-[#D8EAFF] gap-2">
                      <div className="flex gap-4 col-span-2">
                        <label className="text-neutral-500 text-sm font-semibold">
                          1
                        </label>
                        <label className="text-neutral-500 text-sm font-semibold">
                          Redaksi
                        </label>
                      </div>
                      <label className="text-neutral-400 text-sm font-semibold col-span-2">
                        Acc Artwork
                      </label>
                      <div className="flex flex-col gap-1 col-span-2">
                        <div>
                          <input
                            type="radio"
                            id="sesuai1"
                            name="sesuai1"
                            value="sesuai"
                            onChange={(e) => {
                              let array = [
                                ...incoming?.inspeksi_pra_plate_result,
                              ];
                              array[0].hasil_check = e.target.value;
                              setIncoming({
                                ...incoming,
                                inspeksi_pra_plate_result: array,
                              });
                            }}
                          />
                          <label className="pl-2">Sesuai</label>
                        </div>
                        <div>
                          <input
                            type="radio"
                            id="sesuai11"
                            name="sesuai1"
                            value="tidak sesuai"
                            onChange={(e) => {
                              let array = [
                                ...incoming?.inspeksi_pra_plate_result,
                              ];
                              array[0].hasil_check = e.target.value;
                              setIncoming({
                                ...incoming,
                                inspeksi_pra_plate_result: array,
                              });
                            }}
                          />
                          <label className="pl-2">Tidak Sesuai</label>
                        </div>
                      </div>
                      <textarea
                        onChange={(e) => {
                          let array = [...incoming?.inspeksi_pra_plate_result];
                          array[0].keterangan = e.target.value;
                          setIncoming({
                            ...incoming,
                            inspeksi_pra_plate_result: array,
                          });
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

                          <span id="formFile" className="ml-2 text-sm"></span>
                        </div>
                      </div>
                    </div>
                  </>
                  {/* =============================Point 2========================== */}
                  <>
                    <div className="grid grid-cols-12 px-3 py-4 border-b-8 border-[#D8EAFF] gap-2">
                      <div className="flex gap-4 col-span-2">
                        <label className="text-neutral-500 text-sm font-semibold">
                          2
                        </label>
                        <label className="text-neutral-500 text-sm font-semibold">
                          Design
                        </label>
                      </div>
                      <label className="text-neutral-400 text-sm font-semibold col-span-2">
                        Acc Artwork
                      </label>
                      <div className="flex flex-col gap-1 col-span-2">
                        <div>
                          <input
                            type="radio"
                            id="sesuai2"
                            name="sesuai2"
                            value="sesuai"
                            onChange={(e) => {
                              let array = [
                                ...incoming?.inspeksi_pra_plate_result,
                              ];
                              array[1].hasil_check = e.target.value;
                              setIncoming({
                                ...incoming,
                                inspeksi_pra_plate_result: array,
                              });
                            }}
                          />
                          <label className="pl-2">Sesuai</label>
                        </div>
                        <div>
                          <input
                            type="radio"
                            id="sesuai2"
                            name="sesuai2"
                            value="tidak sesuai"
                            onChange={(e) => {
                              let array = [
                                ...incoming?.inspeksi_pra_plate_result,
                              ];
                              array[1].hasil_check = e.target.value;
                              setIncoming({
                                ...incoming,
                                inspeksi_pra_plate_result: array,
                              });
                            }}
                          />
                          <label className="pl-2">Tidak Sesuai</label>
                        </div>
                      </div>
                      <textarea
                        onChange={(e) => {
                          let array = [...incoming?.inspeksi_pra_plate_result];
                          array[1].keterangan = e.target.value;
                          setIncoming({
                            ...incoming,
                            inspeksi_pra_plate_result: array,
                          });
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

                          <span id="formFile" className="ml-2 text-sm"></span>
                        </div>
                      </div>
                    </div>
                  </>
                  {/* =============================Point 3========================== */}
                  <>
                    <div className="grid grid-cols-12 px-3 py-4 border-b-8 border-[#D8EAFF] gap-2">
                      <div className="flex gap-4 col-span-2">
                        <label className="text-neutral-500 text-sm font-semibold">
                          3
                        </label>
                        <label className="text-neutral-500 text-sm font-semibold">
                          Bleed
                        </label>
                      </div>
                      <label className="text-neutral-400 text-sm font-semibold col-span-2">
                        Film Pisau
                      </label>
                      <div className="flex flex-col gap-1 col-span-2">
                        <div>
                          <input
                            type="radio"
                            id="sesuai3"
                            name="sesuai3"
                            value="sesuai"
                            onChange={(e) => {
                              let array = [
                                ...incoming?.inspeksi_pra_plate_result,
                              ];
                              array[2].hasil_check = e.target.value;
                              setIncoming({
                                ...incoming,
                                inspeksi_pra_plate_result: array,
                              });
                            }}
                          />
                          <label className="pl-2">Sesuai</label>
                        </div>
                        <div>
                          <input
                            type="radio"
                            id="sesuai3"
                            name="sesuai3"
                            value="tidak sesuai"
                            onChange={(e) => {
                              let array = [
                                ...incoming?.inspeksi_pra_plate_result,
                              ];
                              array[2].hasil_check = e.target.value;
                              setIncoming({
                                ...incoming,
                                inspeksi_pra_plate_result: array,
                              });
                            }}
                          />
                          <label className="pl-2">Tidak Sesuai</label>
                        </div>
                      </div>
                      <textarea
                        onChange={(e) => {
                          let array = [...incoming?.inspeksi_pra_plate_result];
                          array[2].keterangan = e.target.value;
                          setIncoming({
                            ...incoming,
                            inspeksi_pra_plate_result: array,
                          });
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

                          <span id="formFile" className="ml-2 text-sm"></span>
                        </div>
                      </div>
                    </div>
                  </>
                  {/* =============================Point 4========================== */}
                  <>
                    <div className="grid grid-cols-12 px-3 py-4 border-b-8 border-[#D8EAFF] gap-2">
                      <div className="flex gap-4 col-span-2">
                        <label className="text-neutral-500 text-sm font-semibold">
                          4
                        </label>
                        <label className="text-neutral-500 text-sm font-semibold">
                          Mounting
                        </label>
                      </div>
                      <label className="text-neutral-400 text-sm font-semibold col-span-2">
                        Job Order
                      </label>
                      <div className="flex flex-col gap-1 col-span-2">
                        <div>
                          <input
                            type="radio"
                            id="sesuai4"
                            name="sesuai4"
                            value="sesuai"
                            onChange={(e) => {
                              let array = [
                                ...incoming?.inspeksi_pra_plate_result,
                              ];
                              array[3].hasil_check = e.target.value;
                              setIncoming({
                                ...incoming,
                                inspeksi_pra_plate_result: array,
                              });
                            }}
                          />
                          <label className="pl-2">Sesuai</label>
                        </div>
                        <div>
                          <input
                            type="radio"
                            id="sesuai4"
                            name="sesuai4"
                            value="tidak sesuai"
                            onChange={(e) => {
                              let array = [
                                ...incoming?.inspeksi_pra_plate_result,
                              ];
                              array[3].hasil_check = e.target.value;
                              setIncoming({
                                ...incoming,
                                inspeksi_pra_plate_result: array,
                              });
                            }}
                          />
                          <label className="pl-2">Tidak Sesuai</label>
                        </div>
                      </div>
                      <textarea
                        onChange={(e) => {
                          let array = [...incoming?.inspeksi_pra_plate_result];
                          array[3].keterangan = e.target.value;
                          setIncoming({
                            ...incoming,
                            inspeksi_pra_plate_result: array,
                          });
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

                          <span id="formFile" className="ml-2 text-sm"></span>
                        </div>
                      </div>
                    </div>
                  </>
                  {/* =============================Point 5========================== */}
                  <>
                    <div className="grid grid-cols-12 px-3 py-4 border-b-8 border-[#D8EAFF] gap-2">
                      <div className="flex gap-4 col-span-2">
                        <label className="text-neutral-500 text-sm font-semibold">
                          5
                        </label>
                        <label className="text-neutral-500 text-sm font-semibold">
                          Kross Potong
                        </label>
                      </div>
                      <label className="text-neutral-400 text-sm font-semibold col-span-2">
                        Berdasarkan Potong Bahan
                      </label>
                      <div className="flex flex-col gap-1 col-span-2">
                        <div>
                          <input
                            type="radio"
                            id="sesuai5"
                            name="sesuai5"
                            value="sesuai"
                            onChange={(e) => {
                              let array = [
                                ...incoming?.inspeksi_pra_plate_result,
                              ];
                              array[4].hasil_check = e.target.value;
                              setIncoming({
                                ...incoming,
                                inspeksi_pra_plate_result: array,
                              });
                            }}
                          />
                          <label className="pl-2">Sesuai</label>
                        </div>
                        <div>
                          <input
                            type="radio"
                            id="sesuai5"
                            name="sesuai5"
                            value="tidak sesuai"
                            onChange={(e) => {
                              let array = [
                                ...incoming?.inspeksi_pra_plate_result,
                              ];
                              array[4].hasil_check = e.target.value;
                              setIncoming({
                                ...incoming,
                                inspeksi_pra_plate_result: array,
                              });
                            }}
                          />
                          <label className="pl-2">Tidak Sesuai</label>
                        </div>
                      </div>
                      <textarea
                        onChange={(e) => {
                          let array = [...incoming?.inspeksi_pra_plate_result];
                          array[4].keterangan = e.target.value;
                          setIncoming({
                            ...incoming,
                            inspeksi_pra_plate_result: array,
                          });
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

                          <span id="formFile" className="ml-2 text-sm"></span>
                        </div>
                      </div>
                    </div>
                  </>
                </>
              )}
          </>
          {/* =============================================Checksheet STOP==========================================================*/}
          {incoming?.status == 'history' && (
            <>
              <div className="grid grid-cols-12 px-3 py-4 border-b-8 border-[#D8EAFF] gap-2">
                <div className="flex gap-4 col-span-2">
                  <label className="text-neutral-500 text-sm font-semibold">
                    1
                  </label>
                  <label className="text-neutral-500 text-sm font-semibold">
                    Redaksi
                  </label>
                </div>
                <label className="text-neutral-400 text-sm font-semibold col-span-2">
                  Acc Artwork
                </label>
                <div className="flex flex-col gap-1 col-span-2">
                  <div>
                    {incoming?.inspeksi_pra_plate_result[0].hasil_check}
                  </div>
                </div>
                <textarea
                  readOnly
                  defaultValue={
                    incoming?.inspeksi_pra_plate_result[0].keterangan
                  }
                  className=" col-span-3 peer h-full min-h-[50px] w-full resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                ></textarea>
                <div className="flex flex-col w-full col-span-3"></div>
              </div>
              <>
                <div className="grid grid-cols-12 px-3 py-4 border-b-8 border-[#D8EAFF] gap-2">
                  <div className="flex gap-4 col-span-2">
                    <label className="text-neutral-500 text-sm font-semibold">
                      2
                    </label>
                    <label className="text-neutral-500 text-sm font-semibold">
                      Design
                    </label>
                  </div>
                  <label className="text-neutral-400 text-sm font-semibold col-span-2">
                    Acc Artwork
                  </label>
                  <div className="flex flex-col gap-1 col-span-2">
                    <div>
                      {incoming?.inspeksi_pra_plate_result[1].hasil_check}
                    </div>
                  </div>
                  <textarea
                    readOnly
                    defaultValue={
                      incoming?.inspeksi_pra_plate_result[1].keterangan
                    }
                    className=" col-span-3 peer h-full min-h-[50px] w-full resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                  ></textarea>
                  <div className="flex flex-col w-full col-span-3"></div>
                </div>
              </>
              <>
                <div className="grid grid-cols-12 px-3 py-4 border-b-8 border-[#D8EAFF] gap-2">
                  <div className="flex gap-4 col-span-2">
                    <label className="text-neutral-500 text-sm font-semibold">
                      3
                    </label>
                    <label className="text-neutral-500 text-sm font-semibold">
                      Bleed
                    </label>
                  </div>
                  <label className="text-neutral-400 text-sm font-semibold col-span-2">
                    Film Pisau
                  </label>
                  <div className="flex flex-col gap-1 col-span-2">
                    <div>
                      {incoming?.inspeksi_pra_plate_result[2].hasil_check}
                    </div>
                  </div>
                  <textarea
                    readOnly
                    defaultValue={
                      incoming?.inspeksi_pra_plate_result[2].keterangan
                    }
                    className=" col-span-3 peer h-full min-h-[50px] w-full resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                  ></textarea>
                  <div className="flex flex-col w-full col-span-3"></div>
                </div>
              </>
              {/* =============================Point 4========================== */}
              <>
                <div className="grid grid-cols-12 px-3 py-4 border-b-8 border-[#D8EAFF] gap-2">
                  <div className="flex gap-4 col-span-2">
                    <label className="text-neutral-500 text-sm font-semibold">
                      4
                    </label>
                    <label className="text-neutral-500 text-sm font-semibold">
                      Mounting
                    </label>
                  </div>
                  <label className="text-neutral-400 text-sm font-semibold col-span-2">
                    Job Order
                  </label>
                  <div className="flex flex-col gap-1 col-span-2">
                    <div>
                      {incoming?.inspeksi_pra_plate_result[3].hasil_check}
                    </div>
                  </div>
                  <textarea
                    readOnly
                    defaultValue={
                      incoming?.inspeksi_pra_plate_result[3].keterangan
                    }
                    className=" col-span-3 peer h-full min-h-[50px] w-full resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                  ></textarea>
                  <div className="flex flex-col w-full col-span-3"></div>
                </div>
              </>
              {/* =============================Point 5========================== */}
              <>
                <div className="grid grid-cols-12 px-3 py-4 border-b-8 border-[#D8EAFF] gap-2">
                  <div className="flex gap-4 col-span-2">
                    <label className="text-neutral-500 text-sm font-semibold">
                      5
                    </label>
                    <label className="text-neutral-500 text-sm font-semibold">
                      Kross Potong
                    </label>
                  </div>
                  <label className="text-neutral-400 text-sm font-semibold col-span-2">
                    Berdasarkan Potong Bahan
                  </label>
                  <div className="flex flex-col gap-1 col-span-2">
                    <div>
                      {incoming?.inspeksi_pra_plate_result[4].hasil_check}
                    </div>
                  </div>
                  <textarea
                    readOnly
                    defaultValue={
                      incoming?.inspeksi_pra_plate_result[4].keterangan
                    }
                    className=" col-span-3 peer h-full min-h-[50px] w-full resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                  ></textarea>
                  <div className="flex flex-col w-full col-span-3"></div>
                </div>
              </>
            </>
          )}

          <div className="bg-white grid grid-cols-10 px-4 py-4 items-center gap-4">
            <label className="text-neutral-500 text-sm font-semibold col-span-6">
              Catatan
              {incoming?.status == 'incoming' ? (
                <>
                  <textarea
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
            <div className="flex flex-col gap-1 col-span-2">
              {incoming?.status == 'incoming' ? (
                <>
                  <div>
                    <input
                      type="radio"
                      id="LANJUT1"
                      name="LANJUT1"
                      value="lanjut Proses"
                      onChange={(e) => {
                        setHasilCheck(e.target.value);
                      }}
                    />
                    <label className="pl-2 font-semibold text-[#6c6b6b] ">
                      LANJUT PROSES
                    </label>
                  </div>
                  <div>
                    <input
                      type="radio"
                      id="LANJUT12"
                      name="LANJUT1"
                      value="Reject"
                      onChange={(e) => {
                        setHasilCheck(e.target.value);
                      }}
                    />
                    <label className="pl-2 font-semibold text-[#6c6b6b] ">
                      REJECT
                    </label>
                  </div>
                </>
              ) : (
                <>
                  <label className="pl-2 font-semibold text-[#6c6b6b] ">
                    {incoming?.hasil_check}
                  </label>
                </>
              )}
            </div>
            <div className="flex h-full col-span-2 items-end justify-end w-full">
              {incoming?.status == 'incoming' ? (
                <>
                  <button
                    onClick={() => {
                      console.log(incoming);
                      sumbitChecksheet(incoming?.id, incoming?.waktu_mulai);
                    }}
                    className="bg-green-500 h-10 px-6 py-3 rounded-md  text-white text-xs font-bold"
                  >
                    SUBMIT CHECKSHEET
                  </button>
                </>
              ) : (
                <></>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default ChecksheetPraplate;
