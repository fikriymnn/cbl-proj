import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import { Pagination, Stack } from '@mui/material';

interface JOData {
  spesifikasi: string;
  status_proses: string;
  status: any;
  id: number;
  no_jo: string;
  no_so: string;
  no_io: string;
  customer: string;
  produk: string;
  qty: number;
  tgl_kirim: string;
  status_jo: string;
  tipe_jo: string;
  is_active: boolean;
  createdAt: string;
  jo_mounting?: JOMounting[];
}

interface JOMounting {
  is_selected: unknown;
  id: number;
  id_jo: number;
  id_io_mounting: number;
  id_kertas: number;
  ukuran_cetak_isi_1: number;
  ukuran_cetak_isi_2: number;
  ukuran_cetak_bagian_1: number;
  ukuran_cetak_bagian_2: number;
}

interface TahapanData {
  id: number;
  id_tahapan: number;
  status: string;
  tahapan: {
    id: number;
    nama_tahapan: string;
    kode_tahapan: string;
  };
}

interface JOResponse {
  data: JOData[];
  status_code: number;
  success: boolean;
  total_page?: number;
}

interface TahapanResponse {
  data: TahapanData[];
  status_code: number;
  success: boolean;
}

interface TahapanUpdateBody {
  produksi_lkh_tahapan: {
    id: number;
    status: string;
  }[];
}

