export const TAMBAH_BAHAN_STATUS_LIST = [
  'request qc',
  'approve qc',
  'request qc pemakaian',
  'approve gudang',
  'reject qc',
  'reject gudang',
  'done',
] as const;

export type TambahBahanStatus = (typeof TAMBAH_BAHAN_STATUS_LIST)[number];

export const STATUS_TIKET_LIST = ['incoming', 'history'] as const;
export type StatusTiket = (typeof STATUS_TIKET_LIST)[number];

export interface IoMounting {
  id: number;
  isi_dalam_1_pack: number;
  nama_mounting: string;
  ukuran_cetak_isi_1: number;
  ukuran_cetak_isi_2: number;
}

export interface JOMounting {
  id: number;
  id_jo?: number;
  id_io_mounting?: number;
  id_kertas: number;
  nama_kertas: string;
  is_selected: unknown;
  io_mounting?: IoMounting;
  ukuran_cetak_isi_1?: number;
  ukuran_cetak_isi_2?: number;
  ukuran_cetak_bagian_1?: number;
  ukuran_cetak_bagian_2?: number;
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
  qty_tambah_bahan_lp: number;
  qty_tambah_bahan_druk: number;
  note: string;
  note_qc?: string | null;
  note_qc_pemakaian?: string | null;
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
  qty_tambah_bahan_lp: number;
  qty_tambah_bahan_druk: number;
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
