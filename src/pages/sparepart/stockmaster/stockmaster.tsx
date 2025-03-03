import React, { useEffect, useState } from 'react';
import DefaultLayout from '../../../layout/DefaultLayout';
import { Link } from 'react-router-dom';
import axios from 'axios';
import formatInteger from '../../../utils/formaterInteger';
import ModalKosonganSmall from '../../../components/Modals/ModalKosonganSmall';
import Loading from '../../../components/Loading';

function Stockmaster() {
  const [stokSparepart, setStokSparepart] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    getStokSparepart();
    getMesin();
  }, []);

  async function getStokSparepart() {
    const url = `${import.meta.env.VITE_API_LINK}/stokSparepart`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      setStokSparepart(res.data);
      console.log(res.data);
    } catch (error: any) {
      console.log(error.response);
    }
  }
  const [mesin, setMesin] = useState<any>();

  async function getMesin() {
    const url = `${import.meta.env.VITE_API_LINK}/master/mesin`;
    try {
      setIsLoading(true)
      const res = await axios.get(url, {
        withCredentials: true,
      });
      setIsLoading(false)
      setMesin(res.data);
    } catch (error: any) {
      setIsLoading(false)
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

  async function editStock(id: any) {
    const url = `${import.meta.env.VITE_API_LINK}/stokSparepart/${id}`;
    try {
      setIsLoading(true)
      const res = await axios.put(
        url,
        {
          kode: kode,
          nama_sparepart: namaSparepart,
          part_number: partNumber,
          lokasi: lokasi,
          id_mesin: mesinEdit
        },
        {
          withCredentials: true,
        },
      );
      setIsLoading(false)
      getStokSparepart()
      alert('Edit Success');
      console.log(res.data);
    } catch (error: any) {
      setIsLoading(false)
      alert(error.response.data.msg);
      console.log(error.response);
    }
  }
  return (
    <DefaultLayout>
      <>
        {isLoading && <Loading />}
        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          Maintenance &gt; Sparepart &gt; Stock Master
        </p>
        <div className="w-full py-2 rounded-md bg-white p-3 flex gap-5">
          <div className="flex justify-between w-full">
            <input
              type="text"
              placeholder="Cari Barang"
              className="w-4/12 bg-[#D8EAFF] rounded-sm px-2"
            />
            <div className="flex gap-5">
              <Link
                to={'addStock'}
                className="px-3 py-2 bg-green-600 text-white  font-semibold text-xs rounded-md"
              >
                ADD ITEM
              </Link>
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

        {stokSparepart
          ?.slice() // Make a shallow copy to avoid mutating original data
          .sort((a: any, b: any) => {
            const numA = parseInt(a.kode.match(/\d+/)?.[0] || "0", 10);
            const numB = parseInt(b.kode.match(/\d+/)?.[0] || "0", 10);
            return numA - numB;
          })
          .map((data: any, i: number) => {
            return (
              <>
                <div className="flex bg-white py-2 px-1 text-center">
                  <p className="text-xs w-[2%]">{i + 1}</p>
                  <div className="grid grid-cols-12 w-[98%] text-center">
                    <p className="text-xs">{data.kode}</p>
                    <p className="text-xs">{data.part_number}</p>
                    <p className="text-xs col-span-2">{data.nama_sparepart} </p>
                    <p className="text-xs">{data.mesin.nama_mesin}</p>
                    <p className="text-xs">{data.lokasi}</p>
                    <p className="text-xs">{formatInteger(data.umur_sparepart)}</p>
                    <p className="text-xs">{data.grade}</p>
                    <p className={`text-xs ${data.stok <= 0 ? "text-red-500 font-bold" : ""}`}>
                      {data.stok}
                    </p>
                    <p className="text-xs">{data.type_part}</p>
                    <p className="text-xs">{data.limit_stok}</p>
                    <div className='flex flex-col gap-1'>
                      <button onClick={() => openEdit(i)} className='bg-blue-600 rounded-sm text-white text-xs font-bold px-4 py-1'>
                        EDIT
                      </button>
                      {showEdit[i] == true && (

                        <ModalKosonganSmall
                          isOpen={showEdit[i]}
                          onClose={() => closeEdit(i)}
                          judul={'Edit Stok Master'}
                        >
                          <>
                            <div className="grid   gap-3 w-full px-5 py-2">
                              <>

                                <div className="flex w-full flex-col">
                                  <label className="text-black text-xs font-bold">
                                    Kode
                                  </label>
                                  <div className="flex w-full">
                                    <input
                                      name="kode"
                                      defaultValue={data.kode}
                                      onChange={(e) => { setKode(e.target.value) }}
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
                                      onChange={(e) => { setPartNumber(e.target.value) }}
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
                                      onChange={(e) => { setNamaSparePart(e.target.value) }}
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
                                      onChange={(e) => { setLokasi(e.target.value) }}
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
                                    onChange={(e) => { setMesinEdit(e.target.value) }}
                                    className={`w-[387px] h-10 border-2 border-stroke rounded-md' 
                                            }`}
                                  >
                                    <option value="" className="text-body dark:text-bodydark">
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
                                    onClick={() => editStock(data.id)}
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
