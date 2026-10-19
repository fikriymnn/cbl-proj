import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import type { InvoiceAP, InvoiceAPListResponse, RecapItem } from './types';
import DetailInvoiceAPModal from './DetailInvoiceAPModal';
import SearchableSelect, { SelectOption } from './SearchableSelect';
import { useVendorOptions } from './useVendorOptions';
import {
  ButtonSpinner,
  DueBadge,
  LabeledValue,
  PaginationBar,
  PaymentBadge,
  RecapCards,
  SearchIcon,
  Spinner,
  StatusBadge,
  TaxBadge,
} from './ui';
import {
  API,
  errorMessage,
  formatCurrency,
  formatDate,
  getInvoiceTaxType,
} from './utils';

/**
 * One list for both screens:
 *  - mode="draft"    → status=draft & status_proses=draft  (Request / Detail)
 *  - mode="approval" → status=requested                    (Approve / Reject / Detail)
 */
export type InvoiceAPListMode = 'draft' | 'approval';

const PAYMENT_OPTIONS: SelectOption[] = [
  { value: 'belum lunas', label: 'Belum Lunas' },
  { value: 'lunas', label: 'Lunas' },
];

type ActionKind = 'request' | 'approve' | 'reject';

const ACTIONS: Record<
  ActionKind,
  { path: string; confirm: string; ok: string; fail: string }
> = {
  request: {
    path: 'request',
    confirm: 'Ajukan invoice ini untuk di-approve?',
    ok: 'Invoice request submitted successfully!',
    fail: 'Failed to request invoice.',
  },
  approve: {
    path: 'approve',
    confirm: 'Approve invoice ini?',
    ok: 'Invoice approved successfully!',
    fail: 'Failed to approve invoice.',
  },
  reject: {
    path: 'reject',
    confirm: 'Reject invoice ini?',
    ok: 'Invoice rejected successfully!',
    fail: 'Failed to reject invoice.',
  },
};

