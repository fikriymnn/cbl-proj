import React from 'react';
import { OKPFormData } from '../types';

interface CheckboxSectionProps {
  formData: OKPFormData;
  handleCheckboxChange: (
    // Changed from onCheckboxChange
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Jenis Pekerjaan
        </label>
        <div className="border border-gray-300 rounded-md p-4 max-h-48 overflow-y-auto">
          <div className="space-y-2">
            {jenisPekerjaanOptions.map((option) => (
              <label key={option} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.jenis_pekerjaan.includes(option)}
                  onChange={(e) =>
                    handleCheckboxChange(
                      'jenis_pekerjaan',
                      option,
                      e.target.checked,
                    )
                  }
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>
        {formData.jenis_pekerjaan.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-gray-600">
              Selected: {formData.jenis_pekerjaan.join(', ')}
            </p>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Tahapan
        </label>
        <div className="border border-gray-300 rounded-md p-4 max-h-48 overflow-y-auto">
          <div className="grid grid-cols-2 gap-2">
            {tahapanOptions.map((option) => (
              <label key={option} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.tahapan.includes(option)}
                  onChange={(e) =>
                    handleCheckboxChange('tahapan', option, e.target.checked)
                  }
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>
        {formData.tahapan.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-gray-600">
              Selected: {formData.tahapan.join(', ')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckboxSection;
