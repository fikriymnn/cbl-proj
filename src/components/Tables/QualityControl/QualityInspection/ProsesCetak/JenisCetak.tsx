import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@mui/material';
import JenisCetak from '../../../../../pages/QualityControl/ProsesCetak/JenisCetak';
import convertTimeStampToDate from '../../../../../utils/convertDate';
import convertTimeStampToDateOnly from '../../../../../utils/convertDateOnly';
import formatInteger from '../../../../../utils/formaterInteger';
import convertDateToTime from '../../../../../utils/converDateToTime';
import formatElapsedTime from '../../../../../utils/formatElapsedTime';
import ptcbl from '../../../../../images/ptcbl.png';
function JenisHasilRabut() {
  const { id } = useParams();
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

  const [cetakMesin, setCetakMesin] = useState<any>();

  useEffect(() => {
    getCetakMesin();
  }, []);

  async function getCetakMesin() {
    const url = `${import.meta.env.VITE_API_LINK}/qc/cs/inspeksiCetak/${id}`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      setCetakMesin(res.data);
      console.log(res.data);
    } catch (error: any) {
      console.log(error);
    }
  }
  const tanggal = convertTimeStampToDateOnly(cetakMesin?.data.createdAt);
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
  const jumlahWaktuCheck = formatElapsedTime(
    cetakMesin?.data?.inspeksi_cetak_awal[0]?.waktu_check,
  );
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
                <div className="mb-6">
                  <table className="w-full border-collapse border border-black">
                    <thead>
                      <tr>
                        <td colSpan={3} className="border border-black p-2">
                          <div className="flex items-center">
                            <div className="w-24 flex justify-center">
                              <img src={ptcbl} alt="logo" />
                            </div>
                            <div className="flex-grow text-center font-bold text-lg">
                              FORM PENGECEKAN
                            </div>
                            <div className="w-24 flex justify-center"> </div>
                          </div>
                        </td>
                        <td
                          rowSpan={2}
                          className="border border-black p-2 text-left font-bold"
                        >
                          No. Dok : {cetakMesin?.data?.no_doc}
                        </td>
                      </tr>
                      <tr>
                        <td
                          colSpan={3}
                          className="border border-black p-2 text-center font-bold bg-gray-100"
                        >
                          PROSES CETAK
                        </td>
                      </tr>
                    </thead>
                  </table>
                </div>

                <div className="mb-6">
                  <table className="w-full border-collapse">
                    <tbody>
                      <tr className="">
                        <td className="w-1/6 p-2 bg-gray-50 text-neutral-500 text-sm font-semibold ">
                          Tanggal
                        </td>
                        <td className="w-1/6 p-2 border-b border-gray-300">
                          {': '}
                          {tanggal}
                        </td>
                        <td className="w-1/6 p-2 bg-gray-50 text-neutral-500 text-sm font-semibold ">
                          Jam
                        </td>
                        <td className="w-1/6 p-2 border-b border-gray-300">
                          {': '}
                          {convertDateToTime(cetakMesin?.data?.createdAt)}
                        </td>
                        <td className="w-1/6 p-2 bg-gray-50 text-neutral-500 text-sm font-semibold">
                          Shift
                        </td>
                        <td className="w-1/6 p-2 border-b border-gray-300">
                          {': '}
                          {cetakMesin?.data?.shift}
                        </td>
                      </tr>

                      <tr className="">
                        <td className="p-2 bg-gray-50 text-neutral-500 text-sm font-semibold ">
                          Jumlah Druk
                        </td>
                        <td className="p-2 border-b border-gray-300">
                          {': '}
                          {formatInteger(
                            parseInt(cetakMesin?.data?.jumlah_druk),
                          )}
                        </td>
                        <td className="p-2 bg-gray-50 text-neutral-500 text-sm font-semibold">
                          No. JO
                        </td>
                        <td className="p-2 border-b border-gray-300">
                          {': '}
                          {cetakMesin?.data?.no_jo}
                        </td>
                        <td className="p-2 bg-gray-50 text-neutral-500 text-sm font-semibold">
                          Mesin
                        </td>
                        <td className="p-2 border-b border-gray-300">
                          {': '}
                          {cetakMesin?.data?.mesin}
                        </td>
                      </tr>

                      <tr className="">
                        <td className="p-2 bg-gray-50 text-neutral-500 text-sm font-semibold">
                          Jumlah Pcs
                        </td>
                        <td className="p-2 border-b border-gray-300">
                          {': '}
                          {formatInteger(
                            parseInt(cetakMesin?.data?.jumlah_pcs),
                          )}
                        </td>
                        <td className="p-2 bg-gray-50 text-neutral-500 text-sm font-semibold">
                          No. IO
                        </td>
                        <td className="p-2 border-b border-gray-300">
                          {': '}
                          {cetakMesin?.data?.no_io}
                        </td>
                        <td className="p-2 bg-gray-50 text-neutral-500 text-sm font-semibold">
                          Operator
                        </td>
                        <td className="p-2 border-b border-gray-300">
                          {': '}
                          {cetakMesin?.data?.operator}
                        </td>
                      </tr>

                      <tr className="">
                        <td className="p-2 bg-gray-50 text-neutral-500 text-sm font-semibold">
                          Jenis Kertas
                        </td>
                        <td className="p-2 border-b border-gray-300">
                          {': '}
                          {cetakMesin?.data?.jenis_kertas}
                        </td>
                        <td className="p-2 bg-gray-50 text-neutral-500 text-sm font-semibold">
                          Nama Produk
                        </td>
                        <td className="p-2 border-b border-gray-300">
                          {': '}
                          {cetakMesin?.data?.nama_produk}
                        </td>
                        <td className="p-2 bg-gray-50 text-neutral-500 text-sm font-semibold">
                          Status JO
                        </td>
                        <td className="p-2 border-b border-gray-300">
                          {': '}
                          {cetakMesin?.data?.status_jo}
                        </td>
                      </tr>

                      <tr className="0">
                        <td className="p-2 bg-gray-50 text-neutral-500 text-sm font-semibold">
                          Jenis Gramatur
                        </td>
                        <td className="p-2 border-b border-gray-300">
                          {': '}
                          {cetakMesin?.data?.jenis_gramatur}
                        </td>
                        <td className="p-2 bg-gray-50 text-neutral-500 text-sm font-semibold">
                          Customer
                        </td>
                        <td className="p-2 border-b border-gray-300">
                          {': '}
                          {cetakMesin?.data?.customer}
                        </td>
                        <td className="p-2"></td>
                        <td className="p-2"></td>
                      </tr>

                      <tr className="">
                        <td className="p-2 bg-gray-50 text-neutral-500 text-sm font-semibold">
                          Warna Depan
                        </td>
                        <td className="p-2 border-b border-gray-300">
                          {': '}
                          {cetakMesin?.data?.warna_depan}
                        </td>
                        <td className="p-2" colSpan={4}></td>
                      </tr>

                      <tr className="">
                        <td className="p-2 bg-gray-50 text-neutral-500 text-sm font-semibold">
                          Warna Belakang
                        </td>
                        <td className="p-2 border-b border-gray-300">
                          {': '}
                          {cetakMesin?.data?.warna_belakang}
                        </td>
                        <td className="p-2" colSpan={4}></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* PENGECEKAN AWAL Section */}
                <div className="mb-8">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr>
                        <th
                          colSpan={8}
                          className="p-3 border border-gray-300 bg-blue-50 text-center font-bold text-lg"
                        >
                          PENGECEKAN AWAL
                        </th>
                      </tr>
                    </thead>
                  </table>

                  {cetakMesin?.data?.inspeksi_cetak_awal[0]?.inspeksi_cetak_awal_point?.map(
                    (data: any, index: any) => {
                      const lamaPengerjaan = formatElapsedTime(
                        data.lama_pengerjaan,
                      );
                      const waktuMulai = convertDateToTime(data.waktu_mulai);
                      return (
                        <div
                          key={index}
                          className="mb-6 border border-gray-300 rounded"
                        >
                          <div className="bg-gray-50 p-2 border-b border-gray-300">
                            <div className="font-semibold">
                              PENGECEKAN AWAL {index + 1}
                            </div>
                          </div>

                          <div className="p-3">
                            <table className="w-full border-collapse border border-gray-300 mb-4">
                              <tbody>
                                <tr>
                                  <td className="w-1/6 p-2 border border-gray-300 bg-gray-50">
                                    <span className="text-neutral-500 text-sm font-semibold">
                                      Inspektor
                                    </span>
                                  </td>
                                  <td className="w-1/3 p-2 border border-gray-300">
                                    <span>{data.inspektor?.nama}</span>
                                  </td>
                                  <td className="w-1/6 p-2 border border-gray-300 bg-gray-50">
                                    <span className="text-neutral-500 text-sm font-semibold">
                                      Waktu Check
                                    </span>
                                  </td>
                                  <td className="w-1/3 p-2 border border-gray-300">
                                    <span>{waktuMulai}</span>
                                  </td>
                                </tr>
                                <tr>
                                  <td className="p-2 border border-gray-300 bg-gray-50">
                                    <span className="text-neutral-500 text-sm font-semibold">
                                      Lama Pengerjaan
                                    </span>
                                  </td>
                                  <td className="p-2 border border-gray-300">
                                    <span>{lamaPengerjaan}</span>
                                  </td>
                                  {data.eye_c && (
                                    <>
                                      <td className="p-2 border border-gray-300 bg-gray-50">
                                        <span className="text-neutral-500 text-sm font-semibold">
                                          Eye C
                                        </span>
                                      </td>
                                      <td className="p-2 border border-gray-300">
                                        <span>{data.eye_c}</span>
                                      </td>
                                    </>
                                  )}
                                  {!data.eye_c && (
                                    <>
                                      <td
                                        className="p-2 border border-gray-300"
                                        colSpan={2}
                                      >
                                        <span></span>
                                      </td>
                                    </>
                                  )}
                                </tr>
                              </tbody>
                            </table>

                            <table className="w-full border-collapse border border-gray-300 mb-4">
                              <thead>
                                <tr className="bg-blue-50">
                                  <th className="border border-gray-300 p-2 text-sm">
                                    LINE CLEARANCE
                                  </th>
                                  <th className="border border-gray-300 p-2 text-sm">
                                    DESIGN
                                  </th>
                                  <th className="border border-gray-300 p-2 text-sm">
                                    REDAKSI
                                  </th>
                                  <th className="border border-gray-300 p-2 text-sm">
                                    BARCODE
                                  </th>
                                  <th className="border border-gray-300 p-2 text-sm">
                                    JENIS BAHAN
                                  </th>
                                  <th className="border border-gray-300 p-2 text-sm">
                                    GRAMATUR
                                  </th>
                                  <th className="border border-gray-300 p-2 text-sm">
                                    LAYOUT PISAU
                                  </th>
                                  <th className="border border-gray-300 p-2 text-sm">
                                    ACC WARNA AWAL JALAN
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="border border-gray-300 p-2 text-center">
                                    {data.line_clearance}
                                  </td>
                                  <td className="border border-gray-300 p-2 text-center">
                                    {data.design}
                                  </td>
                                  <td className="border border-gray-300 p-2 text-center">
                                    {data.redaksi}
                                  </td>
                                  <td className="border border-gray-300 p-2 text-center">
                                    {data.barcode}
                                  </td>
                                  <td className="border border-gray-300 p-2 text-center">
                                    {data.jenis_bahan}
                                  </td>
                                  <td className="border border-gray-300 p-2 text-center">
                                    {data.gramatur}
                                  </td>
                                  <td className="border border-gray-300 p-2 text-center">
                                    {data.layout_pisau}
                                  </td>
                                  <td className="border border-gray-300 p-2 text-center">
                                    {data.acc_warna_awal_jalan}
                                  </td>
                                </tr>
                              </tbody>
                            </table>

                            <div className="mt-4">
                              <div className="font-semibold mb-2">Catatan:</div>
                              <div className="border border-gray-300 p-3 min-h-[80px] bg-gray-50">
                                {data.catatan}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    },
                  )}

                  <div className="mt-6 border border-gray-300 p-4 rounded bg-gray-50">
                    <table className="w-full border-collapse border border-gray-300 mb-4">
                      <tbody>
                        <tr>
                          <td className="w-1/6 p-2 border border-gray-300 bg-gray-100">
                            <span className="text-neutral-500 text-sm font-semibold">
                              Jumlah Periode Check
                            </span>
                          </td>
                          <td className="w-1/3 p-2 border border-gray-300">
                            <span>
                              {
                                cetakMesin?.data?.inspeksi_cetak_awal[0]
                                  ?.jumlah_periode
                              }
                            </span>
                          </td>
                          <td className="w-1/6 p-2 border border-gray-300 bg-gray-100">
                            <span className="text-neutral-500 text-sm font-semibold">
                              Waktu Check
                            </span>
                          </td>
                          <td className="w-1/3 p-2 border border-gray-300">
                            <span>{jumlahWaktuCheck}</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-blue-50">
                          <th className="w-1/3 border border-gray-300 p-2 text-sm">
                            Sample 1
                          </th>
                          <th className="w-1/3 border border-gray-300 p-2 text-sm">
                            Sample 2
                          </th>
                          <th className="w-1/3 border border-gray-300 p-2 text-sm">
                            Sample 3
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 p-2">
                            <div className="flex items-center gap-2">
                              <span>
                                {
                                  cetakMesin?.data?.inspeksi_cetak_awal[0]
                                    ?.sample_1
                                }{' '}
                                gr
                              </span>
                              <span>
                                ={' '}
                                {
                                  cetakMesin?.data?.inspeksi_cetak_awal[0]
                                    ?.hasil_sample_1
                                }{' '}
                                g/m<sup>2</sup>
                              </span>
                            </div>
                          </td>
                          <td className="border border-gray-300 p-2">
                            <div className="flex items-center gap-2">
                              <span>
                                {
                                  cetakMesin?.data?.inspeksi_cetak_awal[0]
                                    ?.sample_2
                                }{' '}
                                gr
                              </span>
                              <span>
                                ={' '}
                                {
                                  cetakMesin?.data?.inspeksi_cetak_awal[0]
                                    ?.hasil_sample_2
                                }{' '}
                                g/m<sup>2</sup>
                              </span>
                            </div>
                          </td>
                          <td className="border border-gray-300 p-2">
                            <div className="flex items-center gap-2">
                              <span>
                                {
                                  cetakMesin?.data?.inspeksi_cetak_awal[0]
                                    ?.sample_3
                                }{' '}
                                gr
                              </span>
                              <span>
                                ={' '}
                                {
                                  cetakMesin?.data?.inspeksi_cetak_awal[0]
                                    ?.hasil_sample_3
                                }{' '}
                                g/m<sup>2</sup>
                              </span>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* CEK PERIODE Section */}
                <div className="mb-8">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr>
                        <th
                          colSpan={8}
                          className="p-3 border border-gray-300 bg-blue-50 text-center font-bold text-lg"
                        >
                          CEK PERIODE
                        </th>
                      </tr>
                    </thead>
                  </table>

                  {cetakMesin?.data?.inspeksi_cetak_periode[0]?.inspeksi_cetak_periode_point?.map(
                    (data: any, index: any) => {
                      const lamaPengerjaan = formatElapsedTime(
                        data.lama_pengerjaan,
                      );
                      const waktuSampling = convertDateToTime(data.waktu_mulai);
                      return (
                        <div
                          key={index}
                          className="mb-6 border border-gray-300 rounded"
                        >
                          <div className="bg-gray-50 p-2 border-b border-gray-300">
                            <div className="font-semibold">
                              CEK PERIODE {index + 1}
                            </div>
                          </div>

                          <div className="p-3">
                            <table className="w-full border-collapse border border-gray-300 mb-4">
                              <tbody>
                                <tr>
                                  <td className="w-1/6 p-2 border border-gray-300 bg-gray-50">
                                    <span className="text-neutral-500 text-sm font-semibold">
                                      Inspektor
                                    </span>
                                  </td>
                                  <td className="w-1/6 p-2 border border-gray-300">
                                    <span>{data.inspektor?.nama}</span>
                                  </td>
                                  <td className="w-1/6 p-2 border border-gray-300 bg-gray-50">
                                    <span className="text-neutral-500 text-sm font-semibold">
                                      Waktu Sampling
                                    </span>
                                  </td>
                                  <td className="w-1/6 p-2 border border-gray-300">
                                    <span>{waktuSampling}</span>
                                  </td>
                                  <td className="w-1/6 p-2 border border-gray-300 bg-gray-50">
                                    <span className="text-neutral-500 text-sm font-semibold">
                                      Lama Pengerjaan
                                    </span>
                                  </td>
                                  <td className="w-1/6 p-2 border border-gray-300">
                                    <span>{lamaPengerjaan}</span>
                                  </td>
                                </tr>
                                <tr>
                                  <td className="p-2 border border-gray-300 bg-gray-50">
                                    <span className="text-neutral-500 text-sm font-semibold">
                                      Numerator
                                    </span>
                                  </td>
                                  <td className="p-2 border border-gray-300">
                                    <span>
                                      {formatInteger(parseInt(data.numerator))}
                                    </span>
                                  </td>
                                  <td className="p-2 border border-gray-300 bg-gray-50">
                                    <span className="text-neutral-500 text-sm font-semibold">
                                      Jumlah Sampling
                                    </span>
                                  </td>
                                  <td className="p-2 border border-gray-300">
                                    <span>
                                      {formatInteger(
                                        parseInt(data.jumlah_sampling),
                                      )}
                                    </span>
                                  </td>
                                  {data.eye_c && (
                                    <>
                                      <td className="p-2 border border-gray-300 bg-gray-50">
                                        <span className="text-neutral-500 text-sm font-semibold">
                                          Eye C
                                        </span>
                                      </td>
                                      <td className="p-2 border border-gray-300">
                                        <span>{data.eye_c}</span>
                                      </td>
                                    </>
                                  )}
                                  {!data.eye_c && (
                                    <>
                                      <td
                                        className="p-2 border border-gray-300"
                                        colSpan={2}
                                      >
                                        <span></span>
                                      </td>
                                    </>
                                  )}
                                </tr>
                              </tbody>
                            </table>

                            <div className="mt-2 overflow-x-auto">
                              {/* Split the defects into chunks of 10 */}
                              {(() => {
                                const chunks = [];
                                for (
                                  let i = 0;
                                  i < data.inspeksi_cetak_periode_defect.length;
                                  i += 10
                                ) {
                                  chunks.push(
                                    data.inspeksi_cetak_periode_defect.slice(
                                      i,
                                      i + 10,
                                    ),
                                  );
                                }

                                return chunks.map((chunk, chunkIndex) => {
                                  const isLastChunk =
                                    chunkIndex === chunks.length - 1;
                                  const hasPartialRow =
                                    isLastChunk && chunk.length < 10;

                                  // Calculate cell width based on fixed dimension
                                  const cellWidthPx = 70; // Fixed width in pixels for each cell
                                  const tableWidthPx =
                                    cellWidthPx * chunk.length;

                                  return (
                                    <div
                                      key={chunkIndex}
                                      className="mb-2"
                                      style={{
                                        width: hasPartialRow
                                          ? `${tableWidthPx}px`
                                          : '100%',
                                        display: 'inline-block',
                                      }}
                                    >
                                      <table
                                        className="border-collapse border border-gray-300"
                                        style={{
                                          width: `${tableWidthPx}px`,
                                          tableLayout: 'fixed',
                                        }}
                                      >
                                        <thead>
                                          <tr className="bg-blue-50">
                                            {chunk.map(
                                              (defect: any, i: any) => (
                                                <th
                                                  key={i}
                                                  className="border border-gray-300 p-1 text-sm h-8"
                                                  style={{
                                                    width: `${cellWidthPx}px`,
                                                  }}
                                                >
                                                  {defect.kode}
                                                </th>
                                              ),
                                            )}
                                          </tr>
                                        </thead>
                                        <tbody>
                                          <tr>
                                            {chunk.map(
                                              (defect: any, i: any) => {
                                                let bgColor = '';
                                                if (defect.hasil === 'ok')
                                                  bgColor = 'bg-blue-100';
                                                else if (
                                                  defect.hasil ===
                                                  'ok (toleransi)'
                                                )
                                                  bgColor = 'bg-yellow-100';
                                                else if (
                                                  defect.hasil === 'not ok'
                                                )
                                                  bgColor = 'bg-red-100';

                                                return (
                                                  <td
                                                    key={i}
                                                    className={`border border-gray-300 p-1 text-center ${bgColor} h-12`}
                                                    style={{
                                                      width: `${cellWidthPx}px`,
                                                    }}
                                                  >
                                                    <div className="uppercase font-semibold text-xs line-clamp-1">
                                                      {defect.hasil}
                                                    </div>
                                                    {defect.hasil ===
                                                      'not ok' &&
                                                      defect.jumlah_defect && (
                                                        <div className="text-xs">
                                                          Jumlah:{' '}
                                                          {formatInteger(
                                                            parseInt(
                                                              defect.jumlah_defect,
                                                            ),
                                                          )}
                                                        </div>
                                                      )}
                                                  </td>
                                                );
                                              },
                                            )}
                                          </tr>
                                        </tbody>
                                      </table>
                                    </div>
                                  );
                                });
                              })()}
                            </div>

                            {data.catatan && (
                              <div className="mt-4">
                                <div className="font-semibold mb-2">
                                  Catatan:
                                </div>
                                <div className="border border-gray-300 p-3 min-h-[80px] bg-gray-50">
                                  {data.catatan}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
                <div className="mt-4">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-blue-50">
                        <th className="w-1/3 border border-gray-300 p-2 text-sm">
                          Sample 1
                        </th>
                        <th className="w-1/3 border border-gray-300 p-2 text-sm">
                          Sample 2
                        </th>
                        <th className="w-1/3 border border-gray-300 p-2 text-sm">
                          Sample 3
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 p-2">
                          <div className="flex items-center gap-2">
                            <span>
                              {
                                cetakMesin?.data?.inspeksi_cetak_periode[0]
                                  ?.sample_1
                              }{' '}
                              gr
                            </span>
                            <span>
                              ={' '}
                              {
                                cetakMesin?.data?.inspeksi_cetak_periode[0]
                                  ?.hasil_sample_1
                              }{' '}
                              g/m<sup>2</sup>
                            </span>
                          </div>
                        </td>
                        <td className="border border-gray-300 p-2">
                          <div className="flex items-center gap-2">
                            <span>
                              {
                                cetakMesin?.data?.inspeksi_cetak_periode[0]
                                  ?.sample_2
                              }{' '}
                              gr
                            </span>
                            <span>
                              ={' '}
                              {
                                cetakMesin?.data?.inspeksi_cetak_periode[0]
                                  ?.hasil_sample_2
                              }{' '}
                              g/m<sup>2</sup>
                            </span>
                          </div>
                        </td>
                        <td className="border border-gray-300 p-2">
                          <div className="flex items-center gap-2">
                            <span>
                              {
                                cetakMesin?.data?.inspeksi_cetak_periode[0]
                                  ?.sample_3
                              }{' '}
                              gr
                            </span>
                            <span>
                              ={' '}
                              {
                                cetakMesin?.data?.inspeksi_cetak_periode[0]
                                  ?.hasil_sample_3
                              }{' '}
                              g/m<sup>2</sup>
                            </span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                {/* Signature Section */}
                <div className="mt-8">
                  {/* <table className="w-full border-collapse border border-gray-300">
                    <tbody>
                      <tr>
                        <td className="w-1/3 p-4 border border-gray-300 text-center">
                          <div className="font-semibold">Dibuat Oleh</div>
                          <div className="h-16"></div>
                          <div className="border-t border-gray-400 mt-2 pt-2">
                            <div>(__________________)</div>
                            <div className="text-sm">Quality Control</div>
                          </div>
                        </td>
                        <td className="w-1/3 p-4 border border-gray-300 text-center">
                          <div className="font-semibold">Disetujui Oleh</div>
                          <div className="h-16"></div>
                          <div className="border-t border-gray-400 mt-2 pt-2">
                            <div>(__________________)</div>
                            <div className="text-sm">Supervisor</div>
                          </div>
                        </td>
                        <td className="w-1/3 p-4 border border-gray-300 text-center">
                          <div className="font-semibold">Diketahui Oleh</div>
                          <div className="h-16"></div>
                          <div className="border-t border-gray-400 mt-2 pt-2">
                            <div>(__________________)</div>
                            <div className="text-sm">Quality Assurance</div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <main className="overflow-x-scroll">
        <div className="min-w-[700px] bg-white rounded-xl">
          <p className="text-[14px] font-semibold w-full  border-b-8 border-[#D8EAFF] py-4 px-9 md:ps-9 ps-12">
            {tanggal}
          </p>
          <div className=" w-full h-full flex-col border-b-8 border-[#D8EAFF]">
            <div className="grid grid-cols-10 px-10 py-4 border-b-8 items-center border-[#D8EAFF] gap-2 ">
              <label className="text-neutral-500 text-sm font-semibold col-span-2">
                Mesin : {cetakMesin?.data?.mesin}
              </label>
              <label className="text-neutral-500 text-sm font-semibold col-span-3">
                No. JO : {cetakMesin?.data?.no_jo}
              </label>
              <div className="col-span-5 flex justify-end">
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
            </div>
            <div className="w-2 h-full "></div>

            {cetakMesin?.data?.inspeksi_cetak_awal.length > 0 ? (
              <div className="flex  border-b-8 border-[#D8EAFF] gap-7 items-center">
                <div className="flex items-center gap-7 w-full">
                  <div
                    className={`w-2 h-full sticky left-0 z-20 ${
                      cetakMesin?.data?.inspeksi_cetak_awal[0].status ==
                      'incoming'
                        ? 'bg-red-500'
                        : 'bg-green-500'
                    }  gap-8 py-7 `}
                  ></div>

                  <label className="text-neutral-500 text-sm font-semibold flex ">
                    PENGECEKAN AWAL
                  </label>
                </div>

                <div className="justify-end flex pr-2 w-full ">
                  <Link to={`/qc/inspection/cetak/jenis/check-awal/${id}`}>
                    <button
                      className={`uppercase px-14 inline-flex rounded-[3px] items-center text-white text-xs font-bold  py-2 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600  justify-center`} // Dynamic class assignment
                    >
                      PILIH
                    </button>
                  </Link>
                </div>
              </div>
            ) : null}

            {cetakMesin?.data?.inspeksi_cetak_periode.length > 0 ? (
              <div className="flex  border-b-8 border-[#D8EAFF] gap-7 items-center">
                <div className="flex items-center gap-7 w-full">
                  <div
                    className={`w-2 h-full sticky left-0 z-20 ${
                      cetakMesin?.data?.inspeksi_cetak_periode[0].status ==
                      'incoming'
                        ? 'bg-red-500'
                        : 'bg-green-500'
                    }  gap-8 py-7 `}
                  ></div>

                  <label className="text-neutral-500 text-sm font-semibold flex ">
                    CEK PERIODE
                  </label>
                </div>

                <div className="justify-end flex pr-2 w-full ">
                  <Link to={`/qc/inspection/cetak/jenis/check-periode/${id}`}>
                    <button
                      className={`uppercase px-14 inline-flex rounded-[3px] items-center text-white text-xs font-bold  py-2 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600  justify-center`} // Dynamic class assignment
                    >
                      PILIH
                    </button>
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </>
  );
}

export default JenisHasilRabut;
