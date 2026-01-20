// UbahHargaPopup.tsx
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { SOData } from './types/SOTypes';

interface UbahHargaPopupProps {
  isOpen: boolean;
  onClose: () => void;
  soData: SOData | null;
  onSuccess: () => void;
}

const UbahHargaPopup: React.FC<UbahHargaPopupProps> = ({
  isOpen,
  onClose,
  soData,
  onSuccess,
}) => {
  const [hargaPerubahan, setHargaPerubahan] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen && soData) {
      // Reset form when popup opens
      setHargaPerubahan('');
      setNote('');
      setError('');
    }
  }, [isOpen, soData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!soData) return;

    // Validation
    if (!hargaPerubahan || parseFloat(hargaPerubahan) <= 0) {
      setError('Harga perubahan harus diisi dan lebih dari 0');
      return;
    }

    if (!note.trim()) {
      setError('Note harus diisi');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        id_so: soData.id,
        harga_awal: soData.harga_jual, // Using harga_jual from SO data
        harga_perubahan: parseFloat(hargaPerubahan),
        note: note.trim(),
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_LINK}/marketing/soPerubahanHarga`,
        payload,
        {
          withCredentials: true,
        },
      );

      if (response.data.succes) {
        alert('Permintaan perubahan harga berhasil diajukan');
        onSuccess();
        onClose();
      } else {
        setError(response.data.message || 'Gagal mengajukan perubahan harga');
      }
    } catch (err: any) {
      console.error('Error submitting perubahan harga:', err);
      setError(
        err.response?.data?.message ||
          'Terjadi kesalahan saat mengajukan perubahan harga',
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Ubah Harga SO</h2>

        {soData && (
          <div className="mb-4 p-4 bg-gray-50 rounded">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="font-semibold">No SO:</div>
              <div>{soData.no_so}</div>

              <div className="font-semibold">Customer:</div>
              <div>{soData.customer}</div>

              <div className="font-semibold">Produk:</div>
              <div>{soData.produk}</div>

              <div className="font-semibold">Harga Jual Saat Ini:</div>
              <div className="text-blue-600 font-semibold">
                {formatCurrency(soData.harga_jual || 0)}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Harga Perubahan <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={hargaPerubahan}
              onChange={(e) => setHargaPerubahan(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan harga baru"
              min="0"
              step="0.01"
              disabled={loading}
            />
            {hargaPerubahan && parseFloat(hargaPerubahan) > 0 && (
              <div className="mt-1 text-sm text-gray-600">
                Preview: {formatCurrency(parseFloat(hargaPerubahan))}
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Catatan <span className="text-red-500">*</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Masukkan alasan perubahan harga"
              disabled={loading}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded transition-colors"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? 'Mengirim...' : 'Ajukan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UbahHargaPopup;
