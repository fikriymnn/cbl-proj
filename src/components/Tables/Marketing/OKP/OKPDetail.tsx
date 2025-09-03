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
}

const OKPDetail: React.FC<OKPDetailProps> = ({
  okpId,
  kalkulasiList,
  loadingKalkulasi,
  onClose,
  handleCancelClick,
}) => {
  const [formData, setFormData] = useState<OKPFormData>({
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
  });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

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
          });
        }
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
  }, [okpId]);

  // Disabled handler - does nothing in detail mode
  const handleInputChange = () => {};
  const handleCheckboxChange = () => {};

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
        <BasicInfoSection
          formData={formData}
          handleInputChange={handleInputChange}
          kalkulasiList={kalkulasiList}
          loadingKalkulasi={loadingKalkulasi}
          disabled={true}
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
          setUploading={setUploading} // Add this
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
