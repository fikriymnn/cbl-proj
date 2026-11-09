import React, { useState } from 'react';
import Select from 'react-select';
import { FaPlus } from 'react-icons/fa';
import NCRDetailModal from './NCRDetailModal';
import NCRFormModal from './NCRFormModal';
import {
  BTN_PRIMARY,
  Column,
  DataList,
  Field,
  FilterCard,
  INPUT,
  PAGE_LIMIT,
  PageHeader,
  StatusBadge,
  TipeBadge,
  Toast,
  dash,
  fmtDate,
  selectStyles,
  useMe,
  useQmsList,
  useToast,
} from './qmsShared';

export type NCRPageMode = 'qa' | 'mr' | 'report';

const CFG = {
  qa: {
    title: 'Validasi NCR · QA',
    subtitle: 'NCR yang menunggu validasi QA',
    status: 'menunggu validasi qa',
  },
  mr: {
    title: 'Validasi NCR · MR',
    subtitle: 'NCR yang menunggu validasi MR',
    status: 'menunggu validasi mr',
  },
  report: {
    title: 'Laporan NCR',
    subtitle: 'Riwayat NCR yang sudah selesai diproses',
    status: undefined,
  },
} as const;

const TIPE_OPTIONS = [
  { value: 'qty', label: 'Qty' },
  { value: 'frekuensi', label: 'Frekuensi' },
  { value: 'waktu', label: 'Waktu' },
  { value: 'manual', label: 'Manual' },
];

const REPORT_STATUS = [
  { value: 'di tolak qa', label: 'Di tolak QA' },
  { value: 'di tolak mr', label: 'Di tolak MR' },
  { value: 'di teruskan ke capa', label: 'Di teruskan ke CAPA' },
  { value: 'selesai', label: 'Selesai' },
];

export default function NCRPage({
  mode,
  scope = 'all',
  embedded = false,
  onActivity,
}: {
  mode: NCRPageMode;
  scope?: 'all' | 'dept'; // dept: hanya NCR yang menyangkut department user (laporan)
  embedded?: boolean;
  onActivity?: () => void;
}) {
  const cfg = CFG[mode];
  const { toast, notify, clear } = useToast();

  const [page, setPage] = useState(1);
  const [tipe, setTipe] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);
  const [tanggal, setTanggal] = useState('');

  const [openId, setOpenId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const me = useMe();
  const myDept = me?.departmentId ?? undefined;
  const deptScope = mode === 'report' && scope === 'dept';

  // GET /ncr tidak punya filter department → untuk scope dept ambil semua
  // (tanpa page/limit, relasi tetap lengkap) lalu saring & paginasi di FE.
  const {
    rows: raw,
    totalPage: rawPages,
    loading,
    error,
    reload,
  } = useQmsList(
    '/ncr',
    {
      ...(deptScope ? {} : { page, limit: PAGE_LIMIT }), // page & limit berpasangan
      ...(cfg.status
        ? { status: cfg.status }
        : { bagian_tiket: 'history', status: status?.value }),
      tipe_ncr: tipe?.value,
      tanggal: tanggal || undefined,
    },
    !deptScope || !!myDept,
  );

  const scoped = deptScope
    ? raw.filter((r: any) =>
        (r.data_department ?? []).some((d: any) => d.id_department === myDept),
      )
    : raw;
  const rows = deptScope
    ? scoped.slice((page - 1) * PAGE_LIMIT, page * PAGE_LIMIT)
    : raw;
  const totalPage = deptScope
    ? Math.max(1, Math.ceil(scoped.length / PAGE_LIMIT))
    : rawPages;

  const afterChange = () => {
    reload();
    onActivity?.();
  };

  const resetFilter = () => {
    setTipe(null);
    setStatus(null);
    setTanggal('');
    setPage(1);
  };

  const columns: Column<any>[] = [
    {
      label: 'No NCR',
      title: true,
      render: (r) => (
        <span className="font-bold text-violet-700 whitespace-nowrap">
          {dash(r.no_ncr)}
        </span>
      ),
    },
    {
      label: 'Tipe',
      render: (r) => (
        <div className="flex flex-wrap items-center gap-1">
          <TipeBadge tipe={r.tipe_ncr} />
          {r.melebihi_batas ? (
            <span className="text-[10px] font-semibold text-red-600">
              Melebihi batas
            </span>
          ) : null}
        </div>
      ),
    },
    { label: 'Kategori', render: (r) => dash(r.kategori_laporan) },
    {
      label: 'Tanggal',
      render: (r) => (
        <span className="whitespace-nowrap">{fmtDate(r.tanggal)}</span>
      ),
    },
    { label: 'No JO', render: (r) => dash(r.no_jo) },
    {
      label: 'Produk',
      wide: true,
      render: (r) => (
        <span className="block max-w-[200px] md:truncate" title={r.nama_produk}>
          {dash(r.nama_produk)}
        </span>
      ),
    },
    { label: 'Pelapor', render: (r) => dash(r.nama_pelapor) },
    {
      label: 'Status',
      badge: true,
      render: (r) => <StatusBadge status={r.status} />,
    },
  ];

  return (
    <main>
      <Toast toast={toast} onClose={clear} />

      {openId !== null && (
        <NCRDetailModal
          id={openId}
          mode={mode === 'report' ? 'view' : mode}
          notify={notify}
          onClose={() => setOpenId(null)}
          onChanged={afterChange}
          onEdit={
            mode === 'qa'
              ? (data) => {
                  setOpenId(null);
                  setEditing(data);
                }
              : undefined
          }
        />
      )}
      {(creating || editing) && (
        <NCRFormModal
          mode={editing ? 'edit' : 'create'}
          initial={editing ?? undefined}
          notify={notify}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={(msg) => {
            setCreating(false);
            setEditing(null);
            notify(msg);
            afterChange();
          }}
        />
      )}

      <div
        className={
          embedded
            ? ''
            : 'bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden'
        }
      >
        {!embedded && <PageHeader title={cfg.title} subtitle={cfg.subtitle} />}
        {mode === 'qa' && (
          <div className="flex justify-end px-3 sm:px-4 pt-3">
            <button onClick={() => setCreating(true)} className={BTN_PRIMARY}>
              <FaPlus /> Buat NCR Manual
            </button>
          </div>
        )}

        <FilterCard onReset={resetFilter}>
          <Field label="Tipe NCR">
            <Select
              isClearable
              options={TIPE_OPTIONS}
              value={tipe}
              onChange={(s) => {
                setTipe(s);
                setPage(1);
              }}
              placeholder="Semua tipe"
              styles={selectStyles}
              className="text-xs sm:text-sm"
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
          </Field>
          {mode === 'report' && (
            <Field label="Status">
              <Select
                isClearable
                options={REPORT_STATUS}
                value={status}
                onChange={(s) => {
                  setStatus(s);
                  setPage(1);
                }}
                placeholder="Semua status"
                styles={selectStyles}
                className="text-xs sm:text-sm"
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
            </Field>
          )}
          <Field label="Tanggal">
            <input
              type="date"
              value={tanggal}
              onChange={(e) => {
                setTanggal(e.target.value);
                setPage(1);
              }}
              className={INPUT}
            />
          </Field>
        </FilterCard>

        <DataList
          rows={rows}
          columns={columns}
          loading={loading}
          error={error}
          page={page}
          totalPage={totalPage}
          onPage={setPage}
          onOpen={(r) => setOpenId(r.id)}
          emptyText={
            mode === 'report'
              ? 'Belum ada riwayat NCR'
              : 'Tidak ada NCR yang menunggu validasi'
          }
        />
      </div>
    </main>
  );
}
