export interface JOData {
  spesifikasi: string;
  status_proses: string;
  status: any;
  id: number;
  no_jo: string;
  no_so: string;
  no_io: string;
  customer: string;
  produk: string;
  qty: number;
  tgl_kirim: string;
  status_jo: string;
  tipe_jo: string;
  is_active: boolean;
  createdAt: string;
  jo_mounting?: JOMounting[];
}

export interface JOMounting {
  is_selected: unknown;
  id: number;
  id_jo: number;
  id_io_mounting: number;
  id_kertas: number;
  ukuran_cetak_isi_1: number;
  ukuran_cetak_isi_2: number;
  ukuran_cetak_bagian_1: number;
  ukuran_cetak_bagian_2: number;
}

export interface TahapanData {
  id: number;
  id_tahapan: number;
  status: string;
  tahapan: {
    id: number;
    nama_tahapan: string;
    kode_tahapan: string;
  };
}

export interface MesinTahapanResponse {
  id_mesin_tahapan: number;
  mesin: {
    nama_mesin: string;
  };
}

export interface KodeProduksi {
  id: number;
  proses_produksi: string;
  kode: string;
  deskripsi: string;
  id_tahapan_produksi: number;
  id_kriteria_qty_produksi: number | null;
  id_kriteria_qty_qc: number | null;
  id_kriteria_qty_mtc: number | null;
  id_kriteria_waktu_produksi: number | null;
  id_kriteria_waktu_qc: number | null;
  id_kriteria_waktu_mtc: number | null;
  id_kriteria_frekuensi_produksi: number | null;
  id_kriteria_frekuensi_qc: number | null;
  id_kriteria_frekuensi_mtc: number | null;
  id_kategori_kendala: number;
  target_department: number[];
}

export interface LKHProses {
  id: number;
  id_produksi_lkh: number;
  id_produksi_lkh_tahapan: number;
  id_tahapan: number;
  id_mesin: number;
  id_operator: number;
  id_kode_produksi: number;
  kode: string;
  deskripsi: string;
  baik: number;
  rusak_sebagian: number;
  rusak_total: number;
  pallet: number;
  note: string | null;
  status: string;
  waktu_mulai: string;
  waktu_selesai: string | null;
  total_waktu: string | null;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Kendala {
  id: number;
  id_tahapan_produksi: number;
  id_waste_kendala: number;
  proses_produksi: string;
  kode: string;
  deskripsi: string;
  status: 'new' | 'update' | 'delete';
}

export interface WasteData {
  id: number;
  id_tahapan_produksi: number;
  proses_produksi: string;
  kode: string;
  deskripsi: string;
  status: 'new' | 'update' | 'delete';
  kendala: Kendala[];
}

export interface LKHWaste {
  id?: number;
  id_jo: number;
  id_tahapan: number;
  id_mesin: number;
  id_operator: number;
  id_kendala: number;
  kode_kendala: string;
  deskripsi_kendala: string;
  id_waste: number;
  kode_waste: string;
  deskripsi_waste: string;
  total_qty: number;
}

export interface LKHResponse {
  id_produksi_lkh_tahapan: null;
  id: number;
  id_jo: number;
  id_tahapan: number;
  id_mesin: number;
  id_operator: number;
  no_jo: string;
  no_io: string;
  no_so: string;
  customer: string;
  produk: string;
  qty_jo: number;
  qty_druk: number | null;
  spesifikasi: string;
  tgl_kirim: string;
  status: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  produksi_lkh_proses: LKHProses[];
  produksi_lkh_waste?: LKHWaste[];
}

export interface Option {
  value: string;
  label: string;
}

export interface FormData {
  no_jo: string;
  no_io: string;
  nama_customer: string;
  produk: string;
  qty: number;
  spek: string;
  qty_druk: number;
  proses: string;
  mesin: string;
  bagian: string;
  operator: string;
  tanggal: string;
}

export interface ProcessData {
  detail: string;
  baik: number;
  rusak_sebagian: number;
  rusak_total: number;
  pallet: number;
  note: string;
}

export interface WasteProcessData {
  id_waste: string;
  id_kendala: string;
  total_qty: number;
}
