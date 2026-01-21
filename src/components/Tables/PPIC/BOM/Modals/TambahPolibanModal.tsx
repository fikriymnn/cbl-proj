// components/BOM/Modals/TambahPolibanModal.tsx
import React, { useState, useEffect } from 'react';
import SearchableSelect from '../../../../../pages/MasterData/Marketing/SearchableSelect';

interface TambahPolibanModalProps {
  onClose: () => void;
  onSave: (data: {
    item_poliban: string;
    isi_satu_ikat: number;
    lembar_poliban: number;
    qty_poliban: number;
    tipe: string;
  }) => void;
  po_qty?: number;
}

const TambahPolibanModal: React.FC<TambahPolibanModalProps> = ({
  onClose,
  onSave,
  po_qty = 0,
}) => {
  const [formData, setFormData] = useState({
    item_poliban: '',
    isi_satu_ikat: 0,
    lembar_poliban: 32, // Default value
    tipe: 'DRAFT',
  });
  const [calculatedQty, setCalculatedQty] = useState(0);

  // Poliban options: ya atau tidak
  const polibanOptions = [
    { value: '', label: 'Pilih Data' },
    { value: 'ya', label: 'Ya' },
    { value: 'tidak', label: 'Tidak' },
  ];

  // Check if "tidak" is selected
  const isTidakSelected = formData.item_poliban === 'tidak';

  // Calculate qty_poliban whenever dependencies change
  // Formula: (po_qty / isi_satu_ikat) / lembar_poliban
  useEffect(() => {
    if (isTidakSelected) {
      setCalculatedQty(0);
    } else if (
      formData.isi_satu_ikat > 0 &&
      formData.lembar_poliban > 0 &&
      po_qty > 0
    ) {
      const result = po_qty / formData.isi_satu_ikat / formData.lembar_poliban;
      setCalculatedQty(Number(result.toFixed(2))); // Round to 2 decimal places
    } else {
      setCalculatedQty(0);
    }
  }, [
    formData.isi_satu_ikat,
    formData.lembar_poliban,
    po_qty,
    isTidakSelected,
  ]);

  const handlePolibanChange = (value: string | number) => {
    const selectedValue = String(value);

    // If "tidak" is selected, reset other fields to default values
    if (selectedValue === 'tidak') {
      setFormData({
        item_poliban: selectedValue,
        isi_satu_ikat: 0,
        lembar_poliban: 0,
        tipe: 'DRAFT',
      });
    } else {
      setFormData({
        ...formData,
        item_poliban: selectedValue,
        lembar_poliban: 32, // Reset to default when switching to "ya"
      });
    }
  };

  const handleIsiSatuIkatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setFormData({
      ...formData,
      isi_satu_ikat: value,
    });
  };

  const handleLembarPolibanChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = Number(e.target.value);
    setFormData({
      ...formData,
      lembar_poliban: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation: Only check item_poliban is selected
    if (!formData.item_poliban) {
      alert('Mohon pilih Item Poliban');
      return;
    }

    // If "tidak" is selected, allow submission with 0 values
    if (isTidakSelected) {
      onSave({
        item_poliban: formData.item_poliban,
        isi_satu_ikat: 0,
        lembar_poliban: 0,
        qty_poliban: 0,
        tipe: formData.tipe,
      });
      onClose();
      return;
    }

    // If "ya" is selected, validate other fields
    if (formData.isi_satu_ikat <= 0 || formData.lembar_poliban <= 0) {
      alert('Mohon lengkapi semua data');
      return;
    }

    onSave({
      item_poliban: formData.item_poliban,
      isi_satu_ikat: formData.isi_satu_ikat,
      lembar_poliban: formData.lembar_poliban,
      qty_poliban: calculatedQty,
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
            Tambah Data Poliban
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
          {po_qty > 0 && !isTidakSelected && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm">
              <div className="text-gray-700">
                <span className="font-semibold">Qty:</span> {po_qty}
              </div>
              {formData.isi_satu_ikat > 0 && formData.lembar_poliban > 0 && (
                <div className="text-gray-700 mt-1">
                  <span className="font-semibold">Formula:</span> ({po_qty} ÷{' '}
                  {formData.isi_satu_ikat}) ÷ {formData.lembar_poliban} ={' '}
                  <span className="font-bold text-blue-600">
                    {calculatedQty}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Item Poliban */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Poliban <span className="text-red-500">*</span>
            </label>
            <SearchableSelect
              options={polibanOptions}
              value={formData.item_poliban}
              onChange={handlePolibanChange}
              placeholder="Pilih Item Poliban"
              required
            />
          </div>

          {/* Show message when "tidak" is selected */}
          {isTidakSelected && (
            <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
              ℹ️ Tidak perlu mengisi data lainnya untuk pilihan "Tidak"
            </div>
          )}

          {/* Only show other fields when "tidak" is NOT selected */}
          {!isTidakSelected && formData.item_poliban && (
            <>
              {/* Isi 1 Ikat Poliban */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Isi 1 ikat poliban <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.isi_satu_ikat || ''}
                  onChange={handleIsiSatuIkatChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan isi 1 ikat poliban (contoh: 50)"
                  min="1"
                  required
                />
              </div>

              {/* 1 Lembar Poliban */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  1 Lembar Poliban <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.lembar_poliban}
                  onChange={handleLembarPolibanChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Default: 32"
                  min="1"
                  required
                />
                <div className="mt-1 text-xs text-gray-500">
                  Default value: 32
                </div>
              </div>

              {/* Calculated Qty Display */}
              {calculatedQty > 0 && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-sm text-gray-700">
                    <span className="font-semibold">Qty Poliban (Auto):</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600 mt-1">
                    {calculatedQty}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Formula: (Qty SO ÷ Isi 1 Ikat) ÷ Lembar Poliban
                  </div>
                </div>
              )}
            </>
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
              disabled={!formData.item_poliban}
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TambahPolibanModal;
