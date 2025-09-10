// components/Tabs/PartisiTab.tsx
import React from 'react';
import { MountingFormData } from '../Mounting';

interface PartisiTabProps {
  formData: MountingFormData;
  onInputChange: (field: keyof MountingFormData, value: any) => void;
  isEditMode: boolean;
}

const PartisiTab: React.FC<PartisiTabProps> = ({
  formData,
  onInputChange,
  isEditMode,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="ukuran_partisi_sekat"
          checked={formData.is_ukuran_partisi_sekat}
          onChange={(e) =>
            onInputChange('is_ukuran_partisi_sekat', e.target.checked)
          }
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label
          htmlFor="ukuran_partisi_sekat"
          className="text-sm font-medium text-gray-700"
        >
          Ukuran Partisi / Sekat
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Panjang
            </label>
            <input
              type="number"
              value={formData.panjang_partisi_1}
              onChange={(e) =>
                onInputChange(
                  'panjang_partisi_1',
                  parseFloat(e.target.value) || 0,
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lebar
            </label>
            <input
              type="number"
              value={formData.lebar_partisi_1}
              onChange={(e) =>
                onInputChange(
                  'lebar_partisi_1',
                  parseFloat(e.target.value) || 0,
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Panjang 2
            </label>
            <input
              type="number"
              value={formData.panjang_partisi_2}
              onChange={(e) =>
                onInputChange(
                  'panjang_partisi_2',
                  parseFloat(e.target.value) || 0,
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lebar 2
            </label>
            <input
              type="number"
              value={formData.lebar_partisi_2}
              onChange={(e) =>
                onInputChange(
                  'lebar_partisi_2',
                  parseFloat(e.target.value) || 0,
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartisiTab;
