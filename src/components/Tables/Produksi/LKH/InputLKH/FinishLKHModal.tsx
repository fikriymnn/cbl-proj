import React from 'react';
import { LKHProses } from './types';

interface FinishLKHModalProps {
  show: boolean;
  loading: boolean;
  finishData: LKHProses[];

  onClose: () => void;
  onSubmit: () => void;
  onDataChange: (
    index: number,
    field: keyof LKHProses,
    value: string | number,
  ) => void;
}

const FinishLKHModal: React.FC<FinishLKHModalProps> = ({
  show,
  loading,
  finishData,

  onClose,
  onSubmit,
  onDataChange,
}) => {
  if (!show) return null;

  const formatDateTime = (dateString: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${day} ${month} ${year} ${hours}:${minutes}:${seconds}`;
  };

  const formatDuration = (totalSeconds: number | string): string => {
    const seconds =
      typeof totalSeconds === 'string' ? parseInt(totalSeconds) : totalSeconds;

    if (isNaN(seconds) || seconds < 0) return '-';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts: string[] = [];

    if (hours > 0) parts.push(`${hours} Jam`);
    if (minutes > 0) parts.push(`${minutes} Menit`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs} Detik`);

    return parts.join(' ');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Review Data Proses Selesai
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Periksa dan edit data sebelum menyelesaikan LKH
          </p>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {finishData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Tidak ada data proses selesai</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kode
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deskripsi
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Waktu Pengerjaan
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durasi
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Baik
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rusak Sebagian
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rusak Total
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pallet
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Catatan
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {finishData.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                        {item.kode}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-900">
                        {item.deskripsi}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-900">
                        <div className="whitespace-nowrap">
                          <div className="text-gray-700 font-medium">
                            {formatDateTime(item.waktu_mulai)}
                          </div>
                          <div className="text-gray-500 mt-0.5">
                            {formatDateTime(item.waktu_selesai || '')}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                        <div className="font-medium">
                          {formatDuration(item.total_waktu || '0')}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <input
                          type="number"
                          value={item.baik || ''}
                          onChange={(e) =>
                            onDataChange(
                              index,
                              'baik',
                              e.target.value ? Number(e.target.value) : 0,
                            )
                          }
                          className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <input
                          type="number"
                          value={item.rusak_sebagian || ''}
                          onChange={(e) =>
                            onDataChange(
                              index,
                              'rusak_sebagian',
                              e.target.value ? Number(e.target.value) : 0,
                            )
                          }
                          className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <input
                          type="number"
                          value={item.rusak_total || ''}
                          onChange={(e) =>
                            onDataChange(
                              index,
                              'rusak_total',
                              e.target.value ? Number(e.target.value) : 0,
                            )
                          }
                          className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <input
                          type="number"
                          value={item.pallet || ''}
                          onChange={(e) =>
                            onDataChange(
                              index,
                              'pallet',
                              e.target.value ? Number(e.target.value) : 0,
                            )
                          }
                          className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={item.note || ''}
                          onChange={(e) =>
                            onDataChange(index, 'note', e.target.value)
                          }
                          className="w-32 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Catatan"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
            disabled={loading}
          >
            Batal
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={loading || finishData.length === 0}
          >
            {loading ? 'Memproses...' : 'Selesaikan LKH'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinishLKHModal;
