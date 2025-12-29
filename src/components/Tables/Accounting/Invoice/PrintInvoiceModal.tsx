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
  const [logoBase64, setLogoBase64] = useState<string>('');

  useEffect(() => {
    // Convert logo to base64 for better print quality
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        setLogoBase64(dataURL);
      }
    };
    img.src = Logo;
  }, []);

  const getValue = (value: any, defaultValue: string = '-') => {
    if (value === null || value === undefined || value === '') {
      return defaultValue;
    }
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
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
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

    if (num < 1000) {
      return convertGroup(num);
    }
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
          if (remainder > 0) {
            result += ' ' + convertGroup(remainder);
          }
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

    // Determine paper height based on number of items
    const itemCount = invoiceData.invoice_produk?.length || 0;
    const paperHeight = itemCount > 3 ? '560mm' : '140mm'; // Half the original height for single page

    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Invoice-${invoiceData.no_invoice || 'Invoice'}</title>
        <style>
          @page {
            size: 241mm ${paperHeight};
            margin: 6mm 4mm 6mm 4mm;
          }

          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }

          body {
            margin: 0;
            padding: 0;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 11px;
            line-height: 1.3;
            color: #000;
            width: 233mm;
            background: white;
          }

          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              color: #000 !important;
            }
            @page {
              margin: 6mm 4mm 6mm 4mm;
            }
            html, body {
              width: 241mm;
              height: ${paperHeight};
            }
            * {
              color: #000 !important;
            }
          }

          .container {
            width: 100%;
            padding: 0;
          }

          /* SECTION 1: Logo + Company Info AND Date */
          .top-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 10px;
          }

          .company-header {
            display: flex;
            align-items: flex-start;
            gap: 8px;
          }

          .logo {
            width: 65px;
            height: auto;
            flex-shrink: 0;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          }

          .company-text {
            flex: 1;
          }

          .company-name {
            font-weight: bold;
            font-size: 11px;
            margin-bottom: 3px;
            line-height: 1.2;
          }

          .company-info {
            font-size: 10px;
            line-height: 1.4;
          }

          .company-info div {
            margin-bottom: 2px;
          }

          .date-location {
            font-size: 10px;
            text-align: right;
            font-weight: bold;
          }

          /* SECTION 2: Invoice Details AND Customer Info */
          .details-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 12px;
          }

          .invoice-details-left {
            flex: 0 0 50%;
            max-width: 50%;
          }

          .detail-row {
            display: flex;
            margin-bottom: 3px;
            font-size: 10px;
            line-height: 1.4;
          }

          .detail-label {
            width: 110px;
            flex-shrink: 0;
            font-weight: bold;
          }

          .detail-colon {
            width: 12px;
            flex-shrink: 0;
            font-weight: bold;
          }

          .detail-value {
            flex: 1;
          }

          .customer-info-right {
            flex: 0 0 50%;
            max-width: 50%;
            text-align: center;
          }

          .customer-label {
            font-size: 10px;
            margin-bottom: 4px;
          }

          .customer-name {
            font-weight: bold;
            font-size: 12px;
            margin-bottom: 4px;
          }

          .customer-address {
            font-size: 10px;
            line-height: 1.5;
          }

          /* ITEMS TABLE */
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
          }

          .items-table th,
          .items-table td {
            border: 1.5px solid #000;
            padding: 5px 6px;
            font-size: 10px;
          }

          .items-table th {
            background-color: #fff;
            font-weight: bold;
            text-align: center;
            line-height: 1.3;
          }

          .items-table td {
            line-height: 1.4;
          }

          .text-center {
            text-align: center;
          }

          .text-right {
            text-align: right;
          }

          /* TOTALS AND TERBILANG SECTION */
          .totals-terbilang-wrapper {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-top: 10px;
            margin-bottom: 15px;
          }

          .terbilang {
            flex: 0 0 50%;
            max-width: 50%;
            font-size: 10px;
            padding-right: 15px;
            font-weight: bold;
          }

          .totals-section {
            flex: 0 0 50%;
            max-width: 50%;
          }

          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 4px 0;
            font-size: 10px;
          }

          .total-label {
            text-align: right;
            font-weight: bold;
            flex: 1;
            padding-right: 20px;
          }

          .total-value {
            text-align: right;
            width: 140px;
          }

          .grand-total-row {
            border-top: 1.5px solid #000;
            border-bottom: 3px double #000;
            padding: 6px 0 !important;
            margin-top: 4px;
            font-weight: bold;
          }

          .grand-total-row .total-value {
            font-weight: bold;
          }

          /* BOTTOM SECTION: Bank info AND Signature side by side */
          .bottom-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-top: 20px;
          }

          .bank-section {
            flex: 0 0 50%;
            max-width: 50%;
            font-size: 10px;
          }

          .bank-label {
            font-weight: bold;
            margin-bottom: 8px;
          }

          .bank-row {
            display: flex;
            margin-bottom: 4px;
          }

          .bank-name {
            font-weight: bold;
            width: 85px;
            flex-shrink: 0;
          }

          .signature-section {
            flex: 0 0 50%;
            max-width: 50%;
            text-align: center;
            font-size: 10px;
          }

          .signature-label {
            font-weight: bold;
            margin-bottom: 50px;
          }

          .signature-line {
            display: inline-block;
            font-weight: bold;
            border-top: 1px solid #000;
            padding-top: 3px;
            min-width: 150px;
          }

          strong {
            font-weight: bold;
          }
        </style>
      </head>

      <body>
        <div class="container">
          <!-- SECTION 1: Logo + Company Info (LEFT) AND Date (RIGHT) -->
          <div class="top-row">
            <div class="company-header">
              <img src="${logoSrc}" alt="Logo" class="logo" />
              <div class="company-text">
                <div class="company-name">PT. CAHAYA BERLIAN LESTARI</div>
                <div class="company-info">
                  <div>Jl. Paralon II No 5 Cigondewah Kaler, 40124</div>
                  <div>Telp: (022) 6033823</div>
                </div>
              </div>
            </div>  
            
            <div class="date-location">Bandung, ${formatDate(
              invoiceData.tgl_faktur,
            )}</div>
          </div>

          <!-- SECTION 2: Invoice Details (LEFT) AND Customer Info (RIGHT) -->
          <div class="details-row">
            <div class="invoice-details-left">
              <div class="detail-row">
                <div class="detail-label">NOMOR FAKTUR</div>
                <div class="detail-colon">:</div>
                <div class="detail-value">${getValue(
                  invoiceData.no_invoice,
                )}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">NOMOR DO</div>
                <div class="detail-colon">:</div>
                <div class="detail-value">${getValue(invoiceData.no_do)}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">NOMOR PO</div>
                <div class="detail-colon">:</div>
                <div class="detail-value">${getValue(invoiceData.no_po)}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">JATUH TEMPO</div>
                <div class="detail-colon">:</div>
                <div class="detail-value">${formatDate(
                  invoiceData.tgl_jatuh_tempo,
                )}</div>
              </div>
            </div>

            <div class="customer-info-right">
              <div class="customer-label">KEPADA YTH:</div>
              <div class="customer-name">${getValue(
                invoiceData.nama_customer,
              )}</div>
              <div class="customer-address">${getValue(
                invoiceData.alamat,
              )}</div>
            </div>
          </div>

          <!-- ITEMS TABLE -->
          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 12%;">BANYAK</th>
                <th style="width: 10%;">Unit</th>
                <th style="width: 43%;">NAMA BARANG</th>
                <th style="width: 17%;">HARGA</th>
                <th style="width: 18%;">JUMLAH</th>
              </tr>
            </thead>
            <tbody>
              ${
                invoiceData.invoice_produk &&
                invoiceData.invoice_produk.length > 0
                  ? invoiceData.invoice_produk
                      .map(
                        (item) => `
                <tr>
                  <td class="text-center">${getValue(
                    item.qty?.toLocaleString('id-ID'),
                    '0',
                  )}</td>
                  <td class="text-center">${getValue(item.unit, 'PCS')}</td>
                  <td>${getValue(item.nama_produk, '-')}</td>
                  <td class="text-right">${formatCurrency(item.harga)}</td>
                  <td class="text-right">${formatCurrency(item.total)}</td>
                </tr>
              `,
                      )
                      .join('')
                  : `
                <tr>
                  <td colspan="5" class="text-center">No items</td>
                </tr>
              `
              }
            </tbody>
          </table>

          <!-- TOTALS AND TERBILANG SECTION: Side by side -->
          <div class="totals-terbilang-wrapper">
            <!-- LEFT: Terbilang -->
            <div class="terbilang">
              <strong>Terbilang : ${convertToWords(
                Math.floor(finalTotal),
              )} Rupiah</strong>
            </div>

            <!-- RIGHT: Totals -->
            <div class="totals-section">
              <div class="total-row">
                <div class="total-label">Subtotal</div>
                <div class="total-value">${formatCurrency(
                  invoiceData.sub_total,
                )}</div>
              </div>
              ${
                invoiceData.is_show_dpp
                  ? `
              <div class="total-row">
                <div class="total-label">DPP</div>
                <div class="total-value">${formatCurrency(
                  invoiceData.dpp,
                )}</div>
              </div>
              `
                  : ''
              }
              ${
                showDiskon && invoiceData.diskon > 0
                  ? `
              <div class="total-row">
                <div class="total-label">Discount</div>
                <div class="total-value">${formatCurrency(
                  invoiceData.diskon,
                )}</div>
              </div>
              `
                  : ''
              }
              <div class="total-row">
                <div class="total-label">PPN</div>
                <div class="total-value">${formatCurrency(
                  invoiceData.ppn,
                )}</div>
              </div>
              ${
                invoiceData.dp > 0
                  ? `
              <div class="total-row">
                <div class="total-label">DP</div>
                <div class="total-value">${formatCurrency(invoiceData.dp)}</div>
              </div>
              `
                  : ''
              }
              <div class="total-row grand-total-row">
                <div class="total-label">Total</div>
                <div class="total-value">${formatCurrency(finalTotal)}</div>
              </div>
            </div>
          </div>

          <!-- BOTTOM ROW: Bank Transfer (LEFT) AND Signature (RIGHT) -->
          <div class="bottom-row">
            <div class="bank-section">
              <div class="bank-label">Transfer Ke Rek : PT. CAHAYA BERLIAN LESTARI</div>
              <div class="bank-row">
                <div class="bank-name">BCA</div>
                <div>517.116.988.8</div>
              </div>
              <div class="bank-row">
                <div class="bank-name">MANDIRI</div>
                <div>132.00.2216816.6</div>
              </div>
            </div>

            <div class="signature-section">
              <div class="signature-label">Hormat Kami</div>
              <div class="signature-line">(...................................)</div>
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
        printWindow.onafterprint = () => {
          printWindow.close();
        };
      };
    }
  };

  if (!isOpen || !invoiceData) return null;

  // Calculate paper height for preview
  const itemCount = invoiceData.invoice_produk?.length || 0;
  const previewHeight = itemCount > 3 ? '560mm' : '280mm';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black bg-opacity-75">
      <div className="flex flex-col h-full">
        {/* Header with buttons */}
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
            {/* Show Diskon Toggle */}
            <label className="flex items-center gap-2 bg-gray-700 px-4 py-2 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={showDiskon}
                onChange={(e) => setShowDiskon(e.target.checked)}
                className="w-4 h-4 cursor-pointer"
              />
              <span className="text-sm">Show Discount</span>
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

        {/* Scrollable preview area */}
        <div className="flex-1 overflow-auto bg-gray-600 p-8">
          <div
            className="bg-white shadow-2xl mx-auto"
            style={{ width: '241mm', minHeight: previewHeight }}
          >
            {/* PDF Preview using iframe */}
            <iframe
              key={showDiskon ? 'with-diskon' : 'without-diskon'}
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

        {/* Footer info */}
        <div className="bg-gray-800 text-white p-3 text-center text-sm">
          <p>
            Optimized for continuous form paper (241mm x{' '}
            {itemCount > 3 ? '560mm' : '280mm'}). Click "Print / Download" to
            print.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrintInvoiceModal;
