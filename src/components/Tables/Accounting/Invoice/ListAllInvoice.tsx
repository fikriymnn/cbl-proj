import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import { Pagination, Stack } from '@mui/material';
import DetailInvoiceModal, { InvoiceDetail } from './DetailInvoiceModal';
import CreateReturModal from './CreateReturModal';
import ListBuktiBayar from './ListBuktiBayar';
import SearchableSelect from '../../../../pages/MasterData/Marketing/SearchAbleSelectFront';
// Same searchable dropdown used in Master Data > Customer — adjust the path
// to wherever it actually lives relative to this file.

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

/** Option shape SearchableSelect expects */
interface CustomerOption {
  value: number;
  label: string;
}

interface AdditionalCost {
  id: number;
  invoice_payment_detail_id?: number;
  name: string;
  amount: string | number;
  note: string | null;
}

interface PaymentDetailItem {
  id: number;
  invoice_id: number;
  invoice_payment_id: number;
  /** Amount allocated from the payment to this invoice */
  payment_amount: string | number;
  additional_costs?: AdditionalCost[];
  payment?: {
    id: number;
    receipt_number: string;
    bank: string;
    account_number: string;
    payment_method: string;
    payment_date: string;
    payment_amount: string | number;
    payment_amount_use: string | number;
    status: string;
    note: string | null;
    payment_proof?: string | null;
  };
}

/**
 * Row returned by GET /invoice (list).
 * If InvoiceDetail already declares these fields with a different type,
 * remove the duplicates here.
 */
type InvoiceRow = InvoiceDetail & {
  tgl_pelunasan?: string | null;
  paid_amount?: string | number;
  outstanding_amount?: string | number;
  payment_details?: PaymentDetailItem[];
};

