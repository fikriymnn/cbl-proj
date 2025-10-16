import React from 'react';
import { BOMLainLain } from '../Types/bom.types';

interface BOMLainLainTabProps {
  data: BOMLainLain[];
  onChange: (data: BOMLainLain[]) => void;
}

const BOMLainLainTab: React.FC<BOMLainLainTabProps> = ({ data, onChange }) => {
  const handleAddItem = () => {
    const newItem: BOMLainLain = {
      id: null, // ✅ Default id = null for new items
      nama_item: '',
      harga: 0,
    };
    onChange([...data, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    const updatedData = data.filter((_, i) => i !== index);
    onChange(updatedData);
  };

  const handleItemChange = (
    index: number,
    field: keyof BOMLainLain,
    value: string | number,
  ) => {
    const updatedData = [...data];
    updatedData[index] = {
      ...updatedData[index],
      [field]: value,
    };
    onChange(updatedData);
  };

  // Calculate total harga
  const totalHarga = data.reduce((sum, item) => sum + (item.harga || 0), 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">🧾 Lain-lain</h3>
        <button
          onClick={handleAddItem}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm"
        >
          <span>+</span>
          <span>Tambah Item</span>
        </button>
      </div>

      {/* Empty State */}
      {data.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
          <p className="text-gray-500 mb-2">Belum ada item lain-lain</p>
          <p className="text-sm text-gray-400">
            Klik "Tambah Item" untuk menambah item baru
          </p>
        </div>
      )}

      {/* Items List */}
      <div className="space-y-4">
        {data.map((item, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-4 bg-white"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nama Item */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Item
                </label>
                <input
                  type="text"
                  value={item.nama_item}
                  onChange={(e) =>
                    handleItemChange(index, 'nama_item', e.target.value)
                  }
                  placeholder="Masukkan nama item"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Harga */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Harga
                  </label>
                  <input
                    type="number"
                    value={item.harga}
                    onChange={(e) =>
                      handleItemChange(index, 'harga', Number(e.target.value))
                    }
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    min="0"
                  />
                </div>

                {/* Delete Button */}
                <div className="flex items-end">
                  <button
                    onClick={() => handleRemoveItem(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hapus item"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Item Section (Summary) */}
      {data.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h4 className="font-semibold text-blue-900">Detail Item</h4>
          </div>

          <div className="space-y-2">
            {data.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center text-sm"
              >
                <span className="text-gray-700">
                  {item.nama_item || `Item ${index + 1}`}
                </span>
                <span className="font-medium text-blue-900">
                  Rp {item.harga.toLocaleString('id-ID')}
                </span>
              </div>
            ))}

            {/* Total */}
            <div className="pt-3 mt-3 border-t-2 border-blue-200">
              <div className="flex justify-between items-center">
                <span className="font-bold text-blue-900">
                  Total ({data.length} item)
                </span>
                <span className="font-bold text-lg text-blue-900">
                  Rp {totalHarga.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BOMLainLainTab;
