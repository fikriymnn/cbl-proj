// IOMarketingPrintModal.tsx
import React, { useRef } from 'react';
import Logo from '../../../../images/logo/logo-cbl 2.svg';
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
                }
                .text-center { text-align: center; }
                .font-bold { font-weight: bold; }
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
            Print Preview - {printData.no_io}
          </h2>
          <div className="flex gap-2 items-center">
            {/* Mounting selector */}
            {printData.io_mounting && printData.io_mounting.length > 1 && (
              <select
                value={selectedMountingIndex}
                onChange={(e) => onMountingIndexChange(Number(e.target.value))}
                className="px-3 py-2 rounded-lg bg-gray-700 text-black"
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
              {printData.io_mounting &&
                printData.io_mounting[selectedMountingIndex] && (
                  <>
                    {/* Header */}
                    <table className="w-full mb-2">
                      <tbody>
                        <tr>
                          <td
                            rowSpan={3}
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
                            rowSpan={3}
                            className="text-center font-bold"
                            style={{ width: '50%' }}
                          >
                            <div>PT. CAHAYA BERLIAN LESTARI</div>
                            <div className="text-lg font-bold">
                              INSTRUKSI OFFSET
                            </div>
                            <div>MARKETING: GIYONO</div>
                          </td>
                          <td className="text-center" style={{ width: '15%' }}>
                            PEMBUAT
                          </td>
                          <td className="text-center" style={{ width: '20%' }}>
                            MENYETUJUI
                          </td>
                        </tr>
                        <tr>
                          <td className="text-center">OKP</td>
                          <td className="text-center">PPIC</td>
                          <td className="text-center">QA</td>
                          <td className="text-center">KABAG PRODUKSI</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Basic Info */}
                    <table className="w-full mb-2">
                      <tbody>
                        <tr>
                          <td style={{ width: '20%' }}>Nama Pelanggan</td>
                          <td style={{ width: '30%' }}>
                            {getValue(printData.customer)}
                          </td>
                          <td style={{ width: '15%' }}>Barcode</td>
                          <td style={{ width: '15%' }}>No. IO</td>
                          <td
                            rowSpan={3}
                            className="text-center font-bold text-xl"
                          >
                            {printData.no_io}
                            <div className="text-xs">No. Revisi</div>
                            <div className="text-lg"></div>
                          </td>
                        </tr>
                        <tr>
                          <td>Nama Produk (Kode)</td>
                          <td>{getValue(printData.produk)}</td>
                        </tr>
                        <tr>
                          <td>Keterangan Revisi :</td>
                          <td colSpan={2}>
                            {getValue(
                              printData.io_mounting[selectedMountingIndex]
                                .keterangan_revisi,
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td>Ukuran Jadi</td>
                          <td>
                            A:{' '}
                            {
                              printData.io_mounting[selectedMountingIndex]
                                .ukuran_jadi_panjang
                            }{' '}
                            x{' '}
                            {
                              printData.io_mounting[selectedMountingIndex]
                                .ukuran_jadi_lebar
                            }{' '}
                            x{' '}
                            {
                              printData.io_mounting[selectedMountingIndex]
                                .ukuran_jadi_tinggi
                            }{' '}
                            mm
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Production Process */}
                    <table className="w-full mb-2">
                      <thead>
                        <tr className="bg-gray-100">
                          <th colSpan={6} className="text-center">
                            URUTAN PROSES PRODUKSI
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>1.Plate</td>
                          <td>2.Cetak 1</td>
                          <td>3.SORTIR</td>
                          <td>4.Potong</td>
                          <td>5.Lem</td>
                          <td>6.</td>
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
                      </tbody>
                    </table>

                    {/* Material */}
                    <table className="w-full mb-2">
                      <thead>
                        <tr className="bg-gray-100">
                          <th colSpan={6} className="text-center">
                            M A T E R I A L
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ width: '15%' }}></td>
                          <td style={{ width: '20%' }}>Merek/Arah Serat</td>
                          <td style={{ width: '20%' }}>Jenis</td>
                          <td style={{ width: '15%' }}>Ukuran Cetak</td>
                          <td style={{ width: '15%' }}>Ukuran Plano</td>
                          <td style={{ width: '15%' }}>Bagian</td>
                        </tr>
                        <tr>
                          <td className="font-bold">
                            A (Default)
                            <br />
                            Buku
                          </td>
                          <td>
                            {getValue(
                              printData.io_mounting[selectedMountingIndex]
                                .merk_serat_kertas,
                            )}
                          </td>
                          <td>
                            {getValue(
                              printData.io_mounting[selectedMountingIndex]
                                .jenis_kertas,
                            )}
                          </td>
                          <td>
                            {
                              printData.io_mounting[selectedMountingIndex]
                                .ukuran_cetak_panjang_1
                            }{' '}
                            x{' '}
                            {
                              printData.io_mounting[selectedMountingIndex]
                                .ukuran_cetak_lebar_1
                            }
                            <br />0 kg 0
                          </td>
                          <td>
                            {getValue(
                              `${printData.io_mounting[selectedMountingIndex].lebar_plano} x ${printData.io_mounting[selectedMountingIndex].panjang_plano}`,
                            )}
                          </td>
                          <td>
                            {
                              printData.io_mounting[selectedMountingIndex]
                                .ukuran_cetak_bagian_1
                            }
                            <br />0
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Prepress */}
                    <table className="w-full mb-2">
                      <thead>
                        <tr className="bg-gray-100">
                          <th colSpan={3} className="text-center">
                            P R E R E S S
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td colSpan={3}>LAYOUT (A)</td>
                        </tr>
                        <tr>
                          <td>Format Data</td>
                          <td colSpan={2}>
                            {getValue(
                              printData.io_mounting[selectedMountingIndex]
                                .format_data,
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td>Ukuran (pxlxt)</td>
                          <td>
                            {
                              printData.io_mounting[selectedMountingIndex]
                                .panjang_layout
                            }{' '}
                            x{' '}
                            {
                              printData.io_mounting[selectedMountingIndex]
                                .lebar_layout
                            }{' '}
                            x 0 mm
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Cetak */}
                    <table className="w-full mb-2">
                      <thead>
                        <tr className="bg-gray-100">
                          <th colSpan={3} className="text-center">
                            C E T A K
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Standar Warna No</td>
                          <td>Tanggal</td>
                          <td>Warna Depan</td>
                          <td>Warna Belakang</td>
                        </tr>
                        <tr>
                          <td>1</td>
                          <td></td>
                          <td>
                            Warna Depan :{' '}
                            {
                              printData.io_mounting[selectedMountingIndex]
                                .warna_depan
                            }
                            <br />
                            Hitam
                          </td>
                          <td>
                            Warna Belakang :{' '}
                            {
                              printData.io_mounting[selectedMountingIndex]
                                .warna_belakang
                            }
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Coating */}
                    <table className="w-full mb-2">
                      <thead>
                        <tr className="bg-gray-100">
                          <th colSpan={2} className="text-center">
                            C O A T I N G
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Coating Depan</td>
                          <td>
                            {getValue(
                              printData.io_mounting[selectedMountingIndex]
                                .nama_coating_depan,
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td>Coating Belakang</td>
                          <td>
                            {getValue(
                              printData.io_mounting[selectedMountingIndex]
                                .nama_coating_belakang,
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Pond */}
                    <table className="w-full mb-2">
                      <thead>
                        <tr className="bg-gray-100">
                          <th colSpan={4} className="text-center">
                            P O N D
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>No ID Pisau</td>
                          <td>A</td>
                          <td>B</td>
                          <td>C</td>
                          <td>D</td>
                        </tr>
                        <tr>
                          <td>
                            {getValue(
                              printData.io_mounting[selectedMountingIndex]
                                .id_layout,
                            )}
                          </td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Lem */}
                    <table className="w-full mb-2">
                      <thead>
                        <tr className="bg-gray-100">
                          <th colSpan={2} className="text-center">
                            L E M
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Proses LEM</td>
                          <td>BLOCK LEM</td>
                        </tr>
                        <tr>
                          <td>Merk & Komposisi Lem</td>
                          <td>
                            {getValue(
                              printData.io_mounting[selectedMountingIndex]
                                .merk_komp_lem,
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td>Ket Untuk Lem</td>
                          <td>Potong Jadi</td>
                        </tr>
                        <tr>
                          <td>-</td>
                          <td>Blok Lem Atas</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Packing */}
                    <table className="w-full mb-2">
                      <thead>
                        <tr className="bg-gray-100">
                          <th colSpan={2} className="text-center">
                            P A C K I N G
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Isi dalam 1 Pack</td>
                          <td>
                            {getValue(
                              printData.io_mounting[selectedMountingIndex]
                                .isi_dalam_1_pack,
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td>Tali Mata Itik bor</td>
                          <td>Jenis Packing</td>
                        </tr>
                        <tr>
                          <td></td>
                          <td>Sat</td>
                        </tr>
                        <tr>
                          <td>Lampiran IO</td>
                          <td>Keterangan</td>
                        </tr>
                        <tr>
                          <td>1 lbr Contoh Cetakan</td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="mt-4 text-xs">Printed by: HANDRI</div>
                  </>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IOMarketingPrintModal;
