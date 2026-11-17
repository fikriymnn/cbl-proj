import axios from 'axios';

/* ------------------------------------------------------------------ */
/* Client                                                              */
/* ------------------------------------------------------------------ */

// Endpoint baru wajib membawa cookie access_token (withCredentials).
const http = axios.create({
  baseURL: import.meta.env.VITE_API_LINK as string,
  withCredentials: true,
});

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

/** "YYYY-MM-DD HH:mm" (WIB) */
export type Waktu = string;
export type Mode = 'mulai_tetap' | 'selesai_tetap';
export type Peran = 'diubah' | 'ikut' | 'tetap';

export interface Posisi {
  mulai: Waktu;
  selesai: Waktu;
  drying_mulai: Waktu;
  drying_selesai: Waktu;
}

/** Konflik (R1-R5) atau peringatan (R6-R8). `msg` sudah siap tampil. */
export interface Pelanggaran {
  rule: string;
  msg: string;
  id_tahapan?: number;
  tahapan?: string;
  mesin?: string;
  waktu?: Waktu | Waktu[];
  no_jo?: string | null;
  no_booking?: string | null;
  tahapan_lain?: string;
  spare_terpakai_jam?: number;
  detail?: { waktu: Waktu; no_jo: string | null; no_booking: string | null }[];
}

export interface SimTahapan {
  id: number;
  tahapan: string;
  tahapan_ke?: number;
  mesin?: string;
  id_mesin?: number;
  from?: string;
  is_fg?: boolean;
  grup_tgl?: number | null;
  peran: Peran;
  wajib_ikut?: boolean;
  dicentang?: boolean;
  bisa_dicentang?: boolean;
  lama: Posisi;
  baru: Posisi;
  geser_jam?: number;
  slots_baru?: Waktu[];
}

export interface SimParameter {
  mode: Mode;
  kapasitas_per_jam: { lama: number; baru: number };
  drying_time: { lama: number; baru: number };
  durasi_jam: { lama: number; baru: number };
}

export interface SimResult {
  valid: boolean;
  jenis?: string;
  id_tahapan?: number;
  tgl_kirim?: string;
  tgl_target_fg?: string;
  parameter?: SimParameter | null;
  tahapan: SimTahapan[];
  conflicts: Pelanggaran[];
  warnings: Pelanggaran[];
  new_start?: Waktu;
  msg?: string;
}

export interface GeserBody {
  jenis: 'geser';
  new_start: Waktu;
  ikut?: number[];
  is_lembur?: boolean;
}
export interface ParamBody {
  jenis: 'ubah_parameter';
  kapasitas_per_jam?: number;
  drying_time?: number;
  mode?: Mode;
  ikut?: number[];
  is_lembur?: boolean;
}
export type SimBody = GeserBody | ParamBody;

export type SlotStatus =
  | 'kosong'
  | 'lembur'
  | 'di_luar_shift'
  | 'terisi'
  | 'terisi_draft'
  | 'milik_tiket_ini';
export type Zona = 'hijau' | 'kuning' | 'merah' | null;

export interface Slot {
  waktu: Waktu;
  status: SlotStatus;
  zona: Zona;
  no_jo?: string | null;
  no_booking?: string | null;
  tahapan?: string;
}

export interface Availability {
  tahapan: {
    id: number;
    tahapan: string;
    mesin: string;
    id_mesin: number;
    from: string;
    allow_concurrent: boolean;
    durasi_jam: number;
    drying_time: number;
    mulai: Waktu;
    selesai: Waktu;
    drying_mulai: Waktu;
    drying_selesai: Waktu;
  };
  tgl_kirim: string;
  tgl_target_fg: string;
  from: Waktu;
  to: Waktu;
  slots: Slot[];
}

export interface ConflictPerTahapan {
  id_tahapan: number;
  tahapan: string;
  mesin: string;
  jumlah_jam: number;
  no_jo: string[];
}

export interface ConflictsData {
  id_tiket_jadwal_produksi: number;
  ada_bentrok: boolean;
  per_tahapan: ConflictPerTahapan[];
  conflicts: Pelanggaran[];
}

