// Shared types for the "Tambah Bahan Persiapan" flow
// Endpoints (base assumed: import.meta.env.VITE_API_LINK):
//   POST   /gudangRM/tambahBahanPersiapan
//   PUT    /gudangRM/tambahBahanPersiapan/approveQc/:id     { note_qc }
//   PUT    /gudangRM/tambahBahanPersiapan/rejectQc/:id      { note_qc }
//   PUT    /gudangRM/tambahBahanPersiapan/approveGudang/:id { note_gudang }
//   PUT    /gudangRM/tambahBahanPersiapan/rejectGudang/:id  { note_gudang }
//   GET    /gudangRM/tambahBahanPemakaian?id_jo=<id>
//   PUT    /gudangRM/tambahBahanPemakaian/:id               { tambah_bahan_defect }
//
// NOTE: field names for the GET-list responses are inferred from context;
// adjust to match your real API response if they differ.

export const TAMBAH_BAHAN_STATUS_LIST = [
  'request qc',
  'approve qc',
  'approve gudang',
  'reject qc',
  'reject gudang',
  'done',
] as const;

export type TambahBahanStatus = (typeof TAMBAH_BAHAN_STATUS_LIST)[number];

export const STATUS_TIKET_LIST = ['incoming', 'history'] as const;
export type StatusTiket = (typeof STATUS_TIKET_LIST)[number];

export interface JOMounting {
  id: number;
  id_jo: number;
  id_kertas: number;
  nama_kertas: string;
  is_selected: unknown;
}

export interface JOData {
  id: number;
  no_jo: string;
  no_io: string;
  no_so?: string;
  customer: string;
  produk: string;
  qty: number;
  jo_mounting?: JOMounting[];
}

export interface Option {
  value: string;
  label: string;
}

