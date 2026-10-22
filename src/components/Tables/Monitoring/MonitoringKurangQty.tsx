import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Loading from '../../Loading';

// GET /ppic/joMonitoringKurangQty
// params: page, limit, search (contoh search: "JO-01218/09/2026"),
//         start_date, end_date (filter tanggal kirim, format YYYY-MM-DD)
// response: { status_code, succes, data: [...], total_data, total_page }
//
// Detail modal:
//  - info + defect diambil dari row (row.tambah_bahan_pemakaian[])
//  - histori waste: GET master + P1, lalu POST /reportWaste (sama seperti RekapWasteQC),
//    diambil dari dataWasteByJo yang no_jo-nya sama dengan row.no_jo
//  - indikator: hijau = kode sama di waste & defect tambah bahan, merah = beda

const LIMIT_OPTIONS = [10, 25, 50, 100];

const API = import.meta.env.VITE_API_LINK;
const API_P1 = import.meta.env.VITE_API_LINK_P1;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string | null | undefined) {
  if (!iso) return '-';
  return iso.split('T')[0];
}
function fmtQty(val: number | null | undefined) {
  if (val == null) return '-';
  return val.toLocaleString('id-ID');
}

const norm = (v: any) =>
  String(v ?? '')
    .trim()
    .toLowerCase();

const fmtTemuan = (v: any) => {
  if (v == null || v === '') return '-';
  if (Array.isArray(v)) return v.length ? v.join(', ') : '-';
  return String(v);
};

// Ambil semua defect dari row.tambah_bahan_pemakaian[].
// Mendukung 2 bentuk:
//  1) tiap elemen punya array `tambah_bahan_pemakaian_defect`
//  2) elemen itu sendiri adalah defect (punya `kode`)
function getDefects(row: any): any[] {
  const list: any[] = Array.isArray(row?.tambah_bahan_pemakaian)
    ? row.tambah_bahan_pemakaian
    : [];
  return list.flatMap((tb) =>
    Array.isArray(tb?.tambah_bahan_pemakaian_defect)
      ? tb.tambah_bahan_pemakaian_defect
      : [],
  );
}

// Cache di level modul: master + P1 + reportWaste cukup diambil sekali
let wasteReportCache: Promise<any> | null = null;

