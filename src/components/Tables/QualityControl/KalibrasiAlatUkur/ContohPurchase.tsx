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
  nama_inspektor: string | null;
  validator: {
    nama: string;
  };
}

interface DateInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: string) => void;
  loading: boolean;
}

function DateInputModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
}: DateInputModalProps): JSX.Element | null {
  const [selectedDate, setSelectedDate] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split('T')[0];
      setSelectedDate(today);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Input Tanggal Kalibrasi
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
          <div className="mb-4">
            <label
              htmlFor="calibration-date"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Tanggal Kalibrasi
            </label>
            <div className="relative">
              <input
                type="date"
                id="calibration-date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
              <Calendar className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
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
            <button
              onClick={() => selectedDate && onConfirm(selectedDate)}
              disabled={!selectedDate || loading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              {loading ? 'Memproses...' : 'Konfirmasi'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContohPurchase(): JSX.Element {
  const [data, setData] = useState<CalibrationTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    ticketId: number | null;
  }>({
    isOpen: false,
    ticketId: null,
  });

  useEffect(() => {
    getKalibrasi();
    getMe();
  }, []);
  const [namaPelapor, setnamaPelapor] = useState<any>();

  async function getMe() {
    const url = `${import.meta.env.VITE_API_LINK}/me`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      setnamaPelapor(res.data.nama);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }
  async function getKalibrasi(): Promise<void> {
    const url = `${import.meta.env.VITE_API_LINK}/qc/kalibrasiAlatUkurTiket`;

    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(url, {
        params: {
          bagian: 'purchase',
        },
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

  async function handleResponse(
    id: number,
    calibrationDate: string,
  ): Promise<void> {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/kalibrasiAlatUkurTiket/done/${id}`;

    try {
      setProcessingIds((prev) => new Set(prev).add(id));

      const payload = {
        nama_inspektor: namaPelapor,
        tgl_kalibrasi: calibrationDate,
      };

      await axios.put(url, payload, {
        withCredentials: true,
      });

      // Refresh the data after successful response
      await getKalibrasi();

      // Close modal
      setModalState({ isOpen: false, ticketId: null });
    } catch (error: any) {
      console.error('Error responding to ticket:', error);
      setError('Gagal merespon tiket kalibrasi');
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  }

  function openModal(ticketId: number) {
    setModalState({ isOpen: true, ticketId });
  }

  function closeModal() {
    setModalState({ isOpen: false, ticketId: null });
  }

  function handleModalConfirm(date: string) {
    if (modalState.ticketId) {
      handleResponse(modalState.ticketId, date);
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
    incoming: data.filter((item) => item.status === 'pending').length,

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
                        Inspektor
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
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {item.nama_inspektor || '-'}
                        </td>
                        <td className="px-6 py-4">
                          {item.status === 'pending' && (
                            <button
                              onClick={() => openModal(item.id)}
                              disabled={processingIds.has(item.id)}
                              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded border border-blue-300 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {processingIds.has(item.id) ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <FileText className="w-3 h-3" />
                              )}
                              Respon
                            </button>
                          )}
                          {(item.status === 'done' ||
                            item.status === 'history') && (
                            <span className="text-xs text-green-600 font-medium">
                              {item.status === 'done' ? 'History' : 'History'}
                            </span>
                          )}
                          {item.status === 'cancelled' && (
                            <span className="text-xs text-red-600 font-medium">
                              Dibatalkan
                            </span>
                          )}
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

      {/* Date Input Modal */}
      <DateInputModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onConfirm={handleModalConfirm}
        loading={
          modalState.ticketId ? processingIds.has(modalState.ticketId) : false
        }
      />
    </>
  );
}

export default ContohPurchase;
