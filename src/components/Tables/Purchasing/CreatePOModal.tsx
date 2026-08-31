import axios from 'axios';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import {
  MasterVendorItem,
  MasterVendorListResponse,
  PengajuanItem,
  PurchaseOrderNoResponse,
} from './Types/Purchasing.types';

/* =============================================================================
 * WHAT CHANGED (this pass) — number inputs, PPN-included-in-price, misc
 * -----------------------------------------------------------------------------
 * 1. NUMBER INPUTS: Discount, Qty Beli, and Harga now use the new
 *    `NumberInput` component instead of raw `<input type="number">`. It
 *    shows an empty field instead of a forced "0", and formats what the
 *    user types with `id-ID` thousands separators ("1.000") while still
 *    calling `onChange` with a plain integer — state/payloads are
 *    unaffected, only the on-screen text changes.
 *
 * 2. PPN WHEN THE MASTER PRICE ALREADY INCLUDES TAX (`is_tax_locked`):
 *    `harga` on these items is tax-inclusive already. Per-item PPN is still
 *    computed the same way as before (qty * harga * pajak%) so it stays
 *    visible, but it must NOT be added again into the grand total, since
 *    it's already baked into `harga` / `subTotal`. Items that are NOT
 *    tax-locked but have the PPN checkbox ticked keep the old behaviour:
 *    their PPN is added on top of the subtotal. Concretely:
 *    `grandTotal = subTotal - discount + ppnAddedToTotal`, where
 *    `ppnAddedToTotal` only sums PPN from non-tax-locked items.
 *    `ppnIncluded` (tax-locked items' PPN) is shown separately as
 *    informational-only and excluded from the total. The payload's
 *    top-level `ppn` field keeps reporting the combined figure
 *    (informational), while `total` uses the corrected grand total.
 *
 * 3. `noteInternal` (Catatan Internal) is now read-only — it's still
 *    auto-generated from the selected pengajuan rows, but the user can no
 *    longer edit it by hand.
 *
 * 4. NUMBER INPUT DECIMALS: `NumberInput` now accepts a comma as the
 *    decimal separator (e.g. "0,64") so fields like Qty Beli — which can
 *    mirror a fractional qty_bom — are actually typeable. The UI's finest
 *    supported precision is 0,01: a value below that but still positive
 *    (e.g. 0.0042, coming from a computed remainder) is rounded UP to
 *    0,01 rather than silently disappearing as 0, and the original figure
 *    is shown next to the field so the user knows a rounding happened.
 *
 * (tglKirim already defaulted sensibly to today when there's no JO
 * delivery date to derive from — see `derivedTglKirim` below — so that
 * part needed no change.)
 * ========================================================================== */

const DEFAULT_PPN_PERSEN = 11;

