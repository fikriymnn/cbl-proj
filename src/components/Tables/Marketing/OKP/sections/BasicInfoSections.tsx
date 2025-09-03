import React from 'react';
import SearchableSelect from '../../../../../pages/MasterData/Marketing/SearchableSelect';
import { KalkulasiItem, OKPFormData } from '../types';

interface BasicInfoSectionProps {
  formData: OKPFormData;
  handleInputChange: (field: keyof OKPFormData, value: any) => void;
  kalkulasiList: KalkulasiItem[];
  loadingKalkulasi: boolean;
  disabled: boolean;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  formData,
  handleInputChange,
  kalkulasiList,
  loadingKalkulasi,
  disabled,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nomor Kalkulasi
        </label>
        {disabled ? (
          <div className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600">
            {kalkulasiList.find((k) => k.id === formData.id_kalkulasi)
              ?.kode_kalkulasi || 'Not Selected'}
          </div>
        ) : (
          <SearchableSelect
            options={[
              { value: 0, label: 'Select Kalkulasi' },
              ...kalkulasiList.map((k) => ({
                value: k.id,
                label: `${k.kode_kalkulasi} - ${k.nama_customer} - ${k.nama_produk}`,
              })),
            ]}
            value={formData.id_kalkulasi}
            onChange={(value) =>
              handleInputChange('id_kalkulasi', Number(value))
            }
            placeholder="Select Kalkulasi"
            required
          />
        )}
        {loadingKalkulasi && (
          <p className="text-xs text-gray-500">Loading...</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nomor OKP
        </label>
        <input
          type="text"
          value={formData.no_okp}
          onChange={(e) => handleInputChange('no_okp', e.target.value)}
          className={`w-full p-2 border border-gray-300 rounded-md ${
            disabled ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : ''
          }`}
          placeholder="OK-00001/09/25"
          disabled={disabled}
          readOnly={disabled}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Status OKP
        </label>
        <select
          value={formData.status_okp}
          onChange={(e) => handleInputChange('status_okp', e.target.value)}
          className={`w-full p-2 border border-gray-300 rounded-md ${
            disabled ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : ''
          }`}
          disabled={disabled}
        >
          <option value="Baru">Baru</option>
          <option value="Draft">Draft</option>
          <option value="Approved">Approved</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tanggal Target Marketing
        </label>
        <input
          type="date"
          value={formData.tgl_target_marketing}
          onChange={(e) =>
            handleInputChange('tgl_target_marketing', e.target.value)
          }
          className={`w-full p-2 border border-gray-300 rounded-md ${
            disabled ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : ''
          }`}
          disabled={disabled}
          readOnly={disabled}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ID Pisau
        </label>
        <input
          type="text"
          value={formData.id_pisau}
          onChange={(e) => handleInputChange('id_pisau', e.target.value)}
          className={`w-full p-2 border border-gray-300 rounded-md ${
            disabled ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : ''
          }`}
          placeholder="PS-001"
          disabled={disabled}
          readOnly={disabled}
        />
      </div>
    </div>
  );
};

export default BasicInfoSection;
