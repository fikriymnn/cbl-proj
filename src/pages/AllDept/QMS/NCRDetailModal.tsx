import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { FaEdit, FaPaperclip } from 'react-icons/fa';
import {
  API,
  BTN_GHOST,
  BTN_PRIMARY,
  DecisionPanel,
  InfoGrid,
  Modal,
  NCR_STEPS,
  Section,
  Spinner,
  Stepper,
  StatusBadge,
  TipeBadge,
  apiError,
  fmtDateTime,
  ncrStep,
  personName,
} from './qmsShared';

export type NCRDetailMode = 'qa' | 'mr' | 'view';

interface Props {
  id: number;
  mode: NCRDetailMode;
  onClose: () => void;
  onChanged?: () => void;
  onEdit?: (data: any) => void;
  notify: (text: string, type?: 'success' | 'error') => void;
}

export default function NCRDetailModal({
  id,
  mode,
  onClose,
  onChanged,
  onEdit,
  notify,
}: Props) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      // detail: panggil :id TANPA query
      const res = await axios.get(`${API}/ncr/${id}`, {
        withCredentials: true,
      });
      setData(res.data?.data ?? null);
    } catch (e) {
      notify(apiError(e), 'error');
    } finally {
      setLoading(false);
    }
  }, [id, notify]);

  useEffect(() => {
    load();
  }, [load]);

  const canQa = mode === 'qa' && data?.status === 'menunggu validasi qa';
  const canMr = mode === 'mr' && data?.status === 'menunggu validasi mr';
  const departments: any[] = data?.data_department ?? [];

  const mrHint = () => {
    if (data?.tipe_ncr === 'frekuensi' && !data?.melebihi_batas)
      return 'Batas frekuensi belum terlewati. Jika Sesuai, NCR berstatus Selesai tanpa membuat CAPA.';
    if (departments.length === 0)
      return 'NCR ini tidak punya department, jadi tidak ada CAPA yang terbentuk.';
    return `Jika Sesuai, ${departments.length} tiket CAPA akan dibuat (satu per department).`;
  };

  async function decide(status: 'sesuai' | 'tidak sesuai', note: string) {
    const isQa = mode === 'qa';
    setBusy(true);
    try {
      await axios.put(
        `${API}/ncr/${isQa ? 'validasiQa' : 'validasiMr'}/${id}`,
        { status, [isQa ? 'catatan_qa' : 'catatan_mr']: note || undefined },
        { withCredentials: true },
      );
      notify(`NCR ditandai ${status}`);
      onChanged?.();
      onClose();
    } catch (e) {
      // tahap tidak sesuai (400): tampilkan pesan, muat ulang data
      notify(apiError(e), 'error');
      await load();
      onChanged?.();
    } finally {
      setBusy(false);
    }
  }

  const step = ncrStep(data?.status);
  const rejected =
    data?.status === 'di tolak qa' || data?.status === 'di tolak mr';

  return (
    <Modal
      title="Detail NCR"
      subtitle={
        data ? `${data.no_ncr ?? '-'} · ${data.nama_produk ?? '-'}` : ''
      }
      onClose={onClose}
      footer={
        <>
          {canQa && onEdit && (
            <button className={BTN_PRIMARY} onClick={() => onEdit(data)}>
              <FaEdit /> Edit / Lampiran
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
        <p className="text-center text-gray-400 py-10">Data tidak ditemukan</p>
      ) : (
        <>
          <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <StatusBadge status={data.status} />
              <TipeBadge tipe={data.tipe_ncr} />
            </div>
            <Stepper steps={NCR_STEPS} {...step} />
          </div>

          {rejected && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <p className="font-semibold mb-0.5">
                Ditolak {data.status === 'di tolak qa' ? 'QA' : 'MR'}
              </p>
              {data.status === 'di tolak qa'
                ? data.catatan_qa
                : data.catatan_mr}
            </div>
          )}

          <Section title="Informasi NCR">
            <InfoGrid
              items={[
                ['No NCR', data.no_ncr],
                ['Tipe', data.tipe_ncr],
                ['Kategori', data.kategori_laporan],
                ['Tanggal', fmtDateTime(data.tanggal)],
                ['No JO', data.no_jo],
                ['No IO', data.no_io],
                ['Produk', data.nama_produk],
                ['Qty Defect', data.qty_defect],
                [
                  'Melebihi Batas',
                  data.tipe_ncr === 'frekuensi'
                    ? data.melebihi_batas
                      ? 'Ya'
                      : 'Belum'
                    : '-',
                ],
                ['Pelapor', data.nama_pelapor || personName(data.pelapor)],
                ['Dept. Pelapor', data.department_pelapor],
              ]}
            />
          </Section>

          {(data.catatan_qa || data.catatan_mr || data.qa || data.mr) && (
            <Section title="Hasil Validasi">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {(
                  [
                    ['QA', data.qa, data.catatan_qa],
                    ['MR', data.mr, data.catatan_mr],
                  ] as [string, any, string | null][]
                ).map(([label, person, note]) => (
                  <div
                    key={label}
                    className="bg-white rounded-lg border border-gray-200 p-3"
                  >
                    <p className="text-gray-400 font-medium">{label}</p>
                    <p className="font-semibold text-gray-800">
                      {person ? personName(person) : 'Belum divalidasi'}
                    </p>
                    {note && <p className="mt-1 text-gray-600">{note}</p>}
                  </div>
                ))}
              </div>
            </Section>
          )}

          <Section
            title={`Department & Ketidaksesuaian (${departments.length})`}
          >
            {departments.length === 0 ? (
              <p className="text-xs text-gray-400">Tidak ada department</p>
            ) : (
              <div className="space-y-3">
                {departments.map((d: any) => (
                  <div
                    key={d.id}
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                  >
                    <div className="bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700">
                      {d.department ?? '-'}
                    </div>
                    <ul className="divide-y divide-gray-100">
                      {(d.data_ketidaksesuaian ?? []).map(
                        (k: any, i: number) => (
                          <li
                            key={k.id}
                            className="px-3 py-2 text-xs flex gap-2"
                          >
                            <span className="text-gray-400 font-semibold">
                              {i + 1}.
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-gray-800 whitespace-pre-line break-words">
                                {k.ketidaksesuaian}
                              </p>
                              {k.file && (
                                <span className="mt-1 inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600">
                                  <FaPaperclip /> {k.file}
                                </span>
                              )}
                            </div>
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {canQa && (
            <DecisionPanel title="Validasi QA" busy={busy} onSubmit={decide} />
          )}
          {canMr && (
            <DecisionPanel
              title="Validasi MR"
              hint={mrHint()}
              busy={busy}
              onSubmit={decide}
            />
          )}
        </>
      )}
    </Modal>
  );
}
