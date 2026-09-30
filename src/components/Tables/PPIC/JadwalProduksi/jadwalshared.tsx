import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import convertTimeStampToDate from '../../../../utils/convertDate';
import formatInteger from '../../../../utils/formaterInteger';

/* ------------------------------------------------------------------ */
/* Types & constants                                                   */
/* ------------------------------------------------------------------ */

export interface JobOrder {
  id: number;
  no_jo: string;
  no_io: string;
  item: string;
  qty_druk: number;
  qty_pcs: number;
  tgl_kirim: string;
  no_booking?: string;
}

export interface ListJOData {
  data: JobOrder[];
}

export type ChipStatus = 'normal' | 'match' | 'active' | 'dim';

export const SIDEBAR_W = 148;
export const HEADER_H = 48;
export const MAX_CHIPS = 4;
export const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const FULL_DAY_NAMES = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
];
const FULL_MONTH_NAMES = [
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

export const ICONS = {
  left: 'M15 18l-6-6 6-6',
  right: 'M9 18l6-6-6-6',
  up: 'M6 15l6-6 6 6',
  down: 'M6 9l6 6 6-6',
  search: 'M21 21l-4.3-4.3M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z',
  x: 'M18 6L6 18M6 6l12 12',
  funnel: 'M3 4h18l-7 8v6l-4 2v-8L3 4z',
  download: 'M12 3v12m0 0l-4-4m4 4l4-4M4 21h16',
  clock: 'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  check: 'M5 13l4 4L19 7',
};

export const DETAIL_ROWS: { label: string; key: string }[] = [
  { label: 'KATEGORI', key: 'kategory' },
  { label: 'DRYING TIME', key: 'kategory_drying_time' },
  { label: 'MESIN', key: 'mesin' },
  { label: 'KAPASITAS/JAM', key: 'kapasitas_per_jam' },
  { label: 'DRYING TIME (JAM)', key: 'drying_time' },
  { label: 'SETTING (JAM)', key: 'setting' },
  { label: 'KAPASITAS (JAM)', key: 'kapasitas' },
  { label: 'TOLERANSI', key: 'toleransi' },
  { label: 'TOTAL WAKTU', key: 'total_waktu' },
];

// Class names are written in full so Tailwind can detect them.
const JO_PALETTE = [
  {
    bar: 'border-l-blue-500',
    bg: 'bg-blue-50',
    hover: 'hover:bg-blue-100',
    text: 'text-blue-900',
  },
  {
    bar: 'border-l-emerald-500',
    bg: 'bg-emerald-50',
    hover: 'hover:bg-emerald-100',
    text: 'text-emerald-900',
  },
  {
    bar: 'border-l-violet-500',
    bg: 'bg-violet-50',
    hover: 'hover:bg-violet-100',
    text: 'text-violet-900',
  },
  {
    bar: 'border-l-orange-500',
    bg: 'bg-orange-50',
    hover: 'hover:bg-orange-100',
    text: 'text-orange-900',
  },
  {
    bar: 'border-l-teal-500',
    bg: 'bg-teal-50',
    hover: 'hover:bg-teal-100',
    text: 'text-teal-900',
  },
  {
    bar: 'border-l-rose-500',
    bg: 'bg-rose-50',
    hover: 'hover:bg-rose-100',
    text: 'text-rose-900',
  },
  {
    bar: 'border-l-indigo-500',
    bg: 'bg-indigo-50',
    hover: 'hover:bg-indigo-100',
    text: 'text-indigo-900',
  },
  {
    bar: 'border-l-amber-500',
    bg: 'bg-amber-50',
    hover: 'hover:bg-amber-100',
    text: 'text-amber-900',
  },
  {
    bar: 'border-l-cyan-500',
    bg: 'bg-cyan-50',
    hover: 'hover:bg-cyan-100',
    text: 'text-cyan-900',
  },
  {
    bar: 'border-l-fuchsia-500',
    bg: 'bg-fuchsia-50',
    hover: 'hover:bg-fuchsia-100',
    text: 'text-fuchsia-900',
  },
];

const BOOKING_TEXT = [
  'text-red-700',
  'text-blue-700',
  'text-green-700',
  'text-purple-700',
  'text-pink-700',
  'text-indigo-700',
  'text-yellow-700',
  'text-gray-700',
  'text-cyan-700',
  'text-emerald-700',
  'text-violet-700',
  'text-amber-700',
];

/* ------------------------------------------------------------------ */
/* Date helpers                                                        */
/* ------------------------------------------------------------------ */

export const pad = (n: number) => String(n).padStart(2, '0');
export const toYMD = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parseYMD = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const addDays = (ymd: string, n: number) => {
  const d = parseYMD(ymd);
  d.setDate(d.getDate() + n);
  return toYMD(d);
};
export const currentMonthStr = () => toYMD(new Date()).slice(0, 7);
export const shiftMonth = (ym: string, delta: number) => {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
};
export const dayKey = (d: Date) =>
  `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
export const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

// "Hari, DD Bulan YYYY"
export const formatIndonesianDate = (dateString: any) => {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(String(dateString))
    ? parseYMD(String(dateString))
    : new Date(dateString);
  return `${FULL_DAY_NAMES[date.getDay()]}, ${date.getDate()} ${
    FULL_MONTH_NAMES[date.getMonth()]
  } ${date.getFullYear()}`;
};

export const formatCustomDate = (dateString?: string | null) => {
  if (!dateString) return '-';
  const [datePart, timePart = ''] = dateString.split(' ');
  const [year, month, day] = datePart.split('-');
  return `${parseInt(day)} / ${
    FULL_MONTH_NAMES[parseInt(month) - 1]
  } / ${year} - ${timePart.replace(/\./g, ':')}`;
};

/* ------------------------------------------------------------------ */
/* Ordering & grouping (single source of truth for all three views)    */
/* ------------------------------------------------------------------ */

export const hashString = (str: string): number => {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const JAM_LAST = '~'; // sorts after any "HH:MM:SS"

/**
 * Turns the raw rows of ONE cell (one machine on one day, or one machine in
 * one hour) into the list the UI shows:
 *  - the same JO + booking is merged into a single entry
 *    (all raw rows stay available in `_items`, all hours in `_jams`)
 *  - entries are ordered by their earliest hour, then by JO number
 * so the JO that starts first in the daily view is also first in the
 * weekly and monthly views.
 */
export const groupJobsForCell = (items: any[]): any[] => {
  const map = new Map<string, any[]>();
  items.forEach((it) => {
    const k = `${it.no_jo ?? ''}_${it.no_booking ?? ''}`;
    const arr = map.get(k);
    if (arr) arr.push(it);
    else map.set(k, [it]);
  });
  const out = [...map.values()].map((group) => {
    const sorted = [...group].sort((a, b) =>
      String(a.jam || JAM_LAST).localeCompare(String(b.jam || JAM_LAST)),
    );
    const jams = [
      ...new Set(sorted.map((g) => g.jam).filter(Boolean)),
    ] as string[];
    return {
      ...sorted[0],
      _items: sorted,
      _jams: jams,
      _firstJam: jams[0] ?? '',
    };
  });
  return out.sort(
    (a, b) =>
      (a._firstJam || JAM_LAST).localeCompare(b._firstJam || JAM_LAST) ||
      String(a.no_jo ?? '').localeCompare(String(b.no_jo ?? '')) ||
      String(a.no_booking ?? '').localeCompare(String(b.no_booking ?? '')),
  );
};

// machine -> dayKey -> ordered, merged entries
export const groupByMachineDay = (data: any[]) => {
  const tmp = new Map<string, Map<string, any[]>>();
  data.forEach((item) => {
    const k = dayKey(new Date(item.tanggal));
    if (!tmp.has(item.mesin)) tmp.set(item.mesin, new Map());
    const m = tmp.get(item.mesin)!;
    if (!m.has(k)) m.set(k, []);
    m.get(k)!.push(item);
  });
  const out = new Map<string, Map<string, any[]>>();
  tmp.forEach((days, machine) => {
    const m = new Map<string, any[]>();
    days.forEach((arr, k) => m.set(k, groupJobsForCell(arr)));
    out.set(machine, m);
  });
  return out;
};

export const mergeMachines = (list: string[], ...datasets: any[][]) => {
  const set = new Set(list);
  const extras: string[] = [];
  datasets.forEach((ds) =>
    ds.forEach((d) => {
      if (d.mesin && !set.has(d.mesin)) {
        set.add(d.mesin);
        extras.push(d.mesin);
      }
    }),
  );
  return [...list, ...extras];
};

/* ------------------------------------------------------------------ */
/* Hooks                                                               */
/* ------------------------------------------------------------------ */

export function useClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  active: boolean,
  onOutside: () => void,
) {
  useEffect(() => {
    if (!active) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, active, onOutside]);
}

export function useMachineList() {
  const [machineList, setMachineList] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    (async () => {
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
      } finally {
        setReady(true);
      }
    })();
  }, []);
  return { machineList, ready };
}

export function useMasterKategori() {
  const [historyListJO, setHistoryListJO] = useState<ListJOData>({ data: [] });
  const [penjadwalanListJO, setPenjadwalanListJO] = useState<ListJOData>({
    data: [],
  });
  const [loading, setLoading] = useState(false);

  const getmasterKategori = useCallback(
    async (
      statusTiket: string = 'history',
      startDate: string = '',
      endDate: string = '',
      searchTerm: string = '',
    ) => {
      const url = `${import.meta.env.VITE_API_LINK}/ppic/jadwalProduksi`;
      try {
        setLoading(true);
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
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    getmasterKategori('history');
    getmasterKategori('penjadwalan');
  }, [getmasterKategori]);

  return { historyListJO, penjadwalanListJO, getmasterKategori, loading };
}

export function useJobTicket() {
  const [listJO1, setJo1] = useState<any>();
  const [showDetail, setShowDetail] = useState<boolean[]>([]);
  const [loading, setLoading] = useState(false);

  const get1Tiket = useCallback(async (id: any, _i?: any) => {
    const url = `${import.meta.env.VITE_API_LINK}/ppic/jadwalProduksi/${id}`;
    try {
      setLoading(true);
      const res = await axios.get(url, { withCredentials: true });
      setJo1(res.data);
      setShowDetail(new Array(res.data?.data?.tahap?.length || 0).fill(false));
    } catch (error) {
      console.error('Error fetching ticket:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleDetail = useCallback((index: number) => {
    setShowDetail((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  }, []);

  return { listJO1, get1Tiket, showDetail, toggleDetail, loading };
}

/* ------------------------------------------------------------------ */
/* Components                                                          */
/* ------------------------------------------------------------------ */

export const Icon = ({
  d,
  className = 'w-4 h-4',
}: {
  d: string;
  className?: string;
}) => (
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

export const Segmented = ({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: any) => void;
  options: { value: string; label: string }[];
}) => (
  <div
    className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5"
    role="group"
  >
    {options.map((o) => (
      <button
        key={o.value}
        type="button"
        onClick={() => onChange(o.value)}
        className={`px-3 h-8 text-sm font-medium rounded-md transition ${
          value === o.value
            ? 'bg-white text-[#0065de] shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        {o.label}
      </button>
    ))}
  </div>
);

