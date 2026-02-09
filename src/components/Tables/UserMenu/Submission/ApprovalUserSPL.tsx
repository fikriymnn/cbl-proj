import React, { useEffect, useState } from 'react';
import axios from 'axios';
import convertTimeStampToDateTime from '../../../../utils/converDateTime';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

function ApprovalUserSPL() {
  const [isLoading, setIsLoading] = useState(false);
  const [requestList, setRequestList] = useState<any>();
  const [currentPage, setCurrentPage] = useState(1);
  const [me, setMe] = useState<any>(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'approve' | 'reject' | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    getMe();
  }, []);

  useEffect(() => {
    if (me) {
      getRequestList();
    }
  }, [currentPage, me]);

  async function getMe() {
    const url = `${import.meta.env.VITE_API_LINK}/me`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });
      setMe(res.data);
      console.log('getme', res.data);
    } catch (error: any) {
      console.log(error.data?.msg);
    }
  }

  async function getRequestList() {
    const url = `${import.meta.env.VITE_API_LINK}/hr/pengajuanLembur`;
    try {
      const params: any = {
        status: 'request user',
        id_karyawan: me?.id_karyawan,
        page: currentPage,
        limit: 10,
      };

      const res = await axios.get(url, {
        params,
        withCredentials: true,
      });
      setRequestList(res.data);
      console.log('Request list:', res.data);
    } catch (error: any) {
      console.log(error);
    }
  }

  const handleApprove = (data: any) => {
    setSelectedRequest(data);
    setModalType('approve');
    setShowModal(true);
  };

  const handleReject = (data: any) => {
    setSelectedRequest(data);
    setModalType('reject');
    setRejectReason('');
    setShowModal(true);
  };

  const confirmApprove = async () => {
    if (!selectedRequest) return;

    setIsLoading(true);
    const url = `${
      import.meta.env.VITE_API_LINK
    }/hr/pengajuanLembur/approveUser/${selectedRequest.id}`;

    try {
      await axios.put(
        url,
        {},
        {
          withCredentials: true,
        },
      );

      setIsLoading(false);
      alert('Pengajuan lembur berhasil disetujui!');

      // Close modal and refresh list
      setShowModal(false);
      setSelectedRequest(null);
      getRequestList();
    } catch (error) {
      setIsLoading(false);
      console.log(error);
      alert('Terjadi kesalahan saat menyetujui pengajuan');
    }
  };

  const confirmReject = async () => {
    if (!selectedRequest) return;

    if (!rejectReason.trim()) {
      alert('Alasan penolakan harus diisi');
      return;
    }

    setIsLoading(true);
    const url = `${
      import.meta.env.VITE_API_LINK
    }/hr/pengajuanLembur/rejectUser/${selectedRequest.id}`;

    try {
      await axios.put(
        url,
        {
          alasan_reject: rejectReason,
        },
        {
          withCredentials: true,
        },
      );

      setIsLoading(false);
      alert('Pengajuan lembur berhasil ditolak!');

      // Close modal and refresh list
      setShowModal(false);
      setSelectedRequest(null);
      setRejectReason('');
      getRequestList();
    } catch (error) {
      setIsLoading(false);
      console.log(error);
      alert('Terjadi kesalahan saat menolak pengajuan');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
    setModalType(null);
    setRejectReason('');
  };

  const formatDuration = (hours: any) => {
    if (!hours || hours === 0) return '0 jam';
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);

    if (minutes === 0) {
      return `${wholeHours} jam`;
    } else if (wholeHours === 0) {
      return `${minutes} menit`;
    } else {
      return `${wholeHours} jam ${minutes} menit`;
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 ">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-gray-700 font-medium">Processing...</span>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
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

            {/* Modal Body */}
            <div className="px-6 py-6">
              {selectedRequest && (
                <div className="space-y-4">
                  {/* Employee Info (who will do overtime) */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-700 mb-3">
                      Informasi Karyawan (Pelaksana Lembur)
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

                  {/* Requester Info */}
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-700 mb-3">
                      Informasi Pengaju
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600">Nama:</p>
                        <p className="font-semibold text-gray-800">
                          {selectedRequest.karyawan_pengaju?.name || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">NIK:</p>
                        <p className="font-semibold text-gray-800">
                          {selectedRequest.karyawan_pengaju
                            ?.biodata_karyawan?.[0]?.nik || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Jabatan:</p>
                        <p className="font-semibold text-gray-800">
                          {selectedRequest.karyawan_pengaju
                            ?.biodata_karyawan?.[0]?.nama_jabatan || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Department:</p>
                        <p className="font-semibold text-gray-800">
                          {selectedRequest.karyawan_pengaju
                            ?.biodata_karyawan?.[0]?.department
                            ?.nama_department || '-'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Overtime Details */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-700 mb-3">
                      Detail Lembur
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-gray-600">Periode 1:</p>
                        <p className="font-semibold text-gray-800">
                          {convertTimeStampToDateTime(selectedRequest.dari)} -{' '}
                          {convertTimeStampToDateTime(selectedRequest.sampai)}
                        </p>
                      </div>
                      {selectedRequest.dari_2 &&
                        selectedRequest.dari_2 !== '' && (
                          <div>
                            <p className="text-gray-600">Periode 2:</p>
                            <p className="font-semibold text-gray-800">
                              {convertTimeStampToDateTime(
                                selectedRequest.dari_2,
                              )}{' '}
                              -{' '}
                              {convertTimeStampToDateTime(
                                selectedRequest.sampai_2,
                              )}
                            </p>
                          </div>
                        )}
                      <div>
                        <p className="text-gray-600">Durasi:</p>
                        <p className="font-semibold text-gray-800">
                          {formatDuration(selectedRequest.lama_lembur)}
                        </p>
                      </div>
                      {selectedRequest.bagian_mesin && (
                        <div>
                          <p className="text-gray-600">Bagian Mesin:</p>
                          <p className="font-semibold text-gray-800">
                            {selectedRequest.bagian_mesin}
                          </p>
                        </div>
                      )}
                      {selectedRequest.jo_lembur && (
                        <div>
                          <p className="text-gray-600">Job Order:</p>
                          <p className="font-semibold text-gray-800">
                            {selectedRequest.jo_lembur}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-gray-600">Alasan Lembur:</p>
                        <p className="font-semibold text-gray-800">
                          {selectedRequest.alasan_lembur || '-'}
                        </p>
                      </div>
                      {selectedRequest.target_lembur &&
                        selectedRequest.target_lembur !== '' && (
                          <div>
                            <p className="text-gray-600">Target Lembur:</p>
                            <p className="font-semibold text-gray-800">
                              {selectedRequest.target_lembur}
                            </p>
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Reject Reason Input */}
                  {modalType === 'reject' && (
                    <div className="bg-red-50 rounded-lg p-4">
                      <label className="block text-gray-700 font-semibold mb-2">
                        Alasan Penolakan <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="w-full min-h-[100px] resize-none border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-800 font-medium focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-200"
                        placeholder="Jelaskan alasan penolakan..."
                      />
                    </div>
                  )}

                  {/* Confirmation Message */}
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
                        ? 'Apakah Anda yakin ingin menyetujui pengajuan lembur ini?'
                        : 'Apakah Anda yakin ingin menolak pengajuan lembur ini?'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
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
                disabled={
                  isLoading || (modalType === 'reject' && !rejectReason.trim())
                }
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
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 text-white">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Persetujuan Surat Perintah Lembur (SPL)
          </h2>
          <p className="text-indigo-100 text-sm">
            Review dan setujui atau tolak pengajuan lembur dari karyawan
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-12 px-8 py-4 border-b-4 border-gray-200 gap-2 bg-gray-50">
              <label className="text-neutral-700 text-sm font-bold">No</label>
              <label className="text-neutral-700 text-sm font-bold col-span-2">
                Nama Karyawan
              </label>
              <label className="text-neutral-700 text-sm font-bold col-span-3">
                Periode Lembur
              </label>
              <label className="text-neutral-700 text-sm font-bold">
                Durasi
              </label>
              <label className="text-neutral-700 text-sm font-bold col-span-2">
                Department
              </label>
              <label className="text-neutral-700 text-sm font-bold">
                Status
              </label>
              <label className="text-neutral-700 text-sm font-bold col-span-2">
                Action
              </label>
            </div>

            {requestList?.data && requestList.data.length > 0 ? (
              requestList.data.map((data: any, i: number) => (
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

                  <div className="flex flex-col gap-1 col-span-3">
                    <label className="text-neutral-600 text-xs">
                      {convertTimeStampToDateTime(data.dari)}
                    </label>
                    <label className="text-neutral-600 text-xs">
                      s/d {convertTimeStampToDateTime(data.sampai)}
                    </label>
                    {data.dari_2 && data.dari_2 !== '' && (
                      <>
                        <label className="text-neutral-600 text-xs mt-1">
                          {convertTimeStampToDateTime(data.dari_2)}
                        </label>
                        <label className="text-neutral-600 text-xs">
                          s/d {convertTimeStampToDateTime(data.sampai_2)}
                        </label>
                      </>
                    )}
                  </div>

                  <label className="text-neutral-800 text-sm font-semibold">
                    {formatDuration(data.lama_lembur)}
                  </label>

                  <label className="text-neutral-600 text-sm col-span-2">
                    {data.karyawan_pengaju?.biodata_karyawan?.[0]?.department
                      ?.nama_department || '-'}
                  </label>

                  <label className="text-blue-600 text-sm font-bold uppercase">
                    {data.status}
                  </label>

                  <div className="flex flex-col justify-start items-center gap-2 col-span-2">
                    <button
                      onClick={() => handleApprove(data)}
                      disabled={isLoading}
                      className="px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-500 text-white text-xs font-bold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed flex items-center gap-1"
                      title="Setujui pengajuan"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Setujui
                    </button>
                    <button
                      onClick={() => handleReject(data)}
                      disabled={isLoading}
                      className="px-3 py-2 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 disabled:from-gray-400 disabled:to-gray-500 text-white text-xs font-bold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed flex items-center gap-1"
                      title="Tolak pengajuan"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Tolak
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
                  Tidak ada pengajuan lembur yang perlu disetujui
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Pengajuan baru akan muncul di sini
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {requestList?.total_page > 1 && (
          <div className="flex items-center justify-center gap-2 px-8 py-6 bg-gray-50 border-t border-gray-200">
            <Stack spacing={2}>
              <Pagination
                count={requestList?.total_page}
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

export default ApprovalUserSPL;
