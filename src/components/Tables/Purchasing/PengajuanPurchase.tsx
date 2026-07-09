import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import Pagination from '@mui/material/Pagination/Pagination';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import {
  KategoriBarang,
  PengajuanItem,
  PengajuanListResponse,
  RekapPengajuan,
} from './Types/Purchasing.types';
import CreatePOModal from './CreatePOModal';

const KATEGORI_OPTIONS: KategoriBarang[] = [
  'Kertas',
  'Tinta',
  'Corrugated',
  'Poliban',
  'Coating',
  'Lem',
  'Chemical',
  'Lain-lain',
  'Unknown Category',
];

const KATEGORI_COLORS: Record<string, string> = {
  Kertas: 'bg-blue-50 text-blue-700 ring-blue-100',
  Tinta: 'bg-violet-50 text-violet-700 ring-violet-100',
  Corrugated: 'bg-amber-50 text-amber-700 ring-amber-100',
  Poliban: 'bg-teal-50 text-teal-700 ring-teal-100',
  Coating: 'bg-pink-50 text-pink-700 ring-pink-100',
  Lem: 'bg-lime-50 text-lime-700 ring-lime-100',
  Chemical: 'bg-orange-50 text-orange-700 ring-orange-100',
  'Lain-lain': 'bg-slate-100 text-slate-700 ring-slate-200',
  'Unknown Category': 'bg-slate-100 text-slate-500 ring-slate-200',
};

// tipe_barang -> KategoriBarang. Add more aliases here as the API surfaces them.
const getKategoriLabel = (tipeBarang?: string): KategoriBarang => {
  const key = (tipeBarang || '').trim().toLowerCase();
  const match = KATEGORI_OPTIONS.find((k) => k.toLowerCase() === key);
  if (match) return match;
  if (key === 'lain_lain' || key === 'lain-lain' || key === 'lainlain')
    return 'Lain-lain';
  return 'Unknown Category';
};

type ToastState = {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info';
};

