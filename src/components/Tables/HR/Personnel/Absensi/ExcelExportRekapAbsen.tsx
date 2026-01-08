import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import axios from 'axios';

interface ExcelExportProps {
  filteredAbsen: any[];
  dateFrom: string;
  dateTo: string;
  idDepartment?: string;
  tipePenggajian?: string;
  idDivisi?: string;
  calculateOvertimeHours: (absensiData: any[]) => any;
  calculateTimeMetrics: (absensiData: any[]) => any;
  convertTimeStampToDate: (date: string) => string;
}

const ExcelExportRekapAbsen = ({
  filteredAbsen,
  dateFrom,
  dateTo,
  idDepartment,
  tipePenggajian,
  idDivisi,
  calculateOvertimeHours,
  calculateTimeMetrics,
  convertTimeStampToDate,
}: ExcelExportProps) => {
  // Group attendance by month for violation counting
  const groupAttendanceByMonth = (absensiData: any[]) => {
    const grouped: { [key: string]: any[] } = {};

    absensiData?.forEach((record: any) => {
      if (record.tgl_absen) {
        const monthKey = record.tgl_absen.substring(0, 7);
        if (!grouped[monthKey]) {
          grouped[monthKey] = [];
        }
        grouped[monthKey].push(record);
      }
    });

    return grouped;
  };

  // Calculate violations (pelanggaran) per month
  const calculateMonthlyViolations = (absensiData: any[]) => {
    const attendanceByMonth = groupAttendanceByMonth(absensiData);
    const violationsData: any[] = [];

    const sortedMonths = Object.keys(attendanceByMonth).sort();

    sortedMonths.forEach((monthKey) => {
      const monthRecords = attendanceByMonth[monthKey];
      let monthlyViolationCount = 0;

      monthRecords.sort(
        (a, b) =>
          new Date(a.tgl_absen).getTime() - new Date(b.tgl_absen).getTime(),
      );

      monthRecords.forEach((record: any) => {
        const menitTerlambat = parseFloat(record.menit_terlambat || 0);
        let violationType = '';
        let violationFine = 0;

        if (menitTerlambat > 0) {
          monthlyViolationCount++;

          if (menitTerlambat <= 0.5) {
            violationType = '> 5 menit - 30 menit';

            if (monthlyViolationCount === 1) {
              violationFine = 5000;
            } else if (monthlyViolationCount === 2) {
              violationFine = 15000;
            } else if (monthlyViolationCount === 3) {
              violationFine = 25000;
            } else {
              violationFine = 30000;
            }
          } else {
            violationType = '> 30 menit';

            if (monthlyViolationCount === 1) {
              violationFine = 35000;
            } else if (monthlyViolationCount === 2) {
              violationFine = 40000;
            } else if (monthlyViolationCount === 3) {
              violationFine = 45000;
            } else {
              violationFine = 50000;
            }
          }
        }

        violationsData.push({
          ...record,
          monthKey,
          monthlyViolationCount: menitTerlambat > 0 ? monthlyViolationCount : 0,
          violationType,
          violationFine,
        });
      });
    });

    return violationsData;
  };

  // Calculate total fine for an employee
  const calculateTotalFine = (violationsData: any[]) => {
    return violationsData.reduce((total, record) => {
      return total + (record.violationFine || 0);
    }, 0);
  };

  // Fetch all data without pagination for export
  const fetchAllDataForExport = async () => {
    const url = `${import.meta.env.VITE_API_LINK}/hr/absensiRekap`;
    try {
      const res = await axios.get(url, {
        params: {
          startDate: dateFrom,
          endDate: dateTo,
          idDepartment: idDepartment || undefined,
          tipe_penggajian: tipePenggajian || undefined,
          id_divisi: idDivisi || undefined,
          is_active: true,
          // No page and limit for export
        },
        withCredentials: true,
      });
      return res.data.data || [];
    } catch (error: any) {
      console.error('Error fetching data for export:', error);
      alert('Gagal mengambil data untuk export');
      return [];
    }
  };

  const exportToExcel = async () => {
    if (!filteredAbsen || filteredAbsen.length === 0) {
      alert('Tidak ada data untuk diexport');
      return;
    }

    // Fetch all data for export
    const allDataForExport = await fetchAllDataForExport();

    if (allDataForExport.length === 0) {
      alert('Tidak ada data untuk diexport');
      return;
    }

    // Prepare workbook
    const wb = XLSX.utils.book_new();

    // Prepare employee data with calculations
    const employeeDataWithCalculations = allDataForExport.map(
      (employee: any, empIndex: number) => {
        const overtimeCalc = calculateOvertimeHours(employee.absensi);
        const timeMetrics = calculateTimeMetrics(employee.absensi);
        const violationsData = calculateMonthlyViolations(employee.absensi);
        const totalFine = calculateTotalFine(violationsData);
        const totalViolations = violationsData.filter(
          (v) => v.violationFine > 0,
        ).length;

        return {
          employee,
          overtimeCalc,
          timeMetrics,
          violationsData,
          totalFine,
          totalViolations,
          empIndex,
        };
      },
    );

    // Sort employees by total denda (highest to lowest)
    const sortedEmployeeData = [...employeeDataWithCalculations].sort(
      (a, b) => b.totalFine - a.totalFine,
    );

    // Prepare summary data
    const summaryData: any[] = [];
    summaryData.push(['RINGKASAN TOTAL DENDA KARYAWAN']);
    summaryData.push([
      'Periode',
      `${convertTimeStampToDate(dateFrom)} s/d ${convertTimeStampToDate(
        dateTo,
      )}`,
    ]);
    summaryData.push([]);
    summaryData.push([
      'No',
      'NIK',
      'Nama Karyawan',
      'Department',
      'Divisi',
      'Total Pelanggaran',
      'Total Jam Terlambat',
      'Total Denda (Rp)',
    ]);

    let grandTotalFine = 0;
    let grandTotalViolations = 0;
    let grandTotalJamTerlambat = 0;

    // Store employee worksheets temporarily
    const employeeSheets: Array<{ ws: XLSX.WorkSheet; name: string }> = [];

    sortedEmployeeData.forEach((empData, sortedIndex) => {
      const {
        employee,
        overtimeCalc,
        timeMetrics,
        violationsData,
        totalFine,
        totalViolations,
      } = empData;

      grandTotalFine += totalFine;
      grandTotalViolations += totalViolations;
      grandTotalJamTerlambat += parseFloat(timeMetrics.totalTerlambat);

      // Add to summary
      summaryData.push([
        sortedIndex + 1,
        employee.nik,
        employee.nama_karyawan,
        employee.department,
        employee.divisi,
        totalViolations,
        `${timeMetrics.totalTerlambat} Jam`,
        `Rp ${totalFine.toLocaleString('id-ID')}`,
      ]);

      // Prepare sheet data for individual employee
      const sheetData: any[] = [];

      // Header - Employee Info
      sheetData.push(['REKAP ABSENSI KARYAWAN']);
      sheetData.push([
        'Periode',
        `${convertTimeStampToDate(dateFrom)} s/d ${convertTimeStampToDate(
          dateTo,
        )}`,
      ]);
      sheetData.push([]);
      sheetData.push(['NIK', employee.nik]);
      sheetData.push(['Nama', employee.nama_karyawan]);
      sheetData.push(['Jabatan', employee.jabatan || '-']);
      sheetData.push(['Department', employee.department]);
      sheetData.push(['Divisi', employee.divisi]);
      sheetData.push([]);

      // Summary Section
      sheetData.push(['RINGKASAN']);
      sheetData.push(['Cuti Tahunan', employee.jumlah_hari_cuti_tahunan || 0]);
      sheetData.push(['Cuti Khusus', employee.jumlah_hari_cuti_khusus || 0]);
      sheetData.push(['Izin', employee.jumlah_hari_izin || 0]);
      sheetData.push(['Sakit', employee.jumlah_hari_sakit || 0]);
      sheetData.push(['Mangkir', employee.jumlah_hari_mangkir || 0]);
      sheetData.push([]);

      // Overtime Section
      sheetData.push(['LEMBUR']);
      sheetData.push([
        'Lembur dengan SPL',
        `${overtimeCalc.lemburDenganSPL} Jam`,
      ]);
      sheetData.push([
        'Lembur Libur dengan SPL',
        `${overtimeCalc.lemburLiburDenganSPL} Jam`,
      ]);
      sheetData.push([
        'Lembur tanpa SPL',
        `${overtimeCalc.lemburTanpaSPL} Hari`,
      ]);
      sheetData.push([
        'Lembur Libur tanpa SPL',
        `${overtimeCalc.lemburLiburTanpaSPL} Hari`,
      ]);
      sheetData.push([]);

      // Late Section
      sheetData.push(['KETERLAMBATAN']);
      sheetData.push([
        'Total Jam Terlambat',
        `${timeMetrics.totalTerlambat} Jam`,
      ]);
      sheetData.push([
        'Terlambat ≤ 30 menit',
        `${timeMetrics.terlambatKurangDari30Menit} hari`,
      ]);
      sheetData.push([
        'Terlambat > 30 menit',
        `${timeMetrics.terlambatLebihDari30Menit} hari`,
      ]);
      sheetData.push([
        'Total Hari Terlambat',
        `${timeMetrics.jumlahHariTerlambat} hari`,
      ]);
      sheetData.push([]);

      // Cuti Details
      if (
        employee.cuti_tahunan?.length > 0 ||
        employee.cuti_khusus?.length > 0
      ) {
        sheetData.push(['RIWAYAT CUTI']);

        if (employee.cuti_tahunan?.length > 0) {
          sheetData.push(['Cuti Tahunan']);
          sheetData.push([
            'Dari',
            'Sampai',
            'Jumlah Hari',
            'Alasan',
            'Catatan HR',
          ]);
          employee.cuti_tahunan.forEach((cuti: any) => {
            sheetData.push([
              new Date(cuti.dari).toLocaleDateString('id-ID'),
              new Date(cuti.sampai).toLocaleDateString('id-ID'),
              cuti.jumlah_hari,
              cuti.alasan_cuti,
              cuti.catatan_hr || '-',
            ]);
          });
          sheetData.push([]);
        }

        if (employee.cuti_khusus?.length > 0) {
          sheetData.push(['Cuti Khusus']);
          sheetData.push([
            'Dari',
            'Sampai',
            'Jumlah Hari',
            'Alasan',
            'Catatan HR',
          ]);
          employee.cuti_khusus.forEach((cuti: any) => {
            sheetData.push([
              new Date(cuti.dari).toLocaleDateString('id-ID'),
              new Date(cuti.sampai).toLocaleDateString('id-ID'),
              cuti.jumlah_hari,
              cuti.alasan_cuti,
              cuti.catatan_hr || '-',
            ]);
          });
          sheetData.push([]);
        }
      }

      // Sakit/Izin/Mangkir Details
      if (
        employee.sakit?.length > 0 ||
        employee.izin?.length > 0 ||
        employee.mangkir?.length > 0
      ) {
        sheetData.push(['SAKIT/IZIN/MANGKIR']);

        if (employee.sakit?.length > 0) {
          sheetData.push(['Sakit']);
          sheetData.push(['Dari', 'Sampai', 'Jumlah Hari', 'Catatan HR']);
          employee.sakit.forEach((sakit: any) => {
            sheetData.push([
              new Date(sakit.dari).toLocaleDateString('id-ID'),
              new Date(sakit.sampai).toLocaleDateString('id-ID'),
              sakit.jumlah_hari,
              sakit.catatan_hr || '-',
            ]);
          });
          sheetData.push([]);
        }

        if (employee.izin?.length > 0) {
          sheetData.push(['Izin']);
          sheetData.push([
            'Dari',
            'Sampai',
            'Jumlah Hari',
            'Alasan',
            'Catatan HR',
          ]);
          employee.izin.forEach((izin: any) => {
            sheetData.push([
              new Date(izin.dari).toLocaleDateString('id-ID'),
              new Date(izin.sampai).toLocaleDateString('id-ID'),
              izin.jumlah_hari,
              izin.alasan_izin,
              izin.catatan_hr || '-',
            ]);
          });
          sheetData.push([]);
        }

        if (employee.mangkir?.length > 0) {
          sheetData.push(['Mangkir']);
          sheetData.push(['Tanggal', 'Catatan HR']);
          employee.mangkir.forEach((mangkir: any) => {
            sheetData.push([
              new Date(mangkir.tanggal).toLocaleDateString('id-ID'),
              mangkir.catatan_hr || '-',
            ]);
          });
          sheetData.push([]);
        }
      }

      // Detail Attendance Table Header
      sheetData.push(['DETAIL ABSENSI']);
      sheetData.push([
        'No',
        'Tanggal',
        'Hari',
        'Jam Masuk',
        'Jam Keluar',
        'Shift',
        'Status Absen',
        'Jam Lembur',
        'Jam Istirahat',
        'Menit Terlambat (Jam)',
        'Menit Pulang Cepat (Jam)',
        'Status Lembur',
        'Status SPL',
        'Bulan',
        'Jumlah Pelanggaran',
        'Jenis Pelanggaran',
        'Denda (Rp)',
        'Keterangan',
      ]);

      // Detail Attendance Rows with monthly violation reset
      violationsData.forEach((record: any, index: number) => {
        const keterangan = [];
        if (record.status_masuk) keterangan.push(record.status_masuk);
        if (record.keterangan && record.keterangan !== '-')
          keterangan.push(record.keterangan);

        sheetData.push([
          index + 1,
          record.tgl_masuk || record.tgl_absen || '-',
          record.hari || '-',
          record.jam_masuk && record.jam_masuk !== '0' ? record.jam_masuk : '-',
          record.jam_keluar && record.jam_keluar !== '0'
            ? record.jam_keluar
            : '-',
          record.shift && record.shift !== '0' ? record.shift : '-',
          record.status_absen || '-',
          record.jam_lembur && record.jam_lembur !== '0'
            ? `${record.jam_lembur} jam`
            : '-',
          record.jam_istirahat_lembur && record.jam_istirahat_lembur !== '0'
            ? `${record.jam_istirahat_lembur} jam`
            : '-',
          record.menit_terlambat > 0 ? `${record.menit_terlambat} Jam` : '-',
          record.menit_pulang_cepat > 0
            ? `${record.menit_pulang_cepat} Jam`
            : '-',
          record.status_lembur && record.status_lembur !== '-'
            ? record.status_lembur
            : '-',
          record.status_lembur_spl && record.status_lembur_spl !== '-'
            ? record.status_lembur_spl
            : '-',
          record.monthKey
            ? new Date(record.monthKey + '-01').toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
              })
            : '-',
          record.monthlyViolationCount > 0 ? record.monthlyViolationCount : '-',
          record.violationType || '-',
          record.violationFine > 0
            ? `Rp ${record.violationFine.toLocaleString('id-ID')}`
            : '-',
          keterangan.join(', ') || '-',
        ]);
      });

      // Add Total Denda section BELOW the detail table
      sheetData.push([]);
      sheetData.push(['TOTAL DENDA']);
      sheetData.push(['Total Terlambat', totalViolations]);
      sheetData.push([
        'Total Jam Terlambat',
        `${timeMetrics.totalTerlambat} Jam`,
      ]);
      sheetData.push([
        'Total Denda',
        `Rp ${totalFine.toLocaleString('id-ID')}`,
      ]);

      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet(sheetData);

      // Set column widths
      const colWidths = [
        { wch: 5 },
        { wch: 15 },
        { wch: 10 },
        { wch: 12 },
        { wch: 12 },
        { wch: 10 },
        { wch: 15 },
        { wch: 12 },
        { wch: 15 },
        { wch: 20 },
        { wch: 20 },
        { wch: 15 },
        { wch: 18 },
        { wch: 15 },
        { wch: 20 },
        { wch: 25 },
        { wch: 15 },
        { wch: 30 },
      ];
      ws['!cols'] = colWidths;

      // Store worksheet with employee name
      const sheetName = `${employee.nik}-${employee.nama_karyawan.substring(
        0,
        20,
      )}`;
      employeeSheets.push({ ws, name: sheetName });
    });

    // Add grand total to summary
    summaryData.push([]);
    summaryData.push([
      '',
      '',
      '',
      '',
      'TOTAL KESELURUHAN',
      grandTotalViolations,
      `${grandTotalJamTerlambat.toFixed(1)} Jam`,
      `Rp ${grandTotalFine.toLocaleString('id-ID')}`,
    ]);

    // Create summary worksheet
    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);

    // Set column widths for summary
    const summaryColWidths = [
      { wch: 5 },
      { wch: 15 },
      { wch: 25 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
    ];
    summaryWs['!cols'] = summaryColWidths;

    // Add summary sheet FIRST
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Ringkasan Denda');

    // Then add all employee sheets (already sorted by highest denda)
    employeeSheets.forEach((sheet) => {
      XLSX.utils.book_append_sheet(wb, sheet.ws, sheet.name);
    });

    // Generate Excel file
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });

    // Save file
    const fileName = `Rekap_Absensi_${convertTimeStampToDate(
      dateFrom,
    )}_${convertTimeStampToDate(dateTo)}.xlsx`;
    saveAs(blob, fileName);
  };
  return (
    <button
      onClick={exportToExcel}
      className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      Export ke Excel
    </button>
  );
};
export default ExcelExportRekapAbsen;
