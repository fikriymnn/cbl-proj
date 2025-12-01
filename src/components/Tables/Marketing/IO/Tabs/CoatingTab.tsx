// components/Tabs/CoatingTab.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MountingFormData } from '../Mounting';
import SearchableSelect from '../../../../../pages/MasterData/Marketing/SearchableSelect';

interface CoatingOption {
  id: number;
  nama_barang: string;
  harga: number;
  kode_barang: string;
  kategori: string;
  batas_harga?: number;
}

interface BarangResponse {
  id: number;
  nama_barang: string;
  gramatur: number;
  panjang: number;
  lebar: number;
  persentase: number;
  harga: number;
  pajak: number;
  kategori: string;
}

interface JenisKertasResponse {
  id: number;
  kategori: string;
}

interface Option {
  value: number | string;
  label: string;
}

interface CoatingTabProps {
  formData: MountingFormData;
  onInputChange: (field: keyof MountingFormData, value: any) => void;
  isEditMode: boolean;
}

const CoatingTab: React.FC<CoatingTabProps> = ({
  formData,
  onInputChange,
  isEditMode,
}) => {
  // States for coating options
  const [coatingDepanOptions, setCoatingDepanOptions] = useState<Option[]>([]);
  const [coatingBelakangOptions, setCoatingBelakangOptions] = useState<
    Option[]
  >([]);
  const [loadingCoating, setLoadingCoating] = useState(false);

  // States for jenis kertas options
  const [jenisKertasOptions, setJenisKertasOptions] = useState<Option[]>([]);
  const [namaKertasOptions, setNamaKertasOptions] = useState<Option[]>([]);
  const [namaKertasData, setNamaKertasData] = useState<BarangResponse[]>([]);
  const [isLoadingJenisKertas, setIsLoadingJenisKertas] = useState(false);
  const [isLoadingNamaKertas, setIsLoadingNamaKertas] = useState(false);
  const [selectedBarangData, setSelectedBarangData] =
    useState<BarangResponse | null>(null);

  const selectedJenisKertas = formData.jenis_kertas;
  const selectedNamaKertas = formData.id_kertas;

  // Fetch coating options
  const fetchCoatingOptions = async () => {
    setLoadingCoating(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_LINK}/master/barang`,
        {
          params: {
            kategori: 'Coating',
          },
        },
      );

      if (response.data && response.data.data) {
        const coatingData = response.data.data || [];
        const coatingOptions: Option[] = coatingData.map(
          (item: CoatingOption) => ({
            value: item.id,
            label: item.nama_barang,
          }),
        );
        setCoatingDepanOptions(coatingOptions);
        setCoatingBelakangOptions(coatingOptions);
      }
    } catch (error) {
      console.error('Error fetching coating options:', error);
    } finally {
      setLoadingCoating(false);
    }
  };

  // Fetch jenis kertas options
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
        setJenisKertasOptions(options);
      } catch (error) {
        console.error('Error fetching jenis kertas:', error);
      } finally {
        setIsLoadingJenisKertas(false);
      }
    };

    fetchJenisKertas();
  }, []);

  // Fetch nama kertas based on selected jenis kertas
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

          const fullData: BarangResponse[] = response.data.data;
          setNamaKertasData(fullData);

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

  // Auto-fill fields based on selected kertas
  const autoFillFields = (selectedBarang: BarangResponse) => {
    setSelectedBarangData(selectedBarang);

    // Auto-fill gramature from selected barang
    const gramatureMatch = selectedBarang.nama_barang.match(/(\d+)\s*gr/i);
    if (gramatureMatch) {
      onInputChange('gramature_kertas', parseInt(gramatureMatch[1]));
    } else if (selectedBarang.gramatur) {
      onInputChange('gramature_kertas', selectedBarang.gramatur);
    }

    // Auto-fill plano dimensions if available
    if (selectedBarang.panjang) {
      onInputChange('panjang_plano', selectedBarang.panjang);
    }
    if (selectedBarang.lebar) {
      onInputChange('lebar_plano', selectedBarang.lebar);
    }
  };

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

  // Helper functions
  const getSelectedJenisKertasValue = () => {
    return formData.jenis_kertas || '';
  };

  const getSelectedNamaKertasValue = () => {
    return formData.id_kertas || '';
  };

  const getSelectedCoatingDepanValue = () => {
    return formData.id_coating_depan || '';
  };

  const getSelectedCoatingBelakangValue = () => {
    return formData.id_coating_belakang || '';
  };

  // Event handlers
  const handleJenisKertasChange = (value: number | string) => {
    onInputChange('jenis_kertas', value);
    onInputChange('id_kertas', 0); // Reset nama kertas
    onInputChange('gramature_kertas', 0); // Reset gramature
    onInputChange('panjang_plano', 0); // Reset plano dimensions
    onInputChange('lebar_plano', 0);
    setSelectedBarangData(null);
  };

  const handleNamaKertasChange = (value: number | string) => {
    onInputChange('id_kertas', Number(value));

    const selectedBarang = namaKertasData.find(
      (item) => item.id === Number(value),
    );
    if (selectedBarang) {
      autoFillFields(selectedBarang);
    }
  };

  const handleCoatingDepanChange = (value: number | string) => {
    onInputChange('id_coating_depan', Number(value));
  };

  const handleCoatingBelakangChange = (value: number | string) => {
    onInputChange('id_coating_belakang', Number(value));
  };

  // Effects
  useEffect(() => {
    fetchCoatingOptions();
  }, []);

  return (
    <div className="space-y-6">
      {/* Coating Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">Coating</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Jenis Coating Depan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jenis Coating Depan
            </label>
            <div className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-pink-200 resize-none">
              <SearchableSelect
                options={[
                  { value: '', label: 'Select Coating' },
                  ...coatingDepanOptions,
                ]}
                value={getSelectedCoatingDepanValue()}
                onChange={handleCoatingDepanChange}
                placeholder={loadingCoating ? 'Loading...' : 'WATERBASE'}
              />
            </div>
          </div>

          {/* Merk Coating Depan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Merk
            </label>
            <input
              type="text"
              value={formData.merk_coating_depan}
              onChange={(e) =>
                onInputChange('merk_coating_depan', e.target.value)
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Jenis Coating Belakang */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jenis Coating Belakang
            </label>
            <div className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-pink-200 resize-none">
              <SearchableSelect
                options={[
                  { value: '', label: 'Select Coating' },
                  ...coatingBelakangOptions,
                ]}
                value={getSelectedCoatingBelakangValue()}
                onChange={handleCoatingBelakangChange}
                placeholder={loadingCoating ? 'Loading...' : 'Select Coating'}
              />
            </div>
          </div>

          {/* Merk Coating Belakang */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Merk
            </label>
            <input
              type="text"
              value={formData.merk_coating_belakang}
              onChange={(e) =>
                onInputChange('merk_coating_belakang', e.target.value)
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Kertas Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">Kertas</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Merek / Serat */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Merek / Serat
            </label>
            <input
              type="text"
              value={formData.merk_serat_kertas}
              onChange={(e) =>
                onInputChange('merk_serat_kertas', e.target.value)
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Jenis */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jenis
            </label>
            <div className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-pink-200 resize-none">
              <SearchableSelect
                options={[
                  { value: '', label: '--Pilih Jenis Kertas--' },
                  ...jenisKertasOptions,
                ]}
                value={getSelectedJenisKertasValue()}
                onChange={handleJenisKertasChange}
                placeholder={
                  isLoadingJenisKertas ? 'Loading...' : '--Pilih Jenis Kertas--'
                }
              />
            </div>
          </div>

          {/* Nama Kertas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Kertas
            </label>
            <div className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-pink-200 resize-none">
              <SearchableSelect
                options={[
                  {
                    value: '',
                    label: !selectedJenisKertas
                      ? 'Pilih jenis kertas'
                      : 'Pilih Nama Kertas',
                  },
                  ...namaKertasOptions,
                ]}
                value={getSelectedNamaKertasValue()}
                onChange={handleNamaKertasChange}
                placeholder={
                  !selectedJenisKertas
                    ? 'Pilih jenis kertas'
                    : isLoadingNamaKertas
                    ? 'Loading...'
                    : 'Pilih Nama Kertas'
                }
              />
            </div>
          </div>

          {/* GSM */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GSM
            </label>
            <input
              type="number"
              value={formData.gramature_kertas}
              onChange={(e) =>
                onInputChange('gramature_kertas', Number(e.target.value))
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-pink-200"
              placeholder="250"
            />
          </div>
        </div>
      </div>

      {/* Plano Cetak & Layout Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">
          Plano Cetak & Layout
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Panjang Plano */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Panjang Plano
            </label>
            <input
              type="number"
              value={formData.panjang_plano}
              onChange={(e) =>
                onInputChange('panjang_plano', Number(e.target.value))
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-pink-200"
              placeholder="790"
            />
          </div>

          {/* Lebar Plano */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lebar Plano
            </label>
            <input
              type="number"
              value={formData.lebar_plano}
              onChange={(e) =>
                onInputChange('lebar_plano', Number(e.target.value))
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-pink-200"
              placeholder="1090"
            />
          </div>

          {/* Panjang Layout */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Panjang Layout
            </label>
            <input
              type="number"
              value={formData.panjang_layout}
              onChange={(e) =>
                onInputChange('panjang_layout', Number(e.target.value))
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Lebar Layout */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lebar Layout
            </label>
            <input
              type="number"
              value={formData.lebar_layout}
              onChange={(e) =>
                onInputChange('lebar_layout', Number(e.target.value))
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Cetak A Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Panjang Cetak A */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Panjang Cetak A
            </label>
            <input
              type="number"
              value={formData.ukuran_cetak_panjang_1}
              onChange={(e) =>
                onInputChange('ukuran_cetak_panjang_1', Number(e.target.value))
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-pink-200"
              placeholder="395"
            />
          </div>

          {/* Lebar Cetak A */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lebar Cetak A
            </label>
            <input
              type="number"
              value={formData.ukuran_cetak_lebar_1}
              onChange={(e) =>
                onInputChange('ukuran_cetak_lebar_1', Number(e.target.value))
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-pink-200"
              placeholder="510"
            />
          </div>

          {/* Bagian A */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bagian A
            </label>
            <input
              type="number"
              value={formData.ukuran_cetak_bagian_1}
              onChange={(e) =>
                onInputChange('ukuran_cetak_bagian_1', Number(e.target.value))
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-pink-200"
              placeholder="4"
            />
          </div>

          {/* Isi A */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Isi A
            </label>
            <input
              type="number"
              value={formData.ukuran_cetak_isi_1}
              onChange={(e) =>
                onInputChange('ukuran_cetak_isi_1', Number(e.target.value))
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-pink-200"
              placeholder="2"
            />
          </div>
        </div>

        {/* Cetak B Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Panjang Cetak B */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Panjang Cetak B
            </label>
            <input
              type="number"
              value={formData.ukuran_cetak_panjang_2}
              onChange={(e) =>
                onInputChange('ukuran_cetak_panjang_2', Number(e.target.value))
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-pink-200"
              placeholder="0"
            />
          </div>

          {/* Lebar Cetak B */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lebar Cetak B
            </label>
            <input
              type="number"
              value={formData.ukuran_cetak_lebar_2}
              onChange={(e) =>
                onInputChange('ukuran_cetak_lebar_2', Number(e.target.value))
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-pink-200"
              placeholder="0"
            />
          </div>

          {/* Bagian B */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bagian B
            </label>
            <input
              type="number"
              value={formData.ukuran_cetak_bagian_2}
              onChange={(e) =>
                onInputChange('ukuran_cetak_bagian_2', Number(e.target.value))
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-pink-200"
              placeholder="0"
            />
          </div>

          {/* Isi B */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Isi B
            </label>
            <input
              type="number"
              value={formData.ukuran_cetak_isi_2}
              onChange={(e) =>
                onInputChange('ukuran_cetak_isi_2', Number(e.target.value))
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-pink-200"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* ID Layout Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">ID PISAU</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <textarea
              value={formData.id_layout}
              onChange={(e) => onInputChange('id_layout', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
              placeholder="ID Layout information..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoatingTab;
