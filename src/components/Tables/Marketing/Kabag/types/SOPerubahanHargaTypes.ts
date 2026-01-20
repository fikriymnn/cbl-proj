// types/SOPerubahanHargaTypes.ts
export interface SOPerubahanHargaData {
  no_so: string;
  id: number;
  id_so: number;
  harga_awal: number;
  harga_perubahan: number;
  note: string;
  status: 'requested' | 'approved' | 'rejected';
  note_reject?: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  so?: {
    id: number;
    no_so: string;
    customer: string;
    produk: string;
    no_io: string;
    harga_jual: number;
    po_qty: number;
  };
}

export interface SOPerubahanHargaAPIResponse<T> {
  succes: boolean;
  message?: string;
  data: T;
  total_page?: number;
  current_page?: number;
}
