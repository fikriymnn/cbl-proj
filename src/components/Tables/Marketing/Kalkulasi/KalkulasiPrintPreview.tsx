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
  const printRef = useRef<HTMLDivElement>(null);
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

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        const logoSrc = logoBase64 || Logo;
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Print - ${data?.kode_kalkulasi || 'Kalkulasi'}</title>
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
                  padding: 3px 4px;
                  line-height: 1.4;
                }
                .text-sm {
                  font-size: 14px;
                }
                .text-xs {
                  font-size: 11px;
                }
              </style>
              <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
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

  const formatCurrency = (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `Rp. ${num.toLocaleString('id-ID', { minimumFractionDigits: 0 })}`;
  };

  const formatCurrencyInteger = (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `Rp. ${Math.floor(num).toLocaleString('id-ID', {
      minimumFractionDigits: 0,
    })}`;
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
    return value;
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

        {/* Scrollable content area */}
        <div className="flex-1 overflow-auto bg-gray-600 p-4">
          <div className="max-w-[800px] mx-auto bg-white shadow-2xl">
            <div
              ref={printRef}
              className="print-container"
              style={{
                fontSize: '9px',
                width: '210mm',
                height: '297mm',
                margin: 0,
                padding: '10mm', // Added padding for print margins
              }}
            >
              {/* Main Container with border */}
              <div
                className="border-2 border-black"
                style={{
                  width: '100%',
                  height: '100%',
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    flex: '1',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {/* Header Section - Image 1 */}
                  <table
                    className="w-full border-collapse"
                    style={{ fontSize: '9px' }}
                  >
                    <tbody>
                      <tr>
                        <td
                          colSpan={4}
                          className="border border-black bg-red-400  text-center font-bold"
                        >
                          <h1 className="text-sm font-bold">
                            PT. Cahaya Berlian Lestari Offset
                          </h1>
                        </td>
                      </tr>
                      <tr>
                        <td
                          colSpan={4}
                          className="border border-black bg-red-300  text-center font-bold"
                        >
                          <h2 className="text-xs font-semibold ">
                            Calculation Form: {data.kode_kalkulasi}
                          </h2>
                        </td>
                      </tr>
                      {/* Label Field */}
                      <tr>
                        <td
                          colSpan={4}
                          className="border border-black  bg-blue-300 text-center font-bold"
                        >
                          <h1 className="text-xs font-bold">{data.label}</h1>
                        </td>
                      </tr>
                      <tr>
                        <td
                          className="border border-black  font-bold"
                          style={{ width: '15%' }}
                        >
                          Pemesan
                        </td>
                        <td
                          className="border border-black  bg-yellow-200 text-center font-bold"
                          style={{ width: '35%' }}
                        >
                          {getValue(data.nama_customer)}
                        </td>
                        <td
                          className="border border-black  font-bold"
                          style={{ width: '15%' }}
                        >
                          Marketing
                        </td>
                        <td
                          className="border border-black  bg-yellow-200 font-bold"
                          style={{ width: '35%' }}
                        >
                          {getValue(data.kode_marketing)}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black  font-bold">
                          Nama Produk
                        </td>
                        <td className="border border-black  bg-yellow-200 text-center">
                          {getValue(data.nama_produk)}
                          <br />({getNumericValue(data.ukuran_jadi_panjang)}x
                          {getNumericValue(data.ukuran_jadi_lebar)}x
                          {getNumericValue(data.ukuran_jadi_tinggi)})
                        </td>
                        <td className="border border-black  font-bold">
                          Tanggal Kalkulasi
                        </td>
                        <td className="border border-black  bg-yellow-200">
                          {new Date(data.tgl_kalkulasi).toLocaleDateString(
                            'id-ID',
                            { day: 'numeric', month: 'long', year: 'numeric' },
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black  font-bold">
                          Spesifikasi
                        </td>
                        <td className="border border-black  bg-yellow-200 text-center font-bold">
                          {getValue(data.spesifikasi)}
                        </td>
                        <td className="border border-black  font-bold">Area</td>
                        <td className="border border-black  bg-yellow-200 font-bold">
                          {getValue(data.nama_area_pengiriman)}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black  font-bold">
                          Status
                        </td>
                        <td className="border border-black  bg-yellow-200 text-center font-bold">
                          {getValue(data.status_kalkulasi)}
                        </td>
                        <td className="border border-black  font-bold">
                          No OKP
                        </td>
                        <td className="border border-black  bg-pink-300"></td>
                      </tr>
                      <tr>
                        <td className="border border-black  font-bold">
                          Quantity
                        </td>
                        <td className="border border-black  bg-yellow-200 text-center font-bold text-red-600">
                          {getNumericValue(data.qty_kalkulasi).toLocaleString()}
                        </td>
                        <td className="border border-black  font-bold">
                          No SO
                        </td>
                        <td className="border border-black  bg-pink-300"></td>
                      </tr>
                      <tr>
                        <td className="border border-black "></td>
                        <td className="border border-black  bg-yellow-200"></td>
                        <td className="border border-black  font-bold">
                          No IO
                        </td>
                        <td className="border border-black  bg-pink-300"></td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Ukuran Produk Section - Image 2 */}
                  <table
                    className="w-full border-collapse"
                    style={{ fontSize: '9px' }}
                  >
                    <tbody>
                      <tr>
                        <td
                          colSpan={12}
                          className="border border-black  bg-blue-300 text-center font-bold"
                        >
                          Ukuran Produk
                        </td>
                      </tr>
                      <tr>
                        <td
                          className="border border-black "
                          style={{ width: '10%' }}
                        >
                          Ukuran Jadi
                        </td>
                        <td
                          className="border border-black "
                          style={{ width: '5%' }}
                        >
                          P(mm)
                        </td>
                        <td
                          className="border border-black  bg-yellow-200"
                          style={{ width: '7%' }}
                        >
                          {getNumericValue(data.ukuran_jadi_panjang)}
                        </td>
                        <td
                          className="border border-black "
                          style={{ width: '5%' }}
                        >
                          L(mm)
                        </td>
                        <td
                          className="border border-black  bg-yellow-200"
                          style={{ width: '7%' }}
                        >
                          {getNumericValue(data.ukuran_jadi_lebar)}
                        </td>
                        <td
                          className="border border-black "
                          style={{ width: '5%' }}
                        >
                          T(mm)
                        </td>
                        <td
                          className="border border-black  bg-yellow-200"
                          style={{ width: '7%' }}
                        >
                          {getNumericValue(data.ukuran_jadi_tinggi)}
                        </td>
                        <td
                          className="border border-black "
                          style={{ width: '10%' }}
                        >
                          Terbentang
                        </td>
                        <td
                          className="border border-black  bg-yellow-200"
                          style={{ width: '10%' }}
                        >
                          {getNumericValue(data.ukuran_jadi_terb_panjang)}
                        </td>
                        <td
                          className="border border-black "
                          style={{ width: '5%' }}
                        >
                          x
                        </td>
                        <td
                          className="border border-black  bg-yellow-200"
                          colSpan={2}
                          style={{ width: '10%' }}
                        >
                          {getNumericValue(data.ukuran_jadi_terb_lebar)}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black ">Ukuran Cetak</td>
                        <td className="border border-black ">P(mm)</td>
                        <td className="border border-black  bg-yellow-200">
                          {getNumericValue(data.ukuran_cetak_panjang_1)}
                        </td>
                        <td className="border border-black ">L(mm)</td>
                        <td className="border border-black  bg-yellow-200">
                          {getNumericValue(data.ukuran_cetak_lebar_1)}
                        </td>
                        <td className="border border-black "></td>
                        <td className="border border-black  bg-yellow-200">
                          {getNumericValue(data.ukuran_cetak_bagian_1)}
                        </td>
                        <td className="border border-black ">Bagian</td>
                        <td className="border border-black ">Isi</td>
                        <td className="border border-black  bg-yellow-200">
                          {getNumericValue(data.ukuran_cetak_isi_1)}
                        </td>
                        <td className="border border-black ">BBS</td>
                        <td className="border border-black  bg-yellow-200">
                          {getValue(data.ukuran_cetak_bbs_1, 'No')}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black ">Ukuran Cetak</td>
                        <td className="border border-black ">P(mm)</td>
                        <td className="border border-black  bg-yellow-200">
                          {getNumericValue(data.ukuran_cetak_panjang_2)}
                        </td>
                        <td className="border border-black ">L(mm)</td>
                        <td className="border border-black  bg-yellow-200">
                          {getNumericValue(data.ukuran_cetak_lebar_2)}
                        </td>
                        <td className="border border-black "></td>
                        <td className="border border-black  bg-yellow-200">
                          {getNumericValue(data.ukuran_cetak_bagian_2)}
                        </td>
                        <td className="border border-black ">Bagian</td>
                        <td className="border border-black ">Isi</td>
                        <td className="border border-black  bg-yellow-200">
                          {getNumericValue(data.ukuran_cetak_isi_2)}
                        </td>
                        <td className="border border-black ">BBS</td>
                        <td className="border border-black  bg-yellow-200">
                          {getValue(data.ukuran_cetak_bbs_2, 'No')}
                        </td>
                      </tr>
                      <tr>
                        <td
                          colSpan={13}
                          className="border border-black  bg-blue-300 text-center font-bold"
                        >
                          Warna Cetakan
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black "></td>
                        <td className="border border-black " colSpan={2}>
                          Depan
                        </td>
                        <td className="border border-black  bg-yellow-200">
                          {getNumericValue(data.warna_depan)}
                        </td>
                        <td className="border border-black " colSpan={2}>
                          Belakang
                        </td>
                        <td className="border border-black  bg-yellow-200">
                          {getNumericValue(data.warna_belakang)}
                        </td>
                        <td className="border border-black " colSpan={2}>
                          Total Warna
                        </td>
                        <td className="border border-black bg-gray-300">
                          {getNumericValue(data.jumlah_warna)}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <table
                    className="w-full border-collapse"
                    style={{ fontSize: '9px' }}
                  >
                    <tbody>
                      {/* HEADER */}
                      <tr>
                        {/* Pre-Press & Press (3 cols = 50%) */}
                        <td
                          className="border border-black bg-blue-300 font-bold text-center"
                          colSpan={3}
                          style={{ width: '50%' }}
                        >
                          Pre-Press & Press
                        </td>

                        {/* PRINTING INSHEET (2 cols = 25%) */}
                        <td
                          className="border border-black bg-red-300 font-bold text-center"
                          colSpan={2}
                          style={{ width: '25%' }}
                        >
                          PRINTING INSHEET
                        </td>

                        {/* 500 (1 col = 25%) */}
                        <td
                          className="border border-black bg-yellow-200 text-center font-bold text-red-600"
                          style={{ width: '25%' }}
                        >
                          {getNumericValue(data.print_insheet, 500)}
                        </td>
                      </tr>

                      {/* BAHAN / MESIN */}
                      <tr>
                        <td
                          className="border border-black bg-green-300 font-bold"
                          colSpan={3}
                        >
                          Bahan
                        </td>

                        <td
                          className="border border-black bg-green-300 font-bold"
                          colSpan={2}
                        >
                          Mesin
                        </td>
                        <td className="border border-black bg-yellow-200 font-bold text-center">
                          {getValue(data.jenis_mesin_cetak)}
                        </td>
                      </tr>

                      {/* KERTAS / PLATE */}
                      <tr>
                        <td className="border border-black font-bold">
                          Kertas
                        </td>
                        <td
                          className="border border-black bg-yellow-200"
                          colSpan={2}
                        >
                          {getValue(data.nama_kertas)}
                        </td>

                        <td
                          className="border border-black bg-green-300 font-bold"
                          colSpan={2}
                        >
                          Plate
                        </td>
                        <td className="border border-black bg-yellow-200 text-right">
                          {getNumericValue(data.jumlah_warna)}
                        </td>
                      </tr>

                      {/* GRAMATURE */}
                      <tr>
                        <td className="border border-black font-bold">
                          Gramature
                        </td>
                        <td
                          className="border border-black bg-yellow-200"
                          colSpan={2}
                        >
                          {getNumericValue(data.gramature_kertas)}
                        </td>

                        <td
                          className="border border-black bg-green-300"
                          colSpan={2}
                        ></td>
                        <td className="border border-black bg-gray-300 text-right">
                          {formatCurrency(getNumericValue(data.harga_plate))}
                        </td>
                      </tr>

                      {/* UKURAN KERTAS / CETAK */}
                      <tr>
                        <td className="border border-black font-bold">
                          Ukuran Kertas
                        </td>
                        {/* P(mm) */}
                        <td className="border border-black">
                          <div className="grid grid-cols-2 justify-between">
                            <span className="font-bold  ">P(mm)</span>{' '}
                            <span className="bg-yellow-200 text-right">
                              {getNumericValue(data.panjang_kertas)}
                            </span>
                          </div>
                        </td>

                        {/* L(mm) */}
                        <td className="border border-black">
                          <div className="grid grid-cols-2 justify-between items-center">
                            <span className="font-bold">L(mm)</span>{' '}
                            <span className="bg-yellow-200 text-right">
                              {getNumericValue(data.lebar_kertas)}
                            </span>
                          </div>
                        </td>

                        <td className="border border-black bg-green-300 font-bold">
                          Cetak
                        </td>
                        <td
                          className="border border-black bg-gray-300 text-right"
                          colSpan={2}
                        >
                          {formatCurrency(
                            getNumericValue(data.jumlah_harga_cetak),
                          )}
                        </td>
                      </tr>

                      {/* PERCENTAGE / MESIN COATING DEPAN */}
                      <tr>
                        <td className="border border-black font-bold">
                          Percentage
                        </td>
                        <td className="grid grid-cols-2 justify-between items-center">
                          <span className="font-bold ">%</span>
                          <span className="bg-yellow-200 text-right">
                            {getNumericValue(data.persentase_apki_kertas)}
                          </span>
                        </td>
                        <td className="border border-black  font-bold"></td>
                        <td className="border border-black bg-green-300 font-bold">
                          Mesin Coating Depan
                        </td>
                        <td
                          className="border border-black bg-yellow-200 text-center"
                          colSpan={2}
                        >
                          {getValue(data.nama_mesin_coating_depan)}
                        </td>
                      </tr>

                      {/* TOTAL KERTAS / COATING DEPAN */}
                      <tr>
                        <td className="border border-black font-bold">
                          Total Kertas
                        </td>
                        <td
                          className="border border-black bg-gray-300"
                          colSpan={2}
                        >
                          {getNumericValue(data.total_kertas).toFixed(0)}
                        </td>

                        <td className="border border-black bg-green-300 font-bold">
                          Coating Depan
                        </td>
                        <td
                          className="border border-black bg-yellow-200 text-center"
                          colSpan={2}
                        >
                          {getValue(data.nama_coating_depan)}
                        </td>
                      </tr>

                      {/* TOTAL HARGA KERTAS / MESIN COATING BELAKANG */}
                      <tr>
                        <td className="border border-black font-bold">
                          Total Harga Kertas
                        </td>
                        <td
                          className="border border-black bg-gray-300 bg-gray-300"
                          colSpan={2}
                        >
                          {formatCurrency(
                            getNumericValue(data.total_harga_kertas),
                          )}
                        </td>

                        <td className="border border-black bg-green-300 font-bold">
                          Mesin Coating Belakang
                        </td>
                        <td
                          className="border border-black bg-yellow-200 text-center"
                          colSpan={2}
                        >
                          {getValue(data.nama_mesin_coating_belakang)}
                        </td>
                      </tr>

                      {/* MESIN POTONG / COATING BELAKANG */}
                      <tr>
                        <td className="border border-black font-bold">
                          Mesin Potong
                        </td>
                        <td
                          className="border border-black bg-yellow-200 text-center"
                          colSpan={2}
                        >
                          {getValue(data.nama_mesin_potong)}
                        </td>

                        <td className="border border-black bg-green-300 font-bold">
                          Coating Belakang
                        </td>
                        <td
                          className="border border-black bg-yellow-200 text-center"
                          colSpan={2}
                        >
                          {getValue(data.nama_coating_belakang)}
                        </td>
                      </tr>

                      {/* TOTAL COATING (BOTTOM ROW) */}
                      <tr>
                        <td className="border border-black" colSpan={3}></td>
                        <td className="border border-black bg-green-300"></td>
                        <td
                          className="border border-black bg-gray-300 text-right"
                          colSpan={2}
                        >
                          {formatCurrency(
                            getNumericValue(data.total_harga_coating),
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Post-Press and Finishing Insheet - Image 4 */}
                  <table
                    className="w-full border-collapse"
                    style={{ fontSize: '9px', flex: '1' }}
                  >
                    <tbody>
                      <tr>
                        <td
                          className="border border-black bg-blue-300 font-bold text-center"
                          style={{ width: '15%' }}
                        >
                          Post-Press
                        </td>
                        <td
                          className="border border-black bg-red-300 font-bold text-center"
                          style={{ width: '15%' }}
                        >
                          Ponds Insheet
                        </td>
                        <td
                          className="border border-black bg-yellow-200 text-center font-bold text-red-600"
                          style={{ width: '20%' }}
                        >
                          {getNumericValue(data.pons_insheet)}
                        </td>
                        <td
                          className="border border-black bg-red-300 font-bold text-center"
                          style={{ width: '20%' }}
                        >
                          Finishing Insheet
                        </td>
                        <td
                          className="border border-black bg-yellow-200 text-center font-bold text-red-600"
                          style={{ width: '30%' }}
                        >
                          {getNumericValue(data.finishing_insheet)}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black bg-green-300 font-bold">
                          Pons:
                        </td>
                        <td
                          className="border border-black bg-yellow-200 text-center"
                          colSpan={2}
                        >
                          {getValue(data.nama_jenis_pons)}{' '}
                          {getValue(data.nama_mesin_pons)}
                        </td>
                        <td className="border border-black bg-green-300 font-bold">
                          Lem
                        </td>
                        <td className="border border-black bg-yellow-200 text-center">
                          {getValue(data.nama_lem, 'LEM SAMPING')}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black">Ongkos pons</td>
                        <td className="border border-black bg-yellow-200">
                          {getValue(data.ongkos_pons, 'YES')}
                        </td>
                        <td className="border border-black bg-gray-300">
                          {formatCurrency(
                            getNumericValue(data.harga_satuan_ongkos_pons),
                          )}
                        </td>
                        <td className="border border-black bg-green-300 font-bold">
                          Mesin Finishing
                        </td>
                        <td className="border border-black bg-yellow-200 text-center">
                          {getValue(data.nama_mesin_finishing, 'JK 650')}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black">Harga Pisau</td>
                        <td className="border border-black"></td>
                        <td className="border border-black bg-gray-300">
                          {formatCurrency(getNumericValue(data.harga_pisau))}
                        </td>
                        <td className="border border-black">Total harga lem</td>
                        <td className="border border-black text-right bg-gray-300">
                          {formatCurrency(
                            getNumericValue(data.jumlah_harga_lem),
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black">Total Pons</td>
                        <td className="border border-black"></td>
                        <td className="border border-black bg-gray-300">
                          {formatCurrency(
                            getNumericValue(data.harga_pisau) +
                              getNumericValue(data.harga_satuan_ongkos_pons),
                          )}
                        </td>
                        <td className="border border-black">Foil</td>
                        <td className="border border-black bg-yellow-200 text-right">
                          {getValue(data.foil, '-')}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black">Lipat</td>
                        <td className="border border-black bg-yellow-200">
                          {getValue(data.lipat, 'NO')}
                        </td>
                        <td className="border border-black bg-yellow-200">
                          {getNumericValue(data.qty_lipat)}
                        </td>
                        <td className="border border-black">
                          Harga Foil Manual
                        </td>
                        <td className="border border-black bg-gray-300 text-right">
                          {formatCurrency(
                            getNumericValue(data.harga_foil_manual),
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black">Mesin Lipat</td>
                        <td className="border border-black bg-yellow-200">
                          {getValue(data.nama_mesin_lipat, '-')}
                        </td>
                        <td className="border border-black bg-gray-300">
                          {formatCurrency(getNumericValue(data.harga_lipat))}
                        </td>
                        <td className="border border-black">Spot Foil</td>
                        <td className="border border-black bg-yellow-200 text-right">
                          {getValue(data.spot_foil, '-')}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black">Potong jadi</td>
                        <td className="border border-black bg-yellow-200">
                          {getValue(data.potong_jadi, 'NO')}
                        </td>
                        <td className="border border-black bg-yellow-200">
                          {getNumericValue(data.qty_potong)}
                        </td>
                        <td className="border border-black">
                          Harga Spot Foil Manual
                        </td>
                        <td className="border border-black bg-gray-300 text-right">
                          {formatCurrency(
                            getNumericValue(data.harga_spot_foil_manual),
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black">Uk. Packaging</td>
                        <td className="border border-black">P(mm)</td>
                        <td className="border border-black bg-yellow-200 text-right">
                          {getNumericValue(data.panjang_packaging)}
                        </td>
                        <td className="border border-black">
                          Harga Polimer Manual
                        </td>
                        <td className="border border-black bg-gray-300 text-right">
                          {formatCurrency(
                            getNumericValue(data.harga_polimer_manual),
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black"></td>
                        <td className="border border-black">L(mm)</td>
                        <td className="border border-black bg-yellow-200 text-right">
                          {getNumericValue(data.lebar_packaging)}
                        </td>
                        <td className="border border-black">
                          Harga Pengiriman
                        </td>
                        <td
                          className="border border-black bg-yellow-200 text-right"
                          style={{ fontSize: '8px' }}
                        >
                          {getNumericValue(data.jumlah_kirim)} x{' '}
                          {formatCurrency(
                            getNumericValue(data.harga_area_pengiriman),
                          )}{' '}
                          ={' '}
                          {formatCurrency(
                            getNumericValue(data.harga_pengiriman),
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black">No. Packaging</td>
                        <td
                          className="border border-black bg-gray-300"
                          colSpan={2}
                        >
                          {getNumericValue(data.no_packaging)}
                        </td>
                        <td className="border border-black">Packaging</td>
                        <td className="border border-black bg-gray-300 text-right">
                          {formatCurrency(
                            getNumericValue(data.harga_packaging),
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black"></td>
                        <td className="border border-black" colSpan={2}></td>
                        <td className="border border-black bg-yellow-200">
                          {getValue(
                            data.jenis_packing,
                            'CGS-004 UK 435X315X340 SW-KK',
                          )}
                        </td>
                        <td className="border border-black bg-gray-300 text-right">
                          {formatCurrency(getNumericValue(data.harga_packing))}
                        </td>
                      </tr>
                      <tr>
                        <td
                          className="border border-black bg-yellow-200 font-bold"
                          colSpan={5}
                        >
                          Lain-Lain
                        </td>
                      </tr>
                      {data.lain_lain && data.lain_lain.length > 0
                        ? data.lain_lain.map((item, idx) => (
                            <tr key={idx}>
                              <td className="border border-black" colSpan={3}>
                                {item.nama_item}
                              </td>
                              <td className="border border-black" colSpan={2}>
                                {formatCurrency(item.harga)}
                              </td>
                            </tr>
                          ))
                        : null}
                    </tbody>
                  </table>
                  {/* Harga Section - Image 5 */}
                  <table
                    className="w-full border-collapse"
                    style={{ fontSize: '9px' }}
                  >
                    <tbody>
                      <tr>
                        <td
                          colSpan={5}
                          className="border border-black bg-blue-300 text-center font-bold"
                        >
                          Harga
                        </td>
                      </tr>
                      <tr>
                        <td
                          className="border border-black bg-green-300"
                          style={{ width: '20%' }}
                        >
                          Biaya Produksi
                        </td>
                        <td
                          className="border border-black bg-gray-300 text-right"
                          style={{ width: '30%' }}
                        >
                          {formatCurrency(getNumericValue(data.harga_produksi))}
                        </td>
                        <td
                          className="border border-black bg-green-300"
                          style={{ width: '20%' }}
                        >
                          Biaya Produksi per pc
                        </td>
                        <td
                          className="border border-black bg-gray-300 text-right"
                          colSpan={2}
                          style={{ width: '30%' }}
                        >
                          {formatCurrencyInteger(
                            getNumericValue(data.harga_satuan),
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black bg-green-300">
                          Profit Margin (%)
                        </td>
                        <td className="border border-black bg-yellow-200">
                          {getNumericValue(data.profit)}
                        </td>
                        <td className="border border-black bg-gray-300 text-right">
                          {formatCurrency(getNumericValue(data.profit_harga))}
                        </td>
                        <td className="border border-black bg-green-300">
                          Profit Margin per pc
                        </td>
                        <td className="border border-black bg-gray-300 text-right">
                          {formatCurrencyInteger(
                            Number(data.profit_harga || 0) /
                              Number(data.qty_kalkulasi || 1),
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black bg-green-300">
                          Total Harga Jual
                        </td>
                        <td
                          className="border border-black bg-gray-300 text-right"
                          colSpan={2}
                        >
                          {formatCurrency(
                            getNumericValue(data.jumlah_harga_jual),
                          )}
                        </td>
                        <td className="border border-black bg-green-300">
                          Harga Jual per pc
                        </td>
                        <td className="border border-black bg-gray-300 text-right">
                          {formatCurrencyInteger(
                            Number(data.jumlah_harga_jual || 0) /
                              Number(data.qty_kalkulasi || 1),
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black bg-green-300">
                          PPN
                        </td>
                        <td className="border border-black bg-yellow-200">
                          {getNumericValue(data.ppn)}%
                        </td>
                        <td className="border border-black bg-gray-300 text-right">
                          {formatCurrency(getNumericValue(data.harga_ppn))}
                        </td>
                        <td className="border border-black bg-green-300">
                          PPN per pc
                        </td>
                        <td className="border border-black bg-gray-300 text-right">
                          {formatCurrencyInteger(
                            Number(data.harga_ppn || 0) /
                              Number(data.qty_kalkulasi || 1),
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black bg-green-300">
                          Discount (%)
                        </td>
                        <td className="border border-black bg-yellow-200">
                          {getNumericValue(data.diskon)}%
                        </td>
                        <td className="border border-black bg-gray-300 text-right">
                          {formatCurrency(getNumericValue(data.harga_diskon))}
                        </td>
                        <td className="border border-black bg-green-300">
                          Discount per pc
                        </td>
                        <td className="border border-black bg-red-400 text-right">
                          {formatCurrencyInteger(
                            Number(data.harga_diskon || 0) /
                              Number(data.qty_kalkulasi || 1),
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black bg-green-300 font-bold">
                          TOTAL
                        </td>
                        <td className="border border-black"></td>
                        <td className="border border-black bg-red-400 font-bold text-right">
                          {formatCurrency(getNumericValue(data.total_harga))}
                        </td>
                        <td className="border border-black bg-green-300 font-bold">
                          TOTAL per pc
                        </td>
                        <td className="border border-black bg-red-400  font-bold text-right">
                          {formatCurrencyInteger(
                            getNumericValue(data.total_harga_satuan_customer),
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td
                          className="border border-black bg-red-400  text-center font-bold"
                          colSpan={3}
                        >
                          Rp{' '}
                          {Math.floor(
                            Number(data.total_harga || 0),
                          ).toLocaleString()}
                        </td>
                        <td
                          className="border border-black bg-yellow-200 text-center font-bold"
                          colSpan={2}
                        >
                          Rp.{' '}
                          {Math.floor(
                            Number(data.total_harga_satuan_customer || 0),
                          ).toLocaleString()}
                        </td>
                      </tr>
                      <tr>
                        <td
                          className="border border-black bg-yellow-100 font-bold"
                          style={{ width: '20%' }}
                        >
                          Keterangan KERJA
                        </td>
                        <td
                          className="border border-black bg-yellow-200"
                          colSpan={4}
                        >
                          {getValue(data.keterangan_kerja)}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black bg-yellow-100 font-bold">
                          Keterangan HARGA
                        </td>
                        <td
                          className="border border-black bg-yellow-200"
                          colSpan={4}
                        >
                          {getValue(data.keterangan_harga)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                {/* Footer Section - Image 6 - Always at bottom */}
                <table
                  className="w-full border-collapse"
                  style={{ fontSize: '9px', marginTop: 'auto' }}
                >
                  <tbody>
                    <tr>
                      <td
                        className="border border-black "
                        style={{
                          width: '40%',
                          height: '100px',
                          verticalAlign: 'top',
                        }}
                      >
                        <div className="font-bold">
                          Layout Potongan Kertas dan Montage
                        </div>
                      </td>
                      <td
                        className="border border-black  text-center "
                        style={{
                          width: '30%',
                          height: '100px',
                          verticalAlign: 'top',
                        }}
                      >
                        <div className="font-bold">Estimator</div>
                        <div>-</div>
                        <div style={{ height: '50px' }}></div>
                        <div className="border-t border-black mt-2 pt-1 justify-end"></div>
                      </td>
                      <td
                        className="border border-black  text-center"
                        style={{ width: '30%', verticalAlign: 'top' }}
                      >
                        <div className="font-bold flex flex-col">
                          Bandung,......
                          <span>Mengetahui/Menyetujui</span>
                        </div>

                        <div style={{ height: '50px' }}></div>
                        <div className="border-t border-black mt-2 pt-1"></div>
                      </td>
                    </tr>
                    <tr>
                      <td
                        colSpan={3}
                        className="border border-black "
                        style={{ fontSize: '8px' }}
                      >
                        <span className="font-bold">Submitted:</span>{' '}
                        {data.createdAt
                          ? new Date(data.createdAt).toLocaleString('id-ID')
                          : '-'}{' '}
                        |<span className="font-bold"> Created:</span>{' '}
                        {data.createdAt
                          ? new Date(data.createdAt).toLocaleString('id-ID')
                          : '-'}{' '}
                        |<span className="font-bold"> Updated:</span>{' '}
                        {data.updatedAt
                          ? new Date(data.updatedAt).toLocaleString('id-ID')
                          : '-'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default KalkulasiPrintModal;
