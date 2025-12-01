// components/IODetailPopup.tsx
import React, { useEffect, useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import MountingFormPopup from './MountingFormPopup';
import { MountingData } from './Mounting';

interface IODetailData {
  id: number;
  no_io: string;
  customer: string;
  produk: string;
  status: string;
  status_io: string;
  tgl_pembuatan_io: string;
  is_revisi: boolean;
  revisi_no_io: string;
  io_mounting: MountingData[];
}

interface IODetailPopupProps {
  ioId: number;
  isOpen: boolean;
  onClose: () => void;
}

const IODetailPopup: React.FC<IODetailPopupProps> = ({
  ioId,
  isOpen,
  onClose,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [ioData, setIOData] = useState<IODetailData | null>(null);
  const [showMountingForm, setShowMountingForm] = useState<boolean>(false);
  const [editingMounting, setEditingMounting] = useState<MountingData | null>(
    null,
  );
  const [deletingMountingId, setDeletingMountingId] = useState<number | null>(
    null,
  );

  const fetchIODetail = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/marketing/io/${ioId}`;
    try {
      setLoading(true);
      const res: AxiosResponse = await axios.get(url, {
        withCredentials: true,
      });
      console.log('Fetched IO detail:', res.data);
      if (res.data.succes) {
        setIOData(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching IO detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMounting = async () => {
    try {
      setLoading(true);
      const url = `${
        import.meta.env.VITE_API_LINK
      }/marketing/io/mounting/${ioId}`;
      const res: AxiosResponse = await axios.post(
        url,
        {},
        { withCredentials: true },
      );

      if (res.data.succes) {
        // Refresh the table after creating mounting
        await fetchIODetail();
      }
    } catch (error) {
      console.error('Error creating mounting:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditMounting = (mounting: MountingData) => {
    setEditingMounting(mounting);
    setShowMountingForm(true);
  };

  const handleDeleteMounting = async (
    mountingId: number,
    namaMounting: string,
  ) => {
    // Prevent deletion of Mounting A
    if (namaMounting === 'A') {
      alert('Mounting A cannot be deleted!');
      return;
    }

    if (!confirm(`Are you sure you want to delete Mounting ${namaMounting}?`)) {
      return;
    }

    try {
      setDeletingMountingId(mountingId);
      const url = `${
        import.meta.env.VITE_API_LINK
      }/marketing/io/mounting/${mountingId}`;
      const res: AxiosResponse = await axios.delete(url, {
        withCredentials: true,
      });

      if (res.data.succes) {
        // Refresh the table after deleting mounting
        await fetchIODetail();
      }
    } catch (error) {
      console.error('Error deleting mounting:', error);
      alert('Failed to delete mounting');
    } finally {
      setDeletingMountingId(null);
    }
  };

  const handleMountingFormClose = () => {
    setShowMountingForm(false);
    setEditingMounting(null);
    fetchIODetail(); // Refresh data after form closes
  };

  useEffect(() => {
    if (isOpen && ioId) {
      fetchIODetail();
    }
  }, [isOpen, ioId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Detail IO</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : ioData ? (
            <div className="p-6">
              {/* IO Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Nomor IO
                  </label>
                  <div className="text-lg font-semibold text-gray-900">
                    {ioData.no_io}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Customer
                  </label>
                  <div className="text-lg font-semibold text-gray-900">
                    {ioData.customer}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Status Revisi
                  </label>
                  <div className="text-lg font-semibold text-gray-900">
                    {ioData.is_revisi ? 'Ya' : 'Tidak'}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Produk
                  </label>
                  <div className="text-lg font-semibold text-gray-900">
                    {ioData.produk}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Nomor Revisi IO
                  </label>
                  <div className="text-lg font-semibold text-gray-900">
                    {ioData.revisi_no_io || '-'}
                  </div>
                </div>
              </div>

              {/* Mounting Section */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Mounting</h3>
                  <button
                    onClick={handleCreateMounting}
                    disabled={loading}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>+</span>
                    Tambah Mounting
                  </button>
                </div>

                {/* Mounting Table */}
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            No
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nama Mounting
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nama Kertas
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bagian
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Isi
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Keterangan
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {ioData.io_mounting && ioData.io_mounting.length > 0 ? (
                          ioData.io_mounting.map((mounting, index) => (
                            <tr key={mounting.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                {index + 1}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                {mounting.nama_mounting}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                {mounting.nama_kertas}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                {mounting.ukuran_cetak_bagian_1}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                {mounting.ukuran_cetak_isi_1}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">
                                {mounting.keterangan_revisi || '-'}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleEditMounting(mounting)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
                                  >
                                    Edit
                                  </button>
                                  {mounting.nama_mounting !== 'A' && (
                                    <button
                                      onClick={() =>
                                        handleDeleteMounting(
                                          mounting.id,
                                          mounting.nama_mounting,
                                        )
                                      }
                                      disabled={
                                        deletingMountingId === mounting.id
                                      }
                                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {deletingMountingId === mounting.id
                                        ? 'Deleting...'
                                        : 'Delete'}
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={7}
                              className="px-4 py-8 text-center text-gray-500"
                            >
                              No mounting data available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center h-64 text-gray-500">
              No data available
            </div>
          )}
        </div>
      </div>
      {/* Mounting Form Popup */}
      {showMountingForm && (
        <MountingFormPopup
          ioId={ioId}
          mountingData={editingMounting}
          existingMountings={ioData?.io_mounting || []}
          isOpen={showMountingForm}
          onClose={handleMountingFormClose}
        />
      )}
    </div>
  );
};
export default IODetailPopup;
