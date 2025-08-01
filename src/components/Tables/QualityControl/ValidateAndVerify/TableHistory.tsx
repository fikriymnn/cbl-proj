import { BRAND } from '../../../../types/brand';
// import BrandOne from '../../images/brand/brand-01.svg';
// import BrandTwo from '../../images/brand/brand-02.svg';
// import BrandThree from '../../images/brand/brand-03.svg';
// import BrandFour from '../../images/brand/brand-04.svg';
// import BrandFive from '../../images/brand/brand-05.svg';
import { useEffect, useState } from 'react';
import Modal from '../../../Modals/ModalDetailPopup';
// import Gambar from '../../images/BACKGROUND.png';
import Logo from '../../images/logo/logo-cbl 1.svg';
import axios from 'axios';
import convertTimeStampToDate from '../../../../utils/converDateTime';
import Stack from '@mui/material/Stack';
import Pagination from '@mui/material/Pagination/Pagination';
import calculateTime from '../../../../utils/calculateTime';
import ModalDetailValidasi from '../../../Modals/ModalDetailValidasi';
import Loading from '../../../Loading';
import convertTimeStampToDateOnly from '../../../../utils/convertDate';
import convertDateToTime from '../../../../utils/converDateToTime';
import * as XLSX from 'xlsx'; // Add this import at the top
import ModalKosongan from '../../../Modals/Qc/NCR/NCRResponQC';
import ModalXL from '../../PPIC/JadwalProduksi/ModalXL';
import convertTimeStampToAllSecond from '../../../../utils/ConverttimestametoAllSecond';
import ModalFull from '../../PPIC/JadwalProduksi/ModalFull';

