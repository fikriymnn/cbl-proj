import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from 'axios';
import { KalkulasiItem, OKPFormData } from './types';
import OKPForm from './OKPForm';
import OKPDetail from './OKPDetail';

interface OKPModalProps {
  onClose: () => void;
  mode?: 'create' | 'detail';
  okpId?: number;
}

const OKPModal: React.FC<OKPModalProps> = ({
  onClose,
  mode = 'create',
  okpId,
}) => {
  const [kalkulasiList, setKalkulasiList] = useState<KalkulasiItem[]>([]);
  const [loadingKalkulasi, setLoadingKalkulasi] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchKalkulasiData = async (): Promise<void> => {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/marketing/kalkulasi?status=history`;
    try {
      setLoadingKalkulasi(true);
      const res: AxiosResponse<{ data: KalkulasiItem[] }> = await axios.get(
        url,
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

  // Prevent closing/refreshing with unsaved changes
  useEffect(() => {
    if (mode === 'detail') return; // No unsaved changes in detail mode

    const handleBeforeUnload = (e: BeforeUnloadEvent): string | void => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue =
          'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    const handlePopState = (e: PopStateEvent): void => {
      if (hasUnsavedChanges) {
        const confirmLeave = window.confirm(
          'You have unsaved changes. Are you sure you want to leave?',
        );
        if (!confirmLeave) {
          window.history.pushState('', '', window.location.pathname);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    window.history.pushState('', '', window.location.pathname);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasUnsavedChanges, mode]);

  const handleCancelClick = (): void => {
    if (mode === 'detail') {
      onClose();
      return;
    }

    if (!isSubmitting) {
      const confirmCancel = window.confirm(
        'Data akan hilang. Apakah Anda yakin ingin membatalkan?',
      );
      if (confirmCancel) {
        setHasUnsavedChanges(false);
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl h-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-500 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {mode === 'create' ? 'Buat OKP Baru' : 'Detail OKP'}
          </h2>
          <button
            onClick={handleCancelClick}
            className="text-white hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        {mode === 'create' ? (
          <OKPForm
            kalkulasiList={kalkulasiList}
            loadingKalkulasi={loadingKalkulasi}
            onClose={onClose}
            hasUnsavedChanges={hasUnsavedChanges}
            setHasUnsavedChanges={setHasUnsavedChanges}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
            handleCancelClick={handleCancelClick}
          />
        ) : (
          <OKPDetail
            okpId={okpId!}
            kalkulasiList={kalkulasiList}
            loadingKalkulasi={loadingKalkulasi}
            onClose={onClose}
            handleCancelClick={handleCancelClick}
          />
        )}
      </div>
    </div>
  );
};

export default OKPModal;
