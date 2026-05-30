import React, { useState } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import Loading from '../../../Loading';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProcessEntry {
  id: number;
  no_jo: string;
  no_io: string;
  nama_produk?: string;
  item?: string;
  tanggal?: string;
  jam?: string;
  quantity?: number;
  qty_packing?: number;
  jumlah_packing?: number;
  lama_pengerjaan?: number;
  status?: string;
  inspektor?: string;
  customer?: string;
  catatan?: string;
  [key: string]: any;
}

interface JoData {
  no_jo: string;
  no_io: string;
  item: string;
  total_pekerjaan: number;
  total_lama_pengerjaan: number;
  incoming_bahan: ProcessEntry[];
  potong_bahan: ProcessEntry[];
  potong_jadi: ProcessEntry[];
  cetak: ProcessEntry[];
  lipat: ProcessEntry[];
  pond: ProcessEntry[];
  lem: ProcessEntry[];
  ampar_lem: ProcessEntry[];
  coating: ProcessEntry[];
  sortir_rs: ProcessEntry[];
  sampling_rabut: ProcessEntry[];
  final_inspection: ProcessEntry[];
  [key: string]: any;
}

interface InspectorData {
  inspektor_id: number;
  inspektor: string;
  total_pekerjaan: number;
  total_lama_pengerjaan: number;
  jos: JoData[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PROCESS_KEYS: { key: keyof JoData; label: string }[] = [
  { key: 'incoming_bahan', label: 'Incoming Bahan' },
  { key: 'potong_bahan', label: 'Potong Bahan' },
  { key: 'potong_jadi', label: 'Potong Jadi' },
  { key: 'cetak', label: 'Cetak' },
  { key: 'lipat', label: 'Lipat' },
  { key: 'pond', label: 'Pond' },
  { key: 'lem', label: 'Lem' },
  { key: 'ampar_lem', label: 'Ampar Lem' },
  { key: 'coating', label: 'Coating' },
  { key: 'sortir_rs', label: 'Sortir / RS' },
  { key: 'sampling_rabut', label: 'Sampling Rabut' },
  { key: 'final_inspection', label: 'Final Inspection' },
];

const BAR_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#f97316',
  '#84cc16',
  '#ec4899',
  '#6366f1',
  '#14b8a6',
  '#a855f7',
  '#f43f5e',
  '#22c55e',
  '#eab308',
  '#64748b',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '-';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}j ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function statusBadge(status?: string) {
  if (!status) return null;
  const lower = status.toLowerCase();
  let cls = 'bg-gray-100 text-gray-600';
  if (lower.includes('kirim') || lower.includes('ok'))
    cls = 'bg-green-100 text-green-700';
  if (lower.includes('hold') || lower.includes('pending'))
    cls = 'bg-yellow-100 text-yellow-700';
  if (lower.includes('reject') || lower.includes('ng'))
    cls = 'bg-red-100 text-red-700';
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${cls}`}
    >
      {status}
    </span>
  );
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ─── Recap Summary ────────────────────────────────────────────────────────────

function RecapSection({ data }: { data: InspectorData[] }) {
  // Build per-inspector summary rows
  const rows = data.map((ins, idx) => {
    const processCounts: Record<string, number> = {};
    PROCESS_KEYS.forEach(({ key, label }) => {
      const total = ins.jos.reduce(
        (sum, jo) =>
          sum +
          (Array.isArray(jo[key]) ? (jo[key] as ProcessEntry[]).length : 0),
        0,
      );
      processCounts[label] = total;
    });
    return {
      inspektor: ins.inspektor,
      totalJo: ins.jos.length,
      totalPekerjaan: ins.total_pekerjaan,
      totalDurasi: ins.total_lama_pengerjaan,
      processCounts,
      color: BAR_COLORS[idx % BAR_COLORS.length],
    };
  });

  const chartPekerjaan = rows.map((r) => ({
    name: capitalize(r.inspektor),
    value: r.totalPekerjaan,
    color: r.color,
  }));

  const chartDurasi = rows
    .filter((r) => r.totalDurasi > 0)
    .map((r) => ({
      name: capitalize(r.inspektor),
      value: Math.round(r.totalDurasi / 60), // minutes
      color: r.color,
    }));

  const CustomTooltipPekerjaan = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded shadow px-3 py-2 text-sm">
          <p className="font-medium text-gray-800">{payload[0].payload.name}</p>
          <p className="text-gray-600">
            {payload[0].value.toLocaleString('id-ID')} pekerjaan
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomTooltipDurasi = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded shadow px-3 py-2 text-sm">
          <p className="font-medium text-gray-800">{payload[0].payload.name}</p>
          <p className="text-gray-600">
            {payload[0].value.toLocaleString('id-ID')} menit
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mb-8">
      {/* ── Charts ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Chart 1: Total Pekerjaan */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Total Pekerjaan per Inspektor
          </h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={chartPekerjaan}
              margin={{ top: 20, right: 8, left: 0, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                angle={-35}
                textAnchor="end"
                interval={0}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltipPekerjaan />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                <LabelList
                  dataKey="value"
                  position="top"
                  style={{ fontSize: 11, fill: '#374151', fontWeight: 600 }}
                />
                {chartPekerjaan.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 2: Total Durasi */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Total Durasi per Inspektor (menit)
          </h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={chartDurasi}
              margin={{ top: 20, right: 8, left: 0, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                angle={-35}
                textAnchor="end"
                interval={0}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltipDurasi />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                <LabelList
                  dataKey="value"
                  position="top"
                  style={{ fontSize: 11, fill: '#374151', fontWeight: 600 }}
                />
                {chartDurasi.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Recap Table ── */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700">
            Ringkasan per Inspektor
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase">
                <th className="px-3 py-2 text-left font-medium border-b border-gray-200 sticky left-0 bg-white z-10">
                  Inspektor
                </th>
                <th className="px-3 py-2 text-right font-medium border-b border-gray-200">
                  Total JO
                </th>
                <th className="px-3 py-2 text-right font-medium border-b border-gray-200">
                  Total Pekerjaan
                </th>
                <th className="px-3 py-2 text-right font-medium border-b border-gray-200">
                  Total Durasi
                </th>
                {PROCESS_KEYS.map(({ label }) => (
                  <th
                    key={label}
                    className="px-3 py-2 text-right font-medium border-b border-gray-200 whitespace-nowrap"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-3 py-2 sticky left-0 bg-white z-10">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: row.color }}
                      />
                      <span className="font-medium text-gray-800 capitalize">
                        {row.inspektor}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right text-gray-700">
                    {row.totalJo}
                  </td>
                  <td className="px-3 py-2 text-right text-gray-700">
                    {row.totalPekerjaan.toLocaleString('id-ID')}
                  </td>
                  <td className="px-3 py-2 text-right text-gray-700 whitespace-nowrap">
                    {formatDuration(row.totalDurasi)}
                  </td>
                  {PROCESS_KEYS.map(({ label }) => (
                    <td
                      key={label}
                      className="px-3 py-2 text-right text-gray-700"
                    >
                      {row.processCounts[label] > 0 ? (
                        row.processCounts[label]
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              {/* Totals row */}
              <tr className="bg-gray-50 font-semibold text-gray-800 border-t-2 border-gray-300">
                <td className="px-3 py-2 sticky left-0 bg-white z-10">Total</td>
                <td className="px-3 py-2 text-right">
                  {rows.reduce((s, r) => s + r.totalJo, 0)}
                </td>
                <td className="px-3 py-2 text-right">
                  {rows
                    .reduce((s, r) => s + r.totalPekerjaan, 0)
                    .toLocaleString('id-ID')}
                </td>
                <td className="px-3 py-2 text-right whitespace-nowrap">
                  {formatDuration(
                    rows.reduce(
                      (s, r) => s + (r.totalDurasi > 0 ? r.totalDurasi : 0),
                      0,
                    ),
                  )}
                </td>
                {PROCESS_KEYS.map(({ label }) => (
                  <td key={label} className="px-3 py-2 text-right">
                    {rows.reduce((s, r) => s + r.processCounts[label], 0) || (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Process Section ──────────────────────────────────────────────────────────

function ProcessSection({
  label,
  entries,
}: {
  label: string;
  entries: ProcessEntry[];
}) {
  if (!entries || entries.length === 0) return null;
  return (
    <div className="mb-3">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
        {label}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-500 uppercase">
              <th className="px-3 py-2 text-left font-medium border-b border-gray-200">
                Tanggal
              </th>
              <th className="px-3 py-2 text-left font-medium border-b border-gray-200">
                Produk / Item
              </th>
              <th className="px-3 py-2 text-left font-medium border-b border-gray-200">
                Customer
              </th>
              <th className="px-3 py-2 text-right font-medium border-b border-gray-200">
                Qty
              </th>
              <th className="px-3 py-2 text-right font-medium border-b border-gray-200">
                Durasi
              </th>
              <th className="px-3 py-2 text-left font-medium border-b border-gray-200">
                Status
              </th>
              <th className="px-3 py-2 text-left font-medium border-b border-gray-200">
                Catatan
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, i) => (
              <tr
                key={entry.id ?? i}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="px-3 py-2 whitespace-nowrap text-gray-600">
                  {formatDate(entry.tanggal)}
                  {entry.jam && (
                    <span className="block text-xs text-gray-400">
                      {entry.jam}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <span className="font-medium text-gray-800">
                    {entry.nama_produk || entry.item || '-'}
                  </span>
                </td>
                <td className="px-3 py-2 text-gray-600 whitespace-nowrap">
                  {entry.customer || '-'}
                </td>
                <td className="px-3 py-2 text-right text-gray-700 whitespace-nowrap">
                  {entry.quantity != null
                    ? entry.quantity.toLocaleString('id-ID')
                    : entry.qty_packing != null
                    ? `${entry.qty_packing} pcs`
                    : '-'}
                </td>
                <td className="px-3 py-2 text-right whitespace-nowrap text-gray-600">
                  {formatDuration(entry.lama_pengerjaan ?? 0)}
                </td>
                <td className="px-3 py-2">{statusBadge(entry.status)}</td>
                <td className="px-3 py-2 text-gray-500 text-xs max-w-xs truncate">
                  {entry.catatan || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── JO Card ─────────────────────────────────────────────────────────────────

function JoCard({ jo, searchTerm }: { jo: JoData; searchTerm: string }) {
  const [expanded, setExpanded] = useState(false);

  const activeSections = PROCESS_KEYS.filter(
    ({ key }) =>
      Array.isArray(jo[key]) && (jo[key] as ProcessEntry[]).length > 0,
  );

  if (activeSections.length === 0) return null;

  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    const matches =
      jo.no_jo?.toLowerCase().includes(term) ||
      jo.no_io?.toLowerCase().includes(term) ||
      jo.item?.toLowerCase().includes(term);
    if (!matches) return null;
  }

  return (
    <div className="border border-gray-200 rounded-lg mb-3 overflow-hidden">
      {/* JO Header */}
      <div className="flex flex-wrap items-start justify-between gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-800">{jo.no_jo}</span>
            <span className="text-gray-400 text-sm">·</span>
            <span className="text-sm text-gray-500">{jo.no_io}</span>
          </div>
          <p className="text-sm text-gray-600 mt-0.5">{jo.item}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-500 text-right">
            <span className="font-medium text-gray-700">
              {jo.total_pekerjaan}
            </span>{' '}
            pekerjaan
            <span className="mx-1.5">·</span>
            <span className="font-medium text-gray-700">
              {activeSections.length}
            </span>{' '}
            proses
          </div>
          <button
            onClick={() => setExpanded((v) => !v)}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded border transition-colors ${
              expanded
                ? 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100'
                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              fill="currentColor"
              viewBox="0 0 16 16"
              className={`transition-transform duration-200 ${
                expanded ? 'rotate-180' : ''
              }`}
            >
              <path
                fillRule="evenodd"
                d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
              />
            </svg>
            {expanded ? 'Tutup' : 'Lihat Detail'}
          </button>
        </div>
      </div>

      {/* Expanded process sections */}
      {expanded && (
        <div className="px-4 pt-3 pb-1">
          {activeSections.map(({ key, label }) => (
            <ProcessSection
              key={key as string}
              label={label}
              entries={jo[key] as ProcessEntry[]}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Inspector List ───────────────────────────────────────────────────────────

function InspectorList({
  data,
  searchTerm,
}: {
  data: InspectorData[];
  searchTerm: string;
}) {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const toggle = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <>
      {data.map((inspector) => {
        const visibleJos = inspector.jos.filter((jo) => {
          const hasProcess = PROCESS_KEYS.some(
            ({ key }) =>
              Array.isArray(jo[key]) && (jo[key] as ProcessEntry[]).length > 0,
          );
          if (!hasProcess) return false;
          if (!searchTerm) return true;
          const term = searchTerm.toLowerCase();
          return (
            jo.no_jo?.toLowerCase().includes(term) ||
            jo.no_io?.toLowerCase().includes(term) ||
            jo.item?.toLowerCase().includes(term)
          );
        });

        if (visibleJos.length === 0) return null;

        const isExpanded = expandedIds.has(inspector.inspektor_id);

        return (
          <div key={inspector.inspektor_id} className="mb-6">
            {/* Inspector heading with toggle */}
            <button
              onClick={() => toggle(inspector.inspektor_id)}
              className="w-full flex items-center justify-between gap-3 mb-3 pb-2 border-b-2 border-blue-600 text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold select-none shrink-0">
                  {inspector.inspektor.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 capitalize text-lg leading-tight">
                    {inspector.inspektor}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {visibleJos.length} JO · {inspector.total_pekerjaan}{' '}
                    pekerjaan
                  </p>
                </div>
              </div>
              <div
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded border transition-colors shrink-0 ${
                  isExpanded
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-600 group-hover:bg-gray-50'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                  className={`transition-transform duration-200 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                >
                  <path
                    fillRule="evenodd"
                    d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
                  />
                </svg>
                {isExpanded
                  ? 'Sembunyikan'
                  : `Tampilkan ${visibleJos.length} JO`}
              </div>
            </button>

            {/* JO cards */}
            {isExpanded &&
              visibleJos.map((jo) => (
                <JoCard key={jo.no_jo} jo={jo} searchTerm={searchTerm} />
              ))}
          </div>
        );
      })}
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function RekapChecksheetInspector() {
  const [data, setData] = useState<InspectorData[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [joNumber, setJoNumber] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  async function fetchData() {
    setLoading(true);
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/report/checkSheet/inspektor`;
    try {
      const params: { start_date?: string; end_date?: string; no_jo?: string } =
        {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (joNumber) params.no_jo = joNumber;

      const res = await axios.get(url, { withCredentials: true, params });
      const result = res.data.data;
      setData(Array.isArray(result) ? result : [result]);
    } catch (error) {
      console.log('API Error:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  return (
    <div className="bg-white w-full p-5">
      {/* ── Filter bar ── */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">
          Rekap Checksheet per Inspektor
        </h2>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col">
            <label htmlFor="startDate" className="mb-1 text-sm font-medium">
              Tanggal Mulai
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="endDate" className="mb-1 text-sm font-medium">
              Tanggal Akhir
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="joNumber" className="mb-1 text-sm font-medium">
              Nomor JO
            </label>
            <input
              type="text"
              id="joNumber"
              value={joNumber}
              onChange={(e) => setJoNumber(e.target.value)}
              placeholder="Enter JO Number"
              className="border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Tampilkan'}
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      {loading ? (
        <div className="flex justify-center my-8">
          <Loading />
        </div>
      ) : data.length > 0 ? (
        <div>
          {/* ── Recap charts + table ── */}
          <RecapSection data={data} />

          {/* ── Search ── */}
          <div className="flex flex-col mb-5">
            <label htmlFor="searchTerm" className="mb-1 text-sm font-medium">
              Cari
            </label>
            <div className="relative">
              <input
                type="text"
                id="searchTerm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by JO, IO, atau Item..."
                className="border border-gray-300 pl-9 pr-3 py-1 w-full md:w-64 rounded-full"
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* ── Inspector sections ── */}
          <InspectorList data={data} searchTerm={searchTerm} />
        </div>
      ) : (
        <div className="p-4 bg-gray-50 rounded text-center text-gray-500">
          Tidak ada data yang tersedia
        </div>
      )}
    </div>
  );
}

export default RekapChecksheetInspector;
