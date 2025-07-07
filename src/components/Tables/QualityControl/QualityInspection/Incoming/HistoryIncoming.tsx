import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import ptcbl from '../../../../../images/ptcbl.png';
import { X, Printer, Eye } from 'lucide-react';
import convertTimeStampToDateOnly from '../../../../../utils/convertDateOnly';

function HistoryIncoming() {
  const [isMobile, setIsMobile] = useState(false);
  const { id } = useParams();
  const handleResize = () => {
    setIsMobile(window.innerWidth < 768); // Adjust the breakpoint as needed
  };

  const [isStatusQualityPreviewOpen, setIsStatusQualityPreviewOpen] =
    useState(false);
  const openStatusQualityPreview = () => {
    setIsStatusQualityPreviewOpen(true);
  };

  const closeStatusQualityPreview = () => {
    setIsStatusQualityPreviewOpen(false);
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

  const [incoming, setIncoming] = useState<any>();

  useEffect(() => {
    getInspection();
  }, []);

  async function getInspection() {
    const url = `${import.meta.env.VITE_API_LINK}/qc/cs/inspeksiBahan/${id}`;

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
  const waktuMulai = convertDatetimeToDate(
    incoming != null && incoming?.waktu_mulai,
  );
  const waktuSelesai = convertDatetimeToDate(
    incoming != null && incoming?.waktu_selesai,
  );
  const [isOpen, setIsOpen] = useState(false);

  const openPreview = () => {
    setIsOpen(true);
  };

  const closePreview = () => {
    setIsOpen(false);
  };
  // Modified printStatusQuality function with columns fully stretched to full width
  const printStatusQuality = () => {
    const printArea = document.getElementById('status-quality-print-area');
    if (!printArea) return;

    const currentPage = window.location.href;
    const printWindow = window.open(
      currentPage,
      '_blank',
      'toolbar=0,location=1,menubar=0',
    );

    if (!printWindow) {
      alert('Please allow pop-ups for printing functionality');
      return;
    }

    const styles = Array.from(document.styleSheets)
      .map((styleSheet) => {
        try {
          return Array.from(styleSheet.cssRules)
            .map((rule) => rule.cssText)
            .join('');
        } catch (e) {
          if (styleSheet.href) {
            return `<link rel="stylesheet" href="${styleSheet.href}">`;
          }
          return '';
        }
      })
      .filter(Boolean);

    printWindow.document.open();
    printWindow.document.write(`
  <html>
    <head>
      <style>
        ${styles.join('')}

        @page {
          size: A4 landscape;
          margin: 8mm;
        }

        html, body {
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
          overflow: hidden;
          background: white;
        }

        body {
          font-family: Arial, sans-serif;
          font-size: 11px;
          line-height: 1.2;
          display: flex;
          align-items: flex-end;
          justify-content: stretch;
        }

        .print-container {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: flex-end;
          justify-content: stretch;
        }

        .content-wrapper {
          width: 100%;
          height: auto;
          display: flex;
          position: relative;
          padding-bottom: 12mm;
        }

        .content-wrapper::before {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          left: 50%;
          width: 0;
          border-left: 4px dashed #dc2626;
          transform: translateX(-1px);
          z-index: 1;
        }

        .column {
          flex: 1;
          height: 100%;
          padding: 0 4mm;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .status-title {
          font-size: 18px;
          font-weight: bold;
          text-align: center;
          margin-bottom: 12px;
          letter-spacing: 1.5px;
          color: #3b0a0a;
          text-transform: uppercase;
        }

        .info-row {
          display: flex;
          margin-bottom: 4px;
          font-size: 11px;
        }

        .info-label {
          font-weight: bold;
          width: 85px;
        }

        .info-colon {
          margin: 0 6px;
          font-weight: bold;
        }

        .info-value {
          flex: 1;
          line-height: 1.3;
        }

        .catatan-label {
          color: #dc2626;
          font-style: italic;
        }

        .decision-text {
          font-size: 22px;
          font-weight: bold;
          color: #2563eb;
          text-align: left;
          margin-top: 16px;
          margin-bottom: 8px;
        }

        .inspector-label {
          font-size: 12px;
          font-weight: bold;
          margin-bottom: 8px;
        }

        .signature-box {
          border: 2px solid #000;
          width: 80px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          font-size: 10px;
          font-weight: bold;
        }

        .bottom-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: 16px;
        }

        .inspector-name {
          font-size: 11px;
        }

        @media print {
          * {
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
            page-break-inside: avoid !important;
          }

          body::after {
            content: "";
            display: block;
            page-break-after: avoid !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="print-container">
        <div class="content-wrapper">
          ${printArea.innerHTML}
        </div>
      </div>
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          }, 500);
        }
      </script>
    </body>
  </html>
  `);
    printWindow.document.close();
  };

  const StatusQualityContent = () => (
    <div className="bg-white p-6 w-full mx-auto font-sans">
      <div className="border-2 border-black flex">
        {/* Left Column */}
        <div className="flex-1 p-4 border-r-2 border-dashed border-red-600 flex flex-col justify-between min-h-96">
          <div>
            <h3 className="text-lg font-bold text-center mb-4 tracking-wider">
              STATUS QUALITY
            </h3>

            <div className="space-y-1 text-sm mb-4">
              <div className="flex">
                <span className="font-bold w-24">Tgl Kedatangan</span>
                <span className="mx-2">:</span>
                <span>
                  {convertTimeStampToDateOnly(incoming?.createdAt) || '-'}
                </span>
              </div>

              <div className="flex">
                <span className="font-bold w-24">Bahan</span>
                <span className="mx-2">:</span>
                <span>{incoming?.jenis_kertas || '-'}</span>
              </div>

              <div className="flex">
                <span className="font-bold w-24">Ukuran</span>
                <span className="mx-2">:</span>
                <span>{incoming?.ukuran || '-'}</span>
              </div>

              <div className="flex">
                <span className="font-bold w-24">Supplier</span>
                <span className="mx-2">:</span>
                <span>{incoming?.supplier || '-'}</span>
              </div>

              <div className="flex">
                <span className="font-bold w-24">NO Lot</span>
                <span className="mx-2">:</span>
                <span>{incoming?.no_lot || '-'}</span>
              </div>

              <div className="flex">
                <span className="font-bold w-24">Keterangan</span>
                <span className="mx-2">:</span>
                <span>{incoming?.keterangan || '-'}</span>
              </div>

              <div className="flex">
                <span className="font-bold w-24">Catatan</span>
                <span className="mx-2">:</span>
                <span className="text-red-600 italic">
                  {incoming?.catatan || '-'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-blue-600 mb-2 text-left">
                {incoming?.verifikasi === 'Diterima' ? 'DITERIMA' : 'DITERIMA'}
              </h3>
              <p className="font-bold text-sm mb-2">QA Inspector,</p>
            </div>

            <div className="flex justify-between items-end pt-6">
              <div>
                <p className="text-sm mb-2">({incoming?.inspector || '-'})</p>
              </div>
              <div className="border-2 border-black p-2  h-7 flex items-center justify-center bg-white">
                <span className="text-xs font-bold">
                  {incoming?.no_doc || '-'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex-1 p-4 flex flex-col justify-between min-h-96">
          <div>
            <h3 className="text-lg font-bold text-center mb-4 tracking-wider">
              STATUS QUALITY
            </h3>

            <div className="space-y-1 text-sm mb-4">
              <div className="flex">
                <span className="font-bold w-24">Tgl Kedatangan</span>
                <span className="mx-2">:</span>
                <span>
                  {convertTimeStampToDateOnly(incoming?.createdAt) || '-'}
                </span>
              </div>

              <div className="flex">
                <span className="font-bold w-24">Bahan</span>
                <span className="mx-2">:</span>
                <span>{incoming?.jenis_kertas || '-'}</span>
              </div>

              <div className="flex">
                <span className="font-bold w-24">Ukuran</span>
                <span className="mx-2">:</span>
                <span>{incoming?.ukuran || '-'}</span>
              </div>

              <div className="flex">
                <span className="font-bold w-24">Supplier</span>
                <span className="mx-2">:</span>
                <span>{incoming?.supplier || '-'}</span>
              </div>

              <div className="flex">
                <span className="font-bold w-24">NO Lot</span>
                <span className="mx-2">:</span>
                <span>{incoming?.no_lot || '-'}</span>
              </div>

              <div className="flex">
                <span className="font-bold w-24">Keterangan</span>
                <span className="mx-2">:</span>
                <span>{incoming?.keterangan || '-'}</span>
              </div>

              <div className="flex">
                <span className="font-bold w-24">Catatan</span>
                <span className="mx-2">:</span>
                <span className="text-red-600 italic">
                  {incoming?.catatan || '-'}
                </span>
              </div>
            </div>
          </div>

          <div className="">
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-blue-600 mb-2 text-left">
                {incoming?.verifikasi === 'Diterima' ? 'DITERIMA' : 'DITERIMA'}
              </h3>
              <p className="font-bold text-sm mb-2">QA Inspector,</p>
            </div>

            <div className="flex justify-between items-end pt-6">
              <div>
                <p className="text-sm mb-2">({incoming?.inspector || '-'})</p>
              </div>
              <div className="border-2 border-black p-2  h-7 flex items-center justify-center bg-white">
                <span className="text-xs font-bold">
                  {incoming?.no_doc || '-'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
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
      <div>
        {/* Button to open the preview popup */}

        {/* Modal overlay */}
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

              {/* Print area content */}
              <div id="print-area" className="p-4 overflow-auto max-h-[80vh]">
                <div className="bg-white shadow-none">
                  {/* Checksheet table based on the image format */}
                  <table className="border-collapse border w-full text-sm">
                    <thead>
                      <tr>
                        <td colSpan={2} className="border border-black p-2">
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
                        <td
                          rowSpan={2}
                          className="border border-black p-2 text-left font-bold"
                        >
                          No. Dok : {incoming?.no_doc}
                        </td>
                      </tr>
                      <tr>
                        <td
                          colSpan={2}
                          className="border border-black p-2 text-center font-bold"
                        >
                          INCOMING INSPECTION CHECKSHEET (IIC)
                        </td>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-black p-2 w-1/3">
                          <div className="grid grid-cols-3 gap-2">
                            <div className="font-semibold">TANGGAL</div>
                            <div className="col-span-2">
                              : {incoming?.tanggal}
                            </div>

                            <div className="font-semibold">NO. LOT</div>
                            <div className="col-span-2">
                              : {incoming?.no_lot}
                            </div>

                            <div className="font-semibold">NO. SURAT JALAN</div>
                            <div className="col-span-2">
                              : {incoming?.no_surat_jalan}
                            </div>

                            <div className="font-semibold">SUPPLIER</div>
                            <div className="col-span-2">
                              : {incoming?.supplier}
                            </div>

                            <div className="font-semibold">JENIS KERTAS</div>
                            <div className="col-span-2">
                              : {incoming?.jenis_kertas}
                            </div>

                            <div className="font-semibold">UKURAN</div>
                            <div className="col-span-2">
                              : {incoming?.ukuran}
                            </div>
                          </div>
                        </td>

                        <td className="border border-black p-2 w-1/3">
                          <div className="grid grid-cols-3 gap-2">
                            <div className="font-semibold">JAM</div>
                            <div className="col-span-2">: {incoming?.jam}</div>

                            <div className="font-semibold mt-4 col-span-3">
                              STANDAR PEMERIKSAAN
                            </div>
                            <div className="col-span-3"></div>

                            <div className="font-semibold">Keterangan JO</div>
                            <div className="col-span-2">
                              : {incoming?.keterangan}
                            </div>

                            <div className="font-semibold">
                              Jumlah kedatangan
                            </div>
                            <div className="col-span-2">
                              : {incoming?.jumlah} LP
                            </div>
                            <div className="font-semibold">Jumlah Pallet</div>
                            <div className="col-span-2">
                              : {incoming?.hasil_rumus}
                            </div>
                            <div className="font-semibold">√N + 1</div>
                            <div className="col-span-2">
                              : {incoming?.hasil_rumus}
                            </div>
                          </div>
                        </td>
                        <td className="border border-black p-2 w-1/3 bg-gray-100">
                          <p
                            className={` uppercase font-semibold text-lg  ${
                              incoming?.verifikasi == 'Diterima'
                                ? 'text-green-500'
                                : 'text-red-500'
                            }`}
                          >
                            {incoming?.verifikasi}
                          </p>
                          <p className={` uppercase font-semibold text-lg `}>
                            Total skor : {incoming?.total_skor}
                          </p>
                          <div className="text-sm gap-1 flex flex-col">
                            <p>Waktu Mulai :</p>
                            <p>{waktuMulai}</p>
                            <p>Waktu Selesai :</p>
                            <p>{waktuSelesai}</p>
                            <p>Time :</p>
                            <p>
                              {formatElapsedTime(incoming?.lama_pengerjaan)}{' '}
                              Detik
                            </p>
                          </div>
                        </td>
                      </tr>

                      <tr className="bg-gray-100">
                        <td colSpan={3} className="border border-black p-2">
                          <div className="grid grid-cols-7 gap-2 font-semibold">
                            <div>KRITERIA PEMERIKSAAN</div>
                          </div>
                        </td>
                      </tr>

                      <tr>
                        <td colSpan={3} className="border border-black p-0">
                          <table className="border-collapse w-full">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="border border-black p-2 w-10 text-center">
                                  NO
                                </th>
                                <th className="border border-black p-2 text-center">
                                  KETERANGAN
                                </th>
                                <th className="border border-black p-2 text-center">
                                  ALAT UKUR
                                </th>
                                <th className="border border-black p-2 text-center">
                                  METODE
                                </th>
                                <th className="border border-black p-2 text-center">
                                  TARGET
                                </th>
                                <th className="border border-black p-2 text-center">
                                  HASIL
                                </th>
                                <th className="border border-black p-2 text-center">
                                  KETERANGAN
                                </th>
                                <th className="border border-black p-2 text-center w-16">
                                  % BOBOT
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {/* Row 1 */}
                              <tr>
                                <td className="border border-black p-2 text-center">
                                  1
                                </td>
                                <td className="border border-black p-2">
                                  JENIS KERTAS
                                </td>
                                <td className="border border-black p-2">-</td>
                                <td className="border border-black p-2">
                                  VISUAL
                                </td>
                                <td className="border border-black p-2">
                                  SESUAI SURAT JALAN
                                </td>
                                <td className="border border-black p-2">
                                  <label className="text-neutral-500 text-sm font-semibold">
                                    {incoming?.inspeksi_bahan_result[0]?.hasil}
                                  </label>
                                </td>
                                <td className="border border-black p-2">
                                  <div className="text-neutral-500 text-sm font-semibold">
                                    {
                                      incoming?.inspeksi_bahan_result[0]
                                        .keterangan_hasil
                                    }
                                  </div>
                                </td>
                                <td className="border border-black p-2 text-center">
                                  25
                                </td>
                              </tr>

                              {/* Row 2 */}
                              <tr>
                                <td className="border border-black p-2 text-center">
                                  2
                                </td>
                                <td className="border border-black p-2">
                                  GRAMATUR
                                </td>
                                <td className="border border-black p-2">
                                  TIMBANGAN DIGITAL
                                </td>
                                <td className="border border-black p-2">
                                  <div>
                                    • Potong kertas ukuran 10x10 cm di area
                                    KIRI, TENGAH, KANAN
                                  </div>
                                  <div>• Timbang masing-masing beratnya</div>
                                  <div>
                                    • Jumlahkan dan hitung nilai rata-ratanya
                                  </div>
                                </td>
                                <td className="border border-black p-2">
                                  <div>• GRAMATUR SESUAI SURAT JALAN</div>
                                  <div>• TOLERANSI ± 4%</div>
                                </td>
                                <td className="border border-black p-2">
                                  <div className="flex flex-col  w-full">
                                    <div className="flex flex-col gap-1">
                                      <label className="text-neutral-500 text-sm font-semibold ">
                                        Kiri
                                      </label>
                                      <label className="text-neutral-500 text-sm font-semibold ">
                                        {
                                          incoming?.inspeksi_bahan_result[1]
                                            .hasil_kiri
                                        }{' '}
                                        gr
                                      </label>
                                      <div>
                                        ={' '}
                                        <input
                                          name="hasilsample3"
                                          disabled
                                          value={
                                            incoming?.inspeksi_bahan_result[1]
                                              .hasil_rumus_kiri
                                          }
                                          type="text"
                                          className="border-2 border-stroke w-[40%] rounded-sm col-span-2"
                                        />{' '}
                                        g/m<sup className="">2</sup>
                                      </div>
                                      <label className="text-neutral-500 text-sm font-semibold pt-1">
                                        Tengah
                                      </label>
                                      <label className="text-neutral-500 text-sm font-semibold ">
                                        {
                                          incoming?.inspeksi_bahan_result[1]
                                            .hasil_tengah
                                        }{' '}
                                        gr
                                      </label>
                                      <div>
                                        ={' '}
                                        <input
                                          name="hasilsample3"
                                          disabled
                                          value={
                                            incoming?.inspeksi_bahan_result[1]
                                              .hasil_rumus_tengah
                                          }
                                          type="text"
                                          className="border-2 border-stroke w-[40%] rounded-sm col-span-2"
                                        />{' '}
                                        g/m<sup className="">2</sup>
                                      </div>
                                      <label className="text-neutral-500 text-sm font-semibold pt-1">
                                        Bawah
                                      </label>
                                      <label className="text-neutral-500 text-sm font-semibold ">
                                        {
                                          incoming?.inspeksi_bahan_result[1]
                                            .hasil_bawah
                                        }{' '}
                                        gr
                                      </label>
                                      <div>
                                        ={' '}
                                        <input
                                          name="hasilsample3"
                                          disabled
                                          value={
                                            incoming?.inspeksi_bahan_result[1]
                                              .hasil_rumus_kanan
                                          }
                                          type="text"
                                          className="border-2 border-stroke w-[40%] rounded-sm col-span-2"
                                        />{' '}
                                        g/m<sup className="">2</sup>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="border border-black p-2">
                                  <p className="text-neutral-500 text-sm font-semibold">
                                    {
                                      incoming?.inspeksi_bahan_result[1]
                                        .keterangan_hasil
                                    }
                                  </p>
                                </td>
                                <td className="border border-black p-2 text-center">
                                  20
                                </td>
                              </tr>

                              {/* Row 3 */}
                              <tr>
                                <td className="border border-black p-2 text-center">
                                  3
                                </td>
                                <td className="border border-black p-2">
                                  THICKNESS / KETEBALAN
                                </td>
                                <td className="border border-black p-2">
                                  THICKNESS GAUGE
                                </td>
                                <td className="border border-black p-2">
                                  UKUR KETEBALAN MASING-MASING KERTAS YANG SUDAH
                                  DIPOTONG DI POINT-2
                                </td>
                                <td className="border border-black p-2">-</td>
                                <td className="border border-black p-2">
                                  <div className="flex flex-col  w-full">
                                    <div className="flex flex-col gap-1">
                                      <label className="text-neutral-500 text-sm font-semibold ">
                                        Kiri
                                      </label>
                                      <label className="text-neutral-500 text-sm font-semibold ">
                                        {
                                          incoming?.inspeksi_bahan_result[2]
                                            .hasil_kiri
                                        }
                                      </label>
                                      <label className="text-neutral-500 text-sm font-semibold pt-1">
                                        Tengah
                                      </label>
                                      <label className="text-neutral-500 text-sm font-semibold ">
                                        {
                                          incoming?.inspeksi_bahan_result[2]
                                            .hasil_tengah
                                        }
                                      </label>
                                      <label className="text-neutral-500 text-sm font-semibold pt-1">
                                        Kanan
                                      </label>
                                      <label className="text-neutral-500 text-sm font-semibold ">
                                        {
                                          incoming?.inspeksi_bahan_result[2]
                                            .hasil_kanan
                                        }
                                      </label>
                                    </div>
                                  </div>
                                </td>
                                <td className="border border-black p-2">
                                  <p className="text-neutral-500 text-sm font-semibold">
                                    {
                                      incoming?.inspeksi_bahan_result[2]
                                        .keterangan_hasil
                                    }
                                  </p>
                                </td>
                                <td className="border border-black p-2 text-center">
                                  15
                                </td>
                              </tr>

                              {/* Additional rows would be added similarly */}
                              <tr>
                                <td className="border border-black p-2 text-center">
                                  4
                                </td>
                                <td className="border border-black p-2">
                                  ARAH SERAT
                                </td>
                                <td className="border border-black p-2">
                                  LABEL TERCANTUM
                                </td>
                                <td className="border border-black p-2">
                                  LIHAT UKURAN
                                </td>
                                <td className="border border-black p-2">
                                  SESUAI ARAH SERAT DI SURAT JALAN
                                </td>
                                <td className="border border-black p-2">
                                  <p className="text-neutral-500 text-sm font-semibold">
                                    {incoming?.inspeksi_bahan_result[3].hasil}
                                  </p>
                                </td>
                                <td className="border border-black p-2">
                                  <p className="text-neutral-500 text-sm font-semibold">
                                    {
                                      incoming?.inspeksi_bahan_result[3]
                                        .keterangan_hasil
                                    }
                                  </p>
                                </td>
                                <td className="border border-black p-2 text-center">
                                  10
                                </td>
                              </tr>

                              <tr>
                                <td className="border border-black p-2 text-center">
                                  5
                                </td>
                                <td className="border border-black p-2">
                                  COATING DEPAN : BERMINYAK JENDOR TITIK-TITIK
                                  DLL
                                </td>
                                <td className="border border-black p-2">
                                  KACA PEMBESAR
                                </td>
                                <td className="border border-black p-2">
                                  VISUAL
                                </td>
                                <td className="border border-black p-2">
                                  PERMUKAAN BERSIH
                                </td>
                                <td className="border border-black p-2">
                                  <p className="text-neutral-500 text-sm font-semibold">
                                    {incoming?.inspeksi_bahan_result[4].hasil}
                                  </p>
                                </td>
                                <td className="border border-black p-2">
                                  <label className="text-neutral-500 text-sm font-semibold">
                                    <div className="flex flex-col gap-1">
                                      <p>
                                        {
                                          incoming?.inspeksi_bahan_result[4]
                                            ?.coating
                                        }
                                      </p>
                                    </div>
                                  </label>

                                  <p className="text-neutral-500 text-sm font-semibold">
                                    {
                                      incoming?.inspeksi_bahan_result[4]
                                        .keterangan_hasil
                                    }
                                  </p>
                                </td>
                                <td className="border border-black p-2 text-center">
                                  10
                                </td>
                              </tr>

                              <tr>
                                <td className="border border-black p-2 text-center">
                                  6
                                </td>
                                <td className="border border-black p-2">
                                  UKURAN
                                </td>
                                <td className="border border-black p-2">
                                  MISTAR/PENGGARIS
                                </td>
                                <td className="border border-black p-2">
                                  DIUKUR PANJANG & LEBAR
                                </td>
                                <td className="border border-black p-2">
                                  <div>SESUAI SIZE DI SURAT JALAN,</div>
                                  <div>TOLERANSI TIDAK BOLEH {'<'} 2mm</div>
                                </td>
                                <td className="border border-black p-2">
                                  <div className="flex flex-col gap-1 font-semibold text-sm">
                                    <p>
                                      {
                                        incoming?.inspeksi_bahan_result[5]
                                          ?.hasil_panjang
                                      }{' '}
                                      mm
                                    </p>
                                    <p>
                                      {
                                        incoming?.inspeksi_bahan_result[5]
                                          ?.hasil_lebar
                                      }{' '}
                                      mm
                                    </p>
                                  </div>
                                </td>
                                <td className="border border-black p-2">
                                  <p className="text-neutral-500 text-sm font-semibold">
                                    {
                                      incoming?.inspeksi_bahan_result[5]
                                        .keterangan_hasil
                                    }
                                  </p>
                                </td>
                                <td className="border border-black p-2 text-center">
                                  5
                                </td>
                              </tr>

                              <tr>
                                <td className="border border-black p-2 text-center">
                                  7
                                </td>
                                <td className="border border-black p-2">
                                  GELOMBANG
                                </td>
                                <td className="border border-black p-2">
                                  PENGGARIS
                                </td>
                                <td className="border border-black p-2">
                                  TOLERANSI MELENGKUNG/ GELOMBANG = ± 8mm
                                </td>
                                <td className="border border-black p-2">-</td>
                                <td className="border border-black p-2 text-center">
                                  <p className="text-neutral-500 text-sm font-semibold">
                                    {incoming?.inspeksi_bahan_result[6].hasil}
                                  </p>
                                </td>
                                <td className="border border-black p-2">
                                  <p className="text-neutral-500 text-sm font-semibold">
                                    {
                                      incoming?.inspeksi_bahan_result[6]
                                        .keterangan_hasil
                                    }
                                  </p>
                                </td>
                                <td className="border border-black p-2 text-center">
                                  5
                                </td>
                              </tr>

                              <tr>
                                <td className="border border-black p-2 text-center">
                                  8
                                </td>
                                <td className="border border-black p-2">
                                  WARNA
                                </td>
                                <td className="border border-black p-2">
                                  COLOR TOLERANCE / SAMPLE
                                </td>
                                <td className="border border-black p-2">
                                  VISUAL
                                </td>
                                <td className="border border-black p-2">
                                  WARNA DASAR SESUAI
                                </td>
                                <td className="border border-black p-2 text-center">
                                  <p className="text-neutral-500 text-sm font-semibold">
                                    {incoming?.inspeksi_bahan_result[7].hasil}
                                  </p>
                                </td>
                                <td className="border border-black p-2">
                                  <p className="text-neutral-500 text-sm font-semibold">
                                    {
                                      incoming?.inspeksi_bahan_result[7]
                                        .keterangan_hasil
                                    }
                                  </p>
                                </td>
                                <td className="border border-black p-2 text-center">
                                  5
                                </td>
                              </tr>

                              <tr>
                                <td className="border border-black p-2 text-center">
                                  9
                                </td>
                                <td className="border border-black p-2">
                                  QUANTITY
                                </td>
                                <td className="border border-black p-2">
                                  HITUNG MANUAL
                                </td>
                                <td className="border border-black p-2">
                                  SAMPLING SESUAI STANDAR AQL
                                </td>
                                <td className="border border-black p-2">
                                  SESUAI PER PACK
                                </td>
                                <td className="border border-black p-2 text-center">
                                  <p className="text-neutral-500 text-sm font-semibold">
                                    {incoming?.inspeksi_bahan_result[8].hasil}
                                  </p>
                                </td>
                                <td className="border border-black p-2">
                                  <p className="text-neutral-500 text-sm font-semibold">
                                    {
                                      incoming?.inspeksi_bahan_result[8]
                                        .keterangan_hasil
                                    }
                                  </p>
                                </td>
                                <td className="border border-black p-2 text-center">
                                  5
                                </td>
                              </tr>

                              <tr>
                                <td
                                  colSpan={7}
                                  className="border border-black p-2"
                                >
                                  <div className="font-semibold">
                                    Catatan: {incoming?.catatan}
                                  </div>
                                </td>
                                <td className="border border-black p-2 text-center font-bold">
                                  {incoming?.total_skor}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>

                      <tr>
                        <td colSpan={3} className="border border-black p-2">
                          <div className="grid grid-cols-3 gap-2">
                            <div className="text-center flex flex-col gap-1">
                              <label>Inspector QA</label>
                              <label>{incoming?.inspector}</label>
                            </div>
                            <div className="text-center">
                              <p
                                className={` uppercase font-semibold text-lg  ${
                                  incoming?.verifikasi == 'Diterima'
                                    ? 'text-green-500'
                                    : 'text-red-500'
                                }`}
                              >
                                {incoming?.verifikasi}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {!isMobile && (
        <main className="overflow-x-scroll">
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
                Incoming Inspection Checksheet
              </div>
              <div className="flex gap-2">
                <div id="status-quality-print-area" className="hidden">
                  <StatusQualityContent />
                </div>
                {isStatusQualityPreviewOpen && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-5xl max-h-[90vh] overflow-auto w-full">
                      <div className="flex justify-between items-center p-4 border-b">
                        <h2 className="text-lg font-semibold">
                          Status Quality Print Preview
                        </h2>
                        <div className="flex gap-2">
                          <button
                            onClick={printStatusQuality}
                            className="flex items-center gap-2 bg-indigo-500 text-white px-3 py-1 rounded text-sm hover:bg-indigo-600 transition-colors"
                          >
                            <Printer size={14} />
                            Print
                          </button>
                          <button
                            onClick={closeStatusQualityPreview}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      </div>

                      <div className="p-4">
                        <StatusQualityContent />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={openStatusQualityPreview}
                  className="flex items-center gap-2 bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600 transition-colors"
                >
                  <Eye size={14} />
                  Status Quality Preview
                </button>
                <button
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
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                    />
                  </svg>
                  Preview Checksheet
                </button>
              </div>
            </p>

            <div className="grid grid-cols-12  border-b-8 border-[#D8EAFF]">
              <div className="flex flex-col gap-4 col-span-2 px-10 py-4">
                <label className="text-neutral-500 text-sm font-semibold">
                  Tanggal
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  No. LOT
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  No. Surat Jalan
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Supplier
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Jenis Kertas
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Ukuran
                </label>
              </div>
              <div className="flex flex-col gap-4 col-span-3 px-10 py-4">
                <label className="text-neutral-500 text-sm font-semibold">
                  : {incoming?.tanggal}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {incoming?.no_lot}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {incoming?.no_surat_jalan}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {incoming?.supplier}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {incoming?.jenis_kertas}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {incoming?.ukuran}
                </label>
              </div>

              <div className="flex flex-col  gap-4 col-span-3 justify-between pl-10 py-4">
                <label className="text-neutral-500 text-sm font-semibold">
                  Jam
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Inspector
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Keterangan JO
                </label>

                <label className="text-black text-lg font-bold">
                  STANDAR PEMERIKSAAN
                </label>

                <label className="text-neutral-500 text-sm font-semibold">
                  Jumlah
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Jumlah Pallet
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  √N + 1
                </label>
              </div>
              <div className="flex flex-col  gap-4 col-span-2 justify-between py-4">
                <label className="text-neutral-500 text-sm font-semibold">
                  : {incoming?.jam}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {incoming?.inspector}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {incoming?.keterangan}
                </label>

                <label className="text-black text-lg font-bold mt-12"> </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {incoming?.jumlah} LP
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  :{incoming?.hasil_rumus}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  :{incoming?.hasil_rumus}
                </label>
              </div>
              <div
                className={`flex flex-col h-full w-full  gap-2  py-4 col-span-2  font-semibold  bg-[#F6FAFF]`}
              >
                <p
                  className={` uppercase font-semibold text-lg bg-[#F6FAFF] ${
                    incoming?.verifikasi == 'Diterima'
                      ? 'text-green-500'
                      : 'text-red-500'
                  }`}
                >
                  {incoming?.verifikasi}
                </p>
                <p className={` uppercase font-semibold text-lg bg-[#F6FAFF]`}>
                  Total skor : {incoming?.total_skor}
                </p>
                <div className="text-sm gap-1 flex flex-col">
                  <p>Waktu Mulai :</p>
                  <p>{waktuMulai}</p>
                  <p>Waktu Selesai :</p>
                  <p>{waktuSelesai}</p>
                  <p>Time :</p>
                  <p>{formatElapsedTime(incoming?.lama_pengerjaan)} Detik</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-12 px-3 py-4 border-b-8 border-[#D8EAFF] gap-2">
              <div className="flex gap-4 col-span-2">
                <label className="text-neutral-500 text-sm font-semibold">
                  No
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Keterangan
                </label>
              </div>
              <label className="text-neutral-500 text-sm font-semibold col-span-2">
                Alat Ukur
              </label>
              <label className="text-neutral-500 text-sm font-semibold col-span-2">
                Metode
              </label>
              <label className="text-neutral-500 text-sm font-semibold col-span-2">
                Target
              </label>
              <div className="flex justify-between  col-span-3">
                <label className="text-neutral-500 text-sm font-semibold">
                  Hasil
                </label>
                <label className="text-neutral-500 text-sm font-semibold pr-[20%]">
                  Keterangan
                </label>
              </div>

              <label className="text-neutral-500 text-sm font-semibold flex justify-end">
                Bobot (%)
              </label>
            </div>

            <form>
              <div className="grid grid-cols-12 px-3 py-4 gap-2">
                <div className="flex gap-4 col-span-2">
                  <label className="text-neutral-500 text-sm font-semibold">
                    1
                  </label>
                  <label className="text-neutral-500 text-sm font-semibold">
                    Jenis Kertas
                  </label>
                </div>
                <label className="text-neutral-500 text-sm font-semibold col-span-2">
                  -
                </label>
                <label className="text-neutral-500 text-sm font-semibold col-span-2">
                  Visual
                </label>
                <label className="text-neutral-500 text-sm font-semibold col-span-2">
                  Sesuai Surat Jalan
                </label>
                <div className="flex justify-between  col-span-3">
                  <label className="text-neutral-500 text-sm font-semibold">
                    {incoming?.inspeksi_bahan_result[0]?.hasil}
                  </label>
                  <div className="flex flex-col gap-1  w-[50%]">
                    <div className="text-neutral-500 text-sm font-semibold">
                      {incoming?.inspeksi_bahan_result[0].keterangan_hasil}
                    </div>
                  </div>
                </div>
                <label className="text-neutral-500 text-sm font-semibold flex justify-center">
                  25
                </label>
              </div>
              <div className="grid grid-cols-10 bg-[#F5F5F5] px-10 py-4 border-b-8 border-[#D8EAFF]">
                <div className="col-span-4">
                  <div className="flex flex-col ">
                    <p className="md:text-[14px] text-[9px] font-semibold">
                      Upload Foto (Optional):
                    </p>

                    <br />
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
                </div>
              </div>
            </form>

            {/* =============================Point 2========================== */}
            <>
              <div className="grid grid-cols-12 px-3 py-4 gap-2 ">
                <div className="flex gap-4 col-span-2">
                  <label className="text-neutral-500 text-sm font-semibold">
                    2
                  </label>
                  <label className="text-neutral-500 text-sm font-semibold">
                    Gramatur
                  </label>
                </div>
                <label className="text-neutral-500 text-sm font-semibold col-span-2">
                  Timbangan Digital
                </label>
                <div className="flex flex-col gap-2 col-span-2">
                  <label className="text-neutral-500 text-sm font-semibold col-span-2">
                    Potong Kertas Ukuran 10x10cm di area KIRI, TENGAH, KANAN
                  </label>
                  <label className="text-neutral-500 text-sm font-semibold col-span-2">
                    Timbang Masing-Masing beratnya
                  </label>
                  <label className="text-neutral-500 text-sm font-semibold col-span-2">
                    Jumlahkan dan hitung nilai rata-ratanya (KIRI &lt; TENGAH
                    &lt; KANAN : 3)
                  </label>
                </div>
                <div className="flex flex-col gap-2 col-span-2">
                  <label className="text-neutral-500 text-sm font-semibold col-span-2">
                    Gramatur Sesuai Surat Jalan
                  </label>
                  <label className="text-neutral-500 text-sm font-semibold col-span-2">
                    Toleransi &#xb1; 4%
                  </label>
                </div>

                <div className="flex justify-between  col-span-3">
                  <div className="flex justify-between  col-span-3">
                    <div className="flex flex-col  w-[60%]">
                      <div className="flex flex-col gap-1">
                        <label className="text-neutral-500 text-sm font-semibold ">
                          Kiri
                        </label>
                        <label className="text-neutral-500 text-sm font-semibold ">
                          {incoming?.inspeksi_bahan_result[1].hasil_kiri} gr
                        </label>
                        <div>
                          ={' '}
                          <input
                            name="hasilsample3"
                            disabled
                            value={
                              incoming?.inspeksi_bahan_result[1]
                                .hasil_rumus_kiri
                            }
                            type="text"
                            className="border-2 border-stroke w-[40%] rounded-sm col-span-2"
                          />{' '}
                          g/m<sup className="">2</sup>
                        </div>
                        <label className="text-neutral-500 text-sm font-semibold pt-1">
                          Tengah
                        </label>
                        <label className="text-neutral-500 text-sm font-semibold ">
                          {incoming?.inspeksi_bahan_result[1].hasil_tengah} gr
                        </label>
                        <div>
                          ={' '}
                          <input
                            name="hasilsample3"
                            disabled
                            value={
                              incoming?.inspeksi_bahan_result[1]
                                .hasil_rumus_tengah
                            }
                            type="text"
                            className="border-2 border-stroke w-[40%] rounded-sm col-span-2"
                          />{' '}
                          g/m<sup className="">2</sup>
                        </div>
                        <label className="text-neutral-500 text-sm font-semibold pt-1">
                          Bawah
                        </label>
                        <label className="text-neutral-500 text-sm font-semibold ">
                          {incoming?.inspeksi_bahan_result[1].hasil_bawah} gr
                        </label>
                        <div>
                          ={' '}
                          <input
                            name="hasilsample3"
                            disabled
                            value={
                              incoming?.inspeksi_bahan_result[1]
                                .hasil_rumus_kanan
                            }
                            type="text"
                            className="border-2 border-stroke w-[40%] rounded-sm col-span-2"
                          />{' '}
                          g/m<sup className="">2</sup>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1  w-[50%]">
                      <p className="text-neutral-500 text-sm font-semibold">
                        {incoming?.inspeksi_bahan_result[1].keterangan_hasil}
                      </p>
                    </div>
                  </div>
                </div>
                <label className="text-neutral-500 text-sm font-semibold flex justify-center">
                  20
                </label>
              </div>
              <div className="grid grid-cols-10 bg-[#F5F5F5] px-10 py-4 border-b-8 border-[#D8EAFF]">
                <div className="col-span-4">
                  <div className="flex flex-col ">
                    <p className="md:text-[14px] text-[9px] font-semibold">
                      Upload Foto (Optional):
                    </p>

                    <br />
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
                </div>
              </div>
            </>

            {/* =============================Point 3========================== */}
            <>
              <div className="grid grid-cols-12 px-3 py-4 gap-2 ">
                <div className="flex gap-4 col-span-2">
                  <label className="text-neutral-500 text-sm font-semibold">
                    3
                  </label>
                  <label className="text-neutral-500 text-sm font-semibold">
                    Thickness
                  </label>
                </div>
                <label className="text-neutral-500 text-sm font-semibold col-span-2">
                  Thickness Gauge
                </label>
                <div className="flex flex-col gap-2 col-span-2">
                  <label className="text-neutral-500 text-sm font-semibold col-span-2">
                    Ukuran ketebalan Masing-Masing kertas yang sudah dipotong di
                    point-2
                  </label>
                </div>
                <div className="flex flex-col gap-2 col-span-2">
                  <label className="text-neutral-500 text-sm font-semibold col-span-2">
                    -
                  </label>
                </div>

                <div className="flex justify-between  col-span-3">
                  <div className="flex flex-col  w-[60%]">
                    <div className="flex flex-col gap-1">
                      <label className="text-neutral-500 text-sm font-semibold ">
                        Kiri
                      </label>
                      <label className="text-neutral-500 text-sm font-semibold ">
                        {incoming?.inspeksi_bahan_result[2].hasil_kiri}
                      </label>
                      <label className="text-neutral-500 text-sm font-semibold pt-1">
                        Tengah
                      </label>
                      <label className="text-neutral-500 text-sm font-semibold ">
                        {incoming?.inspeksi_bahan_result[2].hasil_tengah}
                      </label>
                      <label className="text-neutral-500 text-sm font-semibold pt-1">
                        Kanan
                      </label>
                      <label className="text-neutral-500 text-sm font-semibold ">
                        {incoming?.inspeksi_bahan_result[2].hasil_kanan}
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1  w-[50%]">
                    <p className="text-neutral-500 text-sm font-semibold">
                      {incoming?.inspeksi_bahan_result[2].keterangan_hasil}
                    </p>
                  </div>
                </div>
                <label className="text-neutral-500 text-sm font-semibold flex justify-center">
                  15
                </label>
              </div>
              <div className="grid grid-cols-10 bg-[#F5F5F5] px-10 py-4 border-b-8 border-[#D8EAFF]">
                <div className="col-span-4">
                  <div className="flex flex-col ">
                    <p className="md:text-[14px] text-[9px] font-semibold">
                      Upload Foto (Optional):
                    </p>

                    <br />
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
                </div>
              </div>
            </>
            {/* =============================Point 4========================== */}
            <>
              <div className="grid grid-cols-12 px-3 py-4 gap-2 ">
                <div className="flex gap-4 col-span-2">
                  <label className="text-neutral-500 text-sm font-semibold">
                    4
                  </label>
                  <label className="text-neutral-500 text-sm font-semibold">
                    Arah Serat
                  </label>
                </div>
                <label className="text-neutral-500 text-sm font-semibold col-span-2">
                  Label Tercantum
                </label>
                <div className="flex flex-col gap-2 col-span-2">
                  <label className="text-neutral-500 text-sm font-semibold col-span-2">
                    Lihat Ukuran
                  </label>
                </div>
                <div className="flex flex-col gap-2 col-span-2">
                  <label className="text-neutral-500 text-sm font-semibold col-span-2">
                    Sesuai arah serat di surat jalan
                  </label>
                </div>

                <div className="flex justify-between  col-span-3">
                  <div className="flex flex-col  w-[60%]">
                    <p className="text-neutral-500 text-sm font-semibold">
                      {incoming?.inspeksi_bahan_result[3].hasil}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1  w-[50%]">
                    <p className="text-neutral-500 text-sm font-semibold">
                      {incoming?.inspeksi_bahan_result[3].keterangan_hasil}
                    </p>
                  </div>
                </div>
                <label className="text-neutral-500 text-sm font-semibold flex justify-center">
                  10
                </label>
              </div>
              <div className="grid grid-cols-10 bg-[#F5F5F5] px-10 py-4 border-b-8 border-[#D8EAFF]">
                <div className="col-span-4">
                  <div className="flex flex-col ">
                    <p className="md:text-[14px] text-[9px] font-semibold">
                      Upload Foto (Optional):
                    </p>

                    <br />
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
                </div>
              </div>
            </>
            {/* =============================Point 5========================== */}
            <>
              <div className="grid grid-cols-12 px-3 py-4 gap-2 ">
                <div className="flex gap-4 col-span-2">
                  <label className="text-neutral-500 text-sm font-semibold">
                    5
                  </label>
                  <label className="text-neutral-500 text-sm font-semibold">
                    Coating Depan
                  </label>
                </div>
                <label className="text-neutral-500 text-sm font-semibold col-span-2">
                  Kaca Pembesar
                </label>
                <div className="flex flex-col gap-2 col-span-2">
                  <label className="text-neutral-500 text-sm font-semibold col-span-2">
                    Lihat Ukuran
                  </label>
                </div>
                <div className="flex flex-col gap-2 col-span-2">
                  <label className="text-neutral-500 text-sm font-semibold col-span-2">
                    Visual
                  </label>
                </div>

                <div className="flex justify-between  col-span-3">
                  <div className="flex flex-col  w-[60%]">
                    <p className="text-neutral-500 text-sm font-semibold">
                      {incoming?.inspeksi_bahan_result[4].hasil}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1  w-[50%]">
                    <label className="text-neutral-500 text-sm font-semibold">
                      <div className="flex flex-col gap-1">
                        <p>{incoming?.inspeksi_bahan_result[4]?.coating}</p>
                      </div>
                    </label>

                    <p className="text-neutral-500 text-sm font-semibold">
                      {incoming?.inspeksi_bahan_result[4].keterangan_hasil}
                    </p>
                  </div>
                </div>
                <label className="text-neutral-500 text-sm font-semibold flex justify-center">
                  10
                </label>
              </div>
              <div className="grid grid-cols-10 bg-[#F5F5F5] px-10 py-4 border-b-8 border-[#D8EAFF]">
                <div className="col-span-4">
                  <div className="flex flex-col ">
                    <div className="flex flex-col ">
                      <p className="md:text-[14px] text-[9px] font-semibold">
                        Upload Foto (Optional):
                      </p>

                      <br />
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
                  </div>
                </div>
              </div>
            </>

            {/* =============================Point 6========================== */}
            <>
              <div className="grid grid-cols-12 px-3 py-4 gap-2 ">
                <div className="flex gap-4 col-span-2">
                  <label className="text-neutral-500 text-sm font-semibold">
                    6
                  </label>
                  <label className="text-neutral-500 text-sm font-semibold">
                    Ukuran
                  </label>
                </div>
                <label className="text-neutral-500 text-sm font-semibold col-span-2">
                  Mistar/Penggaris
                </label>
                <div className="flex flex-col gap-2 col-span-2">
                  <label className="text-neutral-500 text-sm font-semibold col-span-2">
                    Diukur panjang dan lebar
                  </label>
                </div>
                <div className="flex flex-col gap-2 col-span-2">
                  <label className="text-neutral-500 text-sm font-semibold col-span-2">
                    Sesuai size di surat jalan, toleransi tidak boleh &lt;= 2mm
                  </label>
                </div>

                <div className="flex justify-between  col-span-3">
                  <div className="flex flex-col  w-[60%]">
                    <div className="flex flex-col gap-1 font-semibold text-sm">
                      <p>
                        {incoming?.inspeksi_bahan_result[5]?.hasil_panjang} mm
                      </p>
                      <p>
                        {incoming?.inspeksi_bahan_result[5]?.hasil_lebar} mm
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1  w-[50%]">
                    <p className="text-neutral-500 text-sm font-semibold">
                      {incoming?.inspeksi_bahan_result[5].keterangan_hasil}
                    </p>
                  </div>
                </div>
                <label className="text-neutral-500 text-sm font-semibold flex justify-center">
                  5
                </label>
              </div>
              <div className="grid grid-cols-10 bg-[#F5F5F5] px-10 py-4 border-b-8 border-[#D8EAFF]">
                <div className="col-span-4">
                  <div className="flex flex-col ">
                    <div className="flex flex-col ">
                      <p className="md:text-[14px] text-[9px] font-semibold">
                        Upload Foto (Optional):
                      </p>

                      <br />
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
                  </div>
                </div>
              </div>
            </>
            {/* =============================Point 7========================== */}
            <>
              <div className="grid grid-cols-12 px-3 py-4 gap-2 ">
                <div className="flex gap-4 col-span-2">
                  <label className="text-neutral-500 text-sm font-semibold">
                    7
                  </label>
                  <label className="text-neutral-500 text-sm font-semibold">
                    Gelombang
                  </label>
                </div>
                <label className="text-neutral-500 text-sm font-semibold col-span-2">
                  Penggaris
                </label>
                <div className="flex flex-col gap-2 col-span-2">
                  <label className="text-neutral-500 text-sm font-semibold col-span-2">
                    Toleransi melengkung / gelombanng = &#xb1; 8mm
                  </label>
                </div>
                <div className="flex flex-col gap-2 col-span-2">
                  <label className="text-neutral-500 text-sm font-semibold col-span-2">
                    -
                  </label>
                </div>

                <div className="flex justify-between  col-span-3">
                  <div className="flex flex-col  w-[60%]">
                    <p className="text-neutral-500 text-sm font-semibold">
                      {incoming?.inspeksi_bahan_result[6].hasil}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1  w-[50%]">
                    <p className="text-neutral-500 text-sm font-semibold">
                      {incoming?.inspeksi_bahan_result[6].keterangan_hasil}
                    </p>
                  </div>
                </div>
                <label className="text-neutral-500 text-sm font-semibold flex justify-center">
                  5
                </label>
              </div>
              <div className="grid grid-cols-10 bg-[#F5F5F5] px-10 py-4 border-b-8 border-[#D8EAFF]">
                <div className="col-span-4">
                  <div className="flex flex-col ">
                    <div className="flex flex-col ">
                      <p className="md:text-[14px] text-[9px] font-semibold">
                        Upload Foto (Optional):
                      </p>

                      <br />
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
                  </div>
                </div>
              </div>
            </>
            {/* =============================Point 8========================== */}
            <>
              <div className="grid grid-cols-12 px-3 py-4 gap-2 ">
                <div className="flex gap-4 col-span-2">
                  <label className="text-neutral-500 text-sm font-semibold">
                    8
                  </label>
                  <label className="text-neutral-500 text-sm font-semibold">
                    Warna
                  </label>
                </div>
                <label className="text-neutral-500 text-sm font-semibold col-span-2">
                  Color Tolerance / Sample
                </label>
                <div className="flex flex-col gap-2 col-span-2">
                  <label className="text-neutral-500 text-sm font-semibold col-span-2">
                    Visual
                  </label>
                </div>
                <div className="flex flex-col gap-2 col-span-2">
                  <label className="text-neutral-500 text-sm font-semibold col-span-2">
                    Warna Dasar Sesuai
                  </label>
                </div>

                <div className="flex justify-between  col-span-3">
                  <div className="flex flex-col  w-[60%]">
                    <p className="text-neutral-500 text-sm font-semibold">
                      {incoming?.inspeksi_bahan_result[7].hasil}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1  w-[50%]">
                    <p className="text-neutral-500 text-sm font-semibold">
                      {incoming?.inspeksi_bahan_result[7].keterangan_hasil}
                    </p>
                  </div>
                </div>
                <label className="text-neutral-500 text-sm font-semibold flex justify-center">
                  5
                </label>
              </div>
              <div className="grid grid-cols-10 bg-[#F5F5F5] px-10 py-4 border-b-8 border-[#D8EAFF]">
                <div className="col-span-4">
                  <div className="flex flex-col ">
                    <div className="flex flex-col ">
                      <p className="md:text-[14px] text-[9px] font-semibold">
                        Upload Foto (Optional):
                      </p>

                      <br />
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
                  </div>
                </div>
              </div>
            </>
            {/* =============================Point 9========================== */}
            <>
              <div className="grid grid-cols-12 px-3 py-4 gap-2 ">
                <div className="flex gap-4 col-span-2">
                  <label className="text-neutral-500 text-sm font-semibold">
                    9
                  </label>
                  <label className="text-neutral-500 text-sm font-semibold">
                    Quantity
                  </label>
                </div>
                <label className="text-neutral-500 text-sm font-semibold col-span-2">
                  Hitung Manual
                </label>
                <div className="flex flex-col gap-2 col-span-2">
                  <label className="text-neutral-500 text-sm font-semibold col-span-2">
                    Sampling sesuai standard AQL
                  </label>
                </div>
                <div className="flex flex-col gap-2 col-span-2">
                  <label className="text-neutral-500 text-sm font-semibold col-span-2">
                    Sesuai per pack
                  </label>
                </div>

                <div className="flex justify-between  col-span-3">
                  <div className="flex flex-col  w-[60%]">
                    <p className="text-neutral-500 text-sm font-semibold">
                      {incoming?.inspeksi_bahan_result[8].hasil}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1  w-[50%]">
                    <p className="text-neutral-500 text-sm font-semibold">
                      {incoming?.inspeksi_bahan_result[8].keterangan_hasil}
                    </p>
                  </div>
                </div>
                <label className="text-neutral-500 text-sm font-semibold flex justify-center">
                  5
                </label>
              </div>
              <div className="grid grid-cols-10 bg-[#F5F5F5] px-10 py-4 border-b-8 border-[#D8EAFF]">
                <div className="col-span-4">
                  <div className="flex flex-col ">
                    <div className="flex flex-col ">
                      <p className="md:text-[14px] text-[9px] font-semibold">
                        Upload Foto (Optional):
                      </p>

                      <br />
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
                  </div>
                </div>
              </div>
            </>
          </div>
          <div className="bg-white flex w-full justify-between px-4 py-4">
            <div className="flex flex-col">
              <label className="text-neutral-500 text-sm font-semibold flex flex-col w-full">
                Catatan : {incoming?.catatan}
              </label>
            </div>
          </div>
        </main>
      )}
    </>
  );
}

export default HistoryIncoming;
