// types/mounting.ts

// Add the TahapanData interface
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

// types/mounting.ts
export interface MountingFormData {
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
  isi_salam_1_pack: number;
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
  tahapan?: TahapanData[]; // Add this line
}

export interface MountingData extends MountingFormData {
  id: number;
  is_active?: boolean;
  createdAt?: string;
  updatedAt?: string;
  id_io?: number;
  nama_coating_depan?: string;
  nama_coating_belakang?: string;
  nama_kertas?: string;
  nama_jenis_pons?: string;
  nama_lem?: string;
  tahapan?: TahapanData[]; // Replace any[] with TahapanData[]
}
