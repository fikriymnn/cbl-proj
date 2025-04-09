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
import ModalKosongan from '../../../Modals/Qc/NCR/NCRResponQC';
import convertTimeStampToDateTime from '../../../../utils/converDateTime';
import Loading from '../../../Loading';
import * as XLSX from 'xlsx'; // Add this import at the top
import ModalXL from '../../PPIC/JadwalProduksi/ModalXL';
import ModalFull from '../../PPIC/JadwalProduksi/ModalFull';
import convertTimeStampToDateOnly from '../../../../utils/convertDateOnly';
import convertDateToTime from '../../../../utils/converDateToTime';
const TableHistoryValidateAllKendala = () => {
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
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

  const [noJo, setNoJo] = useState<any>();
  async function getMTC() {
    const url = `${import.meta.env.VITE_API_LINK}/kendalaLkh`;
    try {
      const res = await axios.get(url, {
        params: {
          page: page,
          limit: 10,
          bagian_tiket: 'history',
          no_jo: noJo,
          start_date: startDate,
          end_date: endDate,
          mesin: mesinNama,
        },
        withCredentials: true,
      });

      setTicket(res.data);

      console.log(res.data);
    } catch (error: any) {
      console.log(error);
    }
  }

  const [showEdit, setShowEdit] = useState<any>([]);
  const openEdit = (i: any) => {
    const onchangeVal: any = [...showEdit];
    onchangeVal[i] = true;

    setShowEdit(onchangeVal);
  };
  const closeEdit = (i: any) => {
    const onchangeVal: any = [...showEdit];
    onchangeVal[i] = false;

    setShowEdit(onchangeVal);
  };
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
      const url = `${import.meta.env.VITE_API_LINK}/kendalaLkh`;
      const response = await axios.get(url, {
        params: {
          bagian_tiket: 'history',
          no_jo: noJo,
          start_date: startDate,
          end_date: endDate,
          mesin: mesinNama,
        },
        withCredentials: true,
      });

      const allData = response.data.data;

      if (!allData || allData.length === 0) {
        alert('No data to export');
        setIsLoadingPreview(false);
        return;
      }

      // Extract all ticket data
      let excelData: any = [];

      // Go through each ticket
      allData.forEach((ticket: any, ticketIndex: any) => {
        // Format dates
        const tglTicket = ticket.createdAt
          ? convertTimeStampToDateOnly(ticket.createdAt)
          : '-';
        const jamTicket = ticket.createdAt
          ? convertDateToTime(ticket.createdAt)
          : '-';

        // Calculate response time if available
        const waktuBreakdown =
          ticket.waktu_selesai && ticket.createdAt
            ? formatMinutesToHoursMinutesSeconds(
                calculateResponTime2(ticket.createdAt, ticket.waktu_selesai),
              )
            : '-';

        // Format departments
        const departments = ticket.data_department
          ? ticket.data_department
              .map((dept: any) => dept.department)
              .join(', ')
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
          Kendala: `${ticket.kode_lkh || '-'} - ${ticket.nama_kendala || '-'}`,
          'Jenis Kendala': ticket.jenis_kendala || '-',
          'Bagian Tiket': ticket.bagian_tiket || '-',
          Departments: departments,
          Customer: ticket.nama_customer || '-',
          Operator: ticket.operator || '-',
          'Status Tiket': ticket.status_tiket || '-',
          'Note QC': ticket.note_qc || '-',

          // QC User information
          'QC Nama': ticket.user_qc?.nama || '-',
          'QC Role': ticket.user_qc?.role || '-',
          'QC Bagian': ticket.user_qc?.bagian || '-',

          // Add a sortable date field (for internal use)
          _createdAtTimestamp: ticket.createdAt
            ? new Date(ticket.createdAt).getTime()
            : 0,
        });
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
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Ticket Details');

      // Generate Excel file
      const today = new Date();
      const date = `${today.getFullYear()}-${(today.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;

      let filename = `History_All_Kendala_${date}`;

      // Add filter info to filename if any filter is applied
      if (startDate && endDate) {
        filename += `_${startDate.split('T')[0]}_to_${endDate.split('T')[0]}`;
      }
      if (mesinNama) {
        filename += `_${mesinNama}`;
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
      <div className="flex  gap-1 items-center bg-white ">
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
            <p className=" my-auto text-sm text-primary font-semibold ">
              Sampai:
            </p>

            <input
              className="rounded-full bg-[#D8EAFF] px-2 h-8"
              type="date"
              onChange={(e) => setEndDate(e.target.value)}
            ></input>
          </div>
          <div className="flex flex-col  gap-2 col-span-2">
            <p className=" my-auto text-sm text-primary font-semibold ">
              Pilih Mesin:
            </p>

            <select
              onChange={(e) => {
                setMesinNama(e.target.value);
              }}
              className={` z-20 w-full rounded-md bg-blue-200 items-center h-8`}
            >
              <option selected disabled>
                Pilih Mesin
              </option>
              {masterMesin?.map((data: any, i: number) => {
                return (
                  <option
                    value={data.nama_mesin}
                    className="text-gray-800 text-sm font-light dark:text-bodydark"
                  >
                    {data.nama_mesin}
                  </option>
                );
              })}
            </select>
          </div>

          <div className=" gap-2 flex flex-col col-span-2">
            <p className=" my-auto text-sm text-primary font-semibold ">
              No.Jo
            </p>
            <input
              className="rounded-md h-8 bg-[#D8EAFF] px-2 w-full"
              placeholder="Nomor JO"
              type="text"
              onChange={(e) => setNoJo(e.target.value)}
            ></input>
          </div>
          <div className=" gap-2 flex flex-col col-span-2"></div>
          <div className="flex flex-col gap-2 col-span-2">
            <button
              onClick={() => {
                getMTC();
              }}
              className="bg-primary text-white px-5 py-2 rounded-md my-auto "
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
          <div className="grid grid-cols-8 gap-5 w-full dark:border-strokedark  ">
            <div className="flex w-full justify-start ">
              <p className="text-slate-600  text-[14px] font-semibold  dark:text-white">
                Kode Tiket
              </p>
            </div>
            <div className=" text-[14px] justify-start  ">
              <p className="text-slate-600 font-semibold  dark:text-white">
                Waktu Masuk
              </p>
            </div>
            <div className=" text-[14px] justify-start  ">
              <p className="text-slate-600 font-semibold  dark:text-white">
                Status
              </p>
            </div>
            <div className=" text-[14px] justify-start  ">
              <p className="text-slate-600 font-semibold ">Nama Mesin</p>
            </div>
            <div className=" text-[14px] justify-start ">
              <p className="text-slate-600 font-semibold ">Kendala</p>
            </div>

            <div className=" text-[14px] justify-start ">
              <p className="text-slate-600 font-semibold ">Operator</p>
            </div>
            <div className=" text-[14px] justify-start ">
              <p className="text-slate-600 font-semibold ">No.Jo,Io,So</p>
            </div>
            {/* <div className=" text-[14px] justify-center ">
              <p className="text-slate-600 font-semibold ">Skor</p>
            </div> */}
          </div>
        </div>
      </div>
      {ticket?.data.map((data: any, index: number) => {
        const tglTicket = convertTimeStampToDate(data.createdAt);
        const waktuRespon = calculateTime(data.createdAt, data.waktu_respon_qc);

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
            <div className="grid grid-cols-8 gap-5 w-full items-center dark:border-strokedark">
              <div className="flex w-full justify-start  gap-14">
                <p className="text-neutral-500 break-all text-sm font-light  dark:text-white">
                  {' '}
                  {data.kode_ticket}
                </p>
              </div>
              <div className="flex w-full  justify-start ">
                <p className="text-neutral-500 text-sm font-light  dark:text-white">
                  {tglTicket}
                </p>
              </div>
              <div className="flex w-full  justify-start ">
                <p
                  className={
                    data.status_tiket == 'di validasi'
                      ? 'text-white text-sm font-light   bg-green-600 rounded-lg px-2'
                      : 'text-white text-sm font-light  dark:text-white bg-red-600 rounded-lg px-2'
                  }
                >
                  {data.status_tiket}
                </p>
              </div>
              <div className="flex w-full  justify-start  ">
                <p className="text-neutral-500 text-sm font-light ">
                  {data.mesin}
                </p>
              </div>
              <div className="flex w-full  justify-start ">
                <p className="text-neutral-500 text-sm font-light ">
                  {data.kode_lkh + ' - ' + data.nama_kendala}
                </p>
              </div>

              <div className="flex w-full  justify-start ">
                <p className="text-neutral-500 text-sm font-light ">
                  {data.operator}
                </p>
              </div>
              <div className="flex flex-col gap-1 w-full  justify-start ">
                <p className="text-neutral-500 text-sm font-light ">
                  {data.no_jo}
                </p>
                <p className="text-neutral-500 text-sm font-light ">
                  {data.no_io}
                </p>
                <p className="text-neutral-500 text-sm font-light ">
                  {data.no_so}
                </p>
              </div>
              {/* <div className="flex w-full  justify-start col-span-3">
                <p className="text-neutral-500 text-sm font-light ">
                  {data.skor_mtc}
                </p>
              </div> */}
              <div className="flex w-full justify-end">
                <button
                  onClick={() => openEdit(index)}
                  className="text-xs font-bold bg-blue-700 py-2 px-3 text-white rounded-sm"
                >
                  Detail
                </button>
              </div>
            </div>
            {showEdit[index] == true && (
              <ModalKosongan
                isOpen={showEdit[index]}
                onClose={() => closeEdit(index)}
                judul={'Detail Tiket'}
              >
                <>
                  <div className="grid grid-cols-2 gap-2 px-4 py-4">
                    <div className="flex flex-col  ">
                      <label
                        htmlFor=""
                        className="text-black text-xs font-bold"
                      >
                        Status
                      </label>
                      <label
                        htmlFor=""
                        className="text-[#016ae6] uppercase text-xl font-normal"
                      >
                        {data.status_tiket}
                      </label>
                    </div>
                    <div className="flex flex-col  ">
                      <label
                        htmlFor=""
                        className="text-black text-xs font-bold"
                      >
                        Yang Menyetujui
                      </label>
                      <label
                        htmlFor=""
                        className="text-[#016ae6] uppercase text-xl font-normal"
                      >
                        {data.user_qc?.nama}
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 px-4 py-4">
                    <div className="flex flex-col gap-2 ">
                      <div className="flex flex-col ">
                        <label
                          htmlFor=""
                          className="text-black text-xs font-bold"
                        >
                          Kode Tiket
                        </label>
                        <label
                          htmlFor=""
                          className="text-[#7a7a7a] text-xl font-normal"
                        >
                          {data.kode_ticket}
                        </label>
                      </div>
                      <div className="flex flex-col ">
                        <label
                          htmlFor=""
                          className="text-black text-xs font-bold"
                        >
                          No. JO
                        </label>
                        <label
                          htmlFor=""
                          className="text-[#7a7a7a] text-xl font-normal"
                        >
                          {data.no_jo}
                        </label>
                      </div>
                      <div className="flex flex-col ">
                        <label
                          htmlFor=""
                          className="text-black text-xs font-bold"
                        >
                          No. IO
                        </label>
                        <label
                          htmlFor=""
                          className="text-[#7a7a7a] text-xl font-normal"
                        >
                          {data.no_io}
                        </label>
                      </div>
                      <div className="flex flex-col ">
                        <label
                          htmlFor=""
                          className="text-black text-xs font-bold"
                        >
                          No. SO
                        </label>
                        <label
                          htmlFor=""
                          className="text-[#7a7a7a] text-xl font-normal"
                        >
                          {data.no_so}
                        </label>
                      </div>
                      <div className="flex flex-col ">
                        <label
                          htmlFor=""
                          className="text-black text-xs font-bold"
                        >
                          Nama Customer
                        </label>
                        <label
                          htmlFor=""
                          className="text-[#7a7a7a] text-xl font-normal"
                        >
                          {data.nama_customer}
                        </label>
                      </div>
                      <div className="flex flex-col ">
                        <label
                          htmlFor=""
                          className="text-black text-xs font-bold"
                        >
                          Nama Item
                        </label>
                        <label
                          htmlFor=""
                          className="text-[#7a7a7a] text-xl font-normal"
                        >
                          {data.nama_produk}
                        </label>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 ">
                      <div className="flex flex-col ">
                        <label
                          htmlFor=""
                          className="text-black text-xs font-bold"
                        >
                          Kendala
                        </label>
                        <label
                          htmlFor=""
                          className="text-[#016ae6] text-xl font-normal"
                        >
                          {data.kode_kendala} - {data.nama_kendala}
                        </label>
                      </div>
                      <div className="flex flex-col ">
                        <label
                          htmlFor=""
                          className="text-black text-xs font-bold"
                        >
                          Jenis Kendala
                        </label>
                        <label
                          htmlFor=""
                          className="text-[#016ae6] text-xl font-normal"
                        >
                          {data.jenis_kendala}
                        </label>
                      </div>
                      <div className="flex flex-col ">
                        <label
                          htmlFor=""
                          className="text-black text-xs font-bold"
                        >
                          Mesin
                        </label>
                        <label
                          htmlFor=""
                          className="text-[#016ae6] text-xl font-normal"
                        >
                          {data.mesin}
                        </label>
                      </div>
                      <div className="flex flex-col ">
                        <label
                          htmlFor=""
                          className="text-black text-xs font-bold"
                        >
                          Operator
                        </label>
                        <label
                          htmlFor=""
                          className="text-[#016ae6] text-xl font-normal"
                        >
                          {data.operator}
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col w-full px-4 ">
                    <label htmlFor="" className="text-black text-xs font-bold">
                      Note QC
                    </label>
                    <textarea
                      readOnly
                      value={data.note_qc}
                      className="peer h-full min-h-[100px] w-full resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                    ></textarea>
                  </div>
                </>
              </ModalKosongan>
            )}
          </div>
        );
      })}
      <div className="w-full flex  mt-5 ">
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
    </div>
  );
};

export default TableHistoryValidateAllKendala;
