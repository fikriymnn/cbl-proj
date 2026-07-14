import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import Pagination from '@mui/material/Pagination/Pagination';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import OutlinedInput from '@mui/material/OutlinedInput';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import {
  KategoriBarang,
  PengajuanItem,
  PengajuanListResponse,
} from './Types/Purchasing.types';
import CreatePOModal from './CreatePOModal';

// ---------------------------------------------------------------------------
// Shared helpers / constants (used by both the main page and the detail modal)
// ---------------------------------------------------------------------------

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

// Known label overrides for values coming back from the API (tipe_barang).
// Anything not listed here is title-cased automatically, so new categories
// added on the backend show up without a code change.
const KATEGORI_LABEL_OVERRIDES: Record<string, KategoriBarang> = {
  lain_lain: 'Lain-lain',
  'lain-lain': 'Lain-lain',
  lainlain: 'Lain-lain',
};

const toTitleCase = (value: string): string =>
  value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

// tipe_barang (raw API value) -> display label. Falls back to title-casing
// the raw value instead of "Unknown Category" so new categories from the
// backend render sensibly without needing a code change.
const getKategoriLabel = (tipeBarang?: string): string => {
  const key = (tipeBarang || '').trim().toLowerCase();
  if (!key) return 'Tidak Diketahui';
  if (KATEGORI_LABEL_OVERRIDES[key]) return KATEGORI_LABEL_OVERRIDES[key];
  return toTitleCase(key);
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

type RekapTipeBarangItem = {
  tipe_barang: string;
  total_data: string;
};

type ToastState = {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info';
};

// ---------------------------------------------------------------------------
// Rekap detail modal - shows the same table, scoped to a single tipe_barang
// ---------------------------------------------------------------------------

type RekapDetailModalProps = {
  tipeBarang: string; // raw value, e.g. "coating"
  label: string; // display label, e.g. "Coating"
  onClose: () => void;
};

const RekapDetailModal: React.FC<RekapDetailModalProps> = ({
  tipeBarang,
  label,
  onClose,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<PengajuanItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [searchInput, setSearchInput] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchDetail = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/purchasing/request`;
    try {
      const res: AxiosResponse<PengajuanListResponse> = await axios.get(url, {
        params: {
          page,
          limit,
          search: searchTerm || undefined,
          tipe_barang: tipeBarang,
        },
        withCredentials: true,
      });

      setData(res.data.data || []);
      if (res.data.total_page) setTotalPages(res.data.total_page);
    } catch (error) {
      console.error('Error fetching rekap detail data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchTerm, tipeBarang]);

  const handleSearch = () => {
    setSearchTerm(searchInput);
    setPage(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />

      {/* Modal panel */}
      <div className="relative bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-800">
              Detail Pengajuan
              <span
                className={`ml-2 text-xs px-2 py-0.5 rounded-full ring-1 font-medium align-middle ${
                  KATEGORI_COLORS[label] ||
                  'bg-slate-100 text-slate-600 ring-slate-200'
                }`}
              >
                {label}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Menampilkan pengajuan dengan tipe barang &quot;{label}&quot;
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1.5 hover:bg-slate-100 transition-colors"
            aria-label="Tutup"
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-slate-100">
          <div className="flex gap-2 max-w-md">
            <input
              type="text"
              placeholder="Cari nama barang atau no JO..."
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

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 sticky top-0">
              <tr>
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
                  <td colSpan={8} className="px-4 py-14 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-7 w-7 border-2 border-indigo-500 border-t-transparent"></div>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-14 text-center">
                    <p className="text-slate-600 font-medium text-sm">
                      Tidak ada data untuk kategori ini
                    </p>
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
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
                      {formatDate(item.tgl_kirim)}
                    </td>
                    <td className="px-3 py-3 text-slate-800 font-medium">
                      {item.nama_item}
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-end px-5 py-3 border-t border-slate-100">
          <Stack spacing={2}>
            <Pagination
              count={totalPages}
              page={page}
              size="small"
              color="primary"
              onChange={(_, i) => setPage(i)}
            />
          </Stack>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

const PengajuanPurchase: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<PengajuanItem[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const [rekapTipeBarang, setRekapTipeBarang] = useState<RekapTipeBarangItem[]>(
    [],
  );
  const [rekapLoading, setRekapLoading] = useState<boolean>(true);

  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [searchInput, setSearchInput] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [rencanaCetakFrom, setRencanaCetakFrom] = useState<string>('');
  const [rencanaCetakTo, setRencanaCetakTo] = useState<string>('');
  const [tanggalKirimFrom, setTanggalKirimFrom] = useState<string>('');
  const [tanggalKirimTo, setTanggalKirimTo] = useState<string>('');
  // Raw tipe_barang values (e.g. ["coating", "corrugated"]). Sent to the API
  // as a comma-separated string, e.g. "coating, corrugated".
  const [kategoriFilter, setKategoriFilter] = useState<string[]>([]);
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

  // Rekap detail popup: which tipe_barang is currently open, if any.
  const [detailModal, setDetailModal] = useState<{
    tipeBarang: string;
    label: string;
  } | null>(null);

  const fetchData = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/purchasing/request`;
    try {
      setLoading(true);
      console.log('Fetching pengajuan data with params:', {
        page,
        limit,
        search: searchTerm || undefined,
        tipe_barang: kategoriFilter.length > 0 ? kategoriFilter : undefined,
      });
      const res: AxiosResponse<PengajuanListResponse> = await axios.get(url, {
        params: {
          page,
          limit,
          status: 'incoming',
          search: searchTerm || undefined,

          tipe_barang: kategoriFilter.length > 0 ? kategoriFilter : undefined,
        },
        withCredentials: true,
      });
      console.log('Fetched pengajuan data:', res.data);
      const rows = res.data.data || [];
      setData(rows);
      if (res.data.total_page) setTotalPages(res.data.total_page);
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

  const fetchRekapTipeBarang = async (): Promise<void> => {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/purchasing/rekapRequestTipeBarang`;
    try {
      setRekapLoading(true);
      const res = await axios.get(url, { withCredentials: true });
      setRekapTipeBarang(res.data?.data || []);
    } catch (error) {
      console.error('Error fetching rekap tipe barang:', error);
      setRekapTipeBarang([]);
    } finally {
      setRekapLoading(false);
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

  useEffect(() => {
    fetchRekapTipeBarang();
  }, []);

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
    setKategoriFilter([]);
    setNoJoFilter('');
    setPage(1);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleKategoriChange = (event: SelectChangeEvent<string[]>) => {
    const { value } = event.target;
    // On autofill we get a stringified value.
    const next = typeof value === 'string' ? value.split(',') : value;
    setKategoriFilter(next);
    setPage(1);
  };

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
        noJoFilter,
      ].filter(Boolean).length + (kategoriFilter.length > 0 ? 1 : 0),
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
    () =>
      rekapTipeBarang.reduce((sum, r) => sum + Number(r.total_data || 0), 0),
    [rekapTipeBarang],
  );

  // Dynamic dropdown options built straight from whatever tipe_barang values
  // the rekap endpoint returns, so new categories show up automatically.
  const kategoriOptions = useMemo(
    () =>
      rekapTipeBarang
        .map((r) => ({
          value: r.tipe_barang,
          label: getKategoriLabel(r.tipe_barang),
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [rekapTipeBarang],
  );

  // Quick lookup so the Select can render human-friendly labels for the
  // chips/menu even though the stored values are the raw tipe_barang values.
  const kategoriLabelByValue = useMemo(
    () => Object.fromEntries(kategoriOptions.map((o) => [o.value, o.label])),
    [kategoriOptions],
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
    fetchRekapTipeBarang();
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

      {/* Recap cards - click a category to see its detail popup */}
      <div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          <div className="rounded-xl p-3 text-left ring-1 bg-slate-800 text-white ring-slate-800">
            <div className="text-xs text-slate-200">Semua</div>
            <div className="text-lg font-semibold mt-0.5">
              {rekapLoading ? '…' : rekapTotal.toLocaleString('id-ID')}
            </div>
          </div>

          {rekapLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl p-3 bg-slate-50 ring-1 ring-slate-100 animate-pulse h-[58px]"
                />
              ))
            : rekapTipeBarang.map((r) => {
                const label = getKategoriLabel(r.tipe_barang);
                const total = Number(r.total_data || 0);
                return (
                  <button
                    key={r.tipe_barang}
                    onClick={() =>
                      setDetailModal({ tipeBarang: r.tipe_barang, label })
                    }
                    className={`rounded-xl p-3 text-left ring-1 transition-colors ${
                      KATEGORI_COLORS[label] ||
                      'bg-slate-50 text-slate-700 ring-slate-100'
                    }`}
                  >
                    <div className="text-xs opacity-70">{label}</div>
                    <div className="text-lg font-semibold mt-0.5">
                      {total.toLocaleString('id-ID')}
                    </div>
                  </button>
                );
              })}
        </div>
      </div>

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
            <Select
              multiple
              displayEmpty
              value={kategoriFilter}
              onChange={handleKategoriChange}
              input={<OutlinedInput className="w-full" />}
              className="w-full bg-white"
              sx={{
                '& .MuiOutlinedInput-input': { padding: '8.5px 14px' },
                fontSize: '0.875rem',
              }}
              renderValue={(selectedValues) => {
                if (selectedValues.length === 0) {
                  return <span className="text-slate-400">Semua Kategori</span>;
                }
                return (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selectedValues.map((value) => (
                      <Chip
                        key={value}
                        label={kategoriLabelByValue[value] || value}
                        size="small"
                      />
                    ))}
                  </Box>
                );
              }}
              MenuProps={{ PaperProps: { style: { maxHeight: 320 } } }}
            >
              {kategoriOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  <Checkbox
                    checked={kategoriFilter.indexOf(opt.value) > -1}
                    size="small"
                  />
                  <ListItemText primary={opt.label} />
                </MenuItem>
              ))}
            </Select>
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
                        {formatDate(item.tgl_kirim)}
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

      {/* Rekap detail popup */}
      {detailModal && (
        <RekapDetailModal
          tipeBarang={detailModal.tipeBarang}
          label={detailModal.label}
          onClose={() => setDetailModal(null)}
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
