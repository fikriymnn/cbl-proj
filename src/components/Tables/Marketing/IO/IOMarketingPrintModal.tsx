// IOMarketingPrintModal.tsx
import React from 'react';
import Logo from '../../../../images/logo/logo-cbl 1.svg';
import { IOData } from '../IO/types/IOTypes';

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
  const getValue = (value: any, defaultValue: string = '-') => {
    if (value === null || value === undefined || value === '') {
      return defaultValue;
    }
    return value;
  };

  const getRevisionNumber = (noIO: string, revisiKe: number): string => {
    if (!noIO) return '0';
    if (revisiKe === 0) return '0';

    const parts = noIO.split('/');
    if (parts.length === 0) return '0';

    const basePart = parts[0];
    const dashCount = (basePart.match(/-/g) || []).length;

    if (dashCount >= 2) {
      const lastDashIndex = basePart.lastIndexOf('-');
      const potentialRevision = basePart.substring(lastDashIndex + 1);
      const revisionMatch = potentialRevision.match(/^(\d+)[A-Z]?$/);
      if (revisionMatch) {
        return revisionMatch[1];
      }
    } else if (dashCount === 1) {
      const dashIndex = basePart.indexOf('-');
      const afterDash = basePart.substring(dashIndex + 1);
      const revisionMatch = afterDash.match(/^(\d+)[A-Z]?$/);
      if (revisionMatch) {
        return revisionMatch[1];
      }
    }

    return revisiKe > 0 ? revisiKe.toString() : 'No';
  };

  const getBaseIONumber = (noIO: string): string => {
    if (!noIO) return '-';
    const parts = noIO.split('/');

    if (parts.length >= 3) {
      const basePart = parts[0];
      const numberMatch = basePart.match(/IO-(\d+)/);
      if (numberMatch) {
        return numberMatch[1];
      }
    }

    return noIO;
  };

  const formatDateTime = (dateString: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusLabel = (status: string): string => {
    const statusMap: { [key: string]: string } = {
      requested: 'Requested',
      approve: 'Approved',
      draft: 'Draft',
      'reject npd': 'Rejected NPD',
      done: 'Done',
    };
    return statusMap[status] || status;
  };

  // Get marketing name from the nested structure
  const getMarketingName = (): string => {
    try {
      const marketingName =
        printData?.okp?.kalkulasi?.marketing?.data_karyawan?.name;
      return getValue(marketingName);
    } catch (error) {
      return '-';
    }
  };

  const getPrintContent = () => {
    if (!printData) return '';

    const mounting = printData.io_mounting?.[selectedMountingIndex];
    const revisionNumber = getRevisionNumber(
      printData.no_io,
      printData.revisi_ke,
    );
    const marketingName = getMarketingName();

    // Get ALL tahapan data (no limit)
    const tahapan = mounting?.tahapan || [];

    // Generate tahapan rows dynamically (6 columns per row)
    const generateTahapanRows = () => {
      let rows = '';
      const columnsPerRow = 6;

      // Calculate how many rows we need
      const totalRows = Math.ceil(tahapan.length / columnsPerRow);

      for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
        // Process row (with numbering)
        rows += '<tr>';
        for (let col = 0; col < columnsPerRow; col++) {
          const index = rowIndex * columnsPerRow + col;
          const stepNumber = index + 1;
          if (index < tahapan.length) {
            rows += `<td style="width: 16.66%">${stepNumber}.${getValue(
              tahapan[index].nama_proses,
            )}</td>`;
          } else {
            rows += `<td style="width: 16.66%">${stepNumber}.</td>`;
          }
        }
        rows += '</tr>';

        // Machine row
        rows += '<tr>';
        for (let col = 0; col < columnsPerRow; col++) {
          const index = rowIndex * columnsPerRow + col;
          if (index < tahapan.length) {
            rows += `<td>${getValue(tahapan[index].nama_mesin)}</td>`;
          } else {
            rows += '<td></td>';
          }
        }
        rows += '</tr>';
      }

      return rows;
    };

    // Get mounting letter (A, B, C, etc.)
    const mountingLetter = String.fromCharCode(65 + selectedMountingIndex); // 65 is 'A' in ASCII

    // Helper function to get layout data for specific column
    const getLayoutData = (column: string) => {
      if (column === mountingLetter) {
        return {
          formatData: getValue(mounting?.format_data),
          ukuranPxLxT: `${getValue(mounting?.panjang_layout, '0')} x ${getValue(
            mounting?.lebar_layout,
            '0',
          )} x 0 mm`,
          ukuranTerbentang: `${getValue(
            mounting?.ukuran_jadi_terb_panjang,
            '0',
          )} x ${getValue(mounting?.ukuran_jadi_terb_lebar, '0')} mm`,
          isiA: getValue(mounting?.ukuran_cetak_isi_1, '0'),
          isiB: getValue(mounting?.ukuran_cetak_isi_2, '0'),
          ukuranLayoutPascres: '0 x 0',
        };
      }
      return {
        formatData: '-',
        ukuranPxLxT: '0 x 0 x 0 mm',
        ukuranTerbentang: '0 x 0 mm',
        isiA: '0',
        isiB: '0',
        ukuranLayoutPascres: '0 x 0',
      };
    };

    const layoutA = getLayoutData('A');
    const layoutB = getLayoutData('B');
    const layoutC = getLayoutData('C');

    // Helper function to get pond ID for specific column
    const getPondId = (column: string) => {
      return column === mountingLetter ? getValue(mounting?.id_layout) : '';
    };

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print - ${printData.no_io || 'IO'}</title>
       

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
    min-height: 277mm; /* A4 height minus margins */
    display: flex;
    flex-direction: column;
  }

  @media print {
    body {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  }

  .content-wrapper {
    flex: 1;
  }

  .log-section {
    margin-top: auto;
    padding-top: 16px;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 8px;
  }

  td, th {
    border: 1px solid black;
    padding: 2px 4px;
    line-height: 1.3;
    vertical-align: top;
  }

  .text-center {
    text-align: center;
  }

  .font-bold {
    font-weight: bold;
  }

  .bg-gray {
    background-color: #e5e7eb;
  }

  .text-lg {
    font-size: 12px;
  }

  .text-2xl {
    font-size: 18px;
  }

  .text-sm {
    font-size: 8px;
  }
</style>
        </head>

        <body>
          <!-- Header -->
          <table style="margin-bottom: 8px">
            <tbody>
              <tr>
                <td rowspan="2" class="text-center" style="width: 15%">
                  <img src="${Logo}" alt="Logo" style="width: 60px; height: auto" />
                </td>
                <td rowspan="2" class="text-center font-bold" style="width: 40%">
                  <div>PT. CAHAYA BERLIAN LESTARI</div>
                  <div class="text-lg font-bold">INSTRUKSI OFFSET</div>
                  <div>MARKETING: ${marketingName}</div>
                  <div>${getValue(printData.label)}</div>
                </td>
                <td class="text-center" style="width: 15%">PEMBUAT</td>
                <td colspan="2" class="text-center" style="width: 15%">PEMERIKSA</td>
                <td class="text-center" style="width: 15%">MENYETUJUI</td>
              </tr>
              <tr>
                <td class="text-center">OKP</td>
                <td class="text-center" style="width: 7.5%">PPIC</td>
                <td class="text-center" style="width: 7.5%">QA</td>
                <td class="text-center">KABAG PRODUKSI</td>
              </tr>
            </tbody>
          </table>

          <!-- Basic Info -->
          <table style="margin-bottom: 8px">
            <tbody>
              <tr>
                <td style="width: 20%">Nama Pelanggan</td>
                <td style="width: 35%">${getValue(printData.customer)}</td>
                <td style="width: 15%">Barcode</td>
                <td rowspan="2" class="text-center font-bold" style="width: 15%">
                  <div style="font-size: 10px; margin-bottom: 2px;">No. IO</div>
                  <div class="text-2xl">${getValue(printData.no_io)}</div>
                </td>
                <td rowspan="2" class="text-center font-bold" style="width: 15%">
                  <div style="font-size: 10px; margin-bottom: 2px;">No. Revisi</div>
                  <div class="text-2xl">${revisionNumber}</div>
                </td>
              </tr>
              <tr>
                <td>Nama Produk (Kode)</td>
                <td>${getValue(printData.produk)}</td>
                <td></td>
              </tr>
              <tr>
                <td>Keterangan Revisi :</td>
                <td colspan="4">${getValue(mounting?.keterangan_revisi)}</td>
              </tr>
              <tr>
                <td>Ukuran Jadi</td>
                <td colspan="4">
                   ${getValue(mounting?.ukuran_jadi_panjang, '0')} x 
                  ${getValue(mounting?.ukuran_jadi_lebar, '0')} x 
                  ${getValue(mounting?.ukuran_jadi_tinggi, '0')} mm
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Production Process -->
          <table style="margin-bottom: 8px">
            <thead>
              <tr class="bg-gray">
                <th colspan="6" class="text-center">URUTAN PROSES PRODUKSI</th>
              </tr>
            </thead>
            <tbody>
              ${generateTahapanRows()}
            </tbody>
          </table>

          <!-- Material -->
          <table style="margin-bottom: 8px">
            <thead>
              <tr class="bg-gray">
                <th colspan="7" class="text-center">M A T E R I A L</th>
              </tr>
              <tr>
                <td style="width: 12%">Mounting</td>
                <td style="width: 18%">Merek/Arah Serat</td>
                <td style="width: 18%">Jenis</td>
                <td style="width: 18%">Ukuran Cetak</td>
                <td style="width: 18%">Ukuran Plano</td>
                <td style="width: 8%">Bagian</td>
                <td style="width: 8%">Gramatur</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="font-bold">${mountingLetter} </td>
                <td>${getValue(mounting?.merk_serat_kertas)}</td>
                <td>${getValue(mounting?.jenis_kertas)}</td>
                <td>
                  ${getValue(
                    mounting?.ukuran_cetak_panjang_1,
                    '0',
                  )} x ${getValue(mounting?.ukuran_cetak_lebar_1, '0')}
                  ${
                    mounting?.ukuran_cetak_panjang_2 &&
                    mounting?.ukuran_cetak_lebar_2
                      ? `<br />${getValue(
                          mounting?.ukuran_cetak_panjang_2,
                        )} x ${getValue(mounting?.ukuran_cetak_lebar_2)}`
                      : ''
                  }
                </td>
                <td>
                  ${getValue(mounting?.panjang_plano, '0')} x ${getValue(
                    mounting?.lebar_plano,
                    '0',
                  )}
                </td>
                <td class="text-center">
                  ${getValue(mounting?.ukuran_cetak_bagian_1, '0')}
                  ${
                    mounting?.ukuran_cetak_bagian_2
                      ? `<br />${getValue(mounting?.ukuran_cetak_bagian_2)}`
                      : ''
                  }
                </td>
                <td class="text-center">
                  ${getValue(mounting?.gramature_kertas, '0')}
                </td>
              </tr>
            </tbody>
          </table>

          <!-- PREPRESS -->
          <table style="margin-bottom: 8px">
            <thead>
              <tr class="bg-gray">
                <th colspan="6" class="text-center">P R E P R E S S</th>
              </tr>
              <tr>
                <th colspan="2" class="text-center">LAYOUT (A)</th>
                <th colspan="2" class="text-center">LAYOUT (B)</th>
                <th colspan="2" class="text-center">LAYOUT (C)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="width: 16.66%">Format Data</td>
                <td style="width: 16.66%">${layoutA.formatData}</td>
                <td style="width: 16.66%">Format Data</td>
                <td style="width: 16.66%">${layoutB.formatData}</td>
                <td style="width: 16.66%">Format Data</td>
                <td style="width: 16.66%">${layoutC.formatData}</td>
              </tr>
              <tr>
                <td>Ukuran (pxlxt)</td>
                <td>${layoutA.ukuranPxLxT}</td>
                <td>Ukuran (pxlxt)</td>
                <td>${layoutB.ukuranPxLxT}</td>
                <td>Ukuran (pxlxt)</td>
                <td>${layoutC.ukuranPxLxT}</td>
              </tr>
              <tr>
                <td>Ukuran Terbentang</td>
                <td>${layoutA.ukuranTerbentang}</td>
                <td>Ukuran Terbentang</td>
                <td>${layoutB.ukuranTerbentang}</td>
                <td>Ukuran Terbentang</td>
                <td>${layoutC.ukuranTerbentang}</td>
              </tr>
              <tr>
                <td>Isi A</td>
                <td>${layoutA.isiA}</td>
                <td>Isi A</td>
                <td>${layoutB.isiA}</td>
                <td>Isi A</td>
                <td>${layoutC.isiA}</td>
              </tr>
              <tr>
                <td>Isi B</td>
                <td>${layoutA.isiB}</td>
                <td>Isi B</td>
                <td>${layoutB.isiB}</td>
                <td>Isi B</td>
                <td>${layoutC.isiB}</td>
              </tr>
              <tr>
                <td>Ukuran Layout(pascres)</td>
                <td>${layoutA.ukuranLayoutPascres}</td>
                <td>Ukuran Layout(pascres)</td>
                <td>${layoutB.ukuranLayoutPascres}</td>
                <td>Ukuran Layout(pascres)</td>
                <td>${layoutC.ukuranLayoutPascres}</td>
              </tr>
            </tbody>
          </table>

          <!-- Cetak -->
          <table style="margin-bottom: 8px">
            <thead>
              <tr class="bg-gray">
                <th colspan="4" class="text-center">C E T A K</th>
              </tr>
              <tr>
                <td style="width: 25%">Standar Warna No</td>
                <td style="width: 25%">Tanggal</td>
                <td style="width: 25%">Warna Depan</td>
                <td style="width: 25%">Warna Belakang</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>8</td>
                <td></td>
                <td>
                  ${getValue(mounting?.warna_depan, '0')}<br />
                  ${getValue(mounting?.keterangan_warna_depan, '')}
                </td>
                <td>
                  ${getValue(mounting?.warna_belakang, '0')}<br />
                  ${getValue(mounting?.keterangan_warna_belakang, '')}
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Coating -->
          <table style="margin-bottom: 8px">
            <thead>
              <tr class="bg-gray">
                <th colspan="4" class="text-center">C O A T I N G</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="width: 25%">Coating Depan</td>
                <td style="width: 25%">Komposisi</td>
                <td style="width: 25%">Coating Belakang</td>
                <td style="width: 25%">Komposisi</td>
              </tr>
              <tr>
                <td>${getValue(mounting?.nama_coating_depan)}</td>
                <td>${getValue(mounting?.merk_coating_depan)}</td>
                <td>${getValue(mounting?.nama_coating_belakang)}</td>
                <td>${getValue(mounting?.merk_coating_belakang)}</td>
              </tr>
            </tbody>
          </table>

          <!-- Pond and Lem -->
          <table style="margin-bottom: 8px">
            <thead>
              <tr class="bg-gray">
                <th colspan="5" class="text-center">P O N D</th>
                <th colspan="2" class="text-center">L E M</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="width: 14.28%">No ID Pisau</td>
                <td style="width: 14.28%">A</td>
                <td style="width: 14.28%">B</td>
                <td style="width: 14.28%">C</td>
                <td style="width: 14.28%">D</td>
                <td style="width: 14.28%">Proses LEM</td>
                <td style="width: 14.28%">BLOCK LEM</td>
              </tr>
              <tr>
                <td></td>
                <td>${getPondId('A')}</td>
                <td>${getPondId('B')}</td>
                <td>${getPondId('C')}</td>
                <td>${getPondId('D')}</td>
                <td>Merk & Komposisi Lem</td>
                <td>${getValue(mounting?.merk_komp_lem)}</td>
              </tr>
              <tr>
                <td>POND</td>
                <td colspan="4">${getValue(
                  mounting?.nama_jenis_pons,
                )}<br />${getValue(mounting?.keterangan_jenis_pons)}</td>
                <td>Ket Untuk Lem</td>
                <td>${getValue(mounting?.keterangan_lem)}</td>
              </tr>
              <tr>
                <td colspan="5" class="bg-gray text-center font-bold">L A I N - L A I N</td>
                <td colspan="2" class="bg-gray text-center font-bold">P A C K I N G</td>
              </tr>
              <tr>
                <td colspan="5" rowspan="3">${getValue(mounting?.lampiran)}</td>
                <td>Isi dalam 1 Pack</td>
                <td>${getValue(mounting?.isi_dalam_1_pack)}</td>
              </tr>
              <tr>
                <td>Jenis Packing</td>
                <td>${getValue(mounting?.jenis_pack)}</td>
              </tr>
              <tr>
                <td>Sat</td>
                <td></td>
              </tr>
              <tr>
                <td colspan="5">Lampiran IO</td>
                <td>Keterangan</td>
                <td>${getValue(mounting?.keterangan_pack)}</td>
              </tr>
            </tbody>
          </table>


          <!-- User Action Log -->
          ${
            printData.io_action_user && printData.io_action_user.length > 0
              ? `
          <div style="margin-top: 16px; page-break-inside: avoid;">
        
            
            <!-- Creator Info (if available) -->
            ${
              printData.user_create || printData.createdAt
                ? `
            <div style="margin-bottom: 4px; line-height: 1.5;">
              <span style="font-weight: bold;">Dibuat oleh:</span> ${getValue(
                printData.user_create?.nama || printData.user_create,
              )} 
              ${
                printData.user_create?.bagian
                  ? `(<span style="font-weight: bold;">Bagian:</span> ${getValue(
                      printData.user_create.bagian,
                    )})`
                  : ''
              }
              ${
                printData.createdAt
                  ? `pada <span style="font-weight: bold;">${formatDateTime(
                      printData.createdAt,
                    )}</span>`
                  : ''
              }
            </div>
            `
                : ''
            }
            
            <!-- Action Logs -->
            ${printData.io_action_user
              .map(
                (action) => `
            <div style="margin-bottom: 4px; line-height: 1.5;">
              <span style="font-weight: bold;">${getStatusLabel(
                action.status,
              )}</span> oleh ${getValue(action.user?.nama)} 
              ${
                action.user?.bagian
                  ? `(<span style="font-weight: bold;">Bagian:</span> ${getValue(
                      action.user.bagian,
                    )})`
                  : ''
              }
              pada <span style="font-weight: bold;">${formatDateTime(
                action.createdAt,
              )}</span>
            </div>
            `,
              )
              .join('')}
          </div>
          `
              : printData.user_create || printData.createdAt
              ? `
          <div style="margin-top: 16px; page-break-inside: avoid;">
            <div style="font-weight: bold; margin-bottom: 8px; font-size: 10px;">LOG AKTIVITAS IO:</div>
            <div style="margin-bottom: 4px; line-height: 1.5;">
              <span style="font-weight: bold;">Dibuat oleh:</span> ${getValue(
                printData.user_create?.nama || printData.user_create,
              )} 
              ${
                printData.user_create?.bagian
                  ? `(<span style="font-weight: bold;">Bagian:</span> ${getValue(
                      printData.user_create.bagian,
                    )})`
                  : ''
              }
              ${
                printData.createdAt
                  ? `pada <span style="font-weight: bold;">${formatDateTime(
                      printData.createdAt,
                    )}</span>`
                  : ''
              }
            </div>
          </div>
          `
              : ''
          }



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
              title="IO Preview"
            />
          </div>
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

export default IOMarketingPrintModal;
