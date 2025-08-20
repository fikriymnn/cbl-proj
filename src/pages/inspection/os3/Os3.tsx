import { useEffect, useState } from 'react';
import Burger from '../../../images/icon/burger.svg';
import Arrow from '../../../images/icon/arrowDown.svg';
import Polygon6 from '../../../images/icon/Polygon6.svg';
import X from '../../../images/icon/x.svg';
import axios from 'axios';
import ModalMtcDate from '../../../components/Modals/ModalMtcDate';
import ModalDetailOS3 from '../../../components/Modals/ModalDetailOS3';
import ModalStockCheckOs3 from '../../../components/Modals/ModalStockCheckOs3';
import React from 'react';
import { Stack, Pagination } from '@mui/material';
import Select from 'react-select';
import convertDateToTime from '../../../utils/converDateToTime';

function TableOS3() {
  const [tiket, setTiket] = useState<any>(null);
  const [showTwoButtons, setShowTwoButtons] = useState<any>([]);
  const [showModal1, setShowModal1] = useState<any>([]);
  const [showModal2, setShowModal2] = useState(false);
  const [showModalDetail, setShowModalDetail] = useState<any>([]);
  const [showDetail, setShowDetail] = useState<boolean[]>([]);
  const [user, setUser] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [mesinNama, setMesinNama] = useState('');
  const [statusTiket, setStatusTiket] = useState('');
  const [noJo, setNoJo] = useState('');
  const [masterMesin, setmasterMesin] = useState<any>(null);
  const [options, setOptions] = useState<any>([]);
  const [userList, setUserList] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const calculateResponTime = (startDate: any, endDate: any) => {
    const createdAtDate = new Date(startDate);
    const waktuResponDate = new Date(endDate);
    const millisecondsDiff =
      waktuResponDate.getTime() - createdAtDate.getTime();

    const secondsDiff = millisecondsDiff / 1000;
    const minutesDiff = Math.floor(secondsDiff / 60);
    const hoursDiff = Math.floor(minutesDiff / 60);

    return `${hoursDiff ? hoursDiff + ' hours ' : ''}${
      hoursDiff >= 1 ? '' : minutesDiff + ' minutes '
    }`;
  };

  const convertDatetimeToDate = (datetime: any) => {
    const dateObject = new Date(datetime);
    const day = dateObject.getDate().toString().padStart(2, '0');
    const month = (dateObject.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObject.getFullYear();
    const hours = dateObject.getHours().toString().padStart(2, '0');
    const minutes = dateObject.getMinutes().toString().padStart(2, '0');

    return `${year}/${month}/${day}  ${hours}:${minutes}`;
  };

  const getStatusStyle = (status: string) => {
    const baseClasses =
      'text-xs px-2 font-light rounded-xl flex justify-center';

    switch (status) {
      case 'pending':
        return `${baseClasses} text-[#DE0000] bg-[#FFB1B1]`;
      case 'open':
        return `${baseClasses} text-[#FCBF11] bg-[#FFF2B1]`;
      case 'monitoring':
        return `${baseClasses} text-[#004CDE] bg-[#B1ECFF]`;
      case 'temporary':
        return `${baseClasses} text-[#FC4911] bg-[#de85002a]`;
      default:
        return baseClasses;
    }
  };

  const getProgressStyle = (skor: number) => {
    const baseClasses =
      'text-xs px-2 font-light rounded-xl flex justify-center';

    if (skor === 100) {
      return `${baseClasses} text-[#0057FF] bg-[#B1ECFF]`;
    } else if (skor >= 60) {
      return `${baseClasses} text-green-600 bg-[#00de3f2f]`;
    } else if (skor >= 40) {
      return `${baseClasses} text-[#DE0000] bg-[#FFDBB1]`;
    } else if (skor >= 0) {
      return `${baseClasses} text-[#DE0000] bg-[#FFB1B1]`;
    }
    return baseClasses;
  };

  const getSourceData = (data: any, field: string) => {
    const sourceMap = {
      pm1: data.point_pm1,
      pm2: data.point_pm2,
      pm3: data.point_pm3,
    };

    const source = sourceMap[data.sumber as keyof typeof sourceMap];
    if (!source) return '';

    switch (field) {
      case 'hasil':
        return source.hasil;
      case 'catatan':
        return source.catatan;
      case 'inspection_point':
        return source.inspection_point;
      case 'acceptance_criteria':
        return (
          source[`inspection_task_${data.sumber}s`]?.[0]?.acceptance_criteria ||
          ''
        );
      case 'method':
        return source[`inspection_task_${data.sumber}s`]?.[0]?.method || '';
      case 'tools':
        return source[`inspection_task_${data.sumber}s`]?.[0]?.tools || '';
      case 'task':
        return source[`inspection_task_${data.sumber}s`]?.[0]?.task || '';
      default:
        return '';
    }
  };

  const handleClick = (i: number) => {
    setShowTwoButtons((prev: any) =>
      prev.map((item: boolean, index: number) => (index === i ? !item : false)),
    );
  };

  const handleClickDetail = (index: number) => {
    setShowDetail((prevState) => {
      const updatedShowDetail = [...prevState];
      updatedShowDetail[index] = !updatedShowDetail[index];
      return updatedShowDetail;
    });
  };

  const openModal1 = (i: number) => {
    const onchangeVal = [...showModal1];
    onchangeVal[i] = true;
    setShowModal1(onchangeVal);
  };

  const closeModal1 = (i: number) => {
    const onchangeVal = [...showModal1];
    onchangeVal[i] = false;
    setShowModal1(onchangeVal);
  };

  const openModal2 = () => setShowModal2(true);
  const closeModal2 = () => setShowModal2(false);

  const openModalDetail = (i: number) => {
    const onchangeVal = [...showModalDetail];
    onchangeVal[i] = true;
    setShowModalDetail(onchangeVal);
  };

  const closeModalDetail = (i: number) => {
    const onchangeVal = [...showModalDetail];
    onchangeVal[i] = false;
    setShowModalDetail(onchangeVal);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  };

  const handleChangePointDepatment = (selectedOption: any) => {
    setSelectedUser(selectedOption);
  };

  const getUser = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_LINK}/me`, {
        withCredentials: true,
      });
      setUser(res.data);
    } catch (error: any) {
      console.log(error.response);
    }
  };

  const getTiket = async () => {
    const url = `${import.meta.env.VITE_API_LINK}/ticketOs3?bagian_tiket=os3`;
    try {
      const params: any = {
        page: page,
        limit: limit,
      };

      // Add filters if they have values
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (mesinNama) params.mesin = mesinNama;
      if (statusTiket) params.status_tiket = statusTiket;
      if (noJo) params.search = noJo;
      if (selectedUser?.value) params.id_eksekutor = selectedUser.value;

      const res = await axios.get(url, {
        params: params,
        withCredentials: true,
      });
      console.log(params);
      setTiket(res.data);

      const initialState = new Array(res.data.data.length).fill(false);
      setShowModal1(initialState);
      setShowModalDetail(initialState);
      setShowTwoButtons(initialState);
      setShowDetail(initialState);
      console.log(res.data);
    } catch (error: any) {
      console.log(error.response);
    }
  };

  async function getMasterMesin() {
    const url = `${import.meta.env.VITE_API_LINK}/master/mesin`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        withCredentials: true,
      });
      setIsLoading(false);
      setmasterMesin(res.data);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error.data.msg);
    }
  }

  async function getMasterUser() {
    const url = `${import.meta.env.VITE_API_LINK}/users`;
    try {
      const res = await axios.get(url, {
        params: {
          status: 'aktif',
          bagian: 'maintenance',
        },
        withCredentials: true,
      });

      setUserList(res.data);
      console.log('user list', res.data);
      setOptions(
        res.data.map((item: any) => {
          return {
            value: item.id,
            label: `${item.nama}`,
          };
        }),
      );
    } catch (error: any) {
      console.log(error);
    }
  }

  const responMTC = async (id: number) => {
    const url = `${import.meta.env.VITE_API_LINK}/ticketOs3/respon/${id}`;
    try {
      await axios.get(url, {
        withCredentials: true,
      });
      alert('proses berhasil');
      getTiket();
    } catch (error: any) {
      console.log(error.response);
      alert('error');
    }
  };

  const reworkTiket = async (idTiket: number) => {
    const url = `${import.meta.env.VITE_API_LINK}/ticketOs3/rework/${idTiket}`;
    try {
      const res = await axios.put(
        url,
        { id_eksekutor: user.id },
        { withCredentials: true },
      );
      alert(res.data.msg);
      getTiket();
    } catch (error: any) {
      alert(error.data.msg);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setMesinNama('');
    setStatusTiket('');
    setNoJo('');
    setSelectedUser(null);
    setPage(1);
  };

  useEffect(() => {
    getTiket();
  }, [page, limit]);

  useEffect(() => {
    getUser();
    getMasterMesin();
    getMasterUser();
  }, []);

  if (!tiket) return null;

  return (
    <main>
      {/* Filter Section - Fixed height to prevent overlapping */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
          {/* Date Range - Takes 2 columns */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex flex-col gap-2 flex-1">
                <p className="text-sm text-primary font-semibold">Dari:</p>
                <input
                  className="rounded-lg bg-blue-50 border border-blue-200 px-3 h-10 w-full focus:ring-2 focus:ring-blue-300 focus:outline-none"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <p className="text-sm text-primary font-semibold">Sampai:</p>
                <input
                  className="rounded-lg bg-blue-50 border border-blue-200 px-3 h-10 w-full focus:ring-2 focus:ring-blue-300 focus:outline-none"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Machine Filter */}
          <div className="flex flex-col gap-2">
            <p className="text-sm text-primary font-semibold">Pilih Mesin:</p>
            <select
              value={mesinNama}
              onChange={(e) => {
                setMesinNama(e.target.value);
              }}
              className="rounded-lg bg-blue-50 border border-blue-200 px-3 h-10 w-full focus:ring-2 focus:ring-blue-300 focus:outline-none"
            >
              <option value="">Pilih Mesin</option>
              {masterMesin?.map((data: any, i: any) => (
                <option
                  key={i}
                  value={data.nama_mesin}
                  className="text-gray-800 text-sm"
                >
                  {data.nama_mesin}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex flex-col gap-2">
            <p className="text-sm text-primary font-semibold">Status Tiket:</p>
            <select
              value={statusTiket}
              onChange={(e) => {
                setStatusTiket(e.target.value);
              }}
              className="rounded-lg bg-blue-50 border border-blue-200 px-3 h-10 w-full focus:ring-2 focus:ring-blue-300 focus:outline-none"
            >
              <option value="">Pilih Status Tiket</option>
              <option value="open">Open</option>
              <option value="request to qc">Request to QC</option>
              <option value="temporary">Temporary</option>
              <option value="monitoring">Monitoring</option>
            </select>
          </div>

          {/* User Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-primary font-semibold">Nama</label>
            <Select
              placeholder="Cari..."
              options={options}
              value={selectedUser}
              onChange={handleChangePointDepatment}
              isClearable
              className="rounded-lg"
              styles={{
                control: (provided) => ({
                  ...provided,
                  backgroundColor: '#EBF5FF',
                  borderColor: '#BFDBFE',
                  minHeight: '40px',
                  boxShadow: 'none',
                  '&:hover': {
                    borderColor: '#93C5FD',
                  },
                }),
              }}
            />
          </div>

          {/* Search Filter */}
          <div className="flex flex-col gap-2">
            <p className="text-sm text-primary font-semibold">Cari</p>
            <input
              className="rounded-lg bg-blue-50 border border-blue-200 px-3 h-10 w-full focus:ring-2 focus:ring-blue-300 focus:outline-none"
              placeholder="PM1 / PM2 / PM3"
              type="text"
              value={noJo}
              onChange={(e) => setNoJo(e.target.value)}
            />
          </div>
        </div>

        {/* Action Buttons - Separate row to prevent overlapping */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={() => getTiket()}
            className="bg-primary hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg transition-colors"
          >
            Tampilkan
          </button>
          <button
            onClick={resetFilters}
            className="bg-gray-500 hover:bg-gray-600 text-white font-medium px-5 py-2 rounded-lg transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white mt-2">
        <table className="w-full border-collapse">
          <thead>
            <tr className="py-2">
              <th className="px-5 text-xs font-bold text-left py-2">No</th>
              <th className="px-2 text-xs font-bold text-left py-2">
                <div className="flex gap-2 items-center">
                  <span>Kode Tiket</span>
                  <img className="w-2" src={Polygon6} alt="" />
                </div>
              </th>
              <th className="px-2 text-xs font-bold text-left py-2">
                <div className="flex gap-2 items-center">
                  <span>Sumber</span>
                  <img className="w-2" src={Polygon6} alt="" />
                </div>
              </th>
              <th className="px-2 text-xs font-bold text-left py-2">
                <div className="flex gap-2 items-center">
                  <span>Mesin</span>
                  <img className="w-2" src={Polygon6} alt="" />
                </div>
              </th>
              <th className="px-2 text-xs font-bold text-left py-2">
                <div className="flex gap-2 items-center">
                  <span>Kendala</span>
                  <img className="w-2" src={Polygon6} alt="" />
                </div>
              </th>
              <th className="px-2 text-xs font-bold text-left py-2">
                <div className="flex gap-2 items-center">
                  <span>Indikator</span>
                  <img className="w-2" src={Polygon6} alt="" />
                </div>
              </th>
              <th className="px-2 text-xs font-bold text-left py-2">Status</th>
              <th className="px-2 text-xs font-bold text-left py-2">
                Persentase
              </th>
              <th className="px-2 text-xs font-bold text-left py-2">
                Inspektor PM
              </th>
              <th className="px-2 text-xs font-bold text-left py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {tiket.data?.map((data: any, i: number) => {
              const lengthProses = data.proses_mtc_os3s.length - 1;
              const dateMtc = convertDatetimeToDate(data.createdAt);
              const waktuRespon = calculateResponTime(
                data.createdAt,
                data.waktu_respon,
              );

              // Function to get inspector name based on PM type in sumber
              const getInspectorName = (data: any) => {
                const sumber = data.sumber?.toLowerCase() || '';

                if (sumber.includes('pm1') || sumber.includes('pm 1')) {
                  return data.point_pm1?.ticket_pm1?.inspector?.nama || '-';
                } else if (sumber.includes('pm2') || sumber.includes('pm 2')) {
                  return data.point_pm2?.ticket_pm2?.inspector?.nama || '-';
                } else if (sumber.includes('pm3') || sumber.includes('pm 3')) {
                  return data.point_pm3?.ticket_pm3?.inspector?.nama || '-';
                } else {
                  // Fallback: check which PM data exists
                  if (data.point_pm1?.ticket_pm1?.inspector?.nama) {
                    return data.point_pm1.ticket_pm1.inspector.nama;
                  } else if (data.point_pm2?.ticket_pm2?.inspector?.nama) {
                    return data.point_pm2.ticket_pm2.inspector.nama;
                  } else if (data.point_pm3?.ticket_pm3?.inspector?.nama) {
                    return data.point_pm3.ticket_pm3.inspector.nama;
                  }
                  return '-';
                }
              };

              return (
                <React.Fragment key={i}>
                  <tr className="bg-white border-b-5 border-blue">
                    <td className="py-3 px-6 text-center">
                      {(page - 1) * limit + i + 1}
                    </td>

                    <td className="px-2 py-3">
                      <p className="text-xs font-light">{data.kode_ticket}</p>
                    </td>

                    <td className="px-2 py-3">
                      <p className="text-xs font-light">{data.sumber}</p>
                    </td>

                    <td className="px-2 py-3">
                      <p className="text-xs font-light">{data.nama_mesin}</p>
                    </td>

                    <td className="px-2 py-3">
                      <p className="text-xs font-light">
                        {' '}
                        {getSourceData(data, 'catatan')}
                      </p>
                    </td>

                    <td className="px-2 py-3">
                      <div className="flex items-center">
                        <div className="w-4 flex justify-center items-center">
                          <img src={X} alt="" />
                        </div>
                        <p className="text-xs px-1 font-light rounded-xl flex justify-center items-center">
                          {getSourceData(data, 'hasil')}
                        </p>
                      </div>
                    </td>

                    <td className="px-2 py-3">
                      <p className={getStatusStyle(data.status_tiket)}>
                        {data.status_tiket}
                      </p>
                    </td>

                    <td className="px-2 py-3">
                      <p className={getStatusStyle(data.status_tiket)}>
                        {data.skor_mtc}%
                      </p>
                    </td>

                    <td className="px-2 py-3">
                      <p className="text-xs font-light">
                        {getInspectorName(data)}
                      </p>
                    </td>

                    <td className="px-2 py-3">
                      <div className="flex gap-2 items-center relative">
                        <div>
                          <button
                            title="button"
                            className="text-xs font-bold bg-blue-700 py-2 text-white rounded-md"
                            onClick={() => handleClick(i)}
                          >
                            <img src={Burger} alt="" className="mx-3" />
                          </button>

                          {showTwoButtons[i] && (
                            <div className="absolute bg-white p-3 shadow-5 rounded-md z-10 top-full left-0 mt-1">
                              <div className="flex flex-col gap-1">
                                {data.status_tiket !== 'monitoring' && (
                                  <button
                                    onClick={() => {
                                      if (!data.waktu_mulai_mtc) {
                                        responMTC(data.id);
                                      } else if (
                                        data.status_tiket === 'open' ||
                                        data.status_tiket === 'pending'
                                      ) {
                                        openModal1(i);
                                      } else {
                                        reworkTiket(data.id);
                                      }
                                    }}
                                    className="w-25 text-xs font-bold bg-blue-700 py-2 text-white rounded-md"
                                  >
                                    PROSES
                                  </button>
                                )}

                                <button
                                  onClick={openModal2}
                                  className="w-25 text-xs font-bold bg-blue-700 py-2 text-white rounded-md"
                                >
                                  JADWALKAN
                                </button>
                              </div>

                              {showModal2 && (
                                <ModalMtcDate
                                  isOpen={showModal2}
                                  onClose={closeModal2}
                                  machineName="GMC Printer 2"
                                >
                                  <p></p>
                                </ModalMtcDate>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Only show arrow button if data.proses_mtc_os3s.length > 0 */}
                        {data.proses_mtc_os3s.length > 0 && (
                          <div>
                            <button
                              title="button"
                              onClick={() => handleClickDetail(i)}
                              className="text-xs font-bold text-blue-700 bg-blue-700 py-2 border-blue-700 border rounded-md"
                            >
                              <img src={Arrow} alt="" className="mx-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                  {showModal1[i] && (
                    <ModalStockCheckOs3
                      children={undefined}
                      isOpen={showModal1[i]}
                      onClose={() => closeModal1(i)}
                      onFinish={getTiket}
                      kendala="data.nama_kendala"
                      kodeLkh={data.sumber}
                      machineName={data.nama_mesin}
                      tgl={data.waktu_respon}
                      jam={data.waktu_respon}
                      namaPemeriksa={
                        data.proses_mtc_os3s[lengthProses]?.user_eksekutor.nama
                      }
                      no="109299"
                      idTiket={data.id}
                      idProses={data.proses_mtc_os3s[lengthProses]?.id}
                      namaMesin={data.nama_mesin}
                    />
                  )}
                  {data.proses_mtc_os3s.length > 0 && showDetail[i] && (
                    <tr>
                      <td colSpan={10} className="px-0 py-0">
                        <div className="w-full flex flex-col bg-[#E9F3FF] rounded-lg">
                          <div className="flex px-5 py-2">
                            <div className="flex flex-col gap-2 w-2/12">
                              <p className="text-xs font-bold">Waktu Temuan</p>
                            </div>
                            <div className="grid grid-cols-6 gap-3 w-10/12">
                              {[
                                'Pengerjaan Ke',
                                'Waktu',
                                'Eksekutor',
                                'Progress Perbaikan',
                                'Jenis Perbaikan',
                                '',
                              ].map((header) => (
                                <div
                                  key={header}
                                  className="flex flex-col gap-2"
                                >
                                  <p className="text-xs font-bold">{header}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex px-5 pb-4">
                            <div className="flex flex-col gap-2 w-2/12">
                              <div>
                                <p className="text-xs font-medium">{dateMtc}</p>
                              </div>
                              <div>
                                <p className="text-xs font-bold">
                                  Waktu Respon
                                </p>
                                <p className="text-xs font-medium">
                                  {waktuRespon}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-6 gap-3 w-10/12">
                              {data.proses_mtc_os3s.map(
                                (proses: any, ii: number) => {
                                  const tglMulaiMtc = convertDatetimeToDate(
                                    proses.waktu_mulai_mtc,
                                  );

                                  return (
                                    <div key={ii} className="contents">
                                      <div className="flex flex-col gap-2">
                                        <h5 className="text-xs font-medium">
                                          {ii + 1}
                                        </h5>
                                      </div>

                                      <div className="flex flex-col gap-2">
                                        <p className="text-xs font-medium">
                                          {tglMulaiMtc}
                                        </p>
                                      </div>

                                      <div className="flex flex-col gap-2">
                                        <p className="text-xs font-medium">
                                          {proses.user_eksekutor.nama}
                                        </p>
                                      </div>

                                      <div className="flex flex-col gap-2">
                                        <div className="flex">
                                          <p
                                            className={getProgressStyle(
                                              proses.skor_mtc,
                                            )}
                                          >
                                            {proses.skor_mtc}%
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex flex-col gap-2">
                                        <p className="text-xs font-medium">
                                          {proses.cara_perbaikan}
                                        </p>
                                      </div>

                                      <div>
                                        <button
                                          onClick={() => openModalDetail(ii)}
                                          className="text-xs font-bold bg-blue-700 py-1 px-5 text-white rounded-md"
                                        >
                                          Detail
                                        </button>
                                      </div>

                                      {showModalDetail[ii] && (
                                        <ModalDetailOS3
                                          unit={proses.unit}
                                          bagian={proses.bagian}
                                          children={undefined}
                                          isOpen={showModalDetail[ii]}
                                          onClose={() => closeModalDetail(ii)}
                                          kendala={getSourceData(
                                            data,
                                            'inspection_point',
                                          )}
                                          machineName={data.nama_mesin}
                                          tgl={dateMtc}
                                          namaPemeriksa={
                                            proses.user_eksekutor.nama
                                          }
                                          no="1"
                                          idTiket={data.id}
                                          kodeLkh={data.kode_lkh}
                                          analisisPenyebab={`${proses.kode_analisis_mtc} - ${proses.nama_analisis_mtc}`}
                                          kebutuhanSparepart={
                                            proses.masalah_spareparts
                                          }
                                          tipeMaintenance={
                                            proses.cara_perbaikan
                                          }
                                          catatan={getSourceData(
                                            data,
                                            'catatan',
                                          )}
                                          inspection_point={getSourceData(
                                            data,
                                            'inspection_point',
                                          )}
                                          acceptance_criteria={getSourceData(
                                            data,
                                            'acceptance_criteria',
                                          )}
                                          inspection_method={getSourceData(
                                            data,
                                            'method',
                                          )}
                                          tools={getSourceData(data, 'tools')}
                                          sumber={data.sumber}
                                          indikator={getSourceData(
                                            data,
                                            'hasil',
                                          )}
                                          task_list={getSourceData(
                                            data,
                                            'task',
                                          )}
                                        />
                                      )}
                                    </div>
                                  );
                                },
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Section */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 mt-6 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Rows per page:</span>
          <div className="flex gap-2">
            {[10, 25, 50, 100].map((pageSize) => (
              <button
                key={pageSize}
                onClick={() => handleLimitChange(pageSize)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  limit === pageSize
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {pageSize}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Stack spacing={2}>
            <Pagination
              count={tiket?.total_page}
              color="primary"
              page={page}
              onChange={(e, i) => {
                setPage(i);
                console.log(i);
              }}
            />
          </Stack>
        </div>
      </div>
    </main>
  );
}

export default TableOS3;
