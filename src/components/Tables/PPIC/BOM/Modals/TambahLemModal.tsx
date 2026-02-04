// components/BOM/Modals/TambahLemModal.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchableSelect from '../../../../../pages/MasterData/Marketing/SearchableSelect';

interface TambahLemModalProps {
  onClose: () => void;
  onSave: (data: {
    id_lem: number;
    nama_lem: string;
    rumus_lem: string;
    qty_konstanta: number;
    qty_lem: number;
    tipe: string;
  }) => void;
  po_qty?: number;
  tinggi_io?: number;
  selectedMounting?: any;
}

const TambahLemModal: React.FC<TambahLemModalProps> = ({
  onClose,
  onSave,
  po_qty = 0,
  tinggi_io = 0,
  selectedMounting,
}) => {
  const [formData, setFormData] = useState({
    id_lem: '',
    nama_lem: '',
    rumus_lem: '',
  });
  const [lemOptions, setLemOptions] = useState<
    Array<{ id: number; kode_barang: string; nama_barang: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [calculatedValues, setCalculatedValues] = useState({
    qty_konstanta: 0,
    qty_lem: 0,
  });

  useEffect(() => {
    fetchLemData();
  }, []);

  // Calculate konstanta and qty_lem based on selected formula
  useEffect(() => {
    // ✅ Check if selected item is NON LEM based on nama_barang
    const isNonLem = formData.nama_lem.toUpperCase().includes('NON LEM');

    if (isNonLem) {
      setCalculatedValues({
        qty_konstanta: 0,
        qty_lem: 0,
      });
      return;
    }

    if (tinggi_io > 0 && po_qty > 0 && formData.rumus_lem) {
      const konstanta = tinggi_io / 100;
      let qty_lem = 0;

      // Calculate based on selected formula
      switch (formData.rumus_lem) {
        case 'LOCK_BOTTOM':
          qty_lem = (konstanta + 2) * 0.0001 * po_qty;
          break;
        case 'LEM_SAMPING':
          qty_lem = konstanta * 0.0001 * po_qty;
          break;
        case 'FOUR_CORNER':
          qty_lem = konstanta * 4 * 0.0001 * po_qty;
          break;
        case 'SAMPING_LOCK_BOTTOM':
          qty_lem = (konstanta + 2) * 0.0001 * po_qty;
          break;
        case 'SIX_CORNER':
          qty_lem = konstanta * 6 * 0.0001 * po_qty;
          break;
        case 'UJUNG_LOCK_BOTTOM':
          qty_lem = (konstanta + 2) * 0.0001 * po_qty;
          break;
        default:
          qty_lem = 0;
      }

      console.log('Calculating with:', {
        tinggi_io,
        konstanta,
        po_qty,
        formula: formData.rumus_lem,
        qty_lem,
      });

      setCalculatedValues({
        qty_konstanta: konstanta,
        qty_lem: qty_lem,
      });
    }
  }, [formData.rumus_lem, formData.nama_lem, po_qty, tinggi_io]);

  const fetchLemData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_LINK}/master/barang`,
        {
          params: {
            kategori: 'LEM',
          },
          withCredentials: true,
        },
      );

      const lemData = response.data?.data || [];
      setLemOptions(lemData);
    } catch (error) {
      console.error('Error fetching lem data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLemChange = (value: string | number) => {
    const selectedLem = lemOptions.find(
      (item) => item.id.toString() === value.toString(),
    );

    if (selectedLem) {
      // ✅ Check if selected item is NON LEM
      const isNonLem = selectedLem.nama_barang
        .toUpperCase()
        .includes('NON LEM');

      setFormData({
        ...formData,
        id_lem: value.toString(),
        nama_lem: selectedLem.nama_barang,
        // If NON LEM, clear rumus selection so user doesn't need to select it
        rumus_lem: isNonLem ? '' : formData.rumus_lem,
      });
    } else {
      setFormData({
        ...formData,
        id_lem: '',
        nama_lem: '',
      });
    }
  };

  const handleRumusChange = (value: string | number) => {
    setFormData({
      ...formData,
      rumus_lem: value.toString(),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Check if selected item is NON LEM
    const isNonLem = formData.nama_lem.toUpperCase().includes('NON LEM');

    if (!formData.id_lem) {
      alert('Mohon pilih item lem');
      return;
    }

    // For NON LEM, rumus is not required
    if (!isNonLem && !formData.rumus_lem) {
      alert('Mohon pilih rumus perhitungan');
      return;
    }

    console.log('Saving data:', calculatedValues);

    onSave({
      id_lem: Number(formData.id_lem),
      nama_lem: formData.nama_lem,
      rumus_lem: isNonLem ? 'NON_LEM' : formData.rumus_lem,
      qty_konstanta: calculatedValues.qty_konstanta,
      qty_lem: calculatedValues.qty_lem,
      tipe: 'DRAFT',
    });

    onClose();
  };

  // Helper function to get formula display text
  const getFormulaDisplay = () => {
    // ✅ Check if selected item is NON LEM
    const isNonLem = formData.nama_lem.toUpperCase().includes('NON LEM');

    if (isNonLem) {
      return 'Tidak menggunakan lem = 0';
    }

    const { qty_konstanta } = calculatedValues;

    switch (formData.rumus_lem) {
      case 'LOCK_BOTTOM':
        return `((${qty_konstanta.toFixed(2)} + 2) × 0.0001) × ${po_qty}`;
      case 'LEM_SAMPING':
        return `(${qty_konstanta.toFixed(2)} × 0.0001) × ${po_qty}`;
      case 'FOUR_CORNER':
        return `((${qty_konstanta.toFixed(2)} × 4) × 0.0001) × ${po_qty}`;
      case 'SAMPING_LOCK_BOTTOM':
        return `((${qty_konstanta.toFixed(2)} + 2) × 0.0001) × ${po_qty}`;
      case 'SIX_CORNER':
        return `((${qty_konstanta.toFixed(2)} × 6) × 0.0001) × ${po_qty}`;
      case 'UJUNG_LOCK_BOTTOM':
        return `((${qty_konstanta.toFixed(2)} + 2) × 0.0001) × ${po_qty}`;
      default:
        return '';
    }
  };

  const rumusOptions = [
    { value: 'LOCK_BOTTOM', label: 'Lock Bottom' },
    { value: 'LEM_SAMPING', label: 'Lem Samping' },
    { value: 'FOUR_CORNER', label: 'Four Corner' },
    { value: 'SAMPING_LOCK_BOTTOM', label: 'Samping + Lock Bottom' },
    { value: 'SIX_CORNER', label: 'Six Corner' },
    { value: 'UJUNG_LOCK_BOTTOM', label: 'Ujung + Lock Bottom' },
  ];

  // ✅ Determine if form is valid for submission
  const isFormValid = () => {
    const isNonLem = formData.nama_lem.toUpperCase().includes('NON LEM');

    if (isNonLem) {
      return formData.id_lem !== ''; // NON LEM only needs item selected
    }
    return formData.id_lem && formData.rumus_lem; // Other items need both
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-800">
            Tambah Data Lem
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Info Section */}
          {po_qty > 0 &&
            tinggi_io > 0 &&
            !formData.nama_lem.toUpperCase().includes('NON LEM') && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm">
                <div className="grid grid-cols-2 gap-2 text-gray-700">
                  <div>
                    <span className="font-semibold">Qty SO:</span> {po_qty} pcs
                  </div>
                  <div>
                    <span className="font-semibold">Tinggi IO:</span>{' '}
                    {tinggi_io} mm
                  </div>
                  <div className="col-span-2">
                    <span className="font-semibold">Konstanta Lem:</span>{' '}
                    <span className="text-blue-600 font-bold">
                      {calculatedValues.qty_konstanta.toFixed(2)}
                    </span>{' '}
                    (Tinggi IO {tinggi_io} / 100)
                  </div>
                  <div>
                    <span className="font-semibold">Nama LEM:</span>{' '}
                    {selectedMounting.nama_lem}
                  </div>
                </div>
              </div>
            )}

          {/* ✅ NON_LEM Info */}
          {formData.nama_lem.toUpperCase().includes('NON LEM') && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm border border-gray-300">
              <div className="text-gray-700">
                <span className="font-semibold">ℹ️ NON LEM:</span> Produk ini
                tidak menggunakan lem. Semua nilai akan diset ke 0.
              </div>
            </div>
          )}

          {/* Item Lem */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Lem <span className="text-red-500">*</span>
            </label>
            {loading ? (
              <div className="text-sm text-gray-500">Loading data...</div>
            ) : (
              <SearchableSelect
                options={[
                  { value: '', label: 'Pilih Data' },
                  ...lemOptions.map((lem) => ({
                    value: lem.id.toString(),
                    label: `${lem.kode_barang} - ${lem.nama_barang}`,
                  })),
                ]}
                value={formData.id_lem}
                onChange={handleLemChange}
                placeholder="Pilih Item Lem"
                required
              />
            )}
          </div>

          {/* ✅ Rumus - Only show if NOT NON LEM */}
          {formData.id_lem &&
            !formData.nama_lem.toUpperCase().includes('NON LEM') && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rumus yang dipakai <span className="text-red-500">*</span>
                </label>
                <SearchableSelect
                  options={[
                    { value: '', label: 'Pilih Rumus' },
                    ...rumusOptions,
                  ]}
                  value={formData.rumus_lem}
                  onChange={handleRumusChange}
                  placeholder="Pilih Rumus Perhitungan"
                  required
                />
              </div>
            )}

          {/* Display selected formula */}
          {(formData.nama_lem.toUpperCase().includes('NON LEM') ||
            formData.rumus_lem) && (
            <div className="mt-3 p-3 bg-white rounded border border-gray-200 mb-4">
              <div className="text-xs text-gray-600 mb-1">Formula:</div>
              <div className="text-sm font-mono text-gray-800">
                {getFormulaDisplay()}
                {!formData.nama_lem.toUpperCase().includes('NON LEM') &&
                  formData.rumus_lem &&
                  ` = ${calculatedValues.qty_lem.toFixed(4)}`}
              </div>
            </div>
          )}

          {/* Calculated Results Preview */}
          {(formData.nama_lem.toUpperCase().includes('NON LEM') ||
            formData.rumus_lem) && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">
                Hasil Kalkulasi:
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Qty Konstanta:</span>
                  <span className="ml-2 font-semibold text-green-700">
                    {calculatedValues.qty_konstanta.toFixed(4)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">
                    Qty Lem
                    {!formData.nama_lem.toUpperCase().includes('NON LEM') &&
                      formData.rumus_lem &&
                      ` (
                    ${rumusOptions.find((r) => r.value === formData.rumus_lem)
                      ?.label}
                    )`}
                    :
                  </span>
                  <span className="ml-2 font-semibold text-green-700">
                    {calculatedValues.qty_lem.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Tutup
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!isFormValid()}
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TambahLemModal;