export interface Diselesaikan {
  id_tahapan: number;
  tahapan: string;
  mesin: string;
  dari: Waktu;
  ke: Waktu;
  geser_jam: number;
}

export interface ResolvePreview {
  valid: boolean;
  bisa_disimpan: boolean;
  tgl_kirim?: string;
  tgl_target_fg?: string;
  bentrok_awal: ConflictPerTahapan[];
  diselesaikan: Diselesaikan[];
  belum_terselesaikan: ConflictPerTahapan[];
  tahapan: SimTahapan[];
  conflicts: Pelanggaran[];
  warnings: Pelanggaran[];
}

export interface AdjustLogItem {
  id: number;
  id_tiket_jadwal_produksi: number;
  id_tiket_jadwal_produksi_tahapan: number | null;
  jenis:
    | 'geser'
    | 'ubah_kapasitas'
    | 'ubah_drying'
    | 'ubah_kapasitas_drying'
    | 'selesaikan_bentrok';
  mode: Mode | null;
  nilai_lama: Record<string, any> | null;
  nilai_baru: Record<string, any> | null;
  tahapan_ikut: {
    id: number;
    tahapan: string;
    lama: { mulai: Waktu; selesai: Waktu };
    baru: { mulai: Waktu; selesai: Waktu };
  }[];
  alasan: string;
  id_user: number | null;
  createdAt: string;
}

/** Subset tahapan dari GET /ppic/jadwalProduksi/:id yang dipakai fitur ini. */
export interface TahapRef {
  id: number;
  tahapan: string;
  tahapan_ke?: number;
  mesin?: string;
  from?: string;
  kapasitas_per_jam?: number;
  drying_time?: number;
  produksi_mulai?: string | null;
  produksi_selesai?: string | null;
  drying_mulai?: string | null;
  drying_selesai?: string | null;
  is_diubah_manual?: boolean;
}

/* ------------------------------------------------------------------ */
/* Errors                                                              */
/* ------------------------------------------------------------------ */

export const httpStatus = (e: unknown): number | undefined =>
  axios.isAxiosError(e) ? e.response?.status : undefined;

export const errMsg = (e: unknown, fallback: string): string => {
  if (axios.isAxiosError(e)) {
    const d: any = e.response?.data;
    return d?.msg || d?.message || fallback;
  }
  return fallback;
};

/* ------------------------------------------------------------------ */
/* Endpoints                                                           */
/* ------------------------------------------------------------------ */

const BASE = '/ppic/jadwalProduksi';

export const getAvailability = (
  idTahapan: number,
  params: { from?: Waktu; to?: Waktu; is_lembur?: boolean },
) =>
  http
    .get(`${BASE}/availability/${idTahapan}`, { params })
    .then((r) => r.data.data as Availability);

export const simulate = (idTahapan: number, body: SimBody) =>
  http
    .post(`${BASE}/simulate/${idTahapan}`, body)
    .then((r) => r.data.data as SimResult);

export const suggestSlot = (
  idTahapan: number,
  body: { around?: Waktu; is_lembur?: boolean },
) =>
  http
    .post(`${BASE}/suggestSlot/${idTahapan}`, body)
    .then((r) => r.data.data as SimResult & { new_start: Waktu });

export type ApplyResult =
  | { ok: true; result: SimResult }
  | { ok: false; result: SimResult };

/** 409 = validasi gagal; field hasil ada di level atas response. */
export async function applyChange(
  idTahapan: number,
  body: SimBody & { alasan: string },
): Promise<ApplyResult> {
  try {
    const r = await http.put(`${BASE}/apply/${idTahapan}`, body);
    return { ok: true, result: r.data.data as SimResult };
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 409) {
      return { ok: false, result: e.response.data as SimResult };
    }
    throw e;
  }
}

export const getAdjustLog = (idTiket: number | string) =>
  http
    .get(`${BASE}/adjustLog/${idTiket}`)
    .then((r) => (r.data.data ?? []) as AdjustLogItem[]);

export const getConflicts = (idTiket: number | string) =>
  http
    .get(`${BASE}/conflicts/${idTiket}`)
    .then((r) => r.data.data as ConflictsData);

