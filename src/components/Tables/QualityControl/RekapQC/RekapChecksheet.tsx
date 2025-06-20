import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Loading from '../../../Loading';
import { isEmpty } from 'lodash';
import ProcessTable from './ProcessTable';

// Define types for clarity
interface ProcessData {
  [key: string]: any;
}

interface RekapChecksheetData {
  [key: string]: any;
}

function RekapChecksheet() {
  const [rekapChecksheet, setRekapChecksheet] =
    useState<RekapChecksheetData | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [joNumber, setJoNumber] = useState<string>(''); // Added state for JO number
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {}, []);

  async function getRekapChecksheet() {
    setLoading(true);
    const url = `${import.meta.env.VITE_API_LINK}/qc/report/checkSheet`;

    try {
      // Add query parameters for start_date, end_date, and no_jo if they exist
      const params: {
        start_date?: string;
        end_date?: string;
        no_jo?: string; // Added no_jo parameter
      } = {};

      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (joNumber) params.no_jo = joNumber; // Add JO number to params if exists

      const res = await axios.get(url, {
        withCredentials: true,
        params: params,
      });

      setRekapChecksheet(res.data.data);
      console.log('API Response:', res.data.data);
    } catch (error) {
      console.log('API Error:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    getRekapChecksheet();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="bg-white w-full p-5">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Rekap Checksheet</h2>

        <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between md:items-end mb-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col">
              <label htmlFor="startDate" className="mb-1 text-sm font-medium">
                Tanggal Mulai
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="endDate" className="mb-1 text-sm font-medium">
                Tanggal Akhir
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2"
              />
            </div>

            {/* Added JO Number input */}
            <div className="flex flex-col">
              <label htmlFor="joNumber" className="mb-1 text-sm font-medium">
                Nomor JO
              </label>
              <input
                type="text"
                id="joNumber"
                value={joNumber}
                onChange={(e) => setJoNumber(e.target.value)}
                placeholder="Enter JO Number"
                className="border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <button
              onClick={handleSubmit}
              className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Tampilkan'}
            </button>
          </div>

          <div className="flex flex-col">
            <label htmlFor="searchTerm" className="mb-1 text-sm font-medium">
              Filter (JO/IO/Item)
            </label>
            <div className="relative">
              <input
                type="text"
                id="searchTerm"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search by JO, IO, or Item..."
                className="border border-gray-300 rounded pl-9 pr-3 py-2 w-full md:w-64"
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-search"
                  viewBox="0 0 16 16"
                >
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center my-8">
          <Loading />
        </div>
      ) : (
        <div>
          {rekapChecksheet ? (
            // Use the ProcessTable component with filter term
            <ProcessTable
              data={
                Array.isArray(rekapChecksheet)
                  ? rekapChecksheet
                  : [rekapChecksheet]
              }
              loading={false}
              filterTerm={searchTerm}
            />
          ) : (
            <div className="p-4 bg-gray-50 rounded text-center">
              Tidak ada data yang tersedia
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default RekapChecksheet;
