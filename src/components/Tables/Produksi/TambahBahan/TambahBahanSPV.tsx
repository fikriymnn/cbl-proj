import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Select, { SingleValue } from 'react-select';
import { toast } from 'react-toastify';
import {
  APIResponse,
  JOData,
  Option,
  StatusTiket,
  TambahBahanCreatePayload,
  TambahBahanPersiapan,
} from './types/Tambahbahan.types';
import {
  formatDateTime,
  getSelectedMounting,
  getStatusColor,
  statusLabel,
  truncateText,
} from './Tambahbahanutils';

const API_BASE = import.meta.env.VITE_API_LINK;

type SortDirection = 'asc' | 'desc';

const TambahBahanSPV: React.FC = () => {
  // Table state
  const [list, setList] = useState<TambahBahanPersiapan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusTiket, setStatusTiket] = useState<StatusTiket>('incoming');
  const [searchInput, setSearchInput] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortKey, setSortKey] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  // Request modal state
  const [showModal, setShowModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [joList, setJoList] = useState<JOData[]>([]);
  const [selectedJoOption, setSelectedJoOption] = useState<Option | null>(null);
  // Basic info (no_jo/customer/produk) comes from the list used to populate
  // the select. Kertas (id_kertas/nama_kertas) always comes from a fresh
  // "get by id" call so it reflects the JO's current mounting, never from
  // whatever happened to be embedded in the list response.
  const [selectedJODetail, setSelectedJODetail] = useState<JOData | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [qty, setQty] = useState<string>('');
  const [note, setNote] = useState<string>('');

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get<APIResponse<TambahBahanPersiapan[]>>(
        `${API_BASE}/gudangRM/tambahBahanPersiapan`,
        {
          params: { status_tiket: statusTiket },
          withCredentials: true,
        },
      );
      setList(res.data.data || []);
    } catch (error) {
      console.error('Error fetching tambah bahan list:', error);
      toast.error('Gagal mengambil data tambah bahan');
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [statusTiket]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const fetchJOList = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/ppic/jo`, {
        params: { status_proses: 'done' },
        withCredentials: true,
      });
      setJoList(res.data.data || []);
    } catch (error) {
      console.error('Error fetching JO list:', error);
      toast.error('Gagal mengambil data JO');
    }
  }, []);

  const openModal = () => {
    setShowModal(true);
    setSelectedJoOption(null);
    setSelectedJODetail(null);
    setQty('');
    setNote('');
    if (joList.length === 0) fetchJOList();
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedJoOption(null);
    setSelectedJODetail(null);
    setQty('');
    setNote('');
  };

  const selectedMounting = useMemo(
    () => getSelectedMounting(selectedJODetail),
    [selectedJODetail],
  );

  // Options for the searchable select - search happens inside the select
  // itself (react-select's built-in filter), no separate search box needed.
  const joOptions: Option[] = useMemo(
    () =>
      joList.map((jo) => ({
        value: String(jo.id),
        label: `${jo.no_jo} - ${jo.customer} - ${jo.produk}`,
      })),
    [joList],
  );

  // Once a JO is picked, fetch it by id to get its current jo_mounting ->
  // id_kertas / nama_kertas, rather than trusting whatever the list call
  // happened to embed.
  const handleSelectJO = async (option: SingleValue<Option>) => {
    setSelectedJoOption(option);
    setSelectedJODetail(null);

    if (!option) return;

    setLoadingDetail(true);
    try {
      const res = await axios.get(`${API_BASE}/ppic/jo/${option.value}`, {
        withCredentials: true,
      });
      setSelectedJODetail(res.data.data || res.data);
    } catch (error) {
      console.error('Error fetching JO detail:', error);
      toast.error('Gagal mengambil detail JO');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedJoOption || !selectedJODetail) {
      toast.error('Mohon pilih JO terlebih dahulu');
      return;
    }
    if (!selectedMounting) {
      toast.error('JO ini tidak memiliki data kertas (mounting)');
      return;
    }
    const qtyNum = Number(qty);
    if (!qty || qtyNum <= 0) {
      toast.error('Qty tambah bahan harus lebih dari 0');
      return;
    }
    if (!note.trim()) {
      toast.error('Mohon isi catatan / note');
      return;
    }

    const payload: TambahBahanCreatePayload = {
      id_jo: selectedJODetail.id,
      id_kertas: selectedMounting.id_kertas,
      qty_tambah_bahan: qtyNum,
      note: note.trim(),
    };

    try {
      setSubmitting(true);
      await axios.post(`${API_BASE}/gudangRM/tambahBahanPersiapan`, payload, {
        withCredentials: true,
      });
      toast.success('Permintaan tambah bahan berhasil dikirim');
      closeModal();
      setStatusTiket('incoming');
      fetchList();
    } catch (error: any) {
      console.error('Error submitting tambah bahan:', error);
      toast.error(error.response?.data?.message || 'Gagal mengirim permintaan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSearch = () => {
    setSearchTerm(searchInput);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchTerm('');
    setPage(1);
  };

  const handleSort = (field: string) => {
    if (sortKey === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (key: string) => {
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

  const filteredData = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let data = [...list];
    if (term) {
      data = data.filter(
        (item) =>
          item.no_jo?.toLowerCase().includes(term) ||
          item.customer?.toLowerCase().includes(term) ||
          item.produk?.toLowerCase().includes(term) ||
          item.nama_kertas?.toLowerCase().includes(term),
      );
    }
    data.sort((a, b) => {
      const aValue = (a as any)[sortKey];
      const bValue = (b as any)[sortKey];
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return data;
  }, [list, searchTerm, sortKey, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / limit));
  const pagedData = filteredData.slice((page - 1) * limit, page * limit);

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  return (
    <div className="">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-2 flex-1">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search NO JO, Customer, Produk, Kertas..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              />
              <svg
                className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
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
            <div className="flex gap-2">
              <button
                onClick={handleSearch}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Search
              </button>
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <button
            onClick={openModal}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
          >
            + Request Tambah Bahan
          </button>
        </div>

        {/* Status Tiket Tabs */}
        <div className="flex gap-2">
          {(['incoming', 'history'] as StatusTiket[]).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setStatusTiket(tab);
                setPage(1);
              }}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors capitalize ${
                statusTiket === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                  NO
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('no_jo')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    NO JO {getSortIcon('no_jo')}
                  </button>
                </th>

                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  KERTAS
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('qty_tambah_bahan')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    QTY {getSortIcon('qty_tambah_bahan')}
                  </button>
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NOTE
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('createdAt')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    TANGGAL {getSortIcon('createdAt')}
                  </button>
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  STATUS
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <p className="mt-2 text-sm text-gray-600">
                        Loading data...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : pagedData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center">
                    <p className="text-sm text-gray-500">
                      {searchTerm
                        ? 'Tidak ada data yang sesuai dengan pencarian'
                        : 'Belum ada permintaan tambah bahan'}
                    </p>
                  </td>
                </tr>
              ) : (
                pagedData.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-900">
                      {(page - 1) * limit + index + 1}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs font-medium text-gray-900">
                      {item.no_jo || '-'}
                    </td>

                    <td className="px-3 py-3 text-xs text-gray-900">
                      <div className="max-w-xs" title={item.nama_kertas}>
                        {truncateText(item.nama_kertas, 500)}
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-900">
                      {item.qty_tambah_bahan?.toLocaleString() || 0}
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-900">
                      <div className="max-w-xs" title={item.note}>
                        {truncateText(item.note, 500)}
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-900">
                      {formatDateTime(item.createdAt)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          item.status,
                        )}`}
                      >
                        {statusLabel(item.status)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
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
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1 text-sm rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Prev
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1 text-sm rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      {/* Request Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-stroke">
              <h3 className="text-base font-bold text-gray-800">
                Request Tambah Bahan Persiapan
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                &times;
              </button>
            </div>

            <div className="flex flex-col gap-3 px-5 py-4">
              <div className="flex flex-col gap-1">
                <label className="text-black text-xs font-bold">
                  Job Order
                </label>
                <Select<Option>
                  value={selectedJoOption}
                  onChange={handleSelectJO}
                  options={joOptions}
                  isClearable
                  isSearchable
                  placeholder="Cari No JO / Customer / Produk..."
                  noOptionsMessage={() => 'JO tidak ditemukan'}
                  classNamePrefix="jo-select"
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      minHeight: '36px',
                      fontSize: '12px',
                      borderWidth: 2,
                      borderColor: state.isFocused ? '#3b82f6' : '#e2e8f0',
                      boxShadow: 'none',
                      '&:hover': { borderColor: '#3b82f6' },
                    }),
                    option: (base) => ({ ...base, fontSize: '12px' }),
                    menu: (base) => ({ ...base, fontSize: '12px', zIndex: 20 }),
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-black text-xs font-bold">
                    Customer
                  </label>
                  <input
                    readOnly
                    value={selectedJODetail?.customer || ''}
                    className="w-full h-9 px-3 border-2 border-stroke rounded-md text-xs bg-gray-50"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-black text-xs font-bold">Produk</label>
                  <input
                    readOnly
                    value={selectedJODetail?.produk || ''}
                    className="w-full h-9 px-3 border-2 border-stroke rounded-md text-xs bg-gray-50"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-black text-xs font-bold">
                  Kertas (otomatis dari JO)
                </label>
                <input
                  readOnly
                  value={selectedMounting?.nama_kertas || ''}
                  placeholder={
                    loadingDetail
                      ? 'Memuat data kertas...'
                      : selectedJoOption
                      ? 'JO ini tidak memiliki data kertas'
                      : 'Pilih JO terlebih dahulu'
                  }
                  className="w-full h-9 px-3 border-2 border-stroke rounded-md text-xs bg-gray-50"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-black text-xs font-bold">
                  Qty Tambah Bahan
                </label>
                <input
                  type="number"
                  min={1}
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  placeholder="0"
                  className="w-full h-9 px-3 border-2 border-stroke rounded-md text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-black text-xs font-bold">Note</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="Catatan tambah bahan"
                  className="w-full px-3 py-2 border-2 border-stroke rounded-md text-xs"
                />
              </div>
            </div>

            <div className="flex gap-2 px-5 py-4 border-t border-stroke">
              <button
                onClick={closeModal}
                className="flex-1 h-9 text-center text-gray-700 text-xs font-bold rounded-md bg-gray-100 hover:bg-gray-200"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 h-9 text-center text-white text-xs font-bold rounded-md bg-[#0065DE] hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Mengirim...' : 'Kirim Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TambahBahanSPV;