export interface TambahBahanPersiapan {
  id: number;
  id_jo: number;
  no_jo?: string;
  customer?: string;
  produk?: string;
  id_kertas: number;
  nama_kertas?: string;
  qty_tambah_bahan: number;
  note: string;
  note_qc?: string | null;
  note_gudang?: string | null;
  status: TambahBahanStatus | string;
  status_tiket?: StatusTiket | string;
  operator?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TambahBahanCreatePayload {
  id_jo: number;
  id_kertas: number;
  qty_tambah_bahan: number;
  note: string;
}

export interface TambahBahanQcActionPayload {
  note_qc: string;
}

export interface TambahBahanGudangActionPayload {
  note_gudang: string;
}

export interface APIResponse<T> {
  succes?: boolean;
  success?: boolean;
  data: T;
  message?: string;
}

// ---- Tambah Bahan "Pemakaian" (used from InputLKH, Cetak tahapan) ----
export interface TambahBahanPersiapanRecord {
  id: number;
  id_jo: number;
  id_kertas: number;
  id_user_gudang: number | null;
  id_user_qc: number | null;
  id_user_request: number;
  is_active: boolean;
  nama_kertas: string;
  no_jo: string;
  note: string;
  note_gudang: string | null;
  note_qc: string | null;
  qty_pakai_tambah_bahan: number;
  qty_tambah_bahan: number;
  status: TambahBahanStatus | string;
  status_tiket: StatusTiket | string;
  tgl_request: string;
  createdAt: string;
  updatedAt: string;
}
export interface TambahBahanPemakaianItem {
  id: number;
  id_jo: number;
  no_jo?: string;
  id_kertas: number;
  nama_kertas: string;
  qty_tambah_bahan: number; // originally requested/approved qty
  note_qc?: string | null;
  qty_terpakai: number;
  qty_sisa: number;
}

export interface TambahBahanDefectItem {
  id_kode_produksi: number;
  kode: string;
  deskripsi: string;
  qty_tambah_bahan: number;
}

export interface TambahBahanPemakaianSubmitPayload {
  tambah_bahan_defect: TambahBahanDefectItem[];
}

export interface KendalaHistoryItem {
  id_kode_produksi: number;
  kode: string;
  deskripsi: string;
  frequency: number;
}
export interface TambahBahanDefectItem {
  id_kode_produksi: number;
  kode: string;
  deskripsi: string;
  qty_tambah_bahan: number;
}

export interface TambahBahanPemakaianSubmitPayload {
  tambah_bahan_defect: TambahBahanDefectItem[];
}

export interface KendalaHistoryItem {
  id_kode_produksi: number;
  kode: string;
  deskripsi: string;
  frequency: number;
}
// ---- Tambah Bahan "Pemakaian" (new ticket type, request → QC → Gudang) ----

export interface TambahBahanPemakaianDefect {
  id: number;
  id_tambah_bahan_pemakaian: number;
  id_kode_produksi: number;
  kode: string;
  deskripsi: string;
  qty_tambah_bahan: number;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TambahBahanPemakaian {
  id: number;
  id_jo: number;
  id_kertas: number;
  no_jo?: string;
  customer?: string;
  produk?: string;
  nama_kertas?: string;
  qty_tambah_bahan: number;
  qty_tambah_bahan_qc?: number | null;
  qty_tambah_bahan_gudang?: number | null;
  note: string;
  note_qc?: string | null;
  note_gudang?: string | null;
  status: TambahBahanStatus | string;
  status_tiket?: StatusTiket | string;
  tgl_request?: string;
  createdAt: string;
  updatedAt?: string;
  tambah_bahan_pemakaian_defect?: TambahBahanPemakaianDefect[];
}

export interface TambahBahanPemakaianCreatePayload {
  id_jo: number;
  id_kertas: number;
  qty_tambah_bahan: number;
  note: string;
  tambah_bahan_defect: TambahBahanDefectItem[];
}

export interface TambahBahanPemakaianQcApprovePayload {
  note_qc: string;
  qty_tambah_bahan_qc: number;
}
export interface TambahBahanPemakaianQcRejectPayload {
  note_qc: string;
}
export interface TambahBahanPemakaianGudangApprovePayload {
  note_gudang: string;
  qty_tambah_bahan_gudang: number;
}
export interface TambahBahanPemakaianGudangRejectPayload {
  note_gudang: string;
}

// ---- Shared "get by id" detail shapes (persiapan + pemakaian) ----

export interface JobOrderDetailRef {
  id: number;
  no_jo: string;
  no_io: string;
  no_so?: string;
  customer: string;
  produk: string;
  qty: number;
  spesifikasi?: string;
  tgl_kirim?: string;
  [key: string]: any;
}

export interface DetailKertasRef {
  id: number;
  nama_barang: string;
  kategori?: string;
  gramatur?: number;
  panjang?: number;
  lebar?: number;
  warehouse?: string;
  [key: string]: any;
}

export interface UserRef {
  id: number;
  nama: string;
  email?: string;
  bagian?: string;
  role?: string;
  [key: string]: any;
}

export interface TambahBahanPersiapanUsageDefect {
  id: number;
  id_tambah_bahan_persiapan: number;
  id_kode_produksi: number;
  kode: string;
  deskripsi: string;
  qty_tambah_bahan: number;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TambahBahanPersiapanDetail extends TambahBahanPersiapan {
  qty_pakai_tambah_bahan?: number;
  job_order?: JobOrderDetailRef;
  detail_kertas?: DetailKertasRef;
  user_request?: UserRef;
  user_qc?: UserRef;
  user_gudang?: UserRef;
  tambah_bahan_persiapan_defect?: TambahBahanPersiapanUsageDefect[];
}

export interface TambahBahanPemakaianDetail extends TambahBahanPemakaian {
  job_order?: JobOrderDetailRef;
  detail_kertas?: DetailKertasRef;
  user_request?: UserRef;
  user_qc?: UserRef;
  user_gudang?: UserRef;
  tambah_bahan_pemakaian_defect?: TambahBahanPemakaianDefect[];
}
