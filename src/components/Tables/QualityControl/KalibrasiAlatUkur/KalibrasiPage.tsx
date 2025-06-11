import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  Plus,
  Edit,
  ChevronDown,
  ChevronRight,
  Calendar,
  MapPin,
  CheckCircle,
  XCircle,
  FileText,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

// TypeScript Interfaces
interface KalibrasiAlatUkur {
  id: number;
  nama_alat_ukur: string;
  merk_model: string;
  no_seri: string;
  spesifikasi: string;
  lokasi_penyimpanan: string;
  status: string;
  frekuensi: number;
  kalibrasi_terakhir: string;
  masa_berlaku: string;
  sertifikat: string;
  keterangan: string;
  file: string;
}

interface KalibrasiHistory {
  id: number;
  tanggal_kalibrasi: string;
  hasil: string;
  teknisi: string;
  catatan: string;
}

interface FormData {
  nama_alat_ukur: string;
  merk_model: string;
  no_seri: string;
  spesifikasi: string;
  lokasi_penyimpanan: string;
  status: string;
  frekuensi: number;
  kalibrasi_terakhir: string;
  masa_berlaku: string;
  sertifikat: string;
  keterangan: string;
  file: string;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

function KalibrasiAlatUkurPage(): JSX.Element {
  const [kalibrasi, setKalibrasi] = useState<KalibrasiAlatUkur[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [historyData, setHistoryData] = useState<
    Record<number, KalibrasiHistory[]>
  >({});

  // Pagination state
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  const [formData, setFormData] = useState<FormData>({
    nama_alat_ukur: '',
    merk_model: '',
    no_seri: '',
    spesifikasi: '',
    lokasi_penyimpanan: '',
    status: 'ok',
    frekuensi: 1,
    kalibrasi_terakhir: '',
    masa_berlaku: '',
    sertifikat: 'ada',
    keterangan: '',
    file: '',
  });

  useEffect(() => {
    getKalibrasi();
  }, [pagination.currentPage, pagination.itemsPerPage]);

  async function getKalibrasi(): Promise<void> {
    setLoading(true);
    const url = `${import.meta.env.VITE_API_LINK}/qc/kalibrasiAlatUkur`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
        params: {
          page: pagination.currentPage,
          limit: pagination.itemsPerPage,
        },
      });

      // Assuming API returns data in this format
      const { data, total, page, limit, totalPages } = res.data;

      setKalibrasi(data || []);
      setPagination({
        currentPage: page || 1,
        totalPages: totalPages || Math.ceil(total / limit) || 1,
        totalItems: total || 0,
        itemsPerPage: limit || 10,
      });
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setKalibrasi([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    e.preventDefault();
    const url = editMode
      ? `${import.meta.env.VITE_API_LINK}/qc/kalibrasiAlatUkur/${editId}`
      : `${import.meta.env.VITE_API_LINK}/qc/kalibrasiAlatUkur`;

    try {
      if (editMode) {
        await axios.put(url, formData, { withCredentials: true });
      } else {
        await axios.post(url, formData, { withCredentials: true });
      }

      setShowModal(false);
      resetForm();
      getKalibrasi();
    } catch (error: any) {
      console.error('Error saving data:', error);
    }
  }

  function resetForm(): void {
    setFormData({
      nama_alat_ukur: '',
      merk_model: '',
      no_seri: '',
      spesifikasi: '',
      lokasi_penyimpanan: '',
      status: 'ok',
      frekuensi: 1,
      kalibrasi_terakhir: '',
      masa_berlaku: '',
      sertifikat: 'ada',
      keterangan: '',
      file: '',
    });
    setEditMode(false);
    setEditId(null);
  }

  function handleEdit(item: KalibrasiAlatUkur): void {
    setFormData({
      nama_alat_ukur: item.nama_alat_ukur || '',
      merk_model: item.merk_model || '',
      no_seri: item.no_seri || '',
      spesifikasi: item.spesifikasi || '',
      lokasi_penyimpanan: item.lokasi_penyimpanan || '',
      status: item.status || 'ok',
      frekuensi: item.frekuensi || 1,
      kalibrasi_terakhir: item.kalibrasi_terakhir || '',
      masa_berlaku: item.masa_berlaku || '',
      sertifikat: item.sertifikat || 'ada',
      keterangan: item.keterangan || '',
      file: item.file || '',
    });
    setEditMode(true);
    setEditId(item.id);
    setShowModal(true);
  }

  function handleCreate(): void {
    resetForm();
    setShowModal(true);
  }

  async function toggleRowExpansion(id: number): Promise<void> {
    const newExpanded = new Set(expandedRows);

    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);

      // Load history data if not already loaded
      if (!historyData[id]) {
        try {
          // This is a placeholder for future history API call
          // const historyUrl = `${import.meta.env.VITE_API_LINK}/qc/kalibrasiAlatUkur/${id}/history`;
          // const historyRes = await axios.get(historyUrl, { withCredentials: true });

          // For now, using mock data
          const mockHistory: KalibrasiHistory[] = [
            {
              id: 1,
              tanggal_kalibrasi: '2024-09-01',
              hasil: 'Lulus',
              teknisi: 'John Doe',
              catatan: 'Kalibrasi normal',
            },
            {
              id: 2,
              tanggal_kalibrasi: '2023-09-01',
              hasil: 'Lulus',
              teknisi: 'Jane Smith',
              catatan: 'Semua parameter dalam batas normal',
            },
          ];

          setHistoryData((prev) => ({
            ...prev,
            [id]: mockHistory,
          }));
        } catch (error: any) {
          console.error('Error loading history:', error);
        }
      }
    }

    setExpandedRows(newExpanded);
  }

