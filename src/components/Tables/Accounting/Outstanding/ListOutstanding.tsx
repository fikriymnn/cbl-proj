import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import { Pagination, Stack } from '@mui/material';
import CreateInvoiceModal from './CreateInvoiceModal';

interface DOItem {
  no_do: string;
  so: any;
  id: number;
  id_do_group: number | null;
  id_io: number;
  id_jo: number;
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
  delivery_order: DeliveryOrder[];
  detail_customer: DetailCustomer;
}

interface DOResponse {
  data: DOItem[];
  status: number;
  success: boolean;
  total_page?: number;
}

interface DeliveryOrder {
  id: number;
  id_do_group: number;
  id_customer: number;
  id_produk: number;
  id_so: number;
  no_jo: string;
  no_io: string;
  no_so: string;
  no_po_customer: string;
  customer: string;
  produk: string;
  jumlah_qty: number;
  tgl_pengiriman: string;
  status: string;
}

interface SO {
  harga_jual: number;
  ppn: string;
  tgl_po_customer: string;
  no_po_customer: string;
}

interface DetailCustomer {
  nama_customer: string;
  alamat_kantor: string;
  top_faktur: string;
}

type StatusFilter = 'done' | 'progress';

const ListOutstanding: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [doData, setDoData] = useState<DOItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<DOItem[]>([]);
  const [selectedDOItems, setSelectedDOItems] = useState<DOItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [limit, setLimit] = useState<number>(10);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedDOGroups, setSelectedDOGroups] = useState<number[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('progress');

  useEffect(() => {
    fetchDOData();
  }, [page, searchTerm, limit, statusFilter]);

  const fetchDOData = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/deliveryOrderGroup`;
    try {
      setLoading(true);

      const res: AxiosResponse<DOResponse> = await axios.get(url, {
        params: {
          page: page,
          limit: limit,
          search: searchTerm,
          // status: statusFilter,
        },
        withCredentials: true,
      });

      console.log('Fetched DO data:', res.data);

      setDoData(res.data.data || []);
      setTotalPages(res.data.total_page || 1);
    } catch (error) {
      console.error('Error fetching DO data:', error);
      setDoData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilterChange = (newStatus: StatusFilter): void => {
    setStatusFilter(newStatus);
    setPage(1);
    setSelectedItems([]);
    setSelectedDOItems([]);
    setSelectedCustomerId(null);
    setSelectedDOGroups([]);
  };

  const handleLimitChange = (newLimit: number): void => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleCheckboxChange = (item: DOItem) => {
    const isSelected = selectedItems.some(
      (selected) => selected.id === item.id,
    );

    if (isSelected) {
      const newSelected = selectedItems.filter(
        (selected) => selected.id !== item.id,
      );
      setSelectedItems(newSelected);
      setSelectedDOItems(newSelected);

      if (item.id_do_group) {
        setSelectedDOGroups((prev) =>
          prev.filter((id) => id !== item.id_do_group),
        );
      }

      if (newSelected.length === 0) {
        setSelectedCustomerId(null);
      }
    } else {
      if (selectedCustomerId === null) {
        setSelectedCustomerId(item.id_customer);
        setSelectedItems([item]);
        setSelectedDOItems([item]);
        if (item.id_do_group) {
          setSelectedDOGroups([item.id_do_group]);
        }
      } else if (selectedCustomerId === item.id_customer) {
        const newSelected = [...selectedItems, item];
        setSelectedItems(newSelected);
        setSelectedDOItems(newSelected);
        if (item.id_do_group && !selectedDOGroups.includes(item.id_do_group)) {
          setSelectedDOGroups([...selectedDOGroups, item.id_do_group]);
        }
      } else {
        alert(
          `You can only select items from the same customer. Currently selected customer ID: ${selectedCustomerId}`,
        );
      }
    }
  };

  const handleCreateInvoice = () => {
    if (selectedItems.length === 0) {
      alert('Please select at least one delivery order');
      return;
    }

    console.log('Opening modal with selected items:', selectedItems);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleInvoiceCreated = () => {
    setSelectedItems([]);
    setSelectedDOItems([]);
    setSelectedCustomerId(null);
    setSelectedDOGroups([]);
    setIsModalOpen(false);
    fetchDOData();
  };

  const truncateText = (text: string | null, maxLength: number) => {
    if (!text) return '-';
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  const formatDate = (dateString: string): string => {
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
      progress: 'bg-blue-100 text-blue-800',
      invoiced: 'bg-purple-100 text-purple-800',
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

  const isInvoicedFilter = statusFilter === 'done';

  return (
    <div className="">
      {/* Header Section */}
      <div className="mb-4 sm:mb-6">
        {/* Status Filter Tabs */}
        <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => handleStatusFilterChange('progress')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              statusFilter === 'progress'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Progress
          </button>
          <button
            onClick={() => handleStatusFilterChange('done')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              statusFilter === 'done'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Done
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          {/* Search */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by JO, IO, SO, PO Customer..."
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

          {/* Create Invoice Button — hidden on Invoiced tab */}
          {!isInvoicedFilter && selectedItems.length > 0 && (
            <button
              onClick={handleCreateInvoice}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create Invoice
            </button>
          )}
        </div>

        {selectedItems.length > 0 && (
          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm">
            {selectedItems.length} item(s) selected from Customer ID:{' '}
            {selectedCustomerId}
          </div>
        )}

        {isInvoicedFilter && (
          <div className="bg-gray-50 text-gray-500 px-4 py-2 rounded-lg text-sm border border-gray-200">
            Items with{' '}
            <span className="font-medium text-purple-700">Invoiced</span> status
            cannot be used to create an Invoice.
          </div>
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {/* Hide checkbox column on Invoiced tab */}
                {!isInvoicedFilter && (
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                      checked={false}
                      disabled
                    />
                  </th>
                )}
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  No DO
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  No IO
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  No SO
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  No PO Customer
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Customer
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Produk
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  PO Qty
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Tgl Pengiriman
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={isInvoicedFilter ? 8 : 9}
                    className="px-3 py-4 text-center"
                  >
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : doData.length === 0 ? (
                <tr>
                  <td
                    colSpan={isInvoicedFilter ? 8 : 9}
                    className="px-3 py-4 text-center text-gray-500 text-sm"
                  >
                    No data available
                  </td>
                </tr>
              ) : (
                doData.map((item) => {
                  const isSelected = selectedItems.some(
                    (selected) => selected.id === item.id,
                  );
                  const isDisabled =
                    selectedCustomerId !== null &&
                    selectedCustomerId !== item.id_customer;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-gray-50 ${
                        isDisabled ? 'opacity-50' : ''
                      }`}
                    >
                      {!isInvoicedFilter && (
                        <td className="px-3 py-2 whitespace-nowrap text-xs">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleCheckboxChange(item)}
                            disabled={isDisabled}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded disabled:cursor-not-allowed"
                          />
                        </td>
                      )}
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                        {item.no_do || '-'}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                        {item.no_io || '-'}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                        {item.no_so || '-'}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                        {item.no_po_customer || '-'}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                        {truncateText(item.customer, 60)}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-900 max-w-xs">
                        {truncateText(item.produk, 90)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                        {formatNumber(item.so.po_qty)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                        {formatDate(item.so.tgl_pengiriman)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs">
                        {getStatusBadge(item.status)}
                      </td>
                    </tr>
                  );
                })
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
                onChange={(e, i) => setPage(i)}
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
        ) : doData.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            No data available
          </div>
        ) : (
          doData.map((item) => {
            const isSelected = selectedItems.some(
              (selected) => selected.id === item.id,
            );
            const isDisabled =
              selectedCustomerId !== null &&
              selectedCustomerId !== item.id_customer;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-lg shadow p-4 ${
                  isDisabled ? 'opacity-50' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    {/* Hide checkbox on Invoiced tab */}
                    {!isInvoicedFilter && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleCheckboxChange(item)}
                        disabled={isDisabled}
                        className="w-4 h-4 mt-1 text-blue-600 border-gray-300 rounded disabled:cursor-not-allowed"
                      />
                    )}
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-gray-900">
                        {item.no_jo || '-'}
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5">
                        {item.customer || '-'}
                      </div>
                    </div>
                  </div>
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
                      No PO Customer:
                    </span>
                    <div className="text-gray-900 text-xs">
                      {item.no_po_customer || '-'}
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-500 text-xs font-medium">
                      Produk:
                    </span>
                    <div className="text-gray-900 text-xs">
                      {item.produk || '-'}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-gray-500 text-xs font-medium">
                        PO Qty:
                      </span>
                      <div className="text-gray-900 text-xs">
                        {formatNumber(item.so.po_qty)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs font-medium">
                        Tgl Pengiriman:
                      </span>
                      <div className="text-gray-900 text-xs">
                        {formatDate(item.tgl_pengiriman)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-500 text-xs font-medium">
                      Status:
                    </span>
                    <div className="mt-1">{getStatusBadge(item.status)}</div>
                  </div>
                </div>
              </div>
            );
          })
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
              onChange={(e, i) => setPage(i)}
              size="small"
            />
          </Stack>
        </div>
      </div>

      {/* Invoice Modal */}
      {isModalOpen && (
        <CreateInvoiceModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          selectedDOGroups={selectedDOGroups}
          selectedDOItems={selectedItems}
          customerId={selectedCustomerId!}
          onInvoiceCreated={handleInvoiceCreated}
        />
      )}
    </div>
  );
};

export default ListOutstanding;
