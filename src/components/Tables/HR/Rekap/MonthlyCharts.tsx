import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useState } from 'react';

interface MonthlyChartData {
  monthYear: string;
  totalEmployees: number;
  totalHariMasuk: number;
  totalCutiTahunan: number;
  totalCutiKhusus: number;
  totalIzin: number;
  totalSakit: number;
  totalMangkir: number;
  totalTerlambat: number;
  totalJamLembur: number;
}

interface MonthlyLineChartProps {
  data: MonthlyChartData[];
  isVisible: boolean;
}

const chartKeys = [
  { key: 'totalEmployees', label: 'Total Karyawan', color: '#4f46e5' },
  { key: 'totalHariMasuk', label: 'Hari Masuk', color: '#10b981' },
  { key: 'totalCutiTahunan', label: 'Cuti Tahunan', color: '#f59e0b' },
  { key: 'totalCutiKhusus', label: 'Cuti Khusus', color: '#ef4444' },
  { key: 'totalIzin', label: 'Izin', color: '#6366f1' },
  { key: 'totalSakit', label: 'Sakit', color: '#14b8a6' },
  { key: 'totalMangkir', label: 'Mangkir', color: '#f43f5e' },
  { key: 'totalTerlambat', label: 'Terlambat', color: '#8b5cf6' },
  { key: 'totalJamLembur', label: 'Jam Lembur', color: '#f97316' },
];

export default function MonthlyLineChart({
  data,
  isVisible,
}: MonthlyLineChartProps) {
  const [visibleLines, setVisibleLines] = useState<string[]>(
    chartKeys.map((k) => k.key),
  );

  if (!isVisible || data.length === 0) return null;

  const toggleLine = (key: string) => {
    setVisibleLines((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const allSelected = visibleLines.length === chartKeys.length;

  const toggleAll = () => {
    setVisibleLines(allSelected ? [] : chartKeys.map((k) => k.key));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Ringkasan Bulanan
      </h3>

      {/* Filter Switch */}
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <button
          onClick={toggleAll}
          className="text-sm px-3 py-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-300"
        >
          {allSelected ? 'Hapus Semua' : 'Pilih Semua'}
        </button>

        <div className="flex flex-wrap gap-2">
          {chartKeys.map(({ key, label }) => (
            <label key={key} className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={visibleLines.includes(key)}
                onChange={() => toggleLine(key)}
                className="accent-blue-600"
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={450}>
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="monthYear" />
          <YAxis />
          <Tooltip />
          <Legend />

          {chartKeys.map(
            ({ key, label, color }) =>
              visibleLines.includes(key) && (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={color}
                  name={label}
                />
              ),
          )}
        </LineChart>
      </ResponsiveContainer>

      {/* Tabel Ringkasan */}
      <div className="overflow-x-auto mt-6">
        <table className="min-w-full table-auto text-sm text-left border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">Bulan</th>
              {chartKeys.map(({ key, label }) => (
                <th key={key} className="px-4 py-2 border">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} className="even:bg-gray-50">
                <td className="px-4 py-2 border font-medium">
                  {item.monthYear}
                </td>
                {chartKeys.map(({ key }) => (
                  <td key={key} className="px-4 py-2 border">
                    {item[key as keyof MonthlyChartData]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
