import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import convertTimeStampToDate from '../../../../utils/converDateTime';
import convertTimeStampToDateOnly from '../../../../utils/convertDate';
import Stack from '@mui/material/Stack';
import Pagination from '@mui/material/Pagination/Pagination';
import ModalDetailValidasi from '../../../Modals/ModalDetailValidasi';
import Loading from '../../../Loading';
import convertDateToTime from '../../../../utils/converDateToTime';
import * as XLSX from 'xlsx';
import ModalFull from '../../PPIC/JadwalProduksi/ModalFull';

const TableHistoryValidate = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [ticket, setTicket] = useState<any>(null);
  const [showModalDetail, setShowModalDetail] = useState(null);

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
  const [masterMesin, setmasterMesin] = useState<any>();
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
      console.log(error.data.msg);
    }
  }
  const [startDate, setStartDate] = useState<any>();
  const [endDate, setEndDate] = useState<any>();
  const [mesinNama, setMesinNama] = useState<any>();
  const [statusTiket, setStatusTiket] = useState<any>();
  const [noJo, setNoJo] = useState<any>();

  async function getMTC() {
    const url = `${import.meta.env.VITE_API_LINK}/ticket`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        params: {
          page: page,
          limit: 10,
          historiQc: true,
          search: noJo,
          start_date: startDate,
          end_date: endDate,
          mesin: mesinNama,
          status_qc: statusTiket,
        },
        withCredentials: true,
      });
      setIsLoading(false);
      setTicket(res.data);

      console.log(res.data);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error.response);
    }
  }
  function calculateResponTime2(startDate: any, endDate: any) {
    const createdAtDate = new Date(startDate);
    const waktuResponDate = new Date(endDate);
    const millisecondsDiff =
      waktuResponDate.getTime() - createdAtDate.getTime();

    const secondsDiff = Math.floor(millisecondsDiff / 1000); // Total seconds difference
    return secondsDiff;
  }
  function formatMinutesToHoursMinutesSeconds(totalSeconds: number) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours ? hours + ' hours ' : ''}${
      minutes ? minutes + ' minutes ' : ''
    }${seconds ? seconds + ' seconds' : ''}`.trim();
  }
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

  const prepareExportData = async () => {
    try {
      // Show loading indicator
      setIsLoadingPreview(true);
      setVisibleRows(20); // Reset visible rows when loading new data

      // Fetch all data without pagination, but keeping other filters
      const url = `${import.meta.env.VITE_API_LINK}/ticket`;
      const response = await axios.get(url, {
        params: {
          historiQc: true,
          search: noJo,
          start_date: startDate,
          end_date: endDate,
          mesin: mesinNama,
          status_qc: statusTiket,
        },
        withCredentials: true,
      });

      const allData = response.data.data;

      if (!allData || allData.length === 0) {
        alert('No data to export');
        setIsLoadingPreview(false);
        return;
      }

      // Extract all ticket data with their processes flattened
      let excelData: any = [];

      // Go through each ticket and its associated processes
      allData.forEach((ticket: any, ticketIndex: any) => {
        // If there are MTC processes, create a row for each process
        if (ticket.proses_mtcs && ticket.proses_mtcs.length > 0) {
          ticket.proses_mtcs.forEach((process: any, processIndex: any) => {
            // Format dates
            const tglTicket = ticket.createdAt
              ? convertTimeStampToDateOnly(ticket.createdAt)
              : '-';
            const jamTicket = ticket.createdAt
              ? convertDateToTime(ticket.createdAt)
              : '-';

            // Calculate times
            const waktuRespon = calculateResponTime2(
              process.waktu_selesai_mtc,
              process.waktu_selesai,
            );

            const waktuBreakdownMinutes = calculateResponTime2(
              ticket.createdAt,
              process.waktu_selesai,
            );

            const waktuBreakdownMTCMinutes = calculateResponTime2(
              ticket.waktu_respon_qc,
              process.waktu_selesai_mtc,
            );

            const waktuRespon2 =
              formatMinutesToHoursMinutesSeconds(waktuRespon);
            const waktuBreakdown = formatMinutesToHoursMinutesSeconds(
              waktuBreakdownMinutes,
            );
            const waktuBreakdownMTC = formatMinutesToHoursMinutesSeconds(
              waktuBreakdownMTCMinutes,
            );

            excelData.push({
              No: excelData.length + 1,
              // Ticket information
              'Ticket ID': ticket.id || '-',
              'Kode Tiket': ticket.kode_ticket || '-',
              'Tanggal Tiket': tglTicket,
              'Jam Tiket': jamTicket,
              'No Jo': ticket.no_jo || '-',
              'No SO': ticket.no_so || '-',
              'No IO': ticket.no_io || '-',
              Item: ticket.nama_produk || '-',
              Mesin: ticket.mesin || '-',
              Proses: ticket.proses || '-',
              Kendala: `${ticket.kode_lkh || '-'} - ${
                ticket.nama_kendala || '-'
              }`,
              'Jenis Kendala': ticket.jenis_kendala || '-',
              'Bagian Tiket': ticket.bagian_tiket || '-',
              Bagian: ticket.bagian || '-',
              Spek: ticket.spek || '-',
              Customer: ticket.nama_customer || '-',
              Operator: ticket.operator || '-',
              QTY: ticket.qty || '-',
              'QTY Druk': ticket.qty_druk || '-',
              'Status Tiket': ticket.status_tiket || '-',
              'Kode Analisis (Tiket)': ticket.kode_analisis_mtc || '-',
              'Nama Analisis (Tiket)': ticket.nama_analisis_mtc || '-',
              'Jenis Analisis MTC': ticket.jenis_analisis_mtc || '-',

              // Process MTC information
              'Process ID': process.id || '-',
              'Bagian Mesin': process.bagian_mesin || '-',
              Unit: process.unit || '-',
              'Cara Perbaikan': process.cara_perbaikan || '-',
              'Kode Analisis MTC': process.kode_analisis_mtc || '-',
              'Nama Analisis MTC': process.nama_analisis_mtc || '-',
              'Note MTC': process.note_mtc || '-',
              'Note QC': process.note_qc || '-',
              'Note Analisis': process.note_analisis || '-',
              'Skor MTC': process.skor_mtc || '-',
              'Status Proses': process.status_proses || '-',
              'Status QC': process.status_qc || '-',
              'Is Rework': process.is_rework ? 'Yes' : 'No',

              // User information
              'Eksekutor Nama': process.user_eksekutor?.nama || '-',
              'Eksekutor Role': process.user_eksekutor?.role || '-',
              'QC Nama': process.user_qc?.nama || '-',
              'QC Role': process.user_qc?.role || '-',

              // Timing information
              'Waktu Respon QC': ticket.waktu_respon_qc
                ? convertTimeStampToDate(ticket.waktu_respon_qc)
                : '-',
              'Waktu Mulai MTC': process.waktu_mulai_mtc
                ? convertTimeStampToDate(process.waktu_mulai_mtc)
                : '-',
              'Waktu Selesai MTC': process.waktu_selesai_mtc
                ? convertTimeStampToDate(process.waktu_selesai_mtc)
                : '-',
              'Waktu Selesai Total': process.waktu_selesai
                ? convertTimeStampToDate(process.waktu_selesai)
                : '-',
              'Waktu Breakdown MTC': waktuBreakdownMTC,
              'Waktu Respon Total': waktuRespon2,
              'Waktu Breakdown Total': waktuBreakdown,

              // Add a sortable date field (for internal use)
              _createdAtTimestamp: ticket.createdAt
                ? new Date(ticket.createdAt).getTime()
                : 0,
            });
          });
        } else {
          // If there are no processes, still create a row for the ticket
          const tglTicket = ticket.createdAt
            ? convertTimeStampToDateOnly(ticket.createdAt)
            : '-';
          const jamTicket = ticket.createdAt
            ? convertDateToTime(ticket.createdAt)
            : '-';

          excelData.push({
            No: excelData.length + 1,
            // Ticket information
            'Ticket ID': ticket.id || '-',
            'Kode Tiket': ticket.kode_ticket || '-',
            'Tanggal Tiket': tglTicket,
            'Jam Tiket': jamTicket,
            'No Jo': ticket.no_jo || '-',
            'No SO': ticket.no_so || '-',
            'No IO': ticket.no_io || '-',
            Item: ticket.nama_produk || '-',
            Mesin: ticket.mesin || '-',
            Proses: ticket.proses || '-',
            Kendala: `${ticket.kode_lkh || '-'} - ${
              ticket.nama_kendala || '-'
            }`,
            'Jenis Kendala': ticket.jenis_kendala || '-',
            'Bagian Tiket': ticket.bagian_tiket || '-',
            Bagian: ticket.bagian || '-',
            Spek: ticket.spek || '-',
            Customer: ticket.nama_customer || '-',
            Operator: ticket.operator || '-',
            QTY: ticket.qty || '-',
            'QTY Druk': ticket.qty_druk || '-',
            'Status Tiket': ticket.status_tiket || '-',
            'Kode Analisis (Tiket)': ticket.kode_analisis_mtc || '-',
            'Nama Analisis (Tiket)': ticket.nama_analisis_mtc || '-',
            'Jenis Analisis MTC': ticket.jenis_analisis_mtc || '-',

            // Process MTC information (empty for tickets without processes)
            'Process ID': '-',
            'Bagian Mesin': '-',
            Unit: '-',
            'Cara Perbaikan': '-',
            'Kode Analisis MTC': '-',
            'Nama Analisis MTC': '-',
            'Note MTC': '-',
            'Note QC': '-',
            'Note Analisis': '-',
            'Skor MTC': '-',
            'Status Proses': '-',
            'Status QC': '-',
            'Is Rework': '-',

            // User information
            'Eksekutor Nama': '-',
            'Eksekutor Role': '-',
            'QC Nama': ticket.user_respon_qc?.nama || '-',
            'QC Role': ticket.user_respon_qc?.role || '-',

            // Timing information
            'Waktu Respon QC': ticket.waktu_respon_qc
              ? convertTimeStampToDate(ticket.waktu_respon_qc)
              : '-',
            'Waktu Mulai MTC': '-',
            'Waktu Selesai MTC': '-',
            'Waktu Selesai Total': '-',
            'Waktu Breakdown MTC': '-',
            'Waktu Respon Total': '-',
            'Waktu Breakdown Total': '-',

            // Add a sortable date field (for internal use)
            _createdAtTimestamp: ticket.createdAt
              ? new Date(ticket.createdAt).getTime()
              : 0,
          });
        }
      });

      // Sort the data so newest is at the top
      excelData = excelData.sort(
        (a: any, b: any) => b._createdAtTimestamp - a._createdAtTimestamp,
      );

      // Remove the temporary sort field before displaying/exporting
      excelData = excelData.map((item: any, index: any) => {
        const { _createdAtTimestamp, ...rest } = item;
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

      let filename = `History_Validasi_${date}`;

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
      {/* Filters Section - Make it more mobile-friendly */}
      <div className="flex gap-1 items-center bg-white">
        {isLoading && <Loading />}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 xl:grid-cols-12 px-4 py-1 gap-3 items-center w-full">
          <div className="flex flex-col gap-2 md:col-span-1 lg:col-span-1 xl:col-span-2">
            <p className="text-sm text-primary font-semibold">Dari:</p>
            <input
              className="rounded-full bg-[#D8EAFF] px-2 h-8 w-full"
              type="date"
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2 md:col-span-1 lg:col-span-1 xl:col-span-2">
            <p className="text-sm text-primary font-semibold">Sampai:</p>
            <input
              className="rounded-full bg-[#D8EAFF] px-2 h-8 w-full"
              type="date"
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2 md:col-span-1 lg:col-span-1 xl:col-span-2">
            <p className="text-sm text-primary font-semibold">Pilih Mesin:</p>
            <select
              onChange={(e) => setMesinNama(e.target.value)}
              className="w-full rounded-md bg-blue-200 h-8"
            >
              <option selected disabled>
                Pilih Mesin
              </option>
              {masterMesin?.map((data: any, i: number) => (
                <option
                  key={i}
                  value={data.nama_mesin}
                  className="text-gray-800 text-sm font-light"
                >
                  {data.nama_mesin}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2 md:col-span-1 lg:col-span-1 xl:col-span-2">
            <p className="text-sm text-primary font-semibold">Status:</p>
            <select
              onChange={(e) => setStatusTiket(e.target.value)}
              className="w-full rounded-md bg-blue-200 h-8"
            >
              <option selected disabled>
                Pilih Status
              </option>
              <option value="di validasi">di validasi</option>
              <option value="di tolak">di tolak</option>
            </select>
          </div>
          <div className="flex flex-col gap-2 md:col-span-1 lg:col-span-1 xl:col-span-2">
            <p className="text-sm text-primary font-semibold">Cari</p>
            <input
              className="rounded-md h-8 bg-[#D8EAFF] px-2 w-full"
              placeholder="Jo, Io, Item"
              type="text"
              onChange={(e) => setNoJo(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2 md:col-span-2 lg:col-span-1 xl:col-span-2">
            <button
              onClick={() => getMTC()}
              className="bg-primary text-white px-5 py-2 rounded-md"
            >
              Tampilkan
            </button>
            <button
              onClick={() => prepareExportData()}
              className="px-5 py-2 rounded-md text-white bg-green-500"
              disabled={isLoadingPreview}
            >
              {isLoadingPreview ? 'Loading...' : 'EXPORT'}
            </button>
          </div>
        </div>
      </div>

      {/* Table Section - Responsive Design */}
      {/* Desktop Header - Hidden on mobile */}
      <div className="hidden lg:flex px-2 border border-stroke bg-white py-3 shadow-default dark:border-strokedark dark:bg-boxdark">
        <p className="w-5 text-[14px] font-semibold mr-3">No</p>
        <div className="flex flex-col w-full">
          <div className="grid grid-cols-11 gap-2 w-full">
            <div className="flex w-full justify-start">
              <p className="text-slate-600 text-[14px] font-semibold dark:text-white">
                Kode Tiket
              </p>
            </div>
            <div className="text-[14px] justify-start">
              <p className="text-slate-600 font-semibold dark:text-white">
                Tanggal Tiket
              </p>
            </div>
            <div className="text-[14px] justify-start">
              <p className="text-slate-600 font-semibold dark:text-white">
                No JO
              </p>
            </div>
            <div className="text-[14px] justify-start col-span-2">
              <p className="text-slate-600 font-semibold dark:text-white">
                Item
              </p>
            </div>
            <div className="text-[14px] justify-start">
              <p className="text-slate-600 font-semibold dark:text-white">
                Jam Tiket
              </p>
            </div>
            <div className="text-[14px] justify-start">
              <p className="text-slate-600 font-semibold dark:text-white">
                Status
              </p>
            </div>
            <div className="text-[14px] justify-start">
              <p className="text-slate-600 font-semibold">Nama Mesin</p>
            </div>
            <div className="text-[14px] justify-start">
              <p className="text-slate-600 font-semibold">Kendala</p>
            </div>
            <div className="text-[14px] justify-start">
              <p className="text-slate-600 font-semibold">Waktu Respone</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Rows - Responsive Cards */}
      {ticket?.data.map((data: any, index: number) => {
        const tglTicket = convertTimeStampToDate(data.createdAt);
        const waktuRespon = calculateResponTime2(
          data.createdAt,
          data.waktu_respon_qc,
        );
        const waktuResponSecond =
          formatMinutesToHoursMinutesSeconds(waktuRespon);
        const waktuBreakdownMinutes = calculateResponTime2(
          data.createdAt,
          data.waktu_selesai,
        );
        const waktuBreakdownMTCMinutes = calculateResponTime2(
          data.waktu_respon_qc,
          data.waktu_selesai_mtc,
        );
        const tglSelesaiTicket =
          data.waktu_selesai_mtc == null
            ? '-'
            : convertTimeStampToDate(data.waktu_selesai_mtc);
        const waktuBreakdown = formatMinutesToHoursMinutesSeconds(
          waktuBreakdownMinutes,
        );
        const waktuBreakdownMTC = formatMinutesToHoursMinutesSeconds(
          waktuBreakdownMTCMinutes,
        );
        const waktuVerifikasiQCMinutes = calculateResponTime2(
          data.waktu_selesai_mtc,
          data.waktu_selesai,
        );
        const waktuVerifikasiQC = formatMinutesToHoursMinutesSeconds(
          waktuVerifikasiQCMinutes,
        );

        return (
          <div
            key={index}
            className="w-full rounded-xl border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark"
          >
            {/* Desktop Layout */}
            <div className="hidden lg:flex px-2 py-3">
              <div className="flex items-center">
                <p className="text-neutral-500 text-sm font-light dark:text-white w-5 mr-3">
                  {index + 1}
                </p>
              </div>
              <div className="grid grid-cols-11 gap-2 w-full items-center">
                <div className="flex w-full justify-start">
                  <p className="text-neutral-500 break-all text-sm font-light dark:text-white">
                    {data.kode_ticket}
                  </p>
                </div>
                <div className="flex w-full justify-start">
                  <p className="text-neutral-500 text-sm font-light dark:text-white">
                    {convertTimeStampToDateOnly(data.createdAt)}
                  </p>
                </div>
                <div className="flex w-full justify-start">
                  <p className="text-neutral-500 text-sm font-light dark:text-white">
                    {data.no_jo}
                  </p>
                </div>
                <div className="flex w-full justify-start col-span-2">
                  <p className="text-neutral-500 text-sm font-light dark:text-white">
                    {data.nama_produk}
                  </p>
                </div>
                <div className="flex w-full justify-start">
                  <p className="text-neutral-500 text-sm font-light dark:text-white">
                    {convertDateToTime(data.createdAt)}
                  </p>
                </div>
                <div className="flex w-full justify-start">
                  <p
                    className={
                      data.status_qc == 'di validasi'
                        ? 'text-white text-sm font-light bg-green-600 rounded-lg px-2'
                        : 'text-white text-sm font-light bg-red-600 rounded-lg px-2'
                    }
                  >
                    {data.status_qc}
                  </p>
                </div>
                <div className="flex w-full justify-start">
                  <p className="text-neutral-500 text-sm font-light">
                    {data.mesin}
                  </p>
                </div>
                <div className="flex w-full justify-start">
                  <p className="text-neutral-500 text-sm font-light">
                    {data.kode_lkh + ' - ' + data.nama_kendala}
                  </p>
                </div>
                <div className="flex w-full justify-start">
                  <p className="text-neutral-500 text-sm font-light">
                    {waktuResponSecond}
                  </p>
                </div>
                <div className="flex w-full justify-end">
                  <button
                    onClick={() => handleClickDetail(index)}
                    className="text-xs font-bold bg-blue-700 py-2 px-3 text-white rounded-sm"
                  >
                    Detail
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Layout - Card Style */}
            <div className="lg:hidden p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full mr-2">
                    #{index + 1}
                  </span>
                  <p className="font-semibold text-gray-800 text-sm">
                    {data.kode_ticket}
                  </p>
                </div>
                <button
                  onClick={() => handleClickDetail(index)}
                  className="text-xs font-bold bg-blue-700 py-2 px-3 text-white rounded-md"
                >
                  Detail
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Tanggal:</span>
                  <span className="text-gray-800">
                    {convertTimeStampToDateOnly(data.createdAt)}{' '}
                    {convertDateToTime(data.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">No JO:</span>
                  <span className="text-gray-800">{data.no_jo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Item:</span>
                  <span className="text-gray-800 text-right max-w-[60%]">
                    {data.nama_produk}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Mesin:</span>
                  <span className="text-gray-800">{data.mesin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Status:</span>
                  <span
                    className={
                      data.status_qc == 'di validasi'
                        ? 'text-white text-xs font-medium bg-green-600 rounded-lg px-2 py-1'
                        : 'text-white text-xs font-medium bg-red-600 rounded-lg px-2 py-1'
                    }
                  >
                    {data.status_qc}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Kendala:</span>
                  <span className="text-gray-800 text-right max-w-[60%]">
                    {data.kode_lkh + ' - ' + data.nama_kendala}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">
                    Waktu Respon:
                  </span>
                  <span className="text-gray-800">{waktuResponSecond}</span>
                </div>
              </div>
            </div>

            {showModalDetail === index && (
              <ModalDetailValidasi
                status={data.status_qc}
                note={data.note_qc}
                nama_kendala={data.nama_kendala}
                nama_mesin={data.mesin}
                operator={data.operator}
                isOpen={showModalDetail === index} // ✅ always boolean
                onClose={closeModalDetail}
                key={index}
                unit={data.unit}
                bagian={data.bagian}
                validator={data.user_respon_qc?.nama}
                nojo={data.no_jo}
                customer={data.nama_customer}
                masalah={data.nama_analisis_mtc}
                waktuMasuk={tglTicket}
                waktuSelesai={tglSelesaiTicket}
                WaktuBreakdown={waktuBreakdown}
                waktuBreakdownMTC={waktuBreakdownMTC}
                waktuVerifikasiQC={waktuVerifikasiQC}
                data={data}
              >
                <></>
              </ModalDetailValidasi>
            )}
          </div>
        );
      })}

      {/* Pagination - Same for both desktop and mobile */}
      <div className="w-full flex mt-5 justify-center">
        <Stack spacing={2}>
          <Pagination
            count={ticket?.total_page}
            color="primary"
            onChange={(e, i) => {
              setPage(i);
              console.log(i);
            }}
          />
        </Stack>
      </div>

      {/* Export Modal - Keep the same */}
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
                    {previewData.slice(0, visibleRows).map((row, rowIndex) => (
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
  );
};

export default TableHistoryValidate;
