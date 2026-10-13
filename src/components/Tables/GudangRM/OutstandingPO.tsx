import axios from 'axios';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Pagination from '@mui/material/Pagination/Pagination';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import {
  PurchaseOrder,
  PurchaseOrderListResponse,
  PurchaseOrderDetailResponse,
  PurchaseOrderBookingItem,
  PurchaseOrderBookingDetailResponse,
} from '../Purchasing/Types/Purchasing.types';
import {
  formatDate,
  formatRupiah,
  getStatusColor,
  getStatusLabel,
} from '../Purchasing/Types/poStatus';
import {
  POKind,
  poBaseUrl,
  getApiErrorMessage,
} from '../Purchasing/Types/poApi';
import POKindTabs from '../Purchasing/POKindTabs';

/* =============================================================================
 * OutstandingPO — Gudang RM: PO yang sudah 'approve finance' dan menunggu
 * barang datang. Dua sub tab level atas (kind):
 *
 *   - PO Normal  -> GET /purchasing/purchaseOrder
 *                   detail: items_jo (per JO)
 *                   incoming payload: id_purchase_order + id_purchase_order_item_jo
 *   - PO Booking -> GET /purchasing/purchaseOrderBooking
 *                   detail: items (beli untuk stok, tanpa JO)
 *                   incoming payload: id_purchase_order_booking_item
 *                   (tanpa qty_idle — backend memaksa 0)
 *
 * Di bawahnya tetap ada sub tab "Outstanding" / "Riwayat".
 *   - PO Normal : Riwayat = status_tiket 'history' (perilaku lama).
 *   - PO Booking: Outstanding = status_po 'progress', Riwayat = status_po 'done'
 *                 (approve finance sudah otomatis status_tiket 'history', jadi
 *                 status_po yang membedakan, sesuai dokumen flow 4.2).
 *
 * Filter memakai pola draft/applied: nilai di filter card baru dipakai setelah
 * "Terapkan Filter" (atau Enter di kolom cari).
 *
 * Checkbox item TIDAK dibatasi. Pilihan disimpan global dengan key `kind:id`
 * sehingga item PO Normal dan PO Booking bisa dicentang bersamaan lalu dikirim
 * dalam satu request ke /qc/incomingRawMaterial (dokumen flow 4.3 membolehkan
 * campuran). Pilihan dibersihkan saat pindah Outstanding <-> Riwayat.
 *
 * no_good_receipt satu untuk semua item (otomatis, read-only).
 * no_surat_jalan satu untuk semua item (diketik sekali).
 * ========================================================================== */

const EMPTY_TEXT: Record<POKind, { outstanding: string; history: string }> = {
  po: {
    outstanding: 'Tidak ada PO dengan status approve finance.',
    history: 'Belum ada riwayat PO.',
  },
  booking: {
    outstanding: 'Tidak ada PO Booking yang menunggu barang datang.',
    history: 'Belum ada riwayat PO Booking.',
  },
};

// status_po yang diterima GET /purchasing/purchaseOrder (hanya PO Normal;
// untuk PO Booking status_po ditentukan oleh sub tab Outstanding/Riwayat).
const STATUS_PO_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Semua' },
  { value: 'progress', label: 'Progress' },
  { value: 'done', label: 'Selesai' },
  { value: 'request cancel', label: 'Menunggu Cancel' },
  { value: 'cancel', label: 'Dibatalkan' },
];

// sort_by: kosong (tanpa urutan), createdAt, tgl_po, atau tgl_kirim.
const SORT_BY_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: '- Tidak diurutkan -' },
  { value: 'createdAt', label: 'Created At' },
  { value: 'tgl_po', label: 'Tanggal PO' },
  { value: 'tgl_kirim', label: 'Tanggal Kirim' },
];

interface VendorOption {
  id: number;
  nama_vendor: string;
}

interface OutstandingFilters {
  search: string;
  statusPo: string;
  idVendor: number | '';
  startDatePo: string;
  endDatePo: string;
  startDateKirim: string;
  endDateKirim: string;
  sortBy: string;
  sortOrder: string;
}

const DEFAULT_FILTERS: OutstandingFilters = {
  search: '',
  statusPo: '',
  idVendor: '',
  startDatePo: '',
  endDatePo: '',
  startDateKirim: '',
  endDateKirim: '',
  sortBy: '',
  sortOrder: 'DESC',
};

interface RawMasterBarangRef {
  is_include_tax?: boolean;
  pajak?: number;
  kode_barang?: string;
}

// Bentuk mentah items_jo (PO Normal).
interface OutstandingItemJo {
  id: number;
  id_jo: number;
  id_purchase_order: number;
  id_item: number;
  id_brand: number | null;
  no_jo: string;
  nama_item: string;
  nama_brand: string;
  qty_bom: number;
  qty_po: number;
  qty_terkirim: number;
  qty_sisa: number;
  qty_idle: number;
  tipe_barang: string;
  satuan: string;
  tgl_kirim: string;
  rencana_cetak: string;
  status_qc: 'request qc' | 'approve qc' | 'reject qc' | null;
  status_po: 'progress' | 'done';
  master_barang?: RawMasterBarangRef;
}

