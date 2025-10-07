// components/BOM/Modals/TambahDetailTintaModal.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchableSelect from '../../../../../pages/MasterData/Marketing/SearchableSelect';
import { TintaDetail } from '../Types/bom.types';

interface TambahDetailTintaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TintaDetail) => void;
  currentPersentase: number; // Total persentase yang sudah ada
}

interface ItemTintaOption {
  nama_barang: any;
  kode_barang: any;
  id: number;
}

const TambahDetailTintaModal: React.FC<TambahDetailTintaModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentPersentase,
}) => {
  const [formData, setFormData] = useState<TintaDetail>({
    id_item_tinta: 0,
    nama_item_tinta: '',
    persentase_tinta: 0,
  });

  const [tintaOptions, setTintaOptions] = useState<ItemTintaOption[]>([]);
  const [loadingTinta, setLoadingTinta] = useState(false);

  // Fetch Tinta Options
  useEffect(() => {
    const fetchTintaOptions = async () => {
      setLoadingTinta(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_LINK}/master/barang`,
          {
            params: {
              kategori: 'Tinta',
            },
            withCredentials: true,
          },
        );
        console.log('tinta item', response.data.data);
        if (response.data && response.data.data) {
          const tintaData = response.data.data || [];
          setTintaOptions(tintaData);
        }
      } catch (error) {
        console.error('Error fetching Tinta options:', error);
      } finally {
        setLoadingTinta(false);
      }
    };

    if (isOpen) {
      fetchTintaOptions();
    }
  }, [isOpen]);

  const handleItemTintaChange = (value: string | number) => {
    const selectedItem = tintaOptions.find(
      (opt) => opt.id.toString() === value.toString(),
    );
    console.log(selectedItem);
    if (selectedItem) {
      setFormData((prev) => ({
        ...prev,
        id_item_tinta: selectedItem.id,
        nama_item_tinta: selectedItem.nama_barang,
      }));
    }
  };

  const handlePersentaseChange = (value: number) => {
    const maxAllowed = 100 - currentPersentase;
    if (value <= maxAllowed) {
      setFormData((prev) => ({
        ...prev,
        persentase_tinta: value,
      }));
    } else {
      alert(`Persentase maksimal yang bisa ditambahkan: ${maxAllowed}%`);
    }
  };

  const handleSubmit = () => {
    // Validation
    if (formData.id_item_tinta === 0 || formData.persentase_tinta <= 0) {
      alert('Mohon lengkapi semua field');
      return;
    }

    const totalAfter = currentPersentase + formData.persentase_tinta;
    if (totalAfter > 100) {
      alert(`Total persentase akan melebihi 100% (${totalAfter}%)`);
      return;
    }

    onSave(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      id_item_tinta: 0,
      nama_item_tinta: '',
      persentase_tinta: 0,
    });
    onClose();
  };

  if (!isOpen) return null;

  const remainingPersentase = 100 - currentPersentase;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Tambah Detail Kebutuhan Tinta Warna
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Sisa persentase yang bisa ditambahkan:{' '}
              <span className="font-semibold text-blue-600">
                {remainingPersentase}%
              </span>
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
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

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Item Tinta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Tinta <span className="text-red-500">*</span>
            </label>
            {loadingTinta ? (
              <div className="text-sm text-gray-500">Loading...</div>
            ) : (
              <SearchableSelect
                options={[
                  { value: '', label: 'Pilih Data' },
                  ...tintaOptions.map((item) => ({
                    value: item.id.toString(),
                    label: `${item.kode_barang} - ${item.nama_barang}`,
                  })),
                ]}
                value={formData.id_item_tinta.toString()}
                onChange={handleItemTintaChange}
                placeholder="Pilih Data"
                required
              />
            )}
          </div>

          {/* Persentase Tinta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Persentase Tinta <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.persentase_tinta}
                onChange={(e) => handlePersentaseChange(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                min="0"
                max={remainingPersentase}
                step="0.01"
              />
              <span className="absolute right-3 top-2 text-gray-500">%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Maksimal: {remainingPersentase}%
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Tutup
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
};

export default TambahDetailTintaModal;
