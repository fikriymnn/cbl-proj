import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface DetailItem {
  id: number;
  item: string;
  jam: string;
  jenis: string;
  mesin: string;
  no_booking: string | null;
  no_jo: string;
  qty_dipakai: number;
  qty_druk: number;
  qty_pcs: number;
  tahapan: string;
  tanggal: string;
}

interface SisaKapasitas {
  id: number;
  kode_mesin: string;
  nama_mesin: string;
  type_kapasitas: string;
  bulan: number;
  tahun: number;
  label: string;
  kapasitas: number;
  sisa: number;
  terpakai: number;
  detail: DetailItem[];
}

interface ListKapasitas {
  id: number;
  kode_mesin: string;
  nama_mesin: string;
  type_kapasitas: string;
  kapasitas: number;
}

interface ApiResponse {
  list_kapasitas: ListKapasitas[];
  sisa_kapasitas: SisaKapasitas[];
}

interface MonthRangeData {
  month: number;
  year: number;
  monthLabel: string;
  data: ApiResponse;
}

// Columns that the "Detail Pemakaian" table can be sorted by
type DetailSortKey =
  | 'no_jo'
  | 'item'
  | 'tahapan'
  | 'jenis'
  | 'qty_pcs'
  | 'qty_druk'
  | 'qty_dipakai'
  | 'tanggal';

