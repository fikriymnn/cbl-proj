// components/BOM/Modals/TambahKertasModal.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchableSelect from '../../../../../pages/MasterData/Marketing/SearchableSelect';

interface KertasOption {
  id: number;
  nama_barang: string;
  harga: number;
  kode_barang: string;
  kategori: string;
  batas_harga?: number;
}

interface TambahKertasModalProps {
  onClose: () => void;
  onSave: (data: {
    id_kertas: number;
    nama_kertas: string;
    qty_lembar_plano: number;
    tipe: string;
  }) => void;
  calculatedQtyLembarPlano?: number; // Add this prop
  kalkulasiInfo?: {
    // Add this prop for display
    po_qty?: number;
    ukuran_cetak_bagian_1?: number;
    ukuran_cetak_isi_1?: number;
  };
}

const TambahKertasModal: React.FC<TambahKertasModalProps> = ({
  onClose,
  onSave,
  calculatedQtyLembarPlano = 0,
  kalkulasiInfo,
}) => {
  const [kertasOptions, setKertasOptions] = useState<KertasOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id_kertas: '',
    nama_kertas: '',
    jenis_kertas: '',
    tipe: 'DRAFT',
  });

  useEffect(() => {
    fetchKertasOptions();
  }, []);

  const fetchKertasOptions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_LINK}/master/barang`,
        {
          params: {
            sub_kategori: 'kertas',
          },
          withCredentials: true,
        },
      );

      if (response.data && response.data.data) {
        setKertasOptions(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching kertas options:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKertasChange = (value: string | number) => {
    const selectedKertas = kertasOptions.find(
      (kertas) => kertas.id === Number(value),
    );

    if (selectedKertas) {
      setFormData({
        ...formData,
        id_kertas: value.toString(),
        nama_kertas: selectedKertas.nama_barang,
        jenis_kertas: selectedKertas.kode_barang,
      });
    }
  };

  const handleSubmit = () => {
    if (!formData.id_kertas) {
      alert('Pilih kertas terlebih dahulu');
      return;
    }

    onSave({
      id_kertas: Number(formData.id_kertas),
      nama_kertas: formData.nama_kertas,
      qty_lembar_plano: calculatedQtyLembarPlano, // Use the calculated value
      tipe: formData.tipe,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">
            Tambah Data Kertas
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form Content */}
        <div className="space-y-4">
          {/* Item Kertas Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Kertas
            </label>
            {loading ? (
              <div className="text-sm text-gray-500">Loading options...</div>
            ) : (
              <SearchableSelect
                options={[
                  { value: '', label: 'Pilih Data' },
                  ...kertasOptions.map((kertas) => ({
                    value: kertas.id.toString(),
                    label: `${kertas.kode_barang} - ${kertas.nama_barang}`,
                  })),
                ]}
                value={formData.id_kertas}
                onChange={handleKertasChange}
                placeholder="Pilih Kertas"
                required
              />
            )}
          </div>

          {/* Data Kalkulasi Section */}
          <div className="mt-6">
            <h4 className="font-semibold text-gray-800 mb-3">Data Kalkulasi</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Jenis Kertas: </span>
                <span className="font-medium">
                  {formData.jenis_kertas || 'undefined'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Nama Kertas: </span>
                <span className="font-medium">
                  {formData.nama_kertas || 'undefined'}
                </span>
              </div>
            </div>
          </div>

          {/* Auto-Calculated Qty Lembar Plano */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              📊 Qty Lembar Plano (Auto-Calculated)
            </h4>
            {kalkulasiInfo && kalkulasiInfo.po_qty ? (
              <div className="space-y-1 text-sm">
                <div className="text-gray-600">
                  Formula: (PO Qty / Ukuran Jadi Bagian 1) / Ukuran Jadi Isi 1
                </div>
                <div className="text-gray-600">
                  = ({kalkulasiInfo.po_qty} /{' '}
                  {kalkulasiInfo.ukuran_cetak_bagian_1}) /{' '}
                  {kalkulasiInfo.ukuran_cetak_isi_1}
                </div>
                <div className="text-lg font-bold text-blue-600 mt-2">
                  = {calculatedQtyLembarPlano} lembar
                </div>
              </div>
            ) : (
              <div className="text-lg font-bold text-blue-600">
                {calculatedQtyLembarPlano} lembar
              </div>
            )}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Tutup
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            disabled={!formData.id_kertas}
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
};

export default TambahKertasModal;
