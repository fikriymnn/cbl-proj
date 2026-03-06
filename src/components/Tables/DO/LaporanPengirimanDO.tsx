import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import { Pagination, Stack } from '@mui/material';

// --- Interfaces ---

interface SOData {
  id: number;
  no_so: string;
  tgl_input_po: string;
}

interface DeliveryOrderGroup {
  id: number;
  alamat: string;
  customer: string;
  kota: string;
  no_do: string;
  no_io: string;
  no_jo: string;
  no_po_customer: string;
  no_so: string;
  note: string;
  produk: string;
  status: string;
  tgl_do: string;
  createdAt: string;
  updatedAt: string;
  id_approve: number;
  id_create: number;
  id_customer: number;
  id_io: number;
  id_kendaraan: number;
  id_kenek: number;
  id_kenek_2: number;
  id_produk: number;
  id_so: number;
  id_supir: number;
  is_active: boolean;
  is_tax: boolean;
}

interface DeliveryOrder {
  id: number;
  id_do_group: number;
  isi_1: number | null;
  isi_2: number | null;
  isi_3: number | null;
  jumlah_qty: number | null;
  no_io: string;
  no_jo: string;
  note: string | null;
  pack_1: number | null;
  pack_2: number | null;
  pack_3: number | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ReportDOItem {
  id_so: number;
  no_so: string;
  no_po_customer: string;
  customer: string;
  produk: string;
  po_qty: number;
  qty_diff: number;
  qty_status: string;
  tgl_pengiriman: string;
  toleransi_pengiriman: string;
  total_jumlah_qty: number;
  id_customer: number;
  id_produk: number;
  so: SOData;
  delivery_order_groups: DeliveryOrderGroup[];
  delivery_orders: DeliveryOrder[];
}

interface ReportDOResponse {
  current_page: number;
  data: ReportDOItem[];
  limit: number;
  status: number;
  success: boolean;
  total_data: number;
  total_page: number;
}

const LaporanPengirimanDO: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [reportData, setReportData] = useState<ReportDOItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const toInputDate = (d: Date) => d.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState<string>(
    toInputDate(firstDayOfMonth),
  );
  const [endDate, setEndDate] = useState<string>(toInputDate(today));

  useEffect(() => {
    fetchReportData();
  }, [page, limit]);

  const fetchReportData = async (): Promise<void> => {
    try {
      setLoading(true);
      const res: AxiosResponse<ReportDOResponse> = await axios.get(
        `${import.meta.env.VITE_API_LINK}/reportDeliveryOrder`,
        {
          params: { start_date: startDate, end_date: endDate, page, limit },
          withCredentials: true,
        },
      );
      setReportData(res.data.data || []);
      setTotalPages(res.data.total_page || 1);
    } catch (error) {
      console.error('Error fetching report DO data:', error);
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchReportData();
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const toggleRow = (id_so: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.has(id_so) ? next.delete(id_so) : next.add(id_so);
      return next;
    });
  };

