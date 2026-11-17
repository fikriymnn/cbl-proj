import React, { useMemo } from 'react';
import {
  DAY_MS,
  Pelanggaran,
  TahapRef,
  fmtRange,
  fmtWaktu,
  isoToApi,
  parseWaktu,
} from './JadwalApi';

interface Props {
  tahap: TahapRef[];
  /** "YYYY-MM-DD" */
  tglKirim?: string;
  /** "YYYY-MM-DD" */
  tglTargetFg?: string;
  conflicts: Pelanggaran[];
  canEdit: boolean;
  onSelect: (t: TahapRef) => void;
}

const DAY_W = 112;
const LABEL_W = 170;
const ROW_H = 44;
const HEAD_H = 44;
const MAX_DAYS = 120;
const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const floorDay = (ms: number) => Math.floor(ms / DAY_MS) * DAY_MS;
const isFG = (t: TahapRef) => t.tahapan.toUpperCase() === 'FG';

/** Timeline per tahapan: produksi, drying, spare, target FG, tanggal kirim, bentrok. */
export default function TimelineTiket({
  tahap,
  tglKirim,
  tglTargetFg,
  conflicts,
  canEdit,
  onSelect,
}: Props) {
  const model = useMemo(() => {
    const rows = tahap.map((t) => {
      const mulai = parseWaktu(isoToApi(t.produksi_mulai));
      const selesai = parseWaktu(isoToApi(t.produksi_selesai));
      const dMulai = parseWaktu(isoToApi(t.drying_mulai));
      const dSelesai = parseWaktu(isoToApi(t.drying_selesai));
      return { t, mulai, selesai, dMulai, dSelesai };
    });

    const kirim = tglKirim ? parseWaktu(tglKirim) : NaN;
    const fg = tglTargetFg ? parseWaktu(tglTargetFg) : NaN;

    const starts = rows.map((r) => r.mulai).filter((n) => !isNaN(n));
    if (starts.length === 0) return null;

    const ends = [
      ...rows.map((r) => r.dSelesai),
      ...rows.map((r) => r.selesai),
    ].filter((n) => !isNaN(n));
    if (!isNaN(kirim)) ends.push(kirim + DAY_MS);
    if (!isNaN(fg)) ends.push(fg + DAY_MS);

    const start = floorDay(Math.min(...starts));
    const end = Math.min(
      floorDay(Math.max(...ends)) + DAY_MS,
      start + MAX_DAYS * DAY_MS,
    );
    const days = Math.max(1, Math.round((end - start) / DAY_MS));
    return { rows, start, days, kirim, fg };
  }, [tahap, tglKirim, tglTargetFg]);

  const conflictByTahapan = useMemo(() => {
    const m = new Map<number, string[]>();
    conflicts.forEach((c) => {
      if (c.id_tahapan === undefined || typeof c.waktu !== 'string') return;
      const arr = m.get(c.id_tahapan) ?? [];
      arr.push(c.waktu);
      m.set(c.id_tahapan, arr);
    });
    return m;
  }, [conflicts]);

  if (!model) {
    return (
      <p className="rounded-xl border border-[#D8EAFF] py-10 text-center text-sm text-slate-500">
        Belum ada data waktu produksi untuk digambar. Calculate ulang tiket ini
        jika baru memakai versi lama.
      </p>
    );
  }

  const { rows, start, days, kirim, fg } = model;
  const W = days * DAY_W;
  const x = (ms: number) => ((ms - start) / DAY_MS) * DAY_W;
  const hourW = DAY_W / 24;

  const dayCells = Array.from({ length: days }, (_, i) => {
    const d = new Date(start + i * DAY_MS);
    return {
      key: i,
      name: DAY_NAMES[d.getUTCDay()],
      label: `${d.getUTCDate()}/${d.getUTCMonth() + 1}`,
      weekend: d.getUTCDay() === 0 || d.getUTCDay() === 6,
    };
  });

  const laneBg = {
    backgroundImage: `repeating-linear-gradient(to right, #E3EEFB 0, #E3EEFB 1px, transparent 1px, transparent ${DAY_W}px)`,
  } as const;

  const spareLeft = !isNaN(fg) ? x(fg) : NaN;
  const spareRight = !isNaN(kirim) ? x(kirim + DAY_MS) : NaN;

  return (
    <div>
      <div
        className="max-h-[420px] overflow-auto rounded-xl border border-[#D8EAFF] bg-white"
        role="table"
        aria-label="Timeline tahapan"
      >
        <div style={{ width: LABEL_W + W }}>
          {/* Header */}
          <div
            className="sticky top-0 z-20 flex border-b border-[#D8EAFF] bg-[#eaf4ff]"
            style={{ height: HEAD_H }}
          >
            <div
              className="sticky left-0 z-30 grid shrink-0 place-items-center border-r border-[#D8EAFF] bg-[#eaf4ff] text-[11px] font-semibold text-[#0065de]"
              style={{ width: LABEL_W }}
            >
              Tahapan
            </div>
            {dayCells.map((d) => (
              <div
                key={d.key}
                className={`flex shrink-0 flex-col items-center justify-center border-r border-[#D8EAFF] ${
                  d.weekend ? 'text-rose-600' : 'text-[#0065de]'
                }`}
                style={{ width: DAY_W }}
              >
                <span className="text-[10px] font-medium opacity-80">
                  {d.name}
                </span>
                <span className="text-[12px] font-semibold leading-none">
                  {d.label}
                </span>
              </div>
            ))}
          </div>

          {/* Rows */}
          {rows.map(({ t, mulai, selesai, dMulai, dSelesai }, i) => {
            const zebra = i % 2 === 0 ? 'bg-[#F0F7FF]' : 'bg-white';
            const fgRow = isFG(t);
            const hasPos = !isNaN(mulai);
            const confl = conflictByTahapan.get(t.id) ?? [];
            const clickable = canEdit && !fgRow && hasPos;
            const drying =
              !isNaN(dMulai) && !isNaN(dSelesai) && dSelesai > dMulai;

            return (
              <div
                key={t.id ?? i}
                className={`flex border-b border-[#E3EEFB] ${zebra}`}
                style={{ height: ROW_H }}
                role="row"
              >
                <button
                  type="button"
                  disabled={!clickable}
                  onClick={() => onSelect(t)}
                  title={
                    clickable
                      ? 'Klik untuk mengubah jadwal tahapan ini'
                      : undefined
                  }
                  className={`sticky left-0 z-10 flex shrink-0 flex-col items-start justify-center border-r border-[#D8EAFF] px-3 text-left ${zebra} ${
                    clickable ? 'hover:bg-[#DEF0FF]' : 'cursor-default'
                  }`}
                  style={{ width: LABEL_W }}
                >
                  <span className="flex w-full items-center gap-1 text-[12px] font-semibold text-slate-800">
                    <span className="truncate">{t.tahapan}</span>
                    {t.is_diubah_manual && (
                      <span
                        title="Diubah manual"
                        className="rounded bg-amber-100 px-1 text-[9px] font-bold text-amber-700"
                      >
                        EDIT
                      </span>
                    )}
                    {confl.length > 0 && (
                      <span
                        title={`${confl.length} jam bentrok`}
                        className="rounded bg-rose-100 px-1 text-[9px] font-bold text-rose-700"
                      >
                        BENTROK
                      </span>
                    )}
                  </span>
                  <span className="w-full truncate text-[10px] text-slate-500">
                    {t.mesin || '-'}
                  </span>
                </button>

                <div
                  className="relative shrink-0"
                  style={{ width: W, ...laneBg }}
                >
                  {/* Spare: target FG sampai tanggal kirim */}
                  {!isNaN(spareLeft) && !isNaN(spareRight) && (
                    <div
                      className="absolute inset-y-0 bg-amber-100/60"
                      style={{
                        left: spareLeft,
                        width: Math.max(0, spareRight - spareLeft),
                      }}
                      title="Spare: target FG sampai tanggal kirim"
                    />
                  )}
                  {!isNaN(fg) && (
                    <div
                      className="absolute inset-y-0 w-px bg-emerald-500"
                      style={{ left: x(fg) }}
                    />
                  )}
                  {!isNaN(kirim) && (
                    <div
                      className="absolute inset-y-0 w-px bg-rose-500"
                      style={{ left: x(kirim) }}
                    />
                  )}

                  {hasPos && fgRow && (
                    <button
                      type="button"
                      disabled
                      title={`FG ${fmtWaktu(isoToApi(t.produksi_mulai))}`}
                      className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-emerald-600"
                      style={{ left: x(mulai) }}
                    />
                  )}

                  {hasPos && !fgRow && (
                    <>
                      {drying && (
                        <div
                          className="absolute top-[14px] h-4 rounded border border-slate-400"
                          style={{
                            left: x(dMulai),
                            width: Math.max(4, x(dSelesai) - x(dMulai)),
                            backgroundImage:
                              'repeating-linear-gradient(45deg, #94a3b8 0 3px, transparent 3px 6px)',
                          }}
                          title={`Drying ${fmtRange(
                            isoToApi(t.drying_mulai),
                            isoToApi(t.drying_selesai),
                          )}`}
                        />
                      )}
                      <button
                        type="button"
                        disabled={!clickable}
                        onClick={() => onSelect(t)}
                        title={`${t.tahapan}: ${fmtRange(
                          isoToApi(t.produksi_mulai),
                          isoToApi(t.produksi_selesai),
                        )}`}
                        className={`absolute top-[10px] h-6 rounded ${
                          t.is_diubah_manual ? 'bg-amber-500' : 'bg-[#0065de]'
                        } ${
                          clickable
                            ? 'cursor-pointer hover:opacity-85'
                            : 'cursor-default'
                        }`}
                        style={{
                          left: x(mulai),
                          width: Math.max(6, x(selesai) - x(mulai)),
                        }}
                      />
                      {confl.map((w, k) => {
                        const ms = parseWaktu(w);
                        if (isNaN(ms)) return null;
                        return (
                          <div
                            key={k}
                            title={w}
                            className="absolute top-[10px] h-6 rounded-sm bg-rose-500 ring-1 ring-white"
                            style={{
                              left: x(ms),
                              width: Math.max(4, hourW),
                            }}
                          />
                        );
                      })}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-600">
        <Legend color="bg-[#0065de]" label="Produksi" />
        <Legend color="bg-amber-500" label="Diubah manual" />
        <span className="inline-flex items-center gap-1">
          <i
            className="h-3 w-4 rounded border border-slate-400"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, #94a3b8 0 3px, transparent 3px 6px)',
            }}
          />
          Drying (bukan jam mesin)
        </span>
        <Legend color="bg-rose-500" label="Jam bentrok" />
        <Legend color="bg-amber-100" label="Spare (target FG – kirim)" />
        <span className="inline-flex items-center gap-1">
          <i className="h-3 w-px bg-emerald-500" /> Target FG
        </span>
        <span className="inline-flex items-center gap-1">
          <i className="h-3 w-px bg-rose-500" /> Tanggal kirim
        </span>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <i className={`h-3 w-3 rounded-sm ${color}`} />
      {label}
    </span>
  );
}
