import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { KalkulasiDetailItem } from '../Kalkulasi/types/kalkulasi';
import Logo from '../../../../images/logo/logo-cbl 1.svg';

interface KalkulasiPrintModalProps {
  kalkulasiId: number;
  onClose: () => void;
}

const KalkulasiPrintModal: React.FC<KalkulasiPrintModalProps> = ({
  kalkulasiId,
  onClose,
}) => {
  const [data, setData] = useState<KalkulasiDetailItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoBase64, setLogoBase64] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, [kalkulasiId]);

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

  const fetchData = async () => {
    try {
      setLoading(true);
      const url = `${
        import.meta.env.VITE_API_LINK
      }/marketing/kalkulasi/${kalkulasiId}`;
      const res = await axios.get(url, { withCredentials: true });
      console.log('Fetch Kalkulasi Data Detail:', res.data);
      if (res.data && res.data.data) {
        setData(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to fetch data for printing');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getValue = (value: any, defaultValue: string = '-') => {
    if (value === null || value === undefined || value === '') {
      return defaultValue;
    }
    return value;
  };

  const getNumericValue = (value: any, defaultValue: number = 0) => {
    if (value === null || value === undefined || value === '') {
      return defaultValue;
    }
    return typeof value === 'string' ? parseFloat(value) : value;
  };
  const getActionUser = (status: string) => {
    return data?.kalkulasi_action_user?.find(
      (action: any) => action.status === status,
    );
  };

  const formatActionLog = (label: string, status: string) => {
    const action = getActionUser(status);
    if (!action) return '';

    return `
    | <span style="font-weight: bold">${label}:</span> 
    ${action.user?.nama || '-'},
    ${action.tgl ? new Date(action.tgl).toLocaleString('id-ID') : '-'}
  `;
  };
  const getPrintContent = () => {
    if (!data) return '';

    const logoSrc = logoBase64 || Logo;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print - ${data.kode_kalkulasi || 'Kalkulasi'}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 8mm;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              font-size: 12px;
              width: 210mm;
              height: 297mm;
              overflow: hidden;
            }
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                margin: 0 !important;
                padding: 0 !important;
              }
              .print-container {
                page-break-inside: avoid;
                width: 100%;
                height: 100%;
                margin: 0;
                padding: 0;
              }
            }
            * {
              box-sizing: border-box;
            }
            table {
              border-collapse: collapse;
              width: 100%;
            }
            td {
              padding: 2px 4px;
              line-height: 1.3;
            }
            .text-sm {
              font-size: 14px;
            }
            .text-xs {
              font-size: 12px;
            }
            .text-xxs {
              font-size: 12px;
            }
            .border {
              border: 1px solid black;
            }
            .border-2 {
              border: 2px solid black;
            }
            .border-black {
              border-color: black;
            }
            .bg-red-400 {
              background-color: #f87171;
            }
            .bg-red-300 {
              background-color: #fca5a5;
            }
            .bg-blue-300 {
              background-color: #93c5fd;
            }
            .bg-yellow-200 {
              background-color: #fef08a;
            }
            .bg-yellow-100 {
              background-color: #fef9c3;
            }
            .bg-green-300 {
              background-color: #86efac;
            }
            .bg-gray-300 {
              background-color: #d1d5db;
            }
            .bg-pink-300 {
              background-color: #f9a8d4;
            }
            .text-center {
              text-align: center;
            }
            .text-right {
              text-align: right;
            }
            .font-bold {
              font-weight: bold;
            }
            .text-red-600 {
              color: #dc2626;
            }
          </style>
        </head>
        <body>
          <div class="print-container" style="
            font-size: 12px;
            width: 210mm;
            height: 297mm;
            margin: 0 auto;
            padding: 8mm;
            background-color: white;
            display: flex;
            flex-direction: column;
          ">
            <!-- Main Container with border -->
            <div class="border-2 border-black" style="
              width: 100%;
              height: 100%;
              margin: 0;
              display: flex;
              flex-direction: column;
              overflow: hidden;
            ">
              <div style="
                flex: 1;
                display: flex;
                flex-direction: column;
                min-height: 0;
              ">
                <!-- Header Section -->
                <table class="border" style="font-size: 12px">
                  <tbody>
                    <tr>
                      <td colspan="4" class="border bg-red-400 text-center font-bold" style="padding: 1px 4px">
                        <h1 style="font-size: 12px; font-weight: bold; margin: 0">
                          PT. Cahaya Berlian Lestari Offset
                        </h1>
                      </td>
                    </tr>
                    <tr>
                      <td colspan="4" class="border bg-red-300 text-center font-bold" style="padding: 1px 4px">
                        <h2 style="font-size: 12px; font-weight: 600; margin: 0">
                          Calculation Form: ${data.kode_kalkulasi}
                        </h2>
                      </td>
                    </tr>
                    <tr>
                      <td colspan="4" class="border bg-blue-300 text-center font-bold" style="padding: 1px 4px">
                        <h1 style="font-size: 12px; font-weight: bold; margin: 0">
                          ${data.label}
                        </h1>
                      </td>
                    </tr>
                    <tr>
                      <td class="border font-bold" style="width: 15%; padding: 1px 4px">Pemesan</td>
                      <td class="border bg-yellow-200 text-center font-bold" style="width: 35%; padding: 1px 4px">
                        ${getValue(data.nama_customer)}
                      </td>
                      <td class="border font-bold" style="width: 15%; padding: 1px 4px">Marketing</td>
                      <td class="border bg-yellow-200 font-bold" style="width: 35%; padding: 1px 4px">
                        ${getValue(data.kode_marketing)}
                      </td>
                    </tr>
                    <tr>
                      <td class="border font-bold" style="padding: 1px 4px">Nama Produk</td>
                      <td class="border bg-yellow-200 text-center" style="padding: 1px 4px">
                        ${getValue(data.nama_produk)}
                      </td>
                      <td class="border font-bold" style="padding: 1px 4px">Tanggal Kalkulasi</td>
                      <td class="border bg-yellow-200" style="padding: 1px 4px">
                        ${
                          data.createdAt
                            ? new Date(data.createdAt).toLocaleDateString(
                                'id-ID',
                                {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                },
                              )
                            : '-'
                        }
                      </td>
                    </tr>
                    <tr>
                      <td class="border font-bold" style="padding: 1px 4px">Spesifikasi</td>
                      <td class="border bg-yellow-200 text-center font-bold" style="padding: 1px 4px">
                        ${getValue(data.spesifikasi)}
                      </td>
                      <td class="border font-bold" style="padding: 1px 4px">Area</td>
                      <td class="border bg-yellow-200 font-bold" style="padding: 1px 4px">
                        ${getValue(data.nama_area_pengiriman)}
                      </td>
                    </tr>
                    <tr>
                      <td class="border font-bold" style="padding: 1px 4px">Status</td>
                      <td class="border bg-yellow-200 text-center font-bold" style="padding: 1px 4px">
                        ${getValue(data.status_kalkulasi)}
                      </td>
                      <td class="border font-bold" style="padding: 1px 4px">No OKP</td>
                      <td class="border bg-pink-300" style="padding: 1px 4px"></td>
                    </tr>
                    <tr>
                      <td class="border font-bold" style="padding: 1px 4px">Quantity</td>
                      <td class="border bg-yellow-200 text-center font-bold text-red-600" style="padding: 1px 4px">
                        ${getNumericValue(data.qty_kalkulasi).toLocaleString()}
                      </td>
                      <td class="border font-bold" style="padding: 1px 4px">No SO</td>
                      <td class="border bg-pink-300" style="padding: 1px 4px"></td>
                    </tr>
                    <tr>
                      <td class="border" style="padding: 1px 4px"></td>
                      <td class="border bg-yellow-200" style="padding: 1px 4px"></td>
                      <td class="border font-bold" style="padding: 1px 4px">No IO</td>
                      <td class="border bg-pink-300" style="padding: 1px 4px"></td>
                    </tr>
                  </tbody>
                </table>

                <!-- Ukuran Produk Section -->
                <table class="border" style="font-size: 12px">
                  <tbody>
                    <tr>
                      <td colspan="12" class="border bg-blue-300 text-center font-bold" style="padding: 1px 4px">
                        Ukuran Produk
                      </td>
                    </tr>
                    <tr>
                      <td class="border" style="width: 10%; padding: 1px 3px">Ukuran Jadi</td>
                      <td class="border" style="width: 5%; padding: 1px 3px">P(mm)</td>
                      <td class="border bg-yellow-200" style="width: 7%; padding: 1px 3px">
                        ${getNumericValue(data.ukuran_jadi_panjang)}
                      </td>
                      <td class="border" style="width: 5%; padding: 1px 3px">L(mm)</td>
                      <td class="border bg-yellow-200" style="width: 7%; padding: 1px 3px">
                        ${getNumericValue(data.ukuran_jadi_lebar)}
                      </td>
                      <td class="border" style="width: 5%; padding: 1px 3px">T(mm)</td>
                      <td class="border bg-yellow-200" style="width: 7%; padding: 1px 3px">
                        ${getNumericValue(data.ukuran_jadi_tinggi)}
                      </td>
                      <td class="border" style="width: 10%; padding: 1px 3px">Terbentang</td>
                      <td class="border bg-yellow-200" style="width: 10%; padding: 1px 3px">
                        ${getNumericValue(data.ukuran_jadi_terb_panjang)}
                      </td>
                      <td class="border" style="width: 5%; padding: 1px 3px">x</td>
                      <td colspan="2" class="border bg-yellow-200" style="width: 10%; padding: 1px 3px">
                        ${getNumericValue(data.ukuran_jadi_terb_lebar)}
                      </td>
                    </tr>
                    <tr>
                      <td class="border" style="padding: 1px 3px">Ukuran Cetak</td>
                      <td class="border" style="padding: 1px 3px">P(mm)</td>
                      <td class="border bg-yellow-200" style="padding: 1px 3px">
                        ${getNumericValue(data.ukuran_cetak_panjang_1)}
                      </td>
                      <td class="border" style="padding: 1px 3px">L(mm)</td>
                      <td class="border bg-yellow-200" style="padding: 1px 3px">
                        ${getNumericValue(data.ukuran_cetak_lebar_1)}
                      </td>
                      <td class="border" style="padding: 1px 3px"></td>
                      <td class="border bg-yellow-200" style="padding: 1px 3px">
                        ${getNumericValue(data.ukuran_cetak_bagian_1)}
                      </td>
                      <td class="border" style="padding: 1px 3px">Bagian</td>
                      <td class="border bg-yellow-200" style="padding: 1px 3px ">Isi</td>
                      <td class="border " style="padding: 1px 3px">
                        ${getNumericValue(data.ukuran_cetak_isi_1)}
                      </td>
                      <td class="border bg-yellow-200" style="padding: 1px 3px">BBS</td>
                      <td class="border " style="padding: 1px 3px">
                        ${getValue(data.ukuran_cetak_bbs_1, 'No')}
                      </td>
                    </tr>
                    <tr>
                      <td class="border" style="padding: 1px 3px">Ukuran Cetak</td>
                      <td class="border" style="padding: 1px 3px">P(mm)</td>
                      <td class="border bg-yellow-200" style="padding: 1px 3px">
                        ${getNumericValue(data.ukuran_cetak_panjang_2)}
                      </td>
                      <td class="border" style="padding: 1px 3px">L(mm)</td>
                      <td class="border bg-yellow-200" style="padding: 1px 3px">
                        ${getNumericValue(data.ukuran_cetak_lebar_2)}
                      </td>
                      <td class="border" style="padding: 1px 3px"></td>
                      <td class="border bg-yellow-200" style="padding: 1px 3px">
                        ${getNumericValue(data.ukuran_cetak_bagian_2)}
                      </td>
                      <td class="border" style="padding: 1px 3px">Bagian</td>
                      <td class="border bg-yellow-200" style="padding: 1px 3px">Isi</td>
                      <td class="border " style="padding: 1px 3px">
                        ${getNumericValue(data.ukuran_cetak_isi_2)}
                      </td>
                      <td class="border bg-yellow-200" style="padding: 1px 3px">BBS</td>
                      <td class="border " style="padding: 1px 3px">
                        ${getValue(data.ukuran_cetak_bbs_2, 'No')}
                      </td>
                    </tr>
                    <tr>
                      <td colspan="13" class="border bg-blue-300 text-center font-bold" style="padding: 1px 4px">
                        Warna Cetakan
                      </td>
                    </tr>
                    <tr>
                      <td class="border" style="padding: 1px 3px"></td>
                      <td colspan="2" class="border" style="padding: 1px 3px">Depan</td>
                      <td class="border bg-yellow-200" style="padding: 1px 3px">
                        ${getNumericValue(data.warna_depan)}
                      </td>
                      <td colspan="2" class="border" style="padding: 1px 3px">Belakang</td>
                      <td class="border bg-yellow-200" style="padding: 1px 3px">
                        ${getNumericValue(data.warna_belakang)}
                      </td>
                      <td colspan="2" class="border" style="padding: 1px 3px">Total Warna</td>
                      <td class="border bg-gray-300" style="padding: 1px 3px">
                        ${getNumericValue(data.jumlah_warna)}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <!-- Pre-Press & Press Section -->
                <table class="border" style="font-size: 12px">
                  <tbody>
                    <tr>
                      <td class="border bg-blue-300 font-bold text-center" colspan="3" style="width: 50%; padding: 1px 4px">
                        Pre-Press & Press
                      </td>
                      <td class="border bg-red-300 font-bold text-center" colspan="2" style="width: 25%; padding: 1px 4px">
                        PRINTING INSHEET
                      </td>
                      <td class="border bg-yellow-200 text-center font-bold text-red-600" style="width: 25%; padding: 1px 4px">
                        ${getNumericValue(data.print_insheet, 500)}
                      </td>
                    </tr>
                    <tr>
                      <td class="border bg-green-300 font-bold" colspan="3" style="padding: 1px 4px">Bahan</td>
                      <td class="border bg-green-300 font-bold" colspan="2" style="padding: 1px 4px">Mesin</td>
                      <td class="border bg-yellow-200 font-bold text-center" style="padding: 1px 4px">
                        ${getValue(data.jenis_mesin_cetak)}
                      </td>
                    </tr>
                    <tr>
                      <td class="border font-bold" style="padding: 1px 3px">Kertas</td>
                      <td colspan="2" class="border bg-yellow-200" style="padding: 1px 3px">
                        ${getValue(data.nama_kertas)}
                      </td>
                      <td class="border bg-green-300 font-bold" colspan="2" style="padding: 1px 3px">Plate</td>
                      <td class="border bg-yellow-200 text-right" style="padding: 1px 3px">
                        ${getNumericValue(data.jumlah_warna)}
                      </td>
                    </tr>
                    <tr>
                      <td class="border font-bold" style="padding: 1px 3px">Gramature</td>
                      <td colspan="2" class="border bg-yellow-200" style="padding: 1px 3px">
                        ${getNumericValue(data.gramature_kertas)}
                      </td>
                      <td class="border bg-green-300" colspan="2" style="padding: 1px 3px"></td>
                      <td class="border bg-gray-300 text-right" style="padding: 1px 3px; font-size: 12px">
                        ${formatCurrency(getNumericValue(data.harga_plate))}
                      </td>
                    </tr>
                    <tr>
                      <td class="border font-bold" style="padding: 1px 3px">Ukuran Kertas</td>
                      <td class="border" style="padding: 1px 3px">
                        <div style="display: flex; justify-content: space-between">
                          <span style="font-weight: bold">P(mm)</span>
                          <span class="bg-yellow-200">${getNumericValue(
                            data.panjang_kertas,
                          )}</span>
                        </div>
                      </td>
                      <td class="border" style="padding: 1px 3px">
                        <div style="display: flex; justify-content: space-between">
                          <span style="font-weight: bold">L(mm)</span>
                          <span class="bg-yellow-200">${getNumericValue(
                            data.lebar_kertas,
                          )}</span>
                        </div>
                      </td>
                      <td class="border bg-green-300 font-bold" style="padding: 1px 3px">Cetak</td>
                      <td colspan="2" class="border bg-gray-300 text-right" style="padding: 1px 3px; font-size: 12px">
                        ${formatCurrency(
                          getNumericValue(data.jumlah_harga_cetak),
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td class="border font-bold" style="padding: 1px 3px">Percentage</td>
                      <td style="padding: 1px 3px">
                        <div style="display: flex; justify-content: space-between">
                          <span style="font-weight: bold">%</span>
                          <span class="bg-yellow-200">${getNumericValue(
                            data.persentase_apki_kertas,
                          )}</span>
                        </div>
                      </td>
                      <td class="border font-bold" style="padding: 1px 3px"></td>
                      <td class="border bg-green-300 font-bold" style="padding: 1px 3px">Mesin Coating Depan</td>
                      <td colspan="2" class="border bg-yellow-200 text-center" style="padding: 1px 3px">
                        ${getValue(data.nama_mesin_coating_depan)}
                      </td>
                    </tr>
                    <tr>
                      <td class="border font-bold" style="padding: 1px 3px">Total Kertas</td>
                      <td colspan="2" class="border bg-gray-300" style="padding: 1px 3px">
                        ${getNumericValue(data.total_kertas).toFixed(0)}
                      </td>
                      <td class="border bg-green-300 font-bold" style="padding: 1px 3px">Coating Depan</td>
                      <td colspan="2" class="border bg-yellow-200 text-center" style="padding: 1px 3px">
                        ${getValue(data.nama_coating_depan)}
                      </td>
                    </tr>
                    <tr>
                      <td class="border font-bold" style="padding: 1px 3px">Total Harga Kertas</td>
                      <td colspan="2" class="border bg-gray-300" style="padding: 1px 3px; font-size: 12px">
                        ${formatCurrency(
                          getNumericValue(data.total_harga_kertas),
                        )}
                      </td>
                      <td class="border bg-green-300 font-bold" style="padding: 1px 3px">Mesin Coating Belakang</td>
                      <td colspan="2" class="border bg-yellow-200 text-center" style="padding: 1px 3px">
                        ${getValue(data.nama_mesin_coating_belakang)}
                      </td>
                    </tr>
                    <tr>
                      <td class="border font-bold" style="padding: 1px 3px">Mesin Potong</td>
                      <td colspan="2" class="border bg-yellow-200 text-center" style="padding: 1px 3px">
                        ${getValue(data.nama_mesin_potong)}
                      </td>
                      <td class="border bg-green-300 font-bold" style="padding: 1px 3px">Coating Belakang</td>
                      <td colspan="2" class="border bg-yellow-200 text-center" style="padding: 1px 3px">
                        ${getValue(data.nama_coating_belakang)}
                      </td>
                    </tr>
                    <tr>
                      <td class="border" colspan="3" style="padding: 1px 3px"></td>
                      <td class="border bg-green-300" style="padding: 1px 3px"></td>
                      <td colspan="2" class="border bg-gray-300 text-right" style="padding: 1px 3px; font-size: 12px">
                        ${formatCurrency(
                          getNumericValue(data.total_harga_coating),
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <!-- Post-Press Section -->
                <table class="border" style="font-size: 12px">
                  <tbody>
                    <tr>
                      <td class="border bg-blue-300 font-bold text-center" style="width: 15%; padding: 1px 3px">Post-Press</td>
                      <td class="border bg-red-300 font-bold text-center" style="width: 15%; padding: 1px 3px">Ponds Insheet</td>
                      <td class="border bg-yellow-200 text-center font-bold text-red-600" style="width: 20%; padding: 1px 3px">
                        ${getNumericValue(data.pons_insheet)}
                      </td>
                      <td class="border bg-red-300 font-bold text-center" style="width: 20%; padding: 1px 3px">Finishing Insheet</td>
                      <td class="border bg-yellow-200 text-center font-bold text-red-600" style="width: 30%; padding: 1px 3px">
                        ${getNumericValue(data.finishing_insheet)}
                      </td>
                    </tr>
                    <tr>
                      <td class="border bg-green-300 font-bold" style="padding: 1px 3px">Pons:</td>
                      <td colspan="2" class="border bg-yellow-200 text-center" style="padding: 1px 3px">
                        ${getValue(data.nama_jenis_pons)} ${getValue(
                          data.nama_mesin_pons,
                        )}
                      </td>
                      <td class="border bg-green-300 font-bold" style="padding: 1px 3px">Lem</td>
                      <td class="border bg-yellow-200 text-center" style="padding: 1px 3px">
                        ${getValue(data.nama_lem)}
                      </td>
                    </tr>
                    <tr>
                      <td class="border" style="padding: 1px 3px">Ongkos pons</td>
                      <td class="border bg-yellow-200" style="padding: 1px 3px">
                        ${getValue(data.ongkos_pons)}
                      </td>
                      <td class="border bg-gray-300" style="padding: 1px 3px; font-size: 12px">
                        ${formatCurrency(
                          getNumericValue(data.harga_satuan_ongkos_pons),
                        )}
                      </td>
                      <td class="border bg-green-300 font-bold" style="padding: 1px 3px">Mesin Finishing</td>
                      <td class="border bg-yellow-200 text-center" style="padding: 1px 3px">
                        ${getValue(data.nama_mesin_finishing)}
                      </td>
                    </tr>
                    <tr>
                      <td class="border" style="padding: 1px 3px">Harga Pisau</td>
                      <td class="border" style="padding: 1px 3px"></td>
                      <td class="border bg-gray-300" style="padding: 1px 3px; font-size: 12px">
                        ${formatCurrency(getNumericValue(data.harga_pisau))}
                      </td>
                      <td class="border" style="padding: 1px 3px">Total harga lem</td>
                      <td class="border text-right bg-gray-300" style="padding: 1px 3px; font-size: 12px">
                        ${formatCurrency(
                          getNumericValue(data.jumlah_harga_lem),
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td class="border" style="padding: 1px 3px">Total Pons</td>
                      <td class="border" style="padding: 1px 3px"></td>
                      <td class="border bg-gray-300" style="padding: 1px 3px; font-size: 12px">
                        ${formatCurrency(
                          getNumericValue(data.total_harga_ongkos_pons),
                        )}</td>
                  <td class="border" style="padding: 1px 3px">Foil</td>
                  <td class="border bg-yellow-200 text-right" style="padding: 1px 3px">
                    ${getValue(data.foil, '-')}
                  </td>
                </tr>
                <tr>
                  <td class="border" style="padding: 1px 3px">Lipat</td>
                  <td class="border bg-yellow-200" style="padding: 1px 3px">
                    ${getValue(data.lipat)}
                  </td>
                  <td class="border bg-yellow-200" style="padding: 1px 3px">
                    ${getNumericValue(data.qty_lipat)}
                  </td>
                  <td class="border" style="padding: 1px 3px">Harga Foil Manual</td>
                  <td class="border bg-gray-300 text-right" style="padding: 1px 3px; font-size: 12px">
                    ${formatCurrency(getNumericValue(data.harga_foil_manual))}
                  </td>
                </tr>
                <tr>
                  <td class="border" style="padding: 1px 3px">Mesin Lipat</td>
                  <td class="border bg-yellow-200" style="padding: 1px 3px">
                    ${getValue(data.nama_mesin_lipat, '-')}
                  </td>
                  <td class="border bg-gray-300" style="padding: 1px 3px; font-size: 12px">
                    ${formatCurrency(getNumericValue(data.harga_lipat))}
                  </td>
                  <td class="border" style="padding: 1px 3px">Spot Foil</td>
                  <td class="border bg-yellow-200 text-right" style="padding: 1px 3px">
                    ${getValue(data.spot_foil, '-')}
                  </td>
                </tr>
                <tr>
                  <td class="border" style="padding: 1px 3px">Potong jadi</td>
                  <td class="border bg-yellow-200" style="padding: 1px 3px">
                    ${getValue(data.potong_jadi, 'NO')}
                  </td>
                  <td class="border bg-yellow-200" style="padding: 1px 3px">
                    ${getNumericValue(data.qty_potong)}
                  </td>
                  <td class="border" style="padding: 1px 3px">Harga Spot Foil Manual</td>
                  <td class="border bg-gray-300 text-right" style="padding: 1px 3px; font-size: 12px">
                    ${formatCurrency(
                      getNumericValue(data.harga_spot_foil_manual),
                    )}
                  </td>
                </tr>
                <tr>
                  <td class="border" style="padding: 1px 3px">Uk. Packaging</td>
                  <td class="border" style="padding: 1px 3px">P(mm)</td>
                  <td class="border bg-yellow-200 text-right" style="padding: 1px 3px">
                    ${getNumericValue(data.panjang_packaging)}
                  </td>
                  <td class="border" style="padding: 1px 3px">Harga Polimer Manual</td>
                  <td class="border bg-gray-300 text-right" style="padding: 1px 3px; font-size: 12px">
                    ${formatCurrency(
                      getNumericValue(data.harga_polimer_manual),
                    )}
                  </td>
                </tr>
                <tr>
                  <td class="border" style="padding: 1px 3px"></td>
                  <td class="border" style="padding: 1px 3px">L(mm)</td>
                  <td class="border bg-yellow-200 text-right" style="padding: 1px 3px">
                    ${getNumericValue(data.lebar_packaging)}
                  </td>
                  <td class="border" style="padding: 1px 3px">Harga Pengiriman</td>
                  <td class="border bg-yellow-200 text-right" style="font-size: 10px; padding: 1px 3px">
                    ${getNumericValue(data.jumlah_kirim)} x 
                    ${formatCurrency(
                      getNumericValue(data.harga_area_pengiriman),
                    )} = 
                    ${formatCurrency(getNumericValue(data.harga_pengiriman))}
                  </td>
                </tr>
                <tr>
                  <td class="border" style="padding: 1px 3px">No. Packaging</td>
                  <td colspan="2" class="border bg-gray-300" style="padding: 1px 3px">
                    ${getNumericValue(data.no_packaging)}
                  </td>
                  <td class="border" style="padding: 1px 3px">Packaging</td>
                  <td class="border bg-gray-300 text-right" style="padding: 1px 3px; font-size: 12px">
                    ${formatCurrency(getNumericValue(data.harga_packaging))}
                  </td>
                </tr>
                <tr>
                  <td class="border" style="padding: 1px 3px"></td>
                  <td colspan="2" class="border" style="padding: 1px 3px"></td>
                  <td class="border bg-yellow-200" style="padding: 1px 3px; font-size: 12px">
                    ${getValue(
                      data.jenis_packing,
                      'CGS-004 UK 435X315X340 SW-KK',
                    )}
                  </td>
                  <td class="border bg-gray-300 text-right" style="padding: 1px 3px; font-size: 12px">
                    ${formatCurrency(getNumericValue(data.harga_packing))}
                  </td>
                </tr>
                ${
                  data.lain_lain && data.lain_lain.length > 0
                    ? `
                <tr>
                  <td colspan="5" class="border bg-yellow-200 font-bold" style="padding: 1px 3px">
                    Lain-Lain
                  </td>
                </tr>
                ${data.lain_lain
                  .map(
                    (item: any) => `
                <tr>
                  <td colspan="3" class="border" style="padding: 1px 3px">
                    ${item.nama_item}
                  </td>
                  <td colspan="2" class="border" style="padding: 1px 3px; font-size: 12px">
                    ${formatCurrency(item.harga)}
                  </td>
                </tr>
                `,
                  )
                  .join('')}
                `
                    : ''
                }
              </tbody>
            </table>

            <!-- Harga Section -->
            <table class="border" style="font-size: 12px">
              <tbody>
                <tr>
                  <td colspan="5" class="border bg-blue-300 text-center font-bold" style="padding: 1px 4px">
                    Harga
                  </td>
                </tr>
                <tr>
                  <td class="border bg-green-300" style="width: 20%; padding: 1px 3px">Biaya Produksi</td>
                  <td class="border bg-gray-300 text-right" style="width: 30%; padding: 1px 3px; font-size: 12px">
                    ${formatCurrency(getNumericValue(data.harga_produksi))}
                  </td>
                  <td class="border bg-green-300" style="width: 20%; padding: 1px 3px">Biaya Produksi per pc</td>
                  <td colspan="2" class="border bg-gray-300 text-right" style="width: 30%; padding: 1px 3px; font-size: 12px">
                    ${formatCurrency(
                      getNumericValue(data.harga_produksi) /
                        getNumericValue(data.qty_kalkulasi, 1),
                    )}
                  </td>
                </tr>
                <tr>
                  <td class="border bg-green-300" style="padding: 1px 3px">Profit Margin (%)</td>
                  <td class="border bg-yellow-200" style="padding: 1px 3px">
                    ${getNumericValue(data.profit)}%
                  </td>
                  <td class="border bg-gray-300 text-right" style="padding: 1px 3px; font-size: 12px">
                    ${formatCurrency(getNumericValue(data.profit_harga))}
                  </td>
                  <td class="border bg-green-300" style="padding: 1px 3px">Profit Margin per pc</td>
                  <td class="border bg-gray-300 text-right" style="padding: 1px 3px; font-size: 12px">
                    ${formatCurrency(
                      getNumericValue(data.profit_harga) /
                        getNumericValue(data.qty_kalkulasi, 1),
                    )}
                  </td>
                </tr>
                <tr>
                  <td class="border bg-green-300" style="padding: 1px 3px">Total Harga Jual</td>
                  <td colspan="2" class="border bg-gray-300 text-right" style="padding: 1px 3px; font-size: 12px">
                    ${formatCurrency(getNumericValue(data.jumlah_harga_jual))}
                  </td>
                  <td class="border bg-green-300" style="padding: 1px 3px">Harga Jual per pc</td>
                  <td class="border bg-gray-300 text-right" style="padding: 1px 3px; font-size: 12px">
                    ${formatCurrency(
                      getNumericValue(data.jumlah_harga_jual) /
                        getNumericValue(data.qty_kalkulasi, 1),
                    )}
                  </td>
                </tr>
                <tr>
                  <td class="border bg-green-300" style="padding: 1px 3px">PPN</td>
                  <td class="border bg-yellow-200" style="padding: 1px 3px">
                    ${getNumericValue(data.ppn)}%
                  </td>
                  <td class="border bg-gray-300 text-right" style="padding: 1px 3px; font-size: 12px">
                    ${formatCurrency(getNumericValue(data.harga_ppn))}
                  </td>
                  <td class="border bg-green-300" style="padding: 1px 3px">PPN per pc</td>
                  <td class="border bg-gray-300 text-right" style="padding: 1px 3px; font-size: 12px">
                    ${formatCurrency(
                      getNumericValue(data.harga_ppn) /
                        getNumericValue(data.qty_kalkulasi, 1),
                    )}
                  </td>
                </tr>
                <tr>
                  <td class="border bg-green-300" style="padding: 1px 3px">Discount (%)</td>
                  <td class="border bg-yellow-200" style="padding: 1px 3px">
                    ${getNumericValue(data.diskon)}%
                  </td>
                  <td class="border bg-gray-300 text-right" style="padding: 1px 3px; font-size: 12px">
                    ${formatCurrency(getNumericValue(data.harga_diskon))}
                  </td>
                  <td class="border bg-green-300" style="padding: 1px 3px">Discount per pc</td>
                  <td class="border bg-red-400 text-right" style="padding: 1px 3px; font-size: 12px">
                    ${formatCurrency(
                      getNumericValue(data.harga_diskon) /
                        getNumericValue(data.qty_kalkulasi, 1),
                    )}
                  </td>
                </tr>
                <tr>
                  <td class="border bg-green-300 font-bold" style="padding: 1px 3px">TOTAL</td>
                  <td class="border" style="padding: 1px 3px"></td>
                  <td class="border bg-red-400 font-bold text-right" style="padding: 1px 3px; font-size: 12px">
                    ${formatCurrency(getNumericValue(data.total_harga))}
                  </td>
                  <td class="border bg-green-300 font-bold" style="padding: 1px 3px">TOTAL per pc</td>
                  <td class="border bg-red-400 font-bold text-right" style="padding: 1px 3px; font-size: 12px">
                    ${formatCurrency(
                      getNumericValue(data.jumlah_harga_jual) /
                        getNumericValue(data.qty_kalkulasi, 1),
                    )}
                  </td>
                </tr>
                <tr>
                  <td colspan="3" class="border bg-red-400 text-center font-bold" style="padding: 1px 3px">
                    ${formatCurrency(
                      getNumericValue(data.total_harga_satuan_customer) *
                        getNumericValue(data.qty_kalkulasi, 1),
                    )}
                  </td>
                  <td colspan="2" class="border bg-yellow-200 text-center font-bold" style="padding: 1px 3px">
                    Rp. ${Math.floor(
                      getNumericValue(data.total_harga_satuan_customer),
                    ).toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td class="border bg-yellow-100 font-bold" style="width: 20%; padding: 1px 3px">
                    Keterangan KERJA
                  </td>
                  <td colspan="4" class="border bg-yellow-200" style="padding: 1px 3px">
                    ${getValue(data.keterangan_kerja)}
                  </td>
                </tr>
                <tr>
                  <td class="border bg-yellow-100 font-bold" style="padding: 1px 3px">
                    Keterangan HARGA
                  </td>
                  <td colspan="4" class="border bg-yellow-200" style="padding: 1px 3px">
                    ${getValue(data.keterangan_harga)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Footer Section -->
          <table class="border" style="font-size: 12px; margin-top: auto">
            <tbody>
              <tr>
                <td class="border" style="width: 40%; height: 60px; vertical-align: top; padding: 2px 4px">
                  <div style="font-weight: bold">Layout Potongan Kertas dan Montage</div>
                </td>
                <td class="border text-center" style="width: 30%; height: 60px; vertical-align: top; padding: 2px 4px">
                  <div style="font-weight: bold">Estimator</div>
                  <div style="height: 30px"></div>
                  <div style="border-top: 1px solid black; margin-top: 2px; padding-top: 1px"></div>
                </td>
                <td class="border text-center" style="width: 30%; vertical-align: top; padding: 2px 4px">
                  <div style="font-weight: bold">
                    Bandung,......
                    <div>Mengetahui/Menyetujui</div>
                  </div>
                  <div style="height: 30px"></div>
                  <div style="border-top: 1px solid black; margin-top: 2px; padding-top: 1px"></div>
                </td>
              </tr>
              <tr>
                <td colspan="3" class="border" style="font-size: 8px; padding: 1px 4px">
                  <span style="font-weight: bold">Created:</span> 
                  ${data.user_create?.nama || '-'},
                  ${
                    data.createdAt
                      ? new Date(data.createdAt).toLocaleString('id-ID')
                      : '-'
                  }
                  ${
                    data.status_kalkulasi !== 'draft'
                      ? `
                  ${formatActionLog('Submitted', 'submited')}
                  | <span style="font-weight: bold">Approved:</span> 
                  ${data.user_approve?.nama || '-'},
                  ${
                    data.tgl_approve_kalkulasi
                      ? new Date(data.tgl_approve_kalkulasi).toLocaleString(
                          'id-ID',
                        )
                      : '-'
                  }
                  `
                      : ''
                  }
                  ${formatActionLog('Updated', 'updated')}
                </td>
              </tr>
            </tbody>
          </table>
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
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg p-8">
          <p>Data tidak ditemukan</p>
          <button
            onClick={onClose}
            className="mt-4 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            Close
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black bg-opacity-75">
      <div className="flex flex-col h-full">
        {/* Header with buttons */}
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            Print Preview - {data.kode_kalkulasi}
          </h2>
          <div className="flex gap-2">
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
        {/* Scrollable preview area */}
        <div className="flex-1 overflow-auto bg-gray-600 p-8">
          <div className="max-w-[210mm] mx-auto bg-white shadow-2xl">
            {/* Preview using iframe */}
            <iframe
              srcDoc={getPrintContent()}
              className="w-full"
              style={{
                height: '297mm', // A4 height
                border: 'none',
                backgroundColor: 'white',
              }}
              title="Kalkulasi Preview"
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
export default KalkulasiPrintModal;
