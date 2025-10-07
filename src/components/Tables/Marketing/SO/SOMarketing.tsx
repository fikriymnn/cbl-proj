// SOMarketing.tsx
import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import {
  APIResponse,
  SOData,
  SOFormData,
  KalkulasiData,
} from './types/SOTypes';
import SOCreatePopup from './SOCreatePopUp';
import SearchableSelect from '../../../../pages/MasterData/Marketing/SearchableSelect';
import SODetailPopup from './SODetailPopup';
import SODoneIOManualPopup from './SODoneIOPopup';

const SOMarketing: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [soData, setsoData] = useState<SOData[]>([]);
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof SOData | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });
  const [isDetailPopupOpen, setIsDetailPopupOpen] = useState<boolean>(false);
  const [selectedSO, setSelectedSO] = useState<SOData | null>(null);
  const [requestLoading, setRequestLoading] = useState<number | null>(null);
  // Filter states
  const [kalkulasiOptions, setKalkulasiOptions] = useState<
    Array<{
      value: string;
      label: string;
      data: KalkulasiData;
    }>
  >([]);
  const [selectedIOFilter, setSelectedIOFilter] = useState<string>('');
  const [kalkulasiLoading, setKalkulasiLoading] = useState(false);
  const [isDoneIOManualPopupOpen, setIsDoneIOManualPopupOpen] =
    useState<boolean>(false);
  const [doneWorkLoading, setDoneWorkLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchsoData();
    fetchKalkulasiData();
  }, []);

  // Fetch SO data when filters change
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchsoData();
    }, 500); // Debounce for 500ms

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedIOFilter]);
  const handleDoneWork = async (id: number) => {
    if (
      window.confirm('Apakah Anda yakin ingin menyelesaikan pekerjaan SO ini?')
    ) {
      try {
        setDoneWorkLoading(id);
        const url = `${
          import.meta.env.VITE_API_LINK
        }/marketing/so/doneWork/${id}`;
        const res = await axios.put(
          url,
          {},
          {
            withCredentials: true,
          },
        );

        if (res.data.succes) {
          alert('Pekerjaan SO berhasil diselesaikan!');
          fetchsoData();
        }
      } catch (error: any) {
        console.error('Error completing SO work:', error);
        alert(
          error.response?.data?.message ||
            'Gagal menyelesaikan pekerjaan SO. Silakan coba lagi.',
        );
      } finally {
        setDoneWorkLoading(null);
      }
    }
  };
  const fetchsoData = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/marketing/so`;
    try {
      setLoading(true);

      const res: AxiosResponse<APIResponse<SOData[]>> = await axios.get(url, {
        params: {
          search: searchTerm,
          id_io: selectedIOFilter,
        },
        withCredentials: true,
      });

      console.log('Fetched so data:', res.data);
      if (res.data.succes) {
        setsoData(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching so data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Kalkulasi data for filter
  const fetchKalkulasiData = async () => {
    const url = `${import.meta.env.VITE_API_LINK}/marketing/kalkulasi`;
    setKalkulasiLoading(true);
    try {
      const response = await axios.get(url, {
        params: {
          is_io_active: true,
        },
        withCredentials: true,
      });
      if (response.data.succes && response.data.data) {
        // Group by id_io and filter based on status_kalkulasi
        const groupedByIdIO = response.data.data.reduce(
          (acc: Record<string, KalkulasiData[]>, item: KalkulasiData) => {
            const idIO = item.id_io?.toString() || '';
            if (!acc[idIO]) {
              acc[idIO] = [];
            }
            acc[idIO].push(item);
            return acc;
          },
          {} as Record<string, KalkulasiData[]>,
        );

        const filteredData: KalkulasiData[] = [];
        Object.keys(groupedByIdIO).forEach((idIO) => {
          const items = groupedByIdIO[idIO];
          if (items.length > 1) {
            const baruItem = items.find(
              (item: KalkulasiData) =>
                item.status_kalkulasi?.toLowerCase() === 'baru',
            );
            if (baruItem) {
              filteredData.push(baruItem);
            } else {
              filteredData.push(items[0]);
            }
          } else {
            filteredData.push(items[0]);
          }
        });

        const options = filteredData.map((item: KalkulasiData) => ({
          value: item.id.toString(),
          label: `${item.no_io} - ${item.nama_customer}, ${item.nama_produk}`,
          data: item,
        }));
        setKalkulasiOptions(options);
      }
    } catch (error) {
      console.error('Error fetching Kalkulasi data:', error);
    } finally {
      setKalkulasiLoading(false);
    }
  };
  const RequestKabag = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin Request SO Ini?')) {
      try {
        setRequestLoading(id);
        const url = `${
          import.meta.env.VITE_API_LINK
        }/marketing/so/request/${id}`;
        const res = await axios.put(
          url,
          {},
          {
            withCredentials: true,
          },
        );

        if (res.data.succes) {
          alert('SO berhasil di-request!');
          fetchsoData();
        }
      } catch (error: any) {
        console.log(error);
        alert('Gagal request SO. Silakan coba lagi.');
      } finally {
        setRequestLoading(null);
      }
    }
  };
  const handleCreateSO = async (formData: SOFormData): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/marketing/so`;
    try {
      console.log('Submitting SO form data:', formData);
      setSubmitLoading(true);
      const res: AxiosResponse<APIResponse<SOData>> = await axios.post(
        url,
        formData,
        {
          withCredentials: true,
        },
      );

      if (res.data.succes) {
        console.log('SO created successfully:', res.data);
        setIsPopupOpen(false);
        fetchsoData();
        alert('Sales Order created successfully!');
      }
    } catch (error) {
      console.error('Error creating SO:', error);
      alert('Error creating Sales Order. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSort = (key: keyof SOData) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnKey: keyof SOData) => {
    if (sortConfig.key !== columnKey) {
      return <span className="ml-1 text-gray-400">⇅</span>;
    }
    return sortConfig.direction === 'asc' ? (
      <span className="ml-1">↑</span>
    ) : (
      <span className="ml-1">↓</span>
    );
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  // Apply sorting only (filtering is done by API)
  const getSortedData = () => {
    let sorted = [...soData];

    // Apply sorting
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

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedIOFilter('');
  };
  const handleViewDetail = (item: SOData) => {
    setSelectedSO(item);
    setIsDetailPopupOpen(true);
  };
  return (
    <div className="">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setIsPopupOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <span className="text-xl">+</span>
            <span>SO</span>
          </button>
          <button
            onClick={() => setIsDoneIOManualPopupOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <span>Done IO Manual</span>
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className=" mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <input
              type="text"
              placeholder="Search by No SO, Customer, Produk, or Status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Filter by Nomor IO
            </label>
            <SearchableSelect
              placeholder={kalkulasiLoading ? 'Loading...' : 'All IO'}
              value={selectedIOFilter}
              onChange={(value) => setSelectedIOFilter(String(value))}
              options={kalkulasiOptions}
            />
          </div>
        </div>
        {(searchTerm || selectedIOFilter) && (
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={handleClearFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Loading State */}
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
                    PRODUK
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
                      onClick={() => handleSort('po_qty')}
                      className="flex items-center hover:text-gray-700 focus:outline-none"
                    >
                      PO QTY
                      {getSortIcon('po_qty')}
                    </button>
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('total_harga')}
                      className="flex items-center hover:text-gray-700 focus:outline-none"
                    >
                      TOTAL HARGA
                      {getSortIcon('total_harga')}
                    </button>
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('tgl_input_po')}
                      className="flex items-center hover:text-gray-700 focus:outline-none"
                    >
                      TGL INPUT
                      {getSortIcon('tgl_input_po')}
                    </button>
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('tgl_input_po')}
                      className="flex items-center hover:text-gray-700 focus:outline-none"
                    >
                      STATUS WORK
                      {getSortIcon('status_work')}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-4 py-6 text-center text-gray-500 text-sm"
                    >
                      {searchTerm || selectedIOFilter
                        ? 'No SO found matching your filters'
                        : 'No SO data available'}
                    </td>
                  </tr>
                ) : (
                  sortedData.map((item, index) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                        {index + 1}
                      </td>

                      <td className="px-2 py-2 whitespace-nowrap text-xs font-medium">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => handleViewDetail(item)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs transition-colors"
                            title="View Details"
                          >
                            DETAIL
                          </button>
                          {item.status === 'draft' && (
                            <button
                              onClick={() => RequestKabag(item.id)}
                              className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs disabled:opacity-50"
                              disabled={requestLoading === item.id}
                            >
                              {requestLoading === item.id
                                ? 'Loading...'
                                : 'REQUEST'}
                            </button>
                          )}
                          {item.status === 'history' ||
                            (item.status_work !== 'done' && (
                              <button
                                onClick={() => handleDoneWork(item.id)}
                                className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs disabled:opacity-50"
                                disabled={doneWorkLoading === item.id}
                              >
                                {doneWorkLoading === item.id
                                  ? 'Processing...'
                                  : 'DONE WORK'}
                              </button>
                            ))}
                        </div>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <span
                          className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded font-medium"
                          title={item.no_so}
                        >
                          {item.no_so
                            ? item.no_so.substring(0, 12) +
                              (item.no_so.length > 12 ? '...' : '')
                            : '-'}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <span
                          className="bg-purple-100 text-purple-800 text-xs px-1.5 py-0.5 rounded font-medium"
                          title={item.no_io}
                        >
                          {item.no_io
                            ? item.no_io.substring(0, 10) +
                              (item.no_io.length > 10 ? '...' : '')
                            : '-'}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-xs text-gray-900 max-w-32">
                        <span title={item.customer}>
                          {item.customer
                            ? item.customer.substring(0, 15) +
                              (item.customer.length > 15 ? '...' : '')
                            : '-'}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-xs text-gray-900 max-w-32">
                        <span title={item.produk}>
                          {item.produk
                            ? item.produk.substring(0, 15) +
                              (item.produk.length > 15 ? '...' : '')
                            : '-'}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded font-medium uppercase ${
                            item.status === 'draft'
                              ? 'bg-yellow-100 text-yellow-800'
                              : item.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                          title={item.status}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                        {item.po_qty?.toLocaleString('id-ID') || '0'}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                        <span title={formatCurrency(item.total_harga)}>
                          {formatCurrency(item.total_harga)}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                        {formatDate(item.tgl_input_po)}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded font-medium uppercase ${
                            item.status_work === 'draft'
                              ? 'bg-yellow-100 text-yellow-800'
                              : item.status_work === 'done'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                          title={item.status_work}
                        >
                          {item.status_work || '-'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create SO Popup */}
      <SOCreatePopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onSubmit={handleCreateSO}
        loading={submitLoading}
      />
      <SODetailPopup
        isOpen={isDetailPopupOpen}
        onClose={() => {
          setIsDetailPopupOpen(false);
          setSelectedSO(null);
        }}
        data={selectedSO}
      />
      {/* Done IO Manual Popup */}
      <SODoneIOManualPopup
        isOpen={isDoneIOManualPopupOpen}
        onClose={() => setIsDoneIOManualPopupOpen(false)}
        onSuccess={() => {
          fetchsoData();
          fetchKalkulasiData();
        }}
      />
    </div>
  );
};

export default SOMarketing;
