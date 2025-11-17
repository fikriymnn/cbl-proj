import React, { useEffect, useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import KalkulasiModal from './KalkulasiModal';
import KalkulasiDetailModal from './KalkulasiDetailModal';
import KalkulasiTypeModal from './KalkulasiTypeModal';
import {
  KalkulasiItem,
  KalkulasiDetailItem,
  ApiResponse,
  ApiError,
} from '../Kalkulasi/types/kalkulasi';

const KalkulasiNormal: React.FC = () => {
  const [data, setData] = useState<KalkulasiItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showTypeModal, setShowTypeModal] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [selectedKalkulasiType, setSelectedKalkulasiType] = useState<
    'normal' | 'multi' | 'manual' | null
  >(null);
  const [selectedDetailData, setSelectedDetailData] =
    useState<KalkulasiDetailItem | null>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);

  // State for edit mode
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editData, setEditData] = useState<KalkulasiDetailItem | null>(null);

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
    setShowTypeModal(true);
  };

  const handleSelectType = (type: 'normal' | 'multi' | 'manual'): void => {
    setSelectedKalkulasiType(type);
    setShowTypeModal(false);
    setIsEditMode(false);
    setEditData(null);
    setShowModal(true);
  };

  const handleCloseModal = (): void => {
    setShowModal(false);
    setSelectedKalkulasiType(null);
    setIsEditMode(false);
    setEditData(null);
  };

  const handleModalSuccess = (): void => {
    fetchKalkulasiData();
    setShowModal(false);
    setSelectedKalkulasiType(null);
    setIsEditMode(false);
    setEditData(null);
  };
  const handleCloseDetailModal = (): void => {
    setShowDetailModal(false);
    setSelectedDetailData(null);
  };
  // FIXED: Now properly returns KalkulasiDetailItem or undefined
  const fetchKalkulasiDetail = async (
    id: number,
  ): Promise<KalkulasiDetailItem | undefined> => {
    const url = `${import.meta.env.VITE_API_LINK}/marketing/kalkulasi/${id}`;
    try {
      setDetailLoading(true);
      const res: AxiosResponse<ApiResponse<KalkulasiDetailItem>> =
        await axios.get(url, { withCredentials: true });
      console.log('Fetched kalkulasi detail:', res.data);
      if (res.data && res.data.data) {
        return res.data.data;
      }
      return undefined;
    } catch (error) {
      console.error('Error fetching kalkulasi detail:', error);
      const apiError = error as ApiError;
      alert(`Error: ${apiError.message || 'Failed to fetch detail data'}`);
      return undefined;
    } finally {
      setDetailLoading(false);
    }
  };

  const handleViewDetail = async (id: number): Promise<void> => {
    const detail = await fetchKalkulasiDetail(id);
    if (detail) {
      setSelectedDetailData(detail);
      setShowDetailModal(true);
    }
  };

  const handleEdit = async (id: number): Promise<void> => {
    try {
      setDetailLoading(true); // This will show "Loading..." on the button
      const detail = await fetchKalkulasiDetail(id);
      if (detail) {
        setEditData(detail);
        setSelectedKalkulasiType(
          (detail.tipe_kalkulasi as 'normal' | 'multi' | 'manual') || 'normal',
        );
        setIsEditMode(true);
        setShowModal(true);
      }
    } catch (error) {
      // Error already handled in fetchKalkulasiDetail
    } finally {
      setDetailLoading(false); // Reset loading state
    }
  };

  async function RequestKabag(id: any) {
    if (window.confirm('Apakah Anda yakin ingin Submit Kalkulasi Ini?')) {
      try {
        const url = `${
          import.meta.env.VITE_API_LINK
        }/marketing/kalkulasi/submit/${id}`;
        const res = await axios.put(
          url,
          {},
          {
            withCredentials: true,
          },
        );
        fetchKalkulasiData();
        alert('Kalkulasi berhasil disubmit!');
      } catch (error: any) {
        console.log(error);
        alert('Gagal submit kalkulasi');
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
    <div className="mx-auto py-1">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="border border-gray-300 rounded px-2 py-1"
            placeholder="Search..."
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
                  Tipe
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
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase text-center">
                  Status
                </th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase text-center">
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
                      <span
                        className={`px-2 py-1 rounded text-xs uppercase ${
                          item.tipe_kalkulasi === 'multi'
                            ? 'bg-green-100 text-green-800'
                            : item.tipe_kalkulasi === 'manual'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {item.tipe_kalkulasi || 'normal'}
                      </span>
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
                      {item.tipe_kalkulasi === 'multi' && item.qty_list ? (
                        <div className="flex flex-col gap-1">
                          {item.qty_list.map((qtyItem, idx) => (
                            <span
                              key={idx}
                              className={`text-xs ${
                                qtyItem.is_selected ? 'font-bold' : ''
                              }`}
                            >
                              {qtyItem.qty.toLocaleString()}
                              {qtyItem.is_selected && ' ✓'}
                            </span>
                          ))}
                        </div>
                      ) : (
                        item.qty_kalkulasi?.toLocaleString()
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      Rp{' '}
                      {Number(item.total_harga_satuan_customer || 0).toFixed(0)}
                    </td>
                    <td className="px-4 py-3 text-xs text-center">
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs uppercase">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-center">
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs uppercase">
                        {item.status_proses}
                      </span>
                      <br />
                      {item.status_proses === 'reject kabag' && (
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

                      {/* Edit Button - only show for draft status */}
                      {item.status === 'draft' && (
                        <>
                          <button
                            onClick={() => handleEdit(item.id)}
                            disabled={detailLoading}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
                          >
                            {detailLoading ? 'Loading...' : 'Edit'}
                          </button>
                          <button
                            onClick={() => RequestKabag(item.id)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
                          >
                            Submit
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={12}
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

      {/* Type Selection Modal */}
      {showTypeModal && (
        <KalkulasiTypeModal
          onClose={() => setShowTypeModal(false)}
          onSelectType={handleSelectType}
        />
      )}

      {/* Kalkulasi Modal */}
      {showModal && selectedKalkulasiType && (
        <KalkulasiModal
          onClose={handleCloseModal}
          onSuccess={handleModalSuccess}
          kalkulasiType={selectedKalkulasiType}
          isEditMode={isEditMode}
          editData={editData || undefined}
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
