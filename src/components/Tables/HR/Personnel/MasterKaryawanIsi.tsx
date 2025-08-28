import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import convertTimeStampToDateOnly from '../../../../utils/convertDateOnly';
import * as XLSX from 'xlsx';

// Add sorting types
type SortField = 'nik' | 'name' | 'tgl_masuk';
type SortDirection = 'asc' | 'desc' | null;

function MasterKaryawanIsi() {
  useEffect(() => {
    getKaryawan();
    getDepartments();
    getDivisi();
  }, []);

  const [karyawan, setKaryawan] = useState<any>();
  const [departments, setDepartments] = useState<any[]>([]);
  const [divisi, setDivisi] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Add sorting states
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Existing functions remain the same...
  async function getKaryawan() {
    const url = `${import.meta.env.VITE_API_LINK}/hr/karyawan`;
    try {
      const res = await axios.get(url, {
        params: {},
        withCredentials: true,
      });
      setKaryawan(res.data);
      console.log(res.data);
    } catch (error: any) {
      console.log(error);
    }
  }

  async function getDepartments() {
    const url = `${import.meta.env.VITE_API_LINK}/master/hr/department`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        params: {
          is_active: true,
        },
        withCredentials: true,
      });
      setDepartments(res.data?.data || []);
      setIsLoading(false);
    } catch (error: any) {
      console.log(error);
      setIsLoading(false);
    }
  }

  async function getDivisi() {
    const url = `${import.meta.env.VITE_API_LINK}/master/hr/divisi`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        withCredentials: true,
      });
      setDivisi(res.data?.data || []);
      setIsLoading(false);
    } catch (error: any) {
      console.log(error);
      setIsLoading(false);
    }
  }

  async function deleteKaryawan(id: any) {
    if (window.confirm('Apakah Anda yakin ingin Menghapus Karyawan ini?')) {
      const url = `${import.meta.env.VITE_API_LINK}/hr/karyawan/${id}`;
      try {
        const res = await axios.delete(url, {
          withCredentials: true,
        });
        getKaryawan();
      } catch (error: any) {
        console.log(error);
      }
    }
    setOpenDropdown(null);
  }

  async function cutOffKaryawan(id: any) {
    if (window.confirm('Apakah Anda yakin ingin Cut-Off Karyawan ini?')) {
      const url = `${import.meta.env.VITE_API_LINK}/hr/karyawan/cutOff/${id}`;
      try {
        const res = await axios.put(url, {
          withCredentials: true,
        });
        getKaryawan();
      } catch (error: any) {
        console.log(error);
      }
    }
    setOpenDropdown(null);
  }

  async function activateCutOffKaryawan(id: any) {
    if (
      window.confirm(
        'Apakah Anda yakin ingin Mengaktifkan kembali Karyawan ini?',
      )
    ) {
      const url = `${
        import.meta.env.VITE_API_LINK
      }/hr/karyawan/activeCutOff/${id}`;
      try {
        const res = await axios.put(url, {
          withCredentials: true,
        });
        getKaryawan();
      } catch (error: any) {
        console.log(error);
      }
    }
    setOpenDropdown(null);
  }

  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdown(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Filter states
  const [statusFilter, setStatusFilter] = useState('active');
  const [divisiFilter, setDivisiFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [tipePenggajianFilter, setTipePenggajianFilter] = useState('all');
  const [jenisKelaminFilter, setJenisKelaminFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Get unique tipe_penggajian values
  const uniqueTipePenggajian = [
    ...new Set(
      karyawan?.data
        ?.map((data: any) => data.biodata_karyawan[0]?.tipe_penggajian)
        .filter((tipe: any) => tipe && tipe !== ''),
    ),
  ];

  // Add sorting function
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // If clicking the same field, cycle through: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortField(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      // If clicking a different field, start with asc
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Modified filteredAbsen to include sorting
  const filteredAbsen = karyawan?.data
    ?.filter((data: any) => {
      const biodata = data.biodata_karyawan[0];

      // Search filter - only NIK and Name
      const searchLower = searchQuery.toLowerCase();
      const nameMatches = data.name.toLowerCase().includes(searchLower);
      const nikMatches =
        biodata?.nik?.toLowerCase().includes(searchLower) || false;
      const searchMatches = nameMatches || nikMatches;

      // Status filter
      const status = biodata?.status_active || '';
      let statusMatches = true;
      if (statusFilter !== 'all') {
        if (statusFilter === 'lain-lain') {
          statusMatches = status !== 'active' && status !== 'cut off';
        } else {
          statusMatches = status === statusFilter;
        }
      }

      // Divisi filter
      let divisiFilterMatches = true;
      if (divisiFilter !== 'all') {
        divisiFilterMatches = biodata?.divisi?.id == divisiFilter;
      }

      // Department filter
      let departmentFilterMatches = true;
      if (departmentFilter !== 'all') {
        departmentFilterMatches = biodata?.department?.id == departmentFilter;
      }

      // Tipe Penggajian filter
      let tipePenggajianMatches = true;
      if (tipePenggajianFilter !== 'all') {
        tipePenggajianMatches =
          biodata?.tipe_penggajian === tipePenggajianFilter;
      }

      // Jenis Kelamin filter
      let jenisKelaminFilterMatches = true;
      if (jenisKelaminFilter !== 'all') {
        jenisKelaminFilterMatches =
          biodata?.jenis_kelamin === jenisKelaminFilter;
      }

      return (
        searchMatches &&
        statusMatches &&
        divisiFilterMatches &&
        departmentFilterMatches &&
        tipePenggajianMatches &&
        jenisKelaminFilterMatches
      );
    })
    ?.sort((a: any, b: any) => {
      // Apply sorting if sortField and sortDirection are set
      if (!sortField || !sortDirection) return 0;

      let aValue: string | Date;
      let bValue: string | Date;

      switch (sortField) {
        case 'nik':
          aValue = a.biodata_karyawan[0]?.nik || '';
          bValue = b.biodata_karyawan[0]?.nik || '';
          break;
        case 'name':
          aValue = a.name || '';
          bValue = b.name || '';
          break;
        case 'tgl_masuk':
          aValue = a.biodata_karyawan[0]?.tgl_masuk
            ? new Date(a.biodata_karyawan[0].tgl_masuk)
            : new Date(0);
          bValue = b.biodata_karyawan[0]?.tgl_masuk
            ? new Date(b.biodata_karyawan[0].tgl_masuk)
            : new Date(0);
          break;
        default:
          return 0;
      }

      if (sortField === 'tgl_masuk') {
        // For dates, compare as Date objects
        const dateA = aValue as Date;
        const dateB = bValue as Date;
        if (sortDirection === 'asc') {
          return dateA.getTime() - dateB.getTime();
        } else {
          return dateB.getTime() - dateA.getTime();
        }
      } else {
        // For strings, compare as strings
        const strA = (aValue as string).toLowerCase();
        const strB = (bValue as string).toLowerCase();
        if (sortDirection === 'asc') {
          return strA.localeCompare(strB);
        } else {
          return strB.localeCompare(strA);
        }
      }
    });

  const toggleDropdown = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDropdown(openDropdown === userId ? null : userId);
  };

  // Render sort icon component
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return (
        <div className="flex flex-col ml-1">
          <svg
            className="w-3 h-3 text-gray-300"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M5 8l5-5 5 5H5z" />
          </svg>
          <svg
            className="w-3 h-3 text-gray-300 -mt-1"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M15 12l-5 5-5-5h10z" />
          </svg>
        </div>
      );
    }

    return (
      <div className="flex flex-col ml-1">
        <svg
          className={`w-3 h-3 ${
            sortDirection === 'asc' ? 'text-blue-600' : 'text-gray-300'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M5 8l5-5 5 5H5z" />
        </svg>
        <svg
          className={`w-3 h-3 -mt-1 ${
            sortDirection === 'desc' ? 'text-blue-600' : 'text-gray-300'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M15 12l-5 5-5-5h10z" />
        </svg>
      </div>
    );
  };

  // Export to Excel function remains the same...
  const exportToExcel = () => {
    if (!filteredAbsen || filteredAbsen.length === 0) {
      alert('Tidak ada data untuk diekspor');
      return;
    }

    const excelData = filteredAbsen.map((data: any, index: number) => ({
      No: index + 1,
      NIK: data.biodata_karyawan[0]?.nik || '-',
      Nama: data.name || '-',
      'Jenis Kelamin': data.biodata_karyawan[0]?.jenis_kelamin || '-',
      Divisi: data.biodata_karyawan[0]?.divisi?.nama_divisi || '-',
      Department: data.biodata_karyawan[0]?.department?.nama_department || '-',
      Jabatan: data.biodata_karyawan[0]?.jabatan?.nama_jabatan || '-',
      'Tipe Penggajian': data.biodata_karyawan[0]?.tipe_penggajian || '-',
      'Tanggal Masuk': data.biodata_karyawan[0]?.tgl_masuk
        ? convertTimeStampToDateOnly(data.biodata_karyawan[0].tgl_masuk)
        : '-',
      'Tanggal Keluar': data.biodata_karyawan[0]?.tgl_keluar
        ? convertTimeStampToDateOnly(data.biodata_karyawan[0].tgl_keluar)
        : '-',
      Status:
        data.biodata_karyawan[0]?.status?.nama_status ||
        data.biodata_karyawan[0]?.status_active ||
        '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Karyawan');

    const columnWidths = [
      { wch: 5 }, // No
      { wch: 15 }, // NIK
      { wch: 25 }, // Nama
      { wch: 15 }, // Jenis Kelamin
      { wch: 20 }, // Divisi
      { wch: 20 }, // Department
      { wch: 20 }, // Jabatan
      { wch: 15 }, // Tipe Penggajian
      { wch: 15 }, // Tanggal Masuk
      { wch: 15 }, // Tanggal Keluar
      { wch: 15 }, // Status
    ];
    worksheet['!cols'] = columnWidths;

    const currentDate = new Date();
    const dateString = currentDate.toISOString().split('T')[0];
    const filename = `Data_Karyawan_${dateString}.xlsx`;

    XLSX.writeFile(workbook, filename);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-full mx-auto">
        {/* Header Section - remains the same */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Master Karyawan
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Kelola data karyawan perusahaan
                </p>
              </div>
              <Link to={'/hr/pm/masterkaryawan/add'}>
                <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-colors duration-200 flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Tambah Personnel
                </button>
              </Link>
            </div>
          </div>

          {/* Search Section - remains the same */}
          <div className="px-6 py-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
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
              </div>
              <input
                type="text"
                placeholder="Cari berdasarkan Nama atau NIK..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm placeholder-gray-500"
              />
            </div>
          </div>

          {/* Filters Section - remains the same */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
              {/* Status Filter */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-700">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="active">Active</option>
                  <option value="all">Semua Status</option>
                  <option value="cut off">Cut Off</option>
                  <option value="lain-lain">Lain-lain</option>
                </select>
              </div>

              {/* Divisi Filter */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-700">
                  Divisi
                </label>
                <select
                  value={divisiFilter}
                  onChange={(e) => setDivisiFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="all">Semua Divisi</option>
                  {divisi.map((div: any) => (
                    <option key={div.id} value={div.id}>
                      {div.nama_divisi}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department Filter */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-700">
                  Department
                </label>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="all">Semua Department</option>
                  {departments.map((dept: any) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.nama_department}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tipe Penggajian Filter */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-700">
                  Tipe Penggajian
                </label>
                <select
                  value={tipePenggajianFilter}
                  onChange={(e) => setTipePenggajianFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="all">Semua Tipe</option>
                  {uniqueTipePenggajian.map((tipe: any) => (
                    <option key={tipe} value={tipe}>
                      {tipe}
                    </option>
                  ))}
                </select>
              </div>

              {/* Jenis Kelamin Filter */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-700">
                  Jenis Kelamin
                </label>
                <select
                  value={jenisKelaminFilter}
                  onChange={(e) => setJenisKelaminFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="all">Semua</option>
                  <option value="Laki-Laki">Laki-Laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              {/* Reset Button */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-transparent">
                  Reset
                </label>
                <button
                  onClick={() => {
                    setStatusFilter('active');
                    setDivisiFilter('all');
                    setDepartmentFilter('all');
                    setTipePenggajianFilter('all');
                    setJenisKelaminFilter('all');
                    setSearchQuery('');
                    setSortField(null);
                    setSortDirection(null);
                  }}
                  className="w-full px-3 py-2 text-sm bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md transition-colors duration-200"
                >
                  Reset Filter
                </button>
              </div>

              {/* Export Button */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-transparent">
                  Export
                </label>
                <button
                  onClick={exportToExcel}
                  className="w-full flex items-center justify-center px-3 py-2 text-sm bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors duration-200"
                >
                  <svg
                    className="w-4 h-4 mr-1"
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
                  Excel
                </button>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <span>
                Menampilkan{' '}
                <span className="font-semibold text-gray-900">
                  {filteredAbsen?.length || 0}
                </span>{' '}
                dari{' '}
                <span className="font-semibold text-gray-900">
                  {karyawan?.data?.length || 0}
                </span>{' '}
                karyawan
              </span>
            </div>
          </div>
        </div>

        {/* Table Section - Updated with sorting */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto flex flex-col min-h-screen">
            <table
              className="w-full divide-y divide-gray-200"
              style={{ minWidth: '700px' }}
            >
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    No
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    <button
                      onClick={() => handleSort('nik')}
                      className="flex items-center hover:text-gray-700 transition-colors duration-150"
                    >
                      NIK
                      <SortIcon field="nik" />
                    </button>
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center hover:text-gray-700 transition-colors duration-150"
                    >
                      Nama
                      <SortIcon field="name" />
                    </button>
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    Gender
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    Divisi
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    Dept
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    Jabatan
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    Tipe
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-18">
                    <button
                      onClick={() => handleSort('tgl_masuk')}
                      className="flex items-center hover:text-gray-700 transition-colors duration-150"
                    >
                      Tgl Masuk
                      <SortIcon field="tgl_masuk" />
                    </button>
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-18">
                    Tgl Keluar
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    Status
                  </th>
                  <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 ">
                {karyawan != null &&
                  filteredAbsen?.map((data: any, i: any) => (
                    <tr
                      key={data.userid}
                      className={`hover:bg-gray-50 transition-colors duration-150 ${
                        data.biodata_karyawan[0]?.status_active == 'cut off'
                          ? 'bg-orange-50 border-l-4 border-orange-400'
                          : ''
                      }`}
                    >
                      <td className="px-2 py-2 whitespace-nowrap">
                        <span className="text-xs font-medium text-gray-900">
                          {i + 1}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <span className="text-xs text-gray-600">
                          {data.biodata_karyawan[0]?.nik}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <span
                          className="text-xs font-medium text-gray-900 truncate block max-w-24"
                          title={data.name}
                        >
                          {data.name}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <span className="text-xs text-gray-600">
                          {data.biodata_karyawan[0]?.jenis_kelamin ===
                          'Laki-Laki'
                            ? 'L'
                            : data.biodata_karyawan[0]?.jenis_kelamin ===
                              'Perempuan'
                            ? 'P'
                            : data.biodata_karyawan[0]?.jenis_kelamin}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <span
                          className="text-xs text-gray-600 truncate block max-w-20"
                          title={data.biodata_karyawan[0]?.divisi?.nama_divisi}
                        >
                          {data.biodata_karyawan[0]?.divisi?.nama_divisi}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <span
                          className="text-xs text-gray-600 truncate block max-w-20"
                          title={
                            data.biodata_karyawan[0]?.department
                              ?.nama_department
                          }
                        >
                          {
                            data.biodata_karyawan[0]?.department
                              ?.nama_department
                          }
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <span
                          className="text-xs text-gray-600 truncate block max-w-20"
                          title={
                            data.biodata_karyawan[0]?.jabatan?.nama_jabatan
                          }
                        >
                          {data.biodata_karyawan[0]?.jabatan?.nama_jabatan}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <span
                          className="inline-flex px-1 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded truncate max-w-16"
                          title={data.biodata_karyawan[0]?.tipe_penggajian}
                        >
                          {data.biodata_karyawan[0]?.tipe_penggajian}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <span className="text-xs text-gray-600">
                          {data.biodata_karyawan[0]?.tgl_masuk == ''
                            ? '-'
                            : convertTimeStampToDateOnly(
                                data.biodata_karyawan[0]?.tgl_masuk,
                              )}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <span className="text-xs text-gray-600">
                          {data.biodata_karyawan[0]?.tgl_keluar == null
                            ? '-'
                            : convertTimeStampToDateOnly(
                                data.biodata_karyawan[0]?.tgl_keluar,
                              )}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <span
                          className={`inline-flex px-1 py-0.5 text-xs font-medium rounded ${
                            data.biodata_karyawan[0]?.status_active === 'active'
                              ? 'bg-green-100 text-green-800'
                              : data.biodata_karyawan[0]?.status_active ===
                                'cut off'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {data.biodata_karyawan[0]?.status?.nama_status ==
                            null ||
                          data.biodata_karyawan[0]?.status?.nama_status == 0
                            ? '-'
                            : data.biodata_karyawan[0]?.status?.nama_status}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <div className="relative">
                          <button
                            onClick={(e) => toggleDropdown(data.userid, e)}
                            className="inline-flex items-center p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-150"
                            aria-label="More actions"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>

                          {/* Dropdown Menu */}
                          {openDropdown === data.userid && (
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                              <div className="py-1">
                                <Link
                                  to={`/hr/pm/masterkaryawan/detail/${data.userid}`}
                                  className="flex items-center px-4 py-2 text-sm text-green-700 hover:bg-green-50 transition-colors duration-150"
                                  onClick={() => setOpenDropdown(null)}
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
                                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                  </svg>
                                  Lihat Detail
                                </Link>

                                <Link
                                  to={`/hr/pm/masterkaryawan/edit/${data.userid}`}
                                  className="flex items-center px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 transition-colors duration-150"
                                  onClick={() => setOpenDropdown(null)}
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
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                  </svg>
                                  Edit Data
                                </Link>

                                {/* Conditional rendering based on status */}
                                {data.biodata_karyawan[0]?.status_active ===
                                'cut off' ? (
                                  <button
                                    onClick={() =>
                                      activateCutOffKaryawan(data.userid)
                                    }
                                    className="flex items-center w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50 transition-colors duration-150"
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
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                    Aktifkan Karyawan
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => cutOffKaryawan(data.userid)}
                                    className="flex items-center w-full px-4 py-2 text-sm text-orange-700 hover:bg-orange-50 transition-colors duration-150"
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
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                                      />
                                    </svg>
                                    Cut-Off Karyawan
                                  </button>
                                )}

                                <div className="border-t border-gray-100 my-1"></div>

                                <button
                                  onClick={() => deleteKaryawan(data.userid)}
                                  className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors duration-150"
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
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                  Hapus Karyawan
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {(!filteredAbsen || filteredAbsen.length === 0) && (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-1 1m0 0l-1 1m1-1v4M6 4l1 1v4m0 0l1 1m-1-1H4"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Tidak ada karyawan
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery ||
                statusFilter !== 'active' ||
                divisiFilter !== 'all' ||
                departmentFilter !== 'all' ||
                tipePenggajianFilter !== 'all' ||
                jenisKelaminFilter !== 'all'
                  ? 'Tidak ada karyawan yang sesuai dengan filter yang dipilih.'
                  : 'Mulai dengan menambahkan karyawan baru.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MasterKaryawanIsi;
