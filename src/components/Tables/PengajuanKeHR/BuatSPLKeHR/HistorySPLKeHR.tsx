import React, { useEffect, useState } from 'react';
import axios from 'axios';
import convertTimeStampToDate from '../../../../utils/converDateTime';
import Loading from '../../../Loading';
import convertTimeStampToDateTime from '../../../../utils/converDateTime';
import ModalKosongan from '../../../Modals/Qc/NCR/NCRResponQC';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Select from 'react-select';
import * as XLSX from 'xlsx';

function HistorySPLkeHR() {
  const [isLoading, setIsLoading] = useState(false);
  const [lembur, seLembur] = useState<any>();
  const [page, setPage] = useState(1);
  const [userList, setUserList] = useState<any>();
  const [idKaryawan, setIdKaryawan] = useState<any>([]);
  const [options, setOptions] = useState([]);

  // Filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState<any>([]);

  // Department, role, divisi_bawahan states
  const [idDepartment, setIdDepartment] = useState<any>(null);
  const [role, setRole] = useState<string>('');
  const [divisiBawahan, setDivisiBawahan] = useState<any>(null);

  const [idPengaju, setIdPengaju] = useState<any>();

  useEffect(() => {
    getMe();
  }, [page]);

  useEffect(() => {
    if (idDepartment) {
      getMasterUser(idDepartment, divisiBawahan);
    }
  }, [page]);

  async function getMe() {
    const url = `${import.meta.env.VITE_API_LINK}/me`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });
      console.log('res me', res.data);
      const dept = res?.data.karyawan.biodata_karyawan[0]?.id_department;
      const userRole = res?.data.role;
      const userDivisiBawahan = res?.data.divisi_bawahan;

      setIdPengaju(dept);
      setIdDepartment(dept);
      setRole(userRole);
      setDivisiBawahan(userDivisiBawahan);

      getIzin(dept, userDivisiBawahan);
      getMasterUser(dept, userDivisiBawahan);

      console.log('getme', res.data);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  async function getIzin(idDept: any, userDivisiBawahan?: any) {
    const url = `${import.meta.env.VITE_API_LINK}/hr/pengajuanLembur`;
    try {
      setIsLoading(true);

      const params: any = {
        status_tiket: 'history',
        page: page,
        limit: 10,
        id_department: idDept,
      };

      // if (
      //   userDivisiBawahan !== null &&
      //   userDivisiBawahan !== undefined &&
      //   userDivisiBawahan !== ''
      // ) {
      //   params.divisi_bawahan = userDivisiBawahan;
      // }

      // Add filters if they exist
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (idKaryawan.length > 0) params.id_karyawan = idKaryawan.join(',');

      const res = await axios.get(url, {
        params,
        withCredentials: true,
      });
      setIsLoading(false);
      seLembur(res.data);
      console.log(res.data);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }

  async function getMasterUser(idDept: any, userDivisiBawahan?: any) {
    const url = `${import.meta.env.VITE_API_LINK}/hr/karyawan`;
    try {
      const params: any = {
        is_active: true,
        id_department: idDept,
      };

      // if (
      //   userDivisiBawahan !== null &&
      //   userDivisiBawahan !== undefined &&
      //   userDivisiBawahan !== ''
      // ) {
      //   params.divisi_bawahan = userDivisiBawahan;
      // }

      const res = await axios.get(url, {
        params,
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

  const handleChangePointKaryawan = (selectedOptions: any) => {
    const selectedIds = selectedOptions.map((option: any) => option.value);
    const filteredData = userList.filter((item: any) =>
      selectedIds.includes(item.userid),
    );
    console.log('Selected Users:', filteredData);
    setIdKaryawan(filteredData.map((user: any) => user.userid));
    setSelectedEmployees(selectedOptions);
  };

  const handleApplyFilters = () => {
    setPage(1);
    getIzin(idDepartment, divisiBawahan);
  };

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setIdKaryawan([]);
    setSelectedEmployees([]);
    setPage(1);
    setTimeout(() => getIzin(idDepartment, divisiBawahan), 100);
  };

  const exportToExcel = () => {
    if (!lembur?.data || lembur.data.length === 0) {
      alert('No data to export');
      return;
    }

    const excelData = lembur.data.map((item: any, index: number) => ({
      No: index + 1,
      'Nama Personnel': item.karyawan?.name || '',
      Department:
        item.karyawan_pengaju?.biodata_karyawan[0]?.department
          ?.nama_department || '',
      Supervisor: item.karyawan_pengaju?.name || '',
      'Tanggal Pengajuan': convertTimeStampToDate(item.createdAt),
      Dari: convertTimeStampToDateTime(item.dari),
      Sampai: convertTimeStampToDateTime(item.sampai),
      Dari2: convertTimeStampToDateTime(item.dari_2),
      Sampai2: convertTimeStampToDateTime(item.sampai_2),
      'Lama Lembur (Jam)': item.lama_lembur,
      'Lama Lembur Aktual (Jam)': item.lama_lembur_aktual || '',
      'Target Lembur': item.target_lembur || '',
      'Alasan Lembur': item.alasan_lembur || '',
      'No. JO': item.jo_lembur || '',
      Status: item.status.toUpperCase(),
      'Yang Menyetujui': item.karyawan_hr?.name || '',
      'Catatan HR': item.catatan_hr || '',
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

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
    XLSX.utils.book_append_sheet(wb, ws, 'Data Lembur');
    const currentDate = new Date().toISOString().split('T')[0];
    let filename = 'Data_Lembur';

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

          {/* Data Table */}
          <div className="w-full h-full flex-col border-b-8 border-[#D8EAFF]">
            <div className="grid grid-cols-12 px-10 py-4 border-b-8 border-[#D8EAFF] gap-2 bg-gray-50">
              <label className="text-neutral-500 text-sm font-semibold">
                No
              </label>
              <label className="text-neutral-500 text-sm font-semibold col-span-3">
                Tanggal
              </label>
              <label className="text-neutral-500 text-sm font-semibold">
                Lama
              </label>
              <label className="text-neutral-500 text-sm font-semibold col-span-2">
                Department
              </label>
              <label className="text-neutral-500 text-sm font-semibold col-span-2">
                Personnel
              </label>
              <label className="text-neutral-500 text-sm font-semibold col-span-2">
                Status
              </label>
            </div>
            <div className="w-2 h-full"></div>
            {lembur?.data?.map((data: any, i: any) => {
              const tanggal = convertTimeStampToDate(data.createdAt);
              return (
                <div
                  key={data.id || i}
                  className="grid grid-cols-12 border-b-8 border-[#D8EAFF] gap-2 items-center px-10"
                >
                  <label className="text-neutral-500 text-sm font-semibold">
                    {(page - 1) * 10 + i + 1}
                  </label>

                  <div className="flex flex-col gap-1 col-span-3">
                    <label className="text-neutral-500 text-sm font-semibold ">
                      Dari : {convertTimeStampToDateTime(data.dari)}
                    </label>
                    <label className="text-neutral-500 text-sm font-semibold ">
                      Sampai :{convertTimeStampToDateTime(data.sampai)}
                    </label>
                    {data.dari_2 && data.dari_2 !== '' && (
                      <label className="text-neutral-500 text-sm font-semibold ">
                        Dari (2) : {convertTimeStampToDateTime(data.dari_2)}
                      </label>
                    )}
                    {data.sampai_2 && data.sampai_2 !== '' && (
                      <label className="text-neutral-500 text-sm font-semibold ">
                        Sampai (2) :{convertTimeStampToDateTime(data.sampai_2)}
                      </label>
                    )}
                  </div>
                  <label className="text-neutral-500 text-sm font-semibold">
                    {data.lama_lembur} Jam
                  </label>
                  <label className="text-neutral-500 text-sm font-semibold col-span-2">
                    {
                      data.karyawan_pengaju?.biodata_karyawan[0]?.department
                        ?.nama_department
                    }
                  </label>
                  <label className="text-neutral-500 text-sm font-semibold col-span-2">
                    {data.karyawan?.name}
                  </label>
                  <label className="text-neutral-500 text-sm font-semibold uppercase">
                    {data.status}
                  </label>
                  <div className="justify-end flex pr-2 col-span-2">
                    <button
                      onClick={() => openModalModal(i)}
                      className="uppercase px-3 inline-flex rounded-[3px] items-center text-white text-xs font-bold py-2 my-2 hover:bg-blue-400 border bg-blue-600 border-blue-600 justify-center"
                    >
                      Detail
                    </button>
                    {showModal[i] == true && (
                      <ModalKosongan
                        isOpen={showModal[i]}
                        onClose={() => closeModalModal(i)}
                        judul={'Permohonan Lembur'}
                      >
                        <div className="grid grid-cols-2 gap-2 px-4 py-4">
                          <div className="flex flex-col">
                            <label
                              htmlFor=""
                              className="text-black text-xs font-bold"
                            >
                              Status
                            </label>
                            <label
                              htmlFor=""
                              className="text-[#016ae6] uppercase text-xl font-normal"
                            >
                              {data.status}
                            </label>
                          </div>
                          <div className="flex flex-col">
                            <label
                              htmlFor=""
                              className="text-black text-xs font-bold"
                            >
                              Yang Menyetujui
                            </label>
                            <label
                              htmlFor=""
                              className="text-[#016ae6] uppercase text-xl font-normal"
                            >
                              {data.karyawan_hr?.name}
                            </label>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 px-4 py-4">
                          <div className="flex flex-col gap-2">
                            <div className="flex flex-col">
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
                            <div className="flex flex-col">
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
                                  data.karyawan_pengaju?.biodata_karyawan[0]
                                    ?.department?.nama_department
                                }
                              </label>
                            </div>
                            <div className="flex flex-col">
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
                            <div className="flex flex-col">
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
                          <div className="flex flex-col gap-2">
                            <div className="flex flex-col">
                              <label
                                htmlFor=""
                                className="text-black text-xs font-bold"
                              >
                                LAMA LEMBUR
                              </label>
                              <label
                                htmlFor=""
                                className="text-[#016ae6] text-xl font-normal"
                              >
                                {data.lama_lembur} JAM
                              </label>
                            </div>
                            <div className="flex flex-col">
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
                            <div className="flex flex-col">
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
                            {data.dari_2 && data.dari_2 !== '' && (
                              <div className="flex flex-col ">
                                <label
                                  htmlFor=""
                                  className="text-black text-xs font-bold"
                                >
                                  DARI (2)
                                </label>
                                <label
                                  htmlFor=""
                                  className="text-[#016ae6] text-xl font-normal"
                                >
                                  {convertTimeStampToDateTime(data.dari_2)}
                                </label>
                              </div>
                            )}
                            {data.sampai_2 && data.sampai_2 !== '' && (
                              <div className="flex flex-col ">
                                <label
                                  htmlFor=""
                                  className="text-black text-xs font-bold"
                                >
                                  SAMPAI (2)
                                </label>
                                <label
                                  htmlFor=""
                                  className="text-[#016ae6] text-xl font-normal"
                                >
                                  {convertTimeStampToDateTime(data.sampai_2)}
                                </label>
                              </div>
                            )}
                            <div className="flex flex-col">
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
        <div className="flex items-center gap-2 mt-4">
          <Stack spacing={2}>
            <Pagination
              count={lembur?.total_page}
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

export default HistorySPLkeHR;
