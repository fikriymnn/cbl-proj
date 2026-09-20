import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import PaymentARModal from './PaymentARModal';

// ─── Types ────────────────────────────────────────────────────────────────────

type Num = number | string | null | undefined;

interface ARInvoice {
  id: number;
  id_customer: number;
  nama_customer: string;
  no_po: string;
  no_invoice: string;
  tgl_po: string;
  no_do: string;
  tgl_kirim: string;
  tgl_faktur: string;
  tgl_jatuh_tempo: string;
  waktu_jatuh_tempo: string;
  total: Num;
  dp: Num;
  balance_due: Num;
  paid_amount: Num;
  status_payment: string;
  outstanding_amount: Num;
  days_until_due: number | null;
  due_description: string;
  waktu: string;
}

interface ARCustomer {
  id_customer: number;
  nama_customer: string;
  total_invoice: number;
  total_belum_dibayar: Num;
  invoice: ARInvoice[];
}

interface ARSummary {
  total_customer: number;
  total_invoice: number;
  total_belum_dibayar: Num;
}

interface TenggatRecap {
  waktu: string;
  total_customer: number;
  total_invoice: number;
  total_belum_dibayar: Num;
}

interface ARResponse {
  status: number;
  success: boolean;
  data_rekap: ARSummary;
  data_rekap_tenggat: TenggatRecap[];
  data: ARCustomer[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (num: Num): string => {
  const n = Number(num ?? 0);
  return `Rp ${(isNaN(n) ? 0 : n).toLocaleString('id-ID')}`;
};

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
};

function recapCardTheme(waktu: string) {
  const w = (waktu || '').toLowerCase();
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

const paymentBadge = (status: string) => {
  const colors: { [key: string]: string } = {
    'belum lunas': 'bg-red-100 text-red-800',
    lunas: 'bg-green-100 text-green-800',
    'sebagian lunas': 'bg-yellow-100 text-yellow-800',
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${
        colors[(status || '').toLowerCase()] || 'bg-gray-100 text-gray-800'
      }`}
    >
      {(status || '-').toUpperCase()}
    </span>
  );
};

// ─── Summary + Recap Cards ────────────────────────────────────────────────────

function SummaryCards({ summary }: { summary: ARSummary | null }) {
  const items = [
    {
      label: 'Total Customer',
      value: (summary?.total_customer ?? 0).toLocaleString('id-ID'),
      cls: 'text-violet-700 bg-violet-50 border-violet-200',
    },
    {
      label: 'Total Invoice',
      value: (summary?.total_invoice ?? 0).toLocaleString('id-ID'),
      cls: 'text-blue-700 bg-blue-50 border-blue-200',
    },
    {
      label: 'Total Belum Dibayar',
      value: formatCurrency(summary?.total_belum_dibayar),
      cls: 'text-red-700 bg-red-50 border-red-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
      {items.map((it) => (
        <div key={it.label} className={`rounded-xl border p-4 ${it.cls}`}>
          <p className="text-xs font-medium text-gray-500">{it.label}</p>
          <p className="text-xl font-bold mt-1">{it.value}</p>
        </div>
      ))}
    </div>
  );
}

function TenggatRecapCards({
  recapData,
  activeWaktu,
  onCardClick,
}: {
  recapData: TenggatRecap[];
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
        <h3 className="text-sm font-bold text-gray-700">Rekap Tenggat</h3>
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
                {item.total_customer} customer
              </p>
              <p className="text-xs text-gray-500">
                Belum dibayar:{' '}
                <span className="font-semibold text-gray-700">
                  {formatCurrency(item.total_belum_dibayar)}
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

const ListAR: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [customers, setCustomers] = useState<ARCustomer[]>([]);
  const [summary, setSummary] = useState<ARSummary | null>(null);
  const [recapData, setRecapData] = useState<TenggatRecap[]>([]);

  // Filters (query params of /invoice/ar)
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [idCustomer, setIdCustomer] = useState<string>('');
  const [activeWaktu, setActiveWaktu] = useState<string | null>(null);

  // Customer dropdown options — collected while no customer filter is applied
  const [customerOptions, setCustomerOptions] = useState<
    { id: number; nama: string }[]
  >([]);

  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  // Multi-select for payment (only invoices of the SAME customer)
  const [selected, setSelected] = useState<Map<number, ARInvoice>>(new Map());
  const [isPaymentOpen, setIsPaymentOpen] = useState<boolean>(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchAR();
    // eslint-disable-next-line
  }, [searchTerm, startDate, endDate, idCustomer, activeWaktu]);

  const fetchAR = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/invoice/ar`;
    try {
      setLoading(true);

      const res: AxiosResponse<ARResponse> = await axios.get(url, {
        params: {
          start_date: startDate || undefined,
          end_date: endDate || undefined,
          search: searchTerm || undefined,
          id_customer: idCustomer || undefined,
          waktu: activeWaktu ?? undefined,
        },
        withCredentials: true,
      });

      console.log('Fetched AR data:', res.data);

      const list = Array.isArray(res.data.data) ? res.data.data : [];
      setCustomers(list);
      setSummary(res.data.data_rekap ?? null);

      // Keep the cards stable while a card filter is active
      if (!activeWaktu && Array.isArray(res.data.data_rekap_tenggat)) {
        setRecapData(res.data.data_rekap_tenggat);
      }

      // Build the customer dropdown from unfiltered-by-customer results
      if (!idCustomer) {
        setCustomerOptions((prev) => {
          const map = new Map(prev.map((c) => [c.id, c.nama]));
          list.forEach((c) => map.set(c.id_customer, c.nama_customer));
          return Array.from(map, ([id, nama]) => ({ id, nama })).sort((a, b) =>
            a.nama.localeCompare(b.nama),
          );
        });
      }
    } catch (error) {
      console.error('Error fetching AR data:', error);
      setCustomers([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (val: string): void => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearchTerm(val), 400);
  };

  const handleRecapCardClick = (waktu: string): void => {
    setActiveWaktu((prev) => (prev === waktu ? null : waktu));
  };

  const toggleCustomer = (id: number): void => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ── Payment selection ──

  const isPayable = (inv: ARInvoice): boolean =>
    Number(inv.outstanding_amount ?? 0) > 0 &&
    (inv.status_payment || '').toLowerCase() !== 'lunas';

  const selectedList = useMemo(() => Array.from(selected.values()), [selected]);
  const lockedCustomerId: number | null =
    selectedList.length > 0 ? selectedList[0].id_customer : null;
  const selectedTotal = selectedList.reduce(
    (sum, i) => sum + Number(i.outstanding_amount ?? 0),
    0,
  );

  const toggleInvoice = (inv: ARInvoice): void => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(inv.id)) {
        next.delete(inv.id);
      } else {
        const locked = next.size > 0 ? next.values().next().value : null;
        if (locked && locked.id_customer !== inv.id_customer) return prev;
        next.set(inv.id, inv);
      }
      return next;
    });
  };

