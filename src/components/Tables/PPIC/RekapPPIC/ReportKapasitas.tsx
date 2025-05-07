import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

// Define TypeScript interfaces for our data structures
interface BookingDetail {
  createdAt: string;
  id: number;
  mesin: string;
  nama_customer: string;
  nama_item: string;
  no_io: string;
  qty_druk: number;
  qty_pcs: number;
  status: string;
  tanggal: string;
  updatedAt: string;
}

interface MachineBooking {
  mesin: string;
  total_qty_pcs: number;
  total_qty_druk: number;
  detail: BookingDetail[];
}

interface MachineCapacity {
  mesin: string;
  kapasitas: number;
  proses: string;
}

interface MachineRemainingCapacity {
  mesin: string;
  kapasitas_mesin: number;
  total_kapasitas: number;
  sisa_kapasitas_percent: number;
}

interface ApiResponse {
  data_booking: Record<string, MachineBooking>;
  list_kapasitas_perbulan: MachineCapacity[];
  sisa_kapasitas: MachineRemainingCapacity[];
}

function ReportKapasitas() {
  // State for filter parameters
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(false);
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);

  // Function to fetch data from API
  async function getReportKapasitas() {
    const url = `${
      import.meta.env.VITE_API_LINK || '/api'
    }/ppic/reportKapasitas`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        params: { bulan: month, tahun: year },
        withCredentials: true,
      });

      setApiData(res.data);
      console.log(res.data);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('Error fetching data:', error);
    }
  }

  // Format number with thousand separator
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

  const months = [
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' },
  ];

  // Generate years for dropdown (10 years back and 5 years forward)
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 10;
  const endYear = currentYear + 5;
  const years = Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => startYear + i,
  );

  // Fetch data when filters change
  useEffect(() => {
    getReportKapasitas();
  }, [month, year]);

  // Handle machine selection
  const handleMachineSelect = (machine: string) => {
    if (selectedMachine === machine) {
      setSelectedMachine(null);
    } else {
      setSelectedMachine(machine);
    }
  };

  // Toggle showing details for a specific machine (used in the capacity table)
  const toggleDetails = (machine: string) => {
    setShowDetails({
      ...showDetails,
      [machine]: !showDetails[machine],
    });
  };

  // Process the data for the capacity chart
  const getCapacityChartData = () => {
    if (!apiData?.sisa_kapasitas) return [];

    return apiData.sisa_kapasitas.map((item) => ({
      name: item.mesin,
      usedCapacity: 100 - item.sisa_kapasitas_percent,
      remainingCapacity: item.sisa_kapasitas_percent,
      totalCapacity: item.kapasitas_mesin,
    }));
  };

  // Define color scheme for chart
  const getCapacityColor = (percent: number) => {
    if (percent <= 25) return '#ef4444'; // Red for critical
    if (percent <= 50) return '#f59e0b'; // Amber for warning
    if (percent <= 75) return '#3b82f6'; // Blue for moderate
    return '#22c55e'; // Green for good
  };

  // Calculate total capacity utilization
  const getTotalUtilization = () => {
    if (!apiData?.sisa_kapasitas) return { used: 0, remaining: 0, total: 0 };

    const totalCapacity = apiData.sisa_kapasitas.reduce(
      (sum, item) => sum + item.kapasitas_mesin,
      0,
    );
    const used = apiData.sisa_kapasitas.reduce((sum, item) => {
      const usedPercent = 100 - item.sisa_kapasitas_percent;
      return sum + (item.kapasitas_mesin * usedPercent) / 100;
    }, 0);

    return {
      used,
      remaining: totalCapacity - used,
      total: totalCapacity,
    };
  };

  return (
    <div className="p-4">
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Report Kapasitas</h1>

            <div className="flex space-x-4">
              <div className="flex items-center">
                <label className="mr-2 font-medium">Bulan:</label>
                <select
                  className="border rounded p-2"
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                >
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <label className="mr-2 font-medium">Tahun:</label>
                <select
                  className="border rounded p-2"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                onClick={getReportKapasitas}
              >
                Tampilkan
              </button>
            </div>
          </div>

          {apiData && (
            <>
              {/* Capacity Overview Dashboard */}
              <div className="mb-8 bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">Dashboard Kapasitas</h2>
                {/* Total Capacity Section */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-xl font-bold mb-4">
                    KAPASITAS PER BULAN
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {apiData.sisa_kapasitas.map((item) => (
                      <div
                        key={item.mesin}
                        className="bg-blue-50 border border-blue-300 rounded-lg p-2 shadow-sm w-full text-sm"
                      >
                        <h3 className="text-center text-blue-700 font-semibold mb-1">
                          {item.mesin}
                        </h3>
                        <p className="text-center font-bold text-blue-900">
                          {formatNumber(item.kapasitas_mesin)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6 mt-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="text-sm font-medium text-blue-800 mb-2">
                      Total Kapasitas Bulanan
                    </h3>
                    <p className="text-2xl font-bold">
                      {formatNumber(getTotalUtilization().total)}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="text-sm font-medium text-green-800 mb-2">
                      Kapasitas Tersisa
                    </h3>
                    <p className="text-2xl font-bold">
                      {formatNumber(getTotalUtilization().remaining)}
                    </p>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <h3 className="text-sm font-medium text-amber-800 mb-2">
                      Kapasitas Terpakai
                    </h3>
                    <p className="text-2xl font-bold">
                      {formatNumber(getTotalUtilization().used)}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h3 className="text-sm font-medium text-purple-800 mb-2">
                      Persentase Terpakai
                    </h3>
                    <p className="text-2xl font-bold">
                      {getTotalUtilization().total === 0
                        ? '0%'
                        : Math.round(
                            (getTotalUtilization().used /
                              getTotalUtilization().total) *
                              100,
                          ) + '%'}
                    </p>
                  </div>
                </div>

                {/* Chart */}
                <div className="h-64 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getCapacityChartData()}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: any, name: string) => {
                          if (name === 'usedCapacity')
                            return [`${value}%`, 'Terpakai'];
                          if (name === 'remainingCapacity')
                            return [`${value}%`, 'Tersisa'];
                          return [value, name];
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="usedCapacity"
                        name="Kapasitas Terpakai"
                        stackId="a"
                        fill="#f59e0b"
                      />
                      <Bar
                        dataKey="remainingCapacity"
                        name="Kapasitas Tersisa"
                        stackId="a"
                      >
                        {getCapacityChartData().map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={getCapacityColor(entry.remainingCapacity)}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Capacity Tables */}
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">Kapasitas Per Mesin</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-300 shadow-sm rounded-lg">
                    <thead>
                      <tr className="bg-gray-100 text-gray-700">
                        <th className="py-3 px-4 border-b text-left">Mesin</th>
                        <th className="py-3 px-4 border-b text-right">
                          Kapasitas Bulanan
                        </th>
                        <th className="py-3 px-4 border-b text-right">
                          Kapasitas Terpakai
                        </th>
                        <th className="py-3 px-4 border-b text-right">
                          Kapasitas Tersisa
                        </th>
                        <th className="py-3 px-4 border-b text-right">
                          Sisa (%)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {apiData.sisa_kapasitas.map((item, index) => {
                        const usedCapacity =
                          item.kapasitas_mesin -
                          (item.kapasitas_mesin * item.sisa_kapasitas_percent) /
                            100;
                        const remainingCapacity =
                          (item.kapasitas_mesin * item.sisa_kapasitas_percent) /
                          100;

                        return (
                          <tr
                            key={item.mesin}
                            className={`${
                              index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                            } hover:bg-blue-50 cursor-pointer`}
                            onClick={() => toggleDetails(item.mesin)}
                          >
                            <td className="py-3 px-4 border-b font-medium">
                              {item.mesin}
                            </td>
                            <td className="py-3 px-4 border-b text-right">
                              {formatNumber(item.kapasitas_mesin)}
                            </td>
                            <td className="py-3 px-4 border-b text-right">
                              {formatNumber(usedCapacity)}
                            </td>
                            <td className="py-3 px-4 border-b text-right">
                              {formatNumber(remainingCapacity)}
                            </td>
                            <td
                              className={`py-3 px-4 border-b text-right font-bold ${
                                item.sisa_kapasitas_percent > 75
                                  ? 'text-green-600'
                                  : item.sisa_kapasitas_percent > 50
                                  ? 'text-blue-600'
                                  : item.sisa_kapasitas_percent > 25
                                  ? 'text-amber-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {item.sisa_kapasitas_percent}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* MODIFIED: Detail Booking Section with Box Cards */}
              <div>
                <h2 className="text-xl font-bold mb-4">Detail Booking</h2>

                {/* Machine boxes grid layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {Object.entries(apiData.data_booking).map(
                    ([machine, bookingData]) => (
                      <div
                        key={machine}
                        className={`rounded-lg shadow cursor-pointer transition-all duration-300 overflow-hidden ${
                          selectedMachine === machine ? 'col-span-full' : ''
                        }`}
                        onClick={() => handleMachineSelect(machine)}
                      >
                        {selectedMachine === machine ? (
                          // Expanded view with table (similar to the image)
                          <div className="bg-white">
                            <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
                              <h3 className="font-bold text-lg">{machine}</h3>
                              <div className="flex space-x-6">
                                <div>
                                  <span className="text-blue-200 text-sm">
                                    Total PCS:
                                  </span>
                                  <span className="ml-2 font-bold">
                                    {formatNumber(bookingData.total_qty_pcs)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-blue-200 text-sm">
                                    Total DRUK:
                                  </span>
                                  <span className="ml-2 font-bold">
                                    {formatNumber(bookingData.total_qty_druk)}
                                  </span>
                                </div>
                                <button className="text-white">▲</button>
                              </div>
                            </div>

                            <div className="overflow-x-auto">
                              <table className="min-w-full">
                                <thead>
                                  <tr className="bg-gray-100 text-gray-700">
                                    <th className="py-3 px-4 border-b text-left">
                                      No. IO
                                    </th>
                                    <th className="py-3 px-4 border-b text-left">
                                      Customer
                                    </th>
                                    <th className="py-3 px-4 border-b text-left">
                                      Item
                                    </th>
                                    <th className="py-3 px-4 border-b text-right">
                                      Quantity (PCS)
                                    </th>
                                    <th className="py-3 px-4 border-b text-right">
                                      Quantity (DRUK)
                                    </th>
                                    <th className="py-3 px-4 border-b text-left">
                                      Tanggal
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {bookingData.detail
                                    .slice()
                                    .sort(
                                      (a, b) =>
                                        new Date(a.tanggal).getTime() -
                                        new Date(b.tanggal).getTime(),
                                    ) // Sort by date ascending
                                    .map((detail, index) => (
                                      <tr
                                        key={detail.id}
                                        className={
                                          index % 2 === 0
                                            ? 'bg-white'
                                            : 'bg-gray-50'
                                        }
                                      >
                                        <td className="py-3 px-4 border-b">
                                          {detail.no_io}
                                        </td>
                                        <td className="py-3 px-4 border-b">
                                          {detail.nama_customer}
                                        </td>
                                        <td className="py-3 px-4 border-b">
                                          {detail.nama_item}
                                        </td>
                                        <td className="py-3 px-4 border-b text-right">
                                          {formatNumber(detail.qty_pcs)}
                                        </td>
                                        <td className="py-3 px-4 border-b text-right">
                                          {formatNumber(detail.qty_druk)}
                                        </td>
                                        <td className="py-3 px-4 border-b">
                                          {new Date(
                                            detail.tanggal,
                                          ).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                          })}
                                        </td>
                                      </tr>
                                    ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ) : (
                          // Collapsed box view
                          <div className="bg-white p-4 h-full flex flex-col justify-between hover:bg-blue-50">
                            <div className="bg-blue-600 text-white p-3 rounded-t-lg">
                              <h3 className="font-bold text-lg">{machine}</h3>
                            </div>
                            <div className="flex-grow flex flex-col justify-center p-4">
                              <div className="flex justify-between mb-2">
                                <span className="text-blue-800">
                                  Total PCS:
                                </span>
                                <span className="font-bold text-blue-900">
                                  {formatNumber(bookingData.total_qty_pcs)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-blue-800">
                                  Total DRUK:
                                </span>
                                <span className="font-bold text-blue-900">
                                  {formatNumber(bookingData.total_qty_druk)}
                                </span>
                              </div>
                            </div>
                            <div className="text-center text-blue-600 mt-2">
                              Click to view details ▼
                            </div>
                          </div>
                        )}
                      </div>
                    ),
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default ReportKapasitas;
