// SOMarketingPrintModal.tsx
import React, { useRef } from 'react';
import Logo from '../../../../images/logo/logo-cbl 1.svg';
import { SOData } from './types/SOTypes';

interface SOMarketingPrintModalProps {
  isOpen: boolean;
  printData: SOData | null;
  onClose: () => void;
}

const SOMarketingPrintModal: React.FC<SOMarketingPrintModalProps> = ({
  isOpen,
  printData,
  onClose,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  const getValue = (value: any, defaultValue: string = '-') => {
    if (value === null || value === undefined || value === '') {
      return defaultValue;
    }
    return value;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = date.getDate();
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

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Print - ${printData?.no_so || 'SO'}</title>
              <style>
                @page {
                  size: A4 portrait;
                  margin: 10mm;
                }
                * {
                  box-sizing: border-box;
                }
                body {
                  margin: 0;
                  padding: 0;
                  font-family: Arial, sans-serif;
                  font-size: 9px;
                  line-height: 1.3;
                }
                @media print {
                  body {
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                  }
                  .no-print {
                    display: none !important;
                  }
                }
                .header-flex {
                  display: flex;
                  align-items: center;
                  gap: 10px;
                  margin-bottom: 12px;
                }
                .header-logo {
                  width: 50px;
                  height: auto;
                }
                .header-title {
                  font-size: 12px;
                  font-weight: bold;
                }
                .title-center {
                  text-align: center;
                  font-size: 14px;
                  font-weight: bold;
                  margin-bottom: 12px;
                }
                .info-grid {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 30px;
                  margin-bottom: 10px;
                  font-size: 8px;
                }
                .info-item {
                  margin-bottom: 2px;
                  display: flex;
                }
                .info-label {
                  display: inline-block;
                  width: 120px;
                }
                .info-colon {
                  display: inline-block;
                  width: 10px;
                }
                .info-value {
                  flex: 1;
                }
                .address-line {
                  margin-bottom: 10px;
                  font-size: 8px;
                  display: flex;
                }
                .address-label {
                  display: inline-block;
                  width: 120px;
                }
                .address-colon {
                  display: inline-block;
                  width: 10px;
                }
                .address-value {
                  flex: 1;
                }
                table {
                  border-collapse: collapse;
                  width: 100%;
                  margin-bottom: 8px;
                }
                td, th {
                  border: 1px solid black;
                  padding: 3px 5px;
                  vertical-align: top;
                  font-size: 8px;
                }
                th {
                  text-align: center;
                  font-weight: bold;
                }
                .text-center { 
                  text-align: center; 
                }
                .text-right { 
                  text-align: right; 
                }
                .total-wrapper {
                  display: flex;
                  justify-content: flex-end;
                  margin-bottom: 12px;
                }
                .total-box {
                  width: 300px;
                }
                .total-line {
                  display: flex;
                  justify-content: space-between;
                  border-top: 2px double black;
                  border-bottom: 2px double black;
                  padding: 4px 0;
                  font-weight: bold;
                  font-size: 9px;
                }
                .date-line {
                  margin-bottom: 8px;
                  font-size: 8px;
                }
                .signature-grid {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 60px;
                  text-align: center;
                  font-size: 8px;
                }
                .signature-space {
                  height: 40px;
                }
                .signature-label {
                  margin-bottom: 3px;
                }
                .separator {
                  border-top: 1px dashed #999;
                  margin: 15px 0;
                }
                .form-title {
                  text-align: center;
                  font-weight: bold;
                  margin-bottom: 8px;
                  font-size: 9px;
                }
                .form-table td {
                  font-size: 8px;
                }
              </style>
            </head>
            <body>
              ${printRef.current.innerHTML}
              <script>
                window.onload = function() {
                  window.print();
                  window.onafterprint = function() {
                    window.close();
                  };
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  if (!isOpen || !printData) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black bg-opacity-75">
      <div className="flex flex-col h-full">
        {/* Header with buttons */}
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            Print Preview - {printData.no_so}
          </h2>
          <div className="flex gap-2 items-center">
            <button
              onClick={handlePrint}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium"
            >
              🖨️ Print / Download
            </button>
            <button
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium"
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-auto bg-gray-600 p-4">
          <div className="max-w-[210mm] mx-auto bg-white shadow-2xl">
            <div ref={printRef} className="p-6">
              {/* ============ FIRST SECTION - Sales Order ============ */}
              <div>
                {/* Header with Logo */}
                <div className="header-flex">
                  <img src={Logo} alt="Logo" className="header-logo" />
                  <div className="header-title">PT. CAHAYA BERLIAN LESTARI</div>
                </div>

                {/* Title */}
                <div className="title-center">SALES ORDER</div>

                {/* Info Grid - 2 Columns */}
                <div className="info-grid">
                  {/* Left Column */}
                  <div>
                    <div className="info-item">
                      <span className="info-label">No SO</span>
                      <span className="info-colon">:</span>
                      <span className="info-value">
                        {getValue(printData.no_so)}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">No IO</span>
                      <span className="info-colon">:</span>
                      <span className="info-value">
                        {getValue(printData.no_io)}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">No PO</span>
                      <span className="info-colon">:</span>
                      <span className="info-value">
                        {getValue(printData.no_po_customer)}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Tgl PO</span>
                      <span className="info-colon">:</span>
                      <span className="info-value">
                        {formatDate(printData.tgl_po_customer)}
                      </span>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div>
                    <div className="info-item">
                      <span className="info-label">Marketing</span>
                      <span className="info-colon">:</span>
                      <span className="info-value">
                        {getValue(printData.create_by)}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Tanggal SO</span>
                      <span className="info-colon">:</span>
                      <span className="info-value">
                        {formatDate(printData.tgl_pembuatan_so)}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">No JO</span>
                      <span className="info-colon">:</span>
                      <span className="info-value"></span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Tanggal Pengiriman</span>
                      <span className="info-colon">:</span>
                      <span className="info-value">
                        {formatDate(printData.tgl_pengiriman)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Alamat Pengiriman */}
                <div className="address-line">
                  <span className="address-label">Alamat Pengiriman</span>
                  <span className="address-colon">:</span>
                  <span className="address-value">
                    {getValue(printData.alamat_pengiriman)}
                  </span>
                </div>

                {/* Order Table */}
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: '15%' }}>Quantity</th>
                      <th style={{ width: '20%' }}>Pemesan</th>
                      <th style={{ width: '30%' }}>Nama Produk</th>
                      <th style={{ width: '12%' }}>Harga</th>
                      <th style={{ width: '23%' }}>Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ height: '40px' }}>
                      <td className="text-center">
                        {printData.po_qty?.toLocaleString('id-ID')}
                      </td>
                      <td className="text-center">
                        {getValue(printData.customer)}
                      </td>
                      <td className="text-center">
                        {getValue(printData.produk)}
                      </td>
                      <td className="text-center">{printData.harga_jual}</td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>

                {/* Total */}
                <div className="total-wrapper">
                  <div className="total-box">
                    <div className="total-line">
                      <span>Total</span>
                      <span>{formatCurrency(printData.total_harga)}</span>
                    </div>
                  </div>
                </div>

                {/* Date */}
                <div className="date-line">
                  Bandung, {formatDate(printData.tgl_pembuatan_so)}
                </div>

                {/* Signatures - 2 Column Grid */}
                <div className="signature-grid">
                  {/* Left Column */}
                  <div>
                    <div className="signature-label">Dibuat Oleh,</div>
                    <div className="signature-space"></div>
                    <div>.......................................</div>
                    <div>(Marketing)</div>
                    <div>Tgl:</div>
                  </div>

                  {/* Right Column */}
                  <div>
                    <div className="signature-label">Diterima Oleh,</div>
                    <div className="signature-space"></div>
                    <div>.......................................</div>
                    <div>(Akunting)</div>
                    <div>Tgl:</div>
                  </div>
                </div>
              </div>

              {/* ============ SEPARATOR ============ */}
              <div className="separator"></div>

              {/* ============ SECOND SECTION - Form Cek List ============ */}
              <div>
                {/* Header with Logo */}
                <div className="header-flex">
                  <img src={Logo} alt="Logo" className="header-logo" />
                  <div className="header-title">PT. CAHAYA BERLIAN LESTARI</div>
                </div>

                {/* Title */}
                <div className="title-center">SALES ORDER</div>

                {/* Info Grid - 2 Columns */}
                <div className="info-grid">
                  {/* Left Column */}
                  <div>
                    <div className="info-item">
                      <span className="info-label">No SO</span>
                      <span className="info-colon">:</span>
                      <span className="info-value">
                        {getValue(printData.no_so)}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">No IO</span>
                      <span className="info-colon">:</span>
                      <span className="info-value">
                        {getValue(printData.no_io)}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">No PO</span>
                      <span className="info-colon">:</span>
                      <span className="info-value">
                        {getValue(printData.no_po_customer)}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Tgl PO</span>
                      <span className="info-colon">:</span>
                      <span className="info-value">
                        {formatDate(printData.tgl_po_customer)}
                      </span>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div>
                    <div className="info-item">
                      <span className="info-label">Marketing</span>
                      <span className="info-colon">:</span>
                      <span className="info-value">
                        {getValue(printData.create_by)}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Tanggal SO</span>
                      <span className="info-colon">:</span>
                      <span className="info-value">
                        {formatDate(printData.tgl_pembuatan_so)}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">No JO</span>
                      <span className="info-colon">:</span>
                      <span className="info-value"></span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Tanggal Pengiriman</span>
                      <span className="info-colon">:</span>
                      <span className="info-value">
                        {formatDate(printData.tgl_pengiriman)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Alamat Pengiriman */}
                <div className="address-line">
                  <span className="address-label">Alamat Pengiriman</span>
                  <span className="address-colon">:</span>
                  <span className="address-value">
                    {getValue(printData.alamat_pengiriman)}
                  </span>
                </div>

                {/* Order Table */}
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: '25%' }}>Pemesan</th>
                      <th style={{ width: '35%' }}>Nama Produk</th>
                      <th style={{ width: '15%' }}>Quantity</th>
                      <th style={{ width: '25%' }}>Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ height: '35px' }}>
                      <td className="text-center">
                        {getValue(printData.customer)}
                      </td>
                      <td className="text-center">
                        {getValue(printData.produk)}
                      </td>
                      <td className="text-center">
                        {printData.po_qty?.toLocaleString('id-ID')}
                      </td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>

                {/* Form Cek List Table */}
                <div>
                  <div className="form-title">FORM CEK LIST KELENGKAPAN PO</div>
                  <table className="form-table">
                    <tbody>
                      <tr>
                        <td style={{ width: '25%' }}>Status Pemesanan</td>
                        <td style={{ width: '2%' }}>:</td>
                        <td>{getValue(printData.status_pemesanan)}</td>
                      </tr>
                      <tr>
                        <td>Acuan Warna</td>
                        <td>:</td>
                        <td>{getValue(printData.acuan_warna)}</td>
                      </tr>
                      <tr>
                        <td>Artwork</td>
                        <td>:</td>
                        <td>{getValue(printData.artwork)}</td>
                      </tr>
                      <tr>
                        <td>Harga</td>
                        <td>:</td>
                        <td>{getValue(printData.harga)}</td>
                      </tr>
                      <tr>
                        <td>Status Barang</td>
                        <td>:</td>
                        <td>
                          {getValue(printData.partial)}
                          <span style={{ marginLeft: '100px' }}>Bulan :</span>
                          <span style={{ marginLeft: '150px' }}>
                            Kirim Semua : YA
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td>Note</td>
                        <td>:</td>
                        <td style={{ height: '50px' }}>
                          {getValue(printData.note)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Date */}
                <div className="date-line">
                  Bandung, {formatDate(printData.tgl_pembuatan_so)}
                </div>

                {/* Signatures - 2 Column Grid */}
                <div className="signature-grid">
                  {/* Left Column */}
                  <div>
                    <div className="signature-label">Dibuat Oleh,</div>
                    <div className="signature-space"></div>
                    <div>(...................................)</div>
                  </div>

                  {/* Right Column */}
                  <div>
                    <div className="signature-label">PPIC</div>
                    <div className="signature-space"></div>
                    <div>(...................................)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SOMarketingPrintModal;
