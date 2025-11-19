export interface KalkulasiItem {
  id_kalkulasi: number;
  warna_belakang: string;
  nama_kertas: string;
  warna_depan: string;
  id: number;
  status: string;
  status_kalkulasi: string;
  status_proses: string;
  id_customer: number;
  nama_customer: string;
  kode_kalkulasi: string | null;
  kode_marketing: string;
  nama_marketing: string;
  id_marketing: number;
  id_produk: number;
  nama_produk: string;
  qty_kalkulasi: number;
  spesifikasi: string;
  keterangan_kerja: string;
  keterangan_harga: string;
  harga_satuan: number;
  harga_ppn: string;
  harga_diskon: string;
  harga_produksi: string;
  jumlah_harga_jual: string;
  total_harga: string;
  total_harga_satuan_customer: string;
  profit: number;
  profit_harga: string;
  ppn: number;
  diskon: number;

  // kertas
  id_kertas: number;
  jenis_kertas: string;
  brand_kertas: string;
  gramature_kertas: number;
  panjang_kertas: number;
  lebar_kertas: number;
  persentase_kertas: number;
  persentase_apki_kertas: number;
  total_harga_kertas: number;
  total_kertas: number;

  // mesin cetak
  id_jenis_mesin_cetak: number;
  jenis_mesin_cetak: string;
  jumlah_warna: number;
  plate_cetak: string | null;
  harga_plate: number;
  jumlah_harga_cetak: number;

  // coating
  id_coating_depan: number;
  nama_coating_depan: string;
  id_mesin_coating_depan: number;
  nama_mesin_coating_depan: string;
  id_coating_belakang: number;
  nama_coating_belakang: string;
  id_mesin_coating_belakang: number;
  nama_mesin_coating_belakang: string;
  jumlah_harga_coating_depan: number;
  jumlah_harga_coating_belakang: number;
  total_harga_coating: number;

  // finishing
  id_lem: number;
  nama_lem: string;
  jumlah_harga_lem: number;
  id_mesin_finishing: number;
  nama_mesin_finishing: string;
  finishing_insheet: number;

  // pons
  id_jenis_pons: number;
  nama_jenis_pons: string;
  ongkos_pons: string | null;
  ongkos_pons_qty: number;
  harga_satuan_ongkos_pons: number;
  total_harga_ongkos_pons: number;
  pons_insheet: number;
  id_mesin_pons: number;
  nama_mesin_pons: string;

  // potong
  id_mesin_potong: number;
  nama_mesin_potong: string;
  qty_potong: number;
  potong_jadi: string | null;
  harga_potong_jadi: number;

  // lipat
  id_mesin_lipat: number;
  nama_mesin_lipat: string;
  qty_lipat: number | null;
  lipat: string | null;
  harga_lipat: number;

  // foil & spot
  foil: string | null;
  spot_foil: string | null;
  harga_foil_manual: number;
  harga_polimer_manual: number;
  harga_spot_foil_manual: number;

  // packaging & pengiriman
  id_area_pengiriman: number;
  nama_area_pengiriman: string;
  harga_area_pengiriman: number;
  harga_pengiriman: number | null;
  jumlah_kirim: number | null;
  id_packing: number | null;
  nama_packing: string | null;
  jenis_packing: string | null;
  qty_packing: number | null;
  harga_packaging: number | null;
  harga_packing: number | null;
  no_packaging: string | null;
  panjang_packaging: number | null;
  lebar_packaging: number | null;

  // ukuran cetak
  ukuran_cetak_depan: number | undefined;
  ukuran_cetak_belakang: number | undefined;
  ukuran_cetak_isi_1: number;
  ukuran_cetak_isi_2: number;
  ukuran_cetak_bagian_1: number;
  ukuran_cetak_bagian_2: number;
  ukuran_cetak_lebar_1: number;
  ukuran_cetak_panjang_1: number;
  ukuran_cetak_lebar_2: number;
  ukuran_cetak_panjang_2: number;
  ukuran_cetak_bbs_1: string;
  ukuran_cetak_bbs_2: string;

  // ukuran jadi
  ukuran_jadi_panjang: number;
  ukuran_jadi_lebar: number;
  ukuran_jadi_terb_panjang: number;
  ukuran_jadi_terb_lebar: number;
  ukuran_jadi_tinggi: number;

  // audit fields
  createdAt: string;
  updatedAt: string;
  id_user_create: number | null;
  id_user_approve: number;
  is_active: boolean;

  // extras
  note_kabag: string | null;
  tgl_kalkulasi: string;
}

export interface OKPFormData {
  kalkulasi: any;
  id: any;
  no_okp: string;
  status_okp: string;
  tgl_target_marketing: string;
  jenis_pekerjaan: string[];
  id_pisau: string;
  file_spek_customer: string;
  rencana_qty_po: number;
  rencana_tgl_kirim: string;
  status_po: string;
  keterangan_cetak: string;
  tahapan: string[];
  id_kalkulasi: number;
  tgl_pembuatan_okp: string;
  keterangan: string;
  user_create?: {
    id: number;
    nama: string;
    bagian: string;
  };
  user_approve?: {
    id: number;
    nama: string;
    bagian: string;
  };
  okp_proses?: any[];
  label?: string;
}
