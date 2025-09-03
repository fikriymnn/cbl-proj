import React from 'react';
import { OKPFormData } from '../types';

interface AdditionalFieldsSectionProps {
  formData: OKPFormData;
  handleInputChange: (field: keyof OKPFormData, value: any) => void; // Changed from onInputChange
  disabled: boolean;
}

const AdditionalFieldsSection: React.FC<AdditionalFieldsSectionProps> = ({
  formData,
  handleInputChange,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rencana Qty PO
        </label>
        <input
          type="number"
          value={formData.rencana_qty_po}
          onChange={(e) =>
            handleInputChange('rencana_qty_po', parseInt(e.target.value) || 0)
          }
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rencana Tanggal Kirim
        </label>
        <input
          type="date"
          value={formData.rencana_tgl_kirim}
          onChange={(e) =>
            handleInputChange('rencana_tgl_kirim', e.target.value)
          }
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Status PO
        </label>
        <select
          value={formData.status_po}
          onChange={(e) => handleInputChange('status_po', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
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
          value={formData.keterangan_cetak}
          onChange={(e) =>
            handleInputChange('keterangan_cetak', e.target.value)
          }
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="in house">In House</option>
          <option value="outsource">Outsource</option>
        </select>
      </div>
    </div>
  );
};

export default AdditionalFieldsSection;
