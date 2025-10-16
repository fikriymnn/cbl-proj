// Types/bomppic.types.ts

// BOM PPIC Kertas
export interface BOMPPICKertas {
  id?: number;
  id_kertas: number;
  nama_kertas: string;
  qty_lembar_plano: number;
  qty_beli: number;
  qty_stok: number;
}

// BOM PPIC Tinta Detail
export interface BOMPPICTintaDetail {
  id_item_tinta: number;
  nama_item_tinta: string;
  persentase_tinta: number;
  qty_tinta: number;
  qty_beli: number;
  qty_stok: number;
}

// BOM PPIC Tinta
export interface BOMPPICTinta {
  id?: number;
  warna_tinta: string;
  id_jenis_tinta: number;
  id_jenis_kertas: number;
  id_jenis_warna_tinta: number;
  jenis_mesin_cetak: string;
  area_cetak: number;
  qty_tinta: number;
  tinta_detail: BOMPPICTintaDetail[];
}

// BOM PPIC Corrugated
export interface BOMPPICCorrugated {
  id?: number;
  id_corrugated: number;
  nama_corrugated: string;
  isi_per_pack: number;
  qty_corrugated: number;
  qty_beli: number;
  qty_stok: number;
}

// BOM PPIC Poliban
export interface BOMPPICPoliban {
  id?: number;
  item_poliban: string;
  isi_satu_ikat: number;
  lembar_poliban: number;
  qty_poliban: number;
  qty_beli: number;
  qty_stok: number;
}

// BOM PPIC Coating
export interface BOMPPICCoating {
  id?: number;
  id_coating_depan: number;
  id_coating_belakang: number;
  nama_coating_depan: string;
  nama_coating_belakang: string;
  qty_coating_depan: number;
  qty_coating_belakang: number;
  uv_wb: number;
  varnish_doff: number;
  qty_beli_coating_depan: number;
  qty_stok_coating_depan: number;
  qty_beli_coating_belakang: number;
  qty_stok_coating_belakang: number;
}

// BOM PPIC Lem
export interface BOMPPICLem {
  id?: number;
  id_lem: number;
  nama_lem: string;
  rumus_lem: string;
  qty_konstanta: number;
  qty_lem: number;
  qty_beli: number;
  qty_stok: number;
}

// BOM Kertas Interface
export interface BOMKertas {
  id?: number;
  id_bom: number;
  id_kertas: number;
  nama_kertas: string;
  qty_kg: number | string;
  qty_lembar: number | string;
  harga_kertas: number | string;
  createdAt?: string;
  updatedAt?: string;
}

// BOM Tinta Interface
export interface BOMTinta {
  id?: number;
  id_bom: number;
  id_tinta: number;
  nama_tinta: string;
  qty_kg: number | string;
  harga_tinta: number | string;
  createdAt?: string;
  updatedAt?: string;
}

// BOM Corrugated Interface
export interface BOMCorrugated {
  id?: number;
  id_bom: number;
  id_corrugated: number;
  nama_corrugated: string;
  qty: number | string;
  satuan: string;
  harga_corrugated: number | string;
  createdAt?: string;
  updatedAt?: string;
}

// BOM Poliban Interface
export interface BOMPoliban {
  id?: number;
  id_bom: number;
  id_poliban: number;
  nama_poliban: string;
  qty: number | string;
  satuan: string;
  harga_poliban: number | string;
  createdAt?: string;
  updatedAt?: string;
}

// BOM Coating Interface
export interface BOMCoating {
  id?: number;
  id_bom: number;
  id_coating: number;
  nama_coating: string;
  qty: number | string;
  harga_coating: number | string;
  createdAt?: string;
  updatedAt?: string;
}

// BOM Lem Interface
export interface BOMLem {
  id?: number;
  id_bom: number;
  id_lem: number;
  nama_lem: string;
  qty: number | string;
  harga_lem: number | string;
  createdAt?: string;
  updatedAt?: string;
}

// BOM Lain-lain Interface
export interface BOMLainLain {
  is_active: boolean;
  harga: number;
  nama_item: string;
  id?: number;
  id_bom: number;
  id_lain_lain: number;
  nama_lain_lain: string;
  qty: number | string;
  satuan: string;
  harga_lain_lain: number | string;
  createdAt?: string;
  updatedAt?: string;
}

// Main BOM Data Interface
export interface BOMData {
  id: number;
  id_io: number;
  id_so: number;
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
  is_bom_ppic_done?: boolean;
  note_reject?: string | null;
  tgl_pembuatan_bom?: string;
  tgl_approve_bom?: string | null;
  tgl_kirim_customer?: string;
  createdAt?: string;
  updatedAt?: string;
  // BOM Components (for initial data)
  bom_kertas?: BOMKertas[];
  bom_tinta?: BOMTinta[];
  bom_corrugated?: BOMCorrugated[];
  bom_poliban?: BOMPoliban[];
  bom_coating?: BOMCoating[];
  bom_lem?: BOMLem[];
  lain_lain?: BOMLainLain[];
  // BOM PPIC Components (for edit mode)
  bom_ppic_kertas?: BOMPPICKertas[];
  bom_ppic_tinta?: BOMPPICTinta[];
  bom_ppic_corrugated?: BOMPPICCorrugated[];
  bom_ppic_poliban?: BOMPPICPoliban[];
  bom_ppic_coating?: BOMPPICCoating[];
  bom_ppic_lem?: BOMPPICLem[];
}

// BOM PPIC Item for list view
export interface BOMPPICItem {
  id: number;
  no_so: string;
  no_io: string;
  customer: string;
  produk: string;
  status_jo: string;
  status_bom: string;
  tgl_pembuatan_so: string;
  tgl_pembuatan_bom: string;
  is_active: boolean;
  bom_ppic: any[]; // Used for checking existence only
}

// BOM PPIC Create/Update Payload
export interface BOMPPICCreatePayload {
  id_io: number;
  id_so: number;
  id_bom: number;
  no_bom_ppic?: string;
  no_io: string;
  no_so: string;
  no_bom: string;
  customer: string;
  produk: string;
  tgl_kirim_customer: string;
  bom_ppic_kertas?: BOMPPICKertas[];
  bom_ppic_tinta?: BOMPPICTinta[];
  bom_ppic_corrugated?: BOMPPICCorrugated[];
  bom_ppic_poliban?: BOMPPICPoliban[];
  bom_ppic_coating?: BOMPPICCoating[];
  bom_ppic_lem?: BOMPPICLem[];
}
