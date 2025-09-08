import React from 'react';
import { OKPFormData } from '../types';

interface AdditionalFieldsSectionProps {
  formData: OKPFormData;
  handleInputChange: (field: keyof OKPFormData, value: any) => void;
  disabled: boolean;
}

const AdditionalFieldsSection: React.FC<AdditionalFieldsSectionProps> = ({
  formData,
  handleInputChange,
  disabled,
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

  // Format number with thousand separators
  const formatNumber = (value: number | string) => {
    const num = Number(value);
    if (isNaN(num)) return '0';
    return num.toLocaleString('id-ID'); // Indonesian number format
  };

  // Parse formatted number back to number
  const parseFormattedNumber = (value: string) => {
    if (!value) return 0;
    // Remove thousand separators and convert to number
    const cleanValue = value.replace(/\./g, '').replace(/,/g, '');
    const num = parseInt(cleanValue);
    return isNaN(num) ? 0 : num;
  };

  // Handle number input change
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    // Allow only numbers and thousand separators
    const cleanValue = rawValue.replace(/[^\d]/g, '');
    const numericValue = parseInt(cleanValue) || 0;
    handleInputChange('rencana_qty_po', numericValue);
  };

  // Ensure valid option values
  const getValidStatusPO = (value: string) => {
    const validOptions = ['tidak', 'ada'];
    return validOptions.includes(value) ? value : 'tidak';
  };

  const getValidKeteranganCetak = (value: string) => {
    const validOptions = ['in house', 'outsource'];
    return validOptions.includes(value) ? value : '';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rencana Qty PO
        </label>
        {disabled ? (
          <div className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600">
            {formatNumber(formData.rencana_qty_po || 0)}
          </div>
        ) : (
          <input
            type="text"
            value={formatNumber(formData.rencana_qty_po || 0)}
            onChange={handleNumberChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="0"
          />
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rencana Tanggal Kirim
        </label>
        <input
          type="date"
          value={formatDateForInput(formData.rencana_tgl_kirim)}
          onChange={(e) =>
            handleInputChange('rencana_tgl_kirim', e.target.value)
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
          Status PO
        </label>
        <select
          value={getValidStatusPO(formData.status_po)}
          onChange={(e) => handleInputChange('status_po', e.target.value)}
          className={`w-full p-2 border border-gray-300 rounded-md ${
            disabled ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : ''
          }`}
          disabled={disabled}
        >
          <option value="tidak">Tidak</option>
          <option value="ada">Ada</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Keterangan Cetak
        </label>
        <select
          value={getValidKeteranganCetak(formData.keterangan_cetak)}
          onChange={(e) =>
            handleInputChange('keterangan_cetak', e.target.value)
          }
          className={`w-full p-2 border border-gray-300 rounded-md ${
            disabled ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : ''
          }`}
          disabled={disabled}
        >
          <option value="">Select Option</option>
          <option value="in house">In House</option>
          <option value="outsource">Outsource</option>
        </select>
      </div>
    </div>
  );
};

export default AdditionalFieldsSection;
