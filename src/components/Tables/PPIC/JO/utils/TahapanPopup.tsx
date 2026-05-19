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

// Raw shape from the mounting API (used to detect null validation fields)
interface RawTahapanItem {
  id: number;
  id_drying_time: number | null;
  id_setting_kapasitas: number | null;
  nama_mesin: string;
  nama_proses: string;
}

interface TahapanPopupProps {
  isOpen: boolean;
  onClose: () => void;
  tahapanData?: TahapanData[] | null;
  mountingName: string;
  // NEW: raw tahapan list (with id_drying_time / id_setting_kapasitas)
  // used purely for validation highlighting — keyed by id
  rawTahapan?: RawTahapanItem[];
}

const TahapanPopup: React.FC<TahapanPopupProps> = ({
  isOpen,
  onClose,
  tahapanData,
  mountingName,
  rawTahapan = [],
}) => {
  if (!isOpen) return null;

  // Build a fast lookup: id → raw item
  const rawById = new Map<number, RawTahapanItem>(
    rawTahapan.map((t) => [t.id, t]),
  );

  const getMissingFields = (tahapanId: number): string[] => {
    const raw = rawById.get(tahapanId);
    if (!raw) return [];
    const missing: string[] = [];
    if (raw.id_drying_time === null) missing.push('Drying Time');
    if (raw.id_setting_kapasitas === null) missing.push('Setting Kapasitas');
    return missing;
  };

  const hasAnyIssue = tahapanData?.some(
    (t) => getMissingFields(t.id).length > 0,
  );

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b bg-gradient-to-r from-purple-600 to-purple-700 rounded-t-lg">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-white">
              Tahapan Proses - {mountingName}
            </h3>
            {hasAnyIssue && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500 text-white text-xs font-semibold rounded-full">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                  />
                </svg>
                Ada data yang belum lengkap
              </span>
            )}
          </div>
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

        {/* Legend — only shown when there are issues */}
        {hasAnyIssue && (
          <div className="mx-6 mt-4 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <svg
              className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              />
            </svg>
            <p className="text-xs text-red-700">
              Baris yang ditandai <span className="font-semibold">merah</span>{' '}
              memiliki kolom yang belum diset. Lengkapi{' '}
              <span className="font-semibold">Drying Time</span> dan/atau{' '}
              <span className="font-semibold">Setting Kapasitas</span> pada
              tahapan tersebut sebelum membuat JO.
            </p>
          </div>
        )}

        {/* Body - Table Format */}
        <div className="overflow-y-auto max-h-96 p-6">
          {tahapanData?.length === 0 ? (
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
                  {tahapanData?.map((tahapan, idx) => {
                    const missingFields = getMissingFields(tahapan.id);
                    const hasIssue = missingFields.length > 0;
                    const missingDrying = missingFields.includes('Drying Time');
                    const missingKapasitas =
                      missingFields.includes('Setting Kapasitas');

                    return (
                      <tr
                        key={tahapan.id}
                        className={
                          hasIssue
                            ? 'bg-red-50 border-l-4 border-l-red-500'
                            : idx % 2 === 0
                            ? 'bg-gray-50'
                            : 'bg-white'
                        }
                      >
                        {/* Index */}
                        <td className="px-4 py-3 border border-gray-300 text-center">
                          <div
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm text-white ${
                              hasIssue ? 'bg-red-500' : 'bg-purple-600'
                            }`}
                          >
                            {tahapan.index}
                          </div>
                        </td>

                        {/* Nama Proses */}
                        <td className="px-4 py-3 border border-gray-300 font-medium text-gray-800">
                          <div className="flex items-center gap-2">
                            {tahapan.nama_proses}
                            {hasIssue && (
                              <span
                                title={`Belum diset: ${missingFields.join(
                                  ', ',
                                )}`}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded"
                              >
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                                  />
                                </svg>
                                Belum lengkap
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Mesin */}
                        <td className="px-4 py-3 border border-gray-300">
                          <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                            {tahapan.nama_mesin}
                          </span>
                        </td>

                        {/* Drying Time */}
                        <td
                          className={`px-4 py-3 border border-gray-300 ${
                            missingDrying ? 'bg-red-100' : ''
                          }`}
                        >
                          {missingDrying ? (
                            <div className="flex items-center gap-1.5">
                              <svg
                                className="w-4 h-4 text-red-500 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                />
                              </svg>
                              <span className="text-red-600 font-semibold text-xs">
                                Belum diset
                              </span>
                            </div>
                          ) : (
                            <>
                              <div className="text-gray-800 font-medium">
                                {tahapan.nama_drying_time}
                              </div>
                              <div className="text-xs text-gray-500">
                                Value: {tahapan.value_drying_time}
                              </div>
                            </>
                          )}
                        </td>

                        {/* Setting Kapasitas */}
                        <td
                          className={`px-4 py-3 border border-gray-300 ${
                            missingKapasitas ? 'bg-red-100' : ''
                          }`}
                        >
                          {missingKapasitas ? (
                            <div className="flex items-center gap-1.5">
                              <svg
                                className="w-4 h-4 text-red-500 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                />
                              </svg>
                              <span className="text-red-600 font-semibold text-xs">
                                Belum diset
                              </span>
                            </div>
                          ) : (
                            <>
                              <div className="text-gray-800 font-medium">
                                {tahapan.nama_setting_kapasitas}
                              </div>
                              <div className="text-xs text-gray-500">
                                Value: {tahapan.value_setting_kapasitas}
                              </div>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
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
