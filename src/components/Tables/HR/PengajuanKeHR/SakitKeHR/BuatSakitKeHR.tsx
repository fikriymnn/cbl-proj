import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import Loading from '../../../../Loading';

function BuatSakitKeHR() {
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userList, setUserList] = useState<any>();

  useEffect(() => {
    getMe();
    getMasterUser();
  }, []);

  const [me, setMe] = useState<any>();
  const [idPengaju, setIdPengaju] = useState<any>();

  async function getMe() {
    const url = `${import.meta.env.VITE_API_LINK}/me`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      setMe(res.data);
      setIdPengaju(res.data.id_karyawan);

      console.log('getme', res.data);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  async function getMasterUser() {
    const url = `${import.meta.env.VITE_API_LINK}/hr/karyawan`;
    try {
      const res = await axios.get(url, {
        params: {
          is_active: true,
        },
        withCredentials: true,
      });

      setUserList(res.data.data);
      setOptions(
        res.data.data.map((item: any) => {
          const latestBagianMesin =
            item.biodata_karyawan[0]?.bagian_mesin_karyawan?.slice(-1)[0]
              ?.nama_bagian_mesin || '';

          return {
            value: item.userid,
            label: `${item.biodata_karyawan[0]?.nik} - ${item.name} - ${item.biodata_karyawan[0]?.jabatan?.nama_jabatan} - ${latestBagianMesin}`,
          };
        }),
      );
    } catch (error: any) {
      console.log(error);
    }
  }

  const handleChangePointDepatment = (selected: any) => {
    const { value } = selected;
    const filteredData = userList.find((item: any) => item.userid == value);

    console.log(filteredData?.userid);
    setIdKaryawan(filteredData?.userid);
  };

  const [idKaryawan, setIdKaryawan] = useState<any>();
  const [tglDari, setTglDari] = useState<any>();
  const [tglSampai, setTglSampai] = useState<any>();
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  // File upload states
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState('');

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const validateAndSetFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      alert('Hanya file gambar yang diperbolehkan');
      return;
    }
    const maxSize = 1024 * 1024; // 1MB
    if (selectedFile.size > maxSize) {
      alert('Ukuran file maksimal 1 MB');
      return;
    }
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const newPreviewUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(newPreviewUrl);
    setFile(selectedFile);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(null);
    setPreviewUrl(null);
    const fileInput = document.getElementById(
      'file-upload-sakit',
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const openFullscreen = (imageUrl: string) => {
    setFullscreenImage(imageUrl);
    setIsFullscreen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
    setFullscreenImage('');
  };

  async function handleFileUpload(uploadFile: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', uploadFile);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_LINK}/images`,
        formData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      );
      return (
        response.data.fileName || response.data.filename || response.data.file
      );
    } catch (error: any) {
      console.error('Error uploading file:', error);
      throw new Error('Gagal mengupload file');
    }
  }

  // Function to clear the form
  const clearForm = () => {
    setIdKaryawan(null);
    setTglDari(null);
    setTglSampai(null);
    setSelectedEmployee(null);
    setDaysDifference(null);
    setShowError(false);
    removeFile();

    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach((input: any) => {
      input.value = '';
    });
  };

  async function postSakit() {
    if (tglDari == null) {
      alert('Tanggal Dari Belum Diisi');
      return;
    }
    if (tglSampai == null) {
      alert('Tanggal Sampai Belum Diisi');
      return;
    }
    if (!file) {
      alert('Surat sakit / bukti foto belum diupload');
      return;
    }

    const url = `${import.meta.env.VITE_API_LINK}/hr/pengajuanSakit`;
    try {
      setIsLoading(true);

      // Upload file first
      const fileName = await handleFileUpload(file);

      const res = await axios.post(
        url,
        {
          id_karyawan: idKaryawan,
          id_pengaju: idPengaju,
          dari: tglDari,
          sampai: tglSampai,
          jumlah_hari: daysDifference,
          lampiran: fileName,
        },
        {
          withCredentials: true,
        },
      );
      setIsLoading(false);

      alert('Pengajuan Sakit Berhasil');
      clearForm();
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }

  const [daysDifference, setDaysDifference] = useState<any>();
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (tglDari && tglSampai) {
      if (tglDari <= tglSampai) {
        const diffInMs = Math.abs(tglSampai - tglDari);
        const days = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
        setDaysDifference(days + 1);
        setShowError(false);
      } else {
        setDaysDifference(null);
        setShowError(true);
      }
    } else {
      setDaysDifference(null);
      setShowError(false);
    }
  }, [tglDari, tglSampai]);

  const handleStartDateChange = (event: any) => {
    setTglDari(new Date(event.target.value));
  };

  const handleEndDateChange = (event: any) => {
    setTglSampai(new Date(event.target.value));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 ">
      <div className="min-w-[700px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl flex items-center gap-3">
              <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-lg font-semibold text-gray-700">
                Loading...
              </span>
            </div>
          </div>
        )}

        {/* Fullscreen Image Modal */}
        {isFullscreen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-90 z-[99] overflow-auto"
            onClick={closeFullscreen}
          >
            <div className="relative w-full min-h-screen flex justify-center p-4">
              <img
                src={fullscreenImage}
                alt="Fullscreen"
                className="max-w-full h-auto block"
                onClick={(e) => e.stopPropagation()}
              />
              <button
                className="fixed top-4 right-4 text-white bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-70 transition-colors text-xl font-bold"
                onClick={closeFullscreen}
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600  px-8 pt-6 text-white">
          <h2 className="text-2xl font-bold  flex items-center gap-3">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            Pengajuan Sakit Karyawan
          </h2>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-b-2xl shadow-xl overflow-hidden">
          {/* Employee Selection Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 border-b border-blue-100">
            <div className="flex items-center gap-2 mb-4">
              <label className="text-orange-100 text-sm font-semibold uppercase tracking-wide">
                👤 Nama Karyawan
              </label>
            </div>
            <div className="relative">
              <Select
                placeholder="Cari..."
                options={options}
                value={selectedEmployee}
                onChange={(selectedId) => {
                  handleChangePointDepatment(selectedId);
                  setSelectedEmployee(selectedId);
                }}
                className="relative z-[60] w-full appearance-none rounded-lg border-2 border-white/20 bg-white/10 backdrop-blur-sm py-3 px-4 outline-none transition-all duration-200 focus:border-white focus:bg-white/20 active:border-white text-white placeholder-orange-200"
                menuPortalTarget={document.body}
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  menu: (base) => ({ ...base, zIndex: 9999 }),
                }}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-gray-50 rounded-b-xl p-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Left Panel - Date Period */}
              <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-orange-600 text-lg">📅</span>
                  <h2 className="text-gray-800 font-semibold text-lg">
                    Periode Sakit
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-blue-600 text-sm">📅</span>
                      <label className="text-gray-700 text-sm font-medium">
                        Dari
                      </label>
                    </div>
                    <input
                      type="date"
                      onChange={handleStartDateChange}
                      className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                      placeholder="dd/mm/yyyy"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-blue-600 text-sm">📅</span>
                      <label className="text-gray-700 text-sm font-medium">
                        Sampai
                      </label>
                    </div>
                    <input
                      type="date"
                      onChange={handleEndDateChange}
                      className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                      placeholder="dd/mm/yyyy"
                    />
                  </div>
                </div>

                {daysDifference !== null && !showError && (
                  <div className="mt-4 p-3 bg-green-100 rounded-lg border border-green-300">
                    <span className="text-green-700 text-sm font-medium">
                      Jumlah Hari: {daysDifference}
                    </span>
                  </div>
                )}

                {showError && (
                  <div className="mt-4 p-3 bg-red-100 rounded-lg border border-red-300">
                    <span className="text-red-700 text-sm">
                      Tanggal dari tidak boleh kurang dari Tanggal Sampai
                    </span>
                  </div>
                )}
              </div>

              {/* Right Panel - File Upload */}
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-blue-600 text-lg">📄</span>
                  <h2 className="text-gray-800 font-semibold text-lg">
                    Surat Sakit
                  </h2>
                </div>

                <div className="space-y-4">
                  {/* Drag & Drop Upload Area */}
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      dragActive
                        ? 'border-blue-400 bg-blue-100'
                        : file
                        ? 'border-green-400 bg-green-50'
                        : 'border-blue-300 bg-blue-50 hover:bg-blue-100'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      id="file-upload-sakit"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />

                    {file ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full">
                          <svg
                            className="w-6 h-6 text-green-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile();
                          }}
                          className="text-xs text-red-600 hover:text-red-700 relative z-10"
                        >
                          Hapus file
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <svg
                          className="w-10 h-10 mb-3 text-blue-400 mx-auto"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <p className="text-sm text-blue-600">
                          <span className="font-semibold">
                            Klik untuk upload
                          </span>{' '}
                          atau drag and drop
                        </p>
                        <p className="text-xs text-blue-500">
                          PNG, JPG, JPEG hingga 1MB
                        </p>
                        <p className="text-xs text-red-500">
                          * Lampiran foto wajib diupload
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Image Preview */}
                  {previewUrl && (
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preview Gambar
                      </label>
                      <div className="relative bg-white rounded-lg p-3 border border-blue-200">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full h-40 object-contain rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => openFullscreen(previewUrl)}
                        />
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          Klik gambar untuk memperbesar
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end mt-6">
              {!showError ? (
                <button
                  onClick={() => postSakit()}
                  disabled={
                    isLoading || !idKaryawan || !tglDari || !tglSampai || !file
                  }
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg transition-all duration-200"
                >
                  AJUKAN
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BuatSakitKeHR;
