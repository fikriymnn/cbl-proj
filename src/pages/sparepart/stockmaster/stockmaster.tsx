import React, { useEffect, useState } from 'react';
import DefaultLayout from '../../../layout/DefaultLayout';
import axios from 'axios';
import formatInteger from '../../../utils/formaterInteger';
import ModalKosonganSmall from '../../../components/Modals/ModalKosonganSmall';
import Loading from '../../../components/Loading';
import ModalKosongan from '../../../components/Modals/Qc/NCR/NCRResponQC';

function Stockmaster() {
  const [stokSparepart, setStokSparepart] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState<boolean>(false);
  const [isAddLoading, setIsAddLoading] = useState<boolean>(false);

  useEffect(() => {
    getStokSparepart();
    getMesin();
    getMasterGrade();
  }, []);

  async function getStokSparepart() {
    const url = `${import.meta.env.VITE_API_LINK}/stokSparepart`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        withCredentials: true,
      });
      setStokSparepart(res.data);
      setIsLoading(false);
      console.log(res.data);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error.response);
    }
  }

  const [mesin, setMesin] = useState<any>();

  async function getMesin() {
    const url = `${import.meta.env.VITE_API_LINK}/master/mesin`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        withCredentials: true,
      });
      setIsLoading(false);
      setMesin(res.data);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error.data.msg);
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

  const [kode, setKode] = useState<any>();
  const [partNumber, setPartNumber] = useState<any>();
  const [namaSparepart, setNamaSparePart] = useState<any>();
  const [lokasi, setLokasi] = useState<any>();
  const [mesinEdit, setMesinEdit] = useState<any>();
  const [umurEdit, setumurEdit] = useState<any>();

  async function editStock(id: any, i: any) {
    if (isEditLoading) return; // Prevent multiple clicks

    const url = `${import.meta.env.VITE_API_LINK}/stokSparepart/${id}`;
    try {
      setIsEditLoading(true);
      const res = await axios.put(
        url,
        {
          kode: kode,
          nama_sparepart: namaSparepart,
          part_number: partNumber,
          lokasi: lokasi,
          id_mesin: mesinEdit,
          umur_sparepart: umurEdit,
        },
        {
          withCredentials: true,
        },
      );
      setKode('');
      setPartNumber('');
      setNamaSparePart('');
      setLokasi('');
      setMesinEdit('');
      setumurEdit('');
      setIsEditLoading(false);
      closeEdit(i);
      getStokSparepart();
      alert('Edit Success');
      console.log(res.data);
    } catch (error: any) {
      setIsEditLoading(false);
      alert(error.response.data.msg);
      console.log(error.response);
    }
  }

  const [addItem, setAddItem] = useState({
    kode: '',
    nama_sparepart: '',
    id_mesin: 0,
    part_number: '',
    lokasi: '',
    limit_stok: 0,
    id_grade: '',
    type_part: '',
    foto: '',
    keterangan: '',
    umur_sparepart: 0,
    stok: 0,
  });

  const [masterGrade, setmasterGrade] = useState<any>();

  async function getMasterGrade() {
    const url = `${import.meta.env.VITE_API_LINK}/master/grade`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        withCredentials: true,
      });
      setIsLoading(false);
      setmasterGrade(res.data);
      console.log(res.data);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error.data.msg);
    }
  }

  async function addStok() {
    if (isAddLoading) return; // Prevent multiple clicks

    const url = `${import.meta.env.VITE_API_LINK}/stokSparepart`;
    try {
      setIsAddLoading(true);
      const res = await axios.post(
        url,
        {
          kode: addItem.kode,
          nama_sparepart: addItem.nama_sparepart,
          id_mesin: addItem.id_mesin,
          part_number: addItem.part_number,
          lokasi: addItem.lokasi,
          limit_stok: addItem.limit_stok,
          id_grade: addItem.id_grade,
          type_part: addItem.type_part,
          stok: addItem.stok,
          foto: addItem.foto,
          keterangan: addItem.keterangan,
          umur_sparepart: addItem.umur_sparepart,
        },
        {
          withCredentials: true,
        },
      );
      setIsAddLoading(false);
      alert('Add Success');
      getStokSparepart();
      closeModalHistory();
      console.log(res.data);
    } catch (error: any) {
      setIsAddLoading(false);
      alert(error.response.data.msg);
      console.log(error.response);
    }
  }

  //change value Data
  const handleChangeData = (e: any) => {
    const { name, value } = e.target;
    const onchangeVal: any = { ...addItem };
    onchangeVal[name] = value;
    setAddItem(onchangeVal);
  };

  const [showHistory, setShowHistory] = useState(false);
  const openModalHistory = () => setShowHistory(true);
  const closeModalHistory = () => setShowHistory(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = stokSparepart
    ?.filter((data: any) =>
      [
        data.kode,
        data.mesin?.nama_mesin,
        data.part_number,
        data.nama_sparepart,
      ].some(
        (field) => field?.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    )
    .slice()
    .sort((a: any, b: any) => {
      const numA = parseInt(a.kode.match(/\d+/)?.[0] || '0', 10);
      const numB = parseInt(b.kode.match(/\d+/)?.[0] || '0', 10);
      return numA - numB;
    });

  return (
    <DefaultLayout>
      <>
        {isLoading && <Loading />}
        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          Maintenance &gt; Sparepart &gt; Stock Master
        </p>
        <div className="w-full py-2 rounded-md bg-white p-3 flex gap-5">
          <div className="flex justify-between w-full">
            <div className="w-[50%] flex text-sm">
              <input
                type="text"
                placeholder="Cari Berdasarkan kode, mesin, part number, atau nama sparepart"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border p-2 mb-4 w-full"
              />
            </div>
            <div className="flex gap-5">
              <button
                onClick={() => openModalHistory()}
                disabled={isAddLoading}
                className={`px-3 py-2 ${
                  isAddLoading ? 'bg-gray-400' : 'bg-green-600'
                } text-white font-semibold text-xs rounded-md`}
              >
                {isAddLoading ? 'LOADING...' : 'ADD ITEM'}
              </button>
              {showHistory == true && (
                <>
                  <ModalKosongan
                    isOpen={showHistory}
                    onClose={() => closeModalHistory()}
                    judul={'Tambah Item'}
                  >
                    <>
                      <div className="grid md:grid-cols-3 gap-5 p-3 bg-white text-black">
                        <div className="mt-5 flex flex-col justify-center px-2">
                          <p className="text-xs font-semibold">Kode barang</p>
                          <div className="flex justify-center items-center">
                            <div className="relative z-20 border-2 border-[#EDEDED] shadow-md rounded-md dark:bg-form-input  w-full mt-2">
                              <input
                                name="kode"
                                onChange={(e) => handleChangeData(e)}
                                className={`relative font-medium z-20 w-full appearance-none rounded border border-stroke bg-transparent py-1   px-1 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-inputtext-black dark:text-white' 
                                                }`}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="mt-5 flex flex-col justify-center px-2">
                          <p className="text-xs font-semibold">Part Number</p>
                          <div className="flex justify-center items-center">
                            <div className="relative z-20 border-2 border-[#EDEDED] shadow-md rounded-md dark:bg-form-input  w-full mt-2">
                              <input
                                name="part_number"
                                onChange={(e) => handleChangeData(e)}
                                className={`relative font-medium z-20 w-full appearance-none rounded border border-stroke bg-transparent py-1   px-1 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-inputtext-black dark:text-white' 
                                                }`}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="mt-5 flex flex-col justify-center px-2">
                          <p className="text-xs font-semibold">Nama Barang</p>
                          <div className="flex justify-center items-center">
                            <div className="relative z-20 border-2 border-[#EDEDED] shadow-md rounded-md dark:bg-form-input  w-full mt-2">
                              <input
                                name="nama_sparepart"
                                onChange={(e) => handleChangeData(e)}
                                className={`relative font-medium z-20 w-full appearance-none rounded border border-stroke bg-transparent py-1   px-1 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-inputtext-black dark:text-white' 
                                                }`}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="mt-5 flex flex-col justify-center px-2">
                          <p className="text-xs font-semibold">Nama Mesin</p>
                          <div className="flex justify-center items-center">
                            <div className="relative z-20 border-2 border-[#EDEDED] shadow-md rounded-md dark:bg-form-input  w-full mt-2">
                              <span className="absolute top-1/2 left-4 z-30 -translate-y-1/2">
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 20 20"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                ></svg>
                              </span>

                              <select
                                name="id_mesin"
                                onChange={(e) => handleChangeData(e)}
                                className={`relative font-medium z-20 w-full appearance-none rounded border border-stroke bg-transparent py-1   px-1 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-inputtext-black dark:text-white' 
                                            }`}
                              >
                                <option
                                  value=""
                                  className="text-body dark:text-bodydark"
                                >
                                  Select Mesin
                                </option>
                                {mesin?.map((data: any, index: number) => {
                                  return (
                                    <option
                                      key={index}
                                      value={data.id}
                                      className="text-body dark:text-bodydark"
                                    >
                                      {data.nama_mesin}
                                    </option>
                                  );
                                })}
                              </select>

                              <span className="absolute top-1/2 right-4 z-10 -translate-y-1/2">
                                <svg
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <g opacity="0.8">
                                    <path
                                      fillRule="evenodd"
                                      clipRule="evenodd"
                                      d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                                      fill="#637381"
                                    ></path>
                                  </g>
                                </svg>
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-5 flex flex-col justify-center px-2">
                          <p className="text-xs font-semibold">Lokasi</p>
                          <div className="flex justify-center items-center">
                            <div className="relative z-20 border-2 border-[#EDEDED] shadow-md rounded-md dark:bg-form-input  w-full mt-2">
                              <input
                                name="lokasi"
                                onChange={(e) => handleChangeData(e)}
                                className={`relative font-medium z-20 w-full appearance-none rounded border border-stroke bg-transparent py-1   px-1 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-inputtext-black dark:text-white' 
                                            }`}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="mt-5 flex flex-col justify-center px-2">
                          <p className="text-xs font-semibold">Quantity Stok</p>
                          <div className="flex justify-center items-center">
                            <div className="relative z-20 border-2 border-[#EDEDED] shadow-md rounded-md dark:bg-form-input  w-full mt-2">
                              <input
                                name="stok"
                                onChange={(e) => handleChangeData(e)}
                                className={`relative font-medium z-20 w-full appearance-none rounded border border-stroke bg-transparent py-1   px-1 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-inputtext-black dark:text-white' 
                                            }`}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="mt-5 flex flex-col justify-center px-2">
                          <p className="text-xs font-semibold">Umur Original</p>
                          <div className="flex justify-center items-center">
                            <div className="relative z-20 border-2 border-[#EDEDED] shadow-md rounded-md dark:bg-form-input  w-full mt-2">
                              <input
                                name="umur_sparepart"
                                onChange={(e) => handleChangeData(e)}
                                className={`relative font-medium z-20 w-full appearance-none rounded border border-stroke bg-transparent py-1   px-1 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-inputtext-black dark:text-white' 
                                                }`}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="mt-5 flex flex-col justify-center px-2">
                          <p className="text-xs font-semibold">
                            Grade (keperluan awal)
                          </p>
                          <div className="flex justify-center items-center">
                            <div className="relative z-20 border-2 border-[#EDEDED] shadow-md rounded-md dark:bg-form-input  w-full mt-2">
                              <select
                                name="id_grade"
                                onChange={(e) => handleChangeData(e)}
                                className={`relative font-medium z-20 w-full appearance-none rounded border border-stroke bg-transparent py-1   px-1 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-inputtext-black dark:text-white' 
                                                }`}
                              >
                                <option
                                  value=""
                                  className="text-body dark:text-bodydark"
                                >
                                  Select Grade
                                </option>
                                {masterGrade?.map(
                                  (data: any, index: number) => {
                                    return (
                                      <option
                                        key={index}
                                        value={data.id}
                                        className="text-body dark:text-bodydark"
                                      >
                                        {data.grade} - {data.percent}
                                      </option>
                                    );
                                  },
                                )}
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 flex flex-col justify-center px-2">
                          <p className="text-xs font-semibold">Type Part </p>
                          <div className="flex justify-center items-center">
                            <div className="relative z-20 border-2 border-[#EDEDED] shadow-md rounded-md dark:bg-form-input  w-full mt-2">
                              <span className="absolute top-1/2 left-4 z-30 -translate-y-1/2">
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 20 20"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                ></svg>
                              </span>

                              <select
                                name="type_part"
                                onChange={(e) => handleChangeData(e)}
                                className={`relative font-medium z-20 w-full appearance-none rounded border border-stroke bg-transparent py-1   px-1 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-inputtext-black dark:text-white' 
                                            }`}
                              >
                                <option
                                  value=""
                                  selected
                                  className="text-body dark:text-bodydark"
                                >
                                  SELECT DATA
                                </option>
                                <option
                                  value="CONSUMABLE"
                                  className="text-body dark:text-bodydark"
                                >
                                  CONSUMABLE
                                </option>
                                <option
                                  value="NON CONSUMABLE"
                                  className="text-body dark:text-bodydark"
                                >
                                  NON CONSUMABLE
                                </option>
                              </select>

                              <span className="absolute top-1/2 right-4 z-10 -translate-y-1/2">
                                <svg
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <g opacity="0.8">
                                    <path
                                      fillRule="evenodd"
                                      clipRule="evenodd"
                                      d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                                      fill="#637381"
                                    ></path>
                                  </g>
                                </svg>
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-5 flex flex-col justify-center px-2">
                          <p className="text-xs font-semibold">
                            Set Buffer Stock (Khusus Consumable)
                          </p>
                          <div className="flex justify-center items-center">
                            <div className="relative z-20 border-2 border-[#EDEDED] shadow-md rounded-md dark:bg-form-input  w-full mt-2">
                              <input
                                name="limit_stok"
                                onChange={(e) => handleChangeData(e)}
                                className={`relative font-medium z-20 w-full appearance-none rounded border border-stroke bg-transparent py-1   px-1 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-inputtext-black dark:text-white' 
                                                }`}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="mt-5 flex flex-col justify-center px-2">
                          <p className="text-xs font-semibold">Foto</p>
                          <div className="flex justify-center items-center">
                            <div className="relative z-20 border-2 border-[#EDEDED] shadow-md rounded-md dark:bg-form-input  w-full mt-2">
                              <input
                                className={`relative font-medium z-20 w-full appearance-none rounded border border-stroke bg-transparent py-1   px-1 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-inputtext-black dark:text-white' 
                                                }`}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end items-end ">
                          <button
                            onClick={() => {
                              addStok();
                              console.log(addItem);
                            }}
                            disabled={isAddLoading}
                            className={`h-9 w-full text-white font-semibold rounded-md text-xs ${
                              isAddLoading ? 'bg-gray-400' : 'bg-green-500'
                            }`}
                          >
                            {isAddLoading ? 'LOADING...' : 'SAVE'}
                          </button>
                        </div>
                      </div>
                    </>
                  </ModalKosongan>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex bg-white py-2 mt-2 px-1">
          <p className="text-xs font-semibold w-[2%] text-center">No</p>
          <div className="grid grid-cols-12 w-[98%] text-center">
            <p className="text-xs font-semibold">Kode</p>
            <p className="text-xs font-semibold">Part Number</p>
            <p className="text-xs font-semibold col-span-2">Nama Barang </p>
            <p className="text-xs font-semibold">Mesin</p>
            <p className="text-xs font-semibold">Lokasi</p>
            <p className="text-xs font-semibold">Umur Original</p>
            <p className="text-xs font-semibold">Grade</p>
            <p className="text-xs font-semibold">QTY</p>
            <p className="text-xs font-semibold">Type Part </p>
            <p className="text-xs font-semibold">Buffer Stock</p>
            <p className="text-xs font-semibold">Action</p>
          </div>
        </div>

        {filteredData
          ?.slice()
          .sort((a: any, b: any) => {
            const numA = parseInt(a.kode.match(/\d+/)?.[0] || '0', 10);
            const numB = parseInt(b.kode.match(/\d+/)?.[0] || '0', 10);
            return numA - numB;
          })
          .map((data: any, i: number) => {
            return (
              <>
                <div
                  className={`flex  py-2 px-1 text-center ${
                    data.stok <= 0 ? 'bg-red-200' : 'bg-white'
                  }`}
                >
                  <p className="text-xs w-[2%]">{i + 1}</p>
                  <div className="grid grid-cols-12 w-[98%] text-center">
                    <p className="text-xs">{data.kode}</p>
                    <p className="text-xs">{data.part_number}</p>
                    <p className="text-xs col-span-2">{data.nama_sparepart} </p>
                    <p className="text-xs">{data.mesin?.nama_mesin}</p>
                    <p className="text-xs">{data.lokasi}</p>
                    <p className="text-xs">
                      {formatInteger(data.umur_sparepart)}
                    </p>
                    <p className="text-xs">{data.grade}</p>
                    <p
                      className={`text-xs ${
                        data.stok <= 0 ? 'text-red-500 font-bold' : ''
                      }`}
                    >
                      {data.stok}
                    </p>
                    <p className="text-xs">{data.type_part}</p>
                    <p className="text-xs">{data.limit_stok}</p>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => openEdit(i)}
                        disabled={isEditLoading}
                        className={`rounded-sm text-white text-xs font-bold px-4 py-1 ${
                          isEditLoading ? 'bg-gray-400' : 'bg-blue-600'
                        }`}
                      >
                        {isEditLoading ? 'LOADING...' : 'EDIT'}
                      </button>
                      {showEdit[i] == true && (
                        <ModalKosonganSmall
                          isOpen={showEdit[i]}
                          onClose={() => closeEdit(i)}
                          judul={'Edit Stok Master'}
                        >
                          <>
                            <div className="grid gap-3 w-full px-5 py-2">
                              <>
                                <div className="flex w-full flex-col">
                                  <label className="text-black text-xs font-bold">
                                    Kode
                                  </label>
                                  <div className="flex w-full">
                                    <input
                                      name="kode"
                                      defaultValue={data.kode}
                                      onChange={(e) => {
                                        setKode(e.target.value);
                                      }}
                                      type="text"
                                      className=" w-[387px] h-10 border-2 border-stroke rounded-md"
                                    />
                                  </div>
                                </div>
                                <div className="flex w-full flex-col">
                                  <label className="text-black text-xs font-bold">
                                    Part Number
                                  </label>
                                  <div className="flex w-full">
                                    <input
                                      name="part_number"
                                      defaultValue={data.part_number}
                                      onChange={(e) => {
                                        setPartNumber(e.target.value);
                                      }}
                                      type="text"
                                      className=" w-[387px] h-10 border-2 border-stroke rounded-md"
                                    />
                                  </div>
                                </div>
                                <div className="flex w-full flex-col">
                                  <label className="text-black text-xs font-bold">
                                    Nama SparePart
                                  </label>
                                  <div className="flex w-full">
                                    <input
                                      name="nama_sparepart"
                                      defaultValue={data.nama_sparepart}
                                      onChange={(e) => {
                                        setNamaSparePart(e.target.value);
                                      }}
                                      type="text"
                                      className=" w-[387px] h-10 border-2 border-stroke rounded-md"
                                    />
                                  </div>
                                </div>
                                <div className="flex w-full flex-col">
                                  <label className="text-black text-xs font-bold">
                                    Lokasi
                                  </label>
                                  <div className="flex w-full">
                                    <input
                                      name="lokasi"
                                      defaultValue={data.lokasi}
                                      onChange={(e) => {
                                        setLokasi(e.target.value);
                                      }}
                                      type="text"
                                      className=" w-[387px] h-10 border-2 border-stroke rounded-md"
                                    />
                                  </div>
                                </div>
                                <div className="flex w-full flex-col">
                                  <label className="text-black text-xs font-bold">
                                    Umur Sparepart
                                  </label>
                                  <div className="flex w-full">
                                    <input
                                      name="umur_sparepart"
                                      defaultValue={data.umur_sparepart}
                                      onChange={(e) => {
                                        setumurEdit(e.target.value);
                                      }}
                                      type="text"
                                      className=" w-[387px] h-10 border-2 border-stroke rounded-md"
                                    />
                                  </div>
                                </div>
                                <div className="flex w-full flex-col">
                                  <label className="text-black text-xs font-bold">
                                    Mesin
                                  </label>
                                  <select
                                    name="id_mesin"
                                    onChange={(e) => {
                                      setMesinEdit(e.target.value);
                                    }}
                                    className={`w-[387px] h-10 border-2 border-stroke rounded-md' 
                                            }`}
                                  >
                                    <option
                                      value=""
                                      className="text-body dark:text-bodydark"
                                    >
                                      Select Mesin
                                    </option>
                                    {mesin?.map((data: any, index: number) => {
                                      return (
                                        <option
                                          key={index}
                                          value={data.id}
                                          className="text-body dark:text-bodydark"
                                        >
                                          {data.nama_mesin}
                                        </option>
                                      );
                                    })}
                                  </select>
                                </div>

                                <div className=" pt-3">
                                  <button
                                    onClick={() => editStock(data.id, i)}
                                    className="bg-[#0065DE] text-center text-white text-xs font-bold px-6 py-3 rounded-md"
                                  >
                                    SIMPAN
                                  </button>
                                </div>
                              </>
                            </div>
                          </>
                        </ModalKosonganSmall>
                      )}
                    </div>
                  </div>
                </div>
              </>
            );
          })}
      </>
    </DefaultLayout>
  );
}

export default Stockmaster;
