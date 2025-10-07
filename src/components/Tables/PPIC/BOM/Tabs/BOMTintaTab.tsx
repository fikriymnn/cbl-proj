// components/BOM/tabs/BOMTintaTab.tsx
import React, { useState } from 'react';
import { BOMTinta, TintaDetail } from '../Types/bom.types';
import TambahKomponenTintaModal from '../Modals/TambahKomponenTintaModal';

interface BOMTintaTabProps {
  data: BOMTinta[];
  onChange: (data: BOMTinta[]) => void;
}

const BOMTintaTab: React.FC<BOMTintaTabProps> = ({ data, onChange }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ADD THIS: Ensure data is always an array
  const safeData = Array.isArray(data) ? data : [];

  const handleAdd = () => {
    setIsModalOpen(true);
  };

  const handleUpdate = (index: number, field: keyof BOMTinta, value: any) => {
    const updated = safeData.map((item, i) =>
      i === index ? { ...item, [field]: value } : item,
    );
    onChange(updated);
  };

  const handleDelete = (index: number) => {
    onChange(safeData.filter((_, i) => i !== index));
  };

  const handleSaveFromModal = (newData: BOMTinta) => {
    onChange([...safeData, newData]);
  };

  const handleAddDetail = (tintaIndex: number) => {
    const newDetail: TintaDetail = {
      id_item_tinta: 0,
      nama_item_tinta: '',
      persentase_tinta: 0,
    };
    const updated = safeData.map((item, i) =>
      i === tintaIndex
        ? { ...item, tinta_detail: [...(item.tinta_detail || []), newDetail] }
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
    const updated = safeData.map((item, i) =>
      i === tintaIndex
        ? {
            ...item,
            tinta_detail: (item.tinta_detail || []).map((detail, j) =>
              j === detailIndex ? { ...detail, [field]: value } : detail,
            ),
          }
        : item,
    );
    onChange(updated);
  };

  const handleDeleteDetail = (tintaIndex: number, detailIndex: number) => {
    const updated = safeData.map((item, i) =>
      i === tintaIndex
        ? {
            ...item,
            tinta_detail: (item.tinta_detail || []).filter(
              (_, j) => j !== detailIndex,
            ),
          }
        : item,
    );
    onChange(updated);
  };

  // Get label name by ID helper functions
  const getJenisWarnaTintaName = (id: number) => {
    const names: { [key: number]: string } = {
      1: 'Separasi',
      2: 'Warna Khusus',
    };
    return names[id] || id.toString();
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
        {safeData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Belum ada data tinta
          </div>
        ) : (
          safeData.map((item, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* Main Tinta Row */}
              <div className="bg-gray-50 p-4">
                <div className="grid grid-cols-12 gap-4 items-start">
                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      No
                    </label>
                    <div className="text-sm font-semibold">{index + 1}</div>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Nama Tinta
                    </label>
                    <div className="space-y-1">
                      <div className="text-sm font-medium">
                        {getJenisWarnaTintaName(item.id_jenis_warna_tinta)}
                      </div>
                      <div className="text-xs text-gray-600">
                        {item.warna_tinta}
                      </div>
                      {/* Color preview */}
                      <div
                        className="h-8 rounded border border-gray-300"
                        style={{ backgroundColor: item.warna_tinta }}
                      />
                    </div>
                  </div>

                  <div className="col-span-6">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Detail Tinta
                    </label>
                    <div className="bg-gray-100 rounded p-2 space-y-1">
                      <div className="grid grid-cols-3 gap-2 text-xs font-medium text-gray-600">
                        <div>Tinta</div>
                        <div>Persentase</div>
                        <div>Qty (Kg)</div>
                      </div>
                      {!item.tinta_detail || item.tinta_detail.length === 0 ? (
                        <div className="text-xs text-gray-500 py-2">
                          Belum ada detail tinta
                        </div>
                      ) : (
                        item.tinta_detail.map((detail, detailIndex) => (
                          <div
                            key={detailIndex}
                            className="grid grid-cols-3 gap-2 text-xs"
                          >
                            <div className="truncate">
                              {detail.nama_item_tinta || '-'}
                            </div>
                            <div>{detail.persentase_tinta}%</div>
                            <div>-</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="col-span-1">
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
                      step="0.01"
                    />
                  </div>

                  <div className="col-span-2 flex flex-col gap-2">
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
                      {expandedIndex === index ? '▲ Hide' : '✎ Edit'}
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs"
                    >
                      🗑 Hapus
                    </button>
                  </div>
                </div>
              </div>

              {/* Detail Table - Expandable */}
              {expandedIndex === index && (
                <div className="p-4 bg-white border-t">
                  <h3 className="text-sm font-semibold mb-3">
                    Edit Detail Tinta
                  </h3>
                  {!item.tinta_detail || item.tinta_detail.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      Belum ada detail tinta. Klik "Tambah Detail" untuk
                      menambahkan.
                    </div>
                  ) : (
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">
                            Nama Tinta
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">
                            Persentase (%)
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
                                min="0"
                                max="100"
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
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
      <TambahKomponenTintaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveFromModal}
      />
    </div>
  );
};

export default BOMTintaTab;
