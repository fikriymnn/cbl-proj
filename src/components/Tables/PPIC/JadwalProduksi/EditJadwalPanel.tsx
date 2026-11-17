import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Availability,
  Mode,
  ParamBody,
  Pelanggaran,
  SimBody,
  SimResult,
  SimTahapan,
  Slot,
  TahapRef,
  Zona,
  applyChange,
  dateFromYmd,
  errMsg,
  floorHour,
  fmtGeser,
  fmtRange,
  fmtWaktu,
  getAvailability,
  isoToApi,
  simulate,
  suggestSlot,
  ymd,
} from './JadwalApi';

/* ------------------------------------------------------------------ */
/* Constants & small helpers                                           */
/* ------------------------------------------------------------------ */

type Tab = 'geser' | 'parameter';

const DAYS = 7;
const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const HOURS = Array.from(
  { length: 24 },
  (_, i) => `${String(i).padStart(2, '0')}:00`,
);
const GRID_STYLE = {
  gridTemplateColumns: `64px repeat(${DAYS}, minmax(0, 1fr))`,
} as const;

const plusDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

const STATUS_CLASS: Record<string, string> = {
  kosong: 'bg-white',
  lembur: 'bg-amber-50',
  di_luar_shift: 'bg-slate-100',
  terisi: 'bg-slate-300',
  terisi_draft: 'bg-slate-200',
  milik_tiket_ini: 'bg-blue-100',
};
const ZONA_DOT: Record<string, string> = {
  hijau: 'bg-emerald-500',
  kuning: 'bg-amber-400',
  merah: 'bg-rose-500',
};
const ZONA_TINT: Record<string, string> = {
  hijau: 'bg-emerald-50',
  kuning: 'bg-amber-50',
  merah: 'bg-rose-50',
};
const HATCH = {
  backgroundImage:
    'repeating-linear-gradient(45deg, rgba(148,163,184,.35) 0 4px, transparent 4px 8px)',
} as const;

