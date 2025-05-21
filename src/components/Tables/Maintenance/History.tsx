import { useEffect, useRef, useState } from 'react';
import Filter from '../../../images/icon/filter.svg';
import Burger from '../../../images/icon/burger.svg';
import Arrow from '../../../images/icon/arrowDown.svg';
import ModalMtcDate from '../../Modals/ModalMtcDate';
import ModalStockCheck1 from '../../Modals/ModalStockCheck1';
import Polygon6 from '../../../images/icon/Polygon6.svg';
import axios from 'axios';
import Select from 'react-select';
import X from '../../../images/icon/x.svg';
import ModalDetail from '../../Modals/ModalDetail';
import { Stack } from '@mui/material';
// import moment from 'moment';
import Pagination from '@mui/material/Pagination';
import convertTimeStampToDateTime from '../../../utils/converDateTime';
import convertTimeStampToAllSecond from '../../../utils/ConverttimestametoAllSecond';
import convertTimeStampToDateOnly from '../../../utils/convertDateOnly';
import convertDateToTime from '../../../utils/converDateToTime';
import * as XLSX from 'xlsx'; // Add this import at the top
import ModalFull from '../PPIC/JadwalProduksi/ModalFull';
import convertTimeStampToDate from '../../../utils/convertDate';
import Loading from '../../Loading';
function HistoryOS2() {
  const [isMobile, setIsMobile] = useState(false);
  const [status, setStatus] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);

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

  //const openModal1 = () => setShowModal1(true);

  const openModal2 = () => setShowModal2(true);
  //const closeModal1 = () => setShowModal1(false);

  const closeModal2 = () => setShowModal2(false);
  // const handleClick = (index: number) => {
  //   setShowTwoButtons((prevState) => {
  //     const updatedShowTwoButtons = [...prevState]; // Create a copy
  //     updatedShowTwoButtons[index] = !updatedShowTwoButtons[index]; // Toggle value
  //     // Reset showTwoButtons for all other rows
  //     for (let i = 0; i < updatedShowTwoButtons.length; i++) {
  //       if (i !== index) {
  //         updatedShowTwoButtons[i] = false;
  //       }
  //     }
  //     return updatedShowTwoButtons;
  //   });
  // };
  const handleClickDetail = (index: number) => {
    setShowDetail((prevState) => {
      const updatedShowDetail = [...prevState]; // Create a copy
      updatedShowDetail[index] = !updatedShowDetail[index]; // Toggle value
      return updatedShowDetail;
    });
  };
  const handleClickDetailMobile = (index: number) => {
    setShowDetailMobile((prevState) => {
      const updatedShowDetailMobile = [...prevState]; // Create a copy
      updatedShowDetailMobile[index] = !updatedShowDetailMobile[index]; // Toggle value
      return updatedShowDetailMobile;
    });
  };
  const [tiket, setTiket] = useState<any>(null);
  const [filter, setFilter] = useState(false);
  const [showTwoButtons, setShowTwoButtons] = useState<any>([]);
  const [showModal1, setShowModal1] = useState<any>([]);
  const [user, setUser] = useState<any>(null);

  const handleClick = (i: any) => {
    const onchangeVal: any = [...showTwoButtons];
    setShowTwoButtons(showTwoButtons.map((item: any) => (item = false)));
    onchangeVal[i] = !onchangeVal[i];

    setShowTwoButtons(onchangeVal);
  };

  const openModal1 = (i: any) => {
    const onchangeVal: any = [...showModal1];

    onchangeVal[i] = true;

    setShowModal1(onchangeVal);
  };
  const closeModal1 = (i: any) => {
    const onchangeVal: any = [...showModal1];
    onchangeVal[i] = false;

    setShowModal1(onchangeVal);
  };
  const [limit, setLimit] = useState(10);
  useEffect(() => {
    getTiket();
    getMasterUser();
  }, [page, limit]);

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  };
  async function getMasterUser() {
    const url = `${import.meta.env.VITE_API_LINK}/users`;
    try {
      const res = await axios.get(url, {
        params: {
          status: 'aktif',
          bagian: 'maintenance',
        },
        withCredentials: true,
      });

      setUserList(res.data);
      console.log('user list', res.data);
      setOptions(
        res.data.map((item: any) => {
          return {
            value: item.id,
            label: `${item.nama}`,
          };
        }),
      );
    } catch (error: any) {
      console.log(error);
    }
  }
  const [showModalDetail, setShowModalDetail] = useState<any>([]);

  const openModalDetail = (i: any) => {
    const onchangeVal: any = [...showModalDetail];
    onchangeVal[i] = true;
    console.log(onchangeVal);
    setShowModalDetail(onchangeVal);
  };
  const closeModalDetail = (i: any) => {
    const onchangeVal: any = [...showModalDetail];
    onchangeVal[i] = false;

    setShowModalDetail(onchangeVal);
  };
  const [userList, setUserList] = useState<any>();
  const [options, setOptions] = useState([]);
  const [idKaryawan, setIdKaryawan] = useState<any>();
  const [startDate, setStartDate] = useState<any>();
  const [endDate, setEndDate] = useState<any>();
  const [mesinNama, setMesinNama] = useState<any>();
  const [statusTiket, setStatusTiket] = useState<any>();
  const [noJo, setNoJo] = useState<any>();
  async function getTiket() {
    const url = `${import.meta.env.VITE_API_LINK}/ticket`;
    try {
      const res = await axios.get(url, {
        params: {
          bagian_tiket: 'histori os2',
          no_jo: noJo,
          page: page,
          limit: limit, // Use the limit state here instead of hardcoded 10
          start_date: startDate,
          end_date: endDate,
          mesin: mesinNama,
          status_tiket: statusTiket,
          id_eksekutor: idKaryawan,
        },
        withCredentials: true,
      });

      setTiket(res.data);
      console.log(res.data);

      let data: any[] = [];
      for (let i = 0; i < res.data.data.length; i++) {
        data.push(false);
      }
      setShowModal1(data);
      setShowModalDetail(data);
      setShowTwoButtons(data);
    } catch (error: any) {
      console.log(error.response);
    }
  }

  const handleChangePointDepatment = (selected: any) => {
    const { value } = selected;
    const filteredData = userList.find(
      (item: any) => item.id == value,
      // item.id.includes(parseInt(value));
    );

    console.log(filteredData?.id);

    setIdKaryawan(filteredData?.id);
  };
  async function reworkTiket(idTiket: number) {
    const url = `${import.meta.env.VITE_API_LINK}/ticket/rework/${idTiket}`;

    try {
      const res = await axios.put(
        url,
        {
          id_eksekutor: user.id,
        },
        {
          withCredentials: true,
        },
      );

      alert(res.data.msg);
      getTiket();
    } catch (error: any) {
      alert(error.data.msg);
    }
  }

  function calculateResponTime(startDate: any, endDate: any) {
    const createdAtDate = new Date(startDate);
    const waktuResponDate = new Date(endDate);
    const millisecondsDiff =
      waktuResponDate.getTime() - createdAtDate.getTime();

    const secondsDiff = millisecondsDiff / 1000;
    const minutesDiff = Math.floor(secondsDiff / 60);
    const hoursDiff = Math.floor(minutesDiff / 60);

    const formattedDifference = `${hoursDiff ? hoursDiff + ' hours ' : ''}${
      hoursDiff >= 1 ? '' : minutesDiff + ' minutes '
    } `;

    return formattedDifference; // Example format (YYYY-MM-DD)
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

  const [showTwoButtonsMobile, setShowTwoButtonsMobile] = useState<boolean[]>(
    new Array(tiket != null && tiket.length).fill(false),
  );
  const [showDetail, setShowDetail] = useState<boolean[]>(
    new Array(tiket != null && tiket.length).fill(false),
  );
  const [showDetailMobile, setShowDetailMobile] = useState<boolean[]>(
    new Array(tiket != null && tiket.length).fill(false),
  );

  const [showModal2, setShowModal2] = useState(false);
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
          no_jo: noJo,
          bagian_tiket: 'histori os2',
          page: page,
          start_date: startDate,
          end_date: endDate,
          mesin: mesinNama,
          status_tiket: statusTiket,
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
      allData.forEach((ticket: any) => {
        // If there are MTC processes, create a row for each process
        if (ticket.proses_mtcs && ticket.proses_mtcs.length > 0) {
          ticket.proses_mtcs.forEach((process: any) => {
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

            // Gather sparepart information if available
            let sparepartInfo = '';
            let sparepartSebelumnya = '';
            let sparepartBaru = '';
            let lokasiBaru = '';
            let lokasiSebelumnya = '';
            let grade = '';

            if (
              process.masalah_spareparts &&
              process.masalah_spareparts.length > 0
            ) {
              process.masalah_spareparts.forEach((part: any, idx: any) => {
                if (idx === 0) {
                  sparepartSebelumnya = part.nama_sparepart_sebelumnya || '-';
                  sparepartBaru = part.nama_sparepart_baru || '-';
                  lokasiBaru = part.lokasi_sparepart_baru || '-';
                  lokasiSebelumnya = part.lokasi_sparepart_sebelumnya || '-';
                  grade = `${part.grade_sparepart_sebelumnya || '-'} -> ${
                    part.grade_sparepart_baru || '-'
                  }`;
                  sparepartInfo = `${
                    part.nama_sparepart_sebelumnya || '-'
                  } -> ${part.nama_sparepart_baru || '-'}`;
                } else {
                  sparepartInfo += `, ${
                    part.nama_sparepart_sebelumnya || '-'
                  } -> ${part.nama_sparepart_baru || '-'}`;
                }
              });
            }

            excelData.push({
              No: excelData.length + 1,
              // Ticket information
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
              'Maksimal Kedatangan Tiket':
                ticket.maksimal_kedatangan_tiket || '-',
              'Maksimal Periode Kedatangan':
                ticket.maksimal_periode_kedatangan_tiket || '-',
              'Maksimal Waktu Pengerjaan':
                ticket.maksimal_waktu_pengerjaan || '-',
              'Kode Analisis (Tiket)': ticket.kode_analisis_mtc || '-',
              'Nama Analisis (Tiket)': ticket.nama_analisis_mtc || '-',
              'Jenis Analisis MTC': ticket.jenis_analisis_mtc || '-',

              // Process MTC information
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

              'Alasan Pending': process.alasan_pending || '-',
              'Estimasi Pengerjaan': process.estimasi_pengerjaan || '-',
              'Tanggal MTC': process.tgl_mtc || '-',
              'Note Request Jadwal': process.note_request_jadwal || '-',

              // Sparepart details
              'Detail Sparepart': sparepartInfo || '-',
              'Sparepart Sebelumnya': sparepartSebelumnya || '-',
              'Sparepart Baru': sparepartBaru || '-',
              'Lokasi Sebelumnya': lokasiSebelumnya || '-',
              'Lokasi Baru': lokasiBaru || '-',
              'Grade Perubahan': grade || '-',
              'Tanggal Ganti':
                process.masalah_spareparts &&
                process.masalah_spareparts.length > 0
                  ? convertTimeStampToDate(
                      process.masalah_spareparts[0].tgl_ganti,
                    )
                  : '-',

              // User information
              'Eksekutor Nama': process.user_eksekutor?.nama || '-',
              'Eksekutor Role': process.user_eksekutor?.role || '-',
              'Eksekutor Bagian': process.user_eksekutor?.bagian || '-',
              'Eksekutor Email': process.user_eksekutor?.email || '-',
              'QC Nama': process.user_qc?.nama || '-',
              'QC Role': process.user_qc?.role || '-',
              'QC Bagian': process.user_qc?.bagian || '-',
              'QC Email': process.user_qc?.email || '-',

              // Timing information
              'Waktu Respon QC': ticket.waktu_respon_qc
                ? convertTimeStampToAllSecond(ticket.waktu_respon_qc)
                : '-',
              'Waktu Mulai MTC': process.waktu_mulai_mtc
                ? convertTimeStampToAllSecond(process.waktu_mulai_mtc)
                : '-',
              'Waktu Selesai MTC': process.waktu_selesai_mtc
                ? convertTimeStampToAllSecond(process.waktu_selesai_mtc)
                : '-',
              'Waktu Selesai Total': process.waktu_selesai
                ? convertTimeStampToAllSecond(process.waktu_selesai)
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
            ? convertTimeStampToAllSecond(ticket.createdAt)
            : '-';
          const jamTicket = ticket.createdAt
            ? convertTimeStampToAllSecond(ticket.createdAt)
            : '-';

          excelData.push({
            No: excelData.length + 1,
            // Ticket information
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
            'Alasan Pending': '-',
            'Estimasi Pengerjaan': '-',
            'Tanggal MTC': '-',
            'Note Request Jadwal': '-',

            // Sparepart details
            'Detail Sparepart': '-',
            'Sparepart Sebelumnya': '-',
            'Sparepart Baru': '-',
            'Lokasi Sebelumnya': '-',
            'Lokasi Baru': '-',
            'Grade Perubahan': '-',
            'Tanggal Ganti': '-',

            // User information
            'Eksekutor Nama': '-',
            'Eksekutor Role': '-',
            'Eksekutor Bagian': '-',
            'Eksekutor Email': '-',
            'QC Nama': ticket.user_respon_qc?.nama || '-',
            'QC Role': ticket.user_respon_qc?.role || '-',
            'QC Bagian': ticket.user_respon_qc?.bagian || '-',
            'QC Email': ticket.user_respon_qc?.email || '-',

            // Timing information
            'Waktu Respon QC': ticket.waktu_respon_qc
              ? convertTimeStampToAllSecond(ticket.waktu_respon_qc)
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
  const [masterMesin, setmasterMesin] = useState<any>();
  useEffect(() => {
    getMasterMesin();
  }, []);

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
  return (
    <main>
      {isLoading && <Loading />}
      <div className="flex justify-between items-center bg-white p-2">
        <div>
          {filter && (
            <div className=" bg-white shadow-2xl md:w-96 w-11/12 p-2 -translate-x-2 md:-translate-y-6 -translate-y-32 border border-gray"></div>
          )}
        </div>

        <div className="bg-white  p-6 mb-6">
          <div className="grid md:grid-cols-3 grid-cols-1 gap-6">
            {/* Date Range */}
            <div className="flex flex-row md:flex-row items-center gap-4 col-span-3 md:col-span-1">
              <div className="flex flex-col gap-2 flex-1">
                <p className="text-sm text-primary font-semibold">Dari:</p>
                <input
                  className="rounded-lg bg-blue-50 border border-blue-200 px-3 h-10 w-full focus:ring-2 focus:ring-blue-300 focus:outline-none"
                  type="date"
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <p className="text-sm text-primary font-semibold">Sampai:</p>
                <input
                  className="rounded-lg bg-blue-50 border border-blue-200 px-3 h-10 w-full focus:ring-2 focus:ring-blue-300 focus:outline-none"
                  type="date"
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* Dropdown Filters */}
            <div className="flex flex-col gap-2">
              <p className="text-sm text-primary font-semibold">Pilih Mesin:</p>
              <select
                onChange={(e) => {
                  setMesinNama(e.target.value);
                }}
                className="rounded-lg bg-blue-50 border border-blue-200 px-3 h-10 w-full focus:ring-2 focus:ring-blue-300 focus:outline-none"
              >
                <option selected disabled>
                  Pilih Mesin
                </option>
                {masterMesin?.map((data: any, i: any) => (
                  <option
                    key={i}
                    value={data.nama_mesin}
                    className="text-gray-800 text-sm"
                  >
                    {data.nama_mesin}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm text-primary font-semibold">
                Status Tiket:
              </p>
              <select
                onChange={(e) => {
                  setStatusTiket(e.target.value);
                }}
                className="rounded-lg bg-blue-50 border border-blue-200 px-3 h-10 w-full focus:ring-2 focus:ring-blue-300 focus:outline-none"
              >
                <option selected disabled>
                  Pilih Status Tiket
                </option>
                <option value="open">Open</option>
                <option value="request to qc">Request to QC</option>
                <option value="temporary">Temporary</option>
                <option value="monitoring">Monitoring</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-primary font-semibold">Nama</label>
              <Select
                placeholder="Cari..."
                options={options}
                onChange={handleChangePointDepatment}
                className="rounded-lg"
                styles={{
                  control: (provided) => ({
                    ...provided,
                    backgroundColor: '#EBF5FF',
                    borderColor: '#BFDBFE',
                    minHeight: '40px',
                    boxShadow: 'none',
                    '&:hover': {
                      borderColor: '#93C5FD',
                    },
                  }),
                }}
              />
            </div>

            {/* Text Search */}
            <div className="flex flex-col gap-2">
              <p className="text-sm text-primary font-semibold">Cari</p>
              <input
                className="rounded-lg bg-blue-50 border border-blue-200 px-3 h-10 w-full focus:ring-2 focus:ring-blue-300 focus:outline-none"
                placeholder="Kendala / No Jo"
                type="text"
                onChange={(e) => setNoJo(e.target.value)}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-end gap-3">
              <button
                onClick={() => getTiket()}
                className="bg-primary hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg transition-colors flex-1"
              >
                Tampilkan
              </button>
              <button
                onClick={() => prepareExportData()}
                className="bg-green-500 hover:bg-green-600 text-white font-medium px-5 py-2 rounded-lg transition-colors flex-1 disabled:opacity-50"
                disabled={isLoadingPreview}
              >
                {isLoadingPreview ? 'Loading...' : 'Export'}
              </button>
            </div>
          </div>
        </div>

        {/* Export Preview Modal */}
        {showExportPreview && (
          <ModalFull
            isOpen={showExportPreview}
            onClose={() => closeModalExport()}
            judul={'Export Preview'}
          >
            <div className="flex flex-col h-[85vh]">
              <div className="flex justify-between mb-4 px-2 pt-5">
                <div className="text-sm text-gray-500">
                  Total Data: {previewData.length}
                </div>
                <button
                  onClick={exportToExcel}
                  className="bg-blue-500 text-white py-1 px-4 rounded hover:bg-blue-600 font-medium"
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
          </ModalFull>
        )}
      </div>

      {!isMobile && (
        <>
          <div className="flex bg-white mt-2 py-2">
            <p className="px-5 text-xs font-bold ">No</p>
            <div className="grid md:grid-cols-6  w-full">
              <div className="flex gap-2">
                <p className="text-xs font-bold ">Kode Tiket</p>
                <img className="w-2" src={Polygon6} alt="" />
              </div>
              <div className="flex gap-2">
                <p className="text-xs font-bold ">Nama Mesin</p>
                <img className="w-2" src={Polygon6} alt="" />
              </div>
              <div className="flex gap-2 ">
                <p className="text-xs font-bold ">Tanggal Tiket Masuk</p>
                <img className="w-2" src={Polygon6} alt="" />
              </div>
              <div className="flex gap-2">
                <p className="text-xs font-bold ">Tanggal Selesai</p>
                <img className="w-2" src={Polygon6} alt="" />
              </div>
              <div className="flex gap-2">
                <p className="text-xs font-bold ">Jumlah Pengerjaan</p>
                <img className="w-2" src={Polygon6} alt="" />
              </div>
              {/* <div className="flex gap-2">
                                <p className="text-xs font-bold ">Sparepart Digunakan</p>
                                <img className="w-2" src={Polygon6} alt="" />
                            </div> */}
              <div className="flex gap-2 justify-end px-10">
                <p className="text-xs font-bold ">Status</p>
              </div>
            </div>
          </div>
          <div className=" overflow-x-auto">
            <div className="min-w-[700px]">
              {tiket != null &&
                tiket.data.map((data: any, i: any) => {
                  const lengthProses = data.proses_mtcs.length - 1;

                  const waktuSelesaiMtc = convertTimeStampToDateTime(
                    data.proses_mtcs[lengthProses].waktu_selesai_mtc,
                  );

                  const dateMtc = convertTimeStampToDateTime(data.createdAt);
                  const waktuRespon = calculateResponTime(
                    data.waktu_respon_qc == null
                      ? data.createdAt
                      : data.waktu_respon_qc,
                    data.waktu_respon,
                  );

                  const waktuBreakdownMinutes = calculateResponTime2(
                    data.createdAt,
                    data.waktu_selesai,
                  );
                  const waktuBreakdownMTCMinutes = calculateResponTime2(
                    data.waktu_respon_qc,
                    data.waktu_selesai_mtc,
                  );
                  const waktuValidasiQCMinutes = calculateResponTime2(
                    data.createdAt,
                    data.waktu_respon_qc,
                  );
                  const waktuValidasiQC = formatMinutesToHoursMinutesSeconds(
                    waktuValidasiQCMinutes,
                  );
                  const waktuBreakdown = formatMinutesToHoursMinutesSeconds(
                    waktuBreakdownMinutes,
                  );
                  const waktuBreakdownMTC = formatMinutesToHoursMinutesSeconds(
                    waktuBreakdownMTCMinutes,
                  );

                  const qcRespon = calculateResponTime2(
                    data.createdAt,
                    data.waktu_respon_qc,
                  );
                  const qcVerif = calculateResponTime2(
                    data.waktu_selesai_mtc,
                    data.waktu_selesai,
                  );
                  const waktuVerifikasiQCMinutes = calculateResponTime2(
                    data.waktu_selesai_mtc,
                    data.waktu_selesai,
                  );
                  const waktuVerifikasiQC = formatMinutesToHoursMinutesSeconds(
                    waktuVerifikasiQCMinutes,
                  );
                  // Combine qcRespon and qcVerif and format them
                  const waktuBreakdownQCMinutes: any = qcRespon + qcVerif;
                  const waktuBreakdownQC = formatMinutesToHoursMinutesSeconds(
                    waktuBreakdownQCMinutes,
                  );
                  return (
                    <>
                      <div className="my-2">
                        <section className="flex  bg-white  rounded-lg">
                          <div
                            key={i}
                            className=" py-3 px-6 flex justify-center items-center"
                          >
                            {i + 1}
                          </div>
                          <div className="grid  grid-cols-6 w-full  ">
                            <div className="flex flex-col md:gap-5 gap-1 ">
                              <div className="my-auto ">
                                <p className="text-sm font-light break-all">
                                  {data.kode_ticket}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col md:gap-5 gap-1 ">
                              <div className="my-auto">
                                <p className="text-sm font-light">
                                  {data.mesin}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col  md:gap-5 gap-1 ">
                              <div className="my-auto w-11/12">
                                <p className="text-sm font-light">{dateMtc}</p>
                              </div>
                            </div>
                            <div className="flex items-center md:gap-5 gap-1 ">
                              <div className="flex ">{waktuSelesaiMtc}</div>
                            </div>
                            <div className="flex items-center md:gap-5 gap-1  p-2">
                              <div className="flex ">
                                <p className="text-sm px-2  font-light  rounded-xl flex justify-center">
                                  {data.proses_mtcs.length}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2 items-center md:mb-0 mb-2 justify-end px-5">
                              <div>
                                <div>
                                  <div className="flex ">
                                    <p
                                      className={
                                        data.status_tiket == 'pending'
                                          ? `text-sm px-2  font-light  rounded-xl flex justify-center text-[#DE0000] bg-[#FFB1B1] `
                                          : data.status_tiket == 'open'
                                          ? `text-sm px-2  font-light  rounded-xl flex justify-center text-[#FCBF11] bg-[#FFF2B1] `
                                          : data.status_tiket == 'monitoring'
                                          ? `text-sm px-2  font-light  rounded-xl flex justify-center text-[#004CDE] bg-[#B1ECFF] `
                                          : data.status_tiket == 'temporary'
                                          ? `text-sm px-2  font-light  rounded-xl flex justify-center text-[#FC4911] bg-[#de85002a]  `
                                          : `text-sm px-2  font-light  rounded-xl flex justify-center text-[#2EB300] bg-[#00de3f2b]  `
                                      }
                                    >
                                      {data.status_tiket}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <button
                                  title="button"
                                  onClick={() => handleClickDetail(i)}
                                  className="text-xs font-bold text-blue-700 bg-blue-700 py-2 border-blue-700 border rounded-md"
                                >
                                  <img src={Arrow} alt="" className="mx-2" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </section>

                        {showDetail[i] && (
                          <>
                            <div className="w-full flex flex-col bg-[#E9F3FF]  rounded-lg">
                              <div className="flex px-5 py-2">
                                <div className="flex flex-col gap-2 w-2/12">
                                  <p className="text-xs font-bold">
                                    Waktu Tiket Masuk
                                  </p>
                                </div>
                                <div className="grid grid-cols-6 gap-3 w-10/12">
                                  <div className="flex flex-col gap-2">
                                    <h5 className="text-xs font-bold">
                                      Pengerjaan Ke
                                    </h5>
                                  </div>
                                  <div className="flex flex-col gap-2">
                                    <p className="text-xs font-bold">Waktu</p>
                                  </div>
                                  <div className="flex flex-col gap-2">
                                    <p className="text-xs font-bold">
                                      Eksekutor
                                    </p>
                                  </div>

                                  <div className="flex flex-col gap-2">
                                    <p className="text-xs font-bold">
                                      Progress Perbaikan
                                    </p>
                                  </div>
                                  <div className="flex flex-col gap-2">
                                    <p className="text-xs font-bold">
                                      Jenis Perbaikan
                                    </p>
                                  </div>
                                  <div className=""></div>
                                </div>
                              </div>
                              <div className="flex px-5 ">
                                <div className="flex flex-col gap-2 w-2/12">
                                  <div>
                                    <p className="text-xs font-medium">
                                      {dateMtc}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold">
                                      Waktu Respon
                                    </p>
                                    <p className="text-xs font-medium">
                                      {waktuRespon}
                                    </p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-6 gap-3 w-10/12">
                                  {data.proses_mtcs.map(
                                    (proses: any, ii: any) => {
                                      const tglMulaiMtc =
                                        convertTimeStampToDateTime(
                                          proses.waktu_mulai_mtc,
                                        );
                                      return (
                                        <>
                                          <div className="flex flex-col gap-2">
                                            <h5 className="text-xs font-medium">
                                              {ii + 1}
                                            </h5>
                                          </div>
                                          <div className="flex flex-col gap-2">
                                            <p className="text-xs font-medium">
                                              {tglMulaiMtc}
                                            </p>
                                          </div>
                                          <div className="flex flex-col gap-2">
                                            <p className="text-xs font-medium">
                                              {proses.user_eksekutor.nama}
                                            </p>
                                          </div>

                                          <div className="flex flex-col gap-2">
                                            <div className="flex">
                                              <p
                                                className={
                                                  proses.skor_mtc === 100
                                                    ? `text-sm px-2  font-light  rounded-xl flex justify-center text-[#0057FF] bg-[#B1ECFF] `
                                                    : proses.skor_mtc >= 60 &&
                                                      proses.skor_mtc < 100
                                                    ? `text-sm px-2  font-light  rounded-xl flex justify-center text-green-600 bg-[#00de3f2f] `
                                                    : proses.skor_mtc >= 40 &&
                                                      proses.skor_mtc < 60
                                                    ? `text-sm px-2  font-light  rounded-xl flex justify-center text-[#DE0000] bg-[#FFDBB1] `
                                                    : proses.skor_mtc < 40 &&
                                                      proses.skor_mtc >= 0
                                                    ? `text-sm px-2  font-light  rounded-xl flex justify-center text-[#DE0000] bg-[#FFB1B1] `
                                                    : ''
                                                }
                                              >
                                                {proses.skor_mtc}%
                                              </p>
                                            </div>
                                          </div>
                                          <div className="flex flex-col gap-2">
                                            <p className="text-xs font-medium">
                                              {proses.cara_perbaikan}
                                            </p>
                                          </div>
                                          <div className="">
                                            <button
                                              onClick={() =>
                                                openModalDetail(ii)
                                              }
                                              className="text-xs font-bold bg-blue-700 py-1 px-5 text-white rounded-md"
                                            >
                                              Detail
                                            </button>
                                          </div>
                                          {showModalDetail[ii] && (
                                            <ModalDetail
                                              children={undefined}
                                              isOpen={showModalDetail[ii]}
                                              onClose={() =>
                                                closeModalDetail(ii)
                                              }
                                              kendala={data.nama_kendala}
                                              machineName={data.mesin}
                                              tgl={'12/12/24'}
                                              jam={'17.00'}
                                              namaPemeriksa={
                                                proses.user_eksekutor.nama
                                              }
                                              no={'1'}
                                              idTiket={data.id}
                                              kodeLkh={data.kode_lkh}
                                              analisisPenyebab={
                                                `${proses.kode_analisis_mtc}` +
                                                ' - ' +
                                                `${proses.nama_analisis_mtc}`
                                              }
                                              kebutuhanSparepart={
                                                proses.masalah_spareparts
                                              }
                                              tipeMaintenance={
                                                proses.cara_perbaikan
                                              }
                                              catatan={proses.note_mtc}
                                              unit={proses.unit}
                                              bagian={proses.bagian_mesin}
                                            ></ModalDetail>
                                          )}
                                        </>
                                      );
                                    },
                                  )}
                                </div>
                              </div>
                            </div>
                            {data.proses_mtcs?.map(
                              (proses: any, index: any) =>
                                proses.status_proses === 'qc rejected' && (
                                  <tr
                                    key={index}
                                    className=" text-sm px-4 py-4"
                                  >
                                    <td className=" p-2 text-red-400 font-bold">
                                      QC Rejected
                                    </td>
                                    <td className=" p-2 text-center font-medium">
                                      {proses.user_qc?.nama} - {proses.note_qc}
                                    </td>
                                  </tr>
                                ),
                            )}
                            {data.waktu_selesai == null ? (
                              ''
                            ) : (
                              <>
                                <table className="w-full border-collapse font-sans text-xs mx-auto">
                                  <thead>
                                    <tr className="bg-gray-200">
                                      <th className="border border-gray-300 p-2 text-left">
                                        Keterangan
                                      </th>
                                      <th className="border border-gray-300 p-2 text-left">
                                        Detail
                                      </th>
                                      <th className="border border-gray-300 p-2 text-left">
                                        Waktu
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="border-b border-gray-300">
                                      <td className="border border-gray-300 p-2">
                                        Waktu Tiket Masuk
                                      </td>
                                      <td className="border border-gray-300 p-2">
                                        {dateMtc}
                                      </td>
                                      <td className="border border-gray-300 p-2">
                                        -
                                      </td>
                                    </tr>
                                    <tr
                                      className={`border  p-2 ${
                                        waktuValidasiQCMinutes >= 1800
                                          ? 'text-red-500 border-red-500'
                                          : 'border-gray-300'
                                      }`}
                                    >
                                      <td
                                        className={`border border-gray-300 p-2 ${
                                          waktuValidasiQCMinutes >= 1800
                                            ? 'text-red-500'
                                            : ''
                                        }`}
                                      >
                                        Waktu Validasi QC
                                      </td>
                                      <td
                                        className={`border border-gray-300 p-2 ${
                                          waktuValidasiQCMinutes >= 1800
                                            ? 'text-red-500'
                                            : ''
                                        }`}
                                      >
                                        {data.user_respon_qc?.nama} ~{' '}
                                        {convertTimeStampToDateTime(
                                          data.waktu_respon_qc,
                                        )}
                                      </td>
                                      <td
                                        className={`border border-gray-300 p-2 ${
                                          waktuValidasiQCMinutes >= 1800
                                            ? 'text-red-500'
                                            : ''
                                        }`}
                                      >
                                        {waktuValidasiQC}
                                      </td>
                                    </tr>
                                    <tr className="border-b border-gray-300">
                                      <td className="border border-gray-300 p-2">
                                        Waktu Breakdown MTC
                                      </td>
                                      <td className="border border-gray-300 p-2">
                                        {convertTimeStampToDateTime(
                                          data.waktu_mulai_mtc,
                                        )}{' '}
                                        -{' '}
                                        {convertTimeStampToDateTime(
                                          data.waktu_selesai_mtc,
                                        )}{' '}
                                      </td>
                                      <td className="border border-gray-300 p-2">
                                        {' '}
                                        {waktuBreakdownMTC}
                                      </td>
                                    </tr>
                                    <tr
                                      className={`border border-gray-300 p-2 ${
                                        waktuVerifikasiQCMinutes >= 3600
                                          ? 'text-red-500 border-red-500'
                                          : 'border-gray-300'
                                      }`}
                                    >
                                      <td
                                        className={`border border-gray-300 p-2 ${
                                          waktuVerifikasiQCMinutes >= 3600
                                            ? 'text-red-500'
                                            : ''
                                        }`}
                                      >
                                        Waktu Verifikasi QC
                                      </td>
                                      <td
                                        className={`border border-gray-300 p-2 ${
                                          waktuVerifikasiQCMinutes >= 3600
                                            ? 'text-red-500'
                                            : ''
                                        }`}
                                      >
                                        {
                                          data.proses_mtcs?.at(-1)?.user_qc
                                            ?.nama
                                        }{' '}
                                        ~{' '}
                                        {convertTimeStampToDateTime(
                                          data.proses_mtcs?.at(-1)
                                            ?.waktu_selesai,
                                        )}{' '}
                                      </td>
                                      <td
                                        className={`border border-gray-300 p-2 ${
                                          waktuVerifikasiQCMinutes >= 3600
                                            ? 'text-red-500'
                                            : ''
                                        }`}
                                      >
                                        {waktuVerifikasiQC}
                                      </td>
                                    </tr>
                                    <tr className="border-b border-gray-300">
                                      <td className="border border-gray-300 p-2">
                                        Waktu Breakdown
                                      </td>
                                      <td className="border border-gray-300 p-2">
                                        -
                                      </td>
                                      <td className="border border-gray-300 p-2">
                                        {waktuBreakdown}
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </>
                  );
                })}
            </div>
            <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 mt-6 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Rows per page:</span>
                <div className="flex gap-2">
                  {[10, 25, 50, 100].map((pageSize) => (
                    <button
                      key={pageSize}
                      onClick={() => handleLimitChange(pageSize)}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        limit === pageSize
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {pageSize}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Stack spacing={2}>
                  <Pagination
                    count={tiket?.total_page}
                    color="primary"
                    page={page}
                    onChange={(e, i) => {
                      setPage(i);
                      console.log(i);
                    }}
                  />
                </Stack>
              </div>
            </div>
          </div>
        </>
      )}

      {/* =============================================================INI KOMPONEN UNTUK MOBILE========================================== */}
      {isMobile && (
        <>
          <main className="overflow-x-scroll">
            <div className="bg-white mt-2 px-1 grid grid-cols-4 gap-3 py-2">
              <div className="flex gap-[1px] justify-center items-center">
                <p className="text-xs font-bold ">Action</p>
                <img src={Polygon6} alt="" />
              </div>
              <div className="flex gap-[1px] justify-center items-center">
                <p className="text-xs font-bold ">Nama Mesin</p>
                <img src={Polygon6} alt="" />
              </div>
              <div className="flex gap-[1px] justify-center items-center">
                <p className="text-xs font-bold ">Jenis Kendala</p>
                <img src={Polygon6} alt="" />
              </div>
              <div className="flex gap-[1px] justify-center items-center">
                <p className="text-xs font-bold ">Status</p>
                <img src={Polygon6} alt="" />
              </div>
            </div>
            {tiket != null &&
              tiket.data.map((data: any, i: any) => {
                const lengthProses = data.proses_mtcs.length - 1;

                function convertDatetimeToDate(datetime: any) {
                  const dateObject = new Date(datetime);
                  const day = dateObject.getDate().toString().padStart(2, '0'); // Ensure two-digit day
                  const month = (dateObject.getMonth() + 1)
                    .toString()
                    .padStart(2, '0'); // Adjust for zero-based month
                  const year = dateObject.getFullYear();
                  const hours = dateObject
                    .getHours()
                    .toString()
                    .padStart(2, '0');
                  const minutes = dateObject
                    .getMinutes()
                    .toString()
                    .padStart(2, '0');

                  return `${year}/${month}/${day}  ${hours}:${minutes}`; // Example format (YYYY-MM-DD)
                }

                const dateMtc = convertDatetimeToDate(data.createdAt);
                const waktuRespon = calculateResponTime(
                  data.createdAt,
                  data.waktu_respon,
                );
                return (
                  <>
                    <div className="bg-white mt-2 grid grid-cols-4 gap-3 p-2">
                      <div className="flex gap-1">
                        <div>
                          <button
                            title="button"
                            onClick={() => handleClick(i)}
                            className="text-xs px-1 py-2 font-bold bg-blue-700  text-white rounded-sm"
                          >
                            <img src={Burger} alt="" className="mx-1" />
                          </button>
                          {showTwoButtons[i] ? (
                            <div className="absolute bg-white p-3 shadow-5 rounded-md">
                              {' '}
                              {/* Wrap buttons for styling */}
                              <div className="flex flex-col gap-1">
                                <button
                                  onClick={() => {
                                    if (
                                      data.status_tiket == 'open' ||
                                      data.status_tiket == 'pending'
                                    ) {
                                      openModal1(i);
                                    } else {
                                      reworkTiket(data.id);
                                      // ini untuk fungsi rework
                                    }
                                  }}
                                  className=" w-25 text-xs font-bold bg-blue-700 py-2 text-white rounded-md"
                                >
                                  PROSES
                                </button>
                                <button
                                  onClick={openModal2}
                                  className="w-25 text-xs font-bold bg-blue-700 py-2 text-white rounded-md"
                                >
                                  JADWALKAN{' '}
                                </button>
                              </div>
                              {showModal1[i] == true && (
                                <ModalStockCheck1
                                  children={undefined}
                                  isOpen={showModal1[i]}
                                  onClose={() => closeModal1(i)}
                                  onFinish={() => getTiket()}
                                  kendala={data.nama_kendala}
                                  kodeLkh={data.kode_lkh}
                                  machineName={data.mesin}
                                  tgl={data.waktu_respon}
                                  jam={'19.09'}
                                  namaPemeriksa={
                                    data.proses_mtcs[lengthProses]
                                      .user_eksekutor.nama
                                  }
                                  no={'109299'}
                                  idTiket={data.id}
                                  idProses={data.proses_mtcs[lengthProses].id}
                                  namaMesin={data.mesin}
                                  skor_mtc={undefined}
                                  jenis_perbaikan={undefined}
                                  unit={data.proses_mtcs[lengthProses].unit}
                                  bagian={
                                    data.proses_mtcs[lengthProses].bagian_mesin
                                  }
                                />
                              )}
                              {showModal2 && (
                                <ModalMtcDate
                                  isOpen={showModal2}
                                  onClose={closeModal2}
                                  machineName={'GMC Printer 2'}
                                >
                                  <p></p>
                                </ModalMtcDate>
                              )}
                            </div>
                          ) : (
                            ''
                          )}
                        </div>

                        <button
                          title="button"
                          onClick={() => handleClickDetailMobile(i)}
                          className="text-xs h-6 font-bold text-blue-700 bg-blue-700  border-blue-700 border rounded-sm"
                        >
                          <img src={Arrow} alt="" className="mx-1" />
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <p className="text-xs font-medium "> {data.mesin}</p>
                      </div>
                      <div className="flex gap-2">
                        <p className={`text-xs font-medium line-clamp-2 `}>
                          {data.kode_lkh} - {data.nama_kendala}{' '}
                        </p>
                      </div>
                      <div className="flex gap-2 justify-center ">
                        <p
                          className={
                            data.status_tiket === 'closed'
                              ? `text-sm px-2 py-2 font-light  rounded-xl flex justify-center items-center text-green-600 bg-[#00de3f2f] `
                              : 'text-green-600 bg-[#00de3f2f]'
                          }
                        >
                          {data.status_tiket}
                        </p>
                      </div>
                    </div>
                    {showDetailMobile[i] && (
                      <>
                        <div className="w-full grid grid-cols-3 bg-[#E9F3FF]  rounded-lg px-2 gap-x-3 gap-y-3 p-1">
                          <div>
                            <h5 className="text-xs font-bold">
                              Waktu tiket masuk
                            </h5>
                            <p className="text-xs font-medium">{dateMtc}</p>
                          </div>
                          <div>
                            <h5 className="text-xs font-bold">Kode Tiket</h5>
                            <p className="text-xs font-medium"></p>
                          </div>
                          <div>
                            <h5 className="text-xs font-bold">Status</h5>
                            <div className="flex items-center md:gap-5 gap-1 ">
                              <div className="flex ">
                                <p
                                  className={
                                    data.status_tiket == 'pending'
                                      ? `text-xs px-2  font-light  rounded-xl flex justify-center text-[#DE0000] bg-[#FFB1B1] `
                                      : data.status_tiket == 'open'
                                      ? `text-xs px-2  font-light  rounded-xl flex justify-center text-[#DE0000] bg-[#FFB1B1] `
                                      : data.status_tiket == 'monitoring'
                                      ? `text-xs px-2  font-light  rounded-xl flex justify-center text-[#004CDE] bg-[#B1ECFF] `
                                      : data.status_tiket == 'temporary'
                                      ? `text-xs px-2  font-light  rounded-xl flex justify-center text-[#FCBF11] bg-[#FFF2B1]  `
                                      : data.status_tiket == 'closed'
                                      ? `text-xs px-2  font-light  rounded-xl flex justify-center  text-green-600 bg-[#00de3f2f]  `
                                      : ''
                                  }
                                >
                                  {data.status_tiket}{' '}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h5 className="text-xs font-bold">Waktu Respon</h5>
                            <p className="text-xs font-medium">{waktuRespon}</p>
                          </div>
                          <div>
                            <h5 className="text-xs font-bold">Jenis Kendala</h5>
                            <p className="text-xs font-medium">
                              {data.kode_lkh} - {data.nama_kendala}{' '}
                            </p>
                          </div>
                          <div>
                            <h5 className="text-xs font-bold">Jadwal</h5>
                            <p className="text-xs font-medium"></p>
                          </div>
                        </div>
                        <div className="w-full  bg-[#E9F3FF]  rounded-lg px-4 gap-y-3 mt-3 p-1">
                          {data.proses_mtcs.map((proses: any, ii: any) => {
                            const tglMulaiMtc = convertDatetimeToDate(
                              proses.waktu_mulai_mtc,
                            );
                            return (
                              <>
                                <div className="py-3">
                                  <div className="flex w-full gap-4 pb-4">
                                    <div className="flex flex-col">
                                      <h5 className="text-xs font-bold">
                                        Pengerjaan Ke
                                      </h5>
                                      <p className="text-xs font-medium pt-1">
                                        {ii + 1}
                                      </p>
                                    </div>
                                    <div>
                                      <h5 className="text-xs font-bold">
                                        Waktu
                                      </h5>
                                      <p className="text-xs font-medium pt-1">
                                        {tglMulaiMtc}
                                      </p>
                                    </div>
                                    <div className="pl-4">
                                      <h5 className="text-xs font-bold">
                                        Eksekutor
                                      </h5>
                                      <p className="text-xs font-medium pt-1">
                                        {proses.user_eksekutor.nama}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex w-full gap-5">
                                    <div className="">
                                      <div className="">
                                        <button
                                          onClick={() => openModalDetail(ii)}
                                          className="text-xs font-bold bg-blue-700 py-1 px-5 text-white rounded-md"
                                        >
                                          Detail
                                        </button>
                                      </div>
                                      {showModalDetail[ii] && (
                                        <ModalDetail
                                          children={undefined}
                                          isOpen={showModalDetail[ii]}
                                          onClose={() => closeModalDetail(ii)}
                                          kendala={data.nama_kendala}
                                          machineName={data.mesin}
                                          tgl={'12/12/24'}
                                          jam={'17.00'}
                                          namaPemeriksa={
                                            proses.user_eksekutor.nama
                                          }
                                          no={'1'}
                                          idTiket={data.id}
                                          kodeLkh={data.kode_lkh}
                                          analisisPenyebab={
                                            `${proses.kode_analisis_mtc}` +
                                            ' - ' +
                                            `${proses.nama_analisis_mtc}`
                                          }
                                          kebutuhanSparepart={'undefined'}
                                          tipeMaintenance={
                                            proses.cara_perbaikan
                                          }
                                          catatan={proses.note_mtc}
                                          unit={proses.unit}
                                          bagian={proses.bagian_mesin}
                                        ></ModalDetail>
                                      )}
                                    </div>
                                    <div className="flex flex-col">
                                      <h5 className="text-xs font-bold">
                                        Progress Perbaikan
                                      </h5>
                                      <div className="flex w-full pt-1  items-center justify-start">
                                        <p
                                          className={
                                            proses.skor_mtc === 100
                                              ? `text-sm px-4  font-light  rounded-xl flex justify-center items-center text-[#0057FF] bg-[#B1ECFF] `
                                              : proses.skor_mtc >= 60 &&
                                                proses.skor_mtc < 100
                                              ? `text-sm  px-4 font-light  rounded-xl flex justify-center  items-center  text-green-600 bg-[#00de3f2f] `
                                              : proses.skor_mtc >= 40 &&
                                                proses.skor_mtc < 60
                                              ? `text-sm px-4 font-light  rounded-xl flex justify-center  items-center  text-[#DE0000] bg-[#FFDBB1] `
                                              : proses.skor_mtc < 40 &&
                                                proses.skor_mtc >= 0
                                              ? `text-sm px-4 font-light  rounded-xl flex justify-center  items-center text-[#DE0000] bg-[#FFB1B1] `
                                              : ''
                                          }
                                        >
                                          {proses.skor_mtc}%
                                        </p>
                                      </div>
                                    </div>
                                    <div>
                                      <h5 className="text-xs font-bold">
                                        Jenis Perbaikan
                                      </h5>
                                      <p className="text-xs font-medium pt-1">
                                        {proses.cara_perbaikan}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </>
                );
              })}
          </main>
        </>
      )}
    </main>
  );
}

export default HistoryOS2;
