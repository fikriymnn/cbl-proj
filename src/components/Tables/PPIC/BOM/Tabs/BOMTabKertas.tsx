// components/BOM/tabs/BOMKertasTab.tsx
import React, { useState, useEffect } from 'react';
import { BOMKertas } from '../Types/bom.types';
import TambahKertasModal from '../Modals/TambahKertasModal';
import axios from 'axios';

interface BOMKertasTabProps {
  data: BOMKertas[];
  onChange: (data: BOMKertas[]) => void;
  id_kalkulasi?: number;
  po_qty?: number;
}

const BOMKertasTab: React.FC<BOMKertasTabProps> = ({
  data,
  onChange,
  id_kalkulasi,
  po_qty,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [kalkulasiData, setKalkulasiData] = useState<{
    ukuran_cetak_bagian_1: number;
    ukuran_cetak_isi_1: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const safeData = Array.isArray(data) ? data : [];

  // Fetch kalkulasi data when id_kalkulasi changes
  useEffect(() => {
    if (id_kalkulasi) {
      fetchKalkulasiData();
    }
  }, [id_kalkulasi]);

  const fetchKalkulasiData = async () => {
    if (!id_kalkulasi) return;

    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_LINK}/marketing/kalkulasi/${id_kalkulasi}`,
        {
          withCredentials: true,
        },
      );

      if (response.data && response.data.data) {
        setKalkulasiData({
          ukuran_cetak_bagian_1: response.data.data.ukuran_cetak_bagian_1,
          ukuran_cetak_isi_1: response.data.data.ukuran_cetak_isi_1,
        });
      }
    } catch (error) {
      console.error('Error fetching kalkulasi data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate qty_lembar_plano
  const calculateQtyLembarPlano = (): number => {
    if (!po_qty || !kalkulasiData) return 0;

    const { ukuran_cetak_bagian_1, ukuran_cetak_isi_1 } = kalkulasiData;

    if (ukuran_cetak_bagian_1 === 0 || ukuran_cetak_isi_1 === 0) return 0;

    const result = po_qty / ukuran_cetak_bagian_1 / ukuran_cetak_isi_1;
    return Math.ceil(result);
  };

  // Auto-update all items when kalkulasi data or po_qty changes
  useEffect(() => {
    if (kalkulasiData && po_qty && safeData.length > 0) {
      const calculatedQty = calculateQtyLembarPlano();
      const updated = safeData.map((item) => ({
        ...item,
        qty_lembar_plano: calculatedQty,
      }));
      onChange(updated);
    }
  }, [kalkulasiData, po_qty]);

  const handleAdd = () => {
    setShowModal(true);
  };

  const handleSaveFromModal = (newData: {
    id_kertas: number;
    nama_kertas: string;
    qty_lembar_plano: number;
    tipe: string;
  }) => {
    // Auto-calculate qty_lembar_plano
    const calculatedQty = calculateQtyLembarPlano();

    const newItem: BOMKertas = {
      id_kertas: newData.id_kertas,
      nama_kertas: newData.nama_kertas,
      qty_lembar_plano: calculatedQty,
      tipe: newData.tipe,
      is_selected: false,
    };
    onChange([...safeData, newItem]);
  };

  const handleUpdate = (index: number, field: keyof BOMKertas, value: any) => {
    const updated = data.map((item, i) =>
      i === index ? { ...item, [field]: value } : item,
    );
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

  // Get the selected kertas
  const selectedKertas = safeData.find((item) => item.is_selected);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          disabled={loading || !id_kalkulasi || !po_qty}
        >
          <span>+</span>
          Tambah Data Pokok Kertas
        </button>

        {selectedKertas && (
          <div className="px-4 py-2 bg-green-100 border border-green-300 rounded-lg text-sm">
            <span className="font-semibold text-green-800">
              Kertas Terpilih:{' '}
            </span>
            <span className="text-green-700">{selectedKertas.nama_kertas}</span>
          </div>
        )}
      </div>

      {loading && (
        <div className="mb-4 text-sm text-blue-600">
          Loading kalkulasi data...
        </div>
      )}

      {!id_kalkulasi && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          ⚠️ ID Kalkulasi belum tersedia
        </div>
      )}

      {kalkulasiData && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm">
          <div className="font-semibold text-gray-700 mb-1">
            Kalkulasi Info:
          </div>
          <div className="text-gray-600">
            Qty SO: {po_qty} | Bagian : {kalkulasiData.ukuran_cetak_bagian_1} |
            Isi : {kalkulasiData.ukuran_cetak_isi_1}
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
                        title="Auto-calculated based on kalkulasi"
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
          kalkulasiInfo={
            kalkulasiData && po_qty
              ? {
                  po_qty,
                  ukuran_cetak_bagian_1: kalkulasiData.ukuran_cetak_bagian_1,
                  ukuran_cetak_isi_1: kalkulasiData.ukuran_cetak_isi_1,
                }
              : undefined
          }
        />
      )}
    </div>
  );
};

export default BOMKertasTab;
