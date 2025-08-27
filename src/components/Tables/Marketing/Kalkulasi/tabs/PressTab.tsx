import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { KalkulasiFormData } from '../KalkulasiModal';
import SearchableSelect from '../../../../../pages/MasterData/Marketing/SearchableSelect';

interface PressTabProps {
  formData: KalkulasiFormData;
  onInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
}

interface MesinOption {
  id: number;
  nama_barang: string;
  harga: number;
  kode_barang: string;
  kategori: string;
}

const PressTab: React.FC<PressTabProps> = ({ formData, onInputChange }) => {
  const [mesinOptions, setMesinOptions] = useState<MesinOption[]>([]);
  const [selectedMesin, setSelectedMesin] = useState<MesinOption | null>(null);
  const [loading, setLoading] = useState(false);

  // Define rate tables based on the image - updated with correct values
  const sanbeRateTable = {
    R700: { base: 225000, rates: [65, 60, 55, 50, 45, 40] },
    RR: { base: 200000, rates: [65, 60, 55, 50, 45, 40] },
    PM: { base: 130000, rates: [40, 35, 30, 25, 22.5, 22.5] },
    SM: { base: 130000, rates: [40, 35, 30, 25, 22.5, 22.5] },
    GTO1: { base: 75000, rates: [24, 22, 20, 18, 15, 15] },
    GTO2: { base: 75000, rates: [24, 22, 20, 18, 15, 15] },
    GTO4: { base: 75000, rates: [24, 22, 20, 18, 15, 15] },
  };

  const normalRateTable = {
    R700: { base: 225000, rates: [65, 60, 55, 50, 45, 40] },
    RR: { base: 200000, rates: [65, 60, 55, 50, 45, 40] },
    PM: { base: 150000, rates: [45, 40, 35, 30, 25, 22.5] },
    SM: { base: 150000, rates: [45, 40, 35, 30, 25, 22.5] },
    GTO1: { base: 80000, rates: [26, 25, 20, 18, 15, 15] },
    GTO2: { base: 80000, rates: [26, 25, 20, 18, 15, 15] },
    GTO4: { base: 80000, rates: [26, 25, 20, 18, 15, 15] },
  };

  const rateThresholds = [3000, 5000, 10000, 20000, 30000, 50000];

  // Fetch mesin options on component mount
  useEffect(() => {
    const fetchMesinOptions = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_LINK}/master/barang`,
          {
            params: {
              kategori: 'Plate',
            },
          },
        );

        if (response.data && response.data.data) {
          setMesinOptions(response.data.data || []);
        }
      } catch (error) {
        console.error('Error fetching mesin options:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMesinOptions();
  }, []);

  // Function to parse number with thousand separators
  const parseNumberWithSeparator = (
    value: string | number | undefined,
  ): number => {
    if (!value) return 0;
    if (typeof value === 'number') return value;
    // Remove dots (thousand separators) and convert to number
    return Number(String(value).replace(/\./g, ''));
  };

  // Function to get safe string value
  const getSafeStringValue = (value: string | number | undefined): string => {
    if (value === undefined || value === null) return '';
    return String(value);
  };

  // Function to get machine type from nama_barang
  const getMachineType = (namaBarang: string): string => {
    const name = namaBarang.toUpperCase();
    if (name.includes('R700')) return 'R700';
    if (name.includes('RR')) return 'RR';
    if (name.includes('PM')) return 'PM';
    if (name.includes('SM')) return 'SM';
    if (name.includes('GTO1')) return 'GTO1';
    if (name.includes('GTO2')) return 'GTO2';
    if (name.includes('GTO4')) return 'GTO4';
    return 'R700'; // default
  };

  // Function to get rate index based on rate value - CORRECTED
  const getRateIndex = (rate: number): number => {
    if (rate < 3000) return -1; // Use base rate
    if (rate >= 3000 && rate < 5000) return 0;
    if (rate >= 5000 && rate < 10000) return 1;
    if (rate >= 10000 && rate < 20000) return 2;
    if (rate >= 20000 && rate < 30000) return 3;
    if (rate >= 30000 && rate < 50000) return 4;
    if (rate >= 50000) return 5;
    return 0; // fallback
  };

  // Function to check if customer is Sanbe
  const isSanbeCustomer = (customerName: string): boolean => {
    const name = customerName.toLowerCase();
    return name.includes('sanbe') || name.includes('caprifarmindo');
  };

  // Main calculation function for printing cost - CORRECTED
  const calculateJumlahHargaCetak = (): number => {
    // Check if required fields are available
    if (
      !selectedMesin ||
      !formData.totalKertas ||
      (!formData.ukuran_cetak_bagian_1 && !formData.ukuran_cetak_bagian_2)
    ) {
      return 0;
    }

    // Parse numbers correctly with thousand separators
    const totalKertas = parseNumberWithSeparator(formData.totalKertas);
    const totalWarna = Number(formData.jumlah_warna) || 0;
    const ukuranCetakBagian1 = Number(formData.ukuran_cetak_bagian_1) || 0;
    const ukuranCetakBagian2 = Number(formData.ukuran_cetak_bagian_2) || 0;

    // If both ukuran_cetak_bagian are 0, return 0
    if (ukuranCetakBagian1 === 0 && ukuranCetakBagian2 === 0) {
      return 0;
    }

    // Calculate rate: totalKertas × (ukuran_cetak_bagian_1 + ukuran_cetak_bagian_2)
    const rate = totalKertas * (ukuranCetakBagian1 + ukuranCetakBagian2);

    // Determine which rate table to use
    const customerName = getSafeStringValue(formData.nama_customer);
    const isSanbe = isSanbeCustomer(customerName);
    const rateTable = isSanbe ? sanbeRateTable : normalRateTable;

    // Get machine type
    const machineType = getMachineType(selectedMesin.nama_barang);
    const machineRates = rateTable[machineType as keyof typeof rateTable];

    if (!machineRates) {
      console.error('Machine type not found:', machineType);
      return 0;
    }

    // Calculate printing cost
    if (rate < 3000) {
      // Use base rate for rates < 3000
      return machineRates.base;
    } else {
      // Use tiered rate: (tierRate × totalWarna) × rate
      const rateIndex = getRateIndex(rate);
      const tierRate = machineRates.rates[rateIndex];
      return tierRate * totalWarna * rate;
    }
  };

  // Calculate plate count using real jumlah_warna (no rounding)
  const getPlateCount = () => {
    const jumlahWarna = Number(formData.jumlah_warna) || 0;
    return jumlahWarna;
  };

  // Calculate total harga plate
  const calculateHargaPlate = () => {
    if (!selectedMesin) return 0;
    const plateCount = getPlateCount();
    return selectedMesin.harga * plateCount;
  };

  // Handle mesin selection change
  const handleMesinChange = (value: any) => {
    const selected = mesinOptions.find((mesin) => mesin.id === value) || null;
    setSelectedMesin(selected);
  };

  // Debug effect - UPDATED
  useEffect(() => {
    const totalKertasOriginal = formData.totalKertas;
    const totalKertasParsed = parseNumberWithSeparator(formData.totalKertas);
    const ukuranCetakBagian1 = Number(formData.ukuran_cetak_bagian_1) || 0;
    const ukuranCetakBagian2 = Number(formData.ukuran_cetak_bagian_2) || 0;
    const calculatedRate =
      totalKertasParsed * (ukuranCetakBagian1 + ukuranCetakBagian2);

    console.log('Debug values:', {
      totalKertasOriginal,
      totalKertasParsed,
      ukuran_cetak_bagian_1: formData.ukuran_cetak_bagian_1,
      ukuran_cetak_bagian_2: formData.ukuran_cetak_bagian_2,
      calculatedRate,
    });
  }, [
    formData.totalKertas,
    formData.ukuran_cetak_bagian_1,
    formData.ukuran_cetak_bagian_2,
  ]);

  return (
    <div className="space-y-6">
      {/* Press Section */}
      <div>
        <h3 className="text-lg font-semibold text-blue-600 mb-6 flex items-center">
          🖨️ Press Information
        </h3>

        <div className="grid grid-cols-5 gap-4">
          {/* Printing Insheet */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Printing Insheet
            </label>
            <input
              type="text"
              name="print_insheet"
              value={getSafeStringValue(formData.print_insheet)}
              onChange={onInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter insheet"
            />
          </div>

          {/* Jenis Mesin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jenis Mesin
            </label>
            {loading ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-500 text-sm">
                Loading...
              </div>
            ) : (
              <SearchableSelect
                options={[
                  { value: 0, label: 'Select Machine' },
                  ...mesinOptions.map((mesin) => ({
                    value: mesin.id,
                    label: `${mesin.kode_barang} - ${mesin.nama_barang}`,
                  })),
                ]}
                value={selectedMesin?.id || 0}
                onChange={handleMesinChange}
                placeholder="Select Machine"
                required
              />
            )}
          </div>

          {/* Plate Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jumlah Plate
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50">
              <span className="font-medium">{getPlateCount()}</span>
              <span className="text-xs text-gray-500 ml-1">
                (exact from {getSafeStringValue(formData.jumlah_warna) || '0'}{' '}
                colors)
              </span>
            </div>
          </div>

          {/* Harga per Plate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Harga per Plate
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50">
              <span className="font-medium">
                {selectedMesin
                  ? new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                    }).format(selectedMesin.harga)
                  : 'Rp 0'}
              </span>
            </div>
          </div>

          {/* Total Harga Plate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Harga Plate
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded bg-blue-50">
              <span className="font-semibold text-blue-700">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                }).format(calculateHargaPlate())}
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Selected Machine Details - Only show if machine is selected */}
      {selectedMesin && (
        <div className="border-b pb-4">
          <h4 className="text-sm font-medium text-gray-600 mb-2">
            Selected Machine Details
          </h4>
          <div className="grid grid-cols-5 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Code:</span>
              <div className="font-medium">{selectedMesin.kode_barang}</div>
            </div>
            <div>
              <span className="text-gray-500">Name:</span>
              <div className="font-medium">{selectedMesin.nama_barang}</div>
            </div>
            <div>
              <span className="text-gray-500">Category:</span>
              <div className="font-medium">{selectedMesin.kategori}</div>
            </div>
            <div>
              <span className="text-gray-500">Unit Price:</span>
              <div className="font-medium">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                }).format(selectedMesin.harga)}
              </div>
            </div>
            <div>
              <span className="text-gray-500">Calculation:</span>
              <div className="font-medium text-xs">
                {getPlateCount()} ×{' '}
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                }).format(selectedMesin.harga)}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Printing Cost Calculation Section */}
      <div>
        <h3 className="text-lg font-semibold text-green-600 mb-6 flex items-center">
          💰 Printing Cost Calculation
        </h3>

        <div className="grid grid-cols-4 gap-4">
          {/* Rate Calculation - UPDATED */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rate Calculation
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50">
              <span className="font-medium">
                {(() => {
                  const totalKertas = parseNumberWithSeparator(
                    formData.totalKertas,
                  );
                  const ukuranCetakBagian1 =
                    Number(formData.ukuran_cetak_bagian_1) || 0;
                  const ukuranCetakBagian2 =
                    Number(formData.ukuran_cetak_bagian_2) || 0;
                  const rate =
                    totalKertas * (ukuranCetakBagian1 + ukuranCetakBagian2);
                  return new Intl.NumberFormat('id-ID').format(rate);
                })()}
              </span>
            </div>
          </div>

          {/* Customer Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Type
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50">
              <span className="font-medium">
                {isSanbeCustomer(getSafeStringValue(formData.nama_customer)) ? (
                  <span className="text-orange-600">Sanbe Rate</span>
                ) : (
                  <span className="text-blue-600">Normal Rate</span>
                )}
              </span>
            </div>
          </div>

          {/* Machine Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Machine Type
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50">
              <span className="font-medium">
                {selectedMesin
                  ? getMachineType(selectedMesin.nama_barang)
                  : '-'}
              </span>
            </div>
          </div>

          {/* Jumlah Harga Cetak */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jumlah Harga Cetak
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded bg-green-50">
              <span className="font-semibold text-green-700">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                }).format(calculateJumlahHargaCetak())}
              </span>
            </div>
          </div>
        </div>

        {/* Calculation Details - UPDATED */}
        {selectedMesin && formData.totalKertas && (
          <div className="pb-4 mt-4 border-b ">
            <h4 className="text-sm font-medium text-gray-600 mb-2">
              Calculation Details
            </h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Formula:</span>
                <div className="font-medium">
                  {(() => {
                    const totalKertas = parseNumberWithSeparator(
                      formData.totalKertas,
                    );
                    const totalWarna = Number(formData.jumlah_warna) || 0;
                    const ukuranCetakBagian1 =
                      Number(formData.ukuran_cetak_bagian_1) || 0;
                    const ukuranCetakBagian2 =
                      Number(formData.ukuran_cetak_bagian_2) || 0;
                    const rate =
                      totalKertas * (ukuranCetakBagian1 + ukuranCetakBagian2);

                    if (rate < 3000) {
                      return `Base Rate`;
                    } else {
                      const rateIndex = getRateIndex(rate);
                      const customerName = getSafeStringValue(
                        formData.nama_customer,
                      );
                      const isSanbe = isSanbeCustomer(customerName);
                      const rateTable = isSanbe
                        ? sanbeRateTable
                        : normalRateTable;
                      const machineType = getMachineType(
                        selectedMesin.nama_barang,
                      );
                      const machineRates =
                        rateTable[machineType as keyof typeof rateTable];
                      const tierRate = machineRates?.rates[rateIndex] || 0;

                      return `(${tierRate} × ${totalWarna}) × ${new Intl.NumberFormat(
                        'id-ID',
                      ).format(rate)}`;
                    }
                  })()}
                </div>
              </div>
              <div>
                <span className="text-gray-500">Rate Category:</span>
                <div className="font-medium">
                  {(() => {
                    const totalKertas = parseNumberWithSeparator(
                      formData.totalKertas,
                    );
                    const ukuranCetakBagian1 =
                      Number(formData.ukuran_cetak_bagian_1) || 0;
                    const ukuranCetakBagian2 =
                      Number(formData.ukuran_cetak_bagian_2) || 0;
                    const rate =
                      totalKertas * (ukuranCetakBagian1 + ukuranCetakBagian2);

                    if (rate < 3000) return '< 3,000 (Base Rate)';
                    if (rate >= 3000 && rate < 5000) return '3,000 - 4,999';
                    if (rate >= 5000 && rate < 10000) return '5,000 - 9,999';
                    if (rate >= 10000 && rate < 20000) return '10,000 - 19,999';
                    if (rate >= 20000 && rate < 30000) return '20,000 - 29,999';
                    if (rate >= 30000 && rate < 50000) return '30,000 - 49,999';
                    return '≥ 50,000';
                  })()}
                </div>
              </div>
              <div>
                <span className="text-gray-500">Applied Rate:</span>
                <div className="font-medium">
                  {(() => {
                    const totalKertas = parseNumberWithSeparator(
                      formData.totalKertas,
                    );
                    const ukuranCetakBagian1 =
                      Number(formData.ukuran_cetak_bagian_1) || 0;
                    const ukuranCetakBagian2 =
                      Number(formData.ukuran_cetak_bagian_2) || 0;
                    const rate =
                      totalKertas * (ukuranCetakBagian1 + ukuranCetakBagian2);

                    const customerName = getSafeStringValue(
                      formData.nama_customer,
                    );
                    const isSanbe = isSanbeCustomer(customerName);
                    const rateTable = isSanbe
                      ? sanbeRateTable
                      : normalRateTable;
                    const machineType = getMachineType(
                      selectedMesin.nama_barang,
                    );
                    const machineRates =
                      rateTable[machineType as keyof typeof rateTable];

                    if (!machineRates) return '0';

                    if (rate < 3000) {
                      return new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                      }).format(machineRates.base);
                    } else {
                      const rateIndex = getRateIndex(rate);
                      const tierRate = machineRates.rates[rateIndex];
                      return `${tierRate} `;
                    }
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PressTab;
