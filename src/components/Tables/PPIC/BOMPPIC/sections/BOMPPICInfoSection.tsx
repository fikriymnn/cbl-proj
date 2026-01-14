import React from 'react';
import { BOMData } from '../Types/bompiic.types';

interface BOMPPICInfoSectionProps {
  bomDetails: BOMData;
}

// Update BOMPPICInfoSection.tsx
const BOMPPICInfoSection: React.FC<BOMPPICInfoSectionProps> = ({
  bomDetails,
}) => {
  return (
    <div className="py-2">
      {' '}
      {/* Reduced padding */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {' '}
        {/* Smaller gaps, more columns */}
        <div className="bg-white p-2 rounded-md shadow-sm border border-gray-200">
          {' '}
          {/* Smaller padding */}
          <span className="text-xs text-gray-500 font-medium block">NO SO</span>
          <span className="text-sm font-semibold text-gray-800">
            {bomDetails.no_so}
          </span>
        </div>
        <div className="bg-white p-2 rounded-md shadow-sm border border-gray-200">
          <span className="text-xs text-gray-500 font-medium block">NO IO</span>
          <span className="text-sm font-semibold text-gray-800">
            {bomDetails.no_io}
          </span>
        </div>
        <div className="bg-white p-2 rounded-md shadow-sm border border-gray-200">
          <span className="text-xs text-gray-500 font-medium block">
            NO BOM
          </span>
          <span className="text-sm font-semibold text-gray-800">
            {bomDetails.no_bom || '-'}
          </span>
        </div>
        <div className="bg-white p-2 rounded-md shadow-sm border border-gray-200">
          <span className="text-xs text-gray-500 font-medium block">
            Customer
          </span>
          <span
            className="text-sm font-semibold text-gray-800 truncate"
            title={bomDetails.customer}
          >
            {bomDetails.customer}
          </span>
        </div>
        <div className="bg-white p-2 rounded-md shadow-sm border border-gray-200 lg:col-span-2">
          <span className="text-xs text-gray-500 font-medium block">
            Produk
          </span>
          <span
            className="text-sm font-semibold text-gray-800 truncate"
            title={bomDetails.produk}
          >
            {bomDetails.produk}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BOMPPICInfoSection;
