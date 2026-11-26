import * as XLSX from 'xlsx';
import convertTimeStampToDate from './converDateTime';
import convertTimeStampToDateOnly from './convertDate';
import convertDateToTime from './converDateToTime';
import convertTimeStampToAllSecond from './ConverttimestametoAllSecond';

/* ------------------------------ Error ------------------------------ */

export const getErrorMessage = (
  error: any,
  fallback = 'Terjadi kesalahan. Silakan coba lagi.',
): string => {
  const data = error?.response?.data;
  if (typeof data === 'string' && data.trim() && data.length < 300) return data;
  if (data?.msg) return String(data.msg);
  if (data?.message) return String(data.message);
  if (data?.error) return String(data.error);
  if (error?.request && !error?.response) {
    return 'Tidak dapat terhubung ke server.';
  }
  return fallback;
};

/* ------------------------------ Durasi ----------------------------- */

export const getDurationSeconds = (start: any, end: any): number | null => {
  if (!start || !end) return null;
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (isNaN(s) || isNaN(e)) return null;
  return Math.floor((e - s) / 1000);
};

export const formatDuration = (totalSeconds: number | null): string => {
  if (totalSeconds === null || totalSeconds < 0) return '-';
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const parts = [
    h ? `${h} jam` : '',
    m ? `${m} menit` : '',
    s || (!h && !m) ? `${s} detik` : '',
  ].filter(Boolean);
  return parts.join(' ');
};

export const durationBetween = (start: any, end: any) =>
  formatDuration(getDurationSeconds(start, end));

/** Semua durasi tiket dihitung di satu tempat (dipakai detail & export). */
export const getTicketTimings = (ticket: any, process?: any | null) => {
  const selesaiMtc = process?.waktu_selesai_mtc ?? ticket?.waktu_selesai_mtc;
  const selesai = process?.waktu_selesai ?? ticket?.waktu_selesai;
  return {
    selesaiMtc,
    selesai,
    responQc: durationBetween(ticket?.createdAt, ticket?.waktu_respon_qc),
    breakdownMtc: durationBetween(ticket?.waktu_respon_qc, selesaiMtc),
    verifikasiQc: durationBetween(selesaiMtc, selesai),
    breakdownTotal: durationBetween(ticket?.createdAt, selesai),
  };
};

/* ------------------------------ Status ----------------------------- */

export const isPositiveStatus = (status?: string) =>
  status === 'di validasi' || status === 'approved';

/* ------------------------------ Filter ----------------------------- */

export interface HistoryFilters {
  startDate: string;
  endDate: string;
  mesin: string;
  status: string;
  search: string;
}

export const EMPTY_FILTERS: HistoryFilters = {
  startDate: '',
  endDate: '',
  mesin: '',
  status: '',
  search: '',
};

export const cleanParams = (params: Record<string, any>) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, v]) => v !== undefined && v !== null && v !== '',
    ),
  );

export const toApiParams = (f: HistoryFilters) =>
  cleanParams({
    start_date: f.startDate,
    end_date: f.endDate,
    mesin: f.mesin,
    status_qc: f.status,
    search: f.search,
  });

export const toArray = (value: any): any[] =>
  Array.isArray(value) ? value : [];

/* ------------------------------ Export ----------------------------- */

const val = (v: any) => (v === null || v === undefined || v === '' ? '-' : v);
const dt = (v: any) => (v ? convertTimeStampToAllSecond(v) : '-');

