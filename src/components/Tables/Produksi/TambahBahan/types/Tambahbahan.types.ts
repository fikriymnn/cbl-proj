// Shared types for the "Tambah Bahan Persiapan" flow
// Endpoints (base assumed: import.meta.env.VITE_API_LINK):
//   POST   /gudangRM/tambahBahanPersiapan
//   PUT    /gudangRM/tambahBahanPersiapan/approveQc/:id     { note_qc }
//   PUT    /gudangRM/tambahBahanPersiapan/rejectQc/:id      { note_qc }
//   PUT    /gudangRM/tambahBahanPersiapan/approveGudang/:id { note_gudang }
//   PUT    /gudangRM/tambahBahanPersiapan/rejectGudang/:id  { note_gudang }
//
// NOTE: the exact shape of the GET-list response wasn't specified, so the
// fields below are a reasonable superset inferred from the legacy
// TambahBahanQC / TambahBahanPPIC pages plus the create payload you gave.
// Adjust field names to match your real API response if they differ.

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
