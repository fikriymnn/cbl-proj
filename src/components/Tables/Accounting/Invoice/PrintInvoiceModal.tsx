// PrintInvoiceModal.tsx
import React, { useState, useEffect } from 'react';
import Logo from '../../../../images/logo/CBL Logo 3.png';

interface InvoiceProduk {
  id: number;
  nama_produk: string;
  kode_produk: string;
  unit: string;
  qty: number;
  harga: number;
  diskon_produk: number;
  total: number;
  dpp: number;
  pajak: number;
}

interface UserCreate {
  id: number;
  uuid: string;
  id_karyawan: number;
  id_role: number | null;
  nama: string;
}

interface InvoiceData {
  id: number;
  no_invoice: string;
  no_do: string;
  no_po: string;
  nama_customer: string;
  alamat: string;
  tgl_faktur: string;
  tgl_po: string;
  tgl_kirim: string;
  tgl_jatuh_tempo: string;
  waktu_jatuh_tempo: string;
  sub_total: number;
  diskon: number;
  dpp: number;
  ppn: number;
  total: number;
  dp: number;
  balance_due: number | null;
  is_show_dpp: boolean;
  note: string;
  status: string;
  status_payment: string;
  status_proses: string;
  id_customer: number;
  id_create: number;
  id_approve: number | null;
  id_reject: number | null;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  invoice_produk: InvoiceProduk[];
  user_create?: UserCreate;
  user_approve?: any;
  user_reject?: any;
  retur?: any[];
}

interface PrintInvoiceModalProps {
  isOpen: boolean;
  invoiceData: InvoiceData | null;
  onClose: () => void;
}

