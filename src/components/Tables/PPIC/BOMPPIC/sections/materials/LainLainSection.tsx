import React from 'react';

export interface LainLainItem {
  id?: number;
  nama_item: string;
  harga: number;
  is_active: boolean;
}

interface LainLainSectionProps {
  items: LainLainItem[];
  onItemChange: (
    index: number,
    field: keyof LainLainItem,
    value: string | number | boolean,
  ) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  formatNumber: (value: number | string) => string;
  parseFormattedNumber: (value: string) => number;
}

const LainLainSection: React.FC<LainLainSectionProps> = ({
  items,
  onItemChange,

  formatNumber,
  parseFormattedNumber,
}) => {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-cyan-50 px-4 py-3 border-b border-cyan-200">
          <h3 className="text-sm font-bold text-cyan-900 flex items-center">
            <span className="bg-cyan-200 px-2 py-1 rounded mr-2">0</span>
            Lain-Lain (Miscellaneous Items)
          </h3>
        </div>
        <div className="p-6 text-center">
          <p className="text-gray-500 text-sm mb-4">
            No miscellaneous items added yet
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-cyan-50 px-4 py-3 border-b border-cyan-200 flex justify-between items-center">
        <h3 className="text-sm font-bold text-cyan-900 flex items-center">
          <span className="bg-cyan-200 px-2 py-1 rounded mr-2">
            {items.length}
          </span>
          Lain-Lain (Miscellaneous Items)
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
                Nama Item
              </th>
              <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">
                Harga
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {index + 1}
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={item.nama_item}
                    onChange={(e) =>
                      onItemChange(index, 'nama_item', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm font-medium bg-white"
                    placeholder="Item name"
                    readOnly
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={formatNumber(item.harga)}
                    onChange={(e) =>
                      onItemChange(
                        index,
                        'harga',
                        parseFormattedNumber(e.target.value),
                      )
                    }
                    className="w-full px-3 py-2 text-right border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm font-medium bg-white"
                    placeholder="0"
                    readOnly
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

export default LainLainSection;
