import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { Pagination, Stack } from '@mui/material';
import SearchableSelect from './SearchableSelect';
import { useVendorOptions } from './useVendorOptions';
import { SearchIcon, Spinner } from './ui';
import { formatCurrency, formatDate } from './utils';

/* =============================================================================
 * Bukti Bayar AP  —  GET /invoiceAp/payment
 *   params: page, limit, start_date, end_date, search, vendor_id
 *
 * mode="view"    : list + Detail            (tab "Bukti Bayar" di ListAP)
 * mode="approve" : list + Detail + Approve  (tab "Pembelian" di halaman approving)
 *                  PUT /invoiceAp/payment/approve/:id
 * ========================================================================== */

const API = import.meta.env.VITE_API_LINK as string;

// URL gambar bukti bayar — sesuaikan dengan cara ListBuktiBayar (AR) menampilkan
// file bukti di project Anda.
const proofUrl = (file: string): string => `${API}/images/${file}`;

type Num = number | string | null | undefined;

// ─── Types ────────────────────────────────────────────────────────────────────

interface APPaymentCost {
  id: number;
  name: string;
  amount: Num;
  note: string | null;
}

interface APPaymentDetail {
  id: number;
  invoice_ap_payment_id: number;
  invoice_ap_id: number;
  payment_amount: Num;
  invoice_ap?: {
    id: number;
    no_invoice: string;
    no_invoice_vendor?: string | null;
    nama_vendor?: string;
    total: Num;
    balance_due: Num;
    paid_amount: Num;
    status_payment: string;
    tgl_pelunasan?: string | null;
  };
  additional_costs?: APPaymentCost[];
}

interface APPayment {
  id: number;
  vendor_id: number;
  receipt_number: string;
  payment_amount: Num;
  payment_amount_use: Num;
  payment_proof?: string | null;
  payment_date: string;
  payment_method: string;
  bank: string;
  account_number: string;
  note: string | null;
  status: string;
  createdAt: string;
  vendor?: { id: number; nama_vendor: string } | null;
  created_user?: { id: number; nama: string } | null;
  approved_user?: { id: number; nama: string } | null;
  payment_details?: APPaymentDetail[];
}

interface APPaymentResponse {
  status: number;
  success: boolean;
  data: APPayment[];
  total_data?: number;
  total_page?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toNum = (v: Num): number => {
  const n = Number(v ?? 0);
  return isNaN(n) ? 0 : n;
};

// Approve hanya untuk pembayaran yang belum approved / rejected.
const isApprovable = (status: string): boolean =>
  !['approved', 'rejected'].includes((status || '').toLowerCase());

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colors: { [key: string]: string } = {
    approved: 'bg-green-100 text-green-800',
    requested: 'bg-blue-100 text-blue-800',
    pending: 'bg-yellow-100 text-yellow-800',
    draft: 'bg-gray-100 text-gray-800',
    rejected: 'bg-red-100 text-red-800',
  };
  return (
    <span
      className={`px-2 py-1 rounded-full text-[10px] font-medium whitespace-nowrap ${
        colors[(status || '').toLowerCase()] || 'bg-gray-100 text-gray-800'
      }`}
    >
      {(status || '-').toUpperCase()}
    </span>
  );
};

const InvoiceSummary: React.FC<{ details?: APPaymentDetail[] }> = ({
  details,
}) => {
  const list = details ?? [];
  if (list.length === 0) return <span>-</span>;
  const shown = list.slice(0, 2);
  return (
    <div className="space-y-0.5">
      {shown.map((d) => (
        <div key={d.id} className="whitespace-nowrap">
          {d.invoice_ap?.no_invoice || `#${d.invoice_ap_id}`}
        </div>
      ))}
      {list.length > shown.length && (
        <div className="text-[10px] text-gray-400">
          +{list.length - shown.length} invoice lainnya
        </div>
      )}
    </div>
  );
};

// ─── Detail Modal ─────────────────────────────────────────────────────────────

