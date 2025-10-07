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
    qty_lock_bottom: number;
    qty_lem_samping: number;
    qty_four_corner: number;
    qty_samping_lock_bottom: number;
    qty_six_corner: number;
    qty_ujung_lock_bottom: number;
    tipe: string;
  }) => void;
  po_qty?: number;
  tinggi_io?: number;
}

const TambahLemModal: React.FC<TambahLemModalProps> = ({
  onClose,
  onSave,
  po_qty = 0,
  tinggi_io = 0,
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
    qty_lock_bottom: 0,
    qty_lem_samping: 0,
    qty_four_corner: 0,
    qty_samping_lock_bottom: 0,
    qty_six_corner: 0,
    qty_ujung_lock_bottom: 0,
  });

  useEffect(() => {
    fetchLemData();
  }, []);

  // Calculate konstanta first when tinggi_io changes
  useEffect(() => {
    if (tinggi_io > 0) {
      const konstanta = tinggi_io / 100;
      setCalculatedValues((prev) => ({
        ...prev,
        qty_konstanta: konstanta,
      }));
    }
  }, [tinggi_io]);

  // Calculate all quantities based on the formula
  useEffect(() => {
    if (tinggi_io > 0 && po_qty > 0 && formData.rumus_lem) {
      //  const tinggiCM = tinggi_io / 10;

      //       const konstanta = tinggiCM / 100;

      const konstanta = tinggi_io / 100; // Calculate konstanta from tinggi_io

      console.log('Calculating with:', { tinggi_io, konstanta, po_qty }); // Debug log

      // Calculate based on formula from image 2
      const calculated = {
        qty_konstanta: konstanta, // tinggi (IO)/100
        qty_lock_bottom: (konstanta + 2) * 0.0001 * po_qty,
        qty_lem_samping: konstanta * 0.0001 * po_qty,
        qty_four_corner: konstanta * 4 * 0.0001 * po_qty,
        qty_samping_lock_bottom: (konstanta + 2) * 0.0001 * po_qty,
        qty_six_corner: konstanta * 6 * 0.0001 * po_qty,
        qty_ujung_lock_bottom: (konstanta + 2) * 0.0001 * po_qty,
      };

      console.log('Calculated values:', calculated); // Debug log

      setCalculatedValues(calculated);
    }
  }, [formData.rumus_lem, po_qty, tinggi_io]);

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
      setFormData({
        ...formData,
        id_lem: value.toString(),
        nama_lem: selectedLem.nama_barang,
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

    if (!formData.id_lem || !formData.rumus_lem) {
      alert('Mohon lengkapi semua data');
      return;
    }

    console.log('Saving data:', calculatedValues); // Debug log

    onSave({
      id_lem: Number(formData.id_lem),
      nama_lem: formData.nama_lem,
      rumus_lem: formData.rumus_lem,
      qty_konstanta: calculatedValues.qty_konstanta,
      qty_lock_bottom: calculatedValues.qty_lock_bottom,
      qty_lem_samping: calculatedValues.qty_lem_samping,
      qty_four_corner: calculatedValues.qty_four_corner,
      qty_samping_lock_bottom: calculatedValues.qty_samping_lock_bottom,
      qty_six_corner: calculatedValues.qty_six_corner,
      qty_ujung_lock_bottom: calculatedValues.qty_ujung_lock_bottom,
      tipe: 'DRAFT',
    });

    onClose();
  };

  // Rumus options based on the formula image
  const rumusOptions = [
    { value: 'LOCK_BOTTOM', label: 'Lock Bottom' },
    { value: 'LEM_SAMPING', label: 'Lem Samping' },
    { value: 'FOUR_CORNER', label: 'Four Corner' },
    { value: 'SAMPING_LOCK_BOTTOM', label: 'Samping + Lock Bottom' },
    { value: 'SIX_CORNER', label: 'Six Corner' },
    { value: 'UJUNG_LOCK_BOTTOM', label: 'Ujung + Lock Bottom' },
  ];

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
          {po_qty > 0 && tinggi_io > 0 && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm">
              <div className="grid grid-cols-2 gap-2 text-gray-700">
                <div>
                  <span className="font-semibold">Qty SO:</span> {po_qty} pcs
                </div>
                <div>
                  <span className="font-semibold">Tinggi IO:</span> {tinggi_io}{' '}
                  mm
                </div>
                <div className="col-span-2">
                  <span className="font-semibold">Konstanta Lem:</span>{' '}
                  <span className="text-blue-600 font-bold">
                    {calculatedValues.qty_konstanta.toFixed(2)}
                  </span>{' '}
                  (Tinggi IO {tinggi_io} / 100)
                </div>
              </div>
            </div>
          )}

          {/* Item Lem */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Lem
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

          {/* Data Kalkulasi Section */}
          <div className="mb-4  bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-3">
              Data Kalkulasi:
            </h3>

            {/* Rumus yang dipakai */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rumus yang dipakai
              </label>
              <SearchableSelect
                options={[{ value: '', label: 'Pilih Rumus' }, ...rumusOptions]}
                value={formData.rumus_lem}
                onChange={handleRumusChange}
                placeholder="Pilih Rumus Perhitungan"
                required
              />
            </div>

            {/* Display selected formula */}
            {formData.rumus_lem && (
              <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                <div className="text-xs text-gray-600 mb-1">Formula:</div>
                <div className="text-sm font-mono text-gray-800">
                  {formData.rumus_lem === 'LOCK_BOTTOM' &&
                    `((${calculatedValues.qty_konstanta.toFixed(
                      2,
                    )} + 2) × 0.0001) × ${po_qty} = ${calculatedValues.qty_lock_bottom.toFixed(
                      4,
                    )}`}
                  {formData.rumus_lem === 'LEM_SAMPING' &&
                    `(${calculatedValues.qty_konstanta.toFixed(
                      2,
                    )} × 0.0001) × ${po_qty} = ${calculatedValues.qty_lem_samping.toFixed(
                      4,
                    )}`}
                  {formData.rumus_lem === 'FOUR_CORNER' &&
                    `((${calculatedValues.qty_konstanta.toFixed(
                      2,
                    )} × 4) × 0.0001) × ${po_qty} = ${calculatedValues.qty_four_corner.toFixed(
                      4,
                    )}`}
                  {formData.rumus_lem === 'SAMPING_LOCK_BOTTOM' &&
                    `((${calculatedValues.qty_konstanta.toFixed(
                      2,
                    )} + 2) × 0.0001) × ${po_qty} = ${calculatedValues.qty_samping_lock_bottom.toFixed(
                      4,
                    )}`}
                  {formData.rumus_lem === 'SIX_CORNER' &&
                    `((${calculatedValues.qty_konstanta.toFixed(
                      2,
                    )} × 6) × 0.0001) × ${po_qty} = ${calculatedValues.qty_six_corner.toFixed(
                      4,
                    )}`}
                  {formData.rumus_lem === 'UJUNG_LOCK_BOTTOM' &&
                    `((${calculatedValues.qty_konstanta.toFixed(
                      2,
                    )} + 2) × 0.0001) × ${po_qty} = ${calculatedValues.qty_ujung_lock_bottom.toFixed(
                      4,
                    )}`}
                </div>
              </div>
            )}
          </div>

          {/* Calculated Results Preview */}
          {formData.rumus_lem && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">
                Hasil Kalkulasi (Auto):
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="col-span-2">
                  <span className="text-gray-600">Qty Konstanta:</span>
                  <span className="ml-2 font-semibold text-green-700">
                    {calculatedValues.qty_konstanta.toFixed(4)}
                  </span>
                </div>
                {formData.rumus_lem === 'LOCK_BOTTOM' && (
                  <div>
                    <span className="text-gray-600">Qty Lock Bottom:</span>
                    <span className="ml-2 font-semibold text-green-700">
                      {calculatedValues.qty_lock_bottom.toFixed(4)}
                    </span>
                  </div>
                )}
                {formData.rumus_lem === 'LEM_SAMPING' && (
                  <div>
                    <span className="text-gray-600">Qty Lem Samping:</span>
                    <span className="ml-2 font-semibold text-green-700">
                      {calculatedValues.qty_lem_samping.toFixed(4)}
                    </span>
                  </div>
                )}
                {formData.rumus_lem === 'FOUR_CORNER' && (
                  <div>
                    <span className="text-gray-600">Qty Four Corner:</span>
                    <span className="ml-2 font-semibold text-green-700">
                      {calculatedValues.qty_four_corner.toFixed(4)}
                    </span>
                  </div>
                )}
                {formData.rumus_lem === 'SAMPING_LOCK_BOTTOM' && (
                  <div>
                    <span className="text-gray-600">
                      Qty Samping Lock Bottom:
                    </span>
                    <span className="ml-2 font-semibold text-green-700">
                      {calculatedValues.qty_samping_lock_bottom.toFixed(4)}
                    </span>
                  </div>
                )}
                {formData.rumus_lem === 'SIX_CORNER' && (
                  <div>
                    <span className="text-gray-600">Qty Six Corner:</span>
                    <span className="ml-2 font-semibold text-green-700">
                      {calculatedValues.qty_six_corner.toFixed(4)}
                    </span>
                  </div>
                )}
                {formData.rumus_lem === 'UJUNG_LOCK_BOTTOM' && (
                  <div>
                    <span className="text-gray-600">
                      Qty Ujung Lock Bottom:
                    </span>
                    <span className="ml-2 font-semibold text-green-700">
                      {calculatedValues.qty_ujung_lock_bottom.toFixed(4)}
                    </span>
                  </div>
                )}
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
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              disabled={!formData.id_lem || !formData.rumus_lem}
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
