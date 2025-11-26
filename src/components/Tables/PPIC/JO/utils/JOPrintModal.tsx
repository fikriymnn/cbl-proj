// JOPrintModal.tsx
import React, { useRef, useEffect, useState } from 'react';
import Logo from '../../../../../images/logo/logo-cbl 1.svg';
import axios from 'axios';

interface JOPrintData {
  id: number;
  no_jo: string;
  no_so: string;
  no_io: string;
  no_po_customer: string;
  tgl_po_customer: string;
  customer: string;
  produk: string;
  qty: number;
  po_qty: number;
  tgl_kirim: string;
  tgl_pengiriman: string;
  spesifikasi: string;
  keterangan_pengerjaan: string;
  toleransi: string;
  alamat_pengiriman: string;
  standar_warna: string;
  tipe_jo: string;
  stok_fg: number;
  createdAt: string;
  status: string;
  status_jo: string;
  status_kalkulasi: string;
  status_proses: string;
  tgl_approve_jo: string;
  tgl_pembuatan_jo: string;
  id_customer: number;
  id_io: number;
  id_produk: number;
  id_so: number;
  id_approve_jo: number;
  id_create_jo: number;
  is_active: boolean;
  label: string | null;
  note_reject: string | null;
  qty_druk: number | null;
  updatedAt: string;

