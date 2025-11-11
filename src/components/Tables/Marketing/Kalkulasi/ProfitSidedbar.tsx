import React from 'react';
import { KalkulasiFormData } from './types/kalkulasi';
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
  isReadOnly?: boolean;
  copyType?: 'repeat' | 'repeat_perubahan';
  submitButtonText?: string;
}

const parseCurrencyForDisplay = (
  value: string | number | undefined,
): number => {
  if (typeof value === 'number') return value;
  if (!value || value === '') return 0;

  let cleanValue = value.toString();

  // Remove 'Rp' and spaces first
  cleanValue = cleanValue.replace(/Rp\s*/g, '');

  // Handle different number formats
  if (cleanValue.includes(',') && cleanValue.includes('.')) {
    // Format like "175.000,00" (European style) - dots for thousands, comma for decimal
    if (cleanValue.lastIndexOf(',') > cleanValue.lastIndexOf('.')) {
      cleanValue = cleanValue.replace(/\./g, '').replace(',', '.');
    }
    // Format like "8,395.625" (US style) - commas for thousands, dot for decimal
    else {
      cleanValue = cleanValue.replace(/,/g, '');
    }
  } else if (cleanValue.includes('.')) {
    // Check if it's likely a thousand separator or decimal
    const parts = cleanValue.split('.');
    if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
      // Multiple dots or last part has 3 digits = thousand separators
      cleanValue = cleanValue.replace(/\./g, '');
    }
  } else if (cleanValue.includes(',')) {
    // Only commas - could be thousand separator or decimal
    const parts = cleanValue.split(',');
    if (parts.length === 2 && parts[1].length <= 2) {
      // Likely decimal separator
      cleanValue = cleanValue.replace(',', '.');
    } else {
      // Likely thousand separator
      cleanValue = cleanValue.replace(/,/g, '');
    }
  }

  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
};

