import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import axios from 'axios';
import Loading from '../../../Loading';
import convertTimeStampToDate from '../../../../utils/convertDate';
import formatInteger from '../../../../utils/formaterInteger';

/* ------------------------------------------------------------------ */
/* Types & helpers                                                     */
/* ------------------------------------------------------------------ */

interface PopUpTable2Props {
  dataMap: any;
  onClose: () => void;
  onFinish: () => void;
  tgl: any;
}

type ColorSet = {
  bg: string;
  border: string;
  text: string;
  textSecondary: string;
};

const DAYS_VISIBLE = 7;
// Fixed, equal day columns: minmax(0,1fr) stops long text from widening a column
const GRID_STYLE = {
  gridTemplateColumns: `72px repeat(${7}, minmax(0, 1fr))`,
} as const;
const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const HOURS = Array.from(
  { length: 24 },
  (_, i) => `${i.toString().padStart(2, '0')}:00:00`,
);

// Full class names so Tailwind can see them
const COLOR_PALETTE: ColorSet[] = [
  {
    bg: 'bg-red-100',
    border: 'border-red-300',
    text: 'text-red-800',
    textSecondary: 'text-red-600',
  },
  {
    bg: 'bg-blue-100',
    border: 'border-blue-300',
    text: 'text-blue-800',
    textSecondary: 'text-blue-600',
  },
  {
    bg: 'bg-green-100',
    border: 'border-green-300',
    text: 'text-green-800',
    textSecondary: 'text-green-600',
  },
  {
    bg: 'bg-purple-100',
    border: 'border-purple-300',
    text: 'text-purple-800',
    textSecondary: 'text-purple-600',
  },
  {
    bg: 'bg-pink-100',
    border: 'border-pink-300',
    text: 'text-pink-800',
    textSecondary: 'text-pink-600',
  },
  {
    bg: 'bg-indigo-100',
    border: 'border-indigo-300',
    text: 'text-indigo-800',
    textSecondary: 'text-indigo-600',
  },
  {
    bg: 'bg-teal-100',
    border: 'border-teal-300',
    text: 'text-teal-800',
    textSecondary: 'text-teal-600',
  },
  {
    bg: 'bg-orange-100',
    border: 'border-orange-300',
    text: 'text-orange-800',
    textSecondary: 'text-orange-600',
  },
  {
    bg: 'bg-cyan-100',
    border: 'border-cyan-300',
    text: 'text-cyan-800',
    textSecondary: 'text-cyan-600',
  },
  {
    bg: 'bg-emerald-100',
    border: 'border-emerald-300',
    text: 'text-emerald-800',
    textSecondary: 'text-emerald-600',
  },
  {
    bg: 'bg-violet-100',
    border: 'border-violet-300',
    text: 'text-violet-800',
    textSecondary: 'text-violet-600',
  },
  {
    bg: 'bg-rose-100',
    border: 'border-rose-300',
    text: 'text-rose-800',
    textSecondary: 'text-rose-600',
  },
  {
    bg: 'bg-sky-100',
    border: 'border-sky-300',
    text: 'text-sky-800',
    textSecondary: 'text-sky-600',
  },
  {
    bg: 'bg-lime-100',
    border: 'border-lime-300',
    text: 'text-lime-800',
    textSecondary: 'text-lime-600',
  },
  {
    bg: 'bg-amber-100',
    border: 'border-amber-300',
    text: 'text-amber-800',
    textSecondary: 'text-amber-600',
  },
];

// Stable color per JO (same JO always gets the same color, no state needed)
const getJoColor = (joKey: string): ColorSet => {
  let hash = 0;
  for (let i = 0; i < joKey.length; i++) {
    hash = (hash * 31 + joKey.charCodeAt(i)) >>> 0;
  }
  return COLOR_PALETTE[hash % COLOR_PALETTE.length];
};

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

const generateDays = (start: Date, count: number) =>
  Array.from({ length: count }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });

