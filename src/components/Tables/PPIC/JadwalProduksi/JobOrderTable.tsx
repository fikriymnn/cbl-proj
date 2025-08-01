import React, { useState, useEffect } from 'react';

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

// Add ModalXL component
const ModalXL = ({
  isOpen,
  onClose,
  judul,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  judul: string;
  children: React.ReactNode;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">{judul}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        <div className="p-0">{children}</div>
      </div>
    </div>
  );
};

const JobOrderTable = ({
  historyListJO,
  penjadwalanListJO,
  canceledListJO, // Add canceled list prop
  get1Tiket,
  setSelectedJO,
  setSelectedIndex,
  setIsModalOpen,
  isDetailVisible,
  setIsDetailVisible,
  loading = false,
  title = 'Job Order List',
  getmasterKategori,
  listJO1,
  cancelJobOrder,
}: {
  historyListJO: ListJOData;
  penjadwalanListJO: ListJOData;
  canceledListJO: ListJOData; // Add canceled list prop type
  get1Tiket: (id: number, index: number) => void;
  setSelectedJO: (jo: JobOrder) => void;
  setSelectedIndex: (index: number) => void;
  setIsModalOpen: (isOpen: boolean) => void;
  isDetailVisible?: boolean;
  setIsDetailVisible: (isVisible: boolean) => void;
  loading?: boolean;
  title?: string;
  getmasterKategori: (
    statusTiket: string,
    startDate: string,
    endDate: string,
    searchTerm: string,
  ) => void;
  listJO1?: any;
  cancelJobOrder?: (jobOrder: JobOrder) => void;
}) => {
  // State for filters - Updated to include canceled status
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStatus, setActiveStatus] = useState<
    'history' | 'penjadwalan' | 'canceled'
  >('history');

  // Modal states - Fixed initialization
  const [isModalOpenLocal, setIsModalOpenLocal] = useState(false);
  const [selectedJOLocal, setSelectedJOLocal] = useState<JobOrder | null>(null);
  const [selectedIndexLocal, setSelectedIndexLocal] = useState<number>(0);
  const [showDetail, setShowDetail] = useState<boolean[]>([]);

  // Helper functions
  const convertTimeStampToDate = (timestamp: string) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleDateString();
  };

  const formatInteger = (num: number) => {
    return num ? num.toLocaleString() : '0';
  };

  const formatCustomDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  // Get the correct data based on activeStatus - Updated to include canceled
  const getActiveData = () => {
    switch (activeStatus) {
      case 'history':
        return historyListJO;
      case 'penjadwalan':
        return penjadwalanListJO;
      case 'canceled':
        return canceledListJO;
      default:
        return historyListJO;
    }
  };

  const activeData = getActiveData();

  // Debug: Log the data to see what we're getting
  useEffect(() => {
    console.log('Active Status:', activeStatus);
    console.log('History Data:', historyListJO);
    console.log('Penjadwalan Data:', penjadwalanListJO);
    console.log('Canceled Data:', canceledListJO);
    console.log('Active Data:', activeData);
  }, [
    activeStatus,
    historyListJO,
    penjadwalanListJO,
    canceledListJO,
    activeData,
  ]);

  // Handler for search button click
  const handleSearch = () => {
    getmasterKategori(activeStatus, startDate, endDate, searchTerm);
  };

  // Handler for status change - Updated to include canceled
  const handleStatusChange = (
    status: 'history' | 'penjadwalan' | 'canceled',
  ) => {
    setActiveStatus(status);
    setStartDate('');
    setEndDate('');
    setSearchTerm('');
    getmasterKategori(status, '', '', '');
  };

  // Handler for the detail button click - Fixed to properly set local state
  const handleDetailClick = (jo: JobOrder, index: number) => {
    get1Tiket(jo.id, index);
    setSelectedJO(jo);
    setSelectedIndex(index);
    // Set local state properly
    setSelectedJOLocal(jo);
    setSelectedIndexLocal(index);
    setIsModalOpen(true);
    setIsModalOpenLocal(true);
    // Initialize showDetail array
    setShowDetail(new Array(listJO1?.data?.tahap?.length || 0).fill(false));
  };

  // Handler for detail toggle in modal
  const handleClickDetail = (index: number) => {
    const newShowDetail = [...showDetail];
    newShowDetail[index] = !newShowDetail[index];
    setShowDetail(newShowDetail);
  };

  // Function to get data array safely - Updated to include canceled
  const getDataArray = () => {
    let data;
    switch (activeStatus) {
      case 'history':
        data = historyListJO;
        break;
      case 'penjadwalan':
        data = penjadwalanListJO;
        break;
      case 'canceled':
        data = canceledListJO;
        break;
      default:
        data = historyListJO;
    }

    if (Array.isArray(data)) {
      return data;
    } else if (data && Array.isArray(data.data)) {
      return data.data;
    }

    return [];
  };

  const dataArray = getDataArray();

  // Helper function to get status display name
  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'history':
        return 'Jadwal';
      case 'penjadwalan':
        return 'Booking';
      case 'canceled':
        return 'Canceled';
      default:
        return status;
    }
  };

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'history':
        return 'bg-blue-600 text-white';
      case 'penjadwalan':
        return 'bg-green-600 text-white';
      case 'canceled':
        return 'bg-red-600 text-white';
      default:
        return 'bg-gray-200 text-gray-700 hover:bg-gray-300';
    }
  };

  // Filter UI - Updated to include canceled status
  const renderFilters = () => (
    <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        {/* Status Toggle - Updated to include canceled */}
        <div className="flex flex-col col-span-2">
          <label className="text-sm font-medium mb-1 text-gray-700">
            Status Tiket
          </label>
          <div className="flex space-x-2">
            <button
              onClick={() => handleStatusChange('history')}
              className={`px-3 py-2 text-sm rounded-md transition-colors ${
                activeStatus === 'history'
                  ? getStatusColor('history')
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Jadwal
            </button>
            <button
              onClick={() => handleStatusChange('penjadwalan')}
              className={`px-3 py-2 text-sm rounded-md transition-colors ${
                activeStatus === 'penjadwalan'
                  ? getStatusColor('penjadwalan')
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Booking
            </button>
            <button
              onClick={() => handleStatusChange('canceled')}
              className={`px-3 py-2 text-sm rounded-md transition-colors ${
                activeStatus === 'canceled'
                  ? getStatusColor('canceled')
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Canceled
            </button>
          </div>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1 text-gray-700">
            Tanggal Mulai
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1 text-gray-700">
            Tanggal Akhir
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1 text-gray-700">
            Pencarian
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari No JO, Item, dll."
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Tampilkan'}
          </button>
        </div>
      </div>
    </div>
  );

  // Render the table content - Updated header logic
  const renderTable = () => (
    <div className="overflow-x-auto py-2">
      <table className="w-full border-collapse shadow-lg rounded-md overflow-hidden">
        {/* Table Header - Updated to handle canceled status */}
        <thead className="bg-blue-500 text-white font-semibold">
          <tr>
            <th className="border border-blue-600 px-4 py-2">No</th>
            <th className="border border-blue-600 px-4 py-2">
              {activeStatus === 'penjadwalan' ? 'No Booking' : 'No JO'}
            </th>
            <th className="border border-blue-600 px-4 py-2">No IO</th>
            <th className="border border-blue-600 px-4 py-2">Item</th>
            <th className="border border-blue-600 px-4 py-2">Qty Druk</th>
            <th className="border border-blue-600 px-4 py-2">Qty PCS</th>
            <th className="border border-blue-600 px-4 py-2">Tanggal Kirim</th>
            <th className="border border-blue-600 px-4 py-2">Action</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={7} className="text-center py-8 text-gray-600">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                  Loading...
                </div>
              </td>
            </tr>
          ) : dataArray && dataArray.length > 0 ? (
            dataArray.map((jo: JobOrder, index: number) => (
              <tr
                key={jo.id || index}
                className={`${
                  index % 2 === 0 ? 'bg-blue-50' : 'bg-white'
                } hover:bg-blue-100 transition duration-200 ${
                  activeStatus === 'canceled' ? 'opacity-75' : ''
                }`}
              >
                <td className="border border-blue-200 px-4 py-2 text-center">
                  {index + 1}
                </td>
                <td className="border border-blue-200 px-4 py-2 text-center">
                  {activeStatus === 'penjadwalan'
                    ? jo.no_booking || jo.no_jo || 'N/A'
                    : jo.no_jo || 'N/A'}
                </td>
                <td className="border border-blue-200 px-4 py-2 text-center">
                  {jo.no_io || 'N/A'}
                </td>
                <td className="border border-blue-200 px-4 py-2 text-center">
                  {jo.item || 'N/A'}
                </td>
                <td className="border border-blue-200 px-4 py-2 text-center">
                  {jo.qty_druk || 0}
                </td>
                <td className="border border-blue-200 px-4 py-2 text-center">
                  {jo.qty_pcs || 0}
                </td>
                <td className="border border-blue-200 px-4 py-2 text-center">
                  {jo.tgl_kirim || 'N/A'}
                </td>
                <td className="border border-blue-200 px-4 py-2 text-center gap-2">
                  <div className="flex flex-col gap-2 justify-center items-center">
                    <button
                      onClick={() => handleDetailClick(jo, index)}
                      className="text-[#0065de] text-sm font-bold hover:text-blue-800 transition-colors px-2 py-1 rounded"
                    >
                      DETAIL
                    </button>
                    {/* Only show cancel button for non-canceled items */}
                    {cancelJobOrder && activeStatus !== 'canceled' && (
                      <button
                        onClick={() => cancelJobOrder(jo)}
                        className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded hover:bg-red-600 transition-colors"
                        title={`Cancel ${
                          activeStatus === 'penjadwalan'
                            ? jo.no_booking || jo.no_jo
                            : jo.no_jo
                        }`}
                      >
                        CANCEL
                      </button>
                    )}
                    {/* Show status badge for canceled items */}
                    {activeStatus === 'canceled' && (
                      <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
                        CANCELED
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="text-center py-8 text-gray-600">
                <div className="flex flex-col items-center">
                  <svg
                    className="w-12 h-12 text-gray-400 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p>No data available</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {activeStatus === 'history' && 'No scheduled jobs found'}
                    {activeStatus === 'penjadwalan' && 'No bookings found'}
                    {activeStatus === 'canceled' && 'No canceled jobs found'}
                  </p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Data count display */}
      {!loading && dataArray.length > 0 && (
        <div className="mt-2 text-sm text-gray-600">
          Showing {dataArray.length} {dataArray.length === 1 ? 'item' : 'items'}
          {activeStatus === 'canceled' && ' (canceled)'}
        </div>
      )}
    </div>
  );

  return (
    <div>
      {renderFilters()}
      {renderTable()}

      {/* Fixed Modal - Check both conditions and use proper state */}
      {isModalOpenLocal && selectedJOLocal && (
        <ModalXL
          isOpen={isModalOpenLocal}
          onClose={() => {
            setIsModalOpen(false);
            setIsModalOpenLocal(false);
            setSelectedJOLocal(null);
          }}
          judul={'Rumus Kalkulasi'}
        >
          <>
            <div className="grid grid-cols-2 gap-2 px-4 py-4 border-b-8 border-[#D8EAFF]">
              <div className="flex flex-col">
                <div className="grid grid-cols-2 gap-2">
                  <label className="text-black text-xs font-bold">
                    Nomor JO
                  </label>
                  <label className="text-[#016ae6] uppercase text-xl font-normal">
                    : {selectedJOLocal?.no_jo || 'N/A'}
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <label className="text-black text-xs font-bold">
                    Nomor IO
                  </label>
                  <label className="text-[#016ae6] uppercase text-xl font-normal">
                    : {selectedJOLocal?.no_io || 'N/A'}
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <label className="text-black text-xs font-bold">Item</label>
                  <label className="text-[#016ae6] uppercase text-xl font-normal">
                    : {selectedJOLocal?.item || 'N/A'}
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <label className="text-black text-xs font-bold">
                    Tanggal Kirim
                  </label>
                  <label className="text-[#016ae6] uppercase text-xl font-normal">
                    : {convertTimeStampToDate(selectedJOLocal?.tgl_kirim || '')}
                  </label>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="grid grid-cols-2 gap-2">
                  <label className="text-black text-xs font-bold">
                    Qty Druk
                  </label>
                  <label className="text-[#016ae6] uppercase text-xl font-normal">
                    : {formatInteger(selectedJOLocal?.qty_druk || 0)}
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <label className="text-black text-xs font-bold">
                    Qty Pcs
                  </label>
                  <label className="text-[#016ae6] uppercase text-xl font-normal">
                    : {formatInteger(selectedJOLocal?.qty_pcs || 0)}
                  </label>
                </div>
              </div>
            </div>
            <div className="flex overflow-x-scroll max-w-screen border-b-8 border-[#D8EAFF] gap-2 px-4 py-4">
              <div className="w-[150px] flex flex-col">
                <label className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]">
                  TAHAPAN
                </label>
                <label className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]">
                  TANGGAL
                </label>
                {showDetail[selectedIndexLocal] && (
                  <>
                    <label className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]">
                      KATEGORI
                    </label>
                    <label className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]">
                      DRYING TIME
                    </label>
                    <label className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]">
                      MESIN
                    </label>
                    <label className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]">
                      KAPASITAS/JAM
                    </label>
                    <label className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]">
                      DRYING TIME (JAM)
                    </label>
                    <label className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]">
                      SETTING (JAM)
                    </label>
                    <label className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]">
                      KAPASITAS (JAM)
                    </label>
                    <label className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]">
                      TOTAL WAKTU
                    </label>
                  </>
                )}
              </div>

              <div className="flex overflow-x-scroll max-w-screen">
                {listJO1?.data?.tahap?.map((data2: any, ii: number) => (
                  <div
                    key={ii}
                    className="min-w-[150px] flex flex-col justify-center"
                  >
                    <label className="text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]">
                      {data2.tahapan}
                    </label>
                    <div className="justify-center border-2 border-stroke flex items-center h-[50px]">
                      {data2?.jadwal_per_jam?.length == 0 ? (
                        <label className="text-blue-400 text-xs border-2 px-2 py-1 rounded-md border-blue-400 text-center">
                          {data2.tgl_from == null || data2.tgl_from == ''
                            ? '-'
                            : formatCustomDate(data2.tgl_from)}
                        </label>
                      ) : (
                        <button className="text-blue-400 text-xs border-2 px-2 py-1 rounded-md border-blue-400 text-center">
                          {data2.jadwal_per_jam?.length == 0
                            ? '-'
                            : convertTimeStampToDate(
                                data2.jadwal_per_jam[0]?.tanggal,
                              )}{' '}
                          - {data2.jadwal_per_jam[0]?.jam}
                        </button>
                      )}
                    </div>
                    {showDetail[selectedIndexLocal] && (
                      <>
                        <label className="text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]">
                          {data2.kategory}
                        </label>
                        <label className="text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]">
                          {data2.kategory_drying_time}
                        </label>
                        <label className="text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]">
                          {data2.mesin}
                        </label>
                        <label className="text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]">
                          {data2.kapasitas_per_jam}
                        </label>
                        <label className="text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]">
                          {data2.drying_time}
                        </label>
                        <label className="text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]">
                          {data2.setting}
                        </label>
                        <label className="text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]">
                          {data2.kapasitas}
                        </label>
                        <label className="text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]">
                          {data2.total_waktu}
                        </label>
                      </>
                    )}
                  </div>
                ))}
              </div>
              <div className="">
                <button
                  title="button"
                  onClick={() => handleClickDetail(selectedIndexLocal)}
                  className="text-xs w-full flex font-bold text-white px-1 bg-blue-700 py-2 border-blue-700 border rounded-md"
                >
                  DETAIL
                </button>
              </div>
            </div>
          </>
        </ModalXL>
      )}

      {/* Optional: Keep the side panel modal if needed elsewhere */}
      {isDetailVisible !== undefined && isDetailVisible && (
        <div className="fixed right-0 top-7 h-full w-[70%] bg-white shadow-lg p-4 overflow-y-auto rounded-xl z-50">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">{title}</h2>
            <button
              onClick={() => setIsDetailVisible(false)}
              className="text-white font-semibold px-4 py-2 text-sm rounded-md bg-red-600 hover:bg-red-700 transition-colors"
            >
              Close
            </button>
          </div>

          {renderFilters()}
          {renderTable()}
        </div>
      )}
    </div>
  );
};

export default JobOrderTable;
