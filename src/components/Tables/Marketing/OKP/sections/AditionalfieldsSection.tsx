import React, { useState } from 'react';
import { OKPFormData } from '../types';

interface AdditionalFieldsSectionProps {
  formData: OKPFormData;
  handleInputChange: (field: keyof OKPFormData, value: any) => void;
  disabled: boolean;
}

const AdditionalFieldsSection: React.FC<AdditionalFieldsSectionProps> = ({
  formData,
  handleInputChange,
  disabled,
}) => {
  const [showHistoricalProcesses, setShowHistoricalProcesses] = useState(false);

  // Format date for input (convert from various formats to YYYY-MM-DD)
  const formatDateForInput = (dateValue: string) => {
    if (!dateValue) return '';

    // If it's already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return dateValue;
    }

    // Try to parse and format other date formats
    try {
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch (error) {
      console.warn('Invalid date format:', dateValue);
    }

    return '';
  };

  // Format number with thousand separators
  const formatNumber = (value: number | string) => {
    const num = Number(value);
    if (isNaN(num)) return '0';
    return num.toLocaleString('id-ID'); // Indonesian number format
  };

  // Handle number input change
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    // Allow only numbers and thousand separators
    const cleanValue = rawValue.replace(/[^\d]/g, '');
    const numericValue = parseInt(cleanValue) || 0;
    handleInputChange('rencana_qty_po', numericValue);
  };

  // Ensure valid option values
  const getValidStatusPO = (value: string) => {
    const validOptions = ['tidak', 'ada'];
    return validOptions.includes(value) ? value : 'tidak';
  };

  const getValidKeteranganCetak = (value: string) => {
    const validOptions = ['in house', 'outsource'];
    return validOptions.includes(value) ? value : '';
  };

  // Format date for display
  const formatDateForDisplay = (dateValue: string) => {
    if (!dateValue) return '-';

    try {
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('id-ID', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
      }
    } catch (error) {
      console.warn('Invalid date format:', dateValue);
    }

    return dateValue;
  };

  // Separate active and non-active OKP processes
  const activeOkpProcesses =
    formData.okp_proses?.filter(
      (process: any) => process.status === 'active',
    ) || [];

  const nonActiveOkpProcesses =
    formData.okp_proses?.filter(
      (process: any) => process.status === 'non active',
    ) || [];

  // Render process table
  const renderProcessTable = (processes: any[], isActive: boolean = true) => (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className={`${isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
          <tr>
            <th className="px-3 py-2 text-left font-medium text-gray-700 border-b">
              Process
            </th>
            <th className="px-3 py-2 text-left font-medium text-gray-700 border-b">
              Date
            </th>
            <th className="px-3 py-2 text-left font-medium text-gray-700 border-b">
              User
            </th>
            <th className="px-3 py-2 text-left font-medium text-gray-700 border-b">
              Note
            </th>
          </tr>
        </thead>
        <tbody>
          {processes.map((process: any, processIndex: number) => {
            const rows = [];

            // Design Process Row
            if (
              process.tgl_okp_desain ||
              process.user_desain ||
              process.note_okp_desain
            ) {
              rows.push(
                <tr
                  key={`${process.id}-design`}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-3 py-2 font-medium text-blue-700">
                    Design
                  </td>
                  <td className="px-3 py-2">
                    {formatDateForDisplay(process.tgl_okp_desain)}
                  </td>
                  <td className="px-3 py-2">
                    {process.user_desain
                      ? `${process.user_desain.nama} (${process.user_desain.bagian})`
                      : '-'}
                  </td>
                  <td
                    className="px-3 py-2 max-w-xs truncate"
                    title={process.note_okp_desain}
                  >
                    {process.note_okp_desain || '-'}
                  </td>
                </tr>,
              );
            }

            // QA Process Row
            if (
              process.tgl_terima_qa ||
              process.user_qa ||
              process.note_terima_qa
            ) {
              rows.push(
                <tr
                  key={`${process.id}-qa`}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-3 py-2 font-medium text-purple-700">QA</td>
                  <td className="px-3 py-2">
                    {formatDateForDisplay(process.tgl_terima_qa)}
                  </td>
                  <td className="px-3 py-2">
                    {process.user_qa
                      ? `${process.user_qa.nama} (${process.user_qa.bagian})`
                      : '-'}
                  </td>
                  <td
                    className="px-3 py-2 max-w-xs truncate"
                    title={process.note_terima_qa}
                  >
                    {process.note_terima_qa || '-'}
                  </td>
                </tr>,
              );
            }

            // Marketing Process Row
            if (
              process.tgl_terima_marketing ||
              process.user_terima_marketing ||
              process.note_terima_marketing
            ) {
              rows.push(
                <tr
                  key={`${process.id}-marketing`}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-3 py-2 font-medium text-orange-700">
                    Marketing
                  </td>
                  <td className="px-3 py-2">
                    {formatDateForDisplay(process.tgl_terima_marketing)}
                  </td>
                  <td className="px-3 py-2">
                    {process.user_terima_marketing
                      ? `${process.user_terima_marketing.nama} (${process.user_terima_marketing.bagian})`
                      : '-'}
                  </td>
                  <td
                    className="px-3 py-2 max-w-xs truncate"
                    title={process.note_terima_marketing}
                  >
                    {process.note_terima_marketing || '-'}
                  </td>
                </tr>,
              );
            }

            // Customer Process Row
            if (
              process.tgl_acc_customer ||
              process.user_acc_customer ||
              process.note_acc_customer
            ) {
              rows.push(
                <tr
                  key={`${process.id}-customer`}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-3 py-2 font-medium text-green-700">
                    Customer
                  </td>
                  <td className="px-3 py-2">
                    {formatDateForDisplay(process.tgl_acc_customer)}
                  </td>
                  <td className="px-3 py-2">
                    {process.user_acc_customer
                      ? `${process.user_acc_customer.nama} (${process.user_acc_customer.bagian})`
                      : '-'}
                  </td>
                  <td
                    className="px-3 py-2 max-w-xs truncate"
                    title={process.note_acc_customer}
                  >
                    {process.note_acc_customer || '-'}
                  </td>
                </tr>,
              );
            }

            // Reject Process Row
            if (
              process.tgl_reject ||
              process.user_reject ||
              process.note_reject
            ) {
              rows.push(
                <tr
                  key={`${process.id}-reject`}
                  className="border-b border-gray-100 hover:bg-red-50 bg-red-25"
                >
                  <td className="px-3 py-2 font-medium text-red-700">
                    Reject{' '}
                    {process.bagian_reject && `(${process.bagian_reject})`}
                  </td>
                  <td className="px-3 py-2">
                    {formatDateForDisplay(process.tgl_reject)}
                  </td>
                  <td className="px-3 py-2">
                    {process.user_reject
                      ? `${process.user_reject.nama} (${process.user_reject.bagian})`
                      : '-'}
                  </td>
                  <td
                    className="px-3 py-2 max-w-xs truncate"
                    title={process.note_reject}
                  >
                    {process.note_reject || '-'}
                  </td>
                </tr>,
              );
            }

            // Add separator between different processes if there are multiple
            if (processIndex < processes.length - 1 && rows.length > 0) {
              rows.push(
                <tr key={`separator-${process.id}`}>
                  <td colSpan={4} className="px-3 py-1">
                    <div
                      className={`border-t-2 ${
                        isActive ? 'border-green-200' : 'border-gray-300'
                      }`}
                    ></div>
                  </td>
                </tr>,
              );
            }

            return rows;
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rencana Qty PO
        </label>
        {disabled ? (
          <div className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600">
            {formatNumber(formData.rencana_qty_po || 0)}
          </div>
        ) : (
          <input
            type="text"
            value={formatNumber(formData.rencana_qty_po || 0)}
            onChange={handleNumberChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="0"
          />
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rencana Tanggal Kirim
        </label>
        <input
          type="date"
          value={formatDateForInput(formData.rencana_tgl_kirim)}
          onChange={(e) =>
            handleInputChange('rencana_tgl_kirim', e.target.value)
          }
          className={`w-full p-2 border border-gray-300 rounded-md ${
            disabled ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : ''
          }`}
          disabled={disabled}
          readOnly={disabled}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Status PO
        </label>
        <select
          value={getValidStatusPO(formData.status_po)}
          onChange={(e) => handleInputChange('status_po', e.target.value)}
          className={`w-full p-2 border border-gray-300 rounded-md ${
            disabled ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : ''
          }`}
          disabled={disabled}
        >
          <option value="tidak">Tidak</option>
          <option value="ada">Ada</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Keterangan Cetak
        </label>
        <select
          value={getValidKeteranganCetak(formData.keterangan_cetak)}
          onChange={(e) =>
            handleInputChange('keterangan_cetak', e.target.value)
          }
          className={`w-full p-2 border border-gray-300 rounded-md ${
            disabled ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : ''
          }`}
          disabled={disabled}
        >
          <option value="">Select Option</option>
          <option value="in house">In House</option>
          <option value="outsource">Outsource</option>
        </select>
      </div>

      {/* Active OKP Processes Table */}
      {activeOkpProcesses.length > 0 && (
        <div className="mt-6 bg-white rounded-lg border border-green-200 md:col-span-2 lg:col-span-4">
          <div className="px-4 py-3 bg-green-50 rounded-t-lg border-b border-green-200">
            <h3 className="text-lg font-medium text-gray-800 flex items-center">
              <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              Active OKP Process
            </h3>
          </div>
          <div className="p-4">
            {renderProcessTable(activeOkpProcesses, true)}
          </div>
        </div>
      )}

      {/* Historical/Non-Active OKP Processes Table */}
      {nonActiveOkpProcesses.length > 0 && (
        <div className="mt-6 bg-white rounded-lg border border-gray-200 md:col-span-2 lg:col-span-4">
          <div
            className="px-4 py-3 bg-gray-50 rounded-t-lg border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => setShowHistoricalProcesses(!showHistoricalProcesses)}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-800 flex items-center">
                <span className="inline-block w-3 h-3 bg-gray-400 rounded-full mr-2"></span>
                Historical OKP Processes ({nonActiveOkpProcesses.length})
              </h3>
              <svg
                className={`w-5 h-5 transform transition-transform text-gray-600 ${
                  showHistoricalProcesses ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {showHistoricalProcesses && (
            <div className="p-4">
              {renderProcessTable(nonActiveOkpProcesses, false)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdditionalFieldsSection;
