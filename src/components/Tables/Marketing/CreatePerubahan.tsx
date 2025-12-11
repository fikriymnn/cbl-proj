import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import { Pagination, Stack } from '@mui/material';
import PerubahanModal from './PerubahanModal';

interface InvoiceItem {
  id: number;
  no_invoice: string;
  no_do: string;
  no_po: string;
  nama_customer: string;
  alamat: string;
  tgl_faktur: string;
  tgl_po: string;
  tgl_kirim: string;
  tgl_jatuh_tempo: string;
  waktu_jatuh_tempo: string;
  sub_total: number;
  diskon: number;
  dpp: number;
  ppn: number;
  total: number;
  dp: number;
  balance_due: number | null;
  is_show_dpp: boolean;
  note: string;
  status: string;
  status_payment: string;
  status_proses: string;
  id_customer: number;
  id_create: number;
  id_approve: number | null;
  id_reject: number | null;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  invoice_produk?: InvoiceProduct[];
}

interface InvoiceProduct {
  id: number;
  id_invoice: number;
  id_produk: number;
  nama_produk: string;
  kode_produk: string;
  qty: number;
  unit: string;
  harga: number;
  dpp: number;
  total: number;
  pajak: number;
  diskon_produk: number;
}

interface InvoiceResponse {
  data: InvoiceItem[];
  status: number;
  success: boolean;
  total_page?: number;
}

export interface PerubahanProduct {
  id_invoice_produk: number;
  id_produk: number;
  nama_produk: string;
  qty: number;
  harga: number;
  new_qty: number;
  new_harga: number;
}

export interface PerubahanFormData {
  id_invoice: number;
  id_customer: number;
  nama_customer: string;
  no_perubahan_invoice: string;
  no_po: string;
  no_invoice: string;
  tgl_invoice: string;
  alamat: string;
  tgl_faktur: string;
  new_alamat: string;
  new_tgl_faktur: string;
  note: string;
  file: string;
  perubahan_invoice_produk: PerubahanProduct[];
}

