import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MountingFormData } from '../Mounting';
import SearchableSelect from '../../../../../pages/MasterData/Marketing/SearchableSelect';

interface PondTabProps {
  formData: MountingFormData;
  onInputChange: (
    field: keyof MountingFormData,
    value: string | number | boolean,
  ) => void;
  isEditMode: boolean;
}

interface PonsOption {
  id: number;
  nama_barang: string;
}

interface LemOption {
  id: number;
  nama_barang: string;
}

interface ApiResponse<T> {
  data: T[];
}

const PondTab: React.FC<PondTabProps> = ({
  formData,
  onInputChange,
  isEditMode,
}) => {
  const [ponsOptions, setPonsOptions] = useState<PonsOption[]>([]);
  const [lemOptions, setLemOptions] = useState<LemOption[]>([]);
  const [loadingPons, setLoadingPons] = useState<boolean>(false);
  const [loadingLem, setLoadingLem] = useState<boolean>(false);

  useEffect(() => {
    fetchPonsOptions();
    fetchLemOptions();
  }, []);

  const fetchPonsOptions = async () => {
    setLoadingPons(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_LINK}/master/barang`,
        {
          params: {
            kategori: 'POND',
          },
          withCredentials: true,
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

  const fetchLemOptions = async (): Promise<void> => {
    setLoadingLem(true);
    try {
      const response = await axios.get<ApiResponse<LemOption>>(
        `${import.meta.env.VITE_API_LINK}/master/barang`,
        {
          params: {
            kategori: 'LEM',
          },
          withCredentials: true,
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

  // Helper function to get current form values
  const getCurrentValue = (
    field: keyof MountingFormData,
    defaultValue?: any,
  ) => {
    return formData[field] !== undefined ? formData[field] : defaultValue;
  };

  // Helper functions for Pons SearchableSelect
  const getSelectedPonsValue = (): string => {
    const value = getCurrentValue('id_jenis_pons');
    return value ? String(value) : '';
  };

  const handlePonsChange = (value: number | string) => {
    onInputChange('id_jenis_pons', Number(value));
  };

  const getPonsSearchableOptions = () => {
    return ponsOptions.map((option) => ({
      value: String(option.id),
      label: option.nama_barang,
    }));
  };

  // Helper functions for Lem SearchableSelect
  const getSelectedLemValue = (): string => {
    const value = getCurrentValue('id_lem');
    return value ? String(value) : '';
  };

  const handleLemChange = (value: number | string) => {
    onInputChange('id_lem', Number(value));
  };

  const getLemSearchableOptions = () => {
    return lemOptions.map((option) => ({
      value: String(option.id),
      label: option.nama_barang,
    }));
  };

  // Handle regular input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'number' ? Number(value) : value;
    onInputChange(name as keyof MountingFormData, finalValue);
  };

  return (
    <div className="space-y-6">
      {/* Pond Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Pond</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Proses (Jenis Pons) - SearchableSelect */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Proses
            </label>
            <div className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-pink-200 resize-none">
              <SearchableSelect
                options={getPonsSearchableOptions()}
                value={getSelectedPonsValue()}
                onChange={handlePonsChange}
                placeholder={loadingPons ? 'Loading...' : 'Select Pons Type'}
                className="w-full"
              />
            </div>
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Keterangan
            </label>
            <textarea
              name="keterangan_jenis_pons"
              value={getCurrentValue('keterangan_jenis_pons', '')}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white resize-none"
              placeholder="Enter description..."
            />
          </div>
        </div>
      </div>

      {/* Finishing Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Finishing</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Proses Lem */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Proses Lem
            </label>
            <div className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-pink-200 resize-none">
              <SearchableSelect
                options={getLemSearchableOptions()}
                value={getSelectedLemValue()}
                onChange={handleLemChange}
                placeholder={loadingLem ? 'Loading...' : 'Select Lem'}
                className="w-full"
              />
            </div>
          </div>

          {/* Merk & Komp Lem */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Merk & Komp Lem
            </label>
            <input
              type="text"
              name="merk_komp_lem"
              value={getCurrentValue('merk_komp_lem', '')}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
              placeholder="Enter brand & composition..."
            />
          </div>

          {/* Ket. Untuk Lem */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Ket. Untuk Lem
            </label>
            <input
              type="text"
              name="keterangan_lem"
              value={getCurrentValue('keterangan_lem', '')}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
              placeholder="Enter description for lem..."
            />
          </div>
        </div>
      </div>

      {/* Packing Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Packing</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Isi dlm 1 Pack */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Isi dlm 1 Pack
            </label>
            <input
              type="number"
              name="isi_salam_1_pack"
              value={getCurrentValue('isi_salam_1_pack', 0)}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
              placeholder="Enter quantity per pack..."
              min="0"
            />
          </div>

          {/* Jenis Pack */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Jenis Pack
            </label>
            <input
              type="text"
              name="jenis_pack"
              value={getCurrentValue('jenis_pack', '')}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
              placeholder="Enter pack type..."
            />
          </div>

          {/* Keterangan Packing */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Keterangan Packing
            </label>
            <input
              type="text"
              name="keterangan_pack"
              value={getCurrentValue('keterangan_pack', '')}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
              placeholder="Enter packing description..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PondTab;
