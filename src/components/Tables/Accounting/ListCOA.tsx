import axios from 'axios';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { SearchIcon, Spinner } from '../Accounting/InvoiceAP/ui';
import { API, formatCurrency } from './InvoiceAP/utils';

/* =============================================================================
 * Chart of Accounts (COA)
 *  - GET  /masterCoaTree        -> tree (params: branch, show_inactive, search,
 *                                  tipe_akun, page, limit)
 *  - GET  /masterCoa?tipe=header-> daftar header untuk "Sub Account of"
 *  - POST /masterCoa            -> buat akun
 *  - PUT  /masterCoa/:id        -> ubah akun
 *  - PUT  /masterCoa/active/:id -> aktif / nonaktif
 * ========================================================================== */

type TipeNode = 'header' | 'detail';

interface COANode {
  id: number;
  id_parent: number | null;
  tipe_akun: string;
  kode_akun: string;
  nama_akun: string;
  tipe: TipeNode;
  level: number;
  branch: string;
  currency: string;
  no_rekening: string | null;
  opening_balance: number | string | null;
  opening_balance_date: string | null;
  is_active: boolean;
  balance: number | string | null;
  sub_account: COANode[];
}

interface COAHeader {
  id: number;
  tipe_akun: string;
  kode_akun: string;
  nama_akun: string;
}

interface COAForm {
  tipe_akun: string;
  kode_akun: string;
  nama_akun: string;
  tipe: TipeNode;
  id_parent: string;
  branch: string;
  currency: string;
  no_rekening: string;
  note: string;
  opening_balance: string;
  opening_balance_date: string;
  is_active: boolean;
}

// Pengelompokan tipe akun (sidebar "Account Type"). Sesuaikan dengan nilai
// tipe_akun yang dikenali backend.
const TYPE_GROUPS: { group: string; types: string[] }[] = [
  {
    group: 'Asset',
    types: [
      'Cash/Bank',
      'Account Receivable',
      'Inventory',
      'Other Current Asset',
      'Fixed Asset',
      'Accumulated Depreciation',
      'Other Asset',
    ],
  },
  {
    group: 'Liability',
    types: [
      'Credit Card',
      'Account Payables',
      'Other Current Liability',
      'Long Term Liability',
      'Other Liability',
    ],
  },
  { group: 'Equity', types: ['Equity'] },
  { group: 'Income', types: ['Income'] },
  { group: 'Cost of Goods Sold', types: ['Cost of Goods Sold'] },
  { group: 'Expense', types: ['Expense'] },
  { group: 'Other Income', types: ['Other Income'] },
  { group: 'Other Expense', types: ['Other Expense'] },
  { group: 'Income Tax', types: ['Income Tax'] },
  {
    group: 'Other Income (Comprehensive)',
    types: ['Other Income (Comprehensive)'],
  },
];

const ALL_TYPES = TYPE_GROUPS.flatMap((g) => g.types);
const PAGE_SIZES = [10, 25, 50, 100];

const todayISO = (): string => new Date().toISOString().slice(0, 10);

const emptyForm = (tipeAkun = ''): COAForm => ({
  tipe_akun: tipeAkun || ALL_TYPES[0],
  kode_akun: '',
  nama_akun: '',
  tipe: 'detail',
  id_parent: '',
  branch: 'Main',
  currency: 'IDR',
  no_rekening: '',
  note: '',
  opening_balance: '0',
  opening_balance_date: todayISO(),
  is_active: true,
});

const errMsg = (e: unknown, fallback: string): string => {
  const err = e as { response?: { data?: { message?: string } } };
  return err?.response?.data?.message || fallback;
};

// Ratakan tree menjadi baris yang terlihat, mengikuti state collapse.
interface FlatRow {
  node: COANode;
  depth: number;
  hasChildren: boolean;
}
const flatten = (
  nodes: COANode[],
  collapsed: Set<number>,
  depth = 0,
  out: FlatRow[] = [],
): FlatRow[] => {
  nodes.forEach((node) => {
    const children = node.sub_account ?? [];
    out.push({ node, depth, hasChildren: children.length > 0 });
    if (children.length > 0 && !collapsed.has(node.id)) {
      flatten(children, collapsed, depth + 1, out);
    }
  });
  return out;
};

