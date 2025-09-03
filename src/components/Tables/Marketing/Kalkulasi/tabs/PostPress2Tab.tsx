import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { KalkulasiFormData } from '../KalkulasiModal';
import SearchableSelect from '../../../../../pages/MasterData/Marketing/SearchableSelect';

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
  value: string; // Changed from number to string
  label: string;
}

// New interface for packing options
interface PackingOption {
  id: number;
  nama_barang: string;
  harga: number;
}

// Fixed: More specific interface for API responses
interface ApiResponse<T> {
  data: T[];
}

interface TahapanApiResponse {
  data: TahapanResponse[];
}

interface MesinTahapanApiResponse {
  data: MesinTahapanResponse[];
}

const PostPress2Tab: React.FC<PostPressTabProps> = ({
  formData,
  onInputChange,
}) => {
  const [lemOptions, setLemOptions] = useState<LemOption[]>([]);
  const [mesinFinishingOptions, setMesinFinishingOptions] = useState<Option[]>(
    [],
  );
  const [packingOptions, setPackingOptions] = useState<PackingOption[]>([]);
  const [loadingLem, setLoadingLem] = useState<boolean>(false);
  const [loadingMesinFinishing, setLoadingMesinFinishing] =
    useState<boolean>(false);
  const [loadingPacking, setLoadingPacking] = useState<boolean>(false);

  // Function to create synthetic events for updating parent formData
  const createSyntheticEvent = (name: string, value: string): void => {
    const syntheticEvent = {
      target: {
        name,
        value,
      },
    } as React.ChangeEvent<HTMLInputElement>;
    onInputChange(syntheticEvent);
  };

  // Get current values from formData with fallbacks
  const getCurrentValue = (
    fieldName: string,
    defaultValue: string = '',
  ): string => {
    return (formData as any)[fieldName] || defaultValue;
  };

  // Helper functions to handle SearchableSelect changes
  const handleLemChange = (value: number | string) => {
    const syntheticEvent = {
      target: {
        name: 'id_lem',
        value: String(value),
      },
    } as React.ChangeEvent<HTMLSelectElement>;
    onInputChange(syntheticEvent);
  };

  const handleMesinFinishingChange = (value: number | string) => {
    const syntheticEvent = {
      target: {
        name: 'id_mesin_finishing',
        value: String(value),
      },
    } as React.ChangeEvent<HTMLSelectElement>;
    onInputChange(syntheticEvent);
  };

  const handleJenisPackingChange = (value: number | string) => {
    const syntheticEvent = {
      target: {
        name: 'jenis_packing',
        value: String(value),
      },
    } as React.ChangeEvent<HTMLSelectElement>;
    onInputChange(syntheticEvent);
  };

  const handleNamaPackingChange = (value: number | string) => {
    const syntheticEvent = {
      target: {
        name: 'id_packing',
        value: String(value),
      },
    } as React.ChangeEvent<HTMLSelectElement>;
    onInputChange(syntheticEvent);
  };

  const handleFoilChange = (value: number | string) => {
    const syntheticEvent = {
      target: {
        name: 'foil',
        value: String(value),
      },
    } as React.ChangeEvent<HTMLSelectElement>;
    onInputChange(syntheticEvent);
  };

  const handleSpotFoilChange = (value: number | string) => {
    const syntheticEvent = {
      target: {
        name: 'spot_foil',
        value: String(value),
      },
    } as React.ChangeEvent<HTMLSelectElement>;
    onInputChange(syntheticEvent);
  };

  // Helper functions to get selected values for controlled components
  const getSelectedLemValue = (): string => {
    const value = getCurrentValue('id_lem');
    return value ? String(value) : '';
  };

  const getSelectedMesinFinishingValue = (): string => {
    const value = getCurrentValue('id_mesin_finishing');
    return value ? String(value) : '';
  };

  const getSelectedJenisPackingValue = (): string => {
    const value = getCurrentValue('jenis_packing');
    return value ? String(value) : '';
  };

  const getSelectedNamaPackingValue = (): string => {
    const value = getCurrentValue('id_packing');
    return value ? String(value) : '';
  };

  const getSelectedFoilValue = (): string => {
    const value = getCurrentValue('foil', '-');
    return String(value);
  };

  const getSelectedSpotFoilValue = (): string => {
    const value = getCurrentValue('spot_foil', '-');
    return String(value);
  };

  // Format currency input
  const formatCurrency = (value: string): string => {
    const numericValue = value.replace(/[^\d]/g, '');
    if (!numericValue) return '';

    const number = parseInt(numericValue);
    return new Intl.NumberFormat('id-ID').format(number);
  };

  // Parse currency back to numeric value
  const parseCurrency = (value: string): string => {
    return value.replace(/\./g, '');
  };

  const fetchLemOptions = async (): Promise<void> => {
    setLoadingLem(true);
    try {
      const response = await axios.get<ApiResponse<LemOption>>(
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

  const fetchMesinFinishing = async (): Promise<void> => {
    setLoadingMesinFinishing(true);
    try {
      const tahapanResponse = await axios.get<TahapanApiResponse>(
        `${import.meta.env.VITE_API_LINK}/master/tahapan`,
      );

      const finishingTahapan = tahapanResponse.data.data.find(
        (tahapan: TahapanResponse) =>
          tahapan.nama_tahapan.toLowerCase().includes('finishing'),
      );

      if (finishingTahapan) {
        const mesinResponse = await axios.get<MesinTahapanApiResponse>(
          `${import.meta.env.VITE_API_LINK}/master/tahapanMesin`,
          {
            params: {
              id_tahapan: finishingTahapan.id,
            },
          },
        );

        const options: Option[] = mesinResponse.data.data.map(
          (item: MesinTahapanResponse) => ({
            value: String(item.id_mesin_tahapan), // Convert to string
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

  // New function to fetch packing options
  const fetchPackingOptions = async (kategori: string): Promise<void> => {
    if (!kategori) {
      setPackingOptions([]);
      return;
    }

    setLoadingPacking(true);
    try {
      const response = await axios.get<ApiResponse<PackingOption>>(
        `${import.meta.env.VITE_API_LINK}/master/barang`,
        {
          params: {
            kategori: kategori,
          },
        },
      );
      console.log('Packing response:', response.data.data);
      if (response.data && response.data.data) {
        const packingData = response.data.data || [];
        setPackingOptions(packingData);
      }
    } catch (error) {
      console.error('Error fetching packing options:', error);
    } finally {
      setLoadingPacking(false);
    }
  };

  useEffect(() => {
    fetchLemOptions();
    fetchMesinFinishing();
  }, []);

  // Handle jenis_packing changes
  useEffect(() => {
    const jenisPacking = getCurrentValue('jenis_packing');
    if (jenisPacking) {
      fetchPackingOptions(jenisPacking);
    } else {
      setPackingOptions([]);
      // Clear related fields when jenis_packing is cleared
      createSyntheticEvent('id_packing', '');
      createSyntheticEvent('harga_packing', '0');
    }
  }, [getCurrentValue('jenis_packing')]);

  // Calculate harga_packing
  useEffect(() => {
    console.log('Packing calculation triggered');
    console.log('Current id_packing:', getCurrentValue('id_packing'));
    console.log('Available packing options:', packingOptions);

    if (getCurrentValue('id_packing') && packingOptions.length > 0) {
      const selectedPacking = packingOptions.find(
        (option) => String(option.id) === String(getCurrentValue('id_packing')),
      );
      console.log('Found selected packing:', selectedPacking);

      if (selectedPacking) {
        const qtyPacking = parseFloat(getCurrentValue('qty_packing') || '0');
        const hargaPacking = selectedPacking.harga * qtyPacking;

        createSyntheticEvent('harga_packing', hargaPacking.toString());
      }
    } else {
      createSyntheticEvent('harga_packing', '0');
    }
  }, [
    getCurrentValue('id_packing'),
    getCurrentValue('qty_packing'),
    packingOptions,
  ]);

  // Calculate Jumlah Harga Lem and update formData
  useEffect(() => {
    if (getCurrentValue('id_lem') && lemOptions.length > 0) {
      const selectedLem = lemOptions.find(
        (option) => String(option.id) === String(getCurrentValue('id_lem')),
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
    getCurrentValue('id_lem'),
    formData.ukuran_jadi_tinggi,
    formData.qty_kalkulasi,
    lemOptions,
  ]);

  // Calculate No Packaging and update formData
  useEffect(() => {
    const panjangPackaging = parseFloat(
      getCurrentValue('panjang_packaging') || '0',
    );
    const lebarPackaging = parseFloat(
      getCurrentValue('lebar_packaging') || '0',
    );
    const qtyKalkulasi = parseFloat(formData.qty_kalkulasi || '0');

    if (panjangPackaging > 0 && lebarPackaging > 0) {
      const noPackaging =
        qtyKalkulasi / (36000 / (panjangPackaging * lebarPackaging * 0.003));

      createSyntheticEvent('no_packaging', noPackaging.toFixed(2));
    } else {
      createSyntheticEvent('no_packaging', '0.00');
    }
  }, [
    getCurrentValue('panjang_packaging'),
    getCurrentValue('lebar_packaging'),
    formData.qty_kalkulasi,
  ]);

  // Calculate Harga Packaging and update formData
  useEffect(() => {
    const noPackaging = parseFloat(getCurrentValue('no_packaging') || '0');
    const hargaPackaging = noPackaging * 1000;

    createSyntheticEvent('harga_packaging', hargaPackaging.toString());
  }, [getCurrentValue('no_packaging')]);

  // Calculate Harga Pengiriman automatically and update formData
  useEffect(() => {
    const hargaPengirimanAwal = parseFloat(
      formData.harga_pengiriman_awal || '0',
    );
    const jumlahKirim = parseFloat(getCurrentValue('jumlah_kirim') || '0');

    if (hargaPengirimanAwal > 0 && jumlahKirim > 0) {
      const hargaPengiriman = hargaPengirimanAwal * jumlahKirim;
      createSyntheticEvent('harga_pengiriman', hargaPengiriman.toString());
    } else {
      createSyntheticEvent('harga_pengiriman', '0');
    }
  }, [formData.harga_pengiriman_awal, getCurrentValue('jumlah_kirim')]);

  const handlePostPressInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ): void => {
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
      (option) => String(option.id) === String(getCurrentValue('id_lem')),
    );
    const qtyKalkulasi = parseFloat(formData.qty_kalkulasi || '0');

    return {
      ukuranJadiTinggiCm,
      lemHarga: selectedLem?.harga || 0,
      qtyKalkulasi,
    };
  };

  // Get packaging formula values for display
  const getPackagingFormulaDisplay = () => {
    const panjangPackaging = parseFloat(
      getCurrentValue('panjang_packaging') || '0',
    );
    const lebarPackaging = parseFloat(
      getCurrentValue('lebar_packaging') || '0',
    );
    const qtyKalkulasi = parseFloat(formData.qty_kalkulasi || '0');
    const noPackaging = parseFloat(getCurrentValue('no_packaging') || '0');
    const jumlahKirim = parseFloat(getCurrentValue('jumlah_kirim') || '0');
    const hargaPengirimanAwal = parseFloat(
      formData.harga_pengiriman_awal || '0',
    );

    return {
      panjangPackaging,
      lebarPackaging,
      qtyKalkulasi,
      noPackaging,
      jumlahKirim,
      hargaPengirimanAwal,
    };
  };

  // Get packing formula values for display
  const getPackingFormulaDisplay = () => {
    const selectedPacking = packingOptions.find(
      (option) => String(option.id) === String(getCurrentValue('id_packing')),
    );
    const qtyPacking = parseFloat(getCurrentValue('qty_packing') || '0');

    return {
      packingHarga: selectedPacking?.harga || 0,
      qtyPacking,
    };
  };

  // Format currency values for display in manual price inputs
  const getFormattedCurrencyValue = (fieldName: string): string => {
    const value = getCurrentValue(fieldName);
    if (!value) return '';
    return formatCurrency(value);
  };

  // Transform data for SearchableSelect options
  const getLemSearchableOptions = () => {
    return lemOptions.map((option) => ({
      value: String(option.id), // Convert to string
      label: option.nama_barang,
    }));
  };

  const getPackingSearchableOptions = () => {
    return packingOptions.map((option) => ({
      value: String(option.id), // Convert to string
      label: option.nama_barang,
    }));
  };

  const getFoilOptions = () => [
    { value: '-', label: '-' },
    { value: 'emas', label: 'Emas' },
    { value: 'silver', label: 'Silver' },
    { value: 'tembaga', label: 'Tembaga' },
  ];

  const getJenisPackingOptions = () => [
    { value: '-', label: '-' },
    { value: 'CORRUGATED', label: 'Corrugated' },
    { value: 'CASSING', label: 'Cassing' },
  ];

  const formulaValues = getFormulaDisplay();
  const packagingFormulaValues = getPackagingFormulaDisplay();
  const packingFormulaValues = getPackingFormulaDisplay();

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

          {/* Lem Dropdown - Changed to SearchableSelect */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Lem
            </label>
            <SearchableSelect
              options={getLemSearchableOptions()}
              value={getSelectedLemValue()}
              onChange={handleLemChange}
              placeholder={loadingLem ? 'Loading...' : 'Select Lem'}
              className="w-full"
            />
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

          {/* Mesin Finishing - Changed to SearchableSelect */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Mesin Finishing
            </label>
            <SearchableSelect
              options={mesinFinishingOptions}
              value={getSelectedMesinFinishingValue()}
              onChange={handleMesinFinishingChange}
              placeholder={
                loadingMesinFinishing ? 'Loading...' : 'Select Mesin Finishing'
              }
              className="w-full"
            />
          </div>
        </div>

        {/* Formula Display for Lem */}
        {getCurrentValue('id_lem') && (
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

      {/* Harga Foil Section */}
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <h2 className="text-xl font-semibold text-gray-900">💰 Harga Foil</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Foil Dropdown - Changed to SearchableSelect */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Foil
            </label>
            <SearchableSelect
              options={getFoilOptions()}
              value={getSelectedFoilValue()}
              onChange={handleFoilChange}
              placeholder="Select Foil"
              className="w-full"
            />
          </div>

          {/* Spot Foil Dropdown - Changed to SearchableSelect */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Spot Foil
            </label>
            <SearchableSelect
              options={getFoilOptions()}
              value={getSelectedSpotFoilValue()}
              onChange={handleSpotFoilChange}
              placeholder="Select Spot Foil"
              className="w-full"
            />
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

      {/* New Packing Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-orange-600 mb-6 flex items-center">
          📋 Packing
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Jenis Packing - Changed to SearchableSelect */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Jenis Packing
            </label>
            <SearchableSelect
              options={getJenisPackingOptions()}
              value={getSelectedJenisPackingValue()}
              onChange={handleJenisPackingChange}
              placeholder="Select Jenis Packing"
              className="w-full"
            />
          </div>

          {/* Nama Packing - Changed to SearchableSelect */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Nama Packing
            </label>
            <SearchableSelect
              options={getPackingSearchableOptions()}
              value={getSelectedNamaPackingValue()}
              onChange={handleNamaPackingChange}
              placeholder={
                loadingPacking
                  ? 'Loading...'
                  : getCurrentValue('jenis_packing')
                  ? 'Select Nama Packing'
                  : 'Select Jenis Packing first'
              }
              className="w-full"
            />
          </div>

          {/* QTY Packing */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              QTY Packing
            </label>
            <input
              type="number"
              name="qty_packing"
              value={getCurrentValue('qty_packing')}
              onChange={handlePostPressInputChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder="1"
              min="0"
              step="0.01"
            />
          </div>

          {/* Harga Packing - Auto Calculated */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Harga Packing
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded bg-orange-50">
              <span className="font-semibold text-orange-700">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                }).format(parseFloat(getCurrentValue('harga_packing', '0')))}
              </span>
            </div>
          </div>
        </div>

        {/* Formula Display for Packing */}
        {getCurrentValue('id_packing') && (
          <div className="p-6 bg-orange-50 rounded-xl border border-orange-200">
            <h4 className="text-sm font-semibold text-orange-900 mb-4">
              Packing Formula Calculation:
            </h4>
            <div className="space-y-3 text-sm">
              <div className="font-mono bg-white p-3 rounded-lg border border-orange-100">
                <strong className="text-orange-800">Harga Packing =</strong>{' '}
                Packing Price × QTY Packing
              </div>
              <div className="font-mono bg-white p-3 rounded-lg border border-orange-100">
                <strong className="text-orange-800">Harga Packing =</strong>{' '}
                {packingFormulaValues.packingHarga.toLocaleString('id-ID')} ×{' '}
                {packingFormulaValues.qtyPacking}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Packaging Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-green-600 mb-6 flex items-center">
          📦 Packaging
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Panjang MM */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Panjang mm
            </label>
            <input
              type="number"
              name="panjang_packaging"
              value={getCurrentValue('panjang_packaging')}
              onChange={handlePostPressInputChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              placeholder="100"
            />
          </div>
          {/* Lebar MM */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Lebar mm
            </label>
            <input
              type="number"
              name="lebar_packaging"
              value={getCurrentValue('lebar_packaging')}
              onChange={handlePostPressInputChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              placeholder="200"
            />
          </div>

          {/* No Packaging - Auto Calculated */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              No Packaging
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded bg-green-50">
              <span className="font-semibold text-green-700">
                {parseFloat(getCurrentValue('no_packaging', '0.00')).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Jumlah Kirim */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Jumlah Kirim
            </label>
            <input
              type="number"
              name="jumlah_kirim"
              value={getCurrentValue('jumlah_kirim')}
              onChange={handlePostPressInputChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              placeholder="1"
            />
          </div>

          {/* Harga Packaging - Auto Calculated */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Harga Packaging
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded bg-green-50">
              <span className="font-semibold text-green-700">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                }).format(parseFloat(getCurrentValue('harga_packaging', '0')))}
              </span>
            </div>
          </div>

          {/* Harga Pengiriman - Auto Calculated (CHANGED) */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Harga Pengiriman
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded bg-green-50">
              <span className="font-semibold text-green-700">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                }).format(parseFloat(getCurrentValue('harga_pengiriman', '0')))}
              </span>
            </div>
          </div>
        </div>

        {/* Formula Display for Packaging */}
        {(getCurrentValue('panjang_packaging') ||
          getCurrentValue('lebar_packaging')) && (
          <div className="p-6 bg-green-50 rounded-xl border border-green-200">
            <h4 className="text-sm font-semibold text-green-900 mb-4">
              Packaging Formula Calculations:
            </h4>
            <div className="space-y-3 text-sm">
              <div className="font-mono bg-white p-3 rounded-lg border border-green-100">
                <strong className="text-green-800">No Packaging =</strong>{' '}
                qty_kalkulasi / (36000 / ((panjang_packaging × lebar_packaging)
                × 0.003))
              </div>
              <div className="font-mono bg-white p-3 rounded-lg border border-green-100">
                <strong className="text-green-800">No Packaging =</strong>{' '}
                {packagingFormulaValues.qtyKalkulasi} / (36000 / ((
                {packagingFormulaValues.panjangPackaging} ×{' '}
                {packagingFormulaValues.lebarPackaging}) × 0.003))
              </div>
              <div className="font-mono bg-white p-3 rounded-lg border border-green-100">
                <strong className="text-green-800">Harga Packaging =</strong> No
                Packaging × 1000 ={' '}
                {packagingFormulaValues.noPackaging.toFixed(2)} × 1000
              </div>
              {packagingFormulaValues.hargaPengirimanAwal > 0 &&
                packagingFormulaValues.jumlahKirim > 0 && (
                  <div className="font-mono bg-white p-3 rounded-lg border border-green-100">
                    <strong className="text-green-800">
                      Harga Pengiriman =
                    </strong>{' '}
                    Harga Pengiriman Awal × Jumlah Kirim ={' '}
                    {packagingFormulaValues.hargaPengirimanAwal.toLocaleString(
                      'id-ID',
                    )}{' '}
                    × {packagingFormulaValues.jumlahKirim}
                  </div>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostPress2Tab;
