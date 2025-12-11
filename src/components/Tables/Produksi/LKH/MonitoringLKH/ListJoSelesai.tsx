import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import { Pagination, Stack } from '@mui/material';

interface JoDoneItem {
  id: number;
  id_jo: number;
  id_io: number;
  id_so: number;
  id_customer: number | null;
  id_produk: number | null;
  id_user: number;
  no_jo: string;
  no_io: string;
  no_so: string;
  customer: string | null;
  produk: string;
  qty_kirim: number | null;
  status: string;
  status_proses: string;
  is_active: boolean;
  is_jo_done: boolean;
  createdAt: string;
  updatedAt: string;
}

interface JoDoneResponse {
  data: JoDoneItem[];
  status: number;
  success: boolean;
  total_page: number;
}

interface KirimPopupProps {
  item: JoDoneItem;
  onClose: () => void;
  onSuccess: () => void;
}

const KirimPopup: React.FC<KirimPopupProps> = ({
  item,
  onClose,
  onSuccess,
}) => {
  const [qtyKirim, setQtyKirim] = useState<number>(0);
  const [isJoDone, setIsJoDone] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (qtyKirim <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }

    try {
      setIsSubmitting(true);
      const url = `${import.meta.env.VITE_API_LINK}/produksi/joDone/kirim/${
        item.id
      }`;

      await axios.put(
        url,
        {
          qty_kirim: qtyKirim,
          is_jo_done: isJoDone,
        },
        {
          withCredentials: true,
        },
      );

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error sending kirim:', err);
      setError(err.response?.data?.message || 'Failed to send data');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Kirim JO</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                No JO
              </label>
              <input
                type="text"
                value={item.no_jo}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer
              </label>
              <input
                type="text"
                value={item.customer || '-'}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Produk
              </label>
              <input
                type="text"
                value={item.produk}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity Kirim <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={qtyKirim}
                onChange={(e) => setQtyKirim(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter quantity"
                min="1"
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isJoDone"
                checked={isJoDone}
                onChange={(e) => setIsJoDone(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isJoDone" className="ml-2 text-sm text-gray-700">
                Mark JO as Done
              </label>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sending...' : 'Kirim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ListJoSelesai: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [joDoneData, setJoDoneData] = useState<JoDoneItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<JoDoneItem | null>(null);
  const [showKirimPopup, setShowKirimPopup] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [limit, setLimit] = useState<number>(10);

  useEffect(() => {
    fetchJoDoneData();
  }, [page, searchTerm, limit]);

  const fetchJoDoneData = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/produksi/joDone`;
    try {
      setLoading(true);

      const res: AxiosResponse<JoDoneResponse> = await axios.get(url, {
        params: {
          page: page,
          limit: limit,
          search: searchTerm,
        },
        withCredentials: true,
      });

      console.log('Fetched Jo Selesai data:', res.data);

      setJoDoneData(res.data.data || []);
      setTotalPages(res.data.total_page || 1);
    } catch (error) {
      console.error('Error fetching JO Done data:', error);
      setJoDoneData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLimitChange = (newLimit: number): void => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleKirimClick = (item: JoDoneItem) => {
    setSelectedItem(item);
    setShowKirimPopup(true);
  };

  const handleClosePopup = () => {
    setShowKirimPopup(false);
    setSelectedItem(null);
  };

  const handleKirimSuccess = () => {
    fetchJoDoneData();
  };

  const truncateText = (text: string | null, maxLength: number) => {
    if (!text) return '-';
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  const formatDateTime = (dateString: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const formatNumber = (num: number | null | undefined): string => {
    if (num === null || num === undefined) return '-';
    return num.toLocaleString('id-ID');
  };

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: string } = {
      done: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      process: 'bg-blue-100 text-blue-800',
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          statusColors[status] || 'bg-gray-100 text-gray-800'
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
        <div className="flex flex-col gap-2 sm:gap-3 mb-3 sm:mb-4">
          {/* Search */}
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search by JO, IO, SO, Customer, or Product..."
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
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Action
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  No JO
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  No IO
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  No SO
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Customer
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Produk
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  QTY Kirim
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  JO Done
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-3 py-4 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : joDoneData.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-3 py-4 text-center text-gray-500 text-sm"
                  >
                    No data available
                  </td>
                </tr>
              ) : (
                joDoneData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap text-xs">
                      {(item.status_proses == 'progress' ||
                        item.status_proses == 'reject qc' ||
                        item.status_proses == 'done') &&
                      (item.is_jo_done == false || item.is_jo_done == null) ? (
                        <>
                          {' '}
                          <button
                            onClick={() => handleKirimClick(item)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                          >
                            Kirim
                          </button>
                        </>
                      ) : (
                        <>-</>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 font-medium">
                      {item.no_jo || '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {item.no_io || '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {item.no_so || '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {truncateText(item.customer, 20)}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-900 max-w-xs">
                      {truncateText(item.produk, 30)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {formatNumber(item.qty_kirim)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs">
                      {getStatusBadge(item.status_proses)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs">
                      {item.is_jo_done ? (
                        <span className="text-green-600 font-medium">
                          ✓ Yes
                        </span>
                      ) : (
                        <span className="text-gray-400">✗ No</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination with Rows per page selector */}
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
        ) : joDoneData.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            No data available
          </div>
        ) : (
          joDoneData.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="font-semibold text-sm text-gray-900">
                    {item.no_jo || '-'}
                  </div>
                  <div className="text-xs text-gray-600 mt-0.5">
                    {item.customer || '-'}
                  </div>
                </div>
                {(item.status_proses == 'progress' ||
                  item.status_proses == 'reject qc' ||
                  item.status_proses == 'done') &&
                (item.is_jo_done == false || item.is_jo_done == null) ? (
                  <>
                    {' '}
                    <button
                      onClick={() => handleKirimClick(item)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                    >
                      Kirim
                    </button>
                  </>
                ) : (
                  <>-</>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-500 text-xs font-medium">
                      No IO:
                    </span>
                    <div className="text-gray-900 text-xs">{item.no_io}</div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs font-medium">
                      No SO:
                    </span>
                    <div className="text-gray-900 text-xs">{item.no_so}</div>
                  </div>
                </div>

                <div>
                  <span className="text-gray-500 text-xs font-medium">
                    Produk:
                  </span>
                  <div className="text-gray-900 text-xs">{item.produk}</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-500 text-xs font-medium">
                      QTY Kirim:
                    </span>
                    <div className="text-gray-900 text-xs">
                      {formatNumber(item.qty_kirim)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs font-medium">
                      Status:
                    </span>
                    <div className="mt-1">{getStatusBadge(item.status)}</div>
                  </div>
                </div>

                <div>
                  <span className="text-gray-500 text-xs font-medium">
                    JO Done:
                  </span>
                  <div className="text-gray-900 text-xs mt-1">
                    {item.is_jo_done ? (
                      <span className="text-green-600 font-medium">✓ Yes</span>
                    ) : (
                      <span className="text-gray-400">✗ No</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Mobile Pagination */}
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
      </div>

      {/* Kirim Popup */}
      {showKirimPopup && selectedItem && (
        <KirimPopup
          item={selectedItem}
          onClose={handleClosePopup}
          onSuccess={handleKirimSuccess}
        />
      )}
    </div>
  );
};

export default ListJoSelesai;
