import React, { useState } from 'react';
import NCRPage from './NCRPage';
import CAPAPage from './CAPAPage';

import { useCount, useMe } from './qmsShared';
import DefaultLayout from '../../../layout/DefaultLayout';

/**
 * Satu halaman per peran, route di App.tsx:
 *   /qc/qms  → <QMSWorkspace role="qc" />
 *   /mr/qms  → <QMSWorkspace role="mr" />
 *   /qms     → <QMSWorkspace role="user" />   (general, semua department)
 */
export type QMSRole = 'qc' | 'mr' | 'user';
type Main = 'ncr' | 'capa';
type Sub = 'validasi' | 'verifikasi' | 'laporan' | 'masuk';

const ROLES: Record<
  QMSRole,
  { title: string; approver: 'qa' | 'mr' | null; tabs: Record<Main, Sub[]> }
> = {
  qc: {
    title: 'QMS · Quality Control',
    approver: 'qa',
    tabs: {
      ncr: ['validasi', 'laporan'],
      capa: ['verifikasi', 'laporan', 'masuk'],
    },
  },
  mr: {
    title: 'QMS · Management Representative',
    approver: 'mr',
    tabs: {
      ncr: ['validasi', 'laporan'],
      capa: ['verifikasi', 'laporan', 'masuk'],
    },
  },
  user: {
    title: 'QMS',
    approver: null,
    tabs: { ncr: ['laporan'], capa: ['masuk', 'laporan'] },
  },
};

const LABEL: Record<Main, Partial<Record<Sub, string>>> = {
  ncr: { validasi: 'Validasi NCR', laporan: 'Laporan NCR' },
  capa: {
    verifikasi: 'Verifikasi CAPA',
    laporan: 'Laporan CAPA',
    masuk: 'CAPA Masuk',
  },
};

function CountBadge({ n, light }: { n: number; light?: boolean }) {
  if (!n) return null;
  return (
    <span
      className={`ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold ${
        light ? 'bg-white text-violet-700' : 'bg-red-500 text-white'
      }`}
    >
      {n > 99 ? '99+' : n}
    </span>
  );
}

export default function QMSWorkspace({ role }: { role: QMSRole }) {
  const cfg = ROLES[role];
  const a = cfg.approver;
  const me = useMe();
  const myDept = me?.departmentId ?? undefined;

  const [tick, setTick] = useState(0);
  const bump = () => setTick((t) => t + 1);

  const [main, setMain] = useState<Main>('ncr');
  const [sub, setSub] = useState<Record<Main, Sub>>({
    ncr: cfg.tabs.ncr[0],
    capa: cfg.tabs.capa[0],
  });
  // QC & MR: Laporan bisa semua tiket atau hanya yang menyangkut department sendiri
  const [scope, setScope] = useState<'all' | 'dept'>('all');

  // badge antrean
  const nValidasi = useCount(
    '/ncr',
    { status: a === 'qa' ? 'menunggu validasi qa' : 'menunggu validasi mr' },
    !!a,
    tick,
  );
  const nVerifikasi = useCount(
    '/capa',
    {
      status: a === 'qa' ? 'menunggu verifikasi qa' : 'menunggu verifikasi mr',
    },
    !!a,
    tick,
  );
  const nMasuk = useCount(
    '/capa',
    { id_department: myDept, bagian_tiket: 'incoming' },
    !!myDept,
    tick,
  );

  const badge = (m: Main, s: Sub) =>
    s === 'validasi'
      ? nValidasi
      : s === 'verifikasi'
      ? nVerifikasi
      : s === 'masuk'
      ? nMasuk
      : 0;
  const mainBadge = (m: Main) =>
    cfg.tabs[m].reduce((sum, s) => sum + badge(m, s), 0);

  const current = sub[main];
  const effScope: 'all' | 'dept' = role === 'user' ? 'dept' : scope;

  function content() {
    const common = { embedded: true, onActivity: bump } as const;
    if (main === 'ncr') {
      if (current === 'validasi' && a)
        return <NCRPage key="ncr-validasi" mode={a} {...common} />;
      return (
        <NCRPage
          key={`ncr-laporan-${effScope}`}
          mode="report"
          scope={effScope}
          {...common}
        />
      );
    }
    if (current === 'verifikasi' && a)
      return <CAPAPage key="capa-verifikasi" mode={a} {...common} />;
    if (current === 'masuk')
      return <CAPAPage key="capa-masuk" mode="department" {...common} />;
    return (
      <CAPAPage
        key={`capa-laporan-${effScope}`}
        mode="report"
        scope={effScope}
        {...common}
      />
    );
  }

  return (
    <DefaultLayout>
      <main>
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          {/* Header + tab utama */}
          <div className="bg-gradient-to-r from-violet-500 to-purple-600 pt-3 sm:pt-4 px-3 sm:px-4">
            <h2 className="text-white text-base sm:text-lg md:text-xl font-bold">
              {cfg.title}
            </h2>
            <p className="text-violet-100 text-xs sm:text-sm mt-0.5 mb-3">
              Non-Conformance Report & Corrective Preventive Action
            </p>
            <div role="tablist" className="flex gap-1">
              {(['ncr', 'capa'] as Main[]).map((m) => {
                const active = main === m;
                return (
                  <button
                    key={m}
                    role="tab"
                    aria-selected={active}
                    onClick={() => setMain(m)}
                    className={`flex-1 sm:flex-none sm:min-w-[130px] inline-flex items-center justify-center px-5 py-2.5 rounded-t-lg text-sm font-bold transition-colors ${
                      active
                        ? 'bg-white text-violet-700'
                        : 'text-white/80 hover:bg-white/15'
                    }`}
                  >
                    {m.toUpperCase()}
                    <CountBadge n={mainBadge(m)} light={!active} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sub tab */}
          <div
            role="tablist"
            className="flex gap-1 overflow-x-auto border-b border-gray-200 px-2 sm:px-4"
          >
            {cfg.tabs[main].map((s) => {
              const active = current === s;
              return (
                <button
                  key={s}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSub((p) => ({ ...p, [main]: s }))}
                  className={`whitespace-nowrap px-3 sm:px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 -mb-px transition-colors ${
                    active
                      ? 'border-violet-600 text-violet-700'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {LABEL[main][s]}
                  <CountBadge n={badge(main, s)} />
                </button>
              );
            })}
          </div>

          {/* Cakupan laporan */}
          {current === 'laporan' && (
            <div className="flex flex-wrap items-center gap-2 px-3 sm:px-4 pt-3">
              {role === 'user' ? (
                <p className="text-xs text-gray-500">
                  Menampilkan tiket yang menyangkut department Anda
                  {me?.departmentName ? ` (${me.departmentName})` : ''}.
                </p>
              ) : (
                <div className="inline-flex rounded-lg bg-gray-100 p-1 text-xs font-semibold">
                  {(
                    [
                      ['all', 'Semua'],
                      ['dept', 'Department saya'],
                    ] as ['all' | 'dept', string][]
                  ).map(([v, label]) => (
                    <button
                      key={v}
                      onClick={() => setScope(v)}
                      className={`px-3 py-1.5 rounded-md transition-colors ${
                        scope === v
                          ? 'bg-white text-violet-700 shadow-sm'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {content()}
        </div>
      </main>
    </DefaultLayout>
  );
}
