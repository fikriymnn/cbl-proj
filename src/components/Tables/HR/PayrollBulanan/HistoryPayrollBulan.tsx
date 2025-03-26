import Pagination from '@mui/material/Pagination/Pagination';
import Stack from '@mui/material/Stack';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Loading from '../../../Loading';
import convertTimeStampToDate from '../../../../utils/convertDate';
import ModalKosongan from '../../../Modals/Qc/NCR/NCRResponQC';
import formatInteger from '../../../../utils/formaterInteger';
import ModalXL from '../../PPIC/JadwalProduksi/ModalXL';
import EnhancedEmployeeFilter from '../Payroll/EnhancedEmployeeFilter';

function HistoryBulan() {
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [payWeek, setPayWeek] = useState<any>();
  const [department, setDepartment] = useState<any[]>([]);
  const [divisi, setdivisi] = useState<any[]>([]);

  // State for filtered data
  const [filteredData, setFilteredData] = useState<any[]>([]);

  // Your existing functions to fetch data
  async function getDepartment() {
    const url = `${import.meta.env.VITE_API_LINK}/master/hr/department`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        params: {
          is_active: true,
        },
        withCredentials: true,
      });
      setIsLoading(false);
      setDepartment(res.data.data);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }

  async function getdivisi() {
    const url = `${import.meta.env.VITE_API_LINK}/master/hr/divisi`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        withCredentials: true,
      });
      setIsLoading(false);
      setdivisi(res.data.data);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }

  // Format integer function
  const formatInteger = (num: number) => {
    if (!num) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Fetch data on component mount
  useEffect(() => {
    // Fetch payWeek data here
    // ...

    getDepartment();
    getdivisi();
  }, []);

  useEffect(() => {
    getPayroll();
  }, [page]);

  async function getPayroll() {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/hr/payroll/bayarBulananPeriode`;
    try {
      const res = await axios.get(
        url,

        {
          params: {
            page: page,
            limit: 10,
          },
          withCredentials: true,
        },
      );
      setPayWeek(res.data);
      console.log(res.data);
    } catch (error: any) {
      console.log(error);
    }
  }
  const [showEdit, setShowEdit] = useState<any>([]);
  const openEdit = (i: any) => {
    const onchangeVal: any = [...showEdit];
    onchangeVal[i] = true;

    setShowEdit(onchangeVal);
  };
  const closeEdit = (i: any) => {
    const onchangeVal: any = [...showEdit];
    onchangeVal[i] = false;

    setShowEdit(onchangeVal);
  };

  const [showEdit2, setShowEdit2] = useState<any>([]);
  const openEdit2 = (i: any) => {
    const onchangeVal: any = [...showEdit2];
    onchangeVal[i] = true;

    setShowEdit2(onchangeVal);
  };
  const closeEdit2 = (i: any) => {
    const onchangeVal: any = [...showEdit2];
    onchangeVal[i] = false;

    setShowEdit2(onchangeVal);
  };
  const tipeKaryawan: any = [
    { tipe_karyawan: 'produksi' },
    { tipe_karyawan: 'staff' },
  ];
  const tipePenggajian: any = [
    { tipe_penggajian: 'bulanan' },
    { tipe_penggajian: 'mingguan' },
  ];
  return (
    <main className="overflow-x-scroll">
      {isLoading && <Loading />}
      <div className="min-w-[700px] bg-white rounded-xl">
        <div className=" w-full h-full flex-col border-b-8 border-[#D8EAFF]">
          <div className="grid grid-cols-7 gap-4 px-3 py-4 border-b-8 border-[#D8EAFF] ">
            <label className="text-neutral-500 text-xs font-semibold col-span-2">
              Yang Menyetujui
            </label>
            <label className="text-neutral-500 text-xs font-semibold  ">
              Periode Dari
            </label>
            <label className="text-neutral-500 text-xs font-semibold  ">
              Periode Sampai
            </label>
            <label className="text-neutral-500 text-xs font-semibold  ">
              Tanggal Bayar
            </label>
            <label className="text-neutral-500 text-xs font-semibold ">
              Total Upah
            </label>
            <div className="flex justify-center "></div>
          </div>

          {payWeek?.data?.map((data: any, i: number) => {
            return (
              <div
                key={i}
                className="grid grid-cols-7 gap-4 px-3 py-4 border-b-8 border-[#D8EAFF] "
              >
                <label className="text-neutral-500 text-xs font-semibold col-span-2 ">
                  {data.payroll_detail_bulanan[0]?.karyawan_hr?.name}
                </label>
                <label className="text-neutral-500 text-xs font-semibold  ">
                  {convertTimeStampToDate(data.periode_dari)}
                </label>
                <label className="text-neutral-500 text-xs font-semibold  ">
                  {convertTimeStampToDate(data.periode_sampai)}
                </label>
                <label className="text-neutral-500 text-xs font-semibold  ">
                  {convertTimeStampToDate(data.tgl_bayar)}
                </label>

                <label className="text-neutral-500 text-xs font-semibold ">
                  Rp. {formatInteger(data.total)}
                </label>
                <div className="flex justify-center ">
                  <button
                    onClick={() => openEdit(i)}
                    className="px-2 py-1  text-xs bg-blue-400 items-center justify-center text-white font-semibold rounded-md flex w-full "
                  >
                    Detail
                  </button>
                  {showEdit[i] == true && (
                    <ModalXL
                      isOpen={showEdit[i]}
                      onClose={() => closeEdit(i)}
                      judul={'Rincian History Payroll'}
                    >
                      <>
                        <EnhancedEmployeeFilter
                          payWeek={payWeek}
                          department={department}
                          divisi={divisi}
                          setFilteredData={setFilteredData}
                          formatInteger={formatInteger}
                          tipe_karyawan={tipeKaryawan}
                          tipe_penggajian={tipePenggajian}
                        />
                        <div className="grid grid-cols-5 gap-4 px-3 py-4 border-b-8 border-[#D8EAFF] ">
                          <div className="flex gap-3">
                            <label className="text-black text-xs font-bold">
                              No
                            </label>
                            <label className="text-neutral-500 text-xs font-semibold ">
                              NIK
                            </label>
                          </div>
                          <label className="text-neutral-500 text-xs font-semibold ">
                            Nama
                          </label>

                          <label className="text-neutral-500 text-xs font-semibold  ">
                            Department
                          </label>

                          <label className="text-neutral-500 text-xs font-semibold ">
                            Total Upah
                          </label>
                          <div className="flex justify-center "></div>
                        </div>
                        {/* Replace the direct mapping with filteredData mapping */}
                        {filteredData?.map((data2: any, ii: number) => (
                          <div
                            key={ii}
                            className="grid grid-cols-5 gap-4 px-3 py-4 border-b-8 border-[#D8EAFF] "
                          >
                            <div className="flex gap-3">
                              <label className="text-black text-xs font-bold">
                                {ii + 1}
                              </label>
                              <label className="text-neutral-500 text-xs font-semibold ">
                                {data2.karyawan?.biodata_karyawan[0]?.nik}
                              </label>
                            </div>
                            <label className="text-neutral-500 text-xs font-semibold ">
                              {data2.karyawan?.name}
                            </label>

                            <label className="text-neutral-500 text-xs font-semibold  ">
                              {
                                data2.karyawan?.biodata_karyawan[0]?.department
                                  ?.nama_department
                              }
                            </label>

                            <label className="text-neutral-500 text-xs font-semibold ">
                              Rp. {formatInteger(data2.total_upah)}
                            </label>
                            <div className="flex justify-center ">
                              <button
                                onClick={() => openEdit2(ii)}
                                className="px-2 py-1  text-xs bg-blue-400 items-center justify-center text-white font-semibold rounded-md flex w-full "
                              >
                                Detail
                              </button>
                              {showEdit2[ii] == true && (
                                <ModalKosongan
                                  isOpen={showEdit2[ii]}
                                  onClose={() => closeEdit2(ii)}
                                  judul={'Rincihan Payroll'}
                                >
                                  <>
                                    <div className="grid grid-cols-2 gap-2 px-4 py-4">
                                      <div className="flex flex-col  ">
                                        <label
                                          htmlFor=""
                                          className="text-black text-xs font-bold"
                                        >
                                          Tipe Penggajian
                                        </label>
                                        <label
                                          htmlFor=""
                                          className="text-[#016ae6] uppercase text-xl font-normal"
                                        >
                                          {data2.tipe_penggajian}
                                        </label>
                                      </div>
                                      <div className="flex flex-col  ">
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
                                          {data2.karyawan_hr?.name}
                                        </label>
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
                                            {data2.karyawan?.name}
                                          </label>
                                        </div>
                                        <div className="flex flex-col ">
                                          <label
                                            htmlFor=""
                                            className="text-black text-xs font-bold"
                                          >
                                            NIK
                                          </label>
                                          <label
                                            htmlFor=""
                                            className="text-[#7a7a7a] text-xl font-normal"
                                          >
                                            {
                                              data2.karyawan
                                                ?.biodata_karyawan[0]?.nik
                                            }
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
                                              data2.karyawan
                                                ?.biodata_karyawan[0]
                                                ?.department?.nama_department
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
                                            {convertTimeStampToDate(
                                              data2.createdAt,
                                            )}
                                          </label>
                                        </div>
                                      </div>
                                      <div className="flex flex-col gap-2">
                                        <div className="flex flex-col">
                                          <label
                                            htmlFor=""
                                            className="text-black text-xs font-bold"
                                          >
                                            PERIODE
                                          </label>
                                          <label
                                            htmlFor=""
                                            className="text-[#7a7a7a] text-xl font-normal"
                                          >
                                            {convertTimeStampToDate(
                                              data2.periode_dari,
                                            )}
                                          </label>
                                          <label
                                            htmlFor=""
                                            className="text-[#7a7a7a] text-xl font-normal"
                                          >
                                            ~{' '}
                                            {convertTimeStampToDate(
                                              data2.periode_sampai,
                                            )}
                                          </label>
                                        </div>
                                        <div className="flex flex-col">
                                          <label
                                            htmlFor=""
                                            className="text-black text-xs font-bold"
                                          >
                                            TOTAL POTONGAN
                                          </label>
                                          <label
                                            htmlFor=""
                                            className="text-[#7a7a7a] text-xl font-normal"
                                          >
                                            Rp.{' '}
                                            {formatInteger(
                                              data2.total_potongan,
                                            )}
                                          </label>
                                        </div>

                                        <div className="flex flex-col">
                                          <label
                                            htmlFor=""
                                            className="text-black text-xs font-bold"
                                          >
                                            TOTAL UPAH
                                          </label>
                                          <label
                                            htmlFor=""
                                            className="text-[#7a7a7a] text-xl font-normal"
                                          >
                                            Rp.{' '}
                                            {formatInteger(data2.total_upah)}
                                          </label>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <label className="text-black text-xl font-bold flex w-full justify-center">
                                          PENDAPATAN
                                        </label>
                                        <div className="grid grid-cols-5 gap-1 px-1 py-4 border-b-8 border-[#D8EAFF] border-2">
                                          <div className="flex gap-3 col-span-3">
                                            <label className="text-black text-xs font-bold">
                                              No
                                            </label>
                                            <label className="text-neutral-500 text-xs font-semibold ">
                                              Keterangan
                                            </label>
                                          </div>

                                          <label className="text-neutral-500 text-xs font-semibold ">
                                            Total
                                          </label>
                                          <div className="flex justify-center "></div>
                                        </div>
                                        {data2.detail_payroll_bulanan
                                          ?.filter(
                                            (data3: any) =>
                                              data3.tipe === 'bayaran',
                                          )
                                          .map((data3: any, iii: any) => (
                                            <div
                                              key={iii}
                                              className="grid grid-cols-5 gap-1 px-1 py-4 border-b-8 border-[#D8EAFF] border-x-2"
                                            >
                                              <div className="flex gap-3 col-span-3">
                                                <label className="text-black text-xs font-bold">
                                                  {iii + 1}
                                                </label>
                                                <label className="text-neutral-500 text-xs font-semibold ">
                                                  {data3.label} = {data3.jumlah}{' '}
                                                  x {data3.nilai}
                                                </label>
                                              </div>

                                              <label className="text-neutral-500 text-xs font-semibold ">
                                                Rp. {formatInteger(data3.total)}
                                              </label>
                                              <div className="flex justify-center "></div>
                                            </div>
                                          ))}
                                      </div>
                                      <div>
                                        <label className="text-black text-xl font-bold flex w-full justify-center">
                                          POTONGAN
                                        </label>
                                        <div className="grid grid-cols-5 gap-1 px-1 py-4 border-b-8 border-[#D8EAFF] border-2">
                                          <div className="flex gap-3 col-span-3">
                                            <label className="text-black text-xs font-bold">
                                              No
                                            </label>
                                            <label className="text-neutral-500 text-xs font-semibold ">
                                              Keterangan
                                            </label>
                                          </div>

                                          <label className="text-neutral-500 text-xs font-semibold ">
                                            Total
                                          </label>
                                          <div className="flex justify-center "></div>
                                        </div>
                                        {data2.detail_payroll_bulanan
                                          ?.filter(
                                            (data3: any) =>
                                              data3.tipe === 'potongan',
                                          )
                                          .map((data3: any, iii: any) => (
                                            <div
                                              key={iii}
                                              className="grid grid-cols-5 gap-1 px-1 py-4 border-b-8 border-[#D8EAFF] border-x-2"
                                            >
                                              <div className="flex gap-3 col-span-3">
                                                <label className="text-black text-xs font-bold">
                                                  {iii + 1}
                                                </label>
                                                <label className="text-neutral-500 text-xs font-semibold ">
                                                  {data3.label} = {data3.jumlah}{' '}
                                                  x {data3.nilai}
                                                </label>
                                              </div>

                                              <label className="text-neutral-500 text-xs font-semibold ">
                                                Rp. {formatInteger(data3.total)}
                                              </label>
                                              <div className="flex justify-center "></div>
                                            </div>
                                          ))}
                                      </div>
                                    </div>
                                  </>
                                </ModalKosongan>
                              )}
                            </div>
                          </div>
                        ))}
                      </>
                    </ModalXL>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="w-full flex justify-center mt-5 ">
        <Stack spacing={2}>
          <Pagination
            count={payWeek?.total_page}
            color="primary"
            onChange={(e, i) => {
              setPage(i);
              console.log(i);
            }}
          />
        </Stack>
      </div>
    </main>
  );
}

export default HistoryBulan;
