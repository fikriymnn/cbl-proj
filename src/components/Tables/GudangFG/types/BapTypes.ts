// types/BapTypes.ts
// Shared across BAPFg (gudang), BAPMarketing, BAPManagement, BAPPPIC, BAPHR

export interface UserRef {
  id: number;
  nama: string;
  email?: string;
  role?: string;
}

export interface BapListItem {
  id: number;
  id_user: number;
  no_bap: string;
  tgl_create: string;
  status: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  // present on the record, only relevant to the HR flow
  file_before?: string | null;
  file_after?: string | null;
}

export interface BapListResponse {
  status: number;
  success: boolean;
  data: BapListItem[];
  total_page?: number;
}

export interface KalkulasiRef {
  id: number;
  id_marketing: number;
}

export interface SoRef {
  id: number;
  harga_jual: number;
  kalkulasi?: KalkulasiRef;
}

export interface BapItem {
  id: number;
  id_bap: number;
  id_gudang_finish_good: number;
  id_jo: number;
  id_io: number;
  id_so: number;
  id_customer: number;
  id_produk: number;
  id_user_create: number;
  id_user_approve: number | null; // final approve (management)
  id_user_approve_marketing?: number | null; // stage-1 approve (marketing)
  id_user_reject: number | null;
  no_jo: string;
  no_io: string;
  no_so: string;
  no_po_customer: string;
  customer: string;
  produk: string;
  po_qty: number;
  jumlah_qty: number;
  tgl_masuk: string | null;
  tgl_create: string;
  tgl_respon: string | null;
  status: string; // incoming | approve | reject  (this is the MANAGEMENT/final status)
  note: string | null;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  user_create?: UserRef | null;
  user_approve?: UserRef | null;
  user_reject?: UserRef | null;
  so?: SoRef;
}

export interface BapDetail extends BapListItem {
  bap_item: BapItem[];
}

export interface BapDetailResponse {
  status: number;
  success: boolean;
  data: BapDetail;
}
