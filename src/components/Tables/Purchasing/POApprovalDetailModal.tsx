import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  PurchaseOrder,
  PurchaseOrderDetailResponse,
} from './Types/Purchasing.types';
import {
  formatDate,
  formatRupiah,
  getStatusColor,
  getStatusLabel,
} from './Types/poStatus';

/* =============================================================================
 * WHAT CHANGED — JO-grouped items with substitute ("pengganti") support
 * -----------------------------------------------------------------------------
 * Same underlying fix as EditPOModal: this was rendering the flat `items`
 * array, which loses per-JO grouping and any substitute allocations the
 * moment a JO's need was covered by more than one item. `items_jo` on the
 * detail response is what actually carries that breakdown — see the
 * sample GET /purchaseOrder/:id payload.
 *
 * `buildRowGroups` (duplicated from EditPOModal, since this component has
 * no shared read-only variant to import from) groups `items_jo` by
 * `id_jo`, pulls unit price from the matching `items` entry, and flags
 * every allocation after the first (by id, i.e. creation order) within a
 * JO group as a substitute for display. Items in `items` that never
 * appear in `items_jo` render as manual, ungrouped rows, same as before.
 * ========================================================================== */

interface MasterBrandItem {
  id: number;
  kode_brand: string;
  nama_brand: string;
}
interface MasterBrandListResponse {
  data: MasterBrandItem[];
  total_page: number;
}

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

interface DisplayAllocation {
  key: string;
  nama_item: string;
  nama_brand: string;
  tipe_barang: string;
  satuan: string;
  qty_po: number;
  harga: number;
  ppn: number;
  is_ppn: boolean;
  total: number;
  is_substitute: boolean;
}

interface DisplayGroup {
  key: string;
  jo: { no_jo: string; tgl_kirim: string; qty_bom: number } | null;
  allocations: DisplayAllocation[];
}

const toISODate = (value?: string): string => (value ? value.slice(0, 10) : '');

const resolveBrandName = (
  idBrand: number | null | undefined,
  brandMap: Map<number, string>,
  fallback: string,
): string => {
  if (idBrand && brandMap.has(idBrand)) return brandMap.get(idBrand) as string;
  return fallback || '';
};

const buildRowGroups = (
  items: RawPoItem[],
  itemsJo: RawPoItemJo[],
  brandMap: Map<number, string>,
): DisplayGroup[] => {
  const itemByIdItem = new Map<number, RawPoItem>();
  items.forEach((it) => itemByIdItem.set(it.id_item, it));

  const joGroups = new Map<number, RawPoItemJo[]>();
  itemsJo.forEach((ij) => {
    const arr = joGroups.get(ij.id_jo) || [];
    arr.push(ij);
    joGroups.set(ij.id_jo, arr);
  });

  const usedIdItems = new Set(itemsJo.map((ij) => ij.id_item));
  const groups: DisplayGroup[] = [];

  joGroups.forEach((rowsForJo, idJo) => {
    const sorted = [...rowsForJo].sort((a, b) => a.id - b.id);
    const allocations: DisplayAllocation[] = sorted.map((ij, idx) => {
      const matched = itemByIdItem.get(ij.id_item);
      const harga = matched?.harga ?? 0;
      const isTaxLocked = !!ij.master_barang?.is_include_tax;
      const isPpn = isTaxLocked || !!matched?.is_ppn;
      const pajakPersen = ij.master_barang?.pajak ?? 0;
      const ppn = isPpn
        ? Math.round(ij.qty_po * harga * (pajakPersen / 100))
        : 0;
      return {
        key: `jo-item-${ij.id}`,
        nama_item: ij.nama_item,
        nama_brand: resolveBrandName(ij.id_brand, brandMap, ij.nama_brand),
        tipe_barang: ij.tipe_barang,
        satuan: ij.satuan,
        qty_po: ij.qty_po,
        harga,
        ppn,
        is_ppn: isPpn,
        total: ij.qty_po * harga,
        is_substitute: idx > 0,
      };
    });

    groups.push({
      key: `jo-${idJo}`,
      jo: {
        no_jo: sorted[0].no_jo,
        tgl_kirim: toISODate(sorted[0].tgl_kirim),
        qty_bom: sorted[0].qty_bom,
      },
      allocations,
    });
  });

  items
    .filter((it) => !usedIdItems.has(it.id_item))
    .forEach((it) => {
      groups.push({
        key: `manual-${it.id}`,
        jo: null,
        allocations: [
          {
            key: `manual-item-${it.id}`,
            nama_item: it.nama_item,
            nama_brand: resolveBrandName(it.id_brand, brandMap, it.nama_brand),
            tipe_barang: it.tipe_barang,
            satuan: it.satuan,
            qty_po: it.qty_beli,
            harga: it.harga,
            ppn: it.ppn,
            is_ppn: it.is_ppn,
            total: it.total,
            is_substitute: false,
          },
        ],
      });
    });

  return groups;
};

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

