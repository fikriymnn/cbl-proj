import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { KalkulasiData } from './types/SOTypes';

interface SODoneIOManualPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const SODoneIOManualPopup: React.FC<SODoneIOManualPopupProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [kalkulasiData, setKalkulasiData] = useState<KalkulasiData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitLoading, setSubmitLoading] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchKalkulasiData();
    }
  }, [isOpen]);

  const fetchKalkulasiData = async () => {
    const url = `${import.meta.env.VITE_API_LINK}/marketing/kalkulasi`;
    setLoading(true);
    try {
      const response = await axios.get(url, {
        params: {
          is_io_active: true,
        },
        withCredentials: true,
      });

      if (response.data.succes && response.data.data) {
        // Group by id_io and filter based on status_kalkulasi
        const groupedByIdIO = response.data.data.reduce(
          (acc: Record<string, KalkulasiData[]>, item: KalkulasiData) => {
            const idIO = item.id_io?.toString() || '';
            if (!acc[idIO]) {
              acc[idIO] = [];
            }
            acc[idIO].push(item);
            return acc;
          },
          {} as Record<string, KalkulasiData[]>,
        );

        const filteredData: KalkulasiData[] = [];
        Object.keys(groupedByIdIO).forEach((idIO) => {
          const items = groupedByIdIO[idIO];
          if (items.length > 1) {
            const baruItem = items.find(
              (item: KalkulasiData) =>
                item.status_kalkulasi?.toLowerCase() === 'baru',
            );
            if (baruItem) {
              filteredData.push(baruItem);
            } else {
              filteredData.push(items[0]);
            }
          } else {
            filteredData.push(items[0]);
          }
        });

        setKalkulasiData(filteredData);
      }
    } catch (error) {
      console.error('Error fetching Kalkulasi data:', error);
      alert('Error fetching IO data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDoneManual = async (id_io: number) => {
    if (
      window.confirm(
        'Apakah Anda yakin ingin menyelesaikan IO ini secara manual?',
      )
    ) {
      try {
        setSubmitLoading(id_io);
        const url = `${
          import.meta.env.VITE_API_LINK
        }/marketing/io/doneManual/${id_io}`;
        const res = await axios.put(
          url,
          {},
          {
            withCredentials: true,
          },
        );

        if (res.data.succes) {
          alert('IO berhasil diselesaikan secara manual!');
          fetchKalkulasiData();
          onSuccess();
        }
      } catch (error: any) {
        console.error('Error completing IO manually:', error);
        alert(
          error.response?.data?.message ||
            'Gagal menyelesaikan IO. Silakan coba lagi.',
        );
      } finally {
        setSubmitLoading(null);
      }
    }
  };

  const filteredData = kalkulasiData.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.no_io?.toLowerCase().includes(searchLower) ||
      item.nama_customer?.toLowerCase().includes(searchLower) ||
      item.nama_produk?.toLowerCase().includes(searchLower)
    );
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Done IO Manual</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="Search by No IO, Customer, or Produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NO
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NO IO
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CUSTOMER
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PRODUK
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      STATUS
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ACTION
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-6 text-center text-gray-500"
                      >
                        {searchTerm
                          ? 'No IO found matching your search'
                          : 'No IO data available'}
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item, index) => (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded font-medium">
                            {item.no_io || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {item.nama_customer || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {item.nama_produk || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-medium uppercase">
                            {item.status_kalkulasi || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            onClick={() => handleDoneManual(item.id_io!)}
                            disabled={submitLoading === item.id_io}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {submitLoading === item.id_io
                              ? 'Processing...'
                              : 'Done Manual'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SODoneIOManualPopup;
