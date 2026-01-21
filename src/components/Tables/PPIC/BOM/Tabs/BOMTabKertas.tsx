// components/BOM/tabs/BOMKertasTab.tsx
import React, { useState, useEffect } from 'react';
import { BOMKertas } from '../Types/bom.types';
import TambahKertasModal from '../Modals/TambahKertasModal';

interface BOMKertasTabProps {
  data: BOMKertas[];
  onChange: (data: BOMKertas[]) => void;
  po_qty?: number;
  selectedMounting?: any;
}

const BOMKertasTab: React.FC<BOMKertasTabProps> = ({
  data,
  onChange,
  po_qty,
  selectedMounting,
}) => {
  const [showModal, setShowModal] = useState(false);

  const safeData = Array.isArray(data) ? data : [];

  // ✅ Get data from selectedMounting instead of kalkulasi
  const ukuran_cetak_bagian_1 = selectedMounting?.ukuran_cetak_bagian_1 || 0;
  const ukuran_cetak_isi_1 = selectedMounting?.ukuran_cetak_isi_1 || 0;
  const ukuran_cetak_lebar_2 = selectedMounting?.ukuran_cetak_lebar_2 || 0;
  const ukuran_cetak_panjang_2 = selectedMounting?.ukuran_cetak_panjang_2 || 0;
  const id_kertas_default = selectedMounting?.id_kertas;
  const nama_kertas_default = selectedMounting?.nama_kertas;

  // Determine max selections based on ukuran_cetak_lebar_2 and ukuran_cetak_panjang_2
  const hasSecondaryDimensions =
    (ukuran_cetak_lebar_2 !== null &&
      ukuran_cetak_lebar_2 !== undefined &&
      ukuran_cetak_lebar_2 !== 0) ||
    (ukuran_cetak_panjang_2 !== null &&
      ukuran_cetak_panjang_2 !== undefined &&
      ukuran_cetak_panjang_2 !== 0);

  const maxSelections = hasSecondaryDimensions ? 2 : 1;

  // ✅ Calculate qty_lembar_plano using mounting data
  const calculateQtyLembarPlano = (): number => {
    if (!po_qty || !selectedMounting) return 0;

    if (ukuran_cetak_bagian_1 === 0 || ukuran_cetak_isi_1 === 0) return 0;

    const result = po_qty / ukuran_cetak_bagian_1 / ukuran_cetak_isi_1;
    return Math.ceil(result);
  };

  // Auto-update all items when mounting data or po_qty changes
  useEffect(() => {
    if (selectedMounting && po_qty && safeData.length > 0) {
      const calculatedQty = calculateQtyLembarPlano();
      const updated = safeData.map((item) => ({
        ...item,
        qty_lembar_plano: calculatedQty,
      }));
      onChange(updated);
    }
  }, [selectedMounting, po_qty]);

  const handleAdd = () => {
    setShowModal(true);
  };

  const handleSaveFromModal = (newData: {
    id_kertas: number;
    nama_kertas: string;
    qty_lembar_plano: number;
    tipe: string;
  }) => {
    const calculatedQty = calculateQtyLembarPlano();

    const newItem: BOMKertas = {
      id: null,
      id_kertas: newData.id_kertas,
      nama_kertas: newData.nama_kertas,
      qty_lembar_plano: calculatedQty,
      tipe: newData.tipe,
      is_selected: false, // ✅ User needs to manually select after adding
    };
    onChange([...safeData, newItem]);
  };

  const handleUpdate = (index: number, field: keyof BOMKertas, value: any) => {
    const updated = data.map((item, i) =>
      i === index ? { ...item, [field]: value } : item,
    );
    onChange(updated);
  };

  const handleCheckboxChange = (index: number, checked: boolean) => {
    const currentSelectedCount = data.filter((item) => item.is_selected).length;

    if (checked && currentSelectedCount >= maxSelections) {
      alert(
        `Maksimal ${maxSelections} kertas yang dapat dipilih${
          hasSecondaryDimensions ? ' (karena ada ukuran cetak sekunder)' : ''
        }`,
      );
      return;
    }

    const updated = data.map((item, i) =>
      i === index ? { ...item, is_selected: checked } : item,
    );
    onChange(updated);
  };

  const handleDelete = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const selectedKertas = safeData.filter((item) => item.is_selected);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          disabled={!selectedMounting || !po_qty}
        >
          <span>+</span>
          Tambah Data Pokok Kertas
        </button>

        {selectedKertas.length > 0 && (
          <div className="px-4 py-2 bg-green-100 border border-green-300 rounded-lg text-sm">
            <span className="font-semibold text-green-800">
              Kertas Terpilih ({selectedKertas.length}/{maxSelections}):{' '}
            </span>
            <span className="text-green-700">
              {selectedKertas.map((k) => k.nama_kertas).join(', ')}
            </span>
          </div>
        )}
      </div>

      {!selectedMounting && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          ⚠️ Pilih mounting terlebih dahulu
        </div>
      )}

      {/* Selection limit info banner */}
      <div
        className={`mb-4 p-3 rounded-lg text-sm ${
          hasSecondaryDimensions
            ? 'bg-blue-50 border border-blue-200 text-blue-800'
            : 'bg-purple-50 border border-purple-200 text-purple-800'
        }`}
      >
        <div className="font-semibold mb-1">
          {hasSecondaryDimensions
            ? '📋 Mode: Maksimal 2 Kertas'
            : '📋 Mode: Maksimal 1 Kertas'}
        </div>
        <div className="text-xs">
          {hasSecondaryDimensions
            ? `Ukuran cetak B terdeteksi (Lebar: ${ukuran_cetak_lebar_2}, Panjang: ${ukuran_cetak_panjang_2})`
            : 'Tidak ada ukuran cetak B'}
        </div>
      </div>

      {/* ✅ Show mounting info instead of kalkulasi */}
      {selectedMounting && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm">
          <div className="font-semibold text-gray-700 mb-1">
            Mounting Info: {selectedMounting.nama_mounting}
          </div>
          <div className="text-gray-600">
            Qty: {po_qty} | Bagian: {ukuran_cetak_bagian_1} | Isi:{' '}
            {ukuran_cetak_isi_1}
          </div>
          <div className="text-gray-600 mt-1">
            Kertas Default:{' '}
            <span className="font-semibold">{nama_kertas_default}</span>
          </div>
          <div className="text-gray-600 mt-1">
            Calculated Qty Lembar Plano:{' '}
            <span className="font-semibold">{calculateQtyLembarPlano()}</span>
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
                Nama Kertas
              </th>
              <th className="px-4 py-2 border-b text-left font-medium text-gray-700">
                Qty Lembar Plano (Auto)
              </th>
              <th className="px-4 py-2 border-b text-center font-medium text-gray-700">
                <div className="flex flex-col items-center">
                  <span>Pilih</span>
                  <span className="text-xs text-gray-500 font-normal">
                    (Max {maxSelections})
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
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  Belum ada data kertas
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
                      placeholder="POKOK"
                    />
                  </td>
                  <td className="px-4 py-2 border-b">
                    <div className="flex items-center gap-2">
                      {item.is_selected && (
                        <span className="text-green-600 font-bold">✓</span>
                      )}
                      <input
                        type="text"
                        value={item.nama_kertas}
                        onChange={(e) =>
                          handleUpdate(index, 'nama_kertas', e.target.value)
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nama Kertas"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-2 border-b">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={item.qty_lembar_plano}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none bg-gray-100 text-gray-700"
                        readOnly
                        title="Auto-calculated based on mounting data"
                      />
                    </div>
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
        <TambahKertasModal
          onClose={() => setShowModal(false)}
          onSave={handleSaveFromModal}
          calculatedQtyLembarPlano={calculateQtyLembarPlano()}
          mountingInfo={
            selectedMounting && po_qty
              ? {
                  po_qty,
                  ukuran_cetak_bagian_1,
                  ukuran_cetak_isi_1,
                }
              : undefined
          }
          defaultKertasId={id_kertas_default}
          defaultKertasName={nama_kertas_default}
        />
      )}
    </div>
  );
};

export default BOMKertasTab;
