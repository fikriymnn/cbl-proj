// Types/purchasing.types.ts

// ============================================================================
// OTS (BOM PPIC) — items eligible to be turned into a purchase request.
// Source: GET {VITE_API_LINK}/ppic/bom  params: { is_request_purchase: false }
// ============================================================================
export interface OTSItem {
  tgl_kirim_customer: string | undefined;
  id: number; // BOM PPIC id -> used as id_bom_ppic when creating a pengajuan
  no_bom: string;
  no_so: string;
  no_io: string;
  no_jo?: string;
  customer: string;
  produk: string;
  jenis_kertas?: string;
  tgl_cetak?: string;
  tgl_kirim?: string;
  tgl_input?: string;
  is_request_purchase: boolean;
}

export interface OTSListResponse {
  succes: boolean;
  data: OTSItem[];
  total_page?: number;
}

// ============================================================================
// Pengajuan (request purchase) — material lines waiting to be grouped into a PO.
// Source: GET {VITE_API_LINK}/purchasing/request
// Create: POST {VITE_API_LINK}/purchasing/request   body: { id_bom_ppic }
// ============================================================================
export type KategoriBarang =
  | 'Kertas'
  | 'Tinta'
  | 'Corrugated'
  | 'Poliban'
  | 'Coating'
  | 'Lem'
  | 'Chemical'
  | 'Lain-lain'
  | 'Unknown Category';

export interface PengajuanItem {
  no_bom_ppic: string;
  nama_item: string;
  id: number; // request-purchase line id -> used in request_purchase_data when creating a PO
  id_item?: number;
  kode_barang?: string;
  nama_barang: string;
  kategori: KategoriBarang;
  no_jo: string;
  customer?: string;
  rencana_cetak: string;
  tgl_kirim: string;
  qty: number;
  satuan?: string;
  tipe_barang?: string;
  harga_terakhir?: number;
}

export interface RekapPengajuan {
  kategori: KategoriBarang;
  total: number;
}

export interface PengajuanListResponse {
  succes: boolean;
  data: PengajuanItem[];
  total_page?: number;
  rekap?: RekapPengajuan[];
}

export type StatusPO =
  | 'draft'
  | 'request kabag'
  | 'request finance'
  | 'reject kabag'
  | 'reject finance'
  | 'proses';

export type StatusTiket =
  | 'draft'
  | 'request kabag'
  | 'request finance'
  | 'proses';

export interface PurchaseOrderNoResponse {
  status: number;
  success: boolean;
  no_purchase_order: string;
  no_purchase_order_new: string;
}

export interface PurchaseOrderItemPayload {
  id_item: number;
  nama_item: string;
  qty: number;
  qty_beli: number;
  tipe_barang: string;
  satuan: string;
  harga: number;
  total: number;
  ppn: number;
  is_ppn: boolean;
}

export interface CreatePurchaseOrderPayload {
  nama_vendor: string;
  tgl_po: string;
  tgl_kirim: string;
  sub_total: number;
  ppn: number;
  discount: number;
  total: number;
  note_internal: string;
  note_supplier: string;
  items: PurchaseOrderItemPayload[];
  request_purchase_data: { id: number }[];
}

// Row shape used inside the Create PO modal — one row per distinct item,
// aggregated across every source pengajuan line that shares the same item.
export interface POBuilderRow {
  rowId: string; // local key (kode_barang || nama_barang)
  id_item: number;
  kode_barang?: string;
  nama_barang: string;
  tipe_barang: string;
  satuan: string;
  qty_bom: number; // sum of qty across all source lines
  qty_beli: number;
  harga: number;
  is_ppn: boolean;
  ppn: number;
  sources: { id: number; no_jo: string; qty: number }[];
}
