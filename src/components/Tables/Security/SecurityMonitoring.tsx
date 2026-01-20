import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Select from 'react-select';
import Loading from '../../Loading';
import convertTimeStampToDateTime from '../../../utils/converDateTime';

function SecurityMonitoring() {
  const [isLoading, setIsLoading] = useState(false);

  // Absensi states
  const [absen, setAbsen] = useState<any>();
  const [department, setDepartment] = useState<any>();
  const [idDepartment, setIdDepartment] = useState<any>();

  // Lembur states
  const [lembur, setLembur] = useState<any>();
  const [page, setPage] = useState(1);
  const [userList, setUserList] = useState<any>();
  const [idKaryawan, setIdKaryawan] = useState<any>([]);
  const [options, setOptions] = useState([]);

  // Shared filter states
  const [dateFrom, setDateFrom] = useState<any>(null);
  const [dateTo, setDateTo] = useState<any>(null);
  const [selectedEmployees, setSelectedEmployees] = useState<any>([]);

  // Additional filters for absensi
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTipeKaryawan, setSelectedTipeKaryawan] = useState('');
  const [selectedTipePenggajian, setSelectedTipePenggajian] = useState('');
  const [selectedDivisi, setSelectedDivisi] = useState('');

  useEffect(() => {
    getDepartment();
    getMasterUser();
    // Load today's data by default
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    setDateFrom(formattedDate);
    setDateTo(formattedDate);
    getAbsen(formattedDate, formattedDate);
    getLembur(formattedDate, formattedDate, []);
  }, []);

  useEffect(() => {
    if (dateFrom && dateTo) {
      getLembur(dateFrom, dateTo, idKaryawan);
    }
  }, [page]);

  // Fetch Absensi Data
  async function getAbsen(dateFrom1: any, dateTo1: any) {
    const url = `${import.meta.env.VITE_API_LINK}/hr/absensi`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        params: {
          startDate: dateFrom1,
          endDate: dateTo1,
          idDepartment: idDepartment,
        },
        withCredentials: true,
      });
      console.log('absen', res.data.data);
      setIsLoading(false);
      setAbsen(res.data.data);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }

  // Fetch Lembur Data
  async function getLembur(startDate: any, endDate: any, employeeIds: any[]) {
    const url = `${import.meta.env.VITE_API_LINK}/hr/pengajuanLembur`;
    try {
      setIsLoading(true);
      const params: any = {
        status_tiket: 'history',
        status: 'approved',
        page: page,
        limit: 10,
      };

      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (employeeIds.length > 0) params.id_karyawan = employeeIds.join(',');

      const res = await axios.get(url, {
        params,
        withCredentials: true,
      });
      console.log('lembur', res.data);
      setIsLoading(false);
      setLembur(res.data);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }

  // Fetch Department Data
  async function getDepartment() {
    const url = `${import.meta.env.VITE_API_LINK}/master/hr/department`;
    try {
      const res = await axios.get(url, {
        params: {
          is_active: true,
        },
        withCredentials: true,
      });
      setDepartment(res.data);
    } catch (error: any) {
      console.log(error);
    }
  }

  // Fetch Master User Data
  async function getMasterUser() {
    const url = `${import.meta.env.VITE_API_LINK}/hr/karyawan`;
    try {
      const res = await axios.get(url, {
        params: {
          is_active: true,
        },
        withCredentials: true,
      });

      setUserList(res.data.data);
      setOptions(
        res.data.data.map((item: any) => {
          const latestBagianMesin =
            item.biodata_karyawan[0]?.bagian_mesin_karyawan?.slice(-1)[0]
              ?.nama_bagian_mesin || '';

          return {
            value: item.userid,
            label: `${item.biodata_karyawan[0]?.nik} - ${item.name} - ${item.biodata_karyawan[0]?.jabatan?.nama_jabatan} - ${latestBagianMesin}`,
          };
        }),
      );
    } catch (error: any) {
      console.log(error);
    }
  }

  // Handle employee selection change
  const handleChangePointKaryawan = (selectedOptions: any) => {
    const selectedIds = selectedOptions.map((option: any) => option.value);
    const filteredData = userList.filter((item: any) =>
      selectedIds.includes(item.userid),
    );
    setIdKaryawan(filteredData.map((user: any) => user.userid));
    setSelectedEmployees(selectedOptions);
  };

  // Apply filters to both screens
  const handleApplyFilters = () => {
    if (dateFrom && dateTo) {
      setPage(1);
      getAbsen(dateFrom, dateTo);
      getLembur(dateFrom, dateTo, idKaryawan);
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    setDateFrom(formattedDate);
    setDateTo(formattedDate);
    setIdKaryawan([]);
    setSelectedEmployees([]);
    setIdDepartment(null);
    setSearchQuery('');
    setSelectedTipeKaryawan('');
    setSelectedTipePenggajian('');
    setSelectedDivisi('');
    setPage(1);

    setTimeout(() => {
      getAbsen(formattedDate, formattedDate);
      getLembur(formattedDate, formattedDate, []);
    }, 100);
  };

  // Filter absensi data
  const filteredAbsen = absen?.filter((data: any) => {
    return (
      data.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedTipeKaryawan === '' ||
        data.tipe_karyawan === selectedTipeKaryawan) &&
      (selectedTipePenggajian === '' ||
        data.tipe_penggajian === selectedTipePenggajian) &&
      (selectedDivisi === '' || data.nama_divisi === selectedDivisi)
    );
  });

  // Get unique divisi values
  const uniqueDivisi = Array.from(
    new Set(absen?.map((data: any) => data.nama_divisi).filter(Boolean)),
  );

  return (
    <>
      <main className="">
        {isLoading && <Loading />}

        {/* Combined Filter Section */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden mb-4">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 sm:p-4">
            <h2 className="text-white text-base sm:text-lg md:text-xl font-bold flex items-center">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 mr-2 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <span className="">Security Monitoring - Absensi & Lembur</span>
            </h2>
          </div>

          <div className="p-3 sm:p-4 md:p-6">
            {/* Date Range Filter */}
            <div className="mb-4 sm:mb-6">
              <h3 className="text-sm sm:text-base font-semibold text-blue-600 mb-3 sm:mb-4">
                Filter Tanggal (Berlaku untuk Kedua Panel)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs sm:text-sm text-gray-600 font-medium">
                    Dari:
                  </label>
                  <input
                    className="w-full rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 sm:py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                    type="date"
                    value={dateFrom || ''}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs sm:text-sm text-gray-600 font-medium">
                    Sampai:
                  </label>
                  <input
                    className="w-full rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 sm:py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                    type="date"
                    value={dateTo || ''}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs sm:text-sm text-gray-600 font-medium">
                    Department:
                  </label>
                  <select
                    name="nama_department"
                    onChange={(e) => setIdDepartment(e.target.value)}
                    className="w-full rounded-lg bg-blue-50 border border-blue-200 py-2 sm:py-2.5 px-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all cursor-pointer"
                  >
                    <option value="">Semua Department</option>
                    {department?.data?.map((data: any, i: any) => (
                      <option key={i} value={data.id}>
                        {data.nama_department}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2 justify-end">
                  <button
                    onClick={handleApplyFilters}
                    disabled={!dateFrom || !dateTo}
                    className={`w-full rounded-lg px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white transition-all ${
                      !dateFrom || !dateTo
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md active:bg-blue-800'
                    }`}
                  >
                    Terapkan Filter
                  </button>
                </div>
              </div>
            </div>

            {/* Employee Selection */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-xs sm:text-sm text-gray-600 font-medium mb-2">
                Cari Karyawan (Berlaku untuk Lembur)
              </label>
              <Select
                isMulti
                placeholder="Pilih karyawan..."
                options={options}
                value={selectedEmployees}
                onChange={handleChangePointKaryawan}
                className="relative z-50"
                classNamePrefix="select"
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: '38px',
                    borderColor: '#bfdbfe',
                    backgroundColor: '#eff6ff',
                    fontSize: window.innerWidth < 640 ? '12px' : '14px',
                    '&:hover': {
                      borderColor: '#3b82f6',
                    },
                  }),
                  multiValue: (base) => ({
                    ...base,
                    backgroundColor: '#dbeafe',
                    fontSize: window.innerWidth < 640 ? '11px' : '13px',
                  }),
                  menu: (base) => ({
                    ...base,
                    fontSize: window.innerWidth < 640 ? '12px' : '14px',
                  }),
                }}
              />
            </div>

            {/* Additional Absensi Filters */}
            <div className="mb-4 sm:mb-6">
              <h3 className="text-sm sm:text-base font-semibold text-blue-600 mb-3 sm:mb-4">
                Filter Tambahan (Hanya untuk Absensi)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm text-gray-600 font-medium mb-2">
                    Nama Karyawan
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama..."
                    className="w-full rounded-lg bg-blue-50 border border-blue-200 py-2 sm:py-2.5 px-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm text-gray-600 font-medium mb-2">
                    Divisi
                  </label>
                  <select
                    className="w-full rounded-lg bg-blue-50 border border-blue-200 py-2 sm:py-2.5 px-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={selectedDivisi}
                    onChange={(e) => setSelectedDivisi(e.target.value)}
                  >
                    <option value="">Semua Divisi</option>
                    {uniqueDivisi.map((divisi: any, index: number) => (
                      <option key={index} value={divisi}>
                        {divisi}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-end">
              <button
                className="w-full sm:w-auto bg-red-500 hover:bg-red-600 hover:shadow-md active:bg-red-700 transition-all rounded-lg px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white"
                onClick={handleResetFilters}
              >
                Reset Semua Filter
              </button>
            </div>
          </div>
        </div>

        {/* Split Screen - Absensi & Lembur */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Panel - Absensi (Read-only) */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-teal-600 p-2.5 sm:p-3">
              <h3 className="text-white text-sm sm:text-base md:text-lg font-bold flex items-center">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
                Data Absensi
              </h3>
            </div>

            <div className="overflow-x-auto max-h-[400px] sm:max-h-[500px] md:max-h-[600px] overflow-y-auto">
              <table className="w-full text-xs sm:text-sm min-w-[600px]">
                <thead className="bg-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="p-1.5 sm:p-2 text-left text-[10px] sm:text-xs font-semibold text-gray-600">
                      No
                    </th>
                    <th className="p-1.5 sm:p-2 text-left text-[10px] sm:text-xs font-semibold text-gray-600">
                      Nama
                    </th>
                    <th className="p-1.5 sm:p-2 text-left text-[10px] sm:text-xs font-semibold text-gray-600">
                      Dept
                    </th>
                    <th className="p-1.5 sm:p-2 text-left text-[10px] sm:text-xs font-semibold text-gray-600">
                      Tanggal
                    </th>
                    <th className="p-1.5 sm:p-2 text-left text-[10px] sm:text-xs font-semibold text-gray-600">
                      Waktu
                    </th>
                    <th className="p-1.5 sm:p-2 text-left text-[10px] sm:text-xs font-semibold text-gray-600">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAbsen?.map((data: any, i: any) => {
                    const getRowBackground = () => {
                      switch (data.status_absen) {
                        case 'cuti khusus':
                          return 'bg-orange-50';
                        case 'sakit':
                          return 'bg-green-50';
                        case 'izin':
                          return 'bg-blue-50';
                        case 'Belum Masuk':
                          return 'bg-red-50';
                        case 'cuti tahunan':
                          return 'bg-yellow-50';
                        default:
                          return '';
                      }
                    };

                    return (
                      <tr key={i} className={`border-b ${getRowBackground()}`}>
                        <td className="p-1.5 sm:p-2 text-[10px] sm:text-xs">
                          {i + 1}
                        </td>
                        <td className="p-1.5 sm:p-2 text-[10px] sm:text-xs font-medium">
                          {data.name}
                        </td>
                        <td className="p-1.5 sm:p-2 text-[10px] sm:text-xs">
                          <div className="flex flex-col">
                            <span className=" max-w-[120px]">
                              {data.nama_department}
                            </span>
                            <span className="text-gray-500  max-w-[120px]">
                              {data.nama_divisi}
                            </span>
                          </div>
                        </td>
                        <td className="p-1.5 sm:p-2 text-[10px] sm:text-xs">
                          <div className="flex flex-col">
                            <span>{data.hari}</span>
                            <span>{data.tgl_masuk}</span>
                            {data.jenis_hari_masuk !== 'Biasa' &&
                              data.jenis_hari_masuk != null && (
                                <span className="text-blue-600 font-medium">
                                  L
                                </span>
                              )}
                          </div>
                        </td>
                        <td className="p-1.5 sm:p-2 text-[10px] sm:text-xs">
                          <div className="flex flex-col gap-0.5">
                            <span>In: {data.jam_masuk || '~'}</span>
                            <span>Out: {data.jam_keluar || '~'}</span>
                          </div>
                        </td>
                        <td className="p-1.5 sm:p-2 text-[10px] sm:text-xs">
                          <span className="font-medium">
                            {data.status_absen}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {(!filteredAbsen || filteredAbsen.length === 0) && (
                <div className="p-6 sm:p-8 text-center text-gray-500">
                  <p className="text-xs sm:text-sm">Tidak ada data absensi</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Lembur */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-2.5 sm:p-3">
              <h3 className="text-white text-sm sm:text-base md:text-lg font-bold flex items-center">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Data Lembur
              </h3>
            </div>

            <div className="overflow-x-auto max-h-[400px] sm:max-h-[500px] md:max-h-[600px] overflow-y-auto">
              <table className="w-full text-xs sm:text-sm min-w-[500px]">
                <thead className="bg-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="p-1.5 sm:p-2 text-left text-[10px] sm:text-xs font-semibold text-gray-600">
                      No
                    </th>
                    <th className="p-1.5 sm:p-2 text-left text-[10px] sm:text-xs font-semibold text-gray-600">
                      Personnel
                    </th>
                    <th className="p-1.5 sm:p-2 text-left text-[10px] sm:text-xs font-semibold text-gray-600">
                      Tanggal
                    </th>
                    <th className="p-1.5 sm:p-2 text-left text-[10px] sm:text-xs font-semibold text-gray-600">
                      Lama
                    </th>
                    <th className="p-1.5 sm:p-2 text-left text-[10px] sm:text-xs font-semibold text-gray-600">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lembur?.data?.map((data: any, i: any) => (
                    <tr
                      key={data.id || i}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="p-1.5 sm:p-2 text-[10px] sm:text-xs">
                        {(page - 1) * 10 + i + 1}
                      </td>
                      <td className="p-1.5 sm:p-2 text-[10px] sm:text-xs font-medium">
                        <span className=" max-w-[100px] inline-block">
                          {data.karyawan?.name}
                        </span>
                      </td>
                      <td className="p-1.5 sm:p-2 text-[10px] sm:text-xs">
                        <div className="flex flex-col gap-0.5">
                          <span className="whitespace-nowrap">
                            {convertTimeStampToDateTime(data.dari)}
                          </span>
                          <span className="whitespace-nowrap">
                            {convertTimeStampToDateTime(data.sampai)}
                          </span>
                        </div>
                      </td>
                      <td className="p-1.5 sm:p-2 text-[10px] sm:text-xs font-medium text-blue-600 whitespace-nowrap">
                        {data.lama_lembur} Jam
                      </td>
                      <td className="p-1.5 sm:p-2 text-[10px] sm:text-xs">
                        <span
                          className={`uppercase font-semibold ${
                            data.status === 'approved'
                              ? 'text-green-600'
                              : data.status === 'rejected'
                              ? 'text-red-600'
                              : 'text-yellow-600'
                          }`}
                        >
                          {data.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!lembur?.data || lembur.data.length === 0) && (
                <div className="p-6 sm:p-8 text-center text-gray-500">
                  <p className="text-xs sm:text-sm">Tidak ada data lembur</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {lembur?.total_page > 1 && (
              <div className="p-3 sm:p-4 border-t flex justify-center">
                <Stack spacing={2}>
                  <Pagination
                    count={lembur?.total_page}
                    color="primary"
                    page={page}
                    onChange={(e, i) => setPage(i)}
                    size={window.innerWidth < 640 ? 'small' : 'medium'}
                    siblingCount={window.innerWidth < 640 ? 0 : 1}
                    boundaryCount={1}
                  />
                </Stack>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
export default SecurityMonitoring;
