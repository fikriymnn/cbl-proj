// components/Tabs/TambahanTab.tsx
import React from 'react';
import { MountingFormData } from '../Mounting';

interface TambahanTabProps {
  formData: MountingFormData;
  onInputChange: (field: keyof MountingFormData, value: any) => void; // ✅ Fixed
  isEditMode: boolean;
}
const TambahanTab: React.FC<TambahanTabProps> = ({
  formData,
  onInputChange,
  isEditMode,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Druk
        </label>
        <input
          value={formData.tambahan_insheet_druk}
          itemType="number"
          onChange={(e) =>
            onInputChange('tambahan_insheet_druk', e.target.value)
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Masukkan tambahan insheet druk..."
        />
      </div>
    </div>
  );
};

export default TambahanTab;
