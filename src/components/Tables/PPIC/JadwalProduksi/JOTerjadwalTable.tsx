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

  // Load initial data when component mounts
  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([
        getmasterKategori('history'),
        getmasterKategori('penjadwalan'),
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
      console.log('listJO 1', res.data);
    } catch (error: any) {
      setIsLoading(false);
      console.error('Error fetching single ticket:', error);
    }
  }

  // Handle cancel with confirmation
  const handleCancelJobOrder = async (jobOrder: JobOrder) => {
    const confirmMessage = `Apa anda yakin ingin membatalkan Job Order "${jobOrder.no_jo}" untuk item "${jobOrder.item}"?`;

    if (window.confirm(confirmMessage)) {
      await cancelJobOrder(jobOrder.id);
    }
  };

  // New cancel function
  async function cancelJobOrder(id: number) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/ppic/jadwalProduksi/cancel/${id}`;
    try {
      setIsLoading(true);

      const res = await axios.delete(
        url,

        {
          withCredentials: true,
        },
      );

      console.log('Job Order cancelled successfully:', res.data);

      // Refresh the data after successful cancellation
      await Promise.all([
        getmasterKategori('history'),
        getmasterKategori('penjadwalan'),
      ]);

      setIsLoading(false);

      // Show success message
      alert('Job Order cancelled successfully!');

      return res.data;
    } catch (error: any) {
      setIsLoading(false);
      console.error('Error cancelling job order:', error);

      // Show error message
      alert('Failed to cancel job order. Please try again.');

      throw error;
    }
  }

  // Modified getmasterKategori function to handle both statuses
  async function getmasterKategori(
    statusTiket: string = 'history',
    startDate: string = '',
    endDate: string = '',
    searchTerm: string = '',
  ) {
    const url = `${import.meta.env.VITE_API_LINK}/ppic/jadwalProduksi`;
    try {
      setIsLoading(true);

      // Prepare parameters with proper typing
      const params: {
        status_tiket: string;
        start_date?: string;
        end_date?: string;
        search?: string;
      } = {
        status_tiket: statusTiket,
      };

      // Add filter parameters if provided
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (searchTerm) params.search = searchTerm;

      const res = await axios.get(url, {
        params,
        withCredentials: true,
      });

      console.log(`getmasterKategori ${statusTiket} response:`, res.data);

      // Handle different response data structures
      let responseData = res.data;

      // If the response is not in the expected format, normalize it
      if (!responseData.data && Array.isArray(responseData)) {
        responseData = { data: responseData };
      } else if (!responseData.data) {
        responseData = { data: [] };
      }

      // Set data to the appropriate state based on status_tiket
      if (statusTiket === 'history') {
        setHistoryListJO(responseData);
        console.log('historyListJO set to:', responseData);
      } else if (statusTiket === 'penjadwalan') {
        setPenjadwalanListJO(responseData);
        console.log('penjadwalanListJO set to:', responseData);
      } else if (statusTiket === 'penjadwalan') {
        setPenjadwalanListJO(responseData);
        console.log('penjadwalanListJO set to:', responseData);
      } else if (statusTiket === 'canceled') {
        setCanceledListJO(responseData);
        console.log('canceledListJO set to:', responseData);
      }

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('Error fetching master kategori:', error);

      // Set empty data on error
      const emptyData = { data: [] };
      if (statusTiket === 'history') {
        setHistoryListJO(emptyData);
      } else if (statusTiket === 'penjadwalan') {
        setPenjadwalanListJO(emptyData);
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
            cancelJobOrder={handleCancelJobOrder} // Pass the handler function to the table component
            canceledListJO={canceledListJO}
          />
        </div>
      </div>
    </main>
  );
}

export default JOTerjadwalTable;
