import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import convertTimeStampToDateOnly from '../../../../../utils/convertDateOnly';
import convertDateToTime from '../../../../../utils/converDateToTime';
import convertDateTime from '../../../../../utils/converDateTime';
import calculateElapsedTime from '../../../../../utils/calculateElapsedTime';
import formatElapsedTime from '../../../../../utils/formatElapsedTime';
import ptcbl from '../../../../../images/ptcbl.png';
import Loading from '../../../../Loading';
import formatInteger from '../../../../../utils/formaterInteger';

function ChecksheetFinalInspection() {
  const { id } = useParams();
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [FinalInspection, setFinalInspection] = useState<any>();
  const [Catatan, setCatatan] = useState<any>();
  const [qtyPacking, setQtyPacking] = useState<any>();
  const [outsource, setOutsource] = useState<any>();
  const [jumlahPacking, setJumlahPacking] = useState<any>();
  const [noPallet, setnoPallet] = useState<any>();
  const [noPacking, setnoPacking] = useState<any>();
  const [status, setStatus] = useState<any>();
  useEffect(() => {
    getFinalInspection();
  }, []);

  async function getFinalInspection() {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiOutsourcingBJ/${id}`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      setFinalInspection(res.data.data);
      console.log(res.data);
      console.log('yusyd');
    } catch (error: any) {
      console.log(error);
    }
  }
  async function startTask(id: any) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiOutsourcingBJ/start/${id}`;

    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      getFinalInspection();
    } catch (error: any) {
      console.log(error);
    }
  }
  async function doneFinal(id: number, start: any) {
    if (!start) {
      // Check if start time is available
      alert('Belum Start.');
      return; // Exit function if no start time
    }

    const stopTime = new Date();
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiOutsourcingBJ/${id}`;
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
          lama_pengerjaan: totalSecondsToSave,
          catatan: Catatan,
          no_pallet: noPallet,
          no_packing: noPacking,
          qty_packing: qtyPacking,
          jumlah_packing: jumlahPacking,
          outsource: outsource,
          status: status,
          inspeksi_outsourcing_bj_point:
            FinalInspection?.inspeksi_outsourcing_bj_point,
          inspeksi_outsourcing_bj_sub:
            FinalInspection?.inspeksi_outsourcing_bj_sub,
        },
        {
          withCredentials: true,
        },
      );

      // if (status == 'bisa kirim') {
      //   const respon = await axios.post(
      //     `https://erp.cbloffset.com/api/approve-final-inspection?no_jo=${FinalInspection?.no_jo}`,
      //     {},
      //   );
      //   console.log(respon);
      // }

      getFinalInspection();
    } catch (error: any) {
      console.log(error);
      alert(error.response.data.msg);
    }
  }

  const handleChangePoint = (e: any, i: number) => {
    const { name, value } = e.target;
    const onchangeVal: any = FinalInspection;
    onchangeVal.inspeksi_outsourcing_bj_point[i][name] = value;
    setFinalInspection(onchangeVal);
  };
  const handleChangePointHasil = (e: any, i: number) => {
    const { name, value } = e.target;
    const onchangeVal: any = FinalInspection;
    onchangeVal.inspeksi_outsourcing_bj_point[i]['hasil'] = value;
    setFinalInspection(onchangeVal);
  };

  const handleChangeSubPoint = (e: any, i: number) => {
    const { name, value } = e.target;
    const onchangeVal: any = FinalInspection;
    onchangeVal.inspeksi_outsourcing_bj_sub[i][name] = value;
    setFinalInspection(onchangeVal);
    console.log(onchangeVal);
  };

  const tanggal = convertTimeStampToDateOnly(FinalInspection?.createdAt);
  const jam = convertDateToTime(FinalInspection?.createdAt);
  const waktuMulaiincoming = convertDateTime(
    FinalInspection != null && FinalInspection?.waktu_mulai,
  );

  const waktuSelesaiincoming =
    FinalInspection != null && FinalInspection?.waktu_selesai != null
      ? convertDateTime(FinalInspection?.waktu_selesai)
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
                        <td colSpan={3} className="border border-black p-2">
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
                          No. Dok : {FinalInspection?.no_doc}
                        </td>
                      </tr>
                      <tr>
                        <td
                          colSpan={3}
                          className="border border-black p-2 text-center font-bold"
                        >
                          OUTSOURCING BARANG JADI CHECKSHEET
                        </td>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className=" p-2 font-medium">Tanggal</td>
                        <td className=" p-2">:{tanggal}</td>
                        <td className=" p-2 font-medium">Jam</td>
                        <td className=" p-2">:{jam}</td>
                      </tr>
                      <tr>
                        <td className=" p-2 font-medium">No. JO</td>
                        <td className=" p-2">:{FinalInspection?.no_jo}</td>
                        <td className=" p-2 font-medium">Status JO</td>
                        <td className=" p-2">:{FinalInspection?.status_jo}</td>
                      </tr>
                      <tr>
                        <td className=" p-2 font-medium">No. IO</td>
                        <td className=" p-2">:{FinalInspection?.no_io}</td>
                        <td className=" p-2 font-medium">Inspector</td>
                        <td className=" p-2">
                          :{FinalInspection?.data_inspector?.nama}
                        </td>
                      </tr>
                      <tr>
                        <td className=" p-2 font-medium">Nama Produk</td>
                        <td className=" p-2">
                          :{FinalInspection?.nama_produk}
                        </td>
                        <td className=" p-2 font-medium">Waktu Mulai</td>
                        <td className=" p-2">:{waktuMulaiincoming}</td>
                      </tr>
                      <tr>
                        <td className=" p-2 font-medium">Customer</td>
                        <td className=" p-2">:{FinalInspection?.customer}</td>
                        <td className=" p-2 font-medium">Waktu Selesai</td>
                        <td className=" p-2">:{waktuSelesaiincoming}</td>
                      </tr>
                      <tr>
                        <td className=" p-2 font-medium">Qty</td>
                        <td className=" p-2">
                          {formatInteger(parseInt(FinalInspection?.quantity))}
                        </td>
                        <td className=" p-2 font-medium">Time</td>
                        <td className=" p-2">
                          :
                          {FinalInspection?.lama_pengerjaan != null
                            ? formatElapsedTime(
                                FinalInspection?.lama_pengerjaan,
                              )
                            : ''}
                        </td>
                      </tr>
                      <tr>
                        <td className=" p-2 font-medium">Qty Packing</td>
                        <td className=" p-2">
                          :
                          {formatInteger(
                            parseInt(FinalInspection?.qty_packing || 0),
                          )}
                        </td>
                        <td className=" p-2"></td>
                        <td className=" p-2"></td>
                      </tr>
                      <tr>
                        <td className=" p-2 font-medium">Outsource</td>
                        <td className=" p-2">:{FinalInspection?.outsource}</td>
                        <td className=" p-2"></td>
                        <td className=" p-2"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Top section with standard and packing info */}
                <div className="border border-black">
                  <table className="w-full">
                    <tbody>
                      <tr className="border-b border-black">
                        <td className="border-r border-black p-2 w-1/2">
                          <p>
                            <span className="font-semibold">
                              √N + 1 = Jumlah packing yang akan dicek
                            </span>
                          </p>
                          <p>
                            Untuk JUMLAH PACKING yang diambil ={' '}
                            <span className=" font-bold">
                              {FinalInspection?.jumlah_packing}
                            </span>
                          </p>
                        </td>
                        <td className="p-2 w-1/2">
                          <p>
                            <span className="font-semibold">
                              STANDAR PEMERIKSAAN
                            </span>
                          </p>
                          <p>(N Jumlah packing)</p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* QTY table */}
                <div className="border-l border-r border-black">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-black">
                        <th className="border-r border-black p-2 text-center">
                          QTY PCS
                        </th>
                        <th className="border-r border-black p-2 text-center">
                          JUMLAH YANG DIPERIKSA
                        </th>
                        <th
                          colSpan={2}
                          className="border-r border-black p-2 text-center"
                        >
                          TINGKAT PENERIMAAN KUALITAS
                        </th>
                        <th className="p-2 text-center">REJECT YG DITEMUKAN</th>
                      </tr>
                      <tr className="border-b border-black">
                        <th className="border-r border-black"></th>
                        <th className="border-r border-black"></th>
                        <th className="border-r border-black p-2 text-center">
                          LULUS
                        </th>
                        <th className="border-r border-black p-2 text-center">
                          TOLAK
                        </th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {FinalInspection?.inspeksi_outsourcing_bj_sub.map(
                        (dataSub: any, indexSub: any) => {
                          const qtyAwal = formatInteger(dataSub?.quantity_awal);
                          const qtyAkhir = formatInteger(
                            dataSub?.quantity_akhir,
                          );
                          return (
                            <tr
                              key={indexSub}
                              className="border-b border-black"
                            >
                              <td className="border-r border-black p-2 text-center">{`${qtyAwal} Pcs S/D ${qtyAkhir} Pcs`}</td>
                              <td className="border-r border-black p-2 text-center">
                                {dataSub.jumlah}
                              </td>
                              <td className="border-r border-black p-2 text-center">
                                {dataSub.kualitas_lulus}
                              </td>
                              <td className="border-r border-black p-2 text-center">
                                {dataSub.kualitas_tolak}
                              </td>
                              <td className="p-2 text-center font-bold">
                                {dataSub.reject}
                              </td>
                            </tr>
                          );
                        },
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pallet and packing info */}
                <div className="border-l border-r border-b border-black mb-1">
                  <table className="w-full">
                    <tbody>
                      <tr className="border-t border-black">
                        <td className="border-r border-black p-2">
                          No Packing Yang Diperiksa :
                        </td>
                        <td className="p-2 font-bold">
                          {FinalInspection?.no_packing || '(MANUAL)'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Point check table */}
                <div className="border border-black">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-black">
                        <th className="border-r border-black p-2 text-center w-12">
                          No
                        </th>
                        <th className="border-r border-black p-2 text-center">
                          POINT CHECK
                        </th>
                        <th className="border-r border-black p-2 text-center">
                          STANDAR
                        </th>
                        <th className="border-r border-black p-2 text-center">
                          CARA PERIKSA
                        </th>
                        <th className="border-r border-black p-2 text-center">
                          HASIL
                        </th>
                        <th className="border-r border-black p-2 text-center">
                          QTY REJECT
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {FinalInspection?.inspeksi_outsourcing_bj_point.map(
                        (dataPoint: any, indexPoint: any) => {
                          return (
                            <tr
                              key={indexPoint}
                              className="border-b border-black"
                            >
                              <td className="border-r border-black p-2 text-center">
                                {indexPoint + 1}
                              </td>
                              <td className="border-r border-black p-2">
                                {dataPoint.point}
                              </td>
                              <td className="border-r border-black p-2 text-center">
                                {dataPoint.standar}
                              </td>
                              <td className="border-r border-black p-2 text-center">
                                {dataPoint.cara_periksa}
                              </td>
                              <td className="border-r border-black p-2 text-center uppercase">
                                {dataPoint.hasil}
                              </td>
                              <td className="border-r border-black p-2 text-center font-bold">
                                {dataPoint.qty}
                              </td>
                            </tr>
                          );
                        },
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Footer with catatan and status */}
                <div className="mt-4 grid grid-cols-2 gap-8">
                  <div>
                    <p className="mt-2">
                      <span className="font-semibold">Catatan:</span>
                    </p>
                    <div className="border border-gray-300 p-2 min-h-[80px] whitespace-pre-wrap">
                      {FinalInspection?.catatan}
                    </div>
                  </div>
                  <div className="uppercase font-bold flex w-full justify-center">
                    <label>{FinalInspection?.status}</label>
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
            console.log(FinalInspection);
            doneFinal(FinalInspection?.id, FinalInspection?.waktu_mulai);
          }}
        >
          <div className="min-w-[700px] bg-white rounded-xl">
            <p className="text-[14px] font-semibold justify-between w-full flex border-b-8 border-[#D8EAFF] py-4 px-9 md:ps-9 ps-12">
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
                Outsourcing Barang Jadi Checksheet
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
                  No. IO
                </label>

                <label className="text-neutral-500 text-sm font-semibold">
                  Nama Produk
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Customer
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Qty
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Qty PACKING
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Outsource
                </label>
              </div>
              <div className="grid grid-rows-6 gap-2 col-span-4  py-4">
                <label className="text-neutral-500 text-sm font-semibold line-clamp-1">
                  : {tanggal}
                </label>
                <label className="text-neutral-500 text-sm font-semibold line-clamp-1">
                  : {FinalInspection?.no_jo}
                </label>
                <label className="text-neutral-500 text-sm font-semibold line-clamp-1">
                  : {FinalInspection?.no_io}
                </label>

                <label className="text-neutral-500 text-sm font-semibold line-clamp-1">
                  : {FinalInspection?.nama_produk}
                </label>
                <label className="text-neutral-500 text-sm font-semibold line-clamp-1">
                  : {FinalInspection?.customer}
                </label>
                <label className="text-neutral-500 text-sm font-semibold line-clamp-1">
                  : {formatInteger(parseInt(FinalInspection?.quantity))}
                </label>
                <label className="text-neutral-500 text-sm font-semibold line-clamp-1">
                  :{' '}
                  {FinalInspection?.status == 'incoming' ? (
                    <input
                      required
                      onChange={(e) => {
                        setQtyPacking(e.target.value);
                        const qtyPacking = parseInt(e.target.value);
                        //menghitung akar dari qty_packing
                        const qtyQuadrat = Math.sqrt(qtyPacking);
                        //membulatkan hasil dari akar
                        const qtyQuadratFix = Math.round(qtyQuadrat);
                        //penghitungan terakhir rumus
                        const JumlahPacking = qtyQuadratFix + 1;
                        setJumlahPacking(JumlahPacking);
                      }}
                      type="text"
                      className=" border rounded border-strokedark w-[30%]"
                    />
                  ) : (
                    <input
                      onChange={(e) => {
                        setQtyPacking(e.target.value);
                        const qtyPacking = parseInt(e.target.value);
                        //menghitung akar dari qty_packing
                        const qtyQuadrat = Math.sqrt(qtyPacking);
                        //membulatkan hasil dari akar
                        const qtyQuadratFix = Math.round(qtyQuadrat);
                        //penghitungan terakhir rumus
                        const JumlahPacking = qtyQuadratFix + 1;
                        setJumlahPacking(JumlahPacking);
                      }}
                      type="text"
                      defaultValue={FinalInspection?.qty_packing}
                      className=" border rounded border-strokedark w-[30%]"
                    />
                  )}
                </label>
                <label className="text-neutral-500 text-sm font-semibold line-clamp-1">
                  :{' '}
                  {FinalInspection?.status == 'incoming' ? (
                    <input
                      required
                      onChange={(e) => {
                        setOutsource(e.target.value);
                      }}
                      type="text"
                      className=" border rounded border-strokedark w-[30%]"
                    />
                  ) : (
                    <input
                      required
                      onChange={(e) => {
                        setOutsource(e.target.value);
                      }}
                      type="text"
                      defaultValue={FinalInspection?.qty_packing}
                      className=" border rounded border-strokedark w-[30%]"
                    />
                  )}
                </label>
              </div>

              <div className="grid grid-rows-6  gap-2  justify-between px-10 py-4">
                <label className="text-neutral-500 text-sm font-semibold">
                  Jam
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Status Jo
                </label>
              </div>
              <div className="grid grid-rows-6  gap-2 col-span-2 justify-between px-2 py-4">
                <label className="text-neutral-500 text-sm font-semibold">
                  : {jam}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {FinalInspection?.status_jo}
                </label>
              </div>

              <div className="flex flex-col w-full col-span-3 items-start px-4">
                <div className="flex">
                  <div className="  gap-2  justify-between  py-4">
                    <label className="text-neutral-500 text-sm font-semibold">
                      Inspector
                    </label>
                  </div>
                  <div className="  gap-2 col-span-2 justify-between  py-4">
                    <label className="text-neutral-500 text-sm font-semibold">
                      : {FinalInspection?.data_inspector?.nama}
                    </label>
                  </div>
                </div>

                <div className="flex w-full">
                  {FinalInspection?.bagian_tiket == 'incoming' &&
                    FinalInspection?.waktu_mulai == null &&
                    FinalInspection?.waktu_selesai == null && (
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
                                startTask(FinalInspection?.id);
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
                  {FinalInspection?.waktu_mulai != null &&
                    FinalInspection?.waktu_selesai == null && (
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
                  {FinalInspection?.bagian_tiket == 'history' && (
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
                          {FinalInspection?.lama_pengerjaan != null
                            ? formatElapsedTime(
                                FinalInspection?.lama_pengerjaan,
                              )
                            : ''}{' '}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            {FinalInspection?.bagian_tiket == 'incoming' &&
              FinalInspection?.waktu_mulai == null &&
              FinalInspection?.waktu_selesai == null && (
                <>
                  <div className="flex px-4 py-5">
                    <p className="font-bold text-[#00B81D]">
                      Mulai Task Untuk Memunculkan Checksheet
                    </p>
                  </div>
                </>
              )}
          </div>
          <>
            {/* =============================chekcsheet========================= */}
            {FinalInspection?.waktu_mulai != null &&
              FinalInspection?.waktu_selesai == null && (
                <>
                  <div className="grid w-full grid-cols-2 gap-2">
                    <div className="bg-white ">
                      <p className="text-sm text-blue-700 font-semibold px-5 pt-5">
                        Standar Pemeriksaan
                      </p>
                      <div className="">
                        <div className="px-5">
                          <p className="font-semibold text-sm mt-5 ">
                            √N + 1 = Jumlah Packing yang akan dicek
                          </p>
                          <p className="font-semibold text-sm mt-5 ">
                            (N Jumlah packing)
                          </p>
                          <p className="font-semibold text-sm mt-5 ">
                            JUMLAH PACKING yang diambil :
                            {FinalInspection?.status == 'incoming' ? (
                              <input
                                required
                                type="text"
                                disabled
                                value={jumlahPacking}
                                onChange={(e) => {
                                  setJumlahPacking(e.target.value);
                                }}
                                className=" border rounded border-strokedark mb-4"
                              />
                            ) : (
                              <input
                                type="text"
                                disabled
                                defaultValue={FinalInspection?.jumlah_packing}
                                onChange={(e) => {
                                  setJumlahPacking(e.target.value);
                                }}
                                className=" border rounded border-strokedark mb-4"
                              />
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white ">
                      <p className="text-sm text-blue-700 font-semibold px-5 pt-5">
                        Standar Pemeriksaan
                      </p>
                      <div>
                        <div className="px-5 flex gap-5 items-center justify-between mt-5">
                          <p className="font-semibold text-sm  ">
                            No Packing yang diperiksa :
                          </p>

                          {FinalInspection?.status == 'incoming' ? (
                            <input
                              type="text"
                              onChange={(e) => {
                                setnoPacking(e.target.value);
                              }}
                              className=" border rounded border-strokedark"
                            />
                          ) : (
                            <input
                              type="text"
                              disabled
                              defaultValue={FinalInspection?.no_packing}
                              onChange={(e) => {
                                setnoPacking(e.target.value);
                              }}
                              className=" border rounded border-strokedark"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white mt-2 w-full grid grid-cols-4 text-blue-600 text-sm font-semibold ">
                    <div>
                      <p className="text-center">QTY PCS</p>
                    </div>
                    <div>
                      <p className="text-center">JUMLAH YANG DIPERIKSA</p>
                    </div>
                    <div className="flex flex-col justify-center">
                      <p className="text-center">TINGKAT PENERIMAAN KUALITAS</p>
                      <div className="grid grid-cols-2 justify-center w-full">
                        <p className="text-center">LULUS</p>
                        <p className="text-center">TOLAK</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-center">REJECT YANG DITEMUKAN</p>
                    </div>
                  </div>
                  {FinalInspection?.inspeksi_outsourcing_bj_sub.map(
                    (dataSub: any, indexSub: number) => {
                      const qtyAwal = formatInteger(dataSub?.quantity_awal);
                      const qtyAkhir = formatInteger(dataSub?.quantity_akhir);
                      return (
                        <div className="bg-white mt-2  text-sm font-semibold ">
                          <div className="w-full grid grid-cols-4 py-2 ">
                            <div className="mb-2">
                              <p className="text-center">{`${qtyAwal} Pcs S/D ${qtyAkhir} Pcs`}</p>
                            </div>
                            <div className="mb-2">
                              <p className="text-center">{dataSub.jumlah}</p>
                            </div>
                            <div className="flex flex-col justify-center mb-2">
                              <div className="grid grid-cols-2 justify-center w-full mb-2">
                                <p className="text-center">
                                  {dataSub.kualitas_lulus}
                                </p>
                                <p className="text-center">
                                  {dataSub.kualitas_tolak}
                                </p>
                              </div>
                            </div>
                            <div className="flex justify-center w-full mb-2">
                              {FinalInspection?.status == 'incoming' ? (
                                <input
                                  type="text"
                                  name="reject"
                                  onChange={(e) => {
                                    handleChangeSubPoint(e, indexSub);
                                  }}
                                  className=" border rounded border-strokedark"
                                />
                              ) : (
                                <input
                                  type="text"
                                  name="reject"
                                  disabled
                                  defaultValue={dataSub.reject}
                                  onChange={(e) => {
                                    handleChangeSubPoint(e, indexSub);
                                  }}
                                  className=" border rounded border-strokedark"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    },
                  )}
                  <div className="bg-white mt-2 w-full grid grid-cols-11 p-2 text-sm font-semibold ">
                    <div>
                      <p className="text-center">NO</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-center">POINT CHECK</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-center">STANDAR</p>
                    </div>
                    <div className="flex flex-col justify-center col-span-2">
                      <p className="text-center">CARA PERIKSA</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-center">HASIL</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-center">QTY REJECT</p>
                    </div>
                  </div>
                  {FinalInspection?.inspeksi_outsourcing_bj_point.map(
                    (dataPoint: any, indexPoint: number) => {
                      return (
                        <div className="bg-white mt-2 w-full grid grid-cols-11 p-2 text-sm font-semibold ">
                          <div>
                            <p className="text-center">{indexPoint + 1}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-center">{dataPoint.point}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-center">{dataPoint.standar}</p>
                          </div>
                          <div className="flex flex-col justify-center col-span-2">
                            <p className="text-center">
                              {dataPoint.cara_periksa}
                            </p>
                          </div>
                          <div className="col-span-2 flex flex-col items-center">
                            <div>
                              {FinalInspection?.status == 'incoming' ? (
                                <>
                                  <div>
                                    <input
                                      required
                                      type="radio"
                                      id="sesuai"
                                      value="sesuai"
                                      name={`hasil` + indexPoint}
                                      onChange={(e) => {
                                        handleChangePointHasil(e, indexPoint);
                                      }}
                                    />
                                    <label className="pl-2">SESUAI</label>
                                  </div>
                                  <div>
                                    <input
                                      required
                                      type="radio"
                                      id="tidak sesuai"
                                      value="tidak sesuai"
                                      name={`hasil` + indexPoint}
                                      onChange={(e) => {
                                        handleChangePointHasil(e, indexPoint);
                                      }}
                                    />
                                    <label className="pl-2">TIDAK SESUAI</label>
                                  </div>
                                </>
                              ) : (
                                <input
                                  type="text"
                                  disabled
                                  defaultValue={dataPoint.hasil}
                                  name={`hasil`}
                                  onChange={(e) => {
                                    handleChangePoint(e, indexPoint);
                                  }}
                                />
                              )}
                            </div>
                          </div>
                          <div className="col-span-2 flex items-center">
                            {FinalInspection?.status == 'incoming' ? (
                              <input
                                required
                                type="text"
                                name="qty"
                                onChange={(e) => {
                                  handleChangePoint(e, indexPoint);
                                }}
                                className=" border rounded border-strokedark"
                              />
                            ) : (
                              <input
                                type="text"
                                name="qty"
                                disabled
                                defaultValue={dataPoint.qty}
                                onChange={(e) => {
                                  handleChangePoint(e, indexPoint);
                                }}
                                className=" border rounded border-strokedark"
                              />
                            )}
                          </div>
                        </div>
                      );
                    },
                  )}
                </>
              )}

            {FinalInspection?.bagian_tiket == 'history' && (
              <>
                <div className="grid w-full grid-cols-2 gap-2">
                  <div className="bg-white ">
                    <p className="text-sm text-blue-700 font-semibold px-5 pt-5">
                      Standar Pemeriksaan
                    </p>
                    <div className="">
                      <div className="px-5">
                        <p className="font-semibold text-sm mt-5 ">
                          √N + 1 = Jumlah Packing yang akan dicek
                        </p>
                        <p className="font-semibold text-sm mt-5 ">
                          (N Jumlah packing)
                        </p>
                        <p className="font-semibold text-sm mt-5 ">
                          JUMLAH PACKING yang diambil :
                          <input
                            type="text"
                            disabled
                            defaultValue={FinalInspection?.jumlah_packing}
                            onChange={(e) => {
                              setJumlahPacking(e.target.value);
                            }}
                            className=" border rounded border-strokedark mb-4"
                          />
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white ">
                    <p className="text-sm text-blue-700 font-semibold px-5 pt-5">
                      Standar Pemeriksaan
                    </p>
                    <div>
                      <div className="px-5 flex gap-5 items-center justify-between mt-5">
                        <p className="font-semibold text-sm  ">
                          No Packing yang diperiksa :
                        </p>
                        <input
                          type="text"
                          disabled
                          defaultValue={FinalInspection?.no_packing}
                          onChange={(e) => {
                            setnoPacking(e.target.value);
                          }}
                          className=" border rounded border-strokedark"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white mt-2 w-full grid grid-cols-4 text-blue-600 text-sm font-semibold ">
                  <div>
                    <p className="text-center">QTY PCS</p>
                  </div>
                  <div>
                    <p className="text-center">JUMLAH YANG DIPERIKSA</p>
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="text-center">TINGKAT PENERIMAAN KUALITAS</p>
                    <div className="grid grid-cols-2 justify-center w-full">
                      <p className="text-center">LULUS</p>
                      <p className="text-center">TOLAK</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-center">REJECT YANG DITEMUKAN</p>
                  </div>
                </div>
                {FinalInspection?.inspeksi_outsourcing_bj_sub.map(
                  (dataSub: any, indexSub: number) => {
                    const qtyAwal = formatInteger(dataSub?.quantity_awal);
                    const qtyAkhir = formatInteger(dataSub?.quantity_akhir);
                    return (
                      <div className="bg-white mt-2  text-sm font-semibold ">
                        <div className="w-full grid grid-cols-4 py-2 ">
                          <div className="mb-2">
                            <p className="text-center">{`${qtyAwal} Pcs S/D ${qtyAkhir} Pcs`}</p>
                          </div>
                          <div className="mb-2">
                            <p className="text-center">{dataSub.jumlah}</p>
                          </div>
                          <div className="flex flex-col justify-center mb-2">
                            <div className="grid grid-cols-2 justify-center w-full mb-2">
                              <p className="text-center">
                                {dataSub.kualitas_lulus}
                              </p>
                              <p className="text-center">
                                {dataSub.kualitas_tolak}
                              </p>
                            </div>
                          </div>
                          <div className="flex justify-center w-full mb-2">
                            <input
                              type="text"
                              name="reject"
                              disabled
                              defaultValue={dataSub.reject}
                              onChange={(e) => {
                                handleChangeSubPoint(e, indexSub);
                              }}
                              className=" border rounded border-strokedark"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  },
                )}
                <div className="bg-white mt-2 w-full grid grid-cols-11 p-2 text-sm font-semibold ">
                  <div>
                    <p className="text-center">NO</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-center">POINT CHECK</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-center">STANDAR</p>
                  </div>
                  <div className="flex flex-col justify-center col-span-2">
                    <p className="text-center">CARA PERIKSA</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-center">HASIL</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-center">QTY REJECT</p>
                  </div>
                </div>
                {FinalInspection?.inspeksi_outsourcing_bj_point.map(
                  (dataPoint: any, indexPoint: number) => {
                    return (
                      <div className="bg-white mt-2 w-full grid grid-cols-11 p-2 text-sm font-semibold ">
                        <div>
                          <p className="text-center">{indexPoint + 1}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-center">{dataPoint.point}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-center">{dataPoint.standar}</p>
                        </div>
                        <div className="flex flex-col justify-center col-span-2">
                          <p className="text-center">
                            {dataPoint.cara_periksa}
                          </p>
                        </div>
                        <div className="col-span-2 flex flex-col items-center">
                          <div>
                            <input
                              type="text"
                              disabled
                              defaultValue={dataPoint.hasil}
                              name={`hasil`}
                              onChange={(e) => {
                                handleChangePoint(e, indexPoint);
                              }}
                            />
                          </div>
                        </div>
                        <div className="col-span-2 flex items-center">
                          <input
                            type="text"
                            name="qty"
                            disabled
                            defaultValue={dataPoint.qty}
                            onChange={(e) => {
                              handleChangePoint(e, indexPoint);
                            }}
                            className=" border rounded border-strokedark"
                          />
                        </div>
                      </div>
                    );
                  },
                )}
              </>
            )}

            <div className="bg-white mt-2 w-full grid grid-cols-12 gap-5 p-2 text-sm font-semibold ">
              <div className="col-span-6">
                <p className="">Catatan *:</p>
                {FinalInspection?.status == 'incoming' ? (
                  <textarea
                    required
                    name=""
                    id=""
                    onChange={(e) => {
                      setCatatan(e.target.value);
                    }}
                    rows={4}
                    className="w-full border rounded px-2"
                  ></textarea>
                ) : (
                  <textarea
                    name=""
                    id=""
                    disabled
                    defaultValue={FinalInspection?.catatan}
                    onChange={(e) => {
                      setCatatan(e.target.value);
                    }}
                    rows={4}
                    className="w-full border rounded px-2"
                  ></textarea>
                )}
              </div>
              {FinalInspection?.status == 'incoming' ? (
                <div className="col-span-3 flex flex-col justify-end">
                  <div>
                    <input
                      required
                      type="radio"
                      id="bisa kirim"
                      value="bisa kirim"
                      name="status"
                      onChange={(e) => {
                        setStatus(e.target.value);
                      }}
                    />
                    <label className="pl-2">BISA KIRIM</label>
                  </div>
                  <div>
                    <input
                      required
                      type="radio"
                      id="tidak bisa di kirim"
                      value="tidak bisa di kirim"
                      name="status"
                      onChange={(e) => {
                        setStatus(e.target.value);
                      }}
                    />
                    <label className="pl-2">TIDAK BISA KIRIM</label>
                  </div>
                </div>
              ) : (
                <div className="col-span-3 flex flex-col justify-end">
                  <div>
                    <input
                      type="text"
                      disabled
                      defaultValue={FinalInspection?.status}
                      name="status"
                      onChange={(e) => {
                        setStatus(e.target.value);
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="col-span-3 flex flex-col justify-end">
                {FinalInspection?.status == 'incoming' ? (
                  <button
                    type="submit"
                    value="submit"
                    className="px-2 py-2 bg-green-700 w-full  text-white"
                  >
                    SUBMIT CHECKSHEET
                  </button>
                ) : null}
              </div>
            </div>
          </>
        </form>
      </main>
    </>
  );
}

export default ChecksheetFinalInspection;
