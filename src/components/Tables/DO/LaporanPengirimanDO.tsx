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

  // --- Search states ---
  const [searchInput, setSearchInput] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    fetchReportData();
  }, [page, limit, searchTerm]);

  const fetchReportData = async (): Promise<void> => {
    try {
      setLoading(true);
      const res: AxiosResponse<ReportDOResponse> = await axios.get(
        `${import.meta.env.VITE_API_LINK}/reportDeliveryOrder`,
        {
          params: {
            start_date: startDate,
            end_date: endDate,
            page,
            limit,
            search: searchTerm,
          },
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
    setSearchTerm(searchInput);
    setPage(1);
    // If searchTerm hasn't changed, manually trigger fetch
    if (searchInput === searchTerm) {
      fetchReportData();
    }
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchTerm('');
    setPage(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleSearch();
    }
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

  const getDOStatusBadge = (status: string) => {
    const map: Record<string, { cls: string; label: string }> = {
      done: {
        cls: 'bg-green-100 text-green-700 border border-green-300',
        label: 'Selesai',
      },
      pending: {
        cls: 'bg-gray-100 text-gray-600 border border-gray-300',
        label: 'Pending',
      },
      progress: {
        cls: 'bg-blue-100 text-blue-700 border border-blue-300',
        label: 'Progress',
      },
    };
    const key = status?.toLowerCase() ?? '';
    const cfg = map[key] || {
      cls: 'bg-gray-100 text-gray-600 border border-gray-300',
      label: status,
    };
    return (
      <span
        className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${cfg.cls}`}
      >
        {cfg.label}
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
  const getFirstDOG = (item: ReportDOItem) =>
    item.delivery_order_groups[0] ?? null;

  // Build pack/isi summary string, skip zero values
  const buildQtyDetail = (do_row: DeliveryOrder): string => {
    const parts: string[] = [];
    if (do_row.pack_1 && do_row.isi_1)
      parts.push(`${fmt(do_row.pack_1)} × ${fmt(do_row.isi_1)}`);
    if (do_row.pack_2 && do_row.isi_2)
      parts.push(`${fmt(do_row.pack_2)} × ${fmt(do_row.isi_2)}`);
    if (do_row.pack_3 && do_row.isi_3)
      parts.push(`${fmt(do_row.pack_3)} × ${fmt(do_row.isi_3)}`);
    return parts.length > 0 ? parts.join(' + ') : '-';
  };

  // --- Expanded Detail Section ---
  const ExpandedDetail = ({ item }: { item: ReportDOItem }) => (
    <div className="bg-blue-50/40 px-6 py-4 border-b border-gray-200">
      {/* Sub table */}
      <div className="overflow-x-auto rounded border border-gray-200 shadow-sm">
        <table className="w-full text-xs">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left font-semibold text-gray-600 border-b border-gray-200 w-8">
                No
              </th>
              <th className="px-3 py-2 text-left font-semibold text-gray-600 border-b border-gray-200">
                No. DO
              </th>
              <th className="px-3 py-2 text-left font-semibold text-gray-600 border-b border-gray-200">
                Tgl DO
              </th>
              <th className="px-3 py-2 text-left font-semibold text-gray-600 border-b border-gray-200">
                No. JO
              </th>
              <th className="px-3 py-2 text-left font-semibold text-gray-600 border-b border-gray-200">
                No. IO
              </th>
              <th className="px-3 py-2 text-left font-semibold text-gray-600 border-b border-gray-200">
                Kota Tujuan
              </th>
              <th className="px-3 py-2 text-right font-semibold text-gray-600 border-b border-gray-200">
                Rincian Qty
              </th>
              <th className="px-3 py-2 text-right font-semibold text-gray-600 border-b border-gray-200">
                Total Kirim
              </th>
              <th className="px-3 py-2 text-center font-semibold text-gray-600 border-b border-gray-200">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {item.delivery_order_groups.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-4 text-center text-gray-500">
                  Tidak ada data DO
                </td>
              </tr>
            ) : (
              item.delivery_order_groups.map((dog_row, idx) => {
                const matched = item.delivery_orders.find(
                  (d) => d.id_do_group === dog_row.id,
                );
                return (
                  <tr
                    key={dog_row.id}
                    className="hover:bg-blue-50/40 transition-colors"
                  >
                    <td className="px-3 py-2 text-gray-500 text-center">
                      {idx + 1}
                    </td>
                    <td className="px-3 py-2 font-medium text-gray-800 whitespace-nowrap">
                      {dog_row.no_do || '-'}
                    </td>
                    <td className="px-3 py-2 text-gray-700 whitespace-nowrap">
                      {formatDate(dog_row.tgl_do)}
                    </td>
                    <td className="px-3 py-2 text-gray-700 whitespace-nowrap">
                      {dog_row.no_jo || matched?.no_jo || '-'}
                    </td>
                    <td className="px-3 py-2 text-gray-700 whitespace-nowrap">
                      {dog_row.no_io || matched?.no_io || '-'}
                    </td>
                    <td className="px-3 py-2 text-gray-700 whitespace-nowrap">
                      {dog_row.kota || '-'}
                    </td>
                    <td className="px-3 py-2 text-right text-gray-600 whitespace-nowrap">
                      {matched ? buildQtyDetail(matched) : '-'}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold text-gray-800 whitespace-nowrap">
                      {fmt(matched?.jumlah_qty ?? null)}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {getDOStatusBadge(dog_row.status)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          {/* Footer total */}
          {item.delivery_order_groups.length > 1 && (
            <tfoot className="bg-gray-50">
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-2 text-right text-xs font-semibold text-gray-600 border-t border-gray-200"
                >
                  Total Keseluruhan:
                </td>
                <td className="px-3 py-2 text-right text-xs font-bold text-gray-800 border-t border-gray-200 whitespace-nowrap">
                  {fmt(item.total_jumlah_qty)}
                </td>
                <td className="border-t border-gray-200" />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Note if exists on any DO group */}
      {item.delivery_order_groups.some((d) => d.note) && (
        <div className="mt-3 text-xs text-gray-500 italic">
          <span className="font-medium not-italic text-gray-600">Catatan:</span>{' '}
          {item.delivery_order_groups
            .filter((d) => d.note)
            .map((d) => d.note)
            .join('; ')}
        </div>
      )}
    </div>
  );

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
      {/* Filter & Search Section */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3 items-end flex-wrap">
        {/* Date filters */}
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

        {/* Search input */}
        <div className="flex flex-col gap-1 flex-1 min-w-[220px]">
          <label className="text-xs text-gray-600 font-medium">Search</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Cari NO SO, NO PO, Customer, Produk..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              />
              <svg
                className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Search
            </button>
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-red-600 rounded-lg text-sm font-medium transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase whitespace-nowrap w-16">
                  Act
                </th>
                <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase whitespace-nowrap">
                  Tgl Kirim
                  <br />
                  Cust<span className="ml-1 opacity-40">↑↓</span>
                </th>
                <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase whitespace-nowrap">
                  NO PO<span className="ml-1 opacity-40">↑↓</span>
                </th>
                <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase whitespace-nowrap">
                  Tanggal PO<span className="ml-1 opacity-40">↑↓</span>
                </th>
                <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase whitespace-nowrap">
                  NO SO / JO / IO<span className="ml-1 opacity-40">↑↓</span>
                </th>
                <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase whitespace-nowrap">
                  Pemesan<span className="ml-1 opacity-40">↑↓</span>
                </th>
                <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase whitespace-nowrap">
                  Produk<span className="ml-1 opacity-40">↑↓</span>
                </th>
                <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase whitespace-nowrap">
                  Qty PO<span className="ml-1 opacity-40">↑↓</span>
                </th>
                <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase whitespace-nowrap">
                  Barang
                  <br />
                  Kirim<span className="ml-1 opacity-40">↑↓</span>
                </th>
                <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase whitespace-nowrap">
                  Sisa PO<span className="ml-1 opacity-40">↑↓</span>
                </th>
                <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase whitespace-nowrap">
                  Status<span className="ml-1 opacity-40">↑↓</span>
                </th>
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
                    {searchTerm
                      ? 'Tidak ada data yang sesuai dengan pencarian'
                      : 'No data available'}
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
                        <td className="px-2 py-2 whitespace-nowrap">
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
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-gray-900">
                          {formatDate(item.tgl_pengiriman)}
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-gray-900">
                          {item.no_po_customer || '-'}
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-gray-900">
                          {formatDate(item.so?.tgl_input_po)}
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-gray-900">
                          <div>{item.no_so || '-'}</div>
                          <div className="text-gray-500">
                            {dog?.no_jo || '-'}
                          </div>
                          <div className="text-gray-400">
                            {dog?.no_io || '-'}
                          </div>
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-gray-900">
                          {item.customer || '-'}
                        </td>
                        <td className="px-2 py-2 text-gray-900 max-w-[200px]">
                          <div className="whitespace-normal leading-tight">
                            {item.produk || '-'}
                          </div>
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-gray-900 text-right">
                          {fmt(item.po_qty)}
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-gray-900 text-right">
                          {fmt(item.total_jumlah_qty)}
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-gray-900 text-right">
                          {fmt(sisaPO(item))}
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap">
                          {getStatusBadge(status)}
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap">
                          {getProgressBadge(progress)}
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr>
                          <td colSpan={12} className="p-0">
                            <ExpandedDetail item={item} />
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
            {searchTerm
              ? 'Tidak ada data yang sesuai dengan pencarian'
              : 'No data available'}
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
                    <ExpandedDetail item={item} />
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