export const Toggle = ({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) => (
  <label className="h-9 inline-flex items-center gap-2 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-700 cursor-pointer select-none hover:bg-slate-50">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="accent-[#0065de]"
    />
    {label}
  </label>
);

export const LoadingBar = ({ active }: { active: boolean }) => (
  <div
    className={`mt-3 h-0.5 rounded bg-[#0065de] transition-opacity ${
      active ? 'opacity-100 animate-pulse' : 'opacity-0'
    }`}
  />
);

export const GridSkeleton = () => (
  <div className="animate-pulse rounded-xl border border-[#D8EAFF] p-3">
    <div className="mb-2 h-10 rounded bg-slate-100" />
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="mb-2 h-14 rounded bg-slate-50" />
    ))}
    <p className="mt-2 text-center text-sm text-slate-500">
      Memuat jadwal produksi…
    </p>
  </div>
);

/** One JO in a cell. Same look and colour in daily, weekly and monthly. */
export const JobChip = React.memo(function JobChip({
  data,
  status = 'normal',
  onClick,
  onHover,
  showTime = true,
}: {
  data: any;
  status?: ChipStatus;
  onClick?: (d: any) => void;
  onHover?: (d: any | null) => void;
  showTime?: boolean;
}) {
  const c = JO_PALETTE[hashString(data.no_jo || '') % JO_PALETTE.length];
  const bookingColor = data.no_booking
    ? BOOKING_TEXT[hashString(data.no_booking) % BOOKING_TEXT.length]
    : '';
  const time =
    showTime && data._firstJam ? String(data._firstJam).slice(0, 5) : '';
  const ring =
    status === 'active'
      ? 'ring-2 ring-amber-500 shadow-md relative z-[1]'
      : status === 'match'
      ? 'ring-2 ring-amber-300'
      : 'ring-1 ring-black/5';
  const jams: string[] = data._jams ?? (data.jam ? [data.jam] : []);
  return (
    <button
      type="button"
      onClick={() => onClick?.(data)}
      onMouseEnter={() => onHover?.(data)}
      onMouseLeave={() => onHover?.(null)}
      title={`${data.no_jo}${data.no_booking ? ` • ${data.no_booking}` : ''}\n${
        data.item ?? ''
      }${
        jams.length ? `\nJam: ${jams.map((j) => j.slice(0, 5)).join(', ')}` : ''
      }`}
      className={`w-full text-left rounded border-l-4 px-1.5 py-1 shadow-sm transition ${
        c.bar
      } ${c.bg} ${c.hover} ${c.text} ${ring} ${
        status === 'dim' ? 'opacity-25' : ''
      }`}
    >
      <span className="block truncate text-[10px] font-semibold leading-tight">
        {data.no_jo}
      </span>
      {(data.no_booking || time) && (
        <span className="flex items-baseline justify-between gap-1 leading-tight">
          <span
            className={`min-w-0 flex-1 truncate text-[9px] font-medium ${bookingColor}`}
          >
            {data.no_booking}
          </span>
          {time && (
            <span className="shrink-0 text-[9px] tabular-nums opacity-60">
              {time}
            </span>
          )}
        </span>
      )}
    </button>
  );
});