const DetailModal: React.FC<{
  payment: APPayment;
  canApprove: boolean;
  approving: boolean;
  onApprove: () => void;
  onClose: () => void;
}> = ({ payment: p, canApprove, approving, onApprove, onClose }) => {
  const details = p.payment_details ?? [];
  const totalCosts = details.reduce(
    (s, d) =>
      s + (d.additional_costs ?? []).reduce((a, c) => a + toNum(c.amount), 0),
    0,
  );
  const sisa = toNum(p.payment_amount) - toNum(p.payment_amount_use);

  const Info = ({
    label,
    children,
  }: {
    label: string;
    children: React.ReactNode;
  }) => (
    <div>
      <div className="text-gray-400 text-[11px]">{label}</div>
      <div className="text-gray-900 text-xs break-words">{children}</div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3"
      onClick={() => !approving && onClose()}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b bg-gray-50">
          <div className="min-w-0">
            <h3 className="text-base font-bold text-gray-900 break-words">
              {p.receipt_number || '-'}
            </h3>
            <p className="text-xs text-gray-500 truncate">
              {p.vendor?.nama_vendor || '-'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={p.status} />
            <button
              onClick={onClose}
              disabled={approving}
              className="text-2xl leading-none font-bold text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3">
            <Info label="Tgl Bayar">{formatDate(p.payment_date)}</Info>
            <Info label="Metode">
              <span className="capitalize">{p.payment_method || '-'}</span>
            </Info>
            <Info label="Bank">{p.bank || '-'}</Info>
            <Info label="No. Rekening">{p.account_number || '-'}</Info>
            <Info label="Nominal Bayar">
              <b>{formatCurrency(p.payment_amount)}</b>
            </Info>
            <Info label="Terpakai">{formatCurrency(p.payment_amount_use)}</Info>
            <Info label="Sisa">{formatCurrency(sisa)}</Info>
            <Info label="Biaya Tambahan">{formatCurrency(totalCosts)}</Info>
            <Info label="Dibuat oleh">{p.created_user?.nama || '-'}</Info>
            <Info label="Disetujui oleh">{p.approved_user?.nama || '-'}</Info>
            <Info label="Tgl Input">{formatDate(p.createdAt)}</Info>
            <Info label="Catatan">{p.note || '-'}</Info>
          </div>

          {/* Bukti */}
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">
              Bukti Pembayaran
            </p>
            {p.payment_proof ? (
              <a
                href={proofUrl(p.payment_proof)}
                target="_blank"
                rel="noreferrer"
                className="inline-block"
                title="Buka di tab baru"
              >
                <img
                  src={proofUrl(p.payment_proof)}
                  alt="Bukti pembayaran"
                  className="max-h-48 rounded-lg border border-gray-200 hover:opacity-80 transition-opacity"
                />
              </a>
            ) : (
              <p className="text-xs text-gray-400">Tidak ada bukti.</p>
            )}
          </div>

          {/* Invoice */}
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">
              Invoice yang Dibayar ({details.length})
            </p>
            <div className="space-y-3">
              {details.map((d) => {
                const costs = d.additional_costs ?? [];
                const inv = d.invoice_ap;
                return (
                  <div
                    key={d.id}
                    className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-900 break-words">
                          {inv?.no_invoice || `#${d.invoice_ap_id}`}
                        </div>
                        {inv?.no_invoice_vendor && (
                          <div className="text-[11px] text-gray-500 break-words">
                            Vendor: {inv.no_invoice_vendor}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 text-right">
                        Dialokasikan:{' '}
                        <b className="text-gray-900">
                          {formatCurrency(d.payment_amount)}
                        </b>
                      </div>
                    </div>

                    {inv && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-[11px]">
                        <div>
                          <div className="text-gray-400">Total Invoice</div>
                          <div className="text-gray-800">
                            {formatCurrency(inv.total)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-400">Sudah Dibayar</div>
                          <div className="text-green-700">
                            {formatCurrency(inv.paid_amount)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-400">Status</div>
                          <div className="text-gray-800 uppercase">
                            {inv.status_payment || '-'}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-400">Tgl Pelunasan</div>
                          <div className="text-gray-800">
                            {formatDate(inv.tgl_pelunasan)}
                          </div>
                        </div>
                      </div>
                    )}

                    {costs.length > 0 && (
                      <div className="mt-2 border-t border-gray-200 pt-2">
                        <div className="text-[11px] font-semibold text-gray-600 mb-1">
                          Biaya Tambahan
                        </div>
                        {costs.map((c) => (
                          <div
                            key={c.id}
                            className="flex justify-between text-xs text-gray-700"
                          >
                            <span>
                              {c.name}
                              {c.note ? (
                                <span className="text-gray-400">
                                  {' '}
                                  ({c.note})
                                </span>
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
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t bg-gray-50 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={approving}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
          >
            Tutup
          </button>
          {canApprove && (
            <button
              onClick={onApprove}
              disabled={approving}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {approving ? 'Processing...' : 'Approve'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ListBuktiBayarAP: React.FC<{ mode?: 'view' | 'approve' }> = ({
  mode = 'view',
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<APPayment[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalData, setTotalData] = useState<number>(0);

  // Filters
  const [searchInput, setSearchInput] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [vendorId, setVendorId] = useState<string>('');

  const [detail, setDetail] = useState<APPayment | null>(null);
  const [approvingId, setApprovingId] = useState<number | null>(null);

  const { options: vendorOptions, loading: vendorsLoading } =
    useVendorOptions();
  const reqId = useRef<number>(0);
  const canApproveMode = mode === 'approve';

  useEffect(() => {
    const t = setTimeout(() => {
      setSearchTerm(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [page, limit, searchTerm, startDate, endDate, vendorId]);

  const fetchData = async (): Promise<void> => {
    const id = ++reqId.current;
    try {
      setLoading(true);
      const res: AxiosResponse<APPaymentResponse> = await axios.get(
        `${API}/invoiceAp/payment`,
        {
          params: {
            page,
            limit,
            start_date: startDate || undefined,
            end_date: endDate || undefined,
            search: searchTerm || undefined,
            vendor_id: vendorId || undefined,
          },
          withCredentials: true,
        },
      );
      if (id !== reqId.current) return;
      setData(Array.isArray(res.data.data) ? res.data.data : []);
      setTotalPages(res.data.total_page || 1);
      setTotalData(res.data.total_data || 0);
    } catch (error) {
      if (id !== reqId.current) return;
      console.error('Error fetching AP payments:', error);
      setData([]);
      setTotalPages(1);
      setTotalData(0);
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  };

  const handleApprove = async (p: APPayment): Promise<void> => {
    if (!window.confirm(`Approve pembayaran ${p.receipt_number}?`)) return;
    try {
      setApprovingId(p.id);
      const res = await axios.put(
        `${API}/invoiceAp/payment/approve/${p.id}`,
        {},
        { withCredentials: true },
      );
      if (res.data?.success === false) {
        alert(res.data?.message || 'Gagal approve pembayaran.');
        return;
      }
      alert('Pembayaran berhasil di-approve!');
      setDetail(null);
      fetchData();
    } catch (error: any) {
      console.error('Error approving payment:', error);
      alert(
        error?.response?.data?.message ||
          'Error approving payment. Please try again.',
      );
    } finally {
      setApprovingId(null);
    }
  };

  const handleLimitChange = (n: number): void => {
    setLimit(n);
    setPage(1);
  };

  const hasActiveFilter =
    !!searchInput || !!startDate || !!endDate || !!vendorId;

  const resetFilters = (): void => {
    setSearchInput('');
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setVendorId('');
    setPage(1);
  };

  const renderActions = (p: APPayment, full = false) => (
    <div className={`flex gap-2 ${full ? '' : 'justify-center'}`}>
      {canApproveMode && isApprovable(p.status) && (
        <button
          onClick={() => handleApprove(p)}
          disabled={approvingId === p.id}
          className={`${
            full ? 'flex-1 py-2' : 'py-1.5'
          } px-3 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors disabled:opacity-50`}
        >
          {approvingId === p.id ? 'Processing...' : 'Approve'}
        </button>
      )}
      <button
        onClick={() => setDetail(p)}
        className={`${
          full ? 'flex-1 py-2' : 'py-1.5'
        } px-3 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors`}
      >
        Detail
      </button>
    </div>
  );

  const pagination = (
    <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 mt-4 pb-4 px-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Rows per page:</span>
        <div className="flex gap-2">
          {[10, 25, 50, 100].map((n) => (
            <button
              key={n}
              onClick={() => handleLimitChange(n)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                limit === n
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {n}
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
  );

  return (
    <div>
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-3 sm:p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative lg:col-span-2">
            <input
              type="text"
              placeholder="Search by No Kwitansi, Vendor, Bank..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
            <SearchIcon />
          </div>

          <SearchableSelect
            options={vendorOptions}
            value={vendorId}
            onChange={(v: string) => {
              setVendorId(v);
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

        <div className="flex flex-wrap items-center gap-3 mt-3">
          {hasActiveFilter && (
            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-gray-500 hover:text-gray-800 underline"
            >
              Reset semua filter
            </button>
          )}
          <span className="ml-auto text-xs text-gray-500">
            {totalData.toLocaleString('id-ID')} bukti bayar
          </span>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  ['No Kwitansi', 'left'],
                  ['Vendor', 'left'],
                  ['Invoice', 'left'],
                  ['Tgl Bayar', 'left'],
                  ['Metode / Bank', 'left'],
                  ['Nominal', 'right'],
                  ['Terpakai', 'right'],
                  ['Dibuat Oleh', 'left'],
                  ['Status', 'left'],
                  ['Actions', 'center'],
                ].map(([h, align]) => (
                  <th
                    key={h}
                    className={`px-3 py-2 text-${align} text-xs font-medium text-gray-500 uppercase whitespace-nowrap`}
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
                    <div className="flex justify-center">
                      <Spinner />
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-3 py-4 text-center text-gray-500 text-sm"
                  >
                    No data available
                  </td>
                </tr>
              ) : (
                data.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-xs font-semibold text-gray-900 whitespace-nowrap">
                      {p.receipt_number || '-'}
                    </td>
                    <td
                      className="px-3 py-2 text-xs text-gray-900 max-w-[180px] break-words"
                      title={p.vendor?.nama_vendor}
                    >
                      {p.vendor?.nama_vendor || '-'}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-700">
                      <InvoiceSummary details={p.payment_details} />
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-900 whitespace-nowrap">
                      {formatDate(p.payment_date)}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-700 whitespace-nowrap">
                      <div className="capitalize">
                        {p.payment_method || '-'}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {p.bank || '-'}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-xs text-right font-semibold text-gray-900 whitespace-nowrap">
                      {formatCurrency(p.payment_amount)}
                    </td>
                    <td className="px-3 py-2 text-xs text-right text-gray-700 whitespace-nowrap">
                      {formatCurrency(p.payment_amount_use)}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-700 whitespace-nowrap">
                      {p.created_user?.nama || '-'}
                    </td>
                    <td className="px-3 py-2">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-3 py-2">{renderActions(p)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {pagination}
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden space-y-3">
        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : data.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            No data available
          </div>
        ) : (
          data.map((p) => (
            <div key={p.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start gap-2 mb-3">
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-gray-900 break-words">
                    {p.receipt_number || '-'}
                  </div>
                  <div className="text-xs text-gray-600 mt-0.5">
                    {p.vendor?.nama_vendor || '-'}
                  </div>
                </div>
                <StatusBadge status={p.status} />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div>
                  <span className="text-gray-500 font-medium">Tgl Bayar</span>
                  <div className="text-gray-900">
                    {formatDate(p.payment_date)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 font-medium">
                    Metode / Bank
                  </span>
                  <div className="text-gray-900 capitalize">
                    {p.payment_method || '-'} · {p.bank || '-'}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 font-medium">Nominal</span>
                  <div className="text-gray-900 font-semibold">
                    {formatCurrency(p.payment_amount)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 font-medium">Terpakai</span>
                  <div className="text-gray-900">
                    {formatCurrency(p.payment_amount_use)}
                  </div>
                </div>
                <div className="col-span-2 text-gray-700">
                  <span className="text-gray-500 font-medium">Invoice</span>
                  <InvoiceSummary details={p.payment_details} />
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200">
                {renderActions(p, true)}
              </div>
            </div>
          ))
        )}
        {pagination}
      </div>

      {detail && (
        <DetailModal
          payment={detail}
          canApprove={canApproveMode && isApprovable(detail.status)}
          approving={approvingId === detail.id}
          onApprove={() => handleApprove(detail)}
          onClose={() => setDetail(null)}
        />
      )}
    </div>
  );
};

export default ListBuktiBayarAP;
