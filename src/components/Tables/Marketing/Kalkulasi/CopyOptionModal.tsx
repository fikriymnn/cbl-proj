// CopyOptionsModal.tsx
import React from 'react';

interface CopyOptionsModalProps {
  onClose: () => void;
  onSelectRepeat: () => void;
  onSelectRepeatPerubahan: () => void;
}

const CopyOptionsModal: React.FC<CopyOptionsModalProps> = ({
  onClose,
  onSelectRepeat,
  onSelectRepeatPerubahan,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Pilih Jenis Copy
          </h2>
          <p className="text-gray-600 mb-6">
            Pilih jenis copy yang ingin Anda lakukan:
          </p>

          <div className="space-y-3">
            <button
              onClick={onSelectRepeat}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center"
            >
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
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              Repeat
            </button>

            <button
              onClick={onSelectRepeatPerubahan}
              className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center"
            >
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Repeat Perubahan
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-4 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
};

export default CopyOptionsModal;
