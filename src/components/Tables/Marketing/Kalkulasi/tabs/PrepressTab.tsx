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
  const [selectedJenisKertas, setSelectedJenisKertas] = useState<
    number | string
  >('');
  const [selectedNamaKertas, setSelectedNamaKertas] = useState<number | string>(
    '',
  );
  const [isLoadingJenisKertas, setIsLoadingJenisKertas] = useState(false);
  const [isLoadingNamaKertas, setIsLoadingNamaKertas] = useState(false);
  const [isLoadingMesinPotong, setIsLoadingMesinPotong] = useState(false);

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

  // Helper function to create synthetic events for auto-fill
  const createSyntheticEvent = (name: string, value: string | number) => {
    return {
      target: {
        name: name,
        value: value.toString(),
      },
    } as React.ChangeEvent<HTMLInputElement>;
  };

  // Auto-fill fields when Nama Kertas is selected
  const autoFillFields = (selectedBarang: BarangResponse) => {
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

    // Auto-fill percentage
    onInputChange(
      createSyntheticEvent('percentage', selectedBarang.persentase || 0),
    );

    // You can also auto-fill other fields based on your needs
    // For example, if you want to set a base price or other calculations
  };

  const handleJenisKertasChange = (value: number | string) => {
    setSelectedJenisKertas(value);
    // Reset nama kertas when jenis kertas changes
    setSelectedNamaKertas('');

    // Clear auto-filled fields when jenis kertas changes
    onInputChange(createSyntheticEvent('gramature', ''));
    onInputChange(createSyntheticEvent('panjangMm', ''));
    onInputChange(createSyntheticEvent('lebarMm', ''));
    onInputChange(createSyntheticEvent('percentage', ''));

    // Create synthetic event for form handling
    const syntheticEvent = {
      target: {
        name: 'jenisKertas',
        value: value,
      },
    } as React.ChangeEvent<HTMLSelectElement>;

    onInputChange(syntheticEvent);
  };

  const handleNamaKertasChange = (value: number | string) => {
    setSelectedNamaKertas(value);

    // Find the selected barang data and auto-fill fields
    const selectedBarang = namaKertasData.find(
      (item) => item.id === Number(value),
    );
    if (selectedBarang) {
      autoFillFields(selectedBarang);
    }

    // Create synthetic event for form handling
    const syntheticEvent = {
      target: {
        name: 'namaKertas',
        value: value,
      },
    } as React.ChangeEvent<HTMLSelectElement>;

    onInputChange(syntheticEvent);
  };

  const handleInputChangeLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
    onInputChange(e);
  };

  return (
    <div className="space-y-6">
      {/* Pre-Press & Press Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Pre-Press & Press :
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Jenis Kertas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jenis Kertas
            </label>
            <SearchableSelect
              options={jenisKertasOptions}
              value={selectedJenisKertas}
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
              value={selectedNamaKertas}
              onChange={handleNamaKertasChange}
              placeholder={
                !selectedJenisKertas
                  ? 'Pilih jenis kertas dulu'
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Gramature */}
        <div>
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
        <div>
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
        <div>
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

        {/* Percentage */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Percentage
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
        {/* Total Kertas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total Kertas
          </label>
          <input
            type="number"
            name="totalKertas"
            value={formData.totalKertas || ''}
            onChange={handleInputChangeLocal}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0"
          />
        </div>

        {/* Total Harga Kertas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total Harga Kertas
          </label>
          <input
            type="number"
            name="totalHargaKertas"
            value={formData.totalHargaKertas || ''}
            onChange={handleInputChangeLocal}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            value={formData.mesinPotong || ''}
            onChange={(value) => {
              const syntheticEvent = {
                target: {
                  name: 'mesinPotong',
                  value: value,
                },
              } as React.ChangeEvent<HTMLSelectElement>;
              onInputChange(syntheticEvent);
            }}
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
