// components/BOM/tabs/BOMKertasTab.tsx
import React from 'react';
import { BOMKertas } from '../Types/bom.types';

interface BOMKertasTabProps {
  data: BOMKertas[];
  onChange: (data: BOMKertas[]) => void;
}

const BOMKertasTab: React.FC<BOMKertasTabProps> = ({ data, onChange }) => {
  const handleAdd = () => {
    const newItem: BOMKertas = {
      id_kertas: 0,
      nama_kertas: '',
      qty_lembar_plano: 0,
      tipe: 'DRAFT',
      is_selected: false,
    };
    onChange([...data, newItem]);
  };

  const handleUpdate = (index: number, field: keyof BOMKertas, value: any) => {
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
        Tambah Data Pokok Kertas
      </button>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 border-b text-left font-medium text-gray-700">
                Tipe
              </th>
              <th className="px-4 py-2 border-b text-left font-medium text-gray-700">
                Nama Kertas
              </th>
              <th className="px-4 py-2 border-b text-left font-medium text-gray-700">
                Qty Lembar Plano
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
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  Belum ada data kertas
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
                      value={item.nama_kertas}
                      onChange={(e) =>
                        handleUpdate(index, 'nama_kertas', e.target.value)
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nama Kertas"
                    />
                  </td>
                  <td className="px-4 py-2 border-b">
                    <input
                      type="number"
                      value={item.qty_lembar_plano}
                      onChange={(e) =>
                        handleUpdate(
                          index,
                          'qty_lembar_plano',
                          Number(e.target.value),
                        )
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
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
    </div>
  );
};

export default BOMKertasTab;
