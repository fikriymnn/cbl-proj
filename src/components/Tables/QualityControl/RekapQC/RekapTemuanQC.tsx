import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Calendar,
  Search,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Filter,
  Package,
  Settings,
  User,
  Clock,
  Bug,
} from 'lucide-react';

interface TemuanDetail {
  bagian: string;
  createdAt: string;
  customer: string;
  hasil: string;
  id: number;
  jumlah_defect: number;
  kode: string;
  kode_lkh?: string;
  kriteria: string;
  masalah: string;
  masalah_lkh?: string;
  mesin: string;
  nama_inspektor: string;
  nama_pengecekan?: string; // for sortir_rs
  nama_produk: string;
  no_io: string;
  no_jo: string;
  operator: string;
  periode_ke?: number; // optional since not used in rabut and sortir_rs
  persen_kriteria: number;
  sumber_masalah: string;
  updatedAt: string;
}

interface RekapData {
  no_jo: string;
  no_io: string;
  item: string;
  customer?: string; // Make optional since we'll extract from sections
  cetak: TemuanDetail[];
  coating: TemuanDetail[];
  lem: TemuanDetail[];
  pond: TemuanDetail[];
  sampling_rabut: TemuanDetail[];
  sortir_rs: TemuanDetail[];
}

// Sections we want to display (sortir_rs is intentionally excluded)
const ACTIVE_SECTIONS = [
  'cetak',
  'coating',
  'lem',
  'pond',
  'sampling_rabut',
] as const;
type ActiveSection = (typeof ACTIVE_SECTIONS)[number];

