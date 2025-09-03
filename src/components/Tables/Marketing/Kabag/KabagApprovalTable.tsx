import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import KalkulasiDetailModal from '../Kalkulasi/KalkulasiDetailModal';

// Keep all the interfaces at the top
interface KalkulasiItem {
  status_proses: string;
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
  total_harga_satuan_customer: string | number;
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
// Keep all existing interfaces and add this new one
interface KalkulasiDetailItem extends KalkulasiItem {
  lain_lain: LainLainItem[];
  kalkulasi_action_user: any[];
  brand_kertas: string;
  finishing_insheet: number;
  foil: string;
  gramature_kertas: number;
  harga_area_pengiriman: number;
  harga_foil_manual: number;
  harga_lipat: number;
  harga_packaging: number;
  harga_packing: number;
  harga_pengiriman: number;
  harga_pisau: number;
  harga_plate: number;
  harga_polimer_manual: number;
  harga_potong_jadi: number;
  harga_satuan_ongkos_pons: number;
  harga_spot_foil_manual: number;
  id_area_pengiriman: number;
  id_coating_belakang: number;
  id_coating_depan: number;
  id_customer: number;
  id_jenis_mesin_cetak: number;
  id_jenis_pons: number;
  id_kertas: number;
  id_lem: number;
  id_marketing: number;
  id_mesin_coating_belakang: number;
  id_mesin_coating_depan: number;
  id_mesin_finishing: number;
  id_mesin_lipat: number;
  id_mesin_pons: number;
  id_mesin_potong: number;
  id_packing: number;
  id_produk: number;
  id_user_approve: number | null;
  id_user_create: number;
  is_active: boolean;
  jenis_kertas: string;
  jenis_mesin_cetak: string;
  jenis_packing: string;
  jumlah_harga_cetak: number;
  jumlah_harga_coating_belakang: number;
  jumlah_harga_coating_depan: number;
  jumlah_harga_jual: string;
  jumlah_harga_lem: number;
  jumlah_kirim: number;
  jumlah_warna: number;
  kode_marketing: string;
  lebar_kertas: number;
  lebar_packaging: number;
  lipat: string;
  nama_area_pengiriman: string;
  nama_coating_belakang: string;
  nama_coating_depan: string;
  nama_jenis_pons: string;
  nama_kertas: string;
  nama_lem: string;
  nama_mesin_coating_belakang: string;
  nama_mesin_coating_depan: string;
  nama_mesin_finishing: string;
  nama_mesin_lipat: string;
  nama_mesin_pons: string;
  nama_mesin_potong: string;
  nama_packing: string;
  no_packaging: string;
  note_kabag: string | null;
  ongkos_pons: string;
  ongkos_pons_qty: number;
  panjang_kertas: number;
  panjang_packaging: number;
  persentase_apki_kertas: number;
  persentase_kertas: number;
  plate_cetak: string | null;
  pons_insheet: number;
  potong_jadi: string;
  ppn: number;
  presentase_insheet: number;
  print_insheet: number;
  profit: number;
  profit_harga: number;
  qty_lipat: number | null;
  qty_packing: number;
  qty_potong: number;
  spot_foil: string | null;
  status_proses: string;
  total_harga_coating: number;
  total_harga_kertas: number;
  total_harga_ongkos_pons: number;
  total_harga_satuan_customer: string;
  total_kertas: number;
  ukuran_jadi_terb_lebar: number;
  ukuran_jadi_terb_panjang: number;
  warna_belakang: number;
  warna_depan: number;
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
interface LainLainItem {
  id: number;
  id_kalkulasi: number;
  nama_item: string;
  harga: number;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}
const KabagApprovalTable: React.FC = () => {
  const [data, setData] = useState<KalkulasiItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [selectedDetailData, setSelectedDetailData] =
    useState<KalkulasiDetailItem | null>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
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

  const fetchKalkulasiDetail = async (id: number): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/marketing/kalkulasi/${id}`;
    try {
      setDetailLoading(true);
      const res: AxiosResponse<ApiResponse<KalkulasiDetailItem>> =
        await axios.get(url);
      console.log('Fetched kalkulasi detail:', res.data);
      if (res.data && res.data.data) {
        setSelectedDetailData(res.data.data);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error('Error fetching kalkulasi detail:', error);
      const apiError = error as ApiError;
      alert(`Error: ${apiError.message || 'Failed to fetch detail data'}`);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleViewDetail = (id: number): void => {
    fetchKalkulasiDetail(id);
  };

  const handleCloseDetailModal = (): void => {
    setShowDetailModal(false);
    setSelectedDetailData(null);
  };
  async function RequestKabag(id: any) {
    if (window.confirm('Apakah Anda yakin ingin Approve Kalkulasi Ini?')) {
      try {
        const url = `${
          import.meta.env.VITE_API_LINK
        }/marketing/kalkulasi/approve/${id}`;
        const res = await axios.put(url, {
          withCredentials: true,
        });

        fetchKalkulasiData();
      } catch (error: any) {
        console.log(error);
      }
    }
  }
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  async function RejectKabag(id: any) {
    if (window.confirm('Apakah Anda yakin ingin Reject Kalkulasi Ini?')) {
      try {
        const url = `${
          import.meta.env.VITE_API_LINK
        }/marketing/kalkulasi/reject/${id}`;
        const res = await axios.put(url, {
          withCredentials: true,
        });

        fetchKalkulasiData();
      } catch (error: any) {
        console.log(error);
      }
    }
  }
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  return (
    <div className="container mx-auto py-1">
      {/* Data Table - Add Actions column */}
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

                <th className="px-4 py-3  text-xs font-medium text-gray-500 uppercase text-center">
                  Status
                </th>
                <th className="px-4 py-3  text-xs font-medium text-gray-500 uppercase text-center">
                  Status Approval
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
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
                    <td className="px-4 py-3 text-xs text-center">
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs uppercase ">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-center">
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs uppercase ">
                        {item.status_proses}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs flex flex-col gap-2">
                      <button
                        onClick={() => handleViewDetail(item.id)}
                        disabled={detailLoading}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
                      >
                        {detailLoading ? 'Loading...' : 'Detail'}
                      </button>
                      {item.status == 'requested' && (
                        <button
                          onClick={() => RequestKabag(item.id)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
                        >
                          Approve
                        </button>
                      )}
                      {item.status == 'requested' && (
                        <button
                          onClick={() => RejectKabag(item.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
                        >
                          Reject
                        </button>
                      )}
                    </td>
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

      {/* Detail Modal */}
      {showDetailModal && selectedDetailData && (
        <KalkulasiDetailModal
          data={selectedDetailData}
          onClose={handleCloseDetailModal}
        />
      )}
    </div>
  );
};

export default KabagApprovalTable;
