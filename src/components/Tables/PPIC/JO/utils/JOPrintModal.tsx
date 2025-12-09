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
  spesifikasi: string;
  qty: number;
  po_qty: number;
  tgl_kirim: string;
  tgl_pengiriman: string;

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
  across: number;
  down: number;
  total: number;
  isi: number;
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

  const getSelectedMounting = () => {
    if (!printData?.jo_mounting || printData.jo_mounting.length === 0) {
      return null;
    }
    const selectedMounting = printData.jo_mounting.find(
      (m) => m.is_selected === true,
    );
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

    const across = Math.floor(panjang_kertas / ukuran_cetak_panjang_1);
    const down = Math.floor(lebar_kertas / ukuran_cetak_lebar_1);
    const total = across * down;
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

  // Get the HTML content for printing
  const getPrintContent = () => {
    const layout = calculateLayout();
    const selectedMounting = getSelectedMounting();

    return `
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
            .date-location {
              text-align: right;
              margin: 10px 0;
              font-size: 7px;
            }
          </style>
        </head>
        <body>
          <!-- Header Table -->
          <table class="header-table">
            <tbody>
              <tr>
                <td rowspan="2" class="logo-cell">
                  <img src="${Logo}" alt="Logo" class="logo" />
                </td>
                <td class="info-label">No JO</td>
                <td>${getValue(printData?.no_jo)}</td>
                <td rowspan="4" class="qr-cell">
                  <div class="form-code">FM-PPIC-001</div>
                  <div class="qr-code" style="border: 1px solid #ccc; margin: 0 auto; display: flex; align-items: center; justify-content: center; font-size: 6px; color: #999;">
                    QR CODE
                  </div>
                </td>
              </tr>
              <tr>
                <td class="info-label">No IO</td>
                <td>${getValue(printData?.no_io)}</td>
              </tr>
              <tr>
                <td class="company-name" rowspan="2">
                  PT. CAHAYA BERLIAN LESTARI
                  <br />
                  <span style="font-size: 9px">JOB ORDER</span>
                </td>
                <td class="info-label">No JO</td>
                <td>${getValue(printData?.no_jo)}</td>
              </tr>
              <tr>
                <td class="info-label">No IO</td>
                <td>${getValue(printData?.no_io)}</td>
              </tr>
            </tbody>
          </table>

          <!-- Main Info Table -->
          <table class="info-table">
            <tbody>
              <tr>
                <td class="info-label">Pemesan</td>
                <td class="info-colon">:</td>
                <td colspan="3">${getValue(printData?.customer)}</td>
                <td class="info-label">DUS</td>
                <td class="info-label">Marketing</td>
                <td class="info-colon">:</td>
                <td>TS</td>
              </tr>
              <tr>
                <td class="info-label">Nama Produk</td>
                <td class="info-colon">:</td>
                <td colspan="3">${getValue(printData?.produk)}</td>
                <td rowspan="4"></td>
                <td class="info-label">Tanggal JO</td>
                <td class="info-colon">:</td>
                <td>${formatDate(printData?.createdAt || '')}</td>
              </tr>
              <tr>
                <td class="info-label">Spesifikasi</td>
                <td class="info-colon">:</td>
                <td colspan="3">${getValue(printData?.spesifikasi)}</td>
                <td class="info-label">No SO</td>
                <td class="info-colon">:</td>
                <td>${getValue(printData?.no_so)}</td>
              </tr>
              <tr>
                <td class="info-label">Quantity PO</td>
                <td class="info-colon">:</td>
                <td>${printData?.po_qty?.toLocaleString()}</td>
                <td class="info-label">Qty Produksi</td>
                <td>${printData?.qty?.toLocaleString()}</td>
                <td class="info-label">No PO</td>
                <td class="info-colon">:</td>
                <td>${getValue(printData?.no_po_customer)}</td>
              </tr>
              <tr>
                <td class="info-label">Keterangan</td>
                <td class="info-colon">:</td>
                <td>${getValue(printData?.keterangan_pengerjaan)}</td>
                <td class="info-label">Stok FG</td>
                <td>${printData?.stok_fg?.toLocaleString() || 0}</td>
                <td class="info-label">Tgl PO</td>
                <td class="info-colon">:</td>
                <td>${formatDate(printData?.tgl_po_customer || '')}</td>
              </tr>
              <tr>
                <td class="info-label">Repeat Ke</td>
                <td class="info-colon">:</td>
                <td colspan="3">${getValue(printData?.tipe_jo)}</td>
                <td></td>
                <td class="info-label">Tgl Pengiriman</td>
                <td class="info-colon">:</td>
                <td>${formatDate(printData?.tgl_kirim || '')}</td>
              </tr>
              <tr>
                <td colspan="5"></td>
                <td></td>
                <td class="info-label">Toleransi Pengiriman</td>
                <td class="info-colon">:</td>
                <td>${getValue(printData?.toleransi, '3D')}</td>
              </tr>
            </tbody>
          </table>

          ${
            selectedMounting
              ? `
          <!-- UK & WARNA Section -->
          <table class="warna-table">
            <thead>
              <tr>
                <th colspan="4">UK & WARNA</th>
                <th colspan="2">Terbentang</th>
                <th colspan="2">${layout.across} X ${layout.down} = ${
                  layout.total
                }</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="info-label">Ukuran Jadi</td>
                <td colspan="3">${selectedMounting.ukuran_cetak_panjang_1} X ${
                  selectedMounting.ukuran_cetak_lebar_1
                } mm</td>
                <td colspan="4"></td>
              </tr>
              <tr>
                <td class="info-label">Warna Depan</td>
                <td colspan="3">${getValue(printData?.spesifikasi)}</td>
                <td colspan="4"></td>
              </tr>
            </tbody>
          </table>

          <!-- KERTAS Section -->
          <table class="warna-table">
            <thead>
              <tr>
                <th colspan="8">KERTAS</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="info-label">Jenis Kertas</td>
                <td colspan="3">${getValue(selectedMounting.nama_kertas)}</td>
                <td class="info-label">Gramatur</td>
                <td colspan="3">${selectedMounting.gramature_kertas} gsm</td>
              </tr>
              <tr>
                <td class="info-label">Ukuran</td>
                <td colspan="3">${selectedMounting.lebar_kertas} x ${
                  selectedMounting.panjang_kertas
                } mm</td>
                <td class="info-label">JML</td>
                <td colspan="3">${selectedMounting.jumlah_kertas.toLocaleString()} LP</td>
              </tr>
              <tr>
                <td class="info-label">UK Cetak (P×L)</td>
                <td colspan="3">${selectedMounting.ukuran_cetak_panjang_1} x ${
                  selectedMounting.ukuran_cetak_lebar_1
                } mm</td>
                <td class="info-label">${
                  selectedMounting.ukuran_cetak_bagian_1 || 2
                } Bagian</td>
                <td>Isi</td>
                <td colspan="2">${
                  selectedMounting.ukuran_cetak_isi_1 || layout.isi
                }</td>
              </tr>
              <tr>
                <td class="info-label">UK Cetak (P×L)</td>
                <td colspan="3">${
                  selectedMounting.ukuran_cetak_panjang_2 || 0
                } x ${selectedMounting.ukuran_cetak_lebar_2 || 0} mm</td>
                <td class="info-label">0 Bagian</td>
                <td>Isi</td>
                <td colspan="2">0</td>
              </tr>
            </tbody>
          </table>

          <!-- KERTAS POTONG Section with Layout Diagram -->
          <table class="warna-table" style="page-break-inside: avoid; margin-top: 8px;">
            <tbody>
              <tr>
                <td style="width: 100px; font-weight: bold; vertical-align: middle; text-align: center; font-size: 9px; border: 1px solid black; padding: 5px;">
                  KERTAS<br />POTONG
                </td>
                <td style="width: 350px; padding: 30px 20px; vertical-align: middle; text-align: center; border: 1px solid black; position: relative;">
                  ${
                    selectedMounting.nama_mounting
                      ? `<div style="position: absolute; top: 8px; left: 8px; font-size: 12px; font-weight: bold; text-align: left; z-index: 5;">${selectedMounting.nama_mounting}</div>`
                      : ''
                  }
                  
                  <div style="display: flex; justify-content: center; align-items: center; min-height: 220px; position: relative;">
                    <div style="position: relative; display: inline-block; margin: 30px;">
                      ${(() => {
                        const acrossX1 = Math.floor(
                          selectedMounting.lebar_kertas /
                            selectedMounting.ukuran_cetak_panjang_1,
                        );
                        const downY1 = Math.floor(
                          selectedMounting.panjang_kertas /
                            selectedMounting.ukuran_cetak_lebar_1,
                        );
                        const usedWidthPercent =
                          ((acrossX1 *
                            selectedMounting.ukuran_cetak_panjang_1) /
                            selectedMounting.lebar_kertas) *
                          100;
                        const usedHeightPercent =
                          ((downY1 * selectedMounting.ukuran_cetak_lebar_1) /
                            selectedMounting.panjang_kertas) *
                          100;
                        const sisaLebar =
                          selectedMounting.lebar_kertas -
                          acrossX1 * selectedMounting.ukuran_cetak_panjang_1;
                        const sisaPanjang =
                          selectedMounting.panjang_kertas -
                          downY1 * selectedMounting.ukuran_cetak_lebar_1;

                        const boxWidth = 240;
                        const boxHeight = 160;

                        const totalPlanoArea =
                          selectedMounting.lebar_kertas *
                          selectedMounting.panjang_kertas;
                        const totalUsedArea =
                          acrossX1 *
                          selectedMounting.ukuran_cetak_panjang_1 *
                          (downY1 * selectedMounting.ukuran_cetak_lebar_1);
                        const efficiency = (
                          (totalUsedArea / totalPlanoArea) *
                          100
                        ).toFixed(1);

                        return `
                          <!-- Top dimension -->
                          <div style="position: absolute; top: -25px; left: 0; right: 0; text-align: center;">
                            <div style="font-size: 8px; font-weight: bold; margin-bottom: 2px;">${
                              selectedMounting.lebar_kertas
                            }</div>
                            <div style="width: 100%; height: 0px; background-color: black;"></div>
                          </div>

                          <!-- Left dimension -->
                          <div style="position: absolute; left: -25px; top: 0; bottom: 0; display: flex; align-items: center;">
                            <div style="width: 0px; height: 100%; background-color: black; margin-right: 2px;"></div>
                            <div style="font-size: 8px; font-weight: bold; writing-mode: vertical-rl; text-orientation: mixed;">${
                              selectedMounting.panjang_kertas
                            }</div>
                          </div>

                          <!-- Main rectangle -->
                          <div style="border: 2px solid black; background-color: white; display: inline-block; position: relative; width: ${boxWidth}px; height: ${boxHeight}px;">
                            <!-- Top cut dimension -->
                            <div style="position: absolute; top: 5px; left: 50%; transform: translateX(-50%); font-size: 8px; font-weight: bold; display: flex; align-items: center; gap: 8px; z-index: 10;">
                              <span>${
                                selectedMounting.ukuran_cetak_panjang_1
                              }</span>
                              <span>→</span>
                              <span>${acrossX1}x</span>
                            </div>

                            <!-- Left cut dimension -->
                            <div style="position: absolute; left: 5px; top: 50%; transform: translateY(-50%); font-size: 8px; font-weight: bold; writing-mode: vertical-rl; text-orientation: mixed; display: flex; align-items: center; gap: 8px; z-index: 10;">
                              <span>${
                                selectedMounting.ukuran_cetak_lebar_1
                              }</span>
                              <span>→</span>
                              <span>${downY1}x</span>
                            </div>

                            <!-- Used area -->
                            <div style="position: absolute; top: 0; left: 0; width: ${usedWidthPercent}%; height: ${usedHeightPercent}%; background-color: white; display: flex; justify-content: center; align-items: center;">
                              ${
                                selectedMounting.ukuran_cetak_bagian_1 > 1
                                  ? `<div style="font-size: 10px; font-weight: bold;">1/${selectedMounting.ukuran_cetak_bagian_1} Bagian</div>`
                                  : ''
                              }
                            </div>

                            <!-- Waste areas -->
                            ${
                              sisaLebar > 0
                                ? `<div style="position: absolute; top: 0; right: 0; width: ${
                                    100 - usedWidthPercent
                                  }%; height: ${usedHeightPercent}%; background-color: rgba(128, 128, 128, 0.3); border: 1px dashed #999;"></div>`
                                : ''
                            }
                            ${
                              sisaPanjang > 0
                                ? `<div style="position: absolute; bottom: 0; left: 0; width: 100%; height: ${
                                    100 - usedHeightPercent
                                  }%; background-color: rgba(128, 128, 128, 0.3); border: 1px dashed #999;"></div>`
                                : ''
                            }

                            <!-- Isi -->
                            <div style="position: absolute; bottom: 5px; right: 5px; font-size: 8px; z-index: 10;">
                              Isi: ${
                                selectedMounting.ukuran_cetak_isi_1 ||
                                acrossX1 *
                                  downY1 *
                                  (selectedMounting.ukuran_cetak_bagian_1 || 1)
                              }
                            </div>
                          </div>

                          <!-- Bottom info -->
                          <div style="position: absolute; bottom: -25px; left: 0; right: 0; font-size: 7px; display: flex; justify-content: space-between;">
                            <div><strong>Sisa Potong:</strong> ${sisaLebar.toFixed(
                              0,
                            )} × ${sisaPanjang.toFixed(0)} mm</div>
                            <div><strong>Efisiensi:</strong> ${efficiency}%</div>
                          </div>
                        `;
                      })()}
                    </div>
                  </div>
                </td>
                <td style="padding: 5px; vertical-align: top; border: 1px solid black;">
                  <!-- Process table -->
                  <table style="width: 100%; border-collapse: collapse; font-size: 7px; margin-bottom: 5px;">
                    <thead>
                      <tr>
                        <th style="border: 1px solid black; padding: 3px; background-color: #f0f0f0;">Proses</th>
                        <th style="border: 1px solid black; padding: 3px; background-color: #f0f0f0;">Jml Druk</th>
                        <th style="border: 1px solid black; padding: 3px; background-color: #f0f0f0;">Insheet</th>
                        <th style="border: 1px solid black; padding: 3px; background-color: #f0f0f0;"></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style="border: 1px solid black; padding: 3px;">Cetak</td>
                        <td style="border: 1px solid black; padding: 3px; text-align: center;">${selectedMounting.jumlah_druk_cetak?.toLocaleString()}</td>
                        <td style="border: 1px solid black; padding: 3px; text-align: center;">${selectedMounting.jumlah_insheet_cetak?.toLocaleString()}</td>
                        <td style="border: 1px solid black; padding: 3px;">druk</td>
                      </tr>
                      <tr>
                        <td style="border: 1px solid black; padding: 3px;">Ponds</td>
                        <td style="border: 1px solid black; padding: 3px; text-align: center;">${selectedMounting.jumlah_druk_pond?.toLocaleString()}</td>
                        <td style="border: 1px solid black; padding: 3px; text-align: center;">${selectedMounting.jumlah_insheet_pond?.toLocaleString()}</td>
                        <td style="border: 1px solid black; padding: 3px;">druk</td>
                      </tr>
                      <tr>
                        <td style="border: 1px solid black; padding: 3px;">Finishing</td>
                        <td style="border: 1px solid black; padding: 3px; text-align: center;">${selectedMounting.jumlah_druk_finishing?.toLocaleString()}</td>
                        <td style="border: 1px solid black; padding: 3px; text-align: center;">${selectedMounting.jumlah_insheet_finishing?.toLocaleString()}</td>
                        <td style="border: 1px solid black; padding: 3px;">druk</td>
                      </tr>
                    </tbody>
                  </table>

                  <!-- Keterangan -->
                  <div style="border: 1px solid black; padding: 5px; font-size: 7px; margin-bottom: 5px;">
                    <div style="font-weight: bold; margin-bottom: 3px;">Keterangan Pengerjaan :</div>
                    <div style="min-height: 40px;">${getValue(
                      printData?.keterangan_pengerjaan,
                    )}</div>
                  </div>

                  <!-- Pakai Ukuran Standar -->
                  <div style="border: 1px solid black; padding: 5px; font-size: 7px; min-height: 30px;">
                    Pakai Ukuran Standar
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          `
              : ''
          }

          <!-- Process Table -->
          <table class="process-table">
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
              ${getProcessTableRows()
                .map(
                  (process) => `
                <tr>
                  <td>${process.name}</td>
                  <td>${process.mesin}</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              `,
                )
                .join('')}
            </tbody>
          </table>

          <!-- Delivery Info -->
          <table class="info-table" style="margin-top: 10px;">
            <tbody>
              <tr>
                <td class="info-label">Pengiriman Ke</td>
                <td class="info-colon">:</td>
                <td colspan="3">${getValue(printData?.customer)}</td>
              </tr>
              <tr>
                <td class="info-label">Alamat</td>
                <td class="info-colon">:</td>
                <td colspan="3">${getValue(printData?.alamat_pengiriman)}</td>
              </tr>
            </tbody>
          </table>

          <!-- Date and Signatures -->
          <div class="date-location">
            Bandung, ${formatDate(new Date().toISOString())}
          </div>

          <div class="signature-section">
            <div class="signature-box">
              <div class="signature-title">(PPIC)</div>
              <div>Tgl:</div>
            </div>
            <div class="signature-box">
              <div class="signature-title">(SPV PPIC)</div>
              <div>Tgl:</div>
            </div>
            <div class="signature-box">
              <div class="signature-title">(Prepress)</div>
              <div>Tgl:</div>
            </div>
            <div class="signature-box">
              <div class="signature-title">(Ponda)</div>
              <div>Tgl:</div>
            </div>
            <div class="signature-box">
              <div class="signature-title">(Printing)</div>
              <div>Tgl:</div>
            </div>
            <div class="signature-box">
              <div class="signature-title">(Finishing)</div>
              <div>Tgl:</div>
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
                title="PDF Preview"
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

export default JOPrintModal;
