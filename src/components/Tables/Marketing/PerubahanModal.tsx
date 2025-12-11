import React, { useState } from 'react';
import axios from 'axios';
import { PerubahanFormData } from './CreatePerubahan';

interface PerubahanModalProps {
  isOpen: boolean;
  formData: PerubahanFormData;
  onClose: () => void;
  onSubmit: (formData: PerubahanFormData) => Promise<void>;
  onFormChange: (formData: PerubahanFormData) => void;
}

const PerubahanModal: React.FC<PerubahanModalProps> = ({
  isOpen,
  formData,
  onClose,
  onSubmit,
  onFormChange,
}) => {
  const [activeTab, setActiveTab] = useState<number>(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  // File upload handler similar to second code
  const handleFileUpload = async (file: File): Promise<string> => {
    setUploading(true);
    setUploadError('');

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_LINK}/images`,
        uploadFormData,
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
  };

  const handleFileDelete = async (fileName: string): Promise<void> => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_LINK}/images/${fileName}`,
        { withCredentials: true },
      );
    } catch (error: any) {
      console.error('Error deleting file:', error);
      throw error;
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

  const removeExistingFile = async (): Promise<void> => {
    if (formData.file) {
      try {
        await handleFileDelete(formData.file);
        onFormChange({ ...formData, file: '' });
      } catch (error) {
        console.error('Error removing file:', error);
      }
    }
  };

  const handleSubmitPerubahan = async (): Promise<void> => {
    try {
      setSubmitting(true);

      let fileUrl = formData.file;

      if (selectedFile) {
        fileUrl = await handleFileUpload(selectedFile);
      }

      const submitData = {
        ...formData,
        file: fileUrl,
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting perubahan:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">
            Pengajuan Perubahan
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Modal Body with Tabs */}
        <div className="flex-1 overflow-auto">
          {/* Tabs */}
          <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
            <div className="flex px-6">
              <button
                onClick={() => setActiveTab(1)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 1
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Tab 1
              </button>
              <button
                onClick={() => setActiveTab(2)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 2
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Tab 2
              </button>
              <button
                onClick={() => setActiveTab(3)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 3
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Tab 3
              </button>
            </div>
          </div>
          {/* Tab Content */}
          <div className="p-6">
            {/* Tab 1 - Main Info */}
            {activeTab === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Non-editable fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nomor Pengajuan
                    </label>
                    <input
                      type="text"
                      value={formData.no_perubahan_invoice}
                      disabled
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nomor Invoice
                    </label>
                    <input
                      type="text"
                      value={formData.no_invoice}
                      disabled
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tgl Invoice
                    </label>
                    <input
                      type="date"
                      value={formatDateForInput(formData.tgl_invoice)}
                      disabled
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nomor PO
                    </label>
                    <input
                      type="text"
                      value={formData.no_po}
                      disabled
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <input
                      type="text"
                      value="printed"
                      disabled
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pelanggan
                    </label>
                    <input
                      type="text"
                      value={formData.nama_customer}
                      disabled
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alamat
                    </label>
                    <textarea
                      value={formData.alamat}
                      disabled
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-100 text-gray-600 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal Pengajuan
                    </label>
                    <input
                      type="date"
                      value={formatDateForInput(new Date().toISOString())}
                      disabled
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2 - Data Lama & Baru */}
            {activeTab === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Data Lama (Left) */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 pb-2 border-b">
                    Data Lama
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Alamat Customer
                      </label>
                      <textarea
                        value={formData.alamat}
                        disabled
                        rows={3}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-100 text-gray-600 resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tanggal Faktur
                      </label>
                      <input
                        type="date"
                        value={formatDateForInput(formData.tgl_faktur)}
                        disabled
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Data Baru (Right) */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 pb-2 border-b">
                    Data Baru
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Alamat Customer
                      </label>
                      <textarea
                        value={formData.new_alamat}
                        onChange={(e) =>
                          onFormChange({
                            ...formData,
                            new_alamat: e.target.value,
                          })
                        }
                        rows={3}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tanggal Faktur
                      </label>
                      <input
                        type="date"
                        value={formatDateForInput(formData.new_tgl_faktur)}
                        onChange={(e) =>
                          onFormChange({
                            ...formData,
                            new_tgl_faktur: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3 - Products & File Upload */}
            {activeTab === 3 && (
              <div className="space-y-6">
                {/* Products Table */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Produk
                  </h3>
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Produk
                          </th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                            Qty Lama
                          </th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                            Harga Lama
                          </th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                            Qty Baru
                          </th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                            Harga Baru
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {formData.perubahan_invoice_produk.map(
                          (prod, index) => (
                            <tr key={index}>
                              <td className="px-3 py-2 text-xs text-gray-900">
                                {prod.nama_produk}
                              </td>
                              <td className="px-3 py-2 text-center">
                                <input
                                  type="number"
                                  value={prod.qty}
                                  disabled
                                  className="w-24 px-2 py-1 text-xs text-center border border-gray-300 rounded bg-gray-100 text-gray-600"
                                />
                              </td>
                              <td className="px-3 py-2 text-center">
                                <input
                                  type="number"
                                  value={prod.harga}
                                  disabled
                                  className="w-28 px-2 py-1 text-xs text-center border border-gray-300 rounded bg-gray-100 text-gray-600"
                                />
                              </td>
                              <td className="px-3 py-2 text-center">
                                <input
                                  type="number"
                                  value={prod.new_qty}
                                  onChange={(e) => {
                                    const updated = [
                                      ...formData.perubahan_invoice_produk,
                                    ];
                                    updated[index].new_qty = Number(
                                      e.target.value,
                                    );
                                    onFormChange({
                                      ...formData,
                                      perubahan_invoice_produk: updated,
                                    });
                                  }}
                                  className="w-24 px-2 py-1 text-xs text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </td>
                              <td className="px-3 py-2 text-center">
                                <input
                                  type="number"
                                  value={prod.new_harga}
                                  onChange={(e) => {
                                    const updated = [
                                      ...formData.perubahan_invoice_produk,
                                    ];
                                    updated[index].new_harga = Number(
                                      e.target.value,
                                    );
                                    onFormChange({
                                      ...formData,
                                      perubahan_invoice_produk: updated,
                                    });
                                  }}
                                  className="w-28 px-2 py-1 text-xs text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* File Upload & Note */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bukti permintaan perubahan data
                    </label>

                    {/* File Input */}
                    <div className="mb-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      {uploadError && (
                        <p className="text-red-500 text-sm mt-1">
                          {uploadError}
                        </p>
                      )}
                    </div>

                    {/* File Preview Section */}
                    <div className="space-y-4">
                      {/* New File Preview */}
                      {filePreview && (
                        <div className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              New Image Preview:
                            </span>
                            <button
                              type="button"
                              onClick={clearFileSelection}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                          <img
                            src={filePreview}
                            alt="Preview"
                            className="max-w-full h-48 object-contain border border-gray-200 rounded"
                          />
                          {selectedFile && (
                            <p className="text-sm text-gray-500 mt-2">
                              {selectedFile.name} (
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                            </p>
                          )}
                        </div>
                      )}

                      {/* Existing File Preview */}
                      {formData.file && !filePreview && (
                        <div className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              Current Image:
                            </span>
                            <button
                              type="button"
                              onClick={removeExistingFile}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                          <img
                            src={`${import.meta.env.VITE_API_LINK}/images/${
                              formData.file
                            }`}
                            alt="Current file"
                            className="max-w-full h-48 object-contain border border-gray-200 rounded"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <p className="text-sm text-gray-500 mt-2">
                            {formData.file}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Upload Progress */}
                    {uploading && (
                      <div className="mt-2">
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                          <span className="text-sm text-gray-600">
                            Uploading...
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Catatan
                    </label>
                    <textarea
                      value={formData.note}
                      onChange={(e) =>
                        onFormChange({
                          ...formData,
                          note: e.target.value,
                        })
                      }
                      rows={3}
                      placeholder="Masukkan catatan perubahan..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmitPerubahan}
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              'Save'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
export default PerubahanModal;
