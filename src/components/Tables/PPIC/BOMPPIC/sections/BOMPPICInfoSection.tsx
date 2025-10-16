import React from 'react';
import { BOMData } from '../Types/bompiic.types';

interface BOMPPICInfoSectionProps {
  bomDetails: BOMData;
}

const BOMPPICInfoSection: React.FC<BOMPPICInfoSectionProps> = ({
  bomDetails,
}) => {
  return (
    <div className=" py-4 border-b border-gray-200 flex-shrink-0 bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <span className="text-xs text-gray-500 font-medium block mb-1">
            NO SO
          </span>
          <span className="text-sm font-semibold text-gray-800">
            {bomDetails.no_so}
          </span>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <span className="text-xs text-gray-500 font-medium block mb-1">
            NO IO
          </span>
          <span className="text-sm font-semibold text-gray-800">
            {bomDetails.no_io}
          </span>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <span className="text-xs text-gray-500 font-medium block mb-1">
            NO BOM
          </span>
          <span className="text-sm font-semibold text-gray-800">
            {bomDetails.no_bom || '-'}
          </span>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <span className="text-xs text-gray-500 font-medium block mb-1">
            Customer
          </span>
          <span className="text-sm font-semibold text-gray-800">
            {bomDetails.customer}
          </span>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 lg:col-span-2">
          <span className="text-xs text-gray-500 font-medium block mb-1">
            Produk
          </span>
          <span className="text-sm font-semibold text-gray-800">
            {bomDetails.produk}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BOMPPICInfoSection;
