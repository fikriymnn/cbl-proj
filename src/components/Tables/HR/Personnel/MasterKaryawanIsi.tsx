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

  // Photo modal states
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState('');

  // Add sorting states
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

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

  // Photo modal functions
  const openPhotoModal = (employee: any) => {
    setSelectedEmployee(employee);
    setIsPhotoModalOpen(true);
  };

  const closePhotoModal = () => {
    setIsPhotoModalOpen(false);
    setSelectedEmployee(null);
  };

  const openFullscreen = (imageUrl: string) => {
    setFullscreenImage(imageUrl);
    setIsFullscreen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
    setFullscreenImage('');
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortField(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAbsen = karyawan?.data
    ?.filter((data: any) => {
      const biodata = data.biodata_karyawan[0];

      const searchLower = searchQuery.toLowerCase();
      const nameMatches = data.name.toLowerCase().includes(searchLower);
      const nikMatches =
        biodata?.nik?.toLowerCase().includes(searchLower) || false;
      const searchMatches = nameMatches || nikMatches;

      const status = biodata?.status_active || '';
      let statusMatches = true;
      if (statusFilter !== 'all') {
        if (statusFilter === 'lain-lain') {
          statusMatches = status !== 'active' && status !== 'cut off';
        } else {
          statusMatches = status === statusFilter;
        }
      }

      let divisiFilterMatches = true;
      if (divisiFilter !== 'all') {
        divisiFilterMatches = biodata?.divisi?.id == divisiFilter;
      }

      let departmentFilterMatches = true;
      if (departmentFilter !== 'all') {
        departmentFilterMatches = biodata?.department?.id == departmentFilter;
      }

      let tipePenggajianMatches = true;
      if (tipePenggajianFilter !== 'all') {
        tipePenggajianMatches =
          biodata?.tipe_penggajian === tipePenggajianFilter;
      }

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
        const dateA = aValue as Date;
        const dateB = bValue as Date;
        if (sortDirection === 'asc') {
          return dateA.getTime() - dateB.getTime();
        } else {
          return dateB.getTime() - dateA.getTime();
        }
      } else {
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
      { wch: 5 },
      { wch: 15 },
      { wch: 25 },
      { wch: 15 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
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
        {/* Fullscreen Image Modal */}
        {isFullscreen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-90 z-[60] overflow-auto"
            onClick={closeFullscreen}
          >
            <div className="relative w-full min-h-screen flex justify-center p-4">
              <img
                src={fullscreenImage}
                alt="Fullscreen"
                className="max-w-full h-auto block"
                onClick={(e) => e.stopPropagation()}
              />
              <button
                className="fixed top-4 right-4 text-white bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-70 transition-colors text-xl font-bold"
                onClick={closeFullscreen}
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Photo Modal */}
        {isPhotoModalOpen && selectedEmployee && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white rounded-t-2xl">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Profil Karyawan
                </h3>
                <p className="text-blue-100 text-sm mt-1">
                  {selectedEmployee.name}
                </p>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-6">
                <div className="space-y-6">
                  {/* Photo Section */}
                  <div className="flex flex-col items-center">
                    {selectedEmployee.biodata_karyawan[0]?.foto_karyawan ? (
                      <div className="relative">
                        <img
                          src={`${import.meta.env.VITE_API_LINK}/images/${
                            selectedEmployee.biodata_karyawan[0].foto_karyawan
                          }`}
                          alt={selectedEmployee.name}
                          className="w-48 h-48 object-cover rounded-lg border-4 border-blue-200 shadow-lg cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() =>
                            openFullscreen(
                              `${import.meta.env.VITE_API_LINK}/images/${
                                selectedEmployee.biodata_karyawan[0]
                                  .foto_karyawan
                              }`,
                            )
                          }
                          onError={(e) => {
                            e.currentTarget.src =
                              'https://via.placeholder.com/200x200?text=No+Photo';
                          }}
                        />
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          Klik gambar untuk memperbesar
                        </p>
                      </div>
                    ) : (
                      <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center border-4 border-gray-300">
                        <div className="text-center">
                          <svg
                            className="w-16 h-16 mx-auto text-gray-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <p className="text-gray-500 text-sm mt-2">
                            Tidak ada foto
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Employee Details */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Informasi Karyawan
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 font-medium">NIK:</p>
                        <p className="text-gray-800">
                          {selectedEmployee.biodata_karyawan[0]?.nik || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 font-medium">
                          Jenis Kelamin:
                        </p>
                        <p className="text-gray-800">
                          {selectedEmployee.biodata_karyawan[0]
                            ?.jenis_kelamin || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 font-medium">Divisi:</p>
                        <p className="text-gray-800">
                          {selectedEmployee.biodata_karyawan[0]?.divisi
                            ?.nama_divisi || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 font-medium">Department:</p>
                        <p className="text-gray-800">
                          {selectedEmployee.biodata_karyawan[0]?.department
                            ?.nama_department || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 font-medium">Jabatan:</p>
                        <p className="text-gray-800">
                          {selectedEmployee.biodata_karyawan[0]?.jabatan
                            ?.nama_jabatan || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 font-medium">
                          Tipe Penggajian:
                        </p>
                        <p className="text-gray-800">
                          {selectedEmployee.biodata_karyawan[0]
                            ?.tipe_penggajian || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 font-medium">
                          Tanggal Masuk:
                        </p>
                        <p className="text-gray-800">
                          {selectedEmployee.biodata_karyawan[0]?.tgl_masuk
                            ? convertTimeStampToDateOnly(
                                selectedEmployee.biodata_karyawan[0].tgl_masuk,
                              )
                            : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 font-medium">Status:</p>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                            selectedEmployee.biodata_karyawan[0]
                              ?.status_active === 'active'
                              ? 'bg-green-100 text-green-800'
                              : selectedEmployee.biodata_karyawan[0]
                                  ?.status_active === 'cut off'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {selectedEmployee.biodata_karyawan[0]?.status
                            ?.nama_status ||
                            selectedEmployee.biodata_karyawan[0]
                              ?.status_active ||
                            '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                <Link
                  to={`/hr/personnel/employee/detail/${selectedEmployee.userid}`}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                  onClick={closePhotoModal}
                >
                  Lihat Detail Lengkap
                </Link>
                <button
                  onClick={closePhotoModal}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold rounded-lg transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header Section */}
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
              <Link to={'/hr/personnel/employee/add'}>
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

          {/* Search Section */}
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

          {/* Filters Section */}
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

        {/* Table Section */}
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
              <tbody className="bg-white divide-y divide-gray-200">
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
                        <button
                          onClick={() => openPhotoModal(data)}
                          className="text-xs font-medium text-blue-600 hover:text-blue-800 truncate block max-w-24 text-left hover:underline"
                          title={`${data.name} - Klik untuk lihat foto`}
                        >
                          {data.name}
                        </button>
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
                                  to={`/hr/personnel/employee/detail/${data.userid}`}
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
                                  to={`/hr/personnel/employee/edit/${data.userid}`}
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
