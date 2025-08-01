import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Types
interface PerubahanTanggal {
  id: number;
  id_tiket_jadwal_produksi: number;
  no_booking: string;
  nama_approval: string | null;
  from_tgl: string;
  to_tgl: string;
  status: string | null;
  status_tiket: string;
  createdAt: string;
  updatedAt: string;
}

// Helper function to format date
const convertTimeStampToDate = (timestamp: string) => {
  if (!timestamp) return '-';
  return new Date(timestamp).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

// Helper function to format datetime
const formatDateTime = (timestamp: string) => {
  if (!timestamp) return '-';
  return new Date(timestamp).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Status badge component
const StatusBadge: React.FC<{ status: string | null }> = ({ status }) => {
  const getStatusStyle = (status: string | null) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case null:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string | null) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case null:
        return 'Incomming';
      default:
        return status || 'Incomming';
    }
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusStyle(
        status,
      )}`}
    >
      {getStatusText(status)}
    </span>
  );
};

// Ticket status badge component
const TicketStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'incoming':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'history':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'incoming':
        return 'Incoming';
      case 'history':
        return 'History';
      default:
        return status;
    }
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusStyle(
        status,
      )}`}
    >
      {getStatusText(status)}
    </span>
  );
};

const PerubahanTanggalKirim: React.FC = () => {
  const [perubahanData, setPerubahanData] = useState<PerubahanTanggal[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ticketStatusFilter, setTicketStatusFilter] = useState<string>('all');

  // Get data from API
  const getTanggalPerubahan = useCallback(async () => {
    setIsLoading(true);
    try {
      const url = `${import.meta.env.VITE_API_LINK}/ppic/perubahanTglKirim`;
      const res = await axios.get(url, { withCredentials: true });

      if (res.data.success) {
        setPerubahanData(res.data.data || []);
      }
    } catch (error: any) {
      console.error('Error fetching perubahan tanggal:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getTanggalPerubahan();
  }, [getTanggalPerubahan]);

  // Filter data based on search and status
  const filteredData = perubahanData.filter((item) => {
    const matchesSearch =
      item.no_booking.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.nama_approval &&
        item.nama_approval.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' ||
      item.status === statusFilter ||
      (statusFilter === 'pending' && item.status === null);

    const matchesTicketStatus =
      ticketStatusFilter === 'all' || item.status_tiket === ticketStatusFilter;

    return matchesSearch && matchesStatus && matchesTicketStatus;
  });

  // Handle search input change
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    [],
  );

  return (
    <main className="overflow-x-scroll">
      {/* Loading overlay */}
      {(isLoading || isActionLoading) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">
              {isActionLoading ? 'Memproses kalkulasi...' : 'Memuat data...'}
            </span>
          </div>
        </div>
      )}

      <div className="min-w-[700px] bg-white rounded-xl flex gap-1">
        <div className="flex w-full flex-col bg-gradient-to-br from-[#D8EAFF] to-[#E8F4FF]">
          {/* Header Section */}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-5 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z"
                    />
                  </svg>
                  Filter & Pencarian Data
                </h3>
              </div>
            </div>

            {/* Filter Section */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Search Field */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-blue-600"
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
                    <label className="text-sm font-semibold text-gray-700">
                      Pencarian
                    </label>
                  </div>
                  <input
                    className="w-full rounded-lg bg-gray-50 border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    type="text"
                    placeholder="Cari booking atau nama approval..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    disabled={isLoading || isActionLoading}
                  />
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-blue-600"
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
                    <label className="text-sm font-semibold text-gray-700">
                      Status Approval
                    </label>
                  </div>
                  <select
                    className="w-full rounded-lg bg-gray-50 border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    disabled={isLoading || isActionLoading}
                  >
                    <option value="all">Tampilkan Semua Status</option>
                    <option value="pending">
                      📋 Incoming - Menunggu Review
                    </option>
                    <option value="approved">
                      ✅ Approved - Telah Disetujui
                    </option>
                    <option value="rejected">❌ Rejected - Ditolak</option>
                  </select>
                </div>

                {/* Ticket Status Filter */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                      />
                    </svg>
                    <label className="text-sm font-semibold text-gray-700">
                      Status Tiket
                    </label>
                  </div>
                  <select
                    className="w-full rounded-lg bg-gray-50 border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    value={ticketStatusFilter}
                    onChange={(e) => setTicketStatusFilter(e.target.value)}
                    disabled={isLoading || isActionLoading}
                  >
                    <option value="all">Tampilkan Semua Tiket</option>
                    <option value="incoming">🔄 Incoming - Tiket Aktif</option>
                    <option value="history">📚 History - Tiket Selesai</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white shadow-xl rounded-b-xl">
            <div className="h-full overflow-y-auto rounded-b-xl">
              <table className="w-full border-collapse">
                <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider border-r border-blue-500">
                      No
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider border-r border-blue-500">
                      No Booking
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider border-r border-blue-500">
                      Tanggal Awal
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider border-r border-blue-500">
                      Tanggal Baru
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider border-r border-blue-500">
                      Nama Approval
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider border-r border-blue-500">
                      Status Approval
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider border-r border-blue-500">
                      Status Tiket
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider border-r border-blue-500">
                      Tanggal Tiket
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.length > 0 ? (
                    filteredData.map((item, index) => (
                      <tr
                        key={item.id}
                        className={`hover:bg-blue-50 transition-colors duration-150 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">
                          {index + 1}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-blue-600 border-r border-gray-200">
                          {item.no_booking}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-200">
                          {convertTimeStampToDate(item.from_tgl)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-200">
                          {convertTimeStampToDate(item.to_tgl)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-200">
                          {item.nama_approval || '-'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap border-r border-gray-200">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap border-r border-gray-200">
                          <TicketStatusBadge status={item.status_tiket} />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-200">
                          {formatDateTime(item.createdAt)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="text-gray-400 text-6xl mb-4">📅</div>
                          <p className="text-gray-500 text-lg">
                            {isLoading
                              ? 'Memuat data...'
                              : searchTerm ||
                                statusFilter !== 'all' ||
                                ticketStatusFilter !== 'all'
                              ? 'Tidak ada data yang sesuai dengan filter'
                              : 'Tidak ada data perubahan tanggal kirim'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PerubahanTanggalKirim;
