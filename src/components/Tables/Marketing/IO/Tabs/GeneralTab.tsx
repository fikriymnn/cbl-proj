// components/mounting-tabs/GeneralTab.tsx
import React, { useState, useEffect } from 'react';
import { MountingFormData } from '../Mounting';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min?url';
import PDFPreviewModal from './PDFPreviewModal';

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = pdfWorker;

interface GeneralTabProps {
  formData: MountingFormData;
  onInputChange: (field: keyof MountingFormData, value: any) => void;
  isEditMode: boolean;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  uploading: boolean;
  setUploading: (uploading: boolean) => void;
  handleFileUpload: (file: File) => Promise<string>;
}

const GeneralTab: React.FC<GeneralTabProps> = ({
  formData,
  onInputChange,
  isEditMode,
  selectedFile,
  setSelectedFile,
  uploading,
  setUploading,
  handleFileUpload,
}) => {
  const [filePreview, setFilePreview] = useState<string>('');
  const [uploadError, setUploadError] = useState('');
  const [pdfPages, setPdfPages] = useState<string[]>([]);
  const [selectedPage, setSelectedPage] = useState<string>('');
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  // Load existing image on mount/edit mode
  useEffect(() => {
    if (formData.file && !selectedFile) {
      // Show existing uploaded image from 'file' field
      const imageUrl = `${import.meta.env.VITE_API_LINK}/images/${
        formData.file
      }`;
      setFilePreview(imageUrl);
    }
  }, [formData.file]);

  const processPdfFile = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      const pages: string[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport, canvas }).promise;
        pages.push(canvas.toDataURL());
      }

      setPdfPages(pages);
      if (pages.length > 0) {
        setSelectedPage(pages[0]);
      }
    } catch (error) {
      console.error('Error processing PDF:', error);
      setUploadError('Error processing PDF file');
    }
  };

  const handlePdfSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      await processPdfFile(file);
      setShowPdfPreview(true);
      setUploadError('');
    } else {
      setUploadError('Please select a PDF file');
    }
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setUploadError('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setUploadError('File size must be less than 5MB');
        return;
      }

      // Just set preview, don't upload yet
      setUploadError('');
      const previewUrl = URL.createObjectURL(file);
      setFilePreview(previewUrl);
      setSelectedFile(file);
    }
  };

  const clearFileSelection = (): void => {
    setSelectedFile(null);
    setFilePreview('');
    setUploadError('');
    onInputChange('file', '');

    if (filePreview && filePreview.startsWith('blob:')) {
      URL.revokeObjectURL(filePreview);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Mounting
            </label>
            <input
              type="text"
              value={formData.nama_mounting}
              onChange={(e) => onInputChange('nama_mounting', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              readOnly={!isEditMode}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Spesifikasi
            </label>
            <input
              value={formData.spesifikasi}
              onChange={(e) => onInputChange('spesifikasi', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Keterangan Revisi
          </label>
          <textarea
            value={formData.keterangan_revisi}
            onChange={(e) => onInputChange('keterangan_revisi', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* File Upload Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Foto Mounting
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          {!filePreview ? (
            <div className="text-center">
              <div className="mb-4">
                <label
                  className={`bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded cursor-pointer mr-4 ${
                    !isEditMode || uploading
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                >
                  Upload PDF
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handlePdfSelect}
                    className="hidden"
                    disabled={!isEditMode || uploading}
                  />
                </label>
                <label
                  className={`bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded cursor-pointer ${
                    !isEditMode || uploading
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                >
                  {uploading ? 'Uploading...' : 'Upload Image'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={!isEditMode || uploading}
                  />
                </label>
              </div>
              <p className="text-gray-500">
                Upload PDF to crop or select image directly
              </p>
            </div>
          ) : (
            <div className="text-center">
              <img
                src={filePreview}
                alt="Preview"
                className="max-w-xs max-h-48 mx-auto mb-4"
              />
              <button
                type="button"
                onClick={clearFileSelection}
                disabled={!isEditMode || uploading}
                className={`bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded ${
                  !isEditMode || uploading
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                Remove File
              </button>
            </div>
          )}
          {uploadError && (
            <p className="text-red-500 text-sm mt-2">{uploadError}</p>
          )}
        </div>
      </div>

      {/* PDF Preview Modal */}
      <PDFPreviewModal
        showPdfPreview={showPdfPreview}
        setShowPdfPreview={setShowPdfPreview}
        pdfPages={pdfPages}
        selectedPage={selectedPage}
        setSelectedPage={setSelectedPage}
        uploading={uploading}
        setUploading={setUploading}
        handleFileUpload={handleFileUpload}
        handleInputChange={onInputChange}
        setFilePreview={setFilePreview}
        setSelectedFile={setSelectedFile}
      />

      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
          Ukuran Jadi
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Panjang
            </label>
            <input
              type="number"
              value={formData.ukuran_jadi_panjang}
              onChange={(e) =>
                onInputChange('ukuran_jadi_panjang', Number(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-pink-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lebar
            </label>
            <input
              type="number"
              value={formData.ukuran_jadi_lebar}
              onChange={(e) =>
                onInputChange('ukuran_jadi_lebar', Number(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-pink-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tinggi
            </label>
            <input
              type="number"
              value={formData.ukuran_jadi_tinggi}
              onChange={(e) =>
                onInputChange('ukuran_jadi_tinggi', Number(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-pink-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Terb. Panjang
            </label>
            <input
              type="number"
              value={formData.ukuran_jadi_terb_panjang}
              onChange={(e) =>
                onInputChange(
                  'ukuran_jadi_terb_panjang',
                  Number(e.target.value),
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-pink-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Terb. Lebar
            </label>
            <input
              type="number"
              value={formData.ukuran_jadi_terb_lebar}
              onChange={(e) =>
                onInputChange('ukuran_jadi_terb_lebar', Number(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-pink-100"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralTab;
