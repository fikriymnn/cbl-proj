import React, { useEffect, useRef, useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import { Pagination, Stack } from '@mui/material';
import Loading from '../../Loading';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdjustDataBarang {
  id: number;
  id_customer: number;
  id_io: number;
  id_produk: number;
  jumlah_qty: number;
  jumlah_qty_keluar: number;
  jumlah_qty_sisa: number;
  no_io: string;
  no_jo: string;
  produk: string;
  customer: string;
}

interface AdjustGudangItem {
  id_customer: number;
  id_io: number;
  id_produk: number;
  jumlah_qty: number;
  no_io: string;
  produk: string;
  customer: string;
  data_barang: AdjustDataBarang[];
}

interface AdjustGudangResponse {
  data: AdjustGudangItem[];
  status: number;
  success: boolean;
  total_page?: number;
}

interface AdjustStockHistoryItem {
  user: any;
  id: number;
  id_gudang_finish_good: number;
  id_jo: number;
  id_io: number;
  id_so: number;
  id_customer: number;
  id_produk: number;
  id_user: number;
  no_jo: string;
  no_io: string;
  no_so: string;
  no_po_customer: string;
  customer: string;
  produk: string;
  po_qty: number;
  jumlah_qty_awal: number;
  jumlah_qty_adjust: number;
  tgl_adjust: string;
  status: 'penambahan' | 'pengurangan' | string;
  note: string | null;
  is_active: boolean;
  createdAt: string;
  updatedAt?: string;
}

interface AdjustStockHistoryResponse {
  data: AdjustStockHistoryItem[];
  total_page?: number;
  limit?: string | number;
  offset?: string | number;
}

interface RowForm {
  jumlah_qty_adjust: string;
  note: string;
}

type TabKey = 'adjust' | 'history';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtQty(val: number | null | undefined) {
  if (val == null) return '-';
  return val.toLocaleString('id-ID');
}

function fmtDateTime(val: string | null | undefined) {
  if (!val) return '-';
  const d = new Date(val);
  if (isNaN(d.getTime())) return String(val);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface AdjustStockModalProps {
  onClose: () => void;
  /** Called after a successful adjustment, so the parent table can refresh */
  onAdjusted?: () => void;
}

const AdjustStockModal: React.FC<AdjustStockModalProps> = ({
  onClose,
  onAdjusted,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('adjust');

  // ── Adjust tab state ──
  const [rows, setRows] = useState<AdjustDataBarang[]>([]);
  const [forms, setForms] = useState<Record<number, RowForm>>({});
  const [submitting, setSubmitting] = useState<Record<number, boolean>>({});
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── History tab state ──
  const [history, setHistory] = useState<AdjustStockHistoryItem[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyLimit, setHistoryLimit] = useState(10);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // ── Fetch list to adjust ──
  const fetchList = async (
    pageVal: number,
    limitVal: number,
    searchVal: string,
  ) => {
    try {
      setLoading(true);
      const res: AxiosResponse<AdjustGudangResponse> = await axios.get(
        `${import.meta.env.VITE_API_LINK}/fg/gudangFinishGoodByIo`,
        {
          params: {
            page: pageVal,
            limit: limitVal,
            search: searchVal || undefined,
            status: 'keep',
          },
          withCredentials: true,
        },
      );
      const flat: AdjustDataBarang[] = (res.data?.data ?? []).flatMap(
        (g) => g.data_barang ?? [],
      );
      setRows(flat);
      setTotalPages(res.data?.total_page ?? 1);
      setForms((prev) => {
        const next: Record<number, RowForm> = {};
        flat.forEach((b) => {
          next[b.id] = prev[b.id] ?? {
            jumlah_qty_adjust: String(b.jumlah_qty ?? 0),
            note: '',
          };
        });
        return next;
      });
    } catch (err) {
      console.error(err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'adjust') {
      fetchList(page, limit, search);
    }
    // eslint-disable-next-line
  }, [activeTab, page, limit]);

  function handleSearchInput(val: string) {
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchList(1, limit, val);
    }, 400);
  }

  function handleLimitChange(newLimit: number) {
    setLimit(newLimit);
    setPage(1);
  }

  function updateForm(id: number, patch: Partial<RowForm>) {
    setForms((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...patch },
    }));
  }

  async function handleAdjust(barang: AdjustDataBarang) {
    const form = forms[barang.id];
    if (!form || form.jumlah_qty_adjust === '') {
      alert('Jumlah qty adjust wajib diisi');
      return;
    }
    const jumlahAdjust = Number(form.jumlah_qty_adjust);
    if (Number.isNaN(jumlahAdjust)) {
      alert('Jumlah qty adjust harus berupa angka');
      return;
    }
    if (!form.note || !form.note.trim()) {
      alert('Note wajib diisi');
      return;
    }

    const confirmed = window.confirm(
      `Adjust stok ${barang.no_io} - ${barang.produk}\nDari ${fmtQty(
        barang.jumlah_qty,
      )} menjadi ${fmtQty(jumlahAdjust)}?`,
    );
    if (!confirmed) return;

    try {
      setSubmitting((p) => ({ ...p, [barang.id]: true }));
      await axios.post(
        `${import.meta.env.VITE_API_LINK}/fg/adjustStock`,
        {
          id_gudang_finish_good: barang.id,
          jumlah_qty_awal: barang.jumlah_qty,
          jumlah_qty_adjust: jumlahAdjust,
          note: form.note.trim(),
        },
        { withCredentials: true },
      );
      alert('Stok berhasil di-adjust');
      await fetchList(page, limit, search);
      onAdjusted?.();
    } catch (err: unknown) {
      console.error(err);
      const error = err as { response?: { data?: { msg?: string } } };
      alert(error?.response?.data?.msg ?? 'Adjust stok gagal');
    } finally {
      setSubmitting((p) => ({ ...p, [barang.id]: false }));
    }
  }

  // ── Fetch history ──
  const fetchHistory = async (pageVal: number, limitVal: number) => {
    try {
      setLoadingHistory(true);
      const res: AxiosResponse<AdjustStockHistoryResponse> = await axios.get(
        `${import.meta.env.VITE_API_LINK}/fg/adjustStock`,
        {
          params: { page: pageVal, limit: limitVal },
          withCredentials: true,
        },
      );
      console.log('history res', res.data);
      setHistory(Array.isArray(res.data?.data) ? res.data.data : []);
      setHistoryTotalPages(res.data?.total_page ?? 1);
    } catch (err) {
      console.error(err);
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory(historyPage, historyLimit);
    }
    // eslint-disable-next-line
  }, [activeTab, historyPage, historyLimit]);

  function handleHistoryLimitChange(newLimit: number) {
    setHistoryLimit(newLimit);
    setHistoryPage(1);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full min-w-7xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-4 text-white rounded-t-2xl flex justify-between items-start flex-shrink-0">
          <div>
            <h3 className="text-base font-bold flex items-center gap-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 3v2m6-2v2M4 7h16M4 7v13a1 1 0 001 1h14a1 1 0 001-1V7M4 7l1-3h14l1 3M9 11h6"
                />
              </svg>
              Adjust Stock
            </h3>
            <p className="text-emerald-100 text-xs mt-0.5">
              Sesuaikan jumlah stok gudang finish good
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-emerald-100 text-2xl font-bold leading-none"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-5 pt-3 flex-shrink-0 gap-2">
          <button
            onClick={() => setActiveTab('adjust')}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
              activeTab === 'adjust'
                ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Adjust Stok
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
              activeTab === 'history'
                ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Riwayat Adjust
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0 p-4 gap-3">
          {activeTab === 'adjust' ? (
            <>
              {/* Search */}
              <div className="relative flex-shrink-0 w-full sm:w-96">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  placeholder="Cari No JO, IO, produk, customer..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-blue-50"
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

              {/* Table */}
              <div className="flex-1 overflow-auto rounded-xl border border-gray-200 relative">
                {loading && <Loading />}
                <table className="w-full text-xs sm:text-sm min-w-[1000px]">
                  <thead className="bg-white sticky top-0 z-10">
                    <tr>
                      {[
                        'No',
                        'No IO',
                        'No JO',
                        'Produk',
                        'Customer',
                        'Qty Saat Ini',
                        'Qty Adjust',
                        'Note',
                        'Aksi',
                      ].map((h) => (
                        <th
                          key={h}
                          className="p-2 sm:p-3 text-left font-semibold text-gray-600 whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={9}
                          className="p-8 text-center text-gray-500"
                        >
                          {loading ? 'Memuat data...' : 'Tidak ada data'}
                        </td>
                      </tr>
                    ) : (
                      rows.map((b, idx) => {
                        const form = forms[b.id] ?? {
                          jumlah_qty_adjust: '',
                          note: '',
                        };
                        const isSubmitting = !!submitting[b.id];
                        const changed =
                          Number(form.jumlah_qty_adjust) !== b.jumlah_qty;
                        return (
                          <tr
                            key={b.id}
                            className="border-b hover:bg-emerald-50/40 transition-colors"
                          >
                            <td className="p-2 sm:p-3 text-gray-400">
                              {(page - 1) * limit + idx + 1}
                            </td>
                            <td className="p-2 sm:p-3 font-semibold text-violet-600 whitespace-nowrap">
                              {b.no_io}
                            </td>
                            <td className="p-2 sm:p-3 font-semibold text-indigo-600 whitespace-nowrap">
                              {b.no_jo}
                            </td>
                            <td className="p-2 sm:p-3 max-w-[160px]">
                              <span className="block " title={b.produk}>
                                {b.produk || '-'}
                              </span>
                            </td>
                            <td className="p-2 sm:p-3 text-gray-700">
                              {b.customer || '-'}
                            </td>
                            <td className="p-2 sm:p-3  font-bold text-gray-700">
                              {fmtQty(b.jumlah_qty)}
                            </td>
                            <td className="p-2 sm:p-3">
                              <input
                                type="number"
                                value={form.jumlah_qty_adjust}
                                onChange={(e) =>
                                  updateForm(b.id, {
                                    jumlah_qty_adjust: e.target.value,
                                  })
                                }
                                className={`w-24 rounded-lg border px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                                  changed
                                    ? 'border-emerald-300 bg-emerald-50'
                                    : 'border-blue-200 bg-blue-50'
                                }`}
                              />
                            </td>
                            <td className="p-2 sm:p-3">
                              <input
                                type="text"
                                value={form.note}
                                onChange={(e) =>
                                  updateForm(b.id, { note: e.target.value })
                                }
                                placeholder="Catatan adjust..."
                                className="w-40 rounded-lg border border-blue-200 bg-blue-50 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400"
                              />
                            </td>
                            <td className="p-2 sm:p-3">
                              <button
                                onClick={() => handleAdjust(b)}
                                disabled={isSubmitting}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
                              >
                                {isSubmitting ? 'Menyimpan...' : 'Adjust'}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="w-full flex flex-col md:flex-row items-center justify-between gap-3 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Rows per page:</span>
                  <div className="flex gap-2">
                    {[10, 25, 50, 100].map((pageSize) => (
                      <button
                        key={pageSize}
                        onClick={() => handleLimitChange(pageSize)}
                        className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                          limit === pageSize
                            ? 'bg-emerald-600 text-white'
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
            </>
          ) : (
            <>
              {/* History table */}
              <div className="flex-1 overflow-auto rounded-xl border border-gray-200 relative">
                {loadingHistory && <Loading />}
                <table className="w-full text-xs sm:text-sm min-w-[1000px]">
                  <thead className="bg-white sticky top-0 z-10">
                    <tr>
                      {[
                        'No',
                        'Tanggal Adjust',
                        'No IO / JO',
                        'Produk',
                        'Customer',
                        'Qty Awal',
                        'Qty Adjust',
                        'Selisih',
                        'Status',
                        'Note',
                        'User',
                      ].map((h) => (
                        <th
                          key={h}
                          className="p-2 sm:p-3 text-left font-semibold text-gray-600 whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {history.length === 0 ? (
                      <tr>
                        <td
                          colSpan={10}
                          className="p-8 text-center text-gray-500"
                        >
                          {loadingHistory
                            ? 'Memuat data...'
                            : 'Belum ada riwayat adjust'}
                        </td>
                      </tr>
                    ) : (
                      history.map((h, idx) => {
                        const selisih =
                          (h.jumlah_qty_adjust ?? 0) - (h.jumlah_qty_awal ?? 0);
                        const isPenambahan = h.status === 'penambahan';
                        return (
                          <tr
                            key={h.id}
                            className="border-b hover:bg-emerald-50/40 transition-colors"
                          >
                            <td className="p-2 sm:p-3 text-gray-400">
                              {(historyPage - 1) * historyLimit + idx + 1}
                            </td>
                            <td className="p-2 sm:p-3 whitespace-nowrap">
                              {fmtDateTime(h.tgl_adjust ?? h.createdAt)}
                            </td>
                            <td className="p-2 sm:p-3 whitespace-nowrap flex flex-col gap-0.5">
                              <span className="font-semibold text-violet-600">
                                {h.no_io ?? '-'}
                              </span>{' '}
                              <span className="font-semibold text-indigo-600">
                                {h.no_jo ?? '-'}
                              </span>
                            </td>
                            <td className="p-2 sm:p-3 max-w-[260px]">
                              <span className="block " title={h.produk}>
                                {h.produk || '-'}
                              </span>
                            </td>
                            <td className="p-2 sm:p-3 max-w-[180px]">
                              <span className="block " title={h.customer}>
                                {h.customer || '-'}
                              </span>
                            </td>
                            <td className="p-2 sm:p-3 ">
                              {fmtQty(h.jumlah_qty_awal)}
                            </td>
                            <td className="p-2 sm:p-3  font-bold text-indigo-700">
                              {fmtQty(h.jumlah_qty_adjust)}
                            </td>
                            <td
                              className={`p-2 sm:p-3  font-semibold ${
                                selisih < 0
                                  ? 'text-red-600'
                                  : selisih > 0
                                  ? 'text-emerald-600'
                                  : 'text-gray-500'
                              }`}
                            >
                              {selisih > 0 ? '+' : ''}
                              {fmtQty(selisih)}
                            </td>
                            <td className="p-2 sm:p-3">
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${
                                  isPenambahan
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-600'
                                }`}
                              >
                                {h.status === 'penambahan'
                                  ? 'Penambahan'
                                  : h.status === 'pengurangan'
                                  ? 'Pengurangan'
                                  : h.status || '-'}
                              </span>
                            </td>
                            <td className="p-2 sm:p-3 max-w-[180px]">
                              <span className="block " title={h.note ?? ''}>
                                {h.note || '-'}
                              </span>
                            </td>
                            <td className="p-2 sm:p-3 max-w-[180px]">
                              <span className="block" title={h.user.nama ?? ''}>
                                {h.user.nama || '-'}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="w-full flex flex-col md:flex-row items-center justify-between gap-3 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Rows per page:</span>
                  <div className="flex gap-2">
                    {[10, 25, 50, 100].map((pageSize) => (
                      <button
                        key={pageSize}
                        onClick={() => handleHistoryLimitChange(pageSize)}
                        className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                          historyLimit === pageSize
                            ? 'bg-emerald-600 text-white'
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
                    count={historyTotalPages}
                    color="primary"
                    page={historyPage}
                    onChange={(_e, i) => setHistoryPage(i)}
                    size="small"
                  />
                </Stack>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-3 border-t border-gray-100 flex gap-3 justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg text-sm transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdjustStockModal;
