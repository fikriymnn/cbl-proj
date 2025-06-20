import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
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

interface MonthlyBarChartProps {
  data: MonthlyChartData[];
  isVisible: boolean;
  onSelectMonth?: (monthYear: string) => void;
  onSelectDetail?: (monthYear: string, field: keyof MonthlyChartData) => void;
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

function MonthlyCharts({
  data,
  isVisible,
  onSelectMonth,
  onSelectDetail,
}: MonthlyBarChartProps) {
  const [visibleBars, setVisibleBars] = useState<string[]>(
    chartKeys.map((k) => k.key),
  );

  if (!isVisible || data.length === 0) return null;

  const toggleBar = (key: string) => {
    setVisibleBars((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const allSelected = visibleBars.length === chartKeys.length;

  const toggleAll = () => {
    setVisibleBars(allSelected ? [] : chartKeys.map((k) => k.key));
  };

  const handleCellClick = (
    e: React.MouseEvent,
    monthYear: string,
    field: keyof MonthlyChartData,
  ) => {
    e.stopPropagation(); // Prevent row click
    if (onSelectDetail) {
      onSelectDetail(monthYear, field);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Ringkasan Bulanan (Bar Chart)
      </h3>

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
                checked={visibleBars.includes(key)}
                onChange={() => toggleBar(key)}
                className="accent-blue-600"
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={450}>
        <BarChart
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
              visibleBars.includes(key) && (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={color}
                  name={label}
                  onClick={(data) => {
                    if (onSelectMonth) {
                      onSelectMonth(data.monthYear);
                    }
                  }}
                >
                  <LabelList dataKey={key} position="top" />
                </Bar>
              ),
          )}
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <h3 className="text-lg font-semibold text-white">
              Ringkasan Data Bulanan
            </h3>
            <p className="text-blue-100 text-sm mt-1">
              Klik pada angka untuk melihat detail karyawan
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200 sticky left-0 bg-gray-50 z-10">
                    Bulan
                  </th>
                  {chartKeys.map(({ key, label }, index) => (
                    <th
                      key={key}
                      className={`px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider ${
                        index < chartKeys.length - 1
                          ? 'border-r border-gray-200'
                          : ''
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-1">
                        <span>{label}</span>
                        <div className="w-8 h-0.5 bg-blue-400 rounded"></div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-blue-50 transition-colors duration-150 group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200 sticky left-0 bg-white group-hover:bg-blue-50 z-10">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>{item.monthYear}</span>
                      </div>
                    </td>
                    {chartKeys.map(({ key }, colIndex) => (
                      <td
                        key={key}
                        className={`px-6 py-4 whitespace-nowrap text-center ${
                          colIndex < chartKeys.length - 1
                            ? 'border-r border-gray-200'
                            : ''
                        }`}
                      >
                        <span
                          className="inline-block px-3 py-1 text-sm font-medium text-gray-900 hover:bg-blue-100 hover:text-blue-700 rounded-md cursor-pointer transition-colors duration-150"
                          onClick={(e) =>
                            handleCellClick(
                              e,
                              item.monthYear,
                              key as keyof MonthlyChartData,
                            )
                          }
                          title={`Klik untuk melihat detail ${chartKeys.find(
                            (c) => c.key === key,
                          )?.label} di ${item.monthYear}`}
                        >
                          {item[key as keyof MonthlyChartData]}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Total {data.length} periode data</span>
              <span>
                Terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default MonthlyCharts;
