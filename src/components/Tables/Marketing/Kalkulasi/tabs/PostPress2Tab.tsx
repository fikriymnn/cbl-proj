import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { KalkulasiFormData } from '../types/kalkulasi';
import SearchableSelect from '../../../../../pages/MasterData/Marketing/SearchableSelect';

interface PostPressTabProps {
  formData: KalkulasiFormData;
  onInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  isReadOnly?: boolean;
  copyType?: 'repeat' | 'repeat_perubahan';
}

interface LemOption {
  id: number;
  nama_barang: string;
  harga: number;
  batas_harga?: number;
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
  value: string;
  label: string;
}

interface PackingOption {
  id: number;
  nama_barang: string;
  harga: number;
}

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
  isReadOnly = false,
  copyType,
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

  // Selected values state
  const [selectedLem, setSelectedLem] = useState<string>('');
  const [selectedMesinFinishing, setSelectedMesinFinishing] =
    useState<string>('');
  const [selectedJenisPacking, setSelectedJenisPacking] = useState<string>('');
  const [selectedNamaPacking, setSelectedNamaPacking] = useState<string>('');
  const [selectedFoil, setSelectedFoil] = useState<string>('');
  const [selectedSpotFoil, setSelectedSpotFoil] = useState<string>('');

  // Determine if component should be read-only
  const isComponentReadOnly = isReadOnly;

  const getInputClassName = (baseClassName: string) => {
    return isComponentReadOnly
      ? `${baseClassName} bg-gray-100 cursor-not-allowed`
      : baseClassName;
  };

  const getSectionHeaderColor = () => {
    if (copyType === 'repeat') return 'text-blue-600';
    if (copyType === 'repeat_perubahan') return 'text-green-600';
    return 'text-blue-600';
  };

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
    return (formData as any)[fieldName]?.toString() || defaultValue;
  };

  // Helper functions to handle SearchableSelect changes
  const handleLemChange = (value: number | string) => {
    if (isComponentReadOnly) return;

    setSelectedLem(String(value));
    const syntheticEvent = {
      target: {
        name: 'id_lem',
        value: String(value),
      },
    } as React.ChangeEvent<HTMLSelectElement>;
    onInputChange(syntheticEvent);
  };

  const handleMesinFinishingChange = (value: number | string) => {
    if (isComponentReadOnly) return;

    setSelectedMesinFinishing(String(value));
    const syntheticEvent = {
      target: {
        name: 'id_mesin_finishing',
        value: String(value),
      },
    } as React.ChangeEvent<HTMLSelectElement>;
    onInputChange(syntheticEvent);
  };

  const handleJenisPackingChange = (value: number | string) => {
    if (isComponentReadOnly) return;

    setSelectedJenisPacking(String(value));
    const syntheticEvent = {
      target: {
        name: 'jenis_packing',
        value: String(value),
      },
    } as React.ChangeEvent<HTMLSelectElement>;
    onInputChange(syntheticEvent);
  };

  const handleNamaPackingChange = (value: number | string) => {
    if (isComponentReadOnly) return;

    setSelectedNamaPacking(String(value));
    const syntheticEvent = {
      target: {
        name: 'id_packing',
        value: String(value),
      },
    } as React.ChangeEvent<HTMLSelectElement>;
    onInputChange(syntheticEvent);
  };

  const handleFoilChange = (value: number | string) => {
    if (isComponentReadOnly) return;

    setSelectedFoil(String(value));
    const syntheticEvent = {
      target: {
        name: 'foil',
        value: String(value),
      },
    } as React.ChangeEvent<HTMLSelectElement>;
    onInputChange(syntheticEvent);
  };

  const handleSpotFoilChange = (value: number | string) => {
    if (isComponentReadOnly) return;

    setSelectedSpotFoil(String(value));
    const syntheticEvent = {
      target: {
        name: 'spot_foil',
        value: String(value),
      },
    } as React.ChangeEvent<HTMLSelectElement>;
    onInputChange(syntheticEvent);
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
      console.log(response.data);
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
            value: String(item.id_mesin_tahapan),
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

  // Fetch initial data
  useEffect(() => {
    fetchLemOptions();
    fetchMesinFinishing();
  }, []);

  // Initialize selected values from formData when component mounts or data loads
  useEffect(() => {
    if (formData.id_lem) {
      setSelectedLem(String(formData.id_lem));
    }
    if (formData.id_mesin_finishing) {
      setSelectedMesinFinishing(String(formData.id_mesin_finishing));
    }
    if (formData.jenis_packing) {
      setSelectedJenisPacking(formData.jenis_packing);
    }
    if (formData.id_packing) {
      setSelectedNamaPacking(String(formData.id_packing));
    }
    if (formData.foil) {
      setSelectedFoil(formData.foil);
    }
    if (formData.spot_foil) {
      setSelectedSpotFoil(formData.spot_foil);
    }
  }, [
    formData.id_lem,
    formData.id_mesin_finishing,
    formData.jenis_packing,
    formData.id_packing,
    formData.foil,
    formData.spot_foil,
  ]);

  // Handle jenis_packing changes
  useEffect(() => {
    const jenisPacking = getCurrentValue('jenis_packing');
    if (jenisPacking && jenisPacking !== '-') {
      fetchPackingOptions(jenisPacking);
    } else {
      setPackingOptions([]);
      if (!isComponentReadOnly) {
        createSyntheticEvent('id_packing', '');
        createSyntheticEvent('harga_packing', '0');
      }
    }
  }, [formData.jenis_packing]);

  // Calculate harga_packing
  useEffect(() => {
    if (isComponentReadOnly) return;

    const idPacking = getCurrentValue('id_packing');
    if (idPacking && packingOptions.length > 0) {
      const selectedPacking = packingOptions.find(
        (option) => String(option.id) === String(idPacking),
      );

      if (selectedPacking) {
        const qtyPacking = parseFloat(getCurrentValue('qty_packing') || '0');
        const hargaPacking = selectedPacking.harga * qtyPacking;
        createSyntheticEvent('harga_packing', hargaPacking.toString());
      }
    } else if (!idPacking) {
      createSyntheticEvent('harga_packing', '0');
    }
  }, [
    formData.id_packing,
    formData.qty_packing,
    packingOptions,
    isComponentReadOnly,
  ]);

  // Calculate Jumlah Harga Lem and update formData
  useEffect(() => {
    if (isComponentReadOnly) return;

    const idLem = getCurrentValue('id_lem');
    if (idLem && lemOptions.length > 0) {
      const selectedLem = lemOptions.find(
        (option) => String(option.id) === String(idLem),
      );

      if (selectedLem) {
        const qtyKalkulasi = parseFloat(formData.qty_kalkulasi || '0');
        const ukuranJadiTinggiMM = parseFloat(
          formData.ukuran_jadi_tinggi || '0',
        );
        let jumlahHargaLem = 0;

        // Different formula based on nama_barang
        if (selectedLem.nama_barang === 'LEM SAMPING') {
          // Formula: ukuran_jadi_tinggi × harga × qty_kalkulasi
          jumlahHargaLem =
            ukuranJadiTinggiMM * selectedLem.harga * qtyKalkulasi;
        } else if (selectedLem.nama_barang === 'LEM SAMPING + LOCK BOTTOM') {
          const batasHarga = selectedLem.batas_harga || 0;
          jumlahHargaLem =
            (selectedLem.harga * ukuranJadiTinggiMM + batasHarga) *
            qtyKalkulasi;
        } else {
          // Default formula (original): harga × qty_kalkulasi
          jumlahHargaLem = selectedLem.harga * qtyKalkulasi;
        }

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
    formData.id_lem,
    formData.ukuran_jadi_tinggi,
    formData.qty_kalkulasi,
    lemOptions,
    isComponentReadOnly,
  ]);

  // Calculate No Packaging and update formData
  useEffect(() => {
    if (isComponentReadOnly) return;

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
    formData.panjang_packaging,
    formData.lebar_packaging,
    formData.qty_kalkulasi,
    isComponentReadOnly,
  ]);

  // Calculate Harga Packaging and update formData
  useEffect(() => {
    if (isComponentReadOnly) return;

    const noPackaging = parseFloat(getCurrentValue('no_packaging') || '0');
    const hargaPackaging = noPackaging * 1000;
    createSyntheticEvent('harga_packaging', hargaPackaging.toString());
  }, [formData.no_packaging, isComponentReadOnly]);

  // Calculate Harga Pengiriman automatically and update formData
  useEffect(() => {
    if (isComponentReadOnly) return;

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
  }, [
    formData.harga_pengiriman_awal,
    formData.jumlah_kirim,
    isComponentReadOnly,
  ]);

  const handlePostPressInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ): void => {
    if (isComponentReadOnly) return;

    const { name, value } = e.target;

    // Handle currency formatting for manual price inputs
    if (
      name === 'harga_foil_manual' ||
      name === 'harga_spot_foil_manual' ||
      name === 'harga_polimer_manual'
    ) {
      const unformattedValue = parseCurrency(value);
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

    onInputChange(e);
  };

  // Get current formula values for display
  const getFormulaDisplay = () => {
    const ukuranJadiTinggiMM = parseFloat(formData.ukuran_jadi_tinggi || '0');
    const selectedLem = lemOptions.find(
      (option) => String(option.id) === String(getCurrentValue('id_lem')),
    );
    const qtyKalkulasi = parseFloat(formData.qty_kalkulasi || '0');

    return {
      ukuranJadiTinggiMM,
      lemHarga: selectedLem?.harga || 0,
      lemBatasHarga: selectedLem?.batas_harga || 0,
      lemNamaBarang: selectedLem?.nama_barang || '',
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
    if (!value || value === '0') return '';
    return formatCurrency(value);
  };

  // Transform data for SearchableSelect options
  const getLemSearchableOptions = () => {
    return lemOptions.map((option) => ({
      value: String(option.id),
      label: option.nama_barang,
    }));
  };

  const getPackingSearchableOptions = () => {
    return packingOptions.map((option) => ({
      value: String(option.id),
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
        <h3
          className={`text-lg font-semibold mb-6 flex items-center ${getSectionHeaderColor()}`}
        >
          📦 Finishing
          {isComponentReadOnly && (
            <span className="ml-2 text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded">
              View Only
            </span>
          )}
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
              className={getInputClassName(
                'w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all',
              )}
              placeholder="Enter finishing insheet"
              readOnly={isComponentReadOnly}
            />
          </div>

          {/* Lem Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Lem
            </label>
            <SearchableSelect
              options={getLemSearchableOptions()}
              value={selectedLem}
              onChange={handleLemChange}
              placeholder={loadingLem ? 'Loading...' : 'Select Lem'}
              className="w-full"
              disabled={isComponentReadOnly}
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

          {/* Mesin Finishing */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Mesin Finishing
            </label>
            <SearchableSelect
              options={mesinFinishingOptions}
              value={selectedMesinFinishing}
              onChange={handleMesinFinishingChange}
              placeholder={
                loadingMesinFinishing ? 'Loading...' : 'Select Mesin Finishing'
              }
              className="w-full"
              disabled={isComponentReadOnly}
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
              {formulaValues.lemNamaBarang === 'LEM SAMPING' ? (
                <>
                  <div className="font-mono bg-white p-3 rounded-lg border border-purple-100">
                    <strong className="text-purple-800">
                      Jumlah Harga Lem =
                    </strong>{' '}
                    Ukuran Jadi Tinggi (MM) × Lem Price × Qty Kalkulasi
                  </div>
                  <div className="font-mono bg-white p-3 rounded-lg border border-purple-100">
                    <strong className="text-purple-800">
                      Jumlah Harga Lem =
                    </strong>{' '}
                    {formulaValues.ukuranJadiTinggiMM.toLocaleString('id-ID')} ×{' '}
                    {formulaValues.lemHarga.toLocaleString('id-ID')} ×{' '}
                    {formulaValues.qtyKalkulasi.toLocaleString('id-ID')}
                  </div>
                </>
              ) : formulaValues.lemNamaBarang ===
                'LEM SAMPING + LOCK BOTTOM' ? (
                <>
                  <div className="font-mono bg-white p-3 rounded-lg border border-purple-100">
                    <strong className="text-purple-800">
                      Jumlah Harga Lem =
                    </strong>{' '}
                    (Lem Price × Ukuran Jadi Tinggi + Batas Harga) × Qty
                    Kalkulasi
                  </div>
                  <div className="font-mono bg-white p-3 rounded-lg border border-purple-100">
                    <strong className="text-purple-800">
                      Jumlah Harga Lem =
                    </strong>{' '}
                    ({formulaValues.lemHarga.toLocaleString('id-ID')} ×{' '}
                    {formulaValues.ukuranJadiTinggiMM.toLocaleString('id-ID')} +{' '}
                    {formulaValues.lemBatasHarga.toLocaleString('id-ID')}) ×{' '}
                    {formulaValues.qtyKalkulasi.toLocaleString('id-ID')}
                  </div>
                </>
              ) : (
                <>
                  <div className="font-mono bg-white p-3 rounded-lg border border-purple-100">
                    <strong className="text-purple-800">
                      Jumlah Harga Lem =
                    </strong>{' '}
                    Lem Price × Qty Kalkulasi
                  </div>
                  <div className="font-mono bg-white p-3 rounded-lg border border-purple-100">
                    <strong className="text-purple-800">
                      Jumlah Harga Lem =
                    </strong>{' '}
                    {formulaValues.lemHarga.toLocaleString('id-ID')} ×{' '}
                    {formulaValues.qtyKalkulasi.toLocaleString('id-ID')}
                  </div>
                </>
              )}
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
          {/* Foil Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Foil
            </label>
            <SearchableSelect
              options={getFoilOptions()}
              value={selectedFoil || '-'}
              onChange={handleFoilChange}
              placeholder="Select Foil"
              className="w-full"
              disabled={isComponentReadOnly}
            />
          </div>

          {/* Spot Foil Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Spot Foil
            </label>
            <SearchableSelect
              options={getFoilOptions()}
              value={selectedSpotFoil || '-'}
              onChange={handleSpotFoilChange}
              placeholder="Select Spot Foil"
              className="w-full"
              disabled={isComponentReadOnly}
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
              className={getInputClassName(
                'w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all',
              )}
              placeholder="0"
              readOnly={isComponentReadOnly}
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
              className={getInputClassName(
                'w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all',
              )}
              placeholder="0"
              readOnly={isComponentReadOnly}
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
              className={getInputClassName(
                'w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all',
              )}
              placeholder="0"
              readOnly={isComponentReadOnly}
            />
          </div>
        </div>
      </div>

      {/* New Packing Section */}
      <div className="space-y-6">
        <h3
          className={`text-lg font-semibold mb-6 flex items-center ${getSectionHeaderColor()}`}
        >
          📋 Packing
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Jenis Packing */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Jenis Packing
            </label>
            <SearchableSelect
              options={getJenisPackingOptions()}
              value={selectedJenisPacking || '-'}
              onChange={handleJenisPackingChange}
              placeholder="Select Jenis Packing"
              className="w-full"
              disabled={isComponentReadOnly}
            />
          </div>

          {/* Nama Packing */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Nama Packing
            </label>
            <SearchableSelect
              options={getPackingSearchableOptions()}
              value={selectedNamaPacking}
              onChange={handleNamaPackingChange}
              placeholder={
                loadingPacking
                  ? 'Loading...'
                  : getCurrentValue('jenis_packing') &&
                    getCurrentValue('jenis_packing') !== '-'
                  ? 'Select Nama Packing'
                  : 'Select Jenis Packing first'
              }
              className="w-full"
              disabled={
                isComponentReadOnly ||
                !getCurrentValue('jenis_packing') ||
                getCurrentValue('jenis_packing') === '-'
              }
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
              className={getInputClassName(
                'w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all',
              )}
              placeholder="1"
              min="0"
              step="0.01"
              readOnly={isComponentReadOnly}
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
        <h3
          className={`text-lg font-semibold mb-6 flex items-center ${getSectionHeaderColor()}`}
        >
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
              className={getInputClassName(
                'w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all',
              )}
              placeholder="100"
              readOnly={isComponentReadOnly}
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
              className={getInputClassName(
                'w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all',
              )}
              placeholder="200"
              readOnly={isComponentReadOnly}
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
              className={getInputClassName(
                'w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all',
              )}
              placeholder="1"
              readOnly={isComponentReadOnly}
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

          {/* Harga Pengiriman - Auto Calculated */}
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

      {/* Readonly Information Panel */}
      {isComponentReadOnly && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">
            PostPress Information
          </h4>
          <p className="text-sm text-blue-600">
            This section is in read-only mode because this is a repeat
            calculation. To make changes, create a "repeat perubahan" instead.
          </p>
        </div>
      )}
    </div>
  );
};
export default PostPress2Tab;
