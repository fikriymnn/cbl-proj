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
/* =============================================================================
 * OutstandingPO — every PO with status 'approve finance' (that's the only
 * list-level filter; there's no separate status_tiket scoping here). Each
 * row expands INLINE to show its items_jo instead of opening a modal.
 *
 * Checkboxes on items_jo rows have NO restriction (any row, any
 * status_qc/status_po, can be checked) — the only thing that matters is
 * what the person decides to send to QC. Selection is tracked globally
 * (not per-PO), so items from several different POs can be checked at
 * once and sent to /qc/incomingRawMaterial in a single submission, since
 * each item in that payload already carries its own id_purchase_order.
 *
 * status_qc on items_jo: null | "request qc" | "approve qc" | "reject qc"
 * status_po on items_jo: "progress" | "done"
 * ========================================================================== */

const EMPTY_TEXT = 'Tidak ada PO dengan status approve finance.';

interface RawMasterBarangRef {
  is_include_tax?: boolean;
  pajak?: number;
  kode_barang?: string;
}
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

interface SelectedRow {
  id: number; // items_jo id
  id_purchase_order: number;
  no_purchase_order: string;
  no_jo: string;
  nama_item: string;
  satuan: string;
  qty_po: number;
  qty_sisa: number;
}

interface IncomingFormRow {
  id_purchase_order: number;
  no_purchase_order: string;
  id_purchase_order_item_jo: number;
  no_jo: string;
  nama_item: string;
  satuan: string;
  qty_sisa: number;
  no_surat_jalan: string;
  qty_incoming: number;
  ada_idle: boolean;
  qty_idle: number;
  qty_pallet: number;
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
// Incoming submission popup — the ONLY modal in this page. Rows can span
// multiple POs; each keeps its own id_purchase_order for the payload.
// =============================================================================
const IncomingFormModal: React.FC<{
  rows: IncomingFormRow[];
  onClose: () => void;
  onSubmitted: (submittedIds: number[]) => void;
}> = ({ rows: initialRows, onClose, onSubmitted }) => {
  const [rows, setRows] = useState<IncomingFormRow[]>(initialRows);
  const [bulkSuratJalan, setBulkSuratJalan] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const patchRow = (idx: number, patch: Partial<IncomingFormRow>) => {
    setRows((prev) =>
      prev.map((r, i) => {
        if (i !== idx) return r;
        const updated = { ...r, ...patch };
        if (!updated.ada_idle) updated.qty_idle = 0;
        return updated;
      }),
    );
  };

  const applyBulkSuratJalan = () => {
    if (!bulkSuratJalan.trim()) return;
    setRows((prev) =>
      prev.map((r) => ({ ...r, no_surat_jalan: bulkSuratJalan })),
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
    () => new Set(rows.map((r) => r.id_purchase_order)).size,
    [rows],
  );

  const validate = (): string => {
    for (const r of rows) {
      if (!r.no_surat_jalan.trim())
        return `No Surat Jalan untuk "${r.nama_item}" wajib diisi.`;
      if (r.qty_incoming <= 0)
        return `Jumlah datang untuk "${r.nama_item}" harus lebih dari 0.`;
      if (r.ada_idle && r.qty_idle < 0)
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
          items: rows.map((r) => ({
            id_purchase_order: r.id_purchase_order,
            id_purchase_order_item_jo: r.id_purchase_order_item_jo,
            no_surat_jalan: r.no_surat_jalan,
            qty_incoming: r.qty_incoming,
            qty_idle: r.ada_idle ? r.qty_idle : 0,
            qty_pallet: r.qty_pallet,
          })),
        },
        { withCredentials: true },
      );
      onSubmitted(rows.map((r) => r.id_purchase_order_item_jo));
    } catch (err) {
      console.error('Error submitting incoming raw material:', err);
      setError('Gagal mengirim data incoming. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

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
        <div className="flex flex-wrap items-end gap-2 mb-4 mt-1 bg-teal-50 border border-teal-100 rounded-lg px-3 py-2.5">
          <div className="flex-1 min-w-[220px]">
            <label className="block text-[11px] font-medium text-teal-700 mb-1">
              Samakan No Surat Jalan untuk semua item
            </label>
            <input
              type="text"
              value={bulkSuratJalan}
              onChange={(e) => setBulkSuratJalan(e.target.value)}
              placeholder="Ketik no surat jalan..."
              className="w-full px-3 py-1.5 text-sm border border-teal-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <button
            onClick={applyBulkSuratJalan}
            className="shrink-0 bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          >
            Terapkan ke semua
          </button>
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
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                  No Surat Jalan
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
              {rows.map((r, idx) => (
                <tr key={r.id_purchase_order_item_jo}>
                  <td className="px-3 py-2.5 align-top text-xs font-semibold text-slate-500">
                    {r.no_purchase_order}
                  </td>
                  <td className="px-3 py-2.5 align-top">
                    <div className="text-xs font-semibold text-teal-700">
                      {r.no_jo}
                    </div>
                    <div className="text-sm text-slate-700">{r.nama_item}</div>
                    <div className="text-[11px] text-slate-400">
                      Sisa kebutuhan: {formatQty(r.qty_sisa)} {r.satuan}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 align-top">
                    <input
                      type="text"
                      value={r.no_surat_jalan}
                      onChange={(e) =>
                        patchRow(idx, { no_surat_jalan: e.target.value })
                      }
                      className="w-40 px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
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
                  </td>
                  <td className="px-3 py-2.5 align-top">
                    <select
                      value={r.ada_idle ? 'ya' : 'tidak'}
                      onChange={(e) =>
                        patchRow(idx, { ada_idle: e.target.value === 'ya' })
                      }
                      className="w-24 px-2 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="tidak">Tidak</option>
                      <option value="ya">Ya</option>
                    </select>
                  </td>
                  <td className="px-3 py-2.5 align-top text-center">
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
              ))}
            </tbody>
            <tfoot className="bg-slate-50 border-t border-slate-200">
              <tr>
                <td
                  colSpan={3}
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
            disabled={submitting}
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
// Main list page
// =============================================================================
const OutstandingPO: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<PurchaseOrder[]>([]);

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
      { loading: boolean; error: string; items: OutstandingItemJo[] }
    >
  >({});

  // Cross-PO selection, keyed by items_jo id.
  const [selected, setSelected] = useState<Map<number, SelectedRow>>(new Map());
  const [showForm, setShowForm] = useState<boolean>(false);

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
        },
        withCredentials: true,
      });
      setData(res.data.data || []);
      if (res.data.total_page) setTotalPages(res.data.total_page);
    } catch (error) {
      console.error('Error fetching outstanding PO data:', error);
      setData([]);
      setToast({
        open: true,
        message: 'Gagal memuat data PO outstanding.',
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

  const fetchPoItems = async (po: PurchaseOrder) => {
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
      const raw = res.data.data as unknown as {
        items_jo?: OutstandingItemJo[];
      };
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

  const toggleExpand = (po: PurchaseOrder) => {
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

  const toggleItemSelected = (po: PurchaseOrder, it: OutstandingItemJo) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(it.id)) {
        next.delete(it.id);
      } else {
        next.set(it.id, {
          id: it.id,
          id_purchase_order: po.id,
          no_purchase_order: po.no_purchase_order,
          no_jo: it.no_jo,
          nama_item: it.nama_item,
          satuan: it.satuan,
          qty_po: it.qty_po,
          qty_sisa: it.qty_sisa,
        });
      }
      return next;
    });
  };

  const toggleSelectAllForPo = (
    po: PurchaseOrder,
    items: OutstandingItemJo[],
  ) => {
    const allSelected = items.every((it) => selected.has(it.id));
    setSelected((prev) => {
      const next = new Map(prev);
      if (allSelected) {
        items.forEach((it) => next.delete(it.id));
      } else {
        items.forEach((it) =>
          next.set(it.id, {
            id: it.id,
            id_purchase_order: po.id,
            no_purchase_order: po.no_purchase_order,
            no_jo: it.no_jo,
            nama_item: it.nama_item,
            satuan: it.satuan,
            qty_po: it.qty_po,
            qty_sisa: it.qty_sisa,
          }),
        );
      }
      return next;
    });
  };

  const selectedPoCount = useMemo(
    () =>
      new Set(Array.from(selected.values()).map((r) => r.id_purchase_order))
        .size,
    [selected],
  );

  const formRows: IncomingFormRow[] = useMemo(
    () =>
      Array.from(selected.values()).map((r) => ({
        id_purchase_order: r.id_purchase_order,
        no_purchase_order: r.no_purchase_order,
        id_purchase_order_item_jo: r.id,
        no_jo: r.no_jo,
        nama_item: r.nama_item,
        satuan: r.satuan,
        qty_sisa: r.qty_sisa,
        no_surat_jalan: '',
        qty_incoming: r.qty_sisa > 0 ? r.qty_sisa : r.qty_po,
        ada_idle: false,
        qty_idle: 0,
        qty_pallet: 0,
      })),
    [selected],
  );

  const handleSubmitted = (submittedItemJoIds: number[]) => {
    setShowForm(false);
    setSelected((prev) => {
      const next = new Map(prev);
      submittedItemJoIds.forEach((id) => next.delete(id));
      return next;
    });
    // Invalidate caches for affected POs so re-expanding pulls fresh qty_sisa.
    setDetailCache((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        const poId = Number(key);
        if (next[poId].items.some((it) => submittedItemJoIds.includes(it.id))) {
          delete next[poId];
        }
      });
      return next;
    });
    setToast({
      open: true,
      message: 'Data incoming berhasil dikirim ke QC.',
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
                                        <th className="px-3 py-2.5 w-10">
                                          <input
                                            type="checkbox"
                                            checked={cache.items.every((it) =>
                                              selected.has(it.id),
                                            )}
                                            onChange={() =>
                                              toggleSelectAllForPo(
                                                po,
                                                cache.items,
                                              )
                                            }
                                            className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                          />
                                        </th>
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
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {cache.items.map((it) => (
                                        <tr
                                          key={it.id}
                                          className="hover:bg-slate-50/70"
                                        >
                                          <td className="px-3 py-2.5">
                                            <input
                                              type="checkbox"
                                              checked={selected.has(it.id)}
                                              onChange={() =>
                                                toggleItemSelected(po, it)
                                              }
                                              className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                            />
                                          </td>
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
                                              {it.status_po === 'done'
                                                ? 'Selesai'
                                                : 'Progress'}
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

      {/* Floating selection bar — appears once anything is checked, across any PO */}
      {selected.size > 0 && (
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

      {showForm && (
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
