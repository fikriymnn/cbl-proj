import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

interface PengajuanTerlambat {
  tanggal_masuk: string;
  id: number;
  id_karyawan: number;
  id_atasan: number | null;
  id_department: number;
  tanggal: string;
  alasan_terlambat: string;
  lama_terlambat: number;
  shift: string;
  catatan: string;
  file: string;
  tipe_user: string;
  status: string;
  catatan_atasan: string | null;
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

interface ApiResponse {
  data: PengajuanTerlambat[];
  page: number;
  limit: number;
  total_data: number;
  total_page: number;
}

function ApprovalIzinTerlambat() {
  const [isLoading, setIsLoading] = useState(false);
  const [me, setMe] = useState<any>(null);
  const [requestList, setRequestList] = useState<ApiResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNoDivisiBawahan, setHasNoDivisiBawahan] = useState(false);

  // Detail modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetailRequest, setSelectedDetailRequest] =
    useState<PengajuanTerlambat | null>(null);

  // Approval/Rejection modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'approve' | 'reject' | null>(null);
  const [selectedRequest, setSelectedRequest] =
    useState<PengajuanTerlambat | null>(null);
  const [catatanAtasan, setCatatanAtasan] = useState('');

  // Image modal states
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    getMe();
  }, []);

  useEffect(() => {
    if (me) {
      const isSuperAdminOrDev =
        me.role === 'super admin' || me.role === 'developer';

      if (
        !isSuperAdminOrDev &&
        (!me.divisi_bawahan || me.divisi_bawahan === '')
      ) {
        setHasNoDivisiBawahan(true);
        return;
      }

      setHasNoDivisiBawahan(false);
      getRequestList();
    }
  }, [currentPage, me]);

  async function getMe() {
    const url = `${import.meta.env.VITE_API_LINK}/me`;
    try {
      const res = await axios.get(url, { withCredentials: true });
      setMe(res.data);
    } catch (error: any) {
      console.error('Error fetching user data:', error);
    }
  }

  async function getRequestList() {
    if (!me) return;

    const url = `${import.meta.env.VITE_API_LINK}/hr/pengajuanTerlambatUser`;
    try {
      setIsLoading(true);
      const isSuperAdminOrDev =
        me.role === 'super admin' || me.role === 'developer';

      const params: any = {
        page: currentPage,
        limit: 10,
      };

      if (!isSuperAdminOrDev) {
        params.id_department = me?.id_department;
        params.divisi_bawahan = me?.divisi_bawahan;
      }

      const res = await axios.get(url, {
        params,
        withCredentials: true,
      });
      setRequestList(res.data);
      console.log('Request list:', res.data);
    } catch (error: any) {
      console.error('Error fetching request list:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleViewDetail = (data: PengajuanTerlambat) => {
    setSelectedDetailRequest(data);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedDetailRequest(null);
  };

  const handleApprove = (data: PengajuanTerlambat) => {
    setSelectedRequest(data);
    setModalType('approve');
    setCatatanAtasan('');
    setShowModal(true);
  };

  const handleReject = (data: PengajuanTerlambat) => {
    setSelectedRequest(data);
    setModalType('reject');
    setCatatanAtasan('');
    setShowModal(true);
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  const confirmApprove = async () => {
    if (!selectedRequest) return;

    if (!catatanAtasan.trim()) {
      alert('Catatan atasan harus diisi');
      return;
    }

    setIsLoading(true);
    const url = `${
      import.meta.env.VITE_API_LINK
    }/hr/pengajuanTerlambatUser/approve/${selectedRequest.id}`;

    try {
      await axios.put(
        url,
        {
          catatan_atasan: catatanAtasan,
        },
        {
          withCredentials: true,
        },
      );

      setIsLoading(false);
      alert('Pengajuan izin terlambat berhasil disetujui!');
      setShowModal(false);
      setSelectedRequest(null);
      setCatatanAtasan('');
      getRequestList();
    } catch (error: any) {
      setIsLoading(false);
      console.error('Error approving request:', error);
      alert(
        error.response?.data?.message ||
          'Terjadi kesalahan saat menyetujui pengajuan',
      );
    }
  };

  const confirmReject = async () => {
    if (!selectedRequest) return;

    if (!catatanAtasan.trim()) {
      alert('Catatan atasan harus diisi');
      return;
    }

    setIsLoading(true);
    const url = `${
      import.meta.env.VITE_API_LINK
    }/hr/pengajuanTerlambatUser/reject/${selectedRequest.id}`;

    try {
      await axios.put(
        url,
        {
          catatan_atasan: catatanAtasan,
        },
        {
          withCredentials: true,
        },
      );

      setIsLoading(false);
      alert('Pengajuan izin terlambat berhasil ditolak!');
      setShowModal(false);
      setSelectedRequest(null);
      setCatatanAtasan('');
      getRequestList();
    } catch (error: any) {
      setIsLoading(false);
      console.error('Error rejecting request:', error);
      alert(
        error.response?.data?.message ||
          'Terjadi kesalahan saat menolak pengajuan',
      );
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
    setModalType(null);
    setCatatanAtasan('');
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage('');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { color: string; text: string } } = {
      'request atasan': {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        text: 'Request Atasan',
      },
      'request manajemen': {
        color: 'bg-blue-100 text-blue-800 border-blue-300',
        text: 'Request Manajemen',
      },
      pending: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        text: 'Menunggu',
      },
      approved: {
        color: 'bg-green-100 text-green-800 border-green-300',
        text: 'Disetujui',
      },
      rejected: {
        color: 'bg-red-100 text-red-800 border-red-300',
        text: 'Ditolak',
      },
    };

    const statusInfo = statusMap[status.toLowerCase()] || statusMap['pending'];

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.color}`}
      >
        {statusInfo.text.toUpperCase()}
      </span>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'request atasan':
      case 'request manajemen':
      case 'pending':
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

  // Show notification if divisi_bawahan not set (for non super admin/developer)
  if (hasNoDivisiBawahan) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-green-50 p-6">
        <div className="w-full mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-600 to-yellow-600 px-8 py-6 text-white">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Persetujuan Izin Terlambat
            </h2>
          </div>
          <div className="p-8 flex flex-col items-center justify-center py-16">
            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-8 max-w-md w-full text-center">
              <div className="flex items-center justify-center mb-4">
                <svg
                  className="w-16 h-16 text-yellow-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Akses Terbatas
              </h3>
              <p className="text-base text-gray-600 mb-2">
                Divisi Bawahan belum di-set
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Silakan hubungi administrator untuk mengatur divisi bawahan pada
                akun Anda agar dapat mengakses halaman ini.
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-green-50 ">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            <span className="text-gray-700 font-medium">Processing...</span>
          </div>
        </div>
      )}

      {/* Fullscreen Image Modal */}
      {showImageModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-99 overflow-auto"
          onClick={closeImageModal}
        >
          <div className="relative w-full min-h-screen flex justify-center p-4">
            <img
              src={selectedImage}
              alt="Bukti keterlambatan"
              className="max-w-full h-auto block"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="fixed top-4 right-4 text-white bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-70 transition-colors text-xl font-bold"
              onClick={closeImageModal}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedDetailRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-orange-600 to-yellow-600 px-6 py-4 text-white rounded-t-2xl">
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
              <p className="text-orange-100 text-sm mt-1">
                ID Pengajuan: #{selectedDetailRequest.id}
              </p>
            </div>

            <div className="px-6 py-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-bold text-sm ${
                      selectedDetailRequest.status.toLowerCase() ===
                      'request atasan'
                        ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                        : selectedDetailRequest.status.toLowerCase() ===
                          'approved'
                        ? 'bg-green-100 text-green-800 border-green-300'
                        : selectedDetailRequest.status.toLowerCase() ===
                          'rejected'
                        ? 'bg-red-100 text-red-800 border-red-300'
                        : 'bg-blue-100 text-blue-800 border-blue-300'
                    }`}
                  >
                    {getStatusIcon(selectedDetailRequest.status)}
                    {selectedDetailRequest.status.toUpperCase()}
                  </div>
                  <div className="text-sm text-gray-500">
                    Diajukan: {formatDateTime(selectedDetailRequest.createdAt)}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-700 mb-3">
                    Informasi Karyawan
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600">Nama:</p>
                      <p className="font-semibold text-gray-800">
                        {selectedDetailRequest.karyawan?.name || '-'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-700 mb-3">
                    Detail Keterlambatan
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-gray-600">
                          Tanggal & Jam Kedatangan:
                        </p>
                        <p className="font-semibold text-gray-800">
                          {formatDateTime(selectedDetailRequest.tanggal_masuk)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Shift:</p>
                        <p className="font-semibold text-gray-800">
                          Shift {selectedDetailRequest.shift}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-gray-600">Alasan Terlambat:</p>
                        <p className="font-semibold text-gray-800">
                          {selectedDetailRequest.alasan_terlambat || '-'}
                        </p>
                      </div>
                      {/* <div>
                        <p className="text-gray-600">Durasi:</p>
                        <p className="font-semibold text-gray-800">
                          {selectedDetailRequest.lama_terlambat} jam
                        </p>
                      </div> */}
                    </div>
                    <div>
                      <p className="text-gray-600">Catatan Karyawan:</p>
                      <p className="font-semibold text-gray-800">
                        {selectedDetailRequest.catatan || '-'}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedDetailRequest.karyawan_atasan && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-700 mb-3">
                      Informasi Atasan
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600">Nama Atasan:</p>
                        <p className="font-semibold text-gray-800">
                          {selectedDetailRequest.karyawan_atasan?.name || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Badge Number:</p>
                        <p className="font-semibold text-gray-800">
                          {selectedDetailRequest.karyawan_atasan?.badgenumber ||
                            '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedDetailRequest.catatan_atasan && (
                  <div
                    className={`${
                      selectedDetailRequest.status.toLowerCase() === 'approved'
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    } border-2 rounded-lg p-4`}
                  >
                    <h4
                      className={`font-semibold mb-2 ${
                        selectedDetailRequest.status.toLowerCase() ===
                        'approved'
                          ? 'text-green-700'
                          : 'text-red-700'
                      }`}
                    >
                      {selectedDetailRequest.status.toLowerCase() === 'approved'
                        ? 'Catatan Persetujuan'
                        : 'Alasan Penolakan'}
                    </h4>
                    <p className="text-sm text-gray-800">
                      {selectedDetailRequest.catatan_atasan}
                    </p>
                  </div>
                )}

                {selectedDetailRequest.file && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-700 mb-3">
                      Bukti Lampiran
                    </h4>
                    <div className="flex items-center justify-center">
                      <img
                        src={`${import.meta.env.VITE_API_LINK}/images/${
                          selectedDetailRequest.file
                        }`}
                        alt="Bukti"
                        className="object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity max-h-64"
                        onClick={() =>
                          handleImageClick(
                            `${import.meta.env.VITE_API_LINK}/images/${
                              selectedDetailRequest.file
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

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-700 mb-3">Timeline</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5"></div>
                      <div>
                        <p className="text-gray-600">Diajukan:</p>
                        <p className="font-semibold text-gray-800">
                          {formatDateTime(selectedDetailRequest.createdAt)}
                        </p>
                      </div>
                    </div>
                    {selectedDetailRequest.updatedAt !==
                      selectedDetailRequest.createdAt && (
                      <div className="flex items-start gap-2">
                        <div
                          className={`w-2 h-2 rounded-full mt-1.5 ${
                            selectedDetailRequest.status.toLowerCase() ===
                            'approved'
                              ? 'bg-green-500'
                              : selectedDetailRequest.status.toLowerCase() ===
                                'rejected'
                              ? 'bg-red-500'
                              : 'bg-blue-500'
                          }`}
                        ></div>
                        <div>
                          <p className="text-gray-600">Terakhir diupdate:</p>
                          <p className="font-semibold text-gray-800">
                            {formatDateTime(selectedDetailRequest.updatedAt)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
              {selectedDetailRequest.status.toLowerCase() ===
                'request atasan' && (
                <>
                  <button
                    onClick={() => {
                      closeDetailModal();
                      handleReject(selectedDetailRequest);
                    }}
                    className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold rounded-lg transition-all duration-200"
                  >
                    Tolak
                  </button>
                  <button
                    onClick={() => {
                      closeDetailModal();
                      handleApprove(selectedDetailRequest);
                    }}
                    className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all duration-200"
                  >
                    Setujui
                  </button>
                </>
              )}
              <button
                onClick={closeDetailModal}
                className="px-6 py-2.5 bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white font-semibold rounded-lg transition-all duration-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div
              className={`px-6 py-4 ${
                modalType === 'approve'
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600'
                  : 'bg-gradient-to-r from-red-600 to-rose-600'
              } text-white rounded-t-2xl`}
            >
              <h3 className="text-xl font-bold flex items-center gap-2">
                {modalType === 'approve' ? (
                  <>
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Konfirmasi Persetujuan
                  </>
                ) : (
                  <>
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Konfirmasi Penolakan
                  </>
                )}
              </h3>
            </div>

            <div className="px-6 py-6">
              <div className="space-y-4">
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

                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-700 mb-3">
                    Detail Keterlambatan
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-gray-600">Tanggal & Jam Kedatangan:</p>
                      <p className="font-semibold text-gray-800">
                        {formatDateTime(selectedRequest.tanggal_masuk)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Shift:</p>
                      <p className="font-semibold text-gray-800">
                        Shift {selectedRequest.shift}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Alasan:</p>
                      <p className="font-semibold text-gray-800">
                        {selectedRequest.alasan_terlambat}
                      </p>
                    </div>
                    {/* <div>
                      <p className="text-gray-600">Durasi:</p>
                      <p className="font-semibold text-gray-800">
                        {selectedRequest.lama_terlambat} jam
                      </p>
                    </div> */}
                    <div>
                      <p className="text-gray-600">Catatan Karyawan:</p>
                      <p className="font-semibold text-gray-800">
                        {selectedRequest.catatan || '-'}
                      </p>
                    </div>
                    {selectedRequest.file && (
                      <div>
                        <p className="text-gray-600 mb-2">Bukti:</p>
                        <img
                          src={`${import.meta.env.VITE_API_LINK}/images/${
                            selectedRequest.file
                          }`}
                          alt="Bukti"
                          className="w-full h-48 object-contain rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() =>
                            handleImageClick(
                              `${import.meta.env.VITE_API_LINK}/images/${
                                selectedRequest.file
                              }`,
                            )
                          }
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Klik gambar untuk memperbesar
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className={`${
                    modalType === 'approve' ? 'bg-green-50' : 'bg-red-50'
                  } rounded-lg p-4`}
                >
                  <label className="block text-gray-700 font-semibold mb-2">
                    Catatan Atasan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={catatanAtasan}
                    onChange={(e) => setCatatanAtasan(e.target.value)}
                    className="w-full min-h-[100px] resize-none border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-800 font-medium focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
                    placeholder={
                      modalType === 'approve'
                        ? 'Berikan catatan persetujuan...'
                        : 'Jelaskan alasan penolakan...'
                    }
                  />
                </div>

                <div
                  className={`${
                    modalType === 'approve'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  } border-2 rounded-lg p-4`}
                >
                  <p
                    className={`${
                      modalType === 'approve'
                        ? 'text-green-800'
                        : 'text-red-800'
                    } font-semibold`}
                  >
                    {modalType === 'approve'
                      ? 'Apakah Anda yakin ingin menyetujui pengajuan izin terlambat ini?'
                      : 'Apakah Anda yakin ingin menolak pengajuan izin terlambat ini?'}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
              <button
                onClick={closeModal}
                disabled={isLoading}
                className="px-6 py-2.5 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Batal
              </button>
              <button
                onClick={
                  modalType === 'approve' ? confirmApprove : confirmReject
                }
                disabled={isLoading || !catatanAtasan.trim()}
                className={`px-6 py-2.5 ${
                  modalType === 'approve'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                    : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700'
                } text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {modalType === 'approve' ? 'Setujui' : 'Tolak'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="w-full mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-600 to-yellow-600 px-8 py-6 text-white">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Persetujuan Izin Terlambat
          </h2>
          <p className="text-orange-100 text-sm">
            Review dan setujui atau tolak pengajuan izin terlambat dari
            department Anda
          </p>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[1100px]">
            <div className="grid grid-cols-12 px-8 py-4 border-b-4 border-gray-200 gap-2 bg-gray-50">
              <label className="text-neutral-700 text-sm font-bold">No</label>
              <label className="text-neutral-700 text-sm font-bold col-span-2">
                Nama
              </label>
              <label className="text-neutral-700 text-sm font-bold col-span-2">
                Tanggal &amp; Jam Kedatangan
              </label>
              <label className="text-neutral-700 text-sm font-bold">
                Shift
              </label>
              <label className="text-neutral-700 text-sm font-bold col-span-2">
                Alasan
              </label>
              {/* <label className="text-neutral-700 text-sm font-bold">
                Durasi
              </label> */}
              <label className="text-neutral-700 text-sm font-bold col-span-2">
                Status
              </label>
              <label className="text-neutral-700 text-sm font-bold col-span-2">
                Aksi
              </label>
            </div>

            {requestList?.data && requestList.data.length > 0 ? (
              requestList.data.map((data, i) => (
                <div
                  key={data.id || i}
                  className="grid grid-cols-12 border-b-4 border-gray-200 gap-2 items-center px-8 py-4 hover:bg-gray-50 transition-colors"
                >
                  <label className="text-neutral-600 text-sm font-semibold">
                    {(currentPage - 1) * 10 + i + 1}
                  </label>

                  <div className="flex flex-col col-span-2">
                    <label className="text-neutral-800 text-sm font-semibold">
                      {data.karyawan?.name || '-'}
                    </label>
                  </div>

                  <label className="text-neutral-600 text-sm col-span-2">
                    {formatDateTime(data.tanggal_masuk)}
                  </label>

                  <label className="text-neutral-800 text-sm font-semibold">
                    Shift {data.shift}
                  </label>

                  <label className="text-neutral-600 text-sm col-span-2 ">
                    {data.alasan_terlambat}
                  </label>

                  {/* <label className="text-neutral-800 text-sm font-semibold">
                    {data.lama_terlambat} jam
                  </label> */}

                  <div className="col-span-2">
                    {getStatusBadge(data.status)}
                  </div>

                  <div className="flex flex-col justify-center items-center gap-1 col-span-2">
                    <button
                      onClick={() => handleViewDetail(data)}
                      className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white text-xs font-bold rounded transition-all duration-200 w-full"
                    >
                      Detail
                    </button>
                    {data.status.toLowerCase() === 'request atasan' && (
                      <div className="flex gap-1 w-full">
                        <button
                          onClick={() => handleApprove(data)}
                          disabled={isLoading}
                          className="px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-500 text-white text-xs font-bold rounded transition-all duration-200 flex-1"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => handleReject(data)}
                          disabled={isLoading}
                          className="px-2 py-1 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 disabled:from-gray-400 disabled:to-gray-500 text-white text-xs font-bold rounded transition-all duration-200 flex-1"
                        >
                          ✕
                        </button>
                      </div>
                    )}
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
                  Tidak ada pengajuan izin terlambat
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Pengajuan baru akan muncul di sini
                </p>
              </div>
            )}
          </div>
        </div>

        {requestList && requestList.total_page > 1 && (
          <div className="flex items-center justify-center gap-2 px-8 py-6 bg-gray-50 border-t border-gray-200">
            <Stack spacing={2}>
              <Pagination
                count={requestList.total_page}
                color="primary"
                page={currentPage}
                onChange={(e, page) => setCurrentPage(page)}
              />
            </Stack>
          </div>
        )}
      </div>
    </main>
  );
}

export default ApprovalIzinTerlambat;
