import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Loading from '../../../Loading';

interface MasterTerlambat {
  id: number;
  alasan_terlambat: string;
  jumlah_jam: number;
}

interface MasterSetting {
  maksimal_pengajuan_terlambat: number;
}

interface MasterShift {
  hari: string;
  shift_1_masuk: string;
  shift_1_keluar: string;
  shift_2_masuk: string;
  shift_2_keluar: string;
}

function IzinTerlambatAtasan() {
  const [isLoading, setIsLoading] = useState(false);
  const [me, setMe] = useState<any>(null);

  // Master data
  const [masterTerlambat, setMasterTerlambat] = useState<MasterTerlambat[]>([]);
  const [masterSetting, setMasterSetting] = useState<MasterSetting | null>(
    null,
  );
  const [masterShift, setMasterShift] = useState<MasterShift[]>([]);

  // Form states
  const [tanggal, setTanggal] = useState('');
  const [alasanTerlambat, setAlasanTerlambat] = useState('');
  const [lamaTerlambat, setLamaTerlambat] = useState<number>(0);
  const [shift, setShift] = useState('');
  const [catatan, setCatatan] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Validation states
  const [dateError, setDateError] = useState('');
  const [timeError, setTimeError] = useState('');

  useEffect(() => {
    getMe();
    getMasterTerlambat();
    getMasterSetting();
    getMasterShift();
  }, []);

  useEffect(() => {
    // Clean up preview URL on unmount
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    // Validate submission time when tanggal or shift changes
    if (tanggal && shift && masterSetting && masterShift.length > 0) {
      validateSubmissionTime();
    }
  }, [tanggal, shift, masterSetting, masterShift]);

  async function getMe() {
    const url = `${import.meta.env.VITE_API_LINK}/me`;
    try {
      const res = await axios.get(url, { withCredentials: true });
      setMe(res.data);
    } catch (error: any) {
      console.error('Error fetching user data:', error);
    }
  }

  async function getMasterTerlambat() {
    const url = `${import.meta.env.VITE_API_LINK}/master/hr/terlambat`;
    try {
      const res = await axios.get(url, { withCredentials: true });
      setMasterTerlambat(res.data.data || []);
    } catch (error: any) {
      console.error('Error fetching master terlambat:', error);
    }
  }

  async function getMasterSetting() {
    const url = `${import.meta.env.VITE_API_LINK}/master/hr/absensi`;
    try {
      const res = await axios.get(url, { withCredentials: true });
      setMasterSetting(res.data);
    } catch (error: any) {
      console.error('Error fetching master setting:', error);
    }
  }

  async function getMasterShift() {
    const url = `${import.meta.env.VITE_API_LINK}/master/shift`;
    try {
      const res = await axios.get(url, { withCredentials: true });
      setMasterShift(res.data.data || []);
    } catch (error: any) {
      console.error('Error fetching master shift:', error);
    }
  }

  function validateSubmissionTime() {
    if (!tanggal || !shift || !masterSetting || masterShift.length === 0) {
      return;
    }

    const selectedDate = new Date(tanggal);
    const dayName = selectedDate.toLocaleDateString('id-ID', {
      weekday: 'long',
    });

    // Map Indonesian day names to match master shift
    const dayMapping: { [key: string]: string } = {
      Minggu: 'Minggu',
      Senin: 'Senin',
      Selasa: 'Selasa',
      Rabu: 'Rabu',
      Kamis: 'Kamis',
      Jumat: 'Jumat',
      Sabtu: 'Sabtu',
    };

    const mappedDay = dayMapping[dayName];
    const shiftData = masterShift.find((s) => s.hari === mappedDay);

    if (!shiftData) {
      setTimeError('Data shift untuk hari ini tidak ditemukan');
      return;
    }

    const now = new Date();
    const shiftMasuk =
      shift === '1' ? shiftData.shift_1_masuk : shiftData.shift_2_masuk;

    if (!shiftMasuk) {
      setTimeError('Jam masuk shift tidak ditemukan');
      return;
    }

    // Parse shift masuk time
    const [hours, minutes] = shiftMasuk.split(':').map(Number);
    const shiftMasukTime = new Date(selectedDate);
    shiftMasukTime.setHours(hours, minutes, 0, 0);

    // Calculate deadline (shift masuk - maksimal_pengajuan_terlambat hours)
    const deadline = new Date(shiftMasukTime);
    deadline.setHours(
      deadline.getHours() - (masterSetting.maksimal_pengajuan_terlambat || 0),
    );

    // Check if current time is before deadline
    if (now > deadline) {
      setTimeError(
        `Waktu pengajuan sudah lewat. Batas pengajuan adalah ${deadline.toLocaleTimeString(
          'id-ID',
          {
            hour: '2-digit',
            minute: '2-digit',
          },
        )}`,
      );
    } else {
      setTimeError('');
    }
  }

  const getTodayAndTomorrow = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };

    return {
      today: formatDate(today),
      tomorrow: formatDate(tomorrow),
    };
  };

  const { today, tomorrow } = getTodayAndTomorrow();

  const handleAlasanChange = (alasanId: string) => {
    const selected = masterTerlambat.find(
      (item) => item.id.toString() === alasanId,
    );
    if (selected) {
      setAlasanTerlambat(selected.alasan_terlambat);
      setLamaTerlambat(selected.jumlah_jam);
    }
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

  const validateAndSetFile = (file: File) => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Hanya file gambar yang diperbolehkan');
      return;
    }

    // Check file size (1MB = 1024 * 1024 bytes)
    const maxSize = 1024 * 1024; // 1MB
    if (file.size > maxSize) {
      alert('Ukuran file maksimal 1 MB');
      return;
    }

    // Clean up previous preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    // Create new preview URL
    const newPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(newPreviewUrl);
    setFile(file);
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
      'file-upload',
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  async function handleFileUpload(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_LINK}/images`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
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

  const handleSubmit = async () => {
    // Validation
    if (!tanggal) {
      alert('Tanggal harus diisi');
      return;
    }
    if (!alasanTerlambat) {
      alert('Alasan terlambat harus dipilih');
      return;
    }
    if (!shift) {
      alert('Shift harus dipilih');
      return;
    }
    if (!catatan) {
      alert('Catatan harus diisi');
      return;
    }
    if (!file) {
      alert('File bukti harus diupload');
      return;
    }
    if (timeError) {
      alert(timeError);
      return;
    }

    setIsLoading(true);
    const url = `${import.meta.env.VITE_API_LINK}/hr/pengajuanTerlambatUser`;

    try {
      // Upload file first
      const fileName = await handleFileUpload(file);

      // Format date to DD-MM-YYYY
      const selectedDate = new Date(tanggal);
      const formattedDate = `${String(selectedDate.getDate()).padStart(
        2,
        '0',
      )}-${String(selectedDate.getMonth() + 1).padStart(
        2,
        '0',
      )}-${selectedDate.getFullYear()}`;

      const requestData = {
        id_karyawan: me?.id_karyawan,
        tanggal: formattedDate,
        alasan_terlambat: alasanTerlambat,
        lama_terlambat: lamaTerlambat,
        shift: shift,
        catatan: catatan,
        file: fileName,
        tipe_user: 'atasan',
      };

      console.log('Request data:', requestData);

      await axios.post(url, requestData, {
        withCredentials: true,
      });

      setIsLoading(false);
      alert('Pengajuan izin terlambat berhasil disubmit!');

      // Clear form
      setTanggal('');
      setAlasanTerlambat('');
      setLamaTerlambat(0);
      setShift('');
      setCatatan('');
      removeFile();
      setTimeError('');
    } catch (error: any) {
      setIsLoading(false);
      console.error('Error submitting:', error);
      alert(
        error.response?.data?.message ||
          'Terjadi kesalahan saat mengirim pengajuan',
      );
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-gray-700 font-medium">Processing...</span>
          </div>
        </div>
      )}

      <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-white">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            Pengajuan Izin Terlambat (Atasan)
          </h2>
          <p className="text-blue-100 text-sm">
            Submit pengajuan izin terlambat Anda
          </p>
        </div>

        {/* Form */}
        <div className="px-8 py-6">
          <div className="space-y-6">
            {/* Tanggal */}
            <div className="flex flex-col gap-2">
              <label className="text-gray-700 text-sm font-semibold flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
                Tanggal <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={tanggal}
                min={today}
                max={tomorrow}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-gray-800 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              />
              {dateError && (
                <p className="text-red-600 text-sm flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {dateError}
                </p>
              )}
            </div>

            {/* Shift */}
            <div className="flex flex-col gap-2">
              <label className="text-gray-700 text-sm font-semibold">
                Shift <span className="text-red-500">*</span>
              </label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-gray-800 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              >
                <option value="">Pilih Shift</option>
                <option value="1">Shift 1</option>
                <option value="2">Shift 2</option>
              </select>
              {timeError && (
                <p className="text-red-600 text-sm flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {timeError}
                </p>
              )}
            </div>

            {/* Alasan Terlambat */}
            <div className="flex flex-col gap-2">
              <label className="text-gray-700 text-sm font-semibold">
                Alasan Terlambat <span className="text-red-500">*</span>
              </label>
              <select
                onChange={(e) => handleAlasanChange(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-gray-800 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              >
                <option value="">Pilih Alasan</option>
                {masterTerlambat.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.alasan_terlambat} ({item.jumlah_jam} jam)
                  </option>
                ))}
              </select>
            </div>

            {/* Lama Terlambat (Read-only) */}
            {lamaTerlambat > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-700 font-medium">
                  Durasi Keterlambatan:{' '}
                  <span className="font-bold text-lg">{lamaTerlambat} jam</span>
                </p>
              </div>
            )}

            {/* Catatan */}
            <div className="flex flex-col gap-2">
              <label className="text-gray-700 text-sm font-semibold">
                Catatan <span className="text-red-500">*</span>
              </label>
              <textarea
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                className="min-h-[100px] w-full resize-none border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-800 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                placeholder="Jelaskan detail keterlambatan Anda..."
              />
            </div>

            {/* File Upload */}
            <div className="flex flex-col gap-2">
              <label className="text-gray-700 text-sm font-semibold">
                Upload Bukti (Gambar) <span className="text-red-500">*</span>
              </label>

              <div
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-400 bg-blue-50'
                    : file
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="file-upload"
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
                      onClick={removeFile}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Hapus file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center w-12 h-12 mx-auto bg-gray-100 rounded-full">
                      <svg
                        className="w-6 h-6 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-blue-600">
                        Klik untuk upload
                      </span>{' '}
                      atau drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, JPEG hingga 1MB
                    </p>
                    <p className="text-xs text-red-500 mt-2">
                      * File gambar wajib diupload
                    </p>
                  </div>
                )}
              </div>

              {/* Image Preview */}
              {previewUrl && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preview Gambar
                  </label>
                  <div className="relative bg-gray-50 rounded-lg p-4">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-48 object-contain rounded-lg border border-gray-200"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex w-full justify-end items-center gap-4 px-8 py-6 bg-gray-50 border-t border-gray-200">
          <button
            onClick={handleSubmit}
            disabled={isLoading || !!timeError}
            className="flex px-8 py-3 justify-center items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 shadow-lg hover:shadow-xl text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            {isLoading ? 'PROCESSING...' : 'SUBMIT PENGAJUAN'}
          </button>
        </div>
      </div>
    </main>
  );
}

export default IzinTerlambatAtasan;
