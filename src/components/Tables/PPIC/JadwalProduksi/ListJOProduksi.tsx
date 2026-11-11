import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import axios from 'axios';
import Loading from '../../../Loading';
import convertTimeStampToDate from '../../../../utils/convertDate';
import formatInteger from '../../../../utils/formaterInteger';
import PopUpTable from './DragAndDropPopUp';
import Modal from './AppModal';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface JOData {
  id: string;
  no_jo: string;
  item: string;
  qty_pcs: number;
  qty_druk: number;
  qty_lp: number;
  qty_po: number;
  tgl_kirim: string;
  tgl_kirim_date: string;
  status: string;
  nama_bahan: string;
  no_io: string;
  createdAt: string;
}

interface JadwalPerJam {
  id: string;
  tanggal: string;
  jam: string;
}

interface TahapData {
  tahapan: string;
  kategori: string;
  nama_kategori: string;
  kategori_drying_time: string;
  mesin: string;
  kapasitas_per_jam: number;
  drying_time: number;
  setting: number;
  kapasitas: number;
  toleransi: number;
  total_waktu: number;
  tgl_from: string;
  jadwal_per_jam: JadwalPerJam[];
}

interface DetailJOData {
  data: {
    id: string;
    no_jo: string;
    item: string;
    qty_pcs: number;
    qty_druk: number;
    tgl_kirim: string;
    tgl_kirim_date: string;
    status: string;
    tahap: TahapData[];
    jadwal_per_jam: JadwalPerJam[];
  };
}

type SortKey = keyof Pick<
  JOData,
  | 'no_jo'
  | 'item'
  | 'nama_bahan'
  | 'qty_pcs'
  | 'qty_druk'
  | 'qty_lp'
  | 'qty_po'
  | 'tgl_kirim_date'
  | 'createdAt'
>;
type SortDirection = 'asc' | 'desc' | null;

interface SortConfig {
  key: SortKey | null;
  direction: SortDirection;
}

const NUMERIC_KEYS: SortKey[] = ['qty_pcs', 'qty_druk', 'qty_lp', 'qty_po'];

/* ------------------------------------------------------------------ */
/* Small UI primitives                                                 */
/* ------------------------------------------------------------------ */

