import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Loading from '../../Loading';
import Select from 'react-select';

// ─── Types & Constants ────────────────────────────────────────────────────────

type TabType = 'persiapan' | 'pemakaian';

// endpoint per tab
const ENDPOINT: Record<TabType, string> = {
  persiapan: '/gudangRM/tambahBahanPersiapan',
  pemakaian: '/gudangRM/tambahBahanPemakaian',
};

// field defect (nama array berbeda per tab)
const DEFECT_KEY: Record<TabType, string> = {
  persiapan: 'tambah_bahan_persiapan_defect',
  pemakaian: 'tambah_bahan_pemakaian_defect',
};

const STATUS_COMMON = [
  'request qc',
  'approve qc',
  'approve gudang',
  'reject qc',
  'reject gudang',
];

// "request qc pemakaian" hanya ada di tab Persiapan
const STATUS_OPTIONS: Record<TabType, { value: string; label: string }[]> = {
  persiapan: [
    { value: '', label: 'Semua' },
    ...[...STATUS_COMMON, 'request qc pemakaian', 'done'].map((s) => ({
      value: s,
      label: s,
    })),
  ],
  pemakaian: [
    { value: '', label: 'Semua' },
    ...[...STATUS_COMMON, 'done'].map((s) => ({ value: s, label: s })),
  ],
};

const STATUS_TIKET_OPTIONS = [
  { value: '', label: 'Semua' },
  { value: 'incoming', label: 'Incoming' },
  { value: 'history', label: 'History' },
];

// filter tanggal tambahan (key dipakai sebagai start_<key> / end_<key>)
const DATE_FILTERS: Record<TabType, { key: string; label: string }[]> = {
  persiapan: [
    { key: 'tgl_request', label: 'Tgl Request' },
    { key: 'tgl_qc', label: 'Tgl QC' },
    { key: 'tgl_gudang', label: 'Tgl Gudang' },
    { key: 'tgl_qc_pemakaian', label: 'Tgl QC Pemakaian' },
    { key: 'tgl_pakai', label: 'Tgl Pakai' },
  ],
  pemakaian: [
    { key: 'tgl_request', label: 'Tgl Request' },
    { key: 'tgl_qc', label: 'Tgl QC' },
    { key: 'tgl_gudang', label: 'Tgl Gudang' },
  ],
};

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

