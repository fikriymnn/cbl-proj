import React from 'react';
import { KalkulasiFormData } from '../types/kalkulasi';

interface UkuranJadiTabProps {
  formData: KalkulasiFormData;
  onInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  isReadOnly?: boolean;
  copyType?: 'repeat' | 'repeat_perubahan';
}

const UkuranJadiTab: React.FC<UkuranJadiTabProps> = ({
  formData,
  onInputChange,
  isReadOnly = false,
  copyType,
}) => {
  const getInputClassName = (baseClassName: string) => {
    return isReadOnly
      ? `${baseClassName} bg-gray-100 cursor-not-allowed`
      : baseClassName;
  };

  return (
    <div className="space-y-8">
      {/* Ukuran Jadi Produk Section */}
      <div>
        <h3 className="text-lg font-semibold text-blue-600 mb-6 flex items-center">
          📏 Ukuran Jadi Produk
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            {
              name: 'ukuran_jadi_panjang',
              label: 'Panjang mm',
              value: formData.ukuran_jadi_panjang,
            },
            {
              name: 'ukuran_jadi_lebar',
              label: 'Lebar mm',
              value: formData.ukuran_jadi_lebar,
            },
            {
              name: 'ukuran_jadi_tinggi',
              label: 'Tinggi mm',
              value: formData.ukuran_jadi_tinggi,
            },
            {
              name: 'ukuran_jadi_terb_panjang',
              label: 'Terb. Panjang mm',
              value: formData.ukuran_jadi_terb_panjang,
            },
            {
              name: 'ukuran_jadi_terb_lebar',
              label: 'Terb. Lebar mm',
              value: formData.ukuran_jadi_terb_lebar,
            },
          ].map((field) => (
            <div key={field.name} className="space-y-2">
              <label className="block text-xs font-medium text-gray-700">
                {field.label}
              </label>
              <input
                type="number"
                step="any"
                name={field.name}
                value={field.value ?? ''}
                onChange={onInputChange}
                readOnly={isReadOnly}
                className={getInputClassName(
                  'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all',
                )}
                min="0"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Ukuran Cetak Produk Section */}
      <div>
        <h3 className="text-lg font-semibold text-blue-600 mb-6 flex items-center">
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
            />
          </svg>
          Ukuran Cetak Produk
        </h3>

        {/* First Print Row */}
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-700 mb-4">Cetak 1</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              {
                name: 'ukuran_cetak_panjang_1',
                label: 'Panjang mm',
                value: formData.ukuran_cetak_panjang_1,
                type: 'float',
              },
              {
                name: 'ukuran_cetak_lebar_1',
                label: 'Lebar mm',
                value: formData.ukuran_cetak_lebar_1,
                type: 'number',
              },
              {
                name: 'ukuran_cetak_bagian_1',
                label: 'Bagian',
                value: formData.ukuran_cetak_bagian_1,
                type: 'number',
              },
              {
                name: 'ukuran_cetak_isi_1',
                label: 'Isi',
                value: formData.ukuran_cetak_isi_1,
                type: 'number',
              },
              {
                name: 'ukuran_cetak_bbs_1',
                label: 'BBS',
                value: formData.ukuran_cetak_bbs_1,
                type: 'select',
              },
            ].map((field) => (
              <div key={field.name} className="space-y-2">
                <label className="block text-xs font-medium text-gray-700">
                  {field.label}
                </label>
                {field.type === 'select' ? (
                  <select
                    name={field.name}
                    value={field.value}
                    onChange={onInputChange}
                    disabled={isReadOnly}
                    className={getInputClassName(
                      'w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all',
                    )}
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                ) : (
                  <input
                    type="number"
                    step="any"
                    name={field.name}
                    value={field.value ?? ''}
                    onChange={onInputChange}
                    readOnly={isReadOnly}
                    className={getInputClassName(
                      'w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all',
                    )}
                    min="0"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Second Print Row */}
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-4">Cetak 2</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              {
                name: 'ukuran_cetak_panjang_2',
                label: 'Panjang mm',
                value: formData.ukuran_cetak_panjang_2,
                type: 'number',
              },
              {
                name: 'ukuran_cetak_lebar_2',
                label: 'Lebar mm',
                value: formData.ukuran_cetak_lebar_2,
                type: 'number',
              },
              {
                name: 'ukuran_cetak_bagian_2',
                label: 'Bagian',
                value: formData.ukuran_cetak_bagian_2,
                type: 'number',
              },
              {
                name: 'ukuran_cetak_isi_2',
                label: 'Isi',
                value: formData.ukuran_cetak_isi_2,
                type: 'number',
              },
              {
                name: 'ukuran_cetak_bbs_2',
                label: 'BBS',
                value: formData.ukuran_cetak_bbs_2,
                type: 'select',
              },
            ].map((field) => (
              <div key={field.name} className="space-y-2">
                <label className="block text-xs font-medium text-gray-700">
                  {field.label}
                </label>
                {field.type === 'select' ? (
                  <select
                    name={field.name}
                    value={field.value}
                    onChange={onInputChange}
                    disabled={isReadOnly}
                    className={getInputClassName(
                      'w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all',
                    )}
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                ) : (
                  <input
                    type="number"
                    step="any"
                    name={field.name}
                    value={field.value ?? ''}
                    onChange={onInputChange}
                    readOnly={isReadOnly}
                    className={getInputClassName(
                      'w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all',
                    )}
                    min="0"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UkuranJadiTab;
