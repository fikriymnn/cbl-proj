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
    nama_mounting?: string;
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
      console.log('Fetched JO Data:', response.data.data);
    } catch (error) {
      console.error('Error fetching JO data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get the selected mounting
  const getSelectedMounting = () => {
    if (!printData?.jo_mounting || printData.jo_mounting.length === 0) {
      return null;
    }

    // Find the mounting with is_selected: true
    const selectedMounting = printData.jo_mounting.find(
      (m) => m.is_selected === true,
    );

    // If no selected mounting found, fall back to the first one
    return selectedMounting || printData.jo_mounting[0];
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
    const mounting = getSelectedMounting();

    if (!mounting) {
      return { across: 0, down: 0, total: 0, isi: 0 };
    }

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
  const selectedMounting = getSelectedMounting();

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
                {selectedMounting && (
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
                            {selectedMounting.ukuran_cetak_panjang_1} X{' '}
                            {selectedMounting.ukuran_cetak_lebar_1} mm
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
                            {getValue(selectedMounting.nama_kertas)}
                          </td>
                          <td className="info-label">Gramatur</td>
                          <td colSpan={3}>
                            {selectedMounting.gramature_kertas} gsm
                          </td>
                        </tr>
                        <tr>
                          <td className="info-label">Ukuran</td>
                          <td colSpan={3}>
                            {selectedMounting.lebar_kertas} x{' '}
                            {selectedMounting.panjang_kertas} mm
                          </td>
                          <td className="info-label">JML</td>
                          <td colSpan={3}>
                            {selectedMounting.jumlah_kertas.toLocaleString()} LP
                          </td>
                        </tr>
                        <tr>
                          <td className="info-label">UK Cetak (P×L)</td>
                          <td colSpan={3}>
                            {selectedMounting.ukuran_cetak_panjang_1} x{' '}
                            {selectedMounting.ukuran_cetak_lebar_1} mm
                          </td>
                          <td className="info-label">
                            {selectedMounting.ukuran_cetak_bagian_1 || 2} Bagian
                          </td>
                          <td>Isi</td>
                          <td colSpan={2}>
                            {selectedMounting.ukuran_cetak_isi_1 || layout.isi}
                          </td>
                        </tr>
                        <tr>
                          <td className="info-label">UK Cetak (P×L)</td>
                          <td colSpan={3}>
                            {selectedMounting.ukuran_cetak_panjang_2 || 0} x{' '}
                            {selectedMounting.ukuran_cetak_lebar_2 || 0} mm
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
                              padding: '30px 20px',
                              verticalAlign: 'middle',
                              textAlign: 'center',
                              border: '1px solid black',
                              position: 'relative',
                            }}
                          >
                            {/* Nama Mounting at top left */}
                            {selectedMounting.nama_mounting && (
                              <div
                                style={{
                                  position: 'absolute',
                                  top: '8px',
                                  left: '8px',
                                  fontSize: '12px',
                                  fontWeight: 'bold',
                                  textAlign: 'left',
                                  zIndex: 5,
                                }}
                              >
                                {selectedMounting.nama_mounting}
                              </div>
                            )}

                            {/* Layout diagram */}
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                minHeight: '220px',
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
                                {(() => {
                                  // Calculate for ukuran_cetak_1
                                  const acrossX1 = Math.floor(
                                    selectedMounting.lebar_kertas /
                                      selectedMounting.ukuran_cetak_panjang_1,
                                  );
                                  const downY1 = Math.floor(
                                    selectedMounting.panjang_kertas /
                                      selectedMounting.ukuran_cetak_lebar_1,
                                  );
                                  const area1 =
                                    acrossX1 *
                                    downY1 *
                                    (selectedMounting.ukuran_cetak_bagian_1 ||
                                      1);

                                  // Calculate for ukuran_cetak_2 if exists
                                  let acrossX2 = 0;
                                  let downY2 = 0;
                                  let area2 = 0;

                                  if (
                                    selectedMounting.ukuran_cetak_panjang_2 &&
                                    selectedMounting.ukuran_cetak_lebar_2
                                  ) {
                                    acrossX2 = Math.floor(
                                      selectedMounting.lebar_kertas /
                                        selectedMounting.ukuran_cetak_panjang_2,
                                    );
                                    downY2 = Math.floor(
                                      selectedMounting.panjang_kertas /
                                        selectedMounting.ukuran_cetak_lebar_2,
                                    );
                                    area2 =
                                      acrossX2 *
                                      downY2 *
                                      (selectedMounting.ukuran_cetak_bagian_2 ||
                                        1);
                                  }

                                  const totalArea = area1 + area2;
                                  const percentage1 =
                                    totalArea > 0
                                      ? (area1 / totalArea) * 100
                                      : 100;
                                  const percentage2 =
                                    totalArea > 0
                                      ? (area2 / totalArea) * 100
                                      : 0;

                                  // Calculate used area in pixels for visual representation
                                  const boxWidth = 240;
                                  const boxHeight = 160;

                                  // Calculate how much space the cut items take (as percentage of plano)
                                  const usedWidthPercent =
                                    ((acrossX1 *
                                      selectedMounting.ukuran_cetak_panjang_1) /
                                      selectedMounting.lebar_kertas) *
                                    100;
                                  const usedHeightPercent =
                                    ((downY1 *
                                      selectedMounting.ukuran_cetak_lebar_1) /
                                      selectedMounting.panjang_kertas) *
                                    100;

                                  // Calculate waste/efficiency
                                  const usedAreaMm2_1 =
                                    acrossX1 *
                                    selectedMounting.ukuran_cetak_panjang_1 *
                                    (downY1 *
                                      selectedMounting.ukuran_cetak_lebar_1);
                                  const usedAreaMm2_2 =
                                    selectedMounting.ukuran_cetak_panjang_2 &&
                                    selectedMounting.ukuran_cetak_lebar_2
                                      ? acrossX2 *
                                        selectedMounting.ukuran_cetak_panjang_2 *
                                        (downY2 *
                                          selectedMounting.ukuran_cetak_lebar_2)
                                      : 0;

                                  const totalPlanoArea =
                                    selectedMounting.lebar_kertas *
                                    selectedMounting.panjang_kertas;
                                  const totalUsedArea =
                                    usedAreaMm2_1 + usedAreaMm2_2;
                                  const wasteArea =
                                    totalPlanoArea - totalUsedArea;
                                  const efficiency = (
                                    (totalUsedArea / totalPlanoArea) *
                                    100
                                  ).toFixed(1);

                                  // Calculate sisa dimensions
                                  const sisaLebar =
                                    selectedMounting.lebar_kertas -
                                    acrossX1 *
                                      selectedMounting.ukuran_cetak_panjang_1;
                                  const sisaPanjang =
                                    selectedMounting.panjang_kertas -
                                    downY1 *
                                      selectedMounting.ukuran_cetak_lebar_1;

                                  return (
                                    <>
                                      {/* Outer dimensions - PLANO SIZE */}
                                      {/* Top - Plano Lebar with horizontal line */}
                                      <div
                                        style={{
                                          position: 'absolute',
                                          top: '-25px',
                                          left: '0',
                                          right: '0',
                                          textAlign: 'center',
                                        }}
                                      >
                                        <div
                                          style={{
                                            fontSize: '8px',
                                            fontWeight: 'bold',
                                            marginBottom: '2px',
                                          }}
                                        >
                                          {selectedMounting.lebar_kertas}
                                        </div>
                                        <div
                                          style={{
                                            width: '100%',
                                            height: '0px',
                                            backgroundColor: 'black',
                                          }}
                                        />
                                      </div>

                                      {/* Left - Plano Panjang with vertical line */}
                                      <div
                                        style={{
                                          position: 'absolute',
                                          left: '-25px',
                                          top: '0',
                                          bottom: '0',
                                          display: 'flex',
                                          alignItems: 'center',
                                        }}
                                      >
                                        <div
                                          style={{
                                            width: '0px',
                                            height: '100%',
                                            backgroundColor: 'black',
                                            marginRight: '2px',
                                          }}
                                        />
                                        <div
                                          style={{
                                            fontSize: '8px',
                                            fontWeight: 'bold',
                                            writingMode: 'vertical-rl',
                                            textOrientation: 'mixed',
                                          }}
                                        >
                                          {selectedMounting.panjang_kertas}
                                        </div>
                                      </div>

                                      {/* Main rectangle (PLANO) */}
                                      <div
                                        style={{
                                          border: '2px solid black',
                                          backgroundColor: 'white',
                                          display: 'inline-block',
                                          position: 'relative',
                                          width: `${boxWidth}px`,
                                          height: `${boxHeight}px`,
                                        }}
                                      >
                                        {/* Top dimension with arrow - UKURAN CETAK */}
                                        <div
                                          style={{
                                            position: 'absolute',
                                            top: '5px',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            fontSize: '8px',
                                            fontWeight: 'bold',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            zIndex: 10,
                                          }}
                                        >
                                          <span>
                                            {
                                              selectedMounting.ukuran_cetak_panjang_1
                                            }
                                          </span>
                                          <span>→</span>
                                          <span>{acrossX1}x</span>
                                        </div>

                                        {/* Left dimension with arrow - UKURAN CETAK */}
                                        <div
                                          style={{
                                            position: 'absolute',
                                            left: '5px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            fontSize: '8px',
                                            fontWeight: 'bold',
                                            writingMode: 'vertical-rl',
                                            textOrientation: 'mixed',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            zIndex: 10,
                                          }}
                                        >
                                          <span>
                                            {
                                              selectedMounting.ukuran_cetak_lebar_1
                                            }
                                          </span>
                                          <span>→</span>
                                          <span>{downY1}x</span>
                                        </div>

                                        {/* Used area (white) */}
                                        <div
                                          style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: `${usedWidthPercent}%`,
                                            height: `${usedHeightPercent}%`,
                                            backgroundColor: 'white',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                          }}
                                        >
                                          {selectedMounting.ukuran_cetak_bagian_1 >
                                            1 && (
                                            <div
                                              style={{
                                                fontSize: '10px',
                                                fontWeight: 'bold',
                                              }}
                                            >
                                              1/
                                              {
                                                selectedMounting.ukuran_cetak_bagian_1
                                              }{' '}
                                              Bagian
                                            </div>
                                          )}
                                        </div>

                                        {/* Waste area - Right side (shaded) */}
                                        {sisaLebar > 0 && (
                                          <div
                                            style={{
                                              position: 'absolute',
                                              top: 0,
                                              right: 0,
                                              width: `${
                                                100 - usedWidthPercent
                                              }%`,
                                              height: `${usedHeightPercent}%`,
                                              backgroundColor:
                                                'rgba(128, 128, 128, 0.3)',
                                              border: '1px dashed #999',
                                            }}
                                          />
                                        )}

                                        {/* Waste area - Bottom side (shaded) */}
                                        {sisaPanjang > 0 && (
                                          <div
                                            style={{
                                              position: 'absolute',
                                              bottom: 0,
                                              left: 0,
                                              width: '100%',
                                              height: `${
                                                100 - usedHeightPercent
                                              }%`,
                                              backgroundColor:
                                                'rgba(128, 128, 128, 0.3)',
                                              border: '1px dashed #999',
                                            }}
                                          />
                                        )}

                                        {/* Isi at bottom right */}
                                        <div
                                          style={{
                                            position: 'absolute',
                                            bottom: '5px',
                                            right: '5px',
                                            fontSize: '8px',
                                            zIndex: 10,
                                          }}
                                        >
                                          Isi:{' '}
                                          {selectedMounting.ukuran_cetak_isi_1 ||
                                            acrossX1 *
                                              downY1 *
                                              (selectedMounting.ukuran_cetak_bagian_1 ||
                                                1)}
                                        </div>
                                      </div>

                                      {/* Bottom info - Sisa & Efficiency */}
                                      <div
                                        style={{
                                          position: 'absolute',
                                          bottom: '-25px',
                                          left: '0',
                                          right: '0',
                                          fontSize: '7px',
                                          display: 'flex',
                                          justifyContent: 'space-between',
                                        }}
                                      >
                                        <div>
                                          <strong>Sisa Potong:</strong>{' '}
                                          {sisaLebar.toFixed(0)} ×{' '}
                                          {sisaPanjang.toFixed(0)} mm
                                        </div>
                                        <div>
                                          <strong>Efisiensi:</strong>{' '}
                                          {efficiency}%
                                        </div>
                                      </div>
                                    </>
                                  );
                                })()}
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
                                    {selectedMounting.jumlah_druk_cetak?.toLocaleString()}
                                  </td>
                                  <td
                                    style={{
                                      border: '1px solid black',
                                      padding: '3px',
                                      textAlign: 'center',
                                    }}
                                  >
                                    {selectedMounting.jumlah_insheet_cetak?.toLocaleString()}
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
                                    {selectedMounting.jumlah_druk_pond?.toLocaleString()}
                                  </td>
                                  <td
                                    style={{
                                      border: '1px solid black',
                                      padding: '3px',
                                      textAlign: 'center',
                                    }}
                                  >
                                    {selectedMounting.jumlah_insheet_pond?.toLocaleString()}
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
                                    {selectedMounting.jumlah_druk_finishing?.toLocaleString()}
                                  </td>
                                  <td
                                    style={{
                                      border: '1px solid black',
                                      padding: '3px',
                                      textAlign: 'center',
                                    }}
                                  >
                                    {selectedMounting.jumlah_insheet_finishing?.toLocaleString()}
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
