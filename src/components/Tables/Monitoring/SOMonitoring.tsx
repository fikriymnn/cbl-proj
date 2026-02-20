import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Loading from '../../Loading';
import Select from 'react-select';

// ─── Constants ───────────────────────────────────────────────────────────────

const SORT_BY_OPTIONS = [
  { value: 'input so', label: 'Input SO' },
  { value: 'kirim so', label: 'Kirim SO' },
  { value: 'do', label: 'DO' },
];

const STATUS_PO_OPTIONS = [
  { value: 'semua', label: 'Semua' },
  { value: 'close', label: 'Close' },
  { value: 'cancel', label: 'Cancel' },
  { value: 'belum kirim', label: 'Belum Kirim' },
  { value: 'selesai', label: 'Selesai' },
  { value: 'kurang qty', label: 'Kurang Qty' },
  { value: 'over qty', label: 'Over Qty' },
];

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(d.getDate()).padStart(2, '0')}`;
}
function firstOfMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}
function fmtDate(iso: string | null | undefined) {
  if (!iso) return '-';
  return iso.split('T')[0];
}
function fmtDateTime(iso: string | null | undefined) {
  if (!iso) return '-';
  const d = new Date(iso);
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
function fmtRp(val: number | null | undefined) {
  if (val == null) return '-';
  return 'Rp ' + val.toLocaleString('id-ID');
}
function fmtQty(val: number | null | undefined) {
  if (val == null) return '-';
  return val.toLocaleString('id-ID');
}

function calcDeliveryProgress(row: any) {
  const shipped = row.delivery_order_group?.total_qty ?? 0;
  const total = row.po_qty ?? 0;
  if (total === 0) return null;
  const pct = Math.min(Math.round((shipped / total) * 100), 100);
  const isOver = shipped > total;
  const isDone = shipped === total;
  const isUnder = shipped > 0 && shipped < total;
  const status = isOver
    ? 'over qty'
    : isDone
    ? 'selesai'
    : isUnder
    ? 'kurang qty'
    : 'belum kirim';
  return {
    shipped,
    total,
    pct,
    rawPct: Math.round((shipped / total) * 100),
    status,
    isOver,
  };
}

// Get the latest completed tahapan name
function getLatestTahapan(tahapan: any[]): string | null {
  if (!tahapan || tahapan.length === 0) return null;
  const done = [...tahapan]
    .filter((t) => t.produksi_lkh_proses?.length > 0)
    .sort((a, b) => b.index - a.index);
  if (done.length === 0) return null;
  return done[0].tahapan?.nama_tahapan ?? null;
}

function countWithDetail(tahapan: any[]) {
  if (!tahapan) return 0;
  return tahapan.filter((t) => t.produksi_lkh_proses?.length > 0).length;
}

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    done: 'bg-green-100 text-green-700 border-green-200',
    progress: 'bg-blue-100 text-blue-700 border-blue-200',
    selesai: 'bg-green-100 text-green-700 border-green-200',
    cancel: 'bg-red-100 text-red-700 border-red-200',
    'belum kirim': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'kurang qty': 'bg-orange-100 text-orange-700 border-orange-200',
    'over qty': 'bg-purple-100 text-purple-700 border-purple-200',
    close: 'bg-gray-100 text-gray-700 border-gray-200',
    repeat: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    history: 'bg-slate-100 text-slate-700 border-slate-200',
  };
  const cls = map[s] ?? 'bg-blue-100 text-blue-700 border-blue-200';
  return (
    <span
      className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full border ${cls}`}
    >
      {status || '-'}
    </span>
  );
}

