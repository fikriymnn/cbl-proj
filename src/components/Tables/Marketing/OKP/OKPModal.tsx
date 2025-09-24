import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from 'axios';
import { KalkulasiItem, OKPFormData } from './types';
import OKPForm from './OKPForm';
import OKPDetail from './OKPDetail';

interface OKPModalProps {
  onClose: () => void;
  mode?: 'create' | 'detail' | 'desain' | 'qa' | 'marketing' | 'customer';
  okpId?: number;
  onActionComplete?: () => void;
}

const OKPModal: React.FC<OKPModalProps> = ({
  onClose,
  mode = 'create',
  okpId,
  onActionComplete,
}) => {
  const [kalkulasiList, setKalkulasiList] = useState<KalkulasiItem[]>([]);
  const [loadingKalkulasi, setLoadingKalkulasi] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Action states (for desain, QA, marketing, and customer)
  const [showActionModal, setShowActionModal] = useState<boolean>(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [selectedProcessId, setSelectedProcessId] = useState<
    number | undefined
  >();

  // Form data for different modes
  const [desainFormData, setDesainFormData] = useState({
    tgl_okp_desain: '',
    note_okp_desain: '',
    id_pisau: '',
  });

  const [qaFormData, setQaFormData] = useState({
    tgl_terima_qa: '',
    note_terima_qa: '',
  });

  const [marketingFormData, setMarketingFormData] = useState({
    tgl_terima_marketing: '',
    note_terima_marketing: '',
  });

  const [customerFormData, setCustomerFormData] = useState({
    tgl_acc_customer: '',
    note_acc_customer: '',
  });

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
      console.log(res.data.data);
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
    if (mode === 'detail') return;

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

  // Handle action (for desain, QA, marketing, and customer modes)
  const handleAction = (
    processId: number,
    type: 'approve' | 'reject',
    currentIdPisau?: string,
  ) => {
    if (
      mode !== 'desain' &&
      mode !== 'qa' &&
      mode !== 'marketing' &&
      mode !== 'customer'
    )
      return;

    setSelectedProcessId(processId);
    setActionType(type);
    setShowActionModal(true);

    if (mode === 'desain') {
      if (type === 'approve') {
        setDesainFormData({
          tgl_okp_desain: new Date().toISOString().split('T')[0],
          note_okp_desain: '',
          id_pisau: currentIdPisau || '',
        });
      } else {
        setDesainFormData({
          tgl_okp_desain: '',
          note_okp_desain: '',
          id_pisau: '',
        });
      }
    } else if (mode === 'qa') {
      if (type === 'approve') {
        setQaFormData({
          tgl_terima_qa: new Date().toISOString().split('T')[0],
          note_terima_qa: '',
        });
      } else {
        setQaFormData({
          tgl_terima_qa: '',
          note_terima_qa: '',
        });
      }
    } else if (mode === 'marketing') {
      if (type === 'approve') {
        setMarketingFormData({
          tgl_terima_marketing: new Date().toISOString().split('T')[0],
          note_terima_marketing: '',
        });
      } else {
        setMarketingFormData({
          tgl_terima_marketing: '',
          note_terima_marketing: '',
        });
      }
    } else if (mode === 'customer') {
      if (type === 'approve') {
        setCustomerFormData({
          tgl_acc_customer: new Date().toISOString().split('T')[0],
          note_acc_customer: '',
        });
      } else {
        setCustomerFormData({
          tgl_acc_customer: '',
          note_acc_customer: '',
        });
      }
    }
  };

  // Handle submit action (for desain, QA, marketing, and customer modes)
  const handleSubmitAction = async () => {
    if (
      !selectedProcessId ||
      (mode !== 'desain' &&
        mode !== 'qa' &&
        mode !== 'marketing' &&
        mode !== 'customer')
    )
      return;

    // Validate ID Pisau for desain approve action
    if (
      mode === 'desain' &&
      actionType === 'approve' &&
      !desainFormData.id_pisau.trim()
    ) {
      alert('ID Pisau is required for processing desain');
      return;
    }

    setIsSubmitting(true);
    try {
      if (actionType === 'approve') {
        const url = `${
          import.meta.env.VITE_API_LINK
        }/marketing/okp/proses/action/${selectedProcessId}`;

        let requestData = {};
        if (mode === 'desain') {
          requestData = {
            bagian: 'desain',
            tgl_okp_desain: desainFormData.tgl_okp_desain,
            note_okp_desain: desainFormData.note_okp_desain,
            id_pisau: desainFormData.id_pisau,
          };
        } else if (mode === 'qa') {
          requestData = {
            bagian: 'qa',
            tgl_terima_qa: qaFormData.tgl_terima_qa,
            note_terima_qa: qaFormData.note_terima_qa,
          };
        } else if (mode === 'marketing') {
          requestData = {
            bagian: 'marketing',
            tgl_terima_marketing: marketingFormData.tgl_terima_marketing,
            note_terima_marketing: marketingFormData.note_terima_marketing,
          };
        } else if (mode === 'customer') {
          requestData = {
            bagian: 'customer',
            tgl_acc_customer: customerFormData.tgl_acc_customer,
            note_acc_customer: customerFormData.note_acc_customer,
          };
        }

        await axios.put(url, requestData, { withCredentials: true });
        alert(`OKP berhasil diproses!`);
      } else {
        const url = `${
          import.meta.env.VITE_API_LINK
        }/marketing/okp/proses/reject/${selectedProcessId}`;

        let requestData = {};
        if (mode === 'desain') {
          requestData = {
            bagian: 'desain',
            note_reject: desainFormData.note_okp_desain,
          };
        } else if (mode === 'qa') {
          requestData = {
            bagian: 'qa',
            note_reject: qaFormData.note_terima_qa,
          };
        } else if (mode === 'marketing') {
          requestData = {
            bagian: 'marketing',
            note_reject: marketingFormData.note_terima_marketing,
          };
        } else if (mode === 'customer') {
          requestData = {
            bagian: 'customer',
            note_reject: customerFormData.note_acc_customer,
          };
        }

        await axios.put(url, requestData, { withCredentials: true });
        alert(`OKP berhasil direject!`);
      }

      setShowActionModal(false);

      if (onActionComplete) {
        onActionComplete();
      }

      onClose();
    } catch (error) {
      console.error('Error processing action:', error);
      alert('Error processing action');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelClick = (): void => {
    if (mode === 'detail') {
      onClose();
      return;
    }

    if (
      mode === 'desain' ||
      mode === 'qa' ||
      mode === 'marketing' ||
      mode === 'customer'
    ) {
      if (hasUnsavedChanges) {
        const confirmCancel = window.confirm(
          `You have unsaved changes in ${mode} mode. Are you sure you want to cancel?`,
        );
        if (confirmCancel) {
          setHasUnsavedChanges(false);
          onClose();
        }
      } else {
        onClose();
      }
      return;
    }

    if (mode === 'create' && !isSubmitting) {
      const confirmCancel = window.confirm(
        'Data akan hilang. Apakah Anda yakin ingin membatalkan?',
      );
      if (confirmCancel) {
        setHasUnsavedChanges(false);
        onClose();
      }
    }
  };

  // Get modal title based on mode
  const getModalTitle = () => {
    switch (mode) {
      case 'create':
        return 'Buat OKP Baru';
      case 'detail':
        return 'Detail OKP';
      case 'desain':
        return 'OKP Design Process';
      case 'qa':
        return 'OKP QA Process';
      case 'marketing':
        return 'OKP Marketing Process';
      case 'customer':
        return 'OKP Customer Process';
      default:
        return 'OKP';
    }
  };

  // Get modal header color based on mode
  const getHeaderColor = () => {
    switch (mode) {
      case 'create':
        return 'bg-blue-500';
      case 'detail':
        return 'bg-green-500';
      case 'desain':
        return 'bg-purple-500';
      case 'qa':
        return 'bg-orange-500';
      case 'marketing':
        return 'bg-indigo-500';
      case 'customer':
        return 'bg-teal-500';
      default:
        return 'bg-blue-500';
    }
  };

  // Get mode display name
  const getModeDisplayName = () => {
    switch (mode) {
      case 'desain':
        return 'Desain';
      case 'qa':
        return 'QA';
      case 'marketing':
        return 'Marketing';
      case 'customer':
        return 'Customer';
      default:
        return '';
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-6xl h-full max-h-screen overflow-y-auto">
          {/* Header */}
          <div
            className={`${getHeaderColor()} text-white p-4 flex justify-between items-center`}
          >
            <h2 className="text-xl font-semibold">{getModalTitle()}</h2>
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
              isDesain={mode === 'desain'}
              isQA={mode === 'qa'}
              isMarketing={mode === 'marketing'}
              isCustomer={mode === 'customer'}
              onAction={
                mode === 'desain' ||
                mode === 'qa' ||
                mode === 'marketing' ||
                mode === 'customer'
                  ? handleAction
                  : undefined
              }
            />
          )}
        </div>
      </div>

      {/* Action Modal (for desain, QA, marketing, and customer modes) */}
      {(mode === 'desain' ||
        mode === 'qa' ||
        mode === 'marketing' ||
        mode === 'customer') &&
        showActionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
            <div className="bg-white rounded-lg p-6 w-96">
              <h2 className="text-xl font-bold mb-4">
                {actionType === 'approve'
                  ? `Process OKP ${getModeDisplayName()}`
                  : `Reject OKP ${getModeDisplayName()}`}
              </h2>

              {actionType === 'approve' && (
                <>
                  {mode === 'desain' && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ID Pisau <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={desainFormData.id_pisau}
                        onChange={(e) =>
                          setDesainFormData({
                            ...desainFormData,
                            id_pisau: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="PS-001"
                        required
                      />
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {mode === 'desain'
                        ? 'Tanggal OKP Desain'
                        : mode === 'qa'
                        ? 'Tanggal Terima QA'
                        : mode === 'marketing'
                        ? 'Tanggal Terima Marketing'
                        : 'Tanggal ACC Customer'}
                    </label>
                    <input
                      type="date"
                      value={
                        mode === 'desain'
                          ? desainFormData.tgl_okp_desain
                          : mode === 'qa'
                          ? qaFormData.tgl_terima_qa
                          : mode === 'marketing'
                          ? marketingFormData.tgl_terima_marketing
                          : customerFormData.tgl_acc_customer
                      }
                      onChange={(e) => {
                        if (mode === 'desain') {
                          setDesainFormData({
                            ...desainFormData,
                            tgl_okp_desain: e.target.value,
                          });
                        } else if (mode === 'qa') {
                          setQaFormData({
                            ...qaFormData,
                            tgl_terima_qa: e.target.value,
                          });
                        } else if (mode === 'marketing') {
                          setMarketingFormData({
                            ...marketingFormData,
                            tgl_terima_marketing: e.target.value,
                          });
                        } else if (mode === 'customer') {
                          setCustomerFormData({
                            ...customerFormData,
                            tgl_acc_customer: e.target.value,
                          });
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {actionType === 'approve'
                    ? mode === 'desain'
                      ? 'Note OKP Desain'
                      : mode === 'qa'
                      ? 'Note Terima QA'
                      : mode === 'marketing'
                      ? 'Note Terima Marketing'
                      : 'Note ACC Customer'
                    : 'Note Reject'}
                </label>
                <textarea
                  value={
                    mode === 'desain'
                      ? desainFormData.note_okp_desain
                      : mode === 'qa'
                      ? qaFormData.note_terima_qa
                      : mode === 'marketing'
                      ? marketingFormData.note_terima_marketing
                      : customerFormData.note_acc_customer
                  }
                  onChange={(e) => {
                    if (mode === 'desain') {
                      setDesainFormData({
                        ...desainFormData,
                        note_okp_desain: e.target.value,
                      });
                    } else if (mode === 'qa') {
                      setQaFormData({
                        ...qaFormData,
                        note_terima_qa: e.target.value,
                      });
                    } else if (mode === 'marketing') {
                      setMarketingFormData({
                        ...marketingFormData,
                        note_terima_marketing: e.target.value,
                      });
                    } else if (mode === 'customer') {
                      setCustomerFormData({
                        ...customerFormData,
                        note_acc_customer: e.target.value,
                      });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder={
                    actionType === 'approve'
                      ? mode === 'desain'
                        ? 'Masukkan note untuk desain...'
                        : mode === 'qa'
                        ? 'Masukkan note untuk QA...'
                        : mode === 'marketing'
                        ? 'Masukkan note untuk marketing...'
                        : 'Masukkan note untuk customer...'
                      : 'Masukkan alasan reject...'
                  }
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowActionModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitAction}
                  disabled={
                    isSubmitting ||
                    (mode === 'desain' &&
                      actionType === 'approve' &&
                      !desainFormData.id_pisau.trim())
                  }
                  className={`px-4 py-2 text-white rounded-md disabled:opacity-50 ${
                    actionType === 'approve'
                      ? 'bg-blue-500 hover:bg-blue-600'
                      : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  {isSubmitting
                    ? 'Processing...'
                    : actionType === 'approve'
                    ? 'Process'
                    : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        )}
    </>
  );
};

export default OKPModal;
