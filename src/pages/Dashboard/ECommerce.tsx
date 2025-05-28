import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CardDataStats from '../../components/CardDataStats';
import DefaultLayout from '../../layout/DefaultLayout';
import Production from '../../images/icon/production.svg';
import Maintenance from '../../images/icon/maintenance.svg';
import TableOne from '../../components/Tables/Maintenance/TableIncomingMaintenance';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
  Cell,
} from 'recharts';

const ECommerce: React.FC = () => {
  interface StokSparepart {
    nama_sparepart: string;
    stok: number;
    limit_stok: number;
  }

  interface MasterSparepart {
    nama_sparepart: string;
    posisi_part: string;
    mesin?: { nama_mesin: string };
    umur_grade: number;
    actual_umur: number;
    sisa_umur: number;
    umur_ori?: number;
    grade_2?: string;
  }

  const [stokSparepart, setStokSparepart] = useState<StokSparepart[]>([]);
  const [masterSparepart, setMasterSparepart] = useState<MasterSparepart[]>([]);
  const [loadingStock, setLoadingStock] = useState(true);
  const [loadingMaster, setLoadingMaster] = useState(true);
  const [showLifetimeModal, setShowLifetimeModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);

  // Helper function to format numbers with thousand separators
  const formatNumber = (num: number): string => {
    return num.toLocaleString('id-ID'); // Indonesian locale uses dot as thousand separator
  };

  useEffect(() => {
    getStokSparepart();
    getMasterSparepart();
  }, []);

  async function getStokSparepart() {
    const url = `${import.meta.env.VITE_API_LINK}/stokSparepart`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      setStokSparepart(res.data);
      setLoadingStock(false);
      console.log(res.data);
    } catch (error) {
      console.log(error);
      setLoadingStock(false);
    }
  }

  async function getMasterSparepart() {
    const url = `${import.meta.env.VITE_API_LINK}/master/sparepart`;
    try {
      const res = await axios.get(url, {
        params: {
          jenis_part: 'ganti',
        },
        withCredentials: true,
      });

      // Calculate umur_ori if not provided (actual_umur + sisa_umur)
      const processedData = res.data.map((item: MasterSparepart) => ({
        ...item,
        umur_ori: item.umur_ori || item.actual_umur + item.sisa_umur,
      }));

      setMasterSparepart(processedData);
      setLoadingMaster(false);
      console.log(processedData);
    } catch (error) {
      console.log(error);
      setLoadingMaster(false);
    }
  }

  // Get stock data with configurable limit - simplified to show only stock
  const getStockData = (limit = 10) => {
    if (!stokSparepart || stokSparepart.length === 0) return [];

    return stokSparepart
      .slice()
      .sort((a, b) => a.stok - b.stok)
      .slice(0, limit)
      .map((item) => {
        const displayStok = item.stok < 0 ? 0 : item.stok;
        // Calculate stock percentage compared to limit
        const stockPercentage = Math.round(
          (displayStok / item.limit_stok) * 100,
        );

        return {
          name: item.nama_sparepart,
          stok: displayStok,
          limit_stok: item.limit_stok,
          stockPercentage: stockPercentage,
          // Status for color coding
          status: item.stok <= item.limit_stok ? 'low' : 'safe',
        };
      });
  };

  // Get parts based on remaining lifetime (sisa_umur) with configurable limit
  const getLifetimeData = (limit = 10) => {
    if (!masterSparepart || masterSparepart.length === 0) return [];

    return masterSparepart
      .slice()
      .sort((a, b) => a.sisa_umur - b.sisa_umur) // Sort by remaining lifetime (lowest first)
      .slice(0, limit)
      .map((item) => {
        // Handle negative values for display purposes
        const displaySisaUmur = item.sisa_umur < 0 ? 0 : item.sisa_umur;
        const umurOri = item.actual_umur + item.sisa_umur;

        // Calculate percentages
        const remainingPercentage = Math.round(
          (displaySisaUmur / umurOri) * 100,
        );
        const healthStatus =
          item.sisa_umur <= 0
            ? 'critical'
            : item.sisa_umur < umurOri * 0.2
            ? 'warning'
            : 'healthy';

        return {
          name: item.nama_sparepart,
          posisi: item.posisi_part,
          mesin: item.mesin?.nama_mesin || 'Unknown',
          actual_umur: item.actual_umur,
          sisa_umur: displaySisaUmur,
          real_sisa_umur: item.sisa_umur, // Keep the actual value for tooltips
          umur_ori: umurOri,
          grade_2: item.grade_2 || 'N/A',
          fullName: `${item.nama_sparepart} ${item.posisi_part} ${
            item.mesin?.nama_mesin || ''
          }`,
          displayInfo: `${item.nama_sparepart} (${item.posisi_part})`,
          remainingPercentage: remainingPercentage,
          healthStatus: healthStatus,
        };
      });
  };

  // Get data for chart display
  const stockData = getStockData(10); // Always top 10 for main chart
  const lifetimeData = getLifetimeData(10); // Always top 10 for main chart

  // Custom tooltip for lifetime chart - simplified for sisa_umur only
  const LifetimeTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: any[];
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      // Define status color for health indicator
      const healthColor =
        data.healthStatus === 'critical'
          ? 'bg-red-600'
          : data.healthStatus === 'warning'
          ? 'bg-amber-500'
          : 'bg-green-500';

      return (
        <div className="p-4 bg-white border border-gray-200 rounded-md shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-3 h-3 rounded-full ${healthColor}`}></div>
            <p className="font-bold text-primary text-lg">{data.name}</p>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Position:</span> {data.posisi}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Machine:</span> {data.mesin}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Grade:</span> {data.grade_2}
            </p>
          </div>

          <div className="flex justify-between mb-1">
            <p
              className={`font-medium ${
                data.real_sisa_umur < 0 ? 'text-red-600' : 'text-green-500'
              }`}
            >
              Sisa Umur: {formatNumber(data.real_sisa_umur)}
              {data.real_sisa_umur < 0 && ' (Overdue)'}
            </p>
          </div>

          <div className="mt-2 pt-2 border-t border-gray-200">
            <p
              className={`text-sm font-semibold ${
                data.healthStatus === 'critical'
                  ? 'text-red-600'
                  : data.healthStatus === 'warning'
                  ? 'text-amber-500'
                  : 'text-green-500'
              }`}
            >
              Status:{' '}
              {data.healthStatus === 'critical'
                ? 'Critical - Replacement Required'
                : data.healthStatus === 'warning'
                ? 'Warning - Plan Replacement Soon'
                : 'Healthy'}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for stock chart - simplified for stock only
  const StockTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: any[];
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const stockStatus =
        data.stok <= data.limit_stok ? 'Low Stock' : 'Safe Stock';
      const statusColor =
        data.stok <= data.limit_stok ? 'text-red-500' : 'text-blue-500';

      return (
        <div className="p-4 bg-white border border-gray-200 rounded-md shadow-md">
          <p className="font-bold text-primary text-lg mb-2">{data.name}</p>

          <div className="grid grid-cols-2 gap-4 mb-2">
            <p className={statusColor}>
              <span className="font-medium">Current Stock:</span>{' '}
              {formatNumber(data.stok)}
            </p>
            <p className="text-amber-500">
              <span className="font-medium">Minimum Stock:</span>{' '}
              {formatNumber(data.limit_stok)}
            </p>
          </div>

          <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-200">
            <p className={`${statusColor} font-semibold`}>
              Status: {stockStatus}
            </p>
            <p className="text-gray-600 font-medium">
              {data.stockPercentage}% of minimum
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom formatter for X-axis labels
  const formatXAxisLabel = (value: number) => {
    return formatNumber(value);
  };

  // Custom label formatter for bar chart labels
  const CustomLabel = (props: any) => {
    const { x, y, width, height, value } = props;
    const formattedValue = formatNumber(value);

    return (
      <text
        x={x + width / 2}
        y={y + height / 2}
        fill="#FFFFFF"
        textAnchor="middle"
        dy={0}
        fontSize="12"
        fontWeight="bold"
      >
        {formattedValue}
      </text>
    );
  };

  // Modal component for full chart display
  const ChartModal = ({
    isOpen,
    onClose,
    title,
    children,
  }: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
  }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
        <div className="bg-white rounded-lg w-screen h-screen flex flex-col">
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-primary">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
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
          <div className="flex-1 overflow-y-auto p-4">{children}</div>
        </div>
      </div>
    );
  };

  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px] ">
        Overview Dashboard
      </p>
      <div className="flex gap-3 flex-wrap">
        <CardDataStats title="Total views" total="$3.456K" rate="0.43%" levelUp>
          <div className="flex gap-3">
            <img src={Production} alt="Logo" />
            <p className="text-[14px] text-[#0065DE]">Production</p>
          </div>
        </CardDataStats>
        <CardDataStats title="Total Profit" total="$45,2K" rate="4.35%" levelUp>
          <div className="flex gap-3">
            <img src={Maintenance} alt="Logo" />
            <p className="text-[14px] text-[#0065DE]">Maintenance</p>
          </div>
        </CardDataStats>
      </div>

      <div className="w-full p-4 bg-white my-[26px] rounded-[10px] flex flex-col">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <img src={Production} alt="Logo" className="w-5" />
            <p className="text-primary text-lg font-medium">
              Sparepart Remaining Lifetime
            </p>
          </div>
          <button
            onClick={() => setShowLifetimeModal(true)}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            View Full Chart
          </button>
        </div>
        <div className="flex w-full p-5">
          {loadingMaster ? (
            <div className="flex justify-center items-center h-full">
              Loading...
            </div>
          ) : (
            <div className="w-full">
              <ResponsiveContainer width="100%" height={400}>
                <RechartsBarChart
                  data={lifetimeData}
                  layout="vertical"
                  margin={{
                    top: 15,
                    right: 60,
                    left: 0,
                    bottom: 5,
                  }}
                  barSize={20}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    tickFormatter={formatXAxisLabel}
                    label={{
                      value: 'Remaining Lifetime',
                      position: 'insideBottom',
                      offset: -5,
                    }}
                  />
                  <YAxis
                    dataKey="displayInfo"
                    type="category"
                    width={270}
                    tick={{ fontSize: 12 }}
                    orientation="left"
                  />
                  <Tooltip content={<LifetimeTooltip />} />
                  <Legend />
                  <Bar
                    dataKey="sisa_umur"
                    name="Sisa Umur"
                    radius={[0, 4, 4, 0]}
                  >
                    {lifetimeData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.healthStatus === 'critical'
                            ? '#FF4D4F'
                            : entry.healthStatus === 'warning'
                            ? '#FFBB28'
                            : '#52C41A'
                        }
                      />
                    ))}
                    <LabelList
                      dataKey="sisa_umur"
                      position="inside"
                      fill="#FFFFFF"
                      style={{ fontSize: '12px', fontWeight: 'bold' }}
                      formatter={formatNumber}
                    />
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="w-full p-4 bg-white my-[26px] rounded-[10px] flex flex-col">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <img src={Maintenance} alt="Logo" className="w-5" />
            <p className="text-primary text-lg font-medium">
              Sparepart Current Stock
            </p>
          </div>
          <button
            onClick={() => setShowStockModal(true)}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            View Full Chart
          </button>
        </div>
        <div className="w-full h-full p-5">
          {loadingStock ? (
            <div className="flex justify-center items-center h-full">
              Loading...
            </div>
          ) : (
            <div className="w-full">
              <ResponsiveContainer width="100%" height={400}>
                <RechartsBarChart
                  data={stockData}
                  layout="vertical"
                  margin={{
                    top: 15,
                    right: 60,
                    left: 0,
                    bottom: 5,
                  }}
                  barSize={20}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    tickFormatter={formatXAxisLabel}
                    label={{
                      value: 'Stock Quantity',
                      position: 'insideBottom',
                      offset: -5,
                    }}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={270}
                    tick={{ fontSize: 12 }}
                    orientation="left"
                  />
                  <Tooltip content={<StockTooltip />} />
                  <Legend />
                  <Bar
                    dataKey="stok"
                    name="Current Stock"
                    radius={[0, 4, 4, 0]}
                  >
                    {stockData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.status === 'low' ? '#FF4D4F' : '#0065DE'}
                      />
                    ))}
                    <LabelList
                      dataKey="stok"
                      position="inside"
                      fill="#FFFFFF"
                      style={{ fontSize: '12px', fontWeight: 'bold' }}
                      formatter={formatNumber}
                    />
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Full Lifetime Chart - Shows only sisa_umur */}
      <ChartModal
        isOpen={showLifetimeModal}
        onClose={() => setShowLifetimeModal(false)}
        title="Complete Sparepart Remaining Lifetime"
      >
        <div className="h-full overflow-y-auto">
          <RechartsBarChart
            data={getLifetimeData(masterSparepart.length)}
            layout="vertical"
            width={window.innerWidth - 100}
            height={Math.max(masterSparepart.length * 40, 800)}
            margin={{
              top: 15,
              right: 60,
              left: 0,
              bottom: 20,
            }}
            barSize={20}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              tickFormatter={formatXAxisLabel}
              label={{
                value: 'Remaining Lifetime',
                position: 'insideBottom',
                offset: -5,
              }}
            />
            <YAxis
              dataKey="displayInfo"
              type="category"
              width={290}
              tick={{ fontSize: 14 }}
            />
            <Tooltip content={<LifetimeTooltip />} />
            <Legend />
            <Bar dataKey="sisa_umur" name="Sisa Umur" radius={[0, 4, 4, 0]}>
              {getLifetimeData(masterSparepart.length).map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.healthStatus === 'critical'
                      ? '#FF4D4F'
                      : entry.healthStatus === 'warning'
                      ? '#FFBB28'
                      : '#52C41A'
                  }
                />
              ))}
              <LabelList
                dataKey="sisa_umur"
                position="inside"
                fill="#FFFFFF"
                style={{ fontSize: '14px', fontWeight: 'bold' }}
                formatter={formatNumber}
              />
            </Bar>
          </RechartsBarChart>
        </div>
      </ChartModal>

      {/* Modal for Full Stock Chart - Shows only stok */}
      <ChartModal
        isOpen={showStockModal}
        onClose={() => setShowStockModal(false)}
        title="Complete Sparepart Current Stock"
      >
        <div className="h-full overflow-y-auto">
          <ResponsiveContainer
            width="100%"
            height={Math.max(stokSparepart.length * 40, 800)}
          >
            <RechartsBarChart
              data={getStockData(stokSparepart.length)}
              layout="vertical"
              margin={{
                top: 15,
                right: 60,
                left: 0,
                bottom: 20,
              }}
              barSize={20}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                tickFormatter={formatXAxisLabel}
                label={{
                  value: 'Stock Quantity',
                  position: 'insideBottom',
                  offset: -5,
                }}
              />
              <YAxis
                dataKey="name"
                type="category"
                width={290}
                tick={{ fontSize: 14 }}
              />
              <Tooltip content={<StockTooltip />} />
              <Legend />
              <Bar dataKey="stok" name="Current Stock" radius={[0, 4, 4, 0]}>
                {getStockData(stokSparepart.length).map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.status === 'low' ? '#FF4D4F' : '#0065DE'}
                  />
                ))}
                <LabelList
                  dataKey="stok"
                  position="inside"
                  fill="#FFFFFF"
                  style={{ fontSize: '14px', fontWeight: 'bold' }}
                  formatter={formatNumber}
                />
              </Bar>
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </ChartModal>

      <TableOne />
    </DefaultLayout>
  );
};

export default ECommerce;