// Value for <input type="datetime-local"> (display only)
const toLocalInput = (v: any) => {
  if (!v) return '';
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v))
    return v;
  const d = new Date(v);
  if (isNaN(d.getTime())) return '';
  const p = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(
    d.getHours(),
  )}:${p(d.getMinutes())}`;
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
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

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

/**
 * Layout: schedule grid fills the left side (full height),
 * JO info + actions live in a right sidebar.
 * Render inside <AppModal size="screen" flush>.
 */
const PopUpTable2 = ({ dataMap, onClose, onFinish, tgl }: PopUpTable2Props) => {
  const [data, setData] = useState<any>(dataMap);
  const [semuaTahap, setSemuaTahap] = useState<boolean>(false);
  const [allJobsData, setAllJobsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState(new Date(dataMap?.tanggal));
  const [dragging, setDragging] = useState(false);
  const [hoverCell, setHoverCell] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  const daysList = useMemo(
    () => generateDays(startDate, DAYS_VISIBLE),
    [startDate],
  );
  const todayKey = useMemo(() => dayKey(new Date()), []);

  // Re-sync when a different schedule item is passed in
  useEffect(() => {
    if (!dataMap) return;
    setData(dataMap);
    setStartDate(new Date(dataMap.tanggal));
    setSemuaTahap(false);
  }, [dataMap?.id]);

  // Scroll to the scheduled hour on open
  useEffect(() => {
    if (!dataMap?.jam) return;
    const t = window.setTimeout(() => {
      scrollRef.current
        ?.querySelector(`[data-hour="${dataMap.jam}"]`)
        ?.scrollIntoView({ block: 'center' });
    }, 60);
    return () => window.clearTimeout(t);
  }, [dataMap?.id]);

  /* ------------------------------ API (unchanged) ------------------------------ */

  const fetchJobsForDateRange = async (start: Date, end: Date) => {
    const url = `${import.meta.env.VITE_API_LINK}/ppic/jadwalProduksiView`;
    try {
      setIsLoading(true);
      const response = await axios.get(url, {
        params: {
          start_date: start.toISOString().split('T')[0],
          end_date: end.toISOString().split('T')[0],
        },
        withCredentials: true,
      });

      // Only jobs on the same machine
      const filteredJobs = (response.data.data || []).filter(
        (job: any) => job.mesin === data.mesin,
      );
      setAllJobsData(filteredJobs);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching jobs data:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6); // 7 days total
    fetchJobsForDateRange(startDate, endDate);
  }, [startDate, data.mesin]);

  const putJadwalView = async () => {
    const url = `${import.meta.env.VITE_API_LINK}/ppic/jadwalProduksiView/${
      data.id
    }`;
    try {
      setIsLoading(true);
      await axios.put(
        url,
        { data_jadwal: data, isSemuaTahap: semuaTahap },
        { withCredentials: true },
      );
      setIsLoading(false);
      onClose();
      onFinish();
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsLoading(false);
    }
  };

  // Prepared for the overtime action (not wired to the UI, same as before)
  const lemburOneDay = async () => {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/ppic/jadwalProduksiView/lembur/${data.id}`;
    try {
      setIsLoading(true);
      await axios.put(
        url,
        { data_jadwal: data, tgl_lembur: tgl },
        { withCredentials: true },
      );
      onClose();
      onFinish();
      alert('berhasil');
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsLoading(false);
    }
  };
  void lemburOneDay;

  const handleSimpan = async () => {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/ppic/jadwalProduksiView/move/${data.id}`;
    try {
      setIsLoading(true);
      await axios.put(url, { data_jadwal: data }, { withCredentials: true });
      setIsLoading(false);
      onClose();
      onFinish();
      alert('Data berhasil disimpan!');
    } catch (error) {
      console.error('Error saving data:', error);
      setIsLoading(false);
      alert('Gagal menyimpan data. Silakan coba lagi.');
    }
  };

  /* ------------------------------ derived ------------------------------ */

  const originalKey = dayKey(new Date(dataMap.tanggal));
  const currentKey = dayKey(new Date(data.tanggal));
  const isMoved = data.jam !== dataMap.jam || currentKey !== originalKey;

  // "day|hour" -> one representative per JO (same as before)
  const slots = useMemo(() => {
    const map = new Map<string, Map<string, any>>();
    allJobsData.forEach((job) => {
      const k = `${dayKey(new Date(job.tanggal))}|${job.jam}`;
      const joKey = job.no_jo || job.no_booking || 'unknown';
      if (!map.has(k)) map.set(k, new Map());
      const byJo = map.get(k)!;
      if (!byJo.has(joKey)) byJo.set(joKey, job);
    });
    return map;
  }, [allJobsData]);

  /* ------------------------------ handlers ------------------------------ */

  const shiftDays = useCallback((delta: number) => {
    setStartDate((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + delta);
      return next;
    });
  }, []);

  const moveTo = useCallback((day: Date, jam: string) => {
    setData((prev: any) => {
      if (prev.jam === jam && dayKey(new Date(prev.tanggal)) === dayKey(day))
        return prev;
      return { ...prev, tanggal: day.toISOString(), jam };
    });
  }, []);

  const handleReset = () => {
    setData(dataMap);
    setStartDate(new Date(dataMap.tanggal));
  };

  const handleDrop = (e: React.DragEvent, day: Date, jam: string) => {
    e.preventDefault();
    setDragging(false);
    setHoverCell(null);
    moveTo(day, jam);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify(data));
    e.dataTransfer.effectAllowed = 'move';
    setDragging(true);
  };

  // Same behaviour as before: stores the typed value and its HH:MM
  const handleDateChange = (newDate: string) => {
    if (!newDate) {
      setData((prev: any) => ({ ...prev, tanggal: newDate }));
      return;
    }
    const timeString = new Date(newDate).toTimeString().substring(0, 5);
    setData((prev: any) => ({ ...prev, tanggal: newDate, jam: timeString }));
  };

  /* ------------------------------ render ------------------------------ */

  const rangeLabel = `${convertTimeStampToDate(
    daysList[0].toISOString(),
  )} - ${convertTimeStampToDate(daysList[DAYS_VISIBLE - 1].toISOString())}`;

  const navBtn =
    'h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50';

  const currentLabel = data.no_jo || data.no_booking || 'No JO/Booking';

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-y-auto lg:flex-row lg:overflow-hidden">
      {isLoading && <Loading />}

      {/* ---------------- Left: schedule grid ---------------- */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              className={navBtn}
              onClick={() => shiftDays(-7)}
            >
              « 7 hari
            </button>
            <button
              type="button"
              className={navBtn}
              onClick={() => shiftDays(-1)}
            >
              ‹ 1 hari
            </button>
          </div>

          <span className="text-sm font-semibold text-blue-500">
            {rangeLabel}
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              className={navBtn}
              onClick={() => shiftDays(1)}
            >
              1 hari ›
            </button>
            <button
              type="button"
              className={navBtn}
              onClick={() => shiftDays(7)}
            >
              7 hari »
            </button>
          </div>

          <button
            type="button"
            onClick={() => setStartDate(new Date(data.tanggal))}
            className="ml-auto h-9 rounded-lg bg-[#D8EAFF] px-3 text-xs font-semibold text-[#0065de] hover:opacity-90"
          >
            Ke jadwal terpilih
          </button>
        </div>

        <div
          ref={scrollRef}
          className="relative min-h-[360px] flex-1 overflow-auto rounded-xl border border-[#D8EAFF] bg-white"
        >
          <div className="min-w-[760px]">
            {/* Header */}
            <div
              className="sticky top-0 z-20 grid border-b border-[#D8EAFF] bg-[#eaf4ff]"
              style={GRID_STYLE}
            >
              <div className="sticky left-0 z-30 grid h-12 place-items-center border-r border-[#D8EAFF] bg-[#eaf4ff] text-[11px] font-semibold text-[#0065de]">
                Jam
              </div>
              {daysList.map((day) => {
                const k = dayKey(day);
                const today = k === todayKey;
                return (
                  <div
                    key={k}
                    className={`flex h-12 min-w-0 flex-col items-center justify-center border-r border-[#D8EAFF] last:border-r-0 ${
                      isWeekend(day) ? 'text-rose-600' : 'text-[#0065de]'
                    }`}
                  >
                    <span className="text-[10px] font-medium opacity-80">
                      {DAY_NAMES[day.getDay()]}
                    </span>
                    <span
                      className={`mt-0.5 text-[12px] font-semibold leading-none ${
                        today
                          ? 'rounded-full bg-[#0065de] px-2 py-0.5 text-white'
                          : ''
                      }`}
                    >
                      {day.toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: '2-digit',
                      })}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Rows */}
            {HOURS.map((hour, ri) => {
              const zebra = ri % 2 === 0 ? 'bg-[#F0F7FF]' : 'bg-white';
              return (
                <div
                  key={hour}
                  data-hour={hour}
                  className={`grid border-b border-[#E3EEFB] ${zebra}`}
                  style={GRID_STYLE}
                >
                  <div
                    className={`sticky left-0 z-10 grid place-items-center border-r border-[#D8EAFF] text-[11px] font-semibold tabular-nums text-[#0065de] ${zebra}`}
                  >
                    {hour.slice(0, 5)}
                  </div>

                  {daysList.map((day) => {
                    const k = dayKey(day);
                    const cellId = `${k}|${hour}`;
                    const isCurrent = data.jam === hour && currentKey === k;
                    const isOrigin =
                      isMoved && dataMap.jam === hour && originalKey === k;
                    const isHover = dragging && hoverCell === cellId;

                    // Other jobs in this slot (excluding the one being edited)
                    const others = Array.from(
                      (slots.get(cellId) ?? new Map()).values(),
                    ).filter((job: any) => job.id !== data.id);
                    const conflict = isCurrent && others.length > 0;
                    const empty =
                      !isCurrent && !isOrigin && others.length === 0;
                    const tint = isWeekend(day) ? 'bg-[#0065de]/[0.05]' : '';

                    return (
                      <div
                        key={cellId}
                        onDragOver={(e) => {
                          e.preventDefault();
                          if (hoverCell !== cellId) setHoverCell(cellId);
                        }}
                        onDragLeave={() =>
                          setHoverCell((c) => (c === cellId ? null : c))
                        }
                        onDrop={(e) => handleDrop(e, day, hour)}
                        onClick={() => empty && moveTo(day, hour)}
                        className={`flex min-h-[52px] min-w-0 flex-col gap-1 overflow-hidden border-r border-[#E3EEFB] p-1 last:border-r-0 ${tint} ${
                          conflict
                            ? 'bg-rose-100 ring-2 ring-inset ring-rose-300'
                            : ''
                        } ${
                          isHover
                            ? 'bg-[#D8EAFF] ring-2 ring-inset ring-[#0065de]'
                            : ''
                        } ${empty ? 'cursor-pointer hover:bg-[#E3F0FF]' : ''}`}
                      >
                        {conflict && (
                          <span className="text-center text-[10px] font-bold text-rose-700">
                            BENTROK
                          </span>
                        )}

                        {isCurrent && (
                          <div
                            draggable
                            onDragStart={handleDragStart}
                            onDragEnd={() => {
                              setDragging(false);
                              setHoverCell(null);
                            }}
                            title="Drag untuk memindahkan"
                            className={`cursor-grab select-none rounded-md px-2 py-1.5 text-center text-white shadow active:cursor-grabbing ${
                              isMoved ? 'bg-amber-500' : 'bg-[#0065de]'
                            }`}
                          >
                            <div className="truncate text-[11px] font-bold">
                              {currentLabel}
                            </div>
                            <div className="truncate text-[10px] opacity-90">
                              {data.tahapan}
                            </div>
                          </div>
                        )}

                        {isOrigin && (
                          <div className="rounded-md border border-dashed border-slate-400 px-2 py-1.5 text-center text-[10px] text-slate-500">
                            Posisi awal
                          </div>
                        )}

                        {others.map((job: any, i: number) => {
                          const joKey =
                            job.no_jo || job.no_booking || 'unknown';
                          const c = getJoColor(joKey);
                          return (
                            <div
                              key={`${joKey}-${i}`}
                              title={`${joKey} · ${job.tahapan} · ${job.mesin}`}
                              className={`rounded-md border px-2 py-1 text-center ${c.bg} ${c.border}`}
                            >
                              <div
                                className={`truncate text-[11px] font-semibold ${c.text}`}
                              >
                                {job.no_jo || job.no_booking || 'No JO/Booking'}
                              </div>
                              <div
                                className={`truncate text-[10px] ${c.textSecondary}`}
                              >
                                {job.tahapan}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ---------------- Right: info + actions ---------------- */}
      <aside className="flex w-full shrink-0 flex-col gap-3 lg:w-[300px] lg:overflow-y-auto">
        <div className="space-y-3 rounded-xl bg-[#F0F7FF] p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-700">
            Informasi Job Order
          </p>
          <InfoRow label="Nomor JO" value={data.no_jo} />
          <InfoRow label="Item" value={data.item} />
          <InfoRow label="Tahapan" value={data.tahapan} />
          <InfoRow label="Mesin" value={data.mesin} />
          <div className="grid grid-cols-2 gap-3">
            <InfoRow label="Qty Druk" value={formatInteger(data.qty_druk)} />
            <InfoRow label="Qty Pcs" value={formatInteger(data.qty_pcs)} />
          </div>
        </div>

        <div className="rounded-xl border border-[#D8EAFF] p-4">
          <label className="block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Ubah tanggal &amp; jam
            <input
              type="datetime-local"
              value={toLocalInput(data.tanggal)}
              onChange={(e) => handleDateChange(e.target.value)}
              className="mt-1 block h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium normal-case tracking-normal text-slate-800 focus:border-[#0065de] focus:outline-none focus:ring-2 focus:ring-[#0065de]/30"
            />
          </label>
          <button
            type="button"
            onClick={handleSimpan}
            disabled={isLoading}
            className="mt-2 h-9 w-full rounded-lg border border-[#0065de] text-sm font-semibold text-[#0065de] hover:bg-[#F0F7FF] disabled:opacity-50"
          >
            Pindahkan
          </button>
        </div>

        <div
          className={`rounded-xl p-4 text-xs ${
            isMoved
              ? 'bg-amber-50 text-amber-800 ring-1 ring-amber-200'
              : 'bg-slate-50 text-slate-500'
          }`}
        >
          {isMoved ? (
            <div className="space-y-1">
              <p className="font-semibold">Perubahan belum disimpan</p>
              <p className="tabular-nums">
                {convertTimeStampToDate(dataMap.tanggal)} ·{' '}
                {String(dataMap.jam).slice(0, 5)}
              </p>
              <p aria-hidden="true">↓</p>
              <p className="font-semibold tabular-nums">
                {convertTimeStampToDate(data.tanggal)} ·{' '}
                {String(data.jam).slice(0, 5)}
              </p>
            </div>
          ) : (
            <p>
              Drag kartu JO ke sel lain, atau klik sel kosong untuk memindahkan.
              Hanya jadwal pada mesin {data.mesin} yang ditampilkan.
            </p>
          )}
        </div>

        <div className="mt-auto flex flex-col gap-2 border-t border-[#D8EAFF] pt-3">
          <label className="flex h-9 cursor-pointer select-none items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 hover:bg-slate-50">
            <input
              type="checkbox"
              id="checkboxLabelTwo"
              checked={semuaTahap}
              onChange={() => setSemuaTahap((v) => !v)}
              className="accent-[#0065de]"
            />
            Tahap lain ikut berubah
          </label>
          <button
            type="button"
            onClick={putJadwalView}
            disabled={isLoading}
            className="h-10 rounded-lg bg-[#0065de] px-5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {isLoading ? 'Menyimpan…' : 'Simpan'}
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleReset}
              disabled={!isMoved || isLoading}
              className="h-9 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="h-9 rounded-lg bg-slate-100 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-50"
            >
              Batal
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default PopUpTable2;
