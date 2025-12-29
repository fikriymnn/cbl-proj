import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState, useRef } from 'react';
import SearchableSelect from '../../../../pages/MasterData/Marketing/SearchableSelect';
import IODetailPopup from './IODetailPopup';
import Pagination from '@mui/material/Pagination/Pagination';
import Stack from '@mui/material/Stack';

import { MountingData } from './Mounting';
import IOMarketingPrintModal from './IOMarketingPrintModal';

interface IOData {
  id: number;
  no_io: string;
  customer: string;
  produk: string;
  status_io: string;
  status: string;
  status_proses: string;
  tgl_pembuatan_io: string;
  is_revisi: boolean;
  revisi_no_io: string;
  is_active: boolean;
  note_reject: string;
  io_mounting?: MountingData[];
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

type SortField = keyof IOData;
type SortDirection = 'asc' | 'desc';

const IOMarketing: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [ioData, setIOData] = useState<IOData[]>([]);
  const [okpData, setOKPData] = useState<OKPData[]>([]);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    id_okp: '',
    is_revisi: false,
  });
  const [showDetailPopup, setShowDetailPopup] = useState<boolean>(false);
  const [selectedIOId, setSelectedIOId] = useState<number | null>(null);

  // Pagination states
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  // Search states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');

  // Add sorting state
  const [sortKey, setSortKey] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [generatedIONumber, setGeneratedIONumber] = useState<string>('');
  const [keterangan, setKeterangan] = useState<string>('');

  // Print states
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [printIOId, setPrintIOId] = useState<number | null>(null);
  const [printData, setPrintData] = useState<IOData | null>(null);
  const [selectedMountingIndex, setSelectedMountingIndex] = useState<number>(0);
  const printRef = useRef<HTMLDivElement>(null);

  // Add sorting functions
  const handleSort = (field: SortField) => {
    if (sortKey === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (key: SortField) => {
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

  // Create sorted data
  const sortedData = React.useMemo(() => {
    const sorted = [...ioData].sort((a, b) => {
      let aValue = a[sortKey];
      let bValue = b[sortKey];

      // Normalize undefined/null to empty string so comparisons are safe
      if (aValue === undefined || aValue === null) aValue = '';
      if (bValue === undefined || bValue === null) bValue = '';

      // If both are numbers, compare numerically
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // If both are booleans, compare as 0/1
      if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
        const av = aValue ? 1 : 0;
        const bv = bValue ? 1 : 0;
        return sortDirection === 'asc' ? av - bv : bv - av;
      }

      // Fallback to string comparison (case-insensitive)
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      if (aStr < bStr) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aStr > bStr) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
    return sorted;
  }, [ioData, sortKey, sortDirection]);

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

  // Add this new function to fetch IO count
  const fetchIOCount = async (): Promise<number> => {
    const url = `${import.meta.env.VITE_API_LINK}/marketing/ioJumlahData`;
    try {
      const res: AxiosResponse = await axios.get(url, {
        withCredentials: true,
      });
      if (res.data.succes) {
        return res.data.total_data;
      }
      return 0;
    } catch (error) {
      console.error('Error fetching IO count:', error);
      return 0;
    }
  };

  // Add this new function to fetch previous OKP data
  const fetchPreviousOKPData = async (
    okpId: number,
  ): Promise<string | null> => {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/marketing/ioPreviousByOkp/${okpId}`;
    try {
      const res: AxiosResponse = await axios.get(url, {
        withCredentials: true,
      });
      if (res.data.succes && res.data.data && res.data.data.no_io) {
        return res.data.data.no_io;
      }

      return null;
    } catch (error) {
      console.error('Error fetching previous OKP data:', error);
      return null;
    }
  };

  // Updated Generate auto number for IO
  const generateIONumber = async (): Promise<string> => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();

    const selectedOKP = okpData.find(
      (okp) => okp.id.toString() === formData.id_okp,
    );

    if (!selectedOKP) {
      return `IO-00001/${month}/${year}`;
    }

    // If status is 'baru', generate new IO number
    if (selectedOKP.status_okp === 'baru') {
      const totalData = await fetchIOCount();
      const nextNumber = totalData + 1;
      const paddedNumber = String(nextNumber).padStart(5, '0');
      return `IO-${paddedNumber}/${month}/${year}`;
    }

    // If status is 'repeat' or 'repeat perubahan', get previous IO and increment revision
    const previousIONumber = await fetchPreviousOKPData(selectedOKP.id);

    if (!previousIONumber) {
      // Fallback if no previous IO found
      const totalData = await fetchIOCount();
      const nextNumber = totalData + 1;
      const paddedNumber = String(nextNumber).padStart(5, '0');
      return `IO-${paddedNumber}/${month}/${year}`;
    }

    // Parse the previous IO number to extract revision number
    const ioMatch = previousIONumber.match(
      /^IO-(\d+)(?:-(\d+))?\/(\d{2})\/(\d{4})$/,
    );

    if (ioMatch) {
      const baseNumber = ioMatch[1];
      const currentRevision = ioMatch[2] ? parseInt(ioMatch[2]) : 0;
      const prevMonth = ioMatch[3];
      const prevYear = ioMatch[4];

      const nextRevision = currentRevision + 1;
      return `IO-${baseNumber}-${nextRevision}/${prevMonth}/${prevYear}`;
    }

    // Fallback if parsing fails
    const totalData = await fetchIOCount();
    const nextNumber = totalData + 1;
    const paddedNumber = String(nextNumber).padStart(5, '0');
    return `IO-${paddedNumber}/${month}/${year}`;
  };

  const PutIO = async (): Promise<void> => {
    const selectedOKP = okpData.find(
      (okp) => okp.id.toString() === formData.id_okp,
    );
    if (!selectedOKP) return;

    const url = `${import.meta.env.VITE_API_LINK}/marketing/io`;
    try {
      setLoading(true);
      const ioNumber = await generateIONumber();

      const res: AxiosResponse = await axios.post(
        url,
        {
          id_okp: formData.id_okp,
          no_io: ioNumber,
          status_io: selectedOKP.status_okp,
          base_no_io: ioNumber,
          is_revisi: null,
          revisi_no_io: '',
          keterangan: keterangan,
        },
        {
          withCredentials: true,
        },
      );

      if (res.data.succes) {
        setShowCreateForm(false);
        setFormData({ id_okp: '', is_revisi: false });
        fetchIOData();
        fetchOKPData();
      }
    } catch (error) {
      console.error('Error creating IO:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOKPData = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/marketing/okp`;
    try {
      setLoading(true);
      const res: AxiosResponse = await axios.get(url, {
        params: { status: 'history', is_io_done: false },
        withCredentials: true,
      });
      console.log('Fetched OKP data:', res.data);
      if (res.data.succes) {
        setOKPData(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching OKP data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchIOData = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/marketing/io`;
    try {
      setLoading(true);
      const res: AxiosResponse = await axios.get(url, {
        params: {
          page: page,
          limit: limit,
          search: searchTerm,
          status: 'draft',
        },
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
        setSelectedMountingIndex(0); // Default to first mounting
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

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
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

  const getStatusColor2 = (status: string) => {
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
    fetchOKPData();
  }, []);

  useEffect(() => {
    fetchIOData();
  }, [page, limit, searchTerm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    PutIO();
  };

  const handleShowDetail = (ioId: number) => {
    setSelectedIOId(ioId);
    setShowDetailPopup(true);
  };

  // Add effect to update IO number when OKP is selected
  useEffect(() => {
    if (formData.id_okp) {
      generateIONumber().then(setGeneratedIONumber);
    } else {
      setGeneratedIONumber('');
    }
  }, [formData.id_okp, okpData]);

  return (
    <div className="">
      {/* Header with Search */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
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
              className="bg-gray-500 hover:bg-gray-600 text-red-500 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <span>+</span>
          Create IO
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                  <button className="flex items-center hover:text-gray-700 focus:outline-none">
                    NO
                  </button>
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                  ACTION
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('no_io')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    NO IO
                    {getSortIcon('no_io')}
                  </button>
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('status_io')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    STATUS IO
                    {getSortIcon('status_io')}
                  </button>
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('customer')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    CUSTOMER
                    {getSortIcon('customer')}
                  </button>
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('produk')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    PRODUK
                    {getSortIcon('produk')}
                  </button>
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('tgl_pembuatan_io')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    TGL BUAT
                    {getSortIcon('tgl_pembuatan_io')}
                  </button>
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    STATUS
                    {getSortIcon('status')}
                  </button>
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('status_proses')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    STATUS PROSES
                    {getSortIcon('status_proses')}
                  </button>
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
              ) : sortedData.length === 0 ? (
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
                sortedData.map((item, index) => (
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
                      </div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      <span
                        className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded font-medium"
                        title={item.no_io}
                      >
                        {item.no_io ? truncateText(item.no_io, 12) : '-'}
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
                        {truncateText(item.customer, 20)}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-xs text-gray-900 max-w-32">
                      <span title={item.produk}>
                        {truncateText(item.produk, 20)}
                      </span>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                      <span title={item.tgl_pembuatan_io}>
                        {formatDate(item.tgl_pembuatan_io)}
                      </span>
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

      {/* Create IO Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Create New IO</h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nomor OKP */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor OKP <span className="text-red-500">*</span>
                </label>
                <SearchableSelect
                  options={[
                    { value: '', label: 'Pilih OKP' },
                    ...okpData.map((okp) => ({
                      value: okp.id.toString(),
                      label: `${okp.no_okp} - ${okp.customer} - ${okp.produk}`,
                    })),
                  ]}
                  value={formData.id_okp}
                  onChange={(value) =>
                    setFormData({ ...formData, id_okp: String(value) })
                  }
                  placeholder="Pilih OKP"
                  required
                />
              </div>

              {/* Nomor IO (Auto Generated) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor IO
                </label>
                <input
                  type="text"
                  value={generatedIONumber}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                />
              </div>

              {/* Status (Auto from OKP) */}
              {formData.id_okp && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <input
                    type="text"
                    value={
                      okpData.find(
                        (okp) => okp.id.toString() === formData.id_okp,
                      )?.status_okp || ''
                    }
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keterangan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  onChange={(e) => setKeterangan(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                ></input>
              </div>
              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!formData.id_okp || loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create IO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default IOMarketing;
