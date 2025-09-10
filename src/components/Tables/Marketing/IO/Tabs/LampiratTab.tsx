// components/Tabs/LampiranTab.tsx
import React from 'react';
import { MountingFormData } from '../Mounting';

interface LampiranTabProps {
  formData: MountingFormData;
  onInputChange: (field: keyof MountingFormData, value: any) => void;
  isEditMode: boolean;
}

const LampiranTab: React.FC<LampiranTabProps> = ({
  formData,
  onInputChange,
  isEditMode,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Lampiran
        </label>
        <textarea
          value={formData.lampiran}
          onChange={(e) => onInputChange('lampiran', e.target.value)}
          rows={8}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Masukkan lampiran..."
        />
      </div>
    </div>
  );
};

export default LampiranTab;
