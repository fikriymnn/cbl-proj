import React from 'react';

interface Tahapan {
  id: number;
  kode_tahapan: string;
  nama_tahapan: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Mesin {
  id: number;
  nama_mesin: string;
  kode_mesin: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Operator {
  id: number;
  uuid: string;
  nama: string;
  no: string;
  email: string;
  role: string;
  bagian: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ProduksiLKHWaste {
  id: number;
  id_jo: number;
  id_produksi_lkh: number;
  id_produksi_lkh_tahapan: number;
  id_tahapan: number;
  id_mesin: number;
  id_operator: number;
  id_kendala: number;
  id_waste: number;
  kode_kendala: string;
  kode_waste: string;
  deskripsi_kendala: string;
  deskripsi_waste: string;
  total_qty: number;
  proses: string;
  note: string | null;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  tahapan?: Tahapan;
  mesin?: Mesin;
  operator?: Operator;
}

interface WasteTableProps {
  wasteData: ProduksiLKHWaste[];
}

const WasteTable: React.FC<WasteTableProps> = ({ wasteData }) => {
  const formatNumber = (num: number | null | undefined): string => {
    if (num === null || num === undefined) return '-';
    return num.toLocaleString('id-ID');
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

  const getProcessBadge = (proses: string) => {
    const processColors: { [key: string]: string } = {
      Setting: 'bg-blue-100 text-blue-800',
      Produksi: 'bg-green-100 text-green-800',
      Kendala: 'bg-red-100 text-red-800',
      Maintenance: 'bg-yellow-100 text-yellow-800',
    };

    return (
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${
          processColors[proses] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {proses}
      </span>
    );
  };

  const getTotalWaste = () => {
    return wasteData.reduce((acc, w) => acc + (w.total_qty || 0), 0);
  };

  if (!wasteData || wasteData.length === 0) {
    return (
      <div className="overflow-x-auto">
        <h3 className="text-sm font-bold text-gray-700 bg-gradient-to-r from-orange-50 to-orange-100 px-4 py-2 rounded border-l-4 border-orange-600 mb-3">
          Data Waste
        </h3>
        <table className="min-w-full border-collapse border border-gray-300 text-xs">
          <thead className="bg-gradient-to-r from-orange-700 to-orange-600 text-white">
            <tr>
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
              <th className="border border-gray-300 px-3 py-2 text-center font-bold">
                Waste Total
              </th>
              <th className="border border-gray-300 px-3 py-2 text-left font-bold">
                Tgl Dibuat
              </th>
              <th className="border border-gray-300 px-3 py-2 text-left font-bold">
                Note
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-3 py-3" colSpan={8}>
                <div className="text-center text-gray-500 italic">
                  Belum ada data waste
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-bold text-gray-700 bg-gradient-to-r from-orange-50 to-orange-100 px-4 py-2 rounded border-l-4 border-orange-600 flex-1">
          Data Waste Total Waste :{' '}
          <span className="bg-orange-100 text-orange-800  text-xs font-bold">
            {formatNumber(getTotalWaste())}
          </span>
        </h3>
      </div>

      <table className="min-w-full border-collapse border border-gray-300 text-xs">
        <thead className="bg-gradient-to-r from-orange-700 to-orange-600 text-white">
          <tr>
            <th className="border border-gray-300 px-3 py-2 text-left font-bold">
              No
            </th>

            <th className="border border-gray-300 px-3 py-2 text-left font-bold">
              Tahapan
            </th>
            <th className="border border-gray-300 px-3 py-2 text-left font-bold">
              Mesin
            </th>
            <th className="border border-gray-300 px-3 py-2 text-left font-bold">
              Operator
            </th>
            <th className="border border-gray-300 px-3 py-2 text-left font-bold">
              Waste
            </th>
            <th className="border border-gray-300 px-3 py-2 text-left font-bold">
              Kendala
            </th>

            <th className="border border-gray-300 px-3 py-2 text-center font-bold">
              Total QTY
            </th>
            <th className="border border-gray-300 px-3 py-2 text-left font-bold">
              Waktu
            </th>
          </tr>
        </thead>
        <tbody>
          {wasteData.map((waste, index) => (
            <tr key={waste.id} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-3 py-1.5">
                {index + 1}
              </td>

              <td className="border border-gray-300 px-3 py-1.5">
                {waste.tahapan?.nama_tahapan || '-'}
              </td>
              <td className="border border-gray-300 px-3 py-1.5">
                {waste.mesin?.nama_mesin || '-'}
              </td>
              <td className="border border-gray-300 px-3 py-1.5">
                {waste.operator?.nama || '-'}
              </td>

              <td className="border border-gray-300 px-3 py-1.5">
                <div className="max-w-xs">
                  <div className="font-medium">{waste.deskripsi_waste}</div>
                  <div className="text-gray-500 text-[10px]">
                    Code: {waste.kode_waste}
                  </div>
                </div>
              </td>
              <td className="border border-gray-300 px-3 py-1.5">
                <div className="max-w-xs">
                  <div className="font-medium">{waste.deskripsi_kendala}</div>
                  <div className="text-gray-500 text-[10px]">
                    Code: {waste.kode_kendala}
                  </div>
                </div>
              </td>
              <td className="border border-gray-300 px-3 py-1.5 text-center font-medium text-orange-700">
                {formatNumber(waste.total_qty)}
              </td>
              <td className="border border-gray-300 px-3 py-1.5">
                {formatDateTime(waste.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-gradient-to-r from-orange-50 to-orange-100">
          <tr>
            <td
              colSpan={6}
              className="border border-gray-300 px-3 py-2 text-right text-sm font-bold text-gray-900"
            >
              Total Waste:
            </td>
            <td className="border border-gray-300 px-3 py-2 text-center text-sm font-bold text-orange-700">
              {formatNumber(getTotalWaste())}
            </td>
            <td colSpan={2} className="border border-gray-300"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default WasteTable;
