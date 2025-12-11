import React, { useState } from 'react';
import { PerubahanFormData } from '../../Marketing/CreatePerubahan';

interface PerubahanDetailModalProps {
  isOpen: boolean;
  formData: PerubahanFormData;
  onClose: () => void;
}

const PerubahanDetailModal: React.FC<PerubahanDetailModalProps> = ({
  isOpen,
  formData,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<number>(1);

  if (!isOpen) return null;

  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">
            Detail Perubahan Invoice
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Modal Body with Tabs */}
        <div className="flex-1 overflow-auto">
          {/* Tabs */}
          <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
            <div className="flex px-6">
              <button
                onClick={() => setActiveTab(1)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 1
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Informasi Utama
              </button>
              <button
                onClick={() => setActiveTab(2)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 2
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Data Perubahan
              </button>
              <button
                onClick={() => setActiveTab(3)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 3
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Produk & Bukti
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Tab 1 - Main Info */}
            {activeTab === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nomor Pengajuan
                    </label>
                    <input
                      type="text"
                      value={formData.no_perubahan_invoice}
                      disabled
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nomor Invoice
                    </label>
                    <input
                      type="text"
                      value={formData.no_invoice}
                      disabled
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tgl Invoice
                    </label>
                    <input
                      type="date"
                      value={formatDateForInput(formData.tgl_invoice)}
                      disabled
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nomor PO
                    </label>
                    <input
                      type="text"
                      value={formData.no_po}
                      disabled
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <input
                      type="text"
                      value="requested"
                      disabled
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pelanggan
                    </label>
                    <input
                      type="text"
                      value={formData.nama_customer}
                      disabled
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alamat
                    </label>
                    <textarea
                      value={formData.alamat}
                      disabled
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-100 text-gray-600 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal Pengajuan
                    </label>
                    <input
                      type="date"
                      value={formatDateForInput(new Date().toISOString())}
                      disabled
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2 - Data Lama & Baru */}
            {activeTab === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Data Lama (Left) */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 pb-2 border-b">
                    Data Lama
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Alamat Customer
                      </label>
                      <textarea
                        value={formData.alamat}
                        disabled
                        rows={3}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-100 text-gray-600 resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tanggal Faktur
                      </label>
                      <input
                        type="date"
                        value={formatDateForInput(formData.tgl_faktur)}
                        disabled
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Data Baru (Right) */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 pb-2 border-b">
                    Data Baru
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Alamat Customer
                      </label>
                      <textarea
                        value={formData.new_alamat}
                        disabled
                        rows={3}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-100 text-gray-600 resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tanggal Faktur
                      </label>
                      <input
                        type="date"
                        value={formatDateForInput(formData.new_tgl_faktur)}
                        disabled
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3 - Products & File Upload */}
            {activeTab === 3 && (
              <div className="space-y-6">
                {/* Products Table */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Produk
                  </h3>
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Produk
                          </th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                            Qty Lama
                          </th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                            Harga Lama
                          </th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                            Qty Baru
                          </th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                            Harga Baru
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {formData.perubahan_invoice_produk.map(
                          (prod, index) => (
                            <tr key={index}>
                              <td className="px-3 py-2 text-xs text-gray-900">
                                {prod.nama_produk}
                              </td>
                              <td className="px-3 py-2 text-center">
                                <input
                                  type="number"
                                  value={prod.qty}
                                  disabled
                                  className="w-24 px-2 py-1 text-xs text-center border border-gray-300 rounded bg-gray-100 text-gray-600"
                                />
                              </td>
                              <td className="px-3 py-2 text-center">
                                <input
                                  type="number"
                                  value={prod.harga}
                                  disabled
                                  className="w-28 px-2 py-1 text-xs text-center border border-gray-300 rounded bg-gray-100 text-gray-600"
                                />
                              </td>
                              <td className="px-3 py-2 text-center">
                                <input
                                  type="number"
                                  value={prod.new_qty}
                                  disabled
                                  className="w-24 px-2 py-1 text-xs text-center border border-gray-300 rounded bg-gray-100 text-gray-600"
                                />
                              </td>
                              <td className="px-3 py-2 text-center">
                                <input
                                  type="number"
                                  value={prod.new_harga}
                                  disabled
                                  className="w-28 px-2 py-1 text-xs text-center border border-gray-300 rounded bg-gray-100 text-gray-600"
                                />
                              </td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* File & Note Display */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bukti permintaan perubahan data
                    </label>

                    {formData.file && (
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            File Bukti:
                          </span>
                        </div>
                        <img
                          src={`${import.meta.env.VITE_API_LINK}/images/${
                            formData.file
                          }`}
                          alt="Bukti perubahan"
                          className="max-w-full h-48 object-contain border border-gray-200 rounded"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <p className="text-sm text-gray-500 mt-2">
                          {formData.file}
                        </p>
                      </div>
                    )}

                    {!formData.file && (
                      <div className="border border-gray-200 rounded-lg p-4 text-center text-gray-500">
                        Tidak ada file
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Catatan
                    </label>
                    <textarea
                      value={formData.note}
                      disabled
                      rows={3}
                      placeholder="Tidak ada catatan"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-100 text-gray-600 resize-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PerubahanDetailModal;
