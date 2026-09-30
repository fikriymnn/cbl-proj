import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import ModalXL from './ModalXL';
import Loading from '../../../Loading';
import JobOrderTable from './JobOrderTable';
import convertTimeStampToDate from '../../../../utils/convertDate';
import {
  ChipStatus,
  DAY_NAMES,
  HEADER_H,
  ICONS,
  Icon,
  JODetailContent,
  JobChip,
  JobDetailCard,
  ListJOData,
  MAX_CHIPS,
  MachineFilter,
  Segmented,
  SIDEBAR_W,
  currentMonthStr,
  dayKey,
  groupByMachineDay,
  isWeekend,
  parseYMD,
  shiftMonth,
  toYMD,
  useClickOutside,
} from './Jadwalshared';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface LoadingState {
  main: boolean;
  schedule: boolean;
  overtime: boolean;
  detail: boolean;
}

type ViewMode = 'default' | 'lembur';
type Density = 'comfortable' | 'compact';
type ToastType = 'success' | 'error' | 'info';

const COL_W: Record<Density, number> = { comfortable: 124, compact: 96 };

const EXPORT_COLS = [
  'No JO',
  'No Booking',
  'Item',
  'Kategori',
  'Nama Kategori',
  'Tahapan',
  'Tahapan Ke',
  'Tanggal',
  'Mesin',
  'Qty Pieces',
  'Qty Druk',
  'Jam',
  'Total Waktu',
  'Kapasitas/Jam',
  'Drying Time',
  'Setting',
];

const buildRange = (start: string, end: string, prev: any[]) => {
  if (!start || !end) return [];
  const s = parseYMD(start);
  const e = parseYMD(end);
  const prevMap = new Map(prev.map((p) => [p.tanggal_lembur, p]));
  const out: any[] = [];
  for (
    const d = new Date(s);
    d <= e && out.length < 366;
    d.setDate(d.getDate() + 1)
  ) {
    const key = toYMD(d);
    out.push(
      prevMap.get(key) ?? {
        tanggal_lembur: key,
        shift_1: false,
        shift_2: false,
      },
    );
  }
  return out;
};

/* ------------------------------------------------------------------ */
/* Excel export                                                        */
/* ------------------------------------------------------------------ */

