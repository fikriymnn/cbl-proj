import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import axios from 'axios';
import Loading from '../../Loading';

// ============================================================================
// Types
// ============================================================================

interface LemburEntry {
  id?: number;
  tanggal_lembur: string; // 'YYYY-MM-DD' or ISO string
  mesin: string;
  shift_1: boolean;
  shift_2: boolean;
}

interface DayCell {
  date: Date;
  inMonth: boolean;
  dateKey: string; // 'YYYY-MM-DD'
}

interface ShiftState {
  shift_1: boolean;
  shift_2: boolean;
}

interface RangeEntry {
  dateKey: string;
  label: string;
  shift_1: boolean;
  shift_2: boolean;
  existing_1: boolean;
  existing_2: boolean;
}

const DAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const MONTH_LABELS = [
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

const toDateKey = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const lemburDateKey = (raw: string) => raw.split('T')[0];

const formatShortDate = (dateKey: string) => {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return `${DAY_LABELS[date.getDay()]}, ${d} ${MONTH_LABELS[m - 1]}`;
};

// ============================================================================
// Small presentational pieces
// ============================================================================

const ShiftBadge = React.memo(
  ({ shift1, shift2 }: { shift1: boolean; shift2: boolean }) => {
    if (!shift1 && !shift2) return null;
    let label = '';
    let classes = '';
    if (shift1 && shift2) {
      label = 'Shift 1 & 2';
      classes = 'bg-emerald-500 text-white';
    } else if (shift1) {
      label = 'Shift 1';
      classes = 'bg-amber-500 text-white';
    } else {
      label = 'Shift 2';
      classes = 'bg-[#0065de] text-white';
    }
    return (
      <span
        className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${classes}`}
      >
        {label}
      </span>
    );
  },
);

const Toggle = ({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) => (
  <label className="flex items-center gap-2 cursor-pointer select-none">
    <span
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-150 ${
        checked ? 'bg-[#0065de]' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-150 ${
          checked ? 'translate-x-4' : 'translate-x-0.5'
        }`}
      />
    </span>
    <span className="text-xs font-medium text-gray-700">{label}</span>
  </label>
);

const CalendarPlusIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="3" y="4" width="18" height="17" rx="2" />
    <path d="M3 9h18M8 2v4M16 2v4M12 12v6M9 15h6" strokeLinecap="round" />
  </svg>
);

// ----------------------------------------------------------------------
// Searchable single-select dropdown, reused for machine pickers
// ----------------------------------------------------------------------

interface SearchableSelectOption {
  value: string;
  label: string;
}

const SearchableSelect = ({
  value,
  onChange,
  options,
  placeholder = 'Pilih...',
  searchPlaceholder = 'Cari...',
  allowClear = false,
  clearLabel = 'Semua',
  className = '',
}: {
  value: string;
  onChange: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  allowClear?: boolean;
  clearLabel?: string;
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) {
      // Focus the search box as soon as the dropdown opens
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const filteredOptions = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  const selectedLabel = options.find((o) => o.value === value)?.label;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 px-2 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#0065de]"
      >
        <span
          className={`truncate ${
            selectedLabel ? 'text-gray-800' : 'text-gray-400'
          }`}
        >
          {selectedLabel || placeholder}
        </span>
        <svg
          viewBox="0 0 20 20"
          className={`w-3.5 h-3.5 text-gray-400 flex-shrink-0 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
          fill="currentColor"
        >
          <path
            d="M5.5 7.5l4.5 4.5 4.5-4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg flex flex-col overflow-hidden">
          <div className="p-1.5 border-b border-gray-100">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#0065de]"
            />
          </div>
          <div className="max-h-48 overflow-y-auto py-1">
            {allowClear && (
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setOpen(false);
                  setQuery('');
                }}
                className={`w-full text-left px-3 py-1.5 text-xs font-medium ${
                  value === ''
                    ? 'bg-[#eaf4ff] text-[#0065de]'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {clearLabel}
              </button>
            )}
            {filteredOptions.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-3">
                Tidak ada mesin yang cocok
              </p>
            )}
            {filteredOptions.map((opt) => (
              <button
                type="button"
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                  setQuery('');
                }}
                className={`w-full text-left px-3 py-1.5 text-xs font-medium ${
                  opt.value === value
                    ? 'bg-[#eaf4ff] text-[#0065de]'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Main component
// ============================================================================

function KalenderJadwalLembur() {
  const [loadingMain, setLoadingMain] = useState(true);
  const [saving, setSaving] = useState(false);

  const [machineList, setMachineList] = useState<string[]>([]);
  const [lemburData, setLemburData] = useState<LemburEntry[]>([]);

  const [selectedMonth, setSelectedMonth] = useState<string>(() =>
    new Date().toISOString().slice(0, 7),
  );

  const [machineFilter, setMachineFilter] = useState('');

  // Calendar-wide filter: only show this machine's overtime on the grid
  const [calendarMachineFilter, setCalendarMachineFilter] = useState('');

  // Day-detail / edit panel state
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [draftShifts, setDraftShifts] = useState<Record<string, ShiftState>>(
    {},
  );
  const [initialShifts, setInitialShifts] = useState<
    Record<string, ShiftState>
  >({});

  // Date-range panel state
  const [rangeModalOpen, setRangeModalOpen] = useState(false);
  const [rangeMachine, setRangeMachine] = useState('');
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const [rangeEntries, setRangeEntries] = useState<RangeEntry[]>([]);
  const [skipExisting, setSkipExisting] = useState(true);
  const [rangeSaving, setRangeSaving] = useState(false);

  // ----------------------------------------------------------------------
  // Derived data
  // ----------------------------------------------------------------------

  const monthRange = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    return { start: toDateKey(start), end: toDateKey(end) };
  }, [selectedMonth]);

  const calendarDays: DayCell[] = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const firstOfMonth = new Date(year, month - 1, 1);
    const lastOfMonth = new Date(year, month, 0);
    const leadingCount = firstOfMonth.getDay();

    const days: DayCell[] = [];
    for (let i = leadingCount; i > 0; i--) {
      const d = new Date(year, month - 1, 1 - i);
      days.push({ date: d, inMonth: false, dateKey: toDateKey(d) });
    }
    for (let d = 1; d <= lastOfMonth.getDate(); d++) {
      const date = new Date(year, month - 1, d);
      days.push({ date, inMonth: true, dateKey: toDateKey(date) });
    }
    while (days.length % 7 !== 0) {
      const last = days[days.length - 1].date;
      const next = new Date(last);
      next.setDate(next.getDate() + 1);
      days.push({ date: next, inMonth: false, dateKey: toDateKey(next) });
    }
    return days;
  }, [selectedMonth]);

  // dateKey -> mesin -> { shift_1, shift_2 }
  const groupedLembur = useMemo(() => {
    const map = new Map<string, Map<string, ShiftState>>();
    lemburData.forEach((entry) => {
      const key = lemburDateKey(entry.tanggal_lembur);
      if (!map.has(key)) map.set(key, new Map());
      map.get(key)!.set(entry.mesin, {
        shift_1: !!entry.shift_1,
        shift_2: !!entry.shift_2,
      });
    });
    return map;
  }, [lemburData]);

  const filteredMachines = useMemo(() => {
    if (!machineFilter.trim()) return machineList;
    return machineList.filter((m) =>
      m.toLowerCase().includes(machineFilter.toLowerCase()),
    );
  }, [machineList, machineFilter]);

  const machineOptions = useMemo(
    () => machineList.map((m) => ({ value: m, label: m })),
    [machineList],
  );

  const monthSummary = useMemo(() => {
    let activeDays = 0;
    let machineDayCount = 0;
    calendarDays.forEach((cell) => {
      if (!cell.inMonth) return;
      const dayMap = groupedLembur.get(cell.dateKey);
      if (!dayMap || dayMap.size === 0) return;
      let hasAny = false;
      dayMap.forEach((s, mesin) => {
        if (calendarMachineFilter && mesin !== calendarMachineFilter) return;
        if (s.shift_1 || s.shift_2) {
          hasAny = true;
          machineDayCount += 1;
        }
      });
      if (hasAny) activeDays += 1;
    });
    return { activeDays, machineDayCount };
  }, [calendarDays, groupedLembur, calendarMachineFilter]);

  const selectedDayLabel = useMemo(() => {
    if (!selectedDateKey) return '';
    return formatShortDate(selectedDateKey);
  }, [selectedDateKey]);

  const hasUnsavedChanges = useMemo(() => {
    return Object.keys(draftShifts).some((mesin) => {
      const draft = draftShifts[mesin];
      const initial = initialShifts[mesin] || {
        shift_1: false,
        shift_2: false,
      };
      return (
        draft.shift_1 !== initial.shift_1 || draft.shift_2 !== initial.shift_2
      );
    });
  }, [draftShifts, initialShifts]);

  // Which range entries actually differ from what's already saved.
  const changedRangeEntries = useMemo(
    () =>
      rangeEntries.filter(
        (e) => e.shift_1 !== e.existing_1 || e.shift_2 !== e.existing_2,
      ),
    [rangeEntries],
  );

  const rangeAlreadySetCount = useMemo(
    () => rangeEntries.filter((e) => e.existing_1 || e.existing_2).length,
    [rangeEntries],
  );

  // ----------------------------------------------------------------------
  // Data fetching
  // ----------------------------------------------------------------------

  const getMachineList = useCallback(async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_LINK}/master/mesinTahapan`,
        { withCredentials: true },
      );
      const machines: string[] = res.data.data.map((m: any) => m.nama_mesin);
      setMachineList(machines);
    } catch (error) {
      console.error('Error fetching machine list:', error);
    }
  }, []);

  const getJadwalLembur = useCallback(
    async (tglAwal: string, tglAkhir: string) => {
      const url = `${
        import.meta.env.VITE_API_LINK
      }/ppic/jadwalProduksiViewLembur`;
      try {
        const response = await axios.get(url, {
          params: { start_date: tglAwal, end_date: tglAkhir },
          withCredentials: true,
        });
        setLemburData(response.data.data || []);
      } catch (error) {
        console.error('Error fetching overtime data:', error);
        setLemburData([]);
      }
    },
    [],
  );

  const refreshMonth = useCallback(async () => {
    setLoadingMain(true);
    try {
      await Promise.all([
        getMachineList(),
        getJadwalLembur(monthRange.start, monthRange.end),
      ]);
    } finally {
      setLoadingMain(false);
    }
  }, [getMachineList, getJadwalLembur, monthRange]);

  useEffect(() => {
    refreshMonth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth]);

  // ----------------------------------------------------------------------
  // Interaction handlers
  // ----------------------------------------------------------------------

  const handleMonthChange = useCallback((direction: 'next' | 'prev') => {
    setSelectedMonth((prev) => {
      const current = new Date(prev + '-01');
      current.setMonth(current.getMonth() + (direction === 'next' ? 1 : -1));
      return current.toISOString().slice(0, 7);
    });
  }, []);

  const openDay = useCallback(
    (cell: DayCell) => {
      const dayMap = groupedLembur.get(cell.dateKey);
      const snapshot: Record<string, ShiftState> = {};
      machineList.forEach((mesin) => {
        const existing = dayMap?.get(mesin);
        snapshot[mesin] = {
          shift_1: existing?.shift_1 || false,
          shift_2: existing?.shift_2 || false,
        };
      });
      setSelectedDateKey(cell.dateKey);
      setDraftShifts(snapshot);
      setInitialShifts(snapshot);
      setMachineFilter('');
    },
    [groupedLembur, machineList],
  );

  const closeDay = useCallback(() => {
    setSelectedDateKey(null);
    setDraftShifts({});
    setInitialShifts({});
  }, []);

  const toggleShift = useCallback(
    (mesin: string, shift: 'shift_1' | 'shift_2', checked: boolean) => {
      setDraftShifts((prev) => ({
        ...prev,
        [mesin]: {
          ...prev[mesin],
          [shift]: checked,
        },
      }));
    },
    [],
  );

  const handleSaveDay = useCallback(async () => {
    if (!selectedDateKey) return;

    const changedMachines = Object.keys(draftShifts).filter((mesin) => {
      const draft = draftShifts[mesin];
      const initial = initialShifts[mesin] || {
        shift_1: false,
        shift_2: false,
      };
      return (
        draft.shift_1 !== initial.shift_1 || draft.shift_2 !== initial.shift_2
      );
    });

    if (changedMachines.length === 0) {
      closeDay();
      return;
    }

    const url = `${
      import.meta.env.VITE_API_LINK
    }/ppic/jadwalProduksiViewLembur`;
    setSaving(true);
    try {
      await Promise.all(
        changedMachines.map((mesin) =>
          axios.post(
            url,
            {
              data_lembur: [
                {
                  tanggal_lembur: selectedDateKey,
                  shift_1: draftShifts[mesin].shift_1,
                  shift_2: draftShifts[mesin].shift_2,
                },
              ],
              mesin,
            },
            { withCredentials: true },
          ),
        ),
      );
      alert('Jadwal lembur berhasil disimpan!');
      closeDay();
      await getJadwalLembur(monthRange.start, monthRange.end);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal menyimpan jadwal lembur');
    } finally {
      setSaving(false);
    }
  }, [
    selectedDateKey,
    draftShifts,
    initialShifts,
    closeDay,
    getJadwalLembur,
    monthRange,
  ]);

  const setAllForMachine = (mesin: string, checked: boolean) => {
    setDraftShifts((prev) => ({
      ...prev,
      [mesin]: { shift_1: checked, shift_2: checked },
    }));
  };

  // ----------------------------------------------------------------------
  // Date-range overtime handlers
  // ----------------------------------------------------------------------

  const buildRangeEntries = useCallback(
    (start: string, end: string, mesin: string): RangeEntry[] => {
      if (!start || !end || !mesin) return [];
      const startDate = new Date(start + 'T00:00:00');
      const endDate = new Date(end + 'T00:00:00');
      if (endDate < startDate) return [];

      const entries: RangeEntry[] = [];
      const cursor = new Date(startDate);
      let guard = 0;
      while (cursor <= endDate && guard < 366) {
        const dateKey = toDateKey(cursor);
        const existing = groupedLembur.get(dateKey)?.get(mesin);
        entries.push({
          dateKey,
          label: formatShortDate(dateKey),
          shift_1: existing?.shift_1 || false,
          shift_2: existing?.shift_2 || false,
          existing_1: existing?.shift_1 || false,
          existing_2: existing?.shift_2 || false,
        });
        cursor.setDate(cursor.getDate() + 1);
        guard += 1;
      }
      return entries;
    },
    [groupedLembur],
  );

  const openRangeModal = useCallback(() => {
    const defaultMachine = machineList[0] || '';
    setRangeMachine(defaultMachine);
    setRangeStart(monthRange.start);
    setRangeEnd(monthRange.end);
    setRangeEntries(
      defaultMachine
        ? buildRangeEntries(monthRange.start, monthRange.end, defaultMachine)
        : [],
    );
    setSkipExisting(true);
    setRangeModalOpen(true);
  }, [machineList, monthRange, buildRangeEntries]);

  const closeRangeModal = useCallback(() => {
    setRangeModalOpen(false);
    setRangeEntries([]);
    setRangeMachine('');
  }, []);

  const regenerateRangeEntries = useCallback(
    (
      nextMachine = rangeMachine,
      nextStart = rangeStart,
      nextEnd = rangeEnd,
    ) => {
      if (!nextStart || !nextEnd || !nextMachine) {
        setRangeEntries([]);
        return;
      }
      const startDate = new Date(nextStart + 'T00:00:00');
      const endDate = new Date(nextEnd + 'T00:00:00');
      const dayCount =
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) + 1;
      if (dayCount > 92) {
        alert('Rentang tanggal maksimal 92 hari. Persempit rentang Anda.');
        return;
      }
      setRangeEntries(buildRangeEntries(nextStart, nextEnd, nextMachine));
    },
    [rangeMachine, rangeStart, rangeEnd, buildRangeEntries],
  );

  const handleRangeMachineChange = (mesin: string) => {
    setRangeMachine(mesin);
    regenerateRangeEntries(mesin, rangeStart, rangeEnd);
  };

  const handleRangeStartChange = (value: string) => {
    setRangeStart(value);
    regenerateRangeEntries(rangeMachine, value, rangeEnd);
  };

  const handleRangeEndChange = (value: string) => {
    setRangeEnd(value);
    regenerateRangeEntries(rangeMachine, rangeStart, value);
  };

  const toggleRangeShift = useCallback(
    (dateKey: string, shift: 'shift_1' | 'shift_2', checked: boolean) => {
      setRangeEntries((prev) =>
        prev.map((e) =>
          e.dateKey === dateKey ? { ...e, [shift]: checked } : e,
        ),
      );
    },
    [],
  );

  const bulkApplyRange = useCallback(
    (shift_1: boolean, shift_2: boolean) => {
      setRangeEntries((prev) =>
        prev.map((e) => {
          const alreadySet = e.existing_1 || e.existing_2;
          if (skipExisting && alreadySet) return e; // leave already-scheduled dates untouched
          return { ...e, shift_1, shift_2 };
        }),
      );
    },
    [skipExisting],
  );

  const handleSaveRange = useCallback(async () => {
    if (!rangeMachine || changedRangeEntries.length === 0) {
      closeRangeModal();
      return;
    }
    const url = `${
      import.meta.env.VITE_API_LINK
    }/ppic/jadwalProduksiViewLembur`;
    setRangeSaving(true);
    try {
      // Single call carrying every changed date for this machine, mirroring
      // the batched data_lembur[] + mesin payload used by the weekly view.
      await axios.post(
        url,
        {
          data_lembur: changedRangeEntries.map((e) => ({
            tanggal_lembur: e.dateKey,
            shift_1: e.shift_1,
            shift_2: e.shift_2,
          })),
          mesin: rangeMachine,
        },
        { withCredentials: true },
      );
      alert(
        `Jadwal lembur untuk ${changedRangeEntries.length} tanggal berhasil disimpan!`,
      );
      closeRangeModal();
      await getJadwalLembur(monthRange.start, monthRange.end);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal menyimpan jadwal lembur');
    } finally {
      setRangeSaving(false);
    }
  }, [
    rangeMachine,
    changedRangeEntries,
    closeRangeModal,
    getJadwalLembur,
    monthRange,
  ]);

  // ----------------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------------

  if (loadingMain && lemburData.length === 0 && machineList.length === 0) {
    return (
      <main className="overflow-x-scroll">
        <Loading />
        <div className="min-w-[700px] bg-white rounded-xl flex gap-1 px-4 py-4">
          <div className="flex w-full justify-center items-center h-96">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-600 mb-2">
                Memuat Kalender Lembur...
              </div>
              <div className="text-sm text-gray-500">Mohon tunggu sebentar</div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const today = toDateKey(new Date());

  return (
    <main className="overflow-x-scroll">
      {loadingMain && <Loading />}
      <div className="min-w-[700px] bg-white rounded-xl px-4 py-4">
        {/* Header */}
        <div className="flex flex-col gap-3 w-full py-3 border-b-4 border-stroke">
          <div className="flex w-full justify-between items-center flex-wrap gap-2">
            <div>
              <h1 className="text-lg font-bold text-gray-800">
                Kalender Jadwal Lembur
              </h1>
              <p className="text-xs text-gray-500">
                Atur mesin mana yang lembur pada tanggal tertentu, berdasarkan
                shift
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={openRangeModal}
                disabled={machineList.length === 0}
                className="flex items-center gap-1.5 bg-[#0065de] text-white rounded-md py-1.5 px-3 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                <CalendarPlusIcon />
                Set Rentang Tanggal
              </button>
              <button
                onClick={() => handleMonthChange('prev')}
                className="bg-primary text-white rounded-md py-1 px-3 text-sm"
              >
                &larr; Prev
              </button>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="rounded-md bg-[#D8EAFF] px-2 h-8 text-sm"
              />
              <button
                onClick={() => handleMonthChange('next')}
                className="bg-primary text-white rounded-md py-1 px-3 text-sm"
              >
                Next &rarr;
              </button>
            </div>
          </div>

          {/* Summary + legend */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-4">
              <div className="bg-[#eaf4ff] rounded-lg px-3 py-2">
                <p className="text-[10px] text-gray-500 font-medium">
                  Hari Aktif Lembur
                </p>
                <p className="text-lg font-bold text-[#0065de]">
                  {monthSummary.activeDays}
                </p>
              </div>
              <div className="bg-[#eaf4ff] rounded-lg px-3 py-2">
                <p className="text-[10px] text-gray-500 font-medium">
                  Total Mesin-Hari
                </p>
                <p className="text-lg font-bold text-[#0065de]">
                  {monthSummary.machineDayCount}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-medium text-gray-600">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />{' '}
                Shift 1
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-[#0065de] inline-block" />{' '}
                Shift 2
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />{' '}
                Shift 1 & 2
              </span>
            </div>
          </div>

          {/* Machine filter */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-gray-500 whitespace-nowrap">
              Filter Mesin:
            </span>
            <SearchableSelect
              value={calendarMachineFilter}
              onChange={setCalendarMachineFilter}
              options={machineOptions}
              placeholder="Semua Mesin"
              searchPlaceholder="Cari mesin..."
              allowClear
              clearLabel="Semua Mesin"
              className="w-56"
            />
            {calendarMachineFilter && (
              <button
                onClick={() => setCalendarMachineFilter('')}
                className="text-[11px] font-medium text-gray-400 hover:text-gray-600 underline"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Calendar grid */}
        <div className="mt-4">
          <div className="grid grid-cols-7 border-t border-l border-[#D8EAFF]">
            {DAY_LABELS.map((label) => (
              <div
                key={label}
                className="bg-[#eaf4ff] text-center text-[11px] font-semibold text-[#0065de] py-2 border-r border-b border-[#D8EAFF]"
              >
                {label}
              </div>
            ))}
            {calendarDays.map((cell) => {
              const dayMap = groupedLembur.get(cell.dateKey);
              const entries = dayMap ? Array.from(dayMap.entries()) : [];
              const activeEntries = entries.filter(
                ([mesin, s]) =>
                  (s.shift_1 || s.shift_2) &&
                  (!calendarMachineFilter || mesin === calendarMachineFilter),
              );
              const isToday = cell.dateKey === today;

              return (
                <button
                  key={cell.dateKey}
                  onClick={() => openDay(cell)}
                  className={`min-h-[92px] p-1.5 flex flex-col items-stretch text-left border-r border-b border-[#D8EAFF] transition-colors ${
                    cell.inMonth
                      ? 'bg-white hover:bg-[#F0F7FF]'
                      : 'bg-gray-50 text-gray-300 hover:bg-gray-100'
                  }`}
                >
                  <span
                    className={`text-[11px] font-semibold mb-1 w-5 h-5 flex items-center justify-center rounded-full ${
                      isToday
                        ? 'bg-[#0065de] text-white'
                        : cell.inMonth
                        ? 'text-gray-700'
                        : 'text-gray-300'
                    }`}
                  >
                    {cell.date.getDate()}
                  </span>
                  <div className="flex flex-col gap-0.5 overflow-hidden">
                    {activeEntries.slice(0, 3).map(([mesin, s]) => (
                      <div
                        key={mesin}
                        className="flex items-center gap-1 overflow-hidden"
                      >
                        <ShiftBadge shift1={s.shift_1} shift2={s.shift_2} />
                        <span className="text-[9px] text-gray-500 truncate">
                          {mesin}
                        </span>
                      </div>
                    ))}
                    {activeEntries.length > 3 && (
                      <span className="text-[9px] text-gray-400 font-medium">
                        +{activeEntries.length - 3} lainnya
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Day edit panel */}
      {selectedDateKey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center px-5 py-4 border-b-4 border-stroke">
              <div>
                <h3 className="font-bold text-sm text-gray-800">
                  Jadwal Lembur
                </h3>
                <p className="text-xs text-[#0065de] font-medium">
                  {selectedDayLabel}
                </p>
              </div>
              <button
                onClick={closeDay}
                className="text-gray-400 hover:text-gray-700 text-2xl leading-none"
                title="Tutup"
              >
                &times;
              </button>
            </div>

            <div className="px-5 py-3 border-b border-[#D8EAFF]">
              <input
                type="text"
                placeholder="Cari mesin..."
                value={machineFilter}
                onChange={(e) => setMachineFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0065de]"
              />
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-2">
              {filteredMachines.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-6">
                  Tidak ada mesin yang cocok
                </p>
              )}
              {filteredMachines.map((mesin) => {
                const state = draftShifts[mesin] || {
                  shift_1: false,
                  shift_2: false,
                };
                const changed =
                  initialShifts[mesin] &&
                  (state.shift_1 !== initialShifts[mesin].shift_1 ||
                    state.shift_2 !== initialShifts[mesin].shift_2);
                const wasAlreadySet =
                  initialShifts[mesin] &&
                  (initialShifts[mesin].shift_1 ||
                    initialShifts[mesin].shift_2);
                return (
                  <div
                    key={mesin}
                    className={`flex items-center justify-between py-2 px-2 rounded-md mb-1 ${
                      changed ? 'bg-[#FFF7E6]' : index_bg(mesin)
                    }`}
                  >
                    <button
                      onClick={() =>
                        setAllForMachine(
                          mesin,
                          !(state.shift_1 && state.shift_2),
                        )
                      }
                      className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-[#0065de] text-left"
                      title="Klik untuk toggle kedua shift"
                    >
                      {mesin}
                      {wasAlreadySet && (
                        <span className="text-[8px] font-medium text-gray-400 bg-white border border-gray-200 rounded-full px-1.5 py-0.5">
                          sudah terjadwal
                        </span>
                      )}
                    </button>
                    <div className="flex items-center gap-3">
                      <Toggle
                        checked={state.shift_1}
                        onChange={(checked) =>
                          toggleShift(mesin, 'shift_1', checked)
                        }
                        label="Shift 1"
                      />
                      <Toggle
                        checked={state.shift_2}
                        onChange={(checked) =>
                          toggleShift(mesin, 'shift_2', checked)
                        }
                        label="Shift 2"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 px-5 py-4 border-t-4 border-stroke">
              <button
                onClick={closeDay}
                className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Batal
              </button>
              <button
                onClick={handleSaveDay}
                disabled={saving || !hasUnsavedChanges}
                className="px-4 py-2 text-sm bg-[#0065de] text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Date-range overtime panel */}
      {rangeModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[88vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center px-5 py-4 border-b-4 border-stroke">
              <div>
                <h3 className="font-bold text-sm text-gray-800">
                  Set Lembur — Rentang Tanggal
                </h3>
                <p className="text-xs text-gray-500">
                  Pilih satu mesin dan rentang tanggal, lalu tandai shift
                  sekaligus untuk banyak hari.
                </p>
              </div>
              <button
                onClick={closeRangeModal}
                className="text-gray-400 hover:text-gray-700 text-2xl leading-none"
                title="Tutup"
              >
                &times;
              </button>
            </div>

            <div className="px-5 py-3 border-b border-[#D8EAFF] grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">
                  MESIN
                </label>
                <SearchableSelect
                  value={rangeMachine}
                  onChange={handleRangeMachineChange}
                  options={machineOptions}
                  placeholder="Pilih mesin"
                  searchPlaceholder="Cari mesin..."
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">
                  DARI TANGGAL
                </label>
                <input
                  type="date"
                  value={rangeStart}
                  onChange={(e) => handleRangeStartChange(e.target.value)}
                  className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0065de]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">
                  SAMPAI TANGGAL
                </label>
                <input
                  type="date"
                  value={rangeEnd}
                  min={rangeStart || undefined}
                  onChange={(e) => handleRangeEndChange(e.target.value)}
                  className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0065de]"
                />
              </div>
            </div>

            {rangeAlreadySetCount > 0 && (
              <div className="mx-5 mt-3 flex items-start gap-2 text-[11px] bg-amber-50 border border-amber-200 text-amber-800 rounded-md px-3 py-2">
                <span className="font-bold">!</span>
                <span>
                  {rangeAlreadySetCount} dari {rangeEntries.length} tanggal pada
                  rentang ini <strong>sudah memiliki jadwal lembur</strong>{' '}
                  untuk mesin {rangeMachine || 'ini'} — ditandai dengan label
                  &quot;sudah ada&quot; di bawah, sehingga Anda tidak perlu
                  mencentang ulang.
                </span>
              </div>
            )}

            <div className="px-5 pt-3 flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-semibold text-gray-500 mr-1">
                AKSI CEPAT:
              </span>
              <button
                onClick={() => bulkApplyRange(true, false)}
                className="text-[10px] font-semibold px-2 py-1 rounded-full bg-amber-500 text-white"
              >
                Tandai semua Shift 1
              </button>
              <button
                onClick={() => bulkApplyRange(false, true)}
                className="text-[10px] font-semibold px-2 py-1 rounded-full bg-[#0065de] text-white"
              >
                Tandai semua Shift 2
              </button>
              <button
                onClick={() => bulkApplyRange(true, true)}
                className="text-[10px] font-semibold px-2 py-1 rounded-full bg-emerald-500 text-white"
              >
                Tandai Shift 1 & 2
              </button>
              <button
                onClick={() => bulkApplyRange(false, false)}
                className="text-[10px] font-semibold px-2 py-1 rounded-full bg-gray-200 text-gray-700"
              >
                Kosongkan
              </button>
              <label className="flex items-center gap-1.5 ml-auto text-[10px] text-gray-600 font-medium">
                <input
                  type="checkbox"
                  checked={skipExisting}
                  onChange={(e) => setSkipExisting(e.target.checked)}
                />
                Lewati tanggal yang sudah terjadwal
              </label>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-3 mt-1">
              {rangeEntries.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">
                  Pilih mesin dan rentang tanggal untuk mulai.
                </p>
              ) : (
                <div className="flex flex-col gap-1">
                  {rangeEntries.map((entry) => {
                    const alreadySet = entry.existing_1 || entry.existing_2;
                    const changed =
                      entry.shift_1 !== entry.existing_1 ||
                      entry.shift_2 !== entry.existing_2;
                    return (
                      <div
                        key={entry.dateKey}
                        className={`flex items-center justify-between px-2 py-1.5 rounded-md border text-xs ${
                          changed
                            ? 'bg-[#FFF7E6] border-amber-200'
                            : alreadySet
                            ? 'bg-emerald-50 border-emerald-200'
                            : 'bg-gray-50 border-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-700 w-24">
                            {entry.label}
                          </span>
                          {alreadySet && (
                            <ShiftBadge
                              shift1={entry.existing_1}
                              shift2={entry.existing_2}
                            />
                          )}
                          {alreadySet && (
                            <span className="text-[9px] text-emerald-700 font-medium">
                              sudah ada
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <Toggle
                            checked={entry.shift_1}
                            onChange={(checked) =>
                              toggleRangeShift(
                                entry.dateKey,
                                'shift_1',
                                checked,
                              )
                            }
                            label="Shift 1"
                          />
                          <Toggle
                            checked={entry.shift_2}
                            onChange={(checked) =>
                              toggleRangeShift(
                                entry.dateKey,
                                'shift_2',
                                checked,
                              )
                            }
                            label="Shift 2"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center gap-2 px-5 py-4 border-t-4 border-stroke">
              <span className="text-[11px] text-gray-500">
                {changedRangeEntries.length} tanggal akan diperbarui
              </span>
              <div className="flex gap-2">
                <button
                  onClick={closeRangeModal}
                  className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveRange}
                  disabled={rangeSaving || changedRangeEntries.length === 0}
                  className="px-4 py-2 text-sm bg-[#0065de] text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {rangeSaving ? 'Menyimpan...' : 'Simpan Rentang'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// Simple deterministic alternating row background so the machine list is easier to scan
function index_bg(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++)
    hash = (hash << 5) - hash + seed.charCodeAt(i);
  return Math.abs(hash) % 2 === 0 ? 'bg-[#F8FAFC]' : 'bg-white';
}

export default KalenderJadwalLembur;
