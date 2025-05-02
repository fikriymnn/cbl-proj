import React, { useState } from 'react';

interface JobOrder {
  id: number;
  no_jo: string;
  item: string;
  qty_druk: number;
  qty_pcs: number;
  tgl_kirim: string;
}

interface ListJOData {
  data: JobOrder[];
}

const JobOrderTable = ({
  listJO,
  get1Tiket,
  setSelectedJO,
  setSelectedIndex,
  setIsModalOpen,
  isDetailVisible,
  setIsDetailVisible,
  loading = false,
  title = 'Job Order List',
  getmasterKategori,
}: {
  listJO: ListJOData;
  get1Tiket: (id: number, index: number) => void;
  setSelectedJO: (jo: JobOrder) => void;
  setSelectedIndex: (index: number) => void;
  setIsModalOpen: (isOpen: boolean) => void;
  isDetailVisible?: boolean;
  setIsDetailVisible: (isVisible: boolean) => void;
  loading?: boolean;
  title?: string;
  getmasterKategori: (
    startDate: string,
    endDate: string,
    searchTerm: string,
  ) => void;
}) => {
  // State for filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Handler for search button click
  const handleSearch = () => {
    // Call getmasterKategori with the filter parameters
    getmasterKategori(startDate, endDate, searchTerm);
  };

  // Handler for the detail button click
  const handleDetailClick = (jo: any, index: any) => {
    get1Tiket(jo.id, index);
    setSelectedJO(jo);
    setSelectedIndex(index);
    setIsModalOpen(true);
  };

  // Filter UI
  const renderFilters = () => (
    <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1 text-gray-700">
            Tanggal Mulai
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
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
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
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
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition duration-200"
          >
            Tampilkan
          </button>
        </div>
      </div>
    </div>
  );

  // Render the table content
  const renderTable = () => (
    <div className="overflow-x-auto py-2">
      <table className="w-full border-collapse shadow-lg rounded-md overflow-hidden">
        {/* Table Header */}
        <thead className="bg-blue-500 text-white font-semibold">
          <tr>
            <th className="border border-blue-600 px-4 py-2">No</th>
            <th className="border border-blue-600 px-4 py-2">No JO</th>
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
              <td colSpan={7} className="text-center py-4 text-gray-600">
                Loading...
              </td>
            </tr>
          ) : listJO?.data?.length > 0 ? (
            listJO.data.map((jo, index) => (
              <tr
                key={index}
                className={`${
                  index % 2 === 0 ? 'bg-blue-50' : 'bg-white'
                } hover:bg-blue-100 transition duration-200`}
              >
                <td className="border border-blue-200 px-4 py-2 text-center">
                  {index + 1}
                </td>
                <td className="border border-blue-200 px-4 py-2 text-center">
                  {jo.no_jo}
                </td>
                <td className="border border-blue-200 px-4 py-2 text-center">
                  {jo.item}
                </td>
                <td className="border border-blue-200 px-4 py-2 text-center">
                  {jo.qty_druk}
                </td>
                <td className="border border-blue-200 px-4 py-2 text-center">
                  {jo.qty_pcs}
                </td>
                <td className="border border-blue-200 px-4 py-2 text-center">
                  {jo.tgl_kirim}
                </td>
                <td className="border border-blue-200 px-4 py-2 text-center">
                  <button
                    onClick={() => handleDetailClick(jo, index)}
                    className="text-[#0065de] text-sm font-bold"
                  >
                    DETAIL
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="text-center py-4 text-gray-600">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  // If this is being rendered as a detail panel
  if (isDetailVisible !== undefined) {
    return (
      <>
        {isDetailVisible && (
          <div className="fixed right-0 top-7 h-full w-[70%] bg-white shadow-lg p-4 overflow-y-auto rounded-xl ">
            <h2 className="text-lg font-bold mb-4">{title}</h2>

            <button
              onClick={() => setIsDetailVisible(false)}
              className="text-white font-semibold px-4 py-2 text-sm mt-3 rounded-md bg-red-600 mb-4"
            >
              Close
            </button>

            {renderFilters()}
            {renderTable()}
          </div>
        )}
      </>
    );
  }

  // If this is being rendered as a standalone table
  return (
    <div>
      {renderFilters()}
      {renderTable()}
    </div>
  );
};

export default JobOrderTable;
