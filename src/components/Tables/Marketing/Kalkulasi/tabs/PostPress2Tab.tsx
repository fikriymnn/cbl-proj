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

interface LemOption {
  id: number;
  nama_barang: string;
  harga: number;
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

const PostPress2Tab: React.FC<PostPressTabProps> = ({
  formData,
  onInputChange,
}) => {
  const [lemOptions, setLemOptions] = useState<LemOption[]>([]);
  const [mesinFinishingOptions, setMesinFinishingOptions] = useState<Option[]>(
    [],
  );
  const [loadingLem, setLoadingLem] = useState(false);
  const [loadingMesinFinishing, setLoadingMesinFinishing] = useState(false);

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
  const getCurrentValue = (fieldName: string, defaultValue: string = '') => {
    return (formData as any)[fieldName] || defaultValue;
  };

  // Format currency input
  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, '');
    if (!numericValue) return '';

    const number = parseInt(numericValue);
    return new Intl.NumberFormat('id-ID').format(number);
  };

  // Parse currency back to numeric value
  const parseCurrency = (value: string) => {
    return value.replace(/\./g, '');
  };

  const fetchLemOptions = async () => {
    setLoadingLem(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_LINK}/master/barang`,
        {
          params: {
            kategori: 'LEM',
          },
        },
      );

      if (response.data && response.data.data) {
        const lemData = response.data.data || [];
        setLemOptions(lemData);
      }
    } catch (error) {
      console.error('Error fetching lem options:', error);
    } finally {
      setLoadingLem(false);
    }
  };

  const fetchMesinFinishing = async () => {
    setLoadingMesinFinishing(true);
    try {
      const tahapanResponse = await axios.get(
        `${import.meta.env.VITE_API_LINK}/master/tahapan`,
      );

      const finishingTahapan = tahapanResponse.data.data.find(
        (tahapan: TahapanResponse) =>
          tahapan.nama_tahapan.toLowerCase().includes('finishing'),
      );

      if (finishingTahapan) {
        const mesinResponse = await axios.get(
          `${import.meta.env.VITE_API_LINK}/master/tahapanMesin`,
          {
            params: {
              id_tahapan: finishingTahapan.id,
            },
          },
        );

        const options: Option[] = mesinResponse.data.data.map(
          (item: MesinTahapanResponse) => ({
            value: item.id_mesin_tahapan,
            label: item.mesin.nama_mesin,
          }),
        );

        setMesinFinishingOptions(options);
      }
    } catch (error) {
      console.error('Error fetching mesin finishing:', error);
    } finally {
      setLoadingMesinFinishing(false);
    }
  };

  useEffect(() => {
    fetchLemOptions();
    fetchMesinFinishing();
  }, []);

  // Calculate Jumlah Harga Lem and update formData
  useEffect(() => {
    if (getCurrentValue('id_lem') && lemOptions.length > 0) {
      // Changed from 'lem' to 'id_lem'
      const selectedLem = lemOptions.find(
        (option) => option.id.toString() === getCurrentValue('id_lem'), // Changed from 'lem' to 'id_lem'
      );

      if (selectedLem) {
        // Convert mm to cm
        const ukuranJadiTinggiCm =
          parseFloat(formData.ukuran_jadi_tinggi || '0') / 10;
        const qtyKalkulasi = parseFloat(formData.qty_kalkulasi || '0');

        const jumlahHargaLem =
          ukuranJadiTinggiCm * selectedLem.harga * qtyKalkulasi;

        // Update formData through synthetic event
        createSyntheticEvent(
          'jumlah_harga_lem',
          jumlahHargaLem.toLocaleString('id-ID', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
        );
      }
    } else {
      createSyntheticEvent('jumlah_harga_lem', '0.00');
    }
  }, [
    getCurrentValue('id_lem'), // Changed from 'lem' to 'id_lem'
    formData.ukuran_jadi_tinggi,
    formData.qty_kalkulasi,
    lemOptions,
  ]);

  const handlePostPressInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    // Handle currency formatting for manual price inputs
    if (
      name === 'harga_foil_manual' ||
      name === 'harga_spot_foil_manual' ||
      name === 'harga_polimer_manual'
    ) {
      const formattedValue = formatCurrency(value);
      const unformattedValue = parseCurrency(value);

      // Send unformatted value to parent
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          name,
          value: unformattedValue,
        },
      } as React.ChangeEvent<HTMLInputElement>;

      onInputChange(syntheticEvent);
      return;
    }

    // For all other fields, pass directly to parent
    onInputChange(e);
  };

  // Get current formula values for display
  const getFormulaDisplay = () => {
    const ukuranJadiTinggiCm =
      parseFloat(formData.ukuran_jadi_tinggi || '0') / 10;
    const selectedLem = lemOptions.find(
      (option) => option.id.toString() === getCurrentValue('id_lem'), // Changed from 'lem' to 'id_lem'
    );
    const qtyKalkulasi = parseFloat(formData.qty_kalkulasi || '0');

    return {
      ukuranJadiTinggiCm,
      lemHarga: selectedLem?.harga || 0,
      qtyKalkulasi,
    };
  };

  // Format currency values for display in manual price inputs
  const getFormattedCurrencyValue = (fieldName: string) => {
    const value = getCurrentValue(fieldName);
    if (!value) return '';
    return formatCurrency(value);
  };

  const formulaValues = getFormulaDisplay();

  return (
    <div className="space-y-8">
      {/* Finishing Insheet Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-blue-600 mb-6 flex items-center">
          📦 Finishing
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Finishing Insheet - Free Text */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Finishing Insheet
            </label>
            <input
              type="text"
              name="finishing_insheet"
              value={getCurrentValue('finishing_insheet')}
              onChange={handlePostPressInputChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter finishing insheet"
            />
          </div>

          {/* Lem Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Lem
            </label>
            <select
              name="id_lem" // Changed from "lem" to "id_lem"
              value={getCurrentValue('id_lem')}
              onChange={handlePostPressInputChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={loadingLem}
            >
              <option value="">
                {loadingLem ? 'Loading...' : 'Select Lem'}
              </option>
              {lemOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.nama_barang}
                </option>
              ))}
            </select>
          </div>

          {/* Jumlah Harga Lem - Auto Calculated */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Jumlah Harga Lem
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded bg-purple-50">
              <span className="font-semibold text-purple-700">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                }).format(
                  parseFloat(
                    getCurrentValue('jumlah_harga_lem', '0.00')
                      .replace(/\./g, '')
                      .replace(',', '.'),
                  ),
                )}
              </span>
            </div>
          </div>

          {/* Mesin Finishing */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Mesin Finishing
            </label>
            <select
              name="id_mesin_finishing" // Already correct
              value={getCurrentValue('id_mesin_finishing')}
              onChange={handlePostPressInputChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={loadingMesinFinishing}
            >
              <option value="">
                {loadingMesinFinishing
                  ? 'Loading...'
                  : 'Select Mesin Finishing'}
              </option>
              {mesinFinishingOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Formula Display for Lem */}
        {getCurrentValue('id_lem') && ( // Changed from 'lem' to 'id_lem'
          <div className="p-6 bg-purple-50 rounded-xl border border-purple-200">
            <h4 className="text-sm font-semibold text-purple-900 mb-4">
              Lem Formula Calculation:
            </h4>
            <div className="space-y-3 text-sm">
              <div className="font-mono bg-white p-3 rounded-lg border border-purple-100">
                <strong className="text-purple-800">Jumlah Harga Lem =</strong>{' '}
                (Ukuran Jadi Tinggi in CM × Lem Price × Qty Kalkulasi)
              </div>
              <div className="font-mono bg-white p-3 rounded-lg border border-purple-100">
                <strong className="text-purple-800">Jumlah Harga Lem =</strong>{' '}
                ({formulaValues.ukuranJadiTinggiCm} cm ×{' '}
                {formulaValues.lemHarga.toLocaleString('id-ID')} ×{' '}
                {formulaValues.qtyKalkulasi.toLocaleString('id-ID')})
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Third Row - Manual Price Inputs */}
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <h2 className="text-xl font-semibold text-gray-900">💰 Harga Foil</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Foil Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Foil
            </label>
            <select
              name="foil"
              value={getCurrentValue('foil', 'emas')}
              onChange={handlePostPressInputChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="emas">Emas</option>
              <option value="silver">Silver</option>
              <option value="tembaga">Tembaga</option>
            </select>
          </div>

          {/* Spot Foil Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Spot Foil
            </label>
            <select
              name="spot_foil"
              value={getCurrentValue('spot_foil', 'emas')}
              onChange={handlePostPressInputChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="emas">Emas</option>
              <option value="silver">Silver</option>
              <option value="tembaga">Tembaga</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Harga Foil Manual */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Harga Foil Manual
            </label>
            <input
              type="text"
              name="harga_foil_manual"
              value={getFormattedCurrencyValue('harga_foil_manual')}
              onChange={handlePostPressInputChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="0"
            />
          </div>

          {/* Harga Spot Foil Manual */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Harga Spot Foil Manual
            </label>
            <input
              type="text"
              name="harga_spot_foil_manual"
              value={getFormattedCurrencyValue('harga_spot_foil_manual')}
              onChange={handlePostPressInputChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="0"
            />
          </div>

          {/* Harga Polimer Manual */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Harga Polimer Manual
            </label>
            <input
              type="text"
              name="harga_polimer_manual"
              value={getFormattedCurrencyValue('harga_polimer_manual')}
              onChange={handlePostPressInputChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="0"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostPress2Tab;
