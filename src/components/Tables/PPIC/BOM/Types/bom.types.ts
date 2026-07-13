// types/bom.types.ts
export interface SOData {
  id_kertas: number | undefined;
  id: number;
  id_io: number;
  id_kalkulasi: number;
  id_create_so: number | null;
  id_approve_so: number | null;
  id_bom: number | null;
  no_so: string;
  no_io: string;
  customer: string;
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
  bom: BOMSummary | null; // Nested BOM object
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
  status: string; // e.g., "draft", "approved", "rejected"
  status_bom: string; // e.g., "baru", "repeat", "repeat perubahan"
  status_proses: string; // e.g., "draft", "requested", "approved"
  is_active: boolean;
  note_reject: string | null;
  tgl_pembuatan_bom: string;
  tgl_approve_bom: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BOMKertas {
  id?: any; // ID dari database jika sudah ada
  id_kertas: number;
  nama_kertas: string;
  qty_lembar_plano: number;
  tipe: string;
  is_selected: boolean;
}

export interface TintaDetail {
  id?: any; // ID dari database jika sudah ada
  id_item_tinta: number;
  nama_item_tinta: string;
  persentase_tinta: number;
  qty_tinta_detail?: number;
}

export interface BOMTinta {
  id?: any; // Add ID for existing records
  warna_tinta: string;
  id_jenis_tinta: number;
  id_jenis_kertas: number;
  id_jenis_warna_tinta: number;
  jenis_mesin_cetak: string;
  area_cetak: number;
  qty_tinta: number;
  tinta_detail: TintaDetail[];
}

export interface BOMCorrugated {
  id?: any; // Add ID for existing records
  id_corrugated: number;
  nama_corrugated: string;
  isi_per_pack: number;
  qty_corrugated: number;
  tipe: string;
  is_selected: boolean;
}

export interface BOMCoating {
  id: number | null;
  id_coating: number | null;
  nama_coating: string;
  id_brand: number | null;
  nama_brand: string;
  tipe_coating: 'Depan' | 'Belakang' | '';
  qty_coating: number;
  uv_wb: number;
  varnish_doff: number;
  rumus_coating: string;
  tipe: string;
  is_selected: boolean;
}

export interface BOMPoliban {
  id?: any;
  id_item_poliban: number | null;
  nama_item_poliban: string;
  isi_satu_ikat: number;
  lembar_poliban: number;
  qty_poliban: number;
  tipe: string;
  is_selected: boolean;
}
export interface BOMLem {
  id?: any; // ID from database if exists
  id_lem: number;
  nama_lem: string;
  rumus_lem: string;
  qty_konstanta: number;
  qty_lem: number; // ✅ Single calculated value based on selected formula
  tipe: string;
  is_selected: boolean;
}
export interface BOMLainLain {
  id?: any; // ID from database if exists
  nama_item: string;
  qty: number;
}
export interface BOMData {
  id?: any;
  id_io: number;
  id_so: any;
  id_io_mounting: number;
  id_create_bom?: number | null;
  id_approve_bom?: number | null;
  nama_mounting: string;
  no_bom: string;
  no_io: string;
  no_so: string;
  customer: string;
  produk: string;
  status?: string;
  status_bom?: string;
  status_proses?: string;
  is_active?: boolean;
  note_reject?: string | null;
  tgl_pembuatan_bom?: string;
  tgl_approve_bom?: string | null;
  bom_kertas: BOMKertas[];
  bom_tinta: BOMTinta[];
  bom_corrugated: BOMCorrugated[];
  bom_poliban: BOMPoliban[];
  bom_coating: BOMCoating[];
  bom_lem: BOMLem[];
  lain_lain: BOMLainLain[];
}
