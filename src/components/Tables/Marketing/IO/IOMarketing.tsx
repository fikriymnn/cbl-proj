import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import SearchableSelect from '../../../../pages/MasterData/Marketing/SearchableSelect';

interface IOData {
  id: number;
  no_io: string;
  customer: string;
  produk: string;
  status_io: string;
  status: string;
  tgl_pembuatan_io: string;
  is_revisi: boolean;
  revisi_no_io: string;
}

interface OKPData {
  id: number;
  no_okp: string;
  customer: string;
  produk: string;
  status_okp: string;
  rencana_qty_po: number;
  rencana_tgl_kirim: string;
}

const IOMarketing: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [ioData, setIOData] = useState<IOData[]>([]);
  const [okpData, setOKPData] = useState<OKPData[]>([]);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    id_okp: '',
    is_revisi: false,
  });

  // Generate auto number for IO
  const generateIONumber = (): string => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();

    // Get the highest existing IO number to generate next one
    const existingNumbers = ioData.map((io) => {
      const match = io.no_io.match(/IO-(\d+)/);
      return match ? parseInt(match[1]) : 0;
    });

    const nextNumber =
      existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 305;
    const paddedNumber = String(nextNumber).padStart(6, '0');

    return `IO-${paddedNumber}/${month}/${year}`;
  };

  const PutIO = async (): Promise<void> => {
    const selectedOKP = okpData.find(
      (okp) => okp.id.toString() === formData.id_okp,
    );
    if (!selectedOKP) return;

    const url = `${import.meta.env.VITE_API_LINK}/marketing/io`;
    try {
      setLoading(true);
      const res: AxiosResponse = await axios.put(
        url,
        {
          id_okp: formData.id_okp,
          no_io: generateIONumber(),
          status_io: selectedOKP.status_okp,
          is_revisi: formData.is_revisi,
          revisi_no_io: '',
        },
        {
          withCredentials: true,
        },
      );

      if (res.data.succes) {
        setShowCreateForm(false);
        setFormData({ id_okp: '', is_revisi: false });
        fetchIOData(); // Refresh data
      }
    } catch (error) {
      console.error('Error creating IO:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOKPData = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/marketing/okp`;
    try {
      setLoading(true);
      const res: AxiosResponse = await axios.get(url, {
        params: { status: 'history' },
        withCredentials: true,
      });
      console.log('Fetched OKP data:', res.data);
      if (res.data.succes) {
        setOKPData(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching OKP data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchIOData = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/marketing/io`;
    try {
      setLoading(true);
      const res: AxiosResponse = await axios.get(url, {
        withCredentials: true,
      });
      console.log('Fetched IO data:', res.data);
      if (res.data.succes) {
        setIOData(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching IO data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'baru':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    fetchOKPData();
    fetchIOData();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    PutIO();
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <span>+</span>
          Create IO
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No IO
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status IO
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produk
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tgl Pembuatan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revisi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : ioData.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No data available
                  </td>
                </tr>
              ) : (
                ioData.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                        {item.no_io}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded text-sm ${getStatusColor(
                          item.status_io,
                        )}`}
                      >
                        {item.status_io}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.customer}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.produk}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(item.tgl_pembuatan_io)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded text-sm ${getStatusColor(
                          item.status,
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.is_revisi ? 'Ya' : 'Tidak'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create IO Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Create New IO</h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nomor OKP */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor OKP <span className="text-red-500">*</span>
                </label>
                <SearchableSelect
                  options={[
                    { value: '', label: 'Pilih OKP' },
                    ...okpData.map((okp) => ({
                      value: okp.id.toString(),
                      label: `${okp.no_okp} - ${okp.customer} - ${okp.produk}`,
                    })),
                  ]}
                  value={formData.id_okp}
                  onChange={(value) =>
                    setFormData({ ...formData, id_okp: String(value) })
                  }
                  placeholder="Pilih OKP"
                  required
                />
              </div>

              {/* Nomor IO (Auto Generated) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor IO
                </label>
                <input
                  type="text"
                  value={generateIONumber()}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                />
              </div>

              {/* Status (Auto from OKP) */}
              {formData.id_okp && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <input
                    type="text"
                    value={
                      okpData.find(
                        (okp) => okp.id.toString() === formData.id_okp,
                      )?.status_okp || ''
                    }
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                  />
                </div>
              )}

              {/* Revisi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Revisi?
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="is_revisi"
                      checked={!formData.is_revisi}
                      onChange={() =>
                        setFormData({ ...formData, is_revisi: false })
                      }
                      className="mr-2"
                    />
                    Tidak
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="is_revisi"
                      checked={formData.is_revisi}
                      onChange={() =>
                        setFormData({ ...formData, is_revisi: true })
                      }
                      className="mr-2"
                    />
                    Ya
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!formData.id_okp || loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create IO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IOMarketing;