interface MasterBarangItem {
  purchase_unit_name: string;
  brand_name: string;
  id: number;
  id_brand: number;
  id_purchase_unit: number;
  kode_barang: string;
  nama_barang: string;
  kategori: string;
  sub_kategori: string | null;
  harga: number;
  is_include_tax: boolean;
  pajak: number;
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

interface Allocation {
  allocId: string;
  id_item: number;
  id_brand: number | null;
  nama_brand: string;
  kode_barang: string;
  nama_barang: string;
  satuan: string;
  qty_po: number;
  harga: number;
  is_ppn: boolean;
  is_tax_locked: boolean;
  pajak_persen: number;
  ppn: number;
  is_substitute: boolean;
}

interface JoContext {
  id_pengajuan: number; // the source `purchasing/request` row id
  id_jo: number;
  no_jo: string;
  tgl_kirim: string;
  rencana_cetak: string;
}

interface RowGroup {
  groupId: string;
  jo: JoContext | null;
  tipe_barang: string;
  original_id_item: number;
  original_nama_item: string;
  qty_bom: number; // the fixed original qty this JO needs of original item
  allocations: Allocation[];
}

interface ItemPayload {
  id_item: number;
  id_brand: number | null;
  nama_item: string;
  nama_brand: string;
  kode_barang: string;
  qty: number;
  qty_beli: number;
  tipe_barang: string;
  satuan: string;
  harga: number;
  total: number;
  ppn: number;
  is_ppn: boolean;
}

// Same as ItemPayload, plus the flag used internally to decide whether an
// item's PPN counts toward the grand total. Stripped back down to
// ItemPayload before it goes into the actual API payload.
type AggregatedItem = ItemPayload & { is_tax_locked: boolean };

interface ItemJoPayload {
  id_jo: number;
  id_item: number;
  id_brand: number | null;
  no_jo: string;
  nama_item: string;
  nama_brand: string;
  qty_bom: number;
  qty_po: number;
  tipe_barang: string;
  satuan: string;
  tgl_kirim: string;
  rencana_cetak: string;
}

interface PurchaseOrderPayload {
  id_vendor: number | null;
  nama_vendor: string;
  tgl_po: string;
  tgl_kirim: string;
  sub_total: number;
  ppn: number;
  discount: number;
  total: number;
  note_internal: string;
  note_supplier: string;
  items: ItemPayload[];
  items_jo: ItemJoPayload[];
  request_purchase_data: { id: number }[];
}

interface CreatePOModalProps {
  mode: 'from_selection' | 'manual';
  selectedItems: PengajuanItem[];
  onClose: () => void;
  onSuccess: () => void;
}

const todayISO = (): string => new Date().toISOString().slice(0, 10);
const uid = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const recalcPpn = (a: Allocation): Allocation => ({
  ...a,
  ppn: a.is_ppn ? Math.round(a.qty_po * a.harga * (a.pajak_persen / 100)) : 0,
});

// ---------------------------------------------------------------------------
// NumberInput — text input formatted with id-ID thousands separators
// ("1.000") that also accepts a comma as the decimal separator ("0,64"),
// since several fields (notably Qty Beli, which can mirror a fractional
// qty_bom) need decimals down to 0,01. Never shows a forced "0", and still
// reports a plain number to `onChange` (state/payloads stay untouched by
// formatting).
//
// If the value coming in from outside is finer than the 0,01 the UI
// supports (e.g. a computed remainder like 0.0042), it's snapped UP to
// 0,01 — never down to 0, since a real quantity or price shouldn't
// silently vanish — and the original figure is shown next to the field so
// the user knows a rounding happened.
// ---------------------------------------------------------------------------

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
// typeable. Groups the integer part with id-ID thousands separators as
// the user goes, but preserves a trailing comma and up to 2 fraction
// digits exactly as typed (including "0,05", "0,0", etc.).
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

// The UI's smallest supported unit is 0,01. A non-zero value smaller than
// that gets rounded UP to 0,01 instead of down to 0 — a real quantity or
// price should never silently vanish just because it was too fine to
// represent. Anything else rounds to the nearest 0,01 as usual. Only used
// for values arriving from OUTSIDE the field (initial load, a substitute
// pre-filling qty/harga) — never while the user is actively typing, since
// typed input is already capped at 2 decimals by formatTypingDisplay.
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

