import {
  useEffect,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ptcbl from '../../../../../images/ptcbl.png';
import convertTimeStampToDateOnly from '../../../../../utils/convertDateOnly';

/* ------------------------------------------------------------------ */
/* Konstanta & helper                                                  */
/* ------------------------------------------------------------------ */

const API_URL = `${import.meta.env.VITE_API_LINK}/qc/cs/inspeksiPotong`;

const SESUAI: [string, string][] = [
  ['sesuai', 'Sesuai'],
  ['tidak sesuai', 'Tidak sesuai'],
];

type TaskState = 'idle' | 'running' | 'done';
type Notice = { type: 'success' | 'error'; text: string };

const TASK_STATUS: Record<TaskState, [string, string]> = {
  idle: ['Belum dimulai', 'bg-red-100 text-red-700'],
  running: ['Sedang dikerjakan', 'bg-green-100 text-green-700'],
  done: ['Selesai', 'bg-blue-100 text-blue-700'],
};

const cardCls = 'rounded-xl bg-white p-4 shadow-sm sm:p-6';
const inputBase =
  'w-full rounded-lg border bg-white px-3 py-2 text-base text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 sm:text-sm';
const inputCls = `${inputBase} border-neutral-300 focus:border-blue-500 focus:ring-blue-200`;

const isFilled = (v: unknown) => v != null && String(v).trim() !== '';

function formatDuration(totalSeconds: number) {
  const s = Math.max(0, totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const mm = String(m).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  if (h > 0) return `${h} Jam ${mm} Menit ${ss} Detik`;
  if (m > 0) return `${m} Menit ${ss} Detik`;
  return `${ss} Detik`;
}

function formatDateTime(value: unknown) {
  if (!value) return '-';
  const d = new Date(value as string);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

const elapsedSeconds = (start: string) =>
  Math.round((Date.now() - new Date(start).getTime()) / 1000);

const PRINT_CSS = `
@page { size: A4; margin: 10mm; }
body { margin: 0; padding: 0; }
.print-container { width: 100%; box-sizing: border-box; transform: scale(0.95); transform-origin: top left; }
.print-container * { font-size: 10px !important; }
.print-container .text-lg { font-size: 12px !important; }
.print-container table td, .print-container table th { padding: 2px !important; }
.print-container table { width: 100% !important; table-layout: fixed; }
@media print {
  html, body { width: 210mm; }
  tr { page-break-inside: avoid; }
  thead { display: table-header-group; }
}`;

function printArea(elementId: string) {
  const area = document.getElementById(elementId);
  if (!area) return;

  const win = window.open('', '_blank');
  if (!win) {
    alert('Izinkan pop-up di browser untuk mencetak checksheet.');
    return;
  }

  let css = '';
  let links = '';
  Array.from(document.styleSheets).forEach((sheet) => {
    try {
      css += Array.from(sheet.cssRules)
        .map((rule) => rule.cssText)
        .join('');
    } catch {
      if (sheet.href) links += `<link rel="stylesheet" href="${sheet.href}">`;
    }
  });

  win.document.write(`<!DOCTYPE html>
<html>
  <head>
    <base href="${document.baseURI}">
    ${links}
    <style>${css}${PRINT_CSS}</style>
  </head>
  <body>
    <div class="print-container">${area.innerHTML}</div>
    <script>
      window.onload = function () {
        setTimeout(function () {
          window.print();
          window.onafterprint = function () { window.close(); };
        }, 500);
      };
    <\/script>
  </body>
</html>`);
  win.document.close();
}

/* ------------------------------------------------------------------ */
/* Komponen kecil                                                      */
/* ------------------------------------------------------------------ */

function Info({
  label,
  value,
  wide,
}: {
  label: string;
  value: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={`flex gap-2 text-sm ${wide ? 'md:col-span-2' : ''}`}>
      <dt className="w-32 shrink-0 text-neutral-500">{label}</dt>
      <dd className="min-w-0 break-words font-medium text-neutral-800">
        : {value || '-'}
      </dd>
    </div>
  );
}

function ReadValue({ children }: { children?: ReactNode }) {
  return (
    <p className="text-sm font-medium capitalize text-neutral-800">
      {children || '-'}
    </p>
  );
}

function UnitInput({
  label,
  unit,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label?: string; unit: string }) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1 block text-xs text-neutral-500">{label}</span>
      )}
      <span className="flex items-center gap-2">
        <input {...props} className={inputCls} />
        <span className="w-12 shrink-0 text-sm text-neutral-500">{unit}</span>
      </span>
    </label>
  );
}