const PrintInvoiceModal: React.FC<PrintInvoiceModalProps> = ({
  isOpen,
  invoiceData,
  onClose,
}) => {
  const [showDiskon, setShowDiskon] = useState<boolean>(true);
  const [showDpp, setShowDpp] = useState<boolean>(false);
  const [logoBase64, setLogoBase64] = useState<string>('');

  // Sync showDpp with invoiceData.is_show_dpp when data loads
  useEffect(() => {
    if (invoiceData) {
      setShowDpp(invoiceData.is_show_dpp);
    }
  }, [invoiceData]);

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
    img.src = Logo;
  }, []);

  const getValue = (value: any, defaultValue: string = '-') => {
    if (value === null || value === undefined || value === '')
      return defaultValue;
    return value;
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const monthNames = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ];
    return `${day} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  const formatCurrency = (num: number | null | undefined): string => {
    if (num === null || num === undefined) return 'Rp. 0';
    return `Rp. ${num.toLocaleString('id-ID')}`;
  };

  const convertToWords = (num: number): string => {
    if (num === 0) return 'Nol';

    const ones = [
      '',
      'Satu',
      'Dua',
      'Tiga',
      'Empat',
      'Lima',
      'Enam',
      'Tujuh',
      'Delapan',
      'Sembilan',
    ];
    const teens = [
      'Sepuluh',
      'Sebelas',
      'Dua Belas',
      'Tiga Belas',
      'Empat Belas',
      'Lima Belas',
      'Enam Belas',
      'Tujuh Belas',
      'Delapan Belas',
      'Sembilan Belas',
    ];
    const tens = [
      '',
      '',
      'Dua Puluh',
      'Tiga Puluh',
      'Empat Puluh',
      'Lima Puluh',
      'Enam Puluh',
      'Tujuh Puluh',
      'Delapan Puluh',
      'Sembilan Puluh',
    ];

    const convertGroup = (n: number): string => {
      if (n === 0) return '';
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      if (n < 100) {
        const ten = Math.floor(n / 10);
        const one = n % 10;
        return tens[ten] + (one > 0 ? ' ' + ones[one] : '');
      }
      if (n < 1000) {
        const hundred = Math.floor(n / 100);
        const rest = n % 100;
        const hundredText =
          hundred === 1 ? 'Seratus' : ones[hundred] + ' Ratus';
        return hundredText + (rest > 0 ? ' ' + convertGroup(rest) : '');
      }
      return '';
    };

    if (num < 1000) return convertGroup(num);
    if (num < 1000000) {
      const thousand = Math.floor(num / 1000);
      const rest = num % 1000;
      const thousandText =
        thousand === 1 ? 'Seribu' : convertGroup(thousand) + ' Ribu';
      return thousandText + (rest > 0 ? ' ' + convertGroup(rest) : '');
    }
    if (num < 1000000000) {
      const million = Math.floor(num / 1000000);
      const rest = num % 1000000;
      let result = convertGroup(million) + ' Juta';
      if (rest > 0) {
        if (rest >= 1000) {
          const thousand = Math.floor(rest / 1000);
          const remainder = rest % 1000;
          const thousandText =
            thousand === 1 ? 'Seribu' : convertGroup(thousand) + ' Ribu';
          result += ' ' + thousandText;
          if (remainder > 0) result += ' ' + convertGroup(remainder);
        } else {
          result += ' ' + convertGroup(rest);
        }
      }
      return result;
    }
    return 'Angka terlalu besar';
  };

  const getPrintContent = () => {
    if (!invoiceData) return '';

    const finalTotal =
      invoiceData.balance_due !== null
        ? invoiceData.balance_due
        : invoiceData.total;

    const logoSrc = logoBase64 || Logo;
    const itemCount = invoiceData.invoice_produk?.length || 0;

    let paperHeight = '280mm';
    if (itemCount > 3 && itemCount <= 7) paperHeight = '420mm';
    if (itemCount > 7) paperHeight = 'auto';

    return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Invoice-${invoiceData.no_invoice}</title>

<style>
@page {
  size: 241mm ${paperHeight};
  margin: 0 12mm 0 12mm; /* top right bottom left */
}

@media print {
  @page {
    size: 241mm ${paperHeight};
    margin: 0 12mm 0 12mm;
  }

  html, body {
    margin: 0 !important;
    padding: 0 !important;
  }

  body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .content {
    margin: 0 !important;
    padding: 0 !important;
  }
}

html, body {
  margin: 0;
  padding: 0;
}

body {
  font-family: "Times New Roman", serif;
  font-size: 11pt;
  line-height: 1.35;
  color: #000;
}

.content {
  width: 100%;
  margin: 0;
  padding: 0;
}

/* HEADER */
.header {
  display: flex;
  justify-content: space-between;
  border-bottom: 2px solid #000;
  padding-bottom: 6px;
  margin-bottom: 6px;
}

.company {
  display: flex;
  gap: 10px;
}

.logo {
  width: 80px;
  height: auto;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
}

.company-name {
  font-weight: bold;
  font-size: 13pt;
}

.date {
  font-weight: bold;
  font-size: 11pt;
}

/* DETAIL ROW */
.detail-section {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.left-detail { width: 50%; }

.detail-row {
  display: flex;
  margin-bottom: 2px;
  font-size: 11pt;
}

.detail-label {
  width: 125px;
  font-weight: bold;
}

.customer-box {
  width: 48%;
  border: 2px solid #000;
  padding: 5px;
  text-align: center;
  font-size: 11pt;
}

.customer-name {
  font-weight: bold;
  margin-bottom: 3px;
  font-size: 12pt;
}

/* TABLE */
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 6px;
}

th, td {
  border: 2px solid #000;
  padding: 3px 4px;
  font-size: 11pt;
}

th {
  text-align: center;
  font-weight: bold;
}

.text-center { text-align: center; }
.text-right { text-align: right; }

/* TOTAL SECTION */
.total-section {
  display: flex;
  justify-content: space-between;
  border-top: 2px solid #000;
  margin-top: 6px;
  padding-top: 4px;
}

.terbilang {
  width: 48%;
  font-weight: bold;
  font-size: 11pt;
}

.totals { width: 48%; }

.total-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2px;
  font-size: 11pt;
}

.grand {
  border-top: 2px solid #000;
  border-bottom: 3px double #000;
  padding: 3px 0;
  font-weight: bold;
  font-size: 12pt;
}

/* FOOTER */
.footer {
  display: flex;
  justify-content: space-between;
  border-top: 2px solid #000;
  margin-top: 10px;
  padding-top: 6px;
  font-size: 11pt;
}

.signature {
  text-align: center;
  font-size: 11pt;
}

.signature-line {
  margin-top: 40px;
  border-top: 2px solid #000;
  width: 160px;
  margin-left: auto;
  margin-right: auto;
}
</style>
</head>

<body>
<div class="content">

<div class="header">
  <div class="company">
    <img src="${logoSrc}" class="logo"/>
    <div>
      <div class="company-name">PT. CAHAYA BERLIAN LESTARI</div>
      <div>Jl. Paralon II No 5 Cigondewah Kaler</div>
      <div>Telp: (022) 6033823</div>
    </div>
  </div>
  <div class="date">
    Bandung, ${formatDate(invoiceData.tgl_faktur)}
  </div>
</div>

<div class="detail-section">
  <div class="left-detail">
    <div class="detail-row">
      <div class="detail-label">NOMOR FAKTUR</div>: ${invoiceData.no_invoice}
    </div>
    <div class="detail-row">
      <div class="detail-label">NOMOR DO</div>: ${invoiceData.no_do}
    </div>
    <div class="detail-row">
      <div class="detail-label">NOMOR PO</div>: ${invoiceData.no_po}
    </div>
    <div class="detail-row">
      <div class="detail-label">JATUH TEMPO</div>: ${formatDate(
        invoiceData.tgl_jatuh_tempo,
      )}
    </div>
  </div>

  <div class="customer-box">
    <div><strong>KEPADA YTH:</strong></div>
    <div class="customer-name">${invoiceData.nama_customer}</div>
    <div>${invoiceData.alamat}</div>
  </div>
</div>

<table>
<thead>
<tr>
<th style="width:10%">BANYAK</th>
<th style="width:10%">UNIT</th>
<th style="width:45%">NAMA BARANG</th>
<th style="width:15%">HARGA</th>
<th style="width:20%">JUMLAH</th>
</tr>
</thead>
<tbody>
${invoiceData.invoice_produk
  .map(
    (item) => `
