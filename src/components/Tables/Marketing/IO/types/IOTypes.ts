// types/IOTypes.ts (create this new file)

import { MountingData } from '../Mounting';

export interface UserData {
  id: number;
  nama: string;
  bagian: string;
  email: string;
  role: string;
  no: string;
  status: string;
  id_karyawan?: number;
  divisi_bawahan?: string | null;
  id_role?: number | null;
  password?: string;
  uuid?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserActionData {
  id: number;
  id_io: number;
  id_user: number;
  status: string;
  tgl: string;
  createdAt: string;
  updatedAt: string;
  is_active: boolean;
  user: UserData;
}

export interface IOData {
  id: number;
  no_io: string;
  base_no_io: string;
  customer: string;
  produk: string;
  status_io: string;
  status: string;
  status_proses: string;
  tgl_pembuatan_io: string;
  tgl_approve_io?: string;
  revisi_ke: number;
  is_active: boolean;
  is_updated: boolean;
  note_reject: string | null;
  keterangan: string;
  label: string;
  status_send_proof: string;
  id_customer: number;
  id_produk: number;
  id_okp: number;
  id_create_io: number;
  id_approve_io: number;
  createdAt: string;
  updatedAt: string;
  io_mounting?: MountingData[];
  io_action_user?: UserActionData[];
  user_create?: UserData;
  user_approve?: UserData;
  okp?: {
    id: number;
    kalkulasi?: {
      id: number;
      marketing?: {
        id_karyawan: number;
        data_karyawan?: {
          name: string;
        };
      };
    };
  };
}

export interface OKPData {
  id: number;
  no_okp: string;
  customer: string;
  produk: string;
  status_okp: string;
  rencana_qty_po: number;
  rencana_tgl_kirim: string;
}
