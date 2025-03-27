import React, { useState, useEffect } from 'react';

interface FilterProps {
  editedPayWeek: any;
  department: any[];
  divisi: any[];
  tipe_karyawan: any[];
  tipe_penggajian: any[];
  setFilteredData: (data: any[]) => void;
}

const EmployeeFilter: React.FC<FilterProps> = ({
  editedPayWeek,
  department,
  divisi,
  tipe_karyawan,
  tipe_penggajian,
  setFilteredData,
}) => {
  const [filters, setFilters] = useState({
    nama_department: '',
    nama_divisi: '',
    nama_karyawan: '',
    tipe_karyawan: '',
    tipe_penggajian: '',
    nik: '',
  });

  // Apply filters whenever filters or data changes
  useEffect(() => {
    if (!editedPayWeek?.detail) return;

    const filteredResult = editedPayWeek.detail.filter((item: any) => {
      const matchDepartment =
        !filters.nama_department ||
        item.summaryPayroll?.department === filters.nama_department;

      const matchDivisi =
        !filters.nama_divisi ||
        item.summaryPayroll?.divisi === filters.nama_divisi;

      const tipeKaryawanValue = item.summaryPayroll?.tipe_karyawan || '';
      const tipePenggajiannValue = item.summaryPayroll?.tipe_penggajian || '';

      const matchPenggajian =
        !filters.tipe_penggajian ||
        tipePenggajiannValue === filters.tipe_penggajian;
      const matchTipe =
        !filters.tipe_karyawan || tipeKaryawanValue === filters.tipe_karyawan;

      const matchNama =
        !filters.nama_karyawan ||
        item.summaryPayroll?.nama_karyawan
          .toLowerCase()
          .includes(filters.nama_karyawan.toLowerCase());

      const matchNik =
        !filters.nik ||
        item.summaryPayroll?.nik.toString().includes(filters.nik);

      return (
        matchDepartment &&
        matchDivisi &&
        matchNama &&
        matchNik &&
        matchPenggajian &&
        matchTipe
      );
    });

    setFilteredData(filteredResult);
  }, [filters, editedPayWeek, setFilteredData]);

  // Handle input changes
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      nama_department: '',
      nama_divisi: '',
      nama_karyawan: '',
      nik: '',
      tipe_karyawan: '',
      tipe_penggajian: '',
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <h3 className="text-lg font-bold mb-3">Filter Data</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Department
          </label>
          <select
            name="nama_department"
            value={filters.nama_department}
            onChange={handleFilterChange}
            className="w-full p-2 border border-gray-300 rounded text-sm"
          >
            <option value="">Semua Department</option>
            {department?.map((dept: any, index: number) => (
              <option key={index} value={dept.nama_department}>
                {dept.nama_department}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Divisi
          </label>
          <select
            name="nama_divisi"
            value={filters.nama_divisi}
            onChange={handleFilterChange}
            className="w-full p-2 border border-gray-300 rounded text-sm"
          >
            <option value="">Semua Divisi</option>
            {divisi?.map((div: any, index: number) => (
              <option key={index} value={div.nama_divisi}>
                {div.nama_divisi}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nama Karyawan
          </label>
          <input
            type="text"
            name="nama_karyawan"
            value={filters.nama_karyawan}
            onChange={handleFilterChange}
            placeholder="Search by name"
            className="w-full p-2 border border-gray-300 rounded text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            NIK
          </label>
          <input
            type="text"
            name="nik"
            value={filters.nik}
            onChange={handleFilterChange}
            placeholder="Search by NIK"
            className="w-full p-2 border border-gray-300 rounded text-sm"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipe Karyawan
          </label>
          <select
            name="tipe_karyawan"
            value={filters.tipe_karyawan}
            onChange={handleFilterChange}
            className="w-full p-2 border border-gray-300 rounded text-sm"
          >
            <option value="">Tipe Karyawan</option>
            {tipe_karyawan?.map((dept: any, index: number) => (
              <option key={index} value={dept.tipe_karyawan}>
                {dept.tipe_karyawan}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipe Penggajian
          </label>
          <select
            name="tipe_penggajian"
            value={filters.tipe_penggajian}
            onChange={handleFilterChange}
            className="w-full p-2 border border-gray-300 rounded text-sm"
          >
            <option value="">Tipe Penggajian</option>
            {tipe_penggajian?.map((dept: any, index: number) => (
              <option key={index} value={dept.tipe_penggajian}>
                {dept.tipe_penggajian}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <button
          onClick={resetFilters}
          className="px-4 py-2 font-bold text-white rounded-md text-sm hover:bg-gray-300 bg-red-500"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default EmployeeFilter;