function RekapTemuanQC() {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<RekapData[]>([]);
  const [filteredData, setFilteredData] = useState<RekapData[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [joNumber, setJoNumber] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    filterData();
  }, [data, searchTerm]);

  // Improved filter validation function
  const validateFilters = () => {
    // Clear previous errors
    setError('');

    // Case 1: If both dates are empty, JO number is required
    if (!startDate && !endDate) {
      if (!joNumber.trim()) {
        setError('JO Number is required when no date range is specified.');
        return false;
      }
      return true;
    }

    // Case 2: If one date is filled, both must be filled
    if ((startDate && !endDate) || (!startDate && endDate)) {
      setError(
        'Both Start Date and End Date must be filled when using date filters.',
      );
      return false;
    }

    // Case 3: If both dates are filled, JO number is optional
    if (startDate && endDate) {
      // Validate date range
      if (new Date(startDate) > new Date(endDate)) {
        setError('Start Date cannot be later than End Date.');
        return false;
      }
      return true;
    }

    return true;
  };

  async function getRekap() {
    // Validate filters before making API call
    if (!validateFilters()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const url = `${
        import.meta.env.VITE_API_LINK
      }/qc/report/checkSheet/temuan`;
      const params: {
        start_date?: string;
        end_date?: string;
        no_jo?: string;
      } = {};

      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (joNumber.trim()) params.no_jo = joNumber.trim();

      const res = await axios.get(url, {
        withCredentials: true,
        params: params,
      });

      console.log('Response:', res.data.data);
      setData(res.data.data || []);
      setFilteredData(res.data.data || []);
    } catch (error) {
      console.log('API Error:', error);
      setError('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const filterData = () => {
    if (!searchTerm) {
      setFilteredData(data);
      return;
    }

    const filtered = data.filter(
      (item) =>
        item.no_jo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.no_io.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.item.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredData(filtered);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    getRekap();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Clear error when user starts typing
  const handleJoNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setJoNumber(e.target.value);
    if (error) setError('');
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
    if (error) setError('');
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
    if (error) setError('');
  };

  const getStatusIcon = (hasil: string, sectionName: string) => {
    // Only for sampling_rabut, hasil represents defect found
    if (sectionName === 'sampling_rabut') {
      return <Bug className="w-4 h-4 text-orange-500" />;
    }

    // For other sections, hasil represents ok/not ok status
    switch (hasil) {
      case 'ok':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'not ok':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getKriteriaColor = (kriteria: string) => {
    switch (kriteria?.toLowerCase()) {
      case 'major':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'minor':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSectionDisplayName = (sectionName: string) => {
    const sectionNames: { [key: string]: string } = {
      cetak: 'Cetak',
      coating: 'Coating',
      lem: 'Lem',
      pond: 'Pond',
      sampling_rabut: 'Sampling Rabut',
    };
    return sectionNames[sectionName] || sectionName;
  };

  const getStatusColumnHeader = (sectionName: string) => {
    // Only sampling_rabut shows "Defect Found"
    if (sectionName === 'sampling_rabut') {
      return 'Defect Found';
    }
    return 'Status';
  };

  const getCustomerFromSections = (item: RekapData) => {
    // First check if customer is directly available
    if (item.customer) {
      return item.customer;
    }

    // Look for customer in active sections only (sortir_rs excluded)
    const allSections = [
      ...item.cetak,
      ...item.coating,
      ...item.lem,
      ...item.pond,
      ...item.sampling_rabut,
    ];

    const customerData = allSections.find((section) => section.customer);
    return customerData?.customer || 'N/A';
  };

  /**
   * Returns total jumlah_defect for a given section list.
   */
  const getSectionDefectTotal = (
    temuanList: TemuanDetail[],
    sectionName?: string,
  ) => {
    if (sectionName === 'sampling_rabut') {
      return temuanList.reduce((sum, t) => sum + (parseFloat(t.hasil) || 0), 0);
    }
    return temuanList.reduce((sum, t) => sum + (t.jumlah_defect || 0), 0);
  };
  /**
   * Builds a summary array for the JO card header, only for active sections
   * that actually have data.
   */
  const getJOSummary = (item: RekapData) => {
    return ACTIVE_SECTIONS.map((key) => ({
      section: key,
      count: item[key]?.length || 0,
      totalDefects: getSectionDefectTotal(item[key] || [], key), // pass key here
    })).filter((s) => s.count > 0);
  };

  const renderTemuanTable = (
    sectionName: string,
    temuanList: TemuanDetail[],
  ) => {
    // Don't render anything if there's no data
    if (!temuanList || temuanList.length === 0) {
      return null;
    }

    const isDefectSection = sectionName === 'sampling_rabut';
    const isRabut = sectionName === 'sampling_rabut';

    const totalDefects = getSectionDefectTotal(temuanList, sectionName);
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Settings className="w-5 h-5 text-blue-600 mr-2" />
            <h4 className="font-semibold text-gray-800">
              {getSectionDisplayName(sectionName)}
            </h4>
            <span className="ml-2 bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">
              {temuanList.length} {isDefectSection ? 'defect' : 'temuan'}
            </span>
          </div>
          {/* Per-section defect total */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Total Defects:</span>
            <span className="bg-orange-100 text-orange-800 border border-orange-200 font-semibold px-2.5 py-0.5 rounded-full text-xs">
              {totalDefects.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {getStatusColumnHeader(sectionName)}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code & Criteria
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Problem Details
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Machine & Operator
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Defects
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inspector & Date
                </th>
                {!isRabut && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {temuanList.map((temuan, index) => (
                <tr
                  key={temuan.id || index}
                  className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(temuan.hasil, sectionName)}
                      <span className="ml-2 text-sm font-medium text-gray-900">
                        {isDefectSection
                          ? temuan.hasil
                          : temuan.hasil
                          ? temuan.hasil.charAt(0).toUpperCase() +
                            temuan.hasil.slice(1)
                          : 'Unknown'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-2">
                      {/* Main Code */}
                      <div>
                        <div className="text-sm font-medium text-gray-900 mb-1">
                          {temuan.kode}
                        </div>
                        {temuan.kriteria && (
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getKriteriaColor(
                              temuan.kriteria,
                            )}`}
                          >
                            {temuan.kriteria}
                          </span>
                        )}
                      </div>

                      {/* LKH Code for sampling_rabut */}
                      {isRabut && temuan.kode_lkh && (
                        <div className="pt-1 border-t border-gray-200">
                          <div className="text-xs text-blue-600 font-medium">
                            LKH: {temuan.kode_lkh}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-2">
                      {/* Main Problem */}
                      <div>
                        <div className="text-sm text-gray-900 font-medium">
                          {temuan.masalah || 'No problem reported'}
                        </div>
                        {temuan.sumber_masalah && (
                          <div className="text-gray-500 text-xs mt-1">
                            Source: {temuan.sumber_masalah}
                          </div>
                        )}
                      </div>

                      {/* LKH Problem for sampling_rabut */}
                      {isRabut && temuan.masalah_lkh && (
                        <div className="pt-1 border-t border-gray-200">
                          <div className="text-xs text-orange-600 font-medium">
                            LKH Problem: {temuan.masalah_lkh}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm">
                      {temuan.mesin && (
                        <div className="flex items-center text-gray-900 mb-1">
                          <Settings className="w-3 h-3 mr-1 text-gray-400" />
                          {temuan.mesin}
                        </div>
                      )}
                      {temuan.operator && (
                        <div className="flex items-center text-gray-600">
                          <User className="w-3 h-3 mr-1 text-gray-400" />
                          {temuan.operator}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="text-gray-900 font-medium">
                        {isRabut ? temuan.hasil : temuan.jumlah_defect}{' '}
                        {/* ← change here */}
                      </div>
                      {temuan.persen_kriteria !== undefined && (
                        <div className="text-gray-500 text-xs">
                          {temuan.persen_kriteria}%
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm">
                      <div className="flex items-center text-gray-900 mb-1">
                        <User className="w-3 h-3 mr-1 text-gray-400" />
                        {temuan.nama_inspektor}
                      </div>
                      <div className="flex items-center text-gray-500 text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDate(temuan.createdAt)}
                      </div>
                    </div>
                  </td>
                  {!isRabut && (
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {temuan.periode_ke}
                      </span>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
            {/* Section defect footer */}
            <tfoot>
              <tr className="bg-orange-50 border-t-2 border-orange-200">
                <td
                  colSpan={isRabut ? 4 : 4}
                  className="px-4 py-2 text-right text-sm font-semibold text-orange-800"
                >
                  Section Total Defects:
                </td>
                <td className="px-4 py-2 text-sm font-bold text-orange-900">
                  {totalDefects.toLocaleString('id-ID')}
                </td>
                <td colSpan={isRabut ? 1 : 2} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white w-full p-5">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 w-full min-h-screen ">
      <div className=" mx-auto">
        <div className="mb-6">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date {startDate || endDate ? '*' : ''}
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={handleStartDateChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date {startDate || endDate ? '*' : ''}
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={handleEndDateChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    JO Number {!startDate && !endDate ? '*' : ''}
                  </label>
                  <input
                    type="text"
                    value={joNumber}
                    onChange={handleJoNumberChange}
                    placeholder="Enter JO number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center transition-colors"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Apply Filters
                  </button>
                </div>
              </div>

              {/* Filter instructions */}
              <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="font-medium text-blue-800 mb-1">
                  Filter Rules:
                </div>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>Filter by JO Number only: Leave both dates empty</li>
                  <li>
                    Filter by date range: Fill both Start Date and End Date (JO
                    Number optional)
                  </li>
                  <li>If you fill one date, you must fill both dates</li>
                </ul>
              </div>
            </form>

            {/* Search */}
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by JO, IO, or item name..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <XCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Results */}
        {filteredData.length === 0 &&
          !loading &&
          !error &&
          data.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No data loaded</p>
              <p className="text-gray-400 text-sm">
                Use the filters above to search for quality control findings
              </p>
            </div>
          )}

        {filteredData.length === 0 && !loading && !error && data.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              No data found. Try adjusting your search terms.
            </p>
          </div>
        )}

        {/* JO Cards with clear separation */}
        <div className="space-y-8">
          {filteredData?.map((item, index) => {
            const summary = getJOSummary(item);
            const grandTotalTemuan = summary.reduce((s, x) => s + x.count, 0);
            const grandTotalDefects = summary.reduce(
              (s, x) => s + x.totalDefects,
              0,
            );
            const hasFindings = summary.length > 0;

            return (
              <div
                key={item.no_jo || index}
                className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
              >
                {/* JO Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2 flex items-center">
                        <Package className="w-6 h-6 mr-2" />
                        Job Order: {item.no_jo}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-blue-100 mb-4">
                        <div className="flex items-center">
                          <span className="font-medium">IO Number:</span>
                          <span className="ml-2 bg-blue-500 bg-opacity-50 px-2 py-1 rounded">
                            {item.no_io}
                          </span>
                        </div>
                        <div className="flex items-center col-span-2">
                          <span className="font-medium">Item:</span>
                          <span className="ml-2 bg-blue-500 bg-opacity-50 px-2 py-1 rounded">
                            {item.item}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium">Customer:</span>
                          <span className="ml-2 bg-blue-500 bg-opacity-50 px-2 py-1 rounded">
                            {getCustomerFromSections(item)}
                          </span>
                        </div>
                      </div>

                      {/* Summary strip — only when there are findings */}
                      {hasFindings && (
                        <div className="mt-1">
                          <div className="text-xs font-semibold text-blue-200 uppercase tracking-wider mb-2">
                            Summary by Section
                          </div>
                          <div className="flex flex-wrap gap-2 items-center">
                            {summary.map((s) => (
                              <div
                                key={s.section}
                                className="bg-white bg-opacity-15 rounded-lg px-3 py-1.5 text-xs"
                              >
                                <span className="font-semibold text-white">
                                  {getSectionDisplayName(s.section)}
                                </span>
                                <span className="text-blue-200 mx-1">·</span>
                                <span className="text-blue-100">
                                  {s.count} temuan
                                </span>
                                <span className="text-blue-200 mx-1">·</span>
                                <span className="text-orange-300 font-semibold">
                                  {s.totalDefects.toLocaleString('id-ID')}{' '}
                                  defect
                                </span>
                              </div>
                            ))}

                            {/* Grand total */}
                            <div className="bg-orange-500 bg-opacity-80 rounded-lg px-3 py-1.5 text-xs ml-auto">
                              <span className="font-bold text-white">
                                Total: {grandTotalTemuan} temuan ·{' '}
                                {grandTotalDefects.toLocaleString('id-ID')}{' '}
                                defect
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="text-right ml-4">
                      <div className="text-3xl font-bold opacity-75">
                        #{index + 1}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Inspection Results */}
                <div className="p-6">
                  {!hasFindings ? (
                    <div className="text-center py-8">
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">
                        No Quality Issues Found
                      </h4>
                      <p className="text-gray-600">
                        This job order passed all quality inspections without
                        any findings.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {renderTemuanTable('cetak', item.cetak)}
                      {renderTemuanTable('coating', item.coating)}
                      {renderTemuanTable('lem', item.lem)}
                      {renderTemuanTable('pond', item.pond)}
                      {renderTemuanTable('sampling_rabut', item.sampling_rabut)}
                      {/* sortir_rs intentionally not rendered */}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default RekapTemuanQC;
