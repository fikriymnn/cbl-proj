import React from 'react';

interface KalkulasiDetailModalProps {
  data: any;
  onClose: () => void;
}

const KalkulasiDetailModal: React.FC<KalkulasiDetailModalProps> = ({
  data,
  onClose,
}) => {
  const formatCurrency = (value: number | string): string => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(numValue);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-7xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {data.kode_kalkulasi || `-`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="p-6 text-sm">
          {/* Top Section - 2 Column Layout */}
          <div className="grid grid-cols-2 gap-8 mb-6">
            {/* Left Column - Top Section */}
            <div className="space-y-4">
              <div className="border-b border-zinc-200 ">
                <div className="flex justify-between">
                  <span className="font-medium">Customer</span>
                  <div className="text-gray-600">{data.nama_customer}</div>
                </div>
              </div>
              <div className="border-b border-zinc-200 ">
                <div className="flex justify-between">
                  <span className="font-medium">Marketing</span>
                  <div className="text-gray-600">{data.nama_marketing}</div>
                </div>
              </div>

              <div className="border-b border-zinc-200 ">
                <div className="flex justify-between">
                  <span className="font-medium">Produk</span>
                  <div className="text-gray-600">{data.nama_produk}</div>
                </div>
              </div>

              <div className="border-b border-zinc-200 ">
                <div className="flex justify-between">
                  <span className="font-medium">Quantity</span>
                  <div className="text-gray-600">
                    {data.qty_kalkulasi?.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="border-b border-zinc-200 ">
                <div className="flex justify-between">
                  <span className="font-medium">Presentase Insheet</span>
                  <div className="text-gray-600">{data.presentase_insheet}</div>
                </div>
              </div>

              <div className="border-b border-zinc-200 ">
                <div className="flex justify-between">
                  <span className="font-medium">Spesifikasi</span>
                  <div className="text-gray-600">{data.spesifikasi}</div>
                </div>
              </div>
            </div>

            {/* Right Column - Top Section */}
            <div className="space-y-4">
              <div className="border-b border-zinc-200 ">
                <div className="flex justify-between">
                  <span className="font-medium">Nomor Kakluasi</span>
                  <div className="text-gray-600">
                    {data.kode_kalkulasi || `-`}
                  </div>
                </div>
              </div>
              <div className="border-b border-zinc-200 ">
                <div className="flex justify-between">
                  <span className="font-medium">Tanggal</span>
                  <div className="text-gray-600">
                    {formatDate(data.tgl_kalkulasi)}
                  </div>
                </div>
              </div>
              <div className="border-b border-zinc-200 ">
                <div className="flex justify-between">
                  <span className="font-medium">Status</span>
                  <div className="text-gray-600">{data.status_kalkulasi}</div>
                </div>
              </div>
              <div className="border-b border-zinc-200 ">
                <div className="flex justify-between">
                  <span className="font-medium">Nomor OKP</span>
                  <div className="text-gray-600">-</div>
                </div>
              </div>
              <div className="border-b border-zinc-200 ">
                <div className="flex justify-between">
                  <span className="font-medium">Nomor IO</span>
                  <div className="text-gray-600">-</div>
                </div>
              </div>
              <div className="border-b border-zinc-200 ">
                <div className="flex justify-between">
                  <span className="font-medium">Area Pengiriman</span>
                  <div className="text-gray-600">
                    {data.nama_area_pengiriman}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-8  border-t pt-6">
            {/* Ukuran Jadi Produk */}
            <div>
              <h3 className="font-medium mb-3 underline">
                Ukuran Jadi Produk:
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between border-b border-zinc-200">
                  <span className="text-gray-600">Panjang</span>
                  <span>{data.ukuran_jadi_panjang} mm</span>
                </div>
                <div className="flex justify-between border-b border-zinc-200">
                  <span className="text-gray-600">Lebar</span>
                  <span>{data.ukuran_jadi_lebar} mm</span>
                </div>
                <div className="flex justify-between border-b border-zinc-200">
                  <span className="text-gray-600">Tinggi</span>
                  <span>{data.ukuran_jadi_tinggi} mm</span>
                </div>
                <div className="flex justify-between border-b border-zinc-200">
                  <span className="text-gray-600">Terbentang Panjang</span>
                  <span>{data.ukuran_jadi_terb_panjang} mm</span>
                </div>
                <div className="flex justify-between border-b border-zinc-200">
                  <span className="text-gray-600">Terbentang Lebar</span>
                  <span>{data.ukuran_jadi_terb_lebar} mm</span>
                </div>
              </div>
            </div>
            {/* Ukuran Cetak Produk I */}
            <div>
              <h3 className="font-medium mb-3 underline">
                Ukuran Cetak Produk I:
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between border-b border-zinc-200">
                  <span className="text-gray-600">Panjang</span>
                  <span>{data.ukuran_cetak_panjang_1} mm</span>
                </div>
                <div className="flex justify-between border-b border-zinc-200">
                  <span className="text-gray-600">Lebar</span>
                  <span>{data.ukuran_cetak_lebar_1} mm</span>
                </div>
                <div className="flex justify-between border-b border-zinc-200">
                  <span className="text-gray-600">Bagian</span>
                  <span>{data.ukuran_cetak_bagian_1}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-200">
                  <span className="text-gray-600">Isi</span>
                  <span>{data.ukuran_cetak_isi_1}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-200">
                  <span className="text-gray-600">BBS</span>
                  <span>{data.ukuran_cetak_bbs_1}</span>
                </div>
              </div>
            </div>

            {/* Ukuran Cetak Produk II */}
            <div>
              <h3 className="font-medium mb-3 underline">
                Ukuran Cetak Produk II:
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between border-b border-zinc-200">
                  <span className="text-gray-600">Panjang</span>
                  <span>{data.ukuran_cetak_panjang_2 || 0} mm</span>
                </div>
                <div className="flex justify-between border-b border-zinc-200">
                  <span className="text-gray-600">Lebar</span>
                  <span>{data.ukuran_cetak_lebar_2 || 0} mm</span>
                </div>
                <div className="flex justify-between border-b border-zinc-200">
                  <span className="text-gray-600">Bagian</span>
                  <span>{data.ukuran_cetak_bagian_2 || 0}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-200">
                  <span className="text-gray-600">Isi</span>
                  <span>{data.ukuran_cetak_isi_2 || 0}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-200">
                  <span className="text-gray-600">BBS</span>
                  <span>{data.ukuran_cetak_bbs_2 || 'No'}</span>
                </div>
              </div>
            </div>
            {/* Warna Cetakan */}
            <div>
              <h3 className="font-medium mb-3 underline">Warna Cetakan:</h3>
              <div className="space-y-2">
                <div className="flex justify-between border-b border-zinc-200">
                  <span className="text-gray-600">Depan</span>
                  <span>{data.warna_depan}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-200">
                  <span className="text-gray-600">Belakang</span>
                  <span>{data.warna_belakang}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-200">
                  <span className="text-gray-600">Jumlah Warna</span>
                  <span>{data.jumlah_warna}</span>
                </div>
              </div>
            </div>
          </div>
          {/* Main Content - 2 Column Layout */}
          <div className="grid grid-cols-2 gap-8  pt-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Pre-Press & Press */}
              <div>
                <h3 className="font-medium mb-3 underline">
                  Pre-Press & Press:
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between border-b border-zinc-200">
                    <span className="text-gray-600">Jenis Kertas</span>
                    <span>{data.jenis_kertas}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-200">
                    <span className="text-gray-600">Nama Kertas</span>
                    <span className="truncate">{data.nama_kertas}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-200">
                    <span className="text-gray-600">Gramature</span>
                    <span>{data.gramature_kertas}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-200">
                    <span className="text-gray-600">Panjang</span>
                    <span>{data.panjang_kertas} mm</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-200">
                    <span className="text-gray-600">Lebar</span>
                    <span>{data.lebar_kertas} mm</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-200">
                    <span className="text-gray-600">Percentage</span>
                    <span>{data.persentase_kertas}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-200">
                    <span className="text-gray-600">Jumlah Kertas</span>
                    <span>{data.total_kertas}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-200">
                    <span className="text-gray-600">Apki</span>
                    <span>1</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-200">
                    <span className="text-gray-600">Total Harga Kertas</span>
                    <span>{formatCurrency(data.total_harga_kertas)}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-200">
                    <span className="text-gray-600">Mesin Potong</span>
                    <span>{data.nama_mesin_potong}</span>
                  </div>
                </div>
              </div>

              {/* Pons Insheet */}
              <div>
                <h3 className="font-medium mb-3 underline">Pons Insheet:</h3>
                <div className="space-y-2">
                  <div className="flex justify-between border-b border-zinc-200">
                    <span className="text-gray-600">Pons Insheet</span>
                    <span>{data.pons_insheet}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-200">
                    <span className="text-gray-600">Jenis Pons</span>
                    <span>{data.nama_jenis_pons}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-200">
                    <span className="text-gray-600">Mesin Pons</span>
                    <span>{data.nama_mesin_pons}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-200">
                    <span className="text-gray-600">Harga Pisau</span>
                    <span>{formatCurrency(data.harga_pisau)}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-200">
                    <span className="text-gray-600">Ongkos Pons / QTY</span>
                    <span>{data.ongkos_pons}</span>
                    <span>{data.ongkos_pons_qty}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-200">
                    <span className="text-gray-600">
                      Harga Satuan Ongkos Pons
                    </span>
                    <span>{formatCurrency(data.harga_satuan_ongkos_pons)}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-200">
                    <span className="text-gray-600">
                      Total Harga Ongkos Pons
                    </span>
                    <span>{formatCurrency(data.total_harga_ongkos_pons)}</span>
                  </div>
                </div>
              </div>

              {/* Finishing Insheet */}
              <div>
                <h3 className="font-medium mb-3 underline">
                  Finishing Insheet:
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between border-b border-zinc-200">
                    <span className="text-gray-600">Finishing Insheet</span>
                    <span>{data.finishing_insheet}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-200">
                    <span className="text-gray-600">Mesin Finishing</span>
                    <span>{data.nama_mesin_finishing}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-200">
                    <span className="text-gray-600">Lem</span>
                    <span> {data.nama_lem}</span>
                    <span> {formatCurrency(data.jumlah_harga_lem) || 0}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-200">
                    <span className="text-gray-600">Foil</span>
                    <span> {formatCurrency(data.harga_foil_manual) || 0}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-200">
                    <span className="text-gray-600">Spot Foil</span>
                    <span>
                      {formatCurrency(data.harga_spot_foil_manual) || 0}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-200">
                    <span className="text-gray-600">Harga Polimer</span>
                    <span>
                      {formatCurrency(data.harga_polimer_manual) || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Printing Insheet */}
              <div>
                <h3 className="font-medium mb-3 underline">
                  Printing Insheet:
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between border-b border-zinc-200">
                    <span className="text-gray-600">Printing Insheet</span>
                    <span>{data.print_insheet}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-200">
                    <span className="text-gray-600">Jenis Mesin</span>
                    <span>{data.jenis_mesin_cetak}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-200">
                    <span className="text-gray-600">Plate</span>
                    <span>{data.jumlah_warna}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-200">
                    <span className="text-gray-600">Harga Plate</span>
                    <span>{formatCurrency(data.harga_plate)}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-200">
                    <span className="text-gray-600">Jumlah Harga Cetak</span>
                    <span>{formatCurrency(data.jumlah_harga_cetak)}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-200">
                    <span className="text-gray-600">Mesin Coating Depan</span>
                    <span>{data.nama_mesin_coating_depan}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-200">
                    <span className="text-gray-600">Coating Depan</span>
                    <span>{data.nama_coating_depan}</span>
                    <span>
                      {formatCurrency(data.jumlah_harga_coating_depan) || 0}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-200">
                    <span className="text-gray-600">
                      Mesin Coating Belakang
                    </span>
                    <span>{data.nama_mesin_coating_belakang}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-200">
                    <span className="text-gray-600">Coating Belakang</span>
                    <span>{data.nama_coating_belakang}</span>
                    <span>
                      {formatCurrency(data.jumlah_harga_coating_belakang) || 0}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-200">
                    <span className="text-gray-600">Jumlah Harga Coating</span>
                    <span>{formatCurrency(data.total_harga_coating)}</span>
                  </div>
                </div>
              </div>

              {/* Packaging */}
              <div>
                <h3 className="font-medium mb-3 underline">Packaging:</h3>
                <div className="space-y-2">
                  <div className="flex justify-between border-b border-zinc-200">
                    <span className="text-gray-600">Panjang</span>
                    <span>{data.panjang_packaging} mm</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-200">
                    <span className="text-gray-600">Lebar</span>
                    <span>{data.lebar_packaging} mm</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-200">
                    <span className="text-gray-600">No Packaging</span>
                    <span>{data.no_packaging}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-200">
                    <span className="text-gray-600">Harga Packaging</span>
                    <span>{formatCurrency(data.harga_packaging)}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-200">
                    <span className="text-gray-600">Jumlah Kirim</span>
                    <span>{data.jumlah_kirim}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-200">
                    <span className="text-gray-600">Harga Pengiriman</span>
                    <span>{formatCurrency(data.harga_pengiriman)}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-200">
                    <span className="text-gray-600">Jenis Packing</span>
                    <span>{data.jenis_packing}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-200">
                    <span className="text-gray-600">Nama Packing</span>
                    <span>{data.nama_packing}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-200">
                    <span className="text-gray-600">Qty Packing</span>
                    <span>{data.qty_packing}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-200">
                    <span className="text-gray-600">Harga Packing</span>
                    <span>{formatCurrency(data.harga_packing)}</span>
                  </div>
                </div>
              </div>
              {/* Mesin Lipat */}
              <div>
                <h3 className="font-medium mb-3 underline">Mesin Lipat:</h3>
                <div className="space-y-2">
                  <div className="flex justify-between border-b border-zinc-200">
                    <span className="text-gray-600">Mesin Lipat</span>
                    <span>{data.nama_mesin_lipat}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-200">
                    <span className="text-gray-600">Lipat</span>
                    <span>
                      {data.lipat} | QTY : {data.qty_lipat || 0}
                    </span>
                    <span className="text-gray-600">
                      {formatCurrency(data.harga_lipat)}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-200">
                    <span className="text-gray-600">Potong Jadi</span>
                    <span>
                      {data.potong_jadi} | QTY : {data.qty_potong || 0}
                    </span>
                    <span className="text-gray-600">
                      {formatCurrency(data.harga_potong_jadi)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lain-Lain Section */}
          <div className="mt-8 mb-8 ">
            <h3 className="font-medium mb-4 underline">Lain - Lain:</h3>
            <div className="bg-gray-50 grid grid-cols-2 rounded-lg">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-200">
                    <th className="text-left py-2">Nama Item</th>
                    <th className="text-right py-2">Harga</th>
                  </tr>
                </thead>
                <tbody>
                  {data.lain_lain && data.lain_lain.length > 0 ? (
                    data.lain_lain.map((item: any, index: any) => (
                      <tr
                        key={item.id || index}
                        className="border-b border-zinc-200"
                      >
                        <td className="py-2">{item.nama_item}</td>
                        <td className="text-right py-2">
                          {formatCurrency(item.harga)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={2}
                        className="py-2 text-center text-gray-500"
                      >
                        -
                      </td>
                    </tr>
                  )}

                  {/* Total Row */}
                  <tr className="border-b font-medium border-zinc-200">
                    <td className="py-2">Total</td>
                    <td className="text-right py-2">
                      {formatCurrency(
                        data.lain_lain?.reduce(
                          (sum: number, item: any) => sum + (item.harga || 0),
                          0,
                        ) || 0,
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Section - Pricing Summary */}
          {/* Bottom Section - Pricing Summary */}
          <div className="grid grid-cols-2 gap-8 border-t pt-6">
            {/* Harga Kalkulasi */}
            <div>
              <h3 className="font-medium mb-4 underline">Harga Kalkulasi:</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-3 border-b border-zinc-200">
                  <span className="text-gray-600">Harga Produksi</span>
                  <span></span>
                  <span className="font-medium text-right">
                    {formatCurrency(data.harga_produksi)}
                  </span>
                </div>
                <div className="grid grid-cols-3 border-b border-zinc-200 items-center">
                  <span className="text-gray-600">Profit</span>
                  <span className="text-md text-center">{data.profit}%</span>
                  <span className="font-medium text-right">
                    {formatCurrency(data.profit_harga)}
                  </span>
                </div>
                <div className="grid grid-cols-3 border-b border-zinc-200">
                  <span className="text-gray-600">Harga Jual</span>
                  <span></span>
                  <span className="font-medium text-right">
                    {formatCurrency(data.jumlah_harga_jual)}
                  </span>
                </div>
                <div className="grid grid-cols-3 border-b border-zinc-200 items-center">
                  <span className="text-gray-600">PPN</span>
                  <span className="text-md text-center">{data.ppn}%</span>
                  <span className="font-medium text-right">
                    {formatCurrency(data.harga_ppn)}
                  </span>
                </div>
                <div className="grid grid-cols-3 border-b border-zinc-200 items-center">
                  <span className="text-gray-600">Diskon</span>
                  <span className="text-md text-center">{data.diskon}%</span>
                  <span className="font-medium text-right">
                    {formatCurrency(data.harga_diskon)}
                  </span>
                </div>
                <div className="grid grid-cols-3 border-b border-zinc-200 border-t pt-2">
                  <span className="font-medium">Total Harga</span>
                  <span></span>
                  <span className="font-bold text-right">
                    {formatCurrency(data.total_harga)}
                  </span>
                </div>
                <div className="grid grid-cols-3 border-b border-zinc-200">
                  <span className="font-medium">Total Harga ke Customer</span>
                  <span></span>
                  <span className="font-bold text-right">
                    {formatCurrency(
                      data.total_harga_satuan_customer * data.qty_kalkulasi,
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Harga Per Satuan */}
            <div>
              <h3 className="font-medium mb-4 underline">Harga Per Satuan:</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-3 border-b border-zinc-200">
                  <span className="text-gray-600">Harga Produksi Satuan</span>
                  <span></span>
                  <span className="font-medium text-right">
                    {formatCurrency(
                      parseFloat(data.harga_produksi) / data.qty_kalkulasi,
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-3 border-b border-zinc-200 items-center">
                  <span className="text-gray-600">Profit</span>
                  <span className="text-md text-center">{data.profit}%</span>
                  <span className="font-medium text-right">
                    {formatCurrency(
                      parseFloat(data.profit_harga) / data.qty_kalkulasi,
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-3 border-b border-zinc-200">
                  <span className="text-gray-600">Harga Jual</span>
                  <span></span>
                  <span className="font-medium text-right">
                    {formatCurrency(
                      parseFloat(data.jumlah_harga_jual) / data.qty_kalkulasi,
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-3 border-b border-zinc-200 items-center">
                  <span className="text-gray-600">PPN</span>
                  <span className="text-md text-center">{data.ppn}%</span>
                  <span className="font-medium text-right">
                    {formatCurrency(
                      parseFloat(data.harga_ppn) / data.qty_kalkulasi,
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-3 border-b border-zinc-200 items-center">
                  <span className="text-gray-600">Diskon</span>
                  <span className="text-md text-center">{data.diskon}%</span>
                  <span className="font-medium text-right">
                    {formatCurrency(
                      parseFloat(data.harga_diskon) / data.qty_kalkulasi,
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-3 border-b border-zinc-200 border-t pt-2">
                  <span className="font-medium">Total Harga Satuan</span>
                  <span></span>
                  <span className="font-bold text-right">
                    {formatCurrency(
                      parseFloat(data.total_harga) / data.qty_kalkulasi,
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-3 border-b border-zinc-200">
                  <span className="font-medium">
                    Total Harga Satuan ke Customer
                  </span>
                  <span></span>
                  <span className="font-bold text-right">
                    {formatCurrency(data.total_harga_satuan_customer)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Work Notes Section */}
          <div className="grid grid-cols-2 gap-8 mt-8 border-t pt-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">
                Keterangan Kerja:
              </h4>
              <div className="bg-gray-50 p-3 rounded text-sm">
                {data.keterangan_kerja || '-'}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">
                Keterangan Harga:
              </h4>
              <div className="bg-gray-50 p-3 rounded text-sm">
                {data.keterangan_harga || 'Tidak ada keterangan harga'}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t text-center text-sm text-gray-500">
            <p>
              Created: {data.user_create?.nama || 'Unknown'}
              {', '}
              {data.createdAt ? formatDate(data.createdAt) : 'Unknown'}
            </p>
            {data.kalkulasi_action_user?.map((user: any) => (
              <p key={user.id}>
                Submited: {user.user.nama}
                {', '}
                {user.createdAt ? formatDate(user.createdAt) : 'Unknown'},
              </p>
            ))}

            <p>
              Approved: {data.user_approve?.nama || 'Unknown'}
              {', '}
              {data.user_approve?.createdAt
                ? formatDate(data.user_approve?.createdAt)
                : 'Unknown'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KalkulasiDetailModal;
