import React, { useEffect, useState } from 'react';
import axios from 'axios';
import convertTimeStampToDate from '../../../../utils/convertDate';
import formatInteger from '../../../../utils/formaterInteger';

// ─── Icons ────────────────────────────────────────────────────────────────────
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
const IconSearch = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
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
const IconUser = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const IconChevron = ({ open }: { open: boolean }) => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    style={{
      transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
      transition: 'transform 0.2s',
    }}
  >
    <polyline points="6 9 12 15 18 9" />
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

// ─── Spinner ──────────────────────────────────────────────────────────────────
const Spinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-9 h-9 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
  </div>
);

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ msg, type }: { msg: string; type: 'success' | 'error' }) => (
  <div
    className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-medium
    ${
      type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-500 text-white'
    }`}
  >
    <span className="text-base">{type === 'success' ? '✓' : '✕'}</span>
    {msg}
  </div>
);

// ─── Potongan Otomatis (absensi-based deduction) helpers ──────────────────────
// summaryPayroll returns several arrays of auto-generated deductions derived
// from attendance, each shaped as { label, jumlah, nilai, total }.
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
  { key: 'potongan_terlambat', label: 'Pulang Cepat' },

  { key: 'potonganPinjaman', label: 'Pinjaman' },
  { key: 'potongan', label: 'Lainnya' },
];

function getPotonganBreakdown(summaryPayroll: any) {
  if (!summaryPayroll) return [];
  return POTONGAN_CATEGORIES.map(({ key, label }) => {
    const items: PotonganItem[] = Array.isArray(summaryPayroll[key])
      ? summaryPayroll[key]
      : [];
    const total = items.reduce((sum, it) => sum + Number(it.total || 0), 0);
    return { key, label, items, total, count: items.length };
  }).filter((cat) => cat.count > 0);
}

// ─── Add Item Form ────────────────────────────────────────────────────────────
interface AddItemFormProps {
  idPayrollBulanan: number;
  onSuccess: () => void;
  onClose: () => void;
}
function AddItemForm({
  idPayrollBulanan,
  onSuccess,
  onClose,
}: AddItemFormProps) {
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
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
              }`}
            >
              {t === 'bayaran' ? '＋ Bayaran' : '－ Potongan'}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
          Label / Keterangan
        </label>
        <input
          type="text"
          value={form.label}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
          placeholder="cth: Bonus Kehadiran, Kasbon, dll"
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
            Nilai / Satuan (Rp)
          </label>
          <input
            type="number"
            min={0}
            value={form.nilai}
            onChange={(e) => setForm({ ...form, nilai: e.target.value })}
            placeholder="0"
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div
        className={`rounded-xl px-4 py-3 flex justify-between items-center border
        ${
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
function PotonganBreakdownGrid({ summaryPayroll }: { summaryPayroll: any }) {
  const breakdown = getPotonganBreakdown(summaryPayroll);
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
interface EmployeeDetailModalProps {
  data: any; // one item from filteredData (has summaryPayroll, detailAbsensi)
  payWeek: any;
  isDraft: boolean;
  onClose: () => void;
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}
function EmployeeDetailModal({
  data,
  payWeek,
  isDraft,
  onClose,
  onRefresh,
  showToast,
}: EmployeeDetailModalProps) {
  const [showRincian, setShowRincian] = useState(false);
  const [showAbsen, setShowAbsen] = useState(false);
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // The id for add/delete is the payroll_detail_bulanan id.
  // data.summaryPayroll doesn't expose an id directly, so fall back to data.id
  // (present once the period has been saved as payroll_detail_bulanan).
  const payrollDetailId = data.id ?? data.summaryPayroll?.id;

  async function deleteDetail(idDetail: number) {
    if (!confirm('Hapus item ini?')) return;
    setIsDeleting(true);
    try {
      await axios.put(
        `${
          import.meta.env.VITE_API_LINK
        }/hr/payroll/bayarBulanan/detail/delete`,
        {
          id_payroll_bulanan: payrollDetailId,
          id_payroll_bulanan_detail: idDetail,
        },
        { withCredentials: true },
      );
      showToast('Item berhasil dihapus');
      onRefresh();
    } catch {
      showToast('Gagal menghapus item', 'error');
    } finally {
      setIsDeleting(false);
    }
  }

  // detail_payroll array (manual items added post-save) for add/delete
  const detailPayrollBayaran =
    data.detail_payroll?.filter((d: any) => d.tipe === 'bayaran') ?? [];
  const detailPayrollPotongan =
    data.detail_payroll?.filter((d: any) => d.tipe === 'potongan') ?? [];
  const hasDetailPayroll =
    data.detail_payroll && data.detail_payroll.length > 0;
  const hasRincianPendapatan = data.summaryPayroll?.rincian?.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200 flex-shrink-0">
          <div>
            <h2 className="font-bold text-slate-800">
              {data.summaryPayroll?.nama_karyawan}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              NIK {data.summaryPayroll?.nik} · {data.summaryPayroll?.department}{' '}
              / {data.summaryPayroll?.divisi}
            </p>
            <div className="flex items-center gap-2 mt-1">
              {data.summaryPayroll?.tipe_penggajian && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-50 text-violet-700 border border-violet-200 capitalize">
                  {data.summaryPayroll.tipe_penggajian}
                </span>
              )}
              {data.summaryPayroll?.tipe_karyawan && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200 capitalize">
                  {data.summaryPayroll.tipe_karyawan}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition"
          >
            <IconX />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: 'Total Upah',
                value: `Rp ${formatInteger(data.summaryPayroll?.total)}`,
                cls: 'bg-blue-50 border-blue-200 text-blue-700',
              },
              {
                label: 'Total Potongan',
                value: `Rp ${formatInteger(
                  data.summaryPayroll?.total_potongan,
                )}`,
                cls: 'bg-red-50 border-red-200 text-red-700',
              },
              {
                label: 'Sub Total',
                value: `Rp ${formatInteger(data.summaryPayroll?.sub_total)}`,
                cls: 'bg-emerald-50 border-emerald-200 text-emerald-700',
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

          {/* Period info */}
          <div className="bg-slate-50 rounded-xl px-4 py-3 flex items-center gap-2 text-xs text-slate-600">
            <IconCalendar />
            <span className="font-semibold">
              {convertTimeStampToDate(payWeek?.periode_dari)} —{' '}
              {convertTimeStampToDate(payWeek?.periode_sampai)}
            </span>
          </div>

          {/* Toggle buttons */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setShowRincian(!showRincian)}
              className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg border transition-all ${
                showRincian
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400'
              }`}
            >
              <IconEye />{' '}
              {showRincian ? 'Sembunyikan Rincian' : 'Lihat Rincian'}
              <IconChevron open={showRincian} />
            </button>
            <button
              onClick={() => setShowAbsen(!showAbsen)}
              className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg border transition-all ${
                showAbsen
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400'
              }`}
            >
              <IconCalendar />{' '}
              {showAbsen ? 'Sembunyikan Absensi' : 'Lihat Absensi'}
              <IconChevron open={showAbsen} />
            </button>
          </div>

          {/* Rincian Payroll */}
          {showRincian && (
            <div className="space-y-4">
              {/* Auto-computed breakdown, straight from summaryPayroll */}
              {hasRincianPendapatan && (
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <div className="bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider px-3 py-2">
                    Rincian Pendapatan
                  </div>
                  <div className="divide-y divide-slate-100">
                    {data.summaryPayroll.rincian.map((r: any, ii: number) => (
                      <div
                        key={ii}
                        className="flex justify-between px-3 py-2 text-xs"
                      >
                        <span className="text-slate-600">
                          {r.label} × {r.jumlah}
                        </span>
                        <span className="font-semibold text-emerald-700">
                          Rp {formatInteger(r.total)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <PotonganBreakdownGrid summaryPayroll={data.summaryPayroll} />

              {/* Manual items added via "Tambah Bayaran / Potongan" (post-save) */}
              {hasDetailPayroll && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Item Manual
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <DetailTable
                      title="Pendapatan"
                      color="emerald"
                      items={detailPayrollBayaran}
                      canDelete={isDraft}
                      onDelete={deleteDetail}
                    />
                    <DetailTable
                      title="Potongan"
                      color="red"
                      items={detailPayrollPotongan}
                      canDelete={isDraft}
                      onDelete={deleteDetail}
                    />
                  </div>
                </div>
              )}

              {/* Add item button */}
              {isDraft &&
                payrollDetailId &&
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
                      idPayrollBulanan={payrollDetailId}
                      onSuccess={() => {
                        setAddItemOpen(false);
                        onRefresh();
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
          )}

          {/* Absensi Table */}
          {showAbsen && (
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Detail Absensi
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      {[
                        'No',
                        'Tanggal',
                        'Masuk',
                        'Keluar',
                        'Shift',
                        'Lembur',
                        'Terlambat',
                        'Status',
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-3 py-2 text-left font-bold text-slate-500"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.detailAbsensi?.map((ab: any, ii: number) => (
                      <tr key={ii} className="hover:bg-slate-50">
                        <td className="px-3 py-2 text-slate-400">{ii + 1}</td>
                        <td className="px-3 py-2 font-medium">
                          {ab.tgl_masuk}
                        </td>
                        <td className="px-3 py-2">{ab.jam_masuk || '-'}</td>
                        <td className="px-3 py-2">{ab.jam_keluar || '-'}</td>
                        <td className="px-3 py-2">{ab.shift || '-'}</td>
                        <td className="px-3 py-2">
                          {ab.status_lembur || '-'}
                          {ab.jam_lembur ? ` (${ab.jam_lembur}j)` : ''}
                        </td>
                        <td className="px-3 py-2">
                          {ab.status_masuk}
                          {ab.menit_terlambat > 0 && (
                            <div className="text-red-500">
                              {ab.menit_terlambat} Jam
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                              ab.status_absen === 'Hadir'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : ab.status_absen === 'Izin'
                                ? 'bg-sky-50 text-sky-700 border-sky-200'
                                : ab.status_absen === 'Sakit'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}
                          >
                            {ab.status_absen}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {(!data.detailAbsensi ||
                      data.detailAbsensi.length === 0) && (
                      <tr>
                        <td
                          colSpan={8}
                          className="text-center py-8 text-slate-400"
                        >
                          Tidak ada data absensi
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
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

// ─── Main Component ───────────────────────────────────────────────────────────
function PayrollBulan() {
  const [isLoading, setIsLoading] = useState(false);
  const [payWeek, setPayWeek] = useState<any>(null);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterDiv, setFilterDiv] = useState('');
  const [filterTipePenggajian, setFilterTipePenggajian] = useState('');
  const [filterTipeKaryawan, setFilterTipeKaryawan] = useState('');
  const [openModal, setOpenModal] = useState<number | null>(null);
  const [periodStatus, setPeriodStatus] = useState<
    'idle' | 'checking' | 'ok' | 'exists'
  >('idle');
  const [toast, setToast] = useState<{
    msg: string;
    type: 'success' | 'error';
  } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Sync filtered data
  useEffect(() => {
    if (!payWeek?.detail) {
      setFilteredData([]);
      return;
    }
    let list = payWeek.detail as any[];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (d) =>
          d.summaryPayroll?.nama_karyawan?.toLowerCase().includes(q) ||
          d.summaryPayroll?.nik?.toString().includes(q),
      );
    }
    if (filterDept)
      list = list.filter((d) => d.summaryPayroll?.department === filterDept);
    if (filterDiv)
      list = list.filter((d) => d.summaryPayroll?.divisi === filterDiv);
    if (filterTipePenggajian)
      list = list.filter(
        (d) => d.summaryPayroll?.tipe_penggajian === filterTipePenggajian,
      );
    if (filterTipeKaryawan)
      list = list.filter(
        (d) => d.summaryPayroll?.tipe_karyawan === filterTipeKaryawan,
      );
    setFilteredData(list);
  }, [
    payWeek,
    searchQuery,
    filterDept,
    filterDiv,
    filterTipePenggajian,
    filterTipeKaryawan,
  ]);

  const departments: string[] = payWeek
    ? ([
        ...new Set(
          (payWeek.detail as any[])
            .map((d) => d.summaryPayroll?.department)
            .filter(Boolean),
        ),
      ] as string[])
    : [];

  const divisions: string[] = payWeek
    ? ([
        ...new Set(
          (payWeek.detail as any[])
            .map((d) => d.summaryPayroll?.divisi)
            .filter(Boolean),
        ),
      ] as string[])
    : [];

  const tipePenggajianOptions: string[] = payWeek
    ? ([
        ...new Set(
          (payWeek.detail as any[])
            .map((d) => d.summaryPayroll?.tipe_penggajian)
            .filter(Boolean),
        ),
      ] as string[])
    : [];

  const tipeKaryawanOptions: string[] = payWeek
    ? ([
        ...new Set(
          (payWeek.detail as any[])
            .map((d) => d.summaryPayroll?.tipe_karyawan)
            .filter(Boolean),
        ),
      ] as string[])
    : [];

  async function checkAndFetch() {
    if (!dateFrom || !dateTo) {
      showToast('Pilih tanggal dari & sampai', 'error');
      return;
    }
    setPeriodStatus('checking');
    setIsLoading(true);
    // Reset filters when loading new data
    setFilterDept('');
    setFilterDiv('');
    setFilterTipePenggajian('');
    setFilterTipeKaryawan('');
    setSearchQuery('');
    try {
      await axios.get(
        `${import.meta.env.VITE_API_LINK}/hr/payroll/checkBayarBulananPeriode`,
        {
          params: { periode_dari: dateFrom, periode_sampai: dateTo },
          withCredentials: true,
        },
      );
      setPeriodStatus('ok');
      const res = await axios.get(
        `${import.meta.env.VITE_API_LINK}/hr/payrollBulananAll`,
        {
          params: { startDate: dateFrom, endDate: dateTo },
          withCredentials: true,
        },
      );
      console.log('response', res.data);
      setPayWeek(res.data.data);
      showToast('Data payroll bulanan berhasil dimuat');
    } catch (err: any) {
      if (err.response?.status === 404) {
        setPeriodStatus('exists');
        showToast('Periode ini sudah pernah dibuat sebelumnya', 'error');
      } else {
        showToast('Gagal memuat data', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function submitPayroll() {
    if (!payWeek) return;
    setIsLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_LINK}/hr/payroll/bayarBulananPeriode`,
        { data_payroll: payWeek },
        { withCredentials: true },
      );
      showToast('Payroll berhasil disimpan sebagai draft!');
      setPayWeek(null);
      setPeriodStatus('idle');
    } catch {
      showToast('Gagal menyimpan payroll', 'error');
    } finally {
      setIsLoading(false);
    }
  }

  const selectedData = openModal !== null ? filteredData[openModal] : null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div>
          <h1 className="text-lg font-bold text-slate-800 tracking-tight">
            Payroll Bulanan
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Generate & simpan payroll berdasarkan periode bulanan
          </p>
        </div>
        {payWeek && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-slate-400">Total Gaji</div>
              <div className="text-base font-bold text-blue-700">
                Rp {formatInteger(payWeek.total)}
              </div>
            </div>
            <button
              onClick={submitPayroll}
              className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 active:scale-95 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all shadow-sm"
            >
              <IconSend /> Simpan Draft Payroll
            </button>
          </div>
        )}
      </div>

      <div className="px-6 py-5 max-w-7xl mx-auto">
        {/* Period Picker */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-5">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Dari
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <IconCalendar />
                </span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Sampai
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <IconCalendar />
                </span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>
            <button
              onClick={checkAndFetch}
              disabled={isLoading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
            >
              <IconSearch />
              {isLoading ? 'Memuat...' : 'Cek & Muat Periode'}
            </button>
          </div>
          {periodStatus === 'exists' && (
            <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              ⚠ Periode ini sudah dibuat. Silakan cek tab{' '}
              <strong>Pengajuan</strong>.
            </div>
          )}
        </div>

        {isLoading && <Spinner />}

        {!isLoading && payWeek && (
          <>
            {/* Period info bar + filters */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2">
                <IconCalendar />
                <span className="text-sm font-semibold text-blue-800">
                  {convertTimeStampToDate(payWeek.periode_dari)} —{' '}
                  {convertTimeStampToDate(payWeek.periode_sampai)}
                </span>
                <span className="ml-3 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                  {filteredData.length} karyawan
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <IconSearch />
                  </span>
                  <input
                    type="text"
                    placeholder="Cari nama / NIK…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl bg-white w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <IconFilter />
                  </span>
                  <select
                    value={filterDept}
                    onChange={(e) => setFilterDept(e.target.value)}
                    className="pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-xl bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Semua Department</option>
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <IconFilter />
                  </span>
                  <select
                    value={filterDiv}
                    onChange={(e) => setFilterDiv(e.target.value)}
                    className="pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-xl bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Semua Divisi</option>
                    {divisions.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                {/* <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
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
                </div> */}
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
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
                {(filterDept ||
                  filterDiv ||
                  filterTipePenggajian ||
                  filterTipeKaryawan ||
                  searchQuery) && (
                  <button
                    onClick={() => {
                      setFilterDept('');
                      setFilterDiv('');
                      setFilterTipePenggajian('');
                      setFilterTipeKaryawan('');
                      setSearchQuery('');
                    }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-red-600 bg-slate-100 hover:bg-red-50 border border-slate-200 hover:border-red-200 px-3 py-2 rounded-xl transition-all"
                  >
                    <IconX /> Reset Filter
                  </button>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-10">
                        #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        NIK
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Nama
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Divisi
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Tipe Penggajian
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Tipe Karyawan
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Potongan
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Rincian Potongan
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Total Gaji
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredData.map((data: any, i: number) => {
                      const potonganBreakdown = getPotonganBreakdown(
                        data.summaryPayroll,
                      );
                      return (
                        <tr
                          key={i}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-4 py-3 text-slate-400 font-medium">
                            {i + 1}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                              {data.summaryPayroll?.nik}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 flex-shrink-0">
                                <IconUser />
                              </div>
                              <span className="font-medium text-slate-800">
                                {data.summaryPayroll?.nama_karyawan}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-600 text-xs">
                            {data.summaryPayroll?.department}
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-xs">
                            {data.summaryPayroll?.divisi}
                          </td>
                          <td className="px-4 py-3">
                            {data.summaryPayroll?.tipe_penggajian ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-violet-50 text-violet-700 border border-violet-200 capitalize">
                                {data.summaryPayroll.tipe_penggajian}
                              </span>
                            ) : (
                              <span className="text-slate-300 text-xs">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {data.summaryPayroll?.tipe_karyawan ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200 capitalize">
                                {data.summaryPayroll.tipe_karyawan}
                              </span>
                            ) : (
                              <span className="text-slate-300 text-xs">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right text-xs text-red-600 font-semibold">
                            {(data.summaryPayroll?.total_potongan ?? 0) > 0 ? (
                              `Rp ${formatInteger(
                                data.summaryPayroll.total_potongan,
                              )}`
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
                          <td className="px-4 py-3 text-right">
                            <span className="font-semibold text-slate-800">
                              Rp {formatInteger(data.summaryPayroll?.sub_total)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => setOpenModal(i)}
                              className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                            >
                              <IconEye /> Detail
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredData.length === 0 && (
                  <div className="text-center py-16 text-slate-400 text-sm">
                    Tidak ada data yang sesuai filter
                  </div>
                )}
              </div>
            </div>

            {/* Bottom summary bar */}
            <div className="mt-4 flex items-center justify-between bg-blue-700 rounded-2xl px-5 py-3 text-white">
              <span className="text-sm opacity-80">
                {filteredData.length} karyawan ·{' '}
                {convertTimeStampToDate(payWeek.periode_dari)} —{' '}
                {convertTimeStampToDate(payWeek.periode_sampai)}
              </span>
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-xs opacity-70">Total Seluruh Gaji</div>
                  <div className="text-xl font-bold">
                    Rp {formatInteger(payWeek?.total)}
                  </div>
                </div>
                <button
                  onClick={submitPayroll}
                  className="flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 text-sm font-bold px-5 py-2.5 rounded-xl transition-all active:scale-95 shadow"
                >
                  <IconSend /> Simpan Draft Payroll
                </button>
              </div>
            </div>
          </>
        )}

        {!isLoading && !payWeek && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <IconCalendar />
            </div>
            <p className="text-sm font-medium">
              Pilih periode untuk memuat data payroll bulanan
            </p>
          </div>
        )}
      </div>

      {/* Employee Detail Modal */}
      {openModal !== null && selectedData && (
        <EmployeeDetailModal
          data={selectedData}
          payWeek={payWeek}
          isDraft={true}
          onClose={() => setOpenModal(null)}
          onRefresh={() => {
            /* re-fetch if needed */
          }}
          showToast={showToast}
        />
      )}
    </div>
  );
}

export default PayrollBulan;
