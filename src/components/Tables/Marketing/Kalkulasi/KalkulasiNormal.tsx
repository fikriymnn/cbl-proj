import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import KalkulasiModal from './KalkulasiModal';

// Keep all the interfaces at the top
interface KalkulasiItem {
  id: number;
  kode_kalkulasi: string | null;
  status_kalkulasi: string;
  tgl_kalkulasi: string;
  nama_customer: string;
  nama_produk: string;
  qty_kalkulasi: number;
  harga_satuan: number;
  status: string;
  nama_marketing: string;
  spesifikasi: string;
  total_harga_satuan_customer: number;
  profit_harga: number;
  harga_produksi: number;
  total_harga: number;
  harga_ppn: number;
  harga_diskon: number;
  diskon: number;
  ukuran_jadi_panjang: number;
  ukuran_jadi_lebar: number;
  ukuran_jadi_tinggi: number;
  ukuran_jadi_terb_panjang: number;
  ukuran_jadi_terb_lebar: number;
  ukuran_cetak_panjang_1: number;
  ukuran_cetak_lebar_1: number;
  ukuran_cetak_bagian_1: number;
  ukuran_cetak_isi_1: number;
  ukuran_cetak_bbs_1: string;
  ukuran_cetak_panjang_2?: number;
  ukuran_cetak_lebar_2?: number;
  ukuran_cetak_bagian_2?: number;
  ukuran_cetak_isi_2?: number;
  ukuran_cetak_bbs_2?: string;
  keterangan_harga?: string;
  keterangan_kerja?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse<T = any> {
  data: T;
  status_code: number;
  succes: boolean;
}

interface ApiError {
  message: string;
  status?: number;
}

const KalkulasiNormal: React.FC = () => {
  const [data, setData] = useState<KalkulasiItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    fetchKalkulasiData();
  }, []);

  const fetchKalkulasiData = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/marketing/kalkulasi`;
    try {
      setLoading(true);
      const res: AxiosResponse<ApiResponse<KalkulasiItem[]>> = await axios.get(
        url,
      );
      console.log('Fetched kalkulasi data:', res.data);
      if (res.data && res.data.data) {
        setData(res.data.data);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching kalkulasi data:', error);
      const apiError = error as ApiError;
      alert(`Error: ${apiError.message || 'Failed to fetch data'}`);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (): void => {
    setShowModal(true);
  };

  const handleCloseModal = (): void => {
    setShowModal(false);
  };

  const handleModalSuccess = (): void => {
    fetchKalkulasiData();
    setShowModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto  py-1">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="border border-gray-300 rounded px-2 py-1"
          />
        </div>
        {/* Add Kalkulasi Button */}
        <div className="">
          <button
            onClick={handleOpenModal}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
            type="button"
          >
            + KALKULASI
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  No
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Kode
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status Item Produk
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tanggal Kalkulasi
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Produk
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Qty
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Harga Per PCS
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status Approval
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.length > 0 ? (
                data.map((item: KalkulasiItem, index: number) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs">{index + 1}</td>
                    <td className="px-4 py-3 text-xs">
                      {item.kode_kalkulasi || '-'}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {item.status_kalkulasi}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {new Date(item.tgl_kalkulasi).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-4 py-3 text-xs">{item.nama_customer}</td>
                    <td className="px-4 py-3 text-xs max-w-xs truncate">
                      {item.nama_produk}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {item.qty_kalkulasi?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      Rp {item.harga_satuan?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">-</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={11}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Tidak ada data kalkulasi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <KalkulasiModal
          onClose={handleCloseModal}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
};

export default KalkulasiNormal;
