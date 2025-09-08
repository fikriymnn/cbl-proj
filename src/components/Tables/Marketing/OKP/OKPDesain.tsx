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

const OKPDesain: React.FC = () => {
  const [data, setData] = useState<OKPItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedOKPId, setSelectedOKPId] = useState<number | undefined>();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showActionModal, setShowActionModal] = useState<boolean>(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [selectedProcessId, setSelectedProcessId] = useState<
    number | undefined
  >();
  const [selectedOKPItem, setSelectedOKPItem] = useState<OKPItem | undefined>();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    tgl_okp_desain: '',
    note_okp_desain: '',
    id_pisau: '',
  });

  const fetchOKPData = async (): Promise<void> => {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/marketing/okp?posisi_proses=desain`;
    try {
      setLoading(true);
      const res: AxiosResponse<ApiResponse<OKPItem[]>> = await axios.get(url, {
        withCredentials: true,
      });
      console.log('Fetched OKP Desain data:', res.data);
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

  // Handle process/reject actions
  const handleAction = (item: OKPItem, type: 'approve' | 'reject') => {
    const activeProcess = item.okp_proses?.find(
      (p: any) => p.status === 'active',
    );
    if (!activeProcess) {
      alert('No active process found for this OKP');
      return;
    }

    setSelectedOKPItem(item);
    setSelectedProcessId(activeProcess.id);
    setActionType(type);
    setShowActionModal(true);

    if (type === 'approve') {
      setFormData({
        tgl_okp_desain: new Date().toISOString().split('T')[0],
        note_okp_desain: '',
        id_pisau: item.id_pisau || '', // Pre-fill with existing ID Pisau
      });
    } else {
      setFormData({
        tgl_okp_desain: '',
        note_okp_desain: '',
        id_pisau: '',
      });
    }
  };

  const handleSubmitAction = async () => {
    if (!selectedProcessId) return;

    // Validate ID Pisau for approve action
    if (actionType === 'approve' && !formData.id_pisau?.trim()) {
      alert('ID Pisau is required for processing desain');
      return;
    }

    setIsSubmitting(true);
    try {
      if (actionType === 'approve') {
        const url = `${
          import.meta.env.VITE_API_LINK
        }/marketing/okp/proses/action/${selectedProcessId}`;
        await axios.put(
          url,
          {
            bagian: 'desain',
            tgl_okp_desain: formData.tgl_okp_desain,
            note_okp_desain: formData.note_okp_desain,
            id_pisau: formData.id_pisau,
          },
          {
            withCredentials: true,
          },
        );
        alert('OKP berhasil diproses!');
      } else {
        const url = `${
          import.meta.env.VITE_API_LINK
        }/marketing/okp/proses/reject/${selectedProcessId}`;
        await axios.put(
          url,
          {
            bagian: 'desain',
            note_reject: formData.note_okp_desain,
          },
          {
            withCredentials: true,
          },
        );
        alert('OKP berhasil direject!');
      }

      setShowActionModal(false);
      fetchOKPData(); // Refresh the data

      // Reset form and selections
      setSelectedProcessId(undefined);
      setSelectedOKPItem(undefined);
      setFormData({
        tgl_okp_desain: '',
        note_okp_desain: '',
        id_pisau: '',
      });
    } catch (error) {
      console.error('Error processing action:', error);
      alert('Error processing action');
    } finally {
      setIsSubmitting(false);
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

  const filteredData = data.filter(
    (item) =>
      item.no_okp.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.status_okp.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id_pisau.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.status_po.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-1">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search OKP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
          {searchTerm && (
            <span className="text-sm text-gray-600">
              {filteredData.length} of {data.length} records
            </span>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NO
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NO OKP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  STATUS OKP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TGL TARGET MARKETING
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID PISAU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  RENCANA QTY PO
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  STATUS PO
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {searchTerm
                      ? 'No OKP found matching your search'
                      : 'No OKP data available for Desain'}
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => {
                  const hasActiveProcess = item.okp_proses?.some(
                    (p: any) => p.status === 'active',
                  );

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded font-medium">
                          {item.no_okp || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="bg-orange-100 text-orange-800 text-sm px-2 py-1 rounded font-medium">
                          {item.status_okp}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(item.tgl_target_marketing)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.id_pisau || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.rencana_qty_po
                          ? item.rencana_qty_po.toLocaleString('id-ID')
                          : '0'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`text-sm px-2 py-1 rounded font-medium ${
                            item.status_po === 'tidak'
                              ? 'bg-red-100 text-red-800'
                              : item.status_po === 'ada'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {item.status_po}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDetailOKP(item.id)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
                            title="View Details"
                          >
                            ACTIONS
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      {showModal && (
        <OKPModal
          onClose={handleCloseModal}
          mode="desain"
          okpId={selectedOKPId}
          onActionComplete={fetchOKPData} // Pass refresh callback
        />
      )}
    </div>
  );
};

export default OKPDesain;
