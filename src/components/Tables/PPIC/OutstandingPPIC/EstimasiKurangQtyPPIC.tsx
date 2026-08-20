import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import { Pagination, Stack } from '@mui/material';

interface Tahapan {
  id: number;
  kode_tahapan: string;
  nama_tahapan: string;
}

interface UserInfo {
  id: number;
  nama: string;
  email: string;
  role: string;
  bagian: string;
}

interface EstimasiKurangQtyItem {
  id: number;
  id_produksi_lkh_tahapan: number;
  id_jo: number;
  id_io: number;
  id_so: number;
  id_customer: number;
  id_produk: number;
  id_tahapan: number;
  id_request: number;
  id_approve: number | null;
  no_jo: string;
  no_io: string;
  no_so: string;
  customer: string;
  produk: string;
  qty_jo: number;
  qty_kurang_qty: number;
  spesifikasi: string;
  tgl_approve: string | null;
  tgl_request: string;
  note?: string | null;
  status: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  tahapan?: Tahapan;
  user_request?: UserInfo;
  user_approve?: UserInfo;
}

interface EstimasiKurangQtyResponse {
  status: number;
  success: boolean;
  data: EstimasiKurangQtyItem[];
  total_page?: number;
}

interface EstimasiKurangQtyDetailResponse {
  status: number;
  success: boolean;
  data: EstimasiKurangQtyItem;
}

