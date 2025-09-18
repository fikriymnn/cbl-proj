import React, { useState } from 'react';
import axios from 'axios';
import { KalkulasiItem, OKPFormData } from './types';
import BasicInfoSection from './sections/BasicInfoSections';
import FileUploadSection from './sections/FileUploadSections';
import CheckboxSection from './sections/CheckboxSections';
import AdditionalFieldsSection from './sections/AditionalfieldsSection';
import PDFPreviewModal from './sections/PDFPreviewModal';

interface OKPFormProps {
  kalkulasiList: KalkulasiItem[];
  loadingKalkulasi: boolean;
  onClose: () => void;
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (value: boolean) => void;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
  handleCancelClick: () => void;
}

const OKPForm: React.FC<OKPFormProps> = ({
  kalkulasiList,
  loadingKalkulasi,
  onClose,
  hasUnsavedChanges,
  setHasUnsavedChanges,
  isSubmitting,
  setIsSubmitting,
  handleCancelClick,
}) => {
  const [formData, setFormData] = useState<OKPFormData>({
    id: 0,
    no_okp: '',
    status_okp: 'Baru',
    tgl_target_marketing: '',
    jenis_pekerjaan: [],
    id_pisau: '', // Don't pre-fill this, let it be filled during desain process
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

  // File handling states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // PDF handling states
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPages, setPdfPages] = useState<string[]>([]);
  const [selectedPage, setSelectedPage] = useState<string>('');
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  const handleInputChange = (field: keyof OKPFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleCheckboxChange = (
    field: 'jenis_pekerjaan' | 'tahapan',
    value: string,
    checked: boolean,
  ) => {
    setFormData((prev) => {
      const currentArray = prev[field];
      let newArray: string[];

      if (checked) {
        newArray = currentArray.includes(value)
          ? currentArray
          : [...currentArray, value];
      } else {
        newArray = currentArray.filter((item) => item !== value);
      }

      return { ...prev, [field]: newArray };
    });
    setHasUnsavedChanges(true);
  };

  async function handleFileUpload(file: File): Promise<string> {
    setUploading(true);
    setUploadError('');

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_LINK}/images`,
        formDataUpload,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      const fileName =
        response.data.fileName || response.data.filename || response.data.file;
      return fileName;
    } catch (error: any) {
      console.error('Error uploading file:', error);
      setUploadError('Failed to upload file');
      throw error;
    } finally {
      setUploading(false);
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Upload file if selected
      if (selectedFile && !formData.file_spek_customer) {
        const fileName = await handleFileUpload(selectedFile);
        formData.file_spek_customer = fileName;
      }

      // Submit form data
      const response = await axios.post(
        `${import.meta.env.VITE_API_LINK}/marketing/okp`,
        formData,
        { withCredentials: true },
      );

      console.log('OKP created successfully:', response.data);
      setHasUnsavedChanges(false);
      onClose();
    } catch (error) {
      console.error('Error creating OKP:', error);
      alert('Error creating OKP');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="p-6 space-y-6">
        <BasicInfoSection
          formData={formData}
          handleInputChange={handleInputChange}
          kalkulasiList={kalkulasiList}
          loadingKalkulasi={loadingKalkulasi}
          disabled={false}
          isDesain={false} // Set to false for create form
        />

        <FileUploadSection
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          filePreview={filePreview}
          setFilePreview={setFilePreview}
          uploadError={uploadError}
          setUploadError={setUploadError}
          setPdfFile={setPdfFile}
          setPdfPages={setPdfPages}
          setSelectedPage={setSelectedPage}
          setShowPdfPreview={setShowPdfPreview}
          disabled={false}
          uploading={uploading}
          setUploading={setUploading}
        />

        <CheckboxSection
          formData={formData}
          handleCheckboxChange={handleCheckboxChange}
          disabled={false}
        />

        <AdditionalFieldsSection
          formData={formData}
          handleInputChange={handleInputChange}
          disabled={false}
        />
      </div>

      {/* Footer */}
      <div className="bg-gray-50 p-4 flex justify-end gap-4">
        <button
          onClick={handleCancelClick}
          disabled={isSubmitting}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || uploading}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save OKP'}
        </button>
      </div>

      <PDFPreviewModal
        showPdfPreview={showPdfPreview}
        setShowPdfPreview={setShowPdfPreview}
        pdfPages={pdfPages}
        selectedPage={selectedPage}
        setSelectedPage={setSelectedPage}
        uploading={uploading}
        setUploading={setUploading}
        handleFileUpload={handleFileUpload}
        handleInputChange={handleInputChange}
        setFilePreview={setFilePreview}
        setSelectedFile={setSelectedFile}
      />
    </>
  );
};

export default OKPForm;
