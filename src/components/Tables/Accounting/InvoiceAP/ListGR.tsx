import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import type { GoodReceipt, GoodReceiptResponse } from './types';
import SearchableSelect, { SelectOption } from './SearchableSelect';
import { useVendorOptions } from './useVendorOptions';
import {
  LabeledValue,
  PaginationBar,
  SearchIcon,
  Spinner,
  TaxBadge,
} from './ui';
import { API, formatCurrency, formatDate, formatQty } from './utils';

/**
 * Plain Good Receipt list (read-only). Shows every GR; the invoice status can
 * be filtered. Invoice creation lives in ListOutstandingGR.
 */

const INVOICE_STATUS_OPTIONS: SelectOption[] = [
  { value: 'false', label: 'Belum Diinvoice' },
  { value: 'true', label: 'Sudah Diinvoice' },
];

const InvoiceStatusBadge: React.FC<{ created: boolean }> = ({ created }) => (
  <span
    className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
      created ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
    }`}
  >
    {created ? 'SUDAH DIINVOICE' : 'BELUM DIINVOICE'}
  </span>
);

const ListGR: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [rows, setRows] = useState<GoodReceipt[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  // Filters
  const [searchInput, setSearchInput] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [idVendor, setIdVendor] = useState<string>('');
  const [invoiceStatus, setInvoiceStatus] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

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
    fetchGR();
    // eslint-disable-next-line
  }, [page, limit, searchTerm, idVendor, invoiceStatus, startDate, endDate]);

  const fetchGR = async (): Promise<void> => {
    const id = ++reqId.current;
    try {
      setLoading(true);
      const res: AxiosResponse<GoodReceiptResponse> = await axios.get(
        `${API}/goodReceipt`,
        {
          params: {
            page,
            limit,
            start_date: startDate || undefined,
            end_date: endDate || undefined,
            search: searchTerm || undefined,
            id_vendor: idVendor || undefined,
            // '' = all, 'true' / 'false' = filter
            is_created_invoice: invoiceStatus || undefined,
          },
          withCredentials: true,
        },
      );
      if (id !== reqId.current) return;
      setRows(res.data.data || []);
      setTotalPages(res.data.total_page || 1);
    } catch (error) {
      if (id !== reqId.current) return;
      console.error('Error fetching Good Receipt:', error);
      setRows([]);
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  };

  const handleLimitChange = (value: number): void => {
    setLimit(value);
    setPage(1);
  };

  const hasActiveFilter =
    !!searchTerm || !!idVendor || !!invoiceStatus || !!startDate || !!endDate;

  const resetFilters = (): void => {
    setSearchInput('');
    setSearchTerm('');
    setIdVendor('');
    setInvoiceStatus('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const dateInput =
    'w-full py-2 px-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div>
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-3 sm:p-4 mb-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by No GR, PO, Surat Jalan, Item..."
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
              setPage(1);
            }}
            allLabel="Semua Vendor"
            placeholder="Semua Vendor"
            searchPlaceholder="Cari vendor..."
            loading={vendorsLoading}
          />

          <SearchableSelect
            options={INVOICE_STATUS_OPTIONS}
            value={invoiceStatus}
            onChange={(v) => {
              setInvoiceStatus(v);
              setPage(1);
            }}
            allLabel="Semua Status Invoice"
            placeholder="Semua Status Invoice"
            searchPlaceholder="Cari status..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Tgl GR — Dari
            </label>
            <input
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className={dateInput}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Tgl GR — Sampai
            </label>
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className={dateInput}
            />
          </div>
        </div>

        {hasActiveFilter && (
          <div>
            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-gray-500 hover:text-gray-800 underline"
            >
              Reset semua filter
            </button>
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
                  'No GR',
                  'No PO',
                  'No Surat Jalan',
                  'Vendor',
                  'Item',
                  'Qty',
                  'Harga',
                  'Total',
                  'Tgl GR',
                  'Status Invoice',
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
                  <td colSpan={10} className="px-3 py-4 text-center">
                    <div className="flex justify-center">
                      <Spinner />
                    </div>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-3 py-4 text-center text-gray-500 text-sm"
                  >
                    No data available
                  </td>
                </tr>
              ) : (
                rows.map((gr) => (
                  <tr key={gr.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 font-medium">
                      {gr.no_good_receipt || '-'}
                      <TaxBadge type={gr.is_ppn ? 'tax' : 'non_tax'} />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {gr.no_purchase_order || '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {gr.no_surat_jalan || '-'}
                    </td>
                    <td
                      className="px-3 py-2 text-xs text-gray-900 max-w-[180px] truncate"
                      title={gr.nama_vendor}
                    >
                      {gr.nama_vendor || '-'}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-900 max-w-[240px]">
                      <div className="truncate" title={gr.nama_item}>
                        {gr.nama_item || '-'}
                      </div>
                      {gr.tipe_barang && (
                        <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-gray-100 rounded text-[10px] text-gray-700 capitalize">
                          {gr.tipe_barang}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {formatQty(gr.qty)} {gr.satuan}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {formatCurrency(gr.harga)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 font-semibold">
                      {formatCurrency(gr.total)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {formatDate(gr.tgl_action)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs">
                      <InvoiceStatusBadge created={!!gr.is_created_invoice} />
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
          rows.map((gr) => (
            <div key={gr.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-gray-900 break-words">
                    {gr.no_good_receipt || '-'}
                    <TaxBadge type={gr.is_ppn ? 'tax' : 'non_tax'} />
                  </div>
                  <div className="text-xs text-gray-600 mt-0.5 break-words">
                    {gr.nama_vendor || '-'}
                  </div>
                </div>
                <InvoiceStatusBadge created={!!gr.is_created_invoice} />
              </div>

              <div className="space-y-2">
                <LabeledValue label="Item">
                  {gr.nama_item || '-'}
                  {gr.tipe_barang && (
                    <span className="ml-1.5 px-1.5 py-0.5 bg-gray-100 rounded text-[10px] text-gray-700 capitalize">
                      {gr.tipe_barang}
                    </span>
                  )}
                </LabeledValue>
                <div className="grid grid-cols-2 gap-2">
                  <LabeledValue label="No PO">
                    {gr.no_purchase_order || '-'}
                  </LabeledValue>
                  <LabeledValue label="No Surat Jalan">
                    {gr.no_surat_jalan || '-'}
                  </LabeledValue>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <LabeledValue label="Qty">
                    {formatQty(gr.qty)} {gr.satuan}
                  </LabeledValue>
                  <LabeledValue label="Harga">
                    {formatCurrency(gr.harga)}
                  </LabeledValue>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <LabeledValue label="Total">
                    <span className="font-semibold">
                      {formatCurrency(gr.total)}
                    </span>
                  </LabeledValue>
                  <LabeledValue label="Tgl GR">
                    {formatDate(gr.tgl_action)}
                  </LabeledValue>
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
    </div>
  );
};

export default ListGR;
