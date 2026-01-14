import React from 'react';
import { BOMPPICKertas } from '../../Types/bompiic.types';
import { MaterialTable } from '../common/MaterialTable';

interface KertasSectionProps {
  items: BOMPPICKertas[];
  onItemChange: (
    index: number,
    field: keyof BOMPPICKertas,
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

const KertasSection: React.FC<KertasSectionProps> = ({
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
      header: 'Nama Kertas',
      accessor: 'nama_kertas',
      render: (value: string) => (
        <span className="text-gray-900 font-medium">{value}</span>
      ),
    },
    {
      header: 'Qty Lembar Plano',
      accessor: 'qty_lembar_plano',
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
      render: (value: number, item: BOMPPICKertas, index: number) => (
        <input
          type="text"
          value={getInputDisplayValue('kertas', index, 'qty_stok', value)}
          onChange={(e) => onItemChange(index, 'qty_stok', e.target.value)}
          onBlur={() => handleInputBlur('kertas', index, 'qty_stok')}
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
      render: (value: number, item: BOMPPICKertas, index: number) => (
        <input
          type="text"
          value={getInputDisplayValue('kertas', index, 'qty_beli', value)}
          onChange={(e) => onItemChange(index, 'qty_beli', e.target.value)}
          onBlur={() => handleInputBlur('kertas', index, 'qty_beli')}
          className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium bg-white"
          placeholder="0"
        />
      ),
    },
  ];

  return (
    <MaterialTable
      title="Kertas Materials"
      titleColor="bg-blue-50 border-blue-200"
      headerColor="bg-blue-200"
      columns={columns}
      data={items}
    />
  );
};

export default KertasSection;
