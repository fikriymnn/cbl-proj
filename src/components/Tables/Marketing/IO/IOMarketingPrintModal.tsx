// IOMarketingPrintModal.tsx
import React, { useRef } from 'react';
import Logo from '../../../../images/logo/logo-cbl 1.svg';
import { MountingData } from './Mounting';

interface IOData {
  id: number;
  no_io: string;
  customer: string;
  produk: string;
  status_io: string;
  status: string;
  tgl_pembuatan_io: string;
  is_revisi: boolean;
  revisi_no_io: string;
  is_active: boolean;
  io_mounting?: MountingData[];
}

interface IOMarketingPrintModalProps {
  isOpen: boolean;
  printData: IOData | null;
  selectedMountingIndex: number;
  onClose: () => void;
  onMountingIndexChange: (index: number) => void;
}

const IOMarketingPrintModal: React.FC<IOMarketingPrintModalProps> = ({
  isOpen,
  printData,
  selectedMountingIndex,
  onClose,
  onMountingIndexChange,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  const getValue = (value: any, defaultValue: string = '-') => {
    if (value === null || value === undefined || value === '') {
      return defaultValue;
    }
    return value;
  };

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Print - ${printData?.no_io || 'IO'}</title>
              <style>
                @page {
                  size: A4 portrait;
                  margin: 10mm;
                }
                body {
                  margin: 0;
                  padding: 0;
                  font-family: Arial, sans-serif;
                  font-size: 9px;
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
                table {
                  border-collapse: collapse;
                  width: 100%;
                }
                td, th {
                  border: 1px solid black;
                  padding: 2px 4px;
                  line-height: 1.3;
                  vertical-align: top;
                }
                .text-center { text-align: center; }
                .font-bold { font-weight: bold; }
                .bg-gray { background-color: #e5e7eb; }
                .tall-row td { height: 30px; }
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

  const mounting = printData.io_mounting?.[selectedMountingIndex];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black bg-opacity-75">
      <div className="flex flex-col h-full">
        {/* Header with buttons */}
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            Print Preview - {printData.no_io}
          </h2>
          <div className="flex gap-2 items-center">
            {/* Mounting selector */}
            {printData.io_mounting && printData.io_mounting.length > 1 && (
              <select
                value={selectedMountingIndex}
                onChange={(e) => onMountingIndexChange(Number(e.target.value))}
                className="px-3 py-2 rounded-lg bg-gray-700 text-white"
              >
                {printData.io_mounting.map((mounting, index) => (
                  <option key={index} value={index}>
                    Mounting: {mounting.nama_mounting}
                  </option>
                ))}
              </select>
            )}
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
          <div className="max-w-[800px] mx-auto bg-white shadow-2xl">
            <div
              ref={printRef}
              className="print-container p-4"
              style={{ fontSize: '9px' }}
            >
              {/* Header */}
              <table className="w-full mb-2">
                <tbody>
                  <tr>
                    <td
                      rowSpan={2}
                      className="text-center"
                      style={{ width: '15%' }}
                    >
                      <img
                        src={Logo}
                        alt="Logo"
                        style={{ width: '60px', height: 'auto' }}
                      />
                    </td>
                    <td
                      rowSpan={2}
                      className="text-center font-bold"
                      style={{ width: '40%' }}
                    >
                      <div>PT. CAHAYA BERLIAN LESTARI</div>
                      <div className="text-lg font-bold">INSTRUKSI OFFSET</div>
                      <div>MARKETING: GIYONO</div>
                    </td>
                    <td className="text-center" style={{ width: '15%' }}>
                      PEMBUAT
                    </td>
                    <td
                      colSpan={2}
                      className="text-center"
                      style={{ width: '15%' }}
                    >
                      PEMERIKSA
                    </td>
                    <td className="text-center" style={{ width: '15%' }}>
                      MENYETUJUI
                    </td>
                  </tr>
                  <tr>
                    <td className="text-center">OKP</td>
                    <td className="text-center" style={{ width: '7.5%' }}>
                      PPIC
                    </td>
                    <td className="text-center" style={{ width: '7.5%' }}>
                      QA
                    </td>
                    <td className="text-center">KABAG PRODUKSI</td>
                  </tr>
                </tbody>
              </table>

              {/* Basic Info */}
              <table className="w-full mb-2">
                <tbody>
                  <tr>
                    <td style={{ width: '20%' }}>Nama Pelanggan</td>
                    <td style={{ width: '35%' }}>
                      {getValue(printData.customer)}
                    </td>
                    <td style={{ width: '15%' }}>Barcode</td>
                    <td
                      rowSpan={2}
                      className="text-center font-bold"
                      style={{ width: '15%' }}
                    >
                      No. IO
                    </td>
                    <td
                      rowSpan={2}
                      className="text-center font-bold text-2xl"
                      style={{ width: '15%' }}
                    >
                      {printData.no_io}
                    </td>
                  </tr>
                  <tr>
                    <td>Nama Produk (Kode)</td>
                    <td>{getValue(printData.produk)}</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td>Keterangan Revisi :</td>
                    <td colSpan={2}>{getValue(mounting?.keterangan_revisi)}</td>
                    <td className="text-center">No. Revisi</td>
                    <td className="text-center font-bold">
                      {printData.is_revisi ? 'Yes' : '-'}
                    </td>
                  </tr>
                  <tr>
                    <td>Ukuran Jadi</td>
                    <td colSpan={4}>
                      A: {getValue(mounting?.ukuran_jadi_panjang, '0')} x{' '}
                      {getValue(mounting?.ukuran_jadi_lebar, '0')} x{' '}
                      {getValue(mounting?.ukuran_jadi_tinggi, '0')} mm
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Production Process */}
              <table className="w-full mb-2">
                <thead>
                  <tr className="bg-gray">
                    <th colSpan={6} className="text-center">
                      URUTAN PROSES PRODUKSI
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ width: '16.66%' }}>1.Plate</td>
                    <td style={{ width: '16.66%' }}>2.Cetak 1</td>
                    <td style={{ width: '16.66%' }}>3.SORTIR</td>
                    <td style={{ width: '16.66%' }}>4.Potong</td>
                    <td style={{ width: '16.66%' }}>5.Lem</td>
                    <td style={{ width: '16.66%' }}>6.</td>
                  </tr>
                  <tr>
                    <td>GTO</td>
                    <td>GTO</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td>7.</td>
                    <td>8.</td>
                    <td>9.</td>
                    <td>10.</td>
                    <td>11.</td>
                    <td>12.</td>
                  </tr>
                  <tr>
                    <td style={{ height: '12px' }}></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                </tbody>
              </table>

              {/* Material */}
              <table className="w-full mb-2">
                <thead>
                  <tr className="bg-gray">
                    <th colSpan={7} className="text-center">
                      M A T E R I A L
                    </th>
                  </tr>
                  <tr>
                    <td style={{ width: '12%' }}></td>
                    <td style={{ width: '18%' }}>Merek/Arah Serat</td>
                    <td style={{ width: '18%' }}>Jenis</td>
                    <td style={{ width: '18%' }}>Ukuran Cetak</td>
                    <td style={{ width: '18%' }}>Ukuran Plano</td>
                    <td style={{ width: '8%' }}>Bagian</td>
                    <td style={{ width: '8%' }}>Gramatur</td>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-bold">
                      A (Default)
                      <br />
                      Buku
                    </td>
                    <td>{getValue(mounting?.merk_serat_kertas)}</td>
                    <td>{getValue(mounting?.jenis_kertas)}</td>
                    <td>
                      {getValue(mounting?.ukuran_cetak_panjang_1, '0')} x{' '}
                      {getValue(mounting?.ukuran_cetak_lebar_1, '0')}
                      <br />0 kg 0
                    </td>
                    <td>
                      {getValue(mounting?.lebar_plano, '0')} x{' '}
                      {getValue(mounting?.panjang_plano, '0')}
                    </td>
                    <td className="text-center">
                      {getValue(mounting?.ukuran_cetak_bagian_1, '0')}
                      <br />0
                    </td>
                    <td className="text-center">
                      {getValue(mounting?.gramature_kertas, '0')}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* PREPRESS - Fixed structure to match image */}
              <table className="w-full mb-2">
                <thead>
                  <tr className="bg-gray">
                    <th colSpan={6} className="text-center">
                      P R E R E S S
                    </th>
                  </tr>
                  <tr>
                    <th colSpan={2} className="text-center">
                      LAYOUT (A)
                    </th>
                    <th colSpan={2} className="text-center">
                      LAYOUT (B)
                    </th>
                    <th colSpan={2} className="text-center">
                      LAYOUT (C)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ width: '16.66%' }}>Format Data</td>
                    <td style={{ width: '16.66%' }}>
                      {getValue(mounting?.format_data)}
                    </td>
                    <td style={{ width: '16.66%' }}>Format Data</td>
                    <td style={{ width: '16.66%' }}>-</td>
                    <td style={{ width: '16.66%' }}>Format Data</td>
                    <td style={{ width: '16.66%' }}>-</td>
                  </tr>
                  <tr>
                    <td>Ukuran (pxlxt)</td>
                    <td>
                      {getValue(mounting?.panjang_layout, '0')} x{' '}
                      {getValue(mounting?.lebar_layout, '0')} x 0 mm
                    </td>
                    <td>Ukuran (pxlxt)</td>
                    <td>0 x 0 x 0 mm</td>
                    <td>Ukuran (pxlxt)</td>
                    <td>0 x 0 x 0 mm</td>
                  </tr>
                  <tr>
                    <td>Ukuran Terbentang</td>
                    <td>0 x 0 mm</td>
                    <td>Ukuran Terbentang</td>
                    <td>0 x 0 mm</td>
                    <td>Ukuran Terbentang</td>
                    <td>0 x 0 mm</td>
                  </tr>
                  <tr>
                    <td>Isi A</td>
                    <td>{getValue(mounting?.ukuran_cetak_isi_1, '0')}</td>
                    <td>Isi A</td>
                    <td>0</td>
                    <td>Isi A</td>
                    <td>0</td>
                  </tr>
                  <tr>
                    <td>Isi B</td>
                    <td>0</td>
                    <td>Isi B</td>
                    <td>0</td>
                    <td>Isi B</td>
                    <td>0</td>
                  </tr>
                  <tr>
                    <td>Ukuran Layout(pascres)</td>
                    <td>0 x 0</td>
                    <td>Ukuran Layout(pascres)</td>
                    <td>0 x 0</td>
                    <td>Ukuran Layout(pascres)</td>
                    <td>0 x 0</td>
                  </tr>
                </tbody>
              </table>

              {/* Cetak */}
              <table className="w-full mb-2">
                <thead>
                  <tr className="bg-gray">
                    <th colSpan={4} className="text-center">
                      C E T A K
                    </th>
                  </tr>
                  <tr>
                    <td style={{ width: '25%' }}>Standar Warna No</td>
                    <td style={{ width: '25%' }}>Tanggal</td>
                    <td style={{ width: '25%' }}>Warna Depan</td>
                    <td style={{ width: '25%' }}>Warna Belakang</td>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td></td>
                    <td>
                      Warna Depan : {getValue(mounting?.warna_depan, '0')}
                      <br />
                      Hitam
                    </td>
                    <td>
                      Warna Belakang : {getValue(mounting?.warna_belakang, '0')}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Coating */}
              <table className="w-full mb-2">
                <thead>
                  <tr className="bg-gray">
                    <th colSpan={4} className="text-center">
                      C O A T I N G
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ width: '25%' }}>Coating Depan</td>
                    <td style={{ width: '25%' }}>Komposisi</td>
                    <td style={{ width: '25%' }}>Coating Belakang</td>
                    <td style={{ width: '25%' }}>Komposisi</td>
                  </tr>
                  <tr>
                    <td>{getValue(mounting?.nama_coating_depan)}</td>
                    <td></td>
                    <td>{getValue(mounting?.nama_coating_belakang)}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>

              {/* Pond and Lem side by side */}
              <table className="w-full mb-2">
                <thead>
                  <tr className="bg-gray">
                    <th colSpan={5} className="text-center">
                      P O N D
                    </th>
                    <th colSpan={2} className="text-center">
                      L E M
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ width: '14.28%' }}>No ID Pisau</td>
                    <td style={{ width: '14.28%' }}>A</td>
                    <td style={{ width: '14.28%' }}>B</td>
                    <td style={{ width: '14.28%' }}>C</td>
                    <td style={{ width: '14.28%' }}>D</td>
                    <td style={{ width: '14.28%' }}>Proses LEM</td>
                    <td style={{ width: '14.28%' }}>BLOCK LEM</td>
                  </tr>
                  <tr>
                    <td>{getValue(mounting?.id_layout)}</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>
                      Merk & Komposisi
                      <br />
                      Lem
                    </td>
                    <td>{getValue(mounting?.merk_komp_lem)}</td>
                  </tr>
                  <tr>
                    <td colSpan={5}></td>
                    <td>Ket Untuk Lem</td>
                    <td>Potong Jadi</td>
                  </tr>
                  <tr>
                    <td colSpan={5} className="bg-gray text-center font-bold">
                      L A I N - L A I N
                    </td>
                    <td>-</td>
                    <td>Blok Lem Atas</td>
                  </tr>
                  <tr>
                    <td colSpan={5} rowSpan={3}>
                      Tali Mata Itik
                      <br />
                      bor
                    </td>
                    <td colSpan={2} className="bg-gray text-center font-bold">
                      P A C K I N G
                    </td>
                  </tr>
                  <tr>
                    <td>Isi dalam 1 Pack</td>
                    <td>{getValue(mounting?.isi_dalam_1_pack)}</td>
                  </tr>
                  <tr>
                    <td>Jenis Packing</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td colSpan={5}>
                      Lampiran IO
                      <br />1 lbr Contoh Cetakan
                    </td>
                    <td>Sat</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td colSpan={5}></td>
                    <td>Keterangan</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IOMarketingPrintModal;