const TableHistory = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [ticketProsesHistory, setTicketProsesHistory] = useState<any>(null);
  const [showModalDetail, setShowModalDetail] = useState(null);
  const [masterMesin, setmasterMesin] = useState<any>();
  const [startDate, setStartDate] = useState<any>();
  const [endDate, setEndDate] = useState<any>();
  const [mesinNama, setMesinNama] = useState<any>();
  const [statusTiket, setStatusTiket] = useState<any>();
  const [noJo, setNoJo] = useState<any>();

  const handleClickDetail = (index: any) => {
    setShowModalDetail((prevState: any) => {
      return prevState === index ? null : index;
    });
  };

  const closeModalDetail = () => setShowModalDetail(null);

  useEffect(() => {
    getMTC();
    getMasterMesin();
  }, [page]);

  async function getMasterMesin() {
    const url = `${import.meta.env.VITE_API_LINK}/master/mesin`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        withCredentials: true,
      });
      setIsLoading(false);
      setmasterMesin(res.data);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error.data?.msg);
    }
  }

  async function getMTC() {
    const url = `${import.meta.env.VITE_API_LINK}/prosessMtcHistoryQc`;
    try {
      const res = await axios.get(url, {
        params: {
          page: page,
          limit: 10,
          start_date: startDate,
          end_date: endDate,
          mesin: mesinNama,
          status_qc: statusTiket,
          search: noJo,
        },
        withCredentials: true,
      });

      setTicketProsesHistory(res.data);
      console.log(res.data);
    } catch (error: any) {
      console.log(error.response);
    }
  }

  function calculateResponTime2(startDate: any, endDate: any) {
    if (!startDate || !endDate) {
      return -1; // Return -1 if any of the values are null or empty
    }

    const createdAtDate = new Date(startDate);
    const waktuResponDate = new Date(endDate);

    if (isNaN(createdAtDate.getTime()) || isNaN(waktuResponDate.getTime())) {
      return -1; // Return -1 if the date conversion fails
    }

    const millisecondsDiff =
      waktuResponDate.getTime() - createdAtDate.getTime();
    const secondsDiff = Math.floor(millisecondsDiff / 1000); // Total seconds difference

    return secondsDiff;
  }

  function formatMinutesToHoursMinutesSeconds(totalSeconds: number) {
    if (totalSeconds === -1) {
      return '-'; // Return '-' if the input is -1
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours ? hours + ' hours ' : ''}${
      minutes ? minutes + ' minutes ' : ''
    }${seconds ? seconds + ' seconds' : ''}`.trim();
  }
  // Add this state to your component
  const [showExportPreview, setShowExportPreview] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [visibleRows, setVisibleRows] = useState(20);
  // Function to open and close the export preview modal
  const openModalExport = () => {
    setVisibleRows(20); // Reset to 20 visible rows when opening the modal
    setShowExportPreview(true);
  };
  const closeModalExport = () => setShowExportPreview(false);

  // Modified function to prepare export data and show preview
  const prepareExportData = async () => {
    try {
      setIsLoadingPreview(true);
      setVisibleRows(20); //

      // Fetch all data without pagination, but keeping other filters
      const url = `${import.meta.env.VITE_API_LINK}/prosessMtcHistoryQc`;
      const response = await axios.get(url, {
        params: {
          // Don't include page and limit to get all data at once
          start_date: startDate,
          end_date: endDate,
          mesin: mesinNama,
          status_qc: statusTiket,
          search: noJo,
        },
        withCredentials: true,
      });

      const allData = response.data;

      if (!allData || allData.length === 0) {
        alert('No data to export');
        setIsLoadingPreview(false);
        return;
      }

      // Format data for Excel
      let excelData = allData.map((data: any, index: any) => {
        // Process data formatting (same as before)
        const processData = data;
        const tiketData = processData.tiket || {};

        // Format dates and calculate times (same as before)
        const tglTicket = tiketData.createdAt
          ? convertTimeStampToDateOnly(tiketData.createdAt)
          : '-';
        const jamTicket = tiketData.createdAt
          ? convertDateToTime(tiketData.createdAt)
          : '-';
        const tglSelesaiTicket =
          processData.waktu_selesai_mtc == null
            ? '-'
            : convertTimeStampToDate(processData.waktu_selesai_mtc);

        const waktuBreakdownMinutes = calculateResponTime2(
          tiketData.createdAt,
          processData.waktu_selesai,
        );

        const waktuBreakdownMTCMinutes = calculateResponTime2(
          tiketData.waktu_respon_qc,
          processData.waktu_selesai_mtc,
        );

        const waktuBreakdown = formatMinutesToHoursMinutesSeconds(
          waktuBreakdownMinutes,
        );
        const waktuBreakdownMTC = formatMinutesToHoursMinutesSeconds(
          waktuBreakdownMTCMinutes,
        );

        // Return data focusing on the process + nested ticket structure
        return {
          No: index + 1,
          // Process MTC information
          'Bagian Mesin': processData.bagian_mesin || '-',
          Unit: processData.unit || '-',
          'Cara Perbaikan': processData.cara_perbaikan || '-',
          'Kode Analisis MTC': processData.kode_analisis_mtc || '-',
          'Nama Analisis MTC': processData.nama_analisis_mtc || '-',
          'Note MTC': processData.note_mtc || '-',
          'Note QC': processData.note_qc || '-',
          'Note Analisis': processData.note_analisis || '-',
          'Skor MTC': processData.skor_mtc || '-',
          'Status Proses': processData.status_proses || '-',
          'Status QC': processData.status_qc || '-',

          // User information
          'Eksekutor Nama': processData.user_eksekutor?.nama || '-',
          'Eksekutor Role': processData.user_eksekutor?.role || '-',
          'QC Nama': processData.user_qc?.nama || '-',
          'QC Role': processData.user_qc?.role || '-',

          // Ticket information (nested)
          'Ticket ID': tiketData.id || '-',
          'Kode Tiket': tiketData.kode_ticket || '-',
          'Tanggal Tiket': tglTicket,
          'Jam Tiket': jamTicket,
          'No Jo': tiketData.no_jo || '-',
          'No SO': tiketData.no_so || '-',
          'No IO': tiketData.no_io || '-',
          Item: tiketData.nama_produk || '-',
          Mesin: tiketData.mesin || '-',
          Proses: tiketData.proses || '-',
          Kendala: `${tiketData.kode_lkh || '-'} - ${
            tiketData.nama_kendala || '-'
          }`,
          'Jenis Kendala': tiketData.jenis_kendala || '-',
          'Bagian Tiket': tiketData.bagian_tiket || '-',
          Bagian: tiketData.bagian || '-',
          Spek: tiketData.spek || '-',
          Customer: tiketData.nama_customer || '-',
          Operator: tiketData.operator || '-',
          QTY: tiketData.qty || '-',
          'QTY Druk': tiketData.qty_druk || '-',
          'Status Tiket': tiketData.status_tiket || '-',
          'Kode Analisis (Tiket)': tiketData.kode_analisis_mtc || '-',
          'Nama Analisis (Tiket)': tiketData.nama_analisis_mtc || '-',
          'Jenis Analisis MTC': tiketData.jenis_analisis_mtc || '-',

          // Ticket timing
          'Waktu Respon QC': tiketData.waktu_respon_qc
            ? convertTimeStampToAllSecond(tiketData.waktu_respon_qc)
            : '-',
          'Waktu Respon MTC (Tiket)': tiketData.waktu_respon
            ? convertTimeStampToAllSecond(tiketData.waktu_respon)
            : '-',
          // Timing information

          'Waktu Mulai MTC (Tiket)': tiketData.waktu_mulai_mtc
            ? convertTimeStampToAllSecond(tiketData.waktu_mulai_mtc)
            : '-',
          'Waktu Selesai MTC': processData.waktu_selesai_mtc
            ? convertTimeStampToAllSecond(processData.waktu_selesai_mtc)
            : '-',
          'Waktu Breakdown MTC': waktuBreakdownMTC,

          'Waktu Breakdown Total': waktuBreakdown,
          _createdAtTimestamp: tiketData.createdAt
            ? new Date(tiketData.createdAt).getTime()
            : 0,
        };
      });
      // Sort the data so newest is at the top (based on ticket creation date)
      excelData = excelData.sort(
        (a: any, b: any) => b._createdAtTimestamp - a._createdAtTimestamp,
      );

      // Remove the temporary sort field before displaying/exporting
      excelData = excelData.map((item: any, index: any) => {
        const { _createdAtTimestamp, ...rest } = item;
        // Update the 'No' field to reflect the new order
        return { No: index + 1, ...rest };
      });
      // Store formatted data for preview and show the modal
      setPreviewData(excelData);
      openModalExport();
    } catch (error) {
      console.error('Preview failed:', error);
      alert('Preview failed. Please try again.');
    } finally {
      // Hide loading indicator
      setIsLoadingPreview(false);
    }
  };

  // Actual export function that uses the preview data
  const exportToExcel = () => {
    try {
      // Show loading indicator
      setIsLoadingPreview(true);

      if (!previewData || previewData.length === 0) {
        alert('No data to export');
        setIsLoadingPreview(false);
        return;
      }

      // Create a new workbook
      const workbook = XLSX.utils.book_new();

      // Create worksheet and add data
      const worksheet = XLSX.utils.json_to_sheet(previewData);

      // Set column widths for better readability
      const wscols =
        previewData.length > 0
          ? Object.keys(previewData[0]).map(() => ({ wch: 20 })) // Default width for all columns
          : [];
      worksheet['!cols'] = wscols;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Process MTC Details');

      // Generate Excel file
      const today = new Date();
      const date = `${today.getFullYear()}-${(today.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;

      let filename = `History_Verifikasi_${date}`;

      // Add filter info to filename if any filter is applied
      if (startDate && endDate) {
        filename += `_${startDate.split('T')[0]}_to_${endDate.split('T')[0]}`;
      }
      if (mesinNama) {
        filename += `_${mesinNama}`;
      }
      if (statusTiket) {
        filename += `_${statusTiket}`;
      }
      if (noJo) {
        filename += `_JO-${noJo}`;
      }

      filename += `.xlsx`;

      // Write and download the file
      XLSX.writeFile(workbook, filename);

      // Close the modal after export
      closeModalExport();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      // Hide loading indicator
      setIsLoadingPreview(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1 items-center bg-white">
        {isLoading && <Loading />}

        <div className="grid md:grid-cols-12 grid-cols-6 px-4 py-1 gap-3 items-center">
          <div className="flex flex-col  gap-2 col-span-2">
            <p className="text-sm text-primary font-semibold">Dari:</p>
            <input
              className="rounded-full bg-[#D8EAFF] px-2 h-8"
              type="date"
              onChange={(e) => setStartDate(e.target.value)}
            ></input>
          </div>
          <div className="flex flex-col gap-2 col-span-2">
            <p className="my-auto text-sm text-primary font-semibold">
              Sampai:
            </p>

            <input
              className="rounded-full bg-[#D8EAFF] px-2 h-8"
              type="date"
              onChange={(e) => setEndDate(e.target.value)}
            ></input>
          </div>
          <div className="flex flex-col gap-2 col-span-2">
            <p className="my-auto text-sm text-primary font-semibold">
              Pilih Mesin:
            </p>

            <select
              onChange={(e) => {
                setMesinNama(e.target.value);
              }}
              className={`z-20 w-full rounded-md bg-blue-200 items-center h-8`}
            >
              <option selected disabled>
                Pilih Mesin
              </option>
              {masterMesin?.map((data: any, i: number) => {
                return (
                  <option
                    key={i}
                    value={data.nama_mesin}
                    className="text-gray-800 text-sm font-light dark:text-bodydark"
                  >
                    {data.nama_mesin}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="flex flex-col gap-2 col-span-2">
            <p className="my-auto text-sm text-primary font-semibold">
              Pilih Status Tiket:
            </p>
            <select
              onChange={(e) => {
                setStatusTiket(e.target.value);
              }}
              className={`z-20 w-full rounded-md bg-blue-200 items-center h-8`}
            >
              <option selected disabled>
                Pilih Status Tiket
              </option>

              <option
                value={'approved'}
                className="text-gray-800 text-sm font-light dark:text-bodydark"
              >
                approved
              </option>
              <option
                value={'rejected'}
                className="text-gray-800 text-sm font-light dark:text-bodydark"
              >
                rejected
              </option>
            </select>
          </div>
          <div className="gap-2 flex flex-col col-span-2">
            <p className="my-auto text-sm text-primary font-semibold">Cari</p>
            <input
              className="rounded-md h-8 bg-[#D8EAFF] px-2 w-full"
              placeholder="Jo, Io, Item, Customer, Kendala"
              type="text"
              onChange={(e) => setNoJo(e.target.value)}
            ></input>
          </div>
          <div className="flex flex-col gap-2 col-span-2">
            <button
              onClick={() => {
                getMTC();
              }}
              className="bg-primary text-white px-5 py-2 rounded-md my-auto"
            >
              Tampilkan
            </button>

            <button
              onClick={() => prepareExportData()}
              className="px-5 py-2 rounded-md my-auto text-white bg-green-500 justify-center items-center hover:cursor-pointer"
              disabled={isLoadingPreview}
            >
              {isLoadingPreview ? 'Loading...' : 'EXPORT PREVIEW'}
            </button>
            {/* Export preview modal */}
            {showExportPreview && (
              <ModalFull
                isOpen={showExportPreview}
                onClose={() => closeModalExport()}
                judul={'Export Preview'}
              >
                <>
                  <div className="flex flex-col h-[85vh]">
                    {' '}
                    {/* Full height container */}
                    <div className="flex justify-between mb-4 px-2 pt-5">
                      <div className="text-sm text-gray-500">
                        Total Data: {previewData.length}
                      </div>
                      <button
                        onClick={exportToExcel}
                        className="bg-blue-500 text-white py-1 px-4 rounded hover:bg-blue-600"
                        disabled={isLoadingPreview}
                      >
                        {isLoadingPreview ? 'Exporting...' : 'Export to Excel'}
                      </button>
                    </div>
                    <div className="overflow-auto flex-1 relative">
                      {' '}
                      {/* Flex grow to take available space */}
                      <table className="min-w-full bg-white border">
                        <thead className="bg-blue-50 sticky top-0 z-10 shadow-sm">
                          <tr>
                            {previewData.length > 0 &&
                              Object.keys(previewData[0]).map((key, index) => (
                                <th
                                  key={index}
                                  className="py-3 px-4 border-b text-left text-xs font-semibold text-blue-700 uppercase tracking-wider"
                                >
                                  {key}
                                </th>
                              ))}
                          </tr>
                        </thead>
                        <tbody>
                          {previewData
                            .slice(0, visibleRows)
                            .map((row, rowIndex) => (
                              <tr
                                key={rowIndex}
                                className={
                                  rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                                }
                              >
                                {Object.values(row).map((value, colIndex) => (
                                  <td
                                    key={colIndex}
                                    className="py-2 px-4 border-b text-sm"
                                  >
                                    {value?.toString() || '-'}
                                  </td>
                                ))}
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                    {/* Fixed footer with status and buttons */}
                    <div className="flex items-center justify-between border-t bg-gray-50 py-3 px-4 mt-auto">
                      <div className="text-sm text-gray-600">
                        Showing {Math.min(visibleRows, previewData.length)} of{' '}
                        {previewData.length} rows
                      </div>

                      {visibleRows < previewData.length && (
                        <div className="space-x-3">
                          <button
                            className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded font-medium text-sm"
                            onClick={() =>
                              setVisibleRows(
                                Math.min(visibleRows + 20, previewData.length),
                              )
                            }
                          >
                            Show 20 More
                          </button>
                          <button
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium text-sm"
                            onClick={() => setVisibleRows(previewData.length)}
                          >
                            Show All ({previewData.length} rows)
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              </ModalFull>
            )}
          </div>
        </div>
      </div>
      <div className="flex px-2 border border-stroke bg-white py-3 shadow-default dark:border-strokedark dark:bg-boxdark pb-3">
        <p className="w-5 text-[14px] font-semibold mr-3">No</p>
        <div className="flex flex-col w-full">
          <div className="grid grid-cols-12 gap-2 w-full dark:border-strokedark  ">
            <div className="flex w-full justify-start ">
              <p className="text-slate-600  text-[14px] font-semibold  dark:text-white">
                Kode Tiket
              </p>
            </div>
            <div className=" text-[14px] justify-start ">
              <p className="text-slate-600 font-semibold  dark:text-white">
                Tanggal Tiket
              </p>
            </div>
            <div className=" text-[14px] justify-start ">
              <p className="text-slate-600 font-semibold  dark:text-white">
                No Jo
              </p>
            </div>
            <div className=" text-[14px] justify-start col-span-2">
              <p className="text-slate-600 font-semibold  dark:text-white">
                Item
              </p>
            </div>
            <div className=" text-[14px] justify-start ">
              <p className="text-slate-600 font-semibold "> Mesin</p>
            </div>
            <div className=" text-[14px] justify-start  ">
              <p className="text-slate-600 font-semibold ">Kendala</p>
            </div>
            <div className=" text-[14px] justify-start ">
              <p className="text-slate-600 font-semibold  dark:text-white">
                Jam Tiket
              </p>
            </div>
            <div className=" text-[14px] justify-start ">
              <p className="text-slate-600 font-semibold ">status</p>
            </div>
            <div className=" text-[14px] justify-start mx-auto">
              <p className="text-slate-600 font-semibold ">Skor</p>
            </div>
            <div className=" text-[14px] justify-start ">
              <p className="text-slate-600 font-semibold ">Waktu Respon</p>
            </div>
            {/* <div className=" text-[14px] justify-center ">
              <p className="text-slate-600 font-semibold ">Skor</p>
            </div> */}
          </div>
        </div>
      </div>
      {ticketProsesHistory?.data.map((data: any, index: number) => {
        const tglTicket = convertTimeStampToDateOnly(data.createdAt);
        const jamTicket = convertDateToTime(data.createdAt);
        const tglSelesaiTicket =
          data.waktu_selesai_mtc == null
            ? '-'
            : convertTimeStampToDate(data.waktu_selesai_mtc);
        const waktuRespon = calculateResponTime2(
          data.tiket?.waktu_selesai_mtc,
          data.tiket?.waktu_selesai,
        );
        const waktuBreakdownMinutes = calculateResponTime2(
          data.tiket?.createdAt,
          data.tiket?.waktu_selesai,
        );
        const waktuBreakdownMTCMinutes = calculateResponTime2(
          data.tiket?.waktu_respon_qc,
          data.tiket?.waktu_selesai_mtc,
        );
        const waktuValidasiQCMinutes = calculateResponTime2(
          data.tiket?.createdAt,
          data.tiket?.waktu_respon_qc,
        );
        const waktuRespon2 = formatMinutesToHoursMinutesSeconds(waktuRespon);
        const waktuBreakdown = formatMinutesToHoursMinutesSeconds(
          waktuBreakdownMinutes,
        );
        const waktuBreakdownMTC = formatMinutesToHoursMinutesSeconds(
          waktuBreakdownMTCMinutes,
        );

        const qcRespon = calculateResponTime2(
          data.tiket?.createdAt,
          data.tiket?.waktu_respon_qc,
        );
        const qcVerif = calculateResponTime2(
          data.tiket?.waktu_selesai_mtc,
          data.tiket?.waktu_selesai,
        );
        const waktuVerifikasiQCMinutes = calculateResponTime2(
          data.tiket?.waktu_selesai_mtc,
          data.tiket?.waktu_selesai,
        );
        const waktuVerifikasiQC = formatMinutesToHoursMinutesSeconds(
          waktuVerifikasiQCMinutes,
        );
        return (
          <div
            key={index}
            className=" flex w-full rounded-xl border px-2  border-stroke bg-white py-3 shadow-default dark:border-strokedark dark:bg-boxdark "
          >
            <div className="flex items-center">
              <p className="text-neutral-500 text-sm font-light  dark:text-white w-5 mr-3">
                {index + 1}{' '}
              </p>
            </div>
            <div className="grid grid-cols-12 gap-2 w-full items-center dark:border-strokedark">
              <div className="flex w-full justify-start ">
                <p className="text-neutral-500 text-sm font-light  dark:text-white break-all">
                  {' '}
                  {data.tiket.kode_ticket}
                </p>
              </div>
              <div className="flex w-full  justify-start ">
                <p className="text-neutral-500 text-sm font-light  dark:text-white">
                  {tglTicket}
                </p>
              </div>
              <div className="flex w-full  justify-start ">
                <p className="text-neutral-500 text-sm font-light  dark:text-white">
                  {data.tiket.no_jo}
                </p>
              </div>
              <div className="flex w-full  justify-start col-span-2">
                <p className="text-neutral-500 text-sm font-light  dark:text-white">
                  {data.tiket.nama_produk}
                </p>
              </div>
              <div className="flex w-full  justify-start  ">
                <p className="text-neutral-500 text-sm font-light ">
                  {data.tiket.mesin}
                </p>
              </div>
              <div className="flex w-full  justify-start ">
                <p className="text-neutral-500 text-sm font-light ">
                  {data.tiket.kode_lkh + ' - ' + data.tiket.nama_kendala}
                </p>
              </div>
              <div className="flex w-full  justify-start ">
                <p className="text-neutral-500 text-sm font-light  dark:text-white">
                  {jamTicket}
                </p>
              </div>
              <div className="flex w-full  justify-start  ">
                <p
                  className={
                    data.status_qc == 'approved'
                      ? 'text-white text-sm font-light   bg-green-600 rounded-lg px-2'
                      : 'text-white text-sm font-light  dark:text-white bg-red-600 rounded-lg px-2'
                  }
                >
                  {data.status_qc}
                </p>
              </div>
              <div className="flex w-full  justify-start ">
                <p className="text-neutral-500 text-sm font-light mx-auto">
                  {data.skor_mtc}
                </p>
              </div>
              <div className="flex w-full  justify-start ">
                <p className="text-neutral-500 text-sm font-light ">
                  {waktuRespon2}
                </p>
              </div>
              {/* <div className="flex w-full  justify-start col-span-3">
                <p className="text-neutral-500 text-sm font-light ">
                  {data.skor_mtc}
                </p>
              </div> */}
              <div className="flex w-full justify-end">
                <button
                  onClick={() => handleClickDetail(index)}
                  className="text-xs font-bold bg-blue-700 py-2 px-3 text-white rounded-sm"
                >
                  Detail
                </button>
              </div>
            </div>
            {showModalDetail === index && (
              <>
                <ModalDetailValidasi
                  bagian={data.bagian_mesin}
                  unit={data.unit}
                  status={data.tiket.status_qc}
                  note={data.note_qc}
                  nama_kendala={data.tiket.nama_kendala}
                  nama_mesin={data.tiket.mesin}
                  operator={data.tiket.operator}
                  isOpen={showModalDetail}
                  onClose={closeModalDetail}
                  key={index}
                  validator={data.user_qc?.nama}
                  nojo={data.tiket.no_jo}
                  customer={data.tiket.nama_customer}
                  masalah={data.tiket.nama_analisis_mtc}
                  waktuMasuk={tglTicket}
                  waktuSelesai={tglSelesaiTicket}
                  WaktuBreakdown={waktuBreakdown}
                  waktuBreakdownMTC={waktuBreakdownMTC}
                  waktuVerifikasiQC={waktuVerifikasiQC}
                  data={data}
                >
                  <></>
                </ModalDetailValidasi>
              </>
            )}
          </div>
        );
      })}
      <div className="w-full flex  mt-5 ">
        <Stack spacing={2}>
          <Pagination
            count={ticketProsesHistory?.total_page}
            color="primary"
            onChange={(e, i) => {
              setPage(i);
              console.log(i);
            }}
          />
        </Stack>
      </div>
    </div>
  );
};

export default TableHistory;
