// Types/bomppic.types.ts

// BOM PPIC Kertas
export interface BOMPPICKertas {
  id?: number;
  id_bom?: number;
  id_kertas: number;
  id_jenis_kertas?: number;
  nama_kertas: string;
  qty_lembar_plano: number;
  qty_beli: number;
  qty_stok: number;
  createdAt?: string;
  updatedAt?: string;
  is_active?: boolean;
}

// BOM PPIC Tinta Detail
export interface BOMPPICTintaDetail {
  id?: number;
  id_bom_tinta?: number;
  id_item_tinta: number;
  nama_item_tinta: string;
  persentase_tinta: number;
  qty_tinta: number;
  qty_beli: number;
  qty_stok: number;
  createdAt?: string;
  updatedAt?: string;
}

// BOM PPIC Tinta
export interface BOMPPICTinta {
  id?: number;
  id_bom?: number;
  warna_tinta: string;
  id_jenis_tinta: number;
  id_jenis_kertas: number;
  id_jenis_warna_tinta: number;
  jenis_mesin_cetak: string;
  area_cetak: number;
  qty_tinta: number;
  tinta_detail: BOMPPICTintaDetail[];
  createdAt?: string;
  updatedAt?: string;
  is_active?: boolean;
}

// BOM PPIC Corrugated
export interface BOMPPICCorrugated {
  id?: number;
  id_bom?: number;
  id_corrugated: number;
  nama_corrugated: string;
  isi_per_pack: number;
  qty_corrugated: number;
  qty_beli: number;
  qty_stok: number;
  createdAt?: string;
  updatedAt?: string;
  is_active?: boolean;
}

// BOM PPIC Poliban
export interface BOMPPICPoliban {
  id?: number;
  id_bom?: number;
  id_poliban: number;
  item_poliban: string;
  isi_satu_ikat: number;
  lembar_poliban: number;
  qty_poliban: number;
  qty_beli: number;
  qty_stok: number;
  createdAt?: string;
  updatedAt?: string;
  is_active?: boolean;
}

// BOM PPIC Coating
export interface BOMPPICCoating {
  id_coating: number;
  nama_coating: string;
  qty_coating: number;
  uv_wb: number;
  varnish_doff: number;
  qty_beli: number;
  qty_stok: number;
}
// BOM PPIC Lem
export interface BOMPPICLem {
  id?: number;
  id_bom?: number;
  id_lem: number;
  nama_lem: string;
  rumus_lem: string;
  qty_konstanta: number;
  qty_lem: number;
  qty_beli: number;
  qty_stok: number;
  createdAt?: string;
  updatedAt?: string;
  is_active?: boolean;
}

// BOM Kertas Interface
export interface BOMKertas {
  id?: number;
  id_bom?: number;
  id_kertas: number;
  id_jenis_kertas?: number;
  nama_kertas: string;
  qty_kg?: number | string;
  qty_lembar?: number | string;
  qty_lembar_plano?: number | string;
  harga_kertas?: number | string;
  createdAt?: string;
  updatedAt?: string;
  is_active?: boolean;
}

// BOM Tinta Interface
export interface BOMTinta {
  id?: number;
  id_bom?: number;
  id_tinta?: number;
  id_jenis_tinta: number;
  id_jenis_kertas: number;
  id_jenis_warna_tinta: number;
  nama_tinta?: string;
  warna_tinta?: string;
  jenis_mesin_cetak?: string;
  area_cetak?: number;
  qty_kg?: number | string;
  qty_tinta?: number;
  harga_tinta?: number | string;
  tinta_detail?: BOMPPICTintaDetail[];
  createdAt?: string;
  updatedAt?: string;
  is_active?: boolean;
}

// BOM Corrugated Interface
export interface BOMCorrugated {
  id?: number;
  id_bom?: number;
  id_corrugated: number;
  nama_corrugated: string;
  isi_per_pack?: number;
  qty?: number | string;
  qty_corrugated?: number;
  satuan?: string;
  harga_corrugated?: number | string;
  createdAt?: string;
  updatedAt?: string;
  is_active?: boolean;
}

// BOM Poliban Interface
export interface BOMPoliban {
  id?: number;
  id_bom?: number;
  id_poliban: number;
  nama_poliban?: string;
  item_poliban?: string;
  isi_satu_ikat?: number;
  lembar_poliban?: number;
  qty?: number | string;
  qty_poliban?: number;
  satuan?: string;
  harga_poliban?: number | string;
  createdAt?: string;
  updatedAt?: string;
  is_active?: boolean;
}

// BOM Coating Interface
export interface BOMCoating {
  id?: number;
  id_bom?: number;
  id_coating: number;
  nama_coating: string;
  tipe_coating?: 'Depan' | 'Belakang';
  qty?: number | string;
  qty_coating?: number;
  uv_wb?: number;
  varnish_doff?: number;
  harga_coating?: number | string;
  tipe?: string;
  is_selected?: boolean;
  createdAt?: string;
  updatedAt?: string;
  is_active?: boolean;
}

