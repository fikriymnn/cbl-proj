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
import { getApiErrorMessage } from './Types/poApi';
import NumberInput from './NumberInput';
import BookingPickerDialog, { BookingPick } from './BookingPickerDialog';

/* =============================================================================
 * CreatePOModal — PO BIASA dari baris pengajuan terpilih (items + items_jo).
 *
 * PERUBAHAN (PO Booking):
 *   1. Mode "manual" DIHAPUS. "+ PO Manual" sekarang membuat PO Booking lewat
 *      POBookingFormModal, jadi modal ini hanya melayani from_selection (prop
 *      `mode`, baris item manual, "+ Tambah baris" ikut dihapus).
 *   2. "Ambil dari PO Booking" di tiap baris items_jo:
 *        - qty_po      = qty yang DIPESAN ke vendor di PO ini
 *        - qty_booking = qty yang DIAMBIL dari stok PO Booking
 *        - kebutuhan JO terpenuhi = qty_po + qty_booking
 *      Payload items_jo mengirim id_purchase_order_booking_item + qty_booking.
 *      Satu baris items_jo hanya bisa ambil dari SATU item booking.
 *   3. Item yang qty vendornya 0 (semua dari booking) tidak ikut `items`.
 *   4. NumberInput diimport dari ./NumberInput (kode sama dengan versi inline).
 *   5. Pesan error backend ditampilkan apa adanya saat simpan.
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
  // --- PO Booking ---
  id_purchase_order_booking_item?: number | null;
  qty_booking: number;
  booking_no_po?: string;
  booking_max?: number; // batas qty_booking (qty tersedia item booking itu)
  is_booking_moved?: boolean; // hanya relevan di EditPOModal
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
  jo: JoContext;
  tipe_barang: string;
  original_id_item: number;
  original_nama_item: string;
  qty_bom: number; // the fixed original qty this JO needs of original item
  allocations: Allocation[];
}

interface ItemAggSubGroup {
  row: RowGroup;
  allocations: Allocation[];
}

interface ItemAggGroup {
  key: string;
  id_item: number;
  nama_item: string;
  nama_brand: string;
  satuan: string;
  totalQty: number;
  avgHarga: number;
  total: number;
  ppn: number;
  is_ppn: boolean;
  is_tax_locked: boolean;
  subGroups: ItemAggSubGroup[];
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
  id_purchase_order_booking_item?: number;
  qty_booking?: number;
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
  selectedItems: PengajuanItem[];
  onClose: () => void;
  onSuccess: () => void;
}

const todayISO = (): string => new Date().toISOString().slice(0, 10);
const uid = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const round2 = (n: number): number => Math.round(n * 100) / 100;

const recalcPpn = (a: Allocation): Allocation => {
  const total = a.qty_po * a.harga;
  let ppn = 0;
  if (a.is_tax_locked) {
    // harga already includes PPN — extract the tax portion instead of
    // adding it on top.
    const base = total / (1 + a.pajak_persen / 100);
    ppn = Math.round(total - base);
  } else if (a.is_ppn) {
    ppn = Math.round(total * (a.pajak_persen / 100));
  }
  return { ...a, ppn };
};

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
    id_purchase_order_booking_item: null,
    qty_booking: 0,
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
    nama_brand: resolveBrandName(
      masterItem.id_brand,
      brandMap,
      masterItem.brand_name,
    ),
    kode_barang: masterItem.kode_barang || '',
    nama_barang: masterItem.nama_barang,
    satuan: masterItem.purchase_unit_name || '',
    qty_po: Math.max(qty, 0),
    harga: masterItem.harga ?? 0,
    is_ppn: isTaxLocked,
    is_tax_locked: isTaxLocked,
    pajak_persen: masterItem.pajak ?? DEFAULT_PPN_PERSEN,
    ppn: 0,
    is_substitute: true,
    id_purchase_order_booking_item: null,
    qty_booking: 0,
  });
};

// Each selected pengajuan row is already exactly one JO's need for one item,
// so it maps 1:1 to a RowGroup (merging across JOs happens only at
// payload-build time, for the aggregate `items` array).
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
    tipe_barang: item.detail_item?.sub_kategori || item.tipe_barang || '',
    original_id_item: item.id_item ?? 0,
    original_nama_item: item.detail_item?.nama_barang || item.nama_item,
    qty_bom: item.qty,
    allocations: [makeAllocationFromPengajuan(item, brandMap)],
  }));

const buildInternalNote = (rows: RowGroup[]): string =>
  rows
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
      return `- ${r.jo.no_jo} (butuh ${r.qty_bom} ${r.original_nama_item})\n${lines}`;
    })
    .join('\n');

// Groups allocations by item (same key as `aggregateItems`), keeping a
// `subGroups` pointer back to each contributing RowGroup so the UI can
// render a collapsed summary row and, on expand, the editable per-JO detail.
const buildItemAggGroups = (rows: RowGroup[]): ItemAggGroup[] => {
  type Bucket = {
    key: string;
    id_item: number;
    nama_item: string;
    nama_brand: string;
    satuan: string;
    qty: number;
    value: number;
    ppn: number;
    is_ppn: boolean;
    is_tax_locked: boolean;
    subGroupsByRow: Map<string, ItemAggSubGroup>;
  };
  const map = new Map<string, Bucket>();

  rows.forEach((row) => {
    row.allocations.forEach((a) => {
      if (!a.id_item && !a.nama_barang.trim()) return; // skip blank rows
      const key = a.id_item
        ? `id:${a.id_item}`
        : `name:${a.nama_barang.trim().toLowerCase()}`;
      let bucket = map.get(key);
      if (!bucket) {
        bucket = {
          key,
          id_item: a.id_item,
          nama_item: a.nama_barang,
          nama_brand: a.nama_brand,
          satuan: a.satuan,
          qty: 0,
          value: 0,
          ppn: 0,
          is_ppn: false,
          is_tax_locked: false,
          subGroupsByRow: new Map(),
        };
        map.set(key, bucket);
      }
      bucket.qty += a.qty_po;
      bucket.value += a.qty_po * a.harga;
      bucket.ppn += a.ppn;
      bucket.is_ppn = bucket.is_ppn || a.is_ppn;
      bucket.is_tax_locked = bucket.is_tax_locked || a.is_tax_locked;

      let sub = bucket.subGroupsByRow.get(row.groupId);
      if (!sub) {
        sub = { row, allocations: [] };
        bucket.subGroupsByRow.set(row.groupId, sub);
      }
      sub.allocations.push(a);
    });
  });

  return Array.from(map.values()).map((b) => ({
    key: b.key,
    id_item: b.id_item,
    nama_item: b.nama_item,
    nama_brand: b.nama_brand,
    satuan: b.satuan,
    totalQty: b.qty,
    avgHarga: b.qty > 0 ? Math.round(b.value / b.qty) : 0,
    total: b.value,
    ppn: b.ppn,
    is_ppn: b.is_ppn,
    is_tax_locked: b.is_tax_locked,
    subGroups: Array.from(b.subGroupsByRow.values()),
  }));
};

// One entry per distinct id_item, summed across every allocation that uses
// it. Unit price is a qty-weighted average. `qty` di sini = qty yang dibeli
// ke vendor (qty_po) — qty_booking tidak ikut. Item yang qty vendornya 0
// (semua dari booking) dibuang dari buy list.
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
      if (!a.id_item && !a.nama_barang.trim()) return;
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

  return Array.from(map.values())
    .filter((b) => b.qty > 0)
    .map((b) => {
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
  rows.flatMap((r) =>
    r.allocations
      .filter((a) => a.id_item || a.nama_barang.trim())
      .map((a) => ({
        id_jo: r.jo.id_jo,
        id_item: a.id_item,
        id_brand: a.id_brand,
        no_jo: r.jo.no_jo,
        nama_item: a.nama_barang,
        nama_brand: a.nama_brand,
        qty_bom: r.qty_bom,
        qty_po: a.qty_po,
        tipe_barang: r.tipe_barang,
        satuan: a.satuan,
        tgl_kirim: tglKirimPO, // PO's own Tanggal Kirim, per spec
        rencana_cetak: r.jo.rencana_cetak,
        // Hanya dikirim bila memang mengambil dari booking
        ...(a.id_purchase_order_booking_item && a.qty_booking > 0
          ? {
              id_purchase_order_booking_item: a.id_purchase_order_booking_item,
              qty_booking: a.qty_booking,
            }
          : {}),
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

const CreatePOModal: React.FC<CreatePOModalProps> = ({
  selectedItems,
  onClose,
  onSuccess,
}) => {
  const [rows, setRows] = useState<RowGroup[]>(() =>
    buildRowsFromSelection(selectedItems, new Map()),
  );
  const [expandedItemKeys, setExpandedItemKeys] = useState<Set<string>>(
    new Set(),
  );
  const [noPO, setNoPO] = useState<string>('');
  const [loadingNo, setLoadingNo] = useState<boolean>(true);

  // --- Vendor ---
  const [vendors, setVendors] = useState<MasterVendorItem[]>([]);
  const [vendorsLoading, setVendorsLoading] = useState<boolean>(true);
  const [vendorId, setVendorId] = useState<number | ''>('');

  const [tglPO, setTglPO] = useState<string>(todayISO());
  const [noteSupplier, setNoteSupplier] = useState<string>('');
  const [noteInternal, setNoteInternal] = useState<string>(() =>
    buildInternalNote(buildRowsFromSelection(selectedItems, new Map())),
  );
  const [discount, setDiscount] = useState<number>(0);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // --- Master Brand (id -> nama_brand) ---
  const [brandMap, setBrandMap] = useState<Map<number, string>>(new Map());
  const brandBackfilledRef = useRef(false);

  // --- Substitute-item picker ---
  const [pickerGroupId, setPickerGroupId] = useState<string | null>(null);
  const [pickerSearchInput, setPickerSearchInput] = useState<string>('');
  const [pickerResults, setPickerResults] = useState<MasterBarangItem[]>([]);
  const [pickerLoading, setPickerLoading] = useState<boolean>(false);

  // --- "Ambil dari PO Booking" picker (scoped ke satu baris alokasi) ---
  const [bookingTarget, setBookingTarget] = useState<{
    groupId: string;
    allocId: string;
    idItem: number;
    nama: string;
  } | null>(null);

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
  // blank and regenerate the internal note. Runs once.
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
      setNoteInternal(buildInternalNote(updated));
      return updated;
    });
  }, [brandMap]);

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

  // Earliest need date across the selected JOs; today if none.
  const derivedTglKirim = useMemo(() => {
    const times = rows
      .map((r) => r.jo.tgl_kirim)
      .filter(Boolean)
      .map((d) => new Date(d).getTime())
      .filter((t) => !Number.isNaN(t));
    if (times.length === 0) return todayISO();
    return new Date(Math.min(...times)).toISOString().slice(0, 10);
  }, [rows]);

  const [tglKirim, setTglKirim] = useState<string>(derivedTglKirim);
  useEffect(() => {
    setTglKirim(derivedTglKirim);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Allocation mutation helpers ---

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

  const toggleItemExpand = (key: string) =>
    setExpandedItemKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const itemAggGroups = useMemo(() => buildItemAggGroups(rows), [rows]);

  // --- Substitute picker ---

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
    // Kebutuhan yang sudah terpenuhi = qty vendor + qty booking
    const currentQty = pickerRow.allocations.reduce(
      (sum, a) => sum + a.qty_po + a.qty_booking,
      0,
    );
    const remaining = Math.max(pickerRow.qty_bom - currentQty, 0);
    const newAlloc = makeAllocationFromMasterItem(
      masterItem,
      remaining,
      brandMap,
    );
    if (!newAlloc.satuan) {
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

  // --- Ambil dari PO Booking ---

  const handlePickBooking = (b: BookingPick) => {
    if (!bookingTarget) return;
    setRows((prev) =>
      prev.map((row) =>
        row.groupId !== bookingTarget.groupId
          ? row
          : {
              ...row,
              allocations: row.allocations.map((a) => {
                if (a.allocId !== bookingTarget.allocId) return a;
                // Default: ambil sebanyak mungkin dari booking; sisanya tetap
                // dipesan ke vendor (qty_po berkurang sebesar qty_booking).
                const take = Math.min(b.max, a.qty_po);
                return recalcPpn({
                  ...a,
                  id_purchase_order_booking_item: b.id,
                  booking_no_po: b.no_po,
                  booking_max: b.max,
                  qty_booking: take,
                  qty_po: round2(a.qty_po - take),
                });
              }),
            },
      ),
    );
    setBookingTarget(null);
  };

  const releaseBooking = (groupId: string, a: Allocation) =>
    updateAllocation(groupId, a.allocId, {
      qty_po: round2(a.qty_po + a.qty_booking),
      qty_booking: 0,
      id_purchase_order_booking_item: null,
      booking_no_po: undefined,
      booking_max: undefined,
    });

  // --- Totals ---

  const itemsAggregate = useMemo(() => aggregateItems(rows), [rows]);
  const subTotal = useMemo(
    () => itemsAggregate.reduce((sum, it) => sum + it.total, 0),
    [itemsAggregate],
  );
  // PPN already baked into the master price (is_tax_locked) — info only.
  const ppnIncluded = useMemo(
    () =>
      itemsAggregate
        .filter((it) => it.is_tax_locked)
        .reduce((sum, it) => sum + it.ppn, 0),
    [itemsAggregate],
  );
  // PPN from non-tax-locked items with the PPN checkbox ticked — added on top.
  const ppnAddedToTotal = useMemo(
    () =>
      itemsAggregate
        .filter((it) => !it.is_tax_locked)
        .reduce((sum, it) => sum + it.ppn, 0),
    [itemsAggregate],
  );
  const totalPPN = ppnIncluded + ppnAddedToTotal;
  const grandTotal = subTotal - (discount || 0) + ppnAddedToTotal;
  const subTotalExTax = subTotal - ppnIncluded;
  const formatRupiah = (value: number): string =>
    value.toLocaleString('id-ID', { maximumFractionDigits: 0 });

  const validate = (): string => {
    if (!vendorId) return 'Vendor wajib dipilih.';
    if (rows.length === 0) return 'Minimal 1 item diperlukan.';
    const bookingUsed = new Map<
      number,
      { sum: number; max?: number; no?: string }
    >();
    for (const row of rows) {
      for (const a of row.allocations) {
        if (!a.nama_barang.trim()) return 'Nama barang tidak boleh kosong.';
        if (a.qty_po + a.qty_booking <= 0)
          return `Qty beli atau qty booking untuk "${a.nama_barang}" harus lebih dari 0.`;
        if (a.harga < 0)
          return `Harga untuk "${a.nama_barang}" tidak boleh negatif.`;
        if (a.qty_booking > 0) {
          const idB = a.id_purchase_order_booking_item;
          if (!idB)
            return `Pilih PO Booking untuk "${a.nama_barang}" atau kosongkan qty booking.`;
          const cur = bookingUsed.get(idB) || {
            sum: 0,
            max: a.booking_max,
            no: a.booking_no_po,
          };
          cur.sum += a.qty_booking;
          bookingUsed.set(idB, cur);
        }
      }
    }
    // Beberapa baris bisa mengambil dari item booking yang sama — totalnya
    // tidak boleh melebihi qty tersedia.
    for (const [idB, u] of Array.from(bookingUsed.entries())) {
      if (u.max !== undefined && u.sum > u.max + 1e-9)
        return `Total qty booking dari ${u.no || `#${idB}`} (${
          u.sum
        }) melebihi qty tersedia (${u.max}).`;
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
      sub_total: subTotalExTax,
      ppn: totalPPN,
      discount: discount || 0,
      total: grandTotal,
      note_internal: noteInternal,
      note_supplier: noteSupplier,
      // Strip the internal-only is_tax_locked flag before it goes out.
      items: itemsAggregate.map(({ is_tax_locked, ...item }) => item),
      items_jo: buildItemsJoPayload(rows, tglKirim),
      request_purchase_data: Array.from(
        new Set(rows.map((r) => r.jo.id_pengajuan)),
      ).map((id) => ({ id })),
    };
    try {
      console.log('Submitting PO payload:', payload);
      const url = `${import.meta.env.VITE_API_LINK}/purchasing/purchaseOrder`;
      await axios.post(url, payload, { withCredentials: true });
      onSuccess();
    } catch (err) {
      console.error('Error creating PO:', err);
      // Backend memvalidasi booking (belum approve finance, qty melebihi
      // tersedia, dll) lewat `message` — tampilkan apa adanya.
      setError(
        getApiErrorMessage(err, 'Gagal menyimpan draft PO. Silakan coba lagi.'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrintDraft = () => window.print();

  const formatQty = (value: number): string =>
    value.toLocaleString('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });

  const getAllocationBadge = (
    remaining: number,
  ): { label: string; className: string } => {
    const rounded = Math.round(remaining * 100) / 100;

    if (rounded === 0) {
      return { label: 'Lengkap', className: 'bg-emerald-50 text-emerald-700' };
    }
    if (rounded > 0) {
      return {
        label: `Sisa ${formatQty(rounded)}`,
        className: 'bg-amber-50 text-amber-700',
      };
    }
    return {
      label: `Lebih ${formatQty(Math.abs(rounded))}`,
      className: 'bg-blue-50 text-blue-700',
    };
  };

  // Allocation-editing table untuk subset alokasi di bawah satu baris
  // ringkasan item. `canRemove` mengikuti jumlah alokasi PENUH pada row
  // (baris terakhir tidak boleh dihapus).
  const renderAllocationsTable = (
    groupId: string,
    allocations: Allocation[],
    canRemove: boolean,
  ) => (
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
          {allocations.map((a) => (
            <React.Fragment key={a.allocId}>
              <tr className="hover:bg-slate-50/60">
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={a.kode_barang}
                    onChange={(e) =>
                      updateAllocation(groupId, a.allocId, {
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
                        updateAllocation(groupId, a.allocId, {
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
                      updateAllocation(groupId, a.allocId, {
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
                      updateAllocation(groupId, a.allocId, {
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
                      updateAllocation(groupId, a.allocId, {
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
                      updateAllocation(groupId, a.allocId, {
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
                        updateAllocation(groupId, a.allocId, {
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
                  {canRemove && (
                    <button
                      onClick={() => removeAllocation(groupId, a.allocId)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                      aria-label="Hapus alokasi"
                    >
                      ✕
                    </button>
                  )}
                </td>
              </tr>

              {/* Baris "Ambil dari PO Booking" */}
              <tr className="bg-slate-50/40">
                <td colSpan={9} className="px-3 py-1.5">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    {a.id_purchase_order_booking_item ? (
                      <>
                        <span>
                          Ambil dari PO Booking:{' '}
                          <b className="text-slate-700">
                            {a.booking_no_po ||
                              `#${a.id_purchase_order_booking_item}`}
                          </b>
                        </span>
                        <span className="flex items-center gap-1.5">
                          Qty booking
                          <span className="w-24">
                            <NumberInput
                              value={a.qty_booking}
                              onChange={(v) =>
                                updateAllocation(groupId, a.allocId, {
                                  qty_booking: v,
                                })
                              }
                              className="w-full px-2 py-1 text-xs text-right border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </span>
                          {a.booking_max !== undefined && (
                            <span className="text-slate-400">
                              / maks {formatQty(a.booking_max)}
                            </span>
                          )}
                        </span>
                        <button
                          onClick={() => releaseBooking(groupId, a)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Lepas
                        </button>
                      </>
                    ) : (
                      a.id_item > 0 && (
                        <button
                          onClick={() =>
                            setBookingTarget({
                              groupId,
                              allocId: a.allocId,
                              idItem: a.id_item,
                              nama: a.nama_barang,
                            })
                          }
                          className="font-medium text-indigo-600 hover:text-indigo-800"
                        >
                          + Ambil dari PO Booking
                        </button>
                      )
                    )}
                  </div>
                </td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );

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
              Digabung dari {selectedItems.length} baris pengajuan
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

          {/* Items — combined-item summary (from items_jo) */}
          <div className="space-y-3">
            {itemAggGroups.length > 0 ? (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-3 py-2 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide w-8"></th>
                      <th className="px-3 py-2 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                        Nama Barang
                      </th>
                      <th className="px-3 py-2 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                        Brand
                      </th>
                      <th className="px-3 py-2 text-right text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                        Total Qty
                      </th>
                      <th className="px-3 py-2 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                        Unit
                      </th>
                      <th className="px-3 py-2 text-right text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                        Harga Rata²
                      </th>
                      <th className="px-3 py-2 text-right text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                        Total
                      </th>
                      <th className="px-3 py-2 text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                        Sumber
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {itemAggGroups.map((ig) => {
                      const isExpanded = expandedItemKeys.has(ig.key);
                      return (
                        <React.Fragment key={ig.key}>
                          <tr
                            className="hover:bg-slate-50/60 cursor-pointer select-none"
                            onClick={() => toggleItemExpand(ig.key)}
                          >
                            <td className="px-3 py-2.5 text-slate-400">
                              <span
                                className={`inline-block transition-transform duration-150 ${
                                  isExpanded ? 'rotate-90' : ''
                                }`}
                              >
                                ▶
                              </span>
                            </td>
                            <td className="px-3 py-2.5 font-medium text-slate-800">
                              {ig.nama_item || '-'}
                            </td>
                            <td className="px-3 py-2.5 text-slate-600">
                              {ig.nama_brand || '-'}
                            </td>
                            <td className="px-3 py-2.5 text-right tabular-nums text-slate-700">
                              {ig.totalQty}
                            </td>
                            <td className="px-3 py-2.5 text-slate-500">
                              {ig.satuan || '-'}
                            </td>
                            <td className="px-3 py-2.5 text-right tabular-nums text-slate-700">
                              Rp {formatRupiah(ig.avgHarga)}
                            </td>
                            <td className="px-3 py-2.5 text-right tabular-nums text-slate-800 font-semibold">
                              Rp {formatRupiah(ig.total)}
                            </td>
                            <td className="px-3 py-2.5 text-center text-xs text-slate-400">
                              {ig.subGroups.length} JO
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr>
                              <td colSpan={8} className="p-0 bg-slate-50/60">
                                <div className="divide-y divide-slate-100">
                                  {ig.subGroups.map((sg) => {
                                    // Kebutuhan terpenuhi = qty vendor + qty booking
                                    const qtyAllocated =
                                      sg.row.allocations.reduce(
                                        (sum, a) =>
                                          sum + a.qty_po + a.qty_booking,
                                        0,
                                      );
                                    const remaining =
                                      sg.row.qty_bom - qtyAllocated;
                                    const badge = getAllocationBadge(remaining);
                                    return (
                                      <div
                                        key={sg.row.groupId}
                                        className="px-3 py-3"
                                      >
                                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                                            <span className="font-semibold text-indigo-700">
                                              {sg.row.jo.no_jo}
                                            </span>
                                            <span>
                                              Butuh:{' '}
                                              <b className="text-slate-800">
                                                {sg.row.qty_bom}{' '}
                                                {sg.row.allocations[0]
                                                  ?.satuan || ''}
                                              </b>{' '}
                                              {sg.row.original_nama_item}
                                            </span>
                                            <span>
                                              Kirim:{' '}
                                              {formatDateShort(
                                                sg.row.jo.tgl_kirim,
                                              )}
                                            </span>
                                            <span
                                              className={`px-2 py-0.5 rounded-full font-medium ${badge.className}`}
                                            >
                                              {badge.label}
                                            </span>
                                          </div>
                                          <button
                                            onClick={() =>
                                              openPicker(sg.row.groupId)
                                            }
                                            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                                          >
                                            + Item pengganti
                                          </button>
                                        </div>
                                        <div className="rounded-lg border border-slate-200 overflow-hidden bg-white">
                                          {renderAllocationsTable(
                                            sg.row.groupId,
                                            sg.allocations,
                                            sg.row.allocations.length > 1,
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="border border-slate-100 rounded-xl px-4 py-10 text-center text-slate-400 text-sm">
                Belum ada item.
              </div>
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
                  Rp {formatRupiah(subTotalExTax)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Discount</span>
                <div>
                  <NumberInput
                    value={discount}
                    onChange={setDiscount}
                    className=" px-2 py-1 text-sm text-right border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
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
              {pickerRow.jo.no_jo}
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

      {/* PO Booking picker */}
      <BookingPickerDialog
        open={!!bookingTarget}
        idItem={bookingTarget?.idItem ?? 0}
        namaItem={bookingTarget?.nama ?? ''}
        onClose={() => setBookingTarget(null)}
        onPick={handlePickBooking}
      />
    </div>
  );
};

export default CreatePOModal;
