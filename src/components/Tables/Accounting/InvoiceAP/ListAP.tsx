import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type {
  APInvoiceRow,
  APResponse,
  APSummary,
  APTenggatRecap,
} from './types';
import SearchableSelect from './SearchableSelect';
import { useVendorOptions } from './useVendorOptions';
import PaymentAPModal from './PaymentAPModal';
import ListBuktiBayarAP from './ListBuktiBayarAP';
import {
  DueBadge,
  LabeledValue,
  PaymentBadge,
  RecapCards,
  SearchIcon,
  Spinner,
  TaxBadge,
} from './ui';
import {
  API,
  dueTextClass,
  formatCurrency,
  formatDate,
  getInvoiceTaxType,
  recapCardTheme,
} from './utils';

/* =============================================================================
 * WHAT CHANGED (vs previous version)
 *  - Checkbox per invoice + checkbox per vendor (pilih semua yang belum lunas)
 *  - Seleksi dikunci ke SATU vendor (lockedVendorId)
 *  - Selection bar + PaymentAPModal (bayar invoice AP)
 *  - Setelah pembayaran sukses: reset seleksi + fetchAP()
 * ========================================================================== */

type APVendor = APResponse['data'][number];

// Invoice terpilih disimpan bersama info vendor-nya, sehingga tidak
// bergantung pada field id_vendor di APInvoiceRow.
interface SelectedItem {
  inv: APInvoiceRow;
  vendorId: number;
  vendorName: string;
  isTax: boolean;
}

// Jenis pajak invoice, diambil dari getInvoiceTaxType (sama dengan TaxBadge).
// Sesuaikan satu baris ini bila nilai kembalian getInvoiceTaxType berbeda.
const invoiceIsTax = (inv: APInvoiceRow): boolean => {
  const t = String(getInvoiceTaxType(inv.no_invoice) ?? '').toLowerCase();
  return /tax|pajak|ppn/.test(t) && !/non|bukan|tanpa/.test(t);
};

const taxLabel = (isTax: boolean): string => (isTax ? 'Pajak' : 'Non Pajak');

function SummaryCards({ summary }: { summary: APSummary | null }) {
  const items = [
    {
      label: 'Total Vendor',
      value: (summary?.total_vendor ?? 0).toLocaleString('id-ID'),
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
          <p className="text-xl font-bold mt-1 break-words">{it.value}</p>
        </div>
      ))}
    </div>
  );
}

