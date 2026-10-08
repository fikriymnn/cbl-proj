import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import SearchableSelect from '../../../pages/MasterData/Marketing/SearchAbleSelectFront';
// Same searchable dropdown used in Master Data > Customer — adjust the path
// to wherever it actually lives relative to this file.
import DetailInvoiceModal, {
  InvoiceDetail,
} from '../Accounting/Invoice/DetailInvoiceModal';
// ─── Types ────────────────────────────────────────────────────────────────────

interface RekapSummary {
  total_customer: number;
  total_invoice: number;
  total_invoice_lunas: number;
  total_invoice_belum_lunas: number;
  total_rupiah: string;
  total_rupiah_lunas: string;
  total_rupiah_belum_lunas: string;
  total_invoice_dibayar_tepat_waktu: number;
  total_invoice_dibayar_telat: number;
}

interface RekapInvoiceItem {
  id: number;
  no_invoice: string;
  tgl_faktur: string;
  tgl_jatuh_tempo: string;
  tgl_pelunasan: string | null;
  total: string | number;
  balance_due: string | number;
  paid_amount: string | number;
  outstanding_amount: string | number;
  status_payment: string;
  payment_timeliness: 'tepat waktu' | 'terlambat' | string | null;
}

interface RekapCustomerRow {
  id_customer: number;
  nama_customer: string;
  total_invoice: number;
  total_invoice_lunas: number;
  total_invoice_belum_lunas: number;
  total_rupiah: string;
  total_rupiah_lunas: string;
  total_rupiah_belum_lunas: string;
  total_invoice_dibayar_tepat_waktu: number;
  total_invoice_dibayar_telat: number;
  /** Only present when the request was filtered by id_customer */
  invoice?: RekapInvoiceItem[];
}

interface RekapResponse {
  status: number;
  success: boolean;
  range_tgl_faktur: { start_date: string; end_date: string };
  data_rekap: RekapSummary;
  data: RekapCustomerRow[];
}

/** Option shape SearchableSelect expects */
interface CustomerOption {
  value: number;
  label: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (num: number | string | null | undefined): string => {
  const n = Number(num ?? 0);
  return `Rp ${(isNaN(n) ? 0 : n).toLocaleString('id-ID')}`;
};

const formatCompact = (num: number | string | null | undefined): string => {
  const n = Number(num ?? 0);
  if (isNaN(n)) return 'Rp 0';
  if (Math.abs(n) >= 1_000_000_000)
    return `Rp ${(n / 1_000_000_000).toLocaleString('id-ID', {
      maximumFractionDigits: 1,
    })} M`;
  if (Math.abs(n) >= 1_000_000)
    return `Rp ${(n / 1_000_000).toLocaleString('id-ID', {
      maximumFractionDigits: 1,
    })} Jt`;
  return formatCurrency(n);
};

const formatDate = (dateString?: string | null): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${day}/${month}/${year}`;
};

const pct = (part: number, whole: number): number =>
  whole > 0 ? Math.round((part / whole) * 1000) / 10 : 0;

const currentYear = new Date().getFullYear();
const DEFAULT_START_DATE = `${currentYear}-01-01`;
const DEFAULT_END_DATE = `${currentYear}-12-31`;

// ─── Small presentational pieces ───────────────────────────────────────────────

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-blue-100 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-2xl sm:text-3xl font-bold text-white mt-1">{value}</p>
    </div>
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  const colors: { [key: string]: string } = {
    'belum lunas': 'bg-red-100 text-red-800',
    lunas: 'bg-green-100 text-green-800',
    'sebagian lunas': 'bg-yellow-100 text-yellow-800',
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
        colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-700'
      }`}
    >
      {status || '-'}
    </span>
  );
}

