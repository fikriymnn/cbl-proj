import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import Loading from '../../Loading';

// GET /ppic/joMonitoringKurangQty
// params: page, limit, search (contoh search: "JO-01218/09/2026")
// response: { status_code, succes, data: [...], total_data, total_page }

const LIMIT_OPTIONS = [10, 25, 50, 100];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string | null | undefined) {
  if (!iso) return '-';
  return iso.split('T')[0];
}
function fmtQty(val: number | null | undefined) {
  if (val == null) return '-';
  return val.toLocaleString('id-ID');
}

// ─── Main Component ───────────────────────────────────────────────────────────

function KurangQtyMonitoring() {
  const [isLoading, setIsLoading] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [totalData, setTotalData] = useState(0);
  const [totalPage, setTotalPage] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // searchInput = isi input; search = nilai yang benar-benar dikirim ke API
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    const url = `${import.meta.env.VITE_API_LINK}/ppic/joMonitoringKurangQty`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        params: {
          page,
          limit,
          search: search.trim() || undefined,
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
  }, [page, limit, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApply = () => {
    setPage(1);
    setSearch(searchInput);
  };

  const handleReset = () => {
    setSearchInput('');
    setSearch('');
    setPage(1);
  };

  const from = totalData === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, totalData);

  const btn =
    'px-3 py-1.5 rounded-lg text-xs font-medium border bg-white border-gray-300 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed';
  const th = 'p-2 sm:p-3 whitespace-nowrap';

  return (
    <main>
      {isLoading && <Loading />}

      {/* ── Filter Card ── */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden mb-4">
        <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-3 sm:p-4">
          <h2 className="text-white text-base sm:text-lg md:text-xl font-bold">
            Monitoring Kurang Qty
          </h2>
        </div>
        <div className="p-3 sm:p-4 md:p-6">
          <div className="flex flex-col gap-2 mb-4">
            <label className="text-xs sm:text-sm text-gray-600 font-medium">
              Cari:
            </label>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApply()}
              placeholder="No JO..."
              className="w-full rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 sm:py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 transition-all"
            />
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
          <table className="w-full text-xs sm:text-sm min-w-[1200px]">
            <thead className="bg-white sticky top-0 z-10">
              <tr className="text-left text-xs font-semibold text-gray-600">
                <th className={th}>No</th>
                <th className={th}>Nomor</th>
                <th className={th}>Customer</th>
                <th className={th}>Produk</th>
                <th className={`${th} text-right`}>Isi</th>
                <th className={`${th} text-right`}>Qty</th>
                <th className={`${th} text-right`}>Qty JO</th>
                <th className={`${th} text-right`}>Quantity Kirim FG</th>
                <th className={`${th} text-right`}>Kurang Qty</th>
                <th className={`${th} text-right`}>Total Insheet</th>
                <th className={th}>Tgl Kirim</th>
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
                      <span className="block font-bold text-violet-600 whitespace-nowrap">
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
                      {fmtQty(row.isi)}
                    </td>
                    <td className="p-2 sm:p-3 text-xs text-right">
                      {fmtQty(row.qty)}
                    </td>
                    <td className="p-2 sm:p-3 text-xs text-right">
                      {fmtQty(row.qty_jo)}
                    </td>
                    <td className="p-2 sm:p-3 text-xs text-right font-semibold text-green-600">
                      {fmtQty(row.quantity_kirim_fg)}
                    </td>
                    <td className="p-2 sm:p-3 text-xs text-right font-bold text-red-600">
                      {fmtQty(row.kurang_qty)}
                    </td>
                    <td className="p-2 sm:p-3 text-xs text-right">
                      {fmtQty(row.total_insheet)}
                    </td>
                    <td className="p-2 sm:p-3 text-xs whitespace-nowrap">
                      {fmtDate(row.tgl_kirim)}
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
