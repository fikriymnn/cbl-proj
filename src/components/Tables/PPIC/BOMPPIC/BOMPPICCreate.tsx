// BOMPPICCreate.tsx
import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import BOMPPICManagementModal from './BOMPPICManagementModal';
import { BOMPPICItem } from './Types/bompiic.types';

type SortDirection = 'asc' | 'desc';

const BOMPPICCreate: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [bomData, setBomData] = useState<BOMPPICItem[]>([]);
  const [sortKey, setSortKey] = useState<string>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showBOMModal, setShowBOMModal] = useState<boolean>(false);
  const [selectedBOM, setSelectedBOM] = useState<BOMPPICItem | null>(null);

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

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '-';
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  useEffect(() => {
    fetchBOMData();
  }, []);

  const fetchBOMData = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/ppic/bom`;
    try {
      setLoading(true);
      const res: AxiosResponse = await axios.get(url, {
        params: { is_bom_ppic_done: false },
        withCredentials: true,
      });
      console.log('Fetched BOM data:', res.data);

      const dataArray = res.data.data || res.data || [];
      setBomData(Array.isArray(dataArray) ? dataArray : []);
    } catch (error) {
      console.error('Error fetching BOM data:', error);
      setBomData([]);
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

  // Helper function to check if BOM PPIC exists - directly on item
  const hasBOMPPIC = (item: BOMPPICItem): boolean => {
    return (
      item.bom_ppic !== undefined &&
      item.bom_ppic !== null &&
      Array.isArray(item.bom_ppic) &&
      item.bom_ppic.length > 0
    );
  };

  // Helper function to get BOM PPIC status badge
  const getBOMPPICStatusBadge = (item: BOMPPICItem) => {
    if (hasBOMPPIC(item)) {
      return (
        <div className="flex flex-col gap-1">
          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 border border-green-200 font-medium">
            ✓ BOM PPIC Created
          </span>
          <span className="text-xs text-gray-600">
            {item.bom_ppic.length} items
          </span>
        </div>
      );
    }
    return (
      <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-800 border border-orange-200 font-medium">
        ⚠ No BOM PPIC
      </span>
    );
  };

  const handleManageBOMPPIC = (item: BOMPPICItem) => {
    console.log('Opening BOM PPIC Modal for:', item);
    setSelectedBOM(item);
    setShowBOMModal(true);
  };

  const sortedData = React.useMemo(() => {
    const sorted = [...bomData].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortKey === 'bom_ppic') {
        aValue = hasBOMPPIC(a) ? 1 : 0;
        bValue = hasBOMPPIC(b) ? 1 : 0;
      } else {
        aValue = a[sortKey as keyof BOMPPICItem];
        bValue = b[sortKey as keyof BOMPPICItem];
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
  }, [bomData, sortKey, sortDirection]);

  return (
    <div className="">
      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                  NO
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  ACTION
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
                    onClick={() => handleSort('status_jo')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    STATUS
                    {getSortIcon('status_jo')}
                  </button>
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('tgl_pembuatan_so')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    TGL BUAT
                    {getSortIcon('tgl_pembuatan_so')}
                  </button>
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('bom_ppic')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    BOM PPIC STATUS
                    {getSortIcon('bom_ppic')}
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
                  <td colSpan={10} className="px-4 py-6 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : sortedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-6 text-center text-gray-500 text-sm"
                  >
                    No BOM data available
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
                          onClick={() => handleManageBOMPPIC(item)}
                          className={`${
                            hasBOMPPIC(item)
                              ? 'bg-blue-500 hover:bg-blue-600'
                              : 'bg-green-500 hover:bg-green-600'
                          } text-white px-3 py-1 rounded text-xs transition-colors`}
                          title={
                            hasBOMPPIC(item)
                              ? 'Edit BOM PPIC'
                              : 'Create BOM PPIC'
                          }
                        >
                          {hasBOMPPIC(item) ? 'EDIT' : 'CREATE'}
                        </button>
                      </div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      <span
                        className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded font-medium"
                        title={item.no_so}
                      >
                        {item.no_so ? truncateText(item.no_so, 12) : '-'}
                      </span>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      <span
                        className="bg-purple-100 text-purple-800 text-xs px-1.5 py-0.5 rounded font-medium"
                        title={item.no_io}
                      >
                        {item.no_io ? truncateText(item.no_io, 12) : '-'}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-xs text-gray-900 max-w-32">
                      <span title={item.customer}>
                        {truncateText(item.customer, 15)}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-xs text-gray-900 max-w-40">
                      <span title={item.produk}>
                        {truncateText(item.produk, 20)}
                      </span>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      {item.status_bom ? (
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded font-medium ${getStatusColor(
                            item.status_bom,
                          )}`}
                          title={item.status_bom}
                        >
                          {truncateText(item.status_bom, 8)}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                      <span title={item.tgl_pembuatan_bom}>
                        {formatDate(item.tgl_pembuatan_bom)}
                      </span>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      {getBOMPPICStatusBadge(item)}
                    </td>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* BOM PPIC Management Modal - Simple condition */}
      {showBOMModal && selectedBOM && (
        <BOMPPICManagementModal
          bomId={selectedBOM.id}
          onClose={() => {
            setShowBOMModal(false);
            setSelectedBOM(null);
          }}
          onSuccess={() => {
            fetchBOMData();
            setShowBOMModal(false);
            setSelectedBOM(null);
          }}
        />
      )}
    </div>
  );
};

export default BOMPPICCreate;