export const JobDetailCard = ({
  data,
  onClose,
}: {
  data: any;
  onClose?: () => void;
}) => {
  const items: any[] = data._items ?? [data];
  const tahapan = [...new Set(items.map((i) => i.tahapan).filter(Boolean))];
  const jams: string[] = data._jams?.length
    ? data._jams
    : data.jam
    ? [data.jam]
    : [];
  const rows: [string, any][] = [
    ['Job Order', data.no_jo],
    ['No Booking', data.no_booking || 'N/A'],
    ['Item', data.item],
    ['Machine', data.mesin],
  ];
  if (data.tanggal) rows.push(['Date', convertTimeStampToDate(data.tanggal)]);
  if (tahapan.length) rows.push(['Tahapan', tahapan.join(', ')]);
  if (jams.length)
    rows.push(['Jam', jams.map((j) => j.slice(0, 5)).join(', ')]);
  if (data.qty_pcs != null) rows.push(['Qty Pcs', formatInteger(data.qty_pcs)]);
  if (data.qty_druk != null)
    rows.push(['Qty Druk', formatInteger(data.qty_druk)]);
  return (
    <div
      className={`fixed bottom-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white p-4 shadow-2xl ${
        onClose ? '' : 'pointer-events-none'
      }`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="text-sm font-bold text-slate-800">Job Order Details</h3>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            title="Close"
            aria-label="Tutup"
            className="rounded p-1 text-slate-500 hover:bg-slate-100"
          >
            <Icon d={ICONS.x} />
          </button>
        )}
      </div>
      <dl className="grid grid-cols-[96px_1fr] gap-x-2 gap-y-1 text-xs">
        {rows.map(([k, v]) => (
          <React.Fragment key={k}>
            <dt className="font-semibold text-slate-600">{k}</dt>
            <dd className="break-words text-slate-900">{v}</dd>
          </React.Fragment>
        ))}
      </dl>
    </div>
  );
};

