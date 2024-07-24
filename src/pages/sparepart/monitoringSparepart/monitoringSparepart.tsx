import React, { useEffect, useState } from 'react';
import DefaultLayout from '../../../layout/DefaultLayout';
import { Link } from 'react-router-dom';
import axios from 'axios';

function MonitoringSparepart() {
  const [masterSparepart, setMasterSparepart] = useState<any>(null);

  useEffect(() => {
    getMasterSparepart();
  }, []);

  async function getMasterSparepart() {
    const url = `${import.meta.env.VITE_API_LINK}/master/sparepart`;
    try {
      const res = await axios.get(url, {
        params: {
          jenis_part: 'ganti',
        },
        withCredentials: true,
      });

      setMasterSparepart(res.data);
      console.log(res.data);
    } catch (error: any) {
      console.log(error.response);
    }
  }
  return (
    <DefaultLayout>
      <>
        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          Maintenance &gt; Sparepart &gt; Lifespan
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
                to={'addStockLifetime'}
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
        <div className="overflow-x-scroll ">
          <div className="flex bg-white py-2 mt-2 mb-2 px-1 min-w-[1000px]">
            <p className="text-[10px] font-semibold w-[2%] text-center">No</p>
            <div className="flex justify-between w-[98%] text-center gap-1">
              <p className="text-[10px] font-semibold w-[8%]">Kode</p>
              <p className="text-[10px] font-semibold w-[13%] col-span-2">
                Nama Barang{' '}
              </p>
              <p className="text-[10px] font-semibold w-[7%] ">Mesin</p>
              <p className="text-[10px] font-semibold w-[7%]">Posisi</p>
              <p className="text-[10px] font-semibold w-[8%]">Tgl Pasang</p>
              <p className="text-[10px] font-semibold w-[8%]">Tgl Rusak</p>
              <p className="text-[10px] font-semibold w-[7%]">Umur A</p>
              <p className="text-[10px] font-semibold w-[7%]">Umur Grade</p>
              <p className="text-[10px] font-semibold w-[6%]">Grade </p>
              <p className="text-[10px] font-semibold w-[7%]">Umur Aktual</p>
              <p className="text-[10px] font-semibold w-[7%]">Sisa Umur</p>
              <p className="text-[10px] font-semibold w-[7%]">Ket. </p>
            </div>
          </div>
          {masterSparepart?.map((data: any, index: number) => {
            function convertDatetimeToDate(datetime: any) {
              const dateObject = new Date(datetime);
              const day = dateObject.getDate().toString().padStart(2, '0'); // Ensure two-digit day
              const month = (dateObject.getMonth() + 1)
                .toString()
                .padStart(2, '0'); // Adjust for zero-based month
              const year = dateObject.getFullYear();
              const hours = dateObject.getHours().toString().padStart(2, '0');
              const minutes = dateObject
                .getMinutes()
                .toString()
                .padStart(2, '0');

              return `${year}/${month}/${day}`; // Example format (YYYY-MM-DD)
            }

            const tglPasang = convertDatetimeToDate(data.tgl_pasang);
            const tglRusak = convertDatetimeToDate(data.tgl_rusak);
            return (
              <div className="flex bg-white py-2 mb-1 px-1  min-w-[1000px]">
                <p className="text-[10px]  w-[2%] text-center">{index + 1}</p>
                <div className="flex justify-between w-[98%] text-center gap-1">
                  <p className="text-[10px]  w-[8%]">{data.kode}</p>
                  <p className="text-[10px]  w-[13%] col-span-2">
                    {data.nama_sparepart}
                  </p>
                  <p className="text-[10px]  w-[7%] ">
                    {data.mesin.nama_mesin}
                  </p>
                  <p className="text-[10px]  w-[7%]">{data.posisi_part}</p>
                  <p className="text-[10px]  w-[8%]">{tglPasang}</p>
                  <p className="text-[10px]  w-[8%]">{tglRusak}</p>
                  <p className="text-[10px]  w-[7%]">{data.umur_a}</p>
                  <p className="text-[10px]  w-[7%]">{data.umur_grade}%</p>
                  <p className="text-[10px]  w-[6%]">{data.grade_2} </p>
                  <p className="text-[10px]  w-[7%]">{data.actual_umur}</p>
                  <p className="text-[10px]  w-[7%]">{data.sisa_umur}</p>
                  <p className="text-[10px]  w-[7%]">{data.keterangan}</p>
                </div>
              </div>
            );
          })}
        </div>
      </>
    </DefaultLayout>
  );
}

export default MonitoringSparepart;
