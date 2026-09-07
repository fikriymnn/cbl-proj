import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
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
} from '../Purchasing/Types/Purchasing.types';
import {
  formatDate,
  formatRupiah,
  getStatusColor,
  getStatusLabel,
} from '../Purchasing/Types/poStatus';
import { usePermissions } from '../../../constant/usePermissions';

/* =============================================================================
 * PurchasingMonitoringPO — route: /purchasing/monitoring-po
 *
 * List-level filter: status = 'approve finance' AND status_po = 'progress'.
 * Once a PO leaves 'progress' (status_po -> 'done', 'request cancel', or
 * 'cancel') it drops out of this list, since monitoring only cares about
 * POs still actively in progress.
 *
 * Each row expands INLINE to show its items_jo, same as OutstandingPO.
 * Unlike OutstandingPO there is no cross-PO checkbox selection here — the
 * actions available are per-row instead:
 *   - Per PO: "Aksi PO" -> opens a choice modal between:
 *       a) "Tutup PO"        -> PUT /purchasing/purchaseOrder/close/:id_po
 *       b) "Ajukan Cancel PO" -> POST /purchasing/requestCancelpurchaseOrder
 *          { id_purchase_order, note }. This only *requests* a cancel —
 *          the PO isn't actually cancelled until finance approves it
 *          (status_po becomes 'request cancel' in the meantime, then
 *          'cancel' once approved). Either way the PO stops matching this
 *          list's status_po = 'progress' filter, so we drop it locally.
 *   - Per item_jo: "Kirim Balik ke Request" -> PUT
 *     /purchasing/purchaseOrder/sendBack/:id_items_jo, with body
 *     { id_item, id_brand, nama_item, nama_brand, qty_sendback }.
 *     qty_sendback is capped at the row's qty_sisa (sisa kebutuhan) — you
 *     can't send back more than what's still outstanding.
 *
 * Both actions are gated behind edit permission for this route via
 * usePermissions, mirroring how BAPFg gates "Buat BAP" behind create
 * permission.
 *
 * Progress bars: shown at BOTH levels now.
 *   - Per item_jo (inside the expanded detail table): qty_po vs
 *     qty_terkirim for that single JO/item.
 *   - Per PO (on the collapsed row): qty_po vs qty_terkirim summed across
 *     all of that PO's items_jo — the "induk" bar. Computed straight from
 *     po.items_jo, which the list endpoint (/purchasing/purchaseOrder)
 *     already returns inline per PO, so it renders without needing the
 *     row to be expanded first; falls back to detailCache if items_jo
 *     ever comes back empty on the list response.
 * Both use the same color scale as SO Monitoring's progress bar (purple =
 * over qty, green = done, blue = mid-progress, yellow = just started), so
 * all three monitoring tables read consistently.
 *
 * status_qc on items_jo: null | "request qc" | "approve qc" | "reject qc"
 * status_po on items_jo: "progress" | "done"
 * status_po on the PO itself: "progress" | "done" | "request cancel" | "cancel"
 * ========================================================================== */

const ROUTE_PATH = '/purchasing/monitoring-po';

const EMPTY_TEXT = 'Tidak ada PO yang sedang dimonitor.';

// status_po values accepted by GET /purchasing/purchaseOrder's status_po
// filter param.
const STATUS_PO_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: 'progress', label: 'Progress' },
  { value: 'done', label: 'Selesai' },
  { value: 'request cancel', label: 'Menunggu Cancel' },
  { value: 'cancel', label: 'Dibatalkan' },
];

interface VendorOption {
  id: number;
  nama_vendor: string;
}

// Everything GET /purchasing/purchaseOrder's list filter accepts, besides
// pagination (page/limit) which is tracked separately. Kept as one shape
// so "draft" (what's currently typed/selected) and "applied" (what the
// last fetch actually used) can be plain snapshots of the same type.
interface MonitoringFilters {
  search: string;
  statusPo: string;
  idVendor: number | '';
  startDatePo: string;
  endDatePo: string;
  startDateKirim: string;
  endDateKirim: string;
}

const DEFAULT_FILTERS: MonitoringFilters = {
  search: '',
  statusPo: 'progress',
  idVendor: '',
  startDatePo: '',
  endDatePo: '',
  startDateKirim: '',
  endDateKirim: '',
};

// PurchaseOrder from shared types may not yet carry status_po, or the
// aggregate qty fields used for the PO-level progress bar — extend
// locally rather than touching the shared type file.
type MonitoredPO = PurchaseOrder & {
  status_po?: 'progress' | 'done' | 'request cancel' | 'cancel';
  // The list endpoint (/purchasing/purchaseOrder) already returns each
  // PO's items_jo inline — used to build the PO-level progress bar
  // straight from the list response, without waiting for the per-row
  // detail fetch that only runs once a row is expanded.
  items_jo?: MonitoringItemJo[];
};

interface MonitoringItemJo {
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
}

const formatQty = (val: number | null | undefined): string =>
  (val ?? 0).toLocaleString('id-ID');

const statusPoBadge = (status: string | undefined): string => {
  if (status === 'done') return 'bg-emerald-50 text-emerald-700';
  if (status === 'cancel') return 'bg-red-50 text-red-700';
  if (status === 'request cancel') return 'bg-orange-50 text-orange-700';
  return 'bg-teal-50 text-teal-700'; // progress
};

