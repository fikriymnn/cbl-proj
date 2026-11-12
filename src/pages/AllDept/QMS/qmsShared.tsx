import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { FaCheck, FaTimes, FaInbox, FaPaperclip } from 'react-icons/fa';

// ─── Constants ────────────────────────────────────────────────────────────────

export const API = import.meta.env.VITE_API_LINK;
export const PAGE_LIMIT = 10;
export const NOTE_MAX = 255;

export const INPUT =
  'w-full rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 sm:py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 transition-all disabled:opacity-60 disabled:cursor-not-allowed';
export const BTN_PRIMARY =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 hover:bg-violet-700 px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed';
export const BTN_GHOST =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-gray-200 hover:bg-gray-300 px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-gray-700 transition-colors disabled:opacity-50';

export const selectStyles = {
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const dash = (v: any) =>
  v === null || v === undefined || v === '' ? '-' : v;

export function fmtDate(iso?: string | null) {
  if (!iso) return '-';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function fmtDateTime(iso?: string | null) {
  if (!iso) return '-';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '-';
  return (
    fmtDate(iso) +
    ' ' +
    d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  );
}

// yyyy-mm-dd for <input type="date">
export const toDateInput = (iso?: string | null) =>
  iso ? String(iso).split('T')[0] : '';

export function apiError(e: any): string {
  return (
    e?.response?.data?.msg ||
    e?.response?.data?.message ||
    e?.message ||
    'Terjadi kesalahan'
  );
}

// qa / mr / pelapor bisa null sampai tiket divalidasi
export function personName(p: any): string {
  if (!p) return '-';
  return p.name || p.nama || p.karyawan?.name || p.karyawan?.nama || '-';
}

// ─── Status & Stepper ─────────────────────────────────────────────────────────

const AMBER = 'bg-amber-100 text-amber-800 border-amber-200';
const BLUE = 'bg-blue-100 text-blue-700 border-blue-200';
const RED = 'bg-red-100 text-red-700 border-red-200';
const GREEN = 'bg-green-100 text-green-700 border-green-200';

const STATUS_STYLE: Record<string, string> = {
  'menunggu validasi qa': AMBER,
  'menunggu validasi mr': BLUE,
  'menunggu verifikasi qa': AMBER,
  'menunggu verifikasi mr': BLUE,
  'di tolak qa': RED,
  'di tolak mr': RED,
  'di teruskan ke capa': GREEN,
  'di teruskan': GREEN,
  selesai: GREEN,
  incoming: 'bg-slate-100 text-slate-700 border-slate-200',
};

export function StatusBadge({ status }: { status?: string | null }) {
  const cls =
    STATUS_STYLE[(status ?? '').toLowerCase()] ??
    'bg-gray-100 text-gray-700 border-gray-200';
  return (
    <span
      className={`inline-flex px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold rounded-full border capitalize whitespace-nowrap ${cls}`}
    >
      {status || '-'}
    </span>
  );
}

const TIPE_STYLE: Record<string, string> = {
  qty: 'bg-violet-100 text-violet-700',
  frekuensi: 'bg-sky-100 text-sky-700',
  waktu: 'bg-teal-100 text-teal-700',
  manual: 'bg-gray-100 text-gray-700',
};

export function TipeBadge({ tipe }: { tipe?: string | null }) {
  if (!tipe) return <span className="text-gray-400">-</span>;
  return (
    <span
      className={`inline-flex px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold rounded capitalize ${
        TIPE_STYLE[tipe] ?? 'bg-gray-100 text-gray-700'
      }`}
    >
      {tipe}
    </span>
  );
}

export const NCR_STEPS = ['Dibuat', 'Validasi QA', 'Validasi MR', 'Selesai'];
export const CAPA_STEPS = [
  'Isi Department',
  'Verifikasi QA',
  'Verifikasi MR',
  'Selesai',
];

// current === steps.length → semua langkah selesai
export function ncrStep(status?: string | null) {
  switch (status) {
    case 'menunggu validasi qa':
      return { current: 1 };
    case 'menunggu validasi mr':
      return { current: 2 };
    case 'di tolak qa':
      return { current: 1, failed: 1 };
    case 'di tolak mr':
      return { current: 2, failed: 2 };
    case 'di teruskan ke capa':
    case 'selesai':
      return { current: 4 };
    default:
      return { current: 0 };
  }
}

export function capaStep(status?: string | null) {
  switch (status) {
    case 'menunggu verifikasi qa':
      return { current: 1 };
    case 'menunggu verifikasi mr':
      return { current: 2 };
    case 'di tolak qa':
      return { current: 1, failed: 1 };
    case 'di tolak mr':
      return { current: 2, failed: 2 };
    case 'di teruskan':
      return { current: 4 };
    default:
      return { current: 0 };
  }
}

export function Stepper({
  steps,
  current,
  failed,
}: {
  steps: string[];
  current: number;
  failed?: number;
}) {
  return (
    <ol className="flex items-start">
      {steps.map((label, i) => {
        const isFail = failed === i;
        const done = !isFail && i < current;
        const active = !isFail && i === current;
        const lineOn =
          failed === i
            ? 'bg-red-300'
            : i <= current
            ? 'bg-green-400'
            : 'bg-gray-200';
        const circle = isFail
          ? 'bg-red-500 text-white'
          : done
          ? 'bg-green-500 text-white'
          : active
          ? 'bg-violet-600 text-white ring-4 ring-violet-100'
          : 'bg-gray-200 text-gray-500';
        return (
          <li
            key={label}
            className="relative flex-1 flex flex-col items-center"
          >
            {i > 0 && (
              <span
                className={`absolute top-3.5 right-1/2 w-full h-0.5 ${lineOn}`}
              />
            )}
            <span
              className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold ${circle}`}
            >
              {isFail ? <FaTimes /> : done ? <FaCheck /> : i + 1}
            </span>
            <span
              className={`mt-1.5 px-0.5 text-center text-[10px] sm:text-xs leading-tight ${
                isFail
                  ? 'text-red-600 font-semibold'
                  : active
                  ? 'text-violet-700 font-semibold'
                  : 'text-gray-500'
              }`}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useQmsList<T = any>(
  path: string,
  params: Record<string, any>,
  enabled = true,
  tick = 0, // ubah nilainya untuk memaksa muat ulang
) {
  const [rows, setRows] = useState<T[]>([]);
  const [totalPage, setTotalPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const key = JSON.stringify(params); // undefined ikut terbuang

  const reload = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API}${path}`, {
        params: JSON.parse(key),
        withCredentials: true,
      });
      setRows(Array.isArray(res.data?.data) ? res.data.data : []);
      setTotalPage(res.data?.total_page || 1);
    } catch (e) {
      setRows([]);
      setError(apiError(e));
    } finally {
      setLoading(false);
    }
  }, [path, key, enabled, tick]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { rows, totalPage, loading, error, reload };
}

// jumlah tiket = total_page dengan limit 1
export function useCount(
  path: string,
  params: Record<string, any>,
  enabled = true,
  tick = 0,
) {
  const { rows, totalPage } = useQmsList(
    path,
    { ...params, page: 1, limit: 1 },
    enabled,
    tick,
  );
  return rows.length === 0 ? 0 : totalPage;
}

export function useMe() {
  const [me, setMe] = useState<{
    id: any;
    name: string;
    departmentId: number | null;
    departmentName: string;
  } | null>(null);

  useEffect(() => {
    axios
      .get(`${API}/me`, { withCredentials: true })
      .then((res) => {
        const d = res.data;
        const b = d?.karyawan?.biodata_karyawan?.[0];
        setMe({
          id: d?.id_karyawan,
          name: d?.karyawan?.name ?? '',
          departmentId: b?.id_department ?? null,
          departmentName: b?.department?.nama_department ?? '',
        });
      })
      .catch(() => setMe(null));
  }, []);

  return me;
}

export function useDepartments(activeOnly = false) {
  const [options, setOptions] = useState<{ value: number; label: string }[]>(
    [],
  );
  useEffect(() => {
    axios
      .get(`${API}/master/hr/department`, {
        params: activeOnly ? { is_active: true } : undefined,
        withCredentials: true,
      })
      .then((res) =>
        setOptions(
          (res.data?.data ?? []).map((d: any) => ({
            value: d.id,
            label: d.nama_department,
          })),
        ),
      )
      .catch(console.error);
  }, [activeOnly]);
  return options;
}

export type ToastMsg = { type: 'success' | 'error'; text: string } | null;

export function useToast() {
  const [toast, setToast] = useState<ToastMsg>(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);
  const notify = useCallback(
    (text: string, type: 'success' | 'error' = 'success') =>
      setToast({ type, text }),
    [],
  );
  return { toast, notify, clear: () => setToast(null) };
}

export function Toast({
  toast,
  onClose,
}: {
  toast: ToastMsg;
  onClose: () => void;
}) {
  if (!toast) return null;
  const ok = toast.type === 'success';
  return (
    <div className="fixed top-4 inset-x-4 sm:left-auto sm:right-4 sm:w-96 z-[70]">
      <div
        role="status"
        className={`flex items-start gap-3 rounded-lg shadow-lg border px-4 py-3 text-sm ${
          ok
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}
      >
        <span className="flex-1 font-medium">{toast.text}</span>
        <button
          onClick={onClose}
          aria-label="Tutup"
          className="opacity-60 hover:opacity-100"
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
}

// ─── Layout blocks ────────────────────────────────────────────────────────────

export function Spinner({ label = 'Memuat data...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-gray-500 text-sm">
      <div className="h-9 w-9 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
      {label}
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-14 text-gray-400 text-sm">
      <FaInbox className="text-3xl" />
      {text}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-white text-base sm:text-lg md:text-xl font-bold">
          {title}
        </h2>
        {subtitle && (
          <p className="text-violet-100 text-xs sm:text-sm mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export function FilterCard({
  children,
  onReset,
}: {
  children: React.ReactNode;
  onReset: () => void;
}) {
  return (
    <div className="p-3 sm:p-4 border-b border-gray-200 bg-white">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
        {children}
        <button
          onClick={onReset}
          className="w-full rounded-lg bg-red-500 hover:bg-red-600 transition-colors px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white"
        >
          Reset Filter
        </button>
      </div>
    </div>
  );
}

export function Field({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs sm:text-sm text-gray-600 font-medium">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
    </div>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  max,
  required,
  disabled,
  rows = 3,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  max?: number;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <Field label={label} required={required}>
      <textarea
        value={value}
        rows={rows}
        maxLength={max}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`${INPUT} resize-y`}
      />
      {max && (
        <span className="text-[10px] text-gray-400 text-right">
          {value.length}/{max}
        </span>
      )}
    </Field>
  );
}

export function InfoGrid({ items }: { items: [string, React.ReactNode][] }) {
  return (
    <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 text-xs">
      {items.map(([label, val]) => (
        <div key={label} className="min-w-0">
          <dt className="text-gray-400 font-medium mb-0.5">{label}</dt>
          <dd className="text-gray-800 font-semibold break-words">
            {val === null || val === undefined || val === '' ? '-' : val}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function Section({
  title,
  children,
  tone = 'bg-gray-50',
}: {
  title: string;
  children: React.ReactNode;
  tone?: string;
}) {
  return (
    <section className={`${tone} rounded-xl p-3 sm:p-4`}>
      <h4 className="text-sm font-semibold text-gray-700 mb-3">{title}</h4>
      {children}
    </section>
  );
}

export function Modal({
  title,
  subtitle,
  onClose,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white shadow-2xl w-full sm:max-w-3xl max-h-[94vh] sm:max-h-[90vh] flex flex-col rounded-t-2xl sm:rounded-2xl">
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-4 sm:px-6 py-4 text-white rounded-t-2xl flex justify-between items-start gap-3 flex-shrink-0">
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-bold">{title}</h3>
            {subtitle && (
              <p className="text-violet-200 text-xs sm:text-sm mt-0.5 truncate">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="text-white hover:text-violet-200 text-xl leading-none p-1"
          >
            <FaTimes />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-3 sm:p-5 space-y-4">
          {children}
        </div>
        {footer && (
          <div className="px-4 sm:px-6 py-3 bg-gray-50 rounded-b-none sm:rounded-b-2xl border-t border-gray-200 flex flex-wrap justify-end gap-2 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Keputusan Sesuai / Tidak Sesuai (validasi & verifikasi) ──────────────────

export function DecisionPanel({
  title,
  hint,
  busy,
  onSubmit,
}: {
  title: string;
  hint?: string;
  busy: boolean;
  onSubmit: (status: 'sesuai' | 'tidak sesuai', note: string) => void;
}) {
  const [note, setNote] = useState('');
  const [pending, setPending] = useState<null | 'sesuai' | 'tidak sesuai'>(
    null,
  );
  const [err, setErr] = useState('');

  const choose = (s: 'sesuai' | 'tidak sesuai') => {
    if (s === 'tidak sesuai' && !note.trim()) {
      setErr('Isi catatan alasan penolakan agar bisa ditindaklanjuti.');
      return;
    }
    setErr('');
    setPending(s);
  };

  return (
    <div className="rounded-xl border-2 border-violet-200 bg-violet-50 p-3 sm:p-4 space-y-3">
      <h4 className="text-sm font-semibold text-violet-800">{title}</h4>
      {hint && (
        <p className="text-xs text-violet-700 bg-white rounded-lg border border-violet-100 px-3 py-2">
          {hint}
        </p>
      )}
      <TextAreaField
        label="Catatan"
        value={note}
        onChange={(v) => {
          setNote(v);
          setErr('');
        }}
        max={NOTE_MAX}
        rows={2}
        disabled={busy}
        placeholder="Wajib diisi jika Tidak Sesuai"
      />
      {err && <p className="text-xs text-red-600 font-medium">{err}</p>}

      {pending ? (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-white rounded-lg border border-violet-200 p-3">
          <p className="flex-1 text-sm text-gray-700">
            Tandai tiket ini{' '}
            <b
              className={
                pending === 'sesuai' ? 'text-green-600' : 'text-red-600'
              }
            >
              {pending}
            </b>
            ?
          </p>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <button
              className={BTN_GHOST}
              disabled={busy}
              onClick={() => setPending(null)}
            >
              Batal
            </button>
            <button
              className={BTN_PRIMARY}
              disabled={busy}
              onClick={() => onSubmit(pending, note.trim())}
            >
              {busy ? 'Menyimpan...' : 'Ya, kirim'}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <button
            disabled={busy}
            onClick={() => choose('sesuai')}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 hover:bg-green-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50"
          >
            <FaCheck /> Sesuai
          </button>
          <button
            disabled={busy}
            onClick={() => choose('tidak sesuai')}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-500 hover:bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50"
          >
            <FaTimes /> Tidak Sesuai
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Daftar: tabel di desktop, kartu di mobile ────────────────────────────────

export interface Column<T> {
  label: string;
  render: (row: T) => React.ReactNode;
  title?: boolean; // judul kartu mobile
  badge?: boolean; // pojok kanan atas kartu mobile
  wide?: boolean; // lebar penuh di kartu mobile
}

export function DataList<T extends { id: any }>({
  rows,
  columns,
  loading,
  error,
  page,
  totalPage,
  onPage,
  onOpen,
  rowClass,
  emptyText = 'Tidak ada data',
}: {
  rows: T[];
  columns: Column<T>[];
  loading: boolean;
  error?: string;
  page: number;
  totalPage: number;
  onPage: (p: number) => void;
  onOpen: (row: T) => void;
  rowClass?: (row: T) => string;
  emptyText?: string;
}) {
  if (loading && rows.length === 0) return <Spinner />;
  if (error)
    return (
      <div className="m-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    );
  if (rows.length === 0) return <EmptyState text={emptyText} />;

  const titleCol = columns.find((c) => c.title);
  const badgeCol = columns.find((c) => c.badge);
  const rest = columns.filter((c) => !c.title && !c.badge);
  const offset = (page - 1) * PAGE_LIMIT;

  return (
    <div className={loading ? 'opacity-60 transition-opacity' : ''}>
      {/* Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-3 text-left text-xs font-semibold text-gray-600 w-12">
                No
              </th>
              {columns.map((c) => (
                <th
                  key={c.label}
                  className="p-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap"
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={r.id}
                onClick={() => onOpen(r)}
                className={`border-b border-gray-100 cursor-pointer hover:bg-violet-50 transition-colors ${
                  rowClass?.(r) ?? ''
                }`}
              >
                <td className="p-3 text-xs text-gray-500">{offset + i + 1}</td>
                {columns.map((c) => (
                  <td key={c.label} className="p-3 text-xs align-top">
                    {c.render(r)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="md:hidden divide-y divide-gray-100">
        {rows.map((r) => (
          <button
            type="button"
            key={r.id}
            onClick={() => onOpen(r)}
            className={`w-full text-left p-4 active:bg-violet-50 ${
              rowClass?.(r) ?? ''
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="font-bold text-violet-700 text-sm break-all">
                {titleCol?.render(r)}
              </div>
              {badgeCol?.render(r)}
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
              {rest.map((c) => (
                <div key={c.label} className={c.wide ? 'col-span-2' : ''}>
                  <dt className="text-gray-400">{c.label}</dt>
                  <dd className="text-gray-800 font-medium break-words">
                    {c.render(r)}
                  </dd>
                </div>
              ))}
            </dl>
          </button>
        ))}
      </div>

      {totalPage > 1 && (
        <div className="flex justify-center px-3 py-4 bg-gray-50 border-t border-gray-200">
          <Stack spacing={2}>
            <Pagination
              count={totalPage}
              page={page}
              color="primary"
              size="small"
              siblingCount={0}
              onChange={(_, p) => onPage(p)}
            />
          </Stack>
        </div>
      )}
    </div>
  );
}

// ─── Upload lampiran (POST /images → nama file) ───────────────────────────────

export const MAX_IMAGE_SIZE = 1024 * 1024; // 1 MB

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  try {
    const res = await axios.post(`${API}/images`, formData, {
      withCredentials: true,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const name = res.data.fileName || res.data.filename || res.data.file;
    if (!name) throw new Error();
    return name;
  } catch {
    throw new Error('Gagal mengupload file');
  }
}

export function FileUpload({
  file,
  existingName,
  onChange,
  onError,
}: {
  file: File | null;
  existingName?: string;
  onChange: (f: File | null) => void;
  onError: (msg: string) => void;
}) {
  const [drag, setDrag] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [full, setFull] = useState(false);

  useEffect(() => {
    if (!file) return setPreview(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const pick = (f?: File | null) => {
    if (!f) return;
    if (!f.type.startsWith('image/'))
      return onError('Hanya file gambar yang diperbolehkan');
    if (f.size > MAX_IMAGE_SIZE) return onError('Ukuran file maksimal 1 MB');
    onChange(f);
  };

  return (
    <div className="space-y-2">
      <div
        onDragEnter={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDrag(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          pick(e.dataTransfer.files?.[0]);
        }}
        className={`relative border-2 border-dashed rounded-lg px-3 py-3 text-center text-xs transition-colors ${
          drag
            ? 'border-violet-400 bg-violet-100'
            : file
            ? 'border-green-400 bg-green-50'
            : 'border-blue-300 bg-blue-50 hover:bg-blue-100'
        }`}
      >
        <input
          type="file"
          accept="image/*"
          aria-label="Upload lampiran"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={(e) => {
            pick(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
        {file ? (
          <p className="font-medium text-gray-800 break-all">
            {file.name}{' '}
            <span className="text-gray-500 font-normal">
              ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </span>
          </p>
        ) : (
          <p className="text-blue-600">
            <span className="font-semibold">Klik untuk upload</span> atau drag
            and drop · gambar, maks 1 MB
          </p>
        )}
      </div>

      {existingName && !file && (
        <span className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600">
          <FaPaperclip /> Lampiran saat ini: {existingName}
        </span>
      )}

      {preview && (
        <div className="flex items-center gap-3">
          <img
            src={preview}
            alt="Preview"
            onClick={() => setFull(true)}
            className="h-16 w-16 object-cover rounded-lg border border-gray-200 cursor-pointer"
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-xs text-red-600 hover:text-red-700"
          >
            Hapus file
          </button>
        </div>
      )}

      {full && preview && (
        <div
          className="fixed inset-0 z-[80] bg-black/90 overflow-auto flex justify-center p-4"
          onClick={() => setFull(false)}
        >
          <img
            src={preview}
            alt="Fullscreen"
            className="max-w-full h-auto block self-start"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            aria-label="Tutup"
            className="fixed top-4 right-4 text-white bg-black/50 rounded-full w-10 h-10 flex items-center justify-center"
            onClick={() => setFull(false)}
          >
            <FaTimes />
          </button>
        </div>
      )}
    </div>
  );
}
