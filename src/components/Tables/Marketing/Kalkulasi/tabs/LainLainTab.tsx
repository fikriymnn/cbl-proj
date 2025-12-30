import React, { useEffect } from 'react';
import { KalkulasiFormData } from '../types/kalkulasi';

interface LainLainTabProps {
  formData: KalkulasiFormData;
  onInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  isReadOnly?: boolean;
  copyType?: 'repeat' | 'repeat_perubahan';
}

const LainLainTab: React.FC<LainLainTabProps> = ({
  formData,
  onInputChange,
  isReadOnly = false,
  copyType,
}) => {
  const lainLainItems = formData.lain_lain || [];

  // Changed: Only check isReadOnly prop, not copyType
  const isComponentReadOnly = isReadOnly;

  const getInputClassName = (baseClassName: string) => {
    return isComponentReadOnly
      ? `${baseClassName} bg-gray-100 cursor-not-allowed`
      : baseClassName;
  };

  const getSectionHeaderColor = () => {
    if (copyType === 'repeat') return 'text-blue-600';
    if (copyType === 'repeat_perubahan') return 'text-green-600';
    return 'text-blue-600';
  };

  // Calculate total whenever items change
  const calculateTotal = () => {
    return lainLainItems.reduce(
      (total, item) => total + (Number(item.harga) || 0),
      0,
    );
  };

  // Update total_harga_lain_lain whenever lain_lain items change
  useEffect(() => {
    if (isComponentReadOnly) return;

    const total = calculateTotal();

    // Create synthetic event to update the calculated total
    const syntheticEvent = {
      target: {
        name: 'total_harga_lain_lain',
        value: total.toString(),
      },
    } as React.ChangeEvent<HTMLInputElement>;

    onInputChange(syntheticEvent);
  }, [lainLainItems, isComponentReadOnly]);

  // Helper function to update lain_lain array
  const updateLainLain = (
    updatedItems: Array<{ nama_item: string; harga: number }>,
  ) => {
    if (isComponentReadOnly) return;

    // Create synthetic event to update lain_lain array
    const syntheticEvent = {
      target: {
        name: 'lain_lain',
        value: JSON.stringify(updatedItems), // Store as JSON string
      },
    } as React.ChangeEvent<HTMLInputElement>;

    onInputChange(syntheticEvent);
  };

  // Add new item
  const handleAddItem = () => {
    if (isComponentReadOnly) return;

    const newItem = { nama_item: '', harga: 0 };
    const updatedItems = [...lainLainItems, newItem];
    updateLainLain(updatedItems);
  };

  // Remove item
  const handleRemoveItem = (index: number) => {
    if (isComponentReadOnly) return;

    const updatedItems = lainLainItems.filter((_, i) => i !== index);
    updateLainLain(updatedItems);
  };

  // Update item
  const handleItemChange = (
    index: number,
    field: 'nama_item' | 'harga',
    value: string | number,
  ) => {
    if (isComponentReadOnly) return;

    const updatedItems = lainLainItems.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
    updateLainLain(updatedItems);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3
          className={`text-lg font-semibold flex items-center ${getSectionHeaderColor()}`}
        >
          ⚙️ Lain-lain
          {isComponentReadOnly && (
            <span className="ml-2 text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded">
              View Only
            </span>
          )}
          {/* Optional: Add badge to show this is editable in repeat mode */}
          {copyType === 'repeat' && !isComponentReadOnly && (
            <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
              Editable
            </span>
          )}
        </h3>
        {!isComponentReadOnly && (
          <button
            type="button"
            onClick={handleAddItem}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Tambah Item
          </button>
        )}
      </div>

      {/* Items List */}
      <div className="space-y-4">
        {lainLainItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg
              className="w-12 h-12 mx-auto mb-4 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5a1 1 0 011-1h4a1 1 0 011 1z"
              />
            </svg>
            <p>Belum ada item lain-lain</p>
            {!isComponentReadOnly && (
              <p className="text-sm">
                Klik "Tambah Item" untuk menambah item baru
              </p>
            )}
          </div>
        ) : (
          lainLainItems.map((item, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                {/* Nama Item */}
                <div className="md:col-span-6 space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Nama Item
                  </label>
                  <input
                    type="text"
                    value={item.nama_item}
                    onChange={(e) =>
                      handleItemChange(index, 'nama_item', e.target.value)
                    }
                    className={getInputClassName(
                      'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all',
                    )}
                    placeholder="Masukkan nama item"
                    readOnly={isComponentReadOnly}
                  />
                </div>

                {/* Harga */}
                <div className="md:col-span-4 space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Harga
                  </label>
                  <input
                    type="number"
                    value={item.harga || ''}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        'harga',
                        Number(e.target.value) || 0,
                      )
                    }
                    className={getInputClassName(
                      'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all',
                    )}
                    placeholder="0"
                    min="0"
                    readOnly={isComponentReadOnly}
                  />
                </div>

                {/* Remove Button */}
                <div className="md:col-span-2 flex justify-end">
                  {!isComponentReadOnly && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus item"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Item Preview */}
              {item.nama_item && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{item.nama_item}</span>
                    <span className="font-medium text-blue-600">
                      {formatCurrency(Number(item.harga) || 0)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Summary Card */}
      {lainLainItems.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Detail Item
          </h4>

          <div className="space-y-2 max-h-40 overflow-y-auto">
            {lainLainItems.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center text-sm py-2 px-3 bg-white rounded border border-blue-100"
              >
                <span className="text-gray-700 font-medium">
                  {item.nama_item || `Item ${index + 1}`}
                </span>
                <span className="font-semibold text-blue-600">
                  {formatCurrency(Number(item.harga) || 0)}
                </span>
              </div>
            ))}

            {/* Total Row */}
            <div className="flex justify-between items-center text-sm py-2 px-3 bg-blue-100 rounded border-2 border-blue-200 font-semibold">
              <span className="text-blue-800">
                Total ({lainLainItems.length} item)
              </span>
              <span className="text-blue-800 text-lg">
                {formatCurrency(calculateTotal())}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Removed the readonly information panel for repeat mode */}
      {/* Only show if truly in view-only mode */}
      {isComponentReadOnly && lainLainItems.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-800 mb-2">
            📋 View Only Mode
          </h4>
          <p className="text-sm text-gray-600">
            This section is in read-only mode. You cannot make changes to these
            items.
          </p>
        </div>
      )}
    </div>
  );
};

export default LainLainTab;
