// components/BOM/tabs/BOMPolibanTab.tsx
import React, { useState, useEffect } from 'react';
import type { BOMPoliban } from '../Types/bom.types';
import TambahPolibanModal from '../Modals/TambahPolibanModal';

interface BOMPolibanTabProps {
  data: BOMPoliban[];
  onChange: (data: BOMPoliban[]) => void;
  po_qty?: number;
}

const BOMPolibanTab: React.FC<BOMPolibanTabProps> = ({
  data,
  onChange,
  po_qty,
}) => {
  const [showModal, setShowModal] = useState(false);

  const safeData = Array.isArray(data) ? data : [];

  // Auto-update qty_poliban when po_qty or related fields change
  useEffect(() => {
    if (po_qty && safeData.length > 0) {
      const updated = safeData.map((item) => {
        if (item.isi_satu_ikat > 0 && item.lembar_poliban > 0) {
          const calculatedQty =
            po_qty / item.isi_satu_ikat / item.lembar_poliban;
          return {
            ...item,
            qty_poliban: Number(calculatedQty.toFixed(2)),
          };
        }
        return item;
      });
      onChange(updated);
    }
  }, [po_qty]);

  const handleAdd = () => {
    setShowModal(true);
  };

  const handleSaveFromModal = (newData: {
    item_poliban: string;
    isi_satu_ikat: number;
    lembar_poliban: number;
    qty_poliban: number;
    tipe: string;
  }) => {
    const newItem: BOMPoliban = {
      id: null, // ✅ Add this - explicitly set to null for new items
      item_poliban: newData.item_poliban,
      isi_satu_ikat: newData.isi_satu_ikat,
      lembar_poliban: newData.lembar_poliban,
      qty_poliban: newData.qty_poliban,
      tipe: newData.tipe,
      is_selected: false,
    };
    onChange([...safeData, newItem]);
  };

  const handleUpdate = (index: number, field: keyof BOMPoliban, value: any) => {
    const updated = data.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item, [field]: value };

        // Recalculate qty_poliban if related fields change
        if (
          (field === 'isi_satu_ikat' || field === 'lembar_poliban') &&
          po_qty &&
          updatedItem.isi_satu_ikat > 0 &&
          updatedItem.lembar_poliban > 0
        ) {
          const calculatedQty =
            po_qty / updatedItem.isi_satu_ikat / updatedItem.lembar_poliban;
          updatedItem.qty_poliban = Number(calculatedQty.toFixed(2));
        }

        return updatedItem;
      }
      return item;
    });
    onChange(updated);
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

  // Get the selected poliban
  const selectedPoliban = safeData.find((item) => item.is_selected);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          disabled={!po_qty}
        >
          <span>+</span>
          Tambah Data Poliban
        </button>

        {selectedPoliban && (
          <div className="px-4 py-2 bg-green-100 border border-green-300 rounded-lg text-sm">
            <span className="font-semibold text-green-800">
              Poliban Terpilih:{' '}
            </span>
            <span className="text-green-700">
              {selectedPoliban.item_poliban}
            </span>
          </div>
        )}
      </div>

      {!po_qty && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          ⚠️ Qty SO belum tersedia
        </div>
      )}

      {po_qty && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm">
          <div className="font-semibold text-gray-700 mb-1">Info:</div>
          <div className="text-gray-600">
            Qty SO: {po_qty} | Formula: (Qty SO ÷ Isi 1 Ikat) ÷ Lembar Poliban =
            Qty Poliban
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 border-b text-left font-medium text-gray-700">
                Tipe
              </th>
              <th className="px-4 py-2 border-b text-left font-medium text-gray-700">
                Item Poliban
              </th>
              <th className="px-4 py-2 border-b text-left font-medium text-gray-700">
                Isi 1 Ikat Poliban
              </th>
              <th className="px-4 py-2 border-b text-left font-medium text-gray-700">
                1 Lembar Poliban
              </th>
              <th className="px-4 py-2 border-b text-left font-medium text-gray-700">
                Qty Poliban (Auto)
              </th>
              <th className="px-4 py-2 border-b text-center font-medium text-gray-700">
                <div className="flex flex-col items-center">
                  <span>Pilih</span>
                  <span className="text-xs text-gray-500 font-normal">
                    (Hanya 1)
                  </span>
                </div>
              </th>
              <th className="px-4 py-2 border-b text-left font-medium text-gray-700">
                Act
              </th>
            </tr>
          </thead>
          <tbody>
            {data?.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  Belum ada data poliban
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
                  <td className="px-4 py-2 border-b">
                    <input
                      type="text"
                      value={item.tipe}
                      onChange={(e) =>
                        handleUpdate(index, 'tipe', e.target.value)
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="DRAFT"
                    />
                  </td>
                  <td className="px-4 py-2 border-b">
                    <div className="flex items-center gap-2">
                      {item.is_selected && (
                        <span className="text-green-600 font-bold">✓</span>
                      )}
                      <input
                        type="text"
                        value={item.item_poliban}
                        onChange={(e) =>
                          handleUpdate(index, 'item_poliban', e.target.value)
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="ya / tidak"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-2 border-b">
                    <input
                      type="number"
                      value={item.isi_satu_ikat}
                      onChange={(e) =>
                        handleUpdate(
                          index,
                          'isi_satu_ikat',
                          Number(e.target.value),
                        )
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="50"
                      min="1"
                    />
                  </td>
                  <td className="px-4 py-2 border-b">
                    <input
                      type="number"
                      value={item.lembar_poliban}
                      onChange={(e) =>
                        handleUpdate(
                          index,
                          'lembar_poliban',
                          Number(e.target.value),
                        )
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="32"
                      min="1"
                    />
                  </td>
                  <td className="px-4 py-2 border-b">
                    <input
                      type="number"
                      value={item.qty_poliban}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none bg-gray-100 text-gray-700 font-semibold"
                      readOnly
                      title="Auto-calculated: (PO Qty ÷ Isi 1 Ikat) ÷ Lembar Poliban"
                      step="0.01"
                    />
                  </td>
                  <td className="px-4 py-2 border-b text-center">
                    <input
                      type="checkbox"
                      checked={item.is_selected}
                      onChange={(e) =>
                        handleCheckboxChange(index, e.target.checked)
                      }
                      className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-2 border-b">
                    <button
                      onClick={() => handleDelete(index)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs"
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
        <TambahPolibanModal
          onClose={() => setShowModal(false)}
          onSave={handleSaveFromModal}
          po_qty={po_qty}
        />
      )}
    </div>
  );
};

export default BOMPolibanTab;
