import React, { useState } from 'react';
// Tab 1 (Penjualan): komponen existing, TIDAK diubah sama sekali
import ListApprovingPenjualan from './ListApprovingInvoice';
// Tab 2 (Pembelian): bukti bayar AP + approve — sesuaikan path ke folder AP

import ListInvoiceAP from '../InvoiceAP/ListInvoiceAP';

type TabKey = 'penjualan' | 'pembelian';

const TABS: ReadonlyArray<readonly [TabKey, string]> = [
  ['penjualan', 'Penjualan'],
  ['pembelian', 'Pembelian'],
];

const ListApprovingInvoiceTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('penjualan');

  return (
    <div>
      <div className="flex gap-2 mb-4 border-b border-gray-200">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 text-sm font-semibold -mb-px border-b-2 transition-colors ${
              activeTab === key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'penjualan' ? (
        <ListApprovingPenjualan />
      ) : (
        <ListInvoiceAP mode={'approval'} />
      )}
    </div>
  );
};

export default ListApprovingInvoiceTabs;
