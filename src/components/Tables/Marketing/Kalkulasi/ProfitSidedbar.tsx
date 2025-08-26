import React from 'react';
import { KalkulasiFormData } from './KalkulasiModal';

interface ProfitSidebarProps {
  formData: KalkulasiFormData;
  onInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const ProfitSidebar: React.FC<ProfitSidebarProps> = ({
  formData,
  onInputChange,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col shadow-lg">
      {/* Sidebar Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
        <h2 className="text-xl font-bold flex items-center">
          <svg
            className="w-6 h-6 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
            />
          </svg>
          Kalkulasi Profit
        </h2>
      </div>

      {/* Profit Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Production Cost Section */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-4 flex items-center">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            Biaya Produksi
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Harga Produksi
              </label>
              <div className="bg-white px-2 py-1 rounded border text-sm font-semibold text-blue-600">
                Rp {Number(formData.harga_produksi).toLocaleString()}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Profit Harga
              </label>
              <div className="bg-white px-2 py-1 rounded border text-sm font-semibold text-green-600">
                Rp {Number(formData.profit_harga).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Selling Price Section */}
        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-4 flex items-center">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            Harga Jual
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Jumlah Harga Jual
              </label>
              <div className="bg-white px-2 py-1 rounded border text-sm font-semibold text-green-600">
                Rp {Number(formData.jumlah_harga_jual).toLocaleString()}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                PPN (11%)
              </label>
              <div className="bg-white px-2 py-1 rounded border text-sm font-semibold text-orange-600">
                Rp {Number(formData.harga_ppn).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Discount Section */}
        <div className="bg-orange-50 rounded-lg p-4">
          <h3 className="font-semibold text-orange-800 mb-4 flex items-center">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
            Diskon & Penyesuaian
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Diskon (%)
              </label>
              <input
                type="number"
                name="diskon"
                value={formData.diskon}
                onChange={onInputChange}
                className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                min="0"
                max="100"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Nilai Diskon
              </label>
              <div className="bg-white px-2 py-1 rounded border text-sm font-semibold text-red-600">
                Rp {Number(formData.harga_diskon).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Final Price Section */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4 border-2 border-purple-200">
          <h3 className="font-bold text-purple-800 mb-4 flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
            Total Akhir
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Total Harga
              </label>
              <div className="bg-white px-2 py-1 rounded border-2 border-purple-300 text-lg font-bold text-purple-700">
                Rp {Number(formData.total_harga).toLocaleString()}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Harga per Unit
              </label>
              <div className="bg-white px-2 py-1 rounded border text-sm font-semibold text-purple-600">
                Rp {Number(formData.harga_satuan).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Customer Price Highlight */}
        <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-lg p-4 border-2 border-yellow-300">
          <h3 className="font-bold text-yellow-800 mb-3 flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Harga untuk Customer
          </h3>
          <div className="bg-yellow-300 px-2 py-1 rounded-lg text-center">
            <div className="text-2xl font-bold text-yellow-900">
              Rp {Number(formData.total_harga_satuan_customer).toLocaleString()}
            </div>
            <div className="text-xs text-yellow-700 mt-1">per unit</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Ringkasan</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Quantity:</span>
              <span className="font-medium">
                {Number(formData.qty_kalkulasi).toLocaleString()} pcs
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Customer:</span>
              <span className="font-medium text-right max-w-32 truncate">
                {formData.nama_customer || '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Produk:</span>
              <span className="font-medium text-right max-w-32 truncate">
                {formData.nama_produk || '-'}
              </span>
            </div>
            {formData.diskon && Number(formData.diskon) > 0 && (
              <div className="flex justify-between text-orange-600">
                <span>Diskon:</span>
                <span className="font-medium">{formData.diskon}%</span>
              </div>
            )}
          </div>

          {/* Keterangan Harga */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-2 mt-4">
            <h4 className="text-xs font-semibold text-gray-800 mb-2 flex items-center">
              <svg
                className="w-4 h-4 mr-2 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Keterangan Harga
            </h4>
            <textarea
              name="keterangan_harga"
              value={formData.keterangan_harga}
              onChange={onInputChange}
              rows={4}
              className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-xs"
              placeholder="Masukkan keterangan Harga dan informasi tambahan..."
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <div className="space-y-3">
          <button
            type="submit"
            form="kalkulasi-form"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Menyimpan...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Simpan Kalkulasi
              </div>
            )}
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-center">
              <svg
                className="w-5 h-5 mr-2"
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
              Batal
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfitSidebar;