const buildRow = (ticket: any, process: any | null) => {
  const p = process ?? {};
  const t = getTicketTimings(ticket, process);
  const createdAt = ticket.createdAt;

  return {
    'Ticket ID': val(ticket.id),
    'Kode Tiket': val(ticket.kode_ticket),
    'Tanggal Tiket': createdAt ? convertTimeStampToDateOnly(createdAt) : '-',
    'Jam Tiket': createdAt ? convertDateToTime(createdAt) : '-',
    'Waktu Tiket Dibuat': createdAt ? convertTimeStampToDate(createdAt) : '-',
    'No JO': val(ticket.no_jo),
    'No SO': val(ticket.no_so),
    'No IO': val(ticket.no_io),
    Item: val(ticket.nama_produk),
    Customer: val(ticket.nama_customer),
    Mesin: val(ticket.mesin),
    Proses: val(ticket.proses),
    Kendala: `${val(ticket.kode_lkh)} - ${val(ticket.nama_kendala)}`,
    'Jenis Kendala': val(ticket.jenis_kendala),
    'Bagian Tiket': val(ticket.bagian_tiket),
    Bagian: val(ticket.bagian),
    Spek: val(ticket.spek),
    Operator: val(ticket.operator),
    QTY: val(ticket.qty),
    'QTY Druk': val(ticket.qty_druk),
    'Status Tiket': val(ticket.status_tiket),
    'Kode Analisis (Tiket)': val(ticket.kode_analisis_mtc),
    'Nama Analisis (Tiket)': val(ticket.nama_analisis_mtc),
    'Jenis Analisis MTC': val(ticket.jenis_analisis_mtc),

    'Process ID': val(p.id),
    'Bagian Mesin': val(p.bagian_mesin),
    Unit: val(p.unit),
    'Cara Perbaikan': val(p.cara_perbaikan),
    'Kode Analisis MTC': val(p.kode_analisis_mtc),
    'Nama Analisis MTC': val(p.nama_analisis_mtc),
    'Note MTC': val(p.note_mtc),
    'Note QC': val(p.note_qc),
    'Note Analisis': val(p.note_analisis),
    'Skor MTC': val(p.skor_mtc),
    'Status Proses': val(p.status_proses),
    'Status QC': val(p.status_qc ?? ticket.status_qc),
    'Is Rework': process ? (p.is_rework ? 'Yes' : 'No') : '-',

    'Eksekutor Nama': val(p.user_eksekutor?.nama),
    'Eksekutor Role': val(p.user_eksekutor?.role),
    'QC Nama': val(p.user_qc?.nama ?? ticket.user_respon_qc?.nama),
    'QC Role': val(p.user_qc?.role ?? ticket.user_respon_qc?.role),

    'Waktu Respon QC': dt(ticket.waktu_respon_qc),
    'Waktu Mulai MTC': dt(p.waktu_mulai_mtc),
    'Waktu Selesai MTC': dt(t.selesaiMtc),
    'Waktu Selesai Total': dt(t.selesai),

    'Durasi Respon QC': t.responQc,
    'Durasi Breakdown MTC': t.breakdownMtc,
    'Durasi Verifikasi QC': t.verifikasiQc,
    'Durasi Breakdown Total': t.breakdownTotal,
  };
};

/** Gabungkan pasangan tiket-proses menjadi baris export, terbaru di atas. */
export const buildExportRows = (
  pairs: Array<{ ticket: any; process: any | null }>,
): Record<string, any>[] =>
  pairs
    .map(({ ticket, process }) => ({
      ts: new Date(ticket?.createdAt ?? 0).getTime() || 0,
      row: buildRow(ticket ?? {}, process),
    }))
    .sort((a, b) => b.ts - a.ts)
    .map(({ row }, i) => ({ No: i + 1, ...row }));

export const buildExportFilename = (prefix: string, f: HistoryFilters) => {
  const d = new Date();
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(d.getDate()).padStart(2, '0')}`;

  const parts = [prefix, date];
  if (f.startDate && f.endDate) parts.push(`${f.startDate}_to_${f.endDate}`);
  if (f.mesin) parts.push(f.mesin);
  if (f.status) parts.push(f.status);
  if (f.search) parts.push(`JO-${f.search}`);

  return `${parts.join('_').replace(/[\\/:*?"<>|\s]+/g, '-')}.xlsx`;
};

export const downloadExcel = (
  rows: Record<string, any>[],
  filename: string,
  sheetName = 'Data',
) => {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet['!cols'] = Object.keys(rows[0] ?? {}).map(() => ({ wch: 20 }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename);
};