  // JO Mounting details - this is the array that contains mounting data
  jo_mounting?: Array<{
    id: number;
    id_jo: number;
    id_io_mounting: number;
    id_kertas: number;
    nama_kertas: string;
    gramature_kertas: number;
    panjang_kertas: number;
    lebar_kertas: number;
    jumlah_kertas: number;
    ukuran_cetak_panjang_1: number;
    ukuran_cetak_lebar_1: number;
    ukuran_cetak_bagian_1: number;
    ukuran_cetak_isi_1: number;
    ukuran_cetak_panjang_2: number;
    ukuran_cetak_lebar_2: number;
    ukuran_cetak_bagian_2: number;
    ukuran_cetak_isi_2: number;
    jumlah_druk_cetak: number;
    jumlah_insheet_cetak: number;
    jumlah_druk_pond: number;
    jumlah_insheet_pond: number;
    jumlah_druk_finishing: number;
    jumlah_insheet_finishing: number;
    jumlah_cetak_1: number;
    jumlah_cetak_2: number;
    tambahan_insheet_1: number;
    tambahan_insheet_2: number;
    total_insheet: number;
    is_selected: boolean;
    is_active: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
}

interface JOPrintModalProps {
  isOpen: boolean;
  joId: number | null;
  onClose: () => void;
}

interface LayoutCalculation {
  across: number; // How many fit horizontally
  down: number; // How many fit vertically
  total: number; // Total per sheet
  isi: number; // Based on ukuran_cetak_isi_1
}

const JOPrintModal: React.FC<JOPrintModalProps> = ({
  isOpen,
  joId,
  onClose,
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [printData, setPrintData] = useState<JOPrintData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && joId) {
      fetchJOData();
    }
  }, [isOpen, joId]);

  const fetchJOData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_LINK}/ppic/jo/${joId}`,
        { withCredentials: true },
      );

      if (response.data.succes) {
        setPrintData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching JO data:', error);
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
    return `${year}-${month}-${day}`;
  };

  // Calculate layout based on plano size and cetak size
  const calculateLayout = (): LayoutCalculation => {
    if (!printData?.jo_mounting || printData.jo_mounting.length === 0) {
      return { across: 0, down: 0, total: 0, isi: 0 };
    }

    const mounting = printData.jo_mounting[0];
    const {
      panjang_kertas,
      lebar_kertas,
      ukuran_cetak_panjang_1,
      ukuran_cetak_lebar_1,
      ukuran_cetak_bagian_1,
      ukuran_cetak_isi_1,
    } = mounting;

    // Calculate how many fit across (horizontal)
    const across = Math.floor(panjang_kertas / ukuran_cetak_panjang_1);

    // Calculate how many fit down (vertical)
    const down = Math.floor(lebar_kertas / ukuran_cetak_lebar_1);

    // Total items per sheet
    const total = across * down;

    // Isi calculation
    const isi = ukuran_cetak_isi_1 || total * (ukuran_cetak_bagian_1 || 1);

    return { across, down, total, isi };
  };

  const getProcessTableRows = () => {
    const processes = [
      { name: 'Potong', mesin: 'ITTOH' },
      { name: 'Plate', mesin: 'CTP' },
      { name: 'CETAK', mesin: 'R700' },
      { name: 'WATERBASE', mesin: 'HOCK' },
      { name: 'POND', mesin: 'BAODER' },
      { name: 'RABUT', mesin: 'MANUAL' },
      { name: 'SORTIR', mesin: 'MANUAL' },
      { name: 'LEM SAMPING', mesin: 'JK 650' },
      { name: 'SAMPLING', mesin: 'MANUAL' },
      { name: 'FINAL INSPECTION', mesin: 'MANUAL' },
    ];

    // Since your data structure doesn't have tahapan data,
    // just return the default processes
    // If you add tahapan data to jo_mounting in the future, you can update this

    return processes;
  };

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Print JO - ${printData?.no_jo || 'Job Order'}</title>
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
                  font-size: 8px;
                  line-height: 1.2;
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
                .header-table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-bottom: 8px;
                }
                .header-table td {
                  border: 1px solid black;
                  padding: 3px 5px;
                  font-size: 8px;
                }
                .logo-cell {
                  width: 80px;
                  text-align: center;
                  vertical-align: middle;
                }
                .logo {
                  width: 50px;
                  height: auto;
                }
                .company-name {
                  font-size: 10px;
                  font-weight: bold;
                  text-align: center;
                }
                .title {
                  text-align: center;
                  font-weight: bold;
                }
                .qr-cell {
                  width: 100px;
                  text-align: center;
                  vertical-align: middle;
                  position: relative;
                }
                .qr-code {
                  width: 60px;
                  height: 60px;
                }
                .form-code {
                  position: absolute;
                  top: 3px;
                  right: 3px;
                  font-size: 7px;
                  font-weight: bold;
                }
                .info-table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-bottom: 8px;
                  font-size: 7px;
                }
                .info-table td {
                  border: 1px solid black;
                  padding: 2px 4px;
                  vertical-align: top;
                }
                .info-label {
                  width: 100px;
                  font-weight: bold;
                }
                .info-colon {
                  width: 10px;
                }
                .section-title {
                  font-weight: bold;
                  background-color: #f0f0f0;
                  text-align: center;
                  padding: 4px;
                }
                .warna-table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-bottom: 8px;
                  font-size: 7px;
                }
                .warna-table td, .warna-table th {
                  border: 1px solid black;
                  padding: 2px 4px;
                }
                .warna-table th {
                  background-color: #f0f0f0;
                  font-weight: bold;
                  text-align: center;
                }
                .layout-container {
                  margin: 10px 0;
                  padding: 10px;
                  position: relative;
                }
                .process-table {
                  width: 100%;
                  border-collapse: collapse;
                  font-size: 7px;
                  margin-top: 8px;
                }
                .process-table td, .process-table th {
                  border: 1px solid black;
                  padding: 3px 5px;
                  text-align: center;
                }
                .process-table th {
                  background-color: #f0f0f0;
                  font-weight: bold;
                }
                .signature-section {
                  margin-top: 15px;
                  display: grid;
                  grid-template-columns: repeat(4, 1fr);
                  gap: 10px;
                  text-align: center;
                  font-size: 7px;
                }
                .signature-box {
                  border: 1px solid black;
                  padding: 5px;
                  min-height: 60px;
                }
                .signature-title {
                  font-weight: bold;
                  margin-bottom: 30px;
                }
                .signature-line {
                  margin-top: 5px;
                }
                .date-location {
                  text-align: right;
                  margin: 10px 0;
                  font-size: 7px;
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

  if (!isOpen) return null;

  const layout = calculateLayout();

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black bg-opacity-75">
      <div className="flex flex-col h-full">
        {/* Header with buttons */}
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            Print Preview - {printData?.no_jo || 'Loading...'}
          </h2>
          <div className="flex gap-2 items-center">
            <button
              onClick={handlePrint}
              disabled={loading || !printData}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50"
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
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-white text-xl">Loading...</div>
            </div>
          ) : !printData ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-white text-xl">No data available</div>
            </div>
          ) : (
            <div className="max-w-[210mm] mx-auto bg-white shadow-2xl p-6">
              <div ref={printRef}>
                {/* Header Table */}
                <table className="header-table">
                  <tbody>
                    <tr>
                      <td rowSpan={2} className="logo-cell">
                        <img src={Logo} alt="Logo" className="logo" />
                      </td>
                      <td className="info-label">No JO</td>
                      <td>{getValue(printData.no_jo)}</td>
                      <td rowSpan={4} className="qr-cell">
                        <div className="form-code">FM-PPIC-001</div>
                        {/* QR Code placeholder */}
                        <div
                          className="qr-code"
                          style={{
                            border: '1px solid #ccc',
                            margin: '0 auto',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '6px',
                            color: '#999',
                          }}
                        >
                          QR CODE
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="info-label">No IO</td>
                      <td>{getValue(printData.no_io)}</td>
                    </tr>
                    <tr>
                      <td className="company-name" rowSpan={2}>
                        PT. CAHAYA BERLIAN LESTARI
                        <br />
                        <span style={{ fontSize: '9px' }}>JOB ORDER</span>
                      </td>
                      <td className="info-label">No JO</td>
                      <td>{getValue(printData.no_jo)}</td>
                    </tr>
                    <tr>
                      <td className="info-label">No IO</td>
                      <td>{getValue(printData.no_io)}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Main Info Table */}
                <table className="info-table">
                  <tbody>
                    <tr>
                      <td className="info-label">Pemesan</td>
                      <td className="info-colon">:</td>
                      <td colSpan={3}>{getValue(printData.customer)}</td>
                      <td className="info-label">DUS</td>
                      <td className="info-label">Marketing</td>
                      <td className="info-colon">:</td>
                      <td>TS</td>
                    </tr>
                    <tr>
                      <td className="info-label">Nama Produk</td>
                      <td className="info-colon">:</td>
                      <td colSpan={3}>{getValue(printData.produk)}</td>
                      <td rowSpan={4}></td>
                      <td className="info-label">Tanggal JO</td>
                      <td className="info-colon">:</td>
                      <td>{formatDate(printData.createdAt)}</td>
                    </tr>
                    <tr>
                      <td className="info-label">Spesifikasi</td>
                      <td className="info-colon">:</td>
                      <td colSpan={3}>{getValue(printData.spesifikasi)}</td>
                      <td className="info-label">No SO</td>
                      <td className="info-colon">:</td>
                      <td>{getValue(printData.no_so)}</td>
                    </tr>
                    <tr>
                      <td className="info-label">Quantity PO</td>
                      <td className="info-colon">:</td>
                      <td>{printData.po_qty?.toLocaleString()}</td>
                      <td className="info-label">Qty Produksi</td>
                      <td>{printData.qty?.toLocaleString()}</td>
                      <td className="info-label">No PO</td>
                      <td className="info-colon">:</td>
                      <td>{getValue(printData.no_po_customer)}</td>
                    </tr>
                    <tr>
                      <td className="info-label">Keterangan</td>
                      <td className="info-colon">:</td>
                      <td>{getValue(printData.keterangan_pengerjaan)}</td>
                      <td className="info-label">Stok FG</td>
                      <td>{printData.stok_fg?.toLocaleString() || 0}</td>
                      <td className="info-label">Tgl PO</td>
                      <td className="info-colon">:</td>
                      <td>{formatDate(printData.tgl_po_customer)}</td>
                    </tr>
                    <tr>
                      <td className="info-label">Repeat Ke</td>
                      <td className="info-colon">:</td>
                      <td colSpan={3}>{getValue(printData.tipe_jo)}</td>
                      <td></td>
                      <td className="info-label">Tgl Pengiriman</td>
                      <td className="info-colon">:</td>
                      <td>{formatDate(printData.tgl_kirim)}</td>
                    </tr>
                    <tr>
                      <td colSpan={5}></td>
                      <td></td>
                      <td className="info-label">Toleransi Pengiriman</td>
                      <td className="info-colon">:</td>
                      <td>{getValue(printData.toleransi, '3D')}</td>
                    </tr>
                  </tbody>
                </table>

                {/* UK & WARNA Section */}
                {printData.jo_mounting && printData.jo_mounting.length > 0 && (
                  <>
                    <table className="warna-table">
                      <thead>
                        <tr>
                          <th colSpan={4}>UK & WARNA</th>
                          <th colSpan={2}>Terbentang</th>
                          <th colSpan={2}>
                            {layout.across} X {layout.down} = {layout.total}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="info-label">Ukuran Jadi</td>
                          <td colSpan={3}>
                            {printData.jo_mounting[0].ukuran_cetak_panjang_1} X{' '}
                            {printData.jo_mounting[0].ukuran_cetak_lebar_1} mm
                          </td>
                          <td colSpan={4}></td>
                        </tr>
                        <tr>
                          <td className="info-label">Warna Depan</td>
                          <td colSpan={3}>{printData.spesifikasi}</td>
                          <td colSpan={4}></td>
                        </tr>
                      </tbody>
                    </table>

                    {/* KERTAS Section */}
                    <table className="warna-table">
                      <thead>
                        <tr>
                          <th colSpan={8}>KERTAS</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="info-label">Jenis Kertas</td>
                          <td colSpan={3}>
                            {getValue(printData.jo_mounting[0].nama_kertas)}
                          </td>
                          <td className="info-label">Gramatur</td>
                          <td colSpan={3}>
                            {printData.jo_mounting[0].gramature_kertas} gsm
                          </td>
                        </tr>
                        <tr>
                          <td className="info-label">Ukuran</td>
                          <td colSpan={3}>
                            {printData.jo_mounting[0].lebar_kertas} x{' '}
                            {printData.jo_mounting[0].panjang_kertas} mm
                          </td>
                          <td className="info-label">JML</td>
                          <td colSpan={3}>
                            {printData.jo_mounting[0].jumlah_kertas.toLocaleString()}{' '}
                            LP
                          </td>
                        </tr>
                        <tr>
                          <td className="info-label">UK Cetak (P×L)</td>
                          <td colSpan={3}>
                            {printData.jo_mounting[0].ukuran_cetak_panjang_1} x{' '}
                            {printData.jo_mounting[0].ukuran_cetak_lebar_1} mm
                          </td>
                          <td className="info-label">
                            {printData.jo_mounting[0].ukuran_cetak_bagian_1 ||
                              2}{' '}
                            Bagian
                          </td>
                          <td>Isi</td>
                          <td colSpan={2}>
                            {printData.jo_mounting[0].ukuran_cetak_isi_1 ||
                              layout.isi}
                          </td>
                        </tr>
                        <tr>
                          <td className="info-label">UK Cetak (P×L)</td>
                          <td colSpan={3}>
                            {printData.jo_mounting[0].ukuran_cetak_panjang_2 ||
                              0}{' '}
                            x{' '}
                            {printData.jo_mounting[0].ukuran_cetak_lebar_2 || 0}{' '}
                            mm
                          </td>
                          <td className="info-label">0 Bagian</td>
                          <td>Isi</td>
                          <td colSpan={2}>0</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* KERTAS POTONG Section */}
                    <table
                      className="warna-table"
                      style={{ pageBreakInside: 'avoid', marginTop: '8px' }}
                    >
                      <tbody>
                        <tr>
                          <td
                            style={{
                              width: '100px',
                              fontWeight: 'bold',
                              verticalAlign: 'middle',
                              textAlign: 'center',
                              fontSize: '9px',
                              border: '1px solid black',
                              padding: '5px',
                            }}
                          >
                            KERTAS
                            <br />
                            POTONG
                          </td>
                          <td
                            style={{
                              width: '350px',
                              padding: '20px',
                              verticalAlign: 'middle',
                              textAlign: 'center',
                              border: '1px solid black',
                              position: 'relative',
                            }}
                          >
                            {/* Layout diagram */}
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                minHeight: '180px',
                                position: 'relative',
                              }}
                            >
                              <div
                                style={{
                                  position: 'relative',
                                  display: 'inline-block',
                                  margin: '30px',
                                }}
                              >
                                {/* Top dimension */}
                                <div
                                  style={{
                                    position: 'absolute',
                                    top: '-25px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    fontSize: '8px',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  {printData.jo_mounting[0].panjang_kertas}
                                </div>

                                {/* Top arrows */}
                                <div
                                  style={{
                                    position: 'absolute',
                                    top: '-15px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    fontSize: '8px',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  ← {layout.across}x →
                                </div>

                                {/* Left dimension */}
                                <div
                                  style={{
                                    position: 'absolute',
                                    left: '-45px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    fontSize: '8px',
                                    fontWeight: 'bold',
                                    writingMode: 'vertical-rl',
                                    textOrientation: 'mixed',
                                  }}
                                >
                                  {printData.jo_mounting[0].lebar_kertas}
                                </div>

                                {/* Left arrows */}
                                <div
                                  style={{
                                    position: 'absolute',
                                    left: '-20px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    fontSize: '8px',
                                    writingMode: 'vertical-rl',
                                    textOrientation: 'mixed',
                                  }}
                                >
                                  ↑ {layout.down}x ↓
                                </div>

                                {/* Grid box */}
                                <div
                                  style={{
                                    border: '2px solid black',
                                    backgroundColor: 'white',
                                    display: 'inline-block',
                                    position: 'relative',
                                  }}
                                >
                                  <table style={{ borderCollapse: 'collapse' }}>
                                    <tbody>
                                      {Array.from({ length: layout.down }).map(
                                        (_, row) => (
                                          <tr key={row}>
                                            {Array.from({
                                              length: layout.across,
                                            }).map((_, col) => (
                                              <td
                                                key={col}
                                                style={{
                                                  border: '0.5px solid #666',
                                                  width: '30px',
                                                  height: '30px',
                                                }}
                                              />
                                            ))}
                                          </tr>
                                        ),
                                      )}
                                    </tbody>
                                  </table>

                                  {/* Center text */}
                                  {printData.jo_mounting[0]
                                    .ukuran_cetak_bagian_1 > 1 && (
                                    <div
                                      style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        fontSize: '11px',
                                        fontWeight: 'bold',
                                      }}
                                    >
                                      1/
                                      {
                                        printData.jo_mounting[0]
                                          .ukuran_cetak_bagian_1
                                      }{' '}
                                      Bagian
                                    </div>
                                  )}
                                </div>

                                {/* Bottom Isi */}
                                <div
                                  style={{
                                    position: 'absolute',
                                    bottom: '-20px',
                                    right: '0',
                                    fontSize: '8px',
                                  }}
                                >
                                  Isi: {layout.isi}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td
                            style={{
                              padding: '5px',
                              verticalAlign: 'top',
                              border: '1px solid black',
                            }}
                          >
                            {/* Right side process table */}
                            <table
                              style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                fontSize: '7px',
                                marginBottom: '5px',
                              }}
                            >
                              <thead>
                                <tr>
                                  <th
                                    style={{
                                      border: '1px solid black',
                                      padding: '3px',
                                      backgroundColor: '#f0f0f0',
                                    }}
                                  >
                                    Proses
                                  </th>
                                  <th
                                    style={{
                                      border: '1px solid black',
                                      padding: '3px',
                                      backgroundColor: '#f0f0f0',
                                    }}
                                  >
                                    Jml Druk
                                  </th>
                                  <th
                                    style={{
                                      border: '1px solid black',
                                      padding: '3px',
                                      backgroundColor: '#f0f0f0',
                                    }}
                                  >
                                    Insheet
                                  </th>
                                  <th
                                    style={{
                                      border: '1px solid black',
                                      padding: '3px',
                                      backgroundColor: '#f0f0f0',
                                    }}
                                  ></th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td
                                    style={{
                                      border: '1px solid black',
                                      padding: '3px',
                                    }}
                                  >
                                    Cetak
                                  </td>
                                  <td
                                    style={{
                                      border: '1px solid black',
                                      padding: '3px',
                                      textAlign: 'center',
                                    }}
                                  >
                                    {printData.jo_mounting[0].jumlah_druk_cetak?.toLocaleString()}
                                  </td>
                                  <td
                                    style={{
                                      border: '1px solid black',
                                      padding: '3px',
                                      textAlign: 'center',
                                    }}
                                  >
                                    {printData.jo_mounting[0].jumlah_insheet_cetak?.toLocaleString()}
                                  </td>
                                  <td
                                    style={{
                                      border: '1px solid black',
                                      padding: '3px',
                                    }}
                                  >
                                    druk
                                  </td>
                                </tr>
                                <tr>
                                  <td
                                    style={{
                                      border: '1px solid black',
                                      padding: '3px',
                                    }}
                                  >
                                    Ponds
                                  </td>
                                  <td
                                    style={{
                                      border: '1px solid black',
                                      padding: '3px',
                                      textAlign: 'center',
                                    }}
                                  >
                                    {printData.jo_mounting[0].jumlah_druk_pond?.toLocaleString()}
                                  </td>
                                  <td
                                    style={{
                                      border: '1px solid black',
                                      padding: '3px',
                                      textAlign: 'center',
                                    }}
                                  >
                                    {printData.jo_mounting[0].jumlah_insheet_pond?.toLocaleString()}
                                  </td>
                                  <td
                                    style={{
                                      border: '1px solid black',
                                      padding: '3px',
                                    }}
                                  >
                                    druk
                                  </td>
                                </tr>
                                <tr>
                                  <td
                                    style={{
                                      border: '1px solid black',
                                      padding: '3px',
                                    }}
                                  >
                                    Finishing
                                  </td>
                                  <td
                                    style={{
                                      border: '1px solid black',
                                      padding: '3px',
                                      textAlign: 'center',
                                    }}
                                  >
                                    {printData.jo_mounting[0].jumlah_druk_finishing?.toLocaleString()}
                                  </td>
                                  <td
                                    style={{
                                      border: '1px solid black',
                                      padding: '3px',
                                      textAlign: 'center',
                                    }}
                                  >
                                    {printData.jo_mounting[0].jumlah_insheet_finishing?.toLocaleString()}
                                  </td>
                                  <td
                                    style={{
                                      border: '1px solid black',
                                      padding: '3px',
                                    }}
                                  >
                                    druk
                                  </td>
                                </tr>
                              </tbody>
                            </table>

                            {/* Keterangan */}
                            <div
                              style={{
                                border: '1px solid black',
                                padding: '5px',
                                fontSize: '7px',
                                marginBottom: '5px',
                              }}
                            >
                              <div
                                style={{
                                  fontWeight: 'bold',
                                  marginBottom: '3px',
                                }}
                              >
                                Keterangan Pengerjaan :
                              </div>
                              <div style={{ minHeight: '40px' }}>
                                {getValue(printData.keterangan_pengerjaan)}
                              </div>
                            </div>

                            {/* Pakai Ukuran Standar */}
                            <div
                              style={{
                                border: '1px solid black',
                                padding: '5px',
                                fontSize: '7px',
                                minHeight: '30px',
                              }}
                            >
                              Pakai Ukuran Standar
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </>
                )}

                {/* Process Table */}
                <table className="process-table">
                  <thead>
                    <tr>
                      <th>Proses</th>
                      <th>Mesin</th>
                      <th>Baik</th>
                      <th>Rs</th>
                      <th>Rt</th>
                      <th>Keterangan</th>
                      <th>Paraf</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getProcessTableRows().map((process, index) => (
                      <tr key={index}>
                        <td>{process.name}</td>
                        <td>{process.mesin}</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Delivery Info */}
                <table className="info-table" style={{ marginTop: '10px' }}>
                  <tbody>
                    <tr>
                      <td className="info-label">Pengiriman Ke</td>
                      <td className="info-colon">:</td>
                      <td colSpan={3}>{getValue(printData.customer)}</td>
                    </tr>
                    <tr>
                      <td className="info-label">Alamat</td>
                      <td className="info-colon">:</td>
                      <td colSpan={3}>
                        {getValue(printData.alamat_pengiriman)}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Date and Signatures */}
                <div className="date-location">
                  Bandung, {formatDate(new Date().toISOString())}
                </div>

                <div className="signature-section">
                  <div className="signature-box">
                    <div className="signature-title">(PPIC)</div>
                    <div className="signature-line">Tgl:</div>
                  </div>
                  <div className="signature-box">
                    <div className="signature-title">(SPV PPIC)</div>
                    <div className="signature-line">Tgl:</div>
                  </div>
                  <div className="signature-box">
                    <div className="signature-title">(Prepress)</div>
                    <div className="signature-line">Tgl:</div>
                  </div>
                  <div className="signature-box">
                    <div className="signature-title">(Ponda)</div>
                    <div className="signature-line">Tgl:</div>
                  </div>
                  <div className="signature-box">
                    <div className="signature-title">(Printing)</div>
                    <div className="signature-line">Tgl:</div>
                  </div>
                  <div className="signature-box">
                    <div className="signature-title">(Finishing)</div>
                    <div className="signature-line">Tgl:</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default JOPrintModal;
