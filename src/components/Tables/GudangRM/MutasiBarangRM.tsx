import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Pagination from '@mui/material/Pagination/Pagination';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

/* =============================================================================
 * MutasiBarangRM — two tabs:
 *
 *  - Log Mutasi: flat log of raw-material stock mutations
 *    (GET /rm/mutasiBarang), own pagination/limit.
 *
 *  - Per Item: aggregated view per item (GET /rm/mutasiBarangByItem),
 *    showing running totals + an expandable data_mutasi trail per row.
 *    Own pagination/limit, independent from the flat tab.
 * ========================================================================== */

type TabKey = 'flat' | 'byItem';

interface RawMasterBarangRef {
  id: number;
  kode_barang: string;
  nama_barang: string;
  kategori: string;
  sub_kategori: string | null;
  satuan?: string;
}
interface MutasiBarang {
  id: number;
  id_item: number;
  id_user: number;
  id_jo_booking: number | null;
  kode_barang: string;
  nama_barang: string;
  no_jo_booking: string | null;
  jumlah_qty: number;
  type_mutasi: 'masuk' | 'keluar';
  sumber_mutasi: string;
  note: string | null;
  tgl_mutasi: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  master_barang?: RawMasterBarangRef;
}
interface MutasiBarangListResponse {
  status: number;
  success: boolean;
  data: MutasiBarang[];
  total_page?: number;
}

interface MutasiByItem {
  id_item: number;
  kode_barang: string;
  nama_barang: string;
  jumlah_qty_masuk: number;
  jumlah_qty_keluar: number;
  data_mutasi: MutasiBarang[];
}
interface MutasiByItemListResponse {
  status: number;
  success: boolean;
  data: MutasiByItem[];
  total_page?: number;
}

const EMPTY_TEXT = 'Belum ada mutasi barang.';

const formatQty = (val: number | null | undefined): string =>
  (val ?? 0).toLocaleString('id-ID');

const formatDateTime = (val?: string | null): string => {
  if (!val) return '-';
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const typeBadge = (type: 'masuk' | 'keluar'): string =>
  type === 'masuk'
    ? 'bg-sky-50 text-sky-700 ring-sky-200'
    : 'bg-orange-50 text-orange-700 ring-orange-200';

const LimitButtons: React.FC<{
  limit: number;
  onChange: (n: number) => void;
  color?: 'sky' | 'indigo';
}> = ({ limit, onChange, color = 'sky' }) => (
  <div className="flex items-center gap-2">
    <span className="text-sm text-slate-500">Baris per halaman:</span>
    <div className="flex gap-1.5">
      {[10, 25, 50, 100].map((pageSize) => (
        <button
          key={pageSize}
          onClick={() => onChange(pageSize)}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            limit === pageSize
              ? color === 'sky'
                ? 'bg-sky-600 text-white'
                : 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {pageSize}
        </button>
      ))}
    </div>
  </div>
);

// =============================================================================
// Tab: flat mutation log (GET /rm/mutasiBarang)
// =============================================================================
const FlatMutasiTab: React.FC<{
  onToast: (message: string, severity: 'success' | 'error' | 'info') => void;
}> = ({ onToast }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<MutasiBarang[]>([]);

  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  const fetchData = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/rm/mutasiBarang`;
    try {
      setLoading(true);
      const res = await axios.get<MutasiBarangListResponse>(url, {
        params: { page, limit },
        withCredentials: true,
      });
      setData(res.data.data || []);
      if (res.data.total_page) setTotalPages(res.data.total_page);
    } catch (error) {
      console.error('Error fetching mutasi barang data:', error);
      setData([]);
      onToast('Gagal memuat data mutasi barang.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Kode Barang
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Nama Barang
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  No JO Booking
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Tipe
                </th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Qty
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Sumber
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Tanggal
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-14 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-7 w-7 border-2 border-sky-500 border-t-transparent"></div>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-14 text-center">
                    <p className="text-slate-600 font-medium text-sm">
                      {EMPTY_TEXT}
                    </p>
                  </td>
                </tr>
              ) : (
                data.map((m) => (
                  <tr
                    key={m.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="px-3 py-3 font-medium text-slate-700">
                      {m.kode_barang}
                    </td>
                    <td className="px-3 py-3 text-slate-700">
                      {m.nama_barang}
                    </td>
                    <td className="px-3 py-3 text-slate-600">
                      {m.no_jo_booking || '-'}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full ring-1 font-medium ${typeBadge(
                          m.type_mutasi,
                        )}`}
                      >
                        {m.type_mutasi === 'masuk' ? 'Masuk' : 'Keluar'}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums font-medium text-slate-800">
                      {formatQty(m.jumlah_qty)}
                    </td>
                    <td className="px-3 py-3 text-slate-500 capitalize">
                      {m.sumber_mutasi}
                      {m.note ? ` · ${m.note}` : ''}
                    </td>
                    <td className="px-3 py-3 text-slate-600 whitespace-nowrap">
                      {formatDateTime(m.tgl_mutasi)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 pb-4">
        <LimitButtons limit={limit} onChange={handleLimitChange} color="sky" />
        <Stack spacing={2}>
          <Pagination
            count={totalPages}
            page={page}
            color="primary"
            onChange={(_, i) => setPage(i)}
          />
        </Stack>
      </div>
    </div>
  );
};

