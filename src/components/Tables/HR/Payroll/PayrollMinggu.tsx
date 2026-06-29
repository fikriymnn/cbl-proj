import React, { useEffect, useState } from 'react';
import axios from 'axios';
import convertTimeStampToDate from '../../../../utils/convertDate';
import formatInteger from '../../../../utils/formaterInteger';
// ─── Icons (inline SVG to avoid deps) ─────────────────────────────────────────
const IconCalendar = () => (
  <svg
    width="16"
    height="16"
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
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IconChevron = ({ open }: { open: boolean }) => (
  <svg
    width="14"
    height="14"
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
const IconUser = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const IconSend = () => (
  <svg
    width="15"
    height="15"
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
    width="14"
    height="14"
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
const IconFilter = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

// ─── Status badge ──────────────────────────────────────────────────────────────
const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    Hadir: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Izin: 'bg-sky-50 text-sky-700 border-sky-200',
    Sakit: 'bg-amber-50 text-amber-700 border-amber-200',
  };
  const cls = map[status] ?? 'bg-red-50 text-red-700 border-red-200';
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cls}`}
    >
      {status}
    </span>
  );
};

// ─── Spinner ──────────────────────────────────────────────────────────────────
const Spinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-10 h-10 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
function PayrollMinggu() {
  const [isLoading, setIsLoading] = useState(false);
  const [payWeek, setPayWeek] = useState<any>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterDiv, setFilterDiv] = useState('');
  // ── NEW FILTERS ──
  const [filterTipePenggajian, setFilterTipePenggajian] = useState('');
  const [filterTipeKaryawan, setFilterTipeKaryawan] = useState('');
  // ─────────────────
  const [openModal, setOpenModal] = useState<number | null>(null);
  const [showDetailAbsen, setShowDetailAbsen] = useState(false);
  const [showDetailRincian, setShowDetailRincian] = useState(false);
  const [toast, setToast] = useState<{
    msg: string;
    type: 'success' | 'error';
  } | null>(null);
  const [periodStatus, setPeriodStatus] = useState<
    'idle' | 'checking' | 'ok' | 'exists'
  >('idle');

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Derived option lists (unique values from data) ─────────────────────────
  const departments: string[] = payWeek
    ? ([
        ...new Set(
          (payWeek.detail as any[])
            .map((d) => d.summaryPayroll?.department)
            .filter(Boolean),
        ),
      ] as string[])
    : [];

  // ── Derived option lists (unique values from data) ─────────────────────────
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

  // ── API calls ──────────────────────────────────────────────────────────────
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
        `${import.meta.env.VITE_API_LINK}/hr/payroll/checkBayarMingguanPeriode`,
        {
          params: { periode_dari: dateFrom, periode_sampai: dateTo },
          withCredentials: true,
        },
      );
      setPeriodStatus('ok');
      const res = await axios.get(
        `${import.meta.env.VITE_API_LINK}/hr/payrollAll`,
        {
          params: { startDate: dateFrom, endDate: dateTo },
          withCredentials: true,
        },
      );
      console.log(res.data);
      setPayWeek(res.data.data);
      showToast('Data payroll berhasil dimuat');
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
        `${import.meta.env.VITE_API_LINK}/hr/payroll/bayarMingguanPeriode`,
        { data_payroll: payWeek },
        { withCredentials: true },
      );
      showToast('Payroll berhasil disimpan!');
      setPayWeek(null);
      setPeriodStatus('idle');
    } catch {
      showToast('Gagal menyimpan payroll', 'error');
    } finally {
      setIsLoading(false);
    }
  }

  const selectedEmployee = openModal !== null ? filteredData[openModal] : null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* ── Toast ── */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all
          ${
            toast.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {toast.type === 'success' ? '✓' : '✕'} {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div>
          <h1 className="text-lg font-bold text-slate-800 tracking-tight">
            Payroll Mingguan
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Generate & Simpan payroll berdasarkan periode
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

      <div className="px-6 py-5  mx-auto">
        {/* ── Period Picker ── */}
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

        {/* ── Loading ── */}
        {isLoading && <Spinner />}

        {/* ── Results ── */}
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

              {/* ── Filters ── */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Search */}
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

                {/* Department */}
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
                {/* Divisi */}
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
                {/* Tipe Penggajian — NEW */}
                <div className="relative">
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
                </div>

                {/* Tipe Karyawan — NEW */}
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

                {/* Clear filters chip — shown when any filter is active */}
                {(filterDept ||
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
                      {/* NEW columns */}
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Tipe Penggajian
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Tipe Karyawan
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
                    {filteredData.map((data, i) => (
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
                        <td className="px-4 py-3 text-slate-600">
                          {data.summaryPayroll?.department}
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs">
                          {data.summaryPayroll?.divisi}
                        </td>
                        {/* NEW cells */}
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
                        <td className="px-4 py-3 text-right">
                          <span className="font-semibold text-slate-800">
                            Rp {formatInteger(data.summaryPayroll?.sub_total)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => {
                              setOpenModal(i);
                              setShowDetailAbsen(false);
                              setShowDetailRincian(false);
                            }}
                            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                          >
                            <IconEye /> Detail
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredData.length === 0 && (
                  <div className="text-center py-16 text-slate-400 text-sm">
                    Tidak ada data yang sesuai filter
                  </div>
                )}
              </div>
            </div>

            {/* Sticky bottom summary */}
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
                    Rp {formatInteger(payWeek.total)}
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

        {/* ── Empty state ── */}
        {!isLoading && !payWeek && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <IconCalendar />
            </div>
            <p className="text-sm font-medium">
              Pilih periode untuk memuat data payroll
            </p>
          </div>
        )}
      </div>

      {/* ── Employee Detail Modal ── */}
      {openModal !== null && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpenModal(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div>
                <h2 className="font-bold text-slate-800">
                  {selectedEmployee.summaryPayroll?.nama_karyawan}
                </h2>
                <p className="text-xs text-slate-400">
                  NIK {selectedEmployee.summaryPayroll?.nik} ·{' '}
                  {selectedEmployee.summaryPayroll?.department} /{' '}
                  {selectedEmployee.summaryPayroll?.divisi}
                </p>
                {/* NEW: show tipe badges in modal header */}
                <div className="flex items-center gap-2 mt-1">
                  {selectedEmployee.summaryPayroll?.tipe_penggajian && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-50 text-violet-700 border border-violet-200 capitalize">
                      {selectedEmployee.summaryPayroll.tipe_penggajian}
                    </span>
                  )}
                  {selectedEmployee.summaryPayroll?.tipe_karyawan && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200 capitalize">
                      {selectedEmployee.summaryPayroll.tipe_karyawan}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setOpenModal(null)}
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
                    value: `Rp ${formatInteger(
                      selectedEmployee.summaryPayroll?.total,
                    )}`,
                    color: 'blue',
                  },
                  {
                    label: 'Total Potongan',
                    value: `Rp ${formatInteger(
                      selectedEmployee.summaryPayroll?.total_potongan,
                    )}`,
                    color: 'red',
                  },
                  {
                    label: 'Sub Total',
                    value: `Rp ${formatInteger(
                      selectedEmployee.summaryPayroll?.sub_total,
                    )}`,
                    color: 'emerald',
                  },
                ].map((c) => (
                  <div
                    key={c.label}
                    className={`rounded-xl p-3 ${
                      c.color === 'blue'
                        ? 'bg-blue-50 border border-blue-100'
                        : c.color === 'red'
                        ? 'bg-red-50 border border-red-100'
                        : 'bg-emerald-50 border border-emerald-100'
                    }`}
                  >
                    <div className="text-xs font-semibold text-slate-500 mb-1">
                      {c.label}
                    </div>
                    <div
                      className={`font-bold text-sm ${
                        c.color === 'blue'
                          ? 'text-blue-700'
                          : c.color === 'red'
                          ? 'text-red-700'
                          : 'text-emerald-700'
                      }`}
                    >
                      {c.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Toggle buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDetailRincian(!showDetailRincian)}
                  className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg border transition-all ${
                    showDetailRincian
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400'
                  }`}
                >
                  <IconEye />{' '}
                  {showDetailRincian ? 'Sembunyikan Rincian' : 'Lihat Rincian'}
                  <IconChevron open={showDetailRincian} />
                </button>
                <button
                  onClick={() => setShowDetailAbsen(!showDetailAbsen)}
                  className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg border transition-all ${
                    showDetailAbsen
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400'
                  }`}
                >
                  <IconCalendar />{' '}
                  {showDetailAbsen ? 'Sembunyikan Absensi' : 'Lihat Absensi'}
                  <IconChevron open={showDetailAbsen} />
                </button>
              </div>

              {/* Rincian Payroll */}
              {showDetailRincian && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedEmployee.summaryPayroll?.rincian?.length > 0 && (
                    <DetailSection title="Rincian Payroll" color="blue">
                      {selectedEmployee.summaryPayroll.rincian.map(
                        (r: any, ii: number) => (
                          <DetailRow
                            key={ii}
                            label={`${r.label} × ${r.jumlah}`}
                            value={`Rp ${formatInteger(r.total)}`}
                          />
                        ),
                      )}
                    </DetailSection>
                  )}
                  {selectedEmployee.summaryPayroll?.potongan?.length > 0 && (
                    <DetailSection title="Detail Potongan" color="red">
                      {selectedEmployee.summaryPayroll.potongan.map(
                        (r: any, ii: number) => (
                          <DetailRow
                            key={ii}
                            label={`${r.label} × ${r.jumlah}`}
                            value={`Rp ${formatInteger(r.total)}`}
                          />
                        ),
                      )}
                    </DetailSection>
                  )}
                  {selectedEmployee.summaryPayroll?.potongan_terlambat?.length >
                    0 && (
                    <DetailSection title="Potongan Terlambat" color="amber">
                      {selectedEmployee.summaryPayroll.potongan_terlambat.map(
                        (r: any, ii: number) => (
                          <DetailRow
                            key={ii}
                            label={`${r.label} × ${r.jumlah}`}
                            value={`Rp ${formatInteger(r.total)}`}
                          />
                        ),
                      )}
                    </DetailSection>
                  )}
                  {selectedEmployee.summaryPayroll?.upahHarianSakit?.length >
                    0 && (
                    <DetailSection title="Upah Harian Sakit" color="emerald">
                      {selectedEmployee.summaryPayroll.upahHarianSakit.map(
                        (r: any, ii: number) => (
                          <DetailRow
                            key={ii}
                            label={`${r.label} = ${r.jumlah} × ${r.nilai}`}
                            value={`Rp ${formatInteger(r.total)}`}
                          />
                        ),
                      )}
                    </DetailSection>
                  )}
                </div>
              )}

              {/* Absensi Table */}
              {showDetailAbsen && (
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
                        {selectedEmployee.detailAbsensi?.map(
                          (ab: any, ii: number) => (
                            <tr
                              key={ii}
                              className={`${
                                ab.jam_lembur !== ab.jam_lembur_spl
                                  ? 'bg-red-50'
                                  : 'hover:bg-slate-50'
                              }`}
                            >
                              <td className="px-3 py-2 text-slate-400">
                                {ii + 1}
                              </td>
                              <td className="px-3 py-2 font-medium">
                                {ab.tgl_masuk}
                              </td>
                              <td className="px-3 py-2">
                                {ab.jam_masuk || '-'}
                              </td>
                              <td className="px-3 py-2">
                                {ab.jam_keluar || '-'}
                              </td>
                              <td className="px-3 py-2">{ab.shift || '-'}</td>
                              <td className="px-3 py-2">
                                {ab.status_lembur || '-'}
                                {ab.jam_lembur
                                  ? ` (${ab.jam_lembur - ab.lama_istirahat}j)`
                                  : ''}
                                {ab.jam_lembur !== ab.jam_lembur_spl && (
                                  <div className="text-red-600 text-[10px]">
                                    Absen: {ab.jam_lembur}j / SPL:{' '}
                                    {ab.jam_lembur_spl}j
                                  </div>
                                )}
                              </td>
                              <td className="px-3 py-2">
                                {ab.status_masuk}
                                {ab.menit_terlambat > 0 && (
                                  <div className="text-red-500">
                                    {ab.menit_terlambat} mnt
                                  </div>
                                )}
                              </td>
                              <td className="px-3 py-2">
                                {statusBadge(ab.status_absen)}
                              </td>
                            </tr>
                          ),
                        )}
                        {(!selectedEmployee.detailAbsensi ||
                          selectedEmployee.detailAbsensi.length === 0) && (
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
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Small helper components ───────────────────────────────────────────────────
function DetailSection({
  title,
  color,
  children,
}: {
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  const border =
    {
      blue: 'border-blue-200',
      red: 'border-red-200',
      amber: 'border-amber-200',
      emerald: 'border-emerald-200',
    }[color] ?? 'border-slate-200';
  const head =
    {
      blue: 'bg-blue-50 text-blue-800',
      red: 'bg-red-50 text-red-800',
      amber: 'bg-amber-50 text-amber-800',
      emerald: 'bg-emerald-50 text-emerald-800',
    }[color] ?? 'bg-slate-50 text-slate-800';
  return (
    <div className={`rounded-xl border ${border} overflow-hidden`}>
      <div
        className={`px-3 py-2 text-xs font-bold uppercase tracking-wider ${head}`}
      >
        {title}
      </div>
      <div className="divide-y divide-slate-100">{children}</div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 text-xs text-slate-700">
      <span>{label}</span>
      <span className="font-semibold ml-4 whitespace-nowrap">{value}</span>
    </div>
  );
}

export default PayrollMinggu;