export const MachineFilter = ({
  machines,
  counts,
  value,
  onChange,
}: {
  machines: string[];
  counts: Map<string, number>;
  value: Set<string> | null;
  onChange: (v: Set<string> | null) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(
    ref,
    open,
    useCallback(() => setOpen(false), []),
  );
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open]);

  const commit = (s: Set<string>) =>
    onChange(s.size >= machines.length ? null : s);
  const toggle = (m: string) => {
    const base = new Set(value ?? machines);
    if (base.has(m)) base.delete(m);
    else base.add(m);
    commit(base);
  };
  const list = machines.filter((m) =>
    m.toLowerCase().includes(search.trim().toLowerCase()),
  );
  const active = value !== null;
  const selected = value ? value.size : machines.length;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`h-9 px-3 inline-flex items-center gap-2 rounded-lg border text-sm font-medium transition ${
          active
            ? 'border-[#0065de] bg-[#D8EAFF] text-[#0065de]'
            : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
        }`}
      >
        <Icon d={ICONS.funnel} />
        Mesin
        <span className="rounded-full bg-white/80 px-1.5 text-xs tabular-nums">
          {selected}/{machines.length}
        </span>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 w-72 rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="p-2 border-b border-slate-100">
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari mesin…"
              className="w-full h-8 rounded-md border border-slate-300 px-2 text-sm outline-none focus:border-[#0065de]"
            />
            <div className="flex flex-wrap gap-1 mt-2">
              <button
                type="button"
                onClick={() => onChange(null)}
                className="px-2 py-1 rounded-md bg-slate-100 text-xs font-medium text-slate-700 hover:bg-slate-200"
              >
                Pilih semua
              </button>
              <button
                type="button"
                onClick={() => onChange(new Set())}
                className="px-2 py-1 rounded-md bg-slate-100 text-xs font-medium text-slate-700 hover:bg-slate-200"
              >
                Kosongkan
              </button>
              <button
                type="button"
                onClick={() =>
                  commit(
                    new Set(machines.filter((m) => (counts.get(m) || 0) > 0)),
                  )
                }
                className="px-2 py-1 rounded-md bg-slate-100 text-xs font-medium text-slate-700 hover:bg-slate-200"
              >
                Hanya yang terjadwal
              </button>
            </div>
          </div>
          <ul className="max-h-64 overflow-y-auto py-1">
            {list.length === 0 && (
              <li className="px-3 py-2 text-sm text-slate-500">
                Mesin tidak ditemukan.
              </li>
            )}
            {list.map((m) => {
              const n = counts.get(m) || 0;
              return (
                <li key={m}>
                  <label className="flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-[#F0F7FF]">
                    <input
                      type="checkbox"
                      checked={!value || value.has(m)}
                      onChange={() => toggle(m)}
                      className="accent-[#0065de]"
                    />
                    <span className="flex-1 text-sm text-slate-800 truncate">
                      {m}
                    </span>
                    <span
                      className={`text-xs tabular-nums ${
                        n ? 'text-slate-500' : 'text-slate-300'
                      }`}
                    >
                      {n}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export const FilterChips = ({
  value,
  onChange,
}: {
  value: Set<string> | null;
  onChange: (v: Set<string> | null) => void;
}) => {
  if (!value) return null;
  const list = [...value];
  return (
    <div className="flex flex-wrap items-center gap-1.5 pt-2">
      {list.slice(0, 10).map((m) => (
        <span
          key={m}
          className="inline-flex items-center gap-1 rounded-full bg-[#D8EAFF] pl-2.5 pr-1 py-0.5 text-xs font-medium text-[#0065de]"
        >
          {m}
          <button
            type="button"
            aria-label={`Sembunyikan ${m}`}
            onClick={() => {
              const next = new Set(value);
              next.delete(m);
              onChange(next);
            }}
            className="rounded-full p-0.5 hover:bg-white/70"
          >
            <Icon d={ICONS.x} className="w-3 h-3" />
          </button>
        </span>
      ))}
      {list.length > 10 && (
        <span className="text-xs text-slate-500">
          +{list.length - 10} mesin lain
        </span>
      )}
      <button
        type="button"
        onClick={() => onChange(null)}
        className="text-xs font-medium text-[#0065de] underline underline-offset-2"
      >
        Tampilkan semua mesin
      </button>
    </div>
  );
};

export const InfoRow = ({ label, value }: { label: string; value: any }) => (
  <div className="grid grid-cols-2 gap-2">
    <label className="text-black text-xs font-bold">{label}</label>
    <label className="text-[#016ae6] uppercase text-xl font-normal">
      : {value}
    </label>
  </div>
);

/** Body of the "Rumus Kalkulasi" ModalXL, identical in every view. */
export const JODetailContent = ({
  selectedJO,
  listJO1,
  expanded,
  onToggleDetail,
}: {
  selectedJO: any;
  listJO1: any;
  expanded: boolean;
  onToggleDetail: () => void;
}) => (
  <>
    <div className="grid grid-cols-2 gap-2 px-4 py-4 border-b-8 border-[#D8EAFF]">
      <div className="flex flex-col">
        <InfoRow label="Nomor JO" value={selectedJO?.no_jo} />
        <InfoRow label="Item" value={selectedJO?.item} />
        <InfoRow
          label="Tanggal Kirim"
          value={convertTimeStampToDate(selectedJO?.tgl_kirim)}
        />
      </div>
      <div className="flex flex-col">
        <InfoRow label="Qty Druk" value={formatInteger(selectedJO?.qty_druk)} />
        <InfoRow label="Qty Pcs" value={formatInteger(selectedJO?.qty_pcs)} />
      </div>
    </div>

    <div className="flex overflow-x-scroll max-w-screen border-b-8 border-[#D8EAFF] gap-2 px-4 py-4">
      <div className="w-[150px] flex flex-col">
        <label className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]">
          TAHAPAN
        </label>
        <label className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]">
          TANGGAL
        </label>
        {expanded &&
          DETAIL_ROWS.map((r) => (
            <label
              key={r.key}
              className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]"
            >
              {r.label}
            </label>
          ))}
      </div>

      <div className="flex overflow-x-scroll max-w-screen">
        {listJO1?.data?.tahap?.map((data2: any, ii: number) => (
          <div key={ii} className="min-w-[150px] flex flex-col justify-center">
            <label className="text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]">
              {data2.tahapan}
            </label>
            <div className="justify-center border-2 border-stroke flex items-center h-[50px]">
              {data2?.jadwal_per_jam?.length === 0 ? (
                <label className="text-blue-400 text-xs border-2 px-2 py-1 rounded-md border-blue-400 text-center">
                  {formatCustomDate(data2.tgl_from)}
                </label>
              ) : (
                <button className="text-blue-400 text-xs border-2 px-2 py-1 rounded-md border-blue-400 text-center">
                  {convertTimeStampToDate(data2.jadwal_per_jam?.[0]?.tanggal)} -{' '}
                  {data2.jadwal_per_jam?.[0]?.jam}
                </button>
              )}
            </div>
            {expanded &&
              DETAIL_ROWS.map((r) => (
                <label
                  key={r.key}
                  className="text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]"
                >
                  {data2[r.key]}
                </label>
              ))}
          </div>
        ))}
      </div>
      <div>
        <button
          title="button"
          onClick={onToggleDetail}
          className="text-xs w-full flex font-bold text-white px-1 bg-blue-700 py-2 border-blue-700 border rounded-md"
        >
          DETAIL
        </button>
      </div>
    </div>
  </>
);