const PengajuanPurchase: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<PengajuanItem[]>([]);
  const [rekap, setRekap] = useState<RekapPengajuan[]>([]);
  const [rekapIsEstimate, setRekapIsEstimate] = useState<boolean>(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [searchInput, setSearchInput] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [rencanaCetakFrom, setRencanaCetakFrom] = useState<string>('');
  const [rencanaCetakTo, setRencanaCetakTo] = useState<string>('');
  const [tanggalKirimFrom, setTanggalKirimFrom] = useState<string>('');
  const [tanggalKirimTo, setTanggalKirimTo] = useState<string>('');
  const [kategoriFilter, setKategoriFilter] = useState<string>('');
  const [noJoFilter, setNoJoFilter] = useState<string>('');

  const [showPOModal, setShowPOModal] = useState<boolean>(false);
  const [poMode, setPoMode] = useState<'from_selection' | 'manual'>(
    'from_selection',
  );
  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: '',
    severity: 'success',
  });

  const fetchData = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/purchasing/request`;
    try {
      setLoading(true);
      const res: AxiosResponse<PengajuanListResponse> = await axios.get(url, {
        params: {
          page,
          limit,
          search: searchTerm,
          no_jo: noJoFilter || undefined,
        },
        withCredentials: true,
      });
      const rows = res.data.data || [];
      setData(rows);
      if (res.data.total_page) setTotalPages(res.data.total_page);

      if (res.data.rekap && res.data.rekap.length > 0) {
        setRekap(res.data.rekap);
        setRekapIsEstimate(false);
      } else {
        // Fallback: the endpoint didn't return a global recap, so estimate
        // it from what's currently loaded rather than showing nothing.
        const totals = new Map<KategoriBarang, number>();
        rows.forEach((r) => {
          const kategori = getKategoriLabel(r.tipe_barang);
          totals.set(kategori, (totals.get(kategori) || 0) + r.qty);
        });
        setRekap(
          Array.from(totals.entries()).map(([kategori, total]) => ({
            kategori,
            total,
          })),
        );
        setRekapIsEstimate(true);
      }
    } catch (error) {
      console.error('Error fetching pengajuan data:', error);
      setData([]);
      setToast({
        open: true,
        message: 'Gagal memuat data pengajuan.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    page,
    limit,
    searchTerm,
    rencanaCetakFrom,
    rencanaCetakTo,
    tanggalKirimFrom,
    tanggalKirimTo,
    kategoriFilter,
    noJoFilter,
  ]);

  const handleSearch = () => {
    setSearchTerm(searchInput);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setSearchTerm('');
    setRencanaCetakFrom('');
    setRencanaCetakTo('');
    setTanggalKirimFrom('');
    setTanggalKirimTo('');
    setKategoriFilter('');
    setNoJoFilter('');
    setPage(1);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatQty = (qty: number): string =>
    qty.toLocaleString('id-ID', { maximumFractionDigits: 2 });

  const toggleRow = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === data.length && data.length > 0) {
      setSelected(new Set());
    } else {
      setSelected(new Set(data.map((d) => d.id)));
    }
  };

  const activeFilterCount = useMemo(
    () =>
      [
        searchTerm,
        rencanaCetakFrom,
        rencanaCetakTo,
        tanggalKirimFrom,
        tanggalKirimTo,
        kategoriFilter,
        noJoFilter,
      ].filter(Boolean).length,
    [
      searchTerm,
      rencanaCetakFrom,
      rencanaCetakTo,
      tanggalKirimFrom,
      tanggalKirimTo,
      kategoriFilter,
      noJoFilter,
    ],
  );

  const selectedItems = useMemo(
    () => data.filter((d) => selected.has(d.id)),
    [data, selected],
  );
  const rekapTotal = useMemo(
    () => rekap.reduce((sum, r) => sum + r.total, 0),
    [rekap],
  );

  const handlePOCreated = () => {
    setShowPOModal(false);
    setSelected(new Set());
    setToast({
      open: true,
      message: 'Purchase Order berhasil dibuat sebagai draft.',
      severity: 'success',
    });
    fetchData();
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          {/* <h1 className="text-xl font-semibold text-slate-800">
            Pengajuan Pembelian
          </h1>
          <p className="text-sm text-slate-500">
            Kelola dan kelompokkan kebutuhan material menjadi Purchase Order.
          </p> */}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setPoMode('manual');
              setShowPOModal(true);
            }}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + PO Manual
          </button>
          <button
            onClick={() => {
              setPoMode('from_selection');
              setShowPOModal(true);
            }}
            disabled={selected.size === 0}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Buat PO {selected.size > 0 ? `(${selected.size})` : ''}
          </button>
        </div>
      </div>

      {/* Recap cards
      <div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          <button
            onClick={() => setKategoriFilter('')}
            className={`rounded-xl p-3 text-left ring-1 transition-colors ${
              kategoriFilter === ''
                ? 'bg-slate-800 text-white ring-slate-800'
                : 'bg-white ring-slate-100 hover:ring-slate-200'
            }`}
          >
            <div
              className={`text-xs ${
                kategoriFilter === '' ? 'text-slate-200' : 'text-slate-400'
              }`}
            >
              Semua
            </div>
            <div className="text-lg font-semibold mt-0.5">
              {rekapTotal.toLocaleString('id-ID')}
            </div>
          </button>
          {rekap.map((r) => (
            <button
              key={r.kategori}
              onClick={() =>
                setKategoriFilter(
                  r.kategori === kategoriFilter ? '' : r.kategori,
                )
              }
              className={`rounded-xl p-3 text-left ring-1 transition-colors ${
                KATEGORI_COLORS[r.kategori] ||
                'bg-slate-50 text-slate-700 ring-slate-100'
              } ${
                kategoriFilter === r.kategori
                  ? 'ring-2 ring-offset-1 ring-indigo-400'
                  : ''
              }`}
            >
              <div className="text-xs opacity-70">{r.kategori}</div>
              <div className="text-lg font-semibold mt-0.5">
                {r.total.toLocaleString('id-ID')}
              </div>
            </button>
          ))}
        </div> */}
      {/* {rekapIsEstimate && (
          <p className="text-xs text-slate-400 mt-2">
            * Rekap dihitung dari data pada halaman ini karena API belum
            mengirimkan rekap global.
          </p>
        )} */}
      {/* </div> */}

      {/* Filter card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="xl:col-span-2">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Cari Nama Barang
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ketik nama barang..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                onClick={handleSearch}
                className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Cari
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              No JO
            </label>
            <input
              type="text"
              placeholder="JO-00031/01/2026"
              value={noJoFilter}
              onChange={(e) => setNoJoFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Kategori
            </label>
            <select
              value={kategoriFilter}
              onChange={(e) => setKategoriFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">Semua Kategori</option>
              {KATEGORI_OPTIONS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
        </div>

        {activeFilterCount > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-slate-500">
              {activeFilterCount} filter aktif
            </span>
            <button
              onClick={handleResetFilters}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Reset semua filter
            </button>
          </div>
        )}
      </div>

      {/* Bulk selection bar */}
      {selected.size > 0 && (
        <div className="flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
          <span className="text-sm text-indigo-800 font-medium">
            {selected.size} baris dipilih
          </span>
          <button
            onClick={() => setSelected(new Set())}
            className="text-sm text-indigo-700 hover:text-indigo-900 px-3 py-1.5"
          >
            Batal pilih
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={data.length > 0 && selected.size === data.length}
                    onChange={toggleAll}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  No JO
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Customer
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Rencana Cetak
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Tanggal Kirim
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Nama Barang
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Kategori
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  No BOM PPIC
                </th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Qty
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Satuan
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-14 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-7 w-7 border-2 border-indigo-500 border-t-transparent"></div>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-14 text-center">
                    <p className="text-slate-600 font-medium text-sm">
                      Belum ada pengajuan pembelian
                    </p>
                    <p className="text-slate-400 text-xs mt-1">
                      {activeFilterCount > 0
                        ? 'Coba ubah atau reset filter pencarian.'
                        : 'Ajukan pembelian dari halaman List OTS terlebih dahulu.'}
                    </p>
                  </td>
                </tr>
              ) : (
                data.map((item) => {
                  const kategori = getKategoriLabel(item.tipe_barang);
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(item.id)}
                          onChange={() => toggleRow(item.id)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-indigo-700 font-medium">
                          {item.no_jo}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-slate-700">
                        {item.customer || '-'}
                      </td>
                      <td className="px-3 py-3 text-slate-600 whitespace-nowrap">
                        {formatDate(item.rencana_cetak)}
                      </td>
                      <td className="px-3 py-3 text-slate-600 whitespace-nowrap">
                        {formatDate(item.tanggal_kirim)}
                      </td>
                      <td className="px-3 py-3 text-slate-800 font-medium">
                        {item.nama_item}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ring-1 font-medium ${
                            KATEGORI_COLORS[kategori] ||
                            'bg-slate-100 text-slate-600 ring-slate-200'
                          }`}
                        >
                          {kategori}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="inline-flex bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-md font-medium">
                          {item.no_bom_ppic || '-'}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-slate-700">
                        {formatQty(item.qty)}
                      </td>
                      <td className="px-3 py-3 text-slate-500">
                        {item.satuan || '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Baris per halaman:</span>
          <div className="flex gap-1.5">
            {[10, 25, 50, 100].map((pageSize) => (
              <button
                key={pageSize}
                onClick={() => handleLimitChange(pageSize)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  limit === pageSize
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
            page={page}
            color="primary"
            onChange={(_, i) => setPage(i)}
          />
        </Stack>
      </div>

      {/* Create PO modal */}
      {showPOModal && (
        <CreatePOModal
          mode={poMode}
          selectedItems={poMode === 'from_selection' ? selectedItems : []}
          onClose={() => setShowPOModal(false)}
          onSuccess={handlePOCreated}
        />
      )}

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          severity={toast.severity}
          variant="filled"
          onClose={() => setToast((t) => ({ ...t, open: false }))}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default PengajuanPurchase;
