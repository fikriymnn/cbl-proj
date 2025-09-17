import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import OKPModal from './OKPModal';

interface OKPItem {
  okp_proses: any;
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

const OKPQA: React.FC = () => {
  const [data, setData] = useState<OKPItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedOKPId, setSelectedOKPId] = useState<number | undefined>();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortKey, setSortKey] = useState<SortKey>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const fetchOKPData = async (): Promise<void> => {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/marketing/okp?posisi_proses=qa`;
    try {
      setLoading(true);
      const res: AxiosResponse<ApiResponse<OKPItem[]>> = await axios.get(url, {
        withCredentials: true,
      });
      console.log('Fetched OKP QA data:', res.data);
      if (res.data && res.data.data) {
        const parsedData = res.data.data.map((item) => ({
          ...item,
          jenis_pekerjaan:
            typeof item.jenis_pekerjaan === 'string'
              ? JSON.parse(item.jenis_pekerjaan)
              : item.jenis_pekerjaan,
          tahapan:
            typeof item.tahapan === 'string'
              ? JSON.parse(item.tahapan)
              : item.tahapan,
        }));
        setData(parsedData);
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

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
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

  const sortData = (data: OKPItem[]) => {
    return [...data].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortKey === 'jenis_pekerjaan') {
        aValue = Array.isArray(a.jenis_pekerjaan)
          ? a.jenis_pekerjaan.join(', ')
          : '';
        bValue = Array.isArray(b.jenis_pekerjaan)
          ? b.jenis_pekerjaan.join(', ')
          : '';
      } else if (sortKey === 'rencana_qty_po') {
        aValue = a.rencana_qty_po || 0;
        bValue = b.rencana_qty_po || 0;
      } else if (
        sortKey === 'tgl_target_marketing' ||
        sortKey === 'rencana_tgl_kirim'
      ) {
        aValue = new Date(a[sortKey] || 0).getTime();
        bValue = new Date(b[sortKey] || 0).getTime();
      } else {
        aValue = a[sortKey as keyof OKPItem] || '';
        bValue = b[sortKey as keyof OKPItem] || '';
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
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
  };

  const handleDetailOKP = (okpId: number) => {
    setSelectedOKPId(okpId);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOKPId(undefined);
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

  const getPosisiProsesColor = (posisi: string) => {
    switch (posisi.toLowerCase()) {
      case 'kabag':
        return 'bg-purple-100 text-purple-800';
      case 'marketing':
        return 'bg-blue-100 text-blue-800';
      case 'qa':
        return 'bg-orange-100 text-orange-800';
      case 'desain':
        return 'bg-pink-100 text-pink-800';
      case 'customer':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Filter and sort data
  const filteredData = data.filter(
    (item) =>
      item.no_okp.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.status_okp.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id_pisau.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.status_po.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.posisi_proses.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (Array.isArray(item.jenis_pekerjaan) &&
        item.jenis_pekerjaan.some((jp) =>
          jp.toLowerCase().includes(searchTerm.toLowerCase()),
        )),
  );

  const sortedData = sortData(filteredData);

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
                  <button
                    onClick={() => handleSort('jenis_pekerjaan')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    JENIS KERJA
                    {getSortIcon('jenis_pekerjaan')}
                  </button>
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
                  <button
                    onClick={() => handleSort('rencana_tgl_kirim')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    TGL KIRIM
                    {getSortIcon('rencana_tgl_kirim')}
                  </button>
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('posisi_proses')}
                    className="flex items-center hover:text-gray-700 focus:outline-none"
                  >
                    POSISI
                    {getSortIcon('posisi_proses')}
                  </button>
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
                      : 'No OKP data available for QA'}
                  </td>
                </tr>
              ) : (
                sortedData.map((item, index) => {
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs font-medium">
                        <button
                          onClick={() => handleDetailOKP(item.id)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs transition-colors"
                          title="View Details & Actions"
                        >
                          ACTION
                        </button>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <span
                          className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded font-medium"
                          title={item.no_okp}
                        >
                          {item.no_okp ? truncateText(item.no_okp, 10) : '-'}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <span
                          className="bg-purple-100 text-purple-800 text-xs px-1.5 py-0.5 rounded font-medium"
                          title={item.status_okp}
                        >
                          {truncateText(item.status_okp, 8)}
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
                                  {truncateText(jp, 8)}
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
                            ? truncateText(item.id_pisau, 10)
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
                          className={`text-xs px-1.5 py-0.5 rounded font-medium uppercase ${getPosisiProsesColor(
                            item.posisi_proses,
                          )}`}
                          title={item.posisi_proses}
                        >
                          {truncateText(item.posisi_proses, 8)}
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
                          {truncateText(item.status_po, 6)}
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

      {/* Empty State */}
      {data.length === 0 && !loading && (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-3">
            <svg
              className="mx-auto h-10 w-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-base font-medium text-gray-900 mb-2">
            No OKP Records
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            No OKP data available for QA process.
          </p>
        </div>
      )}

      {/* Modal for both detail and actions */}
      {showModal && (
        <OKPModal
          onClose={handleCloseModal}
          mode="qa" // Add QA mode
          okpId={selectedOKPId}
          onActionComplete={fetchOKPData}
        />
      )}
    </div>
  );
};

export default OKPQA;
