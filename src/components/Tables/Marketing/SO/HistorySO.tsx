// HistorySO.tsx
import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import { APIResponse, SOData, KalkulasiData } from './types/SOTypes';
import SearchableSelect from '../../../../pages/MasterData/Marketing/SearchableSelect';
import SODetailPopup from './SODetailPopup';
import CancelPopup from './CancelPopup';

const HistorySO: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [soData, setsoData] = useState<SOData[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof SOData | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });
  const [isDetailPopupOpen, setIsDetailPopupOpen] = useState<boolean>(false);
  const [selectedSO, setSelectedSO] = useState<SOData | null>(null);
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
  const [isCancelPopupOpen, setIsCancelPopupOpen] = useState<boolean>(false);
  const [selectedSOForCancel, setSelectedSOForCancel] = useState<SOData | null>(
    null,
  );

  const handleCancelClick = (item: SOData) => {
    setSelectedSOForCancel(item);
    setIsCancelPopupOpen(true);
  };
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

  const fetchsoData = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/marketing/so`;
    try {
      setLoading(true);

      const res: AxiosResponse<APIResponse<SOData[]>> = await axios.get(url, {
        params: {
          status: 'history',
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
                          {item.status_proses === 'done' && (
                            <button
                              onClick={() => handleCancelClick(item)}
                              className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs transition-colors"
                              title="Cancel SO"
                            >
                              CANCEL
                            </button>
                          )}
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <SODetailPopup
        isOpen={isDetailPopupOpen}
        onClose={() => {
          setIsDetailPopupOpen(false);
          setSelectedSO(null);
        }}
        data={selectedSO}
      />
      <CancelPopup
        isOpen={isCancelPopupOpen}
        onClose={() => {
          setIsCancelPopupOpen(false);
          setSelectedSOForCancel(null);
        }}
        soData={selectedSOForCancel}
        onSuccess={fetchsoData}
      />
    </div>
  );
};

export default HistorySO;
