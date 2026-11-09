import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { FaPaperclip, FaFileAlt } from 'react-icons/fa';
import NCRDetailModal from './NCRDetailModal';
import {
  API,
  BTN_GHOST,
  BTN_PRIMARY,
  CAPA_STEPS,
  DecisionPanel,
  Field,
  INPUT,
  InfoGrid,
  Modal,
  NOTE_MAX,
  Section,
  Spinner,
  StatusBadge,
  Stepper,
  TextAreaField,
  apiError,
  capaStep,
  dash,
  fmtDateTime,
  personName,
  toDateInput,
  useMe,
} from './qmsShared';

export type CAPADetailMode = 'qa' | 'mr' | 'department' | 'report';

interface Point {
  id: number;
  analisa_penyebab: string;
  tindakan_perbaikan: string;
  pencegahan: string;
  pencegahan_efektif_dilakukan: string;
  tanggal_pencegahan_efektif_dilakukan: string;
  keterangan_ketidak_sesuaian: string;
}

const EDITABLE = ['incoming', 'di tolak qa', 'di tolak mr'];

const REQUIRED: [keyof Point, string][] = [
  ['analisa_penyebab', 'Analisa penyebab'],
  ['tindakan_perbaikan', 'Tindakan perbaikan'],
  ['pencegahan', 'Pencegahan'],
  ['pencegahan_efektif_dilakukan', 'Pencegahan efektif dilakukan'],
];

interface Props {
  id: number;
  mode: CAPADetailMode;
  onClose: () => void;
  onChanged?: () => void;
  notify: (text: string, type?: 'success' | 'error') => void;
}

function ReadField({ label, value }: { label: string; value: any }) {
  return (
    <div className="min-w-0">
      <p className="text-gray-400 font-medium mb-0.5">{label}</p>
      <p className="text-gray-800 whitespace-pre-line break-words">
        {dash(value)}
      </p>
    </div>
  );
}

