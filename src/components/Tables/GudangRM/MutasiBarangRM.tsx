import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Pagination from '@mui/material/Pagination/Pagination';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

/* =============================================================================
 * MutasiBarangRM — flat log of raw-material stock mutations (GET
 * /rm/mutasiBarang), with a "Riwayat Item" action per row that opens the
 * per-item aggregated view (GET /rm/mutasiBarangByItem, filtered by
 * id_item) showing running totals + the full data_mutasi trail for that
 * item.
 * ========================================================================== */

interface RawJoBookingRef {
  id: number;
  no_jo: string;
  no_io: string;
  no_so: string;
  customer: string;
  produk: string;
  status: string;
}
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
  jo_booking?: RawJoBookingRef | null;
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

// =============================================================================
// Per-item history modal
// =============================================================================
const ItemHistoryModal: React.FC<{
  idItem: number;
  namaBarang: string;
  onClose: () => void;
}> = ({ idItem, namaBarang, onClose }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string>('');
  const [summary, setSummary] = useState<MutasiByItem | null>(null);

  useEffect(() => {
    const fetchByItem = async () => {
      const url = `${import.meta.env.VITE_API_LINK}/rm/mutasiBarangByItem`;
      try {
        setLoading(true);
        setLoadError('');
        const res = await axios.get<MutasiByItemListResponse>(url, {
          params: { page: 1, limit: 100, id_item: idItem },
          withCredentials: true,
        });
        const match =
          (res.data.data || []).find((it) => it.id_item === idItem) ||
          (res.data.data || [])[0] ||
          null;
        setSummary(match);
      } catch (err) {
        console.error('Error fetching mutasi by item:', err);
        setLoadError('Gagal memuat riwayat mutasi item.');
      } finally {
        setLoading(false);
      }
    };
    fetchByItem();
  }, [idItem]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Riwayat Mutasi Barang
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">{namaBarang}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Tutup"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-sky-500 border-t-transparent" />
          </div>
        ) : loadError ? (
          <div className="px-6 py-14 text-center">
            <p className="text-red-600 text-sm font-medium">{loadError}</p>
          </div>
        ) : !summary ? (
          <div className="px-6 py-14 text-center">
            <p className="text-slate-500 text-sm">
              Tidak ada riwayat untuk item ini.
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-sky-50 border border-sky-100 rounded-xl py-3 text-center">
                <p className="text-[11px] text-sky-600">Total Masuk</p>
                <p className="text-lg font-semibold text-sky-800">
                  {formatQty(summary.jumlah_qty_masuk)}
                </p>
              </div>
              <div className="bg-orange-50 border border-orange-100 rounded-xl py-3 text-center">
                <p className="text-[11px] text-orange-600">Total Keluar</p>
                <p className="text-lg font-semibold text-orange-800">
                  {formatQty(summary.jumlah_qty_keluar)}
                </p>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
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
                    {summary.data_mutasi.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-8 text-center text-slate-400 text-sm"
                        >
                          Belum ada mutasi.
                        </td>
                      </tr>
                    ) : (
                      summary.data_mutasi.map((m) => (
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
                              {m.type_mutasi === 'masuk' ? 'Masuk' : 'Keluar'}
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
          </div>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// Main page
// =============================================================================
const MutasiBarangRM: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<MutasiBarang[]>([]);

  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  const [historyItem, setHistoryItem] = useState<{
    idItem: number;
    namaBarang: string;
  } | null>(null);

  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'success' });

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
      setToast({
        open: true,
        message: 'Gagal memuat data mutasi barang.',
        severity: 'error',
      });
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
    <div className="space-y-5">
      {/* Table */}
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
                <th className="px-3 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-14 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-7 w-7 border-2 border-sky-500 border-t-transparent"></div>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-14 text-center">
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
                    </td>
                    <td className="px-3 py-3 text-slate-600 whitespace-nowrap">
                      {formatDateTime(m.tgl_mutasi)}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            setHistoryItem({
                              idItem: m.id_item,
                              namaBarang: m.nama_barang,
                            })
                          }
                          className="text-xs font-medium text-white bg-sky-600 hover:bg-sky-700 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Riwayat Item
                        </button>
                      </div>
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
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Baris per halaman:</span>
          <div className="flex gap-1.5">
            {[10, 25, 50, 100].map((pageSize) => (
              <button
                key={pageSize}
                onClick={() => handleLimitChange(pageSize)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  limit === pageSize
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
            page={page}
            color="primary"
            onChange={(_, i) => setPage(i)}
          />
        </Stack>
      </div>

      {/* Per-item history modal */}
      {historyItem && (
        <ItemHistoryModal
          idItem={historyItem.idItem}
          namaBarang={historyItem.namaBarang}
          onClose={() => setHistoryItem(null)}
        />
      )}

      {/* Toast */}
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
