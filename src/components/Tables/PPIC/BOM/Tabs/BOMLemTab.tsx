// components/BOM/tabs/BOMLemTab.tsx
import React from 'react';
import type { BOMLem } from '../Types/bom.types';

interface BOMLemTabProps {
  data: BOMLem[];
  onChange: (data: BOMLem[]) => void;
}

const BOMLemTab: React.FC<BOMLemTabProps> = ({ data, onChange }) => {
  const handleAdd = () => {
    const newItem: BOMLem = {
      id_lem: 0,
      nama_lem: '',
      rumus_lem: '',
      qty_konstanta: 0,
      qty_lock_bottom: 0,
      qty_lem_samping: 0,
      qty_four_corner: 0,
      qty_samping_lock_bottom: 0,
      qty_six_corner: 0,
      qty_ujung_lock_bottom: 0,
      tipe: 'DRAFT',
      is_selected: false,
    };
    onChange([...data, newItem]);
  };

  const handleUpdate = (index: number, field: keyof BOMLem, value: any) => {
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
        Tambah Data Lem
      </button>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 border-b text-left font-medium text-gray-700">
                Lem
              </th>
              <th className="px-3 py-2 border-b text-left font-medium text-gray-700">
                Pilih
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
              <th className="px-3 py-2 border-b text-left font-medium text-gray-700">
                Act
              </th>
            </tr>
          </thead>
          <tbody>
            {data?.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  Belum ada data lem
                </td>
              </tr>
            ) : (
              data?.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-3 py-2 border-b">
                    <input
                      type="text"
                      value={item.nama_lem}
                      onChange={(e) =>
                        handleUpdate(index, 'nama_lem', e.target.value)
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="LEM SUPERSEAL 217 LV"
                    />
                  </td>
                  <td className="px-3 py-2 border-b text-center">
                    <input
                      type="checkbox"
                      checked={item.is_selected}
                      onChange={(e) =>
                        handleUpdate(index, 'is_selected', e.target.checked)
                      }
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-3 py-2 border-b">
                    <input
                      type="number"
                      step="0.01"
                      value={item.qty_konstanta}
                      onChange={(e) =>
                        handleUpdate(
                          index,
                          'qty_konstanta',
                          Number(e.target.value),
                        )
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.3"
                    />
                  </td>
                  <td className="px-3 py-2 border-b">
                    <input
                      type="number"
                      value={item.qty_lock_bottom}
                      onChange={(e) =>
                        handleUpdate(
                          index,
                          'qty_lock_bottom',
                          Number(e.target.value),
                        )
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="23"
                    />
                  </td>
                  <td className="px-3 py-2 border-b">
                    <input
                      type="number"
                      value={item.qty_lem_samping}
                      onChange={(e) =>
                        handleUpdate(
                          index,
                          'qty_lem_samping',
                          Number(e.target.value),
                        )
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="3"
                    />
                  </td>
                  <td className="px-3 py-2 border-b">
                    <input
                      type="number"
                      value={item.qty_four_corner}
                      onChange={(e) =>
                        handleUpdate(
                          index,
                          'qty_four_corner',
                          Number(e.target.value),
                        )
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="12"
                    />
                  </td>
                  <td className="px-3 py-2 border-b">
                    <input
                      type="number"
                      value={item.qty_samping_lock_bottom}
                      onChange={(e) =>
                        handleUpdate(
                          index,
                          'qty_samping_lock_bottom',
                          Number(e.target.value),
                        )
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="23"
                    />
                  </td>
                  <td className="px-3 py-2 border-b">
                    <input
                      type="number"
                      value={item.qty_six_corner}
                      onChange={(e) =>
                        handleUpdate(
                          index,
                          'qty_six_corner',
                          Number(e.target.value),
                        )
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="18"
                    />
                  </td>
                  <td className="px-3 py-2 border-b">
                    <input
                      type="number"
                      value={item.qty_ujung_lock_bottom}
                      onChange={(e) =>
                        handleUpdate(
                          index,
                          'qty_ujung_lock_bottom',
                          Number(e.target.value),
                        )
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="23"
                    />
                  </td>
                  <td className="px-3 py-2 border-b">
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-xs whitespace-nowrap">
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs whitespace-nowrap"
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

export default BOMLemTab;
