import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState, useMemo } from 'react';
import OKPModal from './OKPModal';

interface OKPItem {
  status: string;
  id: number;
  id_kalkulasi: number;
  no_okp: string;
  status_okp: string;
  tgl_target_marketing: string;
  jenis_pekerjaan: string[];
  id_pisau: string;
  file_spek_customer: string;
  rencana_qty_po: number;
  rencana_tgl_kirim: string;
  status_po: string;
  keterangan_cetak: string;
  tahapan: string[];
  posisi_proses: string;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

interface ApiError {
  message: string;
}

type SortKey = keyof OKPItem | 'index';
type SortDirection = 'asc' | 'desc';

const OKPKabag: React.FC = () => {
  const [data, setData] = useState<OKPItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedOKPId, setSelectedOKPId] = useState<number | undefined>();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showActionModal, setShowActionModal] = useState<boolean>(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [selectedOKPForAction, setSelectedOKPForAction] = useState<
    number | undefined
  >();
  const [sortKey, setSortKey] = useState<SortKey>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const fetchOKPData = async (): Promise<void> => {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/marketing/okp?posisi_proses=kabag`;
    try {
      setLoading(true);
      const res: AxiosResponse<ApiResponse<OKPItem[]>> = await axios.get(url, {
        withCredentials: true,
      });
      console.log('Fetched OKP Kabag data:', res.data);
      if (res.data && res.data.data) {
        setData(res.data.data);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching OKP data:', error);
      const apiError = error as ApiError;
      alert(`Error: ${apiError.message || 'Failed to fetch data'}`);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOKPData();
  }, []);

  const handleDetailOKP = (okpId: number) => {
    setSelectedOKPId(okpId);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOKPId(undefined);
  };

  const handleAction = (okpId: number, type: 'approve' | 'reject') => {
    setSelectedOKPForAction(okpId);
    setActionType(type);
    setShowActionModal(true);
  };

  const handleSubmitAction = async () => {
    if (!selectedOKPForAction) return;

    try {
      if (actionType === 'approve') {
        const url = `${
          import.meta.env.VITE_API_LINK
        }/marketing/okp/approve/${selectedOKPForAction}`;
        await axios.put(url, {
          withCredentials: true,
        });
        alert('OKP berhasil diapprove!');
      } else {
        const url = `${
          import.meta.env.VITE_API_LINK
        }/marketing/okp/reject/${selectedOKPForAction}`;
        await axios.put(url, {
          withCredentials: true,
        });
        alert('OKP berhasil direject!');
      }

      setShowActionModal(false);
      fetchOKPData();
    } catch (error) {
      console.error('Error processing action:', error);
      alert('Error processing action');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getSortIcon = (key: SortKey) => {
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

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const filteredData = data.filter(
    (item) =>
      item.no_okp.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.status_okp.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id_pisau.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.status_po.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      let aValue: any = a[sortKey as keyof OKPItem];
      let bValue: any = b[sortKey as keyof OKPItem];

      if (sortKey === 'tgl_target_marketing') {
        aValue = new Date(aValue || '1900-01-01').getTime();
        bValue = new Date(bValue || '1900-01-01').getTime();
      }

      if (sortKey === 'rencana_qty_po') {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortKey, sortDirection]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-1 px-2">
      {/* Header */}
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search OKP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 w-48 text-sm"
          />
          {searchTerm && (
            <span className="text-xs text-gray-600">
              {sortedData.length} of {data.length} records
            </span>
          )}
        </div>
      </div>

      {/* Data Table */}
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
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ACTIONS
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('no_okp')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    NO OKP
                    {getSortIcon('no_okp')}
                  </button>
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('status_okp')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    STATUS
                    {getSortIcon('status_okp')}
                  </button>
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('tgl_target_marketing')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    TGL TARGET
                    {getSortIcon('tgl_target_marketing')}
                  </button>
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  JENIS KERJA
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('id_pisau')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    ID PISAU
                    {getSortIcon('id_pisau')}
                  </button>
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('rencana_qty_po')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    QTY
                    {getSortIcon('rencana_qty_po')}
                  </button>
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TGL KIRIM
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  POSISI
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('status_po')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    PO
                    {getSortIcon('status_po')}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="px-4 py-6 text-center text-gray-500 text-sm"
                  >
                    {searchTerm
                      ? 'No OKP found matching your search'
                      : 'No OKP data available for Kabag Approval'}
                  </td>
                </tr>
              ) : (
                sortedData.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs font-medium">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleDetailOKP(item.id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs transition-colors"
                          title="View Details"
                        >
                          Detail
                        </button>
                        {item.status == 'on progress' && (
                          <>
                            <button
                              onClick={() => handleAction(item.id, 'approve')}
                              className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs transition-colors"
                              title="Approve OKP"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleAction(item.id, 'reject')}
                              className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs transition-colors"
                              title="Reject OKP"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      <span
                        className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded font-medium"
                        title={item.no_okp}
                      >
                        {item.no_okp
                          ? item.no_okp.substring(0, 10) +
                            (item.no_okp.length > 10 ? '...' : '')
                          : '-'}
                      </span>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      <span
                        className="bg-indigo-100 text-indigo-800 text-xs px-1.5 py-0.5 rounded font-medium"
                        title={item.status_okp}
                      >
                        {item.status_okp.substring(0, 8) +
                          (item.status_okp.length > 8 ? '...' : '')}
                      </span>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                      <span title={item.tgl_target_marketing}>
                        {formatDate(item.tgl_target_marketing)}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-xs text-gray-900 max-w-32">
                      {Array.isArray(item.jenis_pekerjaan) &&
                      item.jenis_pekerjaan.length > 0 ? (
                        <div className="flex flex-wrap gap-0.5">
                          {item.jenis_pekerjaan
                            .slice(0, 2)
                            .map((jp, jpIndex) => (
                              <span
                                key={jpIndex}
                                className="bg-indigo-100 text-indigo-800 text-xs px-1 py-0.5 rounded font-medium"
                                title={jp}
                              >
                                {jp.substring(0, 8) +
                                  (jp.length > 8 ? '...' : '')}
                              </span>
                            ))}
                          {item.jenis_pekerjaan.length > 2 && (
                            <span
                              className="text-xs text-gray-500 cursor-help"
                              title={item.jenis_pekerjaan.join(', ')}
                            >
                              +{item.jenis_pekerjaan.length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                      <span title={item.id_pisau}>
                        {item.id_pisau
                          ? item.id_pisau.substring(0, 10) +
                            (item.id_pisau.length > 10 ? '...' : '')
                          : '-'}
                      </span>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                      <span
                        title={item.rencana_qty_po?.toLocaleString('id-ID')}
                      >
                        {item.rencana_qty_po
                          ? item.rencana_qty_po.toLocaleString('id-ID')
                          : '0'}
                      </span>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                      <span title={item.rencana_tgl_kirim}>
                        {formatDate(item.rencana_tgl_kirim)}
                      </span>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      <span
                        className="bg-purple-100 text-purple-800 text-xs px-1.5 py-0.5 rounded font-medium uppercase"
                        title={item.posisi_proses}
                      >
                        {item.posisi_proses.substring(0, 8) +
                          (item.posisi_proses.length > 8 ? '...' : '')}
                      </span>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded font-medium uppercase ${
                          item.status_po === 'tidak'
                            ? 'bg-red-100 text-red-800'
                            : item.status_po === 'ada'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                        title={item.status_po}
                      >
                        {item.status_po.substring(0, 6) +
                          (item.status_po.length > 6 ? '...' : '')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {showModal && (
        <OKPModal
          onClose={handleCloseModal}
          mode="detail"
          okpId={selectedOKPId}
        />
      )}

      {/* Action Confirmation Modal */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">
              Konfirmasi {actionType === 'approve' ? 'Approve' : 'Reject'} OKP
            </h2>

            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin{' '}
              {actionType === 'approve' ? 'menyetujui' : 'menolak'} OKP ini?
              {actionType === 'approve' &&
                ' Setelah disetujui, OKP akan masuk ke proses IO.'}
              {actionType === 'reject' &&
                ' Setelah ditolak, OKP akan dikembalikan untuk revisi.'}
            </p>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowActionModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleSubmitAction}
                className={`px-4 py-2 text-white rounded-md ${
                  actionType === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {actionType === 'approve' ? 'Ya, Approve' : 'Ya, Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OKPKabag;