interface SortConfig {
  key: DetailSortKey;
  direction: 'asc' | 'desc';
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const getMonthName = (month: number) => MONTH_NAMES[month - 1];

const formatNumber = (num: number) =>
  new Intl.NumberFormat('id-ID').format(Math.round(num));

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

const capacityColor = (pct: number) => {
  if (pct <= 10) return 'text-red-600';
  if (pct <= 50) return 'text-amber-600';
  if (pct <= 75) return 'text-blue-600';
  return 'text-green-600';
};

const DETAIL_COLUMNS: {
  key: DetailSortKey;
  label: string;
  align: 'left' | 'right';
}[] = [
  { key: 'no_jo', label: 'No. JO', align: 'left' },
  { key: 'item', label: 'Item', align: 'left' },
  { key: 'tahapan', label: 'Tahapan', align: 'left' },
  { key: 'jenis', label: 'Jenis', align: 'left' },
  { key: 'qty_pcs', label: 'Qty PCS', align: 'right' },
  { key: 'qty_druk', label: 'Qty Druk', align: 'right' },
  { key: 'qty_dipakai', label: 'Qty Dipakai', align: 'right' },
  { key: 'tanggal', label: 'Tanggal', align: 'left' },
];

function sortDetail(detail: DetailItem[], sort: SortConfig): DetailItem[] {
  const { key, direction } = sort;
  const sorted = [...detail].sort((a, b) => {
    let cmp = 0;
    if (key === 'tanggal') {
      cmp = new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime();
    } else if (
      key === 'qty_pcs' ||
      key === 'qty_druk' ||
      key === 'qty_dipakai'
    ) {
      cmp = a[key] - b[key];
    } else {
      cmp = String(a[key]).localeCompare(String(b[key]), 'id', {
        numeric: true,
        sensitivity: 'base',
      });
    }
    return direction === 'asc' ? cmp : -cmp;
  });
  return sorted;
}

// ─── Component ───────────────────────────────────────────────────────────────

function ReportKapasitas() {
  const now = new Date();
  const [startMonth, setStartMonth] = useState(now.getMonth() + 1);
  const [startYear, setStartYear] = useState(now.getFullYear());
  const [endMonth, setEndMonth] = useState(now.getMonth() + 1);
  const [endYear, setEndYear] = useState(now.getFullYear());
  const [isLoading, setIsLoading] = useState(false);
  const [monthlyData, setMonthlyData] = useState<MonthRangeData[]>([]);
  const [expandedMachine, setExpandedMachine] = useState<string | null>(null);
  const [showMonthlyDetail, setShowMonthlyDetail] = useState<
    Record<string, boolean>
  >({});
  // Per-machine sort state for the "Detail Pemakaian" table.
  // Defaults to tanggal ascending (matches previous fixed behavior).
  const [detailSort, setDetailSort] = useState<Record<string, SortConfig>>({});

  const getDetailSort = (namaMesin: string): SortConfig =>
    detailSort[namaMesin] || { key: 'tanggal', direction: 'asc' };

  const handleSortClick = (namaMesin: string, key: DetailSortKey) => {
    setDetailSort((prev) => {
      const current = prev[namaMesin] || { key: 'tanggal', direction: 'asc' };
      const direction: 'asc' | 'desc' =
        current.key === key && current.direction === 'asc' ? 'desc' : 'asc';
      return { ...prev, [namaMesin]: { key, direction } };
    });
  };

  // ── Date range helpers ────────────────────────────────────────────────────

  const getMonthRange = () => {
    const months: { month: number; year: number }[] = [];
    let m = startMonth,
      y = startYear;
    while (y < endYear || (y === endYear && m <= endMonth)) {
      months.push({ month: m, year: y });
      m++;
      if (m > 12) {
        m = 1;
        y++;
      }
    }
    return months;
  };

  const dateRangeLabel =
    startMonth === endMonth && startYear === endYear
      ? `${getMonthName(startMonth)} ${startYear}`
      : `${getMonthName(startMonth)} ${startYear} – ${getMonthName(
          endMonth,
        )} ${endYear}`;

  // ── Fetch ─────────────────────────────────────────────────────────────────

  async function fetchMonth(month: number, year: number): Promise<ApiResponse> {
    const url = `${
      import.meta.env.VITE_API_LINK || '/api'
    }/ppic/reportKapasitas`;
    const res = await axios.get(url, {
      params: { bulan: month, tahun: year },
      withCredentials: true,
    });
    return res.data;
  }

  async function fetchAll() {
    setIsLoading(true);
    try {
      const range = getMonthRange();
      const results = await Promise.all(
        range.map(({ month, year }) =>
          fetchMonth(month, year).then((data) => ({
            month,
            year,
            monthLabel: `${getMonthName(month)} ${year}`,
            data,
          })),
        ),
      );
      setMonthlyData(results);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
  }, [startMonth, startYear, endMonth, endYear]);

  // ── Aggregation ───────────────────────────────────────────────────────────

  // Build a unified list of machines from all months
  const allMachines: string[] = monthlyData.length
    ? [
        ...new Set(
          monthlyData.flatMap((m) =>
            m.data.sisa_kapasitas.map((s) => s.nama_mesin),
          ),
        ),
      ]
    : [];

  // Aggregate across all months per machine
  const aggregated = allMachines.map((nama) => {
    const rows = monthlyData.flatMap((m) =>
      m.data.sisa_kapasitas.filter((s) => s.nama_mesin === nama),
    );
    const totalKapasitas = rows.reduce((sum, r) => sum + r.kapasitas, 0);
    const totalTerpakai = rows.reduce((sum, r) => sum + r.terpakai, 0);
    const totalSisa = rows.reduce((sum, r) => sum + r.sisa, 0);
    const sisaPct = totalKapasitas > 0 ? (totalSisa / totalKapasitas) * 100 : 0;
    const allDetail = rows.flatMap((r) => r.detail);
    return {
      nama_mesin: nama,
      totalKapasitas,
      totalTerpakai,
      totalSisa,
      sisaPct,
      allDetail,
    };
  });

  const grandTotal = {
    kapasitas: aggregated.reduce((s, a) => s + a.totalKapasitas, 0),
    terpakai: aggregated.reduce((s, a) => s + a.totalTerpakai, 0),
    sisa: aggregated.reduce((s, a) => s + a.totalSisa, 0),
  };

  // Bar chart data
  const chartData = aggregated.map((a) => ({
    name: a.nama_mesin,
    Terpakai: a.totalTerpakai,
    Tersisa: a.totalSisa,
  }));

  // Monthly trend data
  const trendData = monthlyData.map(({ monthLabel, data }) => {
    const row: Record<string, any> = { month: monthLabel };
    data.sisa_kapasitas.forEach((s) => {
      row[s.nama_mesin] = s.terpakai;
    });
    return row;
  });

  const COLORS = [
    '#3b82f6',
    '#f59e0b',
    '#10b981',
    '#ef4444',
    '#8b5cf6',
    '#ec4899',
    '#14b8a6',
    '#f97316',
    '#6366f1',
    '#84cc16',
  ];

  // ── Render ────────────────────────────────────────────────────────────────

  const currentYear = now.getFullYear();
  const years = Array.from({ length: 16 }, (_, i) => currentYear - 10 + i);

  return (
    <div className=" mx-auto">
      {/* ── Header & Filters ── */}
      <h1 className="text-2xl font-bold mb-4">Report Kapasitas</h1>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
          Filter Periode
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dari
            </label>
            <div className="flex gap-2">
              <select
                className="border rounded p-2 flex-1 text-sm"
                value={startMonth}
                onChange={(e) => setStartMonth(+e.target.value)}
              >
                {MONTH_NAMES.map((name, i) => (
                  <option key={i + 1} value={i + 1}>
                    {name}
                  </option>
                ))}
              </select>
              <select
                className="border rounded p-2 flex-1 text-sm"
                value={startYear}
                onChange={(e) => setStartYear(+e.target.value)}
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* End */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sampai
            </label>
            <div className="flex gap-2">
              <select
                className="border rounded p-2 flex-1 text-sm"
                value={endMonth}
                onChange={(e) => setEndMonth(+e.target.value)}
              >
                {MONTH_NAMES.map((name, i) => (
                  <option key={i + 1} value={i + 1}>
                    {name}
                  </option>
                ))}
              </select>
              <select
                className="border rounded p-2 flex-1 text-sm"
                value={endYear}
                onChange={(e) => setEndYear(+e.target.value)}
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="mt-3 flex justify-between items-center">
          <span className="text-sm text-gray-600">
            Periode: <strong>{dateRangeLabel}</strong>
          </span>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
            onClick={fetchAll}
          >
            Tampilkan
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
        </div>
      )}

