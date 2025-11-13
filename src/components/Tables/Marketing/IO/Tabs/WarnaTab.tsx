// components/mounting-tabs/WarnaTab.tsx
import React from 'react';
import { MountingFormData } from '../Mounting';

interface WarnaTabProps {
  formData: MountingFormData;
  onInputChange: (field: keyof MountingFormData, value: any) => void;
  isEditMode: boolean;
}

const WarnaTab: React.FC<WarnaTabProps> = ({ formData, onInputChange }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Untuk
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.untuk}
            onChange={(e) => onInputChange('untuk', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Warna Depan
          </label>
          <input
            type="number"
            value={formData.warna_depan}
            onChange={(e) => onInputChange('warna_depan', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-pink-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Warna Belakang
          </label>
          <input
            type="number"
            value={formData.warna_belakang}
            onChange={(e) => onInputChange('warna_belakang', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-pink-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total Warna
          </label>
          <input
            type="number"
            value={formData.jumlah_warna}
            onChange={(e) => onInputChange('jumlah_warna', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-pink-100"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Keterangan Warna Depan
          </label>
          <textarea
            value={formData.keterangan_warna_depan}
            onChange={(e) =>
              onInputChange('keterangan_warna_depan', e.target.value)
            }
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Keterangan Warna Belakang
          </label>
          <textarea
            value={formData.keterangan_warna_belakang}
            onChange={(e) =>
              onInputChange('keterangan_warna_belakang', e.target.value)
            }
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

export default WarnaTab;
