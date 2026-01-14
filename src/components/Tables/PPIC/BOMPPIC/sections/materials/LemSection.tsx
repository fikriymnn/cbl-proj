import React from 'react';
import { BOMPPICLem } from '../../Types/bompiic.types';
import { MaterialTable } from '../common/MaterialTable';

interface LemSectionProps {
  items: BOMPPICLem[];
  onItemChange: (
    index: number,
    field: keyof BOMPPICLem,
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

const LemSection: React.FC<LemSectionProps> = ({
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
      header: 'Nama Lem',
      accessor: 'nama_lem',
      render: (value: string) => (
        <span className="text-gray-900 font-medium">{value}</span>
      ),
    },
    {
      header: 'Rumus',
      accessor: 'rumus_lem',
      render: (value: string) => (
        <span className="text-sm text-gray-600">{value || '-'}</span>
      ),
    },
    {
      header: 'Konstanta',
      accessor: 'qty_konstanta',
      align: 'right' as const,
      render: (value: number) => (
        <span className="font-semibold text-gray-900">{value}</span>
      ),
    },
    {
      header: 'Qty (Kg)',
      accessor: 'qty_lem',
      align: 'right' as const,
      render: (value: number) => (
        <span className="font-semibold text-gray-900">{value}</span>
      ),
    },
    {
      header: 'Stock',
      accessor: 'qty_stok',
      align: 'right' as const,
      bgColor: 'bg-green-50',
      render: (value: number, item: BOMPPICLem, index: number) => (
        <input
          type="text"
          value={getInputDisplayValue('lem', index, 'qty_stok', value)}
          onChange={(e) => onItemChange(index, 'qty_stok', e.target.value)}
          onBlur={() => handleInputBlur('lem', index, 'qty_stok')}
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
      render: (value: number, item: BOMPPICLem, index: number) => (
        <input
          type="text"
          value={getInputDisplayValue('lem', index, 'qty_beli', value)}
          onChange={(e) => onItemChange(index, 'qty_beli', e.target.value)}
          onBlur={() => handleInputBlur('lem', index, 'qty_beli')}
          className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium bg-white"
          placeholder="0"
        />
      ),
    },
  ];
  return (
    <MaterialTable
      title="Lem Materials"
      titleColor="bg-indigo-50 border-indigo-200"
      headerColor="bg-indigo-200"
      columns={columns}
      data={items}
    />
  );
};
export default LemSection;