function Choice({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: [string, string][];
  value?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup">
      {options.map(([val, label]) => {
        const selected = value === val;
        const negative = /^(tidak|not)/.test(val);
        const tone = selected
          ? negative
            ? 'border-red-500 bg-red-50 text-red-700'
            : 'border-blue-600 bg-blue-50 text-blue-700'
          : 'border-neutral-300 text-neutral-700 hover:bg-neutral-50';
        return (
          <label
            key={val}
            className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${tone}`}
          >
            <input
              type="radio"
              required
              name={name}
              value={val}
              checked={selected}
              onChange={() => onChange(val)}
              className="accent-blue-600"
            />
            {label}
          </label>
        );
      })}
    </div>
  );
}

function PointRow({
  no,
  title,
  standar,
  hasil,
  keterangan,
}: {
  no: number;
  title: ReactNode;
  standar: ReactNode;
  hasil: ReactNode;
  keterangan: ReactNode;
}) {
  return (
    <tr className="align-top">
      <td className="px-3 py-4 text-sm font-semibold text-neutral-500">{no}</td>
      <td className="px-3 py-4 text-sm font-semibold text-neutral-800">
        {title}
      </td>
      <td className="px-3 py-4">{standar}</td>
      <td className="px-3 py-4">{hasil}</td>
      <td className="px-3 py-4">{keterangan}</td>
    </tr>
  );
}

function NoticeBanner({
  notice,
  onClose,
}: {
  notice: Notice;
  onClose: () => void;
}) {
  const tone =
    notice.type === 'success'
      ? 'border-green-200 bg-green-50 text-green-800'
      : 'border-red-200 bg-red-50 text-red-800';
  return (
    <div
      role="alert"
      className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${tone}`}
    >
      <p>{notice.text}</p>
      <button type="button" onClick={onClose} className="font-semibold">
        Tutup
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Halaman                                                             */
/* ------------------------------------------------------------------ */

function PotongJadiChecksheet() {
  const { id } = useParams();
  const [incoming, setIncoming] = useState<any>();
  const [catatan, setCatatan] = useState('');
  const [busy, setBusy] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    getInspection();
  }, [id]);

  function notify(type: Notice['type'], text: string) {
    setNotice({ type, text });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function getInspection() {
    try {
      const res = await axios.get(`${API_URL}/${id}`, {
        withCredentials: true,
      });
      setIncoming(res.data.data);
    } catch (error: any) {
      notify('error', error.response?.data?.msg ?? 'Checksheet gagal dimuat.');
    }
  }

  async function startTask() {
    setBusy(true);
    try {
      await axios.get(`${API_URL}/start/${incoming.id}`, {
        withCredentials: true,
      });
      await getInspection();
    } catch (error: any) {
      notify('error', error.response?.data?.msg ?? 'Task gagal dimulai.');
    } finally {
      setBusy(false);
    }
  }

  function updateResult(index: number, patch: Record<string, unknown>) {
    setIncoming((prev: any) => ({
      ...prev,
      inspeksi_potong_result: prev.inspeksi_potong_result.map(
        (item: any, i: number) => (i === index ? { ...item, ...patch } : item),
      ),
    }));
  }

  if (!incoming) {
    return (
      <main className="mx-auto max-w-5xl space-y-4">
        {notice ? (
          <NoticeBanner notice={notice} onClose={() => setNotice(null)} />
        ) : (
          <p className={`${cardCls} text-sm text-neutral-500`}>
            Memuat checksheet…
          </p>
        )}
      </main>
    );
  }

  const results: any[] = incoming.inspeksi_potong_result ?? [];
  const r = (i: number) => results[i] ?? {};
  const taskState: TaskState = !incoming.waktu_mulai
    ? 'idle'
    : incoming.waktu_selesai
    ? 'done'
    : 'running';
  const editable = taskState === 'running';
  const [statusLabel, statusTone] = TASK_STATUS[taskState];
  const submitBlockReason =
    taskState === 'idle' ? 'Mulai task terlebih dahulu.' : null;

  async function submitChecksheet() {
    if (!incoming.waktu_mulai) {
      return notify('error', 'Task belum dimulai. Mulai task terlebih dahulu.');
    }
    const [p1, p2, p3, p4] = [0, 1, 2, 3].map(r);
    const complete =
      isFilled(p1.standar) &&
      isFilled(p1.hasil_check) &&
      isFilled(p1.keterangan) &&
      isFilled(p2.hasil_panjang) &&
      isFilled(p2.hasil_lebar) &&
      isFilled(p2.keterangan) &&
      isFilled(p3.hasil_check) &&
      isFilled(p3.keterangan) &&
      isFilled(p4.hasil_check) &&
      isFilled(p4.keterangan);
    if (!complete) {
      return notify('error', 'Checksheet belum terisi semua.');
    }

    setBusy(true);
    try {
      await axios.put(
        `${API_URL}/done/${incoming.id}`,
        {
          lama_pengerjaan: elapsedSeconds(incoming.waktu_mulai),
          catatan,
          hasil_check: results,
        },
        { withCredentials: true },
      );
      notify('success', 'Checksheet berhasil disimpan.');
      await getInspection();
    } catch (error: any) {
      notify(
        'error',
        error.response?.data?.msg ?? 'Checksheet gagal disimpan.',
      );
    } finally {
      setBusy(false);
    }
  }

  /* ---------- Data tampilan ---------- */
  const tanggal = convertTimeStampToDateOnly(incoming.createdAt);
  const waktuMulai = formatDateTime(incoming.waktu_mulai);
  const waktuSelesai = formatDateTime(incoming.waktu_selesai);
  const lamaPengerjaan =
    incoming.lama_pengerjaan != null
      ? formatDuration(incoming.lama_pengerjaan)
      : '-';

  const infoItems: [string, ReactNode][] = [
    ['Tanggal', tanggal],
    ['Jam', incoming.jam],
    ['Bagian', incoming.bagian],
    ['No. JO', incoming.no_jo],
    ['No. IO', incoming.no_io],
    ['Mesin', incoming.mesin],
    ['Operator', incoming.operator],
    ['Inspector', incoming.inspector],
    ['Shift', incoming.shift],
    ['Status JO', incoming.status_jo],
    ['Item', incoming.item],
  ];

  const keteranganField = (i: number) =>
    editable ? (
      <Choice
        name={`keterangan-${i}`}
        options={SESUAI}
        value={r(i).keterangan}
        onChange={(v) => updateResult(i, { keterangan: v })}
      />
    ) : (
      <ReadValue>{r(i).keterangan}</ReadValue>
    );

  const hasilChoice = (i: number, options: [string, string][]) =>
    editable ? (
      <Choice
        name={`hasil-${i}`}
        options={options}
        value={r(i).hasil_check}
        onChange={(v) => updateResult(i, { hasil_check: v })}
      />
    ) : (
      <ReadValue>{r(i).hasil_check}</ReadValue>
    );

  const printRows: [number, ReactNode, ReactNode, ReactNode, ReactNode][] = [
    [1, 'Register', r(0).standar, r(0).hasil_check, r(0).keterangan],
    [
      2,
      'Ukuran',
      'Job Order',
      <>
        <div>Panjang: {r(1).hasil_panjang} MM</div>
        <div>Lebar: {r(1).hasil_lebar} MM</div>
      </>,
      r(1).keterangan,
    ],
    [3, 'Ketajaman Pisau', 'Visual', r(2).hasil_check, r(2).keterangan],
    [4, 'Bentuk Jadi', 'Dummy', r(3).hasil_check, r(3).keterangan],
  ];

  return (
    <>
      {previewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Pratinjau cetak"
        >
          <div className="w-full max-w-5xl bg-white shadow-xl sm:rounded-xl">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b bg-white px-4 py-3 sm:rounded-t-xl">
              <h2 className="text-base font-semibold text-neutral-800">
                Pratinjau cetak
              </h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => printArea('print-area')}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Cetak
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewOpen(false)}
                  className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-600 hover:bg-neutral-50"
                >
                  Tutup
                </button>
              </div>
            </div>

            <div className="overflow-x-auto p-4 sm:p-6">
              <div id="print-area" className="min-w-[640px] bg-white">
                <table className="mb-4 w-full border-collapse text-left">
                  <tbody>
                    <tr>
                      <td className="border border-black p-2">
                        <div className="flex items-center gap-3">
                          <img src={ptcbl} alt="Logo" className="w-20" />
                          <span className="flex-1 text-center text-lg font-bold">
                            QUALITY ASSURANCE DEPARTMENT
                          </span>
                        </div>
                      </td>
                      <td
                        rowSpan={2}
                        className="border border-black p-2 font-bold"
                      >
                        No. Dok : {incoming.no_doc}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2 text-center font-bold">
                        POTONG JADI CHECKSHEET
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="mb-4 grid grid-cols-2 gap-x-4 gap-y-1 border border-black p-3">
                  {infoItems.map(([label, value]) => (
                    <div key={label} className="flex">
                      <span className="w-24 shrink-0 font-semibold">
                        {label}
                      </span>
                      <span>: {value}</span>
                    </div>
                  ))}
                </div>

                <div className="mb-4 grid grid-cols-2 gap-1 border border-black p-3">
                  {[
                    ['Waktu Mulai', waktuMulai],
                    ['Waktu Selesai', waktuSelesai],
                    ['Lama Pengerjaan', lamaPengerjaan],
                  ].map(([label, value]) => (
                    <div key={label} className="flex">
                      <span className="w-32 shrink-0 font-semibold">
                        {label}
                      </span>
                      <span>: {value}</span>
                    </div>
                  ))}
                </div>

                <table className="mb-4 w-full border-collapse border border-black text-left">
                  <thead>
                    <tr className="bg-gray-100">
                      {[
                        'No',
                        'Point Check',
                        'Standar',
                        'Hasil Check',
                        'Keterangan',
                      ].map((h) => (
                        <th key={h} className="border border-black p-2">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {printRows.map(([no, point, standar, hasil, ket]) => (
                      <tr key={no}>
                        <td className="border border-black p-2">{no}</td>
                        <td className="border border-black p-2">{point}</td>
                        <td className="border border-black p-2">{standar}</td>
                        <td className="border border-black p-2">{hasil}</td>
                        <td className="border border-black p-2">{ket}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="border border-black p-3">
                  <div className="mb-1 font-semibold">Catatan:</div>
                  <div>{incoming.catatan}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-5xl space-y-4 pb-28 md:pb-0">
        {notice && (
          <NoticeBanner notice={notice} onClose={() => setNotice(null)} />
        )}

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            submitChecksheet();
          }}
        >
          {/* Header */}
          <header
            className={`${cardCls} flex flex-wrap items-center justify-between gap-3`}
          >
            <div>
              <h1 className="text-lg font-semibold text-neutral-800">
                Checksheet potong jadi
              </h1>
              <p className="text-sm text-neutral-500">{incoming.no_jo}</p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone}`}
              >
                {statusLabel}
              </span>
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
              >
                Pratinjau
              </button>
            </div>
          </header>

          {/* Informasi job order */}
          <section className={cardCls}>
            <h2 className="mb-4 text-sm font-semibold text-neutral-800">
              Informasi job order
            </h2>
            <dl className="grid grid-cols-1 gap-x-8 gap-y-2.5 md:grid-cols-2">
              {infoItems.map(([label, value]) => (
                <Info
                  key={label}
                  label={label}
                  value={value}
                  wide={label === 'Item'}
                />
              ))}
            </dl>
          </section>

          {/* Waktu pengerjaan */}
          <section className={cardCls}>
            {taskState === 'idle' ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-neutral-800">
                    Task belum dimulai
                  </p>
                  <p className="text-sm text-neutral-500">
                    Mulai task untuk membuka form pengecekan.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={startTask}
                  disabled={busy}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#00B81D] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 sm:w-auto"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M12.7645 4.95136L3.63887 0.27536C1.96704 -0.581285 0 0.664567 0 2.58008V11.4199C0 13.3354 1.96704 14.5813 3.63887 13.7246L12.7645 9.04864C14.4118 8.20456 14.4118 5.79544 12.7645 4.95136Z"
                      fill="white"
                    />
                  </svg>
                  Mulai task
                </button>
              </div>
            ) : (
              <dl className="grid grid-cols-1 gap-x-8 gap-y-2.5 md:grid-cols-2">
                <Info label="Waktu mulai" value={waktuMulai} />
                <Info label="Waktu selesai" value={waktuSelesai} />
                <Info label="Lama pengerjaan" value={lamaPengerjaan} />
              </dl>
            )}
          </section>

          {/* Poin pengecekan */}
          {taskState === 'idle' ? (
            <p className={`${cardCls} text-center text-sm text-neutral-500`}>
              Checksheet akan muncul setelah task dimulai.
            </p>
          ) : (
            <section className="overflow-x-auto rounded-xl bg-white shadow-sm">
              <table className="w-full min-w-[760px] text-left">
                <thead className="border-b-8 border-[#D8EAFF] bg-gray-50 text-sm text-neutral-500">
                  <tr>
                    <th scope="col" className="w-12 px-3 py-3 font-semibold">
                      No
                    </th>
                    <th scope="col" className="w-44 px-3 py-3 font-semibold">
                      Point check
                    </th>
                    <th scope="col" className="px-3 py-3 font-semibold">
                      Standar
                    </th>
                    <th scope="col" className="px-3 py-3 font-semibold">
                      Hasil check
                    </th>
                    <th scope="col" className="px-3 py-3 font-semibold">
                      Keterangan
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y-8 divide-[#D8EAFF]">
                  <PointRow
                    no={1}
                    title="Register"
                    standar={
                      editable ? (
                        <Choice
                          name="standar-register"
                          options={[
                            ['ART WORK', 'Art work'],
                            ['CONTOH', 'Contoh'],
                          ]}
                          value={r(0).standar}
                          onChange={(v) => updateResult(0, { standar: v })}
                        />
                      ) : (
                        <ReadValue>{r(0).standar}</ReadValue>
                      )
                    }
                    hasil={hasilChoice(0, [
                      ['presisi', 'Presisi'],
                      ['tidak presisi', 'Tidak presisi'],
                    ])}
                    keterangan={keteranganField(0)}
                  />

                  <PointRow
                    no={2}
                    title="Ukuran"
                    standar={<ReadValue>Job Order</ReadValue>}
                    hasil={
                      editable ? (
                        <div className="space-y-3">
                          <UnitInput
                            required
                            label="Panjang"
                            unit="mm"
                            inputMode="decimal"
                            value={r(1).hasil_panjang ?? ''}
                            onChange={(e) =>
                              updateResult(1, { hasil_panjang: e.target.value })
                            }
                          />
                          <UnitInput
                            required
                            label="Lebar"
                            unit="mm"
                            inputMode="decimal"
                            value={r(1).hasil_lebar ?? ''}
                            onChange={(e) =>
                              updateResult(1, { hasil_lebar: e.target.value })
                            }
                          />
                        </div>
                      ) : (
                        <>
                          <ReadValue>
                            Panjang: {r(1).hasil_panjang} mm
                          </ReadValue>
                          <ReadValue>Lebar: {r(1).hasil_lebar} mm</ReadValue>
                        </>
                      )
                    }
                    keterangan={keteranganField(1)}
                  />

                  <PointRow
                    no={3}
                    title="Ketajaman pisau"
                    standar={<ReadValue>Visual</ReadValue>}
                    hasil={hasilChoice(2, [
                      ['rata', 'Rata'],
                      ['tidak rata', 'Tidak rata'],
                    ])}
                    keterangan={keteranganField(2)}
                  />

                  <PointRow
                    no={4}
                    title="Bentuk jadi"
                    standar={<ReadValue>Dummy</ReadValue>}
                    hasil={hasilChoice(3, [
                      ['ok', 'Ok'],
                      ['not ok', 'Not ok'],
                    ])}
                    keterangan={keteranganField(3)}
                  />
                </tbody>
              </table>
            </section>
          )}

          {/* Catatan */}
          <section className={cardCls}>
            <label
              htmlFor="catatan"
              className="text-sm font-semibold text-neutral-800"
            >
              Catatan
            </label>
            {editable ? (
              <textarea
                id="catatan"
                required
                rows={3}
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Tulis catatan hasil pengecekan"
                className={`${inputCls} mt-2 resize-y`}
              />
            ) : (
              <p className="mt-2 text-sm text-neutral-700">
                {incoming.catatan || '-'}
              </p>
            )}
          </section>

          {/* Aksi */}
          {incoming.status === 'incoming' && (
            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white p-3 md:static md:border-0 md:bg-transparent md:p-0">
              <div className="mx-auto flex max-w-5xl flex-col gap-2 md:flex-row md:items-center md:justify-end">
                {submitBlockReason && (
                  <p className="text-xs text-amber-700 md:text-sm">
                    {submitBlockReason}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={!!submitBlockReason || busy}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-neutral-300"
                >
                  {busy ? 'Menyimpan…' : 'Selesaikan checksheet'}
                </button>
              </div>
            </div>
          )}
        </form>
      </main>
    </>
  );
}

export default PotongJadiChecksheet;