  const customerPayable = (cust: ARCustomer): ARInvoice[] =>
    cust.invoice.filter(isPayable);

  const customerAllSelected = (cust: ARCustomer): boolean => {
    const payable = customerPayable(cust);
    return payable.length > 0 && payable.every((i) => selected.has(i.id));
  };

  const customerLocked = (cust: ARCustomer): boolean =>
    lockedCustomerId !== null && lockedCustomerId !== cust.id_customer;

  const toggleCustomerAll = (cust: ARCustomer): void => {
    if (customerLocked(cust)) return;
    const payable = customerPayable(cust);
    setSelected((prev) => {
      const next = new Map(prev);
      if (payable.every((i) => next.has(i.id))) {
        payable.forEach((i) => next.delete(i.id));
      } else {
        payable.forEach((i) => next.set(i.id, i));
      }
      return next;
    });
  };

  const handlePaymentSuccess = (): void => {
    setIsPaymentOpen(false);
    setSelected(new Map());
    fetchAR();
  };

  const allExpanded = useMemo(
    () =>
      customers.length > 0 &&
      customers.every((c) => expanded.has(c.id_customer)),
    [customers, expanded],
  );

  const toggleAll = (): void => {
    setExpanded(
      allExpanded ? new Set() : new Set(customers.map((c) => c.id_customer)),
    );
  };

  const hasActiveFilter =
    !!searchTerm || !!startDate || !!endDate || !!idCustomer || !!activeWaktu;

