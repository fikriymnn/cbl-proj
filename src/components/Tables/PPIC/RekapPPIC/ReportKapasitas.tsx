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
  LineChart,
  Line,
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

interface MonthRangeData {
  month: number;
  year: number;
  monthLabel: string;
  data: ApiResponse;
}

interface AggregatedData {
  data_booking: Record<string, MachineBooking>;
  sisa_kapasitas: MachineRemainingCapacity[];
  monthly_data: MonthRangeData[];
}

function ReportKapasitas() {
  // State for filter parameters
  const [startMonth, setStartMonth] = useState(new Date().getMonth() + 1);
  const [startYear, setStartYear] = useState(new Date().getFullYear());
  const [endMonth, setEndMonth] = useState(new Date().getMonth() + 1);
  const [endYear, setEndYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(false);
  const [aggregatedData, setAggregatedData] = useState<AggregatedData | null>(
    null,
  );
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);
  const [showMonthlyDetails, setShowMonthlyDetails] = useState<
    Record<string, boolean>
  >({});

  // Function to get month range
  const getMonthRange = (
    startMonth: number,
    startYear: number,
    endMonth: number,
    endYear: number,
  ) => {
    const months = [];
    let currentMonth = startMonth;
    let currentYear = startYear;

    while (
      currentYear < endYear ||
      (currentYear === endYear && currentMonth <= endMonth)
    ) {
      months.push({ month: currentMonth, year: currentYear });
      currentMonth++;
      if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
      }
    }

    return months;
  };

  // Function to fetch data from API for a single month
  async function fetchSingleMonth(
    month: number,
    year: number,
  ): Promise<ApiResponse> {
    const url = `${
      import.meta.env.VITE_API_LINK || '/api'
    }/ppic/reportKapasitas`;
    const res = await axios.get(url, {
      params: { bulan: month, tahun: year },
      withCredentials: true,
    });
    return res.data;
  }

  // Function to fetch data for month range
  async function getReportKapasitasRange() {
    setIsLoading(true);
    try {
      const monthRange = getMonthRange(
        startMonth,
        startYear,
        endMonth,
        endYear,
      );

      // Fetch data for all months in parallel
      const promises = monthRange.map(({ month, year }) =>
        fetchSingleMonth(month, year).then((data) => ({
          month,
          year,
          monthLabel: `${getMonthName(month)} ${year}`,
          data,
        })),
      );

      const monthlyResults = await Promise.all(promises);

      // Aggregate the data
      const aggregated = aggregateMonthlyData(monthlyResults);
      setAggregatedData(aggregated);

      console.log('Aggregated data:', aggregated);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  // Function to aggregate data from multiple months
  const aggregateMonthlyData = (
    monthlyResults: MonthRangeData[],
  ): AggregatedData => {
    const aggregatedBookings: Record<string, MachineBooking> = {};
    const machineCapacities: Record<string, MachineRemainingCapacity> = {};

    monthlyResults.forEach(({ data }) => {
      // Aggregate booking data
      Object.entries(data.data_booking).forEach(([machine, booking]) => {
        if (!aggregatedBookings[machine]) {
          aggregatedBookings[machine] = {
            mesin: machine,
            total_qty_pcs: 0,
            total_qty_druk: 0,
            detail: [],
          };
        }

        aggregatedBookings[machine].total_qty_pcs += booking.total_qty_pcs;
        aggregatedBookings[machine].total_qty_druk += booking.total_qty_druk;
        aggregatedBookings[machine].detail.push(...booking.detail);
      });

      // For capacity, we'll use the average across months
      data.sisa_kapasitas.forEach((capacity) => {
        if (!machineCapacities[capacity.mesin]) {
          machineCapacities[capacity.mesin] = {
            mesin: capacity.mesin,
            kapasitas_mesin: capacity.kapasitas_mesin,
            total_kapasitas: 0,
            sisa_kapasitas_percent: 0,
          };
        }

        // Sum up for averaging later
        machineCapacities[capacity.mesin].total_kapasitas +=
          capacity.total_kapasitas;
        machineCapacities[capacity.mesin].sisa_kapasitas_percent +=
          capacity.sisa_kapasitas_percent;
      });
    });

    // Calculate averages for capacity
    const avgCapacities = Object.values(machineCapacities).map((capacity) => ({
      ...capacity,
      kapasitas_mesin: capacity.kapasitas_mesin * monthlyResults.length, // Total capacity for the period
      total_kapasitas: capacity.total_kapasitas / monthlyResults.length,
      sisa_kapasitas_percent:
        capacity.sisa_kapasitas_percent / monthlyResults.length,
    }));

    return {
      data_booking: aggregatedBookings,
      sisa_kapasitas: avgCapacities,
      monthly_data: monthlyResults,
    };
  };

  // Format number with thousand separator
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

  const getMonthName = (month: number): string => {
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
    return months[month - 1];
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
  const startYearRange = currentYear - 10;
  const endYearRange = currentYear + 5;
  const years = Array.from(
    { length: endYearRange - startYearRange + 1 },
    (_, i) => startYearRange + i,
  );

  // Fetch data when filters change
  useEffect(() => {
    getReportKapasitasRange();
  }, [startMonth, startYear, endMonth, endYear]);

  // Handle machine selection
  const handleMachineSelect = (machine: string) => {
    if (selectedMachine === machine) {
      setSelectedMachine(null);
    } else {
      setSelectedMachine(machine);
    }
  };

  // Toggle showing monthly details for a specific machine
  const toggleMonthlyDetails = (machine: string) => {
    setShowMonthlyDetails({
      ...showMonthlyDetails,
      [machine]: !showMonthlyDetails[machine],
    });
  };

  // Get monthly data for a specific machine
  const getMonthlyDataForMachine = (machineName: string) => {
    if (!aggregatedData?.monthly_data) return [];

    return aggregatedData.monthly_data.map((monthData) => {
      const machineCapacity = monthData.data.sisa_kapasitas.find(
        (capacity) => capacity.mesin === machineName,
      );

      if (!machineCapacity) {
        return {
          month: monthData.monthLabel,
          kapasitas_mesin: 0,
          kapasitas_terpakai: 0,
          kapasitas_tersisa: 0,
          sisa_kapasitas_percent: 0,
        };
      }

      const usedCapacity =
        machineCapacity.kapasitas_mesin -
        (machineCapacity.kapasitas_mesin *
          machineCapacity.sisa_kapasitas_percent) /
          100;
      const remainingCapacity =
        (machineCapacity.kapasitas_mesin *
          machineCapacity.sisa_kapasitas_percent) /
        100;

      return {
        month: monthData.monthLabel,
        kapasitas_mesin: machineCapacity.kapasitas_mesin,
        kapasitas_terpakai: usedCapacity,
        kapasitas_tersisa: remainingCapacity,
        sisa_kapasitas_percent: machineCapacity.sisa_kapasitas_percent,
      };
    });
  };

  // Process the data for the capacity chart
  const getCapacityChartData = () => {
    if (!aggregatedData?.sisa_kapasitas) return [];

    return aggregatedData.sisa_kapasitas.map((item) => ({
      name: item.mesin,
      usedCapacity: 100 - item.sisa_kapasitas_percent,
      remainingCapacity: item.sisa_kapasitas_percent,
      totalCapacity: item.kapasitas_mesin,
    }));
  };

  // Process data for monthly trend chart
  const getMonthlyTrendData = () => {
    if (!aggregatedData?.monthly_data) return [];

    const machines = [
      ...new Set(aggregatedData.sisa_kapasitas.map((item) => item.mesin)),
    ];

    return aggregatedData.monthly_data.map(({ monthLabel, data }) => {
      const monthData: any = { month: monthLabel };

      machines.forEach((machine) => {
        const machineData = data.sisa_kapasitas.find(
          (item) => item.mesin === machine,
        );
        if (machineData) {
          monthData[machine] = 100 - machineData.sisa_kapasitas_percent;
        }
      });

      return monthData;
    });
  };

  // Define color scheme for chart
  const getCapacityColor = (percent: number) => {
    if (percent <= 10) return '#22c55e'; // Red for critical
    if (percent <= 50) return '#22c55e'; // Amber for warning
    if (percent <= 75) return '#22c55e'; // Blue for moderate
    return '#22c55e'; // Green for good
  };

  // Calculate total capacity utilization
  const getTotalUtilization = () => {
    if (!aggregatedData?.sisa_kapasitas)
      return { used: 0, remaining: 0, total: 0 };

    const totalCapacity = aggregatedData.sisa_kapasitas.reduce(
      (sum, item) => sum + item.kapasitas_mesin,
      0,
    );
    const used = aggregatedData.sisa_kapasitas.reduce((sum, item) => {
      const usedPercent = 100 - item.sisa_kapasitas_percent;
      return sum + (item.kapasitas_mesin * usedPercent) / 100;
    }, 0);

    return {
      used,
      remaining: totalCapacity - used,
      total: totalCapacity,
    };
  };

  const getDateRangeLabel = () => {
    if (startMonth === endMonth && startYear === endYear) {
      return `${getMonthName(startMonth)} ${startYear}`;
    }
    return `${getMonthName(startMonth)} ${startYear} - ${getMonthName(
      endMonth,
    )} ${endYear}`;
  };

  return (
    <div className="p-4">
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-4">Report Kapasitas</h1>

            {/* Date Range Filters */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="text-lg font-semibold mb-3">Filter Periode</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Start Date */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-2">
                    Dari:
                  </label>
                  <div className="flex space-x-2">
                    <select
                      className="border rounded p-2 flex-1"
                      value={startMonth}
                      onChange={(e) => setStartMonth(parseInt(e.target.value))}
                    >
                      {months.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                    <select
                      className="border rounded p-2 flex-1"
                      value={startYear}
                      onChange={(e) => setStartYear(parseInt(e.target.value))}
                    >
                      {years.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* End Date */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-2">
                    Sampai:
                  </label>
                  <div className="flex space-x-2">
                    <select
                      className="border rounded p-2 flex-1"
                      value={endMonth}
                      onChange={(e) => setEndMonth(parseInt(e.target.value))}
                    >
                      {months.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                    <select
                      className="border rounded p-2 flex-1"
                      value={endYear}
                      onChange={(e) => setEndYear(parseInt(e.target.value))}
                    >
                      {years.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Periode:{' '}
                  <span className="font-semibold">{getDateRangeLabel()}</span>
                </div>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                  onClick={getReportKapasitasRange}
                >
                  Tampilkan
                </button>
              </div>
            </div>
          </div>

          {aggregatedData && (
            <>
              {/* Capacity Overview Dashboard */}
              <div className="mb-8 bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">
                  Dashboard Kapasitas - {getDateRangeLabel()}
                </h2>

                {/* Total Capacity Section */}
                <div className="bg-white p-6 rounded-lg shadow mb-6">
                  <h2 className="text-xl font-bold mb-4">
                    KAPASITAS TOTAL PERIODE
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {aggregatedData.sisa_kapasitas.map((item) => (
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

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="text-sm font-medium text-blue-800 mb-2">
                      Total Kapasitas Periode
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

                {/* Capacity Bar Chart */}
                <div className="h-64 mb-6">
                  <h3 className="text-lg font-semibold mb-2">
                    Kapasitas Per Mesin (Rata-rata)
                  </h3>
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
                            return [`${value.toFixed(1)}%`, 'Terpakai'];
                          if (name === 'remainingCapacity')
                            return [`${value.toFixed(1)}%`, 'Tersisa'];
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
                        fill="#22c55e"
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

                {/* Monthly Trend Chart - Only show if multiple months */}
                {aggregatedData.monthly_data.length > 1 && (
                  <div className="h-80 mb-4">
                    <h3 className="text-lg font-semibold mb-2">
                      Tren Utilisasi Bulanan (%)
                    </h3>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={getMonthlyTrendData()}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis
                          label={{
                            value: 'Utilisasi (%)',
                            angle: -90,
                            position: 'insideLeft',
                          }}
                          domain={[0, 100]}
                        />
                        <Tooltip
                          formatter={(value: any, name: string) => [
                            `${Number(value).toFixed(1)}%`,
                            name,
                          ]}
                        />
                        <Legend />
                        {aggregatedData.sisa_kapasitas.map((item, index) => (
                          <Bar
                            key={item.mesin}
                            dataKey={item.mesin}
                            fill={`hsl(${(index * 137.5) % 360}, 70%, 50%)`}
                            name={item.mesin}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Capacity Tables */}
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">
                  Kapasitas Per Mesin (Rata-rata Periode)
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-300 shadow-sm rounded-lg">
                    <thead>
                      <tr className="bg-gray-100 text-gray-700">
                        <th className="py-3 px-4 border-b text-left">Mesin</th>
                        <th className="py-3 px-4 border-b text-right">
                          Kapasitas Total Periode
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
                        <th className="py-3 px-4 border-b text-center">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {aggregatedData.sisa_kapasitas.map((item, index) => {
                        const usedCapacity =
                          item.kapasitas_mesin -
                          (item.kapasitas_mesin * item.sisa_kapasitas_percent) /
                            100;
                        const remainingCapacity =
                          (item.kapasitas_mesin * item.sisa_kapasitas_percent) /
                          100;

                        return (
                          <React.Fragment key={item.mesin}>
                            <tr
                              className={`${
                                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                              } hover:bg-blue-50`}
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
                                    : item.sisa_kapasitas_percent > 10
                                    ? 'text-amber-600'
                                    : 'text-red-600'
                                }`}
                              >
                                {item.sisa_kapasitas_percent.toFixed(1)}%
                              </td>
                              <td className="py-3 px-4 border-b text-center">
                                <button
                                  onClick={() =>
                                    toggleMonthlyDetails(item.mesin)
                                  }
                                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                                >
                                  {showMonthlyDetails[item.mesin]
                                    ? 'Hide'
                                    : 'Detail'}
                                </button>
                              </td>
                            </tr>

                            {/* Monthly Details Row */}
                            {showMonthlyDetails[item.mesin] && (
                              <tr>
                                <td colSpan={6} className="py-0 px-0 border-b">
                                  <div className="bg-gray-50 p-4 border-l-4 border-blue-500">
                                    <h4 className="font-semibold text-blue-800 mb-3">
                                      Detail Bulanan - {item.mesin}
                                    </h4>
                                    <div className="overflow-x-auto">
                                      <table className="min-w-full bg-white border border-gray-200 rounded">
                                        <thead>
                                          <tr className="bg-blue-100 text-blue-800">
                                            <th className="py-2 px-3 border-b text-left text-sm">
                                              Bulan
                                            </th>
                                            <th className="py-2 px-3 border-b text-right text-sm">
                                              Kapasitas Mesin
                                            </th>
                                            <th className="py-2 px-3 border-b text-right text-sm">
                                              Kapasitas Terpakai
                                            </th>
                                            <th className="py-2 px-3 border-b text-right text-sm">
                                              Kapasitas Tersisa
                                            </th>
                                            <th className="py-2 px-3 border-b text-right text-sm">
                                              Sisa (%)
                                            </th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {getMonthlyDataForMachine(
                                            item.mesin,
                                          ).map((monthData, monthIndex) => (
                                            <tr
                                              key={monthData.month}
                                              className={
                                                monthIndex % 2 === 0
                                                  ? 'bg-white'
                                                  : 'bg-gray-50'
                                              }
                                            >
                                              <td className="py-2 px-3 border-b text-sm">
                                                {monthData.month}
                                              </td>
                                              <td className="py-2 px-3 border-b text-right text-sm">
                                                {formatNumber(
                                                  monthData.kapasitas_mesin,
                                                )}
                                              </td>
                                              <td className="py-2 px-3 border-b text-right text-sm">
                                                {formatNumber(
                                                  monthData.kapasitas_terpakai,
                                                )}
                                              </td>
                                              <td className="py-2 px-3 border-b text-right text-sm">
                                                {formatNumber(
                                                  monthData.kapasitas_tersisa,
                                                )}
                                              </td>
                                              <td
                                                className={`py-2 px-3 border-b text-right text-sm font-bold ${
                                                  monthData.sisa_kapasitas_percent >
                                                  75
                                                    ? 'text-green-600'
                                                    : monthData.sisa_kapasitas_percent >
                                                      50
                                                    ? 'text-blue-600'
                                                    : monthData.sisa_kapasitas_percent >
                                                      10
                                                    ? 'text-amber-600'
                                                    : 'text-red-600'
                                                }`}
                                              >
                                                {monthData.sisa_kapasitas_percent.toFixed(
                                                  1,
                                                )}
                                                %
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Detail Booking Section */}
              <div>
                <h2 className="text-xl font-bold mb-4">
                  Detail Booking Periode ({getDateRangeLabel()})
                </h2>

                {/* Machine boxes grid layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {Object.entries(aggregatedData.data_booking).map(
                    ([machine, bookingData]) => (
                      <div
                        key={machine}
                        className={`rounded-lg shadow cursor-pointer transition-all duration-300 overflow-hidden ${
                          selectedMachine === machine ? 'col-span-full' : ''
                        }`}
                        onClick={() => handleMachineSelect(machine)}
                      >
                        {selectedMachine === machine ? (
                          // Expanded view with table
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
                                    )
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
