import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Loading from '../../../Loading';
import JobOrderTable from './JobOrderTable';

interface JobOrder {
  id: number;
  no_jo: string;
  no_io: string;
  item: string;
  qty_druk: number;
  qty_pcs: number;
  tgl_kirim: string;
  no_booking?: string;
}

interface ListJOData {
  data: JobOrder[];
  total_data?: number;
  total_page?: number;
}

function JOTerjadwalTable() {
  const [isLoading, setIsLoading] = useState(false);
  const [historyListJO, setHistoryListJO] = useState<ListJOData>({ data: [] });
  const [canceledListJO, setCanceledListJO] = useState<ListJOData>({
    data: [],
  });
  const [penjadwalanListJO, setPenjadwalanListJO] = useState<ListJOData>({
    data: [],
  });

  const [selectedJO, setSelectedJO] = useState<JobOrder | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [listJO1, setJo1] = useState<any>();
  // Cancel modal states
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelNote, setCancelNote] = useState('');
  const [pendingCancelJO, setPendingCancelJO] = useState<JobOrder | null>(null);

  // Load initial data when component mounts
  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([
        getmasterKategori('history', '', '', '', 1, 10),
        getmasterKategori('penjadwalan', '', '', '', 1, 10),
      ]);
    };

    loadInitialData();
  }, []);

  async function get1Tiket(id: number, i: number) {
    const url = `${import.meta.env.VITE_API_LINK}/ppic/jadwalProduksi/${id}`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        withCredentials: true,
      });
      setJo1(res.data);
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
      console.error('Error fetching single ticket:', error);
    }
  }

  const handleCancelJobOrder = (jobOrder: JobOrder) => {
    setPendingCancelJO(jobOrder);
    setCancelNote('');
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!pendingCancelJO) return;
    if (!cancelNote.trim()) {
      alert('Note cancel wajib diisi.');
      return;
    }
    await cancelJobOrder(pendingCancelJO.id, cancelNote);
    setCancelModalOpen(false);
    setPendingCancelJO(null);
    setCancelNote('');
  };

  async function cancelJobOrder(id: number, noteCancel: string) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/ppic/jadwalProduksi/cancel/${id}`;
    try {
      setIsLoading(true);

      const tglCancel = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"

      const res = await axios.delete(url, {
        data: {
          note_cancel: noteCancel,
          tgl_cancel: tglCancel,
        },
        withCredentials: true,
      });

      // Refresh all three lists back to their first page after a cancel,
      // since the underlying data (and therefore total_page) has changed.
      await Promise.all([
        getmasterKategori('history', '', '', '', 1, 10),
        getmasterKategori('penjadwalan', '', '', '', 1, 10),
        getmasterKategori('canceled', '', '', '', 1, 10),
      ]);

      setIsLoading(false);
      alert('Job Order cancelled successfully!');
      return res.data;
    } catch (error: any) {
      setIsLoading(false);
      alert('Failed to cancel job order. Please try again.');
      throw error;
    }
  }

  // Fetches job order data for a given status and updates the matching state.
  // page/limit are now real, caller-controlled pagination params (instead of
  // being hardcoded), and the response's total_data/total_page are kept on
  // state so the table can render an accurate pagination control.
  async function getmasterKategori(
    statusTiket: string = 'history',
    startDate: string = '',
    endDate: string = '',
    searchTerm: string = '',
    page: number = 1,
    limit: number = 10,
  ) {
    const url = `${import.meta.env.VITE_API_LINK}/ppic/jadwalProduksi`;
    try {
      setIsLoading(true);

      const params: {
        status_tiket: string;
        start_date?: string;
        end_date?: string;
        search?: string;
        page?: number;
        limit?: number;
      } = {
        status_tiket: statusTiket,
        page,
        limit,
      };

      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (searchTerm) params.search = searchTerm;

      const res = await axios.get(url, {
        params,
        withCredentials: true,
      });
      console.log('Response from API:', res.data); // Log the response for debugging
      let responseData = res.data;

      // Normalize response shape if the API doesn't return { data: [...] }
      if (!responseData.data && Array.isArray(responseData)) {
        responseData = { data: responseData };
      } else if (!responseData.data) {
        responseData = { data: [] };
      }

      const normalized: ListJOData = {
        data: responseData.data,
        total_data: responseData.total_data,
        total_page: responseData.total_page,
      };

      if (statusTiket === 'history') {
        setHistoryListJO(normalized);
      } else if (statusTiket === 'penjadwalan') {
        setPenjadwalanListJO(normalized);
      } else if (statusTiket === 'canceled') {
        setCanceledListJO(normalized);
      }

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('Error fetching master kategori:', error);

      const emptyData: ListJOData = { data: [] };
      if (statusTiket === 'history') {
        setHistoryListJO(emptyData);
      } else if (statusTiket === 'penjadwalan') {
        setPenjadwalanListJO(emptyData);
      } else if (statusTiket === 'canceled') {
        setCanceledListJO(emptyData);
      }
    }
  }

  return (
    <main className="overflow-x-scroll">
      {isLoading && <Loading />}
      <div className="min-w-[700px] bg-white rounded-xl flex gap-1 px-4 py-4">
        <div className="flex flex-col gap-2 w-full">
          <h1 className="text-lg font-semibold">Jadwal Produksi</h1>
          <JobOrderTable
            historyListJO={historyListJO}
            penjadwalanListJO={penjadwalanListJO}
            get1Tiket={get1Tiket}
            setSelectedJO={setSelectedJO}
            setSelectedIndex={setSelectedIndex}
            setIsModalOpen={setIsModalOpen}
            isDetailVisible={isDetailVisible}
            setIsDetailVisible={setIsDetailVisible}
            loading={isLoading}
            title="Job Order List"
            getmasterKategori={getmasterKategori}
            listJO1={listJO1}
            cancelJobOrder={handleCancelJobOrder}
            canceledListJO={canceledListJO}
          />
        </div>
      </div>
      {/* Cancel confirmation modal */}
      {cancelModalOpen && pendingCancelJO && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-base font-semibold">Cancel Job Order</h2>
              <button
                onClick={() => setCancelModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-4">
              {/* Job order summary */}
              <div className="bg-gray-50 rounded-md p-3 mb-4 text-sm">
                <div className="grid grid-cols-2 gap-1">
                  <span className="text-gray-500">No JO</span>
                  <span className="font-medium">{pendingCancelJO.no_jo}</span>
                  <span className="text-gray-500">Item</span>
                  <span>{pendingCancelJO.item}</span>
                  <span className="text-gray-500">Tgl cancel</span>
                  <span>{new Date().toLocaleDateString('id-ID')}</span>
                </div>
              </div>

              {/* Note textarea */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Note cancel <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={cancelNote}
                  onChange={(e) => setCancelNote(e.target.value)}
                  placeholder="Masukkan alasan pembatalan..."
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-400 focus:border-red-400 resize-vertical"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setCancelModalOpen(false)}
                  className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmCancel}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm rounded-md bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50"
                >
                  {isLoading ? 'Loading...' : 'Konfirmasi cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default JOTerjadwalTable;
