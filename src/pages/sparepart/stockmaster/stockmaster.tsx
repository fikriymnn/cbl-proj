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
  const [limitStokEdit, setLimitStokEdit] = useState<any>();

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
          limit_stok: limitStokEdit,
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
      setLimitStokEdit('');
      setIsEditLoading(false);
      closeEdit(i);
      getStokSparepart();
      alert('Edit Success');
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
                className="border border-gray-300 rounded-lg px-4 py-2 mb-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-5">
              <button
                onClick={() => openModalHistory()}
                disabled={isAddLoading}
                className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                  isAddLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg'
                } text-white`}
              >
                {isAddLoading ? 'Loading...' : '+ Add Item'}
              </button>
              {showHistory == true && (
                <>
                  <ModalKosongan
                    isOpen={showHistory}
                    onClose={() => closeModalHistory()}
                    judul={'Add New Item'}
                  >
                    <>
                      <div className="p-6 bg-white">
                        <h3 className="text-lg font-semibold text-gray-800 mb-6 border-b pb-3">
                          Add New Sparepart Item
                        </h3>
                        <div className="grid md:grid-cols-3 gap-6">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                              Item Code *
                            </label>
                            <input
                              name="kode"
                              onChange={(e) => handleChangeData(e)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter item code"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                              Part Number *
                            </label>
                            <input
                              name="part_number"
                              onChange={(e) => handleChangeData(e)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter part number"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                              Item Name *
                            </label>
                            <input
                              name="nama_sparepart"
                              onChange={(e) => handleChangeData(e)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter item name"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                              Machine *
                            </label>
                            <select
                              name="id_mesin"
                              onChange={(e) => handleChangeData(e)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="">Select Machine</option>
                              {mesin?.map((data: any, index: number) => (
                                <option key={index} value={data.id}>
                                  {data.nama_mesin}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                              Location
                            </label>
                            <input
                              name="lokasi"
                              onChange={(e) => handleChangeData(e)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter location"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                              Stock Quantity *
                            </label>
                            <input
                              name="stok"
                              type="number"
                              onChange={(e) => handleChangeData(e)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter stock quantity"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                              Original Life (Hours)
                            </label>
                            <input
                              name="umur_sparepart"
                              type="number"
                              onChange={(e) => handleChangeData(e)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter original life in hours"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                              Grade
                            </label>
                            <select
                              name="id_grade"
                              onChange={(e) => handleChangeData(e)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="">Select Grade</option>
                              {masterGrade?.map((data: any, index: number) => (
                                <option key={index} value={data.id}>
                                  {data.grade} - {data.percent}%
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                              Part Type *
                            </label>
                            <select
                              name="type_part"
                              onChange={(e) => handleChangeData(e)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="">Select Part Type</option>
                              <option value="CONSUMABLE">Consumable</option>
                              <option value="NON CONSUMABLE">
                                Non Consumable
                              </option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                              Buffer Stock
                            </label>
                            <input
                              name="limit_stok"
                              type="number"
                              onChange={(e) => handleChangeData(e)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter buffer stock"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                              Photo
                            </label>
                            <input
                              name="foto"
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleChangeData(e)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
                          <button
                            onClick={() => closeModalHistory()}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              addStok();
                            }}
                            disabled={isAddLoading}
                            className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
                              isAddLoading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg'
                            } text-white`}
                          >
                            {isAddLoading ? 'Saving...' : 'Save Item'}
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
                        className={`rounded-lg text-white text-xs font-semibold px-4 py-1 transition-all duration-200 ${
                          isEditLoading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md'
                        }`}
                      >
                        {isEditLoading ? 'Loading...' : 'Edit'}
                      </button>
                      {showEdit[i] == true && (
                        <ModalKosonganSmall
                          isOpen={showEdit[i]}
                          onClose={() => closeEdit(i)}
                          judul={'Edit Stock Master'}
                        >
                          <>
                            <div className="p-6 bg-white">
                              <h3 className="text-lg font-semibold text-gray-800 mb-6 border-b pb-3">
                                Edit Sparepart Information
                              </h3>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">
                                      Item Code *
                                    </label>
                                    <input
                                      name="kode"
                                      defaultValue={data.kode}
                                      onChange={(e) => setKode(e.target.value)}
                                      type="text"
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">
                                      Part Number *
                                    </label>
                                    <input
                                      name="part_number"
                                      defaultValue={data.part_number}
                                      onChange={(e) =>
                                        setPartNumber(e.target.value)
                                      }
                                      type="text"
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-gray-700">
                                    Sparepart Name *
                                  </label>
                                  <input
                                    name="nama_sparepart"
                                    defaultValue={data.nama_sparepart}
                                    onChange={(e) =>
                                      setNamaSparePart(e.target.value)
                                    }
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">
                                      Location
                                    </label>
                                    <input
                                      name="lokasi"
                                      defaultValue={data.lokasi}
                                      onChange={(e) =>
                                        setLokasi(e.target.value)
                                      }
                                      type="text"
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">
                                      Original Life (Hours)
                                    </label>
                                    <input
                                      name="umur_sparepart"
                                      defaultValue={data.umur_sparepart}
                                      onChange={(e) =>
                                        setumurEdit(e.target.value)
                                      }
                                      type="number"
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">
                                      Machine *
                                    </label>
                                    <select
                                      name="id_mesin"
                                      defaultValue={data.mesin?.id}
                                      onChange={(e) =>
                                        setMesinEdit(e.target.value)
                                      }
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                      <option value="">Select Machine</option>
                                      {mesin?.map(
                                        (mesinData: any, index: number) => (
                                          <option
                                            key={index}
                                            value={mesinData.id}
                                          >
                                            {mesinData.nama_mesin}
                                          </option>
                                        ),
                                      )}
                                    </select>
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">
                                      Buffer Stock
                                    </label>
                                    <input
                                      name="limit_stok"
                                      defaultValue={data.limit_stok}
                                      onChange={(e) =>
                                        setLimitStokEdit(e.target.value)
                                      }
                                      type="number"
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
                                <button
                                  onClick={() => closeEdit(i)}
                                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => editStock(data.id, i)}
                                  disabled={isEditLoading}
                                  className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
                                    isEditLoading
                                      ? 'bg-gray-400 cursor-not-allowed'
                                      : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
                                  } text-white`}
                                >
                                  {isEditLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                              </div>
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