const collectHeaderIds = (nodes: COANode[], out: number[] = []): number[] => {
  nodes.forEach((n) => {
    if ((n.sub_account ?? []).length > 0) {
      out.push(n.id);
      collectHeaderIds(n.sub_account, out);
    }
  });
  return out;
};

const countNodes = (nodes: COANode[]): number =>
  nodes.reduce((s, n) => s + 1 + countNodes(n.sub_account ?? []), 0);

/* ------------------------------ Form modal ------------------------------- */

interface COAModalProps {
  editing: COANode | null;
  defaultTipeAkun: string;
  defaultBranch: string;
  onClose: () => void;
  onSuccess: () => void;
}

const inputCls =
  'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:bg-gray-100 disabled:text-gray-500';

const Field: React.FC<{
  label: string;
  required?: boolean;
  children: React.ReactNode;
}> = ({ label, required, children }) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1">
      {label}
      {required && <span className="text-red-500"> *</span>}
    </label>
    {children}
  </div>
);

const COAModal: React.FC<COAModalProps> = ({
  editing,
  defaultTipeAkun,
  defaultBranch,
  onClose,
  onSuccess,
}) => {
  const [form, setForm] = useState<COAForm>(() =>
    editing
      ? {
          tipe_akun: editing.tipe_akun,
          kode_akun: editing.kode_akun,
          nama_akun: editing.nama_akun,
          tipe: editing.tipe,
          id_parent: editing.id_parent ? String(editing.id_parent) : '',
          branch: editing.branch || 'Main',
          currency: editing.currency || 'IDR',
          no_rekening: editing.no_rekening ?? '',
          note: '',
          opening_balance: String(Number(editing.opening_balance ?? 0)),
          opening_balance_date:
            editing.opening_balance_date?.slice(0, 10) || todayISO(),
          is_active: editing.is_active,
        }
      : { ...emptyForm(defaultTipeAkun), branch: defaultBranch || 'Main' },
  );
  const [noteTouched, setNoteTouched] = useState<boolean>(false);
  const [headers, setHeaders] = useState<COAHeader[]>([]);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let alive = true;
    axios
      .get(`${API}/masterCoa`, {
        params: { tipe: 'header' },
        withCredentials: true,
      })
      .then((res) => {
        if (alive)
          setHeaders(Array.isArray(res.data?.data) ? res.data.data : []);
      })
      .catch(() => alive && setHeaders([]));
    return () => {
      alive = false;
    };
  }, []);

  const set = <K extends keyof COAForm>(k: K, v: COAForm[K]): void =>
    setForm((p) => ({ ...p, [k]: v }));

  // "Sub Account of": header dengan tipe akun yang sama, bukan dirinya sendiri.
  const parentOptions = useMemo(
    () =>
      headers.filter(
        (h) => h.tipe_akun === form.tipe_akun && h.id !== editing?.id,
      ),
    [headers, form.tipe_akun, editing],
  );

  const isBank = form.tipe_akun === 'Cash/Bank';

  const handleSave = async (): Promise<void> => {
    if (!form.kode_akun.trim()) return setError('Kode akun wajib diisi.');
    if (!form.nama_akun.trim()) return setError('Deskripsi akun wajib diisi.');

    const payload: Record<string, unknown> = {
      tipe_akun: form.tipe_akun,
      kode_akun: form.kode_akun.trim(),
      nama_akun: form.nama_akun.trim(),
      tipe: form.tipe,
      id_parent: form.id_parent ? Number(form.id_parent) : null,
      branch: form.branch || 'Main',
      currency: form.currency || 'IDR',
      no_rekening: form.no_rekening.trim(),
      opening_balance:
        form.tipe === 'detail' ? Number(form.opening_balance || 0) : 0,
      opening_balance_date:
        form.tipe === 'detail' ? form.opening_balance_date || null : null,
    };
    // Tree API tidak mengembalikan note: saat edit, kirim hanya bila diubah
    // supaya catatan lama tidak tertimpa kosong.
    if (!editing || noteTouched) payload.note = form.note;

    try {
      setSaving(true);
      setError('');
      if (editing) {
        await axios.put(`${API}/masterCoa/${editing.id}`, payload, {
          withCredentials: true,
        });
        if (editing.is_active !== form.is_active) {
          await axios.put(
            `${API}/masterCoa/active/${editing.id}`,
            { is_active: form.is_active },
            { withCredentials: true },
          );
        }
      } else {
        await axios.post(`${API}/masterCoa`, payload, {
          withCredentials: true,
        });
      }
      onSuccess();
    } catch (e) {
      setError(errMsg(e, 'Gagal menyimpan akun. Periksa data lalu coba lagi.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h2 className="text-base font-bold text-gray-900">
            {editing ? 'Ubah akun' : 'Akun baru'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-lg leading-none"
            aria-label="Tutup"
          >
            ✕
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          {error && (
            <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <Field label="Tipe akun" required>
                <select
                  value={form.tipe_akun}
                  onChange={(e) => {
                    set('tipe_akun', e.target.value);
                    set('id_parent', '');
                  }}
                  className={inputCls}
                >
                  {TYPE_GROUPS.map((g) => (
                    <optgroup key={g.group} label={g.group}>
                      {g.types.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Jenis">
              <div className="flex items-center gap-4 border border-gray-300 rounded-lg px-3 py-2 text-sm">
                {(['header', 'detail'] as const).map((t) => (
                  <label key={t} className="inline-flex items-center gap-1.5">
                    <input
                      type="radio"
                      name="coa-tipe"
                      checked={form.tipe === t}
                      onChange={() => set('tipe', t)}
                      className="accent-violet-600"
                    />
                    {t === 'header' ? 'Header' : 'Detail'}
                  </label>
                ))}
              </div>
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Kode" required>
              <input
                value={form.kode_akun}
                onChange={(e) => set('kode_akun', e.target.value)}
                placeholder="101-1001"
                className={inputCls}
              />
            </Field>
            <Field label="Sub account of">
              <select
                value={form.id_parent}
                onChange={(e) => set('id_parent', e.target.value)}
                className={inputCls}
              >
                <option value="">— Tanpa induk —</option>
                {parentOptions.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.kode_akun} · {h.nama_akun}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Deskripsi" required>
            <input
              value={form.nama_akun}
              onChange={(e) => set('nama_akun', e.target.value)}
              placeholder="Nama akun"
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Branch">
              <input
                value={form.branch}
                onChange={(e) => set('branch', e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Currency">
              <input
                value={form.currency}
                onChange={(e) => set('currency', e.target.value.toUpperCase())}
                className={inputCls}
              />
            </Field>
            <Field label="No. rekening bank">
              <input
                value={form.no_rekening}
                onChange={(e) => set('no_rekening', e.target.value)}
                placeholder={isBank ? '1234567890' : '-'}
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="Catatan">
            <textarea
              rows={3}
              value={form.note}
              onChange={(e) => {
                setNoteTouched(true);
                set('note', e.target.value);
              }}
              placeholder={
                editing ? 'Kosongkan bila catatan tidak diubah' : undefined
              }
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Opening balance">
              <input
                type="number"
                value={form.opening_balance}
                disabled={form.tipe === 'header'}
                onChange={(e) => set('opening_balance', e.target.value)}
                className={`${inputCls} text-right`}
              />
            </Field>
            <Field label="Per tanggal">
              <input
                type="date"
                value={form.opening_balance_date}
                disabled={form.tipe === 'header'}
                onChange={(e) => set('opening_balance_date', e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>
          {form.tipe === 'header' && (
            <p className="text-xs text-gray-500 -mt-2">
              Saldo akun header dihitung dari sub akunnya.
            </p>
          )}

          {editing && (
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={!form.is_active}
                onChange={(e) => set('is_active', !e.target.checked)}
                className="w-4 h-4 accent-violet-600"
              />
              Nonaktifkan akun ini
            </label>
          )}
        </div>

        <div className="flex justify-end gap-2 px-5 py-3 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-lg disabled:opacity-50"
          >
            {saving ? 'Menyimpan…' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* --------------------------------- Page ---------------------------------- */

const ListCOA: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [tree, setTree] = useState<COANode[]>([]);
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());

  // Filters (query params of /masterCoaTree)
  const [searchInput, setSearchInput] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [branch, setBranch] = useState<string>('Main');
  const [showInactive, setShowInactive] = useState<boolean>(false);
  const [tipeAkun, setTipeAkun] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<{
    open: boolean;
    editing: COANode | null;
  }>({ open: false, editing: null });

  const reqId = useRef<number>(0);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearchTerm(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchTree = useCallback(async (): Promise<void> => {
    const id = ++reqId.current;
    try {
      setLoading(true);
      const res = await axios.get(`${API}/masterCoaTree`, {
        params: {
          branch: branch || undefined,
          show_inactive: showInactive,
          search: searchTerm || undefined,
          tipe_akun: tipeAkun || undefined,
          page,
          limit,
        },
        withCredentials: true,
      });
      if (id !== reqId.current) return;
      setTree(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (e) {
      if (id !== reqId.current) return;
      console.error('Error fetching COA tree:', e);
      setTree([]);
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  }, [branch, showInactive, searchTerm, tipeAkun, page, limit]);

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  const rows = useMemo(() => flatten(tree, collapsed), [tree, collapsed]);
  const headerIds = useMemo(() => collectHeaderIds(tree), [tree]);
  const allCollapsed =
    headerIds.length > 0 && headerIds.every((i) => collapsed.has(i));
  const totalRecords = useMemo(() => countNodes(tree), [tree]);

  const toggleNode = (id: number): void =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = (): void =>
    setCollapsed(allCollapsed ? new Set() : new Set(headerIds));

  const toggleGroup = (g: string): void =>
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g);
      else next.add(g);
      return next;
    });

  const pickType = (t: string): void => {
    setTipeAkun((prev) => (prev === t ? '' : t));
    setPage(1);
  };

  const handleToggleActive = async (n: COANode): Promise<void> => {
    const verb = n.is_active ? 'menonaktifkan' : 'mengaktifkan';
    if (
      !window.confirm(
        `Yakin ingin ${verb} akun ${n.kode_akun} · ${n.nama_akun}?`,
      )
    )
      return;
    try {
      await axios.put(
        `${API}/masterCoa/active/${n.id}`,
        { is_active: !n.is_active },
        { withCredentials: true },
      );
      fetchTree();
    } catch (e) {
      window.alert(errMsg(e, 'Gagal mengubah status akun.'));
    }
  };

  const hasActiveFilter =
    !!searchTerm || !!tipeAkun || showInactive || branch !== 'Main';

  const resetFilters = (): void => {
    setSearchInput('');
    setSearchTerm('');
    setTipeAkun('');
    setShowInactive(false);
    setBranch('Main');
    setPage(1);
  };

  const hasNext = tree.length >= limit;

  const balanceCls = (v: number | string | null): string =>
    Number(v ?? 0) < 0 ? 'text-red-600 font-semibold' : 'text-gray-900';

  return (
    <div>
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Chart of Accounts</h1>
          <p className="text-xs text-gray-500">
            Daftar akun beserta saldo per cabang.
          </p>
        </div>
        <button
          onClick={() => setModal({ open: true, editing: null })}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-lg"
        >
          + Akun baru
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Sidebar: Account Type */}
        <aside className="hidden lg:block w-60 flex-shrink-0">
          <div className="bg-white rounded-lg shadow p-3">
            <p className="text-xs font-semibold text-gray-700 mb-2">
              Account type
            </p>
            <button
              onClick={() => {
                setTipeAkun('');
                setPage(1);
              }}
              className={`w-full text-left text-sm px-2 py-1.5 rounded-md ${
                tipeAkun === ''
                  ? 'bg-violet-100 text-violet-800 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              All accounts
            </button>
            <ul className="mt-1">
              {TYPE_GROUPS.map((g) => {
                const single = g.types.length === 1;
                const open = openGroups.has(g.group);
                return (
                  <li key={g.group}>
                    <button
                      onClick={() =>
                        single ? pickType(g.types[0]) : toggleGroup(g.group)
                      }
                      className={`w-full flex items-center gap-1.5 text-left text-sm px-2 py-1.5 rounded-md ${
                        single && tipeAkun === g.types[0]
                          ? 'bg-violet-100 text-violet-800 font-semibold'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {!single && (
                        <svg
                          className={`w-3 h-3 text-gray-400 transition-transform ${
                            open ? 'rotate-90' : ''
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
                      )}
                      <span className={single ? 'pl-[18px]' : ''}>
                        {g.group}
                      </span>
                    </button>
                    {!single && open && (
                      <ul className="ml-5 border-l border-gray-200">
                        {g.types.map((t) => (
                          <li key={t}>
                            <button
                              onClick={() => pickType(t)}
                              className={`w-full text-left text-xs px-2 py-1.5 rounded-md ${
                                tipeAkun === t
                                  ? 'bg-violet-100 text-violet-800 font-semibold'
                                  : 'text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              {t}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-3 sm:p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="relative lg:col-span-2">
                <input
                  type="text"
                  placeholder="Cari kode, nama akun, atau no. rekening…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 w-full"
                />
                <SearchIcon />
              </div>

              {/* Tipe akun (mobile / tablet; desktop memakai sidebar) */}
              <select
                value={tipeAkun}
                onChange={(e) => {
                  setTipeAkun(e.target.value);
                  setPage(1);
                }}
                className="lg:hidden w-full py-2 px-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="">Semua tipe akun</option>
                {TYPE_GROUPS.map((g) => (
                  <optgroup key={g.group} label={g.group}>
                    {g.types.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>

              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500 whitespace-nowrap">
                  Branch
                </label>
                <input
                  value={branch}
                  onChange={(e) => {
                    setBranch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full py-2 px-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-3">
              <label className="inline-flex items-center gap-2 text-xs text-gray-700">
                <input
                  type="checkbox"
                  checked={showInactive}
                  onChange={(e) => {
                    setShowInactive(e.target.checked);
                    setPage(1);
                  }}
                  className="w-4 h-4 accent-violet-600"
                />
                Tampilkan akun nonaktif
              </label>
              {tipeAkun && (
                <span className="inline-flex items-center gap-2 text-xs bg-violet-50 border border-violet-200 text-violet-700 rounded-full px-3 py-1.5">
                  Tipe: <strong>{tipeAkun}</strong>
                  <button
                    onClick={() => setTipeAkun('')}
                    className="text-violet-500 hover:text-violet-800"
                  >
                    ✕
                  </button>
                </span>
              )}
              {hasActiveFilter && (
                <button
                  onClick={resetFilters}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-800 underline"
                >
                  Reset semua filter
                </button>
              )}
              <button
                onClick={toggleAll}
                disabled={headerIds.length === 0}
                className="ml-auto text-xs font-semibold text-violet-600 hover:text-violet-800 disabled:opacity-40"
              >
                {allCollapsed ? 'Buka semua' : 'Tutup semua'}
              </button>
            </div>
          </div>

          {/* Tree table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-12">
                <Spinner />
              </div>
            ) : rows.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                Tidak ada akun yang cocok. Ubah filter atau buat akun baru.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase whitespace-nowrap">
                        Kode
                      </th>
                      <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase">
                        Akun
                      </th>
                      <th className="hidden sm:table-cell px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase whitespace-nowrap">
                        Tipe
                      </th>
                      <th className="px-3 py-2 text-right text-[10px] font-medium text-gray-500 uppercase whitespace-nowrap">
                        Balance
                      </th>
                      <th className="px-3 py-2 w-28"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {rows.map(({ node, depth, hasChildren }) => {
                      const isHeader = node.tipe === 'header';
                      return (
                        <tr
                          key={node.id}
                          className={`${
                            isHeader ? 'bg-violet-50/60' : 'hover:bg-gray-50'
                          } ${node.is_active ? '' : 'opacity-60'}`}
                        >
                          <td
                            className={`px-3 py-2 text-xs whitespace-nowrap ${
                              isHeader
                                ? 'font-bold text-violet-800'
                                : 'text-gray-700'
                            }`}
                          >
                            <div
                              className="flex items-center gap-1.5"
                              style={{ paddingLeft: depth * 18 }}
                            >
                              {hasChildren ? (
                                <button
                                  onClick={() => toggleNode(node.id)}
                                  className="w-4 h-4 flex items-center justify-center text-violet-500 hover:text-violet-800"
                                  aria-label={
                                    collapsed.has(node.id)
                                      ? 'Buka sub akun'
                                      : 'Tutup sub akun'
                                  }
                                >
                                  <svg
                                    className={`w-3 h-3 transition-transform ${
                                      collapsed.has(node.id) ? '' : 'rotate-90'
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2.5}
                                      d="M9 5l7 7-7 7"
                                    />
                                  </svg>
                                </button>
                              ) : (
                                <span className="w-4" />
                              )}
                              {node.kode_akun}
                            </div>
                          </td>
                          <td
                            className={`px-3 py-2 text-xs ${
                              isHeader
                                ? 'font-bold text-violet-800'
                                : 'text-gray-900'
                            }`}
                          >
                            {node.nama_akun}
                            {!node.is_active && (
                              <span className="ml-2 text-[10px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">
                                Nonaktif
                              </span>
                            )}
                            {node.no_rekening && !isHeader && (
                              <div className="text-[10px] text-gray-400">
                                {node.no_rekening}
                              </div>
                            )}
                          </td>
                          <td className="hidden sm:table-cell px-3 py-2 text-xs text-gray-600 whitespace-nowrap">
                            {node.tipe_akun}
                          </td>
                          <td
                            className={`px-3 py-2 text-xs text-right whitespace-nowrap ${
                              isHeader ? 'font-bold' : ''
                            } ${balanceCls(node.balance)}`}
                          >
                            {formatCurrency(Number(node.balance ?? 0))}
                          </td>
                          <td className="px-3 py-2 text-right whitespace-nowrap">
                            <button
                              onClick={() =>
                                setModal({ open: true, editing: node })
                              }
                              className="text-xs font-semibold text-blue-600 hover:text-blue-800 mr-3"
                            >
                              Ubah
                            </button>
                            <button
                              onClick={() => handleToggleActive(node)}
                              className={`text-xs font-semibold ${
                                node.is_active
                                  ? 'text-red-600 hover:text-red-800'
                                  : 'text-green-600 hover:text-green-800'
                              }`}
                            >
                              {node.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Footer: record count + pagination */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-600">
              <span>
                {totalRecords} akun di halaman ini
                {tipeAkun ? ` · ${tipeAkun}` : ''}
              </span>
              <div className="flex items-center gap-2">
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="py-1 px-1.5 border border-gray-300 rounded-md bg-white"
                >
                  {PAGE_SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s} / halaman
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || loading}
                  className="px-2.5 py-1 border border-gray-300 rounded-md bg-white hover:bg-gray-100 disabled:opacity-40"
                >
                  Sebelumnya
                </button>
                <span className="font-semibold text-gray-800">Hal. {page}</span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!hasNext || loading}
                  className="px-2.5 py-1 border border-gray-300 rounded-md bg-white hover:bg-gray-100 disabled:opacity-40"
                >
                  Berikutnya
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {modal.open && (
        <COAModal
          editing={modal.editing}
          defaultTipeAkun={tipeAkun}
          defaultBranch={branch}
          onClose={() => setModal({ open: false, editing: null })}
          onSuccess={() => {
            setModal({ open: false, editing: null });
            fetchTree();
          }}
        />
      )}
    </div>
  );
};

export default ListCOA;
