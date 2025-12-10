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

const DepositApprovalHistory: React.FC = () => {
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
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchDepositData();
  }, [page, searchTerm, limit, statusFilter]);

  const fetchDepositData = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/deposit`;
    try {
      setLoading(true);

      const params: any = {
        page: page,
        limit: limit,
        search: searchTerm,
        status_proses: 'done',
      };

      const res: AxiosResponse<DepositResponse> = await axios.get(url, {
        params: params,
        withCredentials: true,
      });

      console.log('Fetched Deposit history data:', res.data);

      setDepositData(res.data.data);
      setTotalPages(res.data.total_page || 1);
    } catch (error) {
      console.error('Error fetching Deposit history data:', error);
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

  const formatDateTime = (dateString: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}`;
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

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
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
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p>No approval history available</p>
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
                    <td className="px-3 py-3 whitespace-nowrap text-xs">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs">
                      <button
                        onClick={() => fetchDepositDetail(item.id)}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs font-medium"
                        title="Detail"
                      >
                        Detail
                      </button>
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p>No approval history available</p>
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

                <div className="pt-2">
                  <button
                    onClick={() => fetchDepositDetail(item.id)}
                    className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Detail
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
              {/* Basic Information */}
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
                {selectedDeposit.customer?.email && (
                  <p className="text-sm text-gray-500">
                    {selectedDeposit.customer.email}
                  </p>
                )}
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
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                      {selectedDeposit.cara_bayar}
                    </span>
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

              {/* User Information Section */}
              <div className="border-t pt-4 space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Activity History
                </h3>

                {/* Created By */}
                {selectedDeposit.user_create && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <label className="text-sm font-medium text-gray-700">
                      Dibuat Oleh
                    </label>
                    <p className="text-base text-gray-900 font-medium">
                      {selectedDeposit.user_create.nama}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedDeposit.user_create.email}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDateTime(selectedDeposit.createdAt)}
                    </p>
                  </div>
                )}

                {/* Approved By */}
                {selectedDeposit.user_approve &&
                  selectedDeposit.status === 'approved' && (
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                      <label className="text-sm font-medium text-green-700 flex items-center gap-2">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Di-approve Oleh
                      </label>
                      <p className="text-base text-green-900 font-medium">
                        {selectedDeposit.user_approve.nama}
                      </p>
                      <p className="text-sm text-green-700">
                        {selectedDeposit.user_approve.email}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        {formatDateTime(selectedDeposit.updatedAt)}
                      </p>
                    </div>
                  )}

                {/* Rejected By */}
                {selectedDeposit.user_reject &&
                  selectedDeposit.status === 'rejected' && (
                    <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                      <label className="text-sm font-medium text-red-700 flex items-center gap-2">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Di-reject Oleh
                      </label>
                      <p className="text-base text-red-900 font-medium">
                        {selectedDeposit.user_reject.nama}
                      </p>
                      <p className="text-sm text-red-700">
                        {selectedDeposit.user_reject.email}
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        {formatDateTime(selectedDeposit.updatedAt)}
                      </p>
                      {selectedDeposit.note && (
                        <div className="mt-2 pt-2 border-t border-red-200">
                          <p className="text-xs text-red-700 font-medium">
                            Alasan Reject:
                          </p>
                          <p className="text-sm text-red-900">
                            {selectedDeposit.note}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
              </div>

              {/* Close Button */}
              <div className="border-t pt-4">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepositApprovalHistory;
