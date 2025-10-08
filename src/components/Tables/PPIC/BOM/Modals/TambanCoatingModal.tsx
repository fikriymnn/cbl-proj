// components/BOM/Modals/TambahCoatingModal.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchableSelect from '../../../../../pages/MasterData/Marketing/SearchableSelect';

interface TambahCoatingModalProps {
  onClose: () => void;
  onSave: (data: {
    id_coating_depan: number;
    id_coating_belakang: number;
    nama_coating_depan: string;
    nama_coating_belakang: string;
    uv_wb: number;
    varnish_doff: number;
    rumus_coating: string;
    tipe: string;
  }) => void;
  po_qty?: number;
  id_kalkulasi?: number;
}

const TambahCoatingModal: React.FC<TambahCoatingModalProps> = ({
  onClose,
  onSave,
  po_qty = 0,
  id_kalkulasi,
}) => {
  const [formData, setFormData] = useState({
    id_coating_depan: '',
    nama_coating_depan: '',
    rumus_coating: '',
  });
  const [coatingOptions, setCoatingOptions] = useState<
    Array<{ id: number; kode_barang: string; nama_barang: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [kalkulasiData, setKalkulasiData] = useState<any>(null);
  const [calculatedValues, setCalculatedValues] = useState({
    uv_wb: 0,
    varnish_doff: 0,
  });

  useEffect(() => {
    fetchCoatingData();
  }, []);

  useEffect(() => {
    if (id_kalkulasi) {
      fetchKalkulasiData();
    }
  }, [id_kalkulasi]);

  // Calculate BOTH formulas whenever kalkulasi data or po_qty changes
  useEffect(() => {
    if (kalkulasiData && po_qty > 0) {
      calculateQuantities();
    }
  }, [po_qty, kalkulasiData]);

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
      console.log('kalkulasi', response.data.data);
      if (response.data && response.data.data) {
        setKalkulasiData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching kalkulasi data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoatingData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_LINK}/master/barang`,
        {
          params: {
            kategori: 'COATING',
          },
          withCredentials: true,
        },
      );

      const coatingData = response.data?.data || [];
      setCoatingOptions(coatingData);
    } catch (error) {
      console.error('Error fetching coating data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateQuantities = () => {
    if (!kalkulasiData) return;

    const panjangCetak = kalkulasiData.ukuran_cetak_panjang_1 || 0;
    const lebarCetak = kalkulasiData.ukuran_cetak_lebar_1 || 0;
    const ukuranCetakIsi = kalkulasiData.ukuran_cetak_isi_1 || 1;

    // qty_druk = po_qty / ukuran_cetak_isi_1
    const qtyDruk = po_qty / ukuranCetakIsi;

    console.log('Calculating with:', {
      panjangCetak,
      lebarCetak,
      qtyDruk,
      po_qty,
    });

    // Calculate BOTH formulas regardless of selection
    // UV & WB: ((panjang_cetak × lebar_cetak) / 1.000.000) × qty_druk) / 1.000
    const uvWb = (((panjangCetak * lebarCetak) / 1000000) * qtyDruk) / 1000;

    // Varnish doff: qty_druk / 3.500
    const varnishDoff = qtyDruk / 3500;

    const calculated = {
      uv_wb: uvWb,
      varnish_doff: varnishDoff,
    };

    console.log('Calculated values (BOTH):', calculated);
    setCalculatedValues(calculated);
  };

  const handleCoatingDepanChange = (value: string | number) => {
    const selectedCoating = coatingOptions.find(
      (item) => item.id.toString() === value.toString(),
    );

    if (selectedCoating) {
      setFormData({
        ...formData,
        id_coating_depan: value.toString(),
        nama_coating_depan: selectedCoating.nama_barang,
      });
    } else {
      setFormData({
        ...formData,
        id_coating_depan: '',
        nama_coating_depan: '',
      });
    }
  };

  const handleRumusChange = (value: string | number) => {
    setFormData({
      ...formData,
      rumus_coating: value.toString(),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.rumus_coating) {
      alert('Mohon pilih rumus coating');
      return;
    }

    if (!formData.id_coating_depan) {
      alert('Mohon pilih coating depan');
      return;
    }

    console.log('Saving data with BOTH calculations:', calculatedValues);

    // Always save to coating_depan regardless of formula
    onSave({
      id_coating_depan: Number(formData.id_coating_depan),
      id_coating_belakang: 0,
      nama_coating_depan: formData.nama_coating_depan,
      nama_coating_belakang: '',
      uv_wb: calculatedValues.uv_wb, // Always calculated
      varnish_doff: calculatedValues.varnish_doff, // Always calculated
      rumus_coating: formData.rumus_coating,
      tipe: 'DRAFT',
    });

    onClose();
  };

  const rumusOptions = [
    { value: 'UV_WB', label: 'UV & WB' },
    { value: 'VARNISH_DOFF', label: 'Varnish Doff' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-800">
            Tambah Data Coating
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
          {po_qty > 0 && kalkulasiData && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm">
              <div className="grid grid-cols-2 gap-2 text-gray-700">
                <div>
                  <span className="font-semibold">Qty SO:</span> {po_qty} pcs
                </div>
                <div>
                  <span className="font-semibold">Qty Druk:</span>{' '}
                  {(po_qty / (kalkulasiData.ukuran_cetak_isi_1 || 1)).toFixed(
                    2,
                  )}
                </div>
                <div>
                  <span className="font-semibold">Panjang Cetak:</span>{' '}
                  {kalkulasiData.ukuran_cetak_panjang_1} mm
                </div>
                <div>
                  <span className="font-semibold">Lebar Cetak:</span>{' '}
                  {kalkulasiData.ukuran_cetak_lebar_1} mm
                </div>
              </div>
            </div>
          )}

          {/* Rumus yang dipakai */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rumus yang dipakai
            </label>
            <SearchableSelect
              options={[{ value: '', label: 'Pilih Rumus' }, ...rumusOptions]}
              value={formData.rumus_coating}
              onChange={handleRumusChange}
              placeholder="Pilih Rumus Perhitungan"
              required
            />
          </div>

          {/* Item Coating Depan - Always show */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Coating Depan
            </label>
            {loading ? (
              <div className="text-sm text-gray-500">Loading data...</div>
            ) : (
              <SearchableSelect
                options={[
                  { value: '', label: 'Pilih Data' },
                  ...coatingOptions.map((coating) => ({
                    value: coating.id.toString(),
                    label: `${coating.kode_barang} - ${coating.nama_barang}`,
                  })),
                ]}
                value={formData.id_coating_depan}
                onChange={handleCoatingDepanChange}
                placeholder="Pilih Item Coating Depan"
                required
              />
            )}
          </div>

          {/* Display BOTH formulas */}
          {kalkulasiData && (
            <div className="mt-3 p-3 bg-white rounded border border-gray-200 mb-4">
              <div className="text-xs text-gray-600 mb-2 font-semibold">
                Formulas (Both Calculated):
              </div>
              <div className="space-y-2">
                <div
                  className={`text-sm font-mono text-gray-800 p-2 rounded ${
                    formData.rumus_coating === 'UV_WB'
                      ? 'bg-blue-100 border-2 border-blue-400'
                      : 'bg-blue-50'
                  }`}
                >
                  <div className="text-xs text-blue-600 mb-1 font-semibold">
                    UV & WB:{' '}
                    {formData.rumus_coating === 'UV_WB' && '✓ Selected'}
                  </div>
                  {`(((${kalkulasiData.ukuran_cetak_panjang_1} × ${
                    kalkulasiData.ukuran_cetak_lebar_1
                  }) / 1.000.000) × ${(
                    po_qty / (kalkulasiData.ukuran_cetak_isi_1 || 1)
                  ).toFixed(2)}) / 1.000 = ${calculatedValues.uv_wb.toFixed(
                    4,
                  )} kg`}
                </div>
                <div
                  className={`text-sm font-mono text-gray-800 p-2 rounded ${
                    formData.rumus_coating === 'VARNISH_DOFF'
                      ? 'bg-purple-100 border-2 border-purple-400'
                      : 'bg-purple-50'
                  }`}
                >
                  <div className="text-xs text-purple-600 mb-1 font-semibold">
                    Varnish Doff:{' '}
                    {formData.rumus_coating === 'VARNISH_DOFF' && '✓ Selected'}
                  </div>
                  {`${(
                    po_qty / (kalkulasiData.ukuran_cetak_isi_1 || 1)
                  ).toFixed(
                    2,
                  )} / 3.500 = ${calculatedValues.varnish_doff.toFixed(4)} kg`}
                </div>
              </div>
            </div>
          )}

          {/* Calculated Results Preview - Show BOTH */}
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">
              Hasil Kalkulasi (Auto - Kedua Rumus):
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div
                className={`p-2 rounded border ${
                  formData.rumus_coating === 'UV_WB'
                    ? 'bg-green-100 border-green-400'
                    : 'bg-white border-green-200'
                }`}
              >
                <span className="text-gray-600 block mb-1">Qty UV/WB:</span>
                <span className="font-semibold text-green-700 text-lg">
                  {calculatedValues.uv_wb.toFixed(4)} kg
                </span>
              </div>
              <div
                className={`p-2 rounded border ${
                  formData.rumus_coating === 'VARNISH_DOFF'
                    ? 'bg-green-100 border-green-400'
                    : 'bg-white border-green-200'
                }`}
              >
                <span className="text-gray-600 block mb-1">
                  Qty Varnish Doff:
                </span>
                <span className="font-semibold text-green-700 text-lg">
                  {calculatedValues.varnish_doff.toFixed(4)} kg
                </span>
              </div>
            </div>
          </div>

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
              disabled={!formData.rumus_coating}
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TambahCoatingModal;
