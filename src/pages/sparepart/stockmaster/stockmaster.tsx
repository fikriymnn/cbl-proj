import React, { useEffect, useState } from 'react';
import DefaultLayout from '../../../layout/DefaultLayout';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Stockmaster() {
  const [stokSparepart, setStokSparepart] = useState<any>(null);

  useEffect(() => {
    getStokSparepart();
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

  return (
    <DefaultLayout>
      <>
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
              <button className="px-3 py-2 bg-red-600 text-white font-semibold text-xs rounded-md">
                EXPORT DATA
              </button>
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
            <p className="text-xs font-semibold">Document</p>
          </div>
        </div>

        {stokSparepart?.map((data: any, index: number) => {
          return (
            <>
              <div className="flex bg-white py-2 px-1 text-center">
                <p className="text-xs w-[2%]">{index + 1}</p>
                <div className="grid grid-cols-12 w-[98%] text-center">
                  <p className="text-xs">{data.kode}</p>
                  <p className="text-xs">{data.part_number}</p>
                  <p className="text-xs col-span-2">{data.nama_sparepart} </p>
                  <p className="text-xs">{data.mesin.nama_mesin}</p>
                  <p className="text-xs">{data.lokasi}</p>
                  <p className="text-xs">{data.umur_sparepart}</p>
                  <p className="text-xs">{data.grade}</p>
                  <p className="text-xs">{data.stok}</p>
                  <p className="text-xs">{data.type_part}</p>
                  <p className="text-xs">{data.limit_stok}</p>
                  <p className="text-xs">-</p>
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