// =============================================================================
// Tab: per-item aggregated view (GET /rm/mutasiBarangByItem)
// =============================================================================
const ByItemMutasiTab: React.FC<{
  onToast: (message: string, severity: 'success' | 'error' | 'info') => void;
}> = ({ onToast }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<MutasiByItem[]>([]);

  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const fetchData = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/rm/mutasiBarangByItem`;
    try {
      setLoading(true);
      const res = await axios.get<MutasiByItemListResponse>(url, {
        params: { page, limit },
        withCredentials: true,
      });
      setData(res.data.data || []);
      if (res.data.total_page) setTotalPages(res.data.total_page);
    } catch (error) {
      console.error('Error fetching mutasi barang by item data:', error);
      setData([]);
      onToast('Gagal memuat riwayat mutasi per item.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const toggleExpanded = (idItem: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(idItem)) next.delete(idItem);
      else next.add(idItem);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-3 py-3 w-8" />
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Kode Barang
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Nama Barang
                </th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Total Masuk
                </th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Total Keluar
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-14 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-7 w-7 border-2 border-indigo-500 border-t-transparent"></div>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-14 text-center">
                    <p className="text-slate-600 font-medium text-sm">
                      {EMPTY_TEXT}
                    </p>
                  </td>
                </tr>
              ) : (
                data.map((it) => {
                  const isOpen = expanded.has(it.id_item);
                  return (
                    <React.Fragment key={it.id_item}>
                      <tr
                        className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                        onClick={() => toggleExpanded(it.id_item)}
                      >
                        <td className="px-3 py-3 text-slate-400">
                          <span
                            className={`inline-block transition-transform ${
                              isOpen ? 'rotate-90' : ''
                            }`}
                          >
                            ›
                          </span>
                        </td>
                        <td className="px-3 py-3 font-medium text-slate-700">
                          {it.kode_barang}
                        </td>
                        <td className="px-3 py-3 text-slate-700">
                          {it.nama_barang}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums font-medium text-sky-700">
                          {formatQty(it.jumlah_qty_masuk)}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums font-medium text-orange-700">
                          {formatQty(it.jumlah_qty_keluar)}
                        </td>
                      </tr>
                      {isOpen && (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-4 pb-4 pt-0 bg-slate-50/60"
                          >
                            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                              <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                  <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                      <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                                        Tanggal
                                      </th>
                                      <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                                        Tipe
                                      </th>
                                      <th className="px-3 py-2.5 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                                        Qty
                                      </th>
                                      <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                                        No JO
                                      </th>
                                      <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                                        Sumber / Note
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {it.data_mutasi.length === 0 ? (
                                      <tr>
                                        <td
                                          colSpan={5}
                                          className="px-4 py-6 text-center text-slate-400 text-sm"
                                        >
                                          Belum ada mutasi.
                                        </td>
                                      </tr>
                                    ) : (
                                      it.data_mutasi.map((m) => (
                                        <tr key={m.id}>
                                          <td className="px-3 py-2.5 whitespace-nowrap text-slate-600">
                                            {formatDateTime(m.tgl_mutasi)}
                                          </td>
                                          <td className="px-3 py-2.5">
                                            <span
                                              className={`text-[11px] px-2 py-0.5 rounded-full ring-1 font-medium ${typeBadge(
                                                m.type_mutasi,
                                              )}`}
                                            >
                                              {m.type_mutasi === 'masuk'
                                                ? 'Masuk'
                                                : 'Keluar'}
                                            </span>
                                          </td>
                                          <td className="px-3 py-2.5 text-right tabular-nums font-medium text-slate-800">
                                            {formatQty(m.jumlah_qty)}
                                          </td>
                                          <td className="px-3 py-2.5 text-slate-600">
                                            {m.no_jo_booking || '-'}
                                          </td>
                                          <td className="px-3 py-2.5 text-slate-500">
                                            <span className="capitalize">
                                              {m.sumber_mutasi}
                                            </span>
                                            {m.note ? ` · ${m.note}` : ''}
                                          </td>
                                        </tr>
                                      ))
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 pb-4">
        <LimitButtons
          limit={limit}
          onChange={handleLimitChange}
          color="indigo"
        />
        <Stack spacing={2}>
          <Pagination
            count={totalPages}
            page={page}
            color="primary"
            onChange={(_, i) => setPage(i)}
          />
        </Stack>
      </div>
    </div>
  );
};

// =============================================================================
// Main page
// =============================================================================
const MutasiBarangRM: React.FC = () => {
  const [tab, setTab] = useState<TabKey>('flat');

  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'success' });

  const showToast = (message: string, severity: 'success' | 'error' | 'info') =>
    setToast({ open: true, message, severity });

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2 inline-flex gap-1">
        {(
          [
            { key: 'flat', label: 'Log Mutasi' },
            { key: 'byItem', label: 'Per Item' },
          ] as { key: TabKey; label: string }[]
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-2 text-sm font-medium rounded-xl transition-colors ${
              tab === t.key
                ? 'bg-sky-600 text-white'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'flat' ? (
        <FlatMutasiTab onToast={showToast} />
      ) : (
        <ByItemMutasiTab onToast={showToast} />
      )}

      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          severity={toast.severity}
          variant="filled"
          onClose={() => setToast((t) => ({ ...t, open: false }))}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default MutasiBarangRM;
