// components/BOM/tabs/BOMPolibanTab.tsx
import React from 'react';
import type { BOMPoliban } from '../Types/bom.types';

interface BOMPolibanTabProps {
  data: BOMPoliban[];
  onChange: (data: BOMPoliban[]) => void;
}

const BOMPolibanTab: React.FC<BOMPolibanTabProps> = ({ data, onChange }) => {
  const handleAdd = () => {
    const newItem: BOMPoliban = {
      item_poliban: '',
      isi_satu_ikat: 0,
      lembar_poliban: 0,
      qty_poliban: 0,
      tipe: 'DRAFT',
      is_selected: false,
    };
    onChange([...data, newItem]);
  };

  const handleUpdate = (index: number, field: keyof BOMPoliban, value: any) => {
    const updated = data.map((item, i) =>
      i === index ? { ...item, [field]: value } : item,
    );
    onChange(updated);
  };

  const handleDelete = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  return (
    <div>
      <button
        onClick={handleAdd}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
      >
        <span>+</span>
        Tambah Data Poliban
      </button>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
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
                Qty
              </th>
              <th className="px-4 py-2 border-b text-left font-medium text-gray-700">
                Pilih
              </th>
              <th className="px-4 py-2 border-b text-left font-medium text-gray-700">
                Act
              </th>
            </tr>
          </thead>
          <tbody>
            {data?.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  Belum ada data poliban
                </td>
              </tr>
            ) : (
              data?.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border-b">
                    <input
                      type="text"
                      value={item.item_poliban}
                      onChange={(e) =>
                        handleUpdate(index, 'item_poliban', e.target.value)
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="ya"
                    />
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
                      placeholder="16"
                    />
                  </td>
                  <td className="px-4 py-2 border-b">
                    <input
                      type="number"
                      value={item.qty_poliban}
                      onChange={(e) =>
                        handleUpdate(
                          index,
                          'qty_poliban',
                          Number(e.target.value),
                        )
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="62.5"
                    />
                  </td>
                  <td className="px-4 py-2 border-b text-center">
                    <input
                      type="checkbox"
                      checked={item.is_selected}
                      onChange={(e) =>
                        handleUpdate(index, 'is_selected', e.target.checked)
                      }
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-2 border-b">
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-xs">
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BOMPolibanTab;
