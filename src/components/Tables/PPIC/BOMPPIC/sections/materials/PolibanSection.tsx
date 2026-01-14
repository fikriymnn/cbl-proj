import React from 'react';
import { BOMPPICPoliban } from '../../Types/bompiic.types';
import { MaterialTable } from '../common/MaterialTable';

interface PolibanSectionProps {
  items: BOMPPICPoliban[];
  onItemChange: (
    index: number,
    field: keyof BOMPPICPoliban,
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

const PolibanSection: React.FC<PolibanSectionProps> = ({
  items,
  onItemChange,
  formatNumber,
  getInputDisplayValue,
  handleInputBlur,
}) => {
  if (items.length === 0) return null;

  const columns = [
    {
      header: 'No',
      accessor: 'no',
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      header: 'Item Poliban',
      accessor: 'item_poliban',
      render: (value: string) => (
        <span className="text-gray-900 font-medium">{value}</span>
      ),
    },
    {
      header: 'Isi Satu Ikat',
      accessor: 'isi_satu_ikat',
      align: 'right' as const,
      render: (value: number) => (
        <span className="font-semibold text-gray-900">
          {formatNumber(value)}
        </span>
      ),
    },
    {
      header: 'Lembar Poliban',
      accessor: 'lembar_poliban',
      align: 'right' as const,
      render: (value: number) => (
        <span className="font-semibold text-gray-900">
          {formatNumber(value)}
        </span>
      ),
    },
    {
      header: 'Qty',
      accessor: 'qty_poliban',
      align: 'right' as const,
      render: (value: number) => (
        <span className="font-semibold text-gray-900">
          {formatNumber(value)}
        </span>
      ),
    },
    {
      header: 'Stock',
      accessor: 'qty_stok',
      align: 'right' as const,
      bgColor: 'bg-green-50',
      render: (value: number, item: BOMPPICPoliban, index: number) => (
        <input
          type="text"
          value={getInputDisplayValue('poliban', index, 'qty_stok', value)}
          onChange={(e) => onItemChange(index, 'qty_stok', e.target.value)}
          onBlur={() => handleInputBlur('poliban', index, 'qty_stok')}
          className="w-full px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-medium bg-white"
          placeholder="0"
        />
      ),
    },
    {
      header: 'Beli',
      accessor: 'qty_beli',
      align: 'right' as const,
      bgColor: 'bg-orange-50',
      render: (value: number, item: BOMPPICPoliban, index: number) => (
        <input
          type="text"
          value={getInputDisplayValue('poliban', index, 'qty_beli', value)}
          onChange={(e) => onItemChange(index, 'qty_beli', e.target.value)}
          onBlur={() => handleInputBlur('poliban', index, 'qty_beli')}
          className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium bg-white"
          placeholder="0"
        />
      ),
    },
  ];

  return (
    <MaterialTable
      title="Poliban Materials"
      titleColor="bg-green-50 border-green-200"
      headerColor="bg-green-200"
      columns={columns}
      data={items}
    />
  );
};

export default PolibanSection;
