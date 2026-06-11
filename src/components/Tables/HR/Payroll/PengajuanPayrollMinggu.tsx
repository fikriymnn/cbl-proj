import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import convertTimeStampToDate from '../../../../utils/convertDate';
import formatInteger from '../../../../utils/formaterInteger';
import LogoSrc from '../../../../images/logo/logo-cbl 1.svg';

// ─── Icons ─────────────────────────────────────────────────────────────────────
const IconCalendar = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const IconPlus = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconTrash = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);
const IconX = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconSend = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);
const IconEye = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const IconUsers = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconChevronLeft = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const IconChevronRight = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const IconArrowLeft = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);
const IconDollar = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);
const IconFilter = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);
const IconPrinter = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
);

// ─── Build Slip Gaji HTML ──────────────────────────────────────────────────────
/**
 * Membangun dokumen HTML siap cetak berisi slip gaji mingguan.
 * Format: 2 kartu per baris, A4 portrait, mirip format PDF contoh.
 *
 * @param periodeData  - object periode dari API (berisi payroll_detail[])
 * @param logoDataUri  - base64 data URI logo perusahaan (kosongkan '' jika belum siap)
 */
const buildSlipGajiHTML = (
  periodeData: any,
  logoDataUri: string = '',
): string => {
  const employees: any[] = periodeData.payroll_detail ?? [];

  // Format angka ke string lokal tanpa simbol "Rp"
  const fmt = (val: any): string => {
    const n = Number(val);
    if (!n || isNaN(n)) return '-';
    return n.toLocaleString('id-ID');
  };

  // Format tanggal dari ISO string / timestamp
  const fmtDate = (val: any): string => {
    if (!val) return '';
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val);
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const periode = `${fmtDate(periodeData.periode_dari)} - ${fmtDate(
    periodeData.periode_sampai,
  )}`;

  // Logo: gunakan data URI jika tersedia, atau kotak placeholder abu-abu
  const logoImg = logoDataUri
    ? `<img src="${logoDataUri}" width="30" height="30" style="display:block;object-fit:contain;" alt=""/>`
    : `<div style="width:30px;height:30px;background:#cbd5e1;border-radius:3px;"></div>`;

  // ── Render satu kartu slip karyawan ──────────────────────────────────────────
  const renderCard = (emp: any): string => {
    const bio = emp.karyawan?.biodata_karyawan?.[0];
    const nik = bio?.nik ?? '';
    const name = emp.karyawan?.name ?? '';
    const jabatan = emp.jabatan.nama_jabatan ?? '';
    const namaDepartment =
      bio?.department?.nama_department ?? emp.nama_department ?? '';

    const bayaranItems: any[] =
      emp.detail_payroll?.filter((d: any) => d.tipe === 'bayaran') ?? [];
    const potonganItems: any[] =
      emp.detail_payroll?.filter((d: any) => d.tipe === 'potongan') ?? [];

    const labelMap: Record<string, string> = {
      tunjanganKopi: 'Tunjangan Kopi',
      uangHadir: 'Uang Hadir',
      uangLembur: 'Uang Lembur',
      uangMakanLembur: 'Uang Makan Lembur',
      upahHarian: 'Upah Harian',
      tunjanganKerjaMalam: 'Tunjangan Kerja Malam',
      upahHarianSakit: 'Upah Harian Sakit',
      // tambah mapping lain di sini sesuai kebutuhan
    };

    const fmtLabel = (raw: string): string => {
      if (labelMap[raw]) return labelMap[raw];
      // fallback: pisah camelCase dengan spasi jika tidak ada di map
      return raw
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (c) => c.toUpperCase())
        .trim();
    };

    // Baris data: isi sisi kosong dengan &nbsp; agar tinggi seragam
    const maxRows = Math.max(bayaranItems.length, potonganItems.length, 1);
    let dataRows = '';
    for (let i = 0; i < maxRows; i++) {
      const b = bayaranItems[i];
      const p = potonganItems[i];

      const leftCells = b
        ? `<td style="padding:1.5px 5px;font-size:9.5px;white-space:nowrap;max-width:90px;overflow:hidden;text-overflow:ellipsis;">${
            b.label
          }</td>
           <td style="padding:1.5px 2px;font-size:9.5px;">:</td>
           <td style="padding:1.5px 5px;font-size:9.5px;text-align:right;white-space:nowrap;">${fmt(
             b.total,
           )}</td>`
        : `<td colspan="3" style="padding:1.5px 5px;">&nbsp;</td>`;
      const rightCells = p
        ? `<td style="padding:1.5px 5px;font-size:9.5px;white-space:nowrap;max-width:90px;overflow:hidden;text-overflow:ellipsis;">${
            p.label
          }</td>
           <td style="padding:1.5px 2px;font-size:9.5px;">:</td>
           <td style="padding:1.5px 5px;font-size:9.5px;text-align:right;white-space:nowrap;">${fmt(
             p.total,
           )}</td>`
        : `<td colspan="3" style="padding:1.5px 5px;">&nbsp;</td>`;
      dataRows += `<tr style="vertical-align:top;">${leftCells}${rightCells}</tr>`;
    }

    const totalBayaran = bayaranItems.reduce(
      (sum, item) => sum + Number(item.total || 0),
      0,
    );

    const totalPotongan = potonganItems.reduce(
      (sum, item) => sum + Number(item.total || 0),
      0,
    );

    return `
<div style="
  flex:0 0 49%;
  max-width:49%;
  display:flex;
  flex-direction:column;
  border:1.5px solid #1a1a1a;
  font-family:Arial,Helvetica,sans-serif;
  font-size:9.5px;
  margin-bottom:0;
  page-break-inside:avoid;
  background:#fff;
">

  <!-- HEADER PERUSAHAAN -->
  <div style="display:flex;align-items:center;gap:5px;">
    <div style="flex:1;text-align:center;line-height:1.4;">
      <div style="font-size:9px;font-weight:bold;letter-spacing:0.2px;">PT. Cahaya Berlian Lestari Offset</div>
    </div>
  </div>

  <!-- INFO KARYAWAN (2 kolom) -->
  <div style="display:flex;border-bottom:1px solid #bbb;">
    <!-- kiri -->
    <div style="width:60%;padding:3px 5px;">
      <table style="border-collapse:collapse;width:100%;">
        <tr>
          <td style="padding:1px 0;white-space:nowrap;font-size:8.5px;color:#444;">NIK / Nama</td>
          <td style="padding:1px 3px;font-size:8.5px;">:</td>
          <td style="padding:1px 0;font-size:8.5px;">${nik} - ${name}</td>
        </tr>
        <tr>
          <td style="padding:1px 0;white-space:nowrap;font-size:8.5px;color:#444;">Nama Departement</td>
          <td style="padding:1px 3px;font-size:8.5px;">:</td>
          <td style="padding:1px 0;font-size:8.5px;">${namaDepartment}</td>
        </tr>
      </table>
    </div>
    <!-- kanan -->
    <div style="width:40%;padding:3px 3px;">
      <table style="border-collapse:collapse;width:100%;">
        <tr>
          <td style="padding:1px 0;white-space:nowrap;font-size:8.5px;color:#444;">Jabatan</td>
          <td style="padding:1px 3px;font-size:8.5px;">:</td>
          <td style="padding:1px 0;font-size:8.5px;">${jabatan}</td>
        </tr>
        <tr>
          <td style="padding:1px 0;white-space:nowrap;font-size:8.5px;color:#444;">Periode</td>
          <td style="padding:1px 3px;font-size:8.5px;">:</td>
          <td style="padding:1px 0;font-size:8.5px;">${periode}</td>
        </tr>
      </table>
    </div>
  </div>

  <!-- HEADER KOLOM -->
  <div style="display:flex;border-bottom:1px solid #bbb;background:#f8fafc;">
    <div style="flex:1;padding:2px 5px;font-size:8px;font-weight:bold;text-align:center;border-right:1px solid #bbb;text-decoration:underline;letter-spacing:0.5px;">PENDAPATAN</div>
    <div style="flex:1;padding:2px 5px;font-size:8px;font-weight:bold;text-align:center;text-decoration:underline;letter-spacing:0.5px;">POTONGAN</div>
  </div>

  <!-- DATA BARIS -->
  <div style="display:flex;min-height:100px;flex-grow:1;">
    <!-- pendapatan -->
    <div style="flex:1;border-right:1px solid #bbb;padding:2px 0;">
      <table style="border-collapse:collapse;width:100%;">
        ${
          bayaranItems.length === 0
            ? `<tr><td style="padding:2px 5px;font-size:9px;color:#aaa;font-style:italic;">-</td></tr>`
            : bayaranItems
                .map(
                  (b) => `
        <tr>
          <td style="padding:1.5px 5px;font-size:9.5px;white-space:nowrap;">${fmtLabel(
            b.label,
          )}</td>
          <td style="padding:1.5px 2px;font-size:9.5px;">:</td>
          <td style="padding:1.5px 5px;font-size:9.5px;text-align:right;white-space:nowrap;">${fmt(
            b.total,
          )}</td>
        </tr>`,
                )
                .join('')
        }
      </table>
    </div>
    <!-- potongan -->
    <div style="flex:1;padding:2px 0;">
      <table style="border-collapse:collapse;width:100%;">
        ${
          potonganItems.length === 0
            ? `<tr><td style="padding:2px 5px;font-size:9px;color:#aaa;font-style:italic;">-</td></tr>`
            : potonganItems
                .map(
                  (p) => `
        <tr>
          <td style="padding:1.5px 5px;font-size:9.5px;white-space:nowrap;">${
            p.label
          }</td>
          <td style="padding:1.5px 2px;font-size:9.5px;">:</td>
          <td style="padding:1.5px 5px;font-size:9.5px;text-align:right;white-space:nowrap;">${fmt(
            p.total,
          )}</td>
        </tr>`,
                )
                .join('')
        }
      </table>
    </div>
  </div>

  <!-- ROW JUMLAH -->
  <div style="display:flex;border-top:1.5px solid #1a1a1a;">
    <div style="flex:1;display:flex;justify-content:space-between;padding:2px 5px;border-right:1.5px solid #1a1a1a;">
      <span style="font-size:9px;font-weight:bold;">JUMLAH</span>
      <span style="font-size:9px;font-weight:bold;">${fmt(totalBayaran)}</span>
    </div>
    <div style="flex:1;display:flex;justify-content:space-between;padding:2px 5px;">
      <span style="font-size:9px;font-weight:bold;">JUMLAH</span>
      <span style="font-size:9px;font-weight:bold;">${fmt(totalPotongan)}</span>
    </div>
  </div>

  <!-- TOTAL TNJ -->
  <div style="display:flex;border-top:1px solid #ccc;background:#f1f5f9;">
  <div style="flex:1;display:flex;justify-content:space-between;padding:2px 5px;">
    <span style="font-size:9px;font-weight:bold;">Total TNJ</span>
    <span style="font-size:10px;font-weight:900;">${fmt(
      emp.sub_total_upah,
    )}</span>
  </div>
  <div style="flex:1;padding:2px 5px;">
    <!-- kosong, sejajar kolom potongan -->
  </div>
</div>

</div>`;
  };

  // ── Susun kartu 2 per baris ──────────────────────────────────────────────────
  const cards = employees.map(renderCard);
  const rows: string[] = [];
  for (let i = 0; i < cards.length; i += 2) {
    const pair = cards.slice(i, i + 2).join('\n');
    rows.push(
      `<div style="width:100%;display:flex;align-items:stretch;justify-content:flex-start;gap:2%;page-break-inside:avoid;margin-bottom:4mm;">${pair}</div>`,
    );
  }

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Slip Gaji Mingguan</title>
  <style>
    @page { size: A4 portrait; margin: 10mm 8mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, Helvetica, sans-serif; background: white; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  ${rows.join('\n')}
</body>
</html>`;
};

// ─── Trigger Print ke iframe ───────────────────────────────────────────────────
function triggerPrintSlip(periodeData: any, logoDataUri: string = '') {
  const html = buildSlipGajiHTML(periodeData, logoDataUri);
  const iframe = document.createElement('iframe');
  iframe.style.cssText =
    'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;border:none;';
  document.body.appendChild(iframe);
  const iDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iDoc) {
    document.body.removeChild(iframe);
    return;
  }
  iDoc.open();
  iDoc.write(html);
  iDoc.close();
  iframe.onload = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } finally {
      setTimeout(() => {
        document.body.removeChild(iframe);
        window.focus();
      }, 1000);
    }
  };
}

// ─── Status Badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<
    string,
    { bg: string; text: string; dot: string; label: string }
  > = {
    draft: {
      bg: 'bg-slate-100',
      text: 'text-slate-600',
      dot: 'bg-slate-400',
      label: 'Draft',
    },
    'incoming approved': {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      dot: 'bg-amber-500',
      label: 'Menunggu Approval',
    },
    'incoming pay': {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      dot: 'bg-blue-500',
      label: 'Siap Bayar',
    },
    done: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      dot: 'bg-emerald-500',
      label: 'Selesai',
    },
  };
  const s = map[status?.toLowerCase()] ?? {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    dot: 'bg-slate-400',
    label: status,
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

// ─── Spinner ──────────────────────────────────────────────────────────────────
const Spinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-9 h-9 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
  </div>
);

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ msg, type }: { msg: string; type: 'success' | 'error' }) => (
  <div
    className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-medium ${
      type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-500 text-white'
    }`}
  >
    <span className="text-base">{type === 'success' ? '✓' : '✕'}</span>
    {msg}
  </div>
);

