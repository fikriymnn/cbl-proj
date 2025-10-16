import React from 'react';
import { BOMPPICCorrugated } from '../../Types/bompiic.types';
import { MaterialTable } from '../common/MaterialTable';

interface CorrugatedSectionProps {
  items: BOMPPICCorrugated[];
  onItemChange: (
    index: number,
    field: keyof BOMPPICCorrugated,
    value: string | number,
  ) => void;
  formatNumber: (value: number | string) => string;
}

const CorrugatedSection: React.FC<CorrugatedSectionProps> = ({
  items,
  onItemChange,
  formatNumber,
}) => {
  if (items.length === 0) return null;

  const columns = [
    {
      header: 'No',
      accessor: 'no',
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      header: 'Nama Corrugated',
      accessor: 'nama_corrugated',
      render: (value: string) => (
        <span className="text-gray-900 font-medium">{value}</span>
      ),
    },
    {
      header: 'Isi Per Pack',
      accessor: 'isi_per_pack',
      align: 'right' as const,
      render: (value: number) => (
        <span className="font-semibold text-gray-900">
          {formatNumber(value)}
        </span>
      ),
    },
    {
      header: 'Qty',
      accessor: 'qty_corrugated',
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
      render: (value: number, item: BOMPPICCorrugated, index: number) => (
        <input
          type="text"
          value={formatNumber(value)}
          onChange={(e) => onItemChange(index, 'qty_stok', e.target.value)}
          className="w-full px-3 py-2  border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-medium bg-white"
          placeholder="0"
        />
      ),
    },
    {
      header: 'Beli',
      accessor: 'qty_beli',
      align: 'right' as const,
      bgColor: 'bg-orange-50',
      render: (value: number, item: BOMPPICCorrugated, index: number) => (
        <input
          type="text"
          value={formatNumber(value)}
          onChange={(e) => onItemChange(index, 'qty_beli', e.target.value)}
          className="w-full px-3 py-2  border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium bg-white"
          placeholder="0"
        />
      ),
    },
  ];

  return (
    <MaterialTable
      title="Corrugated Materials"
      titleColor="bg-yellow-50 border-yellow-200"
      headerColor="bg-yellow-200"
      columns={columns}
      data={items}
    />
  );
};

export default CorrugatedSection;