function ProgressBar({ pct, isOver }: { pct: number; isOver?: boolean }) {
  const color = isOver
    ? 'bg-purple-500'
    : pct === 100
    ? 'bg-green-500'
    : pct >= 50
    ? 'bg-blue-500'
    : 'bg-yellow-400';
  return (
    <div className="flex items-center gap-1.5 min-w-[90px]">
      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
        <div
          className={`${color} h-1.5 rounded-full transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span
        className={`text-[10px] font-semibold whitespace-nowrap ${
          isOver ? 'text-purple-600' : 'text-gray-600'
        }`}
      >
        {isOver ? '>100%' : `${pct}%`}
      </span>
    </div>
  );
}

// Qty difference display: shows diff with color based on status
function QtyDiffLabel({ shipped, total }: { shipped: number; total: number }) {
  const diff = shipped - total;
  if (diff > 0) {
    return (
      <span className="text-xs font-bold text-purple-600">
        +{fmtQty(diff)} over
      </span>
    );
  }
  if (diff === 0) {
    return <span className="text-xs font-bold text-green-600">Sesuai</span>;
  }
  return (
    <span className="text-xs font-bold text-red-500">
      -{fmtQty(Math.abs(diff))} kurang
    </span>
  );
}

// ─── Tahapan Detail Modal ─────────────────────────────────────────────────────

function TahapanDetailModal({
  row,
  onClose,
}: {
  row: any;
  onClose: () => void;
}) {
  const tahapan: any[] = [...(row.produksi_lkh_tahapan ?? [])].sort(
    (a, b) => a.index - b.index,
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-4 text-white rounded-t-2xl flex justify-between items-start flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2"
                />
              </svg>
              Detail Tahapan Produksi
            </h3>
            <p className="text-violet-200 text-sm mt-0.5">
              {row.no_so} — {row.job_order?.no_jo}
            </p>
            <p className="text-violet-200 text-xs mt-0.5 truncate max-w-md">
              {row.produk}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-violet-200 text-2xl font-bold leading-none ml-4"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto p-5 space-y-3">
          {tahapan.length === 0 ? (
            <p className="text-center text-gray-400 py-10">
              Tidak ada data tahapan
            </p>
          ) : (
            tahapan.map((t) => {
              const proses: any[] = t.produksi_lkh_proses ?? [];
              const hasDetail = proses.length > 0;
              return (
                <div
                  key={t.id}
                  className={`rounded-xl border-2 overflow-hidden transition-all ${
                    hasDetail
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0 ${
                          hasDetail
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-300 text-gray-600'
                        }`}
                      >
                        {t.index}
                      </span>
                      <div>
                        <p
                          className={`text-sm font-semibold ${
                            hasDetail ? 'text-green-800' : 'text-gray-600'
                          }`}
                        >
                          {t.tahapan?.nama_tahapan ?? '-'}
                        </p>
                        {!hasDetail && (
                          <p className="text-[10px] text-gray-400 italic">
                            Belum ada data proses
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasDetail ? (
                        <span className="text-[10px] bg-green-200 text-green-800 font-semibold px-2 py-0.5 rounded-full">
                          {proses.length} proses ✓
                        </span>
                      ) : (
                        <span className="text-[10px] bg-gray-200 text-gray-500 font-semibold px-2 py-0.5 rounded-full">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                  {hasDetail && (
                    <div className="border-t border-green-200 px-4 py-3 space-y-2">
                      {proses.map((p: any, pi: number) => (
                        <div
                          key={p.id ?? pi}
                          className="bg-white rounded-lg border border-green-200 px-4 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs"
                        >
                          <div>
                            <p className="text-gray-400 font-medium mb-0.5">
                              Proses
                            </p>
                            <p className="text-gray-800 font-semibold">
                              {p.proses || p.deskripsi || '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400 font-medium mb-0.5">
                              Mesin
                            </p>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                p.mesin
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-gray-100 text-gray-500'
                              }`}
                            >
                              {p.mesin ? p.mesin.nama_mesin : '-'}
                            </span>
                          </div>
                          <div>
                            <p className="text-gray-400 font-medium mb-0.5">
                              Operator
                            </p>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                p.operator
                                  ? 'bg-indigo-100 text-indigo-700'
                                  : 'bg-gray-100 text-gray-500'
                              }`}
                            >
                              {p.operator ? p.operator.nama : '-'}
                            </span>
                          </div>
                          <div>
                            <p className="text-gray-400 font-medium mb-0.5">
                              Waktu Mulai
                            </p>
                            <span className="inline-flex items-center gap-1 text-[10px] text-gray-700 font-medium">
                              <svg
                                className="w-3 h-3 text-gray-400 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              {fmtDateTime(p.waktu_mulai)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-between items-center flex-shrink-0">
          <span className="text-xs text-gray-500">
            {countWithDetail(tahapan)} dari {tahapan.length} tahapan sudah
            diproses
          </span>
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

// ─── Main Component ───────────────────────────────────────────────────────────

function SOMonitoring() {
  const [isLoading, setIsLoading] = useState(false);
  const [soData, setSoData] = useState<any[]>([]);
  const [dataRekap, setDataRekap] = useState<any>(null);
  const [dataRekapPerBulan, setDataRekapPerBulan] = useState<any[]>([]);

  // Filters
  const [startDate, setStartDate] = useState(firstOfMonth());
  const [endDate, setEndDate] = useState(todayStr());
  const [sortBy, setSortBy] = useState<any>(SORT_BY_OPTIONS[0]);
  const [statusPo, setStatusPo] = useState<any>(STATUS_PO_OPTIONS[0]);
  const [idCustomer, setIdCustomer] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [customerOptions, setCustomerOptions] = useState<any[]>([]);

  // Modals
  const [detailRow, setDetailRow] = useState<any>(null);
  const [tahapanRow, setTahapanRow] = useState<any>(null);
  const [showRekap, setShowRekap] = useState(false);
  const [showRekapBulan, setShowRekapBulan] = useState(false);

  useEffect(() => {
    fetchSO(
      firstOfMonth(),
      todayStr(),
      SORT_BY_OPTIONS[0].value,
      STATUS_PO_OPTIONS[0].value,
      null,
    );
  }, []);

  async function fetchSO(
    start: string,
    end: string,
    sort: string,
    status: string,
    customerId: any,
  ) {
    const url = `${import.meta.env.VITE_API_LINK}/marketing/soMonitoring`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        params: {
          start_date: start,
          end_date: end,
          sort_by: sort,
          status_po: status,
          id_customer: customerId || undefined,
        },
        withCredentials: true,
      });
      const list: any[] = Array.isArray(res.data?.data) ? res.data.data : [];
      setSoData(list);
      setDataRekap(res.data?.data_rekap ?? null);
      setDataRekapPerBulan(
        Array.isArray(res.data?.data_rekap_per_bulan)
          ? res.data.data_rekap_per_bulan
          : [],
      );
      const seen = new Map<any, any>();
      list.forEach((d: any) => {
        if (d.id_customer && d.customer && !seen.has(d.id_customer))
          seen.set(d.id_customer, { value: d.id_customer, label: d.customer });
      });
      setCustomerOptions(Array.from(seen.values()));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleApply = () =>
    fetchSO(
      startDate,
      endDate,
      sortBy?.value,
      statusPo?.value,
      idCustomer?.value ?? null,
    );

  const handleReset = () => {
    const start = firstOfMonth();
    const end = todayStr();
    setStartDate(start);
    setEndDate(end);
    setSortBy(SORT_BY_OPTIONS[0]);
    setStatusPo(STATUS_PO_OPTIONS[0]);
    setIdCustomer(null);
    setSearchQuery('');
    fetchSO(
      start,
      end,
      SORT_BY_OPTIONS[0].value,
      STATUS_PO_OPTIONS[0].value,
      null,
    );
  };

  const filtered = soData.filter((d) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      d.no_so?.toLowerCase().includes(q) ||
      d.customer?.toLowerCase().includes(q) ||
      d.produk?.toLowerCase().includes(q) ||
      d.job_order?.no_jo?.toLowerCase().includes(q) ||
      d.no_io?.toLowerCase().includes(q) ||
      d.ppic?.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <main>
        {isLoading && <Loading />}

        {/* ── Tahapan Detail Modal ── */}
        {tahapanRow && (
          <TahapanDetailModal
            row={tahapanRow}
            onClose={() => setTahapanRow(null)}
          />
        )}

        {/* ── Rekap Modal ── */}
        {showRekap && dataRekap && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white rounded-t-2xl flex justify-between items-center">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9"
                    />
                  </svg>
                  Rekap Keseluruhan
                </h3>
                <button
                  onClick={() => setShowRekap(false)}
                  className="text-white hover:text-blue-200 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  {(
                    [
                      [
                        'Total Qty Keseluruhan',
                        fmtQty(dataRekap.totalQtyKeseluruhan) + ' Pcs',
                        'text-blue-700',
                      ],
                      [
                        'OTS Qty',
                        fmtQty(dataRekap.otsQty) + ' Pcs',
                        'text-indigo-700',
                      ],
                      [
                        'Qty Terkirim',
                        fmtQty(dataRekap.qtyTerkirim) + ' Pcs',
                        'text-green-700',
                      ],
                      ['OTS', fmtRp(dataRekap.ots), 'text-indigo-700'],
                      ['Omset', fmtRp(dataRekap.omset), 'text-blue-700'],
                      [
                        'Realisasi',
                        fmtRp(dataRekap.realisasi),
                        'text-green-700',
                      ],
                    ] as [string, string, string][]
                  ).map(([label, val, cls]) => (
                    <div key={label} className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 font-medium mb-1">
                        {label}
                      </p>
                      <p className={`text-base font-bold ${cls}`}>{val}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end">
                <button
                  onClick={() => setShowRekap(false)}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold rounded-lg transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Rekap Per Bulan Modal ── */}
        {showRekapBulan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-teal-600 to-green-600 px-6 py-4 text-white rounded-t-2xl flex justify-between items-center sticky top-0">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Rekap Per Bulan
                </h3>
                <button
                  onClick={() => setShowRekapBulan(false)}
                  className="text-white hover:text-green-200 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[600px]">
                    <thead>
                      <tr className="bg-gray-100">
                        {[
                          'Bulan',
                          'Total Qty',
                          'OTS Qty',
                          'Qty Terkirim',
                          'OTS',
                          'Omset',
                          'Realisasi',
                        ].map((h) => (
                          <th
                            key={h}
                            className="p-3 text-left text-xs font-semibold text-gray-600"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dataRekapPerBulan.map((row, i) => (
                        <tr key={i} className="border-b hover:bg-gray-50">
                          <td className="p-3 text-sm font-medium text-gray-800">
                            {row.label}
                          </td>
                          <td className="p-3 text-sm">
                            {fmtQty(row.totalQtyKeseluruhan)}
                          </td>
                          <td className="p-3 text-sm">{fmtQty(row.otsQty)}</td>
                          <td className="p-3 text-sm text-green-600 font-medium">
                            {fmtQty(row.qtyTerkirim)}
                          </td>
                          <td className="p-3 text-sm">{fmtRp(row.ots)}</td>
                          <td className="p-3 text-sm">{fmtRp(row.omset)}</td>
                          <td className="p-3 text-sm text-green-600 font-medium">
                            {fmtRp(row.realisasi)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end">
                <button
                  onClick={() => setShowRekapBulan(false)}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold rounded-lg transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── SO Detail Modal ── */}
        {detailRow && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4 text-white rounded-t-2xl flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold">Detail SO</h3>
                  <p className="text-indigo-100 text-sm mt-0.5">
                    {detailRow.no_so} — {detailRow.job_order?.no_jo}
                  </p>
                </div>
                <button
                  onClick={() => setDetailRow(null)}
                  className="text-white hover:text-indigo-200 text-2xl font-bold leading-none ml-4"
                >
                  ×
                </button>
              </div>
              <div className="p-6 space-y-4">
                {/* SO Info */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    Informasi SO
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {(
                      [
                        ['No SO', detailRow.no_so],
                        ['No JO', detailRow.job_order?.no_jo],
                        ['No IO', detailRow.no_io],
                        ['No PO Customer', detailRow.no_po_customer],
                        ['Customer', detailRow.customer],
                        ['Produk', detailRow.produk],
                        ['PPIC', detailRow.ppic],
                        ['Label', detailRow.label],
                        [
                          'Tgl Pembuatan SO',
                          fmtDate(detailRow.tgl_pembuatan_so),
                        ],
                        ['Tgl Approve SO', fmtDate(detailRow.tgl_approve_so)],
                        ['Tgl Input PO', fmtDate(detailRow.tgl_input_po)],
                        ['Tgl Pengiriman', fmtDate(detailRow.tgl_pengiriman)],
                        ['PO Qty', fmtQty(detailRow.po_qty)],
                        ['Qty Druk', fmtQty(detailRow.job_order?.qty_druk)],
                        ['Harga Jual', fmtRp(detailRow.harga_jual)],
                        ['Total Harga', fmtRp(detailRow.total_harga)],
                        [
                          'Profit',
                          detailRow.profit != null
                            ? `${detailRow.profit}%`
                            : '-',
                        ],
                        ['Status Proses', detailRow.status_proses],
                        ['Status Work', detailRow.status_work],
                        ['Partial', detailRow.partial],
                        ['Kirim Semua', detailRow.kirim_semua],
                        ['Artwork', detailRow.artwork],
                      ] as [string, any][]
                    ).map(([label, val]) => (
                      <div key={label}>
                        <p className="text-gray-400 font-medium text-xs">
                          {label}:
                        </p>
                        <p className="text-gray-800 text-sm font-medium">
                          {val ?? '-'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Progress */}
                {(() => {
                  const dp = calcDeliveryProgress(detailRow);
                  if (!dp) return null;
                  return (
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                      <h4 className="text-xs font-semibold text-blue-700 mb-2">
                        Progress Pengiriman
                      </h4>
                      <ProgressBar pct={dp.pct} isOver={dp.isOver} />
                      <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <p className="text-gray-400">Terkirim</p>
                          <p className="font-bold text-green-600">
                            {fmtQty(dp.shipped)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">PO Qty</p>
                          <p className="font-bold text-gray-700">
                            {fmtQty(dp.total)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">Status</p>
                          <StatusBadge status={dp.status} />
                        </div>
                      </div>
                      <div className="mt-2">
                        <QtyDiffLabel shipped={dp.shipped} total={dp.total} />
                      </div>
                      {dp.isOver && (
                        <div className="mt-2 text-xs text-purple-600 font-semibold bg-purple-50 rounded px-2 py-1">
                          Over qty: {fmtQty(dp.shipped - dp.total)} Pcs
                        </div>
                      )}
                      {!dp.isOver && dp.shipped < dp.total && (
                        <div className="mt-2 text-xs text-orange-600 bg-orange-50 rounded px-2 py-1">
                          Kurang: {fmtQty(dp.total - dp.shipped)} Pcs
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Delivery Order info */}
                {detailRow.delivery_order_group && (
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <h4 className="text-xs font-semibold text-green-700 mb-3 flex items-center gap-1.5">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Delivery Order
                    </h4>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div>
                        <p className="text-gray-400 mb-0.5">No DO</p>
                        <p className="font-bold text-gray-800">
                          {detailRow.delivery_order_group.no_do}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-0.5">Tgl DO</p>
                        <p className="font-bold text-gray-800">
                          {fmtDate(detailRow.delivery_order_group.tgl_do)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-0.5">Total Qty DO</p>
                        <p className="font-bold text-green-600">
                          {fmtQty(detailRow.delivery_order_group.total_qty)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tahapan quick list */}
                {detailRow.produksi_lkh_tahapan?.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="text-xs font-semibold text-gray-700 mb-2">
                      Tahapan Produksi
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {[...(detailRow.produksi_lkh_tahapan ?? [])]
                        .sort((a: any, b: any) => a.index - b.index)
                        .map((t: any) => {
                          const done = t.produksi_lkh_proses?.length > 0;
                          return (
                            <span
                              key={t.id}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                                done
                                  ? 'bg-green-100 text-green-700 border-green-300'
                                  : 'bg-white text-gray-400 border-gray-300'
                              }`}
                            >
                              {t.index}. {t.tahapan?.nama_tahapan}{' '}
                              {done ? '✓' : ''}
                            </span>
                          );
                        })}
                    </div>
                  </div>
                )}

                {detailRow.alamat_pengiriman && (
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-blue-700 mb-1">
                      Alamat Pengiriman
                    </h4>
                    <p className="text-sm text-gray-700">
                      {detailRow.alamat_pengiriman}
                    </p>
                  </div>
                )}
              </div>
              <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end">
                <button
                  onClick={() => setDetailRow(null)}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold rounded-lg transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Filter Card ── */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden mb-4">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 sm:p-4">
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
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              SO Monitoring
            </h2>
          </div>
          <div className="p-3 sm:p-4 md:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs sm:text-sm text-gray-600 font-medium">
                  Dari:
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 sm:py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs sm:text-sm text-gray-600 font-medium">
                  Sampai:
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 sm:py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs sm:text-sm text-gray-600 font-medium">
                  Sort By:
                </label>
                <Select
                  options={SORT_BY_OPTIONS}
                  value={sortBy}
                  onChange={(sel) => setSortBy(sel)}
                  styles={customSelectStyles}
                  className="text-xs sm:text-sm"
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs sm:text-sm text-gray-600 font-medium">
                  Status PO:
                </label>
                <Select
                  options={STATUS_PO_OPTIONS}
                  value={statusPo}
                  onChange={(sel) => setStatusPo(sel)}
                  styles={customSelectStyles}
                  className="text-xs sm:text-sm"
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs sm:text-sm text-gray-600 font-medium">
                  Customer:
                </label>
                <Select
                  options={customerOptions}
                  value={idCustomer}
                  onChange={(sel) => setIdCustomer(sel)}
                  isClearable
                  placeholder="Semua Customer"
                  styles={customSelectStyles}
                  className="text-xs sm:text-sm"
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs sm:text-sm text-gray-600 font-medium">
                  Cari:
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="No SO, customer, produk..."
                  className="w-full rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 sm:py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-3 justify-end">
              <button
                onClick={handleReset}
                className="w-full sm:w-auto bg-red-500 hover:bg-red-600 transition-all rounded-lg px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white"
              >
                Reset Filter
              </button>
              <button
                onClick={handleApply}
                disabled={!startDate || !endDate}
                className={`w-full sm:w-auto rounded-lg px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white transition-all ${
                  !startDate || !endDate
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Terapkan Filter
              </button>
            </div>
          </div>
        </div>

        {/* ── Summary Bar ── */}
        {dataRekap && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-1 text-xs sm:text-sm">
                <div>
                  <span className="text-gray-500">Total Qty:</span>{' '}
                  <span className="font-bold text-gray-800">
                    {fmtQty(dataRekap.totalQtyKeseluruhan)} Pcs
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">OTS Qty:</span>{' '}
                  <span className="font-bold text-blue-700">
                    {fmtQty(dataRekap.otsQty)} Pcs
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Qty Terkirim:</span>{' '}
                  <span className="font-bold text-green-600">
                    {fmtQty(dataRekap.qtyTerkirim)} Pcs
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">OTS:</span>{' '}
                  <span className="font-bold text-indigo-700">
                    {fmtRp(dataRekap.ots)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Omset:</span>{' '}
                  <span className="font-bold text-gray-800">
                    {fmtRp(dataRekap.omset)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Realisasi:</span>{' '}
                  <span className="font-bold text-green-600">
                    {fmtRp(dataRekap.realisasi)}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => setShowRekap(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9"
                    />
                  </svg>
                  Rekap Total
                </button>
                <button
                  onClick={() => setShowRekapBulan(true)}
                  className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Per Bulan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Table ── */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-teal-600 p-3 sm:p-4 flex items-center justify-between">
            <h3 className="text-white text-base sm:text-lg font-bold flex items-center gap-2">
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              Data SO Monitoring
            </h3>
            <span className="text-sm text-white bg-white bg-opacity-20 px-3 py-0.5 rounded-full font-semibold">
              {filtered.length} / {soData.length} Record
            </span>
          </div>

          <div className="overflow-x-auto max-h-[650px] overflow-y-auto">
            <table className="w-full text-xs sm:text-sm min-w-[1200px]">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  {[
                    'No',
                    'Tgl Kirim',
                    'Nomor',
                    'Customer',
                    'Produk',
                    'PO Qty',
                    'Total Harga',
                    'Progress',
                    'Tahapan Terakhir',
                    'Aksi',
                  ].map((h) => (
                    <th
                      key={h}
                      className="p-2 sm:p-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="p-8 text-center text-gray-500 text-sm"
                    >
                      Tidak ada data SO
                    </td>
                  </tr>
                ) : (
                  filtered.map((row: any, i: number) => {
                    const dp = calcDeliveryProgress(row);
                    const hasTahapan =
                      (row.produksi_lkh_tahapan?.length ?? 0) > 0;
                    const detailCount = countWithDetail(
                      row.produksi_lkh_tahapan ?? [],
                    );
                    const latestTahapan = getLatestTahapan(
                      row.produksi_lkh_tahapan ?? [],
                    );
                    const rowBg =
                      row.status_proses === 'done' ? 'bg-green-50' : '';

                    return (
                      <tr
                        key={row.id}
                        className={`border-b hover:bg-blue-50 transition-colors ${rowBg}`}
                      >
                        <td className="p-2 sm:p-3 text-xs text-gray-500">
                          {i + 1}
                        </td>
                        <td className="p-2 sm:p-3 text-xs whitespace-nowrap">
                          {fmtDate(row.tgl_pengiriman)}
                        </td>

                        <td className="p-2 sm:p-3 text-xs flex flex-col gap-2">
                          <span
                            onClick={() => setDetailRow(row)}
                            className="text-blue-600 hover:text-blue-800 hover:underline font-semibold whitespace-nowrap cursor-pointer"
                          >
                            {row.no_so || '-'}
                          </span>
                          <span className="text-xs whitespace-nowrap font-medium text-indigo-600">
                            {row.job_order?.no_jo || '-'}
                          </span>
                          <span className="text-xs whitespace-nowrap text-gray-600">
                            {row.no_io || '-'}
                          </span>
                        </td>

                        <td className="p-2 sm:p-3 text-xs max-w-[130px]">
                          <span
                            className="block truncate font-medium"
                            title={row.customer}
                          >
                            {row.customer || '-'}
                          </span>
                        </td>
                        <td className="p-2 sm:p-3 text-xs max-w-[180px]">
                          <span className="block" title={row.produk}>
                            {row.produk || '-'}
                          </span>
                          <span className="text-blue-400 text-[10px]">
                            {row.label}
                          </span>
                        </td>
                        <td className="p-2 sm:p-3 text-xs text-right font-medium">
                          {fmtQty(row.po_qty)}
                        </td>
                        <td className="p-2 sm:p-3 text-xs text-right whitespace-nowrap">
                          {fmtRp(row.total_harga)}
                        </td>

                        {/* Progress column */}
                        <td className="p-2 sm:p-3 text-xs min-w-[140px]">
                          {dp ? (
                            <div className="space-y-1">
                              <ProgressBar pct={dp.pct} isOver={dp.isOver} />
                              <div className="flex items-center gap-1 flex-col items-start">
                                <StatusBadge status={dp.status} />
                                <QtyDiffLabel
                                  shipped={dp.shipped}
                                  total={dp.total}
                                />
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-300 text-[10px]">—</span>
                          )}
                        </td>

                        {/* Latest tahapan (replaces status proses) */}
                        <td className="p-2 sm:p-3 text-xs max-w-[140px]">
                          {latestTahapan ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-100 text-violet-700 border border-violet-200">
                              <svg
                                className="w-2.5 h-2.5 flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {latestTahapan}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-[10px] italic">
                              Belum ada
                            </span>
                          )}
                        </td>

                        {/* Aksi: only tahapan detail button */}
                        <td className="p-2 sm:p-3 text-xs">
                          {hasTahapan && (
                            <button
                              onClick={() => setTahapanRow(row)}
                              title={`Lihat detail tahapan (${detailCount} sudah diproses)`}
                              className="relative p-1.5 rounded text-violet-500 hover:text-violet-700 hover:bg-violet-50 transition-colors"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                                />
                              </svg>
                              {detailCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                                  {detailCount}
                                </span>
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}

export default SOMonitoring;
