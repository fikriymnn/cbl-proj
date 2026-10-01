import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { Pagination, Stack } from '@mui/material';
import DetailBuktiBayarModal, {
  PaymentLog,
} from './Invoice/DetailBuktiBayarModal';

/* =============================================================================
 * Halaman Deposit Approval (1 file)
 *  Tab 1 (default) : Deposit dari Bukti Lebih Bayar  → GET /invoice/payment
 *  Tab 2           : Deposit Manual                  → GET /deposit
 *  Tiap tab punya sub tab: Outstanding (requested) & History (approved)
 * ========================================================================== */

// ─── Types ────────────────────────────────────────────────────────────────────

type Mode = 'outstanding' | 'history';
type MainTab = 'lebih-bayar' | 'manual';

interface User {
  id: number;
  nama: string;
  email: string;
}

interface Customer {
  id: number;
  nama_customer: string;
  alamat_kantor: string;
  email: string;
  fax: string;
  id_harga_pengiriman: number | null;
  id_marketing: number | null;
  is_active: boolean;
  is_customer_kanban: boolean;
  kode_marketing: string;
  kontak_person: string;
  no_legalitas: string | null;
  npwp: string;
  saldo: number;
  telepon: string;
  toleransi_pengiriman: string;
  top_faktur: string;
  createdAt: string;
  updatedAt: string;
}

interface DepositItem {
  id: number;
  id_customer: number;
  id_create: number;
  id_approve: number | null;
  id_reject: number | null;
  no_deposit: string;
  cara_bayar: string;
  keterangan: string;
  billing_address: string;
  tgl_faktur: string;
  nominal: number;
  note: string;
  status: string;
  status_proses: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  user_create?: User;
  user_approve?: User;
  user_reject?: User;
}

interface DepositResponse {
  data: DepositItem[];
  status: number;
  success: boolean;
  total_page?: number;
}

interface DepositDetailResponse {
  data: DepositItem;
  status: number;
  success: boolean;
}

// Field tambahan dari response GET /invoice/payment
type PaymentRow = PaymentLog & {
  payment_amount_use?: number | string | null;
  approved_user?: { id: number; nama: string } | null;
};

interface PaymentResponse {
  status: number;
  success: boolean;
  data: PaymentRow[];
  total_data?: number;
  total_page?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toNum = (v: unknown): number => {
  const n = Number(v ?? 0);
  return isNaN(n) ? 0 : n;
};

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${day}-${month}-${year}`;
};

const formatCurrency = (amount: unknown): string =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(toNum(amount));

const getStatusBadge = (status: string) => {
  const statusColors: { [key: string]: string } = {
    draft: 'bg-gray-100 text-gray-800',
    requested: 'bg-yellow-100 text-yellow-800',
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    done: 'bg-blue-100 text-blue-800',
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        statusColors[(status || '').toLowerCase()] ||
        'bg-gray-100 text-gray-800'
      }`}
    >
      {(status || '-').toUpperCase()}
    </span>
  );
};

const customerNameOf = (p: PaymentRow): string =>
  p.payment_details?.[0]?.invoice?.nama_customer ??
  `Customer #${p.customer_id}`;

/** Total biaya tambahan (pajak/admin/dll) dari semua invoice di pembayaran ini */
const costsOf = (p: PaymentRow): number =>
  (p.payment_details ?? []).reduce(
    (s: number, d: any) =>
      s +
      (d.additional_costs ?? []).reduce(
        (x: number, c: any) => x + toNum(c.amount),
        0,
      ),
    0,
  );

/**
 * Lebih bayar (deposit) = payment_amount - payment_amount_use - biaya tambahan.
 * Kalau BE mengirim field khusus (deposit_amount) itu yang dipakai.
 */
const depositOf = (p: PaymentRow): number => {
  const direct = (p as any).deposit_amount;
  if (direct !== undefined && direct !== null) return toNum(direct);
  return Math.max(toNum(p.payment_amount) - toNum(p.payment_amount_use), 0);
};

// ─── Shared UI ────────────────────────────────────────────────────────────────

