import React, { useEffect, useState } from 'react';
import axios from 'axios';
import dateOnly from '../../../../utils/convertDateOnly';
import ModalKosongan from '../../../Modals/Qc/NCR/NCRResponQC';
import Loading from '../../../Loading';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import * as XLSX from 'xlsx';

function HistoryPlusKaryawanKeHR() {
  const [isLoading, setIsLoading] = useState(false);
  const [izin, setIzin] = useState<any>();
  const [page, setPage] = useState(1);

  // Filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    getMe();
  }, [page]);
  const [idPengaju, setIdPengaju] = useState<any>();

  async function getMe() {
    const url = `${import.meta.env.VITE_API_LINK}/me`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      setIdPengaju(res?.data.karyawan.biodata_karyawan[0]?.id_department);

      getIzin(res?.data.karyawan.biodata_karyawan[0]?.id_department);
      console.log('getme', res.data);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  async function getIzin(idDept: any) {
    const url = `${import.meta.env.VITE_API_LINK}/hr/pengajuanKaryawan`;
    try {
      setIsLoading(true);

      // Build params object
      const params: any = {
        status_tiket: 'history',
        page: page,
        limit: 10,
        id_department: idDept,
      };

      // Add filters if they exist
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const res = await axios.get(url, {
        params,
        withCredentials: true,
      });
      setIsLoading(false);
      setIzin(res.data);
      console.log(res.data);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }
  const handleApplyFilters = () => {
    setPage(1); // Reset to first page when filters are applied
    getIzin(idPengaju);
  };

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');

    setPage(1);
    // Trigger API call with reset filters
    setTimeout(() => getIzin(idPengaju), 100);
  };

  const exportToExcel = () => {
    if (!izin?.data || izin.data.length === 0) {
      alert('No data to export');
      return;
    }

    // Prepare data for Excel
    const excelData = izin.data.map((item: any, index: number) => ({
      No: index + 1,
      'Tanggal Diajukan': dateOnly(item.diajukan_tanggal),
      Pemohon: item.karyawan_pengaju?.name || '',
      'Department Pemohon':
        item.karyawan_pengaju?.biodata_karyawan[0]?.department
          ?.nama_department || '',
      'Department yang Diajukan': item.department?.nama_department || '',
      'Jabatan yang Diajukan': item.jabatan?.nama_jabatan || '',
      'Jenis Kelamin': item.jenis_kelamin || '',
      'Jumlah Dibutuhkan': item.jumlah_dibutuhkan || '',
      Pendidikan: item.pendidikan || '',
      Usia: item.usia || '',
      Pengalaman: item.pengalaman || '',
      'Syarat Khusus': item.syarat_khusus || '',
      Status: item.status?.toUpperCase() || '',
      'Catatan HR': item.catatan_hr || '',
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Auto-size columns
    const colWidths =
      excelData.length > 0
        ? Object.keys(excelData[0]).map((key) => ({
            wch: Math.max(
              key.length,
              ...excelData.map((row: any) => String(row[key] || '').length),
            ),
          }))
        : [];
    ws['!cols'] = colWidths;
    XLSX.utils.book_append_sheet(wb, ws, 'Data Pengajuan Karyawan');
    const currentDate = new Date().toISOString().split('T')[0];
    let filename = 'Data_Pengajuan_Karyawan';

    if (startDate && endDate) {
      filename += `_${startDate}_to_${endDate}`;
    } else if (startDate) {
      filename += `_from_${startDate}`;
    } else if (endDate) {
      filename += `_until_${endDate}`;
    }

    filename += `_exported_${currentDate}.xlsx`;

    XLSX.writeFile(wb, filename);
  };

  const [showModal, setShowModal] = useState<boolean[]>([]);
  const openModalModal = (i: any) => {
    const onchangeVal: any = [...showModal];
    onchangeVal[i] = true;
    setShowModal(onchangeVal);
  };

  const closeModalModal = (i: any) => {
    const onchangeVal: any = [...showModal];
    onchangeVal[i] = false;
    setShowModal(onchangeVal);
  };

  return (
    <>
      <main className="overflow-x-scroll">
        {isLoading && <Loading />}
        <div className="min-w-[700px] bg-white rounded-xl">
          {/* Filter Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl border-b border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                  Filter Data
                </h3>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Start Date */}
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-700 mb-2">
                      Tanggal Mulai
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* End Date */}
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-700 mb-2">
                      Tanggal Akhir
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Export Button */}
                  <div className="flex flex-col justify-end">
                    <button
                      onClick={exportToExcel}
                      className="flex items-center justify-center px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Export Excel
                    </button>
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleApplyFilters}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    Terapkan Filter
                  </button>
                  <button
                    onClick={handleResetFilters}
                    className="flex items-center px-4 py-2 bg-red-500 text-white font-medium rounded-md hover:bg-red-600 transition-colors"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Reset Filter
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="w-full h-full flex-col border-b-8 border-[#D8EAFF]">
            <div className="grid grid-cols-12 px-10 py-4 border-b-8 border-[#D8EAFF] gap-2 bg-gray-50">
              <label className="text-neutral-500 text-sm font-semibold col-span-2">
                No. Tanggal Diajukan
              </label>
              <label className="text-neutral-500 text-sm font-semibold col-span-2">
                Sumber
              </label>
              <label className="text-neutral-500 text-sm font-semibold col-span-3">
                Jabatan / Department Yang Diajukan
              </label>
              <label className="text-neutral-500 text-sm font-semibold col-span-2">
                Jenis Kelamin
              </label>
              <label className="text-neutral-500 text-sm font-semibold">
                Jumlah
              </label>
              <label className="text-neutral-500 text-sm font-semibold">
                Status
              </label>
              <label className="text-neutral-500 text-sm font-semibold">
                Aksi
              </label>
            </div>
            <div className="w-2 h-full"></div>
            {izin?.data?.map((data: any, i: any) => {
              return (
                <div
                  key={data.id || i}
                  className="grid grid-cols-12 border-b-8 border-[#D8EAFF] gap-2 items-center px-10"
                >
                  <div className="flex flex-col gap-1 col-span-2">
                    <label className="text-neutral-500 text-sm font-semibold">
                      {(page - 1) * 10 + i + 1}.{' '}
                      {dateOnly(data.diajukan_tanggal)}
                    </label>
                  </div>

                  <label className="text-neutral-500 text-sm font-semibold col-span-2">
                    {
                      data.karyawan_pengaju?.biodata_karyawan[0]?.department
                        ?.nama_department
                    }
                  </label>

                  <div className="flex flex-col gap-1 col-span-3">
                    <label className="text-neutral-500 text-sm font-semibold">
                      Department : {data.department?.nama_department || '-'}
                    </label>
                    <label className="text-neutral-500 text-sm font-semibold">
                      Jabatan : {data.jabatan?.nama_jabatan || '-'}
                    </label>
                  </div>
                  <label className="text-neutral-500 text-sm font-semibold col-span-2">
                    {data.jenis_kelamin || '-'}
                  </label>
                  <label className="text-neutral-500 text-sm font-semibold">
                    {data.jumlah_dibutuhkan || '-'}
                  </label>
                  <label className="text-neutral-500 text-sm font-semibold uppercase">
                    {data.status || '-'}
                  </label>
                  <div className="justify-end flex pr-2">
                    <button
                      onClick={() => openModalModal(i)}
                      className="uppercase px-3 inline-flex rounded-[3px] items-center text-white text-xs font-bold py-2 my-2 hover:bg-blue-400 border bg-blue-600 border-blue-600 justify-center"
                    >
                      DETAIL
                    </button>
                    {showModal[i] == true && (
                      <ModalKosongan
                        isOpen={showModal[i]}
                        onClose={() => closeModalModal(i)}
                        judul={'Permohonan Penambahan Karyawan'}
                      >
                        <div className="space-y-4 mb-6">
                          <div className="flex">
                            <label className="w-1/4 font-semibold">
                              Pemohon
                            </label>
                            <span className="w-8 text-center">:</span>
                            <input
                              type="text"
                              value={data.karyawan_pengaju?.name}
                              readOnly
                              className="flex-1 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                            />
                          </div>

                          <div className="flex">
                            <label className="w-1/4 font-semibold">
                              Department
                            </label>
                            <span className="w-8 text-center">:</span>
                            <input
                              type="text"
                              value={data.department?.nama_department}
                              readOnly
                              className="flex-1 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                            />
                          </div>

                          <div className="flex">
                            <label className="w-1/4 font-semibold">
                              Jabatan
                            </label>
                            <span className="w-8 text-center">:</span>
                            <input
                              type="text"
                              value={data.jabatan?.nama_jabatan}
                              readOnly
                              className="flex-1 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>

                        <div className="mb-6">
                          <h3 className="font-bold mb-3">PERSYARATAN:</h3>
                          <div className="space-y-3 pl-6">
                            <div className="flex">
                              <label className="w-1/4 font-semibold">
                                1. Jenis kelamin
                              </label>
                              <span className="w-8 text-center">:</span>
                              <input
                                readOnly
                                type="text"
                                className="flex-1 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                                value={data.jenis_kelamin}
                              />
                            </div>

                            <div className="flex">
                              <label className="w-1/4 font-semibold">
                                2. Jumlah
                              </label>
                              <span className="w-8 text-center">:</span>
                              <input
                                readOnly
                                type="number"
                                className="flex-1 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                                value={data.jumlah_dibutuhkan}
                              />
                            </div>

                            <div className="flex">
                              <label className="w-1/4 font-semibold">
                                3. Pendidikan
                              </label>
                              <span className="w-8 text-center">:</span>
                              <input
                                type="text"
                                readOnly
                                className="flex-1 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                                value={data.pendidikan}
                              />
                            </div>

                            <div className="flex">
                              <label className="w-1/4 font-semibold">
                                4. Usia
                              </label>
                              <span className="w-8 text-center">:</span>
                              <input
                                type="text"
                                readOnly
                                className="flex-1 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                                value={data.usia}
                              />
                            </div>

                            <div className="flex">
                              <label className="w-1/4 font-semibold">
                                5. Pengalaman
                              </label>
                              <span className="w-8 text-center">:</span>
                              <input
                                type="text"
                                readOnly
                                className="flex-1 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                                value={data.pengalaman}
                              />
                            </div>

                            <div className="flex">
                              <label className="w-1/4 font-semibold">
                                6. Syarat khusus
                              </label>
                              <span className="w-8 text-center">:</span>
                              <div className="flex-1 space-y-2">
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    readOnly
                                    className="flex-1 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                                    value={data.syarat_khusus}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col w-full px-4">
                          <label
                            htmlFor=""
                            className="text-black text-xs font-bold"
                          >
                            RESPON HR
                            <span className="text-red-600">*</span>
                          </label>
                          <textarea
                            readOnly
                            value={data.catatan_hr}
                            className="peer h-full min-h-[100px] w-full resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                          ></textarea>
                        </div>
                      </ModalKosongan>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center gap-2 mt-4">
          <Stack spacing={2}>
            <Pagination
              count={izin?.total_page}
              color="primary"
              page={page}
              onChange={(e, i) => {
                setPage(i);
                console.log(i);
              }}
            />
          </Stack>
        </div>
      </main>
    </>
  );
}

export default HistoryPlusKaryawanKeHR;
