import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import KalkulasiDetailModal from '../Kalkulasi/KalkulasiDetailModal';
import ModalKosonganSmall from '../../../Modals/ModalKosonganSmall';
import Pagination from '@mui/material/Pagination/Pagination';
import Stack from '@mui/material/Stack';

// Keep all the interfaces at the top
interface KalkulasiItem {
  label: string;
  status_proses: string;
  id: number;
  kode_kalkulasi: string | null;
  status_kalkulasi: string;
  tgl_kalkulasi: string;
  nama_customer: string;
  nama_produk: string;
  qty_kalkulasi: number;
  harga_satuan: number;
  status: string;
  nama_marketing: string;
  spesifikasi: string;
  total_harga_satuan_customer: string | number;
  profit_harga: number;
  harga_produksi: number;
  total_harga: number;
  harga_ppn: number;
  harga_diskon: number;
  diskon: number;
  ukuran_jadi_panjang: number;
  ukuran_jadi_lebar: number;
  ukuran_jadi_tinggi: number;
  ukuran_jadi_terb_panjang: number;
  ukuran_jadi_terb_lebar: number;
  ukuran_cetak_panjang_1: number;
  ukuran_cetak_lebar_1: number;
  ukuran_cetak_bagian_1: number;
  ukuran_cetak_isi_1: number;
  ukuran_cetak_bbs_1: string;
  ukuran_cetak_panjang_2?: number;
  ukuran_cetak_lebar_2?: number;
  ukuran_cetak_bagian_2?: number;
  ukuran_cetak_isi_2?: number;
  ukuran_cetak_bbs_2?: string;
  keterangan_harga?: string;
  keterangan_kerja?: string;
  createdAt?: string;
  updatedAt?: string;
  tipe_kalkulasi?: string;
  qty_list?: Array<{ qty: number; is_selected: boolean }>;
}

interface KalkulasiDetailItem extends KalkulasiItem {
  lain_lain: LainLainItem[];
  kalkulasi_action_user: any[];
  brand_kertas: string;
  finishing_insheet: number;
  foil: string;
  gramature_kertas: number;
  harga_area_pengiriman: number;
  harga_foil_manual: number;
  harga_lipat: number;
  harga_packaging: number;
  harga_packing: number;
  harga_pengiriman: number;
  harga_pisau: number;
  harga_plate: number;
  harga_polimer_manual: number;
  harga_potong_jadi: number;
  harga_satuan_ongkos_pons: number;
  harga_spot_foil_manual: number;
  id_area_pengiriman: number;
  id_coating_belakang: number;
  id_coating_depan: number;
  id_customer: number;
  id_jenis_mesin_cetak: number;
  id_jenis_pons: number;
  id_kertas: number;
  id_lem: number;
  id_marketing: number;
  id_mesin_coating_belakang: number;
  id_mesin_coating_depan: number;
  id_mesin_finishing: number;
  id_mesin_lipat: number;
  id_mesin_pons: number;
  id_mesin_potong: number;
  id_packing: number;
  id_produk: number;
  id_user_approve: number | null;
  id_user_create: number;
  is_active: boolean;
  jenis_kertas: string;
  jenis_mesin_cetak: string;
  jenis_packing: string;
  jumlah_harga_cetak: number;
  jumlah_harga_coating_belakang: number;
  jumlah_harga_coating_depan: number;
  jumlah_harga_jual: string;
  jumlah_harga_lem: number;
  jumlah_kirim: number;
  jumlah_warna: number;
  kode_marketing: string;
  lebar_kertas: number;
  lebar_packaging: number;
  lipat: string;
  nama_area_pengiriman: string;
  nama_coating_belakang: string;
  nama_coating_depan: string;
  nama_jenis_pons: string;
  nama_kertas: string;
  nama_lem: string;
  nama_mesin_coating_belakang: string;
  nama_mesin_coating_depan: string;
  nama_mesin_finishing: string;
  nama_mesin_lipat: string;
  nama_mesin_pons: string;
  nama_mesin_potong: string;
  nama_packing: string;
  no_packaging: string;
  note_kabag: string | null;
  ongkos_pons: string;
  ongkos_pons_qty: number;
  panjang_kertas: number;
  panjang_packaging: number;
  persentase_apki_kertas: number;
  persentase_kertas: number;
  plate_cetak: string | null;
  pons_insheet: number;
  potong_jadi: string;
  ppn: number;
  presentase_insheet: number;
  print_insheet: number;
  profit: number;
  profit_harga: number;
  qty_lipat: number | null;
  qty_packing: number;
  qty_potong: number;
  spot_foil: string | null;
  status_proses: string;
  total_harga_coating: number;
  total_harga_kertas: number;
  total_harga_ongkos_pons: number;
  total_harga_satuan_customer: string;
  total_kertas: number;
  ukuran_jadi_terb_lebar: number;
  ukuran_jadi_terb_panjang: number;
  warna_belakang: number;
  warna_depan: number;
}

