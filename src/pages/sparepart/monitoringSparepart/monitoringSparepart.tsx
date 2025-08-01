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
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshData, setRefreshData] = useState(false);

  useEffect(() => {
    getMasterSparepart();
  }, [refreshData]);

  async function getMasterSparepart() {
    setLoading(true);
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
    } finally {
      setLoading(false);
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

  const handleAddSuccess = () => {
    setShowAddModal(false);
    setRefreshData(!refreshData);
  };

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
                disabled={loading}
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
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-green-600 text-white font-semibold text-sm rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
                disabled={loading}
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
              </button>
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
              {loading ? (
                <tr>
                  <td colSpan={12} className="py-4 text-center">
                    <div className="flex justify-center items-center">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="ml-2 text-gray-600">
                        Loading data...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                <>
                  {filteredData.map((data, index) => {
                    // Calculate if the row should be red (sisa_umur <= 10% of actual_umur)
                    const sisaUmur = parseInt(data.sisa_umur.toString()) || 0;
                    const actualUmur =
                      parseInt(data.actual_umur.toString()) || 1; // Prevent division by zero
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
                        <td className="py-2 px-2 text-xs">
                          {data.nama_sparepart}
                        </td>
                        <td className="py-2 px-2 text-xs">
                          {data.mesin.nama_mesin}
                        </td>
                        <td className="py-2 px-2 text-xs">
                          {data.posisi_part}
                        </td>
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
                      <td
                        colSpan={12}
                        className="py-4 text-center text-gray-500"
                      >
                        No sparepart data found
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Add Sparepart Modal */}
        {showAddModal && (
          <AddStockLifetimeModal
            onClose={() => setShowAddModal(false)}
            onSuccess={handleAddSuccess}
          />
        )}
      </>
    </DefaultLayout>
  );
}

// Add Sparepart Modal Component
function AddStockLifetimeModal({
  onClose,
  onSuccess,
}: {
  onClose: any;
  onSuccess: any;
}) {
  const [mesin, setMesin] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOptionSelected, setIsOptionSelected] = useState<boolean>(false);
  const [masterSparepart, setMasterSparepart] = useState<any>(null);
  const [showSparepartModal, setShowSparepartModal] = useState(false);
  const [sparepartSearch, setSparepartSearch] = useState('');

  // Selected sparepart info
  const [idSparepart, setIdSparepart] = useState<string>('');
  const [namaSparepartSelect, setNamaSparepartSelect] = useState<string>('');
  const [gradeSelect, setGradeSelect] = useState<string>('');
  const [umurSelect, setUmurSelect] = useState<string>('');

  // Form values
  const [formValues, setFormValues] = useState({
    posisi_part: '',
    tgl_pasang: '',
    tgl_rusak: '',
    keterangan: '',
  });

  useEffect(() => {
    getMesin();
  }, []);

  async function getMesin() {
    setLoading(true);
    const url = `${import.meta.env.VITE_API_LINK}/master/mesin`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });
      setMesin(res.data);
    } catch (error) {
      console.error('Error fetching mesin:', error);
    } finally {
      setLoading(false);
    }
  }

  async function getMasterSparepart(id_mesin: string) {
    setLoading(true);
    const url = `${import.meta.env.VITE_API_LINK}/stokSparepart`;
    try {
      const res = await axios.get(url, {
        params: {
          id_mesin: id_mesin,
        },
        withCredentials: true,
      });
      setMasterSparepart(res.data);
    } catch (error) {
      console.error('Error fetching sparepart data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function addItem() {
    if (!validateForm()) return;

    setIsSubmitting(true);
    const url = `${import.meta.env.VITE_API_LINK}/master/sparepart`;
    try {
      await axios.post(
        url,
        {
          jenis_part: 'ganti',
          id_stok: idSparepart,
          posisi_part: formValues.posisi_part,
          tgl_pasang: formValues.tgl_pasang,
          tgl_rusak: formValues.tgl_rusak || null,
          keterangan: formValues.keterangan,
        },
        {
          withCredentials: true,
        },
      );
      onSuccess();
    } catch (error: any) {
      alert(error.response?.data?.msg || 'Failed to add item');
    } finally {
      setIsSubmitting(false);
    }
  }

  const validateForm = () => {
    if (!idSparepart) {
      alert('Please select a sparepart');
      return false;
    }
    if (!formValues.posisi_part) {
      alert('Position is required');
      return false;
    }
    if (!formValues.tgl_pasang) {
      alert('Installation date is required');
      return false;
    }
    if (!formValues.keterangan) {
      alert('Description is required');
      return false;
    }
    return true;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const selectSparepart = (item: any) => {
    setIdSparepart(item.id);
    setNamaSparepartSelect(item.nama_sparepart);
    setGradeSelect(item.grade);
    setUmurSelect(item.umur_sparepart);
    setShowSparepartModal(false);
  };

  const filteredSpareparts = masterSparepart?.filter(
    (item: any) =>
      item.nama_sparepart
        .toLowerCase()
        .includes(sparepartSearch.toLowerCase()) ||
      item.kode.toLowerCase().includes(sparepartSearch.toLowerCase()) ||
      item.lokasi.toLowerCase().includes(sparepartSearch.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-lg font-semibold text-primary">
            Add Sparepart Item
          </h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Sparepart Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pilih Sparepart<span className="text-red-500">*</span>
              </label>
              <button
                onClick={() => setShowSparepartModal(true)}
                className="w-full h-10 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm font-medium flex items-center justify-center"
                disabled={loading || isSubmitting}
              >
                {namaSparepartSelect || 'PILIH SPAREPART'}
              </button>
            </div>

            {/* Grade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grade
              </label>
              <input
                readOnly
                value={gradeSelect}
                className="w-full h-10 px-3 rounded border border-gray-300 bg-gray-50"
              />
            </div>

            {/* Umur */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Umur
              </label>
              <input
                readOnly
                value={umurSelect}
                className="w-full h-10 px-3 rounded border border-gray-300 bg-gray-50"
              />
            </div>

            {/* Posisi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Posisi<span className="text-red-500">*</span>
              </label>
              <input
                name="posisi_part"
                value={formValues.posisi_part}
                onChange={handleChange}
                className="w-full h-10 px-3 rounded border border-gray-300"
                disabled={isSubmitting}
              />
            </div>

            {/* Tanggal Pasang */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Pasang<span className="text-red-500">*</span>
              </label>
              <input
                name="tgl_pasang"
                type="date"
                value={formValues.tgl_pasang}
                onChange={handleChange}
                className="w-full h-10 px-3 rounded border border-gray-300"
                disabled={isSubmitting}
              />
            </div>

            {/* Tanggal Rusak */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Rusak
              </label>
              <input
                name="tgl_rusak"
                type="date"
                value={formValues.tgl_rusak}
                onChange={handleChange}
                className="w-full h-10 px-3 rounded border border-gray-300"
                disabled={isSubmitting}
              />
            </div>

            {/* Keterangan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Keterangan<span className="text-red-500">*</span>
              </label>
              <input
                name="keterangan"
                value={formValues.keterangan}
                onChange={handleChange}
                className="w-full h-10 px-3 rounded border border-gray-300"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-center mt-6">
            <button
              onClick={addItem}
              disabled={isSubmitting}
              className="bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded-md font-medium text-sm"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </div>
              ) : (
                'SAVE'
              )}
            </button>
          </div>
        </div>

        {/* Sparepart Selection Modal */}
        {showSparepartModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
              <div className="flex justify-between items-center border-b p-4">
                <h3 className="text-lg font-medium text-primary">
                  Select Sparepart
                </h3>
                <button
                  onClick={() => setShowSparepartModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="p-4">
                <div className="flex gap-4 mb-4">
                  {/* Mesin Select */}
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        getMasterSparepart(e.target.value);
                        setIsOptionSelected(true);
                      }
                    }}
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-md bg-blue-50 text-sm"
                    disabled={loading}
                  >
                    <option value="" disabled selected>
                      SELECT MESIN
                    </option>
                    {mesin?.map((data: any, i: number) => (
                      <option key={i} value={data.id}>
                        {data.nama_mesin}
                      </option>
                    ))}
                  </select>

                  {/* Search Input */}
                  <div className="relative w-1/2">
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-blue-50 text-sm"
                      placeholder="Search Sparepart..."
                      value={sparepartSearch}
                      onChange={(e) => setSparepartSearch(e.target.value)}
                      disabled={loading}
                    />
                    <svg
                      className="w-4 h-4 absolute right-3 top-3 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Sparepart Table */}
                <div className="border rounded-md overflow-hidden max-h-[400px] overflow-y-auto">
                  {loading ? (
                    <div className="flex justify-center items-center h-24">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="ml-2 text-gray-600">Loading...</span>
                    </div>
                  ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Kode
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Nama Sparepart
                          </th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                            Grade
                          </th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                            Umur
                          </th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                            Lokasi
                          </th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredSpareparts?.length > 0 ? (
                          filteredSpareparts.map((item: any, i: number) => (
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="px-3 py-2 text-xs">{item.kode}</td>
                              <td className="px-3 py-2 text-xs">
                                {item.nama_sparepart}
                              </td>
                              <td className="px-3 py-2 text-xs text-center">
                                {item.grade}
                              </td>
                              <td className="px-3 py-2 text-xs text-center">
                                {item.umur_sparepart}
                              </td>
                              <td className="px-3 py-2 text-xs text-center">
                                {item.lokasi}
                              </td>
                              <td className="px-3 py-2 text-xs text-center">
                                <button
                                  onClick={() => selectSparepart(item)}
                                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
                                >
                                  Select
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={6}
                              className="px-3 py-4 text-sm text-center text-gray-500"
                            >
                              {masterSparepart === null
                                ? 'Please select a machine'
                                : 'No spareparts found'}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MonitoringSparepart;
