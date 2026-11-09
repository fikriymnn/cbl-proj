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
 * Chart of Accounts (COA) - 3 tingkatan: header > detail > sub
 *  - GET  /masterCoaTree        -> tree (params: branch, show_inactive, search,
 *                                  page, limit)
 *  - GET  /masterCoa?tipe=...   -> daftar akun induk + dasar kode otomatis
 *  - POST /masterCoa            -> buat akun
 *  - PUT  /masterCoa/:id        -> ubah akun
 *  - PUT  /masterCoa/active/:id -> aktif / nonaktif (saldo harus 0)
 * ========================================================================== */

type TipeNode = 'header' | 'detail' | 'sub';

interface COANode {
  id: number;
  id_parent: number | null;
  kode_akun: string;
  nama_akun: string;
  tipe: TipeNode;
  tipe_saldo: string | null;
  tipe_report: string | null;
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

// Akun dari GET /masterCoa: dipakai untuk pilihan induk dan kode otomatis.
interface COAParent {
  id: number;
  id_parent: number | null;
  tipe: TipeNode;
  kode_akun: string;
  nama_akun: string;
  is_active?: boolean;
}

interface COAForm {
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
  tipe_saldo: string;
  tipe_report: string;
}

interface Option {
  value: string;
  label: string;
}

const TIPE_OPTIONS: { value: TipeNode; label: string }[] = [
  { value: 'header', label: 'Header' },
  { value: 'detail', label: 'Detail' },
  { value: 'sub', label: 'Sub detail' },
];

const SALDO_OPTIONS: Option[] = [
  { value: 'debit', label: 'Debit' },
  { value: 'credit', label: 'Credit' },
];

const REPORT_OPTIONS: Option[] = [
  { value: 'neraca', label: 'Neraca' },
  { value: 'laba rugi', label: 'Laba Rugi' },
  { value: 'perubahan modal', label: 'Perubahan Modal' },
];

// Tipe induk yang dibutuhkan tiap level:
// header -> tanpa induk, detail -> header, sub -> detail.
const PARENT_TIPE: Record<TipeNode, TipeNode | null> = {
  header: null,
  detail: 'header',
  sub: 'detail',
};

const labelOf = (opts: Option[], v?: string | null): string =>
  opts.find((o) => o.value === v)?.label ?? '-';

const PAGE_SIZES = [10, 25, 50, 100];

const todayISO = (): string => new Date().toISOString().slice(0, 10);

const emptyForm = (tipe: TipeNode = 'detail'): COAForm => ({
  kode_akun: '',
  nama_akun: '',
  tipe,
  id_parent: '',
  branch: 'Main',
  currency: 'IDR',
  no_rekening: '',
  note: '',
  opening_balance: '0',
  opening_balance_date: todayISO(),
  is_active: true,
  tipe_saldo: '',
  tipe_report: '',
});

const errMsg = (e: unknown, fallback: string): string => {
  const err = e as { response?: { data?: { message?: string } } };
  return err?.response?.data?.message || fallback;
};

// Saldo dianggap 0 bila selisihnya di bawah setengah sen (hindari masalah float).
const isZeroBalance = (v: number | string | null | undefined): boolean =>
  Math.abs(Number(v ?? 0)) < 0.005;

const NONZERO_MSG = 'Akun tidak bisa dinonaktifkan karena saldonya belum 0.';

/* ---------------------------- Kode otomatis ------------------------------ */
// Pola kode: "101-1000" (header), "101-1001" (detail/sub di bawahnya),
// header berikutnya "101-2000", dst. Satu header = satu blok 1000 nomor.

const parseKode = (k: string): { prefix: string; num: number } | null => {
  const m = /^(\d+)-(\d+)$/.exec((k || '').trim());
  return m ? { prefix: m[1], num: Number(m[2]) } : null;
};

const fmtKode = (prefix: string, num: number): string =>
  `${prefix}-${String(num).padStart(4, '0')}`;

const parsedKodes = (
  accounts: COAParent[],
): { prefix: string; num: number }[] =>
  accounts.flatMap((a) => {
    const p = parseKode(a.kode_akun);
    return p ? [p] : [];
  });

const suggestKode = (
  tipe: TipeNode,
  parentId: string,
  accounts: COAParent[],
): string => {
  // Header: prefix tidak bisa diturunkan lagi (tipe akun sudah dihapus),
  // jadi kode header diisi manual.
  if (tipe === 'header') return '';

  // detail / sub: lanjutkan nomor terakhir di blok header yang sama.
  const parent = accounts.find((a) => String(a.id) === parentId);
  if (!parent) return '';
  const header =
    parent.tipe === 'header'
      ? parent
      : accounts.find((a) => a.id === parent.id_parent);
  const base = header ? parseKode(header.kode_akun) : null;
  if (!base) return '';
  const start = Math.floor(base.num / 1000) * 1000;
  const maxNum = Math.max(
    base.num,
    ...parsedKodes(accounts)
      .filter(
        (p) =>
          p.prefix === base.prefix && p.num >= start && p.num < start + 1000,
      )
      .map((p) => p.num),
  );
  return fmtKode(base.prefix, maxNum + 1);
};

/* ------------------------------ Tree helpers ----------------------------- */

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

/* ------------------------------ Form modal ------------------------------- */

interface COAModalProps {
  editing: COANode | null;
  defaultHeader: COAParent | null;
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
  defaultHeader,
  defaultBranch,
  onClose,
  onSuccess,
}) => {
  const [form, setForm] = useState<COAForm>(() =>
    editing
      ? {
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
          tipe_saldo: editing.tipe_saldo ?? '',
          tipe_report: editing.tipe_report ?? '',
        }
      : {
          ...emptyForm('detail'),
          // Header terpilih di sidebar: akun baru langsung jadi anaknya.
          ...(defaultHeader ? { id_parent: String(defaultHeader.id) } : {}),
          branch: defaultBranch || 'Main',
        },
  );
  const [noteTouched, setNoteTouched] = useState<boolean>(false);
  const [kodeTouched, setKodeTouched] = useState<boolean>(false);
  const [accounts, setAccounts] = useState<COAParent[]>([]);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Muat semua tingkatan: dipakai untuk pilihan induk dan menghitung kode.
  // Satu request gagal tidak membatalkan yang lain.
  useEffect(() => {
    let alive = true;
    Promise.all(
      (['header', 'detail', 'sub'] as const).map((t) =>
        axios
          .get(`${API}/masterCoa`, {
            params: { tipe: t },
            withCredentials: true,
          })
          .then((res): COAParent[] =>
            Array.isArray(res.data?.data) ? res.data.data : [],
          )
          .catch((): COAParent[] => []),
      ),
    ).then(([h, d, s]) => {
      if (alive) setAccounts([...h, ...d, ...s]);
    });
    return () => {
      alive = false;
    };
  }, []);

  const set = <K extends keyof COAForm>(k: K, v: COAForm[K]): void =>
    setForm((p) => ({ ...p, [k]: v }));

  const requiredParentTipe = PARENT_TIPE[form.tipe];

  // Level induk benar dan bukan dirinya sendiri.
  const parentOptions = useMemo(
    () =>
      requiredParentTipe
        ? accounts.filter(
            (p) => p.tipe === requiredParentTipe && p.id !== editing?.id,
          )
        : [],
    [accounts, requiredParentTipe, editing],
  );

  const suggestedKode = useMemo(
    () => suggestKode(form.tipe, form.id_parent, accounts),
    [form.tipe, form.id_parent, accounts],
  );

  // Akun baru: isi kode otomatis sampai pengguna mengetik sendiri.
  useEffect(() => {
    if (editing || kodeTouched) return;
    setForm((p) =>
      p.kode_akun === suggestedKode ? p : { ...p, kode_akun: suggestedKode },
    );
  }, [editing, kodeTouched, suggestedKode]);

  const isHeader = form.tipe === 'header';

  // Penonaktifan diblokir selama saldo akun belum 0.
  const deactivateBlocked =
    !!editing && editing.is_active && !isZeroBalance(editing.balance);

  const handleSave = async (): Promise<void> => {
    if (!form.kode_akun.trim()) return setError('Kode akun wajib diisi.');
    if (!form.nama_akun.trim()) return setError('Deskripsi akun wajib diisi.');
    if (requiredParentTipe && !form.id_parent)
      return setError(
        form.tipe === 'detail'
          ? 'Akun detail harus memilih induk (header).'
          : 'Akun sub detail harus memilih induk (detail).',
      );
    // Akun lama bisa belum punya tipe saldo / report (null), jadi hanya wajib
    // saat buat baru.
    if (!editing && !form.tipe_saldo)
      return setError('Tipe saldo wajib dipilih.');
    if (!editing && !form.tipe_report)
      return setError('Tipe report wajib dipilih.');
    if (deactivateBlocked && !form.is_active) return setError(NONZERO_MSG);

    const payload: Record<string, unknown> = {
      kode_akun: form.kode_akun.trim(),
      nama_akun: form.nama_akun.trim(),
      tipe: form.tipe,
      id_parent:
        requiredParentTipe && form.id_parent ? Number(form.id_parent) : null,
      branch: form.branch || 'Main',
      currency: form.currency || 'IDR',
      no_rekening: form.no_rekening.trim(),
      opening_balance: isHeader ? 0 : Number(form.opening_balance || 0),
      opening_balance_date: isHeader ? null : form.opening_balance_date || null,
    };

    if (form.tipe_saldo) payload.tipe_saldo = form.tipe_saldo;
    if (form.tipe_report) payload.tipe_report = form.tipe_report;
    // Tree API tidak mengembalikan note: saat edit, kirim hanya bila diubah
    // supaya catatan lama tidak tertimpa kosong.
    if (!editing || noteTouched) payload.note = form.note;

    try {
      setSaving(true);
      setError('');
      if (editing) {
        const statusChanged = editing.is_active !== form.is_active;
        // Menonaktifkan: jalankan lebih dulu. Bila backend menolak (saldo
        // belum 0), perubahan lain tidak ikut tersimpan setengah jalan.
        if (statusChanged && !form.is_active) {
          await axios.put(
            `${API}/masterCoa/active/${editing.id}`,
            { is_active: false },
            { withCredentials: true },
          );
        }
        await axios.put(`${API}/masterCoa/${editing.id}`, payload, {
          withCredentials: true,
        });
        if (statusChanged && form.is_active) {
          await axios.put(
            `${API}/masterCoa/active/${editing.id}`,
            { is_active: true },
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Jenis">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border border-gray-300 rounded-lg px-3 py-2 text-sm">
                {TIPE_OPTIONS.map((t) => (
                  <label
                    key={t.value}
                    className="inline-flex items-center gap-1.5"
                  >
                    <input
                      type="radio"
                      name="coa-tipe"
                      checked={form.tipe === t.value}
                      onChange={() => {
                        set('tipe', t.value);
                        set('id_parent', '');
                      }}
                      className="accent-violet-600"
                    />
                    {t.label}
                  </label>
                ))}
              </div>
            </Field>
            <Field label="Sub account of" required={!!requiredParentTipe}>
              <select
                value={form.id_parent}
                onChange={(e) => set('id_parent', e.target.value)}
                disabled={isHeader}
                className={inputCls}
              >
                <option value="">
                  {isHeader
                    ? '— Header tidak punya induk —'
                    : '— Pilih induk —'}
                </option>
                {parentOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.kode_akun} · {p.nama_akun}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Kode" required>
              <input
                value={form.kode_akun}
                onChange={(e) => {
                  setKodeTouched(true);
                  set('kode_akun', e.target.value);
                }}
                placeholder="101-1001"
                className={inputCls}
              />
              {!editing && (
                <p className="mt-1 text-[11px] text-gray-500">
                  {suggestedKode
                    ? 'Terisi otomatis, bisa diubah.'
                    : form.tipe === 'header'
                    ? 'Isi kode header secara manual.'
                    : 'Pilih induk untuk mengisi kode otomatis.'}
                  {kodeTouched &&
                    suggestedKode &&
                    form.kode_akun !== suggestedKode && (
                      <button
                        type="button"
                        onClick={() => {
                          setKodeTouched(false);
                          set('kode_akun', suggestedKode);
                        }}
                        className="ml-1 font-semibold text-violet-600 hover:text-violet-800 underline"
                      >
                        Pakai {suggestedKode}
                      </button>
                    )}
                </p>
              )}
            </Field>
            <Field label="Deskripsi" required>
              <input
                value={form.nama_akun}
                onChange={(e) => set('nama_akun', e.target.value)}
                placeholder="Nama akun"
                className={inputCls}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Tipe saldo" required={!editing}>
              <select
                value={form.tipe_saldo}
                onChange={(e) => set('tipe_saldo', e.target.value)}
                className={inputCls}
              >
                <option value="">— Pilih tipe saldo —</option>
                {SALDO_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Tipe report" required={!editing}>
              <select
                value={form.tipe_report}
                onChange={(e) => set('tipe_report', e.target.value)}
                className={inputCls}
              >
                <option value="">— Pilih tipe report —</option>
                {REPORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

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
                placeholder="1234567890"
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
                disabled={isHeader}
                onChange={(e) => set('opening_balance', e.target.value)}
                className={`${inputCls} text-right`}
              />
            </Field>
            <Field label="Per tanggal">
              <input
                type="date"
                value={form.opening_balance_date}
                disabled={isHeader}
                onChange={(e) => set('opening_balance_date', e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>
          {isHeader && (
            <p className="text-xs text-gray-500 -mt-2">
              Saldo akun header dihitung dari sub akunnya.
            </p>
          )}

          {editing && (
            <div>
              <label
                className={`inline-flex items-center gap-2 text-sm ${
                  deactivateBlocked ? 'text-gray-400' : 'text-gray-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={!form.is_active}
                  disabled={deactivateBlocked}
                  onChange={(e) => set('is_active', !e.target.checked)}
                  className="w-4 h-4 accent-violet-600"
                />
                Nonaktifkan akun ini
              </label>
              {deactivateBlocked && (
                <p className="mt-1 text-[11px] text-amber-600">
                  Saldo akun harus 0 sebelum bisa dinonaktifkan (saat ini{' '}
                  {formatCurrency(Number(editing.balance ?? 0))}).
                </p>
              )}
            </div>
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
  // Sidebar Account type = akun bertipe header dari data tree.
  const [headerId, setHeaderId] = useState<number | null>(null);
  const [headers, setHeaders] = useState<COAParent[]>([]);
  const [headersKey, setHeadersKey] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

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
          // Header dipilih: ambil banyak akun sekaligus, lalu tampilkan hanya
          // cabang header itu (tidak bergantung pada paginasi root).
          page: headerId ? 1 : page,
          limit: headerId ? 1000 : limit,
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
  }, [branch, showInactive, searchTerm, headerId, page, limit]);

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  // Daftar header untuk sidebar diambil terpisah dari tree, supaya tidak ikut
  // menyusut saat filter / pencarian aktif.
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
  }, [headersKey]);

  const sidebarHeaders = useMemo(
    () =>
      headers
        .filter((h) => showInactive || h.is_active !== false)
        .sort((a, b) => a.kode_akun.localeCompare(b.kode_akun)),
    [headers, showInactive],
  );
  const selectedHeader = useMemo(
    () => headers.find((h) => h.id === headerId) ?? null,
    [headers, headerId],
  );

  // Tanpa header terpilih: seluruh tree. Dengan header: hanya cabang header itu.
  const displayTree = useMemo(() => {
    if (headerId === null) return tree;
    const found = tree.find((n) => n.id === headerId);
    return found ? [found] : [];
  }, [tree, headerId]);

  const rows = useMemo(
    () => flatten(displayTree, collapsed),
    [displayTree, collapsed],
  );
  const headerIds = useMemo(() => collectHeaderIds(displayTree), [displayTree]);
  const allCollapsed =
    headerIds.length > 0 && headerIds.every((i) => collapsed.has(i));
  const totalRecords = useMemo(
    () => flatten(displayTree, new Set<number>()).length,
    [displayTree],
  );

  const toggleNode = (id: number): void =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = (): void =>
    setCollapsed(allCollapsed ? new Set() : new Set(headerIds));

  const pickHeader = (id: number | null): void => {
    setHeaderId(id);
    setPage(1);
  };

  const handleToggleActive = async (n: COANode): Promise<void> => {
    // Menonaktifkan hanya boleh bila saldo sudah 0.
    if (n.is_active && !isZeroBalance(n.balance)) {
      window.alert(
        `${NONZERO_MSG}\nSaldo ${n.kode_akun} · ${
          n.nama_akun
        }: ${formatCurrency(Number(n.balance ?? 0))}`,
      );
      return;
    }
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
      setHeadersKey((k) => k + 1);
    } catch (e) {
      window.alert(errMsg(e, 'Gagal mengubah status akun.'));
    }
  };

  const hasActiveFilter =
    !!searchTerm || headerId !== null || showInactive || branch !== 'Main';

  const resetFilters = (): void => {
    setSearchInput('');
    setSearchTerm('');
    setHeaderId(null);
    setShowInactive(false);
    setBranch('Main');
    setPage(1);
  };

  const hasNext = tree.length >= limit;

  const balanceCls = (v: number | string | null): string =>
    Number(v ?? 0) < 0 ? 'text-red-600 font-semibold' : 'text-gray-900';

  const tipeLabel = selectedHeader
    ? `${selectedHeader.kode_akun} · ${selectedHeader.nama_akun}`
    : undefined;

  const sideBtnCls = (active: boolean): string =>
    `w-full text-left text-sm px-2 py-1.5 rounded-md ${
      active
        ? 'bg-violet-100 text-violet-800 font-semibold'
        : 'text-gray-700 hover:bg-gray-100'
    }`;

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
        {/* Sidebar: daftar header */}
        <aside className="hidden lg:block w-60 flex-shrink-0">
          <div className="bg-white rounded-lg shadow p-3">
            <p className="text-xs font-semibold text-gray-700 mb-2">
              Account type
            </p>
            <ul className="space-y-0.5 max-h-[70vh] overflow-y-auto">
              <li>
                <button
                  onClick={() => pickHeader(null)}
                  className={sideBtnCls(headerId === null)}
                >
                  All accounts
                </button>
              </li>
              {sidebarHeaders.map((h) => (
                <li key={h.id}>
                  <button
                    onClick={() => pickHeader(h.id)}
                    className={sideBtnCls(headerId === h.id)}
                    title={`${h.kode_akun} · ${h.nama_akun}`}
                  >
                    <span className="block truncate">{h.nama_akun}</span>
                    <span className="block text-[10px] font-normal text-gray-400">
                      {h.kode_akun}
                    </span>
                  </button>
                </li>
              ))}
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

              {/* Header (mobile / tablet; desktop memakai sidebar) */}
              <select
                value={headerId ?? ''}
                onChange={(e) =>
                  pickHeader(e.target.value ? Number(e.target.value) : null)
                }
                className="lg:hidden w-full py-2 px-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="">Semua akun</option>
                {sidebarHeaders.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.kode_akun} · {h.nama_akun}
                  </option>
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
              {selectedHeader && (
                <span className="inline-flex items-center gap-2 text-xs bg-violet-50 border border-violet-200 text-violet-700 rounded-full px-3 py-1.5">
                  Header: <strong>{tipeLabel}</strong>
                  <button
                    onClick={() => pickHeader(null)}
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
                        Jenis
                      </th>
                      <th className="hidden md:table-cell px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase whitespace-nowrap">
                        Saldo
                      </th>
                      <th className="hidden md:table-cell px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase whitespace-nowrap">
                        Report
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
                      const isSub = node.tipe === 'sub';
                      const textCls = isHeader
                        ? 'font-bold text-violet-800'
                        : isSub
                        ? 'text-gray-500'
                        : 'text-gray-900';
                      const blocked =
                        node.is_active && !isZeroBalance(node.balance);
                      return (
                        <tr
                          key={node.id}
                          className={`${
                            isHeader ? 'bg-violet-50/60' : 'hover:bg-gray-50'
                          } ${node.is_active ? '' : 'opacity-60'}`}
                        >
                          <td
                            className={`px-3 py-2 text-xs whitespace-nowrap ${textCls}`}
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
                          <td className={`px-3 py-2 text-xs ${textCls}`}>
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
                            {labelOf(TIPE_OPTIONS, node.tipe)}
                          </td>
                          <td className="hidden md:table-cell px-3 py-2 text-xs text-gray-600 whitespace-nowrap">
                            {labelOf(SALDO_OPTIONS, node.tipe_saldo)}
                          </td>
                          <td className="hidden md:table-cell px-3 py-2 text-xs text-gray-600 whitespace-nowrap">
                            {labelOf(REPORT_OPTIONS, node.tipe_report)}
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
                              disabled={blocked}
                              title={
                                blocked
                                  ? 'Saldo harus 0 untuk menonaktifkan'
                                  : undefined
                              }
                              className={`text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed ${
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
                {tipeLabel ? ` · ${tipeLabel}` : ''}
              </span>
              <div
                className={`flex items-center gap-2 ${
                  headerId ? 'hidden' : ''
                }`}
              >
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
          defaultHeader={selectedHeader}
          defaultBranch={branch}
          onClose={() => setModal({ open: false, editing: null })}
          onSuccess={() => {
            setModal({ open: false, editing: null });
            fetchTree();
            setHeadersKey((k) => k + 1);
          }}
        />
      )}
    </div>
  );
};

export default ListCOA;
