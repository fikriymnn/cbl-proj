import React from 'react';
import { QtyListItem } from '../Kalkulasi/types/kalkulasi';

interface MultiQtySelectorProps {
  qtyList: QtyListItem[];
  onQtyListChange: (newList: QtyListItem[]) => void;
  disabled?: boolean;
}

const MultiQtySelector: React.FC<MultiQtySelectorProps> = ({
  qtyList,
  onQtyListChange,
  disabled = false,
}) => {
  const handleAddQty = () => {
    const newList = [...qtyList, { qty: 0, is_selected: false }];
    onQtyListChange(newList);
  };

  const handleRemoveQty = (index: number) => {
    const newList = qtyList.filter((_, i) => i !== index);
    onQtyListChange(newList);
  };

  const handleQtyChange = (index: number, value: number) => {
    const newList = qtyList.map((item, i) =>
      i === index ? { ...item, qty: value } : item,
    );
    onQtyListChange(newList);
  };

  const handleSelectQty = (index: number) => {
    const newList = qtyList.map((item, i) => ({
      ...item,
      is_selected: i === index,
    }));
    onQtyListChange(newList);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-xs font-medium text-gray-700">
          Daftar Quantity
        </label>
        <button
          type="button"
          onClick={handleAddQty}
          disabled={disabled}
          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
        >
          + Tambah Qty
        </button>
      </div>

      <div className="space-y-2">
        {qtyList.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg"
          >
            <input
              type="radio"
              name="selected_qty"
              checked={item.is_selected}
              onChange={() => handleSelectQty(index)}
              disabled={disabled}
              className="w-4 h-4 text-blue-600"
            />
            <input
              type="number"
              value={item.qty}
              onChange={(e) => handleQtyChange(index, Number(e.target.value))}
              disabled={disabled}
              className="flex-1 px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan quantity"
              min="0"
            />
            {qtyList.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveQty(index)}
                disabled={disabled}
                className="text-red-500 hover:text-red-700 disabled:opacity-50"
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultiQtySelector;