// BOM Lem Interface
export interface BOMLem {
  id?: number;
  id_bom?: number;
  id_lem: number;
  nama_lem: string;
  rumus_lem?: string;
  qty_konstanta?: number;
  qty?: number | string;
  qty_lem?: number;
  harga_lem?: number | string;
  createdAt?: string;
  updatedAt?: string;
  is_active?: boolean;
}

// BOM Lain-lain Interface
export interface BOMLainLain {
  id?: number;
  id_bom?: number;
  id_lain_lain?: number;
  nama_item: string;
  nama_lain_lain?: string;
  qty?: number | string;
  satuan?: string;
  harga: number;
  harga_lain_lain?: number | string;
  is_active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// User Interface (for creator/approver info)
export interface User {
  id: number;
  uuid: string;
  id_karyawan?: number | null;
  id_role: number;
  nama: string;
}

// Main BOM Data Interface
export interface BOMData {
  id?: number;
  id_io: number;
  id_so: number;
  id_io_mounting: number;
  id_jo?: number;
  id_create_bom?: number | null;
  id_approve_bom?: number | null;
  nama_mounting: string;
  no_bom: string;
  no_io: string;
  no_so: string;
  no_jo?: string;
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

  // User relationships
  user_create?: User;
  user_approve?: User;

  // BOM Components (from BOM table)
  bom_kertas?: BOMKertas[];
  bom_tinta?: BOMTinta[];
  bom_corrugated?: BOMCorrugated[];
  bom_poliban?: BOMPoliban[];
  bom_coating?: BOMCoating[];
  bom_lem?: BOMLem[];
  lain_lain?: BOMLainLain[];

  bom_ppic?: {
    id?: number;
    id_io?: number;
    id_so?: number;
    id_bom?: number;
    no_bom_ppic?: string;
    status_proses?: string;
    bom_ppic_kertas?: BOMPPICKertas[];
    bom_ppic_tinta?: BOMPPICTinta[];
    bom_ppic_corrugated?: BOMPPICCorrugated[];
    bom_ppic_poliban?: BOMPPICPoliban[];
    bom_ppic_coating?: BOMPPICCoating[];
    bom_ppic_lem?: BOMPPICLem[];
    bom_ppic_lain_lain?: BOMLainLain[];
  };
  // BOM PPIC Components (from BOM PPIC table)
  bom_ppic_kertas?: BOMPPICKertas[];
  bom_ppic_tinta?: BOMPPICTinta[];
  bom_ppic_corrugated?: BOMPPICCorrugated[];
  bom_ppic_poliban?: BOMPPICPoliban[];
  bom_ppic_coating?: BOMPPICCoating[];
  bom_ppic_lem?: BOMPPICLem[];
  bom_ppic_lain_lain?: BOMLainLain[];
  so?: {
    po_qty?: number;
    [key: string]: any;
  };
}

// BOM PPIC Item for list view
// BOM PPIC Item for list view
export interface BOMPPICItem {
  id: number;
  no_bom: string;
  no_so: string;
  no_io: string;
  customer: string;
  produk: string;
  status_jo?: string;
  status_bom: string;
  status_proses: string;
  tgl_pembuatan_so?: string;
  tgl_pembuatan_bom: string;
  is_active: boolean;
  is_bom_ppic_done?: boolean;
  bom_ppic?: {
    id: number;
    id_bom?: number;
    no_bom_ppic?: string;
    status_proses?: string;
    status_bom_ppic?: string;
    is_active?: boolean;
    is_request_purchase?: boolean;
    [key: string]: any;
  } | null; // now a single object, not an array
}
// BOM PPIC Create/Update Payload (cleaned data for API)
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
  tgl_kirim_customer?: string;
  bom_ppic_kertas?: Array<{
    id_kertas: number;
    id_jenis_kertas?: number;
    qty_beli: number;
    qty_stok: number;
  }>;
  bom_ppic_tinta?: Array<{
    id_jenis_tinta: number;
    id_jenis_kertas: number;
    tinta_detail: Array<{
      id_item_tinta: number;
      qty_beli: number;
      qty_stok: number;
    }>;
  }>;
  bom_ppic_corrugated?: Array<{
    id_corrugated: number;
    qty_beli: number;
    qty_stok: number;
  }>;
  bom_ppic_poliban?: Array<{
    id_poliban: number;
    qty_beli: number;
    qty_stok: number;
  }>;
  bom_ppic_coating?: Array<{
    id_coating: number;
    tipe_coating: 'Depan' | 'Belakang';
    qty_beli_coating_depan: number;
    qty_stok_coating_depan: number;
    qty_beli_coating_belakang: number;
    qty_stok_coating_belakang: number;
  }>;
  bom_ppic_lem?: Array<{
    id_lem: number;
    qty_beli: number;
    qty_stok: number;
  }>;
  lain_lain?: BOMLainLain[];
  qty_po: number;
  qty_fg: number;
}
