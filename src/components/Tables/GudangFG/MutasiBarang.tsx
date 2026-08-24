import React, { useEffect, useMemo, useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import Loading from '../../Loading';
import { Pagination, Stack } from '@mui/material';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DataMutasi {
  tgl_mutasi: string | null | undefined;
  id: number;
  id_customer: number;
  id_io: number;
  id_jo: number;
  id_so: number;
  id_produk: number;
  id_user: number;
  is_active: number;
  jumlah_qty: number;
  main_jo_mutasi_keluar: string;
  no_io: string;
  no_jo: string;
  no_po_customer: string;
  no_so: string;
  produk: string;
  customer: string;
  type_mutasi: 'masuk' | 'keluar' | string;
  type_mutasi_keluar: 'single' | 'group' | string | null;
  sumber_mutasi: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

interface MutasiItem {
  id_customer: number;
  id_io: number;
  id_jo: number;
  id_so: number;
  id_produk: number;
  no_io: string;
  no_jo: string;
  no_so: string;
  produk: string;
  customer: string;
  jumlah_qty_masuk: number;
  jumlah_qty_keluar: number;
  data_mutasi: DataMutasi[];
}

interface MutasiResponse {
  data: MutasiItem[];
  status: number;
  success: boolean;
  total_page?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtQty(val: number | null | undefined) {
  if (val == null) return '-';
  return val.toLocaleString('id-ID');
}

function fmtDate(iso: string | null | undefined) {
  if (!iso) return '-';
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}-${String(
    d.getMonth() + 1,
  ).padStart(2, '0')}-${d.getFullYear()}`;
}

function TypeMutasiBadge({ type }: { type: string }) {
  const t = type?.toLowerCase() ?? '';
  if (t === 'masuk') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700 border border-green-200">
        <svg
          className="w-2.5 h-2.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
        Masuk
      </span>
    );
  }
  if (t === 'keluar') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-700 border border-red-200">
        <svg
          className="w-2.5 h-2.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
        Keluar
      </span>
    );
  }
  return (
    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600 border border-gray-200">
      {type || '-'}
    </span>
  );
}

function TypeKeluar({ type }: { type: string }) {
  if (!type) return <span className="text-gray-300">-</span>;
  const isGroup = type.toLowerCase() === 'group';
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
        isGroup
          ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
          : 'bg-blue-100 text-blue-700 border-blue-200'
      }`}
    >
      {type}
    </span>
  );
}

/**
 * Small pill showing where the mutasi came from (e.g. "Send DO", "Adjust Stock").
 * Kept tiny/muted so it reads as metadata, not a competing badge.
 */
function SumberMutasiTag({ sumber }: { sumber: string | null }) {
  if (!sumber) return null;
  return (
    <span className="inline-flex items-center gap-0.5 text-[9px] font-medium text-gray-400">
      <svg
        className="w-2.5 h-2.5 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 7h.01M7 3h5.586a1 1 0 01.707.293l6.414 6.414a1 1 0 010 1.414l-7.586 7.586a1 1 0 01-1.414 0L3.293 12.293A1 1 0 013 11.586V6a3 3 0 013-3z"
        />
      </svg>
      {sumber}
    </span>
  );
}

/**
 * Hover/tap icon that reveals a mutasi's note in a small floating tooltip,
 * so the note doesn't need its own table column.
 */
