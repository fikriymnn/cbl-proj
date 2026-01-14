import React from 'react';
import { BOMPPICCoating } from '../../Types/bompiic.types';

interface CoatingSectionProps {
  items: BOMPPICCoating[];
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
                Coating Depan
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                Coating Belakang
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                UV WB
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                Varnish Doff
              </th>
              <th className="px-4 py-3 text-xs font-bold text-gray-700 uppercase bg-green-50">
                Stock Depan
              </th>
              <th className="px-4 py-3 text-xs font-bold text-gray-700 uppercase bg-orange-50">
                Beli Depan
              </th>
              <th className="px-4 py-3 text-xs font-bold text-gray-700 uppercase bg-green-50">
                Stock Belakang
              </th>
              <th className="px-4 py-3 text-xs font-bold text-gray-700 uppercase bg-orange-50">
                Beli Belakang
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {index + 1}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                  {item.nama_coating_depan}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                  {item.nama_coating_belakang}
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-semibold text-gray-900">
                    {item.uv_wb}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-semibold text-gray-900">
                    {item.varnish_doff}
                  </span>
                </td>
                <td className="px-4 py-3 bg-green-50">
                  <input
                    type="text"
                    value={getInputDisplayValue(
                      'coating',
                      index,
                      'qty_stok_coating_depan',
                      item.qty_stok_coating_depan,
                    )}
                    onChange={(e) =>
                      onItemChange(
                        index,
                        'qty_stok_coating_depan',
                        e.target.value,
                      )
                    }
                    onBlur={() =>
                      handleInputBlur(
                        'coating',
                        index,
                        'qty_stok_coating_depan',
                      )
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
                      'qty_beli_coating_depan',
                      item.qty_beli_coating_depan,
                    )}
                    onChange={(e) =>
                      onItemChange(
                        index,
                        'qty_beli_coating_depan',
                        e.target.value,
                      )
                    }
                    onBlur={() =>
                      handleInputBlur(
                        'coating',
                        index,
                        'qty_beli_coating_depan',
                      )
                    }
                    className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium bg-white"
                    placeholder="0"
                  />
                </td>
                <td className="px-4 py-3 bg-green-50">
                  <input
                    type="text"
                    value={getInputDisplayValue(
                      'coating',
                      index,
                      'qty_stok_coating_belakang',
                      item.qty_stok_coating_belakang,
                    )}
                    onChange={(e) =>
                      onItemChange(
                        index,
                        'qty_stok_coating_belakang',
                        e.target.value,
                      )
                    }
                    onBlur={() =>
                      handleInputBlur(
                        'coating',
                        index,
                        'qty_stok_coating_belakang',
                      )
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
                      'qty_beli_coating_belakang',
                      item.qty_beli_coating_belakang,
                    )}
                    onChange={(e) =>
                      onItemChange(
                        index,
                        'qty_beli_coating_belakang',
                        e.target.value,
                      )
                    }
                    onBlur={() =>
                      handleInputBlur(
                        'coating',
                        index,
                        'qty_beli_coating_belakang',
                      )
                    }
                    className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium bg-white"
                    placeholder="0"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CoatingSection;