const ProfitSidebar: React.FC<ProfitSidebarProps> = ({
  formData,
  onInputChange,
  onSubmit,
  onCancel,
  isSubmitting,
  isReadOnly = false,
  copyType,
  submitButtonText = 'Simpan Kalkulasi',
}) => {
  const getSidebarColors = () => {
    if (copyType === 'repeat') {
      return {
        header: 'from-blue-600 to-blue-700',
        accent: 'blue',
        border: 'border-blue-200',
        bg: 'bg-blue-50',
      };
    }
    if (copyType === 'repeat_perubahan') {
      return {
        header: 'from-green-600 to-green-700',
        accent: 'green',
        border: 'border-green-200',
        bg: 'bg-green-50',
      };
    }
    return {
      header: 'from-green-600 to-green-700',
      accent: 'blue',
      border: 'border-gray-200',
      bg: 'bg-white',
    };
  };

  const colors = getSidebarColors();

  const getInputClassName = (baseClassName: string) => {
    if (isReadOnly) {
      return `${baseClassName} bg-gray-100 cursor-not-allowed`;
    }
    return baseClassName;
  };

  const getFormId = () => {
    return copyType ? 'copy-kalkulasi-form' : 'kalkulasi-form';
  };

  return (
    <div
      className={`w-80 ${colors.bg} border-l ${colors.border} flex flex-col shadow-lg h-screen overflow-y-auto pb-3`}
    >
      {/* Header with conditional styling */}
      <div className={`bg-gradient-to-r ${colors.header} text-white p-3`}>
        <h2 className="text-lg font-bold flex items-center">
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
          Kalkulasi Profit
        </h2>
        {isReadOnly && (
          <p className="text-sm text-white/80 mt-1">Mode View Only</p>
        )}
      </div>

      {/* Compact Info Table */}
      <div className="flex-1 p-4 space-y-3">
        {/* Basic Info */}
        <div className="bg-gray-50 rounded-lg p-2">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">
            Info Dasar
          </h3>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
            <div className="font-medium text-gray-600">Customer:</div>
            <div className="text-right truncate">
              {formData.nama_customer || '-'}
            </div>
            <div className="font-medium text-gray-600">Produk:</div>
            <div className="text-right truncate">
              {formData.nama_produk || '-'}
            </div>
            <div className="font-medium text-gray-600">Qty:</div>
            <div className="text-right font-medium">
              {Number(formData.qty_kalkulasi).toLocaleString()} pcs
            </div>
          </div>
        </div>

        {/* Financial Data Table */}
        <div className="bg-white border rounded-lg">
          <div className="bg-gray-100 px-3 py-2 border-b">
            <h3 className="text-sm font-semibold text-gray-800">
              Detail Keuangan
            </h3>
          </div>

          <div className="p-3">
            <table className="w-full text-xs">
              <tbody className="space-y-1">
                <tr className="border-b border-gray-100">
                  <td className="py-1 font-medium text-gray-600">
                    Harga Produksi
                  </td>
                  <td className="py-1 text-right font-semibold text-blue-600">
                    Rp{' '}
                    {parseCurrencyForDisplay(
                      formData.harga_produksi,
                    ).toLocaleString()}
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-1 font-medium text-gray-600">
                    Profit (%) - Input
                  </td>
                  <td className="py-1 text-right">
                    <input
                      type="number"
                      name="profit"
                      value={formData.profit}
                      onChange={onInputChange}
                      readOnly={isReadOnly}
                      className={getInputClassName(
                        'w-16 px-1 py-0.5 text-xs border border-gray-300 rounded text-right focus:ring-1 focus:ring-green-500',
                      )}
                      min="0"
                      step="0.01"
                    />
                    <span className="text-xs text-gray-500 ml-1">%</span>
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-1 font-medium text-gray-600">
                    Profit Harga
                  </td>
                  <td className="py-1 text-right font-semibold text-green-600">
                    Rp{' '}
                    {parseCurrencyForDisplay(
                      formData.profit_harga,
                    ).toLocaleString()}
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-1 font-medium text-gray-600">Harga Jual</td>
                  <td className="py-1 text-right font-semibold text-green-600">
                    Rp{' '}
                    {parseCurrencyForDisplay(
                      formData.jumlah_harga_jual,
                    ).toLocaleString()}
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-1 font-medium text-gray-600">PPN (%)</td>
                  <td className="py-1 text-right">
                    <input
                      type="number"
                      name="ppn"
                      value={formData.ppn}
                      onChange={onInputChange}
                      readOnly={isReadOnly}
                      className={getInputClassName(
                        'w-16 px-1 py-0.5 text-xs border border-gray-300 rounded text-right focus:ring-1 focus:ring-orange-500',
                      )}
                      min="0"
                      max="100"
                      step="0.01"
                    />
                    <span className="text-xs text-gray-500 ml-1">%</span>
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-1 font-medium text-gray-600">Nilai PPN</td>
                  <td className="py-1 text-right font-semibold text-orange-600">
                    Rp{' '}
                    {parseCurrencyForDisplay(
                      formData.harga_ppn,
                    ).toLocaleString()}
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-1 font-medium text-gray-600">Diskon (%)</td>
                  <td className="py-1 text-right">
                    <input
                      type="number"
                      name="diskon"
                      value={formData.diskon}
                      onChange={onInputChange}
                      readOnly={isReadOnly}
                      className={getInputClassName(
                        'w-16 px-1 py-0.5 text-xs border border-gray-300 rounded text-right focus:ring-1 focus:ring-orange-500',
                      )}
                      min="0"
                      max="100"
                      step="0.01"
                    />
                    <span className="text-xs text-gray-500 ml-1">%</span>
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-1 font-medium text-gray-600">
                    Nilai Diskon
                  </td>
                  <td className="py-1 text-right font-semibold text-red-600">
                    Rp{' '}
                    {parseCurrencyForDisplay(
                      formData.harga_diskon,
                    ).toLocaleString()}
                  </td>
                </tr>
                <tr className="bg-blue-50 border-b-2 border-blue-200">
                  <td className="py-2 font-bold text-blue-800">Total Harga</td>
                  <td className="py-2 text-right font-bold text-lg text-blue-800">
                    Rp{' '}
                    {parseCurrencyForDisplay(
                      formData.total_harga,
                    ).toLocaleString()}
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-1 font-medium text-gray-600">
                    Harga per PCS
                  </td>
                  <td className="py-1 text-right font-semibold text-purple-600">
                    Rp{' '}
                    {parseCurrencyForDisplay(
                      formData.harga_satuan,
                    ).toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Manual Customer Price Input */}
        <div
          className={`rounded-lg p-3 border ${
            isReadOnly
              ? 'bg-gray-100 border-gray-300'
              : 'bg-gradient-to-r from-yellow-100 to-yellow-200 border-yellow-300'
          }`}
        >
          <div className="space-y-2">
            <label
              className={`block text-xs font-medium ${
                isReadOnly ? 'text-gray-600' : 'text-yellow-800'
              }`}
            >
              Harga untuk Customer (per pcs)
            </label>
            <div className="flex items-center space-x-2">
              <span
                className={`text-sm font-medium ${
                  isReadOnly ? 'text-gray-600' : 'text-yellow-800'
                }`}
              >
                Rp
              </span>
              <input
                type="number"
                name="total_harga_satuan_customer"
                // value={formData.total_harga_satuan_customer || ''}
                onChange={onInputChange}
                readOnly={isReadOnly}
                className={getInputClassName(
                  `flex-1 px-2 py-1 text-sm border ${
                    isReadOnly
                      ? 'border-gray-300'
                      : 'border-yellow-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent'
                  } rounded bg-white text-right font-semibold`,
                )}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
            <div
              className={`text-xs text-center ${
                isReadOnly ? 'text-gray-500' : 'text-yellow-700'
              }`}
            >
              {isReadOnly
                ? 'Harga satuan untuk customer'
                : 'Masukkan harga Satuan untuk customer'}
            </div>
          </div>
        </div>

        {/* Keterangan Harga */}
        <div className="bg-gray-50 rounded-lg p-3">
          <label className="block text-xs font-medium text-gray-800 mb-1">
            Keterangan Harga
          </label>
          <textarea
            name="keterangan_harga"
            value={formData.keterangan_harga}
            onChange={onInputChange}
            readOnly={isReadOnly}
            rows={3}
            className={getInputClassName(
              'w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent',
            )}
            placeholder={
              isReadOnly ? 'Tidak ada keterangan' : 'Informasi tambahan...'
            }
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="space-y-2">
          <button
            type="submit"
            form={getFormId()}
            disabled={isSubmitting}
            className={`w-full font-semibold py-2 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm ${
              copyType === 'repeat'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
                : copyType === 'repeat_perubahan'
                ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
              submitButtonText
            )}
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isReadOnly ? 'Tutup' : 'Batal'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfitSidebar;