function NoteTooltip({ note }: { note: string | null }) {
  if (!note) return null;
  return (
    <span className="relative inline-flex group/note ">
      <svg
        className="w-3 h-3 text-amber-500 cursor-help flex-shrink-0"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M18 10A8 8 0 112 10a8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      </svg>
      <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 z-20 hidden group-hover/note:block whitespace-normal max-w-[220px] rounded-lg  px-2.5 py-1.5 text-[10px] leading-snug text-black shadow-lg bg-white border border-gray-200">
        {note}
        <span className="absolute left-1/2 -translate-x-1/2 top-full w-2 h-2  rotate-45" />
      </span>
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const MutasiBarang: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<MutasiItem[]>([]);

  // Pagination & search — same pattern as Deposit
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Raw text the user types — updates on every keystroke, no fetch triggered directly.
  const [searchInput, setSearchInput] = useState<string>('');
  // Debounced value actually used for fetching.
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [typeMutasi, setTypeMutasi] = useState<string>('');
  const [sumberMutasi, setSumberMutasi] = useState<string>('');

  // Debounce: wait 400ms after the user stops typing before committing
  // searchInput -> searchTerm (which triggers the actual fetch below).
  useEffect(() => {
    const t = setTimeout(() => {
      setSearchTerm(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Fetch whenever any query-affecting state changes. Uses AbortController
  // so a slow, stale request can never overwrite a newer one's result.
  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);

    return () => {
      controller.abort();
    };
    // eslint-disable-next-line
  }, [page, limit, searchTerm, typeMutasi, sumberMutasi]);

  const fetchData = async (signal?: AbortSignal): Promise<void> => {
    try {
      setIsLoading(true);
      const res: AxiosResponse<MutasiResponse> = await axios.get(
        `${import.meta.env.VITE_API_LINK}/fg/mutasiBarangByJo`,
        {
          params: {
            page,
            limit,
            search: searchTerm || undefined,
            type_mutasi: typeMutasi || undefined,
            sumber_mutasi: sumberMutasi || undefined,
          },
          withCredentials: true,
          signal,
        },
      );
      console.log('API response:', res.data);
      setData(Array.isArray(res.data?.data) ? res.data.data : []);
      setTotalPages(res.data?.total_page || 1);
    } catch (err) {
      // Ignore aborted requests — they were cancelled intentionally because
      // a newer request superseded them.
      if (axios.isCancel(err) || (err as any)?.name === 'CanceledError') {
        return;
      }
      console.error(err);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLimitChange = (newLimit: number): void => {
    setLimit(newLimit);
    setPage(1);
  };

  // ── Client-side safety net ────────────────────────────────────────────────
  // The backend currently filters at the GROUP level: if a JO/IO group has
  // *any* mutation matching type_mutasi/sumber_mutasi, it returns that group's
  // ENTIRE data_mutasi array — including rows that don't match the filter.
  // (e.g. filtering type_mutasi=masuk still returns "keluar" rows nested
  // inside a group that happens to also have a "masuk" row.)
  //
  // Until that's fixed server-side, re-filter the nested rows here so the
  // table only ever shows rows that actually match the selected filters, and
  // recompute each group's totals/transaction count from the filtered rows.
  const filteredData = useMemo(() => {
    return data
      .map((group) => {
        const filteredMutasi = (group.data_mutasi ?? []).filter((m) => {
          if (
            typeMutasi &&
            m.type_mutasi?.toLowerCase() !== typeMutasi.toLowerCase()
          ) {
            return false;
          }
          if (
            sumberMutasi &&
            (m.sumber_mutasi ?? '').toLowerCase() !== sumberMutasi.toLowerCase()
          ) {
            return false;
          }
          return true;
        });

        const jumlah_qty_masuk = filteredMutasi
          .filter((m) => m.type_mutasi?.toLowerCase() === 'masuk')
          .reduce((s, m) => s + (m.jumlah_qty || 0), 0);
        const jumlah_qty_keluar = filteredMutasi
          .filter((m) => m.type_mutasi?.toLowerCase() === 'keluar')
          .reduce((s, m) => s + (m.jumlah_qty || 0), 0);

        return {
          ...group,
          data_mutasi: filteredMutasi,
          jumlah_qty_masuk,
          jumlah_qty_keluar,
        };
      })
      .filter((group) => group.data_mutasi.length > 0);
  }, [data, typeMutasi, sumberMutasi]);

  return (
    <>
      <main>
        {isLoading && <Loading />}

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden mb-4">
          <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-3 sm:p-4">
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
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
              Mutasi Barang
            </h2>
          </div>

          <div className="p-3 sm:p-4 space-y-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ">
            {/* Search */}
            <div className="relative w-full sm:w-96">
              <input
                type="text"
                placeholder="Search No JO, SO, IO, produk, customer..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                }}
                className="pl-9 pr-3 py-2 text-sm border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 w-full bg-blue-50"
              />
              <svg
                className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={typeMutasi}
                onChange={(e) => {
                  setTypeMutasi(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 text-sm border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 bg-blue-50"
              >
                <option value="">Semua Tipe Mutasi</option>
                <option value="masuk">Masuk</option>
                <option value="keluar">Keluar</option>
              </select>

              <select
                value={sumberMutasi}
                onChange={(e) => {
                  setSumberMutasi(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 text-sm border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 bg-blue-50"
              >
                <option value="">Semua Sumber Mutasi</option>
                <option value="normal">Normal</option>
                <option value="adjust stock">Adjust Stock</option>
                <option value="bap">BAP</option>
                <option value="stock opname">Stock Opname</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-3 sm:p-4 flex items-center justify-between">
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
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
              Data Mutasi Barang
            </h3>
            <span className="text-sm text-white bg-white bg-opacity-20 px-3 py-0.5 rounded-full font-semibold">
              {filteredData.length} Record
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm min-w-[1100px]">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  {[
                    'No',
                    'No JO',

                    'No IO',
                    'Produk',
                    'Customer',
                    'Main JO',
                    'Qty',
                    'Tipe Mutasi',
                    'Tipe Keluar',
                    'Tanggal',
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
                {filteredData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={11}
                      className="p-8 text-center text-gray-500 text-sm"
                    >
                      Tidak ada data mutasi barang
                    </td>
                  </tr>
                ) : (
                  filteredData.map((group, gi) => (
                    <React.Fragment
                      key={`${group.id_jo}-${group.id_io}-${group.no_jo}-${gi}`}
                    >
                      {/* Group header row */}
                      <tr className="bg-violet-50 border-b border-violet-100">
                        <td colSpan={11} className="p-2 px-4">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-violet-700">
                                {group.no_jo}
                              </span>
                              <span className="text-xs text-gray-600 font-medium  max-w-xs">
                                {group.produk}
                              </span>
                              <span className="text-[10px] text-gray-500">
                                {group.customer}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-[10px] text-gray-500">
                              <span>
                                Masuk:{' '}
                                <strong className="text-green-700">
                                  {fmtQty(group.jumlah_qty_masuk)}
                                </strong>
                              </span>
                              <span>
                                Keluar:{' '}
                                <strong className="text-red-600">
                                  {fmtQty(group.jumlah_qty_keluar)}
                                </strong>
                              </span>
                              <span>
                                {group.data_mutasi?.length ?? 0} transaksi
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                      {/* Detail mutasi rows */}
                      {(group.data_mutasi ?? []).map((mutasi, mi) => {
                        const rowIdx =
                          filteredData
                            .slice(0, gi)
                            .reduce(
                              (s, g) => s + (g.data_mutasi?.length ?? 0),
                              0,
                            ) +
                          mi +
                          1;
                        const isMasuk =
                          mutasi.type_mutasi?.toLowerCase() === 'masuk';
                        const rowBg = isMasuk ? 'bg-green-50' : 'bg-red-50';

                        return (
                          <tr
                            key={mutasi.id}
                            className={`border-b transition-colors hover:opacity-80 ${rowBg}`}
                          >
                            <td className="p-2 sm:p-3 pl-8 text-xs text-gray-400">
                              {rowIdx}
                            </td>
                            <td className="p-2 sm:p-3 text-xs font-bold text-violet-600 whitespace-nowrap">
                              {mutasi.no_jo || '-'}
                            </td>

                            <td className="p-2 sm:p-3 text-xs text-gray-600 whitespace-nowrap">
                              {mutasi.no_io || '-'}
                            </td>
                            <td className="p-2 sm:p-3 text-xs max-w-[200px]">
                              <span className="block " title={mutasi.produk}>
                                {mutasi.produk || '-'}
                              </span>
                            </td>
                            <td className="p-2 sm:p-3 text-xs text-gray-700 whitespace-nowrap">
                              {mutasi.customer || '-'}
                            </td>
                            <td className="p-2 sm:p-3 text-xs text-gray-600 whitespace-nowrap">
                              {mutasi.main_jo_mutasi_keluar || '-'}
                            </td>
                            <td
                              className={`p-2 sm:p-3 text-xs text-right font-bold whitespace-nowrap ${
                                isMasuk ? 'text-green-700' : 'text-red-600'
                              }`}
                            >
                              {isMasuk ? '+' : '-'}
                              {fmtQty(mutasi.jumlah_qty)}
                            </td>
                            <td className="p-2 sm:p-3 text-xs">
                              {/* Badge + sumber_mutasi + note, stacked so no extra column is needed */}
                              <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-1.5">
                                  <TypeMutasiBadge type={mutasi.type_mutasi} />
                                  <NoteTooltip note={mutasi.note} />
                                </div>
                                <SumberMutasiTag
                                  sumber={mutasi.sumber_mutasi}
                                />
                              </div>
                            </td>
                            <td className="p-2 sm:p-3 text-xs">
                              {mutasi.type_mutasi?.toLowerCase() ===
                              'keluar' ? (
                                <TypeKeluar
                                  type={mutasi.type_mutasi_keluar ?? ''}
                                />
                              ) : (
                                <span className="text-gray-300 text-xs">-</span>
                              )}
                            </td>
                            <td className="p-2 sm:p-3 text-xs text-gray-500 whitespace-nowrap">
                              {fmtDate(mutasi.tgl_mutasi)}
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination — same pattern as Deposit */}
          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 mt-4 pb-4 px-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Rows per page:</span>
              <div className="flex gap-2">
                {[10, 25, 50, 100].map((pageSize) => (
                  <button
                    key={pageSize}
                    onClick={() => handleLimitChange(pageSize)}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      limit === pageSize
                        ? 'bg-violet-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {pageSize}
                  </button>
                ))}
              </div>
            </div>
            <Stack spacing={2}>
              <Pagination
                count={totalPages}
                color="primary"
                page={page}
                onChange={(_e, i) => setPage(i)}
                size="small"
              />
            </Stack>
          </div>
        </div>
      </main>
    </>
  );
};

export default MutasiBarang;