// Bentuk seragam untuk tabel item, baik dari items_jo maupun item booking.
interface OutstandingItem {
  id: number; // id items_jo (PO Normal) / id item booking (PO Booking)
  no_jo: string; // kosong untuk PO Booking
  kode_barang: string;
  nama_item: string;
  tipe_barang: string;
  satuan: string;
  qty_po: number; // PO Booking: qty_beli
  qty_terkirim: number;
  qty_sisa: number;
  status_qc: 'request qc' | 'approve qc' | 'reject qc' | null;
  status_po: 'progress' | 'done';
}

const normalizeJoItem = (it: OutstandingItemJo): OutstandingItem => ({
  id: it.id,
  no_jo: it.no_jo,
  kode_barang: it.master_barang?.kode_barang || '',
  nama_item: it.nama_item,
  tipe_barang: it.tipe_barang,
  satuan: it.satuan,
  qty_po: it.qty_po,
  qty_terkirim: it.qty_terkirim,
  qty_sisa: it.qty_sisa,
  status_qc: it.status_qc,
  status_po: it.status_po,
});

const normalizeBookingItem = (
  it: PurchaseOrderBookingItem,
): OutstandingItem => ({
  id: it.id,
  no_jo: '',
  kode_barang: it.master_barang?.kode_barang || it.kode_barang || '',
  nama_item: it.nama_item,
  tipe_barang: it.tipe_barang,
  satuan: it.satuan,
  qty_po: it.qty_beli,
  qty_terkirim: it.qty_terkirim ?? 0,
  qty_sisa: it.qty_sisa ?? 0,
  status_qc: it.status_qc ?? null,
  status_po: it.status_po ?? 'progress',
});

// Key unik lintas kind — id PO / id item bisa sama antara PO Normal dan Booking.
const rowKey = (kind: POKind, id: number): string => `${kind}:${id}`;

interface SelectedRow {
  key: string;
  kind: POKind;
  id: number; // id items_jo / id item booking
  id_purchase_order: number; // id PO (PO Normal) / id PO Booking
  no_purchase_order: string;
  no_jo: string;
  nama_item: string;
  satuan: string;
  qty_po: number;
  qty_sisa: number;
}

interface IncomingFormRow {
  key: string;
  kind: POKind;
  id_purchase_order: number;
  no_purchase_order: string;
  item_id: number; // id items_jo / id item booking
  no_jo: string;
  nama_item: string;
  satuan: string;
  qty_sisa: number;
  qty_incoming: number;
  ada_idle: boolean;
  qty_idle: number;
  qty_pallet: number;
}

interface NoGoodReceiptResponse {
  status: number;
  success: boolean;
  no_good_receipt: string;
  new_no_good_receipt: string;
}

const formatQty = (val: number | null | undefined): string =>
  (val ?? 0).toLocaleString('id-ID');

const statusPoBadge = (status: string): string => {
  if (status === 'done') return 'bg-emerald-50 text-emerald-700';
  return 'bg-teal-50 text-teal-700'; // progress
};

const statusQcBadge = (status: string | null): string => {
  if (status === 'approve qc') return 'bg-emerald-50 text-emerald-700';
  if (status === 'reject qc') return 'bg-red-50 text-red-700';
  if (status === 'request qc') return 'bg-amber-50 text-amber-700';
  return 'bg-slate-100 text-slate-500'; // null — belum diajukan ke QC
};

const statusQcLabel = (status: string | null): string => {
  if (status === 'approve qc') return 'QC Disetujui';
  if (status === 'reject qc') return 'QC Ditolak';
  if (status === 'request qc') return 'Menunggu QC';
  return 'Belum Diajukan';
};

