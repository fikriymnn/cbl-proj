import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Loading from '../../Loading';
import Select from 'react-select';

// ─── Constants ────────────────────────────────────────────────────────────────

const SORT_BY_OPTIONS = [
  { value: 'input so', label: 'Input SO' },
  { value: 'kirim so', label: 'Kirim SO' },
  { value: 'do', label: 'DO' },
];

const STATUS_PO_OPTIONS = [
  { value: 'semua', label: 'Semua' },
  { value: 'close', label: 'Close' },
  { value: 'cancel', label: 'Cancel' },
  { value: 'belum kirim', label: 'Belum Kirim' },
  { value: 'selesai', label: 'Selesai' },
  { value: 'kurang qty', label: 'Kurang Qty' },
  { value: 'over qty', label: 'Over Qty' },
];

const customSelectStyles = {
  control: (base: any) => ({
    ...base,
    minHeight: '38px',
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    '&:hover': { borderColor: '#60a5fa' },
  }),
  menu: (base: any) => ({ ...base, zIndex: 9999 }),
  menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
};

type SortKey =
  | 'no_jo'
  | 'no_so'
  | 'customer'
  | 'produk'
  | 'po_qty'
  | 'tgl_pengiriman'
  | 'status_kirim';
type SortDirection = 'asc' | 'desc' | null;
interface SortConfig {
  key: SortKey | null;
  direction: SortDirection;
}

