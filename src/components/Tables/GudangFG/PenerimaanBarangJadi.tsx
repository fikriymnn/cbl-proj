import React, { useEffect, useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import Loading from '../../Loading';
import { Pagination, Stack } from '@mui/material';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DetailCustomer {
  id: number;
  nama_customer: string;
  alamat_kantor: string;
  alamat_penagihan: string;
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
  saldo: number | null;
  telepon: string;
  toleransi_pengiriman: string;
  top_faktur: string;
  createdAt: string;
  updatedAt: string;
}

interface UserItem {
  id: number;
  nama: string;
  email: string;
  bagian: string;
  role: string;
  status: string;
  uuid: string;
}

interface IncomingItem {
  id: number;
  id_customer: number;
  id_io: number;
  id_jo: number;
  id_jo_done: number;
  id_produk: number;
  id_so: number;
  id_user: number;
  is_active: boolean;
  jumlah_qty: number;
  no_io: string;
  no_jo: string;
  no_po_customer: string;
  no_so: string;
  note: string;
  note_user: string;
  po_qty: number;
  produk: string;
  customer: string;
  status: string;
  toleransi_pengiriman: string;
  createdAt: string;
  updatedAt: string;
  detail_customer?: DetailCustomer;
  user?: UserItem;
}

interface IncomingResponse {
  data: IncomingItem[];
  status: number;
  success: boolean;
  total_page?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtQty(val: number | null | undefined) {
  if (val == null) return '-';
  return val.toLocaleString('id-ID');
}

function fmtDate(iso: string | null | undefined) {
  if (!iso) return '-';
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}-${String(
    d.getMonth() + 1,
  ).padStart(2, '0')}-${d.getFullYear()}`;
}

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    approved: 'bg-green-100 text-green-700 border-green-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
    'reject fg': 'bg-red-100 text-red-700 border-red-200',
    draft: 'bg-gray-100 text-gray-700 border-gray-200',
  };
  const cls = map[s] ?? 'bg-blue-100 text-blue-700 border-blue-200';
  return (
    <span
      className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full border ${cls}`}
    >
      {status || '-'}
    </span>
  );
}

// ─── Action Modal ─────────────────────────────────────────────────────────────

