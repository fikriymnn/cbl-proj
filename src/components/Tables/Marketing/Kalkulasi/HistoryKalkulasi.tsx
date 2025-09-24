// Update your HistoryKalkulasi.tsx
import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import KalkulasiDetailModal from './KalkulasiDetailModal';
import CopyOptionsModal from './CopyOptionModal'; // Add this import
import CopyKalkulasiModal from './CopyKalkulasiModal'; // Add this import
import {
  KalkulasiItem,
  KalkulasiDetailItem,
  ApiResponse,
  ApiError,
} from '../Kalkulasi/types/kalkulasi';

const HistoryKalkulasi: React.FC = () => {
  const [data, setData] = useState<KalkulasiItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [selectedDetailData, setSelectedDetailData] =
    useState<KalkulasiDetailItem | null>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);

  // Add new states for copy functionality
  const [showCopyOptionsModal, setShowCopyOptionsModal] =
    useState<boolean>(false);
  const [showCopyModal, setShowCopyModal] = useState<boolean>(false);
  const [copyType, setCopyType] = useState<'repeat' | 'repeat_perubahan'>(
    'repeat',
  );
  const [selectedCopyData, setSelectedCopyData] =
    useState<KalkulasiDetailItem | null>(null);

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
          params: { status: 'history' },
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

  // Add new function to fetch data for copy
  const fetchKalkulasiDetailForCopy = async (id: number): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/marketing/kalkulasi/${id}`;
    try {
      setDetailLoading(true);
      const res: AxiosResponse<ApiResponse<KalkulasiDetailItem>> =
        await axios.get(url);
      console.log('Fetched kalkulasi detail for copy:', res.data);
      if (res.data && res.data.data) {
        setSelectedCopyData(res.data.data);
        setShowCopyOptionsModal(true);
      }
    } catch (error) {
      console.error('Error fetching kalkulasi detail for copy:', error);
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

  // Add new handlers for copy functionality
  const handleCopyClick = (id: number): void => {
    fetchKalkulasiDetailForCopy(id);
  };

  const handleCloseCopyOptionsModal = (): void => {
    setShowCopyOptionsModal(false);
    setSelectedCopyData(null);
  };

  const handleSelectRepeat = (): void => {
    setCopyType('repeat');
    setShowCopyOptionsModal(false);
    setShowCopyModal(true);
  };

  const handleSelectRepeatPerubahan = (): void => {
    setCopyType('repeat_perubahan');
    setShowCopyOptionsModal(false);
    setShowCopyModal(true);
  };

  const handleCloseCopyModal = (): void => {
    setShowCopyModal(false);
    setSelectedCopyData(null);
  };

  const handleCopySuccess = (): void => {
    setShowCopyModal(false);
    setSelectedCopyData(null);
    fetchKalkulasiData(); // Refresh the data
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
    <div className="container mx-auto py-1">
      {/* Header - remains the same */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="border border-gray-300 rounded px-2 py-1"
          />
        </div>
      </div>

      {/* Data Table - Update Copy button */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  No
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.length > 0 ? (
                data.map((item: KalkulasiItem, index: number) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs">{index + 1}</td>
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
                      {item.status == 'history' && (
                        <button
                          onClick={() => handleCopyClick(item.id)} // Updated to use the new handler
                          disabled={detailLoading}
                          className="bg-pink-500 hover:bg-pink-600 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
                        >
                          {detailLoading ? 'Loading...' : 'Copy'}
                        </button>
                      )}
                    </td>
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
                      <br />
                      {item.status_proses == 'reject kabag' && (
                        <span className="text-red-500 text-xs">
                          {item?.note_kabag}
                        </span>
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

      {/* Copy Options Modal */}
      {showCopyOptionsModal && (
        <CopyOptionsModal
          onClose={handleCloseCopyOptionsModal}
          onSelectRepeat={handleSelectRepeat}
          onSelectRepeatPerubahan={handleSelectRepeatPerubahan}
        />
      )}

      {/* Copy Kalkulasi Modal */}
      {showCopyModal && selectedCopyData && (
        <CopyKalkulasiModal
          originalData={selectedCopyData}
          copyType={copyType}
          onClose={handleCloseCopyModal}
          onSuccess={handleCopySuccess}
        />
      )}
    </div>
  );
};

export default HistoryKalkulasi;
