import React, { useEffect, useState } from 'react';
import axios from 'axios';
import convertTimeStampToDate from '../../../../utils/convertDate';
import formatInteger from '../../../../utils/formaterInteger';

// ─── Icons ─────────────────────────────────────────────────────────────────────
const IconCalendar = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const IconX = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconEye = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const IconUsers = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconChevronLeft = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const IconChevronRight = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const IconArrowLeft = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);
const IconCheck = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconReject = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
  </svg>
);
const IconFilter = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

// ─── Status Badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<
    string,
    { bg: string; text: string; dot: string; label: string }
  > = {
    draft: {
      bg: 'bg-slate-100',
      text: 'text-slate-600',
      dot: 'bg-slate-400',
      label: 'Draft',
    },
    'incoming approved': {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      dot: 'bg-amber-500',
      label: 'Menunggu Approval',
    },
    'incoming pay': {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      dot: 'bg-blue-500',
      label: 'Siap Bayar',
    },
    done: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      dot: 'bg-emerald-500',
      label: 'Selesai',
    },
    rejected: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      dot: 'bg-red-500',
      label: 'Ditolak',
    },
  };
  const s = map[status?.toLowerCase()] ?? {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    dot: 'bg-slate-400',
    label: status,
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

// ─── Spinner ──────────────────────────────────────────────────────────────────
const Spinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-9 h-9 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
  </div>
);

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ msg, type }: { msg: string; type: 'success' | 'error' }) => (
  <div
    className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-medium ${
      type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-500 text-white'
    }`}
  >
    <span className="text-base">{type === 'success' ? '✓' : '✕'}</span>
    {msg}
  </div>
);

// ─── Reject Reason Modal ───────────────────────────────────────────────────────
interface RejectModalProps {
  onConfirm: (reason: string) => void;
  onClose: () => void;
}
function RejectModal({ onConfirm, onClose }: RejectModalProps) {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 space-y-4">
        <h3 className="font-bold text-slate-800 text-base">Tolak Payroll</h3>
        <p className="text-xs text-slate-500">
          Berikan alasan penolakan (opsional).
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Alasan penolakan…"
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
        />
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 border border-slate-200 text-slate-600 text-sm font-semibold py-2.5 rounded-xl hover:bg-slate-50 transition"
          >
            Batal
          </button>
          <button
            onClick={() => onConfirm(reason)}
            className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2.5 rounded-xl transition"
          >
            <IconReject /> Tolak
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Helper: InfoRow ──────────────────────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        {label}
      </span>
      <div className="text-xs font-semibold text-slate-700 mt-0.5">{value}</div>
    </div>
  );
}

// ─── Helper: DetailTable ──────────────────────────────────────────────────────
function DetailTable({
  title,
  color,
  items,
}: {
  title: string;
  color: 'emerald' | 'red';
  items: any[];
}) {
  const hdr = color === 'emerald' ? 'bg-emerald-600' : 'bg-red-500';
  return (
    <div className="rounded-xl overflow-hidden border border-slate-200">
      <div
        className={`${hdr} text-white text-xs font-bold uppercase tracking-wider px-3 py-2`}
      >
        {title}
      </div>
      {items.length === 0 ? (
        <div className="text-xs text-slate-400 italic text-center py-5">
          Tidak ada data
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {items.map((item: any, i: number) => (
            <div
              key={i}
              className="flex items-center justify-between px-3 py-2 hover:bg-slate-50 text-xs"
            >
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-700 truncate">
                  {item.label}
                </div>
                <div className="text-slate-400">
                  {item.jumlah} × Rp {formatInteger(Number(item.nilai))}
                </div>
              </div>
              <span
                className={`font-bold ml-2 flex-shrink-0 ${
                  color === 'emerald' ? 'text-emerald-700' : 'text-red-600'
                }`}
              >
                Rp {formatInteger(Number(item.total))}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Level 3: Employee Detail Modal ──────────────────────────────────────────
interface EmployeeDetailModalProps {
  employee: any;
  periodeData: any;
  onClose: () => void;
}
function EmployeeDetailModal({
  employee,
  periodeData,
  onClose,
}: EmployeeDetailModalProps) {
  const biodata = employee.karyawan?.biodata_karyawan?.[0];
  const bayaranItems =
    employee.detail_payroll?.filter((d: any) => d.tipe === 'bayaran') ?? [];
  const potonganItems =
    employee.detail_payroll?.filter((d: any) => d.tipe === 'potongan') ?? [];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200 flex-shrink-0">
          <div>
            <h3 className="font-bold text-slate-800 text-base">
              {employee.karyawan?.name}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              NIK {biodata?.nik} · {biodata?.department?.nama_department ?? '—'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition"
          >
            <IconX />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: 'Total Upah',
                value: `Rp ${formatInteger(
                  employee.total_upah ?? employee.sub_total_upah,
                )}`,
                cls: 'bg-emerald-50 border-emerald-200 text-emerald-700',
              },
              {
                label: 'Total Potongan',
                value: `Rp ${formatInteger(employee.total_potongan)}`,
                cls: 'bg-red-50 border-red-200 text-red-700',
              },
              {
                label: 'Sub Total',
                value: `Rp ${formatInteger(employee.sub_total_upah)}`,
                cls: 'bg-blue-50 border-blue-200 text-blue-800',
              },
            ].map((c) => (
              <div key={c.label} className={`rounded-xl border p-3 ${c.cls}`}>
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-1">
                  {c.label}
                </div>
                <div className="font-bold text-sm">{c.value}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-slate-50 rounded-xl p-3 space-y-1.5">
              <InfoRow
                label="Periode"
                value={`${convertTimeStampToDate(
                  periodeData.periode_dari,
                )} — ${convertTimeStampToDate(periodeData.periode_sampai)}`}
              />
              <InfoRow
                label="Tipe Penggajian"
                value={employee.tipe_penggajian ?? '—'}
              />
              <InfoRow
                label="Yang Menyetujui"
                value={employee.karyawan_hr?.name ?? '—'}
              />
            </div>
            <div className="bg-slate-50 rounded-xl p-3 space-y-1.5">
              <InfoRow
                label="Pengurangan/Penambahan"
                value={`Rp ${formatInteger(employee.pengurangan_penambahan)}`}
              />
              <InfoRow
                label="Catatan"
                value={employee.note_pengurangan_penambahan ?? '—'}
              />
              <InfoRow
                label="Tanggal"
                value={convertTimeStampToDate(employee.createdAt)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <DetailTable
              title="Pendapatan"
              color="emerald"
              items={bayaranItems}
            />
            <DetailTable title="Potongan" color="red" items={potonganItems} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Level 2: Period Detail Modal ─────────────────────────────────────────────
interface PeriodDetailModalProps {
  periode: any;
  onClose: () => void;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}
function PeriodDetailModal({
  periode,
  onClose,
  onApprove,
  onReject,
  showToast,
}: PeriodDetailModalProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [search, setSearch] = useState('');

  // ── Filters (inside modal) ────────────────────────────────────────────────
  const [filterTipePenggajian, setFilterTipePenggajian] = useState('');
  const [filterTipeKaryawan, setFilterTipeKaryawan] = useState('');

  const tipePenggajianOptions: string[] = [
    ...new Set(
      (periode.payroll_detail ?? [])
        .map((d: any) => d.tipe_penggajian)
        .filter(Boolean),
    ),
  ] as string[];

  const tipeKaryawanOptions: string[] = [
    ...new Set(
      (periode.payroll_detail ?? [])
        .map((d: any) => d.tipe_karyawan)
        .filter(Boolean),
    ),
  ] as string[];

  const hasActiveFilter = filterTipePenggajian || filterTipeKaryawan;

  const isIncomingApproved =
    periode.status?.toLowerCase() === 'incoming approved';

  // Apply search + both filters
  const filtered = (periode.payroll_detail ?? []).filter((d: any) => {
    const name = d.karyawan?.name?.toLowerCase() ?? '';
    const nik = d.karyawan?.biodata_karyawan?.[0]?.nik ?? '';
    const q = search.toLowerCase();
    const matchSearch = name.includes(q) || nik.includes(q);
    const matchPenggajian =
      !filterTipePenggajian || d.tipe_penggajian === filterTipePenggajian;
    const matchKaryawan =
      !filterTipeKaryawan || d.tipe_karyawan === filterTipeKaryawan;
    return matchSearch && matchPenggajian && matchKaryawan;
  });

  const totalKaryawan = periode.payroll_detail?.length ?? 0;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-7xl mx-4 max-h-[90vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 flex-shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-700 transition p-1 rounded-lg hover:bg-slate-100"
              >
                <IconArrowLeft />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-slate-800">
                    {convertTimeStampToDate(periode.periode_dari)} —{' '}
                    {convertTimeStampToDate(periode.periode_sampai)}
                  </h2>
                  <StatusBadge status={periode.status} />
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {totalKaryawan} karyawan · Total Rp{' '}
                  {formatInteger(periode.total)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isIncomingApproved && (
                <>
                  <button
                    onClick={() => onReject(periode.id)}
                    className="flex items-center gap-1.5 bg-red-50 hover:bg-red-500 hover:text-white text-red-600 text-xs font-bold px-3 py-2 rounded-xl border border-red-200 hover:border-red-500 transition-all active:scale-95"
                  >
                    <IconReject /> Tolak
                  </button>
                  <button
                    onClick={() => onApprove(periode.id)}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition active:scale-95"
                  >
                    <IconCheck /> Approve
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-700 transition"
              >
                <IconX />
              </button>
            </div>
          </div>

          {/* Search + Filter bar (inside modal) */}
          <div className="px-6 py-3 border-b border-slate-100 flex-shrink-0 bg-slate-50 space-y-2">
            {/* Search */}
            <div className="relative max-w-sm">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Cari nama atau NIK…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl bg-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              {tipePenggajianOptions.length > 0 && (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <IconFilter />
                  </span>
                  <select
                    value={filterTipePenggajian}
                    onChange={(e) => setFilterTipePenggajian(e.target.value)}
                    className="pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-xl bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Semua Tipe Penggajian</option>
                    {tipePenggajianOptions.map((t) => (
                      <option key={t} value={t} className="capitalize">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {tipeKaryawanOptions.length > 0 && (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <IconFilter />
                  </span>
                  <select
                    value={filterTipeKaryawan}
                    onChange={(e) => setFilterTipeKaryawan(e.target.value)}
                    className="pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-xl bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Semua Tipe Karyawan</option>
                    {tipeKaryawanOptions.map((t) => (
                      <option key={t} value={t} className="capitalize">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {filterTipePenggajian && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200">
                  <span className="capitalize">{filterTipePenggajian}</span>
                  <button
                    onClick={() => setFilterTipePenggajian('')}
                    className="hover:text-violet-900 transition"
                  >
                    <IconX />
                  </button>
                </span>
              )}
              {filterTipeKaryawan && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
                  <span className="capitalize">{filterTipeKaryawan}</span>
                  <button
                    onClick={() => setFilterTipeKaryawan('')}
                    className="hover:text-cyan-900 transition"
                  >
                    <IconX />
                  </button>
                </span>
              )}
              {hasActiveFilter && (
                <button
                  onClick={() => {
                    setFilterTipePenggajian('');
                    setFilterTipeKaryawan('');
                  }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-red-600 bg-slate-100 hover:bg-red-50 border border-slate-200 hover:border-red-200 px-3 py-2 rounded-xl transition-all"
                >
                  <IconX /> Reset Filter
                </button>
              )}
            </div>
          </div>

          {/* Employee table */}
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                <tr>
                  {[
                    '#',
                    'NIK',
                    'Nama',
                    'Department',
                    'Divisi',
                    'Tipe Penggajian',
                    'Tipe Karyawan',
                    'Total Upah',
                    'Potongan',
                    'Sub Total',
                    'Aksi',
                  ].map((h, i) => (
                    <th
                      key={h}
                      className={`px-4 py-3 text-xs font-bold text-slate-500 ${
                        i === 0
                          ? 'text-left w-8'
                          : i >= 5 && i <= 7
                          ? 'text-left'
                          : i === 8
                          ? 'text-left'
                          : 'text-left'
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((emp: any, i: number) => {
                  const bio = emp.karyawan?.biodata_karyawan?.[0];
                  return (
                    <tr
                      key={emp.id ?? i}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-slate-400 text-xs">
                        {i + 1}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          {bio?.nik ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800 text-xs">
                        {emp.karyawan?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {bio?.department?.nama_department ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">
                        {emp.nama_divisi ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">
                        {emp.tipe_penggajian ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">
                        {emp.tipe_karyawan ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-emerald-700 font-semibold">
                        Rp {formatInteger(emp.sub_total_upah)}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-red-600 font-semibold">
                        {(emp.total_potongan ?? 0) > 0 ? (
                          `Rp ${formatInteger(emp.total_potongan)}`
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-bold text-slate-800">
                        Rp {formatInteger(emp.sub_total_upah)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setSelectedEmployee(emp)}
                          className="inline-flex items-center gap-1 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-600 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all"
                        >
                          <IconEye /> Detail
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="text-center py-12 text-slate-400 text-sm"
                    >
                      Tidak ada data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between flex-shrink-0">
            <span className="text-xs text-slate-500">
              {filtered.length} dari {totalKaryawan} karyawan ditampilkan
            </span>
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-500">Total Keseluruhan</span>
              <span className="font-bold text-slate-800">
                Rp {formatInteger(periode.total)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {selectedEmployee && (
        <EmployeeDetailModal
          employee={selectedEmployee}
          periodeData={periode}
          onClose={() => setSelectedEmployee(null)}
        />
      )}
    </>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
function ApprovePayroll() {
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [payWeek, setPayWeek] = useState<any>(null);
  const [selectedPeriode, setSelectedPeriode] = useState<any>(null);
  const [rejectTarget, setRejectTarget] = useState<number | null>(null);
  const [toast, setToast] = useState<{
    msg: string;
    type: 'success' | 'error';
  } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetchPayroll();
  }, [page]);

  async function fetchPayroll() {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_LINK}/hr/payroll/bayarMingguanPeriode`,
        { params: { page, limit: 10 }, withCredentials: true },
      );
      setPayWeek(res.data);
    } catch (error) {
      console.error(error);
      showToast('Gagal memuat data', 'error');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleApprove(id: number) {
    if (!confirm('Approve payroll ini?')) return;
    setIsLoading(true);
    try {
      await axios.put(
        `${
          import.meta.env.VITE_API_LINK
        }/hr/payroll/bayarMingguanPeriode/approve/${id}`,
        {},
        { withCredentials: true },
      );
      showToast('Payroll berhasil di-approve!');
      setSelectedPeriode(null);
      fetchPayroll();
    } catch {
      showToast('Gagal approve', 'error');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRejectConfirm(reason: string) {
    if (!rejectTarget) return;
    setIsLoading(true);
    setRejectTarget(null);
    try {
      await axios.put(
        `${
          import.meta.env.VITE_API_LINK
        }/hr/payroll/bayarMingguanPeriode/reject/${rejectTarget}`,
        { reason },
        { withCredentials: true },
      );
      showToast('Payroll berhasil ditolak');
      setSelectedPeriode(null);
      fetchPayroll();
    } catch {
      showToast('Gagal menolak payroll', 'error');
    } finally {
      setIsLoading(false);
    }
  }

  const totalPage = payWeek?.total_page ?? 1;
  const periodeList: any[] = payWeek?.data ?? [];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-30">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">
              Approve Payroll Mingguan
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Review dan setujui atau tolak pengajuan payroll
            </p>
          </div>
          {payWeek && (
            <div className="text-xs text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">
              {periodeList.length} periode dimuat
            </div>
          )}
        </div>
      </div>

      <div className="px-6 py-5 mx-auto">
        {isLoading && <Spinner />}

        {!isLoading && periodeList.length > 0 && (
          <>
            <div className="space-y-3">
              {periodeList.map((periode: any, i: number) => {
                const totalKaryawan = periode.payroll_detail?.length ?? 0;
                const isIncomingApproved =
                  periode.status?.toLowerCase() === 'incoming approved';
                return (
                  <div
                    key={periode.id ?? i}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                  >
                    <div className="flex items-center gap-4 px-5 py-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {(page - 1) * 10 + i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-800 text-sm">
                            {convertTimeStampToDate(periode.periode_dari)}
                            <span className="text-slate-400 mx-1.5">→</span>
                            {convertTimeStampToDate(periode.periode_sampai)}
                          </span>
                          <StatusBadge status={periode.status} />
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <IconUsers /> {totalKaryawan} karyawan
                          </span>
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <IconCalendar /> Tgl Bayar{' '}
                            {convertTimeStampToDate(periode.tgl_bayar)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs text-slate-400">Total Gaji</div>
                        <div className="font-bold text-slate-800">
                          Rp {formatInteger(periode.total)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {isIncomingApproved && (
                          <>
                            <button
                              onClick={() => setRejectTarget(periode.id)}
                              className="flex items-center gap-1.5 bg-red-50 hover:bg-red-500 hover:text-white text-red-600 text-xs font-bold px-3 py-2 rounded-xl border border-red-200 hover:border-red-500 transition-all active:scale-95"
                            >
                              <IconReject /> Tolak
                            </button>
                            <button
                              onClick={() => handleApprove(periode.id)}
                              className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 text-xs font-bold px-3 py-2 rounded-xl border border-emerald-200 hover:border-emerald-600 transition-all active:scale-95"
                            >
                              <IconCheck /> Approve
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setSelectedPeriode(periode)}
                          className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-800 hover:text-white text-slate-700 text-xs font-bold px-3 py-2 rounded-xl transition-all active:scale-95"
                        >
                          <IconEye /> Lihat Detail
                        </button>
                      </div>
                    </div>
                    <div className="h-0.5 w-full bg-slate-100">
                      <div
                        className={`h-full transition-all ${
                          periode.status === 'done'
                            ? 'w-full bg-emerald-500'
                            : periode.status === 'incoming pay'
                            ? 'w-3/4 bg-blue-500'
                            : periode.status === 'incoming approved'
                            ? 'w-1/2 bg-amber-500'
                            : periode.status === 'rejected'
                            ? 'w-1/4 bg-red-400'
                            : 'w-1/4 bg-slate-300'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPage > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition"
                >
                  <IconChevronLeft />
                </button>
                {Array.from({ length: totalPage }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                      p === page
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPage, p + 1))}
                  disabled={page === totalPage}
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition"
                >
                  <IconChevronRight />
                </button>
              </div>
            )}
          </>
        )}

        {!isLoading && periodeList.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 text-2xl">
              📋
            </div>
            <p className="text-sm font-medium">Belum ada pengajuan payroll</p>
            <p className="text-xs text-slate-300 mt-1">
              Pengajuan yang masuk akan muncul di sini
            </p>
          </div>
        )}
      </div>

      {selectedPeriode && (
        <PeriodDetailModal
          periode={selectedPeriode}
          onClose={() => setSelectedPeriode(null)}
          onApprove={handleApprove}
          onReject={(id) => setRejectTarget(id)}
          showToast={showToast}
        />
      )}

      {rejectTarget !== null && (
        <RejectModal
          onConfirm={handleRejectConfirm}
          onClose={() => setRejectTarget(null)}
        />
      )}
    </div>
  );
}

export default ApprovePayroll;
