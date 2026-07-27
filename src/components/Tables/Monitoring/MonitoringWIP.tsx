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
  tahapan_sebelumnya: JOItem | null;
}

interface TahapanGroup {
  id_tahapan: number;
  tahapan: TahapanRef;
  total_data: number;
  data: JOItem[];
}

type StatusKey =
  | 'achieved'
  | 'progress'
  | 'stale'
  | 'not_started'
  | 'no_target';

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
    bar: 'bg-blue-500',
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
  no_target: {
    label: 'Tanpa Target',
    border: 'border-l-gray-300',
    headerBg: 'bg-gray-50',
    badgeBg: 'bg-gray-100',
    badgeText: 'text-gray-500',
    dot: 'bg-gray-300',
    bar: 'bg-gray-300',
  },
};

const STALE_THRESHOLD_HARI = 3; // no output yet + this many days in stage => "Mandek"

function getStatus(item: JOItem): StatusKey {
  const target = item.total_qty_produksi_target ?? 0;
  const produksi = item.total_qty_produksi ?? 0;
  const umur = item.umur_pengerjaan_hari ?? 0;

  if (target <= 0) return 'no_target';
  if (produksi >= target) return 'achieved';
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

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
      {(Object.keys(STATUS_META) as StatusKey[]).map((key) => {
        const meta = STATUS_META[key];
        return (
          <span
            key={key}
            className="flex items-center gap-1.5 text-xs text-gray-500"
          >
            <span className={`w-2.5 h-2.5 rounded-full ${meta.dot}`} />
            {meta.label}
          </span>
        );
      })}
    </div>
  );
}

function SummaryPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-white border border-gray-100 shadow-sm px-3 sm:px-4 py-2.5 min-w-[84px]">
      <span className={`text-lg sm:text-xl font-bold ${tone}`}>{value}</span>
      <span className="text-[10px] sm:text-[11px] text-gray-400 font-medium uppercase tracking-wide text-center">
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
  const status =
    produksi >= target ? 'achieved' : produksi > 0 ? 'progress' : 'not_started';
  const meta = STATUS_META[status];
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px] text-gray-500">
        <span>
          {fmtNum(produksi)} / {fmtNum(target)}
        </span>
        <span className="font-semibold text-gray-600">{pct.toFixed(0)}%</span>
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

