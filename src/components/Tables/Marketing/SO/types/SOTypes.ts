// types/SOTypes.ts

// Customer related interfaces
export interface Gudang {
  id: number;
  id_customer: number;
  alamat_gudang: string;
  telepon_gudang: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  alamat_penagihan: any;
  id: number;
  nama_customer: string;
  alamat_kantor: string;
  email: string;
  fax: string;
  kontak_person: string;
  telepon: string;
  npwp: string;
  no_legalitas: string;
  toleransi_pengiriman: string;
  top_faktur: string;
  id_marketing: number;
  id_harga_pengiriman: number;
  kode_marketing: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  gudang: Gudang[];
}

export interface KalkulasiData {
  id: number;
  brand_kertas: string;
  createdAt: string;
  diskon: number;
  finishing_insheet: number;
  foil: string | null;
  gramature_kertas: number;
  harga_area_pengiriman: number;
  harga_diskon: string;
  harga_foil_manual: number;
  harga_lipat: number;
  harga_packaging: string | null;
  harga_packing: string | null;
  harga_pengiriman: string | null;
  harga_pisau: number;
  harga_plate: number;
  harga_polimer_manual: number;
  harga_potong_jadi: number;
  harga_ppn: string;
  harga_produksi: string;
  harga_satuan: number;
  harga_satuan_ongkos_pons: number;
  harga_spot_foil_manual: number;
  id_area_pengiriman: number;
  id_coating_belakang: number;
  id_coating_depan: number;
  id_customer: number;
  id_io: number | null;
  id_jenis_mesin_cetak: number;
  id_jenis_pons: number;
  id_kalkulasi_previous: number | null;
  id_kertas: number;
  id_lem: number;
  id_marketing: number;
  id_mesin_coating_belakang: number;
  id_mesin_coating_depan: number;
  id_mesin_finishing: number;
  id_mesin_lipat: number;
  id_mesin_pons: number;
  id_mesin_potong: number;
  id_okp: number | null;
  id_packing: number | null;
  id_produk: number;
  id_user_approve: number;
  id_user_create: number | null;
  is_active: boolean;
  is_io_active: boolean;
  jenis_kertas: string;
  jenis_mesin_cetak: string;
  jenis_packing: string | null;
  jumlah_harga_cetak: number;
  jumlah_harga_coating_belakang: number;
  jumlah_harga_coating_depan: number;
  jumlah_harga_jual: string;
  jumlah_harga_lem: number;
  jumlah_kirim: number | null;
  jumlah_warna: number;
  keterangan_harga: string;
  keterangan_kerja: string;
  kode_kalkulasi: string | null;
  kode_marketing: string;
  lebar_kertas: number;
  lebar_packaging: number | null;
  lipat: string;
  nama_area_pengiriman: string;
  nama_coating_belakang: string;
  nama_coating_depan: string;
  nama_customer: string;
  nama_jenis_pons: string;
  nama_kertas: string;
  nama_lem: string;
  nama_marketing: string;
  nama_mesin_coating_belakang: string;
  nama_mesin_coating_depan: string;
  nama_mesin_finishing: string;
  nama_mesin_lipat: string;
  nama_mesin_pons: string;
  nama_mesin_potong: string;
  nama_packing: string | null;
  nama_produk: string;
  no_io: string | null;
  no_okp: string | null;
  no_packaging: string | null;
  note_kabag: string | null;
  ongkos_pons: string;
  ongkos_pons_qty: number;
  panjang_kertas: number;
  panjang_packaging: number | null;
  persentase_apki_kertas: number;
  persentase_kertas: number;
  plate_cetak: string | null;
  pons_insheet: number;
  potong_jadi: string;
  ppn: number;
  presentase_insheet: number;
  print_insheet: number;
  profit: number;
  profit_harga: string;
  qty_kalkulasi: number;
  qty_lipat: number | null;
  qty_packing: number | null;
  qty_potong: number;
  spesifikasi: string;
  spot_foil: string | null;
  status: string;
  status_kalkulasi: string;
  status_proses: string;
  tgl_kalkulasi: string;
  total_harga: string;
  total_harga_coating: number;
  total_harga_kertas: number;
  total_harga_ongkos_pons: number;
  total_harga_satuan_customer: string;
  total_kertas: number;
  ukuran_cetak_bagian_1: number;
  ukuran_cetak_bagian_2: number;
  ukuran_cetak_bbs_1: string;
  ukuran_cetak_bbs_2: string;
  ukuran_cetak_isi_1: number;
  ukuran_cetak_isi_2: number;
  ukuran_cetak_lebar_1: number;
  ukuran_cetak_lebar_2: number;
  ukuran_cetak_panjang_1: number;
  ukuran_cetak_panjang_2: number;
  ukuran_jadi_lebar: number;
  ukuran_jadi_panjang: number;
  ukuran_jadi_terb_lebar: number;
  ukuran_jadi_terb_panjang: number;
  ukuran_jadi_tinggi: number;
  updatedAt: string;
  warna_belakang: number;
  warna_depan: number;
  customer: Customer;
  label?: string;
}

