import React, { useState } from 'react';
import Select from 'react-select';
import CAPADetailModal from './CAPADetailModal';
import {
  Column,
  DataList,
  Field,
  FilterCard,
  INPUT,
  PAGE_LIMIT,
  PageHeader,
  Spinner,
  StatusBadge,
  Toast,
  dash,
  fmtDate,
  selectStyles,
  useDepartments,
  useMe,
  useQmsList,
  useToast,
} from './qmsShared';

export type CAPAPageMode = 'qa' | 'mr' | 'department' | 'report';

const CFG = {
  qa: {
    title: 'Verifikasi CAPA · QA',
    subtitle: 'CAPA yang menunggu verifikasi QA',
    status: 'menunggu verifikasi qa',
  },
  mr: {
    title: 'Verifikasi CAPA · MR',
    subtitle: 'CAPA yang menunggu verifikasi MR',
    status: 'menunggu verifikasi mr',
  },
  department: {
    title: 'CAPA Masuk',
    subtitle: 'Isi analisa dan perbaikan untuk department Anda',
    status: undefined,
  },
  report: {
    title: 'Laporan CAPA',
    subtitle: 'Riwayat CAPA yang sudah diteruskan',
    status: undefined,
  },
} as const;

const DEPT_STATUS = [
  { value: 'incoming', label: 'Belum diisi' },
  { value: 'di tolak qa', label: 'Di tolak QA' },
  { value: 'di tolak mr', label: 'Di tolak MR' },
  { value: 'menunggu verifikasi qa', label: 'Menunggu verifikasi QA' },
  { value: 'menunggu verifikasi mr', label: 'Menunggu verifikasi MR' },
];

export default function CAPAPage({
  mode,
  idDepartment,
  scope = 'all',
  embedded = false,
  onActivity,
}: {
  mode: CAPAPageMode;
  idDepartment?: number; // override; default dari /me
  scope?: 'all' | 'dept'; // dept: hanya CAPA milik department user
  embedded?: boolean;
  onActivity?: () => void;
}) {
  const cfg = CFG[mode];
  const { toast, notify, clear } = useToast();
  const me = useMe();
  const deptOptions = useDepartments();

  const [page, setPage] = useState(1);
  const [deptFilter, setDeptFilter] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);
  const [tanggal, setTanggal] = useState('');
  const [openId, setOpenId] = useState<number | null>(null);

  const myDept = idDepartment ?? me?.departmentId ?? undefined;
  const isDept = mode === 'department';
  const deptScoped = isDept || scope === 'dept';

  const { rows, totalPage, loading, error, reload } = useQmsList(
    '/capa',
    {
      page,
      limit: PAGE_LIMIT, // page & limit wajib berpasangan
      ...(cfg.status ? { status: cfg.status } : {}),
      ...(mode === 'report' ? { bagian_tiket: 'history' } : {}),
      ...(isDept
        ? {
            id_department: myDept,
            bagian_tiket: 'incoming',
            status: status?.value,
          }
        : { id_department: scope === 'dept' ? myDept : deptFilter?.value }),
      tanggal: tanggal || undefined,
    },
    !deptScoped || !!myDept,
  );

  const afterChange = () => {
    reload();
    onActivity?.();
  };

  const resetFilter = () => {
    setDeptFilter(null);
    setStatus(null);
    setTanggal('');
    setPage(1);
  };

  const columns: Column<any>[] = [
    {
      label: 'No CAPA',
      title: true,
      render: (r) => (
        <span className="font-bold text-violet-700 whitespace-nowrap">
          {dash(r.no_capa)}
        </span>
      ),
    },
    { label: 'Department', render: (r) => dash(r.department) },
    { label: 'Kategori', render: (r) => dash(r.kategori_laporan) },
    {
      label: 'Tgl Lapor',
      render: (r) => (
        <span className="whitespace-nowrap">{fmtDate(r.tanggal_lapor)}</span>
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
    {
      label: 'Status',
      badge: true,
      render: (r) => <StatusBadge status={r.status} />,
    },
  ];

  if (deptScoped && !myDept && !me)
    return <Spinner label="Memuat data pengguna..." />;

  return (
    <main>
      <Toast toast={toast} onClose={clear} />

      {openId !== null && (
        <CAPADetailModal
          id={openId}
          mode={mode}
          notify={notify}
          onClose={() => setOpenId(null)}
          onChanged={afterChange}
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

        <FilterCard onReset={resetFilter}>
          {isDept ? (
            <Field label="Status">
              <Select
                isClearable
                options={DEPT_STATUS}
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
          ) : scope === 'dept' ? null : (
            <Field label="Department">
              <Select
                isClearable
                options={deptOptions}
                value={deptFilter}
                onChange={(s) => {
                  setDeptFilter(s);
                  setPage(1);
                }}
                placeholder="Semua department"
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
          // CAPA ditolak disorot supaya department tahu harus diperbaiki
          rowClass={(r) =>
            isDept && (r.status === 'di tolak qa' || r.status === 'di tolak mr')
              ? 'bg-red-50'
              : ''
          }
          emptyText={
            isDept
              ? 'Tidak ada CAPA untuk department Anda'
              : mode === 'report'
              ? 'Belum ada riwayat CAPA'
              : 'Tidak ada CAPA yang menunggu verifikasi'
          }
        />
      </div>
    </main>
  );
}
