import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from 'axios';

import { KalkulasiItem } from './types';
import ProductInfoSection from './sections/ProductInfoSection';
import SearchableSelect from '../../../../pages/MasterData/Marketing/SearchableSelect';

interface OKPGantiKalkulasiModalProps {
  okpId: number;
  currentKalkulasi: KalkulasiItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

const OKPGantiKalkulasiModal: React.FC<OKPGantiKalkulasiModalProps> = ({
  okpId,
  currentKalkulasi,
  onClose,
  onSuccess,
}) => {
  const [kalkulasiList, setKalkulasiList] = useState<KalkulasiItem[]>([]);
  const [loadingKalkulasi, setLoadingKalkulasi] = useState(false);
  const [selectedKalkulasiId, setSelectedKalkulasiId] = useState<number>(
    currentKalkulasi?.id || 0,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedKalkulasi =
    kalkulasiList.find((k) => k.id === selectedKalkulasiId) || null;

  // Fetch available kalkulasi
  const fetchKalkulasiData = async (): Promise<void> => {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/marketing/kalkulasi?status=history`;
    try {
      setLoadingKalkulasi(true);
      const res: AxiosResponse<{ data: KalkulasiItem[] }> = await axios.get(
        url,
        {
          params: { is_okp_done: false },
          withCredentials: true,
        },
      );

      if (res.data && res.data.data) {
        setKalkulasiList(res.data.data);
      } else {
        setKalkulasiList([]);
      }
    } catch (error) {
      console.error('Error fetching kalkulasi data:', error);
      setKalkulasiList([]);
    } finally {
      setLoadingKalkulasi(false);
    }
  };

  useEffect(() => {
    fetchKalkulasiData();
  }, []);

  const handleSubmit = async () => {
    if (!selectedKalkulasiId || selectedKalkulasiId === 0) {
      alert('Please select a kalkulasi');
      return;
    }

    if (selectedKalkulasiId === currentKalkulasi?.id) {
      alert('Please select a different kalkulasi');
      return;
    }

    const confirmChange = window.confirm(
      'Are you sure you want to change the kalkulasi for this OKP? This action cannot be undone.',
    );

    if (!confirmChange) return;

    setIsSubmitting(true);
    try {
      const url = `${
        import.meta.env.VITE_API_LINK
      }/marketing/okp/updateKalkulasi/${okpId}`;

      await axios.put(
        url,
        {
          id_kalkulasi: selectedKalkulasiId,
        },
        { withCredentials: true },
      );

      alert('Kalkulasi berhasil diubah!');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error updating kalkulasi:', error);
      alert(
        error.response?.data?.msg ||
          error.response?.data?.message ||
          'Failed to update kalkulasi',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-orange-500 text-white p-4 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-xl font-semibold">Ganti Kalkulasi OKP</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200"
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Kalkulasi Selection */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              Select New Kalkulasi
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Kalkulasi <span className="text-red-500">*</span>
                </label>
                <SearchableSelect
                  options={[
                    { value: 0, label: 'Select Kalkulasi' },
                    ...kalkulasiList.map((k) => ({
                      value: k.id,
                      label: `${k.kode_kalkulasi} - ${k.nama_customer} - ${k.nama_produk}`,
                    })),
                  ]}
                  value={selectedKalkulasiId}
                  onChange={(value) => setSelectedKalkulasiId(Number(value))}
                  placeholder="Select Kalkulasi"
                  required
                />
                {loadingKalkulasi && (
                  <p className="text-xs text-gray-500 mt-1">
                    Loading kalkulasi...
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status OKP
                </label>
                <input
                  type="text"
                  value={selectedKalkulasi?.status_kalkulasi || '-'}
                  className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                  disabled
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Current Kalkulasi Info */}
          {currentKalkulasi && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Current Kalkulasi
                </h3>
                <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium">
                  {currentKalkulasi.kode_kalkulasi}
                </span>
              </div>
              <ProductInfoSection selectedKalkulasi={currentKalkulasi} />
            </div>
          )}

          {/* New Kalkulasi Info */}
          {selectedKalkulasi &&
            selectedKalkulasi.id !== currentKalkulasi?.id && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    New Kalkulasi
                  </h3>
                  <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-medium">
                    {selectedKalkulasi.kode_kalkulasi}
                  </span>
                </div>
                <ProductInfoSection selectedKalkulasi={selectedKalkulasi} />
              </div>
            )}

          {/* Warning Message */}
          {selectedKalkulasiId !== 0 &&
            selectedKalkulasiId !== currentKalkulasi?.id && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <div>
                    <h4 className="text-sm font-semibold text-yellow-900 mb-1">
                      Warning
                    </h4>
                    <p className="text-sm text-yellow-800">
                      Changing the kalkulasi will update all product information
                      associated with this OKP. This action cannot be undone.
                      Please review both the current and new kalkulasi details
                      carefully before proceeding.
                    </p>
                  </div>
                </div>
              </div>
            )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 flex justify-end gap-4 sticky bottom-0">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              !selectedKalkulasiId ||
              selectedKalkulasiId === 0 ||
              selectedKalkulasiId === currentKalkulasi?.id
            }
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OKPGantiKalkulasiModal;