<tr>
<td class="text-center">${item.qty}</td>
<td class="text-center">${item.unit}</td>
<td>${item.nama_produk}</td>
<td class="text-right">${formatCurrency(item.harga)}</td>
<td class="text-right">${formatCurrency(item.total)}</td>
</tr>
`,
  )
  .join('')}
</tbody>
</table>

<div class="total-section">
  <div class="terbilang">
    Terbilang: ${convertToWords(Math.floor(finalTotal))} Rupiah
  </div>

  <div class="totals">
    <div class="total-row">
      <div>Subtotal</div>
      <div>${formatCurrency(invoiceData.sub_total)}</div>
    </div>
    ${
      showDpp
        ? `
    <div class="total-row">
      <div>DPP</div>
      <div>${formatCurrency(invoiceData.dpp)}</div>
    </div>
    `
        : ''
    }
    <div class="total-row">
      <div>PPN</div>
      <div>${formatCurrency(invoiceData.ppn)}</div>
    </div>
    <div class="total-row grand">
      <div>TOTAL</div>
      <div>${formatCurrency(finalTotal)}</div>
    </div>
  </div>
</div>

<div class="footer">
  <div>
    <strong>Transfer Ke Rek:</strong><br/>
    BCA 517.116.988.8<br/>
    MANDIRI 132.00.2216816.6
  </div>

  <div class="signature">
    Hormat Kami
    <div class="signature-line"></div>
  </div>
</div>

</div>
</body>
</html>
`;
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(getPrintContent());
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
        printWindow.onafterprint = () => printWindow.close();
      };
    }
  };

  if (!isOpen || !invoiceData) return null;

  const itemCount = invoiceData.invoice_produk?.length || 0;
  const previewHeight = itemCount > 3 ? '560mm' : '280mm';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black bg-opacity-75">
      <div className="flex flex-col h-full">
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            Print Preview - {invoiceData.no_invoice}
            {itemCount > 3 && (
              <span className="text-sm ml-2 text-yellow-300">
                (Double Height Paper - {itemCount} items)
              </span>
            )}
          </h2>
          <div className="flex gap-2 items-center">
            <label className="flex items-center gap-2 bg-gray-700 px-4 py-2 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={showDiskon}
                onChange={(e) => setShowDiskon(e.target.checked)}
                className="w-4 h-4 cursor-pointer"
              />
              <span className="text-sm">Show Discount</span>
            </label>
            <label className="flex items-center gap-2 bg-gray-700 px-4 py-2 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={showDpp}
                onChange={(e) => setShowDpp(e.target.checked)}
                className="w-4 h-4 cursor-pointer"
              />
              <span className="text-sm">Show DPP</span>
            </label>
            <button
              onClick={handlePrint}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              🖨️ Print / Download
            </button>
            <button
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              ✕ Close
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-gray-600 p-8">
          <div
            className="bg-white shadow-2xl mx-auto"
            style={{ width: '241mm', minHeight: previewHeight }}
          >
            <iframe
              key={`${showDiskon}-${showDpp}`}
              srcDoc={getPrintContent()}
              className="w-full"
              style={{
                height: previewHeight,
                border: 'none',
                backgroundColor: 'white',
              }}
              title="Invoice Preview"
            />
          </div>
        </div>

        <div className="bg-gray-800 text-white p-3 text-center text-sm">
          <p>
            Optimized for DOT MATRIX continuous form paper (241mm x{' '}
            {itemCount > 3 ? '560mm' : '280mm'}). Larger fonts for better
            readability.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrintInvoiceModal;
