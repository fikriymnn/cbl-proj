import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { KalkulasiDetailItem } from '../Kalkulasi/types/kalkulasi';

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

  useEffect(() => {
    fetchData();
  }, [kalkulasiId]);

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
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Print - ${data?.kode_kalkulasi || 'Kalkulasi'}</title>
              <style>
                @page {
                  size: A4 landscape;
                  margin: 8mm;
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
                  .print-container {
                    page-break-inside: avoid;
                  }
                }
                * {
                  box-sizing: border-box;
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
          <div className="max-w-[1400px] mx-auto bg-white shadow-2xl">
            <div
              ref={printRef}
              className="print-container"
              style={{ fontSize: '9px' }}
            >
              {/* Header */}
              <div className="border-2 border-black">
                <div className="bg-pink-400 text-center py-1 border-b-2 border-black">
                  <h1 className="text-sm font-bold">
                    PT. Cahaya Berlian Lestari Offset
                  </h1>
                  <h2 className="text-xs font-semibold">
                    Calculation Form: {data.kode_kalkulasi}
                  </h2>
                </div>

                {/* Label Field */}
                <div className="grid grid-cols-2 border-b-2 border-black text-xs">
                  <div className="p-1 border-r border-black">
                    <span className="font-semibold">Label:</span>{' '}
                    {data.label || '-'}
                  </div>
                  <div className="p-1">
                    <span className="font-semibold">Tipe Kalkulasi:</span>{' '}
                    <span className="uppercase">
                      {data.tipe_kalkulasi || 'NORMAL'}
                    </span>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-4 border-b border-black text-xs">
                  <div className="p-1 border-r border-black">
                    <div className="font-semibold">Pemesan</div>
                    <div>{data.nama_customer}</div>
                  </div>
                  <div className="p-1 border-r border-black">
                    <div className="font-semibold">
                      PT TRIFA RAYA LABORATORIES
                    </div>
                  </div>
                  <div className="p-1 border-r border-black">
                    <div className="font-semibold">Marketing</div>
                    <div>{data.nama_marketing}</div>
                  </div>
                  <div className="p-1">
                    <div className="font-semibold">TS</div>
                  </div>
                </div>

                <div className="grid grid-cols-4 border-b border-black text-xs">
                  <div className="p-1 border-r border-black">
                    <div className="font-semibold">Nama Produk</div>
                    <div>{data.nama_produk}</div>
                  </div>
                  <div className="p-1 border-r border-black">
                    <div className="font-semibold">Tanggal Kalkulasi</div>
                    <div>
                      {new Date(data.tgl_kalkulasi).toLocaleDateString('id-ID')}
                    </div>
                  </div>
                  <div className="p-1 border-r border-black col-span-2"></div>
                </div>

                <div className="grid grid-cols-4 border-b border-black text-xs">
                  <div className="p-1 border-r border-black">
                    <div className="font-semibold">Spesifikasi</div>
                    <div>{data.spesifikasi}</div>
                  </div>
                  <div className="p-1 border-r border-black">
                    <div className="font-semibold">Area</div>
                    <div>{data.nama_area_pengiriman}</div>
                  </div>
                  <div className="p-1 col-span-2"></div>
                </div>

                <div className="grid grid-cols-4 border-b-2 border-black text-xs">
                  <div className="p-1 border-r border-black">
                    <div className="font-semibold">Status</div>
                    <div className="uppercase">{data.status_kalkulasi}</div>
                  </div>
                  <div className="p-1 border-r border-black">
                    <div className="font-semibold">No OKP</div>
                  </div>
                  <div className="p-1 border-r border-black">
                    <div className="font-semibold">Quantity</div>
                    <div>{data.qty_kalkulasi?.toLocaleString()}</div>
                  </div>
                  <div className="p-1">
                    <div className="font-semibold">No SO</div>
                    <div></div>
                    <div className="font-semibold">No IQ</div>
                  </div>
                </div>

                {/* Ukuran Produk */}
                <div className="bg-blue-200 p-1 border-b border-black text-center font-semibold text-xs">
                  Ukuran Produk
                </div>
                <div
                  className="grid grid-cols-12 border-b border-black"
                  style={{ fontSize: '8px' }}
                >
                  <div className="col-span-2 p-0.5 border-r border-black">
                    <div className="font-semibold">Ukuran Jadi</div>
                  </div>
                  <div className="col-span-1 p-0.5 border-r border-black">
                    P(mm)
                  </div>
                  <div className="col-span-1 p-0.5 border-r border-black">
                    {data.ukuran_jadi_panjang}
                  </div>
                  <div className="col-span-1 p-0.5 border-r border-black">
                    L(mm)
                  </div>
                  <div className="col-span-1 p-0.5 border-r border-black">
                    {data.ukuran_jadi_lebar}
                  </div>
                  <div className="col-span-1 p-0.5 border-r border-black">
                    T(mm)
                  </div>
                  <div className="col-span-1 p-0.5 border-r border-black">
                    {data.ukuran_jadi_tinggi}
                  </div>
                  <div className="col-span-2 p-0.5 border-r border-black">
                    Terbentang
                  </div>
                  <div className="col-span-2 p-0.5">
                    {data.ukuran_jadi_terb_panjang} x{' '}
                    {data.ukuran_jadi_terb_lebar}
                  </div>
                </div>

                {/* Ukuran Cetak */}
                <div
                  className="grid grid-cols-12 border-b border-black"
                  style={{ fontSize: '8px' }}
                >
                  <div className="col-span-2 p-0.5 border-r border-black">
                    <div className="font-semibold">Ukuran Cetak</div>
                  </div>
                  <div className="col-span-1 p-0.5 border-r border-black">
                    P(mm)
                  </div>
                  <div className="col-span-1 p-0.5 border-r border-black">
                    {data.ukuran_cetak_panjang_1}
                  </div>
                  <div className="col-span-1 p-0.5 border-r border-black">
                    L(mm)
                  </div>
                  <div className="col-span-1 p-0.5 border-r border-black">
                    {data.ukuran_cetak_lebar_1}
                  </div>
                  <div className="col-span-1 p-0.5 border-r border-black">
                    {data.ukuran_cetak_bagian_1}
                  </div>
                  <div className="col-span-1 p-0.5 border-r border-black">
                    Bagian
                  </div>
                  <div className="col-span-1 p-0.5 border-r border-black">
                    Isi
                  </div>
                  <div className="col-span-1 p-0.5 border-r border-black">
                    {data.ukuran_cetak_isi_1}
                  </div>
                  <div className="col-span-1 p-0.5 border-r border-black">
                    BBS
                  </div>
                  <div className="col-span-1 p-0.5">
                    {data.ukuran_cetak_bbs_1}
                  </div>
                </div>

                <div
                  className="grid grid-cols-12 border-b-2 border-black"
                  style={{ fontSize: '8px' }}
                >
                  <div className="col-span-2 p-0.5 border-r border-black">
                    <div className="font-semibold">Ukuran Cetak</div>
                  </div>
                  <div className="col-span-1 p-0.5 border-r border-black">
                    P(mm)
                  </div>
                  <div className="col-span-1 p-0.5 border-r border-black">
                    {data.ukuran_cetak_panjang_2 || 0}
                  </div>
                  <div className="col-span-1 p-0.5 border-r border-black">
                    L(mm)
                  </div>
                  <div className="col-span-1 p-0.5 border-r border-black">
                    {data.ukuran_cetak_lebar_2 || 0}
                  </div>
                  <div className="col-span-1 p-0.5 border-r border-black">
                    {data.ukuran_cetak_bagian_2 || 0}
                  </div>
                  <div className="col-span-1 p-0.5 border-r border-black">
                    Bagian
                  </div>
                  <div className="col-span-1 p-0.5 border-r border-black">
                    Isi
                  </div>
                  <div className="col-span-1 p-0.5 border-r border-black">
                    {data.ukuran_cetak_isi_2 || 0}
                  </div>
                  <div className="col-span-1 p-0.5 border-r border-black">
                    BBS
                  </div>
                  <div className="col-span-1 p-0.5">
                    {data.ukuran_cetak_bbs_2 || 'No'}
                  </div>
                </div>

                {/* Warna Cetakan */}
                <div className="bg-blue-200 p-1 border-b border-black text-center font-semibold text-xs">
                  Warna Cetakan
                </div>
                <div
                  className="grid grid-cols-6 border-b-2 border-black"
                  style={{ fontSize: '8px' }}
                >
                  <div className="col-span-2 p-0.5 border-r border-black">
                    Depan
                  </div>
                  <div className="col-span-1 p-0.5 border-r border-black">
                    {data.warna_depan}
                  </div>
                  <div className="col-span-1 p-0.5 border-r border-black">
                    Belakang
                  </div>
                  <div className="col-span-1 p-0.5 border-r border-black">
                    {data.warna_belakang}
                  </div>
                  <div className="col-span-1 p-0.5">
                    Total Warna: {data.jumlah_warna}
                  </div>
                </div>

                {/* Pre-Press & Press */}
                <div className="grid grid-cols-2">
                  <div className="border-r-2 border-black">
                    <div className="bg-gray-200 p-1 border-b border-black font-semibold text-xs">
                      Pre-Press & Press
                    </div>

                    {/* Bahan */}
                    <div className="border-b border-black">
                      <div className="bg-yellow-200 p-0.5 font-semibold text-xs">
                        Bahan
                      </div>
                      <div
                        className="grid grid-cols-2"
                        style={{ fontSize: '8px' }}
                      >
                        <div className="p-0.5 border-r border-black">
                          <div>Kertas</div>
                          <div className="font-semibold">
                            {data.nama_kertas}
                          </div>
                        </div>
                        <div className="p-0.5">
                          <div>Mesin: {data.jenis_mesin_cetak}</div>
                        </div>
                      </div>
                      <div
                        className="grid grid-cols-2"
                        style={{ fontSize: '8px' }}
                      >
                        <div className="p-0.5 border-r border-black">
                          Gramature: {data.gramature_kertas}
                        </div>
                        <div className="p-0.5">
                          Plate: {data.harga_plate || 0}
                        </div>
                      </div>
                      <div
                        className="grid grid-cols-4"
                        style={{ fontSize: '8px' }}
                      >
                        <div className="col-span-2 p-0.5 border-r border-black">
                          <div>Ukuran Kertas</div>
                          <div>
                            P(mm) {data.panjang_kertas} x L(mm){' '}
                            {data.lebar_kertas}
                          </div>
                        </div>
                        <div className="p-0.5 border-r border-black">
                          <div>Cetak</div>
                          <div>
                            {formatCurrency(data.jumlah_harga_cetak || 0)}
                          </div>
                        </div>
                        <div className="p-0.5">
                          <div>{formatCurrency(data.harga_plate || 0)}</div>
                        </div>
                      </div>
                      <div
                        className="grid grid-cols-2"
                        style={{ fontSize: '8px' }}
                      >
                        <div className="p-0.5 border-r border-black">
                          Percentage: {data.persentase_kertas}%
                        </div>
                        <div className="p-0.5">
                          <div>Mesin Coating Depan</div>
                          <div className="font-semibold">
                            {data.nama_mesin_coating_depan || '-'}
                          </div>
                        </div>
                      </div>
                      <div
                        className="grid grid-cols-2"
                        style={{ fontSize: '8px' }}
                      >
                        <div className="p-0.5 border-r border-black">
                          Total Kertas: {data.total_kertas?.toFixed(3)}
                        </div>
                        <div className="p-0.5">
                          <div>Coating Depan</div>
                          <div className="font-semibold">
                            {data.nama_coating_depan || '-'}
                          </div>
                        </div>
                      </div>
                      <div
                        className="grid grid-cols-2"
                        style={{ fontSize: '8px' }}
                      >
                        <div className="p-0.5 border-r border-black">
                          Total Harga Kertas:{' '}
                          {formatCurrency(data.total_harga_kertas || 0)}
                        </div>
                        <div className="p-0.5">
                          <div>Mesin Coating Belakang</div>
                          <div className="font-semibold">
                            {data.nama_mesin_coating_belakang || '-'}
                          </div>
                        </div>
                      </div>
                      <div
                        className="grid grid-cols-2"
                        style={{ fontSize: '8px' }}
                      >
                        <div className="p-0.5 border-r border-black">
                          Mesin Potong: {data.nama_mesin_potong || '-'}
                        </div>
                        <div className="p-0.5">
                          <div>Coating Belakang</div>
                          <div className="font-semibold">
                            {data.nama_coating_belakang || '-'}
                          </div>
                        </div>
                      </div>
                      <div
                        className="grid grid-cols-1 border-t border-black bg-yellow-100"
                        style={{ fontSize: '8px' }}
                      >
                        <div className="p-0.5 text-right">
                          Total Coating:{' '}
                          {formatCurrency(data.total_harga_coating || 0)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PRINTING INSHEET */}
                  <div>
                    <div className="bg-red-400 p-1 border-b border-black font-semibold text-center text-xs">
                      PRINTING INSHEET
                    </div>
                    <div className="text-center text-2xl font-bold p-2">
                      {data.print_insheet || 500}
                    </div>
                  </div>
                </div>

                {/* Post-Press */}
                <div className="grid grid-cols-2 border-t-2 border-black">
                  <div className="border-r-2 border-black">
                    <div className="bg-gray-200 p-1 border-b border-black font-semibold text-xs">
                      Post-Press
                    </div>

                    {/* Pons */}
                    <div
                      className="grid grid-cols-3 border-b border-black"
                      style={{ fontSize: '8px' }}
                    >
                      <div className="p-0.5 bg-yellow-200 font-semibold">
                        Pons:
                      </div>
                      <div className="p-0.5 border-l border-black font-semibold">
                        Ponds Insheet
                      </div>
                      <div className="p-0.5 border-l border-black">
                        {data.pons_insheet || 0}
                      </div>
                    </div>
                    <div
                      className="grid grid-cols-3 border-b border-black"
                      style={{ fontSize: '8px' }}
                    >
                      <div className="p-0.5">Ongkos pons</div>
                      <div className="p-0.5 border-l border-black font-semibold">
                        POND + RILL / BAODER
                      </div>
                      <div className="p-0.5 border-l border-black"></div>
                    </div>
                    <div
                      className="grid grid-cols-3 border-b border-black"
                      style={{ fontSize: '8px' }}
                    >
                      <div className="p-0.5">Harga Pisau</div>
                      <div className="p-0.5 border-l border-black"></div>
                      <div className="p-0.5 border-l border-black">
                        {formatCurrency(data.harga_pisau || 0)}
                      </div>
                    </div>
                    <div
                      className="grid grid-cols-3 border-b border-black"
                      style={{ fontSize: '8px' }}
                    >
                      <div className="p-0.5">Total Pons</div>
                      <div className="p-0.5 border-l border-black"></div>
                      <div className="p-0.5 border-l border-black">
                        {formatCurrency(data.total_harga_ongkos_pons || 0)}
                      </div>
                    </div>

                    {/* Lipat */}
                    <div
                      className="grid grid-cols-3 border-b border-black"
                      style={{ fontSize: '8px' }}
                    >
                      <div className="p-0.5">Lipat</div>
                      <div className="p-0.5 border-l border-black">
                        {data.lipat || 'NO'}
                      </div>
                      <div className="p-0.5 border-l border-black">
                        {data.qty_lipat || 0}
                      </div>
                    </div>
                    <div
                      className="grid grid-cols-3 border-b border-black"
                      style={{ fontSize: '8px' }}
                    >
                      <div className="p-0.5">Mesin Lipat</div>
                      <div className="p-0.5 border-l border-black col-span-2">
                        {formatCurrency(data.harga_lipat || 0)}
                      </div>
                    </div>

                    {/* Potong jadi */}
                    <div
                      className="grid grid-cols-3 border-b border-black"
                      style={{ fontSize: '8px' }}
                    >
                      <div className="p-0.5">Potong jadi</div>
                      <div className="p-0.5 border-l border-black">
                        {data.potong_jadi || 'NO'}
                      </div>
                      <div className="p-0.5 border-l border-black">
                        {data.qty_potong || 0}
                      </div>
                    </div>

                    {/* Uk. Packaging */}
                    <div
                      className="grid grid-cols-3 border-b border-black"
                      style={{ fontSize: '8px' }}
                    >
                      <div className="p-0.5">Uk. Packaging</div>
                      <div className="p-0.5 border-l border-black">P(mm)</div>
                      <div className="p-0.5 border-l border-black">
                        {data.panjang_packaging || 0}
                      </div>
                    </div>
                    <div
                      className="grid grid-cols-3 border-b border-black"
                      style={{ fontSize: '8px' }}
                    >
                      <div className="p-0.5"></div>
                      <div className="p-0.5 border-l border-black">L(mm)</div>
                      <div className="p-0.5 border-l border-black">
                        {data.lebar_packaging || 0}
                      </div>
                    </div>

                    {/* No. Packaging */}
                    <div
                      className="grid grid-cols-3 border-b border-black"
                      style={{ fontSize: '8px' }}
                    >
                      <div className="p-0.5">No. Packaging</div>
                      <div className="p-0.5 border-l border-black col-span-2">
                        {data.no_packaging || 0}
                      </div>
                    </div>

                    {/* Lain-Lain */}
                    <div className="p-0.5 bg-yellow-200 font-semibold text-xs">
                      Lain-Lain
                    </div>
                    {data.lain_lain && data.lain_lain.length > 0 && (
                      <div style={{ fontSize: '8px' }}>
                        {data.lain_lain.map((item, idx) => (
                          <div
                            key={idx}
                            className="grid grid-cols-2 border-b border-black"
                          >
                            <div className="p-0.5 border-r border-black">
                              {item.nama_item}
                            </div>
                            <div className="p-0.5">
                              {formatCurrency(item.harga)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Finishing Insheet */}
                  <div>
                    <div className="bg-blue-200 p-1 border-b border-black font-semibold text-xs">
                      Finishing Insheet
                    </div>
                    <div className="text-center text-xl font-bold p-1">
                      {data.finishing_insheet || 0}
                    </div>

                    <div style={{ fontSize: '8px' }}>
                      <div className="grid grid-cols-2 border-b border-black">
                        <div className="p-0.5 border-r border-black">Lem</div>
                        <div className="p-0.5 font-semibold">
                          {data.nama_lem || 'LEM AMPING'}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 border-b border-black">
                        <div className="p-0.5 border-r border-black">
                          Mesin Finishing
                        </div>
                        <div className="p-0.5 font-semibold">
                          {data.nama_mesin_finishing || 'JK 650'}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 border-b border-black">
                        <div className="p-0.5 border-r border-black">
                          Total harga lem
                        </div>
                        <div className="p-0.5">
                          {formatCurrency(data.jumlah_harga_lem || 0)}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 border-b border-black">
                        <div className="p-0.5 border-r border-black">Foil</div>
                        <div className="p-0.5">{data.foil || '-'}</div>
                      </div>
                      <div className="grid grid-cols-2 border-b border-black">
                        <div className="p-0.5 border-r border-black"></div>
                        <div className="p-0.5">
                          {formatCurrency(data.harga_foil_manual || 0)}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 border-b border-black">
                        <div className="p-0.5 border-r border-black">
                          Spot Foil
                        </div>
                        <div className="p-0.5">{data.spot_foil || '-'}</div>
                      </div>
                      <div className="grid grid-cols-2 border-b border-black">
                        <div className="p-0.5 border-r border-black"></div>
                        <div className="p-0.5">
                          {formatCurrency(data.harga_spot_foil_manual || 0)}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 border-b border-black">
                        <div className="p-0.5 border-r border-black">
                          Harga Polimer Manual
                        </div>
                        <div className="p-0.5">
                          {formatCurrency(data.harga_polimer_manual || 0)}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 border-b border-black">
                        <div className="p-0.5 border-r border-black">
                          No. Delivery
                        </div>
                        <div className="p-0.5">{data.jumlah_kirim || 5}</div>
                      </div>
                      <div className="grid grid-cols-2 border-b border-black">
                        <div className="p-0.5 border-r border-black">
                          Packaging
                        </div>
                        <div className="p-0.5">
                          {formatCurrency(data.harga_packaging || 0)}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 border-b border-black">
                        <div className="p-0.5 border-r border-black">
                          {data.jenis_packing || 'CGS-004 UK 435X315X340 SW-KK'}
                        </div>
                        <div className="p-0.5">
                          {formatCurrency(data.harga_packing || 0)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Harga Section */}
                <div className="grid grid-cols-2 border-t-2 border-black">
                  <div className="border-r-2 border-black">
                    <div className="bg-blue-200 p-1 border-b border-black font-semibold text-center text-xs">
                      Harga
                    </div>
                    <div style={{ fontSize: '8px' }}>
                      <div className="grid grid-cols-2 border-b border-black">
                        <div className="p-0.5 bg-green-200 border-r border-black">
                          Biaya Produksi
                        </div>
                        <div className="p-0.5">
                          {formatCurrency(data.harga_produksi || 0)}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 border-b border-black">
                        <div className="p-0.5 border-r border-black">
                          Profit Margin (%)
                        </div>
                        <div className="p-0.5 bg-yellow-200">{data.profit}</div>
                      </div>
                      <div className="grid grid-cols-2 border-b border-black">
                        <div className="p-0.5 border-r border-black">
                          Total Harga Jual
                        </div>
                        <div className="p-0.5">
                          {formatCurrency(data.jumlah_harga_jual || 0)}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 border-b border-black">
                        <div className="p-0.5 border-r border-black">PPN</div>
                        <div className="p-0.5 bg-yellow-200">
                          {data.ppn || 0}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 border-b border-black">
                        <div className="p-0.5 border-r border-black">
                          Discount (%)
                        </div>
                        <div className="p-0.5 bg-yellow-200">
                          {data.diskon || 0}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 border-b-2 border-black bg-orange-300">
                        <div className="p-0.5 border-r border-black font-bold">
                          TOTAL
                        </div>
                        <div className="p-0.5 font-bold">
                          {formatCurrency(data.total_harga || 0)}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 bg-orange-400">
                        <div className="p-0.5 text-center font-bold">
                          Rp{' '}
                          {(Number(data.qty_kalkulasi) * 1000).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '8px' }}>
                      <div className="grid grid-cols-2 border-b border-black">
                        <div className="p-0.5 bg-green-200 border-r border-black">
                          Biaya Produksi per pc
                        </div>
                        <div className="p-0.5">
                          {formatCurrency(
                            Number(data.harga_produksi) /
                              Number(data.qty_kalkulasi),
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 border-b border-black">
                        <div className="p-0.5 border-r border-black">
                          Profit Margin (%)
                        </div>
                        <div className="p-0.5 bg-yellow-200">{data.profit}</div>
                      </div>
                      <div className="grid grid-cols-2 border-b border-black">
                        <div className="p-0.5 border-r border-black">
                          Harga Jual per pc
                        </div>
                        <div className="p-0.5">
                          {formatCurrency(
                            Number(data.jumlah_harga_jual) /
                              Number(data.qty_kalkulasi),
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 border-b border-black">
                        <div className="p-0.5 border-r border-black">PPN</div>
                        <div className="p-0.5 bg-yellow-200">
                          {data.ppn || 0}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 border-b border-black">
                        <div className="p-0.5 border-r border-black">
                          Discount (%)
                        </div>
                        <div className="p-0.5 bg-red-500">
                          {data.harga_diskon || 0}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 border-b-2 border-black bg-orange-300">
                        <div className="p-0.5 border-r border-black font-bold">
                          TOTAL
                        </div>
                        <div className="p-0.5 font-bold">
                          {formatCurrency(
                            Number(data.total_harga) /
                              Number(data.qty_kalkulasi),
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 bg-orange-400">
                        <div className="p-0.5 text-center font-bold">
                          Rp.{' '}
                          {Number(
                            data.total_harga_satuan_customer,
                          ).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Keterangan Section */}
                <div className="grid grid-cols-2 border-t-2 border-black">
                  <div className="border-r-2 border-black p-1">
                    <div className="font-semibold mb-1 text-xs">
                      Keterangan KERJA
                    </div>
                    <div
                      style={{ fontSize: '8px' }}
                      className="whitespace-pre-wrap"
                    >
                      {data.keterangan_kerja || '-'}
                    </div>
                  </div>
                  <div className="p-1">
                    <div className="font-semibold mb-1 text-xs">
                      Keterangan HARGA
                    </div>
                    <div
                      style={{ fontSize: '8px' }}
                      className="whitespace-pre-wrap"
                    >
                      {data.keterangan_harga || '-'}
                    </div>
                  </div>
                </div>

                {/* Footer Section */}
                <div className="border-t-2 border-black p-2">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <div className="font-semibold mb-1 text-xs">
                        Layout Potongan Kertas dan Montage
                      </div>
                      <div className="border-2 border-black h-24"></div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold mb-1 text-xs">
                        Estimator
                      </div>
                      <div className="h-12"></div>
                      <div className="border-t border-black pt-1 text-xs">
                        {data.nama_marketing}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold mb-1 text-xs">
                        Bandung,......
                      </div>
                      <div className="mb-1 text-xs">Mengetahui/Menyetujui</div>
                      <div className="h-12"></div>
                      <div className="border-t border-black pt-1 text-xs"></div>
                    </div>
                  </div>
                </div>

                {/* Submission Info */}
                <div
                  className="border-t-2 border-black p-1"
                  style={{ fontSize: '7px' }}
                >
                  <div className="grid grid-cols-3 gap-1">
                    <div>
                      <span className="font-semibold">Submitted:</span>{' '}
                      {data.createdAt
                        ? new Date(data.createdAt).toLocaleString('id-ID')
                        : '-'}
                    </div>
                    <div>
                      <span className="font-semibold">Created:</span>{' '}
                      {data.createdAt
                        ? new Date(data.createdAt).toLocaleString('id-ID')
                        : '-'}
                    </div>
                    <div>
                      <span className="font-semibold">Updated:</span>{' '}
                      {data.updatedAt
                        ? new Date(data.updatedAt).toLocaleString('id-ID')
                        : '-'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KalkulasiPrintModal;
