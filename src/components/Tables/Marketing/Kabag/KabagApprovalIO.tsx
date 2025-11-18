import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import ModalKosonganSmall from '../../../Modals/ModalKosonganSmall';

// Updated interface to match the new API response
interface IOItem {
  id: number;
  id_okp: number;
  id_create_io: number;
  id_approve_io: number | null;
  no_io: string;
  customer: string;
  produk: string;
  status: string;
  status_io: string;
  status_proses: string;
  status_send_proof: string;
  tgl_pembuatan_io: string;
  tgl_approve_io: string | null;
  note_reject: string | null;
  is_active: boolean;
  is_revisi: boolean;
  revisi_no_io: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T = any> {
  data: T;
  status_code: number;
  succes: boolean;
}

interface ApiError {
  message: string;
  status?: number;
}

const KabagApprovalIO: React.FC = () => {
  const [data, setData] = useState<IOItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [alasanPending, setalasanPending] = useState<string>('');
  const [showPending, setShowPending] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

  const openModalPending = (id: number) => {
    setSelectedItemId(id);
    setShowPending(true);
  };

  const closeModalPending = () => {
    setShowPending(false);
    setSelectedItemId(null);
    setalasanPending('');
  };

  useEffect(() => {
    fetchIOData();
  }, []);

  const fetchIOData = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/marketing/io`;
    try {
      setLoading(true);
      const res: AxiosResponse<ApiResponse<IOItem[]>> = await axios.get(url);
      console.log('Fetched IO data:', res.data);
      if (res.data && res.data.data) {
        setData(res.data.data);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching IO data:', error);
      const apiError = error as ApiError;
      alert(`Error: ${apiError.message || 'Failed to fetch data'}`);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Updated approve function
  async function RequestKabag(id: number) {
    if (window.confirm('Apakah Anda yakin ingin Approve IO Ini?')) {
      try {
        const url = `${
          import.meta.env.VITE_API_LINK
        }/marketing/io/approve/${id}`;
        const res = await axios.put(
          url,
          {},
          {
            withCredentials: true,
          },
        );
        fetchIOData();
      } catch (error: any) {
        console.log(error);
        alert('Error approving IO');
      }
    }
  }

  // Updated reject function
  async function RejectKabag(id: number) {
    if (!alasanPending.trim()) {
      alert('Alasan reject harus diisi');
      return;
    }

    if (window.confirm('Apakah Anda yakin ingin Reject IO Ini?')) {
      try {
        const url = `${
          import.meta.env.VITE_API_LINK
        }/marketing/io/reject/${id}`;
        const res = await axios.put(
          url,
          {
            note_reject: alasanPending,
          },
          {
            withCredentials: true,
          },
        );
        closeModalPending();
        fetchIOData();
      } catch (error: any) {
        console.log(error);
        alert('Error rejecting IO');
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  No
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  No IO
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status IO
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tanggal Pembuatan
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Produk
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Status Proses
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.length > 0 ? (
                data.map((item: IOItem, index: number) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs">{index + 1}</td>
                    <td className="px-4 py-3 text-xs">{item.no_io}</td>
                    <td className="px-4 py-3 text-xs">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {item.status_io}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {new Date(item.tgl_pembuatan_io).toLocaleDateString(
                        'id-ID',
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs">{item.customer}</td>
                    <td className="px-4 py-3 text-xs max-w-xs truncate">
                      {item.produk}
                    </td>
                    <td className="px-4 py-3 text-xs text-center">
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs uppercase">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-center">
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs uppercase">
                        {item.status_proses}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <div className="flex flex-col gap-2">
                        {item.status === 'requested' && (
                          <>
                            <button
                              onClick={() => RequestKabag(item.id)}
                              className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => openModalPending(item.id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Tidak ada data IO
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {showPending && (
        <ModalKosonganSmall
          isOpen={showPending}
          onClose={closeModalPending}
          judul="Alasan Reject"
        >
          <div className="flex flex-col gap-2 px-4 py-4">
            <div className="flex gap-2 flex-col w-full">
              <textarea
                value={alasanPending}
                onChange={(e) => setalasanPending(e.target.value)}
                placeholder="Masukkan alasan reject..."
                className="border-2 border-stroke w-full rounded-sm col-span-2 h-20 p-2 resize-none"
              />
            </div>
            <button
              onClick={() => selectedItemId && RejectKabag(selectedItemId)}
              disabled={!alasanPending.trim()}
              className="w-full h-10 rounded-md bg-red-600 text-white text-xs font-bold justify-center items-center px-10 py-2 hover:cursor-pointer disabled:opacity-50"
            >
              REJECT
            </button>
          </div>
        </ModalKosonganSmall>
      )}
    </div>
  );
};

export default KabagApprovalIO;
