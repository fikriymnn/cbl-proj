import React, { useState, useEffect } from 'react';
import convertTimeStampToDate from '../../../../utils/convertDate';

interface FilterProps {
  payWeek: any;
  department: any[];
  divisi: any[];
  setFilteredData: (data: any[]) => void;
  formatInteger: (num: number) => string;
}

const EnhancedEmployeeFilter: React.FC<FilterProps> = ({
  payWeek,
  department,
  divisi,
  setFilteredData,
  formatInteger,
}) => {
  const [filters, setFilters] = useState({
    nama_department: '',
    nama_divisi: '',
    nama_karyawan: '',
    nik: '',
  });

  // State to store original data
  const [originalData, setOriginalData] = useState<any[]>([]);

  // Extract all employees data across all payWeek data items
  useEffect(() => {
    if (!payWeek?.data) return;

    // Flatten all employee data from all payroll details
    const allEmployees: any[] = [];
    payWeek.data.forEach((payData: any) => {
      if (
        payData.payroll_detail_bulanan &&
        Array.isArray(payData.payroll_detail_bulanan)
      ) {
        payData.payroll_detail_bulanan.forEach((detail: any) => {
          allEmployees.push({
            ...detail,
            parent: payData, // Store reference to parent data
          });
        });
      }
    });

    setOriginalData(allEmployees);
    setFilteredData(allEmployees);
  }, [payWeek, setFilteredData]);

  // Apply filters whenever filters or data changes
  useEffect(() => {
    if (!originalData.length) return;

    const filteredResult = originalData.filter((item: any) => {
      const departmentValue =
        item.karyawan?.biodata_karyawan[0]?.department?.nama_department || '';
      const divisiValue =
        item.karyawan?.biodata_karyawan[0]?.divisi?.nama_divisi || '';
      const nameValue = item.karyawan?.name || '';
      const nikValue = item.karyawan?.biodata_karyawan[0]?.nik || '';

      const matchDepartment =
        !filters.nama_department || departmentValue === filters.nama_department;

      const matchDivisi =
        !filters.nama_divisi || divisiValue === filters.nama_divisi;

      const matchNama =
        !filters.nama_karyawan ||
        nameValue.toLowerCase().includes(filters.nama_karyawan.toLowerCase());

      const matchNik =
        !filters.nik || nikValue.toString().includes(filters.nik);

      return matchDepartment && matchDivisi && matchNama && matchNik;
    });

    setFilteredData(filteredResult);
  }, [filters, originalData, setFilteredData]);

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
    });
  };

  // Summary stats
  const getSummaryStats = () => {
    if (!payWeek?.data || !payWeek.data.length) return null;

    const latestData = payWeek.data[0]; // Assuming the first item is the most recent

    return {
      periodFrom: latestData.periode_dari,
      periodTo: latestData.periode_sampai,
      paymentDate: latestData.tgl_bayar,
      total: latestData.total,
    };
  };

  const summaryStats = getSummaryStats();

  return (
    <div className="space-y-4">
      {/* Details Header */}
      {summaryStats && (
        <div className="bg-blue-50 p-4 rounded-lg shadow">
          <h2 className="text-lg font-bold mb-2">Payroll Periode Details</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Periode Dari</p>
              <p className="text-sm font-semibold">
                {convertTimeStampToDate(summaryStats.periodFrom)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Periode Sampai
              </p>
              <p className="text-sm font-semibold">
                {convertTimeStampToDate(summaryStats.periodTo)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Tanggal Bayar</p>
              <p className="text-sm font-semibold">
                {convertTimeStampToDate(summaryStats.paymentDate)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-sm font-semibold">
                Rp. {formatInteger(summaryStats.total)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-lg shadow">
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
              <option value="">All Departments</option>
              {department?.map((dept: any, index: number) => (
                <option key={index} value={dept.nama_department}>
                  {dept.nama_department}
                </option>
              ))}
            </select>
          </div>

          {/* <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Division</label>
                        <select
                            name="nama_divisi"
                            value={filters.nama_divisi}
                            onChange={handleFilterChange}
                            className="w-full p-2 border border-gray-300 rounded text-sm"
                        >
                            <option value="">All Divisions</option>
                            {divisi?.map((div: any, index: number) => (
                                <option key={index} value={div.nama_divisi}>
                                    {div.nama_divisi}
                                </option>
                            ))}
                        </select>
                    </div> */}

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

        <div className="mt-4 flex justify-end">
          <button
            onClick={resetFilters}
            className="px-4 py-2 font-bold text-white rounded-md text-sm hover:bg-gray-300 bg-red-500"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedEmployeeFilter;
