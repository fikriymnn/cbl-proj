import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import Pagination from '@mui/material/Pagination/Pagination';
import Stack from '@mui/material/Stack';

// Updated interface to match the new API response
interface IOItem {
  id: number;
  id_okp: number;
  id_create_io: number;
  id_approve_io: number | null;
  no_io: string;
  customer: string;
  produk: string;
  status: string;
  status_io: string;
  status_proses: string;
  status_send_proof: string;
  tgl_pembuatan_io: string;
  tgl_approve_io: string | null;
  note_reject: string | null;
  is_active: boolean;
  is_revisi: boolean;
  revisi_no_io: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T = any> {
  data: T;
  status_code: number;
  succes: boolean;
  total_page?: number;
}

interface ApiError {
  message: string;
  status?: number;
}

const KabagApprovalIOHistory: React.FC = () => {
  const [data, setData] = useState<IOItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Pagination states
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  // Search states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');

  useEffect(() => {
    fetchIOData();
  }, [page, limit, searchTerm]);

  const fetchIOData = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/marketing/io`;
    try {
      setLoading(true);
      const res: AxiosResponse<ApiResponse<IOItem[]>> = await axios.get(url, {
        params: {
          page: page,
          limit: limit,
          search: searchTerm,
          status: 'history',
        },
        withCredentials: true,
      });
      console.log('Fetched IO data:', res.data);
      if (res.data && res.data.data) {
        setData(res.data.data);

        // Set total pages from API response
        if (res.data.total_page) {
          setTotalPages(res.data.total_page);
        }
      } else {
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching IO data:', error);
      const apiError = error as ApiError;
      alert(`Error: ${apiError.message || 'Failed to fetch data'}`);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (): void => {
    setSearchTerm(searchInput);
    setPage(1); // Reset to first page when searching
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
    setPage(1); // Reset to first page when changing limit
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto py-1 px-2">
      {/* Header with Search */}
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search IO History..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 w-48 text-sm"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
          >
            Search
          </button>
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  No
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  No IO
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status IO
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tanggal Pembuatan
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Produk
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Status Proses
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.length > 0 ? (
                data.map((item: IOItem, index: number) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs">
                      {(page - 1) * limit + index + 1}
                    </td>
                    <td className="px-4 py-3 text-xs">{item.no_io}</td>
                    <td className="px-4 py-3 text-xs">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {item.status_io}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {new Date(item.tgl_pembuatan_io).toLocaleDateString(
                        'id-ID',
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs">{item.customer}</td>
                    <td className="px-4 py-3 text-xs max-w-xs truncate">
                      {item.produk}
                    </td>
                    <td className="px-4 py-3 text-xs text-center">
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs uppercase">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-center">
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs uppercase">
                        {item.status_proses}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    {searchTerm
                      ? 'No IO found matching your search'
                      : 'Tidak ada data IO'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
                console.log(i);
              }}
            />
          </Stack>
        </div>
      </div>
    </div>
  );
};

export default KabagApprovalIOHistory;