type ApprovalRole = 'kabag' | 'finance';

type POApprovalDetailModalProps = {
  idPo: number;
  role: ApprovalRole;
  onClose: () => void;
  onDecided: () => void;
};

const ROLE_ENDPOINT: Record<ApprovalRole, { approve: string; reject: string }> =
  {
    kabag: { approve: 'approveKabag', reject: 'rejectKabag' },
    finance: { approve: 'approveFinance', reject: 'rejectFinance' },
  };

const ROLE_LABEL: Record<ApprovalRole, string> = {
  kabag: 'Kabag',
  finance: 'Finance',
};

const POApprovalDetailModal: React.FC<POApprovalDetailModalProps> = ({
  idPo,
  role,
  onClose,
  onDecided,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [po, setPo] = useState<PurchaseOrder | null>(null);
  const [loadError, setLoadError] = useState<string>('');
  const [deciding, setDeciding] = useState<false | 'approve' | 'reject'>(false);
  const [error, setError] = useState<string>('');

  const [brandMap, setBrandMap] = useState<Map<number, string>>(new Map());
  const [groups, setGroups] = useState<DisplayGroup[]>([]);
  const [rawItems, setRawItems] = useState<RawPoItem[]>([]);
  const [rawItemsJo, setRawItemsJo] = useState<RawPoItemJo[]>([]);

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
        setPo(detail);
        const raw = detail as unknown as {
          items?: RawPoItem[];
          items_jo?: RawPoItemJo[];
        };
        setRawItems(raw.items || []);
        setRawItemsJo(raw.items_jo || []);
      } catch (err) {
        console.error('Error fetching PO detail:', err);
        setLoadError('Gagal memuat detail PO. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
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

  useEffect(() => {
    if (rawItems.length === 0 && rawItemsJo.length === 0) return;
    setGroups(buildRowGroups(rawItems, rawItemsJo, brandMap));
  }, [rawItems, rawItemsJo, brandMap]);

  const runAction = async (action: 'approve' | 'reject') => {
    const label = action === 'approve' ? 'menyetujui' : 'menolak';
    if (!window.confirm(`Yakin ingin ${label} PO ini?`)) return;

    setError('');
    setDeciding(action);
    try {
      const endpoint =
        action === 'approve'
          ? ROLE_ENDPOINT[role].approve
          : ROLE_ENDPOINT[role].reject;
      const url = `${
        import.meta.env.VITE_API_LINK
      }/purchasing/purchaseOrder/${endpoint}/${idPo}`;
      await axios.put(url, undefined, { withCredentials: true });
      onDecided();
    } catch (err) {
      console.error(`Error on ${action} PO:`, err);
      setError(
        action === 'approve'
          ? 'Gagal menyetujui PO. Silakan coba lagi.'
          : 'Gagal menolak PO. Silakan coba lagi.',
      );
    } finally {
      setDeciding(false);
    }
  };
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
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              Detail Purchase Order
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
              {po ? po.no_purchase_order : 'Memuat...'} · Approval{' '}
              {ROLE_LABEL[role]}
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
        ) : loadError || !po ? (
          <div className="px-6 py-14 text-center">
            <p className="text-red-600 text-sm font-medium">
              {loadError || 'PO tidak ditemukan.'}
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* PO meta */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-slate-400 mb-1">Vendor</div>
                <div className="text-sm font-medium text-slate-800">
                  {po.nama_vendor || '-'}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1">Tanggal PO</div>
                <div className="text-sm text-slate-700">
                  {formatDate(po.tgl_po)}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1">Tanggal Kirim</div>
                <div className="text-sm text-slate-700">
                  {formatDate(po.tgl_kirim)}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1">Dibuat</div>
                <div className="text-sm text-slate-700">
                  {formatDate(po.createdAt)}
                </div>
              </div>
            </div>

            {/* Items — grouped by JO need, with substitute allocations shown together */}
            <div className="space-y-3">
              {groups.length === 0 ? (
                <div className="border border-slate-100 rounded-xl px-4 py-10 text-center text-slate-400 text-sm">
                  Tidak ada item.
                </div>
              ) : (
                groups.map((group) => {
                  const qtyAllocated = group.allocations.reduce(
                    (sum, a) => sum + a.qty_po,
                    0,
                  );
                  const remaining = group.jo
                    ? group.jo.qty_bom - qtyAllocated
                    : 0;
                  return (
                    <div
                      key={group.key}
                      className="border border-slate-100 rounded-xl overflow-hidden"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 px-4 py-2.5 border-b border-slate-100">
                        {group.jo ? (
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                            <span className="font-semibold text-indigo-700">
                              {group.jo.no_jo}
                            </span>
                            <span>
                              Butuh:{' '}
                              <b className="text-slate-800">
                                {group.jo.qty_bom}{' '}
                                {group.allocations[0]?.satuan || ''}
                              </b>
                            </span>
                            <span>
                              Kirim: {formatDateShort(group.jo.tgl_kirim)}
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
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead className="bg-white border-b border-slate-100">
                            <tr>
                              <th className="px-3 py-2 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                                Nama Barang
                              </th>
                              <th className="px-3 py-2 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                                Brand
                              </th>
                              <th className="px-3 py-2 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                                Tipe
                              </th>
                              <th className="px-3 py-2 text-right text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                                Qty Beli
                              </th>
                              <th className="px-3 py-2 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                                Satuan
                              </th>
                              <th className="px-3 py-2 text-right text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                                Harga
                              </th>
                              <th className="px-3 py-2 text-right text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                                PPN
                              </th>
                              <th className="px-3 py-2 text-right text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                                Total
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {group.allocations.map((a) => (
                              <tr key={a.key} className="hover:bg-slate-50/60">
                                <td className="px-3 py-2.5 text-slate-800 font-medium">
                                  <div className="flex items-center gap-1.5">
                                    {a.nama_item}
                                    {a.is_substitute && (
                                      <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 font-medium">
                                        Pengganti
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-3 py-2.5 text-slate-600">
                                  {a.nama_brand || '-'}
                                </td>
                                <td className="px-3 py-2.5 text-slate-600">
                                  {a.tipe_barang || '-'}
                                </td>
                                <td className="px-3 py-2.5 text-right tabular-nums text-slate-700">
                                  {a.qty_po}
                                </td>
                                <td className="px-3 py-2.5 text-slate-500">
                                  {a.satuan || '-'}
                                </td>
                                <td className="px-3 py-2.5 text-right tabular-nums text-slate-700">
                                  {formatRupiah(a.harga)}
                                </td>
                                <td className="px-3 py-2.5 text-right tabular-nums text-slate-500">
                                  {a.is_ppn ? formatRupiah(a.ppn) : '-'}
                                </td>
                                <td className="px-3 py-2.5 text-right tabular-nums text-slate-800 font-medium">
                                  {formatRupiah(a.total)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Notes + summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <div className="text-xs font-medium text-slate-500 mb-1.5">
                    Catatan Ke Supplier
                  </div>
                  <p className="text-sm text-slate-700 bg-slate-50 rounded-lg px-3 py-2.5 min-h-[2.5rem]">
                    {po.note_supplier || '-'}
                  </p>
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500 mb-1.5">
                    Catatan Internal
                  </div>
                  <p className="text-sm text-slate-700 bg-slate-50 rounded-lg px-3 py-2.5 whitespace-pre-line font-mono text-xs min-h-[2.5rem]">
                    {po.note_internal || '-'}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 h-fit space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="text-slate-800 font-medium tabular-nums">
                    Rp {formatRupiah(po.sub_total)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Discount</span>
                  <span className="text-slate-800 font-medium tabular-nums">
                    Rp {formatRupiah(po.discount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">PPN</span>
                  <span className="text-slate-800 font-medium tabular-nums">
                    Rp {formatRupiah(po.ppn)}
                  </span>
                </div>
                <div className="border-t border-slate-200 pt-2.5 flex justify-between">
                  <span className="text-slate-700 font-semibold">Total</span>
                  <span className="text-indigo-700 font-semibold tabular-nums">
                    Rp {formatRupiah(po.total)}
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
        {!loading && !loadError && po && (
          <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-2 rounded-b-2xl">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Kembali
            </button>
            <button
              onClick={() => runAction('reject')}
              disabled={!!deciding}
              className="px-4 py-2 text-sm bg-red-50 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed text-red-700 rounded-lg font-medium transition-colors"
            >
              {deciding === 'reject' ? 'Menolak...' : 'Tolak'}
            </button>
            <button
              onClick={() => runAction('approve')}
              disabled={!!deciding}
              className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {deciding === 'approve' ? 'Menyetujui...' : 'Setujui'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default POApprovalDetailModal;
