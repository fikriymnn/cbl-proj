// BOMApproval.tsx
import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import BOMManagementModal from './BOMManagementModal';
import Pagination from '@mui/material/Pagination/Pagination';
import Stack from '@mui/material/Stack';

type SortDirection = 'asc' | 'desc';

interface APIResponse<T> {
  succes: boolean;
  data: T;
  total_page?: number;
}

// ✅ New BOM Interface for array items
interface BOMData {
  id: number;
  no_bom: string;
  no_io: string;
  no_so: string;
  no_jo: string | null;
  customer: string;
  produk: string;
  nama_mounting: string;
  status: string;
  status_bom: string;
  status_proses: string;
  note_reject: string | null;
  is_active: boolean;
  is_bom_ppic_done: boolean;
  id_io: number;
  id_so: number | null;
  id_jo: number | null;
  id_io_mounting: number;
  id_create_bom: number;
  id_approve_bom: number | null;
  tgl_pembuatan_bom: string;
  tgl_approve_bom: string | null;
  createdAt: string;
  updatedAt: string;
}

// ✅ New IO Data Interface
interface IOData {
  id: number;
  no_io: string;
  customer: string;
  produk: string;
  label: string;
  keterangan: string;
  status: string;
  status_io: string;
  status_proses: string;
  status_send_proof: string;
  note_reject: string | null;
  is_active: boolean;
  is_send_proof: boolean;
  is_updated: boolean;
  qty_send_proof: number | null;
  revisi_ke: number;
  base_no_io: string | null;
  id_customer: number;
  id_produk: number;
  id_okp: number;
  id_create_io: number;
  id_approve_io: number | null;
  tgl_pembuatan_io: string;
  tgl_approve_io: string | null;
  createdAt: string;
  updatedAt: string;
  bom: BOMData[]; // Array of BOMs
}

