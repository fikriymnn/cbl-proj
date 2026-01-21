// components/BOM/Modals/TambahCorrugatedModal.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchableSelect from '../../../../../pages/MasterData/Marketing/SearchableSelect';

interface TambahCorrugatedModalProps {
  onClose: () => void;
  onSave: (data: {
    id_corrugated: number;
    nama_corrugated: string;
    isi_per_pack: number;
    qty_corrugated: number;
    tipe: string;
  }) => void;
  po_qty?: number;
}

const TambahCorrugatedModal: React.FC<TambahCorrugatedModalProps> = ({
  onClose,
  onSave,
  po_qty = 0,
}) => {
  const [formData, setFormData] = useState({
    id_corrugated: '',
    nama_corrugated: '',
    isi_per_pack: 0,
    tipe: 'DRAFT',
  });
  const [corrugatedOptions, setCorrugatedOptions] = useState<
    Array<{ id: number; kode_barang: string; nama_barang: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [calculatedQty, setCalculatedQty] = useState(0);

  useEffect(() => {
    fetchCorrugatedData();
  }, []);

  // Calculate qty_corrugated whenever isi_per_pack changes
  useEffect(() => {
    if (formData.isi_per_pack > 0 && po_qty > 0) {
      const result = po_qty / formData.isi_per_pack;
      setCalculatedQty(Math.ceil(result));
    } else {
      setCalculatedQty(0);
    }
  }, [formData.isi_per_pack, po_qty]);

  const fetchCorrugatedData = async () => {
    setLoading(true);
    try {
      // Fetch CORRUGATED
      const corrugatedResponse = await axios.get(
        `${import.meta.env.VITE_API_LINK}/master/barang`,
        {
          params: {
            kategori: 'CORRUGATED',
          },
          withCredentials: true,
        },
      );

      // Fetch CASSING
      const cassingResponse = await axios.get(
        `${import.meta.env.VITE_API_LINK}/master/barang`,
        {
          params: {
            kategori: 'CASSING',
          },
          withCredentials: true,
        },
      );

      // Combine both results
      const corrugatedData = corrugatedResponse.data?.data || [];
      const cassingData = cassingResponse.data?.data || [];

      const combinedData = [
        ...corrugatedData.map((item: any) => ({
          ...item,
          kategori: 'CORRUGATED',
        })),
        ...cassingData.map((item: any) => ({ ...item, kategori: 'CASSING' })),
      ];

      setCorrugatedOptions(combinedData);
    } catch (error) {
      console.error('Error fetching corrugated/cassing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCorrugatedChange = (value: string | number) => {
    const selectedCorrugated = corrugatedOptions.find(
      (item) => item.id.toString() === value.toString(),
    );

    if (selectedCorrugated) {
      setFormData({
        ...formData,
        id_corrugated: value.toString(),
        nama_corrugated: ` ${selectedCorrugated.nama_barang}`,
      });
    } else {
      setFormData({
        ...formData,
        id_corrugated: '',
        nama_corrugated: '',
      });
    }
  };

  const handleIsiPerPackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setFormData({
      ...formData,
      isi_per_pack: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.id_corrugated || formData.isi_per_pack <= 0) {
      alert('Mohon lengkapi semua data');
      return;
    }

    onSave({
      id_corrugated: Number(formData.id_corrugated),
      nama_corrugated: formData.nama_corrugated,
      isi_per_pack: formData.isi_per_pack,
      qty_corrugated: calculatedQty,
      tipe: formData.tipe,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Tambah Data Corrugated
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* PO Qty Info */}
          {po_qty > 0 && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm">
              <div className="text-gray-700">
                <span className="font-semibold">Qty:</span> {po_qty}
              </div>
              {formData.isi_per_pack > 0 && (
                <div className="text-gray-700 mt-1">
                  <span className="font-semibold">Formula:</span> {po_qty} ÷{' '}
                  {formData.isi_per_pack} ={' '}
                  <span className="font-bold text-blue-600">
                    {calculatedQty}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Item Corrugated */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Corrugated
            </label>
            {loading ? (
              <div className="text-sm text-gray-500">Loading data...</div>
            ) : (
              <SearchableSelect
                options={[
                  { value: '', label: 'Pilih Data' },
                  ...corrugatedOptions.map((corrugated) => ({
                    value: corrugated.id.toString(),
                    label: `${corrugated.kode_barang} - ${corrugated.nama_barang}`,
                  })),
                ]}
                value={formData.id_corrugated}
                onChange={handleCorrugatedChange}
                placeholder="Pilih Corrugated"
                required
              />
            )}
          </div>

          {/* Isi per pack */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Isi per pack
            </label>
            <input
              type="number"
              value={formData.isi_per_pack || ''}
              onChange={handleIsiPerPackChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan isi per pack"
              min="1"
              required
            />
          </div>

          {/* Calculated Qty Display */}
          {calculatedQty > 0 && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-sm text-gray-700">
                <span className="font-semibold">Qty Corrugated (Auto):</span>
              </div>
              <div className="text-2xl font-bold text-green-600 mt-1">
                {calculatedQty}
              </div>
            </div>
          )}

          {/* Tipe */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipe
            </label>
            <input
              type="text"
              value={formData.tipe}
              onChange={(e) =>
                setFormData({ ...formData, tipe: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="DRAFT"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Tutup
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              disabled={!formData.id_corrugated || formData.isi_per_pack <= 0}
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TambahCorrugatedModal;