export const resolvePreview = (idTiket: number | string, isLembur = false) =>
  http
    .post(
      `${BASE}/resolveConflicts/${idTiket}`,
      isLembur ? { is_lembur: true } : {},
    )
    .then((r) => r.data.data as ResolvePreview);

export type ResolveApplyResult =
  | { ok: true; result: ResolvePreview }
  | { ok: false; msg: string };

export async function resolveApply(
  idTiket: number | string,
  alasan: string,
  isLembur = false,
): Promise<ResolveApplyResult> {
  try {
    const r = await http.put(`${BASE}/resolveConflicts/${idTiket}`, {
      alasan,
      ...(isLembur ? { is_lembur: true } : {}),
    });
    return { ok: true, result: r.data.data as ResolvePreview };
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 409) {
      return {
        ok: false,
        msg:
          (e.response.data as any)?.msg ||
          'Tidak ada bentrok yang bisa diselesaikan otomatis',
      };
    }
    throw e;
  }
}

/* ------------------------------------------------------------------ */
/* Time helpers (semua dalam WIB, tanpa konversi zona browser)          */
/* ------------------------------------------------------------------ */

const pad = (n: number) => String(n).padStart(2, '0');
const MON = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

export const DAY_MS = 86_400_000;

export const ymd = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Date lokal tengah malam dari "YYYY-MM-DD" (hanya untuk label & navigasi). */
export const dateFromYmd = (s: string) => {
  const [y, m, d] = s.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
};

/** Jam penuh: "2026-11-18 14:35" -> "2026-11-18 14:00". */
export const floorHour = (s: string) => (s ? `${s.slice(0, 13)}:00` : '');

/** Milidetik "wall clock" (dihitung sebagai UTC supaya bebas DST/zona browser). */
export function parseWaktu(s: string): number {
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/);
  if (!m) return NaN;
  return Date.UTC(+m[1], +m[2] - 1, +m[3], +(m[4] ?? 0), +(m[5] ?? 0));
}

const wibFmt = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Asia/Jakarta',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

/**
 * Normalisasi nilai waktu dari backend ke "YYYY-MM-DD HH:mm" WIB.
 * - ISO UTC dari endpoint lama ("...Z" / offset) dikonversi ke WIB.
 * - String tanpa zona (endpoint baru) dianggap sudah WIB.
 */
export function isoToApi(v?: string | null): Waktu {
  if (!v) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  if (/(Z|[+-]\d{2}:?\d{2})$/.test(v)) {
    const d = new Date(v);
    if (isNaN(d.getTime())) return '';
    return wibFmt.format(d).replace('T', ' ').slice(0, 16);
  }
  return v.replace('T', ' ').slice(0, 16);
}

/** "2026-11-18 14:00" -> "18 Nov 14:00"; tanggal saja -> "18 Nov 2026". */
export function fmtWaktu(s?: string | null): string {
  if (!s) return '-';
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})(?: (\d{2}):(\d{2}))?/);
  if (!m) return s;
  const date = `${+m[3]} ${MON[+m[2] - 1]}`;
  return m[4] ? `${date} ${m[4]}:${m[5]}` : `${date} ${m[1]}`;
}

export function fmtRange(a?: string | null, b?: string | null): string {
  if (!a && !b) return '-';
  if (!a || !b) return fmtWaktu(a || b);
  if (a.slice(0, 10) === b.slice(0, 10)) {
    return `${fmtWaktu(a)} – ${b.slice(11, 16)}`;
  }
  return `${fmtWaktu(a)} – ${fmtWaktu(b)}`;
}

/** Selisih jam mulai baru - lama. Negatif = lebih cepat. */
export function fmtGeser(jam?: number): string {
  if (jam === undefined || jam === null || jam === 0) return 'tidak bergeser';
  return jam < 0 ? `maju ${Math.abs(jam)} jam` : `mundur ${jam} jam`;
}

export const JENIS_LABEL: Record<AdjustLogItem['jenis'], string> = {
  geser: 'Geser jadwal',
  ubah_kapasitas: 'Ubah kapasitas',
  ubah_drying: 'Ubah drying',
  ubah_kapasitas_drying: 'Ubah kapasitas & drying',
  selesaikan_bentrok: 'Selesaikan bentrok',
};
