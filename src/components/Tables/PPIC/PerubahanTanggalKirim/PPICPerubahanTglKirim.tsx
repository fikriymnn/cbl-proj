// PPICPerubahanTglKirim.tsx
import React, { useEffect, useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import Pagination from '@mui/material/Pagination/Pagination';
import Stack from '@mui/material/Stack';

interface PerubahanTglKirimData {
  id: number;
  id_so: number;
  id_user_create: number;
  id_user_approve: number | null;
  id_user_reject: number | null;
  tgl_awal: string;
  tgl_perubahan: string;
  note: string;
  note_reject: string | null;
  status: string;
  no_so: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface APIResponse<T> {
  succes: boolean;
  status_code: number;
  data: T;
  total_page?: number;
}

const PPICPerubahanTglKirim: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<PerubahanTglKirimData[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof PerubahanTglKirimData | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });

  const [selectedItem, setSelectedItem] =
    useState<PerubahanTglKirimData | null>(null);
  const [isRejectPopupOpen, setIsRejectPopupOpen] = useState<boolean>(false);
  const [rejectNote, setRejectNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    fetchData();
  }, [page, limit]);

  const fetchData = async (): Promise<void> => {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/marketing/soPerubahanTanggalKirim`;
    try {
      setLoading(true);
      const res: AxiosResponse<APIResponse<PerubahanTglKirimData[]>> =
        await axios.get(url, {
          params: {
            page: page,
            limit: limit,
          },
          withCredentials: true,
        });

      console.log('Fetched perubahan tanggal kirim data:', res.data);
      if (res.data.succes) {
        setData(res.data.data);
        if (res.data.total_page) {
          setTotalPages(res.data.total_page);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    if (
      !confirm(
        'Apakah Anda yakin ingin menyetujui perubahan tanggal kirim ini?',
      )
    ) {
      return;
    }

    setIsSubmitting(true);
    try {
      const url = `${
        import.meta.env.VITE_API_LINK
      }/marketing/soPerubahanTanggalKirim/approve/${id}`;
      const response = await axios.put(url, {}, { withCredentials: true });

      if (response.data.succes) {
        alert('Perubahan tanggal kirim berhasil disetujui');
        fetchData();
      } else {
        alert(response.data.message || 'Gagal menyetujui perubahan');
      }
    } catch (error: any) {
      console.error('Error approving:', error);
      alert(
        error.response?.data?.message || 'Terjadi kesalahan saat menyetujui',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectClick = (item: PerubahanTglKirimData) => {
    setSelectedItem(item);
    setRejectNote('');
    setIsRejectPopupOpen(true);
  };

  const handleRejectSubmit = async () => {
    if (!selectedItem) return;

    if (!rejectNote.trim()) {
      alert('Catatan reject harus diisi');
      return;
    }

    setIsSubmitting(true);
    try {
      const url = `${
        import.meta.env.VITE_API_LINK
      }/marketing/soPerubahanTanggalKirim/reject/${selectedItem.id}`;
      const response = await axios.put(
        url,
        { note_reject: rejectNote },
        { withCredentials: true },
      );

      if (response.data.succes) {
        alert('Perubahan tanggal kirim berhasil ditolak');
        setIsRejectPopupOpen(false);
        setSelectedItem(null);
        setRejectNote('');
        fetchData();
      } else {
        alert(response.data.message || 'Gagal menolak perubahan');
      }
    } catch (error: any) {
      console.error('Error rejecting:', error);
      alert(error.response?.data?.message || 'Terjadi kesalahan saat menolak');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSort = (key: keyof PerubahanTglKirimData) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnKey: keyof PerubahanTglKirimData) => {
    if (sortConfig.key !== columnKey) {
      return <span className="ml-1 text-gray-400">⇅</span>;
    }
    return sortConfig.direction === 'asc' ? (
      <span className="ml-1">↑</span>
    ) : (
      <span className="ml-1">↓</span>
    );
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  const getSortedData = () => {
    let sorted = [...data];

    if (sortConfig.key) {
      sorted.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc'
            ? aValue - bValue
            : bValue - aValue;
        }

        return 0;
      });
    }

    return sorted;
  };

  const sortedData = getSortedData();

  const handleLimitChange = (newLimit: number): void => {
    setLimit(newLimit);
    setPage(1);
  };

  return (
    <div className="">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        /* Table */
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    NO
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ACTIONS
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('no_so')}
                      className="flex items-center hover:text-gray-700 focus:outline-none"
                    >
                      NO SO
                      {getSortIcon('no_so')}
                    </button>
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('tgl_awal')}
                      className="flex items-center hover:text-gray-700 focus:outline-none"
                    >
                      TGL AWAL
                      {getSortIcon('tgl_awal')}
                    </button>
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('tgl_perubahan')}
                      className="flex items-center hover:text-gray-700 focus:outline-none"
                    >
                      TGL PERUBAHAN
                      {getSortIcon('tgl_perubahan')}
                    </button>
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NOTE
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center hover:text-gray-700 focus:outline-none"
                    >
                      STATUS
                      {getSortIcon('status')}
                    </button>
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('createdAt')}
                      className="flex items-center hover:text-gray-700 focus:outline-none"
                    >
                      TGL DIBUAT
                      {getSortIcon('createdAt')}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-6 text-center text-gray-500 text-sm"
                    >
                      Tidak ada data perubahan tanggal kirim
                    </td>
                  </tr>
                ) : (
                  sortedData.map((item, index) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                        {(page - 1) * limit + index + 1}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs font-medium">
                        {item.status.toLowerCase() === 'requested' && (
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => handleApprove(item.id)}
                              disabled={isSubmitting}
                              className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs transition-colors disabled:bg-green-300"
                            >
                              APPROVE
                            </button>
                            <button
                              onClick={() => handleRejectClick(item)}
                              disabled={isSubmitting}
                              className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs transition-colors disabled:bg-red-300"
                            >
                              REJECT
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <span
                          className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded font-medium"
                          title={item.no_so}
                        >
                          {item.no_so
                            ? item.no_so.substring(0, 30) +
                              (item.no_so.length > 30 ? '...' : '')
                            : '-'}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                        {formatDate(item.tgl_awal)}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                        {formatDate(item.tgl_perubahan)}
                      </td>
                      <td className="px-2 py-2 text-xs text-gray-900 max-w-32">
                        <div>
                          <span title={item.note}>
                            {item.note
                              ? item.note.substring(0, 40) +
                                (item.note.length > 40 ? '...' : '')
                              : '-'}
                          </span>
                        </div>
                        {item.note_reject && (
                          <div
                            className="text-red-600 mt-1"
                            title={item.note_reject}
                          >
                            Reject: {item.note_reject.substring(0, 20)}
                            {item.note_reject.length > 20 ? '...' : ''}
                          </div>
                        )}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded font-medium uppercase ${
                            item.status === 'requested'
                              ? 'bg-yellow-100 text-yellow-800'
                              : item.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : item.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                          title={item.status}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                        {formatDate(item.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination with Rows per page selector */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 mt-6 pb-4">
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
              page={page}
              color="primary"
              onChange={(e, i) => {
                setPage(i);
              }}
            />
          </Stack>
        </div>
      </div>

      {/* Reject Popup */}
      {isRejectPopupOpen && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Reject Perubahan Tanggal Kirim
                </h2>
                <button
                  onClick={() => {
                    setIsRejectPopupOpen(false);
                    setSelectedItem(null);
                    setRejectNote('');
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isSubmitting}
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
            </div>
            <div className="px-6 py-4">
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="col-span-2">
                    <span className="text-gray-600">No SO:</span>
                    <p className="font-medium">{selectedItem.no_so}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Tanggal Awal:</span>
                    <p className="font-medium">
                      {formatDate(selectedItem.tgl_awal)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Tanggal Perubahan:</span>
                    <p className="font-medium">
                      {formatDate(selectedItem.tgl_perubahan)}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catatan Reject <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan alasan reject..."
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setIsRejectPopupOpen(false);
                  setSelectedItem(null);
                  setRejectNote('');
                }}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-red-300"
              >
                {isSubmitting ? 'Memproses...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PPICPerubahanTglKirim;