const exportToExcel = (data: any[], filename = 'production_schedule') => {
  const blank = (): Record<string, any> =>
    Object.fromEntries(EXPORT_COLS.map((c) => [c, '']));

  const grouped = data.reduce((acc: any, item: any) => {
    const jobNumber = item.no_jo || item.no_booking || 'No Job Number';
    if (!acc[jobNumber]) {
      acc[jobNumber] = {
        no_jo: item.no_jo,
        no_booking: item.no_booking,
        item: item.item,
        tahapan_list: {},
      };
    }
    if (!acc[jobNumber].tahapan_list[item.tahapan]) {
      acc[jobNumber].tahapan_list[item.tahapan] = {
        tahapan: item.tahapan,
        tahapan_ke: item.tahapan_ke,
        kategori: item.kategori,
        nama_kategori: item.nama_kategori,
        dates: {},
      };
    }
    const dateObj = new Date(item.tanggal);
    const date = dateObj.toLocaleDateString('id-ID');
    const dates = acc[jobNumber].tahapan_list[item.tahapan].dates;
    if (!dates[date]) {
      dates[date] = {
        tanggal: date,
        ts: new Date(dateObj).setHours(0, 0, 0, 0),
        machines: [],
      };
    }
    dates[date].machines.push({
      mesin: item.mesin,
      qty_pcs: item.qty_pcs,
      qty_druk: item.qty_druk,
      jam: item.jam,
      total_waktu: item.total_waktu,
      kapasitas_per_jam: item.kapasitas_per_jam,
      drying_time: item.drying_time,
      setting: item.setting,
    });
    return acc;
  }, {});

  const excelData: Record<string, any>[] = [];
  Object.values(grouped).forEach((jobInfo: any) => {
    excelData.push({
      ...blank(),
      'No JO': jobInfo.no_jo || '',
      'No Booking': jobInfo.no_booking || '',
      Item: jobInfo.item,
    });
    const sortedTahapan = Object.values(jobInfo.tahapan_list).sort(
      (a: any, b: any) => (a.tahapan_ke || 0) - (b.tahapan_ke || 0),
    );
    sortedTahapan.forEach((t: any) => {
      excelData.push({
        ...blank(),
        Kategori: t.kategori,
        'Nama Kategori': t.nama_kategori,
        Tahapan: `${t.tahapan} (Stage ${t.tahapan_ke})`,
        'Tahapan Ke': t.tahapan_ke,
      });
      Object.values(t.dates)
        .sort((a: any, b: any) => a.ts - b.ts)
        .forEach((d: any) => {
          d.machines.forEach((m: any, index: number) => {
            excelData.push({
              ...blank(),
              Tanggal: index === 0 ? d.tanggal : '',
              Mesin: m.mesin,
              'Qty Pieces': m.qty_pcs,
              'Qty Druk': m.qty_druk,
              Jam: m.jam,
              'Total Waktu': m.total_waktu,
              'Kapasitas/Jam': m.kapasitas_per_jam,
              'Drying Time': m.drying_time,
              Setting: m.setting,
            });
          });
        });
    });
    excelData.push({ ...blank(), Tanggal: '---', Mesin: '---' });
  });

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(excelData, {
    header: EXPORT_COLS,
  });
  worksheet['!cols'] = [
    15, 15, 40, 10, 15, 15, 10, 12, 10, 12, 12, 10, 15, 15, 12, 10,
  ].map((wch) => ({ wch }));
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Production Schedule');

  const allDates = data
    .map((item: any) => new Date(item.tanggal))
    .filter((date: any) => !isNaN(date));
  const minDate = new Date(Math.min(...(allDates as any)));
  const maxDate = new Date(Math.max(...(allDates as any)));
  const formatDate = (date: Date) =>
    date.toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit' });
  const exportDate = new Date()
    .toLocaleDateString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    .replace(/\//g, '-');
  const dataRange =
    minDate.getMonth() === maxDate.getMonth() &&
    minDate.getFullYear() === maxDate.getFullYear()
      ? formatDate(minDate).replace('/', '-')
      : `${formatDate(minDate).replace('/', '-')}_to_${formatDate(
          maxDate,
        ).replace('/', '-')}`;
  XLSX.writeFile(
    workbook,
    `${filename}_${dataRange}_exported_${exportDate}.xlsx`,
  );
};

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

function TampilanMonthlyJO() {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    main: false,
    schedule: false,
    overtime: false,
    detail: false,
  });
  const [booted, setBooted] = useState(false);
  const [machinesReady, setMachinesReady] = useState(false);

  // Data
  const [historyListJO, setHistoryListJO] = useState<ListJOData>({ data: [] });
  const [penjadwalanListJO, setPenjadwalanListJO] = useState<ListJOData>({
    data: [],
  });
  const [mapData, setMapData] = useState<any[]>([]);
  const [lemburViewData, setLemburViewData] = useState<any[]>([]);
  const [listJO1, setJo1] = useState<any>();
  const [machineList, setMachineList] = useState<string[]>([]);

  // View
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);
  const [activeView, setActiveView] = useState<ViewMode>('default');
  const [density, setDensity] = useState<Density>('comfortable');
  const [hideEmpty, setHideEmpty] = useState(false);
  const [expandedCells, setExpandedCells] = useState<Set<string>>(new Set());
  const [clickedJobOrder, setClickedJobOrder] = useState<any>(null);

  // Machine filter (null = all machines)
  const [machineFilter, setMachineFilter] = useState<Set<string> | null>(null);

  // Search
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(-1);
  const [searchOpen, setSearchOpen] = useState(false);

  // Job order modal (kept from the original)
  const [selectedJO, setSelectedJO] = useState<any>(null);
  const [selectedIndex, setSelectedIndex] = useState<any>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [showDetail, setShowDetail] = useState<boolean[]>([]);

  // Overtime modal
  const [editMachine, setEditMachine] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [lemburData, setLemburData] = useState<any[]>([]);

  const [toast, setToast] = useState<{ type: ToastType; text: string } | null>(
    null,
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const scheduleReq = useRef(0);
  const overtimeReq = useRef(0);

  const colW = COL_W[density];
  const todayKey = useMemo(() => dayKey(new Date()), []);

  /* ------------------------------ derived ------------------------------ */

  const monthDates = useMemo(() => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();
    return Array.from(
      { length: daysInMonth },
      (_, i) => new Date(y, m - 1, i + 1),
    );
  }, [selectedMonth]);

  const dateRangeForMonth = useMemo(() => {
    const [y, m] = selectedMonth.split('-').map(Number);
    return { start: `${selectedMonth}-01`, end: toYMD(new Date(y, m, 0)) };
  }, [selectedMonth]);

  // Machines from master list, plus any that only show up in schedule data.
  const allMachines = useMemo(() => {
    const set = new Set(machineList);
    const extras: string[] = [];
    [...mapData, ...lemburViewData].forEach((d) => {
      if (d.mesin && !set.has(d.mesin)) {
        set.add(d.mesin);
        extras.push(d.mesin);
      }
    });
    return [...machineList, ...extras];
  }, [machineList, mapData, lemburViewData]);

  // machine -> dayKey -> merged entries, ordered by earliest hour then JO number
  const groupedData = useMemo(() => groupByMachineDay(mapData), [mapData]);

  // machine -> dayKey -> overtime shifts
  const lemburGrouped = useMemo(() => {
    const grouped = new Map<
      string,
      Map<string, { s1: boolean; s2: boolean }>
    >();
    lemburViewData.forEach((l) => {
      const [y, m, d] = String(l.tanggal_lembur)
        .split('T')[0]
        .split('-')
        .map(Number);
      const k = `${y}-${m - 1}-${d}`;
      if (!grouped.has(l.mesin)) grouped.set(l.mesin, new Map());
      const mm = grouped.get(l.mesin)!;
      const cur = mm.get(k) ?? { s1: false, s2: false };
      mm.set(k, { s1: cur.s1 || !!l.shift_1, s2: cur.s2 || !!l.shift_2 });
    });
    return grouped;
  }, [lemburViewData]);

  const machineCounts = useMemo(() => {
    const c = new Map<string, number>();
    groupedData.forEach((days, m) => {
      let n = 0;
      days.forEach((arr) => (n += arr.length));
      c.set(m, n);
    });
    return c;
  }, [groupedData]);

  const lemburCounts = useMemo(() => {
    const c = new Map<string, number>();
    lemburGrouped.forEach((m, machine) => c.set(machine, m.size));
    return c;
  }, [lemburGrouped]);

  const visibleMachines = useMemo(
    () =>
      allMachines.filter((m) => {
        if (machineFilter && !machineFilter.has(m)) return false;
        if (hideEmpty) {
          const n =
            activeView === 'default'
              ? machineCounts.get(m)
              : lemburCounts.get(m);
          if (!n) return false;
        }
        return true;
      }),
    [
      allMachines,
      machineFilter,
      hideEmpty,
      activeView,
      machineCounts,
      lemburCounts,
    ],
  );
  const visibleSet = useMemo(() => new Set(visibleMachines), [visibleMachines]);

  const stats = useMemo(() => {
    if (activeView === 'default') {
      let entries = 0;
      const unique = new Set<string>();
      visibleMachines.forEach(
        (m) =>
          groupedData.get(m)?.forEach((arr) =>
            arr.forEach((d) => {
              entries++;
              unique.add(d.no_jo);
            }),
          ),
      );
      return { entries, unique: unique.size, label: 'jadwal' };
    }
    let n = 0;
    visibleMachines.forEach((m) => (n += lemburCounts.get(m) || 0));
    return { entries: n, unique: 0, label: 'hari lembur' };
  }, [activeView, groupedData, visibleMachines, lemburCounts]);

  // Search
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const out: any[] = [];
    groupedData.forEach((days) =>
      days.forEach((arr) =>
        arr.forEach((d) => {
          if (
            String(d.no_jo ?? '')
              .toLowerCase()
              .includes(q) ||
            String(d.no_booking ?? '')
              .toLowerCase()
              .includes(q)
          )
            out.push(d);
        }),
      ),
    );
    return out.sort(
      (a, b) =>
        new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime() ||
        (a._firstJam || '~').localeCompare(b._firstJam || '~') ||
        String(a.mesin).localeCompare(String(b.mesin)),
    );
  }, [query, groupedData]);
  const matchSet = useMemo(() => new Set(matches), [matches]);
  const activeItem = activeIdx >= 0 ? matches[activeIdx] : undefined;
  const hiddenMatchMachines = useMemo(
    () => [
      ...new Set(
        matches.filter((m) => !visibleSet.has(m.mesin)).map((m) => m.mesin),
      ),
    ],
    [matches, visibleSet],
  );

  /* ------------------------------ fetching ------------------------------ */

  const setLoading = useCallback((key: keyof LoadingState, value: boolean) => {
    setLoadingState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const notify = useCallback((type: ToastType, text: string) => {
    setToast({ type, text });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 4000);
  }, []);

  const getMachineList = useCallback(async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_LINK}/master/mesinTahapan`,
        {
          withCredentials: true,
        },
      );
      setMachineList(res.data.data.map((m: any) => m.nama_mesin));
    } catch (error) {
      console.error('Error fetching machine list:', error);
    }
  }, []);

  const get1Tiket = useCallback(
    async (id: any, _i: any) => {
      const url = `${import.meta.env.VITE_API_LINK}/ppic/jadwalProduksi/${id}`;
      try {
        setLoading('detail', true);
        const res = await axios.get(url, { withCredentials: true });
        setJo1(res.data);
        setShowDetail(
          new Array(res.data?.data?.tahap?.length || 0).fill(false),
        );
      } catch (error: any) {
        console.error('Error fetching ticket:', error);
      } finally {
        setLoading('detail', false);
      }
    },
    [setLoading],
  );

  const getJadwalView = useCallback(
    async (tglAwal: string, tglAkhir: string) => {
      const url = `${
        import.meta.env.VITE_API_LINK
      }/ppic/jadwalProduksiWeekView`;
      const id = ++scheduleReq.current;
      try {
        setLoading('schedule', true);
        const response = await axios.get(url, {
          params: { start_date: tglAwal, end_date: tglAkhir },
          withCredentials: true,
        });
        if (id === scheduleReq.current) setMapData(response.data.data || []);
      } catch (error) {
        console.error('Error fetching schedule data:', error);
        if (id === scheduleReq.current) setMapData([]);
      } finally {
        if (id === scheduleReq.current) setLoading('schedule', false);
      }
    },
    [setLoading],
  );

  const getJadwalLembur = useCallback(
    async (tglAwal: string, tglAkhir: string) => {
      const url = `${
        import.meta.env.VITE_API_LINK
      }/ppic/jadwalProduksiViewLembur`;
      const id = ++overtimeReq.current;
      try {
        setLoading('overtime', true);
        const response = await axios.get(url, {
          params: { start_date: tglAwal, end_date: tglAkhir },
          withCredentials: true,
        });
        if (id === overtimeReq.current)
          setLemburViewData(response.data.data || []);
      } catch (error) {
        console.error('Error fetching overtime data:', error);
        if (id === overtimeReq.current) setLemburViewData([]);
      } finally {
        if (id === overtimeReq.current) setLoading('overtime', false);
      }
    },
    [setLoading],
  );

  const getmasterKategori = useCallback(
    async (
      statusTiket: string = 'history',
      startDate: string = '',
      endDate: string = '',
      searchTerm: string = '',
    ) => {
      const url = `${import.meta.env.VITE_API_LINK}/ppic/jadwalProduksi`;
      try {
        setLoading('main', true);
        const params: any = { status_tiket: statusTiket };
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;
        if (searchTerm) params.search = searchTerm;
        const res = await axios.get(url, { params, withCredentials: true });
        if (statusTiket === 'history')
          setHistoryListJO(res.data || { data: [] });
        else if (statusTiket === 'penjadwalan')
          setPenjadwalanListJO(res.data || { data: [] });
      } catch (error) {
        console.error('Error fetching master kategori:', error);
        if (statusTiket === 'history') setHistoryListJO({ data: [] });
        else if (statusTiket === 'penjadwalan')
          setPenjadwalanListJO({ data: [] });
      } finally {
        setLoading('main', false);
      }
    },
    [setLoading],
  );

  const postLembur = useCallback(
    async (lembur_data: any[], mesin: string | null) => {
      const url = `${
        import.meta.env.VITE_API_LINK
      }/ppic/jadwalProduksiViewLembur`;
      try {
        setLoading('main', true);
        await axios.post(
          url,
          { data_lembur: lembur_data, mesin },
          { withCredentials: true },
        );
        notify('success', 'Berhasil menambah data lembur!');
        setEditMachine(null);
        setDateRange({ startDate: '', endDate: '' });
        setLemburData([]);
        await getJadwalLembur(dateRangeForMonth.start, dateRangeForMonth.end);
      } catch (error: any) {
        notify(
          'error',
          error.response?.data?.message || 'Error saving overtime data',
        );
      } finally {
        setLoading('main', false);
      }
    },
    [setLoading, notify, getJadwalLembur, dateRangeForMonth],
  );

  /* ------------------------------ effects ------------------------------ */

  // One-time loads (they do not depend on the month).
  useEffect(() => {
    getMachineList().finally(() => setMachinesReady(true));
    getmasterKategori('history');
    getmasterKategori('penjadwalan');
  }, [getMachineList, getmasterKategori]);

  // Month-dependent loads.
  useEffect(() => {
    let alive = true;
    Promise.all([
      getJadwalView(dateRangeForMonth.start, dateRangeForMonth.end),
      getJadwalLembur(dateRangeForMonth.start, dateRangeForMonth.end),
    ]).finally(() => alive && setBooted(true));
    return () => {
      alive = false;
    };
  }, [dateRangeForMonth, getJadwalView, getJadwalLembur]);

  const ready = booted && machinesReady;

  const scrollToToday = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({
      left: Math.max(0, (new Date().getDate() - 1) * colW - colW),
      behavior: 'smooth',
    });
  }, [colW]);

  useEffect(() => {
    if (ready && selectedMonth === currentMonthStr()) {
      const t = window.setTimeout(scrollToToday, 50);
      return () => window.clearTimeout(t);
    }
    // only on first render of the grid
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // Escape closes whatever is open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setSearchOpen(false);
      setEditMachine(null);
      setClickedJobOrder(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useClickOutside(
    searchRef,
    searchOpen,
    useCallback(() => setSearchOpen(false), []),
  );

  /* ------------------------------ handlers ------------------------------ */

  const commitFilter = useCallback(
    (set: Set<string>) =>
      setMachineFilter(set.size >= allMachines.length ? null : set),
    [allMachines.length],
  );

  const removeFromFilter = (m: string) => {
    const base = new Set(machineFilter ?? allMachines);
    base.delete(m);
    setMachineFilter(base);
  };

  const jumpTo = useCallback(
    (idx: number) => {
      const item = matches[idx];
      if (!item) return;
      setActiveIdx(idx);
      setActiveView('default');
      if (machineFilter && !machineFilter.has(item.mesin)) {
        setMachineFilter(new Set([...machineFilter, item.mesin]));
      }
      const key = `${item.mesin}|${dayKey(new Date(item.tanggal))}`;
      setExpandedCells((prev) =>
        prev.has(key) ? prev : new Set(prev).add(key),
      );
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          const el = scrollRef.current?.querySelector(
            `[data-cell="${CSS.escape(key)}"]`,
          );
          el?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center',
          });
        }),
      );
    },
    [matches, machineFilter],
  );

  const stepMatch = (dir: 1 | -1) => {
    const n = matches.length;
    if (!n) return;
    const next =
      activeIdx < 0 ? (dir > 0 ? 0 : n - 1) : (activeIdx + dir + n) % n;
    jumpTo(next);
  };

  const clearSearch = () => {
    setQuery('');
    setActiveIdx(-1);
    setSearchOpen(false);
  };

  const toggleExpanded = (key: string) =>
    setExpandedCells((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const openEdit = (machine: string) => {
    if (!mapData.some((d) => d.mesin === machine)) {
      notify(
        'info',
        `Tidak ada jadwal untuk mesin ${machine} pada bulan ${selectedMonth}`,
      );
      return;
    }
    setEditMachine(machine);
  };

  const closeEdit = () => {
    setEditMachine(null);
    setDateRange({ startDate: '', endDate: '' });
    setLemburData([]);
  };

  const handleDateRangeChange = (
    field: 'startDate' | 'endDate',
    value: string,
  ) => {
    const next = { ...dateRange, [field]: value };
    setDateRange(next);
    setLemburData((prev) => buildRange(next.startDate, next.endDate, prev));
  };

  const handleShiftChange = (
    index: number,
    shift: 'shift_1' | 'shift_2',
    checked: boolean,
  ) =>
    setLemburData((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [shift]: checked } : r)),
    );

  const allShiftsChecked =
    lemburData.length > 0 && lemburData.every((d) => d.shift_1 && d.shift_2);
  const handleSelectAll = (checked: boolean) =>
    setLemburData((prev) =>
      prev.map((r) => ({ ...r, shift_1: checked, shift_2: checked })),
    );

  const handleClickDetail = useCallback((index: number) => {
    setShowDetail((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  }, []);

  const handleJobOrderClick = useCallback((data: any) => {
    setClickedJobOrder((cur: any) => (cur === data ? null : data));
  }, []);

  const handleExportExcel = () => {
    const rows = mapData.filter((d) => visibleSet.has(d.mesin));
    if (rows.length > 0) exportToExcel(rows, 'jadwal_produksi');
    else notify('info', 'No data to export');
  };

  /* ------------------------------ render ------------------------------ */

  if (!ready) {
    return (
      <main className="min-w-0">
        <Loading />
        <div className="bg-white rounded-xl p-4 animate-pulse">
          <div className="h-9 w-2/3 bg-slate-100 rounded mb-4" />
          <div className="h-9 w-1/2 bg-slate-100 rounded mb-4" />
          <div className="h-[420px] bg-slate-100 rounded-xl" />
          <p className="text-center text-sm text-slate-500 mt-4">
            Memuat jadwal produksi…
          </p>
        </div>
      </main>
    );
  }

  const isBusy = loadingState.schedule || loadingState.overtime;
  const filterActive = machineFilter !== null;
  return (
    <main className="min-w-0">
      {loadingState.detail && <Loading />}

      {/* Toast */}
      {toast && (
        <div
          role="status"
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-[70] rounded-lg px-4 py-2 text-sm font-medium text-white shadow-lg ${
            toast.type === 'success'
              ? 'bg-emerald-600'
              : toast.type === 'error'
              ? 'bg-rose-600'
              : 'bg-slate-800'
          }`}
        >
          {toast.text}
        </div>
      )}

      <div className="bg-white rounded-xl px-4 py-4">
        {/* Row 1: month navigation, view, export */}
        <div className="flex flex-wrap items-center gap-3 pb-3 border-b border-[#D8EAFF]">
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Bulan sebelumnya"
              onClick={() => setSelectedMonth((m) => shiftMonth(m, -1))}
              className="h-9 w-9 grid place-items-center rounded-lg bg-primary text-white hover:opacity-90"
            >
              <Icon d={ICONS.left} />
            </button>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) =>
                e.target.value && setSelectedMonth(e.target.value)
              }
              className="rounded-lg bg-[#D8EAFF] px-3 h-9 text-sm font-medium text-slate-800"
            />
            <button
              type="button"
              aria-label="Bulan berikutnya"
              onClick={() => setSelectedMonth((m) => shiftMonth(m, 1))}
              className="h-9 w-9 grid place-items-center rounded-lg bg-primary text-white hover:opacity-90"
            >
              <Icon d={ICONS.right} />
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedMonth(currentMonthStr());
                requestAnimationFrame(scrollToToday);
              }}
              className="ml-1 h-9 px-3 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Hari ini
            </button>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Segmented
              value={activeView}
              onChange={setActiveView}
              options={[
                { value: 'default', label: 'Jadwal reguler' },
                { value: 'lembur', label: 'Lembur' },
              ]}
            />
            <button
              type="button"
              onClick={handleExportExcel}
              className="h-9 px-3 inline-flex items-center gap-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
              title={
                filterActive
                  ? 'Hanya mesin yang sedang ditampilkan'
                  : 'Semua mesin'
              }
            >
              <Icon d={ICONS.download} />
              Export to Excel
            </button>
          </div>
        </div>

        {/* Row 2: search, machine filter, options, stats */}
        <div className="flex flex-wrap items-center gap-2 pt-3">
          {/* Search */}
          <div ref={searchRef} className="relative">
            <div className="flex items-center gap-1 h-9 rounded-lg border border-slate-300 bg-white pl-2 pr-1 focus-within:border-[#0065de] focus-within:ring-2 focus-within:ring-[#0065de]/30">
              <Icon d={ICONS.search} className="w-4 h-4 text-slate-400" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIdx(-1);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    stepMatch(e.shiftKey ? -1 : 1);
                    setSearchOpen(false);
                  }
                }}
                placeholder="Cari nomor JO atau booking…"
                className="w-60 bg-transparent text-sm outline-none"
              />
              {query && (
                <>
                  <span className="px-1 text-[11px] tabular-nums text-slate-500">
                    {matches.length === 0
                      ? '0 hasil'
                      : `${activeIdx >= 0 ? activeIdx + 1 : '–'}/${
                          matches.length
                        }`}
                  </span>
                  <button
                    type="button"
                    aria-label="Hasil sebelumnya"
                    onClick={() => stepMatch(-1)}
                    className="p-1 rounded hover:bg-slate-100 text-slate-600"
                  >
                    <Icon d={ICONS.up} className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Hasil berikutnya"
                    onClick={() => stepMatch(1)}
                    className="p-1 rounded hover:bg-slate-100 text-slate-600"
                  >
                    <Icon d={ICONS.down} className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Hapus pencarian"
                    onClick={clearSearch}
                    className="p-1 rounded hover:bg-slate-100 text-slate-600"
                  >
                    <Icon d={ICONS.x} className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>

            {searchOpen && query.trim() && (
              <div className="absolute left-0 top-full mt-1 z-50 w-[360px] max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
                {matches.length === 0 ? (
                  <p className="px-3 py-3 text-sm text-slate-500">
                    Tidak ada JO yang cocok di bulan ini.
                  </p>
                ) : (
                  matches.slice(0, 40).map((m, i) => (
                    <button
                      key={`${m.id ?? i}-${i}`}
                      type="button"
                      onClick={() => {
                        jumpTo(i);
                        setSearchOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 border-b border-slate-100 last:border-0 hover:bg-[#F0F7FF] ${
                        i === activeIdx ? 'bg-[#F0F7FF]' : ''
                      }`}
                    >
                      <span className="block text-sm font-semibold text-slate-800">
                        {m.no_jo}
                      </span>
                      <span className="block text-xs text-slate-500">
                        {m.mesin}, {convertTimeStampToDate(m.tanggal)}
                        {m.no_booking ? `, ${m.no_booking}` : ''}
                      </span>
                    </button>
                  ))
                )}
                {matches.length > 40 && (
                  <p className="px-3 py-2 text-xs text-slate-500">
                    Menampilkan 40 dari {matches.length} hasil. Gunakan tombol
                    panah untuk melihat semuanya.
                  </p>
                )}
              </div>
            )}
          </div>

          <MachineFilter
            machines={allMachines}
            counts={machineCounts}
            value={machineFilter}
            onChange={setMachineFilter}
          />

          <label className="h-9 inline-flex items-center gap-2 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-700 cursor-pointer select-none hover:bg-slate-50">
            <input
              type="checkbox"
              checked={hideEmpty}
              onChange={(e) => setHideEmpty(e.target.checked)}
              className="accent-[#0065de]"
            />
            Sembunyikan mesin kosong
          </label>

          <Segmented
            value={density}
            onChange={setDensity}
            options={[
              { value: 'comfortable', label: 'Nyaman' },
              { value: 'compact', label: 'Ringkas' },
            ]}
          />

          <p className="ml-auto text-sm text-slate-600 tabular-nums">
            <span className="font-semibold text-slate-800">
              {visibleMachines.length}
            </span>{' '}
            dari {allMachines.length} mesin,{' '}
            <span className="font-semibold text-slate-800">
              {stats.entries}
            </span>{' '}
            {stats.label}
            {activeView === 'default' && (
              <>
                ,{' '}
                <span className="font-semibold text-slate-800">
                  {stats.unique}
                </span>{' '}
                JO
              </>
            )}
          </p>
        </div>

        {/* Row 3: context chips */}
        {(filterActive ||
          hiddenMatchMachines.length > 0 ||
          activeView === 'lembur') && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2">
            {filterActive &&
              [...(machineFilter as Set<string>)].slice(0, 10).map((m) => (
                <span
                  key={m}
                  className="inline-flex items-center gap-1 rounded-full bg-[#D8EAFF] pl-2.5 pr-1 py-0.5 text-xs font-medium text-[#0065de]"
                >
                  {m}
                  <button
                    type="button"
                    aria-label={`Sembunyikan ${m}`}
                    onClick={() => removeFromFilter(m)}
                    className="rounded-full p-0.5 hover:bg-white/70"
                  >
                    <Icon d={ICONS.x} className="w-3 h-3" />
                  </button>
                </span>
              ))}
            {filterActive && (machineFilter as Set<string>).size > 10 && (
              <span className="text-xs text-slate-500">
                +{(machineFilter as Set<string>).size - 10} mesin lain
              </span>
            )}
            {filterActive && (
              <button
                type="button"
                onClick={() => setMachineFilter(null)}
                className="text-xs font-medium text-[#0065de] underline underline-offset-2"
              >
                Tampilkan semua mesin
              </button>
            )}

            {hiddenMatchMachines.length > 0 && (
              <span className="inline-flex items-center gap-2 rounded-md bg-amber-50 px-2 py-1 text-xs text-amber-800 ring-1 ring-amber-200">
                Ada hasil pencarian di mesin yang disembunyikan:{' '}
                {hiddenMatchMachines.join(', ')}.
                <button
                  type="button"
                  className="font-semibold underline underline-offset-2"
                  onClick={() =>
                    commitFilter(
                      new Set([
                        ...(machineFilter ?? allMachines),
                        ...hiddenMatchMachines,
                      ]),
                    )
                  }
                >
                  Tampilkan
                </button>
              </span>
            )}

            {activeView === 'lembur' && (
              <span className="ml-auto inline-flex items-center gap-3 text-xs text-slate-600">
                <span className="inline-flex items-center gap-1">
                  <i className="w-3 h-3 rounded-sm bg-yellow-500" />
                  Shift 1
                </span>
                <span className="inline-flex items-center gap-1">
                  <i className="w-3 h-3 rounded-sm bg-blue-500" />
                  Shift 2
                </span>
                <span className="inline-flex items-center gap-1">
                  <i className="w-3 h-3 rounded-sm bg-green-500" />
                  Shift 1 &amp; 2
                </span>
              </span>
            )}
          </div>
        )}

        {/* Loading bar (month changes) */}
        <div
          className={`mt-3 h-0.5 rounded bg-[#0065de] transition-opacity ${
            isBusy ? 'opacity-100 animate-pulse' : 'opacity-0'
          }`}
        />

        {/* Schedule grid */}
        <div
          ref={scrollRef}
          className={`relative mt-2 overflow-auto rounded-xl border border-[#D8EAFF] bg-white transition-opacity ${
            isBusy ? 'opacity-60' : ''
          }`}
          style={{ maxHeight: 'calc(100vh - 280px)', minHeight: 320 }}
        >
          {visibleMachines.length === 0 ? (
            <div className="grid place-items-center py-24 text-center">
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  Tidak ada mesin yang ditampilkan
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Ubah filter mesin atau matikan opsi sembunyikan mesin kosong.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setMachineFilter(null);
                    setHideEmpty(false);
                  }}
                  className="mt-3 h-9 px-4 rounded-lg bg-[#0065de] text-sm font-medium text-white hover:opacity-90"
                >
                  Tampilkan semua mesin
                </button>
              </div>
            </div>
          ) : (
            <div className="min-w-max">
              {/* Header */}
              <div
                className="sticky top-0 z-30 flex border-b border-[#D8EAFF] bg-[#eaf4ff]"
                style={{ height: HEADER_H }}
              >
                <div
                  className="sticky left-0 z-40 shrink-0 grid place-items-center border-r border-[#D8EAFF] bg-[#eaf4ff] text-[11px] font-semibold text-[#0065de]"
                  style={{ width: SIDEBAR_W }}
                >
                  Mesin
                </div>
                {monthDates.map((date) => {
                  const today = dayKey(date) === todayKey;
                  return (
                    <div
                      key={date.getDate()}
                      className={`shrink-0 flex flex-col items-center justify-center border-r border-[#D8EAFF] ${
                        isWeekend(date) ? 'text-rose-600' : 'text-[#0065de]'
                      }`}
                      style={{ width: colW }}
                    >
                      <span className="text-[10px] font-medium opacity-80">
                        {DAY_NAMES[date.getDay()]}
                      </span>
                      <span
                        className={`mt-0.5 text-[12px] font-semibold leading-none ${
                          today
                            ? 'rounded-full bg-[#0065de] px-2 py-0.5 text-white'
                            : ''
                        }`}
                      >
                        {date.getDate()}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Rows */}
              {visibleMachines.map((machine, mi) => {
                const zebra = mi % 2 === 0 ? 'bg-[#F0F7FF]' : 'bg-white';
                const count =
                  activeView === 'default'
                    ? machineCounts.get(machine) || 0
                    : lemburCounts.get(machine) || 0;
                return (
                  <div
                    key={machine}
                    className={`flex border-b border-[#E3EEFB] ${zebra}`}
                  >
                    <button
                      type="button"
                      onClick={() => openEdit(machine)}
                      title="Klik untuk menambah jadwal lembur"
                      className={`group sticky left-0 z-10 shrink-0 flex flex-col items-start justify-center gap-0.5 border-r border-[#D8EAFF] px-3 text-left transition hover:bg-[#DEF0FF] ${zebra}`}
                      style={{ width: SIDEBAR_W, minHeight: 56 }}
                    >
                      <span className="w-full truncate text-[12px] font-semibold text-[#0065de]">
                        {machine}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] text-slate-500">
                        {count}{' '}
                        {activeView === 'default' ? 'jadwal' : 'hari lembur'}
                        <Icon
                          d={ICONS.clock}
                          className="w-3 h-3 opacity-0 transition group-hover:opacity-70"
                        />
                      </span>
                    </button>

                    {monthDates.map((date) => {
                      const dk = dayKey(date);
                      const cellKey = `${machine}|${dk}`;
                      const tint =
                        dk === todayKey
                          ? 'bg-amber-100/50'
                          : isWeekend(date)
                          ? 'bg-[#0065de]/[0.05]'
                          : '';

                      if (activeView === 'lembur') {
                        const sh = lemburGrouped.get(machine)?.get(dk);
                        let text = '';
                        let color = '';
                        if (sh?.s1 && sh?.s2) {
                          text = 'Shift 1 & 2';
                          color = 'bg-green-500';
                        } else if (sh?.s1) {
                          text = 'Shift 1';
                          color = 'bg-yellow-500';
                        } else if (sh?.s2) {
                          text = 'Shift 2';
                          color = 'bg-blue-500';
                        }
                        return (
                          <div
                            key={dk}
                            data-cell={cellKey}
                            className={`shrink-0 flex items-center justify-center border-r border-[#E3EEFB] p-1 ${tint}`}
                            style={{ width: colW, minHeight: 56 }}
                          >
                            {text && (
                              <div
                                className={`rounded px-2 py-1 text-[10px] font-semibold text-white ${color}`}
                                title={`Overtime scheduled for ${text}`}
                              >
                                {text}
                              </div>
                            )}
                          </div>
                        );
                      }

                      const items = groupedData.get(machine)?.get(dk) ?? [];
                      const forceOpen =
                        matchSet.size > 0 && items.some((i) => matchSet.has(i));
                      const expanded = expandedCells.has(cellKey) || forceOpen;
                      const shown = expanded
                        ? items
                        : items.slice(0, MAX_CHIPS);
                      const hidden = items.length - shown.length;
                      return (
                        <div
                          key={dk}
                          data-cell={cellKey}
                          className={`shrink-0 flex flex-col gap-1 border-r border-[#E3EEFB] p-1 ${tint}`}
                          style={{
                            width: colW,
                            minHeight: 56,
                            scrollMarginLeft: SIDEBAR_W + 8,
                            scrollMarginTop: HEADER_H + 8,
                          }}
                        >
                          {shown.map((data, i) => {
                            const status: ChipStatus = !query.trim()
                              ? 'normal'
                              : data === activeItem
                              ? 'active'
                              : matchSet.has(data)
                              ? 'match'
                              : 'dim';
                            return (
                              <JobChip
                                key={`${data.no_jo}-${data.no_booking ?? ''}`}
                                data={data}
                                status={status}
                                onClick={handleJobOrderClick}
                                showTime={density === 'comfortable'}
                              />
                            );
                          })}
                          {hidden > 0 && (
                            <button
                              type="button"
                              onClick={() => toggleExpanded(cellKey)}
                              className="rounded bg-slate-100 py-0.5 text-[10px] font-medium text-slate-600 hover:bg-slate-200"
                            >
                              +{hidden} lagi
                            </button>
                          )}
                          {expanded &&
                            items.length > MAX_CHIPS &&
                            !forceOpen && (
                              <button
                                type="button"
                                onClick={() => toggleExpanded(cellKey)}
                                className="rounded py-0.5 text-[10px] font-medium text-slate-500 hover:bg-slate-100"
                              >
                                Ciutkan
                              </button>
                            )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Job Order details card */}
        {clickedJobOrder && (
          <JobDetailCard
            data={clickedJobOrder}
            onClose={() => setClickedJobOrder(null)}
          />
        )}

        {/* Overtime modal */}
        {editMachine && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onMouseDown={(e) => e.target === e.currentTarget && closeEdit()}
          >
            <div className="flex max-h-[85vh] w-full max-w-md flex-col rounded-2xl bg-white shadow-2xl">
              <div className="border-b border-slate-100 px-6 pt-5 pb-4">
                <h3 className="text-lg font-bold text-slate-900">
                  Add Overtime Schedule
                </h3>
                <p className="mt-0.5 text-sm text-slate-600">
                  Machine:{' '}
                  <span className="font-semibold text-[#0065de]">
                    {editMachine}
                  </span>
                </p>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4">
                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-sm font-medium text-slate-700">
                    Start Date
                    <input
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) =>
                        handleDateRangeChange('startDate', e.target.value)
                      }
                      className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm"
                    />
                  </label>
                  <label className="block text-sm font-medium text-slate-700">
                    End Date
                    <input
                      type="date"
                      value={dateRange.endDate}
                      min={dateRange.startDate || undefined}
                      onChange={(e) =>
                        handleDateRangeChange('endDate', e.target.value)
                      }
                      className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm"
                    />
                  </label>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-800">
                    Select Shifts
                  </h4>
                  <label className="flex items-center gap-1.5 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={allShiftsChecked}
                      disabled={lemburData.length === 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="accent-[#0065de]"
                    />
                    Select All
                  </label>
                </div>

                <div className="mt-2 space-y-1.5">
                  {lemburData.length === 0 && (
                    <p className="rounded-lg bg-slate-50 px-3 py-4 text-center text-sm text-slate-500">
                      Pilih rentang tanggal untuk mengatur shift lembur.
                    </p>
                  )}
                  {lemburData.map((data, index) => {
                    const d = parseYMD(data.tanggal_lembur);
                    return (
                      <div
                        key={data.tanggal_lembur}
                        className={`flex items-center justify-between rounded-lg px-3 py-2 ${
                          isWeekend(d) ? 'bg-rose-50' : 'bg-slate-50'
                        }`}
                      >
                        <span className="text-sm text-slate-800">
                          <span
                            className={`inline-block w-9 font-medium ${
                              isWeekend(d) ? 'text-rose-600' : 'text-slate-500'
                            }`}
                          >
                            {DAY_NAMES[d.getDay()]}
                          </span>
                          {data.tanggal_lembur}
                        </span>
                        <div className="flex gap-3">
                          <label className="flex items-center gap-1 text-sm text-slate-700">
                            <input
                              type="checkbox"
                              checked={data.shift_1}
                              onChange={(e) =>
                                handleShiftChange(
                                  index,
                                  'shift_1',
                                  e.target.checked,
                                )
                              }
                              className="accent-[#0065de]"
                            />
                            Shift 1
                          </label>
                          <label className="flex items-center gap-1 text-sm text-slate-700">
                            <input
                              type="checkbox"
                              checked={data.shift_2}
                              onChange={(e) =>
                                handleShiftChange(
                                  index,
                                  'shift_2',
                                  e.target.checked,
                                )
                              }
                              className="accent-[#0065de]"
                            />
                            Shift 2
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="h-9 rounded-lg bg-slate-100 px-4 text-sm font-medium text-slate-700 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => postLembur(lemburData, editMachine)}
                  disabled={loadingState.main || lemburData.length === 0}
                  className="h-9 rounded-lg bg-[#0065de] px-4 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                >
                  {loadingState.main ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}

        {isDetailVisible && (
          <JobOrderTable
            historyListJO={historyListJO}
            penjadwalanListJO={penjadwalanListJO}
            get1Tiket={get1Tiket}
            setSelectedJO={setSelectedJO}
            setSelectedIndex={setSelectedIndex}
            setIsModalOpen={setIsModalOpen}
            isDetailVisible={isDetailVisible}
            setIsDetailVisible={setIsDetailVisible}
            loading={loadingState.detail || isBusy}
            title="Job Order List"
            getmasterKategori={getmasterKategori}
            canceledListJO={{ data: [] }}
          />
        )}

        {/* Modal for Job Order Details */}
        {isModalOpen && selectedJO && (
          <ModalXL
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            judul={'Rumus Kalkulasi'}
          >
            <JODetailContent
              selectedJO={selectedJO}
              listJO1={listJO1}
              expanded={!!showDetail[selectedIndex]}
              onToggleDetail={() => handleClickDetail(selectedIndex)}
            />
          </ModalXL>
        )}
      </div>
    </main>
  );
}

export default TampilanMonthlyJO;
