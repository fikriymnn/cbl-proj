import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import {
  MasterVendorItem,
  MasterVendorListResponse,
  PurchaseOrder,
  PurchaseOrderDetailResponse,
  UpdatePurchaseOrderPayload,
} from './Types/Purchasing.types';
import { formatRupiah, getStatusColor, getStatusLabel } from './Types/poStatus';

/* =============================================================================
 * WHAT CHANGED — JO-grouped items with substitute ("pengganti") support
 * -----------------------------------------------------------------------------
 * The old version rendered a flat list from `items` (the aggregated,
 * saved-for-invoicing array). That loses information the moment a JO's
 * need was covered by more than one item (a substitute added on top of, or
 * instead of, the original pick) — `items` only knows the summed qty/price
 * per id_item, not which JO(s) it came from or that it was a substitute.
 *
 * `items_jo` on the detail response *is* the per-JO breakdown. Grouping is
 * done by (id_jo, qty_bom) TOGETHER — NOT by id_jo alone. The same id_jo can
 * legitimately carry multiple distinct BOM needs (e.g. two separate lines
 * both needing item #76, one at qty_bom 0.64496 and another at qty_bom
 * 0.2224 — confirmed from a real detail payload). Rows that share both
 * id_jo AND qty_bom are allocations against the SAME need (first by id =
 * original pick, any further ones = substitutes for display — this flag
 * isn't persisted by the API, so it's inferred from insertion order, same
 * limitation CreatePOModal has going the other way). Rows that only share
 * id_jo but differ in qty_bom are separate needs and must render as
 * separate rows, even if they resolve to the same id_item.
 *
 * Unit price/tax-locked/pajak_persen aren't on items_jo rows, so they're
 * pulled from the matching `items` entry (by id_item) / items_jo[].master_barang.
 *
 * Items in `items` that never appear in `items_jo` are manual additions
 * (no JO) and get their own ungrouped row, same as CreatePOModal's manual
 * mode.
 *
 * The substitute picker (search master/barang, filtered by category) is
 * the same one CreatePOModal uses, so allocations can be added/replaced
 * for a JO need the same way here.
 *
 * On save:
 *   - `aggregateItems` rebuilds the flat `items` array, grouped strictly by
 *     id_item (normalized to a number; falls back to item name only when
 *     id_item is falsy) so two allocations of the same item — regardless
 *     of which JO/need row they came from — always collapse into ONE
 *     combined `items` entry (summed qty, qty-weighted avg price). This
 *     mirrors items_jo (per-JO assignment) vs items (buy list) as
 *     specified: items_jo can have N rows for the same item, items always
 *     combines them into 1.
 *   - `buildItemsJoPayload` rebuilds `items_jo`, preserving each row's `id`
 *     so the API can update in place instead of duplicating, and sets
 *     every row's `tgl_kirim` to the PO-level tglKirim (not each JO's own
 *     delivery date) — the API expects tgl_kirim to mirror the PO's own
 *     Tanggal Kirim field.
 *
 * NOTE: `UpdatePurchaseOrderPayload` may not declare `items_jo` yet (same
 * staleness already flagged elsewhere in this codebase) — cast where
 * needed so this compiles either way.
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

// Shapes matching the real GET /purchaseOrder/:id response — read
// defensively since the shared Purchasing.types may not declare all of
// these fields yet.
interface RawMasterBarangRef {
  is_include_tax?: boolean;
  pajak?: number;
  kode_barang?: string;
}
interface RawPoItem {
  id: number;
  id_item: number;
  id_brand: number | null;
  nama_item: string;
  nama_brand: string;
  qty: number;
  qty_beli: number;
  tipe_barang: string;
  satuan: string;
  harga: number;
  total: number;
  ppn: number;
  is_ppn: boolean;
  master_barang?: RawMasterBarangRef;
}
interface RawPoItemJo {
  id: number;
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
  master_barang?: RawMasterBarangRef;
}

interface Allocation {
  allocId: string;
  id?: number; // existing `items` row id — lets the PUT update instead of duplicate
  id_jo_item?: number; // existing `items_jo` row id — same reason
  id_item: number;
  id_brand: number | null;
  nama_brand: string;
  nama_item: string;
  kode_barang: string;
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
  id_jo: number;
  no_jo: string;
  tgl_kirim: string;
  rencana_cetak: string;
}

interface RowGroup {
  groupId: string;
  jo: JoContext | null;
  tipe_barang: string;
  qty_bom: number;
  allocations: Allocation[];
}

const uid = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const toISODate = (value?: string): string => (value ? value.slice(0, 10) : '');

const resolveBrandName = (
  idBrand: number | null | undefined,
  brandMap: Map<number, string>,
  fallback: string,
): string => {
  if (idBrand && brandMap.has(idBrand)) return brandMap.get(idBrand) as string;
  return fallback || '';
};

const recalcAllocPpn = (a: Allocation): Allocation => ({
  ...a,
  ppn: a.is_ppn ? Math.round(a.qty_po * a.harga * (a.pajak_persen / 100)) : 0,
});

// Badge for a row's allocation status vs its BOM need.
// remaining === 0  -> exact match ("Lengkap")
// remaining > 0    -> still short  ("Sisa N")
// remaining < 0    -> bought more than needed ("Lebih N") — previously
//                     silently swallowed into "Lengkap" via `<= 0`.
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

// Group items_jo by (id_jo, qty_bom) — NOT id_jo alone. See file header
// comment for why: the same id_jo can carry multiple distinct BOM needs.
const buildRowGroups = (
  items: RawPoItem[],
  itemsJo: RawPoItemJo[],
  brandMap: Map<number, string>,
): RowGroup[] => {
  const itemByIdItem = new Map<number, RawPoItem>();
  items.forEach((it) => itemByIdItem.set(it.id_item, it));

  const needGroups = new Map<string, RawPoItemJo[]>();
  itemsJo.forEach((ij) => {
    const key = `${ij.id_jo}::${ij.qty_bom}`;
    const arr = needGroups.get(key) || [];
    arr.push(ij);
    needGroups.set(key, arr);
  });

  const usedIdItems = new Set(itemsJo.map((ij) => ij.id_item));
  const groups: RowGroup[] = [];

  needGroups.forEach((rowsForNeed) => {
    const sorted = [...rowsForNeed].sort((a, b) => a.id - b.id);
    const allocations: Allocation[] = sorted.map((ij, idx) => {
      const matched = itemByIdItem.get(ij.id_item);
      const isTaxLocked = !!ij.master_barang?.is_include_tax;
      return recalcAllocPpn({
        allocId: `existing-jo-${ij.id}`,
        id: matched?.id,
        id_jo_item: ij.id,
        id_item: ij.id_item,
        id_brand: ij.id_brand,
        nama_brand: resolveBrandName(ij.id_brand, brandMap, ij.nama_brand),
        nama_item: ij.nama_item,
        kode_barang: ij.master_barang?.kode_barang || '',
        satuan: ij.satuan,
        qty_po: ij.qty_po,
        harga: matched?.harga ?? 0,
        is_ppn: isTaxLocked || !!matched?.is_ppn,
        is_tax_locked: isTaxLocked,
        pajak_persen: ij.master_barang?.pajak ?? DEFAULT_PPN_PERSEN,
        ppn: 0,
        is_substitute: idx > 0,
      });
    });

    groups.push({
      groupId: `jo-${sorted[0].id_jo}-${sorted[0].qty_bom}`,
      jo: {
        id_jo: sorted[0].id_jo,
        no_jo: sorted[0].no_jo,
        tgl_kirim: toISODate(sorted[0].tgl_kirim),
        rencana_cetak: toISODate(sorted[0].rencana_cetak),
      },
      tipe_barang: sorted[0].tipe_barang,
      qty_bom: sorted[0].qty_bom,
      allocations,
    });
  });

  // Items on the PO not tied to any JO at all — manual additions.
  items
    .filter((it) => !usedIdItems.has(it.id_item))
    .forEach((it) => {
      groups.push({
        groupId: `manual-${it.id}`,
        jo: null,
        tipe_barang: it.tipe_barang,
        qty_bom: 0,
        allocations: [
          recalcAllocPpn({
            allocId: `existing-item-${it.id}`,
            id: it.id,
            id_item: it.id_item,
            id_brand: it.id_brand,
            nama_brand: resolveBrandName(it.id_brand, brandMap, it.nama_brand),
            nama_item: it.nama_item,
            kode_barang: it.master_barang?.kode_barang || '',
            satuan: it.satuan,
            qty_po: it.qty_beli,
            harga: it.harga,
            is_ppn: it.is_ppn,
            is_tax_locked: !!it.master_barang?.is_include_tax,
            pajak_persen: it.master_barang?.pajak ?? DEFAULT_PPN_PERSEN,
            ppn: it.ppn,
            is_substitute: false,
          }),
        ],
      });
    });

  return groups;
};

const emptyManualAllocation = (): Allocation => ({
  allocId: uid(),
  id_item: 0,
  id_brand: null,
  nama_brand: '',
  nama_item: '',
  kode_barang: '',
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
  qty_bom: 0,
  allocations: [emptyManualAllocation()],
});

// Normalize the dedup key so two allocations of the "same" item always
// merge — regardless of which JO/need row they came from, and regardless
// of id_item arriving as a number vs numeric string. Falls back to the
// item name only when id_item is genuinely falsy (0/null/undefined),
// e.g. manually typed rows with no master-item link.
const normalizeKey = (a: { id_item: number; nama_item?: string }): string => {
  const idItem = Number(a.id_item);
  if (idItem && !Number.isNaN(idItem)) return `id:${idItem}`;
  const name = (a.nama_item ?? '').trim().toLowerCase();
  return `name:${name}`;
};

// One entry per distinct id_item, summed across every allocation using it
// (regardless of which JO/need row it came from) — mirrors CreatePOModal's
// aggregation, and keeps an existing item's `id` when there was exactly
// one so the PUT updates in place. This is what keeps `items` as a pure
// combined buy list while `items_jo` stays per-JO-need.
const aggregateItems = (rows: RowGroup[]) => {
  type Bucket = {
    id?: number;
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
  };
  const map = new Map<string, Bucket>();

  rows.forEach((row) => {
    row.allocations.forEach((a) => {
      if (!a.id_item && !a.nama_item.trim()) return;
      const key = normalizeKey(a);
      const existing = map.get(key);
      if (existing) {
        existing.qty += a.qty_po;
        existing.value += a.qty_po * a.harga;
        existing.ppn += a.ppn;
        existing.is_ppn = existing.is_ppn || a.is_ppn;
        existing.id = existing.id ?? a.id;
      } else {
        map.set(key, {
          id: a.id,
          id_item: a.id_item,
          id_brand: a.id_brand,
          nama_item: a.nama_item,
          nama_brand: a.nama_brand,
          kode_barang: a.kode_barang,
          tipe_barang: row.tipe_barang,
          satuan: a.satuan,
          qty: a.qty_po,
          value: a.qty_po * a.harga,
          ppn: a.ppn,
          is_ppn: a.is_ppn,
        });
      }
    });
  });

  return Array.from(map.values()).map((b) => {
    const harga = b.qty > 0 ? Math.round(b.value / b.qty) : 0;
    return {
      id: b.id, // undefined for brand-new items — fine, API treats as insert
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
    };
  });
};

// tgl_kirim on every items_jo row mirrors the PO's own Tanggal Kirim field
// (tglKirimPO) — NOT each JO's individual delivery date. Confirmed against
// the API contract: "tgl_kirim, SAMA SEPERTI PO".
const buildItemsJoPayload = (
  rows: RowGroup[],
  idPo: number,
  tglKirimPO: string,
) =>
  rows
    .filter((r) => r.jo)
    .flatMap((r) =>
      r.allocations
        .filter((a) => a.id_item || a.nama_item.trim())
        .map((a) => ({
          ...(a.id_jo_item
            ? { id: a.id_jo_item, id_purchase_order: idPo }
            : {}),
          id_jo: r.jo!.id_jo,
          id_item: a.id_item,
          id_brand: a.id_brand,
          no_jo: r.jo!.no_jo,
          nama_item: a.nama_item,
          nama_brand: a.nama_brand,
          qty_bom: r.qty_bom,
          qty_po: a.qty_po,
          tipe_barang: r.tipe_barang,
          satuan: a.satuan,
          tgl_kirim: tglKirimPO,
          rencana_cetak: r.jo!.rencana_cetak,
        })),
    );

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

type EditPOModalProps = {
  idPo: number;
  onClose: () => void;
  onSaved: () => void;
};

const EditPOModal: React.FC<EditPOModalProps> = ({
  idPo,
  onClose,
  onSaved,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [po, setPo] = useState<PurchaseOrder | null>(null);
  const [loadError, setLoadError] = useState<string>('');

  const [noPurchaseOrder, setNoPurchaseOrder] = useState<string>('');
  const [tglPO, setTglPO] = useState<string>('');
  const [tglKirim, setTglKirim] = useState<string>('');
  const [noteSupplier, setNoteSupplier] = useState<string>('');
  const [noteInternal, setNoteInternal] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);
  const [rows, setRows] = useState<RowGroup[]>([]);

  // Raw detail payload kept around so rows can be rebuilt once the brand
  // map arrives (brand names in `items`/`items_jo` are usually populated,
  // but older POs may need the id -> name fallback).
  const [rawItems, setRawItems] = useState<RawPoItem[]>([]);
  const [rawItemsJo, setRawItemsJo] = useState<RawPoItemJo[]>([]);

  const [vendors, setVendors] = useState<MasterVendorItem[]>([]);
  const [vendorsLoading, setVendorsLoading] = useState<boolean>(true);
  const [vendorId, setVendorId] = useState<number | ''>('');

  const [brandMap, setBrandMap] = useState<Map<number, string>>(new Map());

  const [submitting, setSubmitting] = useState<false | 'save' | 'submit'>(
    false,
  );
  const [error, setError] = useState<string>('');

  // --- Substitute-item picker (same as CreatePOModal, scoped to one row) ---
  const [pickerGroupId, setPickerGroupId] = useState<string | null>(null);
  const [pickerSearchInput, setPickerSearchInput] = useState<string>('');
  const [pickerResults, setPickerResults] = useState<MasterBarangItem[]>([]);
  const [pickerLoading, setPickerLoading] = useState<boolean>(false);

  const pickerRow = useMemo(
    () => rows.find((r) => r.groupId === pickerGroupId) || null,
    [rows, pickerGroupId],
  );

  useEffect(() => {
    const fetchDetail = async () => {
      const url = `${
        import.meta.env.VITE_API_LINK
      }/purchasing/purchaseOrder/${idPo}`;
      try {
        setLoading(true);
        const res = await axios.get<PurchaseOrderDetailResponse>(url, {
          withCredentials: true,
        });
        const detail = res.data.data;
        const raw = detail as unknown as {
          id_vendor?: number | null;
          items?: RawPoItem[];
          items_jo?: RawPoItemJo[];
        };
        setPo(detail);
        setNoPurchaseOrder(detail.no_purchase_order || '');
        setVendorId(raw.id_vendor ?? '');
        setTglPO(toISODate(detail.tgl_po));
        setTglKirim(toISODate(detail.tgl_kirim));
        setNoteSupplier(detail.note_supplier || '');
        setNoteInternal(detail.note_internal || '');
        setDiscount(detail.discount || 0);

        const items = raw.items || [];
        const itemsJo = raw.items_jo || [];
        setRawItems(items);
        setRawItemsJo(itemsJo);
        setRows(buildRowGroups(items, itemsJo, new Map()));
      } catch (err) {
        console.error('Error fetching PO detail:', err);
        setLoadError('Gagal memuat detail PO. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idPo]);

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

  // Rebuild rows once the brand map lands, so blank/older brand names get
  // resolved. Only re-runs when the raw detail or the map actually changes.
  useEffect(() => {
    if (rawItems.length === 0 && rawItemsJo.length === 0) return;
    setRows(buildRowGroups(rawItems, rawItemsJo, brandMap));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandMap, rawItems, rawItemsJo]);

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
    if (vendorsLoading) return;
    if (vendorId !== '' && !vendors.some((v) => v.id === vendorId)) {
      setVendorId('');
    }
  }, [vendors, vendorId, vendorsLoading]);

  const selectedVendor = useMemo(
    () => vendors.find((v) => v.id === vendorId) || null,
    [vendors, vendorId],
  );

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
            return recalcAllocPpn(updated);
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
          sub_kategori: pickerRow.tipe_barang || undefined,
        },
        withCredentials: true,
      });
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
    const isTaxLocked = !!masterItem.is_include_tax;
    const newAlloc: Allocation = recalcAllocPpn({
      allocId: uid(),
      id_item: masterItem.id,
      id_brand: masterItem.id_brand ?? null,
      nama_brand: resolveBrandName(
        masterItem.id_brand,
        brandMap,
        masterItem.brand_name,
      ),
      nama_item: masterItem.nama_barang,
      kode_barang: masterItem.kode_barang || '',
      satuan:
        masterItem.purchase_unit_name || pickerRow.allocations[0]?.satuan || '',
      qty_po: Math.max(remaining, 0),
      harga: masterItem.harga ?? 0,
      is_ppn: isTaxLocked,
      is_tax_locked: isTaxLocked,
      pajak_persen: masterItem.pajak ?? DEFAULT_PPN_PERSEN,
      ppn: 0,
      is_substitute: true,
    });
    setRows((prev) =>
      prev.map((row) =>
        row.groupId === pickerRow.groupId
          ? { ...row, allocations: [...row.allocations, newAlloc] }
          : row,
      ),
    );
    closePicker();
  };

  const itemsAggregate = useMemo(() => aggregateItems(rows), [rows]);
  const subTotal = useMemo(
    () => itemsAggregate.reduce((sum, it) => sum + it.total, 0),
    [itemsAggregate],
  );
  const totalPPN = useMemo(
    () => itemsAggregate.reduce((sum, it) => sum + it.ppn, 0),
    [itemsAggregate],
  );
  const grandTotal = subTotal - (discount || 0) + totalPPN;

  const isRejected =
    po?.status === 'reject kabag' || po?.status === 'reject finance';

  const buildPayload = (): UpdatePurchaseOrderPayload =>
    ({
      sub_total: subTotal,
      discount: discount || 0,
      ppn: totalPPN,
      total: grandTotal,
      no_purchase_order: noPurchaseOrder,
      id_vendor: vendorId === '' ? null : vendorId,
      nama_vendor: selectedVendor?.nama_vendor || '',
      tgl_po: tglPO,
      tgl_kirim: tglKirim,
      note_internal: noteInternal,
      note_supplier: noteSupplier,
      items: itemsAggregate.map((it) => ({
        ...(it.id ? { id: it.id, id_purchase_order: idPo } : {}),
        id_item: it.id_item,
        id_brand: it.id_brand,
        nama_item: it.nama_item,
        nama_brand: it.nama_brand,
        qty: it.qty,
        qty_beli: it.qty_beli,
        tipe_barang: it.tipe_barang,
        satuan: it.satuan,
        harga: it.harga,
        total: it.total,
        ppn: it.ppn,
        is_ppn: it.is_ppn,
      })),
      items_jo: buildItemsJoPayload(rows, idPo, tglKirim),
    }) as UpdatePurchaseOrderPayload;

  const validate = (): string => {
    if (!vendorId) return 'Vendor wajib dipilih.';
    if (rows.length === 0) return 'Minimal 1 item diperlukan.';
    for (const row of rows) {
      for (const a of row.allocations) {
        if (!a.nama_item.trim()) return 'Nama barang tidak boleh kosong.';
        if (a.qty_po <= 0)
          return `Qty beli untuk "${a.nama_item}" harus lebih dari 0.`;
        if (a.harga < 0)
          return `Harga untuk "${a.nama_item}" tidak boleh negatif.`;
      }
    }
    return '';
  };

  const handleSaveDraft = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setSubmitting('save');
    try {
      const url = `${
        import.meta.env.VITE_API_LINK
      }/purchasing/purchaseOrder/${idPo}`;
      await axios.put(url, buildPayload(), { withCredentials: true });
      onSaved();
    } catch (err) {
      console.error('Error updating PO:', err);
      setError('Gagal menyimpan perubahan. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveAndSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setSubmitting('submit');
    try {
      const baseUrl = `${
        import.meta.env.VITE_API_LINK
      }/purchasing/purchaseOrder`;
      await axios.put(`${baseUrl}/${idPo}`, buildPayload(), {
        withCredentials: true,
      });
      await axios.put(`${baseUrl}/request/${idPo}`, undefined, {
        withCredentials: true,
      });
      onSaved();
    } catch (err) {
      console.error('Error submitting PO:', err);
      setError('Gagal mengajukan PO ke Kabag. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-full max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              Edit Purchase Order
              {po && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ring-1 font-medium ${getStatusColor(
                    po.status,
                  )}`}
                >
                  {getStatusLabel(po.status)}
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {po ? po.no_purchase_order : 'Memuat...'}
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
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent" />
          </div>
        ) : loadError ? (
          <div className="px-6 py-14 text-center">
            <p className="text-red-600 text-sm font-medium">{loadError}</p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {isRejected && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg px-4 py-2.5">
                PO ini ditolak ({getStatusLabel(po?.status)}). Perbaiki data di
                bawah lalu ajukan kembali ke Kabag.
              </div>
            )}

            {/* PO meta */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Nomor PO
                </label>
                <input
                  type="text"
                  value={noPurchaseOrder}
                  onChange={(e) => setNoPurchaseOrder(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
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

            {/* Items — grouped by JO need, each need can hold 1+ allocations (substitutes) */}
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
                          <span>
                            Butuh:{' '}
                            <b className="text-slate-800">
                              {row.qty_bom} {row.allocations[0]?.satuan || ''}
                            </b>
                          </span>
                          <span>
                            Kirim: {formatDateShort(row.jo.tgl_kirim)}
                          </span>
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
                            <tr
                              key={a.allocId}
                              className="hover:bg-slate-50/60"
                            >
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
                                    value={a.nama_item}
                                    onChange={(e) =>
                                      updateAllocation(row.groupId, a.allocId, {
                                        nama_item: e.target.value,
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
                                <input
                                  type="number"
                                  min={0}
                                  value={a.qty_po}
                                  onChange={(e) =>
                                    updateAllocation(row.groupId, a.allocId, {
                                      qty_po: parseFloat(e.target.value) || 0,
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
                                <input
                                  type="number"
                                  min={0}
                                  value={a.harga}
                                  onChange={(e) =>
                                    updateAllocation(row.groupId, a.allocId, {
                                      harga: parseFloat(e.target.value) || 0,
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
                                        ? 'Pajak wajib untuk barang ini dan tidak dapat dilepas'
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

              <button
                onClick={addManualRow}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                + Tambah baris manual
              </button>
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
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">
                    Catatan Internal
                  </label>
                  <textarea
                    value={noteInternal}
                    onChange={(e) => setNoteInternal(e.target.value)}
                    rows={5}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono text-xs"
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
                  <input
                    type="number"
                    min={0}
                    value={discount}
                    onChange={(e) =>
                      setDiscount(parseFloat(e.target.value) || 0)
                    }
                    className="w-32 px-2 py-1 text-sm text-right border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">PPN</span>
                  <span className="text-slate-800 font-medium tabular-nums">
                    Rp {formatRupiah(totalPPN)}
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
        )}

        {/* Footer */}
        {!loading && !loadError && (
          <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-2 rounded-b-2xl">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Kembali
            </button>
            <button
              onClick={handleSaveDraft}
              disabled={!!submitting}
              className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 rounded-lg font-medium transition-colors"
            >
              {submitting === 'save' ? 'Menyimpan...' : 'Simpan Draft'}
            </button>
            <button
              onClick={handleSaveAndSubmit}
              disabled={!!submitting}
              className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {submitting === 'submit'
                ? 'Mengajukan...'
                : 'Simpan & Ajukan ke Kabag'}
            </button>
          </div>
        )}
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

export default EditPOModal;
