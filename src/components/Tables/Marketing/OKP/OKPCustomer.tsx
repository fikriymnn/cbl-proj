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

const OKPCustomer: React.FC = () => {
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
  const [formData, setFormData] = useState({
    tgl_acc_customer: '',
    note_acc_customer: '',
  });

  const fetchOKPData = async (): Promise<void> => {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/marketing/okp?posisi_proses=customer`;
    try {
      setLoading(true);
      const res: AxiosResponse<ApiResponse<OKPItem[]>> = await axios.get(url, {
        withCredentials: true,
      });
      console.log('Fetched OKP Customer data:', res.data);
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

  const handleAction = (processId: number, type: 'approve' | 'reject') => {
    setSelectedProcessId(processId);
    setActionType(type);
    setShowActionModal(true);
    if (type === 'approve') {
      setFormData({
        tgl_acc_customer: new Date().toISOString().split('T')[0],
        note_acc_customer: '',
      });
    } else {
      setFormData({
        tgl_acc_customer: '',
        note_acc_customer: '',
      });
    }
  };

  const handleSubmitAction = async () => {
    if (!selectedProcessId) return;

    try {
      if (actionType === 'approve') {
        const url = `${
          import.meta.env.VITE_API_LINK
        }/marketing/okp/proses/action/${selectedProcessId}`;
        await axios.put(
          url,
          {
            bagian: 'customer',
            tgl_acc_customer: formData.tgl_acc_customer,
            note_acc_customer: formData.note_acc_customer,
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
            bagian: 'customer',
            note_reject: formData.note_acc_customer,
          },
          {
            withCredentials: true,
          },
        );
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
                      : 'No OKP data available for Customer'}
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
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
                      <span className="bg-teal-100 text-teal-800 text-sm px-2 py-1 rounded font-medium">
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
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors"
                          title="View Details"
                        >
                          Detail
                        </button>
                        {item.okp_proses &&
                          item.okp_proses
                            .filter((p: any) => p.status === 'active')
                            .map((process: any) => (
                              <React.Fragment key={process.id}>
                                <button
                                  onClick={() =>
                                    handleAction(process.id, 'approve')
                                  }
                                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
                                  title="Process OKP"
                                >
                                  Process
                                </button>
                                <button
                                  onClick={() =>
                                    handleAction(process.id, 'reject')
                                  }
                                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                                  title="Reject OKP"
                                >
                                  Reject
                                </button>
                              </React.Fragment>
                            ))}
                      </div>
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

      {/* Action Modal */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">
              {actionType === 'approve'
                ? 'Approve Customer'
                : 'Reject Customer'}
            </h2>

            {actionType === 'approve' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal ACC Customer
                </label>
                <input
                  type="date"
                  value={formData.tgl_acc_customer}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tgl_acc_customer: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {actionType === 'approve' ? 'Note ACC Customer' : 'Note Reject'}
              </label>
              <textarea
                value={formData.note_acc_customer}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    note_acc_customer: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder={
                  actionType === 'approve'
                    ? 'Masukkan note untuk customer...'
                    : 'Masukkan alasan reject...'
                }
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowActionModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitAction}
                className={`px-4 py-2 text-white rounded-md ${
                  actionType === 'approve'
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {actionType === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OKPCustomer;