const ListInvoiceAP: React.FC<{ mode: InvoiceAPListMode }> = ({ mode }) => {
  const isDraft = mode === 'draft';

  const [loading, setLoading] = useState<boolean>(true);
  const [rows, setRows] = useState<InvoiceAP[]>([]);
  const [recapData, setRecapData] = useState<RecapItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  // Filters
  const [searchInput, setSearchInput] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [idVendor, setIdVendor] = useState<string>('');
  const [statusPayment, setStatusPayment] = useState<string>('');
  const [startFaktur, setStartFaktur] = useState<string>('');
  const [endFaktur, setEndFaktur] = useState<string>('');
  const [startTempo, setStartTempo] = useState<string>('');
  const [endTempo, setEndTempo] = useState<string>('');
  const [activeWaktu, setActiveWaktu] = useState<string | null>(null);

  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceAP | null>(
    null,
  );
  const [processing, setProcessing] = useState<{
    id: number;
    action: ActionKind;
  } | null>(null);

  const { options: vendorOptions, loading: vendorsLoading } =
    useVendorOptions();
  const reqId = useRef<number>(0);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearchTerm(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    fetchInvoices();
    // eslint-disable-next-line
  }, [
    mode,
    page,
    limit,
    searchTerm,
    idVendor,
    statusPayment,
    startFaktur,
    endFaktur,
    startTempo,
    endTempo,
    activeWaktu,
  ]);

  const fetchInvoices = async (): Promise<void> => {
    const id = ++reqId.current;
    try {
      setLoading(true);
      const res: AxiosResponse<InvoiceAPListResponse> = await axios.get(
        `${API}/invoiceAp`,
        {
          params: {
            page,
            limit,
            status: isDraft ? 'draft' : 'requested',
            status_proses: isDraft ? 'draft' : undefined,
            waktu: activeWaktu ?? undefined,
            search: searchTerm || undefined,
            id_vendor: idVendor || undefined,
            start_date_faktur: startFaktur || undefined,
            end_date_faktur: endFaktur || undefined,
            start_date_jatuh_tempo: startTempo || undefined,
            end_date_jatuh_tempo: endTempo || undefined,
            status_payment: statusPayment || undefined,
          },
          withCredentials: true,
        },
      );
      if (id !== reqId.current) return;

      setRows(res.data.data || []);
      setTotalPages(res.data.total_page || 1);

      // Keep the cards stable while a card filter is active
      if (!activeWaktu && Array.isArray(res.data.data_rekap_tenggat)) {
        setRecapData(res.data.data_rekap_tenggat);
      }
    } catch (error) {
      if (id !== reqId.current) return;
      console.error('Error fetching Invoice AP:', error);
      setRows([]);
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  };

  const resetPage = (): void => setPage(1);

  const handleLimitChange = (value: number): void => {
    setLimit(value);
    setPage(1);
  };

  const handleRecapCardClick = (waktu: string): void => {
    setActiveWaktu((prev) => (prev === waktu ? null : waktu));
    resetPage();
  };

  const runAction = async (id: number, action: ActionKind): Promise<void> => {
    const cfg = ACTIONS[action];
    if (!window.confirm(cfg.confirm)) return;
    try {
      setProcessing({ id, action });
      const res = await axios.put(
        `${API}/invoiceAp/${cfg.path}/${id}`,
        {},
        { withCredentials: true },
      );
      if (res.data?.success) {
        alert(cfg.ok);
        fetchInvoices();
      } else {
        alert(`${cfg.fail} Please try again.`);
      }
    } catch (error) {
      console.error(`Error (${action}) invoice AP:`, error);
      alert(`${cfg.fail} ${errorMessage(error)}`);
    } finally {
      setProcessing(null);
    }
  };

  const hasActiveFilter =
    !!searchTerm ||
    !!idVendor ||
    !!statusPayment ||
    !!startFaktur ||
    !!endFaktur ||
    !!startTempo ||
    !!endTempo ||
    !!activeWaktu;

  const resetFilters = (): void => {
    setSearchInput('');
    setSearchTerm('');
    setIdVendor('');
    setStatusPayment('');
    setStartFaktur('');
    setEndFaktur('');
    setStartTempo('');
    setEndTempo('');
    setActiveWaktu(null);
    setPage(1);
  };

  const recapItems = recapData.map((r) => ({
    waktu: r.waktu,
    total_invoice: r.total_invoice,
    amount: r.total_harus_dibayar,
  }));

  // ── Action buttons (shared by table + cards) ──

  const renderActions = (item: InvoiceAP, block: boolean) => {
    const base = block ? 'flex-1 px-3 py-2' : 'px-3 py-1.5';
    const isBusy = processing?.id === item.id;
    const busyLabel = (kind: ActionKind, label: string) =>
      isBusy && processing?.action === kind ? <ButtonSpinner /> : label;

    return (
      <>
        {isDraft && item.status === 'draft' && (
          <button
            onClick={() => runAction(item.id, 'request')}
            disabled={isBusy}
            className={`${base} bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {busyLabel('request', 'Request')}
          </button>
        )}
        {!isDraft && item.status === 'requested' && (
          <>
            <button
              onClick={() => runAction(item.id, 'approve')}
              disabled={isBusy}
              className={`${base} bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {busyLabel('approve', 'Approve')}
            </button>
            <button
              onClick={() => runAction(item.id, 'reject')}
              disabled={isBusy}
              className={`${base} bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {busyLabel('reject', 'Reject')}
            </button>
          </>
        )}
        <button
          onClick={() => setSelectedInvoice(item)}
          className={`${base} ${
            isDraft
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white text-xs font-medium rounded transition-colors`}
        >
          Detail
        </button>
      </>
    );
  };

  const dateInput =
    'w-full py-2 px-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div>
      <RecapCards
        title="Rekap Tenggat Invoice"
        amountLabel="Total"
        items={recapItems}
        activeWaktu={activeWaktu}
        onCardClick={handleRecapCardClick}
      />

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-3 sm:p-4 mb-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
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
            onChange={(v) => {
              setIdVendor(v);
              resetPage();
            }}
            allLabel="Semua Vendor"
            placeholder="Semua Vendor"
            searchPlaceholder="Cari vendor..."
            loading={vendorsLoading}
          />

          <SearchableSelect
            options={PAYMENT_OPTIONS}
            value={statusPayment}
            onChange={(v) => {
              setStatusPayment(v);
              resetPage();
            }}
            allLabel="Semua Status Payment"
            placeholder="Semua Status Payment"
            searchPlaceholder="Cari status..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Tgl Faktur — Dari
            </label>
            <input
              type="date"
              value={startFaktur}
              max={endFaktur || undefined}
              onChange={(e) => {
                setStartFaktur(e.target.value);
                resetPage();
              }}
              className={dateInput}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Tgl Faktur — Sampai
            </label>
            <input
              type="date"
              value={endFaktur}
              min={startFaktur || undefined}
              onChange={(e) => {
                setEndFaktur(e.target.value);
                resetPage();
              }}
              className={dateInput}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Jatuh Tempo — Dari
            </label>
            <input
              type="date"
              value={startTempo}
              max={endTempo || undefined}
              onChange={(e) => {
                setStartTempo(e.target.value);
                resetPage();
              }}
              className={dateInput}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Jatuh Tempo — Sampai
            </label>
            <input
              type="date"
              value={endTempo}
              min={startTempo || undefined}
              onChange={(e) => {
                setEndTempo(e.target.value);
                resetPage();
              }}
              className={dateInput}
            />
          </div>
        </div>

        {(activeWaktu || hasActiveFilter) && (
          <div className="flex flex-wrap items-center gap-2">
            {activeWaktu && (
              <span className="inline-flex items-center gap-2 text-xs bg-blue-50 border border-blue-200 text-blue-700 rounded-full px-3 py-1.5">
                Filter aktif: <strong>{activeWaktu}</strong>
                <button
                  onClick={() => {
                    setActiveWaktu(null);
                    resetPage();
                  }}
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
          </div>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  'No Invoice',
                  'No Invoice Vendor',
                  'No PO',
                  'No Surat Jalan',
                  'Vendor',
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
                    <div className="flex justify-center">
                      <Spinner />
                    </div>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="px-3 py-4 text-center text-gray-500 text-sm"
                  >
                    No data available
                  </td>
                </tr>
              ) : (
                rows.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 font-medium">
                      {item.no_invoice || '-'}
                      <TaxBadge type={getInvoiceTaxType(item.no_invoice)} />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {item.no_invoice_vendor || '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {item.no_po || '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {item.no_surat_jalan || '-'}
                    </td>
                    <td
                      className="px-3 py-2 text-xs text-gray-900 max-w-[180px] truncate"
                      title={item.nama_vendor}
                    >
                      {item.nama_vendor || '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {formatDate(item.tgl_faktur)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs">
                      <DueBadge
                        description={item.due_description}
                        waktu={item.waktu}
                      />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 font-semibold">
                      {formatCurrency(item.total)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs">
                      <PaymentBadge status={item.status_payment} />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs">
                      <div className="flex items-center justify-center gap-2">
                        {renderActions(item, false)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <PaginationBar
          page={page}
          totalPages={totalPages}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={handleLimitChange}
        />
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden space-y-3">
        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : rows.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            No data available
          </div>
        ) : (
          rows.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-gray-900 break-words">
                    {item.no_invoice || '-'}
                    <TaxBadge type={getInvoiceTaxType(item.no_invoice)} />
                  </div>
                  <div className="text-xs text-gray-600 mt-0.5 break-words">
                    {item.nama_vendor || '-'}
                  </div>
                </div>
                <StatusBadge status={item.status} />
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <LabeledValue label="No Invoice Vendor">
                    {item.no_invoice_vendor || '-'}
                  </LabeledValue>
                  <LabeledValue label="No PO">{item.no_po || '-'}</LabeledValue>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <LabeledValue label="No Surat Jalan">
                    {item.no_surat_jalan || '-'}
                  </LabeledValue>
                  <LabeledValue label="Tgl Faktur">
                    {formatDate(item.tgl_faktur)}
                  </LabeledValue>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <LabeledValue label="Total">
                    <span className="font-semibold">
                      {formatCurrency(item.total)}
                    </span>
                  </LabeledValue>
                  <div>
                    <span className="text-gray-500 text-xs font-medium">
                      Status Payment
                    </span>
                    <div className="mt-1">
                      <PaymentBadge status={item.status_payment} />
                    </div>
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 text-xs font-medium">
                    Jatuh Tempo
                  </span>
                  <div className="mt-1">
                    <DueBadge
                      description={item.due_description}
                      waktu={item.waktu}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-gray-200">
                  {renderActions(item, true)}
                </div>
              </div>
            </div>
          ))
        )}

        <PaginationBar
          page={page}
          totalPages={totalPages}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={handleLimitChange}
        />
      </div>

      {selectedInvoice && (
        <DetailInvoiceAPModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onUpdated={fetchInvoices}
        />
      )}
    </div>
  );
};

export default ListInvoiceAP;
