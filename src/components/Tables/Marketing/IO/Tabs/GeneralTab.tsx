// components/mounting-tabs/GeneralTab.tsx
import React from 'react';
import { MountingFormData } from '../Mounting';

interface GeneralTabProps {
  formData: MountingFormData;
  onInputChange: (field: keyof MountingFormData, value: any) => void;
  isEditMode: boolean;
}

const GeneralTab: React.FC<GeneralTabProps> = ({
  formData,
  onInputChange,
  isEditMode,
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nama Mounting
          </label>
          <input
            type="text"
            value={formData.nama_mounting}
            onChange={(e) => onInputChange('nama_mounting', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            readOnly={!isEditMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Keterangan Revisi
          </label>
          <textarea
            value={formData.keterangan_revisi}
            onChange={(e) => onInputChange('keterangan_revisi', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
          Ukuran Jadi
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Panjang
            </label>
            <input
              type="number"
              value={formData.ukuran_jadi_panjang}
              onChange={(e) =>
                onInputChange('ukuran_jadi_panjang', Number(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-pink-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lebar
            </label>
            <input
              type="number"
              value={formData.ukuran_jadi_lebar}
              onChange={(e) =>
                onInputChange('ukuran_jadi_lebar', Number(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-pink-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tinggi
            </label>
            <input
              type="number"
              value={formData.ukuran_jadi_tinggi}
              onChange={(e) =>
                onInputChange('ukuran_jadi_tinggi', Number(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-pink-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Terb. Panjang
            </label>
            <input
              type="number"
              value={formData.ukuran_jadi_terb_panjang}
              onChange={(e) =>
                onInputChange(
                  'ukuran_jadi_terb_panjang',
                  Number(e.target.value),
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-pink-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Terb. Lebar
            </label>
            <input
              type="number"
              value={formData.ukuran_jadi_terb_lebar}
              onChange={(e) =>
                onInputChange('ukuran_jadi_terb_lebar', Number(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-pink-100"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralTab;