// =============================================================================
// Popup konfirmasi incoming — satu-satunya modal di halaman ini. Baris boleh
// berasal dari banyak PO dan campuran PO Normal + PO Booking.
// =============================================================================
const IncomingFormModal: React.FC<{
  rows: IncomingFormRow[];
  onClose: () => void;
  onSubmitted: (submittedKeys: string[]) => void;
}> = ({ rows: initialRows, onClose, onSubmitted }) => {
  const [rows, setRows] = useState<IncomingFormRow[]>(initialRows);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Teks bebas, berlaku untuk semua item.
  const [noSuratJalan, setNoSuratJalan] = useState<string>('');

  // Otomatis, read-only, berlaku untuk semua item.
  const [noGoodReceipt, setNoGoodReceipt] = useState<string>('');
  const [loadingGoodReceipt, setLoadingGoodReceipt] = useState<boolean>(true);
  const [goodReceiptError, setGoodReceiptError] = useState<string>('');

  const fetchNoGoodReceipt = async () => {
    setLoadingGoodReceipt(true);
    setGoodReceiptError('');
    try {
      const url = `${
        import.meta.env.VITE_API_LINK
      }/qc/incomingRawMaterialNoGoodReceipt`;
      const res = await axios.get<NoGoodReceiptResponse>(url, {
        withCredentials: true,
      });
      setNoGoodReceipt(res.data.new_no_good_receipt);
    } catch (err) {
      console.error('Error fetching no good receipt:', err);
      setGoodReceiptError('Gagal mengambil nomor good receipt otomatis.');
      setNoGoodReceipt('');
    } finally {
      setLoadingGoodReceipt(false);
    }
  };

  useEffect(() => {
    fetchNoGoodReceipt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const patchRow = (idx: number, patch: Partial<IncomingFormRow>) => {
    setRows((prev) =>
      prev.map((r, i) => {
        if (i !== idx) return r;
        const updated = { ...r, ...patch };
        // PO Booking tidak punya qty idle (backend memaksa 0).
        if (!updated.ada_idle || updated.kind === 'booking')
          updated.qty_idle = 0;
        return updated;
      }),
    );
  };

  const totals = useMemo(
    () => ({
      incoming: rows.reduce((s, r) => s + (r.qty_incoming || 0), 0),
      idle: rows.reduce((s, r) => s + (r.qty_idle || 0), 0),
      pallet: rows.reduce((s, r) => s + (r.qty_pallet || 0), 0),
    }),
    [rows],
  );

  const poCount = useMemo(
    () => new Set(rows.map((r) => rowKey(r.kind, r.id_purchase_order))).size,
    [rows],
  );

  const validate = (): string => {
    if (!noSuratJalan.trim()) return 'No surat jalan wajib diisi.';
    if (loadingGoodReceipt)
      return 'Nomor good receipt sedang dimuat, mohon tunggu.';
    if (!noGoodReceipt)
      return 'Nomor good receipt gagal dimuat. Coba muat ulang.';
    for (const r of rows) {
      if (r.qty_incoming <= 0)
        return `Jumlah datang untuk "${r.nama_item}" harus lebih dari 0.`;
      if (r.kind === 'po' && r.ada_idle && r.qty_idle < 0)
        return `Jumlah idle untuk "${r.nama_item}" tidak boleh negatif.`;
      if (r.qty_pallet < 0)
        return `Qty pallet untuk "${r.nama_item}" tidak boleh negatif.`;
    }
    return '';
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const url = `${import.meta.env.VITE_API_LINK}/qc/incomingRawMaterial`;
      await axios.post(
        url,
        {
          items: rows.map((r) =>
            r.kind === 'booking'
              ? {
                  // PO Booking: id_purchase_order_booking diisi backend,
                  // qty_idle dipaksa 0 oleh backend.
                  id_purchase_order_booking_item: r.item_id,
                  no_surat_jalan: noSuratJalan.trim(),
                  no_good_receipt: noGoodReceipt,
                  qty_incoming: r.qty_incoming,
                  qty_pallet: r.qty_pallet,
                }
              : {
                  id_purchase_order: r.id_purchase_order,
                  id_purchase_order_item_jo: r.item_id,
                  no_surat_jalan: noSuratJalan.trim(),
                  no_good_receipt: noGoodReceipt,
                  qty_incoming: r.qty_incoming,
                  qty_idle: r.ada_idle ? r.qty_idle : 0,
                  qty_pallet: r.qty_pallet,
                },
          ),
        },
        { withCredentials: true },
      );
      onSubmitted(rows.map((r) => r.key));
    } catch (err) {
      console.error('Error submitting incoming raw material:', err);
      setError(
        getApiErrorMessage(
          err,
          'Gagal mengirim data incoming. Silakan coba lagi.',
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit =
    !submitting &&
    !loadingGoodReceipt &&
    !!noGoodReceipt &&
    !!noSuratJalan.trim();

  return (
    <Dialog
      open
      onClose={submitting ? undefined : onClose}
      fullWidth
      maxWidth="xl"
    >
      <DialogTitle className="!pb-1">
        Konfirmasi Barang Datang
        <span className="block text-xs font-normal text-slate-400 mt-0.5">
          {rows.length} item dari {poCount} PO terpilih
        </span>
      </DialogTitle>
      <DialogContent>
        <div className="flex flex-wrap items-start gap-3 mb-4 mt-1 bg-teal-50 border border-teal-100 rounded-lg px-3 py-2.5">
          <div className="flex-1 min-w-[220px]">
            <label className="block text-[11px] font-medium text-teal-700 mb-1">
              No Good Receipt (otomatis, berlaku untuk semua item)
            </label>
            {loadingGoodReceipt ? (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-teal-500 border-t-transparent" />
                Mengambil nomor good receipt...
              </div>
            ) : goodReceiptError ? (
              <div className="flex items-center gap-2 text-sm text-red-600">
                {goodReceiptError}
                <button
                  onClick={fetchNoGoodReceipt}
                  className="text-xs font-medium text-teal-700 hover:text-teal-900 underline"
                >
                  Coba lagi
                </button>
              </div>
            ) : (
              <div
                className="w-full px-3 py-1.5 text-sm border border-teal-200 rounded-lg bg-white text-slate-700 font-semibold tabular-nums select-all"
                aria-readonly="true"
              >
                {noGoodReceipt}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-[220px]">
            <label className="block text-[11px] font-medium text-teal-700 mb-1">
              No Surat Jalan (berlaku untuk semua item)
            </label>
            <input
              type="text"
              value={noSuratJalan}
              onChange={(e) => setNoSuratJalan(e.target.value)}
              placeholder="Masukkan no surat jalan..."
              className="w-full px-3 py-1.5 text-sm border border-teal-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                  No PO
                </th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                  JO / Barang
                </th>
                <th className="px-3 py-2.5 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                  Jumlah Datang
                </th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                  Ada Idle?
                </th>
                <th className="px-3 py-2.5 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                  Jumlah Idle
                </th>
                <th className="px-3 py-2.5 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                  Qty Pallet
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r, idx) => {
                const isBookingRow = r.kind === 'booking';
                return (
                  <tr key={r.key}>
                    <td className="px-3 py-2.5 align-top text-xs font-semibold text-slate-500">
                      <div>{r.no_purchase_order}</div>
                      {isBookingRow && (
                        <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">
                          Booking
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 align-top">
                      <div className="text-xs font-semibold text-teal-700">
                        {isBookingRow ? 'Stok (tanpa JO)' : r.no_jo}
                      </div>
                      <div className="text-sm text-slate-700">
                        {r.nama_item}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {isBookingRow ? 'Sisa belum datang' : 'Sisa kebutuhan'}:{' '}
                        {formatQty(r.qty_sisa)} {r.satuan}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 align-top text-center">
                      <input
                        type="number"
                        min={0}
                        value={r.qty_incoming}
                        onChange={(e) =>
                          patchRow(idx, {
                            qty_incoming: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-24 px-2.5 py-1.5 text-sm text-right border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      {/* Backend tidak membatasi qty_incoming terhadap
                          qty_sisa, jadi beri peringatan (tidak memblokir). */}
                      {isBookingRow && r.qty_incoming > r.qty_sisa && (
                        <div className="text-[10px] text-amber-600 mt-1">
                          Melebihi sisa ({formatQty(r.qty_sisa)})
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2.5 align-top">
                      {isBookingRow ? (
                        <span className="text-slate-300">—</span>
                      ) : (
                        <select
                          value={r.ada_idle ? 'ya' : 'tidak'}
                          onChange={(e) =>
                            patchRow(idx, {
                              ada_idle: e.target.value === 'ya',
                            })
                          }
                          className="w-24 px-2 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                          <option value="tidak">Tidak</option>
                          <option value="ya">Ya</option>
                        </select>
                      )}
                    </td>
                    <td className="px-3 py-2.5 align-top text-center">
                      {isBookingRow ? (
                        <span className="text-slate-300">—</span>
                      ) : (
                        <input
                          type="number"
                          min={0}
                          disabled={!r.ada_idle}
                          value={r.qty_idle}
                          onChange={(e) =>
                            patchRow(idx, {
                              qty_idle: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-24 px-2.5 py-1.5 text-sm text-right border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-slate-100 disabled:text-slate-400"
                        />
                      )}
                    </td>
                    <td className="px-3 py-2.5 align-top text-center">
                      <input
                        type="number"
                        min={0}
                        value={r.qty_pallet}
                        onChange={(e) =>
                          patchRow(idx, {
                            qty_pallet: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-20 px-2.5 py-1.5 text-sm text-right border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-50 border-t border-slate-200">
              <tr>
                <td
                  colSpan={2}
                  className="px-3 py-2 text-xs font-semibold text-slate-500"
                >
                  Total
                </td>
                <td className="px-3 py-2 text-center text-xs font-semibold text-slate-700">
                  {formatQty(totals.incoming)}
                </td>
                <td />
                <td className="px-3 py-2 text-center text-xs font-semibold text-slate-700">
                  {formatQty(totals.idle)}
                </td>
                <td className="px-3 py-2 text-center text-xs font-semibold text-slate-700">
                  {formatQty(totals.pallet)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg px-4 py-2.5 mt-4">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2 mt-5 pb-1">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="px-5 py-2 text-sm bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            {submitting ? 'Mengirim...' : 'Kirim Data Incoming'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// =============================================================================
// Halaman utama
// =============================================================================
type SubTab = 'outstanding' | 'history';

const OutstandingPO: React.FC = () => {
  const [kind, setKind] = useState<POKind>('po');
  const isBooking = kind === 'booking';

  const [subTab, setSubTab] = useState<SubTab>('outstanding');
  const isHistory = subTab === 'history';

  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<PurchaseOrder[]>([]);

  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  const [filterDraft, setFilterDraft] =
    useState<OutstandingFilters>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<OutstandingFilters>(DEFAULT_FILTERS);

  const [vendorOptions, setVendorOptions] = useState<VendorOption[]>([]);
  const [vendorOptionsLoading, setVendorOptionsLoading] =
    useState<boolean>(true);

  // Expand inline, key = rowKey(kind, po.id).
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [detailCache, setDetailCache] = useState<
    Record<
      string,
      { loading: boolean; error: string; items: OutstandingItem[] }
    >
  >({});

  // Pilihan lintas PO dan lintas kind, key = rowKey(kind, item.id).
  const [selected, setSelected] = useState<Map<string, SelectedRow>>(new Map());
  const [showForm, setShowForm] = useState<boolean>(false);

  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'success' });

  // Mencegah respons lama menimpa data saat user cepat pindah tab.
  const listReqRef = useRef(0);

  const fetchData = async (): Promise<void> => {
    const reqId = ++listReqRef.current;
    try {
      setLoading(true);
      const res = await axios.get<PurchaseOrderListResponse>(poBaseUrl(kind), {
        params: {
          page,
          limit,
          search: appliedFilters.search || undefined,
          status: 'approve finance',
          // PO Normal: riwayat = status_tiket 'history'.
          // PO Booking: approve finance sudah otomatis 'history', jadi tidak
          // dipakai; dibedakan lewat status_po di bawah.
          status_tiket: !isBooking && isHistory ? 'history' : undefined,
          status_po: isBooking
            ? isHistory
              ? 'done'
              : 'progress'
            : appliedFilters.statusPo || undefined,
          id_vendor: appliedFilters.idVendor || undefined,
          start_date_po: appliedFilters.startDatePo || undefined,
          end_date_po: appliedFilters.endDatePo || undefined,
          start_date_kirim: appliedFilters.startDateKirim || undefined,
          end_date_kirim: appliedFilters.endDateKirim || undefined,
          sort_by: appliedFilters.sortBy || undefined,
          sort_order: appliedFilters.sortBy
            ? appliedFilters.sortOrder || 'DESC'
            : undefined,
        },
        withCredentials: true,
      });
      if (reqId !== listReqRef.current) return;
      console.log(`Fetched outstanding ${kind} data:`, res.data);
      setData(res.data.data || []);
      if (res.data.total_page) setTotalPages(res.data.total_page);
    } catch (error) {
      if (reqId !== listReqRef.current) return;
      console.error('Error fetching outstanding PO data:', error);
      setData([]);
      setToast({
        open: true,
        message: `Gagal memuat data ${
          isBooking ? 'PO Booking' : 'PO'
        } outstanding.`,
        severity: 'error',
      });
    } finally {
      if (reqId === listReqRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, subTab, kind, appliedFilters]);

  useEffect(() => {
    const fetchVendorOptions = async () => {
      const url = `${
        import.meta.env.VITE_API_LINK
      }/master/marketing/vendor/list`;
      try {
        setVendorOptionsLoading(true);
        const res = await axios.get(url, {
          params: { limit: 200, is_active: true },
          withCredentials: true,
        });
        setVendorOptions(res.data?.data || []);
      } catch (err) {
        console.error('Error fetching vendor options:', err);
        setVendorOptions([]);
      } finally {
        setVendorOptionsLoading(false);
      }
    };
    fetchVendorOptions();
  }, []);

  const handleApplyFilters = () => {
    setAppliedFilters(filterDraft);
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilterDraft(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  // Outstanding <-> Riwayat: bersihkan semua, termasuk pilihan.
  const handleSwitchTab = (tab: SubTab) => {
    if (tab === subTab) return;
    setSubTab(tab);
    setExpandedIds(new Set());
    setDetailCache({});
    setSelected(new Map());
    handleResetFilters();
  };

  // PO Normal <-> PO Booking: pilihan DIPERTAHANKAN supaya item dari kedua
  // jenis PO bisa dikirim dalam satu surat jalan.
  const handleKindChange = (next: POKind) => {
    if (next === kind) return;
    setKind(next);
    setExpandedIds(new Set());
    setDetailCache({});
    handleResetFilters();
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (appliedFilters.search) count += 1;
    if (appliedFilters.statusPo) count += 1;
    if (appliedFilters.idVendor) count += 1;
    if (appliedFilters.startDatePo) count += 1;
    if (appliedFilters.endDatePo) count += 1;
    if (appliedFilters.startDateKirim) count += 1;
    if (appliedFilters.endDateKirim) count += 1;
    if (appliedFilters.sortBy) count += 1;
    return count;
  }, [appliedFilters]);

  const fetchPoItems = async (po: PurchaseOrder) => {
    const key = rowKey(kind, po.id);
    setDetailCache((prev) => ({
      ...prev,
      [key]: { loading: true, error: '', items: prev[key]?.items || [] },
    }));
    try {
      let items: OutstandingItem[] = [];
      if (kind === 'booking') {
        const res = await axios.get<PurchaseOrderBookingDetailResponse>(
          `${poBaseUrl('booking')}/${po.id}`,
          { withCredentials: true },
        );
        items = (res.data.data.items || []).map(normalizeBookingItem);
      } else {
        const res = await axios.get<PurchaseOrderDetailResponse>(
          `${poBaseUrl('po')}/${po.id}`,
          { withCredentials: true },
        );
        const raw = res.data.data as unknown as {
          items_jo?: OutstandingItemJo[];
        };
        console.log(`Fetched items_jo for PO ${po.no_purchase_order}:`, raw);
        items = (raw.items_jo || []).map(normalizeJoItem);
      }
      setDetailCache((prev) => ({
        ...prev,
        [key]: { loading: false, error: '', items },
      }));
    } catch (err) {
      console.error('Error fetching PO detail:', err);
      setDetailCache((prev) => ({
        ...prev,
        [key]: {
          loading: false,
          error: isBooking
            ? 'Gagal memuat item untuk PO Booking ini.'
            : 'Gagal memuat item JO untuk PO ini.',
          items: [],
        },
      }));
    }
  };

  const toggleExpand = (po: PurchaseOrder) => {
    const key = rowKey(kind, po.id);
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
        if (!detailCache[key]) fetchPoItems(po);
      }
      return next;
    });
  };

  // PO Booking di tab Outstanding hanya menampilkan item yang masih progress
  // (dokumen flow 4.2). Di Riwayat dan untuk PO Normal tampil semua.
  const getVisibleItems = (items: OutstandingItem[]): OutstandingItem[] =>
    isBooking && !isHistory
      ? items.filter((it) => it.status_po === 'progress')
      : items;

  const buildSelectedRow = (
    po: PurchaseOrder,
    it: OutstandingItem,
  ): SelectedRow => ({
    key: rowKey(kind, it.id),
    kind,
    id: it.id,
    id_purchase_order: po.id,
    no_purchase_order: po.no_purchase_order,
    no_jo: it.no_jo,
    nama_item: it.nama_item,
    satuan: it.satuan,
    qty_po: it.qty_po,
    qty_sisa: it.qty_sisa,
  });

  const toggleItemSelected = (po: PurchaseOrder, it: OutstandingItem) => {
    const key = rowKey(kind, it.id);
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(key)) next.delete(key);
      else next.set(key, buildSelectedRow(po, it));
      return next;
    });
  };

  const toggleSelectAllForPo = (
    po: PurchaseOrder,
    items: OutstandingItem[],
  ) => {
    const allSelected = items.every((it) => selected.has(rowKey(kind, it.id)));
    setSelected((prev) => {
      const next = new Map(prev);
      if (allSelected) {
        items.forEach((it) => next.delete(rowKey(kind, it.id)));
      } else {
        items.forEach((it) =>
          next.set(rowKey(kind, it.id), buildSelectedRow(po, it)),
        );
      }
      return next;
    });
  };

  const selectedPoCount = useMemo(
    () =>
      new Set(
        Array.from(selected.values()).map((r) =>
          rowKey(r.kind, r.id_purchase_order),
        ),
      ).size,
    [selected],
  );

  const formRows: IncomingFormRow[] = useMemo(
    () =>
      Array.from(selected.values()).map((r) => ({
        key: r.key,
        kind: r.kind,
        id_purchase_order: r.id_purchase_order,
        no_purchase_order: r.no_purchase_order,
        item_id: r.id,
        no_jo: r.no_jo,
        nama_item: r.nama_item,
        satuan: r.satuan,
        qty_sisa: r.qty_sisa,
        qty_incoming: r.qty_sisa > 0 ? r.qty_sisa : r.qty_po,
        ada_idle: false,
        qty_idle: 0,
        qty_pallet: 0,
      })),
    [selected],
  );

  const handleSubmitted = (submittedKeys: string[]) => {
    setShowForm(false);
    setSelected((prev) => {
      const next = new Map(prev);
      submittedKeys.forEach((k) => next.delete(k));
      return next;
    });

    // Muat ulang item PO yang terdampak (status_qc berubah jadi "request qc").
    // Yang sedang terbuka di-refetch; yang tertutup cukup cache-nya dibuang.
    const affected = data.filter((po) => {
      const cache = detailCache[rowKey(kind, po.id)];
      return (
        cache &&
        cache.items.some((it) => submittedKeys.includes(rowKey(kind, it.id)))
      );
    });
    const toRefetch = affected.filter((po) =>
      expandedIds.has(rowKey(kind, po.id)),
    );
    const toDrop = affected.filter(
      (po) => !expandedIds.has(rowKey(kind, po.id)),
    );
    if (toDrop.length > 0) {
      setDetailCache((prev) => {
        const next = { ...prev };
        toDrop.forEach((po) => delete next[rowKey(kind, po.id)]);
        return next;
      });
    }
    toRefetch.forEach((po) => fetchPoItems(po));

    setToast({
      open: true,
      message: 'Data incoming berhasil dikirim ke QC.',
      severity: 'success',
    });
  };

  const renderExpandedContent = (po: PurchaseOrder) => {
    const cache = detailCache[rowKey(kind, po.id)];
    if (cache?.loading) {
      return (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-teal-500 border-t-transparent" />
        </div>
      );
    }
    if (cache?.error) {
      return (
        <p className="text-sm text-red-600 text-center py-4">{cache.error}</p>
      );
    }
    const items = cache ? getVisibleItems(cache.items) : [];
    if (items.length === 0) {
      return (
        <p className="text-sm text-slate-400 text-center py-4">
          {isBooking
            ? isHistory
              ? 'Tidak ada item pada PO Booking ini.'
              : 'Tidak ada item yang masih menunggu kedatangan.'
            : 'Tidak ada item JO pada PO ini.'}
        </p>
      );
    }

    return (
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {!isHistory && (
                  <th className="px-3 py-2.5 w-10">
                    <input
                      type="checkbox"
                      checked={items.every((it) =>
                        selected.has(rowKey(kind, it.id)),
                      )}
                      onChange={() => toggleSelectAllForPo(po, items)}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                  </th>
                )}
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                  {isBooking ? 'Kode' : 'No JO'}
                </th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                  Nama Barang
                </th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                  Tipe
                </th>
                <th className="px-3 py-2.5 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                  {isBooking ? 'Qty Beli' : 'Qty PO'}
                </th>
                <th className="px-3 py-2.5 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                  Qty Terkirim
                </th>
                <th className="px-3 py-2.5 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                  Sisa
                </th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                  Status PO
                </th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                  Status QC
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((it) => (
                <tr key={it.id} className="hover:bg-slate-50/70">
                  {!isHistory && (
                    <td className="px-3 py-2.5">
                      <input
                        type="checkbox"
                        checked={selected.has(rowKey(kind, it.id))}
                        onChange={() => toggleItemSelected(po, it)}
                        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                      />
                    </td>
                  )}
                  <td className="px-3 py-2.5 font-medium text-teal-700">
                    {isBooking ? it.kode_barang || '-' : it.no_jo}
                  </td>
                  <td className="px-3 py-2.5 text-slate-700">{it.nama_item}</td>
                  <td className="px-3 py-2.5 text-slate-500">
                    {it.tipe_barang || '-'}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {formatQty(it.qty_po)} {it.satuan}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {formatQty(it.qty_terkirim)} {it.satuan}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-semibold">
                    {it.qty_sisa > 0 ? (
                      <span className="text-amber-600">
                        {formatQty(it.qty_sisa)} {it.satuan}
                      </span>
                    ) : (
                      <span className="text-emerald-600">Lengkap</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${statusPoBadge(
                        it.status_po,
                      )}`}
                    >
                      {it.status_po === 'done' ? 'Selesai' : 'Progress'}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${statusQcBadge(
                        it.status_qc,
                      )}`}
                    >
                      {statusQcLabel(it.status_qc)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5 pb-20">
      {/* Sub tab level atas: PO Normal / PO Booking */}
      <POKindTabs value={kind} onChange={handleKindChange} />

      {/* Sub tabs: Outstanding vs Riwayat */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-1.5 inline-flex gap-1">
        <button
          onClick={() => handleSwitchTab('outstanding')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
            subTab === 'outstanding'
              ? 'bg-teal-600 text-white'
              : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          Outstanding
        </button>
        <button
          onClick={() => handleSwitchTab('history')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
            subTab === 'history'
              ? 'bg-teal-600 text-white'
              : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          Riwayat
        </button>
      </div>

      {/* Filter card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <div className="max-w-md">
          <label className="block text-xs font-medium text-slate-500 mb-1.5">
            Cari No PO / Nama Vendor
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ketik no PO atau nama vendor..."
              value={filterDraft.search}
              onChange={(e) =>
                setFilterDraft((f) => ({ ...f, search: e.target.value }))
              }
              onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <button
              onClick={handleApplyFilters}
              className="shrink-0 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Cari
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {/* status_po PO Booking ditentukan sub tab Outstanding/Riwayat */}
          {!isBooking && (
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Status PO
              </label>
              <select
                value={filterDraft.statusPo}
                onChange={(e) =>
                  setFilterDraft((f) => ({ ...f, statusPo: e.target.value }))
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                {STATUS_PO_FILTER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Vendor
            </label>
            <select
              value={filterDraft.idVendor}
              disabled={vendorOptionsLoading}
              onChange={(e) =>
                setFilterDraft((f) => ({
                  ...f,
                  idVendor: e.target.value ? Number(e.target.value) : '',
                }))
              }
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value="">
                {vendorOptionsLoading ? 'Memuat vendor...' : 'Semua Vendor'}
              </option>
              {vendorOptions.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.nama_vendor}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Tanggal PO
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="date"
                value={filterDraft.startDatePo}
                onChange={(e) =>
                  setFilterDraft((f) => ({
                    ...f,
                    startDatePo: e.target.value,
                  }))
                }
                className="min-w-0 flex-1 px-2.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              <span className="hidden sm:inline text-slate-300 text-xs shrink-0">
                —
              </span>
              <input
                type="date"
                value={filterDraft.endDatePo}
                onChange={(e) =>
                  setFilterDraft((f) => ({ ...f, endDatePo: e.target.value }))
                }
                className="min-w-0 flex-1 px-2.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Tanggal Kirim
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="date"
                value={filterDraft.startDateKirim}
                onChange={(e) =>
                  setFilterDraft((f) => ({
                    ...f,
                    startDateKirim: e.target.value,
                  }))
                }
                className="min-w-0 flex-1 px-2.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              <span className="hidden sm:inline text-slate-300 text-xs shrink-0">
                —
              </span>
              <input
                type="date"
                value={filterDraft.endDateKirim}
                onChange={(e) =>
                  setFilterDraft((f) => ({
                    ...f,
                    endDateKirim: e.target.value,
                  }))
                }
                className="min-w-0 flex-1 px-2.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Urutkan Berdasarkan
            </label>
            <select
              value={filterDraft.sortBy}
              onChange={(e) => {
                const val = e.target.value;
                setFilterDraft((f) => ({
                  ...f,
                  sortBy: val,
                  sortOrder: val ? f.sortOrder || 'DESC' : 'DESC',
                }));
              }}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              {SORT_BY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Arah Urutan
            </label>
            <select
              value={filterDraft.sortOrder}
              disabled={!filterDraft.sortBy}
              onChange={(e) =>
                setFilterDraft((f) => ({ ...f, sortOrder: e.target.value }))
              }
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value="DESC">Terbaru dulu (DESC)</option>
              <option value="ASC">Terlama dulu (ASC)</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 justify-end mt-4">
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
          >
            Reset Filter
          </button>
          <button
            onClick={handleApplyFilters}
            className="px-4 py-2 text-sm bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
          >
            Terapkan Filter
          </button>
        </div>

        {activeFilterCount > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-slate-500">
              {activeFilterCount} filter aktif
            </span>
            <button
              onClick={handleResetFilters}
              className="text-xs font-medium text-teal-600 hover:text-teal-800 transition-colors"
            >
              Reset semua filter
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-3 py-3 w-8"></th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  No PO
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Vendor
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Tanggal PO
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Tanggal Kirim
                </th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Total
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-14 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-7 w-7 border-2 border-teal-500 border-t-transparent"></div>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-14 text-center">
                    <p className="text-slate-600 font-medium text-sm">
                      {EMPTY_TEXT[kind][isHistory ? 'history' : 'outstanding']}
                    </p>
                    {activeFilterCount > 0 && (
                      <p className="text-slate-400 text-xs mt-1">
                        Coba ubah atau reset filter pencarian.
                      </p>
                    )}
                  </td>
                </tr>
              ) : (
                data.map((po) => {
                  const key = rowKey(kind, po.id);
                  const isExpanded = expandedIds.has(key);
                  return (
                    <React.Fragment key={key}>
                      <tr
                        className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                        onClick={() => toggleExpand(po)}
                      >
                        <td className="px-3 py-3">
                          <svg
                            className={`w-4 h-4 text-teal-500 transition-transform ${
                              isExpanded ? 'rotate-90' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </td>
                        <td className="px-3 py-3 font-medium text-teal-700">
                          {po.no_purchase_order}
                        </td>
                        <td className="px-3 py-3 text-slate-700">
                          {po.nama_vendor || '-'}
                        </td>
                        <td className="px-3 py-3 text-slate-600 whitespace-nowrap">
                          {formatDate(po.tgl_po)}
                        </td>
                        <td className="px-3 py-3 text-slate-600 whitespace-nowrap">
                          {formatDate(po.tgl_kirim)}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums text-slate-800 font-medium">
                          Rp {formatRupiah(po.total)}
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ring-1 font-medium ${getStatusColor(
                              po.status,
                            )}`}
                          >
                            {getStatusLabel(po.status)}
                          </span>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr>
                          <td colSpan={7} className="bg-slate-50/60 px-4 py-4">
                            {renderExpandedContent(po)}
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
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Baris per halaman:</span>
          <div className="flex gap-1.5">
            {[10, 25, 50, 100].map((pageSize) => (
              <button
                key={pageSize}
                onClick={() => handleLimitChange(pageSize)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  limit === pageSize
                    ? 'bg-teal-600 text-white'
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

      {/* Floating selection bar — muncul begitu ada yang dicentang, lintas PO
          dan lintas kind; disembunyikan di tab Riwayat */}
      {!isHistory && selected.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 flex justify-center px-4 pb-4">
          <div className="bg-slate-900 text-white rounded-2xl shadow-xl px-5 py-3 flex items-center gap-4">
            <p className="text-sm">
              <span className="font-semibold">{selected.size}</span> item
              dipilih dari{' '}
              <span className="font-semibold">{selectedPoCount}</span> PO
            </p>
            <button
              onClick={() => setSelected(new Map())}
              className="text-xs text-slate-300 hover:text-white transition-colors"
            >
              Batal pilih
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-1.5 text-sm bg-teal-500 hover:bg-teal-400 text-slate-900 font-semibold rounded-lg transition-colors"
            >
              Proses Incoming
            </button>
          </div>
        </div>
      )}

      {!isHistory && showForm && (
        <IncomingFormModal
          rows={formRows}
          onClose={() => setShowForm(false)}
          onSubmitted={handleSubmitted}
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

export default OutstandingPO;