function Icon({ d, className = 'w-4 h-4' }: { d: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

const ICON = {
  search: 'M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z',
  x: 'M6 6l12 12M18 6L6 18',
  chevron: 'M9 6l6 6-6 6',
  calendar:
    'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z',
  check: 'M5 13l4 4L19 7',
  calc: 'M4 4h16v16H4zM8 8h8M8 12h2M14 12h2M8 16h2M14 16h2',
  move: 'M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20',
  eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12zM12 15a3 3 0 100-6 3 3 0 000 6z',
  ban: 'M12 21a9 9 0 100-18 9 9 0 000 18zM5.6 5.6l12.8 12.8',
  refresh:
    'M3 12a9 9 0 0115.5-6.3L21 8M21 3v5h-5M21 12a9 9 0 01-15.5 6.3L3 16M3 21v-5h5',
};

function StatusBadge({ status }: { status: string }) {
  const calculated = status === 'calculated';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
        calculated
          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
          : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
      }`}
    >
      <i
        className={`h-1.5 w-1.5 rounded-full ${
          calculated ? 'bg-emerald-500' : 'bg-amber-500'
        }`}
      />
      {calculated ? 'Sudah dikalkulasi' : 'Belum dikalkulasi'}
    </span>
  );
}

function SortIcon({
  column,
  sortConfig,
}: {
  column: SortKey;
  sortConfig: SortConfig;
}) {
  const isActive = sortConfig.key === column;
  const isAsc = isActive && sortConfig.direction === 'asc';
  const isDesc = isActive && sortConfig.direction === 'desc';
  return (
    <span className="ml-1 inline-flex flex-col gap-[1px] align-middle">
      <svg
        width="8"
        height="5"
        viewBox="0 0 8 5"
        className={`transition-opacity ${isAsc ? 'opacity-100' : 'opacity-30'}`}
      >
        <path d="M4 0L7.46 4.5H0.54L4 0Z" fill="currentColor" />
      </svg>
      <svg
        width="8"
        height="5"
        viewBox="0 0 8 5"
        className={`transition-opacity ${
          isDesc ? 'opacity-100' : 'opacity-30'
        }`}
      >
        <path d="M4 5L0.54 0.5H7.46L4 5Z" fill="currentColor" />
      </svg>
    </span>
  );
}

function InfoItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="break-words text-sm font-semibold text-[#0065de]">
        {value === null || value === undefined || value === '' ? '-' : value}
      </p>
    </div>
  );
}

const MONTHS = [
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

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

function ListJOProduksi() {
  const [isLoading, setIsLoading] = useState(false);
  const [listJO, setListJO] = useState<{ data: JOData[] }>({ data: [] });
  const [selectedJO, setSelectedJO] = useState<DetailJOData | null>(null);
  const [mapData, setMapData] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [mesinList, setmesinList] = useState<any>([]);

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: null,
  });

  // Calculation modal
  const [calcJO, setCalcJO] = useState<JOData | null>(null);
  const [expandedTahap, setExpandedTahap] = useState<Set<number>>(new Set());
  // UI-only selection of jam rows ("tahapIndex:rowKey"); API will be wired later
  const [checkedRows, setCheckedRows] = useState<Set<string>>(new Set());

  // Drag & drop modal (existing PopUpTable + API untouched)
  const [dragTarget, setDragTarget] = useState<{
    tahapan: string;
    data: JadwalPerJam;
  } | null>(null);

  // Cancel modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelNote, setCancelNote] = useState('');
  const [pendingCancelId, setPendingCancelId] = useState<string | null>(null);
  const [pendingCancelJOInfo, setPendingCancelJOInfo] = useState<{
    no_jo: string;
    item: string;
  } | null>(null);

  const handleSort = useCallback((key: SortKey) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        if (prev.direction === 'asc') return { key, direction: 'desc' };
        if (prev.direction === 'desc') return { key: null, direction: null };
      }
      return { key, direction: 'asc' };
    });
  }, []);

  const formatCustomDate = useCallback((dateString: string) => {
    if (!dateString) return '';
    const [datePart, timePart] = dateString.split(' ');
    const [year, month, day] = datePart.split('-');
    return `${parseInt(day)} / ${months(month)} / ${year} ${
      timePart ? '- ' + timePart.replace(/\./g, ':') : ''
    }`;
  }, []);

  /* ------------------------------ API ------------------------------ */

  const fetchAPI = useCallback(
    async (url: string, params = {}, method = 'get', data = {}) => {
      setIsLoading(true);
      try {
        const config = {
          params,
          withCredentials: true,
          ...(method !== 'get' && { data }),
        };
        const response =
          method === 'get'
            ? await axios.get(url, config)
            : method === 'put'
            ? await axios.put(url, config.data, config)
            : await axios.post(url, config.data, config);
        return response.data;
      } catch (error) {
        console.error(`Error in API call to ${url}:`, error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const API_BASE = useMemo(() => import.meta.env.VITE_API_LINK, []);

  const getInitialJadwalView = useCallback(async () => {
    const url = `${API_BASE}/ppic/jadwalProduksiView`;
    const data = await fetchAPI(url, {});
    if (data) setMapData(data.data || []);
  }, [API_BASE, fetchAPI]);

  async function getMasterMesin() {
    const url = `${import.meta.env.VITE_API_LINK}/master/mesinTahapan`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {});
      setIsLoading(false);
      setmesinList(res.data.data);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error.data?.msg);
    }
  }

  const getInitialJOList = useCallback(async () => {
    const url = `${API_BASE}/ppic/jadwalProduksi`;
    const params = { status_tiket: 'incoming', type: 'jadwal' };
    const data = await fetchAPI(url, params);
    if (data) setListJO(data);
  }, [API_BASE, fetchAPI]);

  const getJadwalView = useCallback(async () => {
    const url = `${API_BASE}/ppic/jadwalProduksiView`;
    const data = await fetchAPI(url, {
      start_date: dateRange.startDate,
      end_date: dateRange.endDate,
    });
    if (data) setMapData(data.data || []);
  }, [API_BASE, fetchAPI, dateRange]);

  const getJOList = useCallback(async () => {
    const url = `${API_BASE}/ppic/jadwalProduksi`;
    const params: {
      status_tiket: string;
      start_date?: string;
      end_date?: string;
      search?: string;
    } = { status_tiket: 'incoming' };

    if (dateRange.startDate) params.start_date = dateRange.startDate;
    if (dateRange.endDate) params.end_date = dateRange.endDate;
    if (searchTerm.trim()) params.search = searchTerm.trim();

    const data = await fetchAPI(url, params);
    if (data) setListJO(data);
  }, [API_BASE, fetchAPI, dateRange, searchTerm]);

  const getSingleJO = useCallback(
    async (id: string) => {
      const url = `${API_BASE}/ppic/jadwalProduksi/${id}`;
      const data = await fetchAPI(url);
      if (data) {
        setSelectedJO(data);
        return data;
      }
      return null;
    },
    [API_BASE, fetchAPI],
  );

  const calculateJO = useCallback(
    async (id: string, isLembur: boolean) => {
      if (!window.confirm(`Lakukan Kalkulasi pada JO ini?`)) return false;
      const url = `${API_BASE}/ppic/calculateJadwalProduksi/${id}`;
      const data = await fetchAPI(url, { is_lembur: isLembur });
      if (data) {
        await getJOList();
        return true;
      }
      return false;
    },
    [API_BASE, fetchAPI, getJOList],
  );

  const submitToSchedule = useCallback(
    async (id: string) => {
      if (!window.confirm(`Masukkan JO ini ke jadwal?`)) return false;
      const url = `${API_BASE}/ppic/jadwalProduksi/submit/${id}`;
      const data = await fetchAPI(url, {}, 'put');
      if (data) {
        await getJOList();
        alert('Berhasil masuk jadwal');
        return true;
      }
      return false;
    },
    [API_BASE, fetchAPI, getJOList],
  );

  const handleCancelClick = useCallback((jo: JOData) => {
    setPendingCancelId(jo.id);
    setPendingCancelJOInfo({ no_jo: jo.no_jo, item: jo.item });
    setCancelNote('');
    setCancelModalOpen(true);
  }, []);

  const closeCancelModal = useCallback(() => {
    setCancelModalOpen(false);
    setPendingCancelId(null);
    setPendingCancelJOInfo(null);
    setCancelNote('');
  }, []);

  const cancelJobOrder = useCallback(async () => {
    if (!pendingCancelId) return;
    if (!cancelNote.trim()) {
      alert('Note cancel wajib diisi.');
      return;
    }

    const url = `${API_BASE}/ppic/jadwalProduksi/cancel/${pendingCancelId}`;
    try {
      setIsLoading(true);
      const tglCancel = new Date().toISOString().split('T')[0];

      await axios.delete(url, {
        data: { note_cancel: cancelNote, tgl_cancel: tglCancel },
        withCredentials: true,
      });

      await Promise.all([getInitialJadwalView(), getJOList()]);
      setIsLoading(false);
      closeCancelModal();
      alert('Job Order cancelled successfully!');
    } catch (error: any) {
      setIsLoading(false);
      console.error('Error cancelling job order:', error);
      alert('Failed to cancel job order. Please try again.');
    }
  }, [
    API_BASE,
    pendingCancelId,
    cancelNote,
    getInitialJadwalView,
    getJOList,
    closeCancelModal,
  ]);

  /* ------------------------------ handlers ------------------------------ */

  const resetCalcUI = useCallback(() => {
    setExpandedTahap(new Set());
    setCheckedRows(new Set());
  }, []);

  const handleViewCalculation = useCallback(
    async (jo: JOData) => {
      const data = await getSingleJO(jo.id);
      if (data) {
        resetCalcUI();
        setCalcJO(jo);
      }
    },
    [getSingleJO, resetCalcUI],
  );

  const handleCalculateJO = useCallback(
    async (jo: JOData, isLembur: boolean) => {
      const success = await calculateJO(jo.id, isLembur);
      if (success) handleViewCalculation(jo);
    },
    [calculateJO, handleViewCalculation],
  );

  const closeCalcModal = useCallback(() => {
    setCalcJO(null);
    setDragTarget(null);
    resetCalcUI();
  }, [resetCalcUI]);

  const toggleTahap = (i: number) =>
    setExpandedTahap((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const rowKey = (tahapIndex: number, row: JadwalPerJam, i: number) =>
    `${tahapIndex}:${row.id ?? i}`;

  const toggleRow = (key: string) =>
    setCheckedRows((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const toggleAllRowsInTahap = (
    tahapIndex: number,
    rows: JadwalPerJam[],
    checked: boolean,
  ) =>
    setCheckedRows((prev) => {
      const next = new Set(prev);
      rows.forEach((r, i) => {
        const k = rowKey(tahapIndex, r, i);
        if (checked) next.add(k);
        else next.delete(k);
      });
      return next;
    });

  useEffect(() => {
    getMasterMesin();
    getInitialJadwalView();
    getInitialJOList();
  }, [getInitialJadwalView, getInitialJOList]);

  const handleDateChange = useCallback(
    (field: 'startDate' | 'endDate', value: string) => {
      setDateRange((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleApplyFilters = useCallback(() => {
    getJadwalView();
    getJOList();
  }, [getJadwalView, getJOList]);

  const handleResetFilters = useCallback(() => {
    setDateRange({ startDate: '', endDate: '' });
    setSearchTerm('');
  }, []);

  /* ------------------------------ derived ------------------------------ */

  const filteredJOData = useMemo(() => {
    if (!listJO?.data) return [];
    let filtered = listJO.data;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((jo) =>
        [jo.no_jo, jo.item, jo.nama_bahan, jo.no_io].some(
          (f) => f && f.toString().toLowerCase().includes(q),
        ),
      );
    }

    if (sortConfig.key && sortConfig.direction) {
      const { key, direction } = sortConfig;
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];
        if (NUMERIC_KEYS.includes(key)) {
          return direction === 'asc'
            ? (aVal as number) - (bVal as number)
            : (bVal as number) - (aVal as number);
        }
        const aStr = (aVal ?? '').toString().toLowerCase();
        const bStr = (bVal ?? '').toString().toLowerCase();
        if (aStr < bStr) return direction === 'asc' ? -1 : 1;
        if (aStr > bStr) return direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [listJO?.data, searchTerm, sortConfig]);

  const totalAll = listJO?.data?.length ?? 0;
  const calculatedCount = useMemo(
    () => filteredJOData.filter((j) => j.status === 'calculated').length,
    [filteredJOData],
  );
  const hasFilter =
    !!dateRange.startDate || !!dateRange.endDate || !!searchTerm.trim();

  const tahapList = selectedJO?.data?.tahap ?? [];
  const canSubmit = (selectedJO?.data?.jadwal_per_jam?.length ?? 0) > 0;

  /* ------------------------------ render ------------------------------ */

  const SortableTh = ({
    label,
    column,
    align = 'left',
  }: {
    label: string;
    column: SortKey;
    align?: 'left' | 'right';
  }) => (
    <th
      onClick={() => handleSort(column)}
      aria-sort={
        sortConfig.key === column
          ? sortConfig.direction === 'asc'
            ? 'ascending'
            : 'descending'
          : 'none'
      }
      className={`cursor-pointer select-none whitespace-nowrap border-r border-[#D8EAFF] px-2 py-2 text-[11px] font-semibold uppercase tracking-wide text-[#0065de] transition-colors hover:bg-[#DEF0FF] ${
        align === 'right' ? 'text-right' : 'text-left'
      }`}
    >
      {label}
      <SortIcon column={column} sortConfig={sortConfig} />
    </th>
  );

  return (
    <main className="min-w-0">
      {isLoading && <Loading />}

      <div className="rounded-xl bg-white px-4 py-4">
        {/* Row 1: title + date range + actions */}
        <div className="flex flex-wrap items-end gap-3 border-b border-[#D8EAFF] pb-3">
          <div className="mr-2">
            <h2 className="text-lg font-semibold text-blue-500">
              Job Order Masuk
            </h2>
            <p className="text-xs text-slate-500">
              Kalkulasi dan jadwalkan JO yang belum masuk jadwal produksi
            </p>
          </div>

          <div className="ml-auto flex flex-wrap items-end gap-2">
            <label className="block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Tanggal mulai
              <input
                type="date"
                value={dateRange.startDate}
                max={dateRange.endDate || undefined}
                onChange={(e) => handleDateChange('startDate', e.target.value)}
                disabled={isLoading}
                className="mt-1 block h-9 rounded-lg bg-[#D8EAFF] px-3 text-sm font-medium normal-case tracking-normal text-slate-800 disabled:opacity-60"
              />
            </label>
            <label className="block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Tanggal akhir
              <input
                type="date"
                value={dateRange.endDate}
                min={dateRange.startDate || undefined}
                onChange={(e) => handleDateChange('endDate', e.target.value)}
                disabled={isLoading}
                className="mt-1 block h-9 rounded-lg bg-[#D8EAFF] px-3 text-sm font-medium normal-case tracking-normal text-slate-800 disabled:opacity-60"
              />
            </label>
            <button
              type="button"
              onClick={handleApplyFilters}
              disabled={isLoading}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              <Icon d={ICON.refresh} className="h-4 w-4" />
              {isLoading ? 'Memproses…' : 'Terapkan'}
            </button>
          </div>
        </div>

        {/* Row 2: search + stats */}
        <div className="flex flex-wrap items-center gap-2 pt-3">
          <div className="flex h-9 items-center gap-1 rounded-lg border border-slate-300 bg-white pl-2 pr-1 focus-within:border-[#0065de] focus-within:ring-2 focus-within:ring-[#0065de]/30">
            <Icon d={ICON.search} className="h-4 w-4 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
              disabled={isLoading}
              placeholder="Cari JO, IO, item, atau bahan…"
              className="w-72 bg-transparent text-sm outline-none"
            />
            {searchTerm && (
              <button
                type="button"
                aria-label="Hapus pencarian"
                onClick={() => setSearchTerm('')}
                className="rounded p-1 text-slate-600 hover:bg-slate-100"
              >
                <Icon d={ICON.x} className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {hasFilter && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="h-9 rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Reset filter
            </button>
          )}

          <p className="ml-auto text-sm tabular-nums text-slate-600">
            <span className="font-semibold text-slate-800">
              {filteredJOData.length}
            </span>
            {filteredJOData.length !== totalAll && <> dari {totalAll}</>} JO,{' '}
            <span className="font-semibold text-emerald-600">
              {calculatedCount}
            </span>{' '}
            sudah dikalkulasi,{' '}
            <span className="font-semibold text-amber-600">
              {filteredJOData.length - calculatedCount}
            </span>{' '}
            belum
          </p>
        </div>

        {/* Loading bar */}
        <div
          className={`mt-3 h-0.5 rounded bg-[#0065de] transition-opacity ${
            isLoading ? 'animate-pulse opacity-100' : 'opacity-0'
          }`}
        />

        {/* Table */}
        <div
          className={`relative mt-2 overflow-auto rounded-xl border border-[#D8EAFF] bg-white transition-opacity ${
            isLoading ? 'opacity-60' : ''
          }`}
          style={{ maxHeight: 'calc(100vh - 260px)', minHeight: 320 }}
        >
          <table className="w-full min-w-[1000px] border-collapse">
            <thead className="sticky top-0 z-10 bg-[#eaf4ff]">
              <tr className="border-b border-[#D8EAFF]">
                <th className="w-12 border-r border-[#D8EAFF] px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#0065de]">
                  No
                </th>

                <SortableTh label="Job Order" column="no_jo" />
                <SortableTh label="Item" column="item" />
                <SortableTh label="Bahan" column="nama_bahan" />
                <SortableTh label="Pcs" column="qty_pcs" align="right" />
                <SortableTh label="Druk" column="qty_druk" align="right" />
                <SortableTh label="LP" column="qty_lp" align="right" />
                <SortableTh label="PO" column="qty_po" align="right" />
                <SortableTh label="Tgl Kirim" column="tgl_kirim_date" />

                <th className="sticky right-0 bg-[#eaf4ff] px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-[#0065de]">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredJOData.length > 0 ? (
                filteredJOData.map((jo, index) => {
                  const zebra = index % 2 === 0 ? 'bg-[#F0F7FF]' : 'bg-white';
                  const calculated = jo.status === 'calculated';
                  return (
                    <tr
                      key={jo.id}
                      className={`border-b border-[#E3EEFB] transition-colors hover:bg-[#E3F0FF] ${zebra}`}
                    >
                      <td className="border-r border-[#E3EEFB] px-3 py-3 text-xs tabular-nums text-slate-500">
                        {index + 1}
                      </td>

                      <td className="whitespace-nowrap border-r border-[#E3EEFB] px-3 py-3 text-sm font-semibold text-slate-900">
                        {jo.no_jo}
                        {jo.no_io && (
                          <span className="block text-[11px] font-normal text-slate-500">
                            IO: {jo.no_io}
                          </span>
                        )}
                      </td>
                      <td className="max-w-[240px] border-r border-[#E3EEFB] px-3 py-3 text-sm text-slate-700">
                        {jo.item}
                      </td>
                      <td className="max-w-[200px] border-r border-[#E3EEFB] px-3 py-3 text-sm text-slate-700">
                        {jo.nama_bahan}
                      </td>
                      <td className="whitespace-nowrap border-r border-[#E3EEFB] px-3 py-3 text-right text-sm tabular-nums text-slate-700">
                        {formatInteger(jo.qty_pcs)}
                      </td>
                      <td className="whitespace-nowrap border-r border-[#E3EEFB] px-3 py-3 text-right text-sm tabular-nums text-slate-700">
                        {formatInteger(jo.qty_druk)}
                      </td>
                      <td className="whitespace-nowrap border-r border-[#E3EEFB] px-3 py-3 text-right text-sm tabular-nums text-slate-700">
                        {formatInteger(jo.qty_lp)}
                      </td>
                      <td className="whitespace-nowrap border-r border-[#E3EEFB] px-3 py-3 text-right text-sm tabular-nums text-slate-700">
                        {formatInteger(jo.qty_po)}
                      </td>
                      <td className="whitespace-nowrap border-r border-[#E3EEFB] px-3 py-3 text-xs text-slate-600">
                        {formatCustomDate(jo.tgl_kirim_date)}
                      </td>

                      <td className={`sticky right-0 px-3 py-2 ${zebra}`}>
                        <div className="flex  items-center justify-center gap-1.5">
                          {calculated ? (
                            <button
                              type="button"
                              onClick={() => handleViewCalculation(jo)}
                              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white hover:bg-emerald-700"
                            >
                              <Icon d={ICON.eye} className="h-3.5 w-3.5" />
                              Lihat
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleCalculateJO(jo, false)}
                              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#0065de] px-3 text-xs font-semibold text-white hover:opacity-90"
                            >
                              <Icon d={ICON.calc} className="h-3.5 w-3.5" />
                              Kalkulasi
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleCancelClick(jo)}
                            title="Cancel Job Order"
                            aria-label={`Cancel ${jo.no_jo}`}
                            className="grid h-8 w-8 place-items-center rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"
                          >
                            <Icon d={ICON.ban} className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={12} className="px-4 py-20 text-center">
                    <p className="text-sm font-semibold text-slate-700">
                      Tidak ada data yang ditemukan
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Ubah rentang tanggal atau kata kunci pencarian.
                    </p>
                    {hasFilter && (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="mt-3 h-9 rounded-lg bg-[#0065de] px-4 text-sm font-medium text-white hover:opacity-90"
                      >
                        Reset filter
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------------------- Calculation modal ---------------------- */}
      <Modal
        open={!!calcJO && !!selectedJO}
        onClose={closeCalcModal}
        size="xl"
        title="Rumus Kalkulasi"
        subtitle={
          calcJO && (
            <>
              <span className="font-semibold text-[#0065de]">
                {calcJO.no_jo}
              </span>
              {' · '}
              {calcJO.item}
            </>
          )
        }
        footer={
          <>
            <button
              type="button"
              onClick={closeCalcModal}
              className="h-9 rounded-lg bg-slate-100 px-4 text-sm font-medium text-slate-700 hover:bg-slate-200"
            >
              Tutup
            </button>
            {canSubmit && calcJO && (
              <button
                type="button"
                onClick={() =>
                  submitToSchedule(calcJO.id).then((ok) => {
                    if (ok) closeCalcModal();
                  })
                }
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-emerald-600 px-5 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                <Icon d={ICON.check} />
                Masuk Jadwal
              </button>
            )}
          </>
        }
      >
        {calcJO && (
          <div className="space-y-4">
            {/* JO summary */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl bg-[#F0F7FF] p-4 sm:grid-cols-4">
              <InfoItem label="Nomor JO" value={calcJO.no_jo} />
              <InfoItem label="Nomor IO" value={calcJO.no_io} />
              <InfoItem label="Item" value={calcJO.item} />
              <InfoItem
                label="Tanggal Kirim"
                value={convertTimeStampToDate(calcJO.tgl_kirim)}
              />
              <InfoItem
                label="Qty Druk"
                value={formatInteger(calcJO.qty_druk)}
              />
              <InfoItem label="Qty Pcs" value={formatInteger(calcJO.qty_pcs)} />
              <InfoItem label="Qty LP" value={formatInteger(calcJO.qty_lp)} />
              <InfoItem label="Qty PO" value={formatInteger(calcJO.qty_po)} />
            </div>

            {/* Tahapan toolbar */}
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-semibold text-slate-800">
                Tahapan produksi
                <span className="ml-2 rounded-full bg-[#D8EAFF] px-2 py-0.5 text-xs font-medium text-[#0065de]">
                  {tahapList.length}
                </span>
              </h4>
              <div className="ml-auto flex gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedTahap(new Set(tahapList.map((_, i) => i)))
                  }
                  className="h-8 rounded-lg border border-slate-300 px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Buka semua
                </button>
                <button
                  type="button"
                  onClick={() => setExpandedTahap(new Set())}
                  className="h-8 rounded-lg border border-slate-300 px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Ciutkan semua
                </button>
              </div>
            </div>

            {/* Tahapan list */}
            <div className="overflow-hidden rounded-xl border border-[#D8EAFF]">
              {tahapList.length === 0 && (
                <p className="py-10 text-center text-sm text-slate-500">
                  Belum ada data tahapan.
                </p>
              )}
              {tahapList.map((tahap, ti) => {
                const open = expandedTahap.has(ti);
                const rows = tahap.jadwal_per_jam ?? [];
                const first = rows[0];
                const scheduled = rows.length > 0;
                const checkedInTahap = rows.filter((r, i) =>
                  checkedRows.has(rowKey(ti, r, i)),
                ).length;
                const allChecked =
                  rows.length > 0 && checkedInTahap === rows.length;
                const zebra = ti % 2 === 0 ? 'bg-[#F0F7FF]' : 'bg-white';

                return (
                  <div
                    key={ti}
                    className="border-b border-[#E3EEFB] last:border-0"
                  >
                    {/* Summary row */}
                    <button
                      type="button"
                      onClick={() => toggleTahap(ti)}
                      aria-expanded={open}
                      className={`flex w-full flex-wrap items-center gap-3 px-4 py-3 text-left transition hover:bg-[#E3F0FF] ${zebra}`}
                    >
                      <Icon
                        d={ICON.chevron}
                        className={`h-4 w-4 shrink-0 text-[#0065de] transition-transform ${
                          open ? 'rotate-90' : ''
                        }`}
                      />
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#D8EAFF] text-[11px] font-bold text-[#0065de]">
                        {ti + 1}
                      </span>
                      <span className="min-w-[140px] flex-1 text-sm font-semibold text-slate-800">
                        {tahap.tahapan}
                      </span>
                      <span className="hidden text-xs text-slate-500 sm:inline">
                        {tahap.mesin || '-'}
                      </span>
                      <span className="text-xs tabular-nums text-slate-500">
                        {tahap.total_waktu ?? 0} jam
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          scheduled
                            ? 'bg-blue-50 text-[#0065de] ring-1 ring-blue-200'
                            : 'bg-rose-50 text-rose-600 ring-1 ring-rose-200'
                        }`}
                      >
                        <Icon d={ICON.calendar} className="h-3 w-3" />
                        {scheduled
                          ? `${convertTimeStampToDate(
                              first?.tanggal,
                            )} - ${first?.jam}`
                          : formatCustomDate(tahap.tgl_from) || 'Belum ada'}
                      </span>
                    </button>

                    {/* Expanded detail */}
                    {open && (
                      <div className="space-y-4 border-t border-[#E3EEFB] bg-white px-4 py-4">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 lg:grid-cols-5">
                          <InfoItem
                            label="Kategori"
                            value={[tahap.kategori, tahap.nama_kategori]
                              .filter(Boolean)
                              .join(' - ')}
                          />
                          <InfoItem
                            label="Drying time"
                            value={tahap.kategori_drying_time}
                          />
                          <InfoItem label="Mesin" value={tahap.mesin} />
                          <InfoItem
                            label="Kapasitas / jam"
                            value={tahap.kapasitas_per_jam}
                          />
                          <InfoItem
                            label="Drying time (jam)"
                            value={tahap.drying_time}
                          />
                          <InfoItem
                            label="Setting (jam)"
                            value={tahap.setting}
                          />
                          <InfoItem
                            label="Kapasitas (jam)"
                            value={tahap.kapasitas}
                          />
                          <InfoItem label="Toleransi" value={tahap.toleransi} />
                          <InfoItem
                            label="Total waktu"
                            value={tahap.total_waktu}
                          />
                        </div>

                        {/* Jam schedule (checklist, UI only for now) */}
                        <div className="rounded-xl border border-[#D8EAFF]">
                          <div className="flex flex-wrap items-center gap-2 border-b border-[#D8EAFF] bg-[#eaf4ff] px-3 py-2">
                            <h5 className="text-xs font-semibold uppercase tracking-wide text-[#0065de]">
                              Rincian jadwal per jam
                            </h5>
                            <span className="text-xs text-slate-500">
                              {checkedInTahap > 0
                                ? `${checkedInTahap} dari ${rows.length} jam dipilih`
                                : `${rows.length} jam`}
                            </span>
                            <div className="ml-auto flex gap-1.5">
                              <button
                                type="button"
                                disabled={checkedInTahap === 0}
                                title="Akan aktif setelah API pemindahan jam siap"
                                // TODO: hubungkan ke API ubah jam per baris
                                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#0065de] px-3 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-40"
                              >
                                <Icon d={ICON.move} className="h-3.5 w-3.5" />
                                Ubah jam terpilih
                              </button>
                              <button
                                type="button"
                                disabled={!first}
                                onClick={() =>
                                  first &&
                                  setDragTarget({
                                    tahapan: tahap.tahapan,
                                    data: first,
                                  })
                                }
                                className="h-8 rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                              >
                                Atur drag &amp; drop
                              </button>
                            </div>
                          </div>

                          {rows.length === 0 ? (
                            <p className="px-3 py-6 text-center text-sm text-slate-500">
                              Tahapan ini belum memiliki jadwal per jam.
                            </p>
                          ) : (
                            <div className="max-h-64 overflow-auto">
                              <table className="w-full border-collapse text-sm">
                                <thead className="sticky top-0 bg-white">
                                  <tr className="border-b border-[#E3EEFB] text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                    <th className="w-10 px-3 py-2">
                                      <input
                                        type="checkbox"
                                        aria-label="Pilih semua jam"
                                        checked={allChecked}
                                        onChange={(e) =>
                                          toggleAllRowsInTahap(
                                            ti,
                                            rows,
                                            e.target.checked,
                                          )
                                        }
                                        className="accent-[#0065de]"
                                      />
                                    </th>
                                    <th className="w-12 px-3 py-2">#</th>
                                    <th className="px-3 py-2">Tanggal</th>
                                    <th className="px-3 py-2">Jam</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {rows.map((row, ri) => {
                                    const k = rowKey(ti, row, ri);
                                    const checked = checkedRows.has(k);
                                    return (
                                      <tr
                                        key={k}
                                        onClick={() => toggleRow(k)}
                                        className={`cursor-pointer border-b border-[#E3EEFB] last:border-0 hover:bg-[#F0F7FF] ${
                                          checked ? 'bg-[#E3F0FF]' : ''
                                        }`}
                                      >
                                        <td className="px-3 py-2">
                                          <input
                                            type="checkbox"
                                            checked={checked}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={() => toggleRow(k)}
                                            aria-label={`Pilih baris ${ri + 1}`}
                                            className="accent-[#0065de]"
                                          />
                                        </td>
                                        <td className="px-3 py-2 text-xs tabular-nums text-slate-500">
                                          {ri + 1}
                                        </td>
                                        <td className="px-3 py-2 text-slate-700">
                                          {convertTimeStampToDate(row.tanggal)}
                                        </td>
                                        <td className="px-3 py-2 font-medium tabular-nums text-slate-800">
                                          {row.jam}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Modal>

      {/* ---------------------- Drag & drop modal ---------------------- */}
      <Modal
        open={!!dragTarget && !!calcJO}
        onClose={() => setDragTarget(null)}
        size="screen"
        flush
        stacked
        title="Drag And Drop Edit"
        subtitle={
          dragTarget && calcJO ? (
            <>
              Jadwal {dragTarget.tahapan} · {calcJO.no_jo}
            </>
          ) : undefined
        }
      >
        {dragTarget && calcJO && (
          <PopUpTable
            dataMap={dragTarget.data}
            onClose={() => setDragTarget(null)}
            onFinish={() => {
              setDragTarget(null);
              getSingleJO(calcJO.id);
            }}
          />
        )}
      </Modal>

      {/* ---------------------- Cancel modal ---------------------- */}
      <Modal
        open={cancelModalOpen && !!pendingCancelJOInfo}
        onClose={() => !isLoading && closeCancelModal()}
        title="Cancel Job Order"
        subtitle="Tindakan ini akan membatalkan JO dari antrian penjadwalan."
        footer={
          <>
            <button
              type="button"
              onClick={closeCancelModal}
              disabled={isLoading}
              className="h-9 rounded-lg bg-slate-100 px-4 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={cancelJobOrder}
              disabled={isLoading || !cancelNote.trim()}
              className="h-9 rounded-lg bg-rose-600 px-4 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
            >
              {isLoading ? 'Memproses…' : 'Konfirmasi cancel'}
            </button>
          </>
        }
      >
        {pendingCancelJOInfo && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 rounded-xl bg-[#F0F7FF] p-3">
              <InfoItem label="No JO" value={pendingCancelJOInfo.no_jo} />
              <InfoItem label="Item" value={pendingCancelJOInfo.item} />
              <InfoItem
                label="Tgl cancel"
                value={new Date().toLocaleDateString('id-ID')}
              />
            </div>
            <label className="block text-sm font-medium text-slate-700">
              Note cancel <span className="text-rose-500">*</span>
              <textarea
                value={cancelNote}
                onChange={(e) => setCancelNote(e.target.value)}
                placeholder="Masukkan alasan pembatalan…"
                rows={4}
                autoFocus
                className="mt-1 w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400/30"
              />
            </label>
          </div>
        )}
      </Modal>
    </main>
  );

  function months(m: string) {
    return MONTHS[parseInt(m) - 1];
  }
}

export default ListJOProduksi;
