// types/kalkulasi.ts
export interface QtyListItem {
  id?: number;
  qty: number;
  is_selected: boolean;
}

// Base interfaces from HistoryKalkulasi
export interface KalkulasiItem {
  note_kabag?: string | null;
  status_proses: string;
  id: number;
  kode_kalkulasi: string | null;
  status_kalkulasi: string;
  tgl_kalkulasi: string;
  nama_customer: string;
  nama_produk: string;
  qty_kalkulasi: number;
  harga_satuan: number;
  status: string;
  nama_marketing: string;
  spesifikasi: string;
  total_harga_satuan_customer: string | number;
  profit_harga: number;
  harga_produksi: number;
  total_harga: number;
  harga_ppn: number;
  harga_diskon: number;
  diskon: number;
  ukuran_jadi_panjang: number;
  ukuran_jadi_lebar: number;
  ukuran_jadi_tinggi: number;
  ukuran_jadi_terb_panjang: number;
  ukuran_jadi_terb_lebar: number;
  ukuran_cetak_panjang_1: number;
  ukuran_cetak_lebar_1: number;
  ukuran_cetak_bagian_1: number;
  ukuran_cetak_isi_1: number;
  ukuran_cetak_bbs_1: string;
  ukuran_cetak_panjang_2?: number;
  ukuran_cetak_lebar_2?: number;
  ukuran_cetak_bagian_2?: number;
  ukuran_cetak_isi_2?: number;
  ukuran_cetak_bbs_2?: string;
  keterangan_harga?: string;
  keterangan_kerja?: string;
  createdAt?: string;
  updatedAt?: string;
  tipe_kalkulasi?: string;
  label?: string;
  qty_list?: QtyListItem[];
}

