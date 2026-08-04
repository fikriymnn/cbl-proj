// IOMarketingHistory.tsx
import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState, useRef } from 'react';
import SearchableSelect from '../../../../pages/MasterData/Marketing/SearchableSelect';
import IODetailPopup from './IODetailPopup';
import Pagination from '@mui/material/Pagination/Pagination';
import Stack from '@mui/material/Stack';

import { MountingData, TahapanData } from './Mounting';
import IOMarketingPrintModal from './IOMarketingPrintModal';
import { usePermissions } from '../../../../constant/usePermissions';

interface UserActionData {
  id: number;
  id_io: number;
  id_user: number;
  status: string;
  tgl: string;
  createdAt: string;
  updatedAt: string;
  is_active: boolean;
  user: {
    id: number;
    nama: string;
    bagian: string;
    email: string;
    role: string;
    no: string;
    status: string;
  };
}

interface UserData {
  id: number;
  nama: string;
  bagian: string;
  email: string;
  role: string;
  no: string;
  status: string;
}

interface IOData {
  id: number;
  no_io: string;
  base_no_io: string;
  customer: string;
  produk: string;
  status_io: string;
  status: string;
  status_proses: string;
  tgl_pembuatan_io: string;
  tgl_approve_io?: string;
  revisi_ke: number;
  is_active: boolean;
  is_updated: boolean;
  note_reject: string;
  keterangan: string;
  label: string;
  status_send_proof: string;
  id_customer: number;
  id_produk: number;
  id_okp: number;
  id_create_io: number;
  id_approve_io: number;
  createdAt: string;
  updatedAt: string;
  io_mounting?: MountingData[];
  io_action_user?: UserActionData[];
  user_create?: UserData;
  user_approve?: UserData;
  is_send_proof: boolean;
}

interface OKPData {
  id: number;
  no_okp: string;
  customer: string;
  produk: string;
  status_okp: string;
  rencana_qty_po: number;
  rencana_tgl_kirim: string;
}

type SortOrder = 'newest' | 'oldest';
type SortBy = 'tgl_approve_io' | 'createdAt';

// ─── Edit No IO Modal ───────────────────────────────────────────────────────

interface EditIOModalProps {
  ioId: number;
  currentNoIo: string;
  currentProduk: string;
  onClose: () => void;
  onUpdated: () => void;
}

