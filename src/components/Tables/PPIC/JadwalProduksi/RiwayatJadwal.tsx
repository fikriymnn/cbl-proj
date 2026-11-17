import React, { useEffect, useState } from 'react';
import {
  AdjustLogItem,
  JENIS_LABEL,
  errMsg,
  fmtGeser,
  fmtRange,
  fmtWaktu,
  getAdjustLog,
  isoToApi,
} from './JadwalApi';

interface Props {
  idTiket: number | string;
  /** Ubah nilainya untuk memuat ulang (mis. setelah simpan). */
  reloadKey?: number;
  /** id tahapan -> nama tahapan, untuk label baris riwayat */
  tahapNames: Record<number, string>;
}

const num = (v: unknown) => (typeof v === 'number' ? v : undefined);

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-2 text-xs">
      <span className="w-16 shrink-0 text-slate-500">{label}</span>
      <span className="min-w-0 text-slate-700">{children}</span>
    </div>
  );
}

/** Riwayat perubahan jadwal tiket (tidak dihapus saat calculate ulang). */
export default function RiwayatJadwal({
  idTiket,
  reloadKey = 0,
  tahapNames,
}: Props) {
  const [items, setItems] = useState<AdjustLogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    getAdjustLog(idTiket)
      .then((d) => alive && setItems(d))
      .catch((e) => alive && setError(errMsg(e, 'Gagal memuat riwayat')))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [idTiket, reloadKey]);

  if (loading && items.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-slate-500">
        Memuat riwayat…
      </p>
    );
  }
  if (error) {
    return (
      <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">
        {error}
      </p>
    );
  }
  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-[#D8EAFF] py-10 text-center text-sm text-slate-500">
        Belum ada perubahan jadwal pada tiket ini.
      </p>
    );
  }

  return (
    <ol className="space-y-3">
      {items.map((it) => {
        const lama = it.nilai_lama ?? {};
        const baru = it.nilai_baru ?? {};
        const tahapan =
          it.id_tiket_jadwal_produksi_tahapan != null
            ? tahapNames[it.id_tiket_jadwal_produksi_tahapan] ??
              `Tahapan #${it.id_tiket_jadwal_produksi_tahapan}`
            : null;
        const bentrok = it.jenis === 'selesaikan_bentrok';
        const diselesaikan: any[] = Array.isArray(baru.diselesaikan)
          ? baru.diselesaikan
          : [];
        const belum: any[] = Array.isArray(baru.belum_terselesaikan)
          ? baru.belum_terselesaikan
          : [];
        const awal: any[] = Array.isArray(lama.bentrok) ? lama.bentrok : [];

        return (
          <li
            key={it.id}
            className="rounded-xl border border-[#D8EAFF] bg-white p-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#D8EAFF] px-2 py-0.5 text-[11px] font-semibold text-[#0065de]">
                {JENIS_LABEL[it.jenis] ?? it.jenis}
              </span>
              {tahapan && (
                <span className="text-sm font-semibold text-slate-800">
                  {tahapan}
                </span>
              )}
              {it.mode && (
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                  Mode {it.mode === 'mulai_tetap' ? 'A' : 'B'}
                </span>
              )}
              <span className="ml-auto text-[11px] tabular-nums text-slate-500">
                {fmtWaktu(isoToApi(it.createdAt))}
                {/* {it.id_user != null && ` · User #${it.id_user}`} */}
              </span>
            </div>

            <div className="mt-2 space-y-1">
              {!bentrok && (
                <>
                  <Row label="Lama">
                    {fmtRange(lama.mulai, lama.selesai)}
                    {num(lama.kapasitas_per_jam) !== undefined &&
                      ` · ${lama.kapasitas_per_jam}/jam`}
                    {num(lama.drying_time) !== undefined &&
                      ` · drying ${lama.drying_time} jam`}
                  </Row>
                  <Row label="Baru">
                    <b className="text-[#0065de]">
                      {fmtRange(baru.mulai, baru.selesai)}
                    </b>
                    {num(baru.kapasitas_per_jam) !== undefined &&
                      ` · ${baru.kapasitas_per_jam}/jam`}
                    {num(baru.drying_time) !== undefined &&
                      ` · drying ${baru.drying_time} jam`}
                  </Row>
                </>
              )}

              {bentrok && (
                <>
                  <Row label="Bentrok">
                    {awal.length} tahapan bentrok sebelum diselesaikan
                  </Row>
                  <Row label="Selesai">
                    {diselesaikan.length === 0
                      ? '-'
                      : diselesaikan.map((d, i) => (
                          <span key={i} className="block">
                            {d.tahapan}: {fmtWaktu(d.dari)} →{' '}
                            <b className="text-[#0065de]">{fmtWaktu(d.ke)}</b> (
                            {fmtGeser(d.geser_jam)})
                          </span>
                        ))}
                  </Row>
                  {belum.length > 0 && (
                    <Row label="Belum">
                      <span className="text-rose-700">
                        {belum.map((b) => b.tahapan).join(', ')}
                      </span>
                    </Row>
                  )}
                </>
              )}

              {it.tahapan_ikut?.length > 0 && (
                <Row label="Ikut">
                  {it.tahapan_ikut.map((t) => (
                    <span key={t.id} className="block">
                      {t.tahapan}: {fmtRange(t.lama.mulai, t.lama.selesai)} →{' '}
                      <b className="text-[#0065de]">
                        {fmtRange(t.baru.mulai, t.baru.selesai)}
                      </b>
                    </span>
                  ))}
                </Row>
              )}

              <Row label="Alasan">{it.alasan}</Row>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
