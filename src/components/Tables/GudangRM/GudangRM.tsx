import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import Pagination from '@mui/material/Pagination/Pagination';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

/* =============================================================================
 * GudangRM — raw material warehouse. Two tabs:
 *
 *  - Booking: JO bookings against RM stock, split by status_ticket
 *    (incoming / history) same shape as IncomingRawMaterialQC. Rows are
 *    multi-selectable; "Approve Terpilih" fires the approve endpoint once
 *    per selected id (no bulk endpoint exists), sequentially, and reports
 *    how many succeeded/failed.
 *
 *  - Stock: read-only current RM stock levels. The list only carries the
 *    summary fields; clicking "Detail" fetches the full record from
 *    GET /rm/gudangStock/:id (full master_barang + mutasi trail with the
 *    user who made each mutation) and shows it in a modal.
 * ========================================================================== */

type TabKey = 'booking' | 'stock';
type StatusTicket = 'incoming' | 'history';
type BookingStatus = 'incoming' | 'approve' | 'reject' | 'history';

// --- Booking types (GET /rm/gudangBooking) ---
interface RawJobOrderRef {
  id: number;
  id_io: number;
  no_jo: string;
  no_io: string;
  no_so: string;
  customer: string;
  produk: string;
  tgl_kirim: string;
  status: string;
}
interface RawMasterBarangRef {
  id: number;
  kode_barang: string;
  nama_barang: string;
  kategori: string;
  sub_kategori: string | null;
}
interface RawUserRef {
  id: number;
  nama: string;
  role: string;
}
interface GudangBookingItem {
  id: number;
  id_jo: number;
  id_item: number;
  id_user_approve: number | null;
  no_jo: string;
  customer: string;
  produk: string;
  nama_item: string;
  qty: number;
  tipe_barang: string | null;
  satuan: string | null;
  rencana_cetak: string;
  tgl_masuk: string;
  tgl_approve: string | null;
  status: BookingStatus;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  job_order?: RawJobOrderRef;
  master_barang?: RawMasterBarangRef;
  user_approve?: RawUserRef | null;
}
interface GudangBookingListResponse {
  status: number;
  success: boolean;
  data: GudangBookingItem[];
  total_page?: number;
}

// --- Stock list types (GET /rm/gudangStock) ---
interface GudangStockItem {
  id: number;
  id_item: number;
  kode_item: string;
  nama_item: string;
  qty: number;
  tipe_barang: string | null;
  satuan: string | null;
  tgl_masuk: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}
interface GudangStockListResponse {
  status: number;
  success: boolean;
  data: GudangStockItem[];
  total_page?: number;
}

// --- Stock detail types (GET /rm/gudangStock/:id) ---
interface MasterBarangFull {
  id: number;
  id_brand: number | null;
  id_purchase_unit: number | null;
  id_inventory_unit: number | null;
  kode_barang: string;
  nama_barang: string;
  kategori: string;
  sub_kategori: string | null;
  gramatur: number | null;
  panjang: number | null;
  lebar: number | null;
  harga: number;
  persentase: number;
  batas_harga: number;
  pajak: number;
  harga_per_satuan: number;
  inventory_convert: number;
  warehouse: string;
  keterangan: string | null;
  is_include_tax: boolean;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}
interface StockMutasiUser {
  id: number;
  id_role: number;
  nama: string;
  email: string;
  bagian: string;
  role: string;
  status: string;
}
interface StockMutasiDetail {
  id: number;
  id_gudang_raw_material_stock: number;
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
  user?: StockMutasiUser;
}
interface GudangStockDetail {
  id: number;
  id_item: number;
  kode_item: string;
  nama_item: string;
  qty: number;
  tipe_barang: string | null;
  satuan: string | null;
  tgl_masuk: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  master_barang?: MasterBarangFull;
  gudang_raw_material_stock_mutasi?: StockMutasiDetail[];
}
interface GudangStockDetailResponse {
  status: number;
  success: boolean;
  data: GudangStockDetail;
}