export interface OkpData {
  id: number;
  id_kalkulasi: number;
  kalkulasi: KalkulasiData;
}

export interface IOData {
  id: number;
  id_okp: number;
  id_create_io: number;
  id_approve_io: number | null;
  tgl_approve_io: string | null;
  createdAt: string;
  customer: string;
  is_active: boolean;
  is_revisi: boolean;
  no_io: string;
  note_reject: string | null;
  okp: OkpData;
  produk: string;
  revisi_no_io: string;
  status: string;
  status_io: string;
  status_proses: string;
  status_send_proof: string;
  tgl_pembuatan_io: string;
  updatedAt: string;
}

// User interface for perubahan data
export interface UserData {
  id: number;
  uuid: string;
  id_karyawan: number | null;
  id_role: number;
  nama: string;
  no: string;
  email: string;
  password: string;
  role: string;
  status: string;
  bagian: string;
  divisi_bawahan: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PerubahanTglKirim {
  id: number;
  id_so: number;
  id_user_create: number;
  id_user_approve: number | null;
  id_user_reject: number | null;
  no_so: string;
  tgl_awal: string;
  tgl_perubahan: string;
  note: string;
  note_reject: string | null;
  status: 'requested' | 'approved' | 'rejected' | 'history';
  tgl_approve: string | null;
  tgl_reject: string | null;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  user_create?: UserData;
  user_approve?: UserData | null;
  user_reject?: UserData | null;
}

export interface SOPerubahanHarga {
  id: number;
  id_so: number;
  id_user_create: number;
  id_user_approve: number | null;
  id_user_reject: number | null;
  no_so: string;
  harga_awal: number;
  harga_perubahan: number;
  note: string;
  note_reject: string | null;
  status: 'requested' | 'approved' | 'rejected' | 'history';
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  user_create?: UserData;
  user_approve?: UserData | null;
  user_reject?: UserData | null;
}

export interface SOData {
  id_customer: any;
  so_perubahan_tgl_kirim?: PerubahanTglKirim[];
  so_perubahan_harga?: SOPerubahanHarga[];
  status_work: string;
  create_by: string;
  alamat_penagihan: string;
  note: string;
  status_pemesanan: string;
  ppic: any;
  kirim_semua: any;
  nama_marketing: any;
  partial: any;
  harga: any;
  artwork: any;
  acuan_warna: any;
  id_kalkulasi: any;
  id: number;
  no_so: string;
  no_io: string;
  no_po_customer: string;
  customer: string;
  produk: string;
  tgl_input_po: string;
  tgl_acc_customer: string;
  tgl_po_customer: string;
  tgl_pengiriman: string;
  tgl_pembuatan_so: string;
  tgl_approve_so: string | null;
  harga_jual: number;
  po_qty: number;
  ppn: any;
  profit: number;
  total_harga: number;
  status: string;
  status_jo: string;
  status_produk: string;
  status_proses?: string;
  ada_standar_warna: string;
  alamat_pengiriman: string;
  keterangan: string;
  is_active: boolean;
  id_io: number;
  id_create_so: number | null;
  id_approve_so: number | null;
  id_so_cancel: number | null;
  so_cancel: string | null;
  note_reject: string | null;
  createdAt: string;
  updatedAt: string;
  is_io_selesai: any;
  no_booking: any;
  is_so_kanban: any;
  label?: string;
  job_order?: {
    no_jo: string;
  };
  user_approve?: {
    nama: string;
  };
}

export interface SOFormData {
  no_so: string;
  is_so_kanban: boolean;
  tgl_input_po: string;
  id_kalkulasi: any;
  id_so_cancel: any;
  so_cancel: string;
  no_booking: string;
  status_jo: string;
  label?: string;
  customer: string;
  produk: string;
  status_produk: string;
  tgl_acc_customer: string;
  tgl_po_customer: string;
  po_qty: number;
  harga_jual: number;
  total_harga: number;
  no_po_customer: string;
  keterangan: string;
  ppn: string;
  profit: number;
  alamat_penagihan: string;
  tgl_pengiriman: string;
  alamat_pengiriman: string;
  ada_standar_warna: string;
  is_io_selesai: boolean;
  note_cancel?: string;
}

export interface APIResponse<T> {
  total_page: any;
  succes: boolean;
  status_code: number;
  data: T;
}