type DateRange = { start: string; end: string };
interface Filters {
  status: { value: string; label: string };
  statusTiket: { value: string; label: string };
  search: string;
  dates: Record<string, DateRange>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pad(n: number) {
  return String(n).padStart(2, '0');
}
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function firstOfMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-01`;
}
function fmtDateTime(iso: string | null | undefined) {
  if (!iso) return '-';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '-';
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

function buildDefaultFilters(): Filters {
  return {
    status: STATUS_OPTIONS.persiapan[0],
    statusTiket: STATUS_TIKET_OPTIONS[0],
    search: '',
    dates: {
      tgl_request: { start: firstOfMonth(), end: todayStr() },
    },
  };
}

// response list: { status, success, data: [...] }
function normalizeList(resData: any): any[] {
  return Array.isArray(resData?.data) ? resData.data : [];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    'request qc': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'approve qc': 'bg-blue-100 text-blue-700 border-blue-200',
    'approve gudang': 'bg-teal-100 text-teal-700 border-teal-200',
    'reject qc': 'bg-red-100 text-red-700 border-red-200',
    'reject gudang': 'bg-red-100 text-red-700 border-red-200',
    'request qc pemakaian': 'bg-orange-100 text-orange-700 border-orange-200',
    done: 'bg-green-100 text-green-700 border-green-200',
    incoming: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    history: 'bg-slate-100 text-slate-700 border-slate-200',
  };
  const cls = map[s] ?? 'bg-gray-100 text-gray-700 border-gray-200';
  return (
    <span
      className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full border whitespace-nowrap capitalize ${cls}`}
    >
      {status || '-'}
    </span>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function DetailModal({
  id,
  type,
  onClose,
}: {
  id: number;
  type: TabType;
  onClose: () => void;
}) {
  const [row, setRow] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // GET /gudangRM/tambahBahan{Persiapan|Pemakaian}/:id
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setIsLoading(true);
        setError(false);
        const res = await axios.get(
          `${import.meta.env.VITE_API_LINK}${ENDPOINT[type]}/${id}`,
          { withCredentials: true },
        );
        if (!cancelled) setRow(res.data?.data ?? null);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, type]);

  if (isLoading) return <Loading />;

  if (error || !row) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
          <p className="text-sm text-gray-700 mb-4">
            Gagal memuat detail tambah bahan.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    );
  }

  const jo = row.job_order;
  const defects: any[] = Array.isArray(row[DEFECT_KEY[type]])
    ? row[DEFECT_KEY[type]]
    : [];

  // Alur tiket: setiap step punya tanggal, user, dan catatan
  const steps: { title: string; tgl: any; user: any; note: any }[] = [
    {
      title: 'Request',
      tgl: row.tgl_request,
      user: row.user_request?.nama,
      note: row.note,
    },
    {
      title: 'QC',
      tgl: row.tgl_qc,
      user: row.user_qc?.nama,
      note: row.note_qc,
    },
    {
      title: 'Gudang',
      tgl: row.tgl_gudang,
      user: row.user_gudang?.nama,
      note: row.note_gudang,
    },
  ];
  if (type === 'persiapan') {
    steps.push(
      {
        title: 'Pakai',
        tgl: row.tgl_pakai,
        user: null,
        note: null,
      },
      {
        title: 'QC Pemakaian',
        tgl: row.tgl_qc_pemakaian,
        user: row.user_qc_pemakaian?.nama,
        note: row.note_qc_pemakaian,
      },
    );
  }

  const info: [string, any][] = [
    ['No JO', row.no_jo ?? jo?.no_jo],
    ['No SO', jo?.no_so],
    ['No IO', jo?.no_io],
    ['Customer', jo?.customer],
    ['Produk', jo?.produk],
    ['Kertas', row.nama_kertas],
    ['Status JO', jo?.status_jo],
    ['PO Qty', fmtQty(jo?.po_qty)],
    ['Qty Druk JO', fmtQty(jo?.qty_druk)],
    ['Qty LP JO', fmtQty(jo?.qty_lp)],
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-4 text-white rounded-t-2xl flex justify-between items-start flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold">
              Detail Tambah Bahan{' '}
              {type === 'persiapan' ? 'Persiapan' : 'Pemakaian'}
            </h3>
            <p className="text-violet-200 text-sm mt-0.5">{row.no_jo}</p>
            <p className="text-violet-200 text-xs mt-0.5 truncate max-w-md">
              {jo?.produk}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-violet-200 text-2xl font-bold leading-none ml-4"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto p-5 space-y-4">
          {/* Status */}
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={row.status} />
            <StatusBadge status={row.status_tiket} />
          </div>

          {/* Info JO */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Informasi JO
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              {info.map(([label, val]) => (
                <div key={label}>
                  <p className="text-gray-400 font-medium mb-0.5">{label}:</p>
                  <p className="text-gray-800 font-semibold">{val ?? '-'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Qty */}
          <div className="bg-sky-50 rounded-xl p-4 border border-sky-200">
            <h4 className="text-xs font-semibold text-sky-700 mb-3">
              Qty Tambah Bahan
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white rounded-lg border border-sky-200 px-3 py-2">
                <p className="text-gray-400 mb-0.5">Request Druk</p>
                <p className="font-bold text-blue-600">
                  {fmtQty(row.qty_tambah_bahan_druk)}
                </p>
              </div>
              <div className="bg-white rounded-lg border border-sky-200 px-3 py-2">
                <p className="text-gray-400 mb-0.5">Request LP</p>
                <p className="font-bold text-blue-600">
                  {fmtQty(row.qty_tambah_bahan_lp)}
                </p>
              </div>
              {type === 'persiapan' && (
                <>
                  <div className="bg-white rounded-lg border border-sky-200 px-3 py-2">
                    <p className="text-gray-400 mb-0.5">Pakai Druk</p>
                    <p className="font-bold text-indigo-600">
                      {fmtQty(row.qty_pakai_tambah_bahan_druk)}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg border border-sky-200 px-3 py-2">
                    <p className="text-gray-400 mb-0.5">Pakai LP</p>
                    <p className="font-bold text-indigo-600">
                      {fmtQty(row.qty_pakai_tambah_bahan_lp)}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Alur tiket */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Alur Tiket
            </h4>
            <div className="space-y-2">
              {steps.map((s) => {
                const done = !!s.tgl;
                return (
                  <div
                    key={s.title}
                    className={`rounded-lg border px-3 py-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs ${
                      done
                        ? 'bg-white border-green-200'
                        : 'bg-gray-50 border-gray-200 opacity-60'
                    }`}
                  >
                    <div>
                      <p className="text-gray-400 mb-0.5">Tahap</p>
                      <p className="font-semibold text-gray-800">{s.title}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-0.5">Tanggal</p>
                      <p className="font-medium text-gray-700">
                        {fmtDateTime(s.tgl)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-0.5">User</p>
                      <p className="font-medium text-gray-700">
                        {s.user || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-0.5">Catatan</p>
                      <p className="font-medium text-gray-700">
                        {s.note || '-'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Defect */}
          {defects.length > 0 && (
            <div className="bg-red-50 rounded-xl p-4 border border-red-200">
              <h4 className="text-xs font-semibold text-red-700 mb-3">
                Defect ({defects.length})
              </h4>
              <div className="space-y-1.5">
                {defects.map((d: any) => (
                  <div
                    key={d.id}
                    className="bg-white rounded-lg border border-red-200 grid grid-cols-2 sm:grid-cols-4 gap-2 px-3 py-2 text-xs"
                  >
                    <div>
                      <p className="text-gray-400 mb-0.5">Kode</p>
                      <p className="font-bold text-gray-800">{d.kode}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-0.5">Deskripsi</p>
                      <p className="font-medium text-gray-700">{d.deskripsi}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-0.5">Qty Druk</p>
                      <p className="font-bold text-red-600">
                        {fmtQty(d.qty_tambah_bahan_druk)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-0.5">Qty LP</p>
                      <p className="font-bold text-red-600">
                        {fmtQty(d.qty_tambah_bahan_lp)}
                      </p>
                    </div>
                  </div>
                ))}
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

// ─── Panel per tab (filter + tabel + pagination) ──────────────────────────────

function TambahBahanPanel({ type }: { type: TabType }) {
  const [isLoading, setIsLoading] = useState(false);
  const [rows, setRows] = useState<any[]>([]);

  // draft = isi form; applied = filter yang benar-benar dikirim ke API
  const [draft, setDraft] = useState<Filters>(() => {
    const f = buildDefaultFilters();
    f.status = STATUS_OPTIONS[type][0];
    return f;
  });
  const [applied, setApplied] = useState<Filters>(draft);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    const url = `${import.meta.env.VITE_API_LINK}${ENDPOINT[type]}`;
    const params: Record<string, any> = {
      status: applied.status.value || undefined,
      status_tiket: applied.statusTiket.value || undefined,
      search: applied.search.trim() || undefined,
    };
    Object.entries(applied.dates).forEach(([key, r]) => {
      if (r.start) params[`start_${key}`] = r.start;
      if (r.end) params[`end_${key}`] = r.end;
    });

    try {
      setIsLoading(true);
      const res = await axios.get(url, { params, withCredentials: true });
      setRows(normalizeList(res.data));
    } catch (err) {
      console.error(err);
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  }, [type, applied]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setDate = (key: string, field: 'start' | 'end', value: string) => {
    setDraft((prev) => ({
      ...prev,
      dates: {
        ...prev.dates,
        [key]: {
          ...(prev.dates[key] ?? { start: '', end: '' }),
          [field]: value,
        },
      },
    }));
  };

  const handleApply = () => {
    setApplied(draft);
  };

  const handleReset = () => {
    const f = buildDefaultFilters();
    f.status = STATUS_OPTIONS[type][0];
    setDraft(f);
    setApplied(f);
  };

  const dateFilters = DATE_FILTERS[type];
  const advancedFilters = dateFilters.filter((d) => d.key !== 'tgl_request');
  const activeAdvancedCount = useMemo(
    () =>
      advancedFilters.filter(
        (d) => draft.dates[d.key]?.start || draft.dates[d.key]?.end,
      ).length,
    [advancedFilters, draft.dates],
  );

  const inputCls =
    'w-full rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 sm:py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 transition-all';

  const colCount = type === 'persiapan' ? 11 : 9;

  return (
    <>
      {isLoading && <Loading />}
      {detailId != null && (
        <DetailModal
          id={detailId}
          type={type}
          onClose={() => setDetailId(null)}
        />
      )}

      {/* ── Filter Card ── */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden mb-4">
        <div className="p-3 sm:p-4 md:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs sm:text-sm text-gray-600 font-medium">
                Request Dari:
              </label>
              <input
                type="date"
                value={draft.dates.tgl_request?.start ?? ''}
                onChange={(e) =>
                  setDate('tgl_request', 'start', e.target.value)
                }
                className={inputCls}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs sm:text-sm text-gray-600 font-medium">
                Request Sampai:
              </label>
              <input
                type="date"
                value={draft.dates.tgl_request?.end ?? ''}
                onChange={(e) => setDate('tgl_request', 'end', e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs sm:text-sm text-gray-600 font-medium">
                Status:
              </label>
              <Select
                options={STATUS_OPTIONS[type]}
                value={draft.status}
                onChange={(sel: any) =>
                  setDraft((p) => ({
                    ...p,
                    status: sel ?? STATUS_OPTIONS[type][0],
                  }))
                }
                styles={customSelectStyles}
                className="text-xs sm:text-sm"
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs sm:text-sm text-gray-600 font-medium">
                Status Tiket:
              </label>
              <Select
                options={STATUS_TIKET_OPTIONS}
                value={draft.statusTiket}
                onChange={(sel: any) =>
                  setDraft((p) => ({
                    ...p,
                    statusTiket: sel ?? STATUS_TIKET_OPTIONS[0],
                  }))
                }
                styles={customSelectStyles}
                className="text-xs sm:text-sm"
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2 lg:col-span-4">
              <label className="text-xs sm:text-sm text-gray-600 font-medium">
                Cari:
              </label>
              <input
                type="text"
                value={draft.search}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, search: e.target.value }))
                }
                onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                placeholder="No JO..."
                className={inputCls}
              />
            </div>
          </div>

          {/* Filter tanggal lanjutan */}
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="text-xs sm:text-sm text-violet-600 hover:text-violet-800 font-medium mb-3"
          >
            {showAdvanced ? '▾' : '▸'} Filter tanggal lainnya
            {activeAdvancedCount > 0 && ` (${activeAdvancedCount} aktif)`}
          </button>
          {showAdvanced && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
              {advancedFilters.map((d) => (
                <div key={d.key} className="flex flex-col gap-2">
                  <label className="text-xs sm:text-sm text-gray-600 font-medium">
                    {d.label}:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={draft.dates[d.key]?.start ?? ''}
                      onChange={(e) => setDate(d.key, 'start', e.target.value)}
                      className={inputCls}
                    />
                    <span className="text-gray-400 text-xs">s/d</span>
                    <input
                      type="date"
                      value={draft.dates[d.key]?.end ?? ''}
                      onChange={(e) => setDate(d.key, 'end', e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-3 justify-end">
            <button
              onClick={handleReset}
              className="w-full sm:w-auto bg-red-500 hover:bg-red-600 transition-all rounded-lg px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white"
            >
              Reset Filter
            </button>
            <button
              onClick={handleApply}
              className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700 transition-all rounded-lg px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white"
            >
              Terapkan Filter
            </button>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-white text-base sm:text-lg font-bold">
            Data Tambah Bahan {type === 'persiapan' ? 'Persiapan' : 'Pemakaian'}
          </h3>
          <span className="text-sm text-white bg-white bg-opacity-20 px-3 py-0.5 rounded-full font-semibold whitespace-nowrap">
            {rows.length} Record
          </span>
        </div>

        <div className="overflow-x-auto max-h-[650px] overflow-y-auto">
          <table
            className={`w-full text-xs sm:text-sm ${
              type === 'persiapan' ? 'min-w-[1400px]' : 'min-w-[1050px]'
            }`}
          >
            <thead className="bg-white sticky top-0 z-10">
              <tr className="text-left text-xs font-semibold text-gray-600">
                <th className="p-2 sm:p-3 whitespace-nowrap">No</th>
                <th className="p-2 sm:p-3 whitespace-nowrap">No JO</th>
                <th className="p-2 sm:p-3 whitespace-nowrap">Kertas</th>
                <th className="p-2 sm:p-3 whitespace-nowrap">Qty Request</th>
                {type === 'persiapan' && (
                  <th className="p-2 sm:p-3 whitespace-nowrap">Qty Pakai</th>
                )}
                <th className="p-2 sm:p-3 whitespace-nowrap">Status</th>
                <th className="p-2 sm:p-3 whitespace-nowrap">Tgl Request</th>
                <th className="p-2 sm:p-3 whitespace-nowrap">Tgl QC</th>
                <th className="p-2 sm:p-3 whitespace-nowrap">Tgl Gudang</th>
                {type === 'persiapan' && (
                  <>
                    <th className="p-2 sm:p-3 whitespace-nowrap">Tgl Pakai</th>
                    <th className="p-2 sm:p-3 whitespace-nowrap">
                      Tgl QC Pemakaian
                    </th>
                  </>
                )}
                <th className="p-2 sm:p-3 whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={colCount + 1}
                    className="p-8 text-center text-gray-500 text-sm"
                  >
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                rows.map((row: any, i: number) => {
                  const rowBg = row.status?.startsWith('reject')
                    ? 'bg-red-50'
                    : row.status === 'done'
                    ? 'bg-green-50'
                    : '';
                  return (
                    <tr
                      key={row.id}
                      className={`border-b hover:bg-blue-50 transition-colors ${rowBg}`}
                    >
                      <td className="p-2 sm:p-3 text-xs text-gray-500">
                        {i + 1}
                      </td>
                      <td className="p-2 sm:p-3 text-xs">
                        <span
                          onClick={() => setDetailId(row.id)}
                          className="text-violet-600 hover:text-violet-800 hover:underline font-bold whitespace-nowrap cursor-pointer block"
                        >
                          {row.no_jo || '-'}
                        </span>
                        <StatusBadge status={row.status_tiket} />
                      </td>
                      <td className="p-2 sm:p-3 text-xs max-w-[180px]">
                        {row.nama_kertas || '-'}
                      </td>
                      <td className="p-2 sm:p-3 text-xs whitespace-nowrap">
                        <div className="font-semibold text-blue-600">
                          Druk: {fmtQty(row.qty_tambah_bahan_druk)}
                        </div>
                        <div className="text-[10px] text-gray-500">
                          LP: {fmtQty(row.qty_tambah_bahan_lp)}
                        </div>
                      </td>
                      {type === 'persiapan' && (
                        <td className="p-2 sm:p-3 text-xs whitespace-nowrap">
                          <div className="font-semibold text-indigo-600">
                            Druk: {fmtQty(row.qty_pakai_tambah_bahan_druk)}
                          </div>
                          <div className="text-[10px] text-gray-500">
                            LP: {fmtQty(row.qty_pakai_tambah_bahan_lp)}
                          </div>
                        </td>
                      )}
                      <td className="p-2 sm:p-3 text-xs">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="p-2 sm:p-3 text-xs whitespace-nowrap">
                        {fmtDateTime(row.tgl_request)}
                      </td>
                      <td className="p-2 sm:p-3 text-xs whitespace-nowrap">
                        {fmtDateTime(row.tgl_qc)}
                      </td>
                      <td className="p-2 sm:p-3 text-xs whitespace-nowrap">
                        {fmtDateTime(row.tgl_gudang)}
                      </td>
                      {type === 'persiapan' && (
                        <>
                          <td className="p-2 sm:p-3 text-xs whitespace-nowrap">
                            {fmtDateTime(row.tgl_pakai)}
                          </td>
                          <td className="p-2 sm:p-3 text-xs whitespace-nowrap">
                            {fmtDateTime(row.tgl_qc_pemakaian)}
                          </td>
                        </>
                      )}
                      <td className="p-2 sm:p-3 text-xs">
                        <button
                          onClick={() => setDetailId(row.id)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-violet-600 hover:text-violet-800 hover:bg-violet-50 border border-violet-200 transition-colors"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function TambahBahanMonitoring() {
  const [tab, setTab] = useState<TabType>('persiapan');

  const tabs: { key: TabType; label: string }[] = [
    { key: 'persiapan', label: 'Persiapan' },
    { key: 'pemakaian', label: 'Pemakaian' },
  ];

  return (
    <main>
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Monitoring Tambah Bahan
          </h2>
        </div>
        <div className="flex border-b border-gray-200 bg-gray-50">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-6 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                tab === t.key
                  ? 'border-violet-600 text-violet-700 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* key={tab} → state filter/pagination dipisah dan di-reset per tab */}
      <TambahBahanPanel key={tab} type={tab} />
    </main>
  );
}

export default TambahBahanMonitoring;
