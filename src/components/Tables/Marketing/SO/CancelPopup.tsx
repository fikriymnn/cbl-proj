// components/CancelPopup.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { SOData } from './types/SOTypes';
import EditSO from './EditSO';

interface CancelPopupProps {
  isOpen: boolean;
  onClose: () => void;
  soData: SOData | null;
  onSuccess: () => void;
}

const CancelPopup: React.FC<CancelPopupProps> = ({
  isOpen,
  onClose,
  soData,
  onSuccess,
}) => {
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showEditPopup, setShowEditPopup] = useState<boolean>(false);

  if (!isOpen || !soData) return null;

  const handleCancelOnly = () => {
    setShowConfirmation(true);
  };

  const handleCancelAndNew = () => {
    // Set edit popup to open first, then close cancel popup
    setShowEditPopup(true);
  };

  const handleConfirmCancel = async () => {
    if (!soData) return;

    setLoading(true);
    try {
      const url = `${import.meta.env.VITE_API_LINK}/marketing/so/cancel/${
        soData.id
      }`;
      const response = await axios.post(url, {}, { withCredentials: true });

      if (response.data.succes) {
        alert('SO berhasil dibatalkan');
        setShowConfirmation(false);
        onClose();
        onSuccess();
      } else {
        alert(
          'Gagal membatalkan SO: ' + (response.data.message || 'Unknown error'),
        );
      }
    } catch (error: any) {
      console.error('Error canceling SO:', error);
      alert('Error: ' + (error.response?.data?.message || 'Terjadi kesalahan'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Main Cancel Options Popup */}
      {!showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Cancel Sales Order</h2>
              <p className="text-gray-600 mb-2">SO Number: {soData.no_so}</p>
              <p className="text-gray-600 mb-6">Customer: {soData.customer}</p>

              <div className="space-y-3">
                <button
                  onClick={handleCancelOnly}
                  className="w-full px-4 py-3 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCancelAndNew}
                  className="w-full px-4 py-3 bg-orange-500 text-white rounded hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
                  disabled={loading}
                >
                  Cancel & Buat Baru
                </button>
                <button
                  onClick={onClose}
                  className="w-full px-4 py-3 text-gray-700 border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                  disabled={loading}
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog - Only for Cancel (not Cancel & Buat Baru) */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg max-w-sm w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-3">Konfirmasi</h3>
              <p className="text-gray-700 mb-6">
                Apakah anda yakin ingin Cancel SO ini?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  disabled={loading}
                >
                  Tidak
                </button>
                <button
                  onClick={handleConfirmCancel}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Ya'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit SO Popup */}
      {showEditPopup && (
        <EditSO
          isOpen={showEditPopup}
          onClose={() => {
            setShowEditPopup(false);
            onSuccess();
            onClose();
          }}
          soData={soData}
          onSuccess={onSuccess}
        />
      )}
    </>
  );
};

export default CancelPopup;
