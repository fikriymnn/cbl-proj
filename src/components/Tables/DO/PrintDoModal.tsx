// PrintDoModal.tsx
import React, { useRef, useEffect, useState } from 'react';
import Logo from '../../../images/logo/logo-cbl 1.svg';
import axios from 'axios';

interface DOPrintData {
  id: number;
  no_do: string;
  no_jo: string;
  no_io: string;
  no_so: string;
  no_po_customer: string;
  tgl_do: string;
  customer: string;
  pelanggan: string;
  alamat: string;
  kota: string;
  is_tax: boolean;
  note: string;
  status: string;
  id_kendaraan: number;
  id_supir: number;
  id_kenek: number;

  // Vehicle and driver info
  kendaraan?: {
    nomor_kendaraan: string;
    nama_kendaraan: string;
  };
  supir?: {
    name: string;
    biodata_karyawan: Array<{
      nik: string;
    }>;
  };
  kenek?: {
    name: string;
    biodata_karyawan: Array<{
      nik: string;
    }>;
  };

  // Delivery items
  delivery_order?: Array<{
    id: number;
    produk: string;
    jumlah_qty: number;
    pack_1: number;
    pack_2: number;
    pack_3: number;
    isi_1: number;
    isi_2: number;
    isi_3: number;
    po_qty: number;
    note: string;
  }>;
}

interface PrintDoModalProps {
  isOpen: boolean;
  doGroupId: number | null;
  onClose: () => void;
}

