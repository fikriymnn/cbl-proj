// components/BOM/Modals/TambahCoatingModal.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchableSelect from '../../../../../pages/MasterData/Marketing/SearchableSelect';

interface TambahCoatingModalProps {
  onClose: () => void;
  onSave: (data: {
    id_coating: number | null;
    nama_coating: string;
    tipe_coating: 'Depan' | 'Belakang';
    qty_coating: number;
    uv_wb: number;
    varnish_doff: number;
    rumus_coating: string;
    tipe: string;
  }) => void;
  po_qty?: number;
  selectedMounting?: any;
}

const TambahCoatingModal: React.FC<TambahCoatingModalProps> = ({
  onClose,
  onSave,
  po_qty = 0,
  selectedMounting,
}) => {
  const [formData, setFormData] = useState({
    id_coating: '',
    nama_coating: '',
    tipe_coating: '',
    rumus_coating: '',
  });
  const [coatingOptions, setCoatingOptions] = useState<
    Array<{ id: number; kode_barang: string; nama_barang: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [calculatedQty, setCalculatedQty] = useState(0);
  const [calculatedUVWB, setCalculatedUVWB] = useState(0);
  const [calculatedVarnishDoff, setCalculatedVarnishDoff] = useState(0);

  useEffect(() => {
    fetchCoatingData();
  }, []);

  // Calculate quantities when data is available
  useEffect(() => {
    if (selectedMounting && po_qty > 0 && formData.rumus_coating) {
      calculateQuantities();
    }
  }, [po_qty, selectedMounting, formData.rumus_coating, formData.nama_coating]);

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
    if (!selectedMounting || !formData.rumus_coating) return;

    // ✅ Check if selected item is NON COATING based on nama_barang
    const isNonCoating = formData.nama_coating
      .toUpperCase()
      .includes('NON COATING');

    if (isNonCoating) {
      setCalculatedQty(0);
      setCalculatedUVWB(0);
      setCalculatedVarnishDoff(0);
      return;
    }

    // Ambil data dari mounting yang dipilih
    const panjangCetak = selectedMounting.ukuran_cetak_panjang_1 || 0;
    const lebarCetak = selectedMounting.ukuran_cetak_lebar_1 || 0;
    const ukuranCetakIsi = selectedMounting.ukuran_cetak_isi_1 || 1;

    // qty_druk = po_qty / ukuran_cetak_isi_1
    const qtyDruk = po_qty / ukuranCetakIsi;

    console.log('Calculating with mounting data:', {
      panjangCetak,
      lebarCetak,
      qtyDruk,
      po_qty,
      ukuranCetakIsi,
      rumus: formData.rumus_coating,
    });

    let qty = 0;
    let uvWb = 0;
    let varnishDoff = 0;

    // Calculate based on selected formula
    if (formData.rumus_coating === 'UV_WB') {
      // UV & WB: ((panjang_cetak × lebar_cetak) / 1.000.000) × qty_druk) / 1.000
      qty = (((panjangCetak * lebarCetak) / 1000000) * qtyDruk) / 1000;
      uvWb = qty;
    } else if (formData.rumus_coating === 'VARNISH_DOFF') {
      // Varnish doff: qty_druk / 3.500
      qty = qtyDruk / 3500;
      varnishDoff = qty;
    }

    console.log('Calculated values:', { qty, uvWb, varnishDoff });
    setCalculatedQty(qty);
    setCalculatedUVWB(uvWb);
    setCalculatedVarnishDoff(varnishDoff);
  };

  const handleCoatingChange = (value: string | number) => {
    const selectedCoating = coatingOptions.find(
      (item) => item.id.toString() === value.toString(),
    );

    if (selectedCoating) {
      // ✅ Check if selected item is NON COATING
      const isNonCoating = selectedCoating.nama_barang
        .toUpperCase()
        .includes('NON COATING');

      setFormData({
        ...formData,
        id_coating: value.toString(),
        nama_coating: selectedCoating.nama_barang,
        // If NON COATING, clear rumus selection so user doesn't need to select it
        rumus_coating: isNonCoating ? '' : formData.rumus_coating,
      });
    } else {
      setFormData({
        ...formData,
        id_coating: '',
        nama_coating: '',
      });
    }
  };

  const handleTipeCoatingChange = (value: string | number) => {
    setFormData({
      ...formData,
      tipe_coating: value.toString(),
    });
  };

  const handleRumusChange = (value: string | number) => {
    setFormData({
      ...formData,
      rumus_coating: value.toString(),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Check if selected item is NON COATING
    const isNonCoating = formData.nama_coating
      .toUpperCase()
      .includes('NON COATING');

    if (!formData.id_coating) {
      alert('Mohon pilih item coating');
      return;
    }

    if (!formData.tipe_coating) {
      alert('Mohon pilih tipe coating');
      return;
    }

    // For NON COATING, rumus is not required
    if (!isNonCoating && !formData.rumus_coating) {
      alert('Mohon pilih rumus coating');
      return;
    }

    console.log('Saving data with calculations:', {
      qty_coating: calculatedQty,
      uv_wb: calculatedUVWB,
      varnish_doff: calculatedVarnishDoff,
    });

    onSave({
      id_coating: Number(formData.id_coating),
      nama_coating: formData.nama_coating,
      tipe_coating: formData.tipe_coating as 'Depan' | 'Belakang',
      qty_coating: calculatedQty,
      uv_wb: calculatedUVWB,
      varnish_doff: calculatedVarnishDoff,
      rumus_coating: isNonCoating ? 'NON_COATING' : formData.rumus_coating,
      tipe: 'DRAFT',
    });

    onClose();
  };

  const rumusOptions = [
    { value: 'UV_WB', label: 'UV & WB' },
    { value: 'VARNISH_DOFF', label: 'Varnish Doff' },
  ];

  const tipeCoatingOptions = [
    { value: 'Depan', label: 'Depan' },
    { value: 'Belakang', label: 'Belakang' },
  ];

  const getFormulaDisplay = () => {
    if (!selectedMounting || !formData.rumus_coating) return null;

    // ✅ Check if selected item is NON COATING
    const isNonCoating = formData.nama_coating
      .toUpperCase()
      .includes('NON COATING');

    if (isNonCoating) {
      return 'Tidak menggunakan coating = 0';
    }

    const panjangCetak = selectedMounting.ukuran_cetak_panjang_1;
    const lebarCetak = selectedMounting.ukuran_cetak_lebar_1;
    const ukuranCetakIsi = selectedMounting.ukuran_cetak_isi_1 || 1;
    const qtyDruk = (po_qty / ukuranCetakIsi).toFixed(2);

    if (formData.rumus_coating === 'UV_WB') {
      return `(((${panjangCetak} × ${lebarCetak}) / 1.000.000) × ${qtyDruk}) / 1.000 = ${calculatedQty.toFixed(
        4,
      )} kg`;
    } else if (formData.rumus_coating === 'VARNISH_DOFF') {
      return `${qtyDruk} / 3.500 = ${calculatedQty.toFixed(4)} kg`;
    }
  };

  // ✅ Determine if form is valid for submission
  const isFormValid = () => {
    const isNonCoating = formData.nama_coating
      .toUpperCase()
      .includes('NON COATING');

    if (isNonCoating) {
      return formData.id_coating && formData.tipe_coating; // NON COATING needs item and tipe
    }
    return (
      formData.rumus_coating && formData.id_coating && formData.tipe_coating
    ); // Others need all three
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
          {/* Info Section dari Mounting */}
          {po_qty > 0 &&
            selectedMounting &&
            !formData.nama_coating.toUpperCase().includes('NON COATING') && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm">
                <div className="font-semibold text-blue-800 mb-2">
                  Data Mounting: {selectedMounting.nama_mounting}
                </div>
                <div className="grid grid-cols-2 gap-2 text-gray-700">
                  <div>
                    <span className="font-semibold">Qty PO:</span> {po_qty} pcs
                  </div>
                  <div>
                    <span className="font-semibold">Qty Druk:</span>{' '}
                    {(
                      po_qty / (selectedMounting.ukuran_cetak_isi_1 || 1)
                    ).toFixed(2)}
                  </div>
                  <div>
                    <span className="font-semibold">Panjang Cetak:</span>{' '}
                    {selectedMounting.ukuran_cetak_panjang_1} mm
                  </div>
                  <div>
                    <span className="font-semibold">Lebar Cetak:</span>{' '}
                    {selectedMounting.ukuran_cetak_lebar_1} mm
                  </div>
                  <div>
                    <span className="font-semibold">Ukuran Cetak Isi:</span>{' '}
                    {selectedMounting.ukuran_cetak_isi_1}
                  </div>
                  <div>
                    <span className="font-semibold">Coating Depan:</span>{' '}
                    {selectedMounting.nama_coating_depan || '-'}
                  </div>
                  <div></div>
                  <div>
                    <span className="font-semibold">Coating Belakang:</span>{' '}
                    {selectedMounting.nama_coating_belakan || '-'}
                  </div>
                </div>
              </div>
            )}

          {/* ✅ NON_COATING Info */}
          {formData.nama_coating.toUpperCase().includes('NON COATING') && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm border border-gray-300">
              <div className="text-gray-700">
                <span className="font-semibold">ℹ️ NON COATING:</span> Produk
                ini tidak menggunakan coating. Semua nilai akan diset ke 0.
              </div>
            </div>
          )}

          {!selectedMounting && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
              ⚠️ Data mounting belum tersedia
            </div>
          )}

          {/* Item Coating */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Coating <span className="text-red-500">*</span>
            </label>
            {loading ? (
              <div className="text-sm text-gray-500">Loading data...</div>
            ) : (
              <SearchableSelect
                options={[
                  { value: '', label: 'Pilih Item Coating' },
                  ...coatingOptions.map((coating) => ({
                    value: coating.id.toString(),
                    label: `${coating.kode_barang} - ${coating.nama_barang}`,
                  })),
                ]}
                value={formData.id_coating}
                onChange={handleCoatingChange}
                placeholder="Pilih Item Coating"
                required
              />
            )}
          </div>

          {/* Tipe Coating */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipe Coating <span className="text-red-500">*</span>
            </label>
            <SearchableSelect
              options={[
                { value: '', label: 'Pilih Tipe' },
                ...tipeCoatingOptions,
              ]}
              value={formData.tipe_coating}
              onChange={handleTipeCoatingChange}
              placeholder="Pilih Tipe Coating"
              required
            />
          </div>

          {/* ✅ Rumus - Only show if NOT NON COATING */}
          {formData.id_coating &&
            !formData.nama_coating.toUpperCase().includes('NON COATING') && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rumus yang dipakai <span className="text-red-500">*</span>
                </label>
                <SearchableSelect
                  options={[
                    { value: '', label: 'Pilih Rumus' },
                    ...rumusOptions,
                  ]}
                  value={formData.rumus_coating}
                  onChange={handleRumusChange}
                  placeholder="Pilih Rumus Perhitungan"
                  required
                />
              </div>
            )}

          {/* Display selected formula */}
          {selectedMounting &&
            (formData.nama_coating.toUpperCase().includes('NON COATING') ||
              formData.rumus_coating) && (
              <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200 mb-4">
                <div className="text-xs text-blue-600 mb-2 font-semibold">
                  Formula Terpilih:{' '}
                  {formData.nama_coating.toUpperCase().includes('NON COATING')
                    ? 'NON COATING'
                    : formData.rumus_coating === 'UV_WB'
                    ? 'UV & WB'
                    : 'Varnish Doff'}
                </div>
                <div className="text-sm font-mono text-gray-800 p-2 rounded bg-white">
                  {getFormulaDisplay()}
                </div>
              </div>
            )}

          {/* Calculated Result Preview */}
          {(formData.nama_coating.toUpperCase().includes('NON COATING') ||
            formData.rumus_coating) && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">
                Hasil Kalkulasi:
              </h4>
              <div className="space-y-2">
                <div className="text-sm p-2 rounded bg-white border border-green-200">
                  <span className="text-gray-600 block mb-1">Qty Coating:</span>
                  <span className="font-semibold text-green-700 text-lg">
                    {calculatedQty.toFixed(4)} kg
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-xs p-2 rounded bg-white border border-gray-200">
                    <span className="text-gray-600 block mb-1">Qty UV/WB:</span>
                    <span className="font-semibold text-gray-700">
                      {calculatedUVWB.toFixed(4)} kg
                    </span>
                  </div>
                  <div className="text-xs p-2 rounded bg-white border border-gray-200">
                    <span className="text-gray-600 block mb-1">
                      Qty Varnish Doff:
                    </span>
                    <span className="font-semibold text-gray-700">
                      {calculatedVarnishDoff.toFixed(4)} kg
                    </span>
                  </div>
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

export default TambahCoatingModal;