interface ApiResponse<T = any> {
  data: T;
  status_code: number;
  succes: boolean;
}

interface ApiError {
  message: string;
  status?: number;
}

interface LainLainItem {
  id: number;
  id_kalkulasi: number;
  nama_item: string;
  harga: number;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

type SortKey = keyof KalkulasiItem | 'index';
type SortDirection = 'asc' | 'desc';

const KabagApprovalTable: React.FC = () => {
  const [data, setData] = useState<KalkulasiItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [alasanPending, setalasanPending] = useState<any>();
  const [showPending, setShowPending] = useState(false);
  const [selectedRejectId, setSelectedRejectId] = useState<number | null>(null);
  const [selectedDetailData, setSelectedDetailData] =
    useState<KalkulasiDetailItem | null>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);

  // Pagination states
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  // Sort states
  const [sortKey, setSortKey] = useState<SortKey>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Search state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');

  const openModalPending = (id: number) => {
    setSelectedRejectId(id);
    setShowPending(true);
  };

  const closeModalPending = () => {
    setShowPending(false);
    setSelectedRejectId(null);
    setalasanPending('');
  };

  useEffect(() => {
    fetchKalkulasiData();
  }, [page, limit, searchTerm]);

  const fetchKalkulasiData = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/marketing/kalkulasi`;
    try {
      setLoading(true);
      const res: AxiosResponse<ApiResponse<KalkulasiItem[]>> = await axios.get(
        url,
        {
          params: {
            status: 'requested',
            page: page,
            limit: limit,
            search: searchTerm,
          },
          withCredentials: true,
        },
      );
      console.log('Fetched kalkulasi data:', res.data);
      if (res.data && res.data.data) {
        setData(res.data.data);
        if ((res.data as any).total_page) {
          setTotalPages((res.data as any).total_page);
        }
      } else {
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching kalkulasi data:', error);
      const apiError = error as ApiError;
      alert(`Error: ${apiError.message || 'Failed to fetch data'}`);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (): void => {
    setSearchTerm(searchInput);
    setPage(1); // Reset to first page when searching
  };

  const handleClearSearch = (): void => {
    setSearchInput('');
    setSearchTerm('');
    setPage(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleLimitChange = (newLimit: number): void => {
    setLimit(newLimit);
    setPage(1);
  };

  const fetchKalkulasiDetail = async (id: number): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/marketing/kalkulasi/${id}`;
    try {
      setDetailLoading(true);
      const res: AxiosResponse<ApiResponse<KalkulasiDetailItem>> =
        await axios.get(url, { withCredentials: true });
      console.log('Fetched kalkulasi detail:', res.data);
      if (res.data && res.data.data) {
        setSelectedDetailData(res.data.data);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error('Error fetching kalkulasi detail:', error);
      const apiError = error as ApiError;
      alert(`Error: ${apiError.message || 'Failed to fetch detail data'}`);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleViewDetail = (id: number): void => {
    fetchKalkulasiDetail(id);
  };

  const handleCloseDetailModal = (): void => {
    setShowDetailModal(false);
    setSelectedDetailData(null);
  };

  async function RequestKabag(id: any) {
    if (window.confirm('Apakah Anda yakin ingin Approve Kalkulasi Ini?')) {
      try {
        const url = `${
          import.meta.env.VITE_API_LINK
        }/marketing/kalkulasi/approve/${id}`;
        const res = await axios.put(
          url,
          {},
          {
            withCredentials: true,
          },
        );
        fetchKalkulasiData();
        alert('Kalkulasi berhasil diapprove!');
      } catch (error: any) {
        console.log(error);
        alert('Gagal approve kalkulasi');
      }
    }
  }

  async function RejectKabag(id: any) {
    if (window.confirm('Apakah Anda yakin ingin Reject Kalkulasi Ini?')) {
      try {
        const url = `${
          import.meta.env.VITE_API_LINK
        }/marketing/kalkulasi/reject/${id}`;
        const res = await axios.put(
          url,
          {
            note_kabag: alasanPending,
          },
          {
            withCredentials: true,
          },
        );
        closeModalPending();
        fetchKalkulasiData();
        alert('Kalkulasi berhasil direject!');
      } catch (error: any) {
        console.log(error);
        alert('Gagal reject kalkulasi');
      }
    }
  }

  // Sort functionality
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (key: SortKey) => {
    if (sortKey !== key) {
      return (
        <svg
          className="w-3 h-3 ml-1 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 9l4-4 4 4m0 6l-4 4-4-4"
          />
        </svg>
      );
    }
    return sortDirection === 'asc' ? (
      <svg
        className="w-3 h-3 ml-1 text-blue-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 15l7-7 7 7"
        />
      </svg>
    ) : (
      <svg
        className="w-3 h-3 ml-1 text-blue-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    );
  };

  const sortData = (data: KalkulasiItem[]) => {
    return [...data].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortKey === 'tgl_kalkulasi') {
        aValue = new Date(a.tgl_kalkulasi || 0).getTime();
        bValue = new Date(b.tgl_kalkulasi || 0).getTime();
      } else if (
        sortKey === 'qty_kalkulasi' ||
        sortKey === 'harga_satuan' ||
        sortKey === 'total_harga_satuan_customer'
      ) {
        aValue = Number(a[sortKey]) || 0;
        bValue = Number(b[sortKey]) || 0;
      } else {
        aValue = a[sortKey as keyof KalkulasiItem] || '';
        bValue = b[sortKey as keyof KalkulasiItem] || '';
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const sortedData = sortData(data);

  const truncateText = (text: string, maxLength: number) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-3">
          <input
            type="text"
            className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 w-48 text-sm"
            placeholder="Search..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button
            onClick={handleSearch}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
          >
            Search
          </button>
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="bg-gray-500 hover:bg-gray-600 text-red-500 px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-16">
                  <button className="flex items-center hover:text-gray-700 focus:outline-none">
                    No
                  </button>
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-24">
                  Actions
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  <button
                    onClick={() => handleSort('kode_kalkulasi')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    Kode
                    {getSortIcon('kode_kalkulasi')}
                  </button>
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  <button
                    onClick={() => handleSort('tipe_kalkulasi')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    Tipe
                    {getSortIcon('tipe_kalkulasi')}
                  </button>
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  <button
                    onClick={() => handleSort('tgl_kalkulasi')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    Tanggal
                    {getSortIcon('tgl_kalkulasi')}
                  </button>
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  <button
                    onClick={() => handleSort('nama_customer')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    Customer
                    {getSortIcon('nama_customer')}
                  </button>
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  <button
                    onClick={() => handleSort('nama_produk')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    Produk
                    {getSortIcon('nama_produk')}
                  </button>
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  <button
                    onClick={() => handleSort('qty_kalkulasi')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    Qty
                    {getSortIcon('qty_kalkulasi')}
                  </button>
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  <button
                    onClick={() => handleSort('total_harga_satuan_customer')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    Harga Customer
                    {getSortIcon('total_harga_satuan_customer')}
                  </button>
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    Status
                    {getSortIcon('status')}
                  </button>
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  <button
                    onClick={() => handleSort('status_proses')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    Approval
                    {getSortIcon('status_proses')}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedData.length > 0 ? (
                sortedData.map((item: KalkulasiItem, index: number) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-xs text-left">
                      {(page - 1) * limit + index + 1}
                    </td>
                    <td className="px-4 py-2 text-xs">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleViewDetail(item.id)}
                          disabled={detailLoading}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
                        >
                          {detailLoading ? 'Loading...' : 'Detail'}
                        </button>

                        {item.status === 'requested' && (
                          <>
                            <button
                              onClick={() => RequestKabag(item.id)}
                              className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => openModalPending(item.id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-left flex flex-col gap-2">
                      <span
                        className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded font-medium"
                        title={item.kode_kalkulasi || ''}
                      >
                        {item.kode_kalkulasi
                          ? truncateText(item.kode_kalkulasi, 20)
                          : '-'}
                      </span>
                      <span className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded font-medium">
                        {item.status_kalkulasi}
                      </span>
                      <span className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded font-medium">
                        {item.label || 'No Label'}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-left">
                      <span
                        className={`px-2 py-1 rounded text-xs uppercase ${
                          item.tipe_kalkulasi === 'multi'
                            ? 'bg-green-100 text-green-800'
                            : item.tipe_kalkulasi === 'manual'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {item.tipe_kalkulasi || 'normal'}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-xs text-left">
                      {new Date(item.tgl_kalkulasi).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-left">
                      <span className="text-xs" title={item.nama_customer}>
                        {truncateText(item.nama_customer, 15)}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-xs max-w-xs text-left">
                      <span title={item.nama_produk}>
                        {truncateText(item.nama_produk, 20)}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-xs text-left">
                      {item.tipe_kalkulasi === 'multi' && item.qty_list ? (
                        <div className="flex flex-col gap-1">
                          {item.qty_list.map((qtyItem, idx) => (
                            <span
                              key={idx}
                              className={`text-xs ${
                                qtyItem.is_selected ? 'font-bold' : ''
                              }`}
                            >
                              {qtyItem.qty.toLocaleString()}
                              {qtyItem.is_selected && ' ✓'}
                            </span>
                          ))}
                        </div>
                      ) : (
                        item.qty_kalkulasi?.toLocaleString()
                      )}
                    </td>
                    <td className="px-4 py-2 text-xs whitespace-nowrap text-left">
                      Rp{' '}
                      {Number(
                        item.total_harga_satuan_customer || 0,
                      ).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-xs whitespace-nowrap text-left">
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs uppercase">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-xs text-left">
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs uppercase">
                        {item.status_proses}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={11}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    {searchTerm
                      ? 'Tidak ada data yang sesuai dengan pencarian'
                      : 'Tidak ada data kalkulasi'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination with Rows per page selector */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 mt-6 pb-4">
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
              page={page}
              color="primary"
              onChange={(e, i) => {
                setPage(i);
                console.log(i);
              }}
            />
          </Stack>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedDetailData && (
        <KalkulasiDetailModal
          data={selectedDetailData}
          onClose={handleCloseDetailModal}
        />
      )}

      {/* Reject Modal */}
      {showPending && selectedRejectId && (
        <ModalKosonganSmall
          isOpen={showPending}
          onClose={closeModalPending}
          judul={'Alasan Reject'}
        >
          <div className="flex flex-col gap-2 px-4 py-4">
            <div className="flex gap-2 flex-col w-full">
              <input
                onChange={(e) => setalasanPending(e.target.value)}
                value={alasanPending || ''}
                type="text"
                className="border-2 border-stroke w-full rounded-sm col-span-2 h-10 px-2"
                placeholder="Masukkan alasan reject..."
              />
            </div>
            <button
              onClick={() => RejectKabag(selectedRejectId)}
              className="w-full h-10 rounded-md bg-red-600 text-white text-xs font-bold justify-center items-center px-10 py-2 hover:cursor-pointer hover:bg-red-700"
            >
              REJECT
            </button>
          </div>
        </ModalKosonganSmall>
      )}
    </div>
  );
};
export default KabagApprovalTable;