  function getStatusColor(status?: string): string {
    switch (status?.toLowerCase()) {
      case 'ok':
      case 'aktif':
        return 'text-green-700 bg-green-100 border-green-200';

      case 'not ok':
      case 'perbaikan':
        return 'text-red-700 bg-red-100 border-red-200';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  }

  function formatDate(dateString?: string): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID');
  }

  function isExpiringSoon(masaBerlaku?: string): boolean {
    if (!masaBerlaku) return false;
    const today: any = new Date();
    const expiry: any = new Date(masaBerlaku);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  }

  function isExpired(masaBerlaku?: string): boolean {
    if (!masaBerlaku) return false;
    const today = new Date();
    const expiry = new Date(masaBerlaku);
    return expiry < today;
  }

  // Pagination functions
  function handlePageChange(page: number): void {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination({ ...pagination, currentPage: page });
    }
  }

  function handleItemsPerPageChange(itemsPerPage: number): void {
    setPagination({
      ...pagination,
      itemsPerPage,
      currentPage: 1,
    });
  }

  function getRowNumber(index: number): number {
    return (pagination.currentPage - 1) * pagination.itemsPerPage + index + 1;
  }

  function renderPagination(): JSX.Element {
    const { currentPage, totalPages, totalItems } = pagination;
    const startItem = (currentPage - 1) * pagination.itemsPerPage + 1;
    const endItem = Math.min(currentPage * pagination.itemsPerPage, totalItems);

    const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 5;

      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) pages.push(i);
          pages.push('...');
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1);
          pages.push('...');
          for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
        } else {
          pages.push(1);
          pages.push('...');
          for (let i = currentPage - 1; i <= currentPage + 1; i++)
            pages.push(i);
          pages.push('...');
          pages.push(totalPages);
        }
      }

      return pages;
    };

    return (
      <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-200">
        <div className="flex items-center text-sm text-gray-600">
          <span>
            Menampilkan {startItem} - {endItem} dari {totalItems} data
          </span>
          <div className="ml-6 flex items-center">
            <label className="text-sm text-gray-600 mr-2">Per halaman:</label>
            <select
              value={pagination.itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && handlePageChange(page)}
              disabled={page === '...'}
              className={`px-3 py-2 rounded text-sm font-medium ${
                page === currentPage
                  ? 'bg-blue-600 text-white'
                  : page === '...'
                  ? 'cursor-default'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-md min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div></div>
          <button
            onClick={handleCreate}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Alat Ukur
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-16">
                  No
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Nama Alat Ukur
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Merk/Model
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  No. Seri
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Lokasi
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Masa Berlaku
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Aksi
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-16">
                  Detail
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {kalibrasi.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center">
                      <FileText className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-lg font-medium">Belum ada data</p>
                      <p className="text-sm">
                        Tambahkan alat ukur pertama Anda
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                kalibrasi.map((item, index) => (
                  <React.Fragment key={item.id || index}>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {getRowNumber(index)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {item.nama_alat_ukur || '-'}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {item.spesifikasi || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.merk_model || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-900">
                        {item.no_seri || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                            item.status,
                          )}`}
                        >
                          {item.status === 'ok' ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <XCircle className="w-3 h-3 mr-1" />
                          )}
                          {item.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-900">
                          <MapPin className="w-4 h-4 mr-1 text-gray-400 flex-shrink-0" />
                          <span className="truncate">
                            {item.lokasi_penyimpanan || '-'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm">
                          <Calendar className="w-4 h-4 mr-1 text-gray-400 flex-shrink-0" />
                          <div>
                            <span
                              className={`
                                ${
                                  isExpired(item.masa_berlaku)
                                    ? 'text-red-600 font-medium'
                                    : isExpiringSoon(item.masa_berlaku)
                                    ? 'text-yellow-600 font-medium'
                                    : 'text-gray-900'
                                }
                              `}
                            >
                              {formatDate(item.masa_berlaku)}
                            </span>
                            {isExpired(item.masa_berlaku) && (
                              <div className="text-xs text-red-500 font-medium">
                                Expired
                              </div>
                            )}
                            {isExpiringSoon(item.masa_berlaku) &&
                              !isExpired(item.masa_berlaku) && (
                                <div className="text-xs text-yellow-600 font-medium">
                                  Expiring Soon
                                </div>
                              )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleEdit(item)}
                          className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors text-sm font-medium border border-blue-200"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => toggleRowExpansion(item.id || index)}
                          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors mx-auto"
                        >
                          {expandedRows.has(item.id || index) ? (
                            <ChevronDown className="w-4 h-4 text-gray-600" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-600" />
                          )}
                        </button>
                      </td>
                    </tr>

                    {/* Expanded History Row */}
                    {expandedRows.has(item.id || index) && (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-6 py-6 bg-gray-50 border-t border-gray-100"
                        >
                          <div className="max-w-6xl">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                              Riwayat Kalibrasi
                            </h4>

                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                              <div>
                                <label className="text-sm font-medium text-gray-500">
                                  Frekuensi Kalibrasi
                                </label>
                                <p className="text-sm text-gray-900 font-medium">
                                  {item.frekuensi || '-'} kali/tahun
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-500">
                                  Sertifikat
                                </label>
                                <p className="text-sm text-gray-900 font-medium">
                                  {item.sertifikat || '-'}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-500">
                                  Kalibrasi Terakhir
                                </label>
                                <p className="text-sm text-gray-900 font-medium">
                                  {formatDate(item.kalibrasi_terakhir)}
                                </p>
                              </div>
                            </div>

                            {/* History Table */}
                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                              <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                  <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                      Tanggal
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                      Hasil
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                      Teknisi
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                      Catatan
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                  {historyData[item.id || index]?.length > 0 ? (
                                    historyData[item.id || index].map(
                                      (history) => (
                                        <tr
                                          key={history.id}
                                          className="hover:bg-gray-50"
                                        >
                                          <td className="px-4 py-3 text-sm text-gray-900">
                                            {formatDate(
                                              history.tanggal_kalibrasi,
                                            )}
                                          </td>
                                          <td className="px-4 py-3">
                                            <span
                                              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${
                                                history.hasil === 'Lulus'
                                                  ? 'bg-green-100 text-green-700 border-green-200'
                                                  : 'bg-red-100 text-red-700 border-red-200'
                                              }`}
                                            >
                                              {history.hasil}
                                            </span>
                                          </td>
                                          <td className="px-4 py-3 text-sm text-gray-900">
                                            {history.teknisi}
                                          </td>
                                          <td className="px-4 py-3 text-sm text-gray-900">
                                            {history.catatan}
                                          </td>
                                        </tr>
                                      ),
                                    )
                                  ) : (
                                    <tr>
                                      <td
                                        colSpan={4}
                                        className="px-4 py-6 text-center text-gray-500"
                                      >
                                        Belum ada riwayat kalibrasi
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>

                            {item.keterangan && (
                              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <h5 className="text-sm font-semibold text-gray-900 mb-2">
                                  Keterangan:
                                </h5>
                                <p className="text-sm text-gray-700">
                                  {item.keterangan}
                                </p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {kalibrasi.length > 0 && renderPagination()}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {editMode ? 'Edit Alat Ukur' : 'Tambah Alat Ukur Baru'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Alat Ukur *
                    </label>
                    <input
                      type="text"
                      value={formData.nama_alat_ukur}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({
                          ...formData,
                          nama_alat_ukur: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Merk/Model *
                    </label>
                    <input
                      type="text"
                      value={formData.merk_model}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({ ...formData, merk_model: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      No. Seri *
                    </label>
                    <input
                      type="text"
                      value={formData.no_seri}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({ ...formData, no_seri: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Spesifikasi
                    </label>
                    <input
                      type="text"
                      value={formData.spesifikasi}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({
                          ...formData,
                          spesifikasi: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lokasi Penyimpanan *
                    </label>
                    <input
                      type="text"
                      value={formData.lokasi_penyimpanan}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({
                          ...formData,
                          lokasi_penyimpanan: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status *
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="ok">OK</option>
                      <option value="not ok">NOT OK</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frekuensi Kalibrasi (per tahun)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.frekuensi}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({
                          ...formData,
                          frekuensi: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kalibrasi Terakhir
                    </label>
                    <input
                      type="date"
                      value={formData.kalibrasi_terakhir}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({
                          ...formData,
                          kalibrasi_terakhir: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Masa Berlaku *
                    </label>
                    <input
                      type="date"
                      value={formData.masa_berlaku}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({
                          ...formData,
                          masa_berlaku: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sertifikat
                    </label>
                    <select
                      value={formData.sertifikat}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setFormData({ ...formData, sertifikat: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ada">Ada</option>
                      <option value="tidak ada">Tidak Ada</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Keterangan
                  </label>
                  <textarea
                    value={formData.keterangan}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setFormData({ ...formData, keterangan: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    {editMode ? 'Update' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default KalibrasiAlatUkurPage;