  const formatDate = (s: string | null | undefined): string => {
    if (!s) return '-';
    const d = new Date(s);
    return `${String(d.getDate()).padStart(2, '0')}/${String(
      d.getMonth() + 1,
    ).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const fmt = (n: number | null | undefined): string => {
    if (n === null || n === undefined) return '-';
    return n.toLocaleString('id-ID');
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      selesai: 'bg-green-500 text-white',
      done: 'bg-green-500 text-white',
      'kurang qty': 'bg-yellow-400 text-white',
      pending: 'bg-gray-400 text-white',
      progress: 'bg-blue-400 text-white',
    };
    const key = status?.toLowerCase() ?? '';
    const displayLabel =
      key === 'done' ? 'Selesai' : key === 'kurang qty' ? 'Kurang Qty' : status;
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
          map[key] || 'bg-gray-300 text-gray-800'
        }`}
      >
        {displayLabel}
      </span>
    );
  };

  const getProgressBadge = (progress: number) => {
    const color = progress > 100 ? 'bg-purple-500' : 'bg-blue-500';
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${color}`}
      >
        {progress}%
      </span>
    );
  };

  const calcProgress = (item: ReportDOItem) => {
    if (!item.po_qty) return 0;
    return Math.round((item.total_jumlah_qty / item.po_qty) * 100);
  };

  const calcStatus = (item: ReportDOItem): string => {
    if (item.total_jumlah_qty > item.po_qty) return 'Over Qty';
    const p = calcProgress(item);
    if (p >= 100) return 'Selesai';
    if (p > 0) return 'Kurang Qty';
    return 'Pending';
  };

  const sisaPO = (item: ReportDOItem) => item.po_qty - item.total_jumlah_qty;

  // Get first DO group's no_so and no_jo for expanded header
  const getFirstDOG = (item: ReportDOItem) =>
    item.delivery_order_groups[0] ?? null;

  const PaginationBar = () => (
    <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 mt-4 pb-4 px-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Rows per page:</span>
        <div className="flex gap-1">
          {[10, 25, 50, 100].map((s) => (
            <button
              key={s}
              onClick={() => handleLimitChange(s)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                limit === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <Stack spacing={2}>
        <Pagination
          count={totalPages}
          color="primary"
          page={page}
          onChange={(_e, i) => setPage(i)}
          size="small"
        />
      </Stack>
    </div>
  );

  return (
    <div>
      {/* Filter */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-600 font-medium">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-600 font-medium">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          Cari
        </button>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-xs">
            <thead className="bg-gray-50">
              <tr>
                {/* Act */}
                <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase whitespace-nowrap w-16">
                  Act
                </th>
                {/* Tgl Kirim Cust */}
                <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase whitespace-nowrap">
                  Tgl Kirim
                  <br />
                  Cust
                  <span className="ml-1 opacity-40">↑↓</span>
                </th>
                {/* NO PO */}
                <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase whitespace-nowrap">
                  NO PO<span className="ml-1 opacity-40">↑↓</span>
                </th>
                {/* Tanggal PO */}
                <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase whitespace-nowrap">
                  Tanggal PO<span className="ml-1 opacity-40">↑↓</span>
                </th>
                {/* SO / JO / IO combined */}
                <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase whitespace-nowrap">
                  NO SO / JO / IO<span className="ml-1 opacity-40">↑↓</span>
                </th>
                {/* Pemesan */}
                <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase whitespace-nowrap">
                  Pemesan<span className="ml-1 opacity-40">↑↓</span>
                </th>
                {/* Produk */}
                <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase whitespace-nowrap">
                  Produk<span className="ml-1 opacity-40">↑↓</span>
                </th>
                {/* Qty PO */}
                <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase whitespace-nowrap">
                  Qty PO<span className="ml-1 opacity-40">↑↓</span>
                </th>
                {/* Barang Kirim */}
                <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase whitespace-nowrap">
                  Barang
                  <br />
                  Kirim<span className="ml-1 opacity-40">↑↓</span>
                </th>
                {/* Sisa PO */}
                <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase whitespace-nowrap">
                  Sisa PO<span className="ml-1 opacity-40">↑↓</span>
                </th>
                {/* Status */}
                <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase whitespace-nowrap">
                  Status<span className="ml-1 opacity-40">↑↓</span>
                </th>
                {/* Progress */}
                <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase whitespace-nowrap">
                  Progress<span className="ml-1 opacity-40">↑↓</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                    </div>
                  </td>
                </tr>
              ) : reportData.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-6 text-center text-gray-500">
                    No data available
                  </td>
                </tr>
              ) : (
                reportData.map((item) => {
                  const isExpanded = expandedRows.has(item.id_so);
                  const dog = getFirstDOG(item);
                  const progress = calcProgress(item);
                  const status = calcStatus(item);

                  return (
                    <React.Fragment key={item.id_so}>
                      <tr
                        className={`hover:bg-gray-50 ${
                          isExpanded ? 'bg-blue-50' : ''
                        }`}
                      >
                        {/* Act */}
                        <td className="px-2 py-2 whitespace-nowrap">
                          <div className="flex gap-1 items-center">
                            <button
                              onClick={() => toggleRow(item.id_so)}
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold transition-colors text-sm leading-none ${
                                isExpanded
                                  ? 'bg-red-500 hover:bg-red-600'
                                  : 'bg-green-500 hover:bg-green-600'
                              }`}
                            >
                              {isExpanded ? '−' : '+'}
                            </button>
                            <button className="w-6 h-6 rounded-md bg-orange-400 hover:bg-orange-500 flex items-center justify-center text-white font-bold text-xs">
                              i
                            </button>
                          </div>
                        </td>

                        {/* Tgl Kirim Cust */}
                        <td className="px-2 py-2 whitespace-nowrap text-gray-900">
                          {formatDate(item.tgl_pengiriman)}
                        </td>

                        {/* NO PO */}
                        <td className="px-2 py-2 whitespace-nowrap text-gray-900">
                          {item.no_po_customer || '-'}
                        </td>

                        {/* Tanggal PO */}
                        <td className="px-2 py-2 whitespace-nowrap text-gray-900">
                          {formatDate(item.so?.tgl_input_po)}
                        </td>

                        {/* NO SO / JO / IO stacked */}
                        <td className="px-2 py-2 whitespace-nowrap text-gray-900">
                          <div>{item.no_so || '-'}</div>
                          <div className="text-gray-500">
                            {dog?.no_jo || '-'}
                          </div>
                          <div className="text-gray-400">
                            {dog?.no_io || '-'}
                          </div>
                        </td>

                        {/* Pemesan */}
                        <td className="px-2 py-2 whitespace-nowrap text-gray-900">
                          {item.customer || '-'}
                        </td>

                        {/* Produk */}
                        <td className="px-2 py-2 text-gray-900 max-w-[200px]">
                          <div className="whitespace-normal leading-tight">
                            {item.produk || '-'}
                          </div>
                        </td>

                        {/* Qty PO */}
                        <td className="px-2 py-2 whitespace-nowrap text-gray-900 text-right">
                          {fmt(item.po_qty)}
                        </td>

                        {/* Barang Kirim */}
                        <td className="px-2 py-2 whitespace-nowrap text-gray-900 text-right">
                          {fmt(item.total_jumlah_qty)}
                        </td>

                        {/* Sisa PO */}
                        <td className="px-2 py-2 whitespace-nowrap text-gray-900 text-right">
                          {fmt(sisaPO(item))}
                        </td>

                        {/* Status */}
                        <td className="px-2 py-2 whitespace-nowrap">
                          {getStatusBadge(status)}
                        </td>

                        {/* Progress */}
                        <td className="px-2 py-2 whitespace-nowrap">
                          {getProgressBadge(progress)}
                        </td>
                      </tr>

                      {/* Expanded sub-table — exactly like image 2 */}
                      {isExpanded && (
                        <tr>
                          <td
                            colSpan={12}
                            className="bg-gray-50 px-6 py-4 border-b border-gray-200"
                          >
                            {/* Header line */}
                            <p className="text-sm font-semibold text-gray-700 mb-3 text-center">
                              JO: {dog?.no_jo || '-'}&nbsp;–&nbsp;SO:{' '}
                              {item.no_so || '-'}&nbsp;–&nbsp;Tgl Kirim:{' '}
                              {formatDate(item.tgl_pengiriman)}
                            </p>

                            {/* Sub table */}
                            <table className="w-full text-xs border border-gray-200 rounded overflow-hidden">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="px-4 py-2 text-left font-medium text-gray-600 border-b border-gray-200 w-12">
                                    No
                                  </th>
                                  <th className="px-4 py-2 text-left font-medium text-gray-600 border-b border-gray-200">
                                    No.DO
                                  </th>
                                  <th className="px-4 py-2 text-left font-medium text-gray-600 border-b border-gray-200">
                                    Tgl DO
                                  </th>
                                  <th className="px-4 py-2 text-left font-medium text-gray-600 border-b border-gray-200">
                                    Kirim
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white">
                                {item.delivery_order_groups.length === 0 ? (
                                  <tr>
                                    <td
                                      colSpan={4}
                                      className="px-4 py-3 text-center text-gray-500"
                                    >
                                      Tidak ada data DO
                                    </td>
                                  </tr>
                                ) : (
                                  item.delivery_order_groups.map(
                                    (dog_row, idx) => {
                                      const matched = item.delivery_orders.find(
                                        (d) => d.id_do_group === dog_row.id,
                                      );
                                      return (
                                        <tr
                                          key={dog_row.id}
                                          className="border-b border-gray-100 last:border-0"
                                        >
                                          <td className="px-4 py-2 text-gray-700">
                                            {idx + 1}
                                          </td>
                                          <td className="px-4 py-2 text-gray-700">
                                            {dog_row.no_do}
                                          </td>
                                          <td className="px-4 py-2 text-gray-700">
                                            {formatDate(dog_row.tgl_do)}
                                          </td>
                                          <td className="px-4 py-2 text-gray-700">
                                            {fmt(matched?.jumlah_qty ?? null)}
                                          </td>
                                        </tr>
                                      );
                                    },
                                  )
                                )}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <PaginationBar />
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : reportData.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            No data available
          </div>
        ) : (
          reportData.map((item) => {
            const isExpanded = expandedRows.has(item.id_so);
            const dog = getFirstDOG(item);
            const progress = calcProgress(item);
            const status = calcStatus(item);

            return (
              <div key={item.id_so} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-gray-900">
                      {item.no_po_customer || '-'}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {item.customer || '-'}
                    </div>
                  </div>
                  <div className="flex gap-2 items-center flex-shrink-0 ml-2">
                    {getStatusBadge(status)}
                    {getProgressBadge(progress)}
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-gray-500 font-medium">
                        Tgl Kirim:
                      </span>{' '}
                      <span className="text-gray-900">
                        {formatDate(item.tgl_pengiriman)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 font-medium">Tgl PO:</span>{' '}
                      <span className="text-gray-900">
                        {formatDate(item.so?.tgl_input_po)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">NO SO:</span>{' '}
                    <span className="text-gray-900">{item.no_so || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">NO JO:</span>{' '}
                    <span className="text-gray-900">{dog?.no_jo || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">NO IO:</span>{' '}
                    <span className="text-gray-900">{dog?.no_io || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">Produk:</span>{' '}
                    <span className="text-gray-900">{item.produk || '-'}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-gray-500 font-medium block">
                        Qty PO
                      </span>
                      <span className="text-gray-900">{fmt(item.po_qty)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 font-medium block">
                        Brg Kirim
                      </span>
                      <span className="text-gray-900">
                        {fmt(item.total_jumlah_qty)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 font-medium block">
                        Sisa PO
                      </span>
                      <span className="text-gray-900">{fmt(sisaPO(item))}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => toggleRow(item.id_so)}
                  className="mt-3 text-xs text-blue-600 hover:underline"
                >
                  {isExpanded ? 'Sembunyikan Detail ▲' : 'Lihat Detail DO ▼'}
                </button>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-700 mb-2 text-center">
                      JO: {dog?.no_jo || '-'} – SO: {item.no_so || '-'} – Tgl
                      Kirim: {formatDate(item.tgl_pengiriman)}
                    </p>
                    <table className="w-full text-xs border border-gray-200 rounded overflow-hidden">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-2 py-1.5 text-left font-medium text-gray-600">
                            No
                          </th>
                          <th className="px-2 py-1.5 text-left font-medium text-gray-600">
                            No.DO
                          </th>
                          <th className="px-2 py-1.5 text-left font-medium text-gray-600">
                            Tgl DO
                          </th>
                          <th className="px-2 py-1.5 text-left font-medium text-gray-600">
                            Kirim
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {item.delivery_order_groups.map((dog_row, idx) => {
                          const matched = item.delivery_orders.find(
                            (d) => d.id_do_group === dog_row.id,
                          );
                          return (
                            <tr
                              key={dog_row.id}
                              className="border-t border-gray-100"
                            >
                              <td className="px-2 py-1.5">{idx + 1}</td>
                              <td className="px-2 py-1.5">{dog_row.no_do}</td>
                              <td className="px-2 py-1.5">
                                {formatDate(dog_row.tgl_do)}
                              </td>
                              <td className="px-2 py-1.5">
                                {fmt(matched?.jumlah_qty ?? null)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })
        )}

        <div className="w-full flex flex-col items-center gap-4 py-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Rows per page:</span>
            <div className="flex gap-1">
              {[10, 25, 50, 100].map((s) => (
                <button
                  key={s}
                  onClick={() => handleLimitChange(s)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    limit === s
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <Stack spacing={2}>
            <Pagination
              count={totalPages}
              color="primary"
              page={page}
              onChange={(_e, i) => setPage(i)}
              size="small"
            />
          </Stack>
        </div>
      </div>
    </div>
  );
};

export default LaporanPengirimanDO;