  // Stay in sync when the underlying value changes from OUTSIDE this input
  // (e.g. a substitute is picked and pre-fills harga/qty_po, or the row
  // loads for the first time). Skipped entirely while the field is
  // focused, so it never fights the user's in-progress typing (including
  // the transient "0" state every onChange emits while typing "0,05"). If
  // the incoming value needed rounding to fit 0,01 precision, report the
  // rounded figure back up so state matches what's shown.
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

// Resolve a brand name by id from the master/brand map, falling back to
// whatever fallback value was supplied (e.g. a top-level field that's
// usually blank in practice, but cheap to keep as a last resort).
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

const makeAllocationFromPengajuan = (
  item: PengajuanItem,
  brandMap: Map<number, string>,
): Allocation => {
  const detail = item.detail_item;
  const isTaxLocked = !!detail?.is_include_tax;
  // detail_item.id_brand is the reliable source — the top-level id_brand
  // on the pengajuan row is null in practice.
  const idBrand = detail?.id_brand ?? item.id_brand ?? null;
  return recalcPpn({
    allocId: uid(),
    id_item: item.id_item ?? 0,
    id_brand: idBrand,
    // Neither detail_item nor the top-level row actually carries a brand
    // *name* — resolve it from master/brand by id instead. item.nama_brand
    // is kept only as a last-resort fallback in case it's ever populated.
    nama_brand: resolveBrandName(idBrand, brandMap, item.nama_brand ?? ''),
    kode_barang: detail?.kode_barang || '',
    nama_barang: detail?.nama_barang || item.nama_item || '',
    satuan: item.satuan || '',
    qty_po: item.qty,
    harga: detail?.harga ?? 0,
    is_ppn: isTaxLocked,
    is_tax_locked: isTaxLocked,
    pajak_persen: detail?.pajak ?? DEFAULT_PPN_PERSEN,
    ppn: 0,
    is_substitute: false,
  });
};

const makeAllocationFromMasterItem = (
  masterItem: MasterBarangItem,
  qty: number,
  brandMap: Map<number, string>,
): Allocation => {
  const isTaxLocked = !!masterItem.is_include_tax;
  return recalcPpn({
    allocId: uid(),
    id_item: masterItem.id,
    id_brand: masterItem.id_brand ?? null,
    // brand_name isn't a real field on the master/barang response (same
    // story as MarketingBarang.tsx) — resolve it from master/brand by id.
    nama_brand: resolveBrandName(
      masterItem.id_brand,
      brandMap,
      masterItem.brand_name,
    ),
    kode_barang: masterItem.kode_barang || '',
    nama_barang: masterItem.nama_barang,
    // No unit is guaranteed on the response (purchase_unit_name is a
    // populated-from-relation field) — falls back to whatever the JO's
    // original allocation used, since a substitute of the same category
    // almost always shares the same unit.
    satuan: masterItem.purchase_unit_name || '',
    qty_po: Math.max(qty, 0),
    harga: masterItem.harga ?? 0,
    is_ppn: isTaxLocked,
    is_tax_locked: isTaxLocked,
    pajak_persen: masterItem.pajak ?? DEFAULT_PPN_PERSEN,
    ppn: 0,
    is_substitute: true,
  });
};

const emptyManualAllocation = (): Allocation => ({
  allocId: uid(),
  id_item: 0,
  id_brand: null,
  nama_brand: '',
  kode_barang: '',
  nama_barang: '',
  satuan: '',
  qty_po: 0,
  harga: 0,
  is_ppn: false,
  is_tax_locked: false,
  pajak_persen: DEFAULT_PPN_PERSEN,
  ppn: 0,
  is_substitute: false,
});

const emptyManualRow = (): RowGroup => ({
  groupId: uid(),
  jo: null,
  tipe_barang: '',
  original_id_item: 0,
  original_nama_item: '',
  qty_bom: 0,
  allocations: [emptyManualAllocation()],
});

// Each selected pengajuan row is already exactly one JO's need for one item,
// so it maps 1:1 to a RowGroup (no merging across JOs — merging happens only
// at payload-build time, for the aggregate `items` array).
const buildRowsFromSelection = (
  items: PengajuanItem[],
  brandMap: Map<number, string>,
): RowGroup[] =>
  items.map((item) => ({
    groupId: uid(),
    jo: {
      id_pengajuan: item.id,
      id_jo: item.id_jo ?? 0,
      no_jo: item.no_jo,
      tgl_kirim: item.tgl_kirim || '',
      rencana_cetak: item.rencana_cetak || '',
    },
    // sub_kategori (e.g. "Kertas") is the real category field on detail_item;
    // the top-level tipe_barang is kept only as a fallback.
    tipe_barang: item.detail_item?.sub_kategori || item.tipe_barang || '',
    original_id_item: item.id_item ?? 0,
    original_nama_item: item.detail_item?.nama_barang || item.nama_item,
    qty_bom: item.qty,
    allocations: [makeAllocationFromPengajuan(item, brandMap)],
  }));

const buildInternalNote = (rows: RowGroup[]): string =>
  rows
    .filter((r) => r.jo)
    .map((r) => {
      const lines = r.allocations
        .map((a, i) => {
          const tag = a.is_substitute ? ' (pengganti)' : '';
          const brand = a.nama_brand ? ` [${a.nama_brand}]` : '';
          return `  ${i + 1}. ${a.nama_barang}${brand}${tag} - Qty: ${
            a.qty_po
          }`;
        })
        .join('\n');
      return `- ${r.jo!.no_jo} (butuh ${r.qty_bom} ${
        r.original_nama_item
      })\n${lines}`;
    })
    .join('\n');

// One entry per distinct id_item, summed across every allocation that uses
// it (regardless of which JO or row it came from). Unit price is a
// qty-weighted average so the aggregate total stays correct even if the
// same item was priced slightly differently across allocations.
//
// Also carries `is_tax_locked` through so the caller can tell, per
// aggregated item, whether its PPN is already baked into `harga` (and so
// must be excluded from the grand total) or should be added on top.
const aggregateItems = (rows: RowGroup[]): AggregatedItem[] => {
  type Bucket = {
    id_item: number;
    id_brand: number | null;
    nama_item: string;
    nama_brand: string;
    kode_barang: string;
    tipe_barang: string;
    satuan: string;
    qty: number;
    value: number;
    ppn: number;
    is_ppn: boolean;
    is_tax_locked: boolean;
  };
  const map = new Map<string, Bucket>();

  rows.forEach((row) => {
    row.allocations.forEach((a) => {
      if (!a.id_item && !a.nama_barang.trim()) return; // skip blank manual rows
      const key = a.id_item
        ? `id:${a.id_item}`
        : `name:${a.nama_barang.trim().toLowerCase()}`;
      const existing = map.get(key);
      if (existing) {
        existing.qty += a.qty_po;
        existing.value += a.qty_po * a.harga;
        existing.ppn += a.ppn;
        existing.is_ppn = existing.is_ppn || a.is_ppn;
        existing.is_tax_locked = existing.is_tax_locked || a.is_tax_locked;
      } else {
        map.set(key, {
          id_item: a.id_item,
          id_brand: a.id_brand,
          nama_item: a.nama_barang,
          nama_brand: a.nama_brand,
          kode_barang: a.kode_barang,
          tipe_barang: row.tipe_barang,
          satuan: a.satuan,
          qty: a.qty_po,
          value: a.qty_po * a.harga,
          ppn: a.ppn,
          is_ppn: a.is_ppn,
          is_tax_locked: a.is_tax_locked,
        });
      }
    });
  });

  return Array.from(map.values()).map((b) => {
    const harga = b.qty > 0 ? Math.round(b.value / b.qty) : 0;
    return {
      id_item: b.id_item,
      id_brand: b.id_brand,
      nama_item: b.nama_item,
      nama_brand: b.nama_brand,
      kode_barang: b.kode_barang,
      qty: b.qty,
      qty_beli: b.qty,
      tipe_barang: b.tipe_barang,
      satuan: b.satuan,
      harga,
      total: b.value,
      ppn: b.ppn,
      is_ppn: b.is_ppn,
      is_tax_locked: b.is_tax_locked,
    };
  });
};

const buildItemsJoPayload = (
  rows: RowGroup[],
  tglKirimPO: string,
): ItemJoPayload[] =>
  rows
    .filter((r) => r.jo)
    .flatMap((r) =>
      r.allocations
        .filter((a) => a.id_item || a.nama_barang.trim())
        .map((a) => ({
          id_jo: r.jo!.id_jo,
          id_item: a.id_item,
          id_brand: a.id_brand,
          no_jo: r.jo!.no_jo,
          nama_item: a.nama_barang,
          nama_brand: a.nama_brand,
          qty_bom: r.qty_bom,
          qty_po: a.qty_po,
          tipe_barang: row_tipe(r, a),
          satuan: a.satuan,
          tgl_kirim: tglKirimPO, // <-- was r.jo!.tgl_kirim; PO's own date, per spec
          rencana_cetak: r.jo!.rencana_cetak,
        })),
    );

// Substitute items are looked up within the same category as the JO's
// original need, so this is almost always just `row.tipe_barang` — kept as
// a helper in case a substitute ever legitimately carries its own category.
const row_tipe = (row: RowGroup, _alloc: Allocation): string => row.tipe_barang;

const formatDateShort = (dateString?: string): string => {
  if (!dateString) return '-';
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const CreatePOModal: React.FC<CreatePOModalProps> = ({
  mode,
  selectedItems,
  onClose,
  onSuccess,
}) => {
  const [rows, setRows] = useState<RowGroup[]>(() =>
    mode === 'from_selection'
      ? buildRowsFromSelection(selectedItems, new Map())
      : [emptyManualRow()],
  );
  const [noPO, setNoPO] = useState<string>('');
  const [loadingNo, setLoadingNo] = useState<boolean>(true);

  // --- Vendor (Master Vendor, filtered by tipe_vendor) ---
  const [vendors, setVendors] = useState<MasterVendorItem[]>([]);
  const [vendorsLoading, setVendorsLoading] = useState<boolean>(true);
  const [vendorId, setVendorId] = useState<number | ''>('');

  const [tglPO, setTglPO] = useState<string>(todayISO());
  const [noteSupplier, setNoteSupplier] = useState<string>('');
  const [noteInternal, setNoteInternal] = useState<string>(() =>
    mode === 'from_selection'
      ? buildInternalNote(buildRowsFromSelection(selectedItems, new Map()))
      : '',
  );
  const [discount, setDiscount] = useState<number>(0);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // --- Master Brand (id -> nama_brand), used to resolve brand names since
  // neither the pengajuan payload nor master/barang carry them directly ---
  const [brandMap, setBrandMap] = useState<Map<number, string>>(new Map());
  // Rows/notes are built with an empty brandMap before this fetch resolves
  // (see useState initializers above) — this ref makes sure we backfill
  // them exactly once when the map arrives, instead of clobbering anything
  // the user may have typed in the meantime.
  const brandBackfilledRef = useRef(false);

  // --- Substitute-item picker (scoped to one row/group at a time) ---
  const [pickerGroupId, setPickerGroupId] = useState<string | null>(null);
  const [pickerSearchInput, setPickerSearchInput] = useState<string>('');
  const [pickerResults, setPickerResults] = useState<MasterBarangItem[]>([]);
  const [pickerLoading, setPickerLoading] = useState<boolean>(false);

  const pickerRow = useMemo(
    () => rows.find((r) => r.groupId === pickerGroupId) || null,
    [rows, pickerGroupId],
  );

  useEffect(() => {
    const fetchNo = async () => {
      const url = `${
        import.meta.env.VITE_API_LINK
      }/purchasing/purchaseOrder/getNo/new`;
      try {
        setLoadingNo(true);
        const res = await axios.get<PurchaseOrderNoResponse>(url, {
          withCredentials: true,
        });
        setNoPO(
          res.data.no_purchase_order_new || res.data.no_purchase_order || '',
        );
      } catch (err) {
        console.error('Error fetching PO number:', err);
      } finally {
        setLoadingNo(false);
      }
    };
    fetchNo();
  }, []);

  // Fetch the full master brand list once, so id_brand can be resolved to a
  // name everywhere in this modal (table cells + Catatan Internal).
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

  // Once brandMap arrives, backfill any allocation whose brand is still
  // blank (built before the fetch resolved), and regenerate the internal
  // note from the same resolved data so both stay in sync. Runs once.
  useEffect(() => {
    if (brandMap.size === 0 || brandBackfilledRef.current) return;
    brandBackfilledRef.current = true;

    setRows((prevRows) => {
      const updated = prevRows.map((row) => ({
        ...row,
        allocations: row.allocations.map((a) =>
          a.nama_brand || !a.id_brand
            ? a
            : { ...a, nama_brand: brandMap.get(a.id_brand) || a.nama_brand },
        ),
      }));
      if (mode === 'from_selection') {
        setNoteInternal(buildInternalNote(updated));
      }
      return updated;
    });
  }, [brandMap, mode]);

  const uniqueTipeBarang = useMemo(
    () => Array.from(new Set(rows.map((r) => r.tipe_barang).filter(Boolean))),
    [rows],
  );
  const tipeBarangKey = uniqueTipeBarang.join(',');

  useEffect(() => {
    const fetchVendors = async () => {
      const url = `${
        import.meta.env.VITE_API_LINK
      }/master/marketing/vendor/list`;
      try {
        setVendorsLoading(true);
        const res = await axios.get<MasterVendorListResponse>(url, {
          params: {
            limit: 100,
            is_active: true,
            tipe_vendor:
              uniqueTipeBarang.length > 0 ? uniqueTipeBarang : undefined,
          },
          withCredentials: true,
        });
        setVendors(res.data.data || []);
      } catch (err) {
        console.error('Error fetching vendor list:', err);
        setVendors([]);
      } finally {
        setVendorsLoading(false);
      }
    };
    fetchVendors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipeBarangKey]);

  useEffect(() => {
    if (vendorId !== '' && !vendors.some((v) => v.id === vendorId)) {
      setVendorId('');
    }
  }, [vendors, vendorId]);

  const selectedVendor = useMemo(
    () => vendors.find((v) => v.id === vendorId) || null,
    [vendors, vendorId],
  );

  // Defaults to today when there's no JO delivery date to derive from
  // (manual mode, or a from_selection batch with no dated rows yet) —
  // otherwise picks the earliest need date across the selected JOs.
  const derivedTglKirim = useMemo(() => {
    const times = rows
      .map((r) => r.jo?.tgl_kirim)
      .filter(Boolean)
      .map((d) => new Date(d as string).getTime())
      .filter((t) => !Number.isNaN(t));
    if (times.length === 0) return todayISO();
    return new Date(Math.min(...times)).toISOString().slice(0, 10);
  }, [rows]);

  const [tglKirim, setTglKirim] = useState<string>(derivedTglKirim);
  useEffect(() => {
    setTglKirim(derivedTglKirim);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Row / allocation mutation helpers ---

  const updateAllocation = (
    groupId: string,
    allocId: string,
    patch: Partial<Allocation>,
  ) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.groupId !== groupId) return row;
        return {
          ...row,
          allocations: row.allocations.map((a) => {
            if (a.allocId !== allocId) return a;
            const updated = { ...a, ...patch };
            if (updated.is_tax_locked) updated.is_ppn = true;
            return recalcPpn(updated);
          }),
        };
      }),
    );
  };

  const removeAllocation = (groupId: string, allocId: string) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.groupId !== groupId) return row;
        if (row.allocations.length <= 1) return row; // always keep at least one line
        return {
          ...row,
          allocations: row.allocations.filter((a) => a.allocId !== allocId),
        };
      }),
    );
  };

  const addManualRow = () => setRows((prev) => [...prev, emptyManualRow()]);

  const removeManualRow = (groupId: string) =>
    setRows((prev) => prev.filter((r) => r.groupId !== groupId));

  const openPicker = (groupId: string) => {
    setPickerGroupId(groupId);
    setPickerSearchInput('');
    setPickerResults([]);
  };

  const closePicker = () => {
    setPickerGroupId(null);
    setPickerSearchInput('');
    setPickerResults([]);
  };

  const fetchPickerResults = async () => {
    if (!pickerRow) return;
    const url = `${import.meta.env.VITE_API_LINK}/master/barang`;
    try {
      setPickerLoading(true);
      const res = await axios.get<MasterBarangListResponse>(url, {
        params: {
          page: 1,
          limit: 20,
          search: pickerSearchInput || undefined,
          // sub_kategori is the category field on MasterBarang — matches
          // detail_item.sub_kategori that the JO's original item came from.
          sub_kategori: pickerRow.tipe_barang || undefined,
        },
        withCredentials: true,
      });
      // Don't offer the item(s) already allocated on this row again.
      const alreadyUsed = new Set(pickerRow.allocations.map((a) => a.id_item));
      setPickerResults(
        (res.data.data || []).filter((mi) => !alreadyUsed.has(mi.id)),
      );
    } catch (err) {
      console.error('Error fetching master barang list:', err);
      setPickerResults([]);
    } finally {
      setPickerLoading(false);
    }
  };

  // Load an initial page of candidates as soon as the picker opens for a row.
  useEffect(() => {
    if (pickerGroupId) fetchPickerResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickerGroupId]);

  const handlePickSubstitute = (masterItem: MasterBarangItem) => {
    if (!pickerRow) return;
    const currentQty = pickerRow.allocations.reduce(
      (sum, a) => sum + a.qty_po,
      0,
    );
    const remaining = Math.max(pickerRow.qty_bom - currentQty, 0);
    const newAlloc = makeAllocationFromMasterItem(
      masterItem,
      remaining,
      brandMap,
    );
    if (!newAlloc.satuan) {
      // purchase_unit_name wasn't populated on the response — reuse the
      // unit from this row's existing allocation, since a same-category
      // substitute is virtually always bought in the same unit.
      newAlloc.satuan = pickerRow.allocations[0]?.satuan || '';
    }
    setRows((prev) =>
      prev.map((row) =>
        row.groupId === pickerRow.groupId
          ? { ...row, allocations: [...row.allocations, newAlloc] }
          : row,
      ),
    );
    closePicker();
  };

  // --- Totals ---

  const itemsAggregate = useMemo(() => aggregateItems(rows), [rows]);
  const subTotal = useMemo(
    () => itemsAggregate.reduce((sum, it) => sum + it.total, 0),
    [itemsAggregate],
  );
  // PPN already baked into the master price (is_tax_locked items) — shown
  // for information only, never added to the grand total, since it's
  // already part of `harga` / `subTotal`.
  const ppnIncluded = useMemo(
    () =>
      itemsAggregate
        .filter((it) => it.is_tax_locked)
        .reduce((sum, it) => sum + it.ppn, 0),
    [itemsAggregate],
  );
  // PPN from items that are NOT tax-locked but have the PPN checkbox
  // ticked — calculated on top of harga, and does get added to the total,
  // same as the original behaviour.
  const ppnAddedToTotal = useMemo(
    () =>
      itemsAggregate
        .filter((it) => !it.is_tax_locked)
        .reduce((sum, it) => sum + it.ppn, 0),
    [itemsAggregate],
  );
  // Combined figure kept for the payload's informational `ppn` field.
  const totalPPN = ppnIncluded + ppnAddedToTotal;
  const grandTotal = subTotal - (discount || 0) + ppnAddedToTotal;

  const formatRupiah = (value: number): string =>
    value.toLocaleString('id-ID', { maximumFractionDigits: 0 });

  const validate = (): string => {
    if (!vendorId) return 'Vendor wajib dipilih.';
    if (rows.length === 0) return 'Minimal 1 item diperlukan.';
    for (const row of rows) {
      for (const a of row.allocations) {
        if (!a.nama_barang.trim()) return 'Nama barang tidak boleh kosong.';
        if (a.qty_po <= 0)
          return `Qty beli untuk "${a.nama_barang}" harus lebih dari 0.`;
        if (a.harga < 0)
          return `Harga untuk "${a.nama_barang}" tidak boleh negatif.`;
      }
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

    const payload: PurchaseOrderPayload = {
      id_vendor: vendorId === '' ? null : vendorId,
      nama_vendor: selectedVendor?.nama_vendor || '',
      tgl_po: tglPO,
      tgl_kirim: tglKirim,
      sub_total: subTotal,
      ppn: totalPPN,
      discount: discount || 0,
      total: grandTotal,
      note_internal: noteInternal,
      note_supplier: noteSupplier,
      // Strip the internal-only is_tax_locked flag before it goes out —
      // the API's item shape doesn't declare that field.
      items: itemsAggregate.map(({ is_tax_locked, ...item }) => item),
      items_jo: buildItemsJoPayload(rows, tglKirim),
      request_purchase_data: Array.from(
        new Set(rows.filter((r) => r.jo).map((r) => r.jo!.id_pengajuan)),
      ).map((id) => ({ id })),
    };
    // console.log('Submitting PO payload:', payload);
    try {
      console.log('Submitting PO payload:', payload);
      const url = `${import.meta.env.VITE_API_LINK}/purchasing/purchaseOrder`;
      await axios.post(url, payload, { withCredentials: true });
      onSuccess();
    } catch (err) {
      console.error('Error creating PO:', err);
      setError('Gagal menyimpan draft PO. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrintDraft = () => window.print();
  const getAllocationBadge = (
    remaining: number,
  ): { label: string; className: string } => {
    if (remaining === 0) {
      return { label: 'Lengkap', className: 'bg-emerald-50 text-emerald-700' };
    }
    if (remaining > 0) {
      return {
        label: `Sisa ${remaining}`,
        className: 'bg-amber-50 text-amber-700',
      };
    }
    return {
      label: `Lebih ${Math.abs(remaining)}`,
      className: 'bg-blue-50 text-blue-700',
    };
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-full max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Buat Purchase Order
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {mode === 'from_selection'
                ? `Digabung dari ${selectedItems.length} baris pengajuan`
                : 'Entri manual'}
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

        <div className="p-6 space-y-6">
          {/* PO meta */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Vendor
              </label>
              <select
                value={vendorId}
                onChange={(e) =>
                  setVendorId(e.target.value ? Number(e.target.value) : '')
                }
                disabled={vendorsLoading}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">
                  {vendorsLoading
                    ? 'Memuat vendor...'
                    : vendors.length === 0
                    ? 'Tidak ada vendor untuk kategori ini'
                    : 'Pilih vendor'}
                </option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.nama_vendor}
                  </option>
                ))}
              </select>
              {!vendorsLoading && uniqueTipeBarang.length > 0 && (
                <p className="text-[11px] text-slate-400 mt-1">
                  Difilter berdasarkan kategori: {uniqueTipeBarang.join(', ')}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Nomor PO
              </label>
              <input
                type="text"
                value={loadingNo ? 'Memuat...' : noPO}
                onChange={(e) => setNoPO(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Tanggal PO
              </label>
              <input
                type="date"
                value={tglPO}
                onChange={(e) => setTglPO(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Tanggal Kirim
              </label>
              <input
                type="date"
                value={tglKirim}
                onChange={(e) => setTglKirim(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Items — grouped by JO need, each need can hold 1+ allocations */}
          <div className="space-y-3">
            {rows.map((row) => {
              const qtyAllocated = row.allocations.reduce(
                (sum, a) => sum + a.qty_po,
                0,
              );
              const remaining = row.jo ? row.qty_bom - qtyAllocated : 0;
              return (
                <div
                  key={row.groupId}
                  className="border border-slate-200 rounded-xl overflow-hidden"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 px-4 py-2.5 border-b border-slate-100">
                    {row.jo ? (
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                        <span className="font-semibold text-indigo-700">
                          {row.jo.no_jo}
                        </span>
                        <span>
                          Butuh:{' '}
                          <b className="text-slate-800">
                            {row.qty_bom} {row.allocations[0]?.satuan || ''}
                          </b>{' '}
                          {row.original_nama_item}
                        </span>
                        <span>Kirim: {formatDateShort(row.jo.tgl_kirim)}</span>
                        {(() => {
                          const badge = getAllocationBadge(remaining);
                          return (
                            <span
                              className={`px-2 py-0.5 rounded-full font-medium ${badge.className}`}
                            >
                              {badge.label}
                            </span>
                          );
                        })()}
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-slate-500">
                        Item manual
                      </span>
                    )}
                    <div className="flex items-center gap-3">
                      {row.jo && (
                        <button
                          onClick={() => openPicker(row.groupId)}
                          className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                          + Item pengganti
                        </button>
                      )}
                      {!row.jo && (
                        <button
                          onClick={() => removeManualRow(row.groupId)}
                          className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors"
                        >
                          Hapus baris
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm table-fixed">
                      <colgroup>
                        <col className="w-[14%]" />
                        <col className="w-[26%]" />
                        <col className="w-[14%]" />
                        <col className="w-20" />
                        <col className="w-20" />
                        <col className="w-28" />
                        <col className="w-28" />
                        <col className="w-16" />
                        <col className="w-10" />
                      </colgroup>
                      <thead className="bg-white border-b border-slate-100">
                        <tr>
                          <th className="px-3 py-2 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                            Kode
                          </th>
                          <th className="px-3 py-2 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                            Nama Barang
                          </th>
                          <th className="px-3 py-2 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                            Brand
                          </th>
                          <th className="px-3 py-2 text-right text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                            Qty Beli
                          </th>
                          <th className="px-3 py-2 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                            Unit
                          </th>
                          <th className="px-3 py-2 text-right text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                            Harga
                          </th>
                          <th className="px-3 py-2 text-right text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                            Total
                          </th>
                          <th className="px-3 py-2 text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                            Pajak
                          </th>
                          <th className="px-3 py-2"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {row.allocations.map((a) => (
                          <tr key={a.allocId} className="hover:bg-slate-50/60">
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={a.kode_barang}
                                onChange={(e) =>
                                  updateAllocation(row.groupId, a.allocId, {
                                    kode_barang: e.target.value,
                                  })
                                }
                                className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  value={a.nama_barang}
                                  onChange={(e) =>
                                    updateAllocation(row.groupId, a.allocId, {
                                      nama_barang: e.target.value,
                                    })
                                  }
                                  placeholder="Nama barang"
                                  className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                {a.is_substitute && (
                                  <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 font-medium">
                                    Pengganti
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={a.nama_brand}
                                onChange={(e) =>
                                  updateAllocation(row.groupId, a.allocId, {
                                    nama_brand: e.target.value,
                                  })
                                }
                                placeholder="Brand"
                                className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <NumberInput
                                value={a.qty_po}
                                onChange={(v) =>
                                  updateAllocation(row.groupId, a.allocId, {
                                    qty_po: v,
                                  })
                                }
                                className="w-full px-2 py-1.5 text-sm text-right border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={a.satuan}
                                onChange={(e) =>
                                  updateAllocation(row.groupId, a.allocId, {
                                    satuan: e.target.value,
                                  })
                                }
                                className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <NumberInput
                                value={a.harga}
                                onChange={(v) =>
                                  updateAllocation(row.groupId, a.allocId, {
                                    harga: v,
                                  })
                                }
                                className="w-full px-2 py-1.5 text-sm text-right border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </td>
                            <td className="px-3 py-2 text-right tabular-nums text-slate-800 font-medium">
                              {formatRupiah(a.qty_po * a.harga)}
                            </td>
                            <td className="px-3 py-2 text-center">
                              <div className="flex flex-col items-center gap-0.5">
                                <input
                                  type="checkbox"
                                  checked={a.is_ppn}
                                  disabled={a.is_tax_locked}
                                  onChange={(e) =>
                                    updateAllocation(row.groupId, a.allocId, {
                                      is_ppn: e.target.checked,
                                    })
                                  }
                                  title={
                                    a.is_tax_locked
                                      ? 'Harga sudah termasuk PPN — dihitung otomatis, tidak menambah grand total'
                                      : `PPN ${a.pajak_persen}% jika dicentang`
                                  }
                                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-70"
                                />
                                <span className="text-[10px] text-slate-400">
                                  {a.pajak_persen}%
                                </span>
                              </div>
                            </td>
                            <td className="px-3 py-2 text-center">
                              {row.allocations.length > 1 && (
                                <button
                                  onClick={() =>
                                    removeAllocation(row.groupId, a.allocId)
                                  }
                                  className="text-red-400 hover:text-red-600 transition-colors"
                                  aria-label="Hapus alokasi"
                                >
                                  ✕
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}

            {mode === 'manual' && (
              <button
                onClick={addManualRow}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                + Tambah baris
              </button>
            )}
          </div>

          {/* Notes + summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Catatan Ke Supplier
                </label>
                <textarea
                  value={noteSupplier}
                  onChange={(e) => setNoteSupplier(e.target.value)}
                  rows={3}
                  placeholder="Contoh: Mohon dikirim tepat waktu"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Catatan Internal{' '}
                  <span className="text-slate-400 font-normal">
                    (tidak dapat diubah)
                  </span>
                </label>
                <textarea
                  value={noteInternal}
                  readOnly
                  rows={5}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-500 resize-none font-mono text-xs cursor-not-allowed"
                />
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 h-fit space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="text-slate-800 font-medium tabular-nums">
                  Rp {formatRupiah(subTotal)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Discount</span>
                <NumberInput
                  value={discount}
                  onChange={setDiscount}
                  className="w-32 px-2 py-1 text-sm text-right border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {ppnIncluded > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">
                    PPN termasuk harga
                    <span className="block text-[10px]">
                      (info, tidak masuk total)
                    </span>
                  </span>
                  <span className="text-slate-400 font-medium tabular-nums">
                    Rp {formatRupiah(ppnIncluded)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">PPN</span>
                <span className="text-slate-800 font-medium tabular-nums">
                  Rp {formatRupiah(ppnAddedToTotal)}
                </span>
              </div>
              <div className="border-t border-slate-200 pt-2.5 flex justify-between">
                <span className="text-slate-700 font-semibold">Total</span>
                <span className="text-indigo-700 font-semibold tabular-nums">
                  Rp {formatRupiah(grandTotal)}
                </span>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg px-4 py-2.5">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-2 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Kembali
          </button>
          <button
            onClick={handlePrintDraft}
            className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
          >
            Print Draft
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            {submitting ? 'Menyimpan...' : 'Simpan Draft'}
          </button>
        </div>
      </div>

      {/* Substitute item picker */}
      <Dialog
        open={!!pickerGroupId}
        onClose={closePicker}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Pilih Item Pengganti
          {pickerRow && (
            <span className="block text-xs font-normal text-slate-400 mt-0.5">
              Kategori: {pickerRow.tipe_barang || '-'} · untuk{' '}
              {pickerRow.jo?.no_jo}
            </span>
          )}
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
                      {brandMap.get(mi.id_brand) || mi.brand_name || '-'} ·{' '}
                      {mi.purchase_unit_name ||
                        pickerRow?.allocations[0]?.satuan ||
                        '-'}
                    </div>
                  </div>
                  <div className="shrink-0 text-xs text-slate-500 tabular-nums">
                    Rp {formatRupiah(mi.harga || 0)}
                  </div>
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreatePOModal;
