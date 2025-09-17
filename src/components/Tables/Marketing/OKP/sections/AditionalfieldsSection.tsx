import React from 'react';
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
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      }
    } catch (error) {
      console.warn('Invalid date format:', dateValue);
    }

    return dateValue;
  };

  // Get active OKP processes
  const activeOkpProcesses =
    formData.okp_proses?.filter(
      (process: any) => process.status === 'active',
    ) || [];
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
      {activeOkpProcesses.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200 md:col-span-2 lg:col-span-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            OKP Process Information
          </h3>

          {activeOkpProcesses.map((process: any, index: number) => (
            <div key={process.id} className="mb-6 last:mb-0">
              {activeOkpProcesses.length > 1 && (
                <h4 className="text-md font-medium text-gray-700 mb-3">
                  Process {index + 1}
                </h4>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Design Information */}
                {(process.tgl_okp_desain ||
                  process.note_okp_desain ||
                  process.user_desain) && (
                  <div className="space-y-2">
                    <h5 className="font-medium text-sm text-gray-600">
                      Design Process
                    </h5>
                    {process.tgl_okp_desain && (
                      <div className="text-sm">
                        <span className="font-medium">Date:</span>{' '}
                        {formatDateForDisplay(process.tgl_okp_desain)}
                      </div>
                    )}
                    {process.note_okp_desain && (
                      <div className="text-sm">
                        <span className="font-medium">Note:</span>{' '}
                        {process.note_okp_desain}
                      </div>
                    )}
                    {process.user_desain && (
                      <div className="text-sm">
                        <span className="font-medium">User:</span>{' '}
                        {process.user_desain.nama} ({process.user_desain.bagian}
                        )
                      </div>
                    )}
                  </div>
                )}

                {/* QA Information */}
                {(process.tgl_terima_qa ||
                  process.note_terima_qa ||
                  process.user_qa) && (
                  <div className="space-y-2">
                    <h5 className="font-medium text-sm text-gray-600">
                      QA Process
                    </h5>
                    {process.tgl_terima_qa && (
                      <div className="text-sm">
                        <span className="font-medium">Date:</span>{' '}
                        {formatDateForDisplay(process.tgl_terima_qa)}
                      </div>
                    )}
                    {process.note_terima_qa && (
                      <div className="text-sm">
                        <span className="font-medium">Note:</span>{' '}
                        {process.note_terima_qa}
                      </div>
                    )}
                    {process.user_qa && (
                      <div className="text-sm">
                        <span className="font-medium">User:</span>{' '}
                        {process.user_qa.nama} ({process.user_qa.bagian})
                      </div>
                    )}
                  </div>
                )}

                {/* Marketing Information */}
                {(process.tgl_terima_marketing ||
                  process.note_terima_marketing ||
                  process.user_terima_marketing) && (
                  <div className="space-y-2">
                    <h5 className="font-medium text-sm text-gray-600">
                      Marketing Process
                    </h5>
                    {process.tgl_terima_marketing && (
                      <div className="text-sm">
                        <span className="font-medium">Date:</span>{' '}
                        {formatDateForDisplay(process.tgl_terima_marketing)}
                      </div>
                    )}
                    {process.note_terima_marketing && (
                      <div className="text-sm">
                        <span className="font-medium">Note:</span>{' '}
                        {process.note_terima_marketing}
                      </div>
                    )}
                    {process.user_terima_marketing && (
                      <div className="text-sm">
                        <span className="font-medium">User:</span>{' '}
                        {process.user_terima_marketing.nama} (
                        {process.user_terima_marketing.bagian})
                      </div>
                    )}
                  </div>
                )}

                {/* Customer Information */}
                {(process.tgl_acc_customer ||
                  process.note_acc_customer ||
                  process.user_acc_customer) && (
                  <div className="space-y-2">
                    <h5 className="font-medium text-sm text-gray-600">
                      Customer Process
                    </h5>
                    {process.tgl_acc_customer && (
                      <div className="text-sm">
                        <span className="font-medium">Date:</span>{' '}
                        {formatDateForDisplay(process.tgl_acc_customer)}
                      </div>
                    )}
                    {process.note_acc_customer && (
                      <div className="text-sm">
                        <span className="font-medium">Note:</span>{' '}
                        {process.note_acc_customer}
                      </div>
                    )}
                    {process.user_acc_customer && (
                      <div className="text-sm">
                        <span className="font-medium">User:</span>{' '}
                        {process.user_acc_customer.nama} (
                        {process.user_acc_customer.bagian})
                      </div>
                    )}
                  </div>
                )}

                {/* Reject Information (if any) */}
                {(process.tgl_reject ||
                  process.note_reject ||
                  process.user_reject) && (
                  <div className="space-y-2">
                    <h5 className="font-medium text-sm text-red-600">
                      Reject Information
                    </h5>
                    {process.tgl_reject && (
                      <div className="text-sm">
                        <span className="font-medium">Date:</span>{' '}
                        {formatDateForDisplay(process.tgl_reject)}
                      </div>
                    )}
                    {process.note_reject && (
                      <div className="text-sm">
                        <span className="font-medium">Note:</span>{' '}
                        {process.note_reject}
                      </div>
                    )}
                    {process.user_reject && (
                      <div className="text-sm">
                        <span className="font-medium">User:</span>{' '}
                        {process.user_reject.nama} ({process.user_reject.bagian}
                        )
                      </div>
                    )}
                  </div>
                )}
              </div>

              {index < activeOkpProcesses.length - 1 && (
                <hr className="mt-4 border-blue-200" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdditionalFieldsSection;