function ActionModal({
  row,
  type,
  onClose,
  onConfirm,
}: {
  row: IncomingItem;
  type: 'approve' | 'reject';
  onClose: () => void;
  onConfirm: (note: string) => void;
}) {
  const [note, setNote] = useState('');
  const isApprove = type === 'approve';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div
          className={`px-6 py-4 rounded-t-2xl text-white ${
            isApprove
              ? 'bg-gradient-to-r from-green-500 to-emerald-600'
              : 'bg-gradient-to-r from-red-500 to-rose-600'
          }`}
        >
          <h3 className="text-lg font-bold flex items-center gap-2">
            {isApprove ? (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
            {isApprove ? 'Approve Barang Jadi' : 'Reject Barang Jadi'}
          </h3>
          <p
            className={`text-sm mt-0.5 ${
              isApprove ? 'text-green-100' : 'text-red-100'
            }`}
          >
            {row.no_jo} — {row.produk}
          </p>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-gray-50 rounded-xl p-4 text-xs space-y-2">
            {(
              [
                ['No JO', row.no_jo],
                ['No SO', row.no_so],
                ['No IO', row.no_io],
                ['Customer', row.customer],
                ['Produk', row.produk],
                ['PO Qty', fmtQty(row.po_qty)],
                ['Jumlah Aktual', fmtQty(row.jumlah_qty)],
              ] as [string, string][]
            ).map(([label, val]) => (
              <div key={label} className="flex justify-between gap-4">
                <span className="text-gray-500">{label}</span>
                <span className="font-semibold text-gray-800 text-right">
                  {val}
                </span>
              </div>
            ))}
          </div>

          {isApprove ? (
            <div className="bg-green-50 rounded-xl p-3 text-xs text-green-700 border border-green-200">
              <svg
                className="w-3.5 h-3.5 inline mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Data akan ditambahkan ke <strong>Gudang FG</strong> setelah
              approve.
            </div>
          ) : (
            <div className="bg-red-50 rounded-xl p-3 text-xs text-red-700 border border-red-200">
              <svg
                className="w-3.5 h-3.5 inline mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              Status JO akan berubah menjadi <strong>Reject FG</strong> dan qty
              terkirim akan dikurangi.
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600">
              Catatan:
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Tulis catatan..."
              rows={3}
              className="w-full rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
            />
          </div>
        </div>

        <div className="px-5 pb-5 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg text-sm transition-colors"
          >
            Batal
          </button>
          <button
            onClick={() => onConfirm(note || 'oke')}
            className={`px-4 py-2 text-white font-semibold rounded-lg text-sm transition-colors ${
              isApprove
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            {isApprove ? 'Approve' : 'Reject'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const IncomingBarangJadi: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<IncomingItem[]>([]);
  const [actionModal, setActionModal] = useState<{
    row: IncomingItem;
    type: 'approve' | 'reject';
  } | null>(null);

  // Pagination & search — same pattern as Deposit
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [page, limit, searchTerm]);

  const fetchData = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const res: AxiosResponse<IncomingResponse> = await axios.get(
        `${import.meta.env.VITE_API_LINK}/fg/incomingBarangJadi`,
        {
          params: { page, limit, search: searchTerm || undefined },
          withCredentials: true,
        },
      );
      console.log('API response:', res.data);
      setData(Array.isArray(res.data?.data) ? res.data.data : []);
      setTotalPages(res.data?.total_page || 1);
    } catch (err) {
      console.error(err);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (note: string): Promise<void> => {
    if (!actionModal) return;
    const { row, type } = actionModal;
    const endpoint =
      type === 'approve'
        ? `/fg/incomingBarangJadi/approve/${row.id}`
        : `/fg/incomingBarangJadi/reject/${row.id}`;
    try {
      setIsLoading(true);
      await axios.put(
        `${import.meta.env.VITE_API_LINK}${endpoint}`,
        { note_user: note },
        { withCredentials: true },
      );
      setActionModal(null);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLimitChange = (newLimit: number): void => {
    setLimit(newLimit);
    setPage(1);
  };

  return (
    <>
      <main>
        {isLoading && <Loading />}

        {actionModal && (
          <ActionModal
            row={actionModal.row}
            type={actionModal.type}
            onClose={() => setActionModal(null)}
            onConfirm={handleAction}
          />
        )}

        {/* Header Card */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden mb-4">
          <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-3 sm:p-4">
            <h2 className="text-white text-base sm:text-lg md:text-xl font-bold flex items-center">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 mr-2 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"
                />
              </svg>
              Penerimaan Barang Jadi
            </h2>
          </div>
          <div className="p-3 sm:p-4">
            <div className="relative w-full sm:w-96">
              <input
                type="text"
                placeholder="Search No JO, SO, IO, produk, customer..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="pl-9 pr-3 py-2 text-sm border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 w-full bg-blue-50"
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
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-3 sm:p-4 flex items-center justify-between">
            <h3 className="text-white text-base sm:text-lg font-bold flex items-center gap-2">
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"
                />
              </svg>
              Data Incoming Barang Jadi
            </h3>
            <span className="text-sm text-white bg-white bg-opacity-20 px-3 py-0.5 rounded-full font-semibold">
              {data.length} Record
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm min-w-[1100px]">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  {[
                    'No',
                    'No JO',

                    'No IO',
                    'Produk',
                    'Customer',
                    'PO Qty',
                    'Jumlah Aktual',
                    'Toleransi',
                    'Status',
                    'Tgl Input',
                    'Aksi',
                  ].map((h) => (
                    <th
                      key={h}
                      className="p-2 sm:p-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={12}
                      className="p-8 text-center text-gray-500 text-sm"
                    >
                      Tidak ada data incoming barang jadi
                    </td>
                  </tr>
                ) : (
                  data.map((row, i) => (
                    <tr
                      key={row.id}
                      className="border-b hover:bg-blue-50 transition-colors"
                    >
                      <td className="p-2 sm:p-3 text-xs text-gray-500">
                        {(page - 1) * limit + i + 1}
                      </td>
                      <td className="p-2 sm:p-3 text-xs font-bold text-violet-600 whitespace-nowrap">
                        {row.no_jo || '-'}
                      </td>

                      <td className="p-2 sm:p-3 text-xs text-gray-600 whitespace-nowrap">
                        {row.no_io || '-'}
                      </td>
                      <td className="p-2 sm:p-3 text-xs max-w-[200px]">
                        <span className="block " title={row.produk}>
                          {row.produk || '-'}
                        </span>
                      </td>
                      <td className="p-2 sm:p-3 text-xs font-medium text-gray-700 whitespace-nowrap">
                        {row.customer || '-'}
                      </td>
                      <td className="p-2 sm:p-3 text-xs text-right font-medium">
                        {fmtQty(row.po_qty)}
                      </td>
                      <td className="p-2 sm:p-3 text-xs text-right font-bold text-indigo-700">
                        {fmtQty(row.jumlah_qty)}
                      </td>
                      <td className="p-2 sm:p-3 text-xs text-gray-500 whitespace-nowrap">
                        {row.toleransi_pengiriman || '-'}
                      </td>
                      <td className="p-2 sm:p-3 text-xs">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="p-2 sm:p-3 text-xs text-gray-500 whitespace-nowrap">
                        {fmtDate(row.createdAt)}
                      </td>
                      <td className="p-2 sm:p-3 text-xs">
                        <div className="flex items-center flex-col gap-2">
                          <button
                            onClick={() =>
                              setActionModal({ row, type: 'approve' })
                            }
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-[10px] font-semibold rounded-lg transition-colors whitespace-nowrap"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              setActionModal({ row, type: 'reject' })
                            }
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-[10px] font-semibold rounded-lg transition-colors whitespace-nowrap"
                          >
                            <svg
                              className="w-3 h-3"
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
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination — same pattern as Deposit */}
          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 mt-4 pb-4 px-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Rows per page:</span>
              <div className="flex gap-2">
                {[10, 25, 50, 100].map((pageSize) => (
                  <button
                    key={pageSize}
                    onClick={() => handleLimitChange(pageSize)}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      limit === pageSize
                        ? 'bg-violet-600 text-white'
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
      </main>
    </>
  );
};

export default IncomingBarangJadi;
