// components/BOM/tabs/BOMTintaTab.tsx
import React, { useState } from 'react';
import { BOMTinta, TintaDetail } from '../Types/bom.types';

interface BOMTintaTabProps {
  data: BOMTinta[];
  onChange: (data: BOMTinta[]) => void;
}

const BOMTintaTab: React.FC<BOMTintaTabProps> = ({ data, onChange }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleAdd = () => {
    const newItem: BOMTinta = {
      warna_tinta: '',
      id_jenis_tinta: 0,
      id_jenis_kertas: 0,
      id_jenis_warna_tinta: 0,
      jenis_mesin_cetak: 'offset',
      area_cetak: 0,
      qty_tinta: 0,
      tinta_detail: [],
    };
    onChange([...data, newItem]);
  };

  const handleUpdate = (index: number, field: keyof BOMTinta, value: any) => {
    const updated = data.map((item, i) =>
      i === index ? { ...item, [field]: value } : item,
    );
    onChange(updated);
  };

  const handleDelete = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const handleAddDetail = (tintaIndex: number) => {
    const newDetail: TintaDetail = {
      id_item_tinta: 0,
      nama_item_tinta: '',
      persentase_tinta: 0,
    };
    const updated = data.map((item, i) =>
      i === tintaIndex
        ? { ...item, tinta_detail: [...item.tinta_detail, newDetail] }
        : item,
    );
    onChange(updated);
  };

  const handleUpdateDetail = (
    tintaIndex: number,
    detailIndex: number,
    field: keyof TintaDetail,
    value: any,
  ) => {
    const updated = data.map((item, i) =>
      i === tintaIndex
        ? {
            ...item,
            tinta_detail: item.tinta_detail.map((detail, j) =>
              j === detailIndex ? { ...detail, [field]: value } : detail,
            ),
          }
        : item,
    );
    onChange(updated);
  };

  const handleDeleteDetail = (tintaIndex: number, detailIndex: number) => {
    const updated = data.map((item, i) =>
      i === tintaIndex
        ? {
            ...item,
            tinta_detail: item.tinta_detail.filter((_, j) => j !== detailIndex),
          }
        : item,
    );
    onChange(updated);
  };

  return (
    <div>
      <button
        onClick={handleAdd}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
      >
        <span>+</span>
        Tambah Data Tinta
      </button>

      <div className="space-y-4">
        {data?.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Belum ada data tinta
          </div>
        ) : (
          data?.map((item, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* Main Tinta Row */}
              <div className="bg-gray-50 p-4">
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      No
                    </label>
                    <div className="text-sm font-semibold">{index + 1}</div>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Warna Khusus
                    </label>
                    <input
                      type="text"
                      value={item.warna_tinta}
                      onChange={(e) =>
                        handleUpdate(index, 'warna_tinta', e.target.value)
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="#F40A0A"
                    />
                    {/* Color preview */}
                    {item.warna_tinta && (
                      <div
                        className="mt-1 h-6 rounded border border-gray-300"
                        style={{ backgroundColor: item.warna_tinta }}
                      />
                    )}
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Tinta
                    </label>
                    <input
                      type="text"
                      placeholder="Tinta"
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Persentase
                    </label>
                    <input
                      type="text"
                      placeholder="Persentase"
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Qty (Kg)
                    </label>
                    <input
                      type="number"
                      value={item.qty_tinta}
                      onChange={(e) =>
                        handleUpdate(index, 'qty_tinta', Number(e.target.value))
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                  <div className="col-span-3 flex gap-2">
                    <button
                      onClick={() => handleAddDetail(index)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-xs"
                    >
                      + Tambah Detail
                    </button>
                    <button
                      onClick={() =>
                        setExpandedIndex(expandedIndex === index ? null : index)
                      }
                      className="px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors text-xs"
                    >
                      {expandedIndex === index ? 'Hide' : 'Edit'}
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>

              {/* Detail Table - Expandable */}
              {expandedIndex === index && item.tinta_detail.length > 0 && (
                <div className="p-4 bg-white">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">
                          Nama Tinta
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">
                          Persentase
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">
                          Act
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {item.tinta_detail.map((detail, detailIndex) => (
                        <tr key={detailIndex} className="border-b">
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={detail.nama_item_tinta}
                              onChange={(e) =>
                                handleUpdateDetail(
                                  index,
                                  detailIndex,
                                  'nama_item_tinta',
                                  e.target.value,
                                )
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Nama Item Tinta"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              value={detail.persentase_tinta}
                              onChange={(e) =>
                                handleUpdateDetail(
                                  index,
                                  detailIndex,
                                  'persentase_tinta',
                                  Number(e.target.value),
                                )
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="0"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <button
                              onClick={() =>
                                handleDeleteDetail(index, detailIndex)
                              }
                              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs"
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BOMTintaTab;