      {!isLoading && monthlyData.length > 0 && (
        <>
          {/* ── Summary Cards ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-xs font-medium text-blue-700 uppercase mb-1">
                Total Kapasitas
              </p>
              <p className="text-2xl font-bold text-blue-900">
                {formatNumber(grandTotal.kapasitas)}
              </p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-xs font-medium text-amber-700 uppercase mb-1">
                Kapasitas Terpakai
              </p>
              <p className="text-2xl font-bold text-amber-900">
                {formatNumber(grandTotal.terpakai)}
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-xs font-medium text-green-700 uppercase mb-1">
                Kapasitas Tersisa
              </p>
              <p className="text-2xl font-bold text-green-900">
                {formatNumber(grandTotal.sisa)}
              </p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-xs font-medium text-purple-700 uppercase mb-1">
                Utilisasi (%)
              </p>
              <p className="text-2xl font-bold text-purple-900">
                {grandTotal.kapasitas > 0
                  ? Math.round(
                      (grandTotal.terpakai / grandTotal.kapasitas) * 100,
                    )
                  : 0}
                %
              </p>
            </div>
          </div>

          {/* ── Capacity Bar Chart ── */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h2 className="text-lg font-semibold mb-3">
              Kapasitas Per Mesin – {dateRangeLabel}
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis
                    tickFormatter={(v) => formatNumber(v)}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip formatter={(v: any) => formatNumber(v)} />
                  <Legend />
                  <Bar dataKey="Terpakai" stackId="a" fill="#f59e0b" />
                  <Bar
                    dataKey="Tersisa"
                    stackId="a"
                    fill="#22c55e"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── Monthly Trend Chart (multi-month only) ── */}
          {monthlyData.length > 1 && (
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <h2 className="text-lg font-semibold mb-3">
                Tren Terpakai Per Bulan
              </h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={trendData}
                    margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis
                      tickFormatter={(v) => formatNumber(v)}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip formatter={(v: any) => formatNumber(v)} />
                    <Legend />
                    {allMachines.map((name, i) => (
                      <Bar
                        key={name}
                        dataKey={name}
                        fill={COLORS[i % COLORS.length]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* ── Capacity Table ── */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="px-4 py-3 border-b">
              <h2 className="text-lg font-semibold">Kapasitas Per Mesin</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 text-left">
                    <th className="py-3 px-4 border-b">Mesin</th>
                    <th className="py-3 px-4 border-b text-right">
                      Kapasitas Total
                    </th>
                    <th className="py-3 px-4 border-b text-right">Terpakai</th>
                    <th className="py-3 px-4 border-b text-right">Tersisa</th>
                    <th className="py-3 px-4 border-b text-right">Sisa (%)</th>
                    <th className="py-3 px-4 border-b text-center">Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {aggregated.map((item, idx) => {
                    const sort = getDetailSort(item.nama_mesin);
                    const sortedDetail = sortDetail(item.allDetail, sort);
                    return (
                      <React.Fragment key={item.nama_mesin}>
                        <tr
                          className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                        >
                          <td className="py-3 px-4 border-b font-medium">
                            {item.nama_mesin}
                          </td>
                          <td className="py-3 px-4 border-b text-right">
                            {formatNumber(item.totalKapasitas)}
                          </td>
                          <td className="py-3 px-4 border-b text-right">
                            {formatNumber(item.totalTerpakai)}
                          </td>
                          <td className="py-3 px-4 border-b text-right">
                            {formatNumber(item.totalSisa)}
                          </td>
                          <td
                            className={`py-3 px-4 border-b text-right font-bold ${capacityColor(
                              item.sisaPct,
                            )}`}
                          >
                            {item.sisaPct.toFixed(1)}%
                          </td>
                          <td className="py-3 px-4 border-b text-center">
                            {item.allDetail.length > 0 ? (
                              <button
                                onClick={() =>
                                  setShowMonthlyDetail((prev) => ({
                                    ...prev,
                                    [item.nama_mesin]: !prev[item.nama_mesin],
                                  }))
                                }
                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
                              >
                                {showMonthlyDetail[item.nama_mesin]
                                  ? 'Tutup'
                                  : `Detail (${item.allDetail.length})`}
                              </button>
                            ) : (
                              <span className="text-gray-400 text-xs">–</span>
                            )}
                          </td>
                        </tr>

                        {/* Inline detail rows */}
                        {showMonthlyDetail[item.nama_mesin] &&
                          item.allDetail.length > 0 && (
                            <tr>
                              <td colSpan={6} className="p-0 border-b">
                                <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                                  <h4 className="font-semibold text-blue-800 mb-2 text-sm">
                                    Detail Pemakaian – {item.nama_mesin}
                                  </h4>
                                  <div className="overflow-x-auto">
                                    <table className="min-w-full bg-white border border-gray-200 rounded text-xs">
                                      <thead>
                                        <tr className="bg-blue-100 text-blue-800">
                                          {DETAIL_COLUMNS.map((col) => {
                                            const isActive =
                                              sort.key === col.key;
                                            const arrow = isActive
                                              ? sort.direction === 'asc'
                                                ? '▲'
                                                : '▼'
                                              : '↕';
                                            return (
                                              <th
                                                key={col.key}
                                                onClick={() =>
                                                  handleSortClick(
                                                    item.nama_mesin,
                                                    col.key,
                                                  )
                                                }
                                                className={`py-2 px-3 border-b cursor-pointer select-none hover:bg-blue-200 transition-colors ${
                                                  col.align === 'right'
                                                    ? 'text-right'
                                                    : 'text-left'
                                                } ${
                                                  isActive ? 'bg-blue-200' : ''
                                                }`}
                                                title="Klik untuk mengurutkan"
                                              >
                                                <span className="inline-flex items-center gap-1">
                                                  {col.label}
                                                  <span
                                                    className={`text-[10px] ${
                                                      isActive
                                                        ? 'text-blue-900'
                                                        : 'text-blue-400'
                                                    }`}
                                                  >
                                                    {arrow}
                                                  </span>
                                                </span>
                                              </th>
                                            );
                                          })}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {sortedDetail.map((d, i) => (
                                          <tr
                                            key={d.id}
                                            className={
                                              i % 2 === 0
                                                ? 'bg-white'
                                                : 'bg-gray-50'
                                            }
                                          >
                                            <td className="py-2 px-3 border-b">
                                              {d.no_jo}
                                            </td>
                                            <td className="py-2 px-3 border-b">
                                              {d.item}
                                            </td>
                                            <td className="py-2 px-3 border-b">
                                              {d.tahapan}
                                            </td>
                                            <td className="py-2 px-3 border-b capitalize">
                                              {d.jenis}
                                            </td>
                                            <td className="py-2 px-3 border-b text-right">
                                              {formatNumber(d.qty_pcs)}
                                            </td>
                                            <td className="py-2 px-3 border-b text-right">
                                              {formatNumber(d.qty_druk)}
                                            </td>
                                            <td className="py-2 px-3 border-b text-right">
                                              {formatNumber(d.qty_dipakai)}
                                            </td>
                                            <td className="py-2 px-3 border-b">
                                              {formatDate(d.tanggal)}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
                {/* Totals row */}
                <tfoot>
                  <tr className="bg-gray-200 font-bold text-sm">
                    <td className="py-3 px-4 border-t">TOTAL</td>
                    <td className="py-3 px-4 border-t text-right">
                      {formatNumber(grandTotal.kapasitas)}
                    </td>
                    <td className="py-3 px-4 border-t text-right">
                      {formatNumber(grandTotal.terpakai)}
                    </td>
                    <td className="py-3 px-4 border-t text-right">
                      {formatNumber(grandTotal.sisa)}
                    </td>
                    <td className="py-3 px-4 border-t text-right">
                      {grandTotal.kapasitas > 0
                        ? (
                            (grandTotal.sisa / grandTotal.kapasitas) *
                            100
                          ).toFixed(1)
                        : '0.0'}
                      %
                    </td>
                    <td className="py-3 px-4 border-t" />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* ── Per-month breakdown (multi-month) ── */}
          {monthlyData.length > 1 && (
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="px-4 py-3 border-b">
                <h2 className="text-lg font-semibold">Detail Per Bulan</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 text-left">
                      <th className="py-3 px-4 border-b">Mesin</th>
                      {monthlyData.map(({ monthLabel }) => (
                        <th
                          key={monthLabel}
                          className="py-3 px-4 border-b text-right whitespace-nowrap"
                        >
                          {monthLabel}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allMachines.map((nama, idx) => (
                      <tr
                        key={nama}
                        className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                      >
                        <td className="py-2 px-4 border-b font-medium">
                          {nama}
                        </td>
                        {monthlyData.map(({ monthLabel, data }) => {
                          const row = data.sisa_kapasitas.find(
                            (s) => s.nama_mesin === nama,
                          );
                          const pct =
                            row && row.kapasitas > 0
                              ? ((row.terpakai / row.kapasitas) * 100).toFixed(
                                  1,
                                )
                              : '0.0';
                          return (
                            <td
                              key={monthLabel}
                              className="py-2 px-4 border-b text-right"
                            >
                              {row ? (
                                <span
                                  title={`Terpakai: ${formatNumber(
                                    row.terpakai,
                                  )}`}
                                >
                                  {pct}%
                                </span>
                              ) : (
                                '–'
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ReportKapasitas;
