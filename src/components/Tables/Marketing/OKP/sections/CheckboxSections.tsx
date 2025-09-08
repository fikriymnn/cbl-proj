import React from 'react';
import { OKPFormData } from '../types';

interface CheckboxSectionProps {
  formData: OKPFormData;
  handleCheckboxChange: (
    field: 'jenis_pekerjaan' | 'tahapan',
    value: string,
    checked: boolean,
  ) => void;
  disabled: boolean;
}

const CheckboxSection: React.FC<CheckboxSectionProps> = ({
  formData,
  handleCheckboxChange,
  disabled,
}) => {
  const jenisPekerjaanOptions = [
    'Print Artwork',
    'Dummy Polos',
    'Dummy Artwork',
    'Print Digital',
  ];

  const tahapanOptions = [
    'Cetak',
    'Water Base',
    'UV',
    '1/2 Putus',
    'Foil Perak',
    'Lock Bottom',
    'Mika',
    'Bor...mm',
    'Spot OPV',
    'Lami. Kilap',
    'Potong Jadi',
    'V.Kaca',
    'Lipat',
    'Spiral',
    'Jahit Kawat',
    'OPV',
    'Laim. doff',
    'Perforasi',
    'Blok Lem',
    'Numerator',
    'Jepit Kalung',
    'Jahit Benang',
    'Varnish Doff',
    'Pons',
    'Emboss',
    'Lem Atas',
    'Komplit',
    'Mata Itik',
    'Spot UV',
    'Ril',
    'Foil Emas',
    'Lem Samping',
    'Pasang Cover',
    'Pasang Tali',
  ];

  // Ensure arrays are properly handled
  const getArrayValue = (value: any): string[] => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      if (value.trim() === '') return [];
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return value
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }
    return [];
  };

  const jenisPekerjaanArray = getArrayValue(formData.jenis_pekerjaan);
  const tahapanArray = getArrayValue(formData.tahapan);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Jenis Pekerjaan
        </label>
        <div
          className={`border border-gray-300 rounded-md p-4 max-h-48 overflow-y-auto ${
            disabled ? 'bg-gray-50' : ''
          }`}
        >
          <div className="space-y-2">
            {jenisPekerjaanOptions.map((option) => (
              <label
                key={option}
                className={`flex items-center ${
                  disabled ? 'cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <input
                  type="checkbox"
                  checked={jenisPekerjaanArray.includes(option)}
                  onChange={(e) =>
                    handleCheckboxChange(
                      'jenis_pekerjaan',
                      option,
                      e.target.checked,
                    )
                  }
                  className={`mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                    disabled ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                  disabled={disabled}
                />
                <span
                  className={`text-sm ${
                    disabled ? 'text-gray-500' : 'text-gray-700'
                  }`}
                >
                  {option}
                </span>
              </label>
            ))}
          </div>
        </div>
        {jenisPekerjaanArray.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-gray-600">
              Selected: {jenisPekerjaanArray.join(', ')}
            </p>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Tahapan
        </label>
        <div
          className={`border border-gray-300 rounded-md p-4 max-h-48 overflow-y-auto ${
            disabled ? 'bg-gray-50' : ''
          }`}
        >
          <div className="grid grid-cols-2 gap-2">
            {tahapanOptions.map((option) => (
              <label
                key={option}
                className={`flex items-center ${
                  disabled ? 'cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <input
                  type="checkbox"
                  checked={tahapanArray.includes(option)}
                  onChange={(e) =>
                    handleCheckboxChange('tahapan', option, e.target.checked)
                  }
                  className={`mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                    disabled ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                  disabled={disabled}
                />
                <span
                  className={`text-sm ${
                    disabled ? 'text-gray-500' : 'text-gray-700'
                  }`}
                >
                  {option}
                </span>
              </label>
            ))}
          </div>
        </div>
        {tahapanArray.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-gray-600">
              Selected: {tahapanArray.join(', ')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckboxSection;
