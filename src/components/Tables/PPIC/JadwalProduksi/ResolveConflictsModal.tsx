import React, { useCallback, useEffect, useState } from 'react';
import AppModal from './AppModal';
import {
  ConflictPerTahapan,
  Pelanggaran,
  ResolvePreview,
  errMsg,
  fmtGeser,
  fmtRange,
  fmtWaktu,
  resolveApply,
  resolvePreview,
} from './JadwalApi';

interface Props {
  open: boolean;
  idTiket: number | string;
  subtitle?: React.ReactNode;
  onClose: () => void;
  /** Dipanggil setelah simpan berhasil (muat ulang tiket + cek bentrok lagi). */
  onSaved: () => void;
}

const DEFAULT_ALASAN = 'Menyelesaikan bentrok setelah calculate';

function List({
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

function Th({ children }: { children?: React.ReactNode }) {
  return (
    <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </th>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-xs font-bold uppercase tracking-wide text-slate-700">
      {children}
    </h4>
  );
}

/** "Selesaikan semua bentrok otomatis": preview (POST) lalu simpan (PUT). */
export default function ResolveConflictsModal({
  open,
  idTiket,
  subtitle,
  onClose,
  onSaved,
}: Props) {
  const [data, setData] = useState<ResolvePreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alasan, setAlasan] = useState(DEFAULT_ALASAN);
  const [isLembur, setIsLembur] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await resolvePreview(idTiket, isLembur));
    } catch (e) {
      setData(null);
      setError(errMsg(e, 'Gagal membuat preview penyelesaian bentrok'));
    } finally {
      setLoading(false);
    }
  }, [idTiket, isLembur]);

  useEffect(() => {
    if (open) setAlasan(DEFAULT_ALASAN);
  }, [open]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const handleSave = async () => {
    if (!alasan.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await resolveApply(idTiket, alasan.trim(), isLembur);
      if (res.ok) {
        onSaved();
      } else {
        setError(res.msg);
        await load(); // hasil bisa berbeda dari preview sebelumnya
      }
    } catch (e) {
      setError(errMsg(e, 'Gagal menyimpan penyelesaian bentrok'));
    } finally {
      setSaving(false);
    }
  };

  const total = data?.bentrok_awal.length ?? 0;
  const solved = data?.diselesaikan.length ?? 0;
  const changedRows = (data?.tahapan ?? []).filter((t) => t.peran !== 'tetap');
  const bigShift = (data?.diselesaikan ?? []).some(
    (d) => Math.abs(d.geser_jam) > 24,
  );

  return (
    <AppModal
      open={open}
      onClose={() => !saving && onClose()}
      size="xl"
      stacked
      title="Selesaikan bentrok otomatis"
      subtitle={subtitle}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="h-9 rounded-lg bg-slate-100 px-4 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={
              saving || loading || !data?.bisa_disimpan || !alasan.trim()
            }
            title={
              !data?.bisa_disimpan
                ? 'Tidak ada bentrok yang bisa diselesaikan otomatis'
                : !alasan.trim()
                ? 'Alasan wajib diisi'
                : undefined
            }
            className="h-9 rounded-lg bg-[#0065de] px-5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Menyimpan…' : 'Simpan penyelesaian'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <label className="min-w-[260px] flex-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Alasan <span className="text-rose-500">*</span>
            <input
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              className="mt-1 block h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-normal normal-case tracking-normal text-slate-800 focus:border-[#0065de] focus:outline-none focus:ring-2 focus:ring-[#0065de]/30"
            />
          </label>
          <label className="flex h-9 cursor-pointer select-none items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-700 hover:bg-slate-50">
            <input
              type="checkbox"
              checked={isLembur}
              onChange={(e) => setIsLembur(e.target.checked)}
              className="accent-[#0065de]"
            />
            Anggap semua tanggal sebagai lembur
          </label>
        </div>

        {loading && (
          <p className="rounded-lg bg-slate-50 px-3 py-6 text-center text-sm text-slate-500">
            Menghitung penyelesaian bentrok…
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200"
          >
            {error}
          </p>
        )}

        {data && !loading && (
          <>
            {/* Ringkasan */}
            <div
              className={`rounded-xl px-4 py-3 text-sm ring-1 ${
                data.valid
                  ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
                  : data.bisa_disimpan
                  ? 'bg-amber-50 text-amber-800 ring-amber-200'
                  : 'bg-rose-50 text-rose-800 ring-rose-200'
              }`}
            >
              <b>
                {solved} dari {total} tahapan bentrok bisa diselesaikan.
              </b>{' '}
              {data.valid
                ? 'Semua bentrok selesai.'
                : data.bisa_disimpan
                ? 'Sisanya perlu ditangani manual.'
                : 'Tidak ada bentrok yang bisa diselesaikan otomatis, selesaikan manual per tahapan.'}
              {(data.tgl_kirim || data.tgl_target_fg) && (
                <span className="ml-2 text-xs opacity-80">
                  Target FG {fmtWaktu(data.tgl_target_fg)} · Kirim{' '}
                  {fmtWaktu(data.tgl_kirim)}
                </span>
              )}
            </div>

            {bigShift && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 ring-1 ring-amber-200">
                Ada tahapan yang bergeser lebih dari 24 jam. Periksa kolom
                selisih sebelum menyimpan.
              </p>
            )}

            {/* Diselesaikan */}
            {data.diselesaikan.length > 0 && (
              <section className="space-y-2">
                <SectionTitle>Dipindahkan otomatis</SectionTitle>
                <div className="overflow-hidden rounded-xl border border-[#D8EAFF]">
                  <table className="w-full border-collapse text-sm">
                    <thead className="bg-[#eaf4ff]">
                      <tr>
                        <Th>Tahapan</Th>
                        <Th>Mesin</Th>
                        <Th>Jam lama</Th>
                        <Th>Jam baru</Th>
                        <Th>Selisih</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.diselesaikan.map((d) => (
                        <tr
                          key={d.id_tahapan}
                          className="border-t border-[#E3EEFB]"
                        >
                          <td className="px-3 py-2 font-semibold text-slate-800">
                            {d.tahapan}
                          </td>
                          <td className="px-3 py-2 text-slate-600">
                            {d.mesin}
                          </td>
                          <td className="px-3 py-2 tabular-nums text-slate-600">
                            {fmtWaktu(d.dari)}
                          </td>
                          <td className="px-3 py-2 font-semibold tabular-nums text-[#0065de]">
                            {fmtWaktu(d.ke)}
                          </td>
                          <td
                            className={`px-3 py-2 tabular-nums ${
                              Math.abs(d.geser_jam) > 24
                                ? 'font-semibold text-amber-700'
                                : 'text-slate-600'
                            }`}
                          >
                            {fmtGeser(d.geser_jam)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Semua perubahan */}
            {changedRows.length > 0 && (
              <section className="space-y-2">
                <SectionTitle>Semua tahapan yang berubah</SectionTitle>
                <div className="overflow-hidden rounded-xl border border-[#D8EAFF]">
                  <table className="w-full border-collapse text-sm">
                    <thead className="bg-[#eaf4ff]">
                      <tr>
                        <Th>Tahapan</Th>
                        <Th>Jadwal lama</Th>
                        <Th>Jadwal baru</Th>
                        <Th>Selisih</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {changedRows.map((t) => (
                        <tr key={t.id} className="border-t border-[#E3EEFB]">
                          <td className="px-3 py-2">
                            <span className="font-semibold text-slate-800">
                              {t.tahapan}
                            </span>
                            {t.peran === 'ikut' && (
                              <span className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                                Ikut
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-xs tabular-nums text-slate-600">
                            {fmtRange(t.lama.mulai, t.lama.selesai)}
                          </td>
                          <td className="px-3 py-2 text-xs font-semibold tabular-nums text-[#0065de]">
                            {fmtRange(t.baru.mulai, t.baru.selesai)}
                          </td>
                          <td className="px-3 py-2 text-xs tabular-nums text-slate-600">
                            {fmtGeser(t.geser_jam)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Belum terselesaikan */}
            {data.belum_terselesaikan.length > 0 && (
              <section className="space-y-2">
                <SectionTitle>Perlu diselesaikan manual</SectionTitle>
                <ul className="space-y-1 rounded-lg bg-rose-50 p-3 text-xs text-rose-800 ring-1 ring-rose-200">
                  {data.belum_terselesaikan.map((b: ConflictPerTahapan) => (
                    <li key={b.id_tahapan}>
                      <b>{b.tahapan}</b> ({b.mesin}): {b.jumlah_jam} jam bentrok
                      dengan {b.no_jo.join(', ') || 'jadwal lain'}. Tidak ada
                      jam valid antara sekarang dan tanggal kirim. Coba lembur,
                      pindah mesin, atau ajukan perubahan tanggal kirim.
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <List items={data.conflicts} tone="rose" />
            <List items={data.warnings} tone="amber" />
          </>
        )}
      </div>
    </AppModal>
  );
}
