import { useState, useEffect } from 'react';
import axios from 'axios';

interface DeliveryItem {
  id: number;
  no_jo: string;
  item: string;
  customer: string;
  no_booking?: string;
  no_io?: string;
  no_po?: string;
  status?: string;
  status_tiket?: string;
  tgl_cetak?: string;
  tgl_so?: string;
  qty_druk: number;
  qty_pcs: number;
  qty_po: number;
  tgl_kirim?: string;
  tgl_kirim_date?: string;
  tgl_kirim_update?: string;
  tgl_kirim_update_date?: string;
  tgl_so_date?: string;
}

interface DeliveryGroup {
  tgl_kirim: string;
  data?: DeliveryItem[];
}

function JadwalKirim() {
  const [jadwalKirim, setJadwalKirim] = useState<DeliveryGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterValue, setFilterValue] = useState('');
  const [expandedRows, setExpandedRows] = useState<number[]>([]);

  useEffect(() => {
    getJadwalKirim();
  }, []);

  async function getJadwalKirim() {
    const url = `${import.meta.env.VITE_API_LINK}/ppic/jadwalKirim`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, { withCredentials: true });
      setIsLoading(false);
      setJadwalKirim(res.data.data);
      console.log('jadwal kirim', res.data.data);
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  }

  // Helper function to display dash if value is null or empty
  const displayValue = (value: any) => {
    return value === null || value === '' ? '-' : value;
  };

  // Toggle row expansion
  const toggleRowExpansion = (id: number) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id],
    );
  };

  // Filter function for the data
  const filteredJadwalKirim = jadwalKirim
    .filter((dateGroup) => {
      // Check if the tgl_kirim matches the filter
      const searchLower = filterValue.toLowerCase();
      if (
        searchLower &&
        dateGroup.tgl_kirim &&
        dateGroup.tgl_kirim.toLowerCase().includes(searchLower)
      ) {
        return true;
      }

      // Otherwise, check if any items match the filter
      return dateGroup.data?.some((item) => {
        if (!searchLower) return true;

        // Check every field for a match
        return (
          (item.no_jo && item.no_jo.toLowerCase().includes(searchLower)) ||
          (item.item && item.item.toLowerCase().includes(searchLower)) ||
          (item.customer &&
            item.customer.toLowerCase().includes(searchLower)) ||
          (item.no_booking &&
            item.no_booking?.toLowerCase().includes(searchLower)) ||
          (item.no_io && item.no_io?.toLowerCase().includes(searchLower)) ||
          (item.no_po && item.no_po?.toLowerCase().includes(searchLower)) ||
          (item.status && item.status?.toLowerCase().includes(searchLower)) ||
          (item.status_tiket &&
            item.status_tiket?.toLowerCase().includes(searchLower)) ||
          (item.tgl_cetak &&
            item.tgl_cetak?.toLowerCase().includes(searchLower)) ||
          (item.tgl_so && item.tgl_so?.toLowerCase().includes(searchLower)) ||
          (item.tgl_kirim &&
            item.tgl_kirim?.toLowerCase().includes(searchLower)) ||
          (item.tgl_kirim_update &&
            item.tgl_kirim_update?.toLowerCase().includes(searchLower)) ||
          String(item.qty_druk).includes(searchLower) ||
          String(item.qty_pcs).includes(searchLower) ||
          String(item.qty_po).includes(searchLower)
        );
      });
    })
    .map((dateGroup) => {
      // If the date itself matches the filter, return all items
      const searchLower = filterValue.toLowerCase();
      if (
        searchLower &&
        dateGroup.tgl_kirim &&
        dateGroup.tgl_kirim.toLowerCase().includes(searchLower)
      ) {
        return dateGroup;
      }

      // Otherwise filter the items
      return {
        ...dateGroup,
        data: dateGroup.data?.filter((item) => {
          if (!searchLower) return true;

          return (
            (item.no_jo && item.no_jo.toLowerCase().includes(searchLower)) ||
            (item.item && item.item.toLowerCase().includes(searchLower)) ||
            (item.customer &&
              item.customer.toLowerCase().includes(searchLower)) ||
            (item.no_booking &&
              item.no_booking?.toLowerCase().includes(searchLower)) ||
            (item.no_io && item.no_io?.toLowerCase().includes(searchLower)) ||
            (item.no_po && item.no_po?.toLowerCase().includes(searchLower)) ||
            (item.status && item.status?.toLowerCase().includes(searchLower)) ||
            (item.status_tiket &&
              item.status_tiket?.toLowerCase().includes(searchLower)) ||
            (item.tgl_cetak &&
              item.tgl_cetak?.toLowerCase().includes(searchLower)) ||
            (item.tgl_so && item.tgl_so?.toLowerCase().includes(searchLower)) ||
            (item.tgl_kirim &&
              item.tgl_kirim?.toLowerCase().includes(searchLower)) ||
            (item.tgl_kirim_update &&
              item.tgl_kirim_update?.toLowerCase().includes(searchLower)) ||
            String(item.qty_druk).includes(searchLower) ||
            String(item.qty_pcs).includes(searchLower) ||
            String(item.qty_po).includes(searchLower)
          );
        }),
      };
    });

  return (
    <main className="p-4 max-w-full">
      <h1 className="text-xl font-bold mb-4 text-gray-800">
        Shipping Schedule
      </h1>

      {/* Filter input */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            className="w-full p-2 pl-8 pr-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Filter by any field (JO, Item, Customer, Date, Status, etc.)..."
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
          {filterValue && (
            <button
              className="absolute inset-y-0 right-0 flex items-center pr-2"
              onClick={() => setFilterValue('')}
            >
              <svg
                className="w-4 h-4 text-gray-400 hover:text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          {filteredJadwalKirim.map((dateGroup, dateIndex) => (
            <div key={dateIndex} className="mb-4">
              <div className="bg-blue-500 py-2 px-3 rounded-t-lg">
                <h2 className="font-bold text-sm text-white">
                  {dateGroup.tgl_kirim}
                </h2>
              </div>

              <table className="min-w-full bg-white border border-gray-200 shadow-sm rounded-b-lg text-xs">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-2 text-left border-b font-medium text-gray-700 w-8">
                      No.
                    </th>
                    <th className="py-2 px-2 text-left border-b font-medium text-gray-700">
                      No. JO
                    </th>
                    <th className="py-2 px-2 text-left border-b font-medium text-gray-700">
                      Item
                    </th>
                    <th className="py-2 px-2 text-left border-b font-medium text-gray-700">
                      Customer
                    </th>
                    <th className="py-2 px-2 text-left border-b font-medium text-gray-700">
                      Qty PCS
                    </th>
                    <th className="py-2 px-2 text-left border-b font-medium text-gray-700">
                      Qty Print
                    </th>
                    <th className="py-2 px-2 text-left border-b font-medium text-gray-700">
                      Qty PO
                    </th>
                    <th className="py-2 px-2 text-left border-b font-medium text-gray-700 w-8">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dateGroup.data &&
                    dateGroup.data.map((item: any, idx: any) => (
                      <>
                        <tr
                          key={`row-${item.id}`}
                          className={`border-b hover:bg-gray-50 ${
                            idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }`}
                        >
                          <td className="py-1.5 px-2 border-r">{idx + 1}</td>
                          <td className="py-1.5 px-2 font-medium border-r">
                            {displayValue(item.no_jo)}
                          </td>
                          <td className="py-1.5 px-2 border-r max-w-xs truncate">
                            {displayValue(item.item)}
                          </td>
                          <td className="py-1.5 px-2 border-r max-w-xs truncate">
                            {displayValue(item.customer)}
                          </td>
                          <td className="py-1.5 px-2 text-right border-r">
                            {typeof item.qty_pcs === 'number'
                              ? item.qty_pcs.toLocaleString()
                              : displayValue(item.qty_pcs)}
                          </td>
                          <td className="py-1.5 px-2 text-right border-r">
                            {typeof item.qty_druk === 'number'
                              ? item.qty_druk.toLocaleString()
                              : displayValue(item.qty_druk)}
                          </td>
                          <td className="py-1.5 px-2 text-right border-r">
                            {typeof item.qty_po === 'number'
                              ? item.qty_po.toLocaleString()
                              : displayValue(item.qty_po)}
                          </td>
                          <td className="py-1.5 px-2 text-center">
                            <button
                              onClick={() => toggleRowExpansion(item.id)}
                              className="text-blue-500 hover:text-blue-700 focus:outline-none"
                            >
                              {expandedRows.includes(item.id) ? (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
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
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              )}
                            </button>
                          </td>
                        </tr>
                        {expandedRows.includes(item.id) && (
                          <tr key={`details-${item.id}`} className="bg-blue-50">
                            <td colSpan={8} className="py-0 px-0">
                              <div className="text-xs border-t border-blue-100">
                                <table className="min-w-full">
                                  <tbody>
                                    <tr>
                                      <td className="py-1 px-2 bg-blue-100 font-medium text-blue-800 w-1/6">
                                        No. Booking
                                      </td>
                                      <td className="py-1 px-2 w-1/3">
                                        {displayValue(item.no_booking)}
                                      </td>
                                      <td className="py-1 px-2 bg-blue-100 font-medium text-blue-800 w-1/6">
                                        Tgl Cetak
                                      </td>
                                      <td className="py-1 px-2 w-1/3">
                                        {displayValue(item.tgl_cetak)}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td className="py-1 px-2 bg-blue-100 font-medium text-blue-800">
                                        No. IO
                                      </td>
                                      <td className="py-1 px-2">
                                        {displayValue(item.no_io)}
                                      </td>
                                      <td className="py-1 px-2 bg-blue-100 font-medium text-blue-800">
                                        Tgl SO
                                      </td>
                                      <td className="py-1 px-2">
                                        {displayValue(item.tgl_so)}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td className="py-1 px-2 bg-blue-100 font-medium text-blue-800">
                                        No. PO
                                      </td>
                                      <td className="py-1 px-2">
                                        {displayValue(item.no_po)}
                                      </td>
                                      <td className="py-1 px-2 bg-blue-100 font-medium text-blue-800">
                                        Tgl Kirim Update
                                      </td>
                                      <td className="py-1 px-2">
                                        {displayValue(item.tgl_kirim_update)}
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                </tbody>
              </table>
            </div>
          ))}

          {filteredJadwalKirim.length === 0 && (
            <div className="bg-gray-50 p-4 text-center rounded-lg border border-gray-200">
              <p className="text-gray-500 text-sm">
                {filterValue
                  ? 'No shipping schedules found for your filter criteria'
                  : 'No shipping schedules found'}
              </p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

export default JadwalKirim;
