import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  MapPin,
  CheckCircle,
  XCircle,
  FileText,
  Loader2,
  AlertCircle,
  Calendar,
  X,
  History,
  ShoppingCart,
  Settings,
} from 'lucide-react';

interface KalibrasiAlatUkur {
  createdAt: string;
  file: string;
  frekuensi: number;
  id: number;
  kalibrasi_terakhir: string;
  masa_berlaku: string;
  merk_model: string;
  nama_alat_ukur: string;
  no_seri: string;
  sertifikat: string;
  spesifikasi: string;
  status: string;
  lokasi_penyimpanan: string;
  keterangan: string;
  updatedAt: string;
}

interface CalibrationTicket {
  createdAt: string;
  id: number;
  id_kalibrasi_alat_ukur: number;
  kalibrasi_alat_ukur: KalibrasiAlatUkur;
  status: string;
  tgl_kalibrasi: string | null;
  updatedAt: string;
}

interface ValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (bagian: 'qc' | 'purchase') => void;
  loading: boolean;
  ticketData?: CalibrationTicket | null;
}

function ValidationModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
  ticketData,
}: ValidationModalProps): JSX.Element | null {
  if (!isOpen) return null;

  const handleValidation = (bagian: 'qc' | 'purchase') => {
    // Show confirmation alert
    const bagianText = bagian === 'qc' ? 'QC' : 'Purchase';
    const confirmMessage = `Apakah Anda yakin ingin memvalidasi tiket ini ke bagian ${bagianText}?`;

    if (window.confirm(confirmMessage)) {
      onConfirm(bagian);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Pilih Bagian Validasi
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {ticketData && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Detail Tiket:
              </h4>
              <p className="text-sm text-gray-700">
                <strong>Alat:</strong>{' '}
                {ticketData.kalibrasi_alat_ukur.nama_alat_ukur}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Merk/Model:</strong>{' '}
                {ticketData.kalibrasi_alat_ukur.merk_model}
              </p>
              <p className="text-sm text-gray-700">
                <strong>No. Seri:</strong>{' '}
                {ticketData.kalibrasi_alat_ukur.no_seri}
              </p>
            </div>
          )}

          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-4">
              Pilih bagian untuk memvalidasi tiket kalibrasi ini:
            </p>

            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => handleValidation('qc')}
                disabled={loading}
                className="flex items-center gap-3 p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200">
                    <Settings className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="text-left">
                  <h5 className="text-sm font-medium text-gray-900">
                    QC (Quality Control)
                  </h5>
                  <p className="text-xs text-gray-600">
                    Validasi oleh bagian Quality Control
                  </p>
                </div>
                {loading && (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600 ml-auto" />
                )}
              </button>

              <button
                onClick={() => handleValidation('purchase')}
                disabled={loading}
                className="flex items-center gap-3 p-4 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200">
                    <ShoppingCart className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <div className="text-left">
                  <h5 className="text-sm font-medium text-gray-900">
                    Purchase
                  </h5>
                  <p className="text-xs text-gray-600">
                    Validasi oleh bagian Purchase
                  </p>
                </div>
                {loading && (
                  <Loader2 className="w-4 h-4 animate-spin text-green-600 ml-auto" />
                )}
              </button>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PendingKalibrasi(): JSX.Element {
  const [data, setData] = useState<CalibrationTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  const [validationModalState, setValidationModalState] = useState<{
    isOpen: boolean;
    ticketId: number | null;
    ticketData: CalibrationTicket | null;
  }>({
    isOpen: false,
    ticketId: null,
    ticketData: null,
  });

  useEffect(() => {
    getKalibrasi();
  }, []);

  async function getKalibrasi(): Promise<void> {
    const url = `${import.meta.env.VITE_API_LINK}/qc/kalibrasiAlatUkurTiket`;

    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(url, {
        withCredentials: true,
      });

      if (res.data && res.data.data) {
        setData(res.data.data);
      } else {
        setData([]);
      }
      console.log(res.data);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setError('Gagal memuat data kalibrasi');
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleValidation(
    id: number,
    bagian: 'qc' | 'purchase',
  ): Promise<void> {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/kalibrasiAlatUkurTiket/validasi/${id}`;

    try {
      setProcessingIds((prev) => new Set(prev).add(id));

      const payload = {
        bagian: bagian,
      };

      await axios.put(url, payload, {
        withCredentials: true,
      });

      // Refresh the data after successful validation
      await getKalibrasi();

      // Close validation modal
      setValidationModalState({
        isOpen: false,
        ticketId: null,
        ticketData: null,
      });

      // Show success message
      alert(`Tiket berhasil divalidasi ke bagian ${bagian.toUpperCase()}`);
    } catch (error: any) {
      console.error('Error validating ticket:', error);
      setError(`Gagal memvalidasi tiket ke bagian ${bagian.toUpperCase()}`);
      alert(`Gagal memvalidasi tiket ke bagian ${bagian.toUpperCase()}`);
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  }

  function openValidationModal(ticketId: number) {
    const ticketData = data.find((item) => item.id === ticketId) || null;
    setValidationModalState({
      isOpen: true,
      ticketId,
      ticketData,
    });
  }

  function closeValidationModal() {
    setValidationModalState({
      isOpen: false,
      ticketId: null,
      ticketData: null,
    });
  }

  function handleValidationModalConfirm(bagian: 'qc' | 'purchase') {
    if (validationModalState.ticketId) {
      handleValidation(validationModalState.ticketId, bagian);
    }
  }

  function formatDate(dateString: string): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  function getStatusBadge(status: string): JSX.Element {
    const statusConfig = {
      incoming: {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: <AlertCircle className="w-3 h-3" />,
        text: 'Incoming',
      },
      cancelled: {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: <XCircle className="w-3 h-3" />,
        text: 'Dibatalkan',
      },
      history: {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: <History className="w-3 h-3" />,
        text: 'History',
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.incoming;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}
      >
        {config.icon}
        {config.text}
      </span>
    );
  }

  // Calculate statistics
  const stats = {
    total: data.length,
    incoming: data.filter((item) => item.status === 'incoming').length,
    history: data.filter((item) => item.status === 'history').length,
    cancelled: data.filter((item) => item.status === 'cancelled').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-gray-600">Memuat data kalibrasi...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Memuat Data
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={getKalibrasi}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Tiket</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.total}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-gray-500" />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Incoming</p>
                  <p className="text-2xl font-semibold text-blue-600">
                    {stats.incoming}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">History</p>
                  <p className="text-2xl font-semibold text-gray-600">
                    {stats.history}
                  </p>
                </div>
                <History className="w-8 h-8 text-gray-500" />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {data.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Tidak Ada Tiket Kalibrasi
                </h3>
                <p className="text-gray-600">
                  Tidak ada tiket kalibrasi yang tersedia saat ini.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nama Alat Ukur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Merk/Model
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        No. Seri
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sertifikat
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lokasi
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kalibrasi Terakhir
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Masa Berlaku
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tanggal Kalibrasi
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((item, index) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <div className="text-sm font-medium text-gray-900">
                              {item.kalibrasi_alat_ukur.nama_alat_ukur}
                            </div>
                            <div className="text-xs text-gray-500">
                              {item.kalibrasi_alat_ukur.spesifikasi}
                            </div>
                            {item.kalibrasi_alat_ukur.keterangan && (
                              <div className="text-xs text-blue-600 mt-1">
                                {item.kalibrasi_alat_ukur.keterangan}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {item.kalibrasi_alat_ukur.merk_model}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {item.kalibrasi_alat_ukur.no_seri}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {item.kalibrasi_alat_ukur.sertifikat || '-'}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(item.status)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-sm text-gray-900">
                            <MapPin className="w-4 h-4" />
                            {item.kalibrasi_alat_ukur.lokasi_penyimpanan}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(
                              item.kalibrasi_alat_ukur.kalibrasi_terakhir,
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(item.kalibrasi_alat_ukur.masa_berlaku)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {item.tgl_kalibrasi
                              ? formatDate(item.tgl_kalibrasi)
                              : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {/* Validation Button - Show for incoming status */}
                            {item.status === 'pending' && (
                              <button
                                onClick={() => openValidationModal(item.id)}
                                disabled={processingIds.has(item.id)}
                                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-purple-700 bg-purple-100 rounded border border-purple-300 hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                {processingIds.has(item.id) ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-3 h-3" />
                                )}
                                Validasi
                              </button>
                            )}

                            {/* Status Display for other statuses */}
                            {(item.status === 'done' ||
                              item.status === 'history') && (
                              <span className="text-xs text-green-600 font-medium">
                                History
                              </span>
                            )}
                            {item.status === 'cancelled' && (
                              <span className="text-xs text-red-600 font-medium">
                                Dibatalkan
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Validation Modal */}
      <ValidationModal
        isOpen={validationModalState.isOpen}
        onClose={closeValidationModal}
        onConfirm={handleValidationModalConfirm}
        loading={
          validationModalState.ticketId
            ? processingIds.has(validationModalState.ticketId)
            : false
        }
        ticketData={validationModalState.ticketData}
      />
    </>
  );
}

export default PendingKalibrasi;
