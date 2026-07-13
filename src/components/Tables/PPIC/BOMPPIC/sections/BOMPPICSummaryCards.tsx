import React from 'react';
import {
  BOMPPICKertas,
  BOMPPICTinta,
  BOMPPICCorrugated,
  BOMPPICPoliban,
  BOMPPICCoating,
  BOMPPICLem,
} from '../Types/bompiic.types';

interface BOMPPICSummaryCardsProps {
  kertasItems: BOMPPICKertas[];
  tintaItems: BOMPPICTinta[];
  corrugatedItems: BOMPPICCorrugated[];
  polibanItems: BOMPPICPoliban[];
  coatingItems: BOMPPICCoating[];
  lemItems: BOMPPICLem[];
  qtyPo: number;
  qtyFgDisplayValue: string;
  onQtyFgChange: (value: string) => void;
  onQtyFgBlur: () => void;
  tglRencanaCetak: string;
  onTglRencanaCetakChange: (value: string) => void;
}

const formatNumber = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
};

const BOMPPICSummaryCards: React.FC<BOMPPICSummaryCardsProps> = ({
  kertasItems,
  tintaItems,
  corrugatedItems,
  polibanItems,
  coatingItems,
  lemItems,
  qtyPo,
  qtyFgDisplayValue,
  onQtyFgBlur,
  onQtyFgChange,
  tglRencanaCetak,
  onTglRencanaCetakChange,
}) => {
  const totalItems =
    kertasItems.length +
    tintaItems.length +
    corrugatedItems.length +
    polibanItems.length +
    coatingItems.length +
    lemItems.length;

  const totalStock =
    kertasItems.reduce((sum, item) => sum + item.qty_stok, 0) +
    corrugatedItems.reduce((sum, item) => sum + item.qty_stok, 0) +
    polibanItems.reduce((sum, item) => sum + item.qty_stok, 0) +
    // ✅ FIXED: coating is now a single flat row per id_coating with
    // qty_stok, same as every other material — no more depan/belakang split.
    coatingItems.reduce((sum, item) => sum + item.qty_stok, 0) +
    lemItems.reduce((sum, item) => sum + item.qty_stok, 0) +
    tintaItems.reduce(
      (sum, tinta) =>
        sum + tinta.tinta_detail.reduce((s, detail) => s + detail.qty_stok, 0),
      0,
    );

  const totalPurchase =
    kertasItems.reduce((sum, item) => sum + item.qty_beli, 0) +
    corrugatedItems.reduce((sum, item) => sum + item.qty_beli, 0) +
    polibanItems.reduce((sum, item) => sum + item.qty_beli, 0) +
    // ✅ FIXED: same as above, use the single qty_beli field.
    coatingItems.reduce((sum, item) => sum + item.qty_beli, 0) +
    lemItems.reduce((sum, item) => sum + item.qty_beli, 0) +
    tintaItems.reduce(
      (sum, tinta) =>
        sum + tinta.tinta_detail.reduce((s, detail) => s + detail.qty_beli, 0),
      0,
    );

  return (
    <div className="grid grid-cols-3 gap-3 py-2">
      {' '}
      {/* 3 columns, smaller gap and padding */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-2 rounded-md border border-blue-200 shadow-sm">
        {' '}
        {/* Smaller padding */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-blue-600 font-medium">Materials</p>
            <p className="text-lg font-bold text-blue-900">{totalItems}</p>{' '}
            {/* Smaller text */}
          </div>
          <div className="bg-blue-200 p-2 rounded-full">
            {' '}
            {/* Smaller icon container */}
            <svg
              className="w-4 h-4 text-blue-600" /* Smaller icon */
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-br from-green-50 to-green-100 p-2 rounded-md border border-green-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-green-600 font-medium">Stock</p>
            <p className="text-lg font-bold text-green-900">
              {formatNumber(totalStock)}
            </p>
          </div>
          <div className="bg-green-200 p-2 rounded-full">
            <svg
              className="w-4 h-4 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-2 rounded-md border border-orange-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-orange-600 font-medium">Purchase</p>
            <p className="text-lg font-bold text-orange-900">
              {formatNumber(totalPurchase)}
            </p>
          </div>
          <div className="bg-orange-200 p-2 rounded-full">
            <svg
              className="w-4 h-4 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 pb-2 col-span-3">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-2 rounded-md border border-gray-300 shadow-sm">
          <p className="text-xs text-gray-600 font-medium">Qty PO</p>
          <p className="text-lg font-bold text-gray-900">
            {formatNumber(qtyPo)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-rose-50 to-rose-100 p-2 rounded-md border border-rose-300 shadow-sm">
          <p className="text-xs text-rose-600 font-medium mb-1">Qty FG</p>
          <input
            type="text"
            value={qtyFgDisplayValue}
            onChange={(e) => onQtyFgChange(e.target.value)}
            onBlur={onQtyFgBlur}
            className="w-full px-2 py-1 border border-rose-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm font-bold bg-white text-rose-900"
            placeholder="0"
          />
        </div>
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-2 rounded-md border border-indigo-300 shadow-sm">
          <p className="text-xs text-indigo-600 font-medium mb-1">
            Tgl Rencana Cetak
          </p>
          <input
            type="date"
            value={tglRencanaCetak}
            onChange={(e) => onTglRencanaCetakChange(e.target.value)}
            className="w-full px-2 py-1 border border-indigo-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold bg-white text-indigo-900"
          />
        </div>
      </div>
    </div>
  );
};

export default BOMPPICSummaryCards;
