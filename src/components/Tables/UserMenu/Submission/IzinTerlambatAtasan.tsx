import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Loading from '../../../Loading';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

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

interface HistoryData {
  id: number;
  id_karyawan: number;
  id_atasan: number | null;
  id_department: number;
  tanggal: string;
  alasan_terlambat: string | null;
  lama_terlambat: number;
  shift: string;
  catatan: string;
  catatan_atasan: string | null;
  file: string;
  status: string;
  status_tiket: string;
  createdAt: string;
  updatedAt: string;
  karyawan: {
    userid: number;
    name: string;
    badgenumber: string;
  };
  karyawan_atasan: {
    userid: number;
    name: string;
    badgenumber: string;
  } | null;
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

  // History states
  const [historyList, setHistoryList] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<HistoryData | null>(
    null,
  );

  // Fullscreen image state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState('');

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

  useEffect(() => {
    if (me) {
      getHistoryList();
    }
  }, [currentPage, me, statusFilter]);

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

  async function getHistoryList() {
    const url = `${import.meta.env.VITE_API_LINK}/hr/pengajuanTerlambatUser`;
    try {
      const params: any = {
        id_karyawan: me?.id_karyawan,
        page: currentPage,
        limit: 10,
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const res = await axios.get(url, {
        params,
        withCredentials: true,
      });
      setHistoryList(res.data);
    } catch (error: any) {
      console.log(error);
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

    // Calculate deadline (shift masuk - maksimal_pengajuan_terlambat minutes)
    const deadline = new Date(shiftMasukTime);
    deadline.setMinutes(
      deadline.getMinutes() - (masterSetting.maksimal_pengajuan_terlambat || 0),
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

  const openFullscreen = (imageUrl: string) => {
    setFullscreenImage(imageUrl);
    setIsFullscreen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
    setFullscreenImage('');
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
      const formattedDate = tanggal;

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

      // Refresh history list
      getHistoryList();
    } catch (error: any) {
      setIsLoading(false);
      console.error('Error submitting:', error);
      alert(
        error.response?.data?.message ||
          'Terjadi kesalahan saat mengirim pengajuan',
      );
    }
  };

  const handleViewDetail = (data: HistoryData) => {
    setSelectedRequest(data);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'request atasan':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'request manajemen':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'request atasan':
      case 'request manajemen':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'approved':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'rejected':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const handleResetFilter = () => {
    setStatusFilter('all');
    setCurrentPage(1);
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

      {/* Fullscreen Image Modal */}
      {isFullscreen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-99 overflow-auto"
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

      {/* Detail Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white rounded-t-2xl">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                Detail Pengajuan Izin Terlambat
              </h3>
              <p className="text-blue-100 text-sm mt-1">
                ID Pengajuan: #{selectedRequest.id}
              </p>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-6">
              <div className="space-y-4">
                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-bold text-sm ${getStatusBadge(
                      selectedRequest.status,
                    )}`}
                  >
                    {getStatusIcon(selectedRequest.status)}
                    {selectedRequest.status.toUpperCase()}
                  </div>
                  <div className="text-sm text-gray-500">
                    Diajukan: {formatDateTime(selectedRequest.createdAt)}
                  </div>
                </div>

                {/* Employee Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-700 mb-3">
                    Informasi Karyawan
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600">Nama:</p>
                      <p className="font-semibold text-gray-800">
                        {selectedRequest.karyawan?.name || '-'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Lateness Details */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-700 mb-3">
                    Detail Keterlambatan
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-gray-600">Tanggal:</p>
                        <p className="font-semibold text-gray-800">
                          {formatDate(selectedRequest.tanggal)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Shift:</p>
                        <p className="font-semibold text-gray-800">
                          Shift {selectedRequest.shift}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-gray-600">Alasan Terlambat:</p>
                        <p className="font-semibold text-gray-800">
                          {selectedRequest.alasan_terlambat || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Durasi:</p>
                        <p className="font-semibold text-gray-800">
                          {selectedRequest.lama_terlambat} jam
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600">Catatan:</p>
                      <p className="font-semibold text-gray-800">
                        {selectedRequest.catatan || '-'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Atasan Info */}
                {selectedRequest.karyawan_atasan && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-700 mb-3">
                      Informasi Atasan
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600">Nama Atasan:</p>
                        <p className="font-semibold text-gray-800">
                          {selectedRequest.karyawan_atasan?.name || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Badge Number:</p>
                        <p className="font-semibold text-gray-800">
                          {selectedRequest.karyawan_atasan?.badgenumber || '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rejection Reason */}
                {selectedRequest.status.toLowerCase() === 'rejected' &&
                  selectedRequest.catatan_atasan && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                      <h4 className="font-semibold text-red-700 mb-2">
                        Alasan Penolakan
                      </h4>
                      <p className="text-sm text-gray-800">
                        {selectedRequest.catatan_atasan}
                      </p>
                    </div>
                  )}

                {/* File Evidence */}
                {selectedRequest.file && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-700 mb-3">
                      Bukti Lampiran
                    </h4>
                    <div className="flex items-center justify-center">
                      <img
                        src={`${import.meta.env.VITE_API_LINK}/images/${
                          selectedRequest.file
                        }`}
                        alt="Bukti"
                        className="object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity max-h-64"
                        onClick={() =>
                          openFullscreen(
                            `${import.meta.env.VITE_API_LINK}/images/${
                              selectedRequest.file
                            }`,
                          )
                        }
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Klik gambar untuk memperbesar
                    </p>
                  </div>
                )}

                {/* Timeline */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-700 mb-3">Timeline</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                      <div>
                        <p className="text-gray-600">Diajukan:</p>
                        <p className="font-semibold text-gray-800">
                          {formatDateTime(selectedRequest.createdAt)}
                        </p>
                      </div>
                    </div>
                    {selectedRequest.updatedAt !==
                      selectedRequest.createdAt && (
                      <div className="flex items-start gap-2">
                        <div
                          className={`w-2 h-2 rounded-full mt-1.5 ${
                            selectedRequest.status.toLowerCase() === 'approved'
                              ? 'bg-green-500'
                              : selectedRequest.status.toLowerCase() ===
                                'rejected'
                              ? 'bg-red-500'
                              : 'bg-blue-500'
                          }`}
                        ></div>
                        <div>
                          <p className="text-gray-600">Terakhir diupdate:</p>
                          <p className="font-semibold text-gray-800">
                            {formatDateTime(selectedRequest.updatedAt)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end">
              <button
                onClick={closeModal}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all duration-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* FORM SECTION */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
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
                    <span className="font-bold text-lg">
                      {lamaTerlambat} jam
                    </span>
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
                        className="w-full h-48 object-contain rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
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
          <div className="flex w-full justify-end items-center gap-4 px-8 py-6 bg-gray-50 border-t border-gray-200">
            <button
              onClick={handleSubmit}
              disabled={isLoading || !!timeError}
              className="flex px-8 py-3 justify-center items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 shadow-lg hover:shadow-xl text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
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

        {/* HISTORY TABLE SECTION */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-white">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
              Riwayat Pengajuan Izin Terlambat
            </h2>
            <p className="text-blue-100 text-sm">
              Lihat semua pengajuan izin terlambat Anda
            </p>
          </div>

          {/* Filter Section */}
          <div className="px-8 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-4 flex-wrap">
              <label className="text-gray-700 font-semibold text-sm">
                Filter Status:
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              >
                <option value="all">Semua Status</option>
                <option value="request manajemen">Request Manajemen</option>
                <option value="approved">Disetujui</option>
                <option value="rejected">Ditolak</option>
              </select>
              {statusFilter !== 'all' && (
                <button
                  onClick={handleResetFilter}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-semibold rounded-lg transition-all duration-200"
                >
                  Reset Filter
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              <div className="grid grid-cols-12 px-8 py-4 border-b-4 border-gray-200 gap-2 bg-gray-50">
                <label className="text-neutral-700 text-sm font-bold">No</label>
                <label className="text-neutral-700 text-sm font-bold col-span-2">
                  Tanggal
                </label>
                <label className="text-neutral-700 text-sm font-bold col-span-2">
                  Alasan
                </label>
                <label className="text-neutral-700 text-sm font-bold">
                  Durasi
                </label>
                <label className="text-neutral-700 text-sm font-bold">
                  Shift
                </label>
                <label className="text-neutral-700 text-sm font-bold col-span-2">
                  Status
                </label>
                <label className="text-neutral-700 text-sm font-bold col-span-2">
                  Diajukan
                </label>
                <label className="text-neutral-700 text-sm font-bold">
                  Action
                </label>
              </div>

              {historyList?.data && historyList.data.length > 0 ? (
                historyList.data.map((data: HistoryData, i: number) => (
                  <div
                    key={data.id}
                    className="grid grid-cols-12 border-b-4 border-gray-200 gap-2 items-center px-8 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <label className="text-neutral-600 text-sm font-semibold">
                      {(currentPage - 1) * 10 + i + 1}
                    </label>

                    <div className="flex flex-col col-span-2">
                      <label className="text-neutral-800 text-sm font-semibold">
                        {formatDate(data.tanggal)}
                      </label>
                    </div>

                    <label className="text-neutral-600 text-sm col-span-2">
                      {data.alasan_terlambat || '-'}
                    </label>

                    <label className="text-neutral-800 text-sm font-semibold">
                      {data.lama_terlambat} jam
                    </label>

                    <label className="text-neutral-800 text-sm font-semibold">
                      Shift {data.shift}
                    </label>

                    <div className="col-span-2">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-bold ${getStatusBadge(
                          data.status,
                        )}`}
                      >
                        {getStatusIcon(data.status)}
                        {data.status.toUpperCase()}
                      </span>
                    </div>

                    <label className="text-neutral-600 text-xs col-span-2">
                      {formatDateTime(data.createdAt)}
                    </label>

                    <div className="flex justify-center">
                      <button
                        onClick={() => handleViewDetail(data)}
                        className="px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-purple-600 hover:to-pink-600 text-white text-xs font-bold rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-1"
                        title="Lihat detail"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path
                            fillRule="evenodd"
                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Detail
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-8 py-12 text-center">
                  <svg
                    className="w-16 h-16 mx-auto text-gray-400 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-gray-500 text-lg font-medium">
                    Tidak ada data pengajuan
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    {statusFilter !== 'all'
                      ? 'Tidak ada pengajuan dengan status yang dipilih'
                      : 'Anda belum memiliki riwayat pengajuan izin terlambat'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Pagination */}
          {historyList && historyList.total_page > 1 && (
            <div className="flex items-center justify-center gap-2 px-8 py-6 bg-gray-50 border-t border-gray-200">
              <Stack spacing={2}>
                <Pagination
                  count={historyList.total_page}
                  color="secondary"
                  page={currentPage}
                  onChange={(e, page) => setCurrentPage(page)}
                />
              </Stack>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default IzinTerlambatAtasan;