const EditIOModal: React.FC<EditIOModalProps> = ({
  ioId,
  currentNoIo,
  currentProduk,
  onClose,
  onUpdated,
}) => {
  const [noIo, setNoIo] = useState(currentNoIo || '');
  const [produk, setProduk] = useState(currentProduk || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!noIo.trim() && !produk.trim()) {
      alert('Isi minimal salah satu field');
      return;
    }
    const body: { no_io?: string; produk?: string } = {};
    if (noIo.trim()) body.no_io = noIo.trim();
    if (produk.trim()) body.produk = produk.trim();

    try {
      setSubmitting(true);
      await axios.put(
        `${import.meta.env.VITE_API_LINK}/marketing/noIoUpdate/${ioId}`,
        body,
        { withCredentials: true },
      );
      onUpdated();
    } catch (err: unknown) {
      console.error(err);
      const error = err as {
        response?: { data?: { msg?: string; message?: string } };
      };
      alert(
        error?.response?.data?.msg ??
          error?.response?.data?.message ??
          'Gagal mengubah No IO',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="bg-blue-500 px-5 py-4 text-white rounded-t-lg flex justify-between items-center">
          <h3 className="text-base font-bold">Ubah No IO</h3>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-100 text-2xl font-bold leading-none"
          >
            ×
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              No IO
            </label>
            <input
              type="text"
              value={noIo}
              onChange={(e) => setNoIo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              placeholder="Contoh: 4628-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Produk
            </label>
            <input
              type="text"
              value={produk}
              onChange={(e) => setProduk(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              placeholder="Nama produk"
            />
          </div>
          <p className="text-xs text-gray-400">
            Boleh isi salah satu saja — field yang dikosongkan tidak akan
            diubah.
          </p>
        </div>
        <div className="px-5 pb-5 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-md text-sm transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-medium rounded-md text-sm transition-colors"
          >
            {submitting ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────

const IOMarketingHistory: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [ioData, setIOData] = useState<IOData[]>([]);
  const [okpData, setOKPData] = useState<OKPData[]>([]);

  const [showDetailPopup, setShowDetailPopup] = useState<boolean>(false);
  const [selectedIOId, setSelectedIOId] = useState<number | null>(null);

  // Pagination states
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  // Search states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');

  // Add is_active filter state
  const [isActiveFilter, setIsActiveFilter] = useState<string>('active');

  // Server-side sort filter states
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [sortBy, setSortBy] = useState<SortBy>('createdAt');

  // Print states
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [printIOId, setPrintIOId] = useState<number | null>(null);
  const [printData, setPrintData] = useState<IOData | null>(null);
  const [selectedMountingIndex, setSelectedMountingIndex] = useState<number>(0);
  const printRef = useRef<HTMLDivElement>(null);

  // Send Proof states
  const [showSendProofConfirm, setShowSendProofConfirm] =
    useState<boolean>(false);
  const [sendProofIOId, setSendProofIOId] = useState<number | null>(null);
  const [sendProofIONumber, setSendProofIONumber] = useState<string>('');
  const [sendProofQty, setSendProofQty] = useState<number>(400);

  // Edit No IO states
  const [showEditIoModal, setShowEditIoModal] = useState<boolean>(false);
  const [editIoTarget, setEditIoTarget] = useState<IOData | null>(null);

  // ── Permissions ──
  const role = localStorage.getItem('userRole') ?? '';
  const bagian = localStorage.getItem('userBagian') ?? '';
  const { checkEdit } = usePermissions(role, bagian);
  const canEditIO = checkEdit('/marketing/io/history');

  // Utility function to truncate text
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '-';
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  // Search functions
  const handleSearch = (): void => {
    setSearchTerm(searchInput);
    setPage(1);
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

  // Handle is_active filter change
  const handleIsActiveFilterChange = (value: string): void => {
    setIsActiveFilter(value);
    setPage(1);
  };

  // Handle server-side sort filter changes
  const handleSortOrderChange = (order: SortOrder): void => {
    setSortOrder(order);
    setPage(1);
  };

  const handleSortByChange = (by: SortBy): void => {
    setSortBy(by);
    setPage(1);
  };

  const fetchIOData = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/marketing/io`;
    try {
      setLoading(true);

      const params: any = {
        page: page,
        limit: limit,
        search: searchTerm,
        status: 'history',
        sort: sortOrder,
        sort_by: sortBy,
      };

      if (isActiveFilter === 'active') {
        params.is_active = true;
      } else if (isActiveFilter === 'inactive') {
        params.is_active = false;
      }

      const res: AxiosResponse = await axios.get(url, {
        params: params,
        withCredentials: true,
      });
      console.log('Fetched IO data:', res.data);
      if (res.data.succes) {
        setIOData(res.data.data);
        if (res.data.total_page) {
          setTotalPages(res.data.total_page);
        }
      }
    } catch (error) {
      console.error('Error fetching IO data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch IO detail for printing
  const fetchIODetailForPrint = async (ioId: number): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/marketing/io/${ioId}`;
    try {
      setLoading(true);
      const res: AxiosResponse = await axios.get(url, {
        withCredentials: true,
      });
      console.log('Fetched IO detail for print:', res.data);
      if (res.data.succes && res.data.data) {
        setPrintData(res.data.data);
        setSelectedMountingIndex(0);
      }
    } catch (error) {
      console.error('Error fetching IO detail:', error);
      alert('Failed to fetch IO detail for printing');
    } finally {
      setLoading(false);
    }
  };

  const putNextProcess = async (id: any): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/marketing/io/request/${id}`;
    try {
      setLoading(true);
      const res: AxiosResponse = await axios.put(url, {
        withCredentials: true,
      });
      fetchIOData();
      console.log('NextProcess:', res.data);
    } catch (error) {
      console.error('Error fetching IO data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Send Proof functions
  const handleSendProof = (ioId: number, ioNumber: string): void => {
    setSendProofIOId(ioId);
    setSendProofIONumber(ioNumber);
    setSendProofQty(400);
    setShowSendProofConfirm(true);
  };

  const cancelSendProof = (): void => {
    setShowSendProofConfirm(false);
    setSendProofIOId(null);
    setSendProofIONumber('');
    setSendProofQty(400);
  };

  const confirmSendProof = async (): Promise<void> => {
    if (!sendProofIOId) return;

    if (sendProofQty < 1) {
      alert('Quantity must be at least 1');
      return;
    }

    const url = `${
      import.meta.env.VITE_API_LINK
    }/marketing/io/sendProof/${sendProofIOId}`;
    try {
      setLoading(true);
      const res: AxiosResponse = await axios.put(
        url,
        { qty_send_proof: sendProofQty },
        { withCredentials: true },
      );

      if (res.data.succes || res.status === 200) {
        alert('Proof sent successfully');
        fetchIOData();
        setShowSendProofConfirm(false);
        setSendProofIOId(null);
        setSendProofIONumber('');
        setSendProofQty(400);
      } else {
        alert('Failed to send proof');
      }
      console.log('SendProof:', res.data);
    } catch (error) {
      console.error('Error sending proof:', error);
      alert('Error sending proof. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusColor = (status?: string): string => {
    switch (status?.toLowerCase()) {
      case 'baru':
        return 'bg-blue-100 text-blue-800';
      case 'repeat perubahan':
        return 'bg-green-100 text-green-800';
      case 'repeat':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor2 = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'requested':
        return 'bg-orange-100 text-orange-800 border border-orange-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'reject npd':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'pending':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  // Print functions
  const handlePrintIO = (ioId: number) => {
    setPrintIOId(ioId);
    fetchIODetailForPrint(ioId);
    setShowPrintModal(true);
  };

  const handleClosePrintModal = () => {
    setShowPrintModal(false);
    setPrintIOId(null);
    setPrintData(null);
    setSelectedMountingIndex(0);
  };

  useEffect(() => {
    fetchIOData();
  }, [page, limit, searchTerm, isActiveFilter, sortOrder, sortBy]);

  const handleShowDetail = (ioId: number) => {
    setSelectedIOId(ioId);
    setShowDetailPopup(true);
  };

  // Edit No IO handlers
  const handleEditIO = (item: IOData) => {
    setEditIoTarget(item);
    setShowEditIoModal(true);
  };

  const handleCloseEditIoModal = () => {
    setShowEditIoModal(false);
    setEditIoTarget(null);
  };

  const handleIoUpdated = () => {
    handleCloseEditIoModal();
    fetchIOData();
  };

  return (
    <div className="">
      {/* Header with Search and Filter */}
      <div className="mb-6">
        {/* Row 1: Search */}
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <input
            type="text"
            placeholder="Search IO..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 w-64 text-sm"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Search
          </button>
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="bg-gray-500 hover:bg-gray-600 text-red-600 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Clear
            </button>
          )}

          {/* Is Active Filter Dropdown */}
          <div className="flex items-center gap-2 ml-4">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={isActiveFilter}
              onChange={(e) => handleIsActiveFilterChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm bg-white"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Row 2: Sort filters */}
        <div className="flex items-end gap-4 flex-wrap">
          {/* Sort By */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => handleSortByChange(e.target.value as SortBy)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm bg-white"
            >
              <option value="createdAt">Tgl Dibuat</option>
              <option value="tgl_approve_io">Tgl Approve IO</option>
            </select>
          </div>

          {/* Sort Order toggle */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Sort</label>
            <div className="flex rounded-md overflow-hidden border border-gray-300">
              <button
                onClick={() => handleSortOrderChange('newest')}
                className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1 ${
                  sortOrder === 'newest'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                  />
                </svg>
                Newest
              </button>
              <button
                onClick={() => handleSortOrderChange('oldest')}
                className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1 border-l border-gray-300 ${
                  sortOrder === 'oldest'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"
                  />
                </svg>
                Oldest
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                  NO
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                  ACTION
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NO IO
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  STATUS IO
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CUSTOMER
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PRODUK
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TGL DIBUAT / APPROVE
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  STATUS
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  STATUS PROSES
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-6 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : ioData.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-6 text-center text-gray-500 text-sm"
                  >
                    {searchTerm
                      ? 'No IO found matching your search'
                      : 'No IO data available'}
                  </td>
                </tr>
              ) : (
                ioData.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                      {(page - 1) * limit + index + 1}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs font-medium">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleShowDetail(item.id)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs transition-colors"
                          title="View Details"
                        >
                          DETAIL
                        </button>
                        {item.status == 'draft' && (
                          <button
                            onClick={() => putNextProcess(item.id)}
                            className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs transition-colors"
                          >
                            NEXT
                          </button>
                        )}
                        <button
                          onClick={() => handlePrintIO(item.id)}
                          className="bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded text-xs transition-colors"
                          title="Print IO"
                        >
                          PRINT
                        </button>
                        <button
                          onClick={() => handleSendProof(item.id, item.no_io)}
                          disabled={item.is_send_proof === true}
                          className={`px-2 py-1 rounded text-xs transition-colors ${
                            item.is_send_proof === true
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-cyan-500 hover:bg-cyan-600 text-white'
                          }`}
                          title={
                            item.is_send_proof
                              ? 'Proof already sent'
                              : 'Send Proof'
                          }
                        >
                          {item.is_send_proof ? 'PROOF SENT' : 'SEND PROOF'}
                        </button>
                        {/* {canEditIO && (
                          <button
                            onClick={() => handleEditIO(item)}
                            className="bg-amber-500 hover:bg-amber-600 text-white px-2 py-1 rounded text-xs transition-colors"
                            title="Ubah No IO"
                          >
                            UBAH NO IO
                          </button>
                        )} */}
                      </div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      <span
                        className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded font-medium"
                        title={item.no_io}
                      >
                        {item.no_io ? truncateText(item.no_io, 20) : '-'}
                      </span>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded font-medium ${getStatusColor(
                          item.status_io,
                        )}`}
                        title={item.status_io}
                      >
                        {truncateText(item.status_io, 8)}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-xs text-gray-900 max-w-32">
                      <span title={item.customer}>
                        {truncateText(item.customer, 40)}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-xs text-gray-900 max-w-32">
                      <span title={item.produk}>
                        {truncateText(item.produk, 100)}
                      </span>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                      <div className="flex flex-col gap-0.5">
                        <span title={item.tgl_pembuatan_io}>
                          <span className="text-gray-500">Dibuat: </span>
                          {formatDate(item.tgl_pembuatan_io)}
                        </span>
                        <span title={item.tgl_approve_io ?? '-'}>
                          <span className="text-gray-500">Approve: </span>
                          {item.tgl_approve_io
                            ? formatDate(item.tgl_approve_io)
                            : '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded font-medium ${getStatusColor2(
                          item.status,
                        )}`}
                        title={item.status}
                      >
                        {truncateText(item.status, 8)}
                      </span>
                    </td>
                    <td className="px-2 py-2 flex flex-col gap-1 items-center">
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded font-medium ${getStatusColor2(
                          item.status_proses,
                        )}`}
                        title={item.status_proses}
                      >
                        {truncateText(item.status_proses, 20)}
                      </span>
                      {item.status_proses.toLowerCase() === 'reject npd' && (
                        <>
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded font-medium ${getStatusColor2(
                              item.status_proses,
                            )}`}
                            title={item.note_reject}
                          >
                            {truncateText(item.note_reject, 20)}
                          </span>
                        </>
                      )}
                    </td>
                  </tr>
                ))
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
              }}
            />
          </Stack>
        </div>
      </div>

      {showDetailPopup && selectedIOId && (
        <IODetailPopup
          ioId={selectedIOId}
          isOpen={showDetailPopup}
          onClose={() => {
            setShowDetailPopup(false);
            setSelectedIOId(null);
          }}
        />
      )}

      {/* Print Modal */}
      {showPrintModal && printData && (
        <IOMarketingPrintModal
          isOpen={showPrintModal}
          printData={printData}
          selectedMountingIndex={selectedMountingIndex}
          onClose={handleClosePrintModal}
          onMountingIndexChange={setSelectedMountingIndex}
        />
      )}

      {/* Send Proof Confirmation Modal */}
      {showSendProofConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center mb-4">
              <svg
                className="w-6 h-6 text-cyan-600 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2 className="text-xl font-bold text-gray-900">
                Confirm Send Proof
              </h2>
            </div>
            <p className="text-gray-600 mb-2">
              Apa Anda yakin ingin mengirim proof untuk IO berikut?
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
              <p className="text-sm font-medium text-gray-700">IO Number:</p>
              <p className="text-sm font-bold text-blue-800">
                {sendProofIONumber}
              </p>
            </div>

            {/* Quantity Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity DRUK to Send <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                min="0"
                value={sendProofQty}
                onChange={(e) => setSendProofQty(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Enter quantity"
                disabled={loading}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={cancelSendProof}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={confirmSendProof}
                className="px-4 py-2 bg-cyan-500 text-white rounded-md hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Proof'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit No IO Modal */}
      {showEditIoModal && editIoTarget && (
        <EditIOModal
          ioId={editIoTarget.id}
          currentNoIo={editIoTarget.no_io}
          currentProduk={editIoTarget.produk || ''}
          onClose={handleCloseEditIoModal}
          onUpdated={handleIoUpdated}
        />
      )}
    </div>
  );
};
export default IOMarketingHistory;
