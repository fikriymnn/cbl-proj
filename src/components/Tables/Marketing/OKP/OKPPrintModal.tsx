import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { OKPFormData } from './types';

interface OKPPrintModalProps {
  okpId: number;
  onClose: () => void;
}

const OKPPrintModal: React.FC<OKPPrintModalProps> = ({ okpId, onClose }) => {
  const [data, setData] = useState<OKPFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, [okpId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const url = `${import.meta.env.VITE_API_LINK}/marketing/okp/${okpId}`;
      const res = await axios.get(url, { withCredentials: true });
      if (res.data && res.data.data) {
        setData(res.data.data);
      }
      console.log('Fetched data for printing:', res.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to fetch data for printing');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!printRef.current) return;

    // Generate filename with OKP number and current date
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // Format: HH-MM-SS
    const filename = `${data?.no_okp || 'OKP'}_${dateStr}_${timeStr}`;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${filename}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 0 !important; /* remove printer margins */
          }

          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 100%;
            height: 100%;
            font-family: Arial, sans-serif;
            font-size: 10px;
            line-height: 1.3;
          }

          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          * {
            box-sizing: border-box;
          }

          /* Remove extra whitespace around content */
          .print-wrapper {
            width: 100%;
            height: auto;
            padding: 0;
            margin: 0;
          }

          table {
            border-collapse: collapse;
            width: 100%;
            border: 1px solid black;
          }

          td, th {
            border: 1px solid black;
            padding: 3px 5px;
            vertical-align: top;
          }

          .checkbox {
            display: inline-block;
            width: 14px;
            height: 14px;
            border: 1px solid black;
            margin-right: 4px;
            vertical-align: middle;
            position: relative;
          }
          .checkbox.checked::after {
            content: "✓";
            display: block;
            text-align: center;
            line-height: 14px;
            font-weight: bold;
            font-size: 12px;
          }

          .image-box {
            width: 100%;
            height: 120px;
            border: 2px solid #666;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f5f5f5;
            overflow: hidden;
          }
          .image-box img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
          }
        </style>
      </head>

      <body>
        <div class="print-wrapper">
          ${printRef.current.innerHTML}
        </div>

        <script>
          // Set the document title for PDF filename
          document.title = '${filename}';
          
          window.onload = () => {
            window.print();
            window.onafterprint = () => window.close();
          };
        </script>
      </body>
    </html>
  `);

    printWindow.document.close();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const days = [
      'Minggu',
      'Senin',
      'Selasa',
      'Rabu',
      'Kamis',
      'Jumat',
      'Sabtu',
    ];
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

    return `${days[date.getDay()]}, ${date.getDate()} ${
      months[date.getMonth()]
    } ${date.getFullYear()}`;
  };

  const getValue = (value: any, defaultValue: string = '-') => {
    if (value === null || value === undefined || value === '') {
      return defaultValue;
    }
    return value;
  };

  const isChecked = (array: string[] | string | undefined, value: string) => {
    // Handle if array is a JSON string
    if (typeof array === 'string') {
      try {
        const parsed = JSON.parse(array);
        return Array.isArray(parsed) && parsed.includes(value);
      } catch {
        return false;
      }
    }
    // Handle if array is already an array
    return Array.isArray(array) && array.includes(value);
  };

  // Get pekerjaan list - ONLY 4 items from jenis_pekerjaan
  const getPekerjaanList = () => {
    const pekerjaanArray: string[] = [];

    // Only check jenis_pekerjaan for the 4 main types
    if (isChecked(data?.jenis_pekerjaan, 'Print Artwork'))
      pekerjaanArray.push('PA');
    if (isChecked(data?.jenis_pekerjaan, 'Dummy Polos'))
      pekerjaanArray.push('DP');
    if (isChecked(data?.jenis_pekerjaan, 'Dummy Artwork'))
      pekerjaanArray.push('DA');
    if (isChecked(data?.jenis_pekerjaan, 'Proof Digital'))
      pekerjaanArray.push('PD');

    return pekerjaanArray.join(', ');
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
          <h2 className="text-xl font-semibold">Preview OKP - {data.no_okp}</h2>
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
          <div className="max-w-[210mm] mx-auto bg-white shadow-2xl">
            {/* Print Content - REMOVED p-8 padding */}
            <div ref={printRef}>
              <table style={{ fontSize: '10px' }}>
                <tbody>
                  {/* Header Row */}
                  <tr>
                    <th
                      colSpan={2}
                      className="text-center bold"
                      style={{ padding: '8px', fontSize: '12px' }}
                    >
                      Order Kerja Persiapan
                    </th>
                    <th
                      className="text-center bold"
                      style={{ padding: '8px', fontSize: '12px', width: '30%' }}
                    >
                      No. OKP
                    </th>
                  </tr>
                  {/* Row 0: Label - FIXED alignment */}
                  <tr>
                    <td style={{ width: '3%' }} className="text-center bold">
                      0
                    </td>
                    <td style={{ width: '67%' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span className="bold" style={{ minWidth: '180px' }}>
                          Label
                        </span>
                        <span>: {data.label || '-'}</span>
                      </div>
                    </td>
                    <td
                      rowSpan={7}
                      style={{ width: '30%', verticalAlign: 'top' }}
                    >
                      <div style={{ textAlign: 'center', padding: '5px' }}>
                        <div
                          className="bold"
                          style={{ fontSize: '16px', marginBottom: '10px' }}
                        >
                          {getValue(data.no_okp)}
                        </div>
                        <div style={{ marginTop: '10px', fontSize: '9px' }}>
                          {/* New Coating field */}
                          <div style={{ marginBottom: '5px' }}>
                            <span className="bold">Coating:</span>
                            <div>
                              {data.kalkulasi?.nama_coating_depan &&
                              data.kalkulasi?.nama_coating_depan !== '-'
                                ? '1'
                                : '0'}{' '}
                              /{' '}
                              {data.kalkulasi?.nama_coating_belakang &&
                              data.kalkulasi?.nama_coating_belakang !== '-'
                                ? '1'
                                : '0'}
                            </div>
                          </div>
                          <div style={{ marginBottom: '5px' }}>
                            <span className="bold">Coating Depan:</span>
                            <div>
                              {getValue(data.kalkulasi?.nama_coating_depan)}
                            </div>
                          </div>
                          <div style={{ marginBottom: '5px' }}>
                            <span className="bold">Coating Belakang:</span>
                            <div>
                              {getValue(data.kalkulasi?.nama_coating_belakang)}
                            </div>
                          </div>
                          <div style={{ marginBottom: '5px' }}>
                            <span className="bold">Foil:</span>
                            <div>{getValue(data.kalkulasi?.foil, '-')}</div>
                          </div>
                        </div>
                        <div style={{ marginTop: '10px' }}>
                          <div className="image-box">
                            {data.file_spek_customer ? (
                              <img
                                src={`${import.meta.env.VITE_API_LINK}/images/${
                                  data.file_spek_customer
                                }`}
                                alt="Product"
                              />
                            ) : (
                              <div className="placeholder">✕</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* Row 1: Nama Pelanggan */}
                  <tr>
                    <td className="text-center bold">1</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span className="bold" style={{ minWidth: '180px' }}>
                          Nama Pelanggan
                        </span>
                        <span>: {getValue(data.kalkulasi?.nama_customer)}</span>
                      </div>
                    </td>
                  </tr>

                  {/* Row 2: Nama Produk */}
                  <tr>
                    <td className="text-center bold">2</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span className="bold" style={{ minWidth: '180px' }}>
                          Nama Produk (No Kode)
                        </span>
                        <span>: {getValue(data.kalkulasi?.nama_produk)}</span>
                      </div>
                    </td>
                  </tr>

                  {/* Row 3: Ukuran */}
                  <tr>
                    <td className="text-center bold">3</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span className="bold" style={{ minWidth: '180px' }}>
                          Ukuran (pxlxt)
                        </span>
                        <span>
                          : {getValue(data.kalkulasi?.ukuran_jadi_panjang)} x{' '}
                          {getValue(data.kalkulasi?.ukuran_jadi_lebar)} x{' '}
                          {getValue(data.kalkulasi?.ukuran_jadi_tinggi, '0')} mm
                        </span>
                      </div>
                    </td>
                  </tr>

                  {/* Row 4: Warna */}
                  <tr>
                    <td className="text-center bold">4</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span className="bold" style={{ minWidth: '180px' }}>
                          Warna
                        </span>
                        <span>
                          : {getValue(data.kalkulasi?.warna_depan, '0')} +{' '}
                          {getValue(data.kalkulasi?.warna_belakang, '0')}
                        </span>
                      </div>
                    </td>
                  </tr>

                  {/* Row 5: Bahan */}
                  <tr>
                    <td className="text-center bold">5</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span className="bold" style={{ minWidth: '180px' }}>
                          Bahan
                        </span>
                        <span>
                          : {getValue(data.kalkulasi?.jenis_kertas)}{' '}
                          {getValue(data.kalkulasi?.brand_kertas)}{' '}
                          {getValue(data.kalkulasi?.gramature_kertas)} gsm
                        </span>
                      </div>
                    </td>
                  </tr>

                  {/* Row 6: Qty */}
                  <tr>
                    <td className="text-center bold">6</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span className="bold" style={{ minWidth: '180px' }}>
                          Qty
                        </span>
                        <span>
                          :{' '}
                          {data.kalkulasi?.qty_kalkulasi
                            ? Number(
                                data.kalkulasi.qty_kalkulasi,
                              ).toLocaleString('id-ID')
                            : '-'}{' '}
                          pcs
                        </span>
                      </div>
                    </td>
                  </tr>
                  {/* Permintaan Section Header */}
                  <tr>
                    <td
                      colSpan={3}
                      className="bold text-center"
                      style={{
                        backgroundColor: '#e0e0e0',
                        padding: '5px',
                        fontSize: '11px',
                        textAlign: 'center',
                      }}
                    >
                      Permintaan
                    </td>
                  </tr>

                  {/* Row 7: Permintaan */}
                  <tr>
                    <td
                      className="text-center bold"
                      style={{ verticalAlign: 'middle' }}
                    >
                      7
                    </td>
                    <td colSpan={2}>
                      <table
                        style={{
                          width: '100%',
                          border: 'none',
                        }}
                      >
                        <tbody>
                          <tr>
                            <td
                              rowSpan={2}
                              style={{
                                border: '1px solid black',
                                padding: '5px',
                                width: '5%',
                                textAlign: 'center',
                                verticalAlign: 'middle',
                              }}
                            ></td>
                            <td
                              style={{
                                border: '1px solid black',
                                textAlign: 'center',
                                padding: '5px',
                                width: '15%',
                              }}
                            >
                              <span
                                className="checkbox"
                                style={{
                                  display: 'inline-block',
                                  width: '16px',
                                  height: '16px',
                                  border: '2px solid black',
                                  margin: '0',
                                }}
                              ></span>
                              <span className="bold">DESAIN/SETTING</span>
                            </td>
                            <td
                              style={{
                                border: '1px solid black',
                                textAlign: 'center',
                                padding: '5px',
                                width: '15%',
                              }}
                            >
                              <span className="bold">DUMMY POLOS</span>
                            </td>
                            <td
                              style={{
                                border: '1px solid black',
                                textAlign: 'center',
                                padding: '5px',
                                width: '10%',
                              }}
                            >
                              :.........lbr
                            </td>
                            <td
                              style={{
                                border: '1px solid black',
                                textAlign: 'center',
                                padding: '5px',
                                width: '15%',
                              }}
                            >
                              <span className="bold">DUMMY ARTWORK</span>
                            </td>
                            <td
                              style={{
                                border: '1px solid black',
                                textAlign: 'center',
                                padding: '5px',
                                width: '10%',
                              }}
                            >
                              :.........lbr
                            </td>
                            <td
                              rowSpan={2}
                              style={{
                                border: '1px solid black',
                                padding: '5px',
                                textAlign: 'center',
                                verticalAlign: 'start',
                                width: '20%',
                              }}
                              className="bold"
                            >
                              Tanda Tangan
                              <br />
                              Sales
                            </td>
                          </tr>
                          <tr>
                            <td
                              style={{
                                border: '1px solid black',
                                textAlign: 'center',
                                padding: '5px',
                              }}
                            >
                              <span className="bold">
                                PRINT
                                <br />
                                ARTWORK
                              </span>
                            </td>
                            <td
                              style={{
                                border: '1px solid black',
                                textAlign: 'center',
                                padding: '5px',
                              }}
                            >
                              :.........lbr
                            </td>
                            <td
                              style={{
                                border: '1px solid black',
                                textAlign: 'center',
                                padding: '5px',
                              }}
                            >
                              <span className="bold">PROOF DIGITAL</span>
                            </td>
                            <td
                              style={{
                                border: '1px solid black',
                                textAlign: 'center',
                                padding: '5px',
                              }}
                            >
                              :.........lbr
                            </td>
                            <td
                              rowSpan={1}
                              style={{
                                border: '1px solid black',
                                padding: '5px',
                                textAlign: 'center',
                                verticalAlign: 'middle',
                              }}
                            >
                              <span
                                className="checkbox"
                                style={{
                                  display: 'inline-block',
                                  width: '16px',
                                  height: '16px',
                                  border: '2px solid black',
                                  marginRight: '5px',
                                  verticalAlign: 'middle',
                                }}
                              ></span>
                              <span className="bold">PROOF CETAK</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>

                  {/* Row 9: Jenis Pekerjaan Checkboxes - ALL from tahapan */}
                  <tr>
                    <td className="text-center bold">8</td>
                    <td colSpan={2}>
                      <table
                        style={{
                          width: '100%',
                          border: 'none',
                          fontSize: '9px',
                        }}
                      >
                        <tbody>
                          <tr>
                            <td
                              style={{
                                border: '1px solid black',
                                padding: '3px',
                                width: '11.11%',
                              }}
                            >
                              <span
                                className={`checkbox ${
                                  isChecked(data.tahapan, 'Cetak')
                                    ? 'checked'
                                    : ''
                                }`}
                              ></span>{' '}
                              Cetak
                            </td>
                            <td
                              style={{
                                border: '1px solid black',
                                padding: '3px',
                                width: '11.11%',
                              }}
                            >
                              <span
                                className={`checkbox ${
                                  isChecked(data.tahapan, 'Water Base')
                                    ? 'checked'
                                    : ''
                                }`}
                              ></span>{' '}
                              Water Base
                            </td>
                            <td
                              style={{
                                border: '1px solid black',
                                padding: '3px',
                                width: '11.11%',
                              }}
                            >
                              <span
                                className={`checkbox ${
                                  isChecked(data.tahapan, 'Spot OPV')
                                    ? 'checked'
                                    : ''
                                }`}
                              ></span>{' '}
                              Spot OPV
                            </td>
                            <td
                              style={{
                                border: '1px solid black',
                                padding: '3px',
                                width: '11.11%',
                              }}
                            >
                              <span
                                className={`checkbox ${
                                  isChecked(data.tahapan, 'OPV')
                                    ? 'checked'
                                    : ''
                                }`}
                              ></span>{' '}
                              OPV
                            </td>
                            <td
                              style={{
                                border: '1px solid black',
                                padding: '3px',
                                width: '11.11%',
                              }}
                            >
                              <span
                                className={`checkbox ${
                                  isChecked(data.tahapan, 'Varnish Doff')
                                    ? 'checked'
                                    : ''
                                }`}
                              ></span>{' '}
                              Varnish Doff
                            </td>
                            <td
                              style={{
                                border: '1px solid black',
                                padding: '3px',
                                width: '11.11%',
                              }}
                            >
                              <span
                                className={`checkbox ${
                                  isChecked(data.tahapan, 'Spot UV')
                                    ? 'checked'
                                    : ''
                                }`}
                              ></span>{' '}
                              Spot UV
                            </td>
                            <td
                              style={{
                                border: '1px solid black',
                                padding: '3px',
                                width: '11.11%',
                              }}
                            >
                              <span
                                className={`checkbox ${
                                  isChecked(data.tahapan, 'UV') ? 'checked' : ''
                                }`}
                              ></span>{' '}
                              UV
                            </td>
                            <td
                              style={{
                                border: '1px solid black',
                                padding: '3px',
                                width: '11.11%',
                              }}
                            >
                              <span
                                className={`checkbox ${
                                  isChecked(data.tahapan, 'Lami. Kilap')
                                    ? 'checked'
                                    : ''
                                }`}
                              ></span>{' '}
                              Lami. Kilap
                            </td>
                            <td
                              style={{
                                border: '1px solid black',
                                padding: '3px',
                                width: '11.11%',
                              }}
                            >
                              <span
                                className={`checkbox ${
                                  isChecked(data.tahapan, 'Lami. doff')
                                    ? 'checked'
                                    : ''
                                }`}
                              ></span>{' '}
                              Lami. doff
                            </td>
                          </tr>
                          <tr>
                            <td
                              style={{
                                border: '1px solid black',
                                padding: '3px',
                              }}
                            >
                              <span
                                className={`checkbox ${
                                  isChecked(data.tahapan, 'Pons')
                                    ? 'checked'
                                    : ''
                                }`}
                              ></span>{' '}
                              Pons
                            </td>
                            <td
                              style={{
                                border: '1px solid black',
                                padding: '3px',
                              }}
                            >
                              <span
                                className={`checkbox ${
                                  isChecked(data.tahapan, 'Ril')
                                    ? 'checked'
                                    : ''
                                }`}
                              ></span>{' '}
                              Ril
                            </td>
                            <td
                              style={{
                                border: '1px solid black',
                                padding: '3px',
                              }}
                            >
                              <span
                                className={`checkbox ${
                                  isChecked(data.tahapan, '1/2 Putus')
                                    ? 'checked'
                                    : ''
                                }`}
                              ></span>{' '}
                              1/2 Putus
                            </td>
                            <td
                              style={{
                                border: '1px solid black',
                                padding: '3px',
                              }}
                            >
                              <span
                                className={`checkbox ${
                                  isChecked(data.tahapan, 'Potong Jadi')
                                    ? 'checked'
                                    : ''
                                }`}
                              ></span>{' '}
                              Potong Jadi
                            </td>
                            <td
                              style={{
                                border: '1px solid black',
                                padding: '3px',
                              }}
                            >
                              <span
                                className={`checkbox ${
                                  isChecked(data.tahapan, 'Perforasi')
                                    ? 'checked'
                                    : ''
                                }`}
                              ></span>{' '}
                              Perforasi
                            </td>
                            <td
                              style={{
                                border: '1px solid black',
                                padding: '3px',
                              }}
                            >
                              <span
                                className={`checkbox ${
                                  isChecked(data.tahapan, 'Emboss')
                                    ? 'checked'
                                    : ''
                                }`}
                              ></span>{' '}
                              Emboss
                            </td>
                            <td
                              style={{
                                border: '1px solid black',
                                padding: '3px',
                              }}
                            >
                              <span
                                className={`checkbox ${
                                  isChecked(data.tahapan, 'Foil Emas')
                                    ? 'checked'
                                    : ''
                                }`}
                              ></span>{' '}
                              Foil Emas
                            </td>
                            <td
                              style={{
                                border: '1px solid black',
                                padding: '3px',
                              }}
                            >
                              <span
                                className={`checkbox ${
                                  isChecked(data.tahapan, 'Foil Perak')
                                    ? 'checked'
                                    : ''
                                }`}
                              ></span>{' '}
                              Foil Perak
                            </td>
                            <td
                              style={{
                                border: '1px solid black',
                                padding: '3px',
                              }}
                            >
                              <span
                                className={`checkbox ${
                                  isChecked(data.tahapan, 'V-Kaca')
                                    ? 'checked'
                                    : ''
                                }`}
                              ></span>{' '}
                              V-Kaca
                            </td>
                          </tr>
                          <tr>
                            <td
                              style={{
                                border: '1px solid black',
                                padding: '3px',
                              }}
                            >
                              <span
                                className={`checkbox ${
                                  isChecked(data.tahapan, 'Blok Lem')
                                    ? 'checked'
                                    : ''
                                }`}
                              ></span>{' '}
                              Blok Lem
                            </td>
                            <td
                              style={{
                                border: '1px solid black',
                                padding: '3px',
                              }}
                            >
                              <span
                                className={`checkbox ${
                                  isChecked(data.tahapan, 'Lem Atas')
                                    ? 'checked'
                                    : ''
                                }`}
                              ></span>{' '}
                              Lem Atas
                            </td>
                            <td
                              style={{
                                border: '1px solid black',
                                padding: '3px',
                              }}
                            >
                              <span
                                className={`checkbox ${
                                  isChecked(data.tahapan, 'Lem Samping')
                                    ? 'checked'
                                    : ''
                                }`}
                              ></span>{' '}
                              Lem Samping
                            </td>
                            <td
                              style={{
                                border: '1px solid black',
                                padding: '3px',
                              }}
                            >
                              <span
                                className={`checkbox ${
                                  isChecked(data.tahapan, 'Lock Bottom')
                                    ? 'checked'
                                    : ''
                                }`}
                              ></span>{' '}
                              Lock Bottom
                            </td>
                            <td
                              style={{
                                border: '1px solid black',
                                padding: '3px',
                              }}
                            >
                              <span
                                className={`checkbox ${
                                  isChecked(data.tahapan, 'Lipat')
                                    ? 'checked'
                                    : ''
                                }`}
                              ></span>{' '}
                              Lipat
                            </td>
                            <td
                              style={{
                                border: '1px solid black',
                                padding: '3px',
                              }}
                            >
                              <span
                                className={`checkbox ${
                                  isChecked(data.tahapan, 'Numerator')
                                    ? 'checked'
                                    : ''
                                }`}
                              ></span>{' '}
                              Numerator
                            </td>
                            <td
                              style={{
                                border: '1px solid black',
                                padding: '3px',
                              }}
                            >
                              <span
                                className={`checkbox ${
                                  isChecked(data.tahapan, 'Komplit')
                                    ? 'checked'
                                    : ''
                                }`}
                              ></span>{' '}
                              Komplit
                            </td>
                            <td
                              style={{
                                border: '1px solid black',
                                padding: '3px',
                              }}
                            >
                              <span
                                className={`checkbox ${
                                  isChecked(data.tahapan, 'Pasang Cover')
                                    ? 'checked'
                                    : ''
                                }`}
                              ></span>{' '}
                              Pasang Cover
                            </td>
                            <td
                              style={{
                                border: '1px solid black',
                                padding: '3px',
                              }}
                            >
                              <span
                                className={`checkbox ${
                                  isChecked(data.tahapan, 'Mika')
                                    ? 'checked'
                                    : ''
                                }`}
                              ></span>{' '}
                              Mika
                            </td>
                          </tr>
                          <tr>
                            <td
                              style={{
                                border: '1px solid black',
                                padding: '3px',
                              }}
                            >
                              <span
                                className={`checkbox ${
                                  isChecked(data.tahapan, 'Spiral')
                                    ? 'checked'
                                    : ''
                                }`}
                              ></span>{' '}
                              Spiral
                            </td>
                            <td
                              style={{
                                border: '1px solid black',
                                padding: '3px',
                              }}
                            >
                              <span
                                className={`checkbox ${
                                  isChecked(data.tahapan, 'Jepit Kalung')
                                    ? 'checked'
                                    : ''
                                }`}
                              ></span>{' '}
                              Jepit Kalung
                            </td>
                            <td
                              style={{
                                border: '1px solid black',
                                padding: '3px',
                              }}
                            >
                              <span
                                className={`checkbox ${
                                  isChecked(data.tahapan, 'Mata Itik')
                                    ? 'checked'
                                    : ''
                                }`}
                              ></span>{' '}
                              Mata Itik
                            </td>
                            <td
                              style={{
                                border: '1px solid black',
                                padding: '3px',
                              }}
                            >
                              <span
                                className={`checkbox ${
                                  isChecked(data.tahapan, 'Pasang Tali')
                                    ? 'checked'
                                    : ''
                                }`}
                              ></span>{' '}
                              Pasang Tali
                            </td>
                            <td
                              style={{
                                border: '1px solid black',
                                padding: '3px',
                              }}
                            >
                              <span
                                className={`checkbox ${
                                  isChecked(data.tahapan, 'Bor...mm')
                                    ? 'checked'
                                    : ''
                                }`}
                              ></span>{' '}
                              Bor...mm
                            </td>
                            <td
                              style={{
                                border: '1px solid black',
                                padding: '3px',
                              }}
                            >
                              <span
                                className={`checkbox ${
                                  isChecked(data.tahapan, 'Jahit Kawat')
                                    ? 'checked'
                                    : ''
                                }`}
                              ></span>{' '}
                              Jahit Kawat
                            </td>
                            <td
                              style={{
                                border: '1px solid black',
                                padding: '3px',
                              }}
                            >
                              <span
                                className={`checkbox ${
                                  isChecked(data.tahapan, 'Jahit Benang')
                                    ? 'checked'
                                    : ''
                                }`}
                              ></span>{' '}
                              Jahit Benang
                            </td>
                            <td
                              colSpan={2}
                              style={{
                                border: '1px solid black',
                                padding: '3px',
                              }}
                            ></td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>

                  {/* Target & Tanggal Section */}
                  <tr>
                    <td colSpan={3}>
                      <table style={{ width: '100%', border: 'none' }}>
                        <tbody>
                          <tr>
                            <td
                              style={{
                                border: '1px solid black',
                                padding: '5px',
                                width: '15%',
                              }}
                              className="bold text-center"
                            >
                              Tanggal
                              <br />
                              Masuk
                            </td>
                            <td
                              style={{
                                border: '1px solid black',
                                padding: '5px',
                                width: '25%',
                              }}
                              className="bold text-center"
                            >
                              Target Mkt
                            </td>
                            <td
                              style={{
                                border: '1px solid black',
                                padding: '5px',
                                width: '10%',
                              }}
                              className="bold text-center"
                            >
                              Pekerjaan
                            </td>
                            <td
                              style={{
                                border: '1px solid black',
                                padding: '5px',
                                width: '30%',
                              }}
                              className="bold text-center"
                            >
                              Keterangan & Lampiran
                            </td>
                            <td
                              rowSpan={4}
                              style={{
                                border: '1px solid black',
                                padding: '5px',
                                textAlign: 'center',
                                verticalAlign: 'start',
                                width: '20%',
                              }}
                              className="bold"
                            >
                              Tanda Tangan
                              <br />
                              Admin Marketing
                            </td>
                          </tr>
                          <tr>
                            <td
                              style={{
                                border: '1px solid black',
                                padding: '5px',
                                textAlign: 'center',
                              }}
                            >
                              {formatDate(data.tgl_pembuatan_okp)}
                            </td>
                            <td
                              style={{
                                border: '1px solid black',
                                padding: '5px',
                                textAlign: 'center',
                              }}
                            >
                              {formatDate(data.tgl_target_marketing)}
                            </td>
                            <td
                              style={{
                                border: '1px solid black',
                                padding: '5px',
                                textAlign: 'center',
                                fontSize: '8px',
                              }}
                            >
                              {getPekerjaanList()}
                            </td>
                            <td
                              style={{
                                border: '1px solid black',
                                padding: '5px',
                                fontSize: '8px',
                              }}
                            >
                              {getValue(data.keterangan)}
                            </td>
                          </tr>
                          <tr>
                            <td
                              style={{
                                border: '1px solid black',
                                padding: '15px',
                              }}
                            ></td>
                            <td
                              style={{
                                border: '1px solid black',
                                padding: '15px',
                              }}
                            ></td>
                            <td
                              style={{
                                border: '1px solid black',
                                padding: '15px',
                              }}
                            ></td>
                            <td
                              style={{
                                border: '1px solid black',
                                padding: '15px',
                              }}
                            ></td>
                          </tr>
                          <tr>
                            <td
                              style={{
                                border: '1px solid black',
                                padding: '15px',
                              }}
                            ></td>
                            <td
                              style={{
                                border: '1px solid black',
                                padding: '15px',
                              }}
                            ></td>
                            <td
                              style={{
                                border: '1px solid black',
                                padding: '15px',
                              }}
                            ></td>
                            <td
                              style={{
                                border: '1px solid black',
                                padding: '15px',
                              }}
                            ></td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>

                  {/* Instruksi Produk Section - UPDATED with many blank lines */}
                  <tr>
                    <td colSpan={3}>
                      <table style={{ width: '100%', border: 'none' }}>
                        <tbody>
                          <tr>
                            <td
                              style={{
                                border: '1px solid black',
                                padding: '5px',
                                width: '50%',
                                verticalAlign: 'top',
                              }}
                            >
                              <span className="bold">Instruksi Produk:</span>
                            </td>
                            <td
                              style={{
                                border: '1px solid black',
                                padding: '5px',
                                width: '50%',
                                textAlign: 'right',
                              }}
                              className="bold"
                            >
                              Prepress ID PISAU: {getValue(data.id_pisau)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>

                  {/* Blank lines for Instruksi Produk - 8 rows */}
                  <tr>
                    <td
                      colSpan={3}
                      style={{
                        border: '1px solid black',
                        padding: '12px',
                        height: '25px',
                      }}
                    ></td>
                  </tr>
                  <tr>
                    <td
                      colSpan={3}
                      style={{
                        border: '1px solid black',
                        padding: '12px',
                        height: '25px',
                      }}
                    ></td>
                  </tr>
                  <tr>
                    <td
                      colSpan={3}
                      style={{
                        border: '1px solid black',
                        padding: '12px',
                        height: '25px',
                      }}
                    ></td>
                  </tr>
                  <tr>
                    <td
                      colSpan={3}
                      style={{
                        border: '1px solid black',
                        padding: '12px',
                        height: '25px',
                      }}
                    ></td>
                  </tr>
                  <tr>
                    <td
                      colSpan={3}
                      style={{
                        border: '1px solid black',
                        padding: '12px',
                        height: '25px',
                      }}
                    ></td>
                  </tr>
                  <tr>
                    <td
                      colSpan={3}
                      style={{
                        border: '1px solid black',
                        padding: '12px',
                        height: '25px',
                      }}
                    ></td>
                  </tr>
                  <tr>
                    <td
                      colSpan={3}
                      style={{
                        border: '1px solid black',
                        padding: '12px',
                        height: '25px',
                      }}
                    ></td>
                  </tr>
                  <tr>
                    <td
                      colSpan={3}
                      style={{
                        border: '1px solid black',
                        padding: '12px',
                        height: '25px',
                      }}
                    ></td>
                  </tr>

                  {/* Signature Section */}
                  <tr>
                    <td colSpan={3}>
                      <table style={{ width: '100%', border: 'none' }}>
                        <tbody>
                          <tr>
                            <td
                              style={{
                                border: '1px solid black',
                                width: '33%',
                                textAlign: 'center',
                                verticalAlign: 'start',
                                paddingBottom: '100px',
                              }}
                              className="bold"
                            >
                              KABAG MKT
                            </td>
                            <td
                              style={{
                                border: '1px solid black',
                                width: '33%',
                                textAlign: 'center',
                                verticalAlign: 'start',
                                paddingBottom: '100px',
                              }}
                              className="bold"
                            >
                              PREPRESS
                            </td>

                            <td
                              style={{
                                border: '1px solid black',
                                width: '33%',
                                textAlign: 'center',
                                verticalAlign: 'start',
                                paddingBottom: '100px',
                              }}
                              className="bold"
                            >
                              QA
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
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

export default OKPPrintModal;
