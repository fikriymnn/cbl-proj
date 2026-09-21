// ListBuktiBayar.tsx
import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { Pagination, Stack } from '@mui/material';
import DetailBuktiBayarModal, { PaymentLog } from './DetailBuktiBayarModal';

interface PaymentResponse {
  status: number;
  success: boolean;
  data: PaymentLog[];
  total_data?: number;
  total_page?: number;
}

const toNum = (v: number | string | null | undefined): number => {
  const n = Number(v ?? 0);
  return isNaN(n) ? 0 : n;
};

const formatCurrency = (v: number | string | null | undefined): string =>
  `Rp ${toNum(v).toLocaleString('id-ID')}`;

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
};

const customerNameOf = (p: PaymentLog): string =>
  p.payment_details?.[0]?.invoice?.nama_customer ??
  `Customer #${p.customer_id}`;

const ListBuktiBayar: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [payments, setPayments] = useState<PaymentLog[]>([]);
  const [totalData, setTotalData] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Filters (query params of GET /invoice/payment)
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [customerId, setCustomerId] = useState<string>('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Customer dropdown options — collected from results while no customer filter is set
  const [customerOptions, setCustomerOptions] = useState<
    { id: number; nama: string }[]
  >([]);

  const [selectedPayment, setSelectedPayment] = useState<PaymentLog | null>(
    null,
  );

  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line
  }, [page, limit, searchTerm, startDate, endDate, customerId]);

  const fetchPayments = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/invoice/payment`;
    try {
      setLoading(true);

      const res: AxiosResponse<PaymentResponse> = await axios.get(url, {
        params: {
          page,
          limit,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
          search: searchTerm || undefined,
          customer_id: customerId || undefined,
        },
        withCredentials: true,
      });

      console.log('Fetched payment logs:', res.data);

      const list = Array.isArray(res.data.data) ? res.data.data : [];
      setPayments(list);
      setTotalPages(res.data.total_page || 1);
      setTotalData(res.data.total_data ?? list.length);

      if (!customerId) {
        setCustomerOptions((prev) => {
          const map = new Map(prev.map((c) => [c.id, c.nama]));
          list.forEach((p) => map.set(p.customer_id, customerNameOf(p)));
          return Array.from(map, ([id, nama]) => ({ id, nama })).sort((a, b) =>
            a.nama.localeCompare(b.nama),
          );
        });
      }
    } catch (error) {
      console.error('Error fetching payment logs:', error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (val: string): void => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchTerm(val);
      setPage(1);
    }, 400);
  };

  const handleLimitChange = (newLimit: number): void => {
    setLimit(newLimit);
    setPage(1);
  };

  const hasActiveFilter =
    !!searchTerm || !!startDate || !!endDate || !!customerId;

  const resetFilters = (): void => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setCustomerId('');
    setPage(1);
    const el = document.getElementById('bb-search') as HTMLInputElement | null;
    if (el) el.value = '';
  };

  return (
    <div>
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-3 sm:p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative lg:col-span-2">
            <input
              id="bb-search"
              type="text"
              placeholder="Search by No Bukti Bayar, Invoice, Customer..."
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
            value={customerId}
            onChange={(e) => {
              setCustomerId(e.target.value);
              setPage(1);
            }}
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

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-700">Log Bukti Bayar</h3>
          <span className="text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
            {totalData.toLocaleString('id-ID')} data
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  'No Bukti Bayar',
                  'Tgl Bayar',
                  'Customer',
                  'Metode',
                  'Bank',
                  'Invoice',
                  'Total Bayar',
                  'Dibuat Oleh',
                  'Bukti',
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
              ) : payments.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-3 py-4 text-center text-gray-500 text-sm"
                  >
                    No data available
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  const count = p.payment_details?.length ?? 0;
                  return (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 font-medium">
                        {p.receipt_number || '-'}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                        {formatDate(p.payment_date)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                        {customerNameOf(p)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 capitalize">
                        {p.payment_method || '-'}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                        {p.bank || '-'}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs">
                        <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                          {count} invoice
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-green-700 font-semibold">
                        {formatCurrency(p.payment_amount)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                        {p.created_user?.nama || '-'}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs">
                        {p.payment_proof ? (
                          <span className="text-[10px] font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                            Ada
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            Tidak ada
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => setSelectedPayment(p)}
                            className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
                          >
                            Detail
                          </button>
                        </div>
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

      {/* Detail modal — receives the row directly */}
      {selectedPayment && (
        <DetailBuktiBayarModal
          payment={selectedPayment}
          isOpen={!!selectedPayment}
          onClose={() => setSelectedPayment(null)}
        />
      )}
    </div>
  );
};

export default ListBuktiBayar;
