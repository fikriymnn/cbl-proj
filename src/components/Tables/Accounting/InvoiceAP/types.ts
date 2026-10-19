export type Num = number | string | null | undefined;

export interface VendorOption {
  id: number;
  nama: string;
  alamat?: string;
}

export interface GoodReceipt {
  id: number;
  id_vendor: number;
  id_item: number;
  id_invoice_ap: number | null;
  nama_vendor: string;
  no_purchase_order: string;
  no_surat_jalan: string;
  no_good_receipt: string;
  nama_item: string;
  tipe_barang: string;
  satuan: string;
  qty_incoming: number;
  qty: number;
  harga: Num;
  total: Num;
  is_ppn: boolean;
  tgl_action: string;
  note: string | null;
  is_created_invoice: boolean;
}

export interface GoodReceiptResponse {
  status: number;
  success: boolean;
  data: GoodReceipt[];
  total_data?: number;
  total_page?: number;
}

export interface InvoiceAPItem {
  id?: number;
  id_good_receipt: number;
  qty: Num;
  unit: string;
  harga: Num;
  dpp: Num;
  total: Num;
  pajak: Num;
  diskon_item: Num;
  // optional, depends on what GET /invoiceAp/:id returns
  nama_item?: string;
  no_good_receipt?: string;
  good_receipt?: { nama_item?: string; no_good_receipt?: string } | null;
}

export interface InvoiceAP {
  id: number;
  id_vendor: number;
  nama_vendor: string;
  no_invoice: string;
  no_invoice_vendor: string;
  no_po: string;
  no_surat_jalan: string;
  alamat: string;
  tgl_faktur: string;
  tgl_jatuh_tempo: string;
  waktu_jatuh_tempo: string;
  sub_total: Num;
  dpp: Num;
  diskon: Num;
  ppn: Num;
  total: Num;
  dp: Num;
  balance_due: Num;
  paid_amount: Num;
  note: string | null;
  is_show_dpp: boolean;
  is_tax: boolean;
  status: string;
  status_proses: string;
  status_payment: string;
  tgl_pelunasan: string | null;
  outstanding_amount: Num;
  days_until_due: number | null;
  due_description: string;
  waktu: string;
  invoice_ap_item?: InvoiceAPItem[];
}

export interface RecapItem {
  waktu: string;
  total_invoice: number;
  total_harus_dibayar: Num;
}

export interface InvoiceAPListResponse {
  status: number;
  success: boolean;
  data: InvoiceAP[];
  data_rekap_tenggat?: RecapItem[];
  total_data?: number;
  total_page?: number;
}

// ── /invoiceAp/ap ──

export interface APInvoiceRow {
  id: number;
  id_vendor: number;
  nama_vendor: string;
  no_po: string;
  no_invoice: string;
  no_invoice_vendor: string;
  no_surat_jalan: string;
  tgl_faktur: string;
  tgl_jatuh_tempo: string;
  waktu_jatuh_tempo: string;
  total: Num;
  dp: Num;
  balance_due: Num;
  paid_amount: Num;
  status_payment: string;
  tgl_pelunasan: string | null;
  outstanding_amount: Num;
  days_until_due: number | null;
  due_description: string;
  waktu: string;
}

export interface APVendor {
  id_vendor: number;
  nama_vendor: string;
  total_invoice: number;
  total_belum_dibayar: Num;
  invoice: APInvoiceRow[];
}

export interface APSummary {
  total_vendor: number;
  total_invoice: number;
  total_belum_dibayar: Num;
}

export interface APTenggatRecap {
  waktu: string;
  total_vendor: number;
  total_invoice: number;
  total_belum_dibayar: Num;
}

export interface APResponse {
  status: number;
  success: boolean;
  data_rekap: APSummary;
  data_rekap_tenggat: APTenggatRecap[];
  data: APVendor[];
}

export interface InvoiceNumberResponse {
  status: number;
  success: boolean;
  no_invoice_tax_new?: string;
  no_invoice_non_tax_new?: string;
}