const EstimasiKurangQtyPPIC: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [listData, setListData] = useState<EstimasiKurangQtyItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);

  const [actionLoading, setActionLoading] = useState<{
    [key: number]: boolean;
  }>({});

  // Modal / detail state
  const [showModal, setShowModal] = useState<boolean>(false);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [selectedDetail, setSelectedDetail] =
    useState<EstimasiKurangQtyItem | null>(null);
  const [note, setNote] = useState<string>('');

  useEffect(() => {
    fetchListData();
  }, [page, limit]);

  const fetchListData = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/ppic/estimasiKurangQty`;
    try {
      setLoading(true);
      const res: AxiosResponse<EstimasiKurangQtyResponse> = await axios.get(
        url,
        {
          params: { page, limit },
          withCredentials: true,
        },
      );

      const responseData = Array.isArray(res.data.data) ? res.data.data : [];
      setListData(responseData);
      setTotalPages(res.data.total_page || 0);
    } catch (error) {
      console.error('Error fetching estimasi kurang qty (PPIC):', error);
      setListData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLimitChange = (newLimit: number): void => {
    setLimit(newLimit);
    setPage(1);
  };

  const openDetailModal = async (id: number): Promise<void> => {
    setShowModal(true);
    setDetailLoading(true);
    setSelectedDetail(null);
    setNote('');

    const url = `${import.meta.env.VITE_API_LINK}/ppic/estimasiKurangQty/${id}`;
    try {
      const res: AxiosResponse<EstimasiKurangQtyDetailResponse> =
        await axios.get(url, { withCredentials: true });
      setSelectedDetail(res.data.data);
      setNote(res.data.data?.note || '');
    } catch (error) {
      console.error('Error fetching estimasi kurang qty detail (PPIC):', error);
      alert('Failed to load detail. Please try again.');
      setShowModal(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeModal = (): void => {
    setShowModal(false);
    setSelectedDetail(null);
    setNote('');
  };

  const handleApprove = async (id: number): Promise<void> => {
    if (!note.trim()) {
      alert('Note is required before approving.');
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to approve this request?',
    );
    if (!confirmed) return;

    const url = `${
      import.meta.env.VITE_API_LINK
    }/ppic/estimasiKurangQty/approve/${id}`;

    try {
      setActionLoading((prev) => ({ ...prev, [id]: true }));
      await axios.put(url, { note }, { withCredentials: true });
      alert('Request approved successfully!');
      closeModal();
      fetchListData();
    } catch (error) {
      console.error('Error approving estimasi kurang qty (PPIC):', error);
      alert('Failed to approve. Please try again.');
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const formatDateTime = (dateString?: string | null): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const formatNumber = (num: number | null | undefined): string => {
    if (num === null || num === undefined) return '-';
    return num.toLocaleString('id-ID');
  };

  const getStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'pending':
      case 'waiting':
        return 'bg-orange-100 text-orange-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isPending = (status: string): boolean =>
    status?.toLowerCase() !== 'approved' &&
    status?.toLowerCase() !== 'rejected';

  const renderUserBadge = (
    user: UserInfo | undefined,
    label: string,
    date: string | null | undefined,
  ) => {
    if (!user) {
      return (
        <div>
          <span className="text-xs text-gray-500">{label}:</span>
          <div className="text-xs text-gray-400">-</div>
        </div>
      );
    }
    return (
      <div>
        <span className="text-xs text-gray-500">{label}:</span>
        <div className="flex items-center gap-1.5 mt-0.5">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">
            {user.nama
              .split(' ')
              .slice(0, 2)
              .map((n) => n[0])
              .join('')}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-medium text-gray-800 truncate">
              {user.nama}
            </span>
            <span className="text-[10px] text-gray-500">
              {formatDateTime(date)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="">
      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Action
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  No JO
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Customer
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Produk
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Tahapan
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Qty Kurang
                </th>

                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-3 py-4 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : listData.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-3 py-4 text-center text-gray-500 text-sm"
                  >
                    No data available
                  </td>
                </tr>
              ) : (
                listData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap text-xs">
                      <button
                        onClick={() => openDetailModal(item.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs"
                      >
                        Detail
                      </button>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 font-medium">
                      {item.no_jo || '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {item.customer || '-'}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-900 max-w-xs">
                      {item.produk || '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {item.tahapan?.nama_tahapan || '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs">
                      <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded font-medium">
                        {formatNumber(item.qty_kurang_qty)}
                      </span>
                    </td>

                    <td className="px-3 py-2 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 inline-flex text-xs font-semibold rounded-full ${getStatusColor(
                          item.status,
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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
          <Stack spacing={2}>
            <Pagination
              count={totalPages}
              color="primary"
              page={page}
              onChange={(e, i) => setPage(i)}
              size="small"
            />
          </Stack>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : listData.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            No data available
          </div>
        ) : (
          listData.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-semibold text-sm text-gray-900">
                    {item.no_jo || '-'}
                  </div>
                  <div className="text-xs text-gray-600 mt-0.5">
                    {item.customer || '-'}
                  </div>
                  <span
                    className={`mt-1 px-2 py-0.5 inline-flex text-xs font-semibold rounded-full ${getStatusColor(
                      item.status,
                    )}`}
                  >
                    {item.status}
                  </span>
                </div>
                <button
                  onClick={() => openDetailModal(item.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs whitespace-nowrap"
                >
                  Detail
                </button>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500 text-xs">Produk:</span>
                  <div className="text-gray-900">{item.produk || '-'}</div>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Tahapan:</span>
                  <div className="text-gray-900">
                    {item.tahapan?.nama_tahapan || '-'}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Qty Kurang:</span>
                  <div className="text-orange-700 font-medium">
                    {formatNumber(item.qty_kurang_qty)}
                  </div>
                </div>
                {renderUserBadge(
                  item.user_request,
                  'Diminta oleh',
                  item.tgl_request,
                )}
              </div>
            </div>
          ))
        )}

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
              onChange={(e, i) => setPage(i)}
              size="small"
            />
          </Stack>
        </div>
      </div>

      {/* Detail / Approve Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Detail Estimasi Kurang Qty
                {selectedDetail ? ` - ${selectedDetail.no_jo}` : ''}
              </h2>
              <button
                onClick={closeModal}
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

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {detailLoading ? (
                <div className="flex justify-center items-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : selectedDetail ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg text-sm">
                    <div>
                      <span className="text-xs font-medium text-gray-500">
                        No JO
                      </span>
                      <p className="text-gray-900">{selectedDetail.no_jo}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500">
                        No IO / SO
                      </span>
                      <p className="text-gray-900">
                        {selectedDetail.no_io} / {selectedDetail.no_so}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500">
                        Customer
                      </span>
                      <p className="text-gray-900">{selectedDetail.customer}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500">
                        Produk
                      </span>
                      <p className="text-gray-900">{selectedDetail.produk}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500">
                        Tahapan
                      </span>
                      <p className="text-gray-900">
                        {selectedDetail.tahapan?.nama_tahapan || '-'}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500">
                        Spesifikasi
                      </span>
                      <p className="text-gray-900">
                        {selectedDetail.spesifikasi || '-'}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500">
                        Qty JO
                      </span>
                      <p className="text-gray-900">
                        {formatNumber(selectedDetail.qty_jo)}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500">
                        Qty Kurang
                      </span>
                      <p className="text-orange-700 font-semibold">
                        {formatNumber(selectedDetail.qty_kurang_qty)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-3 bg-indigo-50 rounded-lg">
                    {renderUserBadge(
                      selectedDetail.user_request,
                      'Diminta oleh',
                      selectedDetail.tgl_request,
                    )}
                    {renderUserBadge(
                      selectedDetail.user_approve,
                      'Disetujui oleh',
                      selectedDetail.tgl_approve,
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">
                      Status
                    </span>
                    <span
                      className={`px-2 py-0.5 inline-flex text-xs font-semibold rounded-full ${getStatusColor(
                        selectedDetail.status,
                      )}`}
                    >
                      {selectedDetail.status}
                    </span>
                  </div>

                  {/* Note - required to approve */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Note{' '}
                      {isPending(selectedDetail.status) && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      disabled={!isPending(selectedDetail.status)}
                      rows={3}
                      placeholder="Tambahkan catatan sebelum approve..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-10">
                  Data not found.
                </p>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              {selectedDetail && isPending(selectedDetail.status) && (
                <button
                  onClick={() => handleApprove(selectedDetail.id)}
                  disabled={actionLoading[selectedDetail.id] || !note.trim()}
                  className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {actionLoading[selectedDetail.id] ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Approving...
                    </>
                  ) : (
                    'Approve'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EstimasiKurangQtyPPIC;
