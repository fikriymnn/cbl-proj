// CoatingSection.tsx
import React from 'react';
import { BOMPPICCoating } from '../../Types/bompiic.types';

interface CoatingSectionProps {
  items: BOMPPICCoating[];
  qtyRatio: number;
  onItemChange: (
    index: number,
    field: keyof BOMPPICCoating,
    value: string | number,
  ) => void;
  formatNumber: (value: number | string) => string;
  getInputDisplayValue: (
    section: string,
    index: number,
    field: string,
    actualValue: number,
  ) => string;
  handleInputBlur: (section: string, index: number, field: string) => void;
}

const CoatingSection: React.FC<CoatingSectionProps> = ({
  items,
  qtyRatio,
  onItemChange,
  formatNumber,
  getInputDisplayValue,
  handleInputBlur,
}) => {
  if (items.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-pink-50 px-4 py-3 border-b border-pink-200">
        <h3 className="text-sm font-bold text-pink-900 flex items-center">
          <span className="bg-pink-200 px-2 py-1 rounded mr-2">
            {items.length}
          </span>
          Coating Materials
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                No
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                Nama Coating
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                Brand
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                Qty Coating
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                UV WB
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                Varnish Doff
              </th>
              <th className="px-4 py-3 text-xs font-bold text-gray-700 uppercase bg-green-50">
                Qty Stock
              </th>
              <th className="px-4 py-3 text-xs font-bold text-gray-700 uppercase bg-orange-50">
                Qty Beli
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item, index) => {
              // production-need qty for this coating item
              const adjustedQtyCoating = item.qty_coating * qtyRatio;

              return (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                    {item.nama_coating}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {item.nama_brand || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-semibold text-gray-900">
                      {formatNumber(adjustedQtyCoating)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-semibold text-gray-900">
                      {formatNumber(item.uv_wb)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-semibold text-gray-900">
                      {formatNumber(item.varnish_doff)}
                    </span>
                  </td>
                  <td className="px-4 py-3 bg-green-50">
                    <input
                      type="text"
                      value={getInputDisplayValue(
                        'coating',
                        index,
                        'qty_stok',
                        item.qty_stok,
                      )}
                      onChange={(e) =>
                        onItemChange(index, 'qty_stok', e.target.value)
                      }
                      onBlur={() =>
                        handleInputBlur('coating', index, 'qty_stok')
                      }
                      className="w-full px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-medium bg-white"
                      placeholder="0"
                    />
                  </td>
                  <td className="px-4 py-3 bg-orange-50">
                    <input
                      type="text"
                      value={getInputDisplayValue(
                        'coating',
                        index,
                        'qty_beli',
                        item.qty_beli,
                      )}
                      onChange={(e) =>
                        onItemChange(index, 'qty_beli', e.target.value)
                      }
                      onBlur={() =>
                        handleInputBlur('coating', index, 'qty_beli')
                      }
                      className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium bg-white"
                      placeholder="0"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CoatingSection;
