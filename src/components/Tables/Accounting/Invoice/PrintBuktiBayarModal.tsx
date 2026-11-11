// PrintBuktiBayarModal.tsx
import React, { useRef } from 'react';
import { PaymentLog } from './DetailBuktiBayarModal';

/**
 * Kertas continuous form NCR 9.5" x 11" (241mm x 280mm) — sama dengan print DO.
 * Bukti bayar dicetak LANDSCAPE di kertas tersebut (sisi 11" = lebar tulisan),
 * sesuai contoh: lubang tractor ada di sisi atas & bawah.
 * Jika ingin portrait, tukar nilai PAPER_WIDTH_MM dan PAPER_HEIGHT_MM.
 */
const PAPER_WIDTH_MM = 280;
const PAPER_HEIGHT_MM = 241;
const MARGIN_Y_MM = 12; // area lubang tractor (atas & bawah)
const MARGIN_X_MM = 10;

type Num = number | string | null | undefined;

interface PrintBuktiBayarModalProps {
  isOpen: boolean;
  payment: PaymentLog | null;
  onClose: () => void;
}

const toNum = (v: Num): number => {
  const n = Number(v ?? 0);
  return isNaN(n) ? 0 : n;
};

const fmt = (v: Num): string =>
  toNum(v).toLocaleString('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const rp = (v: Num): string => `Rp.${fmt(v)}`;

const formatDate = (s: string | null | undefined): string => {
  if (!s) return '';
  const d = new Date(s);
  if (isNaN(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
};

const esc = (v: unknown): string =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const SATUAN = [
  '',
  'satu',
  'dua',
  'tiga',
  'empat',
  'lima',
  'enam',
  'tujuh',
  'delapan',
  'sembilan',
  'sepuluh',
  'sebelas',
];

const terbilangRaw = (n: number): string => {
  if (n < 12) return SATUAN[n];
  if (n < 20) return `${terbilangRaw(n - 10)} belas`;
  if (n < 100)
    return `${terbilangRaw(Math.floor(n / 10))} puluh ${terbilangRaw(n % 10)}`;
  if (n < 200) return `seratus ${terbilangRaw(n - 100)}`;
  if (n < 1000)
    return `${terbilangRaw(Math.floor(n / 100))} ratus ${terbilangRaw(
      n % 100,
    )}`;
  if (n < 2000) return `seribu ${terbilangRaw(n - 1000)}`;
  if (n < 1_000_000)
    return `${terbilangRaw(Math.floor(n / 1000))} ribu ${terbilangRaw(
      n % 1000,
    )}`;
  if (n < 1_000_000_000)
    return `${terbilangRaw(Math.floor(n / 1_000_000))} juta ${terbilangRaw(
      n % 1_000_000,
    )}`;
  if (n < 1_000_000_000_000)
    return `${terbilangRaw(
      Math.floor(n / 1_000_000_000),
    )} miliar ${terbilangRaw(n % 1_000_000_000)}`;
  return `${terbilangRaw(
    Math.floor(n / 1_000_000_000_000),
  )} triliun ${terbilangRaw(n % 1_000_000_000_000)}`;
};

// Format mengikuti contoh: "Say: Satu juta Indonesian Rupiah"
const terbilang = (v: Num): string => {
  const n = Math.floor(Math.abs(toNum(v)));
  const text = n === 0 ? 'nol' : terbilangRaw(n).replace(/\s+/g, ' ').trim();
  return `${text.charAt(0).toUpperCase()}${text.slice(1)} Indonesian Rupiah`;
};

const buildPrintHtml = (p: PaymentLog): string => {
  const details = p.payment_details ?? [];
  const customer =
    details[0]?.invoice?.nama_customer ?? `Customer #${p.customer_id}`;

  const totalInvoice = details.reduce((s, d) => s + toNum(d.invoice?.total), 0);
  const totalApplied = details.reduce((s, d) => s + toNum(d.payment_amount), 0);
  const deposit = toNum(p.payment_amount) - toNum(p.payment_amount_use);
  // PPN 11% (asumsi total invoice sudah termasuk PPN, hanya jika is_tax)
  const totalPpn = p.is_tax ? totalInvoice - totalInvoice / 1.11 : 0;

  const method = (p.payment_method || '').replace(/^./, (c) => c.toUpperCase());

  const rows = details
    .map(
      (d) => `
      <tr>
        <td class="l">${esc(d.invoice?.no_invoice || `#${d.invoice_id}`)}</td>
        <td class="c">${esc(formatDate(d.invoice?.tgl_pelunasan))}</td>
        <td class="r">${rp(d.invoice?.total)}</td>
        <td class="r">${rp(0)}</td>
        <td class="r">${rp(0)}</td>
        <td class="r">${rp(d.payment_amount)}</td>
      </tr>`,
    )
    .join('');

  const pageMinHeight = PAPER_HEIGHT_MM - MARGIN_Y_MM * 2 - 2;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>${esc(p.receipt_number)}</title>
<style>
  @page { size: ${PAPER_WIDTH_MM}mm ${PAPER_HEIGHT_MM}mm; margin: ${MARGIN_Y_MM}mm ${MARGIN_X_MM}mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: #fff; color: #000; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 10pt;
    line-height: 1.3;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  @media screen { body { padding: ${MARGIN_Y_MM}mm ${MARGIN_X_MM}mm; } }
  @media print { body { padding: 0; } * { color: #000 !important; } }

  table { border-collapse: collapse; width: 100%; }

  .page { display: flex; flex-direction: column; min-height: ${pageMinHeight}mm; }

  .company { font-weight: bold; font-size: 11pt; margin-bottom: 2mm; }

  /* ===== TOP ===== */
  .top { display: flex; justify-content: space-between; align-items: stretch; }
  .left { width: 53%; display: flex; flex-direction: column; }
  .right { width: 45%; }

  .box { border: 1px solid #000; }
  .box .hd { font-weight: bold; text-align: center; border-bottom: 1px solid #000; padding: 1mm 2mm; }
  .box .hd.l { text-align: left; }
  .box .bd { padding: 1mm 2mm; }

  .recv { width: 72%; }
  .note { flex: 1; margin-top: 2mm; display: flex; flex-direction: column; min-height: 20mm; }
  .note .bd { flex: 1; white-space: pre-wrap; }

  .title { text-align: center; font-weight: bold; font-size: 14pt; padding: 1.5mm 2mm; }
  .rcpt { text-align: center; padding: 1mm 2mm; margin-top: 1.5mm; }

  .cells { display: grid; grid-template-columns: 1fr 1fr; gap: 2mm 3mm; margin-top: 2mm; }
  .cell { border: 1px solid #000; }
  .cell .lab { font-weight: bold; text-align: center; border-bottom: 1px solid #000; padding: 0.8mm 1mm; white-space: nowrap; }
  .cell .val { text-align: center; height: 6mm; padding: 1mm 1mm 0 1mm; white-space: nowrap; }

  /* ===== MAIN BOX ===== */
  .main { position: relative; border: 1px solid #000; margin-top: 3mm; min-height: 42mm; }
  .vline { position: absolute; top: 0; bottom: 0; width: 0; border-left: 1px solid #000; }
  .items { table-layout: fixed; }
  .items th { font-weight: bold; text-align: center; padding: 1.5mm 2mm; border-bottom: 1px solid #000; white-space: nowrap; }
  .items th.l { text-align: left; }
  .items th.bl { border-left: 1px solid #000; }
  .items td { padding: 1mm 2mm; vertical-align: top; }
  .items td.l { text-align: left; }
  .items td.c { text-align: center; }
  .items td.r { text-align: right; white-space: nowrap; }

  /* ===== SAY & TOTALS ===== */
  .foot { display: flex; justify-content: space-between; align-items: flex-start; margin-top: 2mm; }
  .say { width: 55%; }
  .totals { width: 39%; }
  .totals td { padding: 1.2mm 0; }
  .totals td.k { font-weight: bold; text-align: left; }
  .totals td.r { text-align: right; white-space: nowrap; }

  /* ===== SIGNATURE ===== */
  .sign { display: flex; gap: 6mm; width: 80%; margin-top: auto; padding-top: 6mm; page-break-inside: avoid; }
  .sign > div { flex: 1; }
  .sign .space { height: 20mm; }
  .sign .line { border-top: 1px solid #000; width: 100%; margin-bottom: 1mm; }
  .sign .lbl { font-weight: bold; text-align: left; }
</style>
</head>
<body>
 <div class="page">
  <div class="company">PT CAHAYA BERLIAN LESTARI</div>

  <div class="top">
    <div class="left">
      <div class="box recv">
        <div class="hd">Received From</div>
        <div class="bd">${esc(customer)}</div>
      </div>
      <div class="box note">
        <div class="hd l">Note</div>
        <div class="bd">${esc(p.note || '')}</div>
      </div>
    </div>

    <div class="right">
      <div class="box title">A/R Payment Receipt</div>
      <div class="box rcpt">${esc(p.receipt_number)}</div>
      <div class="cells">
        <div class="cell"><div class="lab">Date</div><div class="val">${esc(
          formatDate(p.payment_date),
        )}</div></div>
        <div class="cell"><div class="lab">Pmt. Method</div><div class="val">${esc(
          method,
        )}</div></div>
        <div class="cell"><div class="lab">Card/Cheque/Giro No</div><div class="val">${esc(
          p.account_number || '',
        )}</div></div>
        <div class="cell"><div class="lab">Card/Cheque/Giro Date</div><div class="val"></div></div>
        <div class="cell"><div class="lab">Amount</div><div class="val">${rp(
          p.payment_amount,
        )}</div></div>
        <div class="cell"><div class="lab">Deposit</div><div class="val">${rp(
          deposit,
        )}</div></div>
      </div>
    </div>
  </div>

  <div class="main">
    <div class="vline" style="left:54%;"></div>
    <div class="vline" style="left:70%;"></div>
    <div class="vline" style="left:84%;"></div>
    <table class="items">
      <colgroup>
        <col style="width:24%;" />
        <col style="width:14%;" />
        <col style="width:16%;" />
        <col style="width:16%;" />
        <col style="width:14%;" />
        <col style="width:16%;" />
      </colgroup>
      <thead>
        <tr>
          <th class="l">Invoice No.</th>
          <th class="bl">Invoice Date</th>
          <th class="bl">Subtotal</th>
          <th>Discount</th>
          <th>Credits Used</th>
          <th>Amt. Paid</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>

  <div class="foot">
    <div class="say"><b>Say:</b> ${esc(terbilang(p.payment_amount))}</div>
    <table class="totals">
      <tr><td class="k">Total</td><td class="r">${fmt(totalInvoice)}</td></tr>
      <tr><td class="k">Total PPN 11%</td><td class="r">${fmt(
        totalPpn,
      )}</td></tr>
      <tr><td class="k">Total Discount</td><td class="r">${rp(0)}</td></tr>
      <tr><td class="k">Total Credit</td><td class="r">${rp(0)}</td></tr>
      <tr><td class="k">Total Applied</td><td class="r">${rp(
        totalApplied,
      )}</td></tr>
    </table>
  </div>

  <div class="sign">
    <div><div class="space"></div><div class="line"></div><div class="lbl">Disetujui Oleh</div></div>
    <div><div class="space"></div><div class="line"></div><div class="lbl">Dibukukan Oleh</div></div>
    <div><div class="space"></div><div class="line"></div><div class="lbl">Yang Menyerahkan</div></div>
    <div><div class="space"></div><div class="line"></div><div class="lbl">Yang Menerima</div></div>
  </div>
 </div>
</body>
</html>`;
};

const PrintBuktiBayarModal: React.FC<PrintBuktiBayarModalProps> = ({
  isOpen,
  payment,
  onClose,
}) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  if (!isOpen || !payment) return null;

  const handlePrint = (): void => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    win.focus();
    win.print();
  };

  return (
    <div className="fixed inset-0 z-[70] overflow-hidden bg-black bg-opacity-75">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            Print Preview - {payment.receipt_number}
          </h2>
          <div className="flex gap-2 items-center">
            <button
              onClick={handlePrint}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              🖨️ Print
            </button>
            <button
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-auto bg-gray-600 p-8">
          <div
            className="mx-auto bg-white shadow-2xl"
            style={{
              width: `${PAPER_WIDTH_MM}mm`,
              height: `${PAPER_HEIGHT_MM}mm`,
            }}
          >
            <iframe
              ref={iframeRef}
              srcDoc={buildPrintHtml(payment)}
              title="Bukti Bayar Print Preview"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                backgroundColor: 'white',
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-800 text-white p-3 text-center text-sm">
          <p>
            Optimized for continuous form paper 241mm x 280mm (landscape). Klik
            "Print" untuk mencetak.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrintBuktiBayarModal;
