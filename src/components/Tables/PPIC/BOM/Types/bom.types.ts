// types/bom.types.ts
export interface SOData {
  id_io: number;
  id: number;
  id_kalkulasi: number;
  no_so: string;
  no_io: string;
  customer: string;
  produk: string;
  status: string;
  status_jo: string;
  tgl_pembuatan_so: string;
  po_qty: number;
  is_active: boolean;
  // ... other fields from your API response
}

export interface BOMKertas {
  id?: number; // ID dari database jika sudah ada
  id_kertas: number;
  nama_kertas: string;
  qty_lembar_plano: number;
  tipe: string;
  is_selected: boolean;
}

export interface TintaDetail {
  id_item_tinta: number;
  nama_item_tinta: string;
  persentase_tinta: number;
}

export interface BOMTinta {
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
  id_corrugated: number;
  nama_corrugated: string;
  isi_per_pack: number;
  qty_corrugated: number;
  tipe: string;
  is_selected: boolean;
}

export interface BOMPoliban {
  item_poliban: string;
  isi_satu_ikat: number;
  lembar_poliban: number;
  qty_poliban: number;
  tipe: string;
  is_selected: boolean;
}

export interface BOMCoating {
  id_coating_depan: number;
  id_coating_belakang: number;
  nama_coating_depan: string;
  nama_coating_belakang: string;
  qty_coating_depan: number;
  qty_coating_belakang: number;
  uv_wb: number;
  varnish_doff: number;
  tipe: string;
  is_selected: boolean;
}

export interface BOMLem {
  id_lem: number;
  nama_lem: string;
  rumus_lem: string;
  qty_konstanta: number;
  qty_lock_bottom: number;
  qty_lem_samping: number;
  qty_four_corner: number;
  qty_samping_lock_bottom: number;
  qty_six_corner: number;
  qty_ujung_lock_bottom: number;
  tipe: string;
  is_selected: boolean;
}

export interface BOMData {
  id?: number;
  id_io: number;
  id_so: number;
  id_io_mounting: number;
  nama_mounting: string;
  no_bom: string;
  no_io: string;
  no_so: string;
  customer: string;
  produk: string;
  bom_kertas: BOMKertas[];
  bom_tinta: BOMTinta[];
  bom_corrugated: BOMCorrugated[];
  bom_poliban: BOMPoliban[];
  bom_coating: BOMCoating[];
  bom_lem: BOMLem[];
}
