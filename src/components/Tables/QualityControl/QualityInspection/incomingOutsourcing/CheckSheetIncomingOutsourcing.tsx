import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import convertTimeStampToDateOnly from '../../../../../utils/convertDateOnly';
import convertDateToTime from '../../../../../utils/converDateToTime';
import calculateElapsedTime from '../../../../../utils/calculateElapsedTime';
import formatElapsedTime from '../../../../../utils/formatElapsedTime';
import Loading from '../../../../Loading';
import convertTimeStampToDateTime from '../../../../../utils/converDateTime';
import ptcbl from '../../../../../images/ptcbl.png';

function ChecksheetRusakSebagian() {
  const { id } = useParams();
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [FinalInspection, setFinalInspection] = useState<any>();
  const [Catatan, setCatatan] = useState<any>();
  const [Hasil, setHasil] = useState<any>();
  const [Outsourcing, setOutsourcing] = useState<any>();
  const [Jenis, setJenis] = useState<any>();
  const [JenisHasil, setJenisHasil] = useState<any>();
  const [StatusJo, setStatusJo] = useState<any>();
  const [WaktuSortir, setWaktuSortir] = useState<any>();

  useEffect(() => {
    getFinalInspection();
  }, []);

  async function getFinalInspection() {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/incomingOutsourcing/${id}`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      setFinalInspection(res.data);
      console.log(res.data);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  async function startTaskFinal(id: number) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/incomingOutsourcing/start/${id}`;
    try {
      const res = await axios.get(
        url,

        {
          withCredentials: true,
        },
      );

      getFinalInspection();
    } catch (error: any) {
      console.log(error);
      alert(error.response.data.msg);
    }
  }

  async function stopTaskRabut(
    id: number,
    startTime: any,
    catatan: any,
    qty_pallet: any,
    data_defect: any,
  ) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiFinalPoint/stop/${id}`;
    try {
      const elapsedSeconds = calculateElapsedTime(startTime, new Date());
      console.log(elapsedSeconds);
      const res = await axios.put(
        url,
        {
          catatan: catatan,
          lama_pengerjaan: elapsedSeconds,
          qty_pallet,
          data_defect,
        },
        {
          withCredentials: true,
        },
      );

      getFinalInspection();
    } catch (error: any) {
      console.log(error.response.data.msg);
      alert(error.response.data.msg);
    }
  }

  async function tambahTaskRabut(id: number) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiFinalPoint/create`;
    try {
      setIsLoading(true);
      const res = await axios.post(
        url,
        {
          id_inspeksi_rabut: id,
        },
        {
          withCredentials: true,
        },
      );
      setIsLoading(false);
      getFinalInspection();
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  async function doneRabut(id: number, startTime: any) {
    if (Jenis == null) {
      // Check if start time is available
      alert('Status JO Belum Terisi');
      return; // Exit function if no start time
    }

    if (StatusJo == null) {
      // Check if start time is available
      alert('Status JO Belum Terisi');
      return; // Exit function if no start time
    }

    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/incomingOutsourcing/done/${id}`;
    try {
      const elapsedSeconds = calculateElapsedTime(startTime, new Date());
      const res = await axios.put(
        url,
        {
          hasil_check: FinalInspection.data.incoming_outsourcing_result,
          lama_pengerjaan: elapsedSeconds,
          catatan: Catatan,
          hasil: Hasil,
          outsourcing: Outsourcing,
          jenis: Jenis,
          jenis_hasil: JenisHasil,
          status_jo: StatusJo,
          waktu_sortir: WaktuSortir,
        },
        {
          withCredentials: true,
        },
      );

      getFinalInspection();
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  async function pendingRabut(id: number) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiFinal/pending/${id}`;
    try {
      const res = await axios.put(
        url,
        {},
        {
          withCredentials: true,
        },
      );

      getFinalInspection();
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  const handleChangePoint = (e: any, i: number) => {
    const { name, value } = e.target;
    const onchangeVal: any = FinalInspection;
    onchangeVal.data.incoming_outsourcing_result[i][name] = value;
    setFinalInspection(onchangeVal);
  };

  const handleChangePointRadio = (e: any, i: number) => {
    const { name, value } = e.target;
    const onchangeVal: any = FinalInspection;
    onchangeVal.data.incoming_outsourcing_result[i]['hasil_check'] = value;
    setFinalInspection(onchangeVal);
  };

  const tanggal = convertTimeStampToDateOnly(FinalInspection?.data?.createdAt);
  const jam = convertDateToTime(FinalInspection?.data?.createdAt);

  const jumlahWaktuCheck = formatElapsedTime(
    FinalInspection?.data?.waktu_check,
  );

  const waktuMulaiincoming = convertTimeStampToDateTime(
    FinalInspection != null && FinalInspection.data?.waktu_mulai,
  );

  const waktuSelesaiFinalIncoming =
    FinalInspection != null && FinalInspection.data?.waktu_selesai != null
      ? convertTimeStampToDateTime(FinalInspection.data?.waktu_selesai)
      : '-';
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
                          INCOMING OUTSOURCING CHECKSHEET
                        </td>
                      </tr>
                    </thead>
                  </table>
                </div>

                {/* Main content */}
                <div className="border border-black p-4">
                  {/* Basic Information Table */}
                  <table className="w-full mb-6">
                    <tbody>
                      <tr>
                        <td className="w-1/4 py-1">Tanggal</td>
                        <td className="w-1/4 py-1">: {tanggal}</td>
                        <td className="w-1/4 py-1">Jenis</td>
                        <td className="w-1/4 py-1">
                          : {FinalInspection?.data?.jenis}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1">No. JO</td>
                        <td className="py-1">
                          : {FinalInspection?.data?.no_jo}
                        </td>
                        <td className="py-1">Jenis Hasil</td>
                        <td className="py-1">
                          : {FinalInspection?.data?.jenis_hasil}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1">Nama Produk</td>
                        <td className="py-1">
                          : {FinalInspection?.data?.nama_produk}
                        </td>
                        <td className="py-1">Status JO</td>
                        <td className="py-1">
                          : {FinalInspection?.data?.status_jo}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1">Jumlah Druk / Mata</td>
                        <td className="py-1">
                          : {FinalInspection?.data?.jumlah_druk} /{' '}
                          {FinalInspection?.data?.isi_mata}
                        </td>
                        <td className="py-1">Inspector</td>
                        <td className="py-1">
                          : {FinalInspection?.data?.inspektor?.nama}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1">Jumlah Pcs</td>
                        <td className="py-1">
                          : {FinalInspection?.data?.jumlah_pcs}
                        </td>
                        <td className="py-1">Waktu Mulai</td>
                        <td className="py-1">
                          :{' '}
                          {FinalInspection?.data?.waktu_mulai
                            ? new Date(
                                FinalInspection.data.waktu_mulai,
                              ).toLocaleString()
                            : '-'}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1">Outsourcing</td>
                        <td className="py-1">
                          : {FinalInspection?.data?.outsourcing}
                        </td>
                        <td className="py-1">Waktu Selesai</td>
                        <td className="py-1">
                          :{' '}
                          {FinalInspection?.data?.waktu_selesai
                            ? new Date(
                                FinalInspection.data.waktu_selesai,
                              ).toLocaleString()
                            : '-'}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1"></td>
                        <td className="py-1"></td>
                        <td className="py-1">Total Waktu</td>
                        <td className="py-1">
                          :{' '}
                          {FinalInspection?.data?.lama_pengerjaan
                            ? formatElapsedTime(
                                FinalInspection.data.lama_pengerjaan,
                              )
                            : '-'}{' '}
                          Detik
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Point Check Table */}
                  <table className="w-full border-collapse border border-black mb-6">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-black p-2 w-16 text-center">
                          No
                        </th>
                        <th className="border border-black p-2 text-center">
                          Point Check
                        </th>
                        <th className="border border-black p-2 text-center">
                          Standar
                        </th>
                        <th className="border border-black p-2 text-center">
                          Hasil Point
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {FinalInspection?.data?.incoming_outsourcing_result?.map(
                        (data: any, index: any) => (
                          <tr key={index}>
                            <td className="border border-black p-2 text-center">
                              {index + 1}
                            </td>
                            <td className="border border-black p-2">
                              {data.point_check}
                            </td>
                            <td className="border border-black p-2">
                              {data.standard}
                            </td>
                            <td className="border border-black p-2">
                              {data.hasil_check}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>

                  {/* Final Result */}
                  <div className="border border-black p-4 mb-6">
                    <div className="flex justify-between mb-4">
                      <div className="w-2/3">
                        <p className="font-bold mb-2">Catatan:</p>
                        <p>{FinalInspection?.data?.catatan || '-'}</p>
                      </div>
                      <div className="w-1/3 text-center">
                        <p className="font-bold mb-2">Hasil Final:</p>
                        <p
                          className={`font-bold text-xl ${
                            FinalInspection?.data?.hasil_check === 'Diterima'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {FinalInspection?.data?.hasil_check || '-'}
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
                        {FinalInspection?.data?.inspektor?.nama ||
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
            doneRabut(
              FinalInspection?.data.id,
              FinalInspection?.data.waktu_mulai,
            );
            //console.log(FinalInspection.data.incoming_outsourcing_result);
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
                Incoming Outsourcing Checksheet
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

            <div className="grid grid-cols-12  border-b-8 border-[#D8EAFF]">
              <div className="grid grid-rows-6 gap-2 col-span-2 pl-6 py-4 ">
                <label className="text-neutral-500 text-sm font-semibold">
                  Tanggal
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  No. JO
                </label>

                <label className="text-neutral-500 text-sm font-semibold">
                  Nama Produk
                </label>

                <label className="text-neutral-500 text-sm font-semibold">
                  Jumlah Druk / Mata
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Jumlah Pcs
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Outsourcing
                </label>
              </div>
              <div className="grid grid-rows-6 gap-2 col-span-2  py-4">
                <label className="text-neutral-500 text-sm font-semibold">
                  : {tanggal}
                </label>

                <label className="text-neutral-500 text-sm font-semibold">
                  : {FinalInspection?.data?.no_jo}
                </label>

                <label className="text-neutral-500 text-sm font-semibold">
                  : {FinalInspection?.data?.nama_produk}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {FinalInspection?.data?.jumlah_druk} /{' '}
                  {FinalInspection?.data?.isi_mata}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {FinalInspection?.data?.jumlah_pcs}
                </label>
                {FinalInspection?.data?.status == 'incoming' ? (
                  <>
                    <input
                      required
                      type="text"
                      name=""
                      className="border px-1"
                      id=""
                      onChange={(e) => setOutsourcing(e.target.value)}
                    />
                  </>
                ) : (
                  <>
                    <input
                      readOnly
                      defaultValue={FinalInspection?.data?.outsourcing}
                      type="text"
                      name=""
                      className="border px-1"
                      id=""
                    />
                  </>
                )}
              </div>
              <div className="grid grid-rows-6  gap-2 col-span-2   py-4">
                <label className="text-neutral-500 text-sm font-semibold">
                  Jenis
                </label>
                <label htmlFor=""></label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Status
                </label>
                {/* <label className="text-neutral-500 text-sm font-semibold">
                  Waktu Sortir
                </label> */}
                <label className="text-neutral-500 text-sm font-semibold"></label>
              </div>
              {FinalInspection?.data?.status == 'incoming' ? (
                <>
                  <div className="grid grid-rows-6  gap-2 col-span-3  px-2 py-4">
                    <div className=" text-[#646464]   flex flex-col gap-1">
                      <div className="relative z-20 h-10 bg-white dark:bg-form-input  w-full">
                        <span className="absolute top-1/2 left-4 z-30 -translate-y-1/2">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          ></svg>
                        </span>

                        <select
                          onChange={(e) => setJenis(e.target.value)}
                          className={`relative z-20 w-full bg-[#64646424] appearance-none rounded-md h-7 py-1 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input  
                  }`}
                        >
                          <option
                            selected
                            disabled
                            className="text-[#646464] text-xs dark:text-bodydark"
                          >
                            Pilih Jenis
                          </option>

                          <option
                            value="UV"
                            className="text-[#646464] text-xs dark:text-bodydark"
                          >
                            UV
                          </option>
                          <option
                            value="FOIL"
                            className="text-[#646464] text-xs dark:text-bodydark"
                          >
                            FOIL
                          </option>
                          <option
                            value="EMBOSS"
                            className="text-[#646464] text-xs dark:text-bodydark"
                          >
                            EMBOSS
                          </option>
                          <option
                            value="LAMINASI KILAP"
                            className="text-[#646464] text-xs dark:text-bodydark"
                          >
                            LAMINASI KILAP
                          </option>
                          <option
                            value="LAMINASI DOFF"
                            className="text-[#646464] text-xs dark:text-bodydark"
                          >
                            LAMINASI DOFF
                          </option>
                        </select>

                        <span className="absolute top-[15px] right-4 z-10 -translate-y-1/2">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g opacity="0.8">
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                                fill="#637381"
                              ></path>
                            </g>
                          </svg>
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex gap-2">
                        <input
                          required
                          type="radio"
                          name="ss44"
                          id="ss66"
                          value={'Sesuai'}
                          onChange={(e) => setJenisHasil(e.target.value)}
                        />
                        <label className="mr-2" htmlFor="ss">
                          Sesuai
                        </label>
                      </div>
                      <div className="flex gap-2">
                        <input
                          required
                          type="radio"
                          name="ss44"
                          id="ss66"
                          value={'Tidak Sesuai'}
                          onChange={(e) => setJenisHasil(e.target.value)}
                        />
                        <label className="mr-2" htmlFor="ss1">
                          Tidak Sesuai
                        </label>
                      </div>
                    </div>
                    <div className=" text-[#646464]   flex flex-col gap-1">
                      <div className="relative z-20 h-10 bg-white dark:bg-form-input  w-full">
                        <span className="absolute top-1/2 left-4 z-30 -translate-y-1/2">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          ></svg>
                        </span>

                        <select
                          onChange={(e) => setStatusJo(e.target.value)}
                          className={`relative z-20 w-full bg-[#64646424] appearance-none rounded-md h-7 py-1 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input  
}`}
                        >
                          <option
                            selected
                            disabled
                            className="text-[#646464] text-xs dark:text-bodydark"
                          >
                            Pilih Status JO
                          </option>

                          <option
                            value="BARU"
                            className="text-[#646464] text-xs dark:text-bodydark"
                          >
                            BARU
                          </option>
                          <option
                            value="REPEAT"
                            className="text-[#646464] text-xs dark:text-bodydark"
                          >
                            REPEAT
                          </option>
                          <option
                            value="PROOF"
                            className="text-[#646464] text-xs dark:text-bodydark"
                          >
                            PROOF
                          </option>
                          <option
                            value="CUPK"
                            className="text-[#646464] text-xs dark:text-bodydark"
                          >
                            CUPK
                          </option>
                          <option
                            value="PERUBAHAN"
                            className="text-[#646464] text-xs dark:text-bodydark"
                          >
                            REPEAT PERUBAHAN
                          </option>
                        </select>

                        <span className="absolute top-[15px] right-4 z-10 -translate-y-1/2">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g opacity="0.8">
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                                fill="#637381"
                              ></path>
                            </g>
                          </svg>
                        </span>
                      </div>
                    </div>

                    {/* <input
type="date"
onChange={(e) => setWaktuSortir(e.target.value)}
/> */}

                    <label className="text-neutral-500 text-sm font-semibold"></label>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-rows-6  gap-2 col-span-3  px-2 py-4">
                    <div className=" text-[#646464]   flex flex-col gap-1">
                      : {FinalInspection?.data?.jenis}
                    </div>
                    <div className="flex flex-col text-[#646464] ">
                      : {FinalInspection?.data?.jenis_hasil}
                    </div>

                    <div className=" text-[#646464]   flex flex-col gap-1">
                      : {FinalInspection?.data?.status_jo}
                    </div>

                    <label className="text-neutral-500 text-sm font-semibold"></label>
                  </div>
                </>
              )}

              <div className="flex flex-col w-full gap-4 px-2 py-4 col-span-3 bg-[#F6FAFF]">
                <div className="  gap-2 col-span-2 justify-between px-2 py-4">
                  <label className="text-neutral-500 text-sm font-semibold">
                    Inspector : {FinalInspection?.data?.inspektor?.nama}
                  </label>
                </div>

                <div>
                  {FinalInspection?.data.waktu_mulai == null &&
                    FinalInspection?.data.waktu_selesai == null && (
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
                                startTaskFinal(FinalInspection?.data.id);
                              }}
                              className="flex w-[45%]  rounded-md bg-[#00B81D] justify-center items-center px-2 py-2 hover:cursor-pointer"
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
                  {FinalInspection?.data.waktu_mulai != null &&
                    FinalInspection?.data.waktu_selesai == null && (
                      <>
                        <div>
                          <p className="md:text-[14px] text-[9px] font-semibold">
                            Waktu Mulai : {waktuMulaiincoming}
                          </p>
                          <p className="md:text-[14px] text-[9px] font-semibold">
                            Waktu Selesai : {waktuSelesaiFinalIncoming}
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
                  {FinalInspection?.data.waktu_mulai != null &&
                    FinalInspection?.data.waktu_selesai != null && (
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
                            {waktuSelesaiFinalIncoming}
                          </p>
                          <p className="md:text-[14px] text-[9px] font-semibold">
                            Time :
                          </p>
                          <p className="md:text-[14px] text-[9px] font-semibold text-stone-400">
                            {FinalInspection?.data.lama_pengerjaan != null
                              ? formatElapsedTime(
                                  FinalInspection?.data.lama_pengerjaan,
                                )
                              : ''}{' '}
                            Detik
                          </p>
                        </div>
                      </>
                    )}
                </div>
              </div>
            </div>

            {/* =============================chekcsheet========================= */}
          </div>
          {FinalInspection?.data.waktu_mulai != null &&
            FinalInspection?.data.waktu_selesai == null && (
              <>
                <div className="bg-white mb-2text-sm flex font-semibold px-5 py-2 mb-2">
                  <p className="w-20">No</p>
                  <div className="grid grid-cols-5 w-full">
                    <p>Point Check</p>
                    <p>Standar</p>
                    <p>Hasil Point</p>
                  </div>
                </div>
                {FinalInspection?.data.incoming_outsourcing_result.map(
                  (data: any, index: number) => {
                    return (
                      <div className="bg-white mb-2text-sm flex font-semibold px-5 py-2 mb-2">
                        <p className="w-20 my-auto">{index + 1}</p>
                        <div className="grid grid-cols-5 items-center w-full">
                          <p>{data.point_check}</p>
                          <p className="">{data.standard}</p>
                          <div className="flex flex-col">
                            <div className="flex gap-2">
                              <input
                                required
                                type="radio"
                                name={`ss ${index}`}
                                id="ss"
                                value="Sesuai"
                                onChange={(e) =>
                                  handleChangePointRadio(e, index)
                                }
                              />
                              <label className="mr-2" htmlFor="ss">
                                Sesuai
                              </label>
                            </div>
                            <div className="flex gap-2">
                              <input
                                required
                                type="radio"
                                name={`ss ${index}`}
                                id="ss1"
                                value="Tidak Sesuai"
                                onChange={(e) =>
                                  handleChangePointRadio(e, index)
                                }
                              />
                              <label className="mr-2" htmlFor="ss1">
                                Tidak Sesuai
                              </label>
                            </div>
                            <div className="flex gap-2">
                              <input
                                required
                                type="radio"
                                name={`ss ${index}`}
                                id="ss2"
                                value="Tidak Ada Proses"
                                onChange={(e) =>
                                  handleChangePointRadio(e, index)
                                }
                              />
                              <label className="mr-2" htmlFor="ss2">
                                Tidak Ada Proses
                              </label>
                            </div>
                          </div>
                          <div>
                            <input type="file" name="" id="" />
                          </div>
                        </div>
                      </div>
                    );
                  },
                )}
              </>
            )}
          {FinalInspection?.data?.status == 'history' && (
            <>
              <div className="bg-white mb-2text-sm flex font-semibold px-5 py-2 mb-2">
                <p className="w-20">No</p>
                <div className="grid grid-cols-5 w-full">
                  <p>Point Check</p>
                  <p>Standar</p>
                  <p>Hasil Point</p>
                </div>
              </div>
              {FinalInspection?.data.incoming_outsourcing_result.map(
                (data: any, index: number) => {
                  return (
                    <div className="bg-white mb-2text-sm flex font-semibold px-5 py-2 mb-2">
                      <p className="w-20 my-auto">{index + 1}</p>
                      <div className="grid grid-cols-5 items-center w-full">
                        <p>{data.point_check}</p>
                        <p className="">{data.standard}</p>
                        <div className="flex flex-col">
                          <div className="flex gap-2">{data.hasil_check}</div>
                        </div>
                        <div></div>
                      </div>
                    </div>
                  );
                },
              )}
            </>
          )}

          {FinalInspection?.data?.status == 'incoming' ? (
            <>
              <div className="bg-white text-sm flex font-semibold px-5 py-2 mb-2">
                <div className="grid grid-cols-5 gap-5 items-center w-full">
                  <div className="col-span-3">
                    <p>catatan*:</p>
                    <textarea
                      required
                      name=""
                      id=""
                      className="w-full border"
                      onChange={(e) => setCatatan(e.target.value)}
                    ></textarea>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex gap-2">
                      <input
                        required
                        type="radio"
                        name="ss"
                        id="ss"
                        value={'Diterima'}
                        onChange={(e) => setHasil(e.target.value)}
                      />
                      <label className="mr-2" htmlFor="ss">
                        DITERIMA
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <input
                        required
                        type="radio"
                        name="ss"
                        id="ss1"
                        value={'Ditolak'}
                        onChange={(e) => setHasil(e.target.value)}
                      />
                      <label className="mr-2" htmlFor="ss1">
                        DITOLAK
                      </label>
                    </div>
                  </div>
                  <button
                    type="submit"
                    value="submit"
                    className="text-sm text-white bg-green-600 py-2"
                  >
                    SUBMIT CHECKSHEET
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex gap-8 bg-white px-4 py-7 w-full text-lg font-semibold uppercase justify-between">
                <p>Catatan :{FinalInspection?.data.catatan}</p>
                <p>{FinalInspection?.data.hasil_check}</p>
              </div>
            </>
          )}
        </form>
      </main>
    </>
  );
}

export default ChecksheetRusakSebagian;
