import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface ReturProduct {
  id: number;
  id_retur: number;
  id_produk: number;
  kode_produk: string;
  nama_produk: string;
  qty: number;
  harga: number;
  dpp: number;
  pajak: number;
  total: number;
  unit: string;
  qty_produk: number;
  createdAt: string;
  updatedAt: string;
  is_active: boolean;
}

interface UserInfo {
  id: number;
  uuid: string;
  nama: string;
  email: string;
  role: string;
  bagian: string;
  id_karyawan: number;
  no: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ReturDetail {
  id: number;
  id_invoice: number;
  no_retur: string;
  no_invoice: string;
  no_do: string;
  no_po: string;
  nama_customer: string;
  alamat: string;
  tgl_faktur: string;
  tgl_po: string;
  tgl_kirim: string;
  tgl_jatuh_tempo: string;
  waktu_jatuh_tempo: string;
  total: number;

  note: string;
  status: string;
  status_proses: string;

  retur_produk: ReturProduct[];

  user_create: UserInfo | null;
  user_approve: UserInfo | null;
  user_reject: UserInfo | null;

  createdAt: string;
  updatedAt: string;
}

interface Props {
  invoiceId: number;
  isOpen: boolean;
  onClose: () => void;
}

const DetailReturModal: React.FC<Props> = ({ invoiceId, isOpen, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<ReturDetail | null>(null);

  useEffect(() => {
    if (isOpen) fetchDetail();
  }, [isOpen]);

  const fetchDetail = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${import.meta.env.VITE_API_LINK}/retur/${invoiceId}`,
        { withCredentials: true },
      );

      setDetail(res.data.data);
    } catch (e) {
      console.error('Error loading retur detail:', e);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d: string) => {
    if (!d) return '-';
    const date = new Date(d);
    return `${String(date.getDate()).padStart(2, '0')}/${String(
      date.getMonth() + 1,
    ).padStart(2, '0')}/${date.getFullYear()}`;
  };

  const formatCurrency = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl p-6 shadow-lg overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Detail Retur</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-black">
            ✕
          </button>
        </div>

        {loading ? (
          <div className="py-10 text-center">Loading...</div>
        ) : !detail ? (
          <div className="py-10 text-center text-gray-500">No Detail Found</div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
              <div>
                <p>
                  <strong>No Retur:</strong> {detail.no_retur}
                </p>
                <p>
                  <strong>No Invoice:</strong> {detail.no_invoice}
                </p>
                <p>
                  <strong>No DO:</strong> {detail.no_do}
                </p>
                <p>
                  <strong>No PO:</strong> {detail.no_po}
                </p>
                <p>
                  <strong>Customer:</strong> {detail.nama_customer}
                </p>
                <p>
                  <strong>Alamat:</strong> {detail.alamat}
                </p>
              </div>

              <div>
                <p>
                  <strong>Tgl Faktur:</strong> {formatDate(detail.tgl_faktur)}
                </p>
                <p>
                  <strong>Tgl PO:</strong> {formatDate(detail.tgl_po)}
                </p>
                <p>
                  <strong>Tgl Kirim:</strong> {formatDate(detail.tgl_kirim)}
                </p>
                <p>
                  <strong>Tgl Jatuh Tempo:</strong>{' '}
                  {formatDate(detail.tgl_jatuh_tempo)}
                </p>
                <p>
                  <strong>Waktu JT:</strong> {detail.waktu_jatuh_tempo}
                </p>
                <p>
                  <strong>Status:</strong> {detail.status}
                </p>
              </div>
            </div>

            <h3 className="font-semibold mb-2">Produk Retur</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 py-2 text-left">Kode</th>
                    <th className="px-2 py-2 text-left">Produk</th>
                    <th className="px-2 py-2 text-center">Qty</th>
                    <th className="px-2 py-2 text-right">Harga</th>
                    <th className="px-2 py-2 text-right">DPP</th>
                    <th className="px-2 py-2 text-right">Pajak</th>
                    <th className="px-2 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.retur_produk.map((p) => (
                    <tr key={p.id} className="border-t">
                      <td className="px-2 py-2">{p.kode_produk}</td>
                      <td className="px-2 py-2">{p.nama_produk}</td>
                      <td className="px-2 py-2 text-center">
                        {p.qty} {p.unit}
                      </td>
                      <td className="px-2 py-2 text-right">
                        {formatCurrency(p.harga)}
                      </td>
                      <td className="px-2 py-2 text-right">
                        {formatCurrency(p.dpp)}
                      </td>
                      <td className="px-2 py-2 text-right">
                        {formatCurrency(p.pajak)}
                      </td>
                      <td className="px-2 py-2 text-right">
                        {formatCurrency(p.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 text-sm">
              <p>
                <strong>Dibuat oleh:</strong> {detail.user_create?.nama || '-'}
              </p>
              <p>
                <strong>Disetujui oleh:</strong>{' '}
                {detail.user_approve?.nama || '-'}
              </p>
              <p>
                <strong>Ditolak oleh:</strong> {detail.user_reject?.nama || '-'}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DetailReturModal;
