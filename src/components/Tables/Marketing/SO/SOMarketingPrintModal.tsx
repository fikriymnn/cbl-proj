// SOMarketingPrintModal.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Logo from '../../../../images/logo/logo-cbl 1.svg';
import { SOData } from './types/SOTypes';

interface SOMarketingPrintModalProps {
  isOpen: boolean;
  soId: number | null; // Changed from printData to soId
  onClose: () => void;
}

const SOMarketingPrintModal: React.FC<SOMarketingPrintModalProps> = ({
  isOpen,
  soId,
  onClose,
}) => {
  const [printData, setPrintData] = useState<SOData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch SO data when modal opens
  useEffect(() => {
    if (isOpen && soId) {
      fetchSOData(soId);
    }
  }, [isOpen, soId]);

  const fetchSOData = async (id: number) => {
    const url = `${import.meta.env.VITE_API_LINK}/marketing/so/${id}`;
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(url, {
        withCredentials: true,
      });

      if (response.data.succes && response.data.data) {
        setPrintData(response.data.data);
        console.log('Fetched SO Data for Printing:', response.data.data);
      } else {
        setError('Failed to fetch SO data');
      }
    } catch (err) {
      console.error('Error fetching SO data:', err);
      setError('An error occurred while fetching SO data');
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

  const getPrintContent = () => {
    if (!printData) return '';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print - ${printData.no_so || 'SO'}</title>
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
    padding: 20px;
    font-family: Arial, sans-serif;
    font-size: 10px; /* Changed from 9px to 10px (moderate increase) */
    line-height: 1.35; /* Changed from 1.3 to 1.35 */
  }
  @media print {
    body {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  }
  .header-flex {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
  }
  .header-logo {
    width: 55px; /* Changed from 50px to 55px */
    height: auto;
  }
  .header-title {
    font-size: 13px; /* Changed from 12px to 13px */
    font-weight: bold;
  }
  .header-label {
    margin-left: auto;
    text-align: right;
    font-size: 13px; /* Changed from 12px to 13px */
  }
  .title-center {
    text-align: center;
    font-size: 15px; /* Changed from 14px to 15px */
    font-weight: bold;
    margin-bottom: 12px;
  }
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
    margin-bottom: 10px;
    font-size: 9px; /* Changed from 8px to 9px */
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
    font-size: 9px; /* Changed from 8px to 9px */
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
    font-size: 9px; /* Changed from 8px to 9px */
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
    font-size: 10px; /* Changed from 9px to 10px */
  }
  .date-line {
    margin-bottom: 8px;
    font-size: 9px; /* Changed from 8px to 9px */
  }
  .signature-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    text-align: center;
    font-size: 9px; /* Changed from 8px to 9px */
  }
  .signature-space {
    height: 40px;
  }
  .signature-label {
    margin-bottom: 3px;
  }
  .signature-name {
    font-weight: bold;
    margin-top: 3px;
  }
  .separator {
    border-top: 1px dashed #999;
    margin: 15px 0;
  }
  .form-title {
    text-align: center;
    font-weight: bold;
    margin-bottom: 8px;
    font-size: 10px; /* Changed from 9px to 10px */
  }
  .form-table td {
    font-size: 9px; /* Changed from 8px to 9px */
  }
</style>
        </head>
        <body>
          <!-- ============ FIRST SECTION - Sales Order ============ -->
          <div>
            <!-- Header with Logo -->
            <div class="header-flex">
              <img src="${Logo}" alt="Logo" class="header-logo" />
              <div class="header-title">PT. CAHAYA BERLIAN LESTARI</div>
              <div class="header-label">${getValue(printData.label)}</div>
            </div>
            
            <!-- Title -->
            <div class="title-center">SALES ORDER</div>

            <!-- Info Grid - 2 Columns -->
            <div class="info-grid">
              <!-- Left Column -->
              <div>
                <div class="info-item">
                  <span class="info-label">No SO</span>
                  <span class="info-colon">:</span>
                  <span class="info-value">${getValue(printData.no_so)}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">No IO</span>
                  <span class="info-colon">:</span>
                  <span class="info-value">${getValue(printData.no_io)}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">No PO</span>
                  <span class="info-colon">:</span>
                  <span class="info-value">${getValue(
                    printData.no_po_customer,
                  )}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Tgl PO</span>
                  <span class="info-colon">:</span>
                  <span class="info-value">${formatDate(
                    printData.tgl_po_customer,
                  )}</span>
                </div>
              </div>

              <!-- Right Column -->
              <div>
                <div class="info-item">
                  <span class="info-label">Marketing</span>
                  <span class="info-colon">:</span>
                  <span class="info-value">${getValue(
                    printData.nama_marketing,
                  )}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Tanggal SO</span>
                  <span class="info-colon">:</span>
                  <span class="info-value">${formatDate(
                    printData.createdAt,
                  )}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">No JO</span>
                  <span class="info-colon">:</span>
                  <span class="info-value"></span>
                </div>
                <div class="info-item">
                  <span class="info-label">Tanggal Pengiriman</span>
                  <span class="info-colon">:</span>
                  <span class="info-value">${formatDate(
                    printData.tgl_pengiriman,
                  )}</span>
                </div>
              </div>
            </div>

            <!-- Alamat Pengiriman -->
            <div class="address-line">
              <span class="address-label">Alamat Pengiriman</span>
              <span class="address-colon">:</span>
              <span class="address-value">${getValue(
                printData.alamat_pengiriman,
              )}</span>
            </div>

            <!-- Order Table -->
            <table>
              <thead>
                <tr>
                  <th style="width: 15%">Quantity</th>
                  <th style="width: 20%">Pemesan</th>
                  <th style="width: 30%">Nama Produk</th>
                  <th style="width: 12%">Harga</th>
                  <th style="width: 23%">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                <tr style="height: 40px">
                  <td class="text-center">${printData.po_qty?.toLocaleString(
                    'id-ID',
                  )}</td>
                  <td class="text-center">${getValue(printData.customer)}</td>
                  <td class="text-center">${getValue(printData.produk)}</td>
                  <td class="text-center">${printData.harga_jual}</td>
                  <td>${getValue(printData.keterangan)}</td>
                </tr>
              </tbody>
            </table>

            <!-- Total -->
            <div class="total-wrapper">
              <div class="total-box">
                <div class="total-line">
                  <span>Total</span>
                  <span>${formatCurrency(printData.total_harga)}</span>
                </div>
              </div>
            </div>

            <!-- Date -->
            <div class="date-line">
              Bandung, ${formatDate(printData.tgl_pembuatan_so)}
            </div>

            <!-- Signatures - 2 Column Grid -->
            <div class="signature-grid">
              <!-- Left Column -->
              <div>
                <div class="signature-label">Dibuat Oleh,</div>
                <div class="signature-space"></div>
                <div>.......................................</div>
                <div class="signature-name">${getValue(
                  printData.create_by,
                ).toUpperCase()}</div>
               
                <div>Tgl:</div>
              </div>

              <!-- Right Column -->
              <div>
                <div class="signature-label">Diterima Oleh,</div>
                <div class="signature-space"></div>
                <div>.......................................</div>
                <div>(Akunting)</div>
                <div>Tgl:</div>
              </div>
            </div>
          </div>

          <!-- ============ SEPARATOR ============ -->
          <div class="separator"></div>

          <!-- ============ SECOND SECTION - Form Cek List ============ -->
          <div>
            <!-- Header with Logo -->
            <div class="header-flex">
              <img src="${Logo}" alt="Logo" class="header-logo" />
              <div class="header-title">PT. CAHAYA BERLIAN LESTARI</div>
              <div class="header-label">${getValue(printData.label)}</div>
            </div>

            <!-- Title -->
            <div class="title-center">SALES ORDER</div>

            <!-- Info Grid - 2 Columns -->
            <div class="info-grid">
              <!-- Left Column -->
              <div>
                <div class="info-item">
                  <span class="info-label">No SO</span>
                  <span class="info-colon">:</span>
                  <span class="info-value">${getValue(printData.no_so)}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">No IO</span>
                  <span class="info-colon">:</span>
                  <span class="info-value">${getValue(printData.no_io)}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">No PO</span>
                  <span class="info-colon">:</span>
                  <span class="info-value">${getValue(
                    printData.no_po_customer,
                  )}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Tgl PO</span>
                  <span class="info-colon">:</span>
                  <span class="info-value">${formatDate(
                    printData.tgl_po_customer,
                  )}</span>
                </div>
              </div>

              <!-- Right Column -->
              <div>
                <div class="info-item">
                  <span class="info-label">Marketing</span>
                  <span class="info-colon">:</span>
                  <span class="info-value">${getValue(
                    printData.nama_marketing,
                  )}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Tanggal SO</span>
                  <span class="info-colon">:</span>
                  <span class="info-value">${formatDate(
                    printData.createdAt,
                  )}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">No JO</span>
                  <span class="info-colon">:</span>
                  <span class="info-value"></span>
                </div>
                <div class="info-item">
                  <span class="info-label">Tanggal Pengiriman</span>
                  <span class="info-colon">:</span>
                  <span class="info-value">${formatDate(
                    printData.tgl_pengiriman,
                  )}</span>
                </div>
              </div>
            </div>

            <!-- Alamat Pengiriman -->
            <div class="address-line">
              <span class="address-label">Alamat Pengiriman</span>
              <span class="address-colon">:</span>
              <span class="address-value">${getValue(
                printData.alamat_pengiriman,
              )}</span>
            </div>

            <!-- Order Table -->
            <table>
              <thead>
                <tr>
                  <th style="width: 25%">Pemesan</th>
                  <th style="width: 35%">Nama Produk</th>
                  <th style="width: 15%">Quantity</th>
                  <th style="width: 25%">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                <tr style="height: 35px">
                  <td class="text-center">${getValue(printData.customer)}</td>
                  <td class="text-center">${getValue(printData.produk)}</td>
                  <td class="text-center">${printData.po_qty?.toLocaleString(
                    'id-ID',
                  )}</td>
                  <td>${getValue(printData.keterangan)}</td>
                </tr>
              </tbody>
            </table>

            <!-- Form Cek List Table -->
            <div>
              <div class="form-title">FORM CEK LIST KELENGKAPAN PO</div>
              <table class="form-table">
                <tbody>
                  <tr>
                    <td style="width: 25%">Status Pemesanan</td>
                    <td style="width: 2%">:</td>
                    <td>${getValue(printData.status_pemesanan)}</td>
                  </tr>
                  <tr>
                    <td>Acuan Warna</td>
                    <td>:</td>
                    <td>${getValue(printData.acuan_warna)}</td>
                  </tr>
                  <tr>
                    <td>Artwork</td>
                    <td>:</td>
                    <td>${getValue(printData.artwork)}</td>
                  </tr>
                  <tr>
                    <td>Harga</td>
                    <td>:</td>
                    <td>${getValue(printData.harga)}</td>
                  </tr>
                  <tr>
                    <td>Status Barang</td>
                    <td>:</td>
                    <td>
                      ${getValue(printData.partial)}
                      <span style="margin-left: 100px"></span>
                      <span style="margin-left: 150px">Kirim Semua : ${getValue(
                        printData.kirim_semua,
                      )}</span>
                    </td>
                  </tr>
                  <tr>
                    <td>Note</td>
                    <td>:</td>
                    <td style="height: 50px">${getValue(printData.note)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Date -->
            <div class="date-line">
              Bandung, ${formatDate(printData.tgl_pembuatan_so)}
            </div>

            <!-- Signatures - 2 Column Grid -->
            <div class="signature-grid">
              <!-- Left Column -->
              <div>
                <div class="signature-label">Dibuat Oleh,</div>
                <div class="signature-space"></div>
                <div>(...................................)</div>
                <div class="signature-name">${getValue(
                  printData.create_by,
                ).toUpperCase()}</div>
                
              </div>

              <!-- Right Column -->
              <div>
                <div class="signature-label">PPIC</div>
                <div class="signature-space"></div>
                <div>(...................................)</div>
                <div class="signature-name">${getValue(
                  printData.ppic,
                ).toUpperCase()}</div>
              </div>
            </div>
             <!-- Approval Log -->
            <div style="margin-top: 3 0px; padding-top: 10px;  font-size: 9px;">
              <div>Approved by: ${getValue(printData.user_approve?.nama)}</div>
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
            Print Preview {printData ? `- ${printData.no_so}` : ''}
          </h2>
          <div className="flex gap-2 items-center">
            <button
              onClick={handlePrint}
              disabled={loading || !printData}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
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

        {/* Content area */}
        <div className="flex-1 overflow-auto bg-gray-600 p-8">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-full">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            </div>
          ) : printData ? (
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
                title="SO Preview"
              />
            </div>
          ) : null}
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

export default SOMarketingPrintModal;
