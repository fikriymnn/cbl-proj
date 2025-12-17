import { useEffect, useState } from 'react';

import axios from 'axios';
import convertTimeStampToDate from '../../../../utils/converDateTime';
import Stack from '@mui/material/Stack';
import Pagination from '@mui/material/Pagination/Pagination';
import ModalDetailValidasi from '../../../Modals/ModalDetailValidasi';
import Loading from '../../../Loading';
import convertTimeStampToDateOnly from '../../../../utils/convertDate';
import convertDateToTime from '../../../../utils/converDateToTime';
import * as XLSX from 'xlsx';
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
      return -1;
    }

    const createdAtDate = new Date(startDate);
    const waktuResponDate = new Date(endDate);

    if (isNaN(createdAtDate.getTime()) || isNaN(waktuResponDate.getTime())) {
      return -1;
    }

    const millisecondsDiff =
      waktuResponDate.getTime() - createdAtDate.getTime();
    const secondsDiff = Math.floor(millisecondsDiff / 1000);

    return secondsDiff;
  }

  function formatMinutesToHoursMinutesSeconds(totalSeconds: number) {
    if (totalSeconds === -1) {
      return '-';
    }

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

  const openModalExport = () => {
    setVisibleRows(20);
    setShowExportPreview(true);
  };
  const closeModalExport = () => setShowExportPreview(false);

  const prepareExportData = async () => {
    try {
      setIsLoadingPreview(true);
      setVisibleRows(20);

      const url = `${import.meta.env.VITE_API_LINK}/prosessMtcHistoryQc`;
      const response = await axios.get(url, {
        params: {
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

      let excelData = allData.map((data: any, index: any) => {
        const processData = data;
        const tiketData = processData.tiket || {};

        const tglTicket = tiketData.createdAt
          ? convertTimeStampToDateOnly(tiketData.createdAt)
          : '-';
        const jamTicket = tiketData.createdAt
          ? convertDateToTime(tiketData.createdAt)
          : '-';

        // ADDED MISSING CALCULATIONS - matching the display section
        const tglTicketFull = tiketData.createdAt
          ? convertTimeStampToDate(tiketData.createdAt)
          : '-';

        const tglSelesaiTicket = processData.waktu_selesai_mtc
          ? convertTimeStampToDate(processData.waktu_selesai_mtc)
          : '-';

        // Calculate response times - matching display section logic
        const waktuRespon = calculateResponTime2(
          tiketData.createdAt,
          tiketData.waktu_respon_qc,
        );
        const waktuResponFormatted =
          formatMinutesToHoursMinutesSeconds(waktuRespon);

        const waktuBreakdownMinutes = calculateResponTime2(
          tiketData.createdAt,
          tiketData.waktu_selesai,
        );
        const waktuBreakdown = formatMinutesToHoursMinutesSeconds(
          waktuBreakdownMinutes,
        );

        const waktuBreakdownMTCMinutes = calculateResponTime2(
          tiketData.waktu_respon_qc,
          tiketData.waktu_selesai_mtc,
        );
        const waktuBreakdownMTC = formatMinutesToHoursMinutesSeconds(
          waktuBreakdownMTCMinutes,
        );

        const waktuVerifikasiQCMinutes = calculateResponTime2(
          tiketData.waktu_selesai_mtc,
          tiketData.waktu_selesai,
        );
        const waktuVerifikasiQC = formatMinutesToHoursMinutesSeconds(
          waktuVerifikasiQCMinutes,
        );

        return {
          No: index + 1,

          // Process MTC information
          'Process ID': processData.id || '-',
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
          'Is Rework': processData.is_rework ? 'Yes' : 'No',

          // User information
          'Eksekutor Nama': processData.user_eksekutor?.nama || '-',
          'Eksekutor Role': processData.user_eksekutor?.role || '-',
          'QC Nama': processData.user_qc?.nama || '-',
          'QC Role': processData.user_qc?.role || '-',

          // Ticket information
          'Ticket ID': tiketData.id || '-',
          'Kode Tiket': tiketData.kode_ticket || '-',
          'Tanggal Tiket': tglTicket,
          'Jam Tiket': jamTicket,
          'Tanggal Tiket ': tglTicketFull, // ADDED
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

          'Waktu Respon MTC (Tiket)': tiketData.waktu_respon
            ? convertTimeStampToAllSecond(tiketData.waktu_respon)
            : '-',
          'Waktu Mulai MTC (Tiket)': tiketData.waktu_mulai_mtc
            ? convertTimeStampToAllSecond(tiketData.waktu_mulai_mtc)
            : '-',
          'Waktu Mulai MTC (Process)': processData.waktu_mulai_mtc
            ? convertTimeStampToDate(processData.waktu_mulai_mtc)
            : '-',
          'Waktu Selesai MTC': processData.waktu_selesai_mtc
            ? convertTimeStampToAllSecond(processData.waktu_selesai_mtc)
            : '-',
          'Waktu Selesai Total': processData.waktu_selesai
            ? convertTimeStampToDate(processData.waktu_selesai)
            : '-',

          // ADDED MISSING CALCULATED FIELDS - matching display section
          'Tanggal Selesai Tiket': tglSelesaiTicket,
          'Waktu Respon ': waktuResponFormatted,
          'Waktu Breakdown MTC': waktuBreakdownMTC,
          'Waktu Verifikasi QC': waktuVerifikasiQC,
          'Waktu Breakdown Total': waktuBreakdown,

          _createdAtTimestamp: tiketData.createdAt
            ? new Date(tiketData.createdAt).getTime()
            : 0,
        };
      });

      excelData = excelData.sort(
        (a: any, b: any) => b._createdAtTimestamp - a._createdAtTimestamp,
      );

      excelData = excelData.map((item: any, index: any) => {
        const { _createdAtTimestamp, ...rest } = item;
        return { No: index + 1, ...rest };
      });

      setPreviewData(excelData);
      openModalExport();
    } catch (error) {
      console.error('Preview failed:', error);
      alert('Preview failed. Please try again.');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const exportToExcel = () => {
    try {
      setIsLoadingPreview(true);

      if (!previewData || previewData.length === 0) {
        alert('No data to export');
        setIsLoadingPreview(false);
        return;
      }

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(previewData);

      const wscols =
        previewData.length > 0
          ? Object.keys(previewData[0]).map(() => ({ wch: 20 }))
          : [];
      worksheet['!cols'] = wscols;

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Process MTC Details');

      const today = new Date();
      const date = `${today.getFullYear()}-${(today.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;

      let filename = `History_Verifikasi_${date}`;

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

      XLSX.writeFile(workbook, filename);
      closeModalExport();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Filters Section - Mobile-friendly */}
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
            <p className="text-sm text-primary font-semibold">Status Tiket:</p>
            <select
              onChange={(e) => setStatusTiket(e.target.value)}
              className="w-full rounded-md bg-blue-200 h-8"
            >
              <option selected disabled>
                Pilih Status Tiket
              </option>
              <option
                value="approved"
                className="text-gray-800 text-sm font-light"
              >
                approved
              </option>
              <option
                value="rejected"
                className="text-gray-800 text-sm font-light"
              >
                rejected
              </option>
            </select>
          </div>
          <div className="flex flex-col gap-2 md:col-span-1 lg:col-span-1 xl:col-span-2">
            <p className="text-sm text-primary font-semibold">Cari</p>
            <input
              className="rounded-md h-8 bg-[#D8EAFF] px-2 w-full"
              placeholder="Jo, Io, Item, Customer, Kendala"
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
          <div className="grid grid-cols-12 gap-2 w-full">
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
                No Jo
              </p>
            </div>
            <div className="text-[14px] justify-start col-span-2">
              <p className="text-slate-600 font-semibold dark:text-white">
                Item
              </p>
            </div>
            <div className="text-[14px] justify-start">
              <p className="text-slate-600 font-semibold">Mesin</p>
            </div>
            <div className="text-[14px] justify-start">
              <p className="text-slate-600 font-semibold">Kendala</p>
            </div>
            <div className="text-[14px] justify-start">
              <p className="text-slate-600 font-semibold dark:text-white">
                Jam Tiket
              </p>
            </div>
            <div className="text-[14px] justify-start">
              <p className="text-slate-600 font-semibold">Status</p>
            </div>
            <div className="text-[14px] justify-start mx-auto">
              <p className="text-slate-600 font-semibold">Skor</p>
            </div>
            <div className="text-[14px] justify-start">
              <p className="text-slate-600 font-semibold">Waktu Respon</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Rows - Responsive Cards */}
      {ticketProsesHistory?.data.map((data: any, index: number) => {
        const tglTicket = convertTimeStampToDateOnly(data.createdAt);
        const jamTicket = convertDateToTime(data.tiket.waktu_selesai_mtc);
        const tglSelesaiTicket =
          data.waktu_selesai_mtc == null
            ? '-'
            : convertTimeStampToDate(data.waktu_selesai_mtc);
        const waktuRespon = calculateResponTime2(
          data.waktu_selesai_mtc,
          data.waktu_selesai,
        );
        const waktuBreakdownMinutes = calculateResponTime2(
          data.tiket?.createdAt,
          data.tiket?.waktu_selesai,
        );
        const waktuBreakdownMTCMinutes = calculateResponTime2(
          data.tiket?.waktu_respon_qc,
          data.tiket?.waktu_selesai_mtc,
        );
        const waktuRespon2 = formatMinutesToHoursMinutesSeconds(waktuRespon);
        const waktuBreakdown = formatMinutesToHoursMinutesSeconds(
          waktuBreakdownMinutes,
        );
        const waktuBreakdownMTC = formatMinutesToHoursMinutesSeconds(
          waktuBreakdownMTCMinutes,
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
            className="w-full rounded-xl border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark"
          >
            {/* Desktop Layout */}
            <div className="hidden lg:flex px-2 py-3">
              <div className="flex items-center">
                <p className="text-neutral-500 text-sm font-light dark:text-white w-5 mr-3">
                  {index + 1}
                </p>
              </div>
              <div className="grid grid-cols-12 gap-2 w-full items-center dark:border-strokedark">
                <div className="flex w-full justify-start">
                  <p className="text-neutral-500 text-sm font-light dark:text-white break-all">
                    {data.tiket.kode_ticket}
                  </p>
                </div>
                <div className="flex w-full justify-start">
                  <p className="text-neutral-500 text-sm font-light dark:text-white">
                    {tglTicket}
                  </p>
                </div>
                <div className="flex w-full justify-start">
                  <p className="text-neutral-500 text-sm font-light dark:text-white">
                    {data.tiket.no_jo}
                  </p>
                </div>
                <div className="flex w-full justify-start col-span-2">
                  <p className="text-neutral-500 text-sm font-light dark:text-white">
                    {data.tiket.nama_produk}
                  </p>
                </div>
                <div className="flex w-full justify-start">
                  <p className="text-neutral-500 text-sm font-light">
                    {data.tiket.mesin}
                  </p>
                </div>
                <div className="flex w-full justify-start">
                  <p className="text-neutral-500 text-sm font-light">
                    {data.tiket.kode_lkh + ' - ' + data.tiket.nama_kendala}
                  </p>
                </div>
                <div className="flex w-full justify-start">
                  <p className="text-neutral-500 text-sm font-light dark:text-white">
                    {jamTicket}
                  </p>
                </div>
                <div className="flex w-full justify-start">
                  <p
                    className={
                      data.status_qc == 'approved'
                        ? 'text-white text-sm font-light bg-green-600 rounded-lg px-2'
                        : 'text-white text-sm font-light bg-red-600 rounded-lg px-2'
                    }
                  >
                    {data.status_qc}
                  </p>
                </div>
                <div className="flex w-full justify-start">
                  <p className="text-neutral-500 text-sm font-light mx-auto">
                    {data.skor_mtc}
                  </p>
                </div>
                <div className="flex w-full justify-start">
                  <p className="text-neutral-500 text-sm font-light">
                    {waktuRespon2}
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
                    {data.tiket.kode_ticket}
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
                    {tglTicket} {jamTicket}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">No Jo:</span>
                  <span className="text-gray-800">{data.tiket.no_jo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Item:</span>
                  <span className="text-gray-800 text-right max-w-[60%]">
                    {data.tiket.nama_produk}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Mesin:</span>
                  <span className="text-gray-800">{data.tiket.mesin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Status:</span>
                  <span
                    className={
                      data.status_qc == 'approved'
                        ? 'text-white text-xs font-medium bg-green-600 rounded-lg px-2 py-1'
                        : 'text-white text-xs font-medium bg-red-600 rounded-lg px-2 py-1'
                    }
                  >
                    {data.status_qc}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Skor:</span>
                  <span className="text-gray-800">{data.skor_mtc}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Kendala:</span>
                  <span className="text-gray-800 text-right max-w-[60%]">
                    {data.tiket.kode_lkh + ' - ' + data.tiket.nama_kendala}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">
                    Waktu Respon:
                  </span>
                  <span className="text-gray-800">{waktuRespon2}</span>
                </div>
              </div>
            </div>

            {showModalDetail === index && (
              <ModalDetailValidasi
                bagian={data.bagian_mesin}
                unit={data.unit}
                status={data.tiket.status_qc}
                note={data.note_qc}
                nama_kendala={data.tiket.nama_kendala}
                nama_mesin={data.tiket.mesin}
                operator={data.tiket.operator}
                isOpen={showModalDetail === index}
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
            )}
          </div>
        );
      })}

      {/* Pagination - Same for both desktop and mobile */}
      <div className="w-full flex mt-5 justify-center">
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

      {/* Export Preview Modal */}
      {showExportPreview && (
        <ModalFull
          isOpen={showExportPreview}
          onClose={() => closeModalExport()}
          judul={'Export Preview'}
        >
          <>
            <div className="flex flex-col h-[85vh]">
              <div className="flex justify-between mb-4 px-2 pt-5">
                <div className="text-sm text-gray-500">
                  Total Data: {previewData.length}
                </div>
                <button
                  onClick={exportToExcel}
                  className="bg-blue-500 text-white py-1px-4 rounded hover:bg-blue-600"
                  disabled={isLoadingPreview}
                >
                  {isLoadingPreview ? 'Exporting...' : 'Export to Excel'}
                </button>
              </div>
              <div className="overflow-auto flex-1 relative">
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

export default TableHistory;
