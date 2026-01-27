import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Loading from '../../Loading';
import Select from 'react-select';

function SecurityMonitoring() {
  const [isLoading, setIsLoading] = useState(false);

  // Absensi states
  const [absen, setAbsen] = useState<any>();
  const [department, setDepartment] = useState<any>();
  const [idDepartment, setIdDepartment] = useState<any>();

  // Shared filter states
  const [dateFrom, setDateFrom] = useState<any>(null);
  const [dateTo, setDateTo] = useState<any>(null);

  // Additional filters for absensi
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTipeKaryawan, setSelectedTipeKaryawan] = useState('');
  const [selectedTipePenggajian, setSelectedTipePenggajian] = useState('');
  const [selectedDivisi, setSelectedDivisi] = useState('');
  const [selectedBagianMesin, setSelectedBagianMesin] = useState<any>(null);

  useEffect(() => {
    getDepartment();
    // Load today's data by default
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    setDateFrom(formattedDate);
    setDateTo(formattedDate);
    getAbsen(formattedDate, formattedDate);
  }, []);

  // Fetch Absensi Data
  async function getAbsen(
    dateFrom1: any,
    dateTo1: any,
    departmentId: any = idDepartment,
  ) {
    const url = `${import.meta.env.VITE_API_LINK}/hr/absensi`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        params: {
          startDate: dateFrom1,
          endDate: dateTo1,
          idDepartment: departmentId || undefined,
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

  const handleApplyFilters = () => {
    if (dateFrom && dateTo) {
      getAbsen(dateFrom, dateTo, idDepartment);
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
    setIdDepartment('');
    setSearchQuery('');
    setSelectedTipeKaryawan('');
    setSelectedTipePenggajian('');
    setSelectedDivisi('');
    setSelectedBagianMesin(null);

    getAbsen(formattedDate, formattedDate, '');
  };

  // Filter absensi data
  const filteredAbsen = absen?.filter((data: any) => {
    const bagianMesin = data.bagian_mesin?.[0]?.nama_bagian_mesin || '';
    return (
      data.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedTipeKaryawan === '' ||
        data.tipe_karyawan === selectedTipeKaryawan) &&
      (selectedTipePenggajian === '' ||
        data.tipe_penggajian === selectedTipePenggajian) &&
      (selectedDivisi === '' || data.nama_divisi === selectedDivisi) &&
      (!selectedBagianMesin || bagianMesin === selectedBagianMesin.value)
    );
  });

  // Get unique divisi values
  const uniqueDivisi = Array.from(
    new Set(absen?.map((data: any) => data.nama_divisi).filter(Boolean)),
  );

  // Get unique bagian mesin values for filter
  const uniqueBagianMesin = Array.from(
    new Set(
      absen
        ?.map((data: any) => data.bagian_mesin?.[0]?.nama_bagian_mesin)
        .filter(Boolean),
    ),
  );

  // Create options for react-select
  const bagianMesinOptions = uniqueBagianMesin.map((mesin: any) => ({
    value: mesin,
    label: mesin,
  }));

  const divisiOptions = uniqueDivisi.map((divisi: any) => ({
    value: divisi,
    label: divisi,
  }));

  const departmentOptions = department?.data?.map((data: any) => ({
    value: data.id,
    label: data.nama_department,
  }));

  // Group filtered data by bagian mesin
  const groupedByMachine = filteredAbsen?.reduce((acc: any, data: any) => {
    const bagianMesin =
      data.bagian_mesin?.[0]?.nama_bagian_mesin || 'Tidak Ada Mesin';
    if (!acc[bagianMesin]) {
      acc[bagianMesin] = [];
    }
    acc[bagianMesin].push(data);
    return acc;
  }, {});

  // Sort machine groups to put "Tidak Ada Mesin" at the bottom
  const sortedMachineGroups = groupedByMachine
    ? Object.keys(groupedByMachine).sort((a, b) => {
        if (a === 'Tidak Ada Mesin') return 1;
        if (b === 'Tidak Ada Mesin') return -1;
        return a.localeCompare(b);
      })
    : [];

  // Custom styles for react-select
  const customSelectStyles = {
    control: (base: any) => ({
      ...base,
      minHeight: '38px',
      backgroundColor: '#eff6ff',
      borderColor: '#bfdbfe',
      '&:hover': {
        borderColor: '#60a5fa',
      },
    }),
    menu: (base: any) => ({
      ...base,
      zIndex: 9999,
    }),
    menuPortal: (base: any) => ({
      ...base,
      zIndex: 9999,
    }),
  };

  return (
    <>
      <main className="">
        {isLoading && <Loading />}

        {/* Filter Section */}
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
              <span className="">Security Monitoring - Absensi</span>
            </h2>
          </div>

          <div className="p-3 sm:p-4 md:p-6">
            {/* Date Range Filter */}
            <div className="mb-4 sm:mb-6">
              <h3 className="text-sm sm:text-base font-semibold text-blue-600 mb-3 sm:mb-4">
                Filter Tanggal
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
                  <Select
                    options={departmentOptions}
                    value={departmentOptions?.find(
                      (opt: any) => opt.value === idDepartment,
                    )}
                    onChange={(selected: any) =>
                      setIdDepartment(selected?.value || '')
                    }
                    isClearable
                    placeholder="Semua Department"
                    styles={customSelectStyles}
                    className="text-xs sm:text-sm"
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                  />
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

            {/* Additional Absensi Filters */}
            <div className="mb-4 sm:mb-6">
              <h3 className="text-sm sm:text-base font-semibold text-blue-600 mb-3 sm:mb-4">
                Filter Tambahan
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
                  <Select
                    options={divisiOptions}
                    value={divisiOptions.find(
                      (opt: any) => opt.value === selectedDivisi,
                    )}
                    onChange={(selected: any) =>
                      setSelectedDivisi(selected?.value || '')
                    }
                    isClearable
                    placeholder="Semua Divisi"
                    styles={customSelectStyles}
                    className="text-xs sm:text-sm"
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm text-gray-600 font-medium mb-2">
                    Bagian Mesin
                  </label>
                  <Select
                    options={bagianMesinOptions}
                    value={selectedBagianMesin}
                    onChange={(selected: any) =>
                      setSelectedBagianMesin(selected)
                    }
                    isClearable
                    placeholder="Semua Bagian Mesin"
                    styles={customSelectStyles}
                    className="text-xs sm:text-sm"
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                  />
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

        {/* Absensi Table - Grouped by Machine */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-teal-600 p-3 sm:p-4">
            <h3 className="text-white text-base sm:text-lg md:text-xl font-bold flex items-center">
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
              Data Absensi & Lembur
            </h3>
          </div>

          <div className="overflow-x-auto max-h-[600px] sm:max-h-[700px] overflow-y-auto">
            <table className="w-full text-xs sm:text-sm min-w-[800px]">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="p-2 sm:p-3 text-left text-xs font-semibold text-gray-600">
                    No
                  </th>
                  <th className="p-2 sm:p-3 text-left text-xs font-semibold text-gray-600">
                    Nama
                  </th>
                  <th className="p-2 sm:p-3 text-left text-xs font-semibold text-gray-600">
                    Dept/Divisi
                  </th>
                  <th className="p-2 sm:p-3 text-left text-xs font-semibold text-gray-600">
                    Tanggal
                  </th>
                  <th className="p-2 sm:p-3 text-left text-xs font-semibold text-gray-600">
                    Waktu Masuk/Keluar
                  </th>
                  <th className="p-2 sm:p-3 text-left text-xs font-semibold text-gray-600">
                    Jam Lembur
                  </th>
                  <th className="p-2 sm:p-3 text-left text-xs font-semibold text-gray-600">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedMachineGroups.map(
                  (mesinName: string, mesinIndex: number) => {
                    const mesinData = groupedByMachine[mesinName];
                    let rowCounter = 0;

                    return (
                      <React.Fragment key={mesinIndex}>
                        {/* Machine Section Header */}
                        <tr className="bg-gradient-to-r from-purple-100 to-purple-50 border-y-2 border-purple-300">
                          <td
                            colSpan={7}
                            className="p-3 sm:p-4 text-left font-bold text-purple-900"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sm sm:text-base">
                                {mesinName}
                              </span>
                              <span className="text-xs sm:text-sm bg-purple-200 px-2 py-1 rounded-full">
                                {mesinData.length} Karyawan
                              </span>
                            </div>
                          </td>
                        </tr>

                        {/* Employees in this machine */}
                        {mesinData.map((data: any, i: any) => {
                          rowCounter++;
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

                          const bagianMesin =
                            data.bagian_mesin?.[0]?.nama_bagian_mesin || '';

                          return (
                            <tr
                              key={i}
                              className={`border-b ${getRowBackground()}`}
                            >
                              <td className="p-2 sm:p-3 text-xs">
                                {rowCounter}
                              </td>
                              <td className="p-2 sm:p-3 text-xs font-medium">
                                <div className="flex flex-col">
                                  <span>{data.name}</span>
                                  {bagianMesin && (
                                    <span className="text-green-500 text-[10px] sm:text-[11px]">
                                      - {bagianMesin}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="p-2 sm:p-3 text-xs">
                                <div className="flex flex-col">
                                  <span className="max-w-[120px]">
                                    {data.nama_department}
                                  </span>
                                  <span className="text-blue-500 max-w-[120px]">
                                    {data.nama_divisi}
                                  </span>
                                </div>
                              </td>
                              <td className="p-2 sm:p-3 text-xs">
                                <div className="flex flex-col">
                                  <span>{data.hari}</span>
                                  <span>
                                    {data.tgl_masuk} -{' '}
                                    <span className="text-blue-400">
                                      {data.shift}
                                    </span>
                                  </span>
                                  {data.jenis_hari_masuk !== 'Biasa' &&
                                    data.jenis_hari_masuk != null && (
                                      <span className="text-blue-600 font-medium">
                                        Libur
                                      </span>
                                    )}
                                </div>
                              </td>
                              <td className="p-2 sm:p-3 text-xs">
                                <div className="flex flex-col gap-0.5">
                                  <span>In: {data.jam_masuk || '~'}</span>
                                  <span>Out: {data.jam_keluar || '~'}</span>
                                </div>
                              </td>
                              <td className="p-2 sm:p-3 text-xs">
                                <div className="flex flex-col gap-0.5">
                                  <span className="font-medium text-purple-600">
                                    {data.jam_lembur > 0
                                      ? `${data.jam_lembur} Jam`
                                      : '-'}
                                  </span>
                                  {data.jam_lembur_spl > 0 && (
                                    <span className="text-[10px] text-blue-500">
                                      SPL: {data.jam_lembur_spl} Jam
                                    </span>
                                  )}
                                  {data.status_lembur && (
                                    <span className="text-[10px] text-gray-500">
                                      {data.status_lembur}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="p-2 sm:p-3 text-xs">
                                <div className="flex flex-col gap-1">
                                  <span className="font-medium">
                                    {data.status_absen}
                                  </span>

                                  {data.status_keluar &&
                                    data.status_keluar !== 'Belum Pulang' && (
                                      <span className="text-[10px] text-blue-500">
                                        {data.status_keluar}
                                      </span>
                                    )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  },
                )}
              </tbody>
            </table>
            {(!filteredAbsen || filteredAbsen.length === 0) && (
              <div className="p-8 text-center text-gray-500">
                <p className="text-sm">Tidak ada data absensi</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default SecurityMonitoring;
