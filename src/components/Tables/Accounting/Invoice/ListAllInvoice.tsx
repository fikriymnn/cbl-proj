import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import { Pagination, Stack } from '@mui/material';
import DetailInvoiceModal, { InvoiceDetail } from './DetailInvoiceModal';
import CreateReturModal from './CreateReturModal';

// ─── Types ────────────────────────────────────────────────────────────────────

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

/** Full invoice (GET /invoice/:id) — still used by CreateReturModal */
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

interface RecapItem {
  waktu: string;
  total_invoice: number;
  total_harus_dibayar: string | number;
}

interface InvoiceResponse {
  data: InvoiceDetail[];
  data_rekap_tenggat?: RecapItem[];
  status: number;
  success: boolean;
  total_page?: number;
  total_data?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function recapCardTheme(waktu: string) {
  const w = waktu.toLowerCase();
  if (w === 'lewat jatuh tempo')
    return {
      border: 'border-red-200',
      borderActive: 'border-red-500 ring-2 ring-red-200',
      bg: 'bg-red-50',
      text: 'text-red-700',
      chip: 'bg-red-100 text-red-700',
    };
  if (w === 'jatuh tempo hari ini')
    return {
      border: 'border-orange-200',
      borderActive: 'border-orange-500 ring-2 ring-orange-200',
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      chip: 'bg-orange-100 text-orange-700',
    };
  if (w.startsWith('1-30'))
    return {
      border: 'border-amber-200',
      borderActive: 'border-amber-500 ring-2 ring-amber-200',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      chip: 'bg-amber-100 text-amber-700',
    };
  if (w.startsWith('31-60'))
    return {
      border: 'border-blue-200',
      borderActive: 'border-blue-500 ring-2 ring-blue-200',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      chip: 'bg-blue-100 text-blue-700',
    };
  if (w.startsWith('61-90'))
    return {
      border: 'border-indigo-200',
      borderActive: 'border-indigo-500 ring-2 ring-indigo-200',
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      chip: 'bg-indigo-100 text-indigo-700',
    };
  if (w.startsWith('lebih dari 90'))
    return {
      border: 'border-green-200',
      borderActive: 'border-green-500 ring-2 ring-green-200',
      bg: 'bg-green-50',
      text: 'text-green-700',
      chip: 'bg-green-100 text-green-700',
    };
  return {
    border: 'border-gray-200',
    borderActive: 'border-gray-500 ring-2 ring-gray-200',
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    chip: 'bg-gray-100 text-gray-600',
  };
}

const formatCurrency = (num: number | string | null | undefined): string => {
  const n = Number(num ?? 0);
  return `Rp ${(isNaN(n) ? 0 : n).toLocaleString('id-ID')}`;
};

// ─── Recap Cards ──────────────────────────────────────────────────────────────

function TenggatRecapCards({
  recapData,
  activeWaktu,
  onCardClick,
}: {
  recapData: RecapItem[];
  activeWaktu: string | null;
  onCardClick: (waktu: string) => void;
}) {
  const visibleCards = recapData.filter(
    (r) => r.total_invoice > 0 || r.waktu === activeWaktu,
  );

  if (visibleCards.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2 px-1">
        <h3 className="text-sm font-bold text-gray-700">
          Rekap Tenggat Invoice
        </h3>
        {activeWaktu && (
          <button
            onClick={() => onCardClick(activeWaktu)}
            className="text-[11px] font-semibold text-blue-600 hover:text-blue-800"
          >
            ✕ Hapus Filter
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {visibleCards.map((item) => {
          const theme = recapCardTheme(item.waktu);
          const isActive = activeWaktu === item.waktu;
          return (
            <button
              key={item.waktu}
              onClick={() => onCardClick(item.waktu)}
              className={`text-left rounded-xl border-2 p-3 transition-all ${
                theme.bg
              } ${
                isActive ? theme.borderActive : theme.border
              } hover:shadow-md`}
            >
              <span
                className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 capitalize ${theme.chip}`}
              >
                {item.waktu}
              </span>
              <p className={`text-xl font-bold ${theme.text}`}>
                {item.total_invoice.toLocaleString('id-ID')}{' '}
                <span className="text-xs font-medium text-gray-500">
                  invoice
                </span>
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Total:{' '}
                <span className="font-semibold text-gray-700">
                  {formatCurrency(item.total_harus_dibayar)}
                </span>
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const ListAllInvoice: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [invoiceData, setInvoiceData] = useState<InvoiceDetail[]>([]);
  const [recapData, setRecapData] = useState<RecapItem[]>([]);
  const [activeWaktu, setActiveWaktu] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [limit, setLimit] = useState<number>(10);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isReturModalOpen, setIsReturModalOpen] = useState<boolean>(false);
  // The whole row is passed to the modal — no GET by id
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDetail | null>(
    null,
  );
  const [selectedInvoiceForRetur, setSelectedInvoiceForRetur] =
    useState<InvoiceItem | null>(null);

  useEffect(() => {
    fetchInvoiceData();
    // eslint-disable-next-line
  }, [page, searchTerm, limit, activeWaktu]);

  const fetchInvoiceData = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/invoice`;
    try {
      setLoading(true);

      // No status filter here: this list shows every invoice
      const res: AxiosResponse<InvoiceResponse> = await axios.get(url, {
        params: {
          page,
          limit,
          search: searchTerm || undefined,
          waktu: activeWaktu ?? undefined,
        },
        withCredentials: true,
      });

      console.log('Fetched Invoice data:', res.data);

      setInvoiceData(res.data.data || []);
      setTotalPages(res.data.total_page || 1);

      // Keep the cards stable while a card filter is active
      if (!activeWaktu && Array.isArray(res.data.data_rekap_tenggat)) {
        setRecapData(res.data.data_rekap_tenggat);
      }
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

  const handleRecapCardClick = (waktu: string): void => {
    setActiveWaktu((prev) => (prev === waktu ? null : waktu));
    setPage(1);
  };

  const handleViewDetail = (item: InvoiceDetail): void => {
    setSelectedInvoice(item);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = (): void => {
    setIsDetailModalOpen(false);
    setSelectedInvoice(null);
  };

  // Retur still needs the full invoice incl. products, so it fetches by id
  const handleRetur = async (invoice: InvoiceDetail): Promise<void> => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_LINK}/invoice/${invoice.id}`,
        { withCredentials: true },
      );

      if (res.data.success) {
        setSelectedInvoiceForRetur(res.data.data);
        setIsReturModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching invoice details for retur:', error);
      alert('Failed to load invoice details. Please try again.');
    }
  };

  const handleCloseReturModal = (): void => {
    setIsReturModalOpen(false);
    setSelectedInvoiceForRetur(null);
  };

  const handleReturCreated = (): void => {
    handleCloseReturModal();
    fetchInvoiceData();
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
    return `${day}/${month}/${year}`;
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

  const getDueBadge = (item: InvoiceDetail) => {
    if (!item.due_description && !item.waktu) return '-';
    const theme = recapCardTheme(item.waktu ?? '');
    return (
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-gray-900">
          {item.due_description || '-'}
        </span>
        {item.waktu && (
          <span
            className={`inline-block w-fit text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${theme.chip}`}
          >
            {item.waktu}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="">
      {/* Recap cards */}
      <TenggatRecapCards
        recapData={recapData}
        activeWaktu={activeWaktu}
        onCardClick={handleRecapCardClick}
      />

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

        {activeWaktu && (
          <div className="inline-flex items-center gap-2 text-xs bg-blue-50 border border-blue-200 text-blue-700 rounded-full px-3 py-1.5">
            <span>
              Filter aktif: <strong>{activeWaktu}</strong>
            </span>
            <button
              onClick={() => {
                setActiveWaktu(null);
                setPage(1);
              }}
              className="text-blue-500 hover:text-blue-800"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  'No Invoice',
                  'No DO',
                  'No PO',
                  'Customer',
                  'Tgl Faktur',
                  'Jatuh Tempo',
                  'Total',
                  'Status Payment',
                  'Status',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-3 py-4 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : invoiceData.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
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
                    <td className="px-3 py-2 whitespace-nowrap text-xs">
                      {getDueBadge(item)}
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
                            onClick={() => handleRetur(item)}
                            className="px-3 py-1.5 bg-orange-600 text-white text-xs font-medium rounded hover:bg-orange-700 transition-colors"
                          >
                            Retur
                          </button>
                        )}
                        <button
                          onClick={() => handleViewDetail(item)}
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

          <Stack spacing={2}>
            <Pagination
              count={totalPages}
              color="primary"
              page={page}
              onChange={(_e, i) => setPage(i)}
              size="small"
            />
          </Stack>
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

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-500 text-xs font-medium">
                      Jatuh Tempo:
                    </span>
                    <div className="mt-1">{getDueBadge(item)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs font-medium">
                      Status Payment:
                    </span>
                    <div className="mt-1">
                      {getPaymentStatusBadge(item.status_payment)}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-gray-200">
                  {item.status === 'approved' && (
                    <button
                      onClick={() => handleRetur(item)}
                      className="flex-1 px-3 py-2 bg-orange-600 text-white text-xs font-medium rounded hover:bg-orange-700 transition-colors"
                    >
                      Retur
                    </button>
                  )}
                  <button
                    onClick={() => handleViewDetail(item)}
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
              onChange={(_e, i) => setPage(i)}
              size="small"
            />
          </Stack>
        </div>
      </div>

      {/* Detail Modal — receives the row directly; editable only if draft */}
      {isDetailModalOpen && selectedInvoice && (
        <DetailInvoiceModal
          invoiceData={selectedInvoice}
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          onUpdated={fetchInvoiceData}
        />
      )}

      {/* Retur Modal */}
      {isReturModalOpen && selectedInvoiceForRetur && (
        <CreateReturModal
          isOpen={isReturModalOpen}
          onClose={handleCloseReturModal}
          invoiceData={selectedInvoiceForRetur}
          onReturCreated={handleReturCreated}
        />
      )}
    </div>
  );
};

export default ListAllInvoice;
