import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import { Pagination, Stack } from '@mui/material';

interface User {
  id: number;
  nama: string;
  email: string;
}

interface Customer {
  id: number;
  nama_customer: string;
  alamat_kantor: string;
  email: string;
  fax: string;
  id_harga_pengiriman: number | null;
  id_marketing: number | null;
  is_active: boolean;
  is_customer_kanban: boolean;
  kode_marketing: string;
  kontak_person: string;
  no_legalitas: string | null;
  npwp: string;
  saldo: number;
  telepon: string;
  toleransi_pengiriman: string;
  top_faktur: string;
  createdAt: string;
  updatedAt: string;
}

interface DepositItem {
  id: number;
  id_customer: number;
  id_create: number;
  id_approve: number | null;
  id_reject: number | null;
  no_deposit: string;
  cara_bayar: string;
  keterangan: string;
  billing_address: string;
  tgl_faktur: string;
  nominal: number;
  note: string;
  status: string;
  status_proses: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  user_create?: User;
  user_approve?: User;
  user_reject?: User;
}

interface DepositResponse {
  data: DepositItem[];
  status: number;
  success: boolean;
  total_page?: number;
}

interface DepositDetailResponse {
  data: DepositItem;
  status: number;
  success: boolean;
}

const DepositApproval: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [depositData, setDepositData] = useState<DepositItem[]>([]);
  const [selectedDeposit, setSelectedDeposit] = useState<DepositItem | null>(
    null,
  );
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [limit, setLimit] = useState<number>(10);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [depositToReject, setDepositToReject] = useState<number | null>(null);

  useEffect(() => {
    fetchDepositData();
  }, [page, searchTerm, limit]);

  const fetchDepositData = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/deposit`;
    try {
      setLoading(true);

      const res: AxiosResponse<DepositResponse> = await axios.get(url, {
        params: {
          page: page,
          limit: limit,
          search: searchTerm,
          status: 'requested', // Only show pending deposits for approval
        },
        withCredentials: true,
      });

      console.log('Fetched Deposit data:', res.data);

      setDepositData(res.data.data);
      setTotalPages(res.data.total_page || 1);
    } catch (error) {
      console.error('Error fetching Deposit data:', error);
      setDepositData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepositDetail = async (depositId: number): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/deposit/${depositId}`;
    try {
      const res: AxiosResponse<DepositDetailResponse> = await axios.get(url, {
        withCredentials: true,
      });

      console.log('Fetched Deposit detail:', res.data);
      setSelectedDeposit(res.data.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error fetching Deposit detail:', error);
      alert('Failed to fetch deposit details');
    }
  };

  const handleApprove = async (depositId: number) => {
    if (!depositId) return;

    const url = `${import.meta.env.VITE_API_LINK}/deposit/approve/${depositId}`;
    if (window.confirm('Apakah Anda yakin ingin Approve Deposit Ini?')) {
      try {
        const res = await axios.put(
          url,
          {},
          {
            withCredentials: true,
          },
        );

        if (res.data.success) {
          alert('Deposit berhasil di-approve');
          fetchDepositData();
          setShowDetailModal(false);
        }
      } catch (error: any) {
        console.error('Error approving deposit:', error);
        alert(error.response?.data?.message || 'Failed to approve deposit');
      }
    }
  };

  const handleRejectClick = (depositId: number) => {
    setDepositToReject(depositId);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!depositToReject) return;
    if (!rejectReason.trim()) {
      alert('Silakan masukkan alasan reject');
      return;
    }

    const url = `${
      import.meta.env.VITE_API_LINK
    }/deposit/reject/${depositToReject}`;
    try {
      const res = await axios.put(
        url,
        {
          note_reject: rejectReason,
        },
        {
          withCredentials: true,
        },
      );

      if (res.data.success) {
        alert('Deposit berhasil di-reject');
        fetchDepositData();
        setShowRejectModal(false);
        setShowDetailModal(false);
        setRejectReason('');
        setDepositToReject(null);
      }
    } catch (error: any) {
      console.error('Error rejecting deposit:', error);
      alert(error.response?.data?.message || 'Failed to reject deposit');
    }
  };

  const handleLimitChange = (newLimit: number): void => {
    setLimit(newLimit);
    setPage(1);
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}-${month}-${year}`;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: string } = {
      draft: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      done: 'bg-blue-100 text-blue-800',
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          statusColors[status.toLowerCase()] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="">
      {/* Header Section */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          {/* Search */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by No Deposit, Customer, Cara Bayar..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
            <svg
              className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  No Deposit
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Tgl Faktur
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Customer
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Cara Bayar
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Nominal
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Status
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-3 py-4 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : depositData.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 py-8 text-center text-gray-500 text-sm"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <svg
                        className="w-12 h-12 text-gray-300"
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
                      <p>No pending deposit for approval</p>
                    </div>
                  </td>
                </tr>
              ) : (
                depositData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-900 font-medium">
                      {item.no_deposit || '-'}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-900">
                      {formatDate(item.tgl_faktur)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-900">
                      {item.customer?.nama_customer || '-'}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-900">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                        {item.cara_bayar || '-'}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-900 font-semibold">
                      {formatCurrency(item.nominal)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs flex flex-col">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs">
                      <div className="flex gap-2">
                        <button
                          onClick={() => fetchDepositDetail(item.id)}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs font-medium"
                          title="Detail"
                        >
                          Detail
                        </button>
                        <button
                          onClick={() => handleApprove(item.id)}
                          className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-xs font-medium"
                          title="Approve"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectClick(item.id)}
                          className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs font-medium"
                          title="Reject"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 mt-6 pb-4 px-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Rows per page:</span>
            <div className="flex gap-2">
              {[10, 25, 50, 100].map((pageSize) => (
                <button
                  key={pageSize}
                  onClick={() => handleLimitChange(pageSize)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    limit === pageSize
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {pageSize}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Stack spacing={2}>
              <Pagination
                count={totalPages}
                color="primary"
                page={page}
                onChange={(e, i) => {
                  setPage(i);
                }}
                size="small"
              />
            </Stack>
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : depositData.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            <svg
              className="w-12 h-12 text-gray-300 mx-auto mb-3"
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
            <p>No pending deposit for approval</p>
          </div>
        ) : (
          depositData.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="font-semibold text-sm text-gray-900 mb-1">
                    {item.no_deposit || '-'}
                  </div>
                  <div className="text-xs text-gray-600">
                    {item.customer?.nama_customer || '-'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-green-600 mb-1">
                    {formatCurrency(item.nominal)}
                  </div>
                  {getStatusBadge(item.status)}
                </div>
              </div>

              <div className="space-y-2 text-sm border-t pt-3 mt-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-500 text-xs font-medium">
                      Tgl Faktur:
                    </span>
                    <div className="text-gray-900 text-xs">
                      {formatDate(item.tgl_faktur)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs font-medium">
                      Cara Bayar:
                    </span>
                    <div className="text-gray-900 text-xs">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                        {item.cara_bayar || '-'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => fetchDepositDetail(item.id)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Detail
                  </button>
                  <button
                    onClick={() => handleApprove(item.id)}
                    className="flex-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectClick(item.id)}
                    className="flex-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Mobile Pagination */}
        {!loading && depositData.length > 0 && (
          <div className="w-full flex flex-col items-center gap-4 py-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Rows per page:</span>
              <div className="flex gap-2">
                {[10, 25, 50, 100].map((pageSize) => (
                  <button
                    key={pageSize}
                    onClick={() => handleLimitChange(pageSize)}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      limit === pageSize
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {pageSize}
                  </button>
                ))}
              </div>
            </div>

            <Stack spacing={2}>
              <Pagination
                count={totalPages}
                color="primary"
                page={page}
                onChange={(e, i) => {
                  setPage(i);
                }}
                size="small"
              />
            </Stack>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedDeposit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                Detail Deposit
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
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

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    No Deposit
                  </label>
                  <p className="text-base text-gray-900 font-semibold">
                    {selectedDeposit.no_deposit}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Status
                  </label>
                  <div className="mt-1">
                    {getStatusBadge(selectedDeposit.status)}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Customer
                </label>
                <p className="text-base text-gray-900">
                  {selectedDeposit.customer?.nama_customer || '-'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Tanggal Faktur
                  </label>
                  <p className="text-base text-gray-900">
                    {formatDate(selectedDeposit.tgl_faktur)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Cara Bayar
                  </label>
                  <p className="text-base text-gray-900">
                    {selectedDeposit.cara_bayar}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Nominal
                </label>
                <p className="text-xl text-gray-900 font-bold">
                  {formatCurrency(selectedDeposit.nominal)}
                </p>
              </div>

              {selectedDeposit.billing_address && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Billing Address
                  </label>
                  <p className="text-base text-gray-900">
                    {selectedDeposit.billing_address}
                  </p>
                </div>
              )}

              {selectedDeposit.keterangan && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Keterangan
                  </label>
                  <p className="text-base text-gray-900">
                    {selectedDeposit.keterangan}
                  </p>
                </div>
              )}

              {selectedDeposit.note && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Note
                  </label>
                  <p className="text-base text-gray-900">
                    {selectedDeposit.note}
                  </p>
                </div>
              )}

              {selectedDeposit.user_create && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Dibuat Oleh
                  </label>
                  <p className="text-base text-gray-900">
                    {selectedDeposit.user_create.nama} (
                    {selectedDeposit.user_create.email})
                  </p>
                </div>
              )}

              <div className="border-t pt-4 flex gap-3">
                <button
                  onClick={() => handleApprove(selectedDeposit.id)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Approve
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleRejectClick(selectedDeposit.id);
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                Reject Deposit
              </h2>
            </div>

            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alasan Reject <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Masukkan alasan reject..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={4}
              />
            </div>

            <div className="px-6 py-4 border-t flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setDepositToReject(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepositApproval;
