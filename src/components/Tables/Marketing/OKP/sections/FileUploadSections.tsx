// FileUploadSection.tsx - Fixed version
import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min?url';

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = pdfWorker;

interface FileUploadSectionProps {
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  filePreview: string;
  setFilePreview: (preview: string) => void;
  uploadError: string;
  setUploadError: (error: string) => void;
  setPdfFile: (file: File | null) => void;
  setPdfPages: (pages: string[]) => void;
  setSelectedPage: (page: string) => void;
  setShowPdfPreview: (show: boolean) => void;
  disabled: boolean;
  uploading: boolean; // Add this
  setUploading: (uploading: boolean) => void; // Add this
}

const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  selectedFile,
  setSelectedFile,
  filePreview,
  setFilePreview,
  uploadError,
  setUploadError,
  setPdfFile,
  setPdfPages,
  setSelectedPage,
  setShowPdfPreview,
  disabled,
  uploading,
  setUploading,
}) => {
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
      setPdfFile(file);
      await processPdfFile(file);
      setShowPdfPreview(true);
    } else {
      setUploadError('Please select a PDF file');
    }
  };

  const handleFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
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

      setSelectedFile(file);
      setUploadError('');

      const previewUrl = URL.createObjectURL(file);
      setFilePreview(previewUrl);
    }
  };

  const clearFileSelection = (): void => {
    setSelectedFile(null);
    setFilePreview('');
    setUploadError('');
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        File Spek Customer
      </label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        {!filePreview ? (
          <div className="text-center">
            <div className="mb-4">
              <label
                className={`bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded cursor-pointer mr-4 ${
                  disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Upload PDF
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfSelect}
                  className="hidden"
                  disabled={disabled}
                />
              </label>
              <label
                className={`bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded cursor-pointer ${
                  disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={disabled}
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
              onClick={clearFileSelection}
              disabled={disabled}
              className={`bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
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
  );
};

export default FileUploadSection;
