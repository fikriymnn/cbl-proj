import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import OKPModal from './OKPModal';
import Pagination from '@mui/material/Pagination/Pagination';
import Stack from '@mui/material/Stack';

interface OKPItem {
  status: string;
  id: number;
  id_kalkulasi: number;
  no_okp: string;
  customer?: string;
  produk?: string;
  status_okp: string;
  tgl_target_marketing: string;
  jenis_pekerjaan: string[];
  id_pisau: string;
  file_spek_customer: string;
  rencana_qty_po: number;
  rencana_tgl_kirim: string;
  status_po: string;
  keterangan_cetak: string;
  tahapan: string[];
  posisi_proses: string;
  label?: string;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
  total_page?: number;
}

interface ApiError {
  message: string;
}

type SortKey = keyof OKPItem | 'index';
type SortDirection = 'asc' | 'desc';

const OKPKabag: React.FC = () => {
  const [data, setData] = useState<OKPItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedOKPId, setSelectedOKPId] = useState<number | undefined>();

  // Pagination states
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  // Search states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');

  const [showActionModal, setShowActionModal] = useState<boolean>(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [selectedOKPForAction, setSelectedOKPForAction] = useState<
    number | undefined
  >();
  const [sortKey, setSortKey] = useState<SortKey>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    fetchOKPData();
  }, [page, limit, searchTerm]);

  const fetchOKPData = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/marketing/okp`;
    try {
      setLoading(true);
      const res: AxiosResponse<ApiResponse<OKPItem[]>> = await axios.get(url, {
        params: {
          posisi_proses: 'kabag',
          page: page,
          limit: limit,
          search: searchTerm,
        },
        withCredentials: true,
      });
      console.log('Fetched OKP Kabag data:', res.data);
      if (res.data && res.data.data) {
        const parsedData = res.data.data.map((item) => ({
          ...item,
          jenis_pekerjaan:
            typeof item.jenis_pekerjaan === 'string'
              ? JSON.parse(item.jenis_pekerjaan)
              : item.jenis_pekerjaan,
          tahapan:
            typeof item.tahapan === 'string'
              ? JSON.parse(item.tahapan)
              : item.tahapan,
        }));
        setData(parsedData);

        // Set total pages from API response
        if (res.data.total_page) {
          setTotalPages(res.data.total_page);
        }
      } else {
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching OKP data:', error);
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

  const handleDetailOKP = (okpId: number) => {
    setSelectedOKPId(okpId);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOKPId(undefined);
  };

  const handleAction = (okpId: number, type: 'approve' | 'reject') => {
    setSelectedOKPForAction(okpId);
    setActionType(type);
    setShowActionModal(true);
  };

  const handleSubmitAction = async () => {
    if (!selectedOKPForAction) return;

    try {
      if (actionType === 'approve') {
        const url = `${
          import.meta.env.VITE_API_LINK
        }/marketing/okp/approve/${selectedOKPForAction}`;
        await axios.put(url, {
          withCredentials: true,
        });
        alert('OKP berhasil diapprove!');
      } else {
        const url = `${
          import.meta.env.VITE_API_LINK
        }/marketing/okp/reject/${selectedOKPForAction}`;
        await axios.put(url, {
          withCredentials: true,
        });
        alert('OKP berhasil direject!');
      }

      setShowActionModal(false);
      fetchOKPData();
    } catch (error) {
      console.error('Error processing action:', error);
      alert('Error processing action');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    });
  };

  const getSortIcon = (key: SortKey) => {
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

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortData = (data: OKPItem[]) => {
    return [...data].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortKey === 'jenis_pekerjaan') {
        aValue = Array.isArray(a.jenis_pekerjaan)
          ? a.jenis_pekerjaan.join(', ')
          : '';
        bValue = Array.isArray(b.jenis_pekerjaan)
          ? b.jenis_pekerjaan.join(', ')
          : '';
      } else if (sortKey === 'rencana_qty_po') {
        aValue = a.rencana_qty_po || 0;
        bValue = b.rencana_qty_po || 0;
      } else if (
        sortKey === 'tgl_target_marketing' ||
        sortKey === 'rencana_tgl_kirim'
      ) {
        aValue = new Date(a[sortKey] || 0).getTime();
        bValue = new Date(b[sortKey] || 0).getTime();
      } else {
        aValue = a[sortKey as keyof OKPItem] || '';
        bValue = b[sortKey as keyof OKPItem] || '';
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const getPosisiProsesColor = (posisi: string) => {
    switch (posisi.toLowerCase()) {
      case 'kabag':
        return 'bg-purple-100 text-purple-800';
      case 'marketing':
        return 'bg-blue-100 text-blue-800';
      case 'qa':
        return 'bg-orange-100 text-orange-800';
      case 'desain':
        return 'bg-pink-100 text-pink-800';
      case 'customer':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const sortedData = sortData(data);

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
            placeholder="Search OKP..."
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
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                  ACT
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('no_okp')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    NO OKP
                    {getSortIcon('no_okp')}
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
                    onClick={() => handleSort('label')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    LABEL
                    {getSortIcon('label')}
                  </button>
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('status_okp')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    STATUS
                    {getSortIcon('status_okp')}
                  </button>
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('tgl_target_marketing')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    TGL TARGET
                    {getSortIcon('tgl_target_marketing')}
                  </button>
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('jenis_pekerjaan')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    JENIS KERJA
                    {getSortIcon('jenis_pekerjaan')}
                  </button>
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('posisi_proses')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    POSISI
                    {getSortIcon('posisi_proses')}
                  </button>
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('status_po')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    PO
                    {getSortIcon('status_po')}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="px-4 py-6 text-center text-gray-500 text-sm"
                  >
                    {searchTerm
                      ? 'No OKP found matching your search'
                      : 'No OKP data available for Kabag Approval'}
                  </td>
                </tr>
              ) : (
                sortedData.map((item, index) => (
                  <tr
                    key={item.id || item.id_kalkulasi}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                      {(page - 1) * limit + index + 1}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs font-medium">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() =>
                            handleDetailOKP(item.id || item.id_kalkulasi)
                          }
                          className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs transition-colors"
                          title="View Details"
                        >
                          Detail
                        </button>
                        {item.status === 'on progress' && (
                          <>
                            <button
                              onClick={() => handleAction(item.id, 'approve')}
                              className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs transition-colors"
                              title="Approve OKP"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleAction(item.id, 'reject')}
                              className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs transition-colors"
                              title="Reject OKP"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      <span
                        className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded font-medium"
                        title={item.no_okp}
                      >
                        {item.no_okp ? truncateText(item.no_okp, 20) : '-'}
                      </span>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      <span
                        className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded font-medium"
                        title={item.customer}
                      >
                        {item.customer ? truncateText(item.customer, 20) : '-'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap">
                      <span
                        className="px-2 py-2 whitespace-nowrap text-xs text-gray-900"
                        title={item.produk}
                      >
                        {item.produk ? truncateText(item.produk, 20) : '-'}
                      </span>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                      <span
                        className={`${
                          item.label === 'CARTONING'
                            ? 'bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-medium'
                            : 'bg-blue-100 text-yellow-800 px-1.5 py-0.5 rounded font-medium'
                        }`}
                      >
                        {item.label || '-'}
                      </span>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                          item.status_okp === 'Baru'
                            ? 'bg-blue-100 text-blue-800'
                            : item.status_okp === 'Approved'
                            ? 'bg-green-100 text-green-800'
                            : item.status_okp === 'Draft'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                        title={item.status_okp}
                      >
                        {truncateText(item.status_okp, 8)}
                      </span>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                      <span title={item.tgl_target_marketing}>
                        {formatDate(item.tgl_target_marketing)}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-xs text-gray-900 max-w-32">
                      {Array.isArray(item.jenis_pekerjaan) &&
                      item.jenis_pekerjaan.length > 0 ? (
                        <div className="flex flex-wrap gap-0.5">
                          {item.jenis_pekerjaan
                            .slice(0, 2)
                            .map((jp, jpIndex) => (
                              <span
                                key={jpIndex}
                                className="bg-indigo-100 text-indigo-800 text-xs px-1 py-0.5 rounded font-medium"
                                title={jp}
                              >
                                {truncateText(jp, 8)}
                              </span>
                            ))}
                          {item.jenis_pekerjaan.length > 2 && (
                            <span
                              className="text-xs text-gray-500 cursor-help"
                              title={item.jenis_pekerjaan.join(', ')}
                            >
                              +{item.jenis_pekerjaan.length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded font-medium uppercase ${getPosisiProsesColor(
                          item.posisi_proses,
                        )}`}
                        title={item.posisi_proses}
                      >
                        {truncateText(item.posisi_proses, 8)}
                      </span>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded font-medium uppercase ${
                          item.status_po === 'tidak'
                            ? 'bg-red-100 text-red-800'
                            : item.status_po === 'ada'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                        title={item.status_po}
                      >
                        {truncateText(item.status_po, 6)}
                      </span>
                    </td>
                  </tr>
                ))
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

      {/* Detail Modal */}
      {showModal && (
        <OKPModal
          onClose={handleCloseModal}
          mode="detail"
          okpId={selectedOKPId}
        />
      )}

      {/* Action Confirmation Modal */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">
              Konfirmasi {actionType === 'approve' ? 'Approve' : 'Reject'} OKP
            </h2>

            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin{' '}
              {actionType === 'approve' ? 'menyetujui' : 'menolak'} OKP ini?
              {actionType === 'approve' &&
                ' Setelah disetujui, OKP akan masuk ke proses IO.'}
              {actionType === 'reject' &&
                ' Setelah ditolak, OKP akan dikembalikan untuk revisi.'}
            </p>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowActionModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleSubmitAction}
                className={`px-4 py-2 text-white rounded-md ${
                  actionType === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {actionType === 'approve' ? 'Ya, Approve' : 'Ya, Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OKPKabag;
