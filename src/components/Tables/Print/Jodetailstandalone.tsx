import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_LINK;

interface JODetail {
  id: number;
  no_jo: string;
  no_io: string;
  customer: string;
  produk: string;
  po_qty: number;
  tgl_kirim: string;
  tipe_jo: string;
  status_proses: string;
  [key: string]: any;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    done: { bg: 'bg-green-100', text: 'text-green-700', label: 'Selesai' },
    process: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Proses' },
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
  };
  const s = map[status?.toLowerCase()] ?? {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    label: status,
  };
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${s.bg} ${s.text}`}
    >
      {s.label}
    </span>
  );
};

// ─── Row ──────────────────────────────────────────────────────────────────────
const Row: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div className="flex flex-col sm:flex-row sm:items-start gap-1 py-3 border-b border-gray-100 last:border-0">
    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide sm:w-48 flex-shrink-0">
      {label}
    </span>
    <span className="text-sm text-gray-800 font-medium">
      {value ?? <span className="text-gray-300 italic">—</span>}
    </span>
  </div>
);

// ─── Fields already shown in the header / metrics section ────────────────────
const SKIP_KEYS = [
  'id',
  'no_jo',
  'no_io',
  'customer',
  'produk',
  'po_qty',
  'tgl_kirim',
  'tipe_jo',
  'status_proses',
  // explicit FK id columns
  'id_approve_jo',
  'id_create_jo',
  'id_customer',
  'id_io',
  'id_produk',
  'id_so',
  'so',
  'user_create',
  'user_approve',
];

// ─── ISO date detector ────────────────────────────────────────────────────────
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

// ─── Smart value formatter ────────────────────────────────────────────────────
const formatValue = (key: string, val: unknown): React.ReactNode => {
  if (val === null || val === undefined || val === '') return null;

  // Arrays — e.g. jo_mounting
  if (Array.isArray(val)) {
    if (val.length === 0) return null;
    return (
      <ul className="space-y-0.5">
        {val.map((item, i) => (
          <li key={i} className="text-sm text-gray-700">
            {typeof item === 'object' && item !== null
              ? (item as any).nama_mounting ??
                (item as any).name ??
                JSON.stringify(item)
              : String(item)}
          </li>
        ))}
      </ul>
    );
  }

  // ISO date strings → localised Indonesian date
  if (typeof val === 'string' && ISO_DATE_RE.test(val)) {
    const d = new Date(val);
    return isNaN(d.getTime())
      ? val
      : d.toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        });
  }

  // Numbers — thousand-separator
  if (typeof val === 'number') {
    return Number.isInteger(val) ? val.toLocaleString('id-ID') : String(val);
  }

  // Booleans — render as small badge
  if (typeof val === 'boolean') {
    return val ? (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
        Ya
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
        Tidak
      </span>
    );
  }

  // Plain objects → JSON fallback
  if (typeof val === 'object') return JSON.stringify(val);

  return String(val);
};

// ─── snake_case → Title Case label ───────────────────────────────────────────
const toLabel = (key: string) =>
  key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

// ─── Main Component ───────────────────────────────────────────────────────────
const JODetailStandalone: React.FC = () => {
  const [jo, setJo] = useState<JODetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) {
      setError('ID JO tidak ditemukan di URL.');
      setLoading(false);
      return;
    }
    axios
      .get(`${API_BASE}/ppic/jo/${id}`, { withCredentials: true })
      .then((res) => {
        setJo(res.data.data ?? res.data);
        console.log(res.data);
      })
      .catch((err) =>
        setError(err?.response?.data?.message ?? 'Gagal mengambil data JO.'),
      )
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (val?: string) => {
    if (!val) return '—';
    const d = new Date(val);
    return isNaN(d.getTime())
      ? val
      : d.toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        });
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
          <p className="text-sm text-gray-500 font-medium">Memuat data JO...</p>
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error || !jo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-xl shadow border border-red-100 p-8 max-w-sm w-full text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-base font-bold text-gray-800 mb-1">
            Data Tidak Ditemukan
          </h2>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* ── Header card ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Blue header */}
          <div className="bg-blue-600 px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-1">
                  Job Order
                </p>
                <h1 className="text-white text-2xl font-bold tracking-tight">
                  {jo.no_jo}
                </h1>
                <p className="text-blue-200 text-sm mt-1">IO: {jo.no_io}</p>
              </div>
              <StatusBadge status={jo.status_proses ?? ''} />
            </div>
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
            <div className="px-4 py-4 text-center">
              <p className="text-xs text-gray-400 font-medium mb-0.5">Qty PO</p>
              <p className="text-base font-bold text-gray-800">
                {jo.po_qty?.toLocaleString('id-ID')}{' '}
                <span className="text-xs font-normal text-gray-400">pcs</span>
              </p>
            </div>
            <div className="px-4 py-4 text-center">
              <p className="text-xs text-gray-400 font-medium mb-0.5">
                Tgl Kirim
              </p>
              <p className="text-sm font-bold text-gray-800">
                {formatDate(jo.tgl_kirim)}
              </p>
            </div>
            <div className="px-4 py-4 text-center">
              <p className="text-xs text-gray-400 font-medium mb-0.5">
                Tipe JO
              </p>
              <p className="text-sm font-bold text-gray-800">
                {jo.tipe_jo || '—'}
              </p>
            </div>
          </div>

          {/* Fixed detail rows */}
          <div className="px-6 py-2">
            <Row label="Customer" value={jo.customer} />
            <Row label="Nama Produk" value={jo.produk} />
            <Row label="No IO" value={jo.no_io} />
            <Row label="Tgl Kirim" value={formatDate(jo.tgl_kirim)} />
            <Row label="Tipe JO" value={jo.tipe_jo} />
            <Row
              label="Status"
              value={<StatusBadge status={jo.status_proses ?? ''} />}
            />

            {/* ── Dynamic extra fields ──────────────────────────────────── */}
            {Object.entries(jo)
              // drop hard-coded keys
              .filter(([k]) => !SKIP_KEYS.includes(k))
              // drop ALL id_* foreign-key columns
              .filter(([k]) => !k.startsWith('id_'))
              // drop ALL is_* boolean flags
              .filter(([k]) => !k.startsWith('is_'))
              // format & skip empties
              .map(([k, v]) => {
                const formatted = formatValue(k, v);
                if (formatted === null) return null;
                return <Row key={k} label={toLabel(k)} value={formatted} />;
              })}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400">
          PT. CAHAYA BERLIAN LESTARI
        </p>
      </div>
    </div>
  );
};

export default JODetailStandalone;
