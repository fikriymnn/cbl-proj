// components/SODetailPopup.tsx
import React from 'react';
import { SOData } from './types/SOTypes';

interface SODetailPopupProps {
  isOpen: boolean;
  onClose: () => void;
  data: SOData | null;
}

const SODetailPopup: React.FC<SODetailPopupProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  if (!isOpen || !data) return null;

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Detail Sales Order</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            type="button"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Row 1 */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Tanggal Input PO
              </label>
              <div className="w-full p-2 border border-gray-200 rounded bg-gray-50">
                {formatDate(data.tgl_input_po)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Nomor SO
              </label>
              <div className="w-full p-2 border border-gray-200 rounded bg-gray-50">
                {data.no_so || '-'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Nomor IO
              </label>
              <div className="w-full p-2 border border-gray-200 rounded bg-gray-50">
                {data.no_io || '-'}
              </div>
            </div>

            {/* Row 2 */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                SO Cancel
              </label>
              <div className="w-full p-2 border border-gray-200 rounded bg-gray-50">
                {data.so_cancel || '-'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                No Booking
              </label>
              <div className="w-full p-2 border border-gray-200 rounded bg-gray-50">
                {data.no_booking || '-'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Status Job Order
              </label>
              <div className="w-full p-2 border border-gray-200 rounded bg-gray-50">
                {data.status_jo || '-'}
              </div>
            </div>

            {/* Row 3 */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Customer
              </label>
              <div className="w-full p-2 border border-gray-200 rounded bg-gray-50">
                {data.customer || '-'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Produk
              </label>
              <div className="w-full p-2 border border-gray-200 rounded bg-gray-50">
                {data.produk || '-'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Status Produk
              </label>
              <div className="w-full p-2 border border-gray-200 rounded bg-gray-50">
                {data.status_produk || '-'}
              </div>
            </div>

            {/* Row 4 */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Tanggal Acc Customer
              </label>
              <div className="w-full p-2 border border-gray-200 rounded bg-gray-50">
                {formatDate(data.tgl_acc_customer)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Tanggal PO Customer
              </label>
              <div className="w-full p-2 border border-gray-200 rounded bg-gray-50">
                {formatDate(data.tgl_po_customer)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                PO Qty
              </label>
              <div className="w-full p-2 border border-gray-200 rounded bg-gray-50">
                {data.po_qty?.toLocaleString('id-ID') || '0'}
              </div>
            </div>

            {/* Row 5 */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Harga Jual
              </label>
              <div className="w-full p-2 border border-gray-200 rounded bg-gray-50">
                {formatCurrency(data.harga_jual || 0)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Total Harga
              </label>
              <div className="w-full p-2 border border-gray-200 rounded bg-gray-50 font-semibold">
                {formatCurrency(data.total_harga)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                PPN
              </label>
              <div className="w-full p-2 border border-gray-200 rounded bg-gray-50">
                {data.ppn || '-'}
              </div>
            </div>

            {/* Row 6 */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Profit
              </label>
              <div className="w-full p-2 border border-gray-200 rounded bg-gray-50">
                {data.profit || 0}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Tanggal Pengiriman
              </label>
              <div className="w-full p-2 border border-gray-200 rounded bg-gray-50">
                {formatDate(data.tgl_pengiriman)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Nomor PO Customer
              </label>
              <div className="w-full p-2 border border-gray-200 rounded bg-gray-50">
                {data.no_po_customer || '-'}
              </div>
            </div>

            {/* Row 7 */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Alamat Pengiriman
              </label>
              <div className="w-full p-2 border border-gray-200 rounded bg-gray-50">
                {data.alamat_pengiriman || '-'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Keterangan
              </label>
              <div className="w-full p-2 border border-gray-200 rounded bg-gray-50">
                {data.keterangan || '-'}
              </div>
            </div>

            {/* Row 8 */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Ada Standar Warna
              </label>
              <div className="w-full p-2 border border-gray-200 rounded bg-gray-50">
                {data.ada_standar_warna || '-'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                IO Selesai
              </label>
              <div className="w-full p-2 border border-gray-200 rounded bg-gray-50">
                {data.is_io_selesai ? 'Ya' : 'Tidak'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Status
              </label>
              <div className="w-full p-2">
                <span
                  className={`text-xs px-2 py-1 rounded font-medium uppercase ${
                    data.status === 'draft'
                      ? 'bg-yellow-100 text-yellow-800'
                      : data.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {data.status}
                </span>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="flex justify-end mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SODetailPopup;
