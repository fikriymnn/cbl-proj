import React from 'react';
import SearchableSelect from '../../../../../pages/MasterData/Marketing/SearchableSelect';
import { KalkulasiItem, OKPFormData } from '../types';
import ProductInfoSection from './ProductInfoSection';

interface BasicInfoSectionProps {
  formData: OKPFormData;
  handleInputChange: (field: keyof OKPFormData, value: any) => void;
  kalkulasiList: KalkulasiItem[];
  loadingKalkulasi: boolean;
  disabled: boolean;
  isDesain?: boolean;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  formData,
  handleInputChange,
  kalkulasiList,
  loadingKalkulasi,
  disabled,
  isDesain = false, // Default to false
}) => {
  // Format date for input (convert from various formats to YYYY-MM-DD)
  const formatDateForInput = (dateValue: string) => {
    if (!dateValue) return '';

    // If it's already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return dateValue;
    }

    // Try to parse and format other date formats
    try {
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch (error) {
      console.warn('Invalid date format:', dateValue);
    }

    return '';
  };

  // Ensure valid status_okp value
  const getValidStatusOKP = (value: string) => {
    const validOptions = ['Baru', 'Draft', 'Approved'];
    return validOptions.includes(value) ? value : 'Baru';
  };

  // Get the current kalkulasi ID (don't validate against list for display)
  const getCurrentKalkulasiId = (value: any) => {
    const id = Number(value);
    return isNaN(id) ? 0 : id;
  };

  const currentKalkulasiId = getCurrentKalkulasiId(formData.id_kalkulasi);
  const selectedKalkulasi =
    kalkulasiList.find((k) => k.id === currentKalkulasiId) || null;

  // Determine if ID Pisau should be disabled
  const isPisauDisabled = disabled && !isDesain;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nomor Kalkulasi
          </label>
          {disabled ? (
            <div className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600">
              {selectedKalkulasi
                ? `${selectedKalkulasi.kode_kalkulasi} - ${selectedKalkulasi.nama_customer} - ${selectedKalkulasi.nama_produk}`
                : currentKalkulasiId > 0
                ? `ID: ${currentKalkulasiId} (Data not found)`
                : 'Not Selected'}
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
              value={currentKalkulasiId}
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
            value={formData.no_okp || ''}
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
            value={getValidStatusOKP(formData.status_okp)}
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
            value={formatDateForInput(formData.tgl_target_marketing)}
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
            ID Pisau {isDesain && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            value={formData.id_pisau || ''}
            onChange={(e) => handleInputChange('id_pisau', e.target.value)}
            className={`w-full p-2 border border-gray-300 rounded-md ${
              isPisauDisabled
                ? 'bg-gray-100 text-gray-600 cursor-not-allowed'
                : ''
            } ${
              isDesain && !formData.id_pisau
                ? 'border-red-300 focus:border-red-500'
                : ''
            }`}
            placeholder="PS-001"
            disabled={isPisauDisabled}
            readOnly={isPisauDisabled}
            required={isDesain}
          />
          {isDesain && !formData.id_pisau && (
            <p className="text-xs text-red-500 mt-1">
              ID Pisau is required for design process
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tanggal Pembuatan OKP
          </label>
          <input
            type="date"
            value={formatDateForInput(formData.tgl_pembuatan_okp)}
            onChange={(e) =>
              handleInputChange('tgl_pembuatan_okp', e.target.value)
            }
            className={`w-full p-2 border border-gray-300 rounded-md ${
              disabled ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : ''
            }`}
            disabled={disabled}
            readOnly={disabled}
          />
        </div>
      </div>
      {/* Add User Information Section */}
      {(formData.user_create || formData.user_approve) && (
        <div className="mt-6 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.user_create && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Created By
                </label>
                <div className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600">
                  {formData.user_create.nama} ({formData.user_create.bagian})
                </div>
              </div>
            )}

            {formData.user_approve && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Approved By
                </label>
                <div className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600">
                  {formData.user_approve.nama} ({formData.user_approve.bagian})
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Add the new product info section */}
      <ProductInfoSection selectedKalkulasi={selectedKalkulasi} />
    </div>
  );
};

export default BasicInfoSection;
