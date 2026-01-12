// UbahTglKirimPopup.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { SOData } from './types/SOTypes';

interface UbahTglKirimPopupProps {
  isOpen: boolean;
  onClose: () => void;
  soData: SOData | null;
  onSuccess: () => void;
}

const UbahTglKirimPopup: React.FC<UbahTglKirimPopupProps> = ({
  isOpen,
  onClose,
  soData,
  onSuccess,
}) => {
  const [tglPerubahan, setTglPerubahan] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Reset form when popup opens
  React.useEffect(() => {
    if (isOpen && soData) {
      setTglPerubahan('');
      setNote('');
      setError('');
    }
  }, [isOpen, soData]);

  // Format date for input field (YYYY-MM-DD)
  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Format date for display (DD/MM/YYYY)
  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!soData) return;

    // Validation
    if (!tglPerubahan) {
      setError('Tanggal perubahan harus diisi');
      return;
    }

    if (!soData.tgl_pengiriman) {
      setError('Tanggal pengiriman awal tidak ditemukan');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const url = `${
        import.meta.env.VITE_API_LINK
      }/marketing/soPerubahanTanggalKirim`;

      const response = await axios.post(
        url,
        {
          id_so: soData.id,
          tgl_awal: formatDateForInput(soData.tgl_pengiriman),
          tgl_perubahan: tglPerubahan,
          note: note || undefined,
        },
        {
          withCredentials: true,
        },
      );

      if (response.data.succes) {
        alert('Perubahan tanggal kirim berhasil diajukan');
        onSuccess();
        onClose();
      } else {
        setError(
          response.data.message || 'Gagal mengajukan perubahan tanggal kirim',
        );
      }
    } catch (err: any) {
      console.error('Error submitting perubahan tanggal kirim:', err);
      setError(
        err.response?.data?.message ||
          'Terjadi kesalahan saat mengajukan perubahan tanggal kirim',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !soData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              Ubah Tanggal Kirim
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isSubmitting}
            >
              <svg
                className="w-6 h-6"
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
        </div>

        <div className="px-6 py-4">
          {/* SO Information */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Informasi SO</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">No SO:</span>
                <p className="font-medium">{soData.no_so}</p>
              </div>
              <div>
                <span className="text-gray-600">No IO:</span>
                <p className="font-medium">{soData.no_io}</p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Customer:</span>
                <p className="font-medium">{soData.customer}</p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Produk:</span>
                <p className="font-medium">{soData.produk}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Pengiriman Awal
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700">
                  {formatDateForDisplay(soData.tgl_pengiriman)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Tanggal pengiriman saat ini dari SO
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Perubahan <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={tglPerubahan}
                  onChange={(e) => setTglPerubahan(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catatan
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan catatan perubahan tanggal kirim..."
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Memproses...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UbahTglKirimPopup;
