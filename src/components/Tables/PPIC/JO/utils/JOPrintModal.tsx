// JOPrintModal.tsx
import React, { useRef, useEffect, useState } from 'react';
import Logo from '../../../../../images/logo/logo-cbl 1.svg';
import axios from 'axios';
import { isDualUkuran, splitByProcess } from './insheetCalculation';

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
      file?: string | null; // <-- mounting image file field
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
  // State to hold base64 of the mounting image for print
  const [mountingImageBase64, setMountingImageBase64] = useState<string>('');
  // NEW: proses-insheet percentages (Cetak/Pond/Finishing splits), needed to
  // rebuild the per-side (Sisi A / Sisi B) breakdown for 2-ukuran mountings.
  const [prosesInsheetData, setProsesInsheetData] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && joId) {
      fetchJOData();
    }
  }, [isOpen, joId]);

  // NEW: fetch proses-insheet percentages whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      fetchProsesInsheet();
    }
  }, [isOpen]);

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

  // When printData changes, convert the mounting image to base64 if it exists
  useEffect(() => {
    const mounting = getMountingFromData(printData);
    const fileField = mounting?.io_mounting?.file;

    if (fileField) {
      const imageUrl = `${import.meta.env.VITE_API_LINK}/images/${fileField}`;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          setMountingImageBase64(canvas.toDataURL('image/png'));
        }
      };
      img.onerror = () => {
        // If conversion fails, fall back to direct URL
        setMountingImageBase64(imageUrl);
      };
      img.src = imageUrl;
    } else {
      setMountingImageBase64('');
    }
  }, [printData]);

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

  // NEW: fetch proses-insheet percentages (Cetak/Pond/Finishing %) used to
  // rebuild the per-side process breakdown for 2-ukuran mountings.
  const fetchProsesInsheet = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_LINK}/master/prosesInsheet`,
        { withCredentials: true },
      );
      setProsesInsheetData(res.data.data || []);
    } catch (error) {
      console.error('Error fetching proses insheet:', error);
      setProsesInsheetData([]);
    }
  };

  // Pure helper that accepts data as argument (used in useEffect above)
  const getMountingFromData = (data: JOPrintData | null) => {
    if (!data?.jo_mounting || data.jo_mounting.length === 0) return null;
    return (
      data.jo_mounting.find((m) => m.is_selected === true) ||
      data.jo_mounting[0]
    );
  };

  const getSelectedMounting = () => {
    return getMountingFromData(printData);
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

    const parts = noIO.split('/');
    const basePart = parts[0].trim();

    const dashRevisionMatch = basePart.match(/-(\d{1,2})[A-Z]?$/);
    if (dashRevisionMatch) {
      return dashRevisionMatch[1];
    }

    const letterOnlyMatch = basePart.match(/\d+[A-Z]$/);
    if (letterOnlyMatch) {
      return '0';
    }

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
    const totalIsi =
      (ukuran_cetak_isi_1 || 0) + (mounting.ukuran_cetak_isi_2 || 0) ||
      total * (ukuran_cetak_bagian_1 || 1);
    return { across, down, total, isi: totalIsi };
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

    return [];
  };

  // Returns the HTML string for the KERTAS POTONG cell content.
  // If io_mounting.file exists → show the image (base64 for print quality).
  // Otherwise → render the calculated layout diagram.
  const getKertasPotongCellContent = (
    selectedMounting: NonNullable<ReturnType<typeof getSelectedMounting>>,
    layout: LayoutCalculation,
  ): string => {
    const fileField = selectedMounting?.io_mounting?.file;

    // --- BRANCH 1: Use uploaded image ---
    if (fileField && mountingImageBase64) {
      return `
        <div style="display: flex; align-items: center; justify-content: center; width: 100%; min-height: 130px; padding: 4px;">
          ${
            selectedMounting.nama_mounting
              ? `<div style="position: absolute; top: 6px; left: 6px; font-size: 10px; font-weight: bold; z-index: 5;">${selectedMounting.nama_mounting}</div>`
              : ''
          }
          <img
            src="${mountingImageBase64}"
            alt="Kertas Potong"
            style="max-width: 100%; max-height: 160px; object-fit: contain; display: block; margin: auto;"
          />
        </div>
      `;
    }

    // --- BRANCH 2: Calculated layout diagram (original code) ---
    const panjangKertas = selectedMounting.panjang_kertas;
    const lebarKertas = selectedMounting.lebar_kertas;
    const panjangCetak = selectedMounting.ukuran_cetak_panjang_1;
    const lebarCetak = selectedMounting.ukuran_cetak_lebar_1;

    const topDimension = Math.max(panjangKertas, lebarKertas);
    const leftDimension = Math.min(panjangKertas, lebarKertas);

    let horizontalCut: number,
      verticalCut: number,
      horizontalCount: number,
      verticalCount: number;

    if (panjangKertas === topDimension) {
      horizontalCut = panjangCetak;
      horizontalCount = Math.floor(panjangKertas / panjangCetak);
      verticalCut = lebarCetak;
      verticalCount = Math.floor(lebarKertas / lebarCetak);
    } else {
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

    const boxWidth = 180;
    const boxHeight = 120;

    const totalPlanoArea = topDimension * leftDimension;
    const totalUsedArea =
      horizontalCount * horizontalCut * (verticalCount * verticalCut);
    const efficiency = ((totalUsedArea / totalPlanoArea) * 100).toFixed(1);

    return `
      <div style="position: relative; display: inline-block; padding: 20px 12px 28px 50px;">
        ${
          selectedMounting.nama_mounting
            ? `<div style="position: absolute; top: 6px; left: 6px; font-size: 10px; font-weight: bold; text-align: left; z-index: 5;">${selectedMounting.nama_mounting}</div>`
            : ''
        }

        <!-- Top dimension -->
        <div style="position: absolute; top: 12px; left: ${
          50 + boxWidth - 25
        }px;">
          <div style="font-size: 9px; font-weight: bold;">${topDimension}</div>
        </div>

        <!-- Left dimension -->
        <div style="position: absolute; left: 32px; top: ${boxHeight + 3}px;">
          <div style="font-size: 9px; font-weight: bold; white-space: nowrap;">${leftDimension}</div>
        </div>

        <!-- Main rectangle -->
        <div style="border: 2px solid black; background-color: white; display: inline-block; position: relative; width: ${boxWidth}px; height: ${boxHeight}px;">
          <!-- Top/Horizontal cut dimension -->
          <div style="position: absolute; top: 6px; left: 50%; transform: translateX(-50%); font-size: 8px; font-weight: bold; display: flex; align-items: center; gap: 6px; z-index: 10;">
            <span>${horizontalCut}</span>
            <span style="font-size: 12px;">→</span>
            <span>${horizontalCount}x</span>
          </div>

          <!-- Left/Vertical cut dimension -->
          <div style="position: absolute; left: 6px; top: 50%; transform: translateY(-50%); font-size: 8px; font-weight: bold; display: flex; flex-direction: column; align-items: center; gap: 2px; z-index: 10;">
            <span>${verticalCut}</span>
            <span style="font-size: 12px;">↓</span>
            <span>${verticalCount}x</span>
          </div>

          <!-- Used area -->
          <div style="position: absolute; top: 0; left: 0; width: ${usedWidthPercent}%; height: ${usedHeightPercent}%; background-color: white; display: flex; justify-content: center; align-items: center;">
            ${
              selectedMounting.ukuran_cetak_bagian_1 >= 1
                ? `<div style="font-size: 9px; font-weight: bold;">1/${selectedMounting.ukuran_cetak_bagian_1} Bagian</div>`
                : ''
            }
            <div style="position: absolute; bottom: 4px; right: 8px; font-size: 8px;">
              Isi: ${
                selectedMounting.ukuran_cetak_isi_1 ||
                horizontalCount *
                  verticalCount *
                  (selectedMounting.ukuran_cetak_bagian_1 || 1)
              }
            </div>
          </div>

          <!-- Waste areas -->
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

        <!-- Bottom info -->
        <div style="position: absolute; bottom: 4px; left: 50px; right: 12px; font-size: 7px; display: flex; justify-content: space-between;">
          <div><strong>Sisa Potong:</strong> ${sisaHorizontal.toFixed(
            0,
          )} × ${sisaVertical.toFixed(0)} mm</div>
          <div><strong>Efisiensi:</strong> ${efficiency}%</div>
        </div>
      </div>
    `;
  };

  // ── NEW: process (Cetak/Pond/Finishing) breakdown for the KERTAS POTONG box ──
  // Single-ukuran mountings keep the original aggregate table.
  // 2-ukuran (dual) mountings render a Sisi A / Sisi B side-by-side table,
  // matching the reference layout (image 3): per side, Jml Druk + Insheet for
  // Cetak / Pond / Finishing, rebuilt from the stored tambahan_insheet_1/2 and
  // jumlah_cetak_1/2 using the same proses percentages used at JO creation.
  const getProcessBreakdownHtml = (
    mounting: NonNullable<ReturnType<typeof getSelectedMounting>>,
  ): string => {
    const dual = isDualUkuran(mounting);

    if (!dual) {
      return `
        <table style="width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 4px;">
          <thead>
            <tr>
              <th style="border: 1px solid black; padding: 2px; background-color: #f0f0f0;">Proses</th>
              <th style="border: 1px solid black; padding: 2px; background-color: #f0f0f0;">Jml Druk</th>
              <th style="border: 1px solid black; padding: 2px; background-color: #f0f0f0;">Insheet</th>
              <th style="border: 1px solid black; padding: 2px; background-color: #f0f0f0;"></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid black; padding: 2px;">Cetak</td>
              <td style="border: 1px solid black; padding: 2px; text-align: center;">${mounting.jumlah_druk_cetak?.toLocaleString()}</td>
              <td style="border: 1px solid black; padding: 2px; text-align: center;">${mounting.jumlah_insheet_cetak?.toLocaleString()}</td>
              <td style="border: 1px solid black; padding: 2px;">druk</td>
            </tr>
            <tr>
              <td style="border: 1px solid black; padding: 2px;">Ponds</td>
              <td style="border: 1px solid black; padding: 2px; text-align: center;">${mounting.jumlah_druk_pond?.toLocaleString()}</td>
              <td style="border: 1px solid black; padding: 2px; text-align: center;">${mounting.jumlah_insheet_pond?.toLocaleString()}</td>
              <td style="border: 1px solid black; padding: 2px;">druk</td>
            </tr>
            <tr>
              <td style="border: 1px solid black; padding: 2px;">Finishing</td>
              <td style="border: 1px solid black; padding: 2px; text-align: center;">${mounting.jumlah_druk_finishing?.toLocaleString()}</td>
              <td style="border: 1px solid black; padding: 2px; text-align: center;">${mounting.jumlah_insheet_finishing?.toLocaleString()}</td>
              <td style="border: 1px solid black; padding: 2px;">druk</td>
            </tr>
          </tbody>
        </table>
      `;
    }

    const drukA = mounting.jumlah_cetak_1 || 0;
    const drukB = mounting.jumlah_cetak_2 || 0;
    const procA = splitByProcess(
      mounting.tambahan_insheet_1 || 0,
      prosesInsheetData,
    );
    const procB = splitByProcess(
      mounting.tambahan_insheet_2 || 0,
      prosesInsheetData,
    );

    const sideTable = (
      label: string,
      druk: number,
      proc: { cetak: number; pond: number; finishing: number },
    ) => `
      <div style="flex: 1;">
        <div style="font-size: 9px; font-weight: bold; margin-bottom: 2px; text-align: center;">Sisi ${label}</div>
        <table style="width: 100%; border-collapse: collapse; font-size: 9px;">
          <thead>
            <tr>
              <th style="border: 1px solid black; padding: 2px; background-color: #f0f0f0;">Proses</th>
              <th style="border: 1px solid black; padding: 2px; background-color: #f0f0f0;">Jml Druk</th>
              <th style="border: 1px solid black; padding: 2px; background-color: #f0f0f0;">Insheet</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid black; padding: 2px;">Cetak</td>
              <td style="border: 1px solid black; padding: 2px; text-align: center;">${druk.toLocaleString()}</td>
              <td style="border: 1px solid black; padding: 2px; text-align: center;">${proc.cetak.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="border: 1px solid black; padding: 2px;">Pond</td>
              <td style="border: 1px solid black; padding: 2px; text-align: center;">${druk.toLocaleString()}</td>
              <td style="border: 1px solid black; padding: 2px; text-align: center;">${proc.pond.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="border: 1px solid black; padding: 2px;">Finishing</td>
              <td style="border: 1px solid black; padding: 2px; text-align: center;">${druk.toLocaleString()}</td>
              <td style="border: 1px solid black; padding: 2px; text-align: center;">${proc.finishing.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;

    return `
      <div style="display: flex; gap: 4px; margin-bottom: 4px;">
        ${sideTable('A', drukA, procA)}
        ${sideTable('B', drukB, procB)}
      </div>
    `;
  };

  const getPrintContent = () => {
    const layout = calculateLayout();
    const selectedMounting = getSelectedMounting();
    const logoSrc = logoBase64 || Logo;
    const dualMounting = selectedMounting
      ? isDualUkuran(selectedMounting)
      : false;

    return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print JO - ${printData?.no_jo || 'Job Order'}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          * {
            box-sizing: border-box;
          }
          body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            font-size: 10px;
            line-height: 1.3;
          }
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
          
          .header-container {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 12px;
            padding-bottom: 8px;
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
            font-size: 10px;
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
            font-size: 11px;
            font-weight: bold;
            margin-bottom: 2px;
          }
          
          .job-order-text {
            font-size: 10px;
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
            font-size: 8px;
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
            font-size: 7px;
            color: #999;
          }
          
          .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 6px;
            font-size: 10px;
          }
          .info-table td {
            border: 1px solid black;
            padding: 3px 5px;
            vertical-align: top;
          }
          .info-label {
            width: 120px;
            font-weight: bold;
          }
          .info-colon {
            width: 10px;
          }
          .warna-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 6px;
            font-size: 10px;
          }
          .warna-table td, .warna-table th {
            border: 1px solid black;
            padding: 3px 5px;
          }
          .warna-table th {
            background-color: #f0f0f0;
            font-weight: bold;
            text-align: center;
          }
          .process-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
            margin-top: 6px;
          }
          .process-table td, .process-table th {
            border: 1px solid black;
            padding: 4px 6px;
            text-align: center;
          }
          .process-table th {
            background-color: #f0f0f0;
            font-weight: bold;
          }
          .signature-section {
            margin-top: 10px;
            display: flex;
            justify-content: space-between;
            gap: 5px;
            text-align: center;
            font-size: 8px;
          }
          .signature-box {
            flex: 1;
            border: 1px solid black;
            padding: 3px;
            min-height: 45px;
          }
          .signature-title {
            font-weight: bold;
            margin-bottom: 20px;
          }
          .date-location {
            text-align: right;
            margin: 8px 0;
            font-size: 9px;
          }
          .formula-badge {
            display: inline-block;
            font-size: 9px;
            font-weight: bold;
            padding: 2px 8px;
            border-radius: 8px;
            margin-bottom: 4px;
          }
          .formula-badge.dual {
            border: 1px solid #6366f1;
            color: #4338ca;
            background-color: #eef2ff;
          }
          .formula-badge.single {
            border: 1px solid #9ca3af;
            color: #4b5563;
            background-color: #f3f4f6;
          }
        </style>
      </head>
      <body>
        <!-- Header -->
        <div class="header-container">
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
          
          <div class="header-center">
            <img src="${logoSrc}" alt="Logo" class="logo" />
            <div class="company-name">PT. CAHAYA BERLIAN LESTARI</div>
            <div class="job-order-text">JOB ORDER</div>
          </div>
          
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
        <div style="text-align: center; font-size: 11px; font-weight: bold; margin-bottom: 8px; padding: 4px; background-color: #f0f0f0; border: 1px solid black;">
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
              <td colspan="2">${printData?.stok_fg?.toLocaleString() || 0}</td>
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
      
        <!-- UK & WARNA and KERTAS Section -->
        <table class="warna-table">
          <tbody>
            <tr>
              <td rowspan="2" style="width: 100px; font-weight: bold; vertical-align: middle; text-align: center; font-size: 11px; border: 1px solid black; padding: 5px;">
                UK & WARNA
              </td>
              <td class="info-label" style="font-size: 10px; width: 120px;">Ukuran Jadi</td>
              <td style="font-size: 10px;">${
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
              <td class="info-label" style="font-size: 10px; width: 120px;">Ukuran Terbentang</td>
              <td colspan="3" style="font-size: 10px;">${
                selectedMounting.io_mounting?.ukuran_jadi_terb_panjang || '-'
              } X ${
                selectedMounting.io_mounting?.ukuran_jadi_terb_lebar || '-'
              } mm</td>
            </tr>
            <tr>
              <td class="info-label" style="font-size: 10px;">Warna Depan</td>
              <td style="font-size: 10px;">${selectedMounting.io_mounting
                ?.warna_depan}, ${selectedMounting.io_mounting
                ?.keterangan_warna_depan}</td>
              <td class="info-label" style="font-size: 10px;">Warna Belakang</td>
              <td colspan="3" style="font-size: 10px;">${selectedMounting
                .io_mounting?.warna_belakang}, ${selectedMounting.io_mounting
                ?.keterangan_warna_belakang}</td>
            </tr>
            <tr>
              <td rowspan="4" style="width: 100px; font-weight: bold; vertical-align: middle; text-align: center; font-size: 11px; border: 1px solid black; padding: 5px;">
                KERTAS
              </td>
              <td class="info-label" style="font-size: 10px;">Jenis Kertas</td>
              <td style="font-size: 10px;">${getValue(
                selectedMounting.nama_kertas,
              )}</td>
              <td class="info-label" style="font-size: 10px;">Gramatur</td>
              <td colspan="3" style="font-size: 10px;">${
                selectedMounting.gramature_kertas
              } gsm</td>
            </tr>
            <tr>
              <td class="info-label" style="font-size: 10px;">Ukuran</td>
              <td style="font-size: 10px;">${
                selectedMounting.panjang_kertas
              } x ${selectedMounting.lebar_kertas} mm</td>
              <td  class="info-label" style="font-size: 10px;">JML</td>
              <td colspan="3" style="font-size: 10px; ">${selectedMounting.jumlah_kertas.toLocaleString()} LP</td>
            </tr>
           <tr>
              <td class="info-label" style="font-size: 10px;">UK Cetak A (P×L)</td>
              <td style="font-size: 10px;">${
                selectedMounting.ukuran_cetak_panjang_1
              } x ${selectedMounting.ukuran_cetak_lebar_1} mm</td>
              <td class="info-label" style="font-size: 10px;">Bagian A</td>
              <td style="font-size: 10px;">${
                selectedMounting.ukuran_cetak_bagian_1 || 0
              }</td>
              <td class="info-label" style="font-size: 10px;">Isi A</td>
              <td style="font-size: 10px;">${
                selectedMounting.ukuran_cetak_isi_1 || 0
              }</td>
            </tr>
            <tr>
              <td class="info-label" style="font-size: 10px;">UK Cetak B (P×L)</td>
              <td style="font-size: 10px;">${
                selectedMounting.ukuran_cetak_panjang_2 || 0
              } x ${selectedMounting.ukuran_cetak_lebar_2 || 0} mm</td>
               <td class="info-label" style="font-size: 10px;">Bagian B</td>
              <td style="font-size: 10px;">${
                selectedMounting.ukuran_cetak_bagian_2 || 0
              }</td>
              <td class="info-label" style="font-size: 10px;">Isi B</td>
              <td style="font-size: 10px;">${
                selectedMounting.ukuran_cetak_isi_2 || 0
              }</td>
            </tr>
            
          </tbody>
        </table>
        `
            : ''
        }

        ${
          selectedMounting
            ? `
        <!-- KERTAS POTONG Section -->
        <table class="warna-table" style="page-break-inside: avoid; margin-top: 6px;">
          <tbody>
            <tr>
              <td style="width: 80px; font-weight: bold; vertical-align: middle; text-align: center; font-size: 10px; border: 1px solid black; padding: 4px;">
                KERTAS<br />POTONG
              </td>

              <!-- ============================================================
                   KERTAS POTONG CELL:
                   - If io_mounting.file exists  → show uploaded image
                   - Otherwise                   → show calculated layout diagram
                   ============================================================ -->
              <td style="width: 300px; padding: 8px; vertical-align: middle; text-align: center; border: 1px solid black; position: relative;">
                ${getKertasPotongCellContent(selectedMounting, layout)}
              </td>

              <td style="padding: 4px; vertical-align: top; border: 1px solid black;">
                <!-- Process table (aggregate for 1-ukuran, Sisi A / Sisi B for 2-ukuran) -->
                ${getProcessBreakdownHtml(selectedMounting)}

                <!-- Keterangan -->
                <div style="border: 1px solid black; padding: 4px; font-size: 9px; margin-bottom: 4px;">
                  <div style="font-weight: bold; margin-bottom: 2px;">Keterangan Pengerjaan :</div>
                  <div style="min-height: 35px;">${getValue(
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
        <table class="info-table" style="margin-top: 8px;">
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
        <div style="margin-top: 8px; display: flex; justify-content: space-between; align-items: flex-start;">
          <div style="flex: 0 0 200px;">
            <div style="font-size: 9px; margin-bottom: 3px;">Bandung,</div>
            <div style="font-size: 9px;">Dibuat Oleh,</div>
          </div>
          <div style="flex: 1; text-align: center;">
            <div style="font-size: 9px; margin-bottom: 3px;">${formatDate(
              new Date().toISOString(),
            )}</div>
          </div>
        </div>

        <div style="margin-top: 12px; display: flex; justify-content: space-between; gap: 10px; font-size: 9px;">
          <div style="flex: 1; text-align: center;">
            <div style="border-bottom: 1px dotted black; margin-bottom: 3px; min-height: 35px;"></div>
            <div style="font-weight: normal; margin-bottom: 2px;">(PPIC)</div>
            <div>Tgl:</div>
          </div>
          <div style="flex: 1; text-align: center;">
            <div style="border-bottom: 1px dotted black; margin-bottom: 3px; min-height: 35px;"></div>
            <div style="font-weight: normal; margin-bottom: 2px;">(SPV PPIC)</div>
            <div>Tgl:</div>
          </div>
          <div style="flex: 1; text-align: center;">
            <div style="border-bottom: 1px dotted black; margin-bottom: 3px; min-height: 35px;"></div>
            <div style="font-weight: normal; margin-bottom: 2px;">(Prepress)</div>
            <div>Tgl:</div>
          </div>
          <div style="flex: 1; text-align: center;">
            <div style="border-bottom: 1px dotted black; margin-bottom: 3px; min-height: 35px;"></div>
            <div style="font-weight: normal; margin-bottom: 2px;">(Printing)</div>
            <div>Tgl:</div>
          </div>
          <div style="flex: 1; text-align: center;">
            <div style="border-bottom: 1px dotted black; margin-bottom: 3px; min-height: 35px;"></div>
            <div style="font-weight: normal; margin-bottom: 2px;">(Ponds)</div>
            <div>Tgl:</div>
          </div>
          <div style="flex: 1; text-align: center;">
            <div style="border-bottom: 1px dotted black; margin-bottom: 3px; min-height: 35px;"></div>
            <div style="font-weight: normal; margin-bottom: 2px;">(Finishing)</div>
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
              <iframe
                srcDoc={getPrintContent()}
                className="w-full"
                style={{
                  height: '297mm',
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
