// types/jo.types.ts
export interface SOData {
  tgl_pengiriman: any;
  status_produk: string;
  id_customer: number;
  id: number;
  id_io: number;
  id_kalkulasi: number;
  id_create_so: number | null;
  id_approve_so: number | null;
  id_bom: number | null;
  no_so: string;
  no_io: string;
  customer: string;
  no_po_customer: string;
  produk: string;
  po_qty: number;
  harga_jual: number | null;
  harga: number | null;
  status_jo: string;
  status: string;
  is_active: boolean;
  tgl_pembuatan_so: string;
  alamat_pengiriman: string | null;
  artwork: string | null;
  acuan_warna: string | null;
  ada_standar_warna: string;
  create_by: string | null;
  createdAt: string;
  updatedAt?: string;
  bom: BOMSummary | null;
}

export interface BOMSummary {
  id: number;
  id_io: number;
  id_so: number;
  id_io_mounting: number;
  id_create_bom: number | null;
  id_approve_bom: number | null;
  nama_mounting: string;
  no_bom: string;
  no_io: string;
  no_so: string;
  customer: string;
  produk: string;
  status: string;
  status_bom: string;
  status_proses: string;
  is_active: boolean;
  note_reject: string | null;
  tgl_pembuatan_bom: string;
  tgl_approve_bom: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TahapanData {
  setting_type: number | undefined;
  id?: number;
  id_tahapan_mesin: number;
  id_setting_kapasitas?: number;
  id_drying_time?: number;
  index: number;
  nama_mesin?: any;
  nama_proses?: string;
  nama_setting_kapasitas?: string;
  nama_drying_time?: string;
  value_setting_kapasitas?: number;
  value_drying_time?: number;
  id_io?: number;
  id_io_mounting?: number;
  is_active?: boolean;
  createdAt?: string;
  updatedAt?: string;
  clientId?: any;
}

export interface MountingData {
  id: number;
  id_io: number;
  nama_mounting: string;
  barcode: string;
  format_data: string;
  ukuran_jadi_panjang: number;
  ukuran_jadi_lebar: number;
  ukuran_jadi_tinggi: number;
  ukuran_jadi_terb_panjang: number;
  ukuran_jadi_terb_lebar: number;
  jenis_kertas: string;
  gramature_kertas: number;
  lebar_plano: number;
  panjang_plano: number;
  jumlah_warna: number;
  warna_depan: number;
  warna_belakang: number;
  keterangan_revisi: string;
  id_coating_depan: number;
  id_coating_belakang: number;
  id_kertas: number;
  id_jenis_pons: number;
  id_lem: number;
  id_layout: string;
  merk_coating_depan: string;
  merk_coating_belakang: string;
  keterangan_warna_depan: string;
  keterangan_warna_belakang: string;
  keterangan_jenis_pons: string;
  keterangan_lem: string;
  merk_komp_lem: string;
  merk_serat_kertas: string;
  lebar_layout: number;
  panjang_layout: number;
  ukuran_cetak_panjang_1: number;
  ukuran_cetak_lebar_1: number;
  ukuran_cetak_bagian_1: number;
  ukuran_cetak_isi_1: number;
  ukuran_cetak_panjang_2: number;
  ukuran_cetak_lebar_2: number;
  ukuran_cetak_bagian_2: number;
  ukuran_cetak_isi_2: number;
  isi_dalam_1_pack: number;
  jenis_pack: string;
  keterangan_pack: string;
  is_ukuran_partisi_sekat: boolean;
  lebar_partisi_1: number;
  panjang_partisi_1: number;
  lebar_partisi_2: number;
  panjang_partisi_2: number;
  tambahan_insheet_druk: number;
  lampiran: string;
  untuk: string;
  is_active?: boolean;
  createdAt?: string;
  updatedAt?: string;
  nama_coating_depan?: string;
  nama_coating_belakang?: string;
  nama_kertas?: string;
  nama_jenis_pons?: string;
  nama_lem?: string;
  tahapan?: TahapanData[];
}

export interface JOMounting {
  id?: number;
  id_jo?: number;
  id_io_mounting: number;
  nama_mounting: string; // ADD THIS
  id_kertas: number;
  nama_kertas: string;
  gramature_kertas: number;
  panjang_kertas: number;
  lebar_kertas: number;
  jumlah_kertas: number;
  ukuran_cetak_panjang_1: number;
  ukuran_cetak_lebar_1: number;
  ukuran_cetak_bagian_1: number;
  ukuran_cetak_isi_1: number;
  jumlah_cetak_1: number;
  tambahan_insheet_1: number;
  ukuran_cetak_panjang_2: number;
  ukuran_cetak_lebar_2: number;
  ukuran_cetak_bagian_2: number;
  ukuran_cetak_isi_2: number;
  jumlah_cetak_2: number;
  tambahan_insheet_2: number;
  jumlah_druk_cetak: number;
  jumlah_insheet_cetak: number;
  jumlah_druk_pond: number;
  jumlah_insheet_pond: number;
  jumlah_druk_finishing: number;
  jumlah_insheet_finishing: number;
  total_insheet: number;
  is_selected: boolean;
}
export interface JOFormData {
  id_io: number;
  id_jo?: number;
  id_so: number;
  no_po_customer: string;
  id_customer: number;
  id_produk: number;
  no_jo: string;
  no_io: string;
  no_so: string;
  customer: string;
  produk: string;
  status_kalkulasi: string;
  so?: {
    no_po_customer: string;
    tgl_po_customer: string;
  };
  status_jo: string;
  status_produk: string;
  stok_fg: number;
  qty: number;
  qty_druk: number; // NEW FIELD
  qty_lp: number; // NEW FIELD
  po_qty: number;
  spesifikasi: string;
  keterangan_pengerjaan: string;
  toleransi: string;
  alamat_pengiriman: string;
  tgl_kirim: string;
  standar_warna: string;
  tipe_jo: 'JO PRODUKSI' | 'JO PROOF';
  jo_mounting: JOMounting[];
}

export type JOTipeOption = 'JO PRODUKSI' | 'JO PROOF';