const formatQty = (val: number | null | undefined): string =>
  (val ?? 0).toLocaleString('id-ID');

const formatCurrency = (val: number | null | undefined): string =>
  (val ?? 0).toLocaleString('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 2,
  });

const formatDate = (val?: string | null): string => {
  if (!val) return '-';
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

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

const bookingStatusBadge = (status: BookingStatus): string => {
  if (status === 'approve' || status === 'history')
    return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
  if (status === 'reject') return 'bg-red-50 text-red-700 ring-red-200';
  return 'bg-amber-50 text-amber-700 ring-amber-200';
};

const bookingStatusLabel = (status: BookingStatus): string => {
  if (status === 'approve') return 'Disetujui';
  if (status === 'reject') return 'Ditolak';
  if (status === 'history') return 'Selesai';
  return 'Menunggu Approve';
};

const typeBadge = (type: 'masuk' | 'keluar'): string =>
  type === 'masuk'
    ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
    : 'bg-orange-50 text-orange-700 ring-orange-200';

// =============================================================================
// Booking tab
// =============================================================================
const BookingTab: React.FC<{
  onToast: (message: string, severity: 'success' | 'error' | 'info') => void;
}> = ({ onToast }) => {
  const [statusTicket, setStatusTicket] = useState<StatusTicket>('incoming');
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<GudangBookingItem[]>([]);

  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [approving, setApproving] = useState<boolean>(false);

  const fetchData = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/rm/gudangBooking`;
    try {
      setLoading(true);
      const res = await axios.get<GudangBookingListResponse>(url, {
        params: { page, limit, status_ticket: statusTicket },
        withCredentials: true,
      });
      setData(res.data.data || []);
      if (res.data.total_page) setTotalPages(res.data.total_page);
      setSelected(new Set());
    } catch (error) {
      console.error('Error fetching gudang booking data:', error);
      setData([]);
      onToast('Gagal memuat data booking gudang RM.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, statusTicket]);

  const handleTabChange = (tab: StatusTicket) => {
    setStatusTicket(tab);
    setPage(1);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const selectableRows = useMemo(
    () => data.filter((d) => d.status === 'incoming'),
    [data],
  );

  const toggleSelected = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === selectableRows.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(selectableRows.map((d) => d.id)));
    }
  };

  const handleBulkApprove = async () => {
    if (selected.size === 0) return;
    setApproving(true);
    let successCount = 0;
    let failCount = 0;
    // No bulk endpoint — approve one id at a time, sequentially.
    for (const id of Array.from(selected)) {
      try {
        const url = `${
          import.meta.env.VITE_API_LINK
        }/rm/gudangBooking/approve/${id}`;
        await axios.put(url, undefined, { withCredentials: true });
        successCount += 1;
      } catch (err) {
        console.error(`Error approving gudang booking ${id}:`, err);
        failCount += 1;
      }
    }
    setApproving(false);
    if (failCount === 0) {
      onToast(`${successCount} booking berhasil disetujui.`, 'success');
    } else {
      onToast(
        `${successCount} berhasil, ${failCount} gagal disetujui.`,
        failCount === selected.size ? 'error' : 'info',
      );
    }
    fetchData();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2 inline-flex gap-1">
          {(
            [
              { key: 'incoming', label: 'Menunggu Approve' },
              { key: 'history', label: 'Riwayat' },
            ] as { key: StatusTicket; label: string }[]
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                statusTicket === tab.key
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {statusTicket === 'incoming' && (
          <button
            onClick={handleBulkApprove}
            disabled={selected.size === 0 || approving}
            className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            {approving ? 'Memproses...' : `Approve Terpilih (${selected.size})`}
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {statusTicket === 'incoming' && (
                  <th className="px-3 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={
                        selectableRows.length > 0 &&
                        selected.size === selectableRows.length
                      }
                      onChange={toggleSelectAll}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                  </th>
                )}
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  No JO
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Customer / Produk
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Nama Item
                </th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Qty
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Rencana Cetak
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Tgl Masuk
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={statusTicket === 'incoming' ? 8 : 7}
                    className="px-4 py-14 text-center"
                  >
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-7 w-7 border-2 border-emerald-500 border-t-transparent"></div>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={statusTicket === 'incoming' ? 8 : 7}
                    className="px-4 py-14 text-center"
                  >
                    <p className="text-slate-600 font-medium text-sm">
                      Tidak ada data booking gudang RM.
                    </p>
                  </td>
                </tr>
              ) : (
                data.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    {statusTicket === 'incoming' && (
                      <td className="px-3 py-3">
                        <input
                          type="checkbox"
                          disabled={b.status !== 'incoming'}
                          checked={selected.has(b.id)}
                          onChange={() => toggleSelected(b.id)}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 disabled:opacity-40"
                        />
                      </td>
                    )}
                    <td className="px-3 py-3 font-medium text-emerald-700">
                      {b.no_jo}
                    </td>
                    <td className="px-3 py-3">
                      <div className="text-slate-700">{b.customer}</div>
                      <div className="text-xs text-slate-400 max-w-[220px] truncate">
                        {b.produk}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-slate-700">
                      {b.nama_item}
                      {b.tipe_barang && (
                        <div className="text-xs text-slate-400">
                          {b.tipe_barang}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums font-medium">
                      {formatQty(b.qty)} {b.satuan || ''}
                    </td>
                    <td className="px-3 py-3 text-slate-600 whitespace-nowrap">
                      {formatDate(b.rencana_cetak)}
                    </td>
                    <td className="px-3 py-3 text-slate-600 whitespace-nowrap">
                      {formatDateTime(b.tgl_masuk)}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full ring-1 font-medium ${bookingStatusBadge(
                          b.status,
                        )}`}
                      >
                        {bookingStatusLabel(b.status)}
                      </span>
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
                    ? 'bg-emerald-600 text-white'
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
    </div>
  );
};