function SortIcon({
  column,
  sortConfig,
}: {
  column: SortKey;
  sortConfig: SortConfig;
}) {
  const isActive = sortConfig.key === column;
  const isAsc = isActive && sortConfig.direction === 'asc';
  const isDesc = isActive && sortConfig.direction === 'desc';
  return (
    <span className="inline-flex flex-col ml-1.5 gap-[1px] align-middle">
      <svg
        width="8"
        height="5"
        viewBox="0 0 8 5"
        fill="none"
        className={`transition-opacity duration-150 ${
          isAsc ? 'opacity-100' : 'opacity-35'
        }`}
      >
        <path d="M4 0L7.46 4.5H0.54L4 0Z" fill="currentColor" />
      </svg>
      <svg
        width="8"
        height="5"
        viewBox="0 0 8 5"
        fill="none"
        className={`transition-opacity duration-150 ${
          isDesc ? 'opacity-100' : 'opacity-35'
        }`}
      >
        <path d="M4 5L0.54 0.5H7.46L4 5Z" fill="currentColor" />
      </svg>
    </span>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(d.getDate()).padStart(2, '0')}`;
}
function firstOfMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}
function fmtDate(iso: string | null | undefined) {
  if (!iso) return '-';
  return iso.split('T')[0];
}
function fmtDateTime(iso: string | null | undefined) {
  if (!iso) return '-';
  const d = new Date(iso);
  return (
    d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }) +
    ' ' +
    d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  );
}
function fmtQty(val: number | null | undefined) {
  if (val == null) return '-';
  return val.toLocaleString('id-ID');
}
function fmtRp(val: number | null | undefined) {
  if (val == null) return '-';
  return 'Rp ' + val.toLocaleString('id-ID');
}

// ── sums total_qty across the delivery_order_group array ──
function sumDeliveryQty(row: any): number {
  const doGroup: any[] = Array.isArray(row.delivery_order_group)
    ? row.delivery_order_group
    : [];
  return doGroup.reduce((sum: number, d: any) => sum + (d.total_qty ?? 0), 0);
}

// ── realisasi harga = qty terkirim (from delivery_order_group) × harga/pcs ──
function calcRealisasiHarga(row: any): number {
  const qty = sumDeliveryQty(row);
  const hargaPcs = row.harga_jual ?? 0;
  return qty * hargaPcs;
}

// ── counts unique job_order.status_jo across a dataset ──
function getStatusJoSummary(data: any[]): { status: string; count: number }[] {
  const counts = new Map<string, number>();
  data.forEach((d: any) => {
    const status = d.job_order?.status_jo;
    if (status) counts.set(status, (counts.get(status) ?? 0) + 1);
  });
  return Array.from(counts.entries()).map(([status, count]) => ({
    status,
    count,
  }));
}

function sisaWaktu(tglPengiriman: string | null | undefined): {
  label: string;
  color: string;
} {
  if (!tglPengiriman) return { label: '-', color: 'text-gray-400' };
  const diff = Math.ceil(
    (new Date(tglPengiriman).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  if (diff < 0)
    return {
      label: `${Math.abs(diff)} hari lalu`,
      color: 'text-red-500 font-semibold',
    };
  if (diff === 0)
    return { label: 'Hari ini', color: 'text-orange-500 font-semibold' };
  if (diff <= 3)
    return {
      label: `${diff} hari lagi`,
      color: 'text-orange-400 font-semibold',
    };
  if (diff <= 7)
    return { label: `${diff} hari lagi`, color: 'text-yellow-500' };
  return { label: `${diff} hari lagi`, color: 'text-gray-500' };
}

// ── uses row.total_qty (pre-summed by API) as shipped qty ──
function calcDeliveryProgress(row: any) {
  const shipped = row.total_qty ?? 0;
  const total = row.po_qty ?? 0;
  if (total === 0) return null;
  const rawPct = Math.round((shipped / total) * 100);
  const pct = Math.min(rawPct, 100);
  const isOver = shipped > total;
  const isDone = shipped === total;
  const isUnder = shipped > 0 && shipped < total;
  const status: string = isOver
    ? 'over qty'
    : isDone
    ? 'selesai'
    : isUnder
    ? 'kurang qty'
    : 'belum kirim';
  return { shipped, total, pct, rawPct, status, isOver };
}

// ── whether a tahapan has been "touched" at all (used for done/checkmark
//    state, progress %, and "latest tahapan" detection). This is checked
//    from produksi_lkh_proses_last, NOT produksi_lkh_proses — a tahapan can
//    have a "last process" record (e.g. a closing/JO-selesai entry) even when
//    produksi_lkh_proses (the live/detail process list) is empty. ──
function tahapanHasProcess(t: any): boolean {
  return (t?.produksi_lkh_proses_last?.length ?? 0) > 0;
}

function calcTahapanProgress(tahapan: any[]) {
  if (!tahapan || tahapan.length === 0) return null;
  const done = tahapan.filter((t) => tahapanHasProcess(t)).length;
  const pct = Math.round((done / tahapan.length) * 100);
  return { done, total: tahapan.length, pct };
}

function getLatestTahapan(tahapan: any[]): string | null {
  if (!tahapan || tahapan.length === 0) return null;
  const done = [...tahapan]
    .filter((t) => tahapanHasProcess(t))
    .sort((a, b) => b.index - a.index);
  if (done.length === 0) return null;
  return done[0].tahapan?.nama_tahapan ?? null;
}

function countWithDetail(tahapan: any[]) {
  if (!tahapan) return 0;
  return tahapan.filter((t) => tahapanHasProcess(t)).length;
}

// ── baik = latest tahapan (highest index) whose produksi_lkh_proses has qty baik > 0;
//     if that tahapan's baik is 0, walk backward to earlier tahapan until non-zero is found.
//     rs / rt remain summed across ALL tahapan (unchanged).
//     NOTE: qty (baik/rs/rt) always comes from produksi_lkh_proses — never from
//     produksi_lkh_proses_last, which is only used to detect "is this tahapan
//     touched" (see tahapanHasProcess above). ──
function sumProduksiQty(tahapan: any[]): {
  baik: number;
  rs: number;
  rt: number;
} {
  let rs = 0;
  let rt = 0;
  (tahapan ?? []).forEach((t: any) => {
    (t.produksi_lkh_proses ?? []).forEach((p: any) => {
      rs += p.rusak_sebagian ?? 0;
      rt += p.rusak_total ?? 0;
    });
  });

  const sortedDesc = [...(tahapan ?? [])].sort((a, b) => b.index - a.index);
  let baik = 0;
  for (const t of sortedDesc) {
    const tBaik = (t.produksi_lkh_proses ?? []).reduce(
      (sum: number, p: any) => sum + (p.baik ?? 0),
      0,
    );
    if (tBaik > 0) {
      baik = tBaik;
      break;
    }
  }

  return { baik, rs, rt };
}

// ── same as above, but broken down per tahapan (used in the JO detail modal).
//    Still driven by produksi_lkh_proses since this is qty data, not the
//    "has this tahapan been touched" check. ──
function getProduksiQtyByTahapan(tahapan: any[]) {
  return (tahapan ?? [])
    .map((t: any) => {
      const sums = (t.produksi_lkh_proses ?? []).reduce(
        (acc: any, p: any) => {
          acc.baik += p.baik ?? 0;
          acc.rs += p.rusak_sebagian ?? 0;
          acc.rt += p.rusak_total ?? 0;
          return acc;
        },
        { baik: 0, rs: 0, rt: 0 },
      );
      return {
        index: t.index,
        nama: t.tahapan?.nama_tahapan ?? '-',
        hasData: (t.produksi_lkh_proses ?? []).length > 0,
        ...sums,
      };
    })
    .filter((t: any) => t.hasData)
    .sort((a: any, b: any) => a.index - b.index);
}

// ── sums qty tambah bahan from job_order.tambah_bahan_persiapan
//     (field qty_pakai_tambah_bahan_druk) and job_order.tambah_bahan_pemakaian
//     (field qty_tambah_bahan_druk) ──
function sumTambahBahan(jo: any): {
  persiapan: number;
  pemakaian: number;
  total: number;
} {
  const persiapanList: any[] = Array.isArray(jo?.tambah_bahan_persiapan)
    ? jo.tambah_bahan_persiapan
    : [];
  const pemakaianList: any[] = Array.isArray(jo?.tambah_bahan_pemakaian)
    ? jo.tambah_bahan_pemakaian
    : [];
  const persiapan = persiapanList.reduce(
    (sum: number, t: any) => sum + (t.qty_pakai_tambah_bahan_druk ?? 0),
    0,
  );
  const pemakaian = pemakaianList.reduce(
    (sum: number, t: any) => sum + (t.qty_tambah_bahan_druk ?? 0),
    0,
  );
  return { persiapan, pemakaian, total: persiapan + pemakaian };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    done: 'bg-green-100 text-green-700 border-green-200',
    progress: 'bg-blue-100 text-blue-700 border-blue-200',
    selesai: 'bg-green-100 text-green-700 border-green-200',
    cancel: 'bg-red-100 text-red-700 border-red-200',
    'belum kirim': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'kurang qty': 'bg-orange-100 text-orange-700 border-orange-200',
    'over qty': 'bg-purple-100 text-purple-700 border-purple-200',
    close: 'bg-gray-100 text-gray-700 border-gray-200',
    repeat: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    history: 'bg-slate-100 text-slate-700 border-slate-200',
    'approve gudang': 'bg-teal-100 text-teal-700 border-teal-200',
  };
  const cls = map[s] ?? 'bg-blue-100 text-blue-700 border-blue-200';
  return (
    <span
      className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full border ${cls}`}
    >
      {status || '-'}
    </span>
  );
}

// ── clickable recap chips: click a status to filter the table by it, click again to clear ──
function StatusJoSummary({
  data,
  selected,
  onSelect,
}: {
  data: any[];
  selected: string | null;
  onSelect: (status: string) => void;
}) {
  const summary = useMemo(() => getStatusJoSummary(data), [data]);
  if (summary.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {summary.map(({ status, count }) => {
        const isActive = selected === status;
        return (
          <button
            key={status}
            type="button"
            onClick={() => onSelect(status)}
            title={
              isActive
                ? 'Klik untuk hapus filter'
                : `Filter status JO: ${status}`
            }
            className={`text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize whitespace-nowrap transition-colors cursor-pointer ${
              isActive
                ? 'bg-white text-violet-700 ring-2 ring-white'
                : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
            }`}
          >
            {status} {count}
          </button>
        );
      })}
    </div>
  );
}

