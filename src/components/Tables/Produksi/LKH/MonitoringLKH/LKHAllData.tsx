import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import { Pagination, Stack } from '@mui/material';
import LKHDetailPopup from './LKHDetailPopup';

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
  mesin?: Mesin;
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
  produksi_lkh_waste: ProduksiLKHWaste[];
  tahapan?: Tahapan;
}

interface LKHAllDataResponse {
  data: LKHAllDataItem[];
  status_code: number;
  success: boolean;
  total_page?: number;
}

const LKHAllData: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [lkhAllData, setLkhAllData] = useState<LKHAllDataItem[]>([]);
  const [selectedLKH, setSelectedLKH] = useState<LKHAllDataItem | null>(null);
  const [showDetailPopup, setShowDetailPopup] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [limit, setLimit] = useState<number>(10);

  useEffect(() => {
    fetchLKHData();
  }, [page, searchTerm, limit]);

  const fetchLKHData = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/produksi/listAllData`;
    try {
      setLoading(true);

      const res: AxiosResponse<LKHAllDataResponse> = await axios.get(url, {
        params: {
          page: page,
          limit: limit,
          search: searchTerm,
          status: 'history',
        },
        withCredentials: true,
      });

      console.log('Fetched LKH All data:', res.data);

      setLkhAllData(res.data.data || []);

      if (res.data.total_page) {
        setTotalPages(res.data.total_page);
      } else {
        setTotalPages(Math.ceil((res.data.data || []).length / limit));
      }
    } catch (error) {
      console.error('Error fetching LKH All data:', error);
      setLkhAllData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLimitChange = (newLimit: number): void => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleDetailClick = (lkh: LKHAllDataItem) => {
    setSelectedLKH(lkh);
    setShowDetailPopup(true);
  };

  const handleClosePopup = () => {
    setShowDetailPopup(false);
    setSelectedLKH(null);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '-';
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  const formatDateTime = (dateString: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const formatDuration = (totalSeconds: number): string => {
    if (isNaN(totalSeconds) || totalSeconds < 0) return '00:00:00';

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
      2,
      '0',
    )}:${String(secs).padStart(2, '0')}`;
  };

  // Format number with thousand separator (dot)
  const formatNumber = (num: number | null | undefined): string => {
    if (num === null || num === undefined) return '-';
    return num.toLocaleString('id-ID');
  };

  const calculateTotalResults = (proses: ProduksiLKHProses[]) => {
    return proses
      .filter((p) => p.is_final_result === true) // Only sum final results
      .reduce(
        (acc, p) => ({
          baik: acc.baik + p.baik,
          rusak_sebagian: acc.rusak_sebagian + p.rusak_sebagian,
          rusak_total: acc.rusak_total + p.rusak_total,
          tambah_bahan: 0,
        }),
        { baik: 0, rusak_sebagian: 0, rusak_total: 0, tambah_bahan: 0 },
      );
  };

  const calculateTotalTime = (proses: ProduksiLKHProses[]) => {
    const timeByType = {
      setting: 0,
      produksi: 0,
      kendala: 0,
      maintenance: 0,
    };

    proses.forEach((p) => {
      const waktu = parseInt(p.total_waktu) || 0;
      const prosesType = p.proses?.toLowerCase() || '';

      if (prosesType === 'setting') timeByType.setting += waktu;
      else if (prosesType === 'produksi') timeByType.produksi += waktu;
      else if (prosesType === 'kendala') timeByType.kendala += waktu;
      else if (prosesType === 'maintenance') timeByType.maintenance += waktu;
    });

    return timeByType;
  };

  const calculateTotalWaste = (waste: ProduksiLKHWaste[]) => {
    if (!waste || waste.length === 0) return 0;
    return waste.reduce((acc, w) => acc + (w.total_qty || 0), 0);
  };

  const getLatestTahapan = (proses: ProduksiLKHProses[]) => {
    if (!proses || proses.length === 0) return '-';

    const sortedProses = [...proses].sort(
      (a, b) =>
        new Date(b.waktu_mulai).getTime() - new Date(a.waktu_mulai).getTime(),
    );

    return sortedProses[0]?.tahapan?.nama_tahapan || '-';
  };

  const getLatestMesin = (proses: ProduksiLKHProses[]) => {
    if (!proses || proses.length === 0) return '-';

    const sortedProses = [...proses].sort(
      (a, b) =>
        new Date(b.waktu_mulai).getTime() - new Date(a.waktu_mulai).getTime(),
    );

    return sortedProses[0]?.mesin?.nama_mesin || '-';
  };

  return (
    <div className="">
      {/* Header Section */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col gap-2 sm:gap-3 mb-3 sm:mb-4">
          {/* Search */}
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search by JO, Customer, or Product..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
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
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Act
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  No JO
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Customer
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Nama Produk
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  JO
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Waktu
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Hasil
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Waste
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-3 py-4 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : lkhAllData.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-3 py-4 text-center text-gray-500 text-sm"
                  >
                    No data available
                  </td>
                </tr>
              ) : (
                lkhAllData.map((lkh) => {
                  const totalResults = calculateTotalResults(
                    lkh.produksi_lkh_proses,
                  );
                  const totalTime = calculateTotalTime(lkh.produksi_lkh_proses);
                  const totalWaste = calculateTotalWaste(
                    lkh.produksi_lkh_waste,
                  );
                  const latestTahapan = getLatestTahapan(
                    lkh.produksi_lkh_proses,
                  );
                  const latestMesin = getLatestMesin(lkh.produksi_lkh_proses);

                  return (
                    <tr key={lkh.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 whitespace-nowrap text-xs">
                        <button
                          onClick={() => handleDetailClick(lkh)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
                        >
                          Detail
                        </button>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 font-medium">
                        {lkh.no_jo || '-'}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                        {truncateText(lkh.customer, 20)}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-900 max-w-xs">
                        {truncateText(lkh.produk, 30)}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-900 whitespace-nowrap">
                        <div>Proses: {latestTahapan}</div>
                        <div className="text-gray-500">
                          Tanggal Kirim: {formatDateTime(lkh.tgl_kirim)}
                        </div>
                        <div className="text-gray-500">
                          Mesin: {latestMesin}
                        </div>
                        <div className="text-gray-500">
                          QTY: {formatNumber(lkh.qty)}
                        </div>
                        <div className="text-gray-500">
                          QTY Druk: {formatNumber(lkh.qty_druk)}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-900 whitespace-nowrap">
                        <div>Setting: {formatDuration(totalTime.setting)}</div>
                        <div>
                          Produksi: {formatDuration(totalTime.produksi)}
                        </div>
                        <div>Kendala: {formatDuration(totalTime.kendala)}</div>
                        <div>
                          Maintenance: {formatDuration(totalTime.maintenance)}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded">
                            <span className="font-bold">✓</span> Baik:{' '}
                            {formatNumber(totalResults.baik)}
                          </span>
                          <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded">
                            <span className="font-bold">⚠</span> RS:{' '}
                            {formatNumber(totalResults.rusak_sebagian)}
                          </span>
                          <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2 py-0.5 rounded">
                            <span className="font-bold">✕</span> RT:{' '}
                            {formatNumber(totalResults.rusak_total)}
                          </span>
                          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                            <span className="font-bold">+</span> TB:{' '}
                            {formatNumber(totalResults.tambah_bahan)}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 px-2 py-0.5 rounded font-medium">
                            <span className="font-bold">🗑</span> Total:{' '}
                            {formatNumber(totalWaste)}
                          </span>
                          {lkh.produksi_lkh_waste &&
                            lkh.produksi_lkh_waste.length > 0 && (
                              <span className="text-gray-500 text-xs">
                                ({lkh.produksi_lkh_waste.length} records)
                              </span>
                            )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination with Rows per page selector */}
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 mt-6 pb-4 px-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Rows per page:</span>
            <div className="flex gap-2">
              {[10, 25, 50, 100].map((pageSize) => (
                <button
                  key={pageSize}
                  onClick={() => handleLimitChange(pageSize)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    limit === pageSize
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {pageSize}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Stack spacing={2}>
              <Pagination
                count={totalPages}
                color="primary"
                page={page}
                onChange={(e, i) => {
                  setPage(i);
                }}
                size="small"
              />
            </Stack>
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : lkhAllData.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            No data available
          </div>
        ) : (
          lkhAllData.map((lkh) => {
            const totalResults = calculateTotalResults(lkh.produksi_lkh_proses);
            const totalTime = calculateTotalTime(lkh.produksi_lkh_proses);
            const totalWaste = calculateTotalWaste(lkh.produksi_lkh_waste);
            const latestTahapan = getLatestTahapan(lkh.produksi_lkh_proses);
            const latestMesin = getLatestMesin(lkh.produksi_lkh_proses);

            return (
              <div key={lkh.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-gray-900">
                      {lkh.no_jo || '-'}
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      {lkh.customer}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDetailClick(lkh)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs whitespace-nowrap ml-2"
                  >
                    Detail
                  </button>
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500 text-xs font-medium">
                      Produk:
                    </span>
                    <div className="text-gray-900 text-xs">{lkh.produk}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-gray-500 text-xs font-medium">
                        Proses:
                      </span>
                      <div className="text-gray-900 text-xs">
                        {latestTahapan}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs font-medium">
                        Mesin:
                      </span>
                      <div className="text-gray-900 text-xs">{latestMesin}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-gray-500 text-xs font-medium">
                        QTY:
                      </span>
                      <div className="text-gray-900 text-xs">
                        {formatNumber(lkh.qty)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs font-medium">
                        QTY Druk:
                      </span>
                      <div className="text-gray-900 text-xs">
                        {formatNumber(lkh.qty_druk)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-500 text-xs font-medium">
                      Tanggal Kirim:
                    </span>
                    <div className="text-gray-900 text-xs">
                      {formatDateTime(lkh.tgl_kirim)}
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-500 text-xs font-medium">
                      Waktu:
                    </span>
                    <div className="grid grid-cols-2 gap-1 mt-1 text-xs">
                      <div className="text-gray-700">
                        Setting: {formatDuration(totalTime.setting)}
                      </div>
                      <div className="text-gray-700">
                        Produksi: {formatDuration(totalTime.produksi)}
                      </div>
                      <div className="text-gray-700">
                        Kendala: {formatDuration(totalTime.kendala)}
                      </div>
                      <div className="text-gray-700">
                        Maintenance: {formatDuration(totalTime.maintenance)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-500 text-xs font-medium">
                      Hasil:
                    </span>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <span className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs inline-flex items-center gap-1">
                        <span className="font-bold">✓</span> Baik:{' '}
                        {formatNumber(totalResults.baik)}
                      </span>
                      <span className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded text-xs inline-flex items-center gap-1">
                        <span className="font-bold">⚠</span> RS:{' '}
                        {formatNumber(totalResults.rusak_sebagian)}
                      </span>
                      <span className="bg-red-50 text-red-700 px-2 py-1 rounded text-xs inline-flex items-center gap-1">
                        <span className="font-bold">✕</span> RT:{' '}
                        {formatNumber(totalResults.rusak_total)}
                      </span>
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs inline-flex items-center gap-1">
                        <span className="font-bold">+</span> TB:{' '}
                        {formatNumber(totalResults.tambah_bahan)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-500 text-xs font-medium">
                      Waste:
                    </span>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded text-xs inline-flex items-center gap-1 font-medium">
                        <span className="font-bold">🗑</span> Total:{' '}
                        {formatNumber(totalWaste)}
                      </span>
                      {lkh.produksi_lkh_waste &&
                        lkh.produksi_lkh_waste.length > 0 && (
                          <span className="text-gray-500 text-xs">
                            ({lkh.produksi_lkh_waste.length} records)
                          </span>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Mobile Pagination */}
        <div className="w-full flex flex-col items-center gap-4 py-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Rows per page:</span>
            <div className="flex gap-2">
              {[10, 25, 50, 100].map((pageSize) => (
                <button
                  key={pageSize}
                  onClick={() => handleLimitChange(pageSize)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    limit === pageSize
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {pageSize}
                </button>
              ))}
            </div>
          </div>

          <Stack spacing={2}>
            <Pagination
              count={totalPages}
              color="primary"
              page={page}
              onChange={(e, i) => {
                setPage(i);
              }}
              size="small"
            />
          </Stack>
        </div>
      </div>

      {/* Detail Popup */}
      {showDetailPopup && selectedLKH && (
        <LKHDetailPopup lkhData={selectedLKH} onClose={handleClosePopup} />
      )}
    </div>
  );
};

export default LKHAllData;
