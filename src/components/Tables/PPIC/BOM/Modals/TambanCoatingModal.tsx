// components/BOM/Modals/TambahCoatingModal.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchableSelect from '../../../../../pages/MasterData/Marketing/SearchableSelect';

interface TambahCoatingModalProps {
  onClose: () => void;
  onSave: (data: {
    id_coating_depan: number | null;
    id_coating_belakang: number | null;
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
    id_coating_belakang: '',
    nama_coating_belakang: '',
    rumus_coating: '',
  });
  const [coatingOptions, setCoatingOptions] = useState<
    Array<{ id: number; kode_barang: string; nama_barang: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [kalkulasiData, setKalkulasiData] = useState<any>(null);
  const [calculatedValue, setCalculatedValue] = useState(0);

  useEffect(() => {
    fetchCoatingData();
  }, []);

  useEffect(() => {
    if (id_kalkulasi) {
      fetchKalkulasiData();
    }
  }, [id_kalkulasi]);

  // Calculate only the selected formula
  useEffect(() => {
    if (kalkulasiData && po_qty > 0 && formData.rumus_coating) {
      calculateQuantity();
    }
  }, [po_qty, kalkulasiData, formData.rumus_coating]);

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

  const calculateQuantity = () => {
    if (!kalkulasiData || !formData.rumus_coating) return;

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
      rumus: formData.rumus_coating,
    });

    let calculated = 0;

    // Calculate ONLY the selected formula
    if (formData.rumus_coating === 'UV_WB') {
      // UV & WB: ((panjang_cetak × lebar_cetak) / 1.000.000) × qty_druk) / 1.000
      calculated = (((panjangCetak * lebarCetak) / 1000000) * qtyDruk) / 1000;
    } else if (formData.rumus_coating === 'VARNISH_DOFF') {
      // Varnish doff: qty_druk / 3.500
      calculated = qtyDruk / 3500;
    }

    console.log('Calculated value for selected formula:', calculated);
    setCalculatedValue(calculated);
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

  const handleCoatingBelakangChange = (value: string | number) => {
    const selectedCoating = coatingOptions.find(
      (item) => item.id.toString() === value.toString(),
    );

    if (selectedCoating) {
      setFormData({
        ...formData,
        id_coating_belakang: value.toString(),
        nama_coating_belakang: selectedCoating.nama_barang,
      });
    } else {
      setFormData({
        ...formData,
        id_coating_belakang: '',
        nama_coating_belakang: '',
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

    if (!formData.id_coating_depan && !formData.id_coating_belakang) {
      alert('Mohon pilih minimal satu coating (depan atau belakang)');
      return;
    }

    console.log('Saving data with selected calculation:', calculatedValue);

    // Save with only the selected formula calculated
    onSave({
      id_coating_depan: formData.id_coating_depan
        ? Number(formData.id_coating_depan)
        : null,
      id_coating_belakang: formData.id_coating_belakang
        ? Number(formData.id_coating_belakang)
        : null,
      nama_coating_depan: formData.nama_coating_depan,
      nama_coating_belakang: formData.nama_coating_belakang,
      uv_wb: formData.rumus_coating === 'UV_WB' ? calculatedValue : 0,
      varnish_doff:
        formData.rumus_coating === 'VARNISH_DOFF' ? calculatedValue : 0,
      rumus_coating: formData.rumus_coating,
      tipe: 'DRAFT',
    });

    onClose();
  };

  const rumusOptions = [
    { value: 'UV_WB', label: 'UV & WB' },
    { value: 'VARNISH_DOFF', label: 'Varnish Doff' },
  ];

  const getFormulaDisplay = () => {
    if (!kalkulasiData || !formData.rumus_coating) return null;

    const panjangCetak = kalkulasiData.ukuran_cetak_panjang_1;
    const lebarCetak = kalkulasiData.ukuran_cetak_lebar_1;
    const ukuranCetakIsi = kalkulasiData.ukuran_cetak_isi_1 || 1;
    const qtyDruk = (po_qty / ukuranCetakIsi).toFixed(2);

    if (formData.rumus_coating === 'UV_WB') {
      return `(((${panjangCetak} × ${lebarCetak}) / 1.000.000) × ${qtyDruk}) / 1.000 = ${calculatedValue.toFixed(
        4,
      )} kg`;
    } else if (formData.rumus_coating === 'VARNISH_DOFF') {
      return `${qtyDruk} / 3.500 = ${calculatedValue.toFixed(4)} kg`;
    }
  };

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
              Rumus yang dipakai <span className="text-red-500">*</span>
            </label>
            <SearchableSelect
              options={[{ value: '', label: 'Pilih Rumus' }, ...rumusOptions]}
              value={formData.rumus_coating}
              onChange={handleRumusChange}
              placeholder="Pilih Rumus Perhitungan"
              required
            />
          </div>

          {/* Item Coating Depan */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Coating Depan
            </label>
            {loading ? (
              <div className="text-sm text-gray-500">Loading data...</div>
            ) : (
              <SearchableSelect
                options={[
                  { value: '', label: 'Pilih Data (Opsional)' },
                  ...coatingOptions.map((coating) => ({
                    value: coating.id.toString(),
                    label: `${coating.kode_barang} - ${coating.nama_barang}`,
                  })),
                ]}
                value={formData.id_coating_depan}
                onChange={handleCoatingDepanChange}
                placeholder="Pilih Item Coating Depan"
              />
            )}
          </div>

          {/* Item Coating Belakang */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Coating Belakang
            </label>
            {loading ? (
              <div className="text-sm text-gray-500">Loading data...</div>
            ) : (
              <SearchableSelect
                options={[
                  { value: '', label: 'Pilih Data (Opsional)' },
                  ...coatingOptions.map((coating) => ({
                    value: coating.id.toString(),
                    label: `${coating.kode_barang} - ${coating.nama_barang}`,
                  })),
                ]}
                value={formData.id_coating_belakang}
                onChange={handleCoatingBelakangChange}
                placeholder="Pilih Item Coating Belakang"
              />
            )}
          </div>

          {/* Display selected formula only */}
          {kalkulasiData && formData.rumus_coating && (
            <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200 mb-4">
              <div className="text-xs text-blue-600 mb-2 font-semibold">
                Formula Terpilih:{' '}
                {formData.rumus_coating === 'UV_WB'
                  ? 'UV & WB'
                  : 'Varnish Doff'}
              </div>
              <div className="text-sm font-mono text-gray-800 p-2 rounded bg-white">
                {getFormulaDisplay()}
              </div>
            </div>
          )}

          {/* Calculated Result Preview - Show only selected */}
          {formData.rumus_coating && calculatedValue > 0 && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">
                Hasil Kalkulasi:
              </h4>
              <div className="text-sm p-2 rounded bg-white border border-green-200">
                <span className="text-gray-600 block mb-1">
                  {formData.rumus_coating === 'UV_WB'
                    ? 'Qty UV/WB:'
                    : 'Qty Varnish Doff:'}
                </span>
                <span className="font-semibold text-green-700 text-lg">
                  {calculatedValue.toFixed(4)} kg
                </span>
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
