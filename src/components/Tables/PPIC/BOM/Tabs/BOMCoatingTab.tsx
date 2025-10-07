// components/BOM/tabs/BOMCoatingTab.tsx
import React from 'react';
import type { BOMCoating } from '../Types/bom.types';

interface BOMCoatingTabProps {
  data: BOMCoating[];
  onChange: (data: BOMCoating[]) => void;
}

const BOMCoatingTab: React.FC<BOMCoatingTabProps> = ({ data, onChange }) => {
  const handleAdd = () => {
    const newItem: BOMCoating = {
      id_coating_depan: 0,
      id_coating_belakang: 0,
      nama_coating_depan: '',
      nama_coating_belakang: '',
      qty_coating_depan: 0,
      qty_coating_belakang: 0,
      uv_wb: 0,
      varnish_doff: 0,
      tipe: 'DRAFT',
      is_selected: false,
    };
    onChange([...data, newItem]);
  };

  const handleUpdate = (index: number, field: keyof BOMCoating, value: any) => {
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
        Tambah Data Coating
      </button>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 border-b text-left font-medium text-gray-700">
                Tipe
              </th>
              <th className="px-4 py-2 border-b text-left font-medium text-gray-700">
                Coating Depan
              </th>
              <th className="px-4 py-2 border-b text-left font-medium text-gray-700">
                Coating Belakang
              </th>
              <th className="px-4 py-2 border-b text-left font-medium text-gray-700">
                Qty UV / WB
              </th>
              <th className="px-4 py-2 border-b text-left font-medium text-gray-700">
                Qty Varnish Doff
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
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  Belum ada data coating
                </td>
              </tr>
            ) : (
              data?.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
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
                    <input
                      type="text"
                      value={item.nama_coating_depan}
                      onChange={(e) =>
                        handleUpdate(
                          index,
                          'nama_coating_depan',
                          e.target.value,
                        )
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="WATERBASE"
                    />
                  </td>
                  <td className="px-4 py-2 border-b">
                    <input
                      type="text"
                      value={item.nama_coating_belakang}
                      onChange={(e) =>
                        handleUpdate(
                          index,
                          'nama_coating_belakang',
                          e.target.value,
                        )
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Coating Belakang"
                    />
                  </td>
                  <td className="px-4 py-2 border-b">
                    <input
                      type="number"
                      step="0.01"
                      value={item.uv_wb}
                      onChange={(e) =>
                        handleUpdate(index, 'uv_wb', Number(e.target.value))
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="8.82"
                    />
                  </td>
                  <td className="px-4 py-2 border-b">
                    <input
                      type="number"
                      step="0.01"
                      value={item.varnish_doff}
                      onChange={(e) =>
                        handleUpdate(
                          index,
                          'varnish_doff',
                          Number(e.target.value),
                        )
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="3.74"
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

export default BOMCoatingTab;
