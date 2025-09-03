import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { KalkulasiFormData } from '../KalkulasiModal';

interface PostPressTabProps {
  formData: KalkulasiFormData;
  onInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
}

interface PonsOption {
  id: number;
  nama_barang: string;
  harga: number;
}

interface OngkosPonsOption {
  id: number;
  nama_barang: string;
  harga: number;
}

interface SpecialFinishingOption {
  id: number;
  nama_barang: string;
  harga: number;
  sub_kategori: string;
}

interface TahapanResponse {
  id: number;
  nama_tahapan: string;
}

interface MesinTahapanResponse {
  id_mesin_tahapan: number;
  mesin: {
    nama_mesin: string;
  };
}

interface Option {
  value: number;
  label: string;
}

const PostPressTab: React.FC<PostPressTabProps> = ({
  formData,
  onInputChange,
}) => {
  const [ponsOptions, setPonsOptions] = useState<PonsOption[]>([]);
  const [mesinPonsOptions, setMesinPonsOptions] = useState<Option[]>([]);
  const [mesinLipatOptions, setMesinLipatOptions] = useState<Option[]>([]);
  const [ongkosPonsOptions, setOngkosPonsOptions] = useState<
    OngkosPonsOption[]
  >([]);
  const [specialFinishingOptions, setSpecialFinishingOptions] = useState<
    SpecialFinishingOption[]
  >([]);
  const [loadingPons, setLoadingPons] = useState(false);
  const [loadingMesinPons, setLoadingMesinPons] = useState(false);
  const [loadingMesinLipat, setLoadingMesinLipat] = useState(false);
  const [loadingOngkosPons, setLoadingOngkosPons] = useState(false);
  const [loadingSpecialFinishing, setLoadingSpecialFinishing] = useState(false);

  // Function to create synthetic events for updating parent formData
  const createSyntheticEvent = (name: string, value: string) => {
    const syntheticEvent = {
      target: {
        name,
        value,
      },
    } as React.ChangeEvent<HTMLInputElement>;
    onInputChange(syntheticEvent);
  };

  // Get current values from formData with fallbacks
  const getCurrentValue = (fieldName: string, defaultValue: string = '0') => {
    return (formData as any)[fieldName] || defaultValue;
  };

  // Fetch functions remain the same
  const fetchPonsOptions = async () => {
    setLoadingPons(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_LINK}/master/barang`,
        {
          params: {
            kategori: 'POND',
          },
        },
      );

      if (response.data && response.data.data) {
        const ponsData = response.data.data || [];
        setPonsOptions(ponsData);
      }
    } catch (error) {
      console.error('Error fetching pons options:', error);
    } finally {
      setLoadingPons(false);
    }
  };

  const fetchOngkosPonsOptions = async () => {
    setLoadingOngkosPons(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_LINK}/master/barang`,
        {
          params: {
            kategori: 'Ongkos Pons',
          },
        },
      );

      if (response.data && response.data.data) {
        const ongkosPonsData = response.data.data || [];
        setOngkosPonsOptions(ongkosPonsData);
      }
    } catch (error) {
      console.error('Error fetching ongkos pons options:', error);
    } finally {
      setLoadingOngkosPons(false);
    }
  };

  const fetchMesinPons = async () => {
    setLoadingMesinPons(true);
    try {
      const tahapanResponse = await axios.get(
        `${import.meta.env.VITE_API_LINK}/master/tahapan`,
      );

      const pondTahapan = tahapanResponse.data.data.find(
        (tahapan: TahapanResponse) =>
          tahapan.nama_tahapan.toLowerCase().includes('pond'),
      );

      if (pondTahapan) {
        const mesinResponse = await axios.get(
          `${import.meta.env.VITE_API_LINK}/master/tahapanMesin`,
          {
            params: {
              id_tahapan: pondTahapan.id,
            },
          },
        );

        const options: Option[] = mesinResponse.data.data.map(
          (item: MesinTahapanResponse) => ({
            value: item.id_mesin_tahapan,
            label: item.mesin.nama_mesin,
          }),
        );

        setMesinPonsOptions(options);
      }
    } catch (error) {
      console.error('Error fetching mesin pons:', error);
    } finally {
      setLoadingMesinPons(false);
    }
  };

  const fetchSpecialFinishingOptions = async () => {
    setLoadingSpecialFinishing(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_LINK}/master/barang`,
        {
          params: {
            kategori: 'Special Finishing',
          },
        },
      );

      if (response.data && response.data.data) {
        const specialFinishingData = response.data.data || [];
        setSpecialFinishingOptions(specialFinishingData);
      }
    } catch (error) {
      console.error('Error fetching special finishing options:', error);
    } finally {
      setLoadingSpecialFinishing(false);
    }
  };

  const fetchMesinLipat = async () => {
    setLoadingMesinLipat(true);
    try {
      const tahapanResponse = await axios.get(
        `${import.meta.env.VITE_API_LINK}/master/tahapan`,
      );

      const lipatTahapan = tahapanResponse.data.data.find(
        (tahapan: TahapanResponse) =>
          tahapan.nama_tahapan.toLowerCase().includes('lipat'),
      );

      if (lipatTahapan) {
        const mesinResponse = await axios.get(
          `${import.meta.env.VITE_API_LINK}/master/tahapanMesin`,
          {
            params: {
              id_tahapan: lipatTahapan.id,
            },
          },
        );

        const options: Option[] = mesinResponse.data.data.map(
          (item: MesinTahapanResponse) => ({
            value: item.id_mesin_tahapan,
            label: item.mesin.nama_mesin,
          }),
        );

        setMesinLipatOptions(options);
      }
    } catch (error) {
      console.error('Error fetching mesin lipat:', error);
    } finally {
      setLoadingMesinLipat(false);
    }
  };

  useEffect(() => {
    fetchPonsOptions();
    fetchMesinPons();
    fetchOngkosPonsOptions();
    fetchSpecialFinishingOptions();
    fetchMesinLipat();
  }, []);

  // Calculate Ongkos Pons and update formData
  useEffect(() => {
    if (
      getCurrentValue('ongkos_pons') === 'Yes' &&
      ongkosPonsOptions.length > 0
    ) {
      const total_kertasString = formData.total_kertas?.toString() || '0';
      const total_kertas = parseFloat(total_kertasString.replace(/\./g, ''));

      const ukuranCetakBagian1 = parseFloat(
        formData.ukuran_cetak_bagian_1 || '0',
      );
      const ukuranCetakBagian2 = parseFloat(
        formData.ukuran_cetak_bagian_2 || '0',
      );

      const ongkosPonsHarga = ongkosPonsOptions[0]?.harga || 0;

      const hargaSatuan =
        total_kertas *
        (ukuranCetakBagian1 + ukuranCetakBagian2) *
        ongkosPonsHarga;

      const qty = parseFloat(getCurrentValue('ongkos_pons_qty', '1'));
      const total = hargaSatuan * qty;

      // Update formData through synthetic events
      createSyntheticEvent(
        'harga_satuan_ongkos_pons',
        hargaSatuan.toLocaleString('id-ID', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      );

      createSyntheticEvent(
        'total_harga_ongkos_pons',
        total.toLocaleString('id-ID', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      );
    } else {
      createSyntheticEvent('harga_satuan_ongkos_pons', '0.00');
      createSyntheticEvent('total_harga_ongkos_pons', '0.00');
    }
  }, [
    getCurrentValue('ongkos_pons'),
    getCurrentValue('ongkos_pons_qty'),
    formData.total_kertas,
    formData.ukuran_cetak_bagian_1,
    formData.ukuran_cetak_bagian_2,
    ongkosPonsOptions,
  ]);

  // Calculate Lipat price and update formData
  useEffect(() => {
    if (
      getCurrentValue('lipat') === 'Yes' &&
      specialFinishingOptions.length > 0
    ) {
      const lipatOption = specialFinishingOptions.find(
        (option) => option.sub_kategori === 'Lipat',
      );

      if (lipatOption) {
        const qtyKalkulasi = parseFloat(formData.qty_kalkulasi || '0');
        const qtyLipat = parseFloat(getCurrentValue('qty_lipat', '1'));
        const baseHarga = lipatOption.harga * qtyKalkulasi;
        const totalHargaLipat = baseHarga * qtyLipat;

        createSyntheticEvent(
          'harga_lipat',
          totalHargaLipat.toLocaleString('id-ID', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
        );
      }
    } else {
      createSyntheticEvent('harga_lipat', '0.00');
    }
  }, [
    getCurrentValue('lipat'),
    getCurrentValue('qty_lipat'),
    formData.qty_kalkulasi,
    specialFinishingOptions,
  ]);

  // Calculate Potong Jadi price and update formData
  useEffect(() => {
    if (
      getCurrentValue('potong_jadi') === 'Yes' &&
      specialFinishingOptions.length > 0
    ) {
      const potongJadiOption = specialFinishingOptions.find(
        (option) => option.sub_kategori === 'Potong Jadi',
      );

      if (potongJadiOption) {
        const total_kertasString = formData.total_kertas?.toString() || '0';
        const total_kertas = parseFloat(total_kertasString.replace(/\./g, ''));
        const qtyPotong = parseFloat(getCurrentValue('qty_potong', '1'));
        const baseHarga = (total_kertas / 500) * potongJadiOption.harga;
        const totalHargaPotongJadi = baseHarga * qtyPotong;

        createSyntheticEvent(
          'harga_potong_jadi',
          totalHargaPotongJadi.toLocaleString('id-ID', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
        );
      }
    } else {
      createSyntheticEvent('harga_potong_jadi', '0.00');
    }
  }, [
    getCurrentValue('potong_jadi'),
    getCurrentValue('qty_potong'),
    formData.total_kertas,
    specialFinishingOptions,
  ]);

  // Get current formula values for display
  const getFormulaDisplay = () => {
    const total_kertasString = formData.total_kertas?.toString() || '0';
    const total_kertas = parseFloat(total_kertasString.replace(/\./g, ''));

    const ukuranCetakBagian1 = parseFloat(
      formData.ukuran_cetak_bagian_1 || '0',
    );
    const ukuranCetakBagian2 = parseFloat(
      formData.ukuran_cetak_bagian_2 || '0',
    );
    const ongkosPonsHarga = ongkosPonsOptions[0]?.harga || 0;
    const qty = parseFloat(getCurrentValue('ongkos_pons_qty', '1'));

    const qtyKalkulasi = parseFloat(formData.qty_kalkulasi || '0');
    const qtyLipat = parseFloat(getCurrentValue('qty_lipat', '0'));
    const qtyPotong = parseFloat(getCurrentValue('qty_potong', '0'));
    const lipatOption = specialFinishingOptions.find(
      (option) => option.sub_kategori === 'Lipat',
    );
    const potongJadiOption = specialFinishingOptions.find(
      (option) => option.sub_kategori === 'Potong Jadi',
    );

    return {
      total_kertas,
      ukuranCetakBagian1,
      ukuranCetakBagian2,
      ongkosPonsHarga,
      qty,
      qtyKalkulasi,
      qtyLipat,
      qtyPotong,
      lipatHarga: lipatOption?.harga || 0,
      potongJadiHarga: potongJadiOption?.harga || 0,
    };
  };

  const formulaValues = getFormulaDisplay();

  return (
    <div className="space-y-8">
      {/* Pons Information Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-blue-600 mb-6 flex items-center">
          📄 Pons Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Pons Insheet
            </label>
            <input
              type="text"
              name="pons_insheet"
              value={getCurrentValue('pons_insheet')}
              onChange={onInputChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter insheet"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Jenis Pons
            </label>
            <select
              name="id_jenis_pons"
              value={getCurrentValue('id_jenis_pons', '')}
              onChange={onInputChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={loadingPons}
            >
              <option value="">
                {loadingPons ? 'Loading...' : 'Select Pons Type'}
              </option>
              {ponsOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.nama_barang}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Mesin Pons
            </label>
            <select
              name="id_mesin_pons"
              value={getCurrentValue('id_mesin_pons', '')}
              onChange={onInputChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={loadingMesinPons}
            >
              <option value="">
                {loadingMesinPons ? 'Loading...' : 'Select Machine'}
              </option>
              {mesinPonsOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Harga Pisau
            </label>
            <input
              type="number"
              name="harga_pisau"
              value={getCurrentValue('harga_pisau')}
              onChange={onInputChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="0"
              step="0.01"
            />
          </div>
        </div>
      </div>

      {/* Pons Cost Calculation Section */}
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <h2 className="text-xl font-semibold text-gray-900">
            💰 Pons Cost Calculation
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Ongkos Pons
            </label>
            <select
              name="ongkos_pons"
              value={getCurrentValue('ongkos_pons', 'No')}
              onChange={onInputChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Qty Ongkos Pons
            </label>
            <input
              type="number"
              name="ongkos_pons_qty"
              value={getCurrentValue('ongkos_pons_qty', '1')}
              onChange={onInputChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="1"
              step="1"
              min="1"
              disabled={getCurrentValue('ongkos_pons') === 'No'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Harga Satuan Ongkos Pons
            </label>
            <input
              type="text"
              value={getCurrentValue('harga_satuan_ongkos_pons', '0.00')}
              className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50"
              readOnly
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Total Harga Ongkos Pons
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded bg-blue-50">
              <span className="font-semibold text-blue-700">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                }).format(
                  parseFloat(
                    getCurrentValue('total_harga_ongkos_pons', '0.00')
                      .replace(/\./g, '') // remove thousands separator
                      .replace(',', '.'), // fix decimal separator
                  ),
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Formula Display for Ongkos Pons */}
        {getCurrentValue('ongkos_pons') === 'Yes' && (
          <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-900 mb-4">
              Ongkos Pons Formula Calculation:
            </h4>
            <div className="space-y-3 text-sm">
              <div className="font-mono bg-white p-3 rounded-lg border border-blue-100">
                <strong className="text-blue-800">Unit Price =</strong> Total
                Paper × (Print Size Part 1 + Print Size Part 2) × Pons Cost
              </div>
              <div className="font-mono bg-white p-3 rounded-lg border border-blue-100">
                <strong className="text-blue-800">Unit Price =</strong>{' '}
                {formulaValues.total_kertas.toLocaleString('id-ID')} × (
                {formulaValues.ukuranCetakBagian1} +{' '}
                {formulaValues.ukuranCetakBagian2}) ×{' '}
                {formulaValues.ongkosPonsHarga.toLocaleString('id-ID')}
              </div>
              <div className="font-mono bg-white p-3 rounded-lg border border-blue-100">
                <strong className="text-blue-800">Total =</strong> Unit Price ×
                Qty = {getCurrentValue('harga_satuan_ongkos_pons', '0.00')} ×{' '}
                {formulaValues.qty}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lipat Information Section */}
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <h2 className="text-xl font-semibold text-gray-900">
            🔄 Lipat Information
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Lipat
            </label>
            <select
              name="lipat"
              value={getCurrentValue('lipat', 'No')}
              onChange={onInputChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Mesin Lipat
            </label>
            <select
              name="id_mesin_lipat"
              value={getCurrentValue('id_mesin_lipat', '')}
              onChange={onInputChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={loadingMesinLipat || getCurrentValue('lipat') === 'No'}
            >
              <option value="">
                {loadingMesinLipat ? 'Loading...' : 'Select Mesin Lipat'}
              </option>
              {mesinLipatOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Qty Lipat
            </label>
            <input
              type="number"
              name="qty_lipat"
              value={getCurrentValue('qty_lipat', '1')}
              onChange={onInputChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="1"
              step="1"
              min="1"
              disabled={getCurrentValue('lipat') === 'No'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Harga Lipat
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded bg-green-50">
              <span className="font-semibold text-green-700">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 1,
                }).format(
                  parseFloat(
                    getCurrentValue('harga_lipat', '0.00')
                      .replace(/\./g, '') // remove thousands separator
                      .replace(',', '.'), // fix decimal separator
                  ),
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Formula Display for Lipat */}
        {getCurrentValue('lipat') === 'Yes' && (
          <div className="p-6 bg-green-50 rounded-xl border border-green-200">
            <h4 className="text-sm font-semibold text-green-900 mb-4">
              Lipat Formula Calculation:
            </h4>
            <div className="space-y-3 text-sm">
              <div className="font-mono bg-white p-3 rounded-lg border border-green-100">
                <strong className="text-green-800">Harga Lipat =</strong> (Lipat
                Price × Qty Kalkulasi) × Qty Lipat
              </div>
              <div className="font-mono bg-white p-3 rounded-lg border border-green-100">
                <strong className="text-green-800">Harga Lipat =</strong> (
                {formulaValues.lipatHarga.toLocaleString('id-ID')} ×{' '}
                {formulaValues.qtyKalkulasi.toLocaleString('id-ID')}) ×{' '}
                {formulaValues.qtyLipat}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Potong Jadi Section */}
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6.4-6.4l.707-.707a1 1 0 011.414 0l.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Potong Jadi</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Potong Jadi
            </label>
            <select
              name="potong_jadi"
              value={getCurrentValue('potong_jadi', 'No')}
              onChange={onInputChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Qty Potong
            </label>
            <input
              type="number"
              name="qty_potong"
              value={getCurrentValue('qty_potong', '1')}
              onChange={onInputChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="1"
              step="1"
              min="1"
              disabled={getCurrentValue('potong_jadi') === 'No'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Harga Potong Jadi
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded bg-red-50">
              <span className="font-semibold text-red-700">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                }).format(
                  parseFloat(
                    getCurrentValue('harga_potong_jadi', '0.00')
                      .replace(/\./g, '') // remove thousands separator
                      .replace(',', '.'), // fix decimal separator
                  ),
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Formula Display for Potong Jadi */}
        {getCurrentValue('potong_jadi') === 'Yes' && (
          <div className="p-6 bg-red-50 rounded-xl border border-red-200">
            <h4 className="text-sm font-semibold text-red-900 mb-4">
              Potong Jadi Formula Calculation:
            </h4>
            <div className="space-y-3 text-sm">
              <div className="font-mono bg-white p-3 rounded-lg border border-red-100">
                <strong className="text-red-800">Harga Potong Jadi =</strong>{' '}
                ((Total Kertas / 500) × Potong Jadi Price) × Qty Potong
              </div>
              <div className="font-mono bg-white p-3 rounded-lg border border-red-100">
                <strong className="text-red-800">Harga Potong Jadi =</strong> ((
                {formulaValues.total_kertas.toLocaleString('id-ID')} / 500) ×{' '}
                {formulaValues.potongJadiHarga.toLocaleString('id-ID')}) ×{' '}
                {formulaValues.qtyPotong}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostPressTab;
