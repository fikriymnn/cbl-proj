// Types/Purchasing.types.ts

// ============================================================================
// OTS (BOM PPIC) — items eligible to be turned into a purchase request.
// Source: GET {VITE_API_LINK}/ppic/bom  params: { is_request_purchase: false }
// ============================================================================
export interface OTSItem {
  bom_ppic_kertas: any;
  tgl_rencana_cetak: string | undefined;
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

// Master item detail, embedded inline on every pengajuan row as `detail_item`.
// This is the source of truth for price, brand, tax rate, and whether tax is
// mandatory (is_include_tax) for that specific item.
export interface DetailItem {
  id: number;
  id_brand: number | null;
  id_inventory_unit?: number;
  id_purchase_unit?: number;
  kode_barang: string;
  nama_barang: string;
  kategori: string; // e.g. "Duplex" — finer grained than tipe_barang
  sub_kategori: string; // e.g. "Kertas" — matches tipe_barang family
  keterangan?: string;
  gramatur?: number;
  panjang?: number;
  lebar?: number;
  persentase?: number;
  inventory_convert?: number;
  harga: number;
  harga_per_satuan?: number;
  batas_harga?: number;
  pajak: number; // tax rate in percent, e.g. 11 => 11%
  is_include_tax: boolean; // true = tax is mandatory for this item, cannot be unchecked
  is_active: boolean;
  warehouse?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PengajuanItem {
  id: number; // request-purchase line id -> used in request_purchase_data when creating a PO
  id_bom_ppic?: number;
  id_brand?: number | null;
  nama_brand?: string | null;
  id_io?: number;
  id_item?: number;
  id_jo?: number;
  id_purchase_order?: number | null;
  id_request?: number;
  id_so?: number;
  is_active?: boolean;
  nama_item: string;
  nama_barang?: string; // kept for backwards compatibility with older callers
  kode_barang?: string;
  no_bom_ppic: string;
  no_io?: string;
  no_jo: string;
  no_so?: string;
  produk?: string;
  qty: number;
  rencana_cetak: string;
  satuan?: string;
  status?: string;
  tgl_kirim: string;
  tgl_request?: string;
  tipe_barang?: string;
  createdAt?: string;
  updatedAt?: string;
  customer?: string;
  harga_terakhir?: number;
  detail_item?: DetailItem;
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
  | 'proses'
  | 'history'
  | 'approve kabag'
  | 'approve finance'
  | 'reject kabag'
  | 'reject finance';

export interface PurchaseOrderNoResponse {
  status: number;
  success: boolean;
  no_purchase_order: string;
  no_purchase_order_new: string;
}

export interface PurchaseOrderItemPayload {
  id_item: number;
  id_brand: number | null;
  nama_item: string;
  nama_brand: string;
  kode_barang?: string;
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
  id_vendor: number | null;
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
  rowId: string; // local key
  id_item: number;
  id_brand: number | null;
  nama_brand: string;
  kode_barang: string;
  nama_barang: string;
  tipe_barang: string;
  satuan: string;
  qty_bom: number; // sum of qty across all source lines
  qty_beli: number;
  harga: number;
  is_ppn: boolean;
  is_tax_locked: boolean; // true when detail_item.is_include_tax === true -> checkbox forced on, cannot uncheck
  pajak_persen: number; // tax rate (%) sourced from detail_item.pajak, used in the PPN formula
  ppn: number;
  sources: { id: number; no_jo: string; qty: number; tgl_kirim?: string }[];
}

// ============================================================================
// Master Vendor — used to populate the vendor dropdown inside Create PO,
// filtered by tipe_vendor against the tipe_barang of the selected items.
// Source: GET {VITE_API_LINK}/master/marketing/vendor/list
// ============================================================================
export interface MasterVendorItem {
  id: number;
  nama_vendor: string;
  email?: string;
  alamat?: string;
  telepon?: string;
  is_active: boolean;
  tipe_vendor: string[];
}

export interface MasterVendorListResponse {
  succes: boolean;
  status_code: number;
  data: MasterVendorItem[];
  total_page?: number;
}

// ============================================================================
// Purchase Order — list / detail / update, used by DraftPO, POApprovalPurchase
// (kabag) and POApprovalFinance.
//
// Source: GET    {VITE_API_LINK}/purchasing/purchaseOrder
//                params: { page, limit, search, status, status_tiket }
// Detail: GET    {VITE_API_LINK}/purchasing/purchaseOrder/:idPo
//                (assumed — same resource as the PUT below; returns `items`)
// Update: PUT    {VITE_API_LINK}/purchasing/purchaseOrder/:idPo
// Request:PUT    {VITE_API_LINK}/purchasing/purchaseOrder/request/:idPo
// Approve:PUT    {VITE_API_LINK}/purchasing/purchaseOrder/approveKabag/:idPo
//                {VITE_API_LINK}/purchasing/purchaseOrder/approveFinance/:idPo
// Reject: PUT    {VITE_API_LINK}/purchasing/purchaseOrder/rejectKabag/:idPo
//                {VITE_API_LINK}/purchasing/purchaseOrder/rejectFinance/:idPo
// ============================================================================

// A saved line item on a PO, returned inside `items` on the detail fetch.
export interface PurchaseOrderItem {
  id: number; // existing PO-item id — send back as-is when updating
  id_purchase_order?: number;
  id_item: number;
  id_brand?: number | null;
  nama_item: string;
  nama_brand?: string;
  kode_barang?: string;
  qty: number;
  qty_beli: number;
  tipe_barang: string;
  satuan: string;
  harga: number;
  total: number;
  ppn: number;
  is_ppn: boolean;
}

// One PO header, as returned by the list endpoint. `items` is only present
// when fetching a single PO's detail.
export interface PurchaseOrder {
  id: number;
  id_create?: number;
  id_request?: number | null;
  id_approve_kabag?: number | null;
  id_approve_finance?: number | null;
  id_reject_kabag?: number | null;
  id_reject_finance?: number | null;
  sub_total: number;
  discount: number;
  ppn: number;
  total: number;
  no_purchase_order: string;
  nama_vendor: string;
  tgl_po: string;
  tgl_kirim: string;
  note_internal: string;
  note_supplier: string;
  status: StatusPO;
  status_tiket: StatusTiket;
  is_active?: boolean;
  createdAt?: string;
  updatedAt?: string;
  items?: PurchaseOrderItem[];
}

export interface PurchaseOrderListResponse {
  status: number;
  success: boolean;
  data: PurchaseOrder[];
  total_page?: number;
}

export interface PurchaseOrderDetailResponse {
  status: number;
  success: boolean;
  data: PurchaseOrder;
}

export interface UpdatePurchaseOrderItemPayload {
  id?: number; // existing PO-item id, omit/undefined for a brand-new row
  id_purchase_order?: number;
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

export interface UpdatePurchaseOrderPayload {
  sub_total: number;
  discount: number;
  ppn: number;
  total: number;
  no_purchase_order: string;
  nama_vendor: string;
  tgl_po: string;
  tgl_kirim: string;
  note_internal: string;
  note_supplier: string;
  items: UpdatePurchaseOrderItemPayload[];
}

// Generic { status, success, message? } shape returned by the action
// endpoints (request / approve / reject).
export interface PurchaseOrderActionResponse {
  status: number;
  success: boolean;
  message?: string;
}