function TimelinessBadge({ item }: { item: RekapInvoiceItem }) {
  if (
    item.status_payment?.toLowerCase() !== 'lunas' ||
    !item.payment_timeliness
  ) {
    return <span className="text-gray-400 text-xs">-</span>;
  }
  const isLate = item.payment_timeliness.toLowerCase() === 'terlambat';
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
        isLate ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
      }`}
    >
      {isLate ? 'Terlambat' : 'Tepat Waktu'}
    </span>
  );
}

// ─── Payment composition (stacked bar) ─────────────────────────────────────────

function PaymentCompositionCard({ summary }: { summary: RekapSummary }) {
  const total = Number(summary.total_rupiah) || 0;
  const lunas = Number(summary.total_rupiah_lunas) || 0;
  const belum = Number(summary.total_rupiah_belum_lunas) || 0;
  const lunasPct = pct(lunas, total);
  const belumPct = pct(belum, total);

  const timelinessTotal =
    summary.total_invoice_dibayar_tepat_waktu +
    summary.total_invoice_dibayar_telat;
  const tepatPct = pct(
    summary.total_invoice_dibayar_tepat_waktu,
    timelinessTotal,
  );

  return (
    <div className="bg-white rounded-xl shadow p-5">
      <h3 className="text-sm font-bold text-gray-800 mb-3">
        Komposisi Pembayaran
      </h3>

      <div className="flex w-full h-3 rounded-full overflow-hidden bg-gray-100 mb-2">
        {lunasPct > 0 && (
          <div
            className="bg-green-500 h-full"
            style={{ width: `${lunasPct}%` }}
          />
        )}
        {belumPct > 0 && (
          <div
            className="bg-red-400 h-full"
            style={{ width: `${belumPct}%` }}
          />
        )}
      </div>

      <div className="flex justify-between text-xs mb-4">
        <span className="text-gray-600">
          <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1" />
          Lunas {formatCurrency(lunas)} ({lunasPct}%)
        </span>
        <span className="text-gray-600">
          Belum Lunas {formatCurrency(belum)} ({belumPct}%)
          <span className="inline-block w-2 h-2 rounded-full bg-red-400 ml-1" />
        </span>
      </div>

      <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          Ketepatan bayar (dari invoice yang sudah lunas & tercatat)
        </span>
        <span className="text-xs font-semibold text-gray-800">
          {summary.total_invoice_dibayar_tepat_waktu} tepat waktu ·{' '}
          {summary.total_invoice_dibayar_telat} telat
          {timelinessTotal > 0 && (
            <span className="text-gray-400"> ({tepatPct}% tepat waktu)</span>
          )}
        </span>
      </div>
    </div>
  );
}

// ─── Top customers ranking ──────────────────────────────────────────────────────

function TopCustomersCard({ rows }: { rows: RekapCustomerRow[] }) {
  const ranked = useMemo(
    () =>
      [...rows]
        .sort((a, b) => Number(b.total_rupiah) - Number(a.total_rupiah))
        .slice(0, 5),
    [rows],
  );
  const maxValue = ranked.length > 0 ? Number(ranked[0].total_rupiah) : 0;

  if (ranked.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow p-5">
      <h3 className="text-sm font-bold text-gray-800 mb-4">
        Top Customer berdasarkan Nilai Invoice
      </h3>
      <div className="space-y-3">
        {ranked.map((row, idx) => {
          const width =
            maxValue > 0 ? (Number(row.total_rupiah) / maxValue) * 100 : 0;
          return (
            <div key={row.id_customer}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="flex items-center gap-2 font-medium text-gray-800 truncate">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="truncate">{row.nama_customer}</span>
                </span>
                <span className="font-semibold text-gray-900 whitespace-nowrap ml-2">
                  {formatCompact(row.total_rupiah)}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Customer invoice detail table (drill-down) ────────────────────────────────

function CustomerInvoiceDetail({
  loading,
  invoices,
  onOpenInvoice,
  openingId,
}: {
  loading: boolean;
  invoices: RekapInvoiceItem[] | undefined;
  onOpenInvoice: (id: number) => void;
  openingId: number | null;
}) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-6">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!invoices || invoices.length === 0) {
    return (
      <div className="text-center text-xs text-gray-500 py-4">
        Tidak ada invoice pada periode ini.
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead className="bg-gray-100">
            <tr>
              {[
                'No Invoice',
                'Tgl Faktur',
                'Jatuh Tempo',
                'Tgl Pelunasan',
                'Total',
                'Status Payment',
                'Ketepatan',
              ].map((h) => (
                <th
                  key={h}
                  className="px-3 py-2 text-left font-medium text-gray-500 uppercase whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 whitespace-nowrap font-medium">
                  <button
                    type="button"
                    onClick={() => onOpenInvoice(inv.id)}
                    disabled={openingId === inv.id}
                    className="text-blue-600 hover:text-blue-800 hover:underline disabled:opacity-50 disabled:cursor-wait"
                    title="Lihat detail invoice"
                  >
                    {openingId === inv.id ? 'Memuat...' : inv.no_invoice}
                  </button>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-gray-700">
                  {formatDate(inv.tgl_faktur)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-gray-700">
                  {formatDate(inv.tgl_jatuh_tempo)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-gray-700">
                  {formatDate(inv.tgl_pelunasan)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap font-semibold text-gray-900">
                  {formatCurrency(inv.total)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <PaymentStatusBadge status={inv.status_payment} />
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <TimelinessBadge item={inv} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const RekapInvoice: React.FC = () => {
  const [startDate, setStartDate] = useState<string>(DEFAULT_START_DATE);
  const [endDate, setEndDate] = useState<string>(DEFAULT_END_DATE);
  // 0 = "Semua Customer" — same sentinel used by SearchableSelect elsewhere
  // in the app (e.g. Master Data > Customer's Marketing select)
  const [idCustomer, setIdCustomer] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [customerOptions, setCustomerOptions] = useState<CustomerOption[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<RekapSummary | null>(null);
  const [rangeTglFaktur, setRangeTglFaktur] = useState<{
    start_date: string;
    end_date: string;
  } | null>(null);
  const [rows, setRows] = useState<RekapCustomerRow[]>([]);

  // Per-customer invoice drill-down: fetched lazily and cached by id_customer
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [detailCache, setDetailCache] = useState<
    Record<number, RekapInvoiceItem[]>
  >({});
  const [detailLoadingIds, setDetailLoadingIds] = useState<Set<number>>(
    new Set(),
  );
  // Invoice detail modal (fetched by id when a no_invoice is clicked)
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDetail | null>(
    null,
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [openingInvoiceId, setOpeningInvoiceId] = useState<number | null>(null);
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
    } catch (err) {
      console.error('Error fetching customer list:', err);
    }
  };

  useEffect(() => {
    fetchRecap();
    // eslint-disable-next-line
  }, [startDate, endDate, idCustomer]);

  const fetchRecap = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/invoice/recap/customer`;
    try {
      setLoading(true);
      setError(null);

      const res: AxiosResponse<RekapResponse> = await axios.get(url, {
        params: {
          start_date: startDate || undefined,
          end_date: endDate || undefined,
          id_customer: idCustomer || undefined,
        },
        withCredentials: true,
      });
      console.log('Fetched recap:', res.data);
      if (res.data.success) {
        setSummary(res.data.data_rekap);
        setRangeTglFaktur(res.data.range_tgl_faktur);
        const data = res.data.data || [];
        setRows(data);

        // When filtered to a single customer, the API already embeds their
        // invoice list — seed the drill-down cache and open it right away.
        if (idCustomer && data.length === 1 && data[0].invoice) {
          const row = data[0];
          setDetailCache((prev) => ({
            ...prev,
            [row.id_customer]: row.invoice as RekapInvoiceItem[],
          }));
          setExpandedIds(new Set([row.id_customer]));
        } else {
          setExpandedIds(new Set());
        }
      } else {
        setSummary(null);
        setRows([]);
      }
    } catch (err) {
      console.error('Error fetching invoice recap:', err);
      setError('Gagal memuat data rekapitulasi.');
      setSummary(null);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerDetail = async (customerId: number): Promise<void> => {
    setDetailLoadingIds((prev) => new Set(prev).add(customerId));
    try {
      const url = `${import.meta.env.VITE_API_LINK}/invoice/recap/customer`;
      const res: AxiosResponse<RekapResponse> = await axios.get(url, {
        params: {
          start_date: startDate || undefined,
          end_date: endDate || undefined,
          id_customer: customerId,
        },
        withCredentials: true,
      });

      const invoices = res.data?.data?.[0]?.invoice || [];
      setDetailCache((prev) => ({ ...prev, [customerId]: invoices }));
    } catch (err) {
      console.error('Error fetching customer invoice detail:', err);
      setDetailCache((prev) => ({ ...prev, [customerId]: [] }));
    } finally {
      setDetailLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(customerId);
        return next;
      });
    }
  };

  const toggleExpand = (customerId: number): void => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(customerId)) {
        next.delete(customerId);
      } else {
        next.add(customerId);
        if (!detailCache[customerId]) {
          fetchCustomerDetail(customerId);
        }
      }
      return next;
    });
  };

  const handleOpenInvoice = async (invoiceId: number): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/invoice/${invoiceId}`;
    try {
      setOpeningInvoiceId(invoiceId);
      const res = await axios.get(url, { withCredentials: true });

      if (res.data?.success && res.data?.data) {
        setSelectedInvoice(res.data.data as InvoiceDetail);
        setIsDetailModalOpen(true);
      } else {
        alert('Gagal memuat detail invoice.');
      }
    } catch (err) {
      console.error('Error fetching invoice detail:', err);
      alert('Gagal memuat detail invoice.');
    } finally {
      setOpeningInvoiceId(null);
    }
  };

  const handleCloseDetailModal = (): void => {
    setIsDetailModalOpen(false);
    setSelectedInvoice(null);
  };

  const resetFilters = (): void => {
    setStartDate(DEFAULT_START_DATE);
    setEndDate(DEFAULT_END_DATE);
    setIdCustomer(0);
    setSearchTerm('');
  };

  const visibleRows = useMemo(() => {
    if (!searchTerm.trim()) return rows;
    const q = searchTerm.toLowerCase();
    return rows.filter((r) => r.nama_customer?.toLowerCase().includes(q));
  }, [rows, searchTerm]);

  const isFiltered =
    idCustomer > 0 ||
    startDate !== DEFAULT_START_DATE ||
    endDate !== DEFAULT_END_DATE ||
    !!searchTerm;

  return (
    <div className="space-y-4">
      {/* Hero / report cover */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 rounded-2xl shadow-lg p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Rekapitulasi Invoice per Customer
            </h2>
            <p className="text-sm text-blue-100 mt-1">
              Ringkasan tagihan dan status pembayaran berdasarkan tanggal
              faktur.
            </p>
          </div>
          {rangeTglFaktur && (
            <div className="inline-flex items-center gap-1.5 text-xs bg-white/15 text-white rounded-full px-3 py-1.5 self-start">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {formatDate(rangeTglFaktur.start_date)} —{' '}
              {formatDate(rangeTglFaktur.end_date)}
            </div>
          )}
        </div>

        {summary ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            <HeroStat
              label="Total Rupiah"
              value={formatCompact(summary.total_rupiah)}
            />
            <HeroStat
              label="Total Invoice"
              value={String(summary.total_invoice)}
            />
            <HeroStat
              label="Total Customer"
              value={String(summary.total_customer)}
            />
            <HeroStat
              label="Belum Lunas"
              value={formatCompact(summary.total_rupiah_belum_lunas)}
            />
          </div>
        ) : (
          <p className="text-sm text-blue-100">
            {loading ? 'Memuat ringkasan…' : 'Belum ada data pada periode ini.'}
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Tgl Faktur Dari
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Tgl Faktur Sampai
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Cari di Hasil (Nama Customer)
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="mis. Kalbe Farma"
              className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
              value={idCustomer}
              onChange={(value) => setIdCustomer(Number(value))}
              placeholder="Cari customer..."
            />
          </div>
        </div>

        {isFiltered && (
          <div className="flex justify-end mt-3 pt-3 border-t border-gray-100">
            <button
              onClick={resetFilters}
              className="text-xs font-medium text-blue-600 hover:text-blue-800"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* Composition + top customers */}
      {summary && summary.total_customer > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PaymentCompositionCard summary={summary} />
          <TopCustomersCard rows={visibleRows} />
        </div>
      )}

      {/* Detail table */}
      <div>
        <h3 className="text-sm font-bold text-gray-800 mb-2 px-1">
          Rincian per Customer
        </h3>

        {/* Desktop table */}
        <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-2 w-8" />
                  {[
                    'Customer',
                    'Total Invoice',
                    'Lunas',
                    'Belum Lunas',
                    'Tepat Waktu',
                    'Telat',
                    'Total ',
                    ' Lunas',
                    ' Belum Lunas',
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="px-3 py-6 text-center">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : visibleRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-3 py-6 text-center text-gray-500 text-sm"
                    >
                      Tidak ada data pada periode ini.
                    </td>
                  </tr>
                ) : (
                  visibleRows.map((row) => {
                    const lunasRatio = pct(
                      row.total_invoice_lunas,
                      row.total_invoice,
                    );
                    return (
                      <React.Fragment key={row.id_customer}>
                        <tr className="hover:bg-gray-50">
                          <td className="px-2 py-2 w-8">
                            <button
                              onClick={() => toggleExpand(row.id_customer)}
                              className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 text-gray-600"
                              aria-label="Lihat detail invoice customer"
                              aria-expanded={expandedIds.has(row.id_customer)}
                            >
                              <svg
                                className={`w-4 h-4 transition-transform ${
                                  expandedIds.has(row.id_customer)
                                    ? 'rotate-90'
                                    : ''
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
                          </td>
                          <td className="px-3 py-2 text-xs font-medium text-gray-900">
                            <div>{row.nama_customer}</div>
                            <div className="w-24 h-1 rounded-full bg-red-200 overflow-hidden mt-1">
                              <div
                                className="h-full bg-green-500"
                                style={{ width: `${lunasRatio}%` }}
                              />
                            </div>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                            {row.total_invoice}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-green-700 font-medium">
                            {row.total_invoice_lunas}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-red-700 font-medium">
                            {row.total_invoice_belum_lunas}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-green-700">
                            {row.total_invoice_dibayar_tepat_waktu}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-red-700">
                            {row.total_invoice_dibayar_telat}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs font-semibold text-gray-900">
                            {formatCurrency(row.total_rupiah)}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-green-700">
                            {formatCurrency(row.total_rupiah_lunas)}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-red-700">
                            {formatCurrency(row.total_rupiah_belum_lunas)}
                          </td>
                        </tr>

                        {expandedIds.has(row.id_customer) && (
                          <tr className="bg-gray-50/50">
                            <td colSpan={10} className="px-4 py-3">
                              <CustomerInvoiceDetail
                                loading={detailLoadingIds.has(row.id_customer)}
                                invoices={
                                  detailCache[row.id_customer] ?? row.invoice
                                }
                                onOpenInvoice={handleOpenInvoice}
                                openingId={openingInvoiceId}
                              />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile card view */}
        <div className="lg:hidden space-y-3">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : visibleRows.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500 text-sm">
              Tidak ada data pada periode ini.
            </div>
          ) : (
            visibleRows.map((row) => {
              const lunasRatio = pct(
                row.total_invoice_lunas,
                row.total_invoice,
              );
              return (
                <div
                  key={row.id_customer}
                  className="bg-white rounded-lg shadow p-4"
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-semibold text-sm text-gray-900">
                      {row.nama_customer}
                    </div>
                    <div className="text-sm font-bold text-gray-900">
                      {formatCurrency(row.total_rupiah)}
                    </div>
                  </div>
                  <div className="w-full h-1 rounded-full bg-red-200 overflow-hidden mb-3">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: `${lunasRatio}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div>
                      <span className="text-gray-500">Total Invoice:</span>{' '}
                      <span className="text-gray-900 font-medium">
                        {row.total_invoice}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Lunas / Belum:</span>{' '}
                      <span className="text-green-700 font-medium">
                        {row.total_invoice_lunas}
                      </span>{' '}
                      /{' '}
                      <span className="text-red-700 font-medium">
                        {row.total_invoice_belum_lunas}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Rupiah Lunas:</span>{' '}
                      <span className="text-green-700 font-medium">
                        {formatCurrency(row.total_rupiah_lunas)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Rupiah Belum:</span>{' '}
                      <span className="text-red-700 font-medium">
                        {formatCurrency(row.total_rupiah_belum_lunas)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Tepat Waktu:</span>{' '}
                      <span className="text-green-700 font-medium">
                        {row.total_invoice_dibayar_tepat_waktu}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Telat:</span>{' '}
                      <span className="text-red-700 font-medium">
                        {row.total_invoice_dibayar_telat}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleExpand(row.id_customer)}
                    className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 pt-2 border-t border-gray-100 w-full"
                  >
                    <span>{expandedIds.has(row.id_customer) ? '▾' : '▸'}</span>
                    Detail Invoice
                  </button>

                  {expandedIds.has(row.id_customer) && (
                    <div className="mt-2">
                      <CustomerInvoiceDetail
                        loading={detailLoadingIds.has(row.id_customer)}
                        invoices={detailCache[row.id_customer] ?? row.invoice}
                        onOpenInvoice={handleOpenInvoice}
                        openingId={openingInvoiceId}
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
      {/* Invoice detail modal */}
      {isDetailModalOpen && selectedInvoice && (
        <DetailInvoiceModal
          invoiceData={selectedInvoice}
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          onUpdated={() => {
            setDetailCache({}); // buang cache agar detail ter-refresh
            fetchRecap();
          }}
        />
      )}
    </div>
  );
};

export default RekapInvoice;
