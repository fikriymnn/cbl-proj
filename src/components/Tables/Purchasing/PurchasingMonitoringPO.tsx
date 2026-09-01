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
 * Once a PO is closed (status_po -> 'done') it drops out of this list, since
 * monitoring only cares about POs still in progress.
 *
 * Each row expands INLINE to show its items_jo, same as OutstandingPO.
 * Unlike OutstandingPO there is no cross-PO checkbox selection here — the
 * actions available are per-row instead:
 *   - Per PO: "Tutup PO" -> PUT /purchasing/purchaseOrder/close/:id_po
 *   - Per item_jo: "Kirim Balik ke Request" -> PUT
 *     /purchasing/purchaseOrder/sendBack/:id_items_jo, with body
 *     { id_item, id_brand, nama_item, nama_brand, qty_sendback }
 *
 * Both actions are gated behind edit permission for this route via
 * usePermissions, mirroring how BAPFg gates "Buat BAP" behind create
 * permission.
 *
 * status_qc on items_jo: null | "request qc" | "approve qc" | "reject qc"
 * status_po on items_jo: "progress" | "done"
 * status_po on the PO itself: "progress" | "done"
 * ========================================================================== */

const ROUTE_PATH = '/purchasing/monitoring-po';

const EMPTY_TEXT = 'Tidak ada PO yang sedang dimonitor.';

// PurchaseOrder from shared types may not yet carry status_po — extend
// locally rather than touching the shared type file.
type MonitoredPO = PurchaseOrder & {
  status_po?: 'progress' | 'done';
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
  return 'bg-teal-50 text-teal-700'; // progress
};

const statusPoLabel = (status: string | undefined): string =>
  status === 'done' ? 'Selesai' : 'Progress';

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

// ─── NumberInput — id-ID formatted number field (ported from CreatePOModal) ─
// Text input formatted with id-ID thousands separators ("1.000") that also
// accepts a comma as the decimal separator ("0,64"). Never shows a forced
// "0", and still reports a plain number to `onChange` (state stays
// untouched by formatting). The UI's smallest supported unit is 0,01 — a
// non-zero value finer than that is rounded UP to 0,01 rather than down to
// 0, since a real quantity shouldn't silently vanish.

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
  disabled?: boolean;
};

const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  className,
  placeholder,
  min = 0,
  disabled,
}) => {
  const [display, setDisplay] = useState<string>(() =>
    formatNumberID(roundToSupportedPrecision(value)),
  );
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const rounded = roundToSupportedPrecision(value);
  const wasRounded = !isFocused && Math.abs(rounded - value) > EPSILON;

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
          const parsed = Math.max(
            roundToSupportedPrecision(parseNumberID(display)),
            min,
          );
          setDisplay(parsed === 0 ? '' : formatNumberID(parsed));
          onChange(parsed);
        }}
        onChange={(e) => {
          const sanitized = sanitizeNumericInput(e.target.value);
          setDisplay(formatTypingDisplay(sanitized));
          onChange(Math.max(parseNumberID(sanitized), min));
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
// capped by the item's qty_po.
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
            className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
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
  const [searchInput, setSearchInput] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

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
  const [closeTarget, setCloseTarget] = useState<MonitoredPO | null>(null);

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
          search: searchTerm || undefined,
          status: 'approve finance',
          status_po: 'progress',
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
  }, [page, limit, searchTerm]);

  const handleSearch = () => {
    setSearchTerm(searchInput);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setSearchTerm('');
    setPage(1);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const activeFilterCount = useMemo(
    () => [searchTerm].filter(Boolean).length,
    [searchTerm],
  );

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
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <button
              onClick={handleSearch}
              className="shrink-0 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Cari
            </button>
          </div>
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
                        <td className="px-3 py-3">
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${statusPoBadge(
                              po.status_po,
                            )}`}
                          >
                            {statusPoLabel(po.status_po)}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          {canEdit ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setCloseTarget(po);
                              }}
                              className="px-3 py-1.5 text-xs bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition-colors"
                            >
                              Tutup PO
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
                                            {canEdit ? (
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

      {closeTarget && (
        <ClosePoModal
          po={closeTarget}
          onClose={() => setCloseTarget(null)}
          onConfirmed={() => handleCloseConfirmed(closeTarget.id)}
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