function fetchWasteReport(): Promise<any> {
  if (!wasteReportCache) {
    wasteReportCache = (async () => {
      const master = await axios.get(
        `${API}/master/produksi/wasteKendalaFormating`,
        {},
      );
      const p1 = await axios.get(`${API_P1}/api/waste-lkh`, {
        params: { first_date: null, last_date: null },
      });
      const res = await axios.post(
        `${API}/reportWaste`,
        {
          data_waste_master: master.data.waste,
          data_waste_p1: p1.data,
          start_date: null,
          end_date: null,
        },
        { withCredentials: true },
      );
      return res.data;
    })().catch((err) => {
      wasteReportCache = null; // gagal → boleh dicoba lagi
      throw err;
    });
  }
  return wasteReportCache;
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function DetailModal({ row, onClose }: { row: any; onClose: () => void }) {
  const [wasteJo, setWasteJo] = useState<any | null>(null);
  const [wasteLoading, setWasteLoading] = useState(false);
  const [wasteError, setWasteError] = useState(false);

  // GET master + P1, lalu POST /reportWaste → ambil JO yang sama
  useEffect(() => {
    if (!row?.no_jo) return;
    let cancelled = false;
    (async () => {
      try {
        setWasteLoading(true);
        setWasteError(false);
        const data = await fetchWasteReport();
        console.log('fetchWaste', row.no_jo, data);
        const list: any[] = Array.isArray(data?.dataWasteByJo)
          ? data.dataWasteByJo
          : [];
        const found = list.find((j) => norm(j.no_jo) === norm(row.no_jo));
        if (!cancelled) setWasteJo(found ?? null);
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setWasteJo(null);
          setWasteError(true);
        }
      } finally {
        if (!cancelled) setWasteLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [row?.no_jo]);

  const wastes: any[] = useMemo(
    () =>
      [...(wasteJo?.defects ?? [])].sort(
        (a: any, b: any) => (b.total_defect ?? 0) - (a.total_defect ?? 0),
      ),
    [wasteJo],
  );

  const defects = useMemo(() => getDefects(row), [row]);
  const defectTotals = useMemo(
    () =>
      defects.reduce(
        (acc, d) => ({
          druk: acc.druk + (d.qty_tambah_bahan_druk ?? 0),
          lp: acc.lp + (d.qty_tambah_bahan_lp ?? 0),
        }),
        { druk: 0, lp: 0 },
      ),
    [defects],
  );

  // kode yang ada di masing-masing sisi → dasar indikator sama/beda
  const defectCodes = useMemo(
    () => new Set(defects.map((d) => norm(d.kode))),
    [defects],
  );
  const wasteCodes = useMemo(
    () => new Set(wastes.map((w) => norm(w.kode_waste))),
    [wastes],
  );
  const matchCount = wastes.filter((w) =>
    defectCodes.has(norm(w.kode_waste)),
  ).length;
  const totalWasteDefect = wastes.reduce(
    (s, w) => s + (w.total_defect ?? 0),
    0,
  );

  const info: [string, any][] = [
    ['No JO', row.no_jo],
    ['No SO', row.no_so],
    ['No IO', row.no_io],
    ['Customer', row.customer],
    ['Produk', row.produk],
    ['Tgl Kirim', fmtDate(row.tgl_kirim)],
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-4 text-white rounded-t-2xl flex justify-between items-start flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold">Detail Kurang Qty</h3>
            <p className="text-violet-200 text-sm mt-0.5">{row.no_jo}</p>
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

        <div className="overflow-y-auto p-5 space-y-4">
          {/* Info JO */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Informasi JO
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              {info.map(([label, val]) => (
                <div key={label}>
                  <p className="text-gray-400 font-medium mb-0.5">{label}:</p>
                  <p className="text-gray-800 font-semibold">{val || '-'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Ringkasan Qty */}
          <div className="bg-sky-50 rounded-xl p-4 border border-sky-200">
            <h4 className="text-xs font-semibold text-sky-700 mb-3">
              Ringkasan Qty
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              <div className="bg-white rounded-lg border border-sky-200 px-3 py-2">
                <p className="text-gray-400 mb-0.5">Qty JO</p>
                <p className="font-bold text-gray-800">{fmtQty(row.qty_jo)}</p>
              </div>
              <div className="bg-white rounded-lg border border-sky-200 px-3 py-2">
                <p className="text-gray-400 mb-0.5">Total Insheet</p>
                <p className="font-bold text-gray-800">
                  {fmtQty(row.total_insheet)}
                </p>
              </div>
              <div className="bg-white rounded-lg border border-sky-200 px-3 py-2">
                <p className="text-gray-400 mb-0.5">Tambah Bahan Druk</p>
                <p className="font-bold text-orange-600">
                  {fmtQty(row.qty_tambah_bahan_druk)}
                </p>
              </div>
              <div className="bg-white rounded-lg border border-sky-200 px-3 py-2">
                <p className="text-gray-400 mb-0.5">Tambah Bahan LP</p>
                <p className="font-bold text-orange-600">
                  {fmtQty(row.qty_tambah_bahan_lp)}
                </p>
              </div>
              <div className="bg-white rounded-lg border border-sky-200 px-3 py-2">
                <p className="text-gray-400 mb-0.5">Qty Kirim FG</p>
                <p className="font-bold text-green-600">
                  {fmtQty(row.quantity_kirim_fg)}
                </p>
              </div>
              <div className="bg-white rounded-lg border border-sky-200 px-3 py-2">
                <p className="text-gray-400 mb-0.5">Kurang Qty</p>
                <p className="font-bold text-red-600">
                  {fmtQty(row.kurang_qty)}
                </p>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-600">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-green-100 border border-green-400" />
              Kode sama (ada di waste &amp; defect tambah bahan)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-red-100 border border-red-400" />
              Kode berbeda (hanya ada di salah satu sisi)
            </span>
          </div>

          {/* Histori Waste (kiri) + Defect (kanan) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Histori Waste */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3 gap-2">
                <h4 className="text-xs font-semibold text-gray-700">
                  Histori Waste JO ({wastes.length})
                </h4>
                {wastes.length > 0 && (
                  <span className="text-[10px] font-semibold text-gray-700 bg-white border border-gray-200 rounded-full px-2 py-0.5 whitespace-nowrap">
                    {matchCount} sama · {wastes.length - matchCount} beda ·
                    Total: {fmtQty(totalWasteDefect)}
                  </span>
                )}
              </div>

              {wasteLoading ? (
                <p className="text-xs text-gray-500 text-center py-6">
                  Memuat histori waste...
                </p>
              ) : wasteError ? (
                <p className="text-xs text-red-600 text-center py-6">
                  Gagal memuat histori waste.
                </p>
              ) : wastes.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-6">
                  Tidak ada histori waste
                </p>
              ) : (
                <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                  {wastes.map((w: any, wi: number) => {
                    const matched = defectCodes.has(norm(w.kode_waste));
                    const kendalaList: any[] = Array.isArray(w.kendala)
                      ? w.kendala
                      : [];
                    const ops: any[] = Array.isArray(w.operator_inspektor)
                      ? w.operator_inspektor.filter(Boolean)
                      : [];
                    return (
                      <div
                        key={w.kode_waste ?? wi}
                        className={`rounded-lg border px-3 py-2 text-xs ${
                          matched
                            ? 'bg-green-50 border-green-300'
                            : 'bg-red-50 border-red-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="min-w-0">
                            <span className="font-bold text-gray-800">
                              {w.kode_waste}
                            </span>
                            <span className="font-medium text-gray-700">
                              {' '}
                              - {w.waste_desc}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span
                              className={`text-[10px] font-semibold rounded px-1.5 py-0.5 whitespace-nowrap ${
                                matched
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {matched ? 'Sama' : 'Beda'}
                            </span>
                            <span className="text-[10px] font-semibold text-gray-700 bg-white border border-gray-200 rounded px-1.5 py-0.5 whitespace-nowrap">
                              {fmtQty(w.total_defect)}
                            </span>
                          </div>
                        </div>

                        {/* Kendala terkait */}
                        {kendalaList.length > 0 && (
                          <div className="space-y-0.5 mb-1.5 text-[11px]">
                            {kendalaList.map((k: any, ki: number) => (
                              <div
                                key={ki}
                                className="flex justify-between gap-2"
                              >
                                <span className="text-gray-600">
                                  ✤ {k.kategori_kendala} - {k.kode_kendala} -{' '}
                                  {k.kendala_desc}
                                </span>
                                <span className="font-semibold text-gray-700 whitespace-nowrap">
                                  {fmtQty(k.calculated_defect)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Inspektor / operator / mesin */}
                        {ops.length > 0 && (
                          <div className="space-y-1 border-t border-gray-200 pt-1.5">
                            {ops.map((op: any, oi: number) => (
                              <div
                                key={oi}
                                className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px]"
                              >
                                <div>
                                  <span className="text-gray-400">
                                    Inspektor:{' '}
                                  </span>
                                  <span className="font-medium text-gray-700">
                                    {op.inspektor || '-'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-400">
                                    Operator:{' '}
                                  </span>
                                  <span className="font-medium text-gray-700">
                                    {op.operator || '-'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Mesin: </span>
                                  <span className="font-medium text-gray-700">
                                    {op.mesin || '-'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-400">
                                    Defect:{' '}
                                  </span>
                                  <span className="font-medium text-gray-700">
                                    {fmtQty(op.calculated_defect)}
                                  </span>
                                </div>
                                <div className="col-span-2">
                                  <span className="text-gray-400">
                                    Kendala LKH:{' '}
                                  </span>
                                  <span className="font-medium text-gray-700">
                                    {[op.kode_lkh, op.masalah_lkh]
                                      .filter(Boolean)
                                      .join(' - ') || '-'}
                                  </span>
                                </div>
                                <div className="col-span-2">
                                  <span className="text-gray-400">
                                    Temuan:{' '}
                                  </span>
                                  <span className="font-medium text-gray-700">
                                    {fmtTemuan(op.temuan)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Defect (tabel) */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h4 className="text-xs font-semibold text-gray-700 mb-3">
                Defect Tambah Bahan Pemakaian ({defects.length})
              </h4>
              {defects.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-6">
                  Tidak ada defect
                </p>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 overflow-auto max-h-80">
                  <table className="w-full text-xs">
                    <thead className="bg-white sticky top-0">
                      <tr className="text-left font-semibold text-gray-600 border-b border-gray-200">
                        <th className="p-2">#</th>
                        <th className="p-2">Kode</th>
                        <th className="p-2">Deskripsi</th>
                        <th className="p-2 text-right">Druk</th>
                        <th className="p-2 text-right">LP</th>
                        <th className="p-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {defects.map((d: any, i: number) => {
                        const matched = wasteCodes.has(norm(d.kode));
                        return (
                          <tr
                            key={d.id ?? i}
                            className={`border-b ${
                              matched
                                ? 'bg-green-50 border-green-200'
                                : 'bg-red-50 border-red-200'
                            }`}
                          >
                            <td className="p-2 text-gray-500">{i + 1}</td>
                            <td className="p-2 font-bold text-gray-800 whitespace-nowrap">
                              {d.kode ?? '-'}
                            </td>
                            <td className="p-2 text-gray-700">
                              {d.deskripsi ?? '-'}
                            </td>
                            <td className="p-2 text-right">
                              {fmtQty(d.qty_tambah_bahan_druk)}
                            </td>
                            <td className="p-2 text-right">
                              {fmtQty(d.qty_tambah_bahan_lp)}
                            </td>
                            <td className="p-2 text-right font-bold text-red-600">
                              {fmtQty(
                                (d.qty_tambah_bahan_druk ?? 0) +
                                  (d.qty_tambah_bahan_lp ?? 0),
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="font-bold text-gray-800 bg-gray-100">
                        <td className="p-2" colSpan={3}>
                          Total
                        </td>
                        <td className="p-2 text-right">
                          {fmtQty(defectTotals.druk)}
                        </td>
                        <td className="p-2 text-right">
                          {fmtQty(defectTotals.lp)}
                        </td>
                        <td className="p-2 text-right text-red-600">
                          {fmtQty(defectTotals.druk + defectTotals.lp)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </div>
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

// ─── Main Component ───────────────────────────────────────────────────────────

function KurangQtyMonitoring() {
  const [isLoading, setIsLoading] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [totalData, setTotalData] = useState(0);
  const [totalPage, setTotalPage] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // xxxInput = isi input; yang tanpa suffix = nilai yang benar-benar dikirim ke API
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const [startDateInput, setStartDateInput] = useState('');
  const [endDateInput, setEndDateInput] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [dateError, setDateError] = useState('');

  // row yang sedang dibuka di modal detail
  const [detailRow, setDetailRow] = useState<any | null>(null);

  const fetchData = useCallback(async () => {
    const url = `${import.meta.env.VITE_API_LINK}/ppic/joMonitoringKurangQty`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        params: {
          page,
          limit,
          search: search.trim() || undefined,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
        },
        withCredentials: true,
      });
      console.log('Fetched Kurang Qty data:', res.data);
      const list: any[] = Array.isArray(res.data?.data) ? res.data.data : [];
      setRows(list);
      setTotalData(res.data?.total_data ?? list.length);
      setTotalPage(Math.max(1, res.data?.total_page ?? 1));
    } catch (err) {
      console.error(err);
      setRows([]);
      setTotalData(0);
      setTotalPage(1);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search, startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApply = () => {
    if (startDateInput && endDateInput && endDateInput < startDateInput) {
      setDateError('Tanggal akhir tidak boleh lebih awal dari tanggal mulai');
      return;
    }
    setDateError('');
    setPage(1);
    setSearch(searchInput);
    setStartDate(startDateInput);
    setEndDate(endDateInput);
  };

  const handleReset = () => {
    setSearchInput('');
    setSearch('');
    setStartDateInput('');
    setEndDateInput('');
    setStartDate('');
    setEndDate('');
    setDateError('');
    setPage(1);
  };

  const from = totalData === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, totalData);

  const btn =
    'px-3 py-1.5 rounded-lg text-xs font-medium border bg-white border-gray-300 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed';
  const th = 'p-2 sm:p-3 whitespace-nowrap';
  const inputCls =
    'w-full rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 sm:py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 transition-all';

  return (
    <main>
      {isLoading && <Loading />}
      {detailRow && (
        <DetailModal row={detailRow} onClose={() => setDetailRow(null)} />
      )}

      {/* ── Filter Card ── */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden mb-4">
        <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-3 sm:p-4">
          <h2 className="text-white text-base sm:text-lg md:text-xl font-bold">
            Monitoring Kurang Qty
          </h2>
        </div>
        <div className="p-3 sm:p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs sm:text-sm text-gray-600 font-medium">
                Cari:
              </label>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                placeholder="No JO..."
                className={inputCls}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs sm:text-sm text-gray-600 font-medium">
                Tanggal Kirim (Dari):
              </label>
              <input
                type="date"
                value={startDateInput}
                onChange={(e) => setStartDateInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                className={inputCls}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs sm:text-sm text-gray-600 font-medium">
                Tanggal Kirim (Sampai):
              </label>
              <input
                type="date"
                value={endDateInput}
                min={startDateInput || undefined}
                onChange={(e) => setEndDateInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                className={inputCls}
              />
            </div>
          </div>

          {dateError && (
            <p className="text-xs text-red-600 mb-3">{dateError}</p>
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
            Data Kurang Qty
          </h3>
          <span className="text-sm text-white bg-white bg-opacity-20 px-3 py-0.5 rounded-full font-semibold whitespace-nowrap">
            {totalData} Record
          </span>
        </div>

        <div className="overflow-x-auto max-h-[650px] overflow-y-auto">
          <table className="w-full text-xs sm:text-sm min-w-[1300px]">
            <thead className="bg-white sticky top-0 z-10">
              <tr className="text-left text-xs font-semibold text-gray-600">
                <th className={th} rowSpan={2}>
                  No
                </th>
                <th className={th} rowSpan={2}>
                  Nomor
                </th>
                <th className={th} rowSpan={2}>
                  Customer
                </th>
                <th className={th} rowSpan={2}>
                  Produk
                </th>
                <th className={`${th} text-right`} rowSpan={2}>
                  Qty JO
                </th>
                <th className={`${th} text-right`} rowSpan={2}>
                  Total Insheet
                </th>
                <th
                  className={`${th} text-center border-b border-gray-200`}
                  colSpan={2}
                >
                  Total Qty Tambah Bahan
                </th>
                <th className={`${th} text-right`} rowSpan={2}>
                  Quantity Kirim FG
                </th>
                <th className={`${th} text-right`} rowSpan={2}>
                  Kurang Qty
                </th>
                <th className={th} rowSpan={2}>
                  Tgl Kirim
                </th>
                <th className={th} rowSpan={2}>
                  Aksi
                </th>
              </tr>
              <tr className="text-left text-xs font-semibold text-gray-600">
                <th className={`${th} text-right`}>Druk</th>
                <th className={`${th} text-right`}>LP</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="p-8 text-center text-gray-500 text-sm"
                  >
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                rows.map((row: any, i: number) => (
                  <tr
                    key={row.id ?? i}
                    className="border-b hover:bg-blue-50 transition-colors"
                  >
                    <td className="p-2 sm:p-3 text-xs text-gray-500">
                      {(page - 1) * limit + i + 1}
                    </td>
                    <td className="p-2 sm:p-3 text-xs">
                      <span
                        onClick={() => setDetailRow(row)}
                        className="block font-bold text-violet-600 hover:text-violet-800 hover:underline whitespace-nowrap cursor-pointer"
                      >
                        {row.no_jo || '-'}
                      </span>
                      <span className="block text-blue-600 font-medium whitespace-nowrap">
                        {row.no_so || '-'}
                      </span>
                      <span className="block text-gray-500 whitespace-nowrap">
                        {row.no_io || '-'}
                      </span>
                    </td>
                    <td className="p-2 sm:p-3 text-xs max-w-[160px] font-medium">
                      {row.customer || '-'}
                    </td>
                    <td className="p-2 sm:p-3 text-xs max-w-[220px]">
                      {row.produk || '-'}
                    </td>
                    <td className="p-2 sm:p-3 text-xs text-right">
                      {fmtQty(row.qty_jo)}
                    </td>
                    <td className="p-2 sm:p-3 text-xs text-right">
                      {fmtQty(row.total_insheet)}
                    </td>
                    <td className="p-2 sm:p-3 text-xs text-right text-orange-600 font-medium">
                      {fmtQty(row.qty_tambah_bahan_druk)}
                    </td>
                    <td className="p-2 sm:p-3 text-xs text-right text-orange-600 font-medium">
                      {fmtQty(row.qty_tambah_bahan_lp)}
                    </td>
                    <td className="p-2 sm:p-3 text-xs text-right font-semibold text-green-600">
                      {fmtQty(row.quantity_kirim_fg)}
                    </td>
                    <td className="p-2 sm:p-3 text-xs text-right font-bold text-red-600">
                      {fmtQty(row.kurang_qty)}
                    </td>
                    <td className="p-2 sm:p-3 text-xs whitespace-nowrap">
                      {fmtDate(row.tgl_kirim)}
                    </td>
                    <td className="p-2 sm:p-3 text-xs">
                      <button
                        onClick={() => setDetailRow(row)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-violet-600 hover:text-violet-800 hover:bg-violet-50 border border-violet-200 transition-colors"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination (total_data / total_page dari API) ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 border-t bg-gray-50">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span>Tampilkan</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="rounded-lg bg-white border border-gray-300 px-2 py-1 text-xs"
            >
              {LIMIT_OPTIONS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
            <span>
              {from}–{to} dari {totalData}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              className={btn}
              disabled={page <= 1}
              onClick={() => setPage(1)}
            >
              «
            </button>
            <button
              className={btn}
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Sebelumnya
            </button>
            <span className="text-xs text-gray-600 px-2">
              {page} / {totalPage}
            </span>
            <button
              className={btn}
              disabled={page >= totalPage}
              onClick={() => setPage((p) => p + 1)}
            >
              Berikutnya
            </button>
            <button
              className={btn}
              disabled={page >= totalPage}
              onClick={() => setPage(totalPage)}
            >
              »
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default KurangQtyMonitoring;