function DeliveryProgressBar({
  pct,
  isOver,
}: {
  pct: number;
  isOver?: boolean;
}) {
  const color = isOver
    ? 'bg-purple-500'
    : pct === 100
    ? 'bg-green-500'
    : pct >= 50
    ? 'bg-blue-500'
    : pct > 0
    ? 'bg-yellow-400'
    : 'bg-gray-200';
  return (
    <div className="flex items-center gap-1.5 min-w-[90px]">
      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
        <div
          className={`${color} h-1.5 rounded-full transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span
        className={`text-[10px] font-bold whitespace-nowrap ${
          isOver ? 'text-purple-600' : 'text-gray-600'
        }`}
      >
        {isOver ? '>100%' : `${pct}%`}
      </span>
    </div>
  );
}

function QtyDiffLabel({ shipped, total }: { shipped: number; total: number }) {
  const diff = shipped - total;
  if (diff > 0) {
    return (
      <span className="text-xs font-bold text-purple-600">
        +{fmtQty(diff)} over
      </span>
    );
  }
  if (diff === 0) {
    return <span className="text-xs font-bold text-green-600">Sesuai</span>;
  }
  return (
    <span className="text-xs font-bold text-red-500">
      -{fmtQty(Math.abs(diff))} kurang
    </span>
  );
}

// ── compact Baik / RS / RT badges used in the table ──
function ProduksiQtyBadges({
  baik,
  rs,
  rt,
}: {
  baik: number;
  rs: number;
  rt: number;
}) {
  if (baik === 0 && rs === 0 && rt === 0) {
    return <span className="text-gray-400 text-[10px] italic">Belum ada</span>;
  }
  return (
    <div className="flex flex-col gap-1 ">
      <span
        className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-green-100 text-green-700"
        title="Qty Baik"
      >
        B: {fmtQty(baik)}
      </span>
      <span
        className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-orange-100 text-orange-700"
        title="Rusak Sebagian"
      >
        RS: {fmtQty(rs)}
      </span>
      <span
        className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-700"
        title="Rusak Total"
      >
        RT: {fmtQty(rt)}
      </span>
    </div>
  );
}

// ─── Tahapan Detail Modal ─────────────────────────────────────────────────────

function TahapanDetailModal({
  row,
  onClose,
}: {
  row: any;
  onClose: () => void;
}) {
  const tahapan: any[] = [...(row.produksi_lkh_tahapan ?? [])].sort(
    (a, b) => a.index - b.index,
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-4 text-white rounded-t-2xl flex justify-between items-start flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2"
                />
              </svg>
              Detail Tahapan Produksi
            </h3>
            <p className="text-violet-200 text-sm mt-0.5">
              {row.no_so} — {row.job_order?.no_jo}
            </p>
            <p className="text-violet-200 text-xs mt-0.5 truncate max-w-md">
              {row.produk}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-violet-200 text-2xl font-bold leading-none ml-4"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto p-5 space-y-3">
          {tahapan.length === 0 ? (
            <p className="text-center text-gray-400 py-10">
              Tidak ada data tahapan
            </p>
          ) : (
            tahapan.map((t) => {
              // proses = the actual detail rows (mesin/operator/waktu/qty) —
              // still sourced from produksi_lkh_proses.
              const proses: any[] = t.produksi_lkh_proses ?? [];
              const hasDetail = proses.length > 0;
              // hasProcess = "has this tahapan been touched at all" — sourced
              // from produksi_lkh_proses_last, drives the done/checkmark
              // visual state independently of whether detail rows exist.
              const hasProcess = tahapanHasProcess(t);

              return (
                <div
                  key={t.id}
                  className={`rounded-xl border-2 overflow-hidden ${
                    hasProcess
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0 ${
                          hasProcess
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-300 text-gray-600'
                        }`}
                      >
                        {t.index}
                      </span>
                      <div>
                        <p
                          className={`text-sm font-semibold ${
                            hasProcess ? 'text-green-800' : 'text-gray-600'
                          }`}
                        >
                          {t.tahapan?.nama_tahapan ?? '-'}
                        </p>
                        {!hasProcess && (
                          <p className="text-[10px] text-gray-400 italic">
                            Belum ada data proses
                          </p>
                        )}
                        {hasProcess && !hasDetail && (
                          <p className="text-[10px] text-green-600 italic">
                            Selesai — tanpa rincian proses
                          </p>
                        )}
                      </div>
                    </div>
                    {hasProcess ? (
                      <span className="text-[10px] bg-green-200 text-green-800 font-semibold px-2 py-0.5 rounded-full">
                        {hasDetail ? `${proses.length} proses ✓` : 'Selesai ✓'}
                      </span>
                    ) : (
                      <span className="text-[10px] bg-gray-200 text-gray-500 font-semibold px-2 py-0.5 rounded-full">
                        Pending
                      </span>
                    )}
                  </div>
                  {hasDetail && (
                    <div className="border-t border-green-200 px-4 py-3 space-y-2">
                      {proses.map((p: any, pi: number) => (
                        <div
                          key={p.id ?? pi}
                          className="bg-white rounded-lg border border-green-200 px-4 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs"
                        >
                          <div>
                            <p className="text-gray-400 font-medium mb-0.5">
                              Proses
                            </p>
                            <p className="text-gray-800 font-semibold">
                              {p.proses || p.deskripsi || '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400 font-medium mb-0.5">
                              Mesin
                            </p>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                p.mesin
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-gray-100 text-gray-500'
                              }`}
                            >
                              {p.mesin ? p.mesin.nama_mesin : '-'}
                            </span>
                          </div>
                          <div>
                            <p className="text-gray-400 font-medium mb-0.5">
                              Operator
                            </p>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                p.operator
                                  ? 'bg-indigo-100 text-indigo-700'
                                  : 'bg-gray-100 text-gray-500'
                              }`}
                            >
                              {p.operator ? p.operator.nama : '-'}
                            </span>
                          </div>
                          <div>
                            <p className="text-gray-400 font-medium mb-0.5">
                              Waktu Mulai
                            </p>
                            <span className="text-[10px] text-gray-700 font-medium">
                              {fmtDateTime(p.waktu_mulai)}
                            </span>
                          </div>
                          <div>
                            <p className="text-gray-400 font-medium mb-0.5">
                              Qty Baik
                            </p>
                            <span className="text-[10px] font-bold text-green-600">
                              {fmtQty(p.baik)}
                            </span>
                          </div>
                          <div>
                            <p className="text-gray-400 font-medium mb-0.5">
                              Rusak Sebagian
                            </p>
                            <span className="text-[10px] font-bold text-orange-600">
                              {fmtQty(p.rusak_sebagian)}
                            </span>
                          </div>
                          <div>
                            <p className="text-gray-400 font-medium mb-0.5">
                              Rusak Total
                            </p>
                            <span className="text-[10px] font-bold text-red-600">
                              {fmtQty(p.rusak_total)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-between items-center flex-shrink-0">
          <span className="text-xs text-gray-500">
            {countWithDetail(tahapan)} dari {tahapan.length} tahapan sudah
            diproses
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── JO Detail Modal ──────────────────────────────────────────────────────────

function JODetailModal({ row, onClose }: { row: any; onClose: () => void }) {
  const jo = row.job_order;
  const mountings: any[] = jo?.jo_mounting ?? [];
  const dp = calcDeliveryProgress(row);
  const tahapanProg = calcTahapanProgress(row.produksi_lkh_tahapan);
  const do_group: any[] = Array.isArray(row.delivery_order_group)
    ? row.delivery_order_group
    : [];

  const produksiQtyTotal = sumProduksiQty(row.produksi_lkh_tahapan);
  const produksiQtyDetail = getProduksiQtyByTahapan(row.produksi_lkh_tahapan);
  const tambahBahan = sumTambahBahan(jo);
  const tambahBahanPersiapan: any[] = Array.isArray(jo?.tambah_bahan_persiapan)
    ? jo.tambah_bahan_persiapan
    : [];
  const tambahBahanPemakaian: any[] = Array.isArray(jo?.tambah_bahan_pemakaian)
    ? jo.tambah_bahan_pemakaian
    : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-6 py-4 text-white rounded-t-2xl flex justify-between items-start flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold">Detail JO</h3>
            <p className="text-blue-200 text-sm mt-0.5">
              {jo?.no_jo ?? '-'} — {row.no_so}
            </p>
            <p className="text-blue-200 text-xs mt-0.5 truncate max-w-md">
              {row.produk}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-200 text-2xl font-bold leading-none ml-4"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto p-5 space-y-4">
          {/* SO / JO Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Informasi SO & JO
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              {(
                [
                  ['No SO', row.no_so],
                  ['No JO', jo?.no_jo],
                  ['No IO', row.no_io],
                  ['No PO Customer', row.no_po_customer],
                  ['Customer', row.customer],
                  ['Marketing', row.kalkulasi?.nama_marketing],
                  ['PPIC', row.ppic],
                  ['Tgl Input SO', fmtDate(row.tgl_pembuatan_so)],
                  ['Tgl Kirim', fmtDate(row.tgl_pengiriman)],
                  ['PO Qty', fmtQty(row.po_qty)],
                  ['Qty Druk', fmtQty(jo?.qty_druk)],
                  ['Qty LP', fmtQty(jo?.qty_lp)],

                  ['Label', row.label],
                  ['Status JO', row.status_jo],
                  ['Status Proses', row.status_proses],
                  ['Status Work', row.status_work],
                ] as [string, any][]
              ).map(([label, val]) => (
                <div key={label}>
                  <p className="text-gray-400 font-medium mb-0.5">{label}:</p>
                  <p className="text-gray-800 font-semibold">{val ?? '-'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Progress section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {dp && (
              <div className="bg-blue-50 rounded-xl p-4">
                <h4 className="text-xs font-semibold text-blue-700 mb-2">
                  Progress Pengiriman
                </h4>
                <DeliveryProgressBar pct={dp.pct} isOver={dp.isOver} />
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-gray-400">Terkirim</p>
                    <p className="font-bold text-green-600">
                      {fmtQty(dp.shipped)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">PO Qty</p>
                    <p className="font-bold text-gray-700">
                      {fmtQty(dp.total)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Status</p>
                    <StatusBadge status={dp.status} />
                  </div>
                </div>
                <div className="mt-2">
                  <QtyDiffLabel shipped={dp.shipped} total={dp.total} />
                </div>
                {dp.isOver && (
                  <div className="mt-2 text-xs text-purple-600 font-semibold bg-purple-50 rounded px-2 py-1">
                    Over qty: {fmtQty(dp.shipped - dp.total)} Pcs
                  </div>
                )}
                {!dp.isOver && dp.shipped < dp.total && (
                  <div className="mt-2 text-xs text-orange-600 bg-orange-50 rounded px-2 py-1">
                    Kurang: {fmtQty(dp.total - dp.shipped)} Pcs
                  </div>
                )}
              </div>
            )}

            {tahapanProg && (
              <div className="bg-violet-50 rounded-xl p-4">
                <h4 className="text-xs font-semibold text-violet-700 mb-2">
                  Progress Produksi
                </h4>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-violet-500 h-2 rounded-full"
                      style={{ width: `${tahapanProg.pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-violet-700">
                    {tahapanProg.pct}%
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {tahapanProg.done} dari {tahapanProg.total} tahapan selesai
                </p>
              </div>
            )}
          </div>

          {/* ── Rekap Qty Produksi (Baik / Rusak Sebagian / Rusak Total) ── */}
          {produksiQtyDetail.length > 0 && (
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
              <h4 className="text-xs font-semibold text-emerald-700 mb-3 flex items-center gap-1.5">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Rekap Qty Produksi
              </h4>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                  Baik: {fmtQty(produksiQtyTotal.baik)}
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                  Rusak Sebagian: {fmtQty(produksiQtyTotal.rs)}
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                  Rusak Total: {fmtQty(produksiQtyTotal.rt)}
                </span>
              </div>
              <div className="space-y-1.5">
                {produksiQtyDetail.map((t: any) => (
                  <div
                    key={t.index}
                    className="bg-white rounded-lg border border-emerald-200 grid grid-cols-2 sm:grid-cols-4 gap-2 px-3 py-2 text-xs"
                  >
                    <div>
                      <p className="text-gray-400 mb-0.5">Tahapan</p>
                      <p className="font-semibold text-gray-800">
                        {t.index}. {t.nama}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-0.5">Baik</p>
                      <p className="font-bold text-green-600">
                        {fmtQty(t.baik)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-0.5">Rusak Sebagian</p>
                      <p className="font-bold text-orange-600">
                        {fmtQty(t.rs)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-0.5">Rusak Total</p>
                      <p className="font-bold text-red-600">{fmtQty(t.rt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Tambah Bahan Druk ── */}
          {(tambahBahanPersiapan.length > 0 ||
            tambahBahanPemakaian.length > 0) && (
            <div className="bg-sky-50 rounded-xl p-4 border border-sky-200">
              <h4 className="text-xs font-semibold text-sky-700 mb-3 flex items-center gap-1.5">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Tambah Bahan Druk
              </h4>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-700">
                  Total: {fmtQty(tambahBahan.total)}
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                  Persiapan: {fmtQty(tambahBahan.persiapan)}
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                  Pemakaian: {fmtQty(tambahBahan.pemakaian)}
                </span>
              </div>

              {tambahBahanPersiapan.length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                    Persiapan
                  </p>
                  <div className="space-y-1.5">
                    {tambahBahanPersiapan.map((t: any) => (
                      <div
                        key={t.id}
                        className="bg-white rounded-lg border border-sky-200 grid grid-cols-3 gap-2 px-3 py-2 text-xs items-center"
                      >
                        <div>
                          <p className="text-gray-400 mb-0.5">Status</p>
                          <StatusBadge status={t.status} />
                        </div>
                        <div>
                          <p className="text-gray-400 mb-0.5">Status Tiket</p>
                          <StatusBadge status={t.status_tiket} />
                        </div>
                        <div>
                          <p className="text-gray-400 mb-0.5">Qty Pakai</p>
                          <p className="font-bold text-blue-600">
                            {fmtQty(t.qty_pakai_tambah_bahan_druk)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tambahBahanPemakaian.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                    Pemakaian
                  </p>
                  <div className="space-y-1.5">
                    {tambahBahanPemakaian.map((t: any) => (
                      <div
                        key={t.id}
                        className="bg-white rounded-lg border border-sky-200 grid grid-cols-3 gap-2 px-3 py-2 text-xs items-center"
                      >
                        <div>
                          <p className="text-gray-400 mb-0.5">Status</p>
                          <StatusBadge status={t.status} />
                        </div>
                        <div>
                          <p className="text-gray-400 mb-0.5">Status Tiket</p>
                          <StatusBadge status={t.status_tiket} />
                        </div>
                        <div>
                          <p className="text-gray-400 mb-0.5">Qty Tambah</p>
                          <p className="font-bold text-indigo-600">
                            {fmtQty(t.qty_tambah_bahan_druk)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Delivery Order (array) ── */}
          {do_group.length > 0 && (
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <h4 className="text-xs font-semibold text-green-700 mb-3 flex items-center gap-1.5">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Delivery Order ({do_group.length})
              </h4>
              <div className="space-y-2">
                {do_group.map((doItem: any, di: number) => (
                  <div
                    key={doItem.id ?? di}
                    className="bg-white rounded-lg border border-green-200 grid grid-cols-3 gap-3 px-3 py-2 text-xs"
                  >
                    <div>
                      <p className="text-gray-400 mb-0.5">No DO</p>
                      <p className="font-bold text-gray-800">{doItem.no_do}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-0.5">Tgl DO</p>
                      <p className="font-bold text-gray-800">
                        {fmtDate(doItem.tgl_do)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-0.5">Qty DO</p>
                      <p className="font-bold text-green-600">
                        {fmtQty(doItem.total_qty)}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="flex justify-end pt-1 border-t border-green-200 mt-1">
                  <span className="text-xs font-semibold text-green-700">
                    Total Terkirim: {fmtQty(row.total_qty)} Pcs
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Mounting info */}
          {mountings.length > 0 && (
            <div className="bg-indigo-50 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-indigo-700 mb-3 flex items-center gap-1.5">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
                Mounting ({mountings.length} mounting)
              </h4>
              <div className="space-y-3">
                {mountings.map((m: any, mi: number) => (
                  <div
                    key={m.id ?? mi}
                    className="bg-white rounded-lg border border-indigo-200 p-3"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Mounting{' '}
                        {m.nama_mounting ?? String.fromCharCode(65 + mi)}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {m.nama_kertas}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-[10px]">
                      {(
                        [
                          ['Kertas', `${m.panjang_kertas} × ${m.lebar_kertas}`],
                          ['Gramatur', `${m.gramature_kertas} gr`],
                          ['Jml Kertas', fmtQty(m.jumlah_kertas)],
                          ['Druk Cetak', fmtQty(m.jumlah_druk_cetak)],
                          ['Insheet Cetak', fmtQty(m.jumlah_insheet_cetak)],
                          ['Total Insheet', fmtQty(m.total_insheet)],
                          ['Druk Finishing', fmtQty(m.jumlah_druk_finishing)],
                          [
                            'Insheet Finishing',
                            fmtQty(m.jumlah_insheet_finishing),
                          ],
                          ['Druk Pond', fmtQty(m.jumlah_druk_pond)],
                          ['Insheet Pond', fmtQty(m.jumlah_insheet_pond)],
                          [
                            'Uk. Cetak P',
                            m.ukuran_cetak_panjang_1
                              ? `${m.ukuran_cetak_panjang_1} mm`
                              : '-',
                          ],
                          [
                            'Uk. Cetak L',
                            m.ukuran_cetak_lebar_1
                              ? `${m.ukuran_cetak_lebar_1} mm`
                              : '-',
                          ],
                        ] as [string, any][]
                      ).map(([label, val]) => (
                        <div key={label}>
                          <p className="text-gray-400 font-medium">{label}</p>
                          <p className="text-gray-800 font-semibold">
                            {val ?? '-'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alamat */}
          {row.alamat_pengiriman && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-gray-600 mb-1">
                Alamat Pengiriman
              </h4>
              <p className="text-xs text-gray-700 whitespace-pre-line">
                {row.alamat_pengiriman}
              </p>
            </div>
          )}

          {/* Tahapan quick list */}
          {row.produksi_lkh_tahapan?.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-gray-700 mb-2">
                Tahapan Produksi
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {[...(row.produksi_lkh_tahapan ?? [])]
                  .sort((a: any, b: any) => a.index - b.index)
                  .map((t: any) => {
                    // "done" (green + checkmark) is driven by
                    // produksi_lkh_proses_last — see tahapanHasProcess.
                    const done = tahapanHasProcess(t);
                    return (
                      <span
                        key={t.id}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                          done
                            ? 'bg-green-100 text-green-700 border-green-300'
                            : 'bg-white text-gray-400 border-gray-300'
                        }`}
                      >
                        {t.index}. {t.tahapan?.nama_tahapan} {done ? '✓' : ''}
                      </span>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function JOMonitoring() {
  const [isLoading, setIsLoading] = useState(false);
  const [joData, setJoData] = useState<any[]>([]);

  // Filters
  const [startDate, setStartDate] = useState(firstOfMonth());
  const [endDate, setEndDate] = useState(todayStr());
  const [sortBy, setSortBy] = useState<any>(SORT_BY_OPTIONS[0]);
  const [statusPo, setStatusPo] = useState<any>(STATUS_PO_OPTIONS[0]);
  const [idCustomer, setIdCustomer] = useState<any>(null);
  const [idMarketing, setIdMarketing] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [customerOptions, setCustomerOptions] = useState<any[]>([]);
  const [marketingOptions, setMarketingOptions] = useState<any[]>([]);

  // Status JO recap filter (clicking a chip beside the record count)
  const [statusJoFilter, setStatusJoFilter] = useState<string | null>(null);

  // Modals
  const [detailRow, setDetailRow] = useState<any>(null);
  const [tahapanRow, setTahapanRow] = useState<any>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: null,
  });

  useEffect(() => {
    fetchJO(
      firstOfMonth(),
      todayStr(),
      SORT_BY_OPTIONS[0].value,
      STATUS_PO_OPTIONS[0].value,
      null,
      null,
    );
    fetchMarketingList();
  }, []);

  async function fetchMarketingList() {
    const url = `${import.meta.env.VITE_API_LINK}/master/marketing`;
    try {
      const res = await axios.get(url, { withCredentials: true });
      const list: any[] = Array.isArray(res.data?.data) ? res.data.data : [];
      setMarketingOptions(
        list.map((m) => ({
          value: m.id,
          label: `${m.kode} - ${m.data_karyawan?.name || 'Unknown'}`,
        })),
      );
    } catch (err) {
      console.error(err);
    }
  }

  const handleSort = useCallback((key: SortKey) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        if (prev.direction === 'asc') return { key, direction: 'desc' };
        if (prev.direction === 'desc') return { key: null, direction: null };
      }
      return { key, direction: 'asc' };
    });
  }, []);

  // toggles the Status JO recap filter: click again on the same chip clears it
  const handleStatusJoFilter = useCallback((status: string) => {
    setStatusJoFilter((prev) => (prev === status ? null : status));
  }, []);

  async function fetchJO(
    start: string,
    end: string,
    sort: string,
    status: string,
    customerId: any,
    marketingId: any,
  ) {
    const url = `${import.meta.env.VITE_API_LINK}/marketing/soMonitoring`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        params: {
          start_date: start,
          end_date: end,
          sort_by: sort,
          status_po: status,
          id_customer: customerId || undefined,
          id_marketing: marketingId || undefined,
        },
        withCredentials: true,
      });
      console.log('Fetched JO data:', res.data);
      const list: any[] = Array.isArray(res.data?.data) ? res.data.data : [];
      setJoData(list);
      const seen = new Map<any, any>();
      list.forEach((d: any) => {
        if (d.id_customer && d.customer && !seen.has(d.id_customer))
          seen.set(d.id_customer, { value: d.id_customer, label: d.customer });
      });
      setCustomerOptions(Array.from(seen.values()));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleApply = () =>
    fetchJO(
      startDate,
      endDate,
      sortBy?.value,
      statusPo?.value,
      idCustomer?.value ?? null,
      idMarketing?.value ?? null,
    );

  const handleReset = () => {
    const start = firstOfMonth();
    const end = todayStr();
    setStartDate(start);
    setEndDate(end);
    setSortBy(SORT_BY_OPTIONS[0]);
    setStatusPo(STATUS_PO_OPTIONS[0]);
    setIdCustomer(null);
    setIdMarketing(null);
    setSearchQuery('');
    setStatusJoFilter(null);
    fetchJO(
      start,
      end,
      SORT_BY_OPTIONS[0].value,
      STATUS_PO_OPTIONS[0].value,
      null,
      null,
    );
  };

  // search-only filter, used both for the table and as the base for the Status JO recap
  // (recap chips always reflect all statuses present in the searched data, regardless of
  // whether a status chip is currently selected)
  const searchFiltered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return joData.filter((d) => {
      return (
        !q ||
        d.no_so?.toLowerCase().includes(q) ||
        d.customer?.toLowerCase().includes(q) ||
        d.produk?.toLowerCase().includes(q) ||
        d.job_order?.no_jo?.toLowerCase().includes(q) ||
        d.no_io?.toLowerCase().includes(q) ||
        d.ppic?.toLowerCase().includes(q)
      );
    });
  }, [joData, searchQuery]);

  const filtered = useMemo(() => {
    let result = statusJoFilter
      ? searchFiltered.filter((d) => d.job_order?.status_jo === statusJoFilter)
      : searchFiltered;

    if (sortConfig.key && sortConfig.direction) {
      const { key, direction } = sortConfig;
      result = [...result].sort((a, b) => {
        let aVal: any, bVal: any;
        if (key === 'no_jo') {
          aVal = a.job_order?.no_jo;
          bVal = b.job_order?.no_jo;
        } else if (key === 'status_kirim') {
          aVal = calcDeliveryProgress(a)?.status ?? 'belum kirim';
          bVal = calcDeliveryProgress(b)?.status ?? 'belum kirim';
        } else if (key === 'po_qty') {
          aVal = a.po_qty ?? 0;
          bVal = b.po_qty ?? 0;
        } else {
          aVal = a[key as keyof typeof a];
          bVal = b[key as keyof typeof b];
        }

        if (key === 'po_qty') {
          return direction === 'asc' ? aVal - bVal : bVal - aVal;
        }
        const aStr = (aVal ?? '').toString().toLowerCase();
        const bStr = (bVal ?? '').toString().toLowerCase();
        if (aStr < bStr) return direction === 'asc' ? -1 : 1;
        if (aStr > bStr) return direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [searchFiltered, statusJoFilter, sortConfig]);

  const SortableTh = ({
    label,
    column,
  }: {
    label: string;
    column: SortKey;
  }) => (
    <th
      onClick={() => handleSort(column)}
      className="p-2 sm:p-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap cursor-pointer select-none hover:bg-gray-200 active:bg-gray-300 transition-colors duration-150"
    >
      <span className="inline-flex items-center gap-1 text-gray-600">
        {label}
        <SortIcon column={column} sortConfig={sortConfig} />
      </span>
    </th>
  );

  return (
    <>
      <main>
        {isLoading && <Loading />}

        {/* Modals */}
        {detailRow && (
          <JODetailModal row={detailRow} onClose={() => setDetailRow(null)} />
        )}
        {tahapanRow && (
          <TahapanDetailModal
            row={tahapanRow}
            onClose={() => setTahapanRow(null)}
          />
        )}

        {/* ── Filter Card ── */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden mb-4">
          <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-3 sm:p-4">
            <h2 className="text-white text-base sm:text-lg md:text-xl font-bold flex items-center">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 mr-2 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              JO Monitoring
            </h2>
          </div>
          <div className="p-3 sm:p-4 md:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs sm:text-sm text-gray-600 font-medium">
                  Dari:
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 sm:py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs sm:text-sm text-gray-600 font-medium">
                  Sampai:
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 sm:py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs sm:text-sm text-gray-600 font-medium">
                  Sort By:
                </label>
                <Select
                  options={SORT_BY_OPTIONS}
                  value={sortBy}
                  onChange={(sel) => setSortBy(sel)}
                  styles={customSelectStyles}
                  className="text-xs sm:text-sm"
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs sm:text-sm text-gray-600 font-medium">
                  Status:
                </label>
                <Select
                  options={STATUS_PO_OPTIONS}
                  value={statusPo}
                  onChange={(sel) => setStatusPo(sel)}
                  styles={customSelectStyles}
                  className="text-xs sm:text-sm"
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs sm:text-sm text-gray-600 font-medium">
                  Customer:
                </label>
                <Select
                  options={customerOptions}
                  value={idCustomer}
                  onChange={(sel) => setIdCustomer(sel)}
                  isClearable
                  placeholder="Semua Customer"
                  styles={customSelectStyles}
                  className="text-xs sm:text-sm"
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs sm:text-sm text-gray-600 font-medium">
                  Marketing:
                </label>
                <Select
                  options={marketingOptions}
                  value={idMarketing}
                  onChange={(sel) => setIdMarketing(sel)}
                  isClearable
                  placeholder="Semua Marketing"
                  styles={customSelectStyles}
                  className="text-xs sm:text-sm"
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs sm:text-sm text-gray-600 font-medium">
                  Cari:
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="No JO, SO, customer, produk..."
                  className="w-full rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 sm:py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 transition-all"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-3 justify-end">
              <button
                onClick={handleReset}
                className="w-full sm:w-auto bg-red-500 hover:bg-red-600 transition-all rounded-lg px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white"
              >
                Reset Filter
              </button>
              <button
                onClick={handleApply}
                disabled={!startDate || !endDate}
                className={`w-full sm:w-auto rounded-lg px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white transition-all ${
                  !startDate || !endDate
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-violet-600 hover:bg-violet-700'
                }`}
              >
                Terapkan Filter
              </button>
            </div>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-white text-base sm:text-lg font-bold flex items-center gap-2">
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              Data JO Monitoring
            </h3>
            <div className="flex flex-wrap items-center gap-2 justify-end">
              <StatusJoSummary
                data={searchFiltered}
                selected={statusJoFilter}
                onSelect={handleStatusJoFilter}
              />
              {statusJoFilter && (
                <button
                  type="button"
                  onClick={() => setStatusJoFilter(null)}
                  title="Hapus filter status JO"
                  className="text-[10px] sm:text-xs bg-white bg-opacity-90 hover:bg-opacity-100 text-violet-700 px-2.5 py-0.5 rounded-full font-semibold whitespace-nowrap transition-colors"
                >
                  Clear ✕
                </button>
              )}
              <span className="text-sm text-white bg-white bg-opacity-20 px-3 py-0.5 rounded-full font-semibold whitespace-nowrap">
                {filtered.length} / {joData.length} Record
              </span>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[650px] overflow-y-auto">
            <table className="w-full text-xs sm:text-sm min-w-[1700px]">
              <thead className="bg-white sticky top-0 z-10">
                <tr>
                  <th className="p-2 sm:p-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">
                    No
                  </th>
                  <SortableTh label="Nomor" column="no_jo" />
                  <SortableTh label="Customer" column="customer" />
                  <SortableTh label="Produk" column="produk" />
                  <SortableTh label="Qty" column="po_qty" />
                  <th className="p-2 sm:p-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">
                    Status JO
                  </th>
                  <th className="p-2 sm:p-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">
                    Progress Kirim
                  </th>
                  <th className="p-2 sm:p-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">
                    Qty Produksi
                  </th>
                  <th className="p-2 sm:p-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">
                    Tambah Bahan
                  </th>
                  <SortableTh label="Tgl Kirim" column="tgl_pengiriman" />
                  <th className="p-2 sm:p-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">
                    Sisa Waktu
                  </th>
                  <th className="p-2 sm:p-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">
                    Tahapan Terakhir
                  </th>
                  <th className="p-2 sm:p-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">
                    Mounting
                  </th>
                  <SortableTh label="Status Kirim" column="status_kirim" />
                  <th className="p-2 sm:p-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={15}
                      className="p-8 text-center text-gray-500 text-sm"
                    >
                      Tidak ada data JO
                    </td>
                  </tr>
                ) : (
                  filtered.map((row: any, i: number) => {
                    const jo = row.job_order;
                    const dp = calcDeliveryProgress(row);
                    const tahapanProg = calcTahapanProgress(
                      row.produksi_lkh_tahapan,
                    );
                    const sisa = sisaWaktu(row.tgl_pengiriman);
                    const hasTahapan =
                      (row.produksi_lkh_tahapan?.length ?? 0) > 0;
                    const detailCount = countWithDetail(
                      row.produksi_lkh_tahapan ?? [],
                    );
                    const latestTahapan = getLatestTahapan(
                      row.produksi_lkh_tahapan ?? [],
                    );
                    const produksiQty = sumProduksiQty(
                      row.produksi_lkh_tahapan,
                    );
                    const tambahBahan = sumTambahBahan(jo);

                    const rowBg = dp?.isOver
                      ? 'bg-purple-50'
                      : dp?.status === 'selesai'
                      ? 'bg-green-50'
                      : dp?.status === 'kurang qty'
                      ? 'bg-orange-50'
                      : '';

                    return (
                      <tr
                        key={row.id}
                        className={`border-b hover:bg-blue-50 transition-colors ${rowBg}`}
                      >
                        <td className="p-2 sm:p-3 text-xs text-gray-500">
                          {i + 1}
                        </td>

                        <td className="p-2 sm:p-3 text-xs flex flex-col gap-2">
                          <span
                            onClick={() => setDetailRow(row)}
                            className="text-violet-600 hover:text-violet-800 hover:underline font-bold whitespace-nowrap cursor-pointer"
                          >
                            {jo?.no_jo || '-'}
                          </span>
                          <span className="text-xs whitespace-nowrap text-blue-600 font-medium">
                            {row.no_so || '-'}
                          </span>
                          <span className="text-xs whitespace-nowrap text-gray-500">
                            {row.no_io || '-'}
                          </span>
                        </td>

                        <td className="p-2 sm:p-3 text-xs max-w-[130px]">
                          <span
                            className="block font-medium"
                            title={row.customer}
                          >
                            {row.customer || '-'}
                          </span>
                        </td>
                        <td className="p-2 sm:p-3 text-xs max-w-[180px]">
                          <span className="block" title={row.produk}>
                            {row.produk || '-'}
                          </span>
                          <span className="text-blue-400 text-[10px]">
                            {row.label}
                          </span>
                        </td>
                        <td className="p-2 sm:p-3 text-xs text-right font-medium">
                          <div>{fmtQty(row.po_qty)}</div>
                          <div className="text-[10px] text-green-600 font-semibold mt-0.5">
                            {fmtQty(sumDeliveryQty(row))}
                          </div>
                        </td>

                        {/* Status JO */}
                        <td className="p-2 sm:p-3 text-xs whitespace-nowrap">
                          <StatusBadge status={jo?.status_jo} />
                        </td>

                        {/* Progress Kirim */}
                        <td className="p-2 sm:p-3 text-xs min-w-[140px] flex flex-col gap-1">
                          {dp ? (
                            <div className="space-y-1">
                              <DeliveryProgressBar
                                pct={dp.pct}
                                isOver={dp.isOver}
                              />
                              <QtyDiffLabel
                                shipped={dp.shipped}
                                total={dp.total}
                              />
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <DeliveryProgressBar pct={0} />
                              <span className="text-xs font-bold text-red-500">
                                -{fmtQty(row.po_qty)} kurang
                              </span>
                            </div>
                          )}
                          {row.status_work == 'done' && (
                            <span className="bg-red-100 text-red-800 text-xs px-1.5 py-0.5 rounded font-medium">
                              Status PO : CLOSED
                            </span>
                          )}
                        </td>

                        {/* Qty Produksi (Baik / RS / RT) */}
                        <td className="p-2 sm:p-3 text-xs min-w-[110px]">
                          <ProduksiQtyBadges
                            baik={produksiQty.baik}
                            rs={produksiQty.rs}
                            rt={produksiQty.rt}
                          />
                        </td>

                        {/* Tambah Bahan */}
                        <td className="p-2 sm:p-3 text-xs text-right min-w-[90px]">
                          {tambahBahan.total > 0 ? (
                            <div>
                              <div className="font-bold text-blue-600">
                                {fmtQty(tambahBahan.total)}
                              </div>
                              <div className="text-[9px] text-gray-400 whitespace-nowrap">
                                P: {fmtQty(tambahBahan.persiapan)} · G:{' '}
                                {fmtQty(tambahBahan.pemakaian)}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>

                        <td className="p-2 sm:p-3 text-xs whitespace-nowrap">
                          {fmtDate(row.tgl_pengiriman)}
                        </td>

                        <td
                          className={`p-2 sm:p-3 text-xs whitespace-nowrap ${sisa.color}`}
                        >
                          {sisa.label}
                        </td>

                        {/* Tahapan Terakhir */}
                        <td className="p-2 sm:p-3 text-xs max-w-[140px]">
                          <div className="space-y-1">
                            {latestTahapan ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-100 text-violet-700 border border-violet-200">
                                <svg
                                  className="w-2.5 h-2.5 flex-shrink-0"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                {latestTahapan}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-[10px] italic">
                                Belum ada
                              </span>
                            )}
                            {tahapanProg && (
                              <div className="flex items-center gap-1">
                                <div className="w-12 bg-gray-200 rounded-full h-1">
                                  <div
                                    className="bg-violet-400 h-1 rounded-full"
                                    style={{ width: `${tahapanProg.pct}%` }}
                                  />
                                </div>
                                <span className="text-[9px] text-gray-400">
                                  {tahapanProg.pct}%
                                </span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Mounting */}
                        <td className="p-2 sm:p-3 text-xs">
                          {jo?.jo_mounting?.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {jo.jo_mounting.map((m: any, mi: number) => (
                                <span
                                  key={mi}
                                  className="bg-indigo-100 text-indigo-700 text-[10px] font-semibold px-1.5 py-0.5 rounded"
                                >
                                  {m.nama_mounting ?? `M${mi + 1}`}
                                </span>
                              ))}
                            </div>
                          ) : (
                            '-'
                          )}
                        </td>

                        {/* Status Kirim */}
                        <td className="p-2 sm:p-3 text-xs">
                          {dp ? (
                            <StatusBadge status={dp.status} />
                          ) : (
                            <StatusBadge status="belum kirim" />
                          )}
                        </td>

                        {/* Aksi */}
                        <td className="p-2 sm:p-3 text-xs">
                          {hasTahapan && (
                            <button
                              onClick={() => setTahapanRow(row)}
                              title={`Detail tahapan (${detailCount} diproses)`}
                              className="relative p-1.5 rounded text-violet-500 hover:text-violet-700 hover:bg-violet-50 transition-colors"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                                />
                              </svg>
                              {detailCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                                  {detailCount}
                                </span>
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}

export default JOMonitoring;