function JOCard({ item, onClick }: { item: JOItem; onClick: () => void }) {
  const status = getStatus(item);
  const meta = STATUS_META[status];
  const proses = sumProses(item.produksi_lkh_proses);
  const overdue = isOverdue(item);
  const hasRusak = proses.rusak_sebagian > 0 || proses.rusak_total > 0;
  const target = item.total_qty_produksi_target ?? 0;
  const pct =
    target > 0 ? Math.min((item.total_qty_produksi / target) * 100, 100) : 0;

  return (
    <button
      onClick={onClick}
      className={`w-full h-[92px] flex flex-col justify-between text-left overflow-hidden bg-white rounded-md border border-gray-100 border-l-[3px] ${meta.border} shadow-sm hover:shadow-md transition-shadow px-2 py-1.5`}
    >
      {/* Header: no_jo + status dot, customer */}
      <div>
        <div className="flex items-center justify-between ">
          <p className="text-[11px] font-bold text-violet-700 truncate">
            {item.no_jo}
          </p>
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${meta.dot}`}
            title={meta.label}
          />
        </div>
      </div>

      {/* Progress + badges */}
      <div className="">
        {target > 0 ? (
          <div className="flex items-center gap-1.5">
            <div className="flex-1 bg-gray-100 rounded-full h-1">
              <div
                className={`${meta.bar} h-1 rounded-full`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-[9px] font-semibold text-gray-500 shrink-0">
              {pct.toFixed(0)}%
            </span>
          </div>
        ) : (
          <p className="text-[9px] text-gray-300 italic">tanpa target</p>
        )}

        {(proses.baik > 0 || hasRusak) && (
          <div className="flex  overflow-hidden">
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

function JODetailModal({
  item,
  onClose,
}: {
  item: JOItem;
  onClose: () => void;
}) {
  const status = getStatus(item);
  const meta = STATUS_META[status];
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

// ─── Tahapan Column ───────────────────────────────────────────────────────────

function TahapanColumn({
  group,
  onSelectItem,
}: {
  group: TahapanGroup;
  onSelectItem: (item: JOItem) => void;
}) {
  const counts = useMemo(() => {
    const c: Record<StatusKey, number> = {
      achieved: 0,
      progress: 0,
      stale: 0,
      not_started: 0,
      no_target: 0,
    };
    group.data.forEach((item) => {
      c[getStatus(item)] += 1;
    });
    return c;
  }, [group.data]);

  return (
    <div className="flex flex-col w-[200px] sm:w-[220px] shrink-0 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-violet-50 to-purple-50 border-b border-violet-100 px-2.5 py-2 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs font-bold text-violet-700 truncate">
            {group.tahapan?.nama_tahapan ?? '-'}
          </h3>
          <span className="text-[10px] font-bold text-violet-600 bg-white px-1.5 py-0.5 rounded-full shrink-0">
            {group.data.length}
          </span>
        </div>
        {group.data.length > 0 && (
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {(Object.keys(STATUS_META) as StatusKey[]).map((key) =>
              counts[key] > 0 ? (
                <span
                  key={key}
                  className={`flex items-center gap-0.5 text-[9px] font-semibold ${STATUS_META[key].badgeText}`}
                  title={STATUS_META[key].label}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${STATUS_META[key].dot}`}
                  />
                  {counts[key]}
                </span>
              ) : null,
            )}
          </div>
        )}
      </div>

      <div className="flex-1 p-1.5 space-y-1 overflow-y-auto max-h-[75vh]">
        {group.data.length === 0 ? (
          <p className="text-center text-gray-300 text-xs py-8">Tidak ada JO</p>
        ) : (
          group.data.map((item) => (
            <JOCard
              key={item.id}
              item={item}
              onClick={() => onSelectItem(item)}
            />
          ))
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

  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    return groups.map((g) => {
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
    });
  }, [groups, search, statusFilter]);

  const overallCounts = useMemo(() => {
    const c: Record<StatusKey, number> = {
      achieved: 0,
      progress: 0,
      stale: 0,
      not_started: 0,
      no_target: 0,
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
            <h2 className="font-semibold text-violet-700 text-sm">
              Monitoring WIP
            </h2>
            {lastUpdated && (
              <span className="text-[11px] text-gray-400 ml-1">
                diperbarui {fmtDateTime(lastUpdated.toISOString())}
              </span>
            )}
            <button
              onClick={fetchData}
              disabled={isLoading}
              className="sm:ml-auto flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-800 bg-white border border-violet-200 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
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

          <div className="p-4 sm:p-5 space-y-4">
            {/* Search + status filter */}
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

            {/* Summary pills */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <SummaryPill
                label="Total JO"
                value={overallCounts.total}
                tone="text-gray-700"
              />
              <SummaryPill
                label="Tercapai"
                value={overallCounts.achieved}
                tone="text-emerald-600"
              />
              <SummaryPill
                label="Proses"
                value={overallCounts.progress}
                tone="text-blue-600"
              />
              <SummaryPill
                label="Mandek"
                value={overallCounts.stale}
                tone="text-red-600"
              />
              <SummaryPill
                label="Belum Diproses"
                value={overallCounts.not_started}
                tone="text-amber-600"
              />
              <SummaryPill
                label="Tanpa Target"
                value={overallCounts.no_target}
                tone="text-gray-400"
              />
            </div>

            <Legend />
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

        {/* ── Board ── */}
        {groups.length > 0 && (
          <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2">
            {filteredGroups.map((group) => (
              <TahapanColumn
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