const CreatePerubahan: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [invoiceData, setInvoiceData] = useState<InvoiceItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [limit, setLimit] = useState<number>(10);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isPerubahanModalOpen, setIsPerubahanModalOpen] =
    useState<boolean>(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(
    null,
  );
  const [selectedInvoiceForPerubahan, setSelectedInvoiceForPerubahan] =
    useState<InvoiceItem | null>(null);
  const [perubahanFormData, setPerubahanFormData] =
    useState<PerubahanFormData | null>(null);

  useEffect(() => {
    fetchInvoiceData();
  }, [page, searchTerm, limit]);

  const fetchInvoiceData = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/invoice`;
    try {
      setLoading(true);
      const res: AxiosResponse<InvoiceResponse> = await axios.get(url, {
        params: {
          page: page,
          limit: limit,
          search: searchTerm,
        },
        withCredentials: true,
      });

      setInvoiceData(res.data.data || []);
      setTotalPages(res.data.total_page || 1);
    } catch (error) {
      console.error('Error fetching Invoice data:', error);
      setInvoiceData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLimitChange = (newLimit: number): void => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleViewDetail = (id: number): void => {
    setSelectedInvoiceId(id);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = (): void => {
    setIsDetailModalOpen(false);
    setSelectedInvoiceId(null);
  };

  const handlePerubahan = async (invoice: InvoiceItem): Promise<void> => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_LINK}/invoice/${invoice.id}`,
        { withCredentials: true },
      );

      if (res.data.success) {
        const invoiceDetail = res.data.data;

        const nomorRes = await axios.get(
          `${import.meta.env.VITE_API_LINK}/perubahanInvoiceNomor`,
          { withCredentials: true },
        );
        const nomorPerubahan = nomorRes.data.new_no_perubahan_invoice || '';

        const formData: PerubahanFormData = {
          id_invoice: invoiceDetail.id,
          id_customer: invoiceDetail.id_customer,
          nama_customer: invoiceDetail.nama_customer,
          no_perubahan_invoice: nomorPerubahan,
          no_po: invoiceDetail.no_po || '',
          no_invoice: invoiceDetail.no_invoice,
          tgl_invoice: invoiceDetail.tgl_faktur,
          alamat: invoiceDetail.alamat,
          tgl_faktur: invoiceDetail.tgl_faktur,
          new_alamat: invoiceDetail.alamat,
          new_tgl_faktur: invoiceDetail.tgl_faktur,
          note: '',
          file: '',
          perubahan_invoice_produk: (invoiceDetail.invoice_produk || []).map(
            (prod: InvoiceProduct) => ({
              id_invoice_produk: prod.id,
              id_produk: prod.id_produk,
              nama_produk: prod.nama_produk,
              qty: prod.qty,
              harga: prod.harga,
              new_qty: prod.qty,
              new_harga: prod.harga,
            }),
          ),
        };

        setPerubahanFormData(formData);
        setSelectedInvoiceForPerubahan(invoiceDetail);
        setIsPerubahanModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching invoice details for perubahan:', error);
      alert('Failed to load invoice details. Please try again.');
    }
  };

  const handleClosePerubahanModal = (): void => {
    setIsPerubahanModalOpen(false);
    setSelectedInvoiceForPerubahan(null);
    setPerubahanFormData(null);
  };

  const handleSubmitPerubahan = async (
    formData: PerubahanFormData,
  ): Promise<void> => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_LINK}/perubahanInvoice`,
        formData,
        { withCredentials: true },
      );

      if (res.data.success) {
        alert('Perubahan invoice berhasil dibuat!');
        handleClosePerubahanModal();
        fetchInvoiceData();
      }
    } catch (error) {
      console.error('Error creating perubahan invoice:', error);
      alert('Gagal membuat perubahan invoice. Silakan coba lagi.');
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}/${month}/${year}`;
  };

  const formatCurrency = (num: number | null | undefined): string => {
    if (num === null || num === undefined) return 'Rp 0';
    return `Rp ${num.toLocaleString('id-ID')}`;
  };

  const truncateText = (text: string | null, maxLength: number) => {
    if (!text) return '-';
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: string } = {
      draft: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      requested: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          statusColors[status.toLowerCase()] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {status.toUpperCase()}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusColors: { [key: string]: string } = {
      'belum lunas': 'bg-red-100 text-red-800',
      lunas: 'bg-green-100 text-green-800',
      'sebagian lunas': 'bg-yellow-100 text-yellow-800',
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          statusColors[status.toLowerCase()] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {status.toUpperCase().replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="">
      {/* Header Section */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by Invoice, DO, PO, Customer..."
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
                  No Invoice
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  No DO
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  No PO
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Customer
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Tgl Faktur
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Total
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Status Payment
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Status
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-3 py-4 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : invoiceData.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-3 py-4 text-center text-gray-500 text-sm"
                  >
                    No data available
                  </td>
                </tr>
              ) : (
                invoiceData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 font-medium">
                      {item.no_invoice || '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {item.no_do || '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {item.no_po || '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {truncateText(item.nama_customer, 20)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {formatDate(item.tgl_faktur)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 font-semibold">
                      {formatCurrency(item.total)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs">
                      {getPaymentStatusBadge(item.status_payment)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs">
                      <div className="flex items-center justify-center gap-2">
                        {item.status === 'approved' && (
                          <button
                            onClick={() => handlePerubahan(item)}
                            className="px-3 py-1.5 bg-orange-600 text-white text-xs font-medium rounded hover:bg-orange-700 transition-colors"
                          >
                            Perubahan
                          </button>
                        )}
                        <button
                          onClick={() => handleViewDetail(item.id)}
                          className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
                        >
                          Detail
                        </button>
                      </div>
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
        ) : invoiceData.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            No data available
          </div>
        ) : (
          invoiceData.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="font-semibold text-sm text-gray-900">
                    {item.no_invoice || '-'}
                  </div>
                  <div className="text-xs text-gray-600 mt-0.5">
                    {item.nama_customer || '-'}
                  </div>
                </div>
                <div className="ml-2">{getStatusBadge(item.status)}</div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-500 text-xs font-medium">
                      No DO:
                    </span>
                    <div className="text-gray-900 text-xs">{item.no_do}</div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs font-medium">
                      No PO:
                    </span>
                    <div className="text-gray-900 text-xs">{item.no_po}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-500 text-xs font-medium">
                      Tgl Faktur:
                    </span>
                    <div className="text-gray-900 text-xs">
                      {formatDate(item.tgl_faktur)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs font-medium">
                      Total:
                    </span>
                    <div className="text-gray-900 text-xs font-semibold">
                      {formatCurrency(item.total)}
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-gray-500 text-xs font-medium">
                    Status Payment:
                  </span>
                  <div className="mt-1">
                    {getPaymentStatusBadge(item.status_payment)}
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-gray-200">
                  {item.status === 'approved' && (
                    <button
                      onClick={() => handlePerubahan(item)}
                      className="flex-1 px-3 py-2 bg-orange-600 text-white text-xs font-medium rounded hover:bg-orange-700 transition-colors"
                    >
                      Perubahan
                    </button>
                  )}

                  <button
                    onClick={() => handleViewDetail(item.id)}
                    className={`${
                      item.status === 'approved' ? 'flex-1' : 'w-full'
                    } px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors`}
                  >
                    Detail
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
              onChange={(e, i) => setPage(i)}
              size="small"
            />
          </Stack>
        </div>
      </div>

      {/* Perubahan Modal */}
      {isPerubahanModalOpen && perubahanFormData && (
        <PerubahanModal
          isOpen={isPerubahanModalOpen}
          formData={perubahanFormData}
          onClose={handleClosePerubahanModal}
          onSubmit={handleSubmitPerubahan}
          onFormChange={setPerubahanFormData}
        />
      )}
    </div>
  );
};

export default CreatePerubahan;
