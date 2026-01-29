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
  so?: {
    no_po_customer: string;
    tgl_po_customer: string;
    status_produk: string;
  };
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
    // Add io_mounting nested data
    io_mounting?: {
      jumlah_warna: number;
      ukuran_jadi_panjang: number;
      ukuran_jadi_lebar: number;
      ukuran_jadi_tinggi: number;
      ukuran_jadi_terb_panjang: number;
      ukuran_jadi_terb_lebar: number;
      warna_depan: number;
      warna_belakang: number;
      keterangan_warna_depan?: string;
      keterangan_warna_belakang?: string;
      tahapan: Array<{
        id: number;
        id_io: number | null;
        id_io_mounting: number;
        id_tahapan_mesin: number;
        id_setting_kapasitas: number | null;
        id_drying_time: number | null;
        index: number;
        nama_proses: string;
        nama_mesin: string;
        nama_setting: string;
        nama_kapasitas: string;
        nama_drying_time: string;
        value_setting: number;
        value_kapasitas: number;
        value_drying_time: number;
        is_active: boolean;
        createdAt: string;
        updatedAt: string;
      }>;
    };
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
  const [logoBase64, setLogoBase64] = useState<string>('');

  useEffect(() => {
    if (isOpen && joId) {
      fetchJOData();
    }
  }, [isOpen, joId]);

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
    const day = date.getDate();
    const month = getIndonesianMonth(date.getMonth());
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };
  const getRevisiFromIO = (noIO: string): string => {
    if (!noIO) return '0';

    // Split by '/' to get the base part (before any date)
    const parts = noIO.split('/');
    const basePart = parts[0].trim();

    // Pattern 1: Check for dash followed by 1-2 digit number and optional letter (e.g., "4630-2", "4429-3A", "IO-00341-1")
    // This pattern indicates revision number
    const dashRevisionMatch = basePart.match(/-(\d{1,2})[A-Z]?$/);
    if (dashRevisionMatch) {
      return dashRevisionMatch[1]; // Return the number part (e.g., "2" from "4630-2", "3" from "4429-3A")
    }

    // Pattern 2: Check for number followed by letter only (e.g., "4429A")
    // This indicates revision 0 with a variant letter
    const letterOnlyMatch = basePart.match(/\d+[A-Z]$/);
    if (letterOnlyMatch) {
      return '0'; // Letter suffix without dash means revision 0
    }

    // Default: No revision found
    return '0';
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
  const getIndonesianMonth = (month: number): string => {
    const months = [
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
    return months[month];
  };
  const getProcessTableRows = () => {
    const selectedMounting = getSelectedMounting();

    // Use real tahapan from API if available
    if (
      selectedMounting?.io_mounting?.tahapan &&
      selectedMounting.io_mounting.tahapan.length > 0
    ) {
      return selectedMounting.io_mounting.tahapan
        .sort((a, b) => a.index - b.index)
        .map((tahap) => ({
          name: tahap.nama_proses,
          mesin: tahap.nama_mesin,
        }));
    }

    // Fallback to default if no tahapan data
    return [];
  };

  const getPrintContent = () => {
    const layout = calculateLayout();
    const selectedMounting = getSelectedMounting();
    const logoSrc = logoBase64 || Logo;

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
          
          /* New Header Styles */
          .header-container {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid black;
          }
          
          .header-left {
            flex: 0 0 200px;
          }
          
          .header-left table {
            border-collapse: collapse;
            width: 100%;
          }
          
          .header-left td {
            border: 1px solid black;
            padding: 4px 8px;
            font-size: 8px;
          }
          
          .header-left .label-cell {
            font-weight: bold;
            width: 60px;
          }
          
          .header-center {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 0 20px;
          }
          
          .logo {
            width: 60px;
            height: auto;
            margin-bottom: 5px;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          }
          
          .company-name {
            font-size: 10px;
            font-weight: bold;
            margin-bottom: 2px;
          }
          
          .job-order-text {
            font-size: 9px;
            font-weight: bold;
          }
          
          .header-right {
            flex: 0 0 120px;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
          }
          
          .qr-code-container {
            position: relative;
            text-align: center;
          }
          
          .form-code {
            font-size: 7px;
            font-weight: bold;
            margin-bottom: 3px;
            text-align: right;
          }
          
          .qr-code {
            width: 80px;
            height: 80px;
            border: 1px solid #ccc;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 6px;
            color: #999;
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
        <!-- New Header Design -->
        <div class="header-container">
          <!-- Left: JO and IO -->
          <div class="header-left">
            <table>
              <tbody>
                <tr>
                  <td class="label-cell">No JO</td>
                  <td>${getValue(printData?.no_jo)}</td>
                </tr>
                <tr>
                  <td class="label-cell">No IO</td>
                  <td>${getValue(printData?.no_io)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Center: Logo and Company Name -->
          <div class="header-center">
            <img src="${logoSrc}" alt="Logo" class="logo" />
            <div class="company-name">PT. CAHAYA BERLIAN LESTARI</div>
            <div class="job-order-text">JOB ORDER</div>
          </div>
          
          <!-- Right: QR Code and Form Code -->
          <div class="header-right">
            <div class="qr-code-container">
              <div class="form-code">FM-PPIC-001</div>
              <div class="qr-code">QR CODE</div>
            </div>
          </div>
        </div>

        <!-- Label row (if exists) -->
        ${
          printData?.label
            ? `
        <div style="text-align: center; font-size: 9px; font-weight: bold; margin-bottom: 10px; padding: 5px; background-color: #f0f0f0; border: 1px solid black;">
          ${getValue(printData?.label, '')}
        </div>
        `
            : ''
        }
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
                <td colspan="4">${getValue(printData?.produk)}</td>
                <td class="info-label">Tanggal JO</td>
                <td class="info-colon">:</td>
                <td>${formatDate(printData?.createdAt || '')}</td>
              </tr>
              <tr>
                <td class="info-label">Spesifikasi</td>
                <td class="info-colon">:</td>
                <td colspan="4">${getValue(printData?.spesifikasi)}</td>
                <td class="info-label">No SO</td>
                <td class="info-colon">:</td>
                <td>${getValue(printData?.no_so)}</td>
              </tr>
              <tr>
                <td class="info-label">Quantity PO</td>
                <td class="info-colon">:</td>
                <td>${printData?.po_qty?.toLocaleString()}</td>
                <td class="info-label">Qty Produksi</td>
                <td colspan="2">${printData?.qty?.toLocaleString()}</td>
                <td class="info-label">No PO</td>
                <td class="info-colon">:</td>
                <td>${getValue(printData?.so?.no_po_customer)}</td>
              </tr>
              <tr>
                <td class="info-label">Status Produk</td>
                <td class="info-colon">:</td>
                <td>${getValue(printData?.so?.status_produk)}</td>
                <td class="info-label">Stok FG</td>
                <td colspan="2">${
                  printData?.stok_fg?.toLocaleString() || 0
                }</td>
                <td class="info-label">Tgl PO</td>
                <td class="info-colon">:</td>
                <td>${formatDate(printData?.so?.tgl_po_customer || '')}</td>
              </tr>
              <tr>
                <td class="info-label">Revisi</td>
                <td class="info-colon">:</td>
                <td colspan="4">${getRevisiFromIO(printData?.no_io || '')}</td>
                <td class="info-label">Tgl Pengiriman</td>
                <td class="info-colon">:</td>
                <td>${formatDate(printData?.tgl_kirim || '')}</td>
              </tr>
                <tr>
                <td class="info-label">Status JO</td>
                <td class="info-colon">:</td>
                <td colspan="4">${getValue(printData?.status_jo || '')}</td>
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
      <th colspan="6">UK & WARNA</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="info-label">Ukuran Jadi</td>
      <td colspan="3">${
        selectedMounting.io_mounting?.ukuran_jadi_panjang ||
        selectedMounting.ukuran_cetak_panjang_1
      } X ${
        selectedMounting.io_mounting?.ukuran_jadi_lebar ||
        selectedMounting.ukuran_cetak_lebar_1
      }${
        selectedMounting.io_mounting?.ukuran_jadi_tinggi
          ? ` X ${selectedMounting.io_mounting.ukuran_jadi_tinggi}`
          : ''
      } mm</td>
      <td class="info-label">Ukuran Terbentang</td>
      <td>${selectedMounting.io_mounting?.ukuran_jadi_terb_panjang || '-'} X ${
        selectedMounting.io_mounting?.ukuran_jadi_terb_lebar || '-'
      } mm</td>
    </tr>
    <tr>
      <td class="info-label">Warna Depan</td>
      <td colspan="3">${selectedMounting.io_mounting
        ?.warna_depan}, ${selectedMounting.io_mounting?.keterangan_warna_depan} 
      </td>
      <td class="info-label">Warna Belakang</td>
      <td>${selectedMounting.io_mounting?.warna_belakang}, ${selectedMounting
        .io_mounting?.keterangan_warna_belakang} </td>
    </tr>
  </tbody>
</table>
`
    : ''
}

          ${
            selectedMounting
              ? `
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
                <td colspan="3">${selectedMounting.panjang_kertas} x ${
                  selectedMounting.lebar_kertas
                } mm</td>
                <td class="info-label">JML</td>
                <td colspan="3">${selectedMounting.jumlah_kertas.toLocaleString()} LP</td>
              </tr>
              <tr>
                <td class="info-label">UK Cetak (P×L)</td>
                <td colspan="3">${selectedMounting.ukuran_cetak_panjang_1} x ${
                  selectedMounting.ukuran_cetak_lebar_1
                } mm</td>
                <td class="info-label">Bagian</td>
                <td>${selectedMounting.ukuran_cetak_bagian_1 || 2}</td>
                <td class="info-label">Isi</td>
                <td>${selectedMounting.ukuran_cetak_isi_1 || layout.isi}</td>
              </tr>
              <tr>
                <td class="info-label">UK Cetak (P×L)</td>
                <td colspan="3">${
                  selectedMounting.ukuran_cetak_panjang_2 || 0
                } x ${selectedMounting.ukuran_cetak_lebar_2 || 0} mm</td>
                <td class="info-label">Bagian</td>
                <td>0</td>
                <td class="info-label">Isi</td>
                <td>0</td>
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
      <td style="width: 350px; padding: 10px; vertical-align: middle; text-align: center; border: 1px solid black; position: relative;">
       ${(() => {
         const panjangKertas = selectedMounting.panjang_kertas;
         const lebarKertas = selectedMounting.lebar_kertas;
         const panjangCetak = selectedMounting.ukuran_cetak_panjang_1;
         const lebarCetak = selectedMounting.ukuran_cetak_lebar_1;

         // Determine which dimension is longer
         const topDimension = Math.max(panjangKertas, lebarKertas);
         const leftDimension = Math.min(panjangKertas, lebarKertas);

         // Determine which cut dimension goes where based on paper orientation
         let horizontalCut, verticalCut, horizontalCount, verticalCount;

         if (panjangKertas === topDimension) {
           // panjang is on top (horizontal)
           horizontalCut = panjangCetak;
           horizontalCount = Math.floor(panjangKertas / panjangCetak);
           verticalCut = lebarCetak;
           verticalCount = Math.floor(lebarKertas / lebarCetak);
         } else {
           // lebar is on top (horizontal)
           horizontalCut = lebarCetak;
           horizontalCount = Math.floor(lebarKertas / lebarCetak);
           verticalCut = panjangCetak;
           verticalCount = Math.floor(panjangKertas / panjangCetak);
         }

         const usedWidthPercent =
           ((horizontalCount * horizontalCut) / topDimension) * 100;
         const usedHeightPercent =
           ((verticalCount * verticalCut) / leftDimension) * 100;

         const sisaHorizontal = topDimension - horizontalCount * horizontalCut;
         const sisaVertical = leftDimension - verticalCount * verticalCut;

         const boxWidth = 240;
         const boxHeight = 160;

         const totalPlanoArea = topDimension * leftDimension;
         const totalUsedArea =
           horizontalCount * horizontalCut * (verticalCount * verticalCut);
         const efficiency = ((totalUsedArea / totalPlanoArea) * 100).toFixed(1);

         return `
    <div style="position: relative; display: inline-block; padding: 25px 15px 35px 60px;">
     ${
       selectedMounting.nama_mounting
         ? `<div style="position: absolute; top: 8px; left: 8px; font-size: 12px; font-weight: bold; text-align: left; z-index: 5;">${selectedMounting.nama_mounting}</div>`
         : ''
     }
<!-- Top dimension (longer one) - positioned at top right corner of rectangle -->
      <div style="position: absolute; top: 15px; left: ${
        60 + boxWidth - 30
      }px;">
        <div style="font-size: 8px; font-weight: bold;">
          ${topDimension}
        </div>
      </div>

      <!-- Left dimension (shorter one) - positioned at bottom left corner of rectangle -->
      <div style="position: absolute; left: 38px; top: ${boxHeight + 3}px;">
        <div style="font-size: 8px; font-weight: bold; white-space: nowrap;">
          ${leftDimension}
        </div>
      </div>

      <!-- Main rectangle -->
      <div style="border: 2px solid black; background-color: white; display: inline-block; position: relative; width: ${boxWidth}px; height: ${boxHeight}px;">
        <!-- Top/Horizontal cut dimension (inside box, near top) -->
        <div style="position: absolute; top: 8px; left: 50%; transform: translateX(-50%); font-size: 8px; font-weight: bold; display: flex; align-items: center; gap: 8px; z-index: 10;">
          <span>${horizontalCut}</span>
          <span style="font-size: 14px;">→</span>
          <span>${horizontalCount}x</span>
        </div>

        <!-- Left/Vertical cut dimension (inside box, near left) -->
        <div style="position: absolute; left: 8px; top: 50%; transform: translateY(-50%); font-size: 8px; font-weight: bold; display: flex; flex-direction: column; align-items: center; gap: 3px; z-index: 10;">
          <span>${verticalCut}</span>
          <span style="font-size: 14px;">↓</span>
          <span>${verticalCount}x</span>
        </div>

        <!-- Used area (white space) -->
        <div style="position: absolute; top: 0; left: 0; width: ${usedWidthPercent}%; height: ${usedHeightPercent}%; background-color: white; display: flex; justify-content: center; align-items: center;">
          ${
            selectedMounting.ukuran_cetak_bagian_1 > 1
              ? `<div style="font-size: 10px; font-weight: bold;">1/${selectedMounting.ukuran_cetak_bagian_1} Bagian</div>`
              : ''
          }
          
          <!-- Isi inside white space at bottom right -->
          <div style="position: absolute; bottom: 5px; right: 10px; font-size: 8px;">
            Isi: ${
              selectedMounting.ukuran_cetak_isi_1 ||
              horizontalCount *
                verticalCount *
                (selectedMounting.ukuran_cetak_bagian_1 || 1)
            }
          </div>
        </div>

        <!-- Waste areas (grey) -->
        ${
          sisaHorizontal > 0
            ? `<div style="position: absolute; top: 0; right: 0; width: ${
                100 - usedWidthPercent
              }%; height: ${usedHeightPercent}%; background-color: rgba(128, 128, 128, 0.3); border: 1px dashed #999;"></div>`
            : ''
        }
        ${
          sisaVertical > 0
            ? `<div style="position: absolute; bottom: 0; left: 0; width: 100%; height: ${
                100 - usedHeightPercent
              }%; background-color: rgba(128, 128, 128, 0.3); border: 1px dashed #999;"></div>`
            : ''
        }
      </div>

      <!-- Bottom info (now inside the padding area) -->
      <div style="position: absolute; bottom: 5px; left: 60px; right: 15px; font-size: 7px; display: flex; justify-content: space-between;">
        <div><strong>Sisa Potong:</strong> ${sisaHorizontal.toFixed(
          0,
        )} × ${sisaVertical.toFixed(0)} mm</div>
        <div><strong>Efisiensi:</strong> ${efficiency}%</div>
      </div>
    </div>
  `;
       })()}
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
                        <td style="border:1px solid black; padding: 3px; text-align: center;">${selectedMounting.jumlah_druk_finishing?.toLocaleString()}</td>
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
          <div class="signature-title">(Pond)</div>
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