const Spinner: React.FC = () => (
  <div className="flex justify-center items-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

const SearchIcon: React.FC = () => (
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
);

const PaginationBar: React.FC<{
  limit: number;
  page: number;
  totalPages: number;
  onLimitChange: (n: number) => void;
  onPageChange: (p: number) => void;
  className?: string;
}> = ({ limit, page, totalPages, onLimitChange, onPageChange, className }) => (
  <div
    className={
      className ??
      'w-full flex flex-col md:flex-row items-center justify-between gap-4 mt-6 pb-4 px-4'
    }
  >
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">Rows per page:</span>
      <div className="flex gap-2">
        {[10, 25, 50, 100].map((size) => (
          <button
            key={size}
            onClick={() => onLimitChange(size)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              limit === size
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
    <Stack spacing={2}>
      <Pagination
        count={totalPages}
        color="primary"
        page={page}
        onChange={(_e, i) => onPageChange(i)}
        size="small"
      />
    </Stack>
  </div>
);

// ─── TAB 1: Deposit dari Bukti Lebih Bayar ────────────────────────────────────

const LebihBayarList: React.FC<{ mode: Mode }> = ({ mode }) => {
  const isHistory = mode === 'history';

  const [loading, setLoading] = useState<boolean>(true);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [totalData, setTotalData] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [selectedPayment, setSelectedPayment] = useState<PaymentRow | null>(
    null,
  );
  const [approving, setApproving] = useState<boolean>(false);

  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line
  }, [page, limit, searchTerm, startDate, endDate, mode]);

  const fetchPayments = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/invoice/payment`;
    try {
      setLoading(true);
      const res: AxiosResponse<PaymentResponse> = await axios.get(url, {
        params: {
          page,
          limit,
          status: isHistory ? 'approved' : 'requested',
          start_date: startDate || undefined,
          end_date: endDate || undefined,
          search: searchTerm || undefined,
        },
        withCredentials: true,
      });
      console.log('Fetched payments:', res.data);
      const list = Array.isArray(res.data.data) ? res.data.data : [];
      setPayments(list);
      setTotalPages(res.data.total_page || 1);
      setTotalData(res.data.total_data ?? list.length);
    } catch (error) {
      console.error('Error fetching deposit lebih bayar:', error);
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

  const handleLimitChange = (n: number): void => {
    setLimit(n);
    setPage(1);
  };

  const handleApprove = async (p: PaymentRow): Promise<void> => {
    if (!window.confirm(`Approve bukti bayar ${p.receipt_number}?`)) return;
    try {
      setApproving(true);
      const res = await axios.put(
        `${import.meta.env.VITE_API_LINK}/invoice/payment/approve/${p.id}`,
        {},
        { withCredentials: true },
      );
      if (res.data?.success) {
        alert('Berhasil di-approve');
        setSelectedPayment(null);
        fetchPayments();
      }
    } catch (error: any) {
      console.error('Error approving payment:', error);
      alert(error.response?.data?.message || 'Failed to approve');
    } finally {
      setApproving(false);
    }
  };

  const hasActiveFilter = !!searchTerm || !!startDate || !!endDate;

  const resetFilters = (): void => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setPage(1);
    const el = document.getElementById('dlb-search') as HTMLInputElement | null;
    if (el) el.value = '';
  };

  const headers = [
    'No Bukti Bayar',
    'Tgl Bayar',
    'Customer',
    'Invoice',
    'Nominal Bayar',
    'Terpakai ke Invoice',
    'Biaya Tambahan',
    'Lebih Bayar (Deposit)',
    'Dibuat Oleh',
    ...(isHistory ? ['Disetujui Oleh'] : []),
  ];
  const colCount = headers.length + 1;

  return (
    <div>
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-3 sm:p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative lg:col-span-2">
            <input
              id="dlb-search"
              type="text"
              placeholder="Search by No Bukti Bayar, Invoice, Customer..."
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
            <SearchIcon />
          </div>
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
          <h3 className="text-sm font-bold text-gray-700">
            {isHistory
              ? 'History Approved (Bukti Lebih Bayar)'
              : 'Menunggu Approval (Bukti Lebih Bayar)'}
          </h3>
          <span className="text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
            {totalData.toLocaleString('id-ID')} data
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {headers.map((h) => (
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
                  <td colSpan={colCount} className="px-3 py-4 text-center">
                    <Spinner />
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td
                    colSpan={colCount}
                    className="px-3 py-6 text-center text-gray-500 text-sm"
                  >
                    {isHistory
                      ? 'Belum ada history'
                      : 'Tidak ada bukti bayar yang menunggu approval'}
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  const deposit = depositOf(p);
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
                      <td className="px-3 py-2 whitespace-nowrap text-xs">
                        <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                          {p.payment_details?.length ?? 0} invoice
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                        {formatCurrency(p.payment_amount)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-green-700 font-semibold">
                        {formatCurrency(p.payment_amount_use)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                        {formatCurrency(costsOf(p))}
                      </td>
                      <td
                        className={`px-3 py-2 whitespace-nowrap text-xs font-semibold ${
                          deposit > 0 ? 'text-blue-700' : 'text-gray-400'
                        }`}
                      >
                        {formatCurrency(deposit)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                        {p.created_user?.nama || '-'}
                      </td>
                      {isHistory && (
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                          {p.approved_user?.nama || '-'}
                        </td>
                      )}
                      <td className="px-3 py-2 whitespace-nowrap text-xs">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedPayment(p)}
                            className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
                          >
                            Detail
                          </button>
                          {!isHistory && (
                            <button
                              onClick={() => handleApprove(p)}
                              disabled={approving}
                              className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                              Approve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <PaginationBar
          limit={limit}
          page={page}
          totalPages={totalPages}
          onLimitChange={handleLimitChange}
          onPageChange={setPage}
        />
      </div>

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

// ─── TAB 2: Deposit Manual ────────────────────────────────────────────────────

const ManualDepositList: React.FC<{ mode: Mode }> = ({ mode }) => {
  const isHistory = mode === 'history';

  const [loading, setLoading] = useState<boolean>(true);
  const [depositData, setDepositData] = useState<DepositItem[]>([]);
  const [selectedDeposit, setSelectedDeposit] = useState<DepositItem | null>(
    null,
  );
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [limit, setLimit] = useState<number>(10);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [depositToReject, setDepositToReject] = useState<number | null>(null);

  useEffect(() => {
    fetchDepositData();
    // eslint-disable-next-line
  }, [page, searchTerm, limit, mode]);

  const fetchDepositData = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/deposit`;
    try {
      setLoading(true);

      const res: AxiosResponse<DepositResponse> = await axios.get(url, {
        params: {
          page: page,
          limit: limit,
          search: searchTerm,
          status: isHistory ? 'approved' : 'requested',
        },
        withCredentials: true,
      });

      setDepositData(res.data.data);
      setTotalPages(res.data.total_page || 1);
    } catch (error) {
      console.error('Error fetching Deposit data:', error);
      setDepositData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepositDetail = async (depositId: number): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/deposit/${depositId}`;
    try {
      const res: AxiosResponse<DepositDetailResponse> = await axios.get(url, {
        withCredentials: true,
      });
      setSelectedDeposit(res.data.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error fetching Deposit detail:', error);
      alert('Failed to fetch deposit details');
    }
  };

  const handleApprove = async (depositId: number) => {
    if (!depositId) return;

    const url = `${import.meta.env.VITE_API_LINK}/deposit/approve/${depositId}`;
    if (window.confirm('Apakah Anda yakin ingin Approve Deposit Ini?')) {
      try {
        const res = await axios.put(url, {}, { withCredentials: true });

        if (res.data.success) {
          alert('Deposit berhasil di-approve');
          fetchDepositData();
          setShowDetailModal(false);
        }
      } catch (error: any) {
        console.error('Error approving deposit:', error);
        alert(error.response?.data?.message || 'Failed to approve deposit');
      }
    }
  };

  const handleRejectClick = (depositId: number) => {
    setDepositToReject(depositId);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!depositToReject) return;
    if (!rejectReason.trim()) {
      alert('Silakan masukkan alasan reject');
      return;
    }

    const url = `${
      import.meta.env.VITE_API_LINK
    }/deposit/reject/${depositToReject}`;
    try {
      const res = await axios.put(
        url,
        { note_reject: rejectReason },
        { withCredentials: true },
      );

      if (res.data.success) {
        alert('Deposit berhasil di-reject');
        fetchDepositData();
        setShowRejectModal(false);
        setShowDetailModal(false);
        setRejectReason('');
        setDepositToReject(null);
      }
    } catch (error: any) {
      console.error('Error rejecting deposit:', error);
      alert(error.response?.data?.message || 'Failed to reject deposit');
    }
  };

  const handleLimitChange = (newLimit: number): void => {
    setLimit(newLimit);
    setPage(1);
  };

  const emptyText = isHistory
    ? 'Belum ada history deposit'
    : 'No pending deposit for approval';

  const EmptyIcon = (
    <svg
      className="w-12 h-12 text-gray-300"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );

  return (
    <div>
      {/* Search */}
      <div className="mb-4 sm:mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by No Deposit, Customer, Cara Bayar..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          />
          <SearchIcon />
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  'No Deposit',
                  'Tgl Faktur',
                  'Customer',
                  'Cara Bayar',
                  'Nominal',
                  'Status',
                  ...(isHistory ? [] : ['Action']),
                ].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
                {isHistory && (
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                    Detail
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-3 py-4 text-center">
                    <Spinner />
                  </td>
                </tr>
              ) : depositData.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 py-8 text-center text-gray-500 text-sm"
                  >
                    <div className="flex flex-col items-center gap-2">
                      {EmptyIcon}
                      <p>{emptyText}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                depositData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-900 font-medium">
                      {item.no_deposit || '-'}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-900">
                      {formatDate(item.tgl_faktur)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-900">
                      {item.customer?.nama_customer || '-'}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-900">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                        {item.cara_bayar || '-'}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-900 font-semibold">
                      {formatCurrency(item.nominal)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs flex flex-col">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs">
                      <div className="flex gap-2">
                        <button
                          onClick={() => fetchDepositDetail(item.id)}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs font-medium"
                          title="Detail"
                        >
                          Detail
                        </button>
                        {!isHistory && (
                          <>
                            <button
                              onClick={() => handleApprove(item.id)}
                              className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-xs font-medium"
                              title="Approve"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectClick(item.id)}
                              className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs font-medium"
                              title="Reject"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <PaginationBar
          limit={limit}
          page={page}
          totalPages={totalPages}
          onLimitChange={handleLimitChange}
          onPageChange={setPage}
        />
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {loading ? (
          <div className="py-8">
            <Spinner />
          </div>
        ) : depositData.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500 flex flex-col items-center gap-2">
            {EmptyIcon}
            <p>{emptyText}</p>
          </div>
        ) : (
          depositData.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="font-semibold text-sm text-gray-900 mb-1">
                    {item.no_deposit || '-'}
                  </div>
                  <div className="text-xs text-gray-600">
                    {item.customer?.nama_customer || '-'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-green-600 mb-1">
                    {formatCurrency(item.nominal)}
                  </div>
                  {getStatusBadge(item.status)}
                </div>
              </div>

              <div className="space-y-2 text-sm border-t pt-3 mt-3">
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
                      Cara Bayar:
                    </span>
                    <div className="text-gray-900 text-xs">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                        {item.cara_bayar || '-'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => fetchDepositDetail(item.id)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Detail
                  </button>
                  {!isHistory && (
                    <>
                      <button
                        onClick={() => handleApprove(item.id)}
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectClick(item.id)}
                        className="flex-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {!loading && depositData.length > 0 && (
          <PaginationBar
            className="w-full flex flex-col items-center gap-4 py-4"
            limit={limit}
            page={page}
            totalPages={totalPages}
            onLimitChange={handleLimitChange}
            onPageChange={setPage}
          />
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedDeposit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                Detail Deposit
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    No Deposit
                  </label>
                  <p className="text-base text-gray-900 font-semibold">
                    {selectedDeposit.no_deposit}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Status
                  </label>
                  <div className="mt-1">
                    {getStatusBadge(selectedDeposit.status)}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Customer
                </label>
                <p className="text-base text-gray-900">
                  {selectedDeposit.customer?.nama_customer || '-'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Tanggal Faktur
                  </label>
                  <p className="text-base text-gray-900">
                    {formatDate(selectedDeposit.tgl_faktur)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Cara Bayar
                  </label>
                  <p className="text-base text-gray-900">
                    {selectedDeposit.cara_bayar}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Nominal
                </label>
                <p className="text-xl text-gray-900 font-bold">
                  {formatCurrency(selectedDeposit.nominal)}
                </p>
              </div>

              {selectedDeposit.billing_address && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Billing Address
                  </label>
                  <p className="text-base text-gray-900">
                    {selectedDeposit.billing_address}
                  </p>
                </div>
              )}

              {selectedDeposit.keterangan && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Keterangan
                  </label>
                  <p className="text-base text-gray-900">
                    {selectedDeposit.keterangan}
                  </p>
                </div>
              )}

              {selectedDeposit.note && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Note
                  </label>
                  <p className="text-base text-gray-900">
                    {selectedDeposit.note}
                  </p>
                </div>
              )}

              {selectedDeposit.user_create && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Dibuat Oleh
                  </label>
                  <p className="text-base text-gray-900">
                    {selectedDeposit.user_create.nama} (
                    {selectedDeposit.user_create.email})
                  </p>
                </div>
              )}

              {isHistory && selectedDeposit.user_approve && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Disetujui Oleh
                  </label>
                  <p className="text-base text-gray-900">
                    {selectedDeposit.user_approve.nama}
                  </p>
                </div>
              )}

              {!isHistory && (
                <div className="border-t pt-4 flex gap-3">
                  <button
                    onClick={() => handleApprove(selectedDeposit.id)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      handleRejectClick(selectedDeposit.id);
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                Reject Deposit
              </h2>
            </div>

            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alasan Reject <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Masukkan alasan reject..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={4}
              />
            </div>

            <div className="px-6 py-4 border-t flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setDepositToReject(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main: tabs + sub tabs ────────────────────────────────────────────────────

const MAIN_TABS: { key: MainTab; label: string }[] = [
  { key: 'lebih-bayar', label: 'Deposit dari Bukti Lebih Bayar' },
  { key: 'manual', label: 'Deposit Manual' },
];

const SUB_TABS: { key: Mode; label: string }[] = [
  { key: 'outstanding', label: 'Outstanding' },
  { key: 'history', label: 'History Approved' },
];

const DepositApproval: React.FC = () => {
  // Default terbuka: Deposit dari Bukti Lebih Bayar
  const [mainTab, setMainTab] = useState<MainTab>('lebih-bayar');
  const [subTab, setSubTab] = useState<Mode>('outstanding');

  const changeMainTab = (t: MainTab): void => {
    setMainTab(t);
    setSubTab('outstanding');
  };

  return (
    <div>
      {/* Main tabs */}
      <div className="border-b border-gray-200 mb-4 overflow-x-auto">
        <nav className="flex gap-6 min-w-max">
          {MAIN_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => changeMainTab(t.key)}
              className={`pb-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                mainTab === t.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Sub tabs */}
      <div className="flex gap-2 mb-4">
        {SUB_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setSubTab(t.key)}
            className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-colors ${
              subTab === t.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* key → remount saat tab berganti (reset page, search, dll) */}
      {mainTab === 'lebih-bayar' ? (
        <LebihBayarList key={`lb-${subTab}`} mode={subTab} />
      ) : (
        <ManualDepositList key={`manual-${subTab}`} mode={subTab} />
      )}
    </div>
  );
};

export default DepositApproval;