// ─── Add/Edit Item Form ───────────────────────────────────────────────────────
interface AddItemFormProps {
  idPayrollMingguan: number;
  onSuccess: () => void;
  onClose: () => void;
}
function AddItemForm({
  idPayrollMingguan,
  onSuccess,
  onClose,
}: AddItemFormProps) {
  const [form, setForm] = useState({
    label: '',
    jumlah: 1,
    nilai: '',
    tipe: 'bayaran',
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const total = Number(form.jumlah) * Number(form.nilai || 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.label || !form.nilai) {
      setErr('Label dan nilai harus diisi');
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_LINK}/hr/payroll/bayarMingguan/detail`,
        {
          id_payroll_mingguan: idPayrollMingguan,
          jumlah: Number(form.jumlah),
          label: form.label,
          nilai: Number(form.nilai),
          total,
          tipe: form.tipe,
        },
        { withCredentials: true },
      );
      onSuccess();
    } catch {
      setErr('Gagal menyimpan. Coba lagi.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          Tipe
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['bayaran', 'potongan'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setForm({ ...form, tipe: t })}
              className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                form.tipe === t
                  ? t === 'bayaran'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-red-500 text-white border-red-500'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
              }`}
            >
              {t === 'bayaran' ? '＋ Pendapatan' : '－ Potongan'}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
          Label / Keterangan
        </label>
        <input
          type="text"
          value={form.label}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
          placeholder="cth: Bonus Kehadiran, Kasbon, dll"
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Jumlah
          </label>
          <input
            type="number"
            min={1}
            value={form.jumlah}
            onChange={(e) =>
              setForm({ ...form, jumlah: Number(e.target.value) })
            }
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Nilai / Satuan (Rp)
          </label>
          <input
            type="number"
            min={0}
            value={form.nilai}
            onChange={(e) => setForm({ ...form, nilai: e.target.value })}
            placeholder="0"
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div
        className={`rounded-xl px-4 py-3 flex justify-between items-center border ${
          form.tipe === 'bayaran'
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-red-50 border-red-200'
        }`}
      >
        <span className="text-xs font-bold text-slate-500">TOTAL</span>
        <span
          className={`text-lg font-bold ${
            form.tipe === 'bayaran' ? 'text-emerald-700' : 'text-red-600'
          }`}
        >
          {form.tipe === 'potongan' ? '−' : '+'} Rp {formatInteger(total)}
        </span>
      </div>
      {err && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {err}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 border border-slate-200 text-slate-600 text-sm font-semibold py-2.5 rounded-xl hover:bg-slate-50 transition"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={loading}
          className={`flex-1 flex items-center justify-center gap-2 text-white text-sm font-semibold py-2.5 rounded-xl transition disabled:opacity-60 ${
            form.tipe === 'bayaran'
              ? 'bg-emerald-600 hover:bg-emerald-700'
              : 'bg-red-500 hover:bg-red-600'
          }`}
        >
          {loading ? 'Menyimpan…' : 'Simpan'}
        </button>
      </div>
    </form>
  );
}

// ─── Level 3: Employee Detail Modal ──────────────────────────────────────────
interface EmployeeDetailModalProps {
  employee: any;
  periodeData: any;
  onClose: () => void;
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}
function EmployeeDetailModal({
  employee,
  periodeData,
  onClose,
  onRefresh,
  showToast,
}: EmployeeDetailModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [employeeData, setEmployeeData] = useState<any>(employee);
  const biodata = employeeData.karyawan?.biodata_karyawan?.[0];
  const isDraft =
    periodeData.status?.toLowerCase() === 'draft' ||
    periodeData.status?.toLowerCase() === 'rejected';

  async function refreshEmployee() {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_LINK}/hr/payroll/bayarMingguanPeriode`,
        { withCredentials: true },
      );
      const periods: any[] = res.data?.data ?? [];
      for (const p of periods) {
        const found = p.payroll_detail?.find(
          (e: any) => e.id === employeeData.id,
        );
        if (found) {
          setEmployeeData(found);
          break;
        }
      }
      onRefresh();
    } catch {
      /* silently fail */
    }
  }

  async function deleteDetail(idDetail: number) {
    if (!confirm('Hapus item ini?')) return;
    setIsLoading(true);
    try {
      await axios.put(
        `${
          import.meta.env.VITE_API_LINK
        }/hr/payroll/bayarMingguan/detail/delete`,
        {
          id_payroll_mingguan: employeeData.id,
          id_payroll_mingguan_detail: idDetail,
        },
        { withCredentials: true },
      );
      showToast('Item berhasil dihapus');
      await refreshEmployee();
    } catch {
      showToast('Gagal menghapus item', 'error');
    } finally {
      setIsLoading(false);
    }
  }

  const bayaranItems =
    employeeData.detail_payroll?.filter((d: any) => d.tipe === 'bayaran') ?? [];
  const potonganItems =
    employeeData.detail_payroll?.filter((d: any) => d.tipe === 'potongan') ??
    [];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200 flex-shrink-0">
          <div>
            <h3 className="font-bold text-slate-800 text-base">
              {employee.karyawan?.name}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              NIK {biodata?.nik} ·{' '}
              {biodata?.department?.nama_department ?? employee.nama_department}{' '}
              / {employee.nama_divisi}
            </p>
            <div className="flex items-center gap-2 mt-1">
              {employeeData.tipe_penggajian && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-50 text-violet-700 border border-violet-200 capitalize">
                  {employeeData.tipe_penggajian}
                </span>
              )}
              {employeeData.tipe_karyawan && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200 capitalize">
                  {employeeData.tipe_karyawan}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition"
          >
            <IconX />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: 'Total Upah',
                value: `Rp ${formatInteger(employee.total_upah)}`,
                cls: 'bg-emerald-50 border-emerald-200 text-emerald-700',
              },
              {
                label: 'Total Potongan',
                value: `Rp ${formatInteger(employee.total_potongan)}`,
                cls: 'bg-red-50 border-red-200 text-red-700',
              },
              {
                label: 'Sub Total',
                value: `Rp ${formatInteger(employee.sub_total_upah)}`,
                cls: 'bg-blue-50 border-blue-200 text-blue-800',
              },
            ].map((c) => (
              <div key={c.label} className={`rounded-xl border p-3 ${c.cls}`}>
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-1">
                  {c.label}
                </div>
                <div className="font-bold text-sm">{c.value}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-slate-50 rounded-xl p-3 space-y-1.5">
              <InfoRow
                label="Periode"
                value={`${convertTimeStampToDate(
                  periodeData.periode_dari,
                )} — ${convertTimeStampToDate(periodeData.periode_sampai)}`}
              />
              <InfoRow
                label="Tipe Penggajian"
                value={employee.tipe_penggajian ?? '—'}
              />
              <InfoRow
                label="Yang Menyetujui"
                value={employee.karyawan_hr?.name ?? '—'}
              />
            </div>
            <div className="bg-slate-50 rounded-xl p-3 space-y-1.5">
              <InfoRow
                label="Pengurangan/Penambahan"
                value={`Rp ${formatInteger(employee.pengurangan_penambahan)}`}
              />
              <InfoRow
                label="Catatan"
                value={employee.note_pengurangan_penambahan ?? '—'}
              />
              <InfoRow
                label="Insentif"
                value={`Rp ${formatInteger(employee.insentif ?? 0)}`}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <DetailTable
              title="Pendapatan"
              color="emerald"
              items={bayaranItems}
              canDelete={isDraft}
              onDelete={deleteDetail}
            />
            <DetailTable
              title="Potongan"
              color="red"
              items={potonganItems}
              canDelete={isDraft}
              onDelete={deleteDetail}
            />
          </div>
          {isDraft &&
            (addItemOpen ? (
              <div className="border border-slate-200 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-slate-700 text-sm">
                    Tambah Item
                  </h4>
                  <button
                    onClick={() => setAddItemOpen(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <IconX />
                  </button>
                </div>
                <AddItemForm
                  idPayrollMingguan={employee.id}
                  onSuccess={() => {
                    setAddItemOpen(false);
                    onRefresh();
                    showToast('Item berhasil ditambahkan');
                  }}
                  onClose={() => setAddItemOpen(false)}
                />
              </div>
            ) : (
              <button
                onClick={() => setAddItemOpen(true)}
                className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 text-slate-500 hover:text-blue-600 text-sm font-semibold py-3 rounded-xl transition-all"
              >
                <IconPlus /> Tambah Pendapatan / Potongan
              </button>
            ))}
        </div>

        {isLoading && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        {label}
      </span>
      <div className="text-xs font-semibold text-slate-700 mt-0.5">{value}</div>
    </div>
  );
}

function DetailTable({
  title,
  color,
  items,
  canDelete,
  onDelete,
}: {
  title: string;
  color: 'emerald' | 'red';
  items: any[];
  canDelete: boolean;
  onDelete: (id: number) => void;
}) {
  const hdr = color === 'emerald' ? 'bg-emerald-600' : 'bg-red-500';
  return (
    <div className="rounded-xl overflow-hidden border border-slate-200">
      <div
        className={`${hdr} text-white text-xs font-bold uppercase tracking-wider px-3 py-2`}
      >
        {title}
      </div>
      {items.length === 0 ? (
        <div className="text-xs text-slate-400 italic text-center py-5">
          Tidak ada data
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {items.map((item: any, i: number) => (
            <div
              key={i}
              className="flex items-center justify-between px-3 py-2 group hover:bg-slate-50 text-xs"
            >
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-700 truncate">
                  {item.label}
                </div>
                <div className="text-slate-400">
                  {item.jumlah} × Rp {formatInteger(Number(item.nilai))}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                <span
                  className={`font-bold ${
                    color === 'emerald' ? 'text-emerald-700' : 'text-red-600'
                  }`}
                >
                  Rp {formatInteger(Number(item.total))}
                </span>
                {canDelete && item.id && (
                  <button
                    onClick={() => onDelete(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition p-0.5 rounded"
                  >
                    <IconTrash />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Level 2: Period Detail Modal ─────────────────────────────────────────────
interface PeriodDetailModalProps {
  periode: any;
  onClose: () => void;
  onRefresh: () => void;
  onPay: (id: number) => void;
  onSubmit: (id: number) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}
function PeriodDetailModal({
  periode,
  onClose,
  onRefresh,
  onPay,
  onSubmit,
  showToast,
}: PeriodDetailModalProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [localPeriode, setLocalPeriode] = useState<any>(periode);
  const [isFetching, setIsFetching] = useState(false);
  const [filterTipePenggajian, setFilterTipePenggajian] = useState('');
  const [filterTipeKaryawan, setFilterTipeKaryawan] = useState('');
  const [logoBase64, setLogoBase64] = useState<string>('');

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        setLogoBase64(canvas.toDataURL('image/png'));
      }
    };
    img.onerror = () => setLogoBase64(LogoSrc);
    img.src = LogoSrc;
  }, []);

  const tipePenggajianOptions: string[] = [
    ...new Set(
      (localPeriode.payroll_detail ?? [])
        .map((d: any) => d.tipe_penggajian)
        .filter(Boolean),
    ),
  ] as string[];

  const tipeKaryawanOptions: string[] = [
    ...new Set(
      (localPeriode.payroll_detail ?? [])
        .map((d: any) => d.tipe_karyawan)
        .filter(Boolean),
    ),
  ] as string[];

  const hasActiveFilter = filterTipePenggajian || filterTipeKaryawan;

  async function refreshLocalPeriode() {
    setIsFetching(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_LINK}/hr/payroll/bayarMingguanPeriode`,
        { withCredentials: true },
      );
      const fresh = (res.data?.data ?? []).find(
        (p: any) => p.id === localPeriode.id,
      );
      if (fresh) {
        setLocalPeriode(fresh);
        if (selectedEmployee) {
          const freshEmp = fresh.payroll_detail?.find(
            (e: any) => e.id === selectedEmployee.id,
          );
          if (freshEmp) setSelectedEmployee(freshEmp);
        }
      }
      onRefresh();
    } catch {
      showToast('Gagal memperbarui data', 'error');
    } finally {
      setIsFetching(false);
    }
  }

  const filtered = (localPeriode.payroll_detail ?? []).filter((d: any) => {
    const name = d.karyawan?.name?.toLowerCase() ?? '';
    const nik = d.karyawan?.biodata_karyawan?.[0]?.nik ?? '';
    const q = search.toLowerCase();
    const matchSearch = name.includes(q) || nik.includes(q);
    const matchPenggajian =
      !filterTipePenggajian || d.tipe_penggajian === filterTipePenggajian;
    const matchKaryawan =
      !filterTipeKaryawan || d.tipe_karyawan === filterTipeKaryawan;
    return matchSearch && matchPenggajian && matchKaryawan;
  });
  // ── Tombol print slip untuk periode ini ────────────────────────────────────
  function handlePrintSlip() {
    const filteredPeriode = {
      ...localPeriode,
      payroll_detail: filtered,
    };
    triggerPrintSlip(filteredPeriode, logoBase64 || LogoSrc);
  }

  const totalKaryawan = localPeriode.payroll_detail?.length ?? 0;
  const isDraft =
    localPeriode.status?.toLowerCase() === 'draft' ||
    localPeriode.status?.toLowerCase() === 'rejected';
  const isIncomingPay = localPeriode.status?.toLowerCase() === 'incoming pay';
  // Kumpulkan semua label bayaran unik dari karyawan yang terfilter
  const allBayaranLabels: string[] = useMemo(() => {
    const labelSet = new Set<string>();
    filtered.forEach((emp: any) => {
      (emp.detail_payroll ?? [])
        .filter((d: any) => d.tipe === 'bayaran')
        .forEach((d: any) => labelSet.add(d.label));
    });
    return Array.from(labelSet);
  }, [filtered]);

  const labelMap: Record<string, string> = {
    tunjanganKopi: 'Tunjangan Kopi',
    uangHadir: 'Uang Hadir',
    uangLembur: 'Uang Lembur',
    uangMakanLembur: 'Uang Makan Lembur',
    upahHarian: 'Upah Harian',
    tunjanganKerjaMalam: 'Tunjangan Kerja Malam',
    upahHarianSakit: 'Upah Harian Sakit',
    // tambah mapping lain di sini sesuai kebutuhan
  };

  const fmtLabel = (raw: string): string => {
    if (labelMap[raw]) return labelMap[raw];
    // fallback: pisah camelCase dengan spasi jika tidak ada di map
    return raw
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (c) => c.toUpperCase())
      .trim();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-7xl mx-4 max-h-[90vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 flex-shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-700 transition p-1 rounded-lg hover:bg-slate-100"
              >
                <IconArrowLeft />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-slate-800">
                    {convertTimeStampToDate(localPeriode.periode_dari)} —{' '}
                    {convertTimeStampToDate(localPeriode.periode_sampai)}
                  </h2>
                  <StatusBadge status={localPeriode.status} />
                  {isFetching && (
                    <span className="w-4 h-4 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin inline-block" />
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {totalKaryawan} karyawan · Total Rp{' '}
                  {formatInteger(localPeriode.total)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* ── [NEW] Tombol Print Slip – selalu tampil ── */}
              <button
                onClick={handlePrintSlip}
                className="flex items-center gap-1.5 bg-violet-50 hover:bg-violet-600 hover:text-white text-violet-700 text-xs font-bold px-3 py-2 rounded-xl border border-violet-200 hover:border-violet-600 transition-all active:scale-95"
              >
                <IconPrinter /> Print Slip
              </button>

              {isDraft && (
                <button
                  onClick={() => onSubmit(localPeriode.id)}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition active:scale-95"
                >
                  <IconSend /> Ajukan
                </button>
              )}
              {isIncomingPay && (
                <button
                  onClick={() => onPay(localPeriode.id)}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition active:scale-95"
                >
                  <IconDollar /> Bayar
                </button>
              )}
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-700 transition"
              >
                <IconX />
              </button>
            </div>
          </div>

          {/* Search + Filter bar */}
          <div className="px-6 py-3 border-b border-slate-100 flex-shrink-0 bg-slate-50 space-y-2">
            <div className="relative max-w-sm">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Cari nama atau NIK…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl bg-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {tipePenggajianOptions.length > 0 && (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <IconFilter />
                  </span>
                  <select
                    value={filterTipePenggajian}
                    onChange={(e) => setFilterTipePenggajian(e.target.value)}
                    className="pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-xl bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Semua Tipe Penggajian</option>
                    {tipePenggajianOptions.map((t) => (
                      <option key={t} value={t} className="capitalize">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {tipeKaryawanOptions.length > 0 && (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <IconFilter />
                  </span>
                  <select
                    value={filterTipeKaryawan}
                    onChange={(e) => setFilterTipeKaryawan(e.target.value)}
                    className="pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-xl bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Semua Tipe Karyawan</option>
                    {tipeKaryawanOptions.map((t) => (
                      <option key={t} value={t} className="capitalize">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {filterTipePenggajian && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200">
                  <span className="capitalize">{filterTipePenggajian}</span>
                  <button
                    onClick={() => setFilterTipePenggajian('')}
                    className="hover:text-violet-900 transition"
                  >
                    <IconX />
                  </button>
                </span>
              )}
              {filterTipeKaryawan && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
                  <span className="capitalize">{filterTipeKaryawan}</span>
                  <button
                    onClick={() => setFilterTipeKaryawan('')}
                    className="hover:text-cyan-900 transition"
                  >
                    <IconX />
                  </button>
                </span>
              )}
              {hasActiveFilter && (
                <button
                  onClick={() => {
                    setFilterTipePenggajian('');
                    setFilterTipeKaryawan('');
                  }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-red-600 bg-slate-100 hover:bg-red-50 border border-slate-200 hover:border-red-200 px-3 py-2 rounded-xl transition-all"
                >
                  <IconX /> Reset Filter
                </button>
              )}
            </div>
          </div>

          {/* Employee table */}
          <div className="overflow-y-auto overflow-x-auto flex-1">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-20">
                <tr>
                  {/* Kolom # */}
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 text-left whitespace-nowrap sticky left-0 z-20 bg-slate-50">
                    #
                  </th>
                  {/* NIK */}
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 text-left whitespace-nowrap sticky left-[52px] z-20 bg-slate-50 border-r border-slate-200">
                    NIK
                  </th>
                  {/* Nama */}
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 text-left whitespace-nowrap sticky left-[115px] z-20 bg-slate-50 border-r border-slate-200">
                    Nama
                  </th>

                  {[
                    'Department',
                    'Divisi',
                    'Tipe Penggajian',
                    'Tipe Karyawan',
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-xs font-bold text-slate-500 text-left whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}

                  {allBayaranLabels.map((label) => (
                    <th
                      key={label}
                      className="px-4 py-3 text-xs font-bold text-emerald-600 text-right whitespace-nowrap"
                    >
                      {fmtLabel(label)}
                    </th>
                  ))}

                  {['Potongan', 'Sub Total', 'Aksi'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-xs font-bold text-slate-500 text-left whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((emp: any, i: number) => {
                  const bio = emp.karyawan?.biodata_karyawan?.[0];

                  const bayaranMap: Record<string, number> = {};
                  (emp.detail_payroll ?? [])
                    .filter((d: any) => d.tipe === 'bayaran')
                    .forEach((d: any) => {
                      bayaranMap[d.label] =
                        (bayaranMap[d.label] ?? 0) + Number(d.total);
                    });

                  return (
                    <tr
                      key={emp.id ?? i}
                      className="hover:bg-slate-50 transition-colors group"
                    >
                      {/* # */}
                      <td className="px-4 py-3 text-slate-400 text-xs sticky left-0 z-10 bg-white group-hover:bg-slate-50">
                        {i + 1}
                      </td>
                      {/* NIK */}
                      <td className="px-4 py-3 sticky left-[52px] z-10 bg-white group-hover:bg-slate-50 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]">
                        <span className="font-mono text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          {bio?.nik ?? '—'}
                        </span>
                      </td>
                      {/* Nama */}
                      <td className="px-4 py-3 font-medium text-slate-800 text-xs sticky left-[115px] z-10 bg-white group-hover:bg-slate-50 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]">
                        {emp.karyawan?.name ?? '—'}
                      </td>

                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {bio?.department?.nama_department ??
                          emp.nama_department ??
                          '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">
                        {emp.nama_divisi ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">
                        {emp.tipe_penggajian ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">
                        {emp.tipe_karyawan ?? '—'}
                      </td>

                      {allBayaranLabels.map((label) => (
                        <td
                          key={label}
                          className="px-4 py-3 text-right text-xs text-emerald-700 font-semibold"
                        >
                          {bayaranMap[label] != null ? (
                            `Rp ${formatInteger(bayaranMap[label])}`
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                      ))}

                      <td className="px-4 py-3 text-right text-xs text-red-600 font-semibold">
                        {emp.total_potongan > 0 ? (
                          `Rp ${formatInteger(emp.total_potongan)}`
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-bold text-slate-800">
                        Rp {formatInteger(emp.sub_total_upah)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setSelectedEmployee(emp)}
                          className="inline-flex items-center gap-1 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-600 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all"
                        >
                          <IconEye /> Detail
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={10 + allBayaranLabels.length}
                      className="text-center py-12 text-slate-400 text-sm"
                    >
                      Tidak ada data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between flex-shrink-0">
            <span className="text-xs text-slate-500">
              {filtered.length} dari {totalKaryawan} karyawan ditampilkan
            </span>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-xs text-slate-500">Total Keseluruhan</span>
              <span className="font-bold text-slate-800">
                Rp {formatInteger(periode.total)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {selectedEmployee && (
        <EmployeeDetailModal
          employee={selectedEmployee}
          periodeData={localPeriode}
          onClose={() => setSelectedEmployee(null)}
          onRefresh={refreshLocalPeriode}
          showToast={showToast}
        />
      )}
    </>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
function PengajuanPayrollMinggu() {
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [payWeek, setPayWeek] = useState<any>(null);
  const [selectedPeriode, setSelectedPeriode] = useState<any>(null);
  const [toast, setToast] = useState<{
    msg: string;
    type: 'success' | 'error';
  } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetchPayroll();
  }, [page]);

  async function fetchPayroll() {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_LINK}/hr/payroll/bayarMingguanPeriode`,
        { params: { page, limit: 10 }, withCredentials: true },
      );
      setPayWeek(res.data);
    } catch {
      showToast('Gagal memuat data', 'error');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(id: number) {
    if (!confirm('Ajukan payroll ini untuk approval?')) return;
    setIsLoading(true);
    try {
      await axios.put(
        `${
          import.meta.env.VITE_API_LINK
        }/hr/payroll/bayarMingguanPeriode/submit/${id}`,
        {},
        { withCredentials: true },
      );
      showToast('Payroll berhasil diajukan!');
      fetchPayroll();
      setSelectedPeriode((prev: any) => (prev?.id === id ? null : prev));
    } catch {
      showToast('Gagal mengajukan', 'error');
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePay(id: number) {
    if (!confirm('Konfirmasi pembayaran payroll ini?')) return;
    setIsLoading(true);
    try {
      await axios.put(
        `${
          import.meta.env.VITE_API_LINK
        }/hr/payroll/bayarMingguanPeriode/bayar/${id}`,
        {},
        { withCredentials: true },
      );
      showToast('Pembayaran berhasil!');
      fetchPayroll();
      setSelectedPeriode(null);
    } catch {
      showToast('Gagal membayar', 'error');
    } finally {
      setIsLoading(false);
    }
  }

  const totalPage = payWeek?.total_page ?? 1;
  const periodeList: any[] = payWeek?.data ?? [];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-30">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">
              Pengajuan Payroll Mingguan
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Daftar periode payroll — lihat detail, edit, dan ajukan
            </p>
          </div>
          {payWeek && (
            <div className="text-xs text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">
              {periodeList.length} periode dimuat
            </div>
          )}
        </div>
      </div>

      <div className="px-6 py-5 mx-auto">
        {isLoading && <Spinner />}

        {!isLoading && periodeList.length > 0 && (
          <>
            <div className="space-y-3">
              {periodeList.map((periode: any, i: number) => {
                const totalKaryawan = periode.payroll_detail?.length ?? 0;
                const isDraft =
                  periode.status?.toLowerCase() === 'draft' ||
                  periode.status?.toLowerCase() === 'rejected';
                const isIncomingPay =
                  periode.status?.toLowerCase() === 'incoming pay';
                const tipePenggajianSet = [
                  ...new Set(
                    (periode.payroll_detail ?? [])
                      .map((d: any) => d.tipe_penggajian)
                      .filter(Boolean),
                  ),
                ] as string[];
                const tipeKaryawanSet = [
                  ...new Set(
                    (periode.payroll_detail ?? [])
                      .map((d: any) => d.tipe_karyawan)
                      .filter(Boolean),
                  ),
                ] as string[];

                return (
                  <div
                    key={periode.id ?? i}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                  >
                    <div className="flex items-center gap-4 px-5 py-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {(page - 1) * 10 + i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-800 text-sm">
                            {convertTimeStampToDate(periode.periode_dari)}
                            <span className="text-slate-400 mx-1.5">→</span>
                            {convertTimeStampToDate(periode.periode_sampai)}
                          </span>
                          <StatusBadge status={periode.status} />
                        </div>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <IconUsers /> {totalKaryawan} karyawan
                          </span>
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <IconCalendar /> Dibuat{' '}
                            {convertTimeStampToDate(periode.tgl_bayar)}
                          </span>
                          {periode.payroll_detail?.[0]?.karyawan_hr?.name && (
                            <>
                              <span className="text-xs text-slate-400">·</span>
                              <span className="text-xs text-slate-400">
                                Disetujui:{' '}
                                {periode.payroll_detail[0].karyawan_hr.name}
                              </span>
                            </>
                          )}
                        </div>
                        {(tipePenggajianSet.length > 0 ||
                          tipeKaryawanSet.length > 0) && (
                          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                            {tipePenggajianSet.map((t) => (
                              <span
                                key={t}
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-50 text-violet-700 border border-violet-200 capitalize"
                              >
                                {t}
                              </span>
                            ))}
                            {tipeKaryawanSet.map((t) => (
                              <span
                                key={t}
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200 capitalize"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs text-slate-400">Total Gaji</div>
                        <div className="font-bold text-slate-800">
                          Rp {formatInteger(periode.total)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* ── [NEW] Tombol Print Slip di card ── */}
                        <button
                          onClick={() => triggerPrintSlip(periode, '')}
                          className="flex items-center gap-1.5 bg-violet-50 hover:bg-violet-600 hover:text-white text-violet-700 text-xs font-bold px-3 py-2 rounded-xl border border-violet-200 hover:border-violet-600 transition-all active:scale-95"
                        >
                          <IconPrinter /> Print Slip
                        </button>

                        {isDraft && (
                          <button
                            onClick={() => handleSubmit(periode.id)}
                            className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 text-xs font-bold px-3 py-2 rounded-xl border border-blue-200 hover:border-blue-600 transition-all active:scale-95"
                          >
                            <IconSend /> Ajukan
                          </button>
                        )}
                        {isIncomingPay && (
                          <button
                            onClick={() => handlePay(periode.id)}
                            className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 text-xs font-bold px-3 py-2 rounded-xl border border-emerald-200 hover:border-emerald-600 transition-all active:scale-95"
                          >
                            <IconDollar /> Bayar
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedPeriode(periode)}
                          className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-800 hover:text-white text-slate-700 text-xs font-bold px-3 py-2 rounded-xl transition-all active:scale-95"
                        >
                          <IconEye /> Lihat Detail
                        </button>
                      </div>
                    </div>
                    <div className="h-0.5 w-full bg-slate-100">
                      <div
                        className={`h-full transition-all ${
                          periode.status === 'done'
                            ? 'w-full bg-emerald-500'
                            : periode.status === 'incoming pay'
                            ? 'w-3/4 bg-blue-500'
                            : periode.status === 'incoming approved'
                            ? 'w-1/2 bg-amber-500'
                            : 'w-1/4 bg-slate-300'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPage > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition"
                >
                  <IconChevronLeft />
                </button>
                {Array.from({ length: totalPage }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                      p === page
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPage, p + 1))}
                  disabled={page === totalPage}
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition"
                >
                  <IconChevronRight />
                </button>
              </div>
            )}
          </>
        )}

        {!isLoading && periodeList.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 text-2xl">
              📋
            </div>
            <p className="text-sm font-medium">
              Belum ada data pengajuan payroll
            </p>
            <p className="text-xs text-slate-300 mt-1">
              Buat payroll baru di tab Payroll Mingguan
            </p>
          </div>
        )}
      </div>

      {selectedPeriode && (
        <PeriodDetailModal
          periode={selectedPeriode}
          onClose={() => setSelectedPeriode(null)}
          onRefresh={fetchPayroll}
          onPay={handlePay}
          onSubmit={handleSubmit}
          showToast={showToast}
        />
      )}
    </div>
  );
}

export default PengajuanPayrollMinggu;
