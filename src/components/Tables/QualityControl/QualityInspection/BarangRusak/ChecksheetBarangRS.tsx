import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import convertTimeStampToDateOnly from '../../../../../utils/convertDateOnly';
import convertDateToTime from '../../../../../utils/converDateToTime';
import calculateElapsedTime from '../../../../../utils/calculateElapsedTime';
import formatElapsedTime from '../../../../../utils/formatElapsedTime';
import Loading from '../../../../Loading';
import ModalAddPeriode from '../../../../Modals/Qc/ModalAddPeriode';
import formatInteger from '../../../../../utils/formaterInteger';

function CheckSheetBarangRS() {
  const { id } = useParams();
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cetakMesinAwal, setCetakMesinAwal] = useState<any>();
  const [total, setTotal] = useState<any>();

  useEffect(() => {
    getCetakMesinAwal();
    getMasterDefect();
    console.log('11' + total?.defect[0].druk_awal);
  }, []);

  async function getCetakMesinAwal() {
    const url = `${import.meta.env.VITE_API_LINK
      }/qc/cs/inspeksiBarangrusak/${id}`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      setCetakMesinAwal(res.data.data);
      setTotal(res.data);
      console.log(res.data);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  async function startTaskCekAwal(id: number) {
    const url = `${import.meta.env.VITE_API_LINK
      }/qc/cs/inspeksiBarangrusak/start/${id}`;
    try {
      const res = await axios.put(
        url,
        {},
        {
          withCredentials: true,
        },
      );

      getCetakMesinAwal();
    } catch (error: any) {
      console.log(error);
      alert(error.response.data.msg);
    }
  }
  const [defectMaster, setDefectMaster] = useState<any>();
  const [idDefect, setIdDefect] = useState<any>();
  const [showModal1, setShowModal1] = useState(false);

  const openModal1 = () => setShowModal1(true);
  const closeModal1 = () => setShowModal1(false);

  async function getMasterDefect() {
    const url = `${import.meta.env.VITE_API_LINK_P1
      }/api/list-kendala?criteria=true`;
    try {
      const res = await axios.get(url);

      setDefectMaster(res.data);
      console.log(res.data);
    } catch (error: any) {
      console.log(error);
    }
  }

  const [kode, setKode] = useState<any>();
  const [masalah, setMasalah] = useState<any>();
  const [asalTemuan, setAsalTemuan] = useState<any>();

  async function tambahDefect(id: number) {
    const url = `${import.meta.env.VITE_API_LINK
      }/qc/cs/inspeksiBarangRusak/createDefect/${id}`;
    try {
      setIsLoading(true);
      const res = await axios.post(
        url,
        {
          kode: kode,
          masalah: masalah,
          asal_temuan: asalTemuan,
        },
        {
          withCredentials: true,
        },
      );
      setIsLoading(false);
      setShowModal1(false);
      setIsLoading(false);
      getCetakMesinAwal();
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }

  const handleChangePoint = (e: any, i: number) => {
    const { name, value } = e.target;
    const onchangeVal: any = cetakMesinAwal;
    onchangeVal.inspeksi_barang_rusak_defect[i][name] = value; // Assuming 'hasil' is the field you want to update
    setCetakMesinAwal(onchangeVal);
    console.log(cetakMesinAwal);
  };

  async function simpanDefect(
    id: number,
    catatan: any,
    setting_awal: any,
    druk_awal: any,
  ) {
    const url = `${import.meta.env.VITE_API_LINK
      }/qc/cs/inspeksiBarangRusak/save/${id}`;
    try {
      // setIsLoading(true);
      const res = await axios.put(
        url,
        {
          catatan: catatan,
          setting_awal: setting_awal,
          druk_awal: druk_awal,
          file: '',
        },
        {
          withCredentials: true,
        },
      );
      // setIsLoading(false);
      getCetakMesinAwal();
    } catch (error: any) {
      console.log(error);
    }
  }
  async function simpanBarangRusak(id: number, startTime: any, catatan: any) {
    if (catatan == null) {
      // Check if start time is available
      alert('Catatan Belum Diisi Lengkap');
      return; // Exit function if no start time
    }
    const url = `${import.meta.env.VITE_API_LINK
      }/qc/cs/inspeksiBarangrusak/done/${id}`;
    try {
      const elapsedSeconds = calculateElapsedTime(startTime, new Date());
      console.log(elapsedSeconds);
      // setIsLoading(true);
      const res = await axios.put(
        url,
        {
          catatan: catatan,
          lama_pengerjaan: elapsedSeconds,
        },
        {
          withCredentials: true,
        },
      );
      // setIsLoading(false);
      getCetakMesinAwal();
    } catch (error: any) {
      console.log(error);
    }
  }
  const tanggal = convertTimeStampToDateOnly(cetakMesinAwal?.tanggal);
  const jam = convertDateToTime(cetakMesinAwal?.tanggal);

  // const jumlahWaktuCheck = formatElapsedTime(
  //     cetakMesinAwal?.inspeksi_cetak_awal[0].waktu_check,
  // );
  const isOnprogres = cetakMesinAwal?.barang_rusak_defect?.some(
    (data: { status: any }) => data?.status == 'incoming',
  );

  const [catatan, setCatatan] = useState<any>();

  return (
    <>
      {!isMobile && (
        <main className="overflow-x-hidden">
          <div className="min-w-[700px] bg-white rounded-xl">
            <p className="text-[14px] font-semibold w-full flex border-b-8 border-[#D8EAFF] py-4 px-9 md:ps-9 ps-12">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12ZM13 8C13 8.55228 12.5523 9 12 9C11.4477 9 11 8.55228 11 8C11 7.44772 11.4477 7 12 7C12.5523 7 13 7.44772 13 8ZM13 17V11H11V17H13Z"
                  fill="#0065DE"
                />
              </svg>{' '}
              BARANG RUSAK SEBAGIAN
            </p>

            <div className="flex w-full border-b-8 border-[#D8EAFF] px-8 py-8">
              <div className="flex w-[30%] ">
                <div className="flex flex-col gap-2 ">
                  <label className="text-neutral-500 text-sm font-semibold">
                    Tanggal
                  </label>
                  <label className="text-neutral-500 text-sm font-semibold">
                    No. JO
                  </label>
                  <label className="text-neutral-500 text-sm font-semibold">
                    No. IO
                  </label>
                  <label className="text-neutral-500 text-sm font-semibold">
                    Nama Produk
                  </label>
                  <label className="text-neutral-500 text-sm font-semibold">
                    Customer
                  </label>
                </div>
                <div className="flex flex-col gap-2 ">
                  <label className="text-neutral-500 text-sm font-semibold">
                    : {tanggal}
                  </label>
                  <label className="text-neutral-500 text-sm font-semibold">
                    : {cetakMesinAwal?.no_jo}
                  </label>
                  <label className="text-neutral-500 text-sm font-semibold">
                    : {cetakMesinAwal?.no_io}
                  </label>
                  <label className="text-neutral-500 text-sm font-semibold">
                    : {cetakMesinAwal?.nama_produk}
                  </label>
                  <label className="text-neutral-500 text-sm font-semibold">
                    : {cetakMesinAwal?.customer}
                  </label>
                </div>
              </div>

              <div className="flex w-[30%]">
                <div className="flex flex-col gap-2">
                  <label className="text-neutral-500 text-sm font-semibold">
                    Jam
                  </label>
                  <label className="text-neutral-500 text-sm font-semibold">
                    QTY Rusak Sebagian
                  </label>
                  <label className="text-neutral-500 text-sm font-semibold">
                    Waktu Sortir
                  </label>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-neutral-500 text-sm font-semibold">
                    : {jam}
                  </label>

                  <label className="text-neutral-500 text-sm font-semibold">
                    : {formatInteger(parseInt(cetakMesinAwal?.qty_rusak))}
                  </label>
                  <label className="text-neutral-500 text-sm font-semibold">
                    : {tanggal}
                  </label>
                </div>
              </div>
              <div className="flex w-[20%]">
                <div className="flex flex-col">
                  <label className="text-neutral-500 text-sm font-semibold">
                    Inspector
                  </label>
                </div>
                <div className="flex flex-col">
                  <label className="text-neutral-500 text-sm font-semibold">
                    : {cetakMesinAwal?.inspektor?.nama}
                  </label>
                </div>
              </div>
              <div className="flex w-[20%] flex-col">
                {cetakMesinAwal?.waktu_sortir == null ? (
                  <>
                    <p className="font-bold text-[#DE0000]">
                      Task Belum Dimulai
                    </p>

                    <button
                      onClick={() => startTaskCekAwal(cetakMesinAwal?.id)}
                      className="flex w-[60%]  rounded-md bg-[#00B81D] justify-center items-center px-2 py-2 hover:cursor-pointer"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12.7645 4.95136L3.63887 0.27536C1.96704 -0.581285 0 0.664567 0 2.58008V11.4199C0 13.3354 1.96704 14.5813 3.63887 13.7246L12.7645 9.04864C14.4118 8.20456 14.4118 5.79544 12.7645 4.95136Z"
                          fill="white"
                        />
                      </svg>
                    </button>
                  </>
                ) : cetakMesinAwal?.status == 'history' ? (
                  <></>
                ) : (
                  <>
                    <p className="md:text-[14px] text-[9px] text-[#00B81D] font-semibold">
                      Task DiMulai
                    </p>
                  </>
                )}
              </div>
            </div>
            {cetakMesinAwal?.waktu_sortir == null ? (
              <>
                <div className="flex px-2 py-4">
                  <p className="md:text-[14px] text-[9px] text-[#00B81D] font-semibold">
                    Mulai Task Untuk Memunculkan Checksheet
                  </p>
                </div>
              </>
            ) : (
              <>
                {cetakMesinAwal?.inspeksi_barang_rusak_defect?.map(
                  (data: any, i: number) => {
                    return (
                      <>
                        {cetakMesinAwal?.inspeksi_barang_rusak_defect[i]
                          .status == 'done' ? (
                          <>
                            <div className=" border-b-8 border-[#D8EAFF] px-6 py-6">
                              <div className="grid grid-cols-12  ">
                                <div className="flex flex-col col-span-5">
                                  <p className="text-blue-500 text-sm font-semibold">
                                    KODE MASALAH
                                  </p>
                                  <p className="text-neutral-500 text-sm font-semibold">
                                    {data?.kode}
                                  </p>
                                </div>
                                <div className="flex flex-col col-span-4">
                                  <p className="text-blue-500 text-sm font-semibold">
                                    JENIS DEFECT YANG DITEMUKAN
                                  </p>
                                  <p className="text-neutral-500 text-sm font-semibold">
                                    {data?.masalah}
                                  </p>
                                </div>
                                <div className="flex flex-col col-span-3">
                                  <>
                                    <label className="form-label block  text-black text-xs font-extrabold ">
                                      UPLOAD FOTO
                                    </label>

                                    <div className="flex  w-full mt-2 rounded-md border border-stroke px-2 py-2">
                                      <label
                                        htmlFor="formFile"
                                        className="flex items-center px-8 py-1 rounded-md bg-primary text-white font-medium cursor-pointer hover:bg-primary-dark"
                                      >
                                        Pilih File
                                        <input
                                          name="foto"
                                          disabled
                                          onChange={(e) =>
                                            handleChangePoint(e, i)
                                          }
                                          type="file"
                                          id="formFile"
                                          accept="image/*"
                                          className="hidden"
                                        />
                                      </label>

                                      <span
                                        id="formFile"
                                        className="ml-2 text-sm"
                                      ></span>
                                    </div>
                                  </>
                                </div>
                              </div>
                              <p className="text-blue-500 text-sm font-semibold">
                                QUANTITY TEMUAN
                              </p>
                              <div className="grid grid-cols-12  pt-2 gap-6">
                                <div className="flex flex-col col-span-2 gap-1">
                                  <p className="text-neutral-500 text-sm font-semibold">
                                    SETTING AWAL
                                  </p>
                                  <input
                                    name="setting_awal"
                                    value={formatInteger(parseInt(data?.setting_awal))}
                                    disabled
                                    type="number"
                                    className="w-full h-6 bg-white  rounded-sm  border-2 border-stroke"
                                  ></input>
                                </div>
                                <div className="flex flex-col col-span-2 gap-1">
                                  <p className="text-neutral-500 text-sm font-semibold">
                                    DRUK AWAL
                                  </p>
                                  <input
                                    name="druk_awal"
                                    value={formatInteger(parseInt(data?.druk_awal))}
                                    disabled
                                    type="number"
                                    className="w-full h-6 bg-white  rounded-sm  border-2 border-stroke"
                                  ></input>
                                </div>
                                <div className="flex flex-col col-span-2 gap-1">
                                  <p className="text-neutral-500 text-sm font-semibold">
                                    SUB TOTAL
                                  </p>
                                  <input
                                    value={formatInteger(parseInt(data?.sub_total))}
                                    type="number"
                                    disabled
                                    className="w-full h-6 bg-neutral-300  rounded-sm  border-2 border-stroke"
                                  ></input>
                                </div>
                                <div className="flex flex-col col-span-4 gap-1">
                                  <p className="text-neutral-500 text-sm font-semibold">
                                    CATATAN{' '}
                                    <span className="text-red-500">*</span> :
                                  </p>
                                  <input
                                    disabled
                                    name="catatan"
                                    value={data?.catatan}
                                    type="text"
                                    className="w-full h-6 bg-white  rounded-sm  border-2 border-stroke"
                                  ></input>
                                </div>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className=" border-b-8 border-[#D8EAFF] px-6 py-6">
                              <div className="grid grid-cols-12  ">
                                <div className="flex flex-col col-span-5">
                                  <p className="text-blue-500 text-sm font-semibold">
                                    KODE MASALAH
                                  </p>
                                  <p className="text-neutral-500 text-sm font-semibold">
                                    {data?.kode}
                                  </p>
                                </div>
                                <div className="flex flex-col col-span-4">
                                  <p className="text-blue-500 text-sm font-semibold">
                                    JENIS DEFECT YANG DITEMUKAN
                                  </p>
                                  <p className="text-neutral-500 text-sm font-semibold">
                                    {data?.masalah}
                                  </p>
                                </div>
                                <div className="flex flex-col col-span-3">
                                  <>
                                    <label className="form-label block  text-black text-xs font-extrabold ">
                                      UPLOAD FOTO
                                    </label>

                                    <div className="flex  w-full mt-2 rounded-md border border-stroke px-2 py-2">
                                      <label
                                        htmlFor="formFile"
                                        className="flex items-center px-8 py-1 rounded-md bg-primary text-white font-medium cursor-pointer hover:bg-primary-dark"
                                      >
                                        Pilih File
                                        <input
                                          name="foto"
                                          onChange={(e) =>
                                            handleChangePoint(e, i)
                                          }
                                          type="file"
                                          id="formFile"
                                          accept="image/*"
                                          className="hidden"
                                        />
                                      </label>

                                      <span
                                        id="formFile"
                                        className="ml-2 text-sm"
                                      ></span>
                                    </div>
                                  </>
                                </div>
                              </div>
                              <p className="text-blue-500 text-sm font-semibold">
                                QUANTITY TEMUAN
                              </p>
                              <div className="grid grid-cols-12  pt-2 gap-6">
                                <div className="flex flex-col col-span-2 gap-1">
                                  <p className="text-neutral-500 text-sm font-semibold">
                                    SETTING AWAL
                                  </p>
                                  <input
                                    name="setting_awal"
                                    onChange={(e) => {
                                      handleChangePoint(e, i);
                                    }}
                                    type="number"
                                    className="w-full h-6 bg-white  rounded-sm  border-2 border-stroke"
                                  ></input>
                                </div>
                                <div className="flex flex-col col-span-2 gap-1">
                                  <p className="text-neutral-500 text-sm font-semibold">
                                    DRUK AWAL
                                  </p>
                                  <input
                                    name="druk_awal"
                                    onChange={(e) => {
                                      handleChangePoint(e, i);
                                    }}
                                    type="number"
                                    className="w-full h-6 bg-white  rounded-sm  border-2 border-stroke"
                                  ></input>
                                </div>
                                <div className="flex flex-col col-span-2 gap-1">
                                  <p className="text-neutral-500 text-sm font-semibold">
                                    SUB TOTAL
                                  </p>
                                  <input
                                    value={
                                      parseInt(data.setting_awal) +
                                      parseInt(data.druk_awal)
                                    }
                                    onChange={(e) => handleChangePoint(e, i)}
                                    type="number"
                                    disabled
                                    className="w-full h-6 bg-neutral-300  rounded-sm  border-2 border-stroke"
                                  ></input>
                                </div>
                                <div className="flex flex-col col-span-4 gap-1">
                                  <p className="text-neutral-500 text-sm font-semibold">
                                    CATATAN{' '}
                                    <span className="text-red-500">*</span> :
                                  </p>
                                  <input
                                    name="catatan"
                                    onChange={(e) => handleChangePoint(e, i)}
                                    type="text"
                                    className="w-full h-6 bg-white  rounded-sm  border-2 border-stroke"
                                  ></input>
                                </div>
                                <div className="col-span-2 flex items-end">
                                  <button
                                    disabled={isLoading}
                                    onClick={() =>
                                      simpanDefect(
                                        data?.id,
                                        data?.catatan,
                                        data?.setting_awal,
                                        data?.druk_awal,
                                      )
                                    }
                                    className="bg-blue-600 rounded-md w-full h-7 text-white font-semibold text-sm"
                                  >
                                    {isLoading ? 'Loading...' : 'SIMPAN'}
                                  </button>
                                  {isLoading && <Loading />}
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </>
                    );
                  },
                )}
              </>
            )}
          </div>

          {cetakMesinAwal?.waktu_sortir != null &&
            cetakMesinAwal?.status == 'incoming' ? (
            <>
              <button
                // disabled={isLoading}
                onClick={openModal1}
                className=" w-[13%] h-10 rounded-sm bg-blue-600 text-white text-sm font-bold justify-center items-center px-4 py-2 hover:cursor-pointer"
              >
                {/* {isLoading ? 'Loading...' : ' */}+ Defect
                {/* '} */}
              </button>
              {/* {isLoading && <Loading />} */}
              {showModal1 && (
                <ModalAddPeriode
                  isOpen={showModal1}
                  onClose={closeModal1}
                  judul={'TAMBAH KODE MASALAH'}
                >
                  <>
                    <div className="flex flex-col gap-2">
                      <label className="text-black text-sm font-bold pt-4">
                        Master Defect
                      </label>
                      <select
                        onChange={(e) => {
                          const selectedDefect = defectMaster?.find(
                            (defect: any) =>
                              //console.log(defect.id)
                              defect.i_id == e.target.value,
                          );
                          console.log(selectedDefect);
                          if (selectedDefect) {
                            setKode(selectedDefect.e_kode_produksi);
                            setMasalah(selectedDefect.nama_kendala);
                            setAsalTemuan(selectedDefect.kategori_kendala);
                          }
                          console.log(selectedDefect);
                        }}
                        className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-2 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input 'text-black dark:text-white' 
                  }`}
                      >
                        <option
                          value=""
                          disabled
                          selected
                          className="text-body dark:text-bodydark"
                        >
                          Pilih Kode Defect
                        </option>
                        {defectMaster?.map(
                          (dataMaster: any, indexMaster: number) => {
                            return (
                              <option
                                value={dataMaster.i_id}
                                className="text-body dark:text-bodydark"
                              >
                                {dataMaster.e_kode_produksi} -{' '}
                                {dataMaster.nama_kendala}
                              </option>
                            );
                          },
                        )}
                      </select>
                      <button
                        disabled={isLoading}
                        onClick={() => {
                          tambahDefect(cetakMesinAwal?.id);
                          console.log(cetakMesinAwal?.id, kode, masalah);
                        }}
                        className="bg-blue-600 rounded-md w-full h-10 text-white font-semibold text-sm"
                      >
                        {isLoading ? 'Loading...' : 'TAMBAH DEFECT'}
                      </button>
                      {isLoading && <Loading />}
                    </div>
                  </>
                </ModalAddPeriode>
              )}
            </>
          ) : null}

          <div className=" border-b-8 items-center border-[#D8EAFF] px-4 py-4 gap-3 bg-white rounded-b-xl mt-2">
            <div className="flex w-[80%] gap-4">
              <div className="flex flex-col">
                <p className="text-neutral-500 text-sm font-semibold">
                  SETTING AWAL
                </p>

                <input
                  value={formatInteger(parseInt(total?.defect[0].setting_awal))}
                  type="text"
                  disabled
                  className="w-full h-6 bg-neutral-300  rounded-sm  border-2 border-stroke"
                ></input>
              </div>
              <div className="flex flex-col">
                <p className="text-neutral-500 text-sm font-semibold">
                  DRUK AWAL
                </p>
                <input
                  value={formatInteger(parseInt(total?.defect[0].druk_awal))}
                  type="text"
                  disabled
                  className="w-full h-6 bg-neutral-300  rounded-sm  border-2 border-stroke"
                ></input>
              </div>
              <div className="flex flex-col">
                <p className="text-neutral-500 text-sm font-semibold">
                  SUB TOTAL
                </p>
                <input
                  value={formatInteger(parseInt(total?.defect[0].sub_total))}
                  type="text"
                  disabled
                  className="w-full h-6 bg-neutral-300  rounded-sm  border-2 border-stroke"
                ></input>
              </div>
              <div className="flex flex-col">
                <p className="text-neutral-500 text-sm font-semibold">
                  BARANG BAIK
                </p>
                <input
                  value={formatInteger(parseInt(total?.barangBaik))}
                  type="text"
                  disabled
                  className="w-full h-6 bg-neutral-300  rounded-sm  border-2 border-stroke"
                ></input>
              </div>
            </div>

            <div className="flex w-full justify-between gap-8">
              <div className="flex flex-col w-full">
                <label className="form-label block  text-black text-xs font-extrabold mt-3">
                  CATATAN <span className="text-red-500">*</span> :
                </label>
                {cetakMesinAwal?.status == 'incoming' ? (
                  <textarea
                    onChange={(e) => setCatatan(e.target.value)}
                    className="peer w-full min-h-[80px]  resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                  ></textarea>
                ) : (
                  <>
                    <textarea
                      disabled
                      defaultValue={cetakMesinAwal?.catatan}
                      className="peer w-full min-h-[80px]  resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                    ></textarea>
                  </>
                )}
              </div>
              <div className="grid col-span-6 items-end justify-end gap-2">
                {!isOnprogres && cetakMesinAwal?.status == 'incoming' ? (
                  <>
                    <button
                      onClick={() =>
                        simpanBarangRusak(
                          cetakMesinAwal?.id,
                          cetakMesinAwal?.waktu_sortir,
                          catatan,
                        )
                      }
                      className=" w-full h-10 rounded-md bg-[#00B81D] text-white text-xs font-bold justify-center items-center px-10 py-2 hover:cursor-pointer"
                    >
                      SIMPAN CHECKSHEET
                    </button>
                  </>
                ) : (
                  <></>
                )}

                {/* ) : null} */}
              </div>
            </div>
          </div>
        </main>
      )}
    </>
  );
}

export default CheckSheetBarangRS;
