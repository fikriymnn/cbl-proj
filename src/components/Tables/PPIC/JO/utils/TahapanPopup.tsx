// TahapanPopup.tsx
import React from 'react';
import ReactDOM from 'react-dom';

interface TahapanData {
  id: number;
  nama_proses: string;
  nama_mesin: string;
  nama_drying_time: string;
  value_drying_time: number;
  nama_setting_kapasitas: string;
  value_setting_kapasitas: number;
  index: number;
}

interface TahapanPopupProps {
  isOpen: boolean;
  onClose: () => void;
  tahapanData: TahapanData[];
  mountingName: string;
}

const TahapanPopup: React.FC<TahapanPopupProps> = ({
  isOpen,
  onClose,
  tahapanData,
  mountingName,
}) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b bg-gradient-to-r from-purple-600 to-purple-700 rounded-t-lg">
          <h3 className="text-lg font-bold text-white">
            Tahapan Proses - {mountingName}
          </h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body - Table Format */}
        <div className="overflow-y-auto max-h-96 p-6">
          {tahapanData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Tidak ada data tahapan untuk mounting ini
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-100 to-purple-50">
                    <th className="px-4 py-3 border border-gray-300 text-left font-semibold text-gray-700 w-16">
                      #
                    </th>
                    <th className="px-4 py-3 border border-gray-300 text-left font-semibold text-gray-700">
                      Nama Proses
                    </th>
                    <th className="px-4 py-3 border border-gray-300 text-left font-semibold text-gray-700">
                      Mesin
                    </th>
                    <th className="px-4 py-3 border border-gray-300 text-left font-semibold text-gray-700">
                      Drying Time
                    </th>
                    <th className="px-4 py-3 border border-gray-300 text-left font-semibold text-gray-700">
                      Setting Kapasitas
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {tahapanData.map((tahapan, idx) => (
                    <tr
                      key={tahapan.id}
                      className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                    >
                      <td className="px-4 py-3 border border-gray-300 text-center">
                        <div className="inline-flex items-center justify-center w-8 h-8 bg-purple-600 text-white rounded-full font-bold text-sm">
                          {tahapan.index}
                        </div>
                      </td>
                      <td className="px-4 py-3 border border-gray-300 font-medium text-gray-800">
                        {tahapan.nama_proses}
                      </td>
                      <td className="px-4 py-3 border border-gray-300">
                        <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                          {tahapan.nama_mesin}
                        </span>
                      </td>
                      <td className="px-4 py-3 border border-gray-300">
                        <div className="text-gray-800 font-medium">
                          {tahapan.nama_drying_time}
                        </div>
                        <div className="text-xs text-gray-500">
                          Value: {tahapan.value_drying_time}
                        </div>
                      </td>
                      <td className="px-4 py-3 border border-gray-300">
                        <div className="text-gray-800 font-medium">
                          {tahapan.nama_setting_kapasitas}
                        </div>
                        <div className="text-xs text-gray-500">
                          Value: {tahapan.value_setting_kapasitas}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default TahapanPopup;
