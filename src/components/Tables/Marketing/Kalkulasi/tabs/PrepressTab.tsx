import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { KalkulasiFormData } from '../KalkulasiModal';
import SearchableSelect from '../../../../../pages/MasterData/Marketing/SearchableSelect';

interface Option {
  value: number | string;
  label: string;
}

interface JenisKertasResponse {
  id: number;
  kategori: string;
  // Add other fields as needed
}

interface BarangResponse {
  id: number;
  nama_barang: string;
  gramatur: number;
  panjang: number;
  lebar: number;
  persentase: number;
  harga: number;
  pajak: number; // Added pajak field
  kategori: string; // Added kategori field
  // Add other fields as needed
}

interface TahapanResponse {
  id: number;
  kode_tahapan: string;
  nama_tahapan: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MesinTahapanResponse {
  id: number;
  id_tahapan: number;
  id_mesin_tahapan: number;
  shift: string;
  is_active: boolean;
  mesin: {
    id: number;
    kode_mesin: string;
    nama_mesin: string;
    is_active: boolean;
    createdAt: string;
    updatedAt: string;
  };
  tahapan: TahapanResponse;
  createdAt: string;
  updatedAt: string;
}

interface PrepressTabProps {
  formData: KalkulasiFormData;
  onInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
}

const PrepressTab: React.FC<PrepressTabProps> = ({
  formData,
  onInputChange,
}) => {
  const [jenisKertasOptions, setJenisKertasOptions] = useState<Option[]>([]);
  const [namaKertasOptions, setNamaKertasOptions] = useState<Option[]>([]);
  const [namaKertasData, setNamaKertasData] = useState<BarangResponse[]>([]); // Store full data
  const [mesinPotongOptions, setMesinPotongOptions] = useState<Option[]>([]);
  const [selectedBarangData, setSelectedBarangData] =
    useState<BarangResponse | null>(null); // Store selected barang data
  const [isLoadingJenisKertas, setIsLoadingJenisKertas] = useState(false);
  const [isLoadingNamaKertas, setIsLoadingNamaKertas] = useState(false);
  const [isLoadingMesinPotong, setIsLoadingMesinPotong] = useState(false);

  // Use formData values directly
  const selectedJenisKertas = formData.jenis_kertas || '';
  const selectedNamaKertas = formData.id_kertas || '';

  // Fetch Jenis Kertas options
  useEffect(() => {
    const fetchJenisKertas = async () => {
      setIsLoadingJenisKertas(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_LINK}/master/jenisKertasBarang`,
        );

        const options: Option[] = response.data.data.map(
          (item: JenisKertasResponse) => ({
            value: item.kategori,
            label: item.kategori,
          }),
        );
        console.log(response.data.data);
        setJenisKertasOptions(options);
      } catch (error) {
        console.error('Error fetching jenis kertas:', error);
      } finally {
        setIsLoadingJenisKertas(false);
      }
    };

    fetchJenisKertas();
  }, []);

  // Fetch Mesin Potong options
  useEffect(() => {
    const fetchMesinPotong = async () => {
      setIsLoadingMesinPotong(true);
      try {
        // First, get all tahapan
        const tahapanResponse = await axios.get(
          `${import.meta.env.VITE_API_LINK}/master/tahapan`,
        );

        // Find tahapan with nama_tahapan containing "POTONG" (case insensitive)
        const potongTahapan = tahapanResponse.data.data.find(
          (tahapan: TahapanResponse) =>
            tahapan.nama_tahapan.toLowerCase().includes('potong'),
        );

        if (potongTahapan) {
          // Get mesin for this tahapan
          const mesinResponse = await axios.get(
            `${import.meta.env.VITE_API_LINK}/master/tahapanMesin`,
            {
              params: {
                id_tahapan: potongTahapan.id,
              },
            },
          );

          const options: Option[] = mesinResponse.data.data.map(
            (item: MesinTahapanResponse) => ({
              value: item.id_mesin_tahapan,
              label: item.mesin.nama_mesin,
            }),
          );

          setMesinPotongOptions(options);
        }
      } catch (error) {
        console.error('Error fetching mesin potong:', error);
      } finally {
        setIsLoadingMesinPotong(false);
      }
    };

    fetchMesinPotong();
  }, []);

  // Fetch Nama Kertas options when Jenis Kertas changes
  useEffect(() => {
    const fetchNamaKertas = async () => {
      if (!selectedJenisKertas) {
        setNamaKertasOptions([]);
        setNamaKertasData([]);
        return;
      }

      setIsLoadingNamaKertas(true);
      try {
        const selectedOption = jenisKertasOptions.find(
          (option) => option.value === selectedJenisKertas,
        );

        if (selectedOption) {
          const response = await axios.get(
            `${import.meta.env.VITE_API_LINK}/master/barang`,
            {
              params: {
                kategori: selectedOption.label,
              },
            },
          );
          console.log(response.data.data);

          const fullData: BarangResponse[] = response.data.data;
          setNamaKertasData(fullData); // Store full data

          const options: Option[] = fullData.map((item: BarangResponse) => ({
            value: item.id,
            label: item.nama_barang,
          }));

          setNamaKertasOptions(options);
        }
      } catch (error) {
        console.error('Error fetching nama kertas:', error);
      } finally {
        setIsLoadingNamaKertas(false);
      }
    };

    fetchNamaKertas();
  }, [selectedJenisKertas, jenisKertasOptions]);

  // Restore selectedBarangData when component mounts or namaKertas changes
  useEffect(() => {
    if (selectedNamaKertas && namaKertasData.length > 0) {
      const selectedBarang = namaKertasData.find(
        (item) => item.id === Number(selectedNamaKertas),
      );
      if (selectedBarang) {
        setSelectedBarangData(selectedBarang);
      }
    }
  }, [selectedNamaKertas, namaKertasData]);

  // Helper function to format numbers with thousand separators
  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('id-ID').format(value);
  };

  // Helper function to parse formatted number back to raw number
  const parseFormattedNumber = (value: string): number => {
    return parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0;
  };

  // Helper function to round percentage (< 0.50 rounds down, >= 0.50 rounds up)
  const roundPercentage = (value: number): number => {
    return Math.round(value);
  };

  // Calculate Percentage%Apki based on pajak conversion
  const calculatePercentageApki = (
    persentase: number,
    pajak: number,
  ): number => {
    // Convert pajak: 11 -> 1.11, 12 -> 1.12
    const pajakConverted = pajak === 11 ? 1.11 : pajak === 12 ? 1.12 : 1;
    const rawPercentage = persentase / pajakConverted;
    return roundPercentage(rawPercentage); // Apply rounding here
  };

  // Helper function to create synthetic events for auto-fill
  const createSyntheticEvent = (name: string, value: string | number) => {
    return {
      target: {
        name: name,
        value: value.toString(),
      },
    } as React.ChangeEvent<HTMLInputElement>;
  };

  // Calculate Total Harga Kertas automatically
  useEffect(() => {
    const calculatetotal_harga_kertas = () => {
      if (!selectedBarangData || !formData.total_kertas) {
        return;
      }

      const total_kertas = parseFormattedNumber(
        formData.total_kertas.toString(),
      );
      if (total_kertas <= 0) {
        return;
      }

      const { harga, persentase, pajak, kategori } = selectedBarangData;

      // Calculate rounded Percentage%Apki (persentase / pajak_converted)
      const percentageApki = calculatePercentageApki(persentase, pajak);

      // Check if kategori contains "DUPLEX" (case insensitive)
      const isDuplex = kategori.toLowerCase().includes('duplex');

      // Calculate total harga kertas based on formula using rounded percentage
      let total_harga_kertas = 0;

      if (isDuplex) {
        // For DUPLEX: (((harga * ((rounded_percentage + 100)) / 100 / 500) * total_kertas)
        total_harga_kertas =
          ((harga * (percentageApki + 100)) / 100 / 500) * total_kertas;
      } else {
        // For non-DUPLEX: (((harga * rounded_percentage) / 100 / 500) * total_kertas)
        total_harga_kertas =
          ((harga * percentageApki) / 100 / 500) * total_kertas;
      }

      // Update the total harga kertas field
      const calculatedValue = Math.round(total_harga_kertas);
      const formattedValue = formatNumber(calculatedValue);

      // Only update if the calculated value is different from current value
      const currentValue = parseFormattedNumber(
        formData.total_harga_kertas?.toString() || '0',
      );
      if (calculatedValue !== currentValue) {
        const syntheticEvent = createSyntheticEvent(
          'total_harga_kertas',
          formattedValue,
        );
        onInputChange(syntheticEvent);
      }

      // Also update the percentage%apki display with rounded value
      const percentageDisplay = isDuplex
        ? percentageApki + 100
        : percentageApki;
      const currentPercentage = parseFloat(
        formData.percentage?.toString() || '0',
      );
      if (Math.abs(percentageDisplay - currentPercentage) > 0.01) {
        const percentageSyntheticEvent = createSyntheticEvent(
          'percentage',
          percentageDisplay.toString(), // Use rounded value as integer
        );
        onInputChange(percentageSyntheticEvent);
      }
    };

    calculatetotal_harga_kertas();
  }, [
    selectedBarangData,
    formData.total_kertas,
    onInputChange,
    formData.total_harga_kertas,
    formData.percentage,
  ]);

  // Calculate Total Kertas automatically
  useEffect(() => {
    const calculatetotal_kertas = () => {
      // Parse numeric values from form data
      const qtyKalkulasi = parseFloat(formData.qty_kalkulasi) || 0;
      const ukuranCetakBagian1 =
        parseFloat(formData.ukuran_cetak_bagian_1) || 0;
      const ukuranCetakIsi1 = parseFloat(formData.ukuran_cetak_isi_1) || 0;
      const ukuranCetakBagian2 =
        parseFloat(formData.ukuran_cetak_bagian_2) || 0;
      const ukuranCetakIsi2 = parseFloat(formData.ukuran_cetak_isi_2) || 0;
      const printInsheet = parseFloat(formData.print_insheet || '0') || 0;
      const ponsInsheet = parseFloat(formData.pons_insheet || '0') || 0;
      const finishingInsheet =
        parseFloat(formData.finishing_insheet || '0') || 0;

      // Only calculate if we have the required values
      if (
        qtyKalkulasi > 0 &&
        (ukuranCetakBagian1 > 0 || ukuranCetakBagian2 > 0)
      ) {
        let total_kertas = 0;

        // First part of formula: qty_kalkulasi / (ukuran_cetak_bagian_1 * ukuran_cetak_isi_1)
        if (ukuranCetakBagian1 > 0 && ukuranCetakIsi1 > 0) {
          total_kertas += qtyKalkulasi / (ukuranCetakBagian1 * ukuranCetakIsi1);
        }

        // Second part: + (ukuran_cetak_bagian_2 * ukuran_cetak_isi_2)
        if (ukuranCetakBagian2 > 0 && ukuranCetakIsi2 > 0) {
          total_kertas += ukuranCetakBagian2 * ukuranCetakIsi2;
        }

        // Third part: + ((print_insheet + pons_insheet + finishing_insheet) / (ukuran_cetak_bagian_1 * ukuran_cetak_bagian_2))
        const totalInsheet = printInsheet + ponsInsheet + finishingInsheet;
        if (
          totalInsheet > 0 &&
          ukuranCetakBagian1 > 0 &&
          ukuranCetakBagian2 > 0
        ) {
          total_kertas +=
            totalInsheet / (ukuranCetakBagian1 * ukuranCetakBagian2);
        }

        // Update the total kertas field
        const calculatedValue = Math.ceil(total_kertas); // Round up to nearest integer
        const formattedValue = formatNumber(calculatedValue);

        // Only update if the calculated value is different from current value
        const currentValue = parseFormattedNumber(
          formData.total_kertas?.toString() || '0',
        );
        if (calculatedValue !== currentValue) {
          const syntheticEvent = createSyntheticEvent(
            'total_kertas',
            formattedValue,
          );
          onInputChange(syntheticEvent);
        }
      }
    };

    calculatetotal_kertas();
  }, [
    formData.qty_kalkulasi,
    formData.ukuran_cetak_bagian_1,
    formData.ukuran_cetak_isi_1,
    formData.ukuran_cetak_bagian_2,
    formData.ukuran_cetak_isi_2,
    formData.print_insheet,
    formData.pons_insheet,
    formData.finishing_insheet,
    onInputChange,
    formData.total_kertas,
  ]);

  // Auto-fill fields when Nama Kertas is selected
  const autoFillFields = (selectedBarang: BarangResponse) => {
    // Store the selected barang data for calculations
    setSelectedBarangData(selectedBarang);

    // Auto-fill gramature
    onInputChange(
      createSyntheticEvent('gramature', selectedBarang.gramatur || 0),
    );

    // Auto-fill panjang (panjangMm)
    onInputChange(
      createSyntheticEvent('panjangMm', selectedBarang.panjang || 0),
    );

    // Auto-fill lebar (lebarMm)
    onInputChange(createSyntheticEvent('lebarMm', selectedBarang.lebar || 0));

    // Set raw percentage (original persentase value)
    onInputChange(
      createSyntheticEvent(
        'rawPercentage',
        selectedBarang.persentase.toFixed(2),
      ),
    );

    // Calculate and auto-fill percentage%apki based on formula: persentase / pajak_converted
    const percentageApki = calculatePercentageApki(
      selectedBarang.persentase,
      selectedBarang.pajak,
    );
    const isDuplex = selectedBarang.kategori.toLowerCase().includes('duplex');
    const finalPercentage = isDuplex ? percentageApki + 100 : percentageApki;

    onInputChange(
      createSyntheticEvent('percentage', finalPercentage.toString()), // Use rounded value as integer
    );
  };

  const handleJenisKertasChange = (value: number | string) => {
    // Update jenis kertas in main formData
    const jenisKertasEvent = {
      target: {
        name: 'jenis_kertas',
        value: value,
      },
    } as React.ChangeEvent<HTMLSelectElement>;
    onInputChange(jenisKertasEvent);

    // Reset nama kertas when jenis kertas changes
    const namaKertasEvent = {
      target: {
        name: 'id_kertas',
        value: '',
      },
    } as React.ChangeEvent<HTMLSelectElement>;
    onInputChange(namaKertasEvent);

    setSelectedBarangData(null);

    // Clear auto-filled fields when jenis kertas changes
    onInputChange(createSyntheticEvent('gramature', ''));
    onInputChange(createSyntheticEvent('panjangMm', ''));
    onInputChange(createSyntheticEvent('lebarMm', ''));
    onInputChange(createSyntheticEvent('rawPercentage', ''));
    onInputChange(createSyntheticEvent('percentage', ''));
    onInputChange(createSyntheticEvent('total_harga_kertas', ''));
  };

  const handleNamaKertasChange = (value: number | string) => {
    // Update nama kertas in main formData
    const namaKertasEvent = {
      target: {
        name: 'id_kertas',
        value: value,
      },
    } as React.ChangeEvent<HTMLSelectElement>;
    onInputChange(namaKertasEvent);

    // Find the selected barang data and auto-fill fields
    const selectedBarang = namaKertasData.find(
      (item) => item.id === Number(value),
    );
    if (selectedBarang) {
      autoFillFields(selectedBarang);
    }
  };

  const handleMesinPotongChange = (value: number | string) => {
    const syntheticEvent = {
      target: {
        name: 'id_mesin_potong',
        value: value,
      },
    } as React.ChangeEvent<HTMLSelectElement>;
    onInputChange(syntheticEvent);
  };

  const handleInputChangeLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
    onInputChange(e);
  };

  // Helper functions to get selected values for controlled components
  const getSelectedJenisKertasValue = () => {
    return formData.jenis_kertas || '';
  };

  const getSelectedNamaKertasValue = () => {
    return formData.id_kertas || '';
  };

  const getSelectedMesinPotongValue = () => {
    return formData.id_mesin_potong || '';
  };

  return (
    <div className="space-y-6">
      {/* Pre-Press & Press Section */}
      <div>
        <h3 className="text-lg font-semibold text-blue-600 mb-6 flex items-center">
          📋 Pre-Press & Press
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Jenis Kertas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jenis Kertas
            </label>
            <SearchableSelect
              options={jenisKertasOptions}
              value={getSelectedJenisKertasValue()}
              onChange={handleJenisKertasChange}
              placeholder={
                isLoadingJenisKertas ? 'Loading...' : '--Pilih Jenis Kertas--'
              }
              className="w-full"
              required
            />
          </div>

          {/* Nama Kertas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Kertas
            </label>
            <SearchableSelect
              options={namaKertasOptions}
              value={getSelectedNamaKertasValue()}
              onChange={handleNamaKertasChange}
              placeholder={
                !selectedJenisKertas
                  ? 'Pilih jenis kertas'
                  : isLoadingNamaKertas
                  ? 'Loading...'
                  : 'Pilih Nama Kertas'
              }
              className="w-full"
              required
            />
          </div>
        </div>

        {/* Mark Jenis Kertas */}
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            className="px-4 py-2 bg-gray-800 text-white text-sm rounded hover:bg-gray-700 transition-colors"
          >
            Pilih
          </button>
        </div>
      </div>

      {/* Paper Specifications Grid - These will be auto-filled */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Gramature */}
        <div className="flex flex-col justify-between">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gramature
          </label>
          <input
            type="number"
            name="gramature"
            value={formData.gramature || ''}
            onChange={handleInputChangeLocal}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0"
            readOnly
          />
        </div>

        {/* Panjang mm */}
        <div className="flex flex-col justify-between">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Panjang mm
          </label>
          <input
            type="number"
            name="panjangMm"
            value={formData.panjangMm || ''}
            onChange={handleInputChangeLocal}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0"
            readOnly
          />
        </div>

        {/* Lebar mm */}
        <div className="flex flex-col justify-between">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lebar mm
          </label>
          <input
            type="number"
            name="lebarMm"
            value={formData.lebarMm || ''}
            onChange={handleInputChangeLocal}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0"
            readOnly
          />
        </div>

        {/* Raw Percentage */}
        <div className="flex flex-col justify-between">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Percentage
            <span className="text-xs text-gray-500 block">
              (Original Value)
            </span>
          </label>
          <input
            type="number"
            name="rawPercentage"
            value={formData.rawPercentage || ''}
            onChange={handleInputChangeLocal}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0"
            readOnly
          />
        </div>

        {/* Percentage%Apki */}
        <div className="flex flex-col justify-between">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Percentage%Apki
            <span className="text-xs text-gray-500 block">
              {selectedBarangData?.kategori?.toLowerCase().includes('duplex')
                ? `(${formData.rawPercentage} / ${selectedBarangData.pajak}% + 100) [Rounded]`
                : `(${formData.rawPercentage} / ${selectedBarangData?.pajak}%) [Rounded]`}
            </span>
          </label>
          <input
            type="number"
            name="percentage"
            value={formData.percentage || ''}
            onChange={handleInputChangeLocal}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0"
            readOnly
          />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Kertas - Now calculated automatically */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total Kertas
            <span className="text-xs text-gray-500 ml-2">
              (Auto-calculated)
            </span>
          </label>
          <input
            type="text"
            name="total_kertas"
            value={formData.total_kertas || ''}
            onChange={handleInputChangeLocal}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
            placeholder="0"
            readOnly
          />
        </div>

        {/* Total Harga Kertas - Now calculated automatically */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total Harga Kertas
            <span className="text-xs text-gray-500 ml-2">
              (Auto-calculated)
            </span>
          </label>
          <input
            type="text"
            name="total_harga_kertas"
            value={formData.total_harga_kertas || ''}
            onChange={handleInputChangeLocal}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
            placeholder="0"
            readOnly
          />
        </div>

        {/* Mesin Potong */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mesin Potong
          </label>
          <SearchableSelect
            options={mesinPotongOptions}
            value={getSelectedMesinPotongValue()}
            onChange={handleMesinPotongChange}
            placeholder={
              isLoadingMesinPotong ? 'Loading...' : 'Pilih Mesin Potong'
            }
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default PrepressTab;
