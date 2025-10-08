// components/BOM/tabs/BOMLemTab.tsx
import React, { useState } from 'react';
import type { BOMLem } from '../Types/bom.types';
import TambahLemModal from '../Modals/TambahLemModal';

interface BOMLemTabProps {
  data: BOMLem[];
  onChange: (data: BOMLem[]) => void;
  po_qty?: number;
  tinggi_io?: number;
}

const BOMLemTab: React.FC<BOMLemTabProps> = ({
  data,
  onChange,
  po_qty,
  tinggi_io,
}) => {
  const [showModal, setShowModal] = useState(false);

  const handleAdd = () => {
    setShowModal(true);
  };

  const handleSaveFromModal = (newData: {
    id_lem: number;
    nama_lem: string;
    rumus_lem: string;
    qty_konstanta: number;
    qty_lock_bottom: number;
    qty_lem_samping: number;
    qty_four_corner: number;
    qty_samping_lock_bottom: number;
    qty_six_corner: number;
    qty_ujung_lock_bottom: number;
    tipe: string;
  }) => {
    const newItem: BOMLem = {
      id: null, // ✅ Add this - explicitly set to null for new items
      ...newData,
      is_selected: false,
    };
    onChange([...data, newItem]);
  };

  // Handle checkbox selection - only one can be selected at a time
  const handleCheckboxChange = (index: number, checked: boolean) => {
    const updated = data.map((item, i) => ({
      ...item,
      is_selected: i === index ? checked : false, // Uncheck all others
    }));
    onChange(updated);
  };

  const handleDelete = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  // Get the selected lem
  const selectedLem = data.find((item) => item.is_selected);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          disabled={!po_qty || !tinggi_io}
        >
          <span>+</span>
          Tambah Data Lem
        </button>

        {selectedLem && (
          <div className="px-4 py-2 bg-green-100 border border-green-300 rounded-lg text-sm">
            <span className="font-semibold text-green-800">Lem Terpilih: </span>
            <span className="text-green-700">{selectedLem.nama_lem}</span>
          </div>
        )}
      </div>

      {(!po_qty || !tinggi_io) && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          ⚠️ Qty SO dan Tinggi IO belum tersedia. Pilih mounting terlebih
          dahulu.
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 border-b text-left font-medium text-gray-700">
                Lem
              </th>
              <th className="px-3 py-2 border-b text-left font-medium text-gray-700">
                Rumus
              </th>

              <th className="px-3 py-2 border-b text-left font-medium text-gray-700">
                Qty Konstanta
              </th>
              <th className="px-3 py-2 border-b text-left font-medium text-gray-700">
                Qty Lock Bottom
              </th>
              <th className="px-3 py-2 border-b text-left font-medium text-gray-700">
                Qty Lem Samping
              </th>
              <th className="px-3 py-2 border-b text-left font-medium text-gray-700">
                Qty Four Corner
              </th>
              <th className="px-3 py-2 border-b text-left font-medium text-gray-700">
                Qty Samping Lock Bottom
              </th>
              <th className="px-3 py-2 border-b text-left font-medium text-gray-700">
                Qty Six Corner
              </th>
              <th className="px-3 py-2 border-b text-left font-medium text-gray-700">
                Qty Ujung Lock Bottom
              </th>
              <th className="px-3 py-2 border-b text-center font-medium text-gray-700">
                <div className="flex flex-col items-center">
                  <span>Pilih</span>
                  <span className="text-xs text-gray-500 font-normal">
                    (Hanya 1)
                  </span>
                </div>
              </th>
              <th className="px-3 py-2 border-b text-left font-medium text-gray-700">
                Act
              </th>
            </tr>
          </thead>
          <tbody>
            {data?.length === 0 ? (
              <tr>
                <td
                  colSpan={11}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  Belum ada data lem
                </td>
              </tr>
            ) : (
              data?.map((item, index) => (
                <tr
                  key={index}
                  className={`hover:bg-gray-50 ${
                    item.is_selected ? 'bg-green-50' : ''
                  }`}
                >
                  <td className="px-3 py-2 border-b">
                    <div className="flex items-center gap-2">
                      {item.is_selected && (
                        <span className="text-green-600 font-bold">✓</span>
                      )}
                      <input
                        type="text"
                        value={item.nama_lem}
                        className="w-full px-2 py-1 border border-gray-300 rounded bg-gray-100"
                        readOnly
                      />
                    </div>
                  </td>
                  <td className="px-3 py-2 border-b">
                    <input
                      type="text"
                      value={item.rumus_lem}
                      className="w-full px-2 py-1 border border-gray-300 rounded bg-gray-100"
                      readOnly
                    />
                  </td>

                  <td className="px-3 py-2 border-b">
                    <input
                      type="number"
                      step="0.01"
                      value={item.qty_konstanta}
                      className="w-full px-2 py-1 border border-gray-300 rounded bg-gray-100"
                      readOnly
                    />
                  </td>
                  <td className="px-3 py-2 border-b">
                    <input
                      type="number"
                      step="0.01"
                      value={item.qty_lock_bottom}
                      className="w-full px-2 py-1 border border-gray-300 rounded bg-gray-100"
                      readOnly
                    />
                  </td>
                  <td className="px-3 py-2 border-b">
                    <input
                      type="number"
                      step="0.01"
                      value={item.qty_lem_samping}
                      className="w-full px-2 py-1 border border-gray-300 rounded bg-gray-100"
                      readOnly
                    />
                  </td>
                  <td className="px-3 py-2 border-b">
                    <input
                      type="number"
                      step="0.01"
                      value={item.qty_four_corner}
                      className="w-full px-2 py-1 border border-gray-300 rounded bg-gray-100"
                      readOnly
                    />
                  </td>
                  <td className="px-3 py-2 border-b">
                    <input
                      type="number"
                      step="0.01"
                      value={item.qty_samping_lock_bottom}
                      className="w-full px-2 py-1 border border-gray-300 rounded bg-gray-100"
                      readOnly
                    />
                  </td>
                  <td className="px-3 py-2 border-b">
                    <input
                      type="number"
                      step="0.01"
                      value={item.qty_six_corner}
                      className="w-full px-2 py-1 border border-gray-300 rounded bg-gray-100"
                      readOnly
                    />
                  </td>
                  <td className="px-3 py-2 border-b">
                    <input
                      type="number"
                      step="0.01"
                      value={item.qty_ujung_lock_bottom}
                      className="w-full px-2 py-1 border border-gray-300 rounded bg-gray-100"
                      readOnly
                    />
                  </td>
                  <td className="px-3 py-2 border-b text-center">
                    <input
                      type="checkbox"
                      checked={item.is_selected}
                      onChange={
                        (e) => handleCheckboxChange(index, e.target.checked) // ✅ NEW - uses handleCheckboxChange
                      }
                      className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500 cursor-pointer"
                    />
                  </td>
                  <td className="px-3 py-2 border-b">
                    <button
                      onClick={() => handleDelete(index)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs whitespace-nowrap"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <TambahLemModal
          onClose={() => setShowModal(false)}
          onSave={handleSaveFromModal}
          po_qty={po_qty}
          tinggi_io={tinggi_io}
        />
      )}
    </div>
  );
};

export default BOMLemTab;