const PrintDoModal: React.FC<PrintDoModalProps> = ({
  isOpen,
  doGroupId,
  onClose,
}) => {
  const [printData, setPrintData] = useState<DOPrintData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [logoBase64, setLogoBase64] = useState<string>('');

  useEffect(() => {
    if (isOpen && doGroupId) {
      fetchDOData();
    }
  }, [isOpen, doGroupId]);

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

  const fetchDOData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_LINK}/deliveryOrderGroup/${doGroupId}`,
        { withCredentials: true },
      );

      console.log('Fetched DO Data:', response.data);
      setPrintData(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching DO data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getValue = (value: any, defaultValue: string = '-') => {
    if (value === null || value === undefined || value === '') {
      return defaultValue;
    }
    return value;
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day} December ${year}`;
  };

  const removeJOPrefix = (noJo: string): string => {
    if (!noJo) return '-';
    return noJo.replace(/^JO-/i, '');
  };

  const calculateTotalPack = () => {
    if (!printData?.delivery_order) return 0;
    return printData.delivery_order.reduce(
      (sum, item) =>
        sum + (item.pack_1 || 0) + (item.pack_2 || 0) + (item.pack_3 || 0),
      0,
    );
  };

  const getItemKeterangan = (item: any) => {
    const parts = [];

    if (item.pack_1 && item.isi_1) {
      parts.push(`${item.pack_1} Pack x ${item.isi_1} Pcs`);
    }
    if (item.pack_2 && item.isi_2) {
      parts.push(`${item.pack_2} Pack x ${item.isi_2} Pcs`);
    }
    if (item.pack_3 && item.isi_3) {
      parts.push(`${item.pack_3} Pack x ${item.isi_3} Pcs`);
    }

    return parts.join('\n');
  };

  const getPrintContent = () => {
    const customerName = printData?.customer || printData?.pelanggan || '-';
    const totalPack = calculateTotalPack();
    const logoSrc = logoBase64 || Logo;

    return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print DO - ${printData?.no_do || 'Delivery Order'}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 15mm;
          }
          * {
            box-sizing: border-box;
          }
          body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            font-size: 10px;
            line-height: 1.4;
          }
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
          .container {
            padding: 0;
          }
          .header-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid black;
          }
          .header-left {
            display: flex;
            align-items: flex-start;
            gap: 15px;
            flex: 1;
          }
          .logo {
            width: 70px;
            height: auto;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          }
          .company-info {
            display: flex;
            flex-direction: column;
          }
          .company-name {
            font-size: 11px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .doc-info {
            display: flex;
            flex-direction: column;
            gap: 2px;
            font-size: 9px;
          }
          .header-right {
            text-align: right;
            flex: 1;
          }
          .date-location {
            font-size: 10px;
            margin-bottom: 15px;
          }
          .recipient-label {
            font-size: 10px;
            font-weight: normal;
            margin-bottom: 3px;
          }
          .recipient-name {
            font-size: 11px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .recipient-address {
            font-size: 10px;
            line-height: 1.5;
          }
          .doc-title-section {
            text-align: center;
            margin: 20px 0 15px 0;
          }
          .doc-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 3px;
          }
          .doc-subtitle {
            font-size: 10px;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
            font-size: 10px;
          }
          .items-table th,
          .items-table td {
            border: 1px solid black;
            padding: 6px 8px;
            text-align: left;
          }
          .items-table th {
            background-color: white;
            font-weight: bold;
            text-align: center;
            font-size: 10px;
          }
          .items-table td {
            vertical-align: top;
          }
          .items-table .no-border-left {
            border-left: none;
          }
          .items-table .no-border-right {
            border-right: none;
          }
          .text-center {
            text-align: center;
          }
          .text-right {
            text-align: right;
          }
          .white-space-pre {
            white-space: pre-line;
          }
          .footer-info-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            font-size: 10px;
            margin-bottom: 10px;
          }
          .footer-info-left {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }
          .footer-info-right {
            font-size: 11px;
            font-weight: bold;
            text-align: right;
          }
          .signature-section {
            margin-top: 30px;
            display: flex;
            justify-content: space-between;
          }
          .signature-box {
            text-align: center;
            width: 45%;
          }
          .signature-title {
            font-weight: bold;
            margin-bottom: 60px;
            font-size: 10px;
          }
          .signature-name {
            font-size: 10px;
          }
          .no-jo-red {
            color: red;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header Section -->
          <div class="header-section">
            <div class="header-left">
              <img src="${logoSrc}" alt="Logo" class="logo" />
              <div class="company-info">
                <div class="company-name">PT. CAHAYA BERLIAN LESTARI</div>
                <div class="doc-info">
                  <div>No. Reg : <strong>SM-EXP-003</strong></div>
                  <div>Nomor : <strong>${getValue(
                    printData?.no_do,
                  )}</strong></div>
                </div>
              </div>
            </div>
            <div class="header-right">
              <div class="date-location">Bandung, ${formatDate(
                printData?.tgl_do || new Date().toISOString(),
              )}</div>
              <div class="recipient-label">Kepada Yth :</div>
              <div class="recipient-name">${customerName}</div>
              <div class="recipient-address">
                ${getValue(printData?.alamat)}<br/>
                ${getValue(printData?.kota)}
              </div>
            </div>
          </div>

          <!-- Document Title -->
          <div class="doc-title-section">
            <div class="doc-title">SURAT JALAN - DO</div>
            <div class="doc-subtitle">( Bukti Penyerahan Barang )</div>
          </div>

          <!-- Items Table -->
          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 12%;">Jumlah Qty</th>
                <th style="width: 43%;" class="no-border-right">Nama Barang</th>
                <th style="width: 12%;" class="no-border-left"></th>
                <th style="width: 33%;">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              ${
                printData?.delivery_order && printData.delivery_order.length > 0
                  ? printData.delivery_order
                      .map(
                        (item) => `
                  <tr>
                    <td class="text-center"><strong>${
                      item.jumlah_qty?.toLocaleString('id-ID') || 0
                    } PCS</strong></td>
                    <td class="no-border-right">
                      ${getValue(item.produk)}<br/>
                      <span style="font-size: 9px;">PO: ${
                        item.po_qty?.toLocaleString('id-ID') || 0
                      }/${getValue(printData?.no_po_customer)}</span>
                    </td>
                    <td class="text-center no-jo-red no-border-left">${removeJOPrefix(
                      printData?.no_jo || '',
                    )}</td>
                    <td class="white-space-pre">${getItemKeterangan(item)}</td>
                  </tr>
                `,
                      )
                      .join('')
                  : `
                  <tr>
                    <td colspan="4" class="text-center">No items available</td>
                  </tr>
                `
              }
            </tbody>
          </table>

          <!-- Footer Info - NO BORDERS -->
          <div class="footer-info-row">
            <div class="footer-info-left">
              <div>Terima kasih atas kepercayaan anda kepada kami.</div>
              <div>No. Mobil : <strong>${getValue(
                printData?.kendaraan?.nomor_kendaraan,
              )}</strong></div>
              <div>Nama Supir : <strong>${getValue(
                printData?.supir?.name,
              )}</strong></div>
            </div>
            <div class="footer-info-right">
              TOTAL : ${totalPack.toLocaleString('id-ID')} Pack
            </div>
          </div>

          <!-- Signatures -->
          <div class="signature-section">
            <div class="signature-box">
              <div class="signature-title">Hormat Kami,</div>
              <div class="signature-name">(PT. Cahaya Berlian Lestari)</div>
            </div>
            <div class="signature-box">
              <div class="signature-title">Yang Menerima,</div>
              <div class="signature-name">(${customerName})</div>
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black bg-opacity-75">
      <div className="flex flex-col h-full">
        {/* Header with buttons */}
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            Print Preview - {printData?.no_do || 'Loading...'}
          </h2>
          <div className="flex gap-2 items-center">
            <button
              onClick={handlePrint}
              disabled={loading || !printData}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-white mb-4"></div>
                <div className="text-white text-xl">Loading preview...</div>
              </div>
            </div>
          ) : !printData ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-white text-xl">No data available</div>
            </div>
          ) : (
            <div className="max-w-[210mm] mx-auto bg-white shadow-2xl">
              {/* PDF Preview using iframe */}
              <iframe
                srcDoc={getPrintContent()}
                className="w-full"
                style={{
                  height: '297mm', // A4 height
                  border: 'none',
                  backgroundColor: 'white',
                }}
                title="DO Print Preview"
              />
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-gray-800 text-white p-3 text-center text-sm">
          <p>
            Preview may differ slightly from final print. Click "Print /
            Download" to generate the final PDF.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrintDoModal;
