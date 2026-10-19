import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import type { GoodReceipt, GoodReceiptResponse } from './types';
import CreateInvoiceAPModal from './CreateInvoiceAPModal';
import SearchableSelect from './SearchableSelect';
import { useVendorOptions } from './useVendorOptions';
import {
  PaginationBar,
  SearchIcon,
  Spinner,
  TaxBadge,
  LabeledValue,
} from './ui';
import { API, formatCurrency, formatDate, formatQty } from './utils';

/**
 * Outstanding GR = Good Receipts that have not been invoiced yet
 * (is_created_invoice = false is always applied). A GR leaves this list
 * automatically once an invoice is created for it.
 */

const grTaxType = (gr: GoodReceipt) => (gr.is_ppn ? 'tax' : 'non_tax');

const ListOutstandingGR: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [rows, setRows] = useState<GoodReceipt[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  // Filters
  const [searchInput, setSearchInput] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [idVendor, setIdVendor] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Selection survives page changes; locked to ONE vendor and ONE tax type
  const [selected, setSelected] = useState<Map<number, GoodReceipt>>(new Map());
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const { options: vendorOptions, loading: vendorsLoading } =
    useVendorOptions();
  const reqId = useRef<number>(0);

  // Debounce the search box
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
  }, [page, limit, searchTerm, idVendor, startDate, endDate]);

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
            is_created_invoice: false, // outstanding = not invoiced yet
          },
          withCredentials: true,
        },
      );
      if (id !== reqId.current) return; // a newer request superseded this one
      setRows(res.data.data || []);
      setTotalPages(res.data.total_page || 1);
    } catch (error) {
      if (id !== reqId.current) return;
      console.error('Error fetching outstanding Good Receipt:', error);
      setRows([]);
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  };

  const clearSelection = (): void => setSelected(new Map());

  const handleLimitChange = (value: number): void => {
    setLimit(value);
    setPage(1);
  };

  // ── Selection ──

  const selectedList = Array.from(selected.values());
  const lockedVendorId =
    selectedList.length > 0 ? selectedList[0].id_vendor : null;
  const lockedTax = selectedList.length > 0 ? grTaxType(selectedList[0]) : null;
  const selectedTotal = selectedList.reduce(
    (sum, g) => sum + Number(g.total ?? 0),
    0,
  );

  const disabledReason = (gr: GoodReceipt): string => {
    if (lockedVendorId !== null && lockedVendorId !== gr.id_vendor)
      return 'Hanya bisa memilih GR dari satu vendor';
    if (lockedTax !== null && lockedTax !== grTaxType(gr))
      return 'GR Tax dan Non Tax tidak bisa digabung dalam satu invoice';
    return '';
  };

  const toggleGR = (gr: GoodReceipt): void => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(gr.id)) {
        next.delete(gr.id);
        return next;
      }
      const first = prev.size > 0 ? Array.from(prev.values())[0] : null;
      if (first && first.id_vendor !== gr.id_vendor) return prev;
      if (first && grTaxType(first) !== grTaxType(gr)) return prev;
      next.set(gr.id, gr);
      return next;
    });
  };

  const handleCreated = (): void => {
    setIsModalOpen(false);
    clearSelection();
    fetchGR(); // the invoiced GRs disappear from this list automatically
  };

  const resetFilters = (): void => {
    setSearchInput('');
    setSearchTerm('');
    setIdVendor('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };
  const hasActiveFilter =
    !!searchTerm || !!idVendor || !!startDate || !!endDate;

  return (
    <div className={selectedList.length > 0 ? 'pb-28 sm:pb-24' : ''}>
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-3 sm:p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative lg:col-span-2">
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

          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 whitespace-nowrap">
              Dari
            </label>
            <input
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
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
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {hasActiveFilter && (
          <div className="mt-3">
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
                <th className="px-3 py-2 w-8"></th>
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
                rows.map((gr) => {
                  const isSelected = selected.has(gr.id);
                  const reason = disabledReason(gr);
                  return (
                    <tr
                      key={gr.id}
                      className={`${
                        isSelected ? 'bg-green-50' : 'hover:bg-gray-50'
                      } ${reason ? 'opacity-50' : ''}`}
                    >
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={!!reason}
                          title={reason || 'Pilih untuk dibuatkan invoice'}
                          onChange={() => toggleGR(gr)}
                          className="w-4 h-4 accent-blue-600 disabled:cursor-not-allowed"
                        />
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 font-medium">
                        {gr.no_good_receipt || '-'}
                        <TaxBadge type={grTaxType(gr)} />
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
                    </tr>
                  );
                })
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
          rows.map((gr) => {
            const isSelected = selected.has(gr.id);
            const reason = disabledReason(gr);
            return (
              <div
                key={gr.id}
                className={`bg-white rounded-lg shadow p-4 ${
                  isSelected ? 'ring-2 ring-green-300' : ''
                } ${reason ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={!!reason}
                    onChange={() => toggleGR(gr)}
                    className="w-5 h-5 mt-0.5 accent-blue-600 disabled:cursor-not-allowed"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-gray-900 break-words">
                      {gr.no_good_receipt || '-'}
                      <TaxBadge type={grTaxType(gr)} />
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5 break-words">
                      {gr.nama_vendor || '-'}
                    </div>
                  </div>
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
            );
          })
        )}

        <PaginationBar
          page={page}
          totalPages={totalPages}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={handleLimitChange}
        />
      </div>

      {/* Selection action bar */}
      {selectedList.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-2xl bg-white border border-blue-200 shadow-xl rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">
              {selectedList[0].nama_vendor}
              <TaxBadge type={lockedTax} />
            </p>
            <p className="text-xs text-gray-500">
              {selectedList.length} GR dipilih · Total{' '}
              <span className="font-semibold text-blue-600">
                {formatCurrency(selectedTotal)}
              </span>
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={clearSelection}
              className="flex-1 sm:flex-none px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg"
            >
              Batal pilih
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg"
            >
              Buat Invoice
            </button>
          </div>
        </div>
      )}

      {isModalOpen && selectedList.length > 0 && (
        <CreateInvoiceAPModal
          receipts={selectedList}
          onClose={() => setIsModalOpen(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
};

export default ListOutstandingGR;
