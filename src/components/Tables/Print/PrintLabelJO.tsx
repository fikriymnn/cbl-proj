import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Select, { components } from 'react-select';
import { toast } from 'react-toastify';
import { JOData } from '../Produksi/LKH/InputLKH/types';
import LogoSrc from '../../../images/logo/logo-cbl 1.svg';

const API_BASE = import.meta.env.VITE_API_LINK;

// ─── Select Styles ────────────────────────────────────────────────────────────
const selectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    minHeight: '38px',
    fontSize: '13px',
    borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
    boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
    '&:hover': { borderColor: '#3b82f6' },
    borderRadius: '6px',
    backgroundColor: 'white',
  }),
  option: (base: any, state: any) => ({
    ...base,
    fontSize: '13px',
    backgroundColor: state.isSelected
      ? '#3b82f6'
      : state.isFocused
      ? '#eff6ff'
      : 'white',
    color: state.isSelected ? 'white' : '#111827',
    padding: '10px 12px',
    cursor: 'pointer',
  }),
  menu: (base: any) => ({ ...base, zIndex: 9999, borderRadius: '8px' }),
  menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
  placeholder: (base: any) => ({ ...base, color: '#9ca3af', fontSize: '13px' }),
};

// ─── Custom JO Option ─────────────────────────────────────────────────────────
const JOOptionComponent = ({ data, ...props }: any) => (
  <components.Option {...props}>
    <div className="flex flex-col gap-1 py-0.5">
      <div className="flex items-center justify-between gap-2">
        <span className="font-bold text-blue-700 text-sm">{data.no_jo}</span>
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold tracking-wide whitespace-nowrap">
          IO: {data.no_io}
        </span>
      </div>
      <span className="text-sm font-medium text-gray-800 leading-tight">
        {data.produk}
      </span>
      <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
        <span className="flex items-center gap-1">
          <svg
            className="w-3 h-3 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          {data.customer}
        </span>
        <span className="flex items-center gap-1">
          <svg
            className="w-3 h-3 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          {data.qty?.toLocaleString('id-ID')} pcs
        </span>
        {data.tgl_kirim && (
          <span className="flex items-center gap-1">
            <svg
              className="w-3 h-3 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {new Date(data.tgl_kirim).toLocaleDateString('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        )}
        {data.tipe_jo && (
          <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs font-medium">
            {data.tipe_jo}
          </span>
        )}
      </div>
    </div>
  </components.Option>
);

const JOSingleValue = ({ data, ...props }: any) => (
  <components.SingleValue {...props}>
    <div className="flex items-center gap-2">
      <span className="font-bold text-gray-800">{data.no_jo}</span>
      <span className="text-gray-300">|</span>
      <span className="text-gray-500 text-xs truncate">{data.produk}</span>
    </div>
  </components.SingleValue>
);

// ─── Form Data ────────────────────────────────────────────────────────────────
interface PrintLabelFormData {
  no_jo: string;
  no_io: string;
  customer: string;
  produk: string;
  qty_po: number | string;
  qty_label: string;
  keterangan_qty_label: string;
  tanggal_produksi: string;
  operator: string;
  tanda_retur: string;
}

// ─── QR Code generator (pure JS, no lib needed) ──────────────────────────────
// Uses the qrserver.com free API to get a QR as a data URI via canvas
const getQRDataUri = async (
  text: string,
  size: number = 80,
): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, size, size);
        resolve(canvas.toDataURL('image/png'));
      } else {
        resolve(
          `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
            text,
          )}`,
        );
      }
    };
    img.onerror = () => {
      resolve('');
    };
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
      text,
    )}`;
  });
};

// ─── Build isolated print HTML (table-based 2-up layout, zero CSS bleed) ─────
// NOTE: This mirrors PrintLabel.tsx's buildPrintHTML exactly (placement,
// row structure, QR block) so both pages print identically.
const buildPrintHTML = (
  data: PrintLabelFormData,
  copies: number,
  logoDataUri: string,
  qrDataUri: string,
  angkaDari: number = 1,
): string => {
  const now = new Date();
  const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(
    now.getMonth() + 1,
  ).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(
    2,
    '0',
  )}:${String(now.getMinutes()).padStart(2, '0')}`;

  const qtyLabelFormatted = data.qty_label
    ? `${data.qty_label} PCS${
        data.keterangan_qty_label ? ' ' + data.keterangan_qty_label : ''
      }`
    : '';

  const formatTanggal = (val: string) => {
    if (!val) return '';
    const d = new Date(val);
    return isNaN(d.getTime()) ? val : d.toLocaleDateString('id-ID');
  };

  const LABEL_H = '62mm';
  const HEADER_H = '16mm';
  const PAGE_H = '186mm';

  // Everything that used to be scattered (date on the NO JO row, the IO badge
  // on the TANGGAL PRODUKSI row, and a whole separate TANDA RETUR row) now
  // lives in one right-aligned sidebar anchored at the same spot as the QR,
  // so date / QR / IO / tanda-retur all sit in the same right-hand column.
  const SIDEBAR_PAD = '62px'; // reserved right padding on every normal row

  const singleLabel = (copyIndex: number) => {
    const hasRetur = !!data.tanda_retur;
    // Fixed-height rows: NO JO, PEMESAN, QTY LABEL, TANGGAL PRODUKSI, OPERATOR
    // NAMA PRODUK is excluded here — it gets a flexible, non-clipped height below.
    // (TANDA RETUR is no longer its own row — it moved into the sidebar.)
    const fixedRowCount = 5;
    const dataAreaMm = 44;
    const produkMinMm = 9;
    const fixedAreaMm = dataAreaMm - produkMinMm;
    const unitMm = fixedAreaMm / fixedRowCount;
    const rowH = `${unitMm.toFixed(2)}mm`;
    const produkMinH = `${produkMinMm}mm`;

    // Auto-shrink the product name font only when it's long, so long
    // product names never get visually cut off.
    const produkLen = (data.produk || '').length;
    const produkFontSize =
      produkLen > 110 ? '8px' : produkLen > 75 ? '9px' : '10.5px';

    // Right-hand sidebar: date on top, QR in the middle, tanda-retur flag +
    // IO badge at the bottom. All raw values, no extra text labels, all
    // right-justified in the same column as the QR.
    //  ${
    //       qrDataUri
    //         ? `<img src="${qrDataUri}" width="50" height="50" style="display:block;image-rendering:pixelated;" alt="QR"/>`
    //         : ''
    //     }
    const sidebar = `
      <div style="position:absolute;top:0;right:2.5mm;height:100%;width:56px;display:flex;flex-direction:column;align-items:flex-end;justify-content:space-between;pointer-events:none;">
        <span style="font-size:8.5px;color:#555;white-space:nowrap;">${dateStr}</span>
       
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:2px;">
          ${
            hasRetur
              ? `<span style="font-weight:900;font-size:10px;white-space:nowrap;">${data.tanda_retur}</span>`
              : ''
          }
          <span style="border:2px solid #111;border-radius:999px;padding:1px 8px;font-size:9.5px;font-weight:900;white-space:nowrap;">${
            data.no_io || ''
          }</span>
        </div>
      </div>`;

    return `
  <td style="border:2px solid #111; padding:0; vertical-align:top; background:white; width:50%; min-height:${LABEL_H}; overflow:visible;">

    <!-- HEADER -->
    <div style="height:${HEADER_H}; max-height:${HEADER_H}; overflow:hidden; display:flex; align-items:stretch; border-bottom:1.5px solid #111;">
      <div style="width:42px; flex-shrink:0; display:flex; align-items:center; justify-content:center; padding:2mm;">
        <img src="${logoDataUri}" width="32" height="32" style="display:block;object-fit:contain;" alt=""/>
      </div>
      <div style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:2mm 2mm 2mm 0; text-align:center;">
        <div style="font-size:13px;font-weight:bold;font-family:Arial,sans-serif;text-decoration:underline;line-height:1.3;">PT. CAHAYA BERLIAN LESTARI</div>
        <div style="font-size:9px;color:#333;font-family:Arial,sans-serif;line-height:1.4;">Jl. Paralon II No. 5, Cigondewah Kaler, Bandung Kulon</div>
        <div style="font-size:9px;color:#333;font-family:Arial,sans-serif;line-height:1.4;">Bandung 40214 Telp: ( 022 ) 6033823</div>
      </div>
    </div>

    <!-- DATA ROWS — position:relative so the sidebar can be absolutely placed -->
    <div style="font-family:Arial,sans-serif;font-size:10.5px;padding:0 2.5mm;position:relative;">

      ${sidebar}

      <div style="display:flex;align-items:center;height:${rowH};overflow:hidden;">
        <div style="width:130px;flex-shrink:0;color:#111;white-space:nowrap;">NO JO</div>
        <div style="flex:1;font-weight:bold;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;padding-right:${SIDEBAR_PAD};">: ${
          data.no_jo || ''
        }</div>
      </div>

      <div style="display:flex;align-items:center;height:${rowH};overflow:hidden;">
        <div style="width:130px;flex-shrink:0;color:#111;white-space:nowrap;">PEMESAN</div>
        <div style="flex:1;font-weight:bold;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;padding-right:${SIDEBAR_PAD};">: ${
          data.customer || ''
        }</div>
      </div>

      <div style="display:flex;align-items:flex-start;min-height:${produkMinH};overflow:visible;padding:1mm 0;">
        <div style="width:130px;flex-shrink:0;color:#111;white-space:nowrap;padding-top:1px;">NAMA PRODUK</div>
        <div style="flex:1;font-weight:bold;font-size:${produkFontSize};line-height:1.3;padding-right:${SIDEBAR_PAD};white-space:normal;word-break:break-word;">: ${
          data.produk || ''
        }</div>
      </div>

      <div style="display:flex;align-items:center;height:${rowH};overflow:hidden;">
        <div style="width:130px;flex-shrink:0;color:#111;white-space:nowrap;">QTY LABEL</div>
        <div style="flex:1;font-weight:bold;padding-right:${SIDEBAR_PAD};">: ${qtyLabelFormatted}</div>
      </div>

      <div style="display:flex;align-items:center;height:${rowH};overflow:hidden;">
        <div style="width:130px;flex-shrink:0;color:#111;white-space:nowrap;">TANGGAL PRODUKSI</div>
        <div style="flex:1;font-weight:bold;padding-right:${SIDEBAR_PAD};">: ${formatTanggal(
          data.tanggal_produksi,
        )}</div>
      </div>

      <div style="display:flex;align-items:center;height:${rowH};overflow:hidden;">
        <div style="width:130px;flex-shrink:0;color:#111;white-space:nowrap;">OPERATOR</div>
        <div style="flex:1;font-weight:bold;overflow:hidden;padding-right:${SIDEBAR_PAD};">
          <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">: ${
            data.operator || ''
          } - ${copyIndex}</span>
        </div>
      </div>

    </div>
  </td>`;
  };

  const pages: string[] = [];
  for (let p = 0; p * 6 < copies; p++) {
    const pageRows: string[] = [];
    for (let r = 0; r < 3; r++) {
      const li = p * 6 + r * 2;
      const ri = li + 1;
      const left =
        li < copies
          ? singleLabel(angkaDari + li)
          : `<td style="width:50%;height:${LABEL_H};background:white;border:none;padding:0;"></td>`;
      const right =
        ri < copies
          ? singleLabel(angkaDari + ri)
          : `<td style="width:50%;height:${LABEL_H};background:white;border:none;padding:0;"></td>`;
      pageRows.push(`<tr style="height:${LABEL_H};">${left}${right}</tr>`);
    }
    pages.push(`
      <table width="100%" cellspacing="10" cellpadding="0" style="border-collapse:separate; border:none; table-layout:fixed; height:${PAGE_H}; page-break-after:always;">
        ${pageRows.join('')}
      </table>
    `);
  }

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Print Label - ${data.no_jo}</title>
  <style>
    @page { size: A4 landscape; margin: 8mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; background: white; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  ${pages.join('')}
</body>
</html>`;
};

// ─── Main Component ───────────────────────────────────────────────────────────
const PrintLabelJO: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [closingLabel, setClosingLabel] = useState(false);
  const [joList, setJoList] = useState<JOData[]>([]);
  const [selectedJO, setSelectedJO] = useState<JOData | null>(null);

  const [copiesStr, setCopiesStr] = useState<string>('6');
  const [angkaDariStr, setAngkaDariStr] = useState<string>('1');

  const [logoBase64, setLogoBase64] = useState<string>('');

  const [formData, setFormData] = useState<PrintLabelFormData>({
    no_jo: '',
    no_io: '',
    customer: '',
    produk: '',
    qty_po: '',
    qty_label: '',
    keterangan_qty_label: '',
    tanggal_produksi: new Date().toISOString().split('T')[0],
    operator: '',
    tanda_retur: '',
  });

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

  const fetchJOList = useCallback(async () => {
    setLoading(true);
    try {
      // Only fetch JOs where is_open_label = true
      const res = await axios.get(`${API_BASE}/ppic/jo`, {
        params: { is_open_label: true, is_get_label: true },
        withCredentials: true,
      });
      console.log('Fetched JO List:', res.data.data);
      setJoList(res.data.data || []);
    } catch {
      toast.error('Gagal mengambil data JO');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/me`, { withCredentials: true });
      setFormData((prev) => ({ ...prev, operator: res.data.nama || '' }));
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    fetchJOList();
    fetchUser();
  }, [fetchJOList, fetchUser]);

  const joOptions = joList.map((jo) => ({
    value: String(jo.id),
    label: `${jo.no_jo} - ${jo.produk}`,
    no_jo: jo.no_jo,
    no_io: jo.no_io,
    customer: jo.customer,
    produk: jo.produk,
    qty: jo.po_qty,
    tgl_kirim: jo.tgl_kirim,
    tipe_jo: jo.tipe_jo,
  }));

  const handleJOSelect = useCallback(
    (option: any) => {
      if (!option) {
        setSelectedJO(null);

        setCopiesStr('1');

        setFormData((prev) => ({
          ...prev,
          no_jo: '',
          no_io: '',
          customer: '',
          produk: '',
          qty_po: '',
          qty_label: '',
          keterangan_qty_label: '',
          tanggal_produksi: '',
        }));

        return;
      }
      const jo = joList.find((j) => j.id === parseInt(option.value));
      if (!jo) return;
      const qtyLabel = jo.jo_mounting?.[0]?.io_mounting?.isi_dalam_1_pack || 0;
      const tanggalProduksi = jo.produksi_lkh_proses?.[0]?.waktu_mulai
        ? new Date(jo.produksi_lkh_proses[0].waktu_mulai)
            .toISOString()
            .split('T')[0]
        : jo.produksi_lkh_proses_awal?.[0]?.waktu_mulai
        ? new Date(jo.produksi_lkh_proses_awal[0].waktu_mulai)
            .toISOString()
            .split('T')[0]
        : '';

      const jumlahCopies =
        qtyLabel > 0 ? Math.ceil(Number(jo.po_qty) / qtyLabel) : 1;

      setCopiesStr(String(jumlahCopies));
      setSelectedJO(jo);
      setFormData((prev) => ({
        ...prev,
        no_jo: jo.no_jo,
        no_io: jo.no_io,
        customer: jo.customer,
        produk: jo.produk,
        qty_po: jo.po_qty,
        qty_label: String(qtyLabel),
        tanggal_produksi: tanggalProduksi,
      }));
    },
    [joList],
  );

  const handleChange = (
    field: keyof PrintLabelFormData,
    value: string | number,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ── Close label after printing ──────────────────────────────────────────────
  const closeLabelAfterPrint = useCallback(async (joId: number) => {
    setClosingLabel(true);
    try {
      await axios.put(
        `${API_BASE}/ppic/jo/closeLabel/${joId}`,
        {},
        { withCredentials: true },
      );
      toast.success('Label berhasil ditutup');
      // Remove this JO from the list and reset form
      setJoList((prev) => prev.filter((jo) => jo.id !== joId));
      setSelectedJO(null);
      setFormData((prev) => ({
        ...prev,
        no_jo: '',
        no_io: '',
        customer: '',
        produk: '',
        qty_po: '',
      }));
    } catch (error: any) {
      toast.error(
        'Gagal menutup label: ' +
          (error?.response?.data?.msg ?? error?.message ?? 'Unknown error'),
      );
    } finally {
      setClosingLabel(false);
    }
  }, []);

  const handlePrint = async () => {
    if (!formData.no_jo || !selectedJO) {
      toast.error('Pilih Nomor JO terlebih dahulu');
      return;
    }

    const copiesNum = Math.max(1, parseInt(copiesStr) || 1);
    const angkaDari = Math.max(1, parseInt(angkaDariStr) || 1);

    // Build the QR URL pointing to the standalone JO detail page
    const qrUrl = `${window.location.origin}/print/jo-detail?id=${selectedJO.id}`;

    toast.info('Membuat QR code...', { autoClose: 1500 });
    const qrDataUri = await getQRDataUri(qrUrl, 100);

    const html = buildPrintHTML(
      formData,
      copiesNum,
      logoBase64 || LogoSrc,
      qrDataUri,
      angkaDari,
    );

    const joId = selectedJO.id;

    const iframe = document.createElement('iframe');
    iframe.style.cssText =
      'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;border:none;';
    document.body.appendChild(iframe);

    const iDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iDoc) {
      toast.error('Gagal membuka iframe print.');
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
          // Close label after printing
          closeLabelAfterPrint(joId);
        }, 1000);
      }
    };
  };

  const readonlyInput =
    'w-full px-3 py-2 text-sm border border-gray-200 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed select-none';
  const manualInput =
    'w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400';

  const FL: React.FC<{ children: React.ReactNode; required?: boolean }> = ({
    children,
    required,
  }) => (
    <label className="block text-xs font-semibold text-gray-600 mb-1">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );

  return (
    <div className="">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <FL required>Nomor JO</FL>
            <Select
              options={joOptions}
              value={
                selectedJO
                  ? joOptions.find((o) => o.value === String(selectedJO.id)) ??
                    null
                  : null
              }
              onChange={handleJOSelect}
              styles={selectStyles}
              placeholder="Pilih Data (Open Label)"
              isDisabled={loading}
              isClearable
              isSearchable
              menuPortalTarget={document.body}
              components={{
                Option: JOOptionComponent,
                SingleValue: JOSingleValue,
              }}
            />
            {!loading && joList.length === 0 && (
              <p className="mt-1 text-xs text-amber-600 flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Tidak ada JO dengan label terbuka
              </p>
            )}
          </div>
          <div>
            <FL>Nomor IO</FL>
            <input
              type="text"
              value={formData.no_io}
              readOnly
              className={readonlyInput}
            />
          </div>
          <div>
            <FL>Customer</FL>
            <input
              type="text"
              value={formData.customer}
              readOnly
              className={readonlyInput}
            />
          </div>
          <div>
            <FL>Produk</FL>
            <input
              type="text"
              value={formData.produk}
              readOnly
              className={readonlyInput}
            />
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <FL>Qty PO</FL>
            <input
              type="text"
              value={
                formData.qty_po
                  ? Number(formData.qty_po).toLocaleString('id-ID')
                  : ''
              }
              readOnly
              className={readonlyInput}
            />
          </div>
          <div>
            <FL>Qty Label</FL>
            <input
              type="text"
              value={formData.qty_label}
              readOnly
              className={readonlyInput}
            />
          </div>
          <div>
            <FL>Keterangan Qty Label</FL>
            <input
              type="text"
              value={formData.keterangan_qty_label}
              onChange={(e) =>
                handleChange('keterangan_qty_label', e.target.value)
              }
              className={manualInput}
              placeholder="Keterangan"
            />
          </div>
          <div>
            <FL>Tanggal Produksi</FL>
            <input
              type="date"
              value={formData.tanggal_produksi}
              readOnly
              className={readonlyInput}
            />
          </div>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <FL>Operator</FL>
            <input
              type="text"
              value={formData.operator}
              onChange={(e) => handleChange('operator', e.target.value)}
              className={manualInput}
              placeholder="Nama operator"
            />
          </div>
          <div>
            <FL>Tanda Retur / Hasil Sortir</FL>
            <input
              type="text"
              value={formData.tanda_retur}
              onChange={(e) => handleChange('tanda_retur', e.target.value)}
              className={manualInput}
              placeholder="Opsional"
            />
          </div>
          <div>
            <FL>Jumlah Copies</FL>
            <input
              type="text"
              value={copiesStr}
              readOnly
              className={readonlyInput}
            />
          </div>
          <div>
            <FL>Angka Dari</FL>
            <input
              type="number"
              value={angkaDariStr}
              min={1}
              onChange={(e) => setAngkaDariStr(e.target.value)}
              onBlur={(e) => {
                const parsed = parseInt(e.target.value);
                setAngkaDariStr(
                  String(isNaN(parsed) || parsed < 1 ? 1 : parsed),
                );
              }}
              className={manualInput}
              placeholder="Mulai dari angka..."
            />
          </div>
        </div>

        {/* Print Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            disabled={!formData.no_jo || loading || closingLabel}
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 active:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm shadow-sm"
          >
            {closingLabel ? (
              <>
                <svg
                  className="animate-spin w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Menutup Label...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                + Print Label
              </>
            )}
          </button>

          {/* Info note */}
          {formData.no_jo && (
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <svg
                className="w-3.5 h-3.5 text-amber-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              Label akan otomatis ditutup setelah print
            </p>
          )}
        </div>
      </div>

      {(loading || closingLabel) && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-xl shadow-xl flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
            <p className="text-sm text-gray-600 font-medium">
              {closingLabel ? 'Menutup label...' : 'Memuat data...'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrintLabelJO;
