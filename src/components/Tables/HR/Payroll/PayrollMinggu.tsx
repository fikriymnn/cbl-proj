import React, { useEffect, useState } from 'react';
import Loading from '../../../Loading';
import axios from 'axios';
import convertTimeStampToDate from '../../../../utils/convertDate';
import formatInteger from '../../../../utils/formaterInteger';
import ModalKosongan from '../../../Modals/Qc/NCR/NCRResponQC';
import EmployeeFilter from './EmployeeFilter';
function PayrollMinggu() {
  const [isLoading, setIsLoading] = useState(false);
  const [payWeek, setPayWeek] = useState<any>();
  const [dateFrom, setDateFrom] = useState<any>();
  const [dateTo, setDateTo] = useState<any>();
  const [editedPayWeek, setEditedPayWeek] = useState(() =>
    payWeek
      ? {
          ...payWeek,
          detail: payWeek.detail.map((item: any) => ({
            ...item,
            originalSubTotal: item.summaryPayroll.sub_total, // Store initial sub_total
          })),
        }
      : null,
  );
  useEffect(() => {
    if (payWeek) {
      setEditedPayWeek({
        ...payWeek,
        detail: payWeek.detail.map((item: any) => ({
          ...item,
          originalSubTotal: item.summaryPayroll.sub_total,
          // Make sure these fields are preserved when setting up the state
        })),
      });
    }
    getDepartment();
    getdivisi();
  }, [payWeek]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  useEffect(() => {
    if (editedPayWeek?.detail) {
      setFilteredData(editedPayWeek.detail);
    }
  }, [editedPayWeek]);
  async function getPayrollMingguan(dateFrom1: any, dateTo1: any) {
    const url = `${import.meta.env.VITE_API_LINK}/hr/payrollAll`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        params: {
          startDate: dateFrom1,
          endDate: dateTo1,
        },
        withCredentials: true,
      });
      setIsLoading(false);
      setPayWeek(res.data.data);
      console.log(res.data.data);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }

  async function postPayrollMingguan() {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/hr/payroll/bayarMingguanPeriode`;
    try {
      setIsLoading(true);
      const res = await axios.post(
        url,
        {
          data_payroll: editedPayWeek,
        },
        {
          withCredentials: true,
        },
      );
      setIsLoading(false);
      setPayWeek(res.data.data);
      console.log(res.data.data);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }

  const handleInputChange = (index: number, value: number) => {
    const newDetail = [...editedPayWeek.detail];
    newDetail[index].summaryPayroll.pengurangan_penambahan = value;
    newDetail[index].summaryPayroll.sub_total =
      newDetail[index].originalSubTotal + value;

    // Recalculate total based on new sub_totals
    const newTotal = newDetail.reduce(
      (sum, item) => sum + item.summaryPayroll.sub_total,
      0,
    );

    setEditedPayWeek({
      ...editedPayWeek,
      detail: newDetail,
      total: newTotal,
    });
  };

  const handleInputNote = (index: number, value: string) => {
    const newDetail = [...editedPayWeek.detail];
    newDetail[index].summaryPayroll.note_pengurangan_penambahan = value;

    setEditedPayWeek({
      ...editedPayWeek,
      detail: newDetail,
    });
  };

  const [showEdit, setShowEdit] = useState<any>([]);
  const openEdit = (i: any) => {
    const onchangeVal = [...showEdit];
    onchangeVal[i] = true;
    setShowEdit(onchangeVal);
    // Don't reset the data here
  };

  const closeEdit = (i: any) => {
    const onchangeVal = [...showEdit];
    onchangeVal[i] = false;
    setShowEdit(onchangeVal);
    // Don't reset the data here either
  };
  const handleClickDetail = (index: number) => {
    setShowDetail((prevState) => {
      const updatedShowDetail = [...prevState]; // Create a copy
      updatedShowDetail[index] = !updatedShowDetail[index]; // Toggle value
      return updatedShowDetail;
    });
  };
  const [showDetail, setShowDetail] = useState<boolean[]>(
    new Array(payWeek != null && payWeek.length).fill(false),
  );

  const handleClickDetail2 = (index: number) => {
    setShowDetail2((prevState) => {
      const updatedShowDetail = [...prevState]; // Create a copy
      updatedShowDetail[index] = !updatedShowDetail[index]; // Toggle value
      return updatedShowDetail;
    });
  };
  const [showDetail2, setShowDetail2] = useState<boolean[]>(
    new Array(payWeek != null && payWeek.length).fill(false),
  );
  const [department, setDepartment] = useState<any>();

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
      setDepartment(res.data);
      console.log('department', res.data);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }
  const [divisi, setdivisi] = useState<any>();

  async function getdivisi() {
    const url = `${import.meta.env.VITE_API_LINK}/master/hr/divisi`;
    try {
      setIsLoading(true);
      const res = await axios.get(
        url,

        {
          withCredentials: true,
        },
      );
      setIsLoading(false);
      setdivisi(res.data);
      console.log('divisi', res.data);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }
  const tipeKaryawan: any = [
    { tipe_karyawan: 'produksi' },
    { tipe_karyawan: 'staff' },
  ];
  const tipePenggajian: any = [
    { tipe_penggajian: 'bulanan' },
    { tipe_penggajian: 'mingguan' },
  ];
  return (
    <main>
      {isLoading && <Loading />}
      <div className="min-w-[700px] bg-white rounded-xl">
        <div className="bg-white w-full mb-5 rounded-md p-3 flex flex-col justify-center items-center gap-3 border-b-8 border-[#D8EAFF]">
          <div className="grid md:grid-cols-12 grid-cols-6  py-1 gap-3 ">
            <div className="flex flex-col gap-2 col-span-3">
              <div>
                <p className="text-sm text-primary font-semibold">Dari:</p>
                <input
                  className=" bg-[#D8EAFF] px-2 h-8"
                  type="date"
                  onChange={(e) => setDateFrom(e.target.value)}
                ></input>
              </div>
            </div>
            <div className="flex flex-col gap-2 col-span-7">
              <div>
                <p className=" my-auto text-sm text-primary font-semibold ">
                  Sampai:
                </p>

                <input
                  className=" bg-[#D8EAFF] px-2 h-8"
                  type="date"
                  onChange={(e) => setDateTo(e.target.value)}
                ></input>
              </div>
            </div>

            <div className="flex w-full  items-end gap-1 col-span-2">
              <button
                onClick={() => {
                  getPayrollMingguan(dateFrom, dateTo);
                }}
                className="bg-primary text-white px-5 py-2 rounded-md my-auto "
              >
                Pilih Periode
              </button>
            </div>
          </div>
        </div>
        <EmployeeFilter
          editedPayWeek={editedPayWeek}
          department={department?.data}
          divisi={divisi?.data}
          setFilteredData={setFilteredData}
          tipe_karyawan={tipeKaryawan}
          tipe_penggajian={tipePenggajian}
        />
        <div className=" w-full h-full  border-b-8 border-[#D8EAFF] bg-white px-4 py-4 items-center justify-between flex">
          <div>
            <label className="text-xl text-blue-400 font-semibold  justify-center text-center">
              {payWeek == null
                ? 'Periode Dari'
                : convertTimeStampToDate(payWeek?.periode_dari)}{' '}
              ~{' '}
              {payWeek == null
                ? 'Periode Sampai'
                : convertTimeStampToDate(payWeek?.periode_sampai)}
            </label>
            <label className="text-xl text-blue-400 font-semibold  justify-center text-center">
              {editedPayWeek == null
                ? ''
                : 'Total Gaji Rp.' + formatInteger(editedPayWeek?.total)}
            </label>
          </div>
          {payWeek && (
            <button
              title="button"
              onClick={() => postPayrollMingguan()}
              className="text-xs w-[20%] flex items-center justify-center font-bold text-white px-1 bg-blue-700 py-2 border-blue-700 border rounded-md"
            >
              AJUKAN
            </button>
          )}
        </div>
        <div className=" w-full h-full flex-col  bg-white">
          <div className="grid grid-cols-7 gap-4 px-3 py-4 border-b-8 border-[#D8EAFF] ">
            <div className="flex gap-3">
              <label className="text-black text-xs font-bold">No</label>
              <label className="text-neutral-500 text-xs font-semibold ">
                NIK
              </label>
            </div>
            <label className="text-neutral-500 text-xs font-semibold  ">
              Nama
            </label>
            <label className="text-neutral-500 text-xs font-semibold  ">
              Department
            </label>
            <label className="text-neutral-500 text-xs font-semibold  ">
              Divisi
            </label>
            <label className="text-neutral-500 text-xs font-semibold  ">
              Total
            </label>
            <div className="flex justify-center "></div>
          </div>
        </div>
        {filteredData?.map((data: any, i: any) => (
          <>
            <div
              key={i}
              className="grid grid-cols-7 gap-4 px-3 py-4 border-b-8 border-[#D8EAFF] "
            >
              <div className="flex gap-3">
                <label className="text-black text-xs font-bold">{i + 1}</label>
                <label className="text-neutral-500 text-xs font-semibold ">
                  {data.summaryPayroll?.nik}
                </label>
              </div>
              <label className="text-neutral-500 text-xs font-semibold  ">
                {data.summaryPayroll?.nama_karyawan}
              </label>
              <label className="text-neutral-500 text-xs font-semibold  ">
                {data.summaryPayroll?.department}
              </label>
              <label className="text-neutral-500 text-xs font-semibold  ">
                {data.summaryPayroll?.divisi}
              </label>
              <label className="text-neutral-500 text-xs font-semibold col-span-2 ">
                Rp.{formatInteger(data.summaryPayroll?.sub_total)}
              </label>
              <div className="flex justify-center ">
                <button
                  onClick={() => openEdit(i)}
                  className="px-2 py-1  text-xs bg-blue-400 items-center justify-center text-white font-semibold rounded-md flex w-full "
                >
                  Detail
                </button>
                {showEdit[i] == true && (
                  <ModalKosongan
                    isOpen={showEdit[i]}
                    onClose={() => closeEdit(i)}
                    judul={'Detail Payroll'}
                  >
                    <div className="p-6 max-h-[80vh] overflow-y-auto">
                      {/* Employee Info Section */}
                      <div className="grid grid-cols-2 gap-6 mb-6 bg-gray-50 p-4 rounded-lg shadow-sm">
                        <div className="flex flex-col gap-3">
                          <div>
                            <label className="text-xs font-bold text-gray-700 block mb-1">
                              NAMA PERSONNEL
                            </label>
                            <p className="text-lg text-gray-800 font-medium">
                              {data.summaryPayroll?.nama_karyawan}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-700 block mb-1">
                              NIK
                            </label>
                            <p className="text-lg text-gray-800">
                              {data.summaryPayroll?.nik}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-700 block mb-1">
                              DEPARTMENT
                            </label>
                            <p className="text-lg text-gray-800">
                              {data.summaryPayroll?.department}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-700 block mb-1">
                              DIVISI
                            </label>
                            <p className="text-lg text-gray-800">
                              {data.summaryPayroll?.divisi}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3">
                          <div>
                            <label className="text-xs font-bold text-gray-700 block mb-1">
                              PERIODE
                            </label>
                            <p className="text-lg text-gray-800">
                              {convertTimeStampToDate(payWeek?.periode_dari)} ~{' '}
                              {convertTimeStampToDate(payWeek?.periode_sampai)}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-700 block mb-1">
                              TOTAL POTONGAN
                            </label>
                            <p className="text-lg text-gray-800">
                              Rp.{' '}
                              {formatInteger(
                                data.summaryPayroll?.total_potongan,
                              )}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-700 block mb-1">
                              TOTAL UPAH
                            </label>
                            <p className="text-lg text-gray-800">
                              Rp. {formatInteger(data.summaryPayroll?.total)}
                            </p>
                          </div>

                          {/* Adjustment inputs */}
                          <div className="mt-2">
                            <label className="text-xs font-bold text-gray-700 block mb-1">
                              CATATAN PENGURANGAN/PENAMBAHAN
                            </label>
                            <input
                              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-300 focus:outline-none"
                              type="text"
                              value={
                                data.summaryPayroll
                                  .note_pengurangan_penambahan || ''
                              }
                              onChange={(e) =>
                                handleInputNote(i, String(e.target.value))
                              }
                              placeholder="Masukkan Catatan"
                            />
                          </div>

                          <div className="mt-2">
                            <label className="text-xs font-bold text-gray-700 block mb-1">
                              JUMLAH PENGURANGAN/PENAMBAHAN
                            </label>
                            <input
                              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-300 focus:outline-none"
                              type="number"
                              value={
                                data.summaryPayroll.pengurangan_penambahan || 0
                              }
                              onChange={(e) =>
                                handleInputChange(i, Number(e.target.value))
                              }
                              placeholder="Masukkan Pengurangan atau Penambahan"
                            />
                          </div>

                          <div className="mt-3">
                            <label className="text-xs font-bold text-gray-700 block mb-1">
                              TOTAL UPAH TERBARU
                            </label>
                            <p className="text-xl text-blue-600 font-bold">
                              Rp. {formatInteger(data.summaryPayroll.sub_total)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 mb-6">
                        <button
                          onClick={() => handleClickDetail(i)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors flex items-center gap-2"
                        >
                          {showDetail[i]
                            ? 'Sembunyikan Rincian'
                            : 'Lihat Rincian'}
                        </button>

                        <button
                          onClick={() => handleClickDetail2(i)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors flex items-center gap-2"
                        >
                          {showDetail2[i]
                            ? 'Sembunyikan Absensi'
                            : 'Lihat Absensi'}
                        </button>
                      </div>

                      {/* Detailed Payment Breakdown */}
                      {showDetail[i] && (
                        <div className="mb-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                          <div className="grid grid-cols-2 gap-6 p-4">
                            <div className="flex flex-col gap-4">
                              {/* DETAIL POTONGAN */}
                              {data.summaryPayroll?.potongan?.length > 0 && (
                                <div className="bg-gray-50 p-3 rounded-md">
                                  <h3 className="text-sm font-bold text-gray-800 mb-2 border-b pb-1">
                                    DETAIL POTONGAN
                                  </h3>
                                  <ul className="space-y-1">
                                    {data.summaryPayroll.potongan.map(
                                      (data2: any, ii: any) => (
                                        <li
                                          key={ii}
                                          className="text-gray-700 flex justify-between"
                                        >
                                          <span>{data2.label}</span>
                                          <span className="font-medium">
                                            Rp. {formatInteger(data2.total)}
                                          </span>
                                        </li>
                                      ),
                                    )}
                                  </ul>
                                </div>
                              )}

                              {/* POTONGAN TERLAMBAT */}
                              {data.summaryPayroll?.potongan_terlambat?.length >
                                0 && (
                                <div className="bg-gray-50 p-3 rounded-md">
                                  <h3 className="text-sm font-bold text-gray-800 mb-2 border-b pb-1">
                                    POTONGAN TERLAMBAT
                                  </h3>
                                  <ul className="space-y-1">
                                    {data.summaryPayroll.potongan_terlambat.map(
                                      (data2: any, ii: any) => (
                                        <li
                                          key={ii}
                                          className="text-gray-700 flex justify-between"
                                        >
                                          <span>
                                            {data2.label} × {data2.jumlah}
                                          </span>
                                          <span className="font-medium">
                                            Rp. {formatInteger(data2.total)}
                                          </span>
                                        </li>
                                      ),
                                    )}
                                  </ul>
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col gap-4">
                              {/* RINCIAN PAYROLL */}
                              {data.summaryPayroll?.rincian?.length > 0 && (
                                <div className="bg-gray-50 p-3 rounded-md">
                                  <h3 className="text-sm font-bold text-gray-800 mb-2 border-b pb-1">
                                    RINCIAN PAYROLL
                                  </h3>
                                  <ul className="space-y-1">
                                    {data.summaryPayroll.rincian.map(
                                      (data2: any, ii: any) => (
                                        <li
                                          key={ii}
                                          className="text-gray-700 flex justify-between"
                                        >
                                          <span>
                                            {data2.label} × {data2.jumlah}
                                          </span>
                                          <span className="font-medium">
                                            Rp. {formatInteger(data2.total)}
                                          </span>
                                        </li>
                                      ),
                                    )}
                                  </ul>
                                </div>
                              )}

                              {/* UPAH HARIAN SAKIT */}
                              {data.summaryPayroll?.upahHarianSakit?.length >
                                0 && (
                                <div className="bg-gray-50 p-3 rounded-md">
                                  <h3 className="text-sm font-bold text-gray-800 mb-2 border-b pb-1">
                                    UPAH HARIAN SAKIT
                                  </h3>
                                  <ul className="space-y-1">
                                    {data.summaryPayroll.upahHarianSakit.map(
                                      (data2: any, ii: any) => (
                                        <li
                                          key={ii}
                                          className="text-gray-700 flex justify-between"
                                        >
                                          <span>
                                            {data2.label} = {data2.jumlah} ×{' '}
                                            {data2.nilai}
                                          </span>
                                          <span className="font-medium">
                                            Rp. {formatInteger(data2.total)}
                                          </span>
                                        </li>
                                      ),
                                    )}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Attendance Details */}
                      {showDetail2[i] && (
                        <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-sm">
                          <h3 className="text-sm font-bold text-gray-800 p-3 border-b">
                            DETAIL ABSENSI
                          </h3>

                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="px-3 py-2 text-left">No.</th>
                                  <th className="px-3 py-2 text-left">Nama</th>
                                  <th className="px-3 py-2 text-left">
                                    Tanggal
                                  </th>
                                  <th className="px-3 py-2 text-left">
                                    Jam Masuk
                                  </th>
                                  <th className="px-3 py-2 text-left">
                                    Jam Keluar
                                  </th>
                                  <th className="px-3 py-2 text-left">
                                    Lama Istirahat
                                  </th>
                                  <th className="px-3 py-2 text-left">Shift</th>
                                  <th className="px-3 py-2 text-left">
                                    Lembur
                                  </th>
                                  <th className="px-3 py-2 text-left">
                                    Terlambat
                                  </th>
                                  <th className="px-3 py-2 text-left">
                                    Status
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {data.detailAbsensi?.map(
                                  (data2: any, ii: any) => (
                                    <tr
                                      key={ii}
                                      className={`${
                                        data2.jam_lembur != data2.jam_lembur_spl
                                          ? 'bg-red-100'
                                          : ''
                                      } hover:bg-gray-50`}
                                    >
                                      <td className="px-3 py-3">{ii + 1}</td>
                                      <td className="px-3 py-3">
                                        {data2.name}
                                      </td>
                                      <td className="px-3 py-3">
                                        {data2.tgl_masuk}
                                      </td>
                                      <td className="px-3 py-3">
                                        {data2.jam_masuk || '-'}
                                      </td>
                                      <td className="px-3 py-3">
                                        {data2.jam_keluar || '-'}
                                      </td>
                                      <td className="px-3 py-3">
                                        {data2.lama_istirahat || '-'} jam
                                      </td>
                                      <td className="px-3 py-3">
                                        {data2.shift || '-'}
                                      </td>
                                      <td className="px-3 py-3">
                                        <div>
                                          {data2.status_lembur || '-'}
                                          {data2.jam_lembur
                                            ? ` (${
                                                data2.jam_lembur -
                                                data2.lama_istirahat
                                              } jam)`
                                            : ''}
                                        </div>

                                        {data2.jam_lembur !=
                                          data2.jam_lembur_spl && (
                                          <div className="text-xs text-red-600 mt-1">
                                            <div>
                                              Absen: {data2.jam_lembur} jam
                                            </div>
                                            <div>
                                              SPL: {data2.jam_lembur_spl} jam
                                            </div>
                                          </div>
                                        )}
                                      </td>
                                      <td className="px-3 py-3">
                                        <div>{data2.status_masuk}</div>
                                        {data2.menit_terlambat > 0 && (
                                          <div className="text-xs text-red-600">
                                            {data2.menit_terlambat} Jam
                                          </div>
                                        )}
                                      </td>
                                      <td className="px-3 py-3">
                                        <span
                                          className={`px-2 py-1 rounded-full text-xs ${
                                            data2.status_absen === 'Hadir'
                                              ? 'bg-green-100 text-green-800'
                                              : data2.status_absen === 'Izin'
                                              ? 'bg-blue-100 text-blue-800'
                                              : data2.status_absen === 'Sakit'
                                              ? 'bg-yellow-100 text-yellow-800'
                                              : 'bg-red-100 text-red-800'
                                          }`}
                                        >
                                          {data2.status_absen}
                                        </span>
                                      </td>
                                    </tr>
                                  ),
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  </ModalKosongan>
                )}
              </div>
            </div>
          </>
        ))}
      </div>
    </main>
  );
}

export default PayrollMinggu;
