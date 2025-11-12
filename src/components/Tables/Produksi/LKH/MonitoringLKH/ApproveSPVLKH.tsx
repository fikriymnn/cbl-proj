import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';

interface Tahapan {
  id?: number;
  kode_tahapan: string;
  nama_tahapan: string;
}

interface Operator {
  id: number;
  nama: string;
  email: string;
  role: string;
  no: string;
  bagian: string;
}

interface ProduksiLKHProses {
  id: number;
  kode: string;
  deskripsi: string;
  waktu_mulai: string;
  waktu_selesai: string;
  total_waktu: string;
  baik: number;
  rusak_sebagian: number;
  rusak_total: number;
  pallet: number;
  status: string;
  note: string;
  id_kode_produksi: number;
}

interface ProduksiLKH {
  id: number;
  no_jo: string;
  no_io: string;
  no_so: string;
  customer: string;
  produk: string;
  qty_jo: number;
  spesifikasi: string;
  status: string;
  operator?: Operator;
  produksi_lkh_proses: ProduksiLKHProses[];
}

interface LKHTahapanData {
  id: number;
  no_jo: string;
  no_io: string;
  no_so: string;
  customer: string;
  produk: string;
  qty_jo: number;
  spesifikasi: string;
  status: string;
  id_tahapan: number;
  tahapan: Tahapan;
  produksi_lkh: ProduksiLKH[];
}

interface LKHResponse {
  data: LKHTahapanData[];
  total_page: number;
}