export interface LainLainItem {
  id: number;
  id_kalkulasi: number;
  nama_item: string;
  harga: number;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface KalkulasiDetailItem extends KalkulasiItem {
  lain_lain: LainLainItem[];
  kalkulasi_action_user: any[];
  brand_kertas: string;
  finishing_insheet: number;
  harga_pengiriman_awal?: number;
  foil: any;
  gramature_kertas: number;
  harga_area_pengiriman: number;
  harga_foil_manual: number;
  harga_lipat: number;
  harga_packaging: number;
  harga_packing: number;
  harga_pengiriman: number;
  harga_pisau: number;
  harga_plate: number;
  harga_polimer_manual: number;
  harga_potong_jadi: number;
  harga_satuan_ongkos_pons: number;
  harga_spot_foil_manual: number;
  id_area_pengiriman: number;
  id_coating_belakang: number;
  id_coating_depan: number;
  id_customer: number;
  id_jenis_mesin_cetak: number;
  id_jenis_pons: number;
  id_kertas: number;
  id_lem: number;
  id_marketing: number;
  id_mesin_coating_belakang: number;
  id_mesin_coating_depan: number;
  id_mesin_finishing: number;
  id_mesin_lipat: number;
  id_mesin_pons: number;
  id_mesin_potong: number;
  id_packing: number;
  id_produk: number;
  id_user_approve: number | null;
  id_user_create: number;
  is_active: boolean;
  jenis_kertas: string;
  jenis_mesin_cetak: string;
  jenis_packing: string;
  jumlah_harga_cetak: number;
  jumlah_harga_coating_belakang: number;
  jumlah_harga_coating_depan: number;
  jumlah_harga_jual: string;
  jumlah_harga_lem: number;
  jumlah_kirim: number;
  jumlah_warna: number;
  kode_marketing: string;
  lebar_kertas: number;
  lebar_packaging: number;
  lipat: string;
  nama_area_pengiriman: string;
  nama_coating_belakang: string;
  nama_coating_depan: string;
  nama_jenis_pons: string;
  nama_kertas: string;
  nama_lem: string;
  nama_mesin_coating_belakang: string;
  nama_mesin_coating_depan: string;
  nama_mesin_finishing: string;
  nama_mesin_lipat: string;
  nama_mesin_pons: string;
  nama_mesin_potong: string;
  nama_packing: string;
  no_packaging: string;
  note_kabag: string | null;
  ongkos_pons: string;
  ongkos_pons_qty: number;
  panjang_kertas: number;
  panjang_packaging: number;
  persentase_apki_kertas: number;
  persentase_kertas: number;
  plate_cetak: string | null;
  pons_insheet: number;
  potong_jadi: string;
  ppn: number;
  presentase_insheet: number;
  print_insheet: number;
  profit: number;
  profit_harga: number;
  qty_lipat: number | null;
  qty_packing: number;
  qty_potong: number;
  spot_foil: any;
  status_proses: string;
  total_harga_coating: number;
  total_harga_kertas: number;
  total_harga_ongkos_pons: number;
  total_harga_satuan_customer: string;
  total_kertas: number;
  ukuran_jadi_terb_lebar: number;
  ukuran_jadi_terb_panjang: number;
  warna_belakang: number;
  warna_depan: number;
}

// Form data interface for KalkulasiModal
export interface KalkulasiFormData {
  kode_kalkulasi: string;
  id_kalkulasi_previous?: number;
  tgl_kalkulasi: string;
  status_kalkulasi: string;
  id_customer: number;
  id_marketing: number;
  nama_customer: string;
  nama_marketing: string;
  id_produk: number;
  id_area_pengiriman: number;
  qty_kalkulasi: string;
  presentase_insheet: string;
  nama_area_pengiriman: string;
  harga_pengiriman_awal?: string;
  nama_produk: string;
  print_insheet?: string;
  pons_insheet?: string;
  finishing_insheet?: string;
  spesifikasi: string;
  ukuran_jadi_panjang: string;
  ukuran_jadi_lebar: string;
  ukuran_jadi_tinggi: string;
  ukuran_jadi_terb_panjang: string;
  ukuran_jadi_terb_lebar: string;
  ukuran_cetak_panjang_1: string;
  ukuran_cetak_lebar_1: string;
  ukuran_cetak_bagian_1: string;
  ukuran_cetak_isi_1: string;
  ukuran_cetak_bbs_1: string;
  ukuran_cetak_panjang_2: string;
  ukuran_cetak_lebar_2: string;
  ukuran_cetak_bagian_2: string;
  ukuran_cetak_isi_2: string;
  ukuran_cetak_bbs_2: string;
  warna_depan: string;
  warna_belakang: string;
  jumlah_warna: string;
  ppn: string;
  gramature?: any;
  panjangMm?: any;
  lebarMm?: any;
  percentage?: any;
  apki?: number;
  total_kertas?: any;
  total_harga_kertas?: any;
  rawPercentage?: number | string;
  jumlah_harga_cetak?: number;
  jenis_kertas?: any;
  id_kertas?: number | string;
  id_jenis_mesin_cetak?: any;
  id_coating_depan?: any;
  id_coating_belakang?: any;
  id_mesin_coating_depan?: any;
  id_mesin_coating_belakang?: any;
  id_mesin_potong?: string;
  harga_plate?: string;
  jumlah_harga_coating_depan?: number;
  jumlah_harga_coating_belakang?: number;
  total_harga_coating?: number;
  id_jenis_pons?: string;
  id_mesin_pons?: string;
  harga_pisau?: string;
  ongkos_pons?: string;
  ongkos_pons_qty?: string;
  harga_satuan_ongkos_pons?: string;
  total_harga_ongkos_pons?: string;
  lipat?: string;
  id_mesin_lipat?: string;
  qty_lipat?: string;
  harga_lipat?: string;
  potong_jadi?: string;
  qty_potong?: string;
  harga_potong_jadi?: string;
  id_lem?: string;
  jumlah_harga_lem?: string;
  id_mesin_finishing?: string;
  foil?: string;
  spot_foil?: string;
  harga_foil_manual?: string;
  harga_spot_foil_manual?: string;
  harga_polimer_manual?: string;
  panjang_packaging?: string;
  lebar_packaging?: string;
  no_packaging?: string;
  jumlah_kirim?: string;
  harga_packaging?: string;
  harga_pengiriman?: string;
  jenis_packing?: string;
  id_packing?: string;
  qty_packing?: string;
  harga_packing?: string;
  harga_produksi: string;
  profit: string;
  profit_harga: string;
  jumlah_harga_jual: string;
  harga_ppn: string;
  diskon: string;
  harga_diskon: string;
  total_harga: string;
  harga_satuan: string;
  total_harga_satuan_customer: string;
  keterangan_harga: string;
  keterangan_kerja: string;
  lain_lain?: Array<{
    nama_item: string;
    harga: number;
  }>;
  total_harga_lain_lain?: string;
  tipe_kalkulasi?: 'normal' | 'multi' | 'manual';
  label?: string;
  qty_list?: QtyListItem[];
}

// Common API interfaces
export interface ApiResponse<T = any> {
  data: T;
  status_code: number;
  succes: boolean;
}

export interface ApiError {
  message: string;
  status?: number;
}

// Modal prop interfaces - UPDATED
export interface KalkulasiModalProps {
  onClose: () => void;
  onSuccess: () => void;
  kalkulasiType: 'normal' | 'multi' | 'manual';
  copyType?: 'repeat' | 'repeat_perubahan';
  editData?: KalkulasiDetailItem; // NEW
  isEditMode?: boolean; // NEW
}

export interface KalkulasiDetailModalProps {
  data: KalkulasiDetailItem;
  onClose: () => void;
}

// Form component prop interfaces
export interface BasicInfoFormProps {
  formData: KalkulasiFormData;
  onInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  onQtyListChange?: (newList: QtyListItem[]) => void; // Add this
  isReadOnly?: boolean;
  isEditMode?: boolean; // Add this
}

export interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export interface TabContentProps {
  activeTab: string;
  formData: KalkulasiFormData;
  onInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
}

export interface ProfitSidebarProps {
  formData: KalkulasiFormData;
  onInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}