  const resetFilters = (): void => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setIdCustomer('');
    setActiveWaktu(null);
    const el = document.getElementById('ar-search') as HTMLInputElement | null;
    if (el) el.value = '';
  };

  const dueTextClass = (days: number | null): string => {
    if (days === null || days === undefined) return 'text-gray-500';
    if (days < 0) return 'text-red-600 font-semibold';
    if (days === 0) return 'text-orange-600 font-semibold';
    return 'text-gray-700';
  };

  return (
    <div>
      {/* Summary + tenggat cards */}
      <SummaryCards summary={summary} />
      <TenggatRecapCards
        recapData={recapData}
        activeWaktu={activeWaktu}
        onCardClick={handleRecapCardClick}
      />

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-3 sm:p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative lg:col-span-2">
            <input
              id="ar-search"
              type="text"
              placeholder="Search by Invoice, DO, PO, Customer..."
              onChange={(e) => handleSearchChange(e.target.value)}
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

          <select
            value={idCustomer}
            onChange={(e) => setIdCustomer(e.target.value)}
            className="py-2 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Semua Customer</option>
            {customerOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nama}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 whitespace-nowrap">
              Dari
            </label>
            <input
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full py-2 px-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 whitespace-nowrap">
              Sampai
            </label>
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full py-2 px-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-3">
          {activeWaktu && (
            <span className="inline-flex items-center gap-2 text-xs bg-blue-50 border border-blue-200 text-blue-700 rounded-full px-3 py-1.5">
              Tenggat: <strong>{activeWaktu}</strong>
              <button
                onClick={() => setActiveWaktu(null)}
                className="text-blue-500 hover:text-blue-800"
              >
                ✕
              </button>
            </span>
          )}
          {hasActiveFilter && (
            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-gray-500 hover:text-gray-800 underline"
            >
              Reset semua filter
            </button>
          )}
          <button
            onClick={toggleAll}
            disabled={customers.length === 0}
            className="ml-auto text-xs font-semibold text-blue-600 hover:text-blue-800 disabled:opacity-40"
          >
            {allExpanded ? 'Tutup semua' : 'Buka semua'}
          </button>
        </div>
      </div>

      {/* Customer AR list */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            No data available
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {customers.map((cust) => {
              const isOpen = expanded.has(cust.id_customer);
              return (
                <div key={cust.id_customer}>
                  {/* Customer row */}
                  <div
                    onClick={() => toggleCustomer(cust.id_customer)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-violet-50 hover:bg-violet-100 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={customerAllSelected(cust)}
                        disabled={
                          customerLocked(cust) ||
                          customerPayable(cust).length === 0
                        }
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => toggleCustomerAll(cust)}
                        title={
                          customerLocked(cust)
                            ? 'Hanya bisa memilih invoice dari satu customer'
                            : 'Pilih semua invoice customer ini'
                        }
                        className="w-4 h-4 accent-violet-600 disabled:opacity-40 disabled:cursor-not-allowed"
                      />
                      <svg
                        className={`w-3.5 h-3.5 text-violet-500 flex-shrink-0 transition-transform ${
                          isOpen ? 'rotate-90' : ''
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
                      <span className="text-sm font-bold text-violet-700 truncate">
                        {cust.nama_customer}
                      </span>
                      <span className="text-[10px] font-semibold text-violet-600 bg-white px-1.5 py-0.5 rounded-full whitespace-nowrap">
                        {cust.total_invoice} invoice
                      </span>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-[10px] text-gray-500">Belum dibayar</p>
                      <p className="text-sm font-bold text-red-600">
                        {formatCurrency(cust.total_belum_dibayar)}
                      </p>
                    </div>
                  </div>

                  {/* Invoices */}
                  {isOpen && (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 w-8"></th>
                            {[
                              ['No Invoice', 'left'],
                              ['No DO', 'left'],
                              ['No PO', 'left'],
                              ['Tgl Faktur', 'left'],
                              ['Jatuh Tempo', 'left'],
                              ['TOP', 'left'],
                              ['Total', 'right'],
                              ['Dibayar', 'right'],
                              ['Outstanding', 'right'],
                              ['Sisa Waktu', 'left'],
                              ['Status', 'left'],
                            ].map(([h, align]) => (
                              <th
                                key={h}
                                className={`px-3 py-2 text-${align} text-[10px] font-medium text-gray-500 uppercase whitespace-nowrap`}
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {cust.invoice.map((inv) => {
                            const theme = recapCardTheme(inv.waktu);
                            return (
                              <tr
                                key={inv.id}
                                className={
                                  selected.has(inv.id)
                                    ? 'bg-green-50'
                                    : 'hover:bg-gray-50'
                                }
                              >
                                <td className="px-3 py-2">
                                  <input
                                    type="checkbox"
                                    checked={selected.has(inv.id)}
                                    disabled={
                                      !isPayable(inv) ||
                                      (lockedCustomerId !== null &&
                                        lockedCustomerId !== inv.id_customer)
                                    }
                                    onChange={() => toggleInvoice(inv)}
                                    title={
                                      !isPayable(inv)
                                        ? 'Invoice sudah lunas'
                                        : lockedCustomerId !== null &&
                                          lockedCustomerId !== inv.id_customer
                                        ? 'Hanya bisa memilih invoice dari satu customer'
                                        : 'Pilih untuk pembayaran'
                                    }
                                    className="w-4 h-4 accent-green-600 disabled:opacity-40 disabled:cursor-not-allowed"
                                  />
                                </td>
                                <td className="px-3 py-2 text-xs font-medium text-gray-900 whitespace-nowrap">
                                  {inv.no_invoice || '-'}
                                </td>
                                <td
                                  className="px-3 py-2 text-xs text-gray-700 max-w-[160px] truncate"
                                  title={inv.no_do}
                                >
                                  {inv.no_do || '-'}
                                </td>
                                <td className="px-3 py-2 text-xs text-gray-700 whitespace-nowrap">
                                  {inv.no_po || '-'}
                                </td>
                                <td className="px-3 py-2 text-xs text-gray-700 whitespace-nowrap">
                                  {formatDate(inv.tgl_faktur)}
                                </td>
                                <td className="px-3 py-2 text-xs text-gray-700 whitespace-nowrap">
                                  {formatDate(inv.tgl_jatuh_tempo)}
                                </td>
                                <td className="px-3 py-2 text-xs text-gray-700 whitespace-nowrap">
                                  {inv.waktu_jatuh_tempo || '-'}
                                </td>
                                <td className="px-3 py-2 text-xs text-right text-gray-900 whitespace-nowrap">
                                  {formatCurrency(inv.total)}
                                </td>
                                <td className="px-3 py-2 text-xs text-right text-green-700 whitespace-nowrap">
                                  {formatCurrency(inv.paid_amount)}
                                </td>
                                <td className="px-3 py-2 text-xs text-right font-bold text-red-600 whitespace-nowrap">
                                  {formatCurrency(inv.outstanding_amount)}
                                </td>
                                <td className="px-3 py-2 text-xs whitespace-nowrap">
                                  <div className="flex flex-col gap-0.5">
                                    <span
                                      className={dueTextClass(
                                        inv.days_until_due,
                                      )}
                                    >
                                      {inv.due_description || '-'}
                                    </span>
                                    <span
                                      className={`inline-block w-fit text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${theme.chip}`}
                                    >
                                      {inv.waktu}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-3 py-2">
                                  {paymentBadge(inv.status_payment)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selection action bar */}
      {selectedList.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-2xl bg-white border border-green-200 shadow-xl rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">
              {selectedList[0].nama_customer}
            </p>
            <p className="text-xs text-gray-500">
              {selectedList.length} invoice dipilih · Outstanding{' '}
              <span className="font-semibold text-red-600">
                {formatCurrency(selectedTotal)}
              </span>
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSelected(new Map())}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg"
            >
              Batal pilih
            </button>
            <button
              onClick={() => setIsPaymentOpen(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg"
            >
              Input Pembayaran
            </button>
          </div>
        </div>
      )}

      {/* Payment modal */}
      {isPaymentOpen && selectedList.length > 0 && (
        <PaymentARModal
          customerId={selectedList[0].id_customer}
          customerName={selectedList[0].nama_customer}
          invoices={selectedList}
          onClose={() => setIsPaymentOpen(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default ListAR;
