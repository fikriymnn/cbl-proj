// ApprovalStandarWarna.tsx
import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import Pagination from '@mui/material/Pagination/Pagination';
import Stack from '@mui/material/Stack';

type StatusFilter = 'progress' | 'approved' | 'rejected';

interface StandarWarnaData {
  id: number;
  id_jo: number;
  id_io: number;
  id_so: number;
  id_customer: number;
  id_produk: number;
  id_user_approve: number | null;
  id_user_reject: number | null;
  no_io: string;
  no_jo: string;
  no_so: string;
  customer: string;
  produk: string;
  status: string;
  no_standar_warna: string;
  status_proses: string;
  is_active: boolean;
  note: string | null;
  qty_kirim: number | null;
  so: {
    po_qty: number;
  } | null;
  createdAt: string;
  updatedAt: string;
}

interface APIResponse<T> {
  success: boolean;
  data: T;
  total_page?: number;
}

const ApprovalStandarWarna: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<StandarWarnaData[]>([]);

  // Pagination and Search states
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');

  // Status filter
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('progress');

  const handleSearch = (): void => {
    setSearchTerm(searchInput);
    setPage(1);
  };

  const handleClearSearch = (): void => {
    setSearchInput('');
    setSearchTerm('');
    setPage(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleLimitChange = (newLimit: number): void => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleStatusFilterChange = (status: StatusFilter): void => {
    setStatusFilter(status);
    setPage(1);
  };

  const fetchData = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/ppic/pembuatanStandarWarna`;
    try {
      setLoading(true);
      const res: AxiosResponse<APIResponse<StandarWarnaData[]>> =
        await axios.get(url, {
          params: {
            page,
            limit,
            search: searchTerm,
            status: statusFilter,
          },
          withCredentials: true,
        });
      if (res.data.success) {
        setData(res.data.data || res.data);
        if (res.data.total_page) {
          setTotalPages(res.data.total_page);
        }
      }
      console.log('Fetched standar warna data:', res.data);
    } catch (error) {
      console.error('Error fetching standar warna data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'progress':
        return 'bg-orange-100 text-orange-800 border border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  // Send to Marketing (Next)
  const nextToMarketing = async (id: number): Promise<void> => {
    if (
      window.confirm(
        'Apakah Anda yakin ingin meneruskan Standar Warna ini ke Marketing untuk disetujui?',
      )
    ) {
      try {
        const url = `${
          import.meta.env.VITE_API_LINK
        }/ppic/pembuatanStandarWarna/next/${id}`;
        await axios.put(url, {}, { withCredentials: true });
        fetchData();
        alert('Standar Warna berhasil diteruskan ke Marketing!');
      } catch (error: any) {
        console.error(error);
        alert('Gagal meneruskan Standar Warna. Silakan coba lagi.');
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, limit, searchTerm, statusFilter]);

  const statusFilterOptions: {
    label: string;
    value: StatusFilter;
    color: string;
    activeColor: string;
  }[] = [
    {
      label: 'Progress',
      value: 'progress',
      color:
        'bg-gray-100 text-gray-700 hover:bg-orange-50 hover:text-orange-700',
      activeColor: 'bg-orange-500 text-white',
    },
    {
      label: 'Approved',
      value: 'approved',
      color: 'bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-700',
      activeColor: 'bg-green-500 text-white',
    },
    {
      label: 'Rejected',
      value: 'rejected',
      color: 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-700',
      activeColor: 'bg-red-500 text-white',
    },
  ];

  return (
    <div className="">
      {/* Status Filter + Search Bar */}
      <div className="mb-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <input
              type="text"
              placeholder="Search by No Standar Warna, Produk, Customer, Warna..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={handleSearch}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors h-[42px]"
            >
              Search
            </button>
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="bg-gray-500 hover:bg-gray-600 text-red-500 px-4 py-2 rounded-md text-sm font-medium transition-colors h-[42px]"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {statusFilterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleStatusFilterChange(opt.value)}
                className={`px-4 py-1.5 text-sm rounded-full font-medium transition-colors ${
                  statusFilter === opt.value ? opt.activeColor : opt.color
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  NO
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36">
                  ACTION
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NO STANDAR WARNA
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NOMOR
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  STATUS
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CUSTOMER
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PRODUK
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PO QTY
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  QTY KIRIM
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TGL DIBUAT
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NOTE
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={12} className="px-4 py-6 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={12}
                    className="px-4 py-6 text-center text-gray-500 text-sm"
                  >
                    {searchTerm
                      ? 'Tidak ada data yang cocok dengan pencarian'
                      : 'Tidak ada data Standar Warna'}
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* NO */}
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                      {(page - 1) * limit + index + 1}
                    </td>

                    {/* ACTION — only NEXT button, visible when status is progress */}
                    <td className="px-2 py-2 whitespace-nowrap text-xs font-medium">
                      <div className="flex flex-col gap-1">
                        {item.status?.toLowerCase() === 'progress' ? (
                          <button
                            onClick={() => nextToMarketing(item.id)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs transition-colors"
                            title="Teruskan ke Marketing"
                          >
                            NEXT →
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400 italic px-2 py-1">
                            {item.status?.toLowerCase() === 'approved'
                              ? '✓ Sudah Disetujui'
                              : '✗ Sudah Ditolak'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                      <span title={item.no_standar_warna}>
                        {item.no_standar_warna
                          ? item.no_standar_warna.substring(0, 30) +
                            (item.no_standar_warna.length > 30 ? '...' : '')
                          : '-'}
                      </span>
                    </td>
                    {/* NO JO */}
                    <td className="px-2 py-2 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        {item.no_jo ? (
                          <span
                            className="bg-indigo-100 text-indigo-800 text-xs px-1.5 py-0.5 rounded font-medium"
                            title={item.no_jo}
                          >
                            {item.no_jo.substring(0, 25) +
                              (item.no_jo.length > 25 ? '...' : '')}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                        <span
                          className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded font-medium"
                          title={item.no_so}
                        >
                          {item.no_so
                            ? item.no_so.substring(0, 20) +
                              (item.no_so.length > 20 ? '...' : '')
                            : '-'}
                        </span>
                        <span
                          className="bg-purple-100 text-purple-800 text-xs px-1.5 py-0.5 rounded font-medium"
                          title={item.no_io}
                        >
                          {item.no_io
                            ? item.no_io.substring(0, 20) +
                              (item.no_io.length > 20 ? '...' : '')
                            : '-'}
                        </span>
                      </div>
                    </td>

                    {/* STATUS */}
                    <td className="px-2 py-2 whitespace-nowrap">
                      {item.status ? (
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded font-medium ${getStatusBadge(
                            item.status,
                          )}`}
                        >
                          {item.status}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>

                    {/* CUSTOMER */}
                    <td className="px-2 py-2 text-xs text-gray-900 max-w-32">
                      <span title={item.customer}>
                        {item.customer
                          ? item.customer.substring(0, 30) +
                            (item.customer.length > 30 ? '...' : '')
                          : '-'}
                      </span>
                    </td>

                    {/* PRODUK */}
                    <td className="px-2 py-2 text-xs text-gray-900 max-w-32">
                      <span title={item.produk}>
                        {item.produk
                          ? item.produk.substring(0, 50) +
                            (item.produk.length > 50 ? '...' : '')
                          : '-'}
                      </span>
                    </td>

                    {/* PO QTY */}
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                      {item.so?.po_qty != null ? (
                        <span className="font-medium">
                          {item.so.po_qty.toLocaleString('id-ID')}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>

                    {/* QTY KIRIM */}
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                      {item.qty_kirim != null ? (
                        <span className="font-medium">
                          {item.qty_kirim.toLocaleString('id-ID')}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>

                    {/* TGL DIBUAT */}
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                      {formatDate(item.createdAt)}
                    </td>

                    {/* NOTE */}
                    <td className="px-2 py-2 text-xs text-gray-700 max-w-xs">
                      {item.note ? (
                        <span
                          title={item.note}
                          className="italic text-gray-600"
                        >
                          {item.note.substring(0, 60) +
                            (item.note.length > 60 ? '...' : '')}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
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
    </div>
  );
};

export default ApprovalStandarWarna;