const ApproveSPVLKH: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [lkhData, setLkhData] = useState<LKHTahapanData[]>([]);

  const [actionLoading, setActionLoading] = useState<{
    [key: number]: boolean;
  }>({});

  // State for modal
  const [showApprovalModal, setShowApprovalModal] = useState<boolean>(false);
  const [selectedLKHForApproval, setSelectedLKHForApproval] =
    useState<LKHTahapanData | null>(null);

  useEffect(() => {
    fetchLKHData();
  }, []);

  const fetchLKHData = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/produksi/lkhTahapan`;
    try {
      setLoading(true);
      const params: any = {
        status: 'request to spv',
      };

      const res: AxiosResponse<LKHResponse> = await axios.get(url, {
        params,
        withCredentials: true,
      });

      setLkhData(res.data.data || []);

      console.log('Fetched LKH Tahapan data:', res.data);
    } catch (error) {
      console.error('Error fetching LKH data:', error);
      setLkhData([]);
    } finally {
      setLoading(false);
    }
  };

  const openApprovalModal = (lkh: LKHTahapanData) => {
    setSelectedLKHForApproval(lkh);
    setShowApprovalModal(true);
  };

  const closeApprovalModal = () => {
    setShowApprovalModal(false);
    setSelectedLKHForApproval(null);
  };

  const handleApprove = async (id: number): Promise<void> => {
    const confirmed = window.confirm(
      'Are you sure you want to approve this LKH?',
    );

    if (!confirmed) {
      closeApprovalModal();
      return;
    }

    const url = `${
      import.meta.env.VITE_API_LINK
    }/produksi/lkhTahapan/approve/${id}`;
    try {
      setActionLoading((prev) => ({ ...prev, [id]: true }));
      await axios.put(url, {}, { withCredentials: true });
      alert('LKH approved successfully!');
      closeApprovalModal();
      fetchLKHData();
    } catch (error) {
      console.error('Error approving LKH:', error);
      alert('Failed to approve LKH. Please try again.');
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const formatDuration = (totalSeconds: number | string): string => {
    const seconds =
      typeof totalSeconds === 'string' ? parseInt(totalSeconds) : totalSeconds;

    if (isNaN(seconds) || seconds < 0) return '-';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts: string[] = [];

    if (hours > 0) parts.push(`${hours} Jam`);
    if (minutes > 0) parts.push(`${minutes} Menit`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs} Detik`);

    return parts.join(' ');
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
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${day} ${month} ${year} ${hours}:${minutes}:${seconds}`;
  };

  const getStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'baru':
        return 'bg-blue-100 text-blue-800';
      case 'proses':
        return 'bg-yellow-100 text-yellow-800';
      case 'selesai':
        return 'bg-green-100 text-green-800';
      case 'request to spv':
        return 'bg-orange-100 text-orange-800';
      case 'done':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate totals from produksi_lkh_proses array
  const calculateTotals = (prosesList: ProduksiLKHProses[]) => {
    return prosesList.reduce(
      (acc, proses) => {
        acc.baik += proses.baik || 0;
        acc.rusak_sebagian += proses.rusak_sebagian || 0;
        acc.rusak_total += proses.rusak_total || 0;
        acc.pallet += proses.pallet || 0;
        acc.total_waktu += parseInt(proses.total_waktu) || 0;
        return acc;
      },
      { baik: 0, rusak_sebagian: 0, rusak_total: 0, pallet: 0, total_waktu: 0 },
    );
  };

  return (
    <div className="">
      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Action
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  No JO
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Nama Produk
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Tahapan
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Qty JO
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Total Produksi
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-3 py-4 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : lkhData.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-3 py-4 text-center text-gray-500 text-sm"
                  >
                    No data available
                  </td>
                </tr>
              ) : (
                lkhData.map((lkh) => {
                  const produksiLKH = lkh.produksi_lkh?.[0];
                  const totals = produksiLKH
                    ? calculateTotals(produksiLKH.produksi_lkh_proses)
                    : null;

                  return (
                    <tr key={lkh.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 whitespace-nowrap text-xs">
                        {lkh.status === 'request to spv' && (
                          <button
                            onClick={() => openApprovalModal(lkh)}
                            disabled={actionLoading[lkh.id]}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading[lkh.id] ? 'Loading...' : 'Approve'}
                          </button>
                        )}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 font-medium">
                        {lkh.no_jo || '-'}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                        {lkh.customer || '-'}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-900">
                        {lkh.produk || '-'}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                        {lkh.tahapan?.nama_tahapan || '-'}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                        {lkh.qty_jo || '-'}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-900">
                        {totals ? (
                          <div className="flex gap-1 flex-wrap">
                            <span className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded">
                              ✓ {totals.baik}
                            </span>
                            <span className="bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded">
                              ⚠ {totals.rusak_sebagian}
                            </span>
                            <span className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded">
                              ✕ {totals.rusak_total}
                            </span>
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 inline-flex text-xs font-semibold rounded-full ${getStatusColor(
                            lkh.status,
                          )}`}
                        >
                          {lkh.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : lkhData.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            No data available
          </div>
        ) : (
          lkhData.map((lkh) => {
            const produksiLKH = lkh.produksi_lkh?.[0];
            const totals = produksiLKH
              ? calculateTotals(produksiLKH.produksi_lkh_proses)
              : null;

            return (
              <div key={lkh.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-semibold text-sm text-gray-900">
                      {lkh.no_jo || '-'}
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      {lkh.customer || '-'}
                    </div>
                    <span
                      className={`mt-1 px-2 py-0.5 inline-flex text-xs font-semibold rounded-full ${getStatusColor(
                        lkh.status,
                      )}`}
                    >
                      {lkh.status}
                    </span>
                  </div>
                  {lkh.status === 'request to spv' && (
                    <button
                      onClick={() => openApprovalModal(lkh)}
                      disabled={actionLoading[lkh.id]}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {actionLoading[lkh.id] ? 'Loading...' : 'Approve'}
                    </button>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500 text-xs">Nama Produk:</span>
                    <div className="text-gray-900">{lkh.produk || '-'}</div>
                  </div>

                  <div>
                    <span className="text-gray-500 text-xs">Tahapan:</span>
                    <div className="text-gray-900">
                      {lkh.tahapan?.nama_tahapan || '-'}
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-500 text-xs">Qty JO:</span>
                    <div className="text-gray-900">{lkh.qty_jo || '-'}</div>
                  </div>

                  {totals && (
                    <div>
                      <span className="text-gray-500 text-xs">
                        Total Produksi:
                      </span>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        <span className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs">
                          ✓ Baik: {totals.baik}
                        </span>
                        <span className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded text-xs">
                          ⚠ RS: {totals.rusak_sebagian}
                        </span>
                        <span className="bg-red-50 text-red-700 px-2 py-1 rounded text-xs">
                          ✕ RT: {totals.rusak_total}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Approval Modal */}
      {showApprovalModal && selectedLKHForApproval && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Approval Detail - {selectedLKHForApproval.no_jo}
                </h2>
                <button
                  onClick={closeApprovalModal}
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

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {/* General Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Informasi Umum
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      No JO
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedLKHForApproval.no_jo}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      No IO
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedLKHForApproval.no_io}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      No SO
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedLKHForApproval.no_so}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Customer
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedLKHForApproval.customer}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Produk
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedLKHForApproval.produk}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Tahapan
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedLKHForApproval.tahapan?.nama_tahapan || '-'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Qty JO
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedLKHForApproval.qty_jo}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Spesifikasi
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedLKHForApproval.spesifikasi || '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Produksi LKH Details */}
              {selectedLKHForApproval.produksi_lkh?.map((produksi, index) => (
                <div key={produksi.id} className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Detail Produksi {index + 1}
                  </h3>

                  {/* Operator Info */}
                  {produksi.operator && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">
                        Operator
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <div>
                          <label className="text-xs font-medium text-gray-500">
                            Nama
                          </label>
                          <p className="text-sm text-gray-900">
                            {produksi.operator.nama}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500">
                            Bagian
                          </label>
                          <p className="text-sm text-gray-900">
                            {produksi.operator.bagian}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500">
                            No
                          </label>
                          <p className="text-sm text-gray-900">
                            {produksi.operator.no}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Process Details */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-900">
                      Detail Proses ({produksi.produksi_lkh_proses?.length || 0}
                      )
                    </h4>
                    {produksi.produksi_lkh_proses?.map(
                      (proses, prosesIndex) => (
                        <div
                          key={proses.id}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h5 className="font-medium text-gray-900">
                                Proses {prosesIndex + 1} - {proses.kode}
                              </h5>
                              <p className="text-sm text-gray-600">
                                {proses.deskripsi}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                proses.status,
                              )}`}
                            >
                              {proses.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                            <div>
                              <label className="text-xs font-medium text-gray-500">
                                Waktu Mulai
                              </label>
                              <p className="text-xs text-gray-900">
                                {formatDateTime(proses.waktu_mulai)}
                              </p>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-500">
                                Waktu Selesai
                              </label>
                              <p className="text-xs text-gray-900">
                                {formatDateTime(proses.waktu_selesai)}
                              </p>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-500">
                                Durasi
                              </label>
                              <p className="text-xs text-gray-900">
                                {formatDuration(proses.total_waktu)}
                              </p>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-500">
                                Pallet
                              </label>
                              <p className="text-xs text-gray-900">
                                {proses.pallet}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2 flex-wrap mb-2">
                            <span className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs">
                              ✓ Baik: {proses.baik}
                            </span>
                            <span className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded text-xs">
                              ⚠ Rusak Sebagian: {proses.rusak_sebagian}
                            </span>
                            <span className="bg-red-50 text-red-700 px-2 py-1 rounded text-xs">
                              ✕ Rusak Total: {proses.rusak_total}
                            </span>
                          </div>

                          {proses.note && (
                            <div className="mt-2 p-2 bg-gray-50 rounded">
                              <label className="text-xs font-medium text-gray-500">
                                Catatan:
                              </label>
                              <p className="text-xs text-gray-900">
                                {proses.note}
                              </p>
                            </div>
                          )}
                        </div>
                      ),
                    )}
                  </div>

                  {/* Total Summary */}
                  {produksi.produksi_lkh_proses?.length > 0 && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">
                        Total Keseluruhan
                      </h4>
                      <div className="flex gap-3 flex-wrap">
                        {(() => {
                          const totals = calculateTotals(
                            produksi.produksi_lkh_proses,
                          );
                          return (
                            <>
                              <div className="bg-green-100 text-green-800 px-3 py-2 rounded">
                                <span className="text-xs font-medium">
                                  Total Baik:
                                </span>
                                <span className="text-sm font-bold ml-1">
                                  {totals.baik}
                                </span>
                              </div>
                              <div className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded">
                                <span className="text-xs font-medium">
                                  Total RS:
                                </span>
                                <span className="text-sm font-bold ml-1">
                                  {totals.rusak_sebagian}
                                </span>
                              </div>
                              <div className="bg-red-100 text-red-800 px-3 py-2 rounded">
                                <span className="text-xs font-medium">
                                  Total RT:
                                </span>
                                <span className="text-sm font-bold ml-1">
                                  {totals.rusak_total}
                                </span>
                              </div>
                              <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded">
                                <span className="text-xs font-medium">
                                  Total Pallet:
                                </span>
                                <span className="text-sm font-bold ml-1">
                                  {totals.pallet}
                                </span>
                              </div>
                              <div className="bg-purple-100 text-purple-800 px-3 py-2 rounded">
                                <span className="text-xs font-medium">
                                  Total Waktu:
                                </span>
                                <span className="text-sm font-bold ml-1">
                                  {formatDuration(totals.total_waktu)}
                                </span>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={closeApprovalModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApprove(selectedLKHForApproval.id)}
                disabled={actionLoading[selectedLKHForApproval.id]}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading[selectedLKHForApproval.id]
                  ? 'Approving...'
                  : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApproveSPVLKH;
