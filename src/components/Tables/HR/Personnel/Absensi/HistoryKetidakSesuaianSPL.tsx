import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Loading from '../../../../Loading';
import ModalKosongan from '../../../../Modals/Qc/NCR/NCRResponQC';
import convertTimeStampToDateTime from '../../../../../utils/converDateTime';
import convertTimeStampToDate from '../../../../../utils/convertDate';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Select from 'react-select';
import * as XLSX from 'xlsx';

function HistoryKetidaksesuaianSPL() {
  const [isLoading, setIsLoading] = useState(false);
  const [openButton, setOpenButton] = useState(null);
  const [lkh, setLkh] = useState<any>();
  const [idInspektor, setIdInspektor] = useState<any>();
  const [namInspektor, setNamaInspektor] = useState<any>();
  const [page, setPage] = useState(1);
  const [userList, setUserList] = useState<any>();
  const [idKaryawan, setIdKaryawan] = useState<any>([]);
  const [options, setOptions] = useState([]);

  // Filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState<any>([]);

  useEffect(() => {
    getMe();
  }, [page]);

  async function getMe() {
    const url = `${import.meta.env.VITE_API_LINK}/me`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      setIdInspektor(res?.data.id);
      setNamaInspektor(res?.data.nama);
      getMasterUser();
      getLKH();
      console.log('getme', res.data);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  async function getLKH() {
    const url = `${import.meta.env.VITE_API_LINK}/hr/pengajuanLembur`;
    try {
      setIsLoading(true);

      // Build params object
      const params: any = {
        status_ketidaksesuaian: 'approved',
        page: page,
        limit: 10,
      };

      // Add filters if they exist
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (idKaryawan.length > 0) params.id_karyawan = idKaryawan.join(',');

      const res = await axios.get(url, {
        params,
        withCredentials: true,
      });

      setIsLoading(false);
      setLkh(res.data);
      console.log('KetidakSesuaian', res.data);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }

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
      console.log('user list', res.data.data);
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

  const handleChangePointKaryawan = (selectedOptions: any) => {
    // Extract selected IDs
    const selectedIds = selectedOptions.map((option: any) => option.value);
    // Find the corresponding user data in userList
    const filteredData = userList.filter((item: any) =>
      selectedIds.includes(item.userid),
    );
    console.log('Selected Users:', filteredData);
    // Store the selected user IDs in an array
    setIdKaryawan(filteredData.map((user: any) => user.userid));
    setSelectedEmployees(selectedOptions);
  };

  const handleApplyFilters = () => {
    setPage(1); // Reset to first page when filters are applied
    getLKH();
  };

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setIdKaryawan([]);
    setSelectedEmployees([]);
    setPage(1);
    // Trigger API call with reset filters
    setTimeout(() => getLKH(), 100);
  };

  // Add a new function specifically for export data fetching
  async function getLKHForExport() {
    const url = `${import.meta.env.VITE_API_LINK}/hr/pengajuanLembur`;
    try {
      // Build params object without page and limit
      const params: any = {
        status_ketidaksesuaian: 'approved',
        // Remove page and limit for export
      };

      // Add filters if they exist
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (idKaryawan.length > 0) params.id_karyawan = idKaryawan.join(',');

      const res = await axios.get(url, {
        params,
        withCredentials: true,
      });

      return res.data;
    } catch (error: any) {
      console.log(error);
      throw error;
    }
  }

  // Modify the export function to use the new data fetching function
  const exportToExcel = async () => {
    try {
      // Show loading state
      setIsLoading(true);

      // Fetch all data without pagination
      const exportData = await getLKHForExport();

      if (!exportData?.data || exportData.data.length === 0) {
        alert('No data to export');
        setIsLoading(false);
        return;
      }

      // Prepare data for Excel
      const excelData = exportData.data.map((item: any, index: number) => ({
        No: index + 1,
        'Nama Personnel': item.karyawan?.name || '',
        Department:
          item.karyawan_pengaju?.biodata_karyawan[0]?.department
            ?.nama_department || '',
        'Tanggal Dari': convertTimeStampToDateTime(item.dari),
        'Tanggal Sampai': convertTimeStampToDateTime(item.sampai),
        'Lama Lembur SPL (Jam)': item.lama_lembur,
        'Lama Lembur Absen (Jam)': item.lama_lembur_absen,
        'Alasan Lembur': item.alasan_lembur || '',
        'Tipe Ketidaksesuaian': item.type_ketidaksesuaian || '',
        'Catatan Ketidaksesuaian': item.catatan_ketidaksesuaian || '',
        Penanganan: item.penanganan || '',
        'Alasan Ketidaksesuaian': item.alasan_ketidaksesuaian || '',
        'No JO': item.jo_lembur || '',
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
      XLSX.utils.book_append_sheet(wb, ws, 'Data Ketidaksesuaian SPL');

      const currentDate = new Date().toISOString().split('T')[0];
      let filename = 'Data_Ketidaksesuaian_SPL';

      if (startDate && endDate) {
        filename += `_${startDate}_to_${endDate}`;
      } else if (startDate) {
        filename += `_from_${startDate}`;
      } else if (endDate) {
        filename += `_until_${endDate}`;
      }

      filename += `_exported_${currentDate}.xlsx`;

      XLSX.writeFile(wb, filename);
      setIsLoading(false);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
      setIsLoading(false);
    }
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

                {/* Employee Selection */}
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-700 mb-2">
                    Pilih Karyawan
                  </label>
                  <Select
                    isMulti
                    placeholder="Cari karyawan..."
                    options={options}
                    value={selectedEmployees}
                    onChange={handleChangePointKaryawan}
                    className="relative z-50"
                    classNamePrefix="select"
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: '42px',
                        borderColor: '#d1d5db',
                        '&:hover': {
                          borderColor: '#3b82f6',
                        },
                        '&:focus-within': {
                          borderColor: '#3b82f6',
                          boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.1)',
                        },
                      }),
                      multiValue: (base) => ({
                        ...base,
                        backgroundColor: '#dbeafe',
                        color: '#1e40af',
                      }),
                      multiValueLabel: (base) => ({
                        ...base,
                        color: '#1e40af',
                      }),
                      multiValueRemove: (base) => ({
                        ...base,
                        color: '#1e40af',
                        '&:hover': {
                          backgroundColor: '#bfdbfe',
                          color: '#1e40af',
                        },
                      }),
                    }}
                  />
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
                    className="flex items-center px-4 py-2 bg-red-500 text-white font-medium rounded-md hover:bg-gray-600 transition-colors"
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

          <div className=" w-full h-full flex-col border-b-8 border-[#D8EAFF]">
            <div className="grid grid-cols-12 px-10 py-4 border-b-8 border-[#D8EAFF] gap-2 bg-gray-50">
              <label className="text-neutral-500 text-sm font-semibold ">
                No
              </label>

              <label className="text-neutral-500 text-sm font-semibold col-span-3">
                Tanggal
              </label>
              <label className="text-neutral-500 text-sm font-semibold col-span-3">
                Lama Ketidaksesuaian
              </label>
              <label className="text-neutral-500 text-sm font-semibold col-span-2">
                Department
              </label>
              <label className="text-neutral-500 text-sm font-semibold col-span-2">
                Personnel
              </label>
            </div>
          </div>
          {lkh?.data?.map((data: any, i: number) => {
            return (
              <>
                <div className="grid grid-cols-12 border-b-8 border-[#D8EAFF] gap-2 items-center px-10">
                  <label className="text-neutral-500 text-sm font-semibold ">
                    {(page - 1) * 10 + i + 1}
                  </label>

                  <div className="flex flex-col gap-1 col-span-3">
                    <label className="text-neutral-500 text-sm font-semibold ">
                      Dari : {convertTimeStampToDateTime(data.dari)}
                    </label>
                    <label className="text-neutral-500 text-sm font-semibold ">
                      Sampai :{convertTimeStampToDateTime(data.sampai)}
                    </label>
                  </div>
                  <div className="flex flex-col gap-1 col-span-3">
                    <label className="text-neutral-500 text-sm font-semibold ">
                      Lama Lembur SPL :{data.lama_lembur} Jam
                    </label>
                    <label className="text-neutral-500 text-sm font-semibold ">
                      Lama Lembur Absen :{data.lama_lembur_absen} Jam
                    </label>
                  </div>
                  <label className="text-neutral-500 text-sm font-semibold col-span-2">
                    {
                      data.karyawan_pengaju?.biodata_karyawan[0]?.department
                        ?.nama_department
                    }
                  </label>
                  <label className="text-neutral-500 text-sm font-semibold col-span-2">
                    {data.karyawan?.name}
                  </label>
                  <div className="justify-end flex pr-2 ">
                    <>
                      <button
                        onClick={() => openModalModal(i)}
                        className={`uppercase px-3 inline-flex rounded-[3px] items-center text-white text-xs font-bold  py-2 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600  justify-center`} // Dynamic class assignment
                      >
                        DETAIL
                      </button>
                      {showModal[i] == true && (
                        <>
                          <ModalKosongan
                            isOpen={showModal[i]}
                            onClose={() => closeModalModal(i)}
                            judul={'History Permohonan Ketidaksesuaian SPL'}
                          >
                            <>
                              <div className="grid grid-cols-2 gap-2 px-4 py-4">
                                <div className="flex flex-col gap-2 ">
                                  <div className="flex flex-col ">
                                    <label
                                      htmlFor=""
                                      className="text-black text-xs font-bold"
                                    >
                                      PENGAJU
                                    </label>
                                    <label
                                      htmlFor=""
                                      className="text-[#7a7a7a] text-xl font-normal"
                                    >
                                      {
                                        data.karyawan_pengaju_ketidaksesuaian
                                          ?.biodata_karyawan[0]?.nik
                                      }{' '}
                                      -{' '}
                                      {
                                        data.karyawan_pengaju_ketidaksesuaian
                                          ?.name
                                      }{' '}
                                      -{' '}
                                      {
                                        data.karyawan_pengaju_ketidaksesuaian
                                          ?.biodata_karyawan[0]?.department
                                          ?.nama_department
                                      }
                                    </label>
                                  </div>
                                  <div className="flex flex-col ">
                                    <label
                                      htmlFor=""
                                      className="text-black text-xs font-bold"
                                    >
                                      RESPONDEN
                                    </label>
                                    <label
                                      htmlFor=""
                                      className="text-[#7a7a7a] text-xl font-normal"
                                    >
                                      {
                                        data.karyawan_respon_ketidaksesuaian
                                          ?.biodata_karyawan[0]?.nik
                                      }{' '}
                                      -{' '}
                                      {
                                        data.karyawan_respon_ketidaksesuaian
                                          ?.name
                                      }{' '}
                                      -{' '}
                                      {
                                        data.karyawan_respon_ketidaksesuaian
                                          ?.biodata_karyawan[0]?.department
                                          ?.nama_department
                                      }
                                    </label>
                                  </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2 px-4 py-4">
                                <div className="flex flex-col gap-2 ">
                                  <div className="flex flex-col ">
                                    <label
                                      htmlFor=""
                                      className="text-black text-xs font-bold"
                                    >
                                      NAMA PERSONNEL
                                    </label>
                                    <label
                                      htmlFor=""
                                      className="text-[#7a7a7a] text-xl font-normal"
                                    >
                                      {data.karyawan?.name}
                                    </label>
                                  </div>
                                  <div className="flex flex-col ">
                                    <label
                                      htmlFor=""
                                      className="text-black text-xs font-bold"
                                    >
                                      DEPARTEMEN
                                    </label>
                                    <label
                                      htmlFor=""
                                      className="text-[#7a7a7a] text-xl font-normal"
                                    >
                                      {
                                        data.karyawan_pengaju
                                          ?.biodata_karyawan[0]?.department
                                          ?.nama_department
                                      }
                                    </label>
                                  </div>
                                  <div className="flex flex-col ">
                                    <label
                                      htmlFor=""
                                      className="text-black text-xs font-bold"
                                    >
                                      TANGGAL
                                    </label>
                                    <label
                                      htmlFor=""
                                      className="text-[#7a7a7a] text-xl font-normal"
                                    >
                                      {convertTimeStampToDate(data.createdAt)}
                                    </label>
                                  </div>
                                  <div className="flex flex-col ">
                                    <label
                                      htmlFor=""
                                      className="text-black text-xs font-bold"
                                    >
                                      SUPERVISOR
                                    </label>
                                    <label
                                      htmlFor=""
                                      className="text-[#7a7a7a] text-xl font-normal"
                                    >
                                      {data.karyawan_pengaju?.name}
                                    </label>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-2 ">
                                  <div className="flex flex-col ">
                                    <label
                                      htmlFor=""
                                      className="text-black text-xs font-bold"
                                    >
                                      LAMA LEMBUR SPL
                                    </label>
                                    <label
                                      htmlFor=""
                                      className="text-[#016ae6] text-xl font-normal"
                                    >
                                      {data.lama_lembur} JAM
                                    </label>
                                  </div>
                                  <div className="flex flex-col ">
                                    <label
                                      htmlFor=""
                                      className="text-black text-xs font-bold"
                                    >
                                      LAMA LEMBUR ABSEN
                                    </label>
                                    <label
                                      htmlFor=""
                                      className="text-[#016ae6] text-xl font-normal"
                                    >
                                      {data.lama_lembur_absen} JAM
                                    </label>
                                  </div>
                                  <div className="flex flex-col ">
                                    <label
                                      htmlFor=""
                                      className="text-black text-xs font-bold"
                                    >
                                      DARI
                                    </label>
                                    <label
                                      htmlFor=""
                                      className="text-[#016ae6] text-xl font-normal"
                                    >
                                      {convertTimeStampToDateTime(data.dari)}
                                    </label>
                                  </div>
                                  <div className="flex flex-col ">
                                    <label
                                      htmlFor=""
                                      className="text-black text-xs font-bold"
                                    >
                                      SAMPAI
                                    </label>
                                    <label
                                      htmlFor=""
                                      className="text-[#016ae6] text-xl font-normal"
                                    >
                                      {convertTimeStampToDateTime(data.sampai)}
                                    </label>
                                  </div>
                                  <div className="flex flex-col ">
                                    <label
                                      htmlFor=""
                                      className="text-black text-xs font-bold"
                                    >
                                      NO. JO
                                    </label>
                                    <label
                                      htmlFor=""
                                      className="text-[#016ae6] text-xl font-normal"
                                    >
                                      {data.jo_lembur}
                                    </label>
                                  </div>
                                  <div className="flex flex-col ">
                                    <label
                                      htmlFor=""
                                      className="text-black text-xs font-bold"
                                    >
                                      CATATAN KETIDAKSESUAIAN
                                    </label>
                                    <label
                                      htmlFor=""
                                      className="text-[#016ae6] text-xl font-normal"
                                    >
                                      {data.catatan_ketidaksesuaian}
                                    </label>
                                  </div>
                                  <div className="flex flex-col ">
                                    <label
                                      htmlFor=""
                                      className="text-black text-xs font-bold"
                                    >
                                      TIPE KETIDAKSESUAIAN
                                    </label>
                                    <label
                                      htmlFor=""
                                      className="text-[#016ae6] text-xl font-normal uppercase"
                                    >
                                      {data.type_ketidaksesuaian}
                                    </label>
                                  </div>
                                  <div className="flex flex-col ">
                                    <label
                                      htmlFor=""
                                      className="text-black text-xs font-bold"
                                    >
                                      PENANGANAN
                                    </label>
                                    <label
                                      htmlFor=""
                                      className="text-[#016ae6] text-xl font-normal uppercase"
                                    >
                                      {data.penanganan}
                                    </label>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col w-full px-4">
                                <label
                                  htmlFor=""
                                  className="text-black text-xs font-bold"
                                >
                                  ALASAN LEMBUR
                                </label>
                                <label
                                  htmlFor=""
                                  className="text-[#7a7a7a] text-xl font-normal"
                                >
                                  {data.alasan_lembur}
                                </label>
                              </div>
                              <div className="flex flex-col w-full px-4 ">
                                <label
                                  htmlFor=""
                                  className="text-black text-xs font-bold"
                                >
                                  ALASAN KETIDAKSESUAIAN{' '}
                                  <span className="text-red-600">*</span>
                                </label>
                                <textarea
                                  readOnly
                                  defaultValue={data.alasan_ketidaksesuaian}
                                  className="peer h-full min-h-[100px] w-full resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                                ></textarea>
                              </div>
                            </>
                          </ModalKosongan>
                        </>
                      )}
                    </>
                  </div>
                </div>
              </>
            );
          })}
        </div>

        {/* Pagination */}
        <div className="flex items-center gap-2 mt-4">
          <Stack spacing={2}>
            <Pagination
              count={lkh?.total_page}
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

export default HistoryKetidaksesuaianSPL;