function Badge({
  children,
  tone = 'slate',
}: {
  children: React.ReactNode;
  tone?: 'slate' | 'blue' | 'amber' | 'rose' | 'emerald';
}) {
  const t = {
    slate: 'bg-slate-100 text-slate-600',
    blue: 'bg-blue-50 text-[#0065de]',
    amber: 'bg-amber-100 text-amber-800',
    rose: 'bg-rose-100 text-rose-700',
    emerald: 'bg-emerald-100 text-emerald-700',
  }[tone];
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold ${t}`}
    >
      {children}
    </span>
  );
}

function Seg<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="inline-flex w-full rounded-lg bg-slate-100 p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`h-8 flex-1 rounded-md px-3 text-xs font-semibold transition ${
            value === o.value
              ? 'bg-white text-[#0065de] shadow-sm'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function RuleList({
  items,
  tone,
}: {
  items: Pelanggaran[];
  tone: 'rose' | 'amber';
}) {
  if (items.length === 0) return null;
  const box =
    tone === 'rose'
      ? 'bg-rose-50 text-rose-800 ring-rose-200'
      : 'bg-amber-50 text-amber-800 ring-amber-200';
  return (
    <ul className={`space-y-1 rounded-lg p-3 text-xs ring-1 ${box}`}>
      {items.map((c, i) => (
        <li key={`${c.rule}-${i}`} className="flex gap-2">
          <span className="mt-px shrink-0 rounded bg-white/70 px-1 text-[10px] font-bold">
            {c.rule}
          </span>
          <span>{c.msg}</span>
        </li>
      ))}
    </ul>
  );
}

function PreviewRow({
  row,
  disabled,
  onToggle,
}: {
  row: SimTahapan;
  disabled: boolean;
  onToggle: (row: SimTahapan, checked: boolean) => void;
}) {
  const changed =
    row.baru.mulai !== row.lama.mulai || row.baru.selesai !== row.lama.selesai;
  const fg = !!row.is_fg || row.tahapan.toUpperCase() === 'FG';
  const showCheck = row.peran !== 'diubah' && !fg;
  const hasDryingBaru =
    row.baru.drying_selesai &&
    row.baru.drying_selesai !== row.baru.drying_mulai;

  return (
    <div
      className={`flex gap-2 border-b border-[#E3EEFB] px-3 py-2 last:border-0 ${
        row.peran === 'diubah'
          ? 'bg-[#F0F7FF]'
          : row.peran === 'tetap' && !changed
          ? 'opacity-70'
          : ''
      }`}
    >
      <div className="w-5 shrink-0 pt-0.5">
        {showCheck && (
          <input
            type="checkbox"
            checked={!!row.dicentang}
            disabled={disabled || !row.bisa_dicentang}
            onChange={(e) => onToggle(row, e.target.checked)}
            aria-label={`Ikutkan ${row.tahapan}`}
            className="accent-[#0065de]"
            title={
              row.bisa_dicentang
                ? undefined
                : 'Tidak bersebelahan dengan rangkaian yang bergeser'
            }
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[13px] font-semibold text-slate-800">
            {row.tahapan}
          </span>
          {row.peran === 'diubah' && <Badge tone="blue">Diubah</Badge>}
          {row.wajib_ikut && <Badge tone="amber">Wajib</Badge>}
          {row.peran === 'ikut' && !row.wajib_ikut && (
            <Badge tone="slate">Ikut</Badge>
          )}
          {row.grup_tgl != null && (
            <Badge tone="slate">Grup {row.grup_tgl}</Badge>
          )}
          {fg && <Badge tone="emerald">FG</Badge>}
          {row.mesin && (
            <span className="text-[11px] text-slate-500">{row.mesin}</span>
          )}
        </div>
        <div className="mt-0.5 text-[11px] tabular-nums text-slate-500">
          Lama: {fmtRange(row.lama.mulai, row.lama.selesai)}
        </div>
        <div
          className={`text-[11px] tabular-nums ${
            changed ? 'font-semibold text-[#0065de]' : 'text-slate-500'
          }`}
        >
          Baru: {fmtRange(row.baru.mulai, row.baru.selesai)}
          {changed && row.geser_jam !== undefined && (
            <span className="ml-1 font-normal text-slate-500">
              ({fmtGeser(row.geser_jam)})
            </span>
          )}
        </div>
        {hasDryingBaru && (
          <div className="text-[11px] tabular-nums text-slate-500">
            Drying: {fmtRange(row.baru.drying_mulai, row.baru.drying_selesai)}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

interface Props {
  tahap: TahapRef;
  /** 'cari' = langsung jalankan "Cari jam kosong terdekat" saat dibuka */
  initial?: 'geser' | 'parameter' | 'cari';
  onClose: () => void;
  onSaved: () => void;
}

/**
 * Ubah jadwal satu tahapan: geser (drag / klik sel / input) atau ubah
 * kapasitas & drying. Alur: availability -> simulate -> (ceklis) -> apply.
 * Render di dalam <AppModal size="screen" flush>.
 */
export default function EditJadwalPanel({
  tahap,
  initial = 'geser',
  onClose,
  onSaved,
}: Props) {
  const lamaStart = floorHour(isoToApi(tahap.produksi_mulai));
  const isTgl = tahap.from === 'tgl';

  const [tab, setTab] = useState<Tab>(
    initial === 'parameter' ? 'parameter' : 'geser',
  );
  const [newStart, setNewStart] = useState<string | null>(null);
  const [kap, setKap] = useState('');
  const [dry, setDry] = useState('');
  const [mode, setMode] = useState<Mode>('mulai_tetap');
  const [isLembur, setIsLembur] = useState(false);

  const [preview, setPreview] = useState<SimResult | null>(null);
  const [simLoading, setSimLoading] = useState(false);
  const [simError, setSimError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [suggesting, setSuggesting] = useState(false);

  const [alasan, setAlasan] = useState('');
  const [saving, setSaving] = useState(false);

  const [winStart, setWinStart] = useState<Date>(() =>
    dateFromYmd(lamaStart ? lamaStart.slice(0, 10) : ymd(new Date())),
  );
  const [avail, setAvail] = useState<Availability | null>(null);
  const [availLoading, setAvailLoading] = useState(false);
  const [availError, setAvailError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [hoverCell, setHoverCell] = useState<string | null>(null);

  const cache = useRef(new Map<string, Availability>());
  const simReq = useRef(0);
  const lastBody = useRef<SimBody | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const daysList = useMemo(
    () => Array.from({ length: DAYS }, (_, i) => plusDays(winStart, i)),
    [winStart],
  );
  const todayKey = useMemo(() => ymd(new Date()), []);

  /* ------------------------- availability ------------------------- */

  useEffect(() => {
    if (isTgl || !lamaStart) return;
    const from = `${ymd(winStart)} 00:00`;
    const to = `${ymd(plusDays(winStart, DAYS))} 00:00`;
    const key = `${from}|${to}|${isLembur ? 1 : 0}`;
    const cached = cache.current.get(key);
    if (cached) {
      setAvail(cached);
      setAvailError(null);
      return;
    }
    let alive = true;
    setAvailLoading(true);
    setAvailError(null);
    getAvailability(tahap.id, {
      from,
      to,
      ...(isLembur ? { is_lembur: true } : {}),
    })
      .then((d) => {
        if (!alive) return;
        cache.current.set(key, d);
        setAvail(d);
      })
      .catch((e) => {
        if (alive) setAvailError(errMsg(e, 'Gagal memuat ketersediaan mesin'));
      })
      .finally(() => {
        if (alive) setAvailLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [winStart, isLembur, reloadKey, tahap.id, isTgl, lamaStart]);

  const slotMap = useMemo(() => {
    const m = new Map<string, Slot>();
    avail?.slots.forEach((s) => m.set(s.waktu, s));
    return m;
  }, [avail]);

  /* --------------------------- simulate --------------------------- */

  const runSim = useCallback(
    async (body: SimBody) => {
      const id = ++simReq.current;
      setSimLoading(true);
      setSimError(null);
      try {
        const r = await simulate(tahap.id, body);
        if (id === simReq.current) setPreview(r);
      } catch (e) {
        if (id === simReq.current) {
          setPreview(null);
          setSimError(errMsg(e, 'Simulasi gagal'));
        }
      } finally {
        if (id === simReq.current) setSimLoading(false);
      }
    },
    [tahap.id],
  );

  // Body simulate dari input saat ini (tanpa `ikut`: backend mencentang yang wajib).
  const built = useMemo<{ body: SimBody | null; error?: string }>(() => {
    const lem = isLembur ? { is_lembur: true } : {};
    if (tab === 'geser') {
      return newStart
        ? { body: { jenis: 'geser', new_start: newStart, ...lem } }
        : { body: null };
    }
    const b: ParamBody = { jenis: 'ubah_parameter', mode, ...lem };
    let changed = false;
    if (!isTgl && kap.trim() !== '') {
      const v = Number(kap);
      if (!(v > 0))
        return {
          body: null,
          error: 'Kapasitas per jam harus angka lebih dari 0',
        };
      if (v !== tahap.kapasitas_per_jam) {
        b.kapasitas_per_jam = v;
        changed = true;
      }
    }
    if (dry.trim() !== '') {
      const v = Number(dry);
      if (!Number.isInteger(v) || v < 0)
        return { body: null, error: 'Drying time harus bilangan bulat ≥ 0' };
      if (v !== tahap.drying_time) {
        b.drying_time = v;
        changed = true;
      }
    }
    return changed ? { body: b } : { body: null };
  }, [
    tab,
    newStart,
    kap,
    dry,
    mode,
    isLembur,
    isTgl,
    tahap.kapasitas_per_jam,
    tahap.drying_time,
  ]);

  useEffect(() => {
    lastBody.current = built.body;
    setSimError(built.error ?? null);
    if (!built.body) {
      simReq.current++;
      setPreview(null);
      setSimLoading(false);
      return;
    }
    const body = built.body;
    const t = window.setTimeout(
      () => runSim(body),
      tab === 'parameter' ? 400 : 0,
    );
    return () => window.clearTimeout(t);
  }, [built, tab, runSim]);

  const toggle = (row: SimTahapan, checked: boolean) => {
    if (!preview || !lastBody.current) return;
    const ids = new Set(
      preview.tahapan.filter((r) => r.dicentang).map((r) => r.id),
    );
    // Grup tgl: semua anggota satu grup berbagi status ceklis
    const targets =
      row.grup_tgl != null
        ? preview.tahapan.filter((r) => r.grup_tgl === row.grup_tgl)
        : [row];
    targets.forEach((r) => (checked ? ids.add(r.id) : ids.delete(r.id)));
    runSim({ ...lastBody.current, ikut: [...ids] });
  };

  /* ----------------------------- derived ----------------------------- */

  const diubah = preview?.tahapan.find((r) => r.peran === 'diubah');
  const markerStart =
    floorHour(diubah?.baru.mulai ?? '') || newStart || lamaStart;
  const moved = !!markerStart && markerStart !== lamaStart;
  const ghost = useMemo(
    () => new Set((diubah?.slots_baru ?? []).map(floorHour)),
    [diubah],
  );
  const tglKirim = preview?.tgl_kirim ?? avail?.tgl_kirim;
  const tglFg = preview?.tgl_target_fg ?? avail?.tgl_target_fg;

  const goToDate = useCallback(
    (w: string) => {
      const d = dateFromYmd(w);
      const end = plusDays(winStart, DAYS);
      if (d < winStart || d >= end) setWinStart(d);
    },
    [winStart],
  );

  const pickStart = (day: Date, hour: string) => {
    if (tab !== 'geser') return;
    const w = `${ymd(day)} ${hour}`;
    const s = slotMap.get(w);
    if (!s || s.zona === null) return; // bukan jam kerja / belum dimuat
    setNote(null);
    setNewStart(w);
  };

  const handleSuggest = async () => {
    setSuggesting(true);
    setSimError(null);
    setNote(null);
    try {
      const r = await suggestSlot(tahap.id, {
        around: markerStart || lamaStart,
        ...(isLembur ? { is_lembur: true } : {}),
      });
      setTab('geser');
      setNewStart(r.new_start);
      setNote(`Jam kosong terdekat: ${fmtWaktu(r.new_start)}`);
      goToDate(r.new_start.slice(0, 10));
    } catch (e) {
      setSimError(errMsg(e, 'Tidak ditemukan jam mulai yang valid'));
    } finally {
      setSuggesting(false);
    }
  };

  useEffect(() => {
    if (initial === 'cari') handleSuggest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!lamaStart) return;
    const t = window.setTimeout(() => {
      scrollRef.current
        ?.querySelector(`[data-hour="${lamaStart.slice(11, 16)}"]`)
        ?.scrollIntoView({ block: 'center' });
    }, 80);
    return () => window.clearTimeout(t);
  }, [lamaStart]);

  const handleSave = async () => {
    if (!preview || !lastBody.current) return;
    if (!alasan.trim()) return;
    const ikut = preview.tahapan.filter((t) => t.dicentang).map((t) => t.id);
    setSaving(true);
    setSimError(null);
    try {
      const res = await applyChange(tahap.id, {
        ...lastBody.current,
        ikut,
        alasan: alasan.trim(),
      });
      if (res.ok) {
        onSaved();
      } else {
        // 409: tampilkan konflik, muat ulang ketersediaan, panel tetap terbuka
        setPreview(res.result);
        setSimError(res.result.msg ?? 'Perubahan jadwal tidak valid');
        cache.current.clear();
        setReloadKey((k) => k + 1);
      }
    } catch (e) {
      setSimError(errMsg(e, 'Gagal menyimpan perubahan jadwal'));
    } finally {
      setSaving(false);
    }
  };

  const canSave =
    !!preview && preview.valid && !!alasan.trim() && !saving && !simLoading;

  const navBtn =
    'h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50';
  const rangeLabel = `${fmtWaktu(ymd(daysList[0]))} – ${fmtWaktu(
    ymd(daysList[DAYS - 1]),
  )}`;

  /* ------------------------------ render ------------------------------ */

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-y-auto lg:flex-row lg:overflow-hidden">
      {/* ---------------- Left: ketersediaan mesin ---------------- */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              className={navBtn}
              onClick={() => setWinStart((d) => plusDays(d, -7))}
            >
              « 7 hari
            </button>
            <button
              type="button"
              className={navBtn}
              onClick={() => setWinStart((d) => plusDays(d, -1))}
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
              onClick={() => setWinStart((d) => plusDays(d, 1))}
            >
              1 hari ›
            </button>
            <button
              type="button"
              className={navBtn}
              onClick={() => setWinStart((d) => plusDays(d, 7))}
            >
              7 hari »
            </button>
          </div>
          <button
            type="button"
            onClick={() => goToDate(markerStart.slice(0, 10))}
            className="ml-auto h-9 rounded-lg bg-[#D8EAFF] px-3 text-xs font-semibold text-[#0065de] hover:opacity-90"
          >
            Ke jam mulai
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-600">
          <span className="font-semibold text-slate-700">Jam mesin:</span>
          <Swatch className="border border-slate-300 bg-white" label="Kosong" />
          <Swatch
            className="bg-amber-50 border border-amber-200"
            label="Lembur"
          />
          <Swatch className="bg-slate-300" label="Dipakai JO lain" />
          <Swatch className="bg-slate-200" label="Draft tiket lain" />
          <Swatch
            className="bg-blue-100 border border-blue-300"
            label="Tiket ini"
          />
          <Swatch
            className="border border-slate-300 bg-slate-100"
            style={HATCH}
            label="Di luar shift"
          />
          <span className="ml-2 font-semibold text-slate-700">
            Jika mulai di sini:
          </span>
          <Dot className="bg-emerald-500" label="Valid" />
          <Dot className="bg-amber-400" label="Ada yang ikut bergeser" />
          <Dot className="bg-rose-500" label="Tidak valid" />
        </div>

        <div
          ref={scrollRef}
          className="relative min-h-[360px] flex-1 overflow-auto rounded-xl border border-[#D8EAFF] bg-white"
        >
          {isTgl ? (
            <div className="grid h-full place-items-center p-8 text-center">
              <div className="max-w-sm">
                <p className="text-sm font-semibold text-slate-700">
                  Tahapan berbasis tanggal
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {tahap.tahapan} tidak memakai jam mesin, jadi tidak ada grid
                  ketersediaan. Pilih tanggal mulai baru lewat input di sebelah
                  kanan.
                </p>
              </div>
            </div>
          ) : (
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
                  const k = ymd(day);
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
                          k === todayKey
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

              {availError && (
                <p className="m-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">
                  {availError}
                </p>
              )}

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
                      {hour}
                    </div>

                    {daysList.map((day) => {
                      const k = ymd(day);
                      const w = `${k} ${hour}`;
                      const slot = slotMap.get(w);
                      const isMarker = markerStart === w;
                      const isOrigin = moved && lamaStart === w;
                      const isGhost = ghost.has(w) && !isMarker;
                      const status = slot?.status;
                      const zona: Zona = slot?.zona ?? null;
                      const free =
                        status === 'kosong' ||
                        status === 'lembur' ||
                        status === 'milik_tiket_ini';
                      const bg =
                        free && zona
                          ? ZONA_TINT[zona]
                          : status
                          ? STATUS_CLASS[status]
                          : '';
                      const off = status === 'di_luar_shift';
                      const canPick =
                        tab === 'geser' && !!slot && slot.zona !== null;
                      const isHover = dragging && hoverCell === w;
                      const taken =
                        status === 'terisi' || status === 'terisi_draft';

                      return (
                        <div
                          key={w}
                          title={
                            taken
                              ? `${
                                  slot?.no_jo ?? slot?.no_booking ?? 'JO lain'
                                } · ${slot?.tahapan ?? ''}`
                              : undefined
                          }
                          onDragOver={(e) => {
                            if (!canPick) return;
                            e.preventDefault();
                            if (hoverCell !== w) setHoverCell(w);
                          }}
                          onDragLeave={() =>
                            setHoverCell((c) => (c === w ? null : c))
                          }
                          onDrop={(e) => {
                            e.preventDefault();
                            setDragging(false);
                            setHoverCell(null);
                            pickStart(day, hour);
                          }}
                          onClick={() => !isMarker && pickStart(day, hour)}
                          style={off ? HATCH : undefined}
                          className={`relative flex min-h-[38px] min-w-0 items-center justify-center overflow-hidden border-r border-[#E3EEFB] p-1 last:border-r-0 ${bg} ${
                            isHover ? 'ring-2 ring-inset ring-[#0065de]' : ''
                          } ${
                            canPick && !isMarker
                              ? 'cursor-pointer hover:brightness-95'
                              : ''
                          }`}
                        >
                          {zona && !isMarker && (
                            <i
                              className={`absolute right-1 top-1 h-1.5 w-1.5 rounded-full ${ZONA_DOT[zona]}`}
                            />
                          )}

                          {isMarker ? (
                            <div
                              draggable={tab === 'geser'}
                              onDragStart={(e) => {
                                e.dataTransfer.setData('text/plain', w);
                                e.dataTransfer.effectAllowed = 'move';
                                setDragging(true);
                              }}
                              onDragEnd={() => {
                                setDragging(false);
                                setHoverCell(null);
                              }}
                              title={
                                tab === 'geser'
                                  ? 'Drag untuk memindahkan jam mulai'
                                  : undefined
                              }
                              className={`w-full select-none rounded-md px-2 py-1.5 text-center text-white shadow ${
                                moved ? 'bg-amber-500' : 'bg-[#0065de]'
                              } ${
                                tab === 'geser'
                                  ? 'cursor-grab active:cursor-grabbing'
                                  : ''
                              }`}
                            >
                              <div className="truncate text-[11px] font-bold">
                                {tahap.tahapan}
                              </div>
                              <div className="text-[10px] opacity-90">
                                mulai {w.slice(11, 16)}
                              </div>
                            </div>
                          ) : isOrigin ? (
                            <div className="w-full rounded-md border border-dashed border-slate-400 bg-white/60 px-1 py-1 text-center text-[10px] text-slate-500">
                              Posisi awal
                            </div>
                          ) : isGhost ? (
                            <div className="h-full min-h-[24px] w-full rounded bg-[#0065de]/25" />
                          ) : taken ? (
                            <span className="w-full truncate text-center text-[10px] font-medium text-slate-700">
                              {slot?.no_jo ?? slot?.no_booking ?? 'JO lain'}
                            </span>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
          {availLoading && (
            <div className="pointer-events-none absolute inset-x-0 top-12 z-30 flex justify-center">
              <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-[#0065de] shadow ring-1 ring-[#D8EAFF]">
                Memuat ketersediaan mesin…
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ---------------- Right: input, preview, simpan ---------------- */}
      <aside className="flex min-h-0 w-full shrink-0 flex-col lg:w-[440px]">
        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
          {/* Info tahapan */}
          <div className="space-y-2 rounded-xl bg-[#F0F7FF] p-4">
            <div className="flex flex-wrap items-center gap-1.5">
              <p className="text-sm font-bold text-slate-900">
                {tahap.tahapan}
              </p>
              {tahap.is_diubah_manual && (
                <Badge tone="amber">Diubah manual</Badge>
              )}
              <span className="text-xs text-slate-500">{tahap.mesin}</span>
            </div>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
              <Info
                label="Produksi"
                value={fmtRange(
                  isoToApi(tahap.produksi_mulai),
                  isoToApi(tahap.produksi_selesai),
                )}
              />
              <Info
                label="Drying"
                value={fmtRange(
                  isoToApi(tahap.drying_mulai),
                  isoToApi(tahap.drying_selesai),
                )}
              />
              {!isTgl && (
                <Info
                  label="Kapasitas / jam"
                  value={tahap.kapasitas_per_jam ?? '-'}
                />
              )}
              <Info
                label="Drying time"
                value={`${tahap.drying_time ?? 0} jam`}
              />
              <Info label="Target FG" value={fmtWaktu(tglFg)} />
              <Info label="Tanggal kirim" value={fmtWaktu(tglKirim)} />
            </dl>
          </div>

          <Seg<Tab>
            value={tab}
            onChange={(v) => {
              setTab(v);
              setNote(null);
            }}
            options={[
              { value: 'geser', label: 'Geser jadwal' },
              { value: 'parameter', label: 'Kapasitas / drying' },
            ]}
          />

          {tab === 'geser' ? (
            <div className="space-y-2 rounded-xl border border-[#D8EAFF] p-4">
              <label className="block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Jam mulai baru
                <input
                  type="datetime-local"
                  step={3600}
                  value={markerStart ? markerStart.replace(' ', 'T') : ''}
                  onChange={(e) => {
                    if (!e.target.value) return;
                    const w = `${e.target.value.slice(
                      0,
                      10,
                    )} ${e.target.value.slice(11, 13)}:00`;
                    setNote(null);
                    setNewStart(w);
                    goToDate(w.slice(0, 10));
                  }}
                  className="mt-1 block h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium normal-case tracking-normal text-slate-800 focus:border-[#0065de] focus:outline-none focus:ring-2 focus:ring-[#0065de]/30"
                />
              </label>
              <p className="text-[11px] text-slate-500">
                {isTgl
                  ? 'Pilih tanggal & jam mulai. Jam dibulatkan ke jam penuh.'
                  : 'Drag kartu tahapan ke sel lain, klik sel, atau isi jam di atas. Bukan jam kerja? Tahapan mulai di jam kerja berikutnya.'}
              </p>
              <button
                type="button"
                onClick={handleSuggest}
                disabled={suggesting}
                className="h-9 w-full rounded-lg border border-[#0065de] text-sm font-semibold text-[#0065de] hover:bg-[#F0F7FF] disabled:opacity-50"
              >
                {suggesting ? 'Mencari…' : 'Cari jam kosong terdekat'}
              </button>
              {note && (
                <p className="rounded-md bg-emerald-50 px-2 py-1 text-xs text-emerald-700">
                  {note}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3 rounded-xl border border-[#D8EAFF] p-4">
              {!isTgl && (
                <label className="block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Kapasitas per jam{' '}
                  <span className="normal-case tracking-normal text-slate-400">
                    (sekarang {tahap.kapasitas_per_jam ?? '-'})
                  </span>
                  <input
                    type="number"
                    min={0}
                    inputMode="decimal"
                    value={kap}
                    onChange={(e) => setKap(e.target.value)}
                    placeholder={String(tahap.kapasitas_per_jam ?? '')}
                    className="mt-1 block h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 focus:border-[#0065de] focus:outline-none focus:ring-2 focus:ring-[#0065de]/30"
                  />
                </label>
              )}
              <label className="block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Drying time (jam){' '}
                <span className="normal-case tracking-normal text-slate-400">
                  (sekarang {tahap.drying_time ?? 0})
                </span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  value={dry}
                  onChange={(e) => setDry(e.target.value)}
                  placeholder={String(tahap.drying_time ?? 0)}
                  className="mt-1 block h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 focus:border-[#0065de] focus:outline-none focus:ring-2 focus:ring-[#0065de]/30"
                />
              </label>
              {isTgl && (
                <p className="text-[11px] text-slate-500">
                  Tahapan tanggal tidak punya kapasitas, hanya drying time yang
                  bisa diubah.
                </p>
              )}

              <fieldset className="space-y-1.5">
                <legend className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Mode
                </legend>
                <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-slate-200 p-2 text-xs hover:bg-slate-50">
                  <input
                    type="radio"
                    name="mode"
                    checked={mode === 'mulai_tetap'}
                    onChange={() => setMode('mulai_tetap')}
                    className="mt-0.5 accent-[#0065de]"
                  />
                  <span>
                    <b className="text-slate-800">A. Jam mulai tetap</b>
                    <br />
                    <span className="text-slate-500">
                      Tahapan sesudahnya ikut mundur kalau perlu.
                    </span>
                  </span>
                </label>
                <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-slate-200 p-2 text-xs hover:bg-slate-50">
                  <input
                    type="radio"
                    name="mode"
                    checked={mode === 'selesai_tetap'}
                    onChange={() => setMode('selesai_tetap')}
                    className="mt-0.5 accent-[#0065de]"
                  />
                  <span>
                    <b className="text-slate-800">B. Jam selesai tetap</b>
                    <br />
                    <span className="text-slate-500">
                      Tahapan ini dan tahapan sebelumnya maju kalau perlu.
                    </span>
                  </span>
                </label>
              </fieldset>
              <p className="text-[11px] text-slate-500">
                Nilai baru hanya berlaku untuk tiket ini. Master dan IO tidak
                berubah.
              </p>
            </div>
          )}

          <label className="flex h-9 cursor-pointer select-none items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-700 hover:bg-slate-50">
            <input
              type="checkbox"
              checked={isLembur}
              onChange={(e) => {
                setIsLembur(e.target.checked);
              }}
              className="accent-[#0065de]"
            />
            Anggap semua tanggal sebagai lembur
          </label>

          {/* Preview */}
          <div className="rounded-xl border border-[#D8EAFF]">
            <div className="flex items-center justify-between border-b border-[#D8EAFF] bg-[#eaf4ff] px-3 py-2">
              <h5 className="text-xs font-semibold uppercase tracking-wide text-[#0065de]">
                Preview perubahan
              </h5>
              {simLoading && (
                <span className="text-[11px] text-slate-500">Menghitung…</span>
              )}
              {!simLoading && preview && (
                <Badge tone={preview.valid ? 'emerald' : 'rose'}>
                  {preview.valid ? 'Valid' : 'Tidak valid'}
                </Badge>
              )}
            </div>

            {!preview && !simLoading && (
              <p className="px-3 py-6 text-center text-xs text-slate-500">
                {tab === 'geser'
                  ? 'Pilih jam mulai baru untuk melihat preview.'
                  : 'Ubah kapasitas atau drying time untuk melihat preview.'}
              </p>
            )}

            {preview && (
              <div className={simLoading ? 'opacity-60' : ''}>
                {preview.parameter && (
                  <div className="grid grid-cols-3 gap-2 border-b border-[#E3EEFB] px-3 py-2 text-[11px]">
                    <Param
                      label="Kapasitas / jam"
                      lama={preview.parameter.kapasitas_per_jam.lama}
                      baru={preview.parameter.kapasitas_per_jam.baru}
                    />
                    <Param
                      label="Drying (jam)"
                      lama={preview.parameter.drying_time.lama}
                      baru={preview.parameter.drying_time.baru}
                    />
                    <Param
                      label="Durasi (jam)"
                      lama={preview.parameter.durasi_jam.lama}
                      baru={preview.parameter.durasi_jam.baru}
                    />
                  </div>
                )}
                {preview.tahapan.map((r) => (
                  <PreviewRow
                    key={r.id}
                    row={r}
                    disabled={simLoading || saving}
                    onToggle={toggle}
                  />
                ))}
              </div>
            )}
          </div>

          {simError && (
            <p
              role="alert"
              className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200"
            >
              {simError}
            </p>
          )}
          {preview && (
            <>
              <RuleList items={preview.conflicts} tone="rose" />
              <RuleList items={preview.warnings} tone="amber" />
            </>
          )}
        </div>

        {/* Aksi */}
        <div className="mt-2 space-y-2 border-t border-[#D8EAFF] pt-3">
          <label className="block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Alasan perubahan <span className="text-rose-500">*</span>
            <input
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              placeholder="Contoh: R700 dipakai JO-0012"
              className="mt-1 block h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-normal normal-case tracking-normal text-slate-800 focus:border-[#0065de] focus:outline-none focus:ring-2 focus:ring-[#0065de]/30"
            />
          </label>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave}
              title={
                !preview
                  ? 'Buat simulasi terlebih dahulu'
                  : !preview.valid
                  ? 'Perubahan tidak valid, selesaikan konflik terlebih dahulu'
                  : !alasan.trim()
                  ? 'Alasan wajib diisi'
                  : undefined
              }
              className="h-10 rounded-lg bg-[#0065de] px-5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              {saving ? 'Menyimpan…' : 'Simpan perubahan'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="h-10 rounded-lg bg-slate-100 px-4 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-50"
            >
              Batal
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tiny presentational helpers                                         */
/* ------------------------------------------------------------------ */

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="break-words font-semibold text-[#0065de]">
        {value === '' || value === undefined || value === null ? '-' : value}
      </dd>
    </div>
  );
}

function Param({
  label,
  lama,
  baru,
}: {
  label: string;
  lama: number;
  baru: number;
}) {
  const changed = lama !== baru;
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="tabular-nums text-slate-500">{lama}</p>
      <p
        className={`tabular-nums ${
          changed ? 'font-semibold text-[#0065de]' : 'text-slate-500'
        }`}
      >
        → {baru}
      </p>
    </div>
  );
}

function Swatch({
  className,
  label,
  style,
}: {
  className: string;
  label: string;
  style?: React.CSSProperties;
}) {
  return (
    <span className="inline-flex items-center gap-1">
      <i className={`h-3 w-3 rounded-sm ${className}`} style={style} />
      {label}
    </span>
  );
}

function Dot({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <i className={`h-2 w-2 rounded-full ${className}`} />
      {label}
    </span>
  );
}