interface InvoiceResponse {
  data: InvoiceRow[];
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

const formatDateStr = (dateString?: string | null): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${day}/${month}/${year}`;
};

/** Day difference (to - from), ignoring time of day / timezone */
const toDayUTC = (s: string): number => {
  const d = new Date(s);
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
};
const diffDays = (from: string, to: string): number =>
  Math.round((toDayUTC(to) - toDayUTC(from)) / 86400000);

const hasPayments = (item: InvoiceRow): boolean =>
  Array.isArray(item.payment_details) && item.payment_details.length > 0;

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

// ─── Payment Detail Panel ─────────────────────────────────────────────────────

function PaymentDetailPanel({ item }: { item: InvoiceRow }) {
  const details = item.payment_details ?? [];

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-3">
      {/* Ringkasan pembayaran invoice */}
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs">
        <span className="text-gray-500">
          Terbayar:{' '}
          <b className="text-green-700">{formatCurrency(item.paid_amount)}</b>
        </span>
        <span className="text-gray-500">
          Sisa:{' '}
          <b className="text-red-700">
            {formatCurrency(item.outstanding_amount ?? item.balance_due)}
          </b>
        </span>
        <span className="text-gray-500">
          Tgl Pelunasan:{' '}
          <b className="text-gray-800">{formatDateStr(item.tgl_pelunasan)}</b>
        </span>
      </div>

      {/* Daftar pembayaran */}
      {details.map((pd) => (
        <div
          key={pd.id}
          className="bg-white border border-gray-200 rounded-md p-3"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="text-xs font-semibold text-gray-800">
              {pd.payment?.receipt_number || '-'}
              {pd.payment?.status && (
                <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] bg-green-100 text-green-800 uppercase">
                  {pd.payment.status}
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500">
              Dialokasikan ke invoice ini:{' '}
              <b className="text-gray-900">
                {formatCurrency(pd.payment_amount)}
              </b>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div>
              <div className="text-gray-500">Tgl Bayar</div>
              <div className="text-gray-900">
                {formatDateStr(pd.payment?.payment_date)}
              </div>
            </div>
            <div>
              <div className="text-gray-500">Metode</div>
              <div className="text-gray-900 capitalize">
                {pd.payment?.payment_method || '-'}
              </div>
            </div>
            <div>
              <div className="text-gray-500">Bank / No. Rekening</div>
              <div className="text-gray-900">
                {pd.payment?.bank || '-'} · {pd.payment?.account_number || '-'}
              </div>
            </div>
            <div>
              <div className="text-gray-500">Total Bukti Bayar</div>
              <div className="text-gray-900">
                {formatCurrency(pd.payment?.payment_amount)}
              </div>
            </div>
          </div>

          {pd.payment?.note && (
            <div className="mt-2 text-xs text-gray-600">
              Catatan: {pd.payment.note}
            </div>
          )}

          {pd.additional_costs && pd.additional_costs.length > 0 && (
            <div className="mt-2 border-t border-gray-100 pt-2">
              <div className="text-[11px] font-semibold text-gray-600 mb-1">
                Biaya Tambahan
              </div>
              {pd.additional_costs.map((c) => (
                <div
                  key={c.id}
                  className="flex justify-between text-xs text-gray-700"
                >
                  <span>
                    {c.name}
                    {c.note ? (
                      <span className="text-gray-400"> ({c.note})</span>
                    ) : null}
                  </span>
                  <span className="font-medium">
                    {formatCurrency(c.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Filter Chip ──────────────────────────────────────────────────────────────

function FilterChip({
  label,
  onClear,
}: {
  label: string;
  onClear: () => void;
}) {
  return (
    <div className="inline-flex items-center gap-2 text-xs bg-blue-50 border border-blue-200 text-blue-700 rounded-full px-3 py-1.5 capitalize">
      <span>{label}</span>
      <button onClick={onClear} className="text-blue-500 hover:text-blue-800">
        ✕
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const ListAllInvoice: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'invoice' | 'bukti'>('invoice');
  const [loading, setLoading] = useState<boolean>(true);
  const [invoiceData, setInvoiceData] = useState<InvoiceRow[]>([]);
  const [recapData, setRecapData] = useState<RecapItem[]>([]);
  const [activeWaktu, setActiveWaktu] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [limit, setLimit] = useState<number>(10);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isReturModalOpen, setIsReturModalOpen] = useState<boolean>(false);
  // The whole row is passed to the modal — no GET by id
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRow | null>(
    null,
  );
  const [selectedInvoiceForRetur, setSelectedInvoiceForRetur] =
    useState<InvoiceItem | null>(null);
  // Ids of rows whose payment detail is currently expanded
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  // ─── Extra filters (status, status_proses, status_payment, customer, date ranges) ──
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterStatusProses, setFilterStatusProses] = useState<string>('');
  const [filterStatusPayment, setFilterStatusPayment] = useState<string>('');
  // 0 = "Semua Customer" (same sentinel pattern used by SearchableSelect
  // elsewhere in the app, e.g. Master Data > Customer's Marketing select)
  const [filterIdCustomer, setFilterIdCustomer] = useState<number>(0);
  const [customerOptions, setCustomerOptions] = useState<CustomerOption[]>([]);
  const [filterStartDateFaktur, setFilterStartDateFaktur] =
    useState<string>('');
  const [filterEndDateFaktur, setFilterEndDateFaktur] = useState<string>('');
  const [filterStartDateJatuhTempo, setFilterStartDateJatuhTempo] =
    useState<string>('');
  const [filterEndDateJatuhTempo, setFilterEndDateJatuhTempo] =
    useState<string>('');

  const activeFilterCount = [
    filterStatus,
    filterStatusProses,
    filterStatusPayment,
    filterIdCustomer,
    filterStartDateFaktur,
    filterEndDateFaktur,
    filterStartDateJatuhTempo,
    filterEndDateJatuhTempo,
  ].filter(Boolean).length;

  const resetFilters = (): void => {
    setFilterStatus('');
    setFilterStatusProses('');
    setFilterStatusPayment('');
    setFilterIdCustomer(0);
    setFilterStartDateFaktur('');
    setFilterEndDateFaktur('');
    setFilterStartDateJatuhTempo('');
    setFilterEndDateJatuhTempo('');
    setPage(1);
  };

  // Customer list for the searchable dropdown — loaded once, same source as
  // Master Data > Customer (GET /master/marketing/customer)
  useEffect(() => {
    fetchCustomerOptions();
    // eslint-disable-next-line
  }, []);

  const fetchCustomerOptions = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/master/marketing/customer`;
    try {
      const res = await axios.get(url, {
        params: { page: 1, limit: 1000 },
        withCredentials: true,
      });
      const options: CustomerOption[] = (res.data?.data || []).map(
        (c: { id: number; nama_customer: string }) => ({
          value: c.id,
          label: c.nama_customer,
        }),
      );
      setCustomerOptions(options);
    } catch (error) {
      console.error('Error fetching customer list:', error);
    }
  };

  useEffect(() => {
    fetchInvoiceData();
    // eslint-disable-next-line
  }, [
    page,
    searchTerm,
    limit,
    activeWaktu,
    filterStatus,
    filterStatusProses,
    filterStatusPayment,
    filterIdCustomer,
    filterStartDateFaktur,
    filterEndDateFaktur,
    filterStartDateJatuhTempo,
    filterEndDateJatuhTempo,
  ]);

  const fetchInvoiceData = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/invoice`;
    try {
      setLoading(true);

      const res: AxiosResponse<InvoiceResponse> = await axios.get(url, {
        params: {
          page,
          limit,
          search: searchTerm || undefined,
          waktu: activeWaktu ?? undefined,
          status: filterStatus || undefined,
          status_proses: filterStatusProses || undefined,
          status_payment: filterStatusPayment || undefined,
          id_customer: filterIdCustomer || undefined,
          start_date_faktur: filterStartDateFaktur || undefined,
          end_date_faktur: filterEndDateFaktur || undefined,
          start_date_jatuh_tempo: filterStartDateJatuhTempo || undefined,
          end_date_jatuh_tempo: filterEndDateJatuhTempo || undefined,
        },
        withCredentials: true,
      });

      console.log('Fetched Invoice data:', res.data);

      setInvoiceData(res.data.data || []);
      setExpandedIds(new Set());
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

  const handleViewDetail = (item: InvoiceRow): void => {
    setSelectedInvoice(item);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = (): void => {
    setIsDetailModalOpen(false);
    setSelectedInvoice(null);
  };

  // Retur still needs the full invoice incl. products, so it fetches by id
  const handleRetur = async (invoice: InvoiceRow): Promise<void> => {
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

  // ─── Expand / collapse ──────────────────────────────────────────────────────

  const expandableIds = invoiceData.filter(hasPayments).map((i) => i.id);
  const allExpanded =
    expandableIds.length > 0 &&
    expandableIds.every((id) => expandedIds.has(id));

  const toggleExpand = (id: number): void => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleExpandAll = (): void => {
    setExpandedIds(allExpanded ? new Set() : new Set(expandableIds));
  };

  const renderExpandButton = (id: number) => (
    <button
      onClick={() => toggleExpand(id)}
      className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 text-gray-600"
      aria-label="Toggle detail payment"
      aria-expanded={expandedIds.has(id)}
    >
      <svg
        className={`w-4 h-4 transition-transform ${
          expandedIds.has(id) ? 'rotate-90' : ''
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </button>
  );

  // ─── Formatters / badges ────────────────────────────────────────────────────

  const truncateText = (text: string | null, maxLength: number) => {
    if (!text) return '-';
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  const formatDate = (dateString: string): string => formatDateStr(dateString);

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

  const getDueBadge = (item: InvoiceRow) => {
    const isPaid =
      item.status_payment?.toLowerCase() === 'lunas' && !!item.tgl_pelunasan;

    // Sudah lunas: hitung dari tgl faktur ke tgl pelunasan
    if (isPaid) {
      const paidAfter = diffDays(item.tgl_faktur, item.tgl_pelunasan as string);
      const lateDays = item.tgl_jatuh_tempo
        ? diffDays(item.tgl_jatuh_tempo, item.tgl_pelunasan as string)
        : 0;
      const isLate = lateDays > 0;

      return (
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-gray-900">
            Lunas {formatDate(item.tgl_pelunasan as string)} ({paidAfter} hari
            dari faktur)
          </span>
          <span
            className={`inline-block w-fit text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
              isLate ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}
          >
            {isLate ? `Telat bayar ${lateDays} hari` : 'Tepat waktu'}
          </span>
        </div>
      );
    }

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
      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-gray-200">
        {(
          [
            ['invoice', 'Daftar Invoice'],
            ['bukti', 'Bukti Bayar'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 text-sm font-semibold -mb-px border-b-2 transition-colors ${
              activeTab === key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'bukti' ? (
        <ListBuktiBayar />
      ) : (
        <>
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

              <button
                onClick={() => setIsFilterOpen((prev) => !prev)}
                className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  isFilterOpen || activeFilterCount > 0
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
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
                    d="M3 4h18M6 12h12M10 20h4"
                  />
                </svg>
                Filter
                {activeFilterCount > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-[11px] font-bold bg-blue-600 text-white rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* Filter panel */}
            {isFilterOpen && (
              <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Status
                    </label>
                    <select
                      value={filterStatus}
                      onChange={(e) => {
                        setFilterStatus(e.target.value);
                        setPage(1);
                      }}
                      className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Semua</option>
                      <option value="draft">Draft</option>
                      <option value="requested">Requested</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Status Proses
                    </label>
                    <select
                      value={filterStatusProses}
                      onChange={(e) => {
                        setFilterStatusProses(e.target.value);
                        setPage(1);
                      }}
                      className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Semua</option>
                      <option value="draft">Draft</option>
                      <option value="requested">Requested</option>
                      <option value="done">Done</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Status Payment
                    </label>
                    <select
                      value={filterStatusPayment}
                      onChange={(e) => {
                        setFilterStatusPayment(e.target.value);
                        setPage(1);
                      }}
                      className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Semua</option>
                      <option value="lunas">Lunas</option>
                      <option value="belum lunas">Belum Lunas</option>
                      <option value="sebagian lunas">Sebagian Lunas</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Waktu Jatuh Tempo
                    </label>
                    <select
                      value={activeWaktu ?? ''}
                      onChange={(e) => {
                        setActiveWaktu(e.target.value || null);
                        setPage(1);
                      }}
                      className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Semua</option>
                      {recapData.map((r) => (
                        <option key={r.waktu} value={r.waktu}>
                          {r.waktu}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Customer
                    </label>
                    <SearchableSelect
                      options={[
                        { value: 0, label: 'Semua Customer' },
                        ...customerOptions,
                      ]}
                      value={filterIdCustomer}
                      onChange={(value) => {
                        setFilterIdCustomer(Number(value));
                        setPage(1);
                      }}
                      placeholder="Cari customer..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Tgl Faktur Dari
                    </label>
                    <input
                      type="date"
                      value={filterStartDateFaktur}
                      onChange={(e) => {
                        setFilterStartDateFaktur(e.target.value);
                        setPage(1);
                      }}
                      className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Tgl Faktur Sampai
                    </label>
                    <input
                      type="date"
                      value={filterEndDateFaktur}
                      onChange={(e) => {
                        setFilterEndDateFaktur(e.target.value);
                        setPage(1);
                      }}
                      className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="hidden lg:block" />

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Jatuh Tempo Dari
                    </label>
                    <input
                      type="date"
                      value={filterStartDateJatuhTempo}
                      onChange={(e) => {
                        setFilterStartDateJatuhTempo(e.target.value);
                        setPage(1);
                      }}
                      className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Jatuh Tempo Sampai
                    </label>
                    <input
                      type="date"
                      value={filterEndDateJatuhTempo}
                      onChange={(e) => {
                        setFilterEndDateJatuhTempo(e.target.value);
                        setPage(1);
                      }}
                      className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
                  <button
                    onClick={resetFilters}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800"
                  >
                    Reset Filter
                  </button>
                </div>
              </div>
            )}

            {/* Active filter chips */}
            {(activeWaktu || activeFilterCount > 0) && (
              <div className="flex flex-wrap gap-2">
                {activeWaktu && (
                  <div className="inline-flex items-center gap-2 text-xs bg-blue-50 border border-blue-200 text-blue-700 rounded-full px-3 py-1.5">
                    <span>
                      Waktu: <strong>{activeWaktu}</strong>
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
                {filterStatus && (
                  <FilterChip
                    label={`Status: ${filterStatus}`}
                    onClear={() => {
                      setFilterStatus('');
                      setPage(1);
                    }}
                  />
                )}
                {filterStatusProses && (
                  <FilterChip
                    label={`Status Proses: ${filterStatusProses}`}
                    onClear={() => {
                      setFilterStatusProses('');
                      setPage(1);
                    }}
                  />
                )}
                {filterStatusPayment && (
                  <FilterChip
                    label={`Payment: ${filterStatusPayment}`}
                    onClear={() => {
                      setFilterStatusPayment('');
                      setPage(1);
                    }}
                  />
                )}
                {filterIdCustomer > 0 && (
                  <FilterChip
                    label={`Customer: ${
                      customerOptions.find((c) => c.value === filterIdCustomer)
                        ?.label ?? filterIdCustomer
                    }`}
                    onClear={() => {
                      setFilterIdCustomer(0);
                      setPage(1);
                    }}
                  />
                )}
                {(filterStartDateFaktur || filterEndDateFaktur) && (
                  <FilterChip
                    label={`Faktur: ${filterStartDateFaktur || '...'} s/d ${
                      filterEndDateFaktur || '...'
                    }`}
                    onClear={() => {
                      setFilterStartDateFaktur('');
                      setFilterEndDateFaktur('');
                      setPage(1);
                    }}
                  />
                )}
                {(filterStartDateJatuhTempo || filterEndDateJatuhTempo) && (
                  <FilterChip
                    label={`Jatuh Tempo: ${
                      filterStartDateJatuhTempo || '...'
                    } s/d ${filterEndDateJatuhTempo || '...'}`}
                    onClear={() => {
                      setFilterStartDateJatuhTempo('');
                      setFilterEndDateJatuhTempo('');
                      setPage(1);
                    }}
                  />
                )}
              </div>
            )}
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-2 text-left whitespace-nowrap">
                      {expandableIds.length > 0 && (
                        <button
                          onClick={toggleExpandAll}
                          title={allExpanded ? 'Tutup semua' : 'Buka semua'}
                          className="text-[10px] font-semibold text-blue-600 hover:text-blue-800"
                        >
                          {allExpanded ? '▾ Tutup semua' : '▸ Buka semua'}
                        </button>
                      )}
                    </th>
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
                      <td colSpan={11} className="px-3 py-4 text-center">
                        <div className="flex justify-center items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                      </td>
                    </tr>
                  ) : invoiceData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={11}
                        className="px-3 py-4 text-center text-gray-500 text-sm"
                      >
                        No data available
                      </td>
                    </tr>
                  ) : (
                    invoiceData.map((item) => (
                      <React.Fragment key={item.id}>
                        <tr className="hover:bg-gray-50">
                          <td className="px-2 py-2 w-8">
                            {hasPayments(item)
                              ? renderExpandButton(item.id)
                              : null}
                          </td>
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

                        {hasPayments(item) && expandedIds.has(item.id) && (
                          <tr className="bg-gray-50/50">
                            <td colSpan={11} className="px-4 py-3">
                              <PaymentDetailPanel item={item} />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
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
            {expandableIds.length > 0 && (
              <button
                onClick={toggleExpandAll}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                {allExpanded
                  ? '▾ Tutup semua detail payment'
                  : '▸ Buka semua detail payment'}
              </button>
            )}

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
                        <div className="text-gray-900 text-xs">
                          {item.no_do}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs font-medium">
                          No PO:
                        </span>
                        <div className="text-gray-900 text-xs">
                          {item.no_po}
                        </div>
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

                    {hasPayments(item) && (
                      <div className="pt-1">
                        <button
                          onClick={() => toggleExpand(item.id)}
                          className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                          aria-expanded={expandedIds.has(item.id)}
                        >
                          <span>{expandedIds.has(item.id) ? '▾' : '▸'}</span>
                          Detail Payment ({item.payment_details?.length})
                        </button>
                        {expandedIds.has(item.id) && (
                          <div className="mt-2">
                            <PaymentDetailPanel item={item} />
                          </div>
                        )}
                      </div>
                    )}
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
        </>
      )}
    </div>
  );
};

export default ListAllInvoice;
