// JONextModal.tsx
import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

export interface NextJOItem {
  id: number;
  no_jo: string;
  tgl_kirim: string;
}

interface JONextModalProps {
  isOpen: boolean;
  onClose: () => void;
  idIO: number;
  tglKirim: string; // format YYYY-MM-DD
}

const formatTanggal = (value: string): string => {
  if (!value) return '-';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const JONextModal: React.FC<JONextModalProps> = ({
  isOpen,
  onClose,
  idIO,
  tglKirim,
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<NextJOItem[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (!idIO || !tglKirim) {
      setData([]);
      return;
    }

    const fetchNextJO = async () => {
      try {
        setLoading(true);
        setErrorMsg('');
        const res: AxiosResponse = await axios.get(
          `${import.meta.env.VITE_API_LINK}/ppic/joNext`,
          {
            params: { id_io: idIO, tgl_kirim: tglKirim },
            withCredentials: true,
          },
        );
        setData(res.data?.data || []);
      } catch (error) {
        console.error('Error fetching next JO:', error);
        setData([]);
        setErrorMsg('Gagal mengambil data Next JO');
      } finally {
        setLoading(false);
      }
    };

    fetchNextJO();
  }, [isOpen, idIO, tglKirim]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-lg shadow-xl flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b bg-gradient-to-r from-purple-600 to-purple-700 rounded-t-lg">
          <h3 className="text-base font-bold text-white">Next JO</h3>
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

        {/* Body */}
        <div className="p-5 overflow-y-auto">
          <p className="text-xs text-gray-500 mb-3">
            JO berikutnya untuk IO ini setelah tanggal kirim{' '}
            <span className="font-semibold text-gray-700">
              {formatTanggal(tglKirim)}
            </span>
          </p>

          {loading ? (
            <div className="text-center py-6">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
              <p className="mt-2 text-sm text-gray-500">Memuat data...</p>
            </div>
          ) : errorMsg ? (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {errorMsg}
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-6 text-sm text-gray-500">
              Tidak ada Next JO
            </div>
          ) : (
            <table className="w-full text-sm border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-3 py-2 text-left">No JO</th>
                  <th className="border px-3 py-2 text-left">Tgl Kirim</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.id}>
                    <td className="border px-3 py-2 font-medium">
                      {item.no_jo}
                    </td>
                    <td className="border px-3 py-2">
                      {formatTanggal(item.tgl_kirim)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-5 py-3 border-t bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default JONextModal;
