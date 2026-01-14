import React from 'react';
import { BOMPPICTinta } from '../../Types/bompiic.types';

interface TintaSectionProps {
  items: BOMPPICTinta[];
  onDetailChange: (
    tintaIndex: number,
    detailIndex: number,
    field: 'qty_beli' | 'qty_stok',
    value: string,
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

const TintaSection: React.FC<TintaSectionProps> = ({
  items,
  onDetailChange,
  formatNumber,
  getInputDisplayValue,
  handleInputBlur,
}) => {
  if (items.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-purple-50 px-4 py-3 border-b border-purple-200">
        <h3 className="text-sm font-bold text-purple-900 flex items-center">
          <span className="bg-purple-200 px-2 py-1 rounded mr-2">
            {items.length}
          </span>
          Tinta Materials
        </h3>
      </div>
      <div className="overflow-x-auto">
        {items.map((tinta, tintaIndex) => (
          <div key={tintaIndex} className="border-b last:border-b-0">
            <div className="bg-purple-100 px-4 py-2 flex items-center gap-2">
              {/* Color preview box */}
              <span
                className="w-16 h-4 rounded border border-gray-300"
                style={{ backgroundColor: tinta.warna_tinta }}
                title={tinta.warna_tinta}
              />
              <p className="text-sm font-semibold text-purple-900">
                {tintaIndex + 1}. {tinta.warna_tinta} - Total Qty:{' '}
                {formatNumber(tinta.qty_tinta)} Kg
              </p>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                    Item Tinta
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">
                    Persentase
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">
                    Qty (Kg)
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase bg-green-50">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase bg-orange-50">
                    Beli
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tinta.tinta_detail.map((detail, detailIndex) => (
                  <tr
                    key={detailIndex}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                      {detail.nama_item_tinta}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatNumber(detail.persentase_tinta)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatNumber(detail.qty_tinta)}
                      </span>
                    </td>
                    <td className="px-4 py-3 bg-green-50">
                      <input
                        type="text"
                        value={getInputDisplayValue(
                          `tinta-${tintaIndex}`,
                          detailIndex,
                          'qty_stok',
                          detail.qty_stok,
                        )}
                        onChange={(e) =>
                          onDetailChange(
                            tintaIndex,
                            detailIndex,
                            'qty_stok',
                            e.target.value,
                          )
                        }
                        onBlur={() =>
                          handleInputBlur(
                            `tinta-${tintaIndex}`,
                            detailIndex,
                            'qty_stok',
                          )
                        }
                        className="w-full px-3 py-2 text-right border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-medium bg-white"
                        placeholder="0"
                      />
                    </td>
                    <td className="px-4 py-3 bg-orange-50">
                      <input
                        type="text"
                        value={getInputDisplayValue(
                          `tinta-${tintaIndex}`,
                          detailIndex,
                          'qty_beli',
                          detail.qty_beli,
                        )}
                        onChange={(e) =>
                          onDetailChange(
                            tintaIndex,
                            detailIndex,
                            'qty_beli',
                            e.target.value,
                          )
                        }
                        onBlur={() =>
                          handleInputBlur(
                            `tinta-${tintaIndex}`,
                            detailIndex,
                            'qty_beli',
                          )
                        }
                        className="w-full px-3 py-2 text-right border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium bg-white"
                        placeholder="0"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TintaSection;
