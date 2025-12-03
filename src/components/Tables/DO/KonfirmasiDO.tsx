import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import { Pagination, Stack } from '@mui/material';
import CreateDOPopup from './CreateDoPopup';

interface DOGroupItem {
  id: number;
  id_io: number;
  id_so: number;
  id_customer: number | null;
  id_produk: number | null;
  no_do: string;
  no_io: string;
  no_so: string;
  no_jo: string;
  no_po_customer: string;
  customer: string | null;
  produk: string | null;
  alamat: string;
  kota: string;
  is_tax: boolean;
  note: string | null;
  status: string;
  tgl_do: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DOGroupResponse {
  data: DOGroupItem[];
  status: number;
  success: boolean;
  total_page?: number;
}

interface DOItem {
  id: number;
  id_do_group: number | null;
  id_jo: number;
  id_io: number;
  id_so: number;
  id_customer: number;
  id_produk: number | null;
  no_jo: string;
  no_io: string;
  no_so: string;
  no_po_customer: string;
  customer: string | null;
  produk: string | null;
  po_qty: number;
  jumlah_qty: number | null;
  pack_1: number | null;
  pack_2: number | null;
  pack_3: number | null;
  isi_1: number | null;
  isi_2: number | null;
  isi_3: number | null;
  tgl_pengiriman: string;
  toleransi_pengiriman: number | null;
  note: string | null;
  status: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

const KonfirmasiDO: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [doGroupData, setDoGroupData] = useState<DOGroupItem[]>([]);
  const [selectedDOGroup, setSelectedDOGroup] = useState<DOGroupItem | null>(
    null,
  );
  const [selectedDOItems, setSelectedDOItems] = useState<DOItem[]>([]);
  const [showConfirmPopup, setShowConfirmPopup] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [limit, setLimit] = useState<number>(10);

  useEffect(() => {
    fetchDOGroupData();
  }, [page, searchTerm, limit]);

  const fetchDOGroupData = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/deliveryOrderGroup`;
    try {
      setLoading(true);

      const res: AxiosResponse<DOGroupResponse> = await axios.get(url, {
        params: {
          page: page,
          limit: limit,
          search: searchTerm,
        },
        withCredentials: true,
      });

      console.log('Fetched DO Group data:', res.data);

      setDoGroupData(res.data.data);
      setTotalPages(res.data.total_page || 1);
    } catch (error) {
      console.error('Error fetching DO Group data:', error);
      setDoGroupData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDOGroupDetails = async (doGroupId: number): Promise<void> => {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/deliveryOrderGroup/${doGroupId}`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      console.log('Fetched DO Group details:', res.data);

      // Map the response to match DOItem interface expected by CreateDOPopup
      const doItems: DOItem[] =
        res.data.data_do?.map((item: any) => ({
          id: item.id,
          id_do_group: item.id_do_group,
          id_jo: res.data.id_jo || 0,
          id_io: res.data.id_io,
          id_so: res.data.id_so,
          id_customer: res.data.id_customer,
          id_produk: item.id_produk,
          no_jo: res.data.no_jo,
          no_io: res.data.no_io,
          no_so: res.data.no_so,
          no_po_customer: res.data.no_po_customer,
          customer: res.data.customer || res.data.pelanggan,
          produk: item.produk,
          po_qty: item.po_qty || 0,
          jumlah_qty: item.jumlah_qty,
          pack_1: item.pack_1,
          pack_2: item.pack_2,
          pack_3: item.pack_3,
          isi_1: item.isi_1,
          isi_2: item.isi_2,
          isi_3: item.isi_3,
          tgl_pengiriman: res.data.tgl_do,
          toleransi_pengiriman: null,
          note: item.note,
          status: res.data.status,
          is_active: res.data.is_active,
          createdAt: res.data.createdAt,
          updatedAt: res.data.updatedAt,
        })) || [];

      setSelectedDOItems(doItems);
    } catch (error) {
      console.error('Error fetching DO Group details:', error);
      alert('Failed to fetch DO details');
    }
  };

  const handleKonfirmasi = async (doGroup: DOGroupItem) => {
    setSelectedDOGroup(doGroup);
    await fetchDOGroupDetails(doGroup.id);
    setShowConfirmPopup(true);
  };

  const handleClosePopup = () => {
    setShowConfirmPopup(false);
    setSelectedDOGroup(null);
    setSelectedDOItems([]);
  };

  const handleConfirmSuccess = () => {
    fetchDOGroupData();
    setSelectedDOGroup(null);
    setSelectedDOItems([]);
  };

  const handleLimitChange = (newLimit: number): void => {
    setLimit(newLimit);
    setPage(1);
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: string } = {
      done: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      progress: 'bg-blue-100 text-blue-800',
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
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          {/* Search */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by DO, JO, IO, SO, Customer..."
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
                  No DO
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Tgl DO
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  No JO
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  No PO Customer
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Customer
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Kota
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Action
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
              ) : doGroupData.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-3 py-4 text-center text-gray-500 text-sm"
                  >
                    No data available for confirmation
                  </td>
                </tr>
              ) : (
                doGroupData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 font-medium">
                      {item.no_do || '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {formatDate(item.tgl_do)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {item.no_jo || '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {item.no_po_customer || '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {item.customer || '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {item.kota || '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs">
                      <button
                        onClick={() => handleKonfirmasi(item)}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-xs"
                      >
                        Konfirmasi
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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
        ) : doGroupData.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            No data available for confirmation
          </div>
        ) : (
          doGroupData.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="font-semibold text-sm text-gray-900">
                    {item.no_do || '-'}
                  </div>
                  <div className="text-xs text-gray-600 mt-0.5">
                    {item.customer || '-'}
                  </div>
                </div>
                <div>{getStatusBadge(item.status)}</div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-500 text-xs font-medium">
                      Tgl DO:
                    </span>
                    <div className="text-gray-900 text-xs">
                      {formatDate(item.tgl_do)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs font-medium">
                      Kota:
                    </span>
                    <div className="text-gray-900 text-xs">
                      {item.kota || '-'}
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-gray-500 text-xs font-medium">
                    No JO:
                  </span>
                  <div className="text-gray-900 text-xs">
                    {item.no_jo || '-'}
                  </div>
                </div>

                <div>
                  <span className="text-gray-500 text-xs font-medium">
                    No PO Customer:
                  </span>
                  <div className="text-gray-900 text-xs">
                    {item.no_po_customer || '-'}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handleKonfirmasi(item)}
                    className="w-full px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                  >
                    Konfirmasi
                  </button>
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

      {/* Confirmation Popup */}
      {showConfirmPopup && selectedDOGroup && (
        <CreateDOPopup
          selectedItems={selectedDOItems}
          doGroupId={selectedDOGroup.id}
          isConfirmationMode={true}
          onClose={handleClosePopup}
          onSuccess={handleConfirmSuccess}
        />
      )}
    </div>
  );
};

export default KonfirmasiDO;
