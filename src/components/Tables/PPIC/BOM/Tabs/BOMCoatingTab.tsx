// components/BOM/tabs/BOMCoatingTab.tsx
import React, { useState } from 'react';
import type { BOMCoating } from '../Types/bom.types';
import TambahCoatingModal from '../Modals/TambanCoatingModal';

interface BOMCoatingTabProps {
  data: BOMCoating[];
  onChange: (data: BOMCoating[]) => void;
  po_qty?: number;
  id_kalkulasi?: number;
}

const BOMCoatingTab: React.FC<BOMCoatingTabProps> = ({
  data,
  onChange,
  po_qty,
  id_kalkulasi,
}) => {
  const [showModal, setShowModal] = useState(false);

  const handleAdd = () => {
    setShowModal(true);
  };

  const handleSaveFromModal = (newData: {
    id_coating_depan: number;
    id_coating_belakang: number;
    nama_coating_depan: string;
    nama_coating_belakang: string;
    uv_wb: number;
    varnish_doff: number;
    rumus_coating: string;
    tipe: string;
  }) => {
    const newItem: BOMCoating = {
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

  // Get the selected coating
  const selectedCoating = data.find((item) => item.is_selected);

  // Format rumus display
  const formatRumusDisplay = (rumus: string) => {
    if (rumus === 'UV_WB') return 'UV & WB';
    if (rumus === 'VARNISH_DOFF') return 'Varnish Doff';
    return rumus;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          disabled={!po_qty || !id_kalkulasi}
        >
          <span>+</span>
          Tambah Data Coating
        </button>

        {selectedCoating && (
          <div className="px-4 py-2 bg-green-100 border border-green-300 rounded-lg text-sm">
            <span className="font-semibold text-green-800">
              Coating Terpilih:{' '}
            </span>
            <span className="text-green-700">
              {selectedCoating.nama_coating_depan ||
                selectedCoating.nama_coating_belakang}{' '}
              ({formatRumusDisplay(selectedCoating.rumus_coating)})
            </span>
          </div>
        )}
      </div>

      {(!po_qty || !id_kalkulasi) && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          ⚠️ Qty SO dan Data Kalkulasi belum tersedia.
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 border-b text-left font-medium text-gray-700">
                Tipe
              </th>
              <th className="px-3 py-2 border-b text-left font-medium text-gray-700">
                Coating Depan
              </th>
              <th className="px-3 py-2 border-b text-left font-medium text-gray-700">
                Coating Belakang
              </th>
              <th className="px-3 py-2 border-b text-left font-medium text-gray-700">
                Qty UV / WB
              </th>
              <th className="px-3 py-2 border-b text-left font-medium text-gray-700">
                Qty Varnish Doff
              </th>
              <th className="px-3 py-2 border-b text-left font-medium text-gray-700">
                Rumus
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
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  Belum ada data coating
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
                    <input
                      type="text"
                      value={item.tipe}
                      className="w-full px-2 py-1 border border-gray-300 rounded bg-gray-100"
                      readOnly
                    />
                  </td>
                  <td className="px-3 py-2 border-b">
                    <div className="flex items-center gap-2">
                      {item.is_selected && item.nama_coating_depan && (
                        <span className="text-green-600 font-bold">✓</span>
                      )}
                      <input
                        type="text"
                        value={item.nama_coating_depan}
                        className="w-full px-2 py-1 border border-gray-300 rounded bg-gray-100"
                        readOnly
                      />
                    </div>
                  </td>
                  <td className="px-3 py-2 border-b">
                    <div className="flex items-center gap-2">
                      {item.is_selected && item.nama_coating_belakang && (
                        <span className="text-green-600 font-bold">✓</span>
                      )}
                      <input
                        type="text"
                        value={item.nama_coating_belakang}
                        className="w-full px-2 py-1 border border-gray-300 rounded bg-gray-100"
                        readOnly
                      />
                    </div>
                  </td>
                  <td className="px-3 py-2 border-b">
                    <input
                      type="number"
                      step="0.0001"
                      value={item.uv_wb.toFixed(4)}
                      className="w-full px-2 py-1 border border-gray-300 rounded bg-gray-100"
                      readOnly
                    />
                  </td>
                  <td className="px-3 py-2 border-b">
                    <input
                      type="number"
                      step="0.0001"
                      value={item.varnish_doff.toFixed(4)}
                      className="w-full px-2 py-1 border border-gray-300 rounded bg-gray-100"
                      readOnly
                    />
                  </td>
                  <td className="px-3 py-2 border-b">
                    <input
                      type="text"
                      value={formatRumusDisplay(item.rumus_coating)}
                      className="w-full px-2 py-1 border border-gray-300 rounded bg-gray-100"
                      readOnly
                    />
                  </td>
                  <td className="px-3 py-2 border-b text-center">
                    <input
                      type="checkbox"
                      checked={item.is_selected}
                      onChange={(e) =>
                        handleCheckboxChange(index, e.target.checked)
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
        <TambahCoatingModal
          onClose={() => setShowModal(false)}
          onSave={handleSaveFromModal}
          po_qty={po_qty}
          id_kalkulasi={id_kalkulasi}
        />
      )}
    </div>
  );
};

export default BOMCoatingTab;
