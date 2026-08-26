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
const aggregateItems = (rows: RowGroup[]): ItemPayload[] => {
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
  const totalPPN = useMemo(
    () => itemsAggregate.reduce((sum, it) => sum + it.ppn, 0),
    [itemsAggregate],
  );
  const grandTotal = subTotal - (discount || 0) + totalPPN;

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
      items: itemsAggregate,
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
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
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