export default function CAPADetailModal({
  id,
  mode,
  onClose,
  onChanged,
  notify,
}: Props) {
  const me = useMe();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [points, setPoints] = useState<Point[]>([]);
  const [inspektor, setInspektor] = useState('');
  const [error, setError] = useState('');
  const [showNcr, setShowNcr] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/capa/${id}`, {
        withCredentials: true,
      });
      const d = res.data?.data ?? null;
      setData(d);
      setInspektor(d?.nama_inspektor ?? '');
      setPoints(
        (d?.data_ketidaksesuaian ?? []).map((k: any) => ({
          id: k.id,
          analisa_penyebab: k.analisa_penyebab ?? '',
          tindakan_perbaikan: k.tindakan_perbaikan ?? '',
          pencegahan: k.pencegahan ?? '',
          pencegahan_efektif_dilakukan: k.pencegahan_efektif_dilakukan ?? '',
          tanggal_pencegahan_efektif_dilakukan: toDateInput(
            k.tanggal_pencegahan_efektif_dilakukan,
          ),
          keterangan_ketidak_sesuaian: k.keterangan_ketidak_sesuaian ?? '',
        })),
      );
    } catch (e) {
      notify(apiError(e), 'error');
    } finally {
      setLoading(false);
    }
  }, [id, notify]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (me?.name) setInspektor((v) => v || me.name);
  }, [me]);

  // Backend belum memvalidasi status CAPA → tombol wajib mengikuti status
  const status: string = data?.status ?? '';
  const canSubmit = mode === 'department' && EDITABLE.includes(status);
  const canQa = mode === 'qa' && status === 'menunggu verifikasi qa';
  const canMr = mode === 'mr' && status === 'menunggu verifikasi mr';
  const rejected = status === 'di tolak qa' || status === 'di tolak mr';
  const rejectNote =
    status === 'di tolak qa'
      ? data?.catatan_verifikasi_qa
      : data?.catatan_verifikasi_mr;

  const patch = (idx: number, p: Partial<Point>) =>
    setPoints((prev) => prev.map((x, i) => (i === idx ? { ...x, ...p } : x)));

  async function submit() {
    // FE wajib menolak string kosong (backend hanya cek null)
    if (!inspektor.trim()) return setError('Nama pengisi wajib diisi');
    for (const [i, p] of points.entries()) {
      for (const [key, label] of REQUIRED) {
        if (!String(p[key]).trim())
          return setError(`Poin ${i + 1}: ${label} wajib diisi`);
      }
    }
    setError('');
    setBusy(true);
    try {
      await axios.post(
        `${API}/capa/submit/${id}`,
        {
          nama_inspektor: inspektor.trim(),
          // kirim SEMUA poin, hanya field yang disebutkan
          data_ketidaksesuaian: points.map((p) => ({
            id: p.id,
            analisa_penyebab: p.analisa_penyebab.trim(),
            tindakan_perbaikan: p.tindakan_perbaikan.trim(),
            pencegahan: p.pencegahan.trim(),
            pencegahan_efektif_dilakukan: p.pencegahan_efektif_dilakukan.trim(),
            tanggal_pencegahan_efektif_dilakukan:
              p.tanggal_pencegahan_efektif_dilakukan || null,
            keterangan_ketidak_sesuaian: p.keterangan_ketidak_sesuaian.trim(),
          })),
        },
        { withCredentials: true },
      );
      notify('CAPA berhasil disubmit, menunggu verifikasi QA');
      onChanged?.();
      onClose();
    } catch (e) {
      notify(apiError(e), 'error');
    } finally {
      setBusy(false);
    }
  }

  async function verify(result: 'sesuai' | 'tidak sesuai', note: string) {
    const isQa = mode === 'qa';
    setBusy(true);
    try {
      await axios.put(
        `${API}/capa/${isQa ? 'verifikasiQa' : 'verifikasiMr'}/${id}`,
        {
          status: result,
          [isQa ? 'catatan_verifikasi_qa' : 'catatan_verifikasi_mr']:
            note || undefined,
        },
        { withCredentials: true },
      );
      notify(`CAPA ditandai ${result}`);
      onChanged?.();
      onClose();
    } catch (e) {
      notify(apiError(e), 'error');
      await load();
      onChanged?.();
    } finally {
      setBusy(false);
    }
  }

  const step = capaStep(status);

  return (
    <>
      <Modal
        title="Detail CAPA"
        subtitle={
          data ? `${data.no_capa ?? '-'} · ${data.department ?? '-'}` : ''
        }
        onClose={onClose}
        footer={
          <>
            {canSubmit && (
              <button className={BTN_PRIMARY} onClick={submit} disabled={busy}>
                {busy ? 'Mengirim...' : 'Submit CAPA'}
              </button>
            )}
            {data?.id_ncr && (
              <button className={BTN_GHOST} onClick={() => setShowNcr(true)}>
                <FaFileAlt /> Lihat NCR
              </button>
            )}
            <button className={BTN_GHOST} onClick={onClose}>
              Tutup
            </button>
          </>
        }
      >
        {loading ? (
          <Spinner />
        ) : !data ? (
          <p className="text-center text-gray-400 py-10">
            Data tidak ditemukan
          </p>
        ) : (
          <>
            <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 space-y-3">
              <StatusBadge status={status} />
              <Stepper steps={CAPA_STEPS} {...step} />
            </div>

            {rejected && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <p className="font-semibold mb-0.5">
                  Ditolak {status === 'di tolak qa' ? 'QA' : 'MR'}, perbaiki
                  lalu submit ulang
                </p>
                {rejectNote || 'Tidak ada catatan.'}
              </div>
            )}

            <Section title="Informasi CAPA">
              <InfoGrid
                items={[
                  ['No CAPA', data.no_capa],
                  ['Department', data.department],
                  ['Kategori', data.kategori_laporan],
                  ['Tgl Lapor', fmtDateTime(data.tanggal_lapor)],
                  ['Tgl CAPA', fmtDateTime(data.tanggal)],
                  ['Pelapor', data.nama_pelapor || personName(data.pelapor)],
                  ['No JO', data.no_jo],
                  ['No IO', data.no_io],
                  ['Produk', data.nama_produk],
                  ['Nama Pengisi', data.nama_inspektor],
                  ['Diverifikasi QA', data.qa ? personName(data.qa) : null],
                  ['Diverifikasi MR', data.mr ? personName(data.mr) : null],
                ]}
              />
              {(data.catatan_qa || data.catatan_mr) && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {data.catatan_qa && (
                    <ReadField
                      label="Catatan validasi QA (NCR)"
                      value={data.catatan_qa}
                    />
                  )}
                  {data.catatan_mr && (
                    <ReadField
                      label="Catatan validasi MR (NCR)"
                      value={data.catatan_mr}
                    />
                  )}
                </div>
              )}
            </Section>

            {canSubmit && (
              <Field label="Nama Pengisi" required>
                <input
                  value={inspektor}
                  onChange={(e) => setInspektor(e.target.value)}
                  className={INPUT}
                />
              </Field>
            )}

            <div className="space-y-3">
              {(data.data_ketidaksesuaian ?? []).map((k: any, i: number) => {
                const p = points[i];
                return (
                  <div
                    key={k.id}
                    className="rounded-xl border border-violet-200 bg-white overflow-hidden"
                  >
                    <div className="bg-violet-50 px-3 py-2.5">
                      <p className="text-[11px] font-semibold text-violet-700">
                        Poin ketidaksesuaian {i + 1}
                      </p>
                      <p className="text-sm text-gray-800 whitespace-pre-line break-words mt-0.5">
                        {k.ketidaksesuaian}
                      </p>
                      {k.file && (
                        <span className="mt-1.5 inline-flex items-center gap-1 rounded bg-white px-2 py-0.5 text-[10px] text-gray-600 border border-violet-100">
                          <FaPaperclip /> {k.file}
                        </span>
                      )}
                    </div>

                    {canSubmit && p ? (
                      <div className="p-3 sm:p-4 grid grid-cols-1 gap-3">
                        <TextAreaField
                          label="Analisa Penyebab"
                          required
                          max={NOTE_MAX}
                          value={p.analisa_penyebab}
                          onChange={(v) => patch(i, { analisa_penyebab: v })}
                        />
                        <TextAreaField
                          label="Tindakan Perbaikan"
                          required
                          max={NOTE_MAX}
                          value={p.tindakan_perbaikan}
                          onChange={(v) => patch(i, { tindakan_perbaikan: v })}
                        />
                        <TextAreaField
                          label="Pencegahan"
                          required
                          max={NOTE_MAX}
                          value={p.pencegahan}
                          onChange={(v) => patch(i, { pencegahan: v })}
                        />
                        <TextAreaField
                          label="Pencegahan Efektif Dilakukan"
                          required
                          value={p.pencegahan_efektif_dilakukan}
                          onChange={(v) =>
                            patch(i, { pencegahan_efektif_dilakukan: v })
                          }
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Field label="Tanggal Pencegahan Efektif">
                            <input
                              type="date"
                              value={p.tanggal_pencegahan_efektif_dilakukan}
                              onChange={(e) =>
                                patch(i, {
                                  tanggal_pencegahan_efektif_dilakukan:
                                    e.target.value,
                                })
                              }
                              className={INPUT}
                            />
                          </Field>
                        </div>
                        <TextAreaField
                          label="Keterangan Ketidaksesuaian"
                          rows={2}
                          value={p.keterangan_ketidak_sesuaian}
                          onChange={(v) =>
                            patch(i, { keterangan_ketidak_sesuaian: v })
                          }
                        />
                      </div>
                    ) : (
                      <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <ReadField
                          label="Analisa Penyebab"
                          value={k.analisa_penyebab}
                        />
                        <ReadField
                          label="Tindakan Perbaikan"
                          value={k.tindakan_perbaikan}
                        />
                        <ReadField label="Pencegahan" value={k.pencegahan} />
                        <ReadField
                          label="Pencegahan Efektif Dilakukan"
                          value={k.pencegahan_efektif_dilakukan}
                        />
                        <ReadField
                          label="Tanggal Pencegahan Efektif"
                          value={
                            k.tanggal_pencegahan_efektif_dilakukan
                              ? toDateInput(
                                  k.tanggal_pencegahan_efektif_dilakukan,
                                )
                              : null
                          }
                        />
                        <ReadField
                          label="Keterangan"
                          value={k.keterangan_ketidak_sesuaian}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {error && (
              <p className="text-xs text-red-600 font-medium bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {canQa && (
              <DecisionPanel
                title="Verifikasi QA"
                hint="Jika Tidak Sesuai, tiket kembali ke department dan catatan Anda akan ditampilkan."
                busy={busy}
                onSubmit={verify}
              />
            )}
            {canMr && (
              <DecisionPanel
                title="Verifikasi MR"
                hint="Jika Sesuai, CAPA berstatus Di teruskan dan masuk riwayat."
                busy={busy}
                onSubmit={verify}
              />
            )}
          </>
        )}
      </Modal>

      {showNcr && data?.id_ncr && (
        <NCRDetailModal
          id={data.id_ncr}
          mode="view"
          notify={notify}
          onClose={() => setShowNcr(false)}
        />
      )}
    </>
  );
}
