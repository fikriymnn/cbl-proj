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

interface JadwalItem {
  id: string;
  tanggal: string;
  jam: string;
  mesin?: string;
  no_jo?: string;
  item?: string;
  qty_druk?: number;
  qty_pcs?: number;
  is_lembur?: boolean;
  [key: string]: any;
}

interface PopUpTableProps {
  dataMap: JadwalItem | null;
  onClose: () => void;
  onFinish: () => void;
}

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

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

const generateDays = (start: Date, count: number) =>
  Array.from({ length: count }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });

const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

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
const PopUpTable = ({ dataMap, onClose, onFinish }: PopUpTableProps) => {
  const [data, setData] = useState<JadwalItem | null>(dataMap);
  const [startDate, setStartDate] = useState<Date>(
    () => new Date(dataMap?.tanggal ?? Date.now()),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [hoverCell, setHoverCell] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dataMap) return;
    setData(dataMap);
    setStartDate(new Date(dataMap.tanggal));
    setErrorMsg(null);
  }, [dataMap]);

  useEffect(() => {
    if (!dataMap?.jam) return;
    const t = window.setTimeout(() => {
      scrollRef.current
        ?.querySelector(`[data-hour="${dataMap.jam}"]`)
        ?.scrollIntoView({ block: 'center' });
    }, 60);
    return () => window.clearTimeout(t);
  }, [dataMap]);

  const daysList = useMemo(
    () => generateDays(startDate, DAYS_VISIBLE),
    [startDate],
  );
  const todayKey = useMemo(() => dayKey(new Date()), []);

  const originalKey = dataMap ? dayKey(new Date(dataMap.tanggal)) : '';
  const currentKey = data ? dayKey(new Date(data.tanggal)) : '';
  const isMoved =
    !!dataMap &&
    !!data &&
    (data.jam !== dataMap.jam || currentKey !== originalKey);

  /* ------------------------------ handlers ------------------------------ */

  const shiftDays = useCallback((delta: number) => {
    setStartDate((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + delta);
      return next;
    });
  }, []);

  const moveTo = useCallback((day: Date, jam: string) => {
    setData((prev) => {
      if (!prev) return prev;
      if (prev.jam === jam && dayKey(new Date(prev.tanggal)) === dayKey(day))
        return prev;
      return { ...prev, tanggal: day.toISOString(), jam };
    });
  }, []);

  const handleReset = useCallback(() => {
    if (!dataMap) return;
    setData(dataMap);
    setStartDate(new Date(dataMap.tanggal));
    setErrorMsg(null);
  }, [dataMap]);

  const handleDrop = (e: React.DragEvent, day: Date, jam: string) => {
    e.preventDefault();
    setDragging(false);
    setHoverCell(null);
    moveTo(day, jam);
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (!data) return;
    e.dataTransfer.setData('application/json', JSON.stringify(data));
    e.dataTransfer.effectAllowed = 'move';
    setDragging(true);
  };

  // Same endpoint and payload as before
  const putJadwalView = async () => {
    if (!data) return;
    const url = `${import.meta.env.VITE_API_LINK}/ppic/jadwalProduksi/${
      data.id
    }`;
    try {
      setIsLoading(true);
      setErrorMsg(null);
      await axios.put(url, { data_jadwal: data }, { withCredentials: true });
      setIsLoading(false);
      onClose();
      onFinish();
    } catch (error: any) {
      console.error('Error updating data:', error);
      setIsLoading(false);
      setErrorMsg(
        error?.response?.data?.message ||
          error?.response?.data?.msg ||
          'Gagal menyimpan jadwal. Silakan coba lagi.',
      );
    }
  };

  if (!data || !dataMap) return null;

  /* ------------------------------ render ------------------------------ */

  const rangeLabel = `${convertTimeStampToDate(
    daysList[0].toISOString(),
  )} - ${convertTimeStampToDate(daysList[DAYS_VISIBLE - 1].toISOString())}`;

  const navBtn =
    'h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50';

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
          <div className="min-w-[680px]">
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
                        onClick={() => !isCurrent && moveTo(day, hour)}
                        className={`flex min-h-[48px] min-w-0 items-center justify-center overflow-hidden border-r border-[#E3EEFB] p-1 last:border-r-0 ${tint} ${
                          isHover
                            ? 'bg-[#D8EAFF] ring-2 ring-inset ring-[#0065de]'
                            : ''
                        } ${
                          isCurrent ? '' : 'cursor-pointer hover:bg-[#E3F0FF]'
                        }`}
                      >
                        {isCurrent ? (
                          <div
                            draggable
                            onDragStart={handleDragStart}
                            onDragEnd={() => {
                              setDragging(false);
                              setHoverCell(null);
                            }}
                            title="Drag untuk memindahkan"
                            className={`w-full cursor-grab select-none rounded-md px-2 py-2 text-center text-[11px] font-semibold text-white shadow active:cursor-grabbing ${
                              isMoved ? 'bg-amber-500' : 'bg-[#0065de]'
                            }`}
                          >
                            {data.no_jo}
                          </div>
                        ) : isOrigin ? (
                          <div className="w-full rounded-md border border-dashed border-slate-400 px-2 py-2 text-center text-[10px] text-slate-500">
                            Posisi awal
                          </div>
                        ) : null}
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
          <InfoRow label="Mesin" value={data.mesin} />
          <div className="grid grid-cols-2 gap-3">
            <InfoRow label="Qty Druk" value={formatInteger(data.qty_druk)} />
            <InfoRow label="Qty Pcs" value={formatInteger(data.qty_pcs)} />
          </div>
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
                {dataMap.jam.slice(0, 5)}
              </p>
              <p aria-hidden="true">↓</p>
              <p className="font-semibold tabular-nums">
                {convertTimeStampToDate(data.tanggal)} · {data.jam.slice(0, 5)}
              </p>
            </div>
          ) : (
            <p>
              Drag kartu JO ke sel lain, atau klik sel kosong untuk memindahkan.
            </p>
          )}
        </div>

        {errorMsg && (
          <p
            role="alert"
            className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200"
          >
            {errorMsg}
          </p>
        )}

        <div className="mt-auto flex flex-col gap-2 border-t border-[#D8EAFF] pt-3">
          <button
            type="button"
            onClick={putJadwalView}
            disabled={!isMoved || isLoading}
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

export default PopUpTable;
