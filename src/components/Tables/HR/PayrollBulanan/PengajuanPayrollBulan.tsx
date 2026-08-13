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
const IconSend = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);
const IconDollar = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);
const IconPlus = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconTrash = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);
const IconFilter = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

// ─── Status Badge ─────────────────────────────────────────────────────────────
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

const Spinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-9 h-9 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
  </div>
);
const Toast = ({ msg, type }: { msg: string; type: 'success' | 'error' }) => (
  <div
    className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-medium
    ${
      type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-500 text-white'
    }`}
  >
    <span>{type === 'success' ? '✓' : '✕'}</span> {msg}
  </div>
);

// ─── Potongan Otomatis (absensi-based deduction) helpers ──────────────────────
// The payroll summary API returns several arrays of auto-generated deductions
// derived from attendance, each shaped as { label, jumlah, nilai, total }.
// `nilai` is a formula string (e.g. "10000000 / 26"), not a plain number.
type PotonganItem = {
  label?: string;
  jumlah: number;
  nilai: string | number;
  total: number;
};

const POTONGAN_CATEGORIES: { key: string; label: string }[] = [
  { key: 'potonganIzin', label: 'Izin' },
  { key: 'potonganSakit', label: 'Sakit' },
  { key: 'potonganMangkir', label: 'Mangkir' },
  { key: 'potongan_terlambat', label: 'Terlambat' },
  { key: 'potonganPinjaman', label: 'Pinjaman' },
  { key: 'potongan', label: 'Lainnya' },
];

function getPotonganBreakdown(source: any) {
  if (!source) return [];
  return POTONGAN_CATEGORIES.map(({ key, label }) => {
    const items: PotonganItem[] = Array.isArray(source[key]) ? source[key] : [];
    const total = items.reduce((sum, it) => sum + Number(it.total || 0), 0);
    return { key, label, items, total, count: items.length };
  }).filter((cat) => cat.count > 0);
}

// ─── Add Item Form ────────────────────────────────────────────────────────────
function AddItemForm({
  idPayrollBulanan,
  onSuccess,
  onClose,
}: {
  idPayrollBulanan: number;
  onSuccess: () => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    label: '',
    jumlah: 1,
    nilai: '',
    tipe: 'bayaran',
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const total = Number(form.jumlah) * Number(form.nilai || 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.label || !form.nilai) {
      setErr('Label dan nilai harus diisi');
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_LINK}/hr/payroll/bayarBulanan/detail`,
        {
          id_payroll_bulanan: idPayrollBulanan,
          jumlah: Number(form.jumlah),
          label: form.label,
          nilai: Number(form.nilai),
          total,
          tipe: form.tipe,
        },
        { withCredentials: true },
      );
      onSuccess();
    } catch {
      setErr('Gagal menyimpan. Coba lagi.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          Tipe
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['bayaran', 'potongan'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setForm({ ...form, tipe: t })}
              className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                form.tipe === t
                  ? t === 'bayaran'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-red-500 text-white border-red-500'
                  : 'bg-white text-slate-500 border-slate-200'
              }`}
            >
              {t === 'bayaran' ? '＋ Bayaran' : '－ Potongan'}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
          Label
        </label>
        <input
          type="text"
          value={form.label}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
          placeholder="cth: Bonus, Kasbon…"
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Jumlah
          </label>
          <input
            type="number"
            min={1}
            value={form.jumlah}
            onChange={(e) =>
              setForm({ ...form, jumlah: Number(e.target.value) })
            }
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Nilai (Rp)
          </label>
          <input
            type="number"
            min={0}
            value={form.nilai}
            onChange={(e) => setForm({ ...form, nilai: e.target.value })}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div
        className={`rounded-xl px-4 py-3 flex justify-between items-center border ${
          form.tipe === 'bayaran'
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-red-50 border-red-200'
        }`}
      >
        <span className="text-xs font-bold text-slate-500">TOTAL</span>
        <span
          className={`text-lg font-bold ${
            form.tipe === 'bayaran' ? 'text-emerald-700' : 'text-red-600'
          }`}
        >
          {form.tipe === 'potongan' ? '−' : '+'} Rp {formatInteger(total)}
        </span>
      </div>
      {err && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {err}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 border border-slate-200 text-slate-600 text-sm font-semibold py-2.5 rounded-xl hover:bg-slate-50 transition"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={loading}
          className={`flex-1 flex items-center justify-center gap-2 text-white text-sm font-semibold py-2.5 rounded-xl transition disabled:opacity-60
            ${
              form.tipe === 'bayaran'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-red-500 hover:bg-red-600'
            }`}
        >
          {loading ? 'Menyimpan…' : 'Simpan'}
        </button>
      </div>
    </form>
  );
}

// ─── Detail Table ─────────────────────────────────────────────────────────────
function DetailTable({
  title,
  color,
  items,
  canDelete,
  onDelete,
}: {
  title: string;
  color: 'emerald' | 'red';
  items: any[];
  canDelete?: boolean;
  onDelete?: (id: number) => void;
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
              className="flex items-center justify-between px-3 py-2 group hover:bg-slate-50 text-xs"
            >
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-700 truncate">
                  {item.label}
                </div>
                <div className="text-slate-400">
                  {item.jumlah} × Rp {formatInteger(Number(item.nilai))}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                <span
                  className={`font-bold ${
                    color === 'emerald' ? 'text-emerald-700' : 'text-red-600'
                  }`}
                >
                  Rp {formatInteger(Number(item.total))}
                </span>
                {canDelete && item.id && onDelete && (
                  <button
                    onClick={() => onDelete(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition p-0.5 rounded"
                  >
                    <IconTrash />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Rincian Potongan Otomatis (attendance-based deduction breakdown) ─────────
function PotonganBreakdownGrid({ source }: { source: any }) {
  const breakdown = getPotonganBreakdown(source);
  if (breakdown.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
        Rincian Potongan Otomatis (Absensi)
      </h4>
      <div className="grid grid-cols-2 gap-3">
        {breakdown.map((cat) => (
          <div
            key={cat.key}
            className="rounded-xl overflow-hidden border border-red-200"
          >
            <div className="flex items-center justify-between bg-red-500 text-white text-xs font-bold uppercase tracking-wider px-3 py-2">
              <span>{cat.label}</span>
              <span>{cat.count}x</span>
            </div>
            <div className="divide-y divide-red-100">
              {cat.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-3 py-1.5 text-xs"
                >
                  <span className="text-slate-400">{item.nilai}</span>
                  <span className="font-bold text-red-600">
                    Rp {formatInteger(Number(item.total))}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between px-3 py-1.5 bg-red-50 border-t border-red-200 text-xs">
              <span className="font-bold text-slate-500">Subtotal</span>
              <span className="font-bold text-red-700">
                Rp {formatInteger(cat.total)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Employee Detail Modal ────────────────────────────────────────────────────
function EmployeeDetailModal({
  employee,
  periodeData,
  onClose,
  onRefresh,
  showToast,
}: {
  employee: any;
  periodeData: any;
  onClose: () => void;
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}) {
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [localEmployee, setLocalEmployee] = useState<any>(employee);
  const isDraft = periodeData.status?.toLowerCase() === 'draft';

  const bayaranItems =
    localEmployee.detail_payroll?.filter((d: any) => d.tipe === 'bayaran') ??
    [];
  const potonganItems =
    localEmployee.detail_payroll?.filter((d: any) => d.tipe === 'potongan') ??
    [];
  const bio = localEmployee.karyawan?.biodata_karyawan?.[0];

  async function refreshEmployee() {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_LINK}/hr/payroll/bayarBulananPeriode`,
        { params: { page: 1, limit: 100 }, withCredentials: true },
      );
      const periods: any[] = res.data?.data ?? [];
      for (const p of periods) {
        const found = p.payroll_detail_bulanan?.find(
          (e: any) => e.id === localEmployee.id,
        );
        if (found) {
          setLocalEmployee(found);
          break;
        }
      }
      onRefresh();
    } catch {}
  }

  async function deleteDetail(idDetail: number) {
    if (!confirm('Hapus item ini?')) return;
    setIsDeleting(true);
    try {
      await axios.put(
        `${
          import.meta.env.VITE_API_LINK
        }/hr/payroll/bayarBulanan/detail/delete`,
        {
          id_payroll_bulanan: localEmployee.id,
          id_payroll_bulanan_detail: idDetail,
        },
        { withCredentials: true },
      );
      showToast('Item berhasil dihapus');
      await refreshEmployee();
    } catch {
      showToast('Gagal menghapus item', 'error');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200 flex-shrink-0">
          <div>
            <h3 className="font-bold text-slate-800 text-base">
              {localEmployee.karyawan?.name ?? localEmployee.nama_karyawan}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              NIK {bio?.nik ?? localEmployee.nik} ·{' '}
              {bio?.department?.nama_department ??
                localEmployee.department ??
                '—'}
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
          {/* Summary */}
          <div className="grid grid-cols-4 gap-3">
            {[
              {
                label: 'Total Upah',
                value: `Rp ${formatInteger(
                  localEmployee.total_upah ?? localEmployee.sub_total_upah,
                )}`,
                cls: 'bg-emerald-50 border-emerald-200 text-emerald-700',
              },
              {
                label: 'TMK',
                value: `Rp ${formatInteger(localEmployee.tmk)}`,
                cls: 'bg-amber-50 border-amber-200 text-amber-700',
              },
              {
                label: 'Total Potongan',
                value: `Rp ${formatInteger(localEmployee.total_potongan)}`,
                cls: 'bg-red-50 border-red-200 text-red-700',
              },
              {
                label: 'Sub Total',
                value: `Rp ${formatInteger(
                  localEmployee.sub_total_upah ?? localEmployee.sub_total,
                )}`,
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

          {/* Info rows */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-xl p-3 space-y-2">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Periode
                </span>
                <div className="text-xs font-semibold text-slate-700 mt-0.5">
                  {convertTimeStampToDate(periodeData.periode_dari)} —{' '}
                  {convertTimeStampToDate(periodeData.periode_sampai)}
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Tipe Penggajian
                </span>
                <div className="text-xs font-semibold text-slate-700 mt-0.5">
                  {localEmployee.tipe_penggajian ?? '—'}
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Yang Menyetujui
                </span>
                <div className="text-xs font-semibold text-slate-700 mt-0.5">
                  {localEmployee.karyawan_hr?.name ?? '—'}
                </div>
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 space-y-2">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Catatan Pengurangan/Penambahan
                </span>
                <div className="text-xs font-semibold text-slate-700 mt-0.5">
                  {localEmployee.note_pengurangan_penambahan || '—'}
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Pengurangan/Penambahan
                </span>
                <div className="text-xs font-semibold text-slate-700 mt-0.5">
                  Rp {formatInteger(localEmployee.pengurangan_penambahan)}
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Tanggal
                </span>
                <div className="text-xs font-semibold text-slate-700 mt-0.5">
                  {convertTimeStampToDate(localEmployee.createdAt)}
                </div>
              </div>
            </div>
          </div>

          {/* Auto-generated (attendance-based) deduction breakdown */}
          <PotonganBreakdownGrid source={localEmployee} />

          {/* Manual detail tables (items added via "Tambah Bayaran / Potongan") */}
          <div className="grid grid-cols-2 gap-4">
            <DetailTable
              title="Pendapatan"
              color="emerald"
              items={bayaranItems}
              canDelete={isDraft}
              onDelete={deleteDetail}
            />
            <DetailTable
              title="Potongan Manual"
              color="red"
              items={potonganItems}
              canDelete={isDraft}
              onDelete={deleteDetail}
            />
          </div>

          {/* Add item — draft only */}
          {isDraft &&
            (addItemOpen ? (
              <div className="border border-slate-200 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-slate-700 text-sm">
                    Tambah Item
                  </h4>
                  <button
                    onClick={() => setAddItemOpen(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <IconX />
                  </button>
                </div>
                <AddItemForm
                  idPayrollBulanan={localEmployee.id}
                  onSuccess={() => {
                    setAddItemOpen(false);
                    refreshEmployee();
                    showToast('Item berhasil ditambahkan');
                  }}
                  onClose={() => setAddItemOpen(false)}
                />
              </div>
            ) : (
              <button
                onClick={() => setAddItemOpen(true)}
                className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 text-slate-500 hover:text-blue-600 text-sm font-semibold py-3 rounded-xl transition-all"
              >
                <IconPlus /> Tambah Bayaran / Potongan
              </button>
            ))}
        </div>

        {isDeleting && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Period Detail Modal ──────────────────────────────────────────────────────
function PeriodDetailModal({
  periode,
  onClose,
  onRefresh,
  onPay,
  onSubmit,
  showToast,
}: {
  periode: any;
  onClose: () => void;
  onRefresh: () => void;
  onPay: (id: number) => void;
  onSubmit: (id: number) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}) {
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [localPeriode, setLocalPeriode] = useState<any>(periode);
  const [isFetching, setIsFetching] = useState(false);
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterDivisi, setFilterDivisi] = useState('');
  const [filterTipePenggajian, setFilterTipePenggajian] = useState('');
  const [filterTipeKaryawan, setFilterTipeKaryawan] = useState('');

  async function refreshLocalPeriode() {
    setIsFetching(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_LINK}/hr/payroll/bayarBulananPeriode`,
        { params: { page: 1, limit: 100 }, withCredentials: true },
      );
      console.log('refreshLocalPeriode', res.data?.data);
      const fresh = (res.data?.data ?? []).find(
        (p: any) => p.id === localPeriode.id,
      );
      if (fresh) {
        setLocalPeriode(fresh);
        if (selectedEmployee) {
          const freshEmp = fresh.payroll_detail_bulanan?.find(
            (e: any) => e.id === selectedEmployee.id,
          );
          if (freshEmp) setSelectedEmployee(freshEmp);
        }
      }
      onRefresh();
    } catch {
      showToast('Gagal memperbarui data', 'error');
    } finally {
      setIsFetching(false);
    }
  }

  const departmentOptions: string[] = [
    ...new Set(
      (localPeriode.payroll_detail_bulanan ?? [])
        .map(
          (d: any) =>
            d.karyawan?.biodata_karyawan?.[0]?.department?.nama_department ??
            d.department,
        )
        .filter(Boolean),
    ),
  ] as string[];
  const divisiOptions: string[] = [
    ...new Set(
      (localPeriode.payroll_detail_bulanan ?? [])
        .map((d: any) => d.nama_divisi ?? d.divisi)
        .filter(Boolean),
    ),
  ] as string[];
  const tipePenggajianOptions: string[] = [
    ...new Set(
      (localPeriode.payroll_detail_bulanan ?? [])
        .map((d: any) => d.tipe_penggajian)
        .filter(Boolean),
    ),
  ] as string[];
  const tipeKaryawanOptions: string[] = [
    ...new Set(
      (localPeriode.payroll_detail_bulanan ?? [])
        .map((d: any) => d.tipe_karyawan)
        .filter(Boolean),
    ),
  ] as string[];
  const hasActiveFilter =
    filterDepartment ||
    filterDivisi ||
    filterTipePenggajian ||
    filterTipeKaryawan;

  const filtered = (localPeriode.payroll_detail_bulanan ?? []).filter(
    (d: any) => {
      const name = d.karyawan?.name?.toLowerCase() ?? '';
      const nik = d.karyawan?.biodata_karyawan?.[0]?.nik ?? '';
      const department =
        d.karyawan?.biodata_karyawan?.[0]?.department?.nama_department ??
        d.department ??
        '';
      const divisi = d.nama_divisi ?? d.divisi ?? '';
      const q = search.toLowerCase();

      const matchSearch = name.includes(q) || nik.includes(q);
      const matchDepartment =
        !filterDepartment || department === filterDepartment;
      const matchDivisi = !filterDivisi || divisi === filterDivisi;
      const matchPenggajian =
        !filterTipePenggajian || d.tipe_penggajian === filterTipePenggajian;
      const matchKaryawan =
        !filterTipeKaryawan || d.tipe_karyawan === filterTipeKaryawan;

      return (
        matchSearch &&
        matchDepartment &&
        matchDivisi &&
        matchPenggajian &&
        matchKaryawan
      );
    },
  );

  const totalKaryawan = localPeriode.payroll_detail_bulanan?.length ?? 0;
  const isDraft = localPeriode.status?.toLowerCase() === 'draft';
  const isIncomingPay = localPeriode.status?.toLowerCase() === 'incoming pay';

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl mx-4 max-h-[90vh] flex flex-col overflow-hidden">
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
                    {convertTimeStampToDate(localPeriode.periode_dari)} —{' '}
                    {convertTimeStampToDate(localPeriode.periode_sampai)}
                  </h2>
                  <StatusBadge status={localPeriode.status} />
                  {isFetching && (
                    <span className="w-4 h-4 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin inline-block" />
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {totalKaryawan} karyawan · Total Rp{' '}
                  {formatInteger(localPeriode.total)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isDraft && (
                <button
                  onClick={() => onSubmit(localPeriode.id)}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition active:scale-95"
                >
                  <IconSend /> Ajukan
                </button>
              )}
              {isIncomingPay && (
                <button
                  onClick={() => onPay(localPeriode.id)}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition active:scale-95"
                >
                  <IconDollar /> Bayar
                </button>
              )}
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-700 transition"
              >
                <IconX />
              </button>
            </div>
          </div>

          {/* Search + Filter bar */}
          <div className="px-6 py-3 border-b border-slate-100 flex-shrink-0 bg-slate-50 space-y-2">
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
            <div className="flex items-center gap-2 flex-wrap">
              {departmentOptions.length > 0 && (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <IconArrowLeft />
                  </span>
                  <select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    className="pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-xl bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ minWidth: 0 }}
                  >
                    <option value="">Semua Department</option>
                    {departmentOptions.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {divisiOptions.length > 0 && (
                <select
                  value={filterDivisi}
                  onChange={(e) => setFilterDivisi(e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Semua Divisi</option>
                  {divisiOptions.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              )}
              {/* {tipePenggajianOptions.length > 0 && (
                <select
                  value={filterTipePenggajian}
                  onChange={(e) => setFilterTipePenggajian(e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Semua Tipe Penggajian</option>
                  {tipePenggajianOptions.map((t) => (
                    <option key={t} value={t} className="capitalize">
                      {t}
                    </option>
                  ))}
                </select>
              )} */}
              {tipeKaryawanOptions.length > 0 && (
                <select
                  value={filterTipeKaryawan}
                  onChange={(e) => setFilterTipeKaryawan(e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Semua Tipe Karyawan</option>
                  {tipeKaryawanOptions.map((t) => (
                    <option key={t} value={t} className="capitalize">
                      {t}
                    </option>
                  ))}
                </select>
              )}
              {filterDepartment && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  <span>{filterDepartment}</span>
                  <button
                    onClick={() => setFilterDepartment('')}
                    className="hover:text-blue-900 transition"
                  >
                    <IconX />
                  </button>
                </span>
              )}
              {filterDivisi && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  <span>{filterDivisi}</span>
                  <button
                    onClick={() => setFilterDivisi('')}
                    className="hover:text-amber-900 transition"
                  >
                    <IconX />
                  </button>
                </span>
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
                    setFilterDepartment('');
                    setFilterDivisi('');
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

          {/* Table */}
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 w-8">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500">
                    NIK
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500">
                    Nama
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500">
                    Department
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-500">
                    Total Upah
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-500">
                    Potongan
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-500">
                    TMK
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500">
                    Rincian Potongan
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-500">
                    Sub Total
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-slate-500">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((emp: any, i: number) => {
                  const bio = emp.karyawan?.biodata_karyawan?.[0];
                  const potonganBreakdown = getPotonganBreakdown(emp);
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
                          {bio?.nik ?? emp.nik ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800 text-xs">
                        {emp.karyawan?.name ?? emp.nama_karyawan ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {bio?.department?.nama_department ??
                          emp.department ??
                          '—'}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-emerald-700 font-semibold">
                        Rp {formatInteger(emp.total_upah ?? emp.sub_total_upah)}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-red-600 font-semibold">
                        {(emp.total_potongan ?? 0) > 0 ? (
                          `Rp ${formatInteger(emp.total_potongan)}`
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-blue-700 font-semibold">
                        {(emp.tmk ?? 0) > 0 ? (
                          `Rp ${formatInteger(emp.tmk)}`
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {potonganBreakdown.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-[180px]">
                            {potonganBreakdown.map((cat) => (
                              <span
                                key={cat.key}
                                title={`${cat.label}: Rp ${formatInteger(
                                  cat.total,
                                )}`}
                                className="inline-flex items-center text-[10px] font-semibold bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded-full whitespace-nowrap"
                              >
                                {cat.label} {cat.count}x
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
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
                      colSpan={10}
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
              {filtered.length} dari {totalKaryawan} karyawan
            </span>
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-500">Total Keseluruhan</span>
              <span className="font-bold text-slate-800">
                Rp {formatInteger(localPeriode.total)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {selectedEmployee && (
        <EmployeeDetailModal
          employee={selectedEmployee}
          periodeData={localPeriode}
          onClose={() => setSelectedEmployee(null)}
          onRefresh={refreshLocalPeriode}
          showToast={showToast}
        />
      )}
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function PengajuanPayrollBulan() {
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [payWeek, setPayWeek] = useState<any>(null);
  const [selectedPeriode, setSelectedPeriode] = useState<any>(null);
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
        `${import.meta.env.VITE_API_LINK}/hr/payroll/bayarBulananPeriode`,
        { params: { page, limit: 10 }, withCredentials: true },
      );
      console.log('fetchPayroll', res.data);
      setPayWeek(res.data);
    } catch {
      showToast('Gagal memuat data', 'error');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(id: number) {
    if (!confirm('Ajukan payroll bulanan ini untuk approval?')) return;
    setIsLoading(true);
    try {
      await axios.put(
        `${
          import.meta.env.VITE_API_LINK
        }/hr/payroll/bayarBulananPeriode/submit/${id}`,
        {},
        { withCredentials: true },
      );
      showToast('Payroll berhasil diajukan!');
      fetchPayroll();
      setSelectedPeriode(null);
    } catch {
      showToast('Gagal mengajukan', 'error');
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePay(id: number) {
    if (!confirm('Konfirmasi pembayaran payroll bulanan ini?')) return;
    setIsLoading(true);
    try {
      await axios.put(
        `${
          import.meta.env.VITE_API_LINK
        }/hr/payroll/bayarBulananPeriode/bayar/${id}`,
        {},
        { withCredentials: true },
      );
      showToast('Pembayaran berhasil!');
      fetchPayroll();
      setSelectedPeriode(null);
    } catch {
      showToast('Gagal membayar', 'error');
    } finally {
      setIsLoading(false);
    }
  }

  const totalPage = payWeek?.total_page ?? 1;
  const periodeList: any[] = payWeek?.data ?? [];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-30">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">
              Pengajuan Payroll Bulanan
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Daftar periode payroll — lihat detail, edit, dan ajukan
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
                const totalKaryawan =
                  periode.payroll_detail_bulanan?.length ?? 0;
                const isDraft = periode.status?.toLowerCase() === 'draft';
                const isIncomingPay =
                  periode.status?.toLowerCase() === 'incoming pay';
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
                            <IconCalendar />{' '}
                            {convertTimeStampToDate(periode.tgl_bayar)}
                          </span>
                          {periode.payroll_detail_bulanan?.[0]?.karyawan_hr
                            ?.name && (
                            <>
                              <span className="text-xs text-slate-400">·</span>
                              <span className="text-xs text-slate-400">
                                Disetujui:{' '}
                                {
                                  periode.payroll_detail_bulanan[0].karyawan_hr
                                    .name
                                }
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs text-slate-400">Total Gaji</div>
                        <div className="font-bold text-slate-800">
                          Rp {formatInteger(periode.total)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {isDraft && (
                          <button
                            onClick={() => handleSubmit(periode.id)}
                            className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 text-xs font-bold px-3 py-2 rounded-xl border border-blue-200 hover:border-blue-600 transition-all active:scale-95"
                          >
                            <IconSend /> Ajukan
                          </button>
                        )}
                        {isIncomingPay && (
                          <button
                            onClick={() => handlePay(periode.id)}
                            className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 text-xs font-bold px-3 py-2 rounded-xl border border-emerald-200 hover:border-emerald-600 transition-all active:scale-95"
                          >
                            <IconDollar /> Bayar
                          </button>
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
                            : 'w-1/4 bg-slate-300'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
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
            <p className="text-sm font-medium">
              Belum ada data pengajuan payroll bulanan
            </p>
            <p className="text-xs text-slate-300 mt-1">
              Buat payroll baru di tab Payroll Bulanan
            </p>
          </div>
        )}
      </div>

      {selectedPeriode && (
        <PeriodDetailModal
          periode={selectedPeriode}
          onClose={() => setSelectedPeriode(null)}
          onRefresh={fetchPayroll}
          onPay={handlePay}
          onSubmit={handleSubmit}
          showToast={showToast}
        />
      )}
    </div>
  );
}

export default PengajuanPayrollBulan;
