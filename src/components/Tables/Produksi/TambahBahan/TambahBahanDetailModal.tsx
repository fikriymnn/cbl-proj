import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  formatDateTime,
  getStatusColor,
  statusLabel,
} from './Tambahbahanutils';
import {} from './types/Tambahbahan.types';
import {
  TambahBahanPemakaianDetail,
  TambahBahanPersiapanDetail,
} from '../LKH/InputLKH/Tambahbahan.types';

const API_BASE = import.meta.env.VITE_API_LINK;

export type TambahBahanDetailType = 'persiapan' | 'pemakaian';

interface Props {
  show: boolean;
  type: TambahBahanDetailType;
  id: number | null;
  onClose: () => void;
}

const endpointFor = (type: TambahBahanDetailType, id: number) =>
  type === 'persiapan'
    ? `${API_BASE}/gudangRM/tambahBahanPersiapan/${id}`
    : `${API_BASE}/gudangRM/tambahBahanPemakaian/${id}`;

const TambahBahanDetailModal: React.FC<Props> = ({
  show,
  type,
  id,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<
    TambahBahanPersiapanDetail | TambahBahanPemakaianDetail | null
  >(null);

  useEffect(() => {
    if (!show || !id) {
      setData(null);
      return;
    }
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await axios.get(endpointFor(type, id), {
          withCredentials: true,
        });
        setData(res.data.data || res.data);
      } catch (error) {
        console.error('Error fetching tambah bahan detail:', error);
        toast.error('Gagal mengambil detail tambah bahan');
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [show, id, type]);

  if (!show) return null;

  const defects =
    type === 'persiapan'
      ? (data as TambahBahanPersiapanDetail)?.tambah_bahan_persiapan_defect ||
        []
      : (data as TambahBahanPemakaianDetail)?.tambah_bahan_pemakaian_defect ||
        [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stroke">
          <h3 className="text-base font-bold text-gray-800">
            Detail Tambah Bahan{' '}
            {type === 'persiapan' ? 'Persiapan' : 'Pemakaian'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="px-5 py-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              <p className="mt-2 text-sm text-gray-500">Memuat detail...</p>
            </div>
          ) : !data ? (
            <p className="text-sm text-gray-500 text-center py-8">
              Data tidak ditemukan
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-3 gap-y-1.5 text-xs">
                <div className="text-slate-500">Status</div>
                <div className="col-span-2">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      data.status,
                    )}`}
                  >
                    {statusLabel(data.status)}
                  </span>
                </div>

                <div className="text-slate-500">No JO</div>
                <div className="col-span-2 text-slate-800">
                  {data.no_jo || data.job_order?.no_jo || '-'}
                </div>

                <div className="text-slate-500">Customer</div>
                <div className="col-span-2 text-slate-800">
                  {data.job_order?.customer || (data as any).customer || '-'}
                </div>

                <div className="text-slate-500">Produk</div>
                <div className="col-span-2 text-slate-800">
                  {data.job_order?.produk || (data as any).produk || '-'}
                </div>

                <div className="text-slate-500">Kertas</div>
                <div className="col-span-2 text-slate-800">
                  {data.nama_kertas || data.detail_kertas?.nama_barang || '-'}
                </div>

                <div className="text-slate-500">Qty Request</div>
                <div className="col-span-2 text-slate-800">
                  {data.qty_tambah_bahan?.toLocaleString() || 0}
                </div>

                {type === 'persiapan' && (
                  <>
                    <div className="text-slate-500">Qty Terpakai</div>
                    <div className="col-span-2 text-slate-800">
                      {(
                        data as TambahBahanPersiapanDetail
                      ).qty_pakai_tambah_bahan?.toLocaleString() || 0}
                    </div>
                  </>
                )}

                {type === 'pemakaian' && (
                  <>
                    <div className="text-slate-500">Qty Approve QC</div>
                    <div className="col-span-2 text-slate-800">
                      {(
                        data as TambahBahanPemakaianDetail
                      ).qty_tambah_bahan_qc?.toLocaleString() ?? '-'}
                    </div>
                    <div className="text-slate-500">Qty Approve Gudang</div>
                    <div className="col-span-2 text-slate-800">
                      {(
                        data as TambahBahanPemakaianDetail
                      ).qty_tambah_bahan_gudang?.toLocaleString() ?? '-'}
                    </div>
                  </>
                )}

                <div className="text-slate-500">Note</div>
                <div className="col-span-2 text-slate-800">
                  {data.note || '-'}
                </div>

                <div className="text-slate-500">Note QC</div>
                <div className="col-span-2 text-slate-800">
                  {data.note_qc || '-'}
                </div>

                <div className="text-slate-500">Note Gudang</div>
                <div className="col-span-2 text-slate-800">
                  {data.note_gudang || '-'}
                </div>

                <div className="text-slate-500">Tanggal</div>
                <div className="col-span-2 text-slate-800">
                  {formatDateTime(data.createdAt)}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-600 mb-1">
                  Rincian Kendala
                  {type === 'persiapan' ? ' (dipakai dari tiket ini)' : ''}
                </p>
                {defects.length === 0 ? (
                  <p className="text-xs text-gray-400">
                    Belum ada data kendala
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs border border-gray-200 rounded-lg overflow-hidden">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-2 py-1.5 text-left font-medium text-gray-500">
                            Kode
                          </th>
                          <th className="px-2 py-1.5 text-left font-medium text-gray-500">
                            Deskripsi
                          </th>
                          <th className="px-2 py-1.5 text-right font-medium text-gray-500">
                            Qty
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {defects.map((d) => (
                          <tr key={d.id}>
                            <td className="px-2 py-1.5">{d.kode}</td>
                            <td className="px-2 py-1.5">{d.deskripsi}</td>
                            <td className="px-2 py-1.5 text-right">
                              {d.qty_tambah_bahan?.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {data.detail_kertas && (
                <div className="text-xs text-gray-500">
                  Gudang: {data.detail_kertas.warehouse || '-'} · Gramatur{' '}
                  {data.detail_kertas.gramatur || '-'} ·{' '}
                  {data.detail_kertas.panjang}/{data.detail_kertas.lebar}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TambahBahanDetailModal;