const BukaLKH: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [joData, setJoData] = useState<JOData[]>([]);
  const [selectedJO, setSelectedJO] = useState<JOData | null>(null);
  const [showTahapanPopup, setShowTahapanPopup] = useState<boolean>(false);
  const [tahapanData, setTahapanData] = useState<TahapanData[]>([]);
  const [selectedTahapan, setSelectedTahapan] = useState<Set<number>>(
    new Set(),
  );
  const [loadingTahapan, setLoadingTahapan] = useState<boolean>(false);
  const [submittingTahapan, setSubmittingTahapan] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [limit, setLimit] = useState<number>(10);

  useEffect(() => {
    fetchJOData();
  }, [page, searchTerm, limit]);

  const fetchJOData = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/ppic/jo`;
    try {
      setLoading(true);

      const res: AxiosResponse<JOResponse> = await axios.get(url, {
        params: {
          status_proses: 'done',
          page: page,
          limit: limit,
          search: searchTerm,
        },
        withCredentials: true,
      });

      console.log('Fetched JO data:', res.data);

      setJoData(res.data.data || []);

      if (res.data.total_page) {
        setTotalPages(res.data.total_page);
      } else {
        setTotalPages(Math.ceil((res.data.data || []).length / limit));
      }
    } catch (error) {
      console.error('Error fetching JO data:', error);
      setJoData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTahapanData = async (id_jo: number): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/produksi/lkhTahapan`;
    try {
      setLoadingTahapan(true);

      const res: AxiosResponse<TahapanResponse> = await axios.get(url, {
        params: {
          id_jo: id_jo,
        },
        withCredentials: true,
      });

      console.log('Fetched Tahapan data:', res.data);

      setTahapanData(res.data.data || []);

      // Initialize selected tahapan with only non-done status that user can select
      // Don't include already done status in selectedTahapan
      setSelectedTahapan(new Set());
    } catch (error) {
      console.error('Error fetching Tahapan data:', error);
      setTahapanData([]);
    } finally {
      setLoadingTahapan(false);
    }
  };

  const handleActionClick = async (jo: JOData) => {
    setSelectedJO(jo);
    setShowTahapanPopup(true);
    await fetchTahapanData(jo.id);
  };

  const handleClosePopup = () => {
    setShowTahapanPopup(false);
    setSelectedJO(null);
    setTahapanData([]);
    setSelectedTahapan(new Set());
  };

  const handleTahapanToggle = (tahapanId: number, index: number) => {
    // Don't allow toggling if this tahapan is already done
    const currentTahapan = tahapanData[index];
    if (
      currentTahapan.status === 'done' ||
      currentTahapan.status === 'active'
    ) {
      return;
    }

    const newSelected = new Set(selectedTahapan);

    if (newSelected.has(tahapanId)) {
      // Trying to uncheck - need to check if any subsequent tahapan is checked
      const hasSubsequentChecked = tahapanData
        .slice(index + 1)
        .some((t) => newSelected.has(t.id));

      if (hasSubsequentChecked) {
        alert(
          'Tidak dapat uncheck tahapan ini. Harap uncheck tahapan berikutnya terlebih dahulu.',
        );
        return;
      }

      newSelected.delete(tahapanId);
    } else {
      // Trying to check - need to check if all previous tahapan are checked or done
      const allPreviousCheckedOrDone = tahapanData
        .slice(0, index)
        .every(
          (t) =>
            newSelected.has(t.id) ||
            t.status === 'done' ||
            t.status === 'active',
        );

      if (!allPreviousCheckedOrDone && index > 0) {
        alert(
          'Tidak dapat check tahapan ini. Harap check tahapan sebelumnya terlebih dahulu.',
        );
        return;
      }

      newSelected.add(tahapanId);
    }

    setSelectedTahapan(newSelected);
  };

  const handleSubmitTahapan = async () => {
    if (!selectedJO) return;

    const url = `${import.meta.env.VITE_API_LINK}/produksi/activedLkhTahapan`;

    try {
      setSubmittingTahapan(true);

      const body: TahapanUpdateBody = {
        produksi_lkh_tahapan: Array.from(selectedTahapan).map((id) => ({
          id,
          status: 'active',
        })),
      };

      await axios.put(url, body, {
        withCredentials: true,
      });

      alert('Tahapan berhasil diupdate!');
      handleClosePopup();
      fetchJOData(); // Refresh the JO list
    } catch (error) {
      console.error('Error updating tahapan:', error);
      alert('Gagal mengupdate tahapan. Silakan coba lagi.');
    } finally {
      setSubmittingTahapan(false);
    }
  };

  const handleLimitChange = (newLimit: number): void => {
    setLimit(newLimit);
    setPage(1);
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

  const formatNumber = (num: number | null | undefined): string => {
    if (num === null || num === undefined) return '-';
    return num.toLocaleString('id-ID');
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
                  No SO
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  No IO
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Customer
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Produk
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  QTY
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Tanggal Kirim
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-3 py-4 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : joData.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-3 py-4 text-center text-gray-500 text-sm"
                  >
                    No data available
                  </td>
                </tr>
              ) : (
                joData.map((jo) => {
                  return (
                    <tr key={jo.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 whitespace-nowrap text-xs">
                        <button
                          onClick={() => handleActionClick(jo)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                        >
                          Open
                        </button>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 font-medium">
                        {jo.no_jo || '-'}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                        {jo.no_so || '-'}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                        {jo.no_io || '-'}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                        {truncateText(jo.customer, 20)}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-900 max-w-xs">
                        {truncateText(jo.produk, 30)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                        {formatNumber(jo.qty)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                        {formatDateTime(jo.tgl_kirim)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {jo.status_proses || '-'}
                        </span>
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
        ) : joData.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            No data available
          </div>
        ) : (
          joData.map((jo) => {
            return (
              <div key={jo.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-gray-900">
                      {jo.no_jo || '-'}
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      {jo.customer}
                    </div>
                  </div>
                  <button
                    onClick={() => handleActionClick(jo)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs whitespace-nowrap ml-2"
                  >
                    Open
                  </button>
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500 text-xs font-medium">
                      Produk:
                    </span>
                    <div className="text-gray-900 text-xs">{jo.produk}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-gray-500 text-xs font-medium">
                        No SO:
                      </span>
                      <div className="text-gray-900 text-xs">
                        {jo.no_so || '-'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs font-medium">
                        No IO:
                      </span>
                      <div className="text-gray-900 text-xs">
                        {jo.no_io || '-'}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-gray-500 text-xs font-medium">
                        QTY:
                      </span>
                      <div className="text-gray-900 text-xs">
                        {formatNumber(jo.qty)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs font-medium">
                        Status:
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-500 text-xs font-medium">
                      Tanggal Kirim:
                    </span>
                    <div className="text-gray-900 text-xs">
                      {formatDateTime(jo.tgl_kirim)}
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

      {/* Tahapan Popup */}
      {showTahapanPopup && selectedJO && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Pilih Tahapan untuk Dibuka
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    JO: {selectedJO.no_jo} - {selectedJO.customer}
                  </p>
                </div>
                <button
                  onClick={handleClosePopup}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
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
            </div>

            {/* Content */}
            <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-180px)]">
              {loadingTahapan ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : tahapanData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Tidak ada tahapan yang tersedia
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-blue-800">
                      <strong>Catatan:</strong> Anda harus memilih tahapan
                      secara berurutan. Tahapan yang sudah selesai tidak dapat
                      diubah.
                    </p>
                  </div>

                  {tahapanData.map((tahapan, index) => {
                    const isDone = tahapan.status === 'done';
                    const isChecked = selectedTahapan.has(tahapan.id);
                    const isFirstUnchecked =
                      !isDone &&
                      !isChecked &&
                      (index === 0 ||
                        tahapanData[index - 1].status === 'done' ||
                        tahapanData[index - 1].status === 'active' ||
                        selectedTahapan.has(tahapanData[index - 1].id));

                    return (
                      <div
                        key={tahapan.id}
                        className={`border rounded-lg p-4 transition-all ${
                          isDone
                            ? 'bg-gray-100 border-gray-300 opacity-75'
                            : isChecked
                            ? 'bg-green-50 border-green-300'
                            : isFirstUnchecked
                            ? 'bg-white border-blue-300'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-start">
                          {isDone || tahapan.status === 'active' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-700 mr-2 mt-1">
                              {tahapan.status === 'active'
                                ? 'Active'
                                : '✓ Selesai'}
                            </span>
                          ) : (
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() =>
                                handleTahapanToggle(tahapan.id, index)
                              }
                              disabled={isDone}
                              className="mt-1 h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                            />
                          )}

                          <div className="ml-3 flex-1">
                            <div className="flex items-center justify-between">
                              <div
                                className={`font-medium ${
                                  isDone ? 'text-gray-600' : 'text-gray-900'
                                }`}
                              >
                                {index + 1}.{' '}
                                {tahapan.tahapan?.nama_tahapan || '-'}
                              </div>
                              {isChecked && !isDone && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  ✓ Dipilih
                                </span>
                              )}
                            </div>
                            <div
                              className={`text-sm mt-1 ${
                                isDone ? 'text-gray-500' : 'text-gray-600'
                              }`}
                            >
                              Kode: {tahapan.tahapan?.kode_tahapan || '-'}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Status: {tahapan.status}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={handleClosePopup}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={submittingTahapan}
              >
                Batal
              </button>
              <button
                onClick={handleSubmitTahapan}
                disabled={
                  submittingTahapan ||
                  selectedTahapan.size === 0 ||
                  loadingTahapan
                }
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {submittingTahapan ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Menyimpan...
                  </span>
                ) : (
                  `Buka Tahapan`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BukaLKH;
