import React, { useEffect, useState } from 'react';
import DefaultLayout from '../../../layout/DefaultLayout';
import { Link } from 'react-router-dom';
import axios from 'axios';
import formatInteger from '../../../utils/formaterInteger';

function MonitoringSparepart() {
  interface Sparepart {
    nama_sparepart: string;
    kode: string;
    mesin: {
      nama_mesin: string;
    };
    posisi_part: string;
    tgl_pasang: string;
    tgl_rusak: string | null;
    umur_a: number;
    grade_2: string;
    actual_umur: number;
    sisa_umur: number;
    keterangan: string;
  }

  const [masterSparepart, setMasterSparepart] = useState<Sparepart[] | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: string;
  }>({
    key: 'kode',
    direction: 'asc',
  });

  useEffect(() => {
    getMasterSparepart();
  }, []);

  async function getMasterSparepart() {
    const url = `${import.meta.env.VITE_API_LINK}/master/sparepart`;
    try {
      const res = await axios.get(url, {
        params: {
          jenis_part: 'ganti',
        },
        withCredentials: true,
      });

      setMasterSparepart(res.data);
    } catch (error) {
      console.error('Error fetching sparepart data:', error);
    }
  }

  function convertDatetimeToDate(datetime: any) {
    if (!datetime || datetime === '-') return '-';

    const dateObject = new Date(datetime);
    if (isNaN(dateObject.getTime())) return '-';

    const day = dateObject.getDate().toString().padStart(2, '0');
    const month = (dateObject.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObject.getFullYear();

    return `${year}/${month}/${day}`;
  }

  // Function to parse the part number for natural sorting
  const parsePartNumber = (kode: string) => {
    // Extract the numeric part from the code (e.g., "SPRT-0001" -> "0001")
    const match = kode.match(/SPRT-(\d+)/i);
    if (!match) return kode;

    // Convert to a number for proper sorting
    return parseInt(match[1], 10);
  };

  // Sort function
  const sortedData = (data: Sparepart[] | undefined | null) => {
    if (!data) return [];

    const sorted = [...data].sort((a, b) => {
      if (sortConfig.key === 'kode') {
        const aValue = parsePartNumber(a.kode);
        const bValue = parsePartNumber(b.kode);

        if (sortConfig.direction === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      }

      return 0;
    });

    return sorted;
  };

  // Filter function
  const filteredData = sortedData(
    masterSparepart?.filter(
      (item) =>
        item.nama_sparepart.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.kode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.mesin.nama_mesin.toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  );

  return (
    <DefaultLayout>
      <>
        <h1 className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          Maintenance &gt; Sparepart &gt; Lifespan
        </h1>

        <div className="w-full py-4 rounded-md bg-white p-5 flex gap-5 shadow-sm">
          <div className="flex justify-between w-full items-center">
            <div className="relative w-4/12">
              <input
                type="text"
                placeholder="Cari Barang, Kode, atau Mesin"
                className="w-full bg-[#D8EAFF] rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg
                className="h-5 w-5 absolute right-3 top-2.5 text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <div className="flex gap-5">
              <Link
                to={'addStockLifetime'}
                className="px-4 py-2 bg-green-600 text-white font-semibold text-sm rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <svg
                  className="h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                ADD ITEM
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-md shadow-sm">
          <table className="min-w-full bg-white border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="py-3 px-2 text-xs font-semibold text-center w-12">
                  No
                </th>
                <th
                  className="py-3 px-2 text-xs font-semibold text-left cursor-pointer hover:bg-gray-200"
                  onClick={() =>
                    setSortConfig({
                      key: 'kode',
                      direction:
                        sortConfig.direction === 'asc' ? 'desc' : 'asc',
                    })
                  }
                >
                  <div className="flex items-center">
                    Kode
                    {sortConfig.key === 'kode' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="py-3 px-2 text-xs font-semibold text-left">
                  Nama Barang
                </th>
                <th className="py-3 px-2 text-xs font-semibold text-left">
                  Mesin
                </th>
                <th className="py-3 px-2 text-xs font-semibold text-left">
                  Posisi
                </th>
                <th className="py-3 px-2 text-xs font-semibold text-left">
                  Tgl Pasang
                </th>
                <th className="py-3 px-2 text-xs font-semibold text-left">
                  Tgl Rusak
                </th>
                <th className="py-3 px-2 text-xs font-semibold text-right">
                  Umur Ori
                </th>
                <th className="py-3 px-2 text-xs font-semibold text-center">
                  Grade
                </th>
                <th className="py-3 px-2 text-xs font-semibold text-right">
                  Umur Aktual
                </th>
                <th className="py-3 px-2 text-xs font-semibold text-right">
                  Sisa Umur
                </th>
                <th className="py-3 px-2 text-xs font-semibold text-left">
                  Ket.
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((data, index) => {
                // Calculate if the row should be red (sisa_umur <= 10% of actual_umur)
                const sisaUmur = parseInt(data.sisa_umur.toString()) || 0;
                const actualUmur = parseInt(data.actual_umur.toString()) || 1; // Prevent division by zero
                const isLowLifespan = sisaUmur <= actualUmur * 0.1;

                return (
                  <tr
                    key={index}
                    className={`border-t hover:bg-gray-50 ${
                      isLowLifespan
                        ? 'bg-red-100'
                        : index % 2 === 0
                        ? 'bg-white'
                        : 'bg-gray-50'
                    }`}
                  >
                    <td className="py-2 px-2 text-xs text-center">
                      {index + 1}
                    </td>
                    <td className="py-2 px-2 text-xs font-medium">
                      {data.kode}
                    </td>
                    <td className="py-2 px-2 text-xs">{data.nama_sparepart}</td>
                    <td className="py-2 px-2 text-xs">
                      {data.mesin.nama_mesin}
                    </td>
                    <td className="py-2 px-2 text-xs">{data.posisi_part}</td>
                    <td className="py-2 px-2 text-xs">
                      {convertDatetimeToDate(data.tgl_pasang)}
                    </td>
                    <td className="py-2 px-2 text-xs">
                      {convertDatetimeToDate(data.tgl_rusak)}
                    </td>
                    <td className="py-2 px-2 text-xs text-right">
                      {formatInteger(data.umur_a)}
                    </td>
                    <td className="py-2 px-2 text-xs text-center">
                      {data.grade_2}
                    </td>
                    <td className="py-2 px-2 text-xs text-right">
                      {formatInteger(data.actual_umur)}
                    </td>
                    <td
                      className={`py-2 px-2 text-xs text-right ${
                        isLowLifespan ? 'font-bold text-red-700' : ''
                      }`}
                    >
                      {formatInteger(data.sisa_umur)}
                    </td>
                    <td className="py-2 px-2 text-xs">{data.keterangan}</td>
                  </tr>
                );
              })}

              {(!filteredData || filteredData.length === 0) && (
                <tr>
                  <td colSpan={12} className="py-4 text-center text-gray-500">
                    {masterSparepart === null
                      ? 'Loading data...'
                      : 'No sparepart data found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </>
    </DefaultLayout>
  );
}

export default MonitoringSparepart;