const ListAP: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'invoice' | 'bukti'>('invoice');
  const [loading, setLoading] = useState<boolean>(true);
  const [vendors, setVendors] = useState<APResponse['data']>([]);
  const [summary, setSummary] = useState<APSummary | null>(null);
  const [recapData, setRecapData] = useState<APTenggatRecap[]>([]);

  // Filters (query params of /invoiceAp/ap)
  const [searchInput, setSearchInput] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [idVendor, setIdVendor] = useState<string>('');
  const [activeWaktu, setActiveWaktu] = useState<string | null>(null);

  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  // Multi-select untuk pembayaran (hanya invoice dari SATU vendor)
  const [selected, setSelected] = useState<Map<number, SelectedItem>>(
    new Map(),
  );
  const [isPaymentOpen, setIsPaymentOpen] = useState<boolean>(false);

  const { options: vendorOptions, loading: vendorsLoading } =
    useVendorOptions();
  const reqId = useRef<number>(0);

  useEffect(() => {
    const t = setTimeout(() => setSearchTerm(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    fetchAP();
    // eslint-disable-next-line
  }, [searchTerm, startDate, endDate, idVendor, activeWaktu]);

  const fetchAP = async (): Promise<void> => {
    const id = ++reqId.current;
    try {
      setLoading(true);
      const res: AxiosResponse<APResponse> = await axios.get(
        `${API}/invoiceAp/ap`,
        {
          params: {
            start_date: startDate || undefined,
            end_date: endDate || undefined,
            search: searchTerm || undefined,
            id_vendor: idVendor || undefined,
            waktu: activeWaktu ?? undefined,
          },
          withCredentials: true,
        },
      );
      if (id !== reqId.current) return;

      setVendors(Array.isArray(res.data.data) ? res.data.data : []);
      setSummary(res.data.data_rekap ?? null);

      if (!activeWaktu && Array.isArray(res.data.data_rekap_tenggat)) {
        setRecapData(res.data.data_rekap_tenggat);
      }
    } catch (error) {
      if (id !== reqId.current) return;
      console.error('Error fetching AP data:', error);
      setVendors([]);
      setSummary(null);
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  };

  const handleRecapCardClick = (waktu: string): void =>
    setActiveWaktu((prev) => (prev === waktu ? null : waktu));

  const toggleVendor = (id: number): void => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ── Payment selection ──

  const isPayable = (inv: APInvoiceRow): boolean =>
    Number(inv.outstanding_amount ?? 0) > 0 &&
    (inv.status_payment || '').toLowerCase() !== 'lunas';

  const selectedList = useMemo(() => Array.from(selected.values()), [selected]);
  const lockedVendorId: number | null =
    selectedList.length > 0 ? selectedList[0].vendorId : null;
  const lockedVendorName: string =
    selectedList.length > 0 ? selectedList[0].vendorName : '';
  const lockedIsTax: boolean | null =
    selectedList.length > 0 ? selectedList[0].isTax : null;
  const selectedTotal = selectedList.reduce(
    (sum, s) => sum + Number(s.inv.outstanding_amount ?? 0),
    0,
  );

  // Terkunci bila beda vendor, atau (untuk level invoice) beda jenis pajak.
  const invoiceLocked = (vendorId: number, inv?: APInvoiceRow): boolean => {
    if (lockedVendorId === null) return false;
    if (lockedVendorId !== vendorId) return true;
    return inv !== undefined && lockedIsTax !== invoiceIsTax(inv);
  };

  const invoiceCheckTitle = (inv: APInvoiceRow, vendorId: number): string =>
    !isPayable(inv)
      ? 'Invoice sudah lunas'
      : lockedVendorId !== null && lockedVendorId !== vendorId
      ? 'Hanya bisa memilih invoice dari satu vendor'
      : invoiceLocked(vendorId, inv)
      ? `Hanya bisa memilih invoice ${taxLabel(
          lockedIsTax ?? false,
        )} (jenis pajak harus sama)`
      : 'Pilih untuk pembayaran';

  const toggleInvoice = (inv: APInvoiceRow, vendor: APVendor): void => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(inv.id)) {
        next.delete(inv.id);
      } else {
        const first = prev.size > 0 ? Array.from(prev.values())[0] : null;
        const tax = invoiceIsTax(inv);
        if (first && first.vendorId !== vendor.id_vendor) return prev;
        if (first && first.isTax !== tax) return prev;
        next.set(inv.id, {
          inv,
          vendorId: vendor.id_vendor,
          vendorName: vendor.nama_vendor,
          isTax: tax,
        });
      }
      return next;
    });
  };

  // Invoice yang bisa dipilih lewat checkbox vendor: belum lunas dan satu
  // jenis pajak (mengikuti pilihan yang sudah ada, atau jenis invoice
  // pertama yang belum lunas bila belum ada pilihan).
  const vendorPayable = (vendor: APVendor): APInvoiceRow[] => {
    const payable = vendor.invoice.filter(isPayable);
    if (payable.length === 0) return [];
    const target = lockedIsTax ?? invoiceIsTax(payable[0]);
    return payable.filter((i) => invoiceIsTax(i) === target);
  };

  const vendorAllSelected = (vendor: APVendor): boolean => {
    const payable = vendorPayable(vendor);
    return payable.length > 0 && payable.every((i) => selected.has(i.id));
  };

  const toggleVendorAll = (vendor: APVendor): void => {
    if (invoiceLocked(vendor.id_vendor)) return;
    const payable = vendorPayable(vendor);
    setSelected((prev) => {
      const next = new Map(prev);
      if (payable.every((i) => next.has(i.id))) {
        payable.forEach((i) => next.delete(i.id));
      } else {
        payable.forEach((i) =>
          next.set(i.id, {
            inv: i,
            vendorId: vendor.id_vendor,
            vendorName: vendor.nama_vendor,
            isTax: invoiceIsTax(i),
          }),
        );
      }
      return next;
    });
  };

  const handlePaymentSuccess = (): void => {
    setIsPaymentOpen(false);
    setSelected(new Map());
    fetchAP();
  };

  const allExpanded = useMemo(
    () => vendors.length > 0 && vendors.every((v) => expanded.has(v.id_vendor)),
    [vendors, expanded],
  );

  const toggleAll = (): void =>
    setExpanded(
      allExpanded ? new Set() : new Set(vendors.map((v) => v.id_vendor)),
    );

  const hasActiveFilter =
    !!searchTerm || !!startDate || !!endDate || !!idVendor || !!activeWaktu;

  const resetFilters = (): void => {
    setSearchInput('');
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setIdVendor('');
    setActiveWaktu(null);
  };

  const recapItems = recapData.map((r) => ({
    waktu: r.waktu,
    total_invoice: r.total_invoice,
    amount: r.total_belum_dibayar,
    extra: `${r.total_vendor} vendor`,
  }));

  return (
    <div>
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
        <ListBuktiBayarAP mode="view" />
      ) : (
        <>
          <SummaryCards summary={summary} />
          <RecapCards
            title="Rekap Tenggat"
            amountLabel="Belum dibayar"
            items={recapItems}
            activeWaktu={activeWaktu}
            onCardClick={handleRecapCardClick}
          />

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-3 sm:p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="relative lg:col-span-2">
                <input
                  type="text"
                  placeholder="Search by Invoice, PO, Surat Jalan, Vendor..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                />
                <SearchIcon />
              </div>

              <SearchableSelect
                options={vendorOptions}
                value={idVendor}
                onChange={setIdVendor}
                allLabel="Semua Vendor"
                placeholder="Semua Vendor"
                searchPlaceholder="Cari vendor..."
                loading={vendorsLoading}
              />

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
                disabled={vendors.length === 0}
                className="ml-auto text-xs font-semibold text-blue-600 hover:text-blue-800 disabled:opacity-40"
              >
                {allExpanded ? 'Tutup semua' : 'Buka semua'}
              </button>
            </div>
          </div>

          {/* Vendor AP list */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-12">
                <Spinner />
              </div>
            ) : vendors.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                No data available
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {vendors.map((vendor) => {
                  const isOpen = expanded.has(vendor.id_vendor);
                  const vLocked = invoiceLocked(vendor.id_vendor);
                  return (
                    <div key={vendor.id_vendor}>
                      {/* Vendor row */}
                      <div
                        onClick={() => toggleVendor(vendor.id_vendor)}
                        className="w-full flex items-center justify-between gap-3 px-3 sm:px-4 py-3 bg-violet-50 hover:bg-violet-100 transition-colors text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                          <input
                            type="checkbox"
                            checked={vendorAllSelected(vendor)}
                            disabled={
                              vLocked || vendorPayable(vendor).length === 0
                            }
                            onClick={(e) => e.stopPropagation()}
                            onChange={() => toggleVendorAll(vendor)}
                            title={
                              vLocked
                                ? 'Hanya bisa memilih invoice dari satu vendor'
                                : 'Pilih semua invoice vendor ini (satu jenis pajak)'
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
                            {vendor.nama_vendor}
                          </span>
                          <span className="text-[10px] font-semibold text-violet-600 bg-white px-1.5 py-0.5 rounded-full whitespace-nowrap">
                            {vendor.total_invoice} invoice
                          </span>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="text-[10px] text-gray-500">
                            Belum dibayar
                          </p>
                          <p className="text-sm font-bold text-red-600">
                            {formatCurrency(vendor.total_belum_dibayar)}
                          </p>
                        </div>
                      </div>

                      {isOpen && (
                        <>
                          {/* Desktop / tablet table */}
                          <div className="hidden md:block overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-3 py-2 w-8"></th>
                                  {[
                                    ['No Invoice', 'left'],
                                    ['No Invoice Vendor', 'left'],
                                    ['No PO', 'left'],
                                    ['No Surat Jalan', 'left'],
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
                                {vendor.invoice.map((inv: APInvoiceRow) => {
                                  const theme = recapCardTheme(inv.waktu);
                                  return (
                                    <tr
                                      key={inv.id}
                                      className={
                                        selected.has(inv.id)
                                          ? 'bg-violet-50'
                                          : 'hover:bg-gray-50'
                                      }
                                    >
                                      <td className="px-3 py-2">
                                        <input
                                          type="checkbox"
                                          checked={selected.has(inv.id)}
                                          disabled={
                                            !isPayable(inv) ||
                                            invoiceLocked(vendor.id_vendor, inv)
                                          }
                                          onChange={() =>
                                            toggleInvoice(inv, vendor)
                                          }
                                          title={invoiceCheckTitle(
                                            inv,
                                            vendor.id_vendor,
                                          )}
                                          className="w-4 h-4 accent-violet-600 disabled:opacity-40 disabled:cursor-not-allowed"
                                        />
                                      </td>
                                      <td className="px-3 py-2 text-xs font-medium text-gray-900 whitespace-nowrap">
                                        {inv.no_invoice || '-'}
                                        <TaxBadge
                                          type={getInvoiceTaxType(
                                            inv.no_invoice,
                                          )}
                                        />
                                      </td>
                                      <td className="px-3 py-2 text-xs text-gray-700 whitespace-nowrap">
                                        {inv.no_invoice_vendor || '-'}
                                      </td>
                                      <td className="px-3 py-2 text-xs text-gray-700 whitespace-nowrap">
                                        {inv.no_po || '-'}
                                      </td>
                                      <td className="px-3 py-2 text-xs text-gray-700 whitespace-nowrap">
                                        {inv.no_surat_jalan || '-'}
                                      </td>
                                      <td className="px-3 py-2 text-xs text-gray-700 whitespace-nowrap">
                                        {formatDate(inv.tgl_faktur)}
                                      </td>
                                      <td className="px-3 py-2 text-xs text-gray-700 whitespace-nowrap">
                                        {formatDate(inv.tgl_jatuh_tempo)}
                                      </td>
                                      <td className="px-3 py-2 text-xs text-gray-700 whitespace-nowrap">
                                        {inv.waktu_jatuh_tempo
                                          ? `${inv.waktu_jatuh_tempo} hari`
                                          : '-'}
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
                                        <PaymentBadge
                                          status={inv.status_payment}
                                        />
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>

                          {/* Mobile cards */}
                          <div className="md:hidden divide-y divide-gray-100">
                            {vendor.invoice.map((inv: APInvoiceRow) => (
                              <div
                                key={inv.id}
                                className={`p-3 space-y-2 ${
                                  selected.has(inv.id) ? 'bg-violet-50' : ''
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-start gap-2 min-w-0">
                                    <input
                                      type="checkbox"
                                      checked={selected.has(inv.id)}
                                      disabled={
                                        !isPayable(inv) ||
                                        invoiceLocked(vendor.id_vendor, inv)
                                      }
                                      onChange={() =>
                                        toggleInvoice(inv, vendor)
                                      }
                                      title={invoiceCheckTitle(
                                        inv,
                                        vendor.id_vendor,
                                      )}
                                      className="w-4 h-4 mt-0.5 accent-violet-600 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                                    />
                                    <div className="min-w-0">
                                      <div className="text-sm font-semibold text-gray-900 break-words">
                                        {inv.no_invoice || '-'}
                                        <TaxBadge
                                          type={getInvoiceTaxType(
                                            inv.no_invoice,
                                          )}
                                        />
                                      </div>
                                      {inv.no_invoice_vendor && (
                                        <div className="text-xs text-gray-500 break-words">
                                          Vendor: {inv.no_invoice_vendor}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <PaymentBadge status={inv.status_payment} />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <LabeledValue label="No PO">
                                    {inv.no_po || '-'}
                                  </LabeledValue>
                                  <LabeledValue label="No Surat Jalan">
                                    {inv.no_surat_jalan || '-'}
                                  </LabeledValue>
                                  <LabeledValue label="Tgl Faktur">
                                    {formatDate(inv.tgl_faktur)}
                                  </LabeledValue>
                                  <LabeledValue label="Jatuh Tempo">
                                    {formatDate(inv.tgl_jatuh_tempo)}
                                  </LabeledValue>
                                  <LabeledValue label="Total">
                                    {formatCurrency(inv.total)}
                                  </LabeledValue>
                                  <LabeledValue label="Dibayar">
                                    <span className="text-green-700">
                                      {formatCurrency(inv.paid_amount)}
                                    </span>
                                  </LabeledValue>
                                </div>
                                <div className="flex items-end justify-between gap-2">
                                  <div>
                                    <span className="text-gray-500 text-xs font-medium">
                                      Sisa waktu
                                    </span>
                                    <div className="mt-0.5">
                                      <DueBadge
                                        description={inv.due_description}
                                        waktu={inv.waktu}
                                      />
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-gray-500 text-xs font-medium">
                                      Outstanding
                                    </span>
                                    <div className="text-sm font-bold text-red-600">
                                      {formatCurrency(inv.outstanding_amount)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selection action bar */}
          {selectedList.length > 0 && (
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-2xl bg-white border border-violet-200 shadow-xl rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {lockedVendorName}
                </p>
                <p className="text-xs text-gray-500">
                  {selectedList.length} invoice dipilih ·{' '}
                  <span className="font-semibold text-violet-700">
                    {taxLabel(lockedIsTax ?? false)}
                  </span>{' '}
                  · Outstanding{' '}
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
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-lg"
                >
                  Input Pembayaran
                </button>
              </div>
            </div>
          )}

          {/* Payment modal */}
          {isPaymentOpen &&
            selectedList.length > 0 &&
            lockedVendorId !== null && (
              <PaymentAPModal
                vendorId={lockedVendorId}
                vendorName={lockedVendorName}
                isTax={lockedIsTax ?? false}
                invoices={selectedList.map((s) => s.inv)}
                onClose={() => setIsPaymentOpen(false)}
                onSuccess={handlePaymentSuccess}
              />
            )}
        </>
      )}
    </div>
  );
};

export default ListAP;
