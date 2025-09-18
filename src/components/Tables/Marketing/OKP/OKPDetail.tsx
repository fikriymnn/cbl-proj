import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { KalkulasiItem, OKPFormData } from './types';
import BasicInfoSection from './sections/BasicInfoSections';
import FileUploadSection from './sections/FileUploadSections';
import CheckboxSection from './sections/CheckboxSections';
import AdditionalFieldsSection from './sections/AditionalfieldsSection';

interface OKPDetailProps {
  okpId: number;
  kalkulasiList: KalkulasiItem[];
  loadingKalkulasi: boolean;
  onClose: () => void;
  handleCancelClick: () => void;
  isDesain?: boolean;
  isQA?: boolean;
  isCustomer?: boolean; // Add customer prop
  isMarketing?: boolean; // Add marketing prop
  onAction?: (
    processId: number,
    type: 'approve' | 'reject',
    currentIdPisau?: string,
  ) => void;
}

const OKPDetail: React.FC<OKPDetailProps> = ({
  okpId,
  kalkulasiList,
  loadingKalkulasi,
  onClose,
  handleCancelClick,
  isDesain = false,
  isQA = false,
  isCustomer = false, // Add customer prop
  isMarketing = false, // Add marketing prop
  onAction,
}) => {
  const [formData, setFormData] = useState<OKPFormData>({
    id: 0,
    no_okp: '',
    status_okp: 'Baru',
    tgl_target_marketing: '',
    jenis_pekerjaan: [],
    id_pisau: '',
    file_spek_customer: '',
    rencana_qty_po: 0,
    rencana_tgl_kirim: '',
    status_po: 'tidak',
    keterangan_cetak: '',
    tahapan: [],
    id_kalkulasi: 0,
    tgl_pembuatan_okp: '',
    user_create: { id: 0, nama: '', bagian: '' },
    user_approve: { id: 0, nama: '', bagian: '' },
    keterangan: '',
  });

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [okpProcesses, setOkpProcesses] = useState<any[]>([]);

  // Fetch OKP data
  useEffect(() => {
    const fetchOKPData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_LINK}/marketing/okp/${okpId}`,
          { withCredentials: true },
        );

        if (response.data && response.data.data) {
          const okpData = response.data.data;

          // Parse arrays if they're stored as strings
          const parseArrayField = (field: string) => {
            if (typeof field === 'string') {
              try {
                return JSON.parse(field) || [];
              } catch {
                return field.split(',').filter(Boolean) || [];
              }
            }
            return Array.isArray(field) ? field : [];
          };

          setFormData({
            id: okpData.id,
            no_okp: okpData.no_okp || '',
            status_okp: okpData.status_okp || 'Baru',
            tgl_target_marketing: okpData.tgl_target_marketing || '',
            jenis_pekerjaan: parseArrayField(okpData.jenis_pekerjaan),
            id_pisau: okpData.id_pisau || '',
            file_spek_customer: okpData.file_spek_customer || '',
            rencana_qty_po: okpData.rencana_qty_po || 0,
            rencana_tgl_kirim: okpData.rencana_tgl_kirim || '',
            status_po: okpData.status_po || 'tidak',
            keterangan_cetak: okpData.keterangan_cetak || '',
            tahapan: parseArrayField(okpData.tahapan),
            id_kalkulasi: okpData.id_kalkulasi || 0,
            tgl_pembuatan_okp: okpData.tgl_pembuatan_okp || '', // Add this
            user_create: okpData.user_create || null, // Add this
            user_approve: okpData.user_approve || null, // Add this
            okp_proses: okpData.okp_proses || [], // Add this
            keterangan: okpData.keterangan || '', // Add this
          });

          // Set OKP processes for desain, QA, and marketing actions
          if (isDesain || isQA || isMarketing || isCustomer) {
            setOkpProcesses(okpData.okp_proses || []);
          }
        }
        console.log('Fetched OKP data:', response.data.data);
      } catch (error: any) {
        console.error('Error fetching OKP data:', error);
        setError('Failed to load OKP data');
      } finally {
        setLoading(false);
      }
    };

    if (okpId) {
      fetchOKPData();
    }
  }, [okpId, isDesain, isQA, isMarketing]);

  // Disabled handler for regular detail mode
  const handleInputChange = () => {};
  const handleCheckboxChange = () => {};

  // Handle action button clicks (delegate to parent)
  const handleActionClick = (processId: number, type: 'approve' | 'reject') => {
    if (onAction) {
      onAction(processId, type, formData.id_pisau);
    }
  };

  // Get active processes for desain, QA, and marketing
  const activeProcesses =
    isDesain || isQA || isMarketing || isCustomer
      ? okpProcesses.filter((p: any) => p.status === 'active')
      : [];

  // Get mode name for display
  const getModeName = () => {
    if (isDesain) return 'Design';
    if (isQA) return 'QA';
    if (isMarketing) return 'Marketing';
    if (isCustomer) return 'Customer';
    return '';
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading OKP details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleCancelClick}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6 space-y-6">
        {/* Show mode indicator for desain, QA, and marketing */}
        {(isDesain || isQA || isMarketing || isCustomer) && (
          <div
            className={`${
              isDesain
                ? 'bg-blue-50 border-blue-400'
                : isQA
                ? 'bg-orange-50 border-orange-400'
                : 'bg-green-50 border-green-400'
            } border-l-4 p-4`}
          >
            <div className="flex">
              <div className="ml-3">
                <p
                  className={`text-sm ${
                    isDesain
                      ? 'text-blue-800'
                      : isQA
                      ? 'text-orange-800'
                      : 'text-green-800'
                  }`}
                >
                  <strong>{getModeName()} Mode:</strong> You can process the{' '}
                  {getModeName().toLowerCase()} workflow
                  {isDesain ? ' and input ID Pisau' : ''}.
                </p>
              </div>
            </div>
          </div>
        )}

        <BasicInfoSection
          formData={formData}
          handleInputChange={handleInputChange}
          kalkulasiList={kalkulasiList}
          loadingKalkulasi={loadingKalkulasi}
          disabled={true}
          isDesain={isDesain}
        />

        <FileUploadSection
          selectedFile={null}
          setSelectedFile={() => {}}
          filePreview={
            formData.file_spek_customer
              ? `${import.meta.env.VITE_API_LINK}/images/${
                  formData.file_spek_customer
                }`
              : ''
          }
          setFilePreview={() => {}}
          uploadError=""
          setUploadError={() => {}}
          setPdfFile={() => {}}
          setPdfPages={() => {}}
          setSelectedPage={() => {}}
          setShowPdfPreview={() => {}}
          disabled={true}
          uploading={false}
          setUploading={setUploading}
        />

        <CheckboxSection
          formData={formData}
          handleCheckboxChange={handleCheckboxChange}
          disabled={true}
        />

        <AdditionalFieldsSection
          formData={formData}
          handleInputChange={handleInputChange}
          disabled={true}
        />

        {/* Actions Section - show for desain, QA, and marketing modes */}
        {(isDesain || isQA || isMarketing || isCustomer) &&
          activeProcesses.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {getModeName()} Process Actions
              </h3>
              <div className="flex gap-2">
                {activeProcesses.map((process: any) => (
                  <React.Fragment key={process.id}>
                    <button
                      onClick={() => handleActionClick(process.id, 'approve')}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition-colors"
                    >
                      Process
                    </button>
                    <button
                      onClick={() => handleActionClick(process.id, 'reject')}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm transition-colors"
                    >
                      Reject
                    </button>
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

        {/* Info message when no active processes */}
        {(isDesain || isQA || isMarketing || isCustomer) &&
          activeProcesses.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="text-center text-yellow-800">
                <p className="text-sm">
                  No active {getModeName().toLowerCase()} processes available
                  for this OKP.
                </p>
              </div>
            </div>
          )}

        {/* Info message for non-action modes */}
        {!isDesain && !isQA && !isMarketing && !isCustomer && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-center text-gray-600">
              <p className="text-sm">
                This is a read-only view. Process actions are available from the
                main list.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 p-4 flex justify-end gap-4">
        <button
          onClick={handleCancelClick}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
        >
          Close
        </button>
      </div>
    </>
  );
};

export default OKPDetail;