const BOMApprovalFromIO: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [ioData, setIOData] = useState<IOData[]>([]);
  const [sortKey, setSortKey] = useState<string>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedSOId, setSelectedSOId] = useState<number | null>(null);
  const [selectedIOId, setSelectedIOId] = useState<number | null>(null);
  const [showBOMModal, setShowBOMModal] = useState<boolean>(false);

  // Pagination and Search states
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');

  const handleSort = (field: string) => {
    if (sortKey === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (key: string) => {
    if (sortKey !== key) {
      return (
        <svg
          className="w-3 h-3 ml-1 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 9l4-4 4 4m0 6l-4 4-4-4"
          />
        </svg>
      );
    }
    return sortDirection === 'asc' ? (
      <svg
        className="w-3 h-3 ml-1 text-blue-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 15l7-7 7 7"
        />
      </svg>
    ) : (
      <svg
        className="w-3 h-3 ml-1 text-blue-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    );
  };

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

  const fetchIOData = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/marketing/io`;
    try {
      setLoading(true);
      const res: AxiosResponse<APIResponse<IOData[]>> = await axios.get(url, {
        params: {
          is_send_proof: true,
          page: page,
          limit: limit,
          search: searchTerm,
          status_bom: 'requested',
        },
        withCredentials: true,
      });
      console.log('Fetched IO data:', res.data);
      if (res.data.succes) {
        setIOData(res.data.data || []);
        if (res.data.total_page) {
          setTotalPages(res.data.total_page);
        }
      }
    } catch (error) {
      console.error('Error fetching IO data:', error);
      setIOData([]);
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

  const getStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'baru':
        return 'bg-blue-100 text-blue-800';
      case 'repeat perubahan':
        return 'bg-green-100 text-green-800';
      case 'repeat':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor2 = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'requested':
        return 'bg-orange-100 text-orange-800 border border-orange-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'history':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'pending':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'request to kabag':
        return 'bg-orange-100 text-orange-800 border border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  // ✅ Helper function to check if BOM exists
  const hasBOM = (item: IOData): boolean => {
    return Array.isArray(item.bom) && item.bom.length > 0;
  };

  // ✅ Helper function to get first BOM from array
  const getFirstBOM = (item: IOData): BOMData | null => {
    return hasBOM(item) ? item.bom[0] : null;
  };

  // ✅ Helper function to get BOM status badge
  const getBOMStatusBadge = (item: IOData) => {
    if (hasBOM(item)) {
      const bomCount = item.bom.length;
      return (
        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 border border-green-200 font-medium">
          ✓ BOM Created {bomCount > 1 ? `(${bomCount})` : ''}
        </span>
      );
    }
    return (
      <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-800 border border-orange-200 font-medium">
        ⚠ No BOM
      </span>
    );
  };

  // ✅ Helper function to check if EDIT button should be shown
  const canEditBOM = (item: IOData): boolean => {
    if (!hasBOM(item)) return false;
    const bom = getFirstBOM(item);
    const status = bom?.status_proses?.toLowerCase();
    return (
      status === 'draft' ||
      status === 'rejected' ||
      status === 'request to kabag'
    );
  };

  // Approve BOM function
  const approveBOM = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menyetujui BOM ini?')) {
      try {
        const url = `${import.meta.env.VITE_API_LINK}/ppic/bom/approve/${id}`;
        await axios.put(
          url,
          {},
          {
            withCredentials: true,
          },
        );
        fetchIOData();
        alert('BOM berhasil disetujui!');
      } catch (error: any) {
        console.log(error);
        alert('Gagal menyetujui BOM. Silakan coba lagi.');
      }
    }
  };

  // Reject BOM function
  const rejectBOM = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menolak BOM ini?')) {
      try {
        const url = `${import.meta.env.VITE_API_LINK}/ppic/bom/reject/${id}`;
        await axios.put(
          url,
          {},
          {
            withCredentials: true,
          },
        );
        fetchIOData();
        alert('BOM berhasil ditolak!');
      } catch (error: any) {
        console.log(error);
        alert('Gagal menolak BOM. Silakan coba lagi.');
      }
    }
  };

  useEffect(() => {
    fetchIOData();
  }, [page, limit, searchTerm]);

  const sortedData = React.useMemo(() => {
    const sorted = [...ioData].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      // Special handling for bom-related sorting
      if (sortKey === 'bom') {
        aValue = hasBOM(a) ? 1 : 0;
        bValue = hasBOM(b) ? 1 : 0;
      } else if (sortKey === 'status_proses') {
        aValue = getFirstBOM(a)?.status_proses || '';
        bValue = getFirstBOM(b)?.status_proses || '';
      } else if (sortKey === 'no_bom') {
        aValue = getFirstBOM(a)?.no_bom || '';
        bValue = getFirstBOM(b)?.no_bom || '';
      } else {
        aValue = a[sortKey as keyof IOData];
        bValue = b[sortKey as keyof IOData];
      }

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [ioData, sortKey, sortDirection]);

  const handleManageBOM = (io: IOData) => {
    const firstBOM = getFirstBOM(io);
    setSelectedIOId(io.id);
    setSelectedSOId(firstBOM?.id_so || null);
    setShowBOMModal(true);
  };

  return (
    <div className="">
      {/* Search Bar */}
      <div className="mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <input
              type="text"
              placeholder="Search by No IO, Customer, Produk..."
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
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors h-[42px]"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                  <button className="flex items-center hover:text-gray-700 focus:outline-none">
                    NO
                  </button>
                </th>

                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  ACTION
                </th>

                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('no_bom')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    NO BOM
                    {getSortIcon('no_bom')}
                  </button>
                </th>

                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('bom')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    BOM INFO
                    {getSortIcon('bom')}
                  </button>
                </th>

                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('no_io')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    NO IO
                    {getSortIcon('no_io')}
                  </button>
                </th>

                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('customer')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    CUSTOMER
                    {getSortIcon('customer')}
                  </button>
                </th>

                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('produk')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    PRODUK
                    {getSortIcon('produk')}
                  </button>
                </th>

                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('status_io')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    STATUS IO
                    {getSortIcon('status_io')}
                  </button>
                </th>

                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('tgl_pembuatan_io')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    TGL BUAT
                    {getSortIcon('tgl_pembuatan_io')}
                  </button>
                </th>

                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('status_proses')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    STATUS BOM
                    {getSortIcon('status_proses')}
                  </button>
                </th>

                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('is_active')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    ACTIVE
                    {getSortIcon('is_active')}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={11} className="px-4 py-6 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : sortedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="px-4 py-6 text-center text-gray-500 text-sm"
                  >
                    {searchTerm
                      ? 'No IO found matching your search'
                      : 'No IO data available'}
                  </td>
                </tr>
              ) : (
                sortedData.map((item, index) => {
                  const firstBOM = getFirstBOM(item);

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* NO */}
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                        {(page - 1) * limit + index + 1}
                      </td>

                      {/* ACTION */}
                      <td className="px-2 py-2 whitespace-nowrap text-xs font-medium">
                        <div className="flex flex-col gap-1">
                          {canEditBOM(item) && (
                            <button
                              onClick={() => handleManageBOM(item)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs transition-colors"
                              title="Edit BOM"
                            >
                              EDIT BOM
                            </button>
                          )}

                          {hasBOM(item) &&
                            firstBOM?.status_proses === 'request to kabag' && (
                              <>
                                <button
                                  onClick={() => approveBOM(firstBOM.id)}
                                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs transition-colors"
                                  title="Approve BOM"
                                >
                                  APPROVE
                                </button>
                                <button
                                  onClick={() => rejectBOM(firstBOM.id)}
                                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition-colors"
                                  title="Reject BOM"
                                >
                                  REJECT
                                </button>
                              </>
                            )}

                          {!hasBOM(item) && (
                            <span className="text-xs text-gray-400 italic px-2 py-1">
                              No BOM Available
                            </span>
                          )}
                        </div>
                      </td>

                      {/* NO BOM */}
                      <td className="px-2 py-2 whitespace-nowrap">
                        {firstBOM?.no_bom ? (
                          <span
                            className="bg-indigo-100 text-indigo-800 text-xs px-1.5 py-0.5 rounded font-medium"
                            title={firstBOM.no_bom}
                          >
                            {firstBOM.no_bom.substring(0, 20) +
                              (firstBOM.no_bom.length > 20 ? '...' : '')}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>

                      {/* BOM INFO */}
                      <td className="px-2 py-2 whitespace-nowrap">
                        {getBOMStatusBadge(item)}
                      </td>

                      {/* NO IO */}
                      <td className="px-2 py-2 whitespace-nowrap">
                        <span
                          className="bg-purple-100 text-purple-800 text-xs px-1.5 py-0.5 rounded font-medium"
                          title={item.no_io}
                        >
                          {item.no_io
                            ? item.no_io.substring(0, 20) +
                              (item.no_io.length > 20 ? '...' : '')
                            : '-'}
                        </span>
                      </td>

                      {/* CUSTOMER */}
                      <td className="px-2 py-2 text-xs text-gray-900 max-w-32">
                        <span title={item.customer}>
                          {item.customer
                            ? item.customer.substring(0, 50) +
                              (item.customer.length > 50 ? '...' : '')
                            : '-'}
                        </span>
                      </td>

                      {/* PRODUK */}
                      <td className="px-2 py-2 text-xs text-gray-900 max-w-32">
                        <span title={item.produk}>
                          {item.produk
                            ? item.produk.substring(0, 90) +
                              (item.produk.length > 90 ? '...' : '')
                            : '-'}
                        </span>
                      </td>

                      {/* STATUS IO */}
                      <td className="px-2 py-2 whitespace-nowrap">
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded font-medium ${getStatusColor(
                            item.status_io,
                          )}`}
                          title={item.status_io}
                        >
                          {item.status_io
                            ? item.status_io.substring(0, 12) +
                              (item.status_io.length > 12 ? '...' : '')
                            : '-'}
                        </span>
                      </td>

                      {/* TGL BUAT */}
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                        <span title={item.tgl_pembuatan_io}>
                          {formatDate(item.tgl_pembuatan_io)}
                        </span>
                      </td>

                      {/* STATUS BOM */}
                      <td className="px-2 py-2 whitespace-nowrap">
                        {firstBOM?.status_proses ? (
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded font-medium ${getStatusColor2(
                              firstBOM.status_proses,
                            )}`}
                            title={firstBOM.status_proses}
                          >
                            {firstBOM.status_proses.substring(0, 12) +
                              (firstBOM.status_proses.length > 12 ? '...' : '')}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>

                      {/* ACTIVE */}
                      <td className="px-2 py-2 whitespace-nowrap">
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                            item.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {item.is_active ? 'YA' : 'TIDAK'}
                        </span>
                      </td>
                    </tr>
                  );
                })
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
              }}
            />
          </Stack>
        </div>
      </div>

      {/* BOM Management Modal */}
      {showBOMModal && selectedIOId && (
        <BOMManagementModal
          ioId={selectedIOId}
          onClose={() => {
            setShowBOMModal(false);
            setSelectedSOId(null);
            setSelectedIOId(null);
          }}
          onSuccess={() => {
            fetchIOData();
            setShowBOMModal(false);
            setSelectedSOId(null);
            setSelectedIOId(null);
          }}
          dataSource="IO"
        />
      )}
    </div>
  );
};

export default BOMApprovalFromIO;