const statusPoLabel = (status: string | undefined): string => {
  if (status === 'done') return 'Selesai';
  if (status === 'cancel') return 'Dibatalkan';
  if (status === 'request cancel') return 'Menunggu Cancel';
  return 'Progress';
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

// ─── Progress bar (qty_po vs qty_terkirim) — shared by item rows and PO rows ─

interface ProgressStats {
  shipped: number;
  total: number;
  pct: number;
  isOver: boolean;
  status: 'over qty' | 'selesai' | 'kurang qty' | 'belum kirim';
}

// Generic qty-vs-shipped calculation, used both per item_jo (its own
// qty_po/qty_terkirim) and per PO (summed across its items_jo).
const calcProgress = (
  total: number | null | undefined,
  shipped: number | null | undefined,
): ProgressStats | null => {
  if (!total) return null;
  const s = shipped ?? 0;
  const pct = Math.min(Math.round((s / total) * 100), 100);
  const isOver = s > total;
  const status: ProgressStats['status'] = isOver
    ? 'over qty'
    : s === total
    ? 'selesai'
    : s > 0
    ? 'kurang qty'
    : 'belum kirim';
  return { shipped: s, total, pct, isOver, status };
};

// PO-level progress = qty_po/qty_terkirim summed across its items_jo.
// Prefers po.items_jo, which the list endpoint already returns inline, so
// the bar renders on the collapsed row without waiting on anything else.
// Falls back to items already fetched into detailCache (once the row has
// been expanded) if items_jo wasn't present on the list response.
const calcPoProgress = (
  po: MonitoredPO,
  cachedItems?: MonitoringItemJo[],
): ProgressStats | null => {
  const items =
    po.items_jo && po.items_jo.length > 0 ? po.items_jo : cachedItems;
  if (!items || items.length === 0) return null;
  const total = items.reduce((sum, it) => sum + (it.qty_po || 0), 0);
  const shipped = items.reduce((sum, it) => sum + (it.qty_terkirim || 0), 0);
  return calcProgress(total, shipped);
};

// Same visual language as the progress bar in SO Monitoring — purple when
// over qty, green when done, blue mid-progress, yellow just started — so
// the two monitoring screens read consistently.
const ProgressBar: React.FC<{ pct: number; isOver?: boolean }> = ({
  pct,
  isOver,
}) => {
  const color = isOver
    ? 'bg-purple-500'
    : pct === 100
    ? 'bg-green-500'
    : pct >= 50
    ? 'bg-blue-500'
    : 'bg-yellow-400';
  return (
    <div className="flex items-center gap-1.5 min-w-[90px]">
      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
        <div
          className={`${color} h-1.5 rounded-full transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span
        className={`text-[10px] font-semibold whitespace-nowrap ${
          isOver ? 'text-purple-600' : 'text-gray-600'
        }`}
      >
        {isOver ? '>100%' : `${pct}%`}
      </span>
    </div>
  );
};

// ─── NumberInput — id-ID formatted number field (ported from CreatePOModal) ─
// Text input formatted with id-ID thousands separators ("1.000") that also
// accepts a comma as the decimal separator ("0,64"). Never shows a forced
// "0", and still reports a plain number to `onChange` (state stays
// untouched by formatting). The UI's smallest supported unit is 0,01 — a
// non-zero value finer than that is rounded UP to 0,01 rather than down to
// 0, since a real quantity shouldn't silently vanish. Supports an optional
// `max`, so callers can cap entry (e.g. qty_sendback can't exceed sisa
// kebutuhan) the same way `min` already caps the low end.

const EPSILON = 1e-9;

const formatNumberID = (value: number): string => {
  if (!value) return '';
  return value.toLocaleString('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

// Keeps only digits and a single comma (decimal separator) while the user
// is typing. Thousands separators ('.') get stripped since the display is
// regrouped from scratch, and only the first comma typed counts as the
// decimal point — extras are ignored.
const sanitizeNumericInput = (raw: string): string => {
  let out = '';
  let commaUsed = false;
  for (const ch of raw) {
    if (ch >= '0' && ch <= '9') {
      out += ch;
    } else if (ch === ',' && !commaUsed) {
      out += ',';
      commaUsed = true;
    }
  }
  return out;
};

// Formats what's currently being typed, WITHOUT rounding or collapsing
// anything to empty — this is what makes "0", "0,", and "0,5" actually
// typeable. Groups the integer part with id-ID thousands separators as the
// user goes, but preserves a trailing comma and up to 2 fraction digits
// exactly as typed (including "0,05", "0,0", etc.).
const formatTypingDisplay = (sanitized: string): string => {
  if (!sanitized) return '';
  const hasComma = sanitized.includes(',');
  const [intPartRaw, fracPartRaw] = sanitized.split(',');
  // Collapse leading zeros ("007" -> "7") but keep a single "0" so the
  // user can still build "0", "0,5", "0,05" one keystroke at a time.
  const intDigits = (intPartRaw || '').replace(/^0+(?=\d)/, '') || '0';
  const groupedInt = Number(intDigits).toLocaleString('id-ID');
  const fracPart = hasComma ? (fracPartRaw || '').slice(0, 2) : '';
  return hasComma ? `${groupedInt},${fracPart}` : groupedInt;
};

// Parses a sanitized id-ID numeric string ("1234,5" -> 1234.5). The
// fractional part is capped at 2 digits, since 0,01 is the smallest unit
// the UI supports. A bare "0" or a dangling "0," parses as 0, same as an
// empty field — that's expected mid-typing, not an error.
const parseNumberID = (raw: string): number => {
  const sanitized = sanitizeNumericInput(raw);
  if (!sanitized) return 0;
  const [intPartRaw, fracPartRaw] = sanitized.split(',');
  const intPart = intPartRaw || '0';
  const fracPart = fracPartRaw ? fracPartRaw.slice(0, 2) : '';
  const parsed = parseFloat(fracPart ? `${intPart}.${fracPart}` : intPart);
  return Number.isNaN(parsed) ? 0 : parsed;
};

// A non-zero value smaller than 0,01 gets rounded UP to 0,01 instead of
// down to 0 — a real quantity shouldn't silently vanish just because it
// was too fine to represent. Anything else rounds to the nearest 0,01.
// Only used for values arriving from OUTSIDE the field — never while the
// user is actively typing, since typed input is already capped at 2
// decimals by formatTypingDisplay.
const roundToSupportedPrecision = (value: number): number => {
  if (!value) return 0;
  const rounded = Math.round(value * 100) / 100;
  if (rounded === 0 && value > 0) return 0.01;
  if (rounded === 0 && value < 0) return -0.01;
  return rounded;
};

type NumberInputProps = {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  disabled?: boolean;
};

const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  className,
  placeholder,
  min = 0,
  max,
  disabled,
}) => {
  const [display, setDisplay] = useState<string>(() =>
    formatNumberID(roundToSupportedPrecision(value)),
  );
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const rounded = roundToSupportedPrecision(value);
  const wasRounded = !isFocused && Math.abs(rounded - value) > EPSILON;

  // Clamp to [min, max] — max is optional so existing callers that never
  // passed it behave exactly as before.
  const clamp = (v: number): number => {
    let out = Math.max(v, min);
    if (max !== undefined) out = Math.min(out, max);
    return out;
  };

  // Stay in sync when the underlying value changes from OUTSIDE this input.
  // Skipped entirely while the field is focused, so it never fights the
  // user's in-progress typing.
  useEffect(() => {
    if (isFocused) return;
    const r = roundToSupportedPrecision(value);
    setDisplay(formatNumberID(r));
    if (Math.abs(r - value) > EPSILON) {
      onChange(r);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, isFocused]);

  return (
    <div className="w-full">
      <input
        type="text"
        inputMode="decimal"
        value={display}
        placeholder={placeholder ?? '0'}
        disabled={disabled}
        title={
          wasRounded
            ? `Nilai asli: ${value.toLocaleString('id-ID', {
                maximumFractionDigits: 6,
              })} — dibulatkan ke 0,01`
            : undefined
        }
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          const parsed = clamp(
            roundToSupportedPrecision(parseNumberID(display)),
          );
          setDisplay(parsed === 0 ? '' : formatNumberID(parsed));
          onChange(parsed);
        }}
        onChange={(e) => {
          const sanitized = sanitizeNumericInput(e.target.value);
          setDisplay(formatTypingDisplay(sanitized));
          onChange(clamp(parseNumberID(sanitized)));
        }}
        className={className}
      />
      {wasRounded && (
        <span className="block text-[10px] text-amber-600 mt-0.5 whitespace-nowrap">
          *asli {value.toLocaleString('id-ID', { maximumFractionDigits: 6 })},
          dibulatkan
        </span>
      )}
    </div>
  );
};

// ─── Master data used only for the send-back substitute picker ────────────

interface MasterBarangItem {
  id: number;
  id_brand: number;
  kode_barang: string;
  nama_barang: string;
  sub_kategori: string | null;
  purchase_unit_name: string;
  brand_name: string;
  harga: number;
}

interface MasterBarangListResponse {
  data: MasterBarangItem[];
  total_page: number;
}

interface MasterBrandItem {
  id: number;
  kode_brand: string;
  nama_brand: string;
}

interface MasterBrandListResponse {
  data: MasterBrandItem[];
  total_page: number;
}

// brand_name on master/barang isn't reliably populated — resolve by id
// against the master/brand map first, same as CreatePOModal does.
const resolveBrandName = (
  idBrand: number | null | undefined,
  brandMap: Map<number, string>,
  fallback: string,
): string => {
  if (idBrand && brandMap.has(idBrand)) {
    return brandMap.get(idBrand) as string;
  }
  return fallback || '';
};

interface SendBackTargetItem {
  id_item: number;
  id_brand: number | null;
  nama_item: string;
  nama_brand: string;
  satuan: string;
  is_substitute: boolean;
}

// =============================================================================
// Send Back modal — sends a single items_jo row back to request stage.
// By default id_item / id_brand / nama_item / nama_brand mirror the row
// itself, but the user can pick a different item from master/barang — as
// long as it's in the same category (sub_kategori / tipe_barang) as the
// original — and send THAT back instead. qty_sendback is always editable,
// capped by the row's qty_sisa (sisa kebutuhan) — you can never send back
// more than what's still outstanding on this JO, regardless of which
// item/substitute is currently targeted.
// =============================================================================
const SendBackModal: React.FC<{
  item: MonitoringItemJo;
  onClose: () => void;
  onSubmitted: () => void;
}> = ({ item, onClose, onSubmitted }) => {
  const originalTarget: SendBackTargetItem = {
    id_item: item.id_item,
    id_brand: item.id_brand,
    nama_item: item.nama_item,
    nama_brand: item.nama_brand,
    satuan: item.satuan,
    is_substitute: false,
  };

  const [target, setTarget] = useState<SendBackTargetItem>(originalTarget);
  const [qtySendback, setQtySendback] = useState<number>(0);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // --- Master Brand (id -> nama_brand), used to resolve brand names for
  // master/barang picker results, same as CreatePOModal ---
  const [brandMap, setBrandMap] = useState<Map<number, string>>(new Map());

  useEffect(() => {
    const fetchBrands = async () => {
      const url = `${import.meta.env.VITE_API_LINK}/master/brand`;
      try {
        const res = await axios.get<MasterBrandListResponse>(url, {
          params: { limit: 1000 },
          withCredentials: true,
        });
        const map = new Map<number, string>();
        (res.data.data || []).forEach((b) => map.set(b.id, b.nama_brand));
        setBrandMap(map);
      } catch (err) {
        console.error('Error fetching master brand list:', err);
      }
    };
    fetchBrands();
  }, []);

  // --- Substitute-item picker (same category as the original item) ---
  const [pickerOpen, setPickerOpen] = useState<boolean>(false);
  const [pickerSearchInput, setPickerSearchInput] = useState<string>('');
  const [pickerResults, setPickerResults] = useState<MasterBarangItem[]>([]);
  const [pickerLoading, setPickerLoading] = useState<boolean>(false);

  const fetchPickerResults = async () => {
    const url = `${import.meta.env.VITE_API_LINK}/master/barang`;
    try {
      setPickerLoading(true);
      const res = await axios.get<MasterBarangListResponse>(url, {
        params: {
          page: 1,
          limit: 20,
          search: pickerSearchInput || undefined,
          // sub_kategori is the category field on MasterBarang — matches
          // this items_jo row's own tipe_barang.
          sub_kategori: item.tipe_barang || undefined,
        },
        withCredentials: true,
      });
      // Don't offer the item currently selected on this row again.
      setPickerResults(
        (res.data.data || []).filter((mi) => mi.id !== target.id_item),
      );
    } catch (err) {
      console.error('Error fetching master barang list:', err);
      setPickerResults([]);
    } finally {
      setPickerLoading(false);
    }
  };

  useEffect(() => {
    if (pickerOpen) fetchPickerResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickerOpen]);

  const openPicker = () => {
    setPickerSearchInput('');
    setPickerResults([]);
    setPickerOpen(true);
  };

  const closePicker = () => setPickerOpen(false);

  const handlePickSubstitute = (masterItem: MasterBarangItem) => {
    setTarget({
      id_item: masterItem.id,
      id_brand: masterItem.id_brand ?? null,
      nama_item: masterItem.nama_barang,
      nama_brand: resolveBrandName(
        masterItem.id_brand,
        brandMap,
        masterItem.brand_name,
      ),
      // purchase_unit_name isn't guaranteed on the response — a same-
      // category substitute is virtually always bought in the same unit
      // as the original, so fall back to that.
      satuan: masterItem.purchase_unit_name || item.satuan,
      is_substitute: true,
    });
    closePicker();
  };

  const handleUseOriginal = () => setTarget(originalTarget);

  const handleSubmit = async () => {
    if (qtySendback <= 0) {
      setError('Jumlah yang dikirim balik harus lebih dari 0.');
      return;
    }
    if (qtySendback > item.qty_sisa) {
      setError(
        `Jumlah yang dikirim balik tidak boleh lebih dari sisa kebutuhan (${formatQty(
          item.qty_sisa,
        )} ${item.satuan}).`,
      );
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const url = `${
        import.meta.env.VITE_API_LINK
      }/purchasing/purchaseOrder/sendBack/${item.id}`;
      await axios.put(
        url,
        {
          id_item: target.id_item,
          id_brand: target.id_brand,
          nama_item: target.nama_item,
          nama_brand: target.nama_brand,
          qty_sendback: qtySendback,
        },
        { withCredentials: true },
      );
      onSubmitted();
    } catch (err) {
      console.error('Error sending item back to request:', err);
      setError('Gagal mengirim balik item ini. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Dialog
        open
        onClose={submitting ? undefined : onClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle className="!pb-1">
          Kirim Balik ke Request
          <span className="block text-xs font-normal text-slate-400 mt-0.5">
            {item.no_jo} — {item.nama_item}
          </span>
        </DialogTitle>
        <DialogContent>
          <div className="mt-1 mb-4 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5 text-xs text-amber-700">
            Item ini akan dikembalikan ke tahap request. Secara default item dan
            brand yang dikirim balik sama dengan baris ini, tapi bisa diganti
            dengan item lain dari kategori yang sama ({item.tipe_barang || '-'}
            ).
          </div>

          <label className="block text-[11px] font-medium text-slate-500 mb-1">
            Item yang Dikirim Balik
          </label>
          <div className="flex items-start justify-between gap-3 border border-slate-200 rounded-lg px-3 py-2.5 mb-4 bg-slate-50">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm font-medium text-slate-800 truncate">
                  {target.nama_item || '-'}
                </span>
                {target.is_substitute && (
                  <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 font-medium">
                    Pengganti
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Brand: {target.nama_brand || '-'} · Unit: {target.satuan || '-'}
              </p>
            </div>
            <div className="shrink-0 flex flex-col items-end gap-1">
              <button
                onClick={openPicker}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors whitespace-nowrap"
              >
                Ganti Item
              </button>
              {target.is_substitute && (
                <button
                  onClick={handleUseOriginal}
                  className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors whitespace-nowrap"
                >
                  Gunakan item asli
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                Qty PO
              </label>
              <div className="px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
                {formatQty(item.qty_po)} {item.satuan}
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                Sisa Kebutuhan
              </label>
              <div className="px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
                {formatQty(item.qty_sisa)} {item.satuan}
              </div>
            </div>
          </div>

          <label className="block text-[11px] font-medium text-slate-500 mb-1">
            Jumlah Dikirim Balik
          </label>
          <NumberInput
            value={qtySendback}
            onChange={setQtySendback}
            max={item.qty_sisa}
            className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Maks. {formatQty(item.qty_sisa)} {item.satuan} (sisa kebutuhan).
          </p>

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
              disabled={submitting}
              className="px-5 py-2 text-sm bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {submitting ? 'Mengirim...' : 'Kirim Balik'}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Substitute item picker — same category as this row's tipe_barang */}
      <Dialog open={pickerOpen} onClose={closePicker} fullWidth maxWidth="sm">
        <DialogTitle>
          Pilih Item Pengganti
          <span className="block text-xs font-normal text-slate-400 mt-0.5">
            Kategori: {item.tipe_barang || '-'} · untuk {item.no_jo}
          </span>
        </DialogTitle>
        <DialogContent>
          <div className="flex gap-2 mb-3 mt-1">
            <input
              type="text"
              value={pickerSearchInput}
              onChange={(e) => setPickerSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchPickerResults()}
              placeholder="Cari nama atau kode barang..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={fetchPickerResults}
              className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Cari
            </button>
          </div>

          {pickerLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-7 w-7 border-2 border-indigo-500 border-t-transparent" />
            </div>
          ) : pickerResults.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-10">
              Tidak ada item ditemukan untuk kategori ini.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto -mx-1">
              {pickerResults.map((mi) => (
                <button
                  key={mi.id}
                  onClick={() => handlePickSubstitute(mi)}
                  className="w-full text-left px-3 py-2.5 hover:bg-slate-50 rounded-lg flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">
                      {mi.nama_barang}
                    </div>
                    <div className="text-xs text-slate-400 truncate">
                      {mi.kode_barang || '-'} ·{' '}
                      {resolveBrandName(mi.id_brand, brandMap, mi.brand_name) ||
                        '-'}{' '}
                      · {mi.purchase_unit_name || item.satuan || '-'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

// =============================================================================
// Close PO confirmation modal
// =============================================================================
const ClosePoModal: React.FC<{
  po: MonitoredPO;
  onClose: () => void;
  onConfirmed: () => void;
}> = ({ po, onClose, onConfirmed }) => {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleConfirm = async () => {
    setError('');
    setSubmitting(true);
    try {
      const url = `${
        import.meta.env.VITE_API_LINK
      }/purchasing/purchaseOrder/close/${po.id}`;
      await axios.put(url, {}, { withCredentials: true });
      onConfirmed();
    } catch (err) {
      console.error('Error closing PO:', err);
      setError('Gagal menutup PO ini. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open
      onClose={submitting ? undefined : onClose}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle className="!pb-1">Tutup PO</DialogTitle>
      <DialogContent>
        <p className="text-sm text-slate-600 mt-1">
          Yakin ingin menutup PO{' '}
          <span className="font-semibold text-slate-800">
            {po.no_purchase_order}
          </span>
          ? PO yang sudah ditutup tidak akan muncul lagi di daftar monitoring.
        </p>

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
            onClick={handleConfirm}
            disabled={submitting}
            className="px-5 py-2 text-sm bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            {submitting ? 'Menutup...' : 'Ya, Tutup PO'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// =============================================================================
// Aksi PO choice modal — first thing shown when the row's action button is
// pressed. Lets the user pick between the existing "Tutup PO" flow and the
// new "Ajukan Cancel PO" flow, instead of jumping straight into one of them.
// =============================================================================
const PoActionChoiceModal: React.FC<{
  po: MonitoredPO;
  onClose: () => void;
  onPickClose: () => void;
  onPickCancel: () => void;
}> = ({ po, onClose, onPickClose, onPickCancel }) => (
  <Dialog open onClose={onClose} fullWidth maxWidth="xs">
    <DialogTitle className="!pb-1">Aksi untuk PO</DialogTitle>
    <DialogContent>
      <p className="text-sm text-slate-600 mt-1 mb-4">
        Pilih tindakan untuk PO{' '}
        <span className="font-semibold text-slate-800">
          {po.no_purchase_order}
        </span>
        .
      </p>
      <div className="space-y-2 pb-1">
        <button
          onClick={onPickClose}
          className="w-full text-left px-4 py-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <span className="block text-sm font-medium text-slate-800">
            Tutup PO
          </span>
          <span className="block text-xs text-slate-400 mt-0.5">
            PO selesai dan tidak akan muncul lagi di daftar monitoring.
          </span>
        </button>
        <button
          onClick={onPickCancel}
          className="w-full text-left px-4 py-3 border border-slate-200 rounded-lg hover:bg-red-50 transition-colors"
        >
          <span className="block text-sm font-medium text-red-600">
            Ajukan Cancel PO
          </span>
          <span className="block text-xs text-slate-400 mt-0.5">
            Mengajukan pembatalan PO — memerlukan approve dari finance sebelum
            benar-benar dibatalkan.
          </span>
        </button>
      </div>
      <div className="flex justify-end mt-4">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          Batal
        </button>
      </div>
    </DialogContent>
  </Dialog>
);

// =============================================================================
// Request Cancel PO modal — POST /purchasing/requestCancelpurchaseOrder
// { id_purchase_order, note }. This only requests the cancellation; the PO
// moves to status_po = 'request cancel' pending finance approval, so it
// still needs a reason/note attached.
// =============================================================================
const RequestCancelPoModal: React.FC<{
  po: MonitoredPO;
  onClose: () => void;
  onConfirmed: () => void;
}> = ({ po, onClose, onConfirmed }) => {
  const [note, setNote] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleConfirm = async () => {
    if (!note.trim()) {
      setError('Catatan alasan cancel wajib diisi.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const url = `${
        import.meta.env.VITE_API_LINK
      }/purchasing/requestCancelpurchaseOrder`;
      await axios.post(
        url,
        { id_purchase_order: po.id, note: note.trim() },
        { withCredentials: true },
      );
      onConfirmed();
    } catch (err) {
      console.error('Error requesting PO cancel:', err);
      setError('Gagal mengajukan cancel PO ini. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open
      onClose={submitting ? undefined : onClose}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle className="!pb-1">Ajukan Cancel PO</DialogTitle>
      <DialogContent>
        <p className="text-sm text-slate-600 mt-1">
          PO{' '}
          <span className="font-semibold text-slate-800">
            {po.no_purchase_order}
          </span>{' '}
          akan diajukan untuk dibatalkan. Permintaan ini perlu disetujui oleh
          finance sebelum PO benar-benar dibatalkan.
        </p>

        <label className="block text-[11px] font-medium text-slate-500 mt-4 mb-1">
          Catatan / Alasan Cancel
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Contoh: PO salah input, vendor tidak sanggup kirim, dll."
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
        />

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
            onClick={handleConfirm}
            disabled={submitting}
            className="px-5 py-2 text-sm bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            {submitting ? 'Mengirim...' : 'Ajukan Cancel'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// =============================================================================
// Main list page
// =============================================================================
const PurchasingMonitoringPO: React.FC = () => {
  // ── Permissions ──
  const role = localStorage.getItem('userRole') ?? '';
  const bagian = localStorage.getItem('userBagian') ?? '';
  const { checkEdit } = usePermissions(role, bagian);
  const canEdit = checkEdit(ROUTE_PATH);

  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<MonitoredPO[]>([]);

  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  // "Draft" mirrors whatever is currently typed/selected in the filter
  // card; "applied" is the snapshot actually sent to fetchData. Filters
  // only take effect on "Terapkan Filter" (or Enter in the search box) —
  // not on every keystroke/selection — same pattern the search box always
  // used, just extended to the new fields.
  const [filterDraft, setFilterDraft] =
    useState<MonitoringFilters>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<MonitoringFilters>(DEFAULT_FILTERS);

  // Vendor dropdown options for the id_vendor filter.
  const [vendorOptions, setVendorOptions] = useState<VendorOption[]>([]);
  const [vendorOptionsLoading, setVendorOptionsLoading] =
    useState<boolean>(true);

  // Inline expand state, keyed by PO id.
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [detailCache, setDetailCache] = useState<
    Record<
      number,
      { loading: boolean; error: string; items: MonitoringItemJo[] }
    >
  >({});

  // Row-scoped action state.
  const [sendBackTarget, setSendBackTarget] = useState<MonitoringItemJo | null>(
    null,
  );
  const [actionChoiceTarget, setActionChoiceTarget] =
    useState<MonitoredPO | null>(null);
  const [closeTarget, setCloseTarget] = useState<MonitoredPO | null>(null);
  const [cancelTarget, setCancelTarget] = useState<MonitoredPO | null>(null);

  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'success' });

  const fetchData = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/purchasing/purchaseOrder`;
    try {
      setLoading(true);
      const res = await axios.get<PurchaseOrderListResponse>(url, {
        params: {
          page,
          limit,
          search: appliedFilters.search || undefined,
          status: 'approve finance',
          status_po: appliedFilters.statusPo || undefined,
          start_date_po: appliedFilters.startDatePo || undefined,
          end_date_po: appliedFilters.endDatePo || undefined,
          start_date_kirim: appliedFilters.startDateKirim || undefined,
          end_date_kirim: appliedFilters.endDateKirim || undefined,
          id_vendor: appliedFilters.idVendor || undefined,
        },
        withCredentials: true,
      });
      setData((res.data.data as MonitoredPO[]) || []);
      if (res.data.total_page) setTotalPages(res.data.total_page);
    } catch (error) {
      console.error('Error fetching monitoring PO data:', error);
      setData([]);
      setToast({
        open: true,
        message: 'Gagal memuat data monitoring PO.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, appliedFilters]);

  // Vendor options for the id_vendor filter — fetched once on mount, same
  // endpoint CreatePOModal uses for its vendor picker.
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

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (appliedFilters.search) count += 1;
    if (appliedFilters.statusPo !== DEFAULT_FILTERS.statusPo) count += 1;
    if (appliedFilters.idVendor) count += 1;
    if (appliedFilters.startDatePo) count += 1;
    if (appliedFilters.endDatePo) count += 1;
    if (appliedFilters.startDateKirim) count += 1;
    if (appliedFilters.endDateKirim) count += 1;
    return count;
  }, [appliedFilters]);

  const fetchPoItems = async (po: MonitoredPO) => {
    setDetailCache((prev) => ({
      ...prev,
      [po.id]: { loading: true, error: '', items: prev[po.id]?.items || [] },
    }));
    try {
      const url = `${import.meta.env.VITE_API_LINK}/purchasing/purchaseOrder/${
        po.id
      }`;
      const res = await axios.get<PurchaseOrderDetailResponse>(url, {
        withCredentials: true,
      });
      const raw = res.data.data as unknown as { items_jo?: MonitoringItemJo[] };
      setDetailCache((prev) => ({
        ...prev,
        [po.id]: { loading: false, error: '', items: raw.items_jo || [] },
      }));
    } catch (err) {
      console.error('Error fetching PO detail:', err);
      setDetailCache((prev) => ({
        ...prev,
        [po.id]: {
          loading: false,
          error: 'Gagal memuat item JO untuk PO ini.',
          items: [],
        },
      }));
    }
  };

  const toggleExpand = (po: MonitoredPO) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(po.id)) {
        next.delete(po.id);
      } else {
        next.add(po.id);
        if (!detailCache[po.id]) fetchPoItems(po);
      }
      return next;
    });
  };

  const refreshPoDetail = (poId: number) => {
    setDetailCache((prev) => {
      const next = { ...prev };
      delete next[poId];
      return next;
    });
    const po = data.find((p) => p.id === poId);
    if (po) fetchPoItems(po);
  };

  const handleSendBackSubmitted = (poId: number) => {
    setSendBackTarget(null);
    refreshPoDetail(poId);
    setToast({
      open: true,
      message: 'Item berhasil dikirim balik ke request.',
      severity: 'success',
    });
  };

  const handleCloseConfirmed = (poId: number) => {
    setCloseTarget(null);
    // A closed PO no longer matches status_po = 'progress', so drop it
    // from the current list instead of refetching the whole page.
    setData((prev) => prev.filter((p) => p.id !== poId));
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.delete(poId);
      return next;
    });
    setDetailCache((prev) => {
      const next = { ...prev };
      delete next[poId];
      return next;
    });
    setToast({
      open: true,
      message: 'PO berhasil ditutup.',
      severity: 'success',
    });
  };

  const handleCancelRequested = (poId: number) => {
    setCancelTarget(null);
    // A pending cancel request also no longer matches status_po =
    // 'progress' (it moves to 'request cancel' until finance decides), so
    // drop it from the current list the same way a close does.
    setData((prev) => prev.filter((p) => p.id !== poId));
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.delete(poId);
      return next;
    });
    setDetailCache((prev) => {
      const next = { ...prev };
      delete next[poId];
      return next;
    });
    setToast({
      open: true,
      message:
        'Permintaan cancel PO berhasil dikirim, menunggu approve finance.',
      severity: 'success',
    });
  };

  return (
    <div className="space-y-5 pb-20">
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

        {/* Date ranges get their own row — a native <input type="date">
            has a fixed minimum width, so two of them plus a separator
            never fit inside a narrow 4-column grid cell without
            overlapping the next field. Each range gets a full half-width
            column here instead. */}
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
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Progress PO
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-14 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-7 w-7 border-2 border-teal-500 border-t-transparent"></div>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-14 text-center">
                    <p className="text-slate-600 font-medium text-sm">
                      {EMPTY_TEXT}
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
                  const isExpanded = expandedIds.has(po.id);
                  const cache = detailCache[po.id];
                  const poProgress = calcPoProgress(po, cache?.items);
                  const isActionable =
                    (po.status_po ?? 'progress') === 'progress';
                  return (
                    <React.Fragment key={po.id}>
                      <tr className="hover:bg-slate-50/70 transition-colors">
                        <td
                          className="px-3 py-3 cursor-pointer"
                          onClick={() => toggleExpand(po)}
                        >
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
                        <td
                          className="px-3 py-3 font-medium text-teal-700 cursor-pointer"
                          onClick={() => toggleExpand(po)}
                        >
                          {po.no_purchase_order}
                        </td>
                        <td
                          className="px-3 py-3 text-slate-700 cursor-pointer"
                          onClick={() => toggleExpand(po)}
                        >
                          {po.nama_vendor || '-'}
                        </td>
                        <td
                          className="px-3 py-3 text-slate-600 whitespace-nowrap cursor-pointer"
                          onClick={() => toggleExpand(po)}
                        >
                          {formatDate(po.tgl_po)}
                        </td>
                        <td
                          className="px-3 py-3 text-slate-600 whitespace-nowrap cursor-pointer"
                          onClick={() => toggleExpand(po)}
                        >
                          {formatDate(po.tgl_kirim)}
                        </td>
                        <td
                          className="px-3 py-3 text-right tabular-nums text-slate-800 font-medium cursor-pointer"
                          onClick={() => toggleExpand(po)}
                        >
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
                        <td className="px-3 py-3 min-w-[140px]">
                          <div className="space-y-1">
                            {poProgress && (
                              <ProgressBar
                                pct={poProgress.pct}
                                isOver={poProgress.isOver}
                              />
                            )}
                            <span
                              className={`inline-block text-[11px] px-2 py-0.5 rounded-full font-medium ${statusPoBadge(
                                po.status_po,
                              )}`}
                            >
                              {statusPoLabel(po.status_po)}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          {canEdit && isActionable ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActionChoiceTarget(po);
                              }}
                              className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
                            >
                              Aksi PO
                            </button>
                          ) : (
                            <span className="text-xs text-slate-300">—</span>
                          )}
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr>
                          <td colSpan={9} className="bg-slate-50/60 px-4 py-4">
                            {cache?.loading ? (
                              <div className="flex justify-center py-6">
                                <div className="animate-spin rounded-full h-6 w-6 border-2 border-teal-500 border-t-transparent" />
                              </div>
                            ) : cache?.error ? (
                              <p className="text-sm text-red-600 text-center py-4">
                                {cache.error}
                              </p>
                            ) : !cache || cache.items.length === 0 ? (
                              <p className="text-sm text-slate-400 text-center py-4">
                                Tidak ada item JO pada PO ini.
                              </p>
                            ) : (
                              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                                <div className="overflow-x-auto">
                                  <table className="min-w-full text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-100">
                                      <tr>
                                        <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                                          No JO
                                        </th>
                                        <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                                          Nama Barang
                                        </th>
                                        <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                                          Tipe
                                        </th>
                                        <th className="px-3 py-2.5 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                                          Qty PO
                                        </th>
                                        <th className="px-3 py-2.5 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                                          Qty Terkirim
                                        </th>
                                        <th className="px-3 py-2.5 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                                          Sisa
                                        </th>
                                        <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide min-w-[110px]">
                                          Progress
                                        </th>
                                        <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                                          Status PO
                                        </th>
                                        <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                                          Status QC
                                        </th>
                                        <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                                          Aksi
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {cache.items.map((it) => (
                                        <tr
                                          key={it.id}
                                          className="hover:bg-slate-50/70"
                                        >
                                          <td className="px-3 py-2.5 font-medium text-teal-700">
                                            {it.no_jo}
                                          </td>
                                          <td className="px-3 py-2.5 text-slate-700">
                                            {it.nama_item}
                                          </td>
                                          <td className="px-3 py-2.5 text-slate-500">
                                            {it.tipe_barang || '-'}
                                          </td>
                                          <td className="px-3 py-2.5 text-right tabular-nums">
                                            {formatQty(it.qty_po)} {it.satuan}
                                          </td>
                                          <td className="px-3 py-2.5 text-right tabular-nums">
                                            {formatQty(it.qty_terkirim)}{' '}
                                            {it.satuan}
                                          </td>
                                          <td className="px-3 py-2.5 text-right tabular-nums font-semibold">
                                            {it.qty_sisa > 0 ? (
                                              <span className="text-amber-600">
                                                {formatQty(it.qty_sisa)}{' '}
                                                {it.satuan}
                                              </span>
                                            ) : (
                                              <span className="text-emerald-600">
                                                Lengkap
                                              </span>
                                            )}
                                          </td>
                                          <td className="px-3 py-2.5">
                                            {(() => {
                                              const ip = calcProgress(
                                                it.qty_po,
                                                it.qty_terkirim,
                                              );
                                              return ip ? (
                                                <ProgressBar
                                                  pct={ip.pct}
                                                  isOver={ip.isOver}
                                                />
                                              ) : (
                                                <span className="text-slate-300 text-[10px]">
                                                  —
                                                </span>
                                              );
                                            })()}
                                          </td>
                                          <td className="px-3 py-2.5">
                                            <span
                                              className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${statusPoBadge(
                                                it.status_po,
                                              )}`}
                                            >
                                              {statusPoLabel(it.status_po)}
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
                                          <td className="px-3 py-2.5">
                                            {canEdit && it.qty_sisa > 0 ? (
                                              <button
                                                onClick={() =>
                                                  setSendBackTarget(it)
                                                }
                                                className="px-3 py-1.5 text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg font-medium transition-colors whitespace-nowrap"
                                              >
                                                Kirim Balik
                                              </button>
                                            ) : (
                                              <span className="text-xs text-slate-300">
                                                —
                                              </span>
                                            )}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
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

      {sendBackTarget && (
        <SendBackModal
          item={sendBackTarget}
          onClose={() => setSendBackTarget(null)}
          onSubmitted={() =>
            handleSendBackSubmitted(sendBackTarget.id_purchase_order)
          }
        />
      )}

      {actionChoiceTarget && (
        <PoActionChoiceModal
          po={actionChoiceTarget}
          onClose={() => setActionChoiceTarget(null)}
          onPickClose={() => {
            setCloseTarget(actionChoiceTarget);
            setActionChoiceTarget(null);
          }}
          onPickCancel={() => {
            setCancelTarget(actionChoiceTarget);
            setActionChoiceTarget(null);
          }}
        />
      )}

      {closeTarget && (
        <ClosePoModal
          po={closeTarget}
          onClose={() => setCloseTarget(null)}
          onConfirmed={() => handleCloseConfirmed(closeTarget.id)}
        />
      )}

      {cancelTarget && (
        <RequestCancelPoModal
          po={cancelTarget}
          onClose={() => setCancelTarget(null)}
          onConfirmed={() => handleCancelRequested(cancelTarget.id)}
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

export default PurchasingMonitoringPO;
