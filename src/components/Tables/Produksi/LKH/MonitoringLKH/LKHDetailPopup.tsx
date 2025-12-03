import React from 'react';

interface Tahapan {
  id: number;
  kode_tahapan: string;
  nama_tahapan: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Operator {
  id: number;
  nama: string;
  no: string;
  email: string;
  role: string;
  status: string;
  bagian: string;
}

interface ProduksiLKHProses {
  id: number;
  id_produksi_lkh: number;
  id_produksi_lkh_tahapan: number;
  id_tahapan: number;
  id_mesin: number;
  id_operator: number;
  id_kode_produksi: number;
  kode: string;
  deskripsi: string;
  waktu_mulai: string;
  waktu_selesai: string;
  total_waktu: string;
  baik: number;
  rusak_sebagian: number;
  rusak_total: number;
  pallet: number;
  status: string;
  note: string;
  proses: string;
  is_final_result: boolean;
  tahapan?: Tahapan;
  operator?: Operator;
}

interface LKHAllDataItem {
  id: number;
  id_produksi_lkh_tahapan: number;
  id_jo: number;
  id_io: number;
  id_so: number;
  id_tahapan: number;
  id_mesin: number;
  id_operator: number;
  id_customer: number | null;
  id_produk: number | null;
  no_jo: string;
  no_io: string;
  no_so: string;
  customer: string;
  produk: string;
  qty: number;
  qty_druk: number | null;
  spesifikasi: string;
  tgl_kirim: string;
  status: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  produksi_lkh_proses: ProduksiLKHProses[];
  tahapan?: Tahapan;
}

interface LKHDetailPopupProps {
  lkhData: LKHAllDataItem;
  onClose: () => void;
}

const LKHDetailPopup: React.FC<LKHDetailPopupProps> = ({
  lkhData,
  onClose,
}) => {
  const MAX_COLUMNS = 5; // Maximum 5 tahapan per row

  // Format number with thousand separator
  const formatNumber = (num: number): string => {
    return num.toLocaleString('id-ID');
  };

  const formatDuration = (totalSeconds: number | string): string => {
    const seconds =
      typeof totalSeconds === 'string' ? parseInt(totalSeconds) : totalSeconds;

    if (isNaN(seconds) || seconds < 0) return '00:00:00';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
      2,
      '0',
    )}:${String(secs).padStart(2, '0')}`;
  };

  const formatDateTime = (dateString: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const formatTime = (dateString: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
  };

  // Group processes by tahapan and calculate totals
  const getTahapanSummary = () => {
    const tahapanMap = new Map<
      string,
      {
        tahapanName: string;
        setting: number;
        produksi: number;
        off: number;
        kendala: number;
        maintenance: number;
        baik: number;
        rusak_sebagian: number;
        rusak_total: number;
        total_qty: number;
      }
    >();

    // Sort by waktu_mulai
    const sortedProses = [...lkhData.produksi_lkh_proses].sort(
      (a, b) =>
        new Date(a.waktu_mulai).getTime() - new Date(b.waktu_mulai).getTime(),
    );

    sortedProses.forEach((proses) => {
      const tahapanKey = proses.tahapan?.nama_tahapan || 'Unknown';

      if (!tahapanMap.has(tahapanKey)) {
        tahapanMap.set(tahapanKey, {
          tahapanName: tahapanKey,
          setting: 0,
          produksi: 0,
          off: 0,
          kendala: 0,
          maintenance: 0,
          baik: 0,
          rusak_sebagian: 0,
          rusak_total: 0,
          total_qty: 0,
        });
      }

      const summary = tahapanMap.get(tahapanKey)!;
      const waktuInSeconds = parseInt(proses.total_waktu);

      // Categorize by proses type
      switch (proses.proses?.toLowerCase()) {
        case 'setting':
          summary.setting += waktuInSeconds;
          break;
        case 'produksi':
          summary.produksi += waktuInSeconds;
          break;
        case 'off':
          summary.off += waktuInSeconds;
          break;
        case 'kendala':
          summary.kendala += waktuInSeconds;
          break;
        case 'maintenance':
          summary.maintenance += waktuInSeconds;
          break;
      }

      summary.baik += proses.baik;
      summary.rusak_sebagian += proses.rusak_sebagian;
      summary.rusak_total += proses.rusak_total;
      summary.total_qty =
        summary.baik + summary.rusak_sebagian + summary.rusak_total;
    });

    return Array.from(tahapanMap.values());
  };

  const handlePrint = () => {
    window.print();
  };

  const tahapanSummary = getTahapanSummary();

  // Split tahapan into chunks of MAX_COLUMNS
  const chunkArray = <T,>(array: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  };

  const tahapanChunks = chunkArray(tahapanSummary, MAX_COLUMNS);

  // Render summary table for a chunk - Compact version with header on top
  const renderSummaryTable = (
    chunk: typeof tahapanSummary,
    chunkIndex: number,
  ) => (
    <div key={chunkIndex} className="mb-4 inline-block mr-4">
      {chunk.map((summary, idx) => (
        <table
          key={idx}
          className="border-collapse border border-gray-300 text-xs inline-block mr-3 align-top"
        >
          <thead>
            <tr>
              <th
                className="border border-gray-300 px-4 py-2 text-center font-bold bg-blue-600 text-white"
                colSpan={2}
              >
                {summary.tahapanName}
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Setting */}
            <tr>
              <td className="border border-gray-300 px-3 py-1 text-left bg-gray-100 font-semibold w-32">
                Setting
              </td>
              <td className="border border-gray-300 px-3 py-1 text-center w-28">
                {formatDuration(summary.setting)}
              </td>
            </tr>

            {/* Produksi */}
            <tr>
              <td className="border border-gray-300 px-3 py-1 text-left bg-gray-100 font-semibold">
                Produksi
              </td>
              <td className="border border-gray-300 px-3 py-1 text-center">
                {formatDuration(summary.produksi)}
              </td>
            </tr>

            {/* Off */}
            <tr>
              <td className="border border-gray-300 px-3 py-1 text-left bg-gray-100 font-semibold">
                Off
              </td>
              <td className="border border-gray-300 px-3 py-1 text-center">
                {formatDuration(summary.off)}
              </td>
            </tr>

            {/* Kendala */}
            <tr>
              <td className="border border-gray-300 px-3 py-1 text-left bg-gray-100 font-semibold">
                Kendala
              </td>
              <td className="border border-gray-300 px-3 py-1 text-center">
                {formatDuration(summary.kendala)}
              </td>
            </tr>

            {/* Maintenance */}
            <tr>
              <td className="border border-gray-300 px-3 py-1 text-left bg-gray-100 font-semibold">
                Maintenance
              </td>
              <td className="border border-gray-300 px-3 py-1 text-center">
                {formatDuration(summary.maintenance)}
              </td>
            </tr>

            {/* Baik */}
            <tr>
              <td className="border border-gray-300 px-3 py-1 text-left bg-gray-100 font-semibold">
                Baik
              </td>
              <td className="border border-gray-300 px-3 py-1 text-center">
                {formatNumber(summary.baik)}
              </td>
            </tr>

            {/* Rusak Sebagian */}
            <tr>
              <td className="border border-gray-300 px-3 py-1 text-left bg-gray-100 font-semibold">
                Rusak Sebagian
              </td>
              <td className="border border-gray-300 px-3 py-1 text-center">
                {formatNumber(summary.rusak_sebagian)}
              </td>
            </tr>

            {/* Rusak Total */}
            <tr>
              <td className="border border-gray-300 px-3 py-1 text-left bg-gray-100 font-semibold">
                Rusak Total
              </td>
              <td className="border border-gray-300 px-3 py-1 text-center">
                {formatNumber(summary.rusak_total)}
              </td>
            </tr>

            {/* Total Qty */}
            <tr>
              <td className="border border-gray-300 px-3 py-1 text-left bg-green-100 font-bold">
                Total Qty
              </td>
              <td className="border border-gray-300 px-3 py-1 text-center font-bold text-blue-600">
                {formatNumber(summary.total_qty)}
              </td>
            </tr>
          </tbody>
        </table>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Preview{' '}
            {lkhData.produk
              ? `Nama Produk: ${lkhData.produk}`
              : 'null Nama Produk: null'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Summary Section - Compact Design with Header on Top */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-700  bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-2 rounded border-l-4 border-blue-600">
              Ringkasan Produksi per Tahapan
            </h3>
            <div className="overflow-x-auto">
              {tahapanChunks.map((chunk, index) =>
                renderSummaryTable(chunk, index),
              )}
            </div>
          </div>

          {/* Detail Process Section */}
          <div className="mb-6 ">
            <h3 className="text-sm font-bold text-gray-700  bg-gradient-to-r from-green-50 to-green-100 px-4 py-2 rounded border-l-4 border-green-600">
              Detail Proses Produksi
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300 text-xs ">
                <thead className="bg-gradient-to-r from-green-700 to-green-600 text-white">
                  <tr>
                    <th className="border border-gray-300 px-3 py-2 text-left font-bold">
                      Tanggal
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-bold">
                      Nama OPT
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-bold">
                      Mesin
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-bold">
                      History
                    </th>
                    <th
                      className="border border-gray-300 px-3 py-2 text-center font-bold"
                      colSpan={2}
                    >
                      Waktu
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-bold">
                      Durasi
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-bold">
                      Baik
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-bold">
                      Rusak Sebagian
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-bold">
                      Rusak Total
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-bold">
                      Pallet
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-bold">
                      Keterangan
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lkhData.produksi_lkh_proses
                    .sort(
                      (a, b) =>
                        new Date(a.waktu_mulai).getTime() -
                        new Date(b.waktu_mulai).getTime(),
                    )
                    .map((proses) => (
                      <tr key={proses.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-3 py-1.5">
                          {formatDateTime(proses.waktu_mulai).split(' ')[0]}
                        </td>
                        <td className="border border-gray-300 px-3 py-1.5">
                          {proses.operator?.nama || '-'}
                        </td>
                        <td className="border border-gray-300 px-3 py-1.5">
                          {proses.tahapan?.nama_tahapan || '-'}
                        </td>
                        <td className="border border-gray-300 px-3 py-1.5">
                          {proses.proses}
                        </td>
                        <td className="border border-gray-300 px-2 py-1.5 text-center text-gray-500 text-[10px] bg-gray-50">
                          <div className="font-semibold">start</div>
                          <div className="font-semibold">stop</div>
                        </td>
                        <td className="border border-gray-300 px-3 py-1.5">
                          <div>{formatTime(proses.waktu_mulai)}</div>
                          <div>{formatTime(proses.waktu_selesai)}</div>
                        </td>
                        <td className="border border-gray-300 px-3 py-1.5 text-center font-medium">
                          {formatDuration(proses.total_waktu)}
                        </td>
                        <td className="border border-gray-300 px-3 py-1.5 text-center">
                          {formatNumber(proses.baik || 0)}
                        </td>
                        <td className="border border-gray-300 px-3 py-1.5 text-center">
                          {formatNumber(proses.rusak_sebagian || 0)}
                        </td>
                        <td className="border border-gray-300 px-3 py-1.5 text-center">
                          {formatNumber(proses.rusak_total || 0)}
                        </td>
                        <td className="border border-gray-300 px-3 py-1.5 text-center">
                          {formatNumber(proses.pallet || 0)}
                        </td>
                        <td className="border border-gray-300 px-3 py-1.5">
                          {proses.note || proses.deskripsi || '-'}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Additional Sections */}
          <div className="grid grid-cols-1 gap-4">
            {/* Waste Table */}
            <div className="overflow-x-auto">
              <h3 className="text-sm font-bold text-gray-700 bg-gradient-to-r from-orange-50 to-orange-100 px-4 py-2 rounded border-l-4 border-orange-600">
                Data Waste
              </h3>
              <table className="min-w-full text-xs">
                <thead className="bg-gradient-to-r from-orange-700 to-orange-600 text-white">
                  <tr>
                    <th className="border border-gray-300 px-3 py-2 text-left font-bold">
                      Proses
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-bold">
                      Operator
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-bold">
                      Mesin
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-bold">
                      Waste
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-bold">
                      Kendala
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-bold">
                      Waste Total
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-bold">
                      Tgl Dibuat
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td
                      className="border border-gray-300 px-3 py-3"
                      colSpan={7}
                    >
                      <div className="text-center text-gray-500 italic">
                        Belum ada data waste
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
};
export default LKHDetailPopup;
