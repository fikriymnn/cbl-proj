import React, { useEffect, useRef, useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import Loading from '../../Loading';
import { Pagination, Stack } from '@mui/material';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DataBarang {
  id: number;
  id_customer: number;
  id_io: number;
  id_jo: number;
  id_produk: number;
  id_so: number;
  is_active: number;
  jumlah_qty: number;
  jumlah_qty_keluar: number;
  jumlah_qty_sisa: number;
  no_io: string;
  no_jo: string;
  no_po_customer: string;
  no_so: string;
  note: string | null;
  po_qty: number;
  produk: string;
  customer: string;
  toleransi_pengiriman: string;
  createdAt: string;
  updatedAt: string;
}

interface GudangItem {
  id_customer: number;
  id_io: number;
  id_produk: number;
  jumlah_qty: number;
  jumlah_qty_keluar: number;
  jumlah_qty_sisa: number;
  no_io: string;
  produk: string;
  customer: string;
  data_barang: DataBarang[];
}

interface GudangResponse {
  data: GudangItem[];
  status: number;
  success: boolean;
  total_page?: number;
}

interface SendDoItem {
  id: number;
  jumlah_kirim: number;
  is_main_jo?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtQty(val: number | null | undefined) {
  if (val == null) return '-';
  return val.toLocaleString('id-ID');
}

// ─── Send DO Modal ────────────────────────────────────────────────────────────

function SendDoModal({
  selected,
  onClose,
  onConfirm,
}: {
  selected: DataBarang[];
  onClose: () => void;
  onConfirm: (type: 'single' | 'group', payload: SendDoItem[]) => void;
}) {
  const isSingle = selected.length === 1;
  const [type, setType] = useState<'single' | 'group'>(
    isSingle ? 'single' : 'group',
  );
  const [quantities, setQuantities] = useState<Record<number, string>>(() => {
    const init: Record<number, string> = {};
    selected.forEach((r) => {
      init[r.id] = String(r.jumlah_qty_sisa ?? 0);
    });
    return init;
  });
  const [mainJoId, setMainJoId] = useState<number | null>(
    selected[0]?.id ?? null,
  );

  function handleConfirm() {
    const payload: SendDoItem[] = selected.map((r) => ({
      id: r.id,
      jumlah_kirim: Number(quantities[r.id]) || 0,
      ...(type === 'group' ? { is_main_jo: r.id === mainJoId } : {}),
    }));
    onConfirm(type, payload);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
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
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
              Send Delivery Order
            </h3>
            <p className="text-violet-200 text-sm mt-0.5">
              {selected.length} item dipilih
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
          {/* Type selector — only if multiple selected */}
          {!isSingle && (
            <div className="flex gap-3">
              {(['single', 'group'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                    type === t
                      ? 'border-violet-500 bg-violet-50 text-violet-700'
                      : 'border-gray-200 bg-white text-gray-500 hover:border-violet-300'
                  }`}
                >
                  {t === 'single' ? 'Single DO' : 'Group DO'}
                </button>
              ))}
            </div>
          )}

          {type === 'group' && !isSingle && (
            <div className="bg-indigo-50 rounded-xl p-3 text-xs text-indigo-700 border border-indigo-200">
              <strong>Group DO:</strong> Pilih satu item sebagai indukan
              (is_main_jo = true).
            </div>
          )}

          {/* Items */}
          <div className="space-y-3">
            {selected.map((row) => (
              <div
                key={row.id}
                className={`rounded-xl border-2 p-4 space-y-3 transition-all ${
                  type === 'group' && row.id === mainJoId
                    ? 'border-violet-400 bg-violet-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">
                      {row.produk || '-'}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {row.no_jo} — {row.customer}
                    </p>
                    <div className="flex gap-4 mt-1 text-xs">
                      <span className="text-gray-400">
                        Sisa Stok:{' '}
                        <span className="font-semibold text-gray-700">
                          {fmtQty(row.jumlah_qty_sisa)}
                        </span>
                      </span>
                      <span className="text-gray-400">
                        No IO:{' '}
                        <span className="font-semibold text-gray-700">
                          {row.no_io}
                        </span>
                      </span>
                    </div>
                  </div>
                  {type === 'group' && !isSingle && (
                    <button
                      onClick={() => setMainJoId(row.id)}
                      className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all ${
                        row.id === mainJoId
                          ? 'bg-violet-500 text-white border-violet-500'
                          : 'bg-white text-gray-500 border-gray-300 hover:border-violet-400'
                      }`}
                    >
                      {row.id === mainJoId ? '★ Indukan' : 'Set Indukan'}
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600">
                    Jumlah Kirim:
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={row.jumlah_qty_sisa ?? undefined}
                    value={quantities[row.id] ?? ''}
                    onChange={(e) =>
                      setQuantities((p) => ({ ...p, [row.id]: e.target.value }))
                    }
                    className="w-full rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 pb-5 pt-3 border-t border-gray-100 flex gap-3 justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg text-sm transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg text-sm transition-colors"
          >
            Kirim DO
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const GudangFG: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<GudangItem[]>([]);
  const [selectedBarang, setSelectedBarang] = useState<DataBarang[]>([]);
  const [showSendDo, setShowSendDo] = useState(false);

  // Pagination & search — same pattern as Deposit
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [page, limit, searchTerm]);

  const fetchData = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const res: AxiosResponse<GudangResponse> = await axios.get(
        `${import.meta.env.VITE_API_LINK}/fg/gudangFinishGoodByIo`,
        {
          params: { page, limit, search: searchTerm || undefined },
          withCredentials: true,
        },
      );
      setData(Array.isArray(res.data?.data) ? res.data.data : []);
      setTotalPages(res.data?.total_page || 1);
    } catch (err) {
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

  function handleSearchChange(val: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchTerm(val);
      setPage(1);
    }, 400);
  }

  // Flatten all data_barang for selection tracking
  function getAllBarang(): DataBarang[] {
    return data.flatMap((g) => g.data_barang ?? []);
  }

  function toggleBarang(barang: DataBarang) {
    setSelectedBarang((prev) => {
      const exists = prev.find((b) => b.id === barang.id);
      return exists
        ? prev.filter((b) => b.id !== barang.id)
        : [...prev, barang];
    });
  }

  function toggleSelectAll() {
    const all = getAllBarang();
    if (selectedBarang.length === all.length) {
      setSelectedBarang([]);
    } else {
      setSelectedBarang(all);
    }
  }

  const isSelected = (id: number) => selectedBarang.some((b) => b.id === id);

  const handleSendDo = async (
    type: 'single' | 'group',
    payload: SendDoItem[],
  ): Promise<void> => {
    const endpoint =
      type === 'single'
        ? '/fg/gudangFinishGood/sendDo/single'
        : '/fg/gudangFinishGood/sendDo/group';
    try {
      setIsLoading(true);
      await axios.post(
        `${import.meta.env.VITE_API_LINK}${endpoint}`,
        { data_barang: payload },
        { withCredentials: true },
      );
      setShowSendDo(false);
      setSelectedBarang([]);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const allBarang = getAllBarang();

  return (
    <>
      <main>
        {isLoading && <Loading />}

        {showSendDo && selectedBarang.length > 0 && (
          <SendDoModal
            selected={selectedBarang}
            onClose={() => setShowSendDo(false)}
            onConfirm={handleSendDo}
          />
        )}

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
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
              Gudang Finish Good
            </h2>
          </div>
          <div className="p-3 sm:p-4">
            <div className="relative w-full sm:w-96">
              <input
                type="text"
                placeholder="Search No JO, IO, produk, customer..."
                onChange={(e) => handleSearchChange(e.target.value)}
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
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-3 sm:p-4 flex items-center justify-between gap-3 flex-wrap">
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
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
              Data Gudang FG
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              {selectedBarang.length > 0 && (
                <button
                  onClick={() => setShowSendDo(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-xs font-semibold rounded-lg transition-all border border-white border-opacity-40"
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
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                  Send DO ({selectedBarang.length})
                </button>
              )}
              <span className="text-sm text-white bg-white bg-opacity-20 px-3 py-0.5 rounded-full font-semibold">
                {data.length} Record
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm min-w-[1000px]">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="p-2 sm:p-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        allBarang.length > 0 &&
                        selectedBarang.length === allBarang.length
                      }
                      onChange={toggleSelectAll}
                      className="rounded accent-violet-600"
                    />
                  </th>
                  {[
                    'No',
                    'No IO',
                    'Produk',
                    'Customer',
                    'No JO',
                    'No SO',
                    'PO Qty',
                    'Jml Masuk',
                    'Jml Keluar',
                    'Sisa Stok',
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
                {data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={11}
                      className="p-8 text-center text-gray-500 text-sm"
                    >
                      Tidak ada data gudang FG
                    </td>
                  </tr>
                ) : (
                  data.map((group, gi) => (
                    <React.Fragment key={`${group.id_io}-${group.id_produk}`}>
                      {/* Group header row */}
                      <tr className="bg-violet-50 border-b border-violet-100">
                        <td colSpan={11} className="p-2 px-4">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-violet-700">
                                {group.no_io}
                              </span>
                              <span className="text-xs text-gray-600 font-medium truncate max-w-xs">
                                {group.produk}
                              </span>
                              <span className="text-[10px] text-gray-500">
                                {group.customer}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-[10px] text-gray-500">
                              <span>
                                Total Masuk:{' '}
                                <strong className="text-green-700">
                                  {fmtQty(group.jumlah_qty)}
                                </strong>
                              </span>
                              <span>
                                Total Keluar:{' '}
                                <strong className="text-red-600">
                                  {fmtQty(group.jumlah_qty_keluar)}
                                </strong>
                              </span>
                              <span>
                                Sisa:{' '}
                                <strong className="text-indigo-700">
                                  {fmtQty(group.jumlah_qty_sisa)}
                                </strong>
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                      {/* Detail rows */}
                      {(group.data_barang ?? []).map((barang, bi) => {
                        const sel = isSelected(barang.id);
                        const rowIdx =
                          data
                            .slice(0, gi)
                            .reduce(
                              (s, g) => s + (g.data_barang?.length ?? 0),
                              0,
                            ) +
                          bi +
                          1;
                        return (
                          <tr
                            key={barang.id}
                            className={`border-b transition-colors cursor-pointer ${
                              sel
                                ? 'bg-violet-50 hover:bg-violet-100'
                                : 'hover:bg-blue-50'
                            }`}
                            onClick={() => toggleBarang(barang)}
                          >
                            <td
                              className="p-2 sm:p-3 pl-8"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="checkbox"
                                checked={sel}
                                onChange={() => toggleBarang(barang)}
                                className="rounded accent-violet-600"
                              />
                            </td>
                            <td className="p-2 sm:p-3 text-xs text-gray-400 pl-8">
                              {rowIdx}
                            </td>
                            <td className="p-2 sm:p-3 text-xs text-gray-600 whitespace-nowrap">
                              {barang.no_io || '-'}
                            </td>
                            <td className="p-2 sm:p-3 text-xs max-w-[180px]">
                              <span
                                className="block truncate"
                                title={barang.produk}
                              >
                                {barang.produk || '-'}
                              </span>
                            </td>
                            <td className="p-2 sm:p-3 text-xs text-gray-700">
                              {barang.customer || '-'}
                            </td>
                            <td className="p-2 sm:p-3 text-xs font-bold text-violet-600 whitespace-nowrap">
                              {barang.no_jo || '-'}
                            </td>
                            <td className="p-2 sm:p-3 text-xs text-blue-600 whitespace-nowrap">
                              {barang.no_so || '-'}
                            </td>
                            <td className="p-2 sm:p-3 text-xs text-right font-medium">
                              {fmtQty(barang.po_qty)}
                            </td>
                            <td className="p-2 sm:p-3 text-xs text-right font-bold text-green-700">
                              {fmtQty(barang.jumlah_qty)}
                            </td>
                            <td className="p-2 sm:p-3 text-xs text-right font-bold text-red-600">
                              {fmtQty(barang.jumlah_qty_keluar)}
                            </td>
                            <td className="p-2 sm:p-3 text-xs text-right font-bold text-indigo-700">
                              {fmtQty(barang.jumlah_qty_sisa)}
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

export default GudangFG;
