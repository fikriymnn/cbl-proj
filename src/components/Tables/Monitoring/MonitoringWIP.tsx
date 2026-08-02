import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Loading from '../../Loading';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TahapanRef {
  id: number;
  kode_tahapan: string;
  nama_tahapan: string;
}

interface ProduksiLkhProses {
  id: number;
  baik: number;
  rusak_sebagian: number;
  rusak_total: number;
}

interface TambahBahanPersiapan {
  id: number;
  id_jo: number;
  status: string;
  status_tiket: string;
  qty_pakai_tambah_bahan_druk: number;
}

interface TambahBahanPemakaian {
  id: number;
  id_jo: number;
  status: string;
  status_tiket: string;
  qty_tambah_bahan_druk: number;
}

interface JOItem {
  id: number;
  id_jo: number;
  id_io: number;
  id_so: number;
  id_customer: number;
  id_produk: number;
  id_tahapan: number;
  no_jo: string;
  no_io: string;
  no_so: string;
  customer: string;
  produk: string;
  tgl_kirim: string | null;
  qty_jo: number;
  qty_druk: number | null;
  spesifikasi: string;
  index: number;
  tgl_approve: string | null;
  tgl_mulai: string | null;
  tgl_selesai: string | null;
  status: string;
  tahapan: TahapanRef;
  produksi_lkh_proses: ProduksiLkhProses[];
  umur_pengerjaan_hari: number;
  total_qty_produksi: number;
  total_qty_produksi_target: number;
  tambah_bahan_persiapan?: TambahBahanPersiapan[];
  tambah_bahan_pemakaian?: TambahBahanPemakaian[];
  total_qty_tambah_bahan_druk?: number;
  tahapan_sebelumnya: JOItem | null;
}

interface TahapanGroup {
  id_tahapan: number;
  tahapan: TahapanRef;
  total_data: number;
  data: JOItem[];
}

type StatusKey = 'over' | 'achieved' | 'progress' | 'stale' | 'not_started';

// ─── Status / color logic ───────────────────────────────────────────────────

const STATUS_META: Record<
  StatusKey,
  {
    label: string;
    border: string;
    headerBg: string;
    badgeBg: string;
    badgeText: string;
    dot: string;
    bar: string;
  }
> = {
  over: {
    label: 'Lebih Target',
    border: 'border-l-fuchsia-500',
    headerBg: 'bg-fuchsia-50',
    badgeBg: 'bg-fuchsia-100',
    badgeText: 'text-fuchsia-700',
    dot: 'bg-fuchsia-500',
    bar: 'bg-fuchsia-500',
  },
  achieved: {
    label: 'Tercapai',
    border: 'border-l-emerald-500',
    headerBg: 'bg-emerald-50',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-700',
    dot: 'bg-emerald-500',
    bar: 'bg-emerald-500',
  },
  progress: {
    label: 'Sedang Proses',
    border: 'border-l-blue-500',
    headerBg: 'bg-blue-50',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-700',
    dot: 'bg-blue-500',
    bar: 'bg-red-500',
  },
  stale: {
    label: 'Mandek',
    border: 'border-l-red-500',
    headerBg: 'bg-red-50',
    badgeBg: 'bg-red-100',
    badgeText: 'text-red-700',
    dot: 'bg-red-500',
    bar: 'bg-red-400',
  },
  not_started: {
    label: 'Belum Diproses',
    border: 'border-l-amber-400',
    headerBg: 'bg-amber-50',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-700',
    dot: 'bg-amber-400',
    bar: 'bg-amber-400',
  },
};

const STALE_THRESHOLD_HARI = 3; // no output yet + this many days in stage => "Mandek"

