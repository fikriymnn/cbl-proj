import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import KalkulasiModal from './KalkulasiModal';
import KalkulasiDetailModal from './KalkulasiDetailModal';
import {
  KalkulasiItem,
  KalkulasiDetailItem,
  LainLainItem,
  ApiResponse,
  ApiError,
} from '../Kalkulasi/types/kalkulasi';
// Keep all the interfaces at the top

const KalkulasiNormal: React.FC = () => {
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
        {
          params: { status: 'draft' },
          withCredentials: true,
        },
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
    if (window.confirm('Apakah Anda yakin ingin Submit Kalkulasi Ini?')) {
      try {
        const url = `${
          import.meta.env.VITE_API_LINK
        }/marketing/kalkulasi/submit/${id}`;
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
    <div className=" mx-auto py-1">
      {/* Header - remains the same */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="border border-gray-300 rounded px-2 py-1"
          />
        </div>
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
                  Harga Customer
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
                      Rp{' '}
                      {
                        Number(item.total_harga_satuan_customer || 0).toFixed(0) // or set decimal precision, e.g., (2)
                      }
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
                      <br />
                      {item.status_proses == 'reject kabag' && (
                        <span className="text-red-500 text-xs">
                          {item?.note_kabag}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs flex flex-col gap-2">
                      <button
                        onClick={() => handleViewDetail(item.id)}
                        disabled={detailLoading}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
                      >
                        {detailLoading ? 'Loading...' : 'Detail'}
                      </button>
                      {item.status == 'draft' && (
                        <button
                          onClick={() => RequestKabag(item.id)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
                        >
                          Submit
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

      {/* Existing Modal */}
      {showModal && (
        <KalkulasiModal
          onClose={handleCloseModal}
          onSuccess={handleModalSuccess}
        />
      )}

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

export default KalkulasiNormal;
