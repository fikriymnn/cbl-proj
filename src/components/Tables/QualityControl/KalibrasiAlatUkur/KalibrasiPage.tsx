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
  no_sertifikat?: string;
  vendor?: string;
  keterangan: string;
  file: string;
  data_tiket?: KalibrasiHistory[];
}

interface KalibrasiHistory {
  id: number;
  id_kalibrasi_alat_ukur: number;
  nama_inspektor: string;
  tgl_kalibrasi: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface StatusKalibrasi {
  id: number;
  status: string;
  keterangan?: string;
}

interface LokasiKalibrasi {
  id: number;
  lokasi: string;
  keterangan?: string;
}

interface FormData {
  nama_alat_ukur: string;
  merk_model: string;
  no_seri: string;
  spesifikasi: string;
  lokasi_penyimpanan: string; // This will store the ID
  status: string; // This will store the ID
  frekuensi: number;
  kalibrasi_terakhir: string;
  masa_berlaku: string;
  sertifikat: string;
  no_sertifikat?: string;
  vendor?: string;
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
  const [isFullscreen, setIsFullscreen] = useState(false);

  const openFullscreen = () => {
    setIsFullscreen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
  };
  const [kalibrasi, setKalibrasi] = useState<KalibrasiAlatUkur[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [historyData, setHistoryData] = useState<
    Record<number, KalibrasiHistory[]>
  >({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>('');

  // Master data state
  const [statusKalibrasi, setStatusKalibrasi] = useState<StatusKalibrasi[]>([]);
  const [lokasiKalibrasi, setLokasiKalibrasi] = useState<LokasiKalibrasi[]>([]);
  const [masterDataLoading, setMasterDataLoading] = useState<boolean>(true);

  const [sendingTicket, setSendingTicket] = useState<number | null>(null);
  async function handleSendTicket(id: number): Promise<void> {
    setSendingTicket(id);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_LINK}/qc/kalibrasiAlatUkurTiket`,
        { id_kalibrasi_alat_ukur: id },
        { withCredentials: true },
      );

      // Refresh the data after successful ticket submission
      getKalibrasi();

      // Optional: Show success message
      alert('Tiket berhasil dikirim');
    } catch (error: any) {
      console.error('Error sending ticket:', error);
      alert('Gagal mengirim tiket');
    } finally {
      setSendingTicket(null);
    }
  }
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
    status: '',
    frekuensi: 1,
    kalibrasi_terakhir: '',
    masa_berlaku: '',
    sertifikat: 'ada',
    keterangan: '',
    file: '',
  });

  // Load master data
  async function loadMasterData(): Promise<void> {
    setMasterDataLoading(true);
    try {
      const [statusResponse, lokasiResponse] = await Promise.all([
        axios.get(
          `${import.meta.env.VITE_API_LINK}/master/qc/statusKalibrasi`,
          {
            withCredentials: true,
          },
        ),
        axios.get(
          `${import.meta.env.VITE_API_LINK}/master/qc/lokasiKalibrasi`,
          {
            withCredentials: true,
          },
        ),
      ]);

      setStatusKalibrasi(statusResponse.data.data || statusResponse.data || []);
      setLokasiKalibrasi(lokasiResponse.data.data || lokasiResponse.data || []);
    } catch (error: any) {
      console.error('Error loading master data:', error);
      setStatusKalibrasi([]);
      setLokasiKalibrasi([]);
    } finally {
      setMasterDataLoading(false);
    }
  }

  // Helper functions to get display text from master data
  function getStatusText(statusId: string): string {
    const status = statusKalibrasi.find((s) => s.id.toString() === statusId);
    return status ? status.status : statusId;
  }

  function getLokasiText(lokasiId: string): string {
    const lokasi = lokasiKalibrasi.find((l) => l.id.toString() === lokasiId);
    return lokasi ? lokasi.lokasi : lokasiId;
  }

  async function handleFileUpload(file: File): Promise<string> {
    setUploading(true);
    setUploadError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_LINK}/images`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      const fileName =
        response.data.fileName || response.data.filename || response.data.file;
      return fileName;
    } catch (error: any) {
      console.error('Error uploading file:', error);
      setUploadError('Failed to upload file');
      throw error;
    } finally {
      setUploading(false);
    }
  }

  async function handleFileDelete(fileName: string): Promise<void> {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_LINK}/images/${fileName}`,
        { withCredentials: true },
      );
    } catch (error: any) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setUploadError('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setUploadError('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      setUploadError('');

      const previewUrl = URL.createObjectURL(file);
      setFilePreview(previewUrl);
    }
  }

  function clearFileSelection(): void {
    setSelectedFile(null);
    setFilePreview('');
    setUploadError('');

    if (filePreview) {
      URL.revokeObjectURL(filePreview);
    }
  }

  async function removeExistingFile(): Promise<void> {
    if (formData.file) {
      try {
        await handleFileDelete(formData.file);
        setFormData({ ...formData, file: '' });
      } catch (error) {
        console.error('Error removing file:', error);
      }
    }
  }

  useEffect(() => {
    loadMasterData();
  }, []);

  useEffect(() => {
    if (!masterDataLoading) {
      getKalibrasi();
    }
  }, [pagination.currentPage, pagination.itemsPerPage, masterDataLoading]);

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
      console.log(res.data);

      const { data, total_page } = res.data;

      setKalibrasi(data || []);
      setPagination({
        currentPage: pagination.currentPage,
        totalPages: total_page || 1,
        totalItems: (data?.length || 0) * total_page,
        itemsPerPage: pagination.itemsPerPage,
      });
      const initialHistoryData: Record<number, KalibrasiHistory[]> = {};
      data?.forEach((item: KalibrasiAlatUkur) => {
        if (item.data_tiket && item.data_tiket.length > 0) {
          initialHistoryData[item.id] = item.data_tiket;
        }
      });
      setHistoryData(initialHistoryData);
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

    try {
      let fileUrl = formData.file;

      if (selectedFile) {
        fileUrl = await handleFileUpload(selectedFile);
      }

      const submitData = {
        ...formData,
        file: fileUrl,
      };

      const url = editMode
        ? `${import.meta.env.VITE_API_LINK}/qc/kalibrasiAlatUkur/${editId}`
        : `${import.meta.env.VITE_API_LINK}/qc/kalibrasiAlatUkur`;

      if (editMode) {
        await axios.put(url, submitData, { withCredentials: true });
      } else {
        await axios.post(url, submitData, { withCredentials: true });
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
      status: '',
      frekuensi: 1,
      kalibrasi_terakhir: '',
      masa_berlaku: '',
      sertifikat: 'ada',
      keterangan: '',
      vendor: '',
      no_sertifikat: '',
      file: '',
    });

    clearFileSelection();
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
      status: item.status || '',
      frekuensi: item.frekuensi || 1,
      kalibrasi_terakhir: item.kalibrasi_terakhir || '',
      masa_berlaku: item.masa_berlaku || '',
      sertifikat: item.sertifikat || 'ada',
      keterangan: item.keterangan || '',
      no_sertifikat: item.no_sertifikat || '',
      vendor: item.vendor || '',
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

      if (!historyData[id]) {
        try {
          const historyUrl = `${
            import.meta.env.VITE_API_LINK
          }/qc/kalibrasiAlatUkur/${id}`;
          const historyRes = await axios.get(historyUrl, {
            withCredentials: true,
          });

          const historyData = historyRes.data?.data_tiket || [];

          setHistoryData((prev) => ({
            ...prev,
            [id]: historyData,
          }));
        } catch (error: any) {
          console.error('Error loading history:', error);
          setHistoryData((prev) => ({
            ...prev,
            [id]: [],
          }));
        }
      }
    }

    setExpandedRows(newExpanded);
  }

  function getStatusColor(status?: string): string {
    // Check if status is an ID, get the actual status text
    const statusText = getStatusText(status || '');

    switch (statusText?.toLowerCase()) {
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
    const { currentPage, totalPages } = pagination;
    const currentItemsCount = kalibrasi.length;
    const startItem = (currentPage - 1) * pagination.itemsPerPage + 1;
    const endItem =
      (currentPage - 1) * pagination.itemsPerPage + currentItemsCount;

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
            Menampilkan {startItem} - {endItem} dari halaman {currentPage} dari{' '}
            {totalPages}
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

  if (loading || masterDataLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  function getLatestCalibrationDate(item: KalibrasiAlatUkur): string {
    if (!item.data_tiket || item.data_tiket.length === 0) {
      return formatDate(item.kalibrasi_terakhir);
    }

    const latestDate = item.data_tiket.reduce((latest, ticket) => {
      const ticketDate = new Date(ticket.tgl_kalibrasi);
      const latestDate = new Date(latest);
      return ticketDate > latestDate ? ticket.tgl_kalibrasi : latest;
    }, item.data_tiket[0].tgl_kalibrasi);

    return formatDate(latestDate);
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
                          {getStatusText(item.status)?.toLowerCase() ===
                          'ok' ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <XCircle className="w-3 h-3 mr-1" />
                          )}
                          {getStatusText(item.status) || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-900">
                          <MapPin className="w-4 h-4 mr-1 text-gray-400 flex-shrink-0" />
                          <span className="truncate">
                            {getLokasiText(item.lokasi_penyimpanan) || '-'}
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
                        {isExpired(item.masa_berlaku) && (
                          <button
                            onClick={() => handleSendTicket(item.id)}
                            disabled={sendingTicket === item.id}
                            className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors text-sm font-medium border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {sendingTicket === item.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-1"></div>
                            ) : (
                              <Calendar className="w-4 h-4 mr-1" />
                            )}
                            {sendingTicket === item.id
                              ? 'Mengirim...'
                              : 'Kirim'}
                          </button>
                        )}
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
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                              <div>
                                <label className="text-sm font-medium text-gray-500">
                                  Frekuensi Kalibrasi
                                </label>
                                <p className="text-sm text-gray-900 font-medium">
                                  Per {item.frekuensi || '-'} Bulan
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
                                  {getLatestCalibrationDate(item)}
                                </p>
                              </div>
                              <div className="px-6 py-4">
                                {item.file ? (
                                  <div className="flex items-center">
                                    <img
                                      src={`${
                                        import.meta.env.VITE_API_LINK
                                      }/images/${item.file}`}
                                      alt="File"
                                      className="object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                                      onClick={openFullscreen}
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-sm">
                                    No file
                                  </span>
                                )}
                              </div>

                              {/* Full Screen Modal */}
                              {isFullscreen && (
                                <div
                                  className="fixed inset-0 bg-black bg-opacity-90 z-50 overflow-auto"
                                  onClick={closeFullscreen}
                                >
                                  <div className="relative w-full min-h-screen flex justify-center p-4">
                                    <img
                                      src={`${
                                        import.meta.env.VITE_API_LINK
                                      }/images/${item.file}`}
                                      alt="File"
                                      className="max-w-full h-auto block"
                                      onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on image
                                    />
                                    <button
                                      className="fixed top-4 right-4 text-white bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-70 transition-colors text-xl font-bold"
                                      onClick={closeFullscreen}
                                    >
                                      ×
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* History Table */}
                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                              <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                  <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                      Tanggal Kalibrasi
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                      Inspektor
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                      Status
                                    </th>
                                  </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-200">
                                  {historyData[item.id || index]?.length > 0 ? (
                                    historyData[item.id || index]
                                      .sort(
                                        (a: any, b: any) =>
                                          new Date(b.createdAt).getTime() -
                                          new Date(a.createdAt).getTime(),
                                      )
                                      .map((history) => (
                                        <tr
                                          key={history.id}
                                          className="hover:bg-gray-50"
                                        >
                                          <td className="px-4 py-3 text-sm text-gray-900">
                                            {formatDate(history.tgl_kalibrasi)}
                                          </td>
                                          <td className="px-4 py-3 text-sm text-gray-900">
                                            {history.nama_inspektor || '-'}
                                          </td>
                                          <td className="px-4 py-3">
                                            <span
                                              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${
                                                history.status === 'history'
                                                  ? 'bg-green-100 text-green-700 border-green-200'
                                                  : history.status === 'active'
                                                  ? 'bg-blue-100 text-blue-700 border-blue-200'
                                                  : 'bg-gray-100 text-gray-700 border-gray-200'
                                              }`}
                                            >
                                              {history.status}
                                            </span>
                                          </td>
                                        </tr>
                                      ))
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
                    <select
                      value={formData.lokasi_penyimpanan}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setFormData({
                          ...formData,
                          lokasi_penyimpanan: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Pilih Lokasi Penyimpanan</option>
                      {lokasiKalibrasi.map((lokasi) => (
                        <option key={lokasi.id} value={lokasi.id.toString()}>
                          {lokasi.lokasi}
                        </option>
                      ))}
                    </select>
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
                      <option value="">Pilih Status</option>
                      {statusKalibrasi.map((status) => (
                        <option key={status.id} value={status.id.toString()}>
                          {status.status}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frekuensi Kalibrasi (Bulan)
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      No Sertifikat
                    </label>
                    <input
                      type="text"
                      value={formData.no_sertifikat}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({
                          ...formData,
                          no_sertifikat: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vendor
                    </label>
                    <input
                      type="text"
                      value={formData.vendor}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({ ...formData, vendor: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Image
                    </label>

                    {/* File Input */}
                    <div className="mb-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {uploadError && (
                        <p className="text-red-500 text-sm mt-1">
                          {uploadError}
                        </p>
                      )}
                    </div>

                    {/* File Preview Section */}
                    <div className="space-y-4">
                      {/* New File Preview */}
                      {filePreview && (
                        <div className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              New Image Preview:
                            </span>
                            <button
                              type="button"
                              onClick={clearFileSelection}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                          <img
                            src={filePreview}
                            alt="Preview"
                            className="max-w-full h-48 object-contain border border-gray-200 rounded"
                          />
                          {selectedFile && (
                            <p className="text-sm text-gray-500 mt-2">
                              {selectedFile.name} (
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                            </p>
                          )}
                        </div>
                      )}

                      {/* Existing File Preview */}
                      {formData.file && !filePreview && (
                        <div className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              Current Image:
                            </span>
                            <button
                              type="button"
                              onClick={removeExistingFile}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                          <img
                            src={`${import.meta.env.VITE_API_LINK}/images/${
                              formData.file
                            }`}
                            alt="Current file"
                            className="max-w-full h-48 object-contain border border-gray-200 rounded"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <p className="text-sm text-gray-500 mt-2">
                            {formData.file}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Upload Progress */}
                    {uploading && (
                      <div className="mt-2">
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                          <span className="text-sm text-gray-600">
                            Uploading...
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
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