// =============================================================================
// Stock detail modal — fetches the full record by id (GET /rm/gudangStock/:id)
// =============================================================================
const StockDetailModal: React.FC<{
  id: number;
  onClose: () => void;
}> = ({ id, onClose }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string>('');
  const [detail, setDetail] = useState<GudangStockDetail | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      const url = `${import.meta.env.VITE_API_LINK}/rm/gudangStock/${id}`;
      try {
        setLoading(true);
        setLoadError('');
        const res = await axios.get<GudangStockDetailResponse>(url, {
          withCredentials: true,
        });
        setDetail(res.data.data || null);
      } catch (err) {
        console.error('Error fetching gudang stock detail:', err);
        setLoadError('Gagal memuat detail stok.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const mutasi = detail?.gudang_raw_material_stock_mutasi || [];
  const master = detail?.master_barang;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Detail Stok RM
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {detail ? `${detail.kode_item} · ${detail.nama_item}` : '...'}
            </p>
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
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent" />
          </div>
        ) : loadError ? (
          <div className="px-6 py-14 text-center">
            <p className="text-red-600 text-sm font-medium">{loadError}</p>
          </div>
        ) : !detail ? (
          <div className="px-6 py-14 text-center">
            <p className="text-slate-500 text-sm">Data stok tidak ditemukan.</p>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl py-3">
                <p className="text-[11px] text-emerald-600">Qty Saat Ini</p>
                <p className="text-lg font-semibold text-emerald-800">
                  {formatQty(detail.qty)} {detail.satuan || ''}
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl py-3">
                <p className="text-[11px] text-slate-400">Tipe Barang</p>
                <p className="text-sm font-medium text-slate-700 mt-1">
                  {detail.tipe_barang || '-'}
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl py-3">
                <p className="text-[11px] text-slate-400">Tgl Masuk Terakhir</p>
                <p className="text-sm font-medium text-slate-700 mt-1">
                  {formatDateTime(detail.tgl_masuk)}
                </p>
              </div>
            </div>

            {master && (
              <div className="border border-slate-200 rounded-xl p-4 grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                <div>
                  <p className="text-[11px] text-slate-400">Kategori</p>
                  <p className="text-slate-700">
                    {master.kategori}
                    {master.sub_kategori ? ` · ${master.sub_kategori}` : ''}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400">Gudang</p>
                  <p className="text-slate-700">{master.warehouse || '-'}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400">Harga</p>
                  <p className="text-slate-700">
                    {formatCurrency(master.harga)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400">Harga per Satuan</p>
                  <p className="text-slate-700">
                    {formatCurrency(master.harga_per_satuan)}
                  </p>
                </div>
                {master.keterangan && (
                  <div className="col-span-2">
                    <p className="text-[11px] text-slate-400">Keterangan</p>
                    <p className="text-slate-700">{master.keterangan}</p>
                  </div>
                )}
              </div>
            )}

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
                        Sumber
                      </th>
                      <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                        Oleh
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {mutasi.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-8 text-center text-slate-400 text-sm"
                        >
                          Belum ada mutasi.
                        </td>
                      </tr>
                    ) : (
                      mutasi.map((m) => (
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
                          <td className="px-3 py-2.5 text-slate-500 capitalize">
                            {m.sumber_mutasi}
                            {m.no_jo_booking ? ` · ${m.no_jo_booking}` : ''}
                            {m.note ? ` · ${m.note}` : ''}
                          </td>
                          <td className="px-3 py-2.5 text-slate-600">
                            {m.user?.nama || '-'}
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
// Stock tab
// =============================================================================
const StockTab: React.FC<{
  onToast: (message: string, severity: 'success' | 'error' | 'info') => void;
}> = ({ onToast }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<GudangStockItem[]>([]);

  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  const [detailId, setDetailId] = useState<number | null>(null);

  const fetchData = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/rm/gudangStock`;
    try {
      setLoading(true);
      const res = await axios.get<GudangStockListResponse>(url, {
        params: { page, limit },
        withCredentials: true,
      });
      setData(res.data.data || []);
      if (res.data.total_page) setTotalPages(res.data.total_page);
    } catch (error) {
      console.error('Error fetching gudang stock data:', error);
      setData([]);
      onToast('Gagal memuat data stok gudang RM.', 'error');
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
                  Kode Item
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Nama Item
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Tipe Barang
                </th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Qty
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Tgl Masuk Terakhir
                </th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-14 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-7 w-7 border-2 border-emerald-500 border-t-transparent"></div>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-14 text-center">
                    <p className="text-slate-600 font-medium text-sm">
                      Belum ada stok gudang RM.
                    </p>
                  </td>
                </tr>
              ) : (
                data.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="px-3 py-3 font-medium text-slate-700">
                      {s.kode_item}
                    </td>
                    <td className="px-3 py-3 text-slate-700">{s.nama_item}</td>
                    <td className="px-3 py-3 text-slate-500">
                      {s.tipe_barang || '-'}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums font-medium text-slate-800">
                      {formatQty(s.qty)} {s.satuan || ''}
                    </td>
                    <td className="px-3 py-3 text-slate-600 whitespace-nowrap">
                      {formatDateTime(s.tgl_masuk)}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setDetailId(s.id)}
                          className="text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Detail
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
                    ? 'bg-emerald-600 text-white'
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

      {detailId !== null && (
        <StockDetailModal id={detailId} onClose={() => setDetailId(null)} />
      )}
    </div>
  );
};

// =============================================================================
// Main page
// =============================================================================
const GudangRM: React.FC = () => {
  const [tab, setTab] = useState<TabKey>('booking');

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
            { key: 'booking', label: 'Booking' },
            { key: 'stock', label: 'Stock' },
          ] as { key: TabKey; label: string }[]
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-2 text-sm font-medium rounded-xl transition-colors ${
              tab === t.key
                ? 'bg-emerald-600 text-white'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'booking' ? (
        <BookingTab onToast={showToast} />
      ) : (
        <StockTab onToast={showToast} />
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

export default GudangRM;