function getStatus(item: JOItem): StatusKey {
  const target = item.total_qty_produksi_target ?? 0;
  const produksi = item.total_qty_produksi ?? 0;
  const umur = item.umur_pengerjaan_hari ?? 0;

  if (target > 0) {
    if (produksi > target) return 'over';
    if (produksi === target) return 'achieved';
    if (produksi > 0) return 'progress';
    if (umur >= STALE_THRESHOLD_HARI) return 'stale';
    return 'not_started';
  }
  if (produksi > 0) return 'progress';
  if (umur >= STALE_THRESHOLD_HARI) return 'stale';
  return 'not_started';
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtNum(val: number | null | undefined) {
  if (val == null) return '-';
  return val.toLocaleString('id-ID');
}
function fmtDate(iso: string | null | undefined) {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
function fmtDateTime(iso: string | null | undefined) {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
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
function isOverdue(item: JOItem) {
  if (!item.tgl_kirim || item.status !== 'active') return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const kirim = new Date(item.tgl_kirim);
  kirim.setHours(0, 0, 0, 0);
  return kirim.getTime() < today.getTime();
}
function daysOverdue(item: JOItem) {
  if (!item.tgl_kirim) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const kirim = new Date(item.tgl_kirim);
  kirim.setHours(0, 0, 0, 0);
  return Math.round((today.getTime() - kirim.getTime()) / 86400000);
}
function umurTone(umur: number) {
  if (umur >= 5) return 'text-red-600 font-bold';
  if (umur >= STALE_THRESHOLD_HARI) return 'text-amber-600 font-semibold';
  return 'text-gray-500';
}
function sumProses(list: ProduksiLkhProses[] | undefined) {
  const arr = list ?? [];
  return arr.reduce(
    (acc, p) => ({
      baik: acc.baik + (p.baik ?? 0),
      rusak_sebagian: acc.rusak_sebagian + (p.rusak_sebagian ?? 0),
      rusak_total: acc.rusak_total + (p.rusak_total ?? 0),
    }),
    { baik: 0, rusak_sebagian: 0, rusak_total: 0 },
  );
}
// Cards with a long product/customer name get a full single-card column
// instead of sharing a 2-up stacked slot.
function isLongCard(item: JOItem) {
  return (item.produk?.length ?? 0) > 32 || (item.customer?.length ?? 0) > 24;
}
function qtyDiffLabel(produksi: number, target: number) {
  if (target <= 0) return { status: 'not_started' as StatusKey, label: '' };
  const diff = produksi - target;
  if (diff > 0)
    return { status: 'over' as StatusKey, label: `Lebih ${fmtNum(diff)}` };
  if (diff === 0) return { status: 'achieved' as StatusKey, label: 'Tercapai' };
  return {
    status: 'progress' as StatusKey,
    label: `Kurang ${fmtNum(Math.abs(diff))}`,
  };
}

// ─── Small UI atoms ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: StatusKey }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${meta.badgeBg} ${meta.badgeText}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

function MiniStat({
  label,
  value,
  tone,
  dot,
}: {
  label: string;
  value: number;
  tone: string;
  dot?: string;
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg bg-white border border-gray-100 shadow-sm px-2 py-1">
      {dot && <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />}
      <span className={`text-xs font-bold leading-none ${tone}`}>{value}</span>
      <span className="text-[9px] text-gray-400 font-medium uppercase tracking-wide leading-none">
        {label}
      </span>
    </div>
  );
}

function ProgressBar({
  produksi,
  target,
}: {
  produksi: number;
  target: number;
}) {
  if (target <= 0) {
    return (
      <div className="text-[11px] text-gray-400 italic">
        Belum ada target produksi
      </div>
    );
  }
  const pct = Math.min((produksi / target) * 100, 100);
  const { status, label } = qtyDiffLabel(produksi, target);
  const meta = STATUS_META[status];
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px] text-gray-500">
        <span>
          {fmtNum(produksi)} / {fmtNum(target)}
        </span>
        <span className={`font-semibold ${meta.badgeText}`}>{label}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5">
        <div
          className={`${meta.bar} h-1.5 rounded-full transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── JO Card ──────────────────────────────────────────────────────────────────

function JOCard({
  item,
  isLong,
  onClick,
}: {
  item: JOItem;
  isLong: boolean;
  onClick: () => void;
}) {
  const status = getStatus(item);
  const meta = STATUS_META[status];
  const proses = sumProses(item.produksi_lkh_proses);
  const overdue = isOverdue(item);
  const hasRusak = proses.rusak_sebagian > 0 || proses.rusak_total > 0;
  const target = item.total_qty_produksi_target ?? 0;
  const produksi = item.total_qty_produksi ?? 0;
  const pct = target > 0 ? Math.min((produksi / target) * 100, 100) : 0;
  const { status: barStatus } = qtyDiffLabel(produksi, target);
  const barMeta = STATUS_META[barStatus];
  const tambahBahan = item.total_qty_tambah_bahan_druk ?? 0;

  return (
    <button
      onClick={onClick}
      className={`w-full h-full flex flex-col justify-between text-left overflow-hidden bg-white rounded-md border border-gray-100 border-l-[3px] ${meta.border} shadow-sm hover:shadow-md transition-shadow px-2 py-1.5`}
    >
      {/* Header: no_jo + status dot, produk, customer */}
      <div className="min-h-0">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold text-violet-700 truncate">
            {item.no_jo}
          </p>
          <span
            className={`w-2 h-2 rounded-full shrink-0 ml-1 ${meta.dot}`}
            title={meta.label}
          />
        </div>
        <p
          className={`text-[10px] text-gray-600 font-medium leading-tight ${
            isLong ? '' : ''
          }`}
        >
          {item.produk}
        </p>
        <p
          className={`text-[9px] text-gray-400 leading-tight ${
            isLong ? '' : ''
          }`}
        >
          {item.customer}
        </p>
      </div>

      {/* Progress + badges */}
      <div>
        {target > 0 ? (
          <div className="flex items-center gap-1.5">
            <div className="flex-1 bg-gray-100 rounded-full h-1">
              <div
                className={`${barMeta.bar} h-1 rounded-full`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span
              className={`text-[9px] font-semibold shrink-0 ${barMeta.badgeText}`}
            >
              {produksi > target
                ? `+${fmtNum(produksi - target)}`
                : produksi === target
                ? '100%'
                : `-${fmtNum(target - produksi)}`}
            </span>
          </div>
        ) : (
          <p className="text-[9px] text-gray-300 italic"></p>
        )}

        {(proses.baik > 0 || hasRusak || tambahBahan > 0) && (
          <div className="flex gap-1 flex-wrap overflow-hidden mt-0.5">
            {proses.baik > 0 && (
              <span className="text-[9px] font-semibold px-1 rounded bg-green-50 text-green-700 shrink-0">
                B {fmtNum(proses.baik)}
              </span>
            )}
            {proses.rusak_sebagian > 0 && (
              <span className="text-[9px] font-semibold px-1 rounded bg-orange-50 text-orange-600 shrink-0">
                RS {fmtNum(proses.rusak_sebagian)}
              </span>
            )}
            {proses.rusak_total > 0 && (
              <span className="text-[9px] font-semibold px-1 rounded bg-red-50 text-red-600 shrink-0">
                RT {fmtNum(proses.rusak_total)}
              </span>
            )}
            {tambahBahan > 0 && (
              <span className="text-[9px] font-semibold px-1 rounded bg-sky-50 text-sky-600 shrink-0">
                TB {fmtNum(tambahBahan)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer: umur + tgl kirim */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-50 text-[9px]">
        <span
          className={`flex items-center gap-0.5 ${umurTone(
            item.umur_pengerjaan_hari,
          )}`}
        >
          <svg
            className="w-2.5 h-2.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {item.umur_pengerjaan_hari}h
        </span>
        <span
          className={`flex items-center gap-0.5 ${
            overdue ? 'text-red-600 font-semibold' : 'text-gray-400'
          }`}
        >
          {overdue ? `Telat ${daysOverdue(item)}h` : fmtDate(item.tgl_kirim)}
        </span>
      </div>
    </button>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex justify-between gap-3 py-1.5 border-b border-gray-50 text-xs">
      <span className="text-gray-400 shrink-0">{label}</span>
      <span className="text-gray-700 font-medium text-right">{value}</span>
    </div>
  );
}

function StageHistory({ item }: { item: JOItem }) {
  const chain: JOItem[] = [];
  let cur: JOItem | null = item.tahapan_sebelumnya;
  while (cur) {
    chain.push(cur);
    cur = cur.tahapan_sebelumnya;
  }
  if (chain.length === 0) return null;
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        Riwayat Tahapan Sebelumnya
      </h4>
      <div className="space-y-2">
        {chain.map((c, i) => {
          const proses = sumProses(c.produksi_lkh_proses);
          return (
            <div
              key={c.id ?? i}
              className="rounded-lg bg-gray-50 border border-gray-100 p-2.5 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-700">
                  {c.tahapan?.nama_tahapan}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                    c.status === 'done'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {c.status === 'done' ? 'Selesai' : c.status}
                </span>
              </div>
              <div className="mt-1 text-[11px] text-gray-500 space-y-0.5">
                <p>Disetujui: {fmtDateTime(c.tgl_approve)}</p>
                {(proses.baik > 0 ||
                  proses.rusak_sebagian > 0 ||
                  proses.rusak_total > 0) && (
                  <p>
                    Baik {fmtNum(proses.baik)} · RS{' '}
                    {fmtNum(proses.rusak_sebagian)} · RT{' '}
                    {fmtNum(proses.rusak_total)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TambahBahanSection({ item }: { item: JOItem }) {
  const persiapan = item.tambah_bahan_persiapan ?? [];
  const pemakaian = item.tambah_bahan_pemakaian ?? [];
  const total = item.total_qty_tambah_bahan_druk ?? 0;

  if (persiapan.length === 0 && pemakaian.length === 0 && total <= 0) {
    return null;
  }

  return (
    <div>
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
        Tambah Bahan Druk
      </h4>
      <div className="rounded-lg bg-sky-50 border border-sky-100 p-2.5 text-xs mb-2 flex justify-between items-center">
        <span className="text-sky-600">Total Tambah Bahan</span>
        <span className="font-bold text-sky-700">{fmtNum(total)}</span>
      </div>
      {persiapan.length > 0 && (
        <div className="space-y-1 mb-2">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
            Persiapan
          </p>
          {persiapan.map((tb) => (
            <div
              key={tb.id}
              className="flex justify-between text-[11px] bg-gray-50 rounded px-2 py-1"
            >
              <span className="text-gray-500">
                {tb.status} · {tb.status_tiket}
              </span>
              <span className="font-semibold text-gray-700">
                {fmtNum(tb.qty_pakai_tambah_bahan_druk)}
              </span>
            </div>
          ))}
        </div>
      )}
      {pemakaian.length > 0 && (
        <div className="space-y-1">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
            Pemakaian
          </p>
          {pemakaian.map((tb) => (
            <div
              key={tb.id}
              className="flex justify-between text-[11px] bg-gray-50 rounded px-2 py-1"
            >
              <span className="text-gray-500">
                {tb.status} · {tb.status_tiket}
              </span>
              <span className="font-semibold text-gray-700">
                {fmtNum(tb.qty_tambah_bahan_druk)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function JODetailModal({
  item,
  onClose,
}: {
  item: JOItem;
  onClose: () => void;
}) {
  const status = getStatus(item);
  const proses = sumProses(item.produksi_lkh_proses);
  const overdue = isOverdue(item);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col">
        <div className="bg-gradient-to-r from-violet-600 to-purple-700 px-4 sm:px-6 py-4 text-white rounded-t-2xl flex justify-between items-start shrink-0">
          <div>
            <p className="text-[11px] text-violet-100">
              {item.tahapan?.nama_tahapan}
            </p>
            <h3 className="text-base font-bold">{item.no_jo}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-purple-200 text-2xl font-bold leading-none"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <StatusBadge status={status} />
            {overdue && (
              <span className="text-[11px] font-semibold text-red-600">
                Telat kirim {daysOverdue(item)} hari
              </span>
            )}
          </div>

          <ProgressBar
            produksi={item.total_qty_produksi}
            target={item.total_qty_produksi_target}
          />

          <div>
            <DetailRow label="No IO" value={item.no_io || '-'} />
            <DetailRow label="No SO" value={item.no_so || '-'} />
            <DetailRow label="Customer" value={item.customer || '-'} />
            <DetailRow label="Produk" value={item.produk || '-'} />
            <DetailRow label="Spesifikasi" value={item.spesifikasi || '-'} />
            <DetailRow label="Qty JO" value={fmtNum(item.qty_jo)} />
            <DetailRow
              label="Umur di Tahap Ini"
              value={`${item.umur_pengerjaan_hari} hari`}
            />
            <DetailRow
              label="Tanggal Mulai"
              value={fmtDateTime(item.tgl_mulai)}
            />
            <DetailRow label="Tanggal Kirim" value={fmtDate(item.tgl_kirim)} />
            <DetailRow label="Status JO" value={item.status} />
          </div>

          {(proses.baik > 0 ||
            proses.rusak_sebagian > 0 ||
            proses.rusak_total > 0) && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Hasil Produksi Tahap Ini
              </h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-green-50 border border-green-100 p-2 text-center">
                  <p className="text-sm font-bold text-green-700">
                    {fmtNum(proses.baik)}
                  </p>
                  <p className="text-[10px] text-green-600">Baik</p>
                </div>
                <div className="rounded-lg bg-orange-50 border border-orange-100 p-2 text-center">
                  <p className="text-sm font-bold text-orange-600">
                    {fmtNum(proses.rusak_sebagian)}
                  </p>
                  <p className="text-[10px] text-orange-500">Rusak Sebagian</p>
                </div>
                <div className="rounded-lg bg-red-50 border border-red-100 p-2 text-center">
                  <p className="text-sm font-bold text-red-600">
                    {fmtNum(proses.rusak_total)}
                  </p>
                  <p className="text-[10px] text-red-500">Rusak Total</p>
                </div>
              </div>
            </div>
          )}

          <TambahBahanSection item={item} />

          <StageHistory item={item} />
        </div>

        <div className="px-4 sm:px-6 py-3 bg-gray-50 rounded-b-2xl flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-semibold rounded-lg"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Tahapan filter (multi-select, ordered by index) ───────────────────────────

interface TahapanOption {
  id_tahapan: number;
  nama: string;
  index: number;
}

function TahapanFilter({
  options,
  selected,
  onChange,
}: {
  options: TahapanOption[];
  selected: number[];
  onChange: (ids: number[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const sorted = useMemo(
    () => [...options].sort((a, b) => a.index - b.index),
    [options],
  );

  function toggle(id: number) {
    if (selected.includes(id)) onChange(selected.filter((s) => s !== id));
    else onChange([...selected, id]);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-lg bg-violet-50 border border-violet-200 px-3 py-2 text-sm text-gray-700 whitespace-nowrap"
      >
        Tahapan ({selected.length}/{options.length})
        <svg
          className={`w-3.5 h-3.5 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-100 p-2 max-h-72 overflow-y-auto">
            <div className="flex justify-between px-1 pb-1.5 mb-1 border-b border-gray-50">
              <button
                type="button"
                className="text-[11px] text-violet-600 font-semibold"
                onClick={() => onChange(sorted.map((o) => o.id_tahapan))}
              >
                Pilih Semua
              </button>
              <button
                type="button"
                className="text-[11px] text-gray-400 font-semibold"
                onClick={() => onChange([])}
              >
                Hapus
              </button>
            </div>
            {sorted.map((opt) => {
              // idx reflects the order the tahapan was checked in, not its
              // fixed pipeline position — this also drives the display order.
              const selIdx = selected.indexOf(opt.id_tahapan);
              const isSelected = selIdx !== -1;
              return (
                <label
                  key={opt.id_tahapan}
                  className="flex items-center justify-between gap-2 px-1.5 py-1 rounded hover:bg-violet-50 cursor-pointer text-sm"
                >
                  <span className="flex items-center gap-2 truncate">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggle(opt.id_tahapan)}
                      className="accent-violet-600 shrink-0"
                    />
                    <span
                      className={`truncate ${
                        isSelected ? '' : 'text-gray-400'
                      }`}
                    >
                      {opt.nama}
                    </span>
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${
                      isSelected
                        ? 'text-violet-500 bg-violet-50'
                        : 'text-gray-300 bg-gray-50'
                    }`}
                  >
                    {isSelected ? `idx ${selIdx + 1}` : '—'}
                  </span>
                </label>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Tahapan Row (horizontal layout) ───────────────────────────────────────────

function TahapanRow({
  group,
  onSelectItem,
}: {
  group: TahapanGroup;
  onSelectItem: (item: JOItem) => void;
}) {
  const counts = useMemo(() => {
    const c: Record<StatusKey, number> = {
      over: 0,
      achieved: 0,
      progress: 0,
      stale: 0,
      not_started: 0,
    };
    group.data.forEach((item) => {
      c[getStatus(item)] += 1;
    });
    return c;
  }, [group.data]);

  return (
    <div className="flex bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
      {/* Left label column: tahapan name + counts */}
      <div className="w-[110px] sm:w-[150px] shrink-0 bg-gradient-to-b from-violet-50 to-purple-50 border-r border-violet-100 p-2.5 flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-bold text-violet-700 leading-tight">
            {group.tahapan?.nama_tahapan ?? '-'}
          </h3>
          <span className="inline-block mt-1 text-[10px] font-bold text-violet-600 bg-white px-1.5 py-0.5 rounded-full">
            {group.data.length} JO
          </span>
        </div>
        {group.data.length > 0 && (
          <div className="flex flex-col gap-0.5 mt-2">
            {(Object.keys(STATUS_META) as StatusKey[]).map((key) =>
              counts[key] > 0 ? (
                <span
                  key={key}
                  className={`flex items-center gap-1 text-[9px] font-semibold ${STATUS_META[key].badgeText}`}
                  title={STATUS_META[key].label}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_META[key].dot}`}
                  />
                  <span className="">
                    {STATUS_META[key].label}: {counts[key]}
                  </span>
                </span>
              ) : null,
            )}
          </div>
        )}
      </div>

      {/* Cards flow horizontally, max 2 stacked per column slot */}
      <div className="flex-1 overflow-x-auto p-2">
        {group.data.length === 0 ? (
          <div className="flex items-center justify-center h-[100px]">
            <p className="text-gray-300 text-xs">Tidak ada JO</p>
          </div>
        ) : (
          <div
            className="grid grid-flow-col grid-rows-2 gap-1.5"
            style={{ gridAutoColumns: '190px', gridAutoRows: '96px' }}
          >
            {group.data.map((item) => {
              const long = isLongCard(item);
              return (
                <div key={item.id} className={long ? 'row-span-2' : ''}>
                  <JOCard
                    item={item}
                    isLong={long}
                    onClick={() => onSelectItem(item)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function MonitoringWIP() {
  const [isLoading, setIsLoading] = useState(false);
  const [groups, setGroups] = useState<TahapanGroup[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusKey | 'all'>('all');
  const [selectedTahapan, setSelectedTahapan] = useState<number[]>([]);
  const [selectedItem, setSelectedItem] = useState<JOItem | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  async function fetchData() {
    try {
      setIsLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_LINK}/produksi/monitoringWIP`,
        { withCredentials: true },
      );
      const data = res.data?.data ?? res.data ?? [];
      setGroups(Array.isArray(data) ? data : []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load monitoring WIP:', err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  // Whenever fresh groups arrive, default the tahapan filter to "select all".
  useEffect(() => {
    if (groups.length > 0) {
      setSelectedTahapan(groups.map((g) => g.id_tahapan));
    }
  }, [groups]);

  const tahapanOptions: TahapanOption[] = useMemo(
    () =>
      groups.map((g, i) => ({
        id_tahapan: g.id_tahapan,
        nama: g.tahapan?.nama_tahapan ?? '-',
        // "index" on a JO item encodes the pipeline order of its tahapan;
        // fall back to array position if no data is present yet.
        index: g.data[0]?.index ?? i + 1,
      })),
    [groups],
  );

  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    // Display order follows the order tahapan were checked in the filter,
    // not the fixed pipeline index.
    const selectionOrder = new Map(selectedTahapan.map((id, i) => [id, i]));
    return groups
      .filter((g) => selectionOrder.has(g.id_tahapan))
      .map((g) => {
        let data = g.data;
        if (q) {
          data = data.filter((item) =>
            [item.no_jo, item.no_io, item.customer, item.produk]
              .join(' ')
              .toLowerCase()
              .includes(q),
          );
        }
        if (statusFilter !== 'all') {
          data = data.filter((item) => getStatus(item) === statusFilter);
        }
        return { ...g, data };
      })
      .sort(
        (a, b) =>
          (selectionOrder.get(a.id_tahapan) ?? 0) -
          (selectionOrder.get(b.id_tahapan) ?? 0),
      );
  }, [groups, search, statusFilter, selectedTahapan]);

  const overallCounts = useMemo(() => {
    const c: Record<StatusKey, number> = {
      over: 0,
      achieved: 0,
      progress: 0,
      stale: 0,
      not_started: 0,
    };
    let total = 0;
    groups.forEach((g) =>
      g.data.forEach((item) => {
        c[getStatus(item)] += 1;
        total += 1;
      }),
    );
    return { ...c, total };
  }, [groups]);

  return (
    <>
      {isLoading && <Loading />}
      <main className="space-y-4 sm:space-y-5 px-2 sm:px-0">
        {/* ── Header / Toolbar ── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-t-xl px-4 sm:px-5 py-3 border-b border-violet-100 flex items-center gap-2 flex-wrap">
            <svg
              className="w-4 h-4 text-violet-500 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h2 className="font-semibold text-violet-700 text-sm shrink-0">
              Monitoring WIP
            </h2>
            {lastUpdated && (
              <span className="text-[11px] text-gray-400 shrink-0">
                diperbarui {fmtDateTime(lastUpdated.toISOString())}
              </span>
            )}

            {/* Compact summary pills, sit right next to Refresh */}
            <div className="flex items-center gap-1.5 flex-wrap ml-auto">
              <MiniStat
                label="Total"
                value={overallCounts.total}
                tone="text-gray-700"
              />
              <MiniStat
                label="Lebih Target"
                value={overallCounts.over}
                tone="text-fuchsia-600"
                dot={STATUS_META.over.dot}
              />
              <MiniStat
                label="Tercapai"
                value={overallCounts.achieved}
                tone="text-emerald-600"
                dot={STATUS_META.achieved.dot}
              />
              <MiniStat
                label="Sedang Proses"
                value={overallCounts.progress}
                tone="text-blue-600"
                dot={STATUS_META.progress.dot}
              />
              <MiniStat
                label="Mandek"
                value={overallCounts.stale}
                tone="text-red-600"
                dot={STATUS_META.stale.dot}
              />
              <MiniStat
                label="Belum Diproses"
                value={overallCounts.not_started}
                tone="text-amber-600"
                dot={STATUS_META.not_started.dot}
              />

              <button
                onClick={fetchData}
                disabled={isLoading}
                className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-800 bg-white border border-violet-200 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-5 space-y-4">
            {/* Search + tahapan filter + status filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari No JO, No IO, customer, produk..."
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-violet-50 border border-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>
              <TahapanFilter
                options={tahapanOptions}
                selected={selectedTahapan}
                onChange={setSelectedTahapan}
              />
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as StatusKey | 'all')
                }
                className="rounded-lg bg-violet-50 border border-violet-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
              >
                <option value="all">Semua Status</option>
                {(Object.keys(STATUS_META) as StatusKey[]).map((key) => (
                  <option key={key} value={key}>
                    {STATUS_META[key].label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ── Empty State ── */}
        {!isLoading && groups.length === 0 && (
          <div className="bg-white rounded-xl border border-dashed border-gray-200 py-12 sm:py-16 flex flex-col items-center gap-3 text-center px-4">
            <svg
              className="w-12 h-12 text-gray-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-gray-400 text-sm">Tidak ada data WIP saat ini</p>
          </div>
        )}

        {/* ── Board: horizontal rows, one per tahapan ── */}
        {groups.length > 0 && (
          <div className="space-y-2.5">
            {filteredGroups.map((group) => (
              <TahapanRow
                key={group.id_tahapan}
                group={group}
                onSelectItem={setSelectedItem}
              />
            ))}
          </div>
        )}
      </main>

      {selectedItem && (
        <JODetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </>
  );
}

export default MonitoringWIP;
